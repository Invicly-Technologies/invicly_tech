import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-networking/ip-basics": {
    plain: [
      "Every machine on a network needs an address, just like every house on a street. An IPv4 address looks like 192.168.1.50: four numbers from 0 to 255. The /24 written after it says how much of the address names the street (the network) and how much names the house (this machine).",
      "To reach a machine on the same network, your server sends to it directly. To reach anything else, such as the internet, it hands the packet to a router called the default gateway. The routing table is the list of rules that decides which way each packet goes.",
      "Programs that accept connections, like a web server or SSH, listen on a port: a number from 1 to 65535 on that address. Port 22 is SSH, 80 is HTTP and 443 is HTTPS. A listening program plus its address and port is called a socket.",
      "When something cannot connect, you test step by step: is the interface up, does it have an address, is there a route, does the far end answer, and is the service listening? The ip, ss, ping, tracepath and curl commands each answer one of those questions.",
    ],
    deepDive: [
      {
        heading: "CIDR in practice: counting addresses",
        body: "An IPv4 address has 32 bits. The prefix length says how many of them are the network part. /24 leaves 8 bits for hosts, so 256 addresses; the first is the network address and the last is the broadcast address, which leaves 254 usable hosts. Each bit you add to the prefix halves the size: /25 has 128 addresses (126 hosts), /26 has 64 (62 hosts), /30 has 4 (2 hosts). A /16 has 65,536 addresses.\n\nSome ranges are special. 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 are private and not routed on the internet. 127.0.0.0/8 is loopback, the machine talking to itself. An address in 169.254.0.0/16 is link-local: a machine gives itself one when it asked for DHCP and got no answer, so seeing it usually means DHCP failed.",
        bullets: ["usable hosts = 2^(32 - prefix) - 2", "/24 = 255.255.255.0, /16 = 255.255.0.0", "ipcalc 192.168.1.50/26 shows the range (if installed)"],
      },
      {
        heading: "IPv6 basics an admin needs",
        body: "IPv6 addresses have 128 bits, written as eight groups of hex digits, such as 2001:db8:10:1::50. One run of zero groups can be shortened to ::, and leading zeros in a group can be dropped. ::1 is loopback.\n\nSubnets are almost always /64: the first 64 bits are the network, the last 64 the host. Every IPv6 interface also has a link-local address starting with fe80::, used to talk to neighbours and routers on the same link; it exists even without any configuration. Global addresses usually start with 2 or 3 (2000::/3). Hosts often configure themselves with SLAAC, building an address from the prefix that routers advertise, or get one from DHCPv6.\n\nThere is no ARP in IPv6. Neighbour Discovery, carried over ICMPv6, finds MAC addresses and routers instead, so blocking all ICMPv6 breaks IPv6.",
        bullets: ["ip -6 addr shows IPv6 addresses", "ip -6 route shows IPv6 routes", "ping -6 ::1 tests the IPv6 stack"],
      },
      {
        heading: "How the kernel picks a route",
        body: "For every packet, the kernel looks for the most specific route that matches the destination, which is called longest prefix match. A route for 10.20.0.0/16 beats the default route 0.0.0.0/0 for 10.20.5.9, and a /24 inside it would beat both. If nothing more specific matches, the default route sends the packet to the gateway.\n\nOn the local network the kernel still needs the neighbour's MAC address. It asks with ARP and caches the answer; ip neigh shows that cache. A FAILED or INCOMPLETE entry for the gateway means the gateway itself is not answering on layer 2.\n\nThe best debugging command here is ip route get. It asks the kernel which route, interface and source address it would use for one destination, so you do not have to work it out by reading the table.",
        bullets: ["ip route get 8.8.8.8", "ip neigh show dev ens160", "ip -s link shows packet and error counters"],
        visual: {
          type: "flow",
          title: "Sending a packet to 10.20.5.9",
          steps: [
            { label: "Look up routes", detail: "10.20.0.0/16 via 192.168.1.254 is the longest match" },
            { label: "Pick interface and source", detail: "ens160, source 192.168.1.50" },
            { label: "Find next-hop MAC", detail: "ARP for 192.168.1.254, or use the cache" },
            { label: "Send the frame", detail: "To the router's MAC, with IP destination 10.20.5.9" },
          ],
        },
      },
      {
        heading: "Reading ss and what errors mean",
        body: "ss -tulpn lists TCP (-t) and UDP (-u) sockets that are listening (-l), with the owning process (-p) and numbers instead of names (-n); -p needs root to show other users' processes. The local address column matters: 0.0.0.0:80 or [::]:80 accepts connections on every address, while 127.0.0.1:5432 accepts only connections from the machine itself. That is a very common reason a database works locally but not from another server.\n\nss -tan shows all TCP connections with their state: ESTAB for open connections, TIME-WAIT for recently closed ones, SYN-SENT for a connection still waiting for an answer.\n\nClient errors are clues too. Connection refused means the packet reached the host but nothing listens on that port. A timeout means packets are dropped on the way, usually by a firewall or a routing problem. No route to host often means a firewall sent a reject, or the host is down on the local network.",
        bullets: ["ss -tlnp 'sport = :443' filters by port", "ss -s prints a summary of socket counts", "curl -v --connect-timeout 5 http://host:port tests a service"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "What a failed connection tells you",
        columns: [
          { title: "Connection refused", points: ["Host is reachable", "Nothing listens on that port", "Or it listens only on 127.0.0.1", "Check ss -tlnp on the server"] },
          { title: "Timeout", points: ["Packets are silently dropped", "Firewall drop rule or wrong route", "Host may be down", "Check firewall and ip route get"] },
          { title: "No route to host", points: ["Firewall rejected it, or", "Neighbour did not answer ARP", "Often a reject rule on the server", "Check firewall-cmd --list-all"] },
        ],
      },
    ],
    examples: [
      {
        title: "The database works locally but not from the app server",
        explanation: "PostgreSQL on db01 answers psql on the same machine, but the app server times out or is refused. Step 1: on db01, check what address the database listens on with ss. It shows 127.0.0.1:5432, so it only accepts local connections. Step 2: change listen_addresses in postgresql.conf and restart. Step 3: check ss again: now 0.0.0.0:5432. Step 4: from the app server, test the port with curl's telnet mode or bash's /dev/tcp. If it now times out instead, the next suspect is the firewall.",
        code: {
          lang: "bash",
          code: "# on db01\nsudo ss -tlnp | grep 5432\n# LISTEN 0 200 127.0.0.1:5432 ... users:((\"postgres\",pid=812,...))\n# set listen_addresses = '*' in postgresql.conf, then:\nsudo systemctl restart postgresql\nsudo ss -tlnp | grep 5432\n# on the app server\ntimeout 3 bash -c '</dev/tcp/db01/5432' && echo open || echo closed",
        },
      },
      {
        title: "Which way does traffic to the VPN go?",
        explanation: "A server has two interfaces, and traffic to 10.50.0.0/16 should go through the VPN router 192.168.1.254 instead of the default gateway. Step 1: ask the kernel with ip route get; it picks the default route. Step 2: add a specific route (temporary, for testing). Step 3: check again; the /16 is now the longest match. Step 4: make it permanent with NetworkManager so it survives a reboot.",
        code: {
          lang: "bash",
          code: "ip route get 10.50.3.7\n# 10.50.3.7 via 192.168.1.1 dev ens160 src 192.168.1.50\nsudo ip route add 10.50.0.0/16 via 192.168.1.254 dev ens160\nip route get 10.50.3.7\n# 10.50.3.7 via 192.168.1.254 dev ens160 src 192.168.1.50\nsudo nmcli con mod ens160 +ipv4.routes \"10.50.0.0/16 192.168.1.254\"\nsudo nmcli con up ens160",
        },
      },
    ],
    cheatSheet: [
      "ip -br addr and ip -br link give a one-line summary per interface",
      "ip route get 8.8.8.8 shows which route, interface and source address the kernel would use",
      "ip neigh shows the ARP cache; FAILED for the gateway means layer 2 trouble",
      "sudo ss -tulpn lists listening TCP and UDP ports with processes",
      "127.0.0.1:PORT in ss means only local clients can connect",
      "Refused: nothing listening. Timeout: dropped by a firewall or routing. Check each differently",
      "/24 has 254 hosts, /25 has 126, /26 has 62, /30 has 2",
      "An address in 169.254.0.0/16 means DHCP gave no answer",
    ],
    quiz: [
      {
        q: "How many usable host addresses does a /26 network have?",
        options: ["64", "62", "126", "30"],
        answer: 1,
        why: "2^(32-26) = 64 addresses, minus the network and broadcast addresses, leaves 62.",
      },
      {
        q: "ss shows a service on 127.0.0.1:8080. What does that mean?",
        options: ["It accepts connections only from the same machine", "It is blocked by the firewall", "It accepts connections from anywhere", "It only speaks UDP"],
        answer: 0,
        why: "A socket bound to the loopback address cannot be reached from other hosts.",
      },
      {
        q: "A client gets Connection refused on port 443. What is the most likely cause?",
        options: ["The route to the server is missing", "A firewall is silently dropping packets", "DNS failed", "The host is reachable but nothing listens on 443"],
        answer: 3,
        why: "Refused means the host answered with a reset because no socket listens there.",
      },
      {
        q: "Two routes match 10.20.5.9: 0.0.0.0/0 and 10.20.0.0/16. Which does the kernel use?",
        options: ["The one listed first", "The default route", "10.20.0.0/16, the longest prefix match", "Both, alternating"],
        answer: 2,
        why: "The kernel always picks the most specific matching prefix.",
      },
      {
        q: "Which IPv6 address is link-local?",
        options: ["::1", "2001:db8::10", "fe80::a00:27ff:fe4e:66a1", "ff02::1"],
        answer: 2,
        why: "Link-local unicast addresses come from fe80::/10; ::1 is loopback and ff02::1 is multicast.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find your server's IPv4 address with prefix, its default gateway, and which interface reaches the internet.",
        hint: "ip -br addr, plus ip route get with a public address.",
        solution: "ip -br -4 addr\nip route | grep ^default\nip route get 1.1.1.1",
      },
      {
        level: "medium",
        task: "List every TCP port that is listening on all addresses (not only loopback), with the process name.",
        hint: "Filter ss output to exclude 127.0.0.1 and ::1.",
        solution: "sudo ss -tlnp | awk 'NR==1 || ($4 !~ /^127\\./ && $4 !~ /^\\[::1\\]/)'",
      },
      {
        level: "hard",
        task: "Write a short script that, given host and port, reports in order: DNS result, route used, whether the port is open within 3 seconds, and the HTTP status if it is a web port.",
        hint: "getent hosts, ip route get, bash /dev/tcp with timeout, curl -s -o /dev/null -w.",
        solution: "#!/bin/bash\nh=$1; p=$2\nip=$(getent hosts \"$h\" | awk '{print $1; exit}') || { echo \"DNS failed\"; exit 1; }\necho \"DNS: $ip\"\nip route get \"$ip\" | head -1\nif timeout 3 bash -c \"</dev/tcp/$ip/$p\" 2>/dev/null; then echo \"port $p open\"\nelse echo \"port $p closed or filtered\"; exit 1; fi\ncase $p in 80|443|8080) curl -s -o /dev/null -w \"HTTP %{http_code}\\n\" --max-time 5 \"http://$h:$p/\";; esac",
      },
    ],
    faq: [
      { q: "What is the difference between ifconfig and ip?", a: "ifconfig comes from the old net-tools package and is no longer installed by default on many distributions. ip from iproute2 is the modern replacement and shows everything, including multiple addresses and routing rules." },
      { q: "Why does ping fail when the website works?", a: "Many networks and cloud providers block ICMP, the protocol ping uses. Test the real service with curl or a TCP check instead." },
      { q: "What is the difference between netstat and ss?", a: "Both list sockets. ss is part of iproute2, is faster, and is the recommended tool; netstat belongs to the old net-tools package." },
      { q: "Why do changes made with ip disappear after a reboot?", a: "ip changes the running kernel only. To keep settings, configure them in NetworkManager with nmcli, or in netplan on Ubuntu." },
    ],
  },

  "adm-networking/nmcli": {
    plain: [
      "On RHEL and many other distributions, a background service called NetworkManager looks after the network. It reads saved settings, applies them to the network cards, and keeps them applied after reboots and cable unplugs.",
      "The saved settings are called connection profiles. A device is the real network card, such as ens160. A profile is a named set of settings (an address, a gateway, DNS servers) that can be put on a device. One device can have several profiles, but only one is active at a time.",
      "nmcli is the command you use to talk to NetworkManager. You change a profile, then activate it. The change is saved to disk, so it is still there after a reboot, unlike changes made with the ip command.",
      "Ubuntu Server uses netplan instead: you describe the network in a small YAML file and netplan hands it to the real network service. The ideas are the same: describe the desired state, then apply it.",
    ],
    deepDive: [
      {
        heading: "Profiles, devices and where settings live",
        body: "nmcli device status shows each device, its type, its state (connected, disconnected, unmanaged) and the active profile. nmcli connection show lists all profiles, and the DEVICE column is empty for inactive ones. A profile is tied to a device by connection.interface-name.\n\nOn RHEL 9 and newer, profiles are saved as keyfiles in /etc/NetworkManager/system-connections/, one NAME.nmconnection file per profile, in an INI-like format. The old ifcfg files in /etc/sysconfig/network-scripts are deprecated. Keyfiles must be owned by root with mode 600, or NetworkManager ignores them. If you edit a keyfile by hand, run nmcli connection reload so NetworkManager reads it again.\n\nTo see every setting of one profile, run nmcli connection show NAME. Lines in lowercase are saved settings; lines in capitals, such as IP4.ADDRESS, show what is currently applied.",
        bullets: ["nmcli -f NAME,DEVICE,TYPE con show picks columns", "nmcli -g ipv4.addresses con show static1 prints one value", "nmcli general hostname shows or sets the hostname"],
      },
      {
        heading: "Static, DHCP and DNS settings",
        body: "ipv4.method decides how the address is set: auto means DHCP, manual means static, and disabled turns IPv4 off. For manual you set ipv4.addresses with a prefix, such as 192.168.1.50/24, plus ipv4.gateway and ipv4.dns. Several DNS servers go in one quoted, space-separated value. ipv4.dns-search adds search domains, so a short name like db01 is tried as db01.lab.example.com.\n\nA DHCP profile can still carry your own DNS servers. By default they are added to the ones DHCP provides; set ipv4.ignore-auto-dns yes to use only yours. A plus or minus before a property name adds or removes one value instead of replacing the list, for example +ipv4.dns 9.9.9.9.\n\nThe same properties exist for IPv6 under ipv6.*, and ipv6.method also accepts auto (SLAAC) and ignore.",
        bullets: ["ipv4.method auto | manual | disabled", "+ipv4.addresses adds a second address", "ipv4.ignore-auto-dns yes drops DHCP DNS"],
      },
      {
        heading: "Applying changes safely, even over SSH",
        body: "nmcli connection modify only saves settings. They reach the device when the profile is activated: nmcli connection up NAME. That separation lets you prepare everything first, then apply in one step. nmcli device reapply ens160 is another way to push changes to the running device, and it does not take the link down.\n\nChanging the IP address you are connected through will cut your SSH session. Put the modify and up commands on one line joined with &&, so the second runs even after your session drops, and reconnect to the new address. Better still, have console access ready. nmcli connection down NAME deactivates a profile, and with autoconnect yes it will come back at the next boot.\n\nIf you get lost in property names, nmtui gives a simple menu, and nmcli connection edit NAME opens an interactive editor with tab completion.",
        visual: {
          type: "sequence",
          title: "From nmcli modify to a changed interface",
          actors: ["Admin", "NetworkManager", "Keyfile", "ens160"],
          messages: [
            { from: 0, to: 1, label: "con mod static1 ipv4.dns 9.9.9.9" },
            { from: 1, to: 2, label: "Save static1.nmconnection" },
            { from: 1, to: 0, label: "Saved; device unchanged" },
            { from: 0, to: 1, label: "con up static1" },
            { from: 1, to: 3, label: "Apply address, routes and DNS" },
          ],
        },
      },
      {
        heading: "netplan on Ubuntu",
        body: "Ubuntu Server describes networking in YAML files in /etc/netplan/, such as 50-cloud-init.yaml. netplan does not configure interfaces itself. It translates the YAML for a renderer: systemd-networkd, the default on servers, or NetworkManager, the default on desktops.\n\nIndentation matters in YAML, and the files should be readable by root only (mode 600), or netplan prints warnings. Use routes with to: default and via: instead of the older gateway4 key, which is deprecated.\n\nApply changes with netplan try: it applies the config and rolls back after 120 seconds unless you press Enter to confirm. That makes remote changes much safer. netplan apply applies without the safety net, and netplan get shows the merged settings. On cloud images, cloud-init may rewrite its file at boot; put your own changes in a separate file with a higher number, or disable cloud-init's network config.",
        bullets: ["sudo netplan try", "sudo netplan apply", "networkctl status shows systemd-networkd state"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Turning a DHCP server into a static one",
        steps: [
          { label: "Inspect", detail: "nmcli device status and con show" },
          { label: "Modify profile", detail: "method manual, address, gateway, DNS" },
          { label: "Activate", detail: "nmcli con up NAME" },
          { label: "Verify live state", detail: "ip -br addr, ip route, resolvectl or cat /etc/resolv.conf" },
          { label: "Test", detail: "ping the gateway, resolve a name" },
        ],
      },
    ],
    examples: [
      {
        title: "Switch the existing DHCP profile to a static address",
        explanation: "A new RHEL VM got 192.168.1.137 from DHCP. It should keep the fixed address 192.168.1.60/24 with gateway .1 and two DNS servers. Step 1: find the profile name for ens160; installers often call it ens160 or Wired connection 1. Step 2: change it to manual with all settings in one command. Step 3: activate it, joined with && so the command finishes even when your SSH session to the old address drops. Step 4: reconnect to .60 and verify.",
        code: {
          lang: "bash",
          code: "nmcli -f NAME,DEVICE con show --active\nsudo nmcli con mod ens160 ipv4.method manual \\\n  ipv4.addresses 192.168.1.60/24 ipv4.gateway 192.168.1.1 \\\n  ipv4.dns \"192.168.1.1 9.9.9.9\" ipv4.dns-search lab.example.com \\\n  && sudo nmcli con up ens160\n# reconnect: ssh admin@192.168.1.60\nip -br addr show ens160\nnmcli -g ipv4.dns,ipv4.gateway con show ens160",
        },
      },
      {
        title: "The same static setup with netplan",
        explanation: "On Ubuntu Server, the same goal is one YAML file. Step 1: create /etc/netplan/60-static.yaml with the address, default route and DNS servers. Step 2: set mode 600. Step 3: run netplan try, check you can still reach the server, then press Enter to keep it. If you cannot reach it, wait 120 seconds and the old config comes back.",
        code: {
          lang: "yaml",
          code: "# /etc/netplan/60-static.yaml\nnetwork:\n  version: 2\n  ethernets:\n    ens160:\n      dhcp4: false\n      addresses: [192.168.1.60/24]\n      routes:\n        - to: default\n          via: 192.168.1.1\n      nameservers:\n        addresses: [192.168.1.1, 9.9.9.9]\n        search: [lab.example.com]",
        },
      },
    ],
    cheatSheet: [
      "nmcli dev status lists devices; nmcli con show lists profiles (active ones have a DEVICE)",
      "nmcli con mod NAME ipv4.method manual ipv4.addresses IP/PREFIX ipv4.gateway GW ipv4.dns \"A B\"",
      "nmcli con mod only saves; nmcli con up NAME applies the change",
      "Use +ipv4.dns or -ipv4.dns to add or remove one value instead of replacing all",
      "Keyfiles live in /etc/NetworkManager/system-connections/ (mode 600); run nmcli con reload after hand edits",
      "nmcli con add type ethernet con-name NAME ifname DEV creates a new profile",
      "Ubuntu: edit /etc/netplan/*.yaml, then sudo netplan try (auto rollback after 120 s)",
    ],
    quiz: [
      {
        q: "Which ipv4.method value makes NetworkManager use DHCP?",
        options: ["dhcp", "dynamic", "manual", "auto"],
        answer: 3,
        why: "auto means DHCP for IPv4; manual is static.",
      },
      {
        q: "You ran nmcli con mod static1 ipv4.dns 9.9.9.9, but resolv.conf still shows the old server. Why?",
        options: ["The profile has not been reactivated with nmcli con up", "DNS changes need a reboot", "nmcli cannot set DNS", "resolv.conf must be edited by hand"],
        answer: 0,
        why: "modify saves the profile; activating it pushes the new settings to the device.",
      },
      {
        q: "Where does RHEL 9 store NetworkManager profiles by default?",
        options: ["/etc/sysconfig/network-scripts/ifcfg-*", "/etc/network/interfaces", "/etc/NetworkManager/system-connections/*.nmconnection", "/etc/netplan/*.yaml"],
        answer: 2,
        why: "RHEL 9 uses keyfiles; ifcfg files are deprecated.",
      },
      {
        q: "What makes netplan try safer than netplan apply on a remote server?",
        options: ["It only checks syntax", "It rolls back automatically unless you confirm", "It restarts the server first", "It uses NetworkManager instead"],
        answer: 1,
        why: "netplan try reverts after 120 seconds if you do not press Enter.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the device, type, and state of every network device, and the full IPv4 settings of the active profile on your main interface.",
        hint: "nmcli device status and nmcli con show NAME, filtered for ipv4.",
        solution: "nmcli device status\nname=$(nmcli -g NAME con show --active | head -1)\nnmcli con show \"$name\" | grep -i ipv4",
      },
      {
        level: "medium",
        task: "Add a second static address 192.168.1.61/24 and an extra DNS server 1.1.1.1 to profile static1 without removing the existing ones, and apply.",
        hint: "Use the + prefix on both properties.",
        solution: "sudo nmcli con mod static1 +ipv4.addresses 192.168.1.61/24 +ipv4.dns 1.1.1.1\nsudo nmcli con up static1\nip -br addr show\nnmcli -g ipv4.dns con show static1",
      },
      {
        level: "hard",
        task: "Create a new profile lab for ens192 with a static address, no gateway, a route to 10.0.0.0/8 via 192.168.50.1, that ignores DHCP DNS and does not start at boot. Then bring it up manually.",
        hint: "nmcli con add, ipv4.routes, connection.autoconnect no.",
        solution: "sudo nmcli con add type ethernet con-name lab ifname ens192 \\\n  ipv4.method manual ipv4.addresses 192.168.50.10/24 \\\n  ipv4.routes \"10.0.0.0/8 192.168.50.1\" \\\n  ipv4.ignore-auto-dns yes ipv6.method disabled \\\n  connection.autoconnect no\nsudo nmcli con up lab\nip route | grep 10.0.0.0",
      },
    ],
    faq: [
      { q: "Can I still edit /etc/resolv.conf by hand on RHEL?", a: "You can, but NetworkManager overwrites it when a connection changes. Set DNS with nmcli on the connection profile instead." },
      { q: "What is the difference between nmcli and nmtui?", a: "They control the same NetworkManager. nmcli is for commands and scripts, nmtui is a simple text menu that is handy when you do not remember property names." },
      { q: "Does Ubuntu Server use NetworkManager?", a: "Not by default. Ubuntu Server uses netplan with systemd-networkd as the renderer, while Ubuntu Desktop uses netplan with NetworkManager." },
      { q: "Why is my device shown as unmanaged?", a: "NetworkManager has been told not to manage it, for example by a config file in /etc/NetworkManager/conf.d/ or because another tool owns it. Set it back with nmcli device set DEV managed yes." },
    ],
  },

  "adm-networking/dns-time": {
    plain: [
      "Computers talk using numbers (IP addresses), but people use names like db01 or example.com. Name resolution is how a server turns a name into an address. It can come from a small local file, /etc/hosts, or from a DNS server, which is like a phone book on the network.",
      "Your own server also has a name, its hostname. It shows in your shell prompt, in logs, and in monitoring tools. You set it once with hostnamectl and it stays after a reboot.",
      "Time sounds unrelated, but it is just as basic. If clocks drift apart, log lines from two servers no longer line up, TLS certificates can look expired or not yet valid, and login systems like Kerberos refuse access. So servers keep their clocks in sync with time servers using NTP, the Network Time Protocol.",
      "On RHEL that job belongs to chronyd, the chrony service. You tell it which time servers to use, and it gently adjusts the clock so it stays accurate to within milliseconds.",
    ],
    deepDive: [
      {
        heading: "Static, transient and pretty hostnames",
        body: "hostnamectl manages three names. The static hostname is stored in /etc/hostname and used at boot. The transient hostname is the one the kernel uses right now; DHCP may set it if no static name exists. The pretty hostname is a free-form label like Web server 1 for display only.\n\nhostnamectl set-hostname web01.lab.example.com sets the static and transient names together, with no reboot. hostname -f prints the fully qualified name, which needs a matching entry in /etc/hosts or DNS. Many services read the hostname only at start, so restart them, or log out and back in to update your prompt.\n\nA good habit is to add the server's own name to /etc/hosts next to its real IP address, so tools that look up their own name still work if DNS is down.",
        bullets: ["hostnamectl shows all three names", "hostnamectl set-hostname NAME", "hostname -f prints the full name"],
      },
      {
        heading: "Where a lookup goes: nsswitch, resolv.conf and resolved",
        body: "Most programs resolve names through the C library, which reads the hosts line in /etc/nsswitch.conf. With hosts: files dns, it checks /etc/hosts first and asks DNS only if the name is not there. RHEL adds myhostname, which always resolves the machine's own name.\n\nFor DNS, the library reads /etc/resolv.conf: nameserver lines (up to three are used), and search domains that are appended to short names. On RHEL, NetworkManager writes this file from your profiles.\n\nUbuntu uses systemd-resolved. /etc/resolv.conf is a link to a stub file that points to 127.0.0.53, a small local resolver that forwards queries to the real DNS servers and caches the answers. So cat /etc/resolv.conf shows only 127.0.0.53; resolvectl status shows the real servers per interface, and resolvectl flush-caches clears the cache.",
        visual: {
          type: "sequence",
          title: "Looking up db01 on Ubuntu with systemd-resolved",
          actors: ["App", "glibc", "resolved 127.0.0.53", "DNS server"],
          messages: [
            { from: 0, to: 1, label: "getaddrinfo(\"db01\"), not in /etc/hosts" },
            { from: 1, to: 2, label: "Query db01.lab.example.com" },
            { from: 2, to: 3, label: "Not cached: forward the query" },
            { from: 3, to: 2, label: "A 10.0.5.21, TTL 300" },
            { from: 2, to: 1, label: "Answer, now cached" },
            { from: 1, to: 0, label: "10.0.5.21" },
          ],
        },
      },
      {
        heading: "Asking DNS directly with dig",
        body: "getent hosts NAME and getent ahosts NAME resolve a name exactly as applications do, including /etc/hosts. dig talks only to DNS, which makes it the tool for checking what DNS itself says.\n\ndig example.com shows the answer section, the TTL (how many seconds the answer may be cached) and which server replied. dig +short gives just the values. Add a type to ask for other records: AAAA for IPv6, MX for mail servers, TXT for text records, CNAME for aliases. dig @9.9.9.9 example.com asks a specific server, which tells you whether your own DNS server or the record itself is wrong. dig -x 10.0.5.21 does a reverse lookup to find the name for an address.\n\nThe status field matters: NXDOMAIN means the name does not exist, SERVFAIL means the server could not get an answer, and NOERROR with an empty answer means the name exists but has no record of that type.",
        bullets: ["dig +short example.com AAAA", "dig @1.1.1.1 example.com", "dig -x 10.0.5.21", "host and nslookup are simpler alternatives"],
      },
      {
        heading: "chrony: configuring and reading its status",
        body: "chronyd reads /etc/chrony.conf. A server line names one NTP server; a pool line names a DNS name that resolves to several, such as RHEL's default pool 2.rhel.pool.ntp.org iburst. iburst sends a quick burst of requests at startup so the first sync happens in seconds, not minutes. makestep 1.0 3 lets chrony jump the clock if it is more than one second off during the first three updates; after that it only speeds up or slows down the clock slightly, which is safer for running programs. NTP uses UDP port 123.\n\nchronyc sources lists the servers. In the second column, * marks the source you are synced to, + other good sources being combined, - acceptable ones not used, and ? unreachable ones. Reach is an octal record of the last eight polls: 377 means all eight answered. chronyc tracking shows the current offset. timedatectl shows the time zone and whether the clock is synchronized.",
        bullets: ["timedatectl set-timezone Europe/Berlin", "timedatectl set-ntp true enables NTP sync", "chronyc makestep forces an immediate correction"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "getent vs dig",
        columns: [
          { title: "getent hosts NAME", points: ["Follows nsswitch.conf", "Includes /etc/hosts", "Shows what apps really get", "No TTL or server details"] },
          { title: "dig NAME", points: ["Asks DNS servers only", "Ignores /etc/hosts", "Shows TTL, status and server", "Can query any record type and server"] },
        ],
      },
    ],
    examples: [
      {
        title: "ping db01 works, but the app connects to the wrong server",
        explanation: "After a database move, the app still reaches the old address. Step 1: getent shows 10.0.5.9, the old address. Step 2: dig shows 10.0.5.21, the new one. Different answers mean something before DNS is winning. Step 3: check nsswitch.conf order and /etc/hosts, where an old entry still points to 10.0.5.9. Step 4: remove it and resolve again. Restart the app too, because some runtimes cache DNS answers in memory.",
        code: {
          lang: "bash",
          code: "getent hosts db01\n# 10.0.5.9   db01.lab.example.com db01\ndig +short db01.lab.example.com\n# 10.0.5.21\ngrep ^hosts /etc/nsswitch.conf\ngrep db01 /etc/hosts\nsudo sed -i '/db01/d' /etc/hosts\ngetent hosts db01",
        },
      },
      {
        title: "Point chrony at the company time server",
        explanation: "Security requires all servers to sync only with ntp.lab.example.com. Step 1: comment out the default pool line in /etc/chrony.conf. Step 2: add a server line with iburst. Step 3: restart chronyd. Step 4: check chronyc sources until the new server shows ^* and Reach climbs towards 377, and confirm with timedatectl.",
        code: {
          lang: "bash",
          code: "sudo sed -i 's/^pool /#pool /' /etc/chrony.conf\necho 'server ntp.lab.example.com iburst' | sudo tee -a /etc/chrony.conf\nsudo systemctl restart chronyd\nchronyc sources -v\n# ^* ntp.lab.example.com   2   6   17   ...\nchronyc tracking | grep -E 'Reference|System time'\ntimedatectl | grep -i synchronized",
        },
      },
    ],
    cheatSheet: [
      "sudo hostnamectl set-hostname web01.lab.example.com sets the name permanently, no reboot",
      "getent hosts NAME resolves like apps do (nsswitch, /etc/hosts, DNS)",
      "dig +short NAME queries DNS only; dig @SERVER NAME asks one specific server",
      "NXDOMAIN: name does not exist. SERVFAIL: the server could not answer",
      "Ubuntu: resolvectl status shows the real DNS servers behind 127.0.0.53",
      "chrony.conf: server HOST iburst or pool HOST iburst; restart chronyd after changes",
      "chronyc sources: ^* is the synced source; Reach 377 means the last 8 polls answered",
    ],
    quiz: [
      {
        q: "/etc/hosts maps app01 to 10.0.0.5, and DNS says 10.0.0.9. With hosts: files dns, what does ping app01 use?",
        options: ["10.0.0.9", "10.0.0.5", "Both in turn", "Neither; it reports a conflict"],
        answer: 1,
        why: "files comes first in nsswitch.conf, so /etc/hosts wins.",
      },
      {
        q: "On Ubuntu, /etc/resolv.conf only lists nameserver 127.0.0.53. What is that?",
        options: ["A broken configuration", "The router's address", "The local systemd-resolved stub resolver", "A blocked DNS server"],
        answer: 2,
        why: "systemd-resolved listens on 127.0.0.53 and forwards queries to the real servers.",
      },
      {
        q: "In chronyc sources output, what does ^* mean?",
        options: ["The server chrony is currently synchronized to", "An unreachable server", "A server marked as false", "A local reference clock"],
        answer: 0,
        why: "* marks the selected source; ^ means it is an NTP server.",
      },
      {
        q: "What does dig return as status for a name that does not exist?",
        options: ["SERVFAIL", "REFUSED", "NOERROR", "NXDOMAIN"],
        answer: 3,
        why: "NXDOMAIN means non-existent domain.",
      },
      {
        q: "What does the iburst option on a chrony server line do?",
        options: ["Allows clock jumps at any time", "Sends a quick burst of requests at startup for a faster first sync", "Uses TCP instead of UDP", "Makes the server the only source"],
        answer: 1,
        why: "iburst speeds up the initial synchronization.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show your hostname details, your time zone and whether the clock is synchronized.",
        hint: "Two commands ending in ctl.",
        solution: "hostnamectl\ntimedatectl",
      },
      {
        level: "medium",
        task: "Find the IPv4 and IPv6 addresses and the mail servers of example.com, then check whether your DNS server and 9.9.9.9 give the same A record.",
        hint: "dig with record types, and dig @server.",
        solution: "dig +short example.com A\ndig +short example.com AAAA\ndig +short example.com MX\ndiff <(dig +short example.com A | sort) <(dig +short @9.9.9.9 example.com A | sort) && echo same",
      },
      {
        level: "hard",
        task: "Rename the server to app02.lab.example.com, make its own name resolve even without DNS, and confirm chrony is synced to at least one source.",
        hint: "hostnamectl, an /etc/hosts line with the real IP, and grep for ^* in chronyc sources.",
        solution: "sudo hostnamectl set-hostname app02.lab.example.com\nip=$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i==\"src\") print $(i+1)}')\necho \"$ip app02.lab.example.com app02\" | sudo tee -a /etc/hosts\nhostname -f\ngetent hosts app02\nchronyc sources | grep -q '^\\^\\*' && echo synced || echo NOT synced",
      },
    ],
    faq: [
      { q: "How do I change the hostname without rebooting?", a: "Run sudo hostnamectl set-hostname NEWNAME. It takes effect immediately; open a new shell to see it in your prompt." },
      { q: "Why does nslookup work but my application cannot resolve the name?", a: "nslookup and dig query DNS directly, while applications go through nsswitch.conf and /etc/hosts. Use getent hosts NAME to see what applications actually get." },
      { q: "Should I use chrony or systemd-timesyncd?", a: "chrony is the RHEL default and a full NTP client and server with better accuracy and monitoring. systemd-timesyncd is a lighter, client-only option that many Ubuntu installs use; installing chrony replaces it." },
      { q: "How do I flush the DNS cache on Linux?", a: "With systemd-resolved, run resolvectl flush-caches. Plain RHEL setups have no system-wide DNS cache unless you installed one such as nscd or dnsmasq." },
    ],
  },

  "adm-networking/firewalls": {
    plain: [
      "A firewall is a guard at the door of your server. It checks every incoming connection and lets in only the kinds you allowed, such as SSH or HTTPS. Everything else is turned away, so a forgotten test service is not reachable from the network.",
      "On RHEL, the guard is called firewalld, and you talk to it with firewall-cmd. On Ubuntu, the usual tool is ufw, the Uncomplicated Firewall. Both are friendly front ends: the real filtering happens inside the Linux kernel, in a system called nftables.",
      "A key idea for firewalld is runtime versus permanent. A rule you add normally works at once but is forgotten at the next reload or reboot. A permanent rule is saved to disk, but only starts working after a reload. Mixing these up is the most common firewall mistake.",
      "The golden rule on a remote server: always allow SSH before you turn the firewall on or tighten it, or you can lock yourself out.",
    ],
    deepDive: [
      {
        heading: "Zones: how firewalld decides which rules apply",
        body: "firewalld groups rules into zones. Each zone is a trust level with its own list of allowed services and ports. Built-in zones range from drop (silently drop everything incoming) and block (reject with an error), through public (the default: only listed services, typically ssh, dhcpv6-client and cockpit on RHEL), to trusted, which allows everything.\n\nWhen a new connection arrives, firewalld picks one zone for it. First it checks sources: if the client address matches a source bound to a zone, that zone wins. Otherwise it uses the zone of the interface the packet came in on. If the interface has no zone, the default zone applies. That lets you, for example, allow SSH only from the admin network by binding 10.0.10.0/24 to the internal zone and leaving ssh out of public.\n\nfirewall-cmd --get-active-zones shows which zones are in use and why, and --get-default-zone shows the fallback.",
        bullets: ["--set-default-zone=public", "--zone=internal --add-source=10.0.10.0/24", "--zone=internal --change-interface=ens192"],
        visual: {
          type: "flow",
          title: "How firewalld picks a zone for a new connection",
          steps: [
            { label: "Packet arrives", detail: "From 10.0.10.7 on ens160 to port 22" },
            { label: "Source match?", detail: "10.0.10.0/24 is bound to zone internal" },
            { label: "Else: interface zone", detail: "ens160 belongs to public" },
            { label: "Else: default zone", detail: "Used when nothing else matches" },
            { label: "Apply zone rules", detail: "Allowed service or port, or reject" },
          ],
        },
      },
      {
        heading: "Runtime, permanent and reload",
        body: "firewalld keeps two configurations. Runtime is what the kernel enforces right now. Permanent is what is saved in /etc/firewalld/ and loaded at start or on --reload. Without --permanent, a command changes runtime only. With --permanent, it changes the saved config only, and nothing happens until you reload.\n\nTwo safe workflows exist. Change runtime first, test, then copy everything with --runtime-to-permanent. Or add rules with --permanent and run --reload. A reload throws away runtime-only changes, which is useful as an undo but surprising if you forgot to save.\n\nYou can also add a temporary rule with --timeout=5m, which removes itself after five minutes: a good safety net when changing SSH access remotely. --list-all shows the runtime state of a zone, and --permanent --list-all shows the saved one; comparing them reveals unsaved changes.",
        bullets: ["--runtime-to-permanent saves tested rules", "--permanent --list-all shows saved rules", "--timeout=5m adds a self-removing runtime rule"],
      },
      {
        heading: "Services, ports and rich rules",
        body: "A firewalld service is a named bundle of ports and protocols. http is TCP 80, https TCP 443, and some services open several ports at once. firewall-cmd --get-services lists them, and --info-service=NAME shows what each contains. The definitions live in /usr/lib/firewalld/services/ as XML; custom ones go in /etc/firewalld/services/.\n\nIf no service fits, open a port directly: --add-port=8443/tcp or a range like --add-port=60000-60100/udp. Prefer services when one exists, because the name says why the rule is there.\n\nFor conditions, use rich rules. For example, --add-rich-rule='rule family=\"ipv4\" source address=\"10.0.10.0/24\" service name=\"ssh\" accept' allows SSH only from one network. Rich rules can also reject, drop, log or rate-limit. Remember that opening a non-standard port for a service on RHEL may also need an SELinux port label, added with semanage port.",
        bullets: ["--info-service=https", "--list-services and --list-ports", "nft list ruleset shows the real kernel rules"],
      },
      {
        heading: "ufw on Ubuntu",
        body: "ufw starts disabled. When enabled, its defaults deny incoming and allow outgoing connections. Rules are saved automatically; there is no runtime versus permanent split.\n\nSimple rules read like English: ufw allow 443/tcp, ufw allow OpenSSH (an application profile; ufw app list shows them), or ufw allow from 10.0.10.0/24 to any port 22 proto tcp. ufw limit OpenSSH allows SSH but denies an address that opens 6 or more connections within 30 seconds, a cheap defence against password guessing. ufw deny drops traffic silently, ufw reject sends an error back.\n\nRules are checked in order and the first match wins. ufw status numbered shows the order, ufw delete 3 removes rule 3, and ufw insert 1 allow from 10.0.10.5 puts a rule at the top. One famous trap: Docker publishes container ports with its own rules that are evaluated before ufw's, so a published container port can be reachable even when ufw seems to block it.",
        bullets: ["sudo ufw allow OpenSSH before sudo ufw enable", "sudo ufw status verbose", "sudo ufw status numbered, then sudo ufw delete N"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Runtime vs permanent in firewalld",
        columns: [
          { title: "Runtime (no --permanent)", points: ["Takes effect immediately", "Lost on --reload or reboot", "Good for testing", "Save with --runtime-to-permanent"] },
          { title: "Permanent (--permanent)", points: ["Saved to /etc/firewalld", "No effect until --reload", "Survives reboots", "Check with --permanent --list-all"] },
        ],
      },
      {
        type: "layers",
        title: "From your command to the kernel",
        layers: [
          { label: "firewall-cmd or ufw", detail: "What you type" },
          { label: "firewalld daemon or ufw scripts", detail: "Zones, services, saved rules" },
          { label: "nftables rule set", detail: "nft list ruleset shows it" },
          { label: "Netfilter in the kernel", detail: "Checks every packet" },
        ],
      },
    ],
    examples: [
      {
        title: "A web server that only admins can SSH into",
        explanation: "Goal: anyone may reach HTTP and HTTPS, but SSH is allowed only from the admin network 10.0.10.0/24. Step 1: add the web services permanently to public. Step 2: bind the admin network as a source to the internal zone, which allows ssh by default. Step 3: before removing ssh from public, make sure you are connected from the admin network, or keep a console open. Step 4: reload and verify both zones.",
        code: {
          lang: "bash",
          code: "sudo firewall-cmd --permanent --zone=public --add-service=http --add-service=https\nsudo firewall-cmd --permanent --zone=internal --add-source=10.0.10.0/24\nsudo firewall-cmd --permanent --zone=internal --list-services   # includes ssh\nsudo firewall-cmd --permanent --zone=public --remove-service=ssh\nsudo firewall-cmd --reload\nsudo firewall-cmd --get-active-zones\nsudo firewall-cmd --zone=public --list-all",
        },
      },
      {
        title: "Lock down a fresh Ubuntu server with ufw",
        explanation: "A new Ubuntu VM should accept only SSH (rate-limited) and HTTPS. Step 1: set the defaults explicitly. Step 2: allow SSH first, using limit to slow down brute force. Step 3: allow 443. Step 4: enable ufw; it warns that this may disrupt SSH, which is fine because SSH is already allowed. Step 5: check the numbered list.",
        code: {
          lang: "bash",
          code: "sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw limit OpenSSH\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status numbered",
        },
      },
    ],
    cheatSheet: [
      "firewall-cmd --get-active-zones shows which zones apply to which interfaces and sources",
      "firewall-cmd --permanent --add-service=https && firewall-cmd --reload opens HTTPS for good",
      "firewall-cmd --runtime-to-permanent saves all tested runtime rules",
      "firewall-cmd --list-all shows the active zone's services, ports and rich rules",
      "firewall-cmd --add-service=ssh --timeout=5m adds a rule that removes itself",
      "ufw: allow SSH, then ufw enable; ufw status numbered and ufw delete N manage rules",
      "ufw limit OpenSSH blocks an IP after 6 connections in 30 seconds",
      "Docker-published ports can bypass ufw rules; check with ss and an outside scan",
    ],
    quiz: [
      {
        q: "You ran firewall-cmd --permanent --add-port=8080/tcp, but 8080 is still blocked. What is missing?",
        options: ["A reboot of the server", "firewall-cmd --reload", "systemctl restart nftables", "ufw enable"],
        answer: 1,
        why: "Permanent changes are only loaded into the running firewall on reload or restart.",
      },
      {
        q: "A packet's source address is bound to zone internal, and its interface belongs to public. Which zone handles it?",
        options: ["public, because interfaces come first", "The default zone", "internal, because source bindings take priority", "Both zones in turn"],
        answer: 2,
        why: "firewalld checks source bindings before interface bindings.",
      },
      {
        q: "What does firewall-cmd --reload do to rules added without --permanent?",
        options: ["Discards them", "Saves them", "Keeps them until reboot", "Converts them to rich rules"],
        answer: 0,
        why: "Reload reloads the permanent config, so runtime-only rules are lost.",
      },
      {
        q: "Which ufw command removes the third rule in the list?",
        options: ["ufw remove 3", "ufw reset 3", "ufw deny 3", "ufw delete 3"],
        answer: 3,
        why: "ufw status numbered shows the numbers and ufw delete N removes that rule.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the default zone, the active zones, and everything allowed in the active zone on your RHEL machine.",
        hint: "Three firewall-cmd options starting with --get and --list.",
        solution: "sudo firewall-cmd --get-default-zone\nsudo firewall-cmd --get-active-zones\nsudo firewall-cmd --list-all",
      },
      {
        level: "medium",
        task: "Open TCP 8443 for testing, confirm it works, then save it permanently without typing the rule a second time.",
        hint: "Runtime first, then --runtime-to-permanent.",
        solution: "sudo firewall-cmd --add-port=8443/tcp\nsudo firewall-cmd --list-ports\n# test from another host: curl -k https://server:8443\nsudo firewall-cmd --runtime-to-permanent\nsudo firewall-cmd --permanent --list-ports",
      },
      {
        level: "hard",
        task: "Allow PostgreSQL (5432/tcp) only from 10.0.20.0/24 with a rich rule, permanently, and show that other sources are still blocked.",
        hint: "The postgresql service exists; put the whole rich rule in single quotes.",
        solution: "sudo firewall-cmd --permanent --add-rich-rule='rule family=\"ipv4\" source address=\"10.0.20.0/24\" service name=\"postgresql\" accept'\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-rich-rules\nsudo firewall-cmd --list-services | grep -w postgresql || echo 'not open to everyone'\n# from 10.0.20.x: timeout 3 bash -c '</dev/tcp/db/5432' && echo open\n# from elsewhere: the same test fails",
      },
    ],
    faq: [
      { q: "Should I use firewalld or ufw?", a: "Use the one your distribution ships with: firewalld on RHEL, Rocky, Alma and Fedora, ufw on Ubuntu. Do not run both, or iptables and nftables rules by hand on top, because they will fight over the rules." },
      { q: "Why do my firewall rules disappear after a reboot?", a: "With firewalld they were probably added without --permanent. Add them again with --permanent and reload, or save the current state with --runtime-to-permanent." },
      { q: "Does ufw protect Docker containers?", a: "Not by default. Docker inserts its own rules for published ports, which are checked before ufw's. Bind published ports to 127.0.0.1 or use Docker's DOCKER-USER chain to restrict them." },
      { q: "How do I check which ports are actually reachable?", a: "Run ss -tulpn on the server to see what listens, then test from another machine with nc -zv host port or nmap, because only an outside test shows the firewall's real effect." },
    ],
  },
};

export default extra;
