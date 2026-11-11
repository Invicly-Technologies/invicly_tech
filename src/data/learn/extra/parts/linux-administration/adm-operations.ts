import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-operations/performance-monitoring": {
    plain: [
      "When someone says the server is slow, your first job is not to fix it. Your first job is to find out what it is short of. A computer has four main resources: the CPU (the brain), memory (RAM), the disks, and the network. Usually one of them is overloaded.",
      "Each tool answers one question. top shows which programs use the most CPU and memory right now. free shows how much memory is really available. vmstat shows, second by second, whether programs are waiting for the CPU or for the disk. iostat shows how busy each disk is.",
      "Linux uses spare memory to cache files, so free memory often looks low on a healthy server. That is normal and good. The number that matters is available, which includes cache the system can give back instantly.",
      "Once you know the bottleneck, the fix becomes clearer: stop or slow down a greedy process, add memory, move work to a faster disk, or apply a tuning profile with tuned-adm.",
    ],
    deepDive: [
      {
        heading: "Load average, explained properly",
        body: "uptime and top print three load averages for the last 1, 5 and 15 minutes. On Linux, load counts tasks that are running or waiting for a CPU, plus tasks stuck in uninterruptible sleep, which is usually waiting for disk or network storage. So load is not only CPU.\n\nCompare it with the number of CPUs from nproc. A load of 4 on a 4-core machine means the CPUs are fully used with no queue. A load of 12 on 4 cores means tasks are waiting. If load is high but CPU idle is also high, the waiting tasks are probably blocked on I/O, so check wa and iostat next. Read the three numbers as a trend: 9.0 5.0 2.0 means it is getting worse.",
        bullets: [
          "Load below the CPU count: no CPU queue",
          "High load with high wa: disk or NFS is the problem",
          "cat /proc/pressure/cpu shows how often tasks waited (PSI)",
        ],
      },
      {
        heading: "Reading the CPU line in top",
        body: "The %Cpu(s) line splits CPU time into states. us is user programs, sy is kernel work for them, ni is low-priority (niced) programs, and id is idle. wa is time the CPU was idle while waiting for I/O to finish. hi and si are hardware and software interrupts, often network traffic. st is steal: time a virtual machine wanted the CPU but the hypervisor gave it to another VM.\n\nHigh us points at an application. High sy points at many system calls or context switches. High st means the host is overcommitted, and nothing inside the VM will fix it. Press 1 in top to see each CPU, P to sort by CPU, M to sort by memory, and c to show full command lines.",
        visual: {
          type: "tree",
          title: "What each CPU state points to",
          root: "%Cpu(s) in top",
          children: [
            { label: "us / ni", children: ["Application code", "Profile or scale the app"] },
            { label: "sy", children: ["Kernel work, syscalls", "Too many small reads or forks"] },
            { label: "wa", children: ["Waiting for disk", "Check iostat -xz"] },
            { label: "hi / si", children: ["Interrupts", "Often heavy network traffic"] },
            { label: "st", children: ["Steal on a VM", "Host is overloaded"] },
          ],
        },
      },
      {
        heading: "Memory: free, swap and the OOM killer",
        body: "In free -h, used is memory held by programs, buff/cache is file cache, and available estimates how much new programs could get without swapping. When available stays low and vmstat shows non-zero si and so (swap in and swap out) every second, the server is short of memory, and everything slows down because the disk becomes part of memory.\n\nSome swap used with si and so at zero is fine: idle pages were moved out once. If memory runs out completely, the kernel's OOM killer ends a process to save the system. journalctl -k | grep -i 'out of memory' shows which process was killed. ps -eo pid,comm,rss --sort=-rss | head lists the biggest users by resident memory.",
      },
      {
        heading: "Disk I/O with vmstat and iostat",
        body: "In vmstat 1, the r column counts tasks waiting for a CPU and b counts tasks blocked, usually on I/O. bi and bo are blocks read and written per second. Always ignore the first line: it is an average since boot.\n\niostat -xz 1 (from the sysstat package) shows each disk. r_await and w_await are the average milliseconds per read and write, including queue time. aqu-sz is the average queue length. %util is the share of time the device was busy. On a single spinning disk, %util near 100 means saturated. On SSDs, NVMe and RAID, which handle many requests in parallel, 100% util can still have room, so trust await and the queue more.",
        bullets: [
          "await of a few ms on SSD is normal; hundreds of ms is trouble",
          "iotop or pidstat -d 1 shows which process does the I/O",
          "sar -d shows history if sysstat collection is enabled",
        ],
        visual: {
          type: "flow",
          title: "A 60-second triage",
          steps: [
            { label: "uptime and nproc", detail: "Load vs CPU count, rising or falling?" },
            { label: "top", detail: "CPU states and top processes" },
            { label: "free -h", detail: "Is available memory low?" },
            { label: "vmstat 1 5", detail: "r, b, si, so, wa over time" },
            { label: "iostat -xz 1 3", detail: "await and %util per disk" },
            { label: "Name the bottleneck", detail: "Then find the process behind it" },
          ],
        },
      },
      {
        heading: "Priorities and tuned profiles",
        body: "Two knobs change how resources are shared. nice sets CPU priority from -20 (most favoured) to 19 (least). Start a batch job with nice -n 10 tar ..., or lower a running one with renice -n 10 -p PID. Only root can raise priority. ionice -c3 makes a process use the disk only when nobody else needs it.\n\ntuned applies whole sets of kernel settings. tuned-adm list shows profiles, tuned-adm recommend suggests one for this hardware, and tuned-adm profile NAME applies it and keeps it after reboot. virtual-guest suits VMs, throughput-performance suits busy servers, latency-performance favours fast response, and balanced is a general default. Setting a tuned profile is an RHCSA objective.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Tools and what they are best at",
        columns: [
          { title: "top / htop", points: ["Live view of processes", "CPU states and load", "Sort by CPU or memory", "Snapshot, not history"] },
          { title: "vmstat / free", points: ["System-wide numbers", "Run queue and blocked tasks", "Swap activity si and so", "Good for spotting trends"] },
          { title: "iostat / sar", points: ["Per-disk latency and queue", "From the sysstat package", "sar keeps history", "Answers: was it slow last night?"] },
        ],
      },
    ],
    examples: [
      {
        title: "High load but idle CPUs",
        explanation: "A 4-core VM shows load 14 but users say the web app is only slow, not dead. Step 1: top shows id at 70% and wa at 25%, so the CPUs are mostly waiting. Step 2: vmstat shows b around 10, many blocked tasks. Step 3: iostat shows sdb with w_await of 400 ms. Step 4: pidstat -d finds a backup job writing heavily to sdb. Fix: lower its I/O priority now, and move the backup to a quieter time.",
        code: {
          lang: "bash",
          code: "uptime; nproc\ntop -b -n 1 | sed -n 3p        # %Cpu(s) line\nvmstat 1 5                       # watch b and wa\niostat -xz 1 3                   # find the slow disk\npidstat -d 1 5                   # which process writes\nsudo ionice -c3 -p 4321          # idle I/O class for the backup\nsudo renice -n 15 -p 4321",
        },
      },
      {
        title: "Is it really out of memory?",
        explanation: "free -h shows only 300 MB free on a 16 GB server, and someone wants to add RAM. Step 1: look at available, not free; it shows 9 GB, because most memory is file cache. Step 2: vmstat shows si and so at 0, so nothing is swapping. Step 3: the server is fine on memory; the slowness is elsewhere. If available had been near zero with steady swapping, the next step would be finding the biggest process by RSS.",
        code: {
          lang: "bash",
          code: "free -h\n#        total  used  free  shared  buff/cache  available\n# Mem:    15Gi  6.1Gi 300Mi  200Mi      9.2Gi       9.0Gi\nvmstat 1 5        # si and so should be 0\nps -eo pid,comm,rss --sort=-rss | head -5\njournalctl -k --since today | grep -i 'out of memory'",
        },
      },
    ],
    cheatSheet: [
      "Compare load average with nproc; the 1/5/15 trend matters more than one value",
      "top keys: 1 per CPU, P sort by CPU, M sort by memory, c full command",
      "free -h: read the available column, not free",
      "vmstat 1 5: skip line one; watch r, b, si, so and wa",
      "iostat -xz 1: r_await, w_await and aqu-sz show disk trouble",
      "ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head lists top consumers",
      "nice -n 10 CMD starts low priority; renice -n 10 -p PID changes it",
      "tuned-adm recommend, tuned-adm profile virtual-guest, tuned-adm active",
    ],
    quiz: [
      {
        q: "An 8-core server has load averages 3.1 2.9 3.0. What does that suggest?",
        options: ["Severe CPU overload", "The CPUs are not saturated", "The disk has failed", "Memory is full"],
        answer: 1,
        why: "A load well below the number of CPUs means tasks are not queuing for CPU.",
      },
      {
        q: "In top, which value means the hypervisor is giving your VM's CPU time to others?",
        options: ["wa", "ni", "si", "st"],
        answer: 3,
        why: "st (steal) is time the VM wanted to run but the host ran something else.",
      },
      {
        q: "Which sign shows a real memory shortage?",
        options: ["Low available and steady non-zero si and so in vmstat", "Low free with large buff/cache", "Some swap used with si and so at zero", "High us in top"],
        answer: 0,
        why: "Constant swapping with little available memory means programs do not fit in RAM.",
      },
      {
        q: "Why should you ignore the first line of vmstat 1?",
        options: ["It is a header only", "It shows the previous run", "It is an average since boot", "It is always zero"],
        answer: 2,
        why: "Only the following lines show live per-interval values.",
      },
      {
        q: "Which command makes a tuning profile active and keeps it after reboot?",
        options: ["sysctl -p virtual-guest", "tuned-adm profile virtual-guest", "systemctl enable virtual-guest", "nice -n -5 tuned"],
        answer: 1,
        why: "tuned-adm profile applies the profile and tuned remembers it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the 5 processes using the most memory and the 5 using the most CPU.",
        hint: "ps has --sort with a minus for descending order.",
        solution: "ps -eo pid,user,comm,%mem,rss --sort=-%mem | head -6\nps -eo pid,user,comm,%cpu --sort=-%cpu | head -6\n# note: ps %cpu is an average over the process lifetime; use top for right now",
      },
      {
        level: "medium",
        task: "Create CPU load on purpose and watch it in vmstat and top, then end it.",
        hint: "A busy loop in the shell uses one core; start one per core with &.",
        solution: "for i in $(seq \"$(nproc)\"); do ( while :; do :; done ) & done\nvmstat 1 5        # r near nproc, us near 100\ntop -b -n 1 | head -15\nuptime            # 1-minute load rising\nkill $(jobs -p)",
      },
      {
        level: "hard",
        task: "Show the recommended tuned profile, switch to it, and confirm. Then start a long tar job at the lowest CPU and I/O priority.",
        hint: "tuned-adm recommend prints a name you can pass to tuned-adm profile.",
        solution: "sudo dnf install -y tuned && sudo systemctl enable --now tuned\nrec=$(tuned-adm recommend)\nsudo tuned-adm profile \"$rec\"\ntuned-adm active\nnice -n 19 ionice -c3 tar czf /tmp/usr.tgz /usr/share &\nps -o pid,ni,comm -p $!",
      },
    ],
    faq: [
      { q: "What is a good load average?", a: "It depends on the CPU count. As a rule of thumb, load at or below nproc is fine; well above it means tasks are queuing, for CPU or for I/O." },
      { q: "Why does Linux show almost no free memory?", a: "It uses spare RAM as file cache to speed things up and gives it back when programs need it. Look at the available column instead." },
      { q: "Is using swap bad?", a: "A little swap used is normal. Constant swapping in and out, seen as non-zero si and so in vmstat, is the real problem." },
      { q: "Where do I get iostat and sar?", a: "Both come from the sysstat package: dnf install sysstat or apt install sysstat. Enable the sysstat service so sar collects history." },
    ],
  },

  "adm-operations/troubleshooting-method": {
    plain: [
      "When something breaks, it is tempting to try random fixes: restart this, reboot that. Sometimes it works, but you learn nothing, and the problem comes back. A method is a set of steps you follow every time, so you move from what you see to why it happened.",
      "Start by describing the problem exactly. Not \"the site is broken\" but \"the login page returns error 502 for all users since 14:10\". Then ask the most useful question in IT: what changed? An update, a config edit, a new deploy, a full disk.",
      "Next, collect evidence before you change anything: service status, logs, disk space, memory, network. Pick the most likely cause, test it with the smallest possible change, and see if the symptom goes away.",
      "When it works again, write down what happened and why. That note helps the next person, maybe you in six months, and it shows how to stop the problem from happening again.",
    ],
    deepDive: [
      {
        heading: "Define the symptom and find what changed",
        body: "A good problem statement answers: what exactly fails, for whom, since when, and how often. Who is affected tells you a lot: everyone means the server or network, one user means their account or client. A clear start time lets you look for changes just before it.\n\nUseful sources of change: dnf history and rpm -qa --last for packages, journalctl --since '14:00' --until '14:15' for everything logged in that window, last reboot for restarts, ls -lt /etc | head for recently edited configs, and your deploy or config history. Many incidents are caused by a change made in the hour before, often by the same team.",
        bullets: [
          "dnf history list | head shows recent package transactions",
          "journalctl -p err -b shows errors since this boot",
          "find /etc -mmin -60 -type f lists configs changed in the last hour",
        ],
      },
      {
        heading: "Check resources with the USE idea",
        body: "For each resource (CPU, memory, disk, network), ask three questions: how busy is it (utilization), is work waiting for it (saturation), and are there errors? This short checklist, known as the USE method, stops you from missing the obvious.\n\nIn practice: uptime and top for CPU, free -h and the kernel log for memory and OOM kills, df -h, df -i and iostat for disks, and ip -s link for network errors and drops. Do not forget limits that are not hardware: too many open files (ulimit -n, errors like Too many open files), a full connection table, or a service that hit its systemd restart limit and gave up.",
      },
      {
        heading: "Test the network from the bottom up",
        body: "Network problems are easiest to find layer by layer, starting at the bottom. Is the link up (ip link)? Does the host have the right address (ip addr)? Is there a route to the target (ip route get 10.0.5.20)? Can you reach the gateway (ping)? Does the name resolve (getent hosts db01, or dig db01)? Is the port open on the server (ss -tlnp on the server, nc -zv db01 5432 from the client)? Does the application answer (curl -v)?\n\nThe first layer that fails is where to dig. If DNS fails, check /etc/resolv.conf and resolvectl status. If the port is listening but a remote client cannot connect, suspect the firewall (firewall-cmd --list-all) or, on RHEL, an SELinux port label.",
        visual: {
          type: "layers",
          title: "Network checks, top to bottom",
          layers: [
            { label: "Application", detail: "curl -v http://host:8080/health" },
            { label: "Port and firewall", detail: "ss -tlnp, nc -zv, firewall-cmd --list-all" },
            { label: "Name resolution", detail: "getent hosts, dig, resolvectl status" },
            { label: "Routing", detail: "ip route get, ping the gateway" },
            { label: "Address", detail: "ip addr: right IP and prefix?" },
            { label: "Link", detail: "ip link: state UP, cable or vNIC" },
          ],
        },
      },
      {
        heading: "Full disks, hidden space and inodes",
        body: "A full disk makes services fail in odd ways: databases refuse writes, logins hang, logs stop. df -h finds the full filesystem, and sudo du -xh --max-depth=1 /var | sort -h finds the big folder level by level. If df and du disagree, a deleted file is still open; sudo lsof +L1 finds it, and restarting that process frees the space.\n\nIf df -h shows space but you still get No space left on device, check df -i. Inode exhaustion comes from millions of tiny files, such as session files or a mail queue. Find the folder with the most files and clean it. Also know that ext4 keeps 5% of blocks for root by default, so a normal user may see a full disk before root does. To shrink the journal, use journalctl --vacuum-size=500M.",
        bullets: [
          "sudo lsof +L1 lists deleted files still held open",
          "sudo find /var -xdev -type f | cut -d/ -f1-4 | sort | uniq -c | sort -n | tail counts files per folder",
          "journalctl --disk-usage shows how much the journal uses",
        ],
      },
      {
        heading: "Write down the root cause",
        body: "The symptom was a 502; the trigger was a full disk; the root cause was a log file with no rotation. Asking why several times, often called the five whys, moves you from the first answer to the one worth fixing.\n\nA short postmortem has: a timeline with times, the impact (who was affected and for how long), the root cause, what fixed it, and follow-up actions with owners, such as adding logrotate and a disk alert. Keep it blameless: describe what the system allowed, not who made a mistake, so people share the full story. Over time these notes become your team's best runbook.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where to look first, by symptom",
        root: "Symptom",
        children: [
          { label: "Service will not start", children: ["systemctl status", "journalctl -xeu NAME", "Config syntax test"] },
          { label: "Permission denied", children: ["ls -l and namei -l path", "SELinux: ausearch -m AVC", "Running as which user?"] },
          { label: "Cannot connect", children: ["ss -tlnp on the server", "Firewall rules", "DNS and routes"] },
          { label: "Slow", children: ["Load vs nproc", "free -h and vmstat", "iostat -xz"] },
          { label: "No space left", children: ["df -h and df -i", "du -xh, lsof +L1"] },
        ],
      },
    ],
    examples: [
      {
        title: "Website down after a weekend",
        explanation: "Monday morning, the site returns 503. Step 1, symptom: all users, since Sunday 03:12 from the monitoring. Step 2, changes: dnf history shows nothing, but journalctl around 03:12 shows the database stopped. Step 3, evidence: systemctl status mariadb says failed; the log says No space left on device. Step 4: df -h shows /var at 100%; du points to a 40 GB slow-query log. Step 5: truncate it, start mariadb, confirm the site works. Step 6: write it down and add log rotation plus a disk alert.",
        code: {
          lang: "bash",
          code: "systemctl --failed\njournalctl --since 'sun 03:00' --until 'sun 03:30' -p warning\nsudo journalctl -u mariadb -n 20\ndf -h /var\nsudo du -xh --max-depth=2 /var | sort -h | tail -5\nsudo truncate -s 0 /var/lib/mysql/slow.log\nsudo systemctl start mariadb && curl -sI http://localhost/ | head -1",
        },
      },
      {
        title: "The app cannot reach the database",
        explanation: "The app logs connection refused to db01:5432. Work bottom-up from the app server. Step 1: the name resolves to the right IP. Step 2: the route and a ping work. Step 3: nc to port 5432 is refused, so the network is fine and something is wrong at the server. Step 4: on db01, ss shows PostgreSQL listening only on 127.0.0.1. Root cause: listen_addresses was reset by a config change. Fix it, restart, and retest from the app server.",
        code: {
          lang: "bash",
          code: "getent hosts db01\nip route get 10.0.5.20 && ping -c 2 db01\nnc -zv db01 5432               # Connection refused\n# on db01:\nsudo ss -tlnp | grep 5432      # 127.0.0.1:5432 only\nsudo -u postgres psql -c 'SHOW listen_addresses;'\n# set listen_addresses = '*' in postgresql.conf, then:\nsudo systemctl restart postgresql\nnc -zv db01 5432               # succeeded",
        },
      },
    ],
    cheatSheet: [
      "Ask first: what exactly fails, for whom, since when, and what changed?",
      "systemctl --failed, then journalctl -xeu NAME for the failing unit",
      "journalctl --since '14:00' --until '14:15' shows everything in a time window",
      "Network bottom-up: ip link, ip addr, ip route get, getent hosts, ss -tlnp, curl -v",
      "df -h and df -i: space and inodes are separate limits",
      "lsof +L1 finds deleted files that still hold disk space",
      "Change one thing at a time and note each change with the time",
      "Postmortem: timeline, impact, root cause, fix, follow-up actions",
    ],
    quiz: [
      {
        q: "Only one user cannot log in; everyone else is fine. Where should you look first?",
        options: ["The network switch", "That user's account, password, groups or client", "Disk space on /", "The kernel version"],
        answer: 1,
        why: "Narrow scope points to something specific to that user, not the shared system.",
      },
      {
        q: "nc -zv db01 5432 from the app server says Connection refused. What does that tell you?",
        options: ["DNS is broken", "There is no route to db01", "The host answered, but nothing accepts connections on that port", "The firewall silently drops packets"],
        answer: 2,
        why: "A refusal is an active reply, so name, route and host are fine; the port has no listener.",
      },
      {
        q: "df says 100% used, but du only finds half of that. What is the likely cause?",
        options: ["A deleted file still held open by a process", "Inode exhaustion", "The filesystem is read-only", "du cannot read /proc"],
        answer: 0,
        why: "Space is freed only when the last process closes the file; lsof +L1 shows it.",
      },
      {
        q: "Why change only one thing at a time?",
        options: ["It is faster", "Logs can only record one change", "systemd allows only one change per minute", "So you know which change fixed or broke it"],
        answer: 3,
        why: "Several changes at once hide the real cause and can add new problems.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List all failed units and show the last 20 log lines with explanations for one of them.",
        hint: "systemctl has a --failed option; journalctl -x adds explanations.",
        solution: "systemctl --failed\nsudo journalctl -xeu NAME.service -n 20 --no-pager\nsystemctl status NAME.service --no-pager",
      },
      {
        level: "medium",
        task: "Find which folder under /var holds the most files, as you would for inode exhaustion.",
        hint: "Count files per path prefix with find, cut, sort and uniq.",
        solution: "df -i /var\nsudo find /var -xdev -type f | cut -d/ -f1-4 | sort | uniq -c | sort -n | tail -5\n# e.g. 1840022 /var/lib/php/sessions\n# then look one level deeper in the winner",
      },
      {
        level: "hard",
        task: "Break name resolution on a test VM on purpose, then diagnose it from scratch using the bottom-up order and write a three-line root cause note.",
        hint: "Point the resolver at an address with no DNS server, then check each layer.",
        solution: "# break it (Ubuntu with systemd-resolved):\nsudo resolvectl dns eth0 192.0.2.53\n# diagnose:\nip addr; ip route get 1.1.1.1; ping -c1 1.1.1.1   # works\ngetent hosts example.com                          # fails\nresolvectl status eth0                            # wrong DNS server\n# fix: sudo resolvectl revert eth0\n# note: Symptom: names fail, IPs work. Cause: wrong DNS server on eth0. Fix: revert, add check.",
      },
    ],
    faq: [
      { q: "What should I check first when a Linux service fails?", a: "Run systemctl status NAME and journalctl -xeu NAME. The last lines of the log usually say exactly why it stopped, such as a bad config line, a missing file or a busy port." },
      { q: "What is the difference between a symptom and a root cause?", a: "The symptom is what users see, such as an error page. The root cause is the underlying reason that, once fixed, stops the problem from coming back." },
      { q: "Why does my disk say full when there is space left?", a: "Either you are out of inodes (check df -i) or a deleted file is still open (check lsof +L1). On ext4, normal users also cannot use the last 5% reserved for root." },
      { q: "What is a blameless postmortem?", a: "A write-up of an incident that focuses on how the system allowed the failure, not on who made a mistake. People share more details when they are not afraid of blame." },
    ],
  },

  "adm-operations/backups-archives": {
    plain: [
      "A backup is a copy of your data stored somewhere else, so you can get it back after a mistake, a broken disk or an attack. It sounds simple, but most people only find out their backups are broken on the day they need them.",
      "tar packs many files and folders into one archive file, keeping owners, permissions and dates. It can also compress the archive to save space. It is great for a snapshot of a folder, like all of /etc before a big change.",
      "rsync copies folders from one place to another, even to another server over SSH. The first copy takes a while, but after that rsync only sends what changed. That makes it perfect for nightly backups.",
      "A popular rule says: keep 3 copies of your data, on 2 different types of storage, with 1 copy off-site. And a backup only counts once you have restored from it and checked the result.",
    ],
    deepDive: [
      {
        heading: "tar options that matter",
        body: "tar has three main modes: c create, x extract and t list. f names the archive file and must come right before the file name. Compression is one letter: z for gzip (.tar.gz), j for bzip2 (.tar.bz2), J for xz (.tar.xz), or --zstd for zstd on newer systems. gzip is fast; xz is smaller but much slower; zstd is both fast and small.\n\ntar removes the leading / from paths, so tar czf etc.tgz /etc stores etc/... and extracting it in /tmp/restore creates /tmp/restore/etc. Use -C DIR to choose where to extract. On RHEL, add --xattrs --acls --selinux so ACLs and SELinux labels survive. --exclude='*.log' skips files, and tar xzf archive.tgz etc/hosts extracts one file only.",
        bullets: [
          "tar tvf archive.tar.gz lists contents with owners and sizes",
          "tar df archive.tar -C / compares an archive with the disk",
          "gzip -t file.tar.gz tests the compressed file for damage",
        ],
      },
      {
        heading: "How rsync decides what to copy",
        body: "By default rsync compares each file's size and modification time on both sides. If they match, the file is skipped. If not, it sends only the changed blocks, using a rolling checksum. That is why the second run of a big backup can take seconds.\n\n-a (archive) is shorthand for -rlptgoD: recursive, keep links, permissions, times, group, owner and device files. It does not include hard links, ACLs or extended attributes; add -H, -A and -X for a full copy. --delete removes files from the target that no longer exist in the source, making a true mirror. -c forces full checksums when times cannot be trusted, but it is much slower. Always try a new command with -n (dry run) and -v first.",
        visual: {
          type: "flow",
          title: "rsync -a --delete src/ host:dst/",
          steps: [
            { label: "Connect over SSH", detail: "Starts rsync on the other side" },
            { label: "Build file lists", detail: "Both sides list names, sizes, times" },
            { label: "Skip unchanged", detail: "Same size and time: nothing sent" },
            { label: "Send differences", detail: "Only changed blocks of changed files" },
            { label: "Delete extras", detail: "--delete removes files gone from src" },
          ],
        },
      },
      {
        heading: "Snapshot-style backups with --link-dest",
        body: "A plain mirror has a weakness: if a file is deleted or encrypted by ransomware today, tonight's sync copies that damage over the backup. You want several points in time, without storing everything many times.\n\nrsync --link-dest solves this. Each night you create a new dated folder, and for files that did not change, rsync makes a hard link to the copy in yesterday's folder instead of copying it again. Every folder looks like a full backup, but unchanged files take no extra space. To delete an old day, just remove its folder; files still used by other days stay. Tools like rsnapshot automate this idea.",
        bullets: [
          "rsync -a --delete --link-dest=../2026-11-09 /srv/ 2026-11-10/",
          "Hard links only work within one filesystem on the backup side",
          "du -sh across folders counts shared files only once",
        ],
      },
      {
        heading: "RPO, RTO and the 3-2-1 rule",
        body: "Two numbers describe what a backup plan must achieve. RPO (recovery point objective) is how much data you can afford to lose: nightly backups mean up to 24 hours. RTO (recovery time objective) is how long a restore may take. A plan with only off-site tape might meet the RPO but miss a four-hour RTO.\n\nThe 3-2-1 rule protects against different failures: 3 copies so one loss is not fatal, 2 kinds of storage so one hardware fault does not hit both, and 1 off-site copy against fire or theft. Many teams add one offline or immutable copy that an attacker with admin access cannot delete. A RAID array or a snapshot on the same disk is not a backup.",
      },
      {
        heading: "Databases and restore tests",
        body: "Copying the files of a running database with tar or rsync often gives a broken backup, because the files change during the copy. Use the database's own tool, such as pg_dump or mysqldump, or stop the service or take a filesystem snapshot first.\n\nTest restores on a schedule, not just once. Restore into a temporary folder or a test VM, then compare: diff -r for folders, sha256sum for files, and for a database, start it and run a few queries. Time the restore to check your RTO. Write the restore steps down, because the person restoring at 3 a.m. may not be the person who set up the backup.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What each layer protects against",
        layers: [
          { label: "RAID or mirrored disks", detail: "A single disk failing; not deletion" },
          { label: "Local snapshots", detail: "Quick undo of mistakes; same hardware" },
          { label: "Backup on another server", detail: "Server loss; rsync over SSH" },
          { label: "Off-site copy", detail: "Fire, theft, site outage" },
          { label: "Offline or immutable copy", detail: "Ransomware and admin mistakes" },
        ],
      },
    ],
    examples: [
      {
        title: "Nightly snapshot backups to another server",
        explanation: "You want a backup of /srv every night on backup01, with 14 days of history. Step 1: compute today's and yesterday's folder names. Step 2: rsync /srv into today's folder, hard-linking unchanged files to yesterday's. On the very first night yesterday's folder does not exist; rsync prints a warning and makes a full copy. Step 3: on the backup server, keep the 14 newest dated folders and delete the rest; the names sort by date, so this is safe. Run it from a systemd timer as a user with an SSH key.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\ndest=backup01:/backups/web01\ntoday=$(date +%F)\nyday=$(date -d yesterday +%F)\nrsync -aHAX --delete --numeric-ids \\\n  --link-dest=\"../$yday\" /srv/ \"$dest/$today/\"\nssh backup01 'ls -1d /backups/web01/20* | head -n -14 | xargs -r rm -rf'   # keep the 14 newest\nlogger -t backup \"web01 /srv saved to $today\"",
        },
      },
      {
        title: "Prove an /etc archive restores correctly",
        explanation: "Before a big change you saved /etc with tar. Now prove the archive is usable. Step 1: test the compressed file. Step 2: extract it into an empty folder, never over the live /etc. Step 3: compare the extracted tree with the real one; only files changed since the backup should differ. Step 4: restore a single file if needed, with its owner and mode kept.",
        code: {
          lang: "bash",
          code: "sudo tar --xattrs --acls --selinux -czf /backup/etc-$(date +%F).tgz /etc\ngzip -t /backup/etc-2026-11-10.tgz && echo archive ok\nsudo mkdir -p /tmp/restore\nsudo tar -xzf /backup/etc-2026-11-10.tgz -C /tmp/restore\nsudo diff -r /etc /tmp/restore/etc | head\n# restore one file in place:\nsudo tar -xzf /backup/etc-2026-11-10.tgz -C / etc/ssh/sshd_config",
        },
      },
    ],
    cheatSheet: [
      "tar czf a.tgz dir (gzip), cjf (bzip2), cJf (xz), --zstd -cf (zstd)",
      "tar tzf lists, tar xzf a.tgz -C /tmp/restore extracts somewhere safe",
      "On RHEL add --xattrs --acls --selinux to keep ACLs and labels",
      "rsync -a = -rlptgoD; add -H -A -X for hard links, ACLs and xattrs",
      "src/ copies the contents; src copies the folder itself",
      "Always run rsync --delete with -n first and read the output",
      "--link-dest=../yesterday gives daily snapshots that share unchanged files",
      "3-2-1: three copies, two media, one off-site, and test restores",
    ],
    quiz: [
      {
        q: "Which command creates an xz-compressed archive of /home?",
        options: ["tar czf home.tar.xz /home", "tar xJf home.tar.xz /home", "tar cjf home.tar.xz /home", "tar cJf home.tar.xz /home"],
        answer: 3,
        why: "c creates, capital J selects xz, and f names the file.",
      },
      {
        q: "What does rsync -a NOT preserve by default?",
        options: ["Permissions", "Modification times", "Hard links, ACLs and extended attributes", "Symbolic links"],
        answer: 2,
        why: "-a is -rlptgoD; add -H, -A and -X for those.",
      },
      {
        q: "Why is a nightly rsync --delete mirror alone a weak backup?",
        options: ["Deletions and damage in the source are copied over the only backup", "rsync cannot copy large files", "It does not work over SSH", "It always copies everything again"],
        answer: 0,
        why: "Without history, last night's mistake replaces your only good copy.",
      },
      {
        q: "What does RPO describe?",
        options: ["How long a restore may take", "How much data you can afford to lose", "How many copies you keep", "How fast the backup runs"],
        answer: 1,
        why: "RPO is the recovery point: nightly backups mean up to a day of lost data.",
      },
      {
        q: "You run tar czf etc.tgz /etc and extract it in /tmp/r. Where do the files end up?",
        options: ["/etc, overwriting the live files", "/tmp/r/etc", "/tmp/r directly, without the etc folder", "The current folder"],
        answer: 1,
        why: "tar strips the leading slash, so paths are stored as etc/... and land under /tmp/r.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a gzip archive of /etc/ssh, list its contents, and extract it into /tmp/sshcopy.",
        hint: "Use c, t and x with z and f, and -C for the target folder.",
        solution: "sudo tar czf /tmp/ssh.tgz /etc/ssh\ntar tzf /tmp/ssh.tgz | head\nmkdir -p /tmp/sshcopy\nsudo tar xzf /tmp/ssh.tgz -C /tmp/sshcopy\nls /tmp/sshcopy/etc/ssh",
      },
      {
        level: "medium",
        task: "Mirror ~/projects to a remote host, preview the changes first, then run it for real. Delete a local file and show that the mirror removes it too.",
        hint: "Mind the trailing slash, and use -n for the preview.",
        solution: "rsync -avn --delete ~/projects/ backup01:/backups/projects/\nrsync -av --delete ~/projects/ backup01:/backups/projects/\nrm ~/projects/old-notes.txt\nrsync -avn --delete ~/projects/ backup01:/backups/projects/\n# shows: deleting old-notes.txt\nrsync -av --delete ~/projects/ backup01:/backups/projects/",
      },
      {
        level: "hard",
        task: "Make two snapshot backups of a folder with --link-dest and prove that an unchanged file is stored only once.",
        hint: "Hard-linked files share an inode number; ls -i shows it.",
        solution: "mkdir -p /tmp/src /tmp/snap && echo data > /tmp/src/a.txt\nrsync -a /tmp/src/ /tmp/snap/day1/\necho new > /tmp/src/b.txt\nrsync -a --link-dest=../day1 /tmp/src/ /tmp/snap/day2/\nls -i /tmp/snap/day1/a.txt /tmp/snap/day2/a.txt   # same inode\nstat -c '%h %n' /tmp/snap/day2/a.txt              # link count 2\ndu -sh /tmp/snap/day1 /tmp/snap/day2",
      },
    ],
    faq: [
      { q: "Is RAID a backup?", a: "No. RAID keeps a server running when a disk fails, but a deleted or encrypted file is gone on every disk at once. You still need copies elsewhere." },
      { q: "Which compression should I use with tar?", a: "gzip is the safe, fast default. xz makes smaller files but is slow to create. zstd, where available, is fast and compresses well." },
      { q: "Should the rsync source have a trailing slash?", a: "With a slash, rsync copies the folder's contents into the target. Without it, it creates the folder itself inside the target. Pick one style and always dry-run first." },
      { q: "How often should I test restores?", a: "On a regular schedule, such as monthly for important systems, and after any change to the backup setup. Time the restore so you know whether you meet your RTO." },
    ],
  },

  "adm-operations/podman-containers": {
    plain: [
      "A container packs an application with everything it needs, such as libraries and config, into one bundle. It runs the same on your laptop and on the server. It is not a full virtual machine: all containers share the host's kernel, so they start in a second and use little memory.",
      "An image is the read-only template, like a recipe. A container is a running copy made from it. Images come from registries, online stores of images such as registry.access.redhat.com, quay.io or docker.io.",
      "Podman is Red Hat's container tool. Its commands look just like Docker's, but it needs no background service, and normal users can run containers without root. If a container is hacked, the attacker is only your user, not root.",
      "Containers are throwaway: delete one and its changes are gone. To keep data such as a database, you mount a folder from the host into the container. On RHEL, add :Z to that mount so SELinux lets the container use it.",
    ],
    deepDive: [
      {
        heading: "Finding the right image",
        body: "Always use full image names: registry, path and tag, such as registry.access.redhat.com/ubi9/httpd-24:latest. A short name like httpd makes Podman search the registries listed under unqualified-search-registries in /etc/containers/registries.conf, and it may prompt you or pick an image you did not expect, which is a security risk.\n\npodman search httpd lists matches, and podman search --list-tags shows tags for one image. To read an image's details before pulling it, skopeo inspect docker://registry.access.redhat.com/ubi9/httpd-24 shows its labels, ports and environment. Red Hat's registry.redhat.io needs a login (podman login), while registry.access.redhat.com serves the free UBI images.",
        bullets: [
          "podman images lists local images and their size",
          "podman image inspect IMAGE shows default command, ports and user",
          "Pin a tag or digest in production; latest changes over time",
        ],
      },
      {
        heading: "How rootless containers work",
        body: "Rootless Podman uses a user namespace. Inside the container, a process may be root (UID 0), but outside it is mapped to your own user. Other UIDs inside the container map to a private range listed for you in /etc/subuid and /etc/subgid, usually 65536 IDs starting at 100000. useradd sets these up automatically.\n\nThis has visible effects. Files a container creates in a mounted folder may show strange owners like 100999 on the host. podman unshare chown 999:999 ~/data changes ownership as the container sees it, and the :U volume option does this automatically. Rootless containers also cannot bind host ports below 1024 by default, so publish 8080 instead of 80, or lower net.ipv4.ip_unprivileged_port_start.",
        visual: {
          type: "compare",
          title: "Inside vs outside a rootless container",
          columns: [
            { title: "Inside the container", points: ["Process runs as UID 0 or 999", "Sees its own files under /", "Listens on port 8080", "Thinks it owns the machine"] },
            { title: "On the host", points: ["UID 0 maps to your user", "UID 999 maps into your subuid range", "Port published with -p 8080:8080", "Storage in ~/.local/share/containers"] },
          ],
        },
      },
      {
        heading: "Storage: volumes, bind mounts and SELinux",
        body: "There are two ways to keep data. A bind mount maps a host folder: -v ~/db:/var/lib/mysql:Z. A named volume is managed by Podman: podman volume create dbdata, then -v dbdata:/var/lib/mysql. Named volumes are labelled correctly by Podman, so they need no :Z.\n\nWith bind mounts on SELinux systems, the container process runs as container_t and may not read ordinary host files. :Z relabels the folder with a private label just for this container. Lowercase :z uses a shared label so several containers can use it. Never use :Z on a system folder like /home or /etc: it relabels everything, and other services stop working. Make a dedicated folder instead.",
        bullets: [
          ":Z private label, :z shared label, :U fix ownership",
          ":ro mounts read-only, e.g. -v ~/conf:/etc/app:ro,Z",
          "podman volume inspect dbdata shows where it lives",
        ],
      },
      {
        heading: "Running, debugging and cleaning up",
        body: "podman run -d --name db -p 3306:3306 -e MARIADB_ROOT_PASSWORD=secret IMAGE starts a container in the background with a published port and an environment variable. Image documentation tells you which variables it needs. --rm deletes the container when it stops, which suits one-off commands.\n\nWhen something fails: podman ps -a shows stopped containers and exit codes. podman logs NAME shows output, and -f follows it. podman exec -it NAME bash opens a shell inside a running container. podman inspect NAME shows everything, including mounts, IP and the command. podman stop, start and rm -f manage the lifecycle, and podman system prune removes unused containers and images.",
      },
      {
        heading: "Building an image from a Containerfile",
        body: "A Containerfile (the same format as a Dockerfile) is a recipe. FROM picks a base image. RUN runs commands during the build, such as dnf install. COPY adds files from the build folder. EXPOSE documents a port. USER sets who the process runs as. CMD sets the default command. Each instruction creates a layer, and unchanged layers are reused from cache, so put rarely changing steps first.\n\nBuild with podman build -t myapp:1.0 . in the folder holding the Containerfile, or use -f to point at it. Keep images small: start from a minimal base like ubi9/ubi-minimal, clean the package cache in the same RUN line, and run as a non-root user. Push to a registry with podman push after podman login.",
        visual: {
          type: "flow",
          title: "From Containerfile to running container",
          steps: [
            { label: "Write Containerfile", detail: "FROM, RUN, COPY, USER, CMD" },
            { label: "podman build -t app:1.0 .", detail: "Each step becomes a cached layer" },
            { label: "podman images", detail: "app:1.0 is stored locally" },
            { label: "podman run -d -p 8080:8080 app:1.0", detail: "A container from the image" },
            { label: "podman push", detail: "Share it through a registry" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Everyday Podman commands",
        root: "podman",
        children: [
          { label: "Images", children: ["search", "pull", "images", "build", "rmi"] },
          { label: "Containers", children: ["run", "ps -a", "stop / start", "rm -f"] },
          { label: "Debugging", children: ["logs -f", "exec -it", "inspect", "top"] },
          { label: "Storage", children: ["volume create", "volume ls", "unshare chown"] },
        ],
      },
    ],
    examples: [
      {
        title: "A rootless MariaDB with persistent data",
        explanation: "You need a database for testing that keeps its data across container restarts. Step 1: create a dedicated host folder. Step 2: run MariaDB with a name, a published port, the required environment variables, and the folder mounted with :Z. Step 3: check the logs until it says ready for connections. Step 4: remove the container and start a new one with the same mount; the database is still there.",
        code: {
          lang: "bash",
          code: "mkdir -p ~/dbdata\npodman run -d --name db -p 3306:3306 \\\n  -e MARIADB_ROOT_PASSWORD=Secret123 -e MARIADB_DATABASE=shop \\\n  -v ~/dbdata:/var/lib/mysql:Z docker.io/library/mariadb:11\npodman logs -f db              # wait for: ready for connections\npodman exec -it db mariadb -uroot -pSecret123 -e 'SHOW DATABASES;'\npodman rm -f db\n# same command again: database shop still exists",
        },
      },
      {
        title: "Build and run a tiny web image",
        explanation: "Step 1: create a folder with an index.html and a Containerfile based on the UBI httpd image, which listens on 8080 and runs as a non-root user. Step 2: build it with a tag. Step 3: run it, publishing 8080. Step 4: test with curl, then look at the image layers with podman history.",
        code: {
          lang: "bash",
          code: "mkdir -p ~/site && cd ~/site\necho '<h1>Hello from Podman</h1>' > index.html\ncat > Containerfile <<'EOF'\nFROM registry.access.redhat.com/ubi9/httpd-24\nCOPY index.html /var/www/html/\nEXPOSE 8080\nEOF\npodman build -t mysite:1.0 .\npodman run -d --name mysite -p 8080:8080 mysite:1.0\ncurl -s localhost:8080\npodman history mysite:1.0 | head -5",
        },
      },
    ],
    cheatSheet: [
      "Use full image names: registry/path:tag, never a bare short name",
      "skopeo inspect docker://IMAGE reads image details without pulling it",
      "podman run -d --name N -p HOST:CTR -e KEY=VAL -v DIR:/path:Z IMAGE",
      ":Z private SELinux label, :z shared label, :U fix ownership for rootless",
      "Rootless containers cannot bind host ports below 1024 by default",
      "podman logs -f N, podman exec -it N bash, podman inspect N",
      "podman unshare chown 999:999 DIR changes ownership as the container sees it",
      "podman build -t name:tag . builds from ./Containerfile",
    ],
    quiz: [
      {
        q: "A container cannot read files in a bind-mounted host folder on RHEL, though the modes look fine. What is the usual fix?",
        options: ["Run the container with --privileged", "Add :Z to the volume option", "Disable SELinux", "chmod 777 the folder"],
        answer: 1,
        why: ":Z relabels the folder so the container_t process may use it.",
      },
      {
        q: "In a rootless container, a process runs as root (UID 0). Who is it on the host?",
        options: ["Root", "nobody", "The user who started the container", "UID 100000"],
        answer: 2,
        why: "The user namespace maps container UID 0 to your own user.",
      },
      {
        q: "Why should you avoid short image names like httpd?",
        options: ["They pull from a list of registries, and you may get an unexpected image", "They always fail", "They only work for root", "They disable SELinux labels"],
        answer: 0,
        why: "Short names are resolved through registries.conf; full names say exactly what you get.",
      },
      {
        q: "Which command opens a shell inside a running container named web?",
        options: ["podman attach web bash", "podman run -it web bash", "podman logs -it web", "podman exec -it web bash"],
        answer: 3,
        why: "exec runs a new process inside the existing container; run would start a new container.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pull the UBI 9 minimal image, run a one-off container that prints the OS release, and make sure it is removed afterwards.",
        hint: "--rm deletes the container when it exits.",
        solution: "podman pull registry.access.redhat.com/ubi9/ubi-minimal\npodman run --rm registry.access.redhat.com/ubi9/ubi-minimal cat /etc/os-release\npodman ps -a     # nothing left behind",
      },
      {
        level: "medium",
        task: "Run the UBI httpd container serving ~/web on host port 8081, then find its IP, mounts and command with inspect.",
        hint: "podman inspect supports --format with Go templates.",
        solution: "mkdir -p ~/web && echo hi > ~/web/index.html\npodman run -d --name web -p 8081:8080 -v ~/web:/var/www/html:Z \\\n  registry.access.redhat.com/ubi9/httpd-24\ncurl -s localhost:8081\npodman inspect web --format '{{.State.Status}} {{.Config.Cmd}}'\npodman inspect web --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{end}}'",
      },
      {
        level: "hard",
        task: "Build an image that runs a Python HTTP server as a non-root user on port 8000, and prove the process inside is not root.",
        hint: "Use ubi9/python-312 or install python3 on ubi-minimal, then set USER.",
        solution: "mkdir -p ~/py && cd ~/py && echo ok > index.html\ncat > Containerfile <<'EOF'\nFROM registry.access.redhat.com/ubi9/ubi-minimal\nRUN microdnf install -y python3 && microdnf clean all\nCOPY index.html /srv/\nUSER 1001\nWORKDIR /srv\nCMD [\"python3\", \"-m\", \"http.server\", \"8000\"]\nEOF\npodman build -t pysrv:1.0 . && podman run -d --name py -p 8000:8000 pysrv:1.0\npodman exec py id          # uid=1001\ncurl -s localhost:8000",
      },
    ],
    faq: [
      { q: "Is Podman compatible with Docker?", a: "Mostly yes. The commands and image format are the same, and many people simply alias docker to podman. The main differences are no daemon, rootless by default, and Quadlet for running containers as systemd services." },
      { q: "Where are my rootless images and containers stored?", a: "In ~/.local/share/containers/storage. Each user has their own images, so root and other users do not see them." },
      { q: "Why do files in my mounted folder have odd owners like 100999?", a: "They were created by a non-root user inside the container, which maps into your subuid range on the host. Use podman unshare to change them, or the :U volume option." },
      { q: "What is the difference between :z and :Z?", a: ":Z gives the folder a private label that only this container can use. :z gives a shared label so several containers can use the same folder." },
    ],
  },

  "adm-operations/podman-systemd": {
    plain: [
      "A container you start with podman run stops when the server reboots, and nobody restarts it if it crashes. For real services you want systemd, the same manager that starts sshd and httpd, to look after your container too.",
      "Quadlet makes this easy. You write a short file ending in .container that says which image to run, which ports to publish and which folders to mount. systemd reads it and creates a normal service from it. You then start, stop and check it with systemctl.",
      "For rootless containers there is one extra step. A normal user's services usually only run while that user is logged in. Turning on lingering with loginctl enable-linger tells systemd to start the user's services at boot and keep them running after logout.",
      "The final test is always the same: reboot the machine and check that the container came back on its own.",
    ],
    deepDive: [
      {
        heading: "Where Quadlet files go and what they become",
        body: "For a rootless user, put files in ~/.config/containers/systemd/. For system-wide containers run by root, use /etc/containers/systemd/. When you run systemctl --user daemon-reload (or systemctl daemon-reload for root), a systemd generator reads each file and writes a service unit: web.container becomes web.service. The generated unit exists only in a runtime folder, not in your config, which is why you edit the .container file and never the service.\n\nBy default the container is named systemd-web; set ContainerName=web if you want a short name in podman ps. If the service does not appear, ask Quadlet what is wrong with /usr/libexec/podman/quadlet -dryrun -user, which prints the generated unit or the error.",
        bullets: [
          "Other Quadlet types: .volume, .network, .pod, .kube, .image",
          "systemctl --user cat web.service shows the generated unit",
          "Rootful containers use WantedBy=multi-user.target",
        ],
        visual: {
          type: "flow",
          title: "From .container file to running service",
          steps: [
            { label: "web.container", detail: "Written in ~/.config/containers/systemd" },
            { label: "daemon-reload", detail: "Quadlet generator runs" },
            { label: "web.service", detail: "Generated in a runtime folder" },
            { label: "systemctl --user start web", detail: "Runs podman run for you" },
            { label: "systemd watches it", detail: "Restart= rules, journal logs" },
          ],
        },
      },
      {
        heading: "The keys you will use most",
        body: "In the [Container] section: Image= the full image name, ContainerName=, PublishPort=8080:8080, Volume=%h/web:/var/www/html:Z (where %h is your home folder), Environment=KEY=value or EnvironmentFile= for many variables, and Exec= to override the command. AutoUpdate=registry lets podman auto-update pull newer images on a timer.\n\nThe [Service] section takes normal systemd settings. Restart=always restarts the container if it exits. TimeoutStartSec=900 gives slow image pulls time on first start. The [Install] section, with WantedBy=default.target for user units, is what makes it start at boot. You cannot run systemctl enable on a generated unit; the generator handles [Install] for you.",
      },
      {
        heading: "Lingering and the user manager",
        body: "Every logged-in user gets their own systemd instance, the user manager, which runs their --user units. Normally it starts at login and stops after the last session ends, taking the containers with it, and it does not start at boot.\n\nloginctl enable-linger USER changes that: the user manager starts at boot and keeps running. It creates a marker file in /var/lib/systemd/linger/USER, and loginctl show-user USER --property=Linger shows Linger=yes. Without lingering, your container works perfectly until you log out, which is a classic exam trap.",
      },
      {
        heading: "Using systemctl --user correctly",
        body: "systemctl --user needs to talk to the user's own manager, through the variables XDG_RUNTIME_DIR and DBUS_SESSION_BUS_ADDRESS that a real login sets. If you switch user with su or sudo -u, those are missing and you get Failed to connect to bus. Log in properly with ssh user@localhost, or use machinectl shell user@ from root.\n\nLogs for a user container: journalctl --user -u web, or podman logs systemd-web. Check status with systemctl --user status web. After editing the .container file, run daemon-reload again and restart the service. The older way, podman generate systemd, still exists but is deprecated in favour of Quadlet, so learn both names but write Quadlet files.",
        bullets: [
          "Failed to connect to bus: you used su; log in with ssh instead",
          "systemctl --user list-units 'web*'",
          "Edit, daemon-reload, restart: three steps after every change",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "What happens at boot",
        actors: ["systemd (PID 1)", "user manager", "web.service", "podman"],
        messages: [
          { from: 0, to: 1, label: "Linger is on: start user@1001.service" },
          { from: 1, to: 1, label: "Generator turns web.container into web.service" },
          { from: 1, to: 2, label: "default.target wants web.service" },
          { from: 2, to: 3, label: "podman run with the Quadlet options" },
          { from: 3, to: 2, label: "Container running; output goes to the journal" },
        ],
      },
    ],
    examples: [
      {
        title: "A rootless web container that survives reboot",
        explanation: "User ana needs the UBI httpd container serving ~/web on port 8080 at boot. Step 1: log in as ana with SSH, not su. Step 2: create the Quadlet folder and file. Step 3: daemon-reload and start. Step 4: as root, enable lingering for ana. Step 5: reboot, log in again and check the service and the page.",
        code: {
          lang: "bash",
          code: "ssh ana@localhost\nmkdir -p ~/.config/containers/systemd ~/web && echo hi > ~/web/index.html\ncat > ~/.config/containers/systemd/web.container <<'EOF'\n[Container]\nImage=registry.access.redhat.com/ubi9/httpd-24\nContainerName=web\nPublishPort=8080:8080\nVolume=%h/web:/var/www/html:Z\n\n[Service]\nRestart=always\n\n[Install]\nWantedBy=default.target\nEOF\nsystemctl --user daemon-reload && systemctl --user start web\nsudo loginctl enable-linger ana\nsudo systemctl reboot   # then: systemctl --user status web; curl localhost:8080",
        },
      },
      {
        title: "The service does not show up",
        explanation: "After daemon-reload, systemctl --user start db says Unit db.service not found. Step 1: check the file is in the right folder and ends in .container. Step 2: run the Quadlet generator in dry-run mode to see the error; here it reports an unknown key, a typo in PublishPorts. Step 3: fix it, reload and start. Step 4: confirm with systemctl --user status and podman ps.",
        code: {
          lang: "bash",
          code: "ls ~/.config/containers/systemd/\n/usr/libexec/podman/quadlet -dryrun -user 2>&1 | tail -5\n# unsupported key 'PublishPorts' in group 'Container'\nsed -i 's/^PublishPorts=/PublishPort=/' ~/.config/containers/systemd/db.container\nsystemctl --user daemon-reload\nsystemctl --user start db\nsystemctl --user status db --no-pager; podman ps",
        },
      },
    ],
    cheatSheet: [
      "Rootless Quadlet files: ~/.config/containers/systemd/NAME.container",
      "Rootful Quadlet files: /etc/containers/systemd/NAME.container",
      "NAME.container becomes NAME.service after daemon-reload",
      "Boot start comes from [Install] WantedBy=default.target, not systemctl enable",
      "loginctl enable-linger USER keeps user services running without a login",
      "Use ssh user@localhost, not su, before systemctl --user",
      "/usr/libexec/podman/quadlet -dryrun -user shows generator errors",
      "%h in a Quadlet file expands to the user's home folder",
    ],
    quiz: [
      {
        q: "Your rootless container service works until you log out, then it stops. What is missing?",
        options: ["Restart=always", "Lingering for that user", "The :Z option", "systemctl enable web.service"],
        answer: 1,
        why: "Without lingering, the user manager and its services stop after the last session ends.",
      },
      {
        q: "What makes a Quadlet unit start at boot?",
        options: ["Running systemctl --user enable web", "Putting the file in /etc/systemd/system", "A [Install] section with WantedBy=default.target", "Adding AutoUpdate=registry"],
        answer: 2,
        why: "Generated units cannot be enabled; the generator applies the [Install] section.",
      },
      {
        q: "You run su - ana, then systemctl --user status and get Failed to connect to bus. Why?",
        options: ["su does not set up the user's session variables for the user manager", "ana has no password", "Podman is not installed", "SELinux blocks su"],
        answer: 0,
        why: "systemctl --user needs XDG_RUNTIME_DIR and the user bus from a real login.",
      },
      {
        q: "After editing web.container, what must you do?",
        options: ["Nothing, systemd notices", "Delete web.service by hand", "Reboot", "Run systemctl --user daemon-reload and restart web"],
        answer: 3,
        why: "The generator only runs on daemon-reload, and the running container keeps old settings until restarted.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Enable lingering for your user and confirm it is on.",
        hint: "loginctl can both set and show it.",
        solution: "sudo loginctl enable-linger \"$USER\"\nloginctl show-user \"$USER\" --property=Linger\n# Linger=yes\nls /var/lib/systemd/linger/",
      },
      {
        level: "medium",
        task: "Write a Quadlet unit for a rootless Redis container on port 6379 with a named volume, start it and check its logs.",
        hint: "Volume= can name a volume instead of a host path; no :Z is needed then.",
        solution: "mkdir -p ~/.config/containers/systemd\nprintf '%s\\n' '[Container]' 'Image=docker.io/library/redis:7' 'ContainerName=redis' \\\n  'PublishPort=6379:6379' 'Volume=redisdata:/data' '' '[Install]' 'WantedBy=default.target' \\\n  > ~/.config/containers/systemd/redis.container\nsystemctl --user daemon-reload\nsystemctl --user start redis\njournalctl --user -u redis -n 10 --no-pager\npodman exec redis redis-cli ping    # PONG",
      },
      {
        level: "hard",
        task: "Run a container as a system service owned by root that starts at boot, and compare where its unit and logs live with a rootless one.",
        hint: "Rootful Quadlet files go in /etc/containers/systemd and use multi-user.target.",
        solution: "sudo tee /etc/containers/systemd/sysweb.container <<'EOF'\n[Container]\nImage=registry.access.redhat.com/ubi9/httpd-24\nPublishPort=80:8080\n\n[Install]\nWantedBy=multi-user.target\nEOF\nsudo systemctl daemon-reload && sudo systemctl start sysweb\nsudo journalctl -u sysweb -n 5      # system journal, no --user\nsudo podman ps                      # root's containers, separate from users'",
      },
    ],
    faq: [
      { q: "What is Quadlet?", a: "A systemd generator shipped with Podman. It turns small .container, .volume and similar files into full service units, so containers are managed like any other service." },
      { q: "Is podman generate systemd still usable?", a: "It still works but is deprecated and gets no new features. Quadlet is the recommended way on current RHEL and Fedora." },
      { q: "How do I see logs for a Quadlet container?", a: "journalctl --user -u NAME for rootless units, or journalctl -u NAME for rootful ones. podman logs CONTAINER also works." },
      { q: "Do I need lingering for rootful containers?", a: "No. Lingering is only for rootless containers run by a user's systemd instance. Root's units run under the system manager, which always starts at boot." },
    ],
  },
};

export default extra;
