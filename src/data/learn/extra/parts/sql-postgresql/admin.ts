import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "admin/roles": {
    plain: [
      "Postgres decides who may do what with roles. A role can be a person, an application or a group. A role that is allowed to log in is what other systems call a user. A role that cannot log in is used as a group: you give it permissions, then add other roles as members.",
      "A permission is called a privilege. SELECT lets a role read a table, INSERT lets it add rows, and so on. You hand them out with GRANT and take them back with REVOKE. Nothing is allowed until someone grants it, except for the owner of an object, who can do everything with it.",
      "Least privilege means each role gets only what it needs. The web app can read and write data but cannot drop tables. An analyst can read but not change anything. The migration tool owns the tables. If one password leaks, the damage stays small.",
      "Row-level security (RLS) goes one step further. GRANT decides which tables a role can touch; RLS decides which rows inside a table it can see or change. That is how one table can safely hold data for many customers.",
    ],
    deepDive: [
      {
        heading: "Login roles, group roles and attributes",
        body: "CREATE USER is simply CREATE ROLE with LOGIN. Roles also carry attributes that are separate from table privileges: SUPERUSER bypasses every check, CREATEDB and CREATEROLE allow creating databases and roles, REPLICATION allows streaming replication, and BYPASSRLS skips row-level security. Give these out rarely; an application role should have none of them.\n\nMembership works with GRANT too: GRANT app_rw TO api_service makes api_service a member of app_rw, and by default members inherit the group's privileges. Use SET ROLE app_owner to act as a role you belong to, for example to run a migration.\n\nPostgres also ships predefined roles for common jobs: pg_read_all_data and pg_write_all_data (PostgreSQL 14+), pg_monitor for monitoring tools, and pg_signal_backend to cancel other sessions' queries. In psql, \\du lists roles and their attributes and \\dp shows table privileges.",
        bullets: ["LOGIN = can connect; NOLOGIN = group", "Avoid SUPERUSER for apps and people's daily work", "pg_monitor for dashboards, pg_read_all_data for read-only staff", "\\du lists roles; \\dp shows privileges"],
      },
      {
        heading: "Owners, grants and the default privileges trap",
        body: "Whoever creates an object owns it, and the owner can alter or drop it no matter what is granted. So the application should not own its tables: create them with a separate owner role (used only by migrations) and grant the app just SELECT, INSERT, UPDATE and DELETE.\n\nPrivileges are checked at several levels. A role needs CONNECT on the database, USAGE on the schema, and then privileges on each table. If tables use serial columns, inserting also needs USAGE on their sequences. Since PostgreSQL 15, ordinary users can no longer create objects in the public schema by default, which closes an old security hole.\n\nThe classic trap: GRANT ... ON ALL TABLES IN SCHEMA covers only tables that exist now. ALTER DEFAULT PRIVILEGES adds grants for tables created later, but only for tables created by the role that ran it, or by the role you name with FOR ROLE. Run it as, or for, the migration owner.",
        visual: {
          type: "tree",
          title: "A least-privilege setup for one app",
          root: "Database shop",
          children: [
            { label: "shop_owner (NOLOGIN)", children: ["Owns schema and tables", "Used via SET ROLE by migrations"] },
            { label: "shop_rw (group)", children: ["SELECT, INSERT, UPDATE, DELETE", "Member: api_service (LOGIN)"] },
            { label: "shop_ro (group)", children: ["SELECT only", "Members: analysts, BI tool"] },
            { label: "monitoring (LOGIN)", children: ["Member of pg_monitor", "No table access needed"] },
          ],
        },
      },
      {
        heading: "Row-level security policies",
        body: "ALTER TABLE t ENABLE ROW LEVEL SECURITY switches RLS on. From then on, for roles that are not the owner, a table with no policies shows no rows at all: RLS is deny by default.\n\nA policy has two kinds of conditions. USING filters which existing rows a role can see, update or delete. WITH CHECK decides which new or changed rows it may write; without it, an UPDATE could move a row out of the user's own reach. You can target commands (FOR SELECT, FOR INSERT, FOR UPDATE, FOR DELETE, or FOR ALL) and roles (TO shop_rw). Several permissive policies are combined with OR; a policy marked AS RESTRICTIVE must also pass, combined with AND.\n\nWho bypasses RLS: superusers and roles with BYPASSRLS, always; the table owner, unless you also run ALTER TABLE t FORCE ROW LEVEL SECURITY. That is why testing as the owner shows every row. Index the columns your policies filter on, because the policy condition is added to every query.",
        bullets: ["Enabled with no policy: non-owners see nothing", "USING filters reads; WITH CHECK guards writes", "Permissive policies OR together; RESTRICTIVE ones AND", "FORCE ROW LEVEL SECURITY applies it to the owner too"],
      },
      {
        heading: "Who can connect: pg_hba.conf and passwords",
        body: "Before any privilege matters, the server checks pg_hba.conf (host-based authentication). Each line names a connection type, database, user, client address and method, and the first matching line wins. For example: hostssl shop api_service 10.0.0.0/16 scram-sha-256 allows the app to connect over TLS from the private network with a password. local all postgres peer lets the postgres operating system user connect through the local socket without a password.\n\nscram-sha-256 has been the default password hashing since PostgreSQL 14; md5 is outdated. After editing pg_hba.conf, reload with SELECT pg_reload_conf(); no restart is needed.\n\nBy default every role is a member of the special group PUBLIC, which has CONNECT on new databases. On a shared server, REVOKE CONNECT ON DATABASE shop FROM PUBLIC and grant it only to the roles that need it.",
        visual: {
          type: "flow",
          title: "From connection attempt to rows",
          steps: [
            { label: "TCP or socket connect", detail: "listen_addresses and port must allow it" },
            { label: "pg_hba.conf match", detail: "First line matching type, db, user, address" },
            { label: "Authenticate", detail: "scram-sha-256, peer, cert, ..." },
            { label: "Privilege checks", detail: "CONNECT, schema USAGE, table grants" },
            { label: "RLS policies", detail: "Filter rows per role" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "What USING and WITH CHECK control",
        columns: [
          { title: "USING", points: ["Applies to rows that already exist", "SELECT, UPDATE, DELETE", "Hidden rows simply don't appear", "No error, just fewer rows"] },
          { title: "WITH CHECK", points: ["Applies to rows being written", "INSERT and the new row of UPDATE", "Bad rows raise an error", "Defaults to USING if omitted"] },
        ],
      },
    ],
    examples: [
      {
        title: "Roles for an app, its migrations and analysts",
        explanation: "Step 1: create an owner role that cannot log in, and make it own the schema. Step 2: create read-write and read-only groups. Step 3: grant table privileges now and default privileges for future tables created by the owner. Step 4: create login roles and add them to the groups. Migrations connect as a deployer login that is a member of shop_owner and run SET ROLE shop_owner first.",
        code: {
          lang: "sql",
          code: "CREATE ROLE shop_owner NOLOGIN;\nCREATE ROLE shop_rw NOLOGIN;\nCREATE ROLE shop_ro NOLOGIN;\nCREATE SCHEMA app AUTHORIZATION shop_owner;\nGRANT USAGE ON SCHEMA app TO shop_rw, shop_ro;\n\nALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA app\n  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO shop_rw;\nALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA app\n  GRANT SELECT ON TABLES TO shop_ro;\n\nCREATE ROLE api_service LOGIN PASSWORD 'use-a-secret-manager' IN ROLE shop_rw;\nCREATE ROLE deployer   LOGIN PASSWORD 'another-secret'       IN ROLE shop_owner;\nCREATE ROLE ana        LOGIN PASSWORD 'and-another'          IN ROLE shop_ro;",
        },
      },
      {
        title: "Multi-tenant isolation with RLS",
        explanation: "A SaaS app keeps every customer's invoices in one table with a tenant_id column. Step 1: enable RLS; the app role is not the table owner, so policies apply to it. Step 2: one policy compares tenant_id with a custom setting the app sets per transaction. Step 3: the app runs SET LOCAL app.tenant_id = '42' at the start of each transaction (SET LOCAL lasts only until COMMIT, which is also safe with poolers). A forgotten WHERE tenant_id = ... in app code can no longer leak another customer's data, and a missing setting returns no rows.",
        code: {
          lang: "sql",
          code: "ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY tenant_isolation ON invoices\n  FOR ALL TO shop_rw\n  USING (tenant_id = current_setting('app.tenant_id', true)::bigint)\n  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::bigint);\n\nCREATE INDEX ON invoices (tenant_id);\n\n-- in the app, per transaction:\nBEGIN;\nSET LOCAL app.tenant_id = '42';\nSELECT * FROM invoices;   -- only tenant 42's rows\nCOMMIT;",
        },
      },
    ],
    cheatSheet: [
      "CREATE ROLE name LOGIN PASSWORD '...';  CREATE USER is the same with LOGIN implied",
      "GRANT group_role TO member_role;  members inherit the group's privileges",
      "GRANT SELECT ON ALL TABLES IN SCHEMA app TO shop_ro;  existing tables only",
      "ALTER DEFAULT PRIVILEGES FOR ROLE owner IN SCHEMA app GRANT ... ON TABLES TO ...;",
      "ALTER TABLE t ENABLE ROW LEVEL SECURITY;  plus FORCE to apply it to the owner",
      "REVOKE CONNECT ON DATABASE shop FROM PUBLIC;  lock down a shared server",
      "\\du roles, \\dp table privileges, \\dn+ schema privileges in psql",
      "SELECT pg_reload_conf();  apply pg_hba.conf changes without a restart",
    ],
    quiz: [
      {
        q: "You granted SELECT ON ALL TABLES IN SCHEMA app TO shop_ro last month. A new table created yesterday gives shop_ro \"permission denied\". Why?",
        options: ["The grant only covered tables that existed then; use ALTER DEFAULT PRIVILEGES", "shop_ro needs SUPERUSER", "The table has RLS", "The grant expired"],
        answer: 0,
        why: "GRANT ON ALL TABLES is a one-time action; default privileges handle tables created later.",
      },
      {
        q: "RLS is enabled on a table but no policy exists. What does a normal app role see?",
        options: ["All rows", "An error on every query", "No rows", "Only rows it inserted"],
        answer: 2,
        why: "RLS is deny by default, so without a policy non-owner roles get no rows.",
      },
      {
        q: "You test your RLS policy while connected as the table owner and see every row. Why?",
        options: ["The policy has a syntax error", "RLS only works over TLS", "Owners need USING and WITH CHECK both", "Table owners bypass RLS unless FORCE ROW LEVEL SECURITY is set"],
        answer: 3,
        why: "Owners, superusers and BYPASSRLS roles skip policies by default.",
      },
      {
        q: "What does WITH CHECK do in a policy?",
        options: ["Filters rows returned by SELECT", "Rejects inserted or updated rows that do not satisfy the condition", "Checks the password", "Validates the table's constraints"],
        answer: 1,
        why: "USING filters existing rows; WITH CHECK guards rows being written.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a read-only login role report_user that can read every current table in the public schema of database shop.",
        hint: "CONNECT, USAGE, then SELECT ON ALL TABLES.",
        solution: "CREATE ROLE report_user LOGIN PASSWORD 'change-me';\nGRANT CONNECT ON DATABASE shop TO report_user;\nGRANT USAGE ON SCHEMA public TO report_user;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO report_user;",
      },
      {
        level: "medium",
        task: "Check whether api_service can delete from orders, and list every privilege on orders.",
        hint: "has_table_privilege() returns a boolean; information_schema.role_table_grants lists grants.",
        solution: "SELECT has_table_privilege('api_service', 'orders', 'DELETE');\n\nSELECT grantee, privilege_type\nFROM information_schema.role_table_grants\nWHERE table_name = 'orders'\nORDER BY grantee, privilege_type;\n-- or in psql: \\dp orders",
      },
      {
        level: "hard",
        task: "notes(id, owner text, body). Let members of shop_rw read and edit only their own notes (owner = current_user), and stop them from creating notes for someone else.",
        hint: "Enable RLS and write one FOR ALL policy with both USING and WITH CHECK.",
        solution: "ALTER TABLE notes ENABLE ROW LEVEL SECURITY;\nCREATE POLICY own_notes ON notes\n  FOR ALL TO shop_rw\n  USING (owner = current_user)\n  WITH CHECK (owner = current_user);\nGRANT SELECT, INSERT, UPDATE, DELETE ON notes TO shop_rw;\n-- test as a member, not as the owner:\nSET ROLE api_service;\nINSERT INTO notes (owner, body) VALUES ('someone_else', 'x');  -- ERROR\nRESET ROLE;",
      },
    ],
    faq: [
      { q: "What is the difference between a user and a role in PostgreSQL?", a: "There is no real difference. A user is a role with the LOGIN attribute, and CREATE USER is just CREATE ROLE with LOGIN." },
      { q: "Should my application connect as postgres?", a: "No. postgres is a superuser that bypasses every check, including RLS. Create a dedicated login role with only the table privileges the app needs." },
      { q: "Does row-level security slow queries down?", a: "The policy condition is added to each query like an extra WHERE. With an index on the filtered column the cost is usually small; complex policies with subqueries cost more." },
    ],
  },

  "admin/backup": {
    plain: [
      "A backup is a copy of your data that you can bring back after something goes wrong: a dead disk, a bug that deletes rows, a command run on the wrong server, or ransomware. Backups are the one thing in operations you cannot add after the disaster.",
      "Postgres has two kinds. A logical backup, made with pg_dump, saves the data as SQL commands or as an archive of table contents. A physical backup copies the actual data files of the whole server, together with the WAL, the log of every change.",
      "Point-in-time recovery (PITR) combines a physical backup with a continuous archive of WAL files. You restore the backup and then replay the changes up to any moment you choose, such as one minute before someone ran DELETE without a WHERE.",
      "A backup only counts if you have restored it. Test restores regularly, keep copies on a different machine and ideally in a different region, and write down how long a restore takes.",
    ],
    deepDive: [
      {
        heading: "pg_dump formats and what they include",
        body: "pg_dump reads one database inside a single consistent snapshot, so the dump reflects one moment even while the app keeps writing. It does not block normal reads or writes, but it does block DDL such as ALTER TABLE on the tables it is reading.\n\nFormats: plain (-Fp, the default) writes a SQL script you restore with psql. Custom (-Fc) is a compressed archive for pg_restore and lets you restore single tables. Directory (-Fd) writes one file per table and supports parallel dumping with -j. Tar (-Ft) also exists but is rarely used.\n\nWhat a dump does not contain: roles and tablespaces, which belong to the whole server. Save them with pg_dumpall --globals-only. Also note that pg_dump of a huge database can take hours, and the restore longer, because indexes must be rebuilt. For tens of gigabytes and more, physical backups restore much faster.",
        bullets: ["-Fc: compressed, selective restore with pg_restore", "-Fd -j 4: parallel dump into a directory", "pg_dumpall --globals-only for roles", "Use the newer pg_dump version when moving to a newer server"],
      },
      {
        heading: "Restoring with pg_restore",
        body: "pg_restore reads custom, directory and tar archives. Restore into an empty database: createdb shop_new, then pg_restore -d shop_new file.dump. Add -j 4 to run four jobs in parallel; the data loads and index builds then overlap and finish much sooner.\n\nUseful options: --no-owner skips ownership commands, handy when restoring as a different user; --clean --if-exists drops objects before recreating them; -t orders restores one table; -l lists the archive's contents into a file, which you can edit and pass back with -L to restore only the items you keep.\n\nTwo habits save pain. Add --exit-on-error (or -e), because by default pg_restore keeps going after errors and you might miss them. And run ANALYZE after a restore, because the restored tables have no planner statistics yet and the first queries may choose bad plans.",
        visual: {
          type: "flow",
          title: "A safe restore drill",
          steps: [
            { label: "Create empty database", detail: "createdb shop_restore_test" },
            { label: "Restore globals if needed", detail: "psql -f globals.sql (roles)" },
            { label: "pg_restore -j 4 -e", detail: "Parallel, stop on the first error" },
            { label: "ANALYZE", detail: "Rebuild planner statistics" },
            { label: "Check the data", detail: "Row counts and a few known records" },
            { label: "Record the time", detail: "That is your real recovery time" },
          ],
        },
      },
      {
        heading: "Physical backups, WAL archiving and PITR",
        body: "pg_basebackup copies the entire data directory of a running server: pg_basebackup -D /backups/base -Ft -z -X stream -P. With -X stream it also includes the WAL needed to make the copy consistent. PostgreSQL 17 added incremental base backups, combined later with pg_combinebackup.\n\nFor PITR you also archive every finished WAL segment (16 MB files by default). Set archive_mode = on and an archive_command, for example 'test ! -f /mnt/wal/%f && cp %p /mnt/wal/%f'. The command must return success only when the file is safely stored, or Postgres keeps retrying and holds the WAL.\n\nTo recover: restore the base backup into an empty data directory, set restore_command = 'cp /mnt/wal/%f %p' and recovery_target_time = '2026-03-01 14:29:00+00' in postgresql.conf, create an empty file named recovery.signal, and start the server. It replays WAL up to that moment. In practice most teams use pgBackRest, Barman or WAL-G, which handle base backups, archiving to S3, retention and verification.",
        visual: {
          type: "sequence",
          title: "Recovering to just before a bad DELETE",
          actors: ["DBA", "New server", "Backup store"],
          messages: [
            { from: 0, to: 2, label: "Fetch last night's base backup" },
            { from: 0, to: 1, label: "Restore files, set recovery_target_time" },
            { from: 0, to: 1, label: "touch recovery.signal; start" },
            { from: 1, to: 2, label: "restore_command: fetch WAL segments" },
            { from: 1, to: 0, label: "Log: recovery stopping before 14:29" },
            { from: 1, to: 0, label: "Paused at target: check, then promote" },
          ],
        },
      },
      {
        heading: "RPO, RTO and a backup policy that works",
        body: "Two numbers drive every backup decision. RPO (recovery point objective) is how much data you can afford to lose: a nightly pg_dump means up to 24 hours; continuous WAL archiving means seconds to minutes. RTO (recovery time objective) is how long you can be down: restoring a 500 GB logical dump can take many hours; a physical restore plus WAL replay is usually much faster.\n\nA replica is not a backup. If someone drops a table, the replica drops it a second later. Keep replicas for availability and backups for history.\n\nA solid policy: automated backups on a schedule, copies in another location (the 3-2-1 rule: three copies, two kinds of storage, one off site), encryption, retention that matches your needs (for example 14 daily and 12 monthly), monitoring that alerts when a backup fails or is missing, and a restore test at least monthly. Managed services such as Amazon RDS or Cloud SQL do PITR for you, but you should still practise a restore.",
        bullets: ["RPO = how much data may be lost", "RTO = how long the restore may take", "Replicas copy mistakes instantly", "Alert on failed or missing backups"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "pg_dump output formats",
        columns: [
          { title: "Plain (-Fp)", points: ["Readable SQL script", "Restore with psql", "No selective or parallel restore", "Good for small dumps and diffs"] },
          { title: "Custom (-Fc)", points: ["Compressed single file", "Restore with pg_restore", "Pick tables, parallel restore", "Best default for one database"] },
          { title: "Directory (-Fd)", points: ["One file per table", "Parallel dump with -j", "Parallel restore too", "Best for big databases"] },
        ],
      },
    ],
    examples: [
      {
        title: "A nightly backup script with cron",
        explanation: "Step 1: store the password in ~/.pgpass (mode 600) so the script never contains it. Step 2: dump globals and the database in custom format, with a timestamp in the name. Step 3: copy the files off the server. Step 4: delete local copies older than 14 days. Step 5: schedule it with cron at 02:30 and send output to a log you monitor.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\n# /usr/local/bin/pg-backup.sh   (~/.pgpass: localhost:5432:*:backup:secret)\nset -euo pipefail\nstamp=$(date +%F_%H%M)\ndir=/var/backups/pg\nmkdir -p \"$dir\"\n\npg_dumpall -h localhost -U backup --globals-only > \"$dir/globals_$stamp.sql\"\npg_dump -h localhost -U backup -Fc -d shop -f \"$dir/shop_$stamp.dump\"\n\naws s3 cp \"$dir/shop_$stamp.dump\" s3://acme-db-backups/shop/\naws s3 cp \"$dir/globals_$stamp.sql\" s3://acme-db-backups/shop/\nfind \"$dir\" -type f -mtime +14 -delete\n\n# crontab -e:\n# 30 2 * * * /usr/local/bin/pg-backup.sh >> /var/log/pg-backup.log 2>&1",
        },
      },
      {
        title: "Restoring one table that was wiped",
        explanation: "Someone ran DELETE FROM coupons on production, and last night's dump is fine for that table. Step 1: list the archive to confirm the table is in it. Step 2: restore only that table into a scratch database, so production is not touched. Step 3: copy the rows back into production with a query you check first. Note: rows changed since the dump are not in it; for those you would need PITR.",
        code: {
          lang: "bash",
          code: "pg_restore -l shop_2026-03-01_0230.dump | grep coupons\n\ncreatedb scratch\npg_restore -d scratch -t coupons --no-owner -e shop_2026-03-01_0230.dump\n\npsql -d scratch -c \"SELECT count(*) FROM coupons\"\npsql -d scratch -c \"\\copy coupons TO '/tmp/coupons.csv' CSV\"\npsql -d shop    -c \"\\copy coupons FROM '/tmp/coupons.csv' CSV\"",
        },
      },
    ],
    cheatSheet: [
      "pg_dump -Fc -d shop -f shop.dump  compressed archive of one database",
      "pg_dump -Fd -j 4 -d shop -f shop_dir  parallel dump to a directory",
      "pg_restore -d target -j 4 --no-owner -e shop.dump  parallel restore, stop on error",
      "pg_dumpall --globals-only > globals.sql  roles and tablespaces",
      "pg_basebackup -D /backups/base -Ft -z -X stream -P  physical backup",
      "PITR: restore base, restore_command, recovery_target_time, touch recovery.signal",
      "~/.pgpass format host:port:db:user:password, mode 600",
      "A replica is not a backup: mistakes replicate instantly",
    ],
    quiz: [
      {
        q: "Which command saves roles, which pg_dump does not include?",
        options: ["pg_dump --roles", "pg_restore --globals", "pg_basebackup -R", "pg_dumpall --globals-only"],
        answer: 3,
        why: "Roles and tablespaces are cluster-wide, so pg_dumpall handles them.",
      },
      {
        q: "You take a pg_dump every night at 02:00. A bad DELETE happens at 17:00. What is the most you lose by restoring the dump?",
        options: ["Nothing", "About 15 hours of changes", "Only the deleted rows", "Exactly one hour"],
        answer: 1,
        why: "A logical dump restores to its own moment, so every change after 02:00 is lost; PITR would avoid that.",
      },
      {
        q: "What does PITR need in addition to a base backup?",
        options: ["A continuous archive of WAL files", "A replica", "A plain-format pg_dump", "pg_stat_statements"],
        answer: 0,
        why: "Replaying archived WAL from the base backup forward is what reaches the chosen moment.",
      },
      {
        q: "Why run ANALYZE after pg_restore?",
        options: ["To check the data for corruption", "To rebuild indexes", "Restored tables have no planner statistics yet", "To free disk space"],
        answer: 2,
        why: "Without statistics the planner guesses row counts and can pick poor plans.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Dump database shop in custom format, then restore it into a new database called shop_copy and count the orders in both.",
        hint: "pg_dump -Fc, createdb, pg_restore -d.",
        solution: "pg_dump -Fc -d shop -f shop.dump\ncreatedb shop_copy\npg_restore -d shop_copy --no-owner -e shop.dump\npsql -d shop      -tAc \"SELECT count(*) FROM orders\"\npsql -d shop_copy -tAc \"SELECT count(*) FROM orders\"",
      },
      {
        level: "medium",
        task: "Dump a large database in parallel with 4 jobs and restore it with 4 jobs into a fresh database, then refresh statistics.",
        hint: "Parallel dump needs the directory format.",
        solution: "pg_dump -Fd -j 4 -d shop -f /backups/shop_dir\ncreatedb shop_restored\npg_restore -j 4 -d shop_restored --no-owner -e /backups/shop_dir\npsql -d shop_restored -c \"ANALYZE\"",
      },
      {
        level: "hard",
        task: "Configure WAL archiving to /mnt/wal and write the recovery settings to restore a base backup to 2026-03-01 14:29 UTC.",
        hint: "archive_mode needs a restart. Recovery uses restore_command, a target and recovery.signal.",
        solution: "# postgresql.conf on the primary (restart after archive_mode)\narchive_mode = on\narchive_command = 'test ! -f /mnt/wal/%f && cp %p /mnt/wal/%f'\n\n# on the recovery server, after restoring the base backup:\nrestore_command = 'cp /mnt/wal/%f %p'\nrecovery_target_time = '2026-03-01 14:29:00+00'\nrecovery_target_action = 'pause'\n# then: touch $PGDATA/recovery.signal; start the server,\n# check the data, and run SELECT pg_wal_replay_resume(); to promote",
      },
    ],
    faq: [
      { q: "Does pg_dump lock the database?", a: "It takes light locks that let normal reads and writes continue, and it works from one consistent snapshot. It does block schema changes like ALTER TABLE or DROP on the tables it is dumping until it finishes." },
      { q: "Can I restore a dump into a newer PostgreSQL version?", a: "Yes. Logical dumps are portable across major versions; use the newer version's pg_dump and pg_restore. Physical backups only restore on the same major version." },
      { q: "Which backup tool should I use in production?", a: "For self-managed servers, pgBackRest, Barman and WAL-G are widely used for physical backups with PITR. pg_dump is still useful for single databases, migrations and extra safety copies." },
      { q: "How often should I test restores?", a: "Regularly and automatically if you can, for example a weekly job that restores the latest backup into a scratch server and runs a few checks. At minimum, before you rely on a new backup setup." },
    ],
  },

  "admin/vacuum": {
    plain: [
      "In Postgres an UPDATE does not change a row in place. It writes a new version of the row and leaves the old one behind, because another transaction might still be reading it. A DELETE also just marks the row as gone. These leftovers are called dead tuples (tuple is the database word for a row version).",
      "If nobody cleaned them up, tables would grow forever and queries would wade through more and more junk. VACUUM is the cleaner. It finds dead row versions that no transaction can see any more and marks their space as free, so new rows can reuse it.",
      "You rarely run it by hand. Autovacuum is a background helper that watches how many rows each table has changed and vacuums it when enough have piled up. It also runs ANALYZE, which refreshes the statistics the planner uses to choose good plans.",
      "Your job is mostly to make sure autovacuum can keep up: never switch it off, avoid transactions that stay open for hours, and tune it for very busy tables.",
    ],
    deepDive: [
      {
        heading: "What VACUUM actually does",
        body: "VACUUM visits the table's pages, finds row versions whose deleting transaction is older than every running snapshot, and removes them. It first deletes index entries pointing to those rows, then frees the space in the table pages. The free space is recorded in the free space map, so the next INSERT or UPDATE can reuse it.\n\nIt also updates the visibility map, which marks pages where every row is visible to all transactions. That makes later vacuums skip those pages and enables index-only scans.\n\nPlain VACUUM takes only a SHARE UPDATE EXCLUSIVE lock, so reads and writes continue. It normally does not shrink the file on disk: it can only cut off completely empty pages at the very end. VACUUM FULL rewrites the whole table into a new compact file, which does return space to the operating system, but it holds an ACCESS EXCLUSIVE lock for the whole time and needs room for a full copy.",
        visual: {
          type: "flow",
          title: "One VACUUM pass over a table",
          steps: [
            { label: "Scan heap pages", detail: "Skip pages the visibility map says are clean" },
            { label: "Collect dead tuples", detail: "Versions no snapshot can still see" },
            { label: "Clean indexes", detail: "Remove entries pointing to dead rows" },
            { label: "Free heap space", detail: "Record it in the free space map" },
            { label: "Update visibility map", detail: "Mark all-visible and frozen pages" },
            { label: "Truncate tail", detail: "Return only empty end pages to the OS" },
          ],
        },
      },
      {
        heading: "When autovacuum runs, and tuning it for big tables",
        body: "Autovacuum vacuums a table when its dead tuples exceed autovacuum_vacuum_threshold (50) plus autovacuum_vacuum_scale_factor (0.2) times the row count. It analyses when changed rows exceed 50 plus 0.1 times the row count. Since PostgreSQL 13 it also vacuums tables that only receive inserts, so their visibility maps stay current.\n\nThe 20 percent rule is fine for small tables but too lazy for big ones: a 100 million row table collects 20 million dead rows before cleanup. Lower it per table: ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.01, autovacuum_analyze_scale_factor = 0.02).\n\nAutovacuum is deliberately throttled so it does not hurt foreground work. By default up to 3 workers (autovacuum_max_workers) run, and each pauses after a set amount of I/O (cost-based delay). On a busy server with fast disks, raising autovacuum_vacuum_cost_limit lets it finish sooner. Watch progress in pg_stat_progress_vacuum.",
        bullets: ["Trigger: 50 + 0.2 x rows dead tuples", "Per-table scale_factor for large hot tables", "3 workers by default; raise cost_limit on fast disks", "pg_stat_progress_vacuum shows running vacuums"],
      },
      {
        heading: "Transaction ID wraparound and freezing",
        body: "Transaction IDs are 32-bit numbers, so there are only about 4 billion of them, used in a circle. Postgres compares IDs as \"older\" or \"newer\" within a window of about 2 billion. If an old row's xmin fell out of that window, the row would suddenly look as if it came from the future and would vanish.\n\nTo prevent that, VACUUM freezes old rows: it marks them as visible to everyone, forever, so their xmin no longer matters. When a table's oldest unfrozen ID reaches autovacuum_freeze_max_age (200 million by default), autovacuum starts an aggressive anti-wraparound vacuum, even if autovacuum is turned off for that table. You may see it in pg_stat_activity as \"(to prevent wraparound)\".\n\nIf freezing falls far behind, Postgres eventually refuses to start new transactions to protect the data, which is an outage. Check SELECT datname, age(datfrozenxid) FROM pg_database; values in the hundreds of millions are normal, values above a billion need attention.",
        bullets: ["About 2 billion XIDs before wraparound trouble", "Freezing makes old rows permanently visible", "Anti-wraparound vacuum starts at 200 million by default", "Monitor age(datfrozenxid)"],
      },
      {
        heading: "What blocks cleanup, and fixing bloat",
        body: "VACUUM can only remove a dead row when no snapshot might still need it. Anything holding an old snapshot holds back cleanup for every table: a transaction left idle in transaction, a long report, an abandoned replication slot, a forgotten prepared transaction, or a replica with hot_standby_feedback on running long queries. VACUUM VERBOSE reports how many dead rows were \"not yet removable\"; if that number is large, look for those causes in pg_stat_activity (backend_xmin), pg_replication_slots and pg_prepared_xacts.\n\nOnce a table is bloated, plain VACUUM makes the space reusable but does not shrink it. Options: VACUUM FULL during a maintenance window; the pg_repack extension, which rebuilds a table online with only brief locks; and REINDEX INDEX CONCURRENTLY (PostgreSQL 12+) for bloated indexes. The pgstattuple extension measures real dead and free space.\n\nFor tables with many updates, a fillfactor below 100 leaves room in each page so updates can stay on the same page as HOT updates, which skip index changes.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "VACUUM vs VACUUM FULL vs pg_repack",
        columns: [
          { title: "VACUUM", points: ["Space reusable, file rarely shrinks", "Reads and writes continue", "Runs automatically", "The normal routine"] },
          { title: "VACUUM FULL", points: ["Rewrites a compact copy", "ACCESS EXCLUSIVE: blocks all", "Needs space for the copy", "Maintenance window only"] },
          { title: "pg_repack", points: ["Extension, rebuilds online", "Brief locks at start and end", "Needs a primary key or unique index", "Fix bloat without downtime"] },
        ],
      },
    ],
    examples: [
      {
        title: "Seeing dead tuples appear and disappear",
        explanation: "Step 1: create a table with 100,000 rows and turn off autovacuum on it, only for this experiment. Step 2: update every row; the table now has 100,000 dead versions and roughly doubles in size. Step 3: run VACUUM VERBOSE and see it remove them. Step 4: check that the size did not shrink, but the next update reuses the freed space instead of growing the file again.",
        code: {
          lang: "sql",
          code: "CREATE TABLE vac_demo AS SELECT g AS id, 0 AS n FROM generate_series(1, 100000) g;\nALTER TABLE vac_demo SET (autovacuum_enabled = false);\nSELECT pg_size_pretty(pg_relation_size('vac_demo'));\n\nUPDATE vac_demo SET n = n + 1;\nSELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'vac_demo';\nSELECT pg_size_pretty(pg_relation_size('vac_demo'));   -- about double\n\nVACUUM VERBOSE vac_demo;\nUPDATE vac_demo SET n = n + 1;                         -- reuses freed space\nSELECT pg_size_pretty(pg_relation_size('vac_demo'));   -- about the same\nALTER TABLE vac_demo RESET (autovacuum_enabled);",
        },
      },
      {
        title: "Autovacuum is not keeping up on a hot table",
        explanation: "The events table has 200 million rows and queries keep slowing down. Step 1: pg_stat_user_tables shows 30 million dead tuples and the last autovacuum days ago. Step 2: check for an old snapshot holding cleanup back; a session has been idle in transaction for 6 hours. Step 3: end it. Step 4: lower the table's scale factor so autovacuum runs after 1 percent changes instead of 20, and let a manual VACUUM catch up now.",
        code: {
          lang: "sql",
          code: "SELECT relname, n_live_tup, n_dead_tup, last_autovacuum\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 5;\n\nSELECT pid, state, now() - xact_start AS xact_age, backend_xmin\nFROM pg_stat_activity\nWHERE backend_xmin IS NOT NULL\nORDER BY age(backend_xmin) DESC LIMIT 5;\n\nSELECT pg_terminate_backend(31337);   -- the idle-in-transaction session\n\nALTER TABLE events SET (autovacuum_vacuum_scale_factor = 0.01);\nVACUUM (VERBOSE, ANALYZE) events;",
        },
      },
    ],
    cheatSheet: [
      "VACUUM (VERBOSE, ANALYZE) t;  clean, refresh stats, report what happened",
      "SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY 2 DESC;",
      "ALTER TABLE t SET (autovacuum_vacuum_scale_factor = 0.01);  vacuum big tables sooner",
      "SELECT * FROM pg_stat_progress_vacuum;  watch running vacuums",
      "SELECT datname, age(datfrozenxid) FROM pg_database;  wraparound headroom",
      "VACUUM FULL blocks the table; prefer pg_repack for online bloat fixes",
      "REINDEX INDEX CONCURRENTLY idx;  rebuild a bloated index without blocking writes",
      "Never disable autovacuum globally",
    ],
    quiz: [
      {
        q: "After deleting half the rows in a table and running plain VACUUM, the file size on disk is unchanged. Why?",
        options: ["VACUUM failed", "The deleted rows are still visible", "Autovacuum must run instead", "Plain VACUUM makes space reusable inside the file but normally does not shrink it"],
        answer: 3,
        why: "Only empty pages at the very end are returned; VACUUM FULL or pg_repack shrink the file.",
      },
      {
        q: "VACUUM VERBOSE reports many dead rows that are \"not yet removable\". What is a likely cause?",
        options: ["A session that has been idle in transaction for hours", "Too many indexes", "shared_buffers is too small", "The table has no primary key"],
        answer: 0,
        why: "An old snapshot means some transaction might still need those row versions, so they cannot be removed.",
      },
      {
        q: "With default settings, about how many dead rows does a 50 million row table collect before autovacuum vacuums it?",
        options: ["50", "About 500,000", "About 10 million", "It never vacuums automatically"],
        answer: 2,
        why: "The trigger is 50 plus 0.2 times the row count, which is about 10 million rows.",
      },
      {
        q: "Why does Postgres freeze old rows?",
        options: ["To compress them", "So 32-bit transaction IDs can wrap around without old rows becoming invisible", "To move them to cold storage", "To lock them against updates"],
        answer: 1,
        why: "Frozen rows count as visible to everyone, so their old xmin no longer matters when IDs wrap.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the 5 tables with the most dead tuples, with their live tuple count and when autovacuum last ran on them.",
        hint: "pg_stat_user_tables has n_dead_tup, n_live_tup and last_autovacuum.",
        solution: "SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze\nFROM pg_stat_user_tables\nORDER BY n_dead_tup DESC\nLIMIT 5;",
      },
      {
        level: "medium",
        task: "Show the dead-tuple percentage per table and the autovacuum trigger point under default settings, to see which tables are close to their next vacuum.",
        hint: "Trigger = 50 + 0.2 x n_live_tup (an approximation of reltuples).",
        solution: "SELECT relname, n_live_tup, n_dead_tup,\n       round(100.0 * n_dead_tup / greatest(n_live_tup, 1), 1) AS dead_pct,\n       (50 + 0.2 * n_live_tup)::bigint AS vacuum_trigger\nFROM pg_stat_user_tables\nORDER BY n_dead_tup DESC\nLIMIT 10;",
      },
      {
        level: "hard",
        task: "Find everything that could be holding back vacuum cleanup on the server: old transactions, replication slots and prepared transactions.",
        hint: "Look at backend_xmin, pg_replication_slots.xmin and catalog_xmin, and pg_prepared_xacts.",
        solution: "SELECT pid, state, age(backend_xmin) AS xmin_age, now() - xact_start AS xact_age\nFROM pg_stat_activity WHERE backend_xmin IS NOT NULL\nORDER BY age(backend_xmin) DESC LIMIT 5;\n\nSELECT slot_name, active, age(xmin) AS xmin_age, age(catalog_xmin) AS catalog_age\nFROM pg_replication_slots;\n\nSELECT gid, prepared, owner FROM pg_prepared_xacts;",
      },
    ],
    faq: [
      { q: "Should I run VACUUM manually every night?", a: "Usually not; autovacuum handles it. Manual VACUUM ANALYZE is useful after a big bulk load or delete, or before a big report on freshly changed data." },
      { q: "Is it safe to run VACUUM while the app is running?", a: "Yes, plain VACUUM and ANALYZE run alongside normal reads and writes. Avoid VACUUM FULL on live tables because it blocks all access." },
      { q: "Why is my table much bigger than its data?", a: "That is bloat from dead tuples that were not cleaned up in time, often because of long transactions or a lazy autovacuum setting. Fix the cause first, then shrink it with pg_repack or VACUUM FULL." },
    ],
  },

  "admin/monitoring": {
    plain: [
      "A database is a black box until you ask it what it is doing. Postgres keeps live counters about itself in system views whose names start with pg_stat. They tell you who is connected, what is running right now, which tables are read most and which queries cost the most.",
      "pg_stat_activity is the \"right now\" view. It has one row per connection: who it is, which query it runs, how long it has been running, and whether it is waiting for something, like a lock.",
      "pg_stat_statements is the \"over time\" view. It is an extension that groups every query by its shape (with the values replaced by $1, $2) and adds up how often it ran and how long it took in total. That turns \"the database feels slow\" into a ranked list of queries to fix.",
      "Good monitoring answers three questions fast: is the database healthy right now, what changed, and which queries should I look at first?",
    ],
    deepDive: [
      {
        heading: "Reading pg_stat_activity",
        body: "Each row is one backend process. Useful columns: pid (process ID, used to cancel it), usename and application_name (who; set application_name in your connection string so you can tell services apart), client_addr, state, wait_event_type and wait_event, xact_start (when the transaction began), query_start, and query (the current or last statement).\n\nThe state column matters most. active means running a query now. idle means connected and doing nothing, which is fine. idle in transaction means a transaction is open but no query is running: the app forgot to commit or is doing slow work in the middle. Those sessions hold locks and old snapshots. idle in transaction (aborted) means an error happened and nobody has rolled back yet.\n\nwait_event_type tells you why an active query is not using the CPU: Lock (waiting for another transaction), IO (reading from disk), LWLock (internal contention), or Client (waiting for the app to read results). The backend_type column separates client backends from autovacuum and other background workers.",
        bullets: ["state = 'active' with old query_start: long query", "state = 'idle in transaction' for minutes: fix the app", "wait_event_type = 'Lock': use pg_blocking_pids", "Set application_name per service"],
      },
      {
        heading: "Setting up and using pg_stat_statements",
        body: "The module must be loaded at server start: add pg_stat_statements to shared_preload_libraries in postgresql.conf, restart, then run CREATE EXTENSION pg_stat_statements in the database where you want to read it. Managed services usually have it preloaded already. It is cheap enough that most production servers leave it on.\n\nIt keeps one row per query shape (identified by queryid), per user and database, up to pg_stat_statements.max entries (5,000 by default). Key columns: calls, total_exec_time and mean_exec_time (in milliseconds), rows, and shared_blks_hit and shared_blks_read for cache behaviour.\n\nRank by total_exec_time to find where the server spends its time. Rank by calls to find chatty N+1 patterns. Rank by mean_exec_time to find individually slow queries, and by shared_blks_read for queries that read a lot from disk. After a fix, call pg_stat_statements_reset() so new numbers are not mixed with old ones, or compare snapshots taken before and after.",
        visual: {
          type: "compare",
          title: "Three ways to rank pg_stat_statements",
          columns: [
            { title: "By total_exec_time", points: ["Where the server's time goes", "Best first view", "Fixes here help the most"] },
            { title: "By calls", points: ["Chattiest queries", "Spots N+1 loops", "Candidates for batching or caching"] },
            { title: "By mean_exec_time", points: ["Slowest single runs", "Reports and missing indexes", "What users feel on one page"] },
          ],
        },
      },
      {
        heading: "Table, index and database statistics",
        body: "pg_stat_user_tables has one row per table: seq_scan and idx_scan (how often each kind of scan happened), n_live_tup and n_dead_tup, and the last vacuum and analyze times. A big table with a high seq_scan count usually means a missing index.\n\npg_stat_user_indexes shows idx_scan per index, so you can find unused ones. pg_statio_user_tables shows heap_blks_hit and heap_blks_read, from which you get a cache hit ratio; busy OLTP databases usually sit above 99 percent.\n\npg_stat_database gives per-database totals: commits, rollbacks, deadlocks, temp_files and temp_bytes (queries spilling to disk). pg_stat_replication shows replicas and their lag. PostgreSQL 16 added pg_stat_io, which breaks I/O down by backend type and context.\n\nThese counters are cumulative since the last reset, so look at how they change over time, not at the raw number. That is exactly what monitoring tools do.",
      },
      {
        heading: "Logs, alerts and tools",
        body: "Some answers are easier to get from the server log. log_min_duration_statement = '500ms' logs every statement slower than half a second with its duration. log_lock_waits = on logs waits longer than deadlock_timeout. log_temp_files = 0 logs every temp file, which shows sorts that spill. log_autovacuum_min_duration shows slow vacuums. Most of these can be changed with ALTER SYSTEM and a reload, without restarting.\n\nFor dashboards and alerts, most teams scrape the pg_stat views on a schedule: Prometheus with postgres_exporter and Grafana, or pgwatch, pganalyze, Datadog and similar services. pg_activity gives a top-like live view in the terminal.\n\nUseful alerts: connections near max_connections, sessions idle in transaction for more than a few minutes, replication lag, rising age(datfrozenxid), failed backups, disk space, and a sudden jump in the total time of one query.",
        visual: {
          type: "layers",
          title: "A typical Postgres monitoring stack",
          layers: [
            { label: "Grafana dashboards and alerts", detail: "Graphs, thresholds, paging" },
            { label: "Prometheus", detail: "Stores the time series" },
            { label: "postgres_exporter", detail: "Turns pg_stat views into metrics" },
            { label: "pg_stat views + pg_stat_statements", detail: "Counters inside Postgres" },
            { label: "Server log", detail: "Slow statements, lock waits, temp files" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which view answers which question?",
        root: "pg_stat views",
        children: [
          { label: "What is running now?", children: ["pg_stat_activity", "pg_locks"] },
          { label: "Which queries cost most?", children: ["pg_stat_statements"] },
          { label: "Which tables need indexes or vacuum?", children: ["pg_stat_user_tables"] },
          { label: "Which indexes are unused?", children: ["pg_stat_user_indexes"] },
          { label: "How healthy is the database?", children: ["pg_stat_database", "pg_stat_replication"] },
        ],
      },
    ],
    examples: [
      {
        title: "A five-minute health check during an incident",
        explanation: "Users report slow pages. Step 1: count connections by state; 180 of 200 connections are active, so the server is saturated. Step 2: list the longest-running active queries; dozens are the same report query, each running for 40 seconds. Step 3: cancel them with pg_cancel_backend, which stops the query but keeps the connection. Step 4: afterwards, look up that query in pg_stat_statements and EXPLAIN it to fix the cause.",
        code: {
          lang: "sql",
          code: "SELECT state, count(*) FROM pg_stat_activity\nWHERE backend_type = 'client backend' GROUP BY state;\n\nSELECT pid, now() - query_start AS running_for, wait_event_type,\n       application_name, left(query, 80) AS query\nFROM pg_stat_activity\nWHERE state = 'active' AND pid <> pg_backend_pid()\nORDER BY query_start\nLIMIT 10;\n\nSELECT pg_cancel_backend(pid) FROM pg_stat_activity\nWHERE state = 'active' AND query LIKE 'SELECT /* monthly_report */%'\n  AND now() - query_start > interval '30 seconds';",
        },
      },
      {
        title: "A weekly top-queries report",
        explanation: "Every Monday the team reviews the queries that used the most database time. Step 1: select the top 10 by total time, with calls, mean time, the share of all time, and cache hit percentage. Step 2: pick the top two to investigate with EXPLAIN. Step 3: after deploying fixes, reset the statistics so next week's report shows only new behaviour.",
        code: {
          lang: "sql",
          code: "SELECT queryid, calls,\n       round(total_exec_time) AS total_ms,\n       round(mean_exec_time, 2) AS mean_ms,\n       round(100 * total_exec_time / sum(total_exec_time) OVER (), 1) AS pct_time,\n       round(100.0 * shared_blks_hit\n             / nullif(shared_blks_hit + shared_blks_read, 0), 1) AS hit_pct,\n       left(query, 70) AS query\nFROM pg_stat_statements\nORDER BY total_exec_time DESC\nLIMIT 10;\n\n-- after fixes are deployed:\nSELECT pg_stat_statements_reset();",
        },
      },
    ],
    cheatSheet: [
      "shared_preload_libraries = 'pg_stat_statements' (restart), then CREATE EXTENSION pg_stat_statements;",
      "ORDER BY total_exec_time DESC: where time goes; ORDER BY calls DESC: N+1 suspects",
      "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;",
      "pg_cancel_backend(pid) stops a query; pg_terminate_backend(pid) closes the session",
      "log_min_duration_statement = '500ms'  log slow statements",
      "seq_scan high on a big table in pg_stat_user_tables suggests a missing index",
      "Add application_name=checkout to connection strings to tell services apart",
      "Counters are cumulative: compare over time or reset with pg_stat_statements_reset()",
    ],
    quiz: [
      {
        q: "CREATE EXTENSION pg_stat_statements succeeds, but querying the view errors that it must be loaded via shared_preload_libraries. What is missing?",
        options: ["A superuser password", "An ANALYZE", "Adding it to shared_preload_libraries and restarting the server", "A GRANT on the view"],
        answer: 2,
        why: "The module must be loaded at server start to collect statistics.",
      },
      {
        q: "Which pg_stat_activity state usually points to an application bug?",
        options: ["idle in transaction for a long time", "idle", "active for 2 ms", "fastpath function call"],
        answer: 0,
        why: "An open transaction with nothing running holds locks and old snapshots; the app forgot to commit or roll back.",
      },
      {
        q: "Query A runs 10 times at 2 s each. Query B runs 500,000 times at 1 ms each. Which uses more total server time?",
        options: ["A, because it is slower", "They are equal", "Neither is measurable", "B, with about 500 s against A's 20 s"],
        answer: 3,
        why: "Total time is calls times mean time, which is why ranking by total_exec_time matters.",
      },
      {
        q: "What does pg_cancel_backend(pid) do?",
        options: ["Closes the connection", "Cancels the session's current query but keeps the connection", "Restarts the server", "Rolls back all transactions on the server"],
        answer: 1,
        why: "Cancel stops the running query; pg_terminate_backend ends the whole session.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List all sessions that have been idle in transaction for more than 5 minutes, with user, application and the last query.",
        hint: "Filter on state and compare state_change with now().",
        solution: "SELECT pid, usename, application_name,\n       now() - state_change AS idle_for, left(query, 80) AS last_query\nFROM pg_stat_activity\nWHERE state = 'idle in transaction'\n  AND now() - state_change > interval '5 minutes'\nORDER BY state_change;",
      },
      {
        level: "medium",
        task: "Find the 5 most frequently called queries and the 5 with the highest mean time, using pg_stat_statements.",
        hint: "Two queries, ordering by calls and by mean_exec_time.",
        solution: "SELECT calls, round(mean_exec_time, 2) AS mean_ms, left(query, 70) AS query\nFROM pg_stat_statements ORDER BY calls DESC LIMIT 5;\n\nSELECT calls, round(mean_exec_time, 2) AS mean_ms, left(query, 70) AS query\nFROM pg_stat_statements\nWHERE calls > 10\nORDER BY mean_exec_time DESC LIMIT 5;",
      },
      {
        level: "hard",
        task: "Compute the table cache hit ratio for the database, and list the 5 large tables with the most sequential scans.",
        hint: "pg_statio_user_tables for blocks; pg_stat_user_tables for seq_scan; filter out tiny tables.",
        solution: "SELECT round(100.0 * sum(heap_blks_hit)\n       / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) AS hit_pct\nFROM pg_statio_user_tables;\n\nSELECT relname, seq_scan, idx_scan, n_live_tup\nFROM pg_stat_user_tables\nWHERE n_live_tup > 100000\nORDER BY seq_scan DESC LIMIT 5;",
      },
    ],
    faq: [
      { q: "Does pg_stat_statements slow down the server?", a: "The overhead is small for most workloads, which is why it is commonly left on in production. Very high query rates with many distinct queries see a little more cost." },
      { q: "Why do I see $1 instead of real values in pg_stat_statements?", a: "Queries are normalised so that the same statement with different values is grouped together. To see real values for one slow run, use the server log or auto_explain." },
      { q: "How do I see the database size?", a: "SELECT pg_size_pretty(pg_database_size(current_database())); for the whole database, or pg_total_relation_size('table') for one table including its indexes and TOAST data." },
    ],
  },

  "admin/pooling-config": {
    plain: [
      "Every connection to Postgres starts a new process on the server. That process needs memory, takes a few milliseconds to start, and adds work for the server to track. A hundred connections are fine. Five thousand open connections, mostly doing nothing, make the whole server slower.",
      "Modern apps open many connections: many app instances, each with its own pool, plus workers and cron jobs. A connection pooler sits in the middle. Apps connect to it, and it shares a small number of real server connections among them, like a few checkout lanes serving a long queue of shoppers.",
      "PgBouncer is the most widely used pooler. It is small, fast and simple. In transaction mode it lends a server connection to a client only for one transaction, then gives it to someone else.",
      "Memory settings decide how Postgres uses RAM: shared_buffers for its own cache of data pages, and work_mem for each sort or hash in a query. The defaults are tiny and safe; real servers need a few changes.",
    ],
    deepDive: [
      {
        heading: "Why connections are expensive",
        body: "Postgres uses one operating system process per connection. A new connection means a TCP handshake, often TLS, authentication, and starting a backend process, which usually takes a few milliseconds and some megabytes of memory, growing as the session caches catalog data and runs queries.\n\nIdle connections are not free either. Every active transaction has to look at the state of all other backends when it takes a snapshot, and lock management and memory use grow with the number of connections. PostgreSQL 14 made snapshots with many idle connections much cheaper, but the server still does real work in parallel only up to about its number of CPU cores and disks.\n\nThat is why max_connections defaults to 100 and why raising it to several thousand rarely helps. A widely quoted starting point for the number of active connections is about two times the CPU core count, plus the number of disks. Beyond that, queries just queue inside the server instead of in the pooler.",
        bullets: ["One process per connection", "Connection setup costs milliseconds", "Throughput peaks near a few connections per core", "Raising max_connections is not a scaling plan"],
      },
      {
        heading: "PgBouncer pool modes",
        body: "Session mode gives a client one server connection for as long as it stays connected. It is fully compatible with everything, but saves little if clients stay connected.\n\nTransaction mode gives a client a server connection only for the length of each transaction. Hundreds of mostly idle app connections can then share 20 server connections. This is the mode most people mean when they say \"use PgBouncer\".\n\nThe catch: anything that lives in the session instead of the transaction can break, because your next transaction may run on a different server connection. That includes plain SET (use SET LOCAL instead), session-level advisory locks (use pg_advisory_xact_lock), LISTEN/NOTIFY listeners, temporary tables kept across transactions, and WITH HOLD cursors. Protocol-level prepared statements work in transaction mode since PgBouncer 1.21 if you set max_prepared_statements.\n\nStatement mode is stricter still and does not allow multi-statement transactions; it is rarely used.",
        visual: {
          type: "compare",
          title: "PgBouncer pool modes",
          columns: [
            { title: "session", points: ["Server conn held for the whole session", "Everything works", "Little sharing", "Good for admin tools"] },
            { title: "transaction", points: ["Server conn held per transaction", "Big sharing, most common", "Use SET LOCAL, xact advisory locks", "No LISTEN, no session temp tables"] },
            { title: "statement", points: ["Server conn per statement", "No multi-statement transactions", "Rarely used"] },
          ],
        },
      },
      {
        heading: "Sizing pools end to end",
        body: "Count connections from the outside in. If 10 app instances each keep a client-side pool of 20, that is 200 client connections. Add workers, cron jobs and admin tools. Without a pooler, all of them hit Postgres directly.\n\nWith PgBouncer: max_client_conn is how many clients it accepts (it can be thousands, because idle clients cost PgBouncer almost nothing), and default_pool_size is how many server connections it opens per database and user pair (20 by default). reserve_pool_size adds a few extra for bursts. Keep the sum of all server pools comfortably under max_connections, leaving room for superuser_reserved_connections, replication and maintenance.\n\nWatch it through the admin console: psql -p 6432 -U pgbouncer_admin pgbouncer, then SHOW POOLS. cl_waiting greater than zero for long periods means clients are queueing; either queries are too slow or the pool is too small. Many managed platforms provide a built-in pooler, such as RDS Proxy, or PgBouncer variants.",
        visual: {
          type: "flow",
          title: "Counting connections from app to server",
          steps: [
            { label: "10 app instances", detail: "Each with a client pool of 20" },
            { label: "200 client connections", detail: "Plus workers and cron jobs" },
            { label: "PgBouncer", detail: "max_client_conn = 1000" },
            { label: "20 to 30 server connections", detail: "default_pool_size + reserve_pool_size" },
            { label: "Postgres", detail: "max_connections = 100, plenty of headroom" },
          ],
        },
      },
      {
        heading: "The memory settings that matter",
        body: "shared_buffers is Postgres's own page cache, shared by all backends. The default of 128MB is tiny; about 25 percent of RAM is the usual starting point on a dedicated server. The rest of RAM still helps, because the operating system caches files too. Changing it needs a restart.\n\neffective_cache_size does not allocate anything. It tells the planner how much memory is available for caching in total (shared_buffers plus OS cache), so it can judge index scans fairly; 50 to 75 percent of RAM is typical.\n\nwork_mem (default 4MB) is the memory for each sort or hash operation in each query, before it spills to disk. One query can use several, and parallel workers each get their own, so total use is roughly work_mem times operations times active connections. Keep the global value moderate, such as 16 to 64MB, and raise it per session or per role for heavy reports.\n\nmaintenance_work_mem (default 64MB) is used by VACUUM, CREATE INDEX and similar; 512MB to 1GB speeds them up. On SSDs, lowering random_page_cost from 4 to about 1.1 helps the planner choose indexes.",
        bullets: ["shared_buffers ~25% of RAM (restart)", "effective_cache_size ~50-75% of RAM (planner hint)", "work_mem per sort or hash, per query", "maintenance_work_mem for VACUUM and CREATE INDEX", "random_page_cost about 1.1 on SSD"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Transaction pooling with two clients and one server connection",
        actors: ["Client A", "PgBouncer", "Server conn 1"],
        messages: [
          { from: 0, to: 1, label: "BEGIN; UPDATE ...; COMMIT" },
          { from: 1, to: 2, label: "Runs on server conn 1" },
          { from: 2, to: 1, label: "COMMIT done: conn 1 back in pool" },
          { from: 1, to: 0, label: "Result to A (A stays connected, idle)" },
          { from: 1, to: 2, label: "Client B's transaction now uses conn 1" },
          { from: 2, to: 1, label: "Done: conn 1 back in pool again" },
        ],
      },
    ],
    examples: [
      {
        title: "Putting PgBouncer in front of Postgres",
        explanation: "Step 1: install PgBouncer and list the database in pgbouncer.ini. Step 2: choose transaction mode and pool sizes. Step 3: use scram-sha-256 authentication with a userlist file (or auth_query to look users up in Postgres). Step 4: point the app at port 6432 instead of 5432. Step 5: check SHOW POOLS in the admin console under load.",
        code: {
          lang: "ini",
          code: "; /etc/pgbouncer/pgbouncer.ini\n[databases]\nshop = host=10.0.0.5 port=5432 dbname=shop\n\n[pgbouncer]\nlisten_addr = 0.0.0.0\nlisten_port = 6432\nauth_type = scram-sha-256\nauth_file = /etc/pgbouncer/userlist.txt\npool_mode = transaction\nmax_client_conn = 2000\ndefault_pool_size = 25\nreserve_pool_size = 5\nadmin_users = pgbouncer_admin\nmax_prepared_statements = 100",
        },
      },
      {
        title: "Starting settings for a 32 GB dedicated server",
        explanation: "Step 1: set the memory values with ALTER SYSTEM, which writes them to postgresql.auto.conf. Step 2: check pg_settings: settings whose context is postmaster (like shared_buffers) need a restart, and pending_restart shows which ones are waiting. Step 3: reload for the others. Step 4: give the reporting role a bigger work_mem instead of raising it for everyone. Treat these as starting points and adjust from monitoring.",
        code: {
          lang: "sql",
          code: "ALTER SYSTEM SET shared_buffers = '8GB';          -- restart needed\nALTER SYSTEM SET effective_cache_size = '22GB';\nALTER SYSTEM SET work_mem = '32MB';\nALTER SYSTEM SET maintenance_work_mem = '1GB';\nALTER SYSTEM SET random_page_cost = 1.1;          -- SSD storage\nSELECT pg_reload_conf();\n\nSELECT name, setting, unit, context, pending_restart\nFROM pg_settings\nWHERE name IN ('shared_buffers', 'work_mem', 'effective_cache_size');\n\nALTER ROLE reporting SET work_mem = '256MB';",
        },
      },
    ],
    cheatSheet: [
      "PgBouncer listens on 6432 by default; point apps there instead of 5432",
      "pool_mode = transaction for web apps; use SET LOCAL, not SET",
      "SHOW POOLS; in the pgbouncer admin console: cl_waiting > 0 means clients queue",
      "Sum of all server pools must stay well under max_connections",
      "shared_buffers about 25% of RAM; needs a restart",
      "work_mem applies per sort or hash; raise it per role, not globally",
      "ALTER SYSTEM SET x = y; SELECT pg_reload_conf();  pg_settings.context tells if a restart is needed",
      "SHOW max_connections;  default 100",
    ],
    quiz: [
      {
        q: "With PgBouncer in transaction mode, the app runs SET search_path = tenant_5 once after connecting. What can go wrong?",
        options: ["Nothing", "Later transactions may run on a different server connection that does not have this setting", "PgBouncer rejects SET", "The setting applies to all clients"],
        answer: 1,
        why: "Session state stays on the server connection; use SET LOCAL inside each transaction instead.",
      },
      {
        q: "A server has 16 GB RAM, work_mem = 256MB, and 100 active connections running queries with 3 sorts each. What is the risk?",
        options: ["Queries will be too fast", "Nothing, work_mem is shared", "Memory use could reach tens of GB and the server could run out of memory", "Postgres will refuse to start"],
        answer: 2,
        why: "work_mem is per operation per backend: 100 x 3 x 256MB is about 75 GB in the worst case.",
      },
      {
        q: "What does effective_cache_size do?",
        options: ["Tells the planner how much memory is available for caching; it allocates nothing", "Allocates the shared page cache", "Limits memory per query", "Sets the size of the WAL"],
        answer: 0,
        why: "It is a planning hint used when judging the cost of index scans.",
      },
      {
        q: "The app has 3,000 mostly idle connections and the server is slow. What is the usual fix?",
        options: ["Raise max_connections to 5,000", "Increase shared_buffers to 90% of RAM", "Turn off autovacuum", "Put a connection pooler like PgBouncer in front and reduce server connections"],
        answer: 3,
        why: "A pooler shares a few busy server connections among many clients, which is far cheaper than thousands of backends.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show current values of max_connections, shared_buffers, work_mem and effective_cache_size, and how many connections are in use.",
        hint: "SHOW, or pg_settings, plus a count from pg_stat_activity.",
        solution: "SELECT name, setting, unit FROM pg_settings\nWHERE name IN ('max_connections', 'shared_buffers', 'work_mem', 'effective_cache_size');\n\nSELECT count(*) FROM pg_stat_activity WHERE backend_type = 'client backend';",
      },
      {
        level: "medium",
        task: "Show how many connections each application and user holds, split by state, to find who uses the most.",
        hint: "Group pg_stat_activity by application_name, usename and state.",
        solution: "SELECT application_name, usename, state, count(*)\nFROM pg_stat_activity\nWHERE backend_type = 'client backend'\nGROUP BY 1, 2, 3\nORDER BY count(*) DESC;",
      },
      {
        level: "hard",
        task: "A job uses a session advisory lock to make sure only one copy runs. After moving to PgBouncer transaction mode, two copies sometimes run. Fix it.",
        hint: "Session advisory locks belong to a server connection, which changes between transactions in transaction mode.",
        solution: "-- Before: SELECT pg_try_advisory_lock(42); ... work over many transactions\n-- After: hold a transaction-level lock for the whole job in one transaction\nBEGIN;\nSELECT pg_try_advisory_xact_lock(42);   -- false: another copy is running, so stop\n-- ... do the job's work here ...\nCOMMIT;                                  -- lock released automatically\n-- Or connect this job straight to Postgres (port 5432) in session mode.",
      },
    ],
    faq: [
      { q: "Do I still need PgBouncer if my app has a connection pool?", a: "Often yes. An app pool limits connections per instance, but many instances, workers and serverless functions add up. PgBouncer caps the total that reaches Postgres." },
      { q: "What is the best value for shared_buffers?", a: "About 25 percent of RAM is the common starting point on a dedicated server. Going much higher rarely helps, because the operating system cache also holds data." },
      { q: "Does PgBouncer support prepared statements?", a: "In transaction mode, protocol-level prepared statements work since PgBouncer 1.21 when max_prepared_statements is set above zero. Older versions needed session mode or turning prepared statements off in the driver." },
      { q: "Are there alternatives to PgBouncer?", a: "Yes, for example Pgpool-II, PgCat, Odyssey, and managed options like Amazon RDS Proxy. PgBouncer remains the simplest and most common choice." },
    ],
  },
};

export default extra;
