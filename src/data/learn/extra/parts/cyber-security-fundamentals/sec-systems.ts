import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-systems/linux-permissions": {
    plain: [
      "On Linux, every file and folder has an owner, a group and three sets of permissions: one for the owner, one for the group and one for everyone else. Each set says whether you may read (r), write (w) or execute (x). That small label decides who can see your secrets, change your config or run your programs.",
      "For a defender, permissions are the first lock on every door. If a password file can be read by everyone, or a startup script can be changed by any user, an attacker who gets a low-level account can quickly become root (the all-powerful administrator). This jump is called privilege escalation.",
      "sudo is the controlled way to borrow root power. Rules in the sudoers file say exactly which user may run which command as which account. Good rules are narrow. Bad rules, like letting a user run any editor as root, quietly hand over the whole machine.",
      "Auditing means looking for these mistakes on purpose: files that anyone can write, programs with special bits, and sudo rules that are too wide. You fix them before an attacker finds them, and you watch the logs to see who used sudo and when.",
    ],
    deepDive: [
      {
        heading: "What r, w and x mean on a directory",
        body: "On a file, r lets you read the content, w lets you change it and x lets you run it. On a directory the meaning changes, and this trips up many people. r lets you list the names inside. x lets you enter the directory and reach files by name. w lets you create, rename and delete entries inside it, but only when x is also set.\n\nThe security surprise: deleting a file needs write permission on the directory, not on the file. So if a user can write to /srv/app, they can delete and replace a root-owned config file there, even if the file itself is mode 644. The sticky bit (as on /tmp) blocks this by allowing only a file's owner to delete it. Always check the folder as well as the file.",
        bullets: ["ls -ld dir shows the directory's own mode", "Directory w + x means you can replace any file inside", "namei -l /path/to/file shows the mode of every folder on the way"],
      },
      {
        heading: "SUID, SGID, sticky and file capabilities",
        body: "SUID (mode 4000) makes a program run as its owner instead of the person who started it. It exists for good reasons: passwd and sudo need root to do their job. But any bug in a SUID-root program, or a program that lets you start a shell, becomes a path to root. That is why defenders keep a list of SUID files and alert when a new one appears.\n\nSGID (2000) does the same with the group, and on a directory makes new files inherit its group. The sticky bit (1000) on a shared directory stops users deleting each other's files. Linux ignores SUID on interpreted scripts, so attackers target binaries.\n\nModern Linux also has file capabilities: small slices of root power, such as cap_net_bind_service to open ports below 1024. They do not show in ls -l, so audit them separately with getcap.",
        bullets: ["find / -xdev -perm -4000 -type f lists SUID files", "find / -xdev -perm -2000 -type f lists SGID files", "getcap -r / 2>/dev/null lists files with capabilities"],
      },
      {
        heading: "How a sudo rule is read",
        body: "A sudoers line has four parts: who, on which host, as which user, and which commands. For example, alice ALL=(root) /usr/bin/systemctl restart nginx means alice, on any host, may run that one command as root. A name starting with % is a group, so %admins ALL=(ALL:ALL) ALL gives the admins group full root.\n\nTwo patterns are dangerous. First, programs that can start other programs: editors (vim), pagers (less), find, awk, python, tar and many more can open a root shell. Allowing them is the same as allowing everything. Second, wildcards in arguments. The sudoers manual warns that /usr/bin/cat /var/log/messages* also allows cat /var/log/messages /etc/shadow, because the star matches any extra text.\n\nSafer options: allow exact commands, use sudoedit for editing files (it edits a copy as you, not as root), and avoid NOPASSWD for broad rules.",
        visual: {
          type: "flow",
          title: "Parts of one sudoers rule",
          steps: [
            { label: "Who", detail: "alice, or %group for a group" },
            { label: "Host", detail: "ALL means any machine" },
            { label: "Run as", detail: "(root) or (ALL:ALL)" },
            { label: "Tags", detail: "Optional, e.g. NOPASSWD:" },
            { label: "Command", detail: "Full path plus exact arguments" },
          ],
        },
      },
      {
        heading: "Auditing permissions and sudo use",
        body: "A permission audit is a repeatable set of searches. Look for world-writable files outside /tmp, files with no valid owner (often left after a user was deleted), SUID files, writable folders in root's PATH, and readable private keys. Save the results and compare them over time: a change is often more interesting than the list itself.\n\nFor sudo, list the rules with sudo -l -U username and read every file in /etc/sudoers.d/. Then check use: every sudo command is logged with the user, the working folder and the full command. On Debian and Ubuntu it lands in /var/log/auth.log, on RHEL in /var/log/secure, and everywhere in the journal. Alert on sudo by unexpected users, and on commands such as useradd, visudo or chmod u+s.",
        bullets: ["find / -xdev -type f -perm -0002 finds world-writable files", "find / -xdev \\( -nouser -o -nogroup \\) finds orphaned files", "journalctl _COMM=sudo shows sudo activity"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Common Linux privilege escalation paths to audit",
        root: "Low-privilege user",
        children: [
          { label: "Weak file modes", children: ["World-writable scripts run by root", "Readable /etc/shadow or keys"] },
          { label: "Special bits", children: ["Unusual SUID-root binary", "Risky file capability"] },
          { label: "Loose sudo rules", children: ["Editor or shell allowed", "Wildcard arguments", "ALL with NOPASSWD"] },
          { label: "Writable paths", children: ["Writable folder in root's PATH", "Writable cron or systemd file"] },
        ],
      },
    ],
    examples: [
      {
        title: "Finding a dangerous sudo rule",
        explanation: "A developer asked to read logs, so someone added a rule letting them run less as root. Step 1: list the user's rules with sudo -l -U dev. Step 2: notice /usr/bin/less, a pager that can run a shell command from inside it, so this rule really grants a root shell. Step 3: replace it with a safer design: add dev to the adm group, which can read most logs in /var/log on Debian and Ubuntu, or use journalctl, which members of adm or systemd-journal can read. Step 4: check the syntax and confirm the old rule is gone.",
        code: {
          lang: "bash",
          code: "sudo -l -U dev\n#   (root) NOPASSWD: /usr/bin/less /var/log/*   <- risky\nsudo visudo -f /etc/sudoers.d/dev     # delete that line\nsudo usermod -aG adm dev             # read logs without sudo\nsudo visudo -c                        # syntax check all files\nsudo -l -U dev                        # rule is gone",
        },
      },
      {
        title: "Baseline and diff SUID files",
        explanation: "You want to know if anything new gains SUID power. Step 1: on a clean, freshly built server, save a sorted list of SUID and SGID files. Step 2: run the same search daily from cron or a systemd timer. Step 3: compare with the baseline. A new SUID file in /tmp, /home or /dev/shm is a strong sign of tampering. Step 4: send any difference to your log system as an alert, and update the baseline only after a planned package change.",
        code: {
          lang: "bash",
          code: "sudo find / -xdev -type f \\( -perm -4000 -o -perm -2000 \\) 2>/dev/null \\\n  | sort > /root/suid-baseline.txt\n# later, daily:\nsudo find / -xdev -type f \\( -perm -4000 -o -perm -2000 \\) 2>/dev/null \\\n  | sort > /tmp/suid-now.txt\ndiff /root/suid-baseline.txt /tmp/suid-now.txt && echo \"no change\"",
        },
      },
    ],
    cheatSheet: [
      "Deleting a file needs write on its directory, not on the file",
      "find / -xdev -perm -4000 -type f lists SUID binaries; keep a baseline",
      "getcap -r / 2>/dev/null lists file capabilities that ls -l does not show",
      "sudo -l -U user shows exactly what that user may run",
      "Never allow editors, pagers, shells or interpreters in sudo rules",
      "Use sudoedit to let people edit root-owned files safely",
      "Sudo use is logged in auth.log (Debian/Ubuntu), secure (RHEL) and the journal",
      "/etc/shadow is 640 root:shadow on Debian or 000 on RHEL; it must never be world-readable",
    ],
    quiz: [
      {
        q: "A config file is mode 644 owned by root, inside /srv/app which is mode 777. What can any local user do?",
        options: ["Nothing, the file is read-only for them", "Delete or replace the file, because the folder is writable", "Only read the folder listing", "Run the file as root"],
        answer: 1,
        why: "Creating and deleting entries depends on the directory's permissions, so a writable folder lets anyone swap the file.",
      },
      {
        q: "Why is the sudo rule bob ALL=(root) /usr/bin/vim risky?",
        options: ["vim is slow as root", "It needs NOPASSWD to work", "vim can start a shell, which would run as root", "sudo cannot run editors"],
        answer: 2,
        why: "Any program that can spawn a shell turns a narrow-looking rule into full root access.",
      },
      {
        q: "Which command lists files with Linux capabilities set?",
        options: ["getcap -r /", "ls -l --caps", "find / -perm -4000", "sudo -l"],
        answer: 0,
        why: "Capabilities are stored in extended attributes and are listed with getcap.",
      },
      {
        q: "Where do Ubuntu servers log sudo commands by default?",
        options: ["/etc/sudoers", "/var/log/sudo-only.log", "~/.bash_history", "/var/log/auth.log and the journal"],
        answer: 3,
        why: "sudo logs through syslog to the auth facility, which Ubuntu writes to auth.log, and the journal keeps a copy.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In a lab VM, list all SUID files and pick three. For each, write one sentence on why it needs SUID.",
        hint: "Use find with -perm -4000, then look up each program's purpose with man.",
        solution: "sudo find / -xdev -perm -4000 -type f 2>/dev/null\n# Typical results and reasons:\n# /usr/bin/passwd: users change their own password in root-owned /etc/shadow\n# /usr/bin/sudo: must become root to run allowed commands\n# /usr/bin/mount: lets users mount filesystems allowed in /etc/fstab",
      },
      {
        level: "medium",
        task: "Write a script that prints world-writable files and orphaned files (no valid owner or group) on the root filesystem, skipping /proc, /sys and /tmp.",
        hint: "-xdev stays on one filesystem; -path ... -prune skips folders.",
        solution: "#!/bin/sh\necho \"== world-writable files ==\"\nfind / -xdev -path /tmp -prune -o -type f -perm -0002 -print 2>/dev/null\necho \"== orphaned files ==\"\nfind / -xdev \\( -nouser -o -nogroup \\) -print 2>/dev/null\n# -xdev already keeps out /proc and /sys (separate filesystems)",
      },
      {
        level: "hard",
        task: "Review this rule and replace it with a safe one: %support ALL=(root) NOPASSWD: /usr/bin/systemctl *. Support staff only need to restart and check the status of nginx.",
        hint: "The star allows stop, edit, enable and more. Write exact commands only.",
        solution: "# Problem: systemctl * allows any action, including systemctl edit\n# (opens an editor as root) and stopping critical services.\n# Safer rule in /etc/sudoers.d/support (edit with visudo -f):\n%support ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx, \\\n                             /usr/bin/systemctl status nginx\n# Test:\nsudo visudo -c\nsudo -l -U someuser",
      },
    ],
    faq: [
      { q: "What is GTFOBins?", a: "It is a public list of normal Unix programs that can be misused to escape restrictions or get a shell when given sudo or SUID. Defenders use it to check whether a sudo rule or SUID file is dangerous." },
      { q: "Is NOPASSWD in sudoers always bad?", a: "Not always. It is common for automation running one exact command. It is risky on broad rules, because anyone with the user's session gets root without any extra check." },
      { q: "Should I remove the SUID bit from programs I do not use?", a: "On hardened servers, yes, for programs you are sure you do not need, but test first. Package updates may put the bit back, so keep checking your baseline." },
    ],
  },

  "sec-systems/linux-hardening": {
    plain: [
      "Hardening means making a system harder to attack by removing things it does not need and locking down the things it does. A fresh server often runs extra services, accepts passwords over SSH and has no firewall. Each of these is an open door.",
      "SSH (secure shell) is the main way people log in to Linux servers, so it is the main target. Bots on the internet try thousands of username and password guesses every day. Using SSH keys instead of passwords, and blocking direct root login, makes these guesses useless.",
      "Every running service that listens on the network adds attack surface, meaning more places an attacker can poke. If you do not use a printing service or an old file-sharing service, turn it off. A host firewall then makes sure only the ports you chose can be reached.",
      "Finally, logs tell you what happened. Linux records every successful and failed login. When something goes wrong, the auth log is often the first place an investigator looks: who logged in, from which IP address, and with which method.",
    ],
    deepDive: [
      {
        heading: "Hardening sshd safely",
        body: "The SSH server reads /etc/ssh/sshd_config, and on most current distributions also files in /etc/ssh/sshd_config.d/. Important detail: for most options, sshd uses the first value it finds. Because the Include line sits at the top, a drop-in file wins over a later line in the main file. Run sudo sshd -T to see the settings sshd will really use.\n\nThe core settings: PermitRootLogin no, PasswordAuthentication no, KbdInteractiveAuthentication no, and PubkeyAuthentication yes. MaxAuthTries 3 limits guesses per connection, and AllowGroups sshusers allows only one group to log in. Turn off what you do not use, such as X11Forwarding.\n\nNever lock yourself out. Check the syntax with sudo sshd -t, reload the service, and test a new login in a second terminal before closing the first one.",
        bullets: ["sshd -t checks syntax; sshd -T prints the effective config", "Service name: ssh on Debian/Ubuntu, sshd on RHEL", "Use ed25519 keys: ssh-keygen -t ed25519"],
      },
      {
        heading: "Reducing services and open ports",
        body: "Start by seeing what is actually listening. sudo ss -tulpn shows every TCP and UDP port open for connections, and the program behind each. Then compare with what the server is for. A web server needs 80, 443 and SSH; it does not need a mail server, rpcbind or a printer service.\n\nTo stop a service now and at boot, use sudo systemctl disable --now name. If other units might start it again, systemctl mask name blocks it completely. Removing the package is even better, because code that is not installed cannot be exploited.\n\nAlso bind internal services to localhost. A database that only the local app uses should listen on 127.0.0.1, not 0.0.0.0 (all interfaces). That one setting takes it off the network entirely.",
        bullets: ["ss -tulpn: listening ports with process names", "systemctl list-unit-files --state=enabled: what starts at boot", "0.0.0.0 or [::] in ss output means reachable from the network"],
      },
      {
        heading: "Reading authentication logs",
        body: "SSH, sudo and local logins write to the auth facility. Debian and Ubuntu save it in /var/log/auth.log, RHEL family systems in /var/log/secure. Some newer installs (for example Debian 12) keep only the systemd journal, so use journalctl -u ssh or journalctl -u sshd.\n\nKnow the key lines. \"Failed password for invalid user admin from 203.0.113.5\" means someone guessed a username that does not exist, typical of bots. \"Failed password for alice\" means a real user name with a wrong password. \"Accepted publickey for alice from 198.51.100.7\" is a success, with the key fingerprint. Many failures from one IP followed by one Accepted line from that same IP is the pattern to alert on.\n\nThe last command reads successful logins from /var/log/wtmp, and sudo lastb reads failed ones from /var/log/btmp.",
        visual: {
          type: "flow",
          title: "From log line to alert",
          steps: [
            { label: "sshd logs event", detail: "Failed or Accepted, with user and IP" },
            { label: "journald / rsyslog", detail: "Stores it locally" },
            { label: "Forwarder", detail: "Ships logs to a central server" },
            { label: "Rule", detail: "Many fails then success from one IP" },
            { label: "Alert", detail: "Analyst checks the account" },
          ],
        },
      },
      {
        heading: "Host firewall and brute-force protection",
        body: "A host firewall runs on the server itself, so it still protects the machine if a network firewall is misconfigured. On Ubuntu, ufw is the simple front end: set the default to deny incoming, allow only what you need, then enable it. Always allow SSH before enabling, or you will cut off your own session. On RHEL family systems, firewalld does the same with zones and services. Both write rules into the kernel's nftables (or iptables) layer.\n\nufw limit 22/tcp adds simple rate limiting: it blocks an address that opens 6 or more connections in 30 seconds. fail2ban goes further: it reads the auth log and bans IPs after repeated failures. Its defaults are 5 failures within 10 minutes, banned for 10 minutes. With key-only SSH, these tools mostly reduce log noise, but they still help against slow guessing on other services.",
        bullets: ["sudo ufw default deny incoming", "sudo ufw allow OpenSSH, then sudo ufw enable", "sudo firewall-cmd --permanent --add-service=https; sudo firewall-cmd --reload"],
      },
      {
        heading: "Updates and file auditing",
        body: "Most real break-ins use known bugs that already have a patch. On Debian and Ubuntu, the unattended-upgrades package installs security updates automatically; on RHEL family systems, dnf-automatic does the job. Kernel updates need a reboot to take effect, so plan for that too.\n\nFor sensitive files, auditd records who changed them. The rule auditctl -w /etc/sudoers -p wa -k sudoers watches the file for writes and attribute changes and tags events with the key sudoers. Then ausearch -k sudoers shows each change with the user and the program that made it. Put permanent rules in /etc/audit/rules.d/ so they survive a reboot.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Layers protecting one Linux server",
        layers: [
          { label: "Network firewall", detail: "Only needed ports reach the server" },
          { label: "Host firewall", detail: "ufw or firewalld on the machine" },
          { label: "Hardened services", detail: "SSH keys only, unused services off" },
          { label: "Accounts and sudo", detail: "Named users, narrow sudo rules" },
          { label: "Patching", detail: "Automatic security updates" },
          { label: "Logging and audit", detail: "Auth logs and auditd, shipped off-host" },
        ],
      },
    ],
    examples: [
      {
        title: "Locking SSH down to keys only",
        explanation: "Step 1: from your laptop, copy your public key with ssh-copy-id and confirm key login works. Step 2: create a drop-in file with the hardened settings. Step 3: check syntax with sshd -t and confirm the effective values with sshd -T. Step 4: reload the service, keeping your current session open. Step 5: in a new terminal, log in again with your key, and try a password login to confirm it is refused.",
        code: {
          lang: "bash",
          code: "ssh-copy-id -i ~/.ssh/id_ed25519.pub alice@server\nsudo tee /etc/ssh/sshd_config.d/10-hardening.conf <<'EOF'\nPermitRootLogin no\nPasswordAuthentication no\nKbdInteractiveAuthentication no\nMaxAuthTries 3\nAllowGroups sshusers\nX11Forwarding no\nEOF\nsudo sshd -t && sudo sshd -T | grep -Ei 'permitroot|passwordauth|allowgroups'\nsudo systemctl reload ssh     # sshd on RHEL",
        },
      },
      {
        title: "Who is guessing passwords?",
        explanation: "Step 1: pull the last day of sshd failures from the journal. Step 2: extract the source IP from each Failed password line. Step 3: count and sort. Step 4: check whether any of the top IPs also has an Accepted line, which would mean a guess succeeded. Step 5: if one did, treat it as an incident: lock the account, check its recent commands and keys, and look for new files.",
        code: {
          lang: "bash",
          code: "journalctl -u ssh --since \"24 hours ago\" --no-pager \\\n  | grep 'Failed password' \\\n  | grep -oE 'from [0-9.]+' | awk '{print $2}' \\\n  | sort | uniq -c | sort -rn | head\n# then, for a suspicious IP:\njournalctl -u ssh --since \"24 hours ago\" | grep 'Accepted' | grep 203.0.113.5",
        },
      },
    ],
    cheatSheet: [
      "sudo sshd -t checks syntax; sudo sshd -T shows the effective SSH settings",
      "sshd uses the first value it finds, so drop-ins in sshd_config.d usually win",
      "sudo ss -tulpn lists listening ports and the programs behind them",
      "systemctl disable --now svc stops it now and at boot; mask blocks it fully",
      "Auth log: /var/log/auth.log (Debian/Ubuntu), /var/log/secure (RHEL), or journalctl",
      "last shows successful logins; sudo lastb shows failed ones",
      "ufw limit 22/tcp blocks IPs with 6+ connections in 30 seconds",
      "auditctl -w /etc/sudoers -p wa -k sudoers records every change to the file",
    ],
    quiz: [
      {
        q: "You set PasswordAuthentication no at the bottom of sshd_config, but passwords still work. A file in sshd_config.d sets it to yes. Why?",
        options: ["sshd ignores sshd_config", "For most options sshd uses the first value it reads, and the drop-in is included first", "The last value always wins", "You must reboot the server"],
        answer: 1,
        why: "The Include line is near the top, and sshd keeps the first value it finds for most keywords.",
      },
      {
        q: "ss -tulpn shows PostgreSQL on 0.0.0.0:5432, but only a local app uses it. What is the best fix?",
        options: ["Change the port to 5433", "Remove the firewall", "Restart PostgreSQL", "Make it listen on 127.0.0.1 only"],
        answer: 3,
        why: "Binding to localhost removes the service from the network completely.",
      },
      {
        q: "Which log line most strongly suggests a successful brute-force attack?",
        options: ["Accepted password for root from an IP that had 500 failures just before", "Failed password for invalid user test", "Connection closed by authenticating user", "Disconnected from user alice"],
        answer: 0,
        why: "A success right after many failures from the same IP means a guess probably worked.",
      },
      {
        q: "What are fail2ban's default settings for a jail?",
        options: ["3 failures, banned forever", "1 failure, banned for 1 hour", "5 failures in 10 minutes, banned for 10 minutes", "10 failures in 1 day, banned for 1 day"],
        answer: 2,
        why: "The defaults in jail.conf are maxretry 5, findtime 10m and bantime 10m.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On a lab VM, list every listening port and the program behind it. For each one, write whether the server needs it.",
        hint: "Use ss with t, u, l, p and n flags and run it with sudo to see process names.",
        solution: "sudo ss -tulpn\n# Example review:\n# 0.0.0.0:22  sshd     -> needed (admin access)\n# 0.0.0.0:631 cupsd    -> not needed on a server: systemctl disable --now cups\n# 127.0.0.1:5432 postgres -> fine, local only",
      },
      {
        level: "medium",
        task: "Enable ufw so the server only accepts SSH and HTTPS, with rate limiting on SSH. Prove other ports are blocked.",
        hint: "Allow SSH before enabling. Test from another machine with nc -zv.",
        solution: "sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw limit 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status verbose\n# from another host:\nnc -zv server 443   # succeeded\nnc -zv server 8080  # times out",
      },
      {
        level: "hard",
        task: "Use auditd to record any change to /etc/passwd and /etc/sudoers, make the rules permanent, then trigger and find an event.",
        hint: "Put -w rules in a file under /etc/audit/rules.d/ and load them with augenrules.",
        solution: "sudo tee /etc/audit/rules.d/identity.rules <<'EOF'\n-w /etc/passwd -p wa -k identity\n-w /etc/sudoers -p wa -k sudoers\nEOF\nsudo augenrules --load\nsudo auditctl -l                 # rules are active\nsudo useradd testuser            # changes /etc/passwd\nsudo ausearch -k identity -i | tail -20",
      },
    ],
    faq: [
      { q: "Should I change the SSH port from 22?", a: "It cuts log noise from bots, but it is not real security, because scanners find SSH on any port in seconds. Keys only, no root login and a firewall matter far more." },
      { q: "Where are SSH logs on Ubuntu?", a: "In /var/log/auth.log and in the journal. Use journalctl -u ssh to see them, or journalctl -u sshd on RHEL family systems." },
      { q: "Is fail2ban still needed with key-only SSH?", a: "Password guessing cannot succeed then, so it matters less for SSH. It still reduces noise and helps protect other services that accept passwords, such as web logins or mail." },
      { q: "What is a CIS Benchmark?", a: "A free, community-written hardening guide for a specific system, such as Ubuntu 24.04. Each item says what to set, why, and how to check it, and many scanners can test against it." },
    ],
  },

  "sec-systems/windows-accounts": {
    plain: [
      "Windows has two main kinds of user accounts. A local account exists on one computer only, stored in that computer's own database. A domain account lives in Active Directory (AD), a central directory run on servers called domain controllers, and works on every computer joined to that domain.",
      "Being an administrator on Windows is powerful, so Windows does not use that power all the time. User Account Control (UAC) runs your programs as a normal user, even if you are an admin. When a program needs more, a prompt asks you to approve.",
      "Group Policy is how companies set rules for thousands of computers at once. An admin writes a policy once, for example \"lock the screen after 10 minutes\" or \"turn on the firewall\", and every computer in the right group applies it automatically.",
      "For defenders, the most important question is: who is an administrator, and where? Every extra admin account is one more account an attacker can steal. Regularly checking the local Administrators group on each machine is simple and catches many problems.",
    ],
    deepDive: [
      {
        heading: "Where accounts live and how Windows names them",
        body: "Local accounts are stored in the SAM (Security Account Manager) database on each machine. Domain accounts are stored in the AD database on domain controllers, and the domain controller checks the password when you sign in, usually with the Kerberos protocol.\n\nWindows does not really identify accounts by name. Every account and group has a SID (security identifier), a long string like S-1-5-21-...-1001. The last number is the RID (relative ID). The built-in Administrator account always has RID 500, and the local Administrators group has the well-known SID S-1-5-32-544. Renaming the Administrator account does not hide it, because tools can still find RID 500.\n\nThis also explains a common surprise: if you delete and recreate a user with the same name, it gets a new SID and loses all old permissions.",
        bullets: ["whoami /user shows your SID", "whoami /groups shows your groups and integrity level", "Domain Admins can control every machine in the domain"],
      },
      {
        heading: "UAC and split tokens",
        body: "When an admin signs in, Windows creates two access tokens (the bundle of identity and rights a process carries). One is a filtered, standard-user token, with admin rights removed. The other is the full admin token. Normal programs, including Explorer, start with the filtered token at medium integrity level.\n\nWhen a program needs admin rights, UAC shows a prompt. For an admin, it is a consent prompt (Yes or No). For a standard user, it is a credential prompt asking for an admin's password. Once approved, that one program runs with the full token at high integrity level. The prompt appears on the secure desktop, which other programs cannot click on.\n\nMicrosoft states that UAC is not a security boundary: it reduces accidents and makes malware ask, but attackers have many known ways to bypass it. The real protection is giving people standard accounts.",
        visual: {
          type: "sequence",
          title: "Elevating a program with UAC",
          actors: ["User", "Program", "Windows (UAC)"],
          messages: [
            { from: 0, to: 1, label: "Start program (filtered token)" },
            { from: 1, to: 2, label: "Request admin rights" },
            { from: 2, to: 0, label: "Secure desktop prompt" },
            { from: 0, to: 2, label: "Approve (or enter admin password)" },
            { from: 2, to: 1, label: "Restart with full admin token" },
          ],
        },
      },
      {
        heading: "How Group Policy applies",
        body: "A Group Policy Object (GPO) is a bundle of settings. It has two halves: Computer Configuration, applied at startup to the machine, and User Configuration, applied at sign-in to the user. GPOs are linked to sites, domains or OUs (organizational units, folders in AD that hold users and computers).\n\nPolicies apply in the order Local, Site, Domain, OU, often written LSDOU. When two GPOs set the same thing, the one applied later wins, so a setting on a child OU beats one on the domain. Two switches change this: Block Inheritance on an OU ignores parent GPOs, and Enforced on a GPO link makes it win anyway.\n\nComputers refresh policy in the background every 90 minutes plus a random offset of up to 30 minutes; domain controllers every 5 minutes. gpupdate /force refreshes now, and gpresult /r shows which GPOs actually applied.",
        visual: {
          type: "flow",
          title: "GPO processing order (later wins)",
          steps: [
            { label: "Local policy", detail: "Set on the machine itself" },
            { label: "Site", detail: "GPOs linked to the AD site" },
            { label: "Domain", detail: "GPOs linked to the domain" },
            { label: "Parent OU", detail: "Outer OU first" },
            { label: "Child OU", detail: "Closest OU applies last" },
          ],
        },
      },
      {
        heading: "Controlling local administrators",
        body: "Attackers love local admin rights. With them they can turn off defences, install tools and dump stored credentials from memory. A shared local Administrator password across all machines is especially dangerous: steal it once, and you can sign in to every PC. This is how many ransomware attacks spread.\n\nThree defences work together. First, Windows LAPS (Local Administrator Password Solution), built into current Windows versions, gives every machine a unique, random local admin password that rotates automatically and is stored in AD or Microsoft Entra ID. Second, control membership of the local Administrators group centrally with Group Policy, so extra members get removed. Third, alert when someone is added: event 4732 records a member added to a security-enabled local group.\n\nKeep daily-use accounts as standard users, and give admins a separate account for admin work only.",
        bullets: ["net localgroup administrators lists members", "Get-LocalGroupMember -Group Administrators does the same in PowerShell", "Event 4732: member added to a local group"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where Windows accounts and admin rights come from",
        root: "Windows identity",
        children: [
          { label: "Local accounts", children: ["Stored in SAM", "Administrator is RID 500", "Valid on one PC"] },
          { label: "Domain accounts", children: ["Stored in AD on DCs", "Kerberos sign-in", "Work on any joined PC"] },
          { label: "Local Administrators group", children: ["SID S-1-5-32-544", "Can include domain groups"] },
          { label: "Domain admin groups", children: ["Domain Admins", "Enterprise Admins"] },
        ],
      },
    ],
    examples: [
      {
        title: "Auditing local administrators on a PC",
        explanation: "Step 1: open PowerShell as an admin and list members of the local Administrators group. Step 2: expect a small, known set: the built-in Administrator (often disabled) and perhaps a helpdesk group from the domain. Step 3: anything else, such as a normal user account or an unknown local account, needs a reason. Step 4: remove it, and check the Security log for event 4732 to see who added it and when.",
        code: {
          lang: "powershell",
          code: "Get-LocalGroupMember -Group \"Administrators\" |\n  Select-Object Name, ObjectClass, PrincipalSource\n# Remove an unexpected member\nRemove-LocalGroupMember -Group \"Administrators\" -Member \"PC01\\tempuser\"\n# Who added members recently?\nGet-WinEvent -FilterHashtable @{LogName='Security'; Id=4732} -MaxEvents 10 |\n  Format-List TimeCreated, Message",
        },
      },
      {
        title: "Applying a screen lock policy with a GPO",
        explanation: "Step 1: in Group Policy Management, create a GPO named \"Workstation screen lock\" and link it to the Workstations OU. Step 2: edit it: Computer Configuration, Policies, Windows Settings, Security Settings, Local Policies, Security Options, \"Interactive logon: Machine inactivity limit\" set to 600 seconds. Step 3: on a test PC run gpupdate /force. Step 4: run gpresult /r /scope computer and confirm the GPO is listed under applied policies. Step 5: if it is missing, check that the PC is in that OU and that security filtering includes it.",
        code: {
          lang: "powershell",
          code: "gpupdate /force\ngpresult /r /scope computer\n# Full HTML report of applied settings:\ngpresult /h C:\\Temp\\gp-report.html",
        },
      },
    ],
    cheatSheet: [
      "Local accounts live in SAM; domain accounts live in Active Directory on DCs",
      "Built-in Administrator is always RID 500; Administrators group is S-1-5-32-544",
      "UAC gives admins a filtered token until they approve elevation",
      "GPO order is Local, Site, Domain, OU; the later one wins unless Enforced",
      "gpupdate /force refreshes policy; gpresult /r shows what applied",
      "Windows LAPS gives each PC a unique, rotating local admin password",
      "Event 4732: a member was added to a security-enabled local group",
      "Use separate accounts for admin work and for email and browsing",
    ],
    quiz: [
      {
        q: "An admin user opens Notepad normally. Which token does it run with?",
        options: ["The full admin token", "The SYSTEM token", "The domain controller's token", "The filtered standard-user token"],
        answer: 3,
        why: "With UAC on, admins run programs with the filtered token unless they approve elevation.",
      },
      {
        q: "A domain GPO sets the screen lock to 15 minutes and an OU GPO sets 10 minutes. Neither is Enforced. Which applies to a PC in that OU?",
        options: ["10 minutes, because the OU GPO applies later", "15 minutes, because domain beats OU", "Neither, they cancel out", "The lower of the two by rule"],
        answer: 0,
        why: "Processing goes Local, Site, Domain, OU, and the last applied value wins.",
      },
      {
        q: "Why is the same local admin password on every PC dangerous?",
        options: ["It slows down sign-in", "Group Policy cannot apply", "One stolen password lets an attacker sign in to every PC", "UAC stops working"],
        answer: 2,
        why: "Shared local credentials enable fast lateral movement, which LAPS prevents.",
      },
      {
        q: "Renaming the built-in Administrator account to \"bob\" mainly does what?",
        options: ["Makes it impossible to find", "Little, because its RID is still 500 and tools can find it", "Disables it", "Turns it into a standard user"],
        answer: 1,
        why: "Windows identifies accounts by SID, so the account is still discoverable.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On your own Windows PC, show your SID, your groups and your current integrity level. Then open PowerShell as administrator and compare.",
        hint: "whoami has /user and /groups options. Look for the Mandatory Label line.",
        solution: "whoami /user\nwhoami /groups | findstr /i \"Mandatory\"\n# Normal window:   Mandatory Label\\Medium Mandatory Level\n# Elevated window: Mandatory Label\\High Mandatory Level\n# Same user SID, different token.",
      },
      {
        level: "medium",
        task: "Write a PowerShell snippet that lists local Administrators members and flags any that are not on an approved list.",
        hint: "Compare the Name property against an array with -notcontains.",
        solution: "$approved = @(\"PC01\\Administrator\", \"CORP\\Helpdesk-Admins\")\nGet-LocalGroupMember -Group \"Administrators\" | ForEach-Object {\n  if ($approved -notcontains $_.Name) {\n    Write-Warning \"Unapproved admin: $($_.Name) ($($_.ObjectClass))\"\n  }\n}",
      },
      {
        level: "hard",
        task: "In a lab domain, design how you would make sure only the Helpdesk-Admins group is in every workstation's local Administrators group, and how you would detect changes.",
        hint: "Think: a GPO for membership, LAPS for the built-in account, and a log-based alert.",
        solution: "1. GPO on Workstations OU: Computer Config > Preferences > Control Panel Settings >\n   Local Users and Groups: update Administrators, delete all member users\n   and groups, add CORP\\Helpdesk-Admins (built-in Administrator stays).\n2. Enable Windows LAPS by GPO so the built-in Administrator password is unique.\n3. Forward Security events 4732 and 4733 to the SIEM; alert on any\n   addition not made by the GPO refresh or approved admins.\n4. Monthly: run Get-LocalGroupMember on a sample and compare.",
      },
    ],
    faq: [
      { q: "Should I turn off UAC?", a: "No. Turning it off makes every admin program run with full rights silently. Keep it on and, better still, use a standard account for daily work." },
      { q: "What is the difference between Active Directory and Microsoft Entra ID?", a: "Active Directory is the on-premises directory that uses Kerberos and Group Policy. Microsoft Entra ID (formerly Azure AD) is Microsoft's cloud identity service for Microsoft 365 and web apps. Many companies use both, synced together." },
      { q: "How often does Group Policy refresh?", a: "Every 90 minutes plus a random offset of up to 30 minutes on member computers, and every 5 minutes on domain controllers. Some settings only apply at restart or next sign-in." },
    ],
  },

  "sec-systems/windows-event-logs": {
    plain: [
      "Windows keeps a diary of what happens on each computer: who signed in, which programs started, which services were installed. Each kind of entry has a number called an event ID. Learning a handful of these numbers lets you follow an attacker's footsteps.",
      "The diary is split into channels. The Security channel holds sign-ins and account changes. The System channel holds service and driver events. Applications and Windows features have their own channels, such as PowerShell's. Event Viewer is the built-in app to browse them all.",
      "The default logs miss many details an investigator wants, like the full command line of every program or which program opened a network connection. Sysmon (System Monitor), a free Microsoft tool, fills that gap with much richer events.",
      "Clicking through Event Viewer is slow when you have thousands of events. PowerShell can filter and count events in seconds, and the same skills transfer to a SIEM (a central log search system) where all computers send their logs.",
    ],
    deepDive: [
      {
        heading: "Logon events and logon types",
        body: "Event 4624 records a successful logon and 4625 a failed one. Both carry a Logon Type field that tells you how the logon happened, and this changes the meaning a lot. Type 2 is someone at the keyboard. Type 3 is a network logon, such as opening a file share. Type 4 is a scheduled task, type 5 a service starting. Type 10 is Remote Desktop (RDP), and type 11 uses cached credentials when no domain controller is reachable.\n\nFor 4625, the Status and Sub Status codes explain why it failed. 0xC000006A means the user exists but the password is wrong. 0xC0000064 means the user name does not exist, a sign of guessing. 0xC0000234 means the account is locked out.\n\nOther useful events: 4672 means special privileges (admin-level rights) were assigned at logon, and 4648 means someone used explicit credentials, as with runas.",
        bullets: ["Many 4625 type 3 or 10 from one IP: password guessing", "4625 with 0xC0000064 for many names: username spraying", "4740: account locked out"],
      },
      {
        heading: "Process, service and tamper events",
        body: "Event 4688 records a new process, with its parent. It is off by default: enable Audit Process Creation, and turn on \"Include command line in process creation events\" so you see the arguments too. Without the command line, powershell.exe tells you little; with it, you can see a hidden encoded command.\n\nAttackers often install services for persistence or remote execution. Event 7045 in the System log records a new service, with its file path, and 4697 is the Security log version when that auditing is on. Event 4698 records a new scheduled task. For PowerShell, enable Script Block Logging: event 4104 in the PowerShell Operational channel then stores the code that ran, even after it was decoded.\n\nWatch for tampering too. Event 1102 means the Security log was cleared, which honest admins rarely do.",
        bullets: ["4688: process created (enable auditing + command line)", "7045 / 4697: service installed", "4698: scheduled task created", "4104: PowerShell script block", "1102: Security log cleared"],
      },
      {
        heading: "What Sysmon adds and how to install it",
        body: "Sysmon is a free Sysinternals tool that runs as a service and writes to the Microsoft-Windows-Sysmon/Operational channel. Event 1 (process create) includes the full command line, the parent process and file hashes. Event 3 links network connections to the program that made them. Event 11 records file creation, 13 registry value changes, 22 DNS queries, and 10 a process opening another process, such as a tool reading LSASS (the process that holds sign-in secrets) memory.\n\nSysmon logs nothing useful without a good config, because logging everything is far too noisy. Start from a community config such as SwiftOnSecurity's sysmon-config or Olaf Hartong's sysmon-modular, which already filter out common noise. Install with sysmon64.exe -accepteula -i config.xml and update the config later with sysmon64.exe -c config.xml.\n\nTest in a lab first and watch the event volume before rolling it out.",
        visual: {
          type: "compare",
          title: "Built-in Security log vs Sysmon",
          columns: [
            { title: "Security log", points: ["Logons and account changes", "4688 process start, if enabled", "No network-to-process link", "Configured by audit policy"] },
            { title: "Sysmon", points: ["Process start with hashes (ID 1)", "Network connection per process (ID 3)", "File, registry and DNS events", "Configured by an XML file"] },
          ],
        },
      },
      {
        heading: "Querying events with PowerShell",
        body: "Get-WinEvent is the modern cmdlet. Always filter at the source with -FilterHashtable, which is much faster than reading everything and piping to Where-Object. You can filter by LogName, Id, ProviderName, StartTime and EndTime.\n\nThe fields you want, such as TargetUserName or IpAddress, are inside the event's XML. Convert each event with [xml]$event.ToXml() and read Event.EventData.Data, which is a list of Name and value pairs. This works the same for every event ID, so you can reuse the pattern.\n\nRemember that the Security log has a size limit (often only 20 MB by default) and old events are overwritten. On a busy server that may be just a few hours. Forward events to a central collector or SIEM so evidence survives, and raise the log size on important machines.",
        bullets: ["Reading the Security log needs an elevated PowerShell", "wevtutil qe Security /c:5 /rd:true /f:text shows the 5 newest events", "Use -MaxEvents to keep test queries fast"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Event trail of a typical intrusion on one host",
        steps: [
          { label: "4625 x many", detail: "Password guessing over RDP (type 10)" },
          { label: "4624 type 10", detail: "A guess works; attacker signs in" },
          { label: "4688 / Sysmon 1", detail: "Tools run from a temp folder" },
          { label: "7045", detail: "New service for persistence" },
          { label: "4720 + 4732", detail: "New user added to Administrators" },
          { label: "1102", detail: "Security log cleared to hide tracks" },
        ],
      },
    ],
    examples: [
      {
        title: "Who is failing to log in, and from where?",
        explanation: "Step 1: query 4625 events from the last 24 hours. Step 2: turn each event's XML data into named fields. Step 3: group by source IP and user. Step 4: read the result: hundreds of failures from one external IP against many different user names is password spraying. Step 5: check for a 4624 from the same IP afterwards. If there is one, that account is likely compromised: reset it, and review its activity.",
        code: {
          lang: "powershell",
          code: "$f = @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddDays(-1)}\nGet-WinEvent -FilterHashtable $f | ForEach-Object {\n  $d = @{}\n  ([xml]$_.ToXml()).Event.EventData.Data | ForEach-Object { $d[$_.Name] = $_.'#text' }\n  [pscustomobject]@{ Ip = $d.IpAddress; User = $d.TargetUserName; Type = $d.LogonType }\n} | Group-Object Ip | Sort-Object Count -Descending |\n  Select-Object -First 10 Count, Name",
        },
      },
      {
        title: "Spotting a suspicious new service",
        explanation: "Step 1: list 7045 events from the System log for the last week. Step 2: look at the service file path. Normal services run from C:\\Program Files or C:\\Windows\\System32. Step 3: a service named something random, running a file from C:\\Users\\Public or a temp folder, or running cmd.exe or powershell.exe with arguments, is a red flag. Step 4: check the time against 4624 logons to see which account was signed in, and get the file's hash from Sysmon event 1 to look it up.",
        code: {
          lang: "powershell",
          code: "Get-WinEvent -FilterHashtable @{LogName='System'; Id=7045; StartTime=(Get-Date).AddDays(-7)} |\n  ForEach-Object {\n    $d = @{}\n    ([xml]$_.ToXml()).Event.EventData.Data | ForEach-Object { $d[$_.Name] = $_.'#text' }\n    [pscustomobject]@{ Time = $_.TimeCreated; Name = $d.ServiceName; Path = $d.ImagePath }\n  } | Format-Table -AutoSize",
        },
      },
    ],
    cheatSheet: [
      "4624 logon success, 4625 failure, 4634 logoff, 4672 admin-level logon",
      "Logon types: 2 keyboard, 3 network, 5 service, 10 RDP, 11 cached",
      "4625 status 0xC000006A wrong password; 0xC0000064 no such user",
      "4688 needs Audit Process Creation plus the command-line setting",
      "7045 (System) new service; 4698 new scheduled task; 1102 log cleared",
      "Sysmon: 1 process, 3 network, 11 file create, 22 DNS, 10 process access",
      "Get-WinEvent -FilterHashtable is far faster than Where-Object filtering",
      "Install Sysmon: sysmon64.exe -accepteula -i config.xml; update with -c",
    ],
    quiz: [
      {
        q: "You see many 4624 events with Logon Type 3 on a file server. What do they usually mean?",
        options: ["Remote Desktop sessions", "People signing in at the keyboard", "Network logons, such as accessing shared folders", "Services starting at boot"],
        answer: 2,
        why: "Type 3 is a network logon, which is normal and frequent on file servers.",
      },
      {
        q: "Event 4688 shows powershell.exe but no command line. What is missing?",
        options: ["Sysmon is not installed", "The \"Include command line in process creation events\" policy", "Event 4104 is disabled", "The user lacks admin rights"],
        answer: 1,
        why: "Command lines in 4688 need that separate policy setting to be enabled.",
      },
      {
        q: "Which Sysmon event ID links a network connection to the program that made it?",
        options: ["3", "1", "11", "22"],
        answer: 0,
        why: "Sysmon event 3 records network connections with the process image and ID.",
      },
      {
        q: "Which event should almost always trigger an investigation on a server?",
        options: ["4634 logoff", "4624 type 5", "7036 service state change", "1102 audit log cleared"],
        answer: 3,
        why: "Clearing the Security log is rare in normal admin work and common when hiding tracks.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On your own Windows PC, find your 5 most recent successful logons and note their logon types.",
        hint: "Use Get-WinEvent with Id 4624 and -MaxEvents in an elevated PowerShell.",
        solution: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 5 |\n  ForEach-Object {\n    $d = @{}\n    ([xml]$_.ToXml()).Event.EventData.Data | ForEach-Object { $d[$_.Name] = $_.'#text' }\n    \"$($_.TimeCreated)  $($d.TargetUserName)  type $($d.LogonType)\"\n  }",
      },
      {
        level: "medium",
        task: "In a lab VM, install Sysmon with a community config, run ping example.com and find the matching Sysmon process and DNS events.",
        hint: "Sysmon events are in Microsoft-Windows-Sysmon/Operational; look for IDs 1 and 22.",
        solution: "# Download Sysmon and a config (e.g. sysmonconfig-export.xml) first\n.\\Sysmon64.exe -accepteula -i .\\sysmonconfig-export.xml\nping example.com\nGet-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; Id=1,22} -MaxEvents 20 |\n  Where-Object { $_.Message -match 'ping|example.com' } |\n  Format-List TimeCreated, Id, Message",
      },
      {
        level: "hard",
        task: "Write a script that finds IPs with 10 or more failed logons followed by at least one successful logon in the last 24 hours.",
        hint: "Collect 4625 and 4624 events, extract IpAddress, count failures, then check successes.",
        solution: "$since = (Get-Date).AddDays(-1)\nfunction Get-Ips($id) {\n  Get-WinEvent -FilterHashtable @{LogName='Security'; Id=$id; StartTime=$since} -ErrorAction SilentlyContinue |\n    ForEach-Object { ([xml]$_.ToXml()).Event.EventData.Data |\n      Where-Object Name -eq 'IpAddress' | ForEach-Object { $_.'#text' } }\n}\n$fails = Get-Ips 4625 | Group-Object | Where-Object Count -ge 10\n$ok = Get-Ips 4624 | Sort-Object -Unique\n$fails | Where-Object { $ok -contains $_.Name } |\n  ForEach-Object { \"ALERT $($_.Name): $($_.Count) failures then success\" }",
      },
    ],
    faq: [
      { q: "Where are Windows event logs stored on disk?", a: "As .evtx files in C:\\Windows\\System32\\winevt\\Logs. You can copy them for analysis and open them in Event Viewer or with Get-WinEvent -Path." },
      { q: "Is Sysmon free and safe to use in production?", a: "Yes, it is a free Microsoft Sysinternals tool used widely in production. The main risk is too much event volume, so start with a tuned community config and test first." },
      { q: "Why do I not see event 4688 at all?", a: "Process creation auditing is off by default. Enable Audit Process Creation under Advanced Audit Policy, through Group Policy or auditpol." },
      { q: "What is the difference between 4624 and 4672?", a: "4624 says a logon succeeded. 4672 appears alongside it when that logon received special, admin-level privileges, so it helps you spot admin sign-ins." },
    ],
  },

  "sec-systems/vuln-patching": {
    plain: [
      "A vulnerability is a weakness in software or configuration that an attacker could use. New ones are found every day: tens of thousands are published each year. No team can fix them all at once, so vulnerability management is really about choosing what to fix first.",
      "Each public vulnerability gets an ID called a CVE, such as CVE-2021-44228 for Log4Shell. A CVSS score from 0 to 10 says how bad it could be in general. But a high score does not mean attackers are using it. That is why lists of actually exploited bugs matter so much.",
      "A vulnerability scanner checks your machines against a big database of known problems. It can look from the outside, like an attacker, or sign in with an account to check installed versions in detail. Signing in finds far more.",
      "The work is a loop: know your assets, scan them, decide what matters most, fix it, and scan again to prove it is fixed. Teams track this with deadlines, so critical problems on internet-facing systems never wait for months.",
    ],
    deepDive: [
      {
        heading: "CVE, CVSS, EPSS and KEV: four different questions",
        body: "These names sound alike but answer different questions. A CVE (Common Vulnerabilities and Exposures) ID answers \"which flaw?\". IDs look like CVE-2024-3094 and are assigned by CVE Numbering Authorities, often the software vendor.\n\nCVSS (Common Vulnerability Scoring System) answers \"how bad could it be?\". The base score uses factors like attack vector (network or local), complexity, privileges needed and impact. Bands are Low 0.1 to 3.9, Medium 4.0 to 6.9, High 7.0 to 8.9 and Critical 9.0 to 10.0. Version 3.1 is still the most common; version 4.0 was released in 2023.\n\nEPSS (Exploit Prediction Scoring System, from FIRST) answers \"how likely is exploitation in the next 30 days?\" as a probability. The CISA KEV (Known Exploited Vulnerabilities) catalog answers \"is it already being exploited?\". If a CVE is in KEV, attackers use it today.",
        visual: {
          type: "compare",
          title: "What each label tells you",
          columns: [
            { title: "CVSS", points: ["Severity if exploited", "0.0 to 10.0", "Same for everyone", "Says nothing about attackers"] },
            { title: "EPSS", points: ["Chance of exploitation", "Probability 0 to 1", "Updated daily", "Next 30 days"] },
            { title: "KEV", points: ["Exploited in the wild", "Yes or no list", "Run by CISA", "Fix these first"] },
          ],
        },
      },
      {
        heading: "Reading a CVSS vector",
        body: "A CVSS score comes with a vector string that shows how it was calculated. For example, CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H scores 9.8. Read it as: attack vector Network (reachable remotely), attack complexity Low, privileges required None, user interaction None, scope Unchanged, and High impact on confidentiality, integrity and availability. In plain words: anyone on the network can fully take over the system without help.\n\nCompare AV:L/PR:L, which needs a local account first: still serious, but an attacker must already be inside. The vector helps you judge your own situation. A network-reachable bug on a server only reachable from a lab VLAN matters less than the same bug on a public web server, even with the same score.",
        bullets: ["AV: N network, A adjacent, L local, P physical", "PR: privileges needed, N none, L low, H high", "UI: R means a user must click or open something"],
      },
      {
        heading: "Authenticated vs unauthenticated scans",
        body: "An unauthenticated scan looks at a host from the network, like an outsider. It sees open ports, service banners and responses, and guesses versions from them. It is quick but misses most problems in installed software that is not listening on the network, such as an old browser or library.\n\nAn authenticated (credentialed) scan logs in, over SSH for Linux or SMB and WMI for Windows, and reads the real installed package versions and settings. It finds many more issues with fewer false positives. Use a dedicated scan account, protect its credentials, and give it only the rights the scanner documents.\n\nCommon tools include Greenbone OpenVAS (open source), Tenable Nessus (Nessus Essentials is free for up to 16 IPs) and Nuclei for web templates. Only scan systems you own or have written permission to test.",
      },
      {
        heading: "Prioritising by real risk",
        body: "A typical scan returns hundreds of findings. Sorting by CVSS alone sends teams after scary-looking bugs on unimportant machines. A better order combines several facts: Is it in KEV or does it have a high EPSS? Is the system reachable from the internet? How important is the asset, for example a domain controller or a payment system? Is a compensating control in place, such as the vulnerable feature being turned off?\n\nMany teams set deadlines (SLAs) by priority, for example critical internet-facing issues within days and medium internal ones within a month or two. US federal agencies must fix KEV entries by the due date CISA sets, and many companies copy that rule.\n\nWhen a fix is impossible, record an exception with an owner, a reason, a compensating control and an end date, and review it later.",
        visual: {
          type: "flow",
          title: "Deciding what to patch first",
          steps: [
            { label: "In KEV?", detail: "Yes: top priority" },
            { label: "Internet-facing?", detail: "Exposed systems move up" },
            { label: "Asset critical?", detail: "DCs, identity, payments first" },
            { label: "EPSS and CVSS", detail: "Break ties by likelihood and impact" },
            { label: "Set due date", detail: "SLA by priority; track it" },
          ],
        },
      },
      {
        heading: "Patching, verifying and measuring",
        body: "Patching in waves limits risk: first a small test group, then a pilot of real users, then everyone. Keep a rollback plan, such as a snapshot or the previous package version. Some fixes need a restart of the service or a reboot, so a patch is not done until the new code is actually running.\n\nVerification closes the loop: rescan the host and confirm the finding is gone, rather than trusting that the patch job reported success.\n\nMeasure progress with a few simple numbers: mean time to remediate by severity, the share of KEV findings past their due date, and scan coverage (what percent of known assets were scanned this month). Coverage matters because you cannot patch machines nobody knows about, so an accurate asset inventory comes first.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "One finding from discovery to closure",
        actors: ["Scanner", "Security team", "System owner"],
        messages: [
          { from: 0, to: 1, label: "Finding: CVE on web01, in KEV" },
          { from: 1, to: 2, label: "Ticket: priority 1, due in 7 days" },
          { from: 2, to: 1, label: "Patched test, then web01; restarted" },
          { from: 1, to: 0, label: "Request rescan of web01" },
          { from: 0, to: 1, label: "Finding gone" },
          { from: 1, to: 2, label: "Ticket closed, on time" },
        ],
      },
    ],
    examples: [
      {
        title: "Two findings, one decision",
        explanation: "A scan shows two findings. Finding A: CVSS 9.8 in a library on an internal test server with no internet access, EPSS low, not in KEV. Finding B: CVSS 7.5 on the public VPN gateway, listed in KEV. Step 1: check KEV first: B is being exploited now. Step 2: check exposure: B faces the internet, A does not. Step 3: decision: patch B today as an emergency change and track A with a normal deadline. The lower CVSS score wins because real-world risk is higher.",
      },
      {
        title: "Checking a CVE against KEV from the command line",
        explanation: "CISA publishes the KEV catalog as a JSON feed. Step 1: download it. Step 2: search for the CVE IDs your scanner reported. Step 3: print the due date and required action for any match. Step 4: add these to the top of your patch queue. Running this daily in a script keeps your priority list current as CISA adds new entries.",
        code: {
          lang: "bash",
          code: "curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \\\n  -o kev.json\nfor cve in CVE-2021-44228 CVE-2017-0144 CVE-2099-0001; do\n  jq -r --arg c \"$cve\" '.vulnerabilities[] | select(.cveID==$c)\n    | \"\\(.cveID) IN KEV: \\(.vulnerabilityName) | due \\(.dueDate)\"' kev.json\ndone",
        },
      },
    ],
    cheatSheet: [
      "CVE = which flaw; CVSS = how bad; EPSS = how likely; KEV = exploited now",
      "CVSS bands: Low 0.1-3.9, Medium 4.0-6.9, High 7.0-8.9, Critical 9.0-10.0",
      "AV:N/AC:L/PR:N/UI:N in a vector means remote, easy, no login, no click",
      "Authenticated scans read installed versions and find far more than network-only scans",
      "Fix KEV entries on internet-facing systems first",
      "A patch is done only when the new code runs: restart or reboot, then rescan",
      "Track exceptions with an owner, a reason, a compensating control and an end date",
      "You cannot patch what you do not know about: keep an asset inventory",
    ],
    quiz: [
      {
        q: "Which source tells you a vulnerability is already being exploited in the wild?",
        options: ["The CVSS base score", "The CVE ID number", "The CISA KEV catalog", "The vendor's release notes"],
        answer: 2,
        why: "KEV only lists vulnerabilities with evidence of active exploitation.",
      },
      {
        q: "A CVSS 3.1 score of 7.2 falls in which severity band?",
        options: ["Medium", "High", "Critical", "Low"],
        answer: 1,
        why: "High covers 7.0 to 8.9.",
      },
      {
        q: "Why does an authenticated scan usually find more issues?",
        options: ["It logs in and reads installed package versions directly", "It runs exploits against every service", "It ignores the firewall", "It uses a newer CVSS version"],
        answer: 0,
        why: "With credentials the scanner checks real installed software instead of guessing from network banners.",
      },
      {
        q: "What does EPSS estimate?",
        options: ["The cost of patching", "The CVSS score for a new CVE", "How many hosts are affected", "The probability a vulnerability is exploited in the next 30 days"],
        answer: 3,
        why: "EPSS from FIRST is a daily-updated probability of exploitation activity in the next 30 days.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Decode this vector in plain words: CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H. Who could exploit it?",
        hint: "Go metric by metric: AV, AC, PR, UI, then the C, I, A impacts.",
        solution: "AV:L local access needed; AC:L easy; PR:L needs a low-privilege account;\nUI:N no user click; S:U scope unchanged; C/I/A:H full impact.\nIn plain words: someone who already has a normal account on the machine\ncan easily take full control (local privilege escalation). Score: 7.8 High.",
      },
      {
        level: "medium",
        task: "In a lab, scan two VMs with OpenVAS or Nessus Essentials: once unauthenticated and once with credentials. Compare the number of findings.",
        hint: "Create an SSH credential for the Linux VM in the scanner, and attach it to a second scan task.",
        solution: "1. Create target lab-linux (192.168.56.10), no credentials. Run scan.\n2. Add an SSH credential (dedicated scan user) to the target. Run again.\n3. Typical result: unauthenticated finds a few service issues;\n   authenticated finds many more from outdated packages (kernel, openssl...).\n4. Note: patch with apt/dnf upgrade, reboot if needed, rescan, confirm closed.",
      },
      {
        level: "hard",
        task: "Write a simple priority rule (pseudo-code or Python) that assigns P1 to P4 using KEV, internet exposure, asset criticality, EPSS and CVSS. Apply it to three sample findings.",
        hint: "Put KEV and exposure first; use CVSS only to break ties.",
        solution: "def priority(f):\n    if f[\"kev\"] and f[\"internet\"]: return \"P1\"\n    if f[\"kev\"] or (f[\"internet\"] and f[\"epss\"] >= 0.1): return \"P2\"\n    if f[\"critical_asset\"] or f[\"cvss\"] >= 9.0: return \"P3\"\n    return \"P4\"\nfindings = [\n  {\"id\": \"A\", \"kev\": True,  \"internet\": True,  \"epss\": 0.9, \"critical_asset\": False, \"cvss\": 7.5},\n  {\"id\": \"B\", \"kev\": False, \"internet\": False, \"epss\": 0.01, \"critical_asset\": False, \"cvss\": 9.8},\n  {\"id\": \"C\", \"kev\": False, \"internet\": False, \"epss\": 0.02, \"critical_asset\": False, \"cvss\": 5.0}]\nfor f in findings: print(f[\"id\"], priority(f))   # A P1, B P3, C P4",
      },
    ],
    faq: [
      { q: "What is the difference between a vulnerability scan and a penetration test?", a: "A scan is automated and checks for known issues across many systems. A penetration test is a person, with permission, trying to actually exploit weaknesses and chain them together, which finds logic flaws a scanner misses." },
      { q: "Is a CVSS 10 always the top priority?", a: "No. CVSS measures possible severity, not whether attackers use it or whether your system is exposed. A KEV-listed 7.5 on an internet-facing server is often more urgent than a 10 on an isolated test box." },
      { q: "How often should I scan?", a: "Many teams scan at least weekly, and continuously for internet-facing systems. Also scan after big changes and right after urgent advisories, to find affected systems quickly." },
    ],
  },
};

export default extra;
