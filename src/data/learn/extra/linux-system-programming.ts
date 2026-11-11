import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  // ───────────── C for systems programming ─────────────
  "lsp-c-foundations/c-pointers-memory": {
    plain: [
      "Your computer's memory is like a very long street of numbered boxes. Each box holds one byte, and each box has a number called its address. A normal variable is a box with a value in it. A pointer is a box that holds the address of another box.",
      "Why bother? Because copying big things is slow and sometimes impossible. Instead of handing a function a whole 4 KB buffer, you hand it the address of the buffer. The function can then read or change the original. Almost every Linux call, like read or stat, works this way.",
      "C also makes you decide where data lives. Local variables sit on the stack and vanish when the function returns. Memory from malloc sits on the heap and stays until you call free. Most C bugs come from forgetting which one you are using.",
      "The good news: a handful of simple rules prevent most problems. Check what malloc returns, free each block exactly once, never return the address of a local variable, and set a pointer to NULL after freeing it.",
    ],
    deepDive: [
      {
        heading: "What the * and & symbols really do",
        body: "The & operator asks \"where does this live?\" and gives you an address. The * operator goes the other way: \"go to this address and use what is there\". So if int x = 7 and int *p = &x, then *p is 7, and writing *p = 9 changes x itself.\n\nThe type of a pointer matters. An int * tells the compiler that the box at that address holds an int, so *p reads 4 bytes (on Linux x86-64) and p + 1 moves forward by 4 bytes, not 1. A char * moves by 1 byte. A void * is a pointer with no type: you can store any address in it, but you must convert it to a real pointer type before using the data.",
        bullets: ["&x gives the address of x", "*p reads or writes the value at p", "p + 1 moves by sizeof(*p) bytes", "void * holds any address but cannot be dereferenced"],
      },
      {
        heading: "Stack, heap and static data in practice",
        body: "The stack is fast and automatic. Each function call gets a frame for its locals, and the frame disappears on return. It is small, usually 8 MB for the main thread, so huge local arrays can overflow it.\n\nThe heap is for data whose size you only know at run time, or that must outlive the function that made it. You ask for it with malloc or calloc and give it back with free. Forget free and you leak; free twice and you corrupt the allocator.\n\nStatic storage holds globals and static locals. It exists for the whole run of the program and starts as zero unless you give a value.",
        bullets: ["Stack: automatic, small, gone on return", "Heap: manual, large, lives until free", "Static: whole program lifetime, zero by default"],
      },
      {
        heading: "Passing pointers so a function can change your data",
        body: "C passes every argument by value, which means the function gets a copy. If you pass an int, changing it inside the function does nothing outside. To let a function change your variable, pass its address instead.\n\nThis is how many Linux APIs return more than one result. For example, stat fills in a struct stat that you own: you pass &st and the kernel writes into it. The same pattern appears with a pointer to a pointer. A function that allocates memory for you, such as getline, takes a char ** so it can update your char * to point at a new, bigger buffer.",
        visual: {
          type: "compare",
          title: "Passing a value vs passing its address",
          columns: [
            { title: "f(x): pass by value", points: ["f gets a copy of x", "Changes stay inside f", "x is unchanged after the call"] },
            { title: "f(&x): pass the address", points: ["f gets a pointer p to x", "*p = 9 writes into x", "x is changed after the call"] },
          ],
        },
      },
      {
        heading: "The bugs to watch for",
        body: "A dangling pointer points at memory that is no longer yours: a freed heap block or a stack frame that has returned. Using it may seem to work, then break later in a confusing way.\n\nAn out-of-bounds access reads or writes past the end of an array. C does not check this. A buffer of 10 ints has valid indexes 0 to 9, and a[10] silently touches whatever sits next door.\n\nA leak is heap memory you can no longer reach because you lost the last pointer to it. Short programs survive leaks, but long-running servers slowly run out of memory.",
        bullets: ["Set pointers to NULL after free", "Use sizeof *p in malloc so the size follows the type", "Keep an explicit length next to every buffer"],
        visual: {
          type: "tree",
          title: "Common C memory bugs",
          root: "Memory bugs",
          children: [
            { label: "Dangling pointer", children: ["Points at a freed block", "Or at a returned stack frame"] },
            { label: "Out of bounds", children: ["a[10] in a 10-int array", "C does not check"] },
            { label: "Leak", children: ["Last pointer to a block lost"] },
            { label: "Double free", children: ["Corrupts the allocator"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Life of a heap buffer",
        steps: [
          { label: "Declare", detail: "int *buf = NULL;" },
          { label: "Allocate", detail: "buf = malloc(n * sizeof *buf);" },
          { label: "Check", detail: "if (!buf) handle the error" },
          { label: "Use", detail: "Only indexes 0 to n - 1" },
          { label: "Free", detail: "free(buf); buf = NULL;" },
        ],
      },
    ],
    examples: [
      {
        title: "Swapping two numbers through pointers",
        explanation: "A swap function must change the caller's variables, so it takes their addresses. Inside, *a and *b are the caller's real boxes. We copy one value into a temporary, then move the values across. After the call, x and y in main have traded places. If swap took plain ints instead, it would only swap its own copies.",
        code: {
          lang: "c",
          code: "#include <stdio.h>\n\nstatic void swap(int *a, int *b) {\n  int tmp = *a;\n  *a = *b;\n  *b = tmp;\n}\n\nint main(void) {\n  int x = 1, y = 2;\n  swap(&x, &y);\n  printf(\"x=%d y=%d\\n\", x, y); /* x=2 y=1 */\n  return 0;\n}",
        },
      },
      {
        title: "Growing a buffer safely with realloc",
        explanation: "Say you read numbers but do not know how many will come. Start with room for 4, and double the capacity whenever it fills. The key detail is to store realloc's result in a temporary pointer first. If realloc fails it returns NULL but leaves the old block alive, so assigning straight to buf would leak it. Only after the check do we update buf and cap. It prints len=100 cap=128.",
        code: {
          lang: "c",
          code: "#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n  size_t cap = 4, len = 0;\n  int *buf = malloc(cap * sizeof *buf);\n  if (!buf) { perror(\"malloc\"); return 1; }\n  for (int v = 0; v < 100; v++) {\n    if (len == cap) {\n      int *tmp = realloc(buf, 2 * cap * sizeof *buf);\n      if (!tmp) { perror(\"realloc\"); free(buf); return 1; }\n      buf = tmp; cap *= 2;\n    }\n    buf[len++] = v;\n  }\n  printf(\"len=%zu cap=%zu\\n\", len, cap); free(buf); return 0; }",
        },
      },
    ],
    cheatSheet: [
      "int *p = &x;  then *p is x",
      "a[i] is exactly *(a + i)",
      "malloc(n * sizeof *p) keeps the size tied to the pointer's type",
      "calloc(n, size) gives zeroed memory and checks n * size for overflow",
      "Always check malloc and realloc for NULL",
      "Assign realloc to a temporary pointer, then swap it in",
      "free(NULL) is safe and does nothing",
      "Never return the address of a local variable",
    ],
    quiz: [
      {
        q: "If int a[5] starts at address 1000 and int is 4 bytes, what address does a + 2 hold?",
        options: ["1002", "1008", "1004", "1020"],
        answer: 1,
        why: "Pointer arithmetic moves in units of the pointed-to type, so 2 ints is 8 bytes.",
      },
      {
        q: "Why is buf = realloc(buf, n) risky?",
        options: ["realloc always moves the data", "realloc frees the new block", "If realloc fails, the old block's only pointer is overwritten with NULL and leaks", "realloc cannot grow a buffer"],
        answer: 2,
        why: "On failure realloc returns NULL but keeps the old block, so you must keep the old pointer.",
      },
      {
        q: "Where does a variable declared static inside a function live?",
        options: ["In static storage, for the whole run of the program", "On the stack", "On the heap", "In a CPU register"],
        answer: 0,
        why: "Static locals keep their value between calls because they live in the data or BSS segment.",
      },
      {
        q: "Which function signature lets the callee make the caller's char * point to a new buffer?",
        options: ["void f(char p)", "void f(char *p)", "void f(const char *p)", "void f(char **p)"],
        answer: 3,
        why: "To change a pointer you must pass the address of that pointer, which is a char **.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function sum(const int *a, size_t n) that returns the total of n ints, and call it on a stack array of 5 numbers.",
        hint: "Loop i from 0 to n - 1 and add a[i]. The array name decays to a pointer when passed.",
        solution: "#include <stdio.h>\nstatic long sum(const int *a, size_t n) {\n  long s = 0;\n  for (size_t i = 0; i < n; i++) s += a[i];\n  return s;\n}\nint main(void) {\n  int v[5] = {1, 2, 3, 4, 5};\n  printf(\"%ld\\n\", sum(v, 5)); /* 15 */\n  return 0;\n}",
      },
      {
        level: "medium",
        task: "Write char *dup_str(const char *s) that returns a heap copy of s, like strdup. The caller frees it. Handle allocation failure.",
        hint: "You need strlen(s) + 1 bytes so the NUL terminator fits.",
        solution: "#include <stdlib.h>\n#include <string.h>\nchar *dup_str(const char *s) {\n  size_t n = strlen(s) + 1;\n  char *p = malloc(n);\n  if (!p) return NULL;\n  memcpy(p, s, n);\n  return p;\n}",
      },
      {
        level: "hard",
        task: "Find and explain the bug: char *greet(void) { char msg[32]; snprintf(msg, sizeof msg, \"hi\"); return msg; }  Then give two correct ways to fix it.",
        hint: "Ask where msg lives and what happens to that memory when greet returns.",
        solution: "msg is a stack array; its frame is gone after return, so the\ncaller gets a dangling pointer (gcc warns: function returns address\nof local variable).\nFix 1: allocate on the heap: char *msg = malloc(32); ... return msg;\n       and document that the caller must free it.\nFix 2: let the caller own the buffer:\n       void greet(char *out, size_t n) { snprintf(out, n, \"hi\"); }",
      },
    ],
    faq: [
      { q: "What is the difference between NULL and an uninitialised pointer?", a: "NULL is a known value meaning \"points to nothing\", and you can test for it. An uninitialised pointer holds random garbage, so using it can touch any memory. Always initialise pointers, even if only to NULL." },
      { q: "Do I need to cast the result of malloc in C?", a: "No. In C a void * converts to any object pointer type automatically, and adding a cast can hide a missing #include of stdlib.h. The cast is only needed in C++." },
      { q: "Why does my program work even though I read past the end of an array?", a: "C does not check bounds, so the read just returns whatever bytes are next in memory. It is still undefined behaviour and may crash or corrupt data later. AddressSanitizer will catch it immediately." },
    ],
  },

  "lsp-c-foundations/c-structs-strings": {
    plain: [
      "A struct is a labelled box that groups related values. A person might have a name, an age and an ID; a struct keeps them together so you can pass them around as one thing. Linux uses structs everywhere: struct stat describes a file, struct timespec holds a time.",
      "A C string is not a special type. It is just an array of chars that ends with a zero byte, written as \\0 and called the NUL terminator. Every string function walks the bytes until it finds that zero. If the zero is missing, the function keeps walking into memory it should not touch.",
      "Bit flags pack many yes/no options into one number. Each option owns one bit. You switch options on with | (OR) and test them with & (AND). That is why you write open(path, O_WRONLY | O_CREAT | O_TRUNC, 0644).",
      "These three tools are simple, but small slips cause real security bugs. Learning the safe habits early, like always passing a buffer size, saves a lot of pain.",
    ],
    deepDive: [
      {
        heading: "Why sizeof(struct) is often bigger than you expect",
        body: "CPUs read memory fastest when a value starts at an address that is a multiple of its size. An int likes to start on a 4-byte boundary, a pointer or double on an 8-byte boundary. To make that happen, the compiler inserts unused padding bytes between fields and at the end.\n\nSo struct { char c; int n; char d; } is usually 12 bytes, not 6: 1 byte for c, 3 padding, 4 for n, 1 for d, 3 padding. Reordering fields from largest to smallest, as in { int n; char c; char d; }, shrinks it to 8 bytes. This matters when you store millions of structs, and it is why you must never write a struct straight to a file or socket and expect another machine to read it the same way.",
        bullets: ["Order fields largest to smallest to cut padding", "Use offsetof(type, field) to see where a field sits", "Do not send raw structs over the network"],
      },
      {
        heading: "Safe string habits",
        body: "Most string bugs come from copying into a buffer that is too small. strcpy and strcat never check the size, so they can write past the end. strncpy looks safer but does not add a NUL if the source is too long, which creates a new bug.\n\nThe simplest safe tool is snprintf(dst, sizeof dst, \"%s\", src). It never writes more than the size you give, always adds the NUL, and returns how long the full result would have been. If that return value is greater than or equal to the size, the text was cut short and you can react.\n\nAlso remember that strlen does not count the NUL. A string of length 5 needs 6 bytes.",
        bullets: ["Prefer snprintf over strcpy, strcat and sprintf", "Check snprintf's return for truncation", "Buffer size = strlen + 1"],
        visual: {
          type: "compare",
          title: "Copying a string into a buffer",
          columns: [
            { title: "strcpy, strcat", points: ["No size check at all", "Can write past the end", "Avoid"] },
            { title: "strncpy", points: ["Takes a size limit", "No NUL if the source is too long", "Easy to misuse"] },
            { title: "snprintf", points: ["Never writes more than the size", "Always adds the NUL", "Return value shows truncation"] },
          ],
        },
      },
      {
        heading: "Working with bits",
        body: "Define each flag as a different power of two, usually with a shift: (1u << 0), (1u << 1), (1u << 2). Use unsigned types so shifts behave predictably.\n\nThe four everyday operations are: set a flag with flags |= F; clear it with flags &= ~F; flip it with flags ^= F; and test it with (flags & F) != 0. The kernel uses exactly this pattern. File mode bits like 0644 are three groups of read, write and execute bits written in octal, which is why each digit runs from 0 to 7.",
        bullets: ["Set: flags |= F", "Clear: flags &= ~F", "Toggle: flags ^= F", "Test: if (flags & F)"],
        visual: {
          type: "flow",
          title: "One flags variable, step by step",
          steps: [
            { label: "Start", detail: "flags = 0b000" },
            { label: "Set READ (1u << 0)", detail: "flags |= READ: 0b001" },
            { label: "Set EXEC (1u << 2)", detail: "flags |= EXEC: 0b101" },
            { label: "Clear READ", detail: "flags &= ~READ: 0b100" },
            { label: "Test EXEC", detail: "(flags & EXEC) != 0 is true" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Bytes of struct { char c; int n; char d; } on x86-64",
        layers: [
          { label: "Offset 0: c", detail: "1 byte of data" },
          { label: "Offsets 1-3: padding", detail: "So n starts on a 4-byte boundary" },
          { label: "Offsets 4-7: n", detail: "4-byte int" },
          { label: "Offset 8: d", detail: "1 byte of data" },
          { label: "Offsets 9-11: tail padding", detail: "Total 12, so arrays stay aligned" },
        ],
      },
    ],
    examples: [
      {
        title: "Seeing padding with sizeof and offsetof",
        explanation: "We define the same three fields in two orders and print their sizes. The first layout wastes 6 bytes on padding. The second groups the small chars together after the int, so only 2 bytes of tail padding remain. offsetof shows exactly where each field lands. Run it and compare the numbers with the diagram.",
        code: {
          lang: "c",
          code: "#include <stddef.h>\n#include <stdio.h>\n\nstruct bad  { char c; int n; char d; };\nstruct good { int n; char c; char d; };\n\nint main(void) {\n  printf(\"bad:  %zu bytes, n at %zu\\n\", sizeof(struct bad), offsetof(struct bad, n));\n  printf(\"good: %zu bytes, c at %zu\\n\", sizeof(struct good), offsetof(struct good, c));\n  return 0; /* bad: 12, n at 4; good: 8, c at 4 */\n}",
        },
      },
      {
        title: "Building a path without overflowing",
        explanation: "A program joins a directory and a file name into one path. With strcpy and strcat a long name would overflow the buffer. snprintf writes at most sizeof path bytes and returns the length it wanted. If that is too big, we report the error instead of using a cut-off path, which could point at the wrong file.",
        code: {
          lang: "c",
          code: "#include <stdio.h>\n\nint main(int argc, char **argv) {\n  const char *dir = \"/var/log\";\n  const char *name = argc > 1 ? argv[1] : \"syslog\";\n  char path[32];\n  int n = snprintf(path, sizeof path, \"%s/%s\", dir, name);\n  if (n < 0 || (size_t)n >= sizeof path) {\n    fprintf(stderr, \"path too long\\n\");\n    return 1;\n  }\n  printf(\"%s\\n\", path);\n  return 0;\n}",
        },
      },
    ],
    cheatSheet: [
      "p->x is the same as (*p).x",
      "A string of length n needs n + 1 bytes",
      "snprintf(buf, sizeof buf, ...) is the safe default for building strings",
      "strncpy may leave the result without a NUL terminator",
      "Flags: set |=, clear &= ~, test &",
      "Use 1u << k for bit k so shifts stay unsigned",
      "offsetof(struct t, f) prints a field's byte offset",
      "sizeof on an array gives bytes; on a pointer it gives 8 on x86-64",
    ],
    quiz: [
      {
        q: "What does flags &= ~F_WRITE do?",
        options: ["Sets the write flag", "Clears the write flag and leaves the others alone", "Toggles every flag", "Tests whether write is set"],
        answer: 1,
        why: "~F_WRITE has every bit set except the write bit, so AND clears just that one.",
      },
      {
        q: "char buf[8]; snprintf(buf, sizeof buf, \"%s\", \"abcdefghij\"); what does buf hold?",
        options: ["abcdefghij", "Nothing, it fails", "abcdefgh with no NUL", "abcdefg followed by NUL"],
        answer: 3,
        why: "snprintf writes at most size - 1 characters and always adds the NUL.",
      },
      {
        q: "Why might sizeof(struct s) be larger than the sum of its fields?",
        options: ["The compiler adds padding for alignment", "Structs store a hidden name", "sizeof counts the NUL terminator", "Every field is rounded to 8 bytes"],
        answer: 0,
        why: "Padding keeps each field on an address its type can be read from efficiently.",
      },
      {
        q: "Inside a function taking char *s, what is sizeof s on 64-bit Linux?",
        options: ["The string's length", "The buffer's size in the caller", "8", "1"],
        answer: 2,
        why: "An array parameter decays to a pointer, and a pointer is 8 bytes on x86-64.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function that counts how many times a character appears in a C string, without using strlen.",
        hint: "Walk with a pointer until *s is the NUL byte.",
        solution: "#include <stddef.h>\nsize_t count_char(const char *s, char c) {\n  size_t n = 0;\n  for (; *s; s++)\n    if (*s == c) n++;\n  return n;\n}",
      },
      {
        level: "medium",
        task: "Define permission flags P_READ, P_WRITE, P_EXEC and write a function that turns a flags value into a string like \"rw-\".",
        hint: "Use a 4-byte output buffer and test each bit with &.",
        solution: "#define P_READ  (1u << 0)\n#define P_WRITE (1u << 1)\n#define P_EXEC  (1u << 2)\nvoid perm_str(unsigned f, char out[4]) {\n  out[0] = (f & P_READ)  ? 'r' : '-';\n  out[1] = (f & P_WRITE) ? 'w' : '-';\n  out[2] = (f & P_EXEC)  ? 'x' : '-';\n  out[3] = '\\0';\n}",
      },
      {
        level: "hard",
        task: "Reorder struct rec { char tag; double value; char flag; int id; short kind; } to use the least memory on x86-64. State the old and new sizes and check them with sizeof.",
        hint: "Sort fields by alignment: 8-byte, then 4, then 2, then 1.",
        solution: "Old layout: tag 1 + pad 7, value 8, flag 1 + pad 3, id 4,\nkind 2 + tail pad 6 = 32 bytes.\nNew: struct rec { double value; int id; short kind; char tag; char flag; };\nvalue 8, id 4, kind 2, tag 1, flag 1 = 16 bytes, no padding.\nCheck: printf(\"%zu\\n\", sizeof(struct rec));",
      },
    ],
    faq: [
      { q: "What is the difference between char s[] = \"hi\" and char *s = \"hi\"?", a: "The first makes a writable array of 3 bytes on the stack. The second points at a string literal stored in read-only memory, and writing to it crashes or is undefined behaviour." },
      { q: "Is strlcpy available on Linux?", a: "glibc added strlcpy and strlcat in version 2.38, but older systems lack them. snprintf works everywhere and gives the same safety." },
      { q: "When should I use typedef with structs?", a: "It is a style choice. typedef struct point point; saves typing, while the Linux kernel style prefers writing struct point everywhere so it is obvious the type is a struct." },
    ],
  },

  "lsp-c-foundations/c-build-tools": {
    plain: [
      "Your C source is just text. To run it, gcc turns it into machine code in several steps, and the last step, linking, glues your code together with code from libraries like libc. One command, gcc main.c -o app, hides all of that, but the steps are still there.",
      "Big projects have many .c files. Recompiling everything after every small edit would be slow. make solves this: you describe which files depend on which, and make only rebuilds the parts whose inputs changed since the last build.",
      "Libraries are bundles of ready-made code. A static library (.a) is copied into your program when it is linked. A shared library (.so) stays a separate file that is loaded when the program starts, so many programs share one copy in memory.",
      "Turn on warnings from day one. Flags like -Wall -Wextra make gcc point out suspicious code, and most warnings are real bugs waiting to happen.",
    ],
    deepDive: [
      {
        heading: "Headers versus source files",
        body: "A header (.h) holds declarations: \"a function called parse exists and takes these arguments\". A source file (.c) holds the definition: the actual body of parse. Every .c that calls parse includes the header so the compiler can check the call, but only one .c defines it.\n\nThe compiler works on one .c file at a time and turns it into an object file (.o). Calls to functions defined elsewhere are left as named holes. The linker then reads all the .o files and fills the holes. If a definition is missing you get \"undefined reference\"; if two files define the same function you get \"multiple definition\".\n\nInclude guards (#ifndef X_H / #define X_H / #endif) stop a header from being pasted twice into one file.",
        bullets: ["Declarations in .h, definitions in .c", "One .c becomes one .o", "Undefined reference = linker could not find a definition"],
        visual: {
          type: "flow",
          title: "How a call crosses files",
          steps: [
            { label: "util.h", detail: "Declares parse" },
            { label: "main.c", detail: "Includes util.h and calls parse" },
            { label: "main.o", detail: "parse left as a hole (nm shows U)" },
            { label: "util.o", detail: "parse defined here (nm shows T)" },
            { label: "Linker", detail: "Fills the hole, writes app" },
          ],
        },
      },
      {
        heading: "How make decides what to rebuild",
        body: "A Makefile is a list of rules. Each rule says: this target depends on these prerequisites, and here is the recipe to build it. When you run make, it compares file modification times. If a target is missing or older than any of its prerequisites, make runs the recipe.\n\nSo if you edit util.c, make rebuilds util.o and then relinks app, but leaves main.o alone. Forgetting to list a header as a prerequisite is a classic trap: you change a struct in util.h, make thinks nothing changed, and you get strange crashes from stale objects. Adding -MMD -MP to CFLAGS makes gcc write dependency files that make can include automatically.",
        bullets: ["Target is rebuilt if older than a prerequisite", "Mark clean and all as .PHONY", "-MMD -MP generates header dependencies", "make -j8 builds in parallel"],
      },
      {
        heading: "Static and shared libraries",
        body: "To build a static library, compile objects and bundle them with ar rcs libutil.a util.o. Linking with -L. -lutil copies only the needed objects into your binary. The result has no run-time dependency, but every program carries its own copy.\n\nTo build a shared library, compile with -fPIC (position-independent code) and link with gcc -shared -o libutil.so util.o. Your program then records that it needs libutil.so. At start-up the dynamic loader, ld.so, searches standard directories and LD_LIBRARY_PATH to find it. If it cannot, the program fails with \"cannot open shared object file\". Fixing a bug in a shared library fixes every program that uses it, without relinking.",
        visual: {
          type: "compare",
          title: "Static vs shared library",
          columns: [
            { title: "Static (libutil.a)", points: ["ar rcs libutil.a util.o", "Needed objects copied into the binary", "No run-time dependency", "Every program carries its own copy"] },
            { title: "Shared (libutil.so)", points: ["gcc -shared, objects built with -fPIC", "Binary only records the library name", "ld.so finds it at start-up", "One copy on disk for all programs"] },
          ],
        },
      },
      {
        heading: "Inspecting what you built",
        body: "A few small tools answer most build questions. file app tells you it is a 64-bit ELF executable and whether it is stripped. nm app lists symbols: T means a function defined here, U means undefined and expected from a library. ldd app lists the shared libraries the loader will pull in and where it found them. objdump -d disassembles machine code if you are curious what the compiler produced.\n\nWhen a link fails, nm on each .o or .a usually shows which file was supposed to define the missing symbol.",
        bullets: ["file: format and architecture", "nm: defined (T) and undefined (U) symbols", "ldd: shared library dependencies", "objdump -d: disassembly"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What make rebuilds after editing util.c",
        root: "app (relinked)",
        children: [
          { label: "main.o (up to date)", children: ["main.c unchanged", "util.h unchanged"] },
          { label: "util.o (rebuilt)", children: ["util.c changed", "util.h unchanged"] },
          { label: "libc.so", children: ["Linked dynamically, not rebuilt"] },
        ],
      },
    ],
    examples: [
      {
        title: "Splitting a program into two files",
        explanation: "We move a helper into its own file. util.h declares the function, util.c defines it, and main.c includes the header and calls it. Each .c compiles separately to a .o, then gcc links them. The commands show the stages explicitly so you can see where each error type would appear.",
        code: {
          lang: "bash",
          code: "# util.h:  #ifndef UTIL_H / #define UTIL_H / int square(int x); / #endif\n# util.c:  #include \"util.h\"  int square(int x) { return x * x; }\n# main.c:  #include <stdio.h> #include \"util.h\"\n#          int main(void) { printf(\"%d\\n\", square(7)); return 0; }\ngcc -Wall -Wextra -c util.c      # -> util.o\ngcc -Wall -Wextra -c main.c      # -> main.o\ngcc -o app main.o util.o         # link\n./app                            # 49\nnm main.o | grep square          # U square (needed)\nnm util.o | grep square          # T square (defined)",
        },
      },
      {
        title: "Turning the helper into a shared library",
        explanation: "Now we build util.c as libutil.so and link main against it. The program runs only when the loader can find the library, so we point LD_LIBRARY_PATH at the current directory for this test. ldd confirms where it was found. In real installs the library goes to /usr/local/lib and you run ldconfig instead.",
        code: {
          lang: "bash",
          code: "gcc -Wall -fPIC -c util.c\ngcc -shared -o libutil.so util.o\ngcc -o app main.c -L. -lutil\n./app                      # error: libutil.so: cannot open shared object file\nLD_LIBRARY_PATH=. ./app    # 49\nLD_LIBRARY_PATH=. ldd ./app | grep util",
        },
      },
    ],
    cheatSheet: [
      "gcc -Wall -Wextra -g -O0 for debugging, -O2 for release",
      "gcc -c file.c makes file.o without linking",
      "Put -lfoo after the objects that use it on the link line",
      "ar rcs libx.a a.o b.o builds a static library",
      "gcc -shared -fPIC -o libx.so x.c builds a shared library",
      "make -j$(nproc) builds in parallel",
      "CFLAGS += -MMD -MP and -include $(OBJS:.o=.d) tracks headers",
      "nm, ldd, file and objdump -d inspect binaries",
    ],
    quiz: [
      {
        q: "You change a struct in util.h but your Makefile only lists util.c as a prerequisite of util.o. What happens?",
        options: ["make rebuilds everything anyway", "gcc refuses to compile", "make may skip rebuilding, leaving stale objects that disagree about the struct", "The linker fixes the mismatch"],
        answer: 2,
        why: "make only knows about the prerequisites you list, so header changes go unnoticed without dependency tracking.",
      },
      {
        q: "What does U next to a symbol in nm output mean?",
        options: ["Unused", "Undefined here; it must come from another object or library", "Unsigned", "Updated since the last build"],
        answer: 1,
        why: "U marks a symbol the object references but does not define.",
      },
      {
        q: "Why compile shared library code with -fPIC?",
        options: ["So it can be loaded at any address in each process", "To make it run faster", "To include debug symbols", "To enable warnings"],
        answer: 0,
        why: "Position-independent code works wherever the loader maps the library.",
      },
      {
        q: "Which error does the linker, not the compiler, report?",
        options: ["expected ';' before '}'", "implicit declaration of function", "unused variable", "undefined reference to 'square'"],
        answer: 3,
        why: "Only the linker sees all objects together and can notice a missing definition.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Compile hello.c with full warnings and debug info, then use file and ldd to describe the binary.",
        hint: "file shows ELF details; ldd shows libc.so.6 and the loader.",
        solution: "gcc -Wall -Wextra -g -o hello hello.c\nfile hello   # ELF 64-bit LSB pie executable, x86-64, ... with debug_info\nldd hello    # libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6, ld-linux-x86-64.so.2",
      },
      {
        level: "medium",
        task: "Write a Makefile for main.c and util.c (both include util.h) with targets app, clean and a .PHONY line. Editing util.h must rebuild both objects.",
        hint: "List util.h as a prerequisite of the pattern rule.",
        solution: "CC = gcc\nCFLAGS = -Wall -Wextra -g\nOBJS = main.o util.o\n.PHONY: all clean\nall: app\napp: $(OBJS)\n\t$(CC) $(CFLAGS) -o $@ $^\n%.o: %.c util.h\n\t$(CC) $(CFLAGS) -c $<\nclean:\n\trm -f app $(OBJS)",
      },
      {
        level: "hard",
        task: "gcc -lm -o calc calc.o fails with undefined reference to sqrt on some systems, but gcc -o calc calc.o -lm works. Explain why.",
        hint: "Think about the order in which the linker scans files.",
        solution: "The linker reads inputs left to right. When it reaches -lm first,\nnothing needs sqrt yet, so it pulls nothing from libm (and with\n--as-needed drops it). Then calc.o adds an undefined sqrt, but libm\nhas already been passed. Putting libraries after the objects that\nuse them lets the linker resolve the symbol.",
      },
    ],
    faq: [
      { q: "Do I need make if I only have one file?", a: "No, a single gcc command is fine. make starts paying off once you have several files or flags you do not want to retype." },
      { q: "Should I link statically to avoid library problems?", a: "Static linking makes one self-contained binary, which is handy for small tools and containers. The cost is bigger files and needing to rebuild to pick up library security fixes, so most Linux software links dynamically." },
      { q: "What is the difference between -O2 and -O3?", a: "-O3 enables more aggressive optimisations like heavier loop vectorisation. It is not always faster, so -O2 is the common default; measure before switching." },
    ],
  },

  "lsp-c-foundations/c-debugging": {
    plain: [
      "C does not warn you at run time when you make a memory mistake. A program might read past an array, keep running, and crash much later somewhere unrelated. That is why guessing rarely works and tools matter so much.",
      "gdb is a debugger. It lets you pause a program, look at variables, step one line at a time and see the chain of function calls. When a program crashes, gdb shows exactly which line it was on.",
      "valgrind and AddressSanitizer are memory checkers. They watch every memory access and shout the moment something is wrong: reading freed memory, writing past a buffer, or forgetting to free. They point at the real bug, not the place it finally crashed.",
      "A good habit is simple: build with -g, run your tests under AddressSanitizer, and open gdb whenever something crashes. You will spend far less time staring at code.",
    ],
    deepDive: [
      {
        heading: "A gdb session that actually finds the bug",
        body: "Start with gdb ./app, then run with any arguments. When it crashes, type bt to print the backtrace: the list of function calls from main down to the crash. frame 2 jumps to a caller, list shows nearby source, and print var or print *ptr shows values.\n\nIf you know roughly where the trouble starts, use break file.c:42 and run again. Then next steps over a line, step goes into a function call, and finish runs until the current function returns. A watchpoint, watch total, stops whenever a variable changes, which is perfect for \"who is overwriting this?\" bugs.",
        bullets: ["bt: who called whom", "break, run, next, step, finish", "print and display to inspect", "watch var stops on every change", "info locals shows all locals"],
        visual: {
          type: "flow",
          title: "A typical gdb session",
          steps: [
            { label: "gdb ./app, then run", detail: "Program runs until it crashes" },
            { label: "bt", detail: "Calls from main down to the crash" },
            { label: "frame 2, list", detail: "Jump to a caller, see its source" },
            { label: "print var", detail: "Check the values" },
            { label: "break file.c:42, run", detail: "Stop earlier, then next and step" },
          ],
        },
      },
      {
        heading: "Core dumps: debugging after the fact",
        body: "Sometimes a crash happens on a server or only once in a while. A core dump is a snapshot of the process memory at the moment it died. Enable them in your shell with ulimit -c unlimited. On many modern distros systemd-coredump captures them; list them with coredumpctl list and open the latest with coredumpctl gdb.\n\nWith a plain core file, run gdb ./app core and type bt. You get the same backtrace as if you had been running under gdb live. This is why release builds often keep debug symbols in a separate file: you can still read core dumps from production without shipping a large binary.",
        visual: {
          type: "flow",
          title: "Debugging a crash after the fact",
          steps: [
            { label: "ulimit -c unlimited", detail: "Allow core dumps" },
            { label: "Program crashes", detail: "Memory snapshot saved" },
            { label: "coredumpctl list", detail: "On systemd-coredump systems" },
            { label: "coredumpctl gdb", detail: "Or gdb ./app core" },
            { label: "bt", detail: "Same backtrace as a live session" },
          ],
        },
      },
      {
        heading: "Reading a valgrind or ASan report",
        body: "Both tools print a report with three useful parts. First, the kind of error, such as \"Invalid write of size 4\" or \"heap-buffer-overflow\". Second, the stack trace where the bad access happened. Third, the history of the memory: where it was allocated and, for use-after-free, where it was freed.\n\nRead the first error first. Later errors are often side effects of the first one. For leaks, valgrind sorts them into \"definitely lost\" (a real leak), \"indirectly lost\" (lost because its parent was lost), and \"still reachable\" (memory still pointed to at exit, usually harmless).",
        bullets: ["Fix the first error before the rest", "Definitely lost = real leak", "ASAN_OPTIONS=detect_leaks=1 is on by default on Linux"],
      },
      {
        heading: "Choosing a tool in practice",
        body: "Use AddressSanitizer for daily development and tests. It needs a rebuild with -fsanitize=address -g, but it is fast enough to leave on in your test suite and catches overflows on the stack and globals too, which valgrind misses. Add -fsanitize=undefined to catch things like signed integer overflow.\n\nUse valgrind when you cannot rebuild, for example with a binary someone else compiled, or when you want to detect reads of uninitialised memory, which ASan does not report (MemorySanitizer does, but only with clang). Use gdb when you need to understand the flow of the program, not just find a bad access.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From crash to fix",
        steps: [
          { label: "Reproduce", detail: "Find input that triggers it every time" },
          { label: "Rebuild", detail: "-g -O0 -fsanitize=address" },
          { label: "Read report", detail: "First error, its stack and allocation site" },
          { label: "Inspect", detail: "gdb: break near the site, print values" },
          { label: "Fix and add test", detail: "Keep the input as a regression test" },
        ],
      },
    ],
    examples: [
      {
        title: "Catching an off-by-one with AddressSanitizer",
        explanation: "The loop below uses <= instead of <, so it writes one int past the end of a 5-int heap block. Without ASan it often runs silently. With ASan the program stops at the bad write and reports heap-buffer-overflow, the line number, and that the block was allocated by malloc in main. Change <= to < and the report disappears.",
        code: {
          lang: "c",
          code: "/* gcc -g -fsanitize=address -o oob oob.c && ./oob */\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n  int *a = malloc(5 * sizeof *a);\n  if (!a) { perror(\"malloc\"); return 1; }\n  for (int i = 0; i <= 5; i++) /* bug: should be i < 5 */\n    a[i] = i;\n  printf(\"%d\\n\", a[0]);\n  free(a);\n  return 0;\n}",
        },
      },
      {
        title: "Finding who corrupts a variable with a watchpoint",
        explanation: "A counter called total ends up with a crazy value. Rather than reading every function, we let gdb watch it. Each time total changes, gdb stops and prints the old value, the new value and the line responsible. After a few continues we land on the line that writes through a wrong pointer.",
        code: {
          lang: "bash",
          code: "gcc -g -O0 -o app app.c\ngdb ./app\n(gdb) break main\n(gdb) run\n(gdb) watch total\n(gdb) continue        # Old value = 0, New value = 10, at app.c:31\n(gdb) continue        # Old value = 10, New value = 1952805748, at app.c:58\n(gdb) bt              # shows which caller reached line 58\n(gdb) print buf       # look at the buffer next to total",
        },
      },
    ],
    cheatSheet: [
      "gcc -g -O0 for the clearest debugging",
      "gdb --args ./app a b passes arguments to the program",
      "bt, frame N, print x, info locals in gdb",
      "watch x stops whenever x changes",
      "ulimit -c unlimited enables core files; coredumpctl gdb opens the latest",
      "valgrind --leak-check=full --track-origins=yes ./app",
      "gcc -g -fsanitize=address,undefined for tests and CI",
      "Fix the first reported error first",
    ],
    quiz: [
      {
        q: "Which gdb command shows the chain of function calls at the current point?",
        options: ["list", "info locals", "bt", "finish"],
        answer: 2,
        why: "bt prints the backtrace from the current frame up to main.",
      },
      {
        q: "valgrind reports \"still reachable\" memory at exit. What does it usually mean?",
        options: ["Memory still pointed to at exit, often harmless", "A guaranteed leak", "A buffer overflow", "A double free"],
        answer: 0,
        why: "Still reachable blocks have live pointers to them; they were just not freed before exit.",
      },
      {
        q: "Which bug can AddressSanitizer catch that valgrind memcheck usually cannot?",
        options: ["A heap leak", "A double free", "Use after free on the heap", "Overflow of a local array on the stack"],
        answer: 3,
        why: "ASan adds red zones around stack and global arrays at compile time; valgrind only sees heap block boundaries.",
      },
      {
        q: "Why debug with -O0 rather than -O2?",
        options: ["-O2 removes debug symbols", "Optimisation reorders and removes code, so lines and variables no longer match the source cleanly", "gdb cannot open -O2 binaries", "-O0 makes crashes impossible"],
        answer: 1,
        why: "At higher levels values live in registers or vanish, which gdb shows as optimized out.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a program that dereferences a NULL pointer, run it under gdb and report the crashing line with bt.",
        hint: "Build with -g, start gdb, type run, then bt.",
        solution: "/* crash.c */ int main(void) { int *p = 0; return *p; }\ngcc -g -O0 -o crash crash.c\ngdb ./crash\n(gdb) run    # Program received signal SIGSEGV\n(gdb) bt     # #0 main () at crash.c:1",
      },
      {
        level: "medium",
        task: "A program mallocs a 100-byte buffer in a loop 10 times and never frees it. Use valgrind to confirm the exact number of bytes lost, then fix it.",
        hint: "Look for the definitely lost line in the LEAK SUMMARY.",
        solution: "valgrind --leak-check=full ./leaky\n# definitely lost: 1,000 bytes in 10 blocks\n# at malloc ... by main (leaky.c:6)\nFix: call free(buf) at the end of each loop iteration,\nthen rerun: All heap blocks were freed -- no leaks are possible",
      },
      {
        level: "hard",
        task: "Write a tiny program with a use-after-free, then explain each of the three stack traces ASan prints for it.",
        hint: "ASan shows the bad access, where the block was freed, and where it was allocated.",
        solution: "#include <stdlib.h>\nint main(void) { char *p = malloc(8); if (!p) return 1;\n  free(p); return p[0]; }\ngcc -g -fsanitize=address uaf.c && ./a.out\n1) READ of size 1 ... #0 main uaf.c:3  -> the bad read\n2) freed by thread T0 here: free ... main uaf.c:3 -> who freed it\n3) previously allocated by thread T0 here: malloc ... main uaf.c:2\nFix: do not touch p after free; set p = NULL right after freeing.",
      },
    ],
    faq: [
      { q: "Can I use gdb on a program that is already running?", a: "Yes: gdb -p PID attaches to it, as long as you own the process and ptrace is allowed (some distros restrict it with kernel.yama.ptrace_scope). Detach with detach or quit and it keeps running." },
      { q: "Can I use AddressSanitizer and valgrind together?", a: "No. ASan replaces malloc and reserves huge address ranges, which confuses valgrind. Pick one per run." },
      { q: "Why does my bug disappear when I add printf?", a: "Printing changes timing and memory layout, which can hide memory errors and race conditions. That is a strong hint the bug is undefined behaviour; run a sanitizer instead of adding prints." },
    ],
  },

  // ───────────── The kernel/user boundary ─────────────
  "lsp-kernel-interface/os-architecture": {
    plain: [
      "Your computer runs many programs at once: a browser, a terminal, a music player. If each one could poke the hardware directly, one buggy program could wipe the disk or freeze the machine. So Linux splits the world into two zones.",
      "User space is where normal programs run. They have limited power: they can compute and use their own memory, but nothing more. Kernel space is where the Linux kernel runs, with full power over memory, disks, network cards and the CPU itself.",
      "When a program needs something only the kernel can do, like reading a file, it makes a system call. The CPU switches into a privileged mode, the kernel does the job and checks permissions, and then control returns to the program.",
      "Between your code and the kernel sits the C library, glibc. It turns friendly functions like fopen and printf into the raw system calls the kernel understands.",
    ],
    deepDive: [
      {
        heading: "How the CPU enforces the two zones",
        body: "Modern x86-64 CPUs have privilege levels called rings. The kernel runs in ring 0, where every instruction is allowed. User programs run in ring 3, where instructions that talk to devices, change page tables or disable interrupts are forbidden. If a user program tries one, the CPU raises a fault and the kernel usually kills the program.\n\nMemory is protected too. Each page of memory has a flag saying whether user code may touch it. Kernel memory is mapped into every process but marked supervisor-only, so a user program that reads it gets a segmentation fault. ARM CPUs use the same idea with exception levels instead of rings.",
        bullets: ["Ring 0: kernel, full access", "Ring 3: user programs, restricted", "Page flags block user access to kernel memory"],
      },
      {
        heading: "Three ways to enter the kernel",
        body: "Control moves from user space into the kernel in only three ways. A system call is a deliberate request, made with the syscall instruction on x86-64. An exception is an accident caused by the current instruction, such as dividing by zero or touching a page that is not in memory yet (a page fault). An interrupt comes from hardware, like a network card saying a packet arrived or the timer saying the current program's time slice is up.\n\nIn every case the CPU saves where the program was, jumps to a fixed kernel entry point, and later returns to exactly the same spot. Your program never notices, except that time has passed.",
        bullets: ["System call: program asks on purpose", "Exception: caused by the current instruction", "Interrupt: caused by hardware or a timer"],
      },
      {
        heading: "What the kernel is made of",
        body: "Linux is a monolithic kernel: all its main parts run together in kernel space and call each other directly, which is fast. The process scheduler decides which task runs on each CPU. The memory manager handles virtual memory and page tables. The virtual file system (VFS) gives every file system the same interface. The network stack implements TCP/IP. Device drivers talk to hardware.\n\nDrivers can be loaded at run time as modules, which you can list with lsmod. That is flexible, but a buggy module runs with full kernel power, which is why a bad driver can crash the whole machine.",
      },
      {
        heading: "Where glibc fits",
        body: "glibc is the standard C library on most Linux distros. Some of its functions are thin wrappers: write just puts arguments in registers and runs the syscall instruction. Others do lots of work in user space first: printf formats text into a buffer and only calls write when the buffer is full or a newline is printed to a terminal. Functions like strlen or qsort never enter the kernel at all.\n\nA few frequent calls, like clock_gettime, use the vDSO, a small piece of kernel code mapped into your process so it can run without a real mode switch. Other C libraries, such as musl, make the same system calls with different internals.",
        bullets: ["Thin wrappers: read, write, open", "Heavy user-space work: printf, malloc", "No kernel at all: strlen, memcpy, qsort", "vDSO: fast time calls without a full switch"],
        visual: {
          type: "sequence",
          title: "Which calls reach the kernel",
          actors: ["Program", "glibc", "Kernel"],
          messages: [
            { from: 0, to: 1, label: "strlen(s)" },
            { from: 1, to: 0, label: "Answer, no kernel entry" },
            { from: 0, to: 1, label: "printf(\"a\")" },
            { from: 1, to: 0, label: "Text kept in a buffer" },
            { from: 0, to: 1, label: "printf(\"b\\n\") to a terminal" },
            { from: 1, to: 2, label: "write(1, \"ab\\n\", 3): syscall" },
            { from: 2, to: 1, label: "3 bytes written" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "User mode vs kernel mode",
        columns: [
          { title: "User mode", points: ["Runs your programs and libraries", "Sees only its own virtual memory", "Cannot run privileged instructions", "A crash kills one process"] },
          { title: "Kernel mode", points: ["Runs the kernel and drivers", "Can access all memory and devices", "Handles syscalls, faults and interrupts", "A crash (panic) stops the machine"] },
        ],
      },
      {
        type: "tree",
        title: "Ways into the kernel",
        root: "CPU enters kernel mode",
        children: [
          { label: "System call", children: ["read, write, open", "fork, execve", "mmap"] },
          { label: "Exception", children: ["Page fault", "Divide by zero", "Invalid instruction"] },
          { label: "Interrupt", children: ["Timer tick", "Network packet", "Disk I/O done"] },
        ],
      },
    ],
    examples: [
      {
        title: "Watching a program cross the boundary",
        explanation: "The time command splits a program's CPU time into user time and sys time. User time is spent running your own code and libraries. Sys time is spent inside the kernel doing work for you. A program that only does maths has almost no sys time. A program that writes a million tiny lines with raw write calls spends lots of time in the kernel.",
        code: {
          lang: "bash",
          code: "time python3 -c \"sum(range(10**8))\"\n# real 1.9s  user 1.9s  sys 0.0s   -> pure computation\ntime dd if=/dev/zero of=/dev/null bs=1 count=2000000\n# real 1.1s  user 0.4s  sys 0.7s   -> millions of 1-byte syscalls\ntime dd if=/dev/zero of=/dev/null bs=1M count=2\n# real 0.0s                         -> same data, two big syscalls",
        },
      },
      {
        title: "Proving that user code cannot touch kernel memory",
        explanation: "On x86-64 Linux, the top half of the address space belongs to the kernel. Here we try to read an address in that range. The page is marked supervisor-only, so the CPU raises a fault, the kernel sees that user code caused it, and sends SIGSEGV. The program dies, but the system is fine: that is the protection working.",
        code: {
          lang: "c",
          code: "#include <stdint.h>\n#include <stdio.h>\n\nint main(void) {\n  volatile uint64_t *p = (uint64_t *)0xffffffff81000000ULL; /* kernel half */\n  printf(\"about to read %p\\n\", (void *)p);\n  fflush(stdout);\n  uint64_t v = *p; /* SIGSEGV: Segmentation fault */\n  printf(\"never printed %llu\\n\", (unsigned long long)v);\n  return 0;\n}",
        },
      },
    ],
    cheatSheet: [
      "uname -r prints the running kernel version",
      "lsmod lists loaded kernel modules",
      "dmesg shows kernel log messages (may need sudo)",
      "time cmd: user = your code, sys = kernel work for you",
      "man 2 = system calls, man 3 = library functions",
      "ldd /bin/ls shows libc.so.6 and the dynamic loader",
      "/proc/PID/maps shows the [vdso] page mapped into a process",
    ],
    quiz: [
      {
        q: "A program divides by zero. How does control reach the kernel?",
        options: ["Through a system call", "Through an exception raised by the CPU", "Through a hardware interrupt", "It never reaches the kernel"],
        answer: 1,
        why: "Faults caused by the current instruction are exceptions, which the kernel handles, here by sending SIGFPE.",
      },
      {
        q: "Which of these never enters the kernel?",
        options: ["write", "open", "fork", "strlen"],
        answer: 3,
        why: "strlen just walks bytes in your own memory, so it runs entirely in user space.",
      },
      {
        q: "Why can a buggy device driver crash the whole machine?",
        options: ["Drivers run in kernel mode with full access", "Drivers run as root in user space", "Drivers share the vDSO", "Drivers are written in assembly"],
        answer: 0,
        why: "Linux is monolithic, so a loaded module runs with the same power as the rest of the kernel.",
      },
      {
        q: "What does the vDSO speed up?",
        options: ["Disk writes", "Process creation", "Calls like clock_gettime that can run without a full mode switch", "Network sends"],
        answer: 2,
        why: "The vDSO maps a little kernel-provided code into user space so frequent read-only calls avoid the syscall cost.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find which section of the manual documents read, printf and proc, and say what each section number means.",
        hint: "Use man -f name (whatis) or man -k.",
        solution: "man -f read     # read (2) - read from a file descriptor\nman -f printf   # printf (1) shell command, printf (3) C function\nman -f proc     # proc (5) - process information pseudo-filesystem\nSection 1 commands, 2 system calls, 3 library functions,\n5 file formats, 7 overviews, 8 admin commands.",
      },
      {
        level: "medium",
        task: "Run time on cat bigfile > /dev/null and on md5sum bigfile. Explain why one has more sys time and the other more user time.",
        hint: "Ask which program does real computation on the bytes.",
        solution: "cat only moves bytes: it loops read -> write, so most of its time is\nkernel work copying data (high sys, low user).\nmd5sum reads the same data but then hashes every byte in user space,\nso user time dominates.\nThe file read cost is similar; the difference is what happens after.",
      },
      {
        level: "hard",
        task: "Look at cat /proc/self/maps and identify the regions belonging to the program, libc, the stack and the vDSO. Explain why the kernel itself is not listed.",
        hint: "Look at the path column and the bracketed names.",
        solution: "Lines with /usr/bin/cat: program text, data, bss.\nLines with libc.so.6: the C library's code and data.\n[heap], [stack]: heap and main thread stack.\n[vdso] and [vvar]: kernel-provided code and data for fast calls.\nKernel memory is mapped in every process but is supervisor-only,\nso it is not shown as part of the user address space.",
      },
    ],
    faq: [
      { q: "Is the kernel a process?", a: "Not exactly. The kernel is code that runs when a process makes a system call or when an interrupt happens. It also has its own kernel threads, which you see in ps as names in square brackets like [kworker/0:1]." },
      { q: "Why is a system call slower than a normal function call?", a: "The CPU has to switch privilege level, save registers and, on many systems, apply security mitigations on entry and exit. That costs around a hundred nanoseconds or more, versus a few nanoseconds for a plain function call." },
      { q: "Can I write my own kernel code?", a: "Yes, as a loadable kernel module. Practise in a virtual machine, because a bug there can freeze or crash the whole system." },
    ],
  },

  "lsp-kernel-interface/system-calls": {
    plain: [
      "A system call is how your program asks the kernel for help. Open this file. Read 100 bytes. Start a new process. Each one has a number, and your program passes that number and some arguments to the kernel.",
      "System calls can fail for many normal reasons: the file does not exist, you lack permission, the disk is full. Most calls tell you about failure by returning -1. A global-looking variable called errno then holds a code that says why.",
      "Beginners often skip the checks because the code works on their machine. Then it runs on a server with a missing directory and silently does the wrong thing. Checking every return value is the single most important habit in system programming.",
      "There are also two surprises to learn: a call can be interrupted by a signal (EINTR), and read or write can move fewer bytes than you asked for. Both are normal, and both are easy to handle once you know.",
    ],
    deepDive: [
      {
        heading: "How errno works",
        body: "errno is an int that the C library sets when a call fails. It is per thread, so threads do not overwrite each other's errors. Its values have names like ENOENT (no such file), EACCES (permission denied) and EAGAIN (try again later), defined in errno.h.\n\nThree rules keep you safe. Only read errno right after a call has reported failure, because successful calls may leave old values in it. Save it to a local variable before calling anything else, because even printf can change it. And use strerror(errno) or perror(\"open\") to turn the number into a readable message.",
        bullets: ["Check the return value first, then errno", "Save errno immediately: int saved = errno;", "perror prefixes your text to the error message"],
      },
      {
        heading: "Return value conventions",
        body: "Most system calls return -1 on failure and something useful on success: a file descriptor, a byte count, a process ID. A few are different, and the man page RETURN VALUE section always tells you.\n\nmmap returns MAP_FAILED, not NULL. The pthread functions do not use errno at all; they return the error number directly and 0 on success. getpriority can legally return -1 on success, so you must set errno = 0 before the call and check it afterwards. Library functions like fopen return NULL on failure. When in doubt, read the man page section called RETURN VALUE.",
        bullets: ["Most syscalls: -1 and errno", "mmap: MAP_FAILED", "pthreads: return the error code directly", "stdio: NULL or EOF"],
      },
      {
        heading: "EINTR: interrupted by a signal",
        body: "Some calls can wait a long time: reading from a terminal or a socket, waiting for a child. If a signal arrives during that wait and your program has a handler for it, the kernel runs the handler and then the call may return -1 with errno set to EINTR. Nothing is broken; the call just did not finish.\n\nThe usual fix is to retry in a loop while errno == EINTR. Alternatively, install handlers with the SA_RESTART flag so the kernel restarts most calls automatically. Some calls, like poll and nanosleep, are never restarted and always need handling.",
        visual: {
          type: "sequence",
          title: "A read interrupted by a signal",
          actors: ["Program", "Kernel", "Signal handler"],
          messages: [
            { from: 0, to: 1, label: "read(fd, ...) waits for data" },
            { from: 1, to: 2, label: "Signal arrives: run the handler" },
            { from: 2, to: 1, label: "Handler returns" },
            { from: 1, to: 0, label: "-1, errno = EINTR" },
            { from: 0, to: 1, label: "Retry read" },
            { from: 1, to: 0, label: "Bytes read" },
          ],
        },
      },
      {
        heading: "Partial results",
        body: "read(fd, buf, 4096) promises to read at most 4096 bytes, not exactly 4096. From a pipe or socket it returns whatever has arrived so far. From a file near the end it returns what is left, and 0 means end of file.\n\nwrite can also be short, especially on sockets and pipes when buffers fill up. So correct code always loops: keep calling write with the remaining bytes until all are sent. Forgetting this works fine in tests with small files, then corrupts data under load.",
        bullets: ["read returning 0 means end of file", "A short read or write is not an error", "Loop until all bytes are moved"],
        visual: {
          type: "flow",
          title: "Writing 10,000 bytes to a socket",
          steps: [
            { label: "write(fd, buf, 10000)", detail: "Returns 4096: a short write" },
            { label: "Advance", detail: "buf += 4096, 5904 bytes left" },
            { label: "write again", detail: "Returns 5904" },
            { label: "Done", detail: "Loop ends when 0 bytes are left" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Robust handling of one call",
        steps: [
          { label: "Call", detail: "n = write(fd, p, left);" },
          { label: "Failed?", detail: "n == -1: check errno" },
          { label: "EINTR", detail: "Retry the same call" },
          { label: "Other error", detail: "Report with perror and stop" },
          { label: "Short success", detail: "p += n; left -= n; loop until left == 0" },
        ],
      },
    ],
    examples: [
      {
        title: "A write_all helper you can reuse everywhere",
        explanation: "This helper writes every byte of a buffer or reports a real error. Each call moves the pointer forward by what was actually written. EINTR simply restarts the loop. Any other error returns -1 with errno still set, so the caller can print it. You will use this pattern again for sockets and pipes.",
        code: {
          lang: "c",
          code: "#include <errno.h>\n#include <stdio.h>\n#include <unistd.h>\nstatic int write_all(int fd, const char *p, size_t left) {\n  while (left > 0) {\n    ssize_t n = write(fd, p, left);\n    if (n == -1) { if (errno == EINTR) continue; return -1; }\n    p += n; left -= (size_t)n;\n  }\n  return 0;\n}\nint main(void) {\n  if (write_all(STDOUT_FILENO, \"hello\\n\", 6) == -1) { perror(\"write\"); return 1; }\n  return 0;\n}",
        },
      },
      {
        title: "Reporting errors usefully",
        explanation: "A good error message says what was attempted, on what, and why it failed. Here we try to create a file in a directory that may not exist. We save errno before printing, then branch on it so a missing directory and a permission problem get different advice. Run it with a path like /nope/x.txt and then /root/x.txt.",
        code: {
          lang: "c",
          code: "#include <errno.h>\n#include <fcntl.h>\n#include <stdio.h>\n#include <string.h>\n#include <unistd.h>\nint main(int argc, char **argv) {\n  const char *path = argc > 1 ? argv[1] : \"/nope/x.txt\";\n  int fd = open(path, O_WRONLY | O_CREAT | O_TRUNC, 0644);\n  if (fd == -1) {\n    int e = errno;\n    fprintf(stderr, \"cannot create %s: %s\\n\", path, strerror(e));\n    if (e == ENOENT) fprintf(stderr, \"hint: create the directory first\\n\");\n    return 1;\n  }\n  close(fd); return 0; }",
        },
      },
    ],
    cheatSheet: [
      "if (call(...) == -1) { perror(\"call\"); ... }",
      "Save errno at once: int e = errno;",
      "strerror(e) turns a code into text; errno -l lists them (moreutils)",
      "EINTR: retry, or use SA_RESTART on the handler",
      "read == 0 means end of file, not an error",
      "Loop on read and write until all bytes are moved",
      "pthread_* return the error number instead of setting errno",
      "Read the RETURN VALUE and ERRORS sections of each man page",
    ],
    quiz: [
      {
        q: "open succeeds and returns 3. errno contains ENOENT. What should you conclude?",
        options: ["The file is missing", "Nothing; errno is meaningless after a successful call", "The open partly failed", "You must call open again"],
        answer: 1,
        why: "errno is only defined after a failure; successful calls may leave old values behind.",
      },
      {
        q: "read on a socket asked for 1000 bytes and returned 200. What is the right reaction?",
        options: ["Treat it as an error", "Close the socket", "Call read again with errno set", "Process the 200 bytes and read again for more if needed"],
        answer: 3,
        why: "A short read is normal on sockets and pipes; it just means only 200 bytes were ready.",
      },
      {
        q: "How does pthread_mutex_lock report an error?",
        options: ["It returns the error number directly", "It returns -1 and sets errno", "It returns NULL", "It raises a signal"],
        answer: 0,
        why: "The pthread functions return 0 on success and an error code such as EDEADLK on failure.",
      },
      {
        q: "Why save errno into a local before calling fprintf?",
        options: ["fprintf needs errno to be zero", "errno is read-only", "fprintf may itself change errno", "It makes the program faster"],
        answer: 2,
        why: "Any library call may modify errno, so the original cause can be lost.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a program that tries to open a path given on the command line and prints either \"ok\" or the error using perror.",
        hint: "open returns -1 on failure; perror uses errno.",
        solution: "#include <fcntl.h>\n#include <stdio.h>\n#include <unistd.h>\nint main(int argc, char **argv) {\n  if (argc < 2) { fprintf(stderr, \"usage: %s path\\n\", argv[0]); return 2; }\n  int fd = open(argv[1], O_RDONLY);\n  if (fd == -1) { perror(argv[1]); return 1; }\n  puts(\"ok\");\n  close(fd);\n  return 0;\n}",
      },
      {
        level: "medium",
        task: "Write ssize_t read_full(int fd, char *buf, size_t n) that keeps reading until n bytes arrive or end of file, retrying on EINTR. Return the bytes read or -1.",
        hint: "Stop early when read returns 0.",
        solution: "ssize_t read_full(int fd, char *buf, size_t n) {\n  size_t got = 0;\n  while (got < n) {\n    ssize_t r = read(fd, buf + got, n - got);\n    if (r == -1) { if (errno == EINTR) continue; return -1; }\n    if (r == 0) break;           /* end of file */\n    got += (size_t)r;\n  }\n  return (ssize_t)got;\n}",
      },
      {
        level: "hard",
        task: "Call a raw system call without the glibc wrapper: use syscall(SYS_getpid) and syscall(SYS_write, ...) and compare the results with getpid().",
        hint: "Include sys/syscall.h and unistd.h; the numbers come from SYS_ constants.",
        solution: "#define _GNU_SOURCE\n#include <stdio.h>\n#include <sys/syscall.h>\n#include <unistd.h>\nint main(void) {\n  long pid = syscall(SYS_getpid);\n  printf(\"raw %ld, wrapper %d\\n\", pid, (int)getpid());\n  if (syscall(SYS_write, 1, \"hi\\n\", 3) == -1) { perror(\"write\"); return 1; }\n  return 0;\n}",
      },
    ],
    faq: [
      { q: "How many system calls does Linux have?", a: "Around 450 on x86-64, though a typical program uses only a few dozen. man 2 syscalls lists them all." },
      { q: "Is errno a global variable?", a: "It behaves like one, but in modern glibc it is a macro that reads a per-thread value. Each thread has its own errno, so threads do not clobber each other's errors." },
      { q: "Should I exit on every error?", a: "Not always. Exiting is fine for small tools, but servers should report the error, clean up that one request or connection, and keep running." },
    ],
  },

  "lsp-kernel-interface/strace-tracing": {
    plain: [
      "strace lets you watch a program talk to the kernel. Every file it opens, every byte it reads, every network connection it tries shows up as a line of text. You do not need the program's source code.",
      "This is powerful because programs keep secrets. An app says \"config error\" but does not say which file. strace shows it trying /etc/app.conf, getting \"No such file or directory\", and giving up. Mystery solved in seconds.",
      "ltrace is a cousin that shows calls into shared libraries, like malloc or strcmp, instead of system calls. Together they show what a program does, from the outside.",
      "Both tools slow the program down a lot, so use them for diagnosis, not for measuring speed, and be careful on busy production servers.",
    ],
    deepDive: [
      {
        heading: "Reading a line of strace output",
        body: "A typical line looks like openat(AT_FDCWD, \"/etc/app.conf\", O_RDONLY) = -1 ENOENT (No such file or directory). On the left is the system call name. In the brackets are its arguments, decoded into readable names where strace can. After the equals sign is the return value. On failure you get -1, the errno name and its message.\n\nStrings are shortened to 32 characters by default; add -s 200 to see more. Structs are shown with their fields in braces. A call that is still waiting is marked unfinished ... and later shown again marked ... resumed, which is common with -f and threads.",
        bullets: ["Name(arguments) = result", "-1 ENOENT etc. marks failure", "-s 200 shows longer strings", "-y prints the path behind each fd number"],
      },
      {
        heading: "Cutting through the noise",
        body: "A simple program makes dozens of startup calls just loading libraries. Filters help. -e trace=openat,read limits output to named calls. Classes make this easier: trace=%file covers every call that takes a path, %network covers socket calls, %process covers fork, exec and exit. Newer strace versions also support -e status=failed to show only calls that failed, which is often exactly what you want.\n\nTo see timing, -t adds the wall-clock time to each line, -T shows how long each call took, and -r shows time since the previous line. A slow request that spends 2 seconds in one connect call becomes obvious.",
        bullets: ["-e trace=%file, %network, %process", "-e status=failed (or -Z) for failures only", "-T shows time spent in each call", "-o file writes the trace to a file"],
        visual: {
          type: "tree",
          title: "Syscall classes for -e trace=",
          root: "-e trace=",
          children: [
            { label: "%file", children: ["Every call that takes a path", "openat, stat, unlink"] },
            { label: "%network", children: ["socket, connect, sendto"] },
            { label: "%process", children: ["fork and clone", "execve", "exit"] },
            { label: "Named calls", children: ["openat,read"] },
          ],
        },
      },
      {
        heading: "Following children and attaching",
        body: "Many programs fork helpers: shells, build tools, web servers. Without -f, strace only follows the first process and you may miss the one that fails. With -f, each line is prefixed by the PID that made the call, and -ff -o out writes one file per process.\n\nTo trace something already running, use strace -p PID. You need to own the process or be root, and on some distros ptrace is restricted by the Yama security module. Press Ctrl-C to detach; the program carries on. Remember that strace stops the target at every call, which can make a busy server many times slower.",
        visual: {
          type: "compare",
          title: "Tracing programs that fork",
          columns: [
            { title: "No -f", points: ["The default", "Only the first process", "Child failures are missed"] },
            { title: "-f", points: ["Follows every child", "Each line prefixed by its PID", "One combined output"] },
            { title: "-ff -o out", points: ["One file per process", "Named out.PID", "Easy to read per process"] },
          ],
        },
      },
      {
        heading: "Summary mode and ltrace",
        body: "strace -c skips the line-by-line output and prints a table when the program ends: how many times each syscall ran, how many failed, and how much time they took. It is the quickest way to spot a program making 50,000 tiny writes or retrying a failing call in a loop.\n\nltrace works at the library level. ltrace ./app shows calls like malloc(64) = 0x55d0... and strcmp(\"admin\", \"guest\") = -1. It is handy for understanding closed-source tools, but it only works for dynamically linked programs and is less maintained than strace.",
        bullets: ["strace -c: per-syscall counts and time", "ltrace -c: the same for library calls", "ltrace needs a dynamically linked binary"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How strace sees each call",
        actors: ["Program", "Kernel", "strace"],
        messages: [
          { from: 0, to: 1, label: "openat(\"/etc/app.conf\")" },
          { from: 1, to: 2, label: "ptrace stop: syscall entry" },
          { from: 2, to: 1, label: "Record name and args, continue" },
          { from: 1, to: 2, label: "ptrace stop: syscall exit, -1 ENOENT" },
          { from: 2, to: 1, label: "Print the line, continue" },
          { from: 1, to: 0, label: "Return -1, errno = ENOENT" },
        ],
      },
    ],
    examples: [
      {
        title: "Finding a missing config file",
        explanation: "A tool exits with \"failed to load configuration\" and nothing else. We trace only file-related calls that failed. The output shows the program looked in three places, in order, and none existed. Creating the file in any of those paths fixes it. We never needed the source code.",
        code: {
          lang: "bash",
          code: "strace -f -e trace=%file -e status=failed ./mytool 2>&1 | grep -v \"\\.so\"\n# openat(AT_FDCWD, \"./mytool.toml\", O_RDONLY) = -1 ENOENT (No such file or directory)\n# openat(AT_FDCWD, \"/home/sam/.config/mytool/config.toml\", O_RDONLY) = -1 ENOENT\n# openat(AT_FDCWD, \"/etc/mytool/config.toml\", O_RDONLY) = -1 ENOENT\nmkdir -p ~/.config/mytool && cp example.toml ~/.config/mytool/config.toml",
        },
      },
      {
        title: "Spotting why a program is slow",
        explanation: "A log converter takes ages on a small file. strace -c shows it made about 2 million write calls, one per character, and that write dominates the time. The fix is buffering: write to a FILE stream with stdio, or collect output in a large buffer and write it in chunks. After the fix, the same run makes a few hundred writes.",
        code: {
          lang: "bash",
          code: "strace -c -o summary.txt ./convert input.log > out.txt\nhead -6 summary.txt\n# % time     seconds  usecs/call     calls    errors syscall\n#  98.71    3.120417           1   2000004           write\n#   0.80    0.025315           6      4096           read\n# after switching to buffered output:\n#  65.10    0.004021          16       245           write",
        },
      },
    ],
    cheatSheet: [
      "strace ./app runs and traces a command",
      "strace -f follows forks; -ff -o out splits per process",
      "strace -p PID attaches to a running process; Ctrl-C detaches",
      "-e trace=%file / %network / %process filters by class",
      "-e status=failed (or -Z) shows only failing calls",
      "-T time per call, -t timestamps, -s 200 longer strings, -y show fd paths",
      "strace -c gives a summary table at exit",
      "ltrace ./app traces shared library calls",
    ],
    quiz: [
      {
        q: "A shell script fails, but strace ./script.sh shows nothing wrong. What is the most likely fix?",
        options: ["Use ltrace instead", "Add -c", "Run as root", "Add -f to follow the child processes the script starts"],
        answer: 3,
        why: "Scripts run most work in child processes, which strace only follows with -f.",
      },
      {
        q: "Which option shows how long each individual system call took?",
        options: ["-T", "-c", "-f", "-s"],
        answer: 0,
        why: "-T appends the time spent inside each call in angle brackets.",
      },
      {
        q: "What mechanism does strace use to observe another process?",
        options: ["It reads /proc/PID/syscall in a loop", "It patches the program's binary", "The ptrace system call, which stops the target at each syscall", "It replaces glibc with its own copy"],
        answer: 2,
        why: "ptrace lets a tracer stop the tracee on syscall entry and exit and inspect its registers.",
      },
      {
        q: "Why should you be careful running strace on a busy production server?",
        options: ["It can change files", "Stopping at every syscall can slow the target dramatically", "It restarts the process", "It disables logging"],
        answer: 1,
        why: "Each traced call involves extra context switches to the tracer.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use strace to find which files the ls command opens when you run ls /tmp. List the non-library ones.",
        hint: "Filter with -e trace=openat and ignore lines ending in .so.",
        solution: "strace -e trace=openat ls /tmp 2>&1 | grep -v \"\\.so\"\n# openat(AT_FDCWD, \"/etc/ld.so.cache\", ...)\n# openat(AT_FDCWD, \"/proc/filesystems\", ...)\n# openat(AT_FDCWD, \"/usr/lib/locale/locale-archive\", ...)\n# openat(AT_FDCWD, \"/tmp\", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3",
      },
      {
        level: "medium",
        task: "Find out what address curl connects to for example.com and how long the connect takes, using only strace.",
        hint: "Trace network calls and add -T.",
        solution: "strace -f -T -e trace=%network curl -s -o /dev/null https://example.com 2>&1 | grep connect\n# connect(5, {sa_family=AF_INET, sin_port=htons(443),\n#   sin_addr=inet_addr(\"93.184.215.14\")}, 16) = -1 EINPROGRESS <0.000120>\nThe -1 EINPROGRESS shows curl uses a non-blocking connect; the real\nwait appears later in poll or select calls with their own -T times.",
      },
      {
        level: "hard",
        task: "Compare cat with a 1-byte-buffer copy program using strace -c on the same 1 MB file. Explain the difference in calls and time.",
        hint: "Write a tiny loop that does read(0, &c, 1) and write(1, &c, 1).",
        solution: "head -c 1M /dev/urandom > f\nstrace -c cat f > /dev/null      # ~10 reads, ~10 writes (128 KB buffer)\nstrace -c ./copy1 < f > /dev/null # ~1,048,577 reads and 1,048,576 writes\nEach syscall has a fixed cost (mode switch, checks), so moving 1 byte\nper call multiplies overhead by a million. Bigger buffers amortise it.",
      },
    ],
    faq: [
      { q: "Does strace work on statically linked programs?", a: "Yes. strace watches system calls at the kernel boundary, so it does not care how the program was linked. ltrace, which hooks library calls, does need dynamic linking." },
      { q: "Why does strace say \"Operation not permitted\" when attaching?", a: "You may not own the process, or the kernel setting kernel.yama.ptrace_scope blocks attaching to non-child processes. Run it with sudo or start the program under strace instead." },
      { q: "Is there something lighter than strace for production?", a: "Yes. eBPF-based tools such as bpftrace, perf trace and the bcc tools (opensnoop, execsnoop) observe syscalls with far lower overhead." },
    ],
  },
};

export default extra;
