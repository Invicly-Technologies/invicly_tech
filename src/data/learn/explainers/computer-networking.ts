import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Network models & foundations ─────────────
  "net-foundations/network-basics": {
    summary:
      "A network is a set of devices, called hosts, connected by links so they can exchange data. Switches connect hosts inside a local area network, and routers connect networks to each other, forming wide area networks and ultimately the internet. Bandwidth, latency and throughput describe how well a network performs.",
    analogy: "Switches are the streets inside a town; routers are the motorway junctions between towns.",
    visuals: [
      {
        type: "layers",
        title: "From your laptop to the internet",
        layers: [
          { label: "Internet", detail: "Thousands of networks run by ISPs and companies." },
          { label: "WAN link", detail: "ISP connection from your site to the wider world." },
          { label: "Router", detail: "Moves packets between networks." },
          { label: "Switch / access point", detail: "Connects local hosts in the LAN." },
          { label: "Hosts", detail: "Laptops, phones, servers, printers." },
        ],
      },
    ],
    keyPoints: [
      "A LAN covers one site; a WAN connects sites over long distances.",
      "Star topology, with every host on a central switch, dominates modern LANs.",
      "Bandwidth is capacity; throughput is what you actually achieve.",
      "Latency is delay; it matters more than bandwidth for interactive apps.",
    ],
    terms: [
      { term: "Host", meaning: "Any device that sends or receives data." },
      { term: "LAN", meaning: "Local area network within one building or site." },
      { term: "WAN", meaning: "Wide area network spanning large distances." },
      { term: "Latency", meaning: "Time for data to travel from source to destination." },
      { term: "Throughput", meaning: "Actual data rate achieved." },
    ],
    example: {
      lang: "bash",
      code: "ip addr show          # your host's interfaces and addresses\nip route show         # default gateway = your router\nping -c 4 1.1.1.1     # latency to a server on the internet",
    },
    check: [
      { q: "Which device connects different networks together?", a: "A router." },
      { q: "What is the difference between bandwidth and throughput?", a: "Bandwidth is the link's maximum capacity; throughput is the rate actually achieved." },
    ],
  },

  "net-foundations/osi-model": {
    summary:
      "The OSI model splits networking into seven layers, each with one responsibility and a clear interface to the layers above and below. Real networks run TCP/IP rather than OSI protocols, but the OSI layer numbers are the shared vocabulary engineers use. They also give you a systematic order for troubleshooting.",
    visuals: [
      {
        type: "layers",
        title: "The seven OSI layers",
        layers: [
          { label: "7 Application", detail: "HTTP, DNS, SMTP" },
          { label: "6 Presentation", detail: "Encoding, compression, encryption" },
          { label: "5 Session", detail: "Dialogue setup and teardown" },
          { label: "4 Transport", detail: "TCP, UDP; ports" },
          { label: "3 Network", detail: "IP, routing; routers" },
          { label: "2 Data link", detail: "Ethernet, MAC; switches" },
          { label: "1 Physical", detail: "Cables, radio, bits on the wire" },
        ],
      },
    ],
    keyPoints: [
      "Each layer serves the one above and uses the one below.",
      "Switches work at layer 2, routers at layer 3, load balancers at 4 or 7.",
      "Layers 5 and 6 are folded into the application layer in TCP/IP.",
      "Troubleshoot from layer 1 upwards when nothing works at all.",
    ],
    terms: [
      { term: "Layer", meaning: "A level of abstraction with a defined job." },
      { term: "Protocol", meaning: "Rules for how two peers at the same layer communicate." },
      { term: "PDU", meaning: "Protocol data unit: the chunk of data at a given layer." },
      { term: "Layer 7", meaning: "Common shorthand for application-level handling." },
    ],
    pitfalls: [
      "Trying to place every protocol neatly; TLS and ARP sit between layers.",
      "Treating OSI as the protocols the internet actually runs.",
    ],
    check: [
      { q: "At which layer does a switch forward traffic?", a: "Layer 2, the data link layer, using MAC addresses." },
      { q: "Which layer handles ports and reliable delivery?", a: "Layer 4, the transport layer." },
    ],
  },

  "net-foundations/tcpip-encapsulation": {
    summary:
      "The TCP/IP model has four layers: application, transport, internet and link. As data moves down the stack each layer adds its own header, wrapping the data like nested envelopes, and the receiver unwraps them in reverse. This encapsulation is what you see layer by layer in a Wireshark capture.",
    analogy: "A letter goes in an envelope, the envelope in a mailbag, the mailbag in a truck; each handler only reads its own label.",
    visuals: [
      {
        type: "layers",
        title: "Encapsulation of an HTTP request",
        layers: [
          { label: "Application data", detail: "GET /index.html" },
          { label: "TCP segment", detail: "+ TCP header: ports, sequence numbers" },
          { label: "IP packet", detail: "+ IP header: source and destination IP" },
          { label: "Ethernet frame", detail: "+ MAC header and FCS trailer" },
          { label: "Bits", detail: "Signals on copper, fibre or radio" },
        ],
      },
    ],
    keyPoints: [
      "PDUs: data, segment (TCP) or datagram (UDP), packet, frame, bits.",
      "Routers rewrite the frame at every hop but keep the IP packet's addresses (except with NAT).",
      "Ethernet MTU is usually 1500 bytes of payload per frame.",
      "Headers are overhead: about 40 bytes of TCP and IPv4 headers per packet.",
    ],
    terms: [
      { term: "Encapsulation", meaning: "Wrapping data with a header at each layer." },
      { term: "Decapsulation", meaning: "Removing headers on the receiving side." },
      { term: "MTU", meaning: "Maximum transmission unit: largest payload a link carries." },
      { term: "Segment / packet / frame", meaning: "PDUs at transport, internet and link layers." },
    ],
    example: {
      lang: "bash",
      code: "# Show each layer's headers for one HTTP request\nsudo tcpdump -i any -nn -e -c 5 'tcp port 80'\ncurl -s http://example.com > /dev/null\n# -e prints the Ethernet (MAC) header too",
    },
    check: [
      { q: "What does the internet layer add to a segment?", a: "An IP header with source and destination IP addresses, making it a packet." },
      { q: "Which header changes at each router hop?", a: "The link-layer frame header; the router builds a new frame for the next link." },
    ],
  },

  // ───────────── Physical & data link layers ─────────────
  "net-link/physical-media": {
    summary:
      "The physical layer moves raw bits as electrical signals, light or radio waves. Copper twisted pair is cheap and common up to 100 metres, while fibre carries data much further with no electrical interference. Duplex settings and cable category limit the speed a link can reach.",
    visuals: [
      {
        type: "compare",
        title: "Common wired media",
        columns: [
          { title: "Twisted pair (Cat 5e/6/6A)", points: ["Up to 100 m per run", "1 Gbps on Cat 5e, 10 Gbps on Cat 6A", "Cheap, RJ45 connectors", "Can carry PoE power"] },
          { title: "Multimode fibre", points: ["Hundreds of metres", "Within buildings and data centres", "Cheaper optics", "Immune to EMI"] },
          { title: "Single-mode fibre", points: ["Tens of kilometres", "Campus and long haul", "Narrow core, laser optics", "Highest capacity"] },
        ],
      },
    ],
    keyPoints: [
      "Full duplex sends and receives at once; half duplex shares the medium.",
      "Duplex mismatches cause slow links with many errors.",
      "Speed and duplex are negotiated automatically by autonegotiation.",
      "Rising CRC error counters point to bad cables or connectors.",
    ],
    terms: [
      { term: "Twisted pair", meaning: "Copper wire pairs twisted to reduce interference." },
      { term: "Fibre optic", meaning: "Glass strands carrying light pulses." },
      { term: "Duplex", meaning: "Whether a link can send and receive simultaneously." },
      { term: "PoE", meaning: "Power over Ethernet for phones, cameras and APs." },
    ],
    example: {
      lang: "bash",
      code: "ethtool eth0 | grep -E 'Speed|Duplex|Link detected'\nip -s link show eth0     # RX/TX errors and drops",
    },
    check: [
      { q: "What is the maximum run length for twisted-pair Ethernet?", a: "100 metres." },
      { q: "What symptom suggests a duplex mismatch?", a: "Slow throughput with many collisions or CRC errors on one side." },
    ],
  },

  "net-link/ethernet-mac": {
    summary:
      "Ethernet is the dominant layer 2 technology for wired LANs. Each frame carries destination and source MAC addresses, a type field saying what is inside, the payload and a checksum. A MAC address is a 48-bit identifier whose first half identifies the manufacturer.",
    visuals: [
      {
        type: "flow",
        title: "Ethernet II frame, in order",
        steps: [
          { label: "Destination MAC", detail: "6 bytes" },
          { label: "Source MAC", detail: "6 bytes" },
          { label: "EtherType", detail: "2 bytes: 0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP" },
          { label: "Payload", detail: "46 to 1500 bytes" },
          { label: "FCS", detail: "4-byte CRC checksum" },
        ],
      },
    ],
    keyPoints: [
      "ff:ff:ff:ff:ff:ff is the broadcast address, received by every host on the LAN.",
      "The first 3 bytes are the OUI identifying the vendor.",
      "Frames with a bad FCS are silently dropped.",
      "MAC addresses only matter on the local link; they do not cross routers.",
    ],
    terms: [
      { term: "MAC address", meaning: "48-bit hardware address of a network interface." },
      { term: "OUI", meaning: "Organisationally unique identifier: the vendor prefix." },
      { term: "EtherType", meaning: "Field naming the payload protocol." },
      { term: "FCS", meaning: "Frame check sequence used to detect corruption." },
    ],
    example: {
      lang: "bash",
      code: "ip link show eth0           # link/ether shows your MAC\nsudo tcpdump -i eth0 -e -nn -c 3   # print MAC headers of frames",
    },
    check: [
      { q: "What is the Ethernet broadcast MAC address?", a: "ff:ff:ff:ff:ff:ff." },
      { q: "What does EtherType 0x0806 indicate?", a: "The frame carries ARP." },
    ],
  },

  "net-link/switching": {
    summary:
      "A switch forwards frames by MAC address. It learns which port each source MAC lives on, stores that in its MAC address table and sends later frames only out of the right port. Frames to unknown or broadcast destinations are flooded to every other port in the VLAN.",
    visuals: [
      {
        type: "flow",
        title: "What a switch does with each frame",
        steps: [
          { label: "Frame arrives", detail: "On port 3 from MAC A." },
          { label: "Learn", detail: "Record MAC A on port 3." },
          { label: "Look up destination", detail: "Search the MAC table for MAC B." },
          { label: "Forward or flood", detail: "Known: one port. Unknown or broadcast: all others." },
        ],
      },
    ],
    keyPoints: [
      "Each switch port is its own collision domain.",
      "All ports in one VLAN share a broadcast domain.",
      "MAC table entries age out, typically after 300 seconds.",
      "Hubs repeat everything to every port; switches replaced them.",
    ],
    terms: [
      { term: "MAC address table", meaning: "Map of MAC addresses to switch ports, also called CAM table." },
      { term: "Flooding", meaning: "Sending a frame out of all ports except the one it came in on." },
      { term: "Collision domain", meaning: "Segment where simultaneous transmissions collide." },
      { term: "Broadcast domain", meaning: "Set of hosts that receive each other's broadcasts." },
    ],
    example: {
      lang: "text",
      code: "Switch# show mac address-table\n          Mac Address Table\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n  10    0050.7966.6800    DYNAMIC     Fa0/1\n  10    0050.7966.6801    DYNAMIC     Fa0/2",
      caption: "Cisco IOS output in Packet Tracer.",
    },
    pitfalls: [
      "Assuming a switch separates broadcast domains; only VLANs or routers do.",
      "Forgetting that a full MAC table makes a switch flood like a hub.",
    ],
    check: [
      { q: "What does a switch learn from each incoming frame?", a: "The source MAC address and the port it arrived on." },
      { q: "What happens to a frame for an unknown MAC?", a: "It is flooded out of every other port in the same VLAN." },
    ],
  },

  "net-link/vlans": {
    summary:
      "VLANs split one physical switch into several logical networks, each its own broadcast domain. Access ports belong to a single VLAN, while trunk ports carry many VLANs between switches by adding an 802.1Q tag to each frame. Traffic between VLANs must go through a router or layer 3 switch.",
    visuals: [
      {
        type: "tree",
        title: "One switch, three VLANs",
        root: "Access switch",
        children: [
          { label: "VLAN 10 Staff", children: ["Ports 1-12", "10.0.10.0/24"] },
          { label: "VLAN 20 Guests", children: ["Ports 13-20", "10.0.20.0/24"] },
          { label: "VLAN 30 Voice", children: ["Ports 21-24", "10.0.30.0/24"] },
          { label: "Trunk port 24", children: ["Tagged 10, 20, 30", "To router or core"] },
        ],
      },
    ],
    keyPoints: [
      "One VLAN usually maps to one IP subnet.",
      "802.1Q inserts a 4-byte tag holding a 12-bit VLAN ID (1 to 4094).",
      "The native VLAN is sent untagged on a trunk; keep it consistent on both ends.",
      "Router-on-a-stick routes between VLANs using subinterfaces on one trunk.",
    ],
    terms: [
      { term: "VLAN", meaning: "Virtual LAN: a logical broadcast domain." },
      { term: "Access port", meaning: "Switch port in exactly one VLAN, untagged." },
      { term: "Trunk port", meaning: "Port carrying multiple VLANs with tags." },
      { term: "802.1Q", meaning: "IEEE standard for VLAN tagging." },
      { term: "Native VLAN", meaning: "VLAN whose frames cross a trunk untagged." },
    ],
    example: {
      lang: "text",
      code: "vlan 10\n name STAFF\ninterface fa0/1\n switchport mode access\n switchport access vlan 10\ninterface gi0/1\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30",
      caption: "Cisco IOS switch configuration.",
    },
    pitfalls: [
      "Native VLAN mismatch between trunk ends, leaking traffic between VLANs.",
      "Forgetting to allow a new VLAN on the trunk.",
    ],
    check: [
      { q: "Can hosts in different VLANs talk without a router?", a: "No, inter-VLAN traffic needs layer 3 routing." },
      { q: "What does a trunk port add to frames?", a: "An 802.1Q tag identifying the VLAN." },
    ],
  },

  "net-link/arp": {
    summary:
      "ARP finds the MAC address that belongs to an IPv4 address on the local network. A host broadcasts who-has for the IP and the owner replies directly with its MAC, which the asker caches. To reach a remote network a host ARPs for its default gateway, not for the final destination.",
    visuals: [
      {
        type: "sequence",
        title: "ARP resolution for the gateway",
        actors: ["Host 10.0.0.5", "Switch", "Router 10.0.0.1"],
        messages: [
          { from: 0, to: 1, label: "Broadcast: who has 10.0.0.1? tell 10.0.0.5" },
          { from: 1, to: 2, label: "Flooded to all ports" },
          { from: 2, to: 1, label: "Unicast reply: 10.0.0.1 is at aa:bb:cc:dd:ee:01" },
          { from: 1, to: 0, label: "Forwarded; host caches the mapping" },
        ],
      },
    ],
    keyPoints: [
      "Requests are broadcast; replies are unicast.",
      "Entries stay in the ARP cache for minutes and are refreshed.",
      "Gratuitous ARP announces your own IP, used after failover.",
      "IPv6 replaces ARP with Neighbour Discovery using ICMPv6 multicast.",
    ],
    terms: [
      { term: "ARP", meaning: "Address Resolution Protocol, IPv4 to MAC." },
      { term: "ARP cache", meaning: "Table of recently resolved IP to MAC mappings." },
      { term: "Gratuitous ARP", meaning: "Unsolicited ARP announcing an address." },
      { term: "Neighbour Discovery", meaning: "IPv6 equivalent of ARP using ICMPv6." },
    ],
    example: {
      lang: "bash",
      code: "ip neigh show                      # ARP / neighbour cache\nsudo ip neigh flush dev eth0       # clear it\nsudo tcpdump -i eth0 -nn arp       # watch requests and replies\nping -c 1 10.0.0.1",
    },
    pitfalls: [
      "Expecting to see the remote server's MAC; you only ever see the gateway's.",
      "Ignoring ARP spoofing on untrusted LANs.",
    ],
    check: [
      { q: "Whose MAC does a host resolve to reach 8.8.8.8?", a: "Its default gateway's MAC." },
      { q: "Why is the ARP request broadcast?", a: "The sender does not yet know the owner's MAC, so every host must see it." },
    ],
  },

  "net-link/stp": {
    summary:
      "Redundant links between switches protect against failures, but Ethernet frames have no TTL, so a loop lets broadcasts circle forever and melt the network. Spanning Tree Protocol elects a root bridge and blocks just enough ports to leave a loop-free tree. If an active link fails, a blocked port takes over.",
    visuals: [
      {
        type: "flow",
        title: "How STP builds a loop-free tree",
        steps: [
          { label: "Exchange BPDUs", detail: "Switches advertise their bridge IDs." },
          { label: "Elect root bridge", detail: "Lowest priority plus MAC wins." },
          { label: "Pick root ports", detail: "Each switch's best path to the root." },
          { label: "Pick designated ports", detail: "One forwarding port per segment." },
          { label: "Block the rest", detail: "Remaining ports discard to break loops." },
        ],
      },
    ],
    keyPoints: [
      "Without STP, a loop causes a broadcast storm within seconds.",
      "Set the root bridge deliberately with a low priority on a core switch.",
      "Classic STP converges in 30 to 50 seconds; RSTP in about a second.",
      "Edge ports (PortFast) skip listening states for end hosts.",
    ],
    terms: [
      { term: "BPDU", meaning: "Bridge protocol data unit exchanged by STP." },
      { term: "Root bridge", meaning: "Reference switch at the top of the spanning tree." },
      { term: "Blocked port", meaning: "Port that discards frames to prevent loops." },
      { term: "RSTP", meaning: "Rapid Spanning Tree, 802.1w." },
    ],
    pitfalls: [
      "Leaving root election to chance, so an old edge switch becomes root.",
      "Enabling PortFast on ports connected to other switches.",
    ],
    check: [
      { q: "Why are layer 2 loops so damaging?", a: "Ethernet frames have no TTL, so broadcasts loop and multiply until links saturate." },
      { q: "How is the root bridge chosen?", a: "The lowest bridge ID, made of priority and MAC address." },
    ],
  },

  // ───────────── IP addressing & subnetting ─────────────
  "net-ip/ipv4-addressing": {
    summary:
      "An IPv4 address is 32 bits written as four decimal octets, such as 192.168.1.10. A prefix length splits it into a network part, shared by every host on the subnet, and a host part. Some ranges are reserved: private addresses for internal networks, loopback, and link-local.",
    visuals: [
      {
        type: "tree",
        title: "Special IPv4 ranges",
        root: "IPv4 address space",
        children: [
          { label: "Private (RFC 1918)", children: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"] },
          { label: "Loopback", children: ["127.0.0.0/8"] },
          { label: "Link-local", children: ["169.254.0.0/16", "Seen when DHCP fails"] },
          { label: "Carrier-grade NAT", children: ["100.64.0.0/10"] },
          { label: "Multicast", children: ["224.0.0.0/4"] },
        ],
      },
    ],
    keyPoints: [
      "192.168.1.10 in binary is 11000000.10101000.00000001.00001010.",
      "There are about 4.3 billion IPv4 addresses, which is why NAT exists.",
      "Private addresses are not routed on the public internet.",
      "Key header fields: TTL, protocol, source and destination address.",
    ],
    terms: [
      { term: "Octet", meaning: "8 bits, one of the four numbers in an address." },
      { term: "Prefix length", meaning: "Number of network bits, written /24." },
      { term: "Private address", meaning: "Reserved for internal use, reused everywhere." },
      { term: "TTL", meaning: "Hop counter that stops packets looping forever." },
    ],
    example: {
      lang: "python",
      code: "import ipaddress\n\nip = ipaddress.ip_address('192.168.1.10')\nprint(ip.is_private, format(int(ip), '032b'))\nprint(ipaddress.ip_address('8.8.8.8').is_global)   # True",
    },
    check: [
      { q: "Is 172.20.5.4 a private address?", a: "Yes, it is inside 172.16.0.0/12." },
      { q: "What does a 169.254.x.x address on a host usually mean?", a: "It failed to get an address from DHCP and self-assigned a link-local one." },
    ],
  },

  "net-ip/subnetting-cidr": {
    summary:
      "Subnetting divides a network into smaller networks by borrowing host bits for the network part. CIDR notation such as 10.0.0.0/26 states how many bits are network bits. From the prefix you can work out the mask, network and broadcast addresses, usable host range and host count.",
    visuals: [
      {
        type: "flow",
        title: "Solving 192.168.10.77/26",
        steps: [
          { label: "Block size", detail: "/26 leaves 6 host bits: 2^6 = 64." },
          { label: "Mask", detail: "255.255.255.192" },
          { label: "Network", detail: "77 falls in 64-127: 192.168.10.64" },
          { label: "Broadcast", detail: "192.168.10.127" },
          { label: "Usable hosts", detail: ".65 to .126, 62 hosts" },
        ],
      },
    ],
    keyPoints: [
      "Usable hosts = 2^(32 - prefix) - 2 for prefixes up to /30.",
      "Block size in the interesting octet = 256 - mask value.",
      "Each extra prefix bit halves the subnet and doubles the subnet count.",
      "A /24 split into four gives four /26 networks of 64 addresses each.",
    ],
    terms: [
      { term: "CIDR", meaning: "Classless Inter-Domain Routing; prefix-length notation." },
      { term: "Subnet mask", meaning: "Dotted form of the prefix, such as 255.255.255.0." },
      { term: "Network address", meaning: "First address; identifies the subnet." },
      { term: "Broadcast address", meaning: "Last address; reaches all hosts in the subnet." },
    ],
    example: {
      lang: "python",
      code: "import ipaddress\n\nnet = ipaddress.ip_interface('192.168.10.77/26').network\nprint(net, net.netmask, net.broadcast_address, net.num_addresses - 2)\n# 192.168.10.64/26 255.255.255.192 192.168.10.127 62\nfor sub in ipaddress.ip_network('10.0.0.0/24').subnets(new_prefix=26):\n    print(sub)",
      caption: "Use code to check answers, but practise by hand until it is fast.",
    },
    pitfalls: [
      "Forgetting to subtract the network and broadcast addresses.",
      "Assigning the network address to a host.",
    ],
    check: [
      { q: "How many usable hosts are in a /27?", a: "30 (32 addresses minus 2)." },
      { q: "What is the network address of 10.1.1.200/25?", a: "10.1.1.128." },
    ],
  },

  "net-ip/vlsm": {
    summary:
      "Variable-length subnet masking lets each subnet be just big enough for its hosts instead of making every subnet the same size. You allocate the largest subnets first, aligned on their block size, then fill the gaps with smaller ones. Contiguous allocations can later be summarised into a single route.",
    visuals: [
      {
        type: "tree",
        title: "Splitting 192.168.1.0/24 with VLSM",
        root: "192.168.1.0/24",
        children: [
          { label: "Staff: 100 hosts", children: ["192.168.1.0/25"] },
          { label: "Guests: 50 hosts", children: ["192.168.1.128/26"] },
          { label: "Servers: 20 hosts", children: ["192.168.1.192/27"] },
          { label: "Printers: 10 hosts", children: ["192.168.1.224/28"] },
          { label: "Router links", children: ["192.168.1.240/30", "192.168.1.244/30"] },
        ],
      },
    ],
    keyPoints: [
      "Sort requirements largest first to avoid fragmentation.",
      "Each subnet must start on a multiple of its block size.",
      "Point-to-point links use /30 (2 hosts) or /31 (RFC 3021).",
      "Leave room for growth; renumbering later is painful.",
    ],
    terms: [
      { term: "VLSM", meaning: "Using different prefix lengths within one network." },
      { term: "Block size", meaning: "Number of addresses in a subnet." },
      { term: "Route summarisation", meaning: "Advertising one prefix that covers many subnets." },
    ],
    example: {
      lang: "python",
      code: "import ipaddress\n\nfree = ipaddress.ip_network('192.168.1.0/24')\nneeds = {'staff': 100, 'guests': 50, 'servers': 20}\nstart = free.network_address\nfor name, hosts in sorted(needs.items(), key=lambda kv: -kv[1]):\n    prefix = 32 - (hosts + 2 - 1).bit_length()\n    net = ipaddress.ip_network(f'{start}/{prefix}')\n    print(name, net)\n    start = net.broadcast_address + 1",
    },
    pitfalls: [
      "Placing a small subnet first so larger ones cannot align.",
      "Overlapping subnets, which breaks routing silently.",
    ],
    check: [
      { q: "What prefix fits 50 hosts most tightly?", a: "/26, which gives 62 usable addresses." },
      { q: "Why allocate the largest subnets first?", a: "Large blocks need aligned boundaries; placing them first avoids leaving unusable gaps." },
    ],
  },

  "net-ip/ipv6": {
    summary:
      "IPv6 uses 128-bit addresses written as eight groups of hexadecimal, which removes address scarcity and the need for NAT. Sites typically receive a /48 or /56 and every LAN is a /64. Hosts can configure themselves with SLAAC using router advertisements, or get addresses from DHCPv6.",
    visuals: [
      {
        type: "compare",
        title: "IPv4 versus IPv6",
        columns: [
          { title: "IPv4", points: ["32-bit, dotted decimal", "About 4.3 billion addresses", "NAT is common", "ARP for neighbours", "Header checksum"] },
          { title: "IPv6", points: ["128-bit, hexadecimal groups", "/64 per LAN", "End-to-end addressing", "Neighbour Discovery via ICMPv6", "No header checksum, simpler header"] },
        ],
      },
    ],
    keyPoints: [
      "Shorten by dropping leading zeros and replacing one run of zero groups with ::.",
      "fe80::/10 is link-local, present on every IPv6 interface.",
      "2000::/3 is global unicast; fc00::/7 is unique local.",
      "Routers do not fragment IPv6; senders use path MTU discovery.",
    ],
    terms: [
      { term: "Link-local", meaning: "fe80:: address valid only on one link." },
      { term: "Global unicast", meaning: "Publicly routable IPv6 address." },
      { term: "SLAAC", meaning: "Stateless address autoconfiguration from router advertisements." },
      { term: "ULA", meaning: "Unique local address, roughly IPv6's private range." },
      { term: "Prefix delegation", meaning: "ISP assigns a prefix such as /56 to a site." },
    ],
    example: {
      lang: "bash",
      code: "ip -6 addr show                 # link-local fe80:: and global addresses\nip -6 route show\nping -6 -c 2 2606:4700:4700::1111\npython3 -c \"import ipaddress; print(ipaddress.ip_address('2001:0db8:0000:0000:0000:0000:0000:0001'))\"\n# 2001:db8::1",
    },
    pitfalls: [
      "Using :: twice in one address, which is ambiguous.",
      "Subnetting LANs smaller than /64, which breaks SLAAC.",
    ],
    check: [
      { q: "Shorten 2001:0db8:0000:0000:0000:ff00:0042:8329.", a: "2001:db8::ff00:42:8329." },
      { q: "What prefix length is standard for an IPv6 LAN?", a: "/64." },
    ],
  },

  "net-ip/icmp": {
    summary:
      "ICMP carries control and error messages for IP. Echo request and reply power ping, time exceeded messages power traceroute, and destination unreachable messages tell senders why delivery failed. ICMPv6 is even more central, carrying neighbour discovery and router advertisements.",
    visuals: [
      {
        type: "sequence",
        title: "TTL expiry, as used by traceroute",
        actors: ["Host", "Router 1", "Router 2"],
        messages: [
          { from: 0, to: 1, label: "Packet with TTL 1" },
          { from: 1, to: 0, label: "ICMP time exceeded (reveals Router 1)" },
          { from: 0, to: 1, label: "Packet with TTL 2" },
          { from: 1, to: 2, label: "Forwarded, TTL now 1" },
          { from: 2, to: 0, label: "ICMP time exceeded (reveals Router 2)" },
        ],
      },
    ],
    keyPoints: [
      "Type 8 is echo request, type 0 echo reply, type 11 time exceeded.",
      "Type 3 code 4 (fragmentation needed) drives IPv4 path MTU discovery.",
      "Blocking all ICMP breaks path MTU discovery and causes stuck connections.",
      "ICMPv6 must be allowed for IPv6 to work at all.",
    ],
    terms: [
      { term: "Echo request / reply", meaning: "Messages used by ping." },
      { term: "Time exceeded", meaning: "Sent when a router drops a packet whose TTL hit zero." },
      { term: "Destination unreachable", meaning: "Reports no route, closed port or prohibited traffic." },
      { term: "PMTUD", meaning: "Path MTU discovery to find the largest packet size." },
    ],
    example: {
      lang: "bash",
      code: "ping -c 3 example.com\nping -M do -s 1472 -c 1 example.com   # 1472 + 28 = 1500, don't fragment\nsudo tcpdump -i any -nn icmp",
    },
    check: [
      { q: "Which ICMP message does traceroute rely on?", a: "Time exceeded, sent when TTL reaches zero." },
      { q: "Why is blocking all ICMP harmful?", a: "It breaks path MTU discovery and hides useful error messages." },
    ],
  },

  // ───────────── Routing & NAT ─────────────
  "net-routing/routing-fundamentals": {
    summary:
      "A router forwards each packet by looking up its destination IP in a routing table of prefixes and next hops. When several routes match, the most specific one, with the longest prefix, wins. A default route, 0.0.0.0/0, catches everything else.",
    visuals: [
      {
        type: "flow",
        title: "Forwarding a packet to 10.1.2.3",
        steps: [
          { label: "Receive packet", detail: "Destination 10.1.2.3." },
          { label: "Match routes", detail: "0.0.0.0/0, 10.0.0.0/8, 10.1.2.0/24 all match." },
          { label: "Longest prefix", detail: "10.1.2.0/24 wins." },
          { label: "Decrement TTL", detail: "Drop and send ICMP if it hits 0." },
          { label: "Forward", detail: "New frame out the chosen interface." },
        ],
      },
    ],
    keyPoints: [
      "Longest-prefix match always beats a shorter matching prefix.",
      "Hosts have routing tables too, usually a local subnet and a default gateway.",
      "Routes come from connected interfaces, static config or routing protocols.",
      "Return traffic needs a route back too; routing is per direction.",
    ],
    terms: [
      { term: "Routing table", meaning: "List of prefixes with next hops and interfaces." },
      { term: "Next hop", meaning: "The neighbouring router to send the packet to." },
      { term: "Default route", meaning: "0.0.0.0/0, used when nothing more specific matches." },
      { term: "Administrative distance", meaning: "Trust ranking between route sources." },
    ],
    example: {
      lang: "bash",
      code: "ip route show\n# default via 192.168.1.1 dev wlan0\n# 192.168.1.0/24 dev wlan0 proto kernel scope link\nip route get 8.8.8.8      # which route and source IP will be used",
    },
    check: [
      { q: "Routes 10.0.0.0/8 and 10.1.0.0/16 both exist. Which is used for 10.1.5.5?", a: "10.1.0.0/16, the longer prefix." },
      { q: "What is the default route used for?", a: "Any destination with no more specific matching route." },
    ],
  },

  "net-routing/static-routing": {
    summary:
      "Static routes are entered by hand and never change unless you change them. They are simple and predictable for small networks, stub sites and default routes towards an ISP. Their weakness is that they do not adapt when links fail.",
    visuals: [
      {
        type: "flow",
        title: "Two LANs joined by two routers",
        steps: [
          { label: "LAN A 10.1.0.0/24", detail: "Hosts use R1 as gateway." },
          { label: "R1", detail: "ip route 10.2.0.0/24 via 172.16.0.2" },
          { label: "Link 172.16.0.0/30", detail: "Point-to-point between routers." },
          { label: "R2", detail: "ip route 10.1.0.0/24 via 172.16.0.1" },
          { label: "LAN B 10.2.0.0/24", detail: "Hosts use R2 as gateway." },
        ],
      },
    ],
    keyPoints: [
      "Every router on the path needs a route in both directions.",
      "A floating static route has a higher distance and acts as a backup.",
      "Static routes scale poorly beyond a handful of routers.",
      "Linux static routes are added with ip route add.",
    ],
    terms: [
      { term: "Static route", meaning: "Manually configured route." },
      { term: "Stub network", meaning: "Network with a single exit path." },
      { term: "Floating static route", meaning: "Backup static route with a worse distance." },
    ],
    example: {
      lang: "text",
      code: "! Cisco IOS on R1\nip route 10.2.0.0 255.255.255.0 172.16.0.2\nip route 0.0.0.0 0.0.0.0 203.0.113.1\n\n# Linux equivalent\nsudo ip route add 10.2.0.0/24 via 172.16.0.2",
    },
    pitfalls: [
      "Configuring only the forward route, so replies never return.",
      "Pointing a static route at a next hop that is not directly reachable.",
    ],
    check: [
      { q: "Ping from LAN A reaches R2 but LAN B hosts never reply. Likely cause?", a: "R2 has no route back to LAN A." },
      { q: "When is a static route a good choice?", a: "Small or stub networks and default routes to an ISP." },
    ],
  },

  "net-routing/ospf": {
    summary:
      "Dynamic routing protocols let routers discover routes and react to failures automatically. OSPF is a link-state protocol: every router floods descriptions of its links so all routers share the same map, then each runs Dijkstra's shortest-path algorithm on it. Areas keep large networks manageable.",
    visuals: [
      {
        type: "cycle",
        title: "OSPF operation",
        steps: [
          { label: "Form neighbours", detail: "Hello packets on each link." },
          { label: "Flood LSAs", detail: "Share link-state advertisements." },
          { label: "Build LSDB", detail: "Identical map on every router in the area." },
          { label: "Run SPF", detail: "Dijkstra computes best paths." },
          { label: "Install routes", detail: "Re-run when a link changes." },
        ],
      },
    ],
    keyPoints: [
      "Cost is based on bandwidth; lower total cost wins.",
      "Area 0 is the backbone; other areas attach to it.",
      "Converges in seconds after a failure.",
      "Distance-vector protocols like RIP share routes, not the topology.",
    ],
    terms: [
      { term: "Link-state", meaning: "Routers share topology and compute paths themselves." },
      { term: "LSA", meaning: "Link-state advertisement describing a router's links." },
      { term: "LSDB", meaning: "Link-state database, the shared map." },
      { term: "Area", meaning: "Group of routers sharing one LSDB." },
      { term: "SPF", meaning: "Shortest path first, Dijkstra's algorithm." },
    ],
    example: {
      lang: "text",
      code: "router ospf 1\n router-id 1.1.1.1\n network 10.1.0.0 0.0.0.255 area 0\n network 172.16.0.0 0.0.0.3 area 0\n!\nshow ip ospf neighbor\nshow ip route ospf",
      caption: "Single-area OSPF on Cisco IOS; network uses wildcard masks.",
    },
    pitfalls: [
      "Mismatched hello timers or area IDs, so neighbours never form.",
      "Duplicate router IDs.",
    ],
    check: [
      { q: "Which algorithm does OSPF run on its database?", a: "Dijkstra's shortest path first." },
      { q: "What is special about area 0?", a: "It is the backbone that all other areas must connect to." },
    ],
  },

  "net-routing/bgp": {
    summary:
      "The internet is a network of autonomous systems, each run by one organisation with its own routing policy. BGP is the protocol they use to tell each other which prefixes they can reach, along with the AS path to get there. It chooses routes by policy rather than pure shortest path, and mistakes can take large parts of the internet offline.",
    visuals: [
      {
        type: "sequence",
        title: "A prefix propagating between ASes",
        actors: ["AS 64500 (origin)", "AS 64501 (ISP)", "AS 64502 (peer)"],
        messages: [
          { from: 0, to: 1, label: "UPDATE 198.51.100.0/24, path 64500" },
          { from: 1, to: 2, label: "UPDATE 198.51.100.0/24, path 64501 64500" },
          { from: 2, to: 1, label: "Traffic to 198.51.100.0/24 flows back along the path" },
        ],
      },
    ],
    keyPoints: [
      "eBGP runs between ASes; iBGP distributes routes inside one AS.",
      "Shorter AS paths are preferred, after local preference.",
      "BGP runs over TCP port 179.",
      "RPKI lets networks reject announcements from unauthorised origins.",
    ],
    terms: [
      { term: "Autonomous system", meaning: "Network under one routing policy, with an ASN." },
      { term: "AS path", meaning: "List of ASes a route has passed through." },
      { term: "Route leak", meaning: "Routes announced beyond their intended scope." },
      { term: "Prefix hijack", meaning: "Announcing someone else's address space." },
      { term: "RPKI", meaning: "Cryptographic validation of route origins." },
    ],
    example: {
      lang: "bash",
      code: "whois -h whois.radb.net 1.1.1.0/24 | grep -i origin   # origin AS\ntraceroute -A 1.1.1.1                                 # AS numbers per hop",
    },
    check: [
      { q: "Why is BGP called a path-vector protocol?", a: "Each route carries the full list of ASes it traversed, which also prevents loops." },
      { q: "What transport does BGP use?", a: "TCP on port 179." },
    ],
  },

  "net-routing/nat": {
    summary:
      "Network address translation rewrites IP addresses as packets cross a router, letting many private hosts share one public IPv4 address. Port address translation tracks each connection by source port so replies return to the right host. NAT conserves addresses but breaks end-to-end reachability.",
    visuals: [
      {
        type: "flow",
        title: "PAT on a home router",
        steps: [
          { label: "Host sends", detail: "10.0.0.5:51000 to 93.184.215.14:443" },
          { label: "Router rewrites", detail: "Source becomes 203.0.113.7:40001" },
          { label: "Table entry", detail: "40001 maps to 10.0.0.5:51000" },
          { label: "Reply arrives", detail: "To 203.0.113.7:40001" },
          { label: "Translate back", detail: "Delivered to 10.0.0.5:51000" },
        ],
      },
    ],
    keyPoints: [
      "PAT (NAT overload) is what almost every home and office uses.",
      "Inbound connections need port forwarding (static NAT for a port).",
      "NAT is not a firewall, though stateful tracking blocks unsolicited inbound traffic.",
      "Peer-to-peer apps use STUN and TURN to traverse NAT.",
    ],
    terms: [
      { term: "Static NAT", meaning: "Fixed one-to-one mapping of private to public IP." },
      { term: "PAT", meaning: "Many-to-one mapping distinguished by ports." },
      { term: "Port forwarding", meaning: "Map a public port to an internal host and port." },
      { term: "CGNAT", meaning: "Carrier-grade NAT inside the ISP network." },
    ],
    example: {
      lang: "bash",
      code: "# Linux router: masquerade LAN traffic out of eth0 (nftables)\nsudo nft add table ip nat\nsudo nft add chain ip nat post '{ type nat hook postrouting priority 100; }'\nsudo nft add rule ip nat post oifname eth0 masquerade\nsudo conntrack -L | head       # view translation entries",
    },
    pitfalls: [
      "Treating NAT as a security control instead of a firewall.",
      "Forgetting to enable IP forwarding on a Linux router.",
    ],
    check: [
      { q: "How does PAT know which inside host a reply is for?", a: "It looks up the destination port in its translation table." },
      { q: "Why does hosting a server behind NAT need port forwarding?", a: "Without a mapping, unsolicited inbound packets have no translation entry and are dropped." },
    ],
  },

  // ───────────── Transport layer ─────────────
  "net-transport/ports-sockets": {
    summary:
      "Ports let one host run many network services at once by giving each a 16-bit number. A socket is an endpoint made of an IP address and port, and a connection is identified by a 5-tuple: protocol, source IP and port, destination IP and port. Servers listen on well-known ports while clients use random ephemeral ones.",
    visuals: [
      {
        type: "tree",
        title: "Port ranges",
        root: "Ports 0-65535",
        children: [
          { label: "Well-known 0-1023", children: ["22 SSH", "53 DNS", "80 HTTP", "443 HTTPS"] },
          { label: "Registered 1024-49151", children: ["3306 MySQL", "5432 PostgreSQL"] },
          { label: "Ephemeral 49152-65535", children: ["Client source ports", "Linux default 32768-60999"] },
        ],
      },
    ],
    keyPoints: [
      "The 5-tuple uniquely identifies a connection.",
      "Many clients can connect to one server port because their source tuples differ.",
      "Binding to ports below 1024 needs elevated privileges on Unix.",
      "ss -tlnp shows which process listens on which port.",
    ],
    terms: [
      { term: "Port", meaning: "16-bit number identifying a service on a host." },
      { term: "Socket", meaning: "Endpoint of communication: IP plus port." },
      { term: "5-tuple", meaning: "Protocol, source IP, source port, destination IP, destination port." },
      { term: "Ephemeral port", meaning: "Temporary client-side port chosen by the OS." },
    ],
    example: {
      lang: "python",
      code: "import socket\n\nsrv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nsrv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\nsrv.bind(('127.0.0.1', 9000)); srv.listen()\ncli = socket.create_connection(('127.0.0.1', 9000))\nconn, addr = srv.accept()\nprint('client ephemeral port:', addr[1])\ncli.sendall(b'hi'); print(conn.recv(2))",
    },
    check: [
      { q: "What identifies a single TCP connection?", a: "The 5-tuple of protocol, source and destination IPs and ports." },
      { q: "Which port does HTTPS use by default?", a: "443." },
    ],
  },

  "net-transport/tcp-connections": {
    summary:
      "TCP provides a reliable, ordered byte stream over unreliable IP. Before sending data, the two sides perform a three-way handshake to agree on initial sequence numbers. Connections end with a FIN exchange in each direction, or abruptly with a RST.",
    visuals: [
      {
        type: "sequence",
        title: "TCP lifecycle",
        actors: ["Client", "Server"],
        messages: [
          { from: 0, to: 1, label: "SYN seq=x" },
          { from: 1, to: 0, label: "SYN-ACK seq=y ack=x+1" },
          { from: 0, to: 1, label: "ACK ack=y+1 (connection established)" },
          { from: 0, to: 1, label: "Data and ACKs flow both ways" },
          { from: 0, to: 1, label: "FIN" },
          { from: 1, to: 0, label: "ACK, then its own FIN" },
          { from: 0, to: 1, label: "Final ACK; client enters TIME_WAIT" },
        ],
      },
    ],
    keyPoints: [
      "The handshake costs one round trip before data can flow.",
      "Sequence numbers count bytes, not packets.",
      "RST means the port is closed or the connection was aborted.",
      "TIME_WAIT lasts about twice the maximum segment lifetime to absorb late packets.",
    ],
    terms: [
      { term: "SYN", meaning: "Synchronise flag that opens a connection." },
      { term: "ACK", meaning: "Acknowledges data received up to a sequence number." },
      { term: "FIN", meaning: "Graceful close of one direction." },
      { term: "RST", meaning: "Immediate reset of a connection." },
      { term: "TIME_WAIT", meaning: "State after closing that waits for stray packets." },
    ],
    example: {
      lang: "bash",
      code: "sudo tcpdump -i any -nn 'tcp port 443 and (tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0)'\ncurl -s https://example.com > /dev/null\nss -tan state time-wait | head",
    },
    pitfalls: [
      "Reading a RST as a network failure; often the port is simply closed.",
      "Assuming one send equals one received message; TCP is a byte stream.",
    ],
    check: [
      { q: "What are the three packets of the handshake?", a: "SYN, SYN-ACK, ACK." },
      { q: "What does a RST in response to a SYN usually mean?", a: "Nothing is listening on that port." },
    ],
  },

  "net-transport/tcp-reliability": {
    summary:
      "TCP makes delivery reliable by numbering bytes, acknowledging what arrives and retransmitting what does not. Flow control uses the receiver's advertised window so a fast sender cannot overrun a slow receiver. Together they deliver an ordered stream even when packets are lost or reordered.",
    visuals: [
      {
        type: "sequence",
        title: "Loss and fast retransmit",
        actors: ["Sender", "Receiver"],
        messages: [
          { from: 0, to: 1, label: "Segment 1" },
          { from: 0, to: 1, label: "Segment 2 (lost)" },
          { from: 0, to: 1, label: "Segment 3" },
          { from: 1, to: 0, label: "Duplicate ACK: still need 2" },
          { from: 1, to: 0, label: "Third duplicate ACK after segment 4" },
          { from: 0, to: 1, label: "Retransmit segment 2 without waiting for timeout" },
        ],
      },
    ],
    keyPoints: [
      "Cumulative ACKs say every byte up to N has arrived.",
      "Three duplicate ACKs trigger fast retransmit; otherwise the retransmission timer fires.",
      "The receive window caps bytes in flight; window scaling allows large windows.",
      "A zero window pauses the sender until the receiver frees buffer space.",
    ],
    terms: [
      { term: "RTO", meaning: "Retransmission timeout, based on measured round-trip time." },
      { term: "Duplicate ACK", meaning: "Repeated ACK signalling a gap in received data." },
      { term: "Receive window", meaning: "Buffer space the receiver advertises." },
      { term: "SACK", meaning: "Selective acknowledgement of out-of-order blocks." },
    ],
    example: {
      lang: "text",
      code: "Wireshark display filters:\ntcp.analysis.retransmission\ntcp.analysis.duplicate_ack\ntcp.analysis.zero_window\ntcp.window_size < 1000",
    },
    check: [
      { q: "What does flow control protect?", a: "The receiver, from being sent more data than it can buffer." },
      { q: "What triggers fast retransmit?", a: "Three duplicate ACKs for the same sequence number." },
    ],
  },

  "net-transport/tcp-congestion": {
    summary:
      "Congestion control protects the network itself by limiting how much a sender has in flight. TCP grows a congestion window quickly during slow start, then cautiously during congestion avoidance, and cuts it back when it detects loss. Modern variants such as CUBIC and BBR tune this for fast, long-distance links.",
    visuals: [
      {
        type: "cycle",
        title: "Congestion window over time",
        steps: [
          { label: "Slow start", detail: "cwnd doubles each RTT." },
          { label: "Threshold reached", detail: "Switch to linear growth." },
          { label: "Congestion avoidance", detail: "About +1 segment per RTT." },
          { label: "Loss detected", detail: "Halve cwnd (fast recovery) or reset on timeout." },
        ],
      },
    ],
    keyPoints: [
      "Bytes in flight are limited by the smaller of cwnd and the receive window.",
      "Additive increase, multiplicative decrease keeps flows fair.",
      "CUBIC is the default on Linux; BBR models bandwidth and RTT instead of reacting to loss.",
      "Throughput is roughly window size divided by round-trip time.",
    ],
    terms: [
      { term: "cwnd", meaning: "Congestion window kept by the sender." },
      { term: "ssthresh", meaning: "Slow-start threshold between exponential and linear growth." },
      { term: "AIMD", meaning: "Additive increase, multiplicative decrease." },
      { term: "Bandwidth-delay product", meaning: "Bandwidth times RTT: data needed in flight to fill a link." },
    ],
    example: {
      lang: "bash",
      code: "sysctl net.ipv4.tcp_congestion_control       # usually cubic\nsysctl net.ipv4.tcp_available_congestion_control\nss -ti dst example.com                        # per-connection cwnd, rtt",
    },
    check: [
      { q: "What is the difference between flow control and congestion control?", a: "Flow control protects the receiver; congestion control protects the network between them." },
      { q: "How does cwnd grow in slow start?", a: "Exponentially, roughly doubling each round trip." },
    ],
  },

  "net-transport/udp-quic": {
    summary:
      "UDP sends independent datagrams with just ports, a length and a checksum: no handshake, no retransmission, no ordering. That suits DNS queries, voice, video, games and protocols that build their own reliability. QUIC is such a protocol: it runs over UDP and provides encrypted, multiplexed, reliable streams for HTTP/3.",
    visuals: [
      {
        type: "compare",
        title: "TCP versus UDP",
        columns: [
          { title: "TCP", points: ["Connection-oriented handshake", "Reliable, ordered byte stream", "Flow and congestion control", "20+ byte header", "Web, SSH, databases"] },
          { title: "UDP", points: ["Connectionless", "No delivery or order guarantee", "8-byte header", "Low latency", "DNS, VoIP, games, QUIC"] },
        ],
      },
    ],
    keyPoints: [
      "UDP is message-based; each send is one datagram.",
      "Applications on UDP must handle loss and reordering themselves.",
      "QUIC combines transport and TLS 1.3 handshakes, often 1 RTT or 0 RTT.",
      "QUIC streams avoid TCP's head-of-line blocking across streams.",
    ],
    terms: [
      { term: "Datagram", meaning: "Self-contained UDP message." },
      { term: "QUIC", meaning: "Encrypted, multiplexed transport over UDP." },
      { term: "Head-of-line blocking", meaning: "One lost packet stalls everything queued behind it." },
      { term: "0-RTT", meaning: "Sending data in the first flight on resumed connections." },
    ],
    example: {
      lang: "bash",
      code: "dig example.com              # DNS over UDP port 53\nsudo tcpdump -i any -nn udp port 53\nss -ulnp                     # listening UDP sockets\ncurl --http3 -I https://cloudflare.com   # needs curl built with HTTP/3",
    },
    check: [
      { q: "Why does DNS normally use UDP?", a: "Queries are small and a single request-response, so a handshake would only add latency." },
      { q: "Which HTTP version runs over QUIC?", a: "HTTP/3." },
    ],
  },

  // ───────────── Application protocols ─────────────
  "net-application/dns": {
    summary:
      "DNS translates names like www.example.com into IP addresses and other records. Your device asks a recursive resolver, which walks the hierarchy from the root servers to the top-level domain servers to the domain's authoritative servers, then caches the answer for its TTL. Nearly every connection starts with a DNS lookup, so DNS faults look like everything is down.",
    analogy: "A library catalogue: the resolver asks the main desk, then the right floor, then the right shelf.",
    visuals: [
      {
        type: "sequence",
        title: "Resolving www.example.com (cold cache)",
        actors: ["Client", "Recursive resolver", "Root / TLD servers", "Authoritative server"],
        messages: [
          { from: 0, to: 1, label: "A record for www.example.com?" },
          { from: 1, to: 2, label: "Ask root: referral to .com servers" },
          { from: 1, to: 2, label: "Ask .com: referral to example.com name servers" },
          { from: 1, to: 3, label: "Ask authoritative for www.example.com" },
          { from: 3, to: 1, label: "Answer: A 93.184.215.14, TTL 3600" },
          { from: 1, to: 0, label: "Answer, now cached" },
        ],
      },
      {
        type: "tree",
        title: "DNS hierarchy",
        root: ". (root)",
        children: [
          { label: "com", children: ["example.com", "www.example.com"] },
          { label: "org", children: ["wikipedia.org"] },
          { label: "uk", children: ["co.uk", "bbc.co.uk"] },
        ],
      },
    ],
    keyPoints: [
      "A maps to IPv4, AAAA to IPv6, CNAME to another name, MX to mail servers, NS to name servers, TXT to text.",
      "TTL controls how long resolvers cache an answer; lower it before migrations.",
      "Clients do recursive queries; resolvers do iterative ones.",
      "DNS uses UDP port 53, falling back to TCP for large responses.",
    ],
    terms: [
      { term: "Recursive resolver", meaning: "Server that finds the full answer on a client's behalf." },
      { term: "Authoritative server", meaning: "Server that holds the official records for a zone." },
      { term: "Zone", meaning: "Portion of the namespace managed together." },
      { term: "TTL", meaning: "Seconds an answer may be cached." },
      { term: "CNAME", meaning: "Alias pointing one name to another." },
    ],
    example: {
      lang: "bash",
      code: "dig www.example.com A +short\ndig example.com MX +short\ndig @1.1.1.1 example.com AAAA\ndig +trace www.example.com      # follow root, TLD, authoritative\ndig -x 8.8.8.8 +short           # reverse lookup (PTR)",
    },
    pitfalls: [
      "Putting a CNAME at the zone apex alongside other records.",
      "Changing records with a long TTL and expecting instant effect.",
    ],
    check: [
      { q: "Which record type maps a name to an IPv6 address?", a: "AAAA." },
      { q: "Why might users still reach an old IP after you change a record?", a: "Resolvers cached the old answer until its TTL expires." },
    ],
  },

  "net-application/dhcp": {
    summary:
      "DHCP gives hosts their network configuration automatically: IP address, subnet mask, default gateway, DNS servers and lease time. A new client broadcasts because it has no address yet, and the exchange of four messages is remembered as DORA. Relays forward the broadcasts to a DHCP server on another subnet.",
    visuals: [
      {
        type: "sequence",
        title: "DHCP DORA exchange",
        actors: ["Client (no IP)", "DHCP server"],
        messages: [
          { from: 0, to: 1, label: "DISCOVER (broadcast from 0.0.0.0)" },
          { from: 1, to: 0, label: "OFFER 10.0.10.50, lease 24h" },
          { from: 0, to: 1, label: "REQUEST 10.0.10.50 (broadcast)" },
          { from: 1, to: 0, label: "ACK with mask, gateway, DNS" },
          { from: 0, to: 1, label: "At 50% of the lease: unicast REQUEST to renew" },
        ],
      },
    ],
    keyPoints: [
      "DHCP uses UDP ports 67 (server) and 68 (client).",
      "Broadcasts do not cross routers; configure a relay (ip helper-address).",
      "Reservations give a device the same address based on its MAC.",
      "Rogue DHCP servers can hijack clients; switches block them with DHCP snooping.",
    ],
    terms: [
      { term: "Lease", meaning: "Time a client may use an assigned address." },
      { term: "Scope / pool", meaning: "Range of addresses the server hands out." },
      { term: "DHCP relay", meaning: "Router forwarding DHCP broadcasts to a remote server." },
      { term: "Option", meaning: "Extra setting such as router (3) or DNS servers (6)." },
    ],
    example: {
      lang: "text",
      code: "! Cisco IOS DHCP pool\nip dhcp excluded-address 10.0.10.1 10.0.10.9\nip dhcp pool STAFF\n network 10.0.10.0 255.255.255.0\n default-router 10.0.10.1\n dns-server 10.0.10.5\n! On the remote VLAN interface\ninterface vlan 20\n ip helper-address 10.0.10.5",
    },
    check: [
      { q: "What does DORA stand for?", a: "Discover, Offer, Request, Acknowledge." },
      { q: "Why does a client on another subnet need a relay?", a: "Its broadcasts stop at the router, so the relay forwards them to the server as unicast." },
    ],
  },

  "net-application/http-1-1": {
    summary:
      "HTTP is a request-response protocol: the client sends a method, path, headers and optional body, and the server replies with a status code, headers and body. HTTP/1.1 is plain text, so you can read it directly with curl -v. Headers control caching, content type, cookies, authentication and connection reuse.",
    visuals: [
      {
        type: "sequence",
        title: "A simple HTTP/1.1 exchange",
        actors: ["Browser", "Web server"],
        messages: [
          { from: 0, to: 1, label: "TCP handshake (and TLS for HTTPS)" },
          { from: 0, to: 1, label: "GET /index.html HTTP/1.1, Host: example.com" },
          { from: 1, to: 0, label: "HTTP/1.1 200 OK, Content-Type: text/html" },
          { from: 0, to: 1, label: "GET /style.css on the same keep-alive connection" },
          { from: 1, to: 0, label: "304 Not Modified (cached copy still valid)" },
        ],
      },
    ],
    keyPoints: [
      "Status classes: 2xx success, 3xx redirect, 4xx client error, 5xx server error.",
      "GET, HEAD, PUT and DELETE are idempotent; POST is not.",
      "The Host header lets many sites share one IP address.",
      "Cache-Control, ETag and Last-Modified let clients reuse responses.",
    ],
    terms: [
      { term: "Method", meaning: "Action requested, such as GET or POST." },
      { term: "Status code", meaning: "Three-digit result of a request." },
      { term: "Header", meaning: "Name-value metadata on a request or response." },
      { term: "Keep-alive", meaning: "Reusing one TCP connection for several requests." },
      { term: "Idempotent", meaning: "Repeating the request has the same effect as once." },
    ],
    example: {
      lang: "bash",
      code: "curl -v http://example.com/ -o /dev/null\n# > GET / HTTP/1.1\n# > Host: example.com\n# < HTTP/1.1 200 OK\n# < Content-Type: text/html\nprintf 'HEAD / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n' | nc example.com 80",
    },
    pitfalls: [
      "Returning 200 with an error message in the body instead of a proper status.",
      "Using GET for actions that change data.",
    ],
    check: [
      { q: "What does a 404 mean, and which class is it in?", a: "Not found; a 4xx client error." },
      { q: "Why is the Host header required in HTTP/1.1?", a: "So one server IP can host many domains and route requests correctly." },
    ],
  },

  "net-application/http-2-3": {
    summary:
      "HTTP/2 keeps HTTP semantics but sends binary frames, multiplexing many requests over one TCP connection with compressed headers. A lost TCP packet still stalls all streams, so HTTP/3 moves to QUIC over UDP, where each stream recovers independently. Browsers negotiate the version automatically.",
    visuals: [
      {
        type: "compare",
        title: "HTTP versions",
        columns: [
          { title: "HTTP/1.1", points: ["Text protocol over TCP", "One request at a time per connection", "Browsers open about 6 connections", "Uncompressed headers"] },
          { title: "HTTP/2", points: ["Binary frames over TCP", "Many streams on one connection", "HPACK header compression", "TCP head-of-line blocking remains"] },
          { title: "HTTP/3", points: ["Runs over QUIC on UDP", "Independent streams", "QPACK header compression", "Faster setup, survives network changes"] },
        ],
      },
    ],
    keyPoints: [
      "Methods, status codes and headers are the same across versions.",
      "HTTP/2 is negotiated during the TLS handshake via ALPN (h2).",
      "HTTP/3 is advertised with the Alt-Svc header, then used on later connections.",
      "Bundling and domain sharding hacks matter less with HTTP/2 and later.",
    ],
    terms: [
      { term: "Stream", meaning: "One request-response exchange within a connection." },
      { term: "Multiplexing", meaning: "Interleaving many streams on one connection." },
      { term: "HPACK / QPACK", meaning: "Header compression for HTTP/2 and HTTP/3." },
      { term: "ALPN", meaning: "TLS extension for choosing the application protocol." },
    ],
    example: {
      lang: "bash",
      code: "curl -sI --http2 https://www.cloudflare.com | head -1     # HTTP/2 200\ncurl -sI https://www.cloudflare.com | grep -i alt-svc       # h3 advertised\ncurl -w '%{http_version}\\n' -so /dev/null https://example.com",
    },
    check: [
      { q: "Which problem does HTTP/3 solve that HTTP/2 cannot?", a: "Head-of-line blocking at the TCP layer, since QUIC streams recover from loss independently." },
      { q: "How does a client learn a server supports HTTP/3?", a: "From the Alt-Svc header or an HTTPS DNS record." },
    ],
  },

  "net-application/tls": {
    summary:
      "TLS encrypts and authenticates connections, turning HTTP into HTTPS. During the handshake the client and server agree on keys with ephemeral Diffie-Hellman and the server proves its identity with a certificate signed by a trusted certificate authority. TLS 1.3 completes this in a single round trip.",
    visuals: [
      {
        type: "sequence",
        title: "TLS 1.3 handshake",
        actors: ["Client", "Server"],
        messages: [
          { from: 0, to: 1, label: "ClientHello: versions, ciphers, key share, SNI, ALPN" },
          { from: 1, to: 0, label: "ServerHello: chosen cipher and key share" },
          { from: 1, to: 0, label: "Encrypted: certificate, CertificateVerify, Finished" },
          { from: 0, to: 1, label: "Client verifies chain and hostname, sends Finished" },
          { from: 0, to: 1, label: "Encrypted application data" },
        ],
      },
    ],
    keyPoints: [
      "TLS 1.3 needs one round trip; resumed sessions can send 0-RTT data.",
      "Certificates chain from the server certificate through intermediates to a root CA.",
      "SNI tells the server which hostname the client wants before encryption starts.",
      "Forward secrecy means a stolen server key cannot decrypt past sessions.",
    ],
    terms: [
      { term: "Certificate", meaning: "Signed binding of a public key to a hostname." },
      { term: "Certificate authority", meaning: "Trusted issuer that signs certificates." },
      { term: "Chain of trust", meaning: "Signatures linking a certificate to a trusted root." },
      { term: "SNI", meaning: "Server Name Indication, the requested hostname." },
      { term: "Forward secrecy", meaning: "Session keys cannot be recovered from the long-term key." },
    ],
    example: {
      lang: "bash",
      code: "openssl s_client -connect example.com:443 -servername example.com </dev/null \\\n  | openssl x509 -noout -subject -issuer -dates\nopenssl s_client -connect example.com:443 -tls1_3 -brief </dev/null\ncurl -vI https://example.com 2>&1 | grep -E 'SSL|TLS|subject|issuer'",
    },
    pitfalls: [
      "Serving the leaf certificate without its intermediates.",
      "Letting certificates expire; automate renewal with ACME.",
    ],
    check: [
      { q: "How many round trips does a full TLS 1.3 handshake take?", a: "One." },
      { q: "What two things does the client check about the certificate?", a: "That it chains to a trusted root and that it matches the hostname, and is within its validity dates." },
    ],
  },

  "net-application/email-protocols": {
    summary:
      "Email is relayed between servers with SMTP, which looks up the recipient domain's MX records to find where to deliver. Users read mail with IMAP, which keeps messages on the server, or the older POP3. SPF, DKIM and DMARC records in DNS let receivers check that mail really comes from the domain it claims.",
    visuals: [
      {
        type: "flow",
        title: "Path of an email",
        steps: [
          { label: "Mail client", detail: "Submits via SMTP on port 587 with auth." },
          { label: "Sender's server", detail: "Looks up MX for the recipient domain." },
          { label: "SMTP relay", detail: "Delivers to the recipient MX on port 25." },
          { label: "Receiver checks", detail: "SPF, DKIM, DMARC, spam filters." },
          { label: "Mailbox", detail: "Recipient reads via IMAP on 993." },
        ],
      },
    ],
    keyPoints: [
      "SPF lists servers allowed to send for a domain.",
      "DKIM adds a signature verified with a public key in DNS.",
      "DMARC tells receivers what to do when SPF or DKIM fail, and where to report.",
    ],
    terms: [
      { term: "MX record", meaning: "DNS record naming a domain's mail servers." },
      { term: "SMTP", meaning: "Protocol for sending and relaying mail." },
      { term: "IMAP", meaning: "Protocol for reading mail kept on the server." },
      { term: "DMARC", meaning: "Policy tying SPF and DKIM results to the visible From domain." },
    ],
    example: {
      lang: "bash",
      code: "dig gmail.com MX +short\ndig gmail.com TXT +short | grep spf\ndig _dmarc.gmail.com TXT +short",
    },
    check: [
      { q: "How does a sending server know where to deliver mail for example.org?", a: "It looks up the MX records of example.org." },
      { q: "Which mechanism signs messages cryptographically?", a: "DKIM." },
    ],
  },

  // ───────────── Wireless ─────────────
  "net-wireless/wifi-standards": {
    summary:
      "Wi-Fi is the IEEE 802.11 family of standards for wireless LANs, now branded by generation. Newer generations add wider channels, more spatial streams and more efficient scheduling. Frequency band matters as much as generation: 2.4 GHz reaches further, while 5 and 6 GHz offer more channels and less interference.",
    visuals: [
      {
        type: "compare",
        title: "Frequency bands",
        columns: [
          { title: "2.4 GHz", points: ["Best range and wall penetration", "Only 3 non-overlapping channels (1, 6, 11)", "Crowded, Bluetooth and microwaves", "All generations"] },
          { title: "5 GHz", points: ["Many more channels", "40, 80 or 160 MHz widths", "Shorter range", "Wi-Fi 5 and later"] },
          { title: "6 GHz", points: ["Wide clean spectrum", "Wi-Fi 6E and 7 only", "Shortest range", "WPA3 required"] },
        ],
      },
    ],
    keyPoints: [
      "Wi-Fi 4 is 802.11n, Wi-Fi 5 is 802.11ac, Wi-Fi 6 is 802.11ax, Wi-Fi 7 is 802.11be.",
      "Wi-Fi 6 added OFDMA to serve many clients at once more efficiently.",
      "Wider channels give speed but are more prone to interference.",
      "Signal above about -67 dBm is a common target for voice and video.",
    ],
    terms: [
      { term: "802.11", meaning: "IEEE standard family behind Wi-Fi." },
      { term: "Channel width", meaning: "Slice of spectrum used, such as 20 or 80 MHz." },
      { term: "MIMO", meaning: "Multiple antennas sending parallel spatial streams." },
      { term: "RSSI / dBm", meaning: "Received signal strength; closer to 0 is stronger." },
      { term: "SNR", meaning: "Signal-to-noise ratio, higher is better." },
    ],
    example: {
      lang: "bash",
      code: "iw dev wlan0 link                 # SSID, frequency, signal, bitrate\nnmcli -f SSID,CHAN,FREQ,SIGNAL dev wifi list",
    },
    check: [
      { q: "Which 2.4 GHz channels do not overlap?", a: "1, 6 and 11." },
      { q: "What is Wi-Fi 6 in IEEE terms?", a: "802.11ax." },
    ],
  },

  "net-wireless/wifi-operation": {
    summary:
      "Access points advertise networks with beacon frames carrying the SSID. A client scans, authenticates and associates with one AP, then exchanges data frames through it. Because radio is a shared medium, devices listen before talking and take turns using CSMA/CA.",
    visuals: [
      {
        type: "sequence",
        title: "Joining a Wi-Fi network",
        actors: ["Client", "Access point"],
        messages: [
          { from: 1, to: 0, label: "Beacon: SSID, supported rates, security" },
          { from: 0, to: 1, label: "Probe request" },
          { from: 1, to: 0, label: "Probe response" },
          { from: 0, to: 1, label: "Authentication (open system or SAE)" },
          { from: 0, to: 1, label: "Association request" },
          { from: 1, to: 0, label: "Association response, then key handshake" },
        ],
      },
    ],
    keyPoints: [
      "SSID is the network name; BSSID is the MAC of a specific AP radio.",
      "Several APs share one SSID so clients can roam between them.",
      "Neighbouring APs should use different non-overlapping channels.",
      "Clients decide when to roam; 802.11k, v and r help them roam faster.",
    ],
    terms: [
      { term: "SSID", meaning: "Name of a wireless network." },
      { term: "BSSID", meaning: "MAC address identifying one AP radio." },
      { term: "Beacon", meaning: "Periodic frame announcing an AP's network." },
      { term: "Association", meaning: "Client joining a specific AP." },
      { term: "CSMA/CA", meaning: "Listen, wait and avoid collisions on shared radio." },
    ],
    pitfalls: [
      "Putting every AP on the same channel at full power.",
      "Using 160 MHz channels in dense environments.",
    ],
    check: [
      { q: "What is the difference between an SSID and a BSSID?", a: "The SSID is the network name; the BSSID is one AP radio's MAC address." },
      { q: "Why does Wi-Fi use collision avoidance rather than detection?", a: "A radio cannot reliably hear collisions while transmitting, so it listens and backs off first." },
    ],
  },

  "net-wireless/wifi-security": {
    summary:
      "Wireless traffic can be received by anyone nearby, so encryption and authentication are essential. WPA2 and WPA3 encrypt frames with keys derived during a four-way handshake. Home networks use a shared passphrase, while enterprises use 802.1X so each user authenticates individually against a RADIUS server.",
    visuals: [
      {
        type: "compare",
        title: "Wireless security modes",
        columns: [
          { title: "WEP / WPA", points: ["Broken", "Crackable in minutes", "Never use"] },
          { title: "WPA2", points: ["AES-CCMP encryption", "PSK open to offline dictionary attacks", "Still widely deployed"] },
          { title: "WPA3", points: ["SAE resists offline guessing", "Forward secrecy", "Protected management frames required"] },
        ],
      },
    ],
    keyPoints: [
      "Use WPA3, or WPA2/WPA3 transition mode for older clients.",
      "802.1X enterprise mode gives per-user credentials and easy revocation.",
      "Disable WPS, which weakens PSK networks.",
      "Hiding the SSID and MAC filtering are not security controls.",
    ],
    terms: [
      { term: "PSK", meaning: "Pre-shared key: one passphrase for everyone." },
      { term: "SAE", meaning: "Simultaneous Authentication of Equals, WPA3's handshake." },
      { term: "802.1X", meaning: "Port-based authentication using EAP and RADIUS." },
      { term: "Evil twin", meaning: "Rogue AP impersonating a legitimate SSID." },
    ],
    pitfalls: [
      "Short or guessable WPA2 passphrases.",
      "Guest Wi-Fi on the same VLAN as internal systems.",
    ],
    check: [
      { q: "Why is a weak WPA2-PSK passphrase dangerous?", a: "An attacker who captures the four-way handshake can guess passwords offline." },
      { q: "What does 802.1X add over a shared passphrase?", a: "Per-user authentication against a central server, so access can be revoked individually." },
    ],
  },

  // ───────────── Tools & troubleshooting ─────────────
  "net-tools/troubleshooting-method": {
    summary:
      "Good troubleshooting is a method, not a guess. Define the symptom and scope precisely, then test layer by layer, bottom-up from the cable or top-down from the application, changing one variable at a time. Writing down each test and result stops you going in circles.",
    visuals: [
      {
        type: "flow",
        title: "Bottom-up checklist",
        steps: [
          { label: "Physical", detail: "Link light, cable, Wi-Fi signal." },
          { label: "Data link", detail: "Right VLAN, ARP entry for gateway." },
          { label: "Network", detail: "IP, mask, gateway; ping gateway then remote IP." },
          { label: "Transport", detail: "Port open? nc or curl to it." },
          { label: "Application", detail: "DNS resolves? Service logs, HTTP status." },
        ],
      },
    ],
    keyPoints: [
      "Ask who is affected, since when, and what changed.",
      "Ping by IP and by name separately to isolate DNS.",
      "Compare a working host with a broken one.",
      "Change one thing at a time and record the result.",
    ],
    terms: [
      { term: "Scope", meaning: "Which users, hosts or sites are affected." },
      { term: "Divide and conquer", meaning: "Start in the middle layer and move up or down." },
      { term: "Baseline", meaning: "Known-good behaviour to compare against." },
    ],
    pitfalls: [
      "Changing several settings at once, so you never learn what fixed it.",
      "Blaming the network before checking the application logs.",
    ],
    check: [
      { q: "ping 8.8.8.8 works but ping google.com fails. What layer is likely at fault?", a: "Name resolution: DNS configuration or the DNS server." },
      { q: "Why compare with a working host?", a: "Differences in configuration point straight to likely causes." },
    ],
  },

  "net-tools/ping-traceroute": {
    summary:
      "ping sends ICMP echo requests to test whether a host is reachable and how long round trips take. traceroute sends probes with increasing TTL to reveal each router along the path. mtr combines both, showing loss and latency per hop over time.",
    visuals: [
      {
        type: "flow",
        title: "Locating a fault along a path",
        steps: [
          { label: "ping gateway", detail: "Local network healthy?" },
          { label: "ping remote IP", detail: "Internet path working?" },
          { label: "traceroute", detail: "Where does the path stop?" },
          { label: "mtr", detail: "Which hop introduces loss or latency?" },
        ],
      },
    ],
    keyPoints: [
      "Loss that starts at one hop and persists to the end is real.",
      "Loss at a single middle hop only is often ICMP rate limiting, not a fault.",
      "Rows of asterisks mean probes got no reply, not necessarily that traffic is blocked.",
      "Use traceroute -T or tcptraceroute when ICMP or UDP probes are filtered.",
    ],
    terms: [
      { term: "RTT", meaning: "Round-trip time, reported by ping." },
      { term: "Hop", meaning: "One router along the path." },
      { term: "Packet loss", meaning: "Percentage of probes with no reply." },
      { term: "mtr", meaning: "Continuous traceroute with per-hop statistics." },
    ],
    example: {
      lang: "bash",
      code: "ping -c 5 192.168.1.1\nping -c 5 1.1.1.1\ntraceroute -n 1.1.1.1\nsudo traceroute -T -p 443 example.com   # TCP probes\nmtr -rwc 50 example.com                  # report mode, 50 cycles",
    },
    check: [
      { q: "How does traceroute discover each hop?", a: "It sends probes with TTL 1, 2, 3 and so on, and each router that drops one replies with ICMP time exceeded." },
      { q: "mtr shows 40% loss at hop 5 but 0% at the destination. Is hop 5 a problem?", a: "Probably not; the router is rate-limiting ICMP replies, since traffic through it arrives fine." },
    ],
  },

  "net-tools/dns-tools": {
    summary:
      "dig and nslookup query DNS directly so you can see exactly what a server answers. Querying specific servers separates a broken local resolver from a broken authoritative zone. Following the delegation with +trace reveals misconfigured name servers.",
    visuals: [
      {
        type: "flow",
        title: "Diagnosing 'site not found'",
        steps: [
          { label: "Local resolver", detail: "dig example.com" },
          { label: "Public resolver", detail: "dig @1.1.1.1 example.com" },
          { label: "Authoritative", detail: "dig @ns1.example.com example.com" },
          { label: "Delegation", detail: "dig +trace example.com" },
          { label: "Client config", detail: "resolvectl status or /etc/resolv.conf" },
        ],
      },
    ],
    keyPoints: [
      "Check status in the header: NOERROR, NXDOMAIN or SERVFAIL.",
      "The aa flag marks an authoritative answer.",
      "Different answers from different resolvers suggest caching or propagation delay.",
      "SERVFAIL often means a DNSSEC or delegation problem.",
    ],
    terms: [
      { term: "NXDOMAIN", meaning: "The name does not exist." },
      { term: "SERVFAIL", meaning: "The resolver could not get a valid answer." },
      { term: "Delegation", meaning: "NS records handing a subdomain to other servers." },
      { term: "resolv.conf", meaning: "File listing a Linux host's DNS servers." },
    ],
    example: {
      lang: "bash",
      code: "dig example.com +noall +answer +comments | head\ndig @8.8.8.8 example.com A +short\ndig example.com NS +short\ndig +trace example.com\nresolvectl status | grep -A2 'DNS Servers'",
    },
    check: [
      { q: "What does NXDOMAIN mean?", a: "The queried name does not exist." },
      { q: "How do you test whether your local resolver is the problem?", a: "Query the same name against a public resolver such as @1.1.1.1 and compare." },
    ],
  },

  "net-tools/host-tools": {
    summary:
      "On Linux the ip command shows and changes interfaces, addresses and routes, while ss lists sockets and the processes that own them. curl tests application endpoints with full control over headers and timing. nmap scans hosts to discover open ports, which you should only do on systems you own or are authorised to test.",
    visuals: [
      {
        type: "layers",
        title: "Which tool checks which layer",
        layers: [
          { label: "Application", detail: "curl -v, openssl s_client" },
          { label: "Transport", detail: "ss -tulpn, nc -zv, nmap" },
          { label: "Network", detail: "ip addr, ip route, ping" },
          { label: "Data link", detail: "ip link, ip neigh" },
          { label: "Physical", detail: "ethtool, iw" },
        ],
      },
    ],
    keyPoints: [
      "ip replaces the older ifconfig, route and arp commands.",
      "ss -tulpn shows TCP and UDP listeners with owning processes.",
      "A service bound to 127.0.0.1 is unreachable from other hosts.",
      "curl -w prints DNS, connect, TLS and first-byte timings.",
    ],
    terms: [
      { term: "iproute2", meaning: "Linux tool suite including ip and ss." },
      { term: "Listening socket", meaning: "Socket waiting for incoming connections." },
      { term: "Port scan", meaning: "Probing ports to see which are open." },
    ],
    example: {
      lang: "bash",
      code: "ip -br addr                          # brief address list\nip route get 1.1.1.1\nss -tulpn                            # listeners and processes\nnc -zv db.internal 5432              # is the port reachable?\ncurl -o /dev/null -s -w 'dns %{time_namelookup} connect %{time_connect} ttfb %{time_starttransfer}\\n' https://example.com\nnmap -sV -p 22,80,443 192.168.1.10   # only on hosts you own",
    },
    pitfalls: [
      "Scanning networks without permission.",
      "Missing that a service listens on 127.0.0.1 instead of 0.0.0.0.",
    ],
    check: [
      { q: "Which command shows which process listens on port 8080?", a: "ss -tulpn (or ss -tlnp for TCP only)." },
      { q: "A web app works on the server with curl localhost but not from other hosts. Likely cause?", a: "It is bound to 127.0.0.1 or blocked by a host firewall." },
    ],
  },

  "net-tools/tcpdump": {
    summary:
      "tcpdump captures packets from an interface and prints or saves them, which makes it the standard capture tool on servers without a GUI. Capture filters written in BPF syntax limit what is recorded so files stay small. Save to a pcap file and open it in Wireshark for deeper analysis.",
    visuals: [
      {
        type: "flow",
        title: "Capture workflow",
        steps: [
          { label: "Pick interface", detail: "tcpdump -D or ip link." },
          { label: "Filter", detail: "host, port, net, tcp, udp, icmp." },
          { label: "Capture", detail: "-w file.pcap with a packet or size limit." },
          { label: "Reproduce", detail: "Trigger the failing request." },
          { label: "Analyse", detail: "tcpdump -r or Wireshark." },
        ],
      },
    ],
    keyPoints: [
      "-n stops DNS lookups so output is fast and unambiguous.",
      "Combine filters with and, or and not, using parentheses in quotes.",
      "Flags print as [S] SYN, [S.] SYN-ACK, [.] ACK, [P.] push, [F.] FIN, [R] reset.",
      "Capturing needs root or the right capabilities; captures can contain secrets.",
    ],
    terms: [
      { term: "pcap", meaning: "Standard packet capture file format." },
      { term: "BPF filter", meaning: "Capture filter expression evaluated in the kernel." },
      { term: "Snap length", meaning: "Bytes captured per packet (-s)." },
      { term: "Promiscuous mode", meaning: "NIC accepts frames not addressed to it." },
    ],
    example: {
      lang: "bash",
      code: "sudo tcpdump -D                                   # list interfaces\nsudo tcpdump -i eth0 -nn host 10.0.0.5 and port 443\nsudo tcpdump -i any -nn 'udp port 53 or icmp'\nsudo tcpdump -i eth0 -nn -c 2000 -w /tmp/web.pcap 'tcp port 80'\ntcpdump -nn -r /tmp/web.pcap 'tcp[tcpflags] & tcp-rst != 0'",
    },
    pitfalls: [
      "Capturing on the wrong interface and seeing nothing.",
      "Running unfiltered captures on busy servers and filling the disk.",
    ],
    check: [
      { q: "What does [S.] mean in tcpdump output?", a: "A SYN-ACK: the SYN and ACK flags are set." },
      { q: "Why use -nn?", a: "To skip DNS and port-name lookups, showing raw IPs and port numbers." },
    ],
  },

  "net-tools/wireshark": {
    summary:
      "Wireshark decodes captured packets into every protocol layer and lets you filter, follow conversations and graph behaviour. Display filters narrow thousands of packets to the ones that matter, and expert analysis flags retransmissions, resets and zero windows. It is the fastest way to prove what actually happened on the wire.",
    visuals: [
      {
        type: "layers",
        title: "Wireshark's packet detail pane",
        layers: [
          { label: "Frame", detail: "Capture time, length, interface." },
          { label: "Ethernet II", detail: "Source and destination MAC." },
          { label: "Internet Protocol", detail: "Source and destination IP, TTL." },
          { label: "TCP", detail: "Ports, flags, sequence and ACK numbers." },
          { label: "TLS / HTTP", detail: "Handshake messages or request lines." },
        ],
      },
    ],
    keyPoints: [
      "Display filters (ip.addr == 10.0.0.5) differ from capture filters (host 10.0.0.5).",
      "Follow TCP Stream reassembles a whole conversation.",
      "Statistics, Conversations ranks hosts by traffic volume.",
      "With an SSLKEYLOGFILE from the browser, Wireshark can decrypt TLS.",
    ],
    terms: [
      { term: "Display filter", meaning: "Filter applied to already captured packets." },
      { term: "Dissector", meaning: "Wireshark module that decodes one protocol." },
      { term: "Follow stream", meaning: "View the reassembled data of one connection." },
      { term: "Expert info", meaning: "Automatic warnings such as retransmissions." },
    ],
    example: {
      lang: "text",
      code: "ip.addr == 10.0.0.5 && tcp.port == 443\ntcp.flags.syn == 1 && tcp.flags.ack == 0\ntcp.analysis.flags\ndns.flags.rcode != 0\nhttp.response.code >= 500\ntls.handshake.type == 1",
      caption: "Useful display filters; the last one shows ClientHello messages.",
    },
    pitfalls: [
      "Typing capture-filter syntax into the display filter bar.",
      "Sharing captures that contain passwords, cookies or personal data.",
    ],
    check: [
      { q: "Which filter shows only new connection attempts?", a: "tcp.flags.syn == 1 && tcp.flags.ack == 0." },
      { q: "How can you read HTTPS content in a capture of your own browser?", a: "Set SSLKEYLOGFILE so the browser logs session keys and point Wireshark at that file." },
    ],
  },

  // ───────────── Security ─────────────
  "net-security/firewalls": {
    summary:
      "Firewalls decide which traffic may pass based on rules about addresses, ports, protocols and connection state. Stateless ACLs check each packet in isolation, while stateful firewalls track connections and automatically allow replies. Good rule sets deny by default and allow only what is needed between clearly defined zones.",
    visuals: [
      {
        type: "flow",
        title: "Rule evaluation in a stateful firewall",
        steps: [
          { label: "Packet arrives", detail: "On an interface or zone." },
          { label: "Existing connection?", detail: "Established or related: allow." },
          { label: "Match rules top-down", detail: "First match wins." },
          { label: "Allow or drop", detail: "Log as configured." },
          { label: "Default policy", detail: "No match: drop." },
        ],
      },
    ],
    keyPoints: [
      "Order matters: the first matching rule wins.",
      "Stateful firewalls allow return traffic without extra rules.",
      "A DMZ holds public-facing servers separate from the internal network.",
      "Cloud security groups are stateful; network ACLs are usually stateless.",
    ],
    terms: [
      { term: "ACL", meaning: "Access control list of permit and deny rules." },
      { term: "Stateful inspection", meaning: "Tracking connections to judge packets in context." },
      { term: "Default deny", meaning: "Block everything not explicitly allowed." },
      { term: "DMZ", meaning: "Network zone for services exposed to the internet." },
    ],
    example: {
      lang: "bash",
      code: "sudo nft add table inet filter\nsudo nft add chain inet filter input '{ type filter hook input priority 0; policy drop; }'\nsudo nft add rule inet filter input ct state established,related accept\nsudo nft add rule inet filter input iif lo accept\nsudo nft add rule inet filter input tcp dport '{ 22, 443 }' accept\nsudo nft list ruleset",
    },
    pitfalls: [
      "Applying a default-drop policy remotely before allowing SSH.",
      "Placing a broad allow rule above specific deny rules.",
    ],
    check: [
      { q: "Why does a stateful firewall need no rule for reply packets?", a: "It tracks the connection and allows packets belonging to established sessions." },
      { q: "What does default deny mean?", a: "Any traffic not matched by an allow rule is dropped." },
    ],
  },

  "net-security/vpns": {
    summary:
      "A VPN builds an encrypted tunnel across an untrusted network so traffic travels as if on a private link. Site-to-site VPNs join whole networks, often with IPsec, while remote-access VPNs connect individual users. WireGuard is a modern, minimal protocol that is fast and easy to configure.",
    visuals: [
      {
        type: "compare",
        title: "Common VPN technologies",
        columns: [
          { title: "IPsec", points: ["IKE negotiates keys", "ESP encrypts packets", "Standard for site-to-site", "Complex configuration"] },
          { title: "WireGuard", points: ["Small codebase", "Public-key peers", "UDP, very fast", "Simple config files"] },
          { title: "TLS VPN", points: ["Runs over TCP/UDP 443", "Passes most firewalls", "OpenVPN and vendor clients", "Common for remote access"] },
        ],
      },
    ],
    keyPoints: [
      "Tunnel mode wraps the whole original packet inside a new one.",
      "Split tunnelling sends only corporate traffic through the VPN.",
      "Overlapping subnets on both sides break site-to-site routing.",
      "Encapsulation overhead lowers the effective MTU.",
    ],
    terms: [
      { term: "Tunnel", meaning: "Encapsulating packets inside other packets." },
      { term: "IKE", meaning: "Internet Key Exchange, negotiates IPsec keys." },
      { term: "ESP", meaning: "IPsec protocol that encrypts payloads." },
      { term: "Split tunnel", meaning: "Only some destinations use the VPN." },
    ],
    example: {
      lang: "text",
      code: "# /etc/wireguard/wg0.conf on a laptop\n[Interface]\nPrivateKey = <laptop-private-key>\nAddress = 10.8.0.2/24\n\n[Peer]\nPublicKey = <server-public-key>\nEndpoint = vpn.example.com:51820\nAllowedIPs = 10.0.0.0/16       # split tunnel to office ranges\nPersistentKeepalive = 25",
      caption: "Bring it up with: sudo wg-quick up wg0, then check with: sudo wg show",
    },
    check: [
      { q: "What is the difference between site-to-site and remote-access VPNs?", a: "Site-to-site links whole networks via gateways; remote access connects individual devices." },
      { q: "What does AllowedIPs control in WireGuard?", a: "Which destination ranges are routed through the tunnel to that peer." },
    ],
  },

  "net-security/ids-attacks": {
    summary:
      "Common network attacks include reconnaissance scans, spoofing to intercept traffic, and floods that exhaust resources. An intrusion detection system watches traffic and alerts on suspicious patterns, while an intrusion prevention system sits inline and can block them. Detection uses known signatures or deviations from normal behaviour.",
    visuals: [
      {
        type: "tree",
        title: "Attacks and defences",
        root: "Network threats",
        children: [
          { label: "Reconnaissance", children: ["Port scans", "Defence: IDS alerts, minimal exposure"] },
          { label: "ARP spoofing / MITM", children: ["Fake gateway MAC", "Defence: dynamic ARP inspection, TLS"] },
          { label: "SYN flood / DDoS", children: ["Exhaust connections or bandwidth", "Defence: SYN cookies, scrubbing, CDN"] },
          { label: "DNS spoofing", children: ["Forged answers", "Defence: DNSSEC, trusted resolvers"] },
          { label: "Rogue DHCP / AP", children: ["Hijack clients", "Defence: DHCP snooping, WIDS"] },
        ],
      },
    ],
    keyPoints: [
      "An IDS is passive and alerts; an IPS is inline and can drop traffic.",
      "Signature detection catches known attacks; anomaly detection finds unusual behaviour with more false positives.",
      "Suricata, Snort and Zeek are widely used open-source tools.",
      "Encryption limits what network sensors can inspect.",
    ],
    terms: [
      { term: "IDS", meaning: "Intrusion detection system that alerts on threats." },
      { term: "IPS", meaning: "Intrusion prevention system that blocks inline." },
      { term: "Signature", meaning: "Pattern matching a known attack." },
      { term: "MITM", meaning: "Man-in-the-middle interception of traffic." },
      { term: "SYN cookies", meaning: "Defence that avoids storing state for half-open connections." },
    ],
    example: {
      lang: "text",
      code: "# Suricata-style rule: alert on many SYNs to SSH from one source\nalert tcp any any -> $HOME_NET 22 (msg:\"Possible SSH scan\"; flags:S; \\\n  threshold: type both, track by_src, count 20, seconds 60; sid:1000001; rev:1;)",
    },
    check: [
      { q: "What is the key difference between an IDS and an IPS?", a: "An IDS observes and alerts; an IPS sits inline and can block traffic." },
      { q: "How does ARP spoofing enable a MITM attack?", a: "The attacker claims the gateway's IP with its own MAC, so victims send traffic through it." },
    ],
  },

  // ───────────── Cloud & data-centre networking ─────────────
  "net-cloud/datacenter-topologies": {
    summary:
      "Modern data centres carry far more server-to-server traffic than traffic to users, which the old three-tier design handled poorly. Leaf-spine fabrics connect every leaf switch to every spine switch, so any two servers are the same number of hops apart and ECMP spreads load across all paths. Overlays such as VXLAN stretch layer 2 segments across this layer 3 fabric.",
    visuals: [
      {
        type: "compare",
        title: "Three-tier versus leaf-spine",
        columns: [
          { title: "Three-tier", points: ["Access, aggregation, core", "Built for north-south traffic", "STP blocks redundant links", "Uneven path lengths"] },
          { title: "Leaf-spine", points: ["Every leaf links to every spine", "Built for east-west traffic", "Layer 3 with ECMP, no STP", "Predictable two-hop paths", "Scale out by adding spines"] },
        ],
      },
    ],
    keyPoints: [
      "East-west traffic flows between servers; north-south flows in and out of the data centre.",
      "ECMP hashes flows across equal-cost paths.",
      "VXLAN encapsulates Ethernet frames in UDP with a 24-bit segment ID.",
      "BGP is commonly used as the routing protocol inside fabrics.",
    ],
    terms: [
      { term: "Leaf", meaning: "Top-of-rack switch that servers connect to." },
      { term: "Spine", meaning: "Core switch interconnecting all leaves." },
      { term: "ECMP", meaning: "Equal-cost multi-path routing." },
      { term: "VXLAN", meaning: "Overlay carrying layer 2 over layer 3." },
    ],
    check: [
      { q: "Why do leaf-spine fabrics not need STP between switches?", a: "Links between leaves and spines are routed at layer 3, so ECMP uses all of them without loops." },
      { q: "What kind of traffic dominates modern data centres?", a: "East-west, server-to-server traffic." },
    ],
  },

  "net-cloud/vpc": {
    summary:
      "A virtual private cloud is your own isolated network inside a cloud provider, defined by a CIDR block and divided into subnets across availability zones. Route tables decide whether a subnet is public, with a route to an internet gateway, or private, reaching out only through a NAT gateway. Security groups and network ACLs filter traffic.",
    visuals: [
      {
        type: "layers",
        title: "A typical two-tier VPC (10.0.0.0/16)",
        layers: [
          { label: "Internet gateway", detail: "Attached to the VPC." },
          { label: "Public subnets 10.0.0.0/24, 10.0.1.0/24", detail: "Load balancer, NAT gateway; route 0.0.0.0/0 to IGW." },
          { label: "Private app subnets 10.0.10.0/24, 10.0.11.0/24", detail: "App servers; route 0.0.0.0/0 to NAT." },
          { label: "Private data subnets 10.0.20.0/24, 10.0.21.0/24", detail: "Databases; no internet route." },
        ],
      },
    ],
    keyPoints: [
      "Choose a VPC CIDR that will not overlap with offices or other VPCs.",
      "A subnet is public only because its route table points to an internet gateway.",
      "Security groups are stateful and attach to instances; NACLs are stateless per subnet.",
      "Peering and transit gateways connect VPCs; peering is not transitive.",
    ],
    terms: [
      { term: "VPC", meaning: "Isolated virtual network in a cloud account." },
      { term: "Internet gateway", meaning: "Lets public subnets reach and be reached from the internet." },
      { term: "NAT gateway", meaning: "Gives private subnets outbound-only internet access." },
      { term: "Security group", meaning: "Stateful virtual firewall on a network interface." },
      { term: "VPC peering", meaning: "Private routing between two VPCs." },
    ],
    example: {
      lang: "bash",
      code: "aws ec2 create-vpc --cidr-block 10.0.0.0/16\naws ec2 create-subnet --vpc-id vpc-123 --cidr-block 10.0.0.0/24 --availability-zone us-east-1a\naws ec2 create-internet-gateway\naws ec2 attach-internet-gateway --vpc-id vpc-123 --internet-gateway-id igw-123\naws ec2 create-route --route-table-id rtb-123 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-123",
    },
    pitfalls: [
      "Using 10.0.0.0/16 everywhere, then needing to peer overlapping VPCs.",
      "Putting databases in public subnets.",
    ],
    check: [
      { q: "What makes a subnet public?", a: "Its route table has a default route to an internet gateway." },
      { q: "How do private instances download updates?", a: "Through a NAT gateway in a public subnet." },
    ],
  },

  "net-cloud/load-balancers": {
    summary:
      "A load balancer spreads incoming connections across a pool of healthy servers, adding capacity and resilience. Layer 4 balancers forward TCP or UDP connections by address and port, while layer 7 balancers understand HTTP and can route by host, path or header. Health checks remove failing servers automatically.",
    visuals: [
      {
        type: "compare",
        title: "Layer 4 versus layer 7",
        columns: [
          { title: "Layer 4", points: ["Sees IPs and ports only", "Very fast, protocol-agnostic", "Can pass TLS through untouched", "Example: AWS NLB"] },
          { title: "Layer 7", points: ["Understands HTTP", "Route by host, path, header", "Terminates TLS", "Example: AWS ALB, NGINX"] },
        ],
      },
    ],
    keyPoints: [
      "Algorithms include round robin, least connections and consistent hashing.",
      "Health checks should test a real dependency path, not just an open port.",
      "TLS termination at the balancer centralises certificates.",
      "Sticky sessions pin a client to one server but weaken even distribution.",
    ],
    terms: [
      { term: "Target pool", meaning: "Servers that receive balanced traffic." },
      { term: "Health check", meaning: "Periodic probe deciding if a target is healthy." },
      { term: "TLS termination", meaning: "Decrypting TLS at the balancer." },
      { term: "Sticky session", meaning: "Routing a client consistently to one target." },
    ],
    example: {
      lang: "text",
      code: "# nginx layer 7 load balancing\nupstream app {\n    least_conn;\n    server 10.0.10.11:8080 max_fails=3 fail_timeout=10s;\n    server 10.0.10.12:8080 max_fails=3 fail_timeout=10s;\n}\nserver {\n    listen 80;\n    location / { proxy_pass http://app; }\n}",
    },
    check: [
      { q: "Which balancer type can route /api and /static to different pools?", a: "A layer 7 load balancer." },
      { q: "Why do health checks matter?", a: "They stop traffic going to failed servers automatically." },
    ],
  },

  "net-cloud/cdn": {
    summary:
      "A content delivery network caches content at many edge locations close to users, cutting latency and offloading the origin server. Many CDNs use anycast, announcing the same IP address from every location so routing sends each user to a nearby edge. The same spread-out capacity absorbs large DDoS attacks.",
    visuals: [
      {
        type: "flow",
        title: "Serving a request through a CDN",
        steps: [
          { label: "DNS", detail: "Name resolves to the CDN's anycast IP." },
          { label: "Nearest edge", detail: "BGP routes the user to a nearby location." },
          { label: "Cache hit?", detail: "Serve immediately from the edge." },
          { label: "Cache miss", detail: "Fetch from origin and store per Cache-Control." },
        ],
      },
    ],
    keyPoints: [
      "Cache-Control max-age and s-maxage decide how long edges keep content.",
      "The cache key is usually the URL plus selected headers.",
      "Purge or version URLs to update cached assets.",
    ],
    terms: [
      { term: "Edge / PoP", meaning: "CDN location serving nearby users." },
      { term: "Origin", meaning: "Your server holding the original content." },
      { term: "Anycast", meaning: "One IP announced from many places; routing picks the closest." },
      { term: "Cache hit ratio", meaning: "Share of requests served from cache." },
    ],
    example: {
      lang: "bash",
      code: "curl -sI https://www.cloudflare.com | grep -iE 'cache-control|cf-cache-status|age'\ndig +short www.cloudflare.com",
    },
    check: [
      { q: "How does anycast send users to the nearest edge?", a: "Every location announces the same prefix via BGP, and routing picks the closest path." },
      { q: "What header mainly controls CDN caching time?", a: "Cache-Control, with max-age or s-maxage." },
    ],
  },

  "net-cloud/sdn": {
    summary:
      "Software-defined networking separates the control plane, which decides where traffic should go, from the data plane, which forwards packets. A central controller programs many devices through APIs, so the network can be managed as one system and configured as code. Cloud VPCs are SDN in practice.",
    visuals: [
      {
        type: "layers",
        title: "SDN architecture",
        layers: [
          { label: "Applications and intent", detail: "Policies such as isolate tenant A." },
          { label: "Northbound API", detail: "REST APIs for automation." },
          { label: "SDN controller", detail: "Global view; computes forwarding state." },
          { label: "Southbound API", detail: "OpenFlow, NETCONF, gNMI." },
          { label: "Data plane", detail: "Switches and virtual switches forward packets." },
        ],
      },
    ],
    keyPoints: [
      "Control plane: routing decisions. Data plane: per-packet forwarding.",
      "Centralised control gives a global view and consistent policy.",
      "Network automation uses Ansible, APIs and version-controlled configs.",
      "Intent-based networking states the desired outcome, not device commands.",
    ],
    terms: [
      { term: "Control plane", meaning: "Logic that builds forwarding tables." },
      { term: "Data plane", meaning: "Hardware or software that forwards packets." },
      { term: "Controller", meaning: "Central software programming network devices." },
      { term: "OpenFlow", meaning: "Early southbound protocol for programming switches." },
    ],
    example: {
      lang: "text",
      code: "# Ansible task pushing a VLAN to Cisco switches\n- name: Ensure VLAN 30 exists\n  cisco.ios.ios_vlans:\n    config:\n      - vlan_id: 30\n        name: VOICE\n    state: merged",
    },
    check: [
      { q: "What does SDN separate?", a: "The control plane from the data plane." },
      { q: "Why is network configuration as code useful?", a: "Changes are reviewed, versioned, repeatable and easy to roll back." },
    ],
  },

  // ───────────── Capstone ─────────────
  "net-capstone/network-design": {
    summary:
      "Designing a network starts from requirements: how many users and devices, which services, which groups must be isolated and how much growth to expect. From there you draw the physical and logical topology, assign VLANs and subnets, and plan services such as DHCP, DNS, NAT and firewall rules. A clear plan makes the build and every later fix faster.",
    visuals: [
      {
        type: "tree",
        title: "Example office plan on 10.20.0.0/16",
        root: "Office router / firewall",
        children: [
          { label: "VLAN 10 Staff", children: ["10.20.10.0/24", "DHCP, full access"] },
          { label: "VLAN 20 Guests", children: ["10.20.20.0/24", "Internet only"] },
          { label: "VLAN 30 Voice", children: ["10.20.30.0/24", "QoS priority"] },
          { label: "VLAN 40 Servers", children: ["10.20.40.0/24", "Static IPs, DNS, file server"] },
          { label: "VLAN 99 Management", children: ["10.20.99.0/24", "Switch and AP management"] },
        ],
      },
    ],
    keyPoints: [
      "Size every subnet with at least 50 percent headroom.",
      "Separate guests, voice and management from staff traffic.",
      "Document addressing, VLANs and firewall intent in one table.",
      "Plan redundancy where downtime is costly.",
    ],
    terms: [
      { term: "Requirements", meaning: "Users, services, security and growth needs." },
      { term: "Logical topology", meaning: "How VLANs, subnets and routing connect." },
      { term: "Addressing plan", meaning: "Table of subnets, gateways and reserved ranges." },
    ],
    check: [
      { q: "Why give the guest network its own VLAN?", a: "To keep untrusted devices isolated from internal systems while still allowing internet access." },
      { q: "What should be decided before configuring any device?", a: "The VLAN and subnet plan, gateways and which zones may talk to each other." },
    ],
  },

  "net-capstone/network-build": {
    summary:
      "In Cisco Packet Tracer or GNS3 you build the designed network device by device: switch VLANs and trunks, router subinterfaces for inter-VLAN routing, DHCP pools, NAT to the internet and ACLs between zones. Verify each layer as you go rather than configuring everything first. Save working configurations so you can return to a known-good state.",
    visuals: [
      {
        type: "flow",
        title: "Build order",
        steps: [
          { label: "Cable and power", detail: "Place devices, connect links." },
          { label: "VLANs and trunks", detail: "Access ports, 802.1Q trunk to router." },
          { label: "Inter-VLAN routing", detail: "Subinterfaces with gateway IPs." },
          { label: "DHCP and DNS", detail: "Pools per VLAN; test client leases." },
          { label: "NAT and ACLs", detail: "Internet access; restrict guest VLAN." },
          { label: "Wi-Fi and verify", detail: "AP per SSID; ping and browse from each VLAN." },
        ],
      },
    ],
    keyPoints: [
      "Verify with show vlan brief, show interfaces trunk and show ip interface brief.",
      "Test from a client in every VLAN after each step.",
      "Use show running-config and copy run start to save progress.",
      "Packet Tracer simulation mode lets you step through each packet.",
    ],
    terms: [
      { term: "Subinterface", meaning: "Logical router interface for one VLAN, such as g0/0.10." },
      { term: "Router-on-a-stick", meaning: "One trunk link routing between many VLANs." },
      { term: "Running config", meaning: "Active configuration in memory." },
    ],
    example: {
      lang: "text",
      code: "interface g0/0.10\n encapsulation dot1Q 10\n ip address 10.20.10.1 255.255.255.0\n ip nat inside\ninterface g0/1\n ip address dhcp\n ip nat outside\naccess-list 1 permit 10.20.0.0 0.0.255.255\nip nat inside source list 1 interface g0/1 overload\ndo show ip interface brief",
      caption: "Router subinterface plus PAT on Cisco IOS.",
    },
    check: [
      { q: "Which command confirms that VLANs are allowed on a trunk?", a: "show interfaces trunk." },
      { q: "What does overload mean in the NAT command?", a: "Use PAT, so many inside hosts share the outside interface address." },
    ],
  },

  "net-capstone/packet-analysis": {
    summary:
      "Capturing your own network's traffic connects every protocol you studied to real packets. Record a client joining the network and loading a web page, then annotate each exchange: DHCP DORA, ARP for the gateway, DNS lookup, TCP handshake, TLS handshake and HTTP. Writing it up proves you understand each step.",
    visuals: [
      {
        type: "sequence",
        title: "What a fresh client does to load a page",
        actors: ["Client", "Router / DHCP", "DNS server", "Web server"],
        messages: [
          { from: 0, to: 1, label: "DHCP DORA: get IP, gateway, DNS" },
          { from: 0, to: 1, label: "ARP: who has the gateway?" },
          { from: 0, to: 2, label: "DNS query for the site" },
          { from: 2, to: 0, label: "DNS answer with the IP" },
          { from: 0, to: 3, label: "TCP handshake, then TLS handshake" },
          { from: 0, to: 3, label: "HTTP GET over TLS" },
          { from: 3, to: 0, label: "HTTP 200 response" },
        ],
      },
    ],
    keyPoints: [
      "Start the capture before connecting the client to catch DHCP.",
      "Use display filters per protocol: dhcp, arp, dns, tcp.flags.syn == 1, tls.handshake.",
      "Note timings: DNS time, connect time and server response time.",
      "Remove sensitive data before sharing captures.",
    ],
    terms: [
      { term: "Annotation", meaning: "Notes explaining what each packet does." },
      { term: "Time delta", meaning: "Time between packets, revealing delays." },
      { term: "Capture point", meaning: "Where in the network the capture is taken." },
    ],
    example: {
      lang: "bash",
      code: "sudo tcpdump -i eth0 -nn -w join.pcap &\nsudo dhclient -r eth0 && sudo dhclient eth0\ncurl -s https://example.com > /dev/null\nsudo kill %1\ntshark -r join.pcap -Y 'dhcp || arp || dns || tls.handshake.type == 1'",
    },
    check: [
      { q: "Which happens first on a fresh client: DNS or DHCP?", a: "DHCP, because the client needs an address and DNS server before it can query." },
      { q: "Why might a capture show no DHCP traffic?", a: "The client already had a valid lease, or the capture started after it joined." },
    ],
  },

  "net-capstone/fault-scenarios": {
    summary:
      "Practising on deliberately broken networks builds real troubleshooting skill. Have a partner, or a script, inject faults such as a wrong access VLAN, a missing route, a bad gateway, a DNS typo or an overly strict ACL. Diagnose each one layer by layer and record symptom, evidence, cause and fix.",
    visuals: [
      {
        type: "compare",
        title: "Faults and their tell-tale symptoms",
        columns: [
          { title: "Layer 2 faults", points: ["Wrong VLAN: no DHCP lease, 169.254 address", "Trunk missing VLAN: whole VLAN isolated", "Loop: network-wide slowdown"] },
          { title: "Layer 3 faults", points: ["Wrong gateway: local works, remote fails", "Missing return route: one-way traffic", "NAT missing: private IPs cannot reach internet"] },
          { title: "Layer 4-7 faults", points: ["ACL blocking: ping works, port fails", "DNS wrong: IP works, names fail", "Service down: connection refused"] },
        ],
      },
    ],
    keyPoints: [
      "Start from the symptom and the scope, not from a guess.",
      "Use the bottom-up checklist and capture packets when unsure.",
      "Each fault report lists symptom, tests run, root cause and fix.",
      "Time yourself and repeat until common faults take minutes.",
    ],
    terms: [
      { term: "Fault injection", meaning: "Deliberately breaking a system to practise recovery." },
      { term: "Root cause", meaning: "The underlying reason for the symptom." },
      { term: "Runbook", meaning: "Written steps for diagnosing a known problem." },
    ],
    pitfalls: [
      "Fixing the symptom without finding the root cause.",
      "Not re-testing from the original failing client after the fix.",
    ],
    check: [
      { q: "A PC gets a 169.254.x.x address. Which faults would you check first?", a: "Its access port VLAN, the trunk allowing that VLAN, and the DHCP pool or relay." },
      { q: "Ping to a server works but HTTPS fails. What is a likely cause?", a: "An ACL or firewall blocking TCP 443, or the service not listening." },
    ],
  },
};

export default explainers;
