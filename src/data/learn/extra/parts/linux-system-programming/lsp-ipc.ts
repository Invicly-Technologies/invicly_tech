import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-ipc/pipes-fifos": {
    plain: [
      "A pipe is a one-way tube inside the kernel. One process pushes bytes in at one end, another pulls them out at the other end, in the same order. Nothing is stored on disk. When you type ls | wc -l, the shell builds exactly such a tube between ls and wc.",
      "A pipe has two file descriptors: one for reading and one for writing. Usually a process creates the pipe, then forks, so the child gets copies of both ends. Each side then closes the end it does not need, and the two processes can talk.",
      "The tube has a limited size. If the writer is faster than the reader and the tube fills up, the writer simply waits. If the tube is empty, the reader waits. This automatic waiting keeps a fast program from flooding a slow one.",
      "A FIFO, also called a named pipe, is the same tube with a name in the file system, like /tmp/mypipe. Any two programs that know the name can open it, even if they are not parent and child.",
    ],
    deepDive: [
      {
        heading: "Pipe capacity, blocking and atomic writes",
        body: "On Linux a pipe holds 65536 bytes (16 pages) by default. You can read the size with fcntl(fd, F_GETPIPE_SZ) and change it with F_SETPIPE_SZ, up to the limit in /proc/sys/fs/pipe-max-size (1 MiB by default for normal users). When the buffer is full, write blocks; when it is empty, read blocks. With O_NONBLOCK both return -1 with EAGAIN instead.\n\nWrites of PIPE_BUF bytes or fewer (4096 on Linux) are atomic: if several processes write to the same pipe, each small write arrives in one piece. Larger writes can be split and mixed with other writers' data. This is why many processes can safely log short lines into one pipe, but not large blocks.",
        bullets: ["read may return fewer bytes than you asked for; always loop", "pipe2(fds, O_CLOEXEC | O_NONBLOCK) sets flags in one step", "ulimit -p shows PIPE_BUF in 512-byte units on some shells"],
      },
      {
        heading: "EOF, SIGPIPE and why you must close unused ends",
        body: "The kernel counts how many descriptors point at each end. A reader gets EOF (read returns 0) only when the buffer is empty and every write end is closed, in every process. A writer whose pipe has no read end left gets SIGPIPE, which ends the process by default; if SIGPIPE is ignored, write fails with EPIPE instead.\n\nThis is why every unused end must be closed. After fork, the parent and the child both hold both ends. If the parent keeps its copy of the write end open, the reader never sees EOF and waits forever. The command yes | head -1 shows SIGPIPE at work: head exits after one line, and yes is killed by SIGPIPE the next time it writes, so its exit status is 141 (128 + 13).",
        bullets: ["Hang with no output: look for a stray write end", "echo \"${PIPESTATUS[@]}\" in bash shows every stage's exit code", "Servers usually ignore SIGPIPE and check writes for EPIPE"],
      },
      {
        heading: "Wiring a longer pipeline",
        body: "A pipeline of N commands needs N minus 1 pipes. Each child connects its input to the read end of the pipe on its left and its output to the write end of the pipe on its right, using dup2, then closes every original pipe descriptor before exec. The first command keeps the terminal as its input and the last keeps it as its output.\n\nThe parent creates pipes one at a time as it goes: after forking command i, it closes the read end of the previous pipe and the write end of the current pipe, and remembers the current read end for the next command. This way no process ever holds more pipe ends than it needs. Finally the parent waits for all children; shells report the exit code of the last command unless set -o pipefail is on.",
        visual: {
          type: "compare",
          title: "Descriptors 0 and 1 in ls | grep x | wc -l",
          columns: [
            { title: "ls", points: ["fd 0: the terminal", "fd 1: pipe A write end", "All other pipe fds closed"] },
            { title: "grep x", points: ["fd 0: pipe A read end", "fd 1: pipe B write end", "All other pipe fds closed"] },
            { title: "wc -l", points: ["fd 0: pipe B read end", "fd 1: the terminal", "All other pipe fds closed"] },
          ],
        },
      },
      {
        heading: "FIFOs: opening rules and server patterns",
        body: "mkfifo(path, 0600) or the mkfifo command creates a FIFO. The data still goes through a kernel buffer; the file is only a meeting point. Opening has special rules: open for reading blocks until someone opens for writing, and the reverse. With O_NONBLOCK, opening for reading succeeds at once, while opening write-only fails with ENXIO if no reader exists yet.\n\nA common pattern is a server that reads requests from one well-known FIFO. When the last client closes its write end, the server reads EOF, which is usually not what you want. The usual fix is for the server to also open the FIFO for writing itself and keep that descriptor open, so the writer count never drops to zero. Keep each client message at or below PIPE_BUF bytes, so messages from different clients never mix.",
        visual: {
          type: "sequence",
          title: "Opening a FIFO from two programs",
          actors: ["Reader", "Kernel", "Writer"],
          messages: [
            { from: 0, to: 1, label: "open(\"/tmp/jobs\", O_RDONLY) blocks" },
            { from: 2, to: 1, label: "open(\"/tmp/jobs\", O_WRONLY)" },
            { from: 1, to: 0, label: "both opens return" },
            { from: 2, to: 0, label: "write(\"job 1\\n\") arrives in order" },
            { from: 2, to: 1, label: "close: last writer gone" },
            { from: 1, to: 0, label: "read returns 0 (EOF)" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What happens on read and write",
        root: "Pipe states",
        children: [
          { label: "Reader calls read", children: ["Data waiting: returns up to that much", "Empty, writers open: blocks (or EAGAIN)", "Empty, no writers: returns 0 (EOF)"] },
          { label: "Writer calls write", children: ["Space free: copies data in", "Full: blocks (or EAGAIN)", "No readers: SIGPIPE or EPIPE"] },
        ],
      },
    ],
    examples: [
      {
        title: "Capture a command's output, like popen",
        explanation: "You want the output of date inside your program. Step 1: create a pipe. Step 2: fork; the child moves the write end onto stdout with dup2, closes both original ends and execs date. Step 3: the parent closes the write end (otherwise it never sees EOF) and reads until read returns 0. Step 4: wait for the child to collect its status.",
        code: {
          lang: "c",
          code: `int fds[2];
if (pipe(fds) < 0) { perror("pipe"); return 1; }
pid_t pid = fork();
if (pid < 0) { perror("fork"); return 1; }
if (pid == 0) {
  dup2(fds[1], STDOUT_FILENO); close(fds[0]); close(fds[1]);
  execlp("date", "date", "+%F %T", (char *)NULL); perror("execlp"); _exit(127);
}
close(fds[1]);                       /* essential, or no EOF */
char buf[256]; ssize_t n; size_t total = 0;
while ((n = read(fds[0], buf + total, sizeof buf - 1 - total)) > 0) total += (size_t)n;
buf[total] = '\\0'; close(fds[0]);
waitpid(pid, NULL, 0);
printf("date said: %s", buf);`,
        },
      },
      {
        title: "A FIFO between two terminals",
        explanation: "Two unrelated shells can talk through a FIFO. Step 1: create it. Step 2: in terminal 1, start a reader; it blocks until a writer appears. Step 3: in terminal 2, send lines. Step 4: when the writer closes, the reader sees EOF and cat exits. The reader loop in the last line reopens the FIFO each time, a simple way to keep a log collector alive between writers.",
        code: {
          lang: "bash",
          code: `mkfifo -m 600 /tmp/logpipe
ls -l /tmp/logpipe             # type p: prw-------
# terminal 1
cat /tmp/logpipe               # blocks until a writer opens
# terminal 2
echo "build finished" > /tmp/logpipe
# a collector that survives many writers
while true; do cat /tmp/logpipe >> collected.log; done`,
        },
      },
    ],
    cheatSheet: [
      "pipe(fds): fds[0] is the read end, fds[1] the write end",
      "Default pipe capacity on Linux is 64 KiB; change it with F_SETPIPE_SZ",
      "Writes up to PIPE_BUF (4096 bytes) are atomic between writers",
      "EOF arrives only when every write end in every process is closed",
      "Exit status 141 means the process was killed by SIGPIPE",
      "mkfifo name creates a named pipe; ls -l shows it with type p",
      "Opening a FIFO blocks until the other side opens too",
      "set -o pipefail makes a pipeline fail if any stage fails",
    ],
    quiz: [
      {
        q: "A child writes into a pipe and exits, but the parent's read never returns 0. What is the likely bug?",
        options: ["The pipe is full", "The parent still has the write end open", "The child used _exit", "Pipes never return EOF"],
        answer: 1,
        why: "EOF needs every write end closed, including the parent's own copy.",
      },
      {
        q: "Several processes write 200-byte log lines to one pipe. Can lines get mixed together?",
        options: ["Yes, always", "Only on multi-core machines", "No, writes of PIPE_BUF bytes or less are atomic", "Only if the pipe is non-blocking"],
        answer: 2,
        why: "Writes up to PIPE_BUF (4096 on Linux) arrive in one piece.",
      },
      {
        q: "What happens by default when a process writes to a pipe whose read ends are all closed?",
        options: ["It receives SIGPIPE and terminates", "The data is kept for later", "write returns 0", "The kernel opens a new reader"],
        answer: 0,
        why: "No readers means SIGPIPE; with SIGPIPE ignored, write fails with EPIPE.",
      },
      {
        q: "A process opens a FIFO with O_WRONLY | O_NONBLOCK and no reader exists. What happens?",
        options: ["It blocks until a reader arrives", "It succeeds and data is discarded", "It succeeds and writes block later", "open fails with ENXIO"],
        answer: 3,
        why: "A non-blocking write-only open needs a reader already present.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the exit status of each stage of yes | head -3 and explain the numbers.",
        hint: "bash stores all stage statuses in the PIPESTATUS array.",
        solution: `yes | head -3
echo "\${PIPESTATUS[@]}"   # 141 0
# head exits 0 after 3 lines; yes then gets SIGPIPE: 128 + 13 = 141`,
      },
      {
        level: "medium",
        task: "Write a C program that runs ls | wc -l using pipe, two forks, dup2 and execlp, and waits for both children.",
        hint: "Each child closes both pipe ends after dup2; the parent closes both before waiting.",
        solution: `int f[2]; if (pipe(f) < 0) { perror("pipe"); return 1; }
if (fork() == 0) { dup2(f[1], 1); close(f[0]); close(f[1]);
  execlp("ls", "ls", (char *)NULL); _exit(127); }
if (fork() == 0) { dup2(f[0], 0); close(f[0]); close(f[1]);
  execlp("wc", "wc", "-l", (char *)NULL); _exit(127); }
close(f[0]); close(f[1]);
while (wait(NULL) > 0) {}`,
      },
      {
        level: "hard",
        task: "Write a FIFO server that reads newline-terminated requests from /tmp/reqs forever, without exiting when clients disconnect, and prints each line.",
        hint: "Open the FIFO for reading, then also open it for writing yourself so the writer count never reaches zero.",
        solution: `if (mkfifo("/tmp/reqs", 0600) < 0 && errno != EEXIST) { perror("mkfifo"); return 1; }
int rd = open("/tmp/reqs", O_RDONLY | O_NONBLOCK);
int keep = open("/tmp/reqs", O_WRONLY);          /* dummy writer */
if (rd < 0 || keep < 0) { perror("open"); return 1; }
fcntl(rd, F_SETFL, fcntl(rd, F_GETFL) & ~O_NONBLOCK);  /* blocking reads */
FILE *in = fdopen(rd, "r"); char line[512];
while (fgets(line, sizeof line, in)) printf("request: %s", line);`,
      },
    ],
    faq: [
      { q: "What is the difference between a pipe and a FIFO?", a: "They work the same way, but a pipe has no name and is shared only through fork, while a FIFO has a path in the file system so unrelated processes can open it." },
      { q: "Is data in a named pipe written to disk?", a: "No. The FIFO file is only a name; the data passes through a kernel buffer in memory." },
      { q: "Can a pipe be used in both directions?", a: "No, a pipe is one-way. Use two pipes, or a Unix socket pair made with socketpair, for two-way talk." },
      { q: "Why does my pipeline hang?", a: "Usually some process still holds a write end, so the reader never gets EOF. Close every unused end after fork." },
    ],
  },

  "lsp-ipc/shared-memory": {
    plain: [
      "Most ways of talking between processes copy data: the sender hands bytes to the kernel, and the kernel copies them to the receiver. Shared memory skips that. Two processes look at the very same piece of memory, so what one writes the other can read immediately.",
      "Think of a whiteboard in a shared office. Anyone can write on it and everyone sees the change at once. That is very fast. But if two people write in the same spot at the same time, the result is a mess. So you need a rule, such as \"only the person holding the marker may write\".",
      "In programs, that rule is a semaphore or a lock. A semaphore is a counter that processes decrease before entering and increase when leaving. If the counter is zero, the next process waits. The kernel does not add any such rule for you; you must add it yourself.",
      "POSIX shared memory objects have names like /demo and live in /dev/shm, which is memory, not disk. They stay there until someone deletes them or the machine reboots, even after every program using them has exited.",
    ],
    deepDive: [
      {
        heading: "What shm_open and mmap really create",
        body: "shm_open(\"/demo\", O_CREAT | O_RDWR, 0600) creates a file in /dev/shm, which is a tmpfs: a file system kept in RAM. The name must start with a slash and contain no other slashes. A new object has size 0, so ftruncate sets its size; the new bytes read as zero. mmap with MAP_SHARED then maps the object's pages into your address space.\n\nWhen a second process maps the same object, its page tables point at the same physical pages. No data is ever copied. The pages count as Shmem in /proc/meminfo, and /dev/shm is usually limited to half of RAM. Because each process may map the region at a different virtual address, store offsets inside the region, never raw pointers.",
        visual: {
          type: "tree",
          title: "One object, two views",
          root: "Physical pages of /dev/shm/demo",
          children: [
            { label: "Process A", children: ["Mapped at 0x7f12a000", "Reads and writes directly"] },
            { label: "Process B", children: ["Mapped at 0x7f88c000", "Sees A's writes at once"] },
            { label: "tmpfs name", children: ["/dev/shm/demo", "Removed by shm_unlink"] },
          ],
        },
      },
      {
        heading: "POSIX semaphores: named and unnamed",
        body: "A semaphore holds a non-negative count. sem_wait decreases it, or blocks while it is zero; sem_post increases it and wakes one waiter. Start the count at 1 to use it as a lock, or at 0 to use it as a \"data is ready\" signal. sem_post is async-signal-safe, so even a signal handler may call it. sem_trywait never blocks, and sem_timedwait takes an absolute CLOCK_REALTIME deadline.\n\nNamed semaphores come from sem_open(\"/name\", O_CREAT, 0600, 1) and appear as /dev/shm/sem.name, so unrelated programs can find them; remove them with sem_unlink. Unnamed semaphores are placed inside your shared region and set up with sem_init(&s, 1, 1), where the 1 in the middle means shared between processes. Unnamed ones are handy because the lock lives right next to the data it protects. Always handle EINTR from sem_wait.",
        bullets: ["Build with gcc -pthread", "sem_getvalue shows the current count, useful for debugging", "A semaphore has no owner, so any process may post it"],
      },
      {
        heading: "Process-shared mutexes and crash safety",
        body: "A pthread mutex can also work across processes when it lives in shared memory and its attributes say PTHREAD_PROCESS_SHARED. Condition variables have the same attribute, so you can build a full producer and consumer queue in shared memory.\n\nThe hard question is what happens when a process dies while holding the lock. With a semaphore nothing tells the others; the count just stays at zero and everyone waits forever. A robust mutex solves this: set PTHREAD_MUTEX_ROBUST with pthread_mutexattr_setrobust. If the owner dies, the next pthread_mutex_lock returns EOWNERDEAD. That process now holds the lock, should repair the data, and calls pthread_mutex_consistent before unlocking. C11 atomics on lock-free types also work across processes and are good for simple counters and flags.",
      },
      {
        heading: "Lifecycle, setup races and cleanup",
        body: "Shared memory outlives processes. Unmapping or exiting does not remove the object; only shm_unlink (or rm in /dev/shm) does, and the memory is freed after the last mapping is gone, just like unlinking an open file. Forgotten objects keep using RAM until reboot.\n\nWhen several processes start at once, decide who sets things up. Open with O_CREAT | O_EXCL: exactly one process succeeds and initialises the region (sizes, semaphores, a header with a magic number and version), and the others get EEXIST, open without O_CREAT and wait until the header says ready. Never shrink an object while others have it mapped: touching a page beyond the new end raises SIGBUS.",
        visual: {
          type: "flow",
          title: "Safe startup of a shared region",
          steps: [
            { label: "shm_open O_CREAT|O_EXCL", detail: "Only one process wins." },
            { label: "Winner: ftruncate and mmap", detail: "Zero-filled region." },
            { label: "Winner: init header", detail: "sem_init, version, then ready = 1." },
            { label: "Others: open and map", detail: "Wait until ready is set." },
            { label: "Last user: shm_unlink", detail: "Name removed, RAM freed after munmap." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Ways to get shared memory",
        columns: [
          { title: "POSIX shm_open", points: ["Named object in /dev/shm", "Unrelated processes can open it", "Remove with shm_unlink", "Modern, file-like API"] },
          { title: "MAP_SHARED | MAP_ANONYMOUS", points: ["No name at all", "Created before fork", "Only parent and children share it", "Freed when the last user exits"] },
          { title: "memfd_create", points: ["Anonymous file descriptor", "Send it over a Unix socket", "Can be sealed read-only", "Linux only"] },
        ],
      },
    ],
    examples: [
      {
        title: "Two processes increment one counter correctly",
        explanation: "Parent and child each add 1 to a shared counter a million times. Step 1: create an anonymous shared mapping before fork, so both see it. Step 2: put an unnamed semaphore inside it with pshared set to 1 and a starting value of 1. Step 3: each increment happens between sem_wait and sem_post. Step 4: the parent waits and prints 2000000. Remove the two semaphore calls in the loop and the total comes out lower, because updates are lost. Build with gcc -pthread.",
        code: {
          lang: "c",
          code: `#include <semaphore.h>
#include <stdio.h>
#include <sys/mman.h>
#include <sys/wait.h>
#include <unistd.h>
struct shared { sem_t lock; long counter; };
int main(void) {
  struct shared *s = mmap(NULL, sizeof *s, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_ANONYMOUS, -1, 0);
  if (s == MAP_FAILED || sem_init(&s->lock, 1, 1) < 0) { perror("setup"); return 1; }
  pid_t pid = fork();
  if (pid < 0) { perror("fork"); return 1; }
  for (int i = 0; i < 1000000; i++) { sem_wait(&s->lock); s->counter++; sem_post(&s->lock); }
  if (pid == 0) _exit(0);
  waitpid(pid, NULL, 0);
  printf("counter = %ld (expect 2000000)\\n", s->counter);
  return 0;
}`,
        },
      },
      {
        title: "Finding and cleaning leftover objects",
        explanation: "After a few crashed test runs, the server is short on memory. Step 1: list /dev/shm; POSIX shared memory objects and named semaphores (sem.*) live there. Step 2: check how full the tmpfs is and how much RAM is counted as Shmem. Step 3: see whether any process still maps an object before deleting it. Step 4: remove the leftovers; rm does the same as shm_unlink or sem_unlink.",
        code: {
          lang: "bash",
          code: `ls -l /dev/shm
df -h /dev/shm
grep Shmem: /proc/meminfo
sudo lsof /dev/shm/demo        # any process still using it?
rm /dev/shm/demo /dev/shm/sem.demo_lock`,
        },
      },
    ],
    cheatSheet: [
      "shm_open, then ftruncate to set the size, then mmap with MAP_SHARED",
      "Names look like /demo: one leading slash, no others",
      "sem_init(&s, 1, 1) makes an unnamed semaphore shared between processes",
      "Named semaphores appear in /dev/shm as sem.NAME",
      "Store offsets, not pointers, in shared memory",
      "Use O_CREAT | O_EXCL so exactly one process initialises the region",
      "Robust mutexes return EOWNERDEAD when the previous owner died",
      "Nothing is removed at exit; call shm_unlink and sem_unlink",
    ],
    quiz: [
      {
        q: "Why should a linked list in shared memory use offsets instead of pointers?",
        options: ["Pointers are too large", "Each process may map the region at a different address", "The kernel forbids pointers in /dev/shm", "Offsets are faster to compare"],
        answer: 1,
        why: "A pointer valid in one process may point to something else in another process's address space.",
      },
      {
        q: "What does a new POSIX shared memory object contain right after shm_open with O_CREAT?",
        options: ["4096 zero bytes", "Random leftover data", "Nothing: its size is 0 until ftruncate", "A copy of the creator's heap"],
        answer: 2,
        why: "New objects have size 0; ftruncate sets the size and the new bytes read as zero.",
      },
      {
        q: "A process holding a semaphore-based lock crashes. What happens to the other processes?",
        options: ["They keep waiting forever, because the count is never posted", "The kernel posts the semaphore automatically", "They receive SIGCHLD", "The semaphore is deleted"],
        answer: 0,
        why: "Semaphores have no owner, so a crash is not detected; robust mutexes handle this case.",
      },
      {
        q: "Every program using /dev/shm/demo has exited. Is the memory freed?",
        options: ["Yes, at the last exit", "Yes, after one minute", "Only if the file is empty", "No, it stays until shm_unlink or reboot"],
        answer: 3,
        why: "The named object persists until it is unlinked; only then is its RAM released.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write program A that creates /greeting, writes a message into it and exits, and program B that maps it read-only and prints the message.",
        hint: "B opens with O_RDONLY and maps with PROT_READ; size is known (4096).",
        solution: `/* B */
int fd = shm_open("/greeting", O_RDONLY, 0);
if (fd < 0) { perror("shm_open"); return 1; }
char *p = mmap(NULL, 4096, PROT_READ, MAP_SHARED, fd, 0);
if (p == MAP_FAILED) { perror("mmap"); return 1; }
printf("%s\\n", p);
munmap(p, 4096); close(fd);
shm_unlink("/greeting");   /* clean up after reading */`,
      },
      {
        level: "medium",
        task: "Make a one-slot mailbox in shared memory: the writer puts a string and posts a \"full\" semaphore; the reader waits on it, prints the string and posts an \"empty\" semaphore.",
        hint: "Two unnamed semaphores in the region: empty starts at 1, full starts at 0.",
        solution: `struct box { sem_t empty, full; char msg[256]; };
/* init once: sem_init(&b->empty, 1, 1); sem_init(&b->full, 1, 0); */
void put(struct box *b, const char *s) {
  sem_wait(&b->empty);
  snprintf(b->msg, sizeof b->msg, "%s", s);
  sem_post(&b->full);
}
void get(struct box *b, char *out, size_t n) {
  sem_wait(&b->full);
  snprintf(out, n, "%s", b->msg);
  sem_post(&b->empty);
}`,
      },
      {
        level: "hard",
        task: "Put a robust, process-shared mutex in shared memory. Have a child lock it and exit without unlocking; the parent must detect this and recover.",
        hint: "Set both PTHREAD_PROCESS_SHARED and PTHREAD_MUTEX_ROBUST; check for EOWNERDEAD.",
        solution: `pthread_mutexattr_t a; pthread_mutexattr_init(&a);
pthread_mutexattr_setpshared(&a, PTHREAD_PROCESS_SHARED);
pthread_mutexattr_setrobust(&a, PTHREAD_MUTEX_ROBUST);
pthread_mutex_init(&s->m, &a);       /* s points into a MAP_SHARED region */
pid_t pid = fork();
if (pid == 0) { pthread_mutex_lock(&s->m); _exit(0); }   /* dies holding it */
waitpid(pid, NULL, 0);
int r = pthread_mutex_lock(&s->m);
if (r == EOWNERDEAD) { puts("owner died, repairing"); pthread_mutex_consistent(&s->m); }
pthread_mutex_unlock(&s->m);`,
      },
    ],
    faq: [
      { q: "Is shared memory the fastest IPC on Linux?", a: "Yes for moving data, because nothing is copied. But you pay with the effort of synchronising access correctly." },
      { q: "Where can I see POSIX shared memory objects?", a: "In /dev/shm. You can list them with ls -l and remove leftovers with rm." },
      { q: "Should I use System V shared memory (shmget) or POSIX?", a: "Prefer POSIX shm_open for new code; its file-like API is simpler. System V shared memory still works and is listed with ipcs -m." },
      { q: "Do I need a lock if only one process writes?", a: "Usually yes, or at least atomics: the reader can otherwise see a half-written record. A semaphore or a sequence counter tells it when data is complete." },
    ],
  },

  "lsp-ipc/message-queues": {
    plain: [
      "A message queue is like a mailbox kept by the kernel. A process drops in a whole message, and another process takes out a whole message. Unlike a pipe, which is a stream of bytes with no edges, a queue always keeps each message separate.",
      "Each message also has a priority number. When a reader takes a message, it always gets the one with the highest priority, and among equal priorities, the oldest one. So an \"urgent\" job can jump ahead of routine work.",
      "A queue has a name such as /jobs and keeps existing even when no program has it open, until someone removes it. A producer can fill it now and a consumer can read it later, as long as the machine stays up.",
      "Queues are best for small messages: commands, job IDs or short status updates. For big data, shared memory is faster; for a stream of bytes, a pipe or socket is simpler.",
    ],
    deepDive: [
      {
        heading: "Attributes and system limits",
        body: "Every queue has two fixed attributes chosen at mq_open: mq_maxmsg, how many messages it can hold, and mq_msgsize, the largest message in bytes. If you pass NULL, Linux uses the defaults in /proc/sys/fs/mqueue/msg_default (10) and msgsize_default (8192). Unprivileged processes may not exceed msg_max (10 by default) and msgsize_max (8192 by default); asking for more fails with EINVAL. queues_max limits how many queues exist in total (256 by default).\n\nThe memory a user's queues can reserve is capped by the RLIMIT_MSGQUEUE resource limit, 819200 bytes by default, so very large queues need a raised limit. mq_getattr reads the attributes and the current message count (mq_curmsgs). mq_setattr can only change the O_NONBLOCK flag; size limits are fixed for the queue's lifetime.",
        bullets: ["sysctl fs.mqueue.msg_max shows the per-queue cap", "ulimit -q shows the message queue byte limit", "Link with -lrt on systems whose glibc needs it"],
      },
      {
        heading: "Blocking, timeouts and polling",
        body: "mq_send blocks while the queue is full; mq_receive blocks while it is empty. Open with O_NONBLOCK and both return -1 with EAGAIN instead. mq_timedsend and mq_timedreceive take an absolute deadline on CLOCK_REALTIME and fail with ETIMEDOUT when it passes, so compute it as now plus your timeout.\n\nPriorities run from 0 up to sysconf(_SC_MQ_PRIO_MAX) minus 1, which is 32767 on Linux. The receive buffer must be at least mq_msgsize bytes, or mq_receive fails with EMSGSIZE, even if the waiting message is tiny. On Linux an mqd_t is a real file descriptor, so you can add a queue to poll or epoll and treat \"message waiting\" as just another event in your loop.",
      },
      {
        heading: "mq_notify: being told when mail arrives",
        body: "mq_notify registers the calling process to be notified when a message lands in an empty queue. The notification can be a signal (SIGEV_SIGNAL) or a function started in a new thread (SIGEV_THREAD). It is one-shot: after it fires you must register again, and you should drain the queue first, because further messages in a non-empty queue do not notify.\n\nOnly one process can be registered per queue, and no notification is sent if another process is already blocked in mq_receive, because that process gets the message directly. These rules make mq_notify easy to get wrong. On Linux, putting the queue descriptor into epoll is usually simpler and more predictable.",
      },
      {
        heading: "The mqueue file system and cleanup",
        body: "Linux shows queues as files in a special file system mounted at /dev/mqueue (mount -t mqueue none /dev/mqueue if it is missing). cat /dev/mqueue/jobs prints a line such as QSIZE:129 NOTIFY:0 SIGNO:0 NOTIFY_PID:0, where QSIZE is the total bytes of queued messages. ls -l shows the owner and permissions, which control who may open the queue.\n\nA queue lives until mq_unlink or reboot. Like files, unlinking removes the name at once, while processes that already have it open keep using it until they close it. Long-running services should unlink stale queues at startup or use O_EXCL to detect leftovers. Inside containers, queues are separated by the IPC namespace.",
        visual: {
          type: "flow",
          title: "From creation to cleanup",
          steps: [
            { label: "mq_open O_CREAT", detail: "Appears as /dev/mqueue/jobs." },
            { label: "Producers send", detail: "Blocks or EAGAIN when full." },
            { label: "Consumers receive", detail: "Highest priority, oldest first." },
            { label: "mq_close", detail: "Each process releases its handle." },
            { label: "mq_unlink", detail: "Name removed; freed after last close." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Priorities decide the order",
        actors: ["Producer", "Queue /jobs", "Consumer"],
        messages: [
          { from: 0, to: 1, label: "send \"resize photo\" priority 1" },
          { from: 0, to: 1, label: "send \"send invoice\" priority 1" },
          { from: 0, to: 1, label: "send \"reset password\" priority 9" },
          { from: 2, to: 1, label: "mq_receive" },
          { from: 1, to: 2, label: "\"reset password\" (highest first)" },
          { from: 1, to: 2, label: "then \"resize photo\" (oldest of priority 1)" },
        ],
      },
      {
        type: "compare",
        title: "Pipe vs message queue vs shared memory",
        columns: [
          { title: "Pipe or FIFO", points: ["Byte stream, no boundaries", "Strict arrival order", "Gone when all ends close", "Best for streaming data"] },
          { title: "Message queue", points: ["Whole messages kept separate", "Priority ordering", "Persists until mq_unlink", "Best for small jobs and commands"] },
          { title: "Shared memory", points: ["No copying", "You define the structure", "You add all locking", "Best for large or frequent data"] },
        ],
      },
    ],
    examples: [
      {
        title: "A job consumer that sizes its buffer correctly",
        explanation: "The consumer does not know the queue's message size in advance. Step 1: open the existing queue read-only. Step 2: ask mq_getattr for mq_msgsize and allocate a buffer that large, which avoids EMSGSIZE. Step 3: loop on mq_receive and print each job with its priority. Step 4: stop when a job called quit arrives. Messages are sent with their terminating NUL here, so they print as strings.",
        code: {
          lang: "c",
          code: `#include <fcntl.h>
#include <mqueue.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
  mqd_t q = mq_open("/jobs", O_RDONLY);
  struct mq_attr a;
  if (q == (mqd_t)-1 || mq_getattr(q, &a) < 0) { perror("mq"); return 1; }
  char *buf = malloc((size_t)a.mq_msgsize); unsigned prio; ssize_t n;
  if (!buf) return 1;
  while ((n = mq_receive(q, buf, (size_t)a.mq_msgsize, &prio)) >= 0) {
    printf("job %.*s (priority %u)\\n", (int)n, buf, prio);
    if (strcmp(buf, "quit") == 0) break;
  }
  free(buf); mq_close(q); return 0;
}`,
        },
      },
      {
        title: "Inspecting queues and limits from the shell",
        explanation: "A producer reports EAGAIN or EINVAL and you want to know why. Step 1: list existing queues. Step 2: read one queue's status line to see how many bytes are waiting. Step 3: check the system caps that limit mq_maxmsg and mq_msgsize for normal users. Step 4: raise a cap for testing (as root), or delete a stale queue left by a crashed run.",
        code: {
          lang: "bash",
          code: `ls -l /dev/mqueue
cat /dev/mqueue/jobs            # QSIZE:... NOTIFY:0 SIGNO:0 NOTIFY_PID:0
sysctl fs.mqueue                # msg_max, msgsize_max, queues_max ...
ulimit -q                       # bytes all your queues may reserve
sudo sysctl -w fs.mqueue.msg_max=100
rm /dev/mqueue/jobs             # same as mq_unlink("/jobs")`,
        },
      },
    ],
    cheatSheet: [
      "mq_open(\"/name\", O_CREAT | O_RDWR, 0600, &attr) creates a queue",
      "The receive buffer must be at least mq_msgsize bytes or you get EMSGSIZE",
      "Higher priority numbers are received first; equal priorities come in FIFO order",
      "Defaults: 10 messages of 8192 bytes; caps in /proc/sys/fs/mqueue",
      "mq_timedreceive takes an absolute CLOCK_REALTIME deadline",
      "On Linux an mqd_t is a file descriptor you can poll or epoll",
      "Queues appear in /dev/mqueue; remove one with mq_unlink or rm",
    ],
    quiz: [
      {
        q: "A queue has mq_msgsize 8192. You call mq_receive with a 100-byte buffer while a 10-byte message waits. What happens?",
        options: ["It returns the 10-byte message", "It fails with EMSGSIZE", "It blocks forever", "It returns the first 100 bytes of the queue"],
        answer: 1,
        why: "The buffer must be at least mq_msgsize, whatever the size of the waiting message.",
      },
      {
        q: "Messages are sent with priorities 3, 7, 3 in that order. What order does a reader get them in?",
        options: ["3, 7, 3", "3, 3, 7", "Random", "7, then the first 3, then the second 3"],
        answer: 3,
        why: "Highest priority first, and FIFO among equal priorities.",
      },
      {
        q: "Which attribute can mq_setattr change on an existing queue?",
        options: ["The O_NONBLOCK flag", "mq_maxmsg", "mq_msgsize", "The queue's name"],
        answer: 0,
        why: "Size limits are fixed at creation; only the non-blocking flag can change.",
      },
      {
        q: "An unprivileged program asks for mq_maxmsg = 50 with default sysctls. What happens?",
        options: ["The queue gets 50 slots", "The kernel silently uses 10", "mq_open fails with EINVAL", "The program is killed"],
        answer: 2,
        why: "msg_max defaults to 10 for unprivileged users, and exceeding it is rejected.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a queue with room for 5 messages of 64 bytes, send 3 messages, and print mq_curmsgs from mq_getattr.",
        hint: "Pass a filled struct mq_attr to mq_open.",
        solution: `struct mq_attr attr = { .mq_maxmsg = 5, .mq_msgsize = 64 };
mqd_t q = mq_open("/demo", O_CREAT | O_RDWR, 0600, &attr);
if (q == (mqd_t)-1) { perror("mq_open"); return 1; }
for (int i = 0; i < 3; i++) mq_send(q, "hi", 3, 0);
struct mq_attr now; mq_getattr(q, &now);
printf("%ld messages waiting\\n", now.mq_curmsgs);   /* 3 */
mq_close(q); mq_unlink("/demo");`,
      },
      {
        level: "medium",
        task: "Write a receiver that waits at most 2 seconds for a message and prints \"timeout\" if none arrives.",
        hint: "Build an absolute deadline from clock_gettime(CLOCK_REALTIME) plus 2 seconds.",
        solution: `struct timespec dl; clock_gettime(CLOCK_REALTIME, &dl);
dl.tv_sec += 2;
char buf[8192]; unsigned prio;
ssize_t n = mq_timedreceive(q, buf, sizeof buf, &prio, &dl);
if (n < 0 && errno == ETIMEDOUT) puts("timeout");
else if (n < 0) perror("mq_timedreceive");
else printf("got %zd bytes\\n", n);`,
      },
      {
        level: "hard",
        task: "Add a message queue to an epoll loop next to stdin, so the program handles typed lines and queued messages in the same loop.",
        hint: "Open the queue with O_NONBLOCK; its mqd_t works as an fd with epoll_ctl on Linux.",
        solution: `mqd_t q = mq_open("/jobs", O_RDONLY | O_NONBLOCK);
int ep = epoll_create1(0);
struct epoll_event e1 = { .events = EPOLLIN, .data.fd = 0 };
struct epoll_event e2 = { .events = EPOLLIN, .data.fd = (int)q };
epoll_ctl(ep, EPOLL_CTL_ADD, 0, &e1); epoll_ctl(ep, EPOLL_CTL_ADD, (int)q, &e2);
for (;;) { struct epoll_event ev; if (epoll_wait(ep, &ev, 1, -1) < 1) continue;
  char b[8192]; ssize_t n;
  if (ev.data.fd == 0) { n = read(0, b, sizeof b); if (n <= 0) break; }
  else while ((n = mq_receive(q, b, sizeof b, NULL)) >= 0) printf("job %.*s\\n", (int)n, b);
}`,
      },
    ],
    faq: [
      { q: "What is the difference between POSIX and System V message queues?", a: "POSIX queues (mq_open) use names and file descriptors and have a simpler API. System V queues (msgget) use numeric keys and message types, and are listed with ipcs -q." },
      { q: "Do message queues survive a reboot?", a: "No. They live in kernel memory and persist only until mq_unlink or a reboot." },
      { q: "Are message queues good for large data?", a: "Not really; each message is copied into and out of the kernel and sizes are capped. Send a small reference instead and keep the data in shared memory or a file." },
    ],
  },

  "lsp-ipc/unix-sockets": {
    plain: [
      "A Unix domain socket is a network socket that never leaves the computer. It uses the same functions as TCP networking (socket, bind, listen, accept, connect), but instead of an IP address and port, it uses a file path such as /run/app.sock.",
      "It is two-way, so client and server can both send and receive. One server can serve many clients at once, just like a web server. That makes it a natural fit for local services: Docker, systemd, PostgreSQL and many others listen on Unix sockets.",
      "Because the path is a file, normal file permissions decide who may connect. A socket owned by root with mode 660 and group docker lets only members of that group talk to the Docker daemon. The server can also ask the kernel exactly which user is on the other end.",
      "Unix sockets have one trick that no network socket has: a process can send an open file descriptor to another process. The receiver gets its own working handle to the same open file or connection, even if it could never have opened it itself.",
    ],
    deepDive: [
      {
        heading: "Three kinds of address",
        body: "A pathname socket is bound to a path in the file system. sun_path holds at most 108 bytes, including the final NUL, so keep paths short. bind creates the socket file, and it stays after the server exits, which is why servers unlink it first. ss -xl lists listening Unix sockets.\n\nAn abstract socket is Linux-only: its sun_path starts with a NUL byte, followed by a name. It has no file, so there is nothing to clean up, and it disappears when the last socket closes. It also has no file permissions, so any process in the same network namespace can connect; check the peer's identity yourself.\n\nAn unnamed socket comes from socketpair(AF_UNIX, SOCK_STREAM, 0, sv), which returns two already-connected ends. It is the two-way version of pipe for a parent and child.",
        visual: {
          type: "tree",
          title: "Unix socket address types",
          root: "AF_UNIX address",
          children: [
            { label: "Pathname", children: ["/run/app.sock", "File permissions apply", "unlink before bind"] },
            { label: "Abstract (Linux)", children: ["Leading NUL byte", "No file to clean up", "No permission bits"] },
            { label: "Unnamed", children: ["socketpair()", "Two connected ends", "Shared through fork"] },
          ],
        },
      },
      {
        heading: "Stream, datagram and seqpacket",
        body: "SOCK_STREAM behaves like TCP: a reliable, ordered byte stream with no message boundaries, so you must frame messages yourself, for example with newlines or a length prefix. SOCK_DGRAM keeps each message separate like UDP, but on Linux local datagrams are reliable and do not get reordered; a full receiver makes the sender block instead of dropping data. SOCK_SEQPACKET is connection-based like a stream but keeps message boundaries, which is often exactly what a request and reply protocol wants.\n\nFor a datagram server, clients that want replies must bind their own address too, otherwise the server has nowhere to send the answer. Stream sockets avoid this because the connection itself identifies the client.",
      },
      {
        heading: "Who is on the other end?",
        body: "On Linux, connecting to a pathname socket needs write permission on the socket file and search permission on its directories. Put sockets in a directory such as /run/myapp with mode 750 and choose the group carefully. Remember that access to some sockets equals root access: anyone who can write to /var/run/docker.sock can start a privileged container.\n\nThe server can ask the kernel for the peer's credentials with getsockopt(fd, SOL_SOCKET, SO_PEERCRED, &cred, &len), which fills a struct ucred with pid, uid and gid (define _GNU_SOURCE). The kernel records these values at connect time, so the client cannot lie about them. Many daemons use this to allow root or one service user only.",
        bullets: ["ss -xp shows which process owns each Unix socket", "struct ucred c; socklen_t l = sizeof c; getsockopt(fd, SOL_SOCKET, SO_PEERCRED, &c, &l);", "systemd socket units set ownership with SocketUser= and SocketMode="],
      },
      {
        heading: "Passing descriptors with SCM_RIGHTS",
        body: "sendmsg can carry ancillary data next to normal bytes. With level SOL_SOCKET and type SCM_RIGHTS, the ancillary data is an array of file descriptors. The kernel does not copy the numbers; it installs new descriptors in the receiving process that refer to the same open files, with the same offsets and flags. The receiver's numbers are usually different from the sender's.\n\nSend at least one byte of normal data together with the descriptors, and have the receiver pass MSG_CMSG_CLOEXEC to recvmsg so the new descriptors do not leak into its children. Uses include privilege separation (a small root helper opens a protected file and hands it over), handing a listening socket to a new version of a server for zero-downtime restarts, and passing memfd buffers between processes.",
        visual: {
          type: "sequence",
          title: "Handing over an open file",
          actors: ["Helper (root)", "Kernel", "Worker (user)"],
          messages: [
            { from: 0, to: 1, label: "open(\"/etc/secret.conf\") = fd 5" },
            { from: 0, to: 1, label: "sendmsg with SCM_RIGHTS [5]" },
            { from: 1, to: 2, label: "installs new fd 7, same open file" },
            { from: 2, to: 2, label: "read(7, ...) works without permission to open" },
            { from: 0, to: 1, label: "close(5): the worker's fd 7 stays valid" },
          ],
        },
      },
      {
        heading: "Choosing an IPC mechanism",
        body: "Start with the simplest tool that fits. A pipe is perfect when a parent feeds a child or reads its output in one direction. A Unix stream socket is the default for local client and server designs: two-way, many clients, permission control, peer credentials and descriptor passing, and the code moves to TCP easily if the service ever needs to go remote.\n\nChoose a message queue when you want small, prioritised messages that survive the sender exiting. Choose shared memory only when you move a lot of data or need very low latency, and accept the extra work of locking and crash recovery. Many real systems combine them: a Unix socket for control messages and a shared memory buffer, passed as a memfd over that socket, for bulk data.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Unix socket types",
        columns: [
          { title: "SOCK_STREAM", points: ["Connection, like TCP", "Byte stream, frame it yourself", "Most common choice", "Used by Docker and PostgreSQL"] },
          { title: "SOCK_DGRAM", points: ["No connection, like UDP", "Message boundaries kept", "Reliable and ordered locally", "Used by journald's /dev/log"] },
          { title: "SOCK_SEQPACKET", points: ["Connection-based", "Message boundaries kept", "Reads one message at a time", "Good for request and reply"] },
        ],
      },
    ],
    examples: [
      {
        title: "A client for the explainer's server",
        explanation: "This client connects to /tmp/demo.sock and prints everything the server sends. Step 1: create an AF_UNIX stream socket. Step 2: fill sockaddr_un, copying the path safely with strncpy and room for the NUL. Step 3: connect; ENOENT means no socket file exists and ECONNREFUSED means the file exists but nobody listens. Step 4: read until the server closes the connection (read returns 0).",
        code: {
          lang: "c",
          code: `#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>
int main(void) {
  int s = socket(AF_UNIX, SOCK_STREAM, 0);
  if (s < 0) { perror("socket"); return 1; }
  struct sockaddr_un a = { .sun_family = AF_UNIX };
  strncpy(a.sun_path, "/tmp/demo.sock", sizeof a.sun_path - 1);
  if (connect(s, (struct sockaddr *)&a, sizeof a) < 0) { perror("connect"); return 1; }
  char buf[128]; ssize_t n;
  while ((n = read(s, buf, sizeof buf)) > 0) fwrite(buf, 1, (size_t)n, stdout);
  close(s); return 0;
}`,
        },
      },
      {
        title: "Sending a file descriptor",
        explanation: "This function sends one open descriptor over a connected Unix socket. Step 1: prepare one byte of real data, because some data must travel with the descriptor. Step 2: reserve a control buffer of CMSG_SPACE(sizeof(int)) bytes; the union keeps it correctly aligned. Step 3: fill the control message header with SOL_SOCKET and SCM_RIGHTS and copy the descriptor in with memcpy. Step 4: sendmsg. The receiver mirrors this with recvmsg and reads the new descriptor from CMSG_DATA.",
        code: {
          lang: "c",
          code: `int send_fd(int sock, int fd) {
  char byte = 'F';
  struct iovec iov = { .iov_base = &byte, .iov_len = 1 };
  union { char buf[CMSG_SPACE(sizeof(int))]; struct cmsghdr align; } u;
  memset(&u, 0, sizeof u);
  struct msghdr msg = { .msg_iov = &iov, .msg_iovlen = 1,
                        .msg_control = u.buf, .msg_controllen = sizeof u.buf };
  struct cmsghdr *c = CMSG_FIRSTHDR(&msg);
  c->cmsg_level = SOL_SOCKET;
  c->cmsg_type = SCM_RIGHTS;
  c->cmsg_len = CMSG_LEN(sizeof(int));
  memcpy(CMSG_DATA(c), &fd, sizeof(int));
  return sendmsg(sock, &msg, 0) == 1 ? 0 : -1;
}`,
        },
      },
    ],
    cheatSheet: [
      "sun_path holds at most 108 bytes including the NUL; keep socket paths short",
      "unlink the old socket path before bind, or bind fails with EADDRINUSE",
      "ss -xlp lists listening Unix sockets and their processes",
      "socketpair(AF_UNIX, SOCK_STREAM, 0, sv) is a two-way pipe for parent and child",
      "SO_PEERCRED returns the peer's pid, uid and gid as recorded by the kernel",
      "SCM_RIGHTS passes open descriptors; send at least one data byte with them",
      "nc -U /path or socat - UNIX-CONNECT:/path is a quick test client",
      "Abstract sockets start with a NUL byte and have no file or permissions",
    ],
    quiz: [
      {
        q: "A server crashed and now bind fails with EADDRINUSE on /run/app.sock. Why?",
        options: ["Another server is definitely running", "The old socket file still exists in the file system", "The path is too long", "Unix sockets can be bound only once per boot"],
        answer: 1,
        why: "bind creates the file, and it is not removed when the process exits; unlink it first.",
      },
      {
        q: "What does a process receive when another process sends it a descriptor with SCM_RIGHTS?",
        options: ["The same descriptor number, which may be invalid", "A copy of the file's contents", "A new descriptor in its own table referring to the same open file", "A path to open"],
        answer: 2,
        why: "The kernel installs a new descriptor that shares the open file description, offset included.",
      },
      {
        q: "Which socket type keeps message boundaries and also uses connections?",
        options: ["SOCK_SEQPACKET", "SOCK_STREAM", "SOCK_DGRAM", "SOCK_RAW"],
        answer: 0,
        why: "SEQPACKET combines connection setup with preserved message boundaries.",
      },
      {
        q: "How can a server reliably learn which user connected to its Unix socket?",
        options: ["Ask the client to send its username", "Read the client's environment", "Check the socket file's owner", "Call getsockopt with SO_PEERCRED"],
        answer: 3,
        why: "The kernel records the peer's credentials at connect time, so they cannot be faked.",
      },
      {
        q: "Why is write access to /var/run/docker.sock considered equal to root access?",
        options: ["The file is setuid", "Anyone who can talk to the Docker daemon can start privileged containers", "It contains root's password", "It disables SELinux"],
        answer: 1,
        why: "The daemon runs as root and does what any client on the socket asks.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run the explainer's server, connect with nc, then list the socket with ss and with ls -l.",
        hint: "nc -U connects to Unix sockets; ss -x shows the Unix family.",
        solution: `./server &
nc -U /tmp/demo.sock          # prints hello
ls -l /tmp/demo.sock          # type s: srwxr-xr-x
ss -xl | grep demo.sock`,
      },
      {
        level: "medium",
        task: "Use socketpair so a parent sends \"ping\" to a child and the child answers \"pong\" over the same pair.",
        hint: "Each side closes the end it does not use; both ends are read-write.",
        solution: `int sv[2];
if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) < 0) { perror("socketpair"); return 1; }
if (fork() == 0) {
  close(sv[0]); char b[8];
  if (read(sv[1], b, sizeof b) > 0) write(sv[1], "pong", 4);
  _exit(0);
}
close(sv[1]); write(sv[0], "ping", 4);
char b[8]; ssize_t n = read(sv[0], b, sizeof b);
printf("parent got %.*s\\n", (int)(n > 0 ? n : 0), b); wait(NULL);`,
      },
      {
        level: "hard",
        task: "Extend a Unix socket server so it accepts a connection only if the client's UID is 0 or equal to the server's own UID, and closes it otherwise.",
        hint: "Call getsockopt with SO_PEERCRED on the accepted fd; define _GNU_SOURCE before the includes for struct ucred.",
        solution: `int c = accept(s, NULL, NULL);
if (c < 0) { perror("accept"); continue; }
struct ucred cr; socklen_t len = sizeof cr;
if (getsockopt(c, SOL_SOCKET, SO_PEERCRED, &cr, &len) < 0) { close(c); continue; }
if (cr.uid != 0 && cr.uid != getuid()) {
  fprintf(stderr, "rejecting pid %d uid %d\\n", cr.pid, cr.uid);
  close(c); continue;
}
write(c, "welcome\\n", 8);`,
      },
    ],
    faq: [
      { q: "Are Unix sockets faster than TCP on localhost?", a: "Usually yes, because they skip the TCP/IP stack: no checksums, no congestion control and no port handling. The exact gain depends on message size and workload." },
      { q: "Can Unix sockets work between two machines?", a: "No, they work only within one host (or between containers sharing a mounted socket file). Use TCP for remote access." },
      { q: "Where should I put my service's socket file?", a: "Under /run, for example /run/myapp/myapp.sock, which is a tmpfs cleared at boot. systemd's RuntimeDirectory= creates such a directory for you." },
      { q: "What is the difference between a socket file and a FIFO?", a: "A FIFO is a one-way byte pipe shared by whoever opens it. A socket supports separate two-way connections per client, plus credentials and descriptor passing." },
    ],
  },
};

export default extra;
