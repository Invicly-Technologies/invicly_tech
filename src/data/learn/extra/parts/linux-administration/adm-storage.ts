import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "adm-storage/partitions": {
    plain: [
      "A new disk is like an empty warehouse floor. Before you store anything, you usually paint lines on the floor to mark separate areas. Those areas are partitions, and the small map that says where each area starts and ends is the partition table.",
      "Linux shows every disk as a file in /dev. A SATA or SCSI disk is /dev/sda, a virtual disk in KVM is often /dev/vda, and an NVMe disk is /dev/nvme0n1. Partitions add a number: /dev/sda1, /dev/vdb2, or /dev/nvme0n1p1 (NVMe puts a p before the number).",
      "There are two kinds of partition table. MBR is the old one from the 1980s. GPT is the modern one and is what you should use on new disks. Tools like fdisk, gdisk and parted write the table, and lsblk shows you the result.",
      "Partitioning is one of the few admin tasks where a typo can wipe real data in a second. So the habit to build is simple: look first with lsblk, check the size and the device name twice, and only then write.",
    ],
    deepDive: [
      {
        heading: "What is actually written on the disk",
        body: "An MBR disk keeps everything in the very first 512-byte sector: boot code, a 64-byte table with room for four 16-byte entries, and the signature 55 AA. Each entry stores a start sector and a length as 32-bit numbers, which is where the 2 TiB limit comes from on disks with 512-byte sectors. To get more than four partitions, one entry becomes an extended partition that holds logical partitions, numbered from 5.\n\nGPT starts with a protective MBR in sector 0 so old tools see the disk as in use. Sector 1 holds the GPT header, followed by the partition entries (128 entries of 128 bytes by default). A full copy of the header and entries sits at the end of the disk, and both carry CRC32 checksums, so damage to one copy can be detected and repaired from the other.",
        bullets: ["Every GPT partition has its own unique PARTUUID", "Type GUIDs mark a partition as Linux data, LVM, swap or EFI", "gdisk can rebuild a damaged main table from the backup"],
        visual: {
          type: "layers",
          title: "Layout of a GPT disk, start to end",
          layers: [
            { label: "Sector 0: protective MBR", detail: "Tells old tools the whole disk is in use" },
            { label: "Sector 1: GPT header", detail: "Disk GUID, table location, checksums" },
            { label: "Partition entries", detail: "128 slots of 128 bytes each by default" },
            { label: "Partitions", detail: "Usually start at 1 MiB for alignment" },
            { label: "Backup entries and header", detail: "Last sectors of the disk" },
          ],
        },
      },
      {
        heading: "Reading lsblk and blkid properly",
        body: "lsblk reads information the kernel already has, so it is safe and needs no root. The TYPE column tells disks, partitions, LVM volumes (lvm) and optical drives (rom) apart. RM marks removable devices and RO read-only ones. lsblk -f adds FSTYPE, LABEL, UUID and the mount points, and lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS lets you pick columns.\n\nblkid looks at the content of each device and prints signatures it finds: TYPE (xfs, ext4, swap, LVM2_member), UUID, LABEL and, for GPT partitions, PARTUUID and PARTLABEL. The same IDs appear as symbolic links under /dev/disk/by-uuid, /dev/disk/by-partuuid and /dev/disk/by-id. Those links stay stable when sda and sdb swap names between boots, which happens more often than people expect on servers with several controllers.",
        bullets: ["lsblk -d lists whole disks only", "lsblk -p prints full /dev paths", "ls -l /dev/disk/by-id maps serial numbers to device names"],
      },
      {
        heading: "fdisk, gdisk and parted: which and when",
        body: "fdisk from util-linux handles both MBR and GPT today. It is interactive and nothing touches the disk until you press w, so q is always a safe way out. Key letters: g creates a new empty GPT table, o a new MBR table, n adds a partition, t changes its type, p prints, w writes. Sizes can be typed as +2G.\n\ngdisk is GPT only and uses two-to-four digit type codes such as 8300 (Linux filesystem), 8e00 (Linux LVM) and 8200 (swap). parted works on both tables and accepts the whole job on one command line, which makes it the easiest choice for scripts. Be careful: parted applies each command immediately, with no final write step.\n\nAlways leave the first 1 MiB free. Starting partitions at 1 MiB (sector 2048) keeps them aligned to the internal block sizes of SSDs and RAID arrays; all three tools do this by default.",
      },
      {
        heading: "Telling the kernel, and cleaning up",
        body: "Writing a new table changes the disk, but the kernel keeps its own in-memory copy. If a partition on that disk is in use, fdisk may warn that re-reading failed. partprobe /dev/vdb (from the parted package) or partx -u /dev/vdb asks the kernel to load the new layout, and udevadm settle waits until udev has created the /dev entries. If the disk holds your root file system, a reboot may be the only safe way.\n\nTo reuse a disk that held something before, remove old signatures first with wipefs. wipefs /dev/vdb lists them and wipefs -a /dev/vdb erases them, including old RAID or LVM labels that would otherwise confuse tools later. Before you change a working disk, save its table: sfdisk -d /dev/vdb > vdb.table can be restored with sfdisk /dev/vdb < vdb.table.",
        bullets: ["partprobe or partx -u: reload partitions", "udevadm settle: wait for device links", "wipefs -a: erase old signatures", "sfdisk -d: back up the table as text"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "How Linux names disks and partitions",
        root: "/dev",
        children: [
          { label: "SATA, SAS, USB, SCSI", children: ["/dev/sda is the first disk", "/dev/sda1 is its first partition"] },
          { label: "KVM virtio disks", children: ["/dev/vda, /dev/vdb", "/dev/vdb1, /dev/vdb2"] },
          { label: "NVMe", children: ["/dev/nvme0n1: controller 0, namespace 1", "/dev/nvme0n1p1: partition 1"] },
          { label: "Stable names", children: ["/dev/disk/by-id (model and serial)", "/dev/disk/by-uuid", "/dev/disk/by-partuuid"] },
        ],
      },
      {
        type: "flow",
        title: "Safe routine for partitioning a new disk",
        steps: [
          { label: "Identify", detail: "lsblk -f: right size, no mount points" },
          { label: "Wipe old labels", detail: "wipefs -a only if it is truly unused" },
          { label: "Create table", detail: "GPT with fdisk g or parted mklabel gpt" },
          { label: "Add partitions", detail: "Set sizes and types" },
          { label: "Reload", detail: "partprobe, then udevadm settle" },
          { label: "Verify", detail: "lsblk and blkid show the new layout" },
        ],
      },
    ],
    examples: [
      {
        title: "Two partitions with fdisk, step by step",
        explanation: "A new 10 GiB disk /dev/vdb needs a 4 GiB Linux partition and a 2 GiB swap partition. Step 1: confirm with lsblk that vdb has no partitions and no mount points. Step 2: open fdisk and press g for a GPT table. Step 3: n, accept number 1 and the default first sector, then type +4G. Step 4: n again for partition 2 with +2G, then t, choose partition 2 and enter the swap type (type L to list the names if you are unsure). Step 5: p to review, then w to write. Step 6: reload and check.",
        code: {
          lang: "bash",
          code: "lsblk /dev/vdb\nsudo fdisk /dev/vdb\n# g          new GPT table\n# n, 1, Enter, +4G\n# n, 2, Enter, +2G\n# t, 2, swap\n# p          review\n# w          write and exit\nsudo partprobe /dev/vdb && sudo udevadm settle\nlsblk -o NAME,SIZE,TYPE,PARTTYPENAME /dev/vdb",
        },
      },
      {
        title: "Back up a partition table and copy it to a twin disk",
        explanation: "You are building a mirror and need /dev/vdc partitioned exactly like /dev/vdb. Step 1: dump the table of vdb as text with sfdisk -d and keep the file as a backup too. Step 2: feed the dump to vdc. Because GPT IDs must be unique, step 3 gives vdc a fresh disk GUID and new partition GUIDs with sgdisk -G (from the gdisk package). Step 4: reload and compare both disks.",
        code: {
          lang: "bash",
          code: "sudo sfdisk -d /dev/vdb > vdb.table\nsudo sfdisk /dev/vdc < vdb.table\nsudo sgdisk -G /dev/vdc\nsudo partprobe /dev/vdc\nlsblk -o NAME,SIZE,PARTTYPENAME,PARTUUID /dev/vdb /dev/vdc",
        },
      },
    ],
    cheatSheet: [
      "lsblk -f shows devices, partitions, file system types, UUIDs and mount points",
      "sudo blkid /dev/vdb1 prints TYPE, UUID, PARTUUID and LABEL of one device",
      "fdisk keys: g new GPT, o new MBR, n new, t type, p print, w write, q quit without saving",
      "sudo parted /dev/vdb print free shows the table and the unused gaps",
      "sudo partprobe /dev/vdb or sudo partx -u /dev/vdb makes the kernel re-read partitions",
      "sudo wipefs -a /dev/vdb erases old file system, RAID and LVM signatures",
      "sudo sfdisk -d /dev/vdb > vdb.table saves the partition table as text",
      "MBR: max 2 TiB and 4 primary partitions; GPT: 128 partitions by default, needed for UEFI boot",
    ],
    quiz: [
      {
        q: "Where does GPT keep its backup copy of the partition table?",
        options: ["In sector 0", "In /etc/fstab", "At the end of the disk", "In the EFI System Partition"],
        answer: 2,
        why: "GPT writes a backup header and entry array in the last sectors of the disk.",
      },
      {
        q: "You type n, set sizes and type in fdisk, then press q. What happens to the disk?",
        options: ["Nothing; fdisk only writes when you press w", "The new partitions are saved", "The disk is wiped", "Only the first partition is saved"],
        answer: 0,
        why: "fdisk keeps changes in memory until w, so q quits without touching the disk.",
      },
      {
        q: "Which name is the second partition on the first NVMe disk?",
        options: ["/dev/nvme0n2", "/dev/nvme1n1", "/dev/nvme02", "/dev/nvme0n1p2"],
        answer: 3,
        why: "NVMe disks are nvme(controller)n(namespace), and partitions add p plus the number.",
      },
      {
        q: "Why do partitioning tools start the first partition at 1 MiB?",
        options: ["MBR cannot address the first megabyte", "Alignment with SSD and RAID block sizes avoids slow split writes", "The kernel reserves it for swap", "It stores the file system journal"],
        answer: 1,
        why: "A 1 MiB start is a multiple of all common physical block and stripe sizes.",
      },
      {
        q: "fdisk wrote a new table but lsblk still shows the old partitions. What should you try first?",
        options: ["Run partprobe on that disk", "Run mkfs on the disk", "Edit /etc/fstab", "Run fsck on the disk"],
        answer: 0,
        why: "partprobe asks the kernel to re-read the partition table it has cached.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List only the whole disks on your machine with their size, model and whether they are rotational (HDD) or not (SSD).",
        hint: "lsblk can hide partitions with -d and choose columns with -o.",
        solution: "lsblk -d -o NAME,SIZE,MODEL,ROTA,TYPE\n# ROTA 1 = spinning disk, 0 = SSD or NVMe",
      },
      {
        level: "medium",
        task: "On a spare disk /dev/vdb, create a GPT table with one 1 GiB partition named data and one LVM partition using the rest, all in one non-interactive parted command.",
        hint: "parted -s runs without questions; use 100% for the end of the disk and set N lvm on for the flag.",
        solution: "sudo parted -s /dev/vdb mklabel gpt \\\n  mkpart data 1MiB 1GiB \\\n  mkpart lvm 1GiB 100% \\\n  set 2 lvm on\nsudo partprobe /dev/vdb\nsudo parted /dev/vdb print",
      },
      {
        level: "hard",
        task: "Write a small script that refuses to partition a disk if any of its partitions are mounted or it is not exactly the size you expect, and otherwise creates a single GPT partition.",
        hint: "lsblk -n -o MOUNTPOINTS lists mount points; lsblk -b -d -n -o SIZE gives bytes.",
        solution: "#!/bin/bash\nset -euo pipefail\ndisk=$1; want=$2   # e.g. /dev/vdb 10737418240\n[ \"$(lsblk -b -d -n -o SIZE \"$disk\")\" = \"$want\" ] || { echo \"size mismatch\"; exit 1; }\nif lsblk -n -o MOUNTPOINTS \"$disk\" | grep -q .; then echo \"in use\"; exit 1; fi\nparted -s \"$disk\" mklabel gpt mkpart data 1MiB 100%\npartprobe \"$disk\" && udevadm settle\nlsblk \"$disk\"",
      },
    ],
    faq: [
      { q: "Should I use MBR or GPT for a new disk?", a: "Use GPT unless an old BIOS-only system or tool forces MBR. GPT has no 2 TiB limit, allows many partitions and keeps a backup table." },
      { q: "Do I need partitions at all if I use LVM?", a: "No. pvcreate works on a whole disk such as /dev/vdc. Many admins still add one partition of type Linux LVM so that other tools clearly see the disk is in use." },
      { q: "Is fdisk safe to use on a disk with data?", a: "It is safe to look: fdisk -l and p only print. Changes are kept in memory until you press w, but deleting or moving a partition that holds data and then writing will lose that data." },
      { q: "What is the EFI System Partition?", a: "A small FAT32 partition, usually mounted at /boot/efi, that UEFI firmware reads boot loaders from. You need one on the boot disk of any UEFI machine." },
    ],
  },

  "adm-storage/filesystems": {
    plain: [
      "A partition is just a long row of empty blocks. A file system is the system of shelves, labels and an index that turns those blocks into files and folders you can name, open and search.",
      "Linux has many file systems, but on servers you mostly meet two. xfs is the default on RHEL, Rocky and Alma. ext4 is the default on Ubuntu and Debian. Both are journaling file systems: they write a short note of what they are about to change before they change it, so after a power cut the system can tidy up in seconds instead of checking the whole disk.",
      "You create a file system with mkfs, give it a readable name with a label, and refer to it by its UUID, a long unique ID that stays the same even if the disk gets a different /dev name.",
      "Disks fill up, so you will also measure space (df and du) and grow file systems when you give them more room. Growing is easy and usually safe while the file system is in use. Shrinking is harder, and xfs cannot shrink at all.",
    ],
    deepDive: [
      {
        heading: "Inodes, blocks and the journal",
        body: "A file system splits space into blocks, usually 4 KiB each. Every file also has an inode: a small record that holds its owner, permissions, timestamps, size and the list of blocks with its data. The file name is not in the inode; it lives in the directory, which is just a table of names pointing to inode numbers. That is why a hard link is simply a second name for the same inode.\n\next4 creates all its inodes when you run mkfs, by default one per 16 KiB of space, so millions of tiny files can use them all up while space remains. xfs allocates inodes as needed, so this is much rarer there.\n\nThe journal records metadata changes before they are applied. ext4's default mode, data=ordered, writes file data before committing the metadata that points to it, which avoids exposing stale data after a crash.",
        bullets: ["ls -i shows inode numbers", "df -i shows inode use per file system", "stat file shows size, blocks and inode"],
      },
      {
        heading: "mkfs options worth knowing",
        body: "mkfs.xfs and mkfs.ext4 pick good defaults, so most of the time you only add a label: -L data. A few options change real behaviour. For ext4, -N or -i sets how many inodes you get, useful for mail spools or caches with millions of small files. -m sets the reserved space for root, 5% by default; on a 2 TB data disk that is 100 GB, so many admins lower it with tune2fs -m 1 on non-system volumes.\n\nmkfs.xfs refuses to overwrite a device that already holds a file system unless you add -f. mkfs.ext4 asks before doing so. Treat both warnings as a last chance to check the device name.\n\nLabel limits differ: ext4 labels can be up to 16 characters, xfs labels up to 12.",
        bullets: ["mkfs.ext4 -L logs -m 1 /dev/vdb1", "mkfs.xfs -f -L data /dev/vdb2", "tune2fs -l /dev/vdb1 shows ext4 settings", "xfs_info /mountpoint shows xfs settings"],
      },
      {
        heading: "Labels and UUIDs after the fact",
        body: "You can change a label later. On ext4, e2label /dev/vdb1 newname works even while it is mounted. On xfs, xfs_admin -L newname /dev/vdb2 needs the file system unmounted. Check the result with blkid or lsblk -f.\n\nUUIDs cause a classic problem when you clone a disk or restore a VM snapshot next to its original: two file systems now share one UUID. xfs refuses to mount the second one and logs a duplicate UUID error. You can mount it once with -o nouuid, or give it a new UUID with xfs_admin -U generate on the unmounted device. For ext4 the command is tune2fs -U random. Remember to update /etc/fstab if it refers to the old UUID.",
      },
      {
        heading: "Growing, checking and repairing",
        body: "Growing is a two-step job: first make the device bigger (lvextend, or a larger partition), then tell the file system. xfs_growfs takes the mount point and works only while mounted. resize2fs takes the device and can grow ext4 online. Run without a size, both fill the whole device. lvextend -r does both steps for you.\n\nShrinking only works for ext4, and only unmounted: e2fsck -f first, then resize2fs to the smaller size, then shrink the device. Get the order wrong and you cut off live data.\n\nRepairs also need the file system unmounted. e2fsck -f /dev/vdb1 checks ext4, and xfs_repair /dev/vdb2 repairs xfs; xfs_repair -n checks without changing anything. The fsck.xfs program does nothing on purpose, because xfs replays its journal at mount time instead.",
        visual: {
          type: "compare",
          title: "Changing size: ext4 vs xfs",
          columns: [
            { title: "ext4", points: ["Grow online: resize2fs /dev/vg/lv", "Shrink offline: e2fsck -f, then resize2fs", "Check: e2fsck -f (unmounted)", "Reserved root space: tune2fs -m"] },
            { title: "xfs", points: ["Grow online: xfs_growfs /mountpoint", "Shrink: not possible; back up and recreate", "Check: xfs_repair -n (unmounted)", "Journal replays at mount time"] },
          ],
        },
      },
      {
        heading: "Why df and du disagree",
        body: "df asks the file system how many blocks are used in total. du walks the directory tree and adds up the files it can see. They often differ, and the reasons are useful to know. Files deleted while a process still has them open still use space but have no name, so du cannot find them; lsof +L1 lists them. Files hidden under a mount point (written to /data before a disk was mounted there) are invisible to du but count in df for the parent file system. Reserved root blocks on ext4 show as used in df's percentage.\n\ndu also counts real blocks by default, so a sparse file such as a VM image may show 2 GB with du but 50 GB with du --apparent-size or ls -l.",
        bullets: ["df -hT adds the file system type column", "du -xsh /var stays on one file system", "du -h --max-depth=1 /var | sort -h finds the biggest folder"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What a file system stores for one file",
        root: "/srv/report.pdf",
        children: [
          { label: "Directory entry", children: ["Name report.pdf", "Points to inode 1342"] },
          { label: "Inode 1342", children: ["Owner, group, mode", "Size and timestamps", "Link count", "Pointers to data blocks"] },
          { label: "Data blocks", children: ["4 KiB each", "The actual file content"] },
          { label: "Journal", children: ["Records metadata changes first", "Replayed after a crash"] },
        ],
      },
    ],
    examples: [
      {
        title: "The disk is not full, but writes fail",
        explanation: "An app that stores session files in /var/cache/app reports No space left on device, yet df -h shows 40% used. Step 1: run df -i and see the file system is at 100% inodes. Step 2: find which directory holds the most files by counting entries. Step 3: clean the old files. Step 4: for the long term, put the cache on its own ext4 volume created with more inodes, or on xfs, which allocates inodes as needed.",
        code: {
          lang: "bash",
          code: "df -h /var; df -i /var\nsudo find /var -xdev -type f | cut -d/ -f2-4 | sort | uniq -c | sort -n | tail -5\nsudo find /var/cache/app -type f -mtime +7 -delete\ndf -i /var\n# new ext4 volume with one inode per 4 KiB instead of 16 KiB:\nsudo mkfs.ext4 -L appcache -i 4096 /dev/vgdata/lvcache",
        },
      },
      {
        title: "A cloned VM disk will not mount",
        explanation: "You attached a copy of a VM disk to the original VM to recover a file. mount /dev/vdc1 /mnt fails, and the kernel log mentions a duplicate UUID. Step 1: confirm with blkid that vdc1 has the same UUID as a mounted file system. Step 2: for a quick one-time look, mount read-only with nouuid. Step 3: if you want to keep the copy attached, unmount it and give it a new UUID.",
        code: {
          lang: "bash",
          code: "sudo blkid /dev/vda1 /dev/vdc1\nsudo dmesg | tail -3\nsudo mount -o ro,nouuid /dev/vdc1 /mnt\nsudo cp /mnt/etc/app.conf /root/recovered.conf\nsudo umount /mnt\nsudo xfs_admin -U generate /dev/vdc1\nsudo blkid /dev/vdc1",
        },
      },
    ],
    cheatSheet: [
      "mkfs.xfs -L data /dev/vdb1 creates xfs; add -f to overwrite an old file system",
      "mkfs.ext4 -L logs /dev/vdb2 creates ext4; -i 4096 gives more inodes for many small files",
      "xfs_growfs /mountpoint grows mounted xfs; resize2fs /dev/device grows ext4",
      "df -hT shows space and type; df -i shows inodes",
      "e2label (ext4, max 16 chars) and xfs_admin -L (xfs, max 12 chars, unmounted) set labels",
      "tune2fs -m 1 /dev/vdb2 lowers ext4 reserved root space from 5% to 1%",
      "xfs_repair -n /dev/vdb1 checks xfs without changes; e2fsck -f checks ext4 (both unmounted)",
      "sudo lsof +L1 finds deleted files that still hold disk space",
    ],
    quiz: [
      {
        q: "Which command grows a mounted xfs file system after its LV was extended?",
        options: ["resize2fs /dev/vgdata/lvweb", "xfs_growfs /srv/web", "xfs_repair /dev/vgdata/lvweb", "mkfs.xfs -f /dev/vgdata/lvweb"],
        answer: 1,
        why: "xfs_growfs takes the mount point and grows the file system online.",
      },
      {
        q: "df -h shows 30% used but writes fail with No space left on device. What do you check next?",
        options: ["free -h", "lsblk -f", "The journal size", "df -i"],
        answer: 3,
        why: "Running out of inodes gives the same error even when blocks are free.",
      },
      {
        q: "You need to shrink a file system from 20 GiB to 10 GiB. Which statement is true?",
        options: ["ext4 can be shrunk offline; xfs cannot be shrunk", "Both can be shrunk online", "xfs can shrink, ext4 cannot", "Neither can ever be shrunk"],
        answer: 0,
        why: "resize2fs shrinks an unmounted ext4 file system, while xfs only grows.",
      },
      {
        q: "Where is a file's name stored?",
        options: ["In its inode", "In the journal", "In the directory that contains it", "In the superblock"],
        answer: 2,
        why: "Directories map names to inode numbers; the inode holds metadata but no name.",
      },
      {
        q: "Why does fsck.xfs do nothing when run at boot?",
        options: ["xfs has no metadata", "xfs replays its journal at mount time, and real repairs use xfs_repair", "xfs is always read-only at boot", "It needs the -f flag to run"],
        answer: 1,
        why: "The xfs design handles crash recovery at mount; xfs_repair is the separate repair tool.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the type, label and UUID of every file system on your machine, and the total and free inodes of the root file system.",
        hint: "One lsblk option and one df option.",
        solution: "lsblk -f\ndf -i /",
      },
      {
        level: "medium",
        task: "Create a 200 MiB test file, turn it into an ext4 file system through a loop device, label it test, mount it, and fill it with 10,000 empty files. Then check inode use.",
        hint: "losetup --find --show attaches a file as a block device.",
        solution: "truncate -s 200M /tmp/fs.img\ndev=$(sudo losetup --find --show /tmp/fs.img)\nsudo mkfs.ext4 -q -L test \"$dev\"\nsudo mkdir -p /mnt/test && sudo mount \"$dev\" /mnt/test\nsudo bash -c 'for i in $(seq 10000); do : > /mnt/test/f$i; done'\ndf -i /mnt/test\nsudo umount /mnt/test && sudo losetup -d \"$dev\"",
      },
      {
        level: "hard",
        task: "Shrink an unmounted ext4 file system on /dev/vgdata/lvold from 2 GiB to 1 GiB safely, including the logical volume.",
        hint: "Check, shrink the file system first, then the LV. lvreduce -r can do both, but know the manual order.",
        solution: "sudo umount /dev/vgdata/lvold\nsudo e2fsck -f /dev/vgdata/lvold\nsudo resize2fs /dev/vgdata/lvold 1G\nsudo lvreduce -L 1G /dev/vgdata/lvold\nsudo e2fsck -f /dev/vgdata/lvold\n# shortcut that does the same: sudo lvreduce -r -L 1G /dev/vgdata/lvold",
      },
    ],
    faq: [
      { q: "Should I choose xfs or ext4?", a: "Use your distribution's default unless you have a reason not to: xfs on RHEL family, ext4 on Ubuntu and Debian. Pick ext4 if you may need to shrink the volume later, since xfs cannot shrink." },
      { q: "What does No space left on device mean if df shows free space?", a: "Usually the file system has run out of inodes; check df -i. It can also come from a full quota or a deleted file still held open." },
      { q: "Do I need to run fsck regularly?", a: "No. Both ext4 and xfs recover from crashes using their journal. Run e2fsck or xfs_repair on an unmounted file system only when the kernel reports corruption." },
      { q: "Can I format a disk while it is mounted?", a: "No, and you should never try. Unmount it first; mkfs on a mounted device is refused or leads to data loss." },
    ],
  },

  "adm-storage/mounting-swap": {
    plain: [
      "On Linux, a disk is not a separate drive letter. You attach it to a folder, and from then on that folder shows what is on the disk. This attaching is called mounting, and the folder is the mount point.",
      "A mount you type by hand is forgotten at the next reboot. To make it permanent, you add one line to /etc/fstab, the file systems table that Linux reads at every boot. One wrong line there can stop the server from booting normally, so you always test it before rebooting.",
      "Swap is disk space the kernel uses as overflow when RAM is full. It is much slower than RAM, so it is a safety net, not extra memory. It lets the kernel move rarely used pages out of the way and stops some programs from being killed when memory runs low.",
      "These tasks show up everywhere: adding a data disk to a database server, mounting a share for backups, or adding a swap file to a small cloud VM that keeps running out of memory.",
    ],
    deepDive: [
      {
        heading: "The six fields of an fstab line",
        body: "Each fstab line has six fields separated by spaces. 1: what to mount, best written as UUID=... or LABEL=... rather than /dev/vdb1. 2: where, the mount point (none for swap). 3: the type, such as xfs, ext4, swap or nfs. 4: options, comma-separated with no spaces, or defaults. 5: dump, an old backup flag that is almost always 0. 6: fsck order: 1 for the root file system, 2 for other ext4 file systems, 0 to skip; xfs and swap use 0.\n\nCommon options: ro for read-only, noatime to skip access-time updates, nosuid, nodev and noexec to harden folders like /tmp, nofail so a missing disk does not block boot, and _netdev for network storage. Lines are processed in order, so a parent mount must come before mounts inside it.",
        bullets: ["UUID=3f1c... /data xfs defaults,noatime 0 0", "UUID=8a2e... none swap defaults 0 0", "findmnt --verify checks fstab for errors"],
      },
      {
        heading: "How systemd turns fstab into mounts",
        body: "At boot, and whenever you run systemctl daemon-reload, a small program called systemd-fstab-generator reads /etc/fstab and creates a mount unit for each line. /data becomes data.mount and /srv/web becomes srv-web.mount. systemd then mounts them in the right order and in parallel where it can.\n\nThis explains two things. First, after editing fstab you should run systemctl daemon-reload, or systemd may act on the old version. Second, if a required mount fails, local-fs.target fails and the system drops into emergency mode, asking for the root password. That is what nofail prevents for non-critical disks. You can also add x-systemd.automount to mount a file system only when it is first accessed, which helps for slow or optional storage.",
        visual: {
          type: "flow",
          title: "From an fstab line to a mounted disk at boot",
          steps: [
            { label: "/etc/fstab line", detail: "UUID=... /data xfs defaults 0 0" },
            { label: "fstab generator", detail: "Creates data.mount at boot or daemon-reload" },
            { label: "Wait for device", detail: "udev reports the UUID is present" },
            { label: "Mount", detail: "systemd runs mount for data.mount" },
            { label: "local-fs.target", detail: "Reached when all local mounts succeed" },
          ],
        },
      },
      {
        heading: "When umount says target is busy",
        body: "You cannot unmount a file system while any process uses it: a shell whose current directory is inside it, an open log file, or a running program loaded from it. The first suspect is often your own shell, so cd / first.\n\nTo find the others, fuser -vm /data lists every process using that mount with its PID and user, and lsof /data gives similar output with file names. Stop the service cleanly, then unmount. fuser -km /data kills them all, which is quick but rough.\n\numount -l (lazy) detaches the mount point at once and cleans up when the last user lets go. It is handy for a stuck network mount, but the processes keep using the old file system, so do not then format or remove the device. To change options without unmounting, use mount -o remount,ro /data.",
        bullets: ["cd / before you unmount", "fuser -vm /data or lsof /data shows users", "mount -o remount,rw / makes root writable in emergency mode"],
      },
      {
        heading: "Swap partitions, swap files and swappiness",
        body: "Swap can be a partition or a plain file. A file is easier on a VM with no spare disk. Create it with dd or fallocate, set mode 600 so only root can read it, run mkswap, then swapon. dd writing real zeros works on every file system; fallocate is faster and supported on ext4 and xfs.\n\nWith several swap areas, pri= in the options sets priority, and higher numbers are used first. swapon --show and free -h show what is active. swapoff /swapfile moves pages back into RAM, which needs enough free memory.\n\nvm.swappiness (default 60) tells the kernel how willing it is to swap out application memory compared with dropping file cache. Lower values such as 10 are common on database servers. Set it at runtime with sysctl vm.swappiness=10 and persistently in a file under /etc/sysctl.d/.",
        bullets: ["free -h: memory and swap totals", "swapon --show: active swap areas", "cat /proc/sys/vm/swappiness: current value"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Unmounting a busy file system",
        actors: ["Admin", "Kernel", "app process"],
        messages: [
          { from: 0, to: 1, label: "umount /data" },
          { from: 1, to: 0, label: "target is busy" },
          { from: 0, to: 1, label: "fuser -vm /data" },
          { from: 1, to: 0, label: "PID 2311 (app) has files open" },
          { from: 0, to: 2, label: "systemctl stop app" },
          { from: 0, to: 1, label: "umount /data succeeds" },
        ],
      },
    ],
    examples: [
      {
        title: "Add a 2 GiB swap file to a small VM",
        explanation: "A 1 GiB cloud VM keeps getting processes killed by the out-of-memory killer during package updates. Step 1: check there is no swap yet and enough free disk. Step 2: create a 2 GiB file with dd and lock it down to mode 600. Step 3: format it as swap and turn it on. Step 4: add it to fstab so it returns after a reboot, then confirm.",
        code: {
          lang: "bash",
          code: "swapon --show; df -h /\nsudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress\nsudo chmod 600 /swapfile\nsudo mkswap /swapfile\nsudo swapon /swapfile\necho '/swapfile none swap defaults 0 0' | sudo tee -a /etc/fstab\nsudo swapoff /swapfile && sudo swapon -a\nswapon --show; free -h",
        },
      },
      {
        title: "Catch a bad fstab line before it breaks the boot",
        explanation: "You added a mount for a new disk, but typed the UUID wrong. Step 1: run findmnt --verify, which checks every line and reports that the source cannot be found. Step 2: copy the UUID from blkid instead of typing it. Step 3: reload systemd and run mount -a; no output means success. Step 4: optional safety for a non-critical disk: add nofail so even a dead disk will not stop the boot.",
        code: {
          lang: "bash",
          code: "sudo findmnt --verify\n#   [W] UUID=1234-bad does not exist\nsudo blkid -s UUID -o value /dev/vdb1\nsudoedit /etc/fstab\n#   UUID=<real-uuid> /backup xfs defaults,nofail 0 0\nsudo systemctl daemon-reload\nsudo mount -a && findmnt /backup",
        },
      },
    ],
    cheatSheet: [
      "fstab fields: source, mount point, type, options, dump (0), fsck order (0 for xfs and swap)",
      "sudo findmnt --verify checks /etc/fstab before you reboot",
      "sudo systemctl daemon-reload && sudo mount -a applies new fstab lines",
      "findmnt /data shows source, type and options of one mount",
      "sudo fuser -vm /data lists processes that keep a mount busy",
      "sudo mount -o remount,ro /data changes options without unmounting",
      "Swap file: dd, chmod 600, mkswap, swapon, then add a line to fstab",
      "sysctl vm.swappiness=10 makes the kernel swap less (default is 60)",
    ],
    quiz: [
      {
        q: "What does the nofail option do in /etc/fstab?",
        options: ["Retries the mount forever", "Mounts the file system read-only", "Lets boot continue if the device is missing", "Skips the fsck check"],
        answer: 2,
        why: "Without nofail a missing required mount fails local-fs.target and drops into emergency mode.",
      },
      {
        q: "Which fsck order value should an xfs data disk use in field 6?",
        options: ["0", "1", "2", "3"],
        answer: 0,
        why: "xfs does not use boot-time fsck, so the field is 0; 1 is for an ext4 root.",
      },
      {
        q: "umount /data says target is busy. What is the best next step?",
        options: ["Reboot the server", "Run mkfs on the device", "Delete the mount point folder", "Run fuser -vm /data to see which processes use it"],
        answer: 3,
        why: "Finding and stopping the processes is the clean way to free the mount.",
      },
      {
        q: "Why should you run systemctl daemon-reload after editing fstab?",
        options: ["It formats new disks", "systemd regenerates its mount units from fstab", "It enables swap", "It checks fstab syntax"],
        answer: 1,
        why: "The fstab generator turns each line into a mount unit when systemd reloads.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List all real (non-virtual) mounted file systems with their source, type and options.",
        hint: "findmnt can filter by type with -t.",
        solution: "findmnt -t xfs,ext4,vfat,nfs,nfs4\n# or: findmnt --real",
      },
      {
        level: "medium",
        task: "Mount /dev/vdb1 at /data persistently by UUID with noatime, make sure a missing disk will not block boot, and prove it works without rebooting.",
        hint: "Get the UUID with blkid; test with daemon-reload and mount -a.",
        solution: "sudo mkdir -p /data\nu=$(sudo blkid -s UUID -o value /dev/vdb1)\necho \"UUID=$u /data xfs defaults,noatime,nofail 0 0\" | sudo tee -a /etc/fstab\nsudo findmnt --verify\nsudo systemctl daemon-reload && sudo mount -a\nfindmnt -o TARGET,SOURCE,OPTIONS /data",
      },
      {
        level: "hard",
        task: "Remove a swap partition /dev/vdb3 completely and replace it with a 1 GiB swap file of higher priority, all without a reboot.",
        hint: "swapoff the old one, remove its fstab line, and use pri= for the new one.",
        solution: "sudo swapoff /dev/vdb3\nsudo blkid -s UUID -o value /dev/vdb3   # note the UUID\nsudoedit /etc/fstab                      # delete the line with that UUID or /dev/vdb3\nsudo dd if=/dev/zero of=/swapfile bs=1M count=1024\nsudo chmod 600 /swapfile && sudo mkswap /swapfile\necho '/swapfile none swap defaults,pri=10 0 0' | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload && sudo swapon -a\nswapon --show",
      },
    ],
    faq: [
      { q: "How much swap do I need?", a: "There is no single rule. A few GiB is common for servers; it is a buffer, not extra RAM. If you need to hibernate, swap must be at least as large as RAM." },
      { q: "My server boots into emergency mode after I edited fstab. How do I fix it?", a: "Log in with the root password, run mount -o remount,rw / so you can edit, fix or comment out the bad line in /etc/fstab, then run systemctl daemon-reload and reboot." },
      { q: "Is a swap file slower than a swap partition?", a: "On modern kernels with ext4 or xfs the difference is negligible. Swap files are simply easier to add and resize." },
      { q: "What is the difference between mount and findmnt?", a: "Both can show mounts, but findmnt prints a clear tree with chosen columns and can verify fstab. mount is mainly used to attach file systems." },
    ],
  },

  "adm-storage/lvm": {
    plain: [
      "Normal partitions are like walls built in concrete. Once the room sizes are set, changing them means a big rebuild. LVM, the Logical Volume Manager, gives you movable walls instead.",
      "You hand LVM one or more disks. It pools all their space into one big bucket called a volume group. From that bucket you cut logical volumes of any size, put file systems on them, and mount them like any partition.",
      "The power shows up later. A volume is getting full? Make it bigger in seconds, while the app keeps running. Out of space in the bucket? Add a new disk to the pool. Need to retire an old disk? Move the data off it while everything stays online.",
      "Almost every RHEL install uses LVM by default for the root file system, so knowing these commands is not optional for a Linux admin, and it is a big part of the RHCSA exam.",
    ],
    deepDive: [
      {
        heading: "Extents: how LVM maps space",
        body: "When you create a volume group, LVM divides every physical volume into equal chunks called physical extents (PEs), 4 MiB by default. A logical volume is just an ordered list of extents, and each logical extent points to one physical extent on some PV. The extents of one LV do not need to be next to each other or even on the same disk.\n\nThe kernel's device-mapper does the actual translation. Each LV appears as /dev/dm-N, with friendlier links at /dev/mapper/vgdata-lvweb and /dev/vgdata/lvweb. If a name contains a hyphen, device-mapper doubles it: VG my-vg becomes /dev/mapper/my--vg-...\n\nThe extent size is set once with vgcreate -s and is the smallest step for LV sizes. lvcreate -L 1G rounds up to whole extents, while lvcreate -l 250 asks for exactly 250 extents. -l also accepts percentages: -l 100%FREE takes everything left in the VG.",
        visual: {
          type: "flow",
          title: "A read from an LV, through device-mapper",
          steps: [
            { label: "App reads a file", detail: "File system asks for a block on /dev/vgdata/lvweb" },
            { label: "Logical extent", detail: "Block falls in LE 300 of the LV" },
            { label: "Mapping table", detail: "LE 300 maps to PE 44 on /dev/vdc" },
            { label: "Physical read", detail: "The kernel reads that offset on vdc" },
          ],
        },
      },
      {
        heading: "Where LVM keeps its metadata",
        body: "Every PV carries a label and a metadata area near its start, and each holds a full text description of the whole volume group: its PVs, LVs and extent maps. Because every PV has a copy, a VG can be read even if some metadata is damaged. LVM also saves backups to /etc/lvm/backup after each change and older versions to /etc/lvm/archive; vgcfgrestore can bring one back.\n\nOn RHEL 9, LVM uses a devices file, /etc/lvm/devices/system.devices, that lists which disks it may use. pvcreate and vgcreate add disks to it automatically. A disk moved from another machine may not appear in pvs until you add it with lvmdevices --adddev /dev/vdd or vgimportdevices.",
        bullets: ["pvs -o +pv_uuid shows PV IDs", "vgcfgbackup and vgcfgrestore save and load metadata", "lvmdevices lists the devices file entries"],
      },
      {
        heading: "Growing, shrinking and moving",
        body: "Growing is safe and online. If the VG has free extents, lvextend -r -L +5G /dev/vgdata/lvweb grows the LV and its file system together; -r calls fsadm, which runs xfs_growfs or resize2fs for you. If the VG is full, add a disk first with pvcreate and vgextend.\n\nShrinking is dangerous. xfs cannot shrink at all. ext4 can, but only unmounted and only if the file system is shrunk before the LV. lvreduce -r does both in the right order; plain lvreduce on a mounted file system cuts off data.\n\nTo retire a disk, pvmove /dev/vdb2 moves all its extents to other PVs in the VG while the LVs stay in use. Then vgreduce vgdata /dev/vdb2 removes it from the VG and pvremove /dev/vdb2 wipes the label.",
        bullets: ["lvextend -r -l +100%FREE uses all free space", "pvmove needs enough free extents on other PVs", "Never lvreduce without -r unless you shrank the file system first"],
      },
      {
        heading: "Snapshots and other LV types",
        body: "A snapshot is a frozen view of an LV at one moment. lvcreate -s -L 1G -n web_snap /dev/vgdata/lvweb creates a classic snapshot that stores only blocks changed after it was taken, so it can be much smaller than the original. If those changes exceed the snapshot's size, the snapshot becomes invalid, so watch the Data% column in lvs. Snapshots are good for a consistent backup or a quick rollback before a risky upgrade (lvconvert --merge rolls back).\n\nLVM can also create mirrored volumes (lvcreate --type raid1 -m 1) and thin pools, where volumes get space only as data is written, which allows overcommitting. Thin pools need monitoring, because a full pool stops writes for every thin volume in it.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Growing a full volume with a new disk",
        actors: ["Admin", "LVM", "File system"],
        messages: [
          { from: 0, to: 1, label: "pvcreate /dev/vdc" },
          { from: 0, to: 1, label: "vgextend vgdata /dev/vdc" },
          { from: 1, to: 0, label: "VG now has free extents" },
          { from: 0, to: 1, label: "lvextend -r -L +10G /dev/vgdata/lvweb" },
          { from: 1, to: 2, label: "fsadm runs xfs_growfs" },
          { from: 2, to: 0, label: "df shows the new size, no downtime" },
        ],
      },
      {
        type: "compare",
        title: "Plain partitions vs LVM",
        columns: [
          { title: "Plain partitions", points: ["Fixed size, set at creation", "Live on one disk only", "Growing often needs free space right after", "Simplest, fewest layers"] },
          { title: "LVM", points: ["Grow online in one command", "One volume can span many disks", "pvmove migrates data while online", "Snapshots and thin volumes"] },
        ],
      },
    ],
    examples: [
      {
        title: "An exam-style task: exact extents and size",
        explanation: "Task: create VG vgexam with 16 MiB extents on /dev/vdb, then an LV lvexam of exactly 40 extents with ext4, mounted persistently at /exam. Step 1: create the PV and the VG with -s 16M. Step 2: create the LV with -l 40, giving 640 MiB. Step 3: make the file system and mount point. Step 4: add an fstab line using the /dev/mapper path or the UUID, and test with mount -a. Step 5: verify the numbers with vgdisplay and lvs.",
        code: {
          lang: "bash",
          code: "sudo pvcreate /dev/vdb\nsudo vgcreate -s 16M vgexam /dev/vdb\nsudo lvcreate -n lvexam -l 40 vgexam\nsudo mkfs.ext4 /dev/vgexam/lvexam\nsudo mkdir -p /exam\necho '/dev/mapper/vgexam-lvexam /exam ext4 defaults 0 2' | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload && sudo mount -a\nsudo vgdisplay vgexam | grep 'PE Size'\nsudo lvs -o lv_name,lv_size,seg_size_pe vgexam",
        },
      },
      {
        title: "Replace an old disk without downtime",
        explanation: "/dev/vdb2 in vgdata is showing errors, and the LVs on it serve a live website. Step 1: add a new disk /dev/vdd to the VG. Step 2: run pvmove to copy every extent from vdb2 to the free space, while the site keeps running. Step 3: once pvs shows vdb2 with no used extents, remove it from the VG and wipe its label. Step 4: confirm nothing in the VG uses vdb2 anymore.",
        code: {
          lang: "bash",
          code: "sudo pvcreate /dev/vdd\nsudo vgextend vgdata /dev/vdd\nsudo pvmove /dev/vdb2\nsudo pvs -o pv_name,vg_name,pv_size,pv_used\nsudo vgreduce vgdata /dev/vdb2\nsudo pvremove /dev/vdb2\nsudo lvs -o lv_name,devices vgdata",
        },
      },
    ],
    cheatSheet: [
      "pvcreate DISK, vgcreate VG DISK, lvcreate -n LV -L SIZE VG, mkfs, mount",
      "vgcreate -s 16M sets the extent size; lvcreate -l 40 asks for 40 extents",
      "lvextend -r -L +5G /dev/vg/lv grows the LV and its file system together",
      "lvextend -r -l +100%FREE /dev/vg/lv uses all free space in the VG",
      "pvmove /dev/old, then vgreduce VG /dev/old and pvremove /dev/old retires a disk",
      "lvcreate -s -L 1G -n snap /dev/vg/lv takes a snapshot; watch Data% in lvs",
      "lvs -o +devices shows which PVs each LV uses",
      "/dev/vg/lv and /dev/mapper/vg-lv are links to the same /dev/dm-N device",
    ],
    quiz: [
      {
        q: "A VG uses 8 MiB extents. How big is an LV created with lvcreate -l 25?",
        options: ["25 MiB", "100 MiB", "200 MiB", "8 GiB"],
        answer: 2,
        why: "25 extents times 8 MiB each is 200 MiB.",
      },
      {
        q: "What does the -r option of lvextend do?",
        options: ["Resizes the file system together with the LV", "Makes the LV read-only", "Removes the LV", "Restores metadata from backup"],
        answer: 0,
        why: "-r calls fsadm to grow xfs or ext4 right after the LV grows.",
      },
      {
        q: "Which command moves all data off a physical volume while LVs stay online?",
        options: ["vgreduce", "lvconvert", "pvremove", "pvmove"],
        answer: 3,
        why: "pvmove migrates extents to other PVs in the same VG without unmounting.",
      },
      {
        q: "A VG is named web-vg and an LV is data. What is its device-mapper path?",
        options: ["/dev/mapper/web-vg-data", "/dev/mapper/web--vg-data", "/dev/mapper/web_vg_data", "/dev/web-vg/mapper/data"],
        answer: 1,
        why: "device-mapper doubles hyphens inside names so the single hyphen can separate VG and LV.",
      },
      {
        q: "A classic snapshot's Data% in lvs reaches 100%. What happens?",
        options: ["It grows automatically by default", "The original LV is deleted", "The snapshot becomes invalid and unusable", "LVM merges it into the origin"],
        answer: 2,
        why: "Once its space for changed blocks is full, a classic snapshot can no longer track changes and is invalidated.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show every PV, VG and LV on your system in short form, and find the extent size and free space of each VG.",
        hint: "pvs, vgs, lvs; vgs can add columns with -o +.",
        solution: "sudo pvs\nsudo vgs -o +vg_extent_size,vg_free_count\nsudo lvs",
      },
      {
        level: "medium",
        task: "Grow the LV that holds /srv/web by 500 MiB, assuming the VG has free space, and show the file system size before and after.",
        hint: "findmnt tells you the device; one lvextend option does the file system too.",
        solution: "df -h /srv/web\ndev=$(findmnt -n -o SOURCE /srv/web)\nsudo lvextend -r -L +500M \"$dev\"\ndf -h /srv/web",
      },
      {
        level: "hard",
        task: "Before upgrading an app stored on /dev/vgdata/lvapp (ext4, mounted at /srv/app), take a 1 GiB snapshot. Then roll back to it as if the upgrade failed.",
        hint: "lvcreate -s for the snapshot, lvconvert --merge to roll back; unmount the origin first so the merge can start at once.",
        solution: "sudo lvcreate -s -L 1G -n lvapp_pre /dev/vgdata/lvapp\n# ... upgrade fails ...\nsudo systemctl stop app\nsudo umount /srv/app\nsudo lvconvert --merge /dev/vgdata/lvapp_pre\nsudo lvs vgdata   # the snapshot disappears when the merge is done\nsudo mount /srv/app && sudo systemctl start app",
      },
    ],
    faq: [
      { q: "Does LVM slow down my disks?", a: "The overhead of a plain linear LV is negligible for normal workloads. Classic snapshots do slow writes while they exist, so remove them when you are done." },
      { q: "Is a snapshot a backup?", a: "No. It lives on the same disks as the original, so a disk failure loses both. Use it to take a consistent copy to another place, or as a short-term rollback point." },
      { q: "Why does pvs not show a disk I attached?", a: "It may have no LVM label yet (run pvcreate), or on RHEL 9 it may be missing from the LVM devices file; check lvmdevices and add it with lvmdevices --adddev." },
      { q: "What extent size should I choose?", a: "The 4 MiB default is fine for almost everything. Pick a different one only when a task tells you to, or when you want LV sizes to be exact multiples of a larger unit." },
    ],
  },

  "adm-storage/nfs-autofs": {
    plain: [
      "NFS, the Network File System, lets one server share a folder over the network. Other machines mount that folder, and for their users it looks just like a local directory. They can list, open and save files, and every client sees the same data.",
      "The server shares a directory, which is called an export. The client mounts it with a normal mount command, giving the server's name and the exported path, for example nfs.example.com:/exports/projects.",
      "Mounting a share at every boot through fstab works, but it has downsides: boot waits if the server is down, and hundreds of clients keep connections open all the time. autofs solves this by mounting a share only when someone actually opens the folder, and unmounting it again after it has been idle for a while.",
      "Companies use this for shared project folders and especially for home directories: a user logs in on any machine and their home folder appears, mounted from the file server.",
    ],
    deepDive: [
      {
        heading: "NFS versions and what they need",
        body: "Modern Linux clients use NFS version 4, usually 4.2. NFSv4 talks over a single TCP port, 2049, which makes firewalls simple. Older NFSv3 also needs rpcbind on port 111 and extra helper services such as mountd on changing ports.\n\nThat matters for showmount -e. It asks the server's mountd, an NFSv3 helper, for the export list. On a server that only allows NFSv4, or a firewall that only opens 2049, showmount fails even though mounting works. In that case mount the server's root, as in mount nfs.example.com:/ /mnt, and browse: NFSv4 presents all exports under one pseudo root.\n\nOn the client you need the nfs-utils package on RHEL or nfs-common on Ubuntu. You can force a version with -o vers=4.2, and nfsstat -m or findmnt shows which version and options a mount actually got.",
        bullets: ["NFSv4: TCP 2049 only", "NFSv3: also rpcbind 111 and mountd", "nfsstat -m shows per-mount options"],
      },
      {
        heading: "Mount options that change behaviour",
        body: "hard is the default: if the server stops answering, programs that touch the mount wait and keep retrying until it returns. Data stays safe, but processes can hang in state D. soft gives up after the retries and returns an error, which can corrupt files an app was writing, so use it only for read-mostly data. timeo sets the wait before a retry, in tenths of a second.\n\nrw and ro set the client side, but the server's export options win. A common one is root_squash, on by default: root on the client is treated as the anonymous user nobody on the server, so sudo cannot bypass permissions on the share. User IDs must match across machines, because NFS by default checks permissions by number, not by name.\n\nIn fstab add _netdev so systemd waits for the network, and nofail if boot should continue without the share.",
        bullets: ["server:/exports/data /data nfs _netdev,nofail 0 0", "hard: wait and retry (default)", "root_squash: client root becomes nobody"],
      },
      {
        heading: "autofs maps: master, indirect and direct",
        body: "autofs reads the master map, /etc/auto.master, which includes every file in /etc/auto.master.d/ ending in .autofs. Each master line names a mount point and a map file.\n\nAn indirect map has a base directory such as /shares. Each key in the map file is a subdirectory name: the line projects -rw,sync nfs.example.com:/exports/projects makes /shares/projects appear on access. autofs owns the base directory, so do not create subfolders in it yourself. The wildcard key * with & in the location means use the same name, which is perfect for home directories.\n\nA direct map uses the special key /- in the master map. Its map file lists full paths, for example /mnt/docs -ro nfs.example.com:/exports/docs. Use it when shares must appear at fixed, unrelated paths. After editing maps, run systemctl reload autofs. By default a share is unmounted after 300 seconds idle; --timeout=600 on the master line changes it.",
        visual: {
          type: "tree",
          title: "How autofs config files fit together",
          root: "/etc/auto.master",
          children: [
            { label: "+dir:/etc/auto.master.d", children: ["Includes every *.autofs file"] },
            { label: "shares.autofs: /shares /etc/auto.shares", children: ["Indirect map", "projects -rw nfs:/exports/projects", "Appears as /shares/projects"] },
            { label: "home.autofs: /home/guests /etc/auto.guests", children: ["Wildcard map", "* -rw nfs:/home/guests/&"] },
            { label: "direct.autofs: /- /etc/auto.direct", children: ["Direct map", "/mnt/docs -ro nfs:/exports/docs"] },
          ],
        },
      },
      {
        heading: "Debugging an automount that does not appear",
        body: "With an indirect map, ls /shares often shows nothing, which confuses people. autofs creates the subfolder only when you access it by name, so try ls /shares/projects instead. To make keys visible before mounting, add the browse option on the master line or set browse_mode = yes in /etc/autofs.conf (it only works for keys that are not wildcards).\n\nIf access still fails, check the basics in order: is autofs running (systemctl status autofs), can you mount the share by hand with mount -t nfs, and does the master map name the right file. journalctl -u autofs shows lookup errors. For detail, stop the service and run automount -f -v in the foreground, then access the path from another terminal to see each step.",
        bullets: ["ls /shares/projects, not just ls /shares", "automount -f -v runs in the foreground with logging", "mount | grep autofs lists the autofs trigger points"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to mount an NFS share",
        columns: [
          { title: "Manual mount", points: ["mount -t nfs server:/exp /mnt", "Good for a quick test", "Gone after reboot"] },
          { title: "fstab", points: ["Mounted at every boot", "Use _netdev and maybe nofail", "Always connected, even when unused"] },
          { title: "autofs", points: ["Mounted on first access", "Unmounted after idle timeout", "Wildcards for many home dirs"] },
        ],
      },
    ],
    examples: [
      {
        title: "Automount home directories for remote users",
        explanation: "Users remote1, remote2 and so on have home folders exported by nfs.lab.example.com under /homes. They should appear at /home/remote/USERNAME on demand. Step 1: install autofs. Step 2: create a master map file pointing /home/remote to a map. Step 3: write a wildcard map where * is the key and & repeats it in the server path. Step 4: enable autofs and test by accessing one user's folder by name.",
        code: {
          lang: "bash",
          code: "sudo dnf install -y autofs nfs-utils\necho '/home/remote /etc/auto.remote --timeout=600' | sudo tee /etc/auto.master.d/remote.autofs\necho '* -rw,sync nfs.lab.example.com:/homes/&' | sudo tee /etc/auto.remote\nsudo systemctl enable --now autofs\nls /home/remote/remote1\nfindmnt -t nfs4",
        },
      },
      {
        title: "showmount fails, but the share is there",
        explanation: "showmount -e nfs.example.com returns an RPC error, so a colleague thinks the server is down. Step 1: test port 2049, which NFSv4 needs. Step 2: mount the server's NFSv4 pseudo root and list it to discover the exports. Step 3: mount the export you need directly. The server is fine; it just does not run the NFSv3 helper services that showmount relies on.",
        code: {
          lang: "bash",
          code: "showmount -e nfs.example.com\n# clnt_create: RPC: Unable to receive\ntimeout 3 bash -c '</dev/tcp/nfs.example.com/2049' && echo 2049 open\nsudo mount -t nfs -o vers=4.2 nfs.example.com:/ /mnt\nls /mnt\nsudo umount /mnt\nsudo mount -t nfs nfs.example.com:/exports/projects /srv/projects",
        },
      },
    ],
    cheatSheet: [
      "showmount -e server lists exports (needs NFSv3 helpers on the server)",
      "sudo mount -t nfs -o vers=4.2 server:/exports/data /mnt mounts a share by hand",
      "fstab: server:/exports/data /data nfs _netdev,nofail 0 0",
      "Indirect map: master line /shares /etc/auto.shares, map line key options server:/path",
      "Direct map: master line /- /etc/auto.direct, map line /full/path options server:/path",
      "Wildcard home dirs: * -rw,sync server:/home/&",
      "sudo systemctl reload autofs after editing maps; idle timeout default is 300 seconds",
      "nfsstat -m or findmnt -t nfs4 shows NFS mounts with their real options",
    ],
    quiz: [
      {
        q: "Which TCP port does an NFSv4 client need to reach on the server?",
        options: ["111", "445", "2049", "22"],
        answer: 2,
        why: "NFSv4 uses only TCP 2049; 111 is rpcbind for NFSv3.",
      },
      {
        q: "In an indirect autofs map, what does & mean in * -rw server:/homes/&?",
        options: ["Run in the background", "The key that was looked up", "Any server", "The base directory"],
        answer: 1,
        why: "& is replaced by the key matched by *, so /home/remote/alice mounts server:/homes/alice.",
      },
      {
        q: "ls /shares shows an empty folder even though autofs is running. Why?",
        options: ["Indirect map keys only appear when accessed by name, unless browse is enabled", "The NFS server is down", "autofs needs a reboot", "The map file must be executable"],
        answer: 0,
        why: "autofs creates each subdirectory on lookup, so ls /shares/projects triggers the mount.",
      },
      {
        q: "Root on an NFS client cannot read a root-owned file on the share. What is the likely reason?",
        options: ["The share is mounted soft", "_netdev is missing", "autofs timed out", "The server exports with root_squash, mapping client root to nobody"],
        answer: 3,
        why: "root_squash is the default and stops client root from acting as root on the server.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Mount nfs.example.com:/exports/projects at /mnt/projects by hand, check which NFS version was negotiated, then unmount it.",
        hint: "findmnt or nfsstat -m shows the vers option.",
        solution: "sudo mkdir -p /mnt/projects\nsudo mount -t nfs nfs.example.com:/exports/projects /mnt/projects\nfindmnt -o TARGET,SOURCE,OPTIONS /mnt/projects | grep -o 'vers=[0-9.]*'\nsudo umount /mnt/projects",
      },
      {
        level: "medium",
        task: "Make the share mount at boot at /srv/projects, without blocking boot if the server is unreachable, and test it without rebooting.",
        hint: "Two options in fstab: one for the network, one for failure.",
        solution: "sudo mkdir -p /srv/projects\necho 'nfs.example.com:/exports/projects /srv/projects nfs _netdev,nofail 0 0' | sudo tee -a /etc/fstab\nsudo systemctl daemon-reload\nsudo mount -a && findmnt /srv/projects",
      },
      {
        level: "hard",
        task: "Configure autofs so /mnt/docs (read-only from server:/exports/docs) and /shares/ANYNAME (read-write from server:/exports/ANYNAME) both mount on demand.",
        hint: "One direct map with /- and one indirect wildcard map, each referenced from its own .autofs file.",
        solution: "echo '/- /etc/auto.direct' | sudo tee /etc/auto.master.d/direct.autofs\necho '/mnt/docs -ro nfs.example.com:/exports/docs' | sudo tee /etc/auto.direct\necho '/shares /etc/auto.shares' | sudo tee /etc/auto.master.d/shares.autofs\necho '* -rw,sync nfs.example.com:/exports/&' | sudo tee /etc/auto.shares\nsudo systemctl enable --now autofs && sudo systemctl reload autofs\nls /mnt/docs /shares/projects",
      },
    ],
    faq: [
      { q: "What is the difference between NFS and Samba?", a: "Both share folders over the network. NFS is the native choice between Linux and Unix machines; Samba speaks SMB, the protocol Windows uses." },
      { q: "Why does my program hang when the NFS server goes down?", a: "NFS mounts are hard by default, so the client waits and retries until the server returns, to protect your data. The process continues once the server is back." },
      { q: "Should I use fstab or autofs for NFS?", a: "Use fstab for a share a server always needs, such as application data. Use autofs for shares used now and then, or for many per-user folders like home directories." },
      { q: "Do I have to create the folders autofs mounts on?", a: "For indirect maps, no: autofs creates the subfolders under the base directory itself. For direct maps, autofs creates the full paths as needed too." },
    ],
  },
};

export default extra;
