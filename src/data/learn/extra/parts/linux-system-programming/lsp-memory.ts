import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-memory/virtual-memory": {
    plain: [
      "When your program uses an address like 0x7ffd1234, that is not a real spot in the RAM chips. It is a virtual address: a number in your program's own private map. The kernel and the CPU translate it to a real (physical) location behind the scenes.",
      "Each process gets its own map, so two programs can both use address 0x400000 without ever touching each other's data. One buggy program cannot scribble on another. This is the main reason a crash in your browser does not take down your editor.",
      "Memory is handed out in pages, small blocks of usually 4 KiB. The kernel is lazy on purpose: when you ask for 1 GiB, it only writes down a promise. A real page of RAM is given only when you first touch that part of memory. That first touch causes a page fault, which is a normal event, not an error.",
      "Because promises are cheap, Linux lets programs promise more memory than the machine has. Usually that works, since most programs never touch all of it. If they do, and RAM and swap run out, the kernel's OOM (out of memory) killer stops one process to save the rest.",
    ],
    deepDive: [
      {
        heading: "Pages, page tables and the TLB",
        body: "On x86-64 a page is 4 KiB, so the low 12 bits of an address are the offset inside the page. The rest of the address is split into four 9-bit pieces, one per level of the page table. Each level is a 4 KiB table of 512 entries that points to the next table, and the last one gives the physical frame. With 4 levels the usable virtual space is 48 bits (256 TiB), and user programs get the lower half, up to 0x00007fffffffffff. Newer CPUs support 5 levels for 57-bit addresses.\n\nWalking four tables for every memory access would be slow, so the CPU caches recent translations in the TLB (translation lookaside buffer). A hit costs almost nothing; a miss costs a page walk. Huge pages (2 MiB or 1 GiB) cover much more memory per TLB entry, which is why databases and VMs like them.",
        visual: {
          type: "layers",
          title: "How a 48-bit x86-64 address is split",
          layers: [
            { label: "Bits 47-39: level 4 index", detail: "Picks 1 of 512 entries in the top table" },
            { label: "Bits 38-30: level 3 index", detail: "Next table; can map a 1 GiB huge page" },
            { label: "Bits 29-21: level 2 index", detail: "Next table; can map a 2 MiB huge page" },
            { label: "Bits 20-12: level 1 index", detail: "Gives the 4 KiB physical frame" },
            { label: "Bits 11-0: offset", detail: "Byte position inside the page" },
          ],
        },
      },
      {
        heading: "Reading /proc/PID/maps line by line",
        body: "Each line in /proc/PID/maps is one mapping (the kernel calls it a VMA, virtual memory area). A line like 55d0c4a00000-55d0c4a21000 r-xp 00002000 08:01 1312 /usr/bin/cat has six fields: start and end address, permissions, offset into the file, device, inode, and the file name.\n\nThe permissions are r, w, x, and then p for private (copy-on-write) or s for shared. Code is r-xp, constants are r--p, writable globals are rw-p. Lines without a file are anonymous memory: [heap] is the brk heap, [stack] is the main thread stack, and big unnamed rw-p regions are usually malloc arenas or thread stacks. [vdso] is a small library the kernel maps in so calls like clock_gettime need no system call.\n\nFor sizes, use /proc/PID/smaps (per mapping) or smaps_rollup (totals), or pmap -x PID for a table with RSS per mapping.",
        bullets: ["r-xp with a .so name: library code, shared between processes", "rw-p with no name: heap, arena or thread stack", "---p regions are guard pages: any access crashes"],
      },
      {
        heading: "Page faults and demand paging",
        body: "A page fault is the CPU saying: this address has no valid translation, kernel, please decide. The kernel looks up the VMA. If no mapping covers the address, or the access breaks its permissions, the process gets SIGSEGV. Otherwise the fault is legal and the kernel fixes it.\n\nA minor fault needs no disk: the first touch of anonymous memory (the kernel hands out a zeroed page), a file page already in the page cache, or a copy-on-write after fork (the kernel copies the shared page so the writer gets its own). A major fault must read from disk: a file page that is not cached, or a page that was swapped out. Minor faults cost around a microsecond; major faults cost a disk read, from tens of microseconds on fast SSDs to milliseconds on spinning disks.\n\nYou can count them with ps -o min_flt,maj_flt -p PID or perf stat -e page-faults ./prog.",
        visual: {
          type: "flow",
          title: "What the kernel does on a page fault",
          steps: [
            { label: "CPU traps", detail: "No valid translation for the address" },
            { label: "Find the VMA", detail: "None, or wrong permission: SIGSEGV" },
            { label: "Anonymous page?", detail: "Give a zeroed page: minor fault" },
            { label: "File page?", detail: "In page cache: minor; else read disk: major" },
            { label: "Update page table", detail: "Retry the instruction, which now works" },
          ],
        },
      },
      {
        heading: "Overcommit and the OOM killer",
        body: "The setting vm.overcommit_memory decides how many promises the kernel makes. 0, the default, uses a heuristic that refuses only obviously impossible requests. 1 always says yes. 2 is strict: total committed memory may not exceed swap plus overcommit_ratio percent of RAM (50 by default); /proc/meminfo shows this as CommitLimit and the current total as Committed_AS. In mode 2, malloc really returns NULL when the limit is hit.\n\nIn modes 0 and 1, malloc almost never fails. Instead, when memory truly runs out, the OOM killer picks the process with the highest oom_score (mostly based on how much memory it uses) and kills it with SIGKILL. The kernel log shows Out of memory: Killed process. You can bias the choice through /proc/PID/oom_score_adj, from -1000 (never kill) to 1000 (kill first), or OOMScoreAdjust= in a systemd unit. Containers usually hit their cgroup limit (memory.max) first, which triggers an OOM kill inside that cgroup only.",
        bullets: ["sysctl vm.overcommit_memory shows the mode", "journalctl -k | grep -i 'out of memory' finds OOM kills", "cat /proc/PID/oom_score shows the current badness"],
      },
      {
        heading: "RSS, VSZ and shared pages",
        body: "top and ps show two numbers. VSZ (VIRT in top) is the size of every mapping, touched or not. It is often huge and mostly harmless: thread stacks, reserved arenas and mapped files all count. RSS (RES) is how much is actually in RAM right now.\n\nRSS still over-counts. Pages from libc or a shared file are in RAM once but appear in the RSS of every process that maps them. PSS (proportional set size) fixes this by splitting each shared page among its users: a 100 KiB page set shared by 4 processes adds 25 KiB to each. Read it from /proc/PID/smaps_rollup. To find out how much memory a set of processes really uses together, add up PSS, not RSS.\n\nSwapped-out pages are in neither RSS nor PSS; smaps_rollup shows them as Swap.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Typical layout of a 64-bit process, high to low addresses",
        layers: [
          { label: "Kernel space", detail: "Mapped in every process, not accessible from user mode" },
          { label: "Main thread stack", detail: "[stack], grows down toward lower addresses" },
          { label: "mmap region", detail: "Shared libraries, thread stacks, big malloc blocks" },
          { label: "Heap", detail: "[heap], grows up with brk" },
          { label: "Data and BSS", detail: "Global variables, rw-p" },
          { label: "Program code", detail: "r-xp mapping of the executable" },
        ],
      },
    ],
    examples: [
      {
        title: "Watch demand paging happen",
        explanation: "We allocate 1 GiB and read our own VmRSS after each step. Step 1: right after malloc, RSS barely moves, because the kernel only reserved address space (glibc used mmap for a block this big). Step 2: after writing to half of it, RSS rises by about 512 MiB, one page fault per 4 KiB page. Step 3: free returns the whole mmap block to the kernel. Build with gcc -O0, because an optimising compiler may delete a buffer that is never read.",
        code: {
          lang: "c",
          code: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static void rss(const char *when) {
  char line[256]; FILE *f = fopen("/proc/self/status", "r");
  if (!f) return;
  while (fgets(line, sizeof line, f))
    if (strncmp(line, "VmRSS:", 6) == 0) printf("%-8s %s", when, line);
  fclose(f);
}
int main(void) {
  size_t n = 1UL << 30;                         /* 1 GiB */
  char *p = malloc(n); if (!p) { perror("malloc"); return 1; }
  rss("malloc"); memset(p, 1, n / 2); rss("touched");
  free(p); return 0; }`,
        },
      },
      {
        title: "Investigate an OOM kill",
        explanation: "A worker process disappears without a log line. A SIGKILL leaves no chance to log, so check the kernel. Step 1: search the kernel log for the OOM report; it names the process, its RSS and the cgroup. Step 2: if a cgroup limit was hit (constraint=CONSTRAINT_MEMCG), raise MemoryMax for that service or fix its memory use. Step 3: protect a critical process, such as the database, by lowering its oom_score_adj so the killer chooses something else.",
        code: {
          lang: "bash",
          code: String.raw`journalctl -k --since "1 hour ago" | grep -iE "out of memory|oom-kill"
# Out of memory: Killed process 4242 (worker) total-vm:..., anon-rss:3912345kB, ...
grep -E "MemTotal|MemAvailable|Committed_AS|CommitLimit" /proc/meminfo
cat /proc/$(pidof postgres | cut -d' ' -f1)/oom_score
# in the service unit: OOMScoreAdjust=-500 and MemoryMax=4G
systemctl show worker.service -p MemoryMax -p OOMScoreAdjust`,
        },
      },
    ],
    cheatSheet: [
      "getconf PAGESIZE prints the page size (4096 on most x86-64 and many ARM systems)",
      "cat /proc/PID/maps lists mappings; pmap -x PID adds RSS per mapping",
      "/proc/PID/smaps_rollup gives Rss, Pss and Swap totals for one process",
      "ps -o pid,min_flt,maj_flt,rss,vsz -p PID shows faults and sizes",
      "vm.overcommit_memory: 0 heuristic (default), 1 always, 2 strict",
      "oom_score_adj ranges from -1000 (never kill) to 1000 (kill first)",
      "Major fault = disk read; minor fault = page already in RAM or zero page",
    ],
    quiz: [
      {
        q: "A program calls malloc(1 GiB) but never touches the memory. What happens to RSS?",
        options: ["It grows by 1 GiB immediately", "It barely changes, because pages are only given on first touch", "It shrinks", "The OOM killer runs"],
        answer: 1,
        why: "Demand paging only assigns physical pages when they are first accessed.",
      },
      {
        q: "A page fault reads a page of a file that was not in the page cache. What kind of fault is it?",
        options: ["A minor fault", "A segmentation fault", "A major fault", "A TLB hit"],
        answer: 2,
        why: "Faults that need disk I/O are major faults; ones served from RAM are minor.",
      },
      {
        q: "What does the s in r--s mean in /proc/PID/maps?",
        options: ["The mapping is shared, so writes reach the file and other mappers", "The mapping is a stack", "The page is swapped out", "The mapping is secure"],
        answer: 0,
        why: "The fourth flag is p for private (copy-on-write) or s for shared.",
      },
      {
        q: "Ten processes each map the same 20 MiB library. What is the fairest way to count its memory per process?",
        options: ["RSS, which counts 20 MiB for each", "VSZ, which shows all mappings", "Count it only for the first process", "PSS, which charges each process 2 MiB"],
        answer: 3,
        why: "PSS divides shared pages among the processes that map them.",
      },
      {
        q: "With vm.overcommit_memory = 2, what usually happens when the commit limit is reached?",
        options: ["The OOM killer kills the biggest process", "New allocations fail, so malloc returns NULL", "The kernel adds swap automatically", "Nothing, the limit is only advisory"],
        answer: 1,
        why: "Strict mode refuses new commitments instead of overpromising.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run cat /proc/self/maps and label each region: program code, heap, libraries, stack, vdso. Then run it again and note which addresses changed.",
        hint: "cat reads its own map. ASLR (address space layout randomisation) moves regions on every run.",
        solution: String.raw`cat /proc/self/maps
# r-xp /usr/bin/cat          program code
# [heap]                     brk heap
# r-xp .../libc.so.6         C library code
# [stack]  [vvar]  [vdso]    stack and kernel helpers
cat /proc/self/maps | head -3     # different start addresses: ASLR`,
      },
      {
        level: "medium",
        task: "Show copy-on-write after fork: allocate and touch 200 MiB, fork, and print the child's minor faults before and after it writes to the whole buffer.",
        hint: "getrusage(RUSAGE_SELF, &ru) gives ru_minflt. Writing makes the kernel copy each shared page.",
        solution: String.raw`char *p = malloc(200 << 20); memset(p, 1, 200 << 20);
if (fork() == 0) {
  struct rusage a, b; getrusage(RUSAGE_SELF, &a);
  memset(p, 2, 200 << 20);                 /* every page gets copied */
  getrusage(RUSAGE_SELF, &b);
  printf("child minor faults: %ld\n", b.ru_minflt - a.ru_minflt);  /* about 51200 with 4 KiB pages */
  _exit(0);
}
wait(NULL);`,
      },
      {
        level: "hard",
        task: "In a throwaway VM, run a program that allocates and touches memory in a loop until it is killed. Find the OOM report in the kernel log, then run it again with oom_score_adj set to -1000 for your shell and note what gets killed instead. Do not do this on a shared machine.",
        hint: "Children inherit oom_score_adj. Lowering it below 0 needs root (CAP_SYS_RESOURCE).",
        solution: String.raw`# hog.c: for (;;) { char *p = malloc(100 << 20); if (!p) break; memset(p, 1, 100 << 20); }
gcc -O0 hog.c -o hog && ./hog          # killed with SIGKILL, shell prints Killed
journalctl -k | grep -i "killed process"
sudo sh -c 'echo -1000 > /proc/self/oom_score_adj; exec ./hog'
# hog is now exempt, so another process is chosen, or the system may hang. VM only.`,
      },
    ],
    faq: [
      { q: "Why is the VIRT column in top so much bigger than RES?", a: "VIRT counts every mapping, including reserved but untouched memory, thread stacks and mapped files. RES is what is actually in RAM, and it is the number to watch for memory use." },
      { q: "Does each process have its own copy of libc in RAM?", a: "No. The library's code pages are shared through the page cache, so they exist in RAM once. Only pages a process writes to, like its own data, become private copies." },
      { q: "What are transparent huge pages?", a: "A kernel feature that automatically backs large anonymous regions with 2 MiB pages to reduce TLB misses. Check the mode in /sys/kernel/mm/transparent_hugepage/enabled; some databases recommend madvise mode or turning it off because of latency spikes." },
      { q: "Should I disable overcommit?", a: "Usually not. Many programs reserve far more than they use, and strict mode makes them fail early. Mode 2 is used on some database servers where predictable allocation failure is better than a surprise OOM kill." },
    ],
  },

  "lsp-memory/mmap": {
    plain: [
      "Normally you read a file by asking the kernel to copy bytes into a buffer. mmap works differently: it makes the file appear inside your memory, as if it were one big array. You just read p[1000] and the kernel brings in that part of the file when you touch it.",
      "Nothing is read when you call mmap. The kernel only notes \"this range of addresses shows that file\". The first time you touch a page, a page fault loads it. If you never touch most of a huge file, most of it is never read.",
      "Two choices matter. A shared mapping means your writes go into the file and other processes see them. A private mapping means your writes stay with you; the file never changes. You can also map plain memory with no file behind it, called anonymous memory, which is how malloc gets big blocks.",
      "With mprotect you can change what a range of pages allows (read, write, run code, or nothing at all), and with msync you can make sure changes in a shared mapping have reached the disk.",
    ],
    deepDive: [
      {
        heading: "What mmap really sets up",
        body: "mmap(addr, length, prot, flags, fd, offset) creates one new VMA (a region in your address space) and returns its start. Pass NULL as addr so the kernel picks a free spot. The offset must be a multiple of the page size, and the length is rounded up to whole pages.\n\nThe data itself lives in the kernel's page cache, the same cache that read and write use. When you touch a page, the fault handler finds the file page in the cache (or reads it from disk) and points your page table entry straight at it. That is why mmap avoids the extra copy that read makes into your buffer, and why many processes mapping the same file share one copy in RAM.\n\nmmap is not automatically faster. Each first touch of a page costs a fault, and a mapping is harder to grow. For one sequential pass over a file, read with a large buffer is about as fast. mmap shines for random access and for sharing.",
        visual: {
          type: "sequence",
          title: "First access to a mapped file page",
          actors: ["Program", "Kernel", "Page cache", "Disk"],
          messages: [
            { from: 0, to: 1, label: "mmap: create the VMA only" },
            { from: 0, to: 1, label: "read p[0]: page fault" },
            { from: 1, to: 2, label: "is page 0 cached?" },
            { from: 2, to: 3, label: "no: read it from disk" },
            { from: 1, to: 0, label: "map the cached page, retry the load" },
            { from: 0, to: 0, label: "next accesses: plain memory speed" },
          ],
        },
      },
      {
        heading: "MAP_SHARED and MAP_PRIVATE in detail",
        body: "With MAP_SHARED, your page table points at the page cache page itself. A write changes that page, so another process that calls read on the file sees the new bytes at once, before anything reaches the disk. Writeback flushes dirty pages to disk later, or now if you call msync. To map shared and writable, the file must be opened O_RDWR, or mmap fails with EACCES.\n\nWith MAP_PRIVATE, pages start out shared with the cache but are copy-on-write. Your first write to a page gives you a private copy, and the file never changes. This is how the loader maps executables and libraries: every process can patch its own data pages without touching the file. Private writable mappings work even on files opened O_RDONLY.\n\nmmap cannot make a file longer. If you need more room, grow the file first with ftruncate, then map. Touching a mapped page that lies wholly past the end of the file raises SIGBUS, which also happens when another process truncates the file under you.",
        bullets: ["Shared + writable needs the fd opened O_RDWR", "Grow with ftruncate before mapping the new range", "SIGBUS: access past end of file or an I/O error"],
      },
      {
        heading: "Anonymous mappings",
        body: "MAP_ANONYMOUS gives memory with no file behind it. Pass fd -1 and offset 0. The pages start out filled with zeros and are only made real on first touch, just like heap memory. glibc malloc uses this for large blocks (128 KiB and up by default), and thread stacks are anonymous mappings too.\n\nMAP_PRIVATE | MAP_ANONYMOUS is private scratch memory. MAP_SHARED | MAP_ANONYMOUS stays shared with children created by fork afterwards, which makes it the simplest way to share memory between a parent and its children; no file and no name are needed. For unrelated processes, use shm_open or memfd_create and map that descriptor instead.\n\nUseful extra flags: MAP_POPULATE faults all pages in at once (avoiding many small faults later), and MAP_NORESERVE asks the kernel not to reserve swap space for the mapping.",
        bullets: ["mmap(NULL, len, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0)", "Always compare the result with MAP_FAILED, not NULL", "munmap(p, len) gives the pages back immediately"],
      },
      {
        heading: "mprotect and guard pages",
        body: "mprotect(addr, len, prot) changes the permissions of pages that are already mapped. addr must be page-aligned; get the size from sysconf(_SC_PAGESIZE). After the change, any access that breaks the new rules raises SIGSEGV.\n\nA guard page is a page set to PROT_NONE next to a buffer. Running off the end of the buffer then crashes at the exact bad instruction instead of silently corrupting the neighbour. glibc puts a guard page below every thread stack for this reason; you can see them as ---p regions in /proc/PID/maps. Debugging allocators like Electric Fence place one after each allocation.\n\nJIT compilers use mprotect for W^X (write xor execute): they write machine code into a PROT_READ | PROT_WRITE page, then switch it to PROT_READ | PROT_EXEC before running it, so a page is never writable and executable at the same time.",
        visual: {
          type: "flow",
          title: "A buffer with a guard page",
          steps: [
            { label: "mmap 2 pages", detail: "PROT_READ | PROT_WRITE, anonymous" },
            { label: "mprotect page 2", detail: "PROT_NONE: no access at all" },
            { label: "Use page 1", detail: "Normal reads and writes" },
            { label: "Overflow into page 2", detail: "Fault: SIGSEGV at the bad line" },
          ],
        },
      },
      {
        heading: "msync, munmap and durability",
        body: "Writes to a shared file mapping are in the page cache, not on disk. They will be written back eventually, even after munmap or process exit, but a power cut before that loses them. msync(addr, len, MS_SYNC) blocks until the dirty pages in that range are written, which is what you need before telling a user \"saved\". addr must be page-aligned. On Linux, MS_ASYNC does nothing extra, because the kernel already tracks and schedules dirty pages; only MS_SYNC gives a guarantee. fsync on the file descriptor also flushes them.\n\nErrors behave differently than with write. If the disk fails while a page is being read in, there is no return value to check: the process gets SIGBUS. That, plus the lack of control over when pages are written, is why many database engines prefer read, write and their own buffer cache, while others (LMDB, for example) build everything on mmap.",
        bullets: ["msync(p, len, MS_SYNC) before reporting success", "Closing the fd does not remove the mapping; munmap does", "I/O errors on mapped pages arrive as SIGBUS"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "read() versus mmap() for file access",
        columns: [
          { title: "read and write", points: ["Copies data into your buffer", "Errors come back as return values", "Works on pipes, sockets and files", "Easy to grow and append"] },
          { title: "mmap", points: ["No copy: access the page cache directly", "Errors arrive as SIGBUS", "Regular files and devices only", "Great for random access and sharing"] },
        ],
      },
    ],
    examples: [
      {
        title: "Edit a file in place with MAP_SHARED",
        explanation: "We turn every lowercase letter in a file into uppercase without reading it into a buffer. Step 1: open with O_RDWR, because a shared writable mapping needs write access. Step 2: get the size with fstat and refuse empty files (mmap with length 0 fails with EINVAL). Step 3: map it MAP_SHARED and change bytes through the pointer. Step 4: msync with MS_SYNC so the change is on disk before we say done.",
        code: {
          lang: "c",
          code: String.raw`#include <ctype.h>
#include <fcntl.h>
#include <stdio.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>
int main(int argc, char **argv) {
  struct stat st; int fd = argc > 1 ? open(argv[1], O_RDWR) : -1;
  if (fd < 0 || fstat(fd, &st) < 0 || st.st_size == 0) { perror("open/fstat"); return 1; }
  char *p = mmap(NULL, st.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
  if (p == MAP_FAILED) { perror("mmap"); return 1; }
  for (off_t i = 0; i < st.st_size; i++) p[i] = toupper((unsigned char)p[i]);
  if (msync(p, st.st_size, MS_SYNC) < 0) perror("msync");
  munmap(p, st.st_size); close(fd); return 0;
}`,
        },
      },
      {
        title: "Catch a buffer overflow with a guard page",
        explanation: "We give a 4096-byte buffer a PROT_NONE neighbour. Step 1: ask for the real page size. Step 2: map two pages of anonymous memory. Step 3: protect the second page. Step 4: write 4096 bytes, which fits. Step 5: write one more byte. The program dies with SIGSEGV exactly on that line, and gdb or a core dump points straight at it.",
        code: {
          lang: "c",
          code: String.raw`#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>
int main(void) {
  long pg = sysconf(_SC_PAGESIZE);
  char *p = mmap(NULL, 2 * pg, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
  if (p == MAP_FAILED) { perror("mmap"); return 1; }
  if (mprotect(p + pg, pg, PROT_NONE) < 0) { perror("mprotect"); return 1; }
  memset(p, 'x', pg);               /* fills page 1: fine */
  puts("page 1 ok");
  p[pg] = 'x';                      /* first byte of the guard page: SIGSEGV */
  puts("never printed");
  return 0;
}`,
        },
      },
    ],
    cheatSheet: [
      "Check mmap against MAP_FAILED, never NULL",
      "Offset must be page-aligned; length is rounded up to whole pages",
      "Shared writable file mapping requires the file opened O_RDWR",
      "ftruncate(fd, size) first: mmap cannot grow a file",
      "Anonymous: MAP_PRIVATE | MAP_ANONYMOUS with fd -1 and offset 0",
      "mprotect(p, len, PROT_NONE) makes a guard page; p must be page-aligned",
      "msync(p, len, MS_SYNC) waits for disk; on Linux MS_ASYNC adds nothing",
      "madvise(p, len, MADV_SEQUENTIAL) hints a front-to-back scan",
    ],
    quiz: [
      {
        q: "You open a file O_RDONLY and call mmap with PROT_READ | PROT_WRITE and MAP_SHARED. What happens?",
        options: ["It works and writes go to the file", "It works but writes are private", "mmap fails with EACCES", "The process gets SIGBUS"],
        answer: 2,
        why: "A shared writable mapping needs a descriptor opened for writing.",
      },
      {
        q: "A process writes to a MAP_PRIVATE mapping of a file. What happens to the file on disk?",
        options: ["Nothing; the process gets private copy-on-write pages", "It is updated at the next msync", "It is updated when the process exits", "The write fails with EPERM"],
        answer: 0,
        why: "Private mappings copy each written page, and the copies are never written back.",
      },
      {
        q: "You map 8192 bytes of a file that is only 100 bytes long and read byte 5000. What happens?",
        options: ["You read zeros", "mmap had already failed", "You read the next file on disk", "The process receives SIGBUS"],
        answer: 3,
        why: "Byte 5000 is on a page entirely past the end of the file, so there is no data to back it.",
      },
      {
        q: "Why is mmap not always faster than read?",
        options: ["mmap always copies data twice", "Each first touch of a page costs a page fault, and a big sequential read is already efficient", "mmap disables the page cache", "mmap only works on small files"],
        answer: 1,
        why: "mmap saves a copy but adds fault and setup costs, so for one sequential pass the two are similar.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Map a text file read-only and count how many times the letter e appears. Handle empty files and errors.",
        hint: "Start from the explainer's line counter and change the comparison.",
        solution: String.raw`int fd = open(argv[1], O_RDONLY); struct stat st;
if (fd < 0 || fstat(fd, &st) < 0) { perror(argv[1]); return 1; }
if (st.st_size == 0) { puts("0"); return 0; }
const char *p = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
if (p == MAP_FAILED) { perror("mmap"); return 1; }
long n = 0;
for (off_t i = 0; i < st.st_size; i++) n += p[i] == 'e';
printf("%ld\n", n);
munmap((void *)p, st.st_size); close(fd);`,
      },
      {
        level: "medium",
        task: "Prove the difference between private and shared: map the same file twice, once MAP_PRIVATE and once MAP_SHARED, write X into the first byte of each in turn, and check the file with cat after each step.",
        hint: "Open O_RDWR. After the private write the file is unchanged; after the shared write it changes.",
        solution: String.raw`char *priv = mmap(NULL, len, PROT_READ | PROT_WRITE, MAP_PRIVATE, fd, 0);
char *shr  = mmap(NULL, len, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
if (priv == MAP_FAILED || shr == MAP_FAILED) { perror("mmap"); return 1; }
priv[0] = 'X'; system("head -c 10 data.txt; echo");   /* unchanged */
shr[0]  = 'X'; system("head -c 10 data.txt; echo");   /* starts with X */
/* the shared write is visible to other readers at once, before any msync */`,
      },
      {
        level: "hard",
        task: "Write an append-only log file of fixed-size records using mmap: grow the file with ftruncate in steps of 1 MiB and remap when full.",
        hint: "Keep fd, map, capacity and used. When used + rec > capacity: munmap, ftruncate to the new size, mmap again.",
        solution: String.raw`int log_append(struct log *l, const void *rec, size_t n) {
  if (l->used + n > l->cap) {
    size_t ncap = l->cap + (1 << 20);
    if (l->map && munmap(l->map, l->cap) < 0) return -1;
    if (ftruncate(l->fd, ncap) < 0) return -1;
    l->map = mmap(NULL, ncap, PROT_READ | PROT_WRITE, MAP_SHARED, l->fd, 0);
    if (l->map == MAP_FAILED) { l->map = NULL; return -1; }
    l->cap = ncap;
  }
  memcpy(l->map + l->used, rec, n); l->used += n;
  return 0;   /* on close: msync, munmap, ftruncate(fd, used) */
}`,
      },
    ],
    faq: [
      { q: "Is mmap faster than read?", a: "It depends. mmap avoids one copy and is great for random access or many processes sharing a file, but each new page costs a fault. For a single sequential pass, read with a 64 KiB or larger buffer is usually just as fast." },
      { q: "Does closing the file descriptor unmap the file?", a: "No. The mapping keeps its own reference to the file, so you can close the fd right after mmap. The mapping stays until munmap or process exit." },
      { q: "What causes SIGBUS with mmap?", a: "Touching a page that lies past the end of the file (often because someone truncated it), or an I/O error while the kernel reads the page in." },
      { q: "Can I mmap a pipe or a socket?", a: "No. mmap needs something with stable, addressable contents, like a regular file, a shared memory object or certain devices. Pipes and TCP or UDP sockets are streams of bytes, so mmap fails with ENODEV." },
    ],
  },

  "lsp-memory/malloc-internals": {
    plain: [
      "malloc is not a system call. It is ordinary C code inside the C library. Asking the kernel for memory is slow and works in whole pages, so malloc asks for big pieces now and then and cuts them into the small blocks your program wants.",
      "Each block has a small hidden label in front of it that stores its size. That is how free knows how much to give back without you telling it. It is also why writing past the end of a block is so dangerous: you overwrite the next block's label, and the program crashes later, somewhere else.",
      "When you free a block, malloc usually keeps it for reuse instead of returning it to the kernel. Freed blocks are sorted into lists by size, so the next malloc of a similar size is fast.",
      "Building your own small allocator is the best way to understand all this. With LD_PRELOAD you can even make real programs like ls use your allocator without recompiling them.",
    ],
    deepDive: [
      {
        heading: "Where the memory comes from: brk and mmap",
        body: "glibc malloc has two sources. For normal requests it uses the main heap, a region right after the program's data whose end is called the program break. When the heap runs out, malloc calls brk (through sbrk) to move the break up, typically by 132 KiB or more at a time. When enough free space gathers at the very top, free can move the break back down, controlled by M_TRIM_THRESHOLD (128 KiB by default).\n\nRequests at or above M_MMAP_THRESHOLD (128 KiB by default) skip the heap and get their own anonymous mmap. free then calls munmap, so that memory really returns to the kernel at once. The threshold is dynamic: when you free an mmapped block, glibc raises the threshold to that size (up to 32 MiB on 64-bit), betting that you will allocate it again soon. Setting the threshold yourself with mallopt turns this off.\n\nYou can watch it all with strace -e trace=brk,mmap,munmap ./prog.",
        bullets: ["Small: carved from the heap, grown with brk", "Large (128 KiB or more): direct mmap, munmap on free", "malloc_trim(0) asks glibc to return free heap memory"],
      },
      {
        heading: "Chunks, headers and bins in glibc",
        body: "Every allocation is a chunk. On 64-bit glibc the chunk starts with an 8-byte size field, and the pointer you get back points just after it. Sizes are multiples of 16, so the low 3 bits of the size field are free and used as flags: PREV_INUSE (the chunk before is in use), IS_MMAPPED and NON_MAIN_ARENA. The smallest chunk is 32 bytes, so even malloc(1) uses 32. malloc_usable_size(p) tells you how much room you actually got.\n\nWhen a chunk is freed, its user area is reused to store list pointers to other free chunks. Free chunks are kept in bins. The fastest path is the tcache, a per-thread cache (since glibc 2.26) with 64 size classes up to 1032 bytes, each holding up to 7 chunks, and no locking at all. Behind it are fast bins, an unsorted bin, small bins of one size each and large bins of size ranges. Neighbouring free chunks are merged (coalesced) to fight fragmentation.",
        visual: {
          type: "layers",
          title: "One glibc chunk on 64-bit",
          layers: [
            { label: "prev_size (8 bytes)", detail: "Size of the previous chunk, only valid if it is free" },
            { label: "size | flags (8 bytes)", detail: "Chunk size; low bits: PREV_INUSE, IS_MMAPPED, NON_MAIN_ARENA" },
            { label: "User data", detail: "malloc returns a pointer here, 16-byte aligned" },
            { label: "When free: list pointers", detail: "fd and bk link the chunk into a bin" },
            { label: "Next chunk's header", detail: "Overflowing your data corrupts this" },
          ],
        },
      },
      {
        heading: "Fragmentation and arenas",
        body: "Fragmentation is memory you cannot use. Internal fragmentation is waste inside a block, like the 31 spare bytes of malloc(1). External fragmentation is free space split into holes too small for the next request. A long-running server that allocates many small objects and frees most of them can end up with a heap full of holes: the program uses 200 MiB, but RSS stays at 2 GiB, because one live object at the top of the heap stops brk from shrinking.\n\nThreads add another problem: contention. glibc gives the program several arenas, each an independent heap with its own lock. The main arena uses brk; extra ones are mmapped heaps of 64 MiB each. A thread usually keeps using one arena, and the limit is 8 arenas per CPU core on 64-bit. More arenas mean less lock contention but more memory held in partly used heaps. Setting MALLOC_ARENA_MAX=2 is a common fix for services whose memory grows with thread count. Alternative allocators such as jemalloc, tcmalloc and mimalloc make different trade-offs and often fragment less.",
        bullets: ["MALLOC_ARENA_MAX=2 ./server limits the number of arenas", "malloc_stats() prints per-arena usage to stderr", "LD_PRELOAD=libjemalloc.so.2 tries jemalloc without rebuilding"],
      },
      {
        heading: "Making the toy allocator real",
        body: "The explainer's first-fit allocator works, but it has gaps a real one must fill. Splitting: when a free block is much bigger than the request, cut it in two and keep the rest on the free list, or one malloc(16) can swallow a 1 MiB block. Coalescing: when a block is freed next to another free block, merge them, which needs a way to find neighbours (a size field at both ends, called a boundary tag). Alignment: every pointer must be aligned to 16 bytes on x86-64, so round sizes up and keep the header size a multiple of 16.\n\nThread safety: wrap every operation in one mutex, or give each thread its own cache. Overflow: calloc(n, size) must check that n * size does not overflow before allocating. And a full replacement must provide malloc, free, calloc and realloc, and ideally also posix_memalign, aligned_alloc and malloc_usable_size, because a program that gets memory from one allocator and frees it with another will crash.",
        bullets: ["Split big free blocks; merge neighbours on free", "Round every size up to a multiple of 16", "calloc: if (n && size > SIZE_MAX / n) return NULL;"],
      },
      {
        heading: "Testing with LD_PRELOAD",
        body: "The dynamic loader reads the LD_PRELOAD variable and loads those shared libraries before any others. Symbols they define win, so a library that defines malloc and free replaces the ones in libc for the whole program, including calls made inside other libraries. Build it with gcc -shared -fPIC -O2 -o libmy.so my.c -pthread and run LD_PRELOAD=./libmy.so ls.\n\nThree traps catch everyone. Do not call printf inside malloc: printf may call malloc, which recurses until the stack overflows. Use write(2, ...) with a fixed buffer for debug output. Second, LD_PRELOAD does nothing for statically linked programs, and it is mostly ignored for setuid programs for security. Third, the first program you test with may call functions you did not provide, such as realloc, and mix allocators; start with small tools like ls and cat, then try bigger ones.\n\nTo debug your heap code, link it into a small test program first and step through it with gdb. Do not combine it with AddressSanitizer, which brings its own malloc.",
        visual: {
          type: "flow",
          title: "How LD_PRELOAD swaps malloc",
          steps: [
            { label: "Program starts", detail: "The dynamic loader ld.so runs first" },
            { label: "Load LD_PRELOAD libs", detail: "libmy.so is searched before libc" },
            { label: "Resolve malloc", detail: "First definition found wins: yours" },
            { label: "Every malloc call", detail: "From the program and all its libraries" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What happens in free(p) in glibc, simplified",
        steps: [
          { label: "Read the header", detail: "Size and flags just before p" },
          { label: "mmapped chunk?", detail: "Yes: munmap it right away" },
          { label: "Room in tcache?", detail: "Yes: push on this thread's list, no lock" },
          { label: "Lock the arena", detail: "Small chunks may go to a fast bin" },
          { label: "Merge free neighbours", detail: "Then place in the unsorted bin" },
          { label: "Big free space at top?", detail: "Above trim threshold: shrink with brk" },
        ],
      },
    ],
    examples: [
      {
        title: "See brk and mmap with strace",
        explanation: "We allocate one small and one large block and watch the system calls. Step 1: the small malloc(1000) causes one brk call that grows the heap by about 132 KiB; later small mallocs need no system call at all. Step 2: malloc(1 MiB) is above the 128 KiB threshold, so it becomes its own mmap of a little more than 1 MiB (the extra page holds the chunk header). Step 3: freeing the large block calls munmap at once, while freeing the small one makes no system call.",
        code: {
          lang: "bash",
          code: String.raw`cat > m.c <<'EOF'
#include <stdlib.h>
int main(void) {
  char *s = malloc(1000), *l = malloc(1 << 20);
  free(l); free(s); return 0; }
EOF
gcc -O0 m.c -o m
strace -e trace=brk,mmap,munmap ./m
# ... first, the loader maps libc and other libraries ...
# brk(0x55d5c2a70000)             = 0x55d5c2a70000   small block: heap grows
# mmap(NULL, 1052672, PROT_READ|PROT_WRITE, ...) = 0x7f2a1c000000   large block
# munmap(0x7f2a1c000000, 1052672) = 0             freed straight back`,
        },
      },
      {
        title: "Turn the toy allocator into a preloadable library",
        explanation: "We wrap the explainer's my_malloc and my_free so real programs can use them. Step 1: one global mutex makes every call thread-safe. Step 2: calloc checks for multiplication overflow, then zeroes the block, because reused blocks contain old data. Step 3: realloc handles NULL, keeps the block if it is already big enough (the header stores the rounded size), and otherwise copies. Step 4: build with gcc -shared -fPIC -pthread and run LD_PRELOAD=./libmy.so ls. Programs that call posix_memalign or aligned_alloc would still need those too.",
        code: {
          lang: "c",
          code: String.raw`#include <pthread.h>
#include <stdint.h>
#include <string.h>
static pthread_mutex_t lk = PTHREAD_MUTEX_INITIALIZER;   /* plus hdr, my_malloc, my_free */
void *malloc(size_t n) { pthread_mutex_lock(&lk); void *p = my_malloc(n); pthread_mutex_unlock(&lk); return p; }
void free(void *p)     { pthread_mutex_lock(&lk); my_free(p); pthread_mutex_unlock(&lk); }
void *calloc(size_t c, size_t n) {
  if (n && c > SIZE_MAX / n) return NULL;                /* c * n would overflow */
  void *p = malloc(c * n); if (p) memset(p, 0, c * n); return p;
}
void *realloc(void *old, size_t n) {
  if (!old) return malloc(n);
  size_t have = ((hdr *)old - 1)->size; if (n <= have) return old;
  void *p = malloc(n); if (p) { memcpy(p, old, have); free(old); } return p;
}`,
        },
      },
    ],
    cheatSheet: [
      "glibc: under 128 KiB from the brk heap; 128 KiB and up via mmap (threshold adapts)",
      "64-bit glibc: 16-byte alignment, minimum chunk 32 bytes, 8-byte size header",
      "malloc_usable_size(p) shows the real usable size of a block",
      "strace -e trace=brk,mmap,munmap ./prog shows where memory comes from",
      "MALLOC_ARENA_MAX=2 reduces memory growth in heavily threaded services",
      "malloc_trim(0) returns free heap memory to the kernel where possible",
      "LD_PRELOAD=./libmy.so prog replaces malloc for dynamically linked programs",
      "Never call printf inside your malloc: it can recurse; use write(2, ...)",
    ],
    quiz: [
      {
        q: "Which of these is a system call?",
        options: ["malloc", "free", "brk", "calloc"],
        answer: 2,
        why: "malloc, free and calloc are library functions; brk and mmap are how they get memory from the kernel.",
      },
      {
        q: "On 64-bit glibc with default settings, how is malloc(4 MiB) usually served?",
        options: ["By a direct anonymous mmap", "From the tcache", "From a fast bin", "By moving the program break with brk"],
        answer: 0,
        why: "Requests above the mmap threshold (128 KiB by default, adaptive) get their own mapping.",
      },
      {
        q: "A server uses 200 MiB of live data but its RSS stays at 2 GiB after a traffic spike. What is the most likely cause?",
        options: ["A kernel bug", "The tcache is disabled", "Thread stacks are counted twice", "Heap fragmentation: freed holes cannot be returned to the kernel"],
        answer: 3,
        why: "Free memory trapped between live chunks stays in the process, so RSS does not drop.",
      },
      {
        q: "Why must calloc check n * size for overflow?",
        options: ["To make zeroing faster", "A wrapped product allocates a tiny block that the caller then overruns", "Because brk only takes even numbers", "To pick the right arena"],
        answer: 1,
        why: "An overflowed size silently creates a small buffer, a classic security bug.",
      },
      {
        q: "Your preloaded malloc prints a debug line with printf, and every program now crashes. Why?",
        options: ["printf may call malloc, so the calls recurse until the stack overflows", "LD_PRELOAD forbids stdio", "printf needs root", "The heap must be empty first"],
        answer: 0,
        why: "stdio allocates buffers with malloc, so calling it from inside malloc loops back into your own code.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print malloc_usable_size for malloc(1), malloc(24), malloc(25) and malloc(100). Explain the numbers from the 16-byte rounding and the 8-byte header.",
        hint: "Include malloc.h. Expect 24, 24, 40 and 104 on 64-bit glibc.",
        solution: String.raw`#include <malloc.h>
#include <stdio.h>
#include <stdlib.h>
int main(void) {
  size_t sizes[] = { 1, 24, 25, 100 };
  for (int i = 0; i < 4; i++) {
    void *p = malloc(sizes[i]);
    printf("%zu -> %zu\n", sizes[i], malloc_usable_size(p)); free(p);
  }
}   /* chunk = request + 8, rounded up to 16 (min 32); usable = chunk - 8 */`,
      },
      {
        level: "medium",
        task: "Add splitting to the explainer's first-fit allocator: when a free block has at least sizeof(hdr) + 32 bytes more than needed, cut off the rest as a new free block.",
        hint: "The new header starts at (char *)(h + 1) + n. Keep sizes multiples of 16.",
        solution: String.raw`if ((*pp)->size >= n) {
  hdr *h = *pp; *pp = h->next;
  if (h->size >= n + sizeof(hdr) + 32) {
    hdr *rest = (hdr *)((char *)(h + 1) + n);
    rest->size = h->size - n - sizeof(hdr);
    rest->next = free_list; free_list = rest;
    h->size = n;
  }
  return h + 1;
}`,
      },
      {
        level: "hard",
        task: "Write a preloadable library that does not replace malloc but counts calls: wrap malloc and free, forward to the real ones with dlsym(RTLD_NEXT, ...), and print totals at exit with write.",
        hint: "Use atomic counters, a destructor function, and avoid printf inside malloc. dlsym itself may call calloc, so do not wrap calloc in this first version.",
        solution: String.raw`#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdatomic.h>
#include <stdio.h>
#include <unistd.h>
static atomic_long nm, nf;
void *malloc(size_t n) { static void *(*real)(size_t); if (!real) real = dlsym(RTLD_NEXT, "malloc");
  atomic_fetch_add(&nm, 1); return real(n); }
void free(void *p) { static void (*real)(void *); if (!real) real = dlsym(RTLD_NEXT, "free");
  atomic_fetch_add(&nf, 1); real(p); }
__attribute__((destructor)) static void report(void) { char b[64];
  int len = snprintf(b, sizeof b, "malloc %ld free %ld\n", nm, nf); write(2, b, len); }`,
      },
    ],
    faq: [
      { q: "Does free return memory to the operating system?", a: "Sometimes. Large mmapped blocks are returned at once. Small blocks usually stay inside the process for reuse, and the heap only shrinks when free space at its top passes the trim threshold." },
      { q: "Why does my program crash in free and not where the bug is?", a: "An earlier overflow or double free corrupted the hidden chunk headers, and glibc only notices when it later walks them. Run the program with AddressSanitizer or valgrind to find the real bad write." },
      { q: "Is jemalloc or tcmalloc better than glibc malloc?", a: "For many multithreaded servers they use less memory and scale better, which is why projects like Redis and FreeBSD use jemalloc. Measure with your own workload; LD_PRELOAD makes trying them easy." },
      { q: "Why is malloc thread-safe but sometimes slow with many threads?", a: "Arenas have locks. The per-thread tcache avoids locks for small, recently freed sizes, but other requests take an arena lock, so heavy allocation in many threads can contend." },
    ],
  },
};

export default extra;
