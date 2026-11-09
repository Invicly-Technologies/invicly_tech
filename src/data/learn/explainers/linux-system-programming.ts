import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── C for systems programming ─────────────
  "lsp-c-foundations/c-pointers-memory": {
    summary:
      "A pointer is a variable that holds a memory address, and nearly every Linux API passes data through pointers to buffers and structs. C gives you manual control over where data lives: on the stack, on the heap with malloc, or in static storage. Understanding this layout is the foundation for every bug you will debug later.",
    analogy: "A pointer is a house address written on paper; copying the paper does not copy the house.",
    visuals: [
      {
        type: "layers",
        title: "Typical process memory layout (high to low addresses)",
        layers: [
          { label: "Stack", detail: "Local variables and return addresses; grows down." },
          { label: "Memory mappings", detail: "Shared libraries and mmap regions." },
          { label: "Heap", detail: "malloc and free; grows up." },
          { label: "BSS", detail: "Globals and statics initialised to zero." },
          { label: "Data", detail: "Globals and statics with initial values." },
          { label: "Text", detail: "Read-only machine code." },
        ],
      },
    ],
    keyPoints: [
      "p holds an address; *p reads or writes the value stored at that address.",
      "An array name decays to a pointer to its first element, so a[i] equals *(a + i).",
      "Pointer arithmetic moves in units of the pointed-to type, not bytes.",
      "Every malloc needs exactly one matching free, and a pointer to a local variable is invalid after the function returns.",
    ],
    terms: [
      { term: "Pointer", meaning: "Variable that stores the address of another object." },
      { term: "Dereference", meaning: "Access the object a pointer points to with *p or p->field." },
      { term: "NULL", meaning: "Special pointer value meaning points to nothing." },
      { term: "Heap", meaning: "Memory managed manually with malloc and free." },
      { term: "Stack", meaning: "Automatic memory for function locals, freed on return." },
      { term: "Dangling pointer", meaning: "Pointer to memory that has been freed or gone out of scope." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n#include <stdlib.h>\nvoid fill(int *a, size_t n) {\n  for (size_t i = 0; i < n; i++) a[i] = (int)(i * i);\n}\n\nint main(void) {\n  size_t n = 5;\n  int *a = malloc(n * sizeof *a);\n  if (!a) { perror(\"malloc\"); return 1; }\n  fill(a, n);\n  printf(\"a[3] = %d\\n\", a[3]);\n  free(a);\n  return 0;\n}",
      caption: "Allocate an array on the heap, fill it through a pointer, then free it.",
    },
    pitfalls: [
      "Using memory after free or freeing it twice.",
      "Forgetting sizeof when computing allocation sizes.",
    ],
    check: [
      { q: "What does a[i] mean in terms of pointers?", a: "*(a + i): the value i elements past the start of the array." },
      { q: "Where does a local variable in a function live?", a: "On the stack; it becomes invalid once the function returns." },
    ],
  },

  "lsp-c-foundations/c-structs-strings": {
    summary:
      "Structs group related fields, and Linux APIs use them everywhere, from struct stat to struct sockaddr_in. C strings are just char arrays ending in a zero byte, so length and buffer size must be tracked by hand. Bit flags packed into integers are how system calls accept options like O_CREAT | O_TRUNC.",
    visuals: [
      {
        type: "compare",
        title: "Ways to shape data in C",
        columns: [
          { title: "struct", points: ["Fields laid out in declaration order", "Size includes alignment padding", "Access with . or ->", "Used by stat, sockaddr, timespec"] },
          { title: "union", points: ["All members share the same memory", "Size of the largest member", "Only one member valid at a time", "Used in epoll_data and sigval"] },
          { title: "Bit flags", points: ["Options packed into one integer", "Combine with |", "Test with &", "Used by open flags and mode bits"] },
        ],
      },
    ],
    keyPoints: [
      "p->field is shorthand for (*p).field.",
      "A C string needs one extra byte for the terminating NUL.",
      "Prefer snprintf and explicit lengths over strcpy and strcat.",
      "The compiler inserts padding so fields stay aligned; sizeof shows the real size.",
    ],
    terms: [
      { term: "struct", meaning: "Composite type grouping named fields." },
      { term: "typedef", meaning: "Gives an existing type a new name." },
      { term: "NUL terminator", meaning: "Zero byte that marks the end of a C string." },
      { term: "Padding", meaning: "Unused bytes inserted to align fields." },
      { term: "Bitmask", meaning: "Integer whose individual bits represent options." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n\n#define F_READ  (1u << 0)\n#define F_WRITE (1u << 1)\n\nstruct user { char name[16]; unsigned flags; };\n\nint main(void) {\n  struct user u = { .flags = F_READ | F_WRITE };\n  snprintf(u.name, sizeof u.name, \"%s\", \"alice\");\n  if (u.flags & F_WRITE) printf(\"%s can write\\n\", u.name);\n  printf(\"sizeof(struct user) = %zu\\n\", sizeof u);\n  return 0;\n}",
      caption: "Bit flags, a struct and bounded string formatting.",
    },
    pitfalls: [
      "strncpy does not always NUL-terminate the destination.",
      "Assuming the size of a struct equals the sum of its fields.",
    ],
    check: [
      { q: "Why is a 5-letter string stored in 6 bytes?", a: "One extra byte holds the terminating NUL." },
      { q: "How do you test whether a flag bit is set?", a: "AND the value with the mask, for example if (flags & F_WRITE)." },
    ],
  },

  "lsp-c-foundations/c-build-tools": {
    summary:
      "gcc turns C source into an executable in four stages: preprocessing, compiling, assembling and linking. make rebuilds only what changed, based on file timestamps and dependency rules. Knowing how linking works explains errors like undefined reference and why shared libraries must be found at run time.",
    visuals: [
      {
        type: "flow",
        title: "From source to running program",
        steps: [
          { label: "Preprocess", detail: "Expand #include and macros (gcc -E)." },
          { label: "Compile", detail: "Translate C to assembly (gcc -S)." },
          { label: "Assemble", detail: "Turn assembly into an object file (gcc -c)." },
          { label: "Link", detail: "Join objects and libraries into an ELF executable." },
          { label: "Load", detail: "The dynamic loader maps shared libraries at run time." },
        ],
      },
    ],
    keyPoints: [
      "Always compile with -Wall -Wextra and treat warnings as bugs.",
      "Use -g for debug info and -O2 for optimised release builds.",
      "Static libraries (.a) are copied into the binary; shared libraries (.so) are loaded at run time.",
      "Makefile recipe lines must start with a tab character.",
    ],
    terms: [
      { term: "Object file", meaning: "Compiled machine code (.o) not yet linked." },
      { term: "Linker", meaning: "Resolves symbols and combines objects into an executable." },
      { term: "ELF", meaning: "Executable and Linkable Format used by Linux binaries." },
      { term: "Shared library", meaning: ".so file loaded and shared by many programs at run time." },
      { term: "Make target", meaning: "File or action a Makefile rule knows how to build." },
      { term: "ldd", meaning: "Lists the shared libraries a binary needs." },
    ],
    example: {
      lang: "makefile",
      code: "CC = gcc\nCFLAGS = -Wall -Wextra -g -O2\nOBJS = main.o util.o\n\napp: $(OBJS)\n\t$(CC) $(CFLAGS) -o $@ $^\n\n%.o: %.c util.h\n\t$(CC) $(CFLAGS) -c $<\n\nclean:\n\trm -f app $(OBJS)",
      caption: "A minimal Makefile: $@ is the target, $^ all prerequisites, $< the first one.",
    },
    pitfalls: [
      "Putting -l libraries before the objects that need them on the link line.",
      "Using spaces instead of a tab in Makefile recipes.",
    ],
    check: [
      { q: "Which stage reports undefined reference errors?", a: "The link stage, when a symbol has no definition in any object or library." },
      { q: "What do $@ and $^ mean in make?", a: "The target name and the list of all prerequisites." },
    ],
  },

  "lsp-c-foundations/c-debugging": {
    summary:
      "C has no runtime checks, so memory errors often corrupt data silently or crash far from the real bug. gdb lets you stop a program and inspect its state, valgrind memcheck detects leaks and invalid accesses, and AddressSanitizer compiles checks directly into your binary. Using them routinely turns hours of guessing into minutes.",
    visuals: [
      {
        type: "compare",
        title: "Which tool when",
        columns: [
          { title: "gdb", points: ["Breakpoints, stepping, watchpoints", "Backtraces from crashes and core dumps", "Inspect variables and memory", "Needs only a -g build"] },
          { title: "valgrind memcheck", points: ["Leaks, invalid reads and writes", "Use of uninitialised values", "Runs the unmodified binary", "Roughly 10 to 50 times slower"] },
          { title: "AddressSanitizer", points: ["Build with -fsanitize=address -g", "Overflows, use-after-free, leaks", "About 2 times slower", "Ideal for tests and CI"] },
        ],
      },
    ],
    keyPoints: [
      "Build debug binaries with -g -O0 so gdb maps machine code to source lines.",
      "bt in gdb shows the call stack at the moment of a crash.",
      "Enable core dumps with ulimit -c unlimited to debug crashes after the fact.",
      "Run valgrind --leak-check=full and fix definitely lost blocks first.",
    ],
    terms: [
      { term: "Breakpoint", meaning: "Location where the debugger pauses execution." },
      { term: "Backtrace", meaning: "List of active function calls leading to the current point." },
      { term: "Core dump", meaning: "File with a crashed process's memory for later debugging." },
      { term: "Watchpoint", meaning: "Pauses when a given variable or address changes." },
      { term: "Memory leak", meaning: "Allocated memory that is never freed." },
      { term: "Sanitizer", meaning: "Compiler instrumentation that detects bugs at run time." },
    ],
    example: {
      lang: "bash",
      code: "gcc -g -O0 -o app app.c\ngdb --args ./app input.txt\n(gdb) break parse_line\n(gdb) run\n(gdb) bt\n(gdb) print *req\nvalgrind --leak-check=full ./app input.txt\ngcc -g -fsanitize=address,undefined -o app app.c && ./app input.txt",
      caption: "Step through with gdb, then hunt leaks with valgrind and overflows with ASan.",
    },
    pitfalls: [
      "Debugging an -O2 build where variables show as optimized out.",
      "Running valgrind on an ASan-instrumented binary; use one or the other.",
    ],
    check: [
      { q: "Which gdb command shows how the program reached the current line?", a: "bt (backtrace)." },
      { q: "What flag enables AddressSanitizer?", a: "-fsanitize=address, ideally together with -g." },
    ],
  },

  // ───────────── The kernel/user boundary ─────────────
  "lsp-kernel-interface/os-architecture": {
    summary:
      "The CPU runs user programs in an unprivileged mode and the kernel in a privileged mode. Only the kernel can touch hardware, manage memory mappings or schedule processes, so user programs must ask it through system calls. The C library (glibc) wraps those calls in ordinary functions like open and read.",
    analogy: "The kernel is a bank teller behind glass: you hand over a request slip and it handles the vault.",
    visuals: [
      {
        type: "layers",
        title: "Linux system layers",
        layers: [
          { label: "Applications", detail: "bash, nginx, your C program." },
          { label: "C library (glibc)", detail: "printf, malloc and the system call wrappers." },
          { label: "System call interface", detail: "The only door into the kernel." },
          { label: "Kernel subsystems", detail: "Scheduler, memory manager, VFS, network stack." },
          { label: "Device drivers", detail: "Talk to disks, NICs and other devices." },
          { label: "Hardware", detail: "CPU, RAM, storage, network." },
        ],
      },
    ],
    keyPoints: [
      "User mode cannot execute privileged instructions; trying traps into the kernel.",
      "Man section 2 documents system calls, section 3 library functions.",
      "A crash in user space kills one process; a kernel bug can crash the whole machine.",
      "Some library functions such as printf use system calls internally; others such as strlen never do.",
    ],
    terms: [
      { term: "Kernel mode", meaning: "Privileged CPU mode with full hardware access." },
      { term: "User mode", meaning: "Restricted CPU mode where applications run." },
      { term: "glibc", meaning: "GNU C library providing the standard C and POSIX APIs." },
      { term: "Man section", meaning: "Numbered part of the manual, such as 2 for syscalls." },
      { term: "Kernel subsystem", meaning: "Major kernel component such as the scheduler or VFS." },
    ],
    example: {
      lang: "bash",
      code: "man 2 write      # system call\nman 3 printf     # C library function\nman 7 signal     # overview page\nuname -r         # running kernel version\nldd /bin/ls      # shared libraries, including libc",
      caption: "Find documentation for each layer.",
    },
    check: [
      { q: "Which man section documents system calls?", a: "Section 2." },
      { q: "Why can a user program not program a disk controller directly?", a: "Hardware access requires kernel mode, so the program must ask the kernel via system calls." },
    ],
  },

  "lsp-kernel-interface/system-calls": {
    summary:
      "A system call switches the CPU from user mode into the kernel, runs a kernel function and returns a result. Most calls return -1 on failure and set the thread-local errno to explain why. Robust programs check every return value and handle cases like EINTR and short reads.",
    visuals: [
      {
        type: "sequence",
        title: "What happens during read()",
        actors: ["Program", "glibc", "Kernel"],
        messages: [
          { from: 0, to: 1, label: "read(fd, buf, n)" },
          { from: 1, to: 2, label: "syscall instruction, number and args in registers" },
          { from: 2, to: 1, label: "bytes read, or a negative error code" },
          { from: 1, to: 0, label: "return n, or -1 with errno set" },
        ],
      },
    ],
    keyPoints: [
      "Check every return value; -1 means failure for most calls.",
      "errno is only meaningful right after a call has failed.",
      "EINTR means a signal interrupted the call; usually you retry it.",
      "System calls cost far more than function calls, so batch work where possible.",
    ],
    terms: [
      { term: "errno", meaning: "Thread-local integer holding the last error code." },
      { term: "perror", meaning: "Prints a message followed by the text for errno." },
      { term: "strerror", meaning: "Returns the text description of an error number." },
      { term: "EINTR", meaning: "Error: call interrupted by a signal handler." },
      { term: "Syscall number", meaning: "Index the kernel uses to pick the requested function." },
      { term: "vDSO", meaning: "Kernel-provided library that makes calls like clock_gettime fast without entering the kernel." },
    ],
    example: {
      lang: "c",
      code: "#include <errno.h>\n#include <fcntl.h>\n#include <stdio.h>\n#include <string.h>\n#include <unistd.h>\n\nint main(void) {\n  int fd = open(\"/etc/shadow\", O_RDONLY);\n  if (fd == -1) {\n    fprintf(stderr, \"open: %s (errno %d)\\n\", strerror(errno), errno);\n    return 1;\n  }\n  close(fd);\n  return 0;\n}",
      caption: "As a normal user this prints: open: Permission denied (errno 13).",
    },
    pitfalls: [
      "Reading errno after a successful call and trusting its value.",
      "Calling another function such as printf before saving errno.",
    ],
    check: [
      { q: "What does open return on failure?", a: "-1, with errno set to the reason." },
      { q: "What should you usually do when a call fails with EINTR?", a: "Retry the call." },
    ],
  },

  "lsp-kernel-interface/strace-tracing": {
    summary:
      "strace uses the ptrace facility to show every system call a program makes, with arguments and return values. Because all interaction with files, the network and other processes goes through syscalls, strace answers questions like which config file was opened or why a connect failed, even without source code. ltrace does the same for shared-library calls.",
    visuals: [
      {
        type: "flow",
        title: "Debugging with strace",
        steps: [
          { label: "Reproduce", detail: "Run the failing command under strace." },
          { label: "Filter", detail: "-e trace=openat,connect narrows the noise." },
          { label: "Follow", detail: "-f follows children; -p attaches to a running PID." },
          { label: "Find the failure", detail: "Look for = -1 ENOENT, EACCES or ECONNREFUSED." },
          { label: "Fix", detail: "Create the missing file, fix the permission or the path." },
        ],
      },
    ],
    keyPoints: [
      "Each line shows call(arguments) = return value, plus the errno name on failure.",
      "-f is essential for shells and servers that fork.",
      "-c prints a summary table of call counts and time spent.",
      "strace slows the target heavily, so be careful on busy production processes.",
    ],
    terms: [
      { term: "ptrace", meaning: "Kernel interface that lets one process observe and control another." },
      { term: "strace", meaning: "Tool that prints system calls and signals." },
      { term: "ltrace", meaning: "Tool that prints dynamic library calls." },
      { term: "-e trace=", meaning: "strace option selecting which calls to show." },
      { term: "-f", meaning: "strace option to trace forked children too." },
    ],
    example: {
      lang: "bash",
      code: "strace -e trace=openat,read cat /etc/hostname\nstrace -f -o trace.log ./server\nstrace -c ls > /dev/null\nsudo strace -p 1234 -e trace=network\ngrep -E \"= -1 E\" trace.log | head",
      caption: "Trace a command, a forking server, a summary and a live process.",
    },
    pitfalls: [
      "Forgetting -f and missing the child process that actually fails.",
      "Leaving strace attached to a production process and slowing it down.",
    ],
    check: [
      { q: "Which flag makes strace follow child processes?", a: "-f." },
      { q: "How do you spot a failing call in strace output?", a: "It returns -1 followed by an errno name such as ENOENT." },
    ],
  },

  // ───────────── Files, I/O & file systems ─────────────
  "lsp-files/fd-basics": {
    summary:
      "A file descriptor is a small integer that refers to an open file, pipe, socket or device in the kernel. open returns one, read and write move bytes through it, and close releases it. Because the same calls work for every kind of descriptor, this is the core of the everything-is-a-file design.",
    visuals: [
      {
        type: "layers",
        title: "From descriptor to data",
        layers: [
          { label: "fd number (per process)", detail: "Index into the process descriptor table, such as 3." },
          { label: "Open file description", detail: "Kernel object holding the offset, flags and access mode." },
          { label: "Inode (via the VFS)", detail: "File metadata and where its data blocks live." },
          { label: "File system and block device", detail: "Where the bytes are actually stored." },
        ],
      },
    ],
    keyPoints: [
      "0, 1 and 2 are stdin, stdout and stderr; open returns the lowest free number.",
      "read returns 0 at end of file and may return fewer bytes than requested.",
      "write may also be partial on pipes and sockets, so loop until everything is written.",
      "Unclosed descriptors leak and eventually hit the RLIMIT_NOFILE limit.",
    ],
    terms: [
      { term: "File descriptor", meaning: "Small integer handle to an open kernel object." },
      { term: "Open file description", meaning: "Kernel record with offset and flags, shared after fork or dup." },
      { term: "File offset", meaning: "Position where the next read or write happens." },
      { term: "O_CREAT", meaning: "open flag that creates the file if it does not exist." },
      { term: "Short read", meaning: "read returning fewer bytes than requested." },
      { term: "EOF", meaning: "End of file, signalled by read returning 0." },
    ],
    example: {
      lang: "c",
      code: "#include <fcntl.h>\n#include <unistd.h>\n\nint main(int argc, char **argv) {\n  if (argc != 3) return 2;\n  int in = open(argv[1], O_RDONLY);\n  int out = open(argv[2], O_WRONLY | O_CREAT | O_TRUNC, 0644);\n  if (in < 0 || out < 0) return 1;\n  char buf[4096];\n  ssize_t n;\n  while ((n = read(in, buf, sizeof buf)) > 0)\n    for (ssize_t off = 0; off < n; ) { ssize_t w = write(out, buf + off, n - off); if (w < 0) return 1; off += w; }\n  close(in); close(out);\n  return n < 0;\n}",
      caption: "A minimal cp that handles short writes.",
    },
    pitfalls: [
      "Assuming one read returns the whole file.",
      "Forgetting the mode argument when using O_CREAT.",
    ],
    check: [
      { q: "What does read return at end of file?", a: "0." },
      { q: "Which descriptor number does open return?", a: "The lowest unused one, usually 3 in a fresh program." },
    ],
  },

  "lsp-files/buffered-io": {
    summary:
      "stdio functions like printf and fgets keep a user-space buffer and only call write or read when it fills or is flushed. This cuts the number of expensive system calls dramatically. The trade-off is that buffered data can appear late, out of order with raw writes, or be lost if the process crashes or calls _exit.",
    visuals: [
      {
        type: "sequence",
        title: "printf through the stdio buffer",
        actors: ["Program", "stdio buffer", "Kernel"],
        messages: [
          { from: 0, to: 1, label: "printf(...) called 1000 times" },
          { from: 1, to: 2, label: "write(1, buf, 4096) only when the buffer fills" },
          { from: 0, to: 1, label: "fflush(stdout) or exit()" },
          { from: 1, to: 2, label: "write(1, buf, remaining bytes)" },
        ],
      },
    ],
    keyPoints: [
      "stdout is line buffered on a terminal and fully buffered when redirected to a file or pipe.",
      "stderr is unbuffered so error messages appear immediately.",
      "fflush forces buffered data out; exit flushes but _exit does not.",
      "Do not mix stdio and raw write on the same descriptor without flushing.",
    ],
    terms: [
      { term: "FILE stream", meaning: "stdio object wrapping a descriptor with a buffer." },
      { term: "Full buffering", meaning: "Flush only when the buffer is full." },
      { term: "Line buffering", meaning: "Flush at each newline." },
      { term: "Unbuffered", meaning: "Every call goes straight to write." },
      { term: "fflush", meaning: "Writes out a stream's buffered data now." },
      { term: "setvbuf", meaning: "Chooses a stream's buffering mode and buffer." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n#include <unistd.h>\n\nint main(void) {\n  printf(\"hello \");          // waits in the stdio buffer\n  write(1, \"world\\n\", 6);    // goes straight to the kernel\n  fflush(stdout);\n  return 0;\n}\n// ./a.out | cat  prints: world, then hello",
      caption: "Run it with and without a pipe to see buffering change the order.",
    },
    pitfalls: [
      "Calling fork with unflushed stdout, so the child prints the buffered text again.",
      "Expecting printf output to appear before a crash.",
    ],
    check: [
      { q: "Why can output order change when stdout is piped?", a: "stdout switches from line buffering to full buffering." },
      { q: "Which exit function skips flushing stdio buffers?", a: "_exit." },
    ],
  },

  "lsp-files/advanced-io": {
    summary:
      "Beyond read and write, a few calls give you full control over descriptors. lseek moves the file offset, dup2 makes one descriptor number refer to another open file, which is exactly how shells redirect output, and fcntl reads or changes descriptor flags such as O_NONBLOCK and FD_CLOEXEC.",
    visuals: [
      {
        type: "flow",
        title: "How a shell runs cmd > out.txt",
        steps: [
          { label: "fork", detail: "Child gets a copy of the descriptor table." },
          { label: "open", detail: "Child opens out.txt and gets fd 3." },
          { label: "dup2(3, 1)", detail: "fd 1 now refers to out.txt." },
          { label: "close(3)", detail: "Drop the extra descriptor." },
          { label: "exec", detail: "The new program writes to fd 1, unaware of the redirect." },
        ],
      },
    ],
    keyPoints: [
      "lseek past the end and then write to create a sparse file with a hole.",
      "O_APPEND makes every write go atomically to the end, which is safe for shared logs.",
      "O_CREAT | O_EXCL creates a file only if it does not already exist, atomically.",
      "Open with O_CLOEXEC so descriptors do not leak into programs you exec.",
      "A successful write does not mean data is on disk; call fsync for durability.",
    ],
    terms: [
      { term: "lseek", meaning: "Sets the file offset for the next read or write." },
      { term: "dup2", meaning: "Makes a chosen fd number refer to the same open file as another." },
      { term: "fcntl", meaning: "Gets or sets descriptor and file status flags." },
      { term: "O_CLOEXEC", meaning: "Close this descriptor automatically on exec." },
      { term: "O_APPEND", meaning: "Each write goes to the current end of file." },
      { term: "fsync", meaning: "Blocks until the file's data reaches stable storage." },
    ],
    example: {
      lang: "c",
      code: "#include <fcntl.h>\n#include <stdio.h>\n#include <unistd.h>\n\nint main(void) {\n  int fd = open(\"out.txt\", O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0644);\n  if (fd < 0) { perror(\"open\"); return 1; }\n  if (dup2(fd, STDOUT_FILENO) < 0) { perror(\"dup2\"); return 1; }\n  close(fd);\n  execlp(\"ls\", \"ls\", \"-l\", (char *)NULL);\n  perror(\"execlp\");\n  return 1;\n}",
      caption: "Equivalent of ls -l > out.txt; the dup2 copy does not inherit O_CLOEXEC.",
    },
    pitfalls: [
      "Forgetting to close the original descriptor after dup2.",
      "Assuming write means the data survived a power loss.",
    ],
    check: [
      { q: "What does dup2(fd, 1) do?", a: "Closes fd 1 if open and makes it refer to the same open file as fd." },
      { q: "Why use O_CLOEXEC?", a: "So the descriptor closes automatically on exec instead of leaking into child programs." },
    ],
  },

  "lsp-files/inodes-links": {
    summary:
      "An inode stores a file's metadata and the location of its data, but not its name. Directories are tables that map names to inode numbers, so one inode can have several names, called hard links. A symbolic link is a separate small file whose content is a path to follow.",
    visuals: [
      {
        type: "tree",
        title: "One inode, several names",
        root: "inode 524301 (mode, owner, size, blocks)",
        children: [
          { label: "/home/ana/report.txt", children: ["Hard link"] },
          { label: "/home/ana/backup.txt", children: ["Hard link, link count is now 2"] },
          { label: "/tmp/latest -> /home/ana/report.txt", children: ["Symlink with its own inode", "Dangles if the target name is removed"] },
        ],
      },
      {
        type: "compare",
        title: "ext4 vs xfs",
        columns: [
          { title: "ext4", points: ["Default on Debian and Ubuntu", "Can grow and shrink", "Mature journaling and fsck", "Inode count fixed at mkfs time"] },
          { title: "xfs", points: ["Default on RHEL", "Can grow but not shrink", "Strong with large files and parallel I/O", "Allocates inodes dynamically"] },
        ],
      },
    ],
    keyPoints: [
      "stat shows the inode number, link count, size, permissions and timestamps.",
      "unlink removes a name; data is freed only when no names and no open descriptors remain.",
      "Hard links cannot cross file systems or point to directories.",
      "Symlinks can cross file systems and dangle when the target disappears.",
    ],
    terms: [
      { term: "Inode", meaning: "On-disk record of a file's metadata and data location." },
      { term: "Hard link", meaning: "Directory entry pointing to an existing inode." },
      { term: "Symbolic link", meaning: "Special file containing a path to another file." },
      { term: "Link count", meaning: "Number of directory entries pointing to an inode." },
      { term: "unlink", meaning: "System call that removes one name for a file." },
      { term: "stat", meaning: "System call that returns an inode's metadata." },
    ],
    example: {
      lang: "bash",
      code: "echo hi > a.txt\nln a.txt b.txt          # hard link\nln -s a.txt c.txt       # symbolic link\nls -li a.txt b.txt c.txt\nstat -c \"%i %h %n\" a.txt\nrm a.txt; cat b.txt     # still prints hi\ncat c.txt               # No such file or directory",
      caption: "Same inode number for a.txt and b.txt; c.txt breaks when a.txt goes.",
    },
    pitfalls: [
      "Expecting rm to free disk space while a process still has the file open.",
      "Using a relative symlink target that resolves differently from the link's directory.",
    ],
    check: [
      { q: "Why does deleting a.txt not delete b.txt's data?", a: "Both names point to the same inode, which is freed only when the last link is gone." },
      { q: "Can a hard link cross file systems?", a: "No, inode numbers are only unique within one file system." },
    ],
  },

  "lsp-files/vfs-mounts": {
    summary:
      "The Virtual File System (VFS) gives every file system the same interface, so open and read work identically on ext4, xfs, NFS or tmpfs. Mounting attaches a file system to a directory in the single directory tree. Pseudo file systems like /proc and /sys expose live kernel data as files you can read with cat.",
    visuals: [
      {
        type: "layers",
        title: "A read() through the VFS",
        layers: [
          { label: "System call", detail: "read(fd, buf, n) from user space." },
          { label: "VFS", detail: "Generic inodes, dentries and the page cache." },
          { label: "File system driver", detail: "ext4, xfs, nfs, procfs, tmpfs." },
          { label: "Block layer", detail: "Request queues and I/O scheduling." },
          { label: "Device driver and disk", detail: "NVMe, SATA or virtio." },
        ],
      },
    ],
    keyPoints: [
      "Linux has one directory tree; mount grafts other file systems onto it.",
      "The page cache keeps recently used file data in RAM for all file systems.",
      "/proc/PID exposes per-process information such as status, fd and maps.",
      "/sys exposes devices and kernel parameters, some of them writable.",
    ],
    terms: [
      { term: "VFS", meaning: "Kernel layer that gives all file systems one interface." },
      { term: "Mount point", meaning: "Directory where a file system is attached." },
      { term: "Dentry", meaning: "Cached mapping from a path component to an inode." },
      { term: "Page cache", meaning: "RAM cache of file contents." },
      { term: "procfs", meaning: "Pseudo file system at /proc for process and kernel info." },
      { term: "sysfs", meaning: "Pseudo file system at /sys for devices and drivers." },
    ],
    example: {
      lang: "bash",
      code: "head -5 /proc/self/mounts\nfindmnt /\nls -l /proc/self/fd\ngrep -E \"State|VmRSS\" /proc/$$/status\ncat /sys/block/*/queue/scheduler",
      caption: "Explore mounts, descriptors and kernel settings as plain files.",
    },
    check: [
      { q: "What does the VFS provide?", a: "A common interface so the same system calls work on any file system." },
      { q: "Where can you see a process's open descriptors?", a: "In /proc/PID/fd." },
    ],
  },

  "lsp-files/directories-perms": {
    summary:
      "Directories are special files you read with opendir and readdir. Every file has an owner, a group and nine permission bits: read, write and execute for user, group and others. The process umask clears bits from the mode you request, so open with 0666 usually produces a 0644 file.",
    visuals: [
      {
        type: "compare",
        title: "rwx on files vs directories",
        columns: [
          { title: "File", points: ["r: read the contents", "w: modify the contents", "x: run it as a program", "Deleting it depends on the directory"] },
          { title: "Directory", points: ["r: list the names", "w: create, delete or rename entries", "x: enter it and access entries by name", "w without x is useless"] },
        ],
      },
    ],
    keyPoints: [
      "Final mode = requested mode & ~umask.",
      "Deleting a file needs write and execute on its directory, not on the file.",
      "readdir also returns . and .., so skip them when walking trees.",
      "Use nftw or fts for recursive walks instead of hand-rolled recursion.",
    ],
    terms: [
      { term: "umask", meaning: "Per-process mask of permission bits removed from new files." },
      { term: "Mode bits", meaning: "The rwx permissions plus setuid, setgid and sticky bits." },
      { term: "readdir", meaning: "Returns the next entry from an open directory stream." },
      { term: "chmod", meaning: "Changes a file's mode bits." },
      { term: "Octal notation", meaning: "0754 means rwx for user, r-x for group, r-- for others." },
    ],
    example: {
      lang: "c",
      code: "#include <dirent.h>\n#include <stdio.h>\n#include <string.h>\n\nint main(int argc, char **argv) {\n  DIR *d = opendir(argc > 1 ? argv[1] : \".\");\n  if (!d) { perror(\"opendir\"); return 1; }\n  struct dirent *e;\n  while ((e = readdir(d)) != NULL) {\n    if (strcmp(e->d_name, \".\") == 0 || strcmp(e->d_name, \"..\") == 0) continue;\n    printf(\"%lu %s\\n\", (unsigned long)e->d_ino, e->d_name);\n  }\n  closedir(d);\n  return 0;\n}",
      caption: "List a directory with inode numbers, like ls -i.",
    },
    check: [
      { q: "With umask 022, what mode does open(path, O_CREAT, 0666) produce?", a: "0644." },
      { q: "Which permission lets you delete a file?", a: "Write and execute on the directory that contains it." },
    ],
  },

  // ───────────── Processes ─────────────
  "lsp-processes/process-model": {
    summary:
      "A process is a running program plus everything the kernel tracks for it: an address space, open descriptors, credentials, signal state and one or more threads. The scheduler moves each task between states such as running, sleeping and stopped. ps and /proc show these states as letters like R, S, D, T and Z.",
    visuals: [
      {
        type: "cycle",
        title: "Scheduler states of a task",
        steps: [
          { label: "Runnable (R)", detail: "Ready and waiting for a CPU." },
          { label: "Running (R)", detail: "Executing until it blocks or its time slice ends." },
          { label: "Sleeping (S or D)", detail: "Waiting for I/O, a lock or a timer." },
          { label: "Woken", detail: "The event arrives and the task is runnable again." },
        ],
      },
    ],
    keyPoints: [
      "Each process has a PID, a parent PID, user and group IDs and a working directory.",
      "R is running or runnable, S is interruptible sleep, D is uninterruptible sleep, usually disk or NFS I/O.",
      "T means stopped by a signal such as SIGSTOP or Ctrl-Z.",
      "Z is a zombie: finished, but the parent has not yet collected its exit status.",
    ],
    terms: [
      { term: "PID", meaning: "Process ID, unique among running processes." },
      { term: "PPID", meaning: "PID of the parent process." },
      { term: "Task", meaning: "Kernel's schedulable unit; each thread is a task." },
      { term: "Scheduler", meaning: "Kernel component that picks which task runs on each CPU." },
      { term: "Uninterruptible sleep", meaning: "State D, not woken by signals until the wait finishes." },
    ],
    example: {
      lang: "bash",
      code: "ps -eo pid,ppid,stat,comm | head\ngrep -E \"^(Name|State|Pid|PPid|Uid)\" /proc/self/status\nsleep 100 &\nps -o pid,stat,comm -p $!\nkill -STOP $!; ps -o stat= -p $!\nkill -CONT $!",
      caption: "Watch a process move from S to T and back.",
    },
    check: [
      { q: "What does state D mean?", a: "Uninterruptible sleep, usually waiting on I/O; signals take effect only after it wakes." },
      { q: "Which state does Ctrl-Z put a job into?", a: "Stopped (T)." },
    ],
  },

  "lsp-processes/fork-exec-wait": {
    summary:
      "Unix creates processes in two steps: fork clones the calling process, and exec replaces the clone's program with a new one. The parent then calls wait or waitpid to block until the child ends and to collect its exit status. Every command you type in a shell runs through this pattern.",
    analogy: "fork photocopies a recipe card; exec rubs it out and writes a different recipe on the copy.",
    visuals: [
      {
        type: "sequence",
        title: "Running a command",
        actors: ["Parent", "Kernel", "Child"],
        messages: [
          { from: 0, to: 1, label: "fork()" },
          { from: 1, to: 0, label: "returns the child's PID" },
          { from: 1, to: 2, label: "returns 0 in the child" },
          { from: 2, to: 1, label: "execvp(\"ls\", argv): new program image" },
          { from: 0, to: 1, label: "waitpid(pid, &status, 0) blocks" },
          { from: 2, to: 1, label: "exit(0)" },
          { from: 1, to: 0, label: "waitpid returns with the exit status" },
        ],
      },
    ],
    keyPoints: [
      "fork returns twice: the child's PID in the parent, 0 in the child, or -1 on error.",
      "Memory is shared copy-on-write, so fork is cheap until someone writes.",
      "exec only returns on failure, so code after it runs only if exec failed.",
      "Decode the status from waitpid with WIFEXITED and WEXITSTATUS.",
    ],
    terms: [
      { term: "fork", meaning: "Creates a child process that is a copy of the caller." },
      { term: "execvp", meaning: "Replaces the current program, searching PATH for it." },
      { term: "waitpid", meaning: "Waits for a child to change state and returns its status." },
      { term: "Copy-on-write", meaning: "Pages are shared until one side writes, then copied." },
      { term: "Exit status", meaning: "Small integer a process returns, 0 meaning success." },
      { term: "WIFSIGNALED", meaning: "Macro that is true if the child was killed by a signal." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n#include <sys/wait.h>\n#include <unistd.h>\nint main(void) {\n  pid_t pid = fork();\n  if (pid < 0) { perror(\"fork\"); return 1; }\n  if (pid == 0) {\n    char *argv[] = { \"ls\", \"-l\", NULL };\n    execvp(argv[0], argv);\n    perror(\"execvp\"); _exit(127);\n  }\n  int status; waitpid(pid, &status, 0);\n  if (WIFEXITED(status)) printf(\"child exited %d\\n\", WEXITSTATUS(status));\n  return 0;\n}",
      caption: "The fork, exec, wait pattern every shell uses.",
    },
    pitfalls: [
      "Calling exit instead of _exit in a child after a failed exec, which flushes copied stdio buffers twice.",
      "Never calling wait, which leaves zombie processes behind.",
    ],
    check: [
      { q: "What does fork return in the child?", a: "0." },
      { q: "When does execvp return?", a: "Only when it fails." },
    ],
  },

  "lsp-processes/zombies-orphans": {
    summary:
      "When a process exits, the kernel keeps a small record of its exit status until the parent collects it with wait; until then the child is a zombie. If the parent dies first, the child becomes an orphan and is adopted by PID 1 or a designated subreaper, which reaps it. Each process also inherits an environment of KEY=value strings from its parent.",
    visuals: [
      {
        type: "tree",
        title: "A process tree with a zombie and an orphan",
        root: "systemd (PID 1)",
        children: [
          { label: "bash (PID 200)", children: ["sleep (PID 201): running", "ls (PID 202): zombie until bash waits"] },
          { label: "worker (PID 305): orphan", children: ["Parent died, reparented to PID 1", "PID 1 reaps it when it exits"] },
        ],
      },
    ],
    keyPoints: [
      "Zombies use no CPU or memory, only a process table entry and a PID.",
      "Fix zombies by having the parent wait, for example from a SIGCHLD handler.",
      "exit runs atexit handlers and flushes stdio; _exit returns to the kernel immediately.",
      "The environment is copied at fork and exec; a child's changes never flow back to the parent.",
    ],
    terms: [
      { term: "Zombie", meaning: "Exited process whose status has not been collected." },
      { term: "Orphan", meaning: "Process whose parent has exited." },
      { term: "Reaping", meaning: "Collecting a child's exit status with wait." },
      { term: "Subreaper", meaning: "Process marked to adopt orphaned descendants instead of PID 1." },
      { term: "atexit", meaning: "Registers functions to run on normal exit." },
      { term: "environ", meaning: "Array of KEY=value strings passed to each program." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n\nint main(void) {\n  if (fork() == 0) _exit(0);      // child exits immediately\n  printf(\"child is a zombie for 30s: ps -o pid,stat,comm\\n\");\n  sleep(30);                      // parent never calls wait\n  setenv(\"APP_MODE\", \"debug\", 1);\n  printf(\"APP_MODE=%s\\n\", getenv(\"APP_MODE\"));\n  return 0;\n}",
      caption: "Run it and look for a Z state in ps from another terminal.",
    },
    pitfalls: [
      "Trying to kill -9 a zombie; it is already dead and only its parent can reap it.",
      "Never reaping children in a long-running server until the PID limit is reached.",
    ],
    check: [
      { q: "How do you get rid of a zombie?", a: "Its parent must wait for it, or the parent must exit so PID 1 adopts and reaps it." },
      { q: "Can a child change its parent's environment variables?", a: "No, it only has a copy." },
    ],
  },

  "lsp-processes/sessions-groups": {
    summary:
      "Processes are grouped for job control: every pipeline a shell launches gets its own process group, and all groups started from one terminal belong to one session. The terminal sends signals such as SIGINT from Ctrl-C to the whole foreground group. This is how a shell can stop, resume or kill an entire pipeline at once.",
    visuals: [
      {
        type: "tree",
        title: "One terminal session",
        root: "Session (leader bash, terminal /dev/pts/0)",
        children: [
          { label: "Group: bash", children: ["bash"] },
          { label: "Foreground group: grep foo log | less", children: ["grep", "less", "Receives Ctrl-C and Ctrl-Z"] },
          { label: "Background group: make -j8 &", children: ["make", "cc processes", "Stopped by SIGTTIN if it reads the terminal"] },
        ],
      },
    ],
    keyPoints: [
      "setpgid puts a process into a group; shells do this for each pipeline.",
      "setsid starts a new session with no controlling terminal, which daemons rely on.",
      "tcsetpgrp tells the terminal which group is in the foreground.",
      "Ctrl-C sends SIGINT and Ctrl-Z sends SIGTSTP to the foreground group.",
    ],
    terms: [
      { term: "Process group", meaning: "Set of processes that receive job-control signals together." },
      { term: "Session", meaning: "Collection of process groups tied to one login or terminal." },
      { term: "Controlling terminal", meaning: "Terminal that sends signals to a session's foreground group." },
      { term: "Foreground group", meaning: "The group allowed to read from the terminal." },
      { term: "setsid", meaning: "Creates a new session and process group." },
      { term: "SIGTSTP", meaning: "Terminal stop signal sent by Ctrl-Z." },
    ],
    example: {
      lang: "bash",
      code: "sleep 300 | cat &\nps -o pid,pgid,sid,tty,comm\njobs -l\nfg %1        # foreground it, then press Ctrl-Z\nbg %1        # continue it in the background\nkill -- -PGID  # a negative PID signals a whole group",
      caption: "Both pipeline processes share one PGID.",
    },
    check: [
      { q: "Which signal does Ctrl-Z send?", a: "SIGTSTP, to the foreground process group." },
      { q: "Why do daemons call setsid?", a: "To start a new session and detach from any controlling terminal." },
    ],
  },

  // ───────────── Signals ─────────────
  "lsp-signals/signal-basics": {
    summary:
      "A signal is a small asynchronous notification sent to a process by the kernel, another process or the terminal. Each signal has a default action, such as terminating, dumping core, stopping or being ignored. Programs can catch most signals, but SIGKILL and SIGSTOP always take effect.",
    visuals: [
      {
        type: "compare",
        title: "Default actions",
        columns: [
          { title: "Terminate", points: ["SIGTERM: polite shutdown request", "SIGINT: Ctrl-C", "SIGHUP: terminal closed", "SIGPIPE: write to a closed pipe"] },
          { title: "Terminate and dump core", points: ["SIGSEGV: invalid memory access", "SIGABRT: abort() called", "SIGFPE: arithmetic error", "SIGQUIT: Ctrl-backslash"] },
          { title: "Stop, continue or ignore", points: ["SIGSTOP and SIGTSTP stop", "SIGCONT resumes", "SIGCHLD is ignored by default", "SIGKILL and SIGSTOP cannot be caught"] },
        ],
      },
    ],
    keyPoints: [
      "kill sends a signal to a PID; kill -l lists all signals.",
      "SIGTERM lets a program clean up; use SIGKILL only as a last resort.",
      "Standard signals are not queued: two identical pending signals merge into one.",
      "A signal can arrive between any two instructions of your program.",
    ],
    terms: [
      { term: "Signal", meaning: "Asynchronous notification identified by a number." },
      { term: "Default action", meaning: "What happens if no handler is installed." },
      { term: "Pending signal", meaning: "Generated but not yet delivered." },
      { term: "Signal mask", meaning: "Set of signals currently blocked from delivery." },
      { term: "SIGKILL", meaning: "Signal 9, always terminates the process." },
      { term: "Core dump", meaning: "Memory image written when a process crashes." },
    ],
    example: {
      lang: "bash",
      code: "kill -l\nsleep 100 &\nkill -TERM $!\ntrap 'echo got SIGINT' INT     # shell-level handler\nkill -INT $$\nkill -9 1234                   # SIGKILL, cannot be caught",
      caption: "Send signals and catch one in the shell.",
    },
    check: [
      { q: "Which two signals can never be caught or ignored?", a: "SIGKILL and SIGSTOP." },
      { q: "What is the default action of SIGSEGV?", a: "Terminate the process and dump core." },
    ],
  },

  "lsp-signals/sigaction-handlers": {
    summary:
      "sigaction installs a signal handler with well-defined behaviour, unlike the older signal function. A handler can interrupt your code anywhere, so it must only call async-signal-safe functions and usually just sets a flag. Signal masks let you block delivery during critical sections.",
    visuals: [
      {
        type: "sequence",
        title: "Delivering SIGINT to a handler",
        actors: ["Terminal", "Kernel", "Main code", "Handler"],
        messages: [
          { from: 0, to: 1, label: "Ctrl-C: SIGINT to the foreground group" },
          { from: 1, to: 2, label: "Interrupt at the next return to user mode" },
          { from: 1, to: 3, label: "Run handler(SIGINT) on the process stack" },
          { from: 3, to: 2, label: "Set stop = 1 and return; main code resumes" },
          { from: 1, to: 2, label: "Blocked call returns EINTR or restarts with SA_RESTART" },
        ],
      },
    ],
    keyPoints: [
      "Use sigaction, not signal, for portable and predictable handlers.",
      "Inside a handler only call async-signal-safe functions such as write, never printf or malloc.",
      "Communicate with the main code through a volatile sig_atomic_t flag.",
      "SA_RESTART makes many interrupted system calls restart instead of failing with EINTR.",
      "sigprocmask blocks signals temporarily; they stay pending until unblocked.",
    ],
    terms: [
      { term: "sigaction", meaning: "System call that installs a signal handler and options." },
      { term: "Handler", meaning: "Function the kernel runs when a signal arrives." },
      { term: "Async-signal-safe", meaning: "Safe to call from a handler that interrupted anything." },
      { term: "sig_atomic_t", meaning: "Integer type read and written atomically with respect to signals." },
      { term: "SA_RESTART", meaning: "Flag that restarts interrupted system calls automatically." },
      { term: "sigprocmask", meaning: "Blocks or unblocks signals for the calling thread." },
    ],
    example: {
      lang: "c",
      code: "#include <signal.h>\n#include <stdio.h>\n#include <unistd.h>\n\nstatic volatile sig_atomic_t stop = 0;\nstatic void on_int(int sig) { (void)sig; stop = 1; }\n\nint main(void) {\n  struct sigaction sa = { .sa_handler = on_int };\n  sigemptyset(&sa.sa_mask);\n  sigaction(SIGINT, &sa, NULL);\n  while (!stop) sleep(1);\n  puts(\"clean shutdown\");\n  return 0;\n}",
      caption: "Press Ctrl-C: the handler only sets a flag; cleanup happens in main.",
    },
    pitfalls: [
      "Calling printf, malloc or locking a mutex inside a handler.",
      "Ignoring EINTR from blocking calls when SA_RESTART is not set.",
    ],
    check: [
      { q: "Why should handlers avoid printf?", a: "printf is not async-signal-safe; interrupting it mid-call can corrupt its state or deadlock." },
      { q: "What does SA_RESTART do?", a: "Automatically restarts many system calls interrupted by the handler." },
    ],
  },

  "lsp-signals/signalfd-patterns": {
    summary:
      "Handlers are awkward in programs built around an event loop. The self-pipe trick has the handler write one byte to a pipe that the loop watches, and Linux's signalfd goes further by letting you read signals from a descriptor. Either way, signals become ordinary events handled in normal code.",
    visuals: [
      {
        type: "flow",
        title: "The signalfd recipe",
        steps: [
          { label: "Block the signals", detail: "sigprocmask(SIG_BLOCK) for SIGINT, SIGTERM, SIGCHLD." },
          { label: "Create a signalfd", detail: "signalfd(-1, &mask, SFD_CLOEXEC)." },
          { label: "Add it to the loop", detail: "Watch it with poll or epoll like a socket." },
          { label: "Read events", detail: "read() returns struct signalfd_siginfo records." },
          { label: "Handle in normal code", detail: "Reap children, reload config or shut down." },
        ],
      },
    ],
    keyPoints: [
      "Signals must be blocked first, otherwise they are delivered the normal way.",
      "One read can return several signalfd_siginfo records.",
      "After SIGCHLD, loop on waitpid with WNOHANG because several exits can merge into one signal.",
      "The self-pipe trick works on any Unix, not just Linux.",
    ],
    terms: [
      { term: "Self-pipe trick", meaning: "Handler writes a byte to a pipe so the event loop wakes up." },
      { term: "signalfd", meaning: "Linux descriptor from which pending signals are read." },
      { term: "signalfd_siginfo", meaning: "Struct describing one received signal." },
      { term: "WNOHANG", meaning: "waitpid option that returns immediately if no child has exited." },
    ],
    example: {
      lang: "c",
      code: "#include <signal.h>\n#include <stdio.h>\n#include <sys/signalfd.h>\n#include <unistd.h>\nint main(void) {\n  sigset_t mask;\n  sigemptyset(&mask);\n  sigaddset(&mask, SIGINT); sigaddset(&mask, SIGTERM);\n  sigprocmask(SIG_BLOCK, &mask, NULL);\n  int sfd = signalfd(-1, &mask, SFD_CLOEXEC);\n  struct signalfd_siginfo si;\n  if (read(sfd, &si, sizeof si) == sizeof si)\n    printf(\"got signal %u from pid %u\\n\", si.ssi_signo, si.ssi_pid);\n  return 0;\n}",
      caption: "Signals arrive as data on a descriptor instead of interrupting code.",
    },
    check: [
      { q: "What must you do before creating a signalfd?", a: "Block those signals with sigprocmask." },
      { q: "Why loop on waitpid with WNOHANG after SIGCHLD?", a: "Several child exits can be merged into a single signal." },
    ],
  },

  // ───────────── Inter-process communication ─────────────
  "lsp-ipc/pipes-fifos": {
    summary:
      "A pipe is a one-way kernel buffer with a read end and a write end, created with pipe and usually shared with a child through fork. A FIFO is the same thing with a name in the file system, so unrelated processes can open it. Shell pipelines like ls | wc -l are built from pipe, fork, dup2 and exec.",
    visuals: [
      {
        type: "flow",
        title: "Building ls | wc -l",
        steps: [
          { label: "pipe(fds)", detail: "fds[0] is the read end, fds[1] the write end." },
          { label: "Fork child 1", detail: "dup2(fds[1], 1), close both ends, exec ls." },
          { label: "Fork child 2", detail: "dup2(fds[0], 0), close both ends, exec wc -l." },
          { label: "Parent closes both ends", detail: "Otherwise wc never sees EOF." },
          { label: "Wait for both", detail: "Collect both exit statuses." },
        ],
      },
    ],
    keyPoints: [
      "Close every unused end; a reader sees EOF only when all write ends are closed.",
      "Writing to a pipe with no readers raises SIGPIPE or fails with EPIPE.",
      "Writes of up to PIPE_BUF bytes (4096 on Linux) are atomic.",
      "A full pipe blocks the writer, giving natural back-pressure.",
    ],
    terms: [
      { term: "Pipe", meaning: "Unidirectional byte channel between related processes." },
      { term: "FIFO", meaning: "Named pipe that appears in the file system." },
      { term: "PIPE_BUF", meaning: "Largest write guaranteed not to interleave with others." },
      { term: "SIGPIPE", meaning: "Signal sent when writing to a pipe with no readers." },
      { term: "mkfifo", meaning: "Command and function that create a FIFO." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n#include <sys/wait.h>\n#include <unistd.h>\nint main(void) {\n  int fds[2]; pipe(fds);\n  if (fork() == 0) {                 // child: writer\n    close(fds[0]);\n    write(fds[1], \"ping\\n\", 5);\n    _exit(0);\n  }\n  close(fds[1]);                     // parent: reader\n  char buf[16]; ssize_t n = read(fds[0], buf, sizeof buf);\n  printf(\"parent read %zd bytes\\n\", n); wait(NULL);\n  return 0;\n}",
      caption: "Parent and child talk through a pipe; each closes the end it does not use.",
    },
    pitfalls: [
      "Leaving a write end open in the parent so the reader hangs forever.",
      "Ignoring SIGPIPE in a server and then not checking writes for EPIPE.",
    ],
    check: [
      { q: "When does a pipe reader see EOF?", a: "When every write end is closed and the buffer is empty." },
      { q: "How can unrelated processes share a pipe?", a: "Through a named FIFO created with mkfifo." },
    ],
  },

  "lsp-ipc/shared-memory": {
    summary:
      "Shared memory lets processes map the same physical pages, so data is exchanged without copying through the kernel. It is the fastest form of IPC, but the kernel provides no synchronisation, so you add semaphores or process-shared mutexes. POSIX shared memory objects appear under /dev/shm.",
    visuals: [
      {
        type: "sequence",
        title: "Two processes sharing a region",
        actors: ["Writer", "Kernel", "Reader"],
        messages: [
          { from: 0, to: 1, label: "shm_open /demo, ftruncate to 4096 bytes" },
          { from: 0, to: 1, label: "mmap MAP_SHARED" },
          { from: 2, to: 1, label: "shm_open /demo, mmap MAP_SHARED" },
          { from: 0, to: 2, label: "write into shared pages, then sem_post" },
          { from: 2, to: 0, label: "sem_wait returns, read the same pages directly" },
          { from: 0, to: 1, label: "shm_unlink /demo when finished" },
        ],
      },
    ],
    keyPoints: [
      "shm_open returns a descriptor, ftruncate sets the size and mmap with MAP_SHARED maps it.",
      "Data written by one process is immediately visible to the other.",
      "Protect shared data with a semaphore or a pthread mutex marked PTHREAD_PROCESS_SHARED.",
      "Store offsets rather than pointers, because each process may map the region at a different address.",
      "Remove the object with shm_unlink or it lingers in /dev/shm.",
    ],
    terms: [
      { term: "shm_open", meaning: "Creates or opens a named POSIX shared memory object." },
      { term: "MAP_SHARED", meaning: "Mapping whose changes are visible to other mappers." },
      { term: "sem_open", meaning: "Opens a named POSIX semaphore." },
      { term: "sem_wait and sem_post", meaning: "Decrement (blocking at zero) and increment a semaphore." },
      { term: "/dev/shm", meaning: "tmpfs where POSIX shared memory objects live." },
    ],
    example: {
      lang: "c",
      code: "#include <fcntl.h>\n#include <stdio.h>\n#include <sys/mman.h>\n#include <unistd.h>\n\nint main(void) {\n  int fd = shm_open(\"/demo\", O_CREAT | O_RDWR, 0600);\n  if (fd < 0 || ftruncate(fd, 4096) < 0) { perror(\"shm\"); return 1; }\n  char *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);\n  if (p == MAP_FAILED) { perror(\"mmap\"); return 1; }\n  snprintf(p, 4096, \"written by pid %d\", getpid());\n  printf(\"%s (see /dev/shm/demo)\\n\", p);\n  munmap(p, 4096); close(fd);\n  return 0;\n}",
      caption: "Create and write a shared region; link with -lrt on older glibc.",
    },
    pitfalls: [
      "Skipping synchronisation and reading half-written data.",
      "Forgetting shm_unlink so stale objects survive restarts.",
    ],
    check: [
      { q: "Why is shared memory the fastest IPC?", a: "Processes access the same pages directly, with no copying through the kernel." },
      { q: "Why store offsets instead of pointers in shared memory?", a: "Each process may map the region at a different virtual address." },
    ],
  },

  "lsp-ipc/message-queues": {
    summary:
      "POSIX message queues carry discrete messages with priorities, so the reader always receives whole messages and the highest priority first. Unlike pipes, they keep message boundaries and exist independently of any process until unlinked. They suit passing small commands or jobs between processes.",
    visuals: [
      {
        type: "flow",
        title: "Message queue lifecycle",
        steps: [
          { label: "mq_open", detail: "Create /jobs with mq_maxmsg and mq_msgsize." },
          { label: "mq_send", detail: "Producer sends a message with a priority." },
          { label: "Kernel queue", detail: "Ordered by priority, then by arrival." },
          { label: "mq_receive", detail: "Consumer gets the oldest highest-priority message." },
          { label: "mq_unlink", detail: "Remove the queue name when finished." },
        ],
      },
    ],
    keyPoints: [
      "Each message is delivered whole; boundaries are preserved.",
      "Messages with higher priority numbers are received first.",
      "mq_receive needs a buffer at least mq_msgsize bytes long.",
      "System-wide limits live in /proc/sys/fs/mqueue.",
    ],
    terms: [
      { term: "mq_open", meaning: "Creates or opens a named message queue." },
      { term: "mq_send", meaning: "Adds a message with a priority to the queue." },
      { term: "mq_receive", meaning: "Removes the highest-priority message." },
      { term: "mq_attr", meaning: "Struct with queue limits such as maximum messages and size." },
      { term: "mq_notify", meaning: "Requests a notification when a message arrives on an empty queue." },
    ],
    example: {
      lang: "c",
      code: "#include <fcntl.h>\n#include <mqueue.h>\n#include <stdio.h>\nint main(void) {\n  struct mq_attr attr = { .mq_maxmsg = 10, .mq_msgsize = 128 };\n  mqd_t q = mq_open(\"/jobs\", O_CREAT | O_RDWR, 0600, &attr);\n  if (q == (mqd_t)-1) { perror(\"mq_open\"); return 1; }\n  mq_send(q, \"low\", 4, 1);\n  mq_send(q, \"urgent\", 7, 9);\n  char buf[128]; unsigned prio;\n  mq_receive(q, buf, sizeof buf, &prio);\n  printf(\"%s (priority %u)\\n\", buf, prio);   // urgent comes first\n  mq_close(q); mq_unlink(\"/jobs\");\n  return 0;\n}",
      caption: "Priority 9 is received before priority 1.",
    },
    pitfalls: [
      "Passing a receive buffer smaller than mq_msgsize, which fails with EMSGSIZE.",
      "Forgetting mq_unlink, so the queue lingers in /dev/mqueue after the program exits.",
    ],
    check: [
      { q: "Which message does mq_receive return first?", a: "The oldest message with the highest priority." },
      { q: "How do message queues differ from pipes?", a: "They preserve message boundaries and support priorities." },
    ],
  },

  "lsp-ipc/unix-sockets": {
    summary:
      "Unix domain sockets use the full sockets API but stay on one machine, addressed by a file-system path or an abstract name. They are bidirectional, support many clients per server and can even pass open file descriptors between processes. Docker, systemd and databases all use them for local communication.",
    visuals: [
      {
        type: "compare",
        title: "Pipes vs Unix sockets vs shared memory",
        columns: [
          { title: "Pipes and FIFOs", points: ["One-way byte stream", "Simple; ideal for parent and child", "Kernel copies the data", "No message boundaries"] },
          { title: "Unix sockets", points: ["Two-way, stream or datagram", "Many clients per server", "Can pass descriptors and credentials", "Kernel copies the data"] },
          { title: "Shared memory", points: ["No copying, the fastest", "You add all the synchronisation", "Best for large or frequent data", "Bugs are subtle"] },
        ],
      },
    ],
    keyPoints: [
      "Server: socket(AF_UNIX), bind to a path, listen, accept. Client: socket, connect.",
      "unlink a stale socket path before bind, or bind fails with EADDRINUSE.",
      "File permissions on the socket path control who may connect.",
      "SCM_RIGHTS ancillary messages hand open descriptors to another process.",
    ],
    terms: [
      { term: "AF_UNIX", meaning: "Address family for local Unix domain sockets." },
      { term: "sockaddr_un", meaning: "Address struct holding the socket path." },
      { term: "SOCK_STREAM", meaning: "Connection-oriented byte stream socket." },
      { term: "SOCK_DGRAM", meaning: "Socket that preserves message boundaries." },
      { term: "SCM_RIGHTS", meaning: "Ancillary message type for passing file descriptors." },
      { term: "SO_PEERCRED", meaning: "Socket option returning the peer's PID, UID and GID." },
    ],
    example: {
      lang: "c",
      code: "#include <stdio.h>\n#include <string.h>\n#include <sys/socket.h>\n#include <sys/un.h>\n#include <unistd.h>\nint main(void) {\n  int s = socket(AF_UNIX, SOCK_STREAM, 0);\n  struct sockaddr_un addr = { .sun_family = AF_UNIX };\n  strncpy(addr.sun_path, \"/tmp/demo.sock\", sizeof addr.sun_path - 1);\n  unlink(addr.sun_path);\n  if (bind(s, (struct sockaddr *)&addr, sizeof addr) < 0) { perror(\"bind\"); return 1; }\n  listen(s, 8); int c = accept(s, NULL, NULL);\n  write(c, \"hello\\n\", 6); close(c); close(s);\n  return 0;\n}",
      caption: "Test it from another terminal with: nc -U /tmp/demo.sock",
    },
    check: [
      { q: "Name something Unix sockets can do that pipes cannot.", a: "Carry two-way traffic for many clients, or pass file descriptors between processes." },
      { q: "Why unlink the path before bind?", a: "A leftover socket file makes bind fail with EADDRINUSE." },
      { q: "Which IPC mechanism avoids copying data through the kernel?", a: "Shared memory." },
    ],
  },

  // ───────────── POSIX threads & synchronization ─────────────
  "lsp-threads/pthreads-basics": {
    summary:
      "Threads are multiple flows of execution inside one process, sharing its memory, descriptors and signal handlers, each with its own stack and registers. pthread_create starts a thread running a function, and pthread_join waits for it and collects its result. Shared memory makes threads fast to communicate but easy to get wrong.",
    visuals: [
      {
        type: "compare",
        title: "Threads vs processes",
        columns: [
          { title: "Threads", points: ["Share the address space and fds", "Cheap to create and switch", "Communicate through shared memory", "One crash kills the whole process"] },
          { title: "Processes", points: ["Separate address spaces", "Stronger isolation", "Communicate through IPC", "A crash affects only one process"] },
        ],
      },
    ],
    keyPoints: [
      "Compile and link with -pthread.",
      "Pass arguments through a void pointer, and give each thread its own argument struct.",
      "Every thread must be joined or detached so its resources are freed.",
      "pthread functions return an error number instead of setting errno.",
    ],
    terms: [
      { term: "pthread_t", meaning: "Handle identifying a thread." },
      { term: "pthread_create", meaning: "Starts a new thread running a given function." },
      { term: "pthread_join", meaning: "Waits for a thread to finish and gets its return value." },
      { term: "pthread_detach", meaning: "Frees a thread's resources automatically when it exits." },
      { term: "Thread stack", meaning: "Private stack each thread uses for its locals." },
      { term: "Thread-local storage", meaning: "Variables with one copy per thread, declared with _Thread_local." },
    ],
    example: {
      lang: "c",
      code: "#include <pthread.h>\n#include <stdio.h>\nstruct job { int id; long result; };\nstatic void *work(void *arg) {\n  struct job *j = arg;\n  for (long i = 1; i <= 1000000; i++) j->result += i % (j->id + 2);\n  return NULL;\n}\nint main(void) {\n  pthread_t t[4]; struct job jobs[4];\n  for (int i = 0; i < 4; i++) { jobs[i] = (struct job){ i, 0 }; pthread_create(&t[i], NULL, work, &jobs[i]); }\n  for (int i = 0; i < 4; i++) { pthread_join(t[i], NULL); printf(\"job %d: %ld\\n\", i, jobs[i].result); }\n  return 0;\n}",
      caption: "Four workers, each with its own argument struct. Build with gcc -pthread.",
    },
    pitfalls: [
      "Passing &i from a loop so every thread sees the same changing variable.",
      "Returning a pointer to a thread's local variable from the thread function.",
    ],
    check: [
      { q: "What do threads in one process share?", a: "The address space, heap, globals, file descriptors and signal handlers." },
      { q: "What happens to a thread that is neither joined nor detached?", a: "Its resources are not freed after it exits, much like a zombie process." },
    ],
  },

  "lsp-threads/mutexes": {
    summary:
      "A data race happens when threads access the same memory at the same time, at least one of them writes, and nothing synchronises them. Even counter++ is a read, an add and a write, so updates get lost. A mutex makes a critical section run one thread at a time.",
    visuals: [
      {
        type: "sequence",
        title: "A lost update, then the fix",
        actors: ["Thread A", "counter in memory", "Thread B"],
        messages: [
          { from: 0, to: 1, label: "read counter = 5" },
          { from: 2, to: 1, label: "read counter = 5" },
          { from: 0, to: 1, label: "write 6" },
          { from: 2, to: 1, label: "write 6: A's update is lost" },
          { from: 0, to: 1, label: "With a mutex: lock, read 6, write 7, unlock" },
          { from: 2, to: 1, label: "B waits for the lock, then reads 7, writes 8" },
        ],
      },
    ],
    keyPoints: [
      "Every access to shared mutable data must hold the same mutex.",
      "Keep critical sections short and never do slow I/O while holding a lock.",
      "Unlock on every path, including error returns.",
      "ThreadSanitizer (-fsanitize=thread) reports data races at run time.",
    ],
    terms: [
      { term: "Data race", meaning: "Unsynchronised concurrent access where at least one access writes." },
      { term: "Critical section", meaning: "Code that touches shared data and must not run concurrently." },
      { term: "Mutex", meaning: "Lock that only one thread can hold at a time." },
      { term: "Lock contention", meaning: "Threads waiting because others hold the lock." },
      { term: "ThreadSanitizer", meaning: "Compiler instrumentation that detects data races." },
    ],
    example: {
      lang: "c",
      code: "#include <pthread.h>\n#include <stdio.h>\nstatic long counter = 0;\nstatic pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;\nstatic void *inc(void *arg) {\n  for (int i = 0; i < 1000000; i++) {\n    pthread_mutex_lock(&lock); counter++; pthread_mutex_unlock(&lock);\n  }\n  return arg;\n}\nint main(void) {\n  pthread_t a, b; pthread_create(&a, NULL, inc, NULL); pthread_create(&b, NULL, inc, NULL);\n  pthread_join(a, NULL); pthread_join(b, NULL);\n  printf(\"%ld\\n\", counter);   // always 2000000; without the lock it varies\n}",
      caption: "Remove the lock calls and compile with -fsanitize=thread to see the race reported.",
    },
    check: [
      { q: "Why is counter++ not thread-safe?", a: "It is a separate read, modify and write that another thread can interleave with." },
      { q: "Which tools detect data races?", a: "ThreadSanitizer via -fsanitize=thread, or valgrind's helgrind." },
    ],
  },

  "lsp-threads/condition-variables": {
    summary:
      "A condition variable lets a thread sleep until some shared state changes, instead of spinning. It is always paired with a mutex: lock, check the condition in a while loop, and wait, which atomically unlocks and sleeps. The bounded producer-consumer queue is the classic pattern behind thread pools.",
    visuals: [
      {
        type: "cycle",
        title: "Consumer loop on a bounded queue",
        steps: [
          { label: "Lock the mutex" },
          { label: "While empty: pthread_cond_wait", detail: "Atomically unlocks and sleeps; relocks on wake." },
          { label: "Take one item" },
          { label: "Signal not_full and unlock" },
          { label: "Process the item outside the lock" },
        ],
      },
    ],
    keyPoints: [
      "Always re-check the condition in a while loop because wakeups can be spurious.",
      "Change the shared state while holding the mutex, then signal.",
      "pthread_cond_signal wakes one waiter; pthread_cond_broadcast wakes all of them.",
      "A bounded queue needs two conditions: not_empty and not_full.",
    ],
    terms: [
      { term: "Condition variable", meaning: "Lets threads wait for a condition on shared data." },
      { term: "pthread_cond_wait", meaning: "Releases the mutex, sleeps, and reacquires it on wakeup." },
      { term: "pthread_cond_signal", meaning: "Wakes at least one waiting thread." },
      { term: "Spurious wakeup", meaning: "Return from wait without the condition being true." },
      { term: "Bounded buffer", meaning: "Fixed-capacity queue between producers and consumers." },
      { term: "Thread pool", meaning: "Fixed set of workers taking jobs from a queue." },
    ],
    example: {
      lang: "c",
      code: "#include <pthread.h>\n#define CAP 16\nstatic int buf[CAP], head, count;\nstatic pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;\nstatic pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER, not_full = PTHREAD_COND_INITIALIZER;\n\nint get(void) {\n  pthread_mutex_lock(&m);\n  while (count == 0) pthread_cond_wait(&not_empty, &m);\n  int v = buf[head]; head = (head + 1) % CAP; count--;\n  pthread_cond_signal(&not_full);\n  pthread_mutex_unlock(&m);\n  return v;\n}",
      caption: "The consumer side; put() mirrors it, waiting on not_full and signalling not_empty.",
    },
    pitfalls: [
      "Using if instead of while around pthread_cond_wait.",
      "Signalling without changing the state under the mutex, which causes missed wakeups.",
    ],
    check: [
      { q: "Why must the wait sit inside a while loop?", a: "After waking, the condition may be false again because of a spurious wakeup or another thread taking the item." },
      { q: "What does pthread_cond_wait do with the mutex?", a: "Releases it atomically while sleeping and reacquires it before returning." },
    ],
  },

  "lsp-threads/deadlocks": {
    summary:
      "A deadlock happens when threads each hold a lock and wait for one another, so none can continue. It needs four conditions at once: mutual exclusion, hold and wait, no preemption and circular wait. A single global lock order breaks circular wait, and read-write locks or atomics reduce locking where they fit.",
    visuals: [
      {
        type: "sequence",
        title: "Classic two-lock deadlock",
        actors: ["Thread 1", "Mutex A", "Mutex B", "Thread 2"],
        messages: [
          { from: 0, to: 1, label: "lock(A) succeeds" },
          { from: 3, to: 2, label: "lock(B) succeeds" },
          { from: 0, to: 2, label: "lock(B) blocks: held by Thread 2" },
          { from: 3, to: 1, label: "lock(A) blocks: held by Thread 1" },
        ],
      },
    ],
    keyPoints: [
      "Acquire multiple locks in one fixed global order everywhere.",
      "In gdb, thread apply all bt shows which lock each thread is waiting on.",
      "pthread_mutex_trylock lets you back off instead of blocking forever.",
      "Read-write locks allow many readers or one writer at a time.",
      "C11 atomics from stdatomic.h handle simple counters and flags without a mutex.",
    ],
    terms: [
      { term: "Deadlock", meaning: "Threads blocked forever waiting on each other." },
      { term: "Circular wait", meaning: "Each thread holds a resource the next one needs." },
      { term: "Lock ordering", meaning: "Rule that locks are always taken in the same sequence." },
      { term: "trylock", meaning: "Attempt to lock that fails immediately instead of blocking." },
      { term: "Read-write lock", meaning: "Lock allowing concurrent readers or one exclusive writer." },
      { term: "Atomic operation", meaning: "Indivisible operation such as atomic_fetch_add." },
    ],
    example: {
      lang: "bash",
      code: "gdb -p $(pidof server)\n(gdb) info threads\n(gdb) thread apply all bt\n# look for two threads stuck inside pthread_mutex_lock\nvalgrind --tool=helgrind ./server   # reports lock order violations",
      caption: "Find out who holds what in a hung process.",
    },
    pitfalls: [
      "Calling a callback or unknown code while holding a lock.",
      "Locking a non-recursive mutex twice from the same thread.",
    ],
    check: [
      { q: "Which deadlock condition does lock ordering break?", a: "Circular wait." },
      { q: "How do you see where every thread is blocked in a hung process?", a: "Attach gdb and run thread apply all bt." },
    ],
  },

  // ───────────── Memory management ─────────────
  "lsp-memory/virtual-memory": {
    summary:
      "Every process sees its own private virtual address space, which the kernel maps to physical RAM in fixed-size pages, usually 4 KiB. The CPU's MMU translates addresses using page tables and caches recent translations in the TLB. Pages are populated lazily on first access, which is why programs can reserve far more memory than they use.",
    visuals: [
      {
        type: "flow",
        title: "Translating a virtual address",
        steps: [
          { label: "CPU issues an address", detail: "For example a load from 0x7ffd1234." },
          { label: "TLB lookup", detail: "Hit: physical frame found in a few cycles." },
          { label: "Page table walk", detail: "Miss: the MMU walks the multi-level page table." },
          { label: "Page fault if not present", detail: "Kernel maps or reads in the page, or sends SIGSEGV." },
          { label: "Access physical RAM", detail: "The translation is cached in the TLB." },
        ],
      },
    ],
    keyPoints: [
      "Virtual memory isolates processes and lets the kernel share pages such as libraries.",
      "/proc/PID/maps lists every mapping with its permissions and backing file.",
      "Minor faults map a page already in RAM; major faults need disk I/O.",
      "Linux overcommits memory by default, and when RAM runs out the OOM killer picks a victim.",
      "RSS is resident memory; VSZ is the total mapped virtual size.",
    ],
    terms: [
      { term: "Page", meaning: "Fixed-size unit of memory, usually 4 KiB." },
      { term: "Page table", meaning: "Per-process structure mapping virtual to physical pages." },
      { term: "MMU", meaning: "CPU unit that translates virtual addresses." },
      { term: "TLB", meaning: "Cache of recent address translations." },
      { term: "Page fault", meaning: "Trap raised when an accessed page is not mapped." },
      { term: "OOM killer", meaning: "Kernel mechanism that kills a process when memory is exhausted." },
    ],
    example: {
      lang: "bash",
      code: "cat /proc/self/maps\ngrep -E \"VmSize|VmRSS\" /proc/self/status\ngetconf PAGESIZE\ncat /proc/sys/vm/overcommit_memory\n/usr/bin/time -v ls 2>&1 | grep -i fault",
      caption: "Inspect mappings, sizes, page size and fault counts.",
    },
    check: [
      { q: "What happens on the first write to a freshly allocated large block?", a: "A page fault, after which the kernel maps a physical page." },
      { q: "What is the difference between RSS and VSZ?", a: "RSS is memory actually resident in RAM; VSZ is everything mapped." },
    ],
  },

  "lsp-memory/mmap": {
    summary:
      "mmap maps a file or anonymous memory straight into your address space, so you access it with pointers instead of read and write. Shared file mappings write changes back to the file and are visible to other processes, while private mappings are copy-on-write. Large allocations, shared libraries and many databases rely on mmap.",
    visuals: [
      {
        type: "compare",
        title: "Mapping types",
        columns: [
          { title: "MAP_SHARED file", points: ["Changes written back to the file", "Visible to other mappers", "Flush explicitly with msync", "Used for shared data and databases"] },
          { title: "MAP_PRIVATE file", points: ["Copy-on-write; changes stay private", "The file is never modified", "Used to load executables and libraries", "Cheap for read-only scanning"] },
          { title: "Anonymous", points: ["Not backed by a file", "Zero-filled pages", "Used by malloc for large blocks", "Shared anonymous memory survives fork"] },
        ],
      },
    ],
    keyPoints: [
      "mmap returns MAP_FAILED, not NULL, on error.",
      "Lengths are rounded up to whole pages.",
      "Touching pages beyond the end of a mapped file can raise SIGBUS.",
      "mprotect changes permissions on mapped pages, for example to create guard pages.",
    ],
    terms: [
      { term: "mmap", meaning: "Maps files or memory into the address space." },
      { term: "munmap", meaning: "Removes a mapping." },
      { term: "MAP_PRIVATE", meaning: "Copy-on-write mapping whose changes are not shared." },
      { term: "MAP_ANONYMOUS", meaning: "Mapping not backed by any file." },
      { term: "msync", meaning: "Flushes changes in a shared mapping to the file." },
      { term: "SIGBUS", meaning: "Signal for accessing a mapped page with no backing data." },
    ],
    example: {
      lang: "c",
      code: "#include <fcntl.h>\n#include <stdio.h>\n#include <sys/mman.h>\n#include <sys/stat.h>\n#include <unistd.h>\nint main(int argc, char **argv) {\n  int fd = open(argv[1], O_RDONLY); struct stat st;\n  if (fd < 0 || fstat(fd, &st) < 0 || st.st_size == 0) return 1;\n  char *p = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd, 0);\n  if (p == MAP_FAILED) { perror(\"mmap\"); return 1; }\n  long lines = 0;\n  for (off_t i = 0; i < st.st_size; i++) lines += p[i] == '\\n';\n  printf(\"%ld lines\\n\", lines);\n  munmap(p, st.st_size); close(fd); return 0;\n}",
      caption: "Count lines by scanning a mapped file like an array: a tiny wc -l.",
    },
    check: [
      { q: "What does mmap return on failure?", a: "MAP_FAILED, which is (void *)-1." },
      { q: "How do MAP_SHARED and MAP_PRIVATE differ for writes?", a: "Shared writes reach the file and other mappers; private writes are copy-on-write and stay local." },
    ],
  },

  "lsp-memory/malloc-internals": {
    summary:
      "malloc is user-space library code that carves memory obtained from the kernel into small blocks. glibc grows the heap with brk for small requests and calls mmap directly for large ones, 128 KiB and up by default. Freed blocks go into bins and caches for reuse, which is why an overflow or double free corrupts state far from the bug.",
    visuals: [
      {
        type: "tree",
        title: "Where a glibc malloc call gets memory",
        root: "malloc(n)",
        children: [
          { label: "Small request", children: ["Per-thread cache (tcache)", "Bins of freed chunks", "Split from the top of the heap"] },
          { label: "Heap grows", children: ["brk moves the program break up"] },
          { label: "Large request (about 128 KiB or more)", children: ["Direct mmap", "Returned to the kernel on free"] },
          { label: "Every chunk", children: ["Header with size and flags", "User data right after the header"] },
        ],
      },
    ],
    keyPoints: [
      "malloc and free are library code; only brk and mmap are system calls.",
      "Each block has a hidden header storing its size, so free needs no length.",
      "Fragmentation can leave memory unusable even when plenty is free in total.",
      "glibc uses several arenas to reduce lock contention between threads.",
      "LD_PRELOAD lets you swap in another allocator without recompiling.",
    ],
    terms: [
      { term: "Program break", meaning: "End of the heap segment, moved by brk and sbrk." },
      { term: "Chunk", meaning: "Allocator block: a header plus user data." },
      { term: "Free list", meaning: "Linked list of freed blocks available for reuse." },
      { term: "Bin", meaning: "glibc free list grouped by chunk size." },
      { term: "Arena", meaning: "Independent heap region used by a subset of threads." },
      { term: "Fragmentation", meaning: "Free memory split into pieces too small to use." },
    ],
    example: {
      lang: "c",
      code: "#include <stddef.h>\n#include <unistd.h>\n\ntypedef struct hdr { size_t size; struct hdr *next; } hdr;\nstatic hdr *free_list;\n\nvoid *my_malloc(size_t n) {\n  n = (n + 15) & ~(size_t)15;                      // 16-byte alignment\n  for (hdr **pp = &free_list; *pp; pp = &(*pp)->next)\n    if ((*pp)->size >= n) { hdr *h = *pp; *pp = h->next; return h + 1; }\n  hdr *h = sbrk(sizeof(hdr) + n);                   // grow the heap\n  if (h == (void *)-1) return NULL;\n  h->size = n; return h + 1;\n}\nvoid my_free(void *p) { if (p) { hdr *h = (hdr *)p - 1; h->next = free_list; free_list = h; } }",
      caption: "A first-fit free-list allocator (single-threaded, never splits or merges blocks).",
    },
    pitfalls: [
      "Writing past a block's end and corrupting the next chunk's header.",
      "Mixing allocators, such as passing mmap memory to free.",
    ],
    check: [
      { q: "Which system calls does glibc malloc use to get memory?", a: "brk to grow the heap and mmap for large blocks." },
      { q: "Why does free not need a size argument?", a: "The size is stored in a header just before the returned pointer." },
    ],
  },

  // ───────────── Network sockets ─────────────
  "lsp-networking/socket-basics": {
    summary:
      "A socket is a descriptor for a network endpoint, created with socket and then bound, connected or set to listen. Addresses are described by structs such as sockaddr_in and sockaddr_in6, and multi-byte numbers on the wire use big-endian network byte order. getaddrinfo resolves names and fills those structs for IPv4 and IPv6 alike.",
    visuals: [
      {
        type: "flow",
        title: "Socket call order",
        steps: [
          { label: "socket", detail: "Create an endpoint, such as AF_INET6 and SOCK_STREAM." },
          { label: "bind", detail: "Server attaches to a local address and port." },
          { label: "listen", detail: "Server marks it passive with a backlog queue." },
          { label: "accept or connect", detail: "Server takes a connection; client connects." },
          { label: "send and recv", detail: "Exchange bytes on the connected socket." },
          { label: "close", detail: "Release the descriptor and end the connection." },
        ],
      },
    ],
    keyPoints: [
      "Use getaddrinfo instead of hand-filling sockaddr structs or calling gethostbyname.",
      "Convert ports with htons and ntohs, and text addresses with inet_pton and inet_ntop.",
      "Loop over all getaddrinfo results until one connects.",
      "Binding ports below 1024 needs root or CAP_NET_BIND_SERVICE.",
    ],
    terms: [
      { term: "Socket", meaning: "Descriptor representing one communication endpoint." },
      { term: "sockaddr_in", meaning: "IPv4 address and port structure." },
      { term: "Network byte order", meaning: "Big-endian byte order used in protocol headers." },
      { term: "getaddrinfo", meaning: "Resolves a host and service into socket addresses." },
      { term: "Port", meaning: "16-bit number identifying a service on a host." },
      { term: "Backlog", meaning: "Queue length for connections waiting to be accepted." },
    ],
    example: {
      lang: "c",
      code: "#include <netdb.h>\n#include <stdio.h>\n#include <sys/socket.h>\n#include <unistd.h>\nint main(void) {\n  struct addrinfo hints = { .ai_family = AF_UNSPEC, .ai_socktype = SOCK_STREAM }, *res, *r;\n  int err = getaddrinfo(\"example.com\", \"80\", &hints, &res), fd = -1;\n  if (err) { fprintf(stderr, \"%s\\n\", gai_strerror(err)); return 1; }\n  for (r = res; r; r = r->ai_next) {\n    fd = socket(r->ai_family, r->ai_socktype, r->ai_protocol);\n    if (fd >= 0 && connect(fd, r->ai_addr, r->ai_addrlen) == 0) break;\n    if (fd >= 0) close(fd); fd = -1;\n  }\n  freeaddrinfo(res); puts(fd >= 0 ? \"connected\" : \"failed\"); return fd < 0;\n}",
      caption: "Protocol-independent client connect, the pattern from Beej's guide.",
    },
    check: [
      { q: "Why call htons on a port number?", a: "To convert it from host byte order to big-endian network byte order." },
      { q: "Why loop over the getaddrinfo results?", a: "A name can resolve to several addresses, such as IPv6 and IPv4, and some may be unreachable." },
    ],
  },

  "lsp-networking/tcp-server": {
    summary:
      "TCP provides a reliable, ordered byte stream between two endpoints, set up with a three-way handshake. A server binds, listens and accepts connections, getting a new descriptor per client. Because TCP is a stream, your protocol must define message boundaries, for example with newlines or length prefixes.",
    visuals: [
      {
        type: "sequence",
        title: "TCP connection lifecycle",
        actors: ["Client", "Server"],
        messages: [
          { from: 0, to: 1, label: "SYN (client calls connect)" },
          { from: 1, to: 0, label: "SYN-ACK" },
          { from: 0, to: 1, label: "ACK (connection queued for accept)" },
          { from: 0, to: 1, label: "Data: request bytes" },
          { from: 1, to: 0, label: "Data: response bytes" },
          { from: 0, to: 1, label: "FIN (client closes)" },
          { from: 1, to: 0, label: "ACK, then FIN when the server closes" },
        ],
      },
    ],
    keyPoints: [
      "Set SO_REUSEADDR before bind so restarts do not fail with EADDRINUSE.",
      "accept returns a new connected socket; the listening socket keeps listening.",
      "recv returning 0 means the peer closed the connection.",
      "One send can arrive as several recvs and vice versa, so frame your messages.",
      "Ignore SIGPIPE or use MSG_NOSIGNAL so writing to a closed peer returns EPIPE.",
    ],
    terms: [
      { term: "Three-way handshake", meaning: "SYN, SYN-ACK, ACK exchange that opens a connection." },
      { term: "Listening socket", meaning: "Socket that only accepts new connections." },
      { term: "Connected socket", meaning: "Per-client socket returned by accept." },
      { term: "SO_REUSEADDR", meaning: "Option allowing bind while old connections sit in TIME_WAIT." },
      { term: "TIME_WAIT", meaning: "State held after closing to absorb late packets." },
      { term: "Framing", meaning: "Marking where each message starts and ends in a stream." },
    ],
    example: {
      lang: "c",
      code: "#include <netinet/in.h>\n#include <sys/socket.h>\n#include <unistd.h>\nint main(void) {\n  int s = socket(AF_INET, SOCK_STREAM, 0), one = 1;\n  setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &one, sizeof one);\n  struct sockaddr_in a = { .sin_family = AF_INET, .sin_port = htons(7000), .sin_addr.s_addr = htonl(INADDR_ANY) };\n  if (bind(s, (struct sockaddr *)&a, sizeof a) < 0 || listen(s, 64) < 0) return 1;\n  for (;;) {\n    int c = accept(s, NULL, NULL);\n    char buf[1024]; ssize_t n;\n    while ((n = recv(c, buf, sizeof buf, 0)) > 0) send(c, buf, n, 0);\n    close(c);\n  }\n}",
      caption: "Iterative echo server on port 7000; test with nc localhost 7000.",
    },
    check: [
      { q: "What does recv returning 0 mean?", a: "The peer performed an orderly shutdown." },
      { q: "Why does a TCP protocol need framing?", a: "TCP is a byte stream with no message boundaries." },
    ],
  },

  "lsp-networking/udp": {
    summary:
      "UDP sends independent datagrams with no connection, no ordering and no delivery guarantee. Each sendto is one datagram and each recvfrom returns exactly one, so message boundaries are preserved. It suits DNS, games, streaming and metrics, where low latency matters more than perfect reliability.",
    visuals: [
      {
        type: "compare",
        title: "TCP vs UDP",
        columns: [
          { title: "TCP", points: ["Connection set up by a handshake", "Reliable, ordered byte stream", "Flow and congestion control", "Used by HTTP, SSH and databases"] },
          { title: "UDP", points: ["No connection, just datagrams", "May be lost, duplicated or reordered", "Message boundaries preserved", "Used by DNS, QUIC, VoIP and games"] },
        ],
      },
    ],
    keyPoints: [
      "One sendto is one datagram; recvfrom with a too-small buffer truncates it.",
      "Keep datagrams under about 1200 to 1400 bytes to avoid IP fragmentation.",
      "Add your own timeouts, retries and sequence numbers if you need reliability.",
      "connect on a UDP socket just sets a default peer and filters incoming packets.",
    ],
    terms: [
      { term: "Datagram", meaning: "Self-contained packet delivered as one unit, or not at all." },
      { term: "sendto", meaning: "Sends a datagram to a given address." },
      { term: "recvfrom", meaning: "Receives one datagram and reports the sender." },
      { term: "MTU", meaning: "Largest packet size a network link carries." },
      { term: "SO_RCVTIMEO", meaning: "Socket option setting a receive timeout." },
    ],
    example: {
      lang: "c",
      code: "#include <netinet/in.h>\n#include <sys/socket.h>\n\nint main(void) {\n  int s = socket(AF_INET, SOCK_DGRAM, 0);\n  struct sockaddr_in a = { .sin_family = AF_INET, .sin_port = htons(9000), .sin_addr.s_addr = htonl(INADDR_ANY) };\n  if (bind(s, (struct sockaddr *)&a, sizeof a) < 0) return 1;\n  for (;;) {\n    char buf[1500]; struct sockaddr_in peer; socklen_t len = sizeof peer;\n    ssize_t n = recvfrom(s, buf, sizeof buf, 0, (struct sockaddr *)&peer, &len);\n    if (n > 0) sendto(s, buf, n, 0, (struct sockaddr *)&peer, len);   // echo back\n  }\n}",
      caption: "UDP echo server; test with nc -u localhost 9000.",
    },
    check: [
      { q: "Does UDP preserve message boundaries?", a: "Yes, each recvfrom returns exactly one datagram." },
      { q: "Why keep UDP datagrams small?", a: "To avoid IP fragmentation, which increases loss." },
    ],
  },

  "lsp-networking/io-multiplexing": {
    summary:
      "A server handling many clients cannot block on one socket while others wait. select, poll and epoll let one thread wait for readiness on many descriptors at once and then service only the ready ones. epoll is the scalable Linux choice because its cost depends on active descriptors, not on how many are watched.",
    visuals: [
      {
        type: "compare",
        title: "select vs poll vs epoll",
        columns: [
          { title: "select", points: ["Fixed fd_set, fds below 1024 only", "Sets rebuilt before every call", "Scans every descriptor", "Portable everywhere"] },
          { title: "poll", points: ["Array of pollfd, no fd limit", "Whole list passed on every call", "Still scans every descriptor", "Simple and portable"] },
          { title: "epoll", points: ["Kernel keeps the interest list", "Returns only ready descriptors", "Scales to tens of thousands of connections", "Linux only; level or edge triggered"] },
        ],
      },
    ],
    keyPoints: [
      "Readiness means a call will not block, not that a whole message has arrived.",
      "Level-triggered epoll keeps reporting a ready fd until you drain it; edge-triggered reports only changes.",
      "In edge-triggered mode, use non-blocking descriptors and read until EAGAIN.",
      "Watch the listening socket too; readable means a connection is waiting to be accepted.",
    ],
    terms: [
      { term: "Readiness", meaning: "State where a read or write would not block." },
      { term: "fd_set", meaning: "Bitmap of descriptors used by select." },
      { term: "pollfd", meaning: "Struct with a descriptor, requested events and returned events." },
      { term: "epoll_ctl", meaning: "Adds, modifies or removes a descriptor in an epoll set." },
      { term: "epoll_wait", meaning: "Blocks until watched descriptors are ready." },
      { term: "Edge-triggered", meaning: "Notifies only when readiness changes." },
    ],
    example: {
      lang: "c",
      code: "int ep = epoll_create1(EPOLL_CLOEXEC);\nstruct epoll_event ev = { .events = EPOLLIN, .data.fd = listen_fd }, evs[64];\nepoll_ctl(ep, EPOLL_CTL_ADD, listen_fd, &ev);\nfor (;;) {\n  int n = epoll_wait(ep, evs, 64, -1);\n  for (int i = 0; i < n; i++) {\n    int fd = evs[i].data.fd;\n    if (fd == listen_fd) {\n      int c = accept4(listen_fd, NULL, NULL, SOCK_NONBLOCK);\n      struct epoll_event cev = { .events = EPOLLIN, .data.fd = c };\n      epoll_ctl(ep, EPOLL_CTL_ADD, c, &cev);\n    } else if (handle_client(fd) <= 0) { close(fd); }\n  }\n}",
      caption: "Core of an epoll server; handle_client reads, replies and returns 0 on disconnect.",
    },
    pitfalls: [
      "Using select with descriptors numbered 1024 or higher.",
      "Not draining an edge-triggered descriptor and never being notified again.",
    ],
    check: [
      { q: "Why does epoll scale better than poll?", a: "The kernel keeps the interest list and returns only ready descriptors, so idle connections cost nothing per call." },
      { q: "What must you do with edge-triggered epoll?", a: "Use non-blocking descriptors and read or write until EAGAIN." },
    ],
  },

  "lsp-networking/event-loops": {
    summary:
      "An event loop is a single thread that waits for readiness, runs a short non-blocking handler for each ready descriptor and goes back to waiting. Because handlers must never block, every connection keeps its own read buffer, write buffer and state. nginx, Redis and Node.js are built this way.",
    visuals: [
      {
        type: "cycle",
        title: "One turn of the event loop",
        steps: [
          { label: "Wait", detail: "epoll_wait with a timeout set by the next timer." },
          { label: "Dispatch", detail: "Call the handler for each ready descriptor." },
          { label: "Read until EAGAIN", detail: "Append to the input buffer and parse complete messages." },
          { label: "Write what fits", detail: "Keep the rest and watch EPOLLOUT." },
          { label: "Run timers", detail: "Expire idle connections and periodic tasks." },
        ],
      },
    ],
    keyPoints: [
      "EAGAIN or EWOULDBLOCK means try again later, not an error.",
      "Only enable EPOLLOUT interest while output is pending, or the loop spins.",
      "Any blocking call, such as a DNS lookup or sleep, stalls every connection.",
      "Run one loop per core, or hand CPU-heavy work to a thread pool.",
    ],
    terms: [
      { term: "Event loop", meaning: "Loop that waits for events and dispatches handlers." },
      { term: "Non-blocking I/O", meaning: "Calls return immediately with EAGAIN instead of waiting." },
      { term: "EAGAIN", meaning: "Error meaning the operation would block right now." },
      { term: "Back-pressure", meaning: "Slowing input when output cannot keep up." },
      { term: "Reactor pattern", meaning: "Design where one demultiplexer dispatches ready events to handlers." },
    ],
    example: {
      lang: "c",
      code: "#include <errno.h>\n#include <fcntl.h>\n#include <unistd.h>\nint set_nonblocking(int fd) {\n  int flags = fcntl(fd, F_GETFL, 0);\n  return flags < 0 ? -1 : fcntl(fd, F_SETFL, flags | O_NONBLOCK);\n}\nint drain(int fd, char *buf, size_t cap, size_t *len) {   // 0 EOF, -1 error, 1 drained\n  for (;;) {\n    ssize_t n = read(fd, buf + *len, cap - *len);\n    if (n > 0) { *len += n; if (*len == cap) return 1; continue; }\n    if (n == 0) return 0;\n    return (errno == EAGAIN || errno == EWOULDBLOCK) ? 1 : -1;\n  }\n}",
      caption: "Helpers every event-loop server needs.",
    },
    check: [
      { q: "What should a handler do when read returns EAGAIN?", a: "Stop reading and return to the loop; new data will trigger another event." },
      { q: "Why is a blocking call dangerous in an event loop?", a: "It stalls the only thread, so every other connection waits too." },
    ],
  },

  // ───────────── Time, timers & daemons ─────────────
  "lsp-time-daemons/time-timers": {
    summary:
      "Linux has several clocks: CLOCK_REALTIME follows wall-clock time and can jump, while CLOCK_MONOTONIC only moves forward and is right for measuring durations. clock_gettime reads them cheaply through the vDSO. timerfd turns timers into descriptors, so periodic work fits neatly into a poll or epoll loop.",
    visuals: [
      {
        type: "compare",
        title: "Which clock to use",
        columns: [
          { title: "CLOCK_REALTIME", points: ["Wall-clock time since 1970", "Jumps when NTP or an admin sets the time", "Use for timestamps and logs", "Same source as time() and gettimeofday()"] },
          { title: "CLOCK_MONOTONIC", points: ["Steadily increasing since boot", "Never jumps backwards", "Use for timeouts and durations", "Does not count time in suspend"] },
          { title: "CLOCK_BOOTTIME", points: ["Like MONOTONIC", "Includes time spent suspended", "Use when sleep time must count", "Linux specific"] },
        ],
      },
    ],
    keyPoints: [
      "Never measure elapsed time with wall-clock time, because it can jump.",
      "nanosleep can return early with EINTR; clock_nanosleep with TIMER_ABSTIME avoids drift.",
      "timerfd_create and timerfd_settime give a descriptor that becomes readable on schedule.",
      "Reading a timerfd returns how many expirations happened since the last read.",
    ],
    terms: [
      { term: "CLOCK_MONOTONIC", meaning: "Clock that never goes backwards." },
      { term: "CLOCK_REALTIME", meaning: "Settable wall-clock time." },
      { term: "clock_gettime", meaning: "Reads a chosen clock into a timespec." },
      { term: "timespec", meaning: "Struct of seconds and nanoseconds." },
      { term: "timerfd", meaning: "Descriptor that delivers timer expirations." },
    ],
    example: {
      lang: "c",
      code: "#include <stdint.h>\n#include <stdio.h>\n#include <sys/timerfd.h>\n#include <time.h>\n#include <unistd.h>\nint main(void) {\n  int tfd = timerfd_create(CLOCK_MONOTONIC, TFD_CLOEXEC);\n  struct itimerspec its = { .it_value = { 1, 0 }, .it_interval = { 0, 500000000 } };\n  timerfd_settime(tfd, 0, &its, NULL);\n  for (int i = 0; i < 5; i++) {\n    uint64_t exp; read(tfd, &exp, sizeof exp);\n    struct timespec now; clock_gettime(CLOCK_MONOTONIC, &now);\n    printf(\"tick %d at %ld.%03ld s\\n\", i, (long)now.tv_sec, now.tv_nsec / 1000000);\n  }\n}",
      caption: "First tick after 1 s, then every 500 ms.",
    },
    check: [
      { q: "Which clock should a timeout use?", a: "CLOCK_MONOTONIC, because it never jumps." },
      { q: "What does a read from a timerfd return?", a: "An 8-byte count of expirations since the last read." },
    ],
  },

  "lsp-time-daemons/daemons": {
    summary:
      "A daemon is a background process with no controlling terminal, such as sshd or cron. The traditional SysV recipe detaches by forking twice, starting a new session, resetting the umask and working directory and redirecting the standard streams. Under systemd most of this is unnecessary, but you will still meet it in older code.",
    visuals: [
      {
        type: "flow",
        title: "Classic double-fork daemon",
        steps: [
          { label: "fork, parent exits", detail: "Child is not a group leader; the shell returns." },
          { label: "setsid", detail: "New session with no controlling terminal." },
          { label: "fork again, parent exits", detail: "Not a session leader, so it can never gain a terminal." },
          { label: "Reset umask and chdir to /", detail: "Control file modes and avoid pinning mounts." },
          { label: "Redirect fds 0, 1 and 2", detail: "Point them at /dev/null or a log." },
          { label: "PID file and syslog", detail: "Let scripts find it; log without a terminal." },
        ],
      },
    ],
    keyPoints: [
      "setsid fails in a process group leader, which is why the first fork comes before it.",
      "The second fork ensures the daemon is not a session leader and cannot acquire a terminal.",
      "Close inherited descriptors and reopen 0, 1 and 2 on /dev/null.",
      "daemon(3) wraps the basic steps, and systemd makes them unnecessary for new services.",
    ],
    terms: [
      { term: "Daemon", meaning: "Long-running background service process." },
      { term: "setsid", meaning: "Creates a new session and detaches from the terminal." },
      { term: "PID file", meaning: "File holding the daemon's PID, often under /run." },
      { term: "syslog", meaning: "Standard logging API and service." },
      { term: "daemon(3)", meaning: "glibc helper that performs a basic daemonization." },
    ],
    example: {
      lang: "c",
      code: "#include <fcntl.h>\n#include <stdlib.h>\n#include <sys/stat.h>\n#include <syslog.h>\n#include <unistd.h>\nint main(void) {\n  if (fork() > 0) exit(0);\n  setsid();\n  if (fork() > 0) exit(0);\n  umask(027); chdir(\"/\");\n  int fd = open(\"/dev/null\", O_RDWR);\n  dup2(fd, 0); dup2(fd, 1); dup2(fd, 2); if (fd > 2) close(fd);\n  openlog(\"mydaemon\", LOG_PID, LOG_DAEMON);\n  for (;;) { syslog(LOG_INFO, \"still alive\"); sleep(60); }\n}",
      caption: "The SysV recipe; error checks omitted for brevity.",
    },
    check: [
      { q: "Why does a daemon call setsid?", a: "To start a new session and detach from the controlling terminal." },
      { q: "Why do new services usually skip daemonizing?", a: "systemd already runs them in the background, captures their output and tracks their PID." },
    ],
  },

  "lsp-time-daemons/systemd-services": {
    summary:
      "systemd starts, supervises and restarts services described by unit files. Modern daemons simply run in the foreground, log to stdout or stderr, and leave backgrounding, journaling, restarts and sandboxing to systemd. Type=notify lets your program tell systemd exactly when it is ready.",
    visuals: [
      {
        type: "sequence",
        title: "Service lifecycle under systemd",
        actors: ["Admin", "systemd", "Your service", "journald"],
        messages: [
          { from: 0, to: 1, label: "systemctl start chatd" },
          { from: 1, to: 2, label: "fork and exec ExecStart inside a cgroup" },
          { from: 2, to: 1, label: "sd_notify READY=1 (Type=notify)" },
          { from: 2, to: 3, label: "stdout and stderr lines become journal entries" },
          { from: 0, to: 1, label: "systemctl reload chatd" },
          { from: 1, to: 2, label: "SIGHUP: re-read configuration" },
          { from: 0, to: 1, label: "systemctl stop chatd" },
          { from: 1, to: 2, label: "SIGTERM, then SIGKILL after the timeout" },
        ],
      },
    ],
    keyPoints: [
      "Do not fork in your program; use Type=simple, exec or notify.",
      "Restart=on-failure with RestartSec gives automatic recovery.",
      "Handle SIGTERM for a clean shutdown within TimeoutStopSec.",
      "Sandboxing options like ProtectSystem=strict, PrivateTmp and NoNewPrivileges cut the attack surface.",
      "systemd-analyze security rates how exposed a unit is.",
    ],
    terms: [
      { term: "Unit file", meaning: "INI-style file describing a service, timer or other unit." },
      { term: "ExecStart", meaning: "Command systemd runs to start the service." },
      { term: "Type=notify", meaning: "Service signals readiness with sd_notify." },
      { term: "Restart=", meaning: "Policy for restarting a service after it exits." },
      { term: "journald", meaning: "systemd's log collector." },
      { term: "cgroup", meaning: "Kernel group that tracks and limits a service's processes." },
    ],
    example: {
      lang: "ini",
      code: "[Unit]\nDescription=Chat server\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nExecStart=/usr/local/bin/chatd --port 7000\nRestart=on-failure\nDynamicUser=yes\nProtectSystem=strict\nNoNewPrivileges=yes\n\n[Install]\nWantedBy=multi-user.target",
      caption: "/etc/systemd/system/chatd.service; enable with systemctl enable --now chatd.",
    },
    check: [
      { q: "Why should a systemd service not daemonize itself?", a: "systemd already supervises it, and forking confuses PID tracking unless Type=forking is used." },
      { q: "Which signal does systemctl stop send first?", a: "SIGTERM, followed by SIGKILL if the service does not exit in time." },
    ],
  },

  // ───────────── Capstone projects ─────────────
  "lsp-capstone/mini-shell": {
    summary:
      "A shell is the perfect capstone for processes, file descriptors and signals. Yours reads a line, splits it into commands, sets up pipes and redirections with dup2, runs each command with fork and exec, and then waits or tracks background jobs. Built-ins like cd must run inside the shell itself, because a child cannot change its parent's directory.",
    visuals: [
      {
        type: "cycle",
        title: "The shell loop",
        steps: [
          { label: "Prompt and read a line" },
          { label: "Parse tokens, pipes and redirections" },
          { label: "Run a built-in or fork children", detail: "cd and exit run inside the shell." },
          { label: "Wire pipes with dup2, then exec", detail: "Each child closes the pipe ends it does not use." },
          { label: "Wait for the foreground job", detail: "Reap finished background jobs too." },
        ],
      },
    ],
    keyPoints: [
      "cd must be a built-in because chdir in a child does not affect the parent.",
      "Close all pipe ends in the parent after forking, or pipelines never finish.",
      "The shell ignores SIGINT itself, while children restore the default action.",
      "Reap background jobs with waitpid(-1, &status, WNOHANG) after SIGCHLD.",
    ],
    terms: [
      { term: "REPL", meaning: "Read, evaluate, print loop." },
      { term: "Built-in", meaning: "Command executed by the shell itself, not a child." },
      { term: "Tokenizer", meaning: "Splits the input line into words and operators." },
      { term: "Redirection", meaning: "Pointing fd 0 or 1 at a file with dup2." },
      { term: "Background job", meaning: "Command run with & that the shell does not wait for." },
    ],
    example: {
      lang: "c",
      code: "for (;;) {\n  char line[1024], *argv[64]; int argc = 0;\n  fputs(\"msh$ \", stdout); fflush(stdout);\n  if (!fgets(line, sizeof line, stdin)) break;\n  for (char *t = strtok(line, \" \\t\\n\"); t && argc < 63; t = strtok(NULL, \" \\t\\n\")) argv[argc++] = t;\n  argv[argc] = NULL;\n  if (argc == 0) continue;\n  if (strcmp(argv[0], \"cd\") == 0) { if (chdir(argc > 1 ? argv[1] : getenv(\"HOME\")) < 0) perror(\"cd\"); continue; }\n  if (strcmp(argv[0], \"exit\") == 0) break;\n  pid_t pid = fork();\n  if (pid == 0) { signal(SIGINT, SIG_DFL); execvp(argv[0], argv); perror(argv[0]); _exit(127); }\n  waitpid(pid, NULL, 0);\n}",
      caption: "The core loop; add pipes, redirection and & on top of it.",
    },
    pitfalls: [
      "Not reaping background jobs, which leaves zombies.",
      "Forgetting to flush the prompt before reading input.",
    ],
    check: [
      { q: "Why must cd be a built-in?", a: "A child's chdir only changes the child's own directory, which vanishes when it exits." },
      { q: "What happens if the shell keeps a pipe's write end open?", a: "The reader never gets EOF, so the pipeline hangs." },
    ],
  },

  "lsp-capstone/chat-server": {
    summary:
      "A chat server ties together sockets, multiplexing, buffering and protocol design. Clients connect over TCP and send newline-terminated lines, and the server broadcasts each complete line to everyone else. The hard parts are partial reads, slow clients whose buffers fill up, and disconnects in the middle of a broadcast.",
    visuals: [
      {
        type: "layers",
        title: "Chat server architecture",
        layers: [
          { label: "Clients", detail: "nc or a small C client, one TCP connection each." },
          { label: "Listening socket", detail: "accept4 with SOCK_NONBLOCK for new clients." },
          { label: "epoll event loop", detail: "One thread waits for readable or writable sockets." },
          { label: "Connection table", detail: "Per-client fd, nickname, input and output buffers." },
          { label: "Protocol handler", detail: "Splits lines, handles /nick and /quit, broadcasts." },
        ],
      },
      {
        type: "flow",
        title: "Handling one incoming message",
        steps: [
          { label: "Socket readable" },
          { label: "Read until EAGAIN" },
          { label: "Extract complete lines" },
          { label: "Queue to other clients", detail: "Append to each output buffer." },
          { label: "Flush on EPOLLOUT", detail: "Drop clients whose buffers overflow." },
        ],
      },
    ],
    keyPoints: [
      "Treat input as a byte stream and only act on complete lines.",
      "Give each client a bounded output buffer and disconnect clients that fall too far behind.",
      "Removing a client during a broadcast loop needs care: mark it, then clean up afterwards.",
      "An alternative design uses a thread per client and a mutex-protected client list.",
    ],
    terms: [
      { term: "Broadcast", meaning: "Sending one message to every connected client." },
      { term: "Line protocol", meaning: "Protocol where each message ends with a newline." },
      { term: "Output buffer", meaning: "Per-client queue of bytes waiting to be sent." },
      { term: "Slow consumer", meaning: "Client that reads more slowly than data arrives." },
      { term: "Load test", meaning: "Running many simulated clients to find limits and bugs." },
    ],
    example: {
      lang: "bash",
      code: "make && ./chatd 7000 &\nfor i in $(seq 1 200); do (echo \"/nick bot$i\"; sleep 30) | nc localhost 7000 > /dev/null & done\nnc localhost 7000          # type messages and watch them broadcast\nss -tn state established \"( sport = :7000 )\" | wc -l\nvalgrind --leak-check=full ./chatd 7000",
      caption: "Load test with 200 netcat clients and count live connections.",
    },
    check: [
      { q: "Why buffer output per client?", a: "A slow client's socket buffer can fill up, and blocking on it would stall everyone else." },
      { q: "Why act only on complete lines?", a: "TCP can split or merge messages, so one read may hold part of a line." },
    ],
  },

  "lsp-capstone/capstone-polish": {
    summary:
      "Working code is not finished code. Run your capstone under sanitizers and valgrind until they report nothing, profile it with perf to see where time goes, and package it as a sandboxed systemd service. A clear README with build, run and test steps makes the project portfolio-ready.",
    visuals: [
      {
        type: "flow",
        title: "Release checklist",
        steps: [
          { label: "Build strictly", detail: "-Wall -Wextra -Werror, plus ASan and TSan builds." },
          { label: "Test", detail: "Scripted clients, edge cases, abrupt disconnects." },
          { label: "Check memory", detail: "valgrind --leak-check=full reports zero leaks." },
          { label: "Profile", detail: "perf record -g and perf report on the hot path." },
          { label: "Ship", detail: "Install the binary and unit file, enable the service." },
        ],
      },
    ],
    keyPoints: [
      "Keep separate debug, sanitizer and release targets in the Makefile.",
      "ASan and TSan cannot be combined in one build, so run them separately.",
      "perf top and perf record -g show which functions burn CPU.",
      "Test failure paths: kill clients, fill buffers and send huge lines.",
    ],
    terms: [
      { term: "-Werror", meaning: "Turns compiler warnings into errors." },
      { term: "perf", meaning: "Linux profiler based on hardware and software events." },
      { term: "Flame graph", meaning: "Visualisation of sampled call stacks." },
      { term: "ThreadSanitizer", meaning: "Detects data races at run time." },
      { term: "Regression test", meaning: "Test that keeps a fixed bug from returning." },
    ],
    example: {
      lang: "bash",
      code: "make CFLAGS=\"-g -O1 -fsanitize=address,undefined\" && ./run-tests.sh\nmake clean && make CFLAGS=\"-g -O1 -fsanitize=thread\" && ./run-tests.sh\nvalgrind --leak-check=full --error-exitcode=1 ./chatd 7000\nperf record -g ./chatd 7000     # generate load, then Ctrl-C\nperf report\nsudo install -m 755 chatd /usr/local/bin/ && sudo systemctl enable --now chatd",
      caption: "Sanitizers, valgrind, profiling, then install as a service.",
    },
    check: [
      { q: "Can you use ASan and TSan in the same binary?", a: "No, build and test with each one separately." },
      { q: "Which tool shows where CPU time goes?", a: "perf, for example perf record -g followed by perf report." },
    ],
  },
};

export default explainers;
