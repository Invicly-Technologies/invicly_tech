import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-shell/lab-setup": {
    plain: [
      "To learn Linux administration you need machines you are allowed to break. A virtual machine (VM) is a whole computer simulated inside your own computer. You can install Linux on it, change anything, and if it stops working, you lose nothing real. Most learners run two VMs: one from the Red Hat family (Rocky Linux or AlmaLinux) and one Ubuntu Server.",
      "Why two? Companies use both families, and they differ in small but important ways: the package tool, the firewall tool and the name of the admin group. Doing each lab on both teaches you what is Linux in general and what is just one distribution's habit.",
      "A snapshot is a saved moment of a VM. Before a risky lab, such as editing the boot loader or resizing a disk, you take a snapshot. If the VM no longer boots, you go back to the snapshot in a few seconds, as if nothing happened.",
      "Servers often have no web browser and exams like the RHCSA give you no internet. So you must find answers on the machine itself. man pages are the built-in manual, --help prints a short usage summary, and vim is the editor you will find on almost every server. Learning these three makes you independent.",
    ],
    deepDive: [
      {
        heading: "Building a useful lab",
        body: "Any hypervisor works: KVM with virt-manager on a Linux host, VirtualBox or VMware Workstation on Windows, and UTM on Apple Silicon Macs (use the ARM64 builds of Rocky, Alma and Ubuntu there). A minimal server install is happy with 2 virtual CPUs, 2 GB of RAM and a 20 GB disk.\n\nTwo extras save you time later. First, add one or two small empty disks (for example 5 GB each) to every VM now; the storage and LVM labs need disks with nothing on them. Second, give each VM a network you can reach from your host, such as a host-only or bridged network, so you can SSH in from your normal terminal and copy and paste commands. Working over SSH is also closer to real server work than typing into the VM console.",
        bullets: ["Choose the minimal or server install, not a desktop", "Create a normal user with admin rights during install", "Note each VM's IP address with ip -br addr", "Keep the install ISO around for rescue labs later"],
      },
      {
        heading: "How snapshots really work",
        body: "A snapshot does not copy the whole disk. The hypervisor freezes the current disk image and sends every new write into a separate overlay file. Reading a block checks the overlay first and falls back to the frozen image. Reverting simply throws the overlay away, which is why it is so fast.\n\nThis has two consequences. A snapshot lives on the same storage as the VM, so it is not a backup: if the host disk dies, both are gone. And long chains of snapshots make disk access slower and waste space, so delete the ones you no longer need. Take snapshots with the VM shut down when you can; a running snapshot also has to save the RAM, which is bigger and slower.",
        visual: {
          type: "layers",
          title: "A VM disk with one snapshot",
          layers: [
            { label: "What the VM sees", detail: "One normal disk, nothing looks different" },
            { label: "Overlay (new writes)", detail: "Every change since the snapshot lands here" },
            { label: "Frozen base image", detail: "Read only, the state at snapshot time" },
            { label: "Host disk", detail: "Holds both files, so it is not a backup" },
          ],
        },
      },
      {
        heading: "Getting answers from man pages",
        body: "man pages are split into numbered sections. The same word can exist in several of them: passwd(1) is the command, passwd(5) is the format of /etc/passwd. man 5 passwd picks the section, and man -f passwd lists every page with that name.\n\nman -k (also called apropos) searches a small database of page names and short descriptions. If it says nothing appropriate even for common words, the database has not been built yet; run sudo mandb once. Inside a page, type /word to search, n for the next hit, G to jump to the end (where EXAMPLES often live) and q to quit.\n\nMinimized Ubuntu images, common in the cloud, strip man pages to save space; the unminimize command puts them back. Also look in /usr/share/doc, where many packages ship sample configs.",
        visual: {
          type: "tree",
          title: "man sections an admin uses most",
          root: "man pages",
          children: [
            { label: "1: user commands", children: ["ls, grep, passwd"] },
            { label: "5: file formats", children: ["fstab, passwd, sudoers"] },
            { label: "7: overviews", children: ["hier, regex, signal"] },
            { label: "8: admin commands", children: ["useradd, mount, lvcreate"] },
          ],
        },
      },
      {
        heading: "vim beyond save and quit",
        body: "Most admin editing is small: find a line, change a value, save. A handful of Normal mode keys covers it. gg jumps to the top and G to the bottom. /PermitRoot searches forward and n repeats the search. x deletes a character, dd deletes a line, u undoes and Ctrl-r redoes. cw replaces the word under the cursor. :set number shows line numbers, and :%s/old/new/g replaces text in the whole file.\n\nOn a minimal RHEL-family install, vi comes from the small vim-minimal package and the full vim command comes from vim-enhanced. Tools like visudo, crontab -e and systemctl edit open the editor named in the EDITOR or VISUAL variable, so export EDITOR=vim if you get nano and wanted vim.",
        bullets: ["Esc always brings you back to Normal mode", ":wq or :x saves and quits", ":q! quits and throws away changes", "vimtutor is a 30-minute built-in lesson"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A safe lab routine",
        steps: [
          { label: "Snapshot", detail: "Name it after the lab, for example before-lvm" },
          { label: "Read the docs", detail: "man page, --help, /usr/share/doc" },
          { label: "Make the change", detail: "One step at a time, check each one" },
          { label: "Reboot and test", detail: "Proves the change is persistent" },
          { label: "Keep or revert", detail: "Revert if broken, then try again" },
        ],
      },
    ],
    examples: [
      {
        title: "Snapshot and revert a KVM lab VM",
        explanation: "You are about to practise resetting the root password, which can leave the VM unbootable if you make a typo. Step 1: shut the VM down. Step 2: take a named snapshot. Step 3: start the VM and do the lab. Step 4: if something goes wrong, shut it down and revert. Step 5: list and delete old snapshots so the chain stays short. VirtualBox users can do the same with VBoxManage snapshot NAME take, restore and delete.",
        code: {
          lang: "bash",
          code: "virsh shutdown rocky9\nvirsh snapshot-create-as rocky9 before-rootpw \"before root password lab\"\nvirsh start rocky9\n# ... lab goes wrong ...\nvirsh destroy rocky9                      # hard power off\nvirsh snapshot-revert rocky9 before-rootpw\nvirsh snapshot-list rocky9\nvirsh snapshot-delete rocky9 before-rootpw",
        },
      },
      {
        title: "Find the right command with no internet",
        explanation: "A task says: change the time zone. You do not remember the command. Step 1: search descriptions with man -k. Step 2: the list shows timedatectl (Control the system time and date), so read its short help. Step 3: list valid zone names and filter them. Step 4: set the zone and check the result. The same three moves (man -k, --help, man) answer most questions on an exam.",
        code: {
          lang: "bash",
          code: "man -k date | grep -i time     # if empty: sudo mandb, then retry\ntimedatectl --help\ntimedatectl list-timezones | grep -i kolkata\nsudo timedatectl set-timezone Asia/Kolkata\ntimedatectl",
        },
      },
    ],
    cheatSheet: [
      "man -k word searches page descriptions; run sudo mandb once if it finds nothing",
      "man -f passwd lists every section that has a passwd page",
      "Inside man or less: /word searches, n next match, G end, q quit",
      "ls /usr/share/doc/PACKAGE often has sample config files",
      "vim: gg top, G bottom, dd delete line, u undo, :%s/a/b/g replace all",
      "export EDITOR=vim makes visudo, crontab -e and systemctl edit use vim",
      "virsh snapshot-create-as VM NAME and virsh snapshot-revert VM NAME",
    ],
    quiz: [
      {
        q: "Why is a VM snapshot not a real backup?",
        options: ["It only saves the RAM", "It lives on the same host storage as the VM and depends on the base image", "It is deleted on every reboot", "It cannot be reverted"],
        answer: 1,
        why: "A snapshot is an overlay on the same disk, so losing the host disk loses both.",
      },
      {
        q: "You want the format of /etc/passwd, not the passwd command. What do you type?",
        options: ["man passwd", "passwd --help", "man -k passwd --file", "man 5 passwd"],
        answer: 3,
        why: "Section 5 holds file formats; plain man passwd opens section 1.",
      },
      {
        q: "man -k network returns nothing appropriate on a fresh VM. What is the most likely fix?",
        options: ["Run sudo mandb to build the search database", "Install vim-enhanced", "Reboot the VM", "Use man -K instead"],
        answer: 0,
        why: "man -k searches an index that mandb builds; on a new system it may not exist yet.",
      },
      {
        q: "In vim Normal mode, which command replaces every foo with bar in the whole file?",
        options: [":s/foo/bar/", "/foo/bar", ":%s/foo/bar/g", "r foo bar"],
        answer: 2,
        why: "% means every line and the g flag replaces all matches on each line.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Without the internet, find which command shows the system's host name and how to change it permanently.",
        hint: "Search man page descriptions for the word hostname.",
        solution: "man -k hostname\n# hostnamectl (1) - Control the system hostname\nhostnamectl --help\nsudo hostnamectl set-hostname lab1.example.com\nhostnamectl",
      },
      {
        level: "medium",
        task: "In vim, open a copy of /etc/ssh/sshd_config, show line numbers, jump to the line with PermitRootLogin, change it to no, save and quit. Confirm with grep.",
        hint: "Use :set number, /PermitRootLogin, then edit and :wq.",
        solution: "cp /etc/ssh/sshd_config ~/sshd_test\nvim ~/sshd_test\n# :set number\n# /PermitRootLogin   (press n until you reach the line)\n# 0 then C, type: PermitRootLogin no, press Esc\n# :wq\ngrep -n '^PermitRootLogin' ~/sshd_test",
      },
      {
        level: "hard",
        task: "Prepare both lab VMs for the storage labs: add two empty 5 GB disks to each, confirm Linux sees them, and take a snapshot named clean-disks.",
        hint: "Add disks in the hypervisor while the VM is off, then use lsblk inside the VM.",
        solution: "# on a KVM host, VM powered off:\nqemu-img create -f qcow2 /var/lib/libvirt/images/rocky9-b.qcow2 5G\nvirsh attach-disk rocky9 /var/lib/libvirt/images/rocky9-b.qcow2 vdb \\\n  --driver qemu --subdriver qcow2 --persistent\n# repeat for vdc, then boot and check inside the VM:\nlsblk            # vdb and vdc show 5G with no partitions\n# back on the host, VM off again:\nvirsh snapshot-create-as rocky9 clean-disks",
      },
    ],
    faq: [
      { q: "Rocky Linux or AlmaLinux for RHCSA practice?", a: "Either is fine. Both are free rebuilds that aim to match RHEL closely, so commands and file locations are the same as on the exam." },
      { q: "Can I use containers instead of VMs for the lab?", a: "Not for most of it. Containers share the host kernel and usually have no systemd, boot loader or real disks, so labs on boot, storage, SELinux and services need a full VM." },
      { q: "Do I have to use vim?", a: "No, nano is easier and fine for daily work. But vi or vim is installed on nearly every server and rescue environment, so knowing the basics avoids being stuck." },
      { q: "What is the difference between man and --help?", a: "--help prints a short summary built into the program. man opens the full manual with every option, file formats and often examples." },
    ],
  },

  "adm-shell/shell-navigation": {
    plain: [
      "On Linux every file lives in one tree of folders (directories) that starts at /, called the root. Disks, USB sticks and even network shares are attached somewhere inside this tree. To reach a file you give its path: the list of directories you walk through, separated by slashes.",
      "A path that starts with / is absolute: it always means the same place, like a full postal address. A path without a leading / is relative: it starts from where you are now, like saying two doors down. pwd prints where you are, and cd moves you.",
      "The top-level folders have fixed jobs. Settings are in /etc, logs and other changing data in /var, people's files in /home, and installed programs in /usr. Once you know this map, you can guess where almost anything is on a server you have never seen.",
      "The shell also saves you typing. Tab completes names, the up arrow and Ctrl-R bring back old commands, and wildcards like *.log let one short pattern stand for many file names.",
    ],
    deepDive: [
      {
        heading: "How the kernel follows a path",
        body: "When you open /var/log/messages, the kernel starts at / and looks up each name in turn: var inside /, then log inside var, then messages inside log. To pass through a directory you need execute (x) permission on it; to list its contents you need read (r). That is why a single locked parent directory blocks everything below it.\n\nEvery directory contains two special entries: . is the directory itself and .. is its parent, so ../logs means go up one level, then into logs. Symbolic links are followed along the way. pwd usually shows the path you typed (the logical path); pwd -P and realpath show the real location after links are resolved.",
        bullets: ["cd with no argument goes to your home directory", "cd - jumps back to the previous directory", "~ means your home, ~alice means alice's home", "realpath file prints the full resolved path"],
      },
      {
        heading: "Not every directory is on disk",
        body: "Some top-level directories are real files on disk, but others are generated on the fly. /proc and /sys are views into the kernel: /proc/cpuinfo or /proc/1234/status are produced when you read them and use no disk space. /dev holds device files, such as /dev/sda for the first disk, created by the kernel and udev at boot. /run is a tmpfs, a file system in RAM, so it is empty after every reboot.\n\nOn modern RHEL and Ubuntu, /bin, /sbin and /lib are just symbolic links into /usr, so /bin/ls and /usr/bin/ls are the same file. On RHEL, systemd-tmpfiles cleans files in /tmp that have not been used for 10 days and in /var/tmp after 30 days, so never keep anything important in either.",
        visual: {
          type: "compare",
          title: "Where the data behind each directory lives",
          columns: [
            { title: "On disk", points: ["/etc: configuration", "/usr: programs and libraries", "/var: logs, caches, databases", "/home and /root: user files"] },
            { title: "Made by the kernel", points: ["/proc: processes and kernel info", "/sys: devices and drivers", "/dev: device files", "Nothing is stored on disk"] },
            { title: "In RAM (tmpfs)", points: ["/run: PID files, sockets", "/dev/shm: shared memory", "Cleared at every boot", "Fast but limited by RAM"] },
          ],
        },
      },
      {
        heading: "Globbing and brace expansion, exactly",
        body: "The shell rewrites your command line before the program ever sees it. A glob matches existing file names: * matches any text, ? matches one character, and [abc] or [0-9] match one character from a set. A leading dot is special: * does not match hidden files such as .bashrc. If nothing matches, bash passes the pattern unchanged, so ls *.bak shows an error that mentions the literal *.bak.\n\nBrace expansion is different: it makes strings whether or not files exist. file{1..3} becomes file1 file2 file3, {01..10} keeps the zero padding, and cp app.conf{,.bak} becomes cp app.conf app.conf.bak. Quotes switch all of this off: ls \"*.log\" looks for a file literally named *.log.",
        visual: {
          type: "flow",
          title: "The order bash expands one command line",
          steps: [
            { label: "Brace expansion", detail: "a{1,2} becomes a1 a2" },
            { label: "Tilde, variables, $(...)", detail: "~ and $HOME replaced by values" },
            { label: "Word splitting", detail: "Unquoted results split on spaces" },
            { label: "Globbing", detail: "*.log replaced by matching names" },
            { label: "Quote removal", detail: "Quotes are stripped" },
            { label: "Command runs", detail: "It only sees the final words" },
          ],
        },
      },
      {
        heading: "History and line editing that save hours",
        body: "bash keeps your commands in memory and writes them to ~/.bash_history when the shell exits. HISTSIZE sets how many are kept in memory and HISTFILESIZE how many are kept in the file. Ctrl-R searches backwards as you type; press Ctrl-R again for older matches. !! repeats the last command, so sudo !! reruns it with sudo. !$ and Alt-. insert the last argument of the previous command.\n\nA few editing keys work in every bash prompt: Ctrl-A jumps to the start of the line, Ctrl-E to the end, Ctrl-W deletes the previous word and Ctrl-U deletes back to the start. Install the bash-completion package and Tab also completes command options, systemctl unit names and package names.",
        bullets: ["HISTCONTROL=ignoreboth skips duplicates and lines starting with a space", "history 20 shows the last 20 commands", "!123 reruns command number 123 from history", "Tab twice lists all possible completions"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Resolving the relative path ../log/app.log from /var/www",
        steps: [
          { label: "Start at /var/www", detail: "Relative paths begin at the current directory" },
          { label: "..", detail: "Go up to /var" },
          { label: "log", detail: "Enter /var/log (needs x permission)" },
          { label: "app.log", detail: "Final result: /var/log/app.log" },
        ],
      },
    ],
    examples: [
      {
        title: "Preview a wildcard before deleting",
        explanation: "You want to delete old rotated logs named app.log.1 to app.log.9 in /var/log/myapp but keep app.log. Step 1: put echo in front so the shell shows you what the glob expands to, without running anything. Step 2: check the list carefully. Step 3: run the real command with the same pattern. The ? matches exactly one character, so app.log itself (no suffix) and app.log.10 are not touched.",
        code: {
          lang: "bash",
          code: "cd /var/log/myapp\nls\n# app.log  app.log.1  app.log.2  app.log.10  app.log.3\necho rm app.log.?\n# rm app.log.1 app.log.2 app.log.3\nsudo rm app.log.?",
        },
      },
      {
        title: "Find out where a command really lives",
        explanation: "Someone says python3 is broken. Step 1: type -a shows every match in your PATH and whether it is an alias or function. Step 2: realpath follows symbolic links to the real file. Step 3: on a RHEL-family system, rpm -qf tells you which package owns the file (on Ubuntu, dpkg -S does the same). Now you know exactly which binary runs.",
        code: {
          lang: "bash",
          code: "type -a python3\n# python3 is /usr/bin/python3\nrealpath /usr/bin/python3\n# /usr/bin/python3.9\nrpm -qf /usr/bin/python3.9      # Ubuntu: dpkg -S /usr/bin/python3.12\necho \"$PATH\" | tr ':' '\\n'      # the directories searched, in order",
        },
      },
    ],
    cheatSheet: [
      "pwd -P shows the real directory after following symbolic links",
      "cd - goes back to the previous directory; cd alone goes home",
      "echo rm *.tmp previews what a glob expands to before you run it",
      "cp file{,.bak} makes a quick backup copy called file.bak",
      "mkdir -p ~/lab/{data,logs,scripts} builds a small tree in one command",
      "Ctrl-R searches history; sudo !! reruns the last command with sudo",
      "/proc and /sys use no disk; /run and /dev/shm are in RAM and cleared at boot",
      "type -a cmd shows every alias, function and file that matches cmd",
    ],
    quiz: [
      {
        q: "You are in /home/alice/projects. Which path points to /home/alice/notes.txt?",
        options: ["./notes.txt", "../notes.txt", "/notes.txt", "~/projects/notes.txt"],
        answer: 1,
        why: ".. goes up one level from projects to /home/alice.",
      },
      {
        q: "A directory contains only .env and config.yml. What does ls * show?",
        options: ["Both files", "Only .env", "Nothing and an error", "Only config.yml"],
        answer: 3,
        why: "A plain * does not match names that start with a dot.",
      },
      {
        q: "What does echo backup{1..3}.tar print when no such files exist?",
        options: ["backup1.tar backup2.tar backup3.tar", "backup{1..3}.tar", "An error: no such file", "Nothing"],
        answer: 0,
        why: "Brace expansion generates strings and does not check whether files exist.",
      },
      {
        q: "Which directory is a tmpfs in RAM and empty after every reboot?",
        options: ["/var/tmp", "/srv", "/run", "/opt"],
        answer: 2,
        why: "/run holds runtime state such as PID files and sockets and lives in memory.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Starting from your home directory, go to /var/log, list the five most recently changed files, then return to where you were with one short command.",
        hint: "ls -lt sorts by time; cd has a shortcut for the previous directory.",
        solution: "cd ~\ncd /var/log\nls -lt | head -6     # first line is the total\ncd -\npwd                  # back in your home directory",
      },
      {
        level: "medium",
        task: "Create ~/lab/2026/{01..12} (one folder per month), each with an empty notes.txt, using as few commands as possible. Then count the files.",
        hint: "Brace expansion works in both mkdir and touch.",
        solution: "mkdir -p ~/lab/2026/{01..12}\ntouch ~/lab/2026/{01..12}/notes.txt\nls ~/lab/2026\nfind ~/lab/2026 -name notes.txt | wc -l   # 12",
      },
      {
        level: "hard",
        task: "Show which top-level directories are separate mounts and what kind of file system each one is, so you can tell disk, RAM and kernel-made directories apart.",
        hint: "findmnt can print the target, source and file system type; limit the depth with a filter.",
        solution: "findmnt -l -o TARGET,SOURCE,FSTYPE | awk 'NR==1 || $1 ~ /^\\/[a-z]*$/'\n# proc and sysfs = kernel views, tmpfs = RAM,\n# xfs or ext4 = real disk, devtmpfs = /dev",
      },
    ],
    faq: [
      { q: "What is the difference between /usr/bin and /usr/local/bin?", a: "/usr/bin is managed by the package manager. /usr/local/bin is for programs you install by hand, so updates never overwrite them; it usually comes earlier in PATH." },
      { q: "Why does ls not show files starting with a dot?", a: "Names starting with a dot are hidden by convention. Use ls -a to see them, or ls -A to see them without . and .." },
      { q: "Where should I put my own application on a server?", a: "Common choices are /opt/appname for self-contained software and /srv for data a service serves. Its config goes in /etc and its logs and state under /var." },
      { q: "Is /tmp safe for files I need tomorrow?", a: "No. /tmp may be cleared at boot or cleaned automatically after some days, depending on the distribution. Use your home directory or /var/tmp only for short-lived work." },
    ],
  },

  "adm-shell/text-tools": {
    plain: [
      "On Linux, almost everything is text: config files, logs, and the output of most commands. So a big part of an admin's job is reading text and pulling out the bit that matters. A few small tools do this very well, and each does one job.",
      "grep finds lines that contain a pattern. sed changes text as it flows past, for example replacing one word with another. awk and cut pick out columns, like the third word on each line. sort puts lines in order, uniq removes or counts repeats, and diff shows what changed between two files.",
      "The real power comes from joining them with the pipe symbol |, which passes one tool's output to the next tool. Each step is simple, but together they answer real questions, such as which user runs the most processes or which page returns the most errors.",
      "Patterns are written as regular expressions, a small language for describing text. ^ means start of line, $ means end of line, . means any character and * means repeat the thing before it. You only need a few of these to be productive.",
    ],
    deepDive: [
      {
        heading: "Regular expressions and grep flags that matter",
        body: "grep uses basic regular expressions by default. In that mode, characters like + ? | ( and { have no special meaning unless you put a backslash before them. grep -E switches to extended regular expressions, where they work directly: grep -E 'error|fail' finds either word. grep -F treats the pattern as plain text, which is fastest and avoids surprises with dots in IP addresses.\n\nUseful flags: -n shows line numbers, -c counts matching lines (not matches), -o prints only the matched part, -w matches whole words, -l lists only file names, and -A 3, -B 3 or -C 3 show lines after, before or around each hit. grep -q prints nothing and only sets the exit status: 0 if something matched, 1 if nothing did, 2 on an error. Scripts use that in if statements.",
        bullets: ["[[:digit:]] and [0-9] both match one digit", "^$ matches an empty line", "grep -v '^#' drops comment lines", "grep -rn 'Listen' /etc/httpd searches a whole tree"],
      },
      {
        heading: "How sed processes a stream",
        body: "sed reads one line at a time into a buffer called the pattern space, runs your commands on it, prints it, and moves on. The most common command is s/old/new/flags. The g flag replaces every match on the line, not just the first. In the replacement, & stands for the whole matched text. You can pick another delimiter when the text has slashes: s|/usr/local|/opt| is easier to read.\n\nCommands can have an address that limits where they run: a line number (3d deletes line 3), a pattern (/^#/d deletes comment lines) or a range (10,20s/a/b/). sed -n stops the automatic printing, so sed -n '/ERROR/p' acts like grep. sed -i changes the file in place; sed -i.bak does the same but keeps a backup copy first.",
        visual: {
          type: "cycle",
          title: "The sed loop for every line",
          steps: [
            { label: "Read a line", detail: "Copy it into the pattern space" },
            { label: "Check the address", detail: "Does this line match the line number or pattern?" },
            { label: "Run commands", detail: "s, d, p and so on change the buffer" },
            { label: "Print the buffer", detail: "Skipped with -n or after d" },
          ],
        },
      },
      {
        heading: "awk for columns, filters and totals",
        body: "awk splits each line into fields. $1 is the first field, $NF the last, and $0 the whole line. By default fields are separated by any run of spaces or tabs, which is why awk handles command output like ps or df far better than cut. -F sets another separator, such as -F: for /etc/passwd.\n\nAn awk program is a list of pattern { action } pairs. The pattern filters lines: awk -F: '$3 >= 1000 {print $1}' /etc/passwd prints normal user names. NR is the current line number and NF the number of fields. BEGIN runs before the first line and END after the last, so totals are easy: awk '{sum += $5} END {print sum}' adds up column 5.\n\ncut is simpler and faster but only takes a single-character delimiter and treats two spaces as an empty field between them.",
        bullets: ["awk 'NR==1' prints only the first line", "awk '{print $1, $NF}' prints the first and last fields", "cut -c1-10 cuts by character position", "printf in awk formats aligned output"],
      },
      {
        heading: "sort, uniq and diff in detail",
        body: "sort compares text by default, so 10 comes before 9. Use -n for numbers, -h for human sizes like 4K, 2M and 1G (perfect after du -h), -r to reverse and -k to choose a column: sort -t: -k3,3n sorts /etc/passwd by UID. sort -u removes duplicate lines in one step.\n\nuniq only merges neighbouring identical lines, so it almost always follows sort. uniq -c counts each group, uniq -d shows only repeated lines and uniq -u only unique ones.\n\ndiff compares two files. With -u it prints the unified format used by patches and code review: lines starting with - were removed, + were added, and @@ markers show where. diff -r compares whole directories, which is a quick way to see what changed between a config backup and the live /etc.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which tool for which job",
        columns: [
          { title: "grep", points: ["Find lines", "Filter in or out", "Count matching lines", "Search whole directories"] },
          { title: "sed", points: ["Replace text", "Delete lines by pattern", "Edit files in place with -i", "Print a range of lines"] },
          { title: "awk", points: ["Pick columns", "Filter by a field's value", "Sum and average", "Format a small report"] },
        ],
      },
    ],
    examples: [
      {
        title: "Summarise a web server access log",
        explanation: "In the common combined log format, field 1 is the client IP, field 7 the requested path and field 9 the HTTP status code. Step 1: count requests per status code. Step 2: list the five IPs that sent the most requests. Step 3: show which paths produced server errors (status 5xx), most frequent first. Each line is just a filter, a column picker and a count.",
        code: {
          lang: "bash",
          code: "LOG=/var/log/nginx/access.log\nawk '{print $9}' \"$LOG\" | sort | uniq -c | sort -rn\nawk '{print $1}' \"$LOG\" | sort | uniq -c | sort -rn | head -5\nawk '$9 ~ /^5/ {print $7}' \"$LOG\" | sort | uniq -c | sort -rn | head",
        },
      },
      {
        title: "Change a config value safely with sed",
        explanation: "You must turn off SSH password logins. The line may be commented out or set to yes. Step 1: see what is there now with grep -n. Step 2: preview the change by running sed without -i and filtering the result. Step 3: apply it with -i.bak so a backup exists. Step 4: diff the backup and the new file. Step 5: let sshd check the syntax before you reload it. On cloud images also check /etc/ssh/sshd_config.d/, because sshd uses the first value it reads for most settings.",
        code: {
          lang: "bash",
          code: "F=/etc/ssh/sshd_config\ngrep -n 'PasswordAuthentication' \"$F\"\nsed -E 's/^#?PasswordAuthentication .*/PasswordAuthentication no/' \"$F\" | grep -n '^PasswordAuth'\nsudo sed -i.bak -E 's/^#?PasswordAuthentication .*/PasswordAuthentication no/' \"$F\"\ndiff -u \"$F.bak\" \"$F\"\nsudo sshd -t && sudo systemctl reload sshd",
        },
      },
    ],
    cheatSheet: [
      "grep -E 'a|b' matches either word; grep -F 'x.y' matches the dot literally",
      "grep -c counts matching lines, not total matches; grep -o word | wc -l counts matches",
      "grep -C 3 pattern file shows 3 lines of context around each match",
      "sed -n '10,20p' file prints only lines 10 to 20",
      "sed -i.bak 's/old/new/g' file edits in place and keeps file.bak",
      "awk -F: '$3 >= 1000 {print $1}' /etc/passwd lists normal user accounts",
      "du -sh * | sort -h sorts human-readable sizes correctly",
      "diff -u old new shows changes with - for removed and + for added lines",
    ],
    quiz: [
      {
        q: "A log line contains the word error three times. What does grep -c error print for a file with only that line?",
        options: ["3", "0", "1", "An error"],
        answer: 2,
        why: "grep -c counts matching lines, and only one line matches.",
      },
      {
        q: "Which command prints the user name and UID columns of /etc/passwd?",
        options: ["cut -d: -f1,3 /etc/passwd", "cut -f1,3 /etc/passwd", "awk '{print $1, $3}' /etc/passwd", "sort -k1,3 /etc/passwd"],
        answer: 0,
        why: "The file is colon-separated, so you must set the delimiter with -d: (or -F: in awk).",
      },
      {
        q: "What does & mean in the sed command s/[0-9]+/[&]/ with -E?",
        options: ["A background job", "Logical AND", "A literal ampersand", "The whole text that matched"],
        answer: 3,
        why: "In the replacement part, & is replaced by the matched text, so 42 becomes [42].",
      },
      {
        q: "Why does sort put 100 before 9 by default?",
        options: ["It sorts by file size", "It compares text character by character", "It is a bug in sort", "It sorts newest first"],
        answer: 1,
        why: "Without -n, sort compares strings, and the character 1 sorts before 9.",
      },
      {
        q: "Which flag makes grep print nothing and only report success or failure through its exit status?",
        options: ["-s", "-v", "-q", "-l"],
        answer: 2,
        why: "grep -q is quiet and exits 0 on a match, which is ideal in if statements.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show all lines in /etc/ssh/sshd_config that are not comments and not empty.",
        hint: "Remove lines that start with # and lines that are empty; -v inverts a match.",
        solution: "grep -Ev '^#|^$' /etc/ssh/sshd_config\n# or with sed:\nsed -e '/^#/d' -e '/^$/d' /etc/ssh/sshd_config",
      },
      {
        level: "medium",
        task: "List every login shell used in /etc/passwd with the number of accounts using it, most common first.",
        hint: "The shell is field 7 when you split on colons.",
        solution: "cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn\n# example output:\n#   25 /sbin/nologin\n#    3 /bin/bash",
      },
      {
        level: "hard",
        task: "Using ps output, print the total memory (RSS, in MB) used by each user, largest first, as a neat two-column report.",
        hint: "ps -eo user,rss prints KiB per process; use an awk array keyed by user and print in END.",
        solution: "ps -eo user=,rss= | awk '\n  { mem[$1] += $2 }\n  END { for (u in mem) printf \"%-12s %8.1f MB\\n\", u, mem[u]/1024 }\n' | sort -k2 -rn",
      },
    ],
    faq: [
      { q: "What is the difference between grep, egrep and grep -E?", a: "egrep is an old name for grep -E. Recent GNU grep prints a warning when you use egrep, so write grep -E in new scripts." },
      { q: "Should I use awk or cut?", a: "Use cut for files with a single, consistent delimiter like /etc/passwd. Use awk for command output with variable spacing or when you need conditions or totals." },
      { q: "How do I undo sed -i?", a: "You cannot, unless you kept a backup. Use sed -i.bak, or preview the result without -i first and compare with diff." },
      { q: "Why does my grep pattern with a dot match too much?", a: "In a regular expression a dot means any character, so 10.0.0.1 also matches 10a0b0c1. Escape the dots or use grep -F for fixed text." },
    ],
  },

  "adm-shell/redirection-pipes": {
    plain: [
      "Every program you run gets three channels for free. Standard input (stdin, number 0) is where it reads from, usually your keyboard. Standard output (stdout, number 1) is where normal results go, and standard error (stderr, number 2) is for error messages. Both outputs show up on your screen by default.",
      "Redirection changes where those channels point. > sends output into a file, >> adds to the end of a file, and 2> catches error messages separately. A pipe, written |, connects one program's output straight into the next program's input, so small tools can work as a team.",
      "The shell also carries settings called variables. Some are just for the shell itself; exported ones are copied to every program you start. PATH, for example, tells the shell where to look for commands, and EDITOR tells tools which editor to open.",
      "Settings typed at the prompt vanish when you log out. To keep them, you put them in startup files such as ~/.bashrc, which bash reads every time it starts.",
    ],
    deepDive: [
      {
        heading: "What the shell does with a redirection",
        body: "Redirection is done by the shell, not by the command. For cmd > out.txt, the shell starts a child process, opens out.txt (creating it or cutting it to zero length), connects that file to file descriptor 1, and only then runs cmd. The command just writes to stdout as usual and never knows a file is involved.\n\nTwo classic traps follow from this. First, sort data.txt > data.txt destroys the file: the shell empties it before sort even reads it. Write to a new file and rename it instead. Second, sudo echo text > /etc/motd fails with Permission denied, because your own shell, not root, opens /etc/motd. Use echo text | sudo tee /etc/motd > /dev/null, or tee -a to append.",
        visual: {
          type: "flow",
          title: "Running cmd > out.txt",
          steps: [
            { label: "Shell forks a child", detail: "Still your user, still the shell" },
            { label: "Open out.txt", detail: "Created or truncated to zero right now" },
            { label: "Attach to fd 1", detail: "stdout now points at the file" },
            { label: "exec cmd", detail: "The program replaces the child" },
            { label: "cmd writes", detail: "Output lands in the file" },
          ],
        },
      },
      {
        heading: "Order matters: reading 2>&1 correctly",
        body: "Redirections are applied from left to right, and 2>&1 means make fd 2 point to wherever fd 1 points right now. It copies a target; it does not create a permanent link.\n\nIn cmd > out 2>&1, stdout first goes to out, then stderr copies that, so both land in the file. In cmd 2>&1 > out, stderr first copies stdout (still the terminal), then stdout moves to the file, so errors still appear on screen. bash has a shorter form, cmd &> out, and cmd |& next pipes both streams into the next command.\n\nInput has tricks too. A here-document (cat <<EOF) feeds several lines as stdin. Quote the marker as <<'EOF' and variables inside are not expanded, which is what you want when writing a script file. A here-string, grep x <<< \"$var\", feeds one string.",
        visual: {
          type: "compare",
          title: "Same pieces, different order",
          columns: [
            { title: "cmd > out 2>&1", points: ["Step 1: stdout goes to out", "Step 2: stderr copies stdout", "Both streams in the file", "Usually what you want"] },
            { title: "cmd 2>&1 > out", points: ["Step 1: stderr copies the terminal", "Step 2: stdout goes to out", "Errors still on screen", "A common mistake"] },
          ],
        },
      },
      {
        heading: "How pipes behave",
        body: "In a | b | c, all three programs start at the same time. The kernel gives each pipe a small buffer (64 KiB by default on Linux). When it is full, the writer pauses; when it is empty, the reader waits. That is why pipelines handle files far larger than RAM.\n\nIf a reader quits early, as head does after 10 lines, the writer gets the SIGPIPE signal and stops quietly. The pipeline's exit status is that of the last command only, so a failing first command is invisible. In scripts use set -o pipefail, or check the PIPESTATUS array, which holds every command's status.\n\nEach part of a pipeline runs in a subshell. So echo hi | read x leaves x empty in your shell. Use x=$(echo hi) instead.",
        bullets: ["echo \"${PIPESTATUS[@]}\" shows every exit code of the last pipeline", "tee -a appends instead of overwriting", "xargs turns lines of input into command arguments"],
      },
      {
        heading: "Variables, export and the environment",
        body: "NAME=value creates a shell variable. It exists only in the current shell. export NAME copies it into the environment, the list of settings each child process inherits. A child can never change its parent's variables, which is why a script that sets PATH does not affect your prompt unless you source it.\n\nYou can set a variable for one command only: LANG=C sort file. env and printenv list the environment; set lists shell variables too. Always use double quotes: \"$FILE\" keeps a name with spaces as one word, while single quotes stop expansion completely, so '$HOME' stays literally $HOME. Command substitution, $(cmd), puts a command's output into a line; it nests cleanly, unlike the older backtick form.",
        bullets: ["PATH is searched left to right; the first match wins", "unset NAME removes a variable", "echo $? prints the last command's exit status"],
      },
      {
        heading: "Which startup file runs when",
        body: "bash reads different files depending on how it starts. A login shell, such as an SSH session or a console login, reads /etc/profile (which also runs every .sh script in /etc/profile.d/), then the first one it finds of ~/.bash_profile, ~/.bash_login and ~/.profile. An interactive non-login shell, such as a new terminal tab, reads ~/.bashrc. Both RHEL and Ubuntu make the login files source ~/.bashrc too, so in practice ~/.bashrc is the place for aliases, functions and your prompt.\n\nFor settings every user should get, add a file such as /etc/profile.d/proxy.sh rather than editing /etc/profile, so package updates do not overwrite it. After editing, run source ~/.bashrc (or open a new shell) to apply the change. Scripts run with bash script.sh are non-interactive and read none of these files.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "File descriptors of a process in a pipeline",
        layers: [
          { label: "fd 0 stdin", detail: "Reads from the previous command's pipe" },
          { label: "fd 1 stdout", detail: "Writes into the next command's pipe" },
          { label: "fd 2 stderr", detail: "Still goes to the terminal unless redirected" },
          { label: "fd 3 and up", detail: "Files the program opens itself" },
        ],
      },
    ],
    examples: [
      {
        title: "Log a long job and still watch it",
        explanation: "You run a backup script that takes an hour. You want all its output, errors included, in a dated log file, and you also want to see progress on screen. Step 1: merge stderr into stdout with 2>&1. Step 2: pipe into tee, which writes to the file and to the screen. Step 3: turn on pipefail so the line fails if the script fails, not just if tee fails. Step 4: check the exit status.",
        code: {
          lang: "bash",
          code: "set -o pipefail\nLOG=~/backup-$(date +%F).log\n./backup.sh 2>&1 | tee \"$LOG\"\necho \"exit status: $?\"\ngrep -i error \"$LOG\"",
        },
      },
      {
        title: "Write a root-owned config file from a normal shell",
        explanation: "You need to create /etc/profile.d/editor.sh so every user gets vim as their editor. sudo cat > file does not work, because your own shell opens the file. Step 1: send a quoted here-document into sudo tee, which runs as root and opens the file itself. The quoted 'EOF' stops your shell from expanding anything inside. Step 2: hide tee's screen copy with > /dev/null. Step 3: open a new login shell and confirm the variable is set.",
        code: {
          lang: "bash",
          code: "sudo tee /etc/profile.d/editor.sh > /dev/null <<'EOF'\nexport EDITOR=vim\nexport VISUAL=vim\nEOF\nls -l /etc/profile.d/editor.sh\nbash -lc 'echo $EDITOR'      # vim",
        },
      },
    ],
    cheatSheet: [
      "cmd > out 2>&1 or cmd &> out captures stdout and stderr in one file",
      "cmd 2>/dev/null hides errors; cmd > /dev/null 2>&1 hides everything",
      "echo text | sudo tee -a /etc/file appends to a root-owned file",
      "set -o pipefail makes a pipeline fail if any command in it fails",
      "VAR=value cmd sets a variable for that one command only",
      "Quoted <<'EOF' keeps $ signs literal inside a here-document",
      "Put aliases in ~/.bashrc and system-wide settings in /etc/profile.d/NAME.sh",
      "source ~/.bashrc applies changes to the current shell",
    ],
    quiz: [
      {
        q: "Which command sends both stdout and stderr to all.log?",
        options: ["cmd 2>&1 > all.log", "cmd > all.log 2>&1", "cmd 2> all.log", "cmd | all.log"],
        answer: 1,
        why: "stdout is pointed at the file first, then stderr copies that target.",
      },
      {
        q: "Why does sudo echo hi > /root/test.txt fail for a normal user?",
        options: ["echo cannot run as root", "The file must exist first", "Your own non-root shell opens the file before sudo runs", "sudo blocks all redirection"],
        answer: 2,
        why: "Redirection is done by the calling shell, which does not have root's permissions.",
      },
      {
        q: "A script sets MYVAR=1 without export and then runs python app.py. What does the Python program see?",
        options: ["MYVAR is not in its environment", "MYVAR=1", "MYVAR is empty but defined", "An error"],
        answer: 0,
        why: "Only exported variables are copied to child processes.",
      },
      {
        q: "false | true runs in bash without pipefail. What is $? afterwards?",
        options: ["1", "2", "It depends on the terminal", "0"],
        answer: 3,
        why: "Without pipefail the pipeline's status is the last command's, and true returns 0.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run find / -name '*.repo' as a normal user. Save the results in repos.txt and the Permission denied errors in errors.txt, then count the lines in each.",
        hint: "Use > for stdout and 2> for stderr in the same command.",
        solution: "find / -name '*.repo' > repos.txt 2> errors.txt\nwc -l repos.txt errors.txt",
      },
      {
        level: "medium",
        task: "Add a permanent alias ll='ls -lah' and a variable BACKUP_DIR=/srv/backup that child processes can see. Prove both work in a new shell.",
        hint: "Append to ~/.bashrc, remember export, and quote the alias.",
        solution: "cat >> ~/.bashrc <<'EOF'\nalias ll='ls -lah'\nexport BACKUP_DIR=/srv/backup\nEOF\nsource ~/.bashrc\nbash -ic 'type ll; echo $BACKUP_DIR'\nbash -c 'echo $BACKUP_DIR'     # visible to a child process",
      },
      {
        level: "hard",
        task: "Write a one-liner that prints the exit status of every command in the pipeline grep root /etc/shadow | wc -l when run as a normal user, then explain the numbers.",
        hint: "PIPESTATUS must be read right after the pipeline, before any other command.",
        solution: "grep root /etc/shadow | wc -l; echo \"${PIPESTATUS[@]}\"\n# prints 0 (from wc), then: 2 0\n# grep exits 2 because it cannot read /etc/shadow,\n# wc exits 0, so $? alone would hide the failure.",
      },
    ],
    faq: [
      { q: "What is the difference between > and >>?", a: "> empties the file and writes fresh content. >> keeps what is there and adds to the end." },
      { q: "What is /dev/null?", a: "A special file that throws away everything written to it and returns nothing when read. Redirect output there when you do not need it." },
      { q: "Should I put settings in .bashrc or .bash_profile?", a: "Put almost everything in ~/.bashrc. On RHEL and Ubuntu the login files already source it, so it applies to SSH logins and new terminals alike." },
      { q: "Why does my variable disappear after the script ends?", a: "A script runs in a child process, and children cannot change the parent's variables. Run it with source script.sh to apply its variables to your current shell." },
    ],
  },
};

export default extra;
