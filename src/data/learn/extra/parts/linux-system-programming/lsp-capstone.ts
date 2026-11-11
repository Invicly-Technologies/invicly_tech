import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-capstone/mini-shell": {
    plain: [
      "A shell is a program that reads what you type and asks the kernel to run it. When you type ls -l, the shell does not know how to list files. It finds the program called ls, starts it as a new process, hands it the words ls and -l, and waits for it to finish.",
      "Starting a program on Linux takes two steps. fork makes a copy of the shell. The copy, called the child, then calls exec, which replaces the copy with the new program. Between those two steps the child can still run shell code, and that is the moment to set up redirections and pipes.",
      "Redirection and pipes work because programs read from file descriptor 0 (standard input) and write to file descriptor 1 (standard output) without caring what those really are. The shell quietly swaps them for a file or a pipe with dup2, and the program never notices.",
      "A few commands, like cd and exit, cannot be separate programs. They must change the shell itself, so the shell runs them directly. Building your own small shell is the best way to see fork, exec, pipes and signals work together in one place.",
    ],
    deepDive: [
      {
        heading: "From a line of text to a command structure",
        body: "Do not run commands while you parse. First turn the line into tokens, then turn the tokens into a structure, then execute the structure. This keeps each step small and testable.\n\nThe tokenizer walks the line one character at a time. Spaces and tabs end a word. The characters |, <, > and & are operators and become tokens of their own even without spaces, so ls>out gives three tokens. Inside double or single quotes, spaces are kept, so \"my file.txt\" is one word. strtok cannot do this because it knows nothing about quotes, so write a small state machine instead.\n\nThe parser then reads tokens left to right. Words go into the current stage's argv. A | starts a new stage. A < or > must be followed by a word, which becomes the input or output file. A final & marks the whole job as background. Report errors like a missing file name after > before forking anything.",
        bullets: [
          "Each stage needs its own argv array ending with NULL",
          ">> means open with O_APPEND instead of O_TRUNC",
          "Reject empty stages such as ls | | wc",
        ],
        visual: {
          type: "tree",
          title: "Parsed form of: sort < in.txt | uniq -c > out.txt &",
          root: "Job (background = yes)",
          children: [
            { label: "Stage 1", children: ["argv: sort", "stdin: in.txt", "stdout: pipe to stage 2"] },
            { label: "Stage 2", children: ["argv: uniq -c", "stdin: pipe from stage 1", "stdout: out.txt"] },
          ],
        },
      },
      {
        heading: "Redirection with open and dup2",
        body: "Redirection happens in the child, after fork and before exec. For < file, the child opens the file read-only. For > file, it opens it with O_WRONLY | O_CREAT | O_TRUNC and mode 0644. Then dup2(fd, 0) or dup2(fd, 1) makes descriptor 0 or 1 point at the same open file, and the child closes the original fd so it does not leak into the new program.\n\nThe parent shell never touches its own descriptors 0 and 1, so the next prompt still goes to the terminal. If open fails, the child prints the error with perror and calls _exit(1). Use _exit, not exit, in a child that failed: exit would run atexit handlers and flush stdio buffers copied from the parent, which can print the same text twice.\n\nIf execvp fails, the convention from bash is exit status 127 for command not found (ENOENT) and 126 for found but not executable (EACCES). Users and scripts rely on these numbers.",
      },
      {
        heading: "Pipelines: the order of every call",
        body: "For a pipeline of N commands you need N-1 pipes. The shell creates a pipe, forks the left child, which does dup2(p[1], 1), and forks the right child, which does dup2(p[0], 0). Each child then closes both original pipe ends before exec.\n\nThe parent must close both ends too. This is the most common bug in student shells. A reader only sees end of file when every write end is closed. If the shell still holds p[1], wc -l waits forever for more input, and the pipeline hangs.\n\nFor long pipelines, do not create all pipes at once. Keep only the read end left from the previous stage, create the next pipe, fork, and close what the parent no longer needs inside the loop. The shell then holds at most two pipe descriptors at any moment. Wait for every child, and report the exit status of the last stage, just like bash does by default.",
        visual: {
          type: "sequence",
          title: "Running ls | wc -l",
          actors: ["Shell", "Kernel", "Child: ls", "Child: wc"],
          messages: [
            { from: 0, to: 1, label: "pipe(p) gives p[0] and p[1]" },
            { from: 0, to: 2, label: "fork" },
            { from: 2, to: 1, label: "dup2(p[1], 1), close ends, exec ls" },
            { from: 0, to: 3, label: "fork" },
            { from: 3, to: 1, label: "dup2(p[0], 0), close ends, exec wc" },
            { from: 0, to: 1, label: "close(p[0]) and close(p[1])" },
            { from: 2, to: 3, label: "bytes flow through the pipe, then EOF" },
            { from: 3, to: 0, label: "exit status collected by waitpid" },
          ],
        },
      },
      {
        heading: "Signals: Ctrl-C and SIGCHLD done safely",
        body: "When you press Ctrl-C, the terminal sends SIGINT to every process in its foreground process group. In a simple shell, the shell and its children share one group, so the shell sets SIGINT to SIG_IGN for itself. An ignored signal stays ignored across exec, so each child must set SIGINT back to SIG_DFL before exec. Caught signals (with a handler) are reset to default by exec automatically.\n\nBackground jobs need reaping, or they stay as zombies. A SIGCHLD handler may only call async-signal-safe functions: waitpid and write are safe, but printf and malloc are not. The simplest safe design is a handler that only sets a volatile sig_atomic_t flag. Before each prompt, the main loop checks the flag and calls waitpid(-1, &status, WNOHANG) in a loop until it returns 0 or -1.\n\nIf your handler reaps children itself, save and restore errno inside it, and expect the foreground waitpid(pid) to sometimes fail with ECHILD because the handler got there first.",
        bullets: [
          "Use sigaction with SA_RESTART so fgets is not cut short by SIGCHLD",
          "SA_NOCLDSTOP skips SIGCHLD for stopped (not exited) children",
          "Full job control adds setpgid per job and tcsetpgrp for the terminal",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways the shell runs a command",
        columns: [
          { title: "Built-in (cd, exit)", points: ["No fork at all", "Runs inside the shell process", "Can change the shell's state", "Must handle its own errors"] },
          { title: "Foreground command", points: ["fork, then exec in the child", "Shell blocks in waitpid(pid)", "Gets Ctrl-C from the terminal", "Exit status shown to the user"] },
          { title: "Background job (&)", points: ["fork and exec, no waiting", "Prompt returns at once", "Reaped later after SIGCHLD", "Should not get Ctrl-C"] },
        ],
      },
      {
        type: "flow",
        title: "What happens when you press Ctrl-C",
        steps: [
          { label: "Terminal driver sees ^C", detail: "The kernel's tty layer, not the shell, reads it." },
          { label: "SIGINT to foreground group", detail: "Every process in that group gets the signal." },
          { label: "Shell ignores it", detail: "It set SIGINT to SIG_IGN at startup." },
          { label: "Child dies", detail: "It restored SIG_DFL before exec." },
          { label: "waitpid returns", detail: "WIFSIGNALED is true; the shell reports status 130 (128 + 2)." },
          { label: "New prompt", detail: "The shell prints a newline and continues." },
        ],
      },
    ],
    examples: [
      {
        title: "Redirection: sort < names.txt > sorted.txt",
        explanation: "The parser finds argv = sort, in_path = names.txt and out_path = sorted.txt. After fork, the child calls a small helper for each redirection, then execs sort. sort reads fd 0 and writes fd 1 as usual, and has no idea they are files. If names.txt does not exist, the child prints \"names.txt: No such file or directory\" and exits with 1, and sort never starts. Note that errno is saved before perror, because perror itself could change it.",
        code: {
          lang: "c",
          code: `static void redirect(const char *path, int flags, int target) {
  int fd = open(path, flags, 0644);
  if (fd < 0 || dup2(fd, target) < 0) { perror(path); _exit(1); }
  if (fd != target) close(fd);
}

/* in the child, after fork() returned 0 */
signal(SIGINT, SIG_DFL);
if (in_path)  redirect(in_path, O_RDONLY, STDIN_FILENO);
if (out_path) redirect(out_path, O_WRONLY | O_CREAT | O_TRUNC, STDOUT_FILENO);
execvp(argv[0], argv);
int e = errno;
perror(argv[0]);
_exit(e == ENOENT ? 127 : 126);`,
        },
      },
      {
        title: "A two-stage pipeline: ls | wc -l",
        explanation: "One pipe, two forks. The left child points fd 1 at the write end, the right child points fd 0 at the read end, and both close the original ends. The parent closes both ends right after the second fork and then waits for both children. Try deleting the parent's close(p[1]): run it and wc -l never prints, because it is still waiting for a writer that will never write. Needs unistd.h, sys/wait.h and stdio.h.",
        code: {
          lang: "c",
          code: `int p[2];
if (pipe(p) < 0) { perror("pipe"); return -1; }
pid_t a = fork();
if (a < 0) { perror("fork"); close(p[0]); close(p[1]); return -1; }
if (a == 0) {                       /* left side: ls */
  dup2(p[1], STDOUT_FILENO); close(p[0]); close(p[1]);
  execlp("ls", "ls", (char *)NULL); perror("ls"); _exit(127);
}
pid_t b = fork();
if (b == 0) {                       /* right side: wc -l */
  dup2(p[0], STDIN_FILENO); close(p[0]); close(p[1]);
  execlp("wc", "wc", "-l", (char *)NULL); perror("wc"); _exit(127);
}
close(p[0]); close(p[1]);           /* parent must close both ends */
waitpid(a, NULL, 0); if (b > 0) waitpid(b, NULL, 0); else perror("fork");`,
        },
      },
    ],
    cheatSheet: [
      "Order in the child: fork, reset signals, open files, dup2, close originals, exec, then _exit on failure.",
      "> is O_WRONLY|O_CREAT|O_TRUNC, >> is O_WRONLY|O_CREAT|O_APPEND, < is O_RDONLY.",
      "N commands in a pipeline need N-1 pipes; the parent closes every pipe end it created.",
      "Exit status: WIFEXITED gives WEXITSTATUS; killed by signal n shows as 128 + n.",
      "127 = command not found, 126 = found but not executable (bash convention).",
      "Reap background jobs: while (waitpid(-1, &st, WNOHANG) > 0) { ... }",
      "SIG_IGN survives exec; a handler does not. Reset SIGINT to SIG_DFL in children.",
      "Test with: strace -f -e trace=pipe2,dup2,execve,wait4 ./msh",
    ],
    quiz: [
      {
        q: "Your pipeline cat file | wc -l prints nothing and never returns. What is the most likely bug?",
        options: [
          "wc was given the wrong argv",
          "The shell process still has the pipe's write end open",
          "The pipe buffer is too small for the file",
          "cat needs to be run with exec instead of execvp",
        ],
        answer: 1,
        why: "wc only sees end of file when every write end is closed, including the copy in the shell.",
      },
      {
        q: "Where should dup2 for > out.txt be called?",
        options: [
          "In the child, after fork and before exec",
          "In the shell, before fork",
          "In the shell, after waitpid",
          "Inside the program being run",
        ],
        answer: 0,
        why: "Doing it in the child changes only the child's fd 1, so the shell's own output still goes to the terminal.",
      },
      {
        q: "Which of these is safe to call inside a SIGCHLD handler?",
        options: ["printf", "malloc", "fprintf(stderr, ...)", "waitpid"],
        answer: 3,
        why: "waitpid is on the POSIX async-signal-safe list; stdio functions and malloc are not.",
      },
      {
        q: "The shell sets SIGINT to SIG_IGN and a child runs sleep 100. What happens when the user presses Ctrl-C if the child did not reset SIGINT?",
        options: [
          "sleep exits with status 130",
          "The shell exits",
          "sleep keeps running because the ignored setting was inherited through exec",
          "The kernel sends SIGKILL instead",
        ],
        answer: 2,
        why: "An ignored signal stays ignored after exec, so the child must restore SIG_DFL itself.",
      },
      {
        q: "Why does the child call _exit instead of exit after execvp fails?",
        options: [
          "_exit is faster to type",
          "exit cannot take a status above 1",
          "exit closes the terminal",
          "exit would flush stdio buffers copied from the parent and run its atexit handlers",
        ],
        answer: 3,
        why: "The child shares copies of the parent's unflushed buffers, so exit could print the same output twice.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make the exit built-in accept an optional status (exit 3), and print the exit status of every foreground command that does not return 0, like [exit 1] or [signal 2].",
        hint: "Use atoi for the argument, and WIFEXITED, WEXITSTATUS, WIFSIGNALED and WTERMSIG on the waitpid status.",
        solution: `int st;
if (waitpid(pid, &st, 0) < 0) { perror("waitpid"); continue; }
if (WIFEXITED(st) && WEXITSTATUS(st) != 0) printf("[exit %d]\\n", WEXITSTATUS(st));
else if (WIFSIGNALED(st)) printf("[signal %d]\\n", WTERMSIG(st));

/* built-in */
if (strcmp(argv[0], "exit") == 0) exit(argc > 1 ? atoi(argv[1]) : 0);`,
      },
      {
        level: "medium",
        task: "Support background jobs: a trailing & runs the command without waiting, prints its PID, and the shell reports [done] PID before a later prompt, without leaving zombies.",
        hint: "Install a SIGCHLD handler with sigaction that only sets a flag. Do the reaping in the main loop, never printf in the handler.",
        solution: `static volatile sig_atomic_t child_exited = 0;
static void on_chld(int sig) { (void)sig; child_exited = 1; }

struct sigaction sa = {0};
sa.sa_handler = on_chld; sigemptyset(&sa.sa_mask);
sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;
if (sigaction(SIGCHLD, &sa, NULL) < 0) perror("sigaction");

/* before printing each prompt */
if (child_exited) { child_exited = 0; int st; pid_t p;
  while ((p = waitpid(-1, &st, WNOHANG)) > 0) printf("[done] %d\\n", (int)p); }
/* for a background job: printf("[bg] %d\\n", (int)pid); and do not wait */`,
      },
      {
        level: "hard",
        task: "Run a pipeline of any length (cmds[0] | cmds[1] | ... | cmds[n-1]) so that the shell never holds more than two pipe descriptors at once.",
        hint: "Keep only the read end from the previous stage in a variable. Create the next pipe only if this is not the last stage.",
        solution: `int prev = -1;                      /* read end left from the previous stage */
for (int i = 0; i < n; i++) {
  int p[2] = {-1, -1};
  if (i < n - 1 && pipe(p) < 0) { perror("pipe"); break; }
  if ((pids[i] = fork()) == 0) {
    if (prev != -1) { dup2(prev, STDIN_FILENO); close(prev); }
    if (p[1] != -1) { dup2(p[1], STDOUT_FILENO); close(p[1]); close(p[0]); }
    execvp(cmds[i][0], cmds[i]); perror(cmds[i][0]); _exit(127);
  }
  if (prev != -1) { close(prev); }  if (p[1] != -1) { close(p[1]); }
  prev = p[0];
}
/* after the loop: close(prev) if it is not -1, then waitpid every pids[i] > 0 */`,
      },
    ],
    faq: [
      {
        q: "Why can't cd be an external program like /bin/cd?",
        a: "The current directory belongs to each process. A child that calls chdir changes only its own directory and then exits, so the shell stays where it was. That is why cd, exit and export are built into the shell.",
      },
      {
        q: "What is the difference between execvp and execv?",
        a: "execvp searches the directories in PATH when the name has no slash, just like a shell does. execv needs the full path, such as /bin/ls.",
      },
      {
        q: "How do I make Ctrl-Z and fg work in my shell?",
        a: "That is full job control. Put each job in its own process group with setpgid, give that group the terminal with tcsetpgrp, and use waitpid with WUNTRACED to see stopped jobs. The GNU libc manual has a chapter on implementing a job control shell.",
      },
      {
        q: "How can I see what my shell is doing under the hood?",
        a: "Run it under strace -f, which follows child processes and shows every pipe, dup2, execve and wait4 call. It makes leftover pipe ends and failed execs easy to spot.",
      },
    ],
  },

  "lsp-capstone/chat-server": {
    plain: [
      "A chat server is a program that many people connect to at the same time. When one person sends a message, the server passes it to everyone else. You can test it with netcat (nc), a tool that opens a TCP connection and lets you type into it.",
      "TCP gives you a stream of bytes, not separate messages. If a client sends hello and then world, your server might read helloworld in one go, or hel and then loworld. So you need a rule for where a message ends. The easiest rule is: every message ends with a newline character.",
      "The server must never get stuck waiting for one client. A single thread with epoll can watch thousands of sockets and only touch the ones that are ready. Each client gets a small record with its socket, its nickname, and two buffers: bytes received but not yet a full line, and bytes waiting to be sent.",
      "Most of the real work is in the unhappy cases: a client that disconnects in the middle of a message, a client that stops reading, a line that is far too long. Handling these well is what makes the project worth showing.",
    ],
    deepDive: [
      {
        heading: "Designing a small line protocol",
        body: "Write the protocol down before you write code. A good first version: every message is UTF-8 text ending in \\n, and the server also accepts \\r\\n because telnet and some clients send it. Lines longer than a fixed limit, say 512 bytes, are an error and the client is disconnected.\n\nLines starting with / are commands: /nick NAME sets a nickname, /who lists people, /quit leaves. Every other line is chat. The server answers with lines too: chat appears as [alice] hello, and server notices start with * so clients can tell them apart.\n\nDecide the rules for nicknames: allowed characters, maximum length, what happens on a duplicate. Clear, strict rules are easier to test and harder to abuse. A client that can send any bytes can try to inject a fake [admin] line, so reject control characters.",
        bullets: ["Max line length: reject, do not silently truncate", "Unique nicknames, letters, digits, - and _ only", "Server lines start with * for notices"],
        visual: {
          type: "sequence",
          title: "One short chat session",
          actors: ["alice (nc)", "Server", "bob (nc)"],
          messages: [
            { from: 1, to: 0, label: "* welcome, use /nick NAME" },
            { from: 0, to: 1, label: "/nick alice" },
            { from: 1, to: 2, label: "* alice joined" },
            { from: 0, to: 1, label: "hello everyone" },
            { from: 1, to: 2, label: "[alice] hello everyone" },
            { from: 2, to: 1, label: "connection closed (read returns 0)" },
            { from: 1, to: 0, label: "* bob left" },
          ],
        },
      },
      {
        heading: "The epoll loop in practice",
        body: "Create the listening socket with SO_REUSEADDR so you can restart the server right away, make it non-blocking, and add it to epoll. When it is readable, call accept4 with SOCK_NONBLOCK | SOCK_CLOEXEC in a loop until it fails with EAGAIN, because several clients may be waiting.\n\nStore a pointer to the client record in event.data.ptr, so each event leads straight to its client. Level-triggered mode (the default) is simpler: epoll keeps reporting a socket while data remains. Edge-triggered mode (EPOLLET) reports only changes, so you must read until EAGAIN every time or the rest of the data waits forever.\n\nOnly ask for EPOLLOUT while a client's output buffer is not empty. A socket is almost always writable, so leaving EPOLLOUT on makes epoll_wait return at once, again and again, and the server burns 100 percent CPU doing nothing.",
        visual: {
          type: "compare",
          title: "Level-triggered vs edge-triggered epoll",
          columns: [
            { title: "Level-triggered (default)", points: ["Reports while data is still unread", "One read per event is fine", "Forgiving of small mistakes", "Best choice for a first server"] },
            { title: "Edge-triggered (EPOLLET)", points: ["Reports only when new data arrives", "Must read until EAGAIN", "Fewer wakeups under heavy load", "Easy to lose data with a bug"] },
          ],
        },
      },
      {
        heading: "Slow clients and the output buffer",
        body: "send on a non-blocking socket may write only part of your data, or fail with EAGAIN when the kernel's send buffer is full. So never assume a broadcast is sent the moment you call send. Append the message to each client's output buffer, try to send what you can, and keep the rest for the next EPOLLOUT event.\n\nA client that stops reading (for example a laptop that went to sleep) will fill its kernel buffer and then your buffer. Give each output buffer a hard limit, such as 64 KiB. When a new message would not fit, disconnect that client. One slow reader must never slow down or crash the whole room, and memory must never grow without limit.\n\nWriting to a socket whose peer has gone raises SIGPIPE, and its default action kills your whole server. Send with the MSG_NOSIGNAL flag, or set SIGPIPE to SIG_IGN at startup, and handle the EPIPE error instead.",
        bullets: ["Bounded buffer per client, disconnect on overflow", "MSG_NOSIGNAL on every send", "Count bytes dropped and clients kicked for your logs"],
      },
      {
        heading: "Disconnects during a broadcast",
        body: "A client can vanish at any moment: read returns 0 for a normal close, or read and send fail with ECONNRESET or EPIPE. The tricky part is when this happens in the middle of a loop over all clients, or in the middle of a batch of events from one epoll_wait call.\n\nIf you free the client record right away, a later event in the same batch may still hold a pointer to it, which is a use-after-free. Worse, the kernel may reuse the same fd number for a brand new client. The safe pattern is to mark the client as dead, skip dead clients for the rest of the batch, and free all dead clients after the batch ends.\n\nClosing an fd removes it from epoll only when no other descriptor refers to the same open file. If you ever dup the fd or fork, call epoll_ctl with EPOLL_CTL_DEL explicitly before close.",
        visual: {
          type: "tree",
          title: "Ways a client goes away",
          root: "Client must be removed",
          children: [
            { label: "Seen on read", children: ["read returns 0 (peer closed)", "ECONNRESET (peer reset)"] },
            { label: "Seen on send", children: ["EPIPE (peer gone)", "ECONNRESET"] },
            { label: "Server decides", children: ["Output buffer full", "Line too long", "Idle too long", "Server shutting down"] },
          ],
        },
      },
      {
        heading: "Load testing and limits",
        body: "A server that works with two clients can still fail at 2,000. Each connection uses one file descriptor, and the default soft limit is often 1024. Check it with ulimit -n, and raise it with ulimit -n in the shell, setrlimit in code, or LimitNOFILE= in a systemd unit. When accept fails with EMFILE, log it and keep running instead of exiting.\n\nThe listen backlog decides how many finished handshakes can wait for accept. The kernel caps it at net.core.somaxconn, which is 4096 by default since Linux 5.4, so listen(fd, SOMAXCONN) is a reasonable choice.\n\nFor tests, script many nc clients, plus a few nasty ones: a client that sends one huge line, one that connects and sends nothing, and one that never reads. Watch the server with ss -tn and top while the test runs, and check that memory stays flat.",
        bullets: ["ss -s shows totals; ss -tn sport = :7000 shows each connection", "exec 3<>/dev/tcp/127.0.0.1/7000 in bash opens a client that never reads"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Two designs for the same server",
        columns: [
          { title: "One thread + epoll", points: ["No locks needed", "Handles thousands of idle clients", "Every call must be non-blocking", "One slow handler delays everyone"] },
          { title: "Thread per client", points: ["Simple blocking read and write", "Shared client list needs a mutex", "Each thread reserves a stack (often 8 MiB virtual)", "Broadcast under a lock can block on a slow socket"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turning a byte stream into lines",
        explanation: "Each client has a fixed array in[] and a count in_len. After every read, append the new bytes, then pull out every complete line with memchr. Whatever is left after the last newline is a partial line: move it to the front of the buffer and wait for more bytes. If the buffer is full and still has no newline, the line is too long and the client is marked for disconnect. This works no matter how TCP splits or joins the data.",
        code: {
          lang: "c",
          code: `/* c->in holds c->in_len bytes received so far */
char *start = c->in, *nl;
size_t left = c->in_len;
while ((nl = memchr(start, '\\n', left)) != NULL) {
  size_t len = (size_t)(nl - start);
  if (len > 0 && start[len - 1] == '\\r') len--;   /* accept CRLF */
  handle_line(c, start, len);                      /* may mark c->dead */
  left -= (size_t)(nl - start) + 1;
  start = nl + 1;
}
memmove(c->in, start, left);                       /* keep the partial line */
c->in_len = left;
if (c->in_len == sizeof c->in) c->dead = 1;        /* line too long */`,
        },
      },
      {
        title: "Sending without ever blocking",
        explanation: "flush_out sends as much of the output buffer as the kernel accepts. EINTR means try again, EAGAIN means the kernel buffer is full so stop for now, and any other error means the client is gone. Afterwards it turns EPOLLOUT on only if bytes are still waiting, which avoids a busy loop. To broadcast, append the line to every other live client's out[] (disconnecting anyone whose buffer would overflow) and call flush_out for each.",
        code: {
          lang: "c",
          code: `/* Send queued bytes without blocking. Returns -1 if the client must go. */
static int flush_out(int epfd, struct client *c) {
  while (c->out_len > 0) {
    ssize_t w = send(c->fd, c->out, c->out_len, MSG_NOSIGNAL);
    if (w < 0 && errno == EINTR) continue;
    if (w < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) break;
    if (w < 0) return -1;                       /* EPIPE, ECONNRESET, ... */
    memmove(c->out, c->out + w, c->out_len - (size_t)w);
    c->out_len -= (size_t)w;
  }
  struct epoll_event ev = { .events = EPOLLIN | (c->out_len ? EPOLLOUT : 0),
                            .data.ptr = c };
  return epoll_ctl(epfd, EPOLL_CTL_MOD, c->fd, &ev);
}`,
        },
      },
    ],
    cheatSheet: [
      "Act only on complete lines; keep the partial tail in the input buffer.",
      "accept4(lfd, NULL, NULL, SOCK_NONBLOCK | SOCK_CLOEXEC) in a loop until EAGAIN.",
      "Enable EPOLLOUT only while the output buffer has data, or the loop spins at 100% CPU.",
      "send(fd, buf, n, MSG_NOSIGNAL) turns a deadly SIGPIPE into an EPIPE error.",
      "Mark clients dead during a batch; free them after the epoll_wait batch is done.",
      "Check and raise the fd limit: ulimit -n, setrlimit(RLIMIT_NOFILE), or LimitNOFILE= in systemd.",
      "Count connections: ss -tn state established '( sport = :7000 )' | tail -n +2 | wc -l",
    ],
    quiz: [
      {
        q: "A client sends hello\\n and your read returns only hel. What should the server do?",
        options: [
          "Keep hel in the client's input buffer and wait for more bytes",
          "Broadcast hel at once",
          "Disconnect the client for sending a bad message",
          "Call read in a blocking loop until the newline arrives",
        ],
        answer: 0,
        why: "TCP is a byte stream, so a message can arrive in pieces; only complete lines are processed.",
      },
      {
        q: "Your epoll server uses 100% CPU even when nobody is chatting. What is the likely cause?",
        options: [
          "The listen backlog is too small",
          "Nicknames are stored in a linked list",
          "EPOLLOUT is registered for sockets with nothing to send",
          "epoll_wait was given a timeout of -1",
        ],
        answer: 2,
        why: "Sockets are nearly always writable, so EPOLLOUT fires constantly unless you only ask for it when output is queued.",
      },
      {
        q: "The server dies silently when a client disconnects during a broadcast. Which fix is right?",
        options: [
          "Wrap send in a mutex",
          "Increase the socket send buffer",
          "Switch to UDP",
          "Use MSG_NOSIGNAL or ignore SIGPIPE, then handle EPIPE",
        ],
        answer: 3,
        why: "Writing to a closed connection raises SIGPIPE, whose default action terminates the process.",
      },
      {
        q: "Why not free a client record the moment a read on it fails?",
        options: [
          "free is not allowed in an epoll loop",
          "A later event in the same epoll_wait batch may still point to it",
          "The kernel needs the memory to finish the TCP close",
          "It would close the listening socket too",
        ],
        answer: 1,
        why: "Freeing early turns the remaining event's data.ptr into a dangling pointer, so mark it dead and free after the batch.",
      },
      {
        q: "accept starts failing with EMFILE at about 1,000 clients. What does that mean?",
        options: [
          "The client sent a malformed request",
          "The listen backlog is full",
          "The process hit its open file descriptor limit",
          "The machine is out of memory",
        ],
        answer: 2,
        why: "EMFILE means the per-process descriptor limit (RLIMIT_NOFILE) is reached; raise it and keep running.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a /who command that sends the asking client one line listing all nicknames, like * online: alice bob carol.",
        hint: "Build the line in a local buffer with snprintf, skipping dead clients and clients without a nickname, then queue it only to the asker.",
        solution: `char line[1024]; size_t n = (size_t)snprintf(line, sizeof line, "* online:");
for (struct client *o = clients; o; o = o->next) {
  if (o->dead || o->nick[0] == '\\0') continue;
  int k = snprintf(line + n, sizeof line - n, " %s", o->nick);
  if (k < 0 || (size_t)k >= sizeof line - n) break;   /* stop before overflow */
  n += (size_t)k;
}
if (n < sizeof line - 1) line[n++] = '\\n';
queue_to(c, line, n);`,
      },
      {
        level: "medium",
        task: "Prove that one client that never reads cannot hurt the others. Open a non-reading client, flood the room from another client, and check that the server disconnects the slow one while normal clients keep chatting.",
        hint: "In bash, exec 3<>/dev/tcp/127.0.0.1/7000 opens a socket you never read from. Use yes to generate lots of lines.",
        solution: `exec 3<>/dev/tcp/127.0.0.1/7000      # slow client: never reads fd 3
nc 127.0.0.1 7000 > /tmp/normal.log &  # normal client that reads everything
yes "spam line for the flood test" | head -n 2000000 | nc -q 1 127.0.0.1 7000
# Expected: server log shows the fd-3 client kicked for a full buffer,
# /tmp/normal.log keeps growing, and server RSS (ps -o rss= -p PID) stays flat.
exec 3>&-`,
      },
      {
        level: "hard",
        task: "Shut down cleanly on SIGTERM or SIGINT: tell every client the server is going away, flush what you can, close all sockets, free memory, and exit 0, without any code in a signal handler.",
        hint: "Block the signals with sigprocmask and read them from a signalfd that sits in the same epoll set as the sockets.",
        solution: `sigset_t m; sigemptyset(&m); sigaddset(&m, SIGTERM); sigaddset(&m, SIGINT);
if (sigprocmask(SIG_BLOCK, &m, NULL) < 0) { perror("sigprocmask"); exit(1); }
int sfd = signalfd(-1, &m, SFD_NONBLOCK | SFD_CLOEXEC);
if (sfd < 0) { perror("signalfd"); exit(1); }
struct epoll_event ev = { .events = EPOLLIN, .data.ptr = &sig_marker };
if (epoll_ctl(epfd, EPOLL_CTL_ADD, sfd, &ev) < 0) { perror("epoll_ctl"); exit(1); }
/* in the loop: if (events[i].data.ptr == &sig_marker) {
     struct signalfd_siginfo si; read(sfd, &si, sizeof si); running = 0; } */
/* after the loop: queue "* server shutting down\\n" to all, flush_out each,
   close every client fd, sfd, the listener and epfd, free all, return 0 */`,
      },
    ],
    faq: [
      {
        q: "Should I use epoll or one thread per client?",
        a: "Both work for a chat server. epoll in one thread needs no locks and scales to many idle connections, while thread per client is easier to write but needs a mutex around the client list and more memory per connection. Building the epoll version teaches more about how real servers work.",
      },
      {
        q: "Why do I get Address already in use when I restart my server?",
        a: "The old connections are in the TIME_WAIT state for a while after the server exits. Set SO_REUSEADDR on the listening socket before bind and the restart will work at once.",
      },
      {
        q: "How do I test my chat server without writing a client?",
        a: "Use nc localhost 7000 in a few terminals and type. For load, start many nc processes from a shell loop, and use ss -tn to count the connections.",
      },
      {
        q: "Is level-triggered or edge-triggered epoll better?",
        a: "Start with level-triggered, the default, because it forgives a missed read. Edge-triggered can cut wakeups under heavy load, but you must drain every socket until EAGAIN.",
      },
    ],
  },

  "lsp-capstone/capstone-polish": {
    plain: [
      "Your shell and chat server work when you try them. Now you want proof that they also work when things go wrong, that they do not leak memory, and that they are fast enough. Then you want them to run like a real service that starts on boot.",
      "Sanitizers are compiler options that add checks to your program. AddressSanitizer stops the program and shows the exact line when you read past the end of an array or use memory after free. Valgrind finds similar bugs without recompiling, but runs much slower.",
      "A profiler tells you where the time really goes. Programmers are often wrong when they guess. perf samples the program thousands of times a second and shows which functions were running most often.",
      "Finally, systemd starts the server at boot, restarts it if it crashes, collects its logs, and can lock it into a tight sandbox. A short README tells others how to build, run and test it. Together these turn a homework project into something you can show an employer.",
    ],
    deepDive: [
      {
        heading: "Sanitizers and valgrind: what each one catches",
        body: "Build with -g -O1 -fno-omit-frame-pointer -fsanitize=address,undefined for daily testing. AddressSanitizer (ASan) finds buffer overflows, use-after-free and double free, and on Linux it also reports leaks at exit (LeakSanitizer). The slowdown is about 2x. UndefinedBehaviorSanitizer (UBSan) finds signed overflow, bad shifts and misaligned access; add -fno-sanitize-recover=all so the first problem stops the program and fails the test.\n\nThreadSanitizer (-fsanitize=thread) finds data races, which matters for the thread-pool version of the server. It cannot be combined with ASan, so it needs its own build. A single-threaded epoll server has no data races to find.\n\nValgrind's memcheck needs no rebuild but runs roughly 10 to 50 times slower. Never run a sanitizer build under valgrind. For leak reports to mean anything, the server must shut down cleanly; memory still held at exit shows up as still reachable.",
        visual: {
          type: "compare",
          title: "Picking the right checker",
          columns: [
            { title: "ASan + UBSan", points: ["Recompile with -fsanitize", "About 2x slower", "Overflows, use-after-free, leaks, UB", "Use on every test run"] },
            { title: "TSan", points: ["Separate build, not with ASan", "Often 5 to 15x slower", "Data races between threads", "Only useful with threads"] },
            { title: "Valgrind memcheck", points: ["No rebuild needed", "Roughly 10 to 50x slower", "Leaks, invalid reads, uninitialised values", "Good final check of the release binary"] },
          ],
        },
      },
      {
        heading: "Profiling with perf",
        body: "Profile a build that is close to release: -O2 -g -fno-omit-frame-pointer. Optimisation changes where time goes, so profiling a -O0 build misleads you. The frame pointer lets perf record -g rebuild call stacks cheaply; without it, use perf record --call-graph dwarf, which is accurate but produces much bigger files.\n\nStart the server, generate realistic load with your test clients, then attach with perf record -g -p PID for 20 to 30 seconds and open the result with perf report. Look at the functions with the highest self time first. For a chat server it is usually broadcast work: copying the same line into many buffers, memmove on large buffers, or one send call per client.\n\nperf stat ./prog gives quick totals such as task-clock, context switches and page faults. If perf refuses to run as a normal user, check /proc/sys/kernel/perf_event_paranoid. Always measure again after a change, and keep the change only if the number really improved.",
        visual: {
          type: "flow",
          title: "A profiling session",
          steps: [
            { label: "Build -O2 -g", detail: "Add -fno-omit-frame-pointer for good stacks." },
            { label: "Apply real load", detail: "Hundreds of scripted clients sending lines." },
            { label: "perf record -g -p PID", detail: "Sample for about 30 seconds." },
            { label: "perf report", detail: "Sort by self time, find the hottest function." },
            { label: "Change one thing", detail: "Then measure again and compare." },
          ],
        },
      },
      {
        heading: "A hardened systemd unit",
        body: "Put the unit in /etc/systemd/system/chatd.service. The [Service] section needs ExecStart with the full path to the binary. Restart=on-failure brings the server back after a crash, and RestartSec=2 stops a broken binary from restarting in a tight loop. Let the program log to stdout and stderr; systemd sends that to the journal, which you read with journalctl -u chatd -f.\n\nDynamicUser=yes runs the service as a temporary unprivileged user created at start, and it switches on several protections such as a read-only view of the system. Add NoNewPrivileges=yes, PrivateTmp=yes, ProtectSystem=strict and ProtectHome=yes. Run systemd-analyze security chatd to get an exposure score and a list of settings still open.\n\nOn stop, systemd sends SIGTERM, then SIGKILL after TimeoutStopSec (90 seconds by default). Your signalfd shutdown code is what makes the stop clean. After editing a unit, run systemctl daemon-reload.",
        bullets: [
          "Ports below 1024 need AmbientCapabilities=CAP_NET_BIND_SERVICE",
          "LimitNOFILE=65536 raises the fd limit for many clients",
          "systemd-analyze verify chatd.service checks the file for errors",
        ],
        visual: {
          type: "tree",
          title: "chatd.service, section by section",
          root: "chatd.service",
          children: [
            { label: "[Unit]", children: ["Description=", "After=network.target"] },
            { label: "[Service] running", children: ["ExecStart=/usr/local/bin/chatd 7000", "Restart=on-failure", "RestartSec=2"] },
            { label: "[Service] sandbox", children: ["DynamicUser=yes", "NoNewPrivileges=yes", "ProtectSystem=strict", "ProtectHome=yes", "PrivateTmp=yes"] },
            { label: "[Install]", children: ["WantedBy=multi-user.target"] },
          ],
        },
      },
      {
        heading: "Tests that try to break it, and a useful README",
        body: "Happy-path tests prove little. Write a script that starts the server, runs scripted clients, compares their output with what you expect, and exits non-zero on any difference. Then add hostile cases: a 1 MB line, a client that disconnects mid-line, a client that never reads, 1,000 clients connecting at once, and a SIGTERM while clients are sending. For the shell, feed scripted input through a pipe and test empty lines, missing files after > and long pipelines.\n\nEvery bug you fix gets a regression test, so it cannot quietly return. Run the whole suite on the sanitizer build and on the valgrind run with --error-exitcode=1, so a single leak or invalid read fails the run.\n\nThe README should answer, in order: what it is, how to build it (compiler and make targets), how to run it, the protocol or supported syntax, how to run the tests, design decisions with their trade-offs, and known limits. Reviewers read this before any code.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The bug-fixing loop",
        steps: [
          { label: "Reproduce", detail: "Write a test or script that triggers the bug." },
          { label: "Run under ASan or TSan", detail: "Get the exact line and stack trace." },
          { label: "Fix the cause", detail: "Not just the symptom." },
          { label: "Keep the test", detail: "It becomes a regression test." },
          { label: "Run the full suite", detail: "Every build: debug, sanitizers, valgrind." },
        ],
      },
      {
        type: "layers",
        title: "Layers of testing for a system program",
        layers: [
          { label: "Unit tests", detail: "Tokenizer, parser, line splitter, buffer code." },
          { label: "Integration tests", detail: "Real processes and sockets with scripted input." },
          { label: "Fault tests", detail: "Huge lines, abrupt disconnects, full buffers, signals." },
          { label: "Load tests", detail: "Hundreds of clients; watch CPU, memory and fd counts." },
          { label: "Checker runs", detail: "The whole suite under ASan, UBSan, TSan and valgrind." },
        ],
      },
    ],
    examples: [
      {
        title: "A Makefile with debug, sanitizer and release builds",
        explanation: "One Makefile builds three kinds of binary. make asan is what you run every day: it catches memory errors and undefined behaviour and stops at the first one. make tsan is for the threaded version only. make release is what you profile and install. Each target cleans first, because objects from different flag sets must not be mixed. Recipe lines in a Makefile must start with a tab.",
        code: {
          lang: "makefile",
          code: `CC     ?= cc
WARN   := -Wall -Wextra -Werror -std=c11 -D_GNU_SOURCE
SRC    := chatd.c net.c proto.c

chatd: $(SRC)
	$(CC) $(WARN) $(CFLAGS) -o $@ $(SRC) $(LDFLAGS)

asan:    ; $(MAKE) clean && $(MAKE) CFLAGS="-g -O1 -fno-omit-frame-pointer -fsanitize=address,undefined -fno-sanitize-recover=all"
tsan:    ; $(MAKE) clean && $(MAKE) CFLAGS="-g -O1 -fsanitize=thread"
release: ; $(MAKE) clean && $(MAKE) CFLAGS="-O2 -g -fno-omit-frame-pointer"
test: asan ; ./tests/run.sh ./chatd
clean:   ; rm -f chatd

.PHONY: asan tsan release test clean`,
        },
      },
      {
        title: "Installing chatd as a sandboxed service",
        explanation: "Copy the release binary to /usr/local/bin, write the unit file below to /etc/systemd/system/chatd.service, then run systemctl daemon-reload and systemctl enable --now chatd. Check it with systemctl status chatd and follow the logs with journalctl -u chatd -f. Kill it with sudo kill -SEGV on its PID to see Restart=on-failure bring it back after 2 seconds. Finally run systemd-analyze security chatd and see how the sandbox settings lowered the exposure score.",
        code: {
          lang: "ini",
          code: `[Unit]
Description=Invicly chat server
After=network.target

[Service]
ExecStart=/usr/local/bin/chatd 7000
Restart=on-failure
RestartSec=2
DynamicUser=yes
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target`,
        },
      },
    ],
    cheatSheet: [
      "Daily build: -g -O1 -fno-omit-frame-pointer -fsanitize=address,undefined -fno-sanitize-recover=all",
      "ASan and TSan cannot share one binary; never run a sanitizer build under valgrind.",
      "valgrind --leak-check=full --error-exitcode=1 ./chatd 7000 fails the run on any error.",
      "perf record -g -p PID, then perf report; use --call-graph dwarf if stacks look broken.",
      "perf stat ./prog shows task-clock, context switches and page faults in one run.",
      "systemctl daemon-reload after editing a unit; journalctl -u chatd -f to follow logs.",
      "systemd-analyze security chatd scores the sandbox; systemd-analyze verify checks syntax.",
      "systemd stops a service with SIGTERM, then SIGKILL after TimeoutStopSec (default 90 s).",
    ],
    quiz: [
      {
        q: "You need to check the threaded chat server for data races and also for buffer overflows. How should you build it?",
        options: [
          "One build with -fsanitize=address,thread",
          "Two builds: one with ASan, one with TSan",
          "One ASan build run under valgrind",
          "A release build with -Werror",
        ],
        answer: 1,
        why: "ASan and TSan cannot be combined in one binary, so each needs its own build and test run.",
      },
      {
        q: "perf report shows broken, one-level call stacks. What is the cheapest fix?",
        options: [
          "Rebuild with -fno-omit-frame-pointer",
          "Run perf as a different user",
          "Rebuild with -O0",
          "Use valgrind instead",
        ],
        answer: 0,
        why: "perf record -g walks frame pointers by default, and optimised builds usually omit them unless told not to.",
      },
      {
        q: "Which unit setting restarts the server after it crashes but not after a clean exit?",
        options: ["Restart=always", "Type=forking", "WantedBy=multi-user.target", "Restart=on-failure"],
        answer: 3,
        why: "on-failure restarts on a non-zero exit, a fatal signal or a timeout, but not on exit status 0.",
      },
      {
        q: "valgrind lists a lot of still reachable memory for chatd after you stopped it with kill -9. What does this tell you?",
        options: [
          "There is a confirmed use-after-free",
          "The kernel leaked memory",
          "Little: the program never ran its cleanup code, so reports are only meaningful after a clean shutdown",
          "The heap is corrupted",
        ],
        answer: 2,
        why: "Memory still referenced at exit is reported as still reachable; a graceful shutdown that frees everything gives a clean, meaningful report.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Build your server with ASan and UBSan, run it, and add a deliberate bug (write one byte past the end of the input buffer) to see what the report looks like. Then remove the bug.",
        hint: "Read the first stack frame that points into your own source file; the report also says where the memory was allocated.",
        solution: `make asan
./chatd 7000 &
printf 'hello\\n' | nc -q 1 127.0.0.1 7000
# With the bug: ERROR: AddressSanitizer: heap-buffer-overflow (or
# stack-buffer-overflow) ... WRITE of size 1 ... #0 in read_client proto.c:57
# Remove the bug, rebuild, rerun: no report, and the server keeps running.`,
      },
      {
        level: "medium",
        task: "Write and install a systemd unit for chatd, then lower its systemd-analyze security exposure score by adding at least four sandbox settings, checking that the server still works after each one.",
        hint: "Start with DynamicUser=yes, NoNewPrivileges=yes, ProtectSystem=strict, ProtectHome=yes and PrivateTmp=yes. Add one at a time and restart.",
        solution: `sudo install -m 755 chatd /usr/local/bin/chatd
sudo cp chatd.service /etc/systemd/system/
sudo systemd-analyze verify /etc/systemd/system/chatd.service
sudo systemctl daemon-reload && sudo systemctl enable --now chatd
systemd-analyze security chatd | tail -n 1     # note the score
# add one setting, then: sudo systemctl daemon-reload && sudo systemctl restart chatd
echo '/who' | nc -q 1 127.0.0.1 7000           # still answers?
journalctl -u chatd -n 20                      # any errors after the change?`,
      },
      {
        level: "hard",
        task: "Write tests/run.sh that starts the server on a free port, runs two scripted clients, checks that a message from one reaches the other exactly once, always stops the server, and exits non-zero on failure. Make it work under valgrind too.",
        hint: "Use trap to clean up on exit, and give the server a moment to start before connecting.",
        solution: `#!/usr/bin/env bash
set -euo pipefail
BIN=\${1:-./chatd}; PORT=7099
$BIN "$PORT" & SRV=$!; trap 'kill "$SRV" 2>/dev/null; wait "$SRV" 2>/dev/null || true' EXIT
sleep 0.5
(sleep 2) | nc -q 1 127.0.0.1 "$PORT" > /tmp/b.out & CLI=$!
sleep 0.3
printf '/nick alice\\nhello test\\n' | nc -q 1 127.0.0.1 "$PORT" > /dev/null
wait "$CLI" || true
[ "$(grep -c 'hello test' /tmp/b.out)" -eq 1 ] || { echo FAIL; exit 1; }
echo PASS`,
      },
    ],
    faq: [
      {
        q: "What is the difference between definitely lost and still reachable in valgrind?",
        a: "Definitely lost means no pointer to the block exists anymore, which is a real leak to fix. Still reachable means a pointer still existed at exit, which often just means the program did not free everything before quitting.",
      },
      {
        q: "Should I use ASan or valgrind?",
        a: "Use ASan for everyday testing because it is much faster and gives precise reports. Use valgrind as an extra check on the release binary, since it needs no rebuild and also finds reads of uninitialised memory.",
      },
      {
        q: "Where do my program's printf logs go when it runs under systemd?",
        a: "By default stdout and stderr go to the journal. Read them with journalctl -u chatd, and remember to fflush or use line buffering, because stdout is fully buffered when it is not a terminal.",
      },
      {
        q: "How do I make a flame graph from perf data?",
        a: "Record with perf record -g, then use Brendan Gregg's FlameGraph scripts: perf script | stackcollapse-perf.pl | flamegraph.pl > out.svg. Open the SVG in a browser and look for the widest bars.",
      },
    ],
  },
};

export default extra;
