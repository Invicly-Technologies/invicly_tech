import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-automation/cron-at": {
    plain: [
      "Servers have chores: rotate logs, take backups, clean temp files, send reports. Doing them by hand is slow and easy to forget. cron is a background service that runs commands for you on a fixed schedule, such as every night at 02:30 or every 15 minutes.",
      "Each scheduled job is one line in a table called a crontab. The line starts with five time fields (minute, hour, day of month, month, day of week) and ends with the command. A star in a field means every value.",
      "at is cron's little sibling for one-time jobs. You tell it a time, such as 23:00 or now + 2 hours, and type the commands. It runs them once and forgets them. That is handy for a restart after business hours.",
      "The big surprise for beginners: cron runs jobs with a tiny environment. Your PATH, aliases and shell settings are not there. Always use full paths, and send the output to a log file so you can see what happened.",
    ],
    deepDive: [
      {
        heading: "Reading the time fields like a pro",
        body: "Minute is 0 to 59, hour 0 to 23, day of month 1 to 31, month 1 to 12 (or jan to dec), day of week 0 to 7, where both 0 and 7 mean Sunday. Each field takes lists (1,15), ranges (9-17) and steps (*/10 or 9-17/2).\n\nOne rule catches many people. If you restrict both day of month and day of week, cron runs the job when either one matches, not both. So 0 9 1 * 1 runs at 09:00 on the 1st of every month and also on every Monday. For the first Monday of a month, schedule every Monday and test the date inside the command.\n\nShortcuts exist too: @reboot, @hourly, @daily, @weekly, @monthly and @yearly.",
        bullets: [
          "0 */4 * * *: every 4 hours on the hour",
          "*/5 9-17 * * 1-5: every 5 minutes in office hours on weekdays",
          "0 0 1 1 *: once a year at midnight on 1 January",
        ],
      },
      {
        heading: "Where cron jobs live",
        body: "Personal jobs go in your crontab, edited with crontab -e and stored under /var/spool/cron. They run as you and have no user field. System jobs go in /etc/crontab or files in /etc/cron.d/, and those lines have an extra user field after the time, such as root.\n\nThe folders /etc/cron.hourly, cron.daily, cron.weekly and cron.monthly hold plain scripts that run at those intervals. On RHEL, anacron runs the daily, weekly and monthly ones, so they still run after a machine was switched off at the scheduled time. On Debian and Ubuntu, run-parts runs these folders and silently skips files whose names contain a dot, so backup.sh is ignored while backup works.",
        visual: {
          type: "tree",
          title: "Places to put a scheduled job",
          root: "cron jobs",
          children: [
            { label: "crontab -e", children: ["Per user, no user field", "Stored in /var/spool/cron"] },
            { label: "/etc/cron.d/NAME", children: ["System jobs, user field required", "Best for packages and automation"] },
            { label: "/etc/crontab", children: ["System table, user field required"] },
            { label: "/etc/cron.daily/ etc.", children: ["Executable scripts, no schedule line", "anacron on RHEL; run-parts on Debian"] },
          ],
        },
      },
      {
        heading: "The cron environment and output",
        body: "cron starts each job with /bin/sh, a minimal PATH (usually /usr/bin:/bin), and your HOME and LOGNAME. Nothing from .bashrc is loaded. You can set variables at the top of a crontab, such as PATH=/usr/local/bin:/usr/bin:/bin, SHELL=/bin/bash and MAILTO=ops@example.com.\n\nBy default, any output is mailed to the job owner, which on most modern servers means it is lost because no mail system is set up. Redirect it on purpose: >> /var/log/job.log 2>&1, or pipe it to logger. Also remember that % is special in a crontab line: cron turns it into a newline. Write date +\\%F, or put the command in a script.",
        bullets: [
          "Logs of cron itself: /var/log/cron on RHEL, journalctl -u cron on Ubuntu",
          "The service is crond on RHEL and cron on Ubuntu",
          "cron.allow and cron.deny in /etc control who may use crontab",
        ],
      },
      {
        heading: "One-off jobs with at and batch",
        body: "at reads commands from standard input or from a file with -f, and runs them once. It understands times like 16:30, 4pm tomorrow, now + 30 minutes, noon and midnight. The atd service must be running; on RHEL install the at package and run systemctl enable --now atd.\n\nUnlike cron, at saves your current working directory and most of your environment with the job, so scripts often behave more like they do in your shell. atq lists waiting jobs, at -c NUMBER prints exactly what a job will run, and atrm NUMBER cancels it. batch is like at, but it waits until the system load is low, which suits heavy one-off tasks.",
      },
      {
        heading: "Making cron jobs safe",
        body: "Three problems show up in real life. First, overlap: if a backup that runs every hour takes 70 minutes, two copies run at once and fight. Wrap the command in flock -n /run/lock/backup.lock so a second copy simply exits. Second, silent failure: nobody notices a job that stopped working months ago. Log the exit status, or ping a monitoring URL only on success. Third, accidents: crontab -r deletes your whole crontab with no question, and r sits next to e on the keyboard. Keep a copy with crontab -l > ~/crontab.bak.\n\nAlso watch time zones. cron uses the system time zone, and jobs between 01:00 and 03:00 may run twice or not at all on daylight saving days.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What happens at 02:30",
        steps: [
          { label: "crond wakes each minute", detail: "Reads crontabs that changed" },
          { label: "Time matches a line", detail: "30 2 * * * fits 02:30" },
          { label: "Fork as the job owner", detail: "/bin/sh, minimal PATH" },
          { label: "Run the command", detail: "% becomes a newline" },
          { label: "Handle output", detail: "Mailed to owner unless redirected" },
        ],
      },
    ],
    examples: [
      {
        title: "A nightly database dump that does not overlap",
        explanation: "You want a dump at 01:15 every night, kept for 7 days. Step 1: write the job in /etc/cron.d so it is part of the system config and runs as the postgres user. Step 2: set PATH in the file. Step 3: use flock so a slow run never overlaps the next one. Step 4: escape % in the date. Step 5: a second line at 01:45 deletes dumps older than 7 days. Check /var/log/dump.log the next morning.",
        code: {
          lang: "bash",
          code: "sudo tee /etc/cron.d/pgdump <<'EOF'\nPATH=/usr/local/bin:/usr/bin:/bin\n15 1 * * * postgres flock -n /tmp/pgdump.lock pg_dumpall -f /backup/pg-$(date +\\%F).sql >> /var/log/dump.log 2>&1\n45 1 * * * postgres find /backup -name 'pg-*.sql' -mtime +7 -delete\nEOF\nsudo chmod 644 /etc/cron.d/pgdump\nsudo touch /var/log/dump.log && sudo chown postgres /var/log/dump.log",
        },
      },
      {
        title: "Schedule a restart after office hours with at",
        explanation: "A config change needs an Apache restart, but not during the day. Step 1: queue the job for 22:00 with at. Step 2: check it is in the queue and read exactly what it will run. Step 3: if plans change, remove it. Step 4: the next day, look in the journal to confirm the restart happened.",
        code: {
          lang: "bash",
          code: "echo 'systemctl restart httpd && logger -t atjob \"httpd restarted\"' | sudo at 22:00\nsudo atq\n# 7   Tue Nov 10 22:00:00 2026 a root\nsudo at -c 7 | tail -3\n# sudo atrm 7      # to cancel\njournalctl -t atjob --since yesterday",
        },
      },
    ],
    cheatSheet: [
      "Fields: minute hour day-of-month month day-of-week, then the command",
      "Day of month and day of week both set means either may match",
      "crontab -l lists, -e edits, -r deletes everything without asking",
      "/etc/cron.d files need a user field: 0 3 * * * root /usr/local/bin/job",
      "Escape % as \\% inside crontab lines",
      "flock -n /run/lock/job.lock cmd stops overlapping runs",
      "at now + 1 hour, atq to list, at -c N to inspect, atrm N to cancel",
      "Debian run-parts skips script names with dots in /etc/cron.daily",
    ],
    quiz: [
      {
        q: "What does 0 9 1 * 1 run?",
        options: ["Only on the 1st if it is a Monday", "At 09:00 on the 1st of each month and every Monday", "At 01:09 every Monday", "Never, the fields conflict"],
        answer: 1,
        why: "When both day fields are restricted, cron runs if either one matches.",
      },
      {
        q: "A job works in your shell but fails in cron with command not found. What is the most likely cause?",
        options: ["cron runs jobs as root", "The crontab file has wrong permissions", "cron uses a minimal PATH and does not read your shell profile", "cron cannot run scripts"],
        answer: 2,
        why: "cron starts jobs with /bin/sh and a short PATH, so use full paths or set PATH.",
      },
      {
        q: "Which line is valid in /etc/cron.d/cleanup?",
        options: ["0 4 * * * root /usr/local/bin/cleanup", "0 4 * * * /usr/local/bin/cleanup", "@daily: /usr/local/bin/cleanup", "cleanup 0 4 * * *"],
        answer: 0,
        why: "Files in /etc/cron.d need a user field between the time and the command.",
      },
      {
        q: "Your crontab line contains date +%F and the job breaks. Why?",
        options: ["date is not in PATH", "cron does not support date", "%F is a bash-only feature", "cron turns an unescaped % into a newline"],
        answer: 3,
        why: "Write \\% in crontab lines or move the command into a script.",
      },
      {
        q: "Which command shows the full script an at job will run?",
        options: ["atq -v", "at -c JOBNUMBER", "atrm -l", "crontab -l"],
        answer: 1,
        why: "at -c prints the saved environment and commands of the job.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a personal cron job that writes the date and uptime to ~/uptime.log every 10 minutes. Confirm it ran.",
        hint: "Use */10 in the minute field and full paths.",
        solution: "crontab -e\n# add:\n*/10 * * * * /usr/bin/uptime >> $HOME/uptime.log 2>&1\ncrontab -l\n# wait 10 minutes, then:\ntail ~/uptime.log",
      },
      {
        level: "medium",
        task: "As root, create a cron job for user natasha that runs /usr/bin/logger \"hello\" at 14:23 every day, and verify it from the logs.",
        hint: "crontab -u edits another user's table. logger writes to the journal.",
        solution: "sudo crontab -u natasha -e\n# add:\n23 14 * * * /usr/bin/logger \"hello\"\nsudo crontab -u natasha -l\n# after 14:23:\njournalctl --since today | grep hello",
      },
      {
        level: "hard",
        task: "Run a job at 02:00 on the first Monday of each month only.",
        hint: "Restrict the day of week in cron, and test the day of month inside the command, remembering to escape %.",
        solution: "sudo tee /etc/cron.d/first-monday <<'EOF'\n0 2 * * 1 root [ \"$(date +\\%d)\" -le 07 ] && /usr/local/bin/monthly-report\nEOF\n# A Monday on day 1 to 7 is always the first Monday.\n# Do not put 1-7 in the day-of-month field: cron would OR it with Monday.",
      },
    ],
    faq: [
      { q: "Why is my cron job not running?", a: "Check that crond (RHEL) or cron (Ubuntu) is active, look in /var/log/cron or journalctl -u cron, and check the command with full paths. Most failures come from PATH, permissions or an unescaped %." },
      { q: "What is the difference between cron and anacron?", a: "cron runs at exact times and skips jobs when the machine is off. anacron runs daily, weekly and monthly jobs once the machine is back up, so laptops and VMs that sleep still get them." },
      { q: "How do I run a cron job every 30 seconds?", a: "cron's smallest step is one minute. Use a systemd timer with OnCalendar=*:*:0/30, or two cron lines where one starts with sleep 30." },
      { q: "Should I use cron or systemd timers?", a: "Both work. Timers give better logging, catch-up after downtime and no overlap, while cron is simpler and found everywhere. On the RHCSA you may be asked for either." },
    ],
  },

  "adm-automation/systemd-timers": {
    plain: [
      "A systemd timer is an alarm clock for a service. Instead of one cron line, you write two small files. The service file says what to run. The timer file says when to run it.",
      "That looks like more work, but you get a lot for free. Every run is logged in the journal under the service name. You can see when it ran last, whether it failed, and when it runs next, all with one command.",
      "Timers can also catch up. If the server was off at 02:30, a timer with Persistent=true runs the job as soon as the machine boots. And a timer never starts a second copy while the first one is still running.",
      "You can schedule by the calendar, like every weekday at 06:00, or relative to an event, like 10 minutes after boot or one hour after the job last finished.",
    ],
    deepDive: [
      {
        heading: "The OnCalendar language",
        body: "OnCalendar uses the form DayOfWeek Year-Month-Day Hour:Minute:Second, and any part may be a star or left out. *-*-* 02:30:00 means every day at 02:30. Mon..Fri 06:00 means weekdays at 06:00. *:0/15 means every 15 minutes. Words work too: minutely, hourly, daily, weekly, monthly, yearly. daily is midnight, and weekly is Monday at 00:00.\n\nYou can list several values with commas, such as Mon,Wed,Fri 18:00, and add a time zone at the end, such as 02:30 Europe/London. Never guess: systemd-analyze calendar prints the normalized form and the next time it will fire, and --iterations=5 shows the next five.",
        bullets: [
          "systemd-analyze calendar 'Mon..Fri 06:00' --iterations=3",
          "*-*-01 00:00:00 runs on the first of each month",
          "Several OnCalendar= lines in one timer are all used",
        ],
      },
      {
        heading: "Monotonic timers: relative to an event",
        body: "Instead of a wall-clock time, a timer can count from an event. OnBootSec=10min fires 10 minutes after boot. OnUnitActiveSec=1h fires one hour after the service last started, and OnUnitInactiveSec=1h one hour after it last finished, which guarantees a gap between runs no matter how long each takes. Times accept units like 30s, 5min, 2h and 1d.\n\nA common pair is OnBootSec=5min plus OnUnitActiveSec=1h: first run shortly after boot, then hourly. Persistent=true only affects OnCalendar timers, because monotonic timers already count from boot.",
        visual: {
          type: "compare",
          title: "Calendar vs monotonic timers",
          columns: [
            { title: "OnCalendar", points: ["Fixed clock times", "Daily at 02:30, weekdays at 06:00", "Persistent=true catches missed runs", "Follows the time zone"] },
            { title: "OnBootSec / OnUnitActiveSec", points: ["Counted from an event", "10 min after boot, then every hour", "No wall clock needed", "Spacing stays even after downtime"] },
          ],
        },
      },
      {
        heading: "Accuracy, random delay and missed runs",
        body: "By default systemd may start a timer up to one minute late (AccuracySec=1min) so it can group wake-ups and save power. If you need the exact second, set AccuracySec=1s. RandomizedDelaySec=30min adds a random wait, so 500 servers do not hit the backup server at the same moment.\n\nPersistent=true stores the last run time on disk, under /var/lib/systemd/timers. At boot, if a scheduled time passed while the machine was off, the service runs right away. Without it, a missed run is simply skipped. And if the service is still running when the timer fires again, systemd does not start a second copy, so you never need lock files.",
        bullets: [
          "AccuracySec=1s for exact timing",
          "RandomizedDelaySec spreads load across a fleet",
          "Unit=other.service makes a timer start a differently named unit",
        ],
      },
      {
        heading: "Writing the service part well",
        body: "The service is a normal unit with Type=oneshot, meaning it runs to the end and then exits. It needs no [Install] section, because the timer starts it. Put real settings here: User=backup to drop root, After=network-online.target with Wants=network-online.target if the job needs the network, Nice=10 and IOSchedulingClass=idle to stay out of the way, and OnFailure=notify@%n.service to trigger an alert unit when it fails.\n\nTest the service alone with systemctl start backup.service and read journalctl -u backup.service before you enable the timer. Finally, enable the timer, not the service: systemctl enable --now backup.timer.",
      },
      {
        heading: "User timers and quick transient timers",
        body: "Normal users can have timers too. Put the files in ~/.config/systemd/user/ and use systemctl --user daemon-reload and systemctl --user enable --now NAME.timer. They run only while the user is logged in, unless an admin enables lingering with loginctl enable-linger USER.\n\nFor a one-off job, systemd-run can create a timer on the fly without any files. sudo systemd-run --on-active=30min /usr/bin/systemctl restart httpd runs the command in 30 minutes, and --on-calendar='2026-11-11 22:00' runs it at a set time. This is a modern alternative to at, and the run is logged in the journal like any unit.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Migrating a cron job to a timer",
        steps: [
          { label: "Read the cron line", detail: "30 2 * * 1-5 /usr/local/bin/backup.sh" },
          { label: "Write backup.service", detail: "Type=oneshot, ExecStart= the script" },
          { label: "Write backup.timer", detail: "OnCalendar=Mon..Fri 02:30" },
          { label: "Check the schedule", detail: "systemd-analyze calendar" },
          { label: "Enable the timer", detail: "systemctl enable --now backup.timer" },
          { label: "Remove the cron line", detail: "So the job does not run twice" },
        ],
      },
    ],
    examples: [
      {
        title: "Clean old upload files every 6 hours, 10 minutes after boot first",
        explanation: "A web app leaves temp uploads in /srv/app/tmp. Step 1: write a oneshot service that runs as the app user with low priority. Step 2: write a timer using monotonic settings: first run 10 minutes after boot, then 6 hours after each run. Step 3: reload, enable the timer, then list it to see the next run. Step 4: trigger the service once by hand and read its log.",
        code: {
          lang: "ini",
          code: "# /etc/systemd/system/tmpclean.service\n[Service]\nType=oneshot\nUser=app\nNice=10\nExecStart=/usr/bin/find /srv/app/tmp -type f -mmin +360 -delete\n\n# /etc/systemd/system/tmpclean.timer\n[Timer]\nOnBootSec=10min\nOnUnitActiveSec=6h\n\n[Install]\nWantedBy=timers.target\n# systemctl daemon-reload; systemctl enable --now tmpclean.timer\n# systemctl start tmpclean.service; journalctl -u tmpclean.service",
        },
      },
      {
        title: "Debug a timer that never seems to fire",
        explanation: "You wrote report.timer, but no report appears. Step 1: list timers; if NEXT shows n/a, the timer is not active or the expression never matches. Step 2: check the expression with systemd-analyze calendar. Step 3: confirm the timer is enabled and started, and that you ran daemon-reload after editing. Step 4: check the service log; the timer may be fine and the script failing.",
        code: {
          lang: "bash",
          code: "systemctl list-timers --all | grep report\nsystemd-analyze calendar 'Mon *-*-* 07:00'\nsystemctl is-enabled report.timer; systemctl is-active report.timer\nsudo systemctl daemon-reload && sudo systemctl enable --now report.timer\nsystemctl status report.service\njournalctl -u report.service -n 20",
        },
      },
    ],
    cheatSheet: [
      "foo.timer starts foo.service unless Unit= says otherwise",
      "Enable the timer: systemctl enable --now foo.timer",
      "OnCalendar=Mon..Fri 06:00, *:0/15 (every 15 min), daily, weekly",
      "systemd-analyze calendar 'EXPR' --iterations=5 shows the next run times",
      "systemctl list-timers --all shows LAST and NEXT for every timer",
      "Persistent=true runs a missed OnCalendar job at boot",
      "AccuracySec defaults to 1min; set 1s when timing must be exact",
      "systemd-run --on-active=30min CMD is a one-off timer with no files",
    ],
    quiz: [
      {
        q: "Which unit should you enable so a nightly job runs?",
        options: ["The .service unit", "Both units with --now", "The .timer unit", "timers.target"],
        answer: 2,
        why: "The timer starts the service; the oneshot service itself needs no [Install] section.",
      },
      {
        q: "What does OnCalendar=*:0/15 mean?",
        options: ["Every 15 minutes", "At 00:15 each day", "Every 15 seconds", "At minute 15 of each hour"],
        answer: 0,
        why: "The minute field 0/15 starts at 0 and repeats every 15 minutes, in every hour.",
      },
      {
        q: "A backup timer fires every hour, but one run takes 90 minutes. What happens at the next tick?",
        options: ["A second copy starts in parallel", "The running copy is killed and restarted", "The timer is disabled", "No new copy starts while the service is still active"],
        answer: 3,
        why: "Starting a unit that is already active does nothing, so runs never overlap.",
      },
      {
        q: "You need the job exactly on the second, but it starts up to a minute late. Which setting fixes it?",
        options: ["Persistent=true", "AccuracySec=1s", "RandomizedDelaySec=0", "OnBootSec=0"],
        answer: 1,
        why: "AccuracySec defaults to one minute so systemd can batch wake-ups.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List all timers on your machine and find which one runs next and which unit it activates.",
        hint: "systemctl has a dedicated list command for timers.",
        solution: "systemctl list-timers --all\n# columns: NEXT, LEFT, LAST, PASSED, UNIT, ACTIVATES\n# e.g. logrotate.timer activates logrotate.service",
      },
      {
        level: "medium",
        task: "Convert this cron line into a timer and service: 30 2 * * 1-5 /usr/local/bin/backup.sh. Make it catch up after downtime.",
        hint: "Day names with .. form a range in OnCalendar.",
        solution: "printf '[Service]\\nType=oneshot\\nExecStart=/usr/local/bin/backup.sh\\n' | sudo tee /etc/systemd/system/backup.service\nprintf '[Timer]\\nOnCalendar=Mon..Fri 02:30\\nPersistent=true\\n\\n[Install]\\nWantedBy=timers.target\\n' | sudo tee /etc/systemd/system/backup.timer\nsystemd-analyze calendar 'Mon..Fri 02:30'\nsudo systemctl daemon-reload\nsudo systemctl enable --now backup.timer\nsystemctl list-timers backup.timer",
      },
      {
        level: "hard",
        task: "As a normal user, create a timer that logs the disk usage of your home every 30 minutes and keeps running after you log out.",
        hint: "User units live in ~/.config/systemd/user; lingering keeps the user manager alive.",
        solution: "mkdir -p ~/.config/systemd/user\nprintf '[Service]\\nType=oneshot\\nExecStart=/bin/sh -c \"du -sh %%h | logger -t homesize\"\\n' > ~/.config/systemd/user/homesize.service\nprintf '[Timer]\\nOnCalendar=*:0/30\\n\\n[Install]\\nWantedBy=timers.target\\n' > ~/.config/systemd/user/homesize.timer\nsystemctl --user daemon-reload\nsystemctl --user enable --now homesize.timer\nsudo loginctl enable-linger \"$USER\"\njournalctl --user -t homesize   # or: journalctl -t homesize",
      },
    ],
    faq: [
      { q: "Are systemd timers better than cron?", a: "They give journal logging, catch-up with Persistent=true, no overlapping runs and service settings like User= and resource limits. cron is shorter to write. Many teams use timers for new jobs and keep old cron jobs until they are migrated." },
      { q: "How do I run a timer job right now for testing?", a: "Start the service directly with systemctl start NAME.service. The timer's schedule is not affected." },
      { q: "Why does my timer show NEXT as n/a?", a: "The timer is not started, the expression never matches, or you forgot systemctl daemon-reload after editing. Check with systemctl status NAME.timer and systemd-analyze calendar." },
      { q: "Can a timer send me email on failure like cron does?", a: "Not by itself. Add OnFailure= to the service pointing to a unit that sends an alert, or have the script report its own errors." },
    ],
  },

  "adm-automation/bash-scripting": {
    plain: [
      "A bash script is a text file full of the same commands you type at the prompt, plus a little logic: if this, do that; for every file, do something. Once a task works as a script, anyone can run it the same way, every time.",
      "The first line, the shebang, tells Linux which program reads the file, such as #!/usr/bin/env bash. Make the file executable with chmod +x and run it with ./script.sh. Every command returns a number when it ends, called the exit status: 0 means success and anything else means failure.",
      "Scripts get input through arguments. In ./backup.sh /srv 7, $1 is /srv and $2 is 7. Variables hold text, and you should almost always put double quotes around them, as in \"$file\", so names with spaces do not break into pieces.",
      "Scripts fail in quiet ways unless you ask bash to be strict. set -euo pipefail makes the script stop at the first error instead of carrying on and doing damage. Small functions with clear names make long scripts easy to read and test.",
    ],
    deepDive: [
      {
        heading: "What set -euo pipefail really does, and where it does not",
        body: "-e exits when a command fails. -u treats an unset variable as an error, so a typo like $fiel stops the script instead of becoming empty text. -o pipefail makes a pipeline fail if any part fails, not just the last command.\n\nBut -e has blind spots. It ignores failures inside an if or while condition, in any command before && or ||, and in a function called from such a place. local out=$(cmd) also hides the failure, because local itself succeeds; write local out, then out=$(cmd) on the next line. Treat strict mode as a safety net, not a replacement for checking important commands yourself.",
        bullets: [
          "${VAR:-default} gives a default and keeps -u happy",
          "cmd || true lets a command fail on purpose",
          "bash -n script.sh checks syntax; bash -x script.sh traces each line",
        ],
      },
      {
        heading: "Quoting and word splitting",
        body: "When bash expands an unquoted variable, it splits the result on spaces, tabs and newlines and then expands wildcards. So if file='my report.txt', rm $file tries to remove my and report.txt. rm \"$file\" removes the one real file. The same goes for $(command): quote it.\n\n\"$@\" expands to all arguments, each kept as one separate word, which is what you want when passing arguments on. $* joins them into one string. Inside [[ ]] bash does not split words, which is one reason to prefer [[ ]] over the older [ ]. Single quotes keep everything literal, so '$HOME' prints $HOME, while double quotes still expand variables.",
        visual: {
          type: "flow",
          title: "How bash expands a command line",
          steps: [
            { label: "Brace expansion", detail: "file{1,2} becomes file1 file2" },
            { label: "Variables and $( )", detail: "$file and $(date) are replaced" },
            { label: "Word splitting", detail: "Unquoted results split on spaces" },
            { label: "Wildcards", detail: "Unquoted *.log matches file names" },
            { label: "Quote removal, then run", detail: "Quotes vanish, the command starts" },
          ],
        },
      },
      {
        heading: "Tests, case and arithmetic",
        body: "[[ ]] tests things. Files: -f regular file, -d directory, -e exists, -r readable, -s not empty. Strings: == and != (the right side can be a pattern, such as [[ $f == *.log ]]), -z empty, -n not empty, and =~ for regular expressions. Numbers inside [[ ]] use -eq, -ne, -lt, -le, -gt and -ge.\n\nFor maths, (( )) is clearer: (( count > 5 )) tests, and total=$(( a + b )) calculates. Bash only does whole numbers. case is the clean way to handle many choices, such as start, stop and status in one script. Each branch ends with ;; and *) catches everything else.",
        bullets: [
          "[[ -f $cfg ]] || { echo \"missing $cfg\" >&2; exit 1; }",
          "(( $# >= 1 )) || usage",
          "case $1 in start) ... ;; stop) ... ;; *) usage ;; esac",
        ],
      },
      {
        heading: "Exit codes, traps and temp files",
        body: "exit 0 means success. Use small numbers for your own errors and document them. Some numbers are reserved by the shell: 126 means found but not executable, 127 means command not found, and 128 plus N means killed by signal N, so 130 is Ctrl+C. Functions return a status with return, from 0 to 255; they hand back data by printing it.\n\ntrap runs code when the script exits or gets a signal. The pattern tmp=$(mktemp -d); trap 'rm -rf \"$tmp\"' EXIT cleans up temp files even when the script fails halfway. mktemp creates unique names, which avoids clashes and attacks through predictable paths in /tmp.",
      },
      {
        heading: "Options with getopts and safe loops",
        body: "For flags like -v or -d DAYS, use the built-in getopts. while getopts 'vd:' opt loops over the options; a colon after a letter means it takes a value, found in $OPTARG. After the loop, shift $((OPTIND - 1)) leaves only the normal arguments.\n\nFor loops, use globs for files: for f in /var/log/*.log; do ... done. If nothing matches, the pattern stays as literal text, so test with [[ -e $f ]] || continue or turn on shopt -s nullglob. For lines of text, use while IFS= read -r line; do ... done < file. IFS= keeps leading spaces, and -r keeps backslashes. Never loop over $(ls).",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Special variables you use daily",
        root: "Bash variables",
        children: [
          { label: "Arguments", children: ["$0 script name", "$1 $2 ... positional", "$# count", "\"$@\" all, kept separate"] },
          { label: "Status", children: ["$? last exit status", "$$ this script's PID", "$! last background PID"] },
          { label: "Expansion tricks", children: ["${v:-def} default", "${v:?msg} fail if unset", "${f%.log} strip suffix", "${p##*/} file name only"] },
        ],
      },
    ],
    examples: [
      {
        title: "A service helper with case and getopts",
        explanation: "You want one command, svc, that checks, restarts or tails logs of any service, with an optional -n for the number of log lines. Step 1: parse -n with getopts and set a default. Step 2: shift the options away so $1 is the action and $2 the service. Step 3: validate with a usage function. Step 4: use case to pick the action. Each branch returns the status of systemctl, so callers can test it.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\nusage() { echo \"usage: ${0##*/} [-n LINES] status|restart|logs SERVICE\" >&2; exit 2; }\nlines=20\nwhile getopts 'n:' opt; do\n  case $opt in n) lines=$OPTARG ;; *) usage ;; esac\ndone\nshift $((OPTIND - 1))\n(( $# == 2 )) || usage\naction=$1; svc=$2\ncase $action in\n  status)  systemctl status --no-pager \"$svc\" ;;\n  restart) sudo systemctl restart \"$svc\" && echo \"restarted $svc\" ;;\n  logs)    journalctl -u \"$svc\" -n \"$lines\" --no-pager ;;\n  *)       usage ;;\nesac",
        },
      },
      {
        title: "Safe work in a temp folder",
        explanation: "A script downloads a tarball, checks it and unpacks it into /opt/app. If any step fails, nothing half-done should be left behind. Step 1: create a private temp folder with mktemp -d. Step 2: set a trap to delete it on any exit. Step 3: download and verify the checksum; with set -e a mismatch stops the script, and the trap still cleans up. Step 4: only after all checks pass, move the result into place.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\nurl=${1:?usage: $0 URL SHA256}\nsum=${2:?usage: $0 URL SHA256}\ntmp=$(mktemp -d)\ntrap 'rm -rf \"$tmp\"' EXIT\ncurl -fsSL -o \"$tmp/app.tgz\" \"$url\"\necho \"$sum  $tmp/app.tgz\" | sha256sum -c -\nmkdir \"$tmp/new\" && tar -xzf \"$tmp/app.tgz\" -C \"$tmp/new\"\nsudo rm -rf /opt/app.old\n[[ -d /opt/app ]] && sudo mv /opt/app /opt/app.old\nsudo mv \"$tmp/new\" /opt/app\necho \"installed to /opt/app\"",
        },
      },
    ],
    cheatSheet: [
      "Start scripts with #!/usr/bin/env bash and set -euo pipefail",
      "Quote everything: \"$var\", \"$(cmd)\", \"$@\"",
      "[[ -f $f ]] file, [[ -z $s ]] empty, (( n > 5 )) numbers",
      "${var:-default} fallback, ${var:?message} required, ${f%.txt} strip suffix",
      "while IFS= read -r line; do ...; done < file reads lines safely",
      "tmp=$(mktemp -d); trap 'rm -rf \"$tmp\"' EXIT cleans up on any exit",
      "Exit 127 = command not found, 126 = not executable, 130 = Ctrl+C",
      "bash -n checks syntax; bash -x traces execution",
    ],
    quiz: [
      {
        q: "file='a b.txt'. What does rm $file try to delete?",
        options: ["The file a b.txt", "Two files: a and b.txt", "Nothing, it errors on the space", "Every .txt file"],
        answer: 1,
        why: "Unquoted expansions are split on spaces; rm \"$file\" removes the one real file.",
      },
      {
        q: "With set -e, which failing command does NOT stop the script?",
        options: ["A plain cp of a missing file", "false on its own line", "grep -q x file inside an if condition", "A failing command in a pipeline with pipefail"],
        answer: 2,
        why: "set -e ignores failures in if and while conditions and before && or ||.",
      },
      {
        q: "A script exits with status 127. What does that mean?",
        options: ["A command was not found", "It was killed by Ctrl+C", "The file was not executable", "It succeeded with warnings"],
        answer: 0,
        why: "127 is the shell's code for command not found; 126 means not executable.",
      },
      {
        q: "Which expression gives just the file name from p=/var/log/app.log?",
        options: ["${p%/*}", "${p#*/}", "${p:-app.log}", "${p##*/}"],
        answer: 3,
        why: "## removes the longest match of */ from the front, leaving app.log.",
      },
      {
        q: "Why write local out on one line and out=$(cmd) on the next?",
        options: ["local cannot take values", "So set -e sees a failure of cmd", "It runs faster", "To make out global"],
        answer: 1,
        why: "local out=$(cmd) returns local's own success status, hiding cmd's failure.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a script that takes a user name as its only argument and prints whether that user exists. Exit with 0 if yes and 1 if not.",
        hint: "id USER returns 0 when the user exists. Check $# first.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\n(( $# == 1 )) || { echo \"usage: $0 USER\" >&2; exit 2; }\nif id \"$1\" &>/dev/null; then\n  echo \"$1 exists\"\nelse\n  echo \"$1 not found\"; exit 1\nfi",
      },
      {
        level: "medium",
        task: "Write a script that renames every .jpeg file in a folder to .jpg, works with spaces in names, and does nothing if there are no matches.",
        hint: "Use a glob, shopt -s nullglob, and ${f%.jpeg}.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\ndir=${1:-.}\nshopt -s nullglob\nfor f in \"$dir\"/*.jpeg; do\n  mv -n -- \"$f\" \"${f%.jpeg}.jpg\"\n  echo \"renamed: $f\"\ndone",
      },
      {
        level: "hard",
        task: "Write a function retry N CMD... that runs a command up to N times with a 2-second pause, returning 0 on the first success and the last exit code on failure.",
        hint: "Use \"$@\" after shifting N off, and capture $? right away.",
        solution: "retry() {\n  local tries=$1 n=1 rc=0; shift\n  until \"$@\"; do\n    rc=$?\n    (( n >= tries )) && return \"$rc\"\n    echo \"attempt $n failed (rc=$rc), retrying\" >&2\n    n=$((n + 1)); sleep 2\n  done\n}\nretry 5 curl -fsS http://localhost:8080/health",
      },
    ],
    faq: [
      { q: "Should I use #!/bin/bash or #!/usr/bin/env bash?", a: "Both work on Linux servers, where bash is in /bin or /usr/bin. env finds bash in PATH, which helps on systems where it lives elsewhere, such as macOS with a newer bash from Homebrew." },
      { q: "What is the difference between [ ] and [[ ]]?", a: "[ is a normal command, so unquoted variables inside it split and can break the test. [[ is bash syntax: no word splitting, and it supports patterns and =~. Prefer [[ ]] in bash scripts." },
      { q: "When should I stop writing bash and use Python?", a: "When you need data structures, JSON, error handling across many steps, or the script grows past a couple of hundred lines. Bash is best for gluing commands together." },
      { q: "Why does my script work with bash script.sh but not ./script.sh?", a: "The file is probably not executable (chmod +x), has Windows line endings (fix with sed -i 's/\\r$//'), or the shebang points to a missing interpreter." },
    ],
  },

  "adm-automation/admin-scripts": {
    plain: [
      "Admin scripts do real jobs on real servers: create 50 user accounts, warn when a disk is almost full, send a morning report. A small mistake in such a script can lock people out or delete data, so they need more care than a quick one-liner.",
      "The most important habit is to make scripts idempotent. That word means running the script twice gives the same result as running it once. A script that creates a user should first check if the user exists. Then you can rerun it safely after a failure.",
      "Good scripts also tell you what they did. Instead of printing to a screen nobody watches, send messages to the system journal with logger. Later you can search them with journalctl, together with everything else that happened on the server.",
      "Finally, let a tool check your work. shellcheck reads a script and points out common bugs, such as missing quotes, before they hurt you in production.",
    ],
    deepDive: [
      {
        heading: "Patterns for idempotent changes",
        body: "Each kind of change has a check-then-act pattern. Users: id NAME || useradd NAME. Groups: getent group NAME || groupadd NAME, or simply groupadd -f. Folders: mkdir -p, or install -d -m 750 -o app -g app /srv/app, which also fixes owner and mode. A line in a config file: grep -qxF 'line' file || echo 'line' >> file. Services: systemctl enable --now is already idempotent.\n\nAvoid commands that add something every time they run, such as a plain echo >> into a config file or useradd without a check. Use a --dry-run flag that prints what would change; it makes reviews easy and catches mistakes before they happen. Tools like Ansible are built around these same ideas.",
        visual: {
          type: "compare",
          title: "Not idempotent vs idempotent",
          columns: [
            { title: "Breaks on rerun", points: ["useradd ana fails: user exists", "echo line >> file adds duplicates", "mkdir dir fails if it exists", "sed -i 's/a/aa/' grows every run"] },
            { title: "Safe to rerun", points: ["id ana || useradd ana", "grep -qxF line file || echo line >> file", "install -d -m 750 dir", "Set exact values, not relative changes"] },
          ],
        },
      },
      {
        heading: "Logging to the journal",
        body: "logger -t mkusers \"created ana\" writes a message with the tag mkusers to the system log, which on systemd machines is the journal. journalctl -t mkusers shows only your script's messages, and -p sets a priority: logger -p user.err marks it as an error, so journalctl -p err finds it next to other errors.\n\nTo capture everything a script prints without changing every line, redirect it at the top: exec > >(logger -t myscript) 2>&1. Or run the whole script through systemd-cat -t myscript ./script.sh. When a script runs from a systemd timer, its output goes to the journal under the service name anyway, so a plain echo is enough.",
        bullets: [
          "journalctl -t mkusers --since today",
          "journalctl -p warning -t diskcheck",
          "logger -s also prints the message to stderr",
        ],
      },
      {
        heading: "Disk checks that catch both problems",
        body: "A disk can fill up in two ways: no space left, or no inodes left. An inode is a small record for each file, and a filesystem has a fixed number of them, so millions of tiny files can exhaust inodes while df -h still shows free space. A good check looks at both: df --output=pcent and df --output=ipcent.\n\nCheck every real filesystem, not just /. df -x tmpfs -x devtmpfs -x overlay skips virtual ones. Use a warning and a critical threshold, such as 80 and 90 percent, and exit with a non-zero status when a limit is hit, so a timer's OnFailure= or a monitoring system can react.",
      },
      {
        heading: "shellcheck in practice",
        body: "shellcheck script.sh prints warnings with codes and a link to a wiki page explaining each one. The most common: SC2086, double quote to prevent globbing and word splitting; SC2164, use cd ... || exit in case cd fails; SC2046, quote $(...) to prevent splitting; SC2155, declare and assign separately to avoid masking return values.\n\nInstall it with dnf install ShellCheck (from EPEL on RHEL) or apt install shellcheck. Run it in your editor and in CI, so a script never reaches a server with known issues. If a warning is truly wrong for one line, silence just that line with a comment such as # shellcheck disable=SC2086 directly above it, and say why.",
      },
      {
        heading: "Handling secrets and input files",
        body: "Bulk-user scripts often need initial passwords. Never put passwords in the script itself or in a world-readable CSV. Generate a random one per user, for example openssl rand -base64 12, set it with chpasswd, which reads name:password lines from standard input, and force a change at first login with chage -d 0. Write the list only to a file with mode 600, or hand passwords over another way.\n\nTreat input files as untrusted. Skip a header line, ignore blank lines and comments, trim Windows line endings, and check each field against an allowed pattern, such as a lowercase name of 1 to 32 characters, before passing it to useradd.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Life of a safe admin script",
        steps: [
          { label: "Write", detail: "Strict mode, functions, checks" },
          { label: "shellcheck", detail: "Fix every warning" },
          { label: "Dry run", detail: "--dry-run prints planned changes" },
          { label: "Run on a test VM", detail: "Then run again: nothing should change" },
          { label: "Schedule", detail: "systemd timer, logs in the journal" },
          { label: "Watch the exit status", detail: "Alert on failure" },
        ],
      },
    ],
    examples: [
      {
        title: "Bulk users from a CSV with random passwords",
        explanation: "HR sends new_staff.csv with a header line and rows like name,group. Step 1: skip the header, strip Windows line endings and validate each name. Step 2: create missing groups and users only; existing ones are skipped and logged. Step 3: give each new user a random password, force a change at first login, and write the passwords to a root-only file. Running the script a second time changes nothing.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\nout=/root/new-passwords.txt; umask 077\ntail -n +2 \"${1:?usage: $0 FILE.csv}\" | tr -d '\\r' | while IFS=, read -r name group; do\n  [[ $name =~ ^[a-z][a-z0-9_-]{0,31}$ ]] || { logger -t mkusers \"bad name: $name\"; continue; }\n  groupadd -f \"$group\"\n  if id \"$name\" &>/dev/null; then logger -t mkusers \"skip $name\"; continue; fi\n  useradd -m -G \"$group\" \"$name\"\n  pw=$(openssl rand -base64 12)\n  echo \"$name:$pw\" | chpasswd && chage -d 0 \"$name\"\n  echo \"$name $pw\" >> \"$out\"\n  logger -t mkusers \"created $name in $group\"\ndone",
        },
      },
      {
        title: "Space and inode check for every filesystem",
        explanation: "Step 1: list real filesystems with their use and inode use as plain numbers. Step 2: compare each with the limit and log a warning with logger. Step 3: remember whether anything was over the limit and exit 1 if so, so the timer's service shows as failed and an OnFailure= alert can fire. Run it every 15 minutes from a timer.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\nlimit=${1:-90}; bad=0\nwhile read -r mnt pcent ipcent; do\n  p=${pcent%\\%}; i=${ipcent%\\%}\n  [[ $i == - ]] && i=0          # some filesystems report no inodes\n  if (( p >= limit || i >= limit )); then\n    logger -p user.warning -t diskcheck \"$mnt space ${p}% inodes ${i}%\"\n    bad=1\n  fi\ndone < <(df --output=target,pcent,ipcent -x tmpfs -x devtmpfs -x overlay | tail -n +2)\nexit \"$bad\"",
        },
      },
    ],
    cheatSheet: [
      "Idempotent checks: id USER ||, getent group G ||, grep -qxF LINE FILE ||",
      "install -d -m 750 -o app -g app DIR creates a folder with exact owner and mode",
      "logger -t TAG -p user.warning \"msg\"; read with journalctl -t TAG",
      "exec > >(logger -t TAG) 2>&1 sends all script output to the journal",
      "df --output=target,pcent,ipcent checks space and inodes in one pass",
      "echo 'user:pass' | chpasswd, then chage -d 0 user forces a new password",
      "shellcheck script.sh before every commit; fix SC2086 quoting first",
      "Run the script twice on a test VM: the second run must change nothing",
    ],
    quiz: [
      {
        q: "Which line is idempotent?",
        options: ["echo 'PermitRootLogin no' >> /etc/ssh/sshd_config", "useradd ana", "grep -qxF 'vm.swappiness=10' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf", "mkdir /srv/app"],
        answer: 2,
        why: "It only appends the line when it is not already there, so reruns change nothing.",
      },
      {
        q: "df -h shows 40% used, yet the app gets No space left on device. What should you check?",
        options: ["df -i, for inode exhaustion", "free -h", "The CPU load", "The umask"],
        answer: 0,
        why: "Each file uses an inode; when they run out, no new files can be created.",
      },
      {
        q: "How do you show only the messages your script logged with logger -t backup?",
        options: ["journalctl -u backup", "grep backup /etc/rsyslog.conf", "dmesg | grep backup", "journalctl -t backup"],
        answer: 3,
        why: "-t filters by the syslog tag that logger sets.",
      },
      {
        q: "What does shellcheck warning SC2086 tell you?",
        options: ["A command is not installed", "A variable should be double-quoted", "The shebang is missing", "The script is not executable"],
        answer: 1,
        why: "SC2086 flags unquoted expansions that can split or glob.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Log a test message with the tag practice at warning level, then find it in the journal by tag and by priority.",
        hint: "logger takes -t for the tag and -p for the priority.",
        solution: "logger -t practice -p user.warning \"hello from my script\"\njournalctl -t practice -n 5\njournalctl -p warning --since '5 min ago' | grep practice",
      },
      {
        level: "medium",
        task: "Write a script that makes sure the line 'net.ipv4.ip_forward = 1' exists exactly once in /etc/sysctl.d/90-forward.conf and applies it. Run it twice and prove the file has one line.",
        hint: "Use grep -qxF before appending, then sysctl --system.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nf=/etc/sysctl.d/90-forward.conf; line='net.ipv4.ip_forward = 1'\ntouch \"$f\"\ngrep -qxF \"$line\" \"$f\" || echo \"$line\" >> \"$f\"\nsysctl --system >/dev/null\nsysctl net.ipv4.ip_forward\n# after two runs:\n# grep -c ip_forward /etc/sysctl.d/90-forward.conf  -> 1",
      },
      {
        level: "hard",
        task: "Add a --dry-run option to a user-creation script so it prints each useradd it would run without changing anything.",
        hint: "Wrap changing commands in a run function that either prints or executes \"$@\".",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\ndry=0; [[ ${1:-} == --dry-run ]] && { dry=1; shift; }\nrun() { if (( dry )); then echo \"DRY: $*\"; else \"$@\"; fi; }\nwhile IFS=, read -r name group; do\n  id \"$name\" &>/dev/null && continue\n  run groupadd -f \"$group\"\n  run useradd -m -G \"$group\" \"$name\"\ndone < \"${1:?usage: $0 [--dry-run] FILE}\"",
      },
    ],
    faq: [
      { q: "What does idempotent mean in simple words?", a: "Doing it once or ten times leaves the system in the same final state. It makes reruns after a failure safe." },
      { q: "Should I write admin scripts in bash or use Ansible?", a: "For one server and simple tasks, a careful bash script is fine. For many servers, or when you need a clear record of desired state, a tool like Ansible is easier to maintain." },
      { q: "How do I give users an initial password safely?", a: "Generate a random password per user, set it with chpasswd, force a change at first login with chage -d 0, and pass it on through a private channel. Never hard-code passwords in scripts." },
      { q: "Where do I see the output of a script run by a systemd timer?", a: "In the journal under the service name: journalctl -u NAME.service. Anything the script prints is captured automatically." },
    ],
  },
};

export default extra;
