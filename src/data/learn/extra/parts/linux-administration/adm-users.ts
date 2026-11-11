import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-users/users-groups": {
    plain: [
      "Every person and every service on a Linux server has an account. To the kernel, an account is just a number called the UID (user ID). The name, such as alice, is only a label that the system looks up in a file. Files are owned by the number, not the name.",
      "Groups collect accounts together. Each user has one primary group, which new files get by default, and can be a member of more supplementary groups. Adding a user to a group is the normal way to give them access to a shared folder, a device or admin rights.",
      "Account details live in plain text files: /etc/passwd lists accounts, /etc/shadow holds the password hashes and password rules, and /etc/group lists groups and their members. You rarely edit these by hand. Tools like useradd, usermod, groupadd and passwd change them safely.",
      "Good account hygiene matters for security. Each person gets their own account, services get accounts that cannot log in, passwords expire on a schedule when policy requires it, and accounts are locked the day someone leaves.",
    ],
    deepDive: [
      {
        heading: "Reading /etc/passwd and /etc/shadow line by line",
        body: "/etc/passwd has seven colon-separated fields: name, x (meaning the password is in shadow), UID, primary GID, a comment such as the full name, the home directory and the login shell. It must be readable by everyone so that ls can turn UIDs into names.\n\n/etc/shadow is readable only by root. Its fields are: name, password hash, date of the last change, minimum days, maximum days, warning days, inactive days, account expiry date and a reserved field. Dates are counted in days since 1 January 1970. The hash starts with its method: $6$ is SHA-512 and $y$ is yescrypt, the default on recent Ubuntu. A hash starting with ! means the password is locked, !! on RHEL means no password was ever set, and * means password login is impossible.",
        bullets: ["getent passwd alice reads the account from every source, including LDAP", "UID 0 is root; system accounts use low UIDs; people start at 1000", "pwck checks passwd and shadow for errors"],
      },
      {
        heading: "What useradd actually does",
        body: "useradd reads its defaults from two places. /etc/login.defs sets UID ranges (UID_MIN 1000), password aging defaults, whether to create a home directory and whether to make a private group per user. /etc/default/useradd sets the default shell and the skeleton directory; useradd -D prints them.\n\nWith the usual settings, useradd alice picks the next free UID, creates a group alice with the same number, creates /home/alice, copies the files from /etc/skel into it and leaves the password locked until you run passwd. On RHEL the home directory is created automatically. On Ubuntu, plain useradd does not create one unless you add -m and its default shell is /bin/sh, which is why Ubuntu admins often use the friendlier adduser wrapper instead.",
        visual: {
          type: "flow",
          title: "useradd -m -G devs alice",
          steps: [
            { label: "Read defaults", detail: "/etc/login.defs and /etc/default/useradd" },
            { label: "Pick UID and group", detail: "Next free UID from 1000, private group alice" },
            { label: "Write the files", detail: "passwd, shadow, group, gshadow" },
            { label: "Create the home", detail: "/home/alice with copies of /etc/skel" },
            { label: "Add to devs", detail: "Supplementary group membership" },
            { label: "Password stays locked", detail: "Until you run passwd alice" },
          ],
        },
      },
      {
        heading: "Group membership and when it takes effect",
        body: "Group membership is copied into a process when the user logs in, and every child process inherits that list. So after usermod -aG docker alice, her current shell still lacks the new group; id alice shows it, but plain id in her session does not. She must log out and back in, or start a new login with su - alice. newgrp docker opens a new shell with the group active.\n\nusermod -G with a list replaces all supplementary groups, so a missing -a quietly removes the user from wheel or sudo. gpasswd -a alice devs adds one group and gpasswd -d alice devs removes one, which is often clearer.\n\nYou cannot delete a group that is still some user's primary group. userdel -r alice removes the account, her home and mail spool, but files elsewhere keep her old UID; find / -nouser finds them before a new user gets that number.",
        bullets: ["id alice shows the stored groups; id shows your current process", "groups alice lists group names only", "groupmod -n newname oldname renames a group"],
      },
      {
        heading: "Password aging and password quality",
        body: "chage manages the aging fields in /etc/shadow. -M 90 forces a change every 90 days, -m 1 stops users changing their password back immediately, -W 7 warns seven days before, and -I 14 locks the account if the password stays expired for 14 more days. -E 2026-12-31 expires the whole account on that date, and chage -d 0 alice forces a new password at the next login.\n\nPASS_MAX_DAYS and friends in /etc/login.defs are only copied to accounts when they are created; changing them later does not touch existing users. Password strength (length, character classes, dictionary words) is not set in login.defs at all. It comes from the PAM module pam_pwquality, configured in /etc/security/pwquality.conf with settings such as minlen = 12.",
        visual: {
          type: "flow",
          title: "Password aging timeline with chage -m 1 -M 90 -W 7 -I 14",
          steps: [
            { label: "Day 0: password set", detail: "Stored as the last change date" },
            { label: "Day 1", detail: "User may change it again" },
            { label: "Day 83", detail: "Login shows a warning" },
            { label: "Day 90", detail: "Expired: must change at login" },
            { label: "Day 104", detail: "Inactive period over: account locked" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to stop someone logging in",
        columns: [
          { title: "usermod -L (passwd -l)", points: ["Puts ! in front of the hash", "Blocks password logins", "SSH keys may still work", "Undo with usermod -U"] },
          { title: "usermod -s /sbin/nologin", points: ["Blocks interactive shells", "Account still owns files and runs services", "Normal for service accounts", "Undo by setting a real shell"] },
          { title: "usermod -e 1 (expire)", points: ["Account expired since 2 Jan 1970", "PAM refuses every login method", "Includes SSH keys", "Undo with usermod -e ''"] },
        ],
      },
    ],
    examples: [
      {
        title: "Onboard a contractor with an end date",
        explanation: "A contractor, ravi, starts today and leaves at the end of the year. He needs to be in group devs and must pick his own password at first login. Step 1: create the account with a home, a full name, the extra group and an expiry date. Step 2: set a temporary password. Step 3: force a change at the next login and set a 90-day maximum. Step 4: check the result with chage -l and id.",
        code: {
          lang: "bash",
          code: "sudo useradd -m -c \"Ravi K (contractor)\" -G devs -e 2026-12-31 ravi\necho 'ravi:Temp-Pass-2026!' | sudo chpasswd\nsudo chage -d 0 -M 90 -W 7 ravi\nsudo chage -l ravi\n# Password must be changed / Account expires : Dec 31, 2026\nid ravi",
        },
      },
      {
        title: "Offboard a leaver properly",
        explanation: "Mark leaves the company today. Step 1: expire and lock the account so no method works, SSH keys included. Step 2: end his running sessions and processes. Step 3: archive his home directory for the retention period. Step 4: remove the account. Step 5: find files elsewhere that still carry his old UID, so you can reassign them before that UID is reused.",
        code: {
          lang: "bash",
          code: "sudo usermod -L -e 1 mark\nsudo loginctl terminate-user mark\nsudo pkill -KILL -u mark\nsudo tar -czf /root/archive/mark-home-$(date +%F).tgz -C /home mark\nsudo userdel -r mark\nsudo find / -xdev -nouser -ls 2>/dev/null | head",
        },
      },
    ],
    cheatSheet: [
      "usermod -aG grp user adds a group; without -a it replaces all supplementary groups",
      "gpasswd -d user grp removes a user from one group",
      "useradd -D shows defaults; /etc/login.defs holds UID ranges and aging defaults",
      "chage -d 0 user forces a password change at next login",
      "chage -E 2026-12-31 user expires the account on that date",
      "usermod -L only locks the password; usermod -e 1 blocks every login method",
      "getent group devs shows a group and its members from all sources",
      "Password strength rules live in /etc/security/pwquality.conf, not login.defs",
    ],
    quiz: [
      {
        q: "You ran usermod -G devs alice. What happened to her other supplementary groups?",
        options: ["They were kept", "They were removed; only devs remains", "devs became her primary group", "Nothing, the command needs -a to run"],
        answer: 1,
        why: "Without -a, -G sets the complete list of supplementary groups.",
      },
      {
        q: "A user was added to the docker group, but docker commands still fail in her open terminal. Why?",
        options: ["Groups are read at login, so the current session does not have it yet", "The docker group needs a GID below 1000", "She must also be in wheel", "Group changes need a reboot"],
        answer: 0,
        why: "A process keeps the group list it got at login; a new login picks up the change.",
      },
      {
        q: "In /etc/shadow, what does a password field starting with ! mean?",
        options: ["The password is empty", "The account is root", "The hash uses yescrypt", "The password is locked"],
        answer: 3,
        why: "Locking adds ! in front of the hash so it can never match.",
      },
      {
        q: "You change PASS_MAX_DAYS to 60 in /etc/login.defs. Which accounts are affected?",
        options: ["All accounts at the next login", "Only accounts created from now on", "Only root", "Only accounts in wheel"],
        answer: 1,
        why: "login.defs aging values are copied at account creation; use chage for existing users.",
      },
      {
        q: "Which command blocks all logins for an account, including SSH key logins?",
        options: ["passwd -l user", "usermod -L user", "usermod -e 1 user", "chage -W 0 user"],
        answer: 2,
        why: "An expired account is refused by PAM's account check, whatever the authentication method.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a group ops with GID 4000 and a user sam whose supplementary group is ops. Show his UID, GID and groups.",
        hint: "groupadd -g sets the GID; useradd -m -G adds supplementary groups.",
        solution: "sudo groupadd -g 4000 ops\nsudo useradd -m -G ops sam\nsudo passwd sam\nid sam\n# uid=1001(sam) gid=1001(sam) groups=1001(sam),4000(ops)",
      },
      {
        level: "medium",
        task: "Make every new account get a 60-day maximum password age, a 7-day warning, and a minimum length of 12 characters. Then apply the same aging to the existing user sam.",
        hint: "Aging defaults go in /etc/login.defs; length goes in pwquality.conf; existing users need chage.",
        solution: "sudo sed -i -E 's/^PASS_MAX_DAYS.*/PASS_MAX_DAYS   60/; s/^PASS_WARN_AGE.*/PASS_WARN_AGE   7/' /etc/login.defs\ngrep -E '^PASS_(MAX_DAYS|WARN_AGE)' /etc/login.defs\necho 'minlen = 12' | sudo tee -a /etc/security/pwquality.conf\nsudo chage -M 60 -W 7 sam\nsudo chage -l sam",
      },
      {
        level: "hard",
        task: "Create a service account bkpsvc with no home directory, no login shell, a fixed UID of 990 and its own group, then prove nobody can get a shell as it.",
        hint: "useradd -r makes a system account; -M skips the home; -s sets the shell.",
        solution: "sudo groupadd -r -g 990 bkpsvc\nsudo useradd -r -u 990 -g bkpsvc -M -d /var/lib/bkpsvc -s /sbin/nologin bkpsvc\ngetent passwd bkpsvc\n# bkpsvc:x:990:990::/var/lib/bkpsvc:/sbin/nologin\nsudo su - bkpsvc        # This account is currently not available.\nsudo -u bkpsvc id       # commands still run as bkpsvc",
      },
    ],
    faq: [
      { q: "What is the difference between useradd and adduser?", a: "useradd is the low-level tool on every distribution. On Ubuntu and Debian, adduser is a friendlier script that asks questions and creates the home directory; on RHEL, adduser is simply a link to useradd." },
      { q: "Why does /etc/passwd show x instead of a password?", a: "The x means the real password hash is in /etc/shadow, which only root can read. Long ago hashes were in /etc/passwd itself, readable by everyone." },
      { q: "How do I see which groups a user is in?", a: "Run id username or groups username. For the groups of your own current session, run id with no argument." },
      { q: "Can two users have the same UID?", a: "The tools can force it, but the kernel then treats them as the same user for every file and process. Avoid it; give each account its own UID." },
    ],
  },

  "adm-users/sudo": {
    plain: [
      "Logging in as root for daily work is risky: one typo can damage the whole system, and nobody can tell who did what. sudo solves both. Normal users run single commands as root by putting sudo in front, and every use is written to the log with their name.",
      "Who may use sudo, and for what, is written in rules. The main file is /etc/sudoers, and extra rules go in small files inside /etc/sudoers.d/. You edit them with visudo, which refuses to save a file with a mistake in it.",
      "The simplest setup is a group with full rights: wheel on RHEL and sudo on Ubuntu. Add a person to that group and they can do anything with sudo. Better practice for teams and automation is to grant only the commands someone really needs, such as restarting one service.",
      "sudo asks for the user's own password, not root's. After a correct password, it remembers you for a few minutes, so a series of commands does not ask again each time.",
    ],
    deepDive: [
      {
        heading: "Anatomy of a sudoers rule",
        body: "A rule reads: who, on which hosts, as whom, with which options, may run what. %ops ALL=(root) NOPASSWD: /usr/bin/systemctl restart httpd means members of group ops (the % marks a group), on any host, may run that exact command as root without a password. The host field matters only when one sudoers file is shared across many machines, so it is usually ALL.\n\nCommands must use full paths. If you list a command without arguments, any arguments are allowed. If you list it with arguments, only exactly those are allowed, and \"\" means no arguments at all. Several commands are separated by commas, and a command prefixed with ! is excluded.\n\nWhen more than one rule matches, the last matching one wins. Put broad rules first and specific exceptions after them.",
        visual: {
          type: "flow",
          title: "%ops ALL=(root) NOPASSWD: /usr/bin/systemctl restart httpd",
          steps: [
            { label: "%ops", detail: "Who: any member of group ops" },
            { label: "ALL=", detail: "Which hosts the rule applies on" },
            { label: "(root)", detail: "Run the command as root" },
            { label: "NOPASSWD:", detail: "Optional tag: no password prompt" },
            { label: "/usr/bin/systemctl restart httpd", detail: "Exactly this command and arguments" },
          ],
        },
      },
      {
        heading: "Drop-in files and the rules visudo enforces",
        body: "The main /etc/sudoers ends with an include line (written #includedir or @includedir) that reads every file in /etc/sudoers.d. Package updates may replace /etc/sudoers, but they leave your drop-ins alone, so put your rules there: one file per team or purpose.\n\nA surprising rule: sudo skips files in that directory whose names contain a dot or end with ~. So /etc/sudoers.d/ops works, but /etc/sudoers.d/ops.conf is silently ignored. Files should be owned by root with mode 0440; visudo -f sets that for you.\n\nvisudo -c checks the main file and every include; visudo -cf /etc/sudoers.d/ops checks one file. If you do break sudo, you need another way in: the root password, a root SSH key or a rescue boot.",
        bullets: ["RHEL: %wheel ALL=(ALL) ALL", "Ubuntu: %sudo ALL=(ALL:ALL) ALL", "User_Alias and Cmnd_Alias group names and commands for long rules", "sudo -l -U alice shows what alice may run"],
      },
      {
        heading: "Rules that accidentally give full root",
        body: "Some commands can start other programs, so allowing them is the same as allowing everything. Editors (vi, vim, nano), pagers (less, more), find with -exec, tar, awk, python and any shell can all spawn a root shell. A rule like alice ALL=(root) /usr/bin/vim /etc/hosts lets alice type :!bash inside vim and become root.\n\nFor editing files, grant sudoedit instead: alice ALL=(root) sudoedit /etc/hosts. sudo copies the file, opens the copy in alice's own editor as alice, and writes it back as root afterwards, so the editor never runs as root.\n\nAlso avoid wildcards in arguments and scripts that users can modify. A NOPASSWD rule for /home/deploy/run.sh is a root shell for anyone who can edit that file. Keep such scripts root-owned in /usr/local/bin.",
        bullets: ["sudoedit file is the same as sudo -e file", "The NOEXEC tag stops many programs from starting others", "Never allow sudo for a script the user can write to"],
      },
      {
        heading: "Shells, cached passwords and logs",
        body: "sudo -i starts a root login shell: it reads root's startup files and moves to /root. sudo -s starts a root shell but keeps much of your environment. su - switches user too, but asks for the target account's password, which is why teams prefer sudo.\n\nAfter a correct password, sudo remembers you for 5 minutes by default, usually per terminal. sudo -v renews the timer, sudo -k forgets it, and Defaults timestamp_timeout=0 makes sudo ask every time. env_reset clears most environment variables and secure_path sets a fixed PATH, so a user cannot trick sudo with their own PATH.\n\nEvery sudo call is logged with the user, terminal, directory and command. Look in the journal with journalctl _COMM=sudo, or in /var/log/secure on RHEL and /var/log/auth.log on Ubuntu.",
        visual: {
          type: "compare",
          title: "Becoming root: sudo -i, sudo -s and su -",
          columns: [
            { title: "sudo -i", points: ["Your own password", "Root login shell, starts in /root", "Root's environment", "Logged under your name"] },
            { title: "sudo -s", points: ["Your own password", "Root shell in your current directory", "Keeps much of your environment", "Logged under your name"] },
            { title: "su -", points: ["Root's password", "Root login shell", "Needs the root password shared", "Log shows only the switch"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How sudo decides on one request",
        steps: [
          { label: "Read the policy", detail: "/etc/sudoers plus every file in sudoers.d" },
          { label: "Find matching rules", detail: "User or group, host, run-as user, command" },
          { label: "Last match wins", detail: "A later ! rule can deny an earlier allow" },
          { label: "Password check", detail: "Skipped with NOPASSWD or a recent timestamp" },
          { label: "Run and log", detail: "Clean environment, entry in the journal" },
        ],
      },
    ],
    examples: [
      {
        title: "A helpdesk group that can reset passwords, but not root's",
        explanation: "The helpdesk team needs to reset user passwords without having full root. Step 1: create a drop-in file with visudo -f, using a name without a dot. Step 2: allow passwd followed by a user name, and then deny any command line that mentions root; the deny comes last so it wins. Step 3: check the syntax. Step 4: list the rule as a helpdesk member and test both cases.",
        code: {
          lang: "bash",
          code: "sudo visudo -f /etc/sudoers.d/helpdesk\n# contents:\n# %helpdesk ALL=(root) /usr/bin/passwd [A-Za-z]*, !/usr/bin/passwd *root*\nsudo visudo -c\nsudo -l -U kim\nsudo -u kim sudo passwd alice     # allowed, asks kim's password first\nsudo -u kim sudo passwd root      # Sorry, user kim is not allowed",
        },
      },
      {
        title: "Let a deploy account run one script without a password",
        explanation: "A CI job logs in as deploy and must run /usr/local/bin/deploy-app as root with no prompt. Step 1: make the script owned by root and not writable by anyone else, or the rule becomes a root shell. Step 2: allow only that path with no arguments, using \"\". Step 3: test non-interactively with sudo -n, which fails instead of prompting. Step 4: confirm that arguments are refused.",
        code: {
          lang: "bash",
          code: "sudo chown root:root /usr/local/bin/deploy-app\nsudo chmod 755 /usr/local/bin/deploy-app\necho 'deploy ALL=(root) NOPASSWD: /usr/local/bin/deploy-app \"\"' \\\n  | sudo tee /etc/sudoers.d/deploy > /dev/null\nsudo chmod 440 /etc/sudoers.d/deploy\nsudo visudo -cf /etc/sudoers.d/deploy\nsudo -u deploy sudo -n /usr/local/bin/deploy-app        # runs\nsudo -u deploy sudo -n /usr/local/bin/deploy-app --x    # refused",
        },
      },
    ],
    cheatSheet: [
      "visudo -f /etc/sudoers.d/NAME edits a drop-in; never use a dot in NAME",
      "visudo -c checks every sudoers file before you log out",
      "sudo -l shows your own rights; sudo -l -U user shows someone else's",
      "In sudoers, the last matching rule wins, so put exceptions after general rules",
      "cmd \"\" in a rule means no arguments allowed; no args listed means any args",
      "Grant sudoedit /etc/file instead of an editor, which could spawn a root shell",
      "sudo -k forgets your cached password; the default cache is 5 minutes",
      "journalctl _COMM=sudo shows who ran what with sudo",
    ],
    quiz: [
      {
        q: "You create /etc/sudoers.d/web.conf with a valid rule, but it has no effect. Why?",
        options: ["The rule needs NOPASSWD", "sudo ignores files in sudoers.d whose names contain a dot", "Drop-ins need a reboot", "The file must be mode 777"],
        answer: 1,
        why: "Files with a dot or ending in ~ are skipped, so rename it to web.",
      },
      {
        q: "Which rule lets alice edit /etc/hosts as root without being able to start a root shell from her editor?",
        options: ["alice ALL=(root) /usr/bin/vim /etc/hosts", "alice ALL=(root) /usr/bin/nano /etc/hosts", "alice ALL=(root) /usr/bin/less /etc/hosts", "alice ALL=(root) sudoedit /etc/hosts"],
        answer: 3,
        why: "sudoedit runs the editor as alice on a copy and only writes the result as root.",
      },
      {
        q: "A rule allows /usr/bin/systemctl restart nginx. What happens with sudo systemctl stop nginx?",
        options: ["It is refused, because the arguments do not match", "It runs, since systemctl is allowed", "It runs after a second password", "It restarts nginx instead"],
        answer: 0,
        why: "When a rule lists arguments, only those exact arguments are permitted.",
      },
      {
        q: "On Ubuntu, which group gives full sudo rights by default?",
        options: ["wheel", "admin-users", "sudo", "root"],
        answer: 2,
        why: "Ubuntu's sudoers contains %sudo ALL=(ALL:ALL) ALL; RHEL uses wheel.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Give user natasha full sudo rights on a RHEL-family system and on Ubuntu, using the standard admin group on each. Verify it.",
        hint: "Add her to the right group, then log in again and use sudo -l.",
        solution: "# RHEL, Rocky, Alma\nsudo usermod -aG wheel natasha\n# Ubuntu\nsudo usermod -aG sudo natasha\n# then, as natasha after a new login:\nsudo -l          # (ALL) ALL",
      },
      {
        level: "medium",
        task: "Allow members of group webops to restart, reload and view the status of httpd only, without a password, and prove they cannot stop it.",
        hint: "List each full command in one rule; use a file in /etc/sudoers.d without a dot.",
        solution: "sudo visudo -f /etc/sudoers.d/webops\n# %webops ALL=(root) NOPASSWD: /usr/bin/systemctl restart httpd, \\\n#   /usr/bin/systemctl reload httpd, /usr/bin/systemctl status httpd\nsudo visudo -c\nsudo -u sam sudo -n systemctl reload httpd    # works (sam is in webops)\nsudo -u sam sudo -n systemctl stop httpd      # refused",
      },
      {
        level: "hard",
        task: "Make sudo ask for a password every time for user alice only, and log every sudo session's terminal input and output for her.",
        hint: "Use per-user Defaults lines: timestamp_timeout and log_input / log_output.",
        solution: "sudo visudo -f /etc/sudoers.d/alice-audit\n# Defaults:alice timestamp_timeout=0\n# Defaults:alice log_input, log_output\nsudo visudo -c\n# after alice runs some sudo commands:\nsudo sudoreplay -l user alice     # list recorded sessions\nsudo sudoreplay SESSION_ID        # replay one",
      },
    ],
    faq: [
      { q: "Does sudo ask for my password or root's?", a: "Your own. That is the point: root's password does not have to be shared, and each action is logged under your name." },
      { q: "What if I break /etc/sudoers?", a: "If you used visudo, it will not save a broken file. If it happened anyway, log in as root, use pkexec if polkit is available, or boot into rescue mode and fix the file." },
      { q: "Is NOPASSWD safe?", a: "It is fine for narrow commands used by automation. For broad rules it means anyone who gets into that account becomes root without any extra hurdle." },
      { q: "Why does sudo say command not found for a program in my PATH?", a: "sudo uses its own secure_path instead of your PATH. Use the full path to the program, or install it in a standard directory like /usr/local/bin." },
    ],
  },
};

export default extra;
