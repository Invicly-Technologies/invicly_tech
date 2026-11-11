import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-systemd/process-management": {
    plain: [
      "A process is a program that is running right now. Each one has a number called the PID (process ID), a user it runs as, and a parent process that started it. A busy server runs hundreds of them at once, most of them quietly waiting.",
      "ps takes a snapshot of the processes, and top shows a live view that refreshes every few seconds. With them you can answer the first questions in any incident: what is running, who started it, and what is using all the CPU or memory?",
      "You talk to processes with signals, which are small numbered messages. The polite one, SIGTERM, asks a program to finish its work and exit. The forceful one, SIGKILL, ends it instantly with no chance to clean up. kill, pkill and killall send signals.",
      "You can also change how much CPU time a process gets with its nice value, and move commands you started between the foreground and the background of your shell. That lets a long backup run without slowing down the web server or blocking your terminal.",
    ],
    deepDive: [
      {
        heading: "Signals you will actually use",
        body: "SIGTERM (15) is the default for kill and asks a process to stop; well-written programs close files and finish requests first. SIGKILL (9) is handled by the kernel, not the program, so it cannot be caught or ignored, and nothing is cleaned up: lock files, temporary files and half-written data stay behind. Use it only after SIGTERM has had a few seconds.\n\nSIGHUP (1) originally meant the terminal hung up; many daemons treat it as reload your config. SIGINT (2) is what Ctrl-C sends. SIGSTOP pauses a process and SIGCONT resumes it. kill -l lists all signals, and kill -0 PID sends nothing but tells you whether the process exists and you may signal it.\n\nA process stuck in state D (waiting on disk or NFS) will not die even from SIGKILL until the I/O returns.",
        bullets: ["pgrep -a nginx lists PIDs with full command lines", "pkill -u alice sends SIGTERM to all of alice's processes", "pkill -f matches the whole command line, so be careful with short patterns", "pgrep -x sshd matches the exact process name only"],
        visual: {
          type: "compare",
          title: "SIGTERM vs SIGKILL vs SIGHUP",
          columns: [
            { title: "SIGTERM (15)", points: ["Default for kill and systemctl stop", "Program can clean up", "Can be caught or ignored"] },
            { title: "SIGKILL (9)", points: ["Kernel ends the process at once", "No clean-up at all", "Cannot be caught or ignored"] },
            { title: "SIGHUP (1)", points: ["Terminal closed, or reload request", "Many daemons re-read config", "Kills jobs left in a closed shell"] },
          ],
        },
      },
      {
        heading: "Reading top like an admin",
        body: "The first lines of top summarise the whole machine. The load average shows how many tasks were running or waiting over 1, 5 and 15 minutes; compare it with the number of CPUs from nproc. The %Cpu(s) line splits time into us (user programs), sy (kernel), ni (niced programs), id (idle), wa (waiting for disk) and st (stolen by the hypervisor on a VM). High wa points to storage, high st to an overloaded host.\n\nFor memory, look at avail Mem, not free. Linux uses spare RAM as disk cache (buff/cache) and gives it back when programs need it, so a small free number is normal.\n\nUseful keys: P sorts by CPU, M by memory, 1 shows each CPU, c shows full commands, u filters by user, k kills and r renices. A %CPU above 100 means the process uses more than one core.",
        visual: {
          type: "layers",
          title: "The top header, line by line",
          layers: [
            { label: "Uptime and load average", detail: "Compare the three numbers with nproc" },
            { label: "Tasks", detail: "Total, running, sleeping, stopped, zombie" },
            { label: "%Cpu(s)", detail: "us, sy, ni, id, wa, st" },
            { label: "MiB Mem and Swap", detail: "avail Mem is what programs can still get" },
            { label: "Process list", detail: "PID, USER, PR, NI, RES, %CPU, %MEM, COMMAND" },
          ],
        },
      },
      {
        heading: "Nice, renice and fair sharing",
        body: "The kernel scheduler shares CPU time between runnable processes. The nice value, from -20 to 19, changes each process's share. The default is 0. Each step is worth roughly 10 percent of CPU share relative to a neighbour, so a process at nice 19 gets only a small slice when the CPU is busy. On an idle CPU nice changes nothing; it only matters when processes compete.\n\nnice -n 10 cmd starts a command with a lower priority and renice -n 10 -p PID changes a running one. Normal users may only make their processes nicer (raise the number); lowering it, even back to where it was, needs root. In top, PR is 20 plus the nice value.\n\nCPU is not the only shared resource. ionice -c3 cmd gives a process the idle I/O class, so it only uses the disk when nobody else needs it. For services, set Nice= or CPUWeight= in the unit file.",
        bullets: ["nice -n 19 ionice -c3 tar czf /backup/home.tgz /home", "renice -n 5 -u alice lowers all of alice's processes", "ps -o pid,ni,cmd -p PID shows the current nice value"],
      },
      {
        heading: "Job control and surviving logout",
        body: "A command ending in & runs in the background and the shell prints its job number and PID. Ctrl-Z sends SIGTSTP and pauses the foreground command. bg resumes it in the background, fg brings it back to the foreground, and jobs -l lists them. %1 refers to job 1, so kill %1 works too.\n\nJobs belong to your shell. When the SSH connection drops, the shell gets SIGHUP and passes it on, which stops your jobs. nohup cmd & ignores SIGHUP and writes output to nohup.out, and disown removes a running job from the shell's list. For anything important, run it inside tmux or screen, which keep running on the server, or start it as a transient systemd unit with systemd-run, so it is supervised and logged like a service.",
        visual: {
          type: "cycle",
          title: "A job moving between states",
          steps: [
            { label: "Foreground", detail: "Owns the terminal" },
            { label: "Ctrl-Z", detail: "Paused (stopped) with SIGTSTP" },
            { label: "bg", detail: "Runs on in the background" },
            { label: "fg", detail: "Back to the foreground" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Stopping a misbehaving process, politely first",
        steps: [
          { label: "Identify it", detail: "pgrep -a or ps -ef, check the parent" },
          { label: "Is it a service?", detail: "Then use systemctl stop or restart" },
          { label: "Send SIGTERM", detail: "kill PID" },
          { label: "Wait a few seconds", detail: "kill -0 PID checks if it is gone" },
          { label: "Send SIGKILL", detail: "kill -9 PID only as a last resort" },
        ],
      },
    ],
    examples: [
      {
        title: "Run a heavy job without hurting the website",
        explanation: "You must compress 50 GB of logs during the day on a web server. Step 1: start the job with the lowest CPU priority and the idle I/O class, in the background, with its output in a file. Step 2: check that the nice value and I/O class were applied. Step 3: if it still gets in the way, pause it with SIGSTOP and resume it later with SIGCONT, without losing any work.",
        code: {
          lang: "bash",
          code: "nohup nice -n 19 ionice -c3 tar czf /backup/logs.tgz /var/log/archive > /tmp/tar.log 2>&1 &\nPID=$!\nps -o pid,ni,stat,cmd -p \"$PID\"\nionice -p \"$PID\"            # idle\nkill -STOP \"$PID\"            # pause during peak traffic\nkill -CONT \"$PID\"            # carry on later",
        },
      },
      {
        title: "Recover a command you started in the foreground",
        explanation: "You started a long rsync in your SSH session and now need the terminal, and you are worried the connection may drop. Step 1: press Ctrl-Z to pause it. Step 2: bg lets it continue in the background. Step 3: disown -h tells the shell not to send it SIGHUP when you log out. Step 4: confirm later from a new session that it is still running.",
        code: {
          lang: "bash",
          code: "rsync -a /srv/data/ backup:/srv/data/\n# press Ctrl-Z\n# [1]+  Stopped   rsync -a /srv/data/ backup:/srv/data/\nbg\njobs -l\ndisown -h %1\n# later, from a new SSH session:\npgrep -a rsync",
        },
      },
    ],
    cheatSheet: [
      "ps -eo pid,ppid,user,ni,stat,%cpu,%mem,cmd --sort=-%mem | head shows top memory users",
      "pgrep -a NAME lists matching PIDs with full commands; pkill -x NAME signals exact names",
      "kill -0 PID checks if a process exists without affecting it",
      "kill -HUP PID asks many daemons to reload their config",
      "nice -n 10 cmd starts lower priority; renice -n 10 -p PID changes a running process",
      "In top: P CPU, M memory, 1 per-CPU, k kill, r renice, c full command",
      "avail Mem in top or free -h is the memory programs can still use",
      "Ctrl-Z pauses, bg resumes in background, fg returns, disown detaches from the shell",
    ],
    quiz: [
      {
        q: "A process ignores kill PID. What should you do before reaching for kill -9?",
        options: ["Reboot the server", "Wait a few seconds and check whether it is still shutting down cleanly", "Send SIGHUP five times", "Renice it to -20"],
        answer: 1,
        why: "SIGTERM lets a program clean up, which can take a moment; SIGKILL is the last resort.",
      },
      {
        q: "As a normal user you ran renice -n 10 on your job. Can you set it back to 0 yourself?",
        options: ["Yes, you own the process", "Only with kill -CONT", "Yes, with nice -n 0", "No, lowering a nice value needs root"],
        answer: 3,
        why: "Unprivileged users may only raise the nice value of their processes.",
      },
      {
        q: "top shows 30 wa in the %Cpu(s) line. What does it suggest?",
        options: ["CPUs spend much time waiting for disk or network I/O", "30 processes are waiting for CPU", "The VM is losing CPU to other guests", "Memory is full"],
        answer: 0,
        why: "wa is time the CPU sat idle while waiting for I/O to finish.",
      },
      {
        q: "Which signal cannot be caught or ignored by a program?",
        options: ["SIGTERM", "SIGHUP", "SIGKILL", "SIGINT"],
        answer: 2,
        why: "SIGKILL is handled entirely by the kernel, as is SIGSTOP.",
      },
      {
        q: "A process at nice 19 runs on an otherwise idle 4-core server. How fast does it run?",
        options: ["About 10 percent of normal speed", "At full speed, because nothing competes with it", "It does not run until another process exits", "Only on one core"],
        answer: 1,
        why: "Nice values only change shares when processes compete for the CPU.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start sleep 600 three times in the background, list them as jobs, bring the second one to the foreground, then stop all of them with a single command.",
        hint: "jobs shows numbers; fg %2 picks one; pkill -x matches an exact name.",
        solution: "sleep 600 & sleep 600 & sleep 600 &\njobs\nfg %2           # then press Ctrl-Z to get the prompt back\npkill -x sleep\njobs            # all Terminated",
      },
      {
        level: "medium",
        task: "Find the three processes using the most memory, show their owner, nice value and full command, and lower the priority of the biggest one to nice 10.",
        hint: "ps can sort by -rss and print chosen columns; renice needs the PID.",
        solution: "ps -eo pid,user,ni,rss,cmd --sort=-rss | head -4\nPID=$(ps -eo pid= --sort=-rss | head -1)\nsudo renice -n 10 -p \"$PID\"\nps -o pid,ni,cmd -p \"$PID\"",
      },
      {
        level: "hard",
        task: "Write a small function stopwait PID that sends SIGTERM, waits up to 10 seconds for the process to exit, and only then sends SIGKILL. It should print what it did.",
        hint: "kill -0 tests whether the process still exists; loop with sleep 1.",
        solution: "stopwait() {\n  kill \"$1\" 2>/dev/null || { echo \"no such process\"; return 1; }\n  for i in $(seq 10); do\n    kill -0 \"$1\" 2>/dev/null || { echo \"exited after ${i}s\"; return 0; }\n    sleep 1\n  done\n  kill -9 \"$1\" && echo \"forced with SIGKILL\"\n}\nsleep 300 & stopwait $!",
      },
    ],
    faq: [
      { q: "What is the difference between kill, pkill and killall?", a: "kill takes PIDs. pkill takes a pattern and matches names or, with -f, full command lines. killall takes exact process names; on Linux it comes from the psmisc package." },
      { q: "Why is my free memory so low when the server is idle?", a: "Linux uses spare RAM as a disk cache and frees it on demand. Look at the available column of free -h, not the free column." },
      { q: "What is a zombie process and should I kill it?", a: "A zombie has already exited and only waits for its parent to read its exit status. You cannot kill it; fix or restart the parent so it collects or hands over its children." },
      { q: "How do I keep a command running after I log out?", a: "Use tmux or screen, or start it with nohup or systemd-run. A plain background job usually dies when the shell gets SIGHUP." },
    ],
  },

  "adm-systemd/systemd-units": {
    plain: [
      "systemd is the first program the kernel starts, with PID 1. Its job is to bring the system up and keep it running: it starts services, mounts disks, sets up the network, runs scheduled jobs and restarts things that crash.",
      "Everything systemd manages is a unit, described by a small text file. A web server is a service unit, a scheduled job is a timer unit, a mounted disk is a mount unit, and a group of units that together make a system state, like normal multi-user operation, is a target unit.",
      "You control units with systemctl. Two ideas matter most and are easy to mix up. start and stop act right now. enable and disable decide what happens at the next boot. A service can be running but not enabled, so it vanishes after a reboot, or enabled but not running yet.",
      "systemctl status tells you most of what you need: whether the unit is loaded, enabled, running, its main PID, its memory use and the last few log lines. When something does not work, that command is always the first step.",
    ],
    deepDive: [
      {
        heading: "Unit types and their states",
        body: "The suffix of a unit name tells you its type: .service for programs, .socket for a listening socket that starts a service on first connection, .timer for schedules, .target for groups of units, .mount and .automount for file systems, .swap, .path for watching files, and .slice and .scope for grouping processes for resource control.\n\nTwo kinds of state exist. The runtime state, shown by systemctl list-units, says whether a unit is active, inactive, failed, activating or deactivating. The install state, shown by systemctl list-unit-files, says what happens at boot: enabled, disabled, static (no [Install] section, so it only starts when another unit needs it), masked, or generated (created at boot, for example from /etc/fstab).",
        visual: {
          type: "tree",
          title: "Common unit types",
          root: "systemd units",
          children: [
            { label: ".service", children: ["sshd.service", "httpd.service"] },
            { label: ".socket", children: ["Starts a service on first connection"] },
            { label: ".timer", children: ["Runs a service on a schedule"] },
            { label: ".target", children: ["multi-user.target", "graphical.target"] },
            { label: ".mount and .swap", children: ["Generated from /etc/fstab"] },
            { label: ".slice", children: ["user.slice, system.slice for resource limits"] },
          ],
        },
      },
      {
        heading: "What enable and mask really do",
        body: "enable is just symlinks. systemctl enable httpd reads the [Install] section of httpd.service, finds WantedBy=multi-user.target and creates /etc/systemd/system/multi-user.target.wants/httpd.service pointing at the unit file. At boot, when multi-user.target starts, it pulls in everything in its .wants directory. disable removes those links. Neither one starts or stops anything unless you add --now.\n\nmask creates /etc/systemd/system/httpd.service as a link to /dev/null. Because /etc wins over the vendor directory, systemd sees an empty unit and refuses every start, manual or automatic. unmask removes the link.\n\nDistributions differ on installs: on RHEL, a newly installed service is usually left disabled and stopped until you enable it, while on Ubuntu, installing a package such as nginx normally enables and starts it straight away.",
        visual: {
          type: "flow",
          title: "systemctl enable --now httpd",
          steps: [
            { label: "Read [Install]", detail: "WantedBy=multi-user.target" },
            { label: "Create a symlink", detail: "In multi-user.target.wants/" },
            { label: "Reload manager", detail: "systemd notices the new link" },
            { label: "--now: start it", detail: "Same as systemctl start httpd" },
            { label: "Next boot", detail: "multi-user.target pulls it in" },
          ],
        },
      },
      {
        heading: "Requirements versus ordering",
        body: "systemd keeps two separate kinds of relationship. Requirement settings say what must be started together. Wants= is weak: start the other unit too, but carry on if it fails. Requires= is strong: if the required unit fails to start or is stopped later, this unit is stopped too. BindsTo= is even stricter, and PartOf= passes stop and restart from one unit to another.\n\nOrdering settings, After= and Before=, only say which starts first. They do not cause anything to start. A unit with Wants=db.service but no After=db.service starts in parallel with the database, which is a common cause of services that fail only at boot.\n\nsystemctl list-dependencies httpd shows what a unit pulls in, and --reverse shows who pulls it in. systemd-analyze blame and systemd-analyze critical-chain show what made the last boot slow.",
        visual: {
          type: "compare",
          title: "Two kinds of dependency",
          columns: [
            { title: "Requirement: Wants=, Requires=", points: ["Decides what also gets started", "Wants= tolerates failure", "Requires= stops this unit if the other fails", "Says nothing about order"] },
            { title: "Ordering: After=, Before=", points: ["Decides who starts first", "Starts nothing by itself", "Usually paired with Wants= or Requires=", "Also reversed on shutdown"] },
          ],
        },
      },
      {
        heading: "Status, restart and reload in detail",
        body: "In systemctl status, the Loaded line shows the unit file path, its install state and the vendor preset. The Active line shows the state and since when. Below come the main PID, the number of tasks, memory use, the cgroup tree with every child process, and the last ten journal lines.\n\nrestart stops and starts the service, dropping connections. reload asks the running service to re-read its configuration, if it supports that, without stopping. reload-or-restart picks reload when possible, and try-restart only restarts if it is already running, which suits scripts.\n\nFor scripts, systemctl is-active, is-enabled and is-failed print one word and return an exit code. systemctl show httpd -p MainPID -p ActiveState prints single properties. After you fix a failed unit, systemctl reset-failed clears the failed state and the restart counter.",
        bullets: ["systemctl --failed lists failed units", "systemctl list-units --type=service --state=running", "systemctl kill -s HUP httpd signals every process of the unit"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Now versus at boot",
        columns: [
          { title: "Acts now", points: ["start, stop, restart", "reload", "isolate a target", "kill"] },
          { title: "Acts at boot", points: ["enable, disable", "set-default", "Only changes symlinks", "Add --now to also act now"] },
          { title: "Both, and stronger", points: ["mask --now", "Stops it and blocks all starts", "unmask to undo", "Use for conflicting services"] },
        ],
      },
    ],
    examples: [
      {
        title: "Make sure only one firewall service can run",
        explanation: "A server has both firewalld and iptables-services installed, and the old iptables service keeps getting started by a script. Step 1: check the state of both. Step 2: stop and mask iptables so nothing can start it, even by accident. Step 3: enable and start firewalld. Step 4: confirm the mask by trying to start iptables, which fails with a clear message.",
        code: {
          lang: "bash",
          code: "systemctl is-enabled firewalld iptables\nsudo systemctl mask --now iptables\nsudo systemctl enable --now firewalld\nsystemctl is-active firewalld        # active\nsudo systemctl start iptables\n# Failed to start iptables.service: Unit iptables.service is masked.\nls -l /etc/systemd/system/iptables.service   # -> /dev/null",
        },
      },
      {
        title: "Investigate a service that fails at boot",
        explanation: "After a reboot the app service is failed, but starting it by hand works. That pattern usually means an ordering problem. Step 1: list failed units and read the status. Step 2: read the logs from this boot only. Step 3: look at what the unit waits for. Here the log says it could not reach the database, and the unit has Wants=postgresql.service but no After=, so both started at the same time. Adding After=postgresql.service in a drop-in fixes it.",
        code: {
          lang: "bash",
          code: "systemctl --failed\nsystemctl status app\njournalctl -b -u app | tail -20\nsystemctl show app -p Wants -p After\nsudo systemctl edit app       # add: [Unit] After=postgresql.service\nsudo systemctl reset-failed app\nsudo systemctl restart app",
        },
      },
    ],
    cheatSheet: [
      "systemctl enable --now NAME starts a service and enables it at boot",
      "systemctl list-unit-files --state=enabled shows what starts at boot",
      "systemctl is-active NAME and is-enabled NAME print one word; great in scripts",
      "systemctl mask --now NAME stops it and blocks every future start",
      "systemctl list-dependencies --reverse NAME shows who pulls a unit in",
      "Wants= and Requires= start units; After= and Before= only order them",
      "systemctl reload-or-restart NAME reloads if supported, else restarts",
      "systemd-analyze blame lists units by how long they took at boot",
    ],
    quiz: [
      {
        q: "systemctl status shows a service as active (running) and disabled. What happens at the next reboot?",
        options: ["It starts automatically", "It does not start, because it is not enabled", "It starts in rescue mode only", "It becomes masked"],
        answer: 1,
        why: "enable controls boot; the running state does not survive a reboot.",
      },
      {
        q: "What does systemctl enable actually create?",
        options: ["A copy of the unit file in /usr/lib", "A cron entry", "A symlink in the .wants directory of the target named in WantedBy", "A running process"],
        answer: 2,
        why: "enable reads [Install] and links the unit into that target's wants directory.",
      },
      {
        q: "A unit has After=network-online.target but no Wants= or Requires= for it. What does After= do on its own?",
        options: ["It only orders startup if that target is being started anyway", "It starts network-online.target", "It makes the unit fail if the network is down", "Nothing at all, it is ignored"],
        answer: 0,
        why: "Ordering settings never pull units in; something else must start the target.",
      },
      {
        q: "What does the static install state mean?",
        options: ["The unit is masked", "The unit cannot be stopped", "The unit failed too often", "The unit has no [Install] section and starts only when another unit needs it"],
        answer: 3,
        why: "Static units cannot be enabled; they are pulled in as dependencies.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install and start the chronyd time service so that it also runs after a reboot. Show both its active and enabled states.",
        hint: "One systemctl command can do both; then use is-active and is-enabled.",
        solution: "sudo dnf install -y chrony        # Ubuntu: sudo apt install -y chrony\nsudo systemctl enable --now chronyd   # Ubuntu unit name: chrony\nsystemctl is-active chronyd\nsystemctl is-enabled chronyd",
      },
      {
        level: "medium",
        task: "Find which target pulls in sshd at boot and prove it by showing the symlink that enable created.",
        hint: "Read the [Install] section, then look in the matching .wants directory.",
        solution: "systemctl cat sshd | grep -A2 '\\[Install\\]'\n# WantedBy=multi-user.target\nls -l /etc/systemd/system/multi-user.target.wants/ | grep sshd\nsystemctl list-dependencies --reverse sshd.service",
      },
      {
        level: "hard",
        task: "Write a one-line health check that prints the name of every failed unit and exits non-zero if there is at least one, suitable for a monitoring script.",
        hint: "systemctl --failed has options to drop the header and legend; count the lines.",
        solution: "F=$(systemctl list-units --state=failed --plain --no-legend | awk '{print $1}')\n[ -z \"$F\" ] && echo OK || { echo \"FAILED: $F\"; exit 1; }",
      },
    ],
    faq: [
      { q: "What is the difference between systemctl and service?", a: "service is the old SysV-style command. On systemd systems it just forwards to systemctl, so service httpd restart and systemctl restart httpd do the same thing." },
      { q: "Do I need to type .service after the unit name?", a: "No. systemctl assumes .service when no suffix is given, so systemctl status sshd works. Other types need their suffix, such as cleanup.timer." },
      { q: "When should I mask instead of disable?", a: "Disable when you just do not want it at boot. Mask when nothing may start it at all, for example a service that conflicts with the one you use." },
      { q: "Why does my service show inactive (dead) right after starting?", a: "Its main process exited. Check journalctl -u NAME; often the program forked into the background while the unit uses Type=simple, or it hit an error at start-up." },
    ],
  },

  "adm-systemd/unit-files": {
    plain: [
      "A unit file is a short text file that tells systemd how to run something. It uses sections in square brackets and key=value lines, like an INI file. A few lines are enough to turn any program into a proper service that starts at boot and restarts when it crashes.",
      "Packages ship their unit files in /usr/lib/systemd/system. You should not edit those, because the next package update would overwrite your change. Your own units and your changes go in /etc/systemd/system, which always wins.",
      "To change just one or two settings of a packaged unit, you add a drop-in file: a tiny file that only contains the lines you want to change. systemctl edit creates it for you in the right place, and the original file stays untouched.",
      "systemd reads unit files into memory. After you change any of them by hand, run systemctl daemon-reload so it notices. systemctl edit does that step for you.",
    ],
    deepDive: [
      {
        heading: "Choosing the right Type=",
        body: "Type= tells systemd how to know the service has started. simple, the default, treats the service as started as soon as the process is created. exec waits until the program has actually been executed, so a wrong path makes the start fail properly. Both expect the program to stay in the foreground.\n\nforking is for old-style daemons that start, fork a child into the background and exit; set PIDFile= so systemd can find the main process. oneshot is for commands that do a job and exit, like a clean-up script; add RemainAfterExit=yes if the unit should count as active afterwards. notify waits until the program reports that it is ready, which programs built for systemd support.\n\nThe classic mistake is running a program that daemonizes itself with Type=simple: systemd sees the parent exit and considers the service finished.",
        visual: {
          type: "tree",
          title: "Service types and when to use them",
          root: "Type=",
          children: [
            { label: "simple or exec", children: ["Program stays in the foreground", "Most modern apps"] },
            { label: "forking", children: ["Old daemon that backgrounds itself", "Set PIDFile="] },
            { label: "oneshot", children: ["Runs a task and exits", "Often with timers"] },
            { label: "notify", children: ["Program signals when ready", "Built-in systemd support"] },
          ],
        },
      },
      {
        heading: "The settings that make a solid service",
        body: "ExecStart= needs an absolute path and is not run through a shell, so pipes, redirections, globs and && do not work; if you need them, use ExecStart=/bin/sh -c '...' or, better, a small script. ExecStartPre= runs checks first, and ExecReload=/bin/kill -HUP $MAINPID gives you systemctl reload.\n\nUser= and Group= drop root rights. WorkingDirectory= sets the current directory. Environment=KEY=value sets variables, and EnvironmentFile=/etc/app/env loads them from a file; a leading dash, as in EnvironmentFile=-/etc/app/env, means do not fail if it is missing.\n\nRestart=on-failure restarts after a crash or non-zero exit, and RestartSec=5 waits five seconds first. StartLimitIntervalSec= and StartLimitBurst= in [Unit] stop endless restart loops; by default, more than 5 starts in 10 seconds marks the unit failed.",
        bullets: ["Restart=always also restarts after a clean exit", "TimeoutStopSec= sets how long to wait before SIGKILL (default 90 s)", "systemd-analyze verify app.service checks a unit for mistakes"],
      },
      {
        heading: "How drop-ins are merged",
        body: "systemd builds each unit from the main file plus every .conf file in a matching NAME.service.d directory, read in alphabetical order by file name. Drop-ins in /etc override those in /run and /usr/lib. systemctl edit httpd writes /etc/systemd/system/httpd.service.d/override.conf and reloads systemd when you save.\n\nMost settings simply take the last value. Settings that can appear many times, like ExecStart= or Environment=, add to the list instead. To replace ExecStart, first clear it with an empty ExecStart= line, then set the new one; otherwise a simple service complains that it has more than one ExecStart. Dependencies like After= and Wants= can be added in a drop-in but not removed.\n\nsystemctl edit --full copies the whole unit to /etc, which also hides future vendor fixes. systemd-delta lists every overridden unit, and systemctl revert httpd removes your overrides.",
        visual: {
          type: "flow",
          title: "From files to the running configuration",
          steps: [
            { label: "Vendor unit", detail: "/usr/lib/systemd/system/httpd.service" },
            { label: "Drop-ins", detail: "httpd.service.d/*.conf, alphabetical" },
            { label: "daemon-reload", detail: "systemd merges and caches the result" },
            { label: "restart the service", detail: "New settings apply to the process" },
            { label: "Check", detail: "systemctl cat and systemctl show" },
          ],
        },
      },
      {
        heading: "Hardening and user services",
        body: "Unit files can also sandbox a service with a few lines. NoNewPrivileges=yes stops the process and its children from gaining rights through SUID programs. PrivateTmp=yes gives it its own /tmp. ProtectSystem=strict makes the whole file system read-only for it, and ReadWritePaths=/var/lib/app opens only the directories it needs. ProtectHome=yes hides home directories. systemd-analyze security app.service rates how exposed a unit is and suggests more options.\n\nNormal users can run their own services without root. Their units live in ~/.config/systemd/user, and they use systemctl --user start, enable and status. By default those services stop when the user's last session ends; sudo loginctl enable-linger alice keeps her user services running without a login and starts them at boot, which is how rootless Podman containers are often run.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Anatomy of a service unit",
        layers: [
          { label: "[Unit]", detail: "Description, After=, Wants=, start limits" },
          { label: "[Service]", detail: "Type, ExecStart, User, Environment, Restart" },
          { label: "Hardening lines", detail: "NoNewPrivileges, ProtectSystem, PrivateTmp" },
          { label: "[Install]", detail: "WantedBy= used by systemctl enable" },
        ],
      },
    ],
    examples: [
      {
        title: "Turn a Python web app into a service",
        explanation: "A small API lives in /opt/api and runs with /opt/api/venv/bin/python app.py. Step 1: create a system user for it. Step 2: write the unit with the user, working directory, an environment file, restart policy and some hardening. Step 3: reload systemd, verify the file, then enable and start the service. Step 4: confirm it runs as the api user and follow its logs.",
        code: {
          lang: "ini",
          code: "# /etc/systemd/system/api.service\n[Unit]\nDescription=Example API\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nUser=api\nWorkingDirectory=/opt/api\nEnvironmentFile=-/etc/api/env\nExecStart=/opt/api/venv/bin/python app.py\nRestart=on-failure\nRestartSec=5\nNoNewPrivileges=yes\nPrivateTmp=yes\n\n[Install]\nWantedBy=multi-user.target",
        },
      },
      {
        title: "Change how a packaged service starts",
        explanation: "You need to add an option to the vendor's ExecStart for a service called myd, without editing the packaged file. Step 1: see the current unit with systemctl cat. Step 2: run systemctl edit and add a [Service] section that first clears ExecStart and then sets the new line. Step 3: check the merged result. Step 4: restart, and check that the process has the new option.",
        code: {
          lang: "bash",
          code: "systemctl cat myd | grep ExecStart\n# ExecStart=/usr/sbin/myd --foreground\nsudo systemctl edit myd\n# [Service]\n# ExecStart=\n# ExecStart=/usr/sbin/myd --foreground --verbose\nsystemctl cat myd          # shows the vendor file and override.conf\nsudo systemctl restart myd\nps -o args= -p \"$(systemctl show -p MainPID --value myd)\"",
        },
      },
    ],
    cheatSheet: [
      "Vendor units: /usr/lib/systemd/system; yours: /etc/systemd/system",
      "systemctl edit NAME makes a drop-in and reloads; --full copies the whole unit",
      "Clear a list setting with an empty line first: ExecStart= then ExecStart=/new/cmd",
      "ExecStart is not run by a shell; use /bin/sh -c or a script for pipes and redirects",
      "Restart=on-failure plus RestartSec=5 restarts a crashed service after 5 s",
      "systemd-delta shows overridden units; systemctl revert NAME removes overrides",
      "systemd-analyze verify FILE finds errors; systemd-analyze security NAME rates hardening",
      "loginctl enable-linger USER keeps that user's services running without a login",
    ],
    quiz: [
      {
        q: "A daemon forks into the background and the parent exits, but the unit uses Type=simple. What happens?",
        options: ["systemd waits for the child automatically", "Nothing, it works the same", "systemd sees the main process exit and may treat the service as stopped", "The daemon is converted to Type=notify"],
        answer: 2,
        why: "With simple, the started process is the main process; when it exits systemd thinks the service ended.",
      },
      {
        q: "In a drop-in you add ExecStart=/usr/bin/app --new without an empty ExecStart= line first. What is the likely result?",
        options: ["The unit fails to load: more than one ExecStart for this service type", "The new line replaces the old one", "The old line is ignored automatically", "systemd asks which one to use"],
        answer: 0,
        why: "ExecStart is a list setting, so the drop-in adds a second entry unless you clear it first.",
      },
      {
        q: "Which line in a unit loads environment variables from /etc/app/env and does not fail if the file is missing?",
        options: ["Environment=/etc/app/env", "EnvironmentFile=/etc/app/env?", "Source=/etc/app/env", "EnvironmentFile=-/etc/app/env"],
        answer: 3,
        why: "A leading dash on a path tells systemd to ignore a missing file.",
      },
      {
        q: "You edited /etc/systemd/system/api.service in vim and restarted it, but the old settings still apply. What did you forget?",
        options: ["systemctl enable api", "systemctl daemon-reload", "systemctl mask api", "A reboot"],
        answer: 1,
        why: "systemd keeps parsed units in memory until daemon-reload; systemctl edit does that for you.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the full effective unit for sshd, including any drop-ins, and list every unit on the system that has overrides.",
        hint: "One command prints a unit with its drop-ins; another compares /etc with vendor files.",
        solution: "systemctl cat sshd\nsystemd-delta --type=extended,overridden",
      },
      {
        level: "medium",
        task: "Without editing the vendor file, make httpd restart automatically 3 seconds after any failure, and prove the setting is active.",
        hint: "systemctl edit, then systemctl show -p for the two properties.",
        solution: "sudo systemctl edit httpd\n# [Service]\n# Restart=on-failure\n# RestartSec=3\nsystemctl show httpd -p Restart -p RestartUSec\n# Restart=on-failure  RestartUSec=3s\nsudo systemctl restart httpd\nsudo kill -9 \"$(systemctl show -p MainPID --value httpd)\"\nsleep 4; systemctl is-active httpd    # active again",
      },
      {
        level: "hard",
        task: "Create a oneshot service disk-report that writes df -h output to /var/log/disk-report.txt at boot, runs after local file systems are mounted, and counts as active after it finishes.",
        hint: "Type=oneshot with RemainAfterExit=yes; ExecStart has no shell, so wrap the redirect in /bin/sh -c.",
        solution: "sudo tee /etc/systemd/system/disk-report.service > /dev/null <<'EOF'\n[Unit]\nDescription=Write disk usage report\nAfter=local-fs.target\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart=/bin/sh -c 'df -h > /var/log/disk-report.txt'\n[Install]\nWantedBy=multi-user.target\nEOF\nsudo systemctl daemon-reload && sudo systemctl enable --now disk-report\nsystemctl is-active disk-report; head -3 /var/log/disk-report.txt",
      },
    ],
    faq: [
      { q: "Where should I put my own service files?", a: "In /etc/systemd/system. Files there override packaged units in /usr/lib/systemd/system and are never touched by package updates." },
      { q: "Do I need daemon-reload after systemctl edit?", a: "No, systemctl edit reloads for you when you save. You only need it after editing or creating files by hand." },
      { q: "Can a unit file use shell features like pipes?", a: "Not directly. ExecStart runs the program without a shell, so wrap the command in /bin/sh -c '...' or put it in a script." },
      { q: "Should I use cron or a systemd unit for my app?", a: "Long-running apps belong in a service unit, which restarts and logs them. For scheduled jobs, cron still works, but a systemd timer with a oneshot service gives you logs and dependency handling." },
    ],
  },

  "adm-systemd/journald": {
    plain: [
      "Every program on a server writes messages about what it is doing: started, connection refused, disk full. These messages are logs, and reading them is how you find out why something broke.",
      "On systemd systems, a service called journald collects nearly all logs in one place: messages from the kernel, from every service's output and from programs using the classic syslog interface. It stores them in a binary journal with extra details, such as which service and which process wrote each line.",
      "journalctl is the tool for reading the journal. Its strength is filtering: show only the sshd service, only errors, only the last hour, or only the boot before the last crash. That turns thousands of lines into the ten that matter.",
      "Many systems also run rsyslog, which writes classic plain-text files under /var/log. Knowing both, and where each distribution puts its files, means you can find logs on any server you are handed.",
    ],
    deepDive: [
      {
        heading: "Every entry has fields you can filter on",
        body: "A journal entry is not just a line of text. It is a set of fields. MESSAGE holds the text and PRIORITY the severity. journald adds trusted fields whose names start with an underscore, so programs cannot fake them: _PID, _UID, _COMM (the command name), _EXE, _SYSTEMD_UNIT, _HOSTNAME and _BOOT_ID.\n\nYou can filter on any field by writing it as FIELD=value: journalctl _UID=1001 or journalctl _COMM=sshd. Several different fields are combined with AND; the same field given twice means OR. journalctl -F _SYSTEMD_UNIT lists every value a field has, which is a quick way to see which units logged anything.\n\nShortcuts cover the common cases: -u for a unit, -t for a syslog identifier, -k for kernel messages, and -g (grep) to search the message text with a regular expression.",
        visual: {
          type: "tree",
          title: "Inside one journal entry (journalctl -o verbose)",
          root: "Journal entry",
          children: [
            { label: "Message", children: ["MESSAGE=Failed password for root", "PRIORITY=6"] },
            { label: "Who", children: ["_PID=1432", "_UID=0", "_COMM=sshd"] },
            { label: "Where", children: ["_SYSTEMD_UNIT=sshd.service", "_HOSTNAME=web1"] },
            { label: "When", children: ["__REALTIME_TIMESTAMP", "_BOOT_ID"] },
          ],
        },
      },
      {
        heading: "Filtering by time, boot and priority",
        body: "--since and --until accept full dates (\"2026-11-10 09:00\"), words (today, yesterday) and relative times (\"1 hour ago\", \"-15m\"). -b alone means this boot, -b -1 the previous boot and --list-boots shows them all, which needs persistent storage to be useful.\n\nPriorities run from 0 to 7: emerg, alert, crit, err, warning, notice, info and debug. -p err shows err and everything more severe, and a range such as -p warning..err shows just those levels.\n\nOutput options help too. -n 50 shows the last 50 lines, -r shows newest first, -f follows new lines live, -e jumps to the end in the pager, and -x adds help text to some messages. -o short-iso prints exact timestamps, -o cat prints only the message, and -o json gives machine-readable output for scripts.",
        bullets: ["journalctl -u nginx -p err --since today", "journalctl -k -b -1 shows kernel messages from the previous boot", "journalctl --no-pager | tail is handy inside scripts"],
      },
      {
        heading: "Storage, size limits and access",
        body: "Storage= in /etc/systemd/journald.conf decides where the journal lives. auto, the usual default, keeps it on disk in /var/log/journal if that directory exists, and otherwise only in RAM under /run/log/journal, which is lost at every reboot. persistent always writes to disk and creates the directory, volatile keeps it in RAM only, and none drops logs. Put your settings in a drop-in such as /etc/systemd/journald.conf.d/00-local.conf, then restart systemd-journald.\n\nBy default the persistent journal may use up to 10 percent of its file system, capped at 4 GB. Set SystemMaxUse=1G to choose your own limit. journalctl --disk-usage shows the size now, and --vacuum-size=500M or --vacuum-time=2weeks trims old files at once.\n\nNormal users see only their own logs. Members of the systemd-journal group (and adm or wheel on many distributions) can read everything.",
      },
      {
        heading: "rsyslog, classic files and logrotate",
        body: "rsyslog receives messages from the journal and writes plain text files according to rules of the form facility.priority destination. A facility is the kind of source, such as auth, cron, kern or mail; authpriv.* /var/log/secure sends every authentication message to that file. Rules live in /etc/rsyslog.conf and /etc/rsyslog.d/*.conf.\n\nThe file names differ by family. RHEL writes most messages to /var/log/messages and logins to /var/log/secure. Ubuntu uses /var/log/syslog and /var/log/auth.log. Test your rules with logger, for example logger -p local0.notice \"test\".\n\nText files would grow forever without logrotate. It runs daily from a systemd timer on current releases, reads /etc/logrotate.conf and /etc/logrotate.d/, and renames, compresses and deletes old files. logrotate -d /etc/logrotate.d/app is a dry run that shows what would happen.",
        visual: {
          type: "compare",
          title: "Where classic logs live",
          columns: [
            { title: "RHEL, Rocky, Alma", points: ["/var/log/messages: general", "/var/log/secure: logins and sudo", "/var/log/cron: scheduled jobs", "/var/log/maillog: mail"] },
            { title: "Ubuntu, Debian", points: ["/var/log/syslog: general", "/var/log/auth.log: logins and sudo", "/var/log/kern.log: kernel", "/var/log/apt/: package history"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Narrowing a search from everything to the answer",
        steps: [
          { label: "journalctl", detail: "Every entry, often millions" },
          { label: "-b", detail: "Only this boot" },
          { label: "-u app", detail: "Only one service" },
          { label: "-p warning", detail: "Only warnings and worse" },
          { label: "--since \"30 min ago\"", detail: "Only around the incident" },
        ],
      },
    ],
    examples: [
      {
        title: "Make the journal persistent with a size limit",
        explanation: "After every reboot, journalctl --list-boots shows only one boot, so you cannot see why the server crashed. Step 1: create a drop-in that sets persistent storage and a 1 GB cap. Step 2: restart journald. Step 3: move the current RAM journal to disk with journalctl --flush. Step 4: check the disk usage, and after the next reboot, confirm that --list-boots shows two entries.",
        code: {
          lang: "bash",
          code: "sudo mkdir -p /etc/systemd/journald.conf.d\nprintf '[Journal]\\nStorage=persistent\\nSystemMaxUse=1G\\n' \\\n  | sudo tee /etc/systemd/journald.conf.d/00-persistent.conf\nsudo systemctl restart systemd-journald\nsudo journalctl --flush\nls /var/log/journal/\njournalctl --disk-usage\njournalctl --list-boots",
        },
      },
      {
        title: "Who tried to log in, and from where?",
        explanation: "You suspect someone is guessing SSH passwords. Step 1: show today's failed password messages from the SSH service (the unit is sshd on RHEL and ssh on Ubuntu). Step 2: count attempts per source IP. Step 3: see which user names were tried. Step 4: check whether any login succeeded. Filtering by unit is more reliable than grepping text files, because it cannot pick up lines from other programs.",
        code: {
          lang: "bash",
          code: "U=sshd    # Ubuntu: U=ssh\njournalctl -u $U --since today -g 'Failed password' -o cat | head\njournalctl -u $U --since today -g 'Failed password' -o cat \\\n  | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head\njournalctl -u $U --since today -g 'Failed password' -o cat \\\n  | grep -oE 'for (invalid user )?[^ ]+' | sort | uniq -c | sort -rn | head\njournalctl -u $U --since today -g 'Accepted' -o short-iso",
        },
      },
    ],
    cheatSheet: [
      "journalctl -u NAME -f follows one service live",
      "journalctl -p err -b shows errors and worse from this boot",
      "journalctl -b -1 -e jumps to the end of the previous boot's log",
      "journalctl _UID=1001 or _COMM=sshd filters on any journal field",
      "journalctl -g 'regex' searches message text without a separate grep",
      "mkdir /var/log/journal or Storage=persistent keeps logs across reboots",
      "journalctl --vacuum-size=500M trims the journal right away",
      "logger -p user.err \"test\" writes a test message you can then find",
    ],
    quiz: [
      {
        q: "Which command shows warnings and more severe messages for the nginx unit since midnight?",
        options: ["journalctl -u nginx -p warning --since today", "journalctl nginx --level warn", "journalctl -t warning -u nginx", "journalctl -u nginx -p debug --today"],
        answer: 0,
        why: "-p warning includes warning and everything more severe, and today means since midnight.",
      },
      {
        q: "Storage=auto is set and /var/log/journal does not exist. Where is the journal kept?",
        options: ["In /var/log/messages", "On disk in /var/lib/journal", "Only in RAM under /run/log/journal, lost at reboot", "Nowhere, logging is off"],
        answer: 2,
        why: "auto writes to disk only if /var/log/journal exists; otherwise the journal is volatile.",
      },
      {
        q: "On Ubuntu, where do you find classic text logs of SSH logins and sudo use?",
        options: ["/var/log/secure", "/var/log/messages", "/var/log/sshd.log", "/var/log/auth.log"],
        answer: 3,
        why: "Ubuntu's rsyslog writes auth and authpriv messages to auth.log; RHEL uses /var/log/secure.",
      },
      {
        q: "Why are journal fields like _PID and _SYSTEMD_UNIT considered trustworthy?",
        options: ["They are encrypted", "journald adds them itself, so the logging program cannot fake them", "Only root can write logs", "They are copied from /etc/passwd"],
        answer: 1,
        why: "Fields starting with an underscore are set by journald from what the kernel tells it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the last 20 log lines of the sshd service with exact ISO timestamps, then follow it live while you log in from another terminal.",
        hint: "-n sets the count, -o short-iso the format, -f follows.",
        solution: "journalctl -u sshd -n 20 -o short-iso\njournalctl -u sshd -f\n# log in from another terminal and watch the Accepted line appear",
      },
      {
        level: "medium",
        task: "Send a test message with priority err and tag myapp, then find it in the journal using its tag and priority only.",
        hint: "logger -t sets the identifier and -p the priority; journalctl -t filters by identifier.",
        solution: "logger -t myapp -p user.err \"disk check failed on /data\"\njournalctl -t myapp -p err --since \"5 min ago\"",
      },
      {
        level: "hard",
        task: "Write an rsyslog rule that copies every message from the myapp tag into /var/log/myapp.log, and a logrotate config that keeps 7 compressed daily copies. Test both.",
        hint: "rsyslog can match on $programname; logrotate -d is a dry run, -f forces a rotation.",
        solution: "echo ':programname, isequal, \"myapp\" /var/log/myapp.log' | sudo tee /etc/rsyslog.d/30-myapp.conf\nsudo systemctl restart rsyslog\nlogger -t myapp \"hello file\"; tail -1 /var/log/myapp.log\nprintf '/var/log/myapp.log {\\n  daily\\n  rotate 7\\n  compress\\n  missingok\\n  notifempty\\n}\\n' \\\n  | sudo tee /etc/logrotate.d/myapp\nsudo logrotate -d /etc/logrotate.d/myapp\nsudo logrotate -f /etc/logrotate.d/myapp && ls /var/log/myapp.log*",
      },
    ],
    faq: [
      { q: "Is /var/log/messages gone on systems with journald?", a: "No. On RHEL, rsyslog still writes it from the journal. The journal is the main store, and the text files are a copy for tools and habits that expect them." },
      { q: "Can I read journal files from another machine or a rescue disk?", a: "Yes. Copy the files from /var/log/journal or mount the disk, then run journalctl -D /path/to/journal or --file to read them." },
      { q: "Why does journalctl show nothing for my user?", a: "Normal users only see their own messages. Use sudo, or add the user to the systemd-journal group (adm on Ubuntu also works)." },
      { q: "How long does the journal keep logs?", a: "Until it reaches its size limit, by default up to 10 percent of the file system and at most 4 GB, then the oldest files are removed. MaxRetentionSec= sets a time limit if you need one." },
    ],
  },

  "adm-systemd/boot-targets": {
    plain: [
      "When you press the power button, several programs run one after another, each handing over to the next. Firmware (BIOS or UEFI) checks the hardware and starts the boot loader. The boot loader, GRUB2, loads the Linux kernel. The kernel starts systemd, and systemd starts everything else.",
      "systemd brings the machine to a goal called a target. A server normally boots to multi-user.target: networking, services and text logins. A desktop boots to graphical.target, which adds the graphical login. Targets replaced the numbered runlevels of older systems.",
      "Sometimes you need the machine in a special state: rescue.target for repairs with minimal services, or emergency.target when even the normal file systems are broken. You can also stop the boot very early to reset a forgotten root password.",
      "These skills feel rare until the day a server will not boot. Practise them on a lab VM with a snapshot, so that on a real outage you already know every step.",
    ],
    deepDive: [
      {
        heading: "From firmware to the kernel",
        body: "On older BIOS machines the firmware runs boot code from the first sector of the disk. On UEFI machines it reads a small FAT partition called the EFI system partition, mounted at /boot/efi, and starts a boot program from it. With Secure Boot this is a signed shim that then starts GRUB2.\n\nGRUB2 loads two files from /boot: the kernel (vmlinuz) and the initramfs, a small compressed file system with the drivers needed to find the real root disk, such as for LVM, RAID or encryption. The kernel unpacks the initramfs, mounts the real root file system and starts /sbin/init, which is systemd.\n\nThe kernel command line, the arguments GRUB passes, controls a lot of this; cat /proc/cmdline shows the current one. If the initramfs lacks a driver, rebuild it with dracut -f on RHEL or update-initramfs -u on Ubuntu.",
        visual: {
          type: "compare",
          title: "Boot tooling on each family",
          columns: [
            { title: "RHEL, Rocky, Alma", points: ["Kernel entries: /boot/loader/entries", "Change arguments: grubby", "Rebuild config: grub2-mkconfig -o /boot/grub2/grub.cfg", "Rebuild initramfs: dracut -f"] },
            { title: "Ubuntu", points: ["Settings: /etc/default/grub", "Change arguments: edit GRUB_CMDLINE_LINUX", "Rebuild config: update-grub", "Rebuild initramfs: update-initramfs -u"] },
          ],
        },
      },
      {
        heading: "Targets, isolate and one-off boots",
        body: "default.target is a symlink to the target the system boots into. systemctl get-default reads it and set-default multi-user.target changes it. To switch right now, systemctl isolate multi-user.target stops everything the new target does not need, so isolating from graphical to multi-user closes the desktop.\n\nOld runlevel names still work as aliases: runlevel3.target is multi-user.target and runlevel5.target is graphical.target.\n\nTo pick a different target for one boot only, edit the kernel line in GRUB (press e), add systemd.unit=rescue.target or systemd.unit=emergency.target, and press Ctrl-X. rescue.target mounts all local file systems from /etc/fstab and starts a root shell with very few services. emergency.target mounts only the root file system, read-only, which is what you need when a bad fstab line stops the boot. Both ask for the root password.",
        visual: {
          type: "compare",
          title: "Rescue options compared",
          columns: [
            { title: "rescue.target", points: ["Local file systems mounted", "Root shell, few services", "Needs the root password", "For service or config problems"] },
            { title: "emergency.target", points: ["Only / mounted, read-only", "Almost nothing started", "Needs the root password", "For broken fstab or disks"] },
            { title: "rd.break", points: ["Stops inside the initramfs", "Real root at /sysroot, read-only", "No root password needed", "For a lost root password"] },
          ],
        },
      },
      {
        heading: "Why the rd.break root reset works",
        body: "rd.break tells the initramfs to stop and open a shell just before it hands over to the real system. At that moment the real root file system is mounted read-only at /sysroot and no password check exists yet, so anyone at the console can reach it. This is why physical and console access must be protected, for example with a GRUB password.\n\nThe steps follow from that state. mount -o remount,rw /sysroot makes it writable. chroot /sysroot makes it the root so passwd edits the right /etc/shadow. Because SELinux is not loaded yet, the new shadow file gets no proper label, so touch /.autorelabel asks for a full relabel on the next boot. That relabel can take several minutes and the machine reboots once more by itself; do not interrupt it.\n\nOn Ubuntu, the GRUB recovery mode entry offers a root shell instead; remount / read-write there before running passwd.",
      },
      {
        heading: "Changing kernel arguments for good",
        body: "Edits made with e in the GRUB menu last for one boot only. On RHEL-family systems, grubby changes the boot entries permanently. grubby --info=ALL lists every kernel and its arguments, grubby --default-kernel shows which one boots, and grubby --update-kernel=ALL --args=\"console=ttyS0\" adds an argument to every installed kernel. --remove-args removes one, and grubby --set-default picks another kernel.\n\nOn Ubuntu, edit GRUB_CMDLINE_LINUX in /etc/default/grub and run sudo update-grub. In both cases, reboot and check /proc/cmdline to confirm.\n\nAfter the change, systemd-analyze shows how long firmware, loader, kernel and user space took, and systemd-analyze critical-chain shows the chain of units that delayed reaching the default target.",
        bullets: ["grubby --update-kernel=ALL --remove-args=\"rhgb quiet\" shows boot messages", "GRUB_TIMEOUT in /etc/default/grub sets how long the menu waits", "cat /proc/cmdline shows the arguments of the running kernel"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Resetting a lost root password with rd.break",
        steps: [
          { label: "Interrupt GRUB", detail: "Press e on the kernel entry" },
          { label: "Add rd.break", detail: "End of the linux line, then Ctrl-X" },
          { label: "Make /sysroot writable", detail: "mount -o remount,rw /sysroot" },
          { label: "chroot and passwd", detail: "chroot /sysroot, then passwd root" },
          { label: "Request a relabel", detail: "touch /.autorelabel" },
          { label: "Exit twice", detail: "Boot continues and relabels" },
        ],
      },
    ],
    examples: [
      {
        title: "Recover from a typo in /etc/fstab",
        explanation: "After adding a new disk to /etc/fstab, the server stops at boot and drops into emergency mode, or hangs waiting for a device. Step 1: in GRUB, add systemd.unit=emergency.target if it does not go there on its own, and log in as root. Step 2: remount the root file system read-write. Step 3: fix or comment out the bad line. Step 4: test the whole file with mount -a and findmnt --verify before rebooting.",
        code: {
          lang: "bash",
          code: "# at the emergency shell, logged in as root\nmount -o remount,rw /\nvi /etc/fstab                 # fix the UUID or add nofail\nsystemctl daemon-reload\nfindmnt --verify\nmount -a && echo fstab OK\nsystemctl default             # continue to the default target",
        },
      },
      {
        title: "Boot to text mode and show boot messages",
        explanation: "A VM was installed with a desktop, but it should run as a server, and you want to see boot messages instead of a splash screen. Step 1: check the current default target. Step 2: set multi-user.target as the default and switch to it now. Step 3: remove rhgb and quiet from every kernel's arguments with grubby. Step 4: reboot and confirm both changes.",
        code: {
          lang: "bash",
          code: "systemctl get-default                       # graphical.target\nsudo systemctl set-default multi-user.target\nsudo systemctl isolate multi-user.target\nsudo grubby --update-kernel=ALL --remove-args=\"rhgb quiet\"\nsudo grubby --info=DEFAULT | grep args\nsudo reboot\n# after the reboot:\ncat /proc/cmdline; systemctl get-default",
        },
      },
    ],
    cheatSheet: [
      "systemctl get-default and systemctl set-default multi-user.target",
      "systemctl isolate rescue.target switches state right now",
      "Add systemd.unit=rescue.target to the kernel line for a one-off rescue boot",
      "emergency.target mounts only / read-only; remount with mount -o remount,rw /",
      "rd.break: remount,rw /sysroot, chroot /sysroot, passwd, touch /.autorelabel",
      "grubby --update-kernel=ALL --args=\"ARG\" changes kernel arguments for good",
      "cat /proc/cmdline shows the arguments the running kernel booted with",
      "systemd-analyze critical-chain shows what slowed the boot",
    ],
    quiz: [
      {
        q: "A bad line in /etc/fstab stops the boot. Which target is the best fit for fixing it?",
        options: ["graphical.target", "multi-user.target", "emergency.target", "network-online.target"],
        answer: 2,
        why: "emergency.target mounts only the root file system, so the broken fstab entry is not tried.",
      },
      {
        q: "During an rd.break reset, why do you run chroot /sysroot before passwd?",
        options: ["So passwd changes the real system's /etc/shadow, not the initramfs one", "To load SELinux", "To mount /boot", "To start the network"],
        answer: 0,
        why: "Without chroot, passwd would edit the temporary initramfs environment.",
      },
      {
        q: "What does systemctl isolate multi-user.target do on a desktop session?",
        options: ["Only changes the default for the next boot", "Reboots the machine", "Opens a rescue shell", "Switches now, stopping units the target does not need, including the graphical login"],
        answer: 3,
        why: "isolate starts the target's units and stops everything else, unlike set-default.",
      },
      {
        q: "You add an argument with e in the GRUB menu and boot. What happens at the next reboot?",
        options: ["The argument is kept forever", "The argument is gone, because menu edits are one-time", "GRUB asks whether to keep it", "The kernel is rebuilt"],
        answer: 1,
        why: "Menu edits are not saved; use grubby or /etc/default/grub for permanent changes.",
      },
      {
        q: "Which file does the initramfs contain that the root file system cannot provide by itself at boot?",
        options: ["/etc/passwd", "The GRUB menu", "Drivers and tools needed to find and mount the root disk", "The default target"],
        answer: 2,
        why: "The kernel needs those modules, for example for LVM or RAID, before the real root is reachable.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the current default target, the list of available target units, and the kernel arguments of the running kernel.",
        hint: "systemctl can list units by type; the kernel arguments are in /proc.",
        solution: "systemctl get-default\nsystemctl list-units --type=target --all\ncat /proc/cmdline",
      },
      {
        level: "medium",
        task: "On a lab VM with a snapshot, boot once into rescue.target from the GRUB menu, check which file systems are mounted, and continue to the normal target without rebooting.",
        hint: "Add systemd.unit=rescue.target to the linux line; systemctl default leaves rescue mode.",
        solution: "# GRUB: press e, add systemd.unit=rescue.target to the linux line, Ctrl-X\n# enter the root password at the prompt\nfindmnt -t xfs,ext4\nsystemctl list-units --type=service --state=running | head\nsystemctl default",
      },
      {
        level: "hard",
        task: "On a lab VM (take a snapshot first), reset the root password using rd.break, then confirm after boot that the SELinux label on /etc/shadow is correct.",
        hint: "Follow remount, chroot, passwd, autorelabel; afterwards check the label with ls -Z.",
        solution: "# GRUB: e, append rd.break to the linux line, Ctrl-X\nmount -o remount,rw /sysroot\nchroot /sysroot\npasswd root\ntouch /.autorelabel\nexit\nexit\n# wait for the relabel and the extra reboot, then log in as root:\nls -Z /etc/shadow        # system_u:object_r:shadow_t:s0",
      },
    ],
    faq: [
      { q: "What replaced runlevels?", a: "systemd targets. multi-user.target is roughly runlevel 3 and graphical.target is runlevel 5, and the runlevelN.target names still exist as aliases." },
      { q: "Is it a security hole that rd.break needs no password?", a: "It requires console access, which usually means full control anyway. Protect it with a GRUB password, disk encryption and physical or hypervisor console security." },
      { q: "Why does the system reboot again after touch /.autorelabel?", a: "On that boot SELinux relabels every file, which can take several minutes, and then reboots once more so everything starts with correct labels." },
      { q: "How do I see the GRUB menu if it is hidden?", a: "Hold Shift during boot on BIOS systems or press Esc repeatedly on UEFI systems. You can also set a longer GRUB_TIMEOUT in /etc/default/grub." },
    ],
  },
};

export default extra;
