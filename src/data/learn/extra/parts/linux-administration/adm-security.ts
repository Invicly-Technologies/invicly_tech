import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-security/ssh-keys": {
    plain: [
      "SSH (Secure Shell) lets you type commands on a server far away as if you sat in front of it. Everything that travels between your laptop and the server is encrypted, so people on the same network cannot read your commands or passwords.",
      "You can log in with a password, but keys are safer and faster. A key pair is two linked files. The private key stays on your laptop and must never be shared. The public key is like a lock you can hand out freely: you put it on every server you want to enter.",
      "When you connect, the server checks that you hold the private key that matches a public key it trusts. It does this with a math puzzle, so the private key itself never leaves your machine. Even if the server is fake, it learns nothing it can reuse.",
      "SSH also moves files. scp copies a file, and rsync copies whole folders and only sends the parts that changed. A small file called ~/.ssh/config lets you give servers short names, so ssh web01 replaces a long command full of options.",
    ],
    deepDive: [
      {
        heading: "Two kinds of keys: host keys and user keys",
        body: "SSH uses keys in both directions. First the server proves who it is with its host key, stored in /etc/ssh/ssh_host_*_key. The first time you connect, ssh shows the key fingerprint and asks if you trust it. If you say yes, it saves the key in ~/.ssh/known_hosts. Next time, a different key triggers a loud warning, because someone may be pretending to be the server.\n\nThen you prove who you are with your user key. The server looks in ~/.ssh/authorized_keys of the account you log in as. Each line there is one public key, optionally with options in front, such as from=\"10.0.0.0/8\" to accept it only from one network.",
        bullets: [
          "ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub shows a host key fingerprint",
          "ssh-keygen -R web01 removes an old entry after a server is rebuilt",
          "Compare fingerprints out of band before you type yes",
        ],
        visual: {
          type: "compare",
          title: "Host key vs user key",
          columns: [
            { title: "Host key", points: ["Proves the server is real", "Lives in /etc/ssh on the server", "Client saves it in known_hosts", "Mismatch: possible attack or rebuild"] },
            { title: "User key", points: ["Proves who you are", "Private key lives in ~/.ssh on your laptop", "Server lists it in authorized_keys", "Mismatch: falls back to the next method"] },
          ],
        },
      },
      {
        heading: "Choosing a key type and protecting it",
        body: "Use ed25519 for new keys. It is short, fast and supported by every current OpenSSH. Only use RSA (at least 3072 bits) when an old device cannot handle ed25519. ssh-keygen -t ed25519 writes ~/.ssh/id_ed25519 (private, mode 600) and id_ed25519.pub (public).\n\nAlways set a passphrase. It encrypts the private key on disk, so a stolen laptop or backup does not give away server access. To avoid typing it all day, ssh-agent keeps the unlocked key in memory: run ssh-add once per session. The -C option only adds a comment, such as your name and machine, to help you recognise the key later in authorized_keys.",
        bullets: [
          "ssh-keygen -p -f ~/.ssh/id_ed25519 changes or adds a passphrase",
          "ssh-add -l lists the keys the agent currently holds",
          "Use one key per laptop, so you can revoke one device alone",
        ],
      },
      {
        heading: "What ssh-copy-id actually does",
        body: "ssh-copy-id logs in once with a method that already works, usually a password, and appends your public key to ~/.ssh/authorized_keys on the server. It creates ~/.ssh with mode 700 and the file with mode 600 if they are missing, and it skips keys that are already there.\n\nUse -i to choose which key to send, for example ssh-copy-id -i ~/.ssh/id_ed25519.pub ana@web01. If password login is already disabled, you cannot use ssh-copy-id; an admin must add the line for you, or a cloud provider injects it at first boot. Doing it by hand is simply: append the .pub line, then fix the modes.",
      },
      {
        heading: "scp, sftp and rsync",
        body: "All three ride on SSH, so they use the same keys and config. scp copies files like cp: scp report.pdf web01:/tmp/. Since OpenSSH 9.0, scp uses the SFTP protocol underneath, which fixed old quoting surprises. sftp gives an interactive file session. rsync is the tool for folders: it compares both sides and sends only what changed, so a second run is fast.\n\nWatch the port flag: ssh and sftp use -p (small p) but scp uses -P (capital). For rsync, pass the SSH options with -e, for example rsync -av -e \"ssh -p 2222\" src/ host:dst/. A trailing slash on the source means copy the contents, not the folder itself.",
        bullets: [
          "scp -r dir web01:/srv/ copies a folder",
          "rsync -avP resumes big transfers and shows progress",
          "rsync -avn ... is a dry run that changes nothing",
        ],
      },
      {
        heading: "How ~/.ssh/config is read",
        body: "ssh reads your config from top to bottom and, for each option, keeps the first value it finds. So put specific Host blocks first and a general Host * block at the end. Host patterns can use wildcards, such as Host web-*.\n\nUseful options: HostName (the real address), User, Port, IdentityFile (which key) and IdentitiesOnly yes, which stops ssh offering every key in the agent. Too many offered keys can hit the server's MaxAuthTries limit and fail. ProxyJump bastion reaches an internal host through a jump server in one step. The file must not be writable by other users, or ssh refuses to use it.",
        visual: {
          type: "flow",
          title: "ssh web01 with a config file",
          steps: [
            { label: "Match Host web01", detail: "Take HostName, User, IdentityFile" },
            { label: "Match Host *", detail: "Fill in options not set yet" },
            { label: "Jump if needed", detail: "ProxyJump connects via the bastion first" },
            { label: "Check host key", detail: "Against known_hosts" },
            { label: "Offer the chosen key", detail: "Session opens on success" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Files that make key login work",
        root: "SSH key files",
        children: [
          { label: "Laptop ~/.ssh", children: ["id_ed25519 (600, private)", "id_ed25519.pub (public)", "known_hosts (trusted servers)", "config (host shortcuts)"] },
          { label: "Server ~/.ssh", children: ["Directory mode 700", "authorized_keys mode 600", "Home not writable by others"] },
          { label: "Server /etc/ssh", children: ["ssh_host_*_key (host keys)", "sshd_config and sshd_config.d"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reach a private server through a bastion",
        explanation: "The database host db01 (10.0.2.15) has no public IP. Only bastion.example.com is reachable from the internet. Step 1: put both hosts in ~/.ssh/config, with db01 using ProxyJump. Step 2: run ssh db01; ssh first connects to the bastion, then opens a tunnel from there to db01. Your private key never gets copied to the bastion. Step 3: scp and rsync use the same config, so file copies to db01 just work too.",
        code: {
          lang: "bash",
          code: "cat >> ~/.ssh/config <<'EOF'\nHost bastion\n  HostName bastion.example.com\n  User ana\n  IdentityFile ~/.ssh/id_ed25519\n  IdentitiesOnly yes\n\nHost db01\n  HostName 10.0.2.15\n  User ana\n  ProxyJump bastion\nEOF\nchmod 600 ~/.ssh/config\nssh db01 hostname\nrsync -av ./dumps/ db01:/var/tmp/dumps/",
        },
      },
      {
        title: "A server was rebuilt and SSH shouts a warning",
        explanation: "web01 was reinstalled, so it has new host keys. ssh now prints REMOTE HOST IDENTIFICATION HAS CHANGED and refuses to connect. Step 1: confirm with the person who rebuilt it, or the cloud console, that the new fingerprint is expected. Step 2: remove the old entry. Step 3: connect again, check the fingerprint shown matches, and accept. Never just delete all of known_hosts; that throws away protection for every other server.",
        code: {
          lang: "bash",
          code: "# on the server console: get the real fingerprint\nssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub\n# on your laptop\nssh-keygen -R web01\nssh-keygen -R 192.168.1.50\nssh web01     # compare the fingerprint, then type yes",
        },
      },
    ],
    cheatSheet: [
      "ssh-keygen -t ed25519 -C \"ana@laptop\" creates a modern key pair",
      "ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host installs one specific key",
      "ssh -p 2222 host but scp -P 2222 file host: (capital P for scp)",
      "eval \"$(ssh-agent -s)\" then ssh-add starts an agent and loads your key",
      "ssh -v host shows which keys are offered and why login fails",
      "ssh-keygen -R host removes a stale known_hosts entry",
      "In ~/.ssh/config the first value wins: specific Host blocks first, Host * last",
      "rsync -avn src/ host:dst/ is a dry run; drop n to copy for real",
    ],
    quiz: [
      {
        q: "Which file on the server decides which public keys may log in as ana?",
        options: ["/etc/ssh/sshd_config", "/home/ana/.ssh/known_hosts", "/home/ana/.ssh/authorized_keys", "/etc/ssh/ssh_host_ed25519_key"],
        answer: 2,
        why: "sshd checks the authorized_keys file in the home of the account you log in as.",
      },
      {
        q: "Your ~/.ssh/config has Host * with User root at the top and Host web01 with User ana below it. Which user does ssh web01 use?",
        options: ["root, because the first value found wins", "ana, because the more specific block wins", "Both, it tries one then the other", "Neither, ssh reports a conflict"],
        answer: 0,
        why: "ssh keeps the first value it reads for each option, so general blocks belong at the end.",
      },
      {
        q: "Why set a passphrase on a private key?",
        options: ["It makes the SSH connection faster", "It encrypts the key on disk, so a stolen copy is useless without it", "The server requires it", "It replaces the need for a public key"],
        answer: 1,
        why: "The passphrase protects the key file itself; ssh-agent saves you from typing it often.",
      },
      {
        q: "Which command copies a folder and, on the second run, sends only the files that changed?",
        options: ["scp -r", "sftp", "ssh-copy-id", "rsync -av"],
        answer: 3,
        why: "rsync compares both sides and transfers only the differences.",
      },
      {
        q: "SSH says REMOTE HOST IDENTIFICATION HAS CHANGED for a server you know was just rebuilt. What is the right fix?",
        options: ["Delete ~/.ssh/known_hosts completely", "Verify the new fingerprint, then remove the old entry with ssh-keygen -R", "Disable StrictHostKeyChecking in your config", "Generate a new user key pair"],
        answer: 1,
        why: "Removing only that host's entry after checking the fingerprint keeps protection for all other servers.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create an ed25519 key with a passphrase and print its fingerprint and public key.",
        hint: "ssh-keygen -l reads a key file and prints its fingerprint.",
        solution: "ssh-keygen -t ed25519 -C \"$USER@$(hostname)\"\n# accept the default path, type a passphrase twice\nssh-keygen -lf ~/.ssh/id_ed25519.pub\ncat ~/.ssh/id_ed25519.pub\nls -l ~/.ssh   # private key must be -rw-------",
      },
      {
        level: "medium",
        task: "Install your key on a test server, add a config alias called lab, and prove password login is no longer needed.",
        hint: "Use ssh-copy-id, then test with BatchMode, which never asks for a password.",
        solution: "ssh-copy-id -i ~/.ssh/id_ed25519.pub student@192.168.122.10\ncat >> ~/.ssh/config <<'EOF'\nHost lab\n  HostName 192.168.122.10\n  User student\n  IdentityFile ~/.ssh/id_ed25519\nEOF\nssh -o BatchMode=yes lab 'echo key login works'",
      },
      {
        level: "hard",
        task: "Allow a backup key to log in from 10.0.0.5 only and run just one command, with no shell and no forwarding.",
        hint: "Put options in front of the key in authorized_keys: from, command and restrict.",
        solution: "# on the server, one line in ~backup/.ssh/authorized_keys:\n# from=\"10.0.0.5\",command=\"/usr/local/bin/backup-receive\",restrict ssh-ed25519 AAAA... backup@nas\nchmod 600 ~backup/.ssh/authorized_keys\n# test from 10.0.0.5: any command you type runs backup-receive instead\nssh -i backup_key backup@server ls\n# from another IP the key is refused",
      },
    ],
    faq: [
      { q: "Is ed25519 better than RSA?", a: "For new keys, yes. ed25519 keys are short, fast and secure, and every current OpenSSH supports them. Use RSA with 3072 or more bits only for old systems that lack ed25519." },
      { q: "Can I use the same key on many servers?", a: "Yes, that is normal: the public key is not secret. Use a separate key per laptop or person, so you can revoke one without touching the others." },
      { q: "Why does SSH still ask for my password after I copied my key?", a: "Usually the server ignores the key because ~/.ssh or authorized_keys is too open, or the wrong key is offered. Run ssh -v to see which keys are tried, and check the server log with journalctl -u sshd." },
      { q: "What do I do if my private key is stolen?", a: "Remove its public key line from authorized_keys on every server, create a new key pair, and install the new public key. A passphrase gives you time, but do not rely on it." },
    ],
  },

  "adm-security/ssh-hardening": {
    plain: [
      "Any server with SSH open to the internet gets login attempts from bots within minutes. They try common user names and passwords all day. Hardening means changing the SSH server settings so these attempts can never succeed.",
      "The two biggest steps are simple. Stop root from logging in directly, and stop passwords from working at all, so only SSH keys get in. A bot can guess a weak password, but it cannot guess a private key.",
      "Next you limit who may connect. A rule like AllowGroups sshusers means only members of that group can log in, even if other accounts exist. A tool called fail2ban watches the log and blocks addresses that fail too often.",
      "The danger is locking yourself out. So you always test the config file before applying it, reload instead of restart, and keep your current session open while you try a new login from a second window.",
    ],
    deepDive: [
      {
        heading: "How sshd reads its configuration",
        body: "The SSH server, sshd, reads /etc/ssh/sshd_config. On RHEL 9 and current Ubuntu, that file starts with Include /etc/ssh/sshd_config.d/*.conf, so drop-in files are read first, in alphabetical order. For most options sshd keeps the first value it sees, so an earlier file wins over a later one.\n\nThis creates a real trap. Cloud images often ship 50-cloud-init.conf with PasswordAuthentication yes. A file called 50-hardening.conf sorts after it and loses. Name your file 01-hardening.conf, or check the result. sshd -T prints the settings sshd will actually use, which is the only reliable answer.",
        bullets: [
          "sudo sshd -T | grep -Ei 'permitroot|passwordauth|allowgroups' shows effective values",
          "sudo sshd -t checks syntax and prints nothing when it is valid",
          "ls /etc/ssh/sshd_config.d/ to see who else sets options",
        ],
        visual: {
          type: "flow",
          title: "Which value wins",
          steps: [
            { label: "Include runs first", detail: "sshd_config.d/*.conf in name order" },
            { label: "01-hardening.conf", detail: "PasswordAuthentication no: kept" },
            { label: "50-cloud-init.conf", detail: "PasswordAuthentication yes: ignored" },
            { label: "Rest of sshd_config", detail: "Only fills options not yet set" },
            { label: "Check with sshd -T", detail: "Shows the final values" },
          ],
        },
      },
      {
        heading: "The settings that matter",
        body: "PermitRootLogin no blocks root completely. The OpenSSH default is prohibit-password, which still lets root in with a key; no is stricter and forces admins to log in as themselves and use sudo, which leaves an audit trail.\n\nPasswordAuthentication no turns off password logins. Also set KbdInteractiveAuthentication no, because keyboard-interactive is another way to ask for a password through PAM. MaxAuthTries 3 (default 6) cuts attempts per connection, and LoginGraceTime 30 (default 120 seconds) drops slow, half-open logins sooner. Never disable PubkeyAuthentication, which is how you get in.",
        bullets: [
          "PermitRootLogin no",
          "PasswordAuthentication no and KbdInteractiveAuthentication no",
          "MaxAuthTries 3, LoginGraceTime 30",
          "X11Forwarding no unless someone needs it",
        ],
      },
      {
        heading: "Restricting users and using Match blocks",
        body: "AllowUsers and AllowGroups are allow lists: if one is set, everyone not listed is refused. DenyUsers and DenyGroups do the opposite. When several are set, sshd checks them in a fixed order: DenyUsers, AllowUsers, DenyGroups, then AllowGroups. A group list is easier to maintain, since adding a person is just usermod -aG sshusers.\n\nMatch blocks apply settings to some connections only. For example, Match Address 10.0.0.0/8 followed by PasswordAuthentication yes allows passwords from the internal network only. A Match block lasts until the next Match or the end of the file, so put Match blocks at the very end. Test them with sshd -T -C user=ana,host=x,addr=10.0.0.5.",
      },
      {
        heading: "fail2ban: blocking repeat offenders",
        body: "fail2ban reads logs, counts failures per IP address, and adds a firewall rule to ban addresses that fail too often. Each service has a jail. Settings go in /etc/fail2ban/jail.local, never jail.conf, which updates overwrite. The defaults are maxretry 5 failures within findtime 10m, which earns a bantime of 10m.\n\nOn RHEL, install fail2ban from EPEL; it bans through firewalld. On Ubuntu it is in the main archive. With key-only logins, fail2ban mostly reduces log noise and load rather than preventing break-ins, but it still helps against password spraying on other services. Whitelist your own office IP with ignoreip so a typo does not ban you.",
        bullets: [
          "sudo fail2ban-client status sshd shows failures and banned IPs",
          "sudo fail2ban-client set sshd unbanip 203.0.113.7 lifts a ban",
          "backend = systemd reads sshd messages from the journal",
        ],
      },
      {
        heading: "Changing the port safely",
        body: "Moving SSH from port 22 to, say, 2222 does not add real security, but it cuts bot noise in the logs. On RHEL with SELinux enforcing, sshd may only bind ports labelled ssh_port_t, so first run semanage port -a -t ssh_port_t -p tcp 2222. Then open the port with firewall-cmd --permanent --add-port=2222/tcp and firewall-cmd --reload, set Port 2222, run sshd -t, and reload.\n\nOn Ubuntu 24.04, sshd is started by a systemd socket. After changing the port, run systemctl daemon-reload and systemctl restart ssh.socket. In every case, test the new port from a second terminal before closing the old session.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A bot meets a hardened server",
        actors: ["Bot", "sshd", "fail2ban", "Firewall"],
        messages: [
          { from: 0, to: 1, label: "Try root with a password" },
          { from: 1, to: 0, label: "Refused: no root, no passwords" },
          { from: 1, to: 2, label: "Failures appear in the journal" },
          { from: 2, to: 2, label: "5 failures in 10 minutes counted" },
          { from: 2, to: 3, label: "Add a ban rule for the bot's IP" },
          { from: 0, to: 3, label: "Next connection is dropped" },
        ],
      },
    ],
    examples: [
      {
        title: "Harden a fresh cloud VM without losing access",
        explanation: "You have a new Ubuntu VM and are logged in with a key as ana. Step 1: add ana to a new group sshusers. Step 2: write a drop-in that sorts first. Step 3: check the syntax and the effective values; cloud-init's file no longer wins. Step 4: reload ssh, which keeps your session alive. Step 5: from a second terminal, prove a key login works and a password login is refused, and only then close the first session.",
        code: {
          lang: "bash",
          code: "sudo groupadd -f sshusers && sudo usermod -aG sshusers ana\nsudo tee /etc/ssh/sshd_config.d/01-hardening.conf <<'EOF'\nPermitRootLogin no\nPasswordAuthentication no\nKbdInteractiveAuthentication no\nAllowGroups sshusers\nMaxAuthTries 3\nEOF\nsudo sshd -t && sudo sshd -T | grep -Ei 'permitroot|passwordauth|allowgroups'\nsudo systemctl reload ssh      # the unit is sshd on RHEL\n# second terminal:\nssh ana@vm 'echo ok'\nssh -o PubkeyAuthentication=no ana@vm   # must fail",
        },
      },
      {
        title: "Turn on fail2ban for SSH on RHEL 9",
        explanation: "Step 1: enable EPEL and install fail2ban. Step 2: create jail.local with an sshd jail, a longer ban, and your admin network in ignoreip. Step 3: start the service. Step 4: check the jail status, which lists current failures and bans. If you ban yourself, unban from the console.",
        code: {
          lang: "bash",
          code: "sudo dnf install -y epel-release   # on RHEL use the EPEL rpm from Fedora\nsudo dnf install -y fail2ban\nsudo tee /etc/fail2ban/jail.local <<'EOF'\n[sshd]\nenabled  = true\nbackend  = systemd\nmaxretry = 4\nbantime  = 1h\nignoreip = 127.0.0.1/8 10.0.0.0/24\nEOF\nsudo systemctl enable --now fail2ban\nsudo fail2ban-client status sshd",
        },
      },
    ],
    cheatSheet: [
      "sudo sshd -t: syntax check; sudo sshd -T: print the effective settings",
      "Drop-ins in /etc/ssh/sshd_config.d are read first; the first value for an option wins",
      "PermitRootLogin no plus PasswordAuthentication no removes most risk",
      "Also set KbdInteractiveAuthentication no so PAM cannot ask for a password",
      "systemctl reload sshd (RHEL) or ssh (Ubuntu) keeps open sessions alive",
      "New SSH port on RHEL: semanage port -a -t ssh_port_t -p tcp 2222, then open it in firewalld",
      "fail2ban-client status sshd lists banned IPs; set sshd unbanip IP lifts a ban",
      "Keep one session open until a fresh login works",
    ],
    quiz: [
      {
        q: "You add PasswordAuthentication no in 60-hardening.conf, but 50-cloud-init.conf sets it to yes. What happens?",
        options: ["Your file wins because it is newer", "sshd refuses to start", "Passwords still work, because the first value read wins", "sshd asks which value to use"],
        answer: 2,
        why: "Drop-ins are read in name order and sshd keeps the first value, so 50-cloud-init.conf wins.",
      },
      {
        q: "What is the OpenSSH default for PermitRootLogin?",
        options: ["prohibit-password", "yes", "no", "forced-commands-only"],
        answer: 0,
        why: "Since OpenSSH 7.0 the default lets root in with keys but not with passwords.",
      },
      {
        q: "Which command shows the settings sshd will really use after all files are merged?",
        options: ["sshd -t", "systemctl status sshd", "cat /etc/ssh/sshd_config", "sshd -T"],
        answer: 3,
        why: "sshd -T prints the final effective configuration; -t only checks syntax.",
      },
      {
        q: "You moved SSH to port 2222 on RHEL and sshd fails to start with a bind error. What is the most likely missing step?",
        options: ["Restarting the network", "Labelling the port with semanage port -a -t ssh_port_t", "Running ssh-keygen -A", "Editing /etc/services"],
        answer: 1,
        why: "SELinux only lets sshd bind ports labelled ssh_port_t.",
      },
      {
        q: "Where should you put your own fail2ban settings?",
        options: ["/etc/fail2ban/jail.conf", "/etc/ssh/sshd_config", "/etc/fail2ban/jail.local", "/var/log/fail2ban.log"],
        answer: 2,
        why: "jail.local overrides jail.conf and survives package updates.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find out whether root login and password login are currently allowed on your server, without reading the files by eye.",
        hint: "sshd can print its own effective configuration.",
        solution: "sudo sshd -T | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication)'\n# example output:\n# permitrootlogin prohibit-password\n# passwordauthentication yes\n# kbdinteractiveauthentication no",
      },
      {
        level: "medium",
        task: "Allow SSH only for members of group sshusers, then prove a user outside the group is refused.",
        hint: "Use AllowGroups in a drop-in and test with sshd -T -C for a quick check before a real login.",
        solution: "sudo groupadd -f sshusers; sudo usermod -aG sshusers ana\necho 'AllowGroups sshusers' | sudo tee /etc/ssh/sshd_config.d/02-allow.conf\nsudo sshd -t && sudo systemctl reload sshd\nsudo useradd -m test && sudo passwd test\nssh test@localhost          # refused\nsudo journalctl -u sshd | grep -i 'not allowed because none of user' | tail -1",
      },
      {
        level: "hard",
        task: "Allow password logins only from the internal network 10.0.0.0/8 while keeping them off for everyone else.",
        hint: "A Match Address block at the end of the config overrides settings for matching connections.",
        solution: "sudo tee -a /etc/ssh/sshd_config <<'EOF'\n\nMatch Address 10.0.0.0/8\n    PasswordAuthentication yes\nEOF\nsudo sshd -t\nsudo sshd -T -C user=ana,host=x,addr=10.1.2.3 | grep passwordauth   # yes\nsudo sshd -T -C user=ana,host=x,addr=203.0.113.9 | grep passwordauth # no\nsudo systemctl reload sshd",
      },
    ],
    faq: [
      { q: "Does changing the SSH port make my server secure?", a: "No. It only reduces noise from bots that scan port 22. Real protection comes from key-only logins, no root login and a small allow list." },
      { q: "What if I lock myself out of SSH?", a: "Use the console your hypervisor or cloud provider offers, fix the drop-in file and reload sshd. This is why you keep one session open while testing." },
      { q: "Do I still need fail2ban if passwords are disabled?", a: "It is less important, because bots cannot guess a key. It still cuts log noise and load, and it protects any other service that does accept passwords." },
      { q: "What is the difference between reload and restart for sshd?", a: "Reload tells the running sshd to reread its config; existing sessions stay open either way, but reload avoids a moment with no listener. If the new config is broken, a restart can leave you with no running sshd at all." },
    ],
  },

  "adm-security/selinux": {
    plain: [
      "Normal Linux permissions ask one question: is this user allowed to touch this file? SELinux adds a second, independent question: is this kind of program allowed to touch this kind of file? Both answers must be yes.",
      "SELinux puts a label on every process, file and network port. The web server runs with the label httpd_t. Web pages carry the label httpd_sys_content_t. A rule in the policy says httpd_t may read httpd_sys_content_t. Files in home folders carry a different label, so the web server cannot read them, even with mode 777.",
      "This matters when a program is hacked. An attacker who takes over the web server is still stuck inside httpd_t. They cannot read SSH keys, change passwords or install services, because the policy has no rule allowing it.",
      "When something breaks with Permission denied but the file modes look right, SELinux is a likely reason. The fix is almost always one of three things: give the files the correct label, turn on a boolean (a policy switch), or label a new port. Turning SELinux off is never the answer.",
    ],
    deepDive: [
      {
        heading: "The three modes and how to switch",
        body: "Enforcing blocks and logs anything the policy does not allow. Permissive allows everything but still logs what would have been blocked, which is useful for testing. Disabled turns SELinux off completely, and turning it back on later needs a full relabel of every file.\n\nsetenforce 0 and setenforce 1 switch between permissive and enforcing until the next reboot. The boot-time mode lives in /etc/selinux/config as SELINUX=enforcing. You can also make a single domain permissive while the rest stays enforcing: semanage permissive -a httpd_t. That is a much safer way to test one service. On RHEL 9, fully disabling SELinux is done with the kernel option selinux=0, not the config file alone.",
        bullets: [
          "getenforce prints Enforcing, Permissive or Disabled",
          "sestatus shows mode, policy name and config file mode",
          "semanage permissive -d httpd_t removes a per-domain exception",
        ],
      },
      {
        heading: "Where file labels come from",
        body: "The policy holds a list of path patterns and the label each should have, for example /var/www(/.*)? gets httpd_sys_content_t. restorecon reads that list and fixes files to match. semanage fcontext -a adds your own patterns to the list, so they survive future relabels.\n\nNew files inherit the type of the folder they are created in. The big trap is mv: moving a file keeps its old label. If you create index.html in your home folder and mv it to /var/www/html, it keeps user_home_t and the web server gets a 403. cp creates a new file, so it gets the label of the destination. After any mv into a service folder, run restorecon.",
        bullets: [
          "semanage fcontext -l | grep /srv/web shows rules for a path",
          "restorecon -Rnv /srv/web previews changes without making them",
          "touch /.autorelabel and reboot relabels the whole filesystem",
        ],
        visual: {
          type: "compare",
          title: "chcon vs semanage fcontext + restorecon",
          columns: [
            { title: "chcon -t TYPE file", points: ["Changes the label right now", "Not stored in policy", "Lost on restorecon or relabel", "Only for quick tests"] },
            { title: "semanage fcontext + restorecon", points: ["Adds a rule to the policy list", "restorecon applies it", "Survives relabels and reboots", "The right way, and what exams check"] },
          ],
        },
      },
      {
        heading: "Reading an AVC denial",
        body: "Every block is logged as an AVC (access vector cache) message in /var/log/audit/audit.log. A typical one says: avc: denied { read } for comm=\"httpd\" name=\"index.html\" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file. Read it as a sentence: the httpd process (source type httpd_t) tried to read a file whose target type is user_home_t, and was denied.\n\nThe target type tells you what to fix. If it is a wrong-looking type, fix the label. If the type is right, look for a boolean. ausearch -m AVC -ts recent filters the log, and sealert -a /var/log/audit/audit.log (from setroubleshoot-server) explains each denial in plain words with suggested commands.",
        visual: {
          type: "tree",
          title: "Parts of an AVC message",
          root: "avc: denied { read }",
          children: [
            { label: "comm=\"httpd\"", children: ["Program that tried"] },
            { label: "scontext ... httpd_t", children: ["Source type: the process"] },
            { label: "tcontext ... user_home_t", children: ["Target type: the object", "Usually the clue"] },
            { label: "tclass=file", children: ["Kind of object: file, dir, tcp_socket"] },
            { label: "permissive=0", children: ["0 means it was really blocked"] },
          ],
        },
      },
      {
        heading: "Booleans and port labels",
        body: "Booleans are on or off switches built into the policy for common needs. httpd_can_network_connect lets the web server open outgoing connections, for example to an app server behind it. httpd_enable_homedirs lets it serve ~/public_html. getsebool -a lists them all, and semanage boolean -l adds a short description. setsebool -P name on changes it permanently; without -P it reverts at reboot.\n\nPorts are labelled too. httpd may bind only ports labelled http_port_t, which by default include 80, 81, 443, 8008, 8009, 8443 and 9000. semanage port -l | grep http_port_t shows the list. To run a site on 82, add it with semanage port -a -t http_port_t -p tcp 82. If the port already has another label, use -m instead of -a.",
      },
      {
        heading: "When nothing is logged, and audit2allow",
        body: "Some denials are hidden on purpose by dontaudit rules, which silence harmless noise. If something fails but ausearch shows nothing, run semodule -DB to disable dontaudit rules, reproduce the problem, read the log, then semodule -B to restore them.\n\naudit2allow can turn denials into a custom policy module (audit2allow -a -M mypol, then semodule -i mypol.pp). Treat it as a last resort. It allows exactly what was blocked, which may be far too much, and it often hides a simple label problem. Always try restorecon, a boolean or a port label first. audit2why explains why each denial happened.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Two checks for every access",
        steps: [
          { label: "httpd opens a file", detail: "Runs as user apache, type httpd_t" },
          { label: "Normal permissions", detail: "Owner, group, other bits and ACLs" },
          { label: "SELinux policy", detail: "Is httpd_t allowed to read this type?" },
          { label: "Both say yes", detail: "Access granted" },
          { label: "Either says no", detail: "Permission denied; SELinux logs an AVC" },
        ],
      },
    ],
    examples: [
      {
        title: "A web page moved from home gives 403",
        explanation: "You wrote index.html in your home folder and moved it to /var/www/html with mv. The modes are 644, yet the browser shows 403 Forbidden. Step 1: compare labels with ls -Z; the file still has user_home_t. Step 2: confirm with ausearch. Step 3: run restorecon, which applies the default label for that path. No new rule is needed because /var/www already has one in the policy.",
        code: {
          lang: "bash",
          code: "ls -Z /var/www/html/index.html\n# unconfined_u:object_r:user_home_t:s0 /var/www/html/index.html\nsudo ausearch -m AVC -ts recent | grep index.html\nsudo restorecon -v /var/www/html/index.html\n# Relabeled ... from user_home_t to httpd_sys_content_t\ncurl -I http://localhost/    # 200 OK",
        },
      },
      {
        title: "httpd as a reverse proxy cannot reach the app",
        explanation: "Apache proxies requests to an app on 127.0.0.1:8000, but users get 503 and the Apache log says permission denied on connect. Step 1: find the denial; it shows name_connect on a tcp_socket. Step 2: this is the exact case a boolean covers, so look it up. Step 3: turn it on persistently with -P. No labels or custom modules needed.",
        code: {
          lang: "bash",
          code: "sudo ausearch -m AVC -ts recent | grep name_connect\nsudo semanage boolean -l | grep httpd_can_network_connect\nsudo setsebool -P httpd_can_network_connect on\ngetsebool httpd_can_network_connect\n# httpd_can_network_connect --> on\ncurl -I http://localhost/",
        },
      },
    ],
    cheatSheet: [
      "ls -Z files, ps -eZ processes, id -Z your own context",
      "Modes: setenforce 0 or 1 until reboot; SELINUX= in /etc/selinux/config at boot",
      "semanage fcontext -a -t httpd_sys_content_t \"/srv/web(/.*)?\" then restorecon -Rv /srv/web",
      "mv keeps the old label, cp takes the destination label: run restorecon after mv",
      "setsebool -P name on makes a boolean permanent; getsebool -a lists all",
      "semanage port -a -t http_port_t -p tcp 82 lets httpd bind port 82",
      "ausearch -m AVC -ts recent finds denials; sealert -a /var/log/audit/audit.log explains them",
      "semanage permissive -a httpd_t tests one service without disabling SELinux",
    ],
    quiz: [
      {
        q: "A file was moved with mv from /home/ana to /var/www/html. What label does it have?",
        options: ["httpd_sys_content_t, from its new folder", "No label until reboot", "Whatever restorecon last set in /var/www", "user_home_t, because mv keeps the old label"],
        answer: 3,
        why: "mv keeps the existing label; only newly created files take the folder's type.",
      },
      {
        q: "Which change survives a full filesystem relabel?",
        options: ["semanage fcontext -a followed by restorecon", "chcon -t httpd_sys_content_t", "setenforce 0", "chmod 755"],
        answer: 0,
        why: "semanage stores the rule in policy, so restorecon and relabels apply it again.",
      },
      {
        q: "In an AVC message, which field usually tells you what to fix?",
        options: ["pid", "tcontext, the target's type", "comm", "The timestamp"],
        answer: 1,
        why: "A wrong target type points to a labelling fix; a correct one points to a boolean.",
      },
      {
        q: "What does setsebool httpd_can_network_connect on do without -P?",
        options: ["Nothing until reboot", "Changes the policy file permanently", "Turns it on until the next reboot", "Asks for confirmation"],
        answer: 2,
        why: "Without -P the change is only in memory and is lost at reboot.",
      },
      {
        q: "httpd fails to start after you set Listen 82. Which command is the fix?",
        options: ["semanage fcontext -a -t http_port_t 82", "setsebool -P httpd_port_82 on", "restorecon -Rv /etc/httpd", "semanage port -a -t http_port_t -p tcp 82"],
        answer: 3,
        why: "Ports have labels too, and httpd may bind only ports labelled http_port_t.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the current SELinux mode, the context of the httpd processes and the context of /var/www/html.",
        hint: "The Z option works with ls and ps.",
        solution: "getenforce\nsestatus | head -5\nps -eZ | grep httpd\nls -Zd /var/www/html\n# system_u:object_r:httpd_sys_content_t:s0 /var/www/html",
      },
      {
        level: "medium",
        task: "Serve a website from /srv/web with SELinux enforcing, in a way that survives a relabel.",
        hint: "Add a file context rule for the folder and everything under it, then apply it.",
        solution: "sudo mkdir -p /srv/web && echo hi | sudo tee /srv/web/index.html\nsudo semanage fcontext -a -t httpd_sys_content_t \"/srv/web(/.*)?\"\nsudo restorecon -Rv /srv/web\n# point DocumentRoot at /srv/web and allow it in a <Directory> block\nsudo systemctl restart httpd\ncurl http://localhost/\nsudo restorecon -Rnv /srv/web   # no output: labels already correct",
      },
      {
        level: "hard",
        task: "Something is denied but ausearch shows no AVC. Find the hidden denial, then restore normal logging.",
        hint: "dontaudit rules can hide denials; semodule can rebuild the policy without them.",
        solution: "sudo semodule -DB              # disable dontaudit rules\n# reproduce the failure now\nsudo ausearch -m AVC,USER_AVC -ts recent\nsudo ausearch -m AVC -ts recent | audit2why\nsudo semodule -B               # restore dontaudit rules\n# fix with restorecon, a boolean or a port label as the message suggests",
      },
    ],
    faq: [
      { q: "Should I just disable SELinux to make things work?", a: "No. Almost every problem is a wrong label, a boolean or a port label, and each is a one-line fix. Disabling it removes a strong layer of protection and is a failed task on the RHCSA." },
      { q: "What is the difference between permissive and disabled?", a: "Permissive keeps labelling files and logs what it would block, so you can switch back at any time. Disabled stops everything, and enabling it again needs a full relabel." },
      { q: "What does the dot at the end of ls -l permissions mean?", a: "A dot, as in -rw-r--r--., means the file has an SELinux label and no ACL. A plus means an ACL is set." },
      { q: "Where are SELinux denials logged?", a: "In /var/log/audit/audit.log when auditd runs, which is the default on RHEL. Search them with ausearch -m AVC, or read summaries with sealert." },
    ],
  },

  "adm-security/apparmor": {
    plain: [
      "AppArmor is Ubuntu's way to keep programs inside a fence. Each protected program gets a profile, a text file that lists exactly which files it may read or write and what else it may do. Anything not on the list is blocked.",
      "Where SELinux puts labels on every file, AppArmor works with file paths. A rule like /var/log/nginx/*.log w means the program may write the log files in that folder. This makes profiles easy to read, even for beginners.",
      "A profile is in one of two modes. Enforce mode blocks and logs anything outside the rules. Complain mode allows everything but logs what would have been blocked, so you can test a profile without breaking the program.",
      "Programs without a profile run unconfined, which means AppArmor does nothing for them. Ubuntu ships profiles for common services, and snap packages are confined by AppArmor automatically.",
    ],
    deepDive: [
      {
        heading: "Reading aa-status",
        body: "sudo aa-status (also called apparmor_status) is the first command to run. It prints how many profiles are loaded, which are in enforce mode and which in complain mode, and which running processes are confined by which profile.\n\nOne line to watch: processes that are unconfined but have a profile defined. That means the profile was loaded after the program started. A profile only applies when the program is executed, so restart the service to bring it under the profile. The command aa-enabled simply answers Yes if AppArmor is active, and the kernel parameter apparmor=1 is the default on Ubuntu.",
        bullets: [
          "sudo aa-status --enforced counts enforce-mode profiles",
          "ps auxZ shows the profile each process runs under",
          "systemctl status apparmor checks that profiles load at boot",
        ],
      },
      {
        heading: "What a profile looks like",
        body: "Profiles live in /etc/apparmor.d. The file name is the program path with slashes turned into dots, so /usr/sbin/tcpdump has the profile usr.sbin.tcpdump. Inside, each rule is a path followed by permissions: r read, w write, m memory map as executable, ix run a program inside the same profile, and k lock. One star matches within a folder, two stars match any depth.\n\nProfiles also control capabilities (capability net_raw,) and networking (network inet tcp,). Shared rules come from include lines that pull in files such as abstractions/base. To add your own rules without editing the packaged file, use the local override file, for example /etc/apparmor.d/local/usr.sbin.tcpdump, which package updates leave alone.",
        visual: {
          type: "tree",
          title: "A profile for /usr/sbin/myapp",
          root: "/etc/apparmor.d/usr.sbin.myapp",
          children: [
            { label: "Includes", children: ["abstractions/base", "local/usr.sbin.myapp"] },
            { label: "File rules", children: ["/etc/myapp/* r,", "/var/log/myapp/*.log w,", "/usr/sbin/myapp mr,"] },
            { label: "Capabilities", children: ["capability net_bind_service,"] },
            { label: "Network", children: ["network inet tcp,"] },
          ],
        },
      },
      {
        heading: "Switching modes and reloading",
        body: "The apparmor-utils package gives you the mode tools. aa-complain PROFILE switches one profile to complain mode, aa-enforce PROFILE switches it back, and aa-disable PROFILE unloads it and adds a symlink in /etc/apparmor.d/disable/ so it stays off after reboot. You can pass the profile file or the program path.\n\nAfter editing a profile by hand, reload it with sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.myapp. If the syntax is wrong the parser prints the line number and keeps the old version loaded. To reload everything, run sudo systemctl reload apparmor.",
        bullets: [
          "sudo aa-complain /usr/sbin/tcpdump",
          "sudo aa-enforce /etc/apparmor.d/usr.sbin.tcpdump",
          "sudo apparmor_parser -r FILE reloads one profile",
        ],
      },
      {
        heading: "Finding and acting on denials",
        body: "Denials are kernel audit messages. If auditd is installed they go to /var/log/audit/audit.log; otherwise they land in the kernel log, which journalctl -k shows. Search for apparmor=\"DENIED\". A message names the operation (open, exec, mknod), the profile, the path in name=, and the requested_mask, such as r or w.\n\nIn complain mode the same messages say apparmor=\"ALLOWED\". The tool aa-logprof reads these log entries and asks, rule by rule, whether to allow each one, then writes the profile for you. aa-genprof PROGRAM builds a new profile from scratch the same way: start it, use the program normally, then let it scan the log.",
      },
      {
        heading: "Edge cases worth knowing",
        body: "Because rules are path based, a hard link or a copy of a binary at a different path is not covered by the original profile. Bind mounts and symlinks are resolved to the real path before checking, so rules must name that real path.\n\nOn Ubuntu 23.10 and later, AppArmor also restricts unprivileged user namespaces, which some sandboxed apps and rootless container tools need; such programs get a profile that grants the userns permission. Docker and Podman apply a default AppArmor profile to containers on Ubuntu as well, which explains some surprising permission errors inside containers.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Building a profile safely",
        steps: [
          { label: "Complain mode", detail: "aa-complain: allow but log" },
          { label: "Use the program", detail: "Exercise every normal feature" },
          { label: "aa-logprof", detail: "Turn logged events into rules" },
          { label: "Enforce mode", detail: "aa-enforce and watch for DENIED" },
        ],
      },
    ],
    examples: [
      {
        title: "Let a confined service read a new folder",
        explanation: "You moved the config for myapp to /srv/conf. It is in enforce mode and now fails with Permission denied, even as root. Step 1: find the denial in the kernel log; it shows name=\"/srv/conf/app.ini\" and requested_mask=\"r\". Step 2: add a read rule to the local override file. Step 3: reload the main profile, which includes the local file. Step 4: restart the service and check the log is quiet.",
        code: {
          lang: "bash",
          code: "sudo journalctl -k --since '10 min ago' | grep 'apparmor=\"DENIED\"'\necho '/srv/conf/** r,' | sudo tee -a /etc/apparmor.d/local/usr.sbin.myapp\nsudo apparmor_parser -r /etc/apparmor.d/usr.sbin.myapp\nsudo systemctl restart myapp\nsudo journalctl -k --since '1 min ago' | grep -c 'DENIED'   # 0",
        },
      },
      {
        title: "Is AppArmor the reason this fails?",
        explanation: "A packaged service such as cups-browsed fails after a change and you suspect AppArmor. Step 1: check it has a profile in enforce mode. Step 2: switch only that profile to complain mode and retry. Step 3: if it now works, AppArmor was the cause; read the ALLOWED lines to see which rules are missing. Step 4: add those rules and put the profile back in enforce mode. Never leave it in complain mode as the fix.",
        code: {
          lang: "bash",
          code: "sudo aa-status | grep -A3 'enforce mode' | head\nsudo aa-complain /usr/sbin/cups-browsed\nsudo systemctl restart cups-browsed\nsudo journalctl -k | grep 'apparmor=\"ALLOWED\"' | tail -5\n# add the rules to /etc/apparmor.d/local/usr.sbin.cups-browsed\nsudo aa-enforce /usr/sbin/cups-browsed",
        },
      },
    ],
    cheatSheet: [
      "sudo aa-status: loaded profiles, modes and confined processes",
      "Profiles: /etc/apparmor.d/usr.sbin.name; your rules: /etc/apparmor.d/local/usr.sbin.name",
      "aa-complain logs only; aa-enforce blocks; aa-disable unloads and keeps it off",
      "sudo apparmor_parser -r FILE reloads one edited profile",
      "journalctl -k | grep 'apparmor=\"DENIED\"' finds blocked actions",
      "Restart a service after loading its profile; profiles apply at exec time",
      "aa-logprof turns logged events into profile rules interactively",
    ],
    quiz: [
      {
        q: "What does AppArmor use to decide what a program may access?",
        options: ["Labels stored on every file", "File paths listed in the program's profile", "The user's group memberships", "Firewall zones"],
        answer: 1,
        why: "AppArmor profiles are path based; SELinux is the one that labels every object.",
      },
      {
        q: "aa-status shows a process as unconfined but having a profile defined. Why?",
        options: ["The profile is in complain mode", "The profile has a syntax error", "The program started before its profile was loaded", "AppArmor is disabled in the kernel"],
        answer: 2,
        why: "Profiles attach when a program is executed, so restart it to confine it.",
      },
      {
        q: "Which file should you edit to add rules to a packaged profile?",
        options: ["The matching file in /etc/apparmor.d/local/", "/etc/apparmor.d/disable/", "/sys/kernel/security/apparmor/profiles", "/etc/apparmor/parser.conf"],
        answer: 0,
        why: "Local override files are included by the main profile and survive package updates.",
      },
      {
        q: "In complain mode, how do events appear in the log?",
        options: ["They are not logged", "As apparmor=\"DENIED\"", "As AVC denied", "As apparmor=\"ALLOWED\""],
        answer: 3,
        why: "Complain mode allows the action but records it as ALLOWED.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Count how many AppArmor profiles are in enforce mode and how many in complain mode on an Ubuntu machine.",
        hint: "aa-status prints a summary at the top.",
        solution: "sudo aa-status | head -8\n# e.g. 120 profiles are loaded.\n#      115 profiles are in enforce mode.\n#        5 profiles are in complain mode.\nsudo aa-status --enforced\nsudo aa-status --complaining",
      },
      {
        level: "medium",
        task: "Put the tcpdump profile in complain mode, capture a few packets to a file in /tmp, look at the log, then return it to enforce mode.",
        hint: "Install apparmor-utils for aa-complain and aa-enforce.",
        solution: "sudo apt install -y apparmor-utils\nsudo aa-complain /usr/sbin/tcpdump\nsudo tcpdump -c 5 -w /tmp/test.pcap\nsudo journalctl -k --since '5 min ago' | grep tcpdump | tail -3\nsudo aa-enforce /usr/sbin/tcpdump\nsudo aa-status | grep -A200 'enforce mode' | grep tcpdump",
      },
      {
        level: "hard",
        task: "Write a minimal profile for a script /usr/local/bin/report.sh that may read /etc/hostname and write only to /var/tmp/report.txt, then prove a write elsewhere is denied.",
        hint: "Include abstractions/base and abstractions/bash, allow the shell interpreter with ix, then load with apparmor_parser.",
        solution: "sudo tee /etc/apparmor.d/usr.local.bin.report.sh <<'EOF'\ninclude <tunables/global>\n/usr/local/bin/report.sh {\n  include <abstractions/base>\n  include <abstractions/bash>\n  /usr/bin/bash ix,\n  /usr/local/bin/report.sh r,\n  /usr/bin/cat ix,\n  /etc/hostname r,\n  /var/tmp/report.txt w,\n}\nEOF\nsudo apparmor_parser -r /etc/apparmor.d/usr.local.bin.report.sh\n# a write to /tmp inside the script now logs apparmor=\"DENIED\"",
      },
    ],
    faq: [
      { q: "Can I run SELinux and AppArmor at the same time?", a: "Not as the main security module on normal distributions; each system enables one. Ubuntu and SUSE use AppArmor, while RHEL and Fedora use SELinux." },
      { q: "How do I turn AppArmor off for one program?", a: "Run aa-disable with its profile. It unloads the profile and adds a link in /etc/apparmor.d/disable so it stays off after reboot. Fixing the profile is usually better." },
      { q: "Why does root get Permission denied?", a: "AppArmor rules apply to confined programs no matter which user runs them, including root. Check the kernel log for apparmor=\"DENIED\"." },
      { q: "Does AppArmor protect programs with no profile?", a: "No. Programs without a profile run unconfined, so only normal Linux permissions apply to them." },
    ],
  },
};

export default extra;
