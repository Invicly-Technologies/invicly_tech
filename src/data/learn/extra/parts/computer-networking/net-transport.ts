import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-transport/ports-sockets": {
    plain: [
      "One computer can run a web server, an SSH server and a database at the same time, all on one IP address. The IP address brings data to the right machine. The port, a number from 0 to 65535, brings it to the right program on that machine. Think of the IP address as a building and the port as an apartment number.",
      "A socket is the object a program uses to talk on the network. The operating system creates it, and the program reads and writes through it, much like a file. A server socket waits (listens) on one port. A client socket connects out to a server's IP address and port.",
      "When your browser connects to a website, the operating system picks a free temporary port for your side, called an ephemeral port. One connection is then described by five values: the protocol (TCP or UDP), your IP, your port, the server IP and the server port. This set is the 5-tuple. Change any one value and it is a different connection.",
      "This is how one server port, like 443, can serve thousands of visitors at once. Each visitor has a different IP or port on their side, so every 5-tuple is unique. The kernel reads the 5-tuple of each arriving packet and hands it to the matching socket. This sorting is called demultiplexing.",
    ],
    deepDive: [
      {
        heading: "The three port ranges and who uses them",
        body: "IANA, the body that assigns internet numbers, splits the 65,536 ports into three ranges. System or well-known ports (0 to 1023) belong to core services such as SSH on 22 and HTTPS on 443. Registered ports (1024 to 49151) are listed for specific applications, such as PostgreSQL on 5432. Dynamic ports (49152 to 65535) are never assigned and are meant for temporary client use.\n\nOperating systems do not all follow that last range. Windows uses 49152 to 65535 for client ports, but Linux uses 32768 to 60999 by default, set in net.ipv4.ip_local_port_range. On Linux, binding to a port below 1024 needs root or the CAP_NET_BIND_SERVICE capability; the cut-off is net.ipv4.ip_unprivileged_port_start, which defaults to 1024. Binding to port 0 means \"give me any free port\".",
        bullets: ["0-1023: well-known (22, 25, 53, 80, 443)", "1024-49151: registered (3306, 5432, 6379, 8080)", "49152-65535: dynamic, for temporary use", "Linux client ports: 32768-60999 by default"],
      },
      {
        heading: "Inside the server: listen, accept and the queues",
        body: "A TCP server makes four calls. socket() creates the socket, bind() attaches it to an IP and port, listen() marks it as a listening socket, and accept() waits for a client. The kernel finishes the three-way handshake on its own, before the program is involved. Each finished connection waits in the accept queue until the program calls accept(), which returns a brand-new socket for that one client. The listening socket stays open for the next one.\n\nThe queue has a limit: the backlog passed to listen(), capped by net.core.somaxconn (4096 by default since Linux 5.4). For a LISTEN socket, ss shows the current queue length as Recv-Q and the limit as Send-Q. If Recv-Q sits near Send-Q, your program is too slow to accept, and new clients are dropped or delayed.",
        visual: {
          type: "flow",
          title: "Server socket calls, in order",
          steps: [
            { label: "socket()", detail: "Create a TCP socket" },
            { label: "bind()", detail: "Attach it to an IP and port, such as 0.0.0.0:9000" },
            { label: "listen()", detail: "Kernel now answers SYNs for this port" },
            { label: "Accept queue", detail: "Finished handshakes wait here" },
            { label: "accept()", detail: "Returns a new socket for one client" },
            { label: "recv() and send()", detail: "Talk to that client; listener keeps waiting" },
          ],
        },
      },
      {
        heading: "How the kernel finds the right socket",
        body: "For each arriving TCP packet, the kernel first looks for a connected socket that matches the full 5-tuple. If there is none and the packet is a SYN (a request to open a connection), it looks for a listening socket on the destination IP and port. A socket bound to 0.0.0.0 (or :: for IPv6) matches every local address, while one bound to 127.0.0.1 only matches traffic from the same machine. If nothing matches at all, TCP answers with a RST (reset) packet, which the client sees as \"Connection refused\".\n\nUDP has no connections, so a UDP server socket usually matches on destination IP and port only, and one socket receives datagrams from every client. If no UDP socket matches, the host replies with an ICMP \"port unreachable\" message.",
      },
      {
        heading: "Reading ss output",
        body: "ss is the modern replacement for netstat on Linux. The letters combine: t for TCP, u for UDP, l for listening only, a for all states, n for numbers instead of names, and p to show the owning process (use sudo to see processes of other users). So ss -tlnp lists TCP listeners, and ss -tunap shows everything.\n\nThe Local Address column tells you who can reach a listener. 0.0.0.0:22 or *:22 means every interface; 127.0.0.1:5432 means local only; [::]:80 is the IPv6 any-address, which on Linux often accepts IPv4 too. ss also takes filters, so you can ask for exactly what you need instead of piping through grep.",
        bullets: ["ss -tlnp: TCP listeners with process names", "ss -tn state established '( dport = :443 )': open HTTPS connections", "ss -tlnp 'sport = :8080': who listens on 8080", "ss -s: summary counts per state"],
      },
      {
        heading: "Ephemeral port exhaustion",
        body: "Every outgoing connection to the same destination IP and port needs its own source port, or the 5-tuples would clash. The default Linux range gives 28,232 ports. A closed connection usually sits in TIME_WAIT for 60 seconds and keeps its port during that time.\n\nNow picture a service that opens a fresh connection to one backend 500 times a second and closes it after each request. After 60 seconds it holds about 30,000 ports, more than the range allows, and connect() starts failing with \"Cannot assign requested address\" (EADDRNOTAVAIL). The best fix is to reuse connections (HTTP keep-alive or a connection pool). Widening the port range or adding more backend IPs only buys time.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Sockets and the kernel during one connection",
        actors: ["Client app", "Client kernel", "Server kernel", "Server app"],
        messages: [
          { from: 3, to: 2, label: "bind(0.0.0.0:9000) and listen()" },
          { from: 0, to: 1, label: "connect(server, 9000)" },
          { from: 1, to: 2, label: "SYN from ephemeral port 51544" },
          { from: 2, to: 1, label: "SYN-ACK" },
          { from: 1, to: 2, label: "ACK: connection waits in accept queue" },
          { from: 3, to: 2, label: "accept() returns a new socket" },
          { from: 0, to: 3, label: "send() and recv() move bytes" },
        ],
      },
      {
        type: "compare",
        title: "Listening socket versus connected socket",
        columns: [
          { title: "Listening socket", points: ["One per IP and port", "State LISTEN", "Never carries data itself", "Matched by local IP and port"] },
          { title: "Connected socket", points: ["One per client connection", "State ESTAB", "Carries the byte stream", "Matched by the full 5-tuple"] },
        ],
      },
    ],
    examples: [
      {
        title: "Address already in use on port 8080",
        explanation: "You start a dev server and it fails with \"Address already in use\" (EADDRINUSE). Step 1: ask ss who owns port 8080. Step 2: if ss shows nothing, try lsof, which also works on macOS. Step 3: decide: stop the old process, or start yours on another port. If ss only shows connections in TIME_WAIT from a server you just restarted, the fix is for the server to set SO_REUSEADDR before bind(), which most frameworks already do.",
        code: {
          lang: "bash",
          code: "sudo ss -tlnp 'sport = :8080'\n# LISTEN 0 4096 0.0.0.0:8080 0.0.0.0:* users:((\"node\",pid=4121,fd=19))\nsudo lsof -nP -iTCP:8080 -sTCP:LISTEN\nkill 4121        # or run yours on another port",
        },
      },
      {
        title: "One port, many clients: a tiny echo server",
        explanation: "Run this server, then open two more terminals and type nc 127.0.0.1 9000 in each. Type a line and it comes back in capitals. In a fourth terminal, ss -tn 'sport = :9000' shows two ESTAB sockets. Both have local port 9000, but the peer ports differ (for example 51544 and 51560), so the two 5-tuples are unique. That is all multiplexing is.",
        code: {
          lang: "python",
          code: "import socketserver\n\nclass Echo(socketserver.StreamRequestHandler):\n    def handle(self):\n        print(\"connected\", self.client_address)\n        for line in self.rfile:          # one line at a time\n            self.wfile.write(line.upper())\n        print(\"closed\", self.client_address)\n\nsocketserver.ThreadingTCPServer.allow_reuse_address = True\nwith socketserver.ThreadingTCPServer((\"0.0.0.0\", 9000), Echo) as srv:\n    srv.serve_forever()",
        },
      },
    ],
    cheatSheet: [
      "Ports are 16-bit: 0-1023 well-known, 1024-49151 registered, 49152-65535 dynamic",
      "Linux picks client ports from net.ipv4.ip_local_port_range, default 32768 60999",
      "ss -tlnp lists TCP listeners with the owning process; ss -ulnp does the same for UDP",
      "Bind to 127.0.0.1 for local-only access; 0.0.0.0 or :: listens on every interface",
      "EADDRINUSE on bind: another socket already holds that IP and port",
      "EADDRNOTAVAIL on connect (Cannot assign requested address) often means ephemeral ports ran out",
      "TCP and UDP have separate port spaces: DNS uses 53 on both at once",
      "Common ports: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 123 NTP, 443 HTTPS, 5432 PostgreSQL",
    ],
    quiz: [
      {
        q: "Two browser tabs on one laptop connect to the same server on port 443. What makes the two connections different?",
        options: ["The server gives each one its own port", "The protocol field", "The client's source port", "The destination IP"],
        answer: 2,
        why: "The client side picks a different ephemeral port for each connection, so the 5-tuples differ.",
      },
      {
        q: "On a default Linux system, which range does the kernel use for client ephemeral ports?",
        options: ["32768-60999", "49152-65535", "1024-65535", "0-1023"],
        answer: 0,
        why: "net.ipv4.ip_local_port_range defaults to 32768 60999; 49152-65535 is the IANA range Windows uses.",
      },
      {
        q: "ss -tln shows a LISTEN socket with Recv-Q 4096 and Send-Q 4096. What does that mean?",
        options: ["4096 bytes are waiting to be sent", "The network is losing packets", "The client buffers are full", "The accept queue is full because the app is not calling accept() fast enough"],
        answer: 3,
        why: "For listeners, Recv-Q is the number of connections waiting for accept() and Send-Q is the queue limit.",
      },
      {
        q: "A UDP datagram arrives for a port where nothing is listening. What does the host usually send back?",
        options: ["A TCP RST", "An ICMP port unreachable message", "A UDP packet with length 0", "A SYN-ACK"],
        answer: 1,
        why: "UDP has no reset flag, so the host reports the closed port with ICMP.",
      },
      {
        q: "Which bind address makes a server reachable only from the same machine?",
        options: ["0.0.0.0", "::", "The machine's public IP", "127.0.0.1"],
        answer: 3,
        why: "127.0.0.1 is the loopback address, which other hosts cannot reach.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every listening TCP and UDP socket on your machine, then find which process listens on port 22 (or any port you see).",
        hint: "Combine t, u, l, n and p, and use a sport filter for one port.",
        solution: "sudo ss -tulnp\nsudo ss -tlnp 'sport = :22'\n# users:((\"sshd\",pid=812,fd=3)) shows the process and its PID",
      },
      {
        level: "medium",
        task: "Start the echo server from the example, connect two nc clients, and write down the full 5-tuple of each connection.",
        hint: "ss -tn with a filter on port 9000 shows local and peer address for each socket.",
        solution: "python3 echo.py &\nnc 127.0.0.1 9000     # terminal 2\nnc 127.0.0.1 9000     # terminal 3\nss -tn 'sport = :9000'\n# ESTAB 127.0.0.1:9000 127.0.0.1:51544\n# ESTAB 127.0.0.1:9000 127.0.0.1:51560\n# 5-tuples: (TCP, 127.0.0.1, 51544, 127.0.0.1, 9000) and (TCP, ..., 51560, ..., 9000)",
      },
      {
        level: "hard",
        task: "Prove that the ephemeral range limits outgoing connections: shrink it to 10 ports, open 11 connections to one local server, and see the 11th fail. Restore the range afterwards.",
        hint: "Keep every client socket open in a list so its port stays in use.",
        solution: "sudo sysctl -w net.ipv4.ip_local_port_range=\"40000 40009\"\npython3 - <<'EOF'\nimport socket\nsrv = socket.create_server((\"127.0.0.1\", 9000), backlog=50)\nconns = []\nfor i in range(11):\n    try: conns.append(socket.create_connection((\"127.0.0.1\", 9000)))\n    except OSError as e: print(i, e)   # 10 [Errno 99] Cannot assign requested address\nEOF\nsudo sysctl -w net.ipv4.ip_local_port_range=\"32768 60999\"",
      },
    ],
    faq: [
      { q: "What is the difference between a port and a socket?", a: "A port is just a number. A socket is an operating system object a program uses to send and receive; it is tied to an IP address and port, and a connected TCP socket also knows the remote IP and port." },
      { q: "Why do I need sudo to run a server on port 80?", a: "Linux reserves ports below 1024 for privileged processes. Instead of running as root, give the binary the capability with setcap 'cap_net_bind_service=+ep', set AmbientCapabilities=CAP_NET_BIND_SERVICE in a systemd unit, or listen on 8080 behind a reverse proxy." },
      { q: "Can TCP and UDP use the same port number at the same time?", a: "Yes. They are separate protocols with separate port spaces, so TCP 53 and UDP 53 can belong to different sockets, and DNS servers use both." },
      { q: "Does the 65,535 port limit cap how many clients a server can have?", a: "No. The server uses one port, and each client connection is unique because of the client's IP and port. The real limits are memory and file descriptors, so one server can hold hundreds of thousands of connections." },
    ],
  },

  "net-transport/tcp-connections": {
    plain: [
      "TCP works a bit like a phone call. Before talking, you dial, the other side picks up, and you both confirm you can hear each other. In TCP this takes three packets: SYN (\"I want to connect\"), SYN-ACK (\"OK, I hear you, do you hear me?\") and ACK (\"Yes\"). Only then does data flow. This costs one round trip, the time for a packet to go there and back.",
      "TCP gives every byte a number, called a sequence number. Each side picks a random starting number during the handshake. The receiver answers with an acknowledgement number: the number of the next byte it expects. So both sides always know exactly which bytes have arrived.",
      "Closing is polite too. Each side sends a FIN (finish) when it has nothing more to send, and the other side acknowledges it. Because each direction closes on its own, a normal close takes four packets, often squeezed into three. A RST (reset) is the rude version: it ends the connection at once, like hanging up mid-sentence.",
      "Each end keeps a state for the connection, such as LISTEN, ESTABLISHED or TIME_WAIT, and ss shows them. States are great clues. Thousands of sockets in CLOSE_WAIT mean an app forgets to close connections. Many in SYN-SENT mean a server is not answering.",
    ],
    deepDive: [
      {
        heading: "The TCP header, field by field",
        body: "The TCP header is 20 bytes without options and at most 60 bytes with them. It has no length field for the data; the receiver works that out from the IP header.\n\nSource and destination ports take 16 bits each. The sequence number (32 bits) is the number of the first data byte in this segment. The acknowledgement number (32 bits) is the next byte the sender expects to receive, and it is only valid when the ACK flag is set. Data offset (4 bits) gives the header length in 32-bit words, from 5 (20 bytes) to 15 (60 bytes). After 4 reserved bits come 8 flag bits: CWR, ECE, URG, ACK, PSH, RST, SYN and FIN. The window (16 bits) is the free receive buffer space. Then come the checksum, the urgent pointer and up to 40 bytes of options.",
        visual: {
          type: "layers",
          title: "TCP header, 32 bits per row",
          layers: [
            { label: "Source port (16) | Destination port (16)", detail: "Which programs on each end" },
            { label: "Sequence number (32)", detail: "Number of the first byte in this segment" },
            { label: "Acknowledgement number (32)", detail: "Next byte expected from the other side" },
            { label: "Offset (4) | Reserved (4) | Flags (8) | Window (16)", detail: "Flags: CWR ECE URG ACK PSH RST SYN FIN" },
            { label: "Checksum (16) | Urgent pointer (16)", detail: "Error check over header and data" },
            { label: "Options (0-40 bytes)", detail: "MSS, window scale, SACK, timestamps" },
          ],
        },
      },
      {
        heading: "Sequence numbers and what the handshake agrees on",
        body: "Each side picks a random initial sequence number (ISN). Randomness makes it hard for an attacker to guess numbers and inject fake packets. SYN and FIN each use up one sequence number even though they carry no data, which is why the reply to SYN seq=x is ack=x+1.\n\nAfter the handshake, numbers simply count bytes. If the client's ISN is 1000 and it sends 200 bytes, those bytes are numbered 1001 to 1200 and the server answers ack=1201. Wireshark and tcpdump show relative numbers (starting at 0 or 1) by default to make this easier to read.\n\nThe SYN packets also carry options that can only be agreed at this moment: the maximum segment size (MSS, typically 1460 bytes on IPv4 Ethernet and 1440 on IPv6), window scaling, SACK permitted and timestamps. If one side leaves an option out, the connection runs without it.",
        bullets: ["SYN and FIN each consume one sequence number", "ACK number = last byte received + 1", "MSS 1460 = 1500 MTU - 20 IP - 20 TCP"],
      },
      {
        heading: "Graceful close, half-close and RST",
        body: "A FIN means \"I will send no more data\", not \"go away\". The other side can keep sending until it sends its own FIN. This is called a half-close, and a program can do it on purpose with shutdown(SHUT_WR), for example to tell a server that the upload is finished while still reading the reply.\n\nA RST ends both directions immediately and is never acknowledged. The kernel sends one when a packet arrives for a port with no socket, when a program aborts a connection (closing with SO_LINGER set to 0), or when a program closes a socket while unread data is still in its receive buffer. The program on the other side sees \"Connection refused\" (ECONNREFUSED) if the RST answered its SYN, or \"Connection reset by peer\" (ECONNRESET) on an open connection. Firewalls and load balancers also send RSTs when they drop idle connections.",
        visual: {
          type: "sequence",
          title: "Graceful close with the state of each side",
          actors: ["Client (closes first)", "Server"],
          messages: [
            { from: 0, to: 1, label: "FIN: client enters FIN_WAIT_1" },
            { from: 1, to: 0, label: "ACK: server in CLOSE_WAIT, client in FIN_WAIT_2" },
            { from: 1, to: 0, label: "Server may still send its last data" },
            { from: 1, to: 0, label: "FIN: server enters LAST_ACK" },
            { from: 0, to: 1, label: "ACK: client in TIME_WAIT, server CLOSED" },
          ],
        },
      },
      {
        heading: "The 11 TCP states and what piles of them mean",
        body: "RFC 9293 defines 11 states: CLOSED, LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT-1, FIN-WAIT-2, CLOSE-WAIT, CLOSING, LAST-ACK and TIME-WAIT. ss prints them with short names such as SYN-RECV and ESTAB. The side that closes first (the active closer) goes through FIN-WAIT-1, FIN-WAIT-2 and TIME-WAIT. The other side (the passive closer) goes through CLOSE-WAIT and LAST-ACK. CLOSING only appears when both sides send FIN at the same moment.\n\nOne socket in a state tells you little. Hundreds in the same state point straight at a problem.\n\nA client that gets no answer to its SYN retries with growing gaps. With Linux defaults (net.ipv4.tcp_syn_retries = 6, first retry after 1 second, then doubling) connect() gives up after about 127 seconds.",
        bullets: ["Many SYN-SENT: remote host down or a firewall drops your SYNs", "Many SYN-RECV on a server: a SYN flood, or clients' final ACKs are lost", "Many CLOSE-WAIT: your app does not call close() after the peer closed", "Many TIME-WAIT: normal on the side that closes lots of short connections", "Stuck FIN-WAIT-2: the peer never closes; Linux frees orphans after tcp_fin_timeout (60 s)"],
      },
      {
        heading: "TIME_WAIT: why it exists and how to live with it",
        body: "The active closer waits in TIME_WAIT for two reasons. First, its final ACK might be lost; the peer would then resend its FIN, and someone must still be there to ACK it again. Second, old delayed packets from this connection must die out before a new connection with the same 5-tuple starts, or they could be mistaken for new data.\n\nThe RFC asks for 2 x MSL (maximum segment lifetime). Linux uses a fixed 60 seconds, and no sysctl changes it. A common mix-up: net.ipv4.tcp_fin_timeout controls orphaned FIN-WAIT-2 sockets, not TIME_WAIT.\n\nTIME_WAIT sockets use very little memory. The only real cost is the port they hold on a client making many short connections to one destination. Fix that with keep-alive or connection pools. net.ipv4.tcp_tw_reuse lets new outgoing connections reuse TIME_WAIT ports safely using timestamps. Never follow old advice to enable tcp_tw_recycle: it broke clients behind NAT and was removed in Linux 4.12.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "States of the side that opens and closes first",
        steps: [
          { label: "CLOSED", detail: "No connection yet" },
          { label: "SYN-SENT", detail: "SYN sent, waiting for SYN-ACK" },
          { label: "ESTABLISHED", detail: "Handshake done, data flows" },
          { label: "FIN-WAIT-1", detail: "Own FIN sent" },
          { label: "FIN-WAIT-2", detail: "FIN acked, waiting for peer's FIN" },
          { label: "TIME-WAIT", detail: "Peer's FIN acked, wait 60 s on Linux" },
          { label: "CLOSED", detail: "Port and 5-tuple free again" },
        ],
      },
      {
        type: "compare",
        title: "Graceful close (FIN) versus abort (RST)",
        columns: [
          { title: "FIN", points: ["Delivers all queued data first", "Closes one direction at a time", "Acknowledged by the peer", "Active closer enters TIME_WAIT"] },
          { title: "RST", points: ["Throws away queued data", "Ends both directions at once", "Never acknowledged", "No TIME_WAIT", "App sees refused or reset errors"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reading a handshake in tcpdump",
        explanation: "Capture traffic to one server and read the flags. Flags [S] is the SYN, with the client's ISN and its options: MSS 1460, SACK allowed, timestamps and window scale 7. [S.] is the SYN-ACK (the dot means ACK); its ack is the client's ISN plus 1. [.] is the plain ACK that completes the handshake. tcpdump now switches to relative numbers, so ack 1 means \"I got your SYN\". [P.] carries 517 bytes of data (here a TLS ClientHello) as bytes 1 to 517, and the server answers ack 518. Add -S to see absolute numbers throughout.",
        code: {
          lang: "text",
          code: "$ sudo tcpdump -i any -nn 'host 198.51.100.5 and tcp port 443'\nIP 192.0.2.10.51544 > 198.51.100.5.443: Flags [S], seq 3127519830, win 64240, options [mss 1460,sackOK,TS val 1 ecr 0,nop,wscale 7], length 0\nIP 198.51.100.5.443 > 192.0.2.10.51544: Flags [S.], seq 801443172, ack 3127519831, win 65160, options [mss 1460,sackOK,TS val 9 ecr 1,nop,wscale 7], length 0\nIP 192.0.2.10.51544 > 198.51.100.5.443: Flags [.], ack 1, win 502, length 0\nIP 192.0.2.10.51544 > 198.51.100.5.443: Flags [P.], seq 1:518, ack 1, win 502, length 517\nIP 198.51.100.5.443 > 192.0.2.10.51544: Flags [.], ack 518, win 507, length 0",
        },
      },
      {
        title: "Hunting a CLOSE_WAIT leak",
        explanation: "An API server slowly gets worse and finally logs \"Too many open files\". Step 1: count sockets per state; CLOSE-WAIT is far ahead of the rest. Step 2: find the process that owns them. CLOSE_WAIT means the peer already sent FIN and the kernel acknowledged it, but your program never called close(), so the socket and its file descriptor live forever. Step 3: count that process's open file descriptors to confirm. The fix is in the code: close response bodies and connections in a finally block or a with statement, or use a connection pool.",
        code: {
          lang: "bash",
          code: "ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn\n#  3012 CLOSE-WAIT\n#   140 ESTAB\nsudo ss -tanp state close-wait | head -3\nsudo ls /proc/$(pgrep -of myapp)/fd | wc -l",
        },
      },
    ],
    cheatSheet: [
      "Handshake: SYN, SYN-ACK, ACK; SYN and FIN each consume one sequence number",
      "tcpdump flags: [S] SYN, [S.] SYN-ACK, [.] ACK, [P.] data with PSH, [F.] FIN, [R] reset",
      "TCP header: 20 bytes minimum, 60 maximum; data offset counts 32-bit words (5 to 15)",
      "Count sockets per state: ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c",
      "Many CLOSE-WAIT = your app is not closing sockets; many SYN-SENT = the peer is not answering",
      "Linux TIME_WAIT is a fixed 60 s; tcp_fin_timeout is for orphaned FIN-WAIT-2, not TIME_WAIT",
      "Connection refused = a RST answered your SYN; a timeout usually means a firewall dropped it",
      "Wireshark: tcp.flags.syn == 1 && tcp.flags.ack == 0 shows only new connection attempts",
    ],
    quiz: [
      {
        q: "The client's ISN is 1000. After the handshake it sends 200 bytes. What ACK number does the server send back?",
        options: ["1200", "1201", "1001", "200"],
        answer: 1,
        why: "The SYN used number 1000, the data is bytes 1001 to 1200, so the next expected byte is 1201.",
      },
      {
        q: "Which side of a TCP connection ends up in TIME_WAIT?",
        options: ["The side that sent the first FIN", "Always the server", "The side that received the first FIN", "Both sides, always"],
        answer: 0,
        why: "The active closer enters TIME_WAIT; the passive closer goes through CLOSE_WAIT and LAST_ACK.",
      },
      {
        q: "ss shows 3,000 sockets in CLOSE-WAIT on your API server. What is the most likely cause?",
        options: ["A SYN flood", "The network drops FIN packets", "TIME_WAIT is set too long", "The application never calls close() after the peer closed"],
        answer: 3,
        why: "CLOSE_WAIT means the peer's FIN arrived and the kernel is waiting for the local program to close.",
      },
      {
        q: "What is the maximum size of a TCP header?",
        options: ["20 bytes", "40 bytes", "60 bytes", "64 bytes"],
        answer: 2,
        why: "The 4-bit data offset can be at most 15 words of 4 bytes, which is 60 bytes.",
      },
      {
        q: "connect() to a host returns \"Connection refused\" instantly. What happened on the wire?",
        options: ["The SYN got no reply", "The host answered the SYN with a RST", "The handshake finished, then the server sent FIN", "DNS failed"],
        answer: 1,
        why: "An instant refusal is a RST, usually because nothing listens on that port; silence would cause a timeout instead.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Capture your own handshake and teardown while running curl against an HTTP site. Point out the SYN, SYN-ACK, ACK and the FIN packets, and the MSS each side offered.",
        hint: "Filter tcpdump on port 80 and look at the Flags field and options.",
        solution: "sudo tcpdump -i any -nn -c 12 'tcp port 80' &\ncurl -s http://example.com > /dev/null\n# [S] and [S.] lines show options [mss ...]\n# [.] completes the handshake, [P.] carries the request\n# [F.] lines are the FINs from each side",
      },
      {
        level: "medium",
        task: "Make a TIME_WAIT socket appear on your own machine and work out which side holds it and why.",
        hint: "Python's http.server speaks HTTP/1.0 by default, so think about who closes first.",
        solution: "python3 -m http.server 8000 &\ncurl -s localhost:8000 > /dev/null\nss -tan state time-wait '( sport = :8000 or dport = :8000 )'\n# Local address is 127.0.0.1:8000: the server holds TIME_WAIT,\n# because with HTTP/1.0 the server closed the connection first.",
      },
      {
        level: "hard",
        task: "Produce two kinds of RST on loopback and capture both: one from a closed port, and one from a program that aborts a connection with SO_LINGER set to 0.",
        hint: "struct.pack(\"ii\", 1, 0) builds the linger option: on, with 0 seconds.",
        solution: "sudo tcpdump -i lo -nn 'tcp port 9001 or tcp port 9002' &\ncurl localhost:9001        # [S] then [R.]: connection refused\npython3 - <<'EOF'\nimport socket, struct\ns = socket.create_server((\"127.0.0.1\", 9002))\nc = socket.create_connection((\"127.0.0.1\", 9002))\nc.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, struct.pack(\"ii\", 1, 0))\nc.close()                  # sends [R.] instead of FIN, no TIME_WAIT\nEOF",
      },
    ],
    faq: [
      { q: "Why is it called a three-way handshake?", a: "Three packets are needed so that each side sends its own starting sequence number and gets it acknowledged. The server's SYN and its ACK of the client's SYN travel together in one packet, so two SYNs and two ACKs fit into three packets." },
      { q: "What is the difference between Connection refused and Connection timed out?", a: "Refused means the host is reachable and answered your SYN with a RST, usually because no program listens on that port. Timed out means no answer came at all, often because a firewall silently drops the packets or the host is down." },
      { q: "Are thousands of TIME_WAIT sockets a problem?", a: "Usually not. They are cheap and clear themselves after 60 seconds on Linux. They only hurt when a client runs out of ephemeral ports to one destination, and reusing connections fixes that." },
      { q: "Why does Wireshark show sequence numbers starting at 0?", a: "Wireshark shows relative sequence numbers by default, counting from the ISN, so they are easy to read. The real numbers are random 32-bit values; you can see them as the raw sequence number field in the packet details." },
    ],
  },

  "net-transport/tcp-reliability": {
    plain: [
      "IP, the layer below TCP, makes no promises. Packets can be lost, arrive twice or arrive out of order. TCP hides all of that. The sender keeps a copy of every byte until the receiver confirms it with an ACK. If the ACK does not come in time, the sender sends the data again. This is called retransmission.",
      "But how long should the sender wait? Too short, and it resends data that was only slow. Too long, and the connection stalls. TCP measures the round-trip time (RTT) all the time and sets a timer a little above it, called the retransmission timeout (RTO). Each time the timer fires without success, the wait doubles.",
      "There is a faster path too. When data arrives with a gap, the receiver keeps repeating the same ACK: \"I still need byte 5001\". After three such duplicate ACKs, the sender resends right away without waiting for the timer. With SACK (selective acknowledgement), the receiver also says exactly which later blocks it already has.",
      "Flow control is the other half. The receiver has a limited buffer, and every ACK carries a window: how many more bytes it can accept right now. If the receiving program reads slowly, the window shrinks, maybe to zero, and the sender pauses. This protects the receiver; protecting the network is congestion control, a separate topic.",
    ],
    deepDive: [
      {
        heading: "How the retransmission timer is calculated",
        body: "RFC 6298 describes the method. TCP keeps two numbers from RTT samples: SRTT, a smoothed average, and RTTVAR, how much the RTT jumps around. The timeout is about SRTT + 4 x RTTVAR, so a steady path gets a tight timer and a jumpy path gets a loose one. Before any sample exists, the RTO is 1 second.\n\nEach timeout doubles the RTO (exponential backoff), because repeated loss may mean the network is overloaded. Linux keeps the RTO between 200 ms and 120 seconds. On an established connection it gives up after net.ipv4.tcp_retries2 = 15 retries, roughly 15 minutes, and the program gets ETIMEDOUT.\n\nOne subtle rule (Karn's algorithm): an ACK for a resent segment is not used as an RTT sample, because you cannot tell which copy it answers. The timestamps option removes that doubt.",
        bullets: ["ss -ti shows rto:204 and rtt:3.2/1.1 (average/variation in ms)", "Initial RTO: 1 s; Linux minimum: 200 ms; maximum: 120 s", "tcp_retries2 = 15 means about 15 minutes before giving up"],
      },
      {
        heading: "Duplicate ACKs, fast retransmit and SACK",
        body: "TCP ACKs are cumulative: ack=5001 means every byte up to 5000 has arrived. When a segment arrives after a gap, the receiver sends an ACK straight away, repeating the same number. Three duplicate ACKs tell the sender that later data is getting through but one piece is missing, so it resends that piece at once (fast retransmit, RFC 5681).\n\nPlain cumulative ACKs only reveal the first hole. SACK (RFC 2018) adds blocks that list data received beyond the gap, up to 4 blocks, or 3 when timestamps also use option space. Then the sender resends only what is really missing.\n\nModern Linux also uses RACK-TLP (RFC 8985). It detects loss by time (a packet sent earlier than one that was delivered is probably lost) and sends a tail loss probe when the last packets of a burst vanish and no duplicate ACKs can arrive.",
        visual: {
          type: "sequence",
          title: "SACK tells the sender exactly what is missing",
          actors: ["Sender", "Receiver"],
          messages: [
            { from: 0, to: 1, label: "Bytes 1-1000" },
            { from: 0, to: 1, label: "Bytes 1001-2000 (lost)" },
            { from: 0, to: 1, label: "Bytes 2001-3000" },
            { from: 1, to: 0, label: "ACK 1001, SACK 2001-3001" },
            { from: 0, to: 1, label: "Bytes 3001-4000" },
            { from: 1, to: 0, label: "ACK 1001, SACK 2001-4001" },
            { from: 0, to: 1, label: "Resend only 1001-2000" },
            { from: 1, to: 0, label: "ACK 4001: all caught up" },
          ],
        },
      },
      {
        heading: "The sliding receive window",
        body: "The window field is 16 bits, so on its own it can say at most 65,535 bytes. The window scale option, agreed in the SYN packets, multiplies it by 2 to the power of a shift from 0 to 14, giving a maximum of about 1 GiB. The window is the free space in the receiver's buffer. The sender may have at most this many unacknowledged bytes in flight (and also no more than its congestion window).\n\nAs ACKs arrive, the left edge moves forward and the window slides along the byte stream. This sets a hard speed limit: throughput is at most window divided by RTT. A 64 KB window over a 100 ms path allows only about 5.2 Mbit/s, whatever the link speed. Linux grows receive buffers automatically within the min, default and max values of net.ipv4.tcp_rmem. If a broken middlebox strips window scaling, long-distance transfers become mysteriously slow.",
        visual: {
          type: "flow",
          title: "The sender's view of its byte stream",
          steps: [
            { label: "Sent and acknowledged", detail: "Done; buffer space can be freed" },
            { label: "Sent, not yet acknowledged", detail: "Kept for possible retransmission" },
            { label: "Allowed by the window", detail: "Can be sent right now" },
            { label: "Beyond the window", detail: "Must wait for ACKs or a window update" },
          ],
        },
      },
      {
        heading: "Zero windows and how they look in Wireshark",
        body: "If the receiving program stops reading, its buffer fills and the receiver advertises a window of 0. The sender stops sending data and starts a persist timer. When it fires, it sends a small zero window probe to ask whether space has opened up, backing off between probes. Without probes, a lost window update could freeze the connection forever. When the program reads again, the receiver sends a window update and data flows again.\n\nThe key lesson: a zero window means the receiving application is slow (a busy database, a blocked thread, a full disk), not that the network is broken. Wireshark marks each step for you. TCP Window Full means the sender has filled the advertised window. TCP ZeroWindow is the receiver saying stop. TCP ZeroWindowProbe and TCP Window Update show the pause ending.",
        bullets: ["tcp.analysis.window_full", "tcp.analysis.zero_window", "tcp.analysis.zero_window_probe", "tcp.analysis.window_update"],
      },
      {
        heading: "Delayed ACKs and Nagle's algorithm",
        body: "To save packets, receivers delay ACKs: they usually ACK every second full-size segment, or after a short timer when data stops (on Linux between 40 and 200 ms; the RFC limit is 500 ms). Senders use Nagle's algorithm: while sent data is still unacknowledged, small writes are held back and merged into one segment.\n\nEach idea is good alone, but together they can stall. A program that does write, write, read sends the first small piece, then Nagle holds the second while the receiver delays its ACK. The result is a pause of around 40 ms on every request. Setting the TCP_NODELAY socket option turns Nagle off, and most HTTP and RPC libraries already set it. Better still, build the whole message and send it in one write.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Timeout retransmission versus fast retransmit",
        columns: [
          { title: "Timeout (RTO)", points: ["Triggered when the timer expires", "Waits at least 200 ms on Linux", "Works even if all later packets were lost", "Congestion window drops to 1 segment"] },
          { title: "Fast retransmit", points: ["Triggered by 3 duplicate ACKs", "Reacts in about one RTT", "Needs later segments to get through", "Window is reduced, not reset"] },
        ],
      },
      {
        type: "cycle",
        title: "A zero-window stall and recovery",
        steps: [
          { label: "Receive buffer fills", detail: "App reads slower than data arrives" },
          { label: "Window 0 advertised", detail: "Receiver says: stop" },
          { label: "Sender pauses and probes", detail: "Persist timer sends zero window probes" },
          { label: "App reads data", detail: "Buffer space frees up" },
          { label: "Window update", detail: "Receiver announces new space" },
          { label: "Sending resumes", detail: "Until the buffer fills again" },
        ],
      },
    ],
    examples: [
      {
        title: "Checking a live connection for retransmissions",
        explanation: "Users say downloads from one server are slow. Step 1: look at the connection with ss -ti. rtt shows average and variation in ms, rto the current timeout, and retrans:0/12 means no segment is waiting for a resend now but 12 have been resent in total. mss:1448 is 1460 minus 12 bytes of timestamps. Step 2: check the host-wide counters with nstat; dividing TcpRetransSegs by TcpOutSegs gives a retransmission rate. A rate well above 1 percent points to loss on the path (bad Wi-Fi, a faulty cable, an overloaded link).",
        code: {
          lang: "bash",
          code: "ss -ti dst 203.0.113.7\n#  cubic wscale:7,7 rto:204 rtt:3.2/1.1 mss:1448 cwnd:10 retrans:0/12 ...\nnstat -az TcpRetransSegs TcpOutSegs\n# TcpOutSegs      812345\n# TcpRetransSegs    1630    -> about 0.2 percent",
        },
      },
      {
        title: "A slow reader causes a zero window",
        explanation: "This script accepts a connection but never reads from it. The client keeps sending until the server's receive buffer and the client's send buffer are both full, then a non-blocking send fails. While it sleeps, run ss -tn 'sport = :9100 or dport = :9100': the server socket shows a large Recv-Q (data the app has not read) and the client a large Send-Q (data not yet acknowledged). Run sudo tcpdump -i lo -nn port 9100 at the same time to see win 0 from the server and the client's probes.",
        code: {
          lang: "python",
          code: "import socket, time\nsrv = socket.create_server((\"127.0.0.1\", 9100))\ncli = socket.create_connection((\"127.0.0.1\", 9100))\nconn, _ = srv.accept()            # accepted, but we never read\ncli.setblocking(False)\nsent = 0\ntry:\n    while True:\n        sent += cli.send(b\"x\" * 65536)\nexcept BlockingIOError:\n    print(\"buffers full after\", sent, \"bytes\")\ntime.sleep(60)                    # inspect with ss and tcpdump now",
        },
      },
    ],
    cheatSheet: [
      "RTO starts at 1 s and doubles on each timeout; Linux keeps it between 200 ms and 120 s",
      "Three duplicate ACKs trigger fast retransmit without waiting for the RTO",
      "Window field is 16 bits (max 65,535); a window scale shift of up to 14 allows about 1 GiB",
      "Max throughput per connection is about window / RTT: 64 KB at 100 ms is about 5 Mbit/s",
      "ss -ti shows rto, rtt, mss, cwnd and retrans counters for each connection",
      "Wireshark: tcp.analysis.retransmission, tcp.analysis.zero_window, tcp.analysis.window_full",
      "A zero window means the receiving app reads too slowly; it is not a network fault",
      "TCP_NODELAY turns off Nagle's algorithm for small, latency-sensitive writes",
    ],
    quiz: [
      {
        q: "A receiver gets segments 1, 3, 4 and 5, but segment 2 was lost. What does it send as 3, 4 and 5 arrive?",
        options: ["A new, higher ACK for each segment", "Three duplicate ACKs, all asking for segment 2", "A RST", "Nothing until segment 2 arrives"],
        answer: 1,
        why: "Cumulative ACKs cannot move past the gap, so each out-of-order arrival repeats the same ACK.",
      },
      {
        q: "Wireshark shows TCP ZeroWindow from the receiver. What does that tell you?",
        options: ["Packets are being lost on the path", "The sender's congestion window is zero", "The connection is closing", "The receiving application is not reading data fast enough"],
        answer: 3,
        why: "The receive buffer is full because the program on that host has not read it yet.",
      },
      {
        q: "Without window scaling, what is the best possible throughput of one connection on a 200 ms RTT path?",
        options: ["About 2.6 Mbit/s", "About 26 Mbit/s", "About 260 Mbit/s", "It depends only on link speed"],
        answer: 0,
        why: "65,535 bytes x 8 / 0.2 s is about 2.6 Mbit/s, no matter how fast the link is.",
      },
      {
        q: "Why does TCP double the RTO after each timeout?",
        options: ["To measure the RTT more precisely", "To make the receive window bigger", "To back off when the network may be overloaded", "To match the TIME_WAIT rule"],
        answer: 2,
        why: "Repeated loss can mean congestion, and sending faster would make it worse.",
      },
      {
        q: "Which TCP option lets a receiver report blocks of data it got after a gap?",
        options: ["MSS", "Window scale", "Timestamps", "SACK"],
        answer: 3,
        why: "Selective acknowledgement lists received ranges so only the missing data is resent.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look at the RTT, RTO, MSS and retransmission counters of your current connections and explain each value.",
        hint: "ss -ti prints a second line of details under each connection.",
        solution: "ss -ti state established | head -20\n# rtt:24.1/3.2  average RTT and its variation in ms\n# rto:228       current retransmission timeout in ms\n# mss:1448      bytes of data per segment\n# retrans:0/3   now pending / total resent",
      },
      {
        level: "medium",
        task: "Add 5 percent packet loss on loopback with tc netem, download a 50 MB file from a local web server, and count how many segments were retransmitted. Remove the loss afterwards.",
        hint: "nstat -n resets the counter history so the next nstat shows only new events.",
        solution: "dd if=/dev/urandom of=big.bin bs=1M count=50\npython3 -m http.server 8000 &\nsudo tc qdisc add dev lo root netem loss 5%\nnstat -n\ncurl -s -o /dev/null -w '%{time_total}s\\n' localhost:8000/big.bin\nnstat TcpRetransSegs\nsudo tc qdisc del dev lo root",
      },
      {
        level: "hard",
        task: "Capture the zero-window example to a file and list the window-full, zero-window and zero-window-probe packets with tshark. Then change the script to read after 10 seconds and find the window update.",
        hint: "Display filters can be combined with ||, and conn.recv() in a loop drains the buffer.",
        solution: "sudo tcpdump -i lo -w zw.pcap 'tcp port 9100' &\npython3 zerowin.py      # the example, with conn.recv(1 << 20) in a loop after time.sleep(10)\nsudo pkill tcpdump\ntshark -r zw.pcap -Y 'tcp.analysis.window_full || tcp.analysis.zero_window || tcp.analysis.zero_window_probe'\ntshark -r zw.pcap -Y 'tcp.analysis.window_update' | head -3",
      },
    ],
    faq: [
      { q: "Does TCP guarantee my data was delivered?", a: "It guarantees that data arrives in order and intact, or that the connection fails with an error. A successful send() only means the kernel accepted the data, so applications that need proof of processing use their own replies." },
      { q: "Why do I see retransmissions on a healthy network?", a: "A few are normal: packets get dropped by busy queues, Wi-Fi interference, or timers that fire just before a slow ACK. Worry when the rate stays high, roughly above 1 percent, or when it rises together with slow responses." },
      { q: "What is TCP keepalive, and is it the same as HTTP keep-alive?", a: "TCP keepalive sends empty probes on an idle connection to detect a dead peer; on Linux it starts after 7200 seconds idle by default, then probes every 75 seconds, up to 9 times. HTTP keep-alive is different: it means reusing one TCP connection for several requests." },
      { q: "Why do my small messages arrive about 40 ms late?", a: "That is usually Nagle's algorithm on the sender waiting for an ACK that the receiver is delaying. Set TCP_NODELAY on the socket, or send each message in a single write." },
    ],
  },

  "net-transport/tcp-congestion": {
    plain: [
      "Flow control protects the receiver. But the path in between, full of routers with limited queues, can overflow too. If every sender went as fast as it could, queues would fill, packets would drop, everyone would resend, and the network would carry almost nothing useful. This really happened on the early internet in 1986 and is called congestion collapse.",
      "So each TCP sender keeps a private limit called the congestion window (cwnd). It is not in any header; it is the sender's own guess of how much data the network can hold. At any moment, the data in flight is limited by the smaller of cwnd and the receiver's window.",
      "TCP starts small and grows fast. In slow start, a new connection begins with about 10 segments and doubles each round trip. After a threshold, it grows by only about one segment per round trip. When it sees loss, it cuts back. It is like a driver slowly pushing the speed up until feeling the bumps.",
      "There are several recipes for this. Reno is the classic. CUBIC is the default on Linux and on modern Windows. BBR, from Google, measures the path's bandwidth and delay instead of waiting for loss. The choice matters most on long, fast or lossy links.",
    ],
    deepDive: [
      {
        heading: "cwnd, ssthresh and the initial window",
        body: "The sender tracks two values. cwnd is the current congestion window. ssthresh (slow-start threshold) marks where fast growth stops; it starts very large and is set the first time loss happens.\n\nA new connection starts with an initial window of 10 segments (RFC 6928), about 14 KB with a 1460-byte MSS. That is why web performance guides say the first 14 KB of a page matter: it is all the server can send in the first round trip. In slow start, cwnd grows by one segment for each ACK, which doubles it every RTT. Above ssthresh, in congestion avoidance, it grows by about one segment per RTT.\n\nLinux also falls back to a small window after a connection has been idle (net.ipv4.tcp_slow_start_after_idle = 1 by default). Long-lived connections that send in bursts, such as HTTP/2 or database links, often set this to 0.",
        bullets: ["Initial window: 10 segments (about 14 KB)", "Slow start: cwnd doubles per RTT", "Congestion avoidance: about +1 segment per RTT", "ip route change default via GW initcwnd 20 sets it per route"],
      },
      {
        heading: "Reacting to loss: fast recovery versus timeout",
        body: "RFC 5681 describes the classic Reno behaviour. After three duplicate ACKs, the sender knows one packet was lost but later ones are still arriving, so the network is busy but working. It sets ssthresh to half the data in flight (at least 2 segments), resends the missing segment, and continues in congestion avoidance from about that halved value. This is fast recovery.\n\nA retransmission timeout is much worse news: nothing is getting through. The sender sets ssthresh to half, drops cwnd to 1 segment, and starts slow start again. One timeout can cost many round trips of speed.\n\nThis pattern, adding a little per RTT and halving on loss, is called AIMD (additive increase, multiplicative decrease). It draws a sawtooth line over time and lets competing flows settle on a fair share. Linux smooths the cut with proportional rate reduction (PRR, RFC 6937).",
        visual: {
          type: "flow",
          title: "A Reno connection, cwnd in segments",
          steps: [
            { label: "Slow start", detail: "10, 20, 40, 80 over four RTTs" },
            { label: "3 duplicate ACKs at 80", detail: "ssthresh = 40, cwnd = 40" },
            { label: "Congestion avoidance", detail: "41, 42, 43 ... one per RTT" },
            { label: "Timeout at 60", detail: "ssthresh = 30, cwnd = 1" },
            { label: "Slow start again", detail: "1, 2, 4, 8, 16, 30, then +1 per RTT" },
          ],
        },
      },
      {
        heading: "CUBIC: the Linux default",
        body: "Reno's growth of one segment per RTT is far too slow for fast, long links. After a loss on a 10 Gbit/s path with 100 ms RTT, it would need well over an hour to grow back. CUBIC (RFC 9438) fixes this.\n\nAfter a loss, CUBIC cuts cwnd to 70 percent instead of 50 percent. It then grows along a cubic curve based on the time since the last loss, not on the number of ACKs. The curve rises quickly at first, flattens out near the window where the last loss happened (W_max), and then speeds up again to probe for more bandwidth. Because growth depends on time, flows with short and long RTTs share a link more fairly than with Reno. Linux CUBIC also uses HyStart, which leaves slow start early when RTT starts rising, to avoid a large burst of loss.\n\nCUBIC is still loss-based: it keeps filling router queues until packets drop.",
      },
      {
        heading: "BBR: model the path instead of waiting for loss",
        body: "BBR (Bottleneck Bandwidth and Round-trip propagation time) was published by Google in 2016 and added to Linux 4.9. It keeps two estimates: the highest delivery rate recently seen (the bottleneck bandwidth) and the lowest RTT recently seen (the delay with empty queues). It aims to keep about one bandwidth-delay product in flight and paces packets out at the estimated bandwidth, rather than sending in bursts.\n\nIt regularly probes for more bandwidth, and about every 10 seconds it briefly drains the queue to re-measure the minimum RTT. Because random loss does not directly cut its rate, BBR keeps high throughput on lossy links and usually builds smaller queues. The first version could take more than its fair share from CUBIC flows and cause many retransmissions in shallow buffers; later versions (BBRv2 and BBRv3) react to loss and ECN marks to fix this.\n\nOnly the sender's algorithm matters: for a download, that is the server.",
        bullets: ["Enable: net.ipv4.tcp_congestion_control = bbr", "Pair with net.core.default_qdisc = fq for pacing", "Check: ss -ti shows bbr and pacing_rate"],
      },
      {
        heading: "Bandwidth-delay product, ECN and tuning",
        body: "The bandwidth-delay product (BDP) is how much data must be in flight to keep a link full: bandwidth times RTT. A 1 Gbit/s path with 80 ms RTT needs 10 MB in flight. If cwnd, the receive window or the socket buffers (the third value of net.ipv4.tcp_rmem and tcp_wmem) are smaller than that, one connection cannot fill the link no matter how fast it is.\n\nLoss is a crude signal. With ECN (Explicit Congestion Notification), a router whose queue is growing marks packets instead of dropping them; the receiver echoes the mark with the ECE flag and the sender answers with CWR after slowing down. Linux sets net.ipv4.tcp_ecn = 2 by default: it accepts ECN when the other side asks for it but does not request it itself.\n\nA related problem is bufferbloat: very large queues in home routers make loss-based algorithms fill them, and latency jumps by hundreds of milliseconds under load.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Reno, CUBIC and BBR",
        columns: [
          { title: "Reno", points: ["Loss-based", "+1 segment per RTT", "Halves cwnd on loss", "Slow to fill fast, long links"] },
          { title: "CUBIC", points: ["Loss-based, Linux default", "Growth follows time since last loss", "Cuts cwnd to 70 percent", "Fills queues until they drop"] },
          { title: "BBR", points: ["Model-based", "Measures bandwidth and minimum RTT", "Paces packets at the estimated rate", "Tolerates random loss, smaller queues"] },
        ],
      },
      {
        type: "tree",
        title: "Signals a sender uses to detect congestion",
        root: "Congestion signals",
        children: [
          { label: "Loss", children: ["Three duplicate ACKs", "SACK holes and RACK timing", "Retransmission timeout"] },
          { label: "Delay", children: ["RTT rising above its minimum", "Used by HyStart and BBR"] },
          { label: "Explicit marks", children: ["Router sets ECN CE bit", "Receiver echoes with ECE", "Sender replies with CWR"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why one download crawls across the ocean",
        explanation: "A server in Europe sends backups to a site with a 150 ms RTT over a 100 Mbit/s link, but gets only about 10 Mbit/s. Step 1: compute the BDP: 100 Mbit/s x 0.15 s = 15 Mbit, about 1.9 MB that must be in flight. Step 2: check the live connection with ss -ti: a cwnd of about 85 segments x 1448 bytes is only 123 KB. Step 3: work out why. With 0.01 percent loss, a Reno-style flow on a 150 ms path averages roughly 9.5 Mbit/s (the Mathis formula: MSS / RTT x 1.22 / square root of the loss rate). Step 4: test a different algorithm with iperf3, which can pick one per test with -C.",
        code: {
          lang: "bash",
          code: "# BDP = 100 Mbit/s x 0.150 s = 15 Mbit = about 1.9 MB in flight\nss -ti dst 198.51.100.20 | grep -oE 'cwnd:[0-9]+|rtt:[0-9.]+|delivery_rate [^ ]+'\nsudo iperf3 -c 198.51.100.20 -t 20 -C cubic\nsudo iperf3 -c 198.51.100.20 -t 20 -C bbr",
        },
      },
      {
        title: "Switching a server to BBR and checking it",
        explanation: "Step 1: make sure the tcp_bbr module is available. Step 2: write a sysctl file that sets fq as the default queueing discipline (for pacing) and bbr as the algorithm, then load it. Step 3: only new connections use the new algorithm, so open a fresh one and check that ss -ti prints bbr. Step 4: measure before and after with your real traffic; BBR helps most on long or lossy paths and may change little on a clean LAN.",
        code: {
          lang: "bash",
          code: "sudo modprobe tcp_bbr\nsysctl net.ipv4.tcp_available_congestion_control\nprintf 'net.core.default_qdisc = fq\\nnet.ipv4.tcp_congestion_control = bbr\\n' | sudo tee /etc/sysctl.d/90-bbr.conf\nsudo sysctl --system\nss -ti state established | grep -c bbr",
        },
      },
    ],
    cheatSheet: [
      "Bytes in flight are limited by the smaller of cwnd and the receive window",
      "Initial window is 10 segments (RFC 6928), about 14 KB with a 1460-byte MSS",
      "Slow start doubles cwnd each RTT; congestion avoidance adds about 1 segment per RTT",
      "Reno halves cwnd on loss, CUBIC cuts it to 70 percent, a timeout drops it to 1 segment",
      "BDP = bandwidth x RTT: 1 Gbit/s at 80 ms needs 10 MB in flight",
      "sysctl net.ipv4.tcp_congestion_control shows the default algorithm (usually cubic)",
      "Enable BBR: net.core.default_qdisc = fq and net.ipv4.tcp_congestion_control = bbr",
      "ss -ti shows the algorithm, cwnd, ssthresh, rtt, pacing_rate and delivery_rate",
    ],
    quiz: [
      {
        q: "cwnd is 40 segments and the receiver's window is 25 segments. How many segments can be in flight?",
        options: ["40", "65", "25", "15"],
        answer: 2,
        why: "The sender is limited by the smaller of the congestion window and the receive window.",
      },
      {
        q: "What does Reno do after three duplicate ACKs?",
        options: ["Halves its window and continues in congestion avoidance", "Sets cwnd to 1 and restarts slow start", "Closes the connection", "Doubles cwnd"],
        answer: 0,
        why: "Duplicate ACKs show data is still flowing, so a halving is enough; only a timeout resets cwnd to 1.",
      },
      {
        q: "Why can BBR keep high throughput on a link with 1 percent random loss when CUBIC slows down?",
        options: ["BBR ignores ACKs", "BBR runs over UDP", "BBR turns off retransmission", "BBR sets its rate from measured bandwidth and RTT, not from each loss"],
        answer: 3,
        why: "CUBIC cuts cwnd on every loss, while BBR's model only changes when the measured delivery rate does.",
      },
      {
        q: "A path has 200 Mbit/s of bandwidth and a 40 ms RTT. What is its bandwidth-delay product?",
        options: ["100 KB", "1 MB", "8 MB", "40 MB"],
        answer: 1,
        why: "200,000,000 bits/s x 0.04 s = 8,000,000 bits, which is 1,000,000 bytes.",
      },
      {
        q: "You download a large file from a server. Whose congestion control algorithm decides how fast it arrives?",
        options: ["The client's", "The routers'", "The server's, because it sends the data", "Both sides must use the same one"],
        answer: 2,
        why: "Congestion control runs on the sender, and the two sides can use different algorithms.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find which congestion control algorithm your machine uses, which ones are available, and the cwnd of one live connection.",
        hint: "Two sysctl keys and one ss command.",
        solution: "sysctl net.ipv4.tcp_congestion_control\nsysctl net.ipv4.tcp_available_congestion_control\nss -ti state established | grep -oE '(cubic|bbr|reno)|cwnd:[0-9]+' | head",
      },
      {
        level: "medium",
        task: "Watch slow start happen: add 50 ms of delay on loopback, start a download from a local server and print the server's cwnd several times during the first second.",
        hint: "netem on lo delays both data and ACKs, so the RTT becomes about 100 ms.",
        solution: "dd if=/dev/urandom of=big.bin bs=1M count=200\npython3 -m http.server 8000 &\nsudo tc qdisc add dev lo root netem delay 50ms\ncurl -s -o /dev/null localhost:8000/big.bin &\nfor i in 1 2 3 4 5 6 7 8; do ss -ti 'sport = :8000' | grep -oE 'cwnd:[0-9]+'; sleep 0.1; done\nsudo tc qdisc del dev lo root\n# cwnd climbs 10, 20, 40, 80... about once per 100 ms",
      },
      {
        level: "hard",
        task: "Compare CUBIC and BBR on loopback with 50 ms RTT and 1 percent loss using iperf3, and explain the difference.",
        hint: "Setting bbr per socket needs root unless it is in tcp_allowed_congestion_control.",
        solution: "sudo modprobe tcp_bbr\nsudo tc qdisc add dev lo root netem delay 25ms loss 1%\niperf3 -s -D\nsudo iperf3 -c 127.0.0.1 -t 15 -C cubic | tail -3\nsudo iperf3 -c 127.0.0.1 -t 15 -C bbr | tail -3\nsudo tc qdisc del dev lo root\n# BBR is usually many times faster: CUBIC cuts cwnd on every loss,\n# BBR keeps sending at its measured bandwidth.",
      },
    ],
    faq: [
      { q: "Is BBR always better than CUBIC?", a: "No. BBR usually wins on long or lossy paths, but on clean, short links the difference is small, and older BBR versions can be unfair to CUBIC flows sharing a bottleneck. Measure with your own traffic before switching." },
      { q: "Does UDP have congestion control?", a: "Not by itself. Applications on UDP must add it; QUIC, for example, runs its own congestion control, typically CUBIC or BBR, in user space." },
      { q: "What is bufferbloat?", a: "It is the large delay caused by oversized queues in routers and modems. Loss-based algorithms fill these queues before any packet drops, so latency jumps under load; smart queue management (such as fq_codel or CAKE) and BBR reduce it." },
      { q: "Why do people say the first 14 KB of a web page matter?", a: "A new TCP connection may send only about 10 segments, roughly 14 KB, before waiting for the first ACKs. Content in that first window reaches the browser one round trip earlier." },
    ],
  },

  "net-transport/udp-quic": {
    plain: [
      "UDP works like sending a postcard. You write the address and drop it in the box. There is no handshake, no confirmation and no promise about order. Each send becomes one datagram, a single message that arrives whole or not at all.",
      "The UDP header is tiny: 8 bytes with four fields. Because UDP adds almost nothing, the application decides everything: when to send, what to resend and what to skip. That is perfect when late data is useless, as in a voice call or a game, or when a whole request fits in one packet, as in a DNS lookup.",
      "Building reliability yourself is hard, and QUIC is a protocol that does it well. QUIC runs on top of UDP and adds connections, encryption, reliable delivery and congestion control. HTTP/3 runs on QUIC. Why UDP? Firewalls and home routers mostly pass only TCP and UDP, and operating system kernels change slowly, so a new protocol is easiest to ship inside UDP.",
      "QUIC brings real wins. A new connection with encryption is ready after one round trip, and a returning client can send data immediately. Many independent streams share one connection, and a lost packet delays only its own stream. A connection can even survive a switch from Wi-Fi to mobile data.",
    ],
    deepDive: [
      {
        heading: "The UDP header and the limits of a datagram",
        body: "The UDP header has four 16-bit fields. The source port is optional and may be 0 when no reply is expected. The destination port picks the receiving socket. Length covers header plus data, so it is at least 8. The checksum covers a pseudo-header (the source and destination IP addresses), the UDP header and the data. In IPv4 the checksum may be 0, meaning \"not computed\"; in IPv6 it is required.\n\nOver IPv4 a single datagram can carry at most 65,507 bytes (65,535 minus 20 bytes of IP header and 8 of UDP). Anything larger than the path MTU is split into IP fragments, and losing any one fragment loses the whole datagram. So real protocols keep datagrams small; QUIC and DNS aim for around 1,200 to 1,400 bytes.\n\nWhen a socket's receive buffer is full, the kernel silently drops new datagrams and counts them in UdpRcvbufErrors.",
        visual: {
          type: "layers",
          title: "UDP header, 32 bits per row",
          layers: [
            { label: "Source port (16) | Destination port (16)", detail: "Source may be 0 if no reply is needed" },
            { label: "Length (16) | Checksum (16)", detail: "Length includes the 8-byte header" },
            { label: "Data (length minus 8 bytes)", detail: "One whole application message" },
          ],
        },
      },
      {
        heading: "Workloads that suit UDP",
        body: "UDP fits four patterns. First, a small request with a small answer, where a handshake would double the time: DNS on port 53, NTP on 123, DHCP on 67 and 68. Classic DNS replies were limited to 512 bytes; EDNS allows larger ones, and when an answer still does not fit, the server sets the TC (truncated) bit and the client retries over TCP. Second, real-time media where a resent packet would arrive too late to use: voice and video calls (RTP, WebRTC) and online games. Third, broadcast and multicast, which TCP cannot do at all. Fourth, protocols that bring their own reliability or tunnel other traffic: QUIC, WireGuard (commonly on 51820) and OpenVPN (1194 by default).\n\nUDP has costs too. NAT routers forget idle UDP mappings quickly, often in 30 seconds to a few minutes, so apps send keepalives. And applications must add their own congestion control so they do not flood the network (RFC 8085).",
        bullets: ["Request and response: DNS 53, NTP 123, DHCP 67/68, SNMP 161", "Real-time: RTP voice and video, games", "Broadcast and multicast", "Own reliability: QUIC on 443, WireGuard, OpenVPN"],
      },
      {
        heading: "How QUIC builds a reliable transport on UDP",
        body: "QUIC is defined in RFC 9000 (transport), RFC 9001 (how it uses TLS 1.3) and RFC 9002 (loss detection and congestion control). Data travels in frames, such as STREAM frames for application data, ACK frames and CRYPTO frames for the TLS handshake, packed into encrypted packets.\n\nEvery packet gets a new packet number that is never reused. Lost data is resent in a new packet with a new number, so an ACK always shows exactly which packet arrived, and RTT samples are never ambiguous as they can be in TCP. ACK frames list many ranges, like a SACK without the 4-block limit. Congestion control works like TCP's; implementations use CUBIC or BBR.\n\nAlmost all of each packet is encrypted, including most header fields, so middleboxes cannot meddle with it. To stop QUIC being used for amplification attacks, the client's first datagram is padded to at least 1,200 bytes, and a server sends at most 3 times what it received until the client's address is validated.",
      },
      {
        heading: "Streams, 0-RTT and connection migration",
        body: "A QUIC connection carries many streams, each an ordered byte stream of its own with its own flow control. The two lowest bits of a stream ID say who opened it and whether it is two-way or one-way. In HTTP/3, each request uses a new client-opened two-way stream.\n\nQUIC carries the TLS 1.3 handshake inside its own, so encryption and transport are ready after one round trip; TCP plus TLS 1.3 needs two. A client that has talked to the server before can use a session ticket to send its request in the very first flight (0-RTT). 0-RTT data can be replayed by an attacker who copies it, so it should only carry safe, repeatable requests such as a GET, and servers may refuse it.\n\nQUIC connections are identified by connection IDs, not by the 5-tuple. When a phone moves from Wi-Fi to mobile data and its IP changes, the connection continues after a quick path check.",
        visual: {
          type: "sequence",
          title: "A new QUIC connection with HTTP/3",
          actors: ["Client", "Server"],
          messages: [
            { from: 0, to: 1, label: "Initial: TLS ClientHello, padded to 1,200 bytes" },
            { from: 1, to: 0, label: "Initial: TLS ServerHello" },
            { from: 1, to: 0, label: "Handshake: certificate and Finished" },
            { from: 0, to: 1, label: "Handshake Finished + 1-RTT: HTTP/3 request" },
            { from: 1, to: 0, label: "1-RTT: HTTP/3 response" },
          ],
        },
      },
      {
        heading: "Head-of-line blocking: TCP versus QUIC",
        body: "Head-of-line blocking means one missing piece holds up everything queued behind it. HTTP/2 sends many requests as streams over one TCP connection. But TCP only knows a single byte stream. If one packet carrying part of stream A is lost, the receiving kernel cannot hand the browser any later bytes, even ones that belong to streams B and C, until the retransmission arrives. One loss stalls every stream.\n\nQUIC knows about streams, so it keeps each one in order separately. A lost packet with stream A data delays only stream A; data for B and C is delivered at once. Order still matters inside a single stream, and HTTP/3 uses QPACK header compression, designed so headers do not create new blocking between streams.\n\nOn a clean wired network the difference is small. On lossy mobile and Wi-Fi links, where loss is common, it is clearly visible in page load times.",
        visual: {
          type: "compare",
          title: "One lost packet carrying stream A",
          columns: [
            { title: "HTTP/2 over TCP", points: ["Kernel holds all bytes after the gap", "Streams B and C wait too", "Everything resumes after the retransmit"] },
            { title: "HTTP/3 over QUIC", points: ["Only stream A waits", "Streams B and C are delivered at once", "Stream A resumes after the retransmit"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "HTTP/2 and HTTP/3 protocol stacks",
        columns: [
          { title: "HTTP/2", points: ["HTTP/2 with HPACK headers", "TLS 1.3 on top of the byte stream", "TCP, inside the kernel", "IP"] },
          { title: "HTTP/3", points: ["HTTP/3 with QPACK headers", "QUIC with TLS 1.3 built in, in user space", "UDP, usually port 443", "IP"] },
        ],
      },
      {
        type: "tree",
        title: "QUIC stream types (lowest 2 bits of the stream ID)",
        root: "Stream ID",
        children: [
          { label: "0x0: client-opened, two-way", children: ["IDs 0, 4, 8 ...", "One HTTP/3 request each"] },
          { label: "0x1: server-opened, two-way", children: ["IDs 1, 5, 9 ...", "Not used by HTTP/3"] },
          { label: "0x2: client-opened, one-way", children: ["IDs 2, 6, 10 ...", "HTTP/3 control and QPACK streams"] },
          { label: "0x3: server-opened, one-way", children: ["IDs 3, 7, 11 ...", "Control, QPACK and push streams"] },
        ],
      },
    ],
    examples: [
      {
        title: "UDP in Python: messages, not a stream",
        explanation: "This script runs a UDP server and client in one process. Each sendto() becomes exactly one datagram, and each recvfrom() returns exactly one whole message, never half of one or two glued together as can happen with TCP reads. There is no connection: the server replies to whatever address the datagram came from. If a reply never comes, nothing resends it; the client's timeout fires and the application itself must decide to retry. Run sudo tcpdump -i lo -nn udp port 9200 alongside to see one packet per message, each with length set.",
        code: {
          lang: "python",
          code: "import socket\nsrv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nsrv.bind((\"127.0.0.1\", 9200))\ncli = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\ncli.settimeout(1.0)\nfor msg in [b\"one\", b\"two\", b\"three\"]:\n    cli.sendto(msg, (\"127.0.0.1\", 9200))\n    data, addr = srv.recvfrom(2048)      # one datagram = one message\n    srv.sendto(data.upper(), addr)\n    try:\n        print(cli.recvfrom(2048)[0])\n    except socket.timeout:\n        print(\"lost: the app must retry\")  # UDP never resends",
        },
      },
      {
        title: "Is this site using HTTP/3?",
        explanation: "Browsers do not try QUIC blindly. Step 1: a server announces HTTP/3 in an Alt-Svc response header (h3 on UDP port 443, remembered for ma seconds) or in an HTTPS record in DNS. Step 2: ask curl for HTTP/3 and print the version it used; this needs a curl built with HTTP/3 support. Step 3: watch UDP 443 with tcpdump to see the QUIC packets. If a firewall blocks UDP 443, browsers quietly fall back to HTTP/2 over TCP, so a site can look fine while never using HTTP/3.",
        code: {
          lang: "bash",
          code: "curl -sI https://cloudflare.com | grep -i alt-svc\n# alt-svc: h3=\":443\"; ma=86400\ndig +short HTTPS cloudflare.com\ncurl --http3 -s -o /dev/null -w '%{http_version}\\n' https://cloudflare.com\n# 3\nsudo tcpdump -i any -nn -c 5 'udp port 443'",
        },
      },
    ],
    cheatSheet: [
      "UDP header: 8 bytes = source port, destination port, length, checksum (16 bits each)",
      "Max UDP payload over IPv4 is 65,507 bytes; stay under the path MTU to avoid fragmentation",
      "UDP checksum is optional in IPv4 (0 means none) and required in IPv6",
      "QUIC: RFC 9000 transport, RFC 9001 TLS, RFC 9002 recovery; HTTP/3 is RFC 9114",
      "New connection: QUIC needs 1 RTT, TCP plus TLS 1.3 needs 2; QUIC resumption can use 0-RTT",
      "A client's first QUIC datagram is padded to at least 1,200 bytes",
      "ss -ulnp lists UDP listeners; nstat -az UdpRcvbufErrors counts drops from full buffers",
      "Servers advertise HTTP/3 with Alt-Svc: h3=\":443\" or with an HTTPS DNS record",
    ],
    quiz: [
      {
        q: "How big is the UDP header?",
        options: ["8 bytes", "20 bytes", "12 bytes", "4 bytes"],
        answer: 0,
        why: "Four 16-bit fields: source port, destination port, length and checksum.",
      },
      {
        q: "Why is QUIC built on UDP instead of being a brand-new IP protocol?",
        options: ["UDP is already encrypted", "UDP already resends lost packets", "Firewalls and NAT mostly pass only TCP and UDP, and user-space code can be updated quickly", "QUIC needs broadcast"],
        answer: 2,
        why: "A new IP protocol would be blocked by middleboxes and would wait years for kernel support.",
      },
      {
        q: "An HTTP/3 page loads three images and one packet for image A is lost. What happens?",
        options: ["All three images wait for the retransmit", "The connection is reset", "Image A is skipped", "Only image A's stream waits for the retransmit"],
        answer: 3,
        why: "QUIC orders each stream separately, so other streams are not held behind the gap.",
      },
      {
        q: "Why should 0-RTT data only carry safe requests like GET?",
        options: ["It is sent unencrypted", "An attacker can capture and replay it", "It cannot carry headers", "It is limited to 100 bytes"],
        answer: 1,
        why: "0-RTT data is encrypted but can be replayed, so repeating it must do no harm.",
      },
      {
        q: "Which job is a poor fit for plain UDP without extra work?",
        options: ["A DNS lookup", "A voice call", "Copying a large file that must arrive complete and in order", "A multiplayer game update"],
        answer: 2,
        why: "A file transfer needs every byte in order, which TCP or QUIC already provide.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the UDP sockets listening on your machine, then capture one DNS query and its answer and note the ports and lengths.",
        hint: "ss -ulnp, then tcpdump on port 53 while running dig.",
        solution: "sudo ss -ulnp\nsudo tcpdump -i any -nn -c 2 'udp port 53' &\ndig example.com +short\n# 192.0.2.10.40123 > 192.0.2.53.53: ... A? example.com. (29)\n# random source port on the client, port 53 on the server",
      },
      {
        level: "medium",
        task: "Show that UDP silently drops datagrams when the receiver does not read fast enough: send 100,000 datagrams to a socket that reads nothing until the end, then count what arrived and check the kernel counter.",
        hint: "sendto() succeeds even when the receiver's buffer is full; the drop happens at the receiver.",
        solution: "python3 - <<'EOF'\nimport socket\nr = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); r.bind((\"127.0.0.1\", 9300))\ns = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nfor i in range(100000): s.sendto(b\"x\" * 1000, (\"127.0.0.1\", 9300))\nr.setblocking(False); got = 0\ntry:\n    while True: r.recv(2048); got += 1\nexcept BlockingIOError: print(\"received\", got, \"of 100000\")\nEOF\nnstat -az UdpRcvbufErrors",
      },
      {
        level: "hard",
        task: "Write a client function that makes a UDP request reliable: number each request, retry on timeout with a doubling wait, and ignore replies that carry the wrong number. Assume the server echoes the message back.",
        hint: "Put the number in front of the payload, like 7:hello, and compare it on the reply.",
        solution: "import socket\ns = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\ndef request(seq, payload, server=(\"127.0.0.1\", 9400), tries=5):\n    msg = f\"{seq}:{payload}\".encode(); s.settimeout(0.5)\n    for attempt in range(tries):\n        s.sendto(msg, server)\n        try:\n            data, _ = s.recvfrom(2048)\n            if data.split(b\":\", 1)[0] == str(seq).encode(): return data\n        except socket.timeout:\n            s.settimeout(min(s.gettimeout() * 2, 4.0))   # back off like TCP's RTO\n    raise TimeoutError(\"no reply after retries\")",
      },
    ],
    faq: [
      { q: "Is UDP faster than TCP?", a: "UDP skips the handshake and never waits for retransmissions, so it can have lower latency. Raw throughput is not automatically higher, and once you add reliability and congestion control you are doing the same work TCP does." },
      { q: "Is QUIC only used for HTTP/3?", a: "No. QUIC is a general transport. DNS over QUIC (RFC 9250), SMB over QUIC and MASQUE tunnelling also use it, though HTTP/3 is by far the most common use." },
      { q: "What happens if a network blocks UDP port 443?", a: "Browsers notice that QUIC fails and fall back to HTTP/2 over TCP, usually without the user seeing an error. Pages still load, just without the benefits of QUIC." },
      { q: "Does connect() on a UDP socket create a connection?", a: "Not on the wire: no packets are sent. It only sets a default destination, so you can use send() instead of sendto(), and makes the socket ignore datagrams from other addresses and report ICMP errors such as port unreachable." },
    ],
  },
};

export default extra;
