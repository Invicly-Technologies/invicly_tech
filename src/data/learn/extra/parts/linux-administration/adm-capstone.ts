import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-capstone/provision-server": {
    plain: [
      "Provisioning means taking a brand new, empty machine and turning it into a server that does a real job. In this project, that job is a small web server: it has a name, a fixed address, admin accounts, its own storage for the website, and a nightly backup.",
      "The order matters. If you break the network halfway through, you lose your remote connection and have to start over at the console. So you set up identity and network first, then people and access, then storage, software and services, and scheduling last.",
      "Every step must survive a reboot. A setting that only lives in memory is a trap: it works today and disappears after the next kernel update. So each time you change something, use the command or file that makes it permanent.",
      "Write every command into a notes file as you go. At the end, those notes are almost a script. Next time you can rebuild the same server in minutes instead of hours.",
    ],
    deepDive: [
      {
        heading: "Identity, time and name resolution",
        body: "Set the full hostname with hostnamectl set-hostname web01.lab.example.com; it is stored in /etc/hostname. Add the server's own name and IP to /etc/hosts so local tools can resolve it even when DNS is down.\n\nCorrect time matters more than it seems: logs from several servers must line up, TLS certificates are checked against the clock, and Kerberos fails with more than five minutes of skew. On RHEL, chronyd keeps the clock in sync. Put your time source in /etc/chrony.conf with a line like server ntp.lab.example.com iburst or pool 2.rhel.pool.ntp.org iburst, restart chronyd, then check with chronyc sources -v. timedatectl set-timezone Europe/Berlin sets the zone, and timedatectl shows whether the clock is synchronized.",
        bullets: [
          "hostnamectl shows static hostname and OS details",
          "chronyc sources: a * marks the source in use",
          "timedatectl list-timezones | grep -i berlin",
        ],
      },
      {
        heading: "Networking with NetworkManager",
        body: "On RHEL 9, connection profiles are stored as files in /etc/NetworkManager/system-connections/ and managed with nmcli. nmcli con show lists profiles and the devices they use; the profile name is often not the same as the device name. A static setup needs four settings: ipv4.method manual, ipv4.addresses with a prefix such as 192.168.1.50/24, ipv4.gateway and ipv4.dns.\n\nChanges made with nmcli con mod are saved at once but applied only when the connection is brought up again with nmcli con up NAME. Do this from the console, or as one command line, because the address may change under your SSH session. Make sure connection.autoconnect is yes so the profile comes up at boot. Verify with ip -br addr, ip route and getent hosts.",
        visual: {
          type: "flow",
          title: "Static IP with nmcli",
          steps: [
            { label: "nmcli con show", detail: "Find the profile for the device" },
            { label: "nmcli con mod", detail: "method, addresses, gateway, dns" },
            { label: "nmcli con up", detail: "Applies the saved profile" },
            { label: "Verify", detail: "ip -br addr, ip route, ping gateway" },
            { label: "Check boot", detail: "connection.autoconnect yes" },
          ],
        },
      },
      {
        heading: "Accounts and sudo for a team",
        body: "Create a group for admins, put people in it, and give the group sudo rights in its own file. A file such as /etc/sudoers.d/admins containing %admins ALL=(ALL) ALL is clearer than adding everyone to wheel, and it is easy to remove later. Always check it with visudo -cf /etc/sudoers.d/admins; a syntax error in any sudoers file can break sudo for everyone.\n\nInstall each admin's SSH public key now, so you can turn off password logins during hardening. Create a separate system account for services, such as a backup user with no shell, so automated jobs do not run as a person or as root.",
        bullets: [
          "groupadd admins; usermod -aG admins ana",
          "useradd --system --shell /sbin/nologin backup",
          "sudo -l -U ana shows what ana may run",
        ],
      },
      {
        heading: "Storage that can grow",
        body: "Putting /srv on LVM (Logical Volume Manager) means you can add disk space later without moving data. The chain is: physical volume (pvcreate on the disk), volume group (vgcreate pools one or more PVs), logical volume (lvcreate carves out a piece), filesystem (mkfs.xfs), and mount point.\n\nIn /etc/fstab, refer to the filesystem by UUID (from blkid) or by its /dev/vgname/lvname path; never by /dev/sdb names, which can change between boots. Test with mount -a and findmnt --verify before rebooting, because a bad fstab line can drop the server into emergency mode. Later, lvextend -r -L +5G /dev/vgsrv/lvweb grows both the volume and the filesystem in one step. XFS can grow but cannot shrink.",
        visual: {
          type: "layers",
          title: "The LVM stack under /srv/web",
          layers: [
            { label: "/srv/web", detail: "Mount point in /etc/fstab" },
            { label: "XFS filesystem", detail: "mkfs.xfs; grows with xfs_growfs or lvextend -r" },
            { label: "Logical volume lvweb", detail: "lvcreate -n lvweb -L 2G vgsrv" },
            { label: "Volume group vgsrv", detail: "Pool of space from one or more disks" },
            { label: "Physical volume /dev/vdb", detail: "pvcreate marks the disk for LVM" },
          ],
        },
      },
      {
        heading: "Software, services and the backup job",
        body: "Install packages with dnf, then enable services with systemctl enable --now so they start now and at every boot. For a web root in /srv/web, three things must agree: Apache's config points to it, the firewall allows the http service permanently, and SELinux labels the folder httpd_sys_content_t through semanage fcontext and restorecon.\n\nFinish with the nightly backup as a timer and service pair: a oneshot service running a tar or rsync script as the backup user, and a timer with OnCalendar=*-*-* 01:30 and Persistent=true. Then reboot and check everything from a second machine: the name resolves, the page loads, SSH works with keys, the mount is there, and systemctl list-timers shows the next backup.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What must survive a reboot",
        root: "web01 after reboot",
        children: [
          { label: "Identity", children: ["/etc/hostname", "chronyd enabled"] },
          { label: "Network", children: ["NetworkManager profile", "autoconnect yes"] },
          { label: "Storage", children: ["fstab entry by UUID or LV path"] },
          { label: "Services", children: ["httpd enabled", "firewall --permanent rules", "SELinux fcontext rule"] },
          { label: "Scheduling", children: ["backup.timer enabled", "Persistent=true"] },
        ],
      },
    ],
    examples: [
      {
        title: "Time, admins and sudo in one pass",
        explanation: "After the network works, set the time zone and time source, then create the admin team. Step 1: set the zone and point chrony at the lab time server. Step 2: confirm synchronisation. Step 3: create the admins group, add ana and give the group sudo rights in a drop-in. Step 4: check the drop-in syntax before you log out, and confirm ana's rights.",
        code: {
          lang: "bash",
          code: "sudo timedatectl set-timezone Europe/Berlin\necho 'server ntp.lab.example.com iburst' | sudo tee -a /etc/chrony.conf\nsudo systemctl enable --now chronyd && sudo systemctl restart chronyd\nchronyc sources -v; timedatectl | grep synchronized\nsudo groupadd -f admins && sudo usermod -aG admins ana\necho '%admins ALL=(ALL) ALL' | sudo tee /etc/sudoers.d/admins\nsudo chmod 440 /etc/sudoers.d/admins\nsudo visudo -cf /etc/sudoers.d/admins\nsudo -l -U ana",
        },
      },
      {
        title: "Point Apache at the LVM volume and add the backup",
        explanation: "The volume is mounted at /srv/web. Step 1: add a small Apache config that uses it as the document root. Step 2: test the config and restart. Step 3: create the backup service and timer. Step 4: reboot and verify from another machine with curl and from the server with list-timers and findmnt.",
        code: {
          lang: "bash",
          code: "sudo tee /etc/httpd/conf.d/site.conf <<'EOF'\nDocumentRoot \"/srv/web\"\n<Directory \"/srv/web\">\n    Require all granted\n</Directory>\nEOF\necho '<h1>web01</h1>' | sudo tee /srv/web/index.html && sudo restorecon -Rv /srv/web\nsudo apachectl configtest && sudo systemctl restart httpd\nprintf '[Service]\\nType=oneshot\\nExecStart=/usr/bin/tar czf /backup/web.tgz /srv/web\\n' | sudo tee /etc/systemd/system/webbackup.service\nprintf '[Timer]\\nOnCalendar=*-*-* 01:30\\nPersistent=true\\n[Install]\\nWantedBy=timers.target\\n' | sudo tee /etc/systemd/system/webbackup.timer\nsudo mkdir -p /backup && sudo systemctl daemon-reload && sudo systemctl enable --now webbackup.timer\nsudo systemctl reboot\n# from another machine: curl http://web01/   then on web01: findmnt /srv/web; systemctl list-timers webbackup.timer",
        },
      },
    ],
    cheatSheet: [
      "Order: identity and network, accounts and keys, storage, software, services, scheduling",
      "hostnamectl set-hostname FQDN; add the name and IP to /etc/hosts",
      "chronyc sources -v and timedatectl confirm the clock is synchronized",
      "nmcli con mod saves; nmcli con up applies",
      "Sudo for a group: %admins ALL=(ALL) ALL in /etc/sudoers.d/admins, check with visudo -cf",
      "Mount by UUID or LV path; test fstab with mount -a and findmnt --verify",
      "Web root needs three things: Apache config, firewall --permanent, SELinux label",
      "Reboot at the end and verify from a second machine",
    ],
    quiz: [
      {
        q: "You changed the IP with nmcli con mod, but ip addr still shows the old address. Why?",
        options: ["nmcli needs a reboot to save changes", "The change is saved but not applied until nmcli con up", "NetworkManager is disabled", "You must edit /etc/sysconfig/network instead"],
        answer: 1,
        why: "con mod writes the profile; con up reactivates it with the new settings.",
      },
      {
        q: "Why refer to the filesystem by UUID or LV path in /etc/fstab instead of /dev/sdb1?",
        options: ["UUIDs mount faster", "/dev/sdb1 cannot hold XFS", "fstab does not accept /dev paths", "Kernel device names can change between boots"],
        answer: 3,
        why: "Disk names depend on detection order; UUIDs and LV paths stay the same.",
      },
      {
        q: "Which command checks a new sudoers drop-in for syntax errors?",
        options: ["visudo -cf /etc/sudoers.d/admins", "sudo -t admins", "cat /etc/sudoers.d/admins", "sudoedit --check admins"],
        answer: 0,
        why: "visudo -c checks syntax and -f names the file to check.",
      },
      {
        q: "The page under /srv/web returns 403 although Apache's config and the modes are correct. What is most likely missing?",
        options: ["A firewall rule", "A DNS entry", "The SELinux label httpd_sys_content_t on /srv/web", "The chronyd service"],
        answer: 2,
        why: "A 403 with correct modes on RHEL usually means a wrong SELinux file type.",
      },
      {
        q: "Which LVM command grows a logical volume and its filesystem in one step?",
        options: ["vgextend -r", "lvextend -r -L +5G /dev/vgsrv/lvweb", "pvresize --fs", "xfs_growfs -L +5G"],
        answer: 1,
        why: "-r tells lvextend to resize the filesystem after growing the volume.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Set the hostname to web01.lab.example.com and the time zone to UTC, and show proof of both.",
        hint: "hostnamectl and timedatectl do both and print their state.",
        solution: "sudo hostnamectl set-hostname web01.lab.example.com\nsudo timedatectl set-timezone UTC\nhostnamectl | head -3\ntimedatectl | grep -E 'Time zone|synchronized'",
      },
      {
        level: "medium",
        task: "Create a 1 GiB logical volume lvdata in a new volume group vgdata on /dev/vdc, format it as XFS and mount it at /data permanently.",
        hint: "Use the LV path in fstab, then test with mount -a before rebooting.",
        solution: "sudo pvcreate /dev/vdc\nsudo vgcreate vgdata /dev/vdc\nsudo lvcreate -n lvdata -L 1G vgdata\nsudo mkfs.xfs /dev/vgdata/lvdata\nsudo mkdir -p /data\necho '/dev/vgdata/lvdata /data xfs defaults 0 0' | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload && sudo mount -a\nfindmnt --verify && df -h /data",
      },
      {
        level: "hard",
        task: "Turn your provisioning notes into one script that can run twice without errors, covering hostname, the admins group with sudo, and enabling httpd.",
        hint: "Use commands that are already idempotent, and add checks before the ones that are not.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nhostnamectl set-hostname web01.lab.example.com\ngroupadd -f admins\nid ana &>/dev/null || useradd -m -G admins ana\necho '%admins ALL=(ALL) ALL' > /etc/sudoers.d/admins\nchmod 440 /etc/sudoers.d/admins && visudo -cf /etc/sudoers.d/admins\ndnf install -y httpd\nsystemctl enable --now httpd\nfirewall-cmd --permanent --add-service=http && firewall-cmd --reload",
      },
    ],
    faq: [
      { q: "Why configure networking before anything else?", a: "Everything else is easier over SSH, and a network mistake later could cut you off halfway. Getting it right first, from the console, removes that risk." },
      { q: "Do I need LVM for a small server?", a: "Not strictly, but it lets you grow /srv later by adding a disk, without downtime or moving data. On the RHCSA, LVM tasks are expected." },
      { q: "What is the difference between chrony and timedatectl?", a: "chronyd is the service that actually syncs the clock with time servers. timedatectl shows and changes time settings, such as the time zone, and whether sync is turned on." },
      { q: "How do I know my server will come back after a reboot?", a: "Reboot it and check. Before that, mount -a, findmnt --verify, systemctl is-enabled for each service and firewall-cmd --list-all --permanent catch most problems." },
    ],
  },

  "adm-capstone/harden-server": {
    plain: [
      "Your server works. Now you make it hard to attack. Hardening has two goals: give attackers as few doors as possible, and limit what they can do if they get through one.",
      "No single setting does it all, so you stack several: a firewall that only lets in web and SSH traffic, SSH that accepts keys only, sudo rights that are as small as possible, SELinux to fence in each service, and automatic security updates.",
      "The most important part is checking, not assuming. A rule you think is active may never have been saved. So for every control, you try to break it from a second machine: attempt a password login, scan the ports, ask for a page that should be blocked.",
      "Hardening is not done once. New software, new users and new holes appear all the time, so you repeat the audit regularly and fix what drifted.",
    ],
    deepDive: [
      {
        heading: "Firewall: allow only what is needed",
        body: "firewalld groups rules into zones. Each network interface belongs to one zone, usually public. firewall-cmd --list-all shows what that zone allows. On a fresh RHEL install, public allows ssh, dhcpv6-client and cockpit. A web server needs only ssh, http and https, so remove the others with --remove-service.\n\nRemember the two-layer rule: changes without --permanent are lost at the next reload or reboot, and --permanent changes are not active until firewall-cmd --reload. To allow SSH only from an admin network, use a rich rule that accepts ssh from that source and remove the general ssh service, or put the admin network in its own zone with firewall-cmd --zone=trusted --add-source.",
        bullets: [
          "firewall-cmd --get-active-zones shows which interface is in which zone",
          "firewall-cmd --permanent --remove-service=cockpit",
          "firewall-cmd --list-all --permanent shows what will survive a reload",
        ],
        visual: {
          type: "flow",
          title: "A packet reaching web01",
          steps: [
            { label: "Arrives on ens160", detail: "Interface is in zone public" },
            { label: "Zone rules checked", detail: "Services, ports and rich rules" },
            { label: "Allowed: http, https", detail: "Passed to Apache" },
            { label: "ssh from 10.0.0.0/24", detail: "Accepted by a rich rule" },
            { label: "Anything else", detail: "Rejected by default" },
          ],
        },
      },
      {
        heading: "Shrink the attack surface",
        body: "Every listening program is a door. sudo ss -tulpn lists all TCP and UDP sockets with the program behind each. For each one, ask: is it needed, and does it need to listen on all addresses? A database used only locally should listen on 127.0.0.1. Services you do not need, such as cups or avahi-daemon on a server, should be disabled with systemctl disable --now and ideally removed.\n\nAlso check accounts. awk -F: '$3 == 0' /etc/passwd should print only root. Look for accounts with real shells that nobody uses, and lock them. Review /etc/sudoers and every file in /etc/sudoers.d: broad rules like ALL=(ALL) NOPASSWD: ALL for a service account are a common way attackers become root.",
      },
      {
        heading: "Automatic security updates",
        body: "Most real break-ins use known holes that already had a fix. Automatic updates close that gap. On RHEL, install dnf-automatic and edit /etc/dnf/automatic.conf: upgrade_type = security limits it to security fixes, and apply_updates = yes installs them instead of only downloading. Then enable dnf-automatic.timer. The dnf-automatic-install.timer variant always applies updates regardless of that setting.\n\nOn Ubuntu, the unattended-upgrades package does the same, configured in /etc/apt/apt.conf.d/50unattended-upgrades, and unattended-upgrade --dry-run --debug shows what it would do. Kernel and core library updates need a reboot to take effect; on RHEL, needs-restarting -r from dnf-utils tells you whether one is due. Plan regular reboot windows.",
        bullets: [
          "systemctl list-timers dnf-automatic*",
          "dnf updateinfo list --security shows pending security fixes",
          "needs-restarting -r: exit code 1 means reboot needed",
        ],
      },
      {
        heading: "Audit with a repeatable checklist",
        body: "Run the same checks every time, ideally from a script, and compare with the last result. Listening ports: ss -tulpn. Setuid and setgid programs, which run with their owner's power: find / -xdev \\( -perm -4000 -o -perm -2000 \\) -type f. World-writable files outside temp folders: find / -xdev -type f -perm -0002. Failed logins: journalctl -u sshd | grep 'Failed', and lastb if it is enabled. SELinux: getenforce must say Enforcing, and ausearch -m AVC shows recent denials.\n\nA new setuid file, a new listening port or a new UID 0 account that you did not create is a red flag. Save each audit output with the date, so the diff between two runs tells you what changed.",
      },
      {
        heading: "Verify from the outside",
        body: "Checks on the server tell you what should happen; tests from another machine prove it. From a second host, scan the ports with nmap -Pn -p- web01; only 22, 80 and 443 should show as open. Try a password login with ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password ana@web01; it must say Permission denied (publickey). Try ssh root@web01; it must fail even with a valid key.\n\nTest from an address outside the admin network too, if SSH is restricted. Finally, keep evidence: save the scan and test output with the date. That is your proof for an auditor, and your baseline for the next review.",
        visual: {
          type: "compare",
          title: "Expected results from a second machine",
          columns: [
            { title: "Should succeed", points: ["Key login as ana", "curl http://web01/", "sudo for members of admins", "nmap shows 22, 80, 443 open"] },
            { title: "Should fail", points: ["Password login", "ssh root@web01", "Port 3306 from outside", "SSH from a non-admin network"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Hardening is a loop, not a one-off",
        steps: [
          { label: "Baseline", detail: "Firewall, SSH, sudo, SELinux, updates" },
          { label: "Verify from outside", detail: "Try to break each control" },
          { label: "Audit regularly", detail: "Ports, setuid files, accounts, logs" },
          { label: "Fix drift", detail: "New services, users or rules" },
        ],
      },
    ],
    examples: [
      {
        title: "Restrict SSH to the admin network",
        explanation: "The web server should accept web traffic from anyone but SSH only from 10.0.0.0/24. Step 1: add a permanent rich rule accepting ssh from that network. Step 2: remove the general ssh service and the unneeded defaults. Step 3: reload and review the permanent config. Do this from a session that comes from 10.0.0.0/24, or from the console, so you do not cut yourself off. Step 4: test from an admin host and an outside host.",
        code: {
          lang: "bash",
          code: "sudo firewall-cmd --permanent --add-rich-rule='rule family=\"ipv4\" source address=\"10.0.0.0/24\" service name=\"ssh\" accept'\nsudo firewall-cmd --permanent --remove-service=ssh\nsudo firewall-cmd --permanent --remove-service=cockpit --remove-service=dhcpv6-client\nsudo firewall-cmd --permanent --add-service=http --add-service=https\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-all\n# from 10.0.0.5: ssh ana@web01 works; from elsewhere: connection rejected",
        },
      },
      {
        title: "A dated audit you can compare",
        explanation: "Step 1: write a short audit script that collects ports, setuid files, UID 0 accounts, sudo rules and the SELinux mode into one dated file. Step 2: run it today and keep the file. Step 3: next month, run it again and diff the two files. Anything new in the diff, such as a new setuid binary or port, needs an explanation.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\nout=/root/audit/$(date +%F).txt; mkdir -p /root/audit\n{\n  echo '## ports';   ss -tulpn | awk 'NR>1 {print $1, $5, $7}' | sort\n  echo '## setuid';  find / -xdev -perm -4000 -type f 2>/dev/null | sort\n  echo '## uid0';    awk -F: '$3 == 0 {print $1}' /etc/passwd\n  echo '## sudo';    grep -rhv '^#' /etc/sudoers /etc/sudoers.d | grep -v '^$'\n  echo '## selinux'; getenforce\n} > \"$out\"\nls -1 /root/audit | tail -2 | sed 's|^|/root/audit/|' | xargs diff || true",
        },
      },
    ],
    cheatSheet: [
      "firewall-cmd --list-all and --list-all --permanent: compare runtime and saved rules",
      "--permanent changes need firewall-cmd --reload to take effect",
      "ss -tulpn lists every listening socket and its program",
      "find / -xdev -perm -4000 -type f lists setuid programs",
      "awk -F: '$3 == 0' /etc/passwd should print only root",
      "dnf-automatic: upgrade_type = security, apply_updates = yes, enable dnf-automatic.timer",
      "needs-restarting -r tells you if a reboot is due after updates",
      "Test from outside: nmap -Pn -p- host and a forced password SSH login",
    ],
    quiz: [
      {
        q: "You ran firewall-cmd --permanent --add-service=https, but port 443 is still closed. Why?",
        options: ["https needs a rich rule", "The zone is wrong", "SELinux blocks it", "Permanent changes are not active until firewall-cmd --reload"],
        answer: 3,
        why: "--permanent writes the saved config; reload applies it to the running firewall.",
      },
      {
        q: "Which audit result is a red flag?",
        options: ["A second account with UID 0", "sshd listening on port 22", "getenforce prints Enforcing", "/usr/bin/passwd has the setuid bit"],
        answer: 0,
        why: "Any account with UID 0 has full root power; only root should have it.",
      },
      {
        q: "In /etc/dnf/automatic.conf, what does apply_updates = yes change?",
        options: ["It reboots after each update", "It installs updates instead of only downloading them", "It limits updates to security fixes", "It enables the timer"],
        answer: 1,
        why: "Without it dnf-automatic only downloads; upgrade_type controls which updates.",
      },
      {
        q: "How do you best prove that password SSH logins are disabled?",
        options: ["Read sshd_config", "Check that sshd is running", "From another machine, force a password login and see it refused", "Run ss -tulpn"],
        answer: 2,
        why: "Testing the real behaviour from outside proves the effective configuration.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every listening port with its program and decide which ones your web server does not need.",
        hint: "ss with -t -u -l -p -n shows sockets, listening, process and numbers.",
        solution: "sudo ss -tulpn\n# keep: sshd :22, httpd :80 and :443\n# e.g. disable extras:\nsudo systemctl disable --now cups avahi-daemon 2>/dev/null || true\nsudo ss -tulpn",
      },
      {
        level: "medium",
        task: "Set up automatic security-only updates on RHEL and confirm when they will next run.",
        hint: "Edit two keys in /etc/dnf/automatic.conf, then enable the timer.",
        solution: "sudo dnf install -y dnf-automatic\nsudo sed -i 's/^upgrade_type.*/upgrade_type = security/; s/^apply_updates.*/apply_updates = yes/' /etc/dnf/automatic.conf\ngrep -E '^(upgrade_type|apply_updates)' /etc/dnf/automatic.conf\nsudo systemctl enable --now dnf-automatic.timer\nsystemctl list-timers dnf-automatic.timer",
      },
      {
        level: "hard",
        task: "From a second machine, produce evidence that only ports 22, 80 and 443 are open, that root and password logins fail, and save it to a dated file.",
        hint: "nmap for ports; ssh with BatchMode and forced options for logins.",
        solution: "f=web01-check-$(date +%F).txt\n{\n  nmap -Pn -p- web01 | grep open\n  ssh -o BatchMode=yes root@web01 true 2>&1 | tail -1\n  ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password \\\n      -o NumberOfPasswordPrompts=0 ana@web01 true 2>&1 | tail -1\n} | tee \"$f\"\n# expect only 22, 80, 443 open and two Permission denied lines",
      },
    ],
    faq: [
      { q: "What is the most important hardening step?", a: "Keeping the system updated and allowing only key-based SSH. Most attacks use known, already-fixed holes or weak passwords." },
      { q: "Is a firewall needed if only a few services listen?", a: "Yes. It is a second layer: if someone later starts a service by mistake, the firewall still blocks it from the network." },
      { q: "Should automatic updates also reboot the server?", a: "Many teams let updates install automatically but reboot in a planned window. needs-restarting -r on RHEL tells you when a reboot is needed." },
      { q: "How often should I audit a server?", a: "Run a short automated audit at least weekly and review it, and do a full review after major changes. Comparing results over time shows drift quickly." },
    ],
  },

  "adm-capstone/timed-practice": {
    plain: [
      "The RHCSA exam is not a quiz. You sit at real Linux machines with a list of tasks, such as create these users, build this storage, run this container at boot. Afterwards a script checks the machines. There are no multiple-choice questions.",
      "The machines are checked after a reboot. So a task that works now but is gone after a restart counts as failed. That is the single biggest reason people fail, and the reason every practice session must end with a reboot.",
      "Speed comes from practice. The first time, building LVM storage might take you 20 minutes with the man pages open. After ten drills it takes three. Timed practice turns slow, careful steps into habits.",
      "Good practice also trains your order of work: read everything, fix anything that blocks other tasks first, then do the quick wins, and never sink half an hour into one stubborn task.",
    ],
    deepDive: [
      {
        heading: "Plan the first ten minutes",
        body: "Read the whole task list before typing anything. Mark tasks that others depend on: you cannot install packages before the repository is set up, and you cannot do anything remotely if networking or the root password is broken. Those go first. Then mark quick wins, such as a cron job or a user, and do them early to bank points.\n\nKeep a short checklist on paper or in a file with each task number and its status. If a task is not working after about ten minutes, write down where you got stuck and move on. Coming back later with fresh eyes is often faster, and an unfinished task costs less than three tasks you never reached.",
        bullets: [
          "Blockers first: root access, network, repositories",
          "Then quick wins, then long tasks like storage",
          "Leave 15 to 20 minutes for the final reboot and checks",
        ],
      },
      {
        heading: "Resetting the root password",
        body: "A classic first task is getting into a machine whose root password you do not know. On RHEL 9: reboot, and at the GRUB menu press e on the default entry. At the end of the line starting with linux, add rd.break and press Ctrl+X. You land in a shell inside the initramfs, before the real system starts.\n\nThe real root filesystem is mounted read-only at /sysroot. Run mount -o remount,rw /sysroot, then chroot /sysroot, then passwd root. Because the password file was changed outside SELinux, its label is now wrong; touch /.autorelabel so the next boot fixes labels. Exit twice to continue booting. The relabel takes a few minutes and reboots once more. Forgetting the autorelabel step is a common reason login still fails.",
        visual: {
          type: "flow",
          title: "Root password reset on RHEL 9",
          steps: [
            { label: "GRUB: press e", detail: "Edit the default entry" },
            { label: "Add rd.break", detail: "End of the linux line, then Ctrl+X" },
            { label: "Remount /sysroot rw", detail: "mount -o remount,rw /sysroot" },
            { label: "chroot /sysroot; passwd root", detail: "Set the new password" },
            { label: "touch /.autorelabel", detail: "Fix SELinux labels at next boot" },
            { label: "exit, exit", detail: "Boot continues and relabels" },
          ],
        },
      },
      {
        heading: "A persistence checklist",
        body: "For each kind of task there is a runtime command and a persistent one. Services: systemctl enable, not just start. Firewall: --permanent plus --reload. SELinux: setsebool -P, semanage fcontext plus restorecon, semanage port. Mounts and swap: a line in /etc/fstab, tested with mount -a and swapon -a. Kernel settings: a file in /etc/sysctl.d/. Network: nmcli profiles with autoconnect. Tuning: tuned-adm profile. Default target: systemctl set-default. Rootless containers: a Quadlet file plus loginctl enable-linger.\n\nBefore the final reboot, run quick checks: findmnt --verify for fstab, systemctl is-enabled for each service, firewall-cmd --list-all --permanent, and getenforce. A broken fstab line is the worst outcome, because the machine may stop in emergency mode and every task on it is lost.",
        visual: {
          type: "compare",
          title: "Temporary vs persistent",
          columns: [
            { title: "Lost at reboot", points: ["systemctl start", "firewall-cmd without --permanent", "setsebool without -P", "mount by hand, sysctl -w, setenforce"] },
            { title: "Survives reboot", points: ["systemctl enable --now", "firewall-cmd --permanent, then --reload", "setsebool -P, semanage", "fstab line, /etc/sysctl.d file, /etc/selinux/config"] },
          ],
        },
      },
      {
        heading: "Use the documentation on the machine",
        body: "There is no internet access in the exam, but the system documentation is there. man -k keyword (or apropos) finds the right man page, for example man -k lvm. Inside a man page, press / to search and look for the EXAMPLES section near the end. man 5 crontab explains the file format, while man 1 crontab explains the command.\n\nSome man pages are especially useful: semanage-fcontext(8) ends with an example rule, nmcli-examples(7) has ready network setups, systemd.time(7) explains OnCalendar, and podman-systemd.unit(5) documents Quadlet keys. /usr/share/doc holds sample configs for many packages. Practise finding answers this way, so you rely on skill instead of memory.",
        bullets: [
          "man -k fcontext; man semanage-fcontext, then /EXAMPLE",
          "man nmcli-examples for static IP recipes",
          "man podman-systemd.unit for every Quadlet key",
        ],
      },
      {
        heading: "Build your own drills and measure",
        body: "Use the official RHCSA objectives as your syllabus and write small tasks for each one, with an exact expected result, such as group devops owns /devops with mode 2770. Group them into full sets that feel like an exam. Start each set on a fresh VM snapshot, start a timer, and do not look at notes except man pages.\n\nAt the end, reboot and grade yourself with a checklist of commands, the same way a grading script would: findmnt, id, ls -ld, crontab -l -u, curl, systemctl is-enabled, podman ps. Write down the time and every miss. Redo missed task types the next day until they are automatic, and repeat full sets until you finish comfortably under three hours with every check passing after the reboot.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Task areas to drill",
        root: "RHCSA-style practice",
        children: [
          { label: "Access and boot", children: ["Root password reset", "Default target", "Network with nmcli"] },
          { label: "Software", children: ["Repository files", "dnf install and groups"] },
          { label: "Storage", children: ["Partitions and swap", "LVM create and extend", "fstab and autofs"] },
          { label: "Users and files", children: ["Users, groups, password aging", "Permissions, SGID, ACLs", "sudo rules"] },
          { label: "Security and services", children: ["firewalld", "SELinux labels, booleans, ports", "cron and timers", "Containers at boot"] },
        ],
      },
    ],
    examples: [
      {
        title: "Unblock the machine first",
        explanation: "The task list starts with: the root password is unknown, networking is wrong and there is no repository. Everything else depends on these. Step 1: reset root with rd.break. Step 2: fix the network profile with nmcli and verify. Step 3: add the two given repositories as a .repo file and check that dnf can see them. Only now move on to storage and users.",
        code: {
          lang: "bash",
          code: "# after the rd.break reset and reboot, logged in as root:\nnmcli con show\nnmcli con mod 'Wired connection 1' ipv4.method manual ipv4.addresses 172.25.250.11/24 \\\n  ipv4.gateway 172.25.250.254 ipv4.dns 172.25.250.254 connection.autoconnect yes\nnmcli con up 'Wired connection 1' && ping -c1 172.25.250.254\ncat > /etc/yum.repos.d/exam.repo <<'EOF'\n[baseos]\nname=BaseOS\nbaseurl=http://content.example.com/rhel9/BaseOS\ngpgcheck=0\n[appstream]\nname=AppStream\nbaseurl=http://content.example.com/rhel9/AppStream\ngpgcheck=0\nEOF\ndnf repolist",
        },
      },
      {
        title: "Grade yourself after the reboot",
        explanation: "You finished a practice set in 2 hours 20 minutes. Step 1: reboot. Step 2: run one check per task, exactly as a grading script would, and mark each pass or fail. Step 3: the swap task fails because the fstab line had a typo you never tested. Step 4: note it, fix it, and add swapon -a to your personal pre-reboot checklist.",
        code: {
          lang: "bash",
          code: "systemctl reboot\n# after boot:\nfindmnt /exam && lvs vgexam\nswapon --show                    # empty: FAIL\nid amy; ls -ld /devops           # drwxrws--- root devops\ncrontab -l -u amy\ncurl -s http://localhost:82/ | head -1\nsystemctl is-enabled httpd chronyd\nsudo -iu bob podman ps           # container started at boot?\ngetenforce",
        },
      },
    ],
    cheatSheet: [
      "Read every task first; do blockers (root, network, repos) before anything else",
      "Root reset: rd.break, remount /sysroot rw, chroot, passwd, touch /.autorelabel",
      "Persistent forms: enable, --permanent, -P, semanage, fstab, sysctl.d, linger",
      "Before rebooting: mount -a, swapon -a, findmnt --verify, systemctl is-enabled",
      "Stuck for 10 minutes? Note it and move on",
      "man -k keyword finds the page; search EXAMPLES with /",
      "Leave 15 to 20 minutes to reboot and verify every task",
      "Drill on fresh VM snapshots and record your time and misses",
    ],
    quiz: [
      {
        q: "After resetting the root password with rd.break, login still fails. Which step was most likely missed?",
        options: ["Running grub2-mkconfig", "Running passwd twice", "touch /.autorelabel before exiting", "Removing rd.break from GRUB"],
        answer: 2,
        why: "The new shadow file gets a wrong SELinux label unless the system relabels at boot.",
      },
      {
        q: "Which change will NOT survive a reboot?",
        options: ["setsebool httpd_can_network_connect on", "systemctl enable --now httpd", "A new line in /etc/fstab", "firewall-cmd --permanent --add-service=http plus --reload"],
        answer: 0,
        why: "Without -P the boolean change exists only until reboot.",
      },
      {
        q: "Why is a broken /etc/fstab line so dangerous in the exam?",
        options: ["It deletes the filesystem", "It disables SELinux", "It resets the root password", "The machine may boot into emergency mode, failing every task on it"],
        answer: 3,
        why: "A required mount that fails stops normal boot, so nothing can be graded.",
      },
      {
        q: "You have been stuck on one task for 12 minutes. What is the best move?",
        options: ["Keep going until it works", "Note where you are and move to the next task", "Reboot to see if it helps", "Disable SELinux to save time"],
        answer: 1,
        why: "Time on other tasks earns more points, and you can return later.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find, using only man pages on the system, the example command for adding an SELinux file context rule.",
        hint: "man -k searches page descriptions; semanage has one page per sub-command.",
        solution: "man -k fcontext\n# semanage-fcontext (8) - SELinux Policy Management file context tool\nman semanage-fcontext\n# inside the page type /EXAMPLE and press Enter\n# e.g. semanage fcontext -a -t httpd_sys_content_t \"/web(/.*)?\"",
      },
      {
        level: "medium",
        task: "On a test VM, reset the root password to redhat using rd.break and confirm the login works after the relabel.",
        hint: "Remount /sysroot read-write, chroot into it, and do not forget the relabel marker.",
        solution: "# reboot, press e at GRUB, add rd.break to the linux line, Ctrl+X\nmount -o remount,rw /sysroot\nchroot /sysroot\necho redhat | passwd --stdin root\ntouch /.autorelabel\nexit\nexit\n# wait for the relabel and reboot, then log in as root with redhat",
      },
      {
        level: "hard",
        task: "Do this 20-minute drill against a timer, then reboot and verify: swap of 512 MiB on a new LV, user amy in group devops with a password that expires every 60 days, httpd on port 82 with SELinux enforcing.",
        hint: "Each part has a persistent form: fstab for swap, chage for aging, semanage port plus firewall --permanent for the port.",
        solution: "lvcreate -n lvswap -L 512M vgexam && mkswap /dev/vgexam/lvswap\necho '/dev/vgexam/lvswap none swap defaults 0 0' >> /etc/fstab && swapon -a\ngroupadd devops; useradd -G devops amy; echo redhat | passwd --stdin amy; chage -M 60 amy\nsed -i 's/^Listen 80$/Listen 82/' /etc/httpd/conf/httpd.conf\nsemanage port -a -t http_port_t -p tcp 82\nfirewall-cmd --permanent --add-port=82/tcp && firewall-cmd --reload\nsystemctl enable --now httpd\nsystemctl reboot\n# verify: swapon --show; chage -l amy; curl -s localhost:82; getenforce",
      },
    ],
    faq: [
      { q: "How long is the RHCSA exam?", a: "The current RHEL 9 based EX200 exam is about three hours, which is why the goal here is to finish a full practice set in under three hours. Check the official exam page for the latest details before you book." },
      { q: "Can I use the internet or my notes during the exam?", a: "No. You can use the documentation installed on the machines, such as man pages and /usr/share/doc, so practise finding answers there." },
      { q: "Do I lose points if I reboot during the exam?", a: "No, rebooting is expected and wise. The risk is a machine that does not come back, so check fstab and boot settings before you reboot." },
      { q: "What is the most common reason people fail?", a: "Changes that do not survive a reboot, and running out of time on one stuck task. Persistent commands and a strict time plan fix both." },
    ],
  },
};

export default extra;
