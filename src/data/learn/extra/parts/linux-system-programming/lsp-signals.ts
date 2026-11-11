import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-signals/signal-basics": {
    plain: [
      "A signal is a tiny message to a process that says only one thing, such as \"stop\", \"please quit\" or \"your child finished\". It has no text, just a number with a name like SIGTERM or SIGINT. Think of it as a doorbell: the process hears that someone rang, and which bell it was, but nothing more.",
      "Signals come from three places. The kernel sends them when something happens, for example SIGSEGV when a program touches memory it does not own. The terminal sends them when you press keys such as Ctrl-C. And other processes send them with the kill command or the kill() function.",
      "Each signal has a default action: end the process, end it and save a memory snapshot (a core dump), pause it, continue it, or do nothing. A program can replace most defaults with its own code, for example to save work before quitting.",
      "Two signals can never be caught: SIGKILL and SIGSTOP. They are the emergency brake. Whatever a program does, the system can always stop it or remove it. That is also why SIGKILL should be your last resort: the program gets no chance to clean up.",
    ],
    deepDive: [
      {
        heading: "Signal numbers you will meet",
        body: "On x86-64 and ARM Linux the common numbers are: SIGHUP 1, SIGINT 2, SIGQUIT 3, SIGILL 4, SIGTRAP 5, SIGABRT 6, SIGBUS 7, SIGFPE 8, SIGKILL 9, SIGUSR1 10, SIGSEGV 11, SIGUSR2 12, SIGPIPE 13, SIGALRM 14, SIGTERM 15, SIGCHLD 17, SIGCONT 18, SIGSTOP 19, SIGTSTP 20, SIGTTIN 21 and SIGTTOU 22. Some other architectures, such as MIPS and SPARC, use different numbers, so always write names in code and scripts.\n\nAbove the standard signals are the real-time signals, from SIGRTMIN to SIGRTMAX (usually 34 to 64 with glibc, which keeps two for its own thread library). Unlike standard signals, real-time signals are queued: if you send five, five are delivered, in order, and each can carry a small value with sigqueue. SIGUSR1 and SIGUSR2 have no fixed meaning; programs use them for things like reopening log files.",
        bullets: ["kill -l lists every name and number", "kill -l 15 prints TERM", "kill -s TERM PID and kill -TERM PID are the same"],
      },
      {
        heading: "Generated, pending, delivered",
        body: "A signal goes through stages. First it is generated: by the kernel, the terminal or kill(). It is then pending, recorded as one bit in a pending set. Each thread has its own pending set, and the process has a shared one. If the signal is blocked by the signal mask, it simply stays pending.\n\nDelivery happens when the target is about to return from the kernel to user code, for example after a system call or a timer interrupt, and the signal is not blocked. The kernel then takes the action: default, ignore, or run the handler. Because a standard signal is just one bit, sending SIGCHLD three times while it is pending still delivers it once. Programs must never count signals to count events.",
        visual: {
          type: "flow",
          title: "The life of one signal",
          steps: [
            { label: "Generated", detail: "Kernel, terminal or kill() raises it." },
            { label: "Pending", detail: "One bit set; repeats merge." },
            { label: "Blocked?", detail: "If masked, it waits here." },
            { label: "Delivered", detail: "On the way back to user mode." },
            { label: "Action", detail: "Default, ignore or run the handler." },
          ],
        },
      },
      {
        heading: "Sending signals: kill, raise and who may send",
        body: "kill(pid, sig) has four forms. A positive pid targets one process, 0 targets every process in your own process group, -1 targets every process you are allowed to signal, and a value below -1 targets the process group with that number. Signal number 0 sends nothing but still runs the checks, so kill(pid, 0) tells you whether a process exists and whether you may signal it.\n\nAn unprivileged sender's real or effective UID must match the target's real or saved set-user-ID. Root, or a process with the CAP_KILL capability, may signal anyone. raise(sig) sends a signal to the calling thread itself, and abort() raises SIGABRT. At the command line, pkill and killall pick processes by name; pkill -f matches the full command line, so check with pgrep -f first.",
        bullets: ["kill(pid, 0) fails with ESRCH if no such process, EPERM if not yours", "pgrep -a nginx previews what pkill nginx would hit", "Zombies still exist for kill(pid, 0) until reaped"],
      },
      {
        heading: "Exit codes, core dumps and stop timeouts",
        body: "When a signal ends a process, the shell reports the exit code 128 plus the signal number. So 130 means SIGINT (Ctrl-C), 137 means SIGKILL (very often the out-of-memory killer), 139 means SIGSEGV and 143 means SIGTERM. Seeing 137 in a container log is a strong hint to check memory limits and dmesg.\n\nThe core action writes a core dump only if the core size limit allows it (ulimit -c, often 0 by default) and according to kernel.core_pattern. On systemd machines that pattern usually pipes cores to systemd-coredump, and coredumpctl list shows them.\n\nPolite shutdown is always SIGTERM first. docker stop sends SIGTERM and waits 10 seconds before SIGKILL. systemd sends SIGTERM and waits TimeoutStopSec, 90 seconds by default. Kubernetes waits terminationGracePeriodSeconds, 30 by default.",
      },
      {
        heading: "Why SIGKILL and SIGSTOP are special, and their limits",
        body: "The kernel refuses to let anyone catch, block or ignore SIGKILL and SIGSTOP; sigaction returns EINVAL if you try. This guarantees an administrator can always stop or remove a misbehaving program. SIGSTOP freezes a process exactly where it is, and SIGCONT resumes it; debuggers and job control rely on this.\n\nThere are still cases where SIGKILL seems not to work. A task in uninterruptible sleep (state D) dies only when its kernel wait finishes, unless that wait is of the killable kind. A zombie is already dead, so the signal changes nothing. And the init process of a PID namespace, such as PID 1 in a container, does not receive SIGKILL from processes inside its own namespace; only a sender in a parent namespace can kill it that way.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where signals come from",
        root: "Signal sources",
        children: [
          { label: "CPU faults (kernel)", children: ["SIGSEGV: bad memory access", "SIGFPE: divide by zero", "SIGBUS: bad mapped file access", "SIGILL: illegal instruction"] },
          { label: "Kernel events", children: ["SIGCHLD: child changed state", "SIGPIPE: write to a closed pipe", "SIGALRM: alarm timer fired", "SIGKILL: out-of-memory killer"] },
          { label: "Terminal", children: ["SIGINT: Ctrl-C", "SIGTSTP: Ctrl-Z", "SIGHUP: terminal closed", "SIGWINCH: window resized"] },
          { label: "Other processes", children: ["kill, pkill, killall", "systemd and docker stop: SIGTERM", "Self: raise() and abort()"] },
        ],
      },
    ],
    examples: [
      {
        title: "A safe stop script: ask first, force later",
        explanation: "You want to restart a worker without losing its in-flight job. Step 1: send SIGTERM so it can finish and clean up. Step 2: poll with kill -0 once per second, which checks existence without sending anything. Step 3: only if it is still alive after 20 seconds, send SIGKILL. Step 4: report which path was taken. This is the same pattern systemd, Docker and Kubernetes follow.",
        code: {
          lang: "bash",
          code: `pid=$(pgrep -o -f myworker) || { echo "not running"; exit 0; }
kill -TERM "$pid"
for i in $(seq 1 20); do
  kill -0 "$pid" 2>/dev/null || { echo "stopped cleanly after \${i}s"; exit 0; }
  sleep 1
done
echo "still alive, forcing"
kill -KILL "$pid"`,
        },
      },
      {
        title: "Is that process alive, and is it mine?",
        explanation: "kill() with signal 0 is the standard way to test a PID. If it succeeds, the process exists and you may signal it. If it fails, errno tells you why: EPERM means it exists but belongs to someone else, ESRCH means there is no such process. Try it on your shell's PID, on 1 (EPERM unless you are root) and on a large unused number.",
        code: {
          lang: "c",
          code: `#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
  if (argc != 2) { fprintf(stderr, "usage: %s pid\\n", argv[0]); return 2; }
  pid_t pid = (pid_t)strtol(argv[1], NULL, 10);
  if (pid <= 0) { fprintf(stderr, "pid must be positive\\n"); return 2; }
  if (kill(pid, 0) == 0) puts("alive, and we may signal it");
  else if (errno == EPERM) puts("alive, but we may not signal it");
  else if (errno == ESRCH) puts("no such process");
  else perror("kill");
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "Always use names (SIGTERM), not numbers, because numbers differ between CPU architectures",
      "Exit code 128+N means killed by signal N: 130 INT, 137 KILL, 139 SEGV, 143 TERM",
      "kill -0 PID tests existence and permission without sending a signal",
      "kill -- -PGID signals a whole process group",
      "Standard signals merge while pending; real-time signals queue",
      "ulimit -c unlimited plus coredumpctl list helps you find core dumps",
      "Stop order: SIGTERM, wait, then SIGKILL only if needed",
      "sigaction on SIGKILL or SIGSTOP fails with EINVAL",
    ],
    quiz: [
      {
        q: "A container exits with code 137. What is the most likely cause?",
        options: ["It called exit(137)", "It received SIGTERM", "It was killed with SIGKILL, often by the out-of-memory killer", "It had a segmentation fault"],
        answer: 2,
        why: "137 is 128 + 9, and SIGKILL in containers very often comes from the OOM killer.",
      },
      {
        q: "You send SIGUSR1 to a process three times very quickly while it is blocked. How many times does its handler run after unblocking?",
        options: ["Once", "Three times", "Zero times", "It depends on the CPU"],
        answer: 0,
        why: "A standard signal is a single pending bit, so repeated sends merge into one delivery.",
      },
      {
        q: "What does kill(-1234, SIGTERM) do?",
        options: ["Sends SIGTERM to PID 1234 only", "Fails, because PIDs cannot be negative", "Sends SIGTERM to every process on the system", "Sends SIGTERM to every process in process group 1234"],
        answer: 3,
        why: "A pid below -1 means the process group whose ID is the absolute value.",
      },
      {
        q: "Why might kill -9 not remove a process right away?",
        options: ["The process installed a SIGKILL handler", "The process is in uninterruptible sleep (state D)", "kill -9 only works for root", "The process blocked SIGKILL with sigprocmask"],
        answer: 1,
        why: "SIGKILL cannot be caught or blocked, but a task in state D handles it only when its kernel wait ends.",
      },
      {
        q: "What is the default action of SIGCHLD?",
        options: ["Ignore", "Terminate the parent", "Stop the parent", "Dump core"],
        answer: 0,
        why: "SIGCHLD is ignored by default; parents that care install a handler or wait explicitly.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start sleep 1000 in the background, stop it with SIGSTOP, confirm its state, resume it with SIGCONT, then end it with SIGTERM and check the exit code.",
        hint: "Use ps -o stat= -p PID, and wait PID returns the job's status.",
        solution: `sleep 1000 & p=$!
kill -STOP $p; ps -o stat= -p $p    # T
kill -CONT $p; ps -o stat= -p $p    # S
kill -TERM $p; wait $p; echo $?     # 143`,
      },
      {
        level: "medium",
        task: "Write a shell script that traps SIGTERM and SIGINT, prints which one arrived, removes a temp file and exits with the usual 128+N code.",
        hint: "trap can run a function; use a separate trap per signal so you know which one fired.",
        solution: `#!/bin/bash
tmp=$(mktemp)
cleanup() { echo "got $1"; rm -f "$tmp"; exit "$2"; }
trap 'cleanup TERM 143' TERM
trap 'cleanup INT 130' INT
echo "pid $$, temp $tmp"
while true; do sleep 1; done`,
      },
      {
        level: "hard",
        task: "Write a C program that crashes on purpose with SIGSEGV, run it under a parent you write, and have the parent print the signal number and whether a core was dumped.",
        hint: "Dereference a NULL pointer in the child; use WIFSIGNALED, WTERMSIG and WCOREDUMP. Run ulimit -c unlimited first.",
        solution: `pid_t pid = fork();
if (pid < 0) { perror("fork"); return 1; }
if (pid == 0) { volatile int *p = NULL; *p = 1; _exit(0); }
int st;
if (waitpid(pid, &st, 0) < 0) { perror("waitpid"); return 1; }
if (WIFSIGNALED(st))
  printf("signal %d (%s), core dumped: %s\\n", WTERMSIG(st),
         strsignal(WTERMSIG(st)), WCOREDUMP(st) ? "yes" : "no");`,
      },
    ],
    faq: [
      { q: "What is the difference between SIGTERM and SIGKILL?", a: "SIGTERM asks the program to exit and can be caught, so it may save data and clean up. SIGKILL ends it immediately and cannot be caught, blocked or ignored." },
      { q: "What does kill -9 actually mean?", a: "It sends signal number 9, which is SIGKILL on Linux. Writing kill -KILL is clearer and portable." },
      { q: "What is SIGHUP used for in daemons?", a: "Its original meaning is that the terminal hung up, but many daemons such as nginx catch it as a request to reload their configuration." },
      { q: "Why did my program get SIGPIPE?", a: "It wrote to a pipe or socket whose reading side was closed. Ignore SIGPIPE and check write for EPIPE, or use MSG_NOSIGNAL on sockets." },
    ],
  },

  "lsp-signals/sigaction-handlers": {
    plain: [
      "A signal handler is a function you write that runs when a signal arrives. It does not run in a nice, planned place. The kernel pauses your program wherever it happens to be, maybe in the middle of printf or malloc, runs your handler, and then lets the program continue as if nothing happened.",
      "That surprise timing is the whole difficulty. If your main code was halfway through updating a list and the handler touches the same list, the list breaks. So the golden rule is: a handler should do almost nothing. Usually it just sets a flag, and the main code checks the flag at a safe moment.",
      "sigaction is the function you use to install a handler. It lets you say exactly how the handler behaves: which other signals to hold back while it runs, whether interrupted system calls should restart, and whether you want extra information such as who sent the signal.",
      "You can also tell the kernel \"not now\". Blocking a signal with sigprocmask is like putting a phone on silent: calls are not lost, they wait as missed calls, and you get them when you unblock. This lets you protect short critical sections of code.",
    ],
    deepDive: [
      {
        heading: "The fields of struct sigaction",
        body: "sa_handler points to a simple handler void f(int sig), or holds SIG_DFL or SIG_IGN. If you set the SA_SIGINFO flag you fill sa_sigaction instead, a handler void f(int sig, siginfo_t *info, void *ctx), and info tells you si_pid and si_uid (who sent it), si_code (why) and, for SIGSEGV, si_addr (the bad address).\n\nsa_mask lists extra signals to block while the handler runs. The signal being handled is blocked automatically unless you set SA_NODEFER, so a handler does not interrupt itself. Useful flags: SA_RESTART restarts many interrupted calls, SA_NOCLDSTOP stops SIGCHLD for stopped children, SA_NOCLDWAIT prevents zombies, SA_RESETHAND makes the handler one-shot, and SA_ONSTACK runs it on an alternate stack set with sigaltstack, which you need to handle stack overflows.\n\nThe old signal() function behaved differently on different systems; sigaction gives one defined behaviour everywhere.",
        bullets: ["Always sigemptyset(&sa.sa_mask) or zero the struct first", "Check the return value of sigaction itself", "sigaction(sig, NULL, &old) reads the current setting"],
      },
      {
        heading: "Why only async-signal-safe functions",
        body: "Imagine main is inside malloc and holds malloc's internal lock. A signal arrives and your handler calls printf, which calls malloc, which tries to take the same lock. The lock is already held by the same thread, which is now stuck in the handler, so the program hangs forever. With other functions, the result is not a hang but quietly corrupted data.\n\nA function is async-signal-safe if it is safe to call even when it interrupted itself. The list in signal-safety(7) includes write, read, open, close, _exit, kill, waitpid, sigaction, sigprocmask, sem_post and clock_gettime. It does not include printf, malloc, free, exit, syslog or pthread_mutex_lock. Safe functions may still change errno, so save errno at the start of a handler and restore it at the end.",
        visual: {
          type: "sequence",
          title: "How printf in a handler deadlocks",
          actors: ["Main code", "malloc lock", "Handler"],
          messages: [
            { from: 0, to: 1, label: "malloc() takes the lock" },
            { from: 1, to: 2, label: "signal arrives mid-malloc, handler runs" },
            { from: 2, to: 1, label: "printf() calls malloc(), waits for the lock" },
            { from: 1, to: 0, label: "lock owner is paused under the handler" },
            { from: 2, to: 2, label: "waits forever: deadlock" },
          ],
        },
      },
      {
        heading: "volatile sig_atomic_t, and the pause() race",
        body: "The C standard guarantees only one kind of shared variable: writing a volatile sig_atomic_t. volatile stops the compiler from keeping the value in a register, where the main loop would never see the handler's change. sig_atomic_t guarantees the write happens in one step. C11 lock-free atomics, such as atomic_int when atomic_is_lock_free says yes, are also allowed.\n\nA common bug hides in this code: while (!flag) pause(). If the signal arrives after the check but before pause starts, the handler sets the flag, pause then sleeps, and nothing wakes it. The fix is sigsuspend: block the signal, check the flag, and call sigsuspend with the old mask. sigsuspend unblocks and sleeps in one atomic step, so the signal cannot slip into the gap.",
      },
      {
        heading: "Signal masks and critical sections",
        body: "sigprocmask(how, &set, &old) changes the mask of the calling thread: SIG_BLOCK adds signals, SIG_UNBLOCK removes them, SIG_SETMASK replaces the whole mask. In threaded programs use pthread_sigmask, which works the same way per thread. A blocked signal is not lost; it stays pending and is delivered right after you unblock, at most once for standard signals. sigpending shows what is waiting.\n\nThe mask is inherited by fork and kept across exec. That is useful, but it is also a trap: if you block SIGTERM in a parent and then exec a child, the child starts with SIGTERM blocked and cannot be stopped politely. Restore the mask in the child before exec. Keep blocked sections short, for example around updating a shared data structure that a handler also reads.",
        visual: {
          type: "flow",
          title: "Protecting a critical section",
          steps: [
            { label: "Block", detail: "sigprocmask(SIG_BLOCK, &set, &old)." },
            { label: "Update shared data", detail: "No handler can interrupt now." },
            { label: "Signal arrives", detail: "Kept pending, not lost." },
            { label: "Restore mask", detail: "sigprocmask(SIG_SETMASK, &old, NULL)." },
            { label: "Handler runs", detail: "Delivered right after unblocking." },
          ],
        },
      },
      {
        heading: "EINTR and SA_RESTART",
        body: "If a handler runs while your code is blocked in a slow system call, such as read on a pipe or socket, accept or waitpid, that call may fail with errno EINTR. With SA_RESTART set, the kernel restarts most of these calls for you. Some calls never restart, no matter what: poll, select, epoll_wait, nanosleep and sleep (which return early, sleep returning the time left), and socket calls that have a timeout set with SO_RCVTIMEO.\n\nSometimes you want EINTR. A program that blocks in read and should stop on SIGTERM can install its handler without SA_RESTART; read then fails with EINTR, the loop checks the flag and exits cleanly. Either way, robust code wraps blocking calls in a loop that retries on EINTR unless a stop flag is set.",
        bullets: ["Retry pattern: do { n = read(fd, b, len); } while (n < 0 && errno == EINTR);", "With SA_RESTART, read on a slow device restarts; poll still returns EINTR", "Disk file reads are not slow calls and are not interrupted"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Inside a signal handler",
        columns: [
          { title: "Safe to do", points: ["Set a volatile sig_atomic_t flag", "write() a fixed message to a fd", "waitpid(-1, &st, WNOHANG) in a loop", "Save and restore errno", "_exit() for an emergency stop"] },
          { title: "Not safe", points: ["printf, puts, fprintf", "malloc, free, new strings", "exit() and atexit handlers", "Locking a pthread mutex", "syslog or most library calls"] },
        ],
      },
    ],
    examples: [
      {
        title: "Graceful shutdown on SIGINT and SIGTERM",
        explanation: "This program reads from stdin until told to stop. Step 1: zero the struct and set the handler, which only stores the signal number. Step 2: put both signals in sa_mask so one handler cannot interrupt the other. Step 3: leave out SA_RESTART on purpose, so a blocked read fails with EINTR when a signal arrives. Step 4: the loop sees the flag and exits normally, where printing and cleanup are safe. Run it and press Ctrl-C.",
        code: {
          lang: "c",
          code: `#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
static volatile sig_atomic_t got = 0;
static void on_stop(int sig) { got = sig; }
int main(void) {
  struct sigaction sa; memset(&sa, 0, sizeof sa);
  sa.sa_handler = on_stop;   /* no SA_RESTART: read returns EINTR */
  sigemptyset(&sa.sa_mask); sigaddset(&sa.sa_mask, SIGINT); sigaddset(&sa.sa_mask, SIGTERM);
  if (sigaction(SIGINT, &sa, NULL) < 0 || sigaction(SIGTERM, &sa, NULL) < 0) { perror("sigaction"); return 1; }
  char buf[256]; ssize_t n;
  while (!got && ((n = read(STDIN_FILENO, buf, sizeof buf)) > 0 || (n < 0 && errno == EINTR))) {}
  printf("stopping (signal %d), cleaning up\\n", (int)got); return 0;
}`,
        },
      },
      {
        title: "Waiting for a signal without the race",
        explanation: "You want to sleep until SIGUSR1 arrives. Step 1: block SIGUSR1 before checking the flag, so it cannot arrive in the gap. Step 2: check the flag. Step 3: sigsuspend(&old) atomically installs the old mask (SIGUSR1 unblocked) and sleeps; when the handler has run it returns with EINTR and the mask is blocked again. Step 4: loop until the flag is set, then restore the mask. Test it with kill -USR1 PID from another terminal.",
        code: {
          lang: "c",
          code: `static volatile sig_atomic_t got_usr1 = 0;
static void on_usr1(int s) { (void)s; got_usr1 = 1; }

/* in main, after installing on_usr1 with sigaction: */
sigset_t block, old;
sigemptyset(&block); sigaddset(&block, SIGUSR1);
sigprocmask(SIG_BLOCK, &block, &old);   /* 1. close the gap */
while (!got_usr1)                       /* 2. check safely */
  sigsuspend(&old);                     /* 3. unblock and sleep in one step */
sigprocmask(SIG_SETMASK, &old, NULL);   /* 4. back to normal */
puts("got SIGUSR1");`,
        },
      },
    ],
    cheatSheet: [
      "Zero struct sigaction and call sigemptyset on sa_mask before filling it in",
      "SA_SIGINFO plus sa_sigaction gives you the sender PID in info->si_pid",
      "The handled signal is blocked during its own handler unless SA_NODEFER is set",
      "Save errno at the start of every handler and restore it at the end",
      "Use sigsuspend, not pause, to wait for a signal without a race",
      "poll, select, epoll_wait and nanosleep return EINTR even with SA_RESTART",
      "The signal mask survives fork and exec; reset it in the child before exec",
      "Use pthread_sigmask instead of sigprocmask in multithreaded programs",
    ],
    quiz: [
      {
        q: "Which of these functions may you safely call inside a signal handler?",
        options: ["printf", "malloc", "write", "exit"],
        answer: 2,
        why: "write is on the async-signal-safe list; the others use locks or buffers that might be half-updated.",
      },
      {
        q: "What is wrong with while (!flag) pause(); ?",
        options: ["pause is not a real function", "The signal can arrive between the check and pause, so it sleeps forever", "pause blocks all signals", "flag cannot be volatile"],
        answer: 1,
        why: "Use sigsuspend with the signal blocked, which unblocks and sleeps atomically.",
      },
      {
        q: "You installed a handler with SA_RESTART. Which call still fails with EINTR when the handler runs?",
        options: ["epoll_wait", "read on a pipe", "accept", "waitpid"],
        answer: 0,
        why: "poll, select and epoll_wait are never restarted, regardless of SA_RESTART.",
      },
      {
        q: "A parent blocks SIGTERM, forks and execs a child server. What happens when systemd sends SIGTERM to the child?",
        options: ["The child exits normally", "The parent receives it instead", "The kernel converts it to SIGKILL", "It stays pending because the blocked mask was inherited across fork and exec"],
        answer: 3,
        why: "The signal mask is kept across both fork and exec, so the child must unblock it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install a SIGINT handler with sigaction that writes \"caught\" to stderr using write(), then keep the program alive with sleep in a loop. Press Ctrl-C three times.",
        hint: "Use a fixed char array and sizeof minus 1 for the length.",
        solution: `static void h(int s) {
  (void)s; int e = errno;
  static const char m[] = "caught\\n";
  ssize_t r = write(STDERR_FILENO, m, sizeof m - 1); (void)r;
  errno = e;
}
/* main */
struct sigaction sa = { .sa_handler = h }; sigemptyset(&sa.sa_mask);
if (sigaction(SIGINT, &sa, NULL) < 0) { perror("sigaction"); return 1; }
for (;;) sleep(10);   /* stop with Ctrl-\\ (SIGQUIT) */`,
      },
      {
        level: "medium",
        task: "Use SA_SIGINFO to print the PID and UID of whoever sends SIGUSR1, without calling printf in the handler.",
        hint: "Store si_pid and si_uid in volatile sig_atomic_t variables and print them from main.",
        solution: `static volatile sig_atomic_t who = 0, uid = -1;
static void h(int s, siginfo_t *si, void *c) { (void)s; (void)c; who = si->si_pid; uid = si->si_uid; }
/* main */
struct sigaction sa; memset(&sa, 0, sizeof sa);
sa.sa_sigaction = h; sa.sa_flags = SA_SIGINFO; sigemptyset(&sa.sa_mask);
if (sigaction(SIGUSR1, &sa, NULL) < 0) { perror("sigaction"); return 1; }
printf("my pid %d\\n", getpid());
while (!who) pause();   /* fine for a demo; see sigsuspend for the race */
printf("SIGUSR1 from pid %d uid %d\\n", (int)who, (int)uid);`,
      },
      {
        level: "hard",
        task: "Show that blocked signals merge: block SIGUSR1, send it to yourself 5 times, unblock, and count how many times the handler ran. Then repeat with SIGRTMIN and compare.",
        hint: "raise() while blocked marks the signal pending; real-time signals are queued.",
        solution: `static volatile sig_atomic_t n = 0;
static void h(int s) { (void)s; n++; }
static int count(int sig) {
  struct sigaction sa = { .sa_handler = h }; sigemptyset(&sa.sa_mask);
  sigaction(sig, &sa, NULL); n = 0;
  sigset_t m; sigemptyset(&m); sigaddset(&m, sig);
  sigprocmask(SIG_BLOCK, &m, NULL);
  for (int i = 0; i < 5; i++) raise(sig);
  sigprocmask(SIG_UNBLOCK, &m, NULL);
  return n;
}
/* printf("%d %d\\n", count(SIGUSR1), count(SIGRTMIN));  prints 1 5 */`,
      },
    ],
    faq: [
      { q: "Why use sigaction instead of signal?", a: "signal() has historically behaved differently between systems, for example resetting the handler after one use. sigaction lets you set the mask and flags explicitly, so the behaviour is the same everywhere." },
      { q: "Can I use printf in a signal handler if I am careful?", a: "No. Even careful use can deadlock or corrupt output if the signal interrupts another stdio call. Use write with a fixed buffer, or set a flag and print from main." },
      { q: "What does EINTR mean?", a: "Interrupted system call: a signal handler ran while the call was waiting. Retry the call, or treat it as a chance to check your stop flag." },
      { q: "Do signal handlers run in a separate thread?", a: "No. The kernel borrows one existing thread of the process, pauses what it was doing, and runs the handler on that thread's stack." },
    ],
  },

  "lsp-signals/signalfd-patterns": {
    plain: [
      "Many programs are built around an event loop: one place that waits for anything to happen, such as a new network connection or data on a socket, and then handles it. Signals do not fit this style. They interrupt the program at random moments instead of politely joining the queue of events.",
      "The fix is to turn a signal into data. The oldest method is the self-pipe trick: the handler writes one byte into a pipe, and the event loop watches that pipe like any other input. When the byte arrives, the loop knows a signal came in and handles it in normal code, where every function is safe.",
      "Linux has a cleaner way called signalfd. You tell the kernel \"do not interrupt me with these signals, give them to me as a file instead\". The kernel then puts each signal in a small record that you read from a file descriptor, together with details such as who sent it.",
      "Both methods give the same big win: all your real work happens in one place, with no handler surprises. That makes servers easier to write and to reason about.",
    ],
    deepDive: [
      {
        heading: "The self-pipe trick, step by step",
        body: "Create a pipe at startup with pipe2 and the flags O_NONBLOCK and O_CLOEXEC. The handler does only one thing: write a single byte (often the signal number) to the write end, saving and restoring errno around it. The write end must be non-blocking, because a handler must never block; if the pipe is full, write fails with EAGAIN and that is fine, since a wake-up byte is already waiting.\n\nThe event loop adds the read end to poll or epoll. When it becomes readable, the loop reads until EAGAIN to drain all bytes, then checks its flags or the bytes it read and acts in normal code. Event libraries such as libevent and libuv use this method on systems without signalfd. On Linux, an eventfd can replace the pipe and saves one descriptor.",
        visual: {
          type: "sequence",
          title: "Self-pipe trick in action",
          actors: ["Kernel", "Handler", "Pipe", "Event loop"],
          messages: [
            { from: 0, to: 1, label: "deliver SIGTERM" },
            { from: 1, to: 2, label: "write 1 byte (non-blocking)" },
            { from: 2, to: 3, label: "read end becomes readable" },
            { from: 3, to: 2, label: "read until EAGAIN" },
            { from: 3, to: 3, label: "shut down in normal code" },
          ],
        },
      },
      {
        heading: "signalfd details that bite",
        body: "signalfd(-1, &mask, SFD_NONBLOCK | SFD_CLOEXEC) creates the descriptor. Each read returns one or more struct signalfd_siginfo records of exactly 128 bytes; a buffer smaller than that fails with EINVAL. Useful fields are ssi_signo, ssi_pid, ssi_uid, ssi_code and, for SIGCHLD, ssi_status.\n\nThe signals must be blocked in every thread, or the kernel may deliver them the normal way to a thread that did not block them. Block them in main before creating any thread, because new threads inherit the mask. The second trap is exec: the blocked mask survives fork and exec, so a child you start would begin with SIGTERM and SIGINT blocked and could not be stopped. Unblock them in the child between fork and exec, or use posix_spawnattr_setsigmask.",
        bullets: ["One signalfd can watch several signals at once", "Changing the mask: call signalfd again with the existing fd", "Reading the fd consumes the pending signal"],
      },
      {
        heading: "Reaping children from an event loop",
        body: "SIGCHLD is the signal you most often route into a loop, because a server that starts workers must reap them. Two rules apply. First, several child exits can merge into a single SIGCHLD, and ssi_pid only names one of them. So after any SIGCHLD event, loop on waitpid(-1, &st, WNOHANG) until it returns 0 (children left, none finished) or -1 with ECHILD (no children left).\n\nSecond, if you want a per-child event instead, Linux 5.3 added pidfd_open(pid, 0). It returns a descriptor that becomes readable when that exact child exits. Add it to epoll, and reap with waitid(P_PIDFD, fd, &info, WEXITED) on Linux 5.4 or later. This also avoids PID reuse races, because the descriptor always refers to the one process.",
        visual: {
          type: "flow",
          title: "Handling SIGCHLD in the loop",
          steps: [
            { label: "signalfd readable", detail: "epoll reports the event." },
            { label: "Read records", detail: "Until EAGAIN; merged signals look like one." },
            { label: "waitpid WNOHANG loop", detail: "Repeat while it returns a PID." },
            { label: "Update job table", detail: "Log the status, maybe restart a worker." },
            { label: "Back to epoll_wait", detail: "No zombies remain." },
          ],
        },
      },
      {
        heading: "Choosing a method",
        body: "Use signalfd when your program is Linux-only and already uses epoll; it needs no handler code at all. Use the self-pipe trick, or an eventfd, when you need portability to macOS or the BSDs, or when a library already installed handlers you cannot remove. On BSD and macOS, kqueue has an EVFILT_SIGNAL filter that plays the same role.\n\nA third option fits threaded programs: block the signals in all threads and dedicate one thread that loops on sigwaitinfo, handling each signal in normal code. Whatever you choose, keep one owner for each signal. Mixing an old-style handler and a signalfd for the same signal leads to signals that seem to vanish.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to bring signals into normal code",
        columns: [
          { title: "Self-pipe or eventfd", points: ["Handler writes 1 byte", "Works on any Unix (eventfd: Linux)", "Needs careful non-blocking setup", "Used by libevent and libuv"] },
          { title: "signalfd", points: ["No handler at all", "Linux only", "Returns sender PID, UID, status", "Signals must be blocked in all threads"] },
          { title: "sigwaitinfo thread", points: ["One thread waits for signals", "Portable POSIX", "Fits thread-based programs", "Signals blocked in all threads"] },
        ],
      },
    ],
    examples: [
      {
        title: "An epoll loop that handles SIGTERM and SIGCHLD",
        explanation: "This is the skeleton of a supervisor that starts workers. Step 1: block both signals before any threads exist. Step 2: create a non-blocking signalfd and add it to epoll. Step 3: in the loop, read signal records until EAGAIN. Step 4: SIGTERM clears the running flag; SIGCHLD triggers a waitpid loop that reaps every finished child. Error checks are shortened here; check every call in real code.",
        code: {
          lang: "c",
          code: `sigset_t m; sigemptyset(&m); sigaddset(&m, SIGTERM); sigaddset(&m, SIGCHLD);
if (sigprocmask(SIG_BLOCK, &m, NULL) < 0) { perror("sigprocmask"); return 1; }
int sfd = signalfd(-1, &m, SFD_NONBLOCK | SFD_CLOEXEC);
int ep = epoll_create1(EPOLL_CLOEXEC);
struct epoll_event ev = { .events = EPOLLIN, .data.fd = sfd };
if (sfd < 0 || ep < 0 || epoll_ctl(ep, EPOLL_CTL_ADD, sfd, &ev) < 0) { perror("setup"); return 1; }
for (int running = 1; running; ) {
  struct epoll_event out[16];
  int n = epoll_wait(ep, out, 16, -1);
  for (int i = 0; i < n; i++) {
    struct signalfd_siginfo si;
    while (out[i].data.fd == sfd && read(sfd, &si, sizeof si) == sizeof si)
      if (si.ssi_signo == SIGTERM) running = 0;
      else while (waitpid(-1, NULL, WNOHANG) > 0) {}
  }
}`,
        },
      },
      {
        title: "The self-pipe trick in portable code",
        explanation: "Here the same idea works without signalfd. Step 1: create a non-blocking, close-on-exec pipe (pipe2 needs _GNU_SOURCE defined before the includes). Step 2: the handler writes the signal number as one byte and restores errno; a full pipe is harmless. Step 3: install it with SA_RESTART so normal calls are not disturbed. Step 4: when poll says the read end is readable, drain it and handle each signal in normal code.",
        code: {
          lang: "c",
          code: `static int pfd[2];
static void on_sig(int sig) {
  int saved = errno;
  unsigned char b = (unsigned char)sig;
  ssize_t r = write(pfd[1], &b, 1);   /* EAGAIN when full is fine */
  (void)r; errno = saved;
}
/* setup */
if (pipe2(pfd, O_NONBLOCK | O_CLOEXEC) < 0) { perror("pipe2"); exit(1); }
struct sigaction sa = { .sa_handler = on_sig, .sa_flags = SA_RESTART };
sigemptyset(&sa.sa_mask);
sigaction(SIGTERM, &sa, NULL); sigaction(SIGHUP, &sa, NULL);
/* in the poll loop, when pfd[0] is readable: */
unsigned char b; while (read(pfd[0], &b, 1) == 1) handle_signal(b);`,
        },
      },
    ],
    cheatSheet: [
      "Block the signals first, then create the signalfd, then start threads",
      "Each signalfd read returns whole 128-byte struct signalfd_siginfo records",
      "Unblock signals in a child before exec, because the mask is inherited",
      "After SIGCHLD, loop waitpid(-1, &st, WNOHANG) until it stops returning PIDs",
      "Self-pipe: both ends non-blocking; the handler only writes one byte",
      "eventfd(0, EFD_NONBLOCK | EFD_CLOEXEC) can replace the pipe on Linux",
      "pidfd_open gives one descriptor per child that becomes readable when it exits",
    ],
    quiz: [
      {
        q: "You create a signalfd for SIGTERM but forget to block SIGTERM. What happens when SIGTERM arrives?",
        options: ["It appears on the signalfd as usual", "It is delivered the normal way and, with the default action, ends the process", "signalfd returns an error", "The kernel blocks it automatically"],
        answer: 1,
        why: "Only blocked signals are left pending for the signalfd to read.",
      },
      {
        q: "Why must the write end of the self-pipe be non-blocking?",
        options: ["So the handler can never block if the pipe is full", "Because pipes are always non-blocking", "To make reads faster", "Because poll requires it"],
        answer: 0,
        why: "A blocking write in a full pipe would freeze the handler, and the program with it.",
      },
      {
        q: "Three children exit almost together and you receive one SIGCHLD record. What should you do?",
        options: ["Call waitpid once for ssi_pid", "Wait for two more SIGCHLD records", "Restart the event loop", "Loop on waitpid(-1, &st, WNOHANG) until no more children are ready"],
        answer: 3,
        why: "Standard signals merge, so one record can stand for several exits.",
      },
      {
        q: "Your program blocks SIGINT for its signalfd and then runs a child with fork and exec. What problem appears?",
        options: ["The child cannot open files", "The child inherits the signalfd and steals all signals", "The child starts with SIGINT blocked, so Ctrl-C does not stop it", "exec fails with EPERM"],
        answer: 2,
        why: "The signal mask is kept across exec, so restore it in the child before exec.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Extend the explainer's signalfd example so it loops forever printing every SIGINT and exits only on SIGTERM.",
        hint: "Add both signals to the mask and loop on read.",
        solution: `sigset_t m; sigemptyset(&m); sigaddset(&m, SIGINT); sigaddset(&m, SIGTERM);
sigprocmask(SIG_BLOCK, &m, NULL);
int sfd = signalfd(-1, &m, SFD_CLOEXEC);
if (sfd < 0) { perror("signalfd"); return 1; }
struct signalfd_siginfo si;
while (read(sfd, &si, sizeof si) == sizeof si) {
  if (si.ssi_signo == SIGTERM) break;
  printf("SIGINT from pid %u\\n", si.ssi_pid);
}`,
      },
      {
        level: "medium",
        task: "Write a program that starts 3 children which sleep 1, 2 and 3 seconds, and reaps them through a signalfd for SIGCHLD, printing each PID and exit code.",
        hint: "Block SIGCHLD before forking; in the children there is nothing to unblock because they do not exec.",
        solution: `/* block SIGCHLD and create sfd as before, then fork 3 children:
   if (fork() == 0) { sleep(i + 1); _exit(i); } */
int left = 3; struct signalfd_siginfo si;
while (left > 0 && read(sfd, &si, sizeof si) == sizeof si) {
  int st; pid_t p;
  while ((p = waitpid(-1, &st, WNOHANG)) > 0) {
    printf("pid %d exit %d\\n", p, WEXITSTATUS(st)); left--;
  }
}`,
      },
      {
        level: "hard",
        task: "Build a mini supervisor with epoll and a signalfd: it starts a worker command, restarts it whenever it exits with a non-zero code, and stops the worker and itself on SIGTERM.",
        hint: "Unblock the signals in the child before execvp, and send SIGTERM to the worker before exiting the loop.",
        solution: `static pid_t start(char **argv, const sigset_t *m) {
  pid_t p = fork();
  if (p == 0) { sigprocmask(SIG_UNBLOCK, m, NULL); execvp(argv[0], argv); _exit(127); }
  return p;
}
/* loop body after reading a record si: */
if (si.ssi_signo == SIGTERM) { kill(worker, SIGTERM); waitpid(worker, NULL, 0); break; }
int st; pid_t p;
while ((p = waitpid(-1, &st, WNOHANG)) > 0)
  if (p == worker && !(WIFEXITED(st) && WEXITSTATUS(st) == 0)) worker = start(argv + 1, &m);`,
      },
    ],
    faq: [
      { q: "Is signalfd better than a signal handler?", a: "For event-loop programs on Linux, usually yes: all handling happens in normal code where any function is safe. For tiny programs, a handler that sets a flag is simpler." },
      { q: "Does signalfd work on macOS?", a: "No, it is Linux-only. Use the self-pipe trick or kqueue with EVFILT_SIGNAL on macOS and the BSDs." },
      { q: "Why does my child process ignore Ctrl-C after I used signalfd?", a: "The blocked signal mask was inherited across fork and exec. Unblock the signals in the child before calling exec." },
    ],
  },
};

export default extra;
