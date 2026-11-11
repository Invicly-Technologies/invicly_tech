import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-application/dns": {
    plain: [
      "Computers talk using numbers called IP addresses, but people remember names like www.example.com. DNS (the Domain Name System) is the internet's phone book. You give it a name, and it gives back the number, plus other facts such as which server handles email for that name.",
      "No single computer knows every name. The job is split up like a tree. The root servers know who runs .com, .org and the other endings. The .com servers know who runs example.com. Only example.com's own servers (the authoritative servers) know the real answer for www.example.com.",
      "Your laptop does not walk that tree itself. It asks one helper, the recursive resolver, usually run by your company, your internet provider, or a public service like 1.1.1.1 or 8.8.8.8. The resolver does the walking, then remembers (caches) the answer so the next person gets it instantly.",
      "Every answer comes with a TTL (time to live), a number of seconds the answer may be remembered. A long TTL means fewer lookups and faster sites. A short TTL means changes spread quickly. Choosing the TTL is the main trade-off you control as a DNS owner.",
    ],
    deepDive: [
      {
        heading: "What is inside a DNS message",
        body: "A DNS query and its reply use the same format: a 12-byte header, then the question, answer, authority and additional sections. The header holds an ID (to match replies to questions) and flags. RD (recursion desired) is set by clients asking a resolver to do the full job. RA means the server offers recursion. AA (authoritative answer) means the reply came from the zone's own server, not a cache. TC (truncated) means the answer did not fit in UDP and the client should retry over TCP.\n\nThe reply also carries a status code (RCODE). NOERROR with an empty answer means the name exists but has no record of that type. NXDOMAIN means the name does not exist at all. SERVFAIL means the resolver could not get a good answer, often because the authoritative servers are down or DNSSEC validation failed.",
        bullets: ["NOERROR: success (answer may still be empty)", "NXDOMAIN: no such name", "SERVFAIL: resolver failed upstream", "REFUSED: server will not answer you"],
      },
      {
        heading: "Delegation and glue records",
        body: "A zone hands part of the tree to someone else with NS records. The .com zone contains NS records for example.com that say: ask ns1.example.net or ns2.example.net. This hand-off is a referral, and the resolver follows it.\n\nThere is a chicken-and-egg problem when the name servers live inside the zone they serve, such as ns1.example.com for example.com. To find ns1.example.com you would need to ask example.com, which you cannot reach yet. The fix is glue: the parent zone also stores the A and AAAA addresses of those name servers and returns them in the additional section of the referral.\n\nThe SOA (start of authority) record at the top of every zone names the primary server, a serial number that secondaries watch for changes, and the negative-caching TTL used for NXDOMAIN answers.",
        visual: {
          type: "flow",
          title: "How a resolver follows referrals",
          steps: [
            { label: "Ask a root server", detail: "Reply: NS records for com, with glue" },
            { label: "Ask a .com server", detail: "Reply: NS records for example.com" },
            { label: "Ask example.com NS", detail: "Reply has the AA flag: the real answer" },
            { label: "Cache by TTL", detail: "Each record is kept for its own TTL" },
            { label: "Answer the client", detail: "Later clients get the cached copy" },
          ],
        },
      },
      {
        heading: "Record types you will really use",
        body: "Beyond A and AAAA, a handful of types cover almost every job. CNAME makes one name an alias of another; it cannot sit next to other records on the same name, so it is not allowed at the zone apex (example.com itself). Many DNS providers offer ALIAS or flattened records to get the same effect at the apex. MX lists mail servers with a preference number, where lower is tried first. TXT holds free text, used for SPF, DKIM, DMARC and domain ownership checks. NS names the zone's servers. PTR maps an address back to a name for reverse lookups, under in-addr.arpa for IPv4 and ip6.arpa for IPv6.\n\nNewer types matter too. CAA says which certificate authorities may issue certificates for your domain. SRV gives host and port for a service. HTTPS (and SVCB) records can advertise HTTP/3 support and alternative endpoints in one lookup.",
        bullets: ["MX 10 mx1.example.com is tried before MX 20 mx2.example.com", "CAA 0 issue \"letsencrypt.org\" limits who issues certificates", "dig -x 192.0.2.10 does a PTR lookup"],
      },
      {
        heading: "Caching, TTLs and planning a change",
        body: "Every resolver along the way caches answers: the public resolver, your router, and the operating system (systemd-resolved on many Linux systems). Negative answers are cached too, for the time given in the zone's SOA record, so a typo that returned NXDOMAIN can linger even after you add the record.\n\nTo move a website to a new IP with little pain, lower the TTL a day or two before the move, for example from 3600 to 300 seconds. Wait at least the old TTL so every cache picks up the short value. Make the change, check it, and raise the TTL again once you are happy. Some resolvers apply a minimum TTL or ignore very low values, so plan for a few stragglers.\n\nDNS normally runs on UDP port 53, and EDNS(0) lets replies be larger than the old 512-byte limit. Zone transfers (AXFR) and truncated answers use TCP port 53, so firewalls must allow both.",
      },
      {
        heading: "Private and secure DNS",
        body: "Classic DNS is not encrypted, so anyone on the path can read or change answers. Two kinds of protection exist and they solve different problems.\n\nDNSSEC signs records. The zone publishes DNSKEY records and RRSIG signatures, and the parent zone publishes a DS record that vouches for the child's key, building a chain of trust from the root. A validating resolver can then prove an answer was not forged. DNSSEC does not hide your queries.\n\nEncrypted transports hide queries from the local network: DNS over TLS (DoT) uses TCP port 853, and DNS over HTTPS (DoH) uses port 443 like normal web traffic. They protect the link between you and the resolver, but the resolver still sees everything you look up, so choose one you trust.",
        visual: {
          type: "compare",
          title: "DNSSEC versus encrypted DNS",
          columns: [
            { title: "DNSSEC", points: ["Signs the records", "Proves answers are genuine", "Queries still visible", "Set up by the zone owner"] },
            { title: "DoT and DoH", points: ["Encrypts the transport", "Hides queries from the local network", "Resolver still sees them", "Set up on the client and resolver"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Caches a lookup passes through",
        layers: [
          { label: "Application", detail: "Browsers keep their own short DNS cache" },
          { label: "Operating system", detail: "systemd-resolved or the Windows DNS client" },
          { label: "Home or office router", detail: "Often a small forwarding cache" },
          { label: "Recursive resolver", detail: "ISP, company or public, a large shared cache" },
          { label: "Authoritative servers", detail: "The source of truth, never a cache" },
        ],
      },
    ],
    examples: [
      {
        title: "Finding out why a new subdomain does not resolve",
        explanation: "You added api.example.com an hour ago, but some users get errors. Step 1: ask the authoritative server directly. If it answers, your zone is fine. Step 2: ask the public resolvers. If they return NXDOMAIN, they cached the negative answer from before you created the record. Step 3: check the SOA record; its last number is the negative-caching time. Waiting that long (or flushing the resolver cache if you run it) fixes it.",
        code: {
          lang: "bash",
          code: "dig NS example.com +short\n# ns1.dnshost.net.\ndig @ns1.dnshost.net api.example.com A +norecurse\n# flags: qr aa  -> authoritative answer exists\ndig @8.8.8.8 api.example.com A | grep status\n# status: NXDOMAIN  -> cached negative answer\ndig example.com SOA +short\n# ns1.dnshost.net. admin.example.com. 2026111001 7200 3600 1209600 3600",
        },
      },
      {
        title: "Moving a site with almost no downtime",
        explanation: "The site at www.example.com moves from 203.0.113.10 to 198.51.100.20. Two days before: change the TTL on the A record from 86400 to 300. Wait one full day so old caches expire. Move day: start the new server, change the A record, and keep the old server running and redirecting for a day. Check from several resolvers that the new IP and the short TTL appear. After a week, raise the TTL back to 3600 or more.",
        code: {
          lang: "bash",
          code: "dig www.example.com A +noall +answer\n# www.example.com. 86400 IN A 203.0.113.10   (before)\n# ...lower TTL, wait, change record...\nfor r in 1.1.1.1 8.8.8.8 9.9.9.9; do\n  dig @$r www.example.com A +noall +answer\ndone\n# www.example.com. 300 IN A 198.51.100.20",
        },
      },
    ],
    cheatSheet: [
      "dig name type +short gives just the answer; +noall +answer shows the record with its TTL",
      "dig @server name +norecurse asks one server only; an aa flag means it is authoritative",
      "NXDOMAIN: name does not exist; NOERROR with no answer: name exists, but not that record type",
      "DNS uses UDP 53 and TCP 53; DoT uses TCP 853; DoH uses 443",
      "No CNAME at the zone apex; use your provider's ALIAS or flattening feature",
      "Lower the TTL at least one old TTL before a migration, raise it again afterwards",
      "Negative answers are cached for the time set in the zone's SOA record",
      "resolvectl status (systemd) or cat /etc/resolv.conf shows which resolver you use",
    ],
    quiz: [
      {
        q: "A resolver returns SERVFAIL for a name that worked yesterday. What is a likely cause?",
        options: ["The name was deleted from the zone", "The authoritative servers are unreachable or DNSSEC validation failed", "The record type does not exist", "The TTL is too short"],
        answer: 1,
        why: "SERVFAIL means the resolver could not get a valid answer upstream, unlike NXDOMAIN, which is a clear no.",
      },
      {
        q: "Why do glue records exist?",
        options: ["To speed up reverse lookups", "To sign records for DNSSEC", "To join two zones into one", "To give the addresses of name servers that live inside the zone they serve"],
        answer: 3,
        why: "Without glue, finding ns1.example.com would require asking example.com, which you cannot reach yet.",
      },
      {
        q: "Which record tells certificate authorities whether they may issue a certificate for your domain?",
        options: ["CAA", "TXT", "PTR", "SRV"],
        answer: 0,
        why: "CAA records list the CAs allowed to issue for a domain, and CAs must check them.",
      },
      {
        q: "What does DNS over HTTPS protect against?",
        options: ["Forged records from the authoritative server", "The resolver seeing your queries", "People on your local network reading or changing your queries", "Expired TTLs"],
        answer: 2,
        why: "DoH encrypts the hop to the resolver, but the resolver itself still sees and answers every query.",
      },
      {
        q: "MX 10 a.example.com and MX 20 b.example.com both exist. Which is tried first?",
        options: ["b.example.com, because higher wins", "a.example.com, because lower preference is tried first", "Both at the same time", "A random one each time"],
        answer: 1,
        why: "MX preference works like a queue: the lowest number is tried first, higher numbers are backups.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the name servers, mail servers and the IPv6 address (if any) for a domain you use every day.",
        hint: "dig takes the record type after the name.",
        solution: "dig wikipedia.org NS +short\ndig wikipedia.org MX +short\ndig www.wikipedia.org AAAA +short\n# Note the TTLs too:\ndig wikipedia.org MX +noall +answer",
      },
      {
        level: "medium",
        task: "Prove whether an answer came from a cache or from the authoritative server, and watch the TTL count down.",
        hint: "Run the same query twice against a resolver, then once against the zone's own server with +norecurse.",
        solution: "dig @1.1.1.1 example.com A +noall +answer   # TTL e.g. 2874\nsleep 5\ndig @1.1.1.1 example.com A +noall +answer   # TTL about 5 lower: cached\nNS=$(dig example.com NS +short | head -1)\ndig @$NS example.com A +norecurse | grep -E 'flags|IN A'\n# flags include aa and the TTL is the full configured value",
      },
      {
        level: "hard",
        task: "Walk the delegation of www.example.com by hand without +trace: ask a root server, then the TLD server it refers you to, then the authoritative server.",
        hint: "Use +norecurse at each step and read the AUTHORITY and ADDITIONAL sections for the next server.",
        solution: "dig @a.root-servers.net www.example.com A +norecurse\n# AUTHORITY: com. NS a.gtld-servers.net. ...\ndig @a.gtld-servers.net www.example.com A +norecurse\n# AUTHORITY: example.com. NS a.iana-servers.net. ...\ndig @a.iana-servers.net www.example.com A +norecurse\n# ANSWER section with flags: aa\n# Compare with: dig +trace www.example.com",
      },
    ],
    faq: [
      { q: "Why do DNS changes take so long to show up?", a: "They do not travel anywhere; old answers simply stay in caches until their TTL runs out. Lowering the TTL before a change makes it appear faster." },
      { q: "Is 8.8.8.8 or 1.1.1.1 better than my ISP's resolver?", a: "Public resolvers are often fast and support DNSSEC validation and encrypted DNS. The best choice depends on speed from your location and whose privacy policy you trust." },
      { q: "What is the difference between a recursive and an authoritative server?", a: "An authoritative server holds the official records for its zones and answers only for them. A recursive resolver holds no zones of its own; it finds answers for clients and caches them." },
      { q: "How do I flush my DNS cache?", a: "On Linux with systemd-resolved run resolvectl flush-caches, on Windows run ipconfig /flushdns, and on macOS run sudo dscacheutil -flushcache followed by sudo killall -HUP mDNSResponder." },
    ],
  },

  "net-application/dhcp": {
    plain: [
      "When you plug in a laptop or join Wi-Fi, it needs an IP address, the address of the router (the default gateway), and the address of a DNS server. Typing these by hand on every device would be slow and full of mistakes. DHCP (Dynamic Host Configuration Protocol) hands them out automatically.",
      "A new device has no address yet, so it cannot send a normal letter. Instead it shouts to everyone on the local network: is there a DHCP server here? A server answers with an offer, the device says yes please, and the server confirms. These four steps are called DORA: Discover, Offer, Request, Acknowledge.",
      "The address is not given forever. It is lent for a time called the lease, for example 8 hours or 1 day. Halfway through, the device quietly asks to keep it longer. If a device leaves and never comes back, its address returns to the pool for someone else.",
      "Some devices, like printers and servers, should always get the same address. A reservation ties one address to one device's MAC address (its hardware ID), so you still get central control without typing settings on each device.",
    ],
    deepDive: [
      {
        heading: "Why the first messages are broadcasts",
        body: "A client starting from nothing sends DHCPDISCOVER from source address 0.0.0.0, UDP port 68, to the broadcast address 255.255.255.255, UDP port 67. Every device on the local network receives it, but only DHCP servers reply. The client then broadcasts DHCPREQUEST, even though it already knows the server, for a clever reason: there may be several servers that each made an offer. The broadcast request names the chosen server (option 54, server identifier), so the others learn their offer was declined and put their address back in the pool.\n\nAfter the ACK, a careful client checks that nobody else already uses the address, by sending ARP probes for it. If someone answers, the client sends DHCPDECLINE and starts again. A server sends DHCPNAK if the client asks for an address that is wrong for its subnet, for example after moving the laptop to another office.",
        bullets: ["DHCPDISCOVER, DHCPOFFER, DHCPREQUEST, DHCPACK: the normal four", "DHCPNAK: server says no, start over", "DHCPDECLINE: client found the address already in use", "DHCPRELEASE: client gives the address back early", "DHCPINFORM: client has an address and only wants options"],
      },
      {
        heading: "Lease timers: renewing and rebinding",
        body: "Two timers run inside the lease. At T1, by default 50% of the lease, the client sends a unicast DHCPREQUEST straight to the server that gave it the address. If the server answers with an ACK, the lease starts again from the full length and the user notices nothing.\n\nIf that server is down, the client keeps trying until T2, by default 87.5% of the lease. Then it switches to rebinding: it broadcasts the request so that any DHCP server can extend the lease. If the lease runs out with no answer at all, the client must stop using the address, and the network breaks for that device.\n\nShort leases (one hour) suit busy guest Wi-Fi where devices come and go. Long leases (one day or more) suit offices with stable desktops and reduce DHCP traffic.",
        visual: {
          type: "flow",
          title: "A lease from start to end",
          steps: [
            { label: "Bound", detail: "ACK received, address in use" },
            { label: "T1 at 50%", detail: "Unicast REQUEST to the same server" },
            { label: "T2 at 87.5%", detail: "Broadcast REQUEST to any server" },
            { label: "Lease expires", detail: "Stop using the address" },
            { label: "Start over", detail: "Send a new DHCPDISCOVER" },
          ],
        },
      },
      {
        heading: "The options a client receives",
        body: "Everything beyond the address itself travels as numbered options. The common ones: 1 subnet mask, 3 router (default gateway), 6 DNS servers, 15 domain name, 42 NTP servers, 51 lease time, 53 the DHCP message type, and 54 the server identifier. Option 43 carries vendor data, often used by wireless access points to find their controller. Options 66 and 67 (TFTP server and boot file name) let machines boot from the network with PXE. Option 121 pushes extra static routes.\n\nThe client tells the server which options it wants with option 55 (parameter request list). If a laptop gets an address but cannot reach the internet, check options 3 and 6 first; a wrong gateway or DNS server is the usual mistake.",
      },
      {
        heading: "Relays: one server for many VLANs",
        body: "Broadcasts stop at routers, so a client in VLAN 20 cannot reach a server in VLAN 10 directly. A DHCP relay agent, usually the router or layer 3 switch that is the VLAN's gateway, listens for those broadcasts. It writes its own interface address on that VLAN into the giaddr (gateway IP address) field and forwards the message as unicast to the server's UDP port 67.\n\nThe server reads giaddr to choose the right pool: giaddr 10.0.20.1 means the client lives in 10.0.20.0/24. It sends the reply back to the relay, which passes it to the client on the VLAN. Relays can also add option 82 (relay agent information), naming the switch port, which some networks use for tracking or policy. On Cisco IOS, the command is ip helper-address on the VLAN interface.",
        visual: {
          type: "sequence",
          title: "DHCP through a relay",
          actors: ["Client in VLAN 20", "Router (relay)", "DHCP server"],
          messages: [
            { from: 0, to: 1, label: "DISCOVER broadcast" },
            { from: 1, to: 2, label: "Unicast DISCOVER, giaddr 10.0.20.1" },
            { from: 2, to: 1, label: "OFFER from the 10.0.20.0/24 pool" },
            { from: 1, to: 0, label: "OFFER delivered on VLAN 20" },
            { from: 0, to: 1, label: "REQUEST broadcast" },
            { from: 1, to: 2, label: "Relayed REQUEST" },
            { from: 2, to: 1, label: "ACK" },
            { from: 1, to: 0, label: "ACK: client is configured" },
          ],
        },
      },
      {
        heading: "Rogue servers, starvation and IPv6",
        body: "DHCP has no built-in authentication, so any device can pretend to be a server. A rogue server (often a home router plugged in backwards) hands out a wrong gateway, and users lose the network or, worse, send traffic through an attacker. Switches defend with DHCP snooping: only trusted ports, the uplinks to the real server, may send OFFER and ACK messages. A starvation attack requests every address with fake MAC addresses until the pool is empty; port security limits how many MACs one port may use.\n\nIPv6 works differently. Many networks use SLAAC, where hosts build their own address from router advertisements. DHCPv6 uses UDP ports 546 (client) and 547 (server) and the messages SOLICIT, ADVERTISE, REQUEST and REPLY. It can hand out addresses or just DNS settings.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What a DHCP server manages",
        root: "DHCP server",
        children: [
          { label: "Scopes (pools)", children: ["One per subnet", "Start and end address", "Excluded ranges"] },
          { label: "Options", children: ["3 router", "6 DNS servers", "15 domain name", "51 lease time"] },
          { label: "Reservations", children: ["MAC address to fixed IP", "Printers, servers, APs"] },
          { label: "Leases table", children: ["Who has which address", "When each lease expires"] },
        ],
      },
    ],
    examples: [
      {
        title: "A small DHCP server with dnsmasq",
        explanation: "A lab network 10.0.10.0/24 needs addresses from .50 to .200, the router at .1 and a DNS server at .5. The printer must always be .20. Step 1: write the config. Step 2: restart dnsmasq. Step 3: renew a client and check that the leases file shows it. dhcp-range sets the pool and lease time, dhcp-option sets the gateway and DNS, and dhcp-host makes the reservation.",
        code: {
          lang: "text",
          code: "# /etc/dnsmasq.d/lab.conf\ninterface=eth1\ndhcp-range=10.0.10.50,10.0.10.200,255.255.255.0,12h\ndhcp-option=option:router,10.0.10.1\ndhcp-option=option:dns-server,10.0.10.5\ndhcp-host=aa:bb:cc:dd:ee:20,printer,10.0.10.20\n\n# then:\n# sudo systemctl restart dnsmasq\n# cat /var/lib/misc/dnsmasq.leases",
        },
      },
      {
        title: "A laptop gets 169.254.x.x",
        explanation: "A user in VLAN 30 reports an address like 169.254.12.7. That is a link-local address the OS picks itself when no DHCP server answers. Step 1: on the router, check that VLAN 30's interface has ip helper-address pointing to the server. Step 2: on the server, check that a scope for 10.0.30.0/24 exists; without it, the server ignores requests whose giaddr is 10.0.30.1. Step 3: capture on the client side to see if DISCOVER goes out and whether any OFFER comes back.",
        code: {
          lang: "bash",
          code: "# On the client (Linux):\nsudo tcpdump -ni eth0 -v 'udp port 67 or udp port 68'\n# DISCOVER repeats with no OFFER -> relay or scope problem\n\n# Force a fresh lease once it is fixed:\nsudo dhclient -r eth0 && sudo dhclient -v eth0\n# Windows: ipconfig /release then ipconfig /renew",
        },
      },
    ],
    cheatSheet: [
      "DHCP: server UDP 67, client UDP 68; DHCPv6: client 546, server 547",
      "DORA: DISCOVER, OFFER, REQUEST, ACK; NAK means start over",
      "Renew at T1 (50% of lease, unicast); rebind at T2 (87.5%, broadcast)",
      "Option 3 = router, 6 = DNS, 15 = domain name, 51 = lease time, 82 = relay info",
      "169.254.x.x on a client means no DHCP server answered",
      "Cisco relay: ip helper-address followed by the server IP, on the client VLAN interface",
      "DHCP snooping: mark only the uplink to the real server as trusted",
    ],
    quiz: [
      {
        q: "Why does the client broadcast its DHCPREQUEST instead of sending it only to the chosen server?",
        options: ["It does not know the server's address yet", "Broadcasts are faster", "So every server that made an offer learns which one was accepted", "Routers require it"],
        answer: 2,
        why: "The broadcast carries the server identifier, so other servers can release the addresses they offered.",
      },
      {
        q: "A client's lease is 24 hours. When does it first try to renew?",
        options: ["After 12 hours", "After 21 hours", "After 24 hours", "Every hour"],
        answer: 0,
        why: "T1 defaults to 50% of the lease, so 12 hours for a 24-hour lease.",
      },
      {
        q: "How does a DHCP server know which pool to use for a request that came through a relay?",
        options: ["From the client's MAC address", "From option 6", "From the TTL", "From the giaddr field set by the relay"],
        answer: 3,
        why: "giaddr holds the relay's interface address on the client's subnet, which matches one scope.",
      },
      {
        q: "Which switch feature blocks a rogue DHCP server plugged into a user port?",
        options: ["Spanning tree", "DHCP snooping", "Port mirroring", "VLAN trunking"],
        answer: 1,
        why: "DHCP snooping drops server messages such as OFFER and ACK arriving on untrusted ports.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find out what your own machine received from DHCP: address, gateway, DNS servers and lease time.",
        hint: "On Linux try nmcli; on Windows, ipconfig has a detailed mode.",
        solution: "# Linux (NetworkManager):\nnmcli -f DHCP4 device show wlan0\n# Linux (any): ip addr; ip route; resolvectl status\n# Windows:\nipconfig /all\n# Look for: IPv4 address, Default Gateway, DNS Servers,\n# Lease Obtained and Lease Expires",
      },
      {
        level: "medium",
        task: "Capture a full DORA exchange and identify the message type, offered address and router option in each packet.",
        hint: "Start tcpdump first, then release and renew the lease in another terminal.",
        solution: "sudo tcpdump -ni eth0 -vvv 'udp port 67 or udp port 68'\n# second terminal:\nsudo dhclient -r eth0; sudo dhclient -v eth0\n# In the output look for:\n#  DHCP-Message (53), length 1: Discover / Offer / Request / ACK\n#  Your-IP 10.0.10.57   (the offered address)\n#  Default-Gateway (3): 10.0.10.1",
      },
      {
        level: "hard",
        task: "Users in a new VLAN 40 (10.0.40.0/24) get no address. The server is 10.0.10.5. List what must exist on the router and the server, and how you would prove each part works.",
        hint: "Think about the relay, the scope, and the return path from the server to the relay address.",
        solution: "Router: interface vlan 40 with ip address 10.0.40.1/24\n        and ip helper-address 10.0.10.5\nServer: a scope for 10.0.40.0/24 with router option 10.0.40.1\nNetwork: server can route back to 10.0.40.1, and any firewall\n         allows UDP 67 between them\nProve it: capture on the server for udp port 67;\n  you should see packets from 10.0.40.1 (the relay),\n  then an OFFER sent back to it. No packets: relay issue.\n  Packets but no OFFER: missing or full scope.",
      },
    ],
    faq: [
      { q: "What happens if two DHCP servers are on the same network?", a: "Clients take whichever offer arrives first, so they may get the wrong gateway or overlapping addresses. Use one server, or two servers configured for failover with split or shared pools." },
      { q: "Should servers use DHCP or static addresses?", a: "Infrastructure that others depend on, such as DNS servers and routers, is usually static. Other servers often use DHCP reservations, which keep the address fixed while staying centrally managed." },
      { q: "What does a 169.254 address mean?", a: "It is an automatic link-local address the device chose because no DHCP server answered. Check the cable or Wi-Fi, the relay and the server's scope." },
    ],
  },

  "net-application/http-1-1": {
    plain: [
      "HTTP (Hypertext Transfer Protocol) is how browsers and apps ask servers for things. The client sends a request: what it wants to do (the method, like GET), which thing (the path, like /products), and some extra labeled facts (headers). The server sends back a response: a three-digit status code, its own headers, and usually a body such as a web page or JSON data.",
      "HTTP/1.1 is plain text, so you can read it with your own eyes. Each line ends with a carriage return and line feed, the headers end with one empty line, and then the body begins. This makes it a great protocol to learn on, and tools like curl -v show you every line.",
      "HTTP itself forgets you after every request. To remember who you are, servers send a cookie: a small piece of text the browser stores and sends back with later requests. Logins, shopping carts and language choices all ride on cookies.",
      "Headers also control caching. A server can say: keep this file for one hour, or check with me first. Good caching headers are one of the cheapest ways to make a site faster, because the fastest request is the one never sent.",
    ],
    deepDive: [
      {
        heading: "The exact shape of a message",
        body: "A request starts with the request line: method, target and version, such as GET /search?q=dns HTTP/1.1. Header lines follow, each Name: value. The Host header is required in HTTP/1.1. A blank line ends the headers. If a body follows, the receiver must know where it ends, and there are two ways to say so. Content-Length gives the size in bytes. Transfer-Encoding: chunked sends the body in pieces, each prefixed by its size in hexadecimal, ending with a zero-size chunk; servers use this when they do not know the size in advance, such as streamed output.\n\nA response starts with a status line, such as HTTP/1.1 404 Not Found, followed by headers, a blank line and the body. Header names are not case-sensitive. Connections stay open by default in HTTP/1.1 (keep-alive); Connection: close asks to close after this response.",
        visual: {
          type: "layers",
          title: "Parts of an HTTP/1.1 request",
          layers: [
            { label: "Request line", detail: "POST /api/orders HTTP/1.1" },
            { label: "Headers", detail: "Host, Content-Type, Content-Length, Cookie" },
            { label: "Blank line", detail: "A lone CRLF marks the end of headers" },
            { label: "Body", detail: "{\"item\": 42, \"qty\": 1}" },
          ],
        },
      },
      {
        heading: "Choosing methods and status codes",
        body: "Methods carry meaning that caches, proxies and retries rely on. GET and HEAD are safe: they should never change data. PUT and DELETE are idempotent: sending them twice has the same effect as once, so a client may retry after a timeout. POST is neither, which is why browsers warn before resubmitting a form. PATCH applies a partial change. OPTIONS asks what is allowed and is used by browsers for CORS preflight checks.\n\nPick the status code that tells the truth. 201 Created for a new resource, with a Location header. 204 No Content when there is nothing to return. 301 and 308 are permanent redirects, 302 and 307 temporary; 307 and 308 keep the method and body, while browsers turn a 301 or 302 POST into a GET. 401 means not logged in, 403 means logged in but not allowed, 409 means a conflict, 429 means slow down. 502 and 504 come from a proxy that could not get a good or timely answer from the app behind it.",
        bullets: ["401: who are you?  403: I know you, and no", "502: bad answer from upstream; 504: no answer in time", "503 with Retry-After: temporarily overloaded or in maintenance"],
      },
      {
        heading: "How caching decides",
        body: "Cache-Control is the main header. max-age=3600 lets any cache reuse the response for an hour without asking. s-maxage sets a different time for shared caches such as CDNs. private allows only the browser to store it, not shared caches. no-cache, despite its name, allows storing but requires checking with the server before every reuse. no-store forbids storing at all and is right for sensitive data.\n\nChecking with the server is called revalidation. The server gives each version an ETag (a fingerprint) or a Last-Modified date. The client later sends If-None-Match with the ETag, or If-Modified-Since with the date. If nothing changed, the server replies 304 Not Modified with no body, saving bandwidth. A common pattern: put a content hash in file names like app.3f9a1c.js and serve them with max-age=31536000, immutable; serve the HTML with no-cache so new deploys show up at once.",
        visual: {
          type: "flow",
          title: "A browser reusing a cached file",
          steps: [
            { label: "Find a stored copy", detail: "Saved with its ETag and max-age" },
            { label: "Still fresh?", detail: "Yes: use it, no request at all" },
            { label: "Stale: revalidate", detail: "Send If-None-Match with the ETag" },
            { label: "304 Not Modified", detail: "Reuse the copy, refresh its age" },
            { label: "200 OK", detail: "Changed: replace the stored copy" },
          ],
        },
      },
      {
        heading: "Cookies and their safety flags",
        body: "A server sets a cookie with a response header such as Set-Cookie: session=abc123; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax. The browser then sends Cookie: session=abc123 on matching requests. Each attribute matters. Max-Age or Expires makes the cookie survive a browser restart; without them it is a session cookie. Domain widens the cookie to subdomains, so leave it out unless you need that. HttpOnly hides the cookie from JavaScript, which limits damage from cross-site scripting. Secure sends it only over HTTPS.\n\nSameSite controls cross-site sending. Strict never sends it on requests started by other sites. Lax, the default in modern browsers when the attribute is missing, sends it on normal top-level navigation but not on cross-site form posts or embedded requests, which blocks most CSRF attacks. None sends it everywhere but must be combined with Secure.",
      },
      {
        heading: "Connections and head-of-line blocking",
        body: "In HTTP/1.1, one TCP connection carries one request at a time: send a request, wait for the full response, then send the next. Pipelining (sending several requests without waiting) exists in the standard but responses must come back in order, and it broke so many proxies that browsers turned it off. So a slow response blocks everything queued behind it on that connection, which is called head-of-line blocking.\n\nBrowsers work around it by opening about six parallel connections per host. Old performance tricks came from this limit: joining files into bundles, image sprites, and spreading assets across several domains (domain sharding). HTTP/2 removes the need for most of them. When you debug, remember that a proxy or load balancer may keep its own pool of connections to the backend, separate from the client's connection.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Status code families with common members",
        root: "HTTP status codes",
        children: [
          { label: "1xx informational", children: ["100 Continue", "101 Switching Protocols"] },
          { label: "2xx success", children: ["200 OK", "201 Created", "204 No Content"] },
          { label: "3xx redirection", children: ["301 and 308 permanent", "302 and 307 temporary", "304 Not Modified"] },
          { label: "4xx client error", children: ["400 Bad Request", "401 and 403", "404 Not Found", "429 Too Many Requests"] },
          { label: "5xx server error", children: ["500 Internal Server Error", "502 Bad Gateway", "503 Service Unavailable", "504 Gateway Timeout"] },
        ],
      },
    ],
    examples: [
      {
        title: "Testing an API by hand with curl",
        explanation: "You want to create an order and check that the API answers correctly. Step 1: POST JSON with the right Content-Type. Step 2: read the status (201) and the Location header. Step 3: GET the new resource. -i prints response headers with the body, -H adds a header, and -d sends a body (and makes curl use POST). The -w option prints the status code alone, which is handy in scripts.",
        code: {
          lang: "bash",
          code: "curl -i -X POST https://api.example.com/orders \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer TOKEN' \\\n  -d '{\"item\": 42, \"qty\": 1}'\n# HTTP/1.1 201 Created\n# Location: /orders/981\n\ncurl -s -o /dev/null -w '%{http_code}\\n' https://api.example.com/orders/981\n# 200",
        },
      },
      {
        title: "Checking that caching really works",
        explanation: "After a deploy, you want to confirm the CSS file is cached and revalidated properly. Step 1: fetch headers with -I and note Cache-Control and ETag. Step 2: send the same request with If-None-Match set to that ETag. A 304 response proves revalidation works. Step 3: if you get 200 every time, the server may be generating a new ETag per request, or a proxy strips the header.",
        code: {
          lang: "bash",
          code: "curl -sI https://example.com/app.css | grep -iE 'cache-control|etag'\n# cache-control: max-age=3600\n# etag: \"5f2a-63c1\"\ncurl -sI https://example.com/app.css \\\n  -H 'If-None-Match: \"5f2a-63c1\"' | head -1\n# HTTP/1.1 304 Not Modified",
        },
      },
    ],
    cheatSheet: [
      "curl -v shows request and response headers; -I sends HEAD; -i adds headers to the output",
      "curl -L follows redirects; --resolve host:443:IP tests a server before DNS points to it",
      "Safe: GET, HEAD, OPTIONS. Idempotent: those plus PUT and DELETE. POST is neither",
      "307 and 308 keep the method on redirect; 301 and 302 may turn POST into GET",
      "no-cache = revalidate every time; no-store = never store",
      "Hashed file names + max-age=31536000, immutable; HTML with no-cache",
      "Session cookies: HttpOnly; Secure; SameSite=Lax as a sane default",
      "Body length: Content-Length or Transfer-Encoding: chunked",
    ],
    quiz: [
      {
        q: "Which Cache-Control value lets a browser store a response but forces it to check with the server before each reuse?",
        options: ["no-store", "private", "max-age=0, immutable", "no-cache"],
        answer: 3,
        why: "no-cache means store but revalidate every time; no-store means do not store at all.",
      },
      {
        q: "A client got a timeout while sending a request. Which method can it safely retry without risk of doing the action twice?",
        options: ["PUT", "POST", "PATCH", "Any method"],
        answer: 0,
        why: "PUT is idempotent: repeating it leaves the resource in the same state.",
      },
      {
        q: "A reverse proxy returns 504. What does that usually mean?",
        options: ["The client sent bad JSON", "The URL does not exist", "The backend did not answer in time", "The user is not logged in"],
        answer: 2,
        why: "504 Gateway Timeout is a proxy saying the upstream server took too long.",
      },
      {
        q: "Which cookie attribute stops JavaScript in the page from reading the cookie?",
        options: ["Secure", "HttpOnly", "SameSite=Strict", "Path=/"],
        answer: 1,
        why: "HttpOnly hides the cookie from document.cookie, limiting what an XSS attack can steal.",
      },
      {
        q: "Why did browsers open about six connections per host with HTTP/1.1?",
        options: ["Each connection handles one request at a time, so parallel connections avoid waiting", "Servers require it", "TLS needs several connections", "To bypass caching"],
        answer: 0,
        why: "Without working pipelining, extra connections were the only way to fetch files in parallel.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use curl -v on any website and write down the request line, the Host header, the status line and three response headers.",
        hint: "Lines starting with > are what curl sent; lines with < are what it received.",
        solution: "curl -v https://example.com/ -o /dev/null 2>&1 | grep -E '^[<>]'\n# > GET / HTTP/2   (curl may pick HTTP/2 over TLS)\n# > Host: example.com\n# < HTTP/2 200\n# < content-type: text/html\n# Add --http1.1 to see the HTTP/1.1 form:\ncurl -v --http1.1 https://example.com/ -o /dev/null",
      },
      {
        level: "medium",
        task: "Send a complete HTTP/1.1 request by hand over a raw TCP connection and read the response, including where the headers end.",
        hint: "Use printf so you get exact \\r\\n line endings, and finish with an empty line.",
        solution: "printf 'GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n' \\\n  | nc example.com 80 | head -20\n# For HTTPS, use openssl instead of nc:\nprintf 'GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n' \\\n  | openssl s_client -quiet -connect example.com:443 -servername example.com",
      },
      {
        level: "hard",
        task: "Find a redirect chain (for example http to https, then to www) and show each hop's status code and Location, then measure how much time the redirects cost.",
        hint: "curl -L follows redirects; -w has variables for redirect count and time.",
        solution: "curl -sIL http://github.com | grep -iE '^HTTP|^location'\n# HTTP/1.1 301 Moved Permanently\n# Location: https://github.com/\n# HTTP/2 200\ncurl -sL -o /dev/null http://github.com \\\n  -w 'redirects=%{num_redirects} redirect_time=%{time_redirect}s total=%{time_total}s\\n'",
      },
    ],
    faq: [
      { q: "What is the difference between 401 and 403?", a: "401 Unauthorized means the server does not know who you are, so log in or send credentials. 403 Forbidden means it knows who you are and you are not allowed." },
      { q: "Is HTTP/1.1 still used?", a: "Yes. Many APIs, internal services, proxies to backends and simple tools still use it, and every newer version keeps the same methods, headers and status codes." },
      { q: "What is the difference between PUT and PATCH?", a: "PUT replaces the whole resource with what you send, so it is idempotent. PATCH sends only the changes, and whether it is idempotent depends on the patch format." },
      { q: "Why does my browser show an old version of my site after a deploy?", a: "The files were cached with a long max-age. Use hashed file names for assets and serve the HTML with no-cache, so the browser always checks for a new page." },
    ],
  },

  "net-application/http-2-3": {
    plain: [
      "HTTP/2 and HTTP/3 do not change what HTTP means. GET is still GET, 404 is still 404, and headers work the same way. What changes is how the messages are packed and carried across the network, which makes pages load faster, especially when a page needs dozens of files.",
      "HTTP/1.1 is like a single-lane road: one car (request) at a time per connection. HTTP/2 turns one connection into a multi-lane road: many requests travel at once as small numbered pieces called frames, and the other side puts them back together. This is called multiplexing.",
      "There is still a catch. HTTP/2 runs on TCP, and TCP delivers bytes strictly in order. If one packet is lost, everything behind it waits, even data for other requests. HTTP/3 fixes this by running on QUIC, a newer transport built on UDP, where each request has its own lane and a loss in one does not hold up the others.",
      "You rarely choose the version yourself. Browsers and servers agree on it automatically during connection setup. Your job as an engineer is to enable the newer versions on your servers or CDN and know how to check which one is actually used.",
    ],
    deepDive: [
      {
        heading: "Frames and streams in HTTP/2",
        body: "Everything in HTTP/2 is a frame with a 9-byte header: a 24-bit length, an 8-bit type, 8 bits of flags, and a 31-bit stream ID. A stream is one request and its response. Client-started streams use odd numbers (1, 3, 5...), and stream 0 is reserved for connection-wide control. A request becomes a HEADERS frame (plus CONTINUATION frames if headers are large) and optional DATA frames.\n\nOther frame types do housekeeping. SETTINGS exchanges limits, such as the maximum number of concurrent streams. WINDOW_UPDATE drives flow control, so a fast sender cannot flood a slow reader; the initial window is 65,535 bytes. PING checks the connection is alive. RST_STREAM cancels one stream without closing the connection. GOAWAY tells the peer to stop opening new streams, which lets servers shut down gracefully.\n\nHeaders change form too. The request line becomes pseudo-headers: :method, :scheme, :authority (replacing Host) and :path, and the response uses :status. All header names are lowercase.",
        bullets: ["HEADERS and DATA carry requests and responses", "SETTINGS and WINDOW_UPDATE control limits and flow", "RST_STREAM cancels one stream; GOAWAY winds down the connection"],
      },
      {
        heading: "Header compression: HPACK and QPACK",
        body: "Requests to the same site repeat nearly the same headers every time: user-agent, cookies, accept headers. In HTTP/1.1 they are resent as plain text on every request, often hundreds of bytes. HPACK, used by HTTP/2, compresses them in three ways: a static table of 61 common header fields, a dynamic table that both sides build as headers are seen, so a repeated header becomes a tiny index number, and Huffman coding for new strings.\n\nThe dynamic table depends on order: both sides must process headers in exactly the same sequence. That is fine on TCP, which is strictly ordered, but QUIC streams arrive independently. So HTTP/3 uses QPACK, which sends table updates on separate one-way encoder and decoder streams and lets the encoder choose whether a header may wait for a table update. This keeps compression without bringing back head-of-line blocking.",
      },
      {
        heading: "Why QUIC, and what it brings",
        body: "QUIC (RFC 9000) runs over UDP, usually on port 443, and puts reliability, congestion control and encryption into the transport itself. TLS 1.3 is built in, so connection setup and encryption happen together in one round trip, instead of a TCP handshake followed by a TLS handshake. On a repeat visit, 0-RTT lets the client send its first request immediately.\n\nEach QUIC stream is delivered on its own, so a lost packet only delays the streams whose data was in it. QUIC also identifies connections by connection IDs instead of the IP address and port pair. When a phone moves from Wi-Fi to mobile data and its IP changes, the connection can survive instead of starting over.\n\nThe costs: UDP is blocked or throttled on some corporate networks, so clients must fall back to HTTP/2 over TCP. QUIC runs in user space and encrypts almost all its headers, which uses more CPU and gives middleboxes less to inspect.",
        visual: {
          type: "compare",
          title: "Connection setup before the first request",
          columns: [
            { title: "HTTP/2 over TCP + TLS 1.3", points: ["TCP handshake: 1 round trip", "TLS 1.3 handshake: 1 round trip", "Request sent after 2 round trips", "Loss stalls all streams"] },
            { title: "HTTP/3 over QUIC", points: ["QUIC and TLS together: 1 round trip", "0-RTT possible on repeat visits", "Loss stalls only affected streams", "Survives IP changes"] },
          ],
        },
      },
      {
        heading: "How the version gets chosen",
        body: "For HTTP/2, the choice happens inside the TLS handshake using ALPN (Application-Layer Protocol Negotiation). The client lists what it speaks, such as h2 and http/1.1, and the server picks one. Browsers only use HTTP/2 over TLS; plain-text HTTP/2 (h2c) exists but is used only between servers.\n\nHTTP/3 cannot be negotiated inside a TCP connection, because it does not use TCP. So the server advertises it. It sends a header like Alt-Svc: h3=\":443\"; ma=86400 over HTTP/2 or HTTP/1.1, meaning: HTTP/3 is available on UDP port 443, remember this for a day. The browser tries QUIC on later connections. An HTTPS DNS record can advertise h3 even before the first connection. If QUIC fails, the browser quietly uses TCP instead, which is why the first visit to a site is often HTTP/2 and later ones HTTP/3.",
        visual: {
          type: "sequence",
          title: "Upgrading from HTTP/2 to HTTP/3",
          actors: ["Browser", "Server"],
          messages: [
            { from: 0, to: 1, label: "TLS ClientHello, ALPN: h2, http/1.1" },
            { from: 1, to: 0, label: "ServerHello, ALPN chosen: h2" },
            { from: 0, to: 1, label: "HTTP/2 GET /" },
            { from: 1, to: 0, label: "200 OK, Alt-Svc: h3=\":443\"" },
            { from: 0, to: 1, label: "Next visit: QUIC Initial on UDP 443" },
            { from: 1, to: 0, label: "HTTP/3 responses over QUIC" },
          ],
        },
      },
      {
        heading: "What changes for you in practice",
        body: "Some old performance habits now hurt. Domain sharding splits traffic across connections and defeats multiplexing and header compression. Huge bundles mean a tiny code change invalidates the whole cached file. Moderate bundling is still fine, but you no longer need to squeeze everything into one file.\n\nServer push, an HTTP/2 feature that let servers send files before they were asked for, was rarely a win and browsers such as Chrome have removed support; use preload links or 103 Early Hints instead. Priorities changed too: the original HTTP/2 priority tree was replaced by the simpler Priority header (RFC 9218).\n\nMultiplexing also changed the threat picture. In 2023, the Rapid Reset attack (CVE-2023-44487) abused opening and instantly cancelling streams with RST_STREAM to overload servers. Keep your web server and proxies patched and set sensible limits on concurrent streams.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Protocol stacks side by side (HTTP/3 vs HTTP/2)",
        layers: [
          { label: "HTTP semantics", detail: "Same methods, status codes and headers" },
          { label: "HTTP/3 framing or HTTP/2 framing", detail: "QPACK on HTTP/3, HPACK on HTTP/2" },
          { label: "QUIC streams or TLS 1.3", detail: "QUIC includes TLS 1.3 inside itself" },
          { label: "UDP or TCP", detail: "HTTP/3 uses UDP, HTTP/2 uses TCP" },
          { label: "IP", detail: "Identical for both" },
        ],
      },
    ],
    examples: [
      {
        title: "Checking which version a site uses",
        explanation: "You enabled HTTP/3 on your CDN and want proof. Step 1: check the version curl negotiates by default over TLS. Step 2: look for the Alt-Svc header that advertises h3. Step 3: force HTTP/3 with --http3 (your curl must be built with HTTP/3 support; curl -V lists HTTP3 under Features if so). In the browser, open developer tools, Network tab, and turn on the Protocol column: you will see h2 or h3 per request.",
        code: {
          lang: "bash",
          code: "curl -so /dev/null -w '%{http_version}\\n' https://www.cloudflare.com\n# 2\ncurl -sI https://www.cloudflare.com | grep -i alt-svc\n# alt-svc: h3=\":443\"; ma=86400\ncurl -V | grep -o HTTP3\ncurl --http3 -so /dev/null -w '%{http_version}\\n' https://www.cloudflare.com\n# 3",
        },
      },
      {
        title: "Enabling HTTP/2 and HTTP/3 in nginx",
        explanation: "Recent nginx versions (1.25.1 and later) use a separate http2 on directive and support QUIC with listen ... quic. Step 1: listen on TCP 443 for HTTP/1.1 and HTTP/2, and on UDP 443 for HTTP/3. Step 2: advertise HTTP/3 with Alt-Svc. Step 3: open UDP 443 in every firewall in the path, which is the step people forget. Then repeat the curl checks above.",
        code: {
          lang: "nginx",
          code: "server {\n    listen 443 ssl;\n    listen 443 quic reuseport;\n    http2 on;\n    server_name example.com;\n    ssl_certificate     /etc/ssl/example.com/fullchain.pem;\n    ssl_certificate_key /etc/ssl/example.com/privkey.pem;\n    ssl_protocols TLSv1.2 TLSv1.3;\n    add_header Alt-Svc 'h3=\":443\"; ma=86400' always;\n}",
        },
      },
    ],
    cheatSheet: [
      "ALPN values: h2 for HTTP/2, http/1.1 for HTTP/1.1, h3 for HTTP/3 over QUIC",
      "HTTP/3 needs UDP 443 open; without it clients fall back to TCP",
      "curl -w '%{http_version}' prints the version used; --http3 forces HTTP/3",
      "HTTP/2 pseudo-headers: :method, :scheme, :authority, :path, and :status",
      "Alt-Svc: h3=\":443\"; ma=86400 advertises HTTP/3 for a day",
      "Skip domain sharding and server push with HTTP/2 and later; use preload or 103 Early Hints",
      "Client-initiated HTTP/2 streams have odd IDs; stream 0 is the connection itself",
    ],
    quiz: [
      {
        q: "Why can HTTP/2 still suffer head-of-line blocking?",
        options: ["It sends one request per connection", "It does not compress headers", "A lost TCP packet delays all streams sharing the connection", "It needs six connections"],
        answer: 2,
        why: "TCP delivers bytes in order, so every stream waits for the retransmission.",
      },
      {
        q: "Why does HTTP/3 use QPACK instead of HPACK?",
        options: ["HPACK depends on strict ordering, which independent QUIC streams do not give", "QPACK compresses images", "HPACK is not encrypted", "QPACK is only for cookies"],
        answer: 0,
        why: "QPACK moves table updates to separate streams so compression does not reintroduce blocking.",
      },
      {
        q: "How does a browser first learn that a server supports HTTP/3?",
        options: ["From the TCP handshake", "From an ICMP message", "From the Content-Type header", "From an Alt-Svc header or an HTTPS DNS record"],
        answer: 3,
        why: "HTTP/3 runs over UDP, so it is advertised rather than negotiated inside a TCP connection.",
      },
      {
        q: "Which feature lets a QUIC connection survive a phone switching from Wi-Fi to mobile data?",
        options: ["ALPN", "Connection IDs", "HPACK", "Keep-alive"],
        answer: 1,
        why: "QUIC identifies connections by connection IDs, not the IP and port, so an address change does not break it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Open three big websites in your browser and record which HTTP version each request uses.",
        hint: "Developer tools, Network tab, right-click the column header and enable Protocol.",
        solution: "Open DevTools (F12), Network tab, reload the page.\nRight-click a column header and tick Protocol.\nTypical values: h3 (HTTP/3), h2 (HTTP/2), http/1.1.\nReload again: sites that sent Alt-Svc often switch\nfrom h2 on the first load to h3 on later ones.",
      },
      {
        level: "medium",
        task: "Use openssl to see which application protocol a server picks with ALPN when you offer h2 and http/1.1.",
        hint: "openssl s_client has an -alpn option and prints the result.",
        solution: "openssl s_client -connect example.com:443 -servername example.com \\\n  -alpn h2,http/1.1 </dev/null 2>/dev/null | grep -i alpn\n# ALPN protocol: h2\nopenssl s_client -connect example.com:443 -servername example.com \\\n  -alpn http/1.1 </dev/null 2>/dev/null | grep -i alpn\n# ALPN protocol: http/1.1",
      },
      {
        level: "hard",
        task: "Compare connection setup time for HTTP/1.1, HTTP/2 and HTTP/3 to the same far-away site, and explain the difference.",
        hint: "curl's -w variables time_connect, time_appconnect and time_starttransfer split the timeline.",
        solution: "u=https://www.cloudflare.com\nfmt='%{http_version} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer}\\n'\ncurl --http1.1 -so /dev/null -w \"$fmt\" $u\ncurl --http2   -so /dev/null -w \"$fmt\" $u\ncurl --http3   -so /dev/null -w \"$fmt\" $u\n# h1 and h2: TLS finishes about one round trip after connect.\n# h3: QUIC and TLS finish together, so tls is close to connect.",
      },
    ],
    faq: [
      { q: "Do I need to change my application code for HTTP/2 or HTTP/3?", a: "Usually not. The web server, load balancer or CDN handles the protocol, and your app sees the same requests. You may remove old hacks like domain sharding." },
      { q: "Is HTTP/3 always faster?", a: "It helps most on lossy or high-latency networks such as mobile. On a clean, fast network the difference is small, and where UDP is blocked clients fall back to HTTP/2." },
      { q: "Why does curl show HTTP/2 even though the site supports HTTP/3?", a: "curl does not use Alt-Svc information by default, and many builds lack HTTP/3 support. Use --http3 with a build that lists HTTP3 in curl -V." },
    ],
  },

  "net-application/tls": {
    plain: [
      "When you see the padlock in your browser, TLS (Transport Layer Security) is at work. It does three jobs for a connection: it keeps the data secret (encryption), it detects any change on the way (integrity), and it proves you are really talking to the site you asked for (authentication).",
      "Encryption needs a shared secret key, but the two sides have never met. TLS solves this with a clever math trick called Diffie-Hellman: each side sends a public value, and both can compute the same secret, while someone watching the wire cannot. A fresh secret is made for every connection.",
      "Proving identity is the job of certificates. A certificate is a small file that says: this public key belongs to example.com. It is signed by a certificate authority (CA), a company your device already trusts. If the signature checks out and the name matches, the browser trusts the connection.",
      "Most TLS problems in real life are not about math. They are about certificates: an expired one, a name that does not match, or a missing middle certificate in the chain. Knowing how to inspect a certificate from the command line will solve most of these in minutes.",
    ],
    deepDive: [
      {
        heading: "Inside the TLS 1.3 handshake",
        body: "The client starts with ClientHello. It lists the TLS versions and cipher suites it supports, includes a random value, and already sends a key share: its public Diffie-Hellman value for a group it guesses the server likes, typically X25519. Modern browsers and servers also offer the hybrid post-quantum group X25519MLKEM768. The extensions carry the hostname (SNI) and the application protocols it wants (ALPN).\n\nThe server answers with ServerHello, choosing a cipher suite and sending its own key share. From that moment both sides can compute the handshake keys, so everything after ServerHello is encrypted: EncryptedExtensions (including the chosen ALPN), Certificate, CertificateVerify (a signature over the handshake, proving the server owns the private key) and Finished (a check that nobody tampered with any handshake message).\n\nIf the client guessed a group the server does not accept, the server sends HelloRetryRequest and the handshake costs one extra round trip.",
        bullets: ["TLS 1.3 cipher suites: TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256", "RSA key exchange and static keys were removed: every TLS 1.3 handshake has forward secrecy", "The certificate is encrypted in 1.3, unlike in 1.2"],
      },
      {
        heading: "How a chain of trust is checked",
        body: "Root CA keys are precious, so roots rarely sign server certificates directly. A root signs an intermediate CA certificate, and the intermediate signs your server (leaf) certificate. Your device ships with a trust store of a few hundred roots. The server must send its leaf plus the intermediates; it should not send the root, which the client already has.\n\nThe client checks, for every link: the signature is valid with the issuer's public key, the dates are current, and the issuer is allowed to act as a CA. Then it checks the leaf matches the hostname. Browsers use only the Subject Alternative Name (SAN) list for this and ignore the old Common Name field. A wildcard like *.example.com covers api.example.com but not example.com itself or a.b.example.com.\n\nThe most common failure is a server that sends only the leaf. Browsers sometimes recover by fetching the intermediate themselves, but curl, Java and many apps fail with unable to get local issuer certificate.",
        visual: {
          type: "tree",
          title: "A typical certificate chain",
          root: "Root CA (in your trust store)",
          children: [
            { label: "Intermediate CA", children: ["Signed by the root", "Sent by the server", "Signs leaf certificates"] },
            { label: "Leaf certificate", children: ["Signed by the intermediate", "SAN: example.com, www.example.com", "Holds the server's public key"] },
          ],
        },
      },
      {
        heading: "SNI, ALPN and Encrypted Client Hello",
        body: "One IP address often hosts hundreds of sites, and each needs its own certificate. The server must pick the certificate before encryption starts, but the HTTP Host header only arrives later. SNI (Server Name Indication) solves this by putting the hostname in the ClientHello. Load balancers and CDNs also use SNI to route connections. Without SNI, a server returns its default certificate, which is why openssl s_client needs -servername.\n\nALPN, also in ClientHello, lists protocols like h2 and http/1.1. The server picks one, so HTTP/2 is agreed without an extra round trip.\n\nBecause SNI is sent in clear text, anyone on the path can see which site you visit. Encrypted Client Hello (ECH) hides the real hostname inside an encrypted inner ClientHello, using a public key published in the site's HTTPS DNS record. Major browsers and some CDNs support it, but most servers do not use it yet.",
      },
      {
        heading: "Session resumption and 0-RTT",
        body: "A full handshake costs one round trip plus some CPU work for signatures. After a handshake, a TLS 1.3 server can send a session ticket. On the next connection the client presents the ticket as a pre-shared key (PSK), skipping the certificate exchange.\n\nWith 0-RTT (early data), the client can even send its first request together with the ClientHello, using keys derived from the ticket. This saves a full round trip, which users on distant or mobile networks feel. The catch: early data can be replayed. An attacker who records the first packet can resend it, and the server may process the request twice. So servers should only accept 0-RTT for safe, idempotent requests like GET, and many turn it off entirely. Early data also lacks full forward secrecy, because it depends on the ticket key.",
        visual: {
          type: "compare",
          title: "Ways to start a TLS 1.3 connection",
          columns: [
            { title: "Full handshake", points: ["1 round trip", "Certificate checked", "Full forward secrecy", "Always safe"] },
            { title: "Resumption (PSK)", points: ["1 round trip", "No certificate sent", "Less CPU", "Ticket from last visit"] },
            { title: "0-RTT early data", points: ["0 round trips for first request", "Can be replayed", "Only idempotent requests", "Often disabled"] },
          ],
        },
      },
      {
        heading: "Certificates in real operations",
        body: "Certificate lifetimes keep getting shorter. Public certificates issued from 15 March 2026 may be valid for at most 200 days, and the CA/Browser Forum schedule cuts this to 100 days in 2027 and 47 days in 2029. Let's Encrypt certificates already last 90 days. Manual renewal does not scale; automate it with the ACME protocol using tools like certbot, acme.sh, or a built-in client in Caddy, Traefik or cert-manager in Kubernetes.\n\nMonitor expiry from outside, because an expired certificate takes down the site for everyone at once. Keep private keys readable only by the service (mode 600), and never put them in Git.\n\nTLS can also authenticate the client. In mutual TLS (mTLS) the server asks for a client certificate and checks it against its own CA. Service meshes and internal APIs use mTLS so that every service proves its identity to every other.",
        bullets: ["Allow TLS 1.2 and 1.3 only; 1.0 and 1.1 are deprecated", "fullchain.pem = leaf + intermediates; that is what servers should send", "openssl x509 -checkend 1209600 fails if a cert expires within 14 days"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What a client checks before trusting a server",
        steps: [
          { label: "Receive chain", detail: "Leaf plus intermediates from the server" },
          { label: "Build path to a root", detail: "Root must be in the local trust store" },
          { label: "Verify signatures", detail: "Each certificate signed by the next" },
          { label: "Check dates and usage", detail: "Not expired, allowed for TLS servers" },
          { label: "Match hostname", detail: "Name must be in the SAN list" },
          { label: "Check CertificateVerify", detail: "Proves the server holds the private key" },
        ],
      },
    ],
    examples: [
      {
        title: "Diagnosing unable to get local issuer certificate",
        explanation: "Browsers open the site, but a Python script and curl fail. Step 1: show the chain the server sends with -showcerts and count the certificates. Only one (depth 0) means the intermediate is missing. Step 2: check the verify result line. Step 3: fix the server to use the full chain file (on nginx, ssl_certificate should point to fullchain.pem, not cert.pem), reload, and test again.",
        code: {
          lang: "bash",
          code: "openssl s_client -connect shop.example.com:443 \\\n  -servername shop.example.com -showcerts </dev/null 2>/dev/null \\\n  | grep -E '^ *[0-9] s:|Verify return code'\n#  0 s:CN=shop.example.com\n# Verify return code: 21 (unable to verify the first certificate)\n\n# After switching nginx to fullchain.pem:\n#  0 s:CN=shop.example.com\n#  1 s:C=US, O=Let's Encrypt, CN=R11\n# Verify return code: 0 (ok)",
        },
      },
      {
        title: "Checking names and expiry of a certificate",
        explanation: "A user sees a name mismatch warning on api.example.com. Step 1: pull the certificate and print its SAN list and dates. Step 2: if api.example.com is not in the list (and no wildcard covers it), the certificate needs reissuing with that name. Step 3: use -checkend in monitoring to warn two weeks before expiry.",
        code: {
          lang: "bash",
          code: "echo | openssl s_client -connect api.example.com:443 \\\n  -servername api.example.com 2>/dev/null \\\n  | openssl x509 -noout -subject -dates -ext subjectAltName\n# notAfter=Jan 30 12:00:00 2027 GMT\n# X509v3 Subject Alternative Name:\n#     DNS:example.com, DNS:www.example.com   (api is missing)\necho | openssl s_client -connect api.example.com:443 -servername api.example.com 2>/dev/null \\\n  | openssl x509 -noout -checkend 1209600 || echo 'expires within 14 days'",
        },
      },
    ],
    cheatSheet: [
      "openssl s_client -connect host:443 -servername host shows the handshake and chain",
      "-showcerts prints every certificate the server sent; -brief prints version and cipher only",
      "openssl x509 -noout -ext subjectAltName lists the names a cert is valid for",
      "Verify return code 0 (ok) is good; 20 or 21 usually means a missing intermediate",
      "TLS 1.3: 1 round trip; 0-RTT only for idempotent requests",
      "Wildcard *.example.com does not cover example.com or a.b.example.com",
      "Serve fullchain.pem (leaf + intermediates), never the root alone or the leaf alone",
      "Automate renewal with ACME; public certs issued from March 2026 last at most 200 days",
    ],
    quiz: [
      {
        q: "In TLS 1.3, what proves the server actually owns the private key for its certificate?",
        options: ["The ServerHello random value", "The SNI extension", "The CertificateVerify message", "The session ticket"],
        answer: 2,
        why: "CertificateVerify is a signature over the handshake made with the certificate's private key.",
      },
      {
        q: "Why does openssl s_client often need -servername?",
        options: ["To send SNI, so the server picks the right certificate", "To enable TLS 1.3", "To skip verification", "To choose the cipher"],
        answer: 0,
        why: "Without SNI, a server hosting many sites returns its default certificate, which may not match.",
      },
      {
        q: "What is the main risk of 0-RTT early data?",
        options: ["It disables encryption", "It reveals the private key", "It breaks HTTP/2", "An attacker can replay the early request"],
        answer: 3,
        why: "Early data can be captured and resent, so it is only safe for idempotent requests.",
      },
      {
        q: "Which certificate field do browsers use to match the hostname?",
        options: ["Common Name", "Subject Alternative Name", "Issuer", "Serial number"],
        answer: 1,
        why: "Browsers ignore the Common Name and check only the SAN list.",
      },
      {
        q: "Which chain should a server send?",
        options: ["Leaf only", "Root only", "Leaf plus intermediates", "Every root in the trust store"],
        answer: 2,
        why: "The client already holds the root; it needs the leaf and intermediates to build the path.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the TLS version, cipher suite, issuer and expiry date of a website you use daily.",
        hint: "Use s_client with -brief, then pipe the certificate into openssl x509.",
        solution: "openssl s_client -connect github.com:443 -servername github.com -brief </dev/null\n# Protocol version: TLSv1.3\n# Ciphersuite: TLS_AES_128_GCM_SHA256\necho | openssl s_client -connect github.com:443 -servername github.com 2>/dev/null \\\n  | openssl x509 -noout -issuer -enddate",
      },
      {
        level: "medium",
        task: "Show that a server refuses TLS 1.1 but accepts TLS 1.2 and 1.3.",
        hint: "s_client has -tls1_1, -tls1_2 and -tls1_3 flags. Your local OpenSSL may also refuse old versions, so read the error.",
        solution: "for v in tls1_1 tls1_2 tls1_3; do\n  echo \"== $v\"\n  openssl s_client -connect example.com:443 -servername example.com \\\n    -$v -brief </dev/null 2>&1 | grep -E 'Protocol version|alert|error' | head -2\ndone\n# tls1_1: alert or no protocols available\n# tls1_2 / tls1_3: Protocol version: TLSv1.2 / TLSv1.3",
      },
      {
        level: "hard",
        task: "Create your own small CA, issue a server certificate for localhost with a SAN, and make curl trust it.",
        hint: "Make a self-signed CA certificate, then a key and CSR for the server, sign it with -extfile for the SAN, and pass the CA to curl with --cacert.",
        solution: "openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 30 -subj '/CN=Lab CA'\nopenssl req -newkey rsa:2048 -nodes -keyout srv.key -out srv.csr -subj '/CN=localhost'\nprintf 'subjectAltName=DNS:localhost' > san.ext\nopenssl x509 -req -in srv.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\\n  -out srv.crt -days 30 -extfile san.ext\nopenssl s_server -accept 8443 -cert srv.crt -key srv.key -www &\ncurl --cacert ca.crt https://localhost:8443/ | head -3",
      },
    ],
    faq: [
      { q: "Is SSL the same as TLS?", a: "TLS is the successor to SSL, and all SSL versions are broken and disabled. People still say SSL certificate out of habit, but the protocol in use is TLS 1.2 or 1.3." },
      { q: "Does HTTPS hide which websites I visit?", a: "It hides the page path, content and headers. The hostname is still visible in DNS lookups and in the SNI field, unless both encrypted DNS and Encrypted Client Hello are used." },
      { q: "Why do certificates expire so quickly now?", a: "Short lifetimes limit the damage from a stolen key or a wrongly issued certificate. With ACME automation, renewal costs nothing, so the industry is moving toward 47-day certificates by 2029." },
      { q: "What is the difference between a self-signed certificate and a CA-signed one?", a: "Both encrypt the same way. A self-signed certificate is not vouched for by any CA your device trusts, so clients warn unless you install it or your own CA manually." },
    ],
  },

  "net-application/email-protocols": {
    plain: [
      "Email works much like the postal service. You hand your letter to your local post office (your mail provider), which finds the post office of the recipient's town and delivers it there. The recipient later visits their mailbox to read it. Different protocols handle each of those steps.",
      "SMTP (Simple Mail Transfer Protocol) is the delivery truck. Your mail app uses it to hand a message to your provider, and providers use it to pass messages to each other. To find where to deliver, the sending server looks up the MX (mail exchanger) records of the recipient's domain in DNS.",
      "Reading mail is a separate job. IMAP keeps messages on the server and syncs folders and read status across your phone, laptop and webmail. POP3 is older: it downloads messages to one device, and usually deletes them from the server.",
      "SMTP was designed in a friendlier era, so anyone can claim to send mail from any address. Three DNS-based checks fight this: SPF lists which servers may send for a domain, DKIM adds a digital signature, and DMARC tells receivers what to do when checks fail. Big providers now require all three from bulk senders.",
    ],
    deepDive: [
      {
        heading: "An SMTP conversation, line by line",
        body: "SMTP is a text protocol of commands and three-digit replies. The server greets with 220. The client says EHLO with its own name, and the server lists extensions such as STARTTLS, AUTH and SIZE. On port 587 the client upgrades with STARTTLS and logs in with AUTH. Then come the envelope commands: MAIL FROM gives the return address for bounces, and RCPT TO gives each recipient, each confirmed with 250. DATA gets a 354 reply, then the client sends the message headers and body and ends with a line holding a single dot. The server answers 250 with a queue ID, and QUIT closes with 221.\n\nReplies starting with 4 are temporary failures (try again later, for example 421 or 451), and 5 are permanent (550 mailbox unavailable). Sending servers keep 4xx mail in a queue and retry for days before bouncing.",
        visual: {
          type: "sequence",
          title: "Sending one message with SMTP",
          actors: ["Sending server", "Receiving MX"],
          messages: [
            { from: 1, to: 0, label: "220 mx.example.org ESMTP ready" },
            { from: 0, to: 1, label: "EHLO mail.example.com" },
            { from: 1, to: 0, label: "250-STARTTLS, 250 SIZE ..." },
            { from: 0, to: 1, label: "MAIL FROM with sender alice@example.com" },
            { from: 0, to: 1, label: "RCPT TO with recipient bob@example.org" },
            { from: 0, to: 1, label: "DATA, headers and body, then a lone dot" },
            { from: 1, to: 0, label: "250 OK queued as 4F2A1C" },
            { from: 0, to: 1, label: "QUIT, reply 221" },
          ],
        },
      },
      {
        heading: "Envelope versus header: two kinds of From",
        body: "A message has two sets of addresses. The envelope (MAIL FROM and RCPT TO) is what servers use for delivery and bounces; the recipient normally never sees it, though it is saved as the Return-Path header on arrival. The header From is what the user sees in their mail app. They do not have to match, which is exactly how mailing lists and forwarding work, and also how spoofing works.\n\nThis matters for authentication. SPF checks the envelope domain (MAIL FROM), not the visible From. DKIM signs the message with a domain named in the d= tag of the signature, which can be any domain. DMARC is the piece that ties them back to what the user sees: it passes only if SPF or DKIM passes for a domain that aligns with (matches) the header From domain.",
        visual: {
          type: "compare",
          title: "What each check looks at",
          columns: [
            { title: "SPF", points: ["Checks the sending IP", "Against the envelope MAIL FROM domain", "Breaks when mail is forwarded", "TXT record at the domain"] },
            { title: "DKIM", points: ["Checks a signature over headers and body", "Domain from the d= tag", "Survives simple forwarding", "Key at selector._domainkey"] },
            { title: "DMARC", points: ["Requires SPF or DKIM to pass and align", "Aligned with the visible From", "Sets a policy: none, quarantine, reject", "TXT record at _dmarc"] },
          ],
        },
      },
      {
        heading: "Writing SPF, DKIM and DMARC records",
        body: "SPF is one TXT record at the domain, such as v=spf1 include:_spf.google.com ip4:203.0.113.25 -all. Mechanisms list allowed senders, and the final all says what to do with the rest: -all fails them, ~all marks them as soft fail. SPF allows at most 10 DNS lookups (each include, a, mx and redirect counts), and going over makes SPF fail with a permanent error, a common problem when many services are added. A domain must have only one SPF record.\n\nDKIM keys live at selector._domainkey.domain, for example google._domainkey.example.com, as TXT v=DKIM1; k=rsa; p=(the public key). The selector lets you run several keys and rotate them. Use 2048-bit RSA keys.\n\nDMARC lives at _dmarc.domain: v=DMARC1; p=none; rua=mailto:dmarc@example.com. Start with p=none to collect aggregate reports, fix every legitimate sender you find, then move to p=quarantine and finally p=reject.",
        bullets: ["Only one SPF TXT record per domain", "SPF has a 10-lookup limit", "DKIM: selector._domainkey.example.com", "DMARC: _dmarc.example.com, start at p=none"],
      },
      {
        heading: "Ports and encryption",
        body: "Port 25 is for server-to-server relay. Many home and cloud networks block outgoing port 25 to stop spam from infected machines, which is why your app should never send mail directly from a laptop or new VM; use your provider's submission service or a mail API. Port 587 is for message submission by clients: plain connection upgraded with STARTTLS, then AUTH. Port 465 is submission with implicit TLS (TLS from the first byte), and current guidance (RFC 8314) prefers it.\n\nFor reading, IMAP uses 143 (STARTTLS) and 993 (implicit TLS); POP3 uses 110 and 995. Between servers, STARTTLS on port 25 is opportunistic: an attacker could strip it. MTA-STS (a policy published over HTTPS) and DANE (TLSA records protected by DNSSEC) let a domain demand encrypted delivery.",
      },
      {
        heading: "Why good mail still lands in spam",
        body: "Authentication proves who sent a message, not that it is wanted. Receivers also score sender reputation (of the IP and the domain), complaint rates, content and engagement. Since 2024, Gmail and Yahoo require bulk senders (over about 5,000 messages a day to Gmail) to have SPF, DKIM and a DMARC record, to align the From domain, to support one-click unsubscribe, and to keep spam complaints below 0.3%.\n\nOther checks: the sending IP should have a PTR (reverse DNS) record whose name resolves back to the same IP. A brand-new IP or domain needs warming up with small volumes first. Forwarding breaks SPF, so DKIM is the check that usually saves forwarded mail; ARC headers help receivers trust intermediaries.\n\nThe Authentication-Results header added by the receiver shows the verdicts, such as spf=pass dkim=pass dmarc=pass. Reading it is the first step for any deliverability problem.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Email protocols and their ports",
        root: "Email",
        children: [
          { label: "Sending (SMTP)", children: ["25: server to server", "587: submission, STARTTLS", "465: submission, implicit TLS"] },
          { label: "Reading", children: ["IMAP 143 and 993", "POP3 110 and 995"] },
          { label: "Authentication (DNS)", children: ["SPF TXT", "DKIM at selector._domainkey", "DMARC at _dmarc"] },
          { label: "Transport security", children: ["STARTTLS", "MTA-STS", "DANE"] },
        ],
      },
    ],
    examples: [
      {
        title: "Auditing a domain's mail authentication",
        explanation: "Marketing says their newsletters go to spam. Step 1: check MX, SPF, DMARC and the DKIM key for the selector their mail service uses (you can find the selector in the s= tag of a DKIM-Signature header). Step 2: count SPF lookups; here three includes plus mx is fine. Step 3: send a test to a Gmail account, open Show original, and read the SPF, DKIM and DMARC verdicts.",
        code: {
          lang: "bash",
          code: "d=example.com\ndig $d MX +short\ndig $d TXT +short | grep spf1\n# \"v=spf1 mx include:_spf.google.com include:sendgrid.net -all\"\ndig _dmarc.$d TXT +short\n# \"v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com\"\ndig s1._domainkey.$d TXT +short\n# \"k=rsa; p=MIIBIjANBgkqh...\"",
        },
      },
      {
        title: "Testing SMTP submission by hand",
        explanation: "An app cannot send mail through the company server. Step 1: check that port 587 is reachable and that STARTTLS works with openssl. Step 2: type EHLO and see if AUTH is offered after TLS. Step 3: if the connection times out, a firewall blocks the port; if AUTH fails with 535, the credentials are wrong. The swaks tool can run the whole test in one line.",
        code: {
          lang: "bash",
          code: "openssl s_client -starttls smtp -connect smtp.example.com:587 -crlf -quiet\n# then type:\n# EHLO test.local\n# 250-AUTH PLAIN LOGIN   <- auth is offered\n# QUIT\n\nswaks --to bob@example.org --from app@example.com \\\n  --server smtp.example.com:587 --tls \\\n  --auth LOGIN --auth-user app@example.com",
        },
      },
    ],
    cheatSheet: [
      "SMTP relay 25; submission 587 (STARTTLS) or 465 (implicit TLS)",
      "IMAP 143/993; POP3 110/995",
      "SMTP flow: EHLO, MAIL FROM, RCPT TO, DATA, lone dot, QUIT",
      "4xx = temporary, retry later; 5xx = permanent failure",
      "SPF checks envelope MAIL FROM; DMARC needs alignment with the visible From",
      "SPF: one record per domain, at most 10 DNS lookups",
      "DMARC rollout: p=none, then quarantine, then reject",
      "Read Authentication-Results in a received message to see spf, dkim and dmarc verdicts",
    ],
    quiz: [
      {
        q: "Which domain does SPF actually check?",
        options: ["The visible From header domain", "The DKIM d= domain", "The recipient's domain", "The envelope MAIL FROM (Return-Path) domain"],
        answer: 3,
        why: "SPF validates the sending IP against the envelope sender's domain, which users do not normally see.",
      },
      {
        q: "A sending server gets 451 from the receiver. What should it do?",
        options: ["Keep the message and retry later", "Bounce the message immediately", "Delete the message", "Switch to POP3"],
        answer: 0,
        why: "4xx replies are temporary failures, so mail servers queue and retry.",
      },
      {
        q: "Which check is most likely to survive when a message is forwarded by a mailing list that does not change it?",
        options: ["SPF", "Reverse DNS", "DKIM", "MX lookup"],
        answer: 2,
        why: "DKIM signs the content, so it stays valid if the message is not modified, while SPF sees the forwarder's IP.",
      },
      {
        q: "What is the safest first DMARC policy for a domain that has never had one?",
        options: ["p=reject", "p=none with an rua address for reports", "p=quarantine with no reports", "No DMARC record at all"],
        answer: 1,
        why: "p=none collects reports without affecting delivery, so you can find every legitimate sender first.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look up the MX, SPF and DMARC records of two well-known domains and compare their DMARC policies.",
        hint: "SPF is a TXT record at the domain; DMARC is a TXT record at _dmarc.",
        solution: "for d in gmail.com github.com; do\n  echo \"== $d\"\n  dig $d MX +short\n  dig $d TXT +short | grep spf1\n  dig _dmarc.$d TXT +short\ndone\n# Compare the p= value in each DMARC record.",
      },
      {
        level: "medium",
        task: "Open the full headers of an email in your inbox and trace its path and authentication results.",
        hint: "In Gmail use Show original. Received headers are added top-down by each server, so read them bottom-up.",
        solution: "1. Open Show original (Gmail) or View source (others).\n2. Read Received: lines from the bottom up: the first\n   server, then each hop, ending at your provider.\n3. Find Authentication-Results: spf=pass, dkim=pass\n   header.d=..., dmarc=pass (p=...).\n4. Compare the DKIM d= domain and Return-Path with From:\n   alignment is what makes DMARC pass.",
      },
      {
        level: "hard",
        task: "A domain uses Google Workspace, Mailchimp, Zendesk and its own server 203.0.113.25, and SPF now fails with permerror. Explain why and write a fixed plan.",
        hint: "Count the DNS lookups every include causes, including nested ones.",
        solution: "Cause: SPF allows 10 DNS lookups in total, and nested\nincludes from several providers exceed it, giving permerror.\nFix plan:\n- Keep ip4:203.0.113.25 (ip4 needs no lookup)\n- Drop includes for services that can use their own\n  subdomain for bounces (e.g. Mailchimp's return path)\n- Rely on DKIM with aligned d= for those services\n- Result: v=spf1 ip4:203.0.113.25 include:_spf.google.com\n  include:mail.zendesk.com -all\n- Re-check the lookup count with an SPF checker",
      },
    ],
    faq: [
      { q: "Should I use IMAP or POP3?", a: "Use IMAP for almost everything, because it keeps mail on the server and syncs across devices. POP3 only makes sense if you want mail downloaded to a single machine." },
      { q: "Why can't my cloud server send email directly?", a: "Most cloud providers block outgoing port 25 by default to prevent spam, and new IPs have no reputation. Send through an email service or your provider's relay on port 587 or 465." },
      { q: "Do I need DMARC if I already have SPF and DKIM?", a: "Yes. Without DMARC nothing links those checks to the visible From address, and receivers have no policy for failures. Gmail and Yahoo also require it for bulk senders." },
    ],
  },
};

export default extra;
