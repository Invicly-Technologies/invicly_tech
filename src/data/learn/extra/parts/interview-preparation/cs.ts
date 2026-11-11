import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cs/os": {
    plain: [
      "An operating system (OS) is the program that runs all other programs. Your laptop may have hundreds of programs open, but only a few CPU cores. The OS gives each program a short turn on a core, many times per second, so they all seem to run at once.",
      "A process is one running program with its own private memory. A thread is a worker inside a process. All threads of one process share the same memory, so they can work together quickly, but they can also step on each other's data if nobody controls access.",
      "Memory works in a clever way. Each process thinks it owns a huge, clean block of memory starting at address zero. In reality, the OS and the hardware translate those fake addresses into real RAM, one small page at a time. This is called virtual memory.",
      "A deadlock is when two or more threads wait for each other forever. Thread A holds lock 1 and wants lock 2; thread B holds lock 2 and wants lock 1. Neither will let go. In interviews, you should explain why it happens and one concrete way to stop it.",
    ],
    deepDive: [
      {
        heading: "Process states and what a context switch costs",
        body: "A process or thread moves between a few states. It is ready when it could run but is waiting for a CPU, running while on a core, and blocked (also called waiting) while it waits for disk, network or a lock. When the timer interrupt fires or the task blocks, the kernel saves its registers and picks another ready task. That is a context switch.\n\nSwitching between threads of the same process is cheaper because the page tables stay the same. Switching between processes means loading a new address space, and the TLB (the cache of address translations) may need flushing, so the next memory accesses are slower. A switch costs roughly a few microseconds, but the cache misses after it often cost more than the switch itself.",
        bullets: ["Ready: can run, waiting for a core", "Running: on a CPU right now", "Blocked: waiting for I/O or a lock", "vmstat 1 shows context switches per second in the cs column"],
        visual: {
          type: "cycle",
          title: "Life of a thread on the CPU",
          steps: [
            { label: "Ready", detail: "Waiting in the run queue" },
            { label: "Running", detail: "Scheduler gives it a core" },
            { label: "Blocked", detail: "Waits for disk, network or a lock" },
            { label: "Woken up", detail: "I/O done or lock free, back to ready" },
          ],
        },
      },
      {
        heading: "CPU scheduling algorithms you should name",
        body: "First come, first served (FCFS) runs tasks in arrival order; one long task makes everyone wait (the convoy effect). Shortest job first (SJF) gives the lowest average waiting time but needs to know job lengths, and long jobs can starve. Round robin gives each task a fixed time slice (quantum) in turn; a small quantum feels responsive but wastes time on switches. Priority scheduling runs high priority first and uses aging (slowly raising the priority of waiting tasks) to prevent starvation.\n\nReal systems mix these ideas. Linux used the Completely Fair Scheduler (CFS) for years, which picks the task that has had the least CPU time. Since kernel 6.6 the default is EEVDF, which also tracks fairness but adds deadlines for better latency. You do not need the formulas; know the trade-off between throughput, fairness and response time.",
        bullets: ["FCFS: simple, convoy effect", "SJF: best average wait, starvation risk", "Round robin: fair and responsive, switch overhead", "Priority plus aging: avoids starvation"],
      },
      {
        heading: "Virtual memory, paging and page faults",
        body: "Memory is split into pages, usually 4 KB on x86-64. Each process has a page table that maps its virtual pages to physical frames in RAM. The MMU (memory management unit) does this lookup in hardware for every access, and the TLB caches recent lookups so most accesses are fast.\n\nIf a page is not in RAM, the CPU raises a page fault and the kernel handles it. A minor fault just maps a page that is already in memory (for example a shared library). A major fault must read the page from disk or swap, which is thousands of times slower. When the working set (pages a program actively uses) is larger than RAM, the system spends its time moving pages in and out. That is thrashing.\n\nVirtual memory is the mapping idea; swap is just the disk area used to hold pages that do not fit in RAM.",
        visual: {
          type: "flow",
          title: "One memory access, step by step",
          steps: [
            { label: "Virtual address", detail: "Program reads address 0x7ff..." },
            { label: "TLB lookup", detail: "Hit: physical address in about one cycle" },
            { label: "Page table walk", detail: "Miss: MMU reads the page table" },
            { label: "Page fault?", detail: "Page not present: kernel takes over" },
            { label: "Load and retry", detail: "Map or read the page, rerun the instruction" },
          ],
        },
      },
      {
        heading: "Mutexes, semaphores and condition variables",
        body: "A mutex is a lock with one owner: lock it, touch the shared data, unlock it. Only the thread that locked it should unlock it. A counting semaphore holds a number N; acquire takes one unit and blocks when none are left, release gives one back. Use it to limit things, such as at most 10 database connections. A binary semaphore (N = 1) looks like a mutex but has no owner, so any thread may release it, which makes it useful for signalling.\n\nA condition variable lets a thread sleep until some condition becomes true, for example a queue is no longer empty. The classic producer-consumer answer uses a mutex plus two condition variables (not full, not empty), or two semaphores plus a mutex. Always re-check the condition in a while loop after waking, because wakeups can be spurious.",
        bullets: ["Mutex: one owner, protects a critical section", "Semaphore: counter, limits concurrency to N", "Condition variable: wait until a condition holds", "Spinlock: busy-waits, only for very short critical sections"],
      },
      {
        heading: "Deadlock: prevention, avoidance and detection",
        body: "There are three ways to deal with deadlock. Prevention breaks one of the four conditions by design: take locks in one global order, or acquire all locks at once. Avoidance checks each request before granting it; the Banker's algorithm only grants a request if the system stays in a safe state, but it needs to know maximum needs up front, so it is rare in practice. Detection lets deadlocks happen, finds cycles in a wait-for graph, then kills or rolls back a victim. Databases do exactly this: PostgreSQL checks for deadlocks after deadlock_timeout (1 second by default) and aborts one transaction.\n\nAlso know livelock (threads keep reacting to each other and make no progress, like two people stepping aside in a corridor) and starvation (one thread never gets the resource).",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What a process looks like in memory",
        layers: [
          { label: "Kernel space", detail: "Mapped but not accessible from user code" },
          { label: "Stack", detail: "One per thread, grows down, local variables" },
          { label: "Memory-mapped area", detail: "Shared libraries, mmap'd files" },
          { label: "Heap", detail: "malloc or new, grows up, shared by threads" },
          { label: "Data and BSS", detail: "Global and static variables" },
          { label: "Text", detail: "Program code, read-only" },
        ],
      },
    ],
    examples: [
      {
        title: "Answering: processes or threads for a web server?",
        explanation: "Step 1: name the trade-off. Threads share memory, so they are cheap and can share a cache, but one bad pointer or unhandled crash can take down all of them. Processes are isolated but cost more memory and need IPC (inter-process communication) to share data. Step 2: give real examples. Nginx and PostgreSQL use multiple processes, so a crash in one worker does not kill the server. Java servers like Tomcat use a thread pool inside one JVM. Step 3: mention the language. In CPython, the GIL (global interpreter lock) lets only one thread run Python code at a time, so CPU-heavy work uses multiprocessing, while I/O-heavy work is fine with threads or asyncio.",
      },
      {
        title: "Producer-consumer with a bounded buffer",
        explanation: "An interviewer asks you to explain producer-consumer. A producer adds jobs to a queue of size 3; a consumer takes them out. Step 1: the producer must wait when the queue is full, and the consumer must wait when it is empty. Step 2: one semaphore counts free slots, one counts filled slots, and a lock protects the list itself. Step 3: each side waits on one semaphore and signals the other. Python's queue.Queue already does this for you, but showing the parts proves you understand it.",
        code: {
          lang: "python",
          code: "import threading\nbuf, lock = [], threading.Lock()\nfree = threading.Semaphore(3)   # empty slots\nfull = threading.Semaphore(0)   # filled slots\ndef produce(item):\n    free.acquire()              # wait for a free slot\n    with lock:\n        buf.append(item)\n    full.release()              # one more item ready\ndef consume():\n    full.acquire()              # wait for an item\n    with lock:\n        item = buf.pop(0)\n    free.release()\n    return item",
        },
      },
    ],
    cheatSheet: [
      "Process = own address space; thread = shares its process's memory, has its own stack and registers",
      "Thread switches are cheaper: no page table change, fewer TLB and cache misses",
      "Round robin: fair, responsive; small quantum means more context-switch overhead",
      "Page size is usually 4 KB; the TLB caches virtual-to-physical translations",
      "Major page fault reads from disk; thrashing = working set bigger than RAM",
      "Mutex has one owner; counting semaphore allows N holders",
      "Prevent deadlock with a global lock order or tryLock with timeout and back off",
      "Deadlock = nobody moves; livelock = everyone moves, nobody progresses; starvation = one never runs",
    ],
    quiz: [
      {
        q: "Which scheduling algorithm gives the lowest average waiting time if job lengths are known?",
        options: ["First come, first served", "Round robin", "Shortest job first", "Random selection"],
        answer: 2,
        why: "Running short jobs first means fewer jobs wait behind long ones, which minimises average waiting time.",
      },
      {
        q: "What is thrashing?",
        options: ["The system spends most time swapping pages because RAM is too small for the working set", "A thread spinning on a lock", "Two threads holding each other's locks", "The scheduler switching too rarely"],
        answer: 0,
        why: "When active pages do not fit in RAM, major page faults dominate and useful work almost stops.",
      },
      {
        q: "Which statement about a counting semaphore initialised to 5 is correct?",
        options: ["Only the thread that acquired it may release it", "It allows up to 5 holders at the same time", "It is identical to a mutex", "It prevents deadlock automatically"],
        answer: 1,
        why: "Each acquire takes one of the 5 units, and the sixth caller blocks until someone releases.",
      },
      {
        q: "Two threads each lock A then B. A third thread locks B then A. Which deadlock condition can you remove by fixing the third thread?",
        options: ["Mutual exclusion", "No preemption", "Hold and wait", "Circular wait"],
        answer: 3,
        why: "If every thread takes A before B, no cycle of waiting can form.",
      },
      {
        q: "Why is switching between two threads of the same process usually cheaper than between two processes?",
        options: ["Threads do not have registers", "The address space and page tables stay the same", "Threads never block", "The kernel is not involved"],
        answer: 1,
        why: "No new page table is loaded, so TLB and cache state remain mostly useful.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Explain, in three sentences, the difference between a process and a thread, with one real program as an example of each.",
        hint: "Mention memory sharing, isolation and cost.",
        solution: "A process is a running program with its own address space, so a crash stays inside it.\nA thread runs inside a process and shares its heap, so it is cheaper to create but needs locks.\nExample: each Chrome tab is a separate process; a Java web server handles requests on threads in one JVM.",
      },
      {
        level: "medium",
        task: "Three tasks arrive at time 0 with burst times 6, 2 and 4 ms (in that order). Compute the average waiting time for FCFS and for SJF.",
        hint: "Waiting time = start time minus arrival time when there is no preemption.",
        solution: "FCFS order 6, 2, 4: waits 0, 6, 8 -> average 14/3 = 4.67 ms\nSJF order 2, 4, 6: waits 0, 2, 6 -> average 8/3 = 2.67 ms\nSJF is lower because short jobs no longer wait behind the long one.",
      },
      {
        level: "hard",
        task: "Write a Python function transfer(a, b, amount) for Account objects that each have their own lock, so that two opposite transfers running at once can never deadlock.",
        hint: "Always lock the accounts in the same order, for example by id.",
        solution: "def transfer(a, b, amount):\n    first, second = (a, b) if a.id < b.id else (b, a)\n    with first.lock:\n        with second.lock:\n            if a.balance < amount:\n                raise ValueError(\"insufficient funds\")\n            a.balance -= amount\n            b.balance += amount\n# transfer(x, y) and transfer(y, x) both lock the lower id first,\n# so a circular wait is impossible.",
      },
    ],
    faq: [
      { q: "Is virtual memory the same as swap?", a: "No. Virtual memory is the address translation that gives each process its own address space. Swap is a disk area the OS can use to store pages that do not fit in RAM, and a system can run with virtual memory and no swap at all." },
      { q: "Do Python threads run in parallel?", a: "In standard CPython only one thread runs Python bytecode at a time because of the GIL, so threads help with I/O-bound work but not CPU-bound work. Use multiprocessing for CPU work; Python 3.13 added an optional free-threaded build without the GIL, officially supported since 3.14 but not the default." },
      { q: "What is the difference between a mutex and a binary semaphore?", a: "A mutex has an owner, and only that thread should unlock it. A binary semaphore has no owner, so one thread can signal another by releasing it." },
      { q: "Which OS book should I read for interviews?", a: "OSTEP (Operating Systems: Three Easy Pieces) is free online and covers processes, scheduling, virtual memory and concurrency at exactly the right depth." },
    ],
  },

  "cs/cn": {
    plain: [
      "Computer networks are built in layers. Each layer does one job and trusts the layer below it. IP moves packets from one machine to another. TCP or UDP sits on top and decides how those packets become a conversation. HTTP sits on top of that and says what the conversation means.",
      "TCP is like a phone call. You connect first, both sides confirm, and everything you say arrives in order. If something gets lost, it is sent again. UDP is like sending postcards. Each one goes on its own, with no promise it arrives or arrives in order, but it is quick and light.",
      "DNS is the internet's phone book. People remember names like example.com, but computers need IP addresses. Your computer asks a DNS resolver, which finds the answer and remembers it for a while so the next lookup is instant.",
      "TLS is the lock on HTTPS. It checks that you are really talking to the right server, using a certificate, and then encrypts everything so nobody in the middle can read or change it. Interviewers love the question \"what happens when you type a URL\" because it touches all of these layers.",
    ],
    deepDive: [
      {
        heading: "TCP in more detail: handshake, reliability, closing",
        body: "TCP opens with the three-way handshake: SYN, SYN-ACK, ACK. Each side picks a random starting sequence number, and every byte after that is numbered. The receiver sends ACKs saying \"I have everything up to byte N\". If an ACK does not arrive in time, or three duplicate ACKs arrive, the sender retransmits.\n\nTwo separate controls limit speed. Flow control uses the receive window, so a fast sender cannot overrun a slow receiver. Congestion control protects the network: the sender starts small (slow start), grows its congestion window, and cuts it when it sees loss. Linux uses CUBIC by default; Google's BBR is another option.\n\nClosing uses FIN and ACK from each side (often shown as a four-way close). The side that closes first enters TIME_WAIT for a while so late packets from the old connection are not mistaken for a new one.",
        bullets: ["Sequence numbers give ordering; ACKs give reliability", "Receive window = flow control (protect the receiver)", "Congestion window = congestion control (protect the network)", "ss -tan shows TCP connections and states like ESTAB and TIME-WAIT"],
      },
      {
        heading: "DNS resolution step by step",
        body: "When you look up www.example.com, your machine first checks its own cache and the hosts file. If there is no answer, the stub resolver in your OS asks a recursive resolver, usually from your ISP, your company or a public one like 1.1.1.1 or 8.8.8.8. That resolver does the real work if it has no cached answer.\n\nIt asks a root server, which replies with the servers for .com. It asks a .com TLD server, which replies with the authoritative servers for example.com. It asks the authoritative server, which gives the final record. Every answer carries a TTL (time to live) in seconds, and resolvers cache it for that long. That is why DNS changes do not appear everywhere at once.\n\nDNS normally uses UDP port 53 and switches to TCP for large answers and zone transfers.",
        bullets: ["A = IPv4, AAAA = IPv6, CNAME = alias, MX = mail, NS = name servers, TXT = text", "Lower the TTL before a migration so the switch spreads fast", "dig +trace example.com shows the root, TLD, authoritative chain"],
        visual: {
          type: "sequence",
          title: "A recursive resolver with an empty cache",
          actors: ["Your laptop", "Recursive resolver", "Root and .com servers", "example.com server"],
          messages: [
            { from: 0, to: 1, label: "A record for www.example.com?" },
            { from: 1, to: 2, label: "Ask root, then .com TLD" },
            { from: 2, to: 1, label: "Referral: ask ns1.example.com" },
            { from: 1, to: 3, label: "A record for www.example.com?" },
            { from: 3, to: 1, label: "Answer with TTL 300" },
            { from: 1, to: 0, label: "Answer, cached for 300 s" },
          ],
        },
      },
      {
        heading: "HTTP/1.1, HTTP/2 and HTTP/3",
        body: "HTTP/1.1 is text based and keeps connections open (keep-alive), but each connection handles one request at a time. Browsers worked around this by opening about six connections per host.\n\nHTTP/2 is binary and multiplexes many streams over one TCP connection, with header compression (HPACK). This fixes blocking at the HTTP level, but not at the TCP level: if one TCP packet is lost, every stream waits for the retransmission. That is TCP head-of-line blocking.\n\nHTTP/3 runs over QUIC, which runs on UDP. QUIC builds reliability and TLS 1.3 into the transport and keeps streams independent, so a lost packet only delays its own stream. It also connects faster and survives network changes, such as moving from Wi-Fi to mobile data, because connections are identified by an ID rather than by IP and port.",
        visual: {
          type: "compare",
          title: "HTTP versions side by side",
          columns: [
            { title: "HTTP/1.1", points: ["Text format", "One request at a time per connection", "Browsers open about 6 connections", "Runs over TCP"] },
            { title: "HTTP/2", points: ["Binary frames", "Many streams on one connection", "HPACK header compression", "TCP loss still blocks all streams"] },
            { title: "HTTP/3", points: ["Runs on QUIC over UDP", "Streams independent of each other", "TLS 1.3 built in", "Survives network changes"] },
          ],
        },
      },
      {
        heading: "The TLS 1.3 handshake",
        body: "TLS 1.3 needs only one round trip. The client sends ClientHello with supported cipher suites and a key share (its half of an ECDHE key exchange, usually X25519). The server answers with ServerHello and its own key share. Both sides can now compute the same secret, and everything after this point is encrypted, including the server's certificate.\n\nThe server then sends its certificate chain and a CertificateVerify signature that proves it holds the private key. The client checks that the chain leads to a trusted root CA, that the name matches the domain, and that the certificate has not expired. Both send Finished messages, and application data flows.\n\nBecause the keys come from fresh ephemeral exchanges, TLS 1.3 always has forward secrecy: stealing the server's private key later does not decrypt old traffic. TLS 1.2 needed two round trips and allowed older, weaker options.",
        bullets: ["TLS 1.3: 1 round trip; resumption can use 0-RTT (replay risk)", "SNI in ClientHello tells the server which site you want", "The certificate proves the server's identity, not the user's"],
      },
      {
        heading: "What happens when you type a URL: a strong answer",
        body: "Structure your answer by layer and say you can go deeper anywhere. 1. The browser parses the URL and checks HSTS, its cache and service workers. 2. DNS resolves the name to an IP. 3. TCP handshake to port 443 (or a QUIC handshake for HTTP/3). 4. TLS handshake, certificate check. 5. The browser sends GET / with headers like Host, cookies and Accept-Encoding. 6. On the server side: a load balancer or CDN, then a web server, then the app, which may hit a cache and a database. 7. The response returns with a status, headers and a compressed body. 8. The browser parses HTML, builds the DOM, fetches CSS, JavaScript and images (often in parallel over the same HTTP/2 connection), then lays out and paints the page.\n\nInterviewers often stop you and ask about one step. Pick the area matching the role: DNS and load balancers for DevOps, rendering for frontend, caching and databases for backend.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "The TCP/IP stack for one HTTPS request",
        layers: [
          { label: "Application: HTTP", detail: "GET /index.html, headers, body" },
          { label: "Security: TLS", detail: "Encrypts and authenticates the bytes" },
          { label: "Transport: TCP or UDP", detail: "Ports, ordering, retransmission" },
          { label: "Network: IP", detail: "Source and destination IP, routing" },
          { label: "Link: Ethernet or Wi-Fi", detail: "MAC addresses, one hop at a time" },
        ],
      },
    ],
    examples: [
      {
        title: "A site works by IP but not by name",
        explanation: "A user says curl to the server's IP works, but the domain does not load. Step 1: suspect DNS, since the network path is fine. Step 2: run dig on the name and compare with the expected IP. Step 3: ask the authoritative server directly to see if the record is right at the source. Step 4: if the authoritative answer is correct but your resolver is wrong, it is caching an old answer; check the TTL in the response and wait or flush. Saying this order aloud shows a calm, layer-by-layer method.",
        code: {
          lang: "bash",
          code: "dig +short shop.example.com            # what my resolver says\ndig +short shop.example.com @1.1.1.1   # a different resolver\ndig NS example.com +short              # find the authoritative servers\ndig shop.example.com @ns1.example.com  # ask the source directly\ncurl -v --resolve shop.example.com:443:203.0.113.10 https://shop.example.com/",
        },
      },
      {
        title: "Choosing TCP or UDP for a multiplayer game",
        explanation: "The interviewer asks which transport to use for a real-time game. Step 1: separate the data. Player positions are sent 30 times a second and an old position is useless once a newer one arrives, so retransmitting it only adds lag. Use UDP with a sequence number and drop stale packets. Step 2: chat messages and purchases must arrive exactly once and in order, so use TCP (or a reliable channel built on UDP). Step 3: mention that many games use a library or QUIC that offers both reliable and unreliable channels on UDP. The point is to match the guarantee to the data.",
      },
    ],
    cheatSheet: [
      "TCP handshake: SYN, SYN-ACK, ACK; close with FIN/ACK from each side, then TIME_WAIT",
      "Flow control protects the receiver (window); congestion control protects the network (cwnd)",
      "Well-known ports: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 5432 PostgreSQL, 3306 MySQL",
      "DNS: cache, recursive resolver, root, TLD, authoritative; answers cached for the TTL",
      "HTTP/2 multiplexes over TCP; HTTP/3 uses QUIC over UDP to avoid TCP head-of-line blocking",
      "TLS 1.3 handshake takes 1 round trip and always gives forward secrecy",
      "curl -v shows DNS, connect, TLS and HTTP; dig +trace shows the DNS chain",
    ],
    quiz: [
      {
        q: "Why does HTTP/2 still suffer from head-of-line blocking when a packet is lost?",
        options: ["It sends one request per connection", "TCP delivers bytes in order, so all streams wait for the retransmission", "It uses UDP", "Header compression must be reset"],
        answer: 1,
        why: "All HTTP/2 streams share one TCP byte stream, and TCP will not deliver later bytes until the missing ones arrive.",
      },
      {
        q: "You change a DNS A record, but some users still reach the old server for an hour. What is the most likely reason?",
        options: ["The TCP handshake failed", "TLS certificates take an hour to update", "Resolvers cached the old record for its TTL", "The root servers are slow"],
        answer: 2,
        why: "Resolvers keep an answer until its TTL expires, so lowering the TTL before a change makes it spread faster.",
      },
      {
        q: "What does the TCP receive window control?",
        options: ["How much data the receiver can accept before the sender must wait", "How long TIME_WAIT lasts", "Which port the server listens on", "How many hops a packet may take"],
        answer: 0,
        why: "The receive window is flow control: it stops a fast sender from overrunning the receiver's buffer.",
      },
      {
        q: "In TLS 1.3, what does the server's certificate prove?",
        options: ["The user's identity", "That the connection is fast", "That the site has no malware", "That the server controls the key for that domain name, as vouched for by a CA"],
        answer: 3,
        why: "The client checks the chain to a trusted CA, the name and the signature; it says nothing about the user or the site's safety.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use dig to find the A, AAAA and MX records of a domain you know, and note the TTL of each answer.",
        hint: "Run dig without +short to see the TTL column.",
        solution: "dig example.com A\ndig example.com AAAA\ndig gmail.com MX\n# The second column in the ANSWER SECTION is the TTL in seconds.\n# Run the same query twice: the TTL counts down because the resolver cached it.",
      },
      {
        level: "medium",
        task: "Use curl to measure how long DNS, TCP connect, the TLS handshake and the first byte take for an HTTPS site.",
        hint: "curl -w can print timing variables like time_namelookup.",
        solution: "curl -o /dev/null -s -w 'dns %{time_namelookup}\\nconnect %{time_connect}\\ntls %{time_appconnect}\\nfirst byte %{time_starttransfer}\\ntotal %{time_total}\\n' https://example.com\n# Each value is seconds since the start, so tls minus connect\n# is the TLS handshake time.",
      },
      {
        level: "hard",
        task: "Give a five-minute answer to \"what happens when you type https://shop.example.com and press Enter\", covering at least DNS, TCP, TLS, HTTP, the server side and rendering. Write it as a numbered outline.",
        hint: "Go layer by layer and include one detail per step that shows depth.",
        solution: "1. Browser parses URL, checks HSTS and its cache\n2. DNS: OS cache, recursive resolver, root, .com, authoritative; TTL caching\n3. TCP handshake SYN, SYN-ACK, ACK to port 443 (or QUIC for HTTP/3)\n4. TLS 1.3: key shares, certificate chain and name check, 1 RTT\n5. HTTP GET with Host, cookies, Accept-Encoding\n6. CDN or load balancer, app server, cache, database\n7. Response: status, headers, gzip or brotli body\n8. Parse HTML, DOM and CSSOM, fetch subresources, layout, paint",
      },
    ],
    faq: [
      { q: "Is UDP unreliable and therefore bad?", a: "UDP gives no delivery guarantees, but that is a feature when late data is useless. DNS, video calls, games and QUIC (HTTP/3) all run on UDP." },
      { q: "What is the difference between HTTP and HTTPS?", a: "HTTPS is HTTP sent inside a TLS connection, usually on port 443. TLS encrypts the traffic and lets the browser verify the server's identity with a certificate." },
      { q: "Why does DNS use UDP?", a: "Most queries and answers fit in a single small packet, so skipping the TCP handshake makes lookups faster. DNS falls back to TCP for large responses and zone transfers." },
      { q: "How deep should I go on the OSI model?", a: "Know the seven layer names and map common protocols to them, but most interviews use the simpler TCP/IP model. Being able to explain real behaviour, like the TCP handshake or DNS caching, matters far more." },
    ],
  },

  "cs/dbms": {
    plain: [
      "A database does two hard jobs at once. It must keep data correct even when many people change it at the same time, and even if the power goes out halfway. And it must find the rows you ask for quickly, even in a table with millions of rows.",
      "A transaction groups several changes into one unit. Moving money from Ana to Bo means two updates. If only the first one happens, money disappears. A transaction promises that both happen or neither does. The four promises are called ACID: atomicity, consistency, isolation and durability.",
      "An index is like the index at the back of a book. Without it, the database reads every row to find what you want. With it, the database jumps almost straight to the right place. But every index must also be updated on every insert, so indexes are not free.",
      "Normalisation is about storing each fact in one place only. If a customer's address is copied into every order, changing it means updating many rows, and you will miss some. Splitting data into related tables removes that risk. Interviewers want you to explain these ideas with small, concrete examples.",
    ],
    deepDive: [
      {
        heading: "How databases actually deliver atomicity and durability",
        body: "Most databases use a write-ahead log (WAL). Before a change is applied to the data files, a record describing it is appended to the log. On COMMIT, the database forces the log to disk with fsync. Only then does it tell the client the commit succeeded. The data pages themselves can be written later.\n\nIf the server crashes, recovery replays the log: committed changes are redone, and changes from transactions that never committed are ignored or undone. That gives durability (committed data survives) and atomicity (half-done transactions vanish). Writing a sequential log is much faster than updating random pages, which is why this design is universal. PostgreSQL calls it WAL; MySQL InnoDB has a redo log and an undo log.\n\nConsistency in ACID means your constraints (primary keys, foreign keys, CHECK rules) hold after every transaction. It is partly the database's job and partly yours.",
        visual: {
          type: "flow",
          title: "What COMMIT really does",
          steps: [
            { label: "Change in memory", detail: "Rows updated in the buffer cache" },
            { label: "Append to WAL", detail: "Log record describes the change" },
            { label: "fsync the log", detail: "Log is safely on disk" },
            { label: "Reply COMMIT OK", detail: "Client may now trust the change" },
            { label: "Write pages later", detail: "Checkpoint flushes data files" },
          ],
        },
      },
      {
        heading: "Isolation levels and the anomalies they allow",
        body: "The SQL standard defines four levels by which anomalies they prevent. Read uncommitted allows dirty reads (seeing changes that may be rolled back). Read committed blocks dirty reads, but a row read twice may change between reads (non-repeatable read). Repeatable read keeps rows you have read stable, but the standard still allows phantoms: new rows matching your WHERE clause appearing on a second query. Serializable allows no anomalies; the result equals some one-at-a-time order.\n\nReal engines differ from the standard. PostgreSQL treats read uncommitted as read committed, and its repeatable read uses a snapshot, so phantoms do not appear, but write skew still can. Write skew is when two transactions each read the same data, make a decision, and write different rows, breaking a rule together (for example, two doctors both going off call). Only serializable prevents it, and PostgreSQL may abort one transaction with a serialization failure, so your code must retry.",
        bullets: ["Dirty read: blocked from read committed upwards", "Non-repeatable read: blocked from repeatable read upwards", "Phantom: blocked by serializable (and by PostgreSQL's snapshot in repeatable read)", "Lost update: two read-modify-write cycles overwrite each other; use SELECT ... FOR UPDATE or an atomic UPDATE"],
      },
      {
        heading: "MVCC: why readers do not block writers",
        body: "PostgreSQL, MySQL InnoDB and Oracle use MVCC (multi-version concurrency control). Instead of overwriting a row in place, an update creates a new version and keeps the old one for a while. Each transaction reads from a snapshot: it sees the versions that were committed when its snapshot was taken.\n\nThe big win is that a long SELECT never blocks an UPDATE, and the UPDATE never blocks the SELECT. Writers still block other writers on the same row, using row locks. In read committed, each statement takes a fresh snapshot. In repeatable read, the whole transaction uses one snapshot.\n\nThe cost is old versions piling up. PostgreSQL cleans them with VACUUM (autovacuum runs it automatically). A transaction left open for hours stops cleanup and makes tables bloat, which is a common production problem worth mentioning.",
      },
      {
        heading: "B-tree indexes: how they work and when they do not help",
        body: "A B-tree index (PostgreSQL and InnoDB actually use the B+ tree variant) keeps keys sorted in pages. Each page holds hundreds of keys, so the tree is very shallow: three or four levels can cover millions of rows. A lookup walks from the root to a leaf, then follows pointers to the table rows. Leaves are linked, so range scans like BETWEEN and ORDER BY are cheap.\n\nA composite index on (country, city) works like a phone book sorted by last name, then first name. It helps WHERE country = 'IN' and WHERE country = 'IN' AND city = 'Pune', but not WHERE city = 'Pune' alone. That is the leftmost-prefix rule.\n\nIndexes may be ignored when the query returns a large share of the table, when you wrap the column in a function (WHERE lower(email) = ... needs an expression index), or on tiny tables. Every index slows inserts and updates and uses disk, so add them for real queries, and check with EXPLAIN.",
        bullets: ["Lookup cost is O(log n), and the base is large, so few page reads", "Covering index: all needed columns are in the index, no table visit", "Hash index: equality only, no ranges or sorting", "Clustered (InnoDB primary key) stores rows in index order"],
      },
      {
        heading: "Normal forms, with one table taken apart",
        body: "Take orders(order_id, customer_name, customer_city, product_ids, product_names). First normal form (1NF): each cell holds one value, so a list like product_ids must become separate rows in an order_items table. Second normal form (2NF): in a table with a composite key, every non-key column must depend on the whole key. In order_items(order_id, product_id, product_name), the name depends only on product_id, so it moves to a products table. Third normal form (3NF): non-key columns must not depend on other non-key columns. customer_city depends on the customer, not on the order, so it moves to a customers table.\n\nThe short rule: every non-key column depends on the key, the whole key, and nothing but the key. BCNF is a slightly stricter 3NF. In practice, reporting and read-heavy systems denormalise on purpose, for example storing an order total, and accept the cost of keeping it in sync.",
        visual: {
          type: "tree",
          title: "One messy orders table, normalised",
          root: "orders (messy)",
          children: [
            { label: "customers", children: ["customer_id (PK)", "name, city"] },
            { label: "orders", children: ["order_id (PK)", "customer_id (FK)", "ordered_at"] },
            { label: "order_items", children: ["order_id + product_id (PK)", "quantity"] },
            { label: "products", children: ["product_id (PK)", "name, price"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A lost update without locking",
        actors: ["Transaction A", "Database", "Transaction B"],
        messages: [
          { from: 0, to: 1, label: "Read stock = 10" },
          { from: 2, to: 1, label: "Read stock = 10" },
          { from: 0, to: 1, label: "Write stock = 9, commit" },
          { from: 2, to: 1, label: "Write stock = 9, commit" },
          { from: 1, to: 1, label: "Two sales, but stock shows 9" },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing the lost update on stock",
        explanation: "Two customers buy the last items at the same moment and stock goes wrong. Step 1: explain that read committed allows this, because both transactions read 10 before either writes. Step 2: offer fix one, an atomic update that lets the database do the read and the write together, with a condition so stock never goes negative. Step 3: offer fix two, lock the row with SELECT ... FOR UPDATE when the logic needs to read first. Step 4: mention that serializable isolation also prevents it but needs retry logic.",
        code: {
          lang: "sql",
          code: "-- Fix 1: atomic update, check the row count in your app\nUPDATE products SET stock = stock - 1\nWHERE id = 42 AND stock > 0;\n\n-- Fix 2: lock the row, then decide\nBEGIN;\nSELECT stock FROM products WHERE id = 42 FOR UPDATE;\n-- app checks stock > 0 here\nUPDATE products SET stock = stock - 1 WHERE id = 42;\nCOMMIT;",
        },
      },
      {
        title: "Why is my index not used?",
        explanation: "The interviewer shows a slow query on users with an index on email. Step 1: run EXPLAIN and see a Seq Scan. Step 2: notice the query uses lower(email), so the plain index cannot match. Step 3: create an expression index on lower(email). Step 4: run EXPLAIN again and see an Index Scan. Also mention the other common causes: low selectivity, a type mismatch, and stale statistics that ANALYZE fixes.",
        code: {
          lang: "sql",
          code: "EXPLAIN SELECT id FROM users WHERE lower(email) = 'ana@example.com';\n-- Seq Scan on users ...\n\nCREATE INDEX idx_users_email_lower ON users (lower(email));\nANALYZE users;\n\nEXPLAIN SELECT id FROM users WHERE lower(email) = 'ana@example.com';\n-- Index Scan using idx_users_email_lower on users ...",
        },
      },
    ],
    cheatSheet: [
      "WAL: log the change, fsync on COMMIT, write data pages later; replay on crash",
      "Read committed: no dirty reads; repeatable read: stable rows; serializable: no anomalies",
      "Defaults: PostgreSQL read committed, MySQL InnoDB repeatable read",
      "Write skew is only prevented by serializable; be ready to retry serialization failures",
      "MVCC: readers do not block writers; old row versions are cleaned by VACUUM",
      "Composite index (a, b) helps WHERE a and WHERE a AND b, not WHERE b alone",
      "3NF: every non-key column depends on the key, the whole key, and nothing but the key",
      "EXPLAIN ANALYZE runs the query and shows the real plan, rows and timing",
    ],
    quiz: [
      {
        q: "Which component lets a database survive a crash right after COMMIT returns?",
        options: ["The query planner", "The buffer cache", "The write-ahead log flushed to disk", "The B-tree index"],
        answer: 2,
        why: "COMMIT only returns after the log record is on disk, so recovery can replay it.",
      },
      {
        q: "A table has an index on (last_name, first_name). Which query can use it best?",
        options: ["WHERE last_name = 'Rao'", "WHERE first_name = 'Ana'", "WHERE lower(last_name) = 'rao'", "WHERE first_name LIKE '%na'"],
        answer: 0,
        why: "The leftmost-prefix rule means the index is sorted by last_name first.",
      },
      {
        q: "Two transactions each check that at least one doctor is on call, then each takes a different doctor off call. Which anomaly is this?",
        options: ["Dirty read", "Write skew", "Phantom read", "Non-repeatable read"],
        answer: 1,
        why: "Both read the same data and write different rows, breaking a rule that neither broke alone.",
      },
      {
        q: "In MVCC databases like PostgreSQL, what is true?",
        options: ["Readers block writers on the same row", "Updates overwrite rows in place immediately", "Every query runs at serializable", "Readers see a snapshot and do not block writers"],
        answer: 3,
        why: "Old versions stay visible to older snapshots, so reads and writes do not wait for each other.",
      },
      {
        q: "order_items(order_id, product_id, product_name) has primary key (order_id, product_id). Which normal form does it break?",
        options: ["1NF", "2NF", "3NF only", "None"],
        answer: 1,
        why: "product_name depends on only part of the composite key, which is a partial dependency.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Give a one-sentence real example for each ACID letter, using an online shop.",
        hint: "Think about placing an order that reduces stock and creates a payment row.",
        solution: "Atomicity: the order row, stock decrease and payment row are saved together or not at all.\nConsistency: a CHECK keeps stock from going below zero.\nIsolation: two shoppers buying the last item cannot both succeed.\nDurability: once the order is confirmed, a server crash does not lose it.",
      },
      {
        level: "medium",
        task: "In two psql sessions, show a non-repeatable read under read committed, then show it disappears under repeatable read.",
        hint: "Session A reads a row twice; session B updates and commits in between.",
        solution: "-- A: BEGIN; SELECT balance FROM accounts WHERE id = 1;   -- 100\n-- B: UPDATE accounts SET balance = 50 WHERE id = 1;     -- autocommit\n-- A: SELECT balance FROM accounts WHERE id = 1;         -- 50 (changed)\n-- A: COMMIT;\n-- Now repeat with:\n-- A: BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT ...  -- 50\n-- B: UPDATE accounts SET balance = 70 WHERE id = 1;\n-- A: SELECT ...                                          -- still 50",
      },
      {
        level: "hard",
        task: "Normalise this table to 3NF: enrolments(student_id, student_name, course_id, course_title, teacher_name, teacher_office, grade), key (student_id, course_id). Assume one teacher per course.",
        hint: "Find partial dependencies first (2NF), then transitive ones (3NF).",
        solution: "students(student_id PK, student_name)\ncourses(course_id PK, course_title, teacher_id FK)\nteachers(teacher_id PK, teacher_name, teacher_office)\nenrolments(student_id FK, course_id FK, grade, PK(student_id, course_id))\n-- student_name and course_title were partial dependencies (2NF).\n-- teacher_office depended on the teacher, not the course (3NF).",
      },
    ],
    faq: [
      { q: "What is the default isolation level in PostgreSQL and MySQL?", a: "PostgreSQL defaults to read committed. MySQL with InnoDB defaults to repeatable read." },
      { q: "Should I index every column I filter on?", a: "No. Each index slows writes and uses space, and the planner skips indexes that do not narrow results much. Index the columns your frequent, slow queries filter, join or sort on, and confirm with EXPLAIN." },
      { q: "What is the difference between a phantom read and a non-repeatable read?", a: "A non-repeatable read is the same row returning a different value. A phantom is a re-run query returning a different set of rows, because rows were inserted or deleted." },
      { q: "Is denormalisation bad?", a: "Not when done on purpose. It speeds up reads at the cost of extra storage and the work of keeping copies in sync, which is often a fair trade for dashboards and read-heavy APIs." },
    ],
  },
};

export default extra;
