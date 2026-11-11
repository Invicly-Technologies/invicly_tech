import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-time-daemons/time-timers": {
    plain: [
      "A computer has more than one clock. One shows the time of day, like the clock on the wall. It can be changed: by an admin, or by NTP when it corrects the time. Another clock just counts forward from boot and is never changed. It cannot tell you the date, but it is perfect for measuring how long something took.",
      "Mixing them up causes real bugs. If you measure a download with the wall clock and NTP moves the clock back 2 seconds in the middle, the download seems to take negative time. Timeouts can fire far too early or never.",
      "For waiting, Linux gives you sleeps (stop this thread for a while) and timers (tell me when time is up). A timerfd is a timer that looks like a file descriptor: it becomes readable when the timer fires, so it fits into the same poll or epoll loop as your sockets.",
      "The rule of thumb is short: timestamps for humans use CLOCK_REALTIME, everything about durations and timeouts uses CLOCK_MONOTONIC.",
    ],
    deepDive: [
      {
        heading: "The full family of clocks",
        body: "Besides REALTIME, MONOTONIC and BOOTTIME, Linux has a few more clocks worth knowing. CLOCK_MONOTONIC is not completely untouched: NTP may speed it up or slow it down slightly (slewing) to keep it accurate, but it never jumps. CLOCK_MONOTONIC_RAW has no NTP adjustment at all, which is useful when comparing against hardware.\n\nThe _COARSE variants (CLOCK_REALTIME_COARSE, CLOCK_MONOTONIC_COARSE) are even cheaper to read but only update once per kernel tick, so their resolution is typically 1 to 4 milliseconds. CLOCK_PROCESS_CPUTIME_ID and CLOCK_THREAD_CPUTIME_ID do not measure wall time at all but CPU time used by the process or thread, which is what you want when profiling a function that also waits for I/O.\n\nclock_getres(clock, &res) tells you the resolution of each clock. For the normal clocks on modern hardware it reports 1 nanosecond, which is the unit, not a promise of accuracy.",
        visual: {
          type: "tree",
          title: "Linux clocks by purpose",
          root: "clock_gettime(clock, &ts)",
          children: [
            { label: "Time of day", children: ["CLOCK_REALTIME", "CLOCK_REALTIME_COARSE (cheaper, ms resolution)"] },
            { label: "Durations and timeouts", children: ["CLOCK_MONOTONIC", "CLOCK_MONOTONIC_RAW (no NTP adjustment)", "CLOCK_BOOTTIME (counts suspend)"] },
            { label: "CPU time used", children: ["CLOCK_PROCESS_CPUTIME_ID", "CLOCK_THREAD_CPUTIME_ID"] },
          ],
        },
      },
      {
        heading: "Measuring durations correctly",
        body: "Read CLOCK_MONOTONIC before and after the work and subtract. A struct timespec has tv_sec and tv_nsec, so subtract both and borrow one second when the nanoseconds go negative, or convert each reading to a single 64-bit nanosecond count first, which is simpler.\n\nclock_gettime is fast because of the vDSO: for these clocks the kernel maps a small page of time data into every process, and glibc reads it without a system call, in roughly 20 to 50 nanoseconds. You can call it often without worry.\n\nFor tiny pieces of code, a single measurement lies. CPU caches are cold the first time, the CPU may be changing frequency, and the scheduler may interrupt you. Repeat the work many times, discard the first runs, and report the median or minimum. Avoid time() (one-second resolution) and gettimeofday (wall clock, microseconds) for this job.",
        bullets: ["int64_t ns = ts.tv_sec * 1000000000LL + ts.tv_nsec;", "Repeat and take the median for micro-benchmarks", "perf stat ./prog for whole-program timing and counters"],
      },
      {
        heading: "Sleeping precisely",
        body: "nanosleep(&req, &rem) sleeps for a relative duration. If a signal handler interrupts it, it returns -1 with EINTR and writes the time left into rem, so you can sleep again for the rest. The kernel never wakes you early, but it may wake you a little late: there is scheduling delay, and normal threads have a timer slack of 50 microseconds by default, which lets the kernel group nearby wakeups to save power.\n\nThe bigger problem is drift in periodic loops. Doing work and then sleeping 100 ms each time means each period is 100 ms plus the work time plus the wakeup delay, so the loop falls behind. Instead, keep an absolute deadline, add the period to it each time, and sleep until that moment with clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next, NULL). Delays no longer add up. Note that clock_nanosleep returns the error number directly (like pthreads) instead of setting errno.",
        visual: {
          type: "compare",
          title: "Periodic loop: relative vs absolute sleep",
          columns: [
            { title: "Relative: work, then sleep 100 ms", points: ["Each period = 100 ms + work + delay", "Error grows every cycle", "After an hour, many ticks are lost", "Fine for one-off delays"] },
            { title: "Absolute: next += 100 ms", points: ["Sleeps until a fixed deadline", "Work time is absorbed", "No drift over time", "clock_nanosleep with TIMER_ABSTIME"] },
          ],
        },
      },
      {
        heading: "timerfd in detail",
        body: "timerfd_create(CLOCK_MONOTONIC, TFD_NONBLOCK | TFD_CLOEXEC) returns a descriptor. timerfd_settime(fd, flags, &new, &old) arms it with a struct itimerspec: it_value is the first expiry, it_interval the period after that. An it_interval of zero makes a one-shot timer, and an it_value of zero disarms it. With TFD_TIMER_ABSTIME in flags, it_value is an absolute time on the timer's clock instead of a delay.\n\nWhen the timer expires, the descriptor becomes readable. read must use an 8-byte buffer and returns a uint64_t count of expirations since the last read. If your loop was busy and missed some ticks, the count is larger than 1, so you know exactly how many periods passed. Reading resets the count. If nothing expired, a blocking read waits; a non-blocking one returns EAGAIN.\n\nOlder alternatives are alarm and setitimer, which deliver SIGALRM, and POSIX timers from timer_create. Signals are harder to handle safely, which is why timerfd is the usual choice in event loops.",
        bullets: ["it_interval = 0: one-shot; it_value = 0: disarm", "read gives a uint64_t expiration count", "Watch it in epoll like any socket"],
      },
      {
        heading: "Timeouts in poll and epoll",
        body: "poll and epoll_wait take a timeout in milliseconds: -1 waits forever, 0 returns at once. The kernel rounds it up to its clock granularity, so the wait can be a little longer, never shorter. For finer control, ppoll takes a struct timespec, and epoll_pwait2 (Linux 5.11 and later) does the same for epoll.\n\nThe classic bug is reusing the same timeout after an early return. If poll returns because of a signal (EINTR) or an event you ignore, and you call it again with the full 5000 ms, the total wait can be much longer than 5 seconds. The cure is a deadline: compute deadline = now + timeout once, from CLOCK_MONOTONIC, and before every call pass remaining = deadline - now, stopping when it reaches zero. Event loops do the same thing with their timer list: the next deadline decides the epoll_wait timeout.",
        visual: {
          type: "flow",
          title: "Waiting with a deadline",
          steps: [
            { label: "deadline = now + 5 s", detail: "Read CLOCK_MONOTONIC once" },
            { label: "remaining = deadline - now", detail: "Recompute before every wait" },
            { label: "poll(fds, n, remaining)", detail: "Returns on event, timeout or EINTR" },
            { label: "Not done? loop", detail: "Stop when remaining reaches 0" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Two clocks when NTP steps the time back",
        actors: ["Program", "CLOCK_REALTIME", "CLOCK_MONOTONIC"],
        messages: [
          { from: 0, to: 1, label: "start: 12:00:10.0" },
          { from: 0, to: 2, label: "start: 5000.0 s" },
          { from: 1, to: 1, label: "NTP steps the clock back 3 s" },
          { from: 0, to: 1, label: "end: 12:00:08.0, elapsed -2 s (wrong)" },
          { from: 0, to: 2, label: "end: 5001.0 s, elapsed 1 s (right)" },
        ],
      },
    ],
    examples: [
      {
        title: "Time a function in milliseconds",
        explanation: "We want to know how long a piece of work takes. Step 1: write a helper that reads CLOCK_MONOTONIC and returns nanoseconds as one 64-bit integer, which avoids the borrow logic of timespec subtraction. Step 2: read it before and after the work. Step 3: also read the process CPU-time clock, so we can see whether the work was busy computing or mostly waiting. Here the work sleeps, so wall time is about 200 ms while CPU time is near 0.",
        code: {
          lang: "c",
          code: String.raw`#include <stdint.h>
#include <stdio.h>
#include <time.h>
static int64_t ns(clockid_t c) {
  struct timespec ts;
  if (clock_gettime(c, &ts) < 0) { perror("clock_gettime"); return 0; }
  return (int64_t)ts.tv_sec * 1000000000 + ts.tv_nsec;
}
int main(void) {
  int64_t w0 = ns(CLOCK_MONOTONIC), c0 = ns(CLOCK_PROCESS_CPUTIME_ID);
  struct timespec d = { 0, 200000000 }; nanosleep(&d, NULL);   /* the "work" */
  printf("wall %.1f ms, cpu %.3f ms\n",
         (ns(CLOCK_MONOTONIC) - w0) / 1e6, (ns(CLOCK_PROCESS_CPUTIME_ID) - c0) / 1e6);
  return 0;
}`,
        },
      },
      {
        title: "A periodic loop that does not drift",
        explanation: "A sensor must be read every 100 ms for hours. Step 1: take the start time from CLOCK_MONOTONIC. Step 2: each loop, add 100 ms to the deadline and normalise the nanoseconds. Step 3: sleep until that absolute time with TIMER_ABSTIME. Step 4: clock_nanosleep returns the error code itself; on EINTR, simply sleep again until the same deadline. However long the work takes (as long as it is under 100 ms), tick 36000 happens one hour after the start.",
        code: {
          lang: "c",
          code: String.raw`#include <errno.h>
#include <stdio.h>
#include <time.h>
int main(void) {
  struct timespec next;
  clock_gettime(CLOCK_MONOTONIC, &next);
  for (long tick = 0; tick < 36000; tick++) {
    next.tv_nsec += 100000000;                              /* + 100 ms */
    if (next.tv_nsec >= 1000000000) { next.tv_sec++; next.tv_nsec -= 1000000000; }
    int rc;
    while ((rc = clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next, NULL)) == EINTR) {}
    if (rc) { fprintf(stderr, "clock_nanosleep: error %d\n", rc); return 1; }
    /* read_sensor(); */
  }
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "Durations and timeouts: CLOCK_MONOTONIC; log timestamps: CLOCK_REALTIME",
      "clock_gettime goes through the vDSO: no syscall, tens of nanoseconds",
      "CLOCK_PROCESS_CPUTIME_ID measures CPU time used, not wall time",
      "nanosleep on EINTR: sleep again for the time left in rem",
      "Periodic work: clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next, NULL)",
      "clock_nanosleep returns the error number; it does not set errno",
      "timerfd read needs 8 bytes and returns the number of expirations",
      "Keep a monotonic deadline and pass the remaining time to poll each call",
    ],
    quiz: [
      {
        q: "Which clock should a 30-second idle timeout use?",
        options: ["CLOCK_REALTIME", "CLOCK_PROCESS_CPUTIME_ID", "CLOCK_MONOTONIC", "time()"],
        answer: 2,
        why: "MONOTONIC never jumps, so changes to the wall clock cannot shorten or stretch the timeout.",
      },
      {
        q: "A loop does 20 ms of work and then nanosleeps 100 ms. How long is each period?",
        options: ["At least 120 ms, so the loop drifts", "Exactly 100 ms", "Exactly 80 ms", "It depends only on the timer slack"],
        answer: 0,
        why: "A relative sleep starts after the work, so work time and wakeup delay add up every cycle.",
      },
      {
        q: "A read from a periodic timerfd returns 3. What does that mean?",
        options: ["Three bytes were read", "The timer will fire three more times", "The timer was armed three times", "The timer expired three times since the last read"],
        answer: 3,
        why: "timerfd counts expirations, so a busy loop knows how many ticks it missed.",
      },
      {
        q: "poll with a 5000 ms timeout keeps returning early with EINTR, and the code retries with 5000 each time. What is wrong?",
        options: ["Nothing, poll handles it", "The total wait can be far longer than 5 seconds", "poll ignores EINTR", "The timeout must be in microseconds"],
        answer: 1,
        why: "Each retry restarts the full wait; compute the remaining time from a monotonic deadline instead.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the resolution and the current value of CLOCK_REALTIME, CLOCK_MONOTONIC, CLOCK_MONOTONIC_COARSE and CLOCK_BOOTTIME.",
        hint: "Loop over an array of clockid_t and call clock_getres and clock_gettime for each.",
        solution: String.raw`clockid_t ids[] = { CLOCK_REALTIME, CLOCK_MONOTONIC, CLOCK_MONOTONIC_COARSE, CLOCK_BOOTTIME };
const char *names[] = { "REALTIME", "MONOTONIC", "MONOTONIC_COARSE", "BOOTTIME" };
for (int i = 0; i < 4; i++) {
  struct timespec r, t;
  if (clock_getres(ids[i], &r) < 0 || clock_gettime(ids[i], &t) < 0) { perror(names[i]); continue; }
  printf("%-17s res %ld ns  now %lld.%09ld\n", names[i], r.tv_nsec, (long long)t.tv_sec, t.tv_nsec);
}
/* COARSE usually shows a resolution of 1 to 4 ms; the others 1 ns */`,
      },
      {
        level: "medium",
        task: "Watch standard input and a 1-second timerfd in the same poll loop: echo typed lines, and print \"tick N\" each second, with N counting missed ticks too.",
        hint: "Two pollfd entries. On the timer, read the uint64_t count and add it to N.",
        solution: String.raw`int tfd = timerfd_create(CLOCK_MONOTONIC, TFD_CLOEXEC);
struct itimerspec its = { .it_value = { 1, 0 }, .it_interval = { 1, 0 } };
if (tfd < 0 || timerfd_settime(tfd, 0, &its, NULL) < 0) { perror("timerfd"); return 1; }
struct pollfd p[2] = { { .fd = 0, .events = POLLIN }, { .fd = tfd, .events = POLLIN } };
uint64_t ticks = 0, exp; char buf[256];
for (;;) {
  if (poll(p, 2, -1) < 0) { if (errno == EINTR) continue; perror("poll"); return 1; }
  if (p[1].revents & POLLIN && read(tfd, &exp, 8) == 8) printf("tick %llu\n", (unsigned long long)(ticks += exp));
  if (p[0].revents & (POLLIN | POLLHUP)) { ssize_t n = read(0, buf, sizeof buf); if (n <= 0) break; fwrite(buf, 1, n, stdout); }
}`,
      },
      {
        level: "hard",
        task: "Write int wait_readable(int fd, int timeout_ms) that returns 1 when fd is readable, 0 on timeout and -1 on error, and keeps the total wait correct across EINTR.",
        hint: "Compute a monotonic deadline once; recompute the remaining milliseconds before each poll.",
        solution: String.raw`int wait_readable(int fd, int timeout_ms) {
  struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t);
  int64_t deadline = t.tv_sec * 1000LL + t.tv_nsec / 1000000 + timeout_ms;
  for (;;) {
    clock_gettime(CLOCK_MONOTONIC, &t);
    int64_t left = deadline - (t.tv_sec * 1000LL + t.tv_nsec / 1000000);
    if (left <= 0) return 0;
    struct pollfd p = { .fd = fd, .events = POLLIN };
    int r = poll(&p, 1, (int)left);
    if (r > 0) return 1;
    if (r == 0) return 0;
    if (errno != EINTR) return -1;
  }
}`,
      },
    ],
    faq: [
      { q: "Is CLOCK_MONOTONIC the same on every machine?", a: "No. It usually counts from boot, so values from two machines (or two boots) cannot be compared. Use it only for differences within one running system." },
      { q: "Why does my 1 ms sleep take 1.1 ms?", a: "The kernel never wakes you early but adds scheduling delay and timer slack (50 microseconds by default). Real-time scheduling or prctl(PR_SET_TIMERSLACK) can tighten it." },
      { q: "Does CLOCK_MONOTONIC stop during suspend?", a: "Yes, on Linux it does not count time spent suspended. Use CLOCK_BOOTTIME if the suspended time must be included." },
      { q: "Should I use alarm or SIGALRM for timeouts?", a: "Avoid them in new code. Signals interrupt any call at any moment and there is only one alarm per process. timerfd or a poll timeout is easier to get right." },
    ],
  },

  "lsp-time-daemons/daemons": {
    plain: [
      "A daemon is a program that runs in the background, without a window or terminal, often from boot to shutdown. sshd waits for SSH logins, cron runs scheduled jobs, and a database server waits for queries.",
      "Before systemd, a program had to make itself a daemon. It had to cut every tie to the terminal that started it, so that closing that terminal or pressing Ctrl+C there would not kill it, and so the shell prompt would come back at once.",
      "The classic recipe does this in a fixed set of steps: fork, start a new session, fork again, move to the root folder, set the file permission mask, point the standard input and output at /dev/null, write a PID file and send logs to syslog. Each step fixes one specific problem.",
      "New programs usually let systemd do all of this. But you will still meet the recipe in older code and in interviews, and knowing why each step exists teaches a lot about sessions, terminals and file descriptors.",
    ],
    deepDive: [
      {
        heading: "Why fork, setsid, and fork again",
        body: "The first fork does two jobs. The parent exits, so the shell sees the command finish and shows its prompt again. And the child, with a fresh PID, is guaranteed not to be a process group leader. That matters because setsid fails with EPERM when called by a group leader, and a program started from a shell usually is one.\n\nsetsid creates a new session and a new process group, with the child as leader of both, and with no controlling terminal. Now a hangup on the old terminal, or Ctrl+C there, cannot reach it.\n\nThe second fork is a safety net. On Linux and System V-style systems, a session leader that opens a terminal device without O_NOCTTY gets that terminal as its controlling terminal again. After the second fork the remaining process is not the session leader, so this can never happen. glibc's daemon(3) helper skips this second fork, which is why some projects write the steps themselves.",
        visual: {
          type: "sequence",
          title: "Who exits and who stays",
          actors: ["Shell", "Original process", "Child", "Daemon"],
          messages: [
            { from: 0, to: 1, label: "start ./mydaemon" },
            { from: 1, to: 2, label: "fork" },
            { from: 1, to: 0, label: "exit: shell prompt returns" },
            { from: 2, to: 2, label: "setsid: new session, no terminal" },
            { from: 2, to: 3, label: "fork again" },
            { from: 2, to: 2, label: "exit: daemon is not session leader" },
            { from: 3, to: 3, label: "umask, chdir, fds, PID file, run" },
          ],
        },
      },
      {
        heading: "Working directory and umask",
        body: "A process keeps its current directory in use. If the daemon was started from /mnt/usb and stays there, nobody can unmount /mnt/usb for as long as it runs. chdir(\"/\") solves this, since the root filesystem is never unmounted while the system is up. A daemon that needs a data directory should change into that instead and use relative paths from there.\n\nThe umask is inherited from whoever started the program, so files the daemon creates would get unpredictable permissions: a user with umask 077 starts it and its log file is unreadable by the admin group; a user with umask 000 starts it and its files are world-writable. Old recipes call umask(0) and then pass explicit modes to every open. Setting a known mask such as umask(027) is safer, because it also covers files created by libraries.",
        bullets: ["chdir(\"/\") so no mount point stays busy", "umask(027): new files 640, new dirs 750", "Always check the result of chdir"],
      },
      {
        heading: "Closing and reopening descriptors",
        body: "A daemon inherits every open descriptor from its parent: perhaps a socket, a log file or the write end of a pipe that some script is waiting on. Left open, they keep resources busy and can stop a parent pipeline from ever seeing end of file. So close everything above 2. On Linux 5.9 and newer, with glibc 2.34 or later, close_range(3, ~0U, 0) does it in one call. On older systems, loop up to sysconf(_SC_OPEN_MAX) or walk /proc/self/fd.\n\nDescriptors 0, 1 and 2 need a different treatment: do not just close them, reopen them on /dev/null. If fd 1 were simply closed, the next open in the program (say the database file) would get number 1, and any stray printf would write into your database. Opening /dev/null and dup2-ing it onto 0, 1 and 2 keeps those numbers safely occupied.",
        bullets: ["close_range(3, ~0U, 0) closes all inherited extras", "dup2 /dev/null onto 0, 1, 2; never leave them closed", "Open new files with O_CLOEXEC so children do not inherit them"],
      },
      {
        heading: "PID files done right",
        body: "A PID file, traditionally /run/name.pid, holds the daemon's process ID so scripts can send it signals. The naive version just writes the number. It breaks in two ways: two copies started together both write the file, and after a crash the old file remains, possibly holding a PID that now belongs to some unrelated process. A script that blindly runs kill $(cat file) may hit the wrong program.\n\nThe robust version uses a lock. Open the file with O_CREAT, take an exclusive non-blocking lock (flock with LOCK_EX | LOCK_NB, or fcntl F_SETLK), and only then truncate it and write your PID. Keep the descriptor open for the whole life of the process. A second copy fails to get the lock and exits with \"already running\". When the process dies, even by SIGKILL, the kernel releases the lock, so a stale file is harmless. Take the lock after the final fork, so the PID you write is the daemon's own.",
      },
      {
        heading: "Logging with syslog",
        body: "A daemon has no terminal, so stderr goes nowhere. The traditional answer is syslog. Call openlog(\"mydaemon\", LOG_PID | LOG_NDELAY, LOG_DAEMON) once: the ident appears in each line, LOG_PID adds the PID, LOG_NDELAY opens the connection right away, and LOG_DAEMON is the facility (the category for routing). Then call syslog(LOG_ERR, \"cannot open %s: %m\", path). The %m is replaced by strerror(errno), a handy syslog extension.\n\nPick levels with care: LOG_ERR for failures, LOG_WARNING for odd but survivable things, LOG_INFO for normal events, LOG_DEBUG for detail. Never pass text from outside as the format string; write syslog(LOG_INFO, \"%s\", msg), or a % in the message becomes a format-string bug.\n\nOn systemd machines, syslog messages go through /dev/log to journald, so journalctl -t mydaemon shows them, and rsyslog may also write them to /var/log/syslog or /var/log/messages.",
        bullets: ["%m in a syslog format prints strerror(errno)", "syslog(LOG_INFO, \"%s\", text) for untrusted text", "logger -t test hello sends a test message from the shell"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Classic daemon vs systemd service",
        columns: [
          { title: "Classic SysV daemon", points: ["Forks itself into the background", "Writes its own PID file", "Logs through syslog", "Init script starts and stops it"] },
          { title: "systemd service", points: ["Runs in the foreground", "systemd tracks it in a cgroup", "Logs to stdout and stderr", "Unit file handles restart and sandboxing"] },
        ],
      },
    ],
    examples: [
      {
        title: "A daemonize() with error checks",
        explanation: "The explainer's recipe skips error checks; here is one that reports failure. Step 1: the first fork, where the parent leaves with _exit so it does not flush stdio buffers twice. Step 2: setsid. Step 3: the second fork. Step 4: a known umask and the root directory. Step 5: close extra descriptors and put /dev/null on 0, 1 and 2. Errors before step 5 can still be printed with perror, because stderr is still connected. Call it before creating threads.",
        code: {
          lang: "c",
          code: String.raw`#define _GNU_SOURCE
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
int daemonize(void) {
  pid_t pid = fork(); if (pid < 0) return -1;
  if (pid > 0) _exit(0);                       /* original process: shell returns */
  if (setsid() < 0) return -1;
  if ((pid = fork()) < 0) return -1;
  if (pid > 0) _exit(0);                       /* session leader leaves */
  umask(027); if (chdir("/") < 0) return -1;
  close_range(3, ~0U, 0);                      /* Linux 5.9+, glibc 2.34+ */
  int fd = open("/dev/null", O_RDWR);
  if (fd < 0 || dup2(fd, 0) < 0 || dup2(fd, 1) < 0 || dup2(fd, 2) < 0) return -1;
  if (fd > 2) close(fd);
  return 0;
}`,
        },
      },
      {
        title: "A PID file with a lock, for a single instance",
        explanation: "We want exactly one copy running and a PID file that is never misleading. Step 1: open or create the file, with O_CLOEXEC so children do not inherit it. Step 2: try an exclusive lock without waiting; failure with EWOULDBLOCK means another copy holds it. Step 3: only now truncate and write our PID. Step 4: return the descriptor and keep it open forever; the lock lasts as long as it is open, and the kernel drops it if we crash. Check it from a shell with flock -n /run/mydaemon.pid true, which fails while the daemon runs.",
        code: {
          lang: "c",
          code: String.raw`#include <fcntl.h>
#include <stdio.h>
#include <sys/file.h>
#include <unistd.h>
int write_pidfile(const char *path) {          /* returns fd to keep open, or -1 */
  int fd = open(path, O_RDWR | O_CREAT | O_CLOEXEC, 0644);
  if (fd < 0) return -1;
  if (flock(fd, LOCK_EX | LOCK_NB) < 0) { close(fd); return -1; }   /* already running */
  char buf[32]; int n = snprintf(buf, sizeof buf, "%ld\n", (long)getpid());
  if (ftruncate(fd, 0) < 0 || write(fd, buf, n) != n) { close(fd); return -1; }
  return fd;
}`,
        },
      },
    ],
    cheatSheet: [
      "Order: fork, setsid, fork, umask, chdir(\"/\"), close fds, /dev/null on 0-2",
      "setsid fails with EPERM in a process group leader, hence the first fork",
      "ps -o pid,ppid,pgid,sid,tty,cmd -p PID: a daemon shows ? under TTY",
      "close_range(3, ~0U, 0) closes every inherited descriptor above 2",
      "PID file: open, flock(LOCK_EX | LOCK_NB), then write; keep the fd open",
      "openlog(\"name\", LOG_PID, LOG_DAEMON); syslog(LOG_ERR, \"... %m\");",
      "journalctl -t name shows syslog messages from that ident",
      "glibc daemon(0, 0) forks once and calls setsid; it does not fork twice",
    ],
    quiz: [
      {
        q: "Why does the classic recipe fork before calling setsid?",
        options: ["setsid fails in a process group leader, and the child is never one", "fork is needed to get a terminal", "setsid only works in the parent", "To create the PID file"],
        answer: 0,
        why: "A freshly forked child has a new PID, so it cannot be the leader of an existing group.",
      },
      {
        q: "What does the second fork protect against?",
        options: ["Zombie processes", "Signals from the old terminal", "Losing the PID file", "The daemon acquiring a controlling terminal when it opens a tty"],
        answer: 3,
        why: "Only a session leader can gain a controlling terminal, and after the second fork the daemon is not one.",
      },
      {
        q: "Why reopen fds 0, 1 and 2 on /dev/null instead of just closing them?",
        options: ["Closing them is not allowed", "So the next opened file does not get number 1 and receive stray printf output", "/dev/null makes the daemon faster", "syslog needs fd 2 open"],
        answer: 1,
        why: "open returns the lowest free number, so a closed fd 1 would be reused by the next file.",
      },
      {
        q: "A daemon crashed with SIGKILL and left its PID file. With the lock-based design, what happens at the next start?",
        options: ["It refuses to start until the file is deleted", "It kills the process named in the file", "It takes the lock, which the kernel released, and rewrites the file", "It waits for the old PID to exit"],
        answer: 2,
        why: "File locks die with the process, so a leftover file without a lock means nobody is running.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run the explainer's daemon, find it with ps, and check its PPID, session ID and TTY. Then find its log lines in the journal.",
        hint: "After daemonizing, the parent is PID 1 (or a subreaper) and the TTY column shows ?.",
        solution: String.raw`gcc -o mydaemon mydaemon.c && ./mydaemon
ps -o pid,ppid,pgid,sid,tty,cmd -C mydaemon
#  PID  PPID  PGID   SID TT  CMD
# 4321     1  4320  4320 ?   ./mydaemon     (PID != SID: not the session leader)
journalctl -t mydaemon -n 5
pkill mydaemon`,
      },
      {
        level: "medium",
        task: "Combine daemonize and write_pidfile into a daemon that refuses to start twice. Start it, try a second copy, read the PID file, then stop it with that PID.",
        hint: "Daemonize first, then take the lock, so the file holds the final PID. Report \"already running\" with syslog.",
        solution: String.raw`int main(void) {
  if (daemonize() < 0) { perror("daemonize"); return 1; }
  openlog("single", LOG_PID, LOG_DAEMON);
  int pidfd = write_pidfile("/tmp/single.pid");
  if (pidfd < 0) { syslog(LOG_ERR, "already running or pid file error: %m"); return 1; }
  for (;;) pause();
}
/* ./single; ./single; journalctl -t single -n 2   -> second one logs already running
   kill $(cat /tmp/single.pid) */`,
      },
      {
        level: "hard",
        task: "Make the original process exit only after the daemon has finished starting, with exit code 0 on success or 1 on failure, using a pipe between the first process and the final daemon.",
        hint: "Create the pipe before the first fork. The first parent blocks reading it; the daemon writes one status byte after setup and closes it. If the daemon dies first, read returns 0.",
        solution: String.raw`int p[2]; if (pipe(p) < 0) return 1;
pid_t pid = fork();
if (pid > 0) {                                   /* original process */
  char st = 1; close(p[1]);
  if (read(p[0], &st, 1) != 1) st = 1;           /* EOF: daemon died early */
  _exit(st);
}
close(p[0]);
/* ... setsid, second fork, umask, chdir, close_range(3, ~0U, 0) except p[1] ... */
char ok = setup_succeeded ? 0 : 1;
write(p[1], &ok, 1); close(p[1]);                /* releases the waiting shell */`,
      },
    ],
    faq: [
      { q: "Do I still need to daemonize if I use systemd?", a: "No. Run in the foreground with Type=simple, exec or notify. systemd handles the background, the logs and the PID; forking only adds complexity." },
      { q: "What is the difference between nohup and a real daemon?", a: "nohup only makes the command ignore SIGHUP and redirects output to nohup.out. The process stays in the shell's session and keeps the terminal's other ties; a daemon fully detaches." },
      { q: "Where should a PID file go?", a: "In /run (often /run/name/name.pid for non-root daemons), which is a tmpfs cleared at boot, so stale files never survive a reboot." },
      { q: "Why do daemons reload on SIGHUP?", a: "A daemon has no terminal, so it will never receive a real hangup. The unused signal became the convention for re-reading configuration." },
    ],
  },

  "lsp-time-daemons/systemd-services": {
    plain: [
      "systemd is the first program Linux starts at boot, and it manages every service after that. You describe your program in a small text file called a unit file: what command to run, which user to run as, when to restart it. systemd does the rest.",
      "This makes your program simpler. It does not need to fork into the background, write a PID file or manage log files. It just runs normally and prints messages to standard output. systemd keeps it in the background and sends every line to the journal, where journalctl can search it.",
      "If the program crashes, systemd can start it again after a short pause. If you change the config, systemctl reload can tell the program to re-read it. And with a few extra lines in the unit file, systemd can lock the program inside a sandbox: read-only system folders, no access to home directories, no way to gain more privileges.",
      "Your program can also tell systemd exactly when it is ready to serve, so other services that depend on it start at the right moment.",
    ],
    deepDive: [
      {
        heading: "Choosing the service Type",
        body: "Type= tells systemd how to know your service has started. Type=simple (the default when ExecStart is set) treats the service as started right after the fork, before your program even runs. If the binary is missing, systemctl start still reports success. Type=exec waits until execve has succeeded, so a typo in the path makes start fail visibly; it is a good default for new units (systemd 240 and later).\n\nType=notify waits until the program sends READY=1 over the notification socket. Use it when startup takes time (loading data, opening a port) and other units must not start too early. Type=notify-reload (systemd 253 and later) also uses notifications for reloads.\n\nType=forking is for classic daemons that fork themselves: systemd waits for the parent to exit and finds the main process, ideally from PIDFile=. Type=oneshot is for scripts that run and finish, like a migration step; combine it with RemainAfterExit=yes if the unit should count as active afterwards.",
        visual: {
          type: "tree",
          title: "When does systemd consider the service started?",
          root: "Type=",
          children: [
            { label: "simple", children: ["Right after fork", "Missing binary still looks started"] },
            { label: "exec", children: ["After execve succeeds", "Good default for new units"] },
            { label: "notify", children: ["When the program sends READY=1", "Best for slow startups"] },
            { label: "forking", children: ["When the parent process exits", "Legacy daemons, use PIDFile="] },
            { label: "oneshot", children: ["When the command finishes", "Setup scripts and jobs"] },
          ],
        },
      },
      {
        heading: "Logging to the journal",
        body: "systemd connects the service's stdout and stderr to journald. Each line becomes one journal entry, tagged with the unit name, PID and time. No log files, no rotation code. Read them with journalctl -u chatd, follow live with -f, filter by level with -p warning, or by time with --since \"10 min ago\".\n\nTo give a line a priority, start it with a syslog level in angle brackets: a line beginning with <3> is logged as an error, <4> as a warning, <6> as info. Lines without a prefix get the default level, info.\n\nOne trap catches almost everyone: when stdout is not a terminal, C stdio switches to full buffering. Your log lines then sit in a 4 KiB buffer and appear in the journal minutes late, or are lost when the process is killed. Call setvbuf(stdout, NULL, _IOLBF, 0) at startup for line buffering, or write logs to stderr, which is unbuffered.",
        bullets: ["journalctl -u chatd -f follows the log", "journalctl -u chatd -p err -b shows errors since boot", "setvbuf(stdout, NULL, _IOLBF, 0) or log to stderr"],
      },
      {
        heading: "Restarts, reload and stop",
        body: "Restart=on-failure restarts the service when it exits with a non-zero code, is killed by a signal, or times out; Restart=always also restarts after a clean exit. RestartSec=2 waits 2 seconds before each attempt. To avoid endless crash loops, systemd stops trying when a unit starts more than StartLimitBurst times (default 5) within StartLimitIntervalSec (default 10 s); these two go in the [Unit] section.\n\nFor reload, set ExecReload=/bin/kill -HUP $MAINPID and handle SIGHUP in the program: set a flag in the handler (or use signalfd) and re-read the configuration in the main loop. If the new config is invalid, keep the old one and log an error.\n\nsystemctl stop sends SIGTERM to every process in the service's cgroup (the default KillMode=control-group), waits TimeoutStopSec (90 seconds by default), and then sends SIGKILL. So handle SIGTERM: stop accepting, finish or drop in-flight work, flush, and exit 0 quickly.",
        visual: {
          type: "flow",
          title: "What systemctl stop does",
          steps: [
            { label: "ExecStop, if set", detail: "Optional command to ask nicely" },
            { label: "SIGTERM", detail: "Sent to the service's processes" },
            { label: "Wait", detail: "Up to TimeoutStopSec, default 90 s" },
            { label: "SIGKILL", detail: "Anything still running is killed" },
            { label: "Unit inactive", detail: "cgroup is empty, ExecStopPost runs" },
          ],
        },
      },
      {
        heading: "Sandboxing with a few lines",
        body: "systemd can apply many kernel security features without changing your code. DynamicUser=yes runs the service as a temporary user that exists only while it runs. ProtectSystem=strict makes the whole filesystem read-only for the service, except API filesystems like /dev, /proc and /sys; grant write access only where needed with StateDirectory=chatd (creates /var/lib/chatd), RuntimeDirectory=chatd (/run/chatd), LogsDirectory= or ReadWritePaths=. ProtectHome=yes hides /home, /root and /run/user, and PrivateTmp=yes gives the service its own /tmp.\n\nNoNewPrivileges=yes stops setuid programs from raising privileges. CapabilityBoundingSet= removes capabilities, and AmbientCapabilities=CAP_NET_BIND_SERVICE lets a non-root service bind port 80. RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX blocks other socket types, and SystemCallFilter=@system-service allows only the system calls a typical service needs. MemoryMax= and TasksMax= cap resources.\n\nsystemd-analyze security chatd scores the unit from 0 (locked down) to 10 (exposed) and lists what is still open. Add options one by one and test after each.",
        bullets: ["ProtectSystem=strict + StateDirectory= for writable data", "AmbientCapabilities=CAP_NET_BIND_SERVICE for ports below 1024", "systemd-analyze security name.service shows the exposure score"],
      },
      {
        heading: "Readiness with sd_notify",
        body: "With Type=notify, systemd sets the NOTIFY_SOCKET environment variable to the path of a Unix datagram socket. The program sends short text messages to it. The easiest way is libsystemd: include systemd/sd-daemon.h, link with -lsystemd, and call sd_notify(0, \"READY=1\") once the program can really serve, for example after bind and listen succeeded. It returns a positive number on success, 0 if NOTIFY_SOCKET is not set (so the same binary works outside systemd), and a negative error code on failure.\n\nOther useful messages: STATUS=Serving 42 clients shows up in systemctl status. STOPPING=1 says shutdown has begun. RELOADING=1 marks a reload in progress. With WatchdogSec=30 in the unit, the program must send WATCHDOG=1 regularly (at least every 30 seconds, ideally every 15); if it hangs and stops sending, systemd treats the service as failed and can restart it.\n\nThe protocol is simple enough to implement without the library, and the systemd-notify command does the same from shell scripts.",
        visual: {
          type: "sequence",
          title: "Type=notify startup and watchdog",
          actors: ["systemd", "Service", "Dependent unit"],
          messages: [
            { from: 0, to: 1, label: "exec with NOTIFY_SOCKET set" },
            { from: 1, to: 1, label: "load config, bind, listen" },
            { from: 1, to: 0, label: "READY=1" },
            { from: 0, to: 2, label: "start units ordered After= this one" },
            { from: 1, to: 0, label: "STATUS=Serving 42 clients" },
            { from: 1, to: 0, label: "WATCHDOG=1 every 15 s" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What a hardened unit takes away",
        layers: [
          { label: "Your program", detail: "Runs in the foreground, logs to stdout" },
          { label: "Identity", detail: "DynamicUser, no new privileges, few capabilities" },
          { label: "Filesystem", detail: "ProtectSystem=strict, ProtectHome, PrivateTmp" },
          { label: "Kernel interface", detail: "Address families and system call filter" },
          { label: "Resources", detail: "MemoryMax, TasksMax, CPU limits in the cgroup" },
        ],
      },
    ],
    examples: [
      {
        title: "A hardened, restartable notify service",
        explanation: "This extends the explainer's unit. Type=notify makes start wait for READY=1. Restart and RestartSec recover from crashes, and the [Unit] start limit stops crash loops. ExecReload sends SIGHUP. DynamicUser=yes also switches on ProtectSystem=strict, ProtectHome=read-only, PrivateTmp and NoNewPrivileges, so the service gets a read-only system with one writable state directory, plus the right to bind port 80 and only the usual socket types and system calls. After installing it: systemctl daemon-reload, systemctl enable --now chatd, then systemd-analyze security chatd.",
        code: {
          lang: "ini",
          code: String.raw`[Unit]
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=notify
ExecStart=/usr/local/bin/chatd --port 80 --data /var/lib/chatd
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=2
DynamicUser=yes
StateDirectory=chatd
AmbientCapabilities=CAP_NET_BIND_SERVICE
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
SystemCallFilter=@system-service

[Install]
WantedBy=multi-user.target`,
        },
      },
      {
        title: "The C side: ready, reload and clean stop",
        explanation: "The program matches the unit above. Step 1: install SIGHUP and SIGTERM handlers that only set flags, which is async-signal-safe. Step 2: make stdout line-buffered so each log line reaches the journal at once. Step 3: after setup, send READY=1. Step 4: in the main loop, reload on the flag and exit cleanly on SIGTERM. Build with gcc chatd.c -lsystemd. In a real server the loop is epoll_wait, which returns EINTR when a signal arrives.",
        code: {
          lang: "c",
          code: String.raw`#include <signal.h>
#include <stdio.h>
#include <systemd/sd-daemon.h>
#include <unistd.h>
static volatile sig_atomic_t reload, stop;
static void on_sig(int s) { if (s == SIGHUP) reload = 1; else stop = 1; }
int main(void) {
  struct sigaction sa = { .sa_handler = on_sig }; sigemptyset(&sa.sa_mask);
  if (sigaction(SIGHUP, &sa, NULL) < 0 || sigaction(SIGTERM, &sa, NULL) < 0) return 1;
  setvbuf(stdout, NULL, _IOLBF, 0);               /* one journal entry per line, now */
  sd_notify(0, "READY=1");                        /* after load_config, bind, listen */
  while (!stop) {
    if (reload) { reload = 0; puts("reloading config"); /* load_config(); */ }
    sleep(1);                                       /* stands in for epoll_wait */
  }
  sd_notify(0, "STOPPING=1"); puts("stopped cleanly"); return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "Unit files go in /etc/systemd/system; run systemctl daemon-reload after edits",
      "systemctl enable --now name starts it and enables it at boot",
      "Type=exec reports a bad ExecStart path; Type=notify waits for READY=1",
      "Restart=on-failure + RestartSec=2; crash-loop limits live in [Unit]",
      "ExecReload=/bin/kill -HUP $MAINPID and handle SIGHUP in the program",
      "journalctl -u name -f -p warning follows warnings and worse",
      "systemd-analyze security name rates exposure from 0 (safe) to 10",
      "systemctl edit name creates a drop-in override without touching the original",
    ],
    quiz: [
      {
        q: "With Type=simple and a typo in the ExecStart path, what does systemctl start report?",
        options: ["An error that the file is missing", "It hangs until timeout", "Success, then the unit fails a moment later", "It retries forever"],
        answer: 2,
        why: "simple counts the service as started right after fork, before exec fails; Type=exec catches this.",
      },
      {
        q: "A service prints log lines with printf, but they show up in the journal late or not at all. Why?",
        options: ["stdout is fully buffered when it is not a terminal", "journald drops printf output", "The unit needs StandardOutput=tty", "printf does not work under systemd"],
        answer: 0,
        why: "C stdio uses a full buffer for pipes and sockets; use line buffering, fflush, or stderr.",
      },
      {
        q: "What happens if a service ignores SIGTERM during systemctl stop?",
        options: ["It keeps running forever", "systemd sends SIGHUP instead", "The unit is marked as reloaded", "After TimeoutStopSec (90 s by default) it receives SIGKILL"],
        answer: 3,
        why: "systemd escalates to SIGKILL once the stop timeout expires.",
      },
      {
        q: "Your service runs with ProtectSystem=strict and fails to write /var/lib/chatd/db. What is the cleanest fix?",
        options: ["Remove ProtectSystem", "Add StateDirectory=chatd", "Run as root", "Set PrivateTmp=no"],
        answer: 1,
        why: "StateDirectory creates /var/lib/chatd with the right owner and makes only that path writable.",
      },
      {
        q: "What does sd_notify return when the program is started from a shell, not by systemd?",
        options: ["0, because NOTIFY_SOCKET is not set", "-1 with errno ENOENT", "It crashes", "1, as if systemd received it"],
        answer: 0,
        why: "Without NOTIFY_SOCKET there is nobody to notify, so sd_notify just returns 0.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a unit for a shell loop that prints the date every 5 seconds, start it, and follow its log with journalctl.",
        hint: "ExecStart=/bin/sh -c 'while true; do date; sleep 5; done'",
        solution: String.raw`sudo tee /etc/systemd/system/ticker.service <<'EOF'
[Service]
ExecStart=/bin/sh -c 'while true; do date; sleep 5; done'
EOF
sudo systemctl daemon-reload
sudo systemctl start ticker
journalctl -u ticker -f          # a new date line every 5 seconds
sudo systemctl stop ticker`,
      },
      {
        level: "medium",
        task: "Make a service restart on failure, then kill its main process with SIGKILL and watch systemd restart it. Find the restart in the journal and the NRestarts counter.",
        hint: "Restart=on-failure and RestartSec=3. systemctl show prints properties like MainPID and NRestarts.",
        solution: String.raw`# add to [Service]: Restart=on-failure  RestartSec=3
sudo systemctl daemon-reload && sudo systemctl restart ticker
PID=$(systemctl show -p MainPID --value ticker)
sudo kill -9 "$PID"
sleep 4; systemctl status ticker --no-pager | head -5   # new PID, active again
systemctl show -p NRestarts ticker                      # NRestarts=1
journalctl -u ticker -n 5 | grep -i "restart"`,
      },
      {
        level: "hard",
        task: "Harden a unit for your capstone server: get systemd-analyze security below 3.0 while the service still works. Record which options you added and which ones broke it.",
        hint: "Start from DynamicUser, ProtectSystem=strict, ProtectHome, PrivateTmp, NoNewPrivileges, then add RestrictAddressFamilies, SystemCallFilter, PrivateDevices, ProtectKernelTunables, ProtectControlGroups, LockPersonality, MemoryDenyWriteExecute and an empty CapabilityBoundingSet.",
        solution: String.raw`sudo systemctl edit --full chatd     # add options a few at a time
systemd-analyze security chatd | tail -1     # e.g. Overall exposure level: 2.1 OK
sudo systemctl restart chatd && nc localhost 7000    # still works?
journalctl -u chatd -b | grep -iE "denied|seccomp|EPERM"
# if a syscall is blocked: SystemCallErrorNumber=EPERM shows errors instead of kills,
# then allow the missing group, e.g. SystemCallFilter=@system-service @network-io`,
      },
    ],
    faq: [
      { q: "Where do I put my unit file?", a: "Your own units go in /etc/systemd/system/. Packages install theirs in /usr/lib/systemd/system/ (or /lib/systemd/system/), and you override those with systemctl edit instead of editing them." },
      { q: "What is the difference between restart and reload?", a: "restart stops the process and starts a new one, dropping connections. reload runs ExecReload, usually sending SIGHUP, so the running process re-reads its config and keeps its connections." },
      { q: "Can a normal user run services?", a: "Yes. Put units in ~/.config/systemd/user/ and use systemctl --user. Run loginctl enable-linger USER if they should keep running after logout." },
      { q: "How do I pass environment variables or secrets?", a: "Environment=KEY=value or EnvironmentFile=/etc/chatd/env set variables. For secrets, LoadCredential= is better, because it exposes the file only to that service under $CREDENTIALS_DIRECTORY." },
    ],
  },
};

export default extra;
