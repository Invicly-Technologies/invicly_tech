import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-files/fd-basics": {
    plain: [
      "When a program wants to use a file, it asks the kernel to open it. The kernel does the hard work and hands back a small number, such as 3. That number is a file descriptor. It works like a ticket at a coat check: you keep the ticket, the kernel keeps the coat, and you show the ticket every time you want something.",
      "Every program starts with three descriptors already open. 0 is standard input, 1 is standard output and 2 is standard error. The shell sets them up before your program runs. That is why ./prog > out.txt works: the shell points descriptor 1 at the file, and your program never knows.",
      "read and write move bytes through a descriptor. They promise at most the amount you ask for, not exactly that amount. A read from the keyboard returns one line. A read from a pipe returns what has arrived so far. Correct code always loops until it has everything.",
      "When you are done, close the descriptor. Each process may only have a limited number open at once, often 1024. A long-running server that forgets to close files will one day fail with \"Too many open files\".",
    ],
    deepDive: [
      {
        heading: "open flags and the mode argument",
        body: "The flags argument mixes three kinds of options. First, exactly one access mode: O_RDONLY, O_WRONLY or O_RDWR. Second, creation flags that only matter while opening: O_CREAT creates a missing file, O_EXCL makes O_CREAT fail if the file exists, O_TRUNC empties an existing file, and O_CLOEXEC closes the descriptor automatically on exec. Third, status flags that stay with the open file, such as O_APPEND and O_NONBLOCK.\n\nThe third argument, the mode, is only used when a file is actually created. The umask then removes bits from it, so 0644 is a common choice. If you pass O_CREAT and forget the mode, open reads whatever happens to be in that argument slot and the file gets random permissions.\n\nOn modern Linux, glibc's open is implemented with the openat system call, so strace shows openat(AT_FDCWD, ...) even though you wrote open.",
        bullets: ["Write-and-replace: O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0644", "Create only if new: O_WRONLY | O_CREAT | O_EXCL, 0600", "Read only: O_RDONLY | O_CLOEXEC (no mode needed)"],
        visual: {
          type: "tree",
          title: "The three groups of open flags",
          root: "open(path, flags, mode)",
          children: [
            { label: "Access mode (pick one)", children: ["O_RDONLY", "O_WRONLY", "O_RDWR"] },
            { label: "Creation flags (used once)", children: ["O_CREAT", "O_EXCL", "O_TRUNC", "O_CLOEXEC"] },
            { label: "Status flags (stay with the file)", children: ["O_APPEND", "O_NONBLOCK", "O_SYNC"] },
            { label: "mode (only with O_CREAT)", children: ["Such as 0644 or 0600", "The umask removes bits"] },
          ],
        },
      },
      {
        heading: "Who shares what: two opens versus one dup",
        body: "Each successful open creates a new open file description in the kernel. It holds the current offset and the status flags. The descriptor number in your process is just a pointer to it.\n\nIf you open the same file twice, you get two descriptions with two independent offsets. Writing through both can overwrite the same bytes. If you dup a descriptor, or fork a child, the copies point to the same description. They share one offset, so writes follow each other instead of colliding. This is why a parent and child that both write to an inherited log file do not overwrite each other.\n\nClosing one copy does not close the others. The description is freed only when the last descriptor that refers to it is closed.",
        visual: {
          type: "compare",
          title: "open() twice vs dup() or fork()",
          columns: [
            { title: "open() the same file twice", points: ["Two open file descriptions", "Each has its own offset", "Writes can overwrite each other", "Flags such as O_APPEND set separately"] },
            { title: "dup() or fork()", points: ["One shared open file description", "One shared offset", "Writes follow one another", "Closing one copy leaves the others open"] },
          ],
        },
      },
      {
        heading: "Short reads, short writes and end of file",
        body: "A short read is normal. A regular file near its end returns only what is left. A terminal in normal mode returns one line when you press Enter. A pipe or socket returns whatever bytes are already there. Only a return value of 0 means end of file.\n\nwrite to a pipe or socket can also be short when the buffer on the other side is full, and a write to a regular file can be short when the disk fills up or a file size limit is reached. If a signal handler runs in the middle of a slow read or write, the call returns the bytes moved so far, or -1 with errno set to EINTR if nothing was moved yet.\n\nSo every robust program has two small loops: read until you have what you need or reach EOF, and write until every byte is out.",
        bullets: ["n > 0: got n bytes, maybe fewer than asked", "n == 0: end of file (or the other side closed)", "n == -1 and errno == EINTR: just try again", "n == -1 otherwise: a real error, report it"],
      },
      {
        heading: "Closing descriptors and the open file limit",
        body: "close can fail too. On network file systems such as NFS, a write error may only be reported at close, so check its return value when you wrote data that matters. On Linux, do not retry close after EINTR: the descriptor is already released, and a retry could close a new file that another thread just opened with the same number.\n\nEach process has a limit on open descriptors, RLIMIT_NOFILE. ulimit -n shows the soft limit, which is often 1024; ulimit -Hn shows the hard limit you may raise it to. systemd services can set LimitNOFILE=. Reaching the per-process limit gives EMFILE; the rarer system-wide limit gives ENFILE.\n\nTo look for leaks, list /proc/PID/fd: each entry is a symlink to the file, pipe or socket behind that number.",
      },
      {
        heading: "stdin, stdout and stderr are just numbers",
        body: "unistd.h names the three standard descriptors STDIN_FILENO (0), STDOUT_FILENO (1) and STDERR_FILENO (2). Nothing in the kernel is special about them. They are simply the first three slots, filled in by whoever started your program.\n\nYour program cannot assume they are a terminal. They might be a file, a pipe or /dev/null. isatty(STDOUT_FILENO) tells you if output goes to a terminal, which is how ls decides whether to print colours and columns.\n\nOne trap: if a program starts with descriptor 1 closed, the next open returns 1, because open always picks the lowest free number. Every later printf then writes into that file. Careful daemons therefore make sure 0, 1 and 2 are open, pointing them at /dev/null if needed, before opening anything else.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "The system calls behind cat in.txt > out.txt",
        actors: ["cat", "Kernel"],
        messages: [
          { from: 0, to: 1, label: "openat(\"in.txt\", O_RDONLY)" },
          { from: 1, to: 0, label: "returns fd 3" },
          { from: 0, to: 1, label: "read(3, buf, 131072)" },
          { from: 1, to: 0, label: "returns 5000, then 0 on the next call (EOF)" },
          { from: 0, to: 1, label: "write(1, buf, 5000): fd 1 is out.txt" },
          { from: 0, to: 1, label: "close(3), then exit" },
        ],
      },
    ],
    examples: [
      {
        title: "Watch short reads happen",
        explanation: "This program reads standard input with a large 64 KiB buffer and reports every read call. Step 1: run it and type a few lines; each read returns one line, including the newline, because the terminal hands over input line by line. Press Ctrl-D to send end of file. Step 2: run ./a.out < /etc/services; now reads return full 65536-byte chunks and a smaller last one. Step 3: run cat /etc/services | ./a.out; chunk sizes now depend on how much cat had written into the pipe at that moment. Same code, three different patterns, and only the loop makes it correct in all of them.",
        code: {
          lang: "c",
          code: String.raw`#include <errno.h>
#include <stdio.h>
#include <unistd.h>
int main(void) {
  char buf[65536];
  ssize_t n;
  long calls = 0, total = 0;
  while ((n = read(STDIN_FILENO, buf, sizeof buf)) != 0) {
    if (n < 0) { if (errno == EINTR) continue; perror("read"); return 1; }
    calls++; total += n;
    fprintf(stderr, "read returned %zd\n", n);
  }
  printf("%ld calls, %ld bytes\n", calls, total);
  return 0;
}`,
        },
      },
      {
        title: "Find a descriptor leak in a running process",
        explanation: "A service starts failing with \"Too many open files\" after running for a day. Step 1: find its PID and count its open descriptors. Step 2: run the count again a few minutes later; if it keeps growing, something is not being closed. Step 3: group the targets to see what leaks: thousands of the same log file or socket type point straight at the bug. Step 4: compare with the limit the process really has, which may differ from your shell's ulimit.",
        code: {
          lang: "bash",
          code: String.raw`PID=$(pgrep -o myservice)
ls /proc/$PID/fd | wc -l                 # how many are open now
grep 'open files' /proc/$PID/limits      # soft and hard limit for this process
ls -l /proc/$PID/fd | awk '{print $NF}' | sed 's/[0-9]*]$//' | sort | uniq -c | sort -rn | head
# e.g. 1012 socket:[   -> a socket is opened per request and never closed
ulimit -n; ulimit -Hn                    # your shell's soft and hard limits`,
        },
      },
    ],
    cheatSheet: [
      "Create or overwrite: open(path, O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0644)",
      "Use exactly one of O_RDONLY, O_WRONLY, O_RDWR; with O_CREAT always pass a mode",
      "read returns >0 bytes, 0 at end of file, or -1 with errno (retry on EINTR)",
      "STDIN_FILENO is 0, STDOUT_FILENO is 1, STDERR_FILENO is 2",
      "ls -l /proc/PID/fd shows every open descriptor and what it points to",
      "EMFILE: this process hit its open file limit; check ulimit -n",
      "On Linux, never retry close() after EINTR; the descriptor is already gone",
      "strace -e trace=openat,read,write,close ./prog shows every descriptor call",
    ],
    quiz: [
      {
        q: "You call open(path, O_WRONLY | O_CREAT) with no third argument and no compiler checks. What permissions does a new file get?",
        options: ["0666 minus the umask", "Always 0644", "Unpredictable bits, read from wherever the missing mode argument would be", "None, open fails with EINVAL"],
        answer: 2,
        why: "open reads the mode argument whether you passed it or not, so the permissions come from leftover data.",
      },
      {
        q: "A program calls close(1) and then opens a log file. Which descriptor number does open return?",
        options: ["3", "1", "0", "-1 with EBADF"],
        answer: 1,
        why: "open always returns the lowest free number, and 1 was just freed.",
      },
      {
        q: "A parent opens a file, forks, and both processes write to the inherited descriptor. What happens to the file offset?",
        options: ["They share one offset, so their writes follow one another", "Each has its own offset, so they overwrite each other", "The child's writes fail with EBADF", "The kernel writes each process to a separate file"],
        answer: 0,
        why: "fork copies the descriptor, and both copies point to one open file description with one offset.",
      },
      {
        q: "You read from a terminal with a 4096-byte buffer. The user types hi and presses Enter. What does read return?",
        options: ["4096, after waiting for more input", "2", "0", "3"],
        answer: 3,
        why: "In normal terminal mode read returns one line: h, i and the newline.",
      },
      {
        q: "open fails with errno EMFILE. What does it mean?",
        options: ["The disk is full", "The file is too large", "The process has reached its open descriptor limit", "The system has run out of memory"],
        answer: 2,
        why: "EMFILE is the per-process RLIMIT_NOFILE limit; ENFILE is the system-wide one.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a program that prints \"hello\" to stdout and \"oops\" to stderr using only write(). Run it as ./a.out > out.txt and explain which text stays on the screen.",
        hint: "Use STDOUT_FILENO and STDERR_FILENO from unistd.h.",
        solution: String.raw`#include <unistd.h>
int main(void) {
  if (write(STDOUT_FILENO, "hello\n", 6) != 6) return 1;
  if (write(STDERR_FILENO, "oops\n", 5) != 5) return 1;
  return 0;
}
/* ./a.out > out.txt: "oops" appears on screen, "hello" goes to out.txt,
   because the shell redirected only descriptor 1. */`,
      },
      {
        level: "medium",
        task: "Write mycat: copy each file named on the command line to stdout, or copy stdin if no names are given. If one file fails, print the error and continue with the next.",
        hint: "Write one function that copies from any descriptor; reuse the write_all loop from the system calls lesson.",
        solution: String.raw`static int cat_fd(int fd) {
  char b[65536]; ssize_t n;
  while ((n = read(fd, b, sizeof b)) != 0) {
    if (n < 0) { if (errno == EINTR) continue; return -1; }
    if (write_all(STDOUT_FILENO, b, (size_t)n) < 0) return -1;
  }
  return 0;
}
/* main: if (argc == 1) return cat_fd(0) < 0;
   for each argv[i]: fd = open(argv[i], O_RDONLY | O_CLOEXEC);
   if (fd < 0) { perror(argv[i]); rc = 1; continue; }
   if (cat_fd(fd) < 0) { perror(argv[i]); rc = 1; } close(fd); */`,
      },
      {
        level: "hard",
        task: "Prove that two open() calls give independent offsets while dup() shares one. Open the same file (at least 10 bytes) twice, dup the first descriptor, read 5 bytes through each of the three, and print each offset.",
        hint: "lseek(fd, 0, SEEK_CUR) returns the current offset without moving it.",
        solution: String.raw`int a = open("f.txt", O_RDONLY), b = open("f.txt", O_RDONLY);
int c = dup(a);
if (a < 0 || b < 0 || c < 0) { perror("open/dup"); return 1; }
char x[5];
if (read(a, x, 5) != 5 || read(c, x, 5) != 5 || read(b, x, 5) != 5) return 1;
printf("a=%ld b=%ld c=%ld\n", (long)lseek(a, 0, SEEK_CUR),
       (long)lseek(b, 0, SEEK_CUR), (long)lseek(c, 0, SEEK_CUR));
/* prints a=10 b=5 c=10: a and c share one open file description */`,
      },
    ],
    faq: [
      { q: "Why does my first open() return 3?", a: "Descriptors 0, 1 and 2 are already taken by stdin, stdout and stderr, and open always returns the lowest free number." },
      { q: "Can two processes use the same descriptor number for different files?", a: "Yes. Descriptor numbers are private to each process, so fd 3 in one program has nothing to do with fd 3 in another." },
      { q: "How do I raise the number of files a process can open?", a: "Run ulimit -n with a higher value (up to the hard limit) before starting the program, or call setrlimit(RLIMIT_NOFILE) in code. For a systemd service, set LimitNOFILE= in the unit file." },
      { q: "Do I need to close files before my program exits?", a: "The kernel closes every descriptor when a process exits. Still close them yourself in long-running programs to avoid leaks, and check close() after writing important data, since some errors are only reported there." },
    ],
  },

  "lsp-files/buffered-io": {
    plain: [
      "Every system call costs much more than an ordinary function call, because the CPU has to switch into the kernel and back. If a program wrote a 1 MB file one byte at a time with write, it would make a million of these trips.",
      "The C library's stdio functions (printf, fputs, fgets, fwrite) solve this with a buffer, a block of memory inside your own process. Small writes are collected there and handed to the kernel in one big write, usually 4096 bytes at a time. Reading works the same way in reverse.",
      "A FILE pointer, such as stdout or what fopen returns, is a small structure that holds a descriptor plus this buffer. fileno(fp) gives you the descriptor inside it.",
      "The buffer brings surprises. Output can appear late. Text from printf and from raw write can come out in the wrong order. Output can be printed twice after fork, or lost if the program crashes. Once you know when the buffer is flushed, all of these make sense.",
    ],
    deepDive: [
      {
        heading: "Where your bytes wait: two different buffers",
        body: "Output passes through two separate buffers before it reaches a disk. The first is the stdio buffer in your process. fflush empties it into the kernel with a write call. If your process crashes before that, the bytes are simply gone.\n\nThe second is the kernel's page cache. After write returns, other processes can already read the data, but it may not be on the disk yet. fsync empties that buffer for one file.\n\nKeeping the two apart clears up a lot of confusion. fflush makes data visible to other programs. fsync makes it survive a power cut. A log that must survive a crash of your program needs fflush. A database commit that must survive a power cut needs fsync too.",
        visual: {
          type: "layers",
          title: "The path of printf output",
          layers: [
            { label: "Your code", detail: "printf, fputs, fwrite" },
            { label: "stdio buffer (your process)", detail: "Lost if the process crashes; fflush empties it" },
            { label: "write() system call", detail: "Data enters the kernel" },
            { label: "Page cache or pipe buffer (kernel)", detail: "Visible to readers now; fsync empties it to disk" },
            { label: "Disk or the reading process", detail: "The final destination" },
          ],
        },
      },
      {
        heading: "How glibc picks the buffering mode",
        body: "When a stream is first used, glibc checks what is behind it. stdout connected to a terminal is line buffered: it flushes at every newline. stdout connected to a file or pipe is fully buffered: it flushes only when the buffer fills. stderr is always unbuffered, so error messages appear at once. glibc sizes the buffer from the file's block size, which is usually 4096 bytes.\n\nglibc also flushes line-buffered output when it must read from the terminal, which is why printf(\"Name: \") without a newline usually shows up before fgets waits. Do not rely on it: call fflush(stdout) after a prompt.\n\nTo choose a mode yourself, call setvbuf(stream, buf, mode, size) with _IOFBF, _IOLBF or _IONBF. It must come before any other operation on that stream. If you pass your own buffer, it must stay valid until the stream is closed, so never pass a local array from a function that returns.",
        bullets: ["Terminal stdout: line buffered", "File or pipe stdout: fully buffered", "stderr: unbuffered", "setvbuf: first call on the stream, or it may be ignored"],
      },
      {
        heading: "Counting system calls with strace -c",
        body: "strace -c runs a program and prints a table of how many times each system call was made and how long they took. It is the quickest way to see what buffering does for you.\n\nWrite one million single characters with write(1, \"x\", 1) and strace -c reports about one million write calls. Write them with putchar into a pipe or file and it reports about 245, because each call moves a full 4096-byte buffer. The run time drops by a large factor too.\n\nThe same trick finds performance bugs in real programs. If a tool makes tens of thousands of tiny reads or writes, it is probably using raw calls on small pieces, or calling fflush far too often. Add -e trace=write to focus on one call, and -f to include child processes.",
      },
      {
        heading: "fork, exit, _exit and lost output",
        body: "The stdio buffer is ordinary memory, so fork copies it. If unflushed text is waiting when you fork, both parent and child own a copy, and both print it when they exit. With a terminal this often goes unnoticed because the newline already flushed the line. With a pipe, every line printed before the fork appears twice. The fix is fflush(NULL) right before fork, which flushes every output stream.\n\nexit and returning from main flush all streams. _exit does not; it goes straight to the kernel. That is exactly why a child that fails to exec must call _exit: it must not flush a copy of the parent's buffer. A crash from a signal such as SIGSEGV also skips the flush, so the last printf lines before a crash are often missing. When debugging a crash, print to stderr, which is unbuffered.",
      },
      {
        heading: "When to use stdio and when to use raw calls",
        body: "Use stdio for text: formatted output, reading line by line with fgets or getline, and many small reads or writes. It is portable, convenient and fast.\n\nUse raw descriptors when you need exact control. That means sockets and pipes watched with poll or epoll, where hidden buffered data would confuse the event loop. It also means large binary blocks, which already make one call each, and cases where you need to know exactly when a write reaches the kernel.\n\nDo not mix stdio and raw write on the same descriptor. If you must, call fflush on the stream before each raw write, or the output will be out of order. For reading this is worse: once stdio has read ahead into its buffer, a raw read on the same descriptor skips the bytes that stdio is holding.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "The three buffering modes",
        columns: [
          { title: "Full (_IOFBF)", points: ["Flushes when the buffer is full", "Default for files and pipes", "Fewest system calls", "Output can appear much later"] },
          { title: "Line (_IOLBF)", points: ["Flushes at each newline", "Default for stdout on a terminal", "Good for interactive programs", "One write call per line"] },
          { title: "None (_IONBF)", points: ["Every call goes straight to write", "Default for stderr", "Output appears immediately", "Slowest for many small writes"] },
        ],
      },
    ],
    examples: [
      {
        title: "Progress messages that vanish in a pipe",
        explanation: "A worker prints one progress line per second. Run directly in a terminal, the lines appear one by one. Run as ./worker | tee run.log, nothing shows for a long time, then everything appears at once. Step 1: understand why: stdout is now a pipe, so it is fully buffered and waits for 4096 bytes. Step 2: fix it in code by switching stdout to line buffering at the very start. Step 3: if you cannot change the code, run stdbuf -oL ./worker | tee run.log, which works for programs that use glibc stdio and do not set their own buffering.",
        code: {
          lang: "c",
          code: String.raw`#include <stdio.h>
#include <unistd.h>
int main(void) {
  /* Must come before any other output on stdout. */
  if (setvbuf(stdout, NULL, _IOLBF, 0) != 0)
    fprintf(stderr, "setvbuf failed\n");
  for (int i = 1; i <= 5; i++) {
    printf("step %d of 5\n", i);
    sleep(1);
  }
  return 0;
}`,
        },
      },
      {
        title: "Measure what buffering saves",
        explanation: "Build two programs that each write one million x characters. Step 1: slow.c calls write once per character. Step 2: fast.c uses putchar, so stdio batches the characters. Step 3: count write calls with strace -c: about 1,000,000 for slow and about 245 for fast (1,000,000 divided by 4096, plus the final partial flush). Step 4: time both; the buffered one is usually dozens of times faster.",
        code: {
          lang: "bash",
          code: String.raw`cat > slow.c <<'EOF'
#include <unistd.h>
int main(void) { for (int i = 0; i < 1000000; i++) if (write(1, "x", 1) != 1) return 1; return 0; }
EOF
cat > fast.c <<'EOF'
#include <stdio.h>
int main(void) { for (int i = 0; i < 1000000; i++) putchar('x'); return 0; }
EOF
gcc -O2 -o slow slow.c && gcc -O2 -o fast fast.c
strace -c -e trace=write ./slow > /dev/null
strace -c -e trace=write ./fast > /dev/null
time ./slow > /dev/null; time ./fast > /dev/null`,
        },
      },
    ],
    cheatSheet: [
      "stdout is line buffered on a terminal and fully buffered into a file or pipe; stderr is unbuffered",
      "setvbuf(stdout, NULL, _IOLBF, 0) as the first call makes stdout line buffered everywhere",
      "Call fflush(stdout) after a prompt that has no newline",
      "fflush(NULL) flushes every output stream; do it right before fork()",
      "fileno(fp) gives the descriptor inside a FILE; fdopen(fd, \"r\") wraps a descriptor in a FILE",
      "stdbuf -oL cmd forces line-buffered stdout for most glibc programs",
      "strace -c -e trace=write ./prog counts the write calls a program makes",
      "exit() flushes stdio buffers; _exit() and crashes do not",
    ],
    quiz: [
      {
        q: "./prog > out.txt prints three lines with printf and then crashes with SIGSEGV. What is most likely in out.txt?",
        options: ["All three lines", "Nothing, because the lines were still in the stdio buffer", "Only the first line", "The three lines plus a core dump"],
        answer: 1,
        why: "Redirected stdout is fully buffered, and a crash skips the flush that exit would do.",
      },
      {
        q: "Which function must be called before any other operation on a stream to be reliable?",
        options: ["setvbuf", "fflush", "fileno", "fclose"],
        answer: 0,
        why: "setvbuf chooses the buffer, so it must run before the stream is first used.",
      },
      {
        q: "A program runs printf(\"A\"); fork(); and both processes then exit normally. What is printed?",
        options: ["A", "Nothing", "A followed by a newline", "AA"],
        answer: 3,
        why: "The unflushed A is copied into the child's buffer, and both processes flush it at exit.",
      },
      {
        q: "strace shows one write call for every printf line while output goes to a terminal. Why?",
        options: ["printf is always unbuffered", "stdout is line buffered on a terminal, so each newline flushes", "strace turns buffering off", "The terminal driver forces it"],
        answer: 1,
        why: "glibc makes stdout line buffered when it is connected to a terminal.",
      },
      {
        q: "You copy a 1 GB file in 64 KiB blocks. Which approach is reasonable?",
        options: ["Only fgetc and fputc are portable enough", "setvbuf with _IONBF to make it faster", "Raw read and write with a large buffer, since each call already moves a big block", "printf with %s"],
        answer: 2,
        why: "Buffering helps with many small calls; with 64 KiB blocks the call count is already low.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the prompt \"Enter your name: \" without a newline, read a line with fgets, and greet the user. Make sure the prompt also appears when stdout is a pipe, as in ./a.out | cat.",
        hint: "A fully buffered stdout holds text without a newline until something flushes it.",
        solution: String.raw`#include <stdio.h>
int main(void) {
  char name[64];
  printf("Enter your name: ");
  fflush(stdout);                  /* show the prompt now */
  if (!fgets(name, sizeof name, stdin)) return 1;
  printf("Hello, %s", name);
  return 0;
}`,
      },
      {
        level: "medium",
        task: "Write a program that calls printf(\"before fork\\n\") and then fork(), with both processes exiting normally. Run it in a terminal and as ./a.out | cat, explain the difference, then fix it.",
        hint: "Think about which buffering mode stdout has in each case.",
        solution: String.raw`#include <stdio.h>
#include <unistd.h>
int main(void) {
  printf("before fork\n");
  fflush(NULL);          /* the fix: without it, a pipe shows the line twice */
  if (fork() < 0) { perror("fork"); return 1; }
  return 0;
}
/* Terminal: line buffered, the newline flushed before fork, so one line.
   Pipe: fully buffered, the line was copied into the child, so two lines. */`,
      },
      {
        level: "hard",
        task: "Write a tiny buffered writer: a struct holding a descriptor, a 4096-byte buffer and a length, plus bw_putc and bw_flush. Use it to write one million characters and confirm with strace -c that only about 245 write calls happen.",
        hint: "bw_putc flushes only when the buffer is full; bw_flush must handle short writes and EINTR.",
        solution: String.raw`struct bw { int fd; size_t len; char buf[4096]; };
static int bw_flush(struct bw *w) {
  size_t off = 0;
  while (off < w->len) {
    ssize_t n = write(w->fd, w->buf + off, w->len - off);
    if (n < 0) { if (errno == EINTR) continue; return -1; }
    off += (size_t)n;
  }
  w->len = 0; return 0; }
static int bw_putc(struct bw *w, char c) {
  if (w->len == sizeof w->buf && bw_flush(w) < 0) return -1;
  w->buf[w->len++] = c; return 0; }
/* Remember a final bw_flush before exit. */`,
      },
    ],
    faq: [
      { q: "Why does my printf output not show up?", a: "It is probably still in the stdio buffer, usually because stdout is a file or pipe and no newline or flush has happened. Call fflush(stdout), end lines with a newline on a terminal, or print diagnostics to stderr." },
      { q: "Is printf thread-safe?", a: "Yes. POSIX requires stdio functions to lock the stream, so the output of one printf call is not mixed with another thread's call. Several separate calls from different threads can still interleave." },
      { q: "Should I use fwrite or write for binary files?", a: "Either works. fwrite is better for many small pieces because it batches them. write is fine for large blocks and gives you exact control over when data reaches the kernel." },
      { q: "What is BUFSIZ?", a: "A constant from stdio.h meant as a good buffer size; it is 8192 in glibc. glibc actually sizes each stream's buffer from the file's block size, which is usually 4096 bytes." },
    ],
  },

  "lsp-files/advanced-io": {
    plain: [
      "Every open file has a position, called the offset. read and write start there and move it forward. lseek moves it anywhere you like, like moving a bookmark. You can even move past the end of the file. If you then write, the gap becomes a hole that reads back as zeros but uses no disk space. A file with holes is called a sparse file.",
      "Descriptors can be copied. dup2(old, new) makes the number new refer to the same open file as old. That one call is the whole trick behind the shell's > and 2>&1.",
      "fcntl is a toolbox for a descriptor you already have. It can switch on non-blocking mode, mark the descriptor to close automatically when you exec another program, and lock parts of a file.",
      "When write returns, your data is usually only in the kernel's memory. A power cut a second later could lose it. fsync waits until the data is really on the disk. Databases and anything that must not lose data rely on it.",
    ],
    deepDive: [
      {
        heading: "lseek, holes and sparse files",
        body: "lseek(fd, offset, whence) sets the offset relative to the start (SEEK_SET), the current position (SEEK_CUR) or the end of the file (SEEK_END), and returns the new position. So lseek(fd, 0, SEEK_CUR) tells you where you are, and lseek(fd, 0, SEEK_END) gives the size. On pipes, sockets and terminals it fails with ESPIPE, because they have no positions.\n\nSeeking past the end and writing leaves a hole. The file's size includes the hole, but no blocks are allocated for it, so ls -l and du disagree. Virtual machine disk images and database files use this all the time. SEEK_DATA and SEEK_HOLE let a program find where the real data is, and GNU cp detects holes by default.\n\npread and pwrite read or write at a given offset without moving the shared offset. Several threads can use them on one descriptor without stepping on each other.",
        bullets: ["ls -l shows the logical size; du shows blocks really used", "truncate -s 10G disk.img makes a sparse file instantly", "On 32-bit builds, compile with -D_FILE_OFFSET_BITS=64 for large files"],
      },
      {
        heading: "dup, dup2 and the order of redirections",
        body: "dup(fd) returns the lowest free number as a copy of fd. dup2(old, new) uses exactly the number you choose: if new is already open, it is closed first, and both steps happen atomically. If old equals new, dup2 does nothing and returns new.\n\nShells apply redirections from left to right, and this explains a classic puzzle. In cmd > out 2>&1, fd 1 is pointed at out first, then fd 2 becomes a copy of fd 1, so both go to the file. In cmd 2>&1 > out, fd 2 copies fd 1 while it is still the terminal, and only then is fd 1 pointed at out, so errors still reach the screen.\n\nTo redirect temporarily inside one program, save the original first with saved = dup(1), redirect, and later restore it with dup2(saved, 1) and close(saved).",
        visual: {
          type: "compare",
          title: "Order matters: two redirections",
          columns: [
            { title: "cmd > out 2>&1", points: ["open out, dup2 it onto fd 1", "dup2(1, 2): fd 2 now also points to out", "Output and errors both go to the file"] },
            { title: "cmd 2>&1 > out", points: ["dup2(1, 2): fd 2 points to the terminal", "open out, dup2 it onto fd 1", "Errors still appear on the terminal"] },
          ],
        },
      },
      {
        heading: "fcntl: descriptor flags and file status flags",
        body: "fcntl manages two different sets of flags, and mixing them up causes bugs. F_GETFD and F_SETFD handle descriptor flags. There is really only one: FD_CLOEXEC. It belongs to that single descriptor number, so a dup copy does not have it.\n\nF_GETFL and F_SETFL handle file status flags such as O_APPEND and O_NONBLOCK. These live in the shared open file description, so they affect every copy made by dup or fork. Setting O_NONBLOCK on a terminal that your shell also uses can confuse the shell after your program exits.\n\nAlways read, change, then write back: fl = fcntl(fd, F_GETFL), then fcntl(fd, F_SETFL, fl | O_NONBLOCK). Setting FD_CLOEXEC after open leaves a short window in which another thread could fork and exec and leak the descriptor. Ask for it at creation instead: O_CLOEXEC, pipe2 with O_CLOEXEC, accept4 with SOCK_CLOEXEC, or F_DUPFD_CLOEXEC.",
      },
      {
        heading: "O_APPEND and O_EXCL: atomic by design",
        body: "Without O_APPEND, appending is two steps: seek to the end, then write. If two processes do this at the same time, both can find the same end and the second write overwrites the first. With O_APPEND, the kernel moves to the end and writes in one atomic step, so lines from several writers never overwrite each other on a local file system. Write each log line with a single write call so it stays in one piece. NFS does not guarantee this.\n\nO_EXCL together with O_CREAT makes open fail with EEXIST if the path already exists, even if it is a symlink. The check and the creation are one atomic step, so exactly one process can win. This is the safe way to create lock files and temporary files; mkstemp uses it for you.",
        visual: {
          type: "sequence",
          title: "The lost write without O_APPEND",
          actors: ["Process A", "log file", "Process B"],
          messages: [
            { from: 0, to: 1, label: "lseek to end: offset 100" },
            { from: 2, to: 1, label: "lseek to end: offset 100" },
            { from: 0, to: 1, label: "write 20 bytes at 100" },
            { from: 2, to: 1, label: "write 20 bytes at 100: A's line is overwritten" },
          ],
        },
      },
      {
        heading: "fsync, fdatasync and what durable means",
        body: "A successful write puts data into the page cache. The kernel writes dirty pages to disk later, typically within about 30 seconds. fsync(fd) blocks until that file's data and metadata are on stable storage and asks the drive to flush its own cache. fdatasync skips metadata that is not needed to read the data back, such as the modification time, so it can be faster. Opening with O_SYNC or O_DSYNC makes every write behave as if followed by one of these calls.\n\nA new file's name lives in its directory, so for full safety you also fsync the directory after creating or renaming a file. If fsync fails with EIO, do not assume a retry fixes it; the dirty pages may already be gone. Careful programs treat that as a serious error.",
        bullets: ["fsync: data plus metadata", "fdatasync: data plus only the metadata needed to read it", "sync: all file systems, mostly for admins"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Replace a config file safely",
        steps: [
          { label: "Write config.tmp", detail: "Open with O_CREAT | O_EXCL, write everything" },
          { label: "fsync the temp file", detail: "Its data is now on disk" },
          { label: "rename to config", detail: "Atomic: readers see old or new, never half" },
          { label: "fsync the directory", detail: "The new name itself survives a crash" },
        ],
      },
      {
        type: "tree",
        title: "What fcntl can do",
        root: "fcntl(fd, cmd, ...)",
        children: [
          { label: "Duplicate", children: ["F_DUPFD", "F_DUPFD_CLOEXEC"] },
          { label: "Descriptor flags", children: ["F_GETFD", "F_SETFD with FD_CLOEXEC"] },
          { label: "File status flags", children: ["F_GETFL", "F_SETFL with O_NONBLOCK or O_APPEND"] },
          { label: "Record locks", children: ["F_SETLK", "F_SETLKW", "F_GETLK", "F_OFD_SETLK (Linux)"] },
          { label: "Pipe size (Linux)", children: ["F_GETPIPE_SZ", "F_SETPIPE_SZ"] },
        ],
      },
    ],
    examples: [
      {
        title: "Make a 1 GiB sparse file",
        explanation: "Step 1: create a file and seek 1 GiB forward without writing anything. Step 2: write a single byte; the file's size is now 1 GiB plus one byte. Step 3: compare ls -l, which shows the logical size, with du -h, which shows the space really used, typically 4.0K for one block. Step 4: run cp sparse.img copy.img and check du again; GNU cp detects the hole and keeps the copy sparse too. The shell command truncate -s 1G file creates a similar file in one step.",
        code: {
          lang: "c",
          code: String.raw`#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
int main(void) {
  int fd = open("sparse.img", O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0644);
  if (fd < 0) { perror("open"); return 1; }
  if (lseek(fd, (off_t)1 << 30, SEEK_SET) == (off_t)-1) { perror("lseek"); return 1; }
  if (write(fd, "!", 1) != 1) { perror("write"); return 1; }
  if (close(fd) < 0) { perror("close"); return 1; }
  return 0;
}
/* ls -l sparse.img : 1073741825 bytes
   du -h sparse.img : 4.0K (only one block is really used) */`,
        },
      },
      {
        title: "Capture output temporarily, then restore stdout",
        explanation: "Sometimes you want one part of a program's output in a file and the rest on screen, for example to capture what a library function prints. Step 1: flush stdout and save a copy of fd 1 with dup. Step 2: open the file and dup2 it onto fd 1. Step 3: print, then flush again; otherwise the text could still be in the stdio buffer when you switch back, and land on the terminal. Step 4: dup2 the saved copy back onto fd 1 and close the spare descriptor.",
        code: {
          lang: "c",
          code: String.raw`#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
int main(void) {
  fflush(stdout);
  int saved = dup(STDOUT_FILENO);
  int fd = open("captured.txt", O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0644);
  if (saved < 0 || fd < 0) { perror("dup/open"); return 1; }
  if (dup2(fd, STDOUT_FILENO) < 0) { perror("dup2"); return 1; }
  close(fd);
  printf("this line goes to captured.txt\n");
  fflush(stdout);                          /* push it out before switching back */
  if (dup2(saved, STDOUT_FILENO) < 0) { perror("dup2"); return 1; }
  close(saved);
  printf("this line goes to the terminal\n");
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "lseek(fd, 0, SEEK_CUR) gives the current offset; lseek(fd, 0, SEEK_END) gives the size",
      "pread and pwrite use an explicit offset and do not move the shared file offset",
      "cmd > out 2>&1 sends both streams to out; cmd 2>&1 > out does not",
      "fl = fcntl(fd, F_GETFL); fcntl(fd, F_SETFL, fl | O_NONBLOCK) turns on non-blocking mode",
      "Prefer O_CLOEXEC, pipe2(O_CLOEXEC) and accept4(SOCK_CLOEXEC) over setting FD_CLOEXEC later",
      "open(path, O_WRONLY | O_CREAT | O_EXCL, 0600) fails with EEXIST if the file already exists",
      "Write a temp file, fsync it, rename it, then fsync the directory: a durable replace",
      "du -h smaller than ls -lh means a sparse file; truncate -s 1G f makes one",
    ],
    quiz: [
      {
        q: "What does lseek return when called on a pipe?",
        options: ["0", "The number of bytes waiting in the pipe", "-1 with errno ESPIPE", "The pipe's capacity"],
        answer: 2,
        why: "Pipes have no file positions, so seeking is not allowed.",
      },
      {
        q: "Which of these belongs to one descriptor number and is not shared with dup copies?",
        options: ["FD_CLOEXEC", "O_NONBLOCK", "O_APPEND", "The file offset"],
        answer: 0,
        why: "FD_CLOEXEC is a descriptor flag; the others live in the shared open file description.",
      },
      {
        q: "Two processes append lines to one log through separate open() calls without O_APPEND. What can go wrong?",
        options: ["Nothing, the kernel orders the writes", "Each write fails with EAGAIN", "The log becomes a sparse file", "Lines can overwrite each other, because each process has its own offset"],
        answer: 3,
        why: "Seeking to the end and writing are two steps, so both processes can write at the same old end.",
      },
      {
        q: "write() on a local file just returned success. Where is the data?",
        options: ["Guaranteed on the disk", "At least in the kernel's page cache, but maybe not on disk yet", "Only in the stdio buffer", "Nowhere until another process reads it"],
        answer: 1,
        why: "The kernel writes dirty pages later; only fsync guarantees they reached stable storage.",
      },
      {
        q: "You run cmd 2>&1 > out.txt. Where do the error messages go?",
        options: ["To out.txt", "Nowhere", "To the terminal, the old stdout", "To both"],
        answer: 2,
        why: "fd 2 copied fd 1 while it still pointed at the terminal; fd 1 was redirected afterwards.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the size of a file given on the command line using only open and lseek.",
        hint: "Seeking to the end returns the new offset, which is the size.",
        solution: String.raw`#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
int main(int argc, char **argv) {
  if (argc != 2) return 2;
  int fd = open(argv[1], O_RDONLY | O_CLOEXEC);
  if (fd < 0) { perror(argv[1]); return 1; }
  off_t size = lseek(fd, 0, SEEK_END);
  if (size == (off_t)-1) { perror("lseek"); return 1; }
  printf("%lld bytes\n", (long long)size);
  return close(fd) < 0;
}`,
      },
      {
        level: "medium",
        task: "Write int set_nonblock(int fd) that turns on O_NONBLOCK without clearing any other flags. Test it on the read end of an empty pipe: read should fail with EAGAIN instead of blocking.",
        hint: "Read the current flags with F_GETFL, add one bit, write them back with F_SETFL.",
        solution: String.raw`#include <fcntl.h>
int set_nonblock(int fd) {
  int fl = fcntl(fd, F_GETFL);
  if (fl == -1) return -1;
  return fcntl(fd, F_SETFL, fl | O_NONBLOCK) == -1 ? -1 : 0;
}
/* test: int p[2]; pipe(p); set_nonblock(p[0]);
   char c; read(p[0], &c, 1) returns -1 and errno == EAGAIN */`,
      },
      {
        level: "hard",
        task: "Make sure only one copy of your program runs: create /tmp/myapp.lock only if it does not exist, write your PID into it, and exit with a message if it already exists. Remove it when you finish.",
        hint: "O_CREAT | O_EXCL makes the check and the creation one atomic step.",
        solution: String.raw`char buf[32];
int fd = open("/tmp/myapp.lock", O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC, 0644);
if (fd < 0) {
  if (errno == EEXIST) { fprintf(stderr, "already running\n"); return 1; }
  perror("open"); return 1;
}
int len = snprintf(buf, sizeof buf, "%ld\n", (long)getpid());
if (write(fd, buf, (size_t)len) != len || fsync(fd) < 0) { perror("write"); return 1; }
/* ... do the work ... */
close(fd); unlink("/tmp/myapp.lock");
/* A crash leaves a stale file; flock(fd, LOCK_EX | LOCK_NB) avoids that problem. */`,
      },
    ],
    faq: [
      { q: "What is the difference between dup and dup2?", a: "dup returns the lowest free descriptor number as a copy. dup2 lets you choose the number, closing it first if it is already open, which is what redirection needs." },
      { q: "Does O_APPEND keep whole lines together?", a: "On a local file system, the data of each single write call is placed at the end in one piece. So write each line with one call; separate calls from different processes can still interleave between lines." },
      { q: "What is the difference between fsync and sync?", a: "fsync flushes one file and waits until it is on disk. sync asks the kernel to flush all file systems, which is mostly useful for administrators; syncfs flushes the one file system that holds a given descriptor." },
      { q: "Why did my sparse file grow to full size after copying it?", a: "The copying tool wrote the zeros out as real data. Use cp --sparse=always, rsync --sparse, or tar with --sparse to keep the holes." },
    ],
  },

  "lsp-files/inodes-links": {
    plain: [
      "A file has two parts: its name and its body. The body is the inode, a record with a number that stores the owner, permissions, size, timestamps and where the data blocks are on disk. The name lives somewhere else, in a directory. A directory is just a list of pairs: name and inode number.",
      "Because the name is separate, one inode can have several names. Each name is a hard link, and the inode keeps a count of them. rm does not really delete a file; it removes one name. The data is freed only when no names are left and no program still has the file open.",
      "A symbolic link (symlink) is different. It is a tiny file of its own whose content is a path, like a sticky note saying \"look over there\". Every time you open it, the kernel follows the path. If the target is moved or deleted, the symlink points at nothing.",
      "This matters in practice: disk space that is not freed after rm, \"No space left on device\" on a disk that is half empty, and safe deployments that switch versions by changing one symlink.",
    ],
    deepDive: [
      {
        heading: "What stat tells you",
        body: "stat(path, &st) fills a struct stat with the inode's metadata. lstat does the same but reports on a symlink itself instead of following it. fstat works on an open descriptor, and fstatat works relative to a directory descriptor.\n\nThe pair st_dev and st_ino identifies a file uniquely on the whole system: same device, same inode number, same file. cp uses this to refuse copying a file onto itself. st_mode holds both the file type and the permissions; test the type with S_ISREG, S_ISDIR or S_ISLNK. st_blocks counts 512-byte units, whatever the file system's block size, so blocks times 512 gives the real space used.\n\nThere are three classic timestamps. atime is the last read, mtime the last change to the content, and ctime the last change to the inode itself, including chmod or chown. ctime is not the creation time. Linux reports creation (birth) time through statx, and stat on the command line shows it as Birth when the file system stores it, as ext4 and xfs do.",
        visual: {
          type: "tree",
          title: "The main fields of struct stat",
          root: "struct stat",
          children: [
            { label: "Identity", children: ["st_dev: which file system", "st_ino: inode number"] },
            { label: "Type and permissions", children: ["st_mode", "Test with S_ISREG, S_ISDIR, S_ISLNK"] },
            { label: "Owner", children: ["st_uid", "st_gid"] },
            { label: "Size", children: ["st_size: bytes", "st_blocks: 512-byte units used"] },
            { label: "Links", children: ["st_nlink: number of names"] },
            { label: "Times", children: ["st_atim: read", "st_mtim: content changed", "st_ctim: inode changed"] },
          ],
        },
      },
      {
        heading: "Link counts and when data is really freed",
        body: "link (the ln command) adds a name and increases st_nlink. unlink (rm) removes a name and decreases it. The kernel frees the inode and its blocks only when two things are both true: the link count is zero, and no process has the file open or mapped. That is why deleting a huge log that a service still writes to frees nothing until the service closes it or restarts.\n\nPrograms use this on purpose. Create a temporary file, unlink it right away, and keep using the descriptor: the file has no name, nobody else can open it, and it disappears automatically when the program exits, even after a crash. Linux's O_TMPFILE creates such a file without ever giving it a name.\n\nOn ext4 and xfs a directory's link count is 2 plus the number of subdirectories: its own name, its . entry, and the .. of each child. rename within one file system is atomic; across file systems it fails with EXDEV, and mv falls back to copy and delete.",
        visual: {
          type: "flow",
          title: "Life of an inode",
          steps: [
            { label: "Create a.txt", detail: "Link count 1" },
            { label: "ln a.txt b.txt", detail: "Link count 2, same inode" },
            { label: "rm a.txt", detail: "Link count 1; b.txt still works" },
            { label: "rm b.txt while open", detail: "Count 0, but readable through the fd" },
            { label: "Last close", detail: "Now the blocks are freed" },
          ],
        },
      },
      {
        heading: "Symlinks in depth",
        body: "A symlink stores a path as text. A relative target is resolved from the directory that contains the link, not from your current directory, which surprises many people. readlink returns that stored text but does not add a terminating NUL byte, so you must add it yourself.\n\nThe kernel follows at most 40 symlinks while resolving one path and then fails with ELOOP, which stops loops. On Linux a symlink's own permissions are always shown as lrwxrwxrwx and are ignored; the target's permissions are what count.\n\nSymlinks are popular for deployments: current points to releases/v41, and switching versions means pointing it at releases/v42. To make the switch atomic, create the new link under a temporary name and rename it over the old one, which mv -T does. Recent GNU ln -sfn also uses a temporary name, but older and non-GNU versions remove the old link first, leaving a moment with no link at all.",
        bullets: ["readlink -f path: resolve every link to the final path", "O_NOFOLLOW makes open fail on a symlink", "fs.protected_symlinks blocks some /tmp symlink attacks"],
      },
      {
        heading: "Inodes on ext4 and xfs",
        body: "ext4 creates its inode table when the file system is made. By default mke2fs creates one inode for every 16 KiB of space, and that number never changes afterwards. A disk full of tiny files, such as a mail spool or a cache, can run out of inodes while df -h still shows plenty of free space. New files then fail with ENOSPC. df -i shows inode usage, and the fix is to delete files or recreate the file system with mkfs.ext4 -i or -N.\n\nxfs allocates inodes dynamically as needed, up to a configurable share of the space, so it rarely runs out. Default inode sizes are 256 bytes on ext4 and 512 bytes on xfs. Small symlink targets and tiny directories can be stored right inside the inode, which saves a disk read.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Hard link vs symbolic link",
        columns: [
          { title: "Hard link", points: ["Another name for the same inode", "Must stay on the same file system", "Cannot point to a directory", "Keeps working after the other name is removed"] },
          { title: "Symbolic link", points: ["Its own small inode holding a path", "Can cross file systems and point to directories", "Breaks (dangles) if the target is removed", "Resolved again on every open"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why is the disk still full after rm?",
        explanation: "A 500 MB log was deleted, but df shows no free space gained. Step 1: reproduce it with a big file that tail keeps open. Step 2: lsof +L1 lists open files whose link count is 0, the deleted-but-open ones. Step 3: /proc/PID/fd shows the same file marked (deleted). Step 4: free the space either by restarting the process or by truncating the file through its descriptor, which empties it without needing the process to cooperate. Check the descriptor number first; it is not always 3.",
        code: {
          lang: "bash",
          code: String.raw`dd if=/dev/zero of=big.log bs=1M count=500
tail -f big.log > /dev/null &      # keeps the file open
rm big.log
df -h .                            # the space is NOT freed yet
lsof +L1 | grep big.log            # NLINK column shows 0
ls -l /proc/$!/fd | grep deleted   # e.g. 3 -> /home/ana/big.log (deleted)
: > /proc/$!/fd/3                  # truncate it through the open descriptor
kill %1                            # or stop the process: blocks are freed`,
        },
      },
      {
        title: "Switch a release atomically with a symlink",
        explanation: "Your web server serves files from current, a symlink. Step 1: point current at the first release. Step 2: to deploy v2, create a second symlink with a temporary name. Step 3: rename it over current with mv -T; rename is atomic, so every request sees either v1 or v2, never a missing path. Step 4: roll back the same way by pointing a new temporary link at v1.",
        code: {
          lang: "bash",
          code: String.raw`mkdir -p releases/v1 releases/v2
ln -s releases/v1 current
ls -l current                    # current -> releases/v1
ln -s releases/v2 current.new
mv -T current.new current        # one rename(2): atomic switch
readlink current                 # releases/v2`,
        },
      },
    ],
    cheatSheet: [
      "stat -c '%i %h %s %b %n' f prints inode, link count, size and 512-byte blocks",
      "ls -li shows inode numbers; the same number on one file system means hard links",
      "find /home -xdev -samefile f finds every hard link to f",
      "df -i shows free inodes; IUse 100% means no new files even with free space",
      "lsof +L1 lists files that were deleted but are still open",
      "readlink -f path resolves every symlink to the final absolute path",
      "mv -T current.new current replaces a symlink atomically",
      "st_blocks counts 512-byte units, not file system blocks",
    ],
    quiz: [
      {
        q: "You run chmod on a file. Which timestamp changes?",
        options: ["mtime only", "atime", "ctime", "None of them"],
        answer: 2,
        why: "chmod changes the inode, not the content, and ctime records inode changes.",
      },
      {
        q: "A directory on ext4 has a link count of 5. How many subdirectories does it have?",
        options: ["5", "3", "2", "You cannot tell"],
        answer: 1,
        why: "Its name and its . entry give 2, and each subdirectory's .. adds one.",
      },
      {
        q: "Which call reports on a symlink itself rather than its target?",
        options: ["lstat", "stat", "fstat", "readdir"],
        answer: 0,
        why: "lstat does not follow the final symlink in the path.",
      },
      {
        q: "df -h shows 40% free, but creating a file fails with \"No space left on device\". What is the most likely cause?",
        options: ["The disk is mounted read-only", "A permission problem in disguise", "Too many hard links to one file", "The file system has run out of inodes"],
        answer: 3,
        why: "ext4 has a fixed number of inodes; df -i would show 100% use.",
      },
      {
        q: "readlink() returned 11 for a link. What must your code do with the buffer?",
        options: ["Nothing, it is already a C string", "Add the terminating NUL byte yourself, since readlink does not", "Call free on it", "Call lstat first or the result is invalid"],
        answer: 1,
        why: "readlink copies exactly the link's bytes and does not terminate the string.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a file, give it a second hard link and a symlink, and show the inode numbers and link counts. Then remove the original name and explain what still works.",
        hint: "ls -li and stat -c '%i %h %n' show inodes and link counts.",
        solution: String.raw`echo data > a.txt
ln a.txt b.txt; ln -s a.txt c.txt
ls -li a.txt b.txt c.txt         # a and b share an inode; c has its own
stat -c '%i %h %n' a.txt         # link count 2
rm a.txt
cat b.txt                        # works: the inode still has one name
cat c.txt                        # fails: c.txt points to the name a.txt`,
      },
      {
        level: "medium",
        task: "Write mystat: for each path on the command line, print its type (file, dir, symlink or other), inode number, link count and size. Do not follow symlinks.",
        hint: "Use lstat and the S_ISREG, S_ISDIR and S_ISLNK macros.",
        solution: String.raw`#include <stdio.h>
#include <sys/stat.h>
int main(int argc, char **argv) {
  for (int i = 1; i < argc; i++) {
    struct stat st;
    if (lstat(argv[i], &st) < 0) { perror(argv[i]); continue; }
    const char *t = S_ISREG(st.st_mode) ? "file" : S_ISDIR(st.st_mode) ? "dir"
                  : S_ISLNK(st.st_mode) ? "symlink" : "other";
    printf("%s: %s inode=%lu links=%lu size=%lld\n", argv[i], t, (unsigned long)st.st_ino,
           (unsigned long)st.st_nlink, (long long)st.st_size);
  }
  return 0;
}`,
      },
      {
        level: "hard",
        task: "Create a temporary file with mkstemp, unlink it at once, write 1 MiB into it, and use fstat to show it has 0 links but real blocks. Explain when the space is freed.",
        hint: "st_nlink and st_blocks come from fstat on the descriptor.",
        solution: String.raw`char tmpl[] = "/tmp/scratchXXXXXX";
int fd = mkstemp(tmpl);
if (fd < 0) { perror("mkstemp"); return 1; }
unlink(tmpl);                               /* name gone, inode alive */
static char buf[1 << 20];
if (write(fd, buf, sizeof buf) != (ssize_t)sizeof buf) { perror("write"); return 1; }
struct stat st;
if (fstat(fd, &st) == 0)
  printf("links=%lu blocks=%lld\n", (unsigned long)st.st_nlink, (long long)st.st_blocks);
close(fd);                                  /* last reference: blocks are freed now */
/* Linux alternative: open("/tmp", O_TMPFILE | O_RDWR, 0600) never has a name. */`,
      },
    ],
    faq: [
      { q: "What happens if I delete a file a program is still using?", a: "Only the name disappears. The program keeps reading and writing normally, and the space is freed when it closes the file or exits." },
      { q: "Can I create a hard link to a directory?", a: "No. Linux refuses with EPERM, because directory hard links could create loops in the tree. Use a symlink or a bind mount instead." },
      { q: "Does a symlink have its own permissions?", a: "On Linux it always shows lrwxrwxrwx, and those bits are ignored. Access is decided by the permissions of the target and of the directories on the way." },
      { q: "How do I find all hard links to a file?", a: "Run find on the same file system with -samefile file or -inum followed by the inode number. Hard links can never be on another file system, so -xdev keeps the search short." },
    ],
  },

  "lsp-files/vfs-mounts": {
    plain: [
      "Linux supports dozens of file systems: ext4 and xfs on disks, NFS over the network, tmpfs in memory, and more. Your program does not care which one it is talking to. The Virtual File System (VFS) is a common front desk: every request comes in through the same open, read and write, and the VFS passes it to the right driver.",
      "There is only one directory tree, starting at /. Mounting attaches a whole file system to a directory in that tree. A USB stick might appear at /media/usb, and /tmp might be a RAM disk. If you mount over a directory that already has files, they are hidden until you unmount.",
      "Some file systems have no disk at all. /proc and /sys are made up by the kernel on the spot. Reading /proc/meminfo is really asking the kernel a question, and the answer is written for you at the moment you read.",
      "Many tools work this way. ps, top and free simply read files in /proc. Once you know where to look, you can get the same information from a script or a C program.",
    ],
    deepDive: [
      {
        heading: "The four VFS objects and path lookup",
        body: "The VFS works with four kinds of objects. A superblock represents one mounted file system. An inode represents one file. A dentry (directory entry) links a name to an inode, and the kernel keeps recently used dentries in a cache so repeated lookups are fast. A file object is an open file, holding the offset and flags. Each file system driver supplies tables of functions, such as how to read a page or look up a name, and the VFS calls them.\n\nTo open /srv/app/conf.ini, the kernel walks the path one name at a time. At each directory it checks that you have search (x) permission, looks up the next name in the dentry cache or asks the driver, and notices when a directory is a mount point so it continues in the mounted file system. At the end it creates a file object and returns a descriptor.",
        visual: {
          type: "flow",
          title: "Path lookup for /srv/app/conf.ini",
          steps: [
            { label: "Start at /", detail: "The process's root directory" },
            { label: "Look up srv", detail: "Check x on /, use the dentry cache" },
            { label: "Cross a mount", detail: "If /srv is a mount point, continue in that file system" },
            { label: "Look up app, then conf.ini", detail: "Check x on each directory" },
            { label: "Open the inode", detail: "Check r on the file, create a file object, return an fd" },
          ],
        },
      },
      {
        heading: "Reading the mount table",
        body: "/proc/self/mounts lists what the reading process can see, one mount per line: device, mount point, type, options and two zeros, the same format as /etc/fstab. /etc/mtab is normally just a symlink to it. /proc/self/mountinfo adds more detail: a mount ID, the parent mount, the device numbers and how mount events propagate between namespaces.\n\nThe list is per process because of mount namespaces. A container has its own namespace and sees its own set of mounts. findmnt shows the table as a tree, and findmnt -T path tells you which mount holds a given path. In C, getmntent from mntent.h parses the format for you.\n\nWatch the options column. ro means read-only. nosuid ignores setuid bits, nodev ignores device files, and noexec refuses to run programs from that file system. relatime, the usual default, updates access times only occasionally to save writes.",
        bullets: ["findmnt -t ext4,xfs lists only real disk file systems", "findmnt -T . shows the mount holding your current directory", "mount -o remount,ro /data changes options in place"],
      },
      {
        heading: "/proc/PID: a live view of each process",
        body: "Every process has a directory /proc/PID, and /proc/self always points to the reader's own. status gives human-readable details. cmdline and environ hold NUL-separated strings, and environ is readable only by the owner or root. exe and cwd are symlinks to the program file and the working directory. fd lists open descriptors, and fdinfo gives each one's offset and flags. maps shows the memory layout, limits the resource limits, and io the bytes read and written.\n\nThese files show size 0 in ls, yet return text when read, because the content is generated during the read. Read until end of file and never trust st_size. A process can exit while you are reading its directory, so tools must handle ENOENT and ESRCH. Some files, such as maps and environ, need ptrace-level access to another user's process, and a hidepid mount option can hide other users' processes entirely.",
        visual: {
          type: "tree",
          title: "Useful entries in /proc/PID",
          root: "/proc/1234",
          children: [
            { label: "Identity", children: ["status", "cmdline", "exe (symlink to the program)"] },
            { label: "Files", children: ["fd/", "fdinfo/", "cwd (symlink)"] },
            { label: "Memory", children: ["maps", "smaps_rollup", "VmRSS in status"] },
            { label: "Limits and accounting", children: ["limits", "io", "stat"] },
            { label: "Threads", children: ["task/ (one directory per thread)"] },
          ],
        },
      },
      {
        heading: "/proc/sys and /sys: looking at and tuning the kernel",
        body: "/proc/sys holds the kernel settings that sysctl manages. The setting net.ipv4.ip_forward is the file /proc/sys/net/ipv4/ip_forward, so sysctl -w net.ipv4.ip_forward=1 and writing 1 into that file as root do the same thing. Changes are lost at reboot; to keep them, put a line in a file under /etc/sysctl.d/.\n\n/sys is sysfs, a view of devices and drivers. /sys/block/DEV/queue/scheduler shows and sets a disk's I/O scheduler, /sys/class/net/IFACE/statistics/ holds live network counters, and /sys/fs/cgroup is the cgroup v2 tree that systemd and containers use to limit CPU and memory. sysfs follows the rule of one value per file, which makes it easy to read from scripts. Writing usually needs root.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three kinds of file system",
        columns: [
          { title: "Disk (ext4, xfs)", points: ["Data stored on a block device", "Survives reboots", "Cached in the page cache", "Mounted from /etc/fstab or systemd"] },
          { title: "Memory (tmpfs)", points: ["Data in RAM, can be swapped", "Lost at reboot", "Size limit set with size=", "Used for /dev/shm, /run, often /tmp"] },
          { title: "Pseudo (proc, sysfs)", points: ["Nothing is stored at all", "Content made by the kernel at read time", "Files often show size 0", "Some files accept writes to change settings"] },
        ],
      },
    ],
    examples: [
      {
        title: "List read-only mounts from C",
        explanation: "A backup tool should warn when its target is mounted read-only. Step 1: open the mount table with setmntent, which returns a normal FILE. Step 2: loop with getmntent; each call returns one parsed line with fields like mnt_dir and mnt_type. Step 3: hasmntopt checks for a whole option name, so ro matches ro but not errors=remount-ro. Step 4: close the table with endmntent.",
        code: {
          lang: "c",
          code: String.raw`#include <mntent.h>
#include <stdio.h>
int main(void) {
  FILE *f = setmntent("/proc/self/mounts", "r");
  if (!f) { perror("setmntent"); return 1; }
  struct mntent *m;
  while ((m = getmntent(f)) != NULL)
    if (hasmntopt(m, "ro"))
      printf("%-30s %-10s read-only\n", m->mnt_dir, m->mnt_type);
  endmntent(f);
  return 0;
}`,
        },
      },
      {
        title: "Inspect a running process through /proc",
        explanation: "Someone asks what an sshd process is really doing. Step 1: find the oldest matching PID. Step 2: print its full command line; arguments are separated by NUL bytes, so tr turns them into spaces. Step 3: read the state, parent, thread count and memory from status. Step 4: see which program file and directory it uses. Step 5: count open descriptors and compare with its limit. Step 6: as root, see how many bytes it has read and written.",
        code: {
          lang: "bash",
          code: String.raw`pid=$(pgrep -o sshd)
tr '\0' ' ' < /proc/$pid/cmdline; echo
grep -E '^(State|PPid|Threads|VmRSS)' /proc/$pid/status
sudo readlink /proc/$pid/exe /proc/$pid/cwd
sudo ls /proc/$pid/fd | wc -l
grep 'open files' /proc/$pid/limits
sudo cat /proc/$pid/io`,
        },
      },
    ],
    cheatSheet: [
      "findmnt -T /some/path shows which mount holds that path",
      "/proc/self/mountinfo shows mount IDs, parents and propagation flags",
      "mount -o remount,ro /mnt/data changes mount options without unmounting",
      "sudo mount --bind /src /dst makes a directory visible in a second place",
      "tr '\\0' ' ' < /proc/PID/cmdline prints a process's full command line",
      "sysctl net.ipv4.ip_forward reads /proc/sys/net/ipv4/ip_forward",
      "Files in /proc show size 0: read until end of file instead of trusting st_size",
      "Persistent kernel settings go in a file under /etc/sysctl.d/",
    ],
    quiz: [
      {
        q: "Which VFS object caches the link between a name and an inode?",
        options: ["The superblock", "The dentry", "The file object", "The page"],
        answer: 1,
        why: "Dentries map path components to inodes and are kept in the dentry cache.",
      },
      {
        q: "Why is the mount list read from /proc/self/mounts rather than one global file?",
        options: ["It is faster", "Only root may read the global list", "It shows only mounts made by the reader", "Processes can be in different mount namespaces and see different mounts"],
        answer: 3,
        why: "Containers and some services have their own mount namespace with their own mounts.",
      },
      {
        q: "ls -l /proc/self/status shows a size of 0. What happens when you cat it?",
        options: ["Nothing, the file is empty", "Permission denied", "You get the current status text, generated during the read", "The read fails with EIO"],
        answer: 2,
        why: "procfs creates the content when it is read; the size field means nothing here.",
      },
      {
        q: "How do you make net.ipv4.ip_forward=1 survive a reboot?",
        options: ["Put the line in a file under /etc/sysctl.d/", "echo 1 > /proc/sys/net/ipv4/ip_forward", "Write it into /sys/class/net", "Remount /proc with a new option"],
        answer: 0,
        why: "Files in /etc/sysctl.d are applied at every boot; writing /proc/sys lasts only until reboot.",
      },
      {
        q: "You mount a USB disk on /data, which already contained files. What happens to those files?",
        options: ["They are deleted", "They are merged with the disk's files", "They are copied onto the disk", "They are hidden until you unmount"],
        answer: 3,
        why: "The mount covers the directory; the old files are untouched underneath.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show your shell's state, parent PID and number of open descriptors using only files in /proc.",
        hint: "$$ is your shell's PID.",
        solution: String.raw`grep -E '^(State|PPid)' /proc/$$/status
ls /proc/$$/fd | wc -l
ls -l /proc/$$/fd          # 0, 1, 2 point to your terminal, e.g. /dev/pts/0`,
      },
      {
        level: "medium",
        task: "Write a C program that prints its own resident memory (the VmRSS line) from /proc/self/status.",
        hint: "Read line by line with fgets and compare the start of each line.",
        solution: String.raw`#include <stdio.h>
#include <string.h>
int main(void) {
  FILE *f = fopen("/proc/self/status", "r");
  if (!f) { perror("fopen"); return 1; }
  char line[256];
  while (fgets(line, sizeof line, f))
    if (strncmp(line, "VmRSS:", 6) == 0) fputs(line, stdout);
  fclose(f);
  return 0;
}`,
      },
      {
        level: "hard",
        task: "Write a tiny ps: list each numeric directory in /proc and print the PID, state letter and command name from /proc/PID/stat. Skip processes that exit while you read.",
        hint: "The name is in parentheses and may contain spaces, so find the last ')'; the state follows it after one space.",
        solution: String.raw`DIR *d = opendir("/proc"); struct dirent *e;
char path[300], buf[512];
while (d && (e = readdir(d)) != NULL) {
  if (e->d_name[0] < '1' || e->d_name[0] > '9') continue;     /* PIDs only */
  snprintf(path, sizeof path, "/proc/%s/stat", e->d_name);
  FILE *f = fopen(path, "r");
  if (!f) continue;                                         /* it already exited */
  char *l = fgets(buf, sizeof buf, f) ? strchr(buf, '(') : NULL, *r = l ? strrchr(l, ')') : NULL;
  if (r) printf("%6s %c %.*s\n", e->d_name, r[2], (int)(r - l - 1), l + 1);
  fclose(f);
}
if (d) closedir(d);`,
      },
    ],
    faq: [
      { q: "Is /proc stored on the disk?", a: "No. procfs has no storage at all; every file's content is produced by the kernel when you read it." },
      { q: "What is the difference between /proc and /sys?", a: "/proc started as process information and also holds many kernel details and the sysctl settings in /proc/sys. /sys is the newer, more structured view of devices, drivers and kernel objects, with one value per file." },
      { q: "Why does /etc/mtab point to /proc/self/mounts?", a: "The kernel already knows the exact mount table for each process, so a symlink is always correct. A separately written file could fall out of date or differ between namespaces." },
      { q: "What is a bind mount?", a: "A bind mount makes an existing directory appear at a second path, for example mount --bind /srv/data /var/www/data. Containers use bind mounts to share host directories." },
    ],
  },

  "lsp-files/directories-perms": {
    plain: [
      "A directory is a special file whose content is a list of names, each with an inode number. You cannot read it with read(); that fails with EISDIR. Instead you use opendir and readdir, which hand you one entry at a time.",
      "Every file and directory has an owner, a group and permission bits for three classes: the owner, the group, and everyone else. The kernel picks exactly one class for you, the first that matches, and uses only those bits.",
      "When your program creates a file, it asks for a mode such as 0666. The umask, a per-process setting inherited from the parent, then removes bits. With the usual umask 022, you get 0644: you can write, others can only read.",
      "Later you can change the mode with chmod, or fchmod on an open descriptor. Only the file's owner (or root) may do that. Knowing these rules lets your program create files that are exactly as private or as shared as you intend.",
    ],
    deepDive: [
      {
        heading: "How readdir really works",
        body: "opendir opens the directory and allocates a buffer. readdir then calls the getdents64 system call, which fills that buffer with many entries at once, and hands them out one by one with no further system calls. strace on ls shows only a few getdents64 calls even for a large directory.\n\nEntries are not sorted. Their order depends on the file system; on ext4 it follows a hash of the names. Sort them yourself if you need order. The d_type field tells you whether an entry is a file, directory or symlink without an extra stat call, but some file systems return DT_UNKNOWN, so be ready to fall back to lstat or fstatat.\n\nreaddir returns NULL both at the end and on error. To tell them apart, set errno to 0 before each call and check it afterwards. Files created or deleted while you iterate may or may not show up.",
        visual: {
          type: "sequence",
          title: "readdir hides the real system calls",
          actors: ["Your code", "glibc", "Kernel"],
          messages: [
            { from: 0, to: 1, label: "opendir(\"logs\")" },
            { from: 1, to: 2, label: "openat(\"logs\", O_DIRECTORY)" },
            { from: 0, to: 1, label: "first readdir()" },
            { from: 1, to: 2, label: "getdents64(fd, buf, size): many entries at once" },
            { from: 0, to: 1, label: "next readdir() calls: served from the buffer" },
            { from: 1, to: 2, label: "getdents64 returns 0: readdir returns NULL" },
          ],
        },
      },
      {
        heading: "Directory permissions in practice",
        body: "On a directory, r lets you list the names, x lets you use a name inside it (open, stat or enter), and w lets you create, delete or rename entries, which also needs x. These combine in useful ways. Mode 0711 on a home directory lets others reach a file whose name they know, such as public_html, without being able to list anything. With r but no x, ls shows the names but question marks for everything else, because it cannot stat the entries.\n\nTo open a file, you need x on every directory on the path, plus the right bit on the file itself. When a deep path gives \"Permission denied\", namei -l shows the permissions of each step so you can find the one that blocks you.\n\nDeleting a file depends only on the directory, not on the file's own bits. The sticky bit (mode 1000, as on /tmp) adds a rule: only the file's owner, the directory's owner or root may delete it.",
        visual: {
          type: "flow",
          title: "Can I read /srv/app/conf/db.ini?",
          steps: [
            { label: "x on /", detail: "May use names in the root directory" },
            { label: "x on /srv", detail: "May use the name app" },
            { label: "x on /srv/app", detail: "May use the name conf" },
            { label: "x on /srv/app/conf", detail: "May use the name db.ini" },
            { label: "r on db.ini", detail: "May read the content: open succeeds" },
          ],
        },
      },
      {
        heading: "umask in code",
        body: "umask(mask) sets the process's mask and returns the old one; there is no call that only reads it. The common trick is old = umask(0); umask(old). On Linux 4.7 and later you can also read the Umask: line in /proc/self/status. Because the umask is shared by every thread in the process, changing it in a multithreaded program affects the other threads too.\n\nThe umask applies whenever something is created: open with O_CREAT, mkdir, mkfifo, mknod, and binding a Unix socket to a path. It does not apply to chmod or fchmod, which set exactly the bits you give. A default ACL on the parent directory takes the place of the umask for new files inside it.\n\nThe usual convention is to ask for 0666 for files and 0777 for directories and let the user's umask decide. For secrets such as keys and tokens, ask for 0600 directly, because the umask can only remove bits, never add them. A systemd service can set its mask with UMask= in the unit file.",
      },
      {
        heading: "chmod, fchmod and avoiding races",
        body: "chmod(path, mode) changes the file found at a path. fchmod(fd, mode) changes the file you already have open, and fchmodat works relative to a directory descriptor. Prefer the descriptor versions when the path might change between steps, because an attacker could swap the path for a symlink between your check and your chmod.\n\nThe classic mistake is creating a secret file with 0644 and calling chmod 0600 afterwards. For a short moment anyone can open it, and an open descriptor stays valid after the chmod. Create it with the right mode from the start.\n\nOnly the owner or a process with CAP_FOWNER (normally root) can change a mode. Two quiet rules surprise people: if you are not a member of the file's group, chmod silently clears the setgid bit you asked for, and changing a file's owner clears setuid and setgid bits on executables.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "The umask arithmetic",
        steps: [
          { label: "Requested 0666", detail: "rw-rw-rw- from open(..., O_CREAT, 0666)" },
          { label: "umask 0027", detail: "Remove write for group, everything for others" },
          { label: "0666 & ~0027", detail: "Bitwise AND with the inverted mask" },
          { label: "Result 0640", detail: "rw-r----- (a directory from 0777 gets 0750)" },
        ],
      },
      {
        type: "compare",
        title: "Ways to walk a directory tree",
        columns: [
          { title: "opendir and readdir", points: ["One level at a time", "You write the recursion", "Full control over order and errors"] },
          { title: "nftw", points: ["Calls your function for every entry", "FTW_PHYS: do not follow symlinks", "FTW_DEPTH: children before parents, good for deleting"] },
          { title: "fts", points: ["Iterator style: you pull the next entry", "Used by GNU tools such as rm, du and chmod", "Can skip or revisit entries"] },
        ],
      },
    ],
    examples: [
      {
        title: "A simple du with nftw",
        explanation: "You want the disk space used under a directory. Step 1: nftw walks the whole tree and calls add for each entry, passing a struct stat it already filled in. Step 2: FTW_PHYS stops it from following symlinks, so a link to / cannot send it across the whole disk. Step 3: for each regular file, add st_blocks times 512, the real space used. Step 4: return 0 to keep walking; any other value stops the walk. Unlike real du, this counts a file with two hard links twice.",
        code: {
          lang: "c",
          code: String.raw`#define _XOPEN_SOURCE 700
#include <ftw.h>
#include <stdio.h>
#include <sys/stat.h>
static long long total;
static int add(const char *path, const struct stat *st, int type, struct FTW *f) {
  (void)path; (void)f;
  if (type == FTW_F) total += (long long)st->st_blocks * 512;
  return 0;                        /* keep walking */
}
int main(int argc, char **argv) {
  if (nftw(argc > 1 ? argv[1] : ".", add, 32, FTW_PHYS) == -1) { perror("nftw"); return 1; }
  printf("%lld bytes on disk\n", total);
  return 0;
}`,
        },
      },
      {
        title: "Create a private file the right way",
        explanation: "A program stores an API token. Step 1: create the file with mode 0600 in the same open call, and O_EXCL so you never reuse a file someone else prepared. Step 2: check the result with fstat on the descriptor; whatever the umask, 0600 stays 0600 because the umask can only remove bits. Step 3: write the secret. The wrong version, creating with 0644 and calling chmod afterwards, leaves a window in which another user can open the file and keep the descriptor.",
        code: {
          lang: "c",
          code: String.raw`#include <fcntl.h>
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>
int main(void) {
  int fd = open("token.txt", O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC, 0600);
  if (fd < 0) { perror("open"); return 1; }
  struct stat st;
  if (fstat(fd, &st) < 0) { perror("fstat"); return 1; }
  printf("mode %04o\n", (unsigned)(st.st_mode & 07777));   /* 0600 */
  if (write(fd, "s3cret\n", 7) != 7) { perror("write"); return 1; }
  return close(fd) < 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "Set errno = 0 before readdir; NULL with errno still 0 means the end of the directory",
      "d_type can be DT_UNKNOWN on some file systems; fall back to lstat or fstatat",
      "On a directory: x = may use names inside, r = may list them, w + x = may add or remove",
      "namei -l /path/to/file shows the permissions of every directory on the way",
      "old = umask(0); umask(old); reads the umask, or see Umask: in /proc/self/status",
      "Create secrets with open(..., O_CREAT | O_EXCL, 0600), never chmod them afterwards",
      "fchmod(fd, 0640) changes the open file itself, immune to path swaps",
      "nftw(dir, fn, 16, FTW_PHYS | FTW_DEPTH) visits children before parents, good for deleting",
    ],
    quiz: [
      {
        q: "A directory has mode 0711 (rwx--x--x). What can another user do?",
        options: ["List its files", "Open a file inside if they know its name and the file allows it", "Create new files in it", "Nothing at all"],
        answer: 1,
        why: "x without r allows using known names but not listing them.",
      },
      {
        q: "With umask 077, what mode does mkdir(path, 0777) produce?",
        options: ["0700", "0777", "0755", "0077"],
        answer: 0,
        why: "0777 with the group and other bits removed leaves 0700.",
      },
      {
        q: "readdir returned NULL. How do you tell the end of the directory from an error?",
        options: ["Check d_type", "Call closedir and look at its result", "Set errno to 0 before the call and check whether it changed", "You cannot; errors are impossible"],
        answer: 2,
        why: "readdir leaves errno untouched at the end and sets it on error.",
      },
      {
        q: "Which of these is not affected by the umask?",
        options: ["open with O_CREAT", "mkdir", "mkfifo", "chmod"],
        answer: 3,
        why: "chmod sets exactly the bits you pass; the umask only applies when creating.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Check your umask, predict the modes of a new file and a new directory, then create both and confirm with stat.",
        hint: "Files start from 0666 and directories from 0777 before the umask removes bits.",
        solution: String.raw`umask                       # e.g. 0022
touch f; mkdir d
stat -c '%a %n' f d         # 644 f, 755 d with umask 022
umask 027; touch g; mkdir e
stat -c '%a %n' g e         # 640 g, 750 e`,
      },
      {
        level: "medium",
        task: "List a directory and print a type letter (d, f, l or ?) before each name, using d_type and falling back to fstatat when it is DT_UNKNOWN.",
        hint: "dirfd(d) gives the directory's descriptor; AT_SYMLINK_NOFOLLOW works like lstat. DT_ constants need _DEFAULT_SOURCE, which gcc's default mode provides.",
        solution: String.raw`DIR *d = opendir(dir);
if (!d) { perror(dir); return 1; }
struct dirent *e;
while ((e = readdir(d)) != NULL) {
  unsigned char t = e->d_type;
  struct stat st;
  if (t == DT_UNKNOWN && fstatat(dirfd(d), e->d_name, &st, AT_SYMLINK_NOFOLLOW) == 0)
    t = S_ISDIR(st.st_mode) ? DT_DIR : S_ISLNK(st.st_mode) ? DT_LNK : S_ISREG(st.st_mode) ? DT_REG : DT_UNKNOWN;
  printf("%c %s\n", t == DT_DIR ? 'd' : t == DT_LNK ? 'l' : t == DT_REG ? 'f' : '?', e->d_name);
}
closedir(d);`,
      },
      {
        level: "hard",
        task: "Write int rmtree(const char *path) that deletes a whole directory tree, like rm -r, without following symlinks.",
        hint: "nftw with FTW_DEPTH visits the contents of a directory before the directory itself; remove() handles both files and empty directories.",
        solution: String.raw`#define _XOPEN_SOURCE 700
#include <ftw.h>
#include <stdio.h>
static int rm_one(const char *p, const struct stat *st, int type, struct FTW *f) {
  (void)st; (void)type; (void)f;
  if (remove(p) < 0) { perror(p); return -1; }   /* non-zero stops the walk */
  return 0;
}
int rmtree(const char *path) {
  return nftw(path, rm_one, 16, FTW_DEPTH | FTW_PHYS);
}`,
      },
    ],
    faq: [
      { q: "Why does ls -l show question marks for everything in a directory?", a: "You have read permission on the directory but not execute. You can list the names, but the kernel will not let you look up each entry to get its details." },
      { q: "Why could someone delete my file when they cannot write to it?", a: "Deleting changes the directory, not the file, so it needs write and execute permission on the directory. Set the sticky bit on shared directories, as /tmp has, to stop that." },
      { q: "Why is the order of readdir results random?", a: "The kernel returns entries in the order the file system stores them, which on ext4 follows a hash of the names. Collect the names and sort them if you need a stable order." },
      { q: "What is the difference between chmod and fchmod?", a: "chmod looks the file up by path every time, while fchmod changes the file behind a descriptor you already opened. fchmod cannot be tricked by someone replacing the path in between." },
    ],
  },
};

export default extra;
