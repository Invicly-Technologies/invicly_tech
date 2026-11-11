import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-security/firewalls": {
    plain: [
      "A firewall is a guard at the door of a network or a computer. Every packet that wants to pass is checked against a list of rules: where it comes from, where it goes, which protocol and which port. The rules say allow or drop.",
      "The safest way to write rules is default deny. You block everything, then open only what is really needed, such as web traffic to the web server. Anything you forgot stays closed. The opposite, allowing everything and blocking a few bad things, always leaves holes.",
      "Simple firewalls, often called ACLs (access control lists), look at each packet alone. Smarter stateful firewalls remember connections. When your laptop opens a connection to a website, the firewall remembers it and lets the replies back in automatically, so you need far fewer rules.",
      "Firewalls also split a network into zones. Public servers sit in a DMZ (demilitarized zone), staff in an internal zone, guests in their own. Rules between zones decide who can talk to whom, so one infected guest laptop cannot reach your file server.",
    ],
    deepDive: [
      {
        heading: "Stateless ACLs versus stateful firewalls",
        body: "A stateless ACL judges each packet only by its headers. To let a web server answer, you need one rule for requests to port 443 and another for replies from port 443 back to the client's random high port (the ephemeral range, often 1024 to 65535 or 32768 to 60999 on Linux). That second rule is wide and easy to abuse.\n\nA stateful firewall keeps a connection table (on Linux, the conntrack table). The first packet of a flow is checked against the rules; if allowed, an entry is created, and later packets of that flow, plus replies, match the entry and pass. Linux names the states new, established, related (for example an ICMP error or an FTP data connection tied to a known flow) and invalid. Stateful filtering is safer and simpler, but the table uses memory and can fill up under a flood, so busy firewalls tune its size and timeouts.",
        visual: {
          type: "compare",
          title: "Allowing web replies: two approaches",
          columns: [
            { title: "Stateless ACL", points: ["Rule 1: in, dst port 443 allow", "Rule 2: out, src port 443 to 1024-65535 allow", "Each packet judged alone", "Fast, no memory per flow"] },
            { title: "Stateful firewall", points: ["Rule: new to port 443 allow", "Replies match the connection table", "Tracks new, established, related, invalid", "Table can fill during floods"] },
          ],
        },
      },
      {
        heading: "Rule order and default deny",
        body: "Most firewalls read rules from top to bottom and act on the first match. So specific rules go above general ones: a rule that drops one bad subnet must sit above the rule that allows the whole internet to port 443. Cisco ACLs also end with an invisible implicit deny any, so an ACL with only permit rules still blocks everything else.\n\nA good default-deny rule set for a server has a fixed shape: allow established and related traffic first (cheap, and it covers most packets), drop invalid packets, allow the loopback interface, allow needed ICMP, allow each service port from only the sources that need it, then let the default policy drop the rest. Log the final drops at a limited rate so you can see what is being blocked without flooding the log. Outbound rules matter too: a database server rarely needs to start connections to the internet.",
        bullets: ["Specific rules above general rules", "Cisco ACLs end with an implicit deny", "Allow established first for speed", "Allow ICMP; IPv6 breaks without ICMPv6", "Limit outbound traffic too, not only inbound"],
      },
      {
        heading: "nftables and ufw in practice",
        body: "On modern Linux, nftables is the packet filter; the iptables command on many distributions is now a front end to it. Rules live in tables (family inet covers IPv4 and IPv6 together) and chains attached to hooks such as input, forward and output. A chain's policy is what happens when no rule matches. Sets like { 22, 80, 443 } keep rules short and fast.\n\nKeep the full rule set in /etc/nftables.conf, check it with nft -c -f /etc/nftables.conf, and load it with nft -f. nft list ruleset shows what is active. ufw (Uncomplicated Firewall, default on Ubuntu) is a simpler wrapper: ufw default deny incoming, ufw allow 22/tcp, ufw allow from 10.0.0.0/24 to any port 5432 proto tcp, ufw enable. On a remote server, always allow SSH before setting a drop policy, and keep a second session open while testing.",
        bullets: ["nft -c -f file checks syntax without applying", "nft list ruleset shows active rules", "ufw status numbered shows rules with numbers", "ufw delete 3 removes rule number 3"],
      },
      {
        heading: "DMZs and segmentation",
        body: "Segmentation means splitting a network into zones and only allowing the traffic each zone needs. A classic design has three zones on one firewall: outside (the internet), DMZ (servers the public must reach, such as a web server or mail relay) and inside (staff and internal servers). The rules: outside may reach the DMZ only on its service ports; the DMZ may reach only specific inside services, such as the database on 5432; outside may never reach inside directly; inside may reach the internet.\n\nIf an attacker takes over the web server, they are stuck in the DMZ and can only reach what the rules allow. Inside larger networks, the same idea separates staff, guests, servers, management and IoT devices, often one VLAN and subnet per zone with the firewall or router ACLs between them. Microsegmentation pushes it further, with rules per workload, as cloud security groups do.",
        visual: {
          type: "flow",
          title: "Allowed paths in a three-zone design",
          steps: [
            { label: "Internet", detail: "Untrusted, default deny" },
            { label: "To DMZ only", detail: "TCP 80 and 443 to the web server" },
            { label: "DMZ web server", detail: "Compromise is contained here" },
            { label: "To inside, one port", detail: "Web server to database on TCP 5432 only" },
            { label: "Inside network", detail: "Never reachable from the internet directly" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Shape of a default-deny input chain",
        layers: [
          { label: "ct state established,related accept", detail: "Replies and known flows, most packets" },
          { label: "ct state invalid drop", detail: "Broken or out-of-state packets" },
          { label: "iif lo accept", detail: "Local programs talking to each other" },
          { label: "ICMP and ICMPv6 accept", detail: "Ping, errors, IPv6 neighbour discovery" },
          { label: "Service ports from allowed sources", detail: "SSH from admin subnet, 443 from anyone" },
          { label: "policy drop", detail: "Everything else, optionally logged" },
        ],
      },
    ],
    examples: [
      {
        title: "A complete nftables file for a web server",
        explanation: "The server must serve HTTP and HTTPS to everyone, accept SSH only from the admin subnet 10.0.99.0/24, and drop everything else. Step 1: write the file below. Step 2: check it with sudo nft -c -f /etc/nftables.conf. Step 3: load it with sudo nft -f /etc/nftables.conf while a second SSH session stays open. Step 4: enable the nftables service so it loads at boot.",
        code: {
          lang: "text",
          code: "#!/usr/sbin/nft -f\nflush ruleset\ntable inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n    ct state established,related accept\n    ct state invalid drop\n    iif \"lo\" accept\n    meta l4proto { icmp, ipv6-icmp } accept\n    ip saddr 10.0.99.0/24 tcp dport 22 accept\n    tcp dport { 80, 443 } accept\n    limit rate 5/minute log prefix \"nft-drop: \"\n  }\n  chain forward { type filter hook forward priority 0; policy drop; }\n}",
        },
      },
      {
        title: "Blocking guests from internal subnets with a Cisco ACL",
        explanation: "Guests on VLAN 20 (10.20.20.0/24) may use the internet but must not reach any other 10.20.x.x subnet. Step 1: write an extended named ACL: permit DHCP first (renewals go to the router's own internal address), deny guest traffic to the internal range, then permit guests to anything else. Step 2: apply it inbound on the guest subinterface, close to the source, as extended ACLs should be. Step 3: test from a guest: pinging the file server fails, browsing works. Without the final permit, the implicit deny would block the internet too.",
        code: {
          lang: "text",
          code: "ip access-list extended GUEST-IN\n permit udp any eq bootpc any eq bootps\n deny   ip 10.20.20.0 0.0.0.255 10.20.0.0 0.0.255.255\n permit ip 10.20.20.0 0.0.0.255 any\n!\ninterface g0/0.20\n ip access-group GUEST-IN in\n!\nshow access-lists GUEST-IN",
        },
      },
    ],
    cheatSheet: [
      "First matching rule wins: put narrow rules above broad ones",
      "Cisco ACLs end with an implicit deny any; standard 1-99, extended 100-199",
      "Place extended ACLs near the source, standard ACLs near the destination",
      "nft list ruleset shows active rules; nft -c -f file checks a file first",
      "ufw default deny incoming && ufw allow 22/tcp && ufw enable",
      "Allow SSH before a drop policy on a remote box, and keep a second session open",
      "Do not block all ICMPv6: IPv6 neighbour discovery needs it",
      "conntrack -L lists tracked connections (from the conntrack-tools package)",
    ],
    quiz: [
      {
        q: "A Cisco ACL has only one line: permit tcp any host 10.0.0.5 eq 443. What happens to SSH traffic to 10.0.0.5?",
        options: ["It is allowed because SSH is not mentioned", "It is denied by the implicit deny at the end", "It is allowed only from inside", "It is logged and allowed"],
        answer: 1,
        why: "Every Cisco ACL ends with an invisible deny any, so unmatched traffic is dropped.",
      },
      {
        q: "Why does a stateful firewall need no rule for reply packets?",
        options: ["Replies use port 0", "Replies are always encrypted", "Replies match an entry in its connection table", "Replies never pass a firewall"],
        answer: 2,
        why: "The first allowed packet creates a connection entry, and replies of that flow match it.",
      },
      {
        q: "In nftables, which family lets one table filter both IPv4 and IPv6?",
        options: ["inet", "ip", "ip6", "bridge"],
        answer: 0,
        why: "The inet family covers IPv4 and IPv6 in the same table and chains.",
      },
      {
        q: "A web server in the DMZ is hacked. With good segmentation, what can the attacker reach?",
        options: ["Every internal host", "Nothing at all, not even the internet", "Only the firewall's admin page", "Only the specific internal services the rules allow, such as the database port"],
        answer: 3,
        why: "Rules from the DMZ to inside allow only what the server needs, which limits the damage.",
      },
      {
        q: "Which rule order is correct for a default-deny input chain?",
        options: ["Drop all, then allow SSH", "Allow established and related, drop invalid, allow services, default drop", "Allow all, then drop known bad hosts", "Allow services, then allow established, then allow all"],
        answer: 1,
        why: "Known flows first, broken packets dropped, needed services opened, everything else hits the drop policy.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On an Ubuntu VM, use ufw to deny all incoming traffic, allow SSH and HTTPS, and show the result.",
        hint: "Set defaults first, allow ports, then enable.",
        solution: "sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status verbose",
      },
      {
        level: "medium",
        task: "Add an nftables rule that allows PostgreSQL (5432) only from the app subnet 10.0.10.0/24, and prove that other hosts are blocked.",
        hint: "Insert the rule into the existing inet filter input chain; test with nc from both places.",
        solution: "sudo nft add rule inet filter input ip saddr 10.0.10.0/24 tcp dport 5432 accept\nsudo nft list chain inet filter input\n# from 10.0.10.11:\nnc -zv 10.0.20.15 5432    # succeeded\n# from 10.0.30.7:\nnc -zv -w 3 10.0.20.15 5432   # timed out (dropped by policy)",
      },
      {
        level: "hard",
        task: "Write a zone matrix for an office with zones Internet, DMZ, Staff, Guests and Servers. For each pair, write allow (with ports) or deny, following least privilege.",
        hint: "Most cells should be deny; list only what each zone truly needs.",
        solution: "From \\ To  Internet   DMZ          Staff  Guests  Servers\nInternet   -          TCP 80,443   deny   deny    deny\nDMZ        TCP 443    -            deny   deny    TCP 5432 to DB only\nStaff      any        TCP 443,22   -      deny    TCP 445,443; UDP 53\nGuests     any        TCP 443      deny   -       UDP 53 to DNS only\nServers    TCP 443    deny         deny   deny    -\n(Return traffic is allowed by state tracking.)",
      },
    ],
    faq: [
      { q: "What is the difference between iptables and nftables?", a: "nftables is the newer Linux packet filtering framework that replaces iptables, with one tool (nft), IPv4 and IPv6 in one table, and sets for fast matching. Many distributions now run iptables commands on top of nftables via iptables-nft." },
      { q: "Do I need a firewall if my server only runs one service?", a: "Yes. Services you forgot about, such as a debug port or a database bound to 0.0.0.0, are common. A default-deny firewall protects you from your own mistakes." },
      { q: "Should I block ping?", a: "Blocking ICMP echo hides little and makes troubleshooting harder. Never block all ICMP, because error messages are needed for path MTU discovery, and IPv6 cannot work without ICMPv6." },
      { q: "What is a next-generation firewall?", a: "A firewall that also identifies applications and users, inspects content, and often includes intrusion prevention, instead of judging only by IP addresses and ports." },
    ],
  },

  "net-security/vpns": {
    plain: [
      "A VPN (virtual private network) is a private, encrypted tunnel through a public network like the internet. Packets go into the tunnel at one end, travel scrambled so nobody in the middle can read or change them, and come out at the other end as if they had crossed a private cable.",
      "There are two main uses. A site-to-site VPN links two whole networks, for example the head office and a branch office, through two gateways that keep the tunnel up all the time. A remote-access VPN connects one person's laptop or phone to the company network from home or a hotel.",
      "Different VPN technologies do the same job in different ways. IPsec is the old, standard choice for site-to-site links between routers and firewalls. WireGuard is a newer, very simple and fast protocol. TLS VPNs, such as OpenVPN, use the same encryption as HTTPS websites and pass through most firewalls.",
      "You also decide what goes through the tunnel. In a full tunnel, all traffic goes through the VPN, even when you watch videos. In a split tunnel, only traffic for company networks uses the VPN and the rest goes straight to the internet. Each choice has costs in speed and security.",
    ],
    deepDive: [
      {
        heading: "How IPsec builds a tunnel",
        body: "IPsec has two parts. IKE (Internet Key Exchange, today IKEv2) runs on UDP port 500. The two gateways first do IKE_SA_INIT, a Diffie-Hellman exchange that agrees on keys without sending them, then IKE_AUTH, where each proves who it is with a pre-shared key or a certificate. The result is an IKE security association (SA) and at least one child SA that protects the actual traffic.\n\nThe traffic itself is carried by ESP (Encapsulating Security Payload), IP protocol number 50, which encrypts and authenticates each packet. AH (protocol 51) only authenticates and is rarely used because it breaks through NAT. When a NAT device sits between the peers, NAT traversal wraps ESP inside UDP port 4500. So a firewall in front of an IPsec gateway must allow UDP 500, UDP 4500 and usually protocol 50.",
        bullets: ["IKE: UDP 500; NAT traversal: UDP 4500", "ESP: IP protocol 50; AH: IP protocol 51", "Both sides must agree on ciphers and DH group", "Child SAs are rekeyed regularly"],
        visual: {
          type: "sequence",
          title: "IKEv2 setting up an IPsec tunnel",
          actors: ["Branch gateway", "HQ gateway"],
          messages: [
            { from: 0, to: 1, label: "IKE_SA_INIT: proposals, DH share, nonce" },
            { from: 1, to: 0, label: "IKE_SA_INIT: chosen proposal, DH share" },
            { from: 0, to: 1, label: "IKE_AUTH: identity, auth, traffic selectors" },
            { from: 1, to: 0, label: "IKE_AUTH: identity, auth, child SA ready" },
            { from: 0, to: 1, label: "ESP packets carry the real traffic" },
          ],
        },
      },
      {
        heading: "Tunnel mode, transport mode and overhead",
        body: "In tunnel mode, IPsec takes the whole original packet, including its IP header, encrypts it, and puts it inside a new packet addressed from gateway to gateway. Hosts behind the gateways keep their private addresses, and an observer sees only the two gateway IPs. This is the normal mode for site-to-site VPNs. In transport mode, only the payload is protected and the original IP header stays; it is used for host-to-host protection, often together with another tunnel such as GRE.\n\nEncapsulation adds headers, so less room is left for data. ESP in tunnel mode usually costs about 50 to 80 bytes depending on the cipher, and WireGuard adds 60 bytes over IPv4 (80 over IPv6). That is why tunnel interfaces use a smaller MTU, such as WireGuard's common default of 1420. If path MTU discovery is blocked, large packets silently disappear, so gateways often clamp the TCP MSS to fit.",
        visual: {
          type: "layers",
          title: "An IPsec tunnel-mode packet",
          layers: [
            { label: "New IP header", detail: "Gateway A to gateway B, protocol 50" },
            { label: "ESP header", detail: "SPI and sequence number" },
            { label: "Original IP header (encrypted)", detail: "Private host to private host" },
            { label: "Original TCP or UDP and data (encrypted)", detail: "The user's real traffic" },
            { label: "ESP trailer and ICV", detail: "Padding and integrity check" },
          ],
        },
      },
      {
        heading: "WireGuard: keys, peers and AllowedIPs",
        body: "WireGuard is built into the Linux kernel and also runs on Windows, macOS, iOS and Android. It uses one fixed set of modern algorithms (Curve25519 for key exchange, ChaCha20-Poly1305 for encryption) based on the Noise protocol framework, so there are no cipher options to get wrong. Each side has a key pair, made with wg genkey and wg pubkey, and knows its peers only by their public keys. It runs over UDP; 51820 is the conventional port.\n\nThe key idea is cryptokey routing. For each peer, AllowedIPs is both an outbound route (traffic to these ranges is sent to this peer) and an inbound filter (packets from this peer must have a source inside these ranges). WireGuard is silent: it does not answer unauthenticated packets, so scanners cannot even see it. A peer behind NAT should set PersistentKeepalive = 25 so the NAT mapping stays open and the server can reach it.",
        bullets: ["wg genkey | tee priv | wg pubkey > pub", "wg-quick up wg0 reads /etc/wireguard/wg0.conf", "wg show prints peers, endpoints and latest handshake", "No handshake in the last 2-3 minutes on an active peer means trouble"],
      },
      {
        heading: "Remote access, TLS VPNs and split tunnelling",
        body: "Remote-access VPNs must work from hotels, cafes and mobile networks that may block unusual ports. TLS VPNs handle this well: OpenVPN uses UDP 1194 by default but can run on TCP 443, and many commercial clients use TLS on 443 so they look like normal HTTPS. Running a VPN over TCP has a cost: when a TCP connection inside a TCP tunnel loses packets, both layers retransmit, which can collapse throughput. Prefer UDP when the network allows it.\n\nFull tunnel sends all traffic through the VPN (AllowedIPs = 0.0.0.0/0, ::/0 in WireGuard). The company can filter and log everything, and users on hostile Wi-Fi are protected, but all video and updates load the VPN gateway. Split tunnel routes only company ranges (for example 10.0.0.0/8) through the VPN; it is faster and cheaper, but the laptop sits on two networks at once, so the endpoint itself must be well protected. DNS must match: with split tunnel, internal names still need the internal DNS server.",
        visual: {
          type: "compare",
          title: "Full tunnel versus split tunnel",
          columns: [
            { title: "Full tunnel", points: ["All traffic via the VPN", "Central filtering and logging", "Protects users on public Wi-Fi", "Heavier load on the VPN gateway"] },
            { title: "Split tunnel", points: ["Only company ranges via the VPN", "Internet traffic goes direct", "Faster, cheaper", "Laptop must be well secured"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Ports and protocols to allow for each VPN",
        root: "VPN traffic through a firewall",
        children: [
          { label: "IPsec", children: ["UDP 500 for IKE", "UDP 4500 for NAT traversal", "IP protocol 50 for ESP"] },
          { label: "WireGuard", children: ["One UDP port you choose", "51820 by convention"] },
          { label: "OpenVPN", children: ["UDP 1194 by default", "Often TCP 443 to pass strict networks"] },
          { label: "TLS or SSL VPN appliances", children: ["TCP 443", "Sometimes UDP for a faster data channel"] },
        ],
      },
    ],
    examples: [
      {
        title: "A WireGuard server for remote staff",
        explanation: "The office server has public IP 203.0.113.10 and LAN 10.0.0.0/16. Step 1: generate a key pair on the server and on each laptop. Step 2: write the server config below, with one [Peer] per laptop and AllowedIPs set to that laptop's single tunnel address. Step 3: enable IP forwarding and allow UDP 51820 in the firewall. Step 4: wg-quick up wg0 and enable wg-quick@wg0 at boot. The laptop config (as in the explainer) points Endpoint at 203.0.113.10:51820.",
        code: {
          lang: "text",
          code: "# /etc/wireguard/wg0.conf on the server\n[Interface]\nAddress = 10.8.0.1/24\nListenPort = 51820\nPrivateKey = SERVER_PRIVATE_KEY\n\n[Peer]\n# alice-laptop\nPublicKey = ALICE_PUBLIC_KEY\nAllowedIPs = 10.8.0.2/32\n\n# then: sudo sysctl -w net.ipv4.ip_forward=1\n#       sudo systemctl enable --now wg-quick@wg0\n#       sudo wg show",
        },
      },
      {
        title: "A site-to-site tunnel that will not come up",
        explanation: "A new IPsec tunnel between HQ (10.1.0.0/16) and a branch (10.2.0.0/16) stays down. Step 1: capture on the HQ outside interface: IKE packets arrive on UDP 500, then the branch switches to UDP 4500, which reveals NAT in front of it. Step 2: the HQ firewall allows only UDP 500, so add UDP 4500. Step 3: the tunnel comes up, but only some traffic passes; the branch's traffic selectors list 10.2.1.0/24 while HQ expects 10.2.0.0/16. Step 4: make both sides define the same subnets, and traffic flows.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i eth0 -nn 'udp port 500 or udp port 4500 or ip proto 50'\n# Seeing 4500 means NAT-T is in use; allow it on the firewall.\n# strongSwan status on Linux gateways:\nsudo swanctl --list-sas",
        },
      },
    ],
    cheatSheet: [
      "IPsec: IKE UDP 500, NAT-T UDP 4500, ESP IP protocol 50, AH IP protocol 51",
      "Tunnel mode wraps the whole packet (site-to-site); transport mode protects payload only",
      "WireGuard: wg genkey | tee priv | wg pubkey > pub",
      "AllowedIPs = routes out to the peer and allowed source IPs in from it",
      "AllowedIPs = 0.0.0.0/0, ::/0 means full tunnel",
      "PersistentKeepalive = 25 keeps NAT mappings open for peers behind NAT",
      "OpenVPN default port is UDP 1194; prefer UDP over TCP for tunnels",
      "Both sites need non-overlapping subnets, or routing across the tunnel breaks",
    ],
    quiz: [
      {
        q: "A firewall in front of an IPsec gateway allows UDP 500 only, and one peer sits behind NAT. What else must be allowed?",
        options: ["TCP 443", "UDP 4500 for NAT traversal", "UDP 1194", "TCP 22"],
        answer: 1,
        why: "With NAT in the path, IKE and ESP move to UDP 4500.",
      },
      {
        q: "In WireGuard, what does AllowedIPs = 10.0.0.0/16 on a peer do?",
        options: ["Only lets that peer log in from 10.0.0.0/16 public IPs", "Sets the server's listen address", "Routes traffic for 10.0.0.0/16 to that peer and accepts those sources from it", "Blocks 10.0.0.0/16"],
        answer: 2,
        why: "AllowedIPs works as both the routing table and the source filter for that peer.",
      },
      {
        q: "Which IPsec mode encrypts the entire original packet and adds a new IP header?",
        options: ["Tunnel mode", "Transport mode", "Aggressive mode", "Main mode"],
        answer: 0,
        why: "Tunnel mode encapsulates the whole original packet between the two gateways.",
      },
      {
        q: "Why is running a VPN over TCP often slower than over UDP?",
        options: ["TCP cannot be encrypted", "TCP uses more ports", "UDP packets are smaller", "Retransmissions at both the inner and outer TCP layers can collapse throughput"],
        answer: 3,
        why: "TCP inside TCP makes both layers react to loss, which can stall the connection.",
      },
      {
        q: "What is a downside of split tunnelling?",
        options: ["All traffic is slower", "The device is connected to the internet and the company network at once, so it must be well secured", "Internal names always resolve", "It cannot be used with WireGuard"],
        answer: 1,
        why: "Direct internet traffic bypasses company controls, so the endpoint becomes the boundary.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Generate a WireGuard key pair and show the public key. Explain which key you share and which you keep secret.",
        hint: "Use wg genkey and wg pubkey; set a strict umask first.",
        solution: "umask 077\nwg genkey | tee privatekey | wg pubkey > publickey\ncat publickey\n# Share publickey with peers; keep privatekey secret (mode 600).",
      },
      {
        level: "medium",
        task: "Change a laptop's WireGuard config from split tunnel (office 10.0.0.0/16 only) to full tunnel, and make sure DNS also goes to the office resolver 10.0.40.10.",
        hint: "Change AllowedIPs and add a DNS line in [Interface] for wg-quick.",
        solution: "[Interface]\nPrivateKey = LAPTOP_PRIVATE_KEY\nAddress = 10.8.0.2/24\nDNS = 10.0.40.10\n\n[Peer]\nPublicKey = SERVER_PUBLIC_KEY\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0, ::/0\nPersistentKeepalive = 25\n# The server also needs NAT (masquerade) for 10.8.0.0/24 to reach the internet.",
      },
      {
        level: "hard",
        task: "Build a WireGuard site-to-site link between two Linux routers: site A LAN 10.1.0.0/16, site B LAN 10.2.0.0/16, tunnel 10.9.0.0/30. Write both configs.",
        hint: "Each side's AllowedIPs lists the other side's tunnel address and LAN; enable forwarding.",
        solution: "# Site A wg0.conf\n[Interface]\nAddress = 10.9.0.1/30\nListenPort = 51820\nPrivateKey = A_PRIV\n[Peer]\nPublicKey = B_PUB\nEndpoint = 198.51.100.20:51820\nAllowedIPs = 10.9.0.2/32, 10.2.0.0/16\n# Site B: same shape, Address 10.9.0.2/30,\n#   Endpoint = A's public IP, AllowedIPs = 10.9.0.1/32, 10.1.0.0/16\n# Both: sysctl -w net.ipv4.ip_forward=1; allow forwarding in the firewall",
      },
    ],
    faq: [
      { q: "Is WireGuard more secure than OpenVPN?", a: "Both are considered secure when configured well. WireGuard's small code base and fixed modern ciphers leave less room for mistakes, while OpenVPN is more flexible, for example running over TCP 443." },
      { q: "Does a VPN make me anonymous?", a: "No. It hides your traffic from the local network and your ISP, but the VPN provider or company gateway can see it, and websites can still identify you through logins and cookies." },
      { q: "What port does WireGuard use?", a: "Any single UDP port you set with ListenPort. 51820 is the common convention used in most guides." },
      { q: "Why can I reach office servers by IP but not by name over the VPN?", a: "Your laptop is still using its local DNS server, which does not know internal names. Push the internal DNS server through the VPN, for example with a DNS line in a wg-quick config." },
    ],
  },

  "net-security/ids-attacks": {
    plain: [
      "Attackers use a small set of classic tricks again and again. They look around first (scanning), then try to sit in the middle of conversations (spoofing), or simply flood a target until it falls over (denial of service). Knowing how each one works on the wire is the first step to stopping it.",
      "An IDS (intrusion detection system) is like a security camera. It watches copies of network traffic and raises an alert when something looks like an attack. An IPS (intrusion prevention system) is like a guard at the door. It sits in the path of the traffic and can block bad packets before they arrive.",
      "These systems find attacks in two main ways. Signature detection looks for known patterns, like a fingerprint database. Anomaly detection learns what normal traffic looks like and warns when something is unusual. Signatures are precise but miss new attacks; anomalies can catch new things but cause more false alarms.",
      "No single tool stops everything. Real networks layer defences: switches that block ARP and DHCP tricks, firewalls that limit exposure, IDS sensors that watch, and TLS encryption that keeps intercepted traffic unreadable.",
    ],
    deepDive: [
      {
        heading: "ARP spoofing and man-in-the-middle",
        body: "ARP has no authentication. Any host on a LAN can send an ARP reply saying \"IP 192.168.1.1 is at my MAC address\", and most devices simply update their ARP cache, even if they never asked (a gratuitous ARP). An attacker sends such replies to a victim (claiming to be the gateway) and to the gateway (claiming to be the victim). Now both send their traffic to the attacker, who forwards it on, so nothing seems broken. That is a man-in-the-middle (MITM).\n\nSigns: the gateway's MAC in ip neigh suddenly changes or matches another host's MAC, and ARP traffic rises. Defences: Dynamic ARP Inspection on managed switches drops ARP replies that do not match the DHCP snooping table of known IP-to-MAC pairs; port security limits MACs per port; and TLS everywhere means intercepted traffic stays encrypted, and fake certificates trigger browser warnings.",
        visual: {
          type: "sequence",
          title: "ARP spoofing puts the attacker in the middle",
          actors: ["Victim", "Attacker", "Gateway"],
          messages: [
            { from: 1, to: 0, label: "Fake ARP: gateway IP is at attacker MAC" },
            { from: 1, to: 2, label: "Fake ARP: victim IP is at attacker MAC" },
            { from: 0, to: 1, label: "Victim's traffic goes to attacker" },
            { from: 1, to: 2, label: "Attacker reads it, forwards it" },
            { from: 2, to: 1, label: "Replies also pass the attacker" },
            { from: 1, to: 0, label: "Forwarded on, victim notices nothing" },
          ],
        },
      },
      {
        heading: "SYN floods and DDoS",
        body: "A SYN flood abuses the TCP handshake. The attacker sends huge numbers of SYN packets, often with fake source IPs, and never completes the handshake. Each one used to reserve a slot in the server's backlog of half-open connections, so real clients were refused. SYN cookies solve this: when the backlog is full, the server encodes the connection details in the sequence number of its SYN-ACK and stores nothing; only a real client's final ACK rebuilds the state. On Linux, net.ipv4.tcp_syncookies = 1 is the default.\n\nDDoS (distributed denial of service) uses thousands of machines. Volumetric attacks fill the link, often by amplification: small spoofed UDP queries to open DNS, NTP or memcached (UDP 11211) servers produce much larger replies aimed at the victim. Protocol attacks like SYN floods exhaust state. Application attacks send expensive HTTP requests. Big floods must be stopped upstream by the ISP, a scrubbing service or a CDN; a single server cannot out-filter a full pipe.",
        visual: {
          type: "tree",
          title: "Types of denial-of-service attack",
          root: "DDoS",
          children: [
            { label: "Volumetric", children: ["UDP floods", "DNS, NTP, memcached amplification", "Measured in Gbps"] },
            { label: "Protocol", children: ["SYN floods", "Fragment attacks", "Exhaust state tables"] },
            { label: "Application", children: ["HTTP floods on slow pages", "Slowloris holding connections", "Measured in requests per second"] },
          ],
        },
      },
      {
        heading: "Scanning and reconnaissance",
        body: "Before attacking, intruders map the target. Passive recon uses public data: DNS records, certificate transparency logs (which list every certificate issued for a domain), search engines and leaked documents. Active recon touches your systems: ping sweeps to find live hosts, port scans to find open services, and banner grabbing or version detection to find out what software runs there.\n\nOn the wire, a SYN scan looks like one source sending SYNs to many ports, getting SYN-ACKs from open ones and resets from closed ones, and then sending its own reset instead of completing the handshake. A horizontal scan hits one port across many hosts, typical of worms looking for one bug. Scans are cheap and constant on the internet, so alerting on every one creates noise; the useful defence is to expose little, keep exposed software patched, and alert on scans from inside your network, which are far more suspicious.",
        bullets: ["Vertical scan: many ports on one host", "Horizontal scan: one port on many hosts", "Internal scans are a strong compromise signal", "Certificate transparency reveals your hostnames"],
      },
      {
        heading: "Signature and anomaly detection",
        body: "Signature engines such as Suricata and Snort match traffic against rules. A rule has an action (alert, drop), a header (protocol, source, destination, ports) and options in parentheses: content matches bytes in the payload, flags matches TCP flags, threshold or detection_filter counts events over time, and sid gives each rule a unique ID. Rule sets like Emerging Threats are updated daily. Signatures produce few false positives for known threats but miss new or disguised ones.\n\nAnomaly detection builds a baseline of normal behaviour, such as usual traffic volumes, which hosts talk to which, typical DNS lengths, and flags deviations: a workstation suddenly uploading 20 GB at night, or sending DNS queries with very long random names (a sign of DNS tunnelling). Zeek is popular here: it writes rich logs (conn.log, dns.log, http.log, ssl.log) that analysts and machine learning tools search. Anomaly methods catch new attacks but need tuning, because normal also changes.",
        visual: {
          type: "compare",
          title: "Signature versus anomaly detection",
          columns: [
            { title: "Signature", points: ["Matches known patterns", "Few false positives", "Misses new attacks", "Needs rule updates"] },
            { title: "Anomaly", points: ["Compares with a baseline", "Can catch new attacks", "More false positives", "Needs learning and tuning"] },
          ],
        },
      },
      {
        heading: "Where to place an IDS or IPS",
        body: "An IDS needs a copy of traffic. It gets one from a switch mirror port (SPAN) or a network TAP, a small device that copies every frame. Because it is out of band, a crash or overload of the IDS never stops traffic, but by the time it alerts, the packet has already arrived. An IPS sits inline, like a bump in the wire, so it can drop bad packets, but it adds a little latency and becomes a failure point; inline devices often have fail-open bypass so traffic keeps flowing if they die.\n\nPlace sensors where they see the traffic you care about: just inside the internet firewall (attacks that got past it), in front of the DMZ, and between internal zones to catch movement from one compromised host to another. Encryption limits inspection: with TLS, sensors see IPs, ports, the server name and certificate data, but not content, unless TLS is terminated on a proxy that hands decrypted traffic to the IPS.",
        bullets: ["IDS: out of band via SPAN or TAP, alerts only", "IPS: inline, can drop, adds a failure point", "Sensors between zones catch lateral movement", "TLS hides content from both"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Life of an alert in an IDS",
        steps: [
          { label: "Traffic copied", detail: "SPAN port or TAP sends frames to the sensor" },
          { label: "Decode and reassemble", detail: "Engine rebuilds TCP streams and protocols" },
          { label: "Match rules", detail: "Signatures and thresholds are checked" },
          { label: "Alert", detail: "Event with sid, IPs and ports goes to the log" },
          { label: "Triage", detail: "Analyst or SIEM checks if it is real" },
          { label: "Respond", detail: "Block, isolate the host or tune the rule" },
        ],
      },
    ],
    examples: [
      {
        title: "Spotting ARP spoofing on a LAN",
        explanation: "Users say pages load slowly and one browser showed a certificate warning. Step 1: on a client, look at the gateway's ARP entry; its MAC is the same as another LAN host's MAC. Step 2: capture ARP traffic and see that host sending unsolicited ARP replies for 192.168.1.1 every second. Step 3: find that MAC in the switch's MAC table to locate the port, and shut it down. Step 4: enable DHCP snooping and Dynamic ARP Inspection on the access VLANs so it cannot happen again.",
        code: {
          lang: "bash",
          code: "ip neigh show 192.168.1.1\n# 192.168.1.1 dev eth0 lladdr 3c:52:82:aa:bb:cc REACHABLE\nip neigh | grep 3c:52:82:aa:bb:cc     # a second IP has the same MAC\nsudo tcpdump -i eth0 -nn -e arp\n# 3c:52:82:aa:bb:cc > ...: ARP, Reply 192.168.1.1 is-at 3c:52:82:aa:bb:cc\n# On a Cisco switch: show mac address-table address 3c52.82aa.bbcc",
        },
      },
      {
        title: "A SYN flood against a web server",
        explanation: "The site becomes unreachable. Step 1: ss shows thousands of sockets in SYN-RECV state, while ESTAB is normal. Step 2: tcpdump shows SYNs from thousands of random source IPs with no final ACKs. Step 3: confirm SYN cookies are on, so the server keeps accepting real clients even with a full backlog. Step 4: if the link itself is full, ask the ISP or move the site behind a CDN or DDoS protection service, because filtering at the server cannot help a saturated pipe.",
        code: {
          lang: "bash",
          code: "ss -s\nss -tn state syn-recv | wc -l          # thousands = flood\nsudo tcpdump -i eth0 -nn -c 20 'tcp[tcpflags] == tcp-syn and dst port 443'\nsysctl net.ipv4.tcp_syncookies          # should be 1\nsysctl net.ipv4.tcp_max_syn_backlog",
        },
      },
    ],
    cheatSheet: [
      "IDS watches a copy (SPAN or TAP) and alerts; IPS sits inline and can drop",
      "ARP spoofing defence: DHCP snooping plus Dynamic ARP Inspection, and TLS",
      "SYN flood sign: many SYN-RECV sockets; defence: net.ipv4.tcp_syncookies = 1",
      "Amplification abuses open UDP services: DNS 53, NTP 123, memcached 11211",
      "Suricata and Snort use signatures; Zeek writes protocol logs for analysis",
      "Rule parts: action, header (proto src port -> dst port), options with sid",
      "Scans from inside your own network are much more alarming than internet scans",
      "Test rules with suricata -T -c /etc/suricata/suricata.yaml before reloading",
    ],
    quiz: [
      {
        q: "What does Dynamic ARP Inspection check ARP packets against?",
        options: ["The DNS cache", "The routing table", "The DHCP snooping table of known IP-to-MAC bindings", "The firewall's NAT table"],
        answer: 2,
        why: "DAI drops ARP replies whose IP and MAC do not match bindings learned by DHCP snooping.",
      },
      {
        q: "How do SYN cookies protect a server?",
        options: ["They block all SYN packets", "They encode connection details in the SYN-ACK so no state is stored until the final ACK", "They encrypt the handshake", "They slow down every client equally"],
        answer: 1,
        why: "Without stored half-open state, fake SYNs cannot fill the backlog.",
      },
      {
        q: "Which is the main trade-off of an IPS compared with an IDS?",
        options: ["It is inline, so it can block traffic but adds latency and a point of failure", "It cannot read packets", "It only works with UDP", "It never produces false positives"],
        answer: 0,
        why: "Being in the path lets an IPS drop packets, but it also means its failures affect traffic.",
      },
      {
        q: "An attacker sends small spoofed queries to open DNS resolvers, which send large replies to the victim. What is this?",
        options: ["ARP spoofing", "A SYN flood", "Port scanning", "A reflection and amplification DDoS"],
        answer: 3,
        why: "Spoofed small requests reflected as large responses multiply the attacker's bandwidth.",
      },
      {
        q: "Which detection method is most likely to catch a brand-new attack, at the cost of more false alarms?",
        options: ["Signature detection", "Anomaly detection", "Port security", "Static ACLs"],
        answer: 1,
        why: "Anomaly detection flags unusual behaviour without needing a known pattern.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On a Linux server, check whether SYN cookies are enabled and how many half-open connections exist right now.",
        hint: "Use sysctl and ss with a state filter.",
        solution: "sysctl net.ipv4.tcp_syncookies      # 1 = on when the backlog overflows\nss -tn state syn-recv | tail -n +2 | wc -l\nss -s                               # overview of socket states",
      },
      {
        level: "medium",
        task: "Write a Suricata rule that alerts when any host sends an HTTP request whose URI contains /wp-login.php to your web servers, and test the config.",
        hint: "Use the http.uri sticky buffer, content, and a unique sid above 1000000.",
        solution: "# /etc/suricata/rules/local.rules\nalert http any any -> $HOME_NET any (msg:\"WordPress login attempt\"; \\\n  flow:established,to_server; http.uri; content:\"/wp-login.php\"; nocase; \\\n  classtype:attempted-recon; sid:1000010; rev:1;)\n# add local.rules to rule-files in suricata.yaml, then:\nsudo suricata -T -c /etc/suricata/suricata.yaml\nsudo tail -f /var/log/suricata/fast.log",
      },
      {
        level: "hard",
        task: "In a lab, run an nmap SYN scan against a VM you own while capturing on the VM. Use the capture to show how open and closed ports respond differently.",
        hint: "Capture on the target with a host filter; scan a few known ports.",
        solution: "# On the target VM (10.0.0.9):\nsudo tcpdump -i eth0 -nn 'host 10.0.0.5 and tcp' -w scan.pcap\n# From the scanner (10.0.0.5):\nsudo nmap -sS -p 22,80,8081 10.0.0.9\n# Read back:\ntcpdump -nn -r scan.pcap\n# Open 22:   [S] -> [S.] -> [R] from scanner (half-open)\n# Closed 8081: [S] -> [R.] from target",
      },
    ],
    faq: [
      { q: "What is the difference between an IDS and a firewall?", a: "A firewall allows or blocks traffic based on rules about addresses, ports and state. An IDS inspects traffic content and behaviour to spot attacks, even inside traffic the firewall allowed." },
      { q: "Is Snort or Suricata better?", a: "Both are mature open-source engines with compatible rule formats. Suricata has been multi-threaded for longer and adds rich protocol logging; Snort 3 is also multi-threaded. Choose based on your team's tooling." },
      { q: "Can HTTPS stop a man-in-the-middle attack?", a: "Mostly, yes. The attacker cannot read or change encrypted traffic without a certificate your device trusts, so browsers show a warning. Users clicking through warnings, or plain HTTP pages, remain at risk." },
      { q: "Can I stop a DDoS attack myself?", a: "Small attacks, yes, with SYN cookies, rate limits and filtering. Large volumetric attacks fill your internet link, so they must be filtered upstream by your ISP, a scrubbing service or a CDN." },
    ],
  },
};

export default extra;
