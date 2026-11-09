import type { LearningPath } from "../types";

const L = (label: string, url: string) => ({ label, url });

const path: LearningPath = {
  slug: "linux-administration",
  title: "Linux Administration (RHCSA-style)",
  tagline: "Run, secure and fix Linux servers from the command line.",
  description:
    "A hands-on path through everyday Linux administration, aligned with the RHCSA objectives and equally useful on Ubuntu. You learn the shell, permissions, users, packages, systemd, storage with LVM, networking, SSH, SELinux, scheduling, troubleshooting, backups and Podman containers, then prove it by provisioning and hardening a server and solving timed exam-style tasks.",
  level: "Beginner → Intermediate",
  category: "DevOps & Cloud",
  icon: "terminal",
  outcomes: [
    "Work fluently in the shell and manage files, permissions, ACLs, users and sudo",
    "Install software and manage services, logs and the boot process with systemd",
    "Partition disks, build LVM volumes and file systems, and mount them persistently",
    "Configure networking, firewalls and hardened key-based SSH access",
    "Troubleshoot SELinux denials, performance problems and failed services methodically",
    "Automate admin tasks with scripts, timers and Podman containers run as services",
  ],
  tools: ["bash", "vim", "dnf / rpm", "apt / dpkg", "systemctl & journalctl", "LVM", "nmcli", "firewalld / ufw", "OpenSSH", "SELinux tools", "Podman", "tar & rsync"],
  modules: [
    {
      key: "adm-shell",
      title: "Shell & essential tools",
      summary: "Get comfortable and fast at the command line.",
      links: [L("roadmap.sh Linux", "https://roadmap.sh/linux"), L("bash(1)", "https://man7.org/linux/man-pages/man1/bash.1.html")],
      topics: [
        { key: "lab-setup", title: "Lab setup, getting help & vim", hours: 3, goal: "Run a RHEL-compatible and an Ubuntu VM and find answers with man, --help and vim.", subtopics: ["Install Rocky or Alma and Ubuntu VMs", "Snapshot VMs before risky changes", "Search docs with man -k and --help", "Edit, save and quit files in vim"], links: [L("RHCSA exam objectives", "https://www.redhat.com/en/services/certification/rhcsa")] },
        { key: "shell-navigation", title: "Navigating the file system hierarchy", hours: 2.5, goal: "Move around the tree confidently and know what lives in each top-level directory.", subtopics: ["Use absolute and relative paths", "Explain /etc, /var, /home, /usr, /tmp", "Use tab completion and history", "Use globbing and brace expansion"], links: [L("hier(7)", "https://man7.org/linux/man-pages/man7/hier.7.html")] },
        { key: "text-tools", title: "Text processing: grep, sed, awk, sort, cut", hours: 4, goal: "Extract and transform information from logs and config files with one-liners.", subtopics: ["Search with grep and regular expressions", "Edit streams with sed substitutions", "Print columns with awk and cut", "Count and deduplicate with sort and uniq", "Compare files with diff"], links: [L("grep(1)", "https://man7.org/linux/man-pages/man1/grep.1.html"), L("sed(1)", "https://man7.org/linux/man-pages/man1/sed.1.html")] },
        { key: "redirection-pipes", title: "Redirection, pipes & the shell environment", hours: 2.5, goal: "Chain commands with pipes, redirect output and errors, and customise the environment.", subtopics: ["Redirect stdout and stderr to files", "Chain commands with pipes and tee", "Set variables and export them", "Persist settings in .bashrc", "Use command substitution"] },
      ],
    },
    {
      key: "adm-files",
      title: "Files, permissions & ACLs",
      summary: "Control who can read, change and run what.",
      links: [L("chmod(1)", "https://man7.org/linux/man-pages/man1/chmod.1.html"), L("RHEL 9 documentation", "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9")],
      topics: [
        { key: "file-management", title: "Files, links & find", hours: 2.5, goal: "Create, copy, move and link files and locate anything with find.", subtopics: ["Copy, move and remove files safely", "Create hard and symbolic links", "Find files by name, size, owner, time", "Run actions on find results"], links: [L("find(1)", "https://man7.org/linux/man-pages/man1/find.1.html")] },
        { key: "permissions", title: "Permissions, ownership & umask", hours: 3, goal: "Set exactly the right permissions and ownership with chmod, chown and umask.", subtopics: ["Read permissions in ls -l output", "Use symbolic and octal chmod", "Change owners with chown and chgrp", "Set default permissions with umask"] },
        { key: "special-perms", title: "SUID, SGID & the sticky bit", hours: 2, goal: "Build a shared group directory and explain each special permission bit.", subtopics: ["Explain SUID on executables", "Use SGID for shared group directories", "Protect shared dirs with the sticky bit", "Audit SUID files with find"] },
        { key: "acls", title: "Access control lists", hours: 2, goal: "Grant per-user and default permissions with setfacl beyond owner, group and other.", subtopics: ["Read ACLs with getfacl", "Grant a user access with setfacl", "Set default ACLs on directories", "Understand the ACL mask"], links: [L("setfacl(1)", "https://man7.org/linux/man-pages/man1/setfacl.1.html")] },
      ],
    },
    {
      key: "adm-users",
      title: "Users, groups & sudo",
      summary: "Manage accounts and delegate privileges safely.",
      links: [L("useradd(8)", "https://man7.org/linux/man-pages/man8/useradd.8.html"), L("sudoers(5)", "https://man7.org/linux/man-pages/man5/sudoers.5.html")],
      topics: [
        { key: "users-groups", title: "Users, groups & password policy", hours: 3.5, goal: "Create, modify and lock accounts and enforce password aging.", subtopics: ["Create users with useradd and passwd", "Manage groups and supplementary membership", "Read /etc/passwd, /etc/shadow, /etc/group", "Set password aging with chage", "Set defaults in /etc/login.defs"] },
        { key: "sudo", title: "sudo & privilege delegation", hours: 2, goal: "Grant scoped administrative rights with sudoers drop-in files edited via visudo.", subtopics: ["Add users to wheel or sudo group", "Write drop-ins in /etc/sudoers.d", "Validate syntax with visudo -c", "Restrict commands in a sudo rule"] },
      ],
    },
    {
      key: "adm-packages",
      title: "Package management",
      summary: "Install, update and trust software on RHEL and Debian families.",
      links: [L("RHEL 9 documentation", "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9"), L("Ubuntu Server docs", "https://ubuntu.com/server/docs")],
      topics: [
        { key: "dnf-rpm", title: "dnf, rpm & repositories", hours: 3.5, goal: "Install, update and query packages and configure a custom repository with dnf.", subtopics: ["Search, install and remove with dnf", "Query installed packages with rpm -q", "Add a repo file in /etc/yum.repos.d", "Import and verify GPG keys", "Inspect history and roll back"] },
        { key: "apt-dpkg", title: "apt & dpkg on Ubuntu", hours: 2, goal: "Manage packages and sources on Debian-family systems.", subtopics: ["Update indexes and upgrade with apt", "Install and remove packages", "Query packages with dpkg -l and -L", "Add a third-party source safely"] },
      ],
    },
    {
      key: "adm-systemd",
      title: "Processes, services & logs",
      summary: "Control what runs, when it starts and why it failed.",
      links: [L("systemctl(1)", "https://man7.org/linux/man-pages/man1/systemctl.1.html"), L("systemd", "https://systemd.io/")],
      topics: [
        { key: "process-management", title: "Processes, signals & priorities", hours: 3, goal: "Find, prioritise and stop processes with ps, top, kill and nice.", subtopics: ["List processes with ps and pgrep", "Watch usage interactively in top", "Send signals with kill and pkill", "Adjust priority with nice and renice", "Manage jobs with bg, fg and jobs"] },
        { key: "systemd-units", title: "Managing services with systemctl", hours: 3, goal: "Start, stop, enable and inspect services and understand unit dependencies.", subtopics: ["Start, stop and restart services", "Enable and disable services at boot", "Read status and failed units", "Mask units to prevent starting", "List dependencies of a unit"] },
        { key: "unit-files", title: "Writing & overriding unit files", hours: 2.5, goal: "Write a service unit and override vendor settings with drop-in files.", subtopics: ["Read a vendor unit with systemctl cat", "Write a custom service unit", "Override settings with systemctl edit", "Reload with daemon-reload"], links: [L("systemd.unit(5)", "https://man7.org/linux/man-pages/man5/systemd.unit.5.html")] },
        { key: "journald", title: "Logs with journalctl & rsyslog", hours: 2.5, goal: "Filter logs by unit, priority and time and keep the journal across reboots.", subtopics: ["Filter journal by unit and priority", "Filter by time and boot", "Make the journal persistent", "Find classic logs in /var/log"], links: [L("journalctl(1)", "https://man7.org/linux/man-pages/man1/journalctl.1.html")] },
        { key: "boot-targets", title: "Boot process, targets & root recovery", hours: 3.5, goal: "Explain the boot sequence, switch targets and reset a lost root password.", subtopics: ["Trace firmware, GRUB, kernel, systemd", "Set the default target", "Boot into rescue or emergency target", "Reset the root password via rd.break", "Change kernel arguments with grubby"] },
      ],
    },
    {
      key: "adm-storage",
      title: "Storage",
      summary: "Disks, partitions, LVM, file systems and network mounts.",
      links: [L("lvm(8)", "https://man7.org/linux/man-pages/man8/lvm.8.html"), L("fstab(5)", "https://man7.org/linux/man-pages/man5/fstab.5.html")],
      topics: [
        { key: "partitions", title: "Disks & partitions", hours: 3, goal: "Inspect block devices and create GPT partitions with parted or fdisk.", subtopics: ["List devices with lsblk and blkid", "Compare MBR and GPT", "Create partitions with fdisk or parted", "Inform the kernel with partprobe"], links: [L("fdisk(8)", "https://man7.org/linux/man-pages/man8/fdisk.8.html")] },
        { key: "filesystems", title: "Creating file systems: ext4 & xfs", hours: 2.5, goal: "Create, label, check and grow ext4 and xfs file systems.", subtopics: ["Create file systems with mkfs", "Label and identify by UUID", "Grow xfs and ext4 file systems", "Check usage with df and du"] },
        { key: "mounting-swap", title: "Mounting, /etc/fstab & swap", hours: 3, goal: "Mount file systems and swap persistently and safely by UUID.", subtopics: ["Mount and unmount manually", "Add UUID entries to /etc/fstab", "Test fstab with mount -a", "Create and enable swap", "Find what keeps a mount busy"], links: [L("mount(8)", "https://man7.org/linux/man-pages/man8/mount.8.html")] },
        { key: "lvm", title: "LVM: physical volumes, volume groups & logical volumes", hours: 5, goal: "Build, extend and resize logical volumes online without downtime.", subtopics: ["Create PVs, a VG and LVs", "Extend a VG with a new disk", "Grow an LV and its file system", "Set physical extent size", "Inspect with pvs, vgs and lvs"] },
        { key: "nfs-autofs", title: "NFS clients & autofs", hours: 2.5, goal: "Mount NFS exports manually, persistently and on demand with autofs.", subtopics: ["Discover exports with showmount", "Mount an NFS share manually", "Persist NFS mounts in fstab", "Configure autofs direct and indirect maps"] },
      ],
    },
    {
      key: "adm-networking",
      title: "Networking",
      summary: "Addresses, routes, names and firewalls.",
      links: [L("ip(8)", "https://man7.org/linux/man-pages/man8/ip.8.html"), L("Ubuntu Server docs", "https://ubuntu.com/server/docs")],
      topics: [
        { key: "ip-basics", title: "IP addressing, routes & sockets", hours: 3, goal: "Read interfaces, addresses, routes and listening ports and test connectivity.", subtopics: ["Explain IPv4, CIDR and IPv6 basics", "Inspect addresses and routes with ip", "List listening ports with ss", "Test with ping, tracepath and curl"] },
        { key: "nmcli", title: "NetworkManager & nmcli", hours: 3, goal: "Configure static and DHCP connections persistently with nmcli.", subtopics: ["List devices and connections", "Create a static IPv4 connection", "Modify DNS and gateway settings", "Bring connections up and down", "Know netplan on Ubuntu"] },
        { key: "dns-time", title: "Hostnames, DNS resolution & time sync", hours: 2.5, goal: "Set the hostname, debug name resolution and keep time in sync with chrony.", subtopics: ["Set hostname with hostnamectl", "Trace resolution via /etc/hosts and DNS", "Query DNS with dig and getent", "Configure chrony NTP servers", "Check sync with chronyc sources"] },
        { key: "firewalls", title: "firewalld & ufw", hours: 3, goal: "Open only the required services and ports and make the rules permanent.", subtopics: ["Explain zones in firewalld", "Allow services and ports permanently", "Reload and verify active rules", "Manage rules with ufw on Ubuntu"], links: [L("firewall-cmd(1)", "https://man7.org/linux/man-pages/man1/firewall-cmd.1.html")] },
      ],
    },
    {
      key: "adm-security",
      title: "SSH & mandatory access control",
      summary: "Secure remote access, then confine services with SELinux or AppArmor.",
      links: [L("sshd_config(5)", "https://man7.org/linux/man-pages/man5/sshd_config.5.html"), L("RHEL 9 documentation", "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9")],
      topics: [
        { key: "ssh-keys", title: "SSH & key-based authentication", hours: 2.5, goal: "Log in with SSH keys, copy files securely and use an SSH config file.", subtopics: ["Generate an ed25519 key pair", "Install keys with ssh-copy-id", "Copy files with scp and rsync", "Write ~/.ssh/config host entries"], links: [L("ssh-keygen(1)", "https://man7.org/linux/man-pages/man1/ssh-keygen.1.html")] },
        { key: "ssh-hardening", title: "Hardening sshd", hours: 2, goal: "Disable root and password logins and restrict who can connect.", subtopics: ["Disable root and password logins", "Restrict users with AllowGroups", "Validate config with sshd -t", "Rate-limit attacks with fail2ban"] },
        { key: "selinux", title: "SELinux basics", hours: 5, goal: "Diagnose and fix SELinux denials with contexts, booleans and port labels.", subtopics: ["Switch enforcing and permissive modes", "Read contexts with ls -Z and ps -Z", "Restore contexts with restorecon", "Set persistent rules with semanage fcontext", "Toggle booleans with setsebool -P", "Read denials with ausearch"] },
        { key: "apparmor", title: "AppArmor basics on Ubuntu", hours: 1.5, goal: "Check AppArmor profile status and switch a profile between modes.", subtopics: ["List profiles with aa-status", "Compare enforce and complain modes", "Find denials in the journal"] },
      ],
    },
    {
      key: "adm-automation",
      title: "Scheduling & shell scripting",
      summary: "Make the machine do routine work for you.",
      links: [L("crontab(5)", "https://man7.org/linux/man-pages/man5/crontab.5.html"), L("systemd.timer(5)", "https://man7.org/linux/man-pages/man5/systemd.timer.5.html")],
      topics: [
        { key: "cron-at", title: "cron & at", hours: 2, goal: "Schedule recurring and one-off jobs with crontab and at.", subtopics: ["Read the five crontab time fields", "Edit user crontabs with crontab -e", "Use /etc/cron.d for system jobs", "Schedule one-off jobs with at"] },
        { key: "systemd-timers", title: "systemd timers", hours: 2, goal: "Replace a cron job with a systemd timer and service pair.", subtopics: ["Write a oneshot service", "Write a timer with OnCalendar", "Test expressions with systemd-analyze calendar", "List timers with systemctl list-timers"] },
        { key: "bash-scripting", title: "Bash scripting fundamentals", hours: 5, goal: "Write robust bash scripts with arguments, conditionals, loops and functions.", subtopics: ["Start with shebang and set -euo pipefail", "Handle arguments and exit codes", "Use if, test and case", "Loop over files and command output", "Write functions with local variables"] },
        { key: "admin-scripts", title: "Scripts for real admin tasks", hours: 3.5, goal: "Automate user creation, disk checks and reports with safe, idempotent scripts.", subtopics: ["Bulk-create users from a CSV", "Alert on low disk space", "Log script output to the journal", "Make scripts idempotent and re-runnable", "Lint scripts with shellcheck"] },
      ],
    },
    {
      key: "adm-operations",
      title: "Monitoring, backups & containers",
      summary: "Keep systems healthy, recoverable and running modern workloads.",
      links: [L("Podman documentation", "https://podman.io/docs"), L("tar(1)", "https://man7.org/linux/man-pages/man1/tar.1.html")],
      topics: [
        { key: "performance-monitoring", title: "Performance: top, vmstat, iostat & free", hours: 3, goal: "Tell whether a slow server is short of CPU, memory or disk I/O.", subtopics: ["Read load average and CPU states", "Check memory and swap with free", "Spot I/O wait with vmstat and iostat", "Find top consumers with ps --sort", "Apply profiles with tuned-adm"] },
        { key: "troubleshooting-method", title: "A troubleshooting method", hours: 3, goal: "Work from symptom to root cause with a repeatable checklist.", subtopics: ["Define the symptom and recent changes", "Check services, logs and resources", "Test network, DNS and ports", "Fix full disks and inode exhaustion", "Write down the root cause"] },
        { key: "backups-archives", title: "Backups & archiving with tar and rsync", hours: 3, goal: "Create compressed archives and incremental rsync backups and prove they restore.", subtopics: ["Create and extract tar.gz and tar.xz", "Sync directories with rsync", "Back up to a remote host over SSH", "Apply the 3-2-1 backup rule", "Test restores regularly"], links: [L("rsync(1)", "https://man7.org/linux/man-pages/man1/rsync.1.html")] },
        { key: "podman-containers", title: "Containers with Podman", hours: 4, goal: "Find, run and manage rootless containers with persistent storage and published ports.", subtopics: ["Search and pull images from registries", "Run containers with ports and env vars", "Mount persistent storage with :Z", "Inspect logs and exec into containers", "Build an image from a Containerfile"] },
        { key: "podman-systemd", title: "Running containers as systemd services", hours: 2, goal: "Start a rootless container automatically at boot with a Quadlet unit.", subtopics: ["Write a Quadlet .container file", "Enable lingering with loginctl", "Manage it with systemctl --user", "Verify it survives a reboot"] },
      ],
    },
    {
      key: "adm-capstone",
      title: "Capstone & timed practice",
      summary: "Build a server end to end, then practise under exam conditions.",
      links: [L("RHCSA exam objectives", "https://www.redhat.com/en/services/certification/rhcsa"), L("roadmap.sh Linux", "https://roadmap.sh/linux")],
      topics: [
        { key: "provision-server", title: "Provision a server end to end", hours: 5, goal: "Turn a fresh VM into a working web or file server with storage, users and services.", subtopics: ["Set hostname, network and time", "Create users, groups and sudo rules", "Build LVM storage mounted at /srv", "Install and enable a web server", "Schedule a nightly backup timer"] },
        { key: "harden-server", title: "Harden and verify the server", hours: 4, goal: "Lock the server down and verify each control from a second machine.", subtopics: ["Enforce key-only SSH logins", "Open only needed firewall services", "Keep SELinux enforcing with correct labels", "Enable automatic security updates", "Audit with ss, find and logs"] },
        { key: "timed-practice", title: "Timed RHCSA-style practice tasks", hours: 8, goal: "Complete a full set of exam-style tasks in under three hours with everything surviving a reboot.", subtopics: ["Reset root and fix networking first", "Drill storage, users and permissions tasks", "Drill SELinux, firewall and container tasks", "Reboot and verify every task persists", "Repeat until under three hours"] },
      ],
    },
  ],
};

export default path;
