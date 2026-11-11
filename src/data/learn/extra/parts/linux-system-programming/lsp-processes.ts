import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-processes/process-model": {
    plain: [
      "A program is a file on disk, like a recipe in a book. A process is that program while it runs: the recipe being cooked right now, with its own pots, ingredients and timer. You can run the same program ten times and get ten separate processes, each with its own memory and its own number.",
      "That number is the PID (process ID). Every process also remembers its parent, the process that started it, as the PPID. When you type ls in a terminal, the shell is the parent and ls is the child. Follow the PPIDs upwards and you always end at PID 1, which is usually systemd.",
      "The kernel keeps a record for each process: which memory it uses, which files it has open, which user it runs as, and what it is doing right now. Most of the time a process is not running at all. It is sleeping, waiting for a key press, a network packet or a disk read.",
      "You can read this record yourself. Every process has a folder in /proc named after its PID, full of small text files. Tools like ps and top just read those files and print them nicely, so learning /proc means you understand what every monitoring tool shows you.",
    ],
    deepDive: [
      {
        heading: "What a process actually owns",
        body: "Inside the kernel, each task is described by a large structure (task_struct). A process holds pointers to several resources: an address space (its virtual memory), a table of open file descriptors, a current and root directory, credentials, signal handlers and a signal mask, resource limits (ulimit), a cgroup and a set of namespaces.\n\nThreads of the same process share most of these: the memory, the descriptor table, the signal handlers and the credentials. Each thread keeps its own registers, stack, signal mask and thread ID. This is why one thread can close a file that another thread is reading, and why a crash in one thread kills the whole process.",
        bullets: ["ls -l /proc/PID/fd shows the descriptor table", "cat /proc/PID/limits shows its resource limits", "ls -l /proc/PID/cwd and /proc/PID/exe show its directory and binary", "ls -l /proc/PID/ns shows its namespaces"],
        visual: {
          type: "tree",
          title: "What one process owns",
          root: "Process (PID 4210)",
          children: [
            { label: "Memory", children: ["Code, data, heap", "Stacks and mmap regions"] },
            { label: "Files", children: ["Descriptor table", "Current and root directory", "umask"] },
            { label: "Identity", children: ["UIDs and GIDs", "Supplementary groups", "Capabilities"] },
            { label: "Signals", children: ["Handlers per signal", "Pending signals"] },
            { label: "Limits and grouping", children: ["Resource limits", "cgroup", "Namespaces"] },
            { label: "Threads", children: ["Registers and stack each", "Own signal mask each"] },
          ],
        },
      },
      {
        heading: "Credentials: real, effective and saved IDs",
        body: "A process has more than one user ID. The real UID says who started it. The effective UID is what the kernel checks for permissions. The saved set-user-ID remembers an earlier effective UID so a program can drop privileges and pick them up again later. Groups work the same way, plus a list of supplementary groups.\n\nNormally all three UIDs are equal. They differ when you run a setuid program such as passwd: the real UID stays yours, but the effective UID becomes 0 (root), so it may write the password file. In /proc/PID/status the Uid line shows four numbers: real, effective, saved and the file-system UID. On modern Linux, root's power is also split into capabilities, such as CAP_NET_BIND_SERVICE for binding ports below 1024.",
        bullets: ["getuid() returns the real UID, geteuid() the effective one", "Permission checks on files use the effective (file-system) UID", "grep -E '^(Uid|Gid|Groups|Cap)' /proc/self/status"],
      },
      {
        heading: "All the state letters, and the load average",
        body: "The explainer covers R, S, D, T and Z. You will also meet t (stopped by a debugger or strace), I (an idle kernel thread, shown since Linux 4.14) and, very rarely, X (dead, being removed). ps adds extra letters after the state: s for a session leader, + for the foreground process group, l for multithreaded, and < or N for high or low priority.\n\nOne Linux detail surprises people: the load average counts tasks in state R and in state D. A server with idle CPUs can still show a load of 30 if many tasks are stuck in D waiting for a slow disk or a dead NFS server. So a high load does not always mean the CPU is busy. Check top: if the CPU idle percentage is high and the wa (I/O wait) value is high, look for D tasks.",
        bullets: ["ps -eo pid,stat,wchan:32,comm shows what each task waits on", "Ss+ means sleeping, session leader, foreground group", "cat /proc/loadavg shows 1, 5 and 15 minute averages"],
      },
      {
        heading: "How ps and top get their data",
        body: "ps does not have special access to the kernel. It opens /proc, lists the numeric folders, and reads files such as /proc/PID/stat, status and cmdline. The status file is the friendliest: Name, State, Tgid, Pid, PPid, Uid, Gid, Threads, VmRSS (memory in RAM), and the hex masks SigBlk, SigIgn and SigCgt for blocked, ignored and caught signals.\n\nA few files hold binary-ish data: cmdline and environ separate their strings with NUL bytes, so use tr '\\0' ' ' to read them. The counters voluntary_ctxt_switches and nonvoluntary_ctxt_switches tell you whether a process mostly waits (voluntary) or keeps being pushed off the CPU (nonvoluntary). Reading another user's files may need root, because some entries are protected.",
        visual: {
          type: "layers",
          title: "From ps output down to the kernel",
          layers: [
            { label: "ps, top, htop", detail: "Format and sort the numbers." },
            { label: "procps library", detail: "Opens and parses the text files." },
            { label: "/proc/PID/*", detail: "Files generated on every read." },
            { label: "procfs code", detail: "Kernel code that fills each file." },
            { label: "task_struct", detail: "The real per-task data in kernel memory." },
          ],
        },
      },
      {
        heading: "PIDs, thread IDs and PID reuse",
        body: "Inside the kernel every thread has its own ID. What user space calls the PID is really the thread group ID (TGID), the ID of the first thread. getpid() returns the TGID and gettid() returns the thread's own ID; for a single-threaded program they are equal. You can see the threads in /proc/PID/task/.\n\nPIDs are recycled. The kernel hands out numbers up to kernel.pid_max and then wraps around. The kernel default is 32768, but systemd raises it to 4194304 on 64-bit systems. Because of reuse, a script that saves a PID and later runs kill on it can hit a different process. Modern code uses a pidfd (pidfd_open, Linux 5.3), a descriptor that always refers to one exact process. Containers add PID namespaces, so the same process can be PID 1 inside the container and PID 48211 on the host.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Shared by all threads vs private to each thread",
        columns: [
          { title: "Shared by the process", points: ["Virtual memory and heap", "File descriptor table", "Signal handlers", "PID (TGID) and credentials", "Current directory"] },
          { title: "Private to each thread", points: ["Thread ID (TID)", "CPU registers and stack", "Signal mask", "errno value", "Scheduling state (R, S, D)"] },
        ],
      },
      {
        type: "flow",
        title: "The life of one PID",
        steps: [
          { label: "fork", detail: "Kernel picks a free PID for the child." },
          { label: "Runs", detail: "Moves between R, S and D many times." },
          { label: "Exits", detail: "Memory is freed, state becomes Z." },
          { label: "Parent waits", detail: "Exit status collected, entry removed." },
          { label: "PID is free", detail: "Can be reused after the counter wraps." },
        ],
      },
    ],
    examples: [
      {
        title: "Why is the load 25 when the CPU is idle?",
        explanation: "A monitoring alert says load average 25 on a 4-core server, but top shows 90% idle. Step 1: remember that Linux counts D-state tasks in the load. Step 2: list tasks in D and see what kernel function they wait in (wchan). Step 3: many processes waiting in an NFS or block-layer function point to storage, not CPU. Step 4: check the mount or disk they use, for example with df on the NFS mount, which itself may hang if the server is down.",
        code: {
          lang: "bash",
          code: `cat /proc/loadavg
top -bn1 | head -5                 # look at id (idle) and wa (I/O wait)
ps -eo pid,stat,wchan:32,comm | awk '$2 ~ /^D/'
sudo cat /proc/<PID>/stack         # kernel stack of one stuck task (root only)
mount -t nfs,nfs4                  # which network mounts exist`,
        },
      },
      {
        title: "A program that inspects itself",
        explanation: "This small C program prints its own IDs with the getter functions, then reads two lines from /proc/self/status. /proc/self always points to the process that opens it. Compile with gcc -Wall ids.c -o ids and run it normally, then with sudo, and compare the UID lines. The State line says R because the process is running while it reads the file.",
        code: {
          lang: "c",
          code: `#include <stdio.h>
#include <string.h>
#include <unistd.h>

int main(void) {
  printf("pid=%d ppid=%d uid=%d euid=%d\\n",
         (int)getpid(), (int)getppid(), (int)getuid(), (int)geteuid());
  FILE *f = fopen("/proc/self/status", "r");
  if (!f) { perror("fopen"); return 1; }
  char line[256];
  while (fgets(line, sizeof line, f))
    if (!strncmp(line, "State:", 6) || !strncmp(line, "Threads:", 8)) fputs(line, stdout);
  fclose(f);
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "ps -eo pid,ppid,user,stat,comm --forest shows the process tree with states",
      "pstree -p shows parents and children with PIDs",
      "/proc/PID/status is the readable summary; /proc/PID/stat is the compact one",
      "tr '\\0' ' ' < /proc/PID/cmdline prints the full command line",
      "Load average counts R and D tasks, so slow I/O can raise it",
      "getpid() returns the thread group ID; gettid() returns the thread ID",
      "ls /proc/PID/task lists every thread of a process",
      "kernel.pid_max sets the highest PID before numbers wrap around",
    ],
    quiz: [
      {
        q: "Which ID does the kernel use when checking whether a process may open a file?",
        options: ["The real UID", "The effective (file-system) UID", "The saved set-user-ID", "The parent's UID"],
        answer: 1,
        why: "Permission checks use the effective UID, which is why setuid programs gain the owner's rights.",
      },
      {
        q: "A server shows load average 20 but 95% idle CPU. What is the most likely cause?",
        options: ["The CPU is overheating", "Too many zombie processes", "Many tasks stuck in state D waiting on I/O", "The scheduler is turned off"],
        answer: 2,
        why: "Linux includes uninterruptible (D) tasks in the load average even though they use no CPU.",
      },
      {
        q: "What do two threads of the same process NOT share?",
        options: ["Their signal masks", "Their file descriptor table", "Their heap memory", "Their PID as returned by getpid()"],
        answer: 0,
        why: "Each thread has its own signal mask, registers and stack; memory and descriptors are shared.",
      },
      {
        q: "Why can a script that saved a PID earlier and later runs kill on it be dangerous?",
        options: ["kill only works on the current shell", "PIDs are encrypted after a minute", "kill always needs root", "The PID may have been reused by a different process"],
        answer: 3,
        why: "PIDs are recycled after the counter wraps, which pidfds were designed to avoid.",
      },
      {
        q: "What does the l in a ps state like Sl mean?",
        options: ["The process is multithreaded", "The process is locked in memory", "The process is a session leader", "The process has low priority"],
        answer: 0,
        why: "l marks a multithreaded process; s is session leader and N is low priority.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start sleep 300 in the background and find its PID, PPID, state and UID using only files under /proc.",
        hint: "The shell variable $! holds the PID of the last background job.",
        solution: `sleep 300 &
grep -E '^(Name|State|Pid|PPid|Uid)' /proc/$!/status
# PPid is your shell ($$); State is S (sleeping)`,
      },
      {
        level: "medium",
        task: "Write a one-line command that prints, for every process, its PID, thread count and command name, sorted by thread count with the largest last.",
        hint: "ps has a column called nlwp (number of lightweight processes, meaning threads).",
        solution: `ps -eo pid,nlwp,comm --sort=nlwp | tail
# or straight from /proc:
for d in /proc/[0-9]*; do printf '%s %s\\n' "$(grep Threads "$d/status" 2>/dev/null | awk '{print $2}')" "\${d#/proc/}"; done | sort -n | tail`,
      },
      {
        level: "hard",
        task: "Write a C program that starts 3 threads, then lists /proc/self/task and prints each thread ID together with its State line.",
        hint: "Use opendir and readdir on /proc/self/task, then open /proc/self/task/TID/status. Build with -pthread.",
        solution: `/* main: create 3 threads that each call sleep(5), then: */
DIR *d = opendir("/proc/self/task");
struct dirent *e;
while (d && (e = readdir(d))) {
  if (e->d_name[0] == '.') continue;
  char p[64], line[128]; snprintf(p, sizeof p, "/proc/self/task/%s/status", e->d_name);
  FILE *f = fopen(p, "r");
  while (f && fgets(line, sizeof line, f)) if (!strncmp(line, "State:", 6)) printf("tid %s %s", e->d_name, line);
  if (f) fclose(f);
}
if (d) closedir(d);`,
      },
    ],
    faq: [
      { q: "What is the difference between a program and a process?", a: "A program is a file on disk. A process is one running instance of it, with its own memory, open files and PID; one program can run as many processes at once." },
      { q: "Why can't I kill a process in state D?", a: "A task in uninterruptible sleep only handles signals when its kernel wait finishes, so even SIGKILL waits. Fix the I/O it is waiting for, such as an unreachable NFS server." },
      { q: "Is /proc stored on disk?", a: "No. /proc is a virtual file system; the kernel builds each file's content at the moment you read it." },
      { q: "What is PID 1?", a: "The first user-space process the kernel starts, usually systemd. It adopts orphaned processes and is never allowed to exit while the system runs." },
    ],
  },

  "lsp-processes/fork-exec-wait": {
    plain: [
      "Unix starts a new program in two separate moves. First, fork makes a copy of the running process. Now there are two almost identical processes: the parent and the child. Second, the child calls exec, which throws away its own program and loads a new one in its place, keeping the same PID.",
      "Why two steps? Because the gap between them is useful. After fork but before exec, the child can change things for the new program: redirect its output to a file, change directory, drop privileges or close files. The shell uses this gap every time you type a command with > or |.",
      "Meanwhile the parent usually calls waitpid. This makes it pause until the child finishes, and then it receives a status number. That number tells the parent whether the child exited normally and with which code, or whether it was killed by a signal.",
      "Copying a whole process sounds slow, but it is not. The kernel does not really copy the memory at fork time. Both processes share the same memory pages until one of them writes, and only then is that single page copied. This trick is called copy-on-write.",
    ],
    deepDive: [
      {
        heading: "What the child inherits, and what it does not",
        body: "The child gets a copy of the parent's memory, a duplicate of the descriptor table, the same current directory, umask, signal handlers, signal mask, environment and resource limits. Duplicated descriptors point to the same open file, so parent and child share one file offset: if both write to the same file, their writes follow each other instead of overwriting.\n\nSome things are not copied. The child has a new PID and its PPID is the parent. Pending signals are cleared, file locks taken with fcntl are not inherited, and timers are reset. Only the thread that called fork exists in the child. If another thread held a lock (for example inside malloc) at that moment, the lock stays locked forever in the child. That is why, in a multithreaded program, the child should only call async-signal-safe functions before exec.",
        bullets: ["Shared offset: parent and child appending to one log file works", "fork in a threaded program: exec soon, call little else", "fork returns -1 with EAGAIN when a process limit is reached"],
      },
      {
        heading: "Copy-on-write under the hood",
        body: "At fork the kernel copies the parent's page tables, not the pages. It marks every private writable page as read-only in both processes and counts how many processes use each page. When either process writes, the CPU raises a page fault. The kernel sees that the page is shared, allocates a new physical page, copies 4 KiB, maps the copy as writable for the writer, and lets the write continue.\n\nThe cost of fork therefore grows with the size of the page tables, not the memory. A 20 GB process can still take milliseconds to fork, which is why big programs such as databases prefer posix_spawn or vfork-style calls. glibc implements posix_spawn with clone and CLONE_VM | CLONE_VFORK, so the child borrows the parent's memory until it calls exec and no page tables are copied at all.",
        visual: {
          type: "flow",
          title: "A write after fork",
          steps: [
            { label: "fork", detail: "Page tables copied, pages marked read-only." },
            { label: "Child writes", detail: "CPU raises a page fault." },
            { label: "Kernel checks", detail: "Page is shared by two processes." },
            { label: "Copy one page", detail: "New 4 KiB page for the child only." },
            { label: "Write continues", detail: "Parent still sees its old data." },
          ],
        },
      },
      {
        heading: "The exec family and what survives exec",
        body: "There is only one real system call, execve(path, argv, envp). The library wrappers add letters: l means the arguments are listed one by one, v means they come in an array, p means search PATH for the program, and e means you pass your own environment. So execvp takes an array and searches PATH, while execle takes a list and an environment.\n\nexec replaces the memory, the threads and the signal handlers (caught signals go back to their default action, because the handler code no longer exists). It keeps the PID, the parent, the current directory, the umask, the signal mask, ignored signals and every open descriptor that does not have the close-on-exec flag. Forgetting O_CLOEXEC is a classic way to leak a secret file or a listening socket into a child program.",
      },
      {
        heading: "waitpid in full",
        body: "waitpid(pid, &status, options) chooses which child to wait for. A positive pid means that exact child, -1 means any child, 0 means any child in the caller's process group, and a value below -1 means any child in the group with that ID. The options WNOHANG (return 0 at once if nobody has finished), WUNTRACED (also report stopped children) and WCONTINUED (report resumed ones) change when it returns.\n\nIt returns the PID it collected, 0 with WNOHANG when no child is ready, or -1 with errno ECHILD when there are no children left, or EINTR when a signal handler interrupted it. Decode the status with macros only: WIFEXITED and WEXITSTATUS, WIFSIGNALED and WTERMSIG, WIFSTOPPED and WSTOPSIG. Only the low 8 bits of an exit code survive, so exit(256) looks like exit(0) to the parent.",
        bullets: ["Shells show death by signal N as exit code 128+N (Ctrl-C gives 130)", "WCOREDUMP(status) is true when a core file was written", "waitid() is the newer, more detailed variant"],
      },
      {
        heading: "Conventions that make tools behave",
        body: "Exit codes carry meaning by convention: 0 is success, 1 is a general error, 2 is often bad usage, 126 means the program was found but could not be executed, and 127 means it was not found. Make your child use 127 after a failed exec, just like a shell, so scripts can tell what went wrong.\n\nTwo more habits prevent strange bugs. Call fflush(NULL) before fork, or the child inherits unwritten stdio buffers and prints them a second time. And after a failed exec in the child, call _exit, not exit, so the child does not run the parent's atexit handlers or flush the parent's buffers again. Always check fork for -1; on a busy server it really happens.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "What survives exec",
        columns: [
          { title: "Kept", points: ["PID and parent PID", "Open fds without FD_CLOEXEC", "Current directory and umask", "Signal mask and ignored signals", "Resource limits"] },
          { title: "Replaced or reset", points: ["Code, heap, stack, mappings", "All other threads", "Caught signals go to default", "fds marked FD_CLOEXEC are closed", "atexit handlers are forgotten"] },
        ],
      },
    ],
    examples: [
      {
        title: "A tiny \"run\" command that reports how a child ended",
        explanation: "This program runs whatever command you give it and explains how it finished. Step 1: fork and check for -1. Step 2: the child execs the command with execvp; if that fails it prints why and exits with 127. Step 3: the parent waits, retrying if a signal interrupts the wait. Step 4: it decodes the status. Try ./run true, ./run false, ./run nosuchcmd and ./run sleep 60 while you send kill -TERM to the sleep from another terminal.",
        code: {
          lang: "c",
          code: `#include <errno.h>
#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
  if (argc < 2) { fprintf(stderr, "usage: %s cmd [args...]\\n", argv[0]); return 2; }
  pid_t pid = fork();
  if (pid < 0) { perror("fork"); return 1; }
  if (pid == 0) { execvp(argv[1], &argv[1]); perror(argv[1]); _exit(127); }
  int st;
  while (waitpid(pid, &st, 0) < 0) if (errno != EINTR) { perror("waitpid"); return 1; }
  if (WIFEXITED(st)) printf("exited with %d\\n", WEXITSTATUS(st));
  else if (WIFSIGNALED(st)) printf("killed by signal %d\\n", WTERMSIG(st));
  return 0;
}`,
        },
      },
      {
        title: "Why does my output appear twice?",
        explanation: "The program below prints hello once on a terminal but twice when you run ./a.out > out.txt. On a terminal stdout is line-buffered, so the text with a newline is written before fork. In a file it is fully buffered, so hello is still sitting in the buffer when fork copies the memory, and both processes flush it at exit. The fix is one line: fflush(NULL) right before fork.",
        code: {
          lang: "c",
          code: `#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
  printf("hello\\n");
  /* fflush(NULL);   <- uncomment to fix */
  pid_t pid = fork();
  if (pid < 0) { perror("fork"); return 1; }
  if (pid > 0) waitpid(pid, NULL, 0);
  return 0;   /* both processes flush stdout here */
}`,
        },
      },
    ],
    cheatSheet: [
      "fork returns the child's PID in the parent, 0 in the child, -1 on error",
      "exec letters: l list, v vector, p search PATH, e custom environment",
      "Only execve is a real system call; the others are library wrappers",
      "Open fds survive exec unless they have O_CLOEXEC or FD_CLOEXEC",
      "waitpid(-1, &st, WNOHANG) reaps any finished child without blocking",
      "Exit 126: found but not executable; 127: command not found; 128+N: killed by signal N",
      "Call fflush(NULL) before fork and _exit after a failed exec",
      "strace -f -e trace=clone,execve,wait4 ./prog shows the whole pattern",
    ],
    quiz: [
      {
        q: "Parent and child both write to a file descriptor that was open before fork. What happens to the file offset?",
        options: ["Each has its own offset, so they overwrite each other", "They share one offset, so writes follow each other", "The child's writes fail with EBADF", "The kernel locks the file for the parent"],
        answer: 1,
        why: "fork duplicates descriptors that refer to the same open file description, which holds the offset.",
      },
      {
        q: "What happens to a signal handler installed with sigaction after a successful exec?",
        options: ["It keeps running in the new program", "It is converted into SIG_IGN", "The exec fails with EINVAL", "The signal returns to its default action"],
        answer: 3,
        why: "The handler's code is gone after exec, so caught signals are reset to default; ignored ones stay ignored.",
      },
      {
        q: "What does waitpid return when called with WNOHANG and no child has finished yet?",
        options: ["0", "-1 with ECHILD", "The parent's PID", "It blocks until a child finishes"],
        answer: 0,
        why: "WNOHANG makes waitpid return 0 immediately if children exist but none has changed state.",
      },
      {
        q: "Why is fork fast even for a process using several gigabytes of memory?",
        options: ["Linux compresses the memory first", "The child gets no memory until it calls exec", "Pages are shared copy-on-write; only page tables are copied", "fork runs on a separate CPU"],
        answer: 2,
        why: "Pages are copied only when one side writes; fork itself just duplicates the page tables.",
      },
      {
        q: "A child calls exit(300). What does WEXITSTATUS give the parent?",
        options: ["300", "44", "255", "-1"],
        answer: 1,
        why: "Only the low 8 bits survive, and 300 modulo 256 is 44.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a program that forks once; the child prints its PID and PPID, the parent prints the child's PID and waits for it.",
        hint: "Use getpid() and getppid() in the child and the return value of fork() in the parent.",
        solution: `pid_t pid = fork();
if (pid < 0) { perror("fork"); return 1; }
if (pid == 0) { printf("child %d, parent %d\\n", getpid(), getppid()); _exit(0); }
printf("parent made child %d\\n", pid);
waitpid(pid, NULL, 0);`,
      },
      {
        level: "medium",
        task: "Start 5 children that each sleep a random 1 to 3 seconds and exit with their index. The parent must reap them in the order they finish and print each index.",
        hint: "Call waitpid(-1, &st, 0) five times; seed rand differently in each child.",
        solution: `for (int i = 0; i < 5; i++) {
  pid_t p = fork();
  if (p < 0) { perror("fork"); return 1; }
  if (p == 0) { srand(getpid()); sleep(1 + rand() % 3); _exit(i); }
}
for (int i = 0; i < 5; i++) {
  int st; pid_t p = waitpid(-1, &st, 0);
  if (p > 0 && WIFEXITED(st)) printf("pid %d index %d\\n", p, WEXITSTATUS(st));
}`,
      },
      {
        level: "hard",
        task: "Run ls -l with its output written to listing.txt, doing the redirection yourself between fork and exec. Make sure the file is not leaked to any other program.",
        hint: "open with O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, then dup2 it onto 1 in the child; dup2 clears close-on-exec on the new fd.",
        solution: `pid_t pid = fork();
if (pid < 0) { perror("fork"); return 1; }
if (pid == 0) {
  int fd = open("listing.txt", O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0644);
  if (fd < 0 || dup2(fd, STDOUT_FILENO) < 0) { perror("redirect"); _exit(1); }
  execlp("ls", "ls", "-l", (char *)NULL);
  perror("execlp"); _exit(127);
}
int st; waitpid(pid, &st, 0);`,
      },
    ],
    faq: [
      { q: "Why doesn't Unix have a single \"create process\" call?", a: "It does now (posix_spawn), but fork plus exec is kept because the gap between them lets the child set up redirection, directories and permissions using ordinary calls." },
      { q: "Should I use fork or posix_spawn?", a: "For simply launching a program, posix_spawn is often faster and safer in large or multithreaded programs. Use fork when the child must run your own code or needs setup that posix_spawn cannot express." },
      { q: "Why does code after execvp run?", a: "Because execvp failed; on success it never returns. Print the error with perror and exit the child with _exit(127)." },
      { q: "What is the difference between wait and waitpid?", a: "wait(&st) waits for any child. waitpid lets you choose a specific child or group and pass options like WNOHANG." },
    ],
  },

  "lsp-processes/zombies-orphans": {
    plain: [
      "When a process finishes, it does not vanish at once. The kernel frees its memory and closes its files, but it keeps a tiny note: \"process 4211 ended with code 0\". The parent may want to read that note, so the kernel holds it until the parent asks. A finished process waiting to be asked about is called a zombie.",
      "Zombies are harmless in small numbers. They use no CPU and no memory, only a PID and a line in the process table. The trouble starts when a buggy parent never asks. Thousands of zombies can pile up until the system runs out of PIDs and nothing new can start.",
      "The opposite case is an orphan: the parent dies while the child is still running. The child is not left alone. The kernel gives it a new parent, normally PID 1, which waits for it when it finishes so no zombie remains.",
      "Every process also carries a small list of settings called the environment, such as HOME=/home/ana or LANG=en_US.UTF-8. A child gets a copy of its parent's list. It can change its own copy, but the parent never sees those changes, a bit like a photocopy you scribble on.",
    ],
    deepDive: [
      {
        heading: "What really happens at exit",
        body: "Returning from main is the same as calling exit with that value. exit first runs the functions registered with atexit, in reverse order of registration, then flushes and closes all stdio streams, and finally calls _exit. _exit (the exit_group system call in glibc) goes straight to the kernel.\n\nThe kernel then closes every descriptor, releases the memory, detaches from shared resources, sends SIGCHLD to the parent and hands any children to a new parent. The process becomes a zombie holding only its PID, its exit status and resource usage numbers (CPU time and so on). When the parent calls wait, those numbers are returned and the last trace disappears.",
        visual: {
          type: "flow",
          title: "From exit() to fully gone",
          steps: [
            { label: "exit(status)", detail: "atexit handlers run, stdio is flushed." },
            { label: "_exit", detail: "Enter the kernel; no more user code." },
            { label: "Release resources", detail: "Close fds, free memory, reparent children." },
            { label: "Zombie (Z)", detail: "Only PID and status remain; SIGCHLD sent." },
            { label: "Parent waits", detail: "Status returned, entry removed." },
          ],
        },
      },
      {
        heading: "Three ways to never leave zombies",
        body: "The direct way is to wait. A parent that starts one child at a time can just call waitpid. A server that starts many children should reap in a loop: while (waitpid(-1, &st, WNOHANG) > 0), run from its event loop or from a SIGCHLD handler. waitpid is async-signal-safe, so it is allowed in a handler; save and restore errno around it.\n\nThe second way is to say you never care: set SIGCHLD to SIG_IGN, or install a handler with the SA_NOCLDWAIT flag. Then children are reaped automatically by the kernel, but you also lose their exit statuses.\n\nThe third way is the double fork: the parent forks a child, the child forks a grandchild and exits at once, and the parent reaps the child. The grandchild is now an orphan adopted by PID 1, which reaps it later. Classic daemons use this.",
        bullets: ["ps -eo pid,ppid,stat,comm | awk '$3 ~ /^Z/' lists zombies and their parents", "kill -9 on a zombie does nothing; it is already dead", "Killing the parent makes PID 1 adopt and reap the zombies"],
      },
      {
        heading: "Orphans, subreapers and containers",
        body: "When a parent dies, the kernel looks upward for a new parent. If an ancestor marked itself with prctl(PR_SET_CHILD_SUBREAPER, 1) (Linux 3.4 and later), the orphan goes there. Otherwise it goes to PID 1 of its PID namespace. systemd --user and container runtimes use subreapers so they keep track of everything their services start.\n\nThis matters a lot in containers. Your app may be PID 1 inside the container, so every orphan is handed to it. If the app never calls wait, zombies collect. PID 1 is also special for signals: it ignores any signal for which it has no handler, so a plain SIGTERM may do nothing. That is why people run a tiny init such as tini, or use docker run --init, in front of the real program.",
      },
      {
        heading: "The environment: environ, getenv and setenv",
        body: "The environment is an array of KEY=value strings that ends with NULL. It reaches main through the global variable environ and is copied into the new program by execve. getenv reads a value, setenv adds or replaces one, and unsetenv removes one. Avoid putenv: it stores your pointer itself, so changing or freeing that buffer later changes the environment.\n\nArguments and environment together must fit the kernel's limit, shown by getconf ARG_MAX (usually 2 MiB, a quarter of the default 8 MiB stack limit). /proc/PID/environ shows the environment the program started with; later setenv calls are usually not reflected there. setenv is not thread-safe, so set what you need at startup, before creating threads.",
        bullets: ["env -i prog runs prog with an empty environment", "VAR=value prog sets one variable just for prog", "tr '\\0' '\\n' < /proc/PID/environ shows the starting environment"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "An orphan is adopted and reaped",
        actors: ["Parent", "Kernel", "Child", "PID 1"],
        messages: [
          { from: 0, to: 1, label: "exits while the child still runs" },
          { from: 1, to: 2, label: "PPID changed to 1 (or a subreaper)" },
          { from: 2, to: 1, label: "exit(0) later" },
          { from: 1, to: 3, label: "SIGCHLD" },
          { from: 3, to: 1, label: "waitpid collects the status" },
        ],
      },
    ],
    examples: [
      {
        title: "Hunting zombies on a production server",
        explanation: "An alert says the process count keeps climbing. Step 1: count processes in state Z. Step 2: group them by parent PID; usually one parent owns them all. Step 3: look at that parent, which is a program that forgets to call wait. Step 4: the real fix is in its code (reap in a SIGCHLD handler or loop). As a short-term fix, restarting the parent makes PID 1 adopt and reap every zombie at once.",
        code: {
          lang: "bash",
          code: `ps -eo stat | grep -c '^Z'                 # how many zombies
ps -eo ppid,stat | awk '$2 ~ /^Z/ {print $1}' | sort | uniq -c | sort -rn
ps -o pid,user,etime,cmd -p 2345           # inspect the guilty parent
cat /proc/sys/kernel/pid_max               # the ceiling we are heading to
sudo systemctl restart myworker            # temporary relief only`,
        },
      },
      {
        title: "Giving a child a clean, controlled environment",
        explanation: "Sometimes you want a child to see only the variables you choose, for example to avoid leaking secrets such as AWS keys from the parent. execle takes the environment as its last argument. Here the child shell sees APP_MODE and PATH, but not HOME, so it prints home=unset. The parent's own environment is untouched.",
        code: {
          lang: "c",
          code: `#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
  char *env[] = { "APP_MODE=prod", "PATH=/usr/bin:/bin", NULL };
  pid_t pid = fork();
  if (pid < 0) { perror("fork"); return 1; }
  if (pid == 0) {
    execle("/bin/sh", "sh", "-c", "echo mode=$APP_MODE home=\${HOME:-unset}", (char *)NULL, env);
    perror("execle"); _exit(127);
  }
  waitpid(pid, NULL, 0);
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "A zombie holds only a PID, exit status and usage numbers until its parent waits",
      "Reap many children: while (waitpid(-1, &st, WNOHANG) > 0) { ... }",
      "signal(SIGCHLD, SIG_IGN) makes the kernel reap children automatically",
      "Orphans go to the nearest subreaper, else PID 1 of their PID namespace",
      "exit runs atexit handlers and flushes stdio; _exit skips both",
      "Use setenv and unsetenv; avoid putenv, which keeps your pointer",
      "docker run --init adds a tiny PID 1 that reaps zombies and forwards signals",
    ],
    quiz: [
      {
        q: "Which resource does a zombie process still hold?",
        options: ["Its heap memory", "Its open sockets", "A PID and its exit status", "A CPU time slice"],
        answer: 2,
        why: "Everything else is freed at exit; the PID and status stay until the parent waits.",
      },
      {
        q: "You set SIGCHLD to SIG_IGN in a parent. What changes?",
        options: ["Children are reaped automatically and you cannot get their exit status", "Children can no longer exit", "Children become orphans immediately", "Nothing, SIGCHLD cannot be ignored"],
        answer: 0,
        why: "Ignoring SIGCHLD explicitly tells the kernel not to create zombies for this parent's children.",
      },
      {
        q: "Your app runs as PID 1 in a container and docker stop takes 10 seconds then kills it. Why?",
        options: ["Docker always waits 10 seconds", "PID 1 ignores SIGTERM unless it installed a handler", "SIGTERM is blocked inside containers", "The app was a zombie"],
        answer: 1,
        why: "The kernel drops signals with default action for a namespace's init, so docker falls back to SIGKILL after its timeout.",
      },
      {
        q: "A child process runs setenv(\"MODE\", \"x\", 1). What does the parent see for MODE afterwards?",
        options: ["x", "An error from getenv", "The value changes after the child exits", "Whatever it had before; the child changed only its copy"],
        answer: 3,
        why: "The environment is copied at fork; changes never flow back to the parent.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a zombie on purpose in the shell and watch it in ps.",
        hint: "exec replaces the shell's program with sleep, which never waits for the child the shell started first.",
        solution: `# the subshell starts a 1-second sleep, then becomes 'sleep 30' via exec
( sleep 1 & exec sleep 30 ) &
sleep 2
ps -o pid,ppid,stat,comm --ppid $!   # the 1-second sleep shows state Z`,
      },
      {
        level: "medium",
        task: "Register two atexit handlers and show the order they run in. Then show that calling _exit skips them.",
        hint: "Handlers run in reverse order of registration.",
        solution: `static void a(void) { puts("handler a"); }
static void b(void) { puts("handler b"); }
int main(int argc, char **argv) {
  (void)argv;
  atexit(a); atexit(b);
  if (argc > 1) _exit(0);   /* ./prog x prints nothing */
  return 0;                 /* prints handler b, then handler a */
}`,
      },
      {
        level: "hard",
        task: "Write a parent that starts 10 short-lived children and reaps all of them from a SIGCHLD handler, never leaving a zombie and never losing an exit even when signals merge.",
        hint: "Loop on waitpid with WNOHANG inside the handler, save errno, and count reaped children in a volatile sig_atomic_t.",
        solution: `static volatile sig_atomic_t reaped = 0;
static void on_chld(int s) {
  (void)s; int e = errno;
  while (waitpid(-1, NULL, WNOHANG) > 0) reaped++;
  errno = e;
}
/* main: sigaction(SIGCHLD) with SA_RESTART | SA_NOCLDSTOP,
   fork 10 children that _exit(0), then: */
while (reaped < 10) pause();
printf("reaped %d\\n", (int)reaped);`,
      },
    ],
    faq: [
      { q: "How do I kill a zombie process?", a: "You cannot; it is already dead. Make its parent call wait, or stop the parent so PID 1 adopts the zombie and reaps it." },
      { q: "Are zombies a security risk?", a: "Not directly, but enough of them can use up the PID space or a user's process limit, which stops new programs from starting." },
      { q: "What does defunct mean in ps output?", a: "It is the same as state Z: the process has exited and is waiting for its parent to collect the status." },
      { q: "Why does my child process not see a variable I exported later?", a: "The child got a copy of the environment when it was created. Variables set afterwards in the parent only reach children started later." },
    ],
  },

  "lsp-processes/sessions-groups": {
    plain: [
      "When you run a pipeline like grep error app.log | less, the shell starts two processes. But to you it is one job. If you press Ctrl-C, you want both to stop, not just one. Process groups make this possible: the shell puts all processes of one job into the same group, and signals can be sent to the whole group at once.",
      "A session is one level higher. It is everything started from one login or one terminal window: the shell and all its jobs. The terminal belongs to the session, and at any moment exactly one group in it is the foreground job, the one allowed to read your keyboard.",
      "When you press Ctrl-C, the terminal does not send the signal to one process. It sends SIGINT to every process in the foreground group. The shell itself is in a different group, so it survives and shows the next prompt.",
      "When you close the terminal or your SSH connection drops, the session loses its terminal and its processes get SIGHUP (hang up), which normally ends them. That is why long jobs started over SSH die when the Wi-Fi drops, unless you use tools like nohup, setsid or tmux.",
    ],
    deepDive: [
      {
        heading: "IDs and the rules for changing them",
        body: "Every process has a process group ID (PGID) and a session ID (SID). The PGID is the PID of the group leader, the first process of the group; the SID is the PID of the session leader, usually the login shell. getpgrp() and getsid(0) return them, and ps -o pid,pgid,sid,tty,comm shows them.\n\nsetpgid(pid, pgid) moves a process into a group, with strict rules: you may only move yourself or one of your children, the child must not have called exec yet, and the target group must be in the same session. Because parent and child run at the same time after fork, shells call setpgid(child, child) in both the parent and the child. Whichever runs first wins, and the other call is harmless, so there is no race in which the shell hands over the terminal before the group exists.",
        bullets: ["kill(-pgid, sig) or kill -- -PGID signals the whole group", "setsid() fails with EPERM if the caller is already a group leader", "Process groups can never move between sessions"],
      },
      {
        heading: "How Ctrl-C reaches a job",
        body: "Between your keyboard and the programs sits the terminal driver with its line discipline. When the ISIG setting is on, it watches the input for special characters: Ctrl-C (intr) produces SIGINT, Ctrl-\\ (quit) produces SIGQUIT and Ctrl-Z (susp) produces SIGTSTP. It sends that signal to the terminal's foreground process group, which the shell set earlier with tcsetpgrp.\n\nThe shell is not in that group, so it is not hit. When the job dies or stops, the shell's waitpid returns, and the shell calls tcsetpgrp again to take the terminal back. Full-screen programs like vim switch the terminal to raw mode, turning ISIG off, so Ctrl-C reaches them as an ordinary key. stty -a shows the current settings and keys.",
        visual: {
          type: "sequence",
          title: "Ctrl-C on a foreground job",
          actors: ["Shell", "Terminal driver", "Job group", "User"],
          messages: [
            { from: 0, to: 1, label: "tcsetpgrp(fd, job_pgid)" },
            { from: 3, to: 1, label: "presses Ctrl-C" },
            { from: 1, to: 2, label: "SIGINT to every process in the group" },
            { from: 2, to: 0, label: "processes die; waitpid returns" },
            { from: 0, to: 1, label: "tcsetpgrp(fd, shell_pgid): prompt again" },
          ],
        },
      },
      {
        heading: "Background jobs and terminal signals",
        body: "A background job may keep running, but it must not steal your keyboard. If a process in a background group tries to read from the terminal, the driver sends SIGTTIN to its group, which stops it; the shell shows it as Stopped and you can bring it forward with fg. Writing is allowed by default; with stty tostop set, a background write sends SIGTTOU instead.\n\nSIGTTOU is also sent when a background process calls tcsetpgrp. A shell meets this when it takes the terminal back, so interactive shells ignore SIGTTOU, SIGTTIN, SIGTSTP, SIGINT and SIGQUIT for themselves. Before exec, each child sets those signals back to SIG_DFL. This step matters, because ignored signals stay ignored across exec, and a job that ignores SIGINT cannot be stopped with Ctrl-C.",
      },
      {
        heading: "Hangups, nohup and setsid",
        body: "When the terminal goes away (you close the window or SSH drops), the kernel sends SIGHUP to the session leader, the controlling process. Shells like bash pass SIGHUP on to their jobs before exiting, and when a session leader exits, the foreground group also gets SIGHUP. Another rule: if a process group becomes orphaned (no member's parent is in the same session) while some member is stopped, every member gets SIGHUP and then SIGCONT.\n\nTo survive a hangup, nohup prog sets SIGHUP to ignored and redirects output to nohup.out. disown removes a job from bash's job table so bash does not forward SIGHUP. setsid prog starts prog in a brand-new session with no controlling terminal at all, which is the cleanest option. For interactive work, tmux or screen keep the session alive on the server and let you reattach later.",
        bullets: ["nohup ./long-task.sh > task.log 2>&1 &", "setsid -f ./long-task.sh runs it in a new session, detached", "jobs -l, fg %1, bg %1 and disown %1 manage bash jobs"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Grouping from the login down",
        layers: [
          { label: "Session (SID 1500)", detail: "One login or terminal; leader is the shell." },
          { label: "Controlling terminal", detail: "/dev/pts/3 belongs to this session." },
          { label: "Process groups (jobs)", detail: "One foreground, any number in the background." },
          { label: "Processes", detail: "Each pipeline stage is one process." },
          { label: "Threads", detail: "Tasks inside each process." },
        ],
      },
      {
        type: "compare",
        title: "Keeping a job alive after logout",
        columns: [
          { title: "nohup", points: ["Ignores SIGHUP", "Same session and group", "Output goes to nohup.out", "Easy one-off fix"] },
          { title: "setsid", points: ["New session, no terminal", "SIGHUP from the old terminal never arrives", "Redirect output yourself", "Cleanest for scripts"] },
          { title: "tmux or screen", points: ["Session lives on the server", "Reattach later and see output", "Best for interactive work", "Needs the tool installed"] },
        ],
      },
    ],
    examples: [
      {
        title: "How a shell runs one foreground job",
        explanation: "This is the core of job control in C. It assumes the shell ignored SIGINT, SIGTSTP, SIGTTOU and SIGTTIN at startup. Step 1: fork. Step 2: both parent and child call setpgid so the child leads a new group, with no race. Step 3: the child restores default signal actions and execs. Step 4: the parent gives the terminal to the job and waits with WUNTRACED, so it also wakes on Ctrl-Z. Step 5: the shell takes the terminal back.",
        code: {
          lang: "c",
          code: `pid_t pid = fork();
if (pid < 0) { perror("fork"); return; }
if (pid == 0) {
  setpgid(0, 0);                                /* new group led by me */
  signal(SIGINT, SIG_DFL);  signal(SIGTSTP, SIG_DFL);
  signal(SIGTTOU, SIG_DFL); signal(SIGTTIN, SIG_DFL);
  execvp(argv[0], argv); perror(argv[0]); _exit(127);
}
setpgid(pid, pid);                              /* same call in parent: no race */
tcsetpgrp(STDIN_FILENO, pid);                   /* job owns the keyboard */
int st;
while (waitpid(pid, &st, WUNTRACED) < 0 && errno == EINTR) {}
tcsetpgrp(STDIN_FILENO, getpgrp());             /* shell takes it back */
if (WIFSTOPPED(st)) printf("\\n[stopped] %d\\n", (int)pid);`,
        },
      },
      {
        title: "A long job that survives an SSH disconnect",
        explanation: "You start a 2-hour backup over SSH. Step 1: start it with setsid so it gets its own session and no terminal. Step 2: redirect all output, since there is no terminal to print to. Step 3: check with ps that the SID equals the job's own PID and the TTY column shows ?, which means no controlling terminal. Step 4: log out, log back in and confirm it is still running.",
        code: {
          lang: "bash",
          code: `setsid -f ./backup.sh > /tmp/backup.log 2>&1 < /dev/null
pgrep -f backup.sh
ps -o pid,pgid,sid,tty,stat,cmd -p "$(pgrep -f backup.sh)"
#   PID  PGID   SID TT   STAT CMD
# 51234 51234 51234 ?    Ss   /bin/bash ./backup.sh`,
        },
      },
    ],
    cheatSheet: [
      "ps -o pid,pgid,sid,tty,stat,comm shows group, session and terminal",
      "A + in the ps STAT column means the process is in the foreground group",
      "kill -TERM -- -1234 signals every process in group 1234",
      "Ctrl-C sends SIGINT, Ctrl-\\ sends SIGQUIT, Ctrl-Z sends SIGTSTP to the foreground group",
      "A background read from the terminal gets SIGTTIN and stops",
      "Call setpgid(child, child) in both parent and child to avoid a race",
      "setsid -f cmd starts cmd in a new session without a terminal",
      "stty -a shows which keys generate which signals",
    ],
    quiz: [
      {
        q: "Why does pressing Ctrl-C stop grep and less in a pipeline but not the shell?",
        options: ["The shell blocks all signals forever", "SIGINT goes only to the foreground process group, and the shell is in a different group", "Ctrl-C only reaches the newest process", "less forwards the signal to grep"],
        answer: 1,
        why: "The terminal driver signals the whole foreground group, which the shell set to the job's group.",
      },
      {
        q: "Why do shells call setpgid for a new child in both the parent and the child?",
        options: ["To avoid a race about which one runs first after fork", "Because the first call always fails", "To create two separate groups", "It is required by exec"],
        answer: 0,
        why: "Either may run first, so doing it in both guarantees the group exists before tcsetpgrp or exec.",
      },
      {
        q: "A background job tries to read from the terminal. What happens by default?",
        options: ["It reads normally", "It gets EOF", "It receives SIGKILL", "It receives SIGTTIN and stops"],
        answer: 3,
        why: "Only the foreground group may read; background readers are stopped with SIGTTIN.",
      },
      {
        q: "Why does setsid() fail with EPERM in some programs?",
        options: ["Only root may call it", "The caller has open files", "The caller is already a process group leader", "The terminal is in raw mode"],
        answer: 2,
        why: "A group leader cannot create a new session, which is why daemons fork first and call setsid in the child.",
      },
      {
        q: "Why must a shell's child reset SIGINT to SIG_DFL before exec?",
        options: ["Ignored signals stay ignored across exec, so Ctrl-C would not work on the job", "exec fails if SIGINT is ignored", "SIG_DFL makes the program faster", "It is needed to create the process group"],
        answer: 0,
        why: "exec resets caught signals but keeps ignored ones, and the shell ignores SIGINT for itself.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run sleep 100 | sleep 200 & and prove that both processes share one process group but have different PIDs.",
        hint: "Use ps with the pgid column and filter on the command name.",
        solution: `sleep 100 | sleep 200 &
ps -o pid,pgid,sid,comm -C sleep
# both lines show the same PGID (the PID of the first sleep)`,
      },
      {
        level: "medium",
        task: "Start a pipeline of three sleeps in the background, then kill the whole job with a single kill command using its PGID.",
        hint: "A negative number after -- tells kill to target a group.",
        solution: `sleep 300 | sleep 300 | sleep 300 &
PGID=$(ps -o pgid= -p $! | tr -d ' ')
kill -TERM -- -"$PGID"
jobs   # the job is reported as Terminated`,
      },
      {
        level: "hard",
        task: "Write a C program that forks a child, puts it in a new session with setsid, and prints the child's PID, PGID and SID to prove it is the leader of both and has no terminal.",
        hint: "getsid(0) and getpgrp() give the IDs; opening /dev/tty fails with ENXIO without a controlling terminal.",
        solution: `pid_t pid = fork();
if (pid < 0) { perror("fork"); return 1; }
if (pid == 0) {
  if (setsid() < 0) { perror("setsid"); _exit(1); }
  printf("pid %d pgid %d sid %d\\n", getpid(), getpgrp(), getsid(0));
  if (open("/dev/tty", O_RDONLY) < 0) perror("open /dev/tty");  /* ENXIO */
  _exit(0);
}
waitpid(pid, NULL, 0);`,
      },
    ],
    faq: [
      { q: "What is the difference between a process group and a session?", a: "A process group is one job, such as a pipeline, that receives job-control signals together. A session is the set of all groups started from one login or terminal." },
      { q: "Why do my programs die when I close the terminal?", a: "Closing the terminal sends SIGHUP to the session, whose default action is to terminate. Use nohup, setsid or tmux to keep them running." },
      { q: "What is the difference between Ctrl-C and Ctrl-Z?", a: "Ctrl-C sends SIGINT, which usually ends the job. Ctrl-Z sends SIGTSTP, which pauses it so you can resume it later with fg or bg." },
    ],
  },
};

export default extra;
