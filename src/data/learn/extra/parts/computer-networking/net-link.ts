import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-link/physical-media": {
    plain: [
      "Everything on a network ends up as a physical signal: tiny changes in voltage on copper wire, flashes of light in glass fibre, or radio waves through the air. The physical layer is the part of networking that deals with these signals, the cables and the connectors.",
      "Most office and home cables are twisted pair copper with RJ45 plugs. Inside are four pairs of thin wires, each pair twisted together to cancel out electrical noise. Better cable categories, such as Cat 6A, can carry faster signals, but every copper run is limited to 100 metres.",
      "Fibre optic cable sends light through a thin strand of glass. It goes much further than copper, from hundreds of metres to many kilometres, and it is not affected by electrical noise or lightning. It is used between buildings, inside data centres and for internet backbones.",
      "Duplex describes the direction of traffic. Full duplex means a device can send and receive at the same time, like a phone call. Half duplex means only one side can talk at a time, like a walkie-talkie. Modern switched links are full duplex, and both ends must agree, or the link becomes slow and full of errors.",
    ],
    deepDive: [
      {
        heading: "Copper categories and what they really support",
        body: "A cable category is a promise about the signal frequency the cable handles over 100 metres. Cat 5e is rated to 100 MHz and carries 1 Gbps (1000BASE-T), and also 2.5 Gbps (2.5GBASE-T) over the full 100 m. Cat 6 is rated to 250 MHz; it supports 10 Gbps (10GBASE-T), but only up to about 55 metres. Cat 6A is rated to 500 MHz and carries 10 Gbps over the full 100 m, so it is the usual choice for new office cabling. Cat 8 reaches 25 or 40 Gbps, but only for 30 m runs inside data centres.\n\nThe 100 m limit is the whole channel: about 90 m of fixed cable in the wall plus up to 10 m of patch cords at both ends. Gigabit and faster use all four pairs, so a cable with one broken pair may still link up, but only at 100 Mbps.",
        bullets: ["Cat 5e: 1 Gbps, 2.5 Gbps at 100 m", "Cat 6: 10 Gbps up to about 55 m", "Cat 6A: 10 Gbps at 100 m", "Cat 8: 25 or 40 Gbps up to 30 m", "Linked at 100 Mbps on a gigabit port? Suspect a bad pair"],
      },
      {
        heading: "Single-mode and multimode fibre",
        body: "Multimode fibre has a wide core (50 micrometres for OM3, OM4 and OM5) so light bounces along many paths, or modes. Those paths have slightly different lengths, so pulses smear out over distance, which limits reach. It uses cheap 850 nm optics: 10GBASE-SR reaches 300 m on OM3 and 400 m on OM4. Multimode jackets are usually aqua (OM3, OM4) or orange (older OM1, OM2).\n\nSingle-mode fibre has a core of about 9 micrometres, so light takes essentially one path. Pulses stay sharp for tens of kilometres: 10GBASE-LR reaches 10 km at 1310 nm. Its jackets are usually yellow. The optics, called transceivers, plug into switch slots: SFP for 1 Gbps, SFP+ for 10, SFP28 for 25 and QSFP28 for 100 Gbps. Both ends must use matching optics and the right fibre type, or the link stays dark.",
        visual: {
          type: "compare",
          title: "Choosing a fibre",
          columns: [
            { title: "Multimode (OM3/OM4)", points: ["50 micrometre core, many light paths", "850 nm, cheaper optics", "10G-SR: 300 m (OM3), 400 m (OM4)", "Aqua jacket, inside buildings"] },
            { title: "Single-mode (OS2)", points: ["About 9 micrometre core, one path", "1310 or 1550 nm lasers", "10G-LR: 10 km, longer with other optics", "Yellow jacket, campus and long haul"] },
          ],
        },
      },
      {
        heading: "Autonegotiation and the duplex mismatch trap",
        body: "When you plug in a copper cable, both ends exchange pulses to agree on the fastest common speed and on full duplex. This is autonegotiation, and 1000BASE-T requires it. Trouble starts when someone forces speed and duplex on one end only. The other end, still autonegotiating, gets no answer, detects the speed, but must assume half duplex.\n\nNow one side sends whenever it likes (full duplex), while the other stops and retries when it hears traffic (half duplex, using CSMA/CD). The link stays up and ping works, but anything heavy crawls. The full-duplex side counts CRC errors and runts (frames cut short); the half-duplex side counts late collisions. The fix is to set both ends to autonegotiate, or force both the same way.",
        visual: {
          type: "flow",
          title: "How a duplex mismatch happens",
          steps: [
            { label: "End A forced", detail: "100 Mbps full duplex, no negotiation" },
            { label: "End B autonegotiates", detail: "Hears no negotiation pulses" },
            { label: "B detects speed", detail: "Senses 100 Mbps, assumes half duplex" },
            { label: "Traffic flows", detail: "A sends freely, B backs off on collisions" },
            { label: "Symptoms", detail: "A: CRC errors. B: late collisions. Slow" },
          ],
        },
      },
      {
        heading: "Reading interface counters",
        body: "Physical problems leave fingerprints in interface counters. On Linux, ip -s link show eth0 shows RX and TX packets, errors and drops, and ethtool -S eth0 shows the card's detailed counters, such as rx_crc_errors. On Cisco, show interfaces lists input errors, CRC, runts, giants and late collisions.\n\nRead counters as a rate, not a total. A few hundred CRC errors over six months of uptime may be one old event. CRC errors that rise every minute mean a live problem: a damaged cable, a dirty fibre connector, a failing transceiver or electrical noise. Clear or note the counters, wait, and check again. Drops without errors usually mean congestion or a full buffer, not a physical fault.",
        bullets: ["CRC errors rising: cable, connector or optic", "Late collisions: duplex mismatch or cable too long", "Drops but no errors: congestion or buffers", "ethtool -m eth0 reads optic light levels on supported cards"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Power over Ethernet classes",
        root: "PoE standards",
        children: [
          { label: "802.3af (PoE)", children: ["15.4 W at the switch", "IP phones, simple cameras"] },
          { label: "802.3at (PoE+)", children: ["30 W at the switch", "Wi-Fi access points, PTZ cameras"] },
          { label: "802.3bt Type 3", children: ["60 W at the switch", "Wi-Fi 6E and 7 APs, small displays"] },
          { label: "802.3bt Type 4", children: ["90 W at the switch", "Laptops, lighting, kiosks"] },
        ],
      },
    ],
    examples: [
      {
        title: "A server that links at 100 Mbps instead of 1 Gbps",
        explanation: "Backups suddenly take ten times longer. Step 1: ethtool shows Speed: 100Mb/s, Duplex: Full. Step 2: the switch port and server NIC both support 1000 Mbps, so the link negotiated down. Step 3: gigabit needs all four pairs, while 100 Mbps needs only two, so a broken pair is the prime suspect. Step 4: you replace the patch cord, and the link comes up at 1000Mb/s. Step 5: if it still fails, test the wall cable with a cable tester, because one pair is likely damaged in the run.",
        code: {
          lang: "bash",
          code: "ethtool eth0 | grep -E 'Speed|Duplex|Auto-negotiation'\n# Speed: 100Mb/s  Duplex: Full  Auto-negotiation: on\nethtool eth0 | grep -A3 'Link partner advertised link modes'\nip -s link show eth0",
        },
      },
      {
        title: "Spotting a flaky cable from counters",
        explanation: "A user complains of random slowness. Step 1: read the RX errors for the interface and note the number. Step 2: wait one minute while the user works and read again. Step 3: the CRC counter jumped from 1,204 to 1,390, so errors are happening now. Step 4: because a frame with a bad CRC is dropped, TCP must resend it, which causes the slowness. Step 5: you reseat or replace the cable. Errors stop rising, and the problem is gone.",
        code: {
          lang: "bash",
          code: "ethtool -S eth0 | grep -iE 'crc|err'\nsleep 60\nethtool -S eth0 | grep -iE 'crc|err'\n# Cisco equivalent:\n# show interfaces gi1/0/5 | include CRC|collision",
        },
      },
    ],
    cheatSheet: [
      "Copper Ethernet: 100 m channel max (90 m fixed + 10 m patch cords)",
      "Cat 5e = 1 Gbps, Cat 6A = 10 Gbps at 100 m, Cat 6 = 10 Gbps only to about 55 m",
      "Multimode: aqua, 850 nm, hundreds of metres. Single-mode: yellow, kilometres",
      "Never force speed or duplex on just one end of a link",
      "ethtool eth0 shows speed, duplex and link; ethtool -S shows error counters",
      "Gigabit uses all 4 pairs; a link stuck at 100 Mbps often means a bad pair",
      "PoE budgets at the switch: 15.4 W (af), 30 W (at), 60 or 90 W (bt)",
    ],
    quiz: [
      {
        q: "Which cable reliably carries 10 Gbps over a full 100 m copper run?",
        options: ["Cat 5e", "Cat 6", "Cat 6A", "Cat 5"],
        answer: 2,
        why: "Cat 6A is rated to 500 MHz for 10GBASE-T at 100 m; Cat 6 reaches only about 55 m.",
      },
      {
        q: "One switch port is forced to 100/full and the PC autonegotiates. What happens?",
        options: ["The PC falls back to half duplex, causing a duplex mismatch", "Both run at 1 Gbps", "The link refuses to come up", "Both run at full duplex"],
        answer: 0,
        why: "Without negotiation pulses, the autonegotiating side detects speed but must assume half duplex.",
      },
      {
        q: "You need 8 km between two buildings at 10 Gbps. What do you choose?",
        options: ["Cat 8 copper", "Multimode OM4 with SR optics", "Cat 6A with a repeater", "Single-mode fibre with LR optics"],
        answer: 3,
        why: "10GBASE-LR on single-mode fibre reaches 10 km; copper and multimode cannot.",
      },
      {
        q: "An interface shows steadily rising CRC errors. What is the most likely cause?",
        options: ["Wrong IP address", "A damaged cable, dirty connector or failing optic", "A full MAC table", "Too many VLANs"],
        answer: 1,
        why: "CRC errors mean frames arrive corrupted, which points to the physical layer.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Check the speed, duplex and link status of your main wired interface, and read its error counters.",
        hint: "ethtool for speed and duplex, ip -s link for counters.",
        solution: "ip -br link                     # find the name, e.g. enp3s0\nsudo ethtool enp3s0 | grep -E 'Speed|Duplex|Link detected'\nip -s link show enp3s0         # look at RX/TX errors and dropped",
      },
      {
        level: "medium",
        task: "Plan cabling for three needs: desks 70 m from the switch at 1 Gbps, a storage server 40 m away at 10 Gbps, and a building 2 km away at 10 Gbps.",
        hint: "Match each distance and speed to the cheapest medium that is rated for it.",
        solution: "Desks: Cat 6A (or Cat 6) copper, within 100 m, room to grow\nStorage: Cat 6A copper 10GBASE-T, or OM4 multimode with SR optics\n2 km building: single-mode fibre with 10GBASE-LR optics (10 km reach)\nMultimode SR would only reach 300 to 400 m, so it cannot be used.",
      },
      {
        level: "hard",
        task: "A Cisco port shows many runts and CRC errors, while the connected server shows late collisions. Explain the cause and give the fix commands for both ends.",
        hint: "Which side thinks it is half duplex?",
        solution: "Cause: duplex mismatch. The switch is full duplex and counts CRC/runts;\nthe server fell back to half duplex and counts late collisions.\nSwitch:  interface gi1/0/5\n          speed auto\n          duplex auto\nServer:  sudo ethtool -s eth0 autoneg on\nVerify:  ethtool eth0  -> 1000Mb/s Full; counters stop rising",
      },
    ],
    faq: [
      { q: "Is Cat 6 worth it over Cat 5e for a home?", a: "For gigabit, Cat 5e is enough. Cat 6 or 6A gives room for 2.5, 5 or 10 Gbps later, and the extra cost is small compared with re-cabling walls." },
      { q: "Can I use a longer Ethernet cable than 100 m?", a: "It may link up, but it is out of spec and errors are likely. Put a switch in the middle, or use fibre for long runs." },
      { q: "Why is fibre immune to interference?", a: "It carries light in glass, not electricity in metal, so nearby motors, power cables and lightning cannot induce noise in it. That also makes it safe between buildings with different electrical grounds." },
      { q: "What do I do if a fibre link will not come up?", a: "Check that both optics match (same speed and wavelength, SR to SR or LR to LR), that the fibre type matches the optics, that the strands are not swapped (transmit must reach the other side's receive) and that the connectors are clean." },
    ],
  },

  "net-link/ethernet-mac": {
    plain: [
      "Ethernet is the set of rules for sending data across a local network. It chops data into pieces called frames. Each frame is like an envelope with a destination address, a sender address, a label saying what is inside, the contents, and a small check value at the end to catch damage.",
      "The addresses on Ethernet frames are MAC addresses. A MAC address is 48 bits long and is written as six pairs of hexadecimal digits, like 3c:22:fb:12:34:56. The first half usually tells you who made the network card; the second half is a serial number chosen by that maker.",
      "A frame can be sent to one device (unicast), to every device on the LAN (broadcast, address ff:ff:ff:ff:ff:ff), or to a group of interested devices (multicast). Network cards ignore frames that are not for them, so a laptop does not waste time on traffic meant for the printer.",
      "MAC addresses only matter on the local link. When your data leaves your network through a router, the router puts it in a new frame with new MAC addresses. The IP address is what carries your data across the internet; the MAC address only gets it to the next box.",
    ],
    deepDive: [
      {
        heading: "Inside the Ethernet II frame",
        body: "Before the frame itself, the sender transmits a 7-byte preamble of alternating 1s and 0s and a 1-byte start frame delimiter, so the receiver can lock on to the timing. Then come the 6-byte destination MAC, the 6-byte source MAC and a 2-byte field called EtherType. Destination comes first on purpose: a switch can start deciding where to send the frame after reading only 6 bytes.\n\nThe 2-byte field has two meanings. If its value is 0x0600 (1536) or more, it is an EtherType naming the payload: 0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP. If it is 1500 or less, it is a length, and the frame uses the older IEEE 802.3 format with an LLC header, still used by Spanning Tree. A VLAN tag, when present, is inserted right after the source MAC and starts with 0x8100.",
        bullets: ["0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP", "0x8100 802.1Q VLAN tag, 0x88A8 QinQ outer tag", "0x88CC LLDP, 0x8847 MPLS", "Value 1500 or below = length field (802.3 frame)"],
      },
      {
        heading: "The two special bits in every MAC address",
        body: "The first byte of a MAC address hides two flags. The lowest bit is the I/G bit: 0 means an individual (unicast) address, 1 means a group (multicast or broadcast) address. So any MAC whose first byte is odd, like 01:00:5e:..., is multicast. The next bit is the U/L bit: 0 means a globally unique address assigned by the maker under its OUI, 1 means a locally administered address chosen by software.\n\nIn practice, if the second hex digit is 2, 6, A or E, the address is locally administered unicast. You see these on virtual machines, Docker bridges and on phones and laptops that use random MAC addresses on Wi-Fi for privacy. That is why a vendor lookup on such an address finds nothing: it never came from a vendor.",
        visual: {
          type: "tree",
          title: "Reading the first byte of a MAC",
          root: "First byte, two lowest bits",
          children: [
            { label: "Bit 0 (I/G) = 0", children: ["Unicast", "Example: 3c:22:fb:..."] },
            { label: "Bit 0 (I/G) = 1", children: ["Multicast or broadcast", "Example: 01:00:5e:..., ff:ff:..."] },
            { label: "Bit 1 (U/L) = 0", children: ["Globally unique", "OUI assigned by IEEE"] },
            { label: "Bit 1 (U/L) = 1", children: ["Locally administered", "VMs, containers, random Wi-Fi MACs"] },
          ],
        },
      },
      {
        heading: "Multicast MACs and how IP maps onto them",
        body: "Multicast frames go to a group, and each host joins only the groups it cares about. IPv4 multicast addresses map onto MACs starting 01:00:5e, followed by the low 23 bits of the group IP. For example 224.0.0.251 (mDNS) becomes 01:00:5e:00:00:fb. Because only 23 of the 28 group bits fit, 32 different IP groups share each MAC, and the host's IP layer filters out the extras.\n\nIPv6 multicast uses MACs starting 33:33 followed by the last 32 bits of the IPv6 address, so ff02::1 (all nodes) becomes 33:33:00:00:00:01. Some link-layer protocols have their own reserved multicast MACs: Spanning Tree uses 01:80:c2:00:00:00 and LLDP uses 01:80:c2:00:00:0e. Switches treat these specially and do not forward them like normal traffic.",
      },
      {
        heading: "How the frame check sequence catches damage",
        body: "The last 4 bytes of a frame are the FCS, a CRC-32 checksum calculated over everything from the destination MAC to the end of the payload. The receiver runs the same calculation; if the result differs, the frame was damaged on the way and is dropped silently. Ethernet never asks for a resend. Recovery, if any, is left to higher layers such as TCP.\n\nThe CRC detects all single-bit and double-bit errors and all error bursts up to 32 bits long, which covers most real damage. Frames shorter than the 64-byte minimum are called runts and frames longer than the maximum are giants; both are counted and discarded. Because the FCS is usually checked and removed by the network card, Wireshark often does not show it at all.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three kinds of destination",
        columns: [
          { title: "Unicast", points: ["One receiver", "First byte even, e.g. 3c:22:fb:...", "Switch forwards out one port once learned"] },
          { title: "Broadcast", points: ["Every host in the VLAN", "ff:ff:ff:ff:ff:ff", "Used by ARP and DHCP discover", "Always flooded"] },
          { title: "Multicast", points: ["Hosts that joined a group", "01:00:5e:... (IPv4), 33:33:... (IPv6)", "Flooded unless IGMP or MLD snooping limits it"] },
        ],
      },
    ],
    examples: [
      {
        title: "Decoding a frame by hand",
        explanation: "tcpdump -e prints: 3c:22:fb:12:34:56 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42. Step 1: the source MAC starts with 3c, binary 0011 1100. Bit 0 is 0 (unicast) and bit 1 is 0 (globally unique), so it is a real vendor address. Step 2: the destination is all ones: broadcast. Step 3: EtherType 0x0806 means the payload is ARP. Step 4: length 42 is 14 bytes of header plus a 28-byte ARP message. On the wire the card pads it to the 60-byte minimum plus a 4-byte FCS, making 64 bytes.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i eth0 -e -nn -c 5 'ether broadcast'\nsudo tcpdump -i eth0 -e -nn 'ether host 3c:22:fb:12:34:56'\nsudo tcpdump -i eth0 -e -nn 'ether proto 0x86dd'   # IPv6 only",
        },
      },
      {
        title: "Changing a MAC address temporarily",
        explanation: "A lab network only allows a registered MAC, and you want to test with a spare laptop. Step 1: bring the interface down. Step 2: set a locally administered address, which starts with 02 so it cannot clash with any vendor address. Step 3: bring it up and confirm. Step 4: note that this only lasts until reboot; NetworkManager has its own setting, ethernet.cloned-mac-address, for a permanent change. Remember a MAC is easy to change, so it is not proof of identity.",
        code: {
          lang: "bash",
          code: "ip link show eth0 | grep link/ether\nsudo ip link set dev eth0 down\nsudo ip link set dev eth0 address 02:00:00:aa:bb:01\nsudo ip link set dev eth0 up\nip link show eth0 | grep link/ether",
        },
      },
    ],
    cheatSheet: [
      "Frame: dst MAC 6, src MAC 6, EtherType 2, payload 46-1500, FCS 4 bytes",
      "Odd first byte = multicast; second hex digit 2, 6, A, E = locally administered",
      "IPv4 multicast MAC = 01:00:5e + low 23 bits of the group address",
      "IPv6 multicast MAC = 33:33 + last 32 bits of the address",
      "Wireshark filters: eth.addr == aa:bb:cc:dd:ee:ff, eth.type == 0x0806",
      "tcpdump filters: ether host X, ether broadcast, ether multicast",
      "Bad FCS: frame dropped silently; Ethernet itself never retransmits",
    ],
    quiz: [
      {
        q: "Which MAC address is multicast?",
        options: ["3c:22:fb:12:34:56", "01:00:5e:00:00:fb", "00:50:56:aa:bb:cc", "a4:83:e7:01:02:03"],
        answer: 1,
        why: "The first byte 01 has its lowest bit set, which marks a group (multicast) address.",
      },
      {
        q: "A frame's type/length field holds 0x0800. What does that mean?",
        options: ["The payload is 2,048 bytes", "It is a VLAN tag", "The payload is ARP", "The payload is an IPv4 packet"],
        answer: 3,
        why: "Values of 0x0600 and above are EtherTypes, and 0x0800 is IPv4.",
      },
      {
        q: "What happens when a switch receives a frame with a bad FCS?",
        options: ["It drops the frame", "It asks the sender to resend", "It fixes the error", "It floods the frame"],
        answer: 0,
        why: "Ethernet only detects errors; recovery is left to higher layers like TCP.",
      },
      {
        q: "Your phone shows a Wi-Fi MAC of da:a1:19:...; a vendor lookup finds nothing. Why?",
        options: ["The phone is broken", "It is a multicast address", "It is a locally administered random MAC", "MACs cannot be looked up"],
        answer: 2,
        why: "The second hex digit a sets the U/L bit, so the address was generated by software, not assigned to a vendor.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the MAC address of your wired or Wi-Fi interface and split it into the OUI and the device-specific part.",
        hint: "ip link shows link/ether; the OUI is the first three bytes.",
        solution: "ip link show | grep -B1 link/ether\n# e.g. link/ether 3c:22:fb:12:34:56\n# OUI = 3c:22:fb (look it up in the IEEE registry or Wireshark's manuf file)\n# Device part = 12:34:56",
      },
      {
        level: "medium",
        task: "Work out the multicast MAC address for the IPv4 group 239.1.2.3 and for the IPv6 address ff02::1:ff00:5.",
        hint: "IPv4: keep the low 23 bits. IPv6: keep the last 32 bits.",
        solution: "239.1.2.3: second octet 1 = 0000 0001, top bit dropped -> 01\nMAC = 01:00:5e:01:02:03\nff02::1:ff00:5 = ff02:0:0:0:0:1:ff00:0005\nLast 32 bits = ff00:0005\nMAC = 33:33:ff:00:00:05",
      },
      {
        level: "hard",
        task: "Capture 30 seconds of traffic and count how many frames are broadcast, multicast and unicast. Explain what produces the broadcasts and multicasts.",
        hint: "tcpdump filters ether broadcast and ether multicast; ether multicast also matches broadcast.",
        solution: "sudo tcpdump -i eth0 -w /tmp/l2.pcap & sleep 30; sudo kill %1\nB=$(tcpdump -r /tmp/l2.pcap -nn 'ether broadcast' | wc -l)\nM=$(tcpdump -r /tmp/l2.pcap -nn 'ether multicast and not ether broadcast' | wc -l)\nT=$(tcpdump -r /tmp/l2.pcap -nn | wc -l)\necho \"bcast=$B mcast=$M ucast=$((T-B-M))\"\n# Broadcasts: ARP, DHCP. Multicasts: mDNS, IPv6 ND, LLDP, SSDP.",
      },
    ],
    faq: [
      { q: "Is a MAC address unique worldwide?", a: "Vendor-assigned ones are meant to be, because each vendor gets its own OUI. But software can set any MAC, and random addresses on phones are common, so never treat a MAC as proof of identity." },
      { q: "Can a MAC address be used to track me on the internet?", a: "No. Your MAC never leaves your local network; routers replace it at the first hop. Wi-Fi networks you join can see it, which is why phones randomise it." },
      { q: "What is the difference between Ethernet II and 802.3 frames?", a: "Ethernet II uses the 2-byte field as an EtherType naming the payload, and carries almost all IP traffic. 802.3 uses it as a length followed by an LLC header, and today mostly carries Spanning Tree BPDUs." },
    ],
  },

  "net-link/switching": {
    plain: [
      "A switch is a box with many Ethernet ports that connects devices in a LAN. Its job is simple: when a frame arrives, send it out of the port where the destination device lives, and nowhere else. That keeps traffic private between the two devices and leaves other ports free.",
      "A switch is not told where devices are. It learns. Every time a frame arrives, the switch looks at the sender's MAC address and notes which port it came in on. Over a few seconds it builds a table of which MAC lives on which port.",
      "If a frame arrives for a MAC the switch has not learned yet, it does the safe thing: it sends a copy out of every other port, which is called flooding. When the destination replies, the switch learns its port, and from then on it sends frames only there.",
      "Before switches, networks used hubs, which copied every bit to every port. Only one device could talk at a time, and collisions were common. A switch gives each port its own lane, so many pairs of devices can talk at full speed at the same moment.",
    ],
    deepDive: [
      {
        heading: "Learn, flood, forward, filter",
        body: "For every frame, a switch does two independent things. First it learns: it records the source MAC, the incoming port and the VLAN in its MAC address table, resetting that entry's age timer. Then it decides where the frame goes, based on the destination MAC. If the destination is known and on a different port, it forwards the frame out of that port only. If the destination is on the same port the frame came in on, it filters (drops) it, since the receiver already saw it. If the destination is unknown, broadcast or (without snooping) multicast, it floods to all other ports in the same VLAN.\n\nEntries that are not refreshed age out, by default after 300 seconds on Cisco switches and Linux bridges. If a MAC shows up on a new port, the entry simply moves.",
        visual: {
          type: "sequence",
          title: "A switch learns two hosts",
          actors: ["Host A (port 1)", "Switch", "Host B (port 2)", "Host C (port 3)"],
          messages: [
            { from: 0, to: 1, label: "Frame A to B; learn A = port 1" },
            { from: 1, to: 2, label: "B unknown: flood copy" },
            { from: 1, to: 3, label: "Flood copy (C ignores it)" },
            { from: 2, to: 1, label: "Reply B to A; learn B = port 2" },
            { from: 1, to: 0, label: "A known: forward to port 1 only" },
            { from: 0, to: 1, label: "Next frame A to B: port 2 only" },
          ],
        },
      },
      {
        heading: "Hubs, collision domains and broadcast domains",
        body: "A collision domain is a group of devices where two transmissions at the same time destroy each other. A hub puts every port in one collision domain, so devices must use CSMA/CD: listen, send, detect a collision, wait a random time and retry. Throughput drops sharply as more devices talk.\n\nA switch makes each port its own collision domain, and with full duplex there are no collisions at all. But a switch does not split broadcast domains. A broadcast entering any port goes out of every other port in the same VLAN, so a flat network of 2,000 hosts on one VLAN means every host hears every ARP and DHCP broadcast. To split broadcast domains you need VLANs or routers.",
        bullets: ["Hub: 1 collision domain, 1 broadcast domain", "Switch: 1 collision domain per port, 1 broadcast domain per VLAN", "Router: each interface is its own broadcast domain"],
      },
      {
        heading: "Store-and-forward versus cut-through",
        body: "A store-and-forward switch receives the whole frame, checks the FCS and only then sends it on. Damaged frames are dropped at the first switch, and the switch can connect ports of different speeds. The cost is latency: the full frame must arrive first, about 12 microseconds for a 1500-byte frame at 1 Gbps.\n\nA cut-through switch starts sending as soon as it has read the destination MAC, saving that wait. It is popular in data centres and trading networks where microseconds matter, but it can pass on a corrupted frame, which is only dropped further along. Most campus switches use store-and-forward; many data-centre switches use cut-through when both ports run at the same speed.",
      },
      {
        heading: "When the MAC table goes wrong",
        body: "The MAC table is finite, often 8,000 to 128,000 entries. In a MAC flooding attack, a tool like macof sends frames from thousands of fake source MACs until the table is full. New, real hosts can no longer be learned, so their traffic is flooded to every port, and an attacker on any port can capture it. Port security, which limits how many MACs each port may learn, stops this.\n\nAnother warning sign is MAC flapping: the same MAC is learned on two ports in turn, many times a second. It usually means a layer 2 loop, or two devices using the same MAC. A quieter issue is unknown unicast flooding: if a router's ARP entry lives longer than the switch's MAC entry (Cisco defaults are 4 hours and 5 minutes), the switch forgets a silent host and floods traffic to it.",
        bullets: ["Port security: switchport port-security maximum 2", "Flapping MAC: look for a loop first", "MAC aging 300 s vs Cisco ARP timeout 4 h can cause flooding"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Decision for one incoming frame",
        steps: [
          { label: "Learn source", detail: "Save source MAC, port, VLAN; reset age" },
          { label: "Broadcast or multicast?", detail: "Yes: flood to all other ports in the VLAN" },
          { label: "Destination in table?", detail: "No: flood as unknown unicast" },
          { label: "Same port it came from?", detail: "Yes: filter (drop) it" },
          { label: "Forward", detail: "Send out of the one learned port" },
        ],
      },
    ],
    examples: [
      {
        title: "Watching the MAC table fill in Packet Tracer",
        explanation: "Build one switch with three PCs on Fa0/1, Fa0/2 and Fa0/3. Step 1: run show mac address-table; it shows no dynamic entries yet. Step 2: ping from PC1 to PC2. The ARP broadcast teaches the switch PC1's MAC on Fa0/1, and the ARP reply teaches PC2's MAC on Fa0/2. Step 3: show the table again and see two DYNAMIC entries. PC3 is still missing because it has not sent anything. Step 4: in simulation mode, watch the first ARP flood to PC3, while the later ICMP packets go only to PC2.",
        code: {
          lang: "text",
          code: "Switch# show mac address-table dynamic\nSwitch# show mac address-table address 0050.7966.6800\nSwitch# show mac address-table aging-time\nSwitch# clear mac address-table dynamic",
        },
      },
      {
        title: "A Linux bridge is a software switch",
        explanation: "Linux can act as a switch, which is how VMs and containers share a host's network. Step 1: create a bridge and attach two interfaces. Step 2: bring them up. Step 3: after some traffic, bridge fdb show lists the learned MACs per port (the forwarding database, the same idea as a MAC table). Step 4: the ageing time is shown in centiseconds, so 30000 means 300 seconds, the same default as hardware switches.",
        code: {
          lang: "bash",
          code: "sudo ip link add br0 type bridge\nsudo ip link set eth1 master br0\nsudo ip link set eth2 master br0\nsudo ip link set br0 up; sudo ip link set eth1 up; sudo ip link set eth2 up\nbridge fdb show br br0 | grep -v permanent\nip -d link show br0 | grep -o 'ageing_time [0-9]*'",
        },
      },
    ],
    cheatSheet: [
      "Switches learn from the source MAC and forward on the destination MAC",
      "Unknown unicast, broadcast and unsnooped multicast are flooded within the VLAN",
      "Default MAC aging: 300 seconds (Cisco and Linux bridge)",
      "Each switch port = its own collision domain; each VLAN = one broadcast domain",
      "Cisco: show mac address-table dynamic; Linux: bridge fdb show",
      "MAC flapping between two ports usually means a layer 2 loop",
      "Port security limits MACs per port and blocks MAC flooding attacks",
    ],
    quiz: [
      {
        q: "A switch receives a frame. Which address does it use to update its MAC table?",
        options: ["Destination MAC", "Source IP", "Source MAC", "Destination IP"],
        answer: 2,
        why: "Learning is based on where the sender lives, so the switch records the source MAC and port.",
      },
      {
        q: "How many collision domains and broadcast domains does a 24-port switch with one VLAN have?",
        options: ["1 and 1", "24 and 24", "1 and 24", "24 and 1"],
        answer: 3,
        why: "Each port is its own collision domain, but all ports in one VLAN share one broadcast domain.",
      },
      {
        q: "A frame arrives on port 5 for a MAC the table says is on port 5. What does the switch do?",
        options: ["Filters (drops) it", "Floods it", "Sends it back out of port 5", "Sends it to the router"],
        answer: 0,
        why: "The destination is on the same segment it came from, so it has already been seen.",
      },
      {
        q: "An attacker fills the MAC table with fake addresses. What is the effect?",
        options: ["The switch reboots", "New hosts' traffic is flooded, so the attacker can capture it", "All traffic is dropped", "VLANs merge"],
        answer: 1,
        why: "With no room to learn, the switch floods frames for unknown MACs to every port.",
      },
      {
        q: "Which switching mode starts sending a frame before it has fully arrived?",
        options: ["Store-and-forward", "Flooding", "Filtering", "Cut-through"],
        answer: 3,
        why: "Cut-through forwards right after reading the destination MAC, trading error checking for lower latency.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In Packet Tracer, connect three PCs to one switch, ping between two of them, and show the MAC table before and after.",
        hint: "Only devices that have sent a frame appear in the table.",
        solution: "Switch# show mac address-table\n(empty)\nPC1> ping 192.168.1.2\nSwitch# show mac address-table\n  1  0001.aaaa.0001  DYNAMIC  Fa0/1\n  1  0001.aaaa.0002  DYNAMIC  Fa0/2\n# PC3 is missing until it sends something.",
      },
      {
        level: "medium",
        task: "Configure a Cisco access port to allow at most 2 MAC addresses, learn them automatically, and drop (not shut down) frames from extra MACs.",
        hint: "Port security needs the port in access mode first; violation modes are protect, restrict and shutdown.",
        solution: "interface fa0/5\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict\nend\nshow port-security interface fa0/5",
      },
      {
        level: "hard",
        task: "A server on one VLAN receives heavy traffic meant for another host every few minutes. The router's ARP timeout is 4 hours and the switch's MAC aging is 5 minutes. Explain the cause and two fixes.",
        hint: "What happens when a quiet host's MAC entry expires but the router still knows its MAC?",
        solution: "The target host is silent, so its MAC entry ages out after 300 s.\nThe router still has a valid ARP entry and keeps sending unicast frames.\nThe switch no longer knows the port, so it floods them (unknown unicast).\nFix 1: lower the router's ARP timeout below the MAC aging time,\n  e.g. interface vlan 20 / arp timeout 240\nFix 2: raise MAC aging above the ARP timeout,\n  e.g. mac address-table aging-time 14400",
      },
    ],
    faq: [
      { q: "Do I need to configure a switch to make it work?", a: "No. An unmanaged switch learns MACs by itself as soon as it is powered on. Managed switches add VLANs, security and monitoring, which you configure." },
      { q: "What is the difference between a MAC table and an ARP table?", a: "A switch's MAC table maps MAC addresses to switch ports (layer 2). A host or router's ARP table maps IP addresses to MAC addresses (layer 2 to 3)." },
      { q: "Why is it called a CAM table?", a: "Switches store the MAC table in content-addressable memory (CAM), a chip that finds a matching entry in one step, so lookups keep up with line rate." },
    ],
  },

  "net-link/vlans": {
    plain: [
      "A VLAN (virtual LAN) lets you split one physical switch into several separate networks. Ports in VLAN 10 can only talk to other ports in VLAN 10, as if they were on their own switch. Staff, guests and phones can share the same hardware but stay apart.",
      "The main reason is broadcasts and security. Every broadcast reaches every device in its VLAN, so smaller VLANs mean less noise. And a guest laptop in VLAN 20 cannot directly reach the finance server in VLAN 10, which limits what an attacker or a virus can touch.",
      "An access port belongs to one VLAN and connects one end device, like a PC or a printer. The device does not know VLANs exist. A trunk port connects switches (or a switch and a router) and carries many VLANs over one cable. To keep them apart, each frame on a trunk gets a small tag with its VLAN number.",
      "Devices in different VLANs need a router to talk, exactly like devices on different networks. The router can be a separate box connected with one trunk cable (router-on-a-stick) or a layer 3 switch that routes between VLANs internally.",
    ],
    deepDive: [
      {
        heading: "The 802.1Q tag, bit by bit",
        body: "On a trunk, the switch inserts a 4-byte tag into each frame right after the source MAC address. The first 2 bytes are the TPID, always 0x8100, which tells the receiver a tag follows. The next 2 bytes, the TCI, hold three fields: a 3-bit PCP (priority, 0 to 7, used for quality of service such as voice), a 1-bit DEI (drop eligible) and the 12-bit VLAN ID. Because the frame changed, the FCS is recalculated.\n\nTwelve bits give 4,096 values, but 0 and 4095 are reserved, so usable VLANs are 1 to 4094. VLAN 1 is the default on every port. On Cisco, VLANs 1002 to 1005 are reserved for old Token Ring and FDDI, and 1006 to 4094 is called the extended range. The tag makes a full frame 1522 bytes, which every trunk device must accept.",
        visual: {
          type: "flow",
          title: "A tagged frame on a trunk",
          steps: [
            { label: "Dst and src MAC", detail: "6 + 6 bytes, unchanged" },
            { label: "TPID 0x8100", detail: "2 bytes: a VLAN tag follows" },
            { label: "PCP, DEI, VID", detail: "3 + 1 + 12 bits, e.g. VLAN 20" },
            { label: "EtherType", detail: "The original type, e.g. 0x0800" },
            { label: "Payload and new FCS", detail: "FCS recalculated over the tagged frame" },
          ],
        },
      },
      {
        heading: "Access, trunk and the native VLAN",
        body: "An access port sends and receives untagged frames, and the switch puts everything from it into one VLAN. Many switches also allow one extra voice VLAN on an access port, so an IP phone can tag its own voice traffic while the PC behind it stays untagged. A trunk port carries tagged frames for its allowed VLANs.\n\nOne VLAN per trunk, the native VLAN (VLAN 1 by default), is sent untagged. If the two ends of a trunk disagree on the native VLAN, untagged frames from VLAN 1 on one side land in, say, VLAN 99 on the other, silently joining two networks. Cisco logs this as a native VLAN mismatch via CDP. A common hardening step is to set the native VLAN to an unused ID on both ends, or to tag it as well.",
        bullets: ["Access: untagged, one data VLAN (plus optional voice VLAN)", "Trunk: tagged, many VLANs", "Native VLAN: untagged on a trunk, must match both ends", "show interfaces trunk lists mode, native and allowed VLANs"],
      },
      {
        heading: "Routing between VLANs",
        body: "With router-on-a-stick, one router port connects to a switch trunk. The router has one subinterface per VLAN, each with encapsulation dot1Q and an IP address that hosts use as their gateway. A frame from VLAN 10 arrives tagged 10, is routed, and leaves tagged 20 on the same cable. It is cheap, but all inter-VLAN traffic shares one link in both directions.\n\nA layer 3 switch does the same job internally with switched virtual interfaces (SVIs): interface vlan 10 with an IP address, plus ip routing turned on. Routing happens in hardware at full port speed, which is why most offices route between VLANs on the core switch and only send internet traffic to a router or firewall.",
        visual: {
          type: "sequence",
          title: "Router-on-a-stick: PC in VLAN 10 to server in VLAN 20",
          actors: ["PC 10.0.10.5", "Switch", "Router g0/0.10 and .20", "Server 10.0.20.8"],
          messages: [
            { from: 0, to: 1, label: "Untagged frame to gateway MAC" },
            { from: 1, to: 2, label: "Trunk: tagged VLAN 10" },
            { from: 2, to: 1, label: "Routed, sent back tagged VLAN 20" },
            { from: 1, to: 3, label: "Tag removed, out access port" },
            { from: 3, to: 1, label: "Reply, enters VLAN 20" },
            { from: 1, to: 2, label: "Tagged 20, routed back to 10" },
          ],
        },
      },
      {
        heading: "VLAN security and common mistakes",
        body: "Two VLAN hopping attacks are worth knowing. In switch spoofing, an attacker's PC pretends to be a switch and uses Cisco's DTP to negotiate a trunk, gaining every VLAN. Stop it by setting user ports to switchport mode access and switchport nonegotiate. In double tagging, an attacker in the native VLAN sends a frame with two tags; the first switch strips the outer one and the next switch forwards it into the inner VLAN. Stop it by using an unused native VLAN that no host sits in.\n\nThe most common real mistake is simpler. switchport trunk allowed vlan 40 replaces the whole allowed list with only VLAN 40, cutting off every other VLAN on that trunk. To add one, use switchport trunk allowed vlan add 40.",
        bullets: ["User ports: switchport mode access", "Native VLAN: unused ID, e.g. 999, on both ends", "Use allowed vlan add, never a bare allowed vlan, to add one", "Shut unused ports and put them in a parking VLAN"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Two ways to route between VLANs",
        columns: [
          { title: "Router-on-a-stick", points: ["One trunk to a router", "Subinterfaces: g0/0.10, g0/0.20", "Cheap, small sites", "All inter-VLAN traffic shares one link"] },
          { title: "Layer 3 switch (SVIs)", points: ["interface vlan 10 with an IP", "Needs ip routing enabled", "Routes in hardware at port speed", "Standard in office cores"] },
        ],
      },
    ],
    examples: [
      {
        title: "Router-on-a-stick for two VLANs",
        explanation: "The switch has PCs in VLAN 10 and VLAN 20 and a trunk on Gi0/1 to the router. Step 1: on the router, enable the physical port with no IP. Step 2: create a subinterface per VLAN with encapsulation dot1Q and the gateway address. Step 3: on the switch, make Gi0/1 a trunk that allows 10 and 20. Step 4: set each PC's gateway to its subinterface address (10.0.10.1 or 10.0.20.1). Step 5: ping across; show ip route on the router lists both networks as connected.",
        code: {
          lang: "text",
          code: "R1(config)# interface g0/0\nR1(config-if)# no shutdown\nR1(config)# interface g0/0.10\nR1(config-subif)# encapsulation dot1Q 10\nR1(config-subif)# ip address 10.0.10.1 255.255.255.0\nR1(config)# interface g0/0.20\nR1(config-subif)# encapsulation dot1Q 20\nR1(config-subif)# ip address 10.0.20.1 255.255.255.0\nSW1(config)# interface g0/1\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan 10,20",
        },
      },
      {
        title: "A VLAN interface on a Linux server",
        explanation: "A server must join VLAN 30 over a trunked switch port. Step 1: create a VLAN subinterface on top of eth0 with ID 30. Step 2: give it an address in the VLAN 30 subnet and bring it up. Step 3: the kernel now tags outgoing frames with VLAN 30 and accepts tagged frames for it. Step 4: confirm with ip -d link, which shows vlan protocol 802.1Q id 30. For a permanent setup, put the same settings in netplan or NetworkManager.",
        code: {
          lang: "bash",
          code: "sudo ip link add link eth0 name eth0.30 type vlan id 30\nsudo ip addr add 10.0.30.20/24 dev eth0.30\nsudo ip link set eth0.30 up\nip -d link show eth0.30 | grep vlan\nsudo tcpdump -i eth0 -e -nn vlan 30 -c 3",
        },
      },
    ],
    cheatSheet: [
      "802.1Q tag: 4 bytes, TPID 0x8100, 3-bit PCP, 1-bit DEI, 12-bit VLAN ID",
      "Usable VLAN IDs: 1 to 4094; VLAN 1 is the default",
      "show vlan brief, show interfaces trunk, show interfaces g0/1 switchport",
      "switchport trunk allowed vlan add 40 adds; without add it replaces the list",
      "Native VLAN must match on both trunk ends; use an unused ID",
      "L3 switch: ip routing + interface vlan 10 + ip address = inter-VLAN routing",
      "Linux: ip link add link eth0 name eth0.30 type vlan id 30",
    ],
    quiz: [
      {
        q: "How many bits hold the VLAN ID in an 802.1Q tag?",
        options: ["8", "12", "16", "32"],
        answer: 1,
        why: "The VID is 12 bits, giving IDs 0 to 4095, of which 1 to 4094 are usable.",
      },
      {
        q: "An admin types switchport trunk allowed vlan 40 on a trunk that carried 10, 20 and 30. What happens?",
        options: ["VLAN 40 is added to the list", "Nothing changes", "The trunk becomes an access port", "Only VLAN 40 is allowed now; 10, 20 and 30 are cut off"],
        answer: 3,
        why: "Without the add keyword, the command replaces the allowed list.",
      },
      {
        q: "What is sent untagged on an 802.1Q trunk?",
        options: ["Frames in the native VLAN", "All broadcasts", "Frames in VLAN 4095", "Voice traffic"],
        answer: 0,
        why: "Only the native VLAN crosses the trunk without a tag.",
      },
      {
        q: "A PC in VLAN 10 cannot reach a PC in VLAN 20 on the same switch. What is missing?",
        options: ["A bigger MAC table", "A second cable", "A router or layer 3 interface to route between them", "A shorter VLAN ID"],
        answer: 2,
        why: "VLANs are separate broadcast domains, so traffic between them must be routed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create VLANs 10 (STAFF) and 20 (GUEST) on a switch and put Fa0/1-12 in VLAN 10 and Fa0/13-20 in VLAN 20.",
        hint: "interface range saves typing.",
        solution: "vlan 10\n name STAFF\nvlan 20\n name GUEST\ninterface range fa0/1 - 12\n switchport mode access\n switchport access vlan 10\ninterface range fa0/13 - 20\n switchport mode access\n switchport access vlan 20\nend\nshow vlan brief",
      },
      {
        level: "medium",
        task: "Configure a trunk between two switches on Gi0/1 that carries VLANs 10, 20 and 30, uses native VLAN 999, and does not negotiate with DTP.",
        hint: "Set the same native VLAN on both switches.",
        solution: "vlan 999\n name NATIVE-UNUSED\ninterface g0/1\n switchport mode trunk\n switchport nonegotiate\n switchport trunk native vlan 999\n switchport trunk allowed vlan 10,20,30\n! repeat on the other switch, then:\nshow interfaces trunk",
      },
      {
        level: "hard",
        task: "Replace a router-on-a-stick with inter-VLAN routing on a layer 3 switch for VLANs 10 and 20, with a default route to a firewall at 10.0.0.2 on a routed port.",
        hint: "SVIs need ip routing; a routed port uses no switchport.",
        solution: "ip routing\ninterface vlan 10\n ip address 10.0.10.1 255.255.255.0\n no shutdown\ninterface vlan 20\n ip address 10.0.20.1 255.255.255.0\n no shutdown\ninterface g1/0/48\n no switchport\n ip address 10.0.0.1 255.255.255.252\nip route 0.0.0.0 0.0.0.0 10.0.0.2",
      },
    ],
    faq: [
      { q: "How many VLANs should a small office have?", a: "Usually a handful: staff, guests, voice, printers or IoT, and management. Each one maps to its own IP subnet and gets firewall rules between them." },
      { q: "Is a VLAN a security boundary?", a: "It is a useful one when the switches are configured properly, because hosts cannot reach other VLANs without a router. Real security comes from the firewall rules or ACLs on that router." },
      { q: "Why does my old switch need switchport trunk encapsulation dot1q first?", a: "Some older Cisco switches also supported Cisco's own ISL trunking, so you must choose 802.1Q before setting mode trunk. Newer switches only support 802.1Q and do not have the command." },
      { q: "Does the PC know which VLAN it is in?", a: "Not on an access port: it sends normal untagged frames and the switch assigns the VLAN. Only devices on trunks, like servers, hypervisors and phones, deal with tags themselves." },
    ],
  },

  "net-link/arp": {
    plain: [
      "To send data on a local network, a computer needs two addresses for the receiver: its IP address (which it usually already knows) and its MAC address (which the network card actually uses). ARP, the Address Resolution Protocol, finds the MAC address for a given IPv4 address.",
      "It works like shouting a question in a room. Your computer broadcasts: who has 10.0.0.1? Every device on the LAN hears it, but only the one with that IP answers, directly to you: 10.0.0.1 is at aa:bb:cc:dd:ee:01. Your computer saves the answer in its ARP cache so it does not have to ask again for a while.",
      "ARP only works inside your own network. If you want to reach a server on the internet, your computer does not ARP for that server. It knows the server is on another network, so it ARPs for its default gateway (the router) and sends everything to the router's MAC.",
      "IPv6 does not use ARP. It uses Neighbour Discovery, which does the same job with ICMPv6 messages sent to special multicast addresses instead of broadcasts, so fewer devices are disturbed.",
    ],
    deepDive: [
      {
        heading: "Inside an ARP packet",
        body: "ARP for IPv4 over Ethernet is a 28-byte message carried directly in an Ethernet frame with EtherType 0x0806, not inside IP. It contains: hardware type 1 (Ethernet), protocol type 0x0800 (IPv4), hardware length 6, protocol length 4, an opcode (1 for request, 2 for reply), then sender MAC, sender IP, target MAC and target IP.\n\nIn a request, the target MAC is all zeros, because that is what the sender wants to learn, and the frame goes to ff:ff:ff:ff:ff:ff. The reply swaps the roles and is unicast back to the asker. A useful detail: any host that receives a request for its own IP also caches the sender's mapping straight away, because it will almost certainly need to reply to it soon.",
        bullets: ["EtherType 0x0806, 28-byte payload", "Opcode 1 = request, 2 = reply", "Request: target MAC 00:00:00:00:00:00, sent to broadcast", "Reply: unicast to the requester"],
      },
      {
        heading: "Linux neighbour states and timers",
        body: "Linux shows ARP entries with ip neigh, and each has a state. INCOMPLETE means a request was sent and no reply has arrived. REACHABLE means the mapping was confirmed recently, by a reply or by TCP traffic making progress. After the reachable time (base_reachable_time is 30 seconds, randomised between 15 and 45) it becomes STALE: still usable, but unverified. When a STALE entry is used, it moves to DELAY, then PROBE, where the kernel sends unicast ARP requests to check. If nobody answers, the entry becomes FAILED.\n\nOther systems are more relaxed: Windows keeps entries for a short random time, while Cisco routers keep ARP entries for 4 hours by default. Static entries show as PERMANENT and never expire.",
        visual: {
          type: "cycle",
          title: "Life of a Linux neighbour entry",
          steps: [
            { label: "INCOMPLETE", detail: "Request sent, waiting for a reply" },
            { label: "REACHABLE", detail: "Confirmed in the last 15 to 45 s" },
            { label: "STALE", detail: "Usable but unverified" },
            { label: "DELAY then PROBE", detail: "Used again, so check with unicast ARP" },
            { label: "REACHABLE or FAILED", detail: "Reply confirms it, silence fails it" },
          ],
        },
      },
      {
        heading: "Gratuitous ARP, probes and failover",
        body: "A gratuitous ARP is one nobody asked for: the sender IP and target IP are both the host's own address. It has two uses. First, it announces a new or moved mapping. When a VRRP or keepalived pair fails over, the new active node sends gratuitous ARPs so every host and switch immediately updates its cache and MAC table to the new owner of the virtual IP. Without it, traffic would keep going to the dead node until the old entries expired.\n\nSecond, detecting conflicts. Before using an address, a host can send an ARP probe (RFC 5227) with sender IP 0.0.0.0, asking who has this address. Any reply means a duplicate. On Linux, arping -D runs this check, and arping -U sends an unsolicited announcement.",
        bullets: ["arping -D -I eth0 10.0.0.50: is this address in use?", "arping -U -I eth0 10.0.0.50: announce my mapping", "keepalived sends gratuitous ARPs after failover"],
      },
      {
        heading: "IPv6 Neighbour Discovery",
        body: "IPv6 replaces ARP with Neighbour Discovery (RFC 4861), carried in ICMPv6. To resolve an address, a host sends a Neighbour Solicitation (type 135) to the target's solicited-node multicast address: ff02::1:ff followed by the last 24 bits of the target address. Only hosts whose addresses end in those bits listen, so almost nobody else is disturbed. The owner answers with a Neighbour Advertisement (type 136).\n\nND also does jobs ARP never did. Routers send Router Advertisements (type 134) with prefixes and the default gateway, and hosts can ask for one with a Router Solicitation (type 133). Duplicate Address Detection checks every new address before use. Redirect (type 137) tells a host about a better first hop. This is why blocking all ICMPv6 breaks IPv6 completely.",
        visual: {
          type: "sequence",
          title: "Resolving 2001:db8::25 with Neighbour Discovery",
          actors: ["Host 2001:db8::10", "Switch", "Server 2001:db8::25"],
          messages: [
            { from: 0, to: 1, label: "NS to ff02::1:ff00:25 (MAC 33:33:ff:00:00:25)" },
            { from: 1, to: 2, label: "Delivered to listeners of that group" },
            { from: 2, to: 1, label: "NA: 2001:db8::25 is at its MAC" },
            { from: 1, to: 0, label: "Unicast reply; host caches it" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How a host chooses whose MAC to ARP for",
        steps: [
          { label: "Packet to send", detail: "Destination IP, e.g. 142.250.74.46" },
          { label: "Same subnet?", detail: "Compare with own IP and mask" },
          { label: "Yes: ARP target", detail: "Resolve the destination itself" },
          { label: "No: ARP gateway", detail: "Resolve the default gateway's IP" },
          { label: "Build frame", detail: "Dst MAC = result, dst IP unchanged" },
        ],
      },
    ],
    examples: [
      {
        title: "Watching ARP happen from an empty cache",
        explanation: "Step 1: flush the neighbour cache so you start clean. Step 2: start tcpdump filtering only ARP. Step 3: ping the gateway once. You see one broadcast request (Request who-has 10.0.0.1 tell 10.0.0.5) and one reply (Reply 10.0.0.1 is-at aa:bb:cc:dd:ee:01). Step 4: ip neigh now shows the gateway as REACHABLE. Step 5: wait a minute and check again; it has turned STALE but stays in the cache and is reused without a new broadcast.",
        code: {
          lang: "bash",
          code: "sudo ip neigh flush dev eth0\nsudo tcpdump -i eth0 -nn -e arp &\nping -c 1 10.0.0.1\nip neigh show dev eth0\nsleep 60; ip neigh show dev eth0     # REACHABLE -> STALE\nsudo kill %1",
        },
      },
      {
        title: "Finding a duplicate IP address",
        explanation: "A printer goes on and off the network randomly. Suspect: another device took its IP. Step 1: run arping against the printer's IP; replies from two different MAC addresses prove a conflict. Step 2: look up both OUIs to identify the vendors. Step 3: find the rogue device on the switch with show mac address-table address for the unknown MAC, which gives the port. Step 4: fix it by giving the printer a DHCP reservation outside any static range.",
        code: {
          lang: "bash",
          code: "sudo arping -I eth0 -c 4 10.0.0.40\n# Unicast reply from 10.0.0.40 [00:1B:A9:11:22:33]\n# Unicast reply from 10.0.0.40 [B8:27:EB:44:55:66]   <- second owner\nsudo arping -D -I eth0 -c 2 10.0.0.40; echo \"exit=$?\"   # 1 = duplicate found",
        },
      },
    ],
    cheatSheet: [
      "ARP: EtherType 0x0806, request broadcast, reply unicast",
      "ip neigh show lists the cache; Windows uses arp -a; Cisco uses show ip arp",
      "States: INCOMPLETE, REACHABLE, STALE, DELAY, PROBE, FAILED, PERMANENT",
      "Off-subnet destinations: ARP for the default gateway, never the remote host",
      "arping -D checks for duplicates; arping -U announces your mapping",
      "IPv6 ND: RS 133, RA 134, NS 135, NA 136, Redirect 137 (ICMPv6 types)",
      "Solicited-node multicast: ff02::1:ff + last 24 bits of the address",
    ],
    quiz: [
      {
        q: "Your PC at 192.168.1.20/24 sends a packet to 8.8.8.8. Whose MAC address goes in the frame?",
        options: ["8.8.8.8's MAC", "The DNS server's MAC", "The default gateway's MAC", "The broadcast MAC"],
        answer: 2,
        why: "8.8.8.8 is off-subnet, so the frame goes to the router, which forwards it onward.",
      },
      {
        q: "What is the target MAC field in an ARP request?",
        options: ["00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff", "The sender's own MAC", "The router's MAC"],
        answer: 0,
        why: "The sender does not know it yet, so the field is zero; the Ethernet destination is broadcast.",
      },
      {
        q: "After a keepalived failover, why does the new master send gratuitous ARPs?",
        options: ["To get a new IP from DHCP", "To test the cable", "To find the old master", "So hosts and switches update to the new MAC for the virtual IP at once"],
        answer: 3,
        why: "Without the announcement, caches would keep pointing at the failed node until they expired.",
      },
      {
        q: "Which ICMPv6 message does IPv6 use instead of an ARP request?",
        options: ["Router Advertisement", "Neighbour Solicitation", "Echo Request", "Redirect"],
        answer: 1,
        why: "A Neighbour Solicitation (type 135) asks for the link-layer address of an IPv6 neighbour.",
      },
      {
        q: "A Linux neighbour entry shows STALE. What does that mean?",
        options: ["It is still used but will be re-checked when next needed", "It is invalid and deleted", "The host is down", "It is a static entry"],
        answer: 0,
        why: "STALE entries stay usable; using one triggers DELAY and PROBE to confirm it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List your neighbour cache, find your gateway's entry and note its MAC address and state.",
        hint: "ip route shows the gateway IP; ip neigh shows the cache.",
        solution: "GW=$(ip route show default | awk '{print $3; exit}')\necho \"gateway: $GW\"\nip neigh show \"$GW\"\n# e.g. 10.0.0.1 dev eth0 lladdr aa:bb:cc:dd:ee:01 REACHABLE",
      },
      {
        level: "medium",
        task: "Add a permanent ARP entry for 10.0.0.50 with MAC 02:00:00:00:00:50, confirm it, and remove it again.",
        hint: "ip neigh add takes lladdr and nud permanent.",
        solution: "sudo ip neigh add 10.0.0.50 lladdr 02:00:00:00:00:50 dev eth0 nud permanent\nip neigh show 10.0.0.50     # ... PERMANENT\nsudo ip neigh del 10.0.0.50 dev eth0\nip neigh show 10.0.0.50     # gone",
      },
      {
        level: "hard",
        task: "Work out the solicited-node multicast address and its multicast MAC for 2001:db8:a::12:3456, and write a tcpdump filter that shows only Neighbour Solicitations.",
        hint: "Take the last 24 bits; ICMPv6 type is at byte 40 of an IPv6 packet with no extension headers.",
        solution: "Last 24 bits of ...:0012:3456 = 12:3456\nSolicited-node: ff02::1:ff12:3456\nMAC: 33:33 + last 32 bits (ff12:3456) = 33:33:ff:12:34:56\nFilter for NS (type 135):\nsudo tcpdump -i eth0 -nn 'icmp6 and ip6[40] == 135'",
      },
    ],
    faq: [
      { q: "What is ARP spoofing?", a: "An attacker sends fake ARP replies claiming to be the gateway, so victims send their traffic through the attacker. Switches with DHCP snooping and Dynamic ARP Inspection drop such fake replies." },
      { q: "How do I clear the ARP cache?", a: "On Linux run sudo ip neigh flush all. On Windows run arp -d * from an administrator prompt. On Cisco use clear arp-cache." },
      { q: "What is proxy ARP?", a: "A router answering ARP requests on behalf of hosts on another network, so a host with a wrong mask can still reach them. It hides configuration mistakes and is usually disabled on modern networks." },
      { q: "Does ARP work across a router?", a: "No. ARP broadcasts stay inside one broadcast domain. Each router hop does its own ARP on its next link." },
    ],
  },

  "net-link/stp": {
    plain: [
      "Network designers like to connect switches with more than one path, so that one broken cable does not cut anyone off. But Ethernet has a weakness: frames carry no counter that stops them after a number of hops. If switches form a loop, a broadcast goes round and round forever.",
      "Worse, every switch floods each broadcast out of all its ports, so copies multiply. Within seconds the links are full, switches' CPUs max out and the whole network stops working. This is called a broadcast storm.",
      "Spanning Tree Protocol (STP) solves this automatically. The switches talk to each other, pick one switch as the centre (the root bridge) and work out the best path from every switch to it. Any extra link that would create a loop is put into a blocking state, where it carries no normal traffic.",
      "The blocked links are not wasted. If an active link fails, STP notices and unblocks a backup path. The original STP took 30 to 50 seconds to do this. Rapid Spanning Tree (RSTP), used today, usually recovers in about a second.",
    ],
    deepDive: [
      {
        heading: "Bridge IDs and the root election",
        body: "Every switch has an 8-byte bridge ID: a 2-byte priority followed by its 6-byte MAC address. The default priority is 32768. On Cisco's per-VLAN spanning tree, the priority field also carries the VLAN number (the extended system ID), so a switch in VLAN 10 shows priority 32778. You can only set priority in steps of 4096.\n\nAt first, every switch claims to be root and sends BPDUs (bridge protocol data units) every 2 seconds. When a switch hears a lower bridge ID, it stops claiming and relays the better one. The lowest bridge ID wins: lowest priority first, and on a tie, lowest MAC address. If you leave everything at defaults, the oldest switch with the lowest MAC often wins, which may be a slow closet switch. Always set the root deliberately.",
        bullets: ["Bridge ID = priority (default 32768) + MAC", "Priority in steps of 4096: 0, 4096, 8192 ... 61440", "spanning-tree vlan 10 root primary sets a winning priority", "Also set a secondary root for when the primary fails"],
      },
      {
        heading: "Root ports, designated ports and path cost",
        body: "Once the root is known, each other switch picks one root port: the port with the lowest total cost to the root. Each link adds its cost. With the original short costs, 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4 and 10 Gbps = 2; newer long costs use 20,000 for 1 Gbps and 2,000 for 10 Gbps. Ties are broken by the lowest neighbour bridge ID, then the lowest neighbour port ID (port priority, default 128, plus port number).\n\nOn every link segment, exactly one port becomes designated: the one on the switch closest to the root, which forwards traffic onto that segment. All root bridge ports are designated. Any port that is neither root nor designated is blocked. The result is exactly one active path between any two switches.",
        visual: {
          type: "tree",
          title: "Port roles in a three-switch triangle",
          root: "SW1 root bridge (all ports designated)",
          children: [
            { label: "SW2", children: ["Port to SW1: root port, cost 4", "Port to SW3: designated (lower bridge ID)"] },
            { label: "SW3", children: ["Port to SW1: root port, cost 4", "Port to SW2: blocked (alternate)"] },
          ],
        },
      },
      {
        heading: "Classic STP states and timers",
        body: "Original STP (802.1D) moves a port through states: blocking (listen to BPDUs only), listening (take part in the election, no learning), learning (learn MACs but do not forward), and forwarding. Three timers control it: hello 2 seconds, forward delay 15 seconds and max age 20 seconds.\n\nA port coming up spends 15 seconds listening and 15 learning, so 30 seconds before it forwards. If a switch loses BPDUs from the root indirectly, it first waits up to 20 seconds of max age before reacting, which makes a total of 50 seconds. That is why plugging a laptop into a classic STP port used to leave it with no network for half a minute, long enough for DHCP to give up. PortFast fixes this on host ports by going straight to forwarding.",
        visual: {
          type: "flow",
          title: "802.1D port states",
          steps: [
            { label: "Blocking", detail: "Receives BPDUs only; up to 20 s max age" },
            { label: "Listening", detail: "15 s: elects roles, no MAC learning" },
            { label: "Learning", detail: "15 s: learns MACs, still not forwarding" },
            { label: "Forwarding", detail: "Normal traffic flows" },
          ],
        },
      },
      {
        heading: "RSTP and the protections you should enable",
        body: "Rapid Spanning Tree (802.1w, now part of 802.1D-2004 and 802.1Q) keeps the same election but reacts much faster. It has three port states: discarding, learning and forwarding. It adds two backup roles: an alternate port is a ready-made second path to the root, and a backup port is a spare link to the same segment. On point-to-point links, switches use a quick proposal and agreement handshake instead of timers, and a failed root port can switch to its alternate almost at once.\n\nIn production, add guards. Mark host ports as edge (PortFast) and enable BPDU guard, which shuts the port if a BPDU arrives, so a user's home switch cannot cause a loop. Root guard on downlinks stops a rogue switch from becoming root. Cisco's rapid-pvst and the standard MSTP (802.1s) are the common modes.",
        bullets: ["spanning-tree mode rapid-pvst", "spanning-tree portfast on host ports", "spanning-tree bpduguard enable on host ports", "spanning-tree guard root on downlinks to access switches"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "How a loop turns into a broadcast storm",
        steps: [
          { label: "One broadcast", detail: "A host sends an ARP request" },
          { label: "Flooded", detail: "Each switch copies it out of every port" },
          { label: "Comes back", detail: "Copies return via the other path" },
          { label: "Multiplies", detail: "No TTL, so copies never die" },
          { label: "Meltdown", detail: "Links full, MAC tables flap, CPUs at 100%" },
        ],
      },
    ],
    examples: [
      {
        title: "Working out the tree by hand",
        explanation: "Three switches in a triangle, all links 1 Gbps (cost 4), all priority 32768. MACs: SW1 0011.0000.0001, SW2 0011.0000.0002, SW3 0011.0000.0003. Step 1: equal priorities, so the lowest MAC wins: SW1 is root, and both its ports are designated. Step 2: SW2's cost to root is 4 direct versus 8 via SW3, so its port to SW1 is the root port. The same applies to SW3. Step 3: on the SW2 to SW3 link, both switches have cost 4 to root, so the tie is broken by bridge ID: SW2 is lower, so its port is designated. Step 4: SW3's port on that link is blocked (alternate in RSTP).",
      },
      {
        title: "Making the core switch root and protecting edge ports",
        explanation: "The network uses defaults, and an old access switch has become root, so traffic takes odd paths. Step 1: switch to rapid PVST on all switches. Step 2: on the core, set root primary for the user VLANs, and on a second core set root secondary. Step 3: on every host port, enable PortFast and BPDU guard. Step 4: check show spanning-tree vlan 10. It should say This bridge is the root on the core, and the roles should match your design.",
        code: {
          lang: "text",
          code: "CORE1(config)# spanning-tree mode rapid-pvst\nCORE1(config)# spanning-tree vlan 10,20 root primary\nCORE2(config)# spanning-tree vlan 10,20 root secondary\nACC1(config)# interface range gi1/0/1 - 44\nACC1(config-if-range)# spanning-tree portfast\nACC1(config-if-range)# spanning-tree bpduguard enable\nCORE1# show spanning-tree vlan 10",
        },
      },
    ],
    cheatSheet: [
      "Root bridge = lowest bridge ID (priority, then MAC); default priority 32768",
      "Root port: lowest cost to root; then lowest neighbour bridge ID; then port ID",
      "Short costs: 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2",
      "802.1D timers: hello 2 s, forward delay 15 s, max age 20 s (30 to 50 s convergence)",
      "RSTP states: discarding, learning, forwarding; roles add alternate and backup",
      "Host ports: spanning-tree portfast + spanning-tree bpduguard enable",
      "show spanning-tree vlan 10 shows root ID, roles and states",
    ],
    quiz: [
      {
        q: "Two switches both have priority 32768. How is the root chosen between them?",
        options: ["The one with more ports", "The one powered on first", "The one with the lower MAC address", "The one with the higher MAC address"],
        answer: 2,
        why: "On equal priority, the lower MAC address gives the lower bridge ID, which wins.",
      },
      {
        q: "With classic 802.1D defaults, how long does a new port take to reach forwarding?",
        options: ["30 seconds", "2 seconds", "5 seconds", "90 seconds"],
        answer: 0,
        why: "15 seconds of listening plus 15 seconds of learning (forward delay twice).",
      },
      {
        q: "What does BPDU guard do on a PortFast port?",
        options: ["Makes the port the root port", "Speeds up convergence", "Changes the port cost", "Shuts the port down if a BPDU is received"],
        answer: 3,
        why: "A BPDU means a switch was connected to a host port, so the port is err-disabled to prevent a loop.",
      },
      {
        q: "In RSTP, what is an alternate port?",
        options: ["A port in learning state", "A blocked port that offers a backup path to the root", "The port facing the root", "A port with PortFast"],
        answer: 1,
        why: "It is a discarding port with a ready second path to the root, used at once if the root port fails.",
      },
      {
        q: "Why do Ethernet loops cause storms while IP routing loops eventually stop?",
        options: ["Switches are slower than routers", "IP has no broadcasts", "Ethernet frames have no TTL, but IP packets do", "Routers have STP built in"],
        answer: 2,
        why: "IP's TTL drops a looping packet after a set number of hops; Ethernet has no such field.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In Packet Tracer, connect three switches in a triangle and find which switch is root and which port is blocked.",
        hint: "show spanning-tree prints the root ID and each port's role and state.",
        solution: "SW1# show spanning-tree vlan 1\n# Root ID ... This bridge is the root  -> SW1 is root\nSW3# show spanning-tree vlan 1\n# Gi0/1  Root  FWD\n# Gi0/2  Altn  BLK   -> blocked port (if running rapid-pvst)\n# Root is the switch with the lowest MAC when priorities are equal.",
      },
      {
        level: "medium",
        task: "Make SW2 the root for VLAN 10 using an explicit priority (not root primary) and confirm the change.",
        hint: "Priority must be a multiple of 4096 and lower than everyone else's.",
        solution: "SW2(config)# spanning-tree vlan 10 priority 4096\nSW2# show spanning-tree vlan 10\n# Root ID Priority 4106 (4096 + VLAN 10)\n# This bridge is the root",
      },
      {
        level: "hard",
        task: "SW3's root port uses a 100 Mbps link (cost 19) directly to the root. Its other path is two 1 Gbps hops through SW2. Which port becomes the root port, and how would you force the direct link instead?",
        hint: "Add up the costs on each path. You can set a port's cost with spanning-tree cost.",
        solution: "Direct: 19.  Via SW2: 4 + 4 = 8.\nLowest cost wins, so the path via SW2 becomes the root port.\nThe direct 100 Mbps port becomes alternate/blocked.\nTo prefer the direct link, make it cheaper than 8:\nSW3(config)# interface fa0/1\nSW3(config-if)# spanning-tree vlan 10 cost 5",
      },
    ],
    faq: [
      { q: "Should I turn off Spanning Tree to make my network faster?", a: "No. With RSTP and PortFast on host ports there is almost no delay, and without STP a single wrong cable can take down the whole network." },
      { q: "What is the difference between STP, RSTP and MSTP?", a: "STP (802.1D) is the original slow version. RSTP (802.1w) uses the same ideas but converges in about a second. MSTP (802.1s) runs RSTP for groups of VLANs, so different VLANs can use different paths." },
      { q: "Why is my port in err-disabled state?", a: "Often BPDU guard or port security shut it. Remove the cause, then run shutdown and no shutdown on the interface, or configure errdisable recovery." },
      { q: "Do modern data centres still use STP?", a: "Much less. Leaf-spine designs route at layer 3 between switches and use ECMP, so there are no layer 2 loops to block. STP is still standard in campus and office networks." },
    ],
  },
};

export default extra;
