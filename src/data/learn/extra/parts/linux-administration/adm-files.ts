import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-files/file-management": {
    plain: [
      "Most admin work starts with moving files around: copying a config before you change it, renaming a log, removing old releases. The commands are short: cp copies, mv moves or renames, rm removes and mkdir creates a directory. There is no recycle bin on a server, so rm is final.",
      "A link is a second way to reach a file. A symbolic link (symlink) is a tiny file that holds a path, like a shortcut on a desktop. A hard link is a second name for exactly the same file data. Admins use symlinks all the time, for example to point current at the newest version of an app.",
      "find is the search tool. You tell it where to start and what to look for: a name, a size, an owner, an age. It walks through every folder below that point and prints each match. It can also run a command on every file it finds, such as copying, compressing or deleting.",
      "These tools are simple, but small mistakes are costly. A good habit is to look first (print the list), then act (run the real command), and keep a copy of anything you change.",
    ],
    deepDive: [
      {
        heading: "Inodes: what a file really is",
        body: "On ext4 and xfs, a file's data and details (owner, mode, size, timestamps) live in a structure called an inode, identified by a number. The file's name is not in the inode. A directory is just a list that maps names to inode numbers. ls -i shows those numbers.\n\nA hard link adds another name that points to the same inode. The second column of ls -l is the link count. The data is only freed when the count reaches zero and no process still has the file open. Because inode numbers are only unique inside one file system, hard links cannot cross file systems, and you cannot hard link a directory.\n\nA symlink is a separate small file that stores a path as text. It can point anywhere, even across file systems, and it breaks (dangles) if the target is removed.",
        visual: {
          type: "compare",
          title: "Hard link vs symbolic link",
          columns: [
            { title: "Hard link", points: ["Same inode as the original", "Works if the original name is deleted", "Same file system only", "Not allowed for directories"] },
            { title: "Symbolic link", points: ["Own inode that stores a path", "Breaks if the target is deleted", "Can cross file systems", "Can point to directories"] },
          ],
        },
      },
      {
        heading: "Copy, move and remove without surprises",
        body: "mv inside one file system is only a rename: the inode stays the same, so it is instant even for a 50 GB file. Across file systems, mv has to copy the data and then delete the original. cp makes a new file with you as the owner and fresh timestamps; cp -a keeps owner, mode, timestamps, links and extended attributes.\n\nThis matters for SELinux on RHEL. mv keeps the file's old security label, while cp gives the copy the label of its new directory. A file moved from your home into /var/www/html can therefore be blocked by SELinux until you run restorecon on it.\n\nFor safety, cp -i and mv -i ask before overwriting, and -n never overwrites. rm -I asks once before removing many files. To remove a file whose name starts with a dash, use rm -- -file or rm ./-file.",
        bullets: ["mkdir -p creates parent directories and does not fail if it exists", "cp -a /etc /root/etc-backup keeps a faithful copy", "rmdir only removes empty directories, which makes it safe"],
      },
      {
        heading: "How find reads its expression",
        body: "find checks every file against the expression from left to right and stops as soon as the result is known. Tests next to each other are joined by AND. -o means OR, ! means NOT, and parentheses group tests but must be escaped from the shell: find . \\( -name '*.log' -o -name '*.gz' \\) -size +10M.\n\nNumbers have rules. +n means more than n, -n means less than n, and n means exactly n. -mtime counts whole 24-hour periods, so -mtime +7 means modified more than 7 full days ago. -mmin works in minutes. -size rounds up to the unit, so -size -1M only matches empty files; use -size -1024k instead.\n\nOther useful tests: -type f, d or l, -user and -group, -nouser (files left behind by a deleted account), -perm, -newer file, and -maxdepth n to limit how deep find goes.",
        bullets: ["-iname matches names without caring about case", "-empty finds empty files and directories", "-xdev stays on one file system, handy when searching /"],
      },
      {
        heading: "Acting on results: -exec, + and xargs",
        body: "-exec cmd {} \\; runs cmd once per file, with {} replaced by the file name. -exec cmd {} + collects many names and runs cmd far fewer times, which is much faster on thousands of files. -ok works like -exec but asks before each one.\n\n-delete removes matches without starting rm at all, but its position matters: find evaluates left to right, so find . -delete -name '*.tmp' deletes everything before it ever checks the name. Always put -delete last and run the same command with -print first.\n\nWhen piping file names to xargs, names with spaces or newlines break the list. Use find ... -print0 | xargs -0 cmd, which separates names with a null byte that can never appear in a file name.",
        visual: {
          type: "compare",
          title: "Three ways to run a command on find results",
          columns: [
            { title: "-exec cmd {} \\;", points: ["One process per file", "Simple and safe with any name", "Slow on many files"] },
            { title: "-exec cmd {} +", points: ["Many files per process", "Much faster", "{} must be last before +"] },
            { title: "-print0 | xargs -0", points: ["Safe with spaces and newlines", "xargs -P runs jobs in parallel", "Good for long pipelines"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One inode, several names",
        root: "inode 1312 (the data)",
        children: [
          { label: "/srv/data/report.csv", children: ["Hard link, link count 2"] },
          { label: "/srv/archive/report.csv", children: ["Hard link, same inode"] },
          { label: "/home/ana/latest.csv", children: ["Symlink: stores the path /srv/data/report.csv", "Own inode, breaks if that name is removed"] },
        ],
      },
    ],
    examples: [
      {
        title: "Clean up old application logs safely",
        explanation: "/var/log/myapp is filling up. Policy says compressed logs older than 30 days can go. Step 1: list matches with sizes so you can see what would be removed. Step 2: total the space you will free. Step 3: run the same expression with -delete at the end. Step 4: check the result with du. Keeping the test command and the delete command identical, apart from the last action, is what makes this safe.",
        code: {
          lang: "bash",
          code: "cd /var/log/myapp\nsudo find . -name '*.gz' -mtime +30 -type f -printf '%TY-%Tm-%Td %s %p\\n' | sort\nsudo find . -name '*.gz' -mtime +30 -type f -printf '%s\\n' | awk '{s+=$1} END {print s/1048576 \" MB\"}'\nsudo find . -name '*.gz' -mtime +30 -type f -delete\nsudo du -sh .",
        },
      },
      {
        title: "Switch app releases with a symlink",
        explanation: "Each release of an app is unpacked into its own folder, and the web server always serves /srv/app/current. Step 1: unpack the new release into releases/2.4.0. Step 2: create the new link under a temporary name. Step 3: rename it over current with mv -T, which replaces the link in one step, so no request ever sees a missing path. Rolling back is the same two commands pointing at the old folder. ln -sfn also works but removes and recreates the link, leaving a tiny gap.",
        code: {
          lang: "bash",
          code: "cd /srv/app\nls releases\n# 2.3.1  2.4.0\nln -s releases/2.4.0 current.tmp\nmv -T current.tmp current\nls -l current\n# current -> releases/2.4.0\nreadlink -f current          # /srv/app/releases/2.4.0",
        },
      },
    ],
    cheatSheet: [
      "ls -li shows inode numbers and the link count of each file",
      "cp -a src dst keeps owner, mode, timestamps and links",
      "mv keeps the SELinux label; run restorecon -v file after moving into a web or service directory",
      "find / -xdev -size +500M -type f 2>/dev/null finds big files on the root file system only",
      "find /home -nouser lists files whose owner account was deleted",
      "find . -name '*.tmp' -print first, then replace -print with -delete",
      "find . -type f -print0 | xargs -0 grep -l TODO handles names with spaces",
      "A relative symlink target is resolved from the link's own directory, not your current one",
    ],
    quiz: [
      {
        q: "A file has a link count of 2. You delete one of its names with rm. What happens to the data?",
        options: ["It is deleted at once", "It is moved to /tmp", "It stays, reachable through the other name", "The other name becomes a broken link"],
        answer: 2,
        why: "Data is freed only when the link count reaches zero and no process has it open.",
      },
      {
        q: "Which command finds files modified more than 7 full days ago?",
        options: ["find . -mtime +7", "find . -mtime -7", "find . -mtime 7", "find . -newer 7"],
        answer: 0,
        why: "+n means more than n whole 24-hour periods.",
      },
      {
        q: "Why is find . -delete -name '*.tmp' dangerous?",
        options: ["-delete needs sudo", "It only deletes directories", "-name is not valid after -delete", "-delete runs before the name test, so every file is removed"],
        answer: 3,
        why: "find evaluates left to right, so -delete is applied to every file before -name is checked.",
      },
      {
        q: "Why can you not create a hard link from /home/a.txt to /data/a.txt when /data is a different disk?",
        options: ["Hard links need root", "An inode number only has meaning inside its own file system", "Hard links only work for directories", "The target must already exist"],
        answer: 1,
        why: "A hard link is a directory entry pointing at an inode, and inode numbers are per file system.",
      },
      {
        q: "On RHEL, you mv index.html from your home into /var/www/html and Apache gets permission denied. What is the likely fix?",
        options: ["chmod 777 index.html", "Reinstall httpd", "restorecon -v /var/www/html/index.html", "Move it back and use ln -s"],
        answer: 2,
        why: "mv kept the home directory SELinux label; restorecon applies the correct one for its new place.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a file, a hard link and a symlink to it. Delete the original name and show which link still works.",
        hint: "Compare the inode numbers with ls -li before deleting.",
        solution: "echo hello > orig.txt\nln orig.txt hard.txt\nln -s orig.txt soft.txt\nls -li orig.txt hard.txt soft.txt\nrm orig.txt\ncat hard.txt          # hello\ncat soft.txt          # No such file or directory",
      },
      {
        level: "medium",
        task: "Find all regular files under /etc that are larger than 100 KiB and were changed in the last 30 days. Show their sizes in human-readable form, biggest first.",
        hint: "Combine -type, -size and -mtime, then pass the names to du with -exec ... +.",
        solution: "sudo find /etc -type f -size +100k -mtime -30 -exec du -h {} + | sort -rh",
      },
      {
        level: "hard",
        task: "Copy every file owned by user harry from anywhere on the system into /root/harry-files, keeping the original directory structure and attributes, without crossing into /proc or other mounted file systems.",
        hint: "Run find from / with -xdev and feed the list to cp --parents or to rsync with --files-from.",
        solution: "sudo mkdir -p /root/harry-files\nsudo find / -xdev -user harry -type f -print0 \\\n  | sudo xargs -0 -r cp -a --parents -t /root/harry-files\nsudo find /root/harry-files -type f | head\n# --parents recreates the source path below the target",
      },
    ],
    faq: [
      { q: "What is the difference between cp -r and cp -a?", a: "cp -r copies directories recursively, but the copies get you as owner and new timestamps. cp -a copies recursively and keeps owner, mode, timestamps, symlinks and extended attributes." },
      { q: "Can I undo rm?", a: "Not reliably. There is no trash bin on the command line, so keep backups or snapshots and use rm -i or rm -I when you are unsure." },
      { q: "Is a symlink the same as a Windows shortcut?", a: "Close. Both point to another path, but a symlink is handled by the kernel, so every program follows it automatically, not just the file manager." },
      { q: "Why does find print Permission denied so often?", a: "As a normal user you cannot read many system directories. Run it with sudo, or add 2>/dev/null to hide those errors." },
    ],
  },

  "adm-files/permissions": {
    plain: [
      "Every file and directory on Linux has an owner (a user), a group, and three sets of permissions: one for the owner, one for the group and one for everyone else. Each set says whether that person may read (r), write (w) or execute (x).",
      "You see this in ls -l as a string like rw-r-----. Read it in threes. Here the owner can read and write, the group can only read, and everyone else can do nothing. Admins also write it as numbers: read is 4, write is 2, execute is 1, and you add them up, so rw- is 6 and r-- is 4.",
      "chmod changes the permissions, chown changes the owner and group, and chgrp changes only the group. umask decides what permissions brand-new files get, so you do not have to fix every file by hand.",
      "Permissions are your first and simplest security tool. Most Permission denied errors on a server come down to the wrong owner or one missing bit, and you can find it in a minute once you know where to look.",
    ],
    deepDive: [
      {
        heading: "rwx means something different on directories",
        body: "On a file, r lets you read the content, w lets you change it, and x lets you run it as a program. On a directory, think of it as a list of names. r lets you list the names. w lets you add, remove or rename entries in that list. x lets you enter the directory and reach the files inside it.\n\nThis leads to surprises. Deleting a file needs w on the directory, not on the file, so you can delete a read-only file that root owns if it sits in your own directory. r without x lets you see names but ls -l shows question marks for their details. x without r lets you open a file only if you already know its exact name. To reach /srv/app/config.yml you need x on /, /srv and /srv/app.",
        visual: {
          type: "compare",
          title: "The same bits on a file and a directory",
          columns: [
            { title: "On a file", points: ["r: read the content", "w: change the content", "x: run it as a program"] },
            { title: "On a directory", points: ["r: list the names inside", "w: create, delete, rename entries", "x: enter it and reach files inside"] },
          ],
        },
      },
      {
        heading: "Symbolic chmod and the capital X",
        body: "Symbolic mode is who, operator, permissions. Who is u (owner), g (group), o (others) or a (all). The operator is + to add, - to remove and = to set exactly. You can chain them with commas: chmod u=rwx,g=rx,o= script.sh. If you leave out who, as in chmod +x file, it acts like a but does not set bits that your umask would block.\n\nThe capital X adds execute only to directories, and to files that already have execute for someone. That makes it perfect for recursive changes. chmod -R 755 dir would make every text file executable; chmod -R u=rwX,g=rX,o= dir gives directories the x they need and leaves normal files without it.\n\nchmod --reference=a.txt b.txt copies a mode from one file to another.",
        bullets: ["chmod g+w file adds group write and leaves everything else", "chmod o= file removes all rights for others", "chmod 640 file sets the whole mode at once"],
      },
      {
        heading: "Who may change ownership",
        body: "Only root can give a file to another user. Otherwise a user could dodge disk quotas or plant files that look like someone else's. A normal user can change a file's group, but only to a group they belong to.\n\nchown alice file sets the owner, chown alice:web file sets owner and group, chown :web file sets only the group, and chown alice: file sets the owner and her login group. -R works recursively; add -h to change a symlink itself rather than its target.\n\nOne trap: changing the owner or group of an executable clears its SUID and SGID bits, even when root does it. So set special bits after chown, not before. Use stat file to see the numeric mode, owner, group and all timestamps in one view.",
        bullets: ["chown -R app:app /srv/app gives a whole tree to the app user", "chgrp web file is the same as chown :web file", "stat -c '%a %U %G' file prints mode, owner and group"],
      },
      {
        heading: "umask is a mask, not a subtraction",
        body: "Programs ask for a mode when they create something: usually 666 for files and 777 for directories. The kernel then clears every bit that is set in the umask. With umask 022, files get 644 and directories 755. With 027, files get 640 and directories 750. With 077, only the owner gets anything.\n\nIt is a bit mask, not arithmetic. umask 033 gives files 644, not 633, because there is no execute bit to remove in the first place. umask also never adds bits: a new file never starts out executable, however you set it.\n\nYour default umask comes from the login setup (/etc/login.defs, /etc/profile or /etc/bashrc, depending on the distribution). Change it for yourself in ~/.bashrc, and for a service with UMask= in its systemd unit.",
        visual: {
          type: "flow",
          title: "How umask 027 shapes a new file",
          steps: [
            { label: "Program requests 666", detail: "rw-rw-rw-" },
            { label: "umask 027 clears bits", detail: "Group loses w; others lose rwx" },
            { label: "Result 640", detail: "rw-r----- for the new file" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Debugging a Permission denied on /srv/app/config.yml",
        steps: [
          { label: "Who am I?", detail: "id shows the user and every group" },
          { label: "Walk the path", detail: "namei -l shows each directory's mode" },
          { label: "Missing x on a directory?", detail: "Every parent needs x to pass" },
          { label: "Check the file", detail: "Owner, group and the matching class bits" },
          { label: "Still denied?", detail: "Look for ACLs (+) or SELinux (.)" },
        ],
      },
    ],
    examples: [
      {
        title: "Fix permissions on a web content tree",
        explanation: "Someone ran chmod -R 777 on /var/www/site to make an error go away. You want files readable by the web server but writable only by the deploy user. Step 1: give the tree to deploy with the web server's group (apache on RHEL, www-data on Ubuntu). Step 2: set directories to 750 and files to 640 in one pass using X. Step 3: confirm a sample. Step 4: check that the web server group can still read by testing as that user.",
        code: {
          lang: "bash",
          code: "sudo chown -R deploy:apache /var/www/site\nsudo chmod -R u=rwX,g=rX,o= /var/www/site\nls -l /var/www/site | head\n# drwxr-x--- ... css\n# -rw-r----- ... index.html\nsudo -u apache cat /var/www/site/index.html > /dev/null && echo readable",
        },
      },
      {
        title: "Find the one directory that blocks access",
        explanation: "The app user gets Permission denied reading /srv/app/conf/app.yml, yet the file itself is 644. Step 1: namei -l lists every part of the path with its owner and mode. Step 2: look for a directory without x for the class app falls into. Here /srv/app/conf is 700 and owned by root, so app cannot pass through it. Step 3: fix that one directory rather than opening up the whole tree.",
        code: {
          lang: "bash",
          code: "sudo -u app cat /srv/app/conf/app.yml\n# Permission denied\nnamei -l /srv/app/conf/app.yml\n# dr-xr-xr-x root root /\n# drwxr-xr-x root root srv\n# drwxr-xr-x app  app  app\n# drwx------ root root conf      <- no x for anyone else\n# -rw-r--r-- root root app.yml\nsudo chown root:app /srv/app/conf && sudo chmod 750 /srv/app/conf",
        },
      },
    ],
    cheatSheet: [
      "r=4 w=2 x=1: rwxr-x--- is 750, rw-r--r-- is 644, rw------- is 600",
      "chmod -R u=rwX,g=rX,o= dir sets dirs to 750 and files to 640 in one go",
      "namei -l /full/path shows the owner and mode of every directory on the way",
      "Deleting a file needs w and x on its directory, not w on the file",
      "chown user: file sets the owner and that user's login group",
      "chown clears SUID and SGID on executables, so set those bits afterwards",
      "umask 077 in a script makes every file it creates private to the owner",
    ],
    quiz: [
      {
        q: "A directory has mode drwxr-xr-x and is owned by root. Can user bob delete a file inside it that bob owns?",
        options: ["Yes, he owns the file", "Yes, if the file is 777", "No, he needs w on the directory", "Only with chmod +t"],
        answer: 2,
        why: "Removing a name changes the directory, so it needs w (and x) on the directory itself.",
      },
      {
        q: "With umask 033, what mode does a new regular file get?",
        options: ["633", "744", "600", "644"],
        answer: 3,
        why: "The umask clears bits from 666; write is cleared for group and others and there is no x to clear, leaving 644.",
      },
      {
        q: "What does chmod -R a+X /data do to a plain text file that has mode 644?",
        options: ["Nothing, the file has no execute bit for anyone", "Makes it 755", "Makes it 777", "Removes read access"],
        answer: 0,
        why: "Capital X only adds execute to directories and files that are already executable by someone.",
      },
      {
        q: "A normal user runs chgrp web file.txt and gets Operation not permitted. Why?",
        options: ["Only root may run chgrp", "The user is not a member of the web group", "The file is not executable", "The umask blocks it"],
        answer: 1,
        why: "Owners may change a file's group only to a group they belong to.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create notes.txt and set it so the owner can read and write, the group can read, and others have no access. Do it once with octal and once with symbolic notation.",
        hint: "rw-r----- is 6, 4, 0.",
        solution: "touch notes.txt\nchmod 640 notes.txt\nls -l notes.txt          # -rw-r-----\nchmod u=rw,g=r,o= notes.txt\nstat -c '%a %n' notes.txt  # 640 notes.txt",
      },
      {
        level: "medium",
        task: "Make a directory /srv/reports where the group finance can add and read files, others can see nothing, and you can show that a user outside finance is refused.",
        hint: "Set group ownership, then mode 770; test with sudo -u someone.",
        solution: "sudo groupadd -f finance\nsudo mkdir -p /srv/reports\nsudo chown root:finance /srv/reports\nsudo chmod 770 /srv/reports\nls -ld /srv/reports              # drwxrwx--- root finance\nsudo -u nobody ls /srv/reports   # Permission denied",
      },
      {
        level: "hard",
        task: "Write a one-liner that lists every file under /etc that is writable by others, then fix them so that others lose write without changing any other bit.",
        hint: "find -perm -o+w matches files that have at least the others-write bit; chmod o-w removes only that bit.",
        solution: "sudo find /etc -xdev -type f -perm -o+w -ls\nsudo find /etc -xdev -type f -perm -o+w -exec chmod o-w {} +\nsudo find /etc -xdev -type f -perm -o+w | wc -l     # 0",
      },
    ],
    faq: [
      { q: "What does chmod 755 mean?", a: "The owner can read, write and execute (7), and the group and others can read and execute (5). It is the usual mode for programs and directories." },
      { q: "Why do I need execute permission on a directory?", a: "Execute on a directory lets you enter it and reach the files inside. Without it, even a world-readable file in that directory is out of reach." },
      { q: "How do I make a script runnable?", a: "Run chmod u+x script.sh (or chmod +x) and start it with ./script.sh. It also needs a first line such as #!/bin/bash that names its interpreter." },
      { q: "Where is the default umask set?", a: "It comes from the login setup, such as /etc/login.defs, /etc/profile or /etc/bashrc depending on the distribution. Override it for yourself in ~/.bashrc or for a service with UMask= in its unit file." },
    ],
  },

  "adm-files/special-perms": {
    plain: [
      "Besides read, write and execute, Linux has three extra permission bits. Each one solves a specific problem that normal permissions cannot, and each one shows up as a letter in place of an x in ls -l.",
      "SUID (set user ID) is for programs. When you run a SUID program, it runs with the rights of the file's owner, not your own. This is how a normal user can change their own password: the passwd program is owned by root and has SUID, so it is allowed to update the protected password file.",
      "SGID (set group ID) is mostly used on directories. Every new file created inside such a directory gets the directory's group, instead of the creator's own group. That keeps a team folder's files in the team group automatically.",
      "The sticky bit is for shared directories like /tmp, where everyone can create files. With it, people can only delete or rename their own files, not other people's. Together, these bits are powerful, so admins check regularly that no unexpected programs have SUID.",
    ],
    deepDive: [
      {
        heading: "Real and effective user IDs",
        body: "Every process carries two user IDs. The real UID says who started it. The effective UID is what the kernel checks for permissions. Normally both are the same. When you run a program file that has SUID, the kernel sets the effective UID to the file's owner at the moment the program starts, while the real UID stays yours.\n\nThat is how passwd, owned by root, can write /etc/shadow while still knowing which user called it, so it only lets you change your own password. A well-written SUID program checks the real UID and drops extra rights as soon as possible.\n\nLinux ignores SUID on scripts (files starting with #!) because they are too easy to abuse. File systems mounted with the nosuid option ignore the bit completely, which is common for /tmp, USB disks and network shares.",
        visual: {
          type: "sequence",
          title: "A normal user changes their password",
          actors: ["alice's shell", "kernel", "passwd (SUID root)", "/etc/shadow"],
          messages: [
            { from: 0, to: 1, label: "exec /usr/bin/passwd" },
            { from: 1, to: 2, label: "Start with real UID alice, effective UID root" },
            { from: 2, to: 2, label: "Ask for and check alice's old password" },
            { from: 2, to: 3, label: "Write new hash for alice only" },
            { from: 2, to: 0, label: "Exit, root rights end with the process" },
          ],
        },
      },
      {
        heading: "SGID directories: what is and is not inherited",
        body: "On a directory with SGID, new files take the directory's group, and new subdirectories take the group and the SGID bit too, so the rule spreads down the tree. Files that already existed keep their old group; fix them once with chgrp -R team dir and find dir -type d -exec chmod g+s {} +.\n\nSGID controls the group, not the permissions. If a user's umask is 022, their new files are rw-r--r--, so teammates can read them but not edit them. For a real shared workspace, also set umask 002 for team members or add a default ACL such as setfacl -d -m g:team:rwX dir, which gives group write to new files regardless of the umask.\n\nOn an executable file, SGID runs the program with the file's group as its effective group, a rarer use for programs that need access to one group-owned resource.",
      },
      {
        heading: "The sticky bit and its kernel helpers",
        body: "In a directory with the sticky bit, a file can only be deleted or renamed by its owner, the directory's owner or root. It does not change who may write to a file; that still follows the file's own mode. /tmp and /var/tmp are 1777: everyone can create files, nobody can remove anyone else's.\n\nShared world-writable directories have a classic attack: an attacker creates a symlink in /tmp with a name a root program is about to use, so root writes somewhere else. The kernel settings fs.protected_symlinks and fs.protected_hardlinks block this, and fs.protected_regular limits opening other users' files there. Modern distributions enable them by default; check with sysctl fs.protected_symlinks, which should print 1.",
        bullets: ["chmod +t dir or chmod 1777 dir sets the sticky bit", "A capital T means sticky is set but others have no x", "Use mktemp for temporary files in scripts, never fixed names in /tmp"],
      },
      {
        heading: "Octal modes, capital letters and a GNU chmod quirk",
        body: "The special bits form an optional fourth digit in front: 4 for SUID, 2 for SGID, 1 for sticky. chmod 4755 file gives rwsr-xr-x and chmod 3770 dir gives SGID and sticky with rwxrwx---. A lowercase s or t means the bit and execute are both set. A capital S or T means the special bit is set but execute is not, which is almost always a mistake on a file.\n\nOne surprise from GNU chmod: on directories, a plain numeric mode like chmod 755 dir does not clear SUID or SGID. That protects shared folders from accidental changes. To remove SGID from a directory, use chmod g-s dir, or a five-digit mode such as chmod 00755 dir. On regular files, chmod 0755 clears the special bits as you would expect.",
        bullets: ["ls -l: rwsr-xr-x means SUID plus execute", "rwSr--r-- means SUID set but no execute: suspicious", "stat -c '%a' shows the four-digit mode, for example 2770"],
      },
      {
        heading: "Auditing SUID and SGID files",
        body: "Any SUID root program with a bug is a way to become root, so admins keep the list short and known. find / -xdev -type f -perm -4000 lists SUID files and -perm /6000 lists files with SUID or SGID. Save the list once on a clean system and compare it later with diff; a new entry in a home directory or /tmp is a serious warning sign.\n\nOn RHEL-family systems, rpm -qf file tells you which package owns a binary, and rpm -V package reports files whose mode, owner or content changed from what the package shipped. On Ubuntu, dpkg -S file does the first job.\n\nMany programs that once needed SUID now use file capabilities instead, which grant one narrow power rather than full root. getcap -r / 2>/dev/null lists them.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "alice saves a file in /srv/team (mode 2770, group team)",
        steps: [
          { label: "alice creates plan.txt", detail: "Her primary group is alice" },
          { label: "Kernel sees SGID on the directory", detail: "Group comes from /srv/team" },
          { label: "File group is team", detail: "Not alice's own group" },
          { label: "umask sets the mode", detail: "002 gives rw-rw-r--, 022 gives rw-r--r--" },
          { label: "bob in team opens it", detail: "Group bits decide what he may do" },
        ],
      },
    ],
    examples: [
      {
        title: "Build a collaborative directory with SGID and sticky",
        explanation: "Team devs needs /srv/devs where everyone in the group can create and edit files, but nobody can delete a colleague's file. Step 1: create the group and the directory owned by it. Step 2: set mode 3770: SGID (2) so files stay in devs, sticky (1) so only owners delete, rwx for owner and group. Step 3: add a default ACL so new files are group-writable whatever each user's umask is. Step 4: test as two different members.",
        code: {
          lang: "bash",
          code: "sudo groupadd -f devs\nsudo usermod -aG devs alice; sudo usermod -aG devs bob\nsudo mkdir -p /srv/devs\nsudo chown root:devs /srv/devs\nsudo chmod 3770 /srv/devs\nsudo setfacl -d -m g:devs:rwX /srv/devs\nls -ld /srv/devs                  # drwxrws--T+ root devs\nsudo -u alice touch /srv/devs/a.txt\nsudo -u bob rm /srv/devs/a.txt    # Operation not permitted\nsudo -u bob sh -c 'echo hi >> /srv/devs/a.txt' && echo bob can edit",
        },
      },
      {
        title: "Spot a planted SUID shell",
        explanation: "After an incident you want to know whether anyone left a SUID copy of a shell behind. Step 1: list all SUID and SGID files on local file systems. Step 2: compare with a baseline saved when the server was clean. Step 3: for anything new, check if a package owns it. A file that no package owns, sitting in /tmp or a home directory with SUID root, should be removed and investigated.",
        code: {
          lang: "bash",
          code: "sudo find / -xdev -type f -perm /6000 2>/dev/null | sort > /root/suid-now.txt\ndiff /root/suid-baseline.txt /root/suid-now.txt\n# > /var/tmp/.cache/bash\nls -l /var/tmp/.cache/bash        # -rwsr-xr-x root root\nrpm -qf /var/tmp/.cache/bash      # not owned by any package\nsudo chmod u-s /var/tmp/.cache/bash",
        },
      },
    ],
    cheatSheet: [
      "Fourth octal digit: 4 = SUID, 2 = SGID, 1 = sticky; chmod 2770 dir is a typical team folder",
      "find / -xdev -type f -perm /6000 lists SUID or SGID files on local file systems",
      "Capital S or T in ls -l means the special bit is set but execute is not",
      "chmod 755 dir keeps an existing SGID bit; use chmod g-s dir to remove it",
      "Linux ignores SUID on #! scripts; mount with nosuid to ignore it entirely",
      "rpm -V PACKAGE reports files whose mode or owner changed from the package",
      "getcap -r / 2>/dev/null lists file capabilities, a narrower alternative to SUID",
    ],
    quiz: [
      {
        q: "A program file is owned by root with mode 4755. Which user ID changes to root when alice runs it?",
        options: ["The real UID", "The effective UID", "Both UIDs", "Neither, alice needs sudo"],
        answer: 1,
        why: "SUID changes the effective UID used for permission checks; the real UID stays alice.",
      },
      {
        q: "You set SGID on /srv/team after the team already created 200 files. What group do those old files have?",
        options: ["Still their creators' groups", "team, changed automatically", "root", "No group"],
        answer: 0,
        why: "SGID only affects files created after it is set; run chgrp -R to fix the old ones.",
      },
      {
        q: "In /tmp (mode 1777), what can bob do with a file alice owns that has mode 666?",
        options: ["Nothing at all", "Delete it", "Rename it", "Write to it, but not delete or rename it"],
        answer: 3,
        why: "The sticky bit limits deleting and renaming; writing still follows the file's own mode.",
      },
      {
        q: "Which command removes the SGID bit from directory /srv/team with GNU chmod?",
        options: ["chmod 0770 /srv/team", "chmod -t /srv/team", "chmod g-s /srv/team", "chmod u-s /srv/team"],
        answer: 2,
        why: "GNU chmod keeps SGID on directories for plain numeric modes, so use g-s (or a five-digit mode).",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the SUID bit on /usr/bin/passwd and the sticky bit on /tmp, and print both modes as numbers.",
        hint: "ls -ld shows letters; stat -c '%a' shows numbers.",
        solution: "ls -l /usr/bin/passwd     # -rwsr-xr-x\nls -ld /tmp               # drwxrwxrwt\nstat -c '%a %n' /usr/bin/passwd /tmp\n# 4755 /usr/bin/passwd\n# 1777 /tmp",
      },
      {
        level: "medium",
        task: "Convert an existing project directory /srv/proj and everything under it so that all files belong to group proj and every subdirectory has SGID.",
        hint: "Fix the group recursively, then add g+s only to directories.",
        solution: "sudo groupadd -f proj\nsudo chgrp -R proj /srv/proj\nsudo find /srv/proj -type d -exec chmod g+s {} +\nfind /srv/proj -type d ! -perm -2000     # should print nothing",
      },
      {
        level: "hard",
        task: "Create a baseline of SUID and SGID files, then write a small check that prints any new ones and exits with status 1 if there are any, so it can run from a timer.",
        hint: "Use find with -perm /6000, sort both lists, and compare with comm -13.",
        solution: "#!/bin/bash\nBASE=/root/suid-baseline.txt\nNOW=$(mktemp)\nfind / -xdev -type f -perm /6000 2>/dev/null | sort > \"$NOW\"\n[ -f \"$BASE\" ] || { cp \"$NOW\" \"$BASE\"; echo baseline saved; exit 0; }\nNEW=$(comm -13 \"$BASE\" \"$NOW\")\nrm -f \"$NOW\"\nif [ -n \"$NEW\" ]; then echo \"New SUID/SGID files:\"; echo \"$NEW\"; exit 1; fi\necho OK",
      },
    ],
    faq: [
      { q: "Is SUID dangerous?", a: "It is safe for well-reviewed system programs like passwd and sudo. It is dangerous on anything else, because a bug in a SUID root program gives an attacker root." },
      { q: "What does the t at the end of drwxrwxrwt mean?", a: "It is the sticky bit with execute for others. In that directory, users can only delete or rename their own files." },
      { q: "Does SGID on a directory make files group-writable?", a: "No. It only sets the group. Whether the group can write depends on the umask or on a default ACL." },
      { q: "Why does my SUID shell script not run as root?", a: "Linux ignores the SUID bit on interpreted scripts for security reasons. Use a sudo rule for that script instead." },
    ],
  },

  "adm-files/acls": {
    plain: [
      "Normal Linux permissions have room for exactly one owner, one group and everyone else. Real life is messier: you may need the finance group to read a folder, the auditor group too, and one contractor to write to a single file. An access control list (ACL) lets you add such extra entries to a file.",
      "Each extra entry names a user or a group and gives it its own read, write and execute rights. The normal owner, group and others still work as before; ACL entries are added on top.",
      "On a directory you can also set a default ACL. It is not used to check access to the directory itself. Instead it is a template: every new file or folder created inside copies it. That way, access rules apply to future files automatically.",
      "When a file has an ACL, ls -l shows a + after the permission string. That small + is your hint to run getfacl, because ls alone no longer tells the full story.",
    ],
    deepDive: [
      {
        heading: "How ACL entries line up with the mode bits",
        body: "Every file already has a minimal ACL of three entries: user:: (owner), group:: (owning group) and other::. They are simply the normal mode bits seen another way. As soon as you add a named entry, such as user:alice:rw-, the ACL becomes extended and a fourth kind of entry appears: the mask.\n\nHere is the part that confuses people. On a file with an extended ACL, the middle three letters in ls -l show the mask, not the owning group's rights. So chmod g=r on such a file changes the mask, which limits every named user and group, not just the owning group. Always use getfacl to see what is really going on.",
        bullets: ["getfacl file shows every entry and the mask", "ls -l shows a + when an extended ACL exists", "setfacl -b file removes all extra entries and the mask"],
      },
      {
        heading: "The mask caps everything in the middle",
        body: "The mask is the most rights that any named user, named group or the owning group can get. Effective rights are the entry ANDed with the mask. The owner and other entries are never limited by it.\n\nsetfacl -m recalculates the mask by default so that it covers all entries, which is why things usually just work. The problem comes later: someone runs chmod 640 on the file, the mask becomes r--, and alice's rw- entry is quietly reduced to read only. getfacl shows this with a comment like #effective:r-- next to her entry.\n\nTo set the mask on purpose, use setfacl -m m::rw file. To stop setfacl from changing the mask, add -n. A tight mask is a quick way to make all extra entries read-only in one step.",
        visual: {
          type: "flow",
          title: "Working out alice's effective rights",
          steps: [
            { label: "Entry user:alice:rw-", detail: "What was granted to her" },
            { label: "mask::r--", detail: "Set by a later chmod 640" },
            { label: "AND them together", detail: "Only bits present in both survive" },
            { label: "Effective r--", detail: "alice can read but not write" },
          ],
        },
      },
      {
        heading: "Default ACLs and inheritance",
        body: "Default entries exist only on directories and are set with setfacl -d -m or a d: prefix, as in setfacl -m d:g:team:rwX dir. When a file is created inside, its access ACL is copied from the directory's default ACL, then limited by the mode the program asked for (usually 666 for files). That is why new files do not become executable even if the default says rwx.\n\nWhen a directory has a default ACL, the umask is not applied to new files in it. This makes default ACLs the reliable way to get group-writable files in a shared folder, even for users whose umask is 022. New subdirectories inherit the default ACL as well, so the rule spreads down the tree.\n\nExisting files are never changed. For a complete setup, run the rule twice: once with -R -m for what exists and once with -R -d -m for what is coming.",
        visual: {
          type: "tree",
          title: "Default ACL on /srv/proj flowing to new items",
          root: "/srv/proj default: g:team:rwx",
          children: [
            { label: "New file report.txt", children: ["Access ACL g:team:rw- (no x, file asked for 666)"] },
            { label: "New directory data/", children: ["Access ACL g:team:rwx", "Also gets the same default ACL"] },
            { label: "Old file notes.txt", children: ["Unchanged, needs setfacl -R -m"] },
          ],
        },
      },
      {
        heading: "Keeping ACLs when you copy, back up and restore",
        body: "ACLs are stored as extended attributes, and not every tool carries them. cp without options drops them; cp -a or cp --preserve=all keeps them. mv inside one file system keeps them because nothing is copied. tar needs --acls when creating and extracting, and rsync needs -A (usually together with -a).\n\nYou can save and restore ACLs as text: getfacl -R /srv/proj > proj.acl writes them all, and setfacl --restore=proj.acl puts them back. ext4 and xfs support ACLs out of the box on RHEL and Ubuntu. NFS version 4 shares use a different ACL model with its own tools, nfs4_getfacl and nfs4_setfacl.\n\nRemove entries with -x for one entry, -k for the default ACL and -b for everything extra.",
        bullets: ["rsync -aA src/ dst/ copies files with their ACLs", "tar --acls -czf proj.tgz /srv/proj keeps ACLs in an archive", "setfacl -k dir removes only the default ACL"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Parts of an extended ACL, from getfacl",
        layers: [
          { label: "user::rw-", detail: "Owner, never limited by the mask" },
          { label: "user:alice:rw-", detail: "Named user, limited by the mask" },
          { label: "group::r--", detail: "Owning group, limited by the mask" },
          { label: "group:audit:r--", detail: "Named group, limited by the mask" },
          { label: "mask::rw-", detail: "Ceiling for the middle entries" },
          { label: "other::---", detail: "Everyone else, never limited by the mask" },
        ],
      },
    ],
    examples: [
      {
        title: "Read-only access for a contractor, now and later",
        explanation: "Contractor carol must read everything in /srv/proj, including files added next month, but must not join the team group or write anything. Step 1: grant read and directory traversal to existing items with -R and the capital X. Step 2: set the same rule as a default so new items inherit it. Step 3: verify with getfacl. Step 4: test as carol, reading and then trying to write.",
        code: {
          lang: "bash",
          code: "sudo setfacl -R -m u:carol:rX /srv/proj\nsudo setfacl -R -d -m u:carol:rX /srv/proj\ngetfacl /srv/proj | grep carol\n# user:carol:r-x\n# default:user:carol:r-x\nsudo -u carol cat /srv/proj/plan.txt > /dev/null && echo can read\nsudo -u carol touch /srv/proj/x     # Permission denied",
        },
      },
      {
        title: "The disappearing write access",
        explanation: "alice had write access to budget.xlsx through an ACL. After a colleague tidied permissions with chmod 640, alice can only read. Step 1: getfacl shows her entry still says rw- but a comment says effective r--. Step 2: the mask became r-- because chmod changed the group bits. Step 3: restore the mask with setfacl -m m::rw. Step 4: confirm the effective comment is gone.",
        code: {
          lang: "bash",
          code: "getfacl budget.xlsx\n# user::rw-\n# user:alice:rw-      #effective:r--\n# group::r--\n# mask::r--\n# other::---\nsetfacl -m m::rw budget.xlsx\ngetfacl budget.xlsx | grep -E 'alice|mask'\n# user:alice:rw-\n# mask::rw-",
        },
      },
    ],
    cheatSheet: [
      "setfacl -m u:alice:rw file adds or changes one entry; g:team:r for a group",
      "setfacl -R -m g:team:rwX dir fixes existing items; add -d for future ones",
      "With an ACL, the group bits in ls -l show the mask, not the owning group",
      "setfacl -m m::rw file sets the mask by hand",
      "setfacl -x u:alice file removes one entry; -b removes all; -k removes defaults",
      "getfacl -R dir > dir.acl backs up ACLs; setfacl --restore=dir.acl brings them back",
      "cp -a, rsync -aA and tar --acls keep ACLs; plain cp drops them",
    ],
    quiz: [
      {
        q: "A file has user:bob:rwx and mask::r-x. What can bob actually do?",
        options: ["Read, write and execute", "Read and execute", "Only read", "Nothing"],
        answer: 1,
        why: "Effective rights are the entry ANDed with the mask, which leaves r-x.",
      },
      {
        q: "Which entries does the ACL mask never limit?",
        options: ["Named users", "Named groups", "The owning group", "The owner and others"],
        answer: 3,
        why: "The mask caps the middle entries: named users, the owning group and named groups.",
      },
      {
        q: "A directory has default ACL g:team:rwx. A user with umask 022 creates a file in it. What does team get?",
        options: ["rw-, the umask is ignored and files are created without x", "r--, because of the umask", "rwx, copied exactly", "Nothing, defaults only apply to directories"],
        answer: 0,
        why: "With a default ACL the umask is not applied, and the 666 request removes execute.",
      },
      {
        q: "You copy a file with ACLs using plain cp. What happens to the ACL entries?",
        options: ["They are kept", "They become normal group bits", "They are dropped on the copy", "cp refuses to copy the file"],
        answer: 2,
        why: "Plain cp does not preserve extended attributes; use cp -a or --preserve=all.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Give user alice read and write access to /srv/data/report.csv without changing its owner or group, then show the result.",
        hint: "One setfacl -m with a u: entry, then getfacl.",
        solution: "sudo setfacl -m u:alice:rw /srv/data/report.csv\ngetfacl /srv/data/report.csv\nls -l /srv/data/report.csv     # the + shows an ACL exists",
      },
      {
        level: "medium",
        task: "Set up /srv/shared so that group auditors can read every existing and future file, and group editors can read and write every existing and future file.",
        hint: "Two -R -m rules and two -R -d -m rules; use capital X so only directories get x.",
        solution: "D=/srv/shared\nsudo setfacl -R -m g:auditors:rX,g:editors:rwX \"$D\"\nsudo setfacl -R -d -m g:auditors:rX,g:editors:rwX \"$D\"\ngetfacl \"$D\"\nsudo -u someeditor touch \"$D/new.txt\" && getfacl \"$D/new.txt\"",
      },
      {
        level: "hard",
        task: "Back up all ACLs under /srv/shared, remove them completely, prove they are gone, and then restore them exactly.",
        hint: "getfacl -R writes a restorable text file; setfacl -R -b removes; --restore reads the file back. Run the restore from the same directory as the backup.",
        solution: "cd /\nsudo getfacl -R srv/shared > /root/shared.acl\nsudo setfacl -R -b srv/shared\nsudo find srv/shared -exec ls -ld {} + | grep -c '+ '   # 0\nsudo setfacl --restore=/root/shared.acl\nsudo getfacl -R srv/shared | diff - /root/shared.acl && echo restored",
      },
    ],
    faq: [
      { q: "What does the + at the end of the permissions in ls -l mean?", a: "The file has an extended ACL with entries beyond owner, group and others. Run getfacl on it to see them." },
      { q: "When should I use an ACL instead of a group?", a: "Use groups when the same people need the same access to many things. Use ACLs for exceptions, such as one extra user or a second group on a specific folder." },
      { q: "Do I need to enable ACLs on my file system?", a: "Not on modern RHEL or Ubuntu with xfs or ext4; ACL support is on by default. Some older systems needed the acl mount option for ext4." },
      { q: "Why did chmod break my ACL?", a: "On a file with an extended ACL, chmod's group bits set the mask. Lowering them silently limits every named user and group; fix it with setfacl -m m::rwx." },
    ],
  },
};

export default extra;
