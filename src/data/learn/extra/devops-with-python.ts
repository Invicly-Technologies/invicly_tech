import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  "linux/fs-perms": {
    plain: [
      "Linux keeps everything in one big folder tree that starts at / (called the root directory). There are no drive letters like C:. A second disk or a USB stick simply shows up as a folder somewhere in that tree, for example /mnt/data. Config lives in /etc, logs in /var/log, and your apps usually go in /srv or /opt.",
      "Every file carries a small label: who owns it, which group it belongs to, and what each kind of person may do with it. When a program opens a file, Linux compares that label with the user the program runs as. If they don't match, you get \"Permission denied\". The file is fine; the wrong person is knocking.",
      "A user is just an account with a number called a UID (user ID). Root has UID 0 and can do almost anything. People and services each get their own account, so a bug in the web server can't wipe your home folder. Groups bundle users together, so you can give a whole team access in one step.",
      "In DevOps you meet this daily: a deploy script that can't write to /srv/app, an SSH key that is \"too open\", a disk that is suddenly full. Once you know where things live and who owns them, these stop being mysteries and become one-line fixes.",
    ],
    deepDive: [
      {
        heading: "How Linux decides: owner, then group, then others",
        body: "When a process opens a file, the kernel compares the process's user ID and group IDs with the file. It checks in a fixed order and stops at the first match. If you are the owner, only the owner bits count, even if the group bits would allow more. If you are not the owner but are in the file's group, the group bits apply. Otherwise the others bits apply.\n\nRoot (UID 0) skips read and write checks entirely. That is why running everything as root hides permission bugs until production, where the service runs as a normal user and suddenly fails.",
        bullets: ["The first match wins, even if a later class is looser", "Mode 077 locks out the owner but not the group", "Root bypasses read and write checks", "id shows your UID, GID and every group you are in"],
      },
      {
        heading: "umask: the default for new files",
        body: "New files don't get permissions at random. Programs ask for 666 for files and 777 for directories, and the umask removes bits from that request. With the common umask 022, new files become 644 (rw-r--r--) and new directories 755. With umask 027, others get nothing: files become 640 and directories 750.\n\nRun umask to see your current value. A service can set its own with UMask=0027 in its systemd unit, which is handy for apps that write files other users should not read.",
        visual: {
          type: "compare",
          title: "Two common umask values",
          columns: [
            { title: "umask 022", points: ["Files: 666 becomes 644", "Directories: 777 becomes 755", "Others can still read"] },
            { title: "umask 027", points: ["Files: 666 becomes 640", "Directories: 777 becomes 750", "Others get nothing"] },
          ],
        },
      },
      {
        heading: "Special bits: setuid, setgid and sticky",
        body: "Beyond rwx there are three extra bits. setuid (4000) on a program makes it run as the file's owner; /usr/bin/passwd uses it so normal users can update the root-owned password file. setgid (2000) on a directory makes new files inherit the directory's group, which is perfect for shared team folders. The sticky bit (1000) on a directory means only a file's owner can delete it; /tmp has mode 1777 for exactly this reason.\n\nIn ls -l they show up as s or t in the execute position, for example drwxrwsr-x for a setgid folder.",
        bullets: ["chmod 2775 /srv/shared turns on setgid for a folder", "chmod +t /srv/drop turns on the sticky bit", "List setuid programs: find / -perm -4000 -type f 2>/dev/null"],
        visual: {
          type: "compare",
          title: "The three special bits",
          columns: [
            { title: "setuid (4000)", points: ["Set on programs", "Runs as the file's owner", "Example: /usr/bin/passwd", "Shown as s in the owner x slot"] },
            { title: "setgid (2000)", points: ["Here: set on directories", "New files inherit the folder's group", "Good for shared team folders", "Shown as s in the group x slot"] },
            { title: "Sticky (1000)", points: ["Set on directories", "Only a file's owner can delete it", "Example: /tmp is 1777", "Shown as t in the others x slot"] },
          ],
        },
      },
      {
        heading: "Users, groups and sudo in practice",
        body: "Accounts live in /etc/passwd, groups in /etc/group, and password hashes in /etc/shadow, which only root can read. For services, create accounts that cannot log in: useradd --system --shell /usr/sbin/nologin app. That account can own files and run a service, but nobody can open a shell as it.\n\nsudo rules live in /etc/sudoers and /etc/sudoers.d/. Always edit them with visudo, which checks the syntax before saving; a broken file can lock everyone out of sudo. You can grant very narrow rights, such as letting the deploy user restart one service and nothing else.",
        bullets: ["deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart app", "sudo -l lists what you are allowed to run", "getent group web shows the members of a group"],
      },
      {
        heading: "Finding what fills the disk",
        body: "A full disk breaks databases, logs and deploys. Start wide with df -h to see which filesystem is full. Then narrow down: sudo du -xh --max-depth=1 /var | sort -h shows the biggest folders, and -x stays on that one filesystem. Repeat one level deeper until you find the culprit, often old logs, Docker images or a crash dump.\n\nIf df says the disk is full but du can't find the space, a deleted file may still be held open by a running process. sudo lsof +L1 lists such files; restarting that process frees the space.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How the kernel checks one file access",
        steps: [
          { label: "Process opens file", detail: "It runs as a UID with some groups" },
          { label: "Is it root?", detail: "Yes: read and write are allowed" },
          { label: "Is it the owner?", detail: "Yes: use the owner bits only" },
          { label: "In the file's group?", detail: "Yes: use the group bits only" },
          { label: "Everyone else", detail: "Use the others bits" },
          { label: "Allow or deny", detail: "Deny returns Permission denied" },
        ],
      },
      {
        type: "tree",
        title: "Where things live on a Linux server",
        root: "/",
        children: [
          { label: "/etc", children: ["System and app config", "passwd, group, sudoers"] },
          { label: "/var", children: ["/var/log for logs", "/var/lib for app and database data"] },
          { label: "/home", children: ["One folder per person", "~/.ssh holds SSH keys"] },
          { label: "/srv and /opt", children: ["Your deployed apps", "Data served by the machine"] },
          { label: "/usr", children: ["Installed programs", "/usr/local for hand-installed tools"] },
          { label: "/tmp", children: ["Scratch files", "Mode 1777, often wiped on reboot"] },
        ],
      },
    ],
    examples: [
      {
        title: "A shared folder for a team",
        explanation: "Alice and Bob need to edit the same files in /srv/shared. Step 1: create a group and add both people. Step 2: give the folder to that group with mode 2770, so the group can read, write and enter, others get nothing, and the setgid bit makes every new file belong to devs. Step 3: both users log out and back in so the new group applies. To make new files group-writable too, each user sets umask 002 in their shell profile.",
        code: {
          lang: "bash",
          code: "sudo groupadd devs\nsudo usermod -aG devs alice\nsudo usermod -aG devs bob\nsudo mkdir -p /srv/shared\nsudo chown root:devs /srv/shared\nsudo chmod 2770 /srv/shared\nls -ld /srv/shared\n# drwxrws--- 2 root devs 4096 ... /srv/shared",
        },
      },
      {
        title: "SSH ignores your key",
        explanation: "You copied your public key into ~/.ssh/authorized_keys on a server, but SSH still asks for a password. The SSH server refuses keys if your home folder, ~/.ssh or authorized_keys can be written by other people, because then someone else could add their own key. Step 1: look at the modes. Step 2: tighten them. Step 3: try again with ssh -v to see which key is offered and accepted.",
        code: {
          lang: "bash",
          code: "ls -ld ~ ~/.ssh ~/.ssh/authorized_keys\nchmod go-w ~\nchmod 700 ~/.ssh\nchmod 600 ~/.ssh/authorized_keys\n# on your laptop, the private key must be private too\nchmod 600 ~/.ssh/id_ed25519\nssh -v deploy@server 2>&1 | grep -i 'offering\\|accepted'",
        },
      },
    ],
    cheatSheet: [
      "ls -ld dir shows the directory itself, not what is inside it",
      "stat -c '%a %U:%G %n' file prints the mode as numbers plus owner and group",
      "umask 022 gives files 644 and dirs 755; umask 027 gives 640 and 750",
      "chmod 2775 dir: new files inherit the directory's group (setgid)",
      "/tmp is 1777: anyone can write, only the owner can delete (sticky bit)",
      "~/.ssh should be 700 and private keys 600, or SSH may refuse them",
      "Edit sudo rules with visudo; put your own rules in /etc/sudoers.d/",
      "df -h finds the full filesystem; du -xh --max-depth=1 finds the big folder",
    ],
    quiz: [
      {
        q: "A file is owned by alice with mode 077 (----rwxrwx). Can alice read it?",
        options: ["Yes, owners can always read", "No, because only the empty owner bits apply to her", "Yes, through the others bits", "Only if she is in the group"],
        answer: 1,
        why: "The kernel stops at the first match, and alice matches as owner, whose bits are all empty.",
      },
      {
        q: "With umask 027, what mode does a newly created regular file get?",
        options: ["755", "644", "640", "600"],
        answer: 2,
        why: "Files start from 666, and removing 027 leaves 640.",
      },
      {
        q: "What does the setgid bit do on a directory?",
        options: ["New files inside inherit the directory's group", "Files inside run as the group", "Only owners can delete files inside", "It hides the directory from ls"],
        answer: 0,
        why: "setgid on a directory passes its group to every new file and subfolder.",
      },
      {
        q: "df says / is 100% full, but du only finds half that much data. What is a likely cause?",
        options: ["du cannot read /etc", "A deleted file is still held open by a running process", "The umask is too strict", "The sticky bit is set on /tmp"],
        answer: 1,
        why: "Space is only freed when the last process closes the file, so lsof +L1 helps find it.",
      },
      {
        q: "Why should you edit sudo rules with visudo instead of a normal editor?",
        options: ["It makes sudo faster", "It encrypts the rules", "It is the only editor root may use", "It checks the syntax so a typo can't lock you out of sudo"],
        answer: 3,
        why: "A broken sudoers file stops sudo working for everyone, and visudo refuses to save one.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create one file with your normal umask, then set umask 077 and create a second file. Compare both with ls -l and explain the difference.",
        hint: "New files start from 666 before the umask removes bits.",
        solution: "touch a.txt; ls -l a.txt     # -rw-r--r-- with umask 022\numask 077\ntouch b.txt; ls -l b.txt     # -rw-------\numask 022                     # put it back\n# 666 minus 077 leaves read and write for the owner only.",
      },
      {
        level: "medium",
        task: "Create a system user called app that cannot log in. Make /srv/app owned by app and group web, so app can write, web can read, and others get nothing.",
        hint: "Use useradd --system, chown -R, and separate modes for folders (need x) and files.",
        solution: "sudo useradd --system --shell /usr/sbin/nologin app\nsudo groupadd -f web\nsudo mkdir -p /srv/app\nsudo chown -R app:web /srv/app\nsudo find /srv/app -type d -exec chmod 750 {} +\nsudo find /srv/app -type f -exec chmod 640 {} +\nsudo -u app touch /srv/app/ok && echo app can write",
      },
      {
        level: "hard",
        task: "Let the user deploy restart the app service without a password, but nothing else. Prove that other systemctl commands are still refused.",
        hint: "Put a single rule in /etc/sudoers.d/ with visudo -f, and test with sudo -n (non-interactive).",
        solution: "sudo visudo -f /etc/sudoers.d/deploy\n# add this one line:\n# deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart app\nsudo visudo -c                       # syntax check\nsudo -u deploy sudo -n systemctl restart app   # works\nsudo -u deploy sudo -n systemctl stop app      # refused\nsudo -u deploy sudo -l               # shows the allowed command",
      },
    ],
    faq: [
      { q: "What is the difference between being root and using sudo?", a: "Root is the all-powerful account itself. sudo lets a normal user run single commands as root, and every use is logged, so teams can see who did what." },
      { q: "Is chmod 777 ever okay?", a: "Almost never on a server. It lets every user and every compromised process change the file. Fix the owner or group instead." },
      { q: "What does the dot or plus after the mode in ls -l mean?", a: "A dot (-rw-r--r--.) means the file has an SELinux security label. A plus (-rw-r--r--+) means extra access rules (ACLs) are set; view them with getfacl." },
      { q: "How do I see permissions as numbers instead of letters?", a: "Run stat -c '%a %n' file. It prints something like 640 file." },
    ],
  },

  "linux/processes": {
    plain: [
      "A program is a file on disk. A process is that program while it is running, with its own memory, its own ID number (the PID) and a user it runs as. Run python3 app.py twice and you get two processes from one program, each unaware of the other.",
      "Processes form a family tree. Every process has a parent that started it, and the very first one, PID 1, is usually systemd. When your shell runs ls, the shell is the parent and ls is the child. If a parent dies, PID 1 adopts its orphans.",
      "Servers need some programs to run all the time: web servers, databases, your API. These long-running background processes are called services or daemons. systemd is the caretaker that starts them at boot, restarts them if they crash, and keeps their output in a central log.",
      "For DevOps work this matters every day. When a site is slow, you look for the process eating CPU. When a deploy fails, you read the service log. When you ship a new app to a plain VM, you write a small unit file so it survives reboots.",
    ],
    deepDive: [
      {
        heading: "Process states you will see in ps and top",
        body: "The STAT column in ps tells you what a process is doing. R means running or ready to run. S means sleeping, waiting for something like a network reply; most processes sit here. D means stuck waiting on disk or network storage and cannot be interrupted, which often points to a slow disk or a hung NFS mount. Z is a zombie: it has finished, but its parent has not yet collected its exit code.\n\nZombies use no CPU or memory, only a slot in the process table. A pile of them means the parent program has a bug; killing the parent clears them.",
        bullets: ["R: running", "S: sleeping (normal)", "D: waiting on I/O, can't be killed", "Z: zombie, parent hasn't collected it", "T: stopped, for example by Ctrl+Z"],
      },
      {
        heading: "Load average, explained",
        body: "uptime and top show three numbers like 0.80 1.20 2.50. They are the average number of processes running or waiting over the last 1, 5 and 15 minutes. On Linux the count also includes processes in state D, so heavy disk waits raise load even when the CPU is idle.\n\nCompare load with the number of CPU cores, which nproc prints. A load of 4 on a 4-core machine means it is fully busy. A load of 12 on that machine means work is queuing. Reading the three numbers left to right tells you if things are getting worse or calming down.",
      },
      {
        heading: "What makes a good systemd unit",
        body: "A unit file has three parts. [Unit] describes the service and its order: After=network-online.target waits for the network. [Service] says how to run it: User=, WorkingDirectory=, ExecStart= with an absolute path, and Environment= or EnvironmentFile= for settings. [Install] says when to start it at boot, usually WantedBy=multi-user.target.\n\nRestart=on-failure with RestartSec=5 brings a crashed app back after five seconds. systemd also stops restart loops: by default, more than 5 starts within 10 seconds marks the unit failed. When stopping, systemd sends SIGTERM and waits 90 seconds before SIGKILL; change that with TimeoutStopSec=.",
        bullets: ["Use absolute paths in ExecStart", "Keep secrets in EnvironmentFile with mode 600", "systemctl cat app shows the unit systemd actually loaded", "systemctl edit app creates a safe override file"],
        visual: {
          type: "tree",
          title: "The three parts of a unit file",
          root: "app.service",
          children: [
            { label: "[Unit]", children: ["Description=", "After=network-online.target"] },
            { label: "[Service]", children: ["User=, WorkingDirectory=", "ExecStart= (absolute path)", "EnvironmentFile=", "Restart=on-failure, RestartSec=5"] },
            { label: "[Install]", children: ["WantedBy=multi-user.target"] },
          ],
        },
      },
      {
        heading: "Getting more out of journalctl",
        body: "journald stores logs with metadata, so you can filter them precisely. journalctl -u app --since \"10 min ago\" shows recent lines for one service. -p err shows only errors and worse. -b shows logs since the last boot, and -b -1 the boot before that, which is gold after a crash. -o json-pretty reveals every field, including the PID and the exact unit.\n\nLogs can fill a disk too. journalctl --disk-usage shows the size, and SystemMaxUse=500M in /etc/systemd/journald.conf caps it. To keep logs across reboots, make sure /var/log/journal exists.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Life of a process",
        steps: [
          { label: "fork", detail: "Parent makes a copy of itself" },
          { label: "exec", detail: "The copy loads the new program" },
          { label: "Run and sleep", detail: "Works, waits for I/O, works again" },
          { label: "exit", detail: "Returns an exit code, 0 for success" },
          { label: "Reaped", detail: "Parent reads the code; PID is freed" },
        ],
      },
      {
        type: "sequence",
        title: "What happens on systemctl stop app",
        actors: ["You", "systemd", "app process"],
        messages: [
          { from: 0, to: 1, label: "systemctl stop app" },
          { from: 1, to: 2, label: "SIGTERM: please stop" },
          { from: 2, to: 1, label: "Finishes requests, exits 0" },
          { from: 1, to: 0, label: "Unit is inactive" },
          { from: 1, to: 2, label: "SIGKILL if still running after 90 s" },
        ],
      },
    ],
    examples: [
      {
        title: "Something is eating the CPU",
        explanation: "The server feels slow. Step 1: check load against cores with uptime and nproc. Step 2: list the top CPU users. Step 3: look at the parent and the full command so you know what it really is. Step 4: ask it to stop with SIGTERM and wait a few seconds. Step 5: only if it is still alive, use SIGKILL. If it belongs to a systemd service, use systemctl restart instead, so systemd stays in charge.",
        code: {
          lang: "bash",
          code: "uptime; nproc\nps -eo pid,ppid,user,%cpu,%mem,stat,cmd --sort=-%cpu | head -5\nps -o pid,cmd --ppid 1234           # children of 1234\nkill 4321                           # SIGTERM\nsleep 5; kill -0 4321 && kill -9 4321\nsystemctl status 4321               # which unit owns the PID?",
        },
      },
      {
        title: "Run a clean-up every night with a systemd timer",
        explanation: "Timers are systemd's replacement for cron. Step 1: write a oneshot service that runs your script once. Step 2: write a timer with the same name that says when. Persistent=true runs a missed job after the machine was off. Step 3: run systemctl daemon-reload, then systemctl enable --now cleanup.timer. Step 4: systemctl list-timers shows the next run, and journalctl -u cleanup shows each run's output.",
        code: {
          lang: "ini",
          code: "# /etc/systemd/system/cleanup.service\n[Service]\nType=oneshot\nExecStart=/usr/local/bin/cleanup.sh\n\n# /etc/systemd/system/cleanup.timer\n[Timer]\nOnCalendar=*-*-* 03:00:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target",
        },
      },
    ],
    cheatSheet: [
      "pstree -p shows the parent and child tree with PIDs",
      "ps -eo pid,stat,cmd | awk '$2 ~ /Z/' lists zombie processes",
      "Load average above the number of cores (nproc) means work is queuing",
      "systemctl list-units --failed shows every broken service",
      "systemctl cat app shows the unit file systemd actually loaded",
      "journalctl -u app -p err --since today shows only today's errors",
      "journalctl -b -1 shows logs from the previous boot, useful after a crash",
      "systemctl list-timers shows scheduled jobs and their next run",
    ],
    quiz: [
      {
        q: "A process shows state Z in ps. What does that mean?",
        options: ["It is using too much memory", "It is waiting for disk I/O", "It has exited but its parent has not collected its exit code", "It was paused with Ctrl+Z"],
        answer: 2,
        why: "A zombie is a finished process whose parent has not reaped it yet.",
      },
      {
        q: "An 8-core server has a load average of 2.0. What does that suggest?",
        options: ["It is badly overloaded", "It has plenty of spare capacity", "Exactly 2 processes exist", "The disk is full"],
        answer: 1,
        why: "About 2 runnable tasks on 8 cores means most cores are idle.",
      },
      {
        q: "By default, how long does systemd wait after SIGTERM before sending SIGKILL?",
        options: ["90 seconds", "5 seconds", "1 second", "It never sends SIGKILL"],
        answer: 0,
        why: "The default TimeoutStopSec is 90 seconds.",
      },
      {
        q: "Which command shows logs from the boot before the current one?",
        options: ["journalctl -f", "journalctl -u boot", "dmesg --old", "journalctl -b -1"],
        answer: 3,
        why: "-b selects a boot, and -1 means the previous one.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start sleep 300 in the background, find its PID and its parent PID, then stop it with SIGTERM and confirm it is gone.",
        hint: "$! holds the PID of the last background job; ps -o can print ppid.",
        solution: "sleep 300 &\nPID=$!\nps -o pid,ppid,stat,cmd -p \"$PID\"\nkill \"$PID\"\nsleep 1\nps -p \"$PID\" || echo \"gone\"",
      },
      {
        level: "medium",
        task: "Write a systemd unit for python3 -m http.server 8080 that runs as user nobody in /tmp, restarts on failure after 3 seconds, and starts at boot. Check that it runs.",
        hint: "You need [Unit], [Service] and [Install]; use the absolute path to python3.",
        solution: "# /etc/systemd/system/web.service\n[Unit]\nAfter=network.target\n[Service]\nUser=nobody\nWorkingDirectory=/tmp\nExecStart=/usr/bin/python3 -m http.server 8080\nRestart=on-failure\nRestartSec=3\n[Install]\nWantedBy=multi-user.target\n# sudo systemctl daemon-reload && sudo systemctl enable --now web; curl -I localhost:8080",
      },
      {
        level: "hard",
        task: "Prove that Restart=on-failure works and that systemd's restart limit kicks in. Kill the service from the previous task with SIGKILL several times quickly and explain what you see.",
        hint: "Watch systemctl status and the journal; StartLimitBurst defaults to 5 within 10 seconds.",
        solution: "for i in 1 2 3 4 5 6; do\n  sudo systemctl kill -s KILL web; sleep 0.5\ndone\nsystemctl status web     # likely 'failed' with start-limit-hit\njournalctl -u web -n 20  # shows each restart, then the limit\nsudo systemctl reset-failed web && sudo systemctl start web\n# RestartSec=3 means a kill every 0.5 s may not hit the limit;\n# lower RestartSec to 0 to see it quickly.",
      },
    ],
    faq: [
      { q: "What is the difference between a process and a thread?", a: "A process has its own memory space. Threads live inside one process and share its memory, so they are cheaper to create but can step on each other." },
      { q: "Should I use cron or systemd timers?", a: "Both work. Timers give you logs in journalctl, catch-up runs with Persistent=true and dependency control, so they are the better default on systemd machines." },
      { q: "Why does my service work when I run it by hand but fail under systemd?", a: "systemd runs it with a different user, working directory and a minimal environment, so your PATH and shell variables are missing. Use absolute paths and set Environment= or EnvironmentFile= in the unit." },
    ],
  },

  "linux/bash": {
    plain: [
      "A Bash script is a text file full of commands you would otherwise type by hand. Bash runs them top to bottom. If you have ever pasted the same five commands into a terminal twice, that is a script waiting to be written.",
      "Bash is a bit unusual because it changes your command before running it. It swaps $NAME for its value, expands *.log into a list of file names, and splits text on spaces. Most Bash bugs come from this hidden rewriting, which is why quoting matters so much.",
      "Scripts make decisions by looking at exit codes. Every command quietly reports a number when it ends: 0 means it worked, anything else means it failed. if, &&, || and set -e all read that number. Think of it as a thumbs up or thumbs down after every line.",
      "In DevOps, Bash is the glue for small jobs: setting up a server, wrapping a deploy, rotating backups, running steps in CI. When a script grows past about 100 lines or needs real data handling, that is usually the moment to switch to Python.",
    ],
    deepDive: [
      {
        heading: "What Bash does to a line before running it",
        body: "Bash processes each line in stages. First it expands braces, so {a,b}.txt becomes a.txt b.txt. Then it replaces ~ with your home folder, $VAR with its value, $(cmd) with the command's output and $((1+2)) with 3. Next comes word splitting: unquoted results are cut on spaces, tabs and newlines. Finally globbing turns *.log into matching file names.\n\nQuotes switch some stages off. Double quotes keep variables working but stop word splitting and globbing. Single quotes stop everything, so '$HOME' stays as the literal text $HOME.",
        bullets: ["\"$file\" stays one word, even with spaces in it", "'$HOME' is literal text", "set -x prints each line after expansion, great for debugging"],
      },
      {
        heading: "Tests: [ ], [[ ]] and (( ))",
        body: "[ ] is the old, portable test command and needs careful quoting. [[ ]] is Bash's improved version: it doesn't word-split variables, supports && and || inside, and can match patterns like [[ $f == *.log ]] or regular expressions with =~. (( )) is for arithmetic, so (( count > 5 )) reads naturally.\n\nUse [[ ]] in Bash scripts and [ ] only when the script must run under plain sh. Common checks: -f for a regular file, -d for a directory, -z for an empty string, -n for a non-empty one.",
      },
      {
        heading: "Cleaning up with trap",
        body: "Scripts often create temporary files or start background jobs. If the script fails halfway, those are left behind. trap runs a command when the script exits, for any reason, including errors under set -e and Ctrl+C.\n\nThe usual pattern is: create a temp folder with mktemp -d, then trap 'rm -rf \"$tmp\"' EXIT. Now the folder disappears whether the script succeeds or crashes. You can also trap ERR to print the line number that failed, which makes CI logs much easier to read.",
        bullets: ["tmp=$(mktemp -d); trap 'rm -rf \"$tmp\"' EXIT", "trap 'echo \"failed at line $LINENO\"' ERR", "Never build temp names by hand like /tmp/myfile"],
        visual: {
          type: "flow",
          title: "Cleanup that always runs",
          steps: [
            { label: "tmp=$(mktemp -d)", detail: "Safe, unique temp folder" },
            { label: "trap ... EXIT", detail: "Register the cleanup command" },
            { label: "Script does its work" },
            { label: "Script exits", detail: "Success, error under set -e, or Ctrl+C" },
            { label: "Trap runs", detail: "rm -rf \"$tmp\" removes the folder" },
          ],
        },
      },
      {
        heading: "Reading input safely",
        body: "for f in $(ls) breaks on file names with spaces. Prefer globs: for f in /var/log/*.log; do ...; done. To process command output line by line, use while IFS= read -r line; do ...; done < file. IFS= keeps leading spaces and -r keeps backslashes as they are.\n\nBe careful with pipes: in cmd | while read ...; the loop runs in a subshell, so variables set inside vanish afterwards. Feed the loop with process substitution instead: while read -r x; do ...; done < <(cmd). Finally, run shellcheck on every script; it catches most of these traps automatically.",
        visual: {
          type: "compare",
          title: "Where a while-read loop runs",
          columns: [
            { title: "cmd | while read -r x", points: ["Loop runs in a subshell", "Variables set inside vanish", "A counter reads 0 after the loop"] },
            { title: "while read -r x ... < <(cmd)", points: ["Loop runs in the current shell", "Variables keep their values", "A counter is correct after the loop"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How Bash rewrites one line",
        steps: [
          { label: "Brace expansion", detail: "{a,b}.txt becomes a.txt b.txt" },
          { label: "Tilde and variables", detail: "~ and $VAR get their values" },
          { label: "Command substitution", detail: "$(date +%F) becomes 2026-11-09" },
          { label: "Word splitting", detail: "Unquoted results are cut on spaces" },
          { label: "Globbing", detail: "*.log becomes matching file names" },
          { label: "Run", detail: "The final words become the command" },
        ],
      },
      {
        type: "compare",
        title: "Three kinds of test",
        columns: [
          { title: "[ ]", points: ["Works in any sh", "Quote every variable", "Use -a and -o carefully", "Example: [ -f \"$f\" ]"] },
          { title: "[[ ]]", points: ["Bash only", "No word splitting inside", "Patterns and =~ regex", "Example: [[ $f == *.log ]]"] },
          { title: "(( ))", points: ["Whole-number arithmetic", "Normal < > == signs", "Variables without $", "Example: (( n > 5 ))"] },
        ],
      },
    ],
    examples: [
      {
        title: "Delete logs older than 7 days, safely",
        explanation: "Goal: free disk space in a log folder passed as an argument. Step 1: strict mode, so errors stop the script. Step 2: refuse to run without a real directory. Step 3: list what would be deleted first, so a person can review it in dry-run mode. Step 4: delete only when DRY_RUN=0. Using find -print0 and xargs -0 keeps odd file names safe.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\ndir=\"${1:?usage: clean-logs.sh DIR}\"\n[[ -d \"$dir\" ]] || { echo \"not a directory: $dir\" >&2; exit 2; }\n\necho \"Old logs in $dir:\"\nfind \"$dir\" -name '*.log' -mtime +7 -print\n\nif [[ \"${DRY_RUN:-1}\" == 0 ]]; then\n  find \"$dir\" -name '*.log' -mtime +7 -print0 | xargs -0 -r rm -f\n  echo \"deleted\"\nelse\n  echo \"dry run; set DRY_RUN=0 to delete\"\nfi",
        },
      },
      {
        title: "Check the health of several servers",
        explanation: "Goal: call /health on each host and fail the script if any is down, so CI or cron can alert. Step 1: keep the hosts in an array. Step 2: loop and call curl with a short timeout; -f makes curl fail on HTTP errors. Step 3: count failures instead of stopping at the first one. Step 4: exit 1 if anything failed. Note we don't use set -e here, because we want to keep going after a failed host.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -uo pipefail\nhosts=(api1.example.com api2.example.com api3.example.com)\nfailed=0\nfor h in \"${hosts[@]}\"; do\n  if curl -fsS --max-time 5 \"https://$h/health\" >/dev/null; then\n    echo \"OK   $h\"\n  else\n    echo \"DOWN $h\"; failed=$((failed + 1))\n  fi\ndone\necho \"$failed host(s) down\"\n(( failed == 0 ))",
        },
      },
    ],
    cheatSheet: [
      "\"$var\" for values, '...' for literal text, \"${arr[@]}\" for every array item",
      "${VAR:-default} uses a default; ${VAR:?message} stops if VAR is unset",
      "bash -n script.sh checks syntax; bash -x script.sh traces each line",
      "shellcheck script.sh finds quoting bugs and common mistakes",
      "tmp=$(mktemp -d); trap 'rm -rf \"$tmp\"' EXIT cleans up on any exit",
      "while IFS= read -r line; do ...; done < file reads lines safely",
      "$? is the last exit code; $# is the number of arguments",
    ],
    quiz: [
      {
        q: "A variable file holds \"my report.txt\". What does rm $file (unquoted) try to delete?",
        options: ["The file my report.txt", "Two files: my and report.txt", "Nothing; it errors out", "Every .txt file"],
        answer: 1,
        why: "Without quotes, word splitting cuts the value on the space into two arguments.",
      },
      {
        q: "What does echo '$HOME' print?",
        options: ["Your home folder path", "An empty line", "An error", "The literal text $HOME"],
        answer: 3,
        why: "Single quotes turn off all expansion.",
      },
      {
        q: "Why does count stay 0 after: cat list | while read x; do count=$((count+1)); done?",
        options: ["The loop runs in a subshell because of the pipe", "read cannot count", "count must be declared with let", "cat removes newlines"],
        answer: 0,
        why: "Each side of a pipe runs in a subshell, so its variables vanish when it ends.",
      },
      {
        q: "Which line removes a temp folder even if the script fails halfway?",
        options: ["rm -rf \"$tmp\" at the last line", "set -e", "trap 'rm -rf \"$tmp\"' EXIT", "exit 0"],
        answer: 2,
        why: "An EXIT trap runs whenever the script ends, whether it succeeded or not.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write greet.sh that takes a name as the first argument, prints Hello, NAME, and exits with code 2 and a usage message if no name is given.",
        hint: "Check $# or use ${1:?...}.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nif [[ $# -lt 1 ]]; then\n  echo \"usage: greet.sh NAME\" >&2\n  exit 2\nfi\necho \"Hello, $1\"",
      },
      {
        level: "medium",
        task: "Write a script that counts how many lines in /var/log/syslog (or any log) contain ERROR, WARN and INFO, and prints the three counts.",
        hint: "Loop over the words and use grep -c; grep exits 1 when nothing matches.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nlog=\"${1:-/var/log/syslog}\"\nfor level in ERROR WARN INFO; do\n  n=$(grep -c \"$level\" \"$log\" || true)\n  printf '%-6s %s\\n' \"$level\" \"$n\"\ndone",
      },
      {
        level: "hard",
        task: "Write backup.sh SRC DEST that creates a dated tar.gz of SRC in DEST, keeps only the 5 newest backups, uses a temp file that is cleaned up on failure, and only moves the archive into place when tar succeeded.",
        hint: "Write to mktemp first, then mv. List old backups with ls -1t and tail -n +6.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nsrc=\"${1:?usage: backup.sh SRC DEST}\"; dest=\"${2:?usage: backup.sh SRC DEST}\"\nmkdir -p \"$dest\"\ntmp=$(mktemp \"$dest/.partial.XXXXXX\")\ntrap 'rm -f \"$tmp\"' EXIT\ntar -czf \"$tmp\" -C \"$(dirname \"$src\")\" \"$(basename \"$src\")\"\nmv \"$tmp\" \"$dest/backup-$(date +%F-%H%M%S).tar.gz\"\ncd \"$dest\"\nls -1t backup-*.tar.gz | tail -n +6 | xargs -r rm -f\necho \"backup ok\"",
      },
    ],
    faq: [
      { q: "Should I write #!/bin/bash or #!/usr/bin/env bash?", a: "#!/usr/bin/env bash finds bash wherever it is on the PATH, which works on more systems, including macOS with a newer Homebrew Bash. On standard Linux servers both work." },
      { q: "When should I switch from Bash to Python?", a: "Switch when you need data structures, JSON parsing, error handling with retries, or the script passes about 100 lines. Bash is best for short glue around other commands." },
      { q: "Why does my script work in my terminal but not in cron?", a: "cron uses a tiny PATH and no shell profile, so commands and variables you rely on are missing. Use absolute paths or set PATH at the top of the script." },
    ],
  },

  "linux/networking": {
    plain: [
      "A network is computers passing small packets of data to each other. Each machine has an IP address, like a street address, for example 10.0.1.25. Each program on that machine listens on a port, like an apartment number: web servers use 443, SSH uses 22, Postgres uses 5432.",
      "People remember names, computers need numbers. DNS is the phone book that turns api.example.com into an IP address. Your computer asks a DNS resolver, which looks the name up and remembers the answer for a while, so the next lookup is instant.",
      "Once your computer knows the IP, it opens a TCP connection, which is like a phone call: both sides agree to talk and every packet is checked and resent if lost. On top of that, TLS encrypts the call, and HTTP is the language spoken in it.",
      "When something breaks, the error message usually tells you which step failed. \"Could not resolve host\" is DNS. \"Connection refused\" means nothing listens on that port. A long hang ending in a timeout usually means a firewall is silently dropping packets. Learning to read these saves hours.",
    ],
    deepDive: [
      {
        heading: "How a DNS lookup really travels",
        body: "Your program first checks /etc/hosts, then asks the system resolver, which on many distros is systemd-resolved listening on 127.0.0.53. That forwards to a recursive resolver, such as your cloud's resolver or 1.1.1.1. If the recursive resolver has no cached answer, it asks a root server where .com lives, asks the .com servers where example.com lives, then asks example.com's own name servers for the final record.\n\nEvery answer has a TTL (time to live) in seconds, saying how long it may be cached. That is why a DNS change can take minutes or hours to reach everyone.",
        bullets: ["A record: name to IPv4 address", "AAAA: name to IPv6 address", "CNAME: name is an alias for another name", "dig +trace example.com shows every hop"],
      },
      {
        heading: "Refused, reset or timed out",
        body: "Errors tell you where to look. Connection refused means the machine answered but nothing is listening on that port: the app is down or bound to the wrong address. A timeout means no answer came back at all: a security group, firewall or wrong route is dropping packets. Connection reset means something accepted the connection and then cut it, often a proxy or a crashed app.\n\nA very common trap: an app listening on 127.0.0.1:8000 only accepts connections from the same machine. To be reachable from outside or from another container, it must listen on 0.0.0.0. ss -tlnp shows which address each port is bound to.",
      },
      {
        heading: "Subnets and CIDR without the headache",
        body: "An address like 10.0.1.0/24 describes a range. The /24 means the first 24 bits are the network part, leaving 8 bits for hosts, so 256 addresses from 10.0.1.0 to 10.0.1.255. Each step smaller in the number doubles the size: /23 is 512 addresses and /16 is 65,536.\n\nPrivate ranges that never appear on the public internet are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Cloud VPCs use them. AWS reserves 5 addresses in every subnet, so a /24 gives you 251 usable hosts there.",
        bullets: ["/32 = 1 address, /24 = 256, /16 = 65,536", "Hosts = 2 to the power of (32 minus the prefix)", "python3 -c \"import ipaddress as i; print(i.ip_network('10.0.1.0/24').num_addresses)\""],
        visual: {
          type: "layers",
          title: "Prefix length and range size",
          layers: [
            { label: "/16", detail: "65,536 addresses" },
            { label: "/23", detail: "512 addresses" },
            { label: "/24", detail: "256 addresses; 251 usable in an AWS subnet" },
            { label: "/32", detail: "One single address" },
          ],
        },
      },
      {
        heading: "SSH beyond logging in",
        body: "SSH is also a secure tunnel. Servers in private subnets are usually reached through a bastion (jump) host: ssh -J bastion.example.com app-01 hops through it in one command. A local port forward lets you reach a private service from your laptop: ssh -L 5433:db.internal:5432 bastion makes localhost:5433 on your laptop talk to the database.\n\nPut these in ~/.ssh/config with ProxyJump and LocalForward so you never retype them. ssh -v prints every step of the connection, which shows whether the problem is the network, the host key or your key.",
        visual: {
          type: "sequence",
          title: "ssh -L 5433:db.internal:5432 bastion",
          actors: ["App on laptop", "ssh client", "Bastion", "Database"],
          messages: [
            { from: 0, to: 1, label: "Connect to localhost:5433" },
            { from: 1, to: 2, label: "Carried inside the SSH tunnel" },
            { from: 2, to: 3, label: "TCP to db.internal:5432" },
            { from: 3, to: 2, label: "Query result" },
            { from: 2, to: 1, label: "Back through the tunnel" },
            { from: 1, to: 0, label: "Reply on localhost:5433" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Resolving api.example.com from scratch",
        actors: ["Your laptop", "Recursive resolver", "Root and .com servers", "example.com DNS"],
        messages: [
          { from: 0, to: 1, label: "Where is api.example.com?" },
          { from: 1, to: 2, label: "Who handles example.com?" },
          { from: 2, to: 1, label: "Ask ns1.example.com" },
          { from: 1, to: 3, label: "A record for api?" },
          { from: 3, to: 1, label: "203.0.113.10, TTL 300" },
          { from: 1, to: 0, label: "203.0.113.10 (cached 5 min)" },
        ],
      },
      {
        type: "compare",
        title: "Reading the error message",
        columns: [
          { title: "Could not resolve host", points: ["DNS failed", "Typo or missing record", "Check with dig", "Look at /etc/resolv.conf"] },
          { title: "Connection refused", points: ["Host answered fast", "Nothing on that port", "App down or on 127.0.0.1", "Check with ss -tlnp"] },
          { title: "Timed out", points: ["No answer at all", "Firewall or security group", "Wrong route or IP", "Check rules, then nc -vz"] },
        ],
      },
    ],
    examples: [
      {
        title: "\"The site is down\": debug it layer by layer",
        explanation: "Work from the bottom up and stop at the first failure. Step 1: does the name resolve? Step 2: is the port reachable? nc -vz tests a TCP connection without sending data. Step 3: does the service answer, and with what status? Step 4: on the server, is the app listening, and on which address? Each step either passes or tells you exactly which team or setting to check next.",
        code: {
          lang: "bash",
          code: "dig +short api.example.com                # 1. DNS\nnc -vz api.example.com 443                # 2. TCP port\ncurl -sS -o /dev/null -w '%{http_code} %{time_total}s\\n' https://api.example.com/health\n# 3. HTTP status and timing\n\n# 4. on the server itself\nss -tlnp | grep -E ':443|:8000'\ncurl -sS localhost:8000/health\nsudo journalctl -u app -n 50",
        },
      },
      {
        title: "Reach a private database through a bastion",
        explanation: "Your Postgres server sits in a private subnet with no public IP. Only the bastion can reach it. Step 1: describe both hosts in ~/.ssh/config. Step 2: open a tunnel with ssh -N db-tunnel (-N means no remote shell, just the tunnel). Step 3: in another terminal, connect to localhost:5433 as if the database were local. Close the tunnel with Ctrl+C when done.",
        code: {
          lang: "ssh-config",
          code: "Host bastion\n  HostName bastion.example.com\n  User ubuntu\n  IdentityFile ~/.ssh/id_ed25519\n\nHost db-tunnel\n  HostName bastion.example.com\n  User ubuntu\n  LocalForward 5433 db.internal:5432\n\n# terminal 1: ssh -N db-tunnel\n# terminal 2: psql -h localhost -p 5433 -U app appdb",
        },
      },
    ],
    cheatSheet: [
      "dig +trace name shows the whole DNS path; dig @1.1.1.1 name asks a specific resolver",
      "nc -vz host 443 tests whether a TCP port accepts connections",
      "curl -w '%{http_code} %{time_total}' prints status and total time",
      "Refused = nothing listening; timeout = something dropping packets",
      "Bind to 0.0.0.0 to accept outside traffic; 127.0.0.1 is local only",
      "Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16",
      "ssh -J bastion host jumps through a bastion; ssh -L 5433:db:5432 makes a tunnel",
      "ip addr shows your addresses; ip route shows where packets go",
    ],
    quiz: [
      {
        q: "curl to port 8000 fails instantly with \"Connection refused\". What is most likely?",
        options: ["DNS is broken", "A firewall is dropping packets", "Nothing is listening on port 8000 at that address", "The TLS certificate expired"],
        answer: 2,
        why: "Refused means the host answered and said no process listens on that port.",
      },
      {
        q: "How many addresses are in 10.0.0.0/22?",
        options: ["1,024", "256", "512", "4,096"],
        answer: 0,
        why: "32 minus 22 leaves 10 host bits, and 2 to the power 10 is 1,024.",
      },
      {
        q: "You changed a DNS record, but some users still reach the old IP. Why?",
        options: ["DNS changes need a server reboot", "Resolvers cached the old answer until its TTL runs out", "The A record is read-only", "Browsers ignore DNS"],
        answer: 1,
        why: "Cached answers stay valid for their TTL, so the change spreads gradually.",
      },
      {
        q: "Your app works with curl localhost:8000 on the server but not from your laptop. ss shows 127.0.0.1:8000. What should you change?",
        options: ["Open port 22", "Add an AAAA record", "Use HTTP/2", "Make the app listen on 0.0.0.0"],
        answer: 3,
        why: "127.0.0.1 only accepts connections from the same machine.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the IP address, TTL and name servers for a domain you use, using dig.",
        hint: "dig shows the TTL in the second column; use the NS record type for name servers.",
        solution: "dig example.com A            # ANSWER section: name, TTL, IN, A, IP\ndig +short example.com NS\ndig +noall +answer example.com",
      },
      {
        level: "medium",
        task: "Start a web server on port 8000 bound to 127.0.0.1, prove it is unreachable from another machine or container, then rebind it to 0.0.0.0 and prove it works.",
        hint: "python3 -m http.server has a --bind flag; ss -tlnp shows the bound address.",
        solution: "python3 -m http.server 8000 --bind 127.0.0.1 &\nss -tlnp | grep 8000            # 127.0.0.1:8000\n# from another host: curl http://SERVER_IP:8000  -> refused\nkill %1\npython3 -m http.server 8000 --bind 0.0.0.0 &\nss -tlnp | grep 8000            # 0.0.0.0:8000\n# from another host: curl http://SERVER_IP:8000  -> 200\n# still failing? check the firewall or security group",
      },
      {
        level: "hard",
        task: "Write a Python script check.py HOST PORT that reports which layer fails: DNS, TCP or neither, with a 3-second timeout.",
        hint: "socket.create_connection does the DNS lookup too; catch socket.gaierror before the general OSError.",
        solution: "import socket, sys\nhost, port = sys.argv[1], int(sys.argv[2])\ntry:\n    socket.create_connection((host, port), timeout=3).close()\nexcept socket.gaierror:\n    sys.exit(f\"DNS failed for {host}\")\nexcept ConnectionRefusedError:\n    sys.exit(f\"{host}:{port} refused: nothing listening\")\nexcept OSError:\n    sys.exit(f\"{host}:{port} timed out: firewall or route\")\nprint(f\"OK: {host}:{port} is open\")",
      },
    ],
    faq: [
      { q: "What is the difference between TCP and UDP?", a: "TCP sets up a connection and guarantees ordered, complete delivery, which suits web and database traffic. UDP just sends packets with no guarantee, which is faster and used for DNS, video calls and games." },
      { q: "Why does ping work but my website doesn't?", a: "ping uses ICMP, not TCP, and only proves the machine is reachable. The web port can still be blocked or have nothing listening on it." },
      { q: "Is it safe to use 8.8.8.8 or 1.1.1.1 as my DNS server?", a: "Yes, they are large public resolvers from Google and Cloudflare. Inside a cloud VPC, though, keep the provider's resolver so private names still resolve." },
    ],
  },
};

export default extra;
