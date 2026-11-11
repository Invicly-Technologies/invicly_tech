import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "lsp-threads/pthreads-basics": {
    plain: [
      "A thread is one line of work inside a program. A normal program has one thread: it starts in main and does one thing at a time. With more threads, the same program can do several things at once, for example compress four files on four CPU cores.",
      "All threads in a process live in the same memory. They see the same global variables, the same heap and the same open files. Each thread only has its own stack (for local variables) and its own CPU registers. This sharing makes threads fast to talk to each other, and also easy to break.",
      "You start a thread with pthread_create and give it a function to run plus one pointer argument. Later you call pthread_join, which waits until that thread finishes and hands you the pointer it returned. Think of it as: start a helper, go on with your work, then wait for the helper's answer.",
      "Every thread you start must be either joined or detached. Joined means someone waits for it. Detached means it cleans up after itself when it ends. Forget both, and each finished thread leaks some memory, a bit like a zombie process.",
    ],
    deepDive: [
      {
        heading: "What a thread really is on Linux",
        body: "Linux has no separate thread object inside the kernel. A thread is a task, the same kind of object as a process, created with clone (or clone3) and flags that say: share the memory, the open files, the signal handlers and the process ID. glibc's thread library (NPTL) maps every pthread to exactly one kernel task, so the kernel scheduler sees and runs each thread on its own.\n\nAll threads share one PID, which getpid returns. Each also has its own thread ID, returned by gettid. You can see them with ps -T -p PID, with top -H, or as folders under /proc/PID/task. Thread creation is fast (microseconds, not milliseconds) because nothing is copied, but it is not free. For many short jobs, reuse a fixed pool of threads instead of creating one per job.",
        bullets: ["ps -T -p PID lists threads with their TIDs (the SPID column)", "ls /proc/PID/task shows one folder per thread", "pthread_setname_np gives a thread a name (max 15 chars) shown by top -H"],
      },
      {
        heading: "Passing arguments and getting results",
        body: "pthread_create takes exactly one void pointer as the argument. To pass several values, put them in a struct and pass its address. That struct must stay alive until the thread has read it, so do not point at a loop variable or at a local that goes out of scope. An array of structs, one per thread, is the simplest safe pattern.\n\nThe thread returns a void pointer, which pthread_join gives back to you. Never return the address of a local variable: the thread's stack is gone once it exits. Either return a pointer to heap memory (the joiner frees it), or write the result into the argument struct and return NULL. For a small integer, you can cast it through intptr_t, which is common in examples but less clear than a struct.",
        bullets: ["One struct per thread, kept alive until join", "Return heap memory or write into the argument struct", "pthread_exit(ptr) ends the thread early with a result"],
      },
      {
        heading: "Join, detach, and how a program ends",
        body: "pthread_join blocks until the target thread ends, then frees its leftover resources. You may join a thread only once, and only if it is joinable. pthread_detach (or creating the thread with the PTHREAD_CREATE_DETACHED attribute) says nobody will join; the system frees the thread when it ends. Use detach for fire-and-forget work, but remember that you then have no easy way to know when it finished.\n\nHow the program ends matters too. Returning from main calls exit, which ends every thread at once, even ones in the middle of a write. If main should end but workers should keep going, call pthread_exit(NULL) in main instead. Most programs simply join every worker before returning.",
        visual: {
          type: "flow",
          title: "Life of a joinable thread",
          steps: [
            { label: "pthread_create", detail: "Kernel task created, function starts" },
            { label: "Runs its function", detail: "Uses its own stack, shares the heap" },
            { label: "Returns or pthread_exit", detail: "Result pointer is kept" },
            { label: "Waits to be joined", detail: "Stack and descriptor not yet freed" },
            { label: "pthread_join", detail: "Caller gets the result, resources freed" },
          ],
        },
      },
      {
        heading: "Errors, -pthread and attributes",
        body: "pthread functions do not set errno. They return 0 on success or an error number such as EAGAIN (too many threads or no memory). Print it with strerror(rc), not perror. Always check pthread_create: on a busy box it does fail.\n\nBuild with gcc -pthread for both compiling and linking. It sets the right macros and links the thread library. Since glibc 2.34 the thread functions live inside libc itself, but -pthread is still the portable, correct flag.\n\nAttributes (pthread_attr_t) change how a thread starts. The most useful one is the stack size. Each thread gets a stack of RLIMIT_STACK size by default, usually 8 MiB of virtual memory. That memory is only reserved, not used, but if you start thousands of threads, pthread_attr_setstacksize with something like 256 KiB keeps the address space small.",
        bullets: ["gcc -Wall -pthread prog.c -o prog", "rc = pthread_create(...); if (rc) fprintf(stderr, \"%s\\n\", strerror(rc));", "ulimit -s shows the default stack size in KiB"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "One process, several threads",
        layers: [
          { label: "Shared: code and globals", detail: "Every thread runs the same program text" },
          { label: "Shared: heap", detail: "malloc memory is visible to all threads" },
          { label: "Shared: fds, cwd, signal handlers", detail: "close() in one thread closes it for all" },
          { label: "Private: stack per thread", detail: "Locals and call frames, 8 MiB default" },
          { label: "Private: registers, TID, errno", detail: "Also signal mask and thread-local data" },
        ],
      },
    ],
    examples: [
      {
        title: "Return a result from a thread the safe way",
        explanation: "We want a worker to compute a value and hand it back. Step 1: pass the input through the void pointer. Step 2: the thread allocates the result on the heap, because its own stack disappears when it returns. Step 3: main checks the return code of pthread_create and prints the error with strerror, since pthread functions do not set errno. Step 4: pthread_join stores the thread's return value in res, and main frees it.",
        code: {
          lang: "c",
          code: String.raw`#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static void *square(void *arg) {
  long n = *(long *)arg, *out = malloc(sizeof *out);  /* heap outlives the thread */
  if (out) *out = n * n;
  return out; }
int main(void) {
  long n = 7; pthread_t t; void *res;
  int rc = pthread_create(&t, NULL, square, &n);
  if (rc) { fprintf(stderr, "pthread_create: %s\n", strerror(rc)); return 1; }
  pthread_join(t, &res);
  if (res) { printf("%ld\n", *(long *)res); free(res); }
  return 0; }`,
        },
      },
      {
        title: "Look at a running program's threads",
        explanation: "A server feels slow and you want to know which thread is busy. Step 1: list the threads of the process; each line has its own TID in the SPID column. Step 2: top -H shows CPU use per thread, and names set with pthread_setname_np appear there. Step 3: each thread is also a folder under /proc/PID/task, where you can read its status and what it is waiting on. Step 4: gdb can attach and print a backtrace of every thread.",
        code: {
          lang: "bash",
          code: String.raw`PID=$(pidof myserver)
ps -T -p "$PID"                     # one line per thread
top -H -p "$PID"                    # live CPU use per thread
ls /proc/"$PID"/task                # one folder per TID
grep Threads /proc/"$PID"/status    # thread count
sudo gdb -p "$PID" -batch -ex "thread apply all bt"`,
        },
      },
    ],
    cheatSheet: [
      "Compile and link with gcc -pthread; never forget it on the link line",
      "pthread_create(&t, NULL, fn, arg) returns 0 or an error number, never -1",
      "pthread_join(t, &ret) waits and frees; join each joinable thread exactly once",
      "pthread_detach(pthread_self()) makes a thread clean up after itself",
      "Return heap memory or fill the argument struct; never return a pointer to a local",
      "Returning from main ends all threads; pthread_exit(NULL) in main does not",
      "pthread_attr_setstacksize shrinks the default 8 MiB stack for many threads",
      "ps -T -p PID and top -H show threads; gettid() gives the kernel thread ID",
    ],
    quiz: [
      {
        q: "pthread_create fails. How do you get the reason?",
        options: ["Call perror, because errno is set", "Read the return value, which is the error number", "Check whether the pthread_t is NULL", "Call pthread_join to collect the error"],
        answer: 1,
        why: "pthread functions return the error code directly and do not set errno.",
      },
      {
        q: "main starts four worker threads and then returns 0 without joining. What happens?",
        options: ["The workers keep running in the background", "main waits for the workers automatically", "The workers become zombie processes", "The whole process exits and all workers stop at once"],
        answer: 3,
        why: "Returning from main calls exit, which ends every thread in the process.",
      },
      {
        q: "Which of these is NOT shared between threads of one process?",
        options: ["The stack of local variables", "Open file descriptors", "Global variables", "Signal handlers"],
        answer: 0,
        why: "Each thread has its own stack and registers; nearly everything else is shared.",
      },
      {
        q: "Why is returning the address of a local array from a thread function a bug?",
        options: ["Local arrays are always read-only", "pthread_join cannot accept arrays", "The thread's stack is freed when the thread ends, so the pointer dangles", "The array is copied to every other thread"],
        answer: 2,
        why: "Locals live on the thread's stack, which is released after the thread exits.",
      },
      {
        q: "How does Linux implement a POSIX thread?",
        options: ["As a kernel task created with clone that shares memory with its process", "As a user-space coroutine scheduled by glibc only", "As a separate process with copied memory", "As a signal handler that runs in a loop"],
        answer: 0,
        why: "NPTL maps each pthread one-to-one onto a kernel task created by clone with sharing flags.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start 5 threads that each print \"hello from thread N\" with the correct N (0 to 4), then join them all.",
        hint: "Do not pass &i. Give each thread its own slot in an array of ints.",
        solution: String.raw`#include <pthread.h>
#include <stdio.h>
static void *hello(void *arg) { printf("hello from thread %d\n", *(int *)arg); return NULL; }
int main(void) {
  pthread_t t[5]; int id[5];
  for (int i = 0; i < 5; i++) { id[i] = i; if (pthread_create(&t[i], NULL, hello, &id[i])) return 1; }
  for (int i = 0; i < 5; i++) pthread_join(t[i], NULL);
  return 0;
}`,
      },
      {
        level: "medium",
        task: "Sum an array of 10 million longs with 4 threads. Each thread sums its own slice into its argument struct, and main adds the 4 partial sums.",
        hint: "struct part { const long *a; size_t from, to; long sum; }; no locks are needed because each thread writes only its own struct.",
        solution: String.raw`struct part { const long *a; size_t from, to; long sum; };
static void *sum(void *arg) {
  struct part *p = arg; p->sum = 0;
  for (size_t i = p->from; i < p->to; i++) p->sum += p->a[i];
  return NULL;
}
/* in main: size_t chunk = N / 4;
   parts[i] = (struct part){ a, i * chunk, i == 3 ? N : (i + 1) * chunk, 0 };
   pthread_create(&t[i], NULL, sum, &parts[i]);
   then join all and total += parts[i].sum; */`,
      },
      {
        level: "hard",
        task: "Start 2000 threads that each sleep for one second, first with default attributes and then with a 64 KiB stack. Compare VmSize in /proc/self/status while they run.",
        hint: "Use pthread_attr_init, pthread_attr_setstacksize, and pass the attr to pthread_create. Check every return code.",
        solution: String.raw`pthread_attr_t at; pthread_attr_init(&at);
int rc = pthread_attr_setstacksize(&at, 64 * 1024);
if (rc) { fprintf(stderr, "%s\n", strerror(rc)); return 1; }
for (int i = 0; i < 2000; i++)
  if ((rc = pthread_create(&t[i], &at, nap, NULL))) {
    fprintf(stderr, "thread %d: %s\n", i, strerror(rc)); break; }
system("grep VmSize /proc/$PPID/status");   /* or read it from another shell */
pthread_attr_destroy(&at);
/* default: about 2000 x 8 MiB = 16 GB virtual; 64 KiB: about 128 MB */`,
      },
    ],
    faq: [
      { q: "Should I use -pthread or -lpthread?", a: "Use -pthread on both the compile and the link command. It links the library and also sets compiler macros for thread-safe code, which -lpthread alone does not." },
      { q: "How many threads can a Linux process have?", a: "Thousands are fine. Limits come from /proc/sys/kernel/threads-max, the per-user process limit (ulimit -u counts threads), and address space for stacks. More threads than CPU cores rarely helps CPU-bound work." },
      { q: "Are threads faster than processes?", a: "Creating and switching threads is cheaper, and sharing data needs no copying. But processes are safer: one crash does not take down the others. Web servers like nginx use processes, many databases use threads, and both work well." },
      { q: "Is printf thread-safe?", a: "Yes, glibc stdio functions lock the stream, so lines from different threads will not mix inside one call. Output from separate calls can still interleave in any order." },
    ],
  },

  "lsp-threads/mutexes": {
    plain: [
      "Imagine two cashiers updating the same paper ledger. Both read \"100\", both add 10, both write \"110\". One sale vanished. That is a race condition: the result depends on the exact timing of two threads.",
      "The fix is a lock. Before touching the ledger, a cashier takes the only pen. The other cashier must wait until the pen comes back. In code, the pen is a mutex (short for mutual exclusion). pthread_mutex_lock takes it, pthread_mutex_unlock gives it back.",
      "The code between lock and unlock is the critical section. Keep it small: only the lines that touch the shared data. If a thread does slow work while holding the lock, every other thread just stands in line.",
      "Races are sneaky. A racy program can pass tests a thousand times and fail on a busy server. So do not trust \"it worked\". Use ThreadSanitizer, a compiler option that watches memory accesses while the program runs and reports races with exact line numbers.",
    ],
    deepDive: [
      {
        heading: "Why counter++ breaks, even on one line",
        body: "counter++ looks like one step, but the CPU does three: load the value into a register, add one, store it back. If two threads load the same old value, both store the same new value and one increment is lost. With two threads doing a million increments each, you often see a total like 1,2xx,xxx instead of 2,000,000.\n\nThe C standard goes further: a data race is undefined behaviour. The compiler may keep the value in a register for the whole loop, or merge stores, because it assumes no other thread is looking. That is why marking the variable volatile does not fix anything. volatile stops some optimisations, but it does not make the read-add-write a single step, and it does not order memory between threads. Only a lock or an atomic operation does.",
        bullets: ["Race on a 64-bit counter: lost updates", "Race on a pointer or struct: torn or half-updated data, crashes", "volatile is for hardware registers and signal flags, not threads"],
      },
      {
        heading: "What a mutex does under the hood",
        body: "On Linux, a glibc mutex is a small integer in your memory plus the futex system call. Locking a free mutex is a single atomic compare-and-swap in user space: no system call, just tens of nanoseconds. Only when the mutex is already taken does the thread call futex to sleep in the kernel. Unlock sets the value back and, if someone is sleeping, calls futex to wake one waiter.\n\nA mutex also gives memory ordering. Everything a thread wrote before unlock is visible to the next thread after its lock. That guarantee is what makes the data inside the critical section safe, not just the mutual exclusion. This is also why every access, including reads, must hold the lock: a reader without the lock gets no ordering guarantee.",
        visual: {
          type: "flow",
          title: "pthread_mutex_lock: fast and slow path",
          steps: [
            { label: "Try atomic swap 0 to 1", detail: "Done in user space, no syscall" },
            { label: "Success: you own it", detail: "Uncontended case, very cheap" },
            { label: "Already taken", detail: "Mark the mutex as having waiters" },
            { label: "futex wait", detail: "Thread sleeps in the kernel" },
            { label: "Owner unlocks", detail: "futex wake lets one waiter retry" },
          ],
        },
      },
      {
        heading: "Scoping locks: what to protect and for how long",
        body: "Decide which data each mutex protects and write it down as a comment next to the data. A common, clean design puts the mutex inside the struct it guards, so the lock travels with the data.\n\nThen keep critical sections short. Do the slow parts (file or network I/O, malloc of big buffers, formatting, sleeping) before taking the lock or after releasing it. A useful trick is copy-out: lock, copy the few fields you need into locals, unlock, then work on the copy.\n\nGranularity is a trade-off. One big lock for everything is easy to get right but makes threads queue up. One lock per object lets threads work in parallel but brings the risk of deadlock when code needs two locks. Start coarse, measure contention with perf or by timing, then split only the hot lock.",
        visual: {
          type: "compare",
          title: "Coarse vs fine-grained locking",
          columns: [
            { title: "One global lock", points: ["Simple to reason about", "No lock-ordering problems", "Threads wait on each other", "Good starting point"] },
            { title: "Lock per object", points: ["Threads run in parallel", "More code and more memory", "Two locks can deadlock", "Use for proven hot spots"] },
          ],
        },
      },
      {
        heading: "Mutex types and unlocking on every path",
        body: "A mutex created with PTHREAD_MUTEX_INITIALIZER is the default type: locking it twice from the same thread hangs forever, and unlocking a mutex you do not own is undefined. While developing, an error-checking mutex helps: set PTHREAD_MUTEX_ERRORCHECK with pthread_mutexattr_settype, and a relock returns EDEADLK instead of hanging. A recursive mutex lets the owner lock again, but it usually hides a design problem.\n\nThe most common real bug is a forgotten unlock on an error path: return in the middle of a critical section and the next thread waits forever. Use a single exit point with goto out, or put the locked part in a small helper function that always unlocks before returning. Mutexes created with pthread_mutex_init should be released with pthread_mutex_destroy when no thread uses them any more.",
        bullets: ["pthread_mutex_init(&m, NULL) for mutexes inside malloc'd structs", "ERRORCHECK type turns silent hangs into EDEADLK", "One exit label: lock, work, out: unlock, return"],
      },
      {
        heading: "Finding races with ThreadSanitizer",
        body: "ThreadSanitizer (TSan) is built into gcc and clang. Compile with -fsanitize=thread -g -O1 and run the program normally. TSan records which thread touched which memory and which locks it held. When two threads touch the same address without ordering and one of them writes, it prints WARNING: ThreadSanitizer: data race with both stack traces.\n\nTSan finds races that actually happen in that run, so drive the code with a real workload or a stress test. It costs about 5 to 15 times slower execution and 5 to 10 times more memory, so use it in CI and testing, not in production. It cannot be combined with AddressSanitizer in the same build. valgrind --tool=helgrind is a slower alternative that needs no recompile.",
        bullets: ["gcc -fsanitize=thread -g -O1 race.c -o race", "Run tests in a loop to make rare races show up", "Fix the race; do not add sleeps to hide it"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Fixing a race step by step",
        steps: [
          { label: "Reproduce", detail: "Stress test with many threads and loops" },
          { label: "Detect", detail: "Build with -fsanitize=thread and run" },
          { label: "Name the shared data", detail: "Read both stack traces in the report" },
          { label: "Guard every access", detail: "Same mutex for all reads and writes" },
          { label: "Verify", detail: "Rerun TSan and stress test until clean" },
        ],
      },
    ],
    examples: [
      {
        title: "Reading a ThreadSanitizer report",
        explanation: "Take the explainer's counter program, remove the lock calls and build it with TSan. Step 1: compile with -fsanitize=thread and debug info. Step 2: run it. Step 3: read the report. It names the kind of access (write of size 8), the address, and the two threads with file and line. Both point at counter++ in inc, so counter is the shared data. Step 4: add the mutex back and rerun; the warning disappears and the total is always 2000000.",
        code: {
          lang: "bash",
          code: String.raw`gcc -fsanitize=thread -g -O1 race.c -o race -pthread
./race
# WARNING: ThreadSanitizer: data race (pid=4242)
#   Write of size 8 at 0x55d1c8e4b018 by thread T2:
#     #0 inc race.c:7
#   Previous write of size 8 at 0x55d1c8e4b018 by thread T1:
#     #0 inc race.c:7
#   Location is global 'counter' of size 8 at 0x55d1c8e4b018
# SUMMARY: ThreadSanitizer: data race race.c:7 in inc`,
        },
      },
      {
        title: "Shrinking a critical section with copy-out",
        explanation: "A logger thread prints shared statistics every second. The first version held the lock while calling fprintf, so worker threads stalled whenever the disk was slow. Step 1: lock the mutex. Step 2: copy the struct into a local variable (a few bytes, fast). Step 3: unlock. Step 4: format and write the copy at leisure. Workers now wait for a memcpy, not for disk I/O.",
        code: {
          lang: "c",
          code: String.raw`#include <pthread.h>
#include <stdio.h>
struct stats {
  pthread_mutex_t lock;     /* protects all fields below */
  long requests, errors, bytes;
};
void print_stats(struct stats *s, FILE *out) {
  pthread_mutex_lock(&s->lock);
  long req = s->requests, err = s->errors, bytes = s->bytes;   /* copy out */
  pthread_mutex_unlock(&s->lock);
  fprintf(out, "req=%ld err=%ld bytes=%ld\n", req, err, bytes); /* slow part, no lock */
}`,
        },
      },
    ],
    cheatSheet: [
      "static pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER; for globals",
      "pthread_mutex_init(&s->m, NULL) and pthread_mutex_destroy for heap structs",
      "Every read and every write of shared data must hold the same mutex",
      "volatile does not make code thread-safe; use a mutex or C11 atomics",
      "Never do I/O, sleep or call unknown code while holding a lock",
      "gcc -fsanitize=thread -g -O1 finds races; not combinable with -fsanitize=address",
      "valgrind --tool=helgrind ./prog finds races without recompiling",
      "PTHREAD_MUTEX_ERRORCHECK makes a double lock return EDEADLK instead of hanging",
    ],
    quiz: [
      {
        q: "Two threads each run counter++ one million times without a lock. What is the most likely final value?",
        options: ["Exactly 2,000,000", "Exactly 1,000,000", "Some value up to 2,000,000 that changes between runs", "The program always crashes"],
        answer: 2,
        why: "Lost updates happen at random moments, so the total is usually short of 2,000,000 and varies.",
      },
      {
        q: "A reader thread reads a shared struct without the mutex, while writers use it. Is that safe?",
        options: ["Yes, reads never cause races", "Yes, if the struct is small", "Only on x86 CPUs", "No, it is still a data race because a writer may change it at the same time"],
        answer: 3,
        why: "A race needs only one writer; the reader can see a half-updated struct and gets no ordering guarantee.",
      },
      {
        q: "What does locking an uncontended glibc mutex cost?",
        options: ["An atomic operation in user space, with no system call", "Always one futex system call", "A context switch to the kernel scheduler", "Allocating memory with malloc"],
        answer: 0,
        why: "The futex design only enters the kernel when a thread actually has to wait.",
      },
      {
        q: "Which change usually reduces lock contention the most?",
        options: ["Making the shared variable volatile", "Moving slow I/O out of the critical section", "Calling pthread_mutex_lock twice", "Adding sleep calls between operations"],
        answer: 1,
        why: "Time spent holding the lock is time every other thread waits, and I/O is the slowest part.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run the explainer's counter program without the lock 5 times and write down the totals. Then build it with -fsanitize=thread and find the line TSan reports.",
        hint: "Use a shell loop: for i in 1 2 3 4 5; do ./race; done",
        solution: String.raw`gcc -O2 -pthread race.c -o race
for i in 1 2 3 4 5; do ./race; done     # totals vary, mostly below 2000000
gcc -fsanitize=thread -g -O1 -pthread race.c -o race_tsan
./race_tsan 2>&1 | grep -A3 "data race"
# the report points at the counter++ line inside inc`,
      },
      {
        level: "medium",
        task: "Make a stack of ints safe for many threads: push and pop share one mutex, and pop returns 0 on success or -1 if the stack is empty. Unlock on every path.",
        hint: "Put the mutex in the struct. Use one exit point so the empty case cannot skip the unlock.",
        solution: String.raw`struct stack { pthread_mutex_t m; int items[1024]; int n; };
int push(struct stack *s, int v) {
  int rc = -1; pthread_mutex_lock(&s->m);
  if (s->n < 1024) { s->items[s->n++] = v; rc = 0; }
  pthread_mutex_unlock(&s->m); return rc;
}
int pop(struct stack *s, int *out) {
  int rc = -1; pthread_mutex_lock(&s->m);
  if (s->n > 0) { *out = s->items[--s->n]; rc = 0; }
  pthread_mutex_unlock(&s->m); return rc;
}`,
      },
      {
        level: "hard",
        task: "Make the locked counter fast: 4 threads each do 10 million increments. Compare locking per increment with counting in a local variable and adding to the shared total once at the end. Time both.",
        hint: "Same correct result, but one version takes the lock 40 million times and the other 4 times.",
        solution: String.raw`static void *inc_local(void *arg) {
  long local = 0;
  for (long i = 0; i < 10000000; i++) local++;   /* no sharing, no lock */
  pthread_mutex_lock(&lock);
  counter += local;                              /* one locked add */
  pthread_mutex_unlock(&lock);
  return arg;
}
/* time ./per_inc vs time ./local: the local version is many times faster */`,
      },
    ],
    faq: [
      { q: "Do I need a mutex just to read a variable?", a: "Yes, if any other thread may write it at the same time. Without a lock or an atomic, the read is a data race and may see stale or half-written data." },
      { q: "What is the difference between a mutex and a semaphore?", a: "A mutex has an owner and only that thread may unlock it; it guards data. A semaphore is a counter any thread can raise or lower, used to limit how many threads use a resource or to signal events." },
      { q: "Is a spinlock better than a mutex?", a: "Rarely in user space. A spinlock burns CPU while waiting and does badly if the holder is descheduled. glibc mutexes already spin briefly in the cheap case, so use pthread_mutex_t unless you have measured otherwise." },
    ],
  },

  "lsp-threads/condition-variables": {
    plain: [
      "Sometimes a thread must wait until something happens: a job arrives, a buffer has space, a file finished loading. Checking again and again in a loop (busy waiting) wastes a whole CPU core. A condition variable lets the thread sleep and be woken when the situation may have changed.",
      "A condition variable does not hold any data. It is only a doorbell. The real information, such as \"the queue has 3 items\", lives in normal variables protected by a mutex. The waiting thread checks those variables, and if the answer is \"not yet\", it rings off and sleeps.",
      "The other side changes the variables while holding the mutex, then rings the bell with pthread_cond_signal (wake one sleeper) or pthread_cond_broadcast (wake all sleepers).",
      "The classic use is a producer-consumer queue. Producers add jobs, consumers take them. If the queue is full, producers sleep. If it is empty, consumers sleep. Almost every thread pool, logger and web server is built on this pattern.",
    ],
    deepDive: [
      {
        heading: "Why the wait must release the mutex atomically",
        body: "Picture a consumer that checks \"is the queue empty?\", sees yes, and then goes to sleep. If a producer adds an item and signals in the tiny gap between the check and the sleep, the signal reaches nobody. The consumer then sleeps forever even though work is waiting. This is the lost wakeup problem.\n\npthread_cond_wait solves it by taking the mutex as an argument. The consumer checks the condition while holding the mutex, so the producer cannot change the queue in between. Then wait releases the mutex and starts sleeping as one indivisible step. When woken, it takes the mutex again before returning. So your code always sees the shared state while holding the lock, both before and after the wait.",
        visual: {
          type: "sequence",
          title: "Lost wakeup without the mutex",
          actors: ["Consumer", "Queue state", "Producer"],
          messages: [
            { from: 0, to: 1, label: "check: queue is empty" },
            { from: 2, to: 1, label: "add an item" },
            { from: 2, to: 0, label: "signal: nobody is waiting yet" },
            { from: 0, to: 0, label: "go to sleep: misses the item" },
            { from: 0, to: 1, label: "Fix: check and wait under the mutex" },
          ],
        },
      },
      {
        heading: "Why while and not if: spurious and stolen wakeups",
        body: "When pthread_cond_wait returns, the condition might be false again, for two reasons. First, POSIX allows spurious wakeups: the wait may return even though nobody signalled, because of how futexes and signals are implemented. Second, and more common in practice, the wakeup can be stolen. A producer adds one item and signals. Before the woken consumer gets the mutex back, a different consumer that was just arriving grabs the lock and takes the item. By the time the first one runs, the queue is empty again.\n\nThe cure for both is the same: loop. while (count == 0) pthread_cond_wait(...). Treat a wakeup as a hint to look again, never as a promise. The condition in the while loop, read under the mutex, is the only truth.",
        bullets: ["while (!ready) pthread_cond_wait(&cv, &m);", "The predicate lives in your variables, not in the condition variable", "A condition variable remembers nothing: a signal with no waiters is lost"],
      },
      {
        heading: "signal or broadcast?",
        body: "pthread_cond_signal wakes at least one waiting thread. Use it when any single waiter can make progress and one change helps exactly one thread, like one item added to a queue.\n\npthread_cond_broadcast wakes every waiter. Use it when the change may let many threads proceed (a shutdown flag, a barrier opening, a large batch of items) or when different threads wait on one condition variable for different reasons. If unsure, broadcast is always correct, because every thread re-checks its own condition; signal is an optimisation. The cost of broadcast is the thundering herd: many threads wake, fight for the mutex, and most go back to sleep.\n\nYou may signal while holding the mutex or right after unlocking. Both are correct, as long as the shared state was changed under the mutex.",
      },
      {
        heading: "Shutting a queue down cleanly",
        body: "A worker blocked in pthread_cond_wait will never notice that you want to exit unless you tell it. Add a closed flag to the queue. To shut down: lock, set closed = 1, broadcast on both conditions, unlock. Consumers change their loop to while (count == 0 && !closed) wait, and after waking they return a \"no more work\" result when the queue is empty and closed. Producers refuse new items once closed.\n\nThen join every worker. This drains the remaining jobs before exit instead of losing them. Avoid pthread_cancel for this: cancelling a thread inside a critical section is hard to get right, while a flag plus broadcast is simple and predictable.",
        bullets: ["closed flag + broadcast = clean shutdown", "Consumers finish queued work, then return", "Join workers after closing the queue"],
      },
      {
        heading: "Waiting with a timeout",
        body: "pthread_cond_timedwait takes an absolute deadline, not a duration. By default that deadline is measured on CLOCK_REALTIME, the wall clock, so if NTP or an admin changes the time, your timeout can fire far too early or late. Create the condition variable with pthread_condattr_setclock(&attr, CLOCK_MONOTONIC) and compute the deadline from clock_gettime(CLOCK_MONOTONIC) to avoid that. glibc 2.30 and later also offer pthread_cond_clockwait, which takes the clock as an argument.\n\nThe call returns ETIMEDOUT when the deadline passes, and it reacquires the mutex in that case too. Because of spurious wakeups, keep the while loop and compute the deadline once before the loop, so repeated wakeups do not keep pushing it later.",
        bullets: ["Deadline = now + timeout, computed once", "rc == ETIMEDOUT: give up, but you still hold the mutex", "Prefer CLOCK_MONOTONIC for timeouts"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Producer and consumer around a bounded queue",
        actors: ["Producer", "Queue (mutex)", "Consumer"],
        messages: [
          { from: 2, to: 1, label: "lock; count is 0; wait on not_empty" },
          { from: 0, to: 1, label: "lock; add item; count = 1" },
          { from: 0, to: 2, label: "signal not_empty; unlock" },
          { from: 2, to: 1, label: "wakes holding the lock; count is 1, take item" },
          { from: 2, to: 0, label: "signal not_full; unlock" },
          { from: 2, to: 2, label: "process the item outside the lock" },
        ],
      },
    ],
    examples: [
      {
        title: "The producer side with a shutdown flag",
        explanation: "The explainer shows get(). Here is the matching put() plus close(). Step 1: put locks and waits on not_full while the buffer is full and the queue is still open. Step 2: if the queue was closed, it refuses the item. Step 3: otherwise it stores the item at the tail, raises count, and signals not_empty for one consumer. Step 4: close sets the flag and broadcasts on both conditions, because every waiter must wake up and notice. Consumers should loop on count == 0 && !closed and return -1 when the queue is empty and closed.",
        code: {
          lang: "c",
          code: String.raw`static int closed;   /* protected by m, like buf, head and count */
int put(int v) {
  pthread_mutex_lock(&m);
  while (count == CAP && !closed) pthread_cond_wait(&not_full, &m);
  if (closed) { pthread_mutex_unlock(&m); return -1; }
  buf[(head + count) % CAP] = v; count++;
  pthread_cond_signal(&not_empty);
  pthread_mutex_unlock(&m);
  return 0;
}
void close_queue(void) {
  pthread_mutex_lock(&m); closed = 1;
  pthread_cond_broadcast(&not_empty); pthread_cond_broadcast(&not_full);
  pthread_mutex_unlock(&m);
}`,
        },
      },
      {
        title: "Wait at most 2 seconds for a result",
        explanation: "A thread waits for a worker to set ready, but must not hang forever. Step 1: create the condition variable with a monotonic clock so time changes do not matter. Step 2: compute the absolute deadline once. Step 3: loop on the predicate, because wakeups can be spurious. Step 4: stop on ETIMEDOUT. In both cases the mutex is held after the wait, so unlock once at the end.",
        code: {
          lang: "c",
          code: String.raw`pthread_condattr_t ca; pthread_condattr_init(&ca);
pthread_condattr_setclock(&ca, CLOCK_MONOTONIC);
pthread_cond_init(&cv, &ca);                 /* done once at startup */

struct timespec dl; clock_gettime(CLOCK_MONOTONIC, &dl);
dl.tv_sec += 2;                               /* deadline, not a duration */
int rc = 0;
pthread_mutex_lock(&m);
while (!ready && rc != ETIMEDOUT) rc = pthread_cond_timedwait(&cv, &m, &dl);
int got = ready;                              /* read the predicate under the lock */
pthread_mutex_unlock(&m);
if (!got) fprintf(stderr, "timed out\n");`,
        },
      },
    ],
    cheatSheet: [
      "Pattern: lock; while (!cond) pthread_cond_wait(&cv, &m); use data; unlock",
      "Change shared state under the mutex, then signal or broadcast",
      "signal wakes at least one waiter; broadcast wakes all; a signal with no waiter is lost",
      "Bounded queue = 1 mutex + 2 condition variables: not_empty and not_full",
      "Shutdown: set closed under the lock, broadcast, then join the workers",
      "pthread_cond_timedwait takes an absolute time and returns ETIMEDOUT",
      "Use pthread_condattr_setclock(CLOCK_MONOTONIC) for timeouts",
    ],
    quiz: [
      {
        q: "Why does pthread_cond_wait take a mutex as an argument?",
        options: ["To release it and start sleeping as one atomic step, so no signal is missed", "To lock it for the signalling thread", "Because condition variables store data inside the mutex", "To make the wait faster"],
        answer: 0,
        why: "Releasing and sleeping atomically closes the gap where a signal could be lost.",
      },
      {
        q: "A producer adds 10 items at once. Which call wakes enough consumers?",
        options: ["One pthread_cond_signal", "pthread_mutex_unlock alone", "pthread_cond_broadcast, or one signal per item", "pthread_cond_wait"],
        answer: 2,
        why: "One signal may wake only one consumer, leaving others asleep while items wait.",
      },
      {
        q: "A producer signals while no thread is waiting. What happens to the signal?",
        options: ["It is queued for the next waiter", "It is lost, which is fine if the state was updated first", "It causes a spurious wakeup later", "It returns an error"],
        answer: 1,
        why: "Condition variables have no memory; the next waiter sees the updated state when it checks the predicate.",
      },
      {
        q: "pthread_cond_timedwait returned ETIMEDOUT. Do you hold the mutex?",
        options: ["No, it was released for good", "Only if the wait succeeded", "Only on CLOCK_MONOTONIC", "Yes, it is reacquired before returning in every case"],
        answer: 3,
        why: "The wait always relocks the mutex before returning, so you must still unlock it.",
      },
      {
        q: "What is a stolen wakeup?",
        options: ["Another thread grabs the lock and consumes the item before the woken thread runs", "A signal sent to the wrong process", "A wakeup caused by a hardware interrupt", "A deadlock between two condition variables"],
        answer: 0,
        why: "That is why the woken thread must re-check the condition in a while loop.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make main wait until a worker thread sets ready = 1, using a mutex and a condition variable instead of a busy loop.",
        hint: "The worker sets ready under the mutex and signals; main waits in a while loop.",
        solution: String.raw`static pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t cv = PTHREAD_COND_INITIALIZER;
static int ready;
static void *worker(void *arg) {
  pthread_mutex_lock(&m); ready = 1; pthread_cond_signal(&cv); pthread_mutex_unlock(&m);
  return arg;
}
/* main: pthread_create(&t, NULL, worker, NULL);
   pthread_mutex_lock(&m); while (!ready) pthread_cond_wait(&cv, &m);
   pthread_mutex_unlock(&m); pthread_join(t, NULL); */`,
      },
      {
        level: "medium",
        task: "Build a bounded queue of capacity 4 with 2 producers (each puts 1000 numbers) and 3 consumers. Check that consumers together receive exactly 2000 items.",
        hint: "Combine the explainer's get with the put and close_queue above. Close the queue after joining the producers.",
        solution: String.raw`/* consumers: while ((v = get_or_closed()) != -1) atomic_fetch_add(&received, 1);
   get_or_closed: while (count == 0 && !closed) wait(not_empty);
                  if (count == 0) { unlock; return -1; }  ... take item ...
   main: start 3 consumers and 2 producers
         join both producers
         close_queue();            wakes consumers blocked on an empty queue
         join the 3 consumers
         assert(received == 2000); */`,
      },
      {
        level: "hard",
        task: "Write a fixed thread pool: pool_submit(fn, arg) adds a job to a queue, N workers run jobs, and pool_shutdown() finishes queued jobs, then joins all workers.",
        hint: "Queue items are struct job { void (*fn)(void *); void *arg; }. Workers loop until get returns no job.",
        solution: String.raw`struct job { void (*fn)(void *); void *arg; };
static void *worker(void *unused) {
  struct job j;
  while (queue_get(&j) == 0) j.fn(j.arg);      /* run outside the lock */
  return unused;                               /* -1: closed and empty */
}
int pool_submit(void (*fn)(void *), void *arg) {
  return queue_put((struct job){ fn, arg });   /* -1 after shutdown */
}
void pool_shutdown(void) {
  close_queue();
  for (int i = 0; i < NWORKERS; i++) pthread_join(workers[i], NULL);
}`,
      },
    ],
    faq: [
      { q: "Can I use a condition variable without a mutex?", a: "No. pthread_cond_wait requires a locked mutex, and the shared state it waits on must be protected by that same mutex, or wakeups can be lost." },
      { q: "Do spurious wakeups really happen?", a: "They are allowed by POSIX and rare on Linux, but stolen wakeups from other threads are common. A while loop handles both, so always use one." },
      { q: "What is the difference between a condition variable and a semaphore?", a: "A semaphore stores a count, so a post with no waiter is remembered. A condition variable stores nothing; it only wakes threads that check a predicate you keep yourself." },
    ],
  },

  "lsp-threads/deadlocks": {
    plain: [
      "A deadlock is a traffic jam that never clears. Thread 1 holds lock A and waits for lock B. Thread 2 holds lock B and waits for lock A. Each waits for the other, forever. The program does not crash; it just stops doing anything, which is often harder to notice.",
      "The good news: deadlocks follow simple rules. The most useful one is to always take locks in the same order everywhere. If every thread takes A before B, the circle of waiting can never form.",
      "Not every shared value needs a full mutex. If many threads read data and only a few write it, a read-write lock lets the readers work at the same time. For a single counter or flag, C11 atomics do the job with no lock at all.",
      "When a program does hang, a debugger shows exactly where each thread is stuck, so you can see which locks form the circle.",
    ],
    deepDive: [
      {
        heading: "The four conditions, and how to break each",
        body: "Computer scientists (Coffman, 1971) showed that a deadlock needs four things at the same time. Mutual exclusion: a resource can be held by only one thread. Hold and wait: a thread keeps what it has while it waits for more. No preemption: nobody can take a lock away from its holder. Circular wait: there is a cycle of threads, each waiting for the next.\n\nRemove any one and deadlock is impossible. In practice you break circular wait with lock ordering, which costs almost nothing. You break hold and wait by taking all needed locks up front, or with trylock and back off. Mutual exclusion is broken by not locking at all (atomics, immutable data, one owner thread per piece of data). Preemption is rarely practical for locks, though databases do it by aborting one transaction.",
        visual: {
          type: "tree",
          title: "Deadlock needs all four; break one",
          root: "Deadlock",
          children: [
            { label: "Mutual exclusion", children: ["Use atomics or immutable data", "Give data to one owner thread"] },
            { label: "Hold and wait", children: ["Take all locks at once", "trylock, release, retry"] },
            { label: "No preemption", children: ["Abort and retry, as databases do"] },
            { label: "Circular wait", children: ["One global lock order", "The cheapest and most common fix"] },
          ],
        },
      },
      {
        heading: "Lock ordering in real code",
        body: "With fixed locks, write the order down: for example config_lock before cache_lock before stats_lock, and never the reverse. Some teams give each lock a level number and assert in debug builds that levels only go up.\n\nThe hard case is two objects of the same type, like moving money between two accounts. transfer(a, b) locks a then b, while transfer(b, a) locks b then a: a deadlock waiting to happen. The fix is to order by something stable and unique, such as an account ID or the memory address of the objects. Always lock the lower one first, whichever is the source.\n\nAlso watch for hidden locks. Calling a callback, a logging function or any library code while holding your lock may take another lock you cannot see, and create a cycle.",
        bullets: ["Document the order next to the lock declarations", "Same-type objects: lock the lower ID or address first", "Do not call unknown code while holding a lock"],
      },
      {
        heading: "Debugging a hung program",
        body: "If a process uses 0% CPU and stops responding, suspect a deadlock. Attach gdb with gdb -p PID, then run thread apply all bt. Threads stuck on a mutex show frames like __lll_lock_wait or futex_wait under pthread_mutex_lock, followed by your function and line. On glibc you can print the mutex in gdb (print lock) and read its __owner field, which holds the thread ID of the current owner. Follow owner to waiter to owner and you find the cycle.\n\nBetter still, catch ordering bugs before they hang. ThreadSanitizer reports lock-order-inversion (potential deadlock) when it sees two locks taken in both orders, even if the run did not actually deadlock. valgrind --tool=helgrind reports similar lock order violations.",
        visual: {
          type: "flow",
          title: "From hang to root cause",
          steps: [
            { label: "Process hangs at 0% CPU", detail: "Check with top or ps" },
            { label: "gdb -p PID", detail: "Attach to the live process" },
            { label: "thread apply all bt", detail: "Find threads inside pthread_mutex_lock" },
            { label: "print the mutex", detail: "__owner gives the holder's TID" },
            { label: "Follow the cycle", detail: "Fix the order, then test with TSan" },
          ],
        },
      },
      {
        heading: "Read-write locks for read-heavy data",
        body: "A pthread_rwlock_t lets many readers hold the lock together, or one writer alone. Readers call pthread_rwlock_rdlock, writers call pthread_rwlock_wrlock, and both release with pthread_rwlock_unlock. It suits data that is read constantly and changed rarely, such as a routing table or loaded configuration.\n\nTwo cautions. First, a rwlock is more expensive than a mutex, because even readers update a shared counter. If the critical section is only a few instructions, a plain mutex is usually faster; measure before switching. Second, glibc's default rwlock prefers readers, so a steady stream of readers can starve a writer forever. If writers must make progress, set PTHREAD_RWLOCK_PREFER_WRITER_NONRECURSIVE_NP with pthread_rwlockattr_setkind_np (a GNU extension). A reader must never try to upgrade to a writer while holding the read lock; two readers doing that deadlock each other.",
      },
      {
        heading: "C11 atomics for simple counters and flags",
        body: "For one integer or pointer, C11 atomics from stdatomic.h avoid locks completely. Declare atomic_long hits; and call atomic_fetch_add(&hits, 1). The CPU performs the read, add and write as one indivisible instruction, so no update is lost. A stop flag can be an atomic_bool that the main thread sets and workers read.\n\nBy default every atomic operation uses sequentially consistent ordering, the strongest and simplest model. For a pure statistics counter, atomic_fetch_add_explicit(&hits, 1, memory_order_relaxed) is enough and slightly cheaper. atomic_compare_exchange_strong lets you build lock-free updates, but this gets subtle fast.\n\nThe limit is important: atomics protect one variable at a time. If two fields must change together (head and count of a queue, balance in two accounts), you still need a mutex.",
        bullets: ["atomic_long n = 0; atomic_fetch_add(&n, 1);", "atomic_load and atomic_store for flags", "Several variables that must agree still need a mutex"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Choosing a synchronisation tool",
        columns: [
          { title: "Mutex", points: ["Protects any amount of data", "One thread at a time", "Cheap when uncontended", "The default choice"] },
          { title: "Read-write lock", points: ["Many readers or one writer", "Higher cost per operation", "Wins when reads dominate and sections are long", "glibc default can starve writers"] },
          { title: "C11 atomic", points: ["One variable only", "No lock, no blocking", "Counters, flags, pointers", "Cannot keep two fields consistent"] },
        ],
      },
    ],
    examples: [
      {
        title: "A deadlock-free money transfer",
        explanation: "Each account has its own mutex. A naive transfer locks from then to, so transfer(a, b) and transfer(b, a) running together deadlock. Step 1: pick a stable, unique order: the account ID. Step 2: always lock the account with the lower ID first, whichever direction the money moves. Step 3: refuse a transfer from an account to itself, because locking the same default mutex twice also hangs. Step 4: check the balance and move the money while both locks are held, then unlock both.",
        code: {
          lang: "c",
          code: String.raw`#include <pthread.h>
struct account { int id; long balance; pthread_mutex_t m; };
int transfer(struct account *from, struct account *to, long amount) {
  if (from == to) return -1;
  struct account *first  = from->id < to->id ? from : to;
  struct account *second = from->id < to->id ? to : from;
  pthread_mutex_lock(&first->m);
  pthread_mutex_lock(&second->m);
  int ok = from->balance >= amount;
  if (ok) { from->balance -= amount; to->balance += amount; }
  pthread_mutex_unlock(&second->m);
  pthread_mutex_unlock(&first->m);
  return ok ? 0 : -1;
}`,
        },
      },
      {
        title: "A read-mostly config with an atomic hit counter",
        explanation: "A server's request threads read the configuration on every request, and an admin command reloads it rarely. Step 1: guard the config pointer with a rwlock so request threads read in parallel. Step 2: the reload builds the new config without any lock, then takes the write lock only to swap the pointer. Step 3: the old config is freed after unlock. This is only safe because readers copy what they need before releasing the read lock and never keep the pointer. Step 4: count requests with an atomic, which needs no lock at all.",
        code: {
          lang: "c",
          code: String.raw`#include <pthread.h>
#include <stdatomic.h>
#include <stdlib.h>
static struct config { int max_clients; } *cfg;   /* loaded at startup */
static pthread_rwlock_t cfg_lock = PTHREAD_RWLOCK_INITIALIZER;
static atomic_long requests;
int get_max_clients(void) {
  atomic_fetch_add_explicit(&requests, 1, memory_order_relaxed);
  pthread_rwlock_rdlock(&cfg_lock);
  int v = cfg->max_clients;          /* copy out, do not keep the pointer */
  pthread_rwlock_unlock(&cfg_lock);
  return v; }
void reload(struct config *fresh) {  /* fresh was built without locks */
  pthread_rwlock_wrlock(&cfg_lock); struct config *old = cfg; cfg = fresh;
  pthread_rwlock_unlock(&cfg_lock); free(old); }`,
        },
      },
    ],
    cheatSheet: [
      "Deadlock needs: mutual exclusion, hold and wait, no preemption, circular wait",
      "Fix order once: always lock lower ID or address first",
      "gdb -p PID, then thread apply all bt: look for __lll_lock_wait",
      "In gdb, print mymutex shows __owner = TID of the thread holding it",
      "TSan reports lock-order-inversion before a real deadlock happens",
      "pthread_rwlock_rdlock / wrlock / unlock: many readers or one writer",
      "atomic_fetch_add(&n, 1) from stdatomic.h: lock-free counter",
      "pthread_mutex_trylock returns EBUSY instead of blocking",
    ],
    quiz: [
      {
        q: "Thread 1 locks A then B. Thread 2 locks B then A. Which deadlock condition does making both take A first remove?",
        options: ["Mutual exclusion", "No preemption", "Hold and wait", "Circular wait"],
        answer: 3,
        why: "With one global order, no cycle of waiting threads can form.",
      },
      {
        q: "A hung server shows several threads in __lll_lock_wait in gdb. What does that tell you?",
        options: ["They are blocked waiting to acquire a mutex", "They are reading from a socket", "They have crashed with SIGSEGV", "They are waiting on a condition variable timeout"],
        answer: 0,
        why: "__lll_lock_wait is glibc's slow path inside pthread_mutex_lock, where a thread sleeps on a futex.",
      },
      {
        q: "When is a read-write lock likely to be slower than a plain mutex?",
        options: ["When reads are very frequent and long", "When critical sections are tiny, a few instructions", "When there is only one writer", "Never; rwlocks are always faster"],
        answer: 1,
        why: "rwlocks have more overhead per operation, which only pays off when readers really overlap for a while.",
      },
      {
        q: "A queue keeps head and count, which must always agree. Can two separate atomics replace the mutex?",
        options: ["Yes, atomics are always enough", "Yes, if you use memory_order_relaxed", "No, atomics make each variable safe but not the two together", "Only on 64-bit CPUs"],
        answer: 2,
        why: "Another thread can run between the two atomic updates and see head and count out of step.",
      },
      {
        q: "Two threads each hold a read lock on the same rwlock and both call wrlock to upgrade. What happens?",
        options: ["Both get the write lock in turn", "The rwlock upgrades the first caller automatically", "One gets EBUSY and the other proceeds", "They deadlock, each waiting for the other's read lock"],
        answer: 3,
        why: "A writer waits for all readers to leave, and here each reader is waiting to become a writer.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Replace a mutex-protected request counter with a C11 atomic, and check that 4 threads doing 1 million increments each give exactly 4000000.",
        hint: "Include stdatomic.h, declare atomic_long, use atomic_fetch_add and atomic_load.",
        solution: String.raw`#include <stdatomic.h>
static atomic_long hits;
static void *work(void *arg) {
  for (int i = 0; i < 1000000; i++) atomic_fetch_add(&hits, 1);
  return arg;
}
/* main: start 4 threads, join them, then
   printf("%ld\n", atomic_load(&hits));   prints 4000000 every run */`,
      },
      {
        level: "medium",
        task: "Write a program that deadlocks on purpose with two mutexes and two threads (add a short sleep between the locks). Attach gdb and find which thread waits on which lock.",
        hint: "Thread 1: lock A, sleep 1, lock B. Thread 2: lock B, sleep 1, lock A. Build with -g.",
        solution: String.raw`gcc -g -pthread dl.c -o dl && ./dl &
gdb -p $! -batch -ex "info threads" -ex "thread apply all bt"
# Thread 2: pthread_mutex_lock (&B) called from t1 at dl.c:8
# Thread 3: pthread_mutex_lock (&A) called from t2 at dl.c:14
gdb -p $! -batch -ex "print A" -ex "print B"
# A.__data.__owner = TID of thread 2, B.__data.__owner = TID of thread 3
kill %1`,
      },
      {
        level: "hard",
        task: "Fix the deadlock above without a global lock order: use pthread_mutex_trylock for the second lock and back off with a random short delay on failure. Explain why it can still waste time.",
        hint: "If trylock returns EBUSY, unlock the first lock, sleep briefly, and start over.",
        solution: String.raw`for (;;) {
  pthread_mutex_lock(&A);
  if (pthread_mutex_trylock(&B) == 0) break;   /* got both */
  pthread_mutex_unlock(&A);                    /* EBUSY: back off */
  struct timespec d = { 0, (rand() % 1000) * 1000L };
  nanosleep(&d, NULL);                         /* random delay */
}
/* ... critical section ..., then unlock B and A */
/* Breaks hold and wait, but threads can keep retrying (livelock);
   random delays make that unlikely. Lock ordering is simpler. */`,
      },
    ],
    faq: [
      { q: "How do I know if my program is deadlocked or just slow?", a: "A deadlocked process usually sits at 0% CPU with threads blocked inside pthread_mutex_lock. Attach gdb and run thread apply all bt; if the same backtraces stay the same over several samples, it is stuck." },
      { q: "Can a single thread deadlock itself?", a: "Yes. Locking a default (non-recursive) mutex it already holds blocks forever. Calling a non-async-signal-safe function like malloc or printf from a signal handler can also deadlock on an internal lock." },
      { q: "Is it safe to call fork in a multithreaded program?", a: "Only the calling thread is copied into the child, but locks held by other threads stay locked there forever. After fork in a threaded program, call only async-signal-safe functions and exec soon." },
      { q: "What is a livelock?", a: "Threads keep running but make no progress, for example by repeatedly backing off and retrying at the same moment. Random back-off delays or a strict lock order prevent it." },
    ],
  },
};

export default extra;
