import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-packages/dnf-rpm": {
    plain: [
      "On Linux you rarely download installers from websites. Software comes as packages: archives that hold a program's files plus information about it, such as its version and which other packages it needs. On RHEL, Rocky and Alma these are RPM packages.",
      "rpm is the low-level tool. It installs, removes and inspects one package file at a time, and it keeps a database of everything installed. It does not download anything and does not fetch missing dependencies for you.",
      "dnf is the tool you use every day. It knows about repositories, which are online or local collections of packages. When you type dnf install httpd, dnf finds the package, works out everything else it needs, downloads it all, checks the signatures and hands the files to rpm to install.",
      "Because every package is signed with a GPG key, dnf can prove that a package really comes from Red Hat or from the project you trust, and has not been changed on the way. Keeping those checks switched on is one of the cheapest security wins you have.",
    ],
    deepDive: [
      {
        heading: "What happens during dnf install",
        body: "First dnf loads metadata for every enabled repository: an index of packages, versions, dependencies and file lists. It keeps it in a cache under /var/cache/dnf and refreshes it when it is older than the metadata_expire setting (48 hours by default, though repos can set their own). dnf makecache or the --refresh option forces a fresh download.\n\nNext the dependency solver finds a set of packages that satisfies your request without conflicts, and shows you the transaction: what will be installed, upgraded or removed. After you confirm, dnf downloads the packages, checks each GPG signature, runs a test transaction and then lets rpm unpack the files and run the package scripts. Finally the rpm database and dnf's history are updated.",
        visual: {
          type: "flow",
          title: "dnf install httpd, step by step",
          steps: [
            { label: "Load repo metadata", detail: "From cache or freshly downloaded" },
            { label: "Solve dependencies", detail: "httpd plus every package it needs" },
            { label: "Show and confirm", detail: "The transaction summary" },
            { label: "Download and verify", detail: "GPG signature checked per package" },
            { label: "rpm installs", detail: "Files unpacked, scripts run" },
            { label: "Record it", detail: "rpm database and dnf history" },
          ],
        },
      },
      {
        heading: "Answering questions with rpm queries",
        body: "rpm -q is a fast, offline way to learn about installed software. rpm -qa lists every package, rpm -qi httpd shows version, vendor and description, rpm -ql httpd lists its files, and rpm -qc httpd lists only its configuration files, which is a quick way to find where a service is configured. rpm -qf /usr/sbin/httpd goes the other way and names the package that owns a file. rpm -q --scripts shows what a package runs during install or removal.\n\nAdd -p to ask the same about a package file you have not installed yet: rpm -qlp ./tool.rpm. rpm -V httpd verifies installed files against the database and prints a code for each change: S for size, 5 for content, M for mode, U for owner, T for modification time. A c next to the code marks a config file, where changes are expected.",
        bullets: ["rpm -qa --last | head shows the most recently installed packages", "rpm -Va checks every package; slow but thorough", "rpm -K file.rpm checks a package file's signature"],
      },
      {
        heading: "Repositories, keys and trust",
        body: "A repository is defined by a section in a .repo file in /etc/yum.repos.d. The section name in brackets is the repo ID. baseurl points at the packages (http, https or file://), or metalink and mirrorlist name a list of mirrors. enabled=1 turns it on. gpgcheck=1 makes dnf check each package's signature, and gpgkey says where the public key is.\n\nThe first time a package from a new key is installed, dnf shows the key's fingerprint and asks you to accept it. You can also import keys yourself with rpm --import; imported keys appear as packages named gpg-pubkey, which rpm -qa gpg-pubkey lists. Compare fingerprints with the vendor's website before trusting a key.\n\ndnf config-manager --add-repo URL writes a .repo file for you (it comes from dnf-plugins-core), and --set-enabled or --set-disabled switches repos on and off.",
        bullets: ["dnf repolist -v shows each repo's URL and package count", "dnf --disablerepo='*' --enablerepo=local install pkg uses one repo only", "Never leave gpgcheck=0 in place to silence an error"],
      },
      {
        heading: "Groups, module streams, history and reboots",
        body: "Package groups install a whole set at once: dnf group list shows them and dnf group install \"Development Tools\" installs one. On RHEL 8 and 9, AppStream also offers module streams, which are parallel versions of one stack such as nodejs or postgresql. dnf module list nodejs shows the streams and dnf module enable nodejs:20 picks one before you install.\n\nEvery dnf transaction gets a number. dnf history list shows them, dnf history info 12 shows what changed, dnf history undo 12 reverses one transaction and dnf history rollback 12 returns to the state after it. Undo needs the old package versions to still be available in a repo, so it can fail for older upgrades.\n\nAfter updates, dnf needs-restarting -r (from dnf-utils) tells you whether a reboot is required, for example after a new kernel or glibc.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Anatomy of a .repo file",
        root: "/etc/yum.repos.d/internal.repo",
        children: [
          { label: "[internal]", children: ["Repo ID used in dnf commands"] },
          { label: "name=", children: ["Human-readable description"] },
          { label: "baseurl= or metalink=", children: ["Where packages and metadata live"] },
          { label: "enabled=1", children: ["0 keeps it defined but unused"] },
          { label: "gpgcheck=1", children: ["Verify every package signature"] },
          { label: "gpgkey=", children: ["URL or file:// path of the public key"] },
        ],
      },
    ],
    examples: [
      {
        title: "Install from a local repository built from the ISO",
        explanation: "A lab or exam machine has no internet, but the installation DVD is attached. Step 1: mount the ISO, and add it to /etc/fstab if it must survive a reboot. Step 2: create one repo for BaseOS and one for AppStream, because RHEL 9 media holds both. Step 3: point gpgkey at the release key already on the system (ls /etc/pki/rpm-gpg shows its name on Rocky or Alma). Step 4: check the repos and install something.",
        code: {
          lang: "bash",
          code: "sudo mkdir -p /mnt/iso && sudo mount -o ro /dev/sr0 /mnt/iso\nsudo tee /etc/yum.repos.d/iso.repo > /dev/null <<'EOF'\n[iso-baseos]\nname=ISO BaseOS\nbaseurl=file:///mnt/iso/BaseOS\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\n\n[iso-appstream]\nname=ISO AppStream\nbaseurl=file:///mnt/iso/AppStream\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\nEOF\nsudo dnf repolist && sudo dnf install -y tmux",
        },
      },
      {
        title: "Undo an update that broke something",
        explanation: "After installing a set of PHP packages, a web app stops working. Step 1: find the transaction in dnf history. Step 2: look at exactly what it installed or upgraded. Step 3: undo it, which removes what it added and downgrades what it upgraded, if the old versions are still in a repo. Step 4: check which config files the package owns and whether any changed, so you can tell a package problem from a local edit.",
        code: {
          lang: "bash",
          code: "sudo dnf history list | head -5\n#  ID | Command line         | Date and time    | Action(s) | Altered\n#  14 | install php php-fpm  | 2026-11-09 10:12 | Install   |   12\nsudo dnf history info 14\nsudo dnf history undo 14\nrpm -qc httpd\nrpm -V httpd",
        },
      },
    ],
    cheatSheet: [
      "dnf provides '*/semanage' finds the package that ships a command",
      "rpm -qc PACKAGE lists only that package's configuration files",
      "rpm -qf /path names the package that owns a file",
      "rpm -V PACKAGE reports changed files: S size, 5 content, M mode, T time",
      "dnf install ./file.rpm installs a local file and fetches its dependencies",
      "dnf config-manager --add-repo URL creates a .repo file (needs dnf-plugins-core)",
      "dnf history undo ID reverses one transaction",
      "dnf needs-restarting -r tells you if a reboot is needed after updates",
    ],
    quiz: [
      {
        q: "You have a downloaded tool.rpm that needs two other packages. Which command installs it and its dependencies?",
        options: ["rpm -i tool.rpm", "dnf install ./tool.rpm", "rpm -qp tool.rpm", "dnf provides tool.rpm"],
        answer: 1,
        why: "dnf resolves and downloads dependencies; rpm -i would stop with a missing dependencies error.",
      },
      {
        q: "Which command lists only the configuration files that the chronyd package installed?",
        options: ["rpm -ql chrony", "rpm -qi chrony", "dnf info chrony", "rpm -qc chrony"],
        answer: 3,
        why: "-c limits the file list to files marked as configuration.",
      },
      {
        q: "rpm -V httpd prints S.5....T.  c /etc/httpd/conf/httpd.conf. What does it mean?",
        options: ["The config file's size, content and time differ from the package, which is normal after editing", "The package is corrupt and must be reinstalled", "The file is missing", "The file's owner was changed"],
        answer: 0,
        why: "S, 5 and T report size, digest and mtime changes, and c marks it as a config file you are expected to edit.",
      },
      {
        q: "Where are imported RPM signing keys listed?",
        options: ["In /etc/yum.repos.d", "In dnf repolist", "As gpg-pubkey packages in rpm -qa", "In /var/cache/dnf"],
        answer: 2,
        why: "rpm --import stores each key as a pseudo-package named gpg-pubkey.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find out which package provides the command semanage, install it, and then show which package owns /usr/sbin/semanage.",
        hint: "dnf provides accepts a path pattern; rpm -qf works on installed files.",
        solution: "dnf provides '*/semanage'\nsudo dnf install -y policycoreutils-python-utils\nrpm -qf /usr/sbin/semanage",
      },
      {
        level: "medium",
        task: "Add a repository with ID internal from http://repo.example.com/el9/x86_64, signed with the key at http://repo.example.com/RPM-GPG-KEY-internal. Make sure signatures are checked, and list the repo.",
        hint: "Write a .repo file in /etc/yum.repos.d or use dnf config-manager, then keep gpgcheck=1.",
        solution: "sudo tee /etc/yum.repos.d/internal.repo > /dev/null <<'EOF'\n[internal]\nname=Internal packages\nbaseurl=http://repo.example.com/el9/x86_64\nenabled=1\ngpgcheck=1\ngpgkey=http://repo.example.com/RPM-GPG-KEY-internal\nEOF\nsudo dnf repolist -v internal",
      },
      {
        level: "hard",
        task: "Install the Development Tools group, then use dnf history to remove exactly what that transaction added, and confirm gcc is gone.",
        hint: "Find the transaction ID with dnf history list, then undo it.",
        solution: "sudo dnf group install -y \"Development Tools\"\nID=$(sudo dnf history list | awk '/group install/ {print $1; exit}')\nsudo dnf history info \"$ID\" | head -20\nsudo dnf history undo -y \"$ID\"\nrpm -q gcc     # package gcc is not installed",
      },
    ],
    faq: [
      { q: "What is the difference between yum and dnf?", a: "dnf replaced yum as the package manager on RHEL 8 and later. The yum command still exists there as a link to dnf, so old instructions usually still work." },
      { q: "Is dnf update the same as dnf upgrade?", a: "Yes. dnf update is kept as an alias of dnf upgrade." },
      { q: "How do I list installed packages?", a: "Use dnf list --installed or rpm -qa. Pipe to grep to look for one name, or use rpm -q name for an exact match." },
      { q: "Why does dnf ask me to import a GPG key?", a: "The first package signed by a new key needs that key to be trusted. Check that the fingerprint matches the vendor's published one, then accept it." },
    ],
  },

  "adm-packages/apt-dpkg": {
    plain: [
      "Ubuntu and Debian use .deb packages. Like RPMs, each one holds a program's files plus a list of what it needs. The idea is the same as on RHEL; only the tool names and some file locations differ.",
      "dpkg is the low-level tool. It installs one .deb file, removes packages and answers questions about what is installed. Like rpm, it does not download anything or fetch dependencies.",
      "apt is the tool you use every day. It reads a list of sources (repositories), keeps a local copy of their package lists, and handles downloads and dependencies. You run apt update to refresh those lists, then apt install, apt upgrade or apt remove.",
      "The most common beginner mistake is to forget apt update. apt then works with an old list and may try to download versions that no longer exist on the server. Updating the list first, then installing, avoids most strange errors.",
    ],
    deepDive: [
      {
        heading: "apt, apt-get and dpkg: who does what",
        body: "apt is the friendly front end for people: coloured output, progress bars and short commands. Its output format may change between releases, so scripts should use apt-get and apt-cache, which are stable. Under both sits dpkg, which actually unpacks files, runs package scripts and records the state.\n\napt update downloads package indexes into /var/lib/apt/lists. apt upgrade installs newer versions but never removes a package. apt full-upgrade (the same as apt-get dist-upgrade) may also remove packages when that is needed to finish the upgrade. apt install pkg=1.2.3-1 installs a specific version, and apt-mark hold pkg stops a package from being upgraded until you run apt-mark unhold.",
        visual: {
          type: "layers",
          title: "The Debian package stack",
          layers: [
            { label: "apt", detail: "Interactive commands for people" },
            { label: "apt-get and apt-cache", detail: "Stable commands for scripts" },
            { label: "Sources and indexes", detail: "sources.list.d and /var/lib/apt/lists" },
            { label: "dpkg", detail: "Unpacks .deb files and runs package scripts" },
            { label: "dpkg database", detail: "/var/lib/dpkg/status records every package" },
          ],
        },
      },
      {
        heading: "Sources, components and pockets",
        body: "Ubuntu 24.04 stores its own sources in /etc/apt/sources.list.d/ubuntu.sources using the newer deb822 format, with lines like Types, URIs, Suites, Components and Signed-By. Older releases use the one-line format in /etc/apt/sources.list, such as deb http://archive.ubuntu.com/ubuntu jammy main. apt understands both.\n\nComponents split the archive by support level: main (supported by Canonical), restricted (proprietary drivers), universe (community maintained) and multiverse (licence limits). Suites, also called pockets, separate the release from its updates: noble, noble-updates, noble-security and noble-backports for 24.04.\n\napt-cache policy nginx shows which versions each source offers and which one apt will choose, which is the first command to run when the wrong version gets installed.",
        bullets: ["Security fixes arrive through the -security pocket", "add-apt-repository universe enables a component", "apt-cache policy shows priorities and candidate versions"],
      },
      {
        heading: "Adding a third-party source safely",
        body: "The old apt-key command added keys to one global keyring, which meant a key for one vendor was trusted for every repository. It is deprecated. The safe pattern today is: download the vendor's key into /etc/apt/keyrings, check its fingerprint, and reference it with Signed-By in that vendor's source file only. Then a key can only vouch for packages from its own repository.\n\nKeep third-party sources few and well known. A repository can ship any package, including a newer version of something important like openssl, and apt will happily upgrade to it if its version is higher. Read the vendor's instructions carefully, prefer https URLs, and remove sources you no longer use.\n\nPPAs (Personal Package Archives on Launchpad) are third-party sources too, even though add-apt-repository ppa:name/ppa makes them look built in.",
        visual: {
          type: "flow",
          title: "Trusting one vendor repository",
          steps: [
            { label: "Download the key", detail: "Into /etc/apt/keyrings" },
            { label: "Check the fingerprint", detail: "gpg --show-keys against the vendor's site" },
            { label: "Write a .sources file", detail: "Signed-By points at that key only" },
            { label: "apt update", detail: "Indexes verified with that key" },
            { label: "apt install", detail: "Only this repo trusts this key" },
          ],
        },
      },
      {
        heading: "dpkg states, logs and automatic updates",
        body: "dpkg -l shows two letters before each package. ii means installed and fine. rc means removed, but config files are still there; apt purge clears them. A third column or letters other than i point to a half-installed package. If an install was interrupted, sudo dpkg --configure -a usually finishes it, followed by sudo apt -f install to repair dependencies.\n\nThere is no history undo as in dnf, but there are logs: /var/log/apt/history.log records each apt command and what changed, and /var/log/dpkg.log records every package step.\n\nUbuntu Server ships unattended-upgrades, which installs security updates daily. Its settings are in /etc/apt/apt.conf.d/50unattended-upgrades and 20auto-upgrades, and it logs to /var/log/unattended-upgrades/. When an update needs a reboot, the file /var/run/reboot-required appears.",
        bullets: ["dpkg -s nginx shows status, version and dependencies", "dpkg -c file.deb lists the files inside a package file", "apt autoremove removes dependencies nothing needs any more"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Life of a package on Ubuntu",
        steps: [
          { label: "apt update", detail: "Refresh the indexes" },
          { label: "apt install", detail: "Status becomes ii" },
          { label: "apt upgrade", detail: "Newer version from the same sources" },
          { label: "apt remove", detail: "Status rc, config files kept" },
          { label: "apt purge", detail: "Config gone, package forgotten" },
        ],
      },
    ],
    examples: [
      {
        title: "Add a vendor repository the modern way",
        explanation: "You need packages from a vendor at repo.example.com. Step 1: create the keyrings directory and download the vendor's key into it. Step 2: show the key's fingerprint and compare it with the one on the vendor's website. Step 3: write a deb822 source file whose Signed-By names that key. Step 4: update and check that apt now sees the vendor's version before installing.",
        code: {
          lang: "bash",
          code: "sudo install -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://repo.example.com/key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/example.gpg\ngpg --show-keys /etc/apt/keyrings/example.gpg\nsudo tee /etc/apt/sources.list.d/example.sources > /dev/null <<'EOF'\nTypes: deb\nURIs: https://repo.example.com/apt\nSuites: stable\nComponents: main\nSigned-By: /etc/apt/keyrings/example.gpg\nEOF\nsudo apt update\napt-cache policy example-tool",
        },
      },
      {
        title: "Recover from an interrupted upgrade",
        explanation: "An SSH session dropped in the middle of apt upgrade. Now every apt command complains that dpkg was interrupted. Step 1: let dpkg finish configuring whatever it had unpacked. Step 2: let apt fix broken dependencies. Step 3: check for packages that are not in the ii state. Step 4: read the end of the apt history log to see what the upgrade was doing. Running long upgrades inside tmux avoids this next time.",
        code: {
          lang: "bash",
          code: "sudo dpkg --configure -a\nsudo apt -f install\ndpkg -l | awk 'NR>5 && $1 != \"ii\"'\ntail -20 /var/log/apt/history.log\nsudo apt upgrade",
        },
      },
    ],
    cheatSheet: [
      "apt update refreshes indexes; apt upgrade installs newer versions; neither removes packages",
      "apt full-upgrade may remove packages to complete an upgrade",
      "dpkg -S /path names the package that owns a file; dpkg -L PACKAGE lists its files",
      "apt install ./file.deb installs a local file and its dependencies",
      "apt-mark hold PACKAGE stops upgrades of that package",
      "apt-cache policy PACKAGE shows available versions and which one apt will pick",
      "dpkg -l shows ii for installed and rc for removed with config left",
      "/var/run/reboot-required exists when an update needs a reboot",
    ],
    quiz: [
      {
        q: "dpkg -l shows rc next to a package. What does that mean?",
        options: ["Recently changed", "Removed, but its configuration files remain", "Reinstall required", "Running and configured"],
        answer: 1,
        why: "r is the desired state removed and c means config files are still installed; purge clears them.",
      },
      {
        q: "Why is Signed-By with a key in /etc/apt/keyrings safer than the old apt-key add?",
        options: ["It downloads faster", "It encrypts the packages", "The key is trusted only for that one source, not for all repositories", "It disables unsigned repositories"],
        answer: 2,
        why: "apt-key put keys in a global keyring trusted for every source.",
      },
      {
        q: "Which command should a shell script use instead of apt for installing packages?",
        options: ["apt-get install -y", "dpkg --install-all", "apt-cache install", "apt-key install"],
        answer: 0,
        why: "apt-get has a stable interface for scripts; apt's output may change between releases.",
      },
      {
        q: "You run apt install nginx right after building a new VM and get 404 Not Found errors. What is the most likely fix?",
        options: ["Reboot the VM", "Use dpkg -i nginx", "Purge nginx first", "Run apt update first"],
        answer: 3,
        why: "Stale indexes point at package versions that the mirror no longer has.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install the tree package, list the files it installed, and find which package owns /usr/bin/tree.",
        hint: "dpkg -L lists files; dpkg -S searches by path.",
        solution: "sudo apt update\nsudo apt install -y tree\ndpkg -L tree\ndpkg -S /usr/bin/tree      # tree: /usr/bin/tree",
      },
      {
        level: "medium",
        task: "Install nginx, stop it from being upgraded, confirm the hold, then remove the hold and fully purge nginx including its config files.",
        hint: "apt-mark hold, apt-mark showhold, then apt purge and autoremove.",
        solution: "sudo apt install -y nginx\nsudo apt-mark hold nginx\napt-mark showhold            # nginx\nsudo apt-mark unhold nginx\nsudo apt purge -y nginx\nsudo apt autoremove -y\ndpkg -l | grep nginx         # nothing, or only other packages",
      },
      {
        level: "hard",
        task: "Using only the apt logs, list every package that the most recent apt command installed or upgraded, one per line.",
        hint: "history.log groups each command in a block that starts with Start-Date; Install: and Upgrade: lines list packages separated by commas.",
        solution: "awk '/^Start-Date/ {blk=\"\"} {blk = blk $0 \"\\n\"} END {printf \"%s\", blk}' /var/log/apt/history.log \\\n  | grep -E '^(Install|Upgrade):' \\\n  | sed -E 's/^[A-Za-z]+: //; s/\\), /)\\n/g'\n# nginx:amd64 (1.24.0-2ubuntu7.1)\n# curl:amd64 (8.5.0-2ubuntu10.4, 8.5.0-2ubuntu10.5)   <- upgrade: old, new",
      },
    ],
    faq: [
      { q: "Should I use apt or apt-get?", a: "Use apt when typing commands yourself. Use apt-get and apt-cache in scripts, because their output format is kept stable." },
      { q: "Does apt upgrade install a new Ubuntu release?", a: "No. It only updates packages within your current release. Moving to a new release is done with do-release-upgrade." },
      { q: "What is a PPA and is it safe?", a: "A PPA is a third-party repository hosted on Launchpad. It is as safe as the person who maintains it, so only add PPAs you have a good reason to trust." },
      { q: "How do I see which updates are waiting?", a: "Run sudo apt update and then apt list --upgradable." },
    ],
  },
};

export default extra;
