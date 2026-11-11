import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-ip/ipv4-addressing": {
    plain: [
      "Every device on an IP network needs an address so data can find it, just like every house needs a street address for post. An IPv4 address is a number made of 32 bits. To make it readable, we split it into four groups of 8 bits, called octets, and write each one as a decimal number from 0 to 255, like 192.168.1.10.",
      "Each address has two parts. The first part names the network, and every device on the same local network shares it. The second part names the single device, or host, on that network. The prefix length, written like /24, says how many bits belong to the network part.",
      "Some address ranges are special. Private ranges such as 10.x.x.x and 192.168.x.x can be used freely inside homes and companies, but they never appear on the public internet. 127.0.0.1 always means this computer itself. If you see 169.254.x.x, your device could not get an address from the network.",
      "Every IPv4 packet starts with a header that holds the source and destination addresses, plus a few other fields. The most famous is the TTL (time to live): a counter that drops by one at every router, so a lost packet cannot circle the internet forever.",
    ],
    deepDive: [
      {
        heading: "Decimal and binary, quickly",
        body: "Each octet has 8 bit positions with values 128, 64, 32, 16, 8, 4, 2 and 1. To convert a decimal number to binary, go left to right: if the value fits, write 1 and subtract it; otherwise write 0. For 172: 128 fits (44 left), 64 does not, 32 fits (12 left), 16 does not, 8 fits (4 left), 4 fits (0 left), then 0 and 0. So 172 is 10101100.\n\nTo go back, add up the values where there is a 1. Learn a few patterns by heart, because they appear in every subnet mask: 10000000 = 128, 11000000 = 192, 11100000 = 224, 11110000 = 240, 11111000 = 248, 11111100 = 252, 11111110 = 254 and 11111111 = 255. With these, most subnetting becomes simple arithmetic.",
        bullets: ["Bit values: 128 64 32 16 8 4 2 1", "172 = 10101100, 10 = 00001010", "Mask octets: 128, 192, 224, 240, 248, 252, 254, 255", "An octet is 0 to 255 because 8 bits give 256 values"],
      },
      {
        heading: "Network part, host part and the AND operation",
        body: "A host finds its own network by doing a bitwise AND between its address and its subnet mask: a bit is 1 in the result only if it is 1 in both. Because the mask is all 1s for network bits and all 0s for host bits, the AND keeps the network part and zeroes the host part.\n\nFor 192.168.1.10/24, the mask 255.255.255.0 keeps the first three octets, giving the network 192.168.1.0. Before sending any packet, a host ANDs the destination with its own mask too. If the result matches its own network, the destination is local and it sends directly using ARP. If not, it sends the packet to its default gateway. Every routing decision on a host starts with this one test.",
        visual: {
          type: "flow",
          title: "Is 192.168.1.200 local to 192.168.1.10/24?",
          steps: [
            { label: "Own network", detail: "192.168.1.10 AND 255.255.255.0 = 192.168.1.0" },
            { label: "Destination network", detail: "192.168.1.200 AND 255.255.255.0 = 192.168.1.0" },
            { label: "Compare", detail: "Same result: the destination is local" },
            { label: "Deliver", detail: "ARP for 192.168.1.200 and send directly" },
          ],
        },
      },
      {
        heading: "Classes, and the special ranges you must recognise",
        body: "Before 1993, addresses were split into fixed classes by their first octet: class A (1 to 126) with a /8 network, class B (128 to 191) with /16, class C (192 to 223) with /24, class D (224 to 239) for multicast and class E (240 to 255) reserved. CIDR replaced classes, but people still say class C for a /24.\n\nBeyond the private ranges, learn these. 0.0.0.0 means this host or any address, and 0.0.0.0/0 is the default route. 255.255.255.255 is the limited broadcast, which never crosses a router. 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24 are reserved for documentation, so use them in examples instead of real addresses. 100.64.0.0/10 is shared space for carrier-grade NAT inside ISPs.",
        bullets: ["0.0.0.0/0: default route; 0.0.0.0 in a listen address means all interfaces", "255.255.255.255: limited broadcast", "192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24: documentation", "224.0.0.0/4 multicast, 240.0.0.0/4 reserved"],
      },
      {
        heading: "The IPv4 header field by field",
        body: "The header is at least 20 bytes. Version is 4. IHL (header length) counts 32-bit words, so 5 means 20 bytes and the maximum, 15, means 60. DSCP and ECN carry priority and congestion marks. Total Length is the whole packet size, up to 65,535 bytes. Identification, Flags and Fragment Offset handle fragmentation; the DF (don't fragment) flag forbids routers from splitting the packet, and MF (more fragments) marks all fragments but the last.\n\nTTL starts at 64 on Linux and macOS, 128 on Windows and 255 on many routers, and each router subtracts one. Protocol names the payload: 1 ICMP, 6 TCP, 17 UDP, 47 GRE, 50 ESP. The header checksum covers only the header and is recomputed at every hop because TTL changes. Then come the 4-byte source and destination addresses and any options.",
        visual: {
          type: "layers",
          title: "IPv4 header, 32-bit row by row",
          layers: [
            { label: "Row 1", detail: "Version 4, IHL 4, DSCP 6, ECN 2, Total Length 16 bits" },
            { label: "Row 2", detail: "Identification 16, Flags 3, Fragment Offset 13 bits" },
            { label: "Row 3", detail: "TTL 8, Protocol 8, Header Checksum 16 bits" },
            { label: "Row 4", detail: "Source address, 32 bits" },
            { label: "Row 5", detail: "Destination address, 32 bits" },
            { label: "Options", detail: "0 to 40 bytes, rarely used" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where an address can be used",
        columns: [
          { title: "Public", points: ["Unique on the whole internet", "Assigned by ISPs and registries", "Example: 8.8.8.8", "Reachable from anywhere if allowed"] },
          { title: "Private (RFC 1918)", points: ["Reused in millions of networks", "10/8, 172.16/12, 192.168/16", "Needs NAT to reach the internet", "Dropped by ISPs if leaked"] },
          { title: "Link-local and loopback", points: ["Never leave the link or host", "169.254.0.0/16 self-assigned", "127.0.0.0/8 is this machine", "Not routed at all"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reading an IPv4 header in tcpdump",
        explanation: "Run tcpdump with -v while pinging 1.1.1.1. A reply line shows: tos 0x0, ttl 57, id 0, offset 0, flags [none], proto ICMP (1), length 84. Step 1: length 84 is 20 bytes of IP header plus 64 bytes of ICMP (8 header + 56 data, ping's default). Step 2: proto 1 is ICMP. Step 3: ttl 57 suggests the server started at 64 and the reply crossed 7 routers. Step 4: on your outgoing request, flags [DF] shows Linux set don't fragment, which it does for path MTU discovery.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i any -nn -v -c 4 icmp &\nping -c 2 1.1.1.1\n# IP (tos 0x0, ttl 64, id 4242, offset 0, flags [DF], proto ICMP (1), length 84)\n#     10.0.0.5 > 1.1.1.1: ICMP echo request, id 7, seq 1, length 64",
        },
      },
      {
        title: "Converting and ANDing by hand, checked in the shell",
        explanation: "Is 172.20.33.9 in the same /20 network as 172.20.40.1? Step 1: only the third octet is interesting, because a /20 mask is 255.255.240.0. Step 2: 33 is 00100001 and 40 is 00101000. Step 3: AND each with 240 (11110000): both give 00100000 = 32. Step 4: both are in 172.20.32.0/20, so they are on the same subnet. The shell can check the binary for you.",
        code: {
          lang: "bash",
          code: "for n in 33 40 240; do echo \"$n = $(echo \"obase=2; $n\" | bc)\"; done\necho $(( 33 & 240 )) $(( 40 & 240 ))   # 32 32 -> same /20\nipcalc 172.20.33.9/20 | grep -E 'Network|HostMin|HostMax'",
        },
      },
    ],
    cheatSheet: [
      "Bit values per octet: 128 64 32 16 8 4 2 1",
      "Private: 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31), 192.168.0.0/16",
      "169.254.x.x = DHCP failed; 127.0.0.1 = loopback; 100.64.0.0/10 = carrier-grade NAT",
      "Network address = IP AND mask",
      "Default TTL: Linux 64, Windows 128, many routers 255",
      "IP protocol numbers: ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, OSPF 89",
      "Use 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24 in docs and examples",
    ],
    quiz: [
      {
        q: "What is 11100000 in decimal?",
        options: ["192", "240", "224", "248"],
        answer: 2,
        why: "128 + 64 + 32 = 224.",
      },
      {
        q: "Which address is NOT private?",
        options: ["172.32.1.1", "10.200.1.1", "172.31.255.1", "192.168.0.1"],
        answer: 0,
        why: "172.16.0.0/12 ends at 172.31.255.255, so 172.32.1.1 is public.",
      },
      {
        q: "An IPv4 header has IHL = 6. How long is the header?",
        options: ["6 bytes", "20 bytes", "36 bytes", "24 bytes"],
        answer: 3,
        why: "IHL counts 4-byte words, so 6 x 4 = 24 bytes (20 plus 4 bytes of options).",
      },
      {
        q: "A packet's Protocol field is 17. What is inside?",
        options: ["TCP", "UDP", "ICMP", "OSPF"],
        answer: 1,
        why: "IP protocol number 17 is UDP; TCP is 6 and ICMP is 1.",
      },
      {
        q: "Why is the IPv4 header checksum recalculated at every router?",
        options: ["Routers change the TTL, so the header changes", "The payload changes", "To encrypt the packet", "Because the MAC address changes"],
        answer: 0,
        why: "Decrementing TTL modifies the header, and the checksum covers the header only.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Convert 10.172.3.200 to binary and convert 11000000.10101000.00001010.11111110 back to decimal.",
        hint: "Use the place values 128 64 32 16 8 4 2 1 for each octet.",
        solution: "10  = 00001010\n172 = 10101100\n3   = 00000011\n200 = 11001000\n-> 00001010.10101100.00000011.11001000\n11000000.10101000.00001010.11111110 = 192.168.10.254",
      },
      {
        level: "medium",
        task: "For each address, say what kind it is: 100.72.4.9, 169.254.12.7, 203.0.113.50, 172.15.0.1, 239.255.255.250.",
        hint: "Compare each with the special-range list, watching the edges of 172.16.0.0/12.",
        solution: "100.72.4.9      carrier-grade NAT shared space (100.64.0.0/10)\n169.254.12.7    link-local, self-assigned after DHCP failure\n203.0.113.50    documentation range TEST-NET-3\n172.15.0.1      public (private range starts at 172.16)\n239.255.255.250 multicast (used by SSDP/UPnP)",
      },
      {
        level: "hard",
        task: "Write a Python function that returns True if two IPv4 addresses are on the same subnet for a given prefix length, using only integer bit operations (no ipaddress module).",
        hint: "Turn each address into a 32-bit integer and build the mask with shifts.",
        solution: "def to_int(ip):\n    a, b, c, d = (int(x) for x in ip.split('.'))\n    return (a << 24) | (b << 16) | (c << 8) | d\n\ndef same_subnet(ip1, ip2, prefix):\n    mask = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF\n    return to_int(ip1) & mask == to_int(ip2) & mask\n\nprint(same_subnet('172.20.33.9', '172.20.40.1', 20))  # True\nprint(same_subnet('10.0.0.1', '10.0.1.1', 24))        # False",
      },
    ],
    faq: [
      { q: "Why are there only about 4.3 billion IPv4 addresses?", a: "Because an address is 32 bits, and 2 to the power 32 is 4,294,967,296. Large blocks are also reserved, so even fewer are usable on the internet." },
      { q: "Can two devices have the same IP address?", a: "Not on the same network; that is an IP conflict and both will lose traffic. Private addresses are reused in different networks all the time, because NAT keeps them apart." },
      { q: "What is the difference between 0.0.0.0 and 127.0.0.1?", a: "127.0.0.1 is the loopback address: traffic never leaves your machine. 0.0.0.0 as a server listen address means listen on every interface, and as a route it means any destination." },
    ],
  },

  "net-ip/subnetting-cidr": {
    plain: [
      "Subnetting means cutting one big network into several smaller ones. A company with the network 10.0.0.0/16 does not want all 65,000 possible devices in one giant broadcast domain. It cuts it into pieces: one subnet per floor, per department or per VLAN.",
      "The number after the slash, the prefix length, controls the size. A bigger number means a smaller subnet. /24 holds 256 addresses, /25 holds 128, /26 holds 64, and so on: every extra bit halves the size.",
      "Each subnet has a first address (the network address, which names the subnet) and a last address (the broadcast address, which reaches every host in it). Neither can be given to a device. Everything in between is usable: a /24 has 254 usable addresses, a /26 has 62.",
      "With a little practice you can solve any subnet question in your head in under a minute. The trick is the block size: 256 minus the interesting number in the mask. Subnets always start on a multiple of the block size, so finding the right one becomes simple counting.",
    ],
    deepDive: [
      {
        heading: "The prefix-to-mask table you should memorise",
        body: "A prefix length is just a count of 1 bits from the left. /24 is 24 ones, which is 255.255.255.0. Inside the last partly filled octet, the mask value depends on how many of its 8 bits are 1s: 1 bit = 128, 2 = 192, 3 = 224, 4 = 240, 5 = 248, 6 = 252, 7 = 254, 8 = 255.\n\nSo /26 is 255.255.255.192, /20 is 255.255.240.0 and /12 is 255.240.0.0. The total number of addresses is 2 to the power of the host bits (32 minus the prefix): a /20 has 12 host bits, so 4,096 addresses and 4,094 usable hosts. Knowing that /24 = 256, /16 = 65,536 and /8 = 16,777,216 lets you estimate any size quickly.",
        bullets: ["/25 .128 (128), /26 .192 (64), /27 .224 (32)", "/28 .240 (16), /29 .248 (8), /30 .252 (4)", "/31 .254 (2, point-to-point only), /32 .255 (1 host)", "/20 = 255.255.240.0 = 4,096 addresses", "/22 = 255.255.252.0 = 1,024 addresses"],
      },
      {
        heading: "The block-size method, step by step",
        body: "Find the interesting octet: the one where the mask is neither 255 nor 0. Subtract that mask value from 256 to get the block size. Subnets start at 0 and every multiple of the block size in that octet. Find the multiple at or just below the address's value: that is the network. The next multiple minus one is the broadcast. Octets to the left are copied; octets to the right become 0 for the network and 255 for the broadcast.\n\nExample: 172.16.45.200/20. The mask is 255.255.240.0, so the third octet is interesting and the block is 256 - 240 = 16. Multiples of 16 around 45 are 32 and 48. Network: 172.16.32.0. Broadcast: 172.16.47.255. Hosts: 172.16.32.1 to 172.16.47.254, which is 4,094 hosts.",
        visual: {
          type: "flow",
          title: "Solving 172.16.45.200/20",
          steps: [
            { label: "Mask", detail: "/20 = 255.255.240.0; third octet is interesting" },
            { label: "Block size", detail: "256 - 240 = 16" },
            { label: "Find multiple", detail: "45 lies between 32 and 48" },
            { label: "Network", detail: "172.16.32.0" },
            { label: "Broadcast", detail: "172.16.47.255" },
            { label: "Hosts", detail: ".32.1 to .47.254, 4,094 usable" },
          ],
        },
      },
      {
        heading: "Splitting a network into equal subnets",
        body: "To split a network into N equal subnets, borrow enough bits that 2 to the power of borrowed bits is at least N. To make 6 subnets from 10.0.0.0/24 you need 3 bits (2 to the 3 = 8, since 2 bits only give 4), so each subnet is /27 with 32 addresses: 10.0.0.0, .32, .64, .96, .128, .160, .192 and .224. You get 8 subnets and keep 2 spare.\n\nWork it the other way when you know the host count. For 500 hosts per subnet you need 9 host bits (512 - 2 = 510 usable), so each subnet is /23. From 10.0.0.0/16 that gives 128 subnets of /23: 10.0.0.0, 10.0.2.0, 10.0.4.0 and so on, each spanning two values of the third octet.",
        bullets: ["Subnets from borrowing b bits = 2^b", "Usable hosts with h host bits = 2^h - 2", "6 subnets need 3 bits; 500 hosts need 9 host bits", "A /23 spans two /24s: 10.0.4.0 to 10.0.5.255"],
      },
      {
        heading: "Real-world details: wildcards, /31 and cloud subnets",
        body: "Cisco ACLs and OSPF use wildcard masks, the inverse of the subnet mask: subtract each octet from 255. A /26 mask 255.255.255.192 has wildcard 0.0.0.63, and a /20 has 0.0.15.255. A 0 bit means must match, a 1 bit means any value.\n\nThe minus 2 rule has exceptions. A /31 has no network or broadcast address, so both addresses are usable on a point-to-point link (RFC 3021). A /32 identifies exactly one host and is used for loopbacks and host routes. Cloud platforms take more: AWS and Azure reserve 5 addresses in every subnet (the network address, the next three for the router, DNS and future use, and the last), so a /28 in AWS gives 11 usable addresses, not 14.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Halving 192.168.50.0/24 bit by bit",
        root: "192.168.50.0/24 (256)",
        children: [
          { label: "192.168.50.0/25 (128)", children: ["192.168.50.0/26 (64)", "192.168.50.64/26 (64)"] },
          { label: "192.168.50.128/25 (128)", children: ["192.168.50.128/26 (64)", "192.168.50.192/26: .192/27 and .224/27"] },
        ],
      },
    ],
    examples: [
      {
        title: "Solving a /27 in your head",
        explanation: "Question: 10.40.7.99/27. Step 1: /27 means the last octet is interesting, with mask 224. Step 2: block size 256 - 224 = 32. Step 3: multiples of 32 are 0, 32, 64, 96, 128; 99 sits between 96 and 128. Step 4: network 10.40.7.96, broadcast 10.40.7.127. Step 5: hosts 10.40.7.97 to 10.40.7.126, which is 30 usable. Step 6: the gateway is usually the first host, 10.40.7.97. Check your answer with ipcalc.",
        code: {
          lang: "bash",
          code: "ipcalc 10.40.7.99/27\n# Network:   10.40.7.96/27\n# Broadcast: 10.40.7.127\n# HostMin:   10.40.7.97\n# HostMax:   10.40.7.126\n# Hosts/Net: 30",
        },
      },
      {
        title: "Do these two hosts share a subnet?",
        explanation: "Host A is 192.168.4.70/26 and host B is 192.168.4.130/26; they cannot ping each other directly. Step 1: block size is 64, so the subnets are .0, .64, .128 and .192. Step 2: A at .70 is in 192.168.4.64/26 (broadcast .127). Step 3: B at .130 is in 192.168.4.128/26. Step 4: different subnets, so they need a router between them. If someone set B to /24 by mistake, B would think A is local and ARP for it directly, while A sends replies to its gateway: a classic one-way mask problem.",
      },
    ],
    cheatSheet: [
      "Block size = 256 - mask value in the interesting octet",
      "Addresses = 2^(32 - prefix); usable hosts = that minus 2 (up to /30)",
      "/26 = .192 = 64; /27 = .224 = 32; /28 = .240 = 16; /29 = .248 = 8; /30 = .252 = 4",
      "/20 = 255.255.240.0 (4,096); /22 = 255.255.252.0 (1,024); /23 = 255.255.254.0 (512)",
      "Wildcard mask = 255.255.255.255 minus the subnet mask (/26 = 0.0.0.63)",
      "/31 for point-to-point (2 usable), /32 for a single host",
      "AWS and Azure reserve 5 addresses per subnet: a /24 gives 251 usable",
    ],
    quiz: [
      {
        q: "What is the broadcast address of 172.16.45.200/20?",
        options: ["172.16.45.255", "172.16.63.255", "172.16.32.255", "172.16.47.255"],
        answer: 3,
        why: "Block size 16 in the third octet puts .45 in 32 to 47, so the broadcast is 172.16.47.255.",
      },
      {
        q: "You need at least 12 equal subnets from 10.1.0.0/16. What prefix do you use?",
        options: ["/20", "/19", "/18", "/28"],
        answer: 0,
        why: "12 subnets need 4 borrowed bits (2^4 = 16), so /16 + 4 = /20.",
      },
      {
        q: "What is the smallest subnet that fits 120 hosts?",
        options: ["/26", "/25", "/24", "/27"],
        answer: 1,
        why: "/25 gives 126 usable hosts; /26 gives only 62.",
      },
      {
        q: "What is the wildcard mask for a /22?",
        options: ["0.0.0.255", "255.255.252.0", "0.0.3.255", "0.0.7.255"],
        answer: 2,
        why: "The /22 mask is 255.255.252.0, and 255 - 252 = 3, so the wildcard is 0.0.3.255.",
      },
      {
        q: "Which address is a usable host in 192.168.9.0/29?",
        options: ["192.168.9.0", "192.168.9.6", "192.168.9.7", "192.168.9.8"],
        answer: 1,
        why: "A /29 at .0 runs .0 to .7; .0 is the network, .7 the broadcast, and .8 starts the next subnet.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the network, broadcast, host range and host count for 192.168.200.37/28.",
        hint: "Block size is 256 - 240.",
        solution: "Block size 16: subnets .0, .16, .32, .48\n37 is in .32 to .47\nNetwork:   192.168.200.32\nBroadcast: 192.168.200.47\nHosts:     .33 to .46\nCount:     14 usable",
      },
      {
        level: "medium",
        task: "Split 10.20.0.0/22 into 8 equal subnets and list each network address with its prefix.",
        hint: "8 subnets need 3 borrowed bits, so each is /25.",
        solution: "/22 + 3 = /25 (128 addresses each)\n10.20.0.0/25    10.20.0.128/25\n10.20.1.0/25    10.20.1.128/25\n10.20.2.0/25    10.20.2.128/25\n10.20.3.0/25    10.20.3.128/25",
      },
      {
        level: "hard",
        task: "Write a bash script that takes an address and prefix (like 10.40.7.99 27) and prints the network and broadcast addresses using only shell arithmetic.",
        hint: "Convert to a 32-bit integer, AND with the mask for the network, OR with the inverted mask for the broadcast.",
        solution: "#!/usr/bin/env bash\nIFS=. read -r a b c d <<< \"$1\"; p=$2\nip=$(( (a<<24) | (b<<16) | (c<<8) | d ))\nmask=$(( (0xFFFFFFFF << (32-p)) & 0xFFFFFFFF ))\nnet=$(( ip & mask )); bc=$(( net | (~mask & 0xFFFFFFFF) ))\nq() { echo \"$(( $1>>24 & 255 )).$(( $1>>16 & 255 )).$(( $1>>8 & 255 )).$(( $1 & 255 ))\"; }\necho \"network   $(q $net)/$p\"\necho \"broadcast $(q $bc)\"",
      },
    ],
    faq: [
      { q: "What does CIDR mean?", a: "Classless Inter-Domain Routing. It replaced the old fixed classes (A, B, C) with prefixes of any length, written as /n, so networks can be sized to fit." },
      { q: "Why subtract 2 from the host count?", a: "The first address names the subnet and the last is its broadcast address, so neither can be assigned to a device. The exceptions are /31 and /32." },
      { q: "How do I get fast at subnetting?", a: "Memorise the mask values (128 to 255) and their block sizes, then practise random questions daily. Most people get under a minute per question within a week or two." },
      { q: "Is 255.255.255.0 the same as /24?", a: "Yes. The mask is just the prefix written out in dotted decimal: 24 one-bits followed by 8 zero-bits." },
    ],
  },

  "net-ip/vlsm": {
    plain: [
      "If every subnet had the same size, you would waste lots of addresses. A link between two routers needs 2 addresses, but a staff floor might need 300. Giving both a /23 would throw away hundreds of addresses on the link.",
      "VLSM (variable-length subnet masking) means using different prefix lengths inside one block of addresses. Each subnet gets the smallest size that fits its hosts, plus some room to grow.",
      "The method is like packing a suitcase: big items first. Sort your subnets from largest to smallest, give the largest one the first block, then place each next one right after the previous. Because every subnet must start on a multiple of its own size, packing big first leaves no awkward gaps.",
      "A good plan also makes routing simpler. If all the subnets of one site sit inside one bigger block, other routers can reach the whole site with a single route, called a summary route. A messy plan needs many routes and is harder to secure.",
    ],
    deepDive: [
      {
        heading: "Sizing each subnet",
        body: "For each segment, take the number of hosts you need now, add growth (often 25 to 50 percent), and remember the gateway counts as a host too. Then find the smallest power of two that is at least hosts + 2. For 300 hosts, 512 is the next power of two, so a /23 (510 usable). For 120 hosts, 128 is enough: /25 (126 usable). For 25 hosts: /27 (30 usable).\n\nWatch the edges. 62 hosts fit a /26 exactly, but 63 do not, and that one extra device forces you to double the subnet. If a segment is right at the limit, choose the next size now; renumbering a live subnet later means changing every static address, DHCP scope, firewall rule and DNS record that mentions it.",
        bullets: ["Needed block = smallest 2^h with 2^h - 2 at least hosts", "300 hosts: /23, 120: /25, 60: /26, 25: /27, 10: /28", "Count the gateway, printers and future devices", "Point-to-point links: /30 or /31"],
      },
      {
        heading: "Allocating largest first, on aligned boundaries",
        body: "A subnet must start on a multiple of its block size. A /26 can start at .0, .64, .128 or .192, never at .32. If you place a small /27 at .0 first, the next /25 cannot start at .32; it must jump to .128, leaving a gap from .32 to .127 that only small subnets can fill.\n\nPlacing the largest first avoids that. Take 10.20.0.0/22 with needs of 300, 120, 60 and 25 hosts plus two router links. The 300-host /23 takes 10.20.0.0 to 10.20.1.255. The 120-host /25 takes 10.20.2.0. The 60-host /26 takes 10.20.2.128. The 25-host /27 takes 10.20.2.192. Two /30 links take 10.20.2.224 and 10.20.2.228. Everything from 10.20.2.232 to 10.20.3.255 stays free and contiguous for growth.",
        visual: {
          type: "flow",
          title: "Packing 10.20.0.0/22, largest first",
          steps: [
            { label: "300 hosts: /23", detail: "10.20.0.0 to 10.20.1.255" },
            { label: "120 hosts: /25", detail: "10.20.2.0 to 10.20.2.127" },
            { label: "60 hosts: /26", detail: "10.20.2.128 to 10.20.2.191" },
            { label: "25 hosts: /27", detail: "10.20.2.192 to 10.20.2.223" },
            { label: "2 links: /30 each", detail: "10.20.2.224 and 10.20.2.228" },
            { label: "Free", detail: "10.20.2.232 to 10.20.3.255" },
          ],
        },
      },
      {
        heading: "/30 versus /31 for router links",
        body: "A link between two routers needs exactly two addresses. A /30 gives 4 addresses: network, two usable and broadcast, so half are wasted. RFC 3021 allows /31 on point-to-point links: both addresses are usable because a link with two ends needs no broadcast. Cisco IOS, Juniper and Linux all support it, and large networks with thousands of links save a lot of space.\n\nThe trade-off is familiarity. Some older devices, monitoring tools and staff expect /30, and on a /31 the first address ends in an even number, which surprises people. Whichever you choose, keep all link subnets together in one reserved block, for example the top /26 of the site range, so they are easy to find and to filter.",
      },
      {
        heading: "Summarising routes into supernets",
        body: "Summarisation (or supernetting) replaces many specific routes with one shorter prefix that covers them all. To find it, write the networks in binary and count how many leading bits they share. 172.16.4.0/24 to 172.16.7.0/24 have third octets 00000100 to 00000111; the first 6 bits match, so the common prefix is 16 + 6 = 22 bits: 172.16.4.0/22.\n\nA summary only works cleanly when the block is aligned and complete. 172.16.5.0 to 172.16.8.0 cannot be one /22, because a /22 must start on a multiple of 4 in the third octet. A summary that is too broad can also attract traffic for subnets that do not exist at that site, so routers usually add a discard route (a route to null0) for the summary to drop such traffic instead of looping it.",
        visual: {
          type: "tree",
          title: "One summary covers four site subnets",
          root: "172.16.4.0/22 advertised to the core",
          children: [
            { label: "172.16.4.0/24", children: ["Staff"] },
            { label: "172.16.5.0/24", children: ["Voice"] },
            { label: "172.16.6.0/24", children: ["Servers"] },
            { label: "172.16.7.0/24", children: ["Guests and links"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Fixed-size subnets versus VLSM for the same needs",
        columns: [
          { title: "Fixed /23 for everything", points: ["6 segments x 512 = 3,072 addresses", "Needs a /20 to hold them", "Router links waste 510 each", "Simple but wasteful"] },
          { title: "VLSM", points: ["/23 + /25 + /26 + /27 + 2 x /30", "Fits inside one /22", "Links use 4 addresses each", "Room left to grow"] },
        ],
      },
    ],
    examples: [
      {
        title: "Planning a branch office in 10.50.8.0/21",
        explanation: "Needs: staff 400, Wi-Fi guests 200, voice 100, servers 40, management 20, and 4 router links. Step 1: size them: 400 needs /23 (510), 200 needs /24 (254), 100 needs /25 (126), 40 needs /26 (62), 20 needs /27 (30), links /31. Step 2: allocate in order: staff 10.50.8.0/23, guests 10.50.10.0/24, voice 10.50.11.0/25, servers 10.50.11.128/26, management 10.50.11.192/27, links 10.50.11.224/31, .226/31, .228/31 and .230/31. Step 3: everything from 10.50.12.0 to 10.50.15.255 (a whole /22) stays free. Step 4: the branch advertises one summary, 10.50.8.0/21.",
      },
      {
        title: "Checking a plan for overlaps with Python",
        explanation: "Overlapping subnets cause strange half-working routing, so check every plan before using it. Step 1: list each subnet. Step 2: compare every pair with overlaps(). Step 3: confirm each subnet sits inside the site block with subnet_of(). Here a typo put the voice subnet at 10.50.10.128/25, inside the guest /24, and the script catches it.",
        code: {
          lang: "python",
          code: "import ipaddress as ip\nfrom itertools import combinations\n\nsite = ip.ip_network('10.50.8.0/21')\nplan = {'staff': '10.50.8.0/23', 'guests': '10.50.10.0/24',\n        'voice': '10.50.10.128/25', 'servers': '10.50.11.128/26'}\nnets = {k: ip.ip_network(v) for k, v in plan.items()}\nfor (a, x), (b, y) in combinations(nets.items(), 2):\n    if x.overlaps(y):\n        print(f'OVERLAP: {a} {x} and {b} {y}')\nprint(all(n.subnet_of(site) for n in nets.values()))",
        },
      },
    ],
    cheatSheet: [
      "Sort segments by size, allocate largest first, each on a multiple of its block",
      "Block for h hosts: smallest 2^n with 2^n - 2 at least h",
      "/31 on router links saves half the space of /30 (RFC 3021)",
      "Summary = count the leading bits all networks share",
      "172.16.4.0/24 to 172.16.7.0/24 summarise to 172.16.4.0/22",
      "A /22 must start on a multiple of 4 in the third octet",
      "Keep link and loopback ranges in their own reserved block",
    ],
    quiz: [
      {
        q: "Which subnet is correctly aligned?",
        options: ["10.0.0.32/26", "10.0.0.64/25", "10.0.0.96/27", "10.0.0.16/27"],
        answer: 2,
        why: "A /27 must start on a multiple of 32, and 96 is one; /26 needs multiples of 64 and /25 of 128.",
      },
      {
        q: "What single prefix summarises 192.168.16.0/24 through 192.168.23.0/24?",
        options: ["192.168.16.0/21", "192.168.16.0/22", "192.168.0.0/19", "192.168.16.0/20"],
        answer: 0,
        why: "Eight /24s starting at 16 (a multiple of 8) form one /21.",
      },
      {
        q: "Why allocate the largest subnets first?",
        options: ["Routers require it", "Small subnets cannot be summarised", "DHCP needs it", "Large blocks need big aligned boundaries, so placing them first avoids gaps"],
        answer: 3,
        why: "Small subnets placed first push big ones up to the next aligned boundary, wasting space.",
      },
      {
        q: "How many usable addresses does a /31 give on a point-to-point link?",
        options: ["0", "2", "1", "4"],
        answer: 1,
        why: "RFC 3021 lets both addresses of a /31 be used, since a two-ended link needs no broadcast.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Choose the smallest prefix for each segment: 500 hosts, 90 hosts, 30 hosts, 14 hosts, 2 hosts.",
        hint: "Remember to subtract 2 from each block size.",
        solution: "500 hosts -> /23 (510 usable)\n90 hosts  -> /25 (126 usable)\n30 hosts  -> /27 (30 usable, exactly full; consider /26)\n14 hosts  -> /28 (14 usable, exactly full; consider /27)\n2 hosts   -> /30 (2 usable) or /31 on a point-to-point link",
      },
      {
        level: "medium",
        task: "Using 192.168.40.0/24, allocate subnets for 100, 50, 25 and 10 hosts and two /30 links, largest first. List what is left free.",
        hint: "Sizes are /25, /26, /27, /28, /30, /30.",
        solution: "100 hosts: 192.168.40.0/25    (.0 to .127)\n50 hosts:  192.168.40.128/26  (.128 to .191)\n25 hosts:  192.168.40.192/27  (.192 to .223)\n10 hosts:  192.168.40.224/28  (.224 to .239)\nLink 1:    192.168.40.240/30\nLink 2:    192.168.40.244/30\nFree:      192.168.40.248/29  (.248 to .255)",
      },
      {
        level: "hard",
        task: "A router has routes for 10.8.32.0/24, 10.8.33.0/24, 10.8.34.0/24 and 10.8.36.0/24. What is the tightest single summary, and what problem does it cause? Propose a better option.",
        hint: "Write 32, 33, 34 and 36 in binary and look for shared leading bits.",
        solution: "32 = 00100000, 33 = 00100001, 34 = 00100010, 36 = 00100100\nShared leading bits in the third octet: 00100 (5 bits)\nSummary: 10.8.32.0/21 (covers 10.8.32.0 to 10.8.39.255)\nProblem: it also claims 35, 37, 38 and 39, which are not there.\nBetter: advertise 10.8.32.0/23 + 10.8.34.0/24 + 10.8.36.0/24,\nor use the /21 with a discard route (to null0) for the summary\nso traffic for missing subnets is dropped, not looped.",
      },
    ],
    faq: [
      { q: "Is VLSM still relevant in the cloud?", a: "Yes. When you split a VPC CIDR into subnets across availability zones, you are doing VLSM. Planning it well prevents running out of addresses or overlapping with on-premises networks you later connect via VPN." },
      { q: "Should I use /30 or /31 for router links?", a: "Use /31 if all your devices and tools support it, since it saves half the space. Use /30 if you have older equipment or want to match an existing convention." },
      { q: "How much room for growth should I leave?", a: "A common rule is to size for at least 25 to 50 percent more hosts than today and to keep a large free block per site. Address space inside private ranges is cheap; renumbering is expensive." },
    ],
  },

  "net-ip/ipv6": {
    plain: [
      "IPv6 is the newer version of the Internet Protocol. Its main purpose is simple: IPv4 ran out of addresses. An IPv6 address is 128 bits long, which gives so many addresses that every device can have its own public one, with no need for NAT.",
      "Addresses are written as eight groups of four hexadecimal digits, separated by colons, like 2001:0db8:0000:0000:0000:0000:0000:0001. That is long, so there are two shortening rules: drop leading zeros in each group, and replace one run of all-zero groups with ::. The example becomes 2001:db8::1.",
      "Every IPv6 interface has several addresses at once. A link-local address starting with fe80 is always there and only works on the local link. A global address, usually starting with 2 or 3, works on the internet. Many networks also use unique local addresses starting with fd, like private addresses in IPv4.",
      "Devices can set up their own address without a DHCP server. The router announces the network prefix, and each device builds the rest of the address itself. This is called SLAAC. Networks can also use DHCPv6 if they want central control.",
    ],
    deepDive: [
      {
        heading: "Writing addresses: the exact rules",
        body: "An IPv6 address is 8 groups (hextets) of 16 bits. RFC 5952 sets the canonical form. Write hex digits in lowercase. Drop leading zeros in each group, so 0db8 becomes db8 and 0000 becomes 0. Replace the longest run of two or more all-zero groups with ::, and if two runs tie, shorten the first. Never use :: for a single zero group, and never use :: twice, because then nobody could tell how many zeros each one hides.\n\nTo expand an address, do the reverse: count the groups present, fill :: with enough 0000 groups to make 8, and pad each group to 4 digits. For example 2001:db8:0:a::1 has 5 groups, so :: stands for 3: 2001:0db8:0000:000a:0000:0000:0000:0001. In URLs, put the address in brackets: http://[2001:db8::1]:8080/.",
        bullets: ["2001:0DB8:0000:0000:0001:0000:0000:0001 -> 2001:db8::1:0:0:1", "Longest zero run wins; on a tie, the first one", ":: only once per address", "URLs need brackets: [2001:db8::1]:443"],
      },
      {
        heading: "Address types and well-known prefixes",
        body: "IPv6 has no broadcast. It uses unicast, multicast and anycast instead. Unicast types include ::1 (loopback), :: (unspecified, used before a host has an address), fe80::/10 (link-local, on every interface, never routed), fc00::/7 (unique local; in practice fd00::/8 followed by a random 40-bit ID) and 2000::/3 (global unicast, today's public internet space). 2001:db8::/32 is reserved for documentation.\n\nMulticast starts with ff. ff02::1 reaches all nodes on the link, ff02::2 all routers, and ff02::1:ff00:0/104 is the solicited-node range used by Neighbour Discovery. Because link-local addresses exist on every interface, the same fe80 address can appear on several links, so you must name the interface: ping fe80::1%eth0.",
        visual: {
          type: "tree",
          title: "IPv6 address types",
          root: "IPv6 addresses",
          children: [
            { label: "Global unicast 2000::/3", children: ["Public, routable", "Usually from your ISP's prefix"] },
            { label: "Unique local fc00::/7", children: ["fd00::/8 in practice", "Internal only, like RFC 1918"] },
            { label: "Link-local fe80::/10", children: ["On every interface", "Needs a zone: fe80::1%eth0"] },
            { label: "Multicast ff00::/8", children: ["ff02::1 all nodes", "ff02::2 all routers"] },
            { label: "Special", children: ["::1 loopback", ":: unspecified", "2001:db8::/32 documentation"] },
          ],
        },
      },
      {
        heading: "Planning with /48, /56 and /64",
        body: "IPv6 planning is about subnets, not hosts. Every LAN gets a /64: 64 bits of prefix and 64 bits of interface ID. A /64 holds about 18 quintillion addresses, so you never size a LAN by host count, and SLAAC requires exactly /64. Sites usually receive a /48 (65,536 subnets of /64) or a /56 (256 subnets), often by DHCPv6 prefix delegation from the ISP.\n\nWith a /48 such as 2001:db8:abcd::/48, the fourth hextet is yours: 2001:db8:abcd:0010::/64, 2001:db8:abcd:0020::/64 and so on. Plan on nibble (4-bit, one hex digit) boundaries so addresses stay readable, for example the first digit for the building and the next for the VLAN. You can even embed the VLAN number: VLAN 20 becomes 2001:db8:abcd:20::/64. Router links can use /127 (RFC 6164) and loopbacks /128.",
        bullets: ["LAN: always /64", "/48 = 65,536 LANs; /56 = 256 LANs", "Plan on hex-digit (nibble) boundaries", "Point-to-point: /127; loopback: /128"],
      },
      {
        heading: "SLAAC, privacy addresses and DHCPv6",
        body: "Routers send Router Advertisements (RAs) to ff02::1 every few minutes, or when a host asks with a Router Solicitation. An RA carries the prefix, the router's link-local address as the default gateway, and flags. If the prefix has the A (autonomous) flag, hosts build their own address: the /64 prefix plus a 64-bit interface ID, then run Duplicate Address Detection before using it.\n\nThe interface ID used to come from the MAC (EUI-64: split the MAC, insert fffe, flip the U/L bit), but that let sites track a device everywhere. Modern systems use a stable random ID per network (RFC 7217) and extra temporary addresses for outgoing connections (RFC 8981). The RA's M flag tells hosts to get addresses from stateful DHCPv6, and the O flag to get other settings, like DNS, from DHCPv6. DNS can also come in the RA itself (the RDNSS option). Android, notably, does not use stateful DHCPv6 for addresses.",
        visual: {
          type: "sequence",
          title: "A host joins an IPv6 LAN with SLAAC",
          actors: ["Host", "Router", "Other hosts"],
          messages: [
            { from: 0, to: 2, label: "DAD: NS for its new fe80:: address" },
            { from: 0, to: 1, label: "Router Solicitation to ff02::2" },
            { from: 1, to: 0, label: "RA: prefix 2001:db8:abcd:20::/64, A flag, gateway" },
            { from: 0, to: 2, label: "DAD: NS for its new global address" },
            { from: 0, to: 1, label: "DAD silent: address valid, traffic flows" },
          ],
        },
      },
      {
        heading: "Header differences from IPv4",
        body: "The IPv6 header is a fixed 40 bytes with only eight fields: version, traffic class (like DSCP), a 20-bit flow label, payload length, next header (like IPv4's protocol field), hop limit (like TTL), and the 16-byte source and destination addresses. There is no header checksum, because link layers and TCP or UDP already check for errors, so routers do less work per packet.\n\nOptions and fragmentation moved into extension headers, chained through the next header field: hop-by-hop options, routing, fragment, and others. Routers never fragment IPv6 packets; only the sender can, after learning the path MTU from ICMPv6 Packet Too Big messages. Every IPv6 link must carry at least 1280 bytes. And UDP checksums, optional in IPv4, are mandatory in IPv6.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Anatomy of 2001:db8:abcd:20:a1b2:c3ff:fed4:e5f6",
        layers: [
          { label: "2001:db8:abcd::/48", detail: "Site prefix from the ISP (48 bits)" },
          { label: ":20", detail: "Subnet ID chosen by you (16 bits), here VLAN 20" },
          { label: "2001:db8:abcd:20::/64", detail: "The LAN prefix announced in RAs" },
          { label: "a1b2:c3ff:fed4:e5f6", detail: "Interface ID (64 bits), random or EUI-64" },
        ],
      },
    ],
    examples: [
      {
        title: "Building an EUI-64 interface ID by hand",
        explanation: "A host with MAC 00:1a:2b:3c:4d:5e uses EUI-64 on prefix 2001:db8:abcd:20::/64. Step 1: split the MAC in the middle: 00:1a:2b | 3c:4d:5e. Step 2: insert ff:fe: 00:1a:2b:ff:fe:3c:4d:5e. Step 3: flip the 7th bit of the first byte (the U/L bit): 00 becomes 02. Step 4: group into hextets: 021a:2bff:fe3c:4d5e. Step 5: add the prefix: 2001:db8:abcd:20:21a:2bff:fe3c:4d5e. The ff:fe in the middle is how you spot EUI-64 addresses in logs. The link-local address uses the same ID: fe80::21a:2bff:fe3c:4d5e.",
      },
      {
        title: "Inspecting what the router is announcing",
        explanation: "A laptop gets no global IPv6 address. Step 1: list addresses; only fe80:: is present, so SLAAC did not happen. Step 2: send a Router Solicitation and print the RA with rdisc6 (from the ndisc6 package). Step 3: if nothing comes back, no router is sending RAs on this VLAN, or a switch is filtering them. Step 4: if an RA comes back but the prefix shows autonomous: no, or a length other than 64, SLAAC is not allowed; fix it on the router. Step 5: check that the firewall allows ICMPv6, since RAs are ICMPv6 type 134.",
        code: {
          lang: "bash",
          code: "ip -6 addr show dev wlan0 scope global\nsudo rdisc6 wlan0\n#  Prefix : 2001:db8:abcd:20::/64\n#   On-link                 :           Yes\n#   Autonomous address conf.:           Yes\n#  Recursive DNS server     : 2001:db8:abcd:20::53\nip -6 route show default",
        },
      },
    ],
    cheatSheet: [
      "Shorten: drop leading zeros, replace the longest run of zero groups with ::, only once",
      "fe80::/10 link-local, fd00::/8 ULA, 2000::/3 global, ff00::/8 multicast",
      "Every LAN is a /64; a /48 gives 65,536 of them and a /56 gives 256",
      "ff02::1 all nodes, ff02::2 all routers; IPv6 has no broadcast",
      "RA flags: A = use SLAAC, M = addresses from DHCPv6, O = other info from DHCPv6",
      "Link-local needs a zone: ping fe80::1%eth0",
      "IPv6 header: 40 bytes fixed, no checksum, minimum link MTU 1280",
    ],
    quiz: [
      {
        q: "What is the canonical (RFC 5952) short form of 2001:0db8:0000:0000:0001:0000:0000:0001?",
        options: ["2001:db8::1::1", "2001:db8:0:0:1::1", "2001:db8::1:0:0:1", "2001:db8:::1:0:0:1"],
        answer: 2,
        why: "Two zero runs of equal length tie, so the first is shortened; :: can appear only once.",
      },
      {
        q: "How many /64 subnets fit in a /56?",
        options: ["256", "64", "65,536", "16"],
        answer: 0,
        why: "64 - 56 = 8 bits, and 2^8 = 256.",
      },
      {
        q: "Which address range is IPv6's equivalent of private RFC 1918 space?",
        options: ["fe80::/10", "2001:db8::/32", "ff00::/8", "fc00::/7"],
        answer: 3,
        why: "Unique local addresses (fc00::/7, used as fd00::/8) are for internal networks.",
      },
      {
        q: "A Router Advertisement has the M flag set. What should hosts do?",
        options: ["Ignore the router", "Get their addresses from a stateful DHCPv6 server", "Disable IPv6", "Use the router's MAC as their address"],
        answer: 1,
        why: "M means managed: addresses come from DHCPv6.",
      },
      {
        q: "Which field from the IPv4 header has no equivalent in the IPv6 base header?",
        options: ["Header checksum", "Hop limit", "Source address", "Payload length"],
        answer: 0,
        why: "IPv6 dropped the header checksum to make forwarding simpler.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Expand 2001:db8:0:a::1 and fd12:3456:789a:1::25 to full 32-digit form.",
        hint: "Count groups, fill :: to make 8, then pad each group to 4 digits.",
        solution: "2001:db8:0:a::1 has 5 groups, so :: = 3 groups\n-> 2001:0db8:0000:000a:0000:0000:0000:0001\nfd12:3456:789a:1::25 has 5 groups, so :: = 3 groups\n-> fd12:3456:789a:0001:0000:0000:0000:0025",
      },
      {
        level: "medium",
        task: "Your site has 2001:db8:4200::/48. Plan /64s for VLANs 10, 20, 30 in building 1 and the same VLANs in building 2, using the subnet ID to show both.",
        hint: "Use the fourth hextet: first digit = building, last two = VLAN.",
        solution: "Fourth hextet = B0VV (B = building, VV = VLAN)\nBuilding 1: 2001:db8:4200:1010::/64  VLAN 10\n            2001:db8:4200:1020::/64  VLAN 20\n            2001:db8:4200:1030::/64  VLAN 30\nBuilding 2: 2001:db8:4200:2010::/64  VLAN 10\n            2001:db8:4200:2020::/64  VLAN 20\n            2001:db8:4200:2030::/64  VLAN 30\nEach building fits in one /52 summary: 2001:db8:4200:1000::/52",
      },
      {
        level: "hard",
        task: "On Linux, find which of your global IPv6 addresses are temporary privacy addresses and which is stable, and show which one is used for outgoing connections to 2606:4700:4700::1111.",
        hint: "ip -6 addr marks temporary addresses; ip -6 route get shows the chosen source.",
        solution: "ip -6 addr show scope global\n# 'temporary dynamic' = privacy address (RFC 8981)\n# 'mngtmpaddr' or 'dynamic' without temporary = stable SLAAC address\nip -6 route get 2606:4700:4700::1111\n# ... src 2001:db8:abcd:20:9f3e:... <- source picked\nsysctl net.ipv6.conf.all.use_tempaddr   # 2 = prefer temporary",
      },
    ],
    faq: [
      { q: "Do I still need NAT with IPv6?", a: "No. Every device can have a global address. A stateful firewall on the router that blocks unsolicited inbound connections gives the same protection people expected from NAT." },
      { q: "Why does my device have so many IPv6 addresses?", a: "Normal: one link-local, one stable global address per prefix, and one or more temporary privacy addresses that rotate, often daily. Each serves a different purpose." },
      { q: "Can I use a /80 or /96 for a LAN to save addresses?", a: "You should not. SLAAC needs a /64, and some features break with longer prefixes. IPv6 has plenty of /64s, so there is nothing to save." },
      { q: "How do I check whether I have working IPv6?", a: "Run ping -6 2606:4700:4700::1111 or curl -6 https://ifconfig.co. If both work, your IPv6 path to the internet works end to end." },
    ],
  },

  "net-ip/icmp": {
    plain: [
      "IP delivers packets on a best-effort basis: it tries, but it does not promise. When something goes wrong along the way, routers and hosts need a way to report it. That is ICMP, the Internet Control Message Protocol. It carries short messages like this network is unreachable or this packet was too big.",
      "You use ICMP every time you run ping. Ping sends an echo request, and the target answers with an echo reply. The time between them is the round-trip time. If replies come back, you know the target is up and the path works in both directions.",
      "Traceroute also relies on ICMP. Every packet has a TTL counter that each router lowers by one. When it hits zero, the router drops the packet and sends back an ICMP time exceeded message. By sending packets with TTL 1, 2, 3 and so on, traceroute learns each router on the path.",
      "Some people block all ICMP for security. This causes real problems, because ICMP also tells senders when packets are too large for a link. Without that message, some connections hang mysteriously. The right approach is to allow the important ICMP types and filter the rest carefully.",
    ],
    deepDive: [
      {
        heading: "The ICMP message format",
        body: "ICMP is carried inside IP with protocol number 1 (ICMPv6 uses next header 58). Every message starts with a 1-byte type, a 1-byte code that gives detail, and a 2-byte checksum, followed by 4 bytes whose meaning depends on the type. For echo messages those 4 bytes are a 16-bit identifier and a 16-bit sequence number, which ping uses to match replies to requests. ICMP has no ports; NAT devices use the identifier instead.\n\nError messages include the start of the packet that caused the problem: at least its IP header and first 8 bytes, which hold the TCP or UDP ports. That is how your system knows which connection the error belongs to. To avoid storms, hosts never send ICMP errors about ICMP errors, broadcasts or fragments other than the first.",
        bullets: ["Header: type 1 byte, code 1 byte, checksum 2 bytes, then 4 bytes", "Echo: identifier and sequence number", "Errors quote the original IP header + first 8 bytes", "No ICMP errors about ICMP errors"],
      },
      {
        heading: "Destination unreachable codes",
        body: "Type 3 (ICMPv6 type 1) has codes that tell you exactly what failed. Code 0, network unreachable, means a router has no route. Code 1, host unreachable, usually means the last router could not get an ARP reply from the host. Code 3, port unreachable, comes from the destination host itself: the packet arrived, but nothing listens on that UDP port. Code 4, fragmentation needed and DF set, carries the next-hop MTU and drives path MTU discovery. Codes 9, 10 and 13 mean administratively prohibited: a firewall or ACL actively refused it.\n\nOn Linux, ping prints these as Destination Net Unreachable, Destination Host Unreachable and so on. If the message comes From your own IP, your host failed to ARP for a local address. If you see nothing at all, something dropped the packet silently.",
        visual: {
          type: "compare",
          title: "What each answer tells you",
          columns: [
            { title: "Error returned", points: ["Code 0: a router has no route", "Code 1: last hop cannot ARP the host", "Code 3: host is up, port closed", "Code 13: a firewall said no"] },
            { title: "Silence (timeout)", points: ["A firewall dropped it quietly", "The host is down", "The reply path is broken", "ICMP is rate-limited"] },
          ],
        },
      },
      {
        heading: "Time exceeded and how traceroute really works",
        body: "Type 11 code 0 means the TTL reached zero in transit; code 1 means a host gave up reassembling fragments. Traceroute uses code 0. Linux traceroute by default sends UDP probes to high ports starting at 33434, three per TTL. Each router where TTL expires replies with time exceeded, revealing its address and the round-trip time. When a probe finally reaches the destination, the high port is closed, so the destination answers port unreachable, and traceroute knows it is done.\n\nWindows tracert uses ICMP echo instead, and traceroute -I does the same on Linux. traceroute -T sends TCP SYNs, often to port 80 or 443, which is useful when firewalls drop UDP and ICMP. A row of asterisks means no reply within the timeout for that TTL, which does not necessarily mean the hop dropped your traffic.",
        visual: {
          type: "sequence",
          title: "End of a Linux traceroute (UDP probes)",
          actors: ["Your host", "Last router", "Destination"],
          messages: [
            { from: 0, to: 1, label: "UDP to a high port, TTL 9" },
            { from: 1, to: 0, label: "ICMP time exceeded: hop 9" },
            { from: 0, to: 2, label: "UDP to a high port, TTL 10" },
            { from: 2, to: 0, label: "ICMP port unreachable: arrived, stop" },
          ],
        },
      },
      {
        heading: "Path MTU discovery and black holes",
        body: "Path MTU discovery finds the largest packet that can cross the whole path without fragmentation. In IPv4 (RFC 1191) the sender sets the DF bit; a router whose next link is too small drops the packet and returns type 3 code 4 with the next-hop MTU. In IPv6 (RFC 8201) routers always send ICMPv6 type 2, Packet Too Big. The sender lowers its packet size for that destination and resends.\n\nIf a firewall blocks those messages, you get a PMTU black hole: the TCP handshake and small requests work, but large packets vanish, so downloads stall or TLS hangs after the client hello. Fixes: allow ICMP type 3 code 4 and ICMPv6 type 2; clamp the TCP MSS on the tunnel or VPN gateway so segments fit; or enable packetization-layer probing on Linux with net.ipv4.tcp_mtu_probing=1.",
        bullets: ["IPv4: type 3 code 4 carries the next-hop MTU", "IPv6: type 2 Packet Too Big; routers never fragment", "iptables: -j TCPMSS --clamp-mss-to-pmtu on SYN packets", "tracepath shows the discovered pmtu per hop"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "ICMP types you will meet",
        root: "ICMP and ICMPv6",
        children: [
          { label: "Echo (ping)", children: ["IPv4: 8 request, 0 reply", "IPv6: 128 request, 129 reply"] },
          { label: "Unreachable", children: ["IPv4 type 3", "IPv6 type 1"] },
          { label: "Too big", children: ["IPv4: type 3 code 4", "IPv6: type 2 Packet Too Big"] },
          { label: "Time exceeded", children: ["IPv4 type 11", "IPv6 type 3"] },
          { label: "IPv6 only", children: ["133 to 137: Neighbour Discovery", "130 to 132, 143: MLD multicast"] },
        ],
      },
    ],
    examples: [
      {
        title: "Telling no route, closed port and firewall apart",
        explanation: "Three tests, three different answers. Step 1: ping an address in a subnet no router knows; a router answers From 10.0.0.1 Destination Net Unreachable. Step 2: send a UDP packet to a closed port on a live host; tcpdump shows ICMP udp port 9999 unreachable, so the host is up. Step 3: try a host behind a firewall that rejects; you see admin prohibited (in Linux ping output: Packet filtered). A timeout with no message at all means something dropped the packet silently, which is common on the internet.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i any -nn 'icmp[0] == 3' &\nping -c 1 -W 2 10.99.99.99           # net or host unreachable?\nnc -u -w1 10.0.0.20 9999 <<< hi      # port unreachable from the host\n# tcpdump: ICMP 10.0.0.20 udp port 9999 unreachable",
        },
      },
      {
        title: "Fixing a PMTU black hole on a VPN gateway",
        explanation: "Through a new IPsec tunnel, SSH works but scp and web pages stall. Step 1: tracepath to a remote host shows pmtu 1500 at first, then the path stops responding: a sign that Packet Too Big messages are missing. Step 2: ping with DF set confirms 1400-byte packets pass but 1500-byte packets vanish silently, with no ICMP error. Step 3: on the Linux gateway, clamp the MSS of forwarded SYNs to the route MTU so TCP never sends oversized segments. Step 4: transfers now complete. Better still, also allow ICMP type 3 code 4 through the firewall so other protocols can discover the MTU too.",
        code: {
          lang: "bash",
          code: "tracepath -n 10.30.0.10\nping -M do -s 1372 -c 2 10.30.0.10    # 1400-byte packet: OK\nping -M do -s 1472 -c 2 10.30.0.10    # 1500: silent loss\n# nftables (inet filter forward chain):\nsudo nft add rule inet filter forward tcp flags syn tcp option maxseg size set rt mtu\n# iptables equivalent:\nsudo iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu",
        },
      },
    ],
    cheatSheet: [
      "IPv4 echo: 8 request, 0 reply; IPv6 echo: 128 request, 129 reply",
      "Type 3 codes: 0 net, 1 host, 3 port unreachable, 4 frag needed, 13 admin prohibited",
      "Type 11 code 0 = TTL exceeded in transit (what traceroute uses)",
      "ICMPv6 type 2 = Packet Too Big; never block it",
      "traceroute uses UDP from port 33434; -I uses ICMP, -T uses TCP SYN",
      "Allow at least ICMP 3 and 11, ICMPv6 1-4 and 133-136, or things break",
      "tracepath host shows path MTU without root",
    ],
    quiz: [
      {
        q: "You send a UDP packet to a live host on a port with no listener. What ICMP message comes back?",
        options: ["Time exceeded", "Echo reply", "Destination unreachable, port unreachable (type 3 code 3)", "Redirect"],
        answer: 2,
        why: "The host received the packet but has nothing on that port, so it reports port unreachable.",
      },
      {
        q: "Which ICMPv6 message tells an IPv6 sender to use smaller packets?",
        options: ["Type 1", "Type 128", "Type 135", "Type 2 Packet Too Big"],
        answer: 3,
        why: "IPv6 routers never fragment, so they send Packet Too Big with the link MTU.",
      },
      {
        q: "How does Linux traceroute know it has reached the destination?",
        options: ["The destination replies with port unreachable to the high-port UDP probe", "The TTL becomes 255", "It receives an echo reply", "The router sends a redirect"],
        answer: 0,
        why: "Its UDP probes target unused high ports, so the final host replies port unreachable.",
      },
      {
        q: "A traceroute shows 40% loss at hop 5 but 0% loss at every later hop. What does that most likely mean?",
        options: ["Hop 5 is dropping your traffic", "Hop 5 rate-limits ICMP replies; your traffic passes fine", "The destination is down", "The path MTU is too small"],
        answer: 1,
        why: "If later hops show no loss, packets are passing hop 5; it just answers fewer probes.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Ping a host 5 times and explain the icmp_seq, ttl and time values in each line, plus the summary line.",
        hint: "The summary gives min, avg, max and mdev (the variation).",
        solution: "ping -c 5 1.1.1.1\n# 64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=11.8 ms\n# icmp_seq: sequence number, so gaps show lost replies\n# ttl: remaining TTL of the reply (start value minus hops)\n# time: round-trip time for this request\n# rtt min/avg/max/mdev: range of RTTs; mdev = jitter",
      },
      {
        level: "medium",
        task: "Run traceroute to the same host three ways (UDP, ICMP, TCP port 443) and explain why the results may differ.",
        hint: "Firewalls often treat UDP, ICMP and TCP differently.",
        solution: "traceroute -n example.com           # UDP probes to 33434+\nsudo traceroute -n -I example.com   # ICMP echo\nsudo traceroute -n -T -p 443 example.com   # TCP SYN to 443\n# A firewall that drops UDP/ICMP shows * * * at the end of the\n# first two, but lets TCP 443 through, so -T reaches the host.",
      },
      {
        level: "hard",
        task: "Write nftables rules for an inet table input chain that allow essential ICMP and ICMPv6 (errors, echo, and Neighbour Discovery) and drop the rest of ICMP.",
        hint: "Use icmp type and icmpv6 type sets; ND must be allowed for IPv6 to work.",
        solution: "table inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n    ct state established,related accept\n    icmp type { echo-request, destination-unreachable, time-exceeded, parameter-problem } accept\n    icmpv6 type { echo-request, destination-unreachable, packet-too-big, time-exceeded,\n      parameter-problem, nd-router-solicit, nd-router-advert,\n      nd-neighbor-solicit, nd-neighbor-advert } accept\n  }\n}",
      },
    ],
    faq: [
      { q: "Is it safe to block ping?", a: "Blocking echo requests from the internet hides a host from simple scans but makes troubleshooting harder. Never block ICMP error types like unreachable, time exceeded and Packet Too Big, because real traffic depends on them." },
      { q: "Why does ping work but my website does not load?", a: "Ping only proves IP connectivity. The web server port may be closed or firewalled, the service may be down, or an MTU problem may drop the larger packets that pages need." },
      { q: "What does Request timed out mean?", a: "No reply came back within the wait time. The host may be down, a firewall may drop ICMP, or the reply may be lost on its way back. It does not say which, so test further." },
      { q: "Does ICMP use ports?", a: "No. ICMP sits directly on IP. Echo messages use an identifier and sequence number instead, which NAT devices track in place of ports." },
    ],
  },
};

export default extra;
