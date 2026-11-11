import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-networking/socket-basics": {
    plain: [
      "A socket is a phone line for programs. On Linux it is just a file descriptor, a small number like 3 or 4, so you use it with read, write and close like a file. The difference is that the other end is another program, often on another computer.",
      "To reach a program you need two things: an IP address (which computer) and a port (which program on that computer). Port 443 is usually HTTPS, port 22 is SSH. The pair of address and port is one endpoint.",
      "Computers store numbers in different byte orders. Most PCs and phones put the smallest byte first, but network protocols put the biggest byte first. So before you put a port number into an address struct, you convert it with htons, which means host to network short.",
      "Names like example.com must be turned into addresses first. The function getaddrinfo does that for you, and it returns both IPv4 and IPv6 addresses in ready-to-use structs, so the same code works on both kinds of network.",
    ],
    deepDive: [
      {
        heading: "socket(), bind(), listen(), accept(): what each one does",
        body: "socket(domain, type, protocol) creates an endpoint and returns a descriptor. The domain picks the address family: AF_INET for IPv4, AF_INET6 for IPv6, AF_UNIX for local sockets. The type picks the behaviour: SOCK_STREAM for a reliable byte stream (TCP), SOCK_DGRAM for datagrams (UDP). Protocol 0 means the default for that pair. You can add SOCK_CLOEXEC or SOCK_NONBLOCK to the type to set those flags in one call.\n\nA server then calls bind to attach the socket to a local address and port, and listen to turn it into a passive socket. listen creates a queue of finished connections waiting for the program; its size is the backlog, capped by net.core.somaxconn (4096 on kernels since 5.4). accept takes the next connection from that queue and returns a brand new descriptor for it. A client skips bind and listen and calls connect; the kernel picks a free local port for it automatically.",
        visual: {
          type: "tree",
          title: "socket(domain, type, protocol)",
          root: "socket()",
          children: [
            { label: "domain", children: ["AF_INET: IPv4", "AF_INET6: IPv6", "AF_UNIX: same machine"] },
            { label: "type", children: ["SOCK_STREAM: TCP byte stream", "SOCK_DGRAM: UDP datagrams", "| SOCK_NONBLOCK, | SOCK_CLOEXEC"] },
            { label: "protocol", children: ["0: default for domain and type"] },
            { label: "returns", children: ["A file descriptor, or -1 and errno"] },
          ],
        },
      },
      {
        heading: "Address structs and why everything is cast",
        body: "The socket functions were designed to work with any address family, so they take a pointer to a generic struct sockaddr plus a length. Real addresses live in family-specific structs. sockaddr_in holds an IPv4 address: sin_family, sin_port and sin_addr. sockaddr_in6 holds an IPv6 address: sin6_family, sin6_port, sin6_addr and a few more fields. You fill the specific one and cast its address to struct sockaddr * when calling bind, connect or sendto.\n\nWhen you receive an address, for example from accept or recvfrom, you often do not know the family in advance. Use struct sockaddr_storage, which is large enough and aligned for any family, then check ss_family. Always pass the length in a socklen_t variable; accept and recvfrom update it to the real size.\n\nTo convert between text and binary addresses, use inet_pton (text to binary) and inet_ntop (binary to text). INET_ADDRSTRLEN (16) and INET6_ADDRSTRLEN (46) are the buffer sizes for the text forms.",
        bullets: ["sockaddr_storage fits IPv4, IPv6 and Unix addresses", "inet_pton(AF_INET6, \"::1\", &a.sin6_addr) returns 1 on success", "inet_ntoa and gethostbyname are old IPv4-only APIs; avoid them"],
      },
      {
        heading: "Byte order with htons and friends",
        body: "x86-64 and almost all ARM systems are little-endian: the lowest byte of a number is stored first. Network protocols use big-endian, called network byte order. The port and address fields inside sockaddr_in and sockaddr_in6 must be in network order, because the kernel copies them into packet headers as they are.\n\nhtons converts a 16-bit value (ports) from host to network order, and htonl a 32-bit value (IPv4 addresses such as INADDR_ANY). ntohs and ntohl convert back when you read a port or address out of a struct. On a big-endian machine they do nothing, so always calling them keeps the code portable.\n\nForgetting htons is a classic bug. Port 8080 is 0x1F90. On a little-endian machine without htons, the bytes go out reversed as 0x901F, and your server ends up listening on port 36895 instead. The same rule applies to your own binary protocols: pick big-endian for integers on the wire and convert on both sides.",
        visual: {
          type: "compare",
          title: "Port 8080 (0x1F90) in memory",
          columns: [
            { title: "Host order on x86-64", points: ["Little-endian", "Bytes stored as 90 1F", "Fine for arithmetic", "Wrong inside sockaddr_in"] },
            { title: "Network order", points: ["Big-endian", "Bytes stored as 1F 90", "What htons(8080) produces", "What sin_port must hold"] },
          ],
        },
      },
      {
        heading: "getaddrinfo in depth",
        body: "getaddrinfo(node, service, &hints, &res) turns a host name and a service (a port number or a name like \"https\") into a linked list of struct addrinfo, each holding a ready-made address plus the family, socket type and protocol to pass straight to socket. hints says what you want: ai_family AF_UNSPEC for both IPv4 and IPv6, ai_socktype SOCK_STREAM or SOCK_DGRAM, and flags.\n\nUseful flags: AI_PASSIVE with node NULL gives the wildcard address for a server to bind. AI_NUMERICHOST refuses DNS and only parses a literal address. AI_ADDRCONFIG returns IPv6 results only if the machine has an IPv6 address configured, and the same for IPv4.\n\nErrors are not reported in errno. getaddrinfo returns an EAI_ code; print it with gai_strerror (only EAI_SYSTEM means look at errno). Free the list with freeaddrinfo. Remember that it may block for seconds while DNS answers, so never call it inside an event loop thread. getnameinfo does the reverse: address to text.",
        bullets: ["Server: hints.ai_flags = AI_PASSIVE; getaddrinfo(NULL, \"8080\", ...)", "Client: AF_UNSPEC and try each result in order", "Order of results follows RFC 6724, tunable in /etc/gai.conf"],
      },
      {
        heading: "Serving IPv4 and IPv6 from one socket",
        body: "A server can listen on both protocols in two ways. The simple way is one dual-stack socket: create an AF_INET6 socket, set the IPV6_V6ONLY option to 0, and bind to :: (any IPv6 address). It then also accepts IPv4 clients, which show up as IPv4-mapped addresses like ::ffff:192.0.2.10. On Linux the default comes from net.ipv6.bindv6only, which is 0 on most systems, but setting the option explicitly makes the code independent of that setting.\n\nThe other way is two sockets: one AF_INET bound to 0.0.0.0 and one AF_INET6 bound to :: with IPV6_V6ONLY set to 1, both watched with poll or epoll. This is what you need if the two should behave differently, and on systems where IPv6 is disabled the IPv6 socket simply fails while IPv4 keeps working.\n\nOn the client side, try every getaddrinfo result in order. Browsers go further with Happy Eyeballs (RFC 8305): they start IPv6 and IPv4 attempts almost in parallel and keep the first that connects.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From a name to a connected socket",
        steps: [
          { label: "getaddrinfo", detail: "example.com + 443 becomes a list of addresses" },
          { label: "Pick next result", detail: "IPv6 first on most systems, then IPv4" },
          { label: "socket", detail: "With ai_family, ai_socktype, ai_protocol" },
          { label: "connect", detail: "Fails? close it and try the next result" },
          { label: "freeaddrinfo", detail: "Release the list once connected" },
        ],
      },
    ],
    examples: [
      {
        title: "A listening socket for IPv4 and IPv6",
        explanation: "We want one function that opens a TCP server socket on a given port for both protocols. Step 1: ask getaddrinfo for an AF_INET6 passive address, so node NULL becomes ::. Step 2: create the socket from the result fields. Step 3: turn IPV6_V6ONLY off so IPv4 clients are accepted too, and set SO_REUSEADDR for quick restarts. Step 4: bind and listen, closing the socket on any error. Step 5: free the list in every case. It needs netdb.h, netinet/in.h, sys/socket.h, stdio.h and unistd.h.",
        code: {
          lang: "c",
          code: String.raw`int listen_on(const char *port) {
  struct addrinfo hints = { .ai_family = AF_INET6, .ai_socktype = SOCK_STREAM, .ai_flags = AI_PASSIVE }, *res;
  int err = getaddrinfo(NULL, port, &hints, &res);
  if (err) { fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(err)); return -1; }
  int fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol), off = 0, one = 1;
  if (fd >= 0) {
    setsockopt(fd, IPPROTO_IPV6, IPV6_V6ONLY, &off, sizeof off);   /* accept IPv4 too */
    setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one);
    if (bind(fd, res->ai_addr, res->ai_addrlen) < 0 || listen(fd, 128) < 0) {
      perror("bind/listen"); close(fd); fd = -1; }
  } else perror("socket");
  freeaddrinfo(res);
  return fd;
}`,
        },
      },
      {
        title: "Print who connected, whatever the family",
        explanation: "After accept we want to log the client's address. Step 1: receive the address into a sockaddr_storage, which fits both IPv4 and IPv6, and pass its size in a socklen_t. Step 2: call getnameinfo with NI_NUMERICHOST and NI_NUMERICSERV so it only formats numbers and never waits for DNS. Step 3: print the result. Connect once with nc -6 ::1 8080 and once with nc -4 127.0.0.1 8080: on the dual-stack socket above, the IPv4 client appears as ::ffff:127.0.0.1.",
        code: {
          lang: "c",
          code: String.raw`struct sockaddr_storage ss; socklen_t len = sizeof ss;
int c = accept(lfd, (struct sockaddr *)&ss, &len);
if (c < 0) { perror("accept"); continue; }
char host[NI_MAXHOST], serv[NI_MAXSERV];
int err = getnameinfo((struct sockaddr *)&ss, len, host, sizeof host,
                      serv, sizeof serv, NI_NUMERICHOST | NI_NUMERICSERV);
if (err) fprintf(stderr, "getnameinfo: %s\n", gai_strerror(err));
else printf("client %s port %s\n", host, serv);   /* e.g. ::ffff:127.0.0.1 port 51514 */`,
        },
      },
    ],
    cheatSheet: [
      "socket(AF_INET6, SOCK_STREAM | SOCK_CLOEXEC, 0) returns a descriptor or -1",
      "htons for ports, htonl for IPv4 addresses; ntohs and ntohl to read them back",
      "getaddrinfo errors: print gai_strerror(err), not perror",
      "AI_PASSIVE + NULL host = wildcard address for a server bind",
      "sockaddr_storage holds any address type; check ss_family",
      "IPV6_V6ONLY = 0 on an AF_INET6 socket accepts IPv4 as ::ffff:a.b.c.d",
      "Ports below 1024 need root or CAP_NET_BIND_SERVICE",
      "ss -ltnp shows listening TCP sockets and the owning process",
    ],
    quiz: [
      {
        q: "A server sets sin_port = 8080 without htons on an x86-64 machine. Which port does it actually listen on?",
        options: ["8080", "80", "It fails with EINVAL", "36895"],
        answer: 3,
        why: "0x1F90 stored without conversion is read by the network as 0x901F, which is 36895.",
      },
      {
        q: "getaddrinfo returns a non-zero value. How do you get a readable message?",
        options: ["perror(\"getaddrinfo\")", "gai_strerror(returned code)", "strerror(errno)", "Read h_errno"],
        answer: 1,
        why: "getaddrinfo returns its own EAI_ error codes, which gai_strerror translates.",
      },
      {
        q: "Which struct should you use to receive an address from accept when the client may be IPv4 or IPv6?",
        options: ["struct sockaddr_storage", "struct sockaddr_in", "struct in_addr", "struct sockaddr_un"],
        answer: 0,
        why: "sockaddr_storage is big enough and properly aligned for every address family.",
      },
      {
        q: "What does accept return?",
        options: ["The listening socket, now connected", "The client's port number", "A new descriptor for that one connection", "0 on success"],
        answer: 2,
        why: "The listening socket keeps listening; each accepted connection gets its own descriptor.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the value 8080 and htons(8080) in hex, and print the two bytes of each in memory order.",
        hint: "Copy the uint16_t into an unsigned char array of 2 with memcpy.",
        solution: String.raw`#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
int main(void) {
  uint16_t h = 8080, n = htons(8080); unsigned char b[2];
  memcpy(b, &h, 2); printf("host    0x%04x bytes %02x %02x\n", h, b[0], b[1]);
  memcpy(b, &n, 2); printf("network 0x%04x bytes %02x %02x\n", n, b[0], b[1]);
  return 0;
}   /* on x86-64: host bytes 90 1f, network bytes 1f 90 */`,
      },
      {
        level: "medium",
        task: "Write a tiny lookup tool: ./lookup example.com prints every address getaddrinfo returns, with IPv4 or IPv6 in front.",
        hint: "Use AF_UNSPEC and SOCK_STREAM so each address appears once, then getnameinfo with NI_NUMERICHOST.",
        solution: String.raw`struct addrinfo hints = { .ai_family = AF_UNSPEC, .ai_socktype = SOCK_STREAM }, *res, *r;
int err = getaddrinfo(argv[1], NULL, &hints, &res);
if (err) { fprintf(stderr, "%s\n", gai_strerror(err)); return 1; }
for (r = res; r; r = r->ai_next) {
  char host[NI_MAXHOST];
  if (getnameinfo(r->ai_addr, r->ai_addrlen, host, sizeof host, NULL, 0, NI_NUMERICHOST) == 0)
    printf("%s %s\n", r->ai_family == AF_INET6 ? "IPv6" : "IPv4", host);
}
freeaddrinfo(res);`,
      },
      {
        level: "hard",
        task: "Use listen_on from the example in a server that accepts clients and logs their addresses. For IPv4-mapped clients, print the plain IPv4 address instead of ::ffff:a.b.c.d.",
        hint: "IN6_IS_ADDR_V4MAPPED(&sin6->sin6_addr) detects them; the IPv4 address is the last 4 bytes.",
        solution: String.raw`char text[INET6_ADDRSTRLEN];
if (ss.ss_family == AF_INET6) {
  struct sockaddr_in6 *s6 = (struct sockaddr_in6 *)&ss;
  if (IN6_IS_ADDR_V4MAPPED(&s6->sin6_addr))
    inet_ntop(AF_INET, &s6->sin6_addr.s6_addr[12], text, sizeof text);
  else
    inet_ntop(AF_INET6, &s6->sin6_addr, text, sizeof text);
  printf("client %s port %u\n", text, ntohs(s6->sin6_port));
}`,
      },
    ],
    faq: [
      { q: "What is the difference between 0.0.0.0 and 127.0.0.1 when binding?", a: "0.0.0.0 (or :: for IPv6) accepts connections on every network interface. 127.0.0.1 (or ::1) only accepts connections from the same machine, which is safer for admin or debug ports." },
      { q: "Why do I need root to bind port 80?", a: "Ports below 1024 are privileged on Linux. Grant just that right with setcap cap_net_bind_service=+ep ./server, or AmbientCapabilities=CAP_NET_BIND_SERVICE in a systemd unit, instead of running as root." },
      { q: "Is gethostbyname still OK to use?", a: "No. It is obsolete, IPv4-only and not thread-safe. getaddrinfo replaces it and handles IPv4 and IPv6 the same way." },
      { q: "Does htons do anything on ARM?", a: "Most ARM Linux systems run little-endian, so yes, it swaps the bytes just like on x86. On a big-endian machine it does nothing, which is why you always call it." },
    ],
  },

  "lsp-networking/tcp-server": {
    plain: [
      "TCP is like a phone call between two programs. First the call is set up, then both sides can talk, and every byte arrives in order with nothing missing. If a packet gets lost on the way, TCP quietly sends it again.",
      "A TCP server needs two kinds of sockets. The listening socket is the receptionist: it only waits for new callers. Each time a caller arrives, accept hands you a new socket just for that conversation, while the receptionist keeps waiting for the next one.",
      "One surprise: TCP sends a stream of bytes, not messages. If the client sends \"hello\" and then \"world\", the server might read \"hellowor\" and then \"ld\". Your program has to mark where each message ends, for example with a newline, or by sending the length first.",
      "Connections also end, sometimes politely and sometimes not. A good server notices a closed connection, cleans it up, and never crashes because a client disappeared halfway through.",
    ],
    deepDive: [
      {
        heading: "The handshake and the two kernel queues",
        body: "When a client calls connect, its kernel sends a SYN. The server's kernel answers with SYN-ACK and keeps a small record in the SYN queue (half-open connections). When the client's ACK arrives, the connection is complete and moves to the accept queue. All of this happens inside the kernel, before your program calls accept. accept simply takes the oldest finished connection off that queue.\n\nThe backlog argument to listen sets the size of the accept queue, capped by net.core.somaxconn. If your program is too slow to accept and the queue fills, new clients see delays or timeouts. You can watch it with ss -ltn: for a listening socket, Recv-Q is how many connections wait right now and Send-Q is the backlog limit. Under a SYN flood the SYN queue fills instead, and Linux falls back to SYN cookies (net.ipv4.tcp_syncookies), which encode the state in the sequence number.",
        visual: {
          type: "flow",
          title: "From connect() to accept()",
          steps: [
            { label: "Client SYN", detail: "connect() starts the handshake" },
            { label: "SYN queue", detail: "Server kernel replies SYN-ACK" },
            { label: "Client ACK", detail: "Connection is now established" },
            { label: "Accept queue", detail: "Waits here; size set by the backlog" },
            { label: "accept()", detail: "Your program gets a new descriptor" },
          ],
        },
      },
      {
        heading: "TIME_WAIT and SO_REUSEADDR",
        body: "The side that closes a connection first enters the TIME_WAIT state. It stays there for twice the maximum segment lifetime, fixed at 60 seconds on Linux, so that delayed packets from the old connection cannot be mistaken for a new one using the same addresses and ports.\n\nThis bites servers on restart. You stop the server, and its recent connections sit in TIME_WAIT on port 7000. The new process calls bind on port 7000 and fails with EADDRINUSE: Address already in use. Setting SO_REUSEADDR to 1 before bind allows the bind as long as no socket is actually listening on that port. Every TCP server should set it.\n\nDo not confuse it with SO_REUSEPORT, which lets several sockets bind the exact same port at once, with the kernel spreading new connections across them. That is used to run one accept loop per CPU core.",
        bullets: ["ss -tan state time-wait lists sockets in TIME_WAIT", "Set SO_REUSEADDR after socket and before bind", "SO_REUSEPORT is for load-sharing, not for restarts"],
      },
      {
        heading: "Framing messages on a byte stream",
        body: "TCP keeps the order of bytes but not the boundaries of your sends. One send may arrive in several recv calls, and several sends may arrive in one. So every protocol needs a framing rule.\n\nDelimiter framing ends each message with a marker, usually a newline. It suits text protocols such as SMTP, Redis and chat. The receiver appends incoming bytes to a buffer and handles each complete line, keeping any partial line for later. You must cap the line length, or a client that never sends a newline can fill your memory.\n\nLength-prefix framing sends the size first, often as a 4-byte big-endian integer, then exactly that many bytes. It handles binary data and lets the receiver allocate the right buffer. Again, check the length against a maximum before allocating.\n\nA related detail: Nagle's algorithm delays small writes to combine them. For request-response protocols that send small messages, set TCP_NODELAY, or better, build the whole message and send it in one call.",
        visual: {
          type: "compare",
          title: "Two framing styles",
          columns: [
            { title: "Newline delimited", points: ["Text lines like PING", "Easy to test with nc", "Must escape newlines in data", "Cap line length"] },
            { title: "Length prefix", points: ["4-byte size, then payload", "Any binary data", "Read header, then exact body", "Cap the declared size"] },
          ],
        },
      },
      {
        heading: "Disconnects, ECONNRESET and SIGPIPE",
        body: "recv returning 0 means the peer closed its side politely (it sent a FIN). recv returning -1 with ECONNRESET means the connection was reset (an RST), for example because the client crashed or closed with unread data. Both mean: close this socket and free its state.\n\nWriting is trickier. If the peer has gone, your first send may still succeed, because it only copies bytes into the kernel's send buffer. The peer's kernel then answers with RST, and the next send triggers SIGPIPE, whose default action kills your whole server. Ignore it once at startup with signal(SIGPIPE, SIG_IGN), or pass MSG_NOSIGNAL to every send. Then the call returns -1 with EPIPE instead, and you just close that connection.\n\nA peer that vanishes without any packet (cable pulled, laptop asleep) is never noticed if you only wait to read. Use application timeouts or heartbeats, or TCP keepalive (SO_KEEPALIVE), whose default only starts probing after 2 hours of silence.",
        bullets: ["recv == 0: orderly close", "ECONNRESET or EPIPE: close the socket, do not exit", "shutdown(fd, SHUT_WR) sends FIN but still lets you read"],
      },
      {
        heading: "Iterative servers and their limit",
        body: "The explainer's echo server is iterative: it serves one client completely before calling accept again. That is fine for learning and for tiny admin tools, but one slow client blocks everyone. A client that connects and sends nothing freezes the whole server.\n\nThere are three classic ways out. Fork per connection: the parent accepts and forks, the child serves one client and exits; the parent must close its copy of the client socket and reap children. Thread per connection: same idea with threads, cheaper, but every shared structure needs locking. Event loop: one thread watches all sockets with epoll and only touches the ones that are ready, which the next topics cover. Each step trades simpler code for higher capacity.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What a recv or send result means",
        root: "Result of recv / send",
        children: [
          { label: "n > 0", children: ["Some bytes moved, maybe fewer than asked", "Loop for the rest"] },
          { label: "recv == 0", children: ["Peer closed politely (FIN)", "Close and free the connection"] },
          { label: "-1, EINTR", children: ["Interrupted by a signal", "Retry the call"] },
          { label: "-1, EAGAIN", children: ["Non-blocking socket not ready", "Wait for readiness"] },
          { label: "-1, ECONNRESET or EPIPE", children: ["Connection is dead", "Close it; keep serving others"] },
        ],
      },
    ],
    examples: [
      {
        title: "Restart fails with Address already in use",
        explanation: "You stop your echo server and start it again within a minute, and bind fails. Step 1: look at the port. The old connections are in TIME_WAIT because the server closed them first. Step 2: confirm nothing is still listening; if a LISTEN line remains, an old process is still running, and SO_REUSEADDR will not help. Step 3: add SO_REUSEADDR before bind and rebuild. Step 4: restart; bind now succeeds even with TIME_WAIT entries present.",
        code: {
          lang: "bash",
          code: String.raw`./echo_server
# bind: Address already in use
ss -tan '( sport = :7000 )'
# State      Recv-Q Send-Q Local Address:Port  Peer Address:Port
# TIME-WAIT  0      0      127.0.0.1:7000      127.0.0.1:51234
ss -ltnp '( sport = :7000 )'      # empty: no process is listening
# fix: setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one) before bind`,
        },
      },
      {
        title: "Reading one length-prefixed message",
        explanation: "Our protocol sends a 4-byte big-endian length, then the payload. Step 1: read exactly 4 bytes with a loop, because recv may return fewer. Step 2: convert with ntohl and refuse sizes above a limit, so a bad client cannot make us allocate gigabytes. Step 3: allocate and read exactly that many bytes. Step 4: a return of 0 from recv in the middle means the peer closed early, which we report as an error.",
        code: {
          lang: "c",
          code: String.raw`static int recv_all(int fd, void *buf, size_t n) {      /* 0 ok, -1 error or EOF */
  for (size_t got = 0; got < n; ) {
    ssize_t r = recv(fd, (char *)buf + got, n - got, 0);
    if (r > 0) got += (size_t)r;
    else if (r < 0 && errno == EINTR) continue;
    else return -1;                                       /* 0 = peer closed early */
  }
  return 0;
}
char *recv_msg(int fd, uint32_t *len) {
  uint32_t be;
  if (recv_all(fd, &be, 4) < 0 || (*len = ntohl(be)) > 1 << 20) return NULL;
  char *m = malloc(*len ? *len : 1);
  if (m && recv_all(fd, m, *len) < 0) { free(m); m = NULL; }
  return m;
}`,
        },
      },
    ],
    cheatSheet: [
      "Server: socket, setsockopt SO_REUSEADDR, bind, listen, then accept in a loop",
      "ss -ltn: Recv-Q = connections waiting for accept, Send-Q = backlog",
      "TIME_WAIT lasts 60 seconds on Linux; it is normal, not a leak",
      "signal(SIGPIPE, SIG_IGN) once, or send(..., MSG_NOSIGNAL) every time",
      "recv == 0 means the peer closed; ECONNRESET means it reset",
      "TCP has no message boundaries: frame with newlines or a length prefix",
      "setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, &one, sizeof one) disables Nagle",
      "nc localhost 7000 is a quick test client; nc -l 7000 a quick test server",
    ],
    quiz: [
      {
        q: "When does the three-way handshake complete for a server?",
        options: ["When the server calls accept", "In the kernel, before accept is called", "When the server first calls recv", "When the client sends data"],
        answer: 1,
        why: "The kernel completes the handshake and queues the connection; accept just takes it off the queue.",
      },
      {
        q: "A client sends two 100-byte messages with two send calls. What can the server's recv calls return?",
        options: ["Always exactly 100 bytes each", "Always all 200 bytes at once", "Exactly two calls, but of any size", "Any split, such as 150 and 50, or 200 at once"],
        answer: 3,
        why: "TCP is a byte stream, so boundaries between sends are not preserved.",
      },
      {
        q: "Your server dies silently when a client disconnects during a reply. What is the most likely cause?",
        options: ["SIGPIPE from writing to a closed connection", "A full accept queue", "TIME_WAIT on the port", "A missing htons"],
        answer: 0,
        why: "SIGPIPE's default action terminates the process; ignore it or use MSG_NOSIGNAL to get EPIPE instead.",
      },
      {
        q: "What does SO_REUSEADDR allow?",
        options: ["Two running servers on the same port", "Reusing a closed file descriptor number", "Binding a port that still has connections in TIME_WAIT", "Sharing one connection between processes"],
        answer: 2,
        why: "It lets a restarted server bind even though old connections on that port are in TIME_WAIT.",
      },
      {
        q: "Why must a newline-framed server cap the line length?",
        options: ["TCP cannot carry long lines", "A client that never sends a newline could make it buffer without limit", "Newlines are slow to search for", "The kernel rejects long recv calls"],
        answer: 1,
        why: "Without a cap, one client can make the server grow its buffer until memory runs out.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run the explainer's echo server, connect with nc, then stop and restart the server right away. Watch the TIME_WAIT entries with ss, and confirm SO_REUSEADDR makes the restart work.",
        hint: "Close nc with Ctrl+D first, then restart quickly. Comment out the setsockopt line to see the failure.",
        solution: String.raw`./echo &           # terminal 1
nc localhost 7000  # terminal 2: type a line, see it echoed, then Ctrl+D
kill %1 && ./echo &
ss -tan state time-wait '( sport = :7000 )'
# with SO_REUSEADDR: restart works; without it: bind fails with EADDRINUSE
# (TIME_WAIT is on the side that closed first)`,
      },
      {
        level: "medium",
        task: "Make the echo server robust: ignore SIGPIPE, check every call, send the whole buffer with a send_all loop, and close the client on recv 0, ECONNRESET or EPIPE without exiting.",
        hint: "send_all loops until every byte is sent, retrying on EINTR.",
        solution: String.raw`signal(SIGPIPE, SIG_IGN);
for (;;) {
  int c = accept(s, NULL, NULL);
  if (c < 0) { if (errno != EINTR) perror("accept"); continue; }
  char buf[4096]; ssize_t n;
  while ((n = recv(c, buf, sizeof buf, 0)) > 0)
    if (send_all(c, buf, (size_t)n) < 0) break;   /* EPIPE etc. */
  if (n < 0 && errno != ECONNRESET) perror("recv");
  close(c);
}`,
      },
      {
        level: "hard",
        task: "Turn the iterative echo server into a fork-per-connection server. Make sure the parent closes its copy of the client socket and that zombies are reaped.",
        hint: "Set SIGCHLD to SIG_IGN (Linux then reaps children automatically), or reap with waitpid(-1, NULL, WNOHANG) in a loop.",
        solution: String.raw`signal(SIGPIPE, SIG_IGN);
signal(SIGCHLD, SIG_IGN);                  /* children are reaped automatically */
for (;;) {
  int c = accept(s, NULL, NULL);
  if (c < 0) { if (errno != EINTR) perror("accept"); continue; }
  pid_t pid = fork();
  if (pid == 0) { close(s); serve(c); close(c); _exit(0); }   /* child */
  if (pid < 0) perror("fork");
  close(c);                                /* parent: child owns it now */
}`,
      },
    ],
    faq: [
      { q: "Why does my server say Address already in use after a restart?", a: "Old connections on that port are in TIME_WAIT for 60 seconds. Set SO_REUSEADDR before bind. If ss -ltnp still shows a LISTEN entry, another process really is using the port." },
      { q: "Why do I receive half a message?", a: "TCP does not keep message boundaries, so a recv returns whatever bytes have arrived. Keep a buffer per connection and only handle a message once its whole frame is there." },
      { q: "How do I detect that a client is gone?", a: "recv returns 0 or fails with ECONNRESET when the peer closes or resets. If the peer just vanishes, nothing arrives at all, so use read timeouts, heartbeats or TCP keepalive." },
      { q: "What backlog should I pass to listen?", a: "Something like 128 to 4096. The kernel caps it at net.core.somaxconn. A larger backlog only helps with bursts; if accept is slow all the time, fix the accept loop instead." },
    ],
  },

  "lsp-networking/udp": {
    plain: [
      "UDP is like sending postcards. Each one travels alone, with the address written on it. Most arrive, but some may get lost, some may arrive twice, and some may arrive in a different order. Nobody tells you which.",
      "In exchange you get speed and simplicity. There is no call to set up, no waiting for lost packets to be resent, and each postcard arrives whole or not at all. That is perfect for things like DNS lookups, voice calls and online games, where a late answer is as bad as no answer.",
      "In code, a server binds a socket and calls recvfrom, which gives one complete message plus the sender's address. It answers with sendto to that address. One sendto is always one message on the other side, never half of one.",
      "If you need some reliability, you build just the part you need: a timeout and a retry for requests, a number on each message to spot duplicates or wrong order. That is exactly what DNS clients and game engines do.",
    ],
    deepDive: [
      {
        heading: "Datagram boundaries and size limits",
        body: "Each sendto creates one datagram, and each recvfrom returns exactly one. If your buffer is smaller than the datagram, the extra bytes are thrown away for good; they do not wait for your next call. On Linux, passing MSG_TRUNC to recv returns the real length even when it did not fit, which helps you size buffers.\n\nThe theoretical maximum payload is 65,507 bytes over IPv4 (65,535 minus the 20-byte IP header and the 8-byte UDP header). In practice the limit that matters is the path MTU, usually 1500 bytes on Ethernet. A larger datagram is split into IP fragments, and if any one fragment is lost, the whole datagram is lost. So staying within 1472 bytes of payload over IPv4 (1452 over IPv6) avoids fragmentation on plain Ethernet, and many protocols stay near 1200 bytes to be safe across tunnels and VPNs. QUIC, for example, requires paths to carry at least 1200 bytes.",
      },
      {
        heading: "Loss, duplicates and full buffers",
        body: "UDP packets are lost on the network, but very often they are lost on the receiving machine. Each socket has a receive buffer. If datagrams arrive faster than your program calls recvfrom, the buffer fills and the kernel silently drops new ones. The sender never knows.\n\nYou can see these drops: nstat -az UdpRcvbufErrors or netstat -su (receive buffer errors). The fixes are to read faster (a dedicated thread, recvmmsg to grab many datagrams per call) and to give the socket a larger buffer with setsockopt SO_RCVBUF. The kernel caps that request at net.core.rmem_max, so raise the sysctl too.\n\nUDP also has no congestion control. A sender that blasts as fast as it can will cause loss for itself and for everyone sharing the link. Real protocols limit their own rate.",
        bullets: ["nstat -az UdpRcvbufErrors counts drops on full receive buffers", "sysctl net.core.rmem_max caps SO_RCVBUF", "ss -ulmn shows each UDP socket's buffer use"],
      },
      {
        heading: "Timeouts and retries",
        body: "A request over UDP needs a timeout, or a lost packet makes the client wait forever. Two common ways: set SO_RCVTIMEO with a struct timeval, after which recvfrom fails with EAGAIN or EWOULDBLOCK when time is up, or wait with poll and a timeout in milliseconds.\n\nWhen the timeout fires, send the request again, a limited number of times. Increase the wait each time (exponential backoff), for example 0.5, 1 and 2 seconds, so a busy server is not flooded with retries. Put a request ID in each message and check it on the reply. Otherwise a late reply to the first attempt may be taken as the answer to a different request. Finally, retries mean the server may see the same request twice, so requests should be idempotent: doing them twice must be harmless. DNS queries are read-only for this reason, and DNS clients retry exactly this way.",
        visual: {
          type: "sequence",
          title: "A request with timeout and retry",
          actors: ["Client", "Network", "Server"],
          messages: [
            { from: 0, to: 1, label: "request id=7" },
            { from: 1, to: 1, label: "datagram lost" },
            { from: 0, to: 0, label: "timeout after 0.5 s" },
            { from: 0, to: 2, label: "retry: request id=7" },
            { from: 2, to: 0, label: "reply id=7" },
            { from: 0, to: 0, label: "id matches: done" },
          ],
        },
      },
      {
        heading: "Connected UDP sockets",
        body: "Calling connect on a UDP socket sends nothing over the network. It only records a default peer. After that you can use send and recv instead of sendto and recvfrom, and the kernel drops datagrams from any other address, which is a cheap filter for clients.\n\nThere is a bonus. If the server is not running, the target host usually answers with an ICMP port unreachable message. On a connected socket, Linux reports that as ECONNREFUSED on a later send or recv, so the client fails fast instead of waiting for a timeout. Unconnected sockets do not get these errors by default.\n\nA server talking to many clients keeps one unconnected socket and uses recvfrom and sendto, since it must reply to whoever wrote.",
        bullets: ["connect(udp_fd, ...) = set default peer, no handshake", "ECONNREFUSED on a connected UDP socket means nothing listens there"],
      },
      {
        heading: "UDP or TCP?",
        body: "Choose TCP when you need every byte, in order, and do not want to write that logic yourself: web pages, file transfers, database connections, SSH. Choose UDP when timeliness beats completeness, or when the messages are tiny and independent. A voice call should skip a lost 20 ms of audio, not pause to resend it. DNS is one small question and one small answer, where a TCP handshake would double the wait. DHCP and NTP are other classic UDP protocols.\n\nUDP is also the base for building your own transport. QUIC, which carries HTTP/3, runs over UDP and adds reliability, encryption and congestion control in user space, avoiding head-of-line blocking where one lost packet holds up every stream. Multicast and broadcast only exist for UDP.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "One unfragmented UDP datagram on Ethernet (1500 MTU)",
        layers: [
          { label: "Ethernet frame", detail: "Carries at most 1500 bytes of IP packet" },
          { label: "IPv4 header: 20 bytes", detail: "40 bytes for IPv6" },
          { label: "UDP header: 8 bytes", detail: "Ports, length, checksum" },
          { label: "Payload: up to 1472 bytes", detail: "1452 with IPv6; larger means fragments" },
        ],
      },
    ],
    examples: [
      {
        title: "A UDP client with timeout and three retries",
        explanation: "We send a request and wait up to 1 second for the reply, then retry with a doubled timeout. Step 1: connect the UDP socket to the server so we can use send and recv and get ECONNREFUSED if nothing listens. Step 2: for each attempt, set SO_RCVTIMEO and send. Step 3: recv returns -1 with EAGAIN or EWOULDBLOCK on timeout, and we try again. Step 4: any other result ends the loop. A real client would also check that the reply carries the right request ID.",
        code: {
          lang: "c",
          code: String.raw`ssize_t ask(int fd, const char *req, char *reply, size_t cap) {   /* fd is connected */
  for (int attempt = 0, ms = 1000; attempt < 3; attempt++, ms *= 2) {
    struct timeval tv = { .tv_sec = ms / 1000, .tv_usec = (ms % 1000) * 1000 };
    if (setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof tv) < 0) return -1;
    if (send(fd, req, strlen(req), 0) < 0) return -1;              /* e.g. ECONNREFUSED */
    ssize_t n = recv(fd, reply, cap, 0);
    if (n >= 0) return n;                                          /* one whole datagram */
    if (errno != EAGAIN && errno != EWOULDBLOCK && errno != EINTR) return -1;
    fprintf(stderr, "timeout after %d ms, retrying\n", ms);
  }
  errno = ETIMEDOUT; return -1;
}`,
        },
      },
      {
        title: "Finding datagrams dropped by a busy receiver",
        explanation: "A metrics collector over UDP shows gaps, but the network looks healthy. Step 1: check the kernel counters; a rising UdpRcvbufErrors means the socket's receive buffer was full and the kernel dropped datagrams. Step 2: look at the socket itself with ss -ulmn, where the skmem field shows buffer use (rb is the buffer size). Step 3: raise the system cap and ask for a bigger buffer in the program with SO_RCVBUF. Step 4: if drops continue, the program is too slow; read in a dedicated thread or with recvmmsg.",
        code: {
          lang: "bash",
          code: String.raw`nstat -az UdpRcvbufErrors UdpInErrors
# UdpRcvbufErrors   18342   0.0      <- datagrams dropped on a full buffer
ss -ulmn 'sport = :8125'
# ... skmem:(r212992,rb212992,...)   r = bytes queued, rb = buffer size
sudo sysctl -w net.core.rmem_max=8388608
# in the program, before receiving:
#   int sz = 8 << 20; setsockopt(fd, SOL_SOCKET, SO_RCVBUF, &sz, sizeof sz);`,
        },
      },
    ],
    cheatSheet: [
      "One sendto = one datagram; one recvfrom = one datagram or nothing",
      "A too-small recv buffer silently truncates; recv(..., MSG_TRUNC) reports the real size",
      "Max payload 65,507 bytes over IPv4; stay under 1472 (IPv4) or 1452 (IPv6) on Ethernet",
      "SO_RCVTIMEO makes recvfrom fail with EAGAIN or EWOULDBLOCK on timeout",
      "connect on UDP sets a default peer and enables ECONNREFUSED errors",
      "nstat -az UdpRcvbufErrors shows drops from full receive buffers",
      "Retries need request IDs and idempotent requests",
      "nc -u host 9000 sends UDP lines; nc -ul 9000 listens",
    ],
    quiz: [
      {
        q: "A sender sends a 1000-byte datagram and the receiver calls recvfrom with a 600-byte buffer. What happens to the last 400 bytes?",
        options: ["They are discarded", "They arrive in the next recvfrom", "recvfrom fails with EMSGSIZE", "The kernel enlarges the buffer"],
        answer: 0,
        why: "A datagram is delivered in one piece, and whatever does not fit is lost.",
      },
      {
        q: "Why do many UDP protocols keep datagrams around 1200 to 1400 bytes?",
        options: ["The UDP header limits them", "Larger ones are always rejected", "To avoid IP fragmentation, where losing one fragment loses the whole datagram", "Because recvfrom cannot read more"],
        answer: 2,
        why: "Staying under the path MTU avoids fragmentation and its higher loss rate.",
      },
      {
        q: "A UDP server drops datagrams under load, but the network has no errors. What should you check first?",
        options: ["The TCP backlog", "UdpRcvbufErrors: the socket receive buffer is overflowing", "The TIME_WAIT count", "The MTU of the loopback interface"],
        answer: 1,
        why: "When the program reads too slowly, the kernel drops datagrams on a full receive buffer.",
      },
      {
        q: "What does connect do on a UDP socket?",
        options: ["Performs a handshake with the server", "Makes the socket reliable", "Turns it into a TCP socket", "Sets a default peer, filters other senders and enables error reports"],
        answer: 3,
        why: "No packets are sent; it only records the peer address locally.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start the explainer's UDP echo server and send it lines with nc -u. Then send one datagram bigger than its 1500-byte buffer and see what comes back.",
        hint: "head -c 3000 /dev/zero | tr '\\0' 'a' | nc -u -w1 localhost 9000 sends one 3000-byte datagram.",
        solution: String.raw`./udp_echo &
nc -u localhost 9000          # type hello, get hello back; Ctrl+C to stop
head -c 3000 /dev/zero | tr '\0' 'a' | nc -u -w1 localhost 9000 | wc -c
# prints 1500: the server read only 1500 bytes, the other 1500 were discarded`,
      },
      {
        level: "medium",
        task: "Write a UDP client that sends a numbered PING every 100 ms for 50 pings and counts how many replies come back from the echo server, ignoring replies with the wrong number.",
        hint: "Use a connected socket and SO_RCVTIMEO of 100 ms. Compare the reply text with what you sent.",
        solution: String.raw`int ok = 0;
for (int i = 0; i < 50; i++) {
  char msg[32], rep[64];
  int len = snprintf(msg, sizeof msg, "PING %d", i);
  if (send(fd, msg, len, 0) < 0) { perror("send"); break; }
  ssize_t n = recv(fd, rep, sizeof rep - 1, 0);     /* 100 ms SO_RCVTIMEO */
  if (n == len && memcmp(rep, msg, len) == 0) ok++;
}
printf("%d/50 replies\n", ok);
/* add loss for testing: sudo tc qdisc add dev lo root netem loss 20% (remove with del) */`,
      },
      {
        level: "hard",
        task: "Add de-duplication to a UDP server: clients send \"id payload\", the server performs each id only once, and replies to repeats with the cached answer.",
        hint: "Keep a small table of recent ids per client address with their reply. A ring of 256 entries is enough for a demo.",
        solution: String.raw`struct seen { struct sockaddr_storage peer; socklen_t len; unsigned id; char reply[64]; };
static struct seen ring[256]; static int next;
struct seen *find(struct sockaddr_storage *p, socklen_t len, unsigned id) {
  for (int i = 0; i < 256; i++)
    if (ring[i].id == id && ring[i].len == len && memcmp(&ring[i].peer, p, len) == 0) return &ring[i];
  return NULL;
}
/* on each datagram: parse id; if (s = find(...)) resend s->reply;
   else { do the work; store peer, id and reply in ring[next++ % 256]; send reply; } */`,
      },
    ],
    faq: [
      { q: "Is UDP faster than TCP?", a: "It has less overhead and no handshake or retransmission waits, so latency is lower. For bulk transfer TCP is usually just as fast, and it handles loss and congestion for you." },
      { q: "Can UDP packets arrive out of order on localhost?", a: "Practically never on loopback, and rarely on a simple LAN. On the internet reordering and loss do happen, so test with tc netem to add loss and delay." },
      { q: "Why does HTTP/3 use UDP?", a: "QUIC runs over UDP so it can be deployed in user space without changing operating systems, and it avoids TCP head-of-line blocking by handling each stream separately." },
      { q: "Do I need to call htons for UDP ports too?", a: "Yes. sockaddr_in and sockaddr_in6 always hold the port in network byte order, whatever the protocol." },
    ],
  },

  "lsp-networking/io-multiplexing": {
    plain: [
      "A waiter in a restaurant does not stand at one table until those guests finish eating. They walk around and serve whichever table is ready. I/O multiplexing lets one thread work the same way with many network connections.",
      "Instead of calling read on one socket and getting stuck there, you ask the kernel: \"Here is my list of sockets. Wake me up when any of them has something for me.\" The kernel answers with the ones that are ready, and you serve only those.",
      "Linux offers three ways to ask. select is the oldest and has a hard limit of 1024 descriptors. poll removes that limit but still checks every socket on every call. epoll remembers your list inside the kernel and only reports the ready ones, so it stays fast with tens of thousands of connections.",
      "\"Ready\" has a precise meaning: the next read or write will not block. It does not mean a whole message has arrived. Your code still has to collect bytes until a full message is there.",
    ],
    deepDive: [
      {
        heading: "select: the original interface",
        body: "select takes three fd_set bitmaps (for read, write and exceptional conditions), the highest descriptor plus one, and a timeout. You fill the sets with FD_ZERO and FD_SET, call select, then test each descriptor with FD_ISSET. The kernel overwrites the sets with the ready ones, so you must rebuild them before every call. On Linux the timeout struct is also changed to the time left, so reset it too.\n\nThe big limit is FD_SETSIZE, 1024. An fd_set is a fixed bitmap, and calling FD_SET with descriptor 1024 or higher writes past its end: memory corruption, not a clean error. A busy server reaches descriptor 1024 easily, because every connection, file and pipe takes a number. Building with -D_FORTIFY_SOURCE=2 and optimisation makes glibc abort on such calls instead of corrupting memory. select is still fine for small tools that watch a few descriptors, like a terminal and one socket.",
        bullets: ["Rebuild the fd_sets and the timeout before every call", "nfds = highest descriptor + 1", "Never FD_SET a descriptor of 1024 or more"],
      },
      {
        heading: "poll: an array instead of bitmaps",
        body: "poll takes an array of struct pollfd. Each entry has fd, the events you want (POLLIN for readable, POLLOUT for writable) and revents, which the kernel fills in. The timeout is in milliseconds: -1 waits forever, 0 returns at once. There is no 1024 limit, and poll never changes fd or events, so you can pass the same array again on the next call. Setting an entry's fd to -1 makes poll skip it, which is a handy way to remove a client without reshuffling the array.\n\nrevents can also contain flags you never asked for: POLLERR (an error is pending), POLLHUP (the peer hung up) and POLLNVAL (the descriptor is not open, usually a bug in your bookkeeping). Always check them.\n\nThe cost remains linear. On every call the kernel copies the whole array in, checks every descriptor, and copies it out. With 10,000 mostly idle connections, each call does 10,000 checks to find perhaps 3 ready sockets.",
        bullets: ["struct pollfd { int fd; short events; short revents; }", "POLLHUP and POLLERR arrive even if not requested", "fd = -1 disables an entry"],
      },
      {
        heading: "epoll: interest list and ready list",
        body: "epoll splits the work in two. epoll_create1 creates an epoll instance, itself a descriptor. epoll_ctl with EPOLL_CTL_ADD, EPOLL_CTL_MOD or EPOLL_CTL_DEL changes the interest list, which the kernel keeps in a red-black tree. You register each socket once, not on every call.\n\nWhen you add a socket, epoll hooks a callback onto that socket's wait queue. When data arrives, the network stack wakes the queue, the callback puts the socket on the ready list, and epoll_wait returns only the entries on that list. So the cost of each epoll_wait depends on how many sockets are ready, not on how many you watch.\n\nThe epoll_event you register carries a data field. Instead of the fd, store a pointer to your connection struct in data.ptr, so each event leads straight to its state. One trap: epoll tracks the underlying open file, not the number. Closing a descriptor only removes it from epoll if no duplicate (from dup or fork) still refers to it, so call EPOLL_CTL_DEL first if in doubt.",
        visual: {
          type: "flow",
          title: "How a packet wakes epoll_wait",
          steps: [
            { label: "Packet arrives", detail: "NIC and TCP stack queue the data" },
            { label: "Socket wait queue", detail: "The stack wakes everyone waiting" },
            { label: "epoll callback", detail: "Puts the socket on the ready list" },
            { label: "epoll_wait returns", detail: "Copies only ready events to you" },
            { label: "You read", detail: "Using data.ptr to find the connection" },
          ],
        },
      },
      {
        heading: "Level-triggered vs edge-triggered",
        body: "By default epoll is level-triggered, like poll: as long as a socket has unread data, every epoll_wait reports it. If you read only part of the data, you are told again next time. This is forgiving and works with blocking or non-blocking sockets.\n\nWith EPOLLET (edge-triggered), you are told only when the state changes, for example when new data arrives in an empty buffer. If you read half and return, no new event comes until more data arrives, which may be never. So with EPOLLET you must use non-blocking sockets and read (or accept, or write) in a loop until EAGAIN. In return, a busy socket does not generate repeated events, which saves some wakeups.\n\nTwo more flags help with threads. EPOLLONESHOT disables a descriptor after one event until you re-arm it with EPOLL_CTL_MOD, so two threads never handle the same connection at once. EPOLLEXCLUSIVE (Linux 4.5) wakes only one of several epoll instances waiting on the same listening socket, avoiding a thundering herd.",
        visual: {
          type: "compare",
          title: "Level- vs edge-triggered epoll",
          columns: [
            { title: "Level-triggered (default)", points: ["Reports while data remains", "Partial reads are safe", "Blocking sockets work", "More repeated events"] },
            { title: "Edge-triggered (EPOLLET)", points: ["Reports only on change", "Must drain until EAGAIN", "Non-blocking sockets required", "Fewer wakeups when busy"] },
          ],
        },
      },
      {
        heading: "Benchmarking the three fairly",
        body: "The difference between select, poll and epoll only shows with many connections of which few are active. With 10 busy sockets, all three perform about the same, and select or poll can even win because they need no setup calls.\n\nA fair test opens a large number of idle connections (1,000, then 10,000), keeps a small fixed number busy with request-response traffic, and measures requests per second and CPU time of the server for each method. First raise the descriptor limit with ulimit -n, and remember select cannot go past 1024 at all. Measure with perf stat or /usr/bin/time -v for CPU time, and strace -c to count and time system calls.\n\nExpect poll's cost per call to grow in step with the number of idle connections, while epoll stays flat. That flat line is why nginx, Redis, Node.js and every high-connection Linux server uses epoll.",
        bullets: ["ulimit -n 65536 before opening many connections", "Vary idle connections, keep active ones fixed", "strace -c -p PID shows time spent per system call"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Registering once, then waiting many times",
        actors: ["Server", "epoll instance", "Client socket"],
        messages: [
          { from: 0, to: 1, label: "epoll_create1" },
          { from: 0, to: 1, label: "epoll_ctl ADD fd, EPOLLIN" },
          { from: 0, to: 1, label: "epoll_wait (sleeps)" },
          { from: 2, to: 1, label: "data arrives: fd joins ready list" },
          { from: 1, to: 0, label: "returns 1 event for fd" },
          { from: 0, to: 2, label: "read the data" },
          { from: 0, to: 1, label: "epoll_wait again: no re-registration" },
        ],
      },
    ],
    examples: [
      {
        title: "A poll-based echo server for many clients",
        explanation: "One thread serves many clients with poll. Step 1: slot 0 of the array is the listening socket; the other slots hold clients, with fd -1 meaning free. Step 2: poll waits for any of them. Step 3: if the listener is readable, accept and put the new client in a free slot (or close it if the table is full). Step 4: for each readable client, read once and echo; on 0 or an error, close it and free the slot. Partial sends are ignored here to keep it short; the event-loop topic handles them.",
        code: {
          lang: "c",
          code: String.raw`struct pollfd p[256] = { [0] = { .fd = lfd, .events = POLLIN } };
for (int i = 1; i < 256; i++) p[i].fd = -1;
for (;;) {
  if (poll(p, 256, -1) < 0) { if (errno == EINTR) continue; perror("poll"); break; }
  if (p[0].revents & POLLIN) {
    int c = accept(lfd, NULL, NULL), i = 1;
    while (c >= 0 && i < 256 && p[i].fd != -1) i++;
    if (c >= 0) { if (i < 256) p[i] = (struct pollfd){ .fd = c, .events = POLLIN }; else close(c); }
  }
  for (int i = 1; i < 256; i++) if (p[i].fd >= 0 && p[i].revents & (POLLIN | POLLHUP | POLLERR)) {
    char buf[4096]; ssize_t n = recv(p[i].fd, buf, sizeof buf, 0);
    if (n > 0) send(p[i].fd, buf, n, MSG_NOSIGNAL); else { close(p[i].fd); p[i].fd = -1; }
  }
}`,
        },
      },
      {
        title: "Edge-triggered epoll with per-connection state",
        explanation: "Each client gets a struct conn, and epoll hands it back through data.ptr. Step 1: register the non-blocking socket with EPOLLIN | EPOLLET | EPOLLRDHUP and the struct pointer. Step 2: on an event, take the struct from data.ptr. Step 3: because the mode is edge-triggered, read in a loop until EAGAIN; stopping early would lose the notification. Step 4: on 0 (peer closed) or a real error, remove it from epoll, close it and free the struct. EPOLLRDHUP alone is not a reason to close at once, because unread data may still be waiting; the read loop reaches 0 after it.",
        code: {
          lang: "c",
          code: String.raw`struct conn { int fd; char in[4096]; size_t len; };
/* when accepting (c was created with SOCK_NONBLOCK): */
struct conn *k = calloc(1, sizeof *k); k->fd = c;
struct epoll_event ev = { .events = EPOLLIN | EPOLLET | EPOLLRDHUP, .data.ptr = k };
if (epoll_ctl(ep, EPOLL_CTL_ADD, c, &ev) < 0) { perror("epoll_ctl"); close(c); free(k); }
/* when an event arrives: */
struct conn *k = evs[i].data.ptr;
for (;;) {
  ssize_t n = read(k->fd, k->in + k->len, sizeof k->in - k->len);
  if (n > 0) { k->len += n; if (handle_lines(k) == 0) continue; }   /* -1: bad input, close */
  if (n < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) break;   /* drained */
  if (n < 0 && errno == EINTR) continue;
  epoll_ctl(ep, EPOLL_CTL_DEL, k->fd, NULL); close(k->fd); free(k); break;  /* EOF, error or bad input */
}`,
        },
      },
    ],
    cheatSheet: [
      "select: fds below 1024 only; rebuild sets and timeout every call",
      "poll(fds, n, timeout_ms): -1 waits forever, 0 just checks",
      "Check POLLERR, POLLHUP and POLLNVAL in revents even if not requested",
      "epoll_create1(EPOLL_CLOEXEC); epoll_ctl ADD once; epoll_wait in the loop",
      "Store a struct pointer in ev.data.ptr instead of the bare fd",
      "EPOLLET needs non-blocking fds and loops until EAGAIN",
      "EPOLLONESHOT + EPOLL_CTL_MOD to re-arm: one thread per event",
      "Raise the fd limit with ulimit -n or LimitNOFILE= in systemd",
    ],
    quiz: [
      {
        q: "A select-based server crashes randomly once it has about 1000 clients. What is the likely cause?",
        options: ["The kernel limits sockets to 1000", "select returns EAGAIN", "FD_SET with a descriptor of 1024 or more writes past the fd_set", "poll is called by mistake"],
        answer: 2,
        why: "fd_set is a fixed 1024-bit bitmap, so larger descriptors corrupt memory.",
      },
      {
        q: "Why is epoll_wait cheap even with 50,000 idle connections?",
        options: ["It only returns sockets on the ready list, which callbacks fill when data arrives", "It samples a random subset of sockets", "It uses a faster CPU instruction", "It skips sockets above 1024"],
        answer: 0,
        why: "Readiness is pushed to a ready list as it happens, so idle sockets cost nothing per call.",
      },
      {
        q: "With EPOLLET, a handler reads 100 of the 300 waiting bytes and returns. What happens next?",
        options: ["epoll reports it again immediately", "The remaining bytes are dropped", "The socket is closed", "No new event comes until more data arrives, so 200 bytes may sit unread"],
        answer: 3,
        why: "Edge-triggered mode only signals changes, so you must drain the socket until EAGAIN.",
      },
      {
        q: "What does POLLNVAL in revents usually mean?",
        options: ["The peer sent invalid data", "The descriptor is not open, a bookkeeping bug", "The socket buffer is full", "A signal interrupted poll"],
        answer: 1,
        why: "POLLNVAL means the fd in that entry is not an open descriptor.",
      },
      {
        q: "Two threads share one epoll instance. How do you stop both handling the same connection at once?",
        options: ["Use select instead", "Register the fd twice", "Use EPOLLONESHOT and re-arm with EPOLL_CTL_MOD after handling", "Use level-triggered mode"],
        answer: 2,
        why: "EPOLLONESHOT disables the fd after one event, so only one thread gets it until it is re-armed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a program that uses poll to wait on standard input and a 3-second timeout: print what you type, or \"tick\" when 3 seconds pass with no input.",
        hint: "One pollfd for fd 0 with POLLIN; poll returns 0 on timeout.",
        solution: String.raw`struct pollfd p = { .fd = 0, .events = POLLIN };
for (;;) {
  int r = poll(&p, 1, 3000);
  if (r < 0) { if (errno == EINTR) continue; perror("poll"); return 1; }
  if (r == 0) { puts("tick"); continue; }
  char buf[256]; ssize_t n = read(0, buf, sizeof buf);
  if (n <= 0) break;                        /* Ctrl+D ends */
  printf("got %.*s", (int)n, buf);
}`,
      },
      {
        level: "medium",
        task: "Turn the explainer's epoll loop into a working echo server: error checks, non-blocking client sockets, level-triggered mode, EPOLL_CTL_DEL and close on disconnect.",
        hint: "handle_client reads once and echoes. On 0 or an error other than EAGAIN, remove and close.",
        solution: String.raw`int handle_client(int ep, int fd) {
  char buf[4096]; ssize_t n = read(fd, buf, sizeof buf);
  if (n > 0) { send(fd, buf, n, MSG_NOSIGNAL); return 1; }
  if (n < 0 && (errno == EAGAIN || errno == EINTR)) return 1;
  epoll_ctl(ep, EPOLL_CTL_DEL, fd, NULL);
  close(fd);
  return 0;
}
/* main loop: n = epoll_wait(ep, evs, 64, -1); if (n < 0 && errno == EINTR) continue;
   listener: c = accept4(lfd, NULL, NULL, SOCK_NONBLOCK | SOCK_CLOEXEC); check c >= 0 */`,
      },
      {
        level: "hard",
        task: "Benchmark poll against epoll: open 5,000 idle connections to each server, keep 10 clients doing echo round trips, and compare the server's CPU time over 30 seconds.",
        hint: "Raise ulimit -n on both sides. Open idle connections with a small script, then measure the server with perf stat or by reading its CPU time.",
        solution: String.raw`ulimit -n 20000
./server_poll & S=$!          # then the same steps with ./server_epoll
python3 -c 'import socket,time; c=[socket.create_connection(("127.0.0.1",7000)) for _ in range(5000)]; time.sleep(60)' &
sleep 5
perf stat -p $S -- sleep 30 &        # server CPU while the load runs
./echo_load --clients 10 --seconds 30     # your 10-client round-trip tester
# expect: poll burns more CPU per request as idle connections grow; epoll stays flat`,
      },
    ],
    faq: [
      { q: "Should I still use select in new code?", a: "Only for small programs with a few low-numbered descriptors. Use poll for portable code and epoll for Linux servers with many connections." },
      { q: "Does epoll work with regular files?", a: "No. epoll_ctl returns EPERM for regular files, because they are always considered ready. Disk reads are handled with threads or io_uring instead." },
      { q: "What is the difference between epoll and io_uring?", a: "epoll tells you when a socket is ready so you can then call read or write. io_uring lets you submit the reads and writes themselves and get completions later, which also works for files and saves system calls." },
      { q: "Is epoll available on macOS?", a: "No, epoll is Linux-only. macOS and the BSDs use kqueue; libraries like libuv and libevent hide the difference." },
    ],
  },

  "lsp-networking/event-loops": {
    plain: [
      "An event loop is one worker doing many small jobs in turns. It asks the kernel which connections are ready, handles each ready one for a moment, and goes back to asking. As long as every job is short, thousands of clients feel served at the same time.",
      "The golden rule: never wait inside a handler. If a handler blocks on a slow client, the whole loop stops and every other client waits. So sockets are switched to non-blocking mode, where a read or write that cannot happen right now returns at once with the error EAGAIN instead of waiting.",
      "Because a handler cannot wait, it must remember where it left off. Each connection gets its own little record: bytes received so far, bytes still to send, and what state the conversation is in.",
      "This is how nginx, Redis and Node.js handle huge numbers of connections with very few threads. The price is code that is split into small steps instead of one simple top-to-bottom function.",
    ],
    deepDive: [
      {
        heading: "Non-blocking mode in practice",
        body: "Set O_NONBLOCK on a descriptor with fcntl(fd, F_SETFL, flags | O_NONBLOCK), after reading the current flags with F_GETFL. Better, create sockets non-blocking from the start: socket(..., SOCK_STREAM | SOCK_NONBLOCK, 0) and accept4(lfd, NULL, NULL, SOCK_NONBLOCK). The listening socket should be non-blocking too, so that if another process or thread already took the connection, accept returns EAGAIN instead of hanging.\n\nIn non-blocking mode, read and recv return -1 with EAGAIN (on Linux the same value as EWOULDBLOCK) when no data is waiting. Writes return a short count, or EAGAIN when the send buffer is full. connect returns -1 with EINPROGRESS; wait until the socket is writable, then read the result with getsockopt(fd, SOL_SOCKET, SO_ERROR, ...).\n\nOne gap: O_NONBLOCK has no effect on regular files. A read from a slow disk still blocks the loop, so servers use a thread pool or io_uring for file I/O.",
        bullets: ["accept4(..., SOCK_NONBLOCK | SOCK_CLOEXEC) saves two fcntl calls", "EAGAIN means not now, not failure", "Non-blocking connect: EINPROGRESS, then check SO_ERROR"],
      },
      {
        heading: "The write path and back-pressure",
        body: "Writing seems easy until a client reads slowly. The kernel send buffer fills, and write starts returning short counts or EAGAIN. The loop must not wait, so it copies the unsent bytes into the connection's output buffer and asks epoll for EPOLLOUT. When the socket becomes writable, the loop sends more. Once the output buffer is empty, it removes EPOLLOUT again; leaving it on makes epoll report the socket as writable on every turn, and the loop spins at 100% CPU.\n\nNow the slow-reader problem. If a client keeps sending requests but never reads the replies, its output buffer grows without end. Apply back-pressure: when the output buffer passes a limit (say 1 MiB), stop reading from that client (remove EPOLLIN) until the buffer drains. If it never drains, close the connection. Redis, for example, disconnects clients whose output buffers exceed configured limits.",
        visual: {
          type: "flow",
          title: "Sending a reply without blocking",
          steps: [
            { label: "Try write now", detail: "Usually the whole reply fits" },
            { label: "Short or EAGAIN", detail: "Append the rest to the output buffer" },
            { label: "Enable EPOLLOUT", detail: "Ask to hear when the socket can take more" },
            { label: "Writable event", detail: "Write from the buffer, drop what was sent" },
            { label: "Buffer empty", detail: "Disable EPOLLOUT so the loop does not spin" },
          ],
        },
      },
      {
        heading: "Per-connection buffers and state",
        body: "Each connection carries a struct: the descriptor, an input buffer with its fill level, an output buffer with how much is already sent, a protocol state (reading a header, reading a body, closing), and the time of the last activity for timeouts.\n\nThe input side works like this: append whatever read returns, then parse as many complete messages as the buffer holds, then move any partial message to the front (memmove) and keep it for next time. Parsing must never assume a message arrived in one read. The output side appends replies and tracks an offset of what has been sent.\n\nPut hard limits on both buffers. Without them a client can send a giant header or never read, and use up the server's memory. Fixed-size buffers are simplest; growable ones need an upper bound.",
        bullets: ["struct conn { int fd; char in[8192]; size_t in_len; char *out; size_t out_len, out_sent; time_t last; }", "Parse in a loop: there may be several messages in one read", "Close connections that exceed buffer limits"],
      },
      {
        heading: "Timers inside the loop",
        body: "Servers need time-based work too: close idle clients after 60 seconds, retry an upstream, flush stats every 10 seconds. A loop cannot sleep for these, so it folds them into the wait. Keep timers sorted by deadline, for example in a min-heap or a timer wheel. Before each epoll_wait, compute how many milliseconds remain until the nearest deadline and pass that as the timeout (or -1 if there are none). After epoll_wait returns, whether because of events or the timeout, run every timer whose deadline has passed.\n\nUse CLOCK_MONOTONIC for these deadlines, not the wall clock, so a clock change cannot fire every timer at once. Another way is timerfd, which turns a timer into a descriptor that epoll watches like a socket; the next module covers it. For idle timeouts with thousands of connections, a common trick is to keep connections in a list ordered by last activity and only check the oldest ones.",
      },
      {
        heading: "Thread-per-connection or event loop?",
        body: "Thread-per-connection is the simplest model: each client gets a thread that runs straight-line blocking code. It works well for hundreds of connections. Its costs grow with scale: each thread needs a stack (virtual memory and some real memory), the scheduler must switch between thousands of threads, and shared data needs locks.\n\nAn event loop keeps each connection as a small struct, so 10,000 idle clients cost little memory and no context switches. The price is that logic is cut into callbacks and state machines, and one slow handler, CPU-heavy job or blocking call stalls everyone on that loop.\n\nReal servers combine both. nginx runs one event loop per worker process, one per core. Memcached and many proxies run one loop per thread. Node.js runs JavaScript on one loop and sends file I/O and DNS lookups to a small thread pool in libuv. The rule: loops for waiting, threads for computing.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Thread per connection vs event loop",
        columns: [
          { title: "Thread per connection", points: ["Simple blocking code", "A stack per client", "Locks for shared data", "Good up to hundreds of clients"] },
          { title: "Event loop", points: ["Small struct per client", "No context switch per client", "Handlers must never block", "Scales to tens of thousands"] },
          { title: "Loop per core + pool", points: ["One loop per CPU core", "Thread pool for CPU and disk work", "Used by nginx and Node.js style servers", "Best of both, more design work"] },
        ],
      },
    ],
    examples: [
      {
        title: "Queueing output and toggling EPOLLOUT",
        explanation: "conn_send is called when a handler has a reply. Step 1: if nothing is queued, try to write directly; usually everything goes out at once. Step 2: anything left (short write or EAGAIN) is appended to the output buffer, with a limit for back-pressure. Step 3: if data is now pending, switch the epoll registration to watch EPOLLOUT as well. on_writable runs on EPOLLOUT: it sends from the buffer and, once empty, switches back to EPOLLIN only.",
        code: {
          lang: "c",
          code: String.raw`int conn_send(struct conn *c, const char *p, size_t n) {
  if (c->out_len == 0) {                                    /* nothing queued: try now */
    ssize_t w = send(c->fd, p, n, MSG_NOSIGNAL);
    if (w < 0 && errno != EAGAIN && errno != EWOULDBLOCK) return -1;
    if (w > 0) { p += w; n -= (size_t)w; }
  }
  if (n == 0) return 0;
  if (c->out_len + n > sizeof c->out) return -1;            /* too slow: caller closes */
  memcpy(c->out + c->out_len, p, n); c->out_len += n;
  struct epoll_event ev = { .events = EPOLLIN | EPOLLOUT, .data.ptr = c };
  return epoll_ctl(c->ep, EPOLL_CTL_MOD, c->fd, &ev);
}
/* on_writable: send from c->out, memmove the rest down;
   when c->out_len == 0, EPOLL_CTL_MOD back to EPOLLIN only */`,
        },
      },
      {
        title: "Parsing complete lines from a partial buffer",
        explanation: "Bytes arrive in random chunks: \"GET a\\nGE\" then \"T b\\n\". Step 1: after each read, scan the input buffer for newlines. Step 2: hand every complete line to the handler. Step 3: move the unfinished tail (\"GE\") to the front of the buffer and keep it. Step 4: if the buffer is full and still has no newline, the line is too long, so report an error and let the caller close the connection.",
        code: {
          lang: "c",
          code: String.raw`int handle_lines(struct conn *c) {       /* -1 = protocol error */
  size_t start = 0;
  for (size_t i = 0; i < c->in_len; i++) {
    if (c->in[i] != '\n') continue;
    c->in[i] = '\0';
    if (on_line(c, c->in + start) < 0) return -1;      /* one complete line */
    start = i + 1;
  }
  memmove(c->in, c->in + start, c->in_len - start);    /* keep the partial tail */
  c->in_len -= start;
  if (c->in_len == sizeof c->in) return -1;            /* full, no newline: too long */
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "fcntl(fd, F_SETFL, fcntl(fd, F_GETFL) | O_NONBLOCK) makes a fd non-blocking",
      "accept4(lfd, NULL, NULL, SOCK_NONBLOCK | SOCK_CLOEXEC) for new clients",
      "EAGAIN == EWOULDBLOCK on Linux: stop and wait for the next event",
      "Enable EPOLLOUT only while output is queued, or the loop spins",
      "Cap input and output buffers per connection; close offenders",
      "epoll_wait timeout = ms until the nearest timer, or -1 if none",
      "O_NONBLOCK does nothing for regular files: use a thread pool or io_uring",
      "Never call sleep, blocking DNS or heavy CPU work inside a handler",
    ],
    quiz: [
      {
        q: "A non-blocking read returns -1 with errno EAGAIN. What should the handler do?",
        options: ["Close the connection", "Retry read in a tight loop", "Return to the event loop and wait for the next readiness event", "Switch the socket back to blocking mode"],
        answer: 2,
        why: "EAGAIN just means no data right now; the loop will report the socket again when data arrives.",
      },
      {
        q: "A server's CPU sits at 100% even with idle clients. Which mistake fits best?",
        options: ["EPOLLOUT left enabled after the output buffer emptied", "Using SOCK_NONBLOCK", "Using a 4 KiB input buffer", "Calling epoll_create1 once"],
        answer: 0,
        why: "An empty send buffer is always writable, so epoll keeps reporting it on every turn.",
      },
      {
        q: "A client sends requests but never reads replies. What protects the server?",
        options: ["A bigger listen backlog", "TCP_NODELAY", "Level-triggered epoll", "Back-pressure: cap the output buffer, stop reading from it, then close it"],
        answer: 3,
        why: "Without a cap, the unsent replies grow in memory without limit.",
      },
      {
        q: "Why is calling getaddrinfo inside an event-loop handler a problem?",
        options: ["It is not thread-safe", "It may block for seconds on DNS, stalling every connection on that loop", "It only works with blocking sockets", "It closes the epoll descriptor"],
        answer: 1,
        why: "Any blocking call freezes the single loop thread; run lookups in a worker thread.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make a socket non-blocking, call read on it with no data available, and print errno's name to see EAGAIN.",
        hint: "A fresh pipe works too: pipe2(p, O_NONBLOCK), then read from p[0].",
        solution: String.raw`#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
int main(void) {
  int p[2]; char c;
  if (pipe2(p, O_NONBLOCK) < 0) { perror("pipe2"); return 1; }
  if (read(p[0], &c, 1) < 0 && errno == EAGAIN) puts("EAGAIN: nothing to read yet");
  return 0;
}`,
      },
      {
        level: "medium",
        task: "Write on_writable for the conn_send example: send as much of the output buffer as possible, keep the rest, and switch back to EPOLLIN only when the buffer is empty.",
        hint: "Loop on send until the buffer is empty or EAGAIN; memmove the unsent part to the front.",
        solution: String.raw`int on_writable(struct conn *c) {
  size_t off = 0;
  while (off < c->out_len) {
    ssize_t w = send(c->fd, c->out + off, c->out_len - off, MSG_NOSIGNAL);
    if (w > 0) { off += (size_t)w; continue; }
    if (w < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) break;
    if (w < 0 && errno == EINTR) continue;
    return -1;                                   /* EPIPE etc.: close */
  }
  memmove(c->out, c->out + off, c->out_len - off); c->out_len -= off;
  if (c->out_len) return 0;
  struct epoll_event ev = { .events = EPOLLIN, .data.ptr = c };
  return epoll_ctl(c->ep, EPOLL_CTL_MOD, c->fd, &ev);
}`,
      },
      {
        level: "hard",
        task: "Add idle timeouts: close any connection that sent nothing for 30 seconds. Use CLOCK_MONOTONIC and pass the right timeout to epoll_wait.",
        hint: "Keep connections in a list ordered by last activity: move a connection to the tail on every read. The head is always the oldest.",
        solution: String.raw`static long now_ms(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t);
  return t.tv_sec * 1000L + t.tv_nsec / 1000000; }
for (;;) {
  struct conn *old = list_head();                       /* least recently active */
  int timeout = old ? (int)(old->last_ms + 30000 - now_ms()) : -1;
  if (old && timeout < 0) timeout = 0;
  int n = epoll_wait(ep, evs, 64, timeout);
  /* ... handle events; on each read: c->last_ms = now_ms(); list_move_to_tail(c); */
  while ((old = list_head()) && now_ms() - old->last_ms >= 30000) conn_close(old);
}`,
      },
    ],
    faq: [
      { q: "Is an event loop always faster than threads?", a: "No. For a few hundred connections, thread-per-connection is often just as fast and much simpler. Event loops win when you have many mostly idle connections and memory or context switches become the limit." },
      { q: "What is the difference between EAGAIN and EWOULDBLOCK?", a: "On Linux they are the same number. POSIX allows them to differ, so portable code checks both." },
      { q: "How does Node.js read files without blocking its loop?", a: "File operations are sent to libuv's thread pool, which blocks on disk in the background and reports the result back to the loop." },
      { q: "Can I use several threads with one event loop?", a: "Usually you run one loop per thread, each with its own epoll instance and its own connections. Sharing one epoll between threads is possible with EPOLLONESHOT or EPOLLEXCLUSIVE but harder to get right." },
    ],
  },
};

export default extra;
