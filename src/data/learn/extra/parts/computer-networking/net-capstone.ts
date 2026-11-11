import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-capstone/network-design": {
    plain: [
      "Before you touch a single cable or command, you design the network on paper. A good design answers simple questions: how many people and devices will connect, what services they need, which groups must be kept apart, and how much the office will grow in the next few years.",
      "From those answers you draw two pictures. The physical topology shows real things: the router, the switches, the Wi-Fi access points and the cables between them. The logical topology shows the invisible structure: which VLANs (virtual LANs, separate networks on the same switches) and IP subnets exist, and how traffic moves between them.",
      "Then you write the addressing plan, a table with every VLAN, its subnet, its gateway and which addresses are kept for servers and printers. This table becomes the single source of truth while you build and later when you troubleshoot.",
      "Finally you plan the services that make it all usable: DHCP to hand out addresses, DNS to turn names into addresses, NAT so private addresses can reach the internet, and firewall rules that decide which groups may talk to each other.",
    ],
    deepDive: [
      {
        heading: "Gathering requirements",
        body: "Start with people and devices, not equipment. Count users and multiply: a typical office worker today has a laptop, a phone and sometimes a desk phone, so 40 staff can mean 100 or more addresses. List other devices: printers, cameras, door controllers, TVs, IoT sensors. List the services: internet access, file shares, a printer server, VoIP phones, guest Wi-Fi, and any cloud apps that need good bandwidth.\n\nThen ask about security and growth. Which groups must be isolated, for example guests and cameras from staff? Are there compliance needs, such as card payments, which require separating the payment systems? How many people will join in three years? What happens if the internet link fails, and how much downtime is acceptable? Write all of this down as numbered requirements, because each design choice should trace back to one of them.",
        bullets: ["Users, devices per user and other devices", "Services and their bandwidth needs", "Isolation and compliance needs", "Growth over 3 to 5 years", "Tolerable downtime and budget"],
      },
      {
        heading: "Physical and logical topology",
        body: "The physical topology for a small office is usually simple: an internet router or firewall, one core or distribution switch, access switches near the desks, and access points on the ceiling. PoE (Power over Ethernet) switches power phones and access points over the same cable, so count the PoE budget in watts. Note every link with the port names on both ends, the cable type and the speed, for example \"sw-core Gi1/0/1 to sw-floor1 Gi1/0/49, 10G fibre\".\n\nThe logical topology shows VLANs, subnets and where routing happens. A common small design is router-on-a-stick: one trunk from the core switch to the router, carrying all VLANs, with a subinterface per VLAN as its gateway. Larger designs move routing into a layer 3 core switch using SVIs (switch virtual interfaces), which is faster, and keep the firewall for traffic to the internet and between security zones. Draw both pictures; they answer different questions during troubleshooting.",
        visual: {
          type: "layers",
          title: "Physical layout of a small office",
          layers: [
            { label: "ISP link", detail: "Fibre or cable modem with a public IP" },
            { label: "Router or firewall", detail: "NAT, firewall rules, DHCP, gateways" },
            { label: "Core switch", detail: "Trunk to the router; links to floor switches" },
            { label: "Access switches (PoE)", detail: "Desks, phones and access points" },
            { label: "End devices", detail: "Laptops, phones, printers, cameras, guests" },
          ],
        },
      },
      {
        heading: "Writing the VLAN and subnet plan",
        body: "Give each group its own VLAN and subnet, and make the numbers easy to remember. One common pattern is that the VLAN ID matches the third octet: VLAN 10 is 10.20.10.0/24, VLAN 20 is 10.20.20.0/24. Use the first usable address (.1) as the gateway everywhere, keep a small static range for printers and servers (for example .2 to .20), and let DHCP hand out the rest.\n\nSize each subnet for growth. A /24 has 254 usable addresses, which is plenty for most office VLANs; a guest network in a busy lobby may need a /23 (510 hosts). Avoid the very common ranges 192.168.0.0/24 and 192.168.1.0/24, because staff working from home often use them too, and that overlap breaks VPN routing. Keep a separate management VLAN for switch and access point management interfaces, and never use VLAN 1 for user traffic. Leave gaps between blocks so you can add new VLANs later without renumbering.",
        visual: {
          type: "flow",
          title: "From requirement to subnet",
          steps: [
            { label: "Count hosts", detail: "40 staff x 2.5 devices = about 100" },
            { label: "Add growth", detail: "Plus 50 percent: about 150" },
            { label: "Pick a size", detail: "/24 gives 254 usable" },
            { label: "Assign numbers", detail: "VLAN 10, 10.20.10.0/24, gateway .1" },
            { label: "Reserve ranges", detail: "Static .2 to .20, DHCP .21 to .254" },
          ],
        },
      },
      {
        heading: "Planning DHCP, DNS, NAT and firewall rules",
        body: "DHCP: decide where it runs. On a small office the router can serve every VLAN; with a central server, each VLAN's gateway needs an ip helper-address (DHCP relay) pointing to it. Exclude static ranges from the pools and set a lease time; short leases (for example 4 to 8 hours) suit guest networks with many visitors.\n\nDNS: staff need an internal resolver that knows local names (files.office.lan) and forwards everything else; guests can use public resolvers. NAT: one PAT (port address translation) rule maps all internal subnets to the router's public IP; servers that must be reached from outside need a static NAT or port forward and should sit in a DMZ.\n\nFirewall rules: write them as a zone matrix before configuring. Typical intent: staff to servers on the needed ports; guests to the internet only (plus DHCP and DNS); voice to the call server; management reachable only from an admin subnet; nothing from the internet inbound except published services.",
        bullets: ["DHCP relay: ip helper-address on each VLAN gateway", "Internal DNS for local names; guests can use public DNS", "One PAT rule for outbound internet access", "Write the zone matrix before any ACL"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where to route between VLANs",
        columns: [
          { title: "Router-on-a-stick", points: ["One trunk to the router", "Subinterface per VLAN", "Cheap and simple", "Trunk bandwidth is the limit"] },
          { title: "Layer 3 core switch", points: ["SVI per VLAN on the switch", "Wire-speed inter-VLAN routing", "Router or firewall only for internet", "Needs ACLs on the switch for zones"] },
          { title: "Firewall as gateway", points: ["Each VLAN gateway on the firewall", "Every zone crossing is inspected", "Best security visibility", "Firewall throughput is the limit"] },
        ],
      },
    ],
    examples: [
      {
        title: "Addressing plan for a 45-person office",
        explanation: "Requirements: 45 staff with laptops and phones, 10 desk phones growing to 60, guest Wi-Fi for up to 80 visitors, 3 servers, 2 printers, switch and AP management. Step 1: choose 10.20.0.0/16 for the site, which overlaps neither home routers nor the cloud VPCs. Step 2: assign one VLAN and /24 per group, with a /23 for guests. Step 3: put printers in the staff VLAN static range. Step 4: write the table below and share it before building.",
        code: {
          lang: "text",
          code: "VLAN  Name    Subnet           Gateway      Static      DHCP\n10    STAFF   10.20.10.0/24    10.20.10.1   .2-.20      .21-.254\n20    GUEST   10.20.20.0/23    10.20.20.1   none        .20.10-.21.254\n30    VOICE   10.20.30.0/24    10.20.30.1   .2-.10      .11-.254\n40    SERVER  10.20.40.0/24    10.20.40.1   .2-.254     none\n99    MGMT    10.20.99.0/24    10.20.99.1   .2-.254     none\nDNS: 10.20.40.10 (staff, voice), 1.1.1.1 (guests)",
        },
      },
      {
        title: "Turning security requirements into a zone matrix",
        explanation: "Requirement R7 says guests must not reach anything internal; R8 says only IT can manage switches. Step 1: list the zones: Staff, Guest, Voice, Server, Mgmt, Internet. Step 2: for each pair, write allow with ports or deny. Step 3: check each allow against a requirement; remove any that has none. Step 4: this matrix later becomes the ACLs on the router, one ACL per VLAN interface, applied inbound.",
        code: {
          lang: "text",
          code: "From \\ To  Server               Mgmt             Internet\nStaff      TCP 445, 443; UDP 53 deny             allow\nGuest      deny                 deny             allow (+ DHCP, DNS)\nVoice      UDP 5060, RTP range  deny             SIP provider only\nIT admin   allow                TCP 22, 443      allow\nInternet   deny                 deny             -",
        },
      },
    ],
    cheatSheet: [
      "Requirements first: users x devices, services, isolation, growth, downtime",
      "One VLAN and one subnet per group; match VLAN ID to the third octet",
      "Gateway is .1 everywhere; keep a static range; DHCP for the rest",
      "Plan 50 percent headroom; /24 = 254 hosts, /23 = 510 hosts",
      "Avoid 192.168.0.0/24 and 192.168.1.0/24: home networks use them",
      "Never put users on VLAN 1; use a separate management VLAN",
      "Central DHCP server needs ip helper-address on each VLAN gateway",
      "Write the zone matrix before writing any ACL",
    ],
    quiz: [
      {
        q: "An office has 70 staff with about 2.5 devices each and expects 50 percent growth. What is the smallest suitable subnet for the staff VLAN?",
        options: ["/25", "/24", "/23", "/26"],
        answer: 2,
        why: "70 x 2.5 = 175, plus 50 percent is about 263, more than the 254 hosts a /24 holds, so a /23 (510) is needed.",
      },
      {
        q: "Why avoid 192.168.1.0/24 for an office LAN?",
        options: ["It is reserved for the internet", "It cannot carry VLANs", "Routers cannot use it", "Many home networks use it, which breaks routing for staff on VPN"],
        answer: 3,
        why: "If the home and office ranges match, the laptop cannot tell which network a destination is on.",
      },
      {
        q: "DHCP runs on a server in VLAN 40. What must be configured on the VLAN 10 gateway for staff to get addresses?",
        options: ["ip helper-address pointing to the DHCP server", "A static route to VLAN 40", "NAT overload", "A second trunk"],
        answer: 0,
        why: "DHCP discovers are broadcasts and do not cross routers unless a relay forwards them.",
      },
      {
        q: "Which design inspects every packet that crosses between zones?",
        options: ["Router-on-a-stick without ACLs", "Making the firewall the gateway for each VLAN", "A flat network on VLAN 1", "A layer 3 switch with no ACLs"],
        answer: 1,
        why: "When the firewall is every VLAN's gateway, all inter-zone traffic passes through its rules.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the requirements questions you would ask a small dental clinic before designing its network.",
        hint: "Cover people, devices, services, isolation, growth and downtime.",
        solution: "1. How many staff, and which devices does each use?\n2. Other devices: X-ray, card terminals, printers, cameras?\n3. Services: patient software, file server, cloud backup, VoIP?\n4. Must patient data and card payments be isolated?\n5. Do patients need guest Wi-Fi?\n6. Growth in 3 years? New rooms or branches?\n7. How long can the clinic work without internet?",
      },
      {
        level: "medium",
        task: "Write an addressing plan on 172.20.0.0/16 for VLANs Staff (120 hosts), Guests (300 hosts), Cameras (30 hosts) and Management (20 hosts), including gateways and DHCP ranges.",
        hint: "Pick sizes with headroom; a /23 holds 510 hosts.",
        solution: "VLAN 10 STAFF  172.20.10.0/24  gw .10.1  DHCP .10.21-.10.254\nVLAN 20 GUEST  172.20.20.0/23  gw .20.1  DHCP .20.10-.21.254\nVLAN 30 CAMS   172.20.30.0/25  gw .30.1  DHCP .30.21-.30.126\nVLAN 99 MGMT   172.20.99.0/26  gw .99.1  static only (.99.2-.99.62)",
      },
      {
        level: "hard",
        task: "The clinic wants the network to keep working if the main internet link fails. Extend the design with a backup link and explain how failover works and what users would notice.",
        hint: "Think about a second ISP or LTE, NAT and route tracking.",
        solution: "1. Add a second link (LTE or another ISP) on a second WAN port.\n2. Default route via ISP-1; floating default via ISP-2 with a\n   higher administrative distance.\n3. Track ISP-1 with an IP SLA ping to a public IP; if it fails,\n   remove the primary route so the backup takes over.\n4. Add a NAT rule for the backup interface too.\n5. Users notice existing connections drop (new public IP),\n   then reconnect; VoIP calls in progress end.\n6. Document both links and test failover every quarter.",
      },
    ],
    faq: [
      { q: "How many VLANs does a small office need?", a: "Usually four to six: staff, guests, voice if you have desk phones, servers or printers, management, and sometimes IoT or cameras. Each one exists because a group needs separation." },
      { q: "Should I use /24 for every subnet?", a: "A /24 is a sensible default because it is easy to read and big enough for most office groups. Use larger subnets for busy guest networks and smaller ones for management or point-to-point links." },
      { q: "What tool should I use to draw the topology?", a: "Any diagram tool works, such as draw.io (diagrams.net), Visio or Lucidchart. What matters is labelling device names, port names, VLANs and subnets clearly." },
      { q: "What is the difference between physical and logical topology?", a: "The physical topology shows devices and cables. The logical topology shows VLANs, subnets, gateways and how traffic is routed between them." },
    ],
  },

  "net-capstone/network-build": {
    plain: [
      "Now you build the design in a simulator. Cisco Packet Tracer is free with a Cisco Networking Academy account and is great for learning Cisco commands. GNS3 runs real router and switch software images, so it behaves even more like real gear, but it needs more setup.",
      "Build in layers, the same way you troubleshoot. First connect the devices and make the links come up. Then create VLANs and trunks on the switches. Then add routing between VLANs, then DHCP and DNS, then NAT for the internet, and last the ACLs and Wi-Fi.",
      "After every step, test before moving on. If a PC in the staff VLAN cannot get an address, there is no point adding NAT yet. Fixing one small step at a time is far easier than debugging everything at the end.",
      "Save your work often. On Cisco devices the active configuration lives in memory (running-config) and is lost on reboot unless you copy it to startup-config. In Packet Tracer, also save the .pkt file itself.",
    ],
    deepDive: [
      {
        heading: "VLANs, access ports and trunks",
        body: "On each switch, create the VLANs and give them names, then assign each access port to one VLAN. An access port carries one VLAN without tags, which is what PCs and printers expect. A port for an IP phone can carry a data VLAN and a separate voice VLAN with switchport voice vlan. Add spanning-tree portfast on access ports so PCs get their link and DHCP lease quickly.\n\nLinks between switches, and from the core switch to the router, are trunks: they carry many VLANs, each frame tagged with 802.1Q. Set them explicitly with switchport mode trunk, restrict them with switchport trunk allowed vlan, and set the native VLAN (the untagged one) to an unused VLAN on both ends. On older multilayer switches like the 3560 you must first set switchport trunk encapsulation dot1q; 2960 switches only support 802.1Q, so the command does not exist there. Verify with show vlan brief (access ports per VLAN) and show interfaces trunk (allowed and active VLANs).",
        bullets: ["vlan 10, then name STAFF", "switchport mode access, switchport access vlan 10", "switchport mode trunk, switchport trunk allowed vlan 10,20,30,40,99", "Native VLAN must match on both ends of a trunk"],
      },
      {
        heading: "Inter-VLAN routing",
        body: "Devices in different VLANs need a router (or a layer 3 switch) to talk. With router-on-a-stick, the router's physical interface connects to a trunk port, and you create one subinterface per VLAN: interface g0/0.10, then encapsulation dot1Q 10, then ip address 10.20.10.1 255.255.255.0. That address is the default gateway for every host in VLAN 10. The physical interface itself needs no shutdown, or none of the subinterfaces will come up.\n\nOn a layer 3 switch, create an SVI per VLAN instead (interface vlan 10 with the gateway IP) and enable ip routing globally. Either way, verify with show ip interface brief (every gateway up/up) and show ip route (one connected route per VLAN). Then test from a PC in each VLAN: ping its own gateway, then a host in another VLAN. If the gateway ping fails, the problem is the VLAN or trunk; if only the cross-VLAN ping fails, check the routing or the other host's gateway setting.",
        visual: {
          type: "sequence",
          title: "A staff PC reaching a server in another VLAN",
          actors: ["PC (VLAN 10)", "Switch", "Router g0/0.10 and .40", "Server (VLAN 40)"],
          messages: [
            { from: 0, to: 1, label: "Frame to gateway MAC, untagged on access port" },
            { from: 1, to: 2, label: "Sent on trunk tagged VLAN 10" },
            { from: 2, to: 1, label: "Routed, sent back tagged VLAN 40" },
            { from: 1, to: 3, label: "Untagged on the server's access port" },
            { from: 3, to: 1, label: "Reply to its gateway, VLAN 40" },
            { from: 2, to: 0, label: "Routed back via VLAN 10" },
          ],
        },
      },
      {
        heading: "DHCP, DNS and NAT",
        body: "For DHCP on the router, first exclude addresses you keep static with ip dhcp excluded-address, then create a pool per VLAN with network, default-router and dns-server. The router answers DHCP on each subinterface whose subnet matches a pool. If DHCP lives on a server instead, put ip helper-address with the server's IP on each VLAN subinterface. Check leases with show ip dhcp binding.\n\nFor DNS in Packet Tracer, use a Server device: on its Services tab turn DNS on and add A records such as files.office.lan. In GNS3, run a small Linux VM as the DNS server.\n\nFor NAT, mark interfaces with ip nat inside (each VLAN subinterface) and ip nat outside (the WAN interface), create a standard ACL that matches your internal range, and add ip nat inside source list 1 interface g0/1 overload. Verify by browsing from a PC, then run show ip nat translations to see the inside local address mapped to the outside interface's address and port.",
        bullets: ["ip dhcp excluded-address before ip dhcp pool", "show ip dhcp binding lists leases", "ip nat inside on LAN side, ip nat outside on WAN side", "show ip nat translations proves NAT works"],
      },
      {
        heading: "ACLs, Wi-Fi and verification",
        body: "Turn the zone matrix into extended named ACLs, one per VLAN, applied inbound on that VLAN's subinterface so traffic is filtered as close to its source as possible. Put specific permits (such as guests to the DNS server on UDP 53) before broad denies, end with the permit that allows the rest, and remember the implicit deny. After applying, use show access-lists: the match counters next to each line prove which rules traffic actually hits.\n\nFor Wi-Fi in Packet Tracer, connect an access point to a switch port in the right VLAN (or a trunk for multi-SSID APs), set the SSID and WPA2-PSK key, and add a wireless card to laptops. Finally, verify from every VLAN with a fixed checklist: lease received, ping gateway, ping a host in an allowed VLAN, blocked VLAN refused, DNS name resolves, internet reachable. Save with copy running-config startup-config on every device.",
        visual: {
          type: "flow",
          title: "Verification checklist per VLAN",
          steps: [
            { label: "Lease", detail: "ipconfig shows an IP from the right pool" },
            { label: "Gateway", detail: "ping the VLAN's .1 address" },
            { label: "Allowed VLAN", detail: "ping or open a permitted service" },
            { label: "Blocked VLAN", detail: "Should fail, ACL counters go up" },
            { label: "DNS", detail: "nslookup files.office.lan" },
            { label: "Internet", detail: "Browse; NAT translation appears" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Show commands for each build step",
        root: "Verify as you build",
        children: [
          { label: "Links", children: ["show ip interface brief", "show cdp neighbors"] },
          { label: "VLANs and trunks", children: ["show vlan brief", "show interfaces trunk"] },
          { label: "Routing", children: ["show ip route", "show ip interface brief"] },
          { label: "DHCP and NAT", children: ["show ip dhcp binding", "show ip nat translations"] },
          { label: "ACLs", children: ["show access-lists", "show ip interface g0/0.20"] },
        ],
      },
    ],
    examples: [
      {
        title: "Configuring an access switch",
        explanation: "The floor switch has PCs on ports 1 to 20, phones with PCs behind them on ports 21 to 24, and an uplink on Gi0/1. Step 1: create the VLANs. Step 2: configure access ports with portfast. Step 3: configure phone ports with both a data and a voice VLAN. Step 4: configure the trunk with only the needed VLANs and an unused native VLAN. Step 5 (not shown): create VLAN 99, give the switch a management IP on interface vlan 99 with ip default-gateway, then save.",
        code: {
          lang: "text",
          code: "vlan 10\n name STAFF\nvlan 30\n name VOICE\ninterface range fa0/1 - 20\n switchport mode access\n switchport access vlan 10\n spanning-tree portfast\ninterface range fa0/21 - 24\n switchport mode access\n switchport access vlan 10\n switchport voice vlan 30\ninterface g0/1\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30,40,99",
        },
      },
      {
        title: "DHCP pools and a guest ACL on the router",
        explanation: "The router serves DHCP for guests and must keep them away from internal subnets while letting them use the internal DNS server. Step 1: exclude the addresses you keep. Step 2: create the guest pool (the staff pool looks the same). Step 3: write the guest ACL: first permit DHCP, because lease renewals go to the router's own address inside 10.20.0.0/16, then permit DNS to the server, then deny the internal range, then permit anything else. Step 4: apply it inbound on the guest subinterface. Step 5: test from a guest laptop and watch the counters with show access-lists.",
        code: {
          lang: "text",
          code: "ip dhcp excluded-address 10.20.20.1 10.20.20.9\nip dhcp pool GUEST\n network 10.20.20.0 255.255.254.0\n default-router 10.20.20.1\n dns-server 10.20.40.10\nip access-list extended GUEST-IN\n permit udp any eq bootpc any eq bootps\n permit udp 10.20.20.0 0.0.1.255 host 10.20.40.10 eq 53\n deny   ip 10.20.20.0 0.0.1.255 10.20.0.0 0.0.255.255\n permit ip 10.20.20.0 0.0.1.255 any\ninterface g0/0.20\n ip access-group GUEST-IN in",
        },
      },
    ],
    cheatSheet: [
      "Access port: switchport mode access + switchport access vlan N",
      "Trunk: switchport mode trunk + switchport trunk allowed vlan list",
      "Router subinterface: interface g0/0.10, encapsulation dot1Q 10, ip address",
      "Physical router interface needs no shutdown for its subinterfaces to work",
      "DHCP: ip dhcp excluded-address first, then ip dhcp pool with network and default-router",
      "PAT: ip nat inside source list 1 interface g0/1 overload",
      "Apply extended ACLs inbound on the source VLAN's interface",
      "Save on every device: copy running-config startup-config",
    ],
    quiz: [
      {
        q: "All router subinterfaces show down. What is the most likely cause?",
        options: ["The DHCP pool is full", "NAT is missing", "The physical interface g0/0 is still shut down", "The ACL denies all traffic"],
        answer: 2,
        why: "Subinterfaces depend on the physical interface, which is shut down by default on Cisco routers.",
      },
      {
        q: "Which command shows which VLANs are allowed and active on a trunk?",
        options: ["show interfaces trunk", "show vlan brief", "show ip route", "show running-config | include vlan"],
        answer: 0,
        why: "show interfaces trunk lists mode, native VLAN, allowed VLANs and VLANs active on each trunk.",
      },
      {
        q: "PCs in VLAN 20 get no DHCP lease, but the router has a pool for 10.20.20.0/23 and the DHCP server is the router. What should you check first?",
        options: ["The NAT overload command", "The DNS records", "The ACL on VLAN 10", "That VLAN 20 exists on the switch and is allowed on the trunk"],
        answer: 3,
        why: "If VLAN 20 frames never reach the router, its DHCP pool can never answer.",
      },
      {
        q: "In ip nat inside source list 1 interface g0/1 overload, what does overload do?",
        options: ["Allows only one inside host at a time", "Uses port numbers so many inside hosts share the one outside address", "Blocks traffic when the link is busy", "Creates static NAT"],
        answer: 1,
        why: "Overload enables PAT, multiplexing many inside connections onto one public address by port.",
      },
      {
        q: "Why put the permit for guest DNS above the deny to 10.20.0.0/16 in the guest ACL?",
        options: ["ACLs are read bottom-up", "The first matching line wins, so the deny would otherwise block DNS", "DNS uses TCP only", "The router requires permits first"],
        answer: 1,
        why: "ACLs stop at the first match, so the more specific permit must come first.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Configure a 2960 switch port fa0/5 for a printer in VLAN 10 and verify it.",
        hint: "Access mode, VLAN, portfast, then a show command.",
        solution: "interface fa0/5\n switchport mode access\n switchport access vlan 10\n spanning-tree portfast\n description Printer floor 1\nend\nshow vlan brief          ! Fa0/5 listed under VLAN 10\nshow interfaces fa0/5 switchport",
      },
      {
        level: "medium",
        task: "Configure router-on-a-stick on g0/0 for VLANs 10, 20, 30, 40 and 99 using the addressing plan (gateway .1 in each 10.20.x.0 network, /23 for VLAN 20).",
        hint: "One subinterface per VLAN, plus no shutdown on the physical interface.",
        solution: "interface g0/0\n no shutdown\ninterface g0/0.10\n encapsulation dot1Q 10\n ip address 10.20.10.1 255.255.255.0\ninterface g0/0.20\n encapsulation dot1Q 20\n ip address 10.20.20.1 255.255.254.0\n! repeat the same pattern for .30, .40 and .99 (255.255.255.0)\nend\nshow ip interface brief",
      },
      {
        level: "hard",
        task: "Move DHCP from the router to a server at 10.20.40.5 without breaking any VLAN. Write the router changes and the order you would apply them.",
        hint: "Clients broadcast; the router must relay, and old pools must stop answering.",
        solution: "1. Build matching scopes on the server (same ranges, gateways, DNS).\n2. On each VLAN subinterface that uses DHCP:\n   interface g0/0.10\n    ip helper-address 10.20.40.5\n   (repeat for .20, .30)\n3. Allow UDP 67/68 between VLANs and the server in any ACL.\n4. Remove the router pools: no ip dhcp pool STAFF (etc.)\n5. Renew a client in each VLAN; check leases on the server.\n6. Keep old pools' configs saved for rollback.",
      },
    ],
    faq: [
      { q: "Is Cisco Packet Tracer free?", a: "Yes. It is free to download for anyone who signs up for a Cisco Networking Academy account, and it runs on Windows, macOS and Linux." },
      { q: "Should I use Packet Tracer or GNS3?", a: "Packet Tracer is easier and ideal for learning Cisco CLI and CCNA-level topics. GNS3 runs real device images and real captures, which is closer to production but needs images and more resources." },
      { q: "Why does my PC get a 169.254 address?", a: "It asked for DHCP and nobody answered, so it gave itself a link-local address. Check the port's VLAN, the trunk, the DHCP pool and any helper-address." },
      { q: "What is the difference between running-config and startup-config?", a: "running-config is the active configuration in memory. startup-config is stored in NVRAM and loaded at boot, so copy running-config startup-config to keep your changes." },
    ],
  },

  "net-capstone/packet-analysis": {
    plain: [
      "You have studied DHCP, ARP, DNS, TCP and TLS one by one. In this project you see them all working together in your own network. You capture the packets while a laptop joins the network and opens a web page, then explain each step in plain words.",
      "The order is always the same, because each step needs the one before it. The laptop first gets an address with DHCP, then finds its gateway's MAC address with ARP, then looks up the website's IP with DNS, then opens a TCP connection, then secures it with TLS, and only then sends the web request.",
      "Your job is to annotate: next to each important packet, write what it does and why. For example: \"Packet 4: DHCP ACK. The server confirms 10.20.10.57 for 8 hours, gateway 10.20.10.1, DNS 10.20.40.10.\" Good annotations prove you understand what you see.",
      "At the end you write a short traffic report: what happened, how long each stage took, and anything unusual. This is exactly what network engineers write when they investigate real problems.",
    ],
    deepDive: [
      {
        heading: "Capturing a client joining the network",
        body: "To see DHCP you must capture before the client asks for an address. In GNS3, right-click the link between the client and the switch and choose Start capture; Wireshark opens and records that link. On a real Linux client, start tcpdump, then release and renew the lease (dhclient -r and dhclient, or nmcli connection down and up on NetworkManager systems). On Windows, ipconfig /release and ipconfig /renew. In Packet Tracer there is no pcap capture; use Simulation mode with the event filter set to DHCP, ARP and DNS, and step through the events, opening each packet's OSI view.\n\nIn the capture, filter with dhcp (the filter is called bootp in Wireshark versions before 3.0). You should see the four DORA messages, from 0.0.0.0 port 68 to 255.255.255.255 port 67 for Discover. Many clients then send ARP probes for the offered address (sender IP 0.0.0.0) to check nobody else uses it, followed by ARP for the gateway.",
        bullets: ["GNS3: right-click a link, Start capture", "Linux: dhclient -r then dhclient, or nmcli down and up", "Windows: ipconfig /release then /renew", "Packet Tracer: Simulation mode with event filters"],
      },
      {
        heading: "Reading DHCP and ARP",
        body: "Open the DHCP ACK and expand the options. Option 53 is the message type (1 Discover, 2 Offer, 3 Request, 5 ACK). Option 1 is the subnet mask, option 3 the router (default gateway), option 6 the DNS servers, option 51 the lease time and option 54 the server identifier. Write these values in your annotation and compare them with your addressing plan; a wrong gateway or DNS here explains many later failures.\n\nNext comes ARP. The client broadcasts \"Who has 10.20.10.1? Tell 10.20.10.57\" to ff:ff:ff:ff:ff:ff, and the router answers with its MAC directly to the client. Wireshark's arp filter shows both. Note that the gateway's MAC is the router's subinterface MAC, which is the same for every VLAN on a router-on-a-stick. If you see a duplicate address warning (Wireshark flags it as arp.duplicate-address-detected), two devices claim the same IP, a classic static-address mistake.",
        visual: {
          type: "sequence",
          title: "DHCP DORA and the first ARP",
          actors: ["Client", "Router (DHCP)"],
          messages: [
            { from: 0, to: 1, label: "Discover: broadcast, 0.0.0.0:68 to 255.255.255.255:67" },
            { from: 1, to: 0, label: "Offer: 10.20.10.57, gateway, DNS, lease" },
            { from: 0, to: 1, label: "Request: I accept 10.20.10.57" },
            { from: 1, to: 0, label: "ACK: confirmed for 8 hours" },
            { from: 0, to: 1, label: "ARP: who has 10.20.10.1?" },
            { from: 1, to: 0, label: "ARP reply: 10.20.10.1 is at router MAC" },
          ],
        },
      },
      {
        heading: "Capturing and annotating a web page load",
        body: "With the client online, capture while you open one site, ideally from a fresh browser session so nothing is cached. Modern browsers send DNS queries for both A and AAAA records, often in parallel. Some resolvers or browsers use DNS over HTTPS, which hides DNS inside TLS on port 443; for a clear lab capture, use a browser setting or curl that uses the system resolver.\n\nAfter DNS, find the TCP handshake (tcp.flags.syn == 1) and the TLS ClientHello (tls.handshake.type == 1). In the ClientHello, note the server_name (SNI) extension, which reveals the site name even though everything else is encrypted, and the ALPN extension listing h2 and http/1.1. In TLS 1.3 the ServerHello is followed only by encrypted records; the certificate is encrypted too. Watch out: Chrome and Firefox may use HTTP/3 over QUIC on UDP 443 instead of TCP. If you see no TCP to the site, filter with quic, or capture with curl --http1.1 or curl --http2 to force TCP.",
        visual: {
          type: "flow",
          title: "Annotating a page load in order",
          steps: [
            { label: "DNS", detail: "A and AAAA queries, answer time from dns.time" },
            { label: "TCP handshake", detail: "SYN, SYN-ACK, ACK: one round trip" },
            { label: "TLS handshake", detail: "ClientHello with SNI and ALPN, ServerHello" },
            { label: "HTTP request", detail: "Encrypted unless you have a key log" },
            { label: "Response and close", detail: "Data, then FIN or the connection is kept alive" },
          ],
        },
      },
      {
        heading: "Writing the traffic report",
        body: "A good report is short and factual. Start with the setup: where you captured (capture point), which client, which time, and which tools. Then list each stage with its key packets, the main values, and the time it took. Measure with Wireshark: dns.time gives DNS latency; the time between SYN and SYN-ACK gives the network round trip; the time from ClientHello to the first application data gives the TLS cost; http.time (if decrypted) gives server time.\n\nAdd overview statistics: Statistics, Protocol Hierarchy for the mix of traffic, and Conversations for who talked to whom. tshark can print the same in text with tshark -r file -qz io,phs and tshark -r file -qz conv,tcp, which is handy for pasting into the report. End with observations: anything unexpected, such as retransmissions, a slow DNS server, a wrong DNS server from DHCP, or background traffic you did not expect. Before sharing a capture, remove or trim private data.",
        bullets: ["Setup: capture point, client, time, tools", "Each stage: key packets, values, duration", "Statistics: protocol hierarchy and conversations", "Observations and anything unusual"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What each protocol reveals in your capture",
        layers: [
          { label: "TLS", detail: "Server name (SNI), ALPN, version; content encrypted" },
          { label: "TCP", detail: "Ports, handshake timing, retransmissions" },
          { label: "DNS", detail: "Names looked up and the IPs returned" },
          { label: "IP", detail: "Source and destination, TTL hints at hop count" },
          { label: "ARP and DHCP", detail: "MACs, leased address, gateway, DNS server" },
        ],
      },
    ],
    examples: [
      {
        title: "Annotated sample of a client join",
        explanation: "Captured on the link between PC-Staff-1 and the access switch in GNS3. Step 1: filter dhcp || arp. Step 2: read and annotate each packet as below. Step 3: check the values against the addressing plan: the lease, gateway and DNS all match, and the ARP reply MAC belongs to the router's g0/0 interface. This block goes straight into the report.",
        code: {
          lang: "text",
          code: "No.  Time    Summary                                   Annotation\n1    0.000   DHCP Discover  0.0.0.0 -> 255.255.255.255  Client asks for any address\n2    0.004   DHCP Offer     10.20.10.1 -> 10.20.10.57   Router offers .57, 8 h lease\n3    0.005   DHCP Request   0.0.0.0 -> 255.255.255.255  Client accepts .57 (broadcast)\n4    0.008   DHCP ACK       10.20.10.1 -> 10.20.10.57   Opt 3 gw .1, opt 6 DNS 10.20.40.10\n5    0.010   ARP  Who has 10.20.10.57? Tell 0.0.0.0     Probe: is .57 already used?\n9    1.120   ARP  Who has 10.20.10.1? Tell 10.20.10.57  Find the gateway MAC\n10   1.123   ARP  10.20.10.1 is at 0c:1a:2b:3c:4d:00    Router replies directly",
        },
      },
      {
        title: "Timing a page load from the command line",
        explanation: "To put real numbers in the report, capture a single HTTPS request made with curl, forcing HTTP/2 over TCP so QUIC does not hide the handshake. Step 1: start tcpdump. Step 2: run curl with timing output. Step 3: stop the capture. Step 4: use tshark to list DNS, handshake and TLS packets with relative times. Compare curl's numbers with the packet times; they should agree within a millisecond or two.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i eth0 -nn -w load.pcap 'port 53 or tcp port 443' &\ncurl -s -o /dev/null --http2 -w 'dns %{time_namelookup} tcp %{time_connect} tls %{time_appconnect} ttfb %{time_starttransfer}\\n' https://example.com\nsudo kill -INT %1\ntshark -r load.pcap -Y 'dns || tcp.flags.syn == 1 || tls.handshake' \\\n  -T fields -e frame.time_relative -e _ws.col.Info\ntshark -r load.pcap -qz io,phs",
        },
      },
    ],
    cheatSheet: [
      "Start capturing before the client joins, or DHCP is missed",
      "Filters: dhcp (bootp before Wireshark 3.0), arp, dns, tcp.flags.syn == 1, tls.handshake",
      "DHCP options: 53 type, 1 mask, 3 gateway, 6 DNS, 51 lease time, 54 server ID",
      "ClientHello SNI shows the site name even though TLS hides the content",
      "Browsers may use QUIC on UDP 443; filter quic or force TCP with curl --http2",
      "dns.time and SYN to SYN-ACK gap give DNS latency and network RTT",
      "tshark -qz io,phs and -qz conv,tcp print stats for the report",
      "Packet Tracer: use Simulation mode; GNS3: right-click a link, Start capture",
    ],
    quiz: [
      {
        q: "Which DHCP option carries the default gateway?",
        options: ["Option 6", "Option 51", "Option 53", "Option 3"],
        answer: 3,
        why: "Option 3 is Router (default gateway); 6 is DNS, 51 is lease time, 53 is message type.",
      },
      {
        q: "Your capture of a browser loading a site shows DNS but no TCP to the site's IP. What is a likely explanation?",
        options: ["The browser used HTTP/3 over QUIC on UDP 443", "TCP is never used on the web", "DNS failed", "The capture filter removed DNS"],
        answer: 0,
        why: "Modern browsers often use QUIC, which runs over UDP, so a TCP-only view shows nothing.",
      },
      {
        q: "In a TLS 1.3 capture without a key log, what can you still read in the ClientHello?",
        options: ["The HTTP path", "The cookies", "The server name (SNI) and ALPN protocols", "The server's certificate"],
        answer: 2,
        why: "SNI and ALPN are sent in clear in the ClientHello; in TLS 1.3 the certificate is encrypted.",
      },
      {
        q: "Why does a DHCP Discover have source IP 0.0.0.0?",
        options: ["It is a bug in the client", "The client has no address yet", "It hides the client's identity", "Routers require it"],
        answer: 1,
        why: "The client is asking for an address, so it has none to use as the source.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Capture a DHCP renewal on your own Linux or Windows machine and write down the leased IP, gateway, DNS servers and lease time from the ACK.",
        hint: "Start the capture first, then release and renew; open the ACK's options.",
        solution: "sudo tcpdump -i eth0 -nn -w dhcp.pcap 'udp port 67 or udp port 68' &\nsudo nmcli connection down \"Wired connection 1\" && sudo nmcli connection up \"Wired connection 1\"\nsudo kill -INT %1\ntshark -r dhcp.pcap -Y 'dhcp.option.dhcp == 5' -V | grep -E 'Your|Router|Domain Name Server|Lease Time'",
      },
      {
        level: "medium",
        task: "Capture one HTTPS page load and produce a table with the time of the first DNS query, DNS answer, SYN, SYN-ACK, ClientHello and ServerHello.",
        hint: "Use tshark with -Y for those packets and print frame.time_relative.",
        solution: "tshark -r load.pcap -Y 'dns || tcp.flags.syn == 1 || tls.handshake.type == 1 || tls.handshake.type == 2' \\\n  -T fields -e frame.time_relative -e ip.src -e ip.dst -e _ws.col.Info\n# DNS time      = answer - query\n# Network RTT   = SYN-ACK - SYN\n# TLS to hello  = ServerHello - ClientHello",
      },
      {
        level: "hard",
        task: "Write a one-page traffic report for your capture, with setup, a stage-by-stage table, statistics and observations.",
        hint: "Use the structure from the deep dive and real numbers from your capture.",
        solution: "Setup: GNS3 link PC1-SW1, 2026-03-02 10:14, tcpdump + Wireshark 4.x.\nStages:\n  DHCP DORA     0.000-0.008 s  lease 10.20.10.57, gw .1, DNS .40.10\n  ARP gateway   1.120-1.123 s  router MAC 0c:1a:2b:3c:4d:00\n  DNS A/AAAA    1.300-1.318 s  example.com -> 93.184.215.14 (18 ms)\n  TCP handshake 1.320-1.405 s  RTT 85 ms\n  TLS 1.3       1.405-1.495 s  SNI example.com, ALPN h2\nStats: 92% TLS, 5% DNS, 3% other; 3 conversations.\nObservations: no retransmissions; an extra AAAA query got no answer\n(no IPv6 in the lab), which is expected.",
      },
    ],
    faq: [
      { q: "Can I capture packets in Cisco Packet Tracer?", a: "Packet Tracer does not produce pcap files, but Simulation mode lets you step through each event and inspect every packet layer by layer. For real pcap files, use GNS3 or a physical lab." },
      { q: "Why is the DHCP filter called bootp in some guides?", a: "DHCP is built on the older BOOTP protocol. Wireshark used the filter name bootp until version 3.0, when it was renamed to dhcp." },
      { q: "Is it safe to share my capture file?", a: "Only after checking it. Captures can hold passwords, cookies, internal IPs and names, so filter to what you need and save a trimmed copy with File, Export Specified Packets." },
    ],
  },

  "net-capstone/fault-scenarios": {
    plain: [
      "Building a network that works is only half the skill. The other half is fixing it when it breaks. In this project a partner, or a script, breaks your network on purpose, and you must find and fix each fault using the method and tools you learned.",
      "Typical faults are small and realistic: a switch port in the wrong VLAN, a trunk that forgets one VLAN, a PC with the wrong gateway, a missing route, a DNS server typo, or an ACL line that blocks too much. In real offices, these simple mistakes cause most outages.",
      "For each fault you work layer by layer. Start with the symptom and who is affected, test from the bottom up, and let each test result decide the next test. Do not guess and do not change many things at once.",
      "You also write it down. A short fault report records the symptom, the tests, the root cause, the fix, and how you confirmed it. Over time you collect a personal runbook that makes the next fault much faster to solve.",
    ],
    deepDive: [
      {
        heading: "Designing good fault scenarios",
        body: "Good practice faults are realistic, have one root cause each, and produce a clear symptom. Ask a partner to inject them without telling you what changed, or write a script that applies one random change from a list. Start with single faults, then try two at once, because real outages sometimes stack.\n\nCover every layer. Layer 1: a shut-down interface, a disconnected cable. Layer 2: wrong access VLAN, VLAN missing from a trunk, native VLAN mismatch, a port in err-disabled state from port security. Layer 3: wrong mask or gateway on a host, a missing static route, a subinterface with the wrong dot1Q tag, missing ip nat inside. Services: an exhausted DHCP pool, a missing helper-address, a wrong DNS server in the DHCP pool, a typo in a DNS record. Policy: an ACL line in the wrong order, an ACL applied in the wrong direction. Keep a list of faults with their expected symptoms, so the person injecting knows what the learner should see.",
        bullets: ["One root cause per scenario at first", "Cover layer 1, 2, 3, services and ACLs", "Keep an answer key with expected symptoms", "Progress to double faults later"],
      },
      {
        heading: "Diagnosing layer 1 and layer 2 faults",
        body: "Layer 1 and 2 faults usually make a whole host or VLAN go silent. Start on the client: does it have link, and does ipconfig or ip addr show an address from the right subnet? A 169.254.x.x address means DHCP got no answer, which is very often a VLAN problem rather than a DHCP problem.\n\nOn the switch, show interfaces status shows each port's state and VLAN; err-disabled means a protection feature such as port security shut it. show vlan brief shows whether the port sits in the expected VLAN. show interfaces trunk shows whether that VLAN is allowed and active on the uplink. A native VLAN mismatch produces CDP log messages (%CDP-4-NATIVE_VLAN_MISMATCH) and leaks traffic between VLANs. show mac address-table interface fa0/5 tells you whether the switch learned the client's MAC at all, and in which VLAN. If the MAC is learned in the wrong VLAN, the fix is the port's access VLAN.",
        visual: {
          type: "tree",
          title: "Client has 169.254.x.x: where to look",
          root: "No DHCP lease",
          children: [
            { label: "Access port", children: ["show interfaces status", "Wrong VLAN or err-disabled?"] },
            { label: "Trunk", children: ["show interfaces trunk", "VLAN allowed and active?"] },
            { label: "Router side", children: ["Subinterface dot1Q tag", "Interface up/up?"] },
            { label: "DHCP service", children: ["Pool exists and not exhausted?", "helper-address if server is remote"] },
          ],
        },
      },
      {
        heading: "Diagnosing layer 3 and service faults",
        body: "If the client has a correct address, test the path step by step: ping its own gateway, then a host in another VLAN, then an internet IP, then a name. The first test that fails points to the layer. Cannot ping the gateway with a correct IP: check the subinterface (tag, IP, up/up). Gateway works but other VLANs do not: check the other host's gateway and mask, and show ip route on the router. Internal works but internet IPs do not: check the default route and NAT with show ip nat translations while you ping; no new translation means NAT is not matching (wrong ACL or missing ip nat inside or outside).\n\nIf IPs work but names fail, it is DNS: nslookup name shows which server the client asks and what it returns. Check the dns-server value in the DHCP pool and the records on the DNS server. One-way problems usually mean a missing return route; a capture on both sides proves it.",
        visual: {
          type: "flow",
          title: "Path test order from a client",
          steps: [
            { label: "Own address", detail: "ipconfig: right subnet, mask, gateway, DNS" },
            { label: "Ping gateway", detail: "Fails: VLAN, trunk or subinterface" },
            { label: "Ping other VLAN", detail: "Fails: routing, other host's gateway or ACL" },
            { label: "Ping internet IP", detail: "Fails: default route or NAT" },
            { label: "Resolve a name", detail: "Fails: DNS server or record" },
            { label: "Open the service", detail: "Fails: ACL on the port or service down" },
          ],
        },
      },
      {
        heading: "ACL faults and documenting each fix",
        body: "ACL faults have a typical signature: some traffic works and some does not, often ping works but a service port fails, or one VLAN is cut off while others are fine. show access-lists shows match counters per line; clear access-list counters, repeat the failing test, and see which line's counter rises. That line is the one acting on your traffic. Also check direction and placement with show ip interface g0/0.20, which lists the inbound and outbound ACLs. A common mistake is applying an ACL out instead of in, or forgetting that the implicit deny drops everything a missing permit should have allowed.\n\nFor every fault, write a short report: symptom (what and who), tests run with results, root cause, fix (the exact command), verification (the original failing test now passes from the original client), and prevention. Time yourself. After a few rounds, common faults should take minutes, and your reports become a runbook other people can follow.",
        bullets: ["clear access-list counters, re-test, read counters", "show ip interface X shows ACL direction", "Re-test from the original failing client", "Report: symptom, tests, cause, fix, verification, prevention"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three faults that look alike: no internet",
        columns: [
          { title: "Wrong gateway on host", points: ["Same-subnet pings work", "Other VLANs and internet fail", "ipconfig shows odd gateway", "Fix the host or DHCP pool"] },
          { title: "NAT not matching", points: ["All internal pings work", "Internet IPs fail from every VLAN", "No new NAT translations", "Fix NAT ACL or inside/outside"] },
          { title: "DNS server wrong", points: ["Ping 1.1.1.1 works", "Names fail with a timeout", "nslookup shows the bad server", "Fix dns-server in the pool"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fault: one PC in VLAN 10 gets 169.254.12.7",
        explanation: "Symptom: one staff PC has no network; neighbours are fine, so scope is one port. Step 1: ipconfig shows 169.254.12.7, meaning no DHCP answer. Step 2: on the access switch, show interfaces status shows fa0/7 in VLAN 15 instead of 10. VLAN 15 is an unused VLAN that is not on the trunk and has no DHCP pool, so the PC's requests go nowhere. Step 3: show mac address-table interface fa0/7 confirms the PC's MAC was learned in VLAN 15. Step 4: fix the port, renew the lease, and run the full checklist. Root cause: a typo during desk changes put the port in VLAN 15.",
        code: {
          lang: "text",
          code: "SW1# show interfaces status | include Fa0/7\nFa0/7   PC-Staff-7   connected   15   a-full  a-100  10/100BaseTX\nSW1# configure terminal\nSW1(config)# interface fa0/7\nSW1(config-if)# switchport access vlan 10\nSW1(config-if)# end\nSW1# show vlan brief | include STAFF\n! On the PC: ipconfig /release, then ipconfig /renew",
        },
      },
      {
        title: "Fault: staff can ping the file server but cannot open shares",
        explanation: "Symptom: since this morning all staff fail to open \\\\files; ping to 10.20.40.20 works. Step 1: ping working but the service failing points above layer 3: an ACL or the service. Step 2: on the server the SMB service is running and listening on TCP 445. Step 3: on the router, clear the ACL counters and retry; the counter on a new deny line rises. Step 4: the line deny tcp any any eq 445, added to block SMB to the internet, was placed above the permit for the server. Step 5: move the permit above it, re-test from a staff PC, and record the cause and the fix.",
        code: {
          lang: "text",
          code: "R1# clear access-list counters STAFF-IN\nR1# show access-lists STAFF-IN\nExtended IP access list STAFF-IN\n    10 deny tcp any any eq 445 (37 matches)\n    20 permit tcp 10.20.10.0 0.0.0.255 host 10.20.40.20 eq 445\n    30 permit ip 10.20.10.0 0.0.0.255 any (120 matches)\nR1(config)# ip access-list extended STAFF-IN\nR1(config-ext-nacl)# no 20\nR1(config-ext-nacl)# 5 permit tcp 10.20.10.0 0.0.0.255 host 10.20.40.20 eq 445",
        },
      },
    ],
    cheatSheet: [
      "169.254.x.x on a client: no DHCP answer; check port VLAN, trunk, pool, helper",
      "show interfaces status: port state and VLAN; err-disabled needs a fix and a bounce",
      "show mac address-table interface X: was the client's MAC learned, and in which VLAN?",
      "Test order: own IP, gateway, other VLAN, internet IP, name, service port",
      "No new entries in show ip nat translations while pinging out: NAT is not matching",
      "Ping works, service fails: ACL or the service; check ACL match counters",
      "Native VLAN mismatch shows as CDP-4-NATIVE_VLAN_MISMATCH log messages",
      "Always re-test from the original failing client before closing the fault",
    ],
    quiz: [
      {
        q: "A PC has a correct IP and gateway, can ping other VLANs, but cannot reach any internet IP. Every VLAN has the same problem. What is most likely?",
        options: ["The PC's access port is in the wrong VLAN", "A DNS record is wrong", "NAT or the default route on the router is broken", "The trunk is missing a VLAN"],
        answer: 2,
        why: "Internal routing works for everyone, so the fault is at the internet edge: NAT or the default route.",
      },
      {
        q: "Which command shows whether a VLAN is allowed and active on a trunk?",
        options: ["show ip route", "show interfaces trunk", "show ip dhcp binding", "show access-lists"],
        answer: 1,
        why: "show interfaces trunk lists allowed and active VLANs per trunk.",
      },
      {
        q: "Ping to 8.8.8.8 works, but ping example.com fails. What do you check first?",
        options: ["The DNS server given to the client and its answers", "The trunk configuration", "The NAT translations", "The access port VLAN"],
        answer: 0,
        why: "IP connectivity is proven, so name resolution is the failing layer.",
      },
      {
        q: "An ACL seems to block traffic it should allow. What is the fastest way to see which line matches?",
        options: ["Delete the ACL", "Reboot the router", "Run show ip route", "Clear the ACL counters, repeat the test, and see which line's counter increases"],
        answer: 3,
        why: "Match counters show exactly which line acted on the traffic.",
      },
      {
        q: "A user's port shows err-disabled. What usually caused it?",
        options: ["A protection feature such as port security or BPDU guard shut it down", "The DHCP pool is full", "The DNS server is down", "The NAT table overflowed"],
        answer: 0,
        why: "Err-disabled is set by features that detect violations, like too many MACs or a BPDU on a portfast port.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a fault list of six scenarios for your partner, one per layer or service, each with its expected symptom.",
        hint: "Cover layer 1, layer 2, layer 3, DHCP, DNS and ACLs.",
        solution: "1. L1: shut fa0/3 -> PC3 no link.\n2. L2: fa0/5 to VLAN 30 -> PC5 gets wrong subnet or 169.254.\n3. L3: remove ip nat inside on g0/0.10 -> staff no internet.\n4. DHCP: pool GUEST network typo -> guests get 169.254.\n5. DNS: dns-server 10.20.40.11 in STAFF pool -> names fail.\n6. ACL: deny tcp any any eq 443 at top of STAFF-IN -> no HTTPS.",
      },
      {
        level: "medium",
        task: "Your partner removed VLAN 20 from the trunk between the core switch and the router. Describe the symptoms, the tests that reveal it, and the fix.",
        hint: "Which clients are affected, and what does show interfaces trunk show?",
        solution: "Symptoms: all guest devices (VLAN 20) get 169.254 or lose\nconnectivity; other VLANs fine.\nTests: guest PC ipconfig -> 169.254; on core switch:\n  show interfaces trunk -> VLAN 20 missing from allowed list.\nFix:\n  interface g0/1\n   switchport trunk allowed vlan add 20\nVerify: renew on a guest PC; ping 10.20.20.1; browse.",
      },
      {
        level: "hard",
        task: "Write a bash script for Linux lab clients that runs the path test order and prints the first failing step, so a learner can triage in seconds.",
        hint: "Get the gateway from ip route, then ping gateway, a host in another VLAN, an internet IP, then resolve a name.",
        solution: "#!/usr/bin/env bash\ngw=$(ip route | awk '/default/{print $3; exit}')\n[ -z \"$gw\" ] && { echo \"FAIL: no default gateway (check DHCP)\"; exit 1; }\nping -c1 -W1 \"$gw\" >/dev/null || { echo \"FAIL: gateway $gw (VLAN, trunk, subinterface)\"; exit 1; }\nping -c1 -W1 10.20.40.10 >/dev/null || { echo \"FAIL: other VLAN (routing or ACL)\"; exit 1; }\nping -c1 -W1 1.1.1.1 >/dev/null || { echo \"FAIL: internet IP (default route or NAT)\"; exit 1; }\ngetent hosts example.com >/dev/null || { echo \"FAIL: DNS\"; exit 1; }\necho \"OK: all layers pass\"",
      },
    ],
    faq: [
      { q: "What does a 169.254 IP address mean?", a: "It is a link-local address the device gave itself because no DHCP server answered. The cause is usually the wrong VLAN, a trunk problem, or a DHCP pool or relay issue." },
      { q: "How do I fix an err-disabled port on a Cisco switch?", a: "Find and remove the cause first (show interfaces status err-disabled and the logs), then reset the port with shutdown followed by no shutdown. You can also configure errdisable recovery to retry automatically." },
      { q: "What should a fault report contain?", a: "The symptom and scope, the tests you ran with results, the root cause, the exact fix, how you verified it from the affected client, and how to prevent it next time." },
      { q: "Why does ping work while the application fails?", a: "Ping only proves IP connectivity. The application also needs its TCP or UDP port open through every ACL and firewall, a running service, and working DNS." },
    ],
  },
};

export default extra;
