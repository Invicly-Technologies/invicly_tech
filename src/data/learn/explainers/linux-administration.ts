import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Shell & essential tools ─────────────
  "adm-shell/lab-setup": {
    summary:
      "You learn administration by breaking and fixing real systems, so start with two virtual machines: a RHEL-compatible one such as Rocky or AlmaLinux, and Ubuntu Server. Snapshots let you experiment without fear. The RHCSA gives you no internet, so you must get answers from man pages and --help, and edit files quickly in vim.",
    visuals: [
      {
        type: "compare",
        title: "RHEL family vs Debian family",
        columns: [
          { title: "RHEL, Rocky, Alma", points: ["Packages: dnf and rpm", "Firewall: firewalld", "MAC: SELinux", "Admin group: wheel"] },
          { title: "Ubuntu, Debian", points: ["Packages: apt and dpkg", "Firewall: ufw (on nftables)", "MAC: AppArmor", "Admin group: sudo"] },
        ],
      },
      {
        type: "cycle",
        title: "vim modes",
        steps: [
          { label: "Normal mode", detail: "Move, delete (dd), copy (yy), paste (p)." },
          { label: "Insert mode", detail: "Press i or o, then type text." },
          { label: "Back to Normal", detail: "Press Esc." },
          { label: "Command-line mode", detail: ":w saves, :q quits, :wq both, :q! discards." },
        ],
      },
    ],
    keyPoints: [
      "Take a VM snapshot before every risky lab so you can roll back in seconds.",
      "man -k keyword searches page descriptions; man 5 shows file formats.",
      "Many packages ship examples under /usr/share/doc.",
      "In vim, Esc then :wq saves and quits, and :q! quits without saving.",
    ],
    terms: [
      { term: "RHCSA", meaning: "Red Hat Certified System Administrator, a hands-on exam." },
      { term: "Snapshot", meaning: "Saved VM state you can revert to." },
      { term: "man -k", meaning: "Searches man page names and descriptions (apropos)." },
      { term: "--help", meaning: "Option most commands accept to print brief usage." },
      { term: "vim", meaning: "Modal text editor available on virtually every server." },
    ],
    example: {
      lang: "bash",
      code: "man -k partition          # which commands deal with partitions?\nman 5 fstab               # file format pages live in section 5\nnmcli --help | less\nls /usr/share/doc/chrony*\nvimtutor                  # 30-minute interactive vim lesson",
      caption: "Finding answers offline.",
    },
    check: [
      { q: "How do you find a command when you only know what it should do?", a: "Search descriptions with man -k keyword (apropos)." },
      { q: "How do you quit vim without saving?", a: "Press Esc, then type :q! and Enter." },
    ],
  },

  "adm-shell/shell-navigation": {
    summary:
      "Linux has one directory tree starting at /, and the Filesystem Hierarchy Standard says what goes where. Knowing that configuration is in /etc, variable data in /var and user files in /home tells you where to look for almost anything. Tab completion, history and globbing make you fast.",
    visuals: [
      {
        type: "tree",
        title: "Filesystem hierarchy essentials",
        root: "/",
        children: [
          { label: "/etc", children: ["System configuration", "fstab, passwd, ssh/sshd_config"] },
          { label: "/var", children: ["Logs in /var/log", "Spools, caches, databases"] },
          { label: "/home and /root", children: ["User home directories", "root's home is /root"] },
          { label: "/usr", children: ["Programs in /usr/bin", "Libraries and docs"] },
          { label: "/dev, /proc, /sys", children: ["Device files", "Kernel and process information"] },
          { label: "/tmp and /run", children: ["Temporary files", "Runtime state, cleared at boot"] },
        ],
      },
    ],
    keyPoints: [
      "Absolute paths start with /; relative paths start from the current directory.",
      "cd - returns to the previous directory and cd alone goes home.",
      "Tab completes names; Ctrl-R searches command history.",
      "Globs like *.log and file{1..3} are expanded by the shell before the command runs.",
    ],
    terms: [
      { term: "FHS", meaning: "Filesystem Hierarchy Standard defining directory purposes." },
      { term: "Absolute path", meaning: "Path from the root, such as /etc/hosts." },
      { term: "Relative path", meaning: "Path from the current directory, such as ../logs." },
      { term: "Glob", meaning: "Wildcard pattern such as * or ? matched against file names." },
      { term: "Brace expansion", meaning: "Shell generates strings, such as dir{a,b} becoming dira dirb." },
    ],
    example: {
      lang: "bash",
      code: "pwd\ncd /var/log && ls -lt | head\ncd -\nls /etc/*.conf\nmkdir -p ~/lab/{data,logs,scripts}\nhistory | grep dnf",
      caption: "Move around, list newest logs and create a directory tree in one command.",
    },
    check: [
      { q: "Where would you look for a service's configuration file?", a: "Under /etc." },
      { q: "Who expands *.log, the shell or the command?", a: "The shell, before the command runs." },
    ],
  },

  "adm-shell/text-tools": {
    summary:
      "Most administration is reading text: logs, config files and command output. grep finds lines, sed edits them, awk and cut pull out columns, and sort and uniq summarise. Chained with pipes they answer questions like which IPs failed SSH logins most often in seconds.",
    visuals: [
      {
        type: "flow",
        title: "From a log file to an answer",
        steps: [
          { label: "grep", detail: "Keep lines matching Failed password." },
          { label: "awk", detail: "Print the field holding the IP address." },
          { label: "sort", detail: "Group identical IPs together." },
          { label: "uniq -c", detail: "Count each IP." },
          { label: "sort -rn | head", detail: "Show the top offenders." },
        ],
      },
    ],
    keyPoints: [
      "grep -i ignores case, -v inverts, -r recurses and -E enables extended regex.",
      "sed -i edits a file in place; test without -i first.",
      "awk splits lines into fields $1, $2 and so on; -F sets the separator.",
      "uniq only collapses adjacent duplicates, so sort first.",
    ],
    terms: [
      { term: "Regular expression", meaning: "Pattern language for matching text." },
      { term: "grep", meaning: "Prints lines matching a pattern." },
      { term: "sed", meaning: "Stream editor for substitutions and deletions." },
      { term: "awk", meaning: "Field-oriented text processing language." },
      { term: "cut", meaning: "Extracts columns by delimiter or position." },
    ],
    example: {
      lang: "bash",
      code: "grep -E \"^[^#]\" /etc/ssh/sshd_config            # non-comment lines\nsudo journalctl -u sshd | grep \"Failed password\" \\\n  | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head\ncut -d: -f1,7 /etc/passwd                       # user and shell\nsed 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config | grep PermitRoot",
      caption: "Real admin one-liners; preview sed changes before using -i.",
    },
    pitfalls: [
      "Running sed -i on a config file without a backup or a dry run.",
      "Forgetting to quote patterns so the shell expands them first.",
    ],
    check: [
      { q: "Why must you sort before uniq -c?", a: "uniq only merges adjacent identical lines." },
      { q: "How do you print the first field of a colon-separated file?", a: "cut -d: -f1 file, or awk -F: '{print $1}' file." },
    ],
  },

  "adm-shell/redirection-pipes": {
    summary:
      "Every process has three standard streams: stdin (0), stdout (1) and stderr (2). The shell can redirect them to files or connect one command's output to another's input with a pipe. Environment variables and startup files such as .bashrc shape how every command you run behaves.",
    visuals: [
      {
        type: "compare",
        title: "Redirection at a glance",
        columns: [
          { title: "Output", points: ["> file overwrites", ">> file appends", "2> file captures errors", "&> file captures both"] },
          { title: "Input and merging", points: ["< file feeds stdin", "2>&1 sends errors to stdout", "<< EOF starts a here-document", "/dev/null discards output"] },
          { title: "Pipes", points: ["a | b feeds a's stdout to b", "tee writes to a file and stdout", "Exit status is the last command's", "set -o pipefail catches earlier failures"] },
        ],
      },
    ],
    keyPoints: [
      "Order matters: cmd > out 2>&1 captures both, cmd 2>&1 > out does not.",
      "export makes a variable visible to child processes.",
      "Put personal aliases and variables in ~/.bashrc; system-wide ones in /etc/profile.d.",
      "$(command) substitutes a command's output into another command.",
    ],
    terms: [
      { term: "stdin, stdout, stderr", meaning: "Standard streams numbered 0, 1 and 2." },
      { term: "Pipe", meaning: "Connects one command's stdout to the next command's stdin." },
      { term: "tee", meaning: "Copies input to a file and to stdout." },
      { term: "Environment variable", meaning: "Named value inherited by child processes." },
      { term: "Command substitution", meaning: "$(cmd) replaced by the command's output." },
    ],
    example: {
      lang: "bash",
      code: "find / -name \"*.conf\" 2>/dev/null > confs.txt\ndnf list installed | tee installed.txt | wc -l\necho \"export EDITOR=vim\" >> ~/.bashrc && source ~/.bashrc\necho \"Kernel: $(uname -r), uptime: $(uptime -p)\"\ncat > /tmp/motd <<EOF\nAuthorised use only\nEOF",
      caption: "Discard errors, save and count, persist a variable, use substitution and a here-doc.",
    },
    check: [
      { q: "How do you append output to a file instead of overwriting it?", a: "Use >> instead of >." },
      { q: "What does 2>/dev/null do?", a: "Discards error messages by sending stderr to /dev/null." },
    ],
  },

  // ───────────── Files, permissions & ACLs ─────────────
  "adm-files/file-management": {
    summary:
      "cp, mv, rm and ln are daily tools, and find is how you locate files by name, size, owner, permissions or age anywhere on the system. find can also act on what it finds, which makes it a frequent RHCSA task, such as copying all files owned by a user into a directory.",
    visuals: [
      {
        type: "flow",
        title: "How a find command reads",
        steps: [
          { label: "Start point", detail: "Where to search, such as / or /var/log." },
          { label: "Tests", detail: "-name, -user, -size +100M, -mtime -7, -perm." },
          { label: "Operators", detail: "Tests are ANDed; use -o for OR." },
          { label: "Action", detail: "-print by default, or -exec cmd {} \\; or -delete." },
        ],
      },
    ],
    keyPoints: [
      "cp -a preserves ownership, permissions and timestamps.",
      "rm -r has no undo; use rm -ri when unsure.",
      "ln -s target linkname creates a symlink; ln without -s creates a hard link.",
      "Add 2>/dev/null to find runs over / to hide permission errors.",
    ],
    terms: [
      { term: "cp -a", meaning: "Archive copy that preserves attributes and recurses." },
      { term: "Hard link", meaning: "Another name for the same inode." },
      { term: "Symbolic link", meaning: "Pointer file containing a path." },
      { term: "find -exec", meaning: "Runs a command for each match; {} is the file name." },
      { term: "-mtime", meaning: "find test on modification age in days." },
    ],
    example: {
      lang: "bash",
      code: "mkdir -p /root/found\nfind / -user harry -type f -exec cp -a {} /root/found/ \\; 2>/dev/null\nfind /var/log -name \"*.log\" -size +50M -mtime -7\nfind /etc -newer /etc/hostname -type f | head\nln -s /srv/web/current /var/www/html",
      caption: "Copy every file owned by harry, find big recent logs, create a symlink.",
    },
    check: [
      { q: "How do you find files larger than 100 MB?", a: "find / -size +100M." },
      { q: "Which cp option keeps ownership and timestamps?", a: "-a (archive)." },
    ],
  },

  "adm-files/permissions": {
    summary:
      "Every file has an owner, a group and three sets of read, write and execute permissions for the user, the group and everyone else. chmod changes them using symbolic (u+x) or octal (750) notation, chown changes ownership and umask sets defaults for new files. Getting these right is the first line of defence on any server.",
    visuals: [
      {
        type: "tree",
        title: "Reading -rwxr-x--- 1 ana dev script.sh",
        root: "-rwxr-x---",
        children: [
          { label: "Type: -", children: ["- regular file, d directory, l symlink"] },
          { label: "User (ana): rwx", children: ["Octal 7 = 4 + 2 + 1"] },
          { label: "Group (dev): r-x", children: ["Octal 5 = 4 + 1"] },
          { label: "Other: ---", children: ["Octal 0, no access"] },
        ],
      },
    ],
    keyPoints: [
      "r = 4, w = 2, x = 1; add them per class to get octal modes like 640.",
      "Only the first matching class applies: owner, else group, else other.",
      "chown user:group file changes both at once; -R recurses.",
      "The default umask 022 gives new files 644 and new directories 755.",
    ],
    terms: [
      { term: "chmod", meaning: "Changes permission bits." },
      { term: "chown", meaning: "Changes the owning user and group." },
      { term: "chgrp", meaning: "Changes only the owning group." },
      { term: "umask", meaning: "Bits removed from the default mode of new files." },
      { term: "Octal mode", meaning: "Three digits for user, group and other, such as 750." },
    ],
    example: {
      lang: "bash",
      code: "ls -l script.sh\nchmod 750 script.sh             # rwxr-x---\nchmod u+x,g-w,o= notes.txt\nsudo chown ana:dev /srv/project -R\numask                           # usually 0022\numask 027; touch new; ls -l new  # rw-r-----",
      caption: "Octal and symbolic chmod, recursive chown and umask in action.",
    },
    pitfalls: [
      "Using chmod -R 777 to make a problem go away.",
      "Forgetting that directories need x to be entered.",
    ],
    check: [
      { q: "What octal mode is rw-r-----?", a: "640." },
      { q: "With umask 027, what mode does a new file get?", a: "640 (666 minus 027)." },
    ],
  },

  "adm-files/special-perms": {
    summary:
      "Three extra permission bits change how files and directories behave. SUID runs a program with its owner's privileges, SGID on a directory makes new files inherit the directory's group, and the sticky bit stops users from deleting each other's files in a shared directory. SGID plus a group is the standard answer for team collaboration directories.",
    visuals: [
      {
        type: "compare",
        title: "Special permission bits",
        columns: [
          { title: "SUID (4)", points: ["On executables", "Runs as the file's owner", "Example: /usr/bin/passwd", "Shown as s in the user x slot"] },
          { title: "SGID (2)", points: ["On directories: new files get its group", "On executables: runs as its group", "Use for shared team folders", "Shown as s in the group x slot"] },
          { title: "Sticky (1)", points: ["On directories", "Only owners can delete their files", "Example: /tmp is 1777", "Shown as t in the other x slot"] },
        ],
      },
    ],
    keyPoints: [
      "chmod 2770 /srv/team gives an SGID shared directory for one group.",
      "A capital S or T means the bit is set but execute is not.",
      "Unexpected SUID root binaries are a classic privilege escalation path.",
      "The special bits are the leading digit in a four-digit octal mode.",
    ],
    terms: [
      { term: "SUID", meaning: "Set user ID: execute with the file owner's identity." },
      { term: "SGID", meaning: "Set group ID: inherit or run with the file's group." },
      { term: "Sticky bit", meaning: "Restricts deletion in a directory to file owners." },
      { term: "Privilege escalation", meaning: "Gaining more rights than intended." },
    ],
    example: {
      lang: "bash",
      code: "sudo groupadd team\nsudo mkdir -p /srv/team && sudo chgrp team /srv/team\nsudo chmod 2770 /srv/team       # SGID + rwx for owner and group\nls -ld /srv/team /tmp           # drwxrws--- and drwxrwxrwt\nsudo find / -perm -4000 -type f 2>/dev/null   # audit SUID files",
      caption: "Build a collaboration directory and audit SUID binaries.",
    },
    check: [
      { q: "What does SGID do on a directory?", a: "New files and subdirectories inherit the directory's group." },
      { q: "Why can users not delete each other's files in /tmp?", a: "/tmp has the sticky bit set." },
    ],
  },

  "adm-files/acls": {
    summary:
      "Standard permissions allow only one owner and one group. Access control lists add entries for extra named users and groups, and default ACLs on a directory are inherited by new files. A plus sign at the end of ls -l output tells you a file has an ACL.",
    visuals: [
      {
        type: "flow",
        title: "How an ACL check decides",
        steps: [
          { label: "Owner?", detail: "Use the user:: entry." },
          { label: "Named user?", detail: "Use user:name: entry, limited by the mask." },
          { label: "Owning or named group?", detail: "Group entries, limited by the mask." },
          { label: "Otherwise", detail: "Use the other:: entry." },
        ],
      },
    ],
    keyPoints: [
      "setfacl -m u:alice:rw file grants alice read and write.",
      "setfacl -d -m sets default entries that new files in a directory inherit.",
      "The mask caps the rights of named users and groups; chmod on the group bits changes it.",
      "setfacl -x removes one entry and -b removes all of them.",
    ],
    terms: [
      { term: "ACL", meaning: "List of extra per-user and per-group permissions." },
      { term: "getfacl", meaning: "Displays a file's ACL." },
      { term: "setfacl", meaning: "Modifies a file's ACL." },
      { term: "Default ACL", meaning: "Directory ACL copied to new files created inside it." },
      { term: "Mask", meaning: "Upper limit on named user and group permissions." },
    ],
    example: {
      lang: "bash",
      code: "setfacl -m u:alice:rw /srv/report.csv\nsetfacl -m g:auditors:r /srv/report.csv\nsetfacl -d -m g:team:rwx /srv/team      # inherited by new files\ngetfacl /srv/report.csv\nls -l /srv/report.csv                    # note the + after the mode\nsetfacl -x u:alice /srv/report.csv",
      caption: "Grant, inherit, inspect and remove ACL entries.",
    },
    pitfalls: [
      "Running chmod g-w later and silently shrinking the ACL mask.",
      "Expecting a new default ACL to change existing files; it only applies to files created later.",
    ],
    check: [
      { q: "How can you tell a file has an ACL from ls -l?", a: "A + appears after the permission string." },
      { q: "How do new files in a directory get ACL entries automatically?", a: "Set a default ACL on the directory with setfacl -d -m." },
    ],
  },

  // ───────────── Users, groups & sudo ─────────────
  "adm-users/users-groups": {
    summary:
      "Linux identifies users and groups by numeric IDs stored in a few plain-text files. useradd, usermod and groupadd edit them safely, passwd sets passwords, and chage controls password aging. Supplementary groups are how you grant a user access to shared resources.",
    visuals: [
      {
        type: "tree",
        title: "Account database files",
        root: "Local accounts",
        children: [
          { label: "/etc/passwd", children: ["name:x:UID:GID:comment:home:shell", "Readable by everyone"] },
          { label: "/etc/shadow", children: ["Password hash and aging fields", "Readable only by root"] },
          { label: "/etc/group", children: ["group:x:GID:member,member"] },
          { label: "/etc/login.defs", children: ["Defaults: UID ranges, PASS_MAX_DAYS"] },
          { label: "/etc/skel", children: ["Files copied into new home directories"] },
        ],
      },
    ],
    keyPoints: [
      "usermod -aG group user adds a supplementary group; forgetting -a replaces all groups.",
      "Regular users start at UID 1000; lower IDs are system accounts.",
      "chage -M 90 sets maximum password age; chage -l shows the policy.",
      "usermod -L locks an account and -s /sbin/nologin blocks interactive logins.",
      "Group changes apply at the next login; check with id.",
    ],
    terms: [
      { term: "UID and GID", meaning: "Numeric user and group identifiers." },
      { term: "Primary group", meaning: "Group assigned to files the user creates." },
      { term: "Supplementary group", meaning: "Additional group membership granting access." },
      { term: "chage", meaning: "Changes password aging settings." },
      { term: "nologin", meaning: "Shell that refuses interactive logins." },
    ],
    example: {
      lang: "bash",
      code: "sudo groupadd -g 3000 sysadmins\nsudo useradd -m -G sysadmins -c \"Natasha R\" natasha\necho 'natasha:Str0ng!Pass' | sudo chpasswd\nsudo useradd -s /sbin/nologin svc-backup\nsudo usermod -aG wheel natasha\nsudo chage -M 90 -W 7 natasha && sudo chage -l natasha\nid natasha",
      caption: "Typical RHCSA account tasks.",
    },
    pitfalls: [
      "usermod -G without -a, which removes the user from every other group.",
      "Editing /etc/passwd or /etc/shadow by hand instead of using the tools or vipw.",
    ],
    check: [
      { q: "Which file stores password hashes?", a: "/etc/shadow." },
      { q: "How do you add a user to a group without removing others?", a: "usermod -aG group user." },
    ],
  },

  "adm-users/sudo": {
    summary:
      "sudo lets approved users run commands as root or another user, with every use logged. Rules live in /etc/sudoers and, preferably, small drop-in files in /etc/sudoers.d edited with visudo, which checks syntax before saving. On RHEL members of wheel get full sudo; on Ubuntu it is the sudo group.",
    visuals: [
      {
        type: "sequence",
        title: "What happens when you run sudo",
        actors: ["User", "sudo", "sudoers policy", "Command"],
        messages: [
          { from: 0, to: 1, label: "sudo systemctl restart httpd" },
          { from: 1, to: 2, label: "Is this user allowed this command on this host?" },
          { from: 2, to: 1, label: "Allowed; password required" },
          { from: 1, to: 0, label: "Prompt for the user's own password" },
          { from: 1, to: 3, label: "Run as root, log to the journal" },
        ],
      },
    ],
    keyPoints: [
      "Always edit with visudo or visudo -f; a syntax error can lock out sudo entirely.",
      "Rule format: who host=(runas) commands, for example %ops ALL=(root) /usr/bin/systemctl.",
      "Prefer granting specific commands over ALL.",
      "NOPASSWD is convenient for automation but weakens security.",
    ],
    terms: [
      { term: "sudo", meaning: "Runs a command as another user under a policy." },
      { term: "sudoers", meaning: "Policy file defining who may run what." },
      { term: "visudo", meaning: "Safely edits sudoers with syntax checking." },
      { term: "wheel", meaning: "Traditional admin group on RHEL systems." },
      { term: "NOPASSWD", meaning: "Tag allowing a rule without a password prompt." },
    ],
    example: {
      lang: "bash",
      code: "sudo visudo -f /etc/sudoers.d/ops\n# contents:\n%ops ALL=(root) /usr/bin/systemctl restart httpd, /usr/bin/journalctl\nsudo visudo -c                # validate all sudoers files\nsudo -l -U natasha            # list what natasha may run",
      caption: "A scoped rule for the ops group.",
    },
    check: [
      { q: "Why use visudo instead of a normal editor?", a: "It validates syntax before saving, so a typo cannot break sudo." },
      { q: "Which group grants full sudo on RHEL by default?", a: "wheel." },
    ],
  },

  // ───────────── Package management ─────────────
  "adm-packages/dnf-rpm": {
    summary:
      "On RHEL-family systems, rpm installs and queries individual package files, while dnf resolves dependencies and fetches packages from repositories. Repositories are defined by .repo files and signed with GPG keys so you only install trusted software. dnf history lets you see and undo transactions.",
    visuals: [
      {
        type: "layers",
        title: "RPM software stack",
        layers: [
          { label: "dnf", detail: "Search, dependency resolution, updates, history." },
          { label: "Repositories", detail: ".repo files in /etc/yum.repos.d with baseurl and gpgkey." },
          { label: "rpm", detail: "Installs, queries and verifies individual packages." },
          { label: "RPM database", detail: "Record of installed packages and their files." },
          { label: "Files on disk", detail: "Binaries, configs and docs the package installed." },
        ],
      },
    ],
    keyPoints: [
      "dnf provides */command finds which package ships a command.",
      "rpm -qf /path shows which package owns a file; rpm -ql lists a package's files.",
      "Keep gpgcheck=1 so packages are verified against the repository key.",
      "dnf history undo N reverses a transaction.",
    ],
    terms: [
      { term: "RPM", meaning: "Package format and low-level tool on RHEL systems." },
      { term: "dnf", meaning: "High-level package manager that resolves dependencies." },
      { term: "Repository", meaning: "Server or directory of packages plus metadata." },
      { term: "GPG key", meaning: "Key used to verify package signatures." },
      { term: "AppStream", meaning: "RHEL repository for applications and runtimes." },
    ],
    example: {
      lang: "bash",
      code: "sudo dnf install -y httpd\ndnf provides */semanage\nrpm -qf /etc/httpd/conf/httpd.conf\ncat <<EOF | sudo tee /etc/yum.repos.d/local.repo\n[local]\nname=Local repo\nbaseurl=http://repo.example.com/BaseOS\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\nEOF\ndnf repolist && dnf history",
      caption: "Install, find a provider, own a file and add a repository.",
    },
    pitfalls: [
      "Setting gpgcheck=0 permanently to silence a key error.",
      "Installing a downloaded package with rpm -i and fighting dependencies; use dnf install ./file.rpm.",
    ],
    check: [
      { q: "How do you find which package provides a command you do not have?", a: "dnf provides */command." },
      { q: "Which rpm option shows the package that owns a file?", a: "rpm -qf /path/to/file." },
    ],
  },

  "adm-packages/apt-dpkg": {
    summary:
      "Debian and Ubuntu use dpkg for individual .deb packages and apt for repositories and dependencies. apt update refreshes package indexes and apt upgrade installs newer versions. Third-party sources go in /etc/apt/sources.list.d with their own signing key.",
    visuals: [
      {
        type: "compare",
        title: "Same task, two families",
        columns: [
          { title: "RHEL (dnf / rpm)", points: ["dnf check-update", "dnf install nginx", "rpm -qa | grep nginx", "rpm -ql nginx"] },
          { title: "Ubuntu (apt / dpkg)", points: ["apt update", "apt install nginx", "dpkg -l | grep nginx", "dpkg -L nginx"] },
        ],
      },
    ],
    keyPoints: [
      "Always run apt update before installing so indexes are current.",
      "apt remove keeps config files; apt purge deletes them too.",
      "unattended-upgrades applies security updates automatically.",
      "Store each third-party key in /etc/apt/keyrings and reference it with signed-by.",
    ],
    terms: [
      { term: "dpkg", meaning: "Low-level Debian package tool." },
      { term: "apt", meaning: "High-level package manager for Debian-family systems." },
      { term: "Package index", meaning: "Downloaded list of available packages and versions." },
      { term: "PPA", meaning: "Personal Package Archive, a third-party Ubuntu repository." },
      { term: "unattended-upgrades", meaning: "Service that installs updates automatically." },
    ],
    example: {
      lang: "bash",
      code: "sudo apt update && sudo apt upgrade -y\nsudo apt install -y nginx\ndpkg -L nginx | head\ndpkg -S /usr/sbin/nginx        # which package owns this file\napt list --upgradable\nsudo apt purge -y nginx && sudo apt autoremove -y",
      caption: "Everyday apt and dpkg commands on Ubuntu Server.",
    },
    check: [
      { q: "What is the difference between apt remove and apt purge?", a: "purge also deletes the package's configuration files." },
      { q: "What does apt update do?", a: "Refreshes the package indexes; it does not upgrade anything." },
    ],
  },

  // ───────────── Processes, services & logs ─────────────
  "adm-systemd/process-management": {
    summary:
      "Every running program is a process with a PID, an owner and a parent. ps and top show what is running and how much CPU and memory it uses, kill sends signals to stop or reload processes, and nice and renice change scheduling priority. Shell job control moves commands between foreground and background.",
    visuals: [
      {
        type: "tree",
        title: "A typical process tree (pstree)",
        root: "systemd (PID 1)",
        children: [
          { label: "sshd", children: ["sshd: ana [session]", "bash", "top"] },
          { label: "httpd", children: ["httpd worker", "httpd worker"] },
          { label: "chronyd" },
          { label: "systemd --user", children: ["podman container"] },
        ],
      },
    ],
    keyPoints: [
      "ps aux lists all processes; ps -ef shows parent PIDs.",
      "kill sends SIGTERM by default; use kill -9 only when SIGTERM fails.",
      "Nice values run from -20 (highest priority) to 19 (lowest); only root can lower them.",
      "In top, P sorts by CPU, M by memory and k kills a process.",
    ],
    terms: [
      { term: "PID", meaning: "Process ID." },
      { term: "Signal", meaning: "Notification such as SIGTERM (15) or SIGKILL (9)." },
      { term: "Nice value", meaning: "Hint to the scheduler about process priority." },
      { term: "Job", meaning: "Command started from the current shell." },
      { term: "pgrep and pkill", meaning: "Find or signal processes by name." },
    ],
    example: {
      lang: "bash",
      code: "ps aux --sort=-%cpu | head -5\npgrep -a sshd\nnice -n 10 tar czf /tmp/etc.tgz /etc &\nsudo renice -n 5 -p $(pgrep -f backup.sh)\nkill -HUP $(pgrep -o rsyslogd)    # ask it to reload\npkill -u baduser",
      caption: "Find heavy processes, change priorities and send signals.",
    },
    check: [
      { q: "Which signal does kill send by default?", a: "SIGTERM (15)." },
      { q: "Which nice value means the lowest priority?", a: "19." },
    ],
  },

  "adm-systemd/systemd-units": {
    summary:
      "systemd is PID 1: it starts services, mounts, sockets and timers, all described as units. systemctl starts and stops units now, enables or disables them at boot, and shows their status with recent log lines. Masking a unit stops anything from starting it.",
    visuals: [
      {
        type: "cycle",
        title: "Service unit states",
        steps: [
          { label: "inactive", detail: "Not running." },
          { label: "activating", detail: "ExecStart is running; waiting for readiness." },
          { label: "active (running)", detail: "Main process is up." },
          { label: "deactivating", detail: "Stop requested; SIGTERM sent." },
          { label: "inactive or failed", detail: "Failed if it exited with an error." },
        ],
      },
    ],
    keyPoints: [
      "start and stop affect now; enable and disable affect boot. enable --now does both.",
      "systemctl status shows state, main PID, cgroup and the last log lines.",
      "systemctl --failed lists everything that failed.",
      "mask links a unit to /dev/null so it cannot be started at all.",
    ],
    terms: [
      { term: "Unit", meaning: "Object systemd manages, such as a service or timer." },
      { term: "systemctl", meaning: "Command-line tool to control systemd." },
      { term: "Enable", meaning: "Hook a unit into a target so it starts at boot." },
      { term: "Mask", meaning: "Make a unit impossible to start." },
      { term: "Target", meaning: "Unit grouping others into a system state." },
    ],
    example: {
      lang: "bash",
      code: "sudo systemctl enable --now httpd\nsystemctl status httpd\nsystemctl is-enabled httpd; systemctl is-active httpd\nsystemctl --failed\nsudo systemctl mask --now cups\nsystemctl list-dependencies multi-user.target | head",
      caption: "Start and enable, inspect, find failures and mask.",
    },
    pitfalls: [
      "Starting a service but forgetting to enable it, so it is gone after reboot.",
      "Editing a unit file and forgetting systemctl daemon-reload.",
    ],
    check: [
      { q: "What is the difference between start and enable?", a: "start runs it now; enable makes it start at boot." },
      { q: "How do you prevent a service from being started even manually?", a: "systemctl mask the unit." },
    ],
  },

  "adm-systemd/unit-files": {
    summary:
      "Units are plain INI-style files. Vendor units ship in /usr/lib/systemd/system and should never be edited; instead you override them with drop-in files in /etc/systemd/system, which systemctl edit creates for you. After changing any unit file, run systemctl daemon-reload.",
    visuals: [
      {
        type: "layers",
        title: "Unit file locations (highest priority first)",
        layers: [
          { label: "/etc/systemd/system/NAME.d/*.conf", detail: "Admin drop-ins: override individual settings." },
          { label: "/etc/systemd/system", detail: "Admin units: replace a unit entirely." },
          { label: "/run/systemd/system", detail: "Runtime units, gone after reboot." },
          { label: "/usr/lib/systemd/system", detail: "Vendor units from packages; do not edit." },
        ],
      },
    ],
    keyPoints: [
      "systemctl cat NAME shows the unit plus every drop-in that applies.",
      "systemctl edit NAME creates a drop-in; --full copies the whole unit.",
      "To replace a list setting such as ExecStart, first clear it with an empty ExecStart=.",
      "Run systemctl daemon-reload after editing files by hand.",
    ],
    terms: [
      { term: "Drop-in", meaning: "Partial file overriding settings of an existing unit." },
      { term: "[Service]", meaning: "Unit section with ExecStart, User, Restart and more." },
      { term: "[Install]", meaning: "Section defining what enable hooks the unit into." },
      { term: "daemon-reload", meaning: "Makes systemd re-read unit files." },
      { term: "WantedBy", meaning: "Target that pulls in the unit when enabled." },
    ],
    example: {
      lang: "ini",
      code: "# sudo systemctl edit httpd  creates:\n# /etc/systemd/system/httpd.service.d/override.conf\n[Service]\nRestart=on-failure\nRestartSec=5s\nLimitNOFILE=65536\n\n# Then: sudo systemctl daemon-reload && sudo systemctl restart httpd",
      caption: "Override vendor settings without touching the packaged unit.",
    },
    check: [
      { q: "Where should you never edit unit files?", a: "In /usr/lib/systemd/system, because package updates overwrite them." },
      { q: "What must you run after hand-editing a unit file?", a: "systemctl daemon-reload." },
    ],
  },

  "adm-systemd/journald": {
    summary:
      "systemd-journald collects logs from the kernel, services and syslog into a structured, indexed journal. journalctl filters it by unit, priority, time or boot. By default on RHEL the journal may be volatile, so you configure persistent storage to keep logs across reboots, while rsyslog can still write classic files like /var/log/messages.",
    visuals: [
      {
        type: "flow",
        title: "Where log messages go",
        steps: [
          { label: "Sources", detail: "Kernel, service stdout and stderr, syslog calls." },
          { label: "journald", detail: "Indexes messages with unit, PID and priority." },
          { label: "Storage", detail: "/run/log/journal (volatile) or /var/log/journal (persistent)." },
          { label: "rsyslog", detail: "Optionally writes /var/log/messages, secure and more." },
          { label: "Query", detail: "journalctl filters; logrotate trims classic files." },
        ],
      },
    ],
    keyPoints: [
      "journalctl -u NAME shows one unit; -f follows live; -e jumps to the end.",
      "-p err shows priority error and worse; --since and --until filter by time.",
      "-b shows the current boot and -b -1 the previous one, which needs persistent storage.",
      "Set Storage=persistent in journald.conf, or create /var/log/journal, to keep logs across reboots.",
    ],
    terms: [
      { term: "journald", meaning: "systemd's logging daemon." },
      { term: "journalctl", meaning: "Tool to query the journal." },
      { term: "Priority", meaning: "Severity from emerg (0) to debug (7)." },
      { term: "rsyslog", meaning: "Classic syslog daemon writing text log files." },
      { term: "logrotate", meaning: "Rotates and compresses log files on a schedule." },
    ],
    example: {
      lang: "bash",
      code: "journalctl -u sshd --since \"1 hour ago\"\njournalctl -p err -b\njournalctl -f -u httpd\nsudo mkdir -p /var/log/journal\nsudo sed -i 's/^#\\?Storage=.*/Storage=persistent/' /etc/systemd/journald.conf\nsudo systemctl restart systemd-journald\njournalctl --list-boots",
      caption: "Filter logs and make the journal persistent.",
    },
    check: [
      { q: "How do you see only error-level messages from the current boot?", a: "journalctl -p err -b." },
      { q: "Why might journalctl -b -1 show nothing?", a: "The journal is volatile, so logs from previous boots were not kept." },
    ],
  },

  "adm-systemd/boot-targets": {
    summary:
      "Booting goes from firmware to the GRUB2 boot loader, to the kernel and initramfs, and then to systemd, which brings the system up to the default target. Targets such as multi-user and graphical replace the old runlevels. Knowing how to interrupt the boot lets you reach rescue mode or reset a lost root password, a classic RHCSA task.",
    visuals: [
      {
        type: "flow",
        title: "Boot sequence",
        steps: [
          { label: "Firmware", detail: "BIOS or UEFI finds the boot device." },
          { label: "GRUB2", detail: "Shows the menu, loads kernel and initramfs; press e to edit." },
          { label: "Kernel and initramfs", detail: "Load drivers, find and mount the root file system." },
          { label: "systemd (PID 1)", detail: "Starts units in parallel." },
          { label: "default.target", detail: "Usually multi-user.target on servers." },
          { label: "Login", detail: "getty on consoles and sshd for remote access." },
        ],
      },
    ],
    keyPoints: [
      "systemctl get-default and set-default show and change the boot target.",
      "rescue.target gives single-user mode with most file systems mounted; emergency.target mounts almost nothing.",
      "To reset root: add rd.break to the kernel line, remount /sysroot read-write, chroot, passwd, then touch /.autorelabel.",
      "grubby --update-kernel=ALL --args changes kernel arguments persistently.",
    ],
    terms: [
      { term: "GRUB2", meaning: "Boot loader that starts the kernel." },
      { term: "initramfs", meaning: "Temporary root file system used early in boot." },
      { term: "Target", meaning: "systemd unit representing a system state." },
      { term: "rd.break", meaning: "Kernel argument that stops boot inside the initramfs." },
      { term: "/.autorelabel", meaning: "Flag file that triggers an SELinux relabel at next boot." },
    ],
    example: {
      lang: "bash",
      code: "systemctl get-default\nsudo systemctl set-default multi-user.target\n# Root password reset: in GRUB press e, append rd.break to the linux line, Ctrl-X\nmount -o remount,rw /sysroot\nchroot /sysroot\npasswd root\ntouch /.autorelabel\nexit; exit",
      caption: "Change the default target and reset root from the initramfs shell.",
    },
    pitfalls: [
      "Skipping touch /.autorelabel, so SELinux blocks logins after the reset.",
      "Forgetting to remount /sysroot read-write, so passwd cannot save the change.",
    ],
    check: [
      { q: "Which target do servers normally boot into?", a: "multi-user.target." },
      { q: "Why touch /.autorelabel after changing the root password from rd.break?", a: "The new /etc/shadow has no SELinux label, so the system must relabel it at boot." },
    ],
  },

  // ───────────── Storage ─────────────
  "adm-storage/partitions": {
    summary:
      "Before a disk can hold file systems or LVM it is usually divided into partitions recorded in a partition table. GPT is the modern standard and supports large disks and many partitions; MBR is the legacy format. lsblk shows the layout and fdisk, gdisk or parted change it.",
    visuals: [
      {
        type: "compare",
        title: "MBR vs GPT",
        columns: [
          { title: "MBR (msdos)", points: ["Disks up to 2 TiB", "4 primary partitions, or extended plus logical", "Single copy of the table", "Legacy BIOS boot"] },
          { title: "GPT", points: ["Disks far larger than 2 TiB", "128 partitions by default", "Backup table at the end of the disk", "Required for UEFI boot"] },
        ],
      },
    ],
    keyPoints: [
      "lsblk -f shows devices, partitions, file systems and mount points together.",
      "Partition types matter: Linux, Linux LVM and Linux swap.",
      "Run partprobe or udevadm settle so the kernel sees new partitions.",
      "Double-check the device name; partitioning the wrong disk destroys data.",
    ],
    terms: [
      { term: "Block device", meaning: "Disk-like device such as /dev/vdb or /dev/nvme0n1." },
      { term: "Partition table", meaning: "Structure describing partitions on a disk." },
      { term: "GPT", meaning: "GUID Partition Table, the modern format." },
      { term: "parted", meaning: "Partitioning tool that also works non-interactively." },
      { term: "blkid", meaning: "Prints UUIDs and file system types." },
    ],
    example: {
      lang: "bash",
      code: "lsblk -f\nsudo parted /dev/vdb mklabel gpt\nsudo parted /dev/vdb mkpart data xfs 1MiB 2GiB\nsudo parted /dev/vdb mkpart lvm 2GiB 6GiB set 2 lvm on\nsudo parted /dev/vdb mkpart swap linux-swap 6GiB 7GiB\nsudo partprobe /dev/vdb && lsblk /dev/vdb",
      caption: "A GPT disk with data, LVM and swap partitions in one go.",
    },
    check: [
      { q: "Which partition table do you need for disks larger than 2 TiB?", a: "GPT." },
      { q: "Which command lists disks, partitions and their file systems?", a: "lsblk -f." },
    ],
  },

  "adm-storage/filesystems": {
    summary:
      "A file system organises a partition or logical volume into files and directories. RHEL defaults to xfs and Ubuntu to ext4; both are journaling file systems. You create them with mkfs, identify them by UUID or label, and grow them when the underlying device grows.",
    visuals: [
      {
        type: "compare",
        title: "ext4 vs xfs for admins",
        columns: [
          { title: "ext4", points: ["mkfs.ext4 /dev/vg/lv", "Grow: resize2fs", "Can shrink offline", "Label: e2label"] },
          { title: "xfs", points: ["mkfs.xfs /dev/vg/lv", "Grow online: xfs_growfs /mountpoint", "Cannot shrink", "Label: xfs_admin -L"] },
        ],
      },
    ],
    keyPoints: [
      "df -h shows free space per mounted file system; df -i shows free inodes.",
      "du -sh dir shows how much space a directory uses.",
      "xfs_growfs takes the mount point; resize2fs takes the device.",
      "A file system can run out of inodes while df still shows free space.",
    ],
    terms: [
      { term: "mkfs", meaning: "Creates a file system on a device." },
      { term: "Journaling", meaning: "Logs metadata changes to recover quickly after a crash." },
      { term: "UUID", meaning: "Unique ID of a file system, stable across device renames." },
      { term: "xfs_growfs", meaning: "Grows a mounted xfs file system." },
      { term: "resize2fs", meaning: "Grows or shrinks an ext file system." },
    ],
    example: {
      lang: "bash",
      code: "sudo mkfs.xfs -L data /dev/vdb1\nsudo mkfs.ext4 -L logs /dev/vgdata/lvlogs\nsudo blkid /dev/vdb1\ndf -hT; df -i\nsudo du -sh /var/* 2>/dev/null | sort -h | tail",
      caption: "Create, identify and measure file systems.",
    },
    check: [
      { q: "Can you shrink an xfs file system?", a: "No, xfs can only grow." },
      { q: "Why might writes fail when df -h shows free space?", a: "The file system may have run out of inodes; check df -i." },
    ],
  },

  "adm-storage/mounting-swap": {
    summary:
      "Mounting attaches a file system to a directory. Manual mounts vanish at reboot, so persistent mounts go in /etc/fstab, preferably by UUID because device names can change. Swap space is added the same way and gives the kernel somewhere to move idle memory pages.",
    visuals: [
      {
        type: "flow",
        title: "Adding a persistent mount",
        steps: [
          { label: "Identify", detail: "Get the UUID with blkid or lsblk -f." },
          { label: "Create the mount point", detail: "mkdir -p /data." },
          { label: "Add to fstab", detail: "UUID=... /data xfs defaults 0 0." },
          { label: "Test", detail: "systemctl daemon-reload, then mount -a." },
          { label: "Verify", detail: "findmnt /data, then reboot to be sure." },
        ],
      },
    ],
    keyPoints: [
      "fstab fields: device, mount point, type, options, dump, fsck order.",
      "Always run mount -a after editing fstab; a bad line can drop boot into emergency mode.",
      "Use nofail for non-critical disks so a missing disk does not block boot.",
      "Swap: mkswap, swapon, then an fstab line with type swap; check with swapon --show.",
      "lsof or fuser -m shows what keeps a mount busy.",
    ],
    terms: [
      { term: "Mount point", meaning: "Directory where a file system is attached." },
      { term: "/etc/fstab", meaning: "Table of file systems to mount at boot." },
      { term: "findmnt", meaning: "Shows mounted file systems as a tree." },
      { term: "Swap", meaning: "Disk space used as overflow for RAM." },
      { term: "nofail", meaning: "Mount option that tolerates a missing device at boot." },
    ],
    example: {
      lang: "bash",
      code: "sudo mkdir -p /data\nUUID=$(sudo blkid -s UUID -o value /dev/vdb1)\necho \"UUID=$UUID /data xfs defaults 0 0\" | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload && sudo mount -a && findmnt /data\nsudo mkswap /dev/vdb3\necho \"UUID=$(sudo blkid -s UUID -o value /dev/vdb3) none swap defaults 0 0\" | sudo tee -a /etc/fstab\nsudo swapon -a && swapon --show",
      caption: "Persistent data mount and swap by UUID.",
    },
    pitfalls: [
      "Rebooting after an fstab edit without testing it with mount -a.",
      "Using /dev/sdX names that change when disks are added.",
    ],
    check: [
      { q: "Why mount by UUID instead of /dev/vdb1?", a: "Device names can change between boots; UUIDs do not." },
      { q: "How do you test fstab changes without rebooting?", a: "Run mount -a (and swapon -a for swap) and check for errors." },
    ],
  },

  "adm-storage/lvm": {
    summary:
      "LVM puts a flexible layer between disks and file systems. Physical volumes are pooled into a volume group, and logical volumes are carved from that pool and can be grown, or for some file systems shrunk, without repartitioning. It is the standard way to manage server storage and a large part of the RHCSA.",
    visuals: [
      {
        type: "layers",
        title: "LVM stack",
        layers: [
          { label: "File system", detail: "xfs or ext4 mounted at /srv/web." },
          { label: "Logical volume (LV)", detail: "/dev/vgdata/lvweb, sized in extents." },
          { label: "Volume group (VG)", detail: "vgdata: a pool of extents from all PVs." },
          { label: "Physical volumes (PV)", detail: "/dev/vdb2 and /dev/vdc initialised with pvcreate." },
          { label: "Disks and partitions", detail: "The real block devices." },
        ],
      },
    ],
    keyPoints: [
      "Order of operations: pvcreate, vgcreate, lvcreate, mkfs, mount.",
      "vgcreate -s sets the physical extent size, and lvcreate -l sizes in extents.",
      "Extend online: vgextend to add a disk, then lvextend -r to grow the LV and file system together.",
      "pvs, vgs and lvs give quick summaries; the display variants give details.",
    ],
    terms: [
      { term: "PV", meaning: "Physical volume: a disk or partition prepared for LVM." },
      { term: "VG", meaning: "Volume group: pooled storage from one or more PVs." },
      { term: "LV", meaning: "Logical volume: a virtual block device carved from a VG." },
      { term: "Extent", meaning: "Allocation unit within a VG, 4 MiB by default." },
      { term: "lvextend -r", meaning: "Grows an LV and resizes its file system in one step." },
    ],
    example: {
      lang: "bash",
      code: "sudo pvcreate /dev/vdb2\nsudo vgcreate -s 8M vgdata /dev/vdb2\nsudo lvcreate -n lvweb -L 1G vgdata\nsudo mkfs.xfs /dev/vgdata/lvweb\nsudo mkdir -p /srv/web && sudo mount /dev/vgdata/lvweb /srv/web\nsudo pvcreate /dev/vdc && sudo vgextend vgdata /dev/vdc\nsudo lvextend -r -L +500M /dev/vgdata/lvweb\nsudo pvs; sudo vgs; sudo lvs",
      caption: "Build a VG with 8 MiB extents, create an LV, then grow it online.",
    },
    pitfalls: [
      "Growing the LV but forgetting to grow the file system (use -r).",
      "Shrinking an xfs LV, which destroys the file system.",
    ],
    check: [
      { q: "What is the order of commands to go from a disk to a mounted LV?", a: "pvcreate, vgcreate, lvcreate, mkfs, then mount." },
      { q: "How do you grow an LV and its file system together?", a: "lvextend -r with the new size." },
    ],
  },

  "adm-storage/nfs-autofs": {
    summary:
      "NFS lets a client mount directories exported by a file server over the network. You can mount them manually, persistently in fstab, or on demand with autofs, which mounts a share when someone accesses it and unmounts it after it sits idle. Automounted home directories are a classic RHCSA task.",
    visuals: [
      {
        type: "sequence",
        title: "On-demand mount with autofs",
        actors: ["User", "autofs", "NFS server"],
        messages: [
          { from: 0, to: 1, label: "cd /shares/projects" },
          { from: 1, to: 2, label: "mount nfs.example.com:/exports/projects" },
          { from: 2, to: 1, label: "Export mounted" },
          { from: 1, to: 0, label: "Directory available, cd succeeds" },
          { from: 1, to: 2, label: "Unmount after the idle timeout" },
        ],
      },
    ],
    keyPoints: [
      "showmount -e server lists exports, if the server allows it.",
      "In fstab use _netdev so the mount waits for the network.",
      "autofs master map: /etc/auto.master.d/NAME.autofs points a base directory at a map file.",
      "Indirect map keys are subdirectories; the wildcard * with & mounts any matching name.",
    ],
    terms: [
      { term: "NFS", meaning: "Network File System for sharing directories." },
      { term: "Export", meaning: "Directory a server shares over NFS." },
      { term: "autofs", meaning: "Service that mounts file systems on access." },
      { term: "Indirect map", meaning: "Map whose keys are subdirectories of a base directory." },
      { term: "_netdev", meaning: "fstab option marking a network-dependent mount." },
    ],
    example: {
      lang: "bash",
      code: "sudo dnf install -y nfs-utils autofs\nshowmount -e nfs.example.com\nsudo mount -t nfs nfs.example.com:/exports/projects /mnt\necho \"/shares /etc/auto.shares\" | sudo tee /etc/auto.master.d/shares.autofs\necho \"* -rw,sync nfs.example.com:/exports/&\" | sudo tee /etc/auto.shares\nsudo systemctl enable --now autofs\nls /shares/projects && mount | grep shares",
      caption: "A manual mount, then a wildcard indirect autofs map.",
    },
    check: [
      { q: "What does autofs do after a share has been idle for a while?", a: "Unmounts it automatically." },
      { q: "Which fstab option should NFS mounts use?", a: "_netdev, so they wait for the network." },
    ],
  },

  // ───────────── Networking ─────────────
  "adm-networking/ip-basics": {
    summary:
      "Every host needs an IP address with a prefix, a default gateway and DNS servers to reach the world. The ip command shows interfaces, addresses and routes, ss shows which ports are listening and connected, and ping, tracepath and curl test reachability layer by layer.",
    visuals: [
      {
        type: "layers",
        title: "What to check, layer by layer",
        layers: [
          { label: "Application", detail: "curl -v, service logs: is the service answering?" },
          { label: "Transport", detail: "ss -tulpn: is the port open and listening?" },
          { label: "Network", detail: "ip addr, ip route, ping: addresses and routing." },
          { label: "Link", detail: "ip link: is the interface up with carrier?" },
        ],
      },
    ],
    keyPoints: [
      "192.168.1.50/24 means a 24-bit network prefix, so 254 usable hosts.",
      "ip route shows the default gateway as the default via line.",
      "ss -tulpn lists listening TCP and UDP sockets with their processes.",
      "Changes made with ip addr add are temporary; persistent config goes through NetworkManager.",
    ],
    terms: [
      { term: "CIDR prefix", meaning: "Number of network bits, such as /24." },
      { term: "Default gateway", meaning: "Router used for destinations outside the local network." },
      { term: "ip", meaning: "Tool to view and change addresses, links and routes." },
      { term: "ss", meaning: "Socket statistics: listening and connected ports." },
      { term: "tracepath", meaning: "Shows the route packets take to a host." },
    ],
    example: {
      lang: "bash",
      code: "ip -br addr\nip route\nss -tulpn\nping -c 3 192.168.1.1\ntracepath example.com\ncurl -sI https://example.com | head -1",
      caption: "Check addresses, routes, open ports and reachability.",
    },
    check: [
      { q: "Which command lists listening ports with their processes?", a: "ss -tulpn." },
      { q: "Where do you see the default gateway?", a: "In ip route output, on the default via line." },
    ],
  },

  "adm-networking/nmcli": {
    summary:
      "On RHEL, NetworkManager owns network configuration and nmcli is its command-line interface. Settings live in connection profiles attached to devices, so you modify a profile and bring it up to apply changes persistently. Ubuntu Server uses netplan, which can drive NetworkManager or systemd-networkd.",
    visuals: [
      {
        type: "tree",
        title: "NetworkManager objects",
        root: "NetworkManager",
        children: [
          { label: "Devices", children: ["ens160 (ethernet)", "lo (loopback)"] },
          { label: "Connection profile: static1", children: ["connection.interface-name ens160", "ipv4.method manual", "ipv4.addresses 192.168.1.50/24", "ipv4.gateway and ipv4.dns", "connection.autoconnect yes"] },
          { label: "Storage", children: ["Keyfiles in /etc/NetworkManager/system-connections"] },
        ],
      },
    ],
    keyPoints: [
      "nmcli device status shows devices; nmcli connection show lists profiles.",
      "Set ipv4.method manual along with addresses, gateway and DNS for a static IP.",
      "nmcli con up NAME applies changes; modify alone does not touch the live interface.",
      "nmtui is a text UI alternative if you forget the property names.",
    ],
    terms: [
      { term: "NetworkManager", meaning: "Daemon managing network configuration on RHEL." },
      { term: "Connection profile", meaning: "Named set of settings applied to a device." },
      { term: "nmcli", meaning: "Command-line client for NetworkManager." },
      { term: "nmtui", meaning: "Menu-driven text interface for NetworkManager." },
      { term: "netplan", meaning: "Ubuntu's YAML network configuration layer." },
    ],
    example: {
      lang: "bash",
      code: "nmcli device status\nsudo nmcli con add con-name static1 ifname ens160 type ethernet \\\n  ipv4.method manual ipv4.addresses 192.168.1.50/24 \\\n  ipv4.gateway 192.168.1.1 ipv4.dns \"192.168.1.1 1.1.1.1\"\nsudo nmcli con up static1\nsudo nmcli con mod static1 +ipv4.addresses 192.168.1.51/24\nsudo nmcli con up static1 && ip -br addr show ens160",
      caption: "Create a persistent static profile, then add a second address.",
    },
    check: [
      { q: "After nmcli con mod, why might nothing change yet?", a: "The live interface updates only when you run nmcli con up for that profile." },
      { q: "Which ipv4.method gives a static address?", a: "manual." },
    ],
  },

  "adm-networking/dns-time": {
    summary:
      "Names are resolved in the order set by /etc/nsswitch.conf, usually /etc/hosts first and then DNS servers from /etc/resolv.conf. hostnamectl sets the machine's own name persistently. Accurate time matters for logs, TLS and Kerberos, so chronyd keeps the clock synchronised with NTP servers.",
    visuals: [
      {
        type: "flow",
        title: "Resolving a hostname",
        steps: [
          { label: "Application asks", detail: "getaddrinfo(\"db01\") via glibc." },
          { label: "nsswitch.conf", detail: "hosts: files dns sets the order." },
          { label: "/etc/hosts", detail: "Static entries win if present." },
          { label: "resolv.conf", detail: "Nameserver and search domains (systemd-resolved on Ubuntu)." },
          { label: "DNS server answers", detail: "Address returned and possibly cached." },
        ],
      },
    ],
    keyPoints: [
      "getent hosts NAME tests resolution exactly as applications see it, including /etc/hosts.",
      "dig queries DNS directly and bypasses /etc/hosts.",
      "On RHEL, set DNS through nmcli rather than editing resolv.conf by hand.",
      "Configure server or pool lines with iburst in /etc/chrony.conf, then restart chronyd.",
    ],
    terms: [
      { term: "hostnamectl", meaning: "Sets and shows the system hostname." },
      { term: "nsswitch.conf", meaning: "Defines the order of name lookup sources." },
      { term: "resolv.conf", meaning: "Lists DNS servers and search domains." },
      { term: "chronyd", meaning: "NTP daemon that keeps the clock synchronised." },
      { term: "timedatectl", meaning: "Shows and sets time zone and NTP status." },
    ],
    example: {
      lang: "bash",
      code: "sudo hostnamectl set-hostname web01.lab.example.com\ngetent hosts web01\ndig +short example.com A\necho \"server classroom.example.com iburst\" | sudo tee -a /etc/chrony.conf\nsudo systemctl restart chronyd\nchronyc sources -v\ntimedatectl",
      caption: "Hostname, resolution tests and NTP with chrony.",
    },
    check: [
      { q: "Why can dig succeed while ping by name fails, or the reverse?", a: "dig queries DNS only, while ping uses nsswitch and also checks /etc/hosts." },
      { q: "Which command shows whether chrony is synchronised?", a: "chronyc sources (or chronyc tracking), and timedatectl." },
    ],
  },

  "adm-networking/firewalls": {
    summary:
      "A host firewall allows only the traffic your services need. On RHEL, firewalld organises rules into zones and uses predefined services such as http and ssh; on Ubuntu, ufw offers a simpler front end. Both sit on top of nftables in the kernel.",
    visuals: [
      {
        type: "compare",
        title: "firewalld vs ufw",
        columns: [
          { title: "firewalld (RHEL)", points: ["Zones such as public and internal", "firewall-cmd --add-service=http", "--permanent plus --reload to persist", "--list-all shows the active zone"] },
          { title: "ufw (Ubuntu)", points: ["Default deny incoming, allow outgoing", "ufw allow 80/tcp or ufw allow OpenSSH", "Rules persist automatically", "ufw status verbose shows rules"] },
        ],
      },
    ],
    keyPoints: [
      "Without --permanent, firewalld changes are lost on reload or reboot.",
      "Use firewall-cmd --runtime-to-permanent to save tested runtime rules.",
      "Allow SSH before enabling ufw on a remote machine.",
      "A service may also need an SELinux port label if it listens on a non-standard port.",
    ],
    terms: [
      { term: "firewalld", meaning: "Dynamic zone-based firewall daemon on RHEL." },
      { term: "Zone", meaning: "Trust level with its own rule set, bound to interfaces or sources." },
      { term: "firewall-cmd", meaning: "Command-line client for firewalld." },
      { term: "ufw", meaning: "Uncomplicated Firewall on Ubuntu." },
      { term: "nftables", meaning: "Kernel packet filtering framework under both tools." },
    ],
    example: {
      lang: "bash",
      code: "sudo firewall-cmd --get-active-zones\nsudo firewall-cmd --permanent --add-service=http --add-service=https\nsudo firewall-cmd --permanent --add-port=8080/tcp\nsudo firewall-cmd --reload && sudo firewall-cmd --list-all\n# Ubuntu\nsudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw enable\nsudo ufw status verbose",
      caption: "Open web ports permanently with firewalld, or with ufw on Ubuntu.",
    },
    pitfalls: [
      "Adding rules without --permanent and losing them at the next reboot.",
      "Enabling ufw over SSH before allowing SSH.",
    ],
    check: [
      { q: "How do you make a firewalld rule survive reboot?", a: "Add it with --permanent and then run firewall-cmd --reload." },
      { q: "Which ufw command shows the current rules?", a: "ufw status verbose." },
    ],
  },

  // ───────────── SSH & mandatory access control ─────────────
  "adm-security/ssh-keys": {
    summary:
      "SSH gives you an encrypted remote shell and file transfer. With key-based authentication, the server stores your public key and you prove you hold the matching private key, so no password crosses the network. A ~/.ssh/config file saves typing for hosts you use often.",
    visuals: [
      {
        type: "sequence",
        title: "SSH public key authentication",
        actors: ["Client", "Server"],
        messages: [
          { from: 0, to: 1, label: "TCP connect to port 22, key exchange" },
          { from: 1, to: 0, label: "Host key: client checks known_hosts" },
          { from: 0, to: 1, label: "Offer public key for user ana" },
          { from: 1, to: 0, label: "Key is in authorized_keys: prove it" },
          { from: 0, to: 1, label: "Signature made with the private key" },
          { from: 1, to: 0, label: "Signature verified, session opened" },
        ],
      },
    ],
    keyPoints: [
      "ssh-keygen -t ed25519 creates a modern key pair; protect it with a passphrase.",
      "ssh-copy-id user@host appends your public key to the server's authorized_keys.",
      "~/.ssh must be 700 and authorized_keys 600, or sshd ignores the key.",
      "ssh-agent holds unlocked keys so you type the passphrase once.",
    ],
    terms: [
      { term: "Key pair", meaning: "Private key you keep plus public key you share." },
      { term: "authorized_keys", meaning: "Server file listing public keys allowed to log in." },
      { term: "known_hosts", meaning: "Client file of trusted server host keys." },
      { term: "ssh-agent", meaning: "Holds decrypted private keys in memory." },
      { term: "scp and sftp", meaning: "File copy tools that run over SSH." },
    ],
    example: {
      lang: "bash",
      code: "ssh-keygen -t ed25519 -C \"ana@laptop\"\nssh-copy-id ana@web01\ncat >> ~/.ssh/config <<EOF\nHost web01\n  HostName 192.168.1.50\n  User ana\nEOF\nssh web01 'hostname; uptime'\nrsync -av -e ssh ./site/ web01:/srv/web/",
      caption: "Create a key, install it, add a config alias and copy files.",
    },
    check: [
      { q: "Which key do you copy to the server?", a: "The public key, the .pub file." },
      { q: "Why might sshd ignore a correctly copied key?", a: "Permissions on ~/.ssh or authorized_keys are too open." },
    ],
  },

  "adm-security/ssh-hardening": {
    summary:
      "Internet-facing SSH servers are attacked constantly. Disabling root and password logins, restricting which users may connect and rate-limiting failed attempts removes most of the risk. Always validate the config and test from a second session before closing your current one.",
    visuals: [
      {
        type: "flow",
        title: "Changing sshd safely",
        steps: [
          { label: "Confirm key login works", detail: "Test from your client first." },
          { label: "Write a drop-in", detail: "/etc/ssh/sshd_config.d/50-hardening.conf." },
          { label: "Validate", detail: "sudo sshd -t prints nothing if valid." },
          { label: "Reload", detail: "systemctl reload sshd keeps sessions alive." },
          { label: "Test in a new session", detail: "Keep the old one open until it works." },
        ],
      },
    ],
    keyPoints: [
      "PermitRootLogin no and PasswordAuthentication no are the two biggest wins.",
      "AllowGroups sshusers limits logins to one group.",
      "If you change the port on RHEL, label it with semanage port and open it in the firewall.",
      "fail2ban bans IPs after repeated failures.",
    ],
    terms: [
      { term: "sshd_config", meaning: "Main SSH server configuration file." },
      { term: "Drop-in directory", meaning: "/etc/ssh/sshd_config.d, read before the main settings." },
      { term: "sshd -t", meaning: "Tests the configuration for errors." },
      { term: "AllowGroups", meaning: "Only members of these groups may log in." },
      { term: "fail2ban", meaning: "Bans hosts that show malicious log patterns." },
    ],
    example: {
      lang: "bash",
      code: "sudo tee /etc/ssh/sshd_config.d/50-hardening.conf <<EOF\nPermitRootLogin no\nPasswordAuthentication no\nAllowGroups sshusers\nMaxAuthTries 3\nEOF\nsudo groupadd -f sshusers && sudo usermod -aG sshusers ana\nsudo sshd -t && sudo systemctl reload sshd",
      caption: "A hardening drop-in; sshd keeps the first value it reads, so drop-ins override sshd_config.",
    },
    pitfalls: [
      "Disabling passwords before key login works and locking yourself out.",
      "Restarting sshd with a syntax error instead of running sshd -t first.",
    ],
    check: [
      { q: "Which two settings remove the most SSH risk?", a: "PermitRootLogin no and PasswordAuthentication no." },
      { q: "How do you check sshd_config for errors before reloading?", a: "Run sshd -t." },
    ],
  },

  "adm-security/selinux": {
    summary:
      "SELinux adds mandatory access control on top of normal permissions: every process and file has a security context, and policy decides which process types may touch which file types. Most problems come from wrong file labels, a disabled boolean or a non-standard port. The fix is to correct the label or policy setting, never to disable SELinux.",
    visuals: [
      {
        type: "tree",
        title: "Anatomy of a context",
        root: "system_u:object_r:httpd_sys_content_t:s0",
        children: [
          { label: "User: system_u", children: ["SELinux user"] },
          { label: "Role: object_r", children: ["Role for files"] },
          { label: "Type: httpd_sys_content_t", children: ["What targeted policy checks", "httpd_t may read this type"] },
          { label: "Level: s0", children: ["MLS/MCS sensitivity"] },
        ],
      },
      {
        type: "flow",
        title: "Fixing a denial",
        steps: [
          { label: "Symptom", detail: "403 or permission denied despite correct modes." },
          { label: "Confirm", detail: "getenforce; ausearch -m AVC -ts recent." },
          { label: "Find the mismatch", detail: "Wrong file type, boolean off, or unlabelled port." },
          { label: "Fix persistently", detail: "semanage fcontext + restorecon, setsebool -P, or semanage port." },
          { label: "Verify", detail: "Retry with SELinux still enforcing." },
        ],
      },
    ],
    keyPoints: [
      "getenforce shows the mode; setenforce 0 switches to permissive only until reboot.",
      "chcon changes are lost on relabel; use semanage fcontext then restorecon for persistence.",
      "Booleans toggle policy features; -P makes setsebool persistent.",
      "Non-standard ports need a label, such as semanage port -a -t http_port_t -p tcp 8080.",
      "sealert, from setroubleshoot, explains denials and suggests fixes.",
    ],
    terms: [
      { term: "Context", meaning: "user:role:type:level label on processes and files." },
      { term: "Type enforcement", meaning: "Policy rules allowing process types to access file types." },
      { term: "Enforcing / permissive", meaning: "Block and log violations, or only log them." },
      { term: "Boolean", meaning: "On or off switch for parts of the policy." },
      { term: "restorecon", meaning: "Resets files to the labels the policy defines." },
      { term: "AVC denial", meaning: "Logged record of an access SELinux blocked." },
    ],
    example: {
      lang: "bash",
      code: "getenforce\nls -Zd /srv/web; ps -eZ | grep httpd\nsudo ausearch -m AVC -ts recent\nsudo semanage fcontext -a -t httpd_sys_content_t \"/srv/web(/.*)?\"\nsudo restorecon -Rv /srv/web\nsudo setsebool -P httpd_can_network_connect on\nsudo semanage port -a -t http_port_t -p tcp 8080",
      caption: "Serve content from /srv/web and on port 8080 with SELinux enforcing.",
    },
    pitfalls: [
      "Disabling SELinux instead of fixing the label.",
      "Using chcon, which a later relabel silently reverts.",
    ],
    check: [
      { q: "Which part of the context does targeted policy mainly check?", a: "The type, such as httpd_t accessing httpd_sys_content_t." },
      { q: "How do you make a file label survive a relabel?", a: "Add a rule with semanage fcontext -a and apply it with restorecon." },
    ],
  },

  "adm-security/apparmor": {
    summary:
      "AppArmor is the mandatory access control system on Ubuntu and SUSE. Instead of labels, it confines programs with path-based profiles that list which files and capabilities each may use. Profiles run in enforce mode, which blocks violations, or complain mode, which only logs them.",
    visuals: [
      {
        type: "compare",
        title: "SELinux vs AppArmor",
        columns: [
          { title: "SELinux", points: ["Default on RHEL, Fedora", "Label based: contexts on every object", "Whole-system targeted policy", "Tools: semanage, restorecon, setsebool"] },
          { title: "AppArmor", points: ["Default on Ubuntu, SUSE", "Path based profiles per program", "Unprofiled programs run unconfined", "Tools: aa-status, aa-enforce, aa-complain"] },
        ],
      },
    ],
    keyPoints: [
      "aa-status lists loaded profiles and their modes.",
      "Profiles live in /etc/apparmor.d.",
      "aa-complain is the AppArmor equivalent of permissive for one program.",
      "Denials appear in the journal with apparmor=\"DENIED\".",
    ],
    terms: [
      { term: "AppArmor", meaning: "Path-based mandatory access control for Linux." },
      { term: "Profile", meaning: "Rules confining a single program." },
      { term: "Enforce mode", meaning: "Violations are blocked and logged." },
      { term: "Complain mode", meaning: "Violations are only logged." },
    ],
    example: {
      lang: "bash",
      code: "sudo aa-status\nls /etc/apparmor.d/\nsudo apt install -y apparmor-utils\nsudo aa-complain /etc/apparmor.d/usr.sbin.tcpdump\nsudo journalctl -k | grep -i apparmor | tail\nsudo aa-enforce /etc/apparmor.d/usr.sbin.tcpdump",
      caption: "Inspect profiles, switch one to complain mode and back.",
    },
    check: [
      { q: "What is the main design difference between AppArmor and SELinux?", a: "AppArmor confines programs by file paths; SELinux uses labels on every object." },
      { q: "Which mode logs but does not block?", a: "Complain mode." },
    ],
  },

  // ───────────── Scheduling & shell scripting ─────────────
  "adm-automation/cron-at": {
    summary:
      "cron runs commands on a repeating schedule defined by five time fields, and at runs a command once at a given time. Users manage their own jobs with crontab -e, while system jobs go in /etc/cron.d. Output that is not redirected is mailed to the owner or lost, so log it deliberately.",
    visuals: [
      {
        type: "tree",
        title: "Reading 30 2 * * 1-5 /usr/local/bin/backup.sh",
        root: "crontab line",
        children: [
          { label: "Minute: 30" },
          { label: "Hour: 2", children: ["24-hour clock, so 02:30"] },
          { label: "Day of month: *" },
          { label: "Month: *" },
          { label: "Day of week: 1-5", children: ["Monday to Friday; 0 or 7 is Sunday"] },
          { label: "Command", children: ["Use absolute paths; cron has a minimal PATH"] },
        ],
      },
    ],
    keyPoints: [
      "*/15 in the minute field means every 15 minutes.",
      "Files in /etc/cron.d include a user field before the command.",
      "crontab -l lists and crontab -u user -e edits another user's jobs as root.",
      "at now + 10 minutes schedules a one-off job; atq lists and atrm removes jobs.",
    ],
    terms: [
      { term: "cron", meaning: "Daemon that runs scheduled recurring jobs." },
      { term: "crontab", meaning: "A user's table of cron jobs, and the command to edit it." },
      { term: "/etc/cron.d", meaning: "Directory for system cron files with a user field." },
      { term: "at", meaning: "Schedules a command to run once." },
    ],
    example: {
      lang: "bash",
      code: "crontab -e\n# m  h  dom mon dow  command\n*/15 *  *   *   *   /usr/local/bin/check-disk.sh >> /var/log/check-disk.log 2>&1\n30   2  *   *   1-5 /usr/local/bin/backup.sh\nsudo crontab -u natasha -l\necho \"systemctl restart httpd\" | sudo at 23:00\natq",
      caption: "Recurring jobs with cron, a one-off restart with at.",
    },
    pitfalls: [
      "Relying on PATH or environment variables that cron does not set.",
      "Using an unescaped % in a crontab command, where cron treats it as a newline.",
    ],
    check: [
      { q: "What does */10 in the minute field mean?", a: "Every 10 minutes." },
      { q: "What extra field do /etc/cron.d files have?", a: "A user name between the schedule and the command." },
    ],
  },

  "adm-automation/systemd-timers": {
    summary:
      "systemd timers are the modern alternative to cron. A timer unit decides when to run and activates a matching service unit that does the work, so you get journald logging, dependencies, resource limits and catch-up for missed runs with Persistent=true.",
    visuals: [
      {
        type: "sequence",
        title: "A timer firing",
        actors: ["systemd", "backup.timer", "backup.service", "journald"],
        messages: [
          { from: 0, to: 1, label: "Timer started at boot (timers.target)" },
          { from: 1, to: 2, label: "OnCalendar time reached: start the service" },
          { from: 2, to: 3, label: "Script output logged with the unit name" },
          { from: 2, to: 0, label: "Oneshot service exits with a status" },
          { from: 0, to: 1, label: "Next elapse time scheduled" },
        ],
      },
    ],
    keyPoints: [
      "foo.timer activates foo.service by default.",
      "Enable and start the timer, not the service.",
      "OnCalendar=*-*-* 02:30:00 means daily at 02:30; systemd-analyze calendar checks expressions.",
      "Persistent=true runs a missed job at the next boot.",
    ],
    terms: [
      { term: "Timer unit", meaning: "Unit that activates another unit on a schedule." },
      { term: "OnCalendar", meaning: "Wall-clock schedule expression." },
      { term: "OnBootSec", meaning: "Run a set time after boot." },
      { term: "Type=oneshot", meaning: "Service that runs a task and exits." },
      { term: "Persistent", meaning: "Catch up on runs missed while powered off." },
    ],
    example: {
      lang: "ini",
      code: "# /etc/systemd/system/backup.service\n[Service]\nType=oneshot\nExecStart=/usr/local/bin/backup.sh\n\n# /etc/systemd/system/backup.timer\n[Timer]\nOnCalendar=*-*-* 02:30:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n# then: systemctl daemon-reload && systemctl enable --now backup.timer",
      caption: "A nightly backup as a timer and service pair.",
    },
    check: [
      { q: "Which unit do you enable, the timer or the service?", a: "The timer." },
      { q: "What does Persistent=true do?", a: "Runs the job at boot if a scheduled run was missed while the machine was off." },
    ],
  },

  "adm-automation/bash-scripting": {
    summary:
      "Bash scripts turn command sequences into repeatable tools. A robust script starts with a shebang and strict mode, checks its arguments, quotes every variable, uses functions for structure and returns meaningful exit codes. The RHCSA expects simple scripts with loops, conditionals and arguments.",
    visuals: [
      {
        type: "flow",
        title: "Anatomy of a robust script",
        steps: [
          { label: "Shebang", detail: "#!/usr/bin/env bash" },
          { label: "Strict mode", detail: "set -euo pipefail stops on errors." },
          { label: "Validate input", detail: "Check $# and print usage on misuse." },
          { label: "Functions", detail: "Small named steps with local variables." },
          { label: "Main logic", detail: "Loops and conditionals on quoted variables." },
          { label: "Exit code", detail: "0 for success, non-zero for failure." },
        ],
      },
    ],
    keyPoints: [
      "Quote variables, as in \"$file\", so spaces do not split them.",
      "$1, $2 are arguments, $# is their count and $? is the last exit status.",
      "[[ -f file ]] tests for a file and [[ $a -gt 5 ]] compares numbers.",
      "Loop over files with for f in /path/*; loop over lines with while read -r line.",
    ],
    terms: [
      { term: "Shebang", meaning: "First line naming the interpreter." },
      { term: "set -euo pipefail", meaning: "Exit on errors, unset variables and failed pipes." },
      { term: "Exit status", meaning: "0 for success, 1 to 255 for failure." },
      { term: "Positional parameters", meaning: "$1, $2 and so on: script arguments." },
      { term: "local", meaning: "Declares a variable scoped to a function." },
    ],
    example: {
      lang: "bash",
      code: "#!/usr/bin/env bash\nset -euo pipefail\nusage() { echo \"usage: $0 DIR DAYS\" >&2; exit 1; }\n[[ $# -eq 2 ]] || usage\ndir=$1; days=$2\n[[ -d $dir ]] || { echo \"no such dir: $dir\" >&2; exit 2; }\ncount=0\nwhile IFS= read -r -d '' f; do\n  gzip -- \"$f\"; count=$((count + 1))\ndone < <(find \"$dir\" -name \"*.log\" -mtime +\"$days\" -print0)\necho \"compressed $count files in $dir\"",
      caption: "Compress logs older than N days, safely handling odd file names.",
    },
    pitfalls: [
      "Unquoted variables that break on spaces or empty values.",
      "Parsing ls output instead of using globs or find -print0.",
    ],
    check: [
      { q: "What does set -e do?", a: "Exits the script as soon as a command fails." },
      { q: "Which variable holds the number of arguments?", a: "$#." },
    ],
  },

  "adm-automation/admin-scripts": {
    summary:
      "Good admin scripts are idempotent: running them twice leaves the system in the same state as running them once. They check before changing, log what they did and fail loudly. Typical examples are bulk user creation, disk space alerts and daily health reports.",
    visuals: [
      {
        type: "cycle",
        title: "Idempotent automation loop",
        steps: [
          { label: "Check current state", detail: "Does the user, file or setting exist?" },
          { label: "Compare with desired state" },
          { label: "Change only if needed" },
          { label: "Log the action", detail: "logger -t script for the journal." },
          { label: "Verify and exit with a status" },
        ],
      },
    ],
    keyPoints: [
      "Test for existence first, for example id user before useradd.",
      "logger sends messages to the journal so you can find them with journalctl -t.",
      "Run shellcheck on every script to catch quoting and logic bugs.",
      "Schedule scripts with timers and monitor their exit status.",
    ],
    terms: [
      { term: "Idempotent", meaning: "Safe to run repeatedly with the same result." },
      { term: "logger", meaning: "Writes a message to the system log." },
      { term: "shellcheck", meaning: "Static analysis tool for shell scripts." },
      { term: "IFS", meaning: "Internal field separator used to split input." },
    ],
    example: {
      lang: "bash",
      code: "#!/usr/bin/env bash\nset -euo pipefail\n# users.csv lines: name,group\nwhile IFS=, read -r name group; do\n  getent group \"$group\" >/dev/null || groupadd \"$group\"\n  if id \"$name\" &>/dev/null; then\n    logger -t mkusers \"skip $name: exists\"\n  else\n    useradd -m -G \"$group\" \"$name\" && logger -t mkusers \"created $name\"\n  fi\ndone < users.csv\nuse=$(df --output=pcent / | tail -1 | tr -dc 0-9)\n(( use < 90 )) || logger -p user.warning -t diskcheck \"root at ${use}%\"",
      caption: "Idempotent bulk user creation and a disk usage alert.",
    },
    check: [
      { q: "What makes a script idempotent?", a: "It checks the current state and only makes changes that are still needed." },
      { q: "How do you find messages a script logged with logger -t mkusers?", a: "journalctl -t mkusers." },
    ],
  },

  // ───────────── Monitoring, backups & containers ─────────────
  "adm-operations/performance-monitoring": {
    summary:
      "When a server is slow, the first job is to find which resource is saturated: CPU, memory, disk I/O or network. top shows load and the busiest processes, free shows memory, vmstat shows run queues, swapping and I/O wait over time, and iostat shows per-disk utilisation and latency.",
    visuals: [
      {
        type: "tree",
        title: "Which resource is the bottleneck?",
        root: "Server feels slow",
        children: [
          { label: "CPU", children: ["Load average above core count", "High us or sy in top", "vmstat r column high"] },
          { label: "Memory", children: ["Low available in free -h", "vmstat si and so non-zero", "OOM kills in the journal"] },
          { label: "Disk I/O", children: ["High wa in top", "iostat -xz: high %util and await"] },
          { label: "Network", children: ["ip -s link errors or drops", "ss shows many stuck connections"] },
        ],
      },
    ],
    keyPoints: [
      "Load average counts runnable tasks and tasks in uninterruptible I/O wait, so compare it with the CPU count.",
      "Linux uses free RAM for cache; look at the available column, not free.",
      "Run vmstat 1 or iostat -xz 1 for a few seconds; the first line is an average since boot.",
      "tuned-adm applies tuned profiles such as virtual-guest or throughput-performance.",
    ],
    terms: [
      { term: "Load average", meaning: "Average number of runnable or I/O-blocked tasks over 1, 5 and 15 minutes." },
      { term: "iowait (wa)", meaning: "CPU idle time spent waiting for I/O." },
      { term: "vmstat", meaning: "Reports processes, memory, swap, I/O and CPU over time." },
      { term: "iostat", meaning: "Reports per-device I/O statistics." },
      { term: "tuned", meaning: "Service that applies tuning profiles." },
    ],
    example: {
      lang: "bash",
      code: "uptime; nproc\ntop -b -n 1 | head -15\nfree -h\nvmstat 1 5\niostat -xz 1 3\nps -eo pid,comm,%cpu,%mem --sort=-%mem | head\nsudo tuned-adm recommend && sudo tuned-adm active",
      caption: "Triage: CPU, memory, I/O, top consumers and tuning profile.",
    },
    check: [
      { q: "Which free column shows memory really available to programs?", a: "available." },
      { q: "Which vmstat columns reveal swapping?", a: "si and so (swap in and swap out)." },
    ],
  },

  "adm-operations/troubleshooting-method": {
    summary:
      "Good troubleshooting is a method, not luck. Start from a precise symptom, ask what changed, gather evidence from status, logs and resource checks, form one hypothesis at a time, test it, and record the root cause. Most real incidents are a failed service, a full disk, a bad config, DNS or a firewall or SELinux rule.",
    visuals: [
      {
        type: "cycle",
        title: "The troubleshooting loop",
        steps: [
          { label: "Observe", detail: "Exact symptom, scope and recent changes." },
          { label: "Gather evidence", detail: "systemctl status, journalctl, df, ss." },
          { label: "Hypothesise", detail: "One likely cause at a time." },
          { label: "Test and fix", detail: "Smallest change that confirms or rules it out." },
          { label: "Verify and record", detail: "Confirm the fix and write down the root cause." },
        ],
      },
    ],
    keyPoints: [
      "systemctl status and journalctl -xeu NAME explain most service failures.",
      "Check df -h and df -i; full disks break services in confusing ways.",
      "Test the network bottom-up: link, address, route, DNS, port, application.",
      "Change one thing at a time so you know what fixed it.",
    ],
    terms: [
      { term: "Root cause", meaning: "Underlying reason, not just the visible symptom." },
      { term: "journalctl -xe", meaning: "Recent journal entries with explanatory text." },
      { term: "Inode exhaustion", meaning: "No free inodes, so no new files, despite free space." },
      { term: "Postmortem", meaning: "Written record of an incident and its fix." },
    ],
    example: {
      lang: "bash",
      code: "systemctl --failed\nsudo journalctl -xeu httpd | tail -30\ndf -h; df -i\nsudo ss -tulpn | grep -E \":80|:443\"\ngetent hosts db01 && curl -sv http://localhost/ -o /dev/null\nsudo ausearch -m AVC -ts recent | tail\nsudo firewall-cmd --list-all",
      caption: "A first-five-minutes checklist for a broken web service.",
    },
    check: [
      { q: "Why change only one thing at a time?", a: "So you know which change fixed or broke the system." },
      { q: "A service fails to write files although df -h shows space. What next?", a: "Check df -i for inode exhaustion, then permissions and SELinux denials." },
    ],
  },

  "adm-operations/backups-archives": {
    summary:
      "tar bundles files into an archive, optionally compressed with gzip, bzip2 or xz, and preserves permissions. rsync copies only what changed, locally or over SSH, which makes it ideal for regular backups. A backup only counts once you have restored from it successfully.",
    visuals: [
      {
        type: "compare",
        title: "Backup tools",
        columns: [
          { title: "tar", points: ["Single archive file", "Compress with z, j or J", "Good for snapshots and transfers", "Restore with tar -x"] },
          { title: "rsync", points: ["Copies only differences", "Works over SSH", "--delete mirrors removals", "Great for nightly backups"] },
          { title: "3-2-1 rule", points: ["3 copies of the data", "2 different media", "1 copy off-site", "Test restores regularly"] },
        ],
      },
    ],
    keyPoints: [
      "tar czf creates gzip archives, tar cJf xz archives; tar tf lists contents.",
      "Use -C to choose where to extract instead of cd.",
      "A trailing slash on the rsync source copies its contents, not the directory itself.",
      "rsync -a preserves permissions and times; add -n first for a dry run.",
    ],
    terms: [
      { term: "Archive", meaning: "Single file containing many files and their metadata." },
      { term: "tar", meaning: "Tape archiver used to create and extract archives." },
      { term: "rsync", meaning: "Efficient file synchronisation tool." },
      { term: "Incremental backup", meaning: "Copies only what changed since the last run." },
      { term: "Restore test", meaning: "Proving a backup can actually be recovered." },
    ],
    example: {
      lang: "bash",
      code: "sudo tar czf /backup/etc-$(date +%F).tar.gz /etc\ntar tzf /backup/etc-2026-11-09.tar.gz | head\nsudo tar xzf /backup/etc-2026-11-09.tar.gz -C /tmp/restore\nrsync -an --delete /srv/web/ backup01:/backups/web/   # dry run\nrsync -a --delete /srv/web/ backup01:/backups/web/\ntar cJf home.tar.xz /home && ls -lh home.tar.xz",
      caption: "Archive, list, restore elsewhere and sync incrementally over SSH.",
    },
    pitfalls: [
      "Using rsync --delete with the wrong source path and wiping the backup.",
      "Never testing a restore until the day it is needed.",
    ],
    check: [
      { q: "Which tar options create an xz-compressed archive?", a: "tar cJf archive.tar.xz files." },
      { q: "What does a trailing slash on an rsync source mean?", a: "Copy the directory's contents rather than the directory itself." },
    ],
  },

  "adm-operations/podman-containers": {
    summary:
      "Podman runs OCI containers without a central daemon and can run them rootless as a normal user. Its commands mirror Docker's: pull images, run containers with published ports and environment variables, and mount host directories for persistent data. On SELinux systems the :Z volume option relabels host directories so containers can use them.",
    visuals: [
      {
        type: "layers",
        title: "Rootless Podman stack",
        layers: [
          { label: "podman CLI", detail: "No daemon; runs as your user." },
          { label: "conmon", detail: "Small monitor process per container." },
          { label: "OCI runtime (crun)", detail: "Creates the container process." },
          { label: "Kernel features", detail: "User namespaces, cgroups, SELinux labels." },
          { label: "Image storage", detail: "~/.local/share/containers for rootless users." },
        ],
      },
    ],
    keyPoints: [
      "Use fully qualified image names such as registry.access.redhat.com/ubi9/ubi.",
      "-p 8080:80 publishes a port; rootless containers cannot bind ports below 1024 by default.",
      "-v /host/dir:/data:Z mounts storage with a private SELinux label.",
      "podman logs, exec and inspect are the main debugging tools.",
      "Build images from a Containerfile with podman build.",
    ],
    terms: [
      { term: "Image", meaning: "Read-only template a container starts from." },
      { term: "Container", meaning: "Running, isolated instance of an image." },
      { term: "Rootless", meaning: "Running containers as an unprivileged user." },
      { term: "Registry", meaning: "Server that stores and serves images." },
      { term: "Containerfile", meaning: "Build recipe for an image, same as a Dockerfile." },
      { term: ":Z", meaning: "Volume option that relabels content for one container." },
    ],
    example: {
      lang: "bash",
      code: "podman search httpd\npodman pull registry.access.redhat.com/ubi9/httpd-24\nmkdir -p ~/web && echo hello > ~/web/index.html\npodman run -d --name web -p 8080:8080 \\\n  -v ~/web:/var/www/html:Z registry.access.redhat.com/ubi9/httpd-24\ncurl localhost:8080\npodman ps; podman logs web; podman exec -it web bash",
      caption: "Run a rootless web container serving files from your home directory.",
    },
    pitfalls: [
      "Forgetting :Z, so SELinux blocks the container from reading the volume.",
      "Using short image names that resolve to an unexpected registry.",
    ],
    check: [
      { q: "Why does Podman not need a daemon?", a: "Each podman command starts containers directly through conmon and the OCI runtime." },
      { q: "What does :Z do on a volume mount?", a: "Relabels the host directory so only this container can access it under SELinux." },
    ],
  },

  "adm-operations/podman-systemd": {
    summary:
      "Containers should start at boot like any other service. Quadlet lets you describe a container in a small .container file, and systemd generates a matching service unit from it. For rootless containers, lingering keeps the user's systemd instance running without a login session.",
    visuals: [
      {
        type: "flow",
        title: "Rootless container as a service with Quadlet",
        steps: [
          { label: "Write web.container", detail: "In ~/.config/containers/systemd/." },
          { label: "daemon-reload", detail: "systemctl --user daemon-reload generates web.service." },
          { label: "Start it", detail: "systemctl --user start web." },
          { label: "Enable lingering", detail: "loginctl enable-linger so it runs without a login." },
          { label: "Reboot and verify", detail: "podman ps and systemctl --user status web." },
        ],
      },
    ],
    keyPoints: [
      "The [Install] section with WantedBy=default.target makes a Quadlet unit start at boot.",
      "Generated units cannot be enabled with systemctl enable; the [Install] section does that.",
      "Use systemctl --user for rootless units and log in as that user, not via su.",
      "podman generate systemd is the older, deprecated approach you may still see.",
    ],
    terms: [
      { term: "Quadlet", meaning: "Podman's systemd generator for .container files." },
      { term: "Lingering", meaning: "Keeps a user's systemd manager running after logout." },
      { term: "systemctl --user", meaning: "Controls the per-user systemd instance." },
      { term: "default.target", meaning: "Default target of the user manager." },
    ],
    example: {
      lang: "ini",
      code: "# ~/.config/containers/systemd/web.container\n[Container]\nImage=registry.access.redhat.com/ubi9/httpd-24\nPublishPort=8080:8080\nVolume=%h/web:/var/www/html:Z\n\n[Install]\nWantedBy=default.target\n\n# systemctl --user daemon-reload && systemctl --user start web\n# loginctl enable-linger $USER",
      caption: "A Quadlet unit; %h expands to the user's home directory.",
    },
    check: [
      { q: "Why enable lingering for a rootless container service?", a: "Without it the user's systemd instance and its services stop when the user logs out and do not start at boot." },
      { q: "Where do rootless Quadlet files go?", a: "~/.config/containers/systemd/." },
    ],
  },

  // ───────────── Capstone & timed practice ─────────────
  "adm-capstone/provision-server": {
    summary:
      "Bring everything together by turning a fresh VM into a useful server, such as a web server with its content on LVM and a nightly backup. Work in a sensible order: identity and network first, then accounts, storage, software, services and scheduling. Keep notes of every command so you could rebuild it from a script.",
    visuals: [
      {
        type: "flow",
        title: "Provisioning order",
        steps: [
          { label: "Identity and network", detail: "Hostname, static IP, DNS, chrony." },
          { label: "Accounts", detail: "Admin group, users, sudo drop-in, SSH keys." },
          { label: "Storage", detail: "PV, VG, LV, xfs, fstab entry for /srv." },
          { label: "Software", detail: "Repositories, dnf install, updates." },
          { label: "Services", detail: "Enable web server, firewall and SELinux labels." },
          { label: "Scheduling", detail: "Backup service and timer, then reboot and verify." },
        ],
      },
    ],
    keyPoints: [
      "Do network and access first, so a mistake later does not cut you off.",
      "Every change must survive a reboot; reboot at the end and re-check.",
      "Script the steps as you go; your notes become your next automation.",
      "Verify from a second machine, not just from localhost.",
    ],
    terms: [
      { term: "Provisioning", meaning: "Bringing a new machine to a working configuration." },
      { term: "Baseline", meaning: "Standard configuration every server starts from." },
      { term: "Runbook", meaning: "Step-by-step notes to repeat or recover a setup." },
      { term: "Persistence", meaning: "Configuration that survives reboot." },
    ],
    example: {
      lang: "bash",
      code: "sudo hostnamectl set-hostname web01.lab.example.com\nsudo nmcli con mod ens160 ipv4.method manual ipv4.addresses 192.168.1.50/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.1 && sudo nmcli con up ens160\nsudo pvcreate /dev/vdb && sudo vgcreate vgsrv /dev/vdb && sudo lvcreate -n lvweb -L 2G vgsrv\nsudo mkfs.xfs /dev/vgsrv/lvweb && sudo mkdir -p /srv/web\necho \"/dev/vgsrv/lvweb /srv/web xfs defaults 0 0\" | sudo tee -a /etc/fstab && sudo mount -a\nsudo dnf install -y httpd && sudo systemctl enable --now httpd\nsudo firewall-cmd --permanent --add-service=http && sudo firewall-cmd --reload\nsudo semanage fcontext -a -t httpd_sys_content_t \"/srv/web(/.*)?\" && sudo restorecon -Rv /srv/web",
      caption: "Core provisioning steps; then point DocumentRoot at /srv/web and add a backup timer.",
    },
    check: [
      { q: "Why configure networking and SSH access first?", a: "So later mistakes do not lock you out and the rest of the work can be done remotely." },
      { q: "What is the final step after provisioning?", a: "Reboot and verify that every service, mount and setting came back." },
    ],
  },

  "adm-capstone/harden-server": {
    summary:
      "Hardening means reducing what an attacker can reach and what they can do once inside. Layer controls: a tight firewall, key-only SSH for a limited group, least-privilege sudo, SELinux enforcing, automatic security updates and regular audits. Verify each control from another machine rather than assuming it works.",
    visuals: [
      {
        type: "layers",
        title: "Defence in depth on one server",
        layers: [
          { label: "Network", detail: "firewalld allows only ssh and http(s)." },
          { label: "Remote access", detail: "Key-only SSH, no root, AllowGroups." },
          { label: "Accounts", detail: "Password aging, scoped sudo, no unused users." },
          { label: "Confinement", detail: "SELinux enforcing with correct labels." },
          { label: "Maintenance", detail: "Automatic security updates, logs reviewed." },
        ],
      },
    ],
    keyPoints: [
      "Remove or disable services and packages you do not need.",
      "dnf-automatic or unattended-upgrades applies security updates on a schedule.",
      "Audit regularly: listening ports, SUID files, sudoers and failed logins.",
      "Test controls from outside: try a password login and a closed port and confirm they fail.",
    ],
    terms: [
      { term: "Attack surface", meaning: "Everything an attacker can try to reach." },
      { term: "Least privilege", meaning: "Grant only the access a task needs." },
      { term: "Defence in depth", meaning: "Several independent layers of protection." },
      { term: "dnf-automatic", meaning: "Service that downloads and applies updates on a schedule." },
    ],
    example: {
      lang: "bash",
      code: "sudo ss -tulpn                                  # what is listening?\nsudo systemctl disable --now cups avahi-daemon 2>/dev/null\nsudo dnf install -y dnf-automatic\nsudo sed -i 's/^apply_updates.*/apply_updates = yes/' /etc/dnf/automatic.conf\nsudo systemctl enable --now dnf-automatic.timer\ngetenforce                                      # must be Enforcing\nsudo find / -perm -4000 -type f 2>/dev/null\nssh -o PubkeyAuthentication=no ana@web01        # should be refused",
      caption: "Trim services, automate updates and audit.",
    },
    check: [
      { q: "How do you prove password SSH logins are disabled?", a: "Try ssh -o PubkeyAuthentication=no from another machine and confirm it is refused." },
      { q: "Name two regular audit checks.", a: "Listening ports with ss -tulpn and SUID files with find -perm -4000." },
    ],
  },

  "adm-capstone/timed-practice": {
    summary:
      "The RHCSA is a timed, hands-on exam: you get a list of tasks on real machines and everything is checked after a reboot. Practise full task sets under a timer, starting with anything that blocks other work, such as resetting root or fixing networking. Speed comes from repetition; correctness comes from verifying and rebooting.",
    visuals: [
      {
        type: "cycle",
        title: "Practice session loop",
        steps: [
          { label: "Read every task first", detail: "Note dependencies and quick wins." },
          { label: "Unblock access", detail: "Root reset, networking, repositories." },
          { label: "Work through tasks", detail: "Storage, users, permissions, SELinux, containers." },
          { label: "Reboot and verify", detail: "Everything must persist." },
          { label: "Review misses", detail: "Redo weak tasks until automatic." },
        ],
      },
    ],
    keyPoints: [
      "Work on a fresh VM each time and keep a written task list from the RHCSA objectives.",
      "Make every change persistent: enable services, use --permanent, fstab and -P.",
      "Reboot before the time is up; a server that does not boot can fail the whole exam.",
      "Use man pages and /usr/share/doc instead of memorising every option.",
    ],
    terms: [
      { term: "Performance-based exam", meaning: "Graded on real configured systems, not answers." },
      { term: "Persistence check", meaning: "Grading happens after a reboot." },
      { term: "Task dependency", meaning: "A task that must work before others can." },
      { term: "Objectives", meaning: "Official list of skills the exam covers." },
    ],
    example: {
      lang: "bash",
      code: "# Sample 20-minute drill\n# 1. Create VG vgexam with 16M extents and LV lvexam of 30 extents, xfs, mount at /exam\n# 2. Group devops, users amy and bob, shared dir /devops with SGID, mode 2770\n# 3. Cron job for amy at 14:23 daily running: logger \"EX200 drill\"\n# 4. Serve /srv/web from httpd on port 82 with SELinux enforcing\n# 5. Rootless container for bob that starts at boot\n# Then:\nsudo systemctl reboot\n# ...and check every item again: findmnt, ls -ld, crontab -l -u amy, curl, podman ps",
      caption: "Write your own drills from the objectives and always finish with a reboot.",
    },
    check: [
      { q: "Why reboot before finishing a practice set?", a: "Tasks are graded after a reboot, so anything not persistent counts as failed." },
      { q: "What should you fix first in an exam-style task list?", a: "Anything that blocks other work, such as root access, networking or repositories." },
    ],
  },
};

export default explainers;
