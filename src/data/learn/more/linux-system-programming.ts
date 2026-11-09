import type { LearningPath } from "../types";

const L = (label: string, url: string) => ({ label, url });

const path: LearningPath = {
  slug: "linux-system-programming",
  title: "Linux System Programming",
  tagline: "Write C that talks directly to the Linux kernel.",
  description:
    "Learn how Linux really works by programming against it in C. Starting from pointers and the build toolchain, you work through system calls, file I/O, processes, signals, IPC, threads, virtual memory and sockets, then finish by building a mini shell and a concurrent TCP chat server that runs as a systemd service.",
  level: "Intermediate → Advanced",
  category: "Foundations",
  icon: "cpu",
  outcomes: [
    "Write, build and debug memory-safe C programs with gcc, make, gdb and valgrind",
    "Explain the user/kernel boundary and trace any program's system calls with strace",
    "Manage files, processes, signals and IPC directly through POSIX and Linux APIs",
    "Write correct multithreaded code with mutexes and condition variables and diagnose deadlocks",
    "Build scalable TCP/UDP servers with non-blocking I/O and epoll",
    "Ship a long-running program as a well-behaved systemd service",
  ],
  tools: ["C (C11/C17)", "gcc", "make", "gdb", "valgrind", "AddressSanitizer", "strace", "ltrace", "man pages", "netcat", "perf", "systemd"],
  modules: [
    {
      key: "lsp-c-foundations",
      title: "C for systems programming",
      summary: "The C you need to read and write real Linux code.",
      links: [L("GNU C Library manual", "https://www.gnu.org/software/libc/manual/"), L("GCC documentation", "https://gcc.gnu.org/onlinedocs/")],
      topics: [
        { key: "c-pointers-memory", title: "Pointers, arrays & memory layout", hours: 5, goal: "Use pointers, pointer arithmetic and dynamic allocation without leaks or invalid accesses.", subtopics: ["Declare and dereference pointers", "Relate arrays and pointer arithmetic", "Allocate and free heap memory", "Distinguish stack, heap and static data", "Pass pointers to modify caller data"] },
        { key: "c-structs-strings", title: "Structs, strings & bit manipulation", hours: 4, goal: "Model data with structs and handle C strings and bit flags safely.", subtopics: ["Define structs and use typedef", "Handle null-terminated strings safely", "Use bitwise operators for flags", "Understand padding and alignment"] },
        { key: "c-build-tools", title: "Building with gcc, make & libraries", hours: 4, goal: "Compile multi-file projects with warnings on and a Makefile, and link static or shared libraries.", subtopics: ["Follow preprocess, compile, assemble, link stages", "Enable -Wall -Wextra and fix warnings", "Write a Makefile with pattern rules", "Build static and shared libraries", "Inspect binaries with nm and ldd"], links: [L("GNU make manual", "https://www.gnu.org/software/make/manual/")] },
        { key: "c-debugging", title: "Debugging with gdb, valgrind & sanitizers", hours: 4, goal: "Find crashes, leaks and memory errors with gdb, valgrind and AddressSanitizer.", subtopics: ["Set breakpoints and step in gdb", "Inspect a core dump backtrace", "Find leaks with valgrind memcheck", "Catch overflows with -fsanitize=address"], links: [L("GDB documentation", "https://sourceware.org/gdb/documentation/"), L("Valgrind quick start", "https://valgrind.org/docs/manual/quick-start.html")] },
      ],
    },
    {
      key: "lsp-kernel-interface",
      title: "The kernel/user boundary",
      summary: "How programs ask the kernel to do work on their behalf.",
      links: [L("syscalls(2)", "https://man7.org/linux/man-pages/man2/syscalls.2.html"), L("Linux kernel documentation", "https://docs.kernel.org/")],
      topics: [
        { key: "os-architecture", title: "User space, kernel space & hardware", hours: 2.5, goal: "Explain privilege levels and why user programs cannot touch hardware directly.", subtopics: ["Describe user mode and kernel mode", "List the kernel's core subsystems", "Explain the role of glibc", "Read the Linux man page sections"] },
        { key: "system-calls", title: "System calls & error handling", hours: 3, goal: "Call system calls correctly and handle every failure using errno.", subtopics: ["Trace a syscall from wrapper to kernel", "Check return values on every call", "Report errors with errno and perror", "Handle EINTR and partial results"], links: [L("errno(3)", "https://man7.org/linux/man-pages/man3/errno.3.html")] },
        { key: "strace-tracing", title: "Tracing programs with strace & ltrace", hours: 2, goal: "Diagnose a misbehaving program by reading its system call trace.", subtopics: ["Trace a command with strace", "Filter syscalls with -e trace", "Follow child processes with -f", "Summarise syscall counts with -c", "Trace library calls with ltrace"], links: [L("strace(1)", "https://man7.org/linux/man-pages/man1/strace.1.html")] },
      ],
    },
    {
      key: "lsp-files",
      title: "Files, I/O & file systems",
      summary: "Everything is a file: descriptors, buffering, inodes and the VFS.",
      links: [L("open(2)", "https://man7.org/linux/man-pages/man2/open.2.html"), L("inode(7)", "https://man7.org/linux/man-pages/man7/inode.7.html")],
      topics: [
        { key: "fd-basics", title: "File descriptors: open, read, write, close", hours: 4, goal: "Copy files with raw system calls, handling short reads and writes.", subtopics: ["Open files with flags and modes", "Read and write in a loop", "Handle short reads and writes", "Close descriptors and avoid leaks", "Use stdin, stdout and stderr descriptors"] },
        { key: "buffered-io", title: "stdio buffering vs raw system calls", hours: 3, goal: "Choose between stdio and raw syscalls and control buffering and flushing.", subtopics: ["Compare FILE streams with descriptors", "Explain full, line and unbuffered modes", "Control buffering with setvbuf and fflush", "Measure syscall counts with strace -c"], links: [L("setvbuf(3)", "https://man7.org/linux/man-pages/man3/setvbuf.3.html")] },
        { key: "advanced-io", title: "lseek, dup2, fcntl & open flags", hours: 3, goal: "Reposition, duplicate and reconfigure descriptors to implement redirection.", subtopics: ["Seek and create sparse files with lseek", "Redirect output with dup2", "Set O_NONBLOCK and FD_CLOEXEC via fcntl", "Use O_APPEND and O_EXCL correctly", "Make durable writes with fsync"], links: [L("fcntl(2)", "https://man7.org/linux/man-pages/man2/fcntl.2.html")] },
        { key: "inodes-links", title: "Inodes, hard links & symbolic links", hours: 3, goal: "Read file metadata with stat and explain how names map to inodes.", subtopics: ["Read metadata with stat and fstat", "Create hard and symbolic links", "Explain link counts and unlink", "Compare ext4 and xfs at a high level"], links: [L("stat(2)", "https://man7.org/linux/man-pages/man2/stat.2.html")] },
        { key: "vfs-mounts", title: "The VFS, mounts, /proc & /sys", hours: 2.5, goal: "Explain how the VFS unifies different file systems and read kernel data from /proc.", subtopics: ["Describe the VFS abstraction layers", "List mounts from /proc/self/mounts", "Read process info from /proc/PID", "Explore kernel settings in /sys"], links: [L("proc(5)", "https://man7.org/linux/man-pages/man5/proc.5.html")] },
        { key: "directories-perms", title: "Directories, permissions & umask", hours: 2.5, goal: "Walk directory trees and create files with the intended permissions.", subtopics: ["Iterate directories with opendir and readdir", "Explain rwx bits on files and directories", "Apply umask to new files", "Change modes with chmod and fchmod"] },
      ],
    },
    {
      key: "lsp-processes",
      title: "Processes",
      summary: "Create, replace, wait for and organise processes.",
      links: [L("fork(2)", "https://man7.org/linux/man-pages/man2/fork.2.html"), L("execve(2)", "https://man7.org/linux/man-pages/man2/execve.2.html"), L("wait(2)", "https://man7.org/linux/man-pages/man2/wait.2.html")],
      topics: [
        { key: "process-model", title: "Process anatomy & process states", hours: 3, goal: "Describe what a process owns and how it moves between scheduler states.", subtopics: ["List what a process owns", "Read PIDs, PPIDs and credentials", "Trace running, sleeping and stopped states", "Inspect processes via /proc/PID/status"] },
        { key: "fork-exec-wait", title: "fork, exec & wait", hours: 5, goal: "Launch a child program, wait for it and decode its exit status.", subtopics: ["Create a child with fork", "Replace the image with execvp", "Reap children with waitpid", "Decode status with WIFEXITED and WEXITSTATUS", "Explain copy-on-write after fork"] },
        { key: "zombies-orphans", title: "Exit, zombies, orphans & the environment", hours: 3, goal: "Avoid zombie processes and pass configuration through the environment.", subtopics: ["Compare exit and _exit", "Create and reap a zombie", "Explain orphan adoption by init", "Read and set environment variables"] },
        { key: "sessions-groups", title: "Process groups, sessions & job control", hours: 2.5, goal: "Explain how shells manage foreground and background jobs.", subtopics: ["Explain process groups and sessions", "Set groups with setpgid and setsid", "Hand the terminal over with tcsetpgrp", "Trace Ctrl-C delivery to a job"], links: [L("credentials(7)", "https://man7.org/linux/man-pages/man7/credentials.7.html")] },
      ],
    },
    {
      key: "lsp-signals",
      title: "Signals",
      summary: "Asynchronous notifications and how to handle them safely.",
      links: [L("signal(7)", "https://man7.org/linux/man-pages/man7/signal.7.html")],
      topics: [
        { key: "signal-basics", title: "Signals & default actions", hours: 2.5, goal: "Send signals and predict each one's default action.", subtopics: ["List common signals and their numbers", "Send signals with kill and raise", "Explain terminate, core, stop and ignore", "Explain why SIGKILL cannot be caught"] },
        { key: "sigaction-handlers", title: "sigaction, masks & async-signal safety", hours: 4, goal: "Install reliable handlers with sigaction that only do async-signal-safe work.", subtopics: ["Install handlers with sigaction", "Block signals with sigprocmask", "Set a volatile sig_atomic_t flag", "Use SA_RESTART to resume syscalls", "Check the async-signal-safe function list"], links: [L("sigaction(2)", "https://man7.org/linux/man-pages/man2/sigaction.2.html"), L("signal-safety(7)", "https://man7.org/linux/man-pages/man7/signal-safety.7.html")] },
        { key: "signalfd-patterns", title: "Self-pipe trick & signalfd", hours: 2.5, goal: "Turn signals into readable events that fit into an event loop.", subtopics: ["Implement the self-pipe trick", "Block signals and create a signalfd", "Read signalfd_siginfo structs", "Handle SIGCHLD to reap children"], links: [L("signalfd(2)", "https://man7.org/linux/man-pages/man2/signalfd.2.html")] },
      ],
    },
    {
      key: "lsp-ipc",
      title: "Inter-process communication",
      summary: "Move data and coordinate between separate processes.",
      links: [L("pipe(7)", "https://man7.org/linux/man-pages/man7/pipe.7.html"), L("shm_overview(7)", "https://man7.org/linux/man-pages/man7/shm_overview.7.html")],
      topics: [
        { key: "pipes-fifos", title: "Pipes & FIFOs", hours: 4, goal: "Connect processes with pipes and named FIFOs like a shell pipeline does.", subtopics: ["Create a pipe and fork", "Close unused pipe ends", "Build a two-command pipeline with dup2", "Create a named FIFO with mkfifo", "Explain SIGPIPE and EOF behaviour"] },
        { key: "shared-memory", title: "POSIX shared memory & semaphores", hours: 4, goal: "Share a memory region between processes and synchronise access with semaphores.", subtopics: ["Create shared memory with shm_open", "Size and map it with ftruncate and mmap", "Synchronise with POSIX semaphores", "Clean up with shm_unlink"], links: [L("sem_overview(7)", "https://man7.org/linux/man-pages/man7/sem_overview.7.html")] },
        { key: "message-queues", title: "POSIX message queues", hours: 2.5, goal: "Exchange discrete, prioritised messages between processes.", subtopics: ["Open a queue with mq_open", "Send and receive with priorities", "Set queue attributes and limits", "Compare with pipes and shared memory"], links: [L("mq_overview(7)", "https://man7.org/linux/man-pages/man7/mq_overview.7.html")] },
        { key: "unix-sockets", title: "Unix domain sockets", hours: 3, goal: "Build a local client/server over a Unix socket and pick the right IPC mechanism.", subtopics: ["Create a stream socket on a path", "Accept clients and exchange data", "Compare stream and datagram modes", "Pass descriptors with SCM_RIGHTS", "Choose between pipes, sockets and shm"], links: [L("unix(7)", "https://man7.org/linux/man-pages/man7/unix.7.html")] },
      ],
    },
    {
      key: "lsp-threads",
      title: "POSIX threads & synchronization",
      summary: "Concurrency inside one process, and how to keep it correct.",
      links: [L("pthreads(7)", "https://man7.org/linux/man-pages/man7/pthreads.7.html")],
      topics: [
        { key: "pthreads-basics", title: "Creating & joining threads", hours: 3.5, goal: "Start worker threads, pass them arguments and collect their results.", subtopics: ["Create threads with pthread_create", "Pass arguments and return values", "Join or detach threads", "Compare threads with processes", "Build with -pthread"], links: [L("pthread_create(3)", "https://man7.org/linux/man-pages/man3/pthread_create.3.html")] },
        { key: "mutexes", title: "Race conditions & mutexes", hours: 4, goal: "Find a data race and fix it with a correctly scoped mutex.", subtopics: ["Reproduce a lost-update race", "Protect shared data with a mutex", "Keep critical sections short", "Detect races with ThreadSanitizer"] },
        { key: "condition-variables", title: "Condition variables & producer-consumer", hours: 4, goal: "Build a bounded blocking queue with a mutex and condition variables.", subtopics: ["Wait on a condition in a while loop", "Signal and broadcast waiting threads", "Build a bounded producer-consumer queue", "Explain spurious wakeups"] },
        { key: "deadlocks", title: "Deadlocks, rwlocks & atomics", hours: 3.5, goal: "Prevent deadlocks with lock ordering and choose rwlocks or atomics when they fit.", subtopics: ["Name the four deadlock conditions", "Prevent deadlock with lock ordering", "Debug a hung program with gdb thread apply", "Use read-write locks for read-heavy data", "Use C11 atomics for simple counters"] },
      ],
    },
    {
      key: "lsp-memory",
      title: "Memory management",
      summary: "Virtual memory, mapping files and what malloc actually does.",
      links: [L("mmap(2)", "https://man7.org/linux/man-pages/man2/mmap.2.html"), L("Kernel memory management docs", "https://docs.kernel.org/admin-guide/mm/index.html")],
      topics: [
        { key: "virtual-memory", title: "Virtual memory, paging & address space", hours: 4, goal: "Explain how virtual addresses map to physical pages and read a process memory map.", subtopics: ["Explain pages, page tables and the TLB", "Read a memory map in /proc/PID/maps", "Describe page faults and demand paging", "Explain overcommit and the OOM killer"] },
        { key: "mmap", title: "mmap & memory-mapped files", hours: 3.5, goal: "Map files and anonymous memory and choose shared or private mappings.", subtopics: ["Map a file read-only and scan it", "Compare MAP_SHARED and MAP_PRIVATE", "Allocate anonymous memory with mmap", "Change protections with mprotect", "Flush changes with msync"] },
        { key: "malloc-internals", title: "malloc internals & a simple allocator", hours: 5, goal: "Explain how malloc obtains and recycles memory and write a basic allocator.", subtopics: ["Explain brk, sbrk and mmap for allocation", "Describe chunks, headers and free lists", "Explain fragmentation and arenas", "Write a first-fit allocator", "Test it with LD_PRELOAD"], links: [L("malloc(3)", "https://man7.org/linux/man-pages/man3/malloc.3.html")] },
      ],
    },
    {
      key: "lsp-networking",
      title: "Network sockets",
      summary: "TCP and UDP programming, from one client to thousands.",
      links: [L("Beej's Guide to Network Programming", "https://beej.us/guide/bgnet/"), L("socket(7)", "https://man7.org/linux/man-pages/man7/socket.7.html")],
      topics: [
        { key: "socket-basics", title: "Sockets API, addresses & byte order", hours: 3.5, goal: "Resolve hosts with getaddrinfo and convert addresses and byte order correctly.", subtopics: ["Describe the socket, bind, listen, accept calls", "Resolve names with getaddrinfo", "Convert byte order with htons and ntohs", "Support IPv4 and IPv6 together"], links: [L("getaddrinfo(3)", "https://man7.org/linux/man-pages/man3/getaddrinfo.3.html")] },
        { key: "tcp-server", title: "TCP clients & servers", hours: 5, goal: "Write a TCP echo server and client that handle framing and disconnects.", subtopics: ["Explain the TCP three-way handshake", "Write an iterative echo server", "Set SO_REUSEADDR before bind", "Frame messages on a byte stream", "Handle disconnects and EPIPE"], links: [L("tcp(7)", "https://man7.org/linux/man-pages/man7/tcp.7.html")] },
        { key: "udp", title: "UDP sockets", hours: 2.5, goal: "Send and receive datagrams and handle loss and reordering.", subtopics: ["Send with sendto and receive with recvfrom", "Explain datagram boundaries and size limits", "Handle loss with timeouts and retries", "Compare UDP and TCP trade-offs"], links: [L("udp(7)", "https://man7.org/linux/man-pages/man7/udp.7.html")] },
        { key: "io-multiplexing", title: "select, poll & epoll", hours: 5, goal: "Serve many clients from one thread by multiplexing descriptors with epoll.", subtopics: ["Watch descriptors with select", "Scale further with poll", "Register interest with epoll_ctl", "Compare level- and edge-triggered modes", "Benchmark the three approaches"], links: [L("epoll(7)", "https://man7.org/linux/man-pages/man7/epoll.7.html"), L("poll(2)", "https://man7.org/linux/man-pages/man2/poll.2.html")] },
        { key: "event-loops", title: "Non-blocking I/O & event loops", hours: 3.5, goal: "Structure a server as a non-blocking event loop with per-connection buffers.", subtopics: ["Set sockets to O_NONBLOCK", "Handle EAGAIN on read and write", "Keep per-connection read and write buffers", "Compare thread-per-connection with event loops"] },
      ],
    },
    {
      key: "lsp-time-daemons",
      title: "Time, timers & daemons",
      summary: "Measure time, schedule work and run as a background service.",
      links: [L("time(7)", "https://man7.org/linux/man-pages/man7/time.7.html"), L("daemon(7)", "https://man7.org/linux/man-pages/man7/daemon.7.html"), L("systemd", "https://systemd.io/")],
      topics: [
        { key: "time-timers", title: "Clocks, sleeping & timers", hours: 3.5, goal: "Measure elapsed time with the right clock and drive periodic work with timerfd.", subtopics: ["Compare CLOCK_REALTIME and CLOCK_MONOTONIC", "Measure durations with clock_gettime", "Sleep precisely with nanosleep", "Create periodic timers with timerfd", "Add timeouts to poll and epoll"], links: [L("timerfd_create(2)", "https://man7.org/linux/man-pages/man2/timerfd_create.2.html")] },
        { key: "daemons", title: "Classic daemonization", hours: 2.5, goal: "Explain each step of the traditional double-fork daemon recipe.", subtopics: ["Fork and call setsid", "Fork again and change directory", "Reset umask and close descriptors", "Write a PID file and log to syslog"] },
        { key: "systemd-services", title: "Running programs as systemd services", hours: 3, goal: "Ship a foreground program as a systemd service with logging, restarts and sandboxing.", subtopics: ["Write a simple service unit file", "Log to stdout for journald", "Configure Restart and reload on SIGHUP", "Add sandboxing like ProtectSystem", "Notify readiness with sd_notify"], links: [L("systemd.service(5)", "https://man7.org/linux/man-pages/man5/systemd.service.5.html")] },
      ],
    },
    {
      key: "lsp-capstone",
      title: "Capstone projects",
      summary: "Put every module together in two real programs.",
      links: [L("Beej's Guide to Network Programming", "https://beej.us/guide/bgnet/"), L("roadmap.sh Linux", "https://roadmap.sh/linux")],
      topics: [
        { key: "mini-shell", title: "Build a mini shell", hours: 8, goal: "Build a shell that runs commands with pipes, redirection, built-ins and background jobs.", subtopics: ["Parse a command line into tokens", "Run commands with fork and execvp", "Add < > redirection and pipes", "Implement cd and exit built-ins", "Run background jobs and reap with SIGCHLD"] },
        { key: "chat-server", title: "Build a concurrent TCP chat server", hours: 10, goal: "Build a chat server that broadcasts messages to many clients using epoll or a thread pool.", subtopics: ["Design a line-based chat protocol", "Accept clients with an epoll event loop", "Broadcast messages to all clients", "Handle slow clients and disconnects", "Load test with many netcat clients"] },
        { key: "capstone-polish", title: "Test, profile & ship as a service", hours: 3, goal: "Prove the capstone is leak-free and race-free, then run it under systemd.", subtopics: ["Run valgrind and sanitizers clean", "Profile hot paths with perf", "Write a systemd unit for the server", "Document build and usage in a README"] },
      ],
    },
  ],
};

export default path;
