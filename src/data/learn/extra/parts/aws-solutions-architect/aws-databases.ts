import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-databases/rds-aurora": {
    plain: [
      "Amazon RDS (Relational Database Service) runs a normal SQL database for you: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server or Db2. AWS installs it, patches it, takes backups and replaces broken hardware. You still design the tables, write the queries and choose the size of the server.",
      "Aurora is AWS's own database engine that speaks MySQL or PostgreSQL. Your app uses the same drivers, but under the hood the storage is very different: one shared, self-healing storage volume spread over three Availability Zones, used by every database server in the cluster.",
      "Two features are easy to mix up. Multi-AZ keeps a standby copy in another AZ so the database survives a failure; it is about staying up. Read replicas are extra copies that answer read queries; they are about handling more load. Many production systems use both.",
      "Backups protect you from a different problem: mistakes. If someone deletes a table at 14:05, point-in-time restore can rebuild the database as it was at 14:04. It always creates a new database, so you then point the app at it or copy the missing data back.",
    ],
    deepDive: [
      {
        heading: "What really happens in a Multi-AZ failover",
        body: "With a Multi-AZ DB instance, every write is copied synchronously to a standby in another AZ before the commit is confirmed. The standby takes no traffic. If the primary fails, its AZ has trouble, or you reboot with failover, RDS promotes the standby and points the same DNS endpoint at it. Failover usually takes 60 to 120 seconds, and apps must reconnect, so keep DNS caching short and add retry logic.\n\nRDS also offers a Multi-AZ DB cluster for MySQL and PostgreSQL: one writer and two readable standbys in three AZs, with failover typically under 35 seconds. RDS Proxy sits between the app and the database, pools connections and holds client connections open during failover, which shortens the outage the app sees and protects the database from connection storms, for example from many Lambda functions.",
        visual: {
          type: "sequence",
          title: "Multi-AZ instance failover",
          actors: ["App", "DNS endpoint", "Primary (AZ a)", "Standby (AZ b)"],
          messages: [
            { from: 0, to: 2, label: "INSERT order" },
            { from: 2, to: 3, label: "Synchronous copy" },
            { from: 2, to: 0, label: "Commit OK" },
            { from: 2, to: 2, label: "Primary fails" },
            { from: 3, to: 3, label: "Promoted to primary" },
            { from: 1, to: 0, label: "Same name now points to AZ b" },
            { from: 0, to: 3, label: "Reconnect and continue" },
          ],
        },
      },
      {
        heading: "Read replicas: scaling reads and their limits",
        body: "A read replica receives changes from the primary asynchronously, so under heavy load it can fall seconds behind (watch the ReplicaLag metric). That is fine for reports and dashboards, but not for reading your own write right after saving it. Each replica has its own endpoint, so the app must send reads there itself; RDS does not split traffic for you.\n\nMySQL, MariaDB and PostgreSQL support up to 15 read replicas, and replicas can live in other Regions for local reads or disaster recovery. A replica can be promoted to a standalone database, which ends replication; this is a manual step, unlike Multi-AZ failover. A replica can itself be Multi-AZ. Replication traffic inside one Region is free, while cross-Region replication pays for data transfer.",
      },
      {
        heading: "Backups, snapshots and point-in-time restore",
        body: "Automated backups take a daily snapshot during your backup window and also upload transaction logs to S3 every 5 minutes. Together they let you restore to any second within the retention period, which you set from 1 to 35 days, usually up to about 5 minutes ago. Setting retention to 0 turns automated backups off, and it also blocks read replicas.\n\nManual snapshots are different: you take them, they never expire, and they survive deleting the database, which makes them right for long-term or before-a-change copies. Every restore creates a new DB instance with a new endpoint, and it gets default settings unless you specify them, such as the security group and parameter group. You can copy snapshots to another Region or share them with another account; encrypted snapshots also need access to the KMS key.",
      },
      {
        heading: "Why Aurora storage is different",
        body: "In Aurora, the database servers do not own disks. All instances in a cluster share one storage volume made of 10 GB segments, and each segment is copied six times across three AZs. A write is confirmed when 4 of the 6 copies have it, and a read needs 3 of 6. So Aurora keeps writing through the loss of a whole AZ, and keeps reading even after losing an AZ plus one more copy. Damaged segments repair themselves from the other copies.\n\nBecause replicas read the same storage, no data is shipped to them and lag is usually under 100 milliseconds. Up to 15 Aurora Replicas serve reads behind the reader endpoint, and any of them can become the writer in a failover, often in about 30 seconds. You give each replica a promotion tier from 0 to 15; lower tiers are promoted first. The volume grows automatically as you add data.",
      },
      {
        heading: "Aurora Global Database and Serverless v2",
        body: "Aurora Global Database adds read-only secondary clusters in other Regions. Storage-level replication usually keeps them less than a second behind, which gives an RPO of about one second. In a Region outage you promote a secondary, typically in about a minute; a planned switchover swaps Regions without losing data. Secondaries also give fast local reads to distant users, and write forwarding can pass their occasional writes to the primary.\n\nAurora Serverless v2 changes capacity instead of instance size. You set a minimum and a maximum in ACUs (Aurora Capacity Units, each about 2 GiB of memory with matching CPU), and Aurora scales in 0.5 ACU steps within seconds. On recent engine versions a minimum of 0 ACUs lets an idle database pause. It suits spiky or unpredictable load and dev databases, and you can mix Serverless v2 and normal instances in one cluster.",
        visual: {
          type: "compare",
          title: "Aurora capacity and reach options",
          columns: [
            { title: "Provisioned instances", points: ["Fixed instance size", "Steady, known load", "Reserved Instance discounts"] },
            { title: "Serverless v2", points: ["Scales in 0.5 ACU steps", "Spiky or unknown load", "Can pause at 0 ACUs"] },
            { title: "Global Database", points: ["Secondaries in other Regions", "RPO about 1 second", "Fast local reads worldwide"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Aurora endpoints and what they are for",
        root: "Aurora cluster",
        children: [
          { label: "Cluster (writer) endpoint", children: ["All writes", "Follows the writer after failover"] },
          { label: "Reader endpoint", children: ["Spreads connections across replicas", "DNS-based, per connection"] },
          { label: "Custom endpoint", children: ["A group of chosen instances", "For example big replicas for analytics"] },
          { label: "Instance endpoints", children: ["One specific instance", "For diagnosis or tuning"] },
        ],
      },
      {
        type: "flow",
        title: "Point-in-time restore after a mistake",
        steps: [
          { label: "Daily snapshot", detail: "Taken in the backup window" },
          { label: "Logs every 5 minutes", detail: "Transaction logs copied to S3" },
          { label: "Mistake at 14:05", detail: "A table is dropped" },
          { label: "Restore to 14:04", detail: "Snapshot plus replayed logs" },
          { label: "New instance", detail: "New endpoint, set its security group" },
          { label: "Recover data", detail: "Repoint the app or copy rows back" },
        ],
      },
    ],
    examples: [
      {
        title: "Recover a dropped table with point-in-time restore",
        explanation: "At 14:05 UTC someone ran DROP TABLE orders on prod-db (PostgreSQL). The Multi-AZ standby and the read replicas already have the drop, so they cannot help. Step 1: restore to 14:04 into a new instance. Step 2: wait until it is available and get its endpoint (attach the right security group if needed). Step 3: dump just the lost table from the restored copy and load it into production, then delete the temporary instance to stop paying for it.",
        code: {
          lang: "bash",
          code: "aws rds restore-db-instance-to-point-in-time \\\n  --source-db-instance-identifier prod-db \\\n  --target-db-instance-identifier prod-db-restore \\\n  --restore-time 2026-11-03T14:04:00Z\naws rds wait db-instance-available --db-instance-identifier prod-db-restore\naws rds describe-db-instances --db-instance-identifier prod-db-restore \\\n  --query 'DBInstances[0].Endpoint.Address'\n\n# Copy only the lost table back into production\npg_dump -h RESTORED_ENDPOINT -U admin -t orders appdb > orders.sql\npsql -h PROD_ENDPOINT -U admin -d appdb -f orders.sql",
        },
      },
      {
        title: "Give reporting its own Aurora replica",
        explanation: "Heavy monthly reports slow down the normal readers of an Aurora PostgreSQL cluster. Step 1: add a larger replica just for reports, with promotion tier 15 so it is the last choice to become writer. Step 2: create a custom endpoint whose only member is that replica. Step 3: point the reporting tool at the custom endpoint. The app keeps using the reader endpoint, but report queries no longer compete with it.",
        code: {
          lang: "bash",
          code: "aws rds create-db-instance --db-instance-identifier app-reports \\\n  --db-cluster-identifier app-cluster --engine aurora-postgresql \\\n  --db-instance-class db.r6g.2xlarge --promotion-tier 15\naws rds wait db-instance-available --db-instance-identifier app-reports\n\naws rds create-db-cluster-endpoint --db-cluster-identifier app-cluster \\\n  --db-cluster-endpoint-identifier reports --endpoint-type READER \\\n  --static-members app-reports",
        },
      },
    ],
    cheatSheet: [
      "Multi-AZ = availability (synchronous standby). Read replica = read scaling (asynchronous)",
      "Automated backup retention: 1 to 35 days; restore to within about the last 5 minutes",
      "Every restore creates a new instance with a new endpoint",
      "Manual snapshots never expire and survive deleting the database",
      "Aurora storage: 6 copies in 3 AZs; writes need 4 of 6, reads 3 of 6",
      "Aurora: up to 15 replicas behind one reader endpoint; promotion tier 0 fails over first",
      "Aurora Global Database: RPO about 1 second, read-only secondaries in other Regions",
      "RDS Proxy pools connections and shortens failover for apps with many connections",
    ],
    quiz: [
      {
        q: "The primary of an RDS MySQL Multi-AZ instance fails. What does the app need to do?",
        options: ["Change its connection string to the standby's endpoint", "Just reconnect; the same endpoint now points to the new primary", "Restore from the latest snapshot", "Promote a read replica by hand"],
        answer: 1,
        why: "Multi-AZ failover keeps the endpoint name and moves it to the promoted standby.",
      },
      {
        q: "Which statement about RDS read replicas is true?",
        options: ["Replication to them is synchronous", "They fail over automatically like Multi-AZ", "They can be in another Region and promoted to a standalone database", "They share one storage volume with the primary"],
        answer: 2,
        why: "RDS read replicas use asynchronous replication, can be cross-Region, and are promoted manually.",
      },
      {
        q: "A developer dropped a table 20 minutes ago. Automated backups are on with 7-day retention. What is the right recovery?",
        options: ["Point-in-time restore to just before the drop, into a new instance", "Fail over to the Multi-AZ standby", "Promote a read replica", "Turn off backups and roll back"],
        answer: 0,
        why: "The standby and replicas already have the drop; only a restore goes back in time.",
      },
      {
        q: "How many copies of data does Aurora storage keep, and across how many AZs?",
        options: ["2 copies in 2 AZs", "3 copies in 3 AZs", "6 copies in 3 AZs", "6 copies in 6 AZs"],
        answer: 2,
        why: "Aurora keeps two copies in each of three AZs and uses 4-of-6 write quorums.",
      },
      {
        q: "A dev database is idle most of the day with short bursts of use. Which Aurora option keeps cost lowest?",
        options: ["Aurora Global Database", "A large provisioned instance with reserved pricing", "A Multi-AZ DB cluster", "Aurora Serverless v2 with a low minimum capacity"],
        answer: 3,
        why: "Serverless v2 shrinks to the minimum when idle and grows only during bursts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a small RDS PostgreSQL instance that keeps automated backups for 7 days, then take a manual snapshot of it.",
        hint: "--manage-master-user-password stores the password in Secrets Manager so you never type it.",
        solution: "aws rds create-db-instance --db-instance-identifier lab-pg --engine postgres \\\n  --db-instance-class db.t4g.micro --allocated-storage 20 \\\n  --master-username labadmin --manage-master-user-password \\\n  --backup-retention-period 7 --no-publicly-accessible\naws rds wait db-instance-available --db-instance-identifier lab-pg\naws rds create-db-snapshot --db-instance-identifier lab-pg \\\n  --db-snapshot-identifier lab-pg-before-change\naws rds describe-db-snapshots --db-snapshot-identifier lab-pg-before-change \\\n  --query 'DBSnapshots[0].Status'",
      },
      {
        level: "medium",
        task: "Convert the instance to Multi-AZ, force a failover, and measure how long the database is unreachable.",
        hint: "Run a probe loop from a host in the VPC before you reboot with --force-failover.",
        solution: "aws rds modify-db-instance --db-instance-identifier lab-pg --multi-az --apply-immediately\naws rds wait db-instance-available --db-instance-identifier lab-pg\n# In a second terminal (set PGPASSWORD first), probe once per second:\nwhile true; do date +%T; psql \"host=ENDPOINT user=labadmin dbname=postgres connect_timeout=2\" -tAc 'select 1'; sleep 1; done\naws rds reboot-db-instance --db-instance-identifier lab-pg --force-failover\naws rds describe-events --source-identifier lab-pg --source-type db-instance --duration 30\n# The gap in the probe output is the failover time (often 1 to 2 minutes)",
      },
      {
        level: "hard",
        task: "Create a cross-Region read replica in eu-west-1 for disaster recovery, then promote it and explain what happens to replication.",
        hint: "Run the command in the destination Region and give the source as an ARN.",
        solution: "aws rds create-db-instance-read-replica --region eu-west-1 \\\n  --db-instance-identifier lab-pg-dr --db-instance-class db.t4g.micro \\\n  --source-db-instance-identifier arn:aws:rds:us-east-1:111122223333:db:lab-pg\n# If the source is encrypted, also pass --kms-key-id with a key in eu-west-1\naws rds wait db-instance-available --region eu-west-1 --db-instance-identifier lab-pg-dr\naws rds promote-read-replica --region eu-west-1 --db-instance-identifier lab-pg-dr\n# After promotion: replication stops for good, the copy becomes writable,\n# and it keeps its own endpoint. Point the app at it, then create a new\n# replica in the other direction to be protected again.",
      },
    ],
    faq: [
      { q: "Is Aurora better than RDS for MySQL or PostgreSQL?", a: "Aurora usually gives faster failover, more replicas with lower lag, and storage that grows on its own, at a higher price per instance hour. For small or steady databases, standard RDS is often cheaper." },
      { q: "Can I read from the Multi-AZ standby?", a: "Not with a Multi-AZ DB instance; its standby is passive. A Multi-AZ DB cluster has two readable standbys, and Aurora replicas are always readable." },
      { q: "Does patching an RDS database cause downtime?", a: "Maintenance runs in a weekly window you choose. With Multi-AZ, operating system updates are applied to the standby first and then RDS fails over, so the outage is about the failover time; engine version upgrades still cause a short outage." },
      { q: "What is the difference between a snapshot and an automated backup?", a: "Automated backups are daily snapshots plus transaction logs, kept 1 to 35 days, and allow point-in-time restore. Manual snapshots are single points in time that you keep until you delete them." },
    ],
  },

  "aws-databases/dynamodb": {
    plain: [
      "DynamoDB is a database where you look things up by key, very fast, at any size. There are no servers to manage: you create a table, and AWS spreads the data over many machines for you. A good design answers each request in single-digit milliseconds, whether the table holds 1 MB or 100 TB.",
      "Each item (a row) is found by its primary key. The partition key decides which storage partition holds the item, like the first letter decides the drawer in a filing cabinet. An optional sort key orders items inside that drawer, so you can ask for all orders of one customer, newest first.",
      "Unlike SQL databases, you design DynamoDB around your questions, not your data. First list the access patterns, such as get a user by ID or list a user's orders by date. Then choose keys and indexes so each question is one fast Query. There are no joins, so related data is often stored together.",
      "You pay for storage and for reads and writes. On-demand mode charges per request and scales by itself. Provisioned mode reserves a fixed number of reads and writes per second, which is cheaper when traffic is steady and predictable.",
    ],
    deepDive: [
      {
        heading: "Partitions and hot keys",
        body: "DynamoDB hashes the partition key to pick a partition. Each partition can serve up to 3,000 read capacity units and 1,000 write capacity units per second, and holds about 10 GB; tables split into more partitions as they grow. So the table as a whole can be enormous, but a single key value can only go so fast.\n\nIf most traffic hits one key, for example a status of PENDING or today's date, that partition throttles while the others sit idle. Adaptive capacity shifts capacity toward busy partitions and can split them, but it cannot fix one extremely hot key. The fix is in the design: choose keys with many distinct values, such as userId or orderId, or add a suffix (write sharding), like 2026-11-05#1 to 2026-11-05#10, and read all shards when you need the whole set.",
        visual: {
          type: "flow",
          title: "How a write finds its partition",
          steps: [
            { label: "PutItem", detail: "customerId = c-42" },
            { label: "Hash the key", detail: "c-42 becomes a number" },
            { label: "Pick partition", detail: "Each partition owns a hash range" },
            { label: "Store in 3 AZs", detail: "Replicated before success is returned" },
            { label: "Success", detail: "Uses WCUs from that partition" },
          ],
        },
      },
      {
        heading: "Capacity units in real numbers",
        body: "One RCU (read capacity unit) is one strongly consistent read per second of an item up to 4 KB, or two eventually consistent reads. One WCU (write capacity unit) is one write per second of up to 1 KB. Sizes round up: a strong read of a 9 KB item costs 3 RCUs, and writing a 2.5 KB item costs 3 WCUs. Transactional reads and writes cost double.\n\nExample: 500 eventually consistent reads per second of 6 KB items need 500 x 2 / 2 = 500 RCUs. 100 writes per second of 1.5 KB items need 100 x 2 = 200 WCUs. In provisioned mode you set these numbers, add auto scaling to follow traffic, and can buy reserved capacity for steady loads. In on-demand mode you pay per request with the same rounding, and the table instantly handles up to double its previous peak.",
        bullets: [
          "Strong read: size divided by 4 KB, rounded up",
          "Eventually consistent read: half of that",
          "Write: size divided by 1 KB, rounded up",
          "Transactions: double the units",
        ],
      },
      {
        heading: "GSIs and LSIs: choosing an index",
        body: "A Query can only use a key, so other access patterns need indexes. A global secondary index (GSI) has its own partition and sort key, can be added or removed at any time, and has its own capacity. It is updated asynchronously, so GSI reads are only eventually consistent. If a GSI runs short of write capacity, writes to the base table are throttled too. The default limit is 20 GSIs per table.\n\nA local secondary index (LSI) keeps the same partition key with a different sort key. It must be created together with the table, supports strongly consistent reads, and shares the table's capacity, but it limits each partition key value to 10 GB of data (an item collection). A table can have up to 5 LSIs. Projections (KEYS_ONLY, INCLUDE or ALL) copy only the attributes a query needs, which saves storage and write cost.",
        visual: {
          type: "compare",
          title: "GSI vs LSI",
          columns: [
            { title: "Global secondary index", points: ["Any partition and sort key", "Add or remove at any time", "Eventually consistent reads only", "Own capacity; up to 20 by default"] },
            { title: "Local secondary index", points: ["Same partition key, new sort key", "Only at table creation", "Strongly consistent reads possible", "10 GB per key value; up to 5"] },
          ],
        },
      },
      {
        heading: "DAX, Streams and TTL",
        body: "DAX (DynamoDB Accelerator) is an in-memory cache cluster inside your VPC that speaks the DynamoDB API, so you change the client and keep your code. It caches GetItem and Query results and serves repeat reads in microseconds. Writes go through DAX to the table (write-through). Strongly consistent reads are passed straight to DynamoDB and are not cached, so DAX helps only read-heavy, eventually consistent workloads.\n\nDynamoDB Streams records every item change for 24 hours, in order for each item. A Lambda function can read the stream to update a search index, send emails or keep running totals. TTL lets you give items an expiry time (a number in epoch seconds); DynamoDB deletes expired items for free, usually within a few days, and those deletes appear in the stream so you can archive them.",
      },
      {
        heading: "Global tables and backups",
        body: "Global tables copy a table to other Regions, and every replica accepts reads and writes (multi-active). Changes usually reach the other Regions within about a second. If two Regions update the same item at nearly the same moment, the last writer wins and every Region ends up with that version. Apps that must avoid conflicts often send each user's writes to one home Region.\n\nFor recovery, point-in-time recovery (PITR) can restore a table to any second within up to the last 35 days, and on-demand backups keep full copies until you delete them. Both restore into a new table. Use global tables for Region failures and PITR for mistakes, because a bad write or delete reaches every Region within seconds.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Access patterns drive the keys (online shop)",
        root: "Table: shop (PK, SK)",
        children: [
          { label: "PK CUSTOMER#42, SK PROFILE", children: ["Get a customer's profile"] },
          { label: "PK CUSTOMER#42, SK ORDER#2026-11-03", children: ["List a customer's orders by date", "Query with begins_with ORDER#"] },
          { label: "GSI1: PK ORDER#9001", children: ["Look up one order by its ID"] },
          { label: "GSI2: PK PRODUCT#7, SK date", children: ["Recent orders of one product"] },
        ],
      },
      {
        type: "sequence",
        title: "Reads and writes through DAX",
        actors: ["App", "DAX", "DynamoDB"],
        messages: [
          { from: 0, to: 1, label: "GetItem user 42" },
          { from: 1, to: 2, label: "Cache miss: GetItem" },
          { from: 2, to: 1, label: "Item" },
          { from: 1, to: 0, label: "Item (milliseconds)" },
          { from: 0, to: 1, label: "GetItem user 42 again" },
          { from: 1, to: 0, label: "From cache (microseconds)" },
          { from: 0, to: 1, label: "PutItem user 42" },
          { from: 1, to: 2, label: "Write-through, then update cache" },
        ],
      },
    ],
    examples: [
      {
        title: "Querying orders and adding a lookup index",
        explanation: "The orders table has partition key customerId and sort key orderDate. Step 1: list one customer's November orders, newest first, with one Query using begins_with on the sort key. Step 2: support finding an order by its ID by adding a GSI on orderId, which can be done on a live table. The GSI only needs KEYS_ONLY projection if the app then fetches full items by key. Step 3: query the new index once it is ACTIVE.",
        code: {
          lang: "bash",
          code: "aws dynamodb query --table-name orders \\\n  --key-condition-expression 'customerId = :c AND begins_with(orderDate, :m)' \\\n  --expression-attribute-values '{\":c\": {\"S\": \"c-42\"}, \":m\": {\"S\": \"2026-11\"}}' \\\n  --no-scan-index-forward\n\naws dynamodb update-table --table-name orders \\\n  --attribute-definitions AttributeName=orderId,AttributeType=S \\\n  --global-secondary-index-updates '[{\"Create\": {\"IndexName\": \"orderId-index\",\n    \"KeySchema\": [{\"AttributeName\": \"orderId\", \"KeyType\": \"HASH\"}],\n    \"Projection\": {\"ProjectionType\": \"KEYS_ONLY\"}}}]'\n\naws dynamodb query --table-name orders --index-name orderId-index \\\n  --key-condition-expression 'orderId = :o' \\\n  --expression-attribute-values '{\":o\": {\"S\": \"o-9001\"}}'",
        },
      },
      {
        title: "Sizing a table for a ticket sale",
        explanation: "Normally the app does 200 strongly consistent reads per second of 3 KB items and 50 writes per second of 0.5 KB items. During a ticket sale both jump about 20 times for ten minutes. Step 1: compute normal capacity: 200 RCUs and 50 WCUs. Step 2: compute the peak: 4,000 RCUs and 1,000 WCUs. Step 3: decide. Provisioned auto scaling reacts over minutes, which is too slow for a sudden spike, so either use on-demand or raise provisioned capacity before the sale. Also check that ticket IDs, not the event ID, are the partition key, or one partition caps writes at 1,000 WCUs.",
        code: {
          lang: "python",
          code: "import math\n\ndef rcu(size_kb, per_sec, strong=True):\n    units = math.ceil(size_kb / 4) * per_sec\n    return units if strong else math.ceil(units / 2)\n\ndef wcu(size_kb, per_sec):\n    return math.ceil(size_kb) * per_sec\n\nprint(rcu(3, 200), wcu(0.5, 50))      # 200 50   normal\nprint(rcu(3, 4000), wcu(0.5, 1000))   # 4000 1000 peak",
        },
      },
    ],
    cheatSheet: [
      "Item max 400 KB; pick a partition key with many distinct values",
      "Per partition: up to 3,000 RCU and 1,000 WCU per second",
      "RCU: one 4 KB strong read per second (or two eventual). WCU: one 1 KB write per second",
      "GSI: any keys, add anytime, eventual reads. LSI: same PK, only at creation, 10 GB per PK",
      "Query uses keys and is cheap; Scan reads the whole table and is expensive",
      "DAX caches eventually consistent reads in microseconds; strong reads skip the cache",
      "Streams keep item changes for 24 hours; TTL deletes expired items for free",
      "PITR restores to any second within up to 35 days, always into a new table",
    ],
    quiz: [
      {
        q: "How many RCUs does one strongly consistent read of an 11 KB item use?",
        options: ["2", "3", "11", "1"],
        answer: 1,
        why: "11 KB divided by 4 KB is 2.75, which rounds up to 3.",
      },
      {
        q: "A table has plenty of write capacity but writes are throttled. A GSI on it has low write capacity. What is happening?",
        options: ["The table is larger than 10 GB", "DAX is blocking the writes", "The GSI cannot keep up, so writes to the base table are throttled", "Streams slow down every write"],
        answer: 2,
        why: "Every table write must also be applied to its GSIs, so a throttled GSI pushes back on the table.",
      },
      {
        q: "Which kind of index can you add to an existing table?",
        options: ["Only an LSI", "Only a GSI", "Both GSI and LSI", "Neither; you must recreate the table"],
        answer: 1,
        why: "LSIs must be defined when the table is created; GSIs can be added any time.",
      },
      {
        q: "Which workload benefits LEAST from DAX?",
        options: ["Product pages read thousands of times per second", "Repeated reads of the same session items", "A read-heavy catalog using eventually consistent reads", "A write-heavy IoT ingest table"],
        answer: 3,
        why: "DAX speeds up repeated reads; writes still go to DynamoDB at normal speed.",
      },
      {
        q: "Two Regions update the same item of a global table at nearly the same time. What happens?",
        options: ["The last writer wins and all Regions converge on it", "Both writes fail with a conflict error", "DynamoDB keeps both as separate items", "The Region created first always wins"],
        answer: 0,
        why: "Global tables resolve concurrent updates with last-writer-wins.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Put three orders for customer c-42 into the orders table (customerId plus orderDate key), then query them newest first.",
        hint: "Use a small shell loop for put-item and --no-scan-index-forward on the query.",
        solution: "for d in 2026-11-01 2026-11-02 2026-11-03; do\n  aws dynamodb put-item --table-name orders --item \\\n    \"{\\\"customerId\\\": {\\\"S\\\": \\\"c-42\\\"}, \\\"orderDate\\\": {\\\"S\\\": \\\"$d\\\"}, \\\"total\\\": {\\\"N\\\": \\\"25\\\"}}\"\ndone\naws dynamodb query --table-name orders \\\n  --key-condition-expression 'customerId = :c' \\\n  --expression-attribute-values '{\":c\": {\"S\": \"c-42\"}}' --no-scan-index-forward",
      },
      {
        level: "medium",
        task: "Turn on TTL with the attribute expiresAt and write an item that expires one hour from now.",
        hint: "TTL values are numbers in epoch seconds. date +%s prints the current one.",
        solution: "aws dynamodb update-time-to-live --table-name orders \\\n  --time-to-live-specification Enabled=true,AttributeName=expiresAt\nEXP=$(( $(date +%s) + 3600 ))\naws dynamodb put-item --table-name orders --item \\\n  '{\"customerId\": {\"S\": \"c-99\"}, \"orderDate\": {\"S\": \"2026-11-05\"}, \"expiresAt\": {\"N\": \"'$EXP'\"}}'\naws dynamodb describe-time-to-live --table-name orders\n# Deletion is free and usually happens within a few days after expiresAt.\n# Until then, filter out expired items in your queries.",
      },
      {
        level: "hard",
        task: "Write a Python function with boto3 that sums the total attribute of all orders for one customer, handling result pages correctly.",
        hint: "A Query returns at most 1 MB per call. Keep calling with ExclusiveStartKey while LastEvaluatedKey is present.",
        solution: "import boto3\nfrom boto3.dynamodb.conditions import Key\ntable = boto3.resource(\"dynamodb\").Table(\"orders\")\n\ndef customer_total(customer_id):\n    total, kwargs = 0, {\"KeyConditionExpression\": Key(\"customerId\").eq(customer_id)}\n    while True:\n        page = table.query(**kwargs)\n        total += sum(item.get(\"total\", 0) for item in page[\"Items\"])\n        if \"LastEvaluatedKey\" not in page:\n            return total\n        kwargs[\"ExclusiveStartKey\"] = page[\"LastEvaluatedKey\"]",
      },
    ],
    faq: [
      { q: "Is DynamoDB a NoSQL database?", a: "Yes. It is a key-value and document database with no joins and no fixed schema beyond the key attributes. It also accepts a SQL-like language called PartiQL, but queries still follow the same key-based rules." },
      { q: "When should I use Scan?", a: "Rarely in normal request paths. A Scan reads every item and uses capacity for all of them; keep it for one-off exports or small tables, and design a key or GSI for anything frequent." },
      { q: "On-demand or provisioned: which is cheaper?", a: "For steady, predictable traffic, provisioned with auto scaling is usually cheaper. For new, spiky or mostly idle tables, on-demand usually wins because you pay nothing for unused capacity." },
      { q: "What is the maximum item size in DynamoDB?", a: "400 KB, including attribute names. Store larger blobs in S3 and keep the S3 key in the item." },
    ],
  },

  "aws-databases/caching": {
    plain: [
      "A cache is a small, very fast store that keeps copies of data you read often. Reading from memory takes well under a millisecond, while a database query might take 5 to 50 milliseconds and uses database CPU. If 90 percent of reads come from the cache, the database sees only one read in ten.",
      "Amazon ElastiCache runs in-memory caches for you. You choose an engine: Valkey or Redis OSS (feature-rich, can replicate and fail over) or Memcached (simple and multi-threaded). AWS handles the servers, patching, monitoring and replacing failed nodes.",
      "The hard part of caching is not speed but freshness. When data changes in the database, the cached copy is now old, or stale. Every caching strategy is an answer to one question: when do we put data into the cache, and when do we throw it away?",
      "Caches work best for data that is read far more often than it changes: product pages, user profiles, settings, results of expensive queries, and login sessions. They help less for data that changes on every request or must always be exactly current, like a bank balance during a transfer.",
    ],
    deepDive: [
      {
        heading: "Lazy loading vs write-through in practice",
        body: "With lazy loading (cache-aside), the app checks the cache first and only on a miss reads the database and stores the result. Only data someone asked for gets cached, and losing a cache node just means more misses for a while. The cost: every miss takes three trips (cache, database, cache), and data can be stale until its TTL ends.\n\nWith write-through, the app writes to the database and then updates the cache in the same code path. Reads are nearly always fresh hits, but you also cache data nobody reads, and a new or replaced node starts empty until writes refill it. Real systems usually combine them: write-through for data read soon after it is written, lazy loading for everything else, and a TTL on every key as a safety net. A simple, popular variant is to delete the key on every write and let the next read reload it.",
        visual: {
          type: "compare",
          title: "Two ways to fill a cache",
          columns: [
            { title: "Lazy loading", points: ["Filled on a read miss", "Only requested data is cached", "Can be stale until the TTL ends", "An empty cache only means misses"] },
            { title: "Write-through", points: ["Filled on every write", "Cache stays fresh", "Also caches data nobody reads", "A new node starts empty"] },
          ],
        },
      },
      {
        heading: "TTLs, eviction and the thundering herd",
        body: "A TTL (time to live) makes a key expire after a set time, for example 300 seconds for a product page. Short TTLs mean fresher data but more misses. Add some random jitter, such as 300 seconds plus up to 60 more, so thousands of keys written together do not all expire at the same moment.\n\nWhen memory is full, the engine evicts keys according to the maxmemory-policy setting. In ElastiCache for Valkey and Redis OSS the default is volatile-lru, which removes the least recently used keys that have a TTL. If a very popular key expires, hundreds of requests can miss together and all hit the database; this is called a thundering herd or cache stampede. Fixes include a short lock so only one request rebuilds the value, refreshing hot keys before they expire, or serving the old value while one worker refreshes it.",
      },
      {
        heading: "Valkey and Redis OSS features that matter",
        body: "Valkey is an open-source fork of Redis, and ElastiCache offers both as compatible engines, with Valkey priced lower. Beyond plain strings they offer hashes, lists, sets, sorted sets for leaderboards, streams, pub/sub, and atomic counters with INCR. That makes them useful for sessions, rate limiters and simple queues, not only caching.\n\nFor availability, each shard has one primary and up to 5 replicas, with Multi-AZ automatic failover to a replica. Cluster mode enabled splits data across many shards by hash slot, so memory and write capacity can grow beyond one node. ElastiCache Serverless removes node sizing and bills for data stored and requests processed. Turn on encryption in transit and authentication (AUTH tokens, user-based access control or IAM). The default port is 6379 for Valkey and Redis OSS and 11211 for Memcached.",
      },
      {
        heading: "Memcached: when simple wins",
        body: "Memcached stores only strings (blobs) by key, with no replication, no persistence and no backups. Each node is independent, and the client library spreads keys across nodes, so adding nodes adds memory and throughput. It is multi-threaded, so one large node can use many CPU cores well.\n\nIf a node fails, its keys are simply gone and the app refills them from the database. That is fine for a pure cache of easily rebuilt data, such as rendered HTML fragments or query results. It is not fine for sessions, counters or anything you cannot lose. On the exam, words like sorted sets, pub/sub, persistence, Multi-AZ failover or backups point to Valkey or Redis OSS; a plain, multi-threaded, simple object cache points to Memcached.",
      },
      {
        heading: "Where else to cache on AWS",
        body: "ElastiCache is only one layer. CloudFront caches whole HTTP responses at edge locations near users, which is often the biggest win for static files and public API responses. API Gateway REST APIs can cache responses per stage. DAX caches DynamoDB reads in microseconds. RDS read replicas are not a cache, but they absorb read load in a similar way.\n\nPick the layer closest to the user that still gives correct results. A product image belongs in CloudFront, a user's cart belongs in Valkey, and a hot DynamoDB item may only need DAX. Be careful caching personal data at the edge: if the cache key is wrong, one user's page can be shown to another.",
        visual: {
          type: "layers",
          title: "Cache layers from user to database",
          layers: [
            { label: "Browser cache", detail: "Cache-Control headers, nothing leaves the device" },
            { label: "CloudFront edge", detail: "Static files and public responses near users" },
            { label: "API Gateway cache", detail: "Per-stage response cache for REST APIs" },
            { label: "ElastiCache", detail: "Sessions, query results, computed objects" },
            { label: "DAX or read replicas", detail: "Take read load off the main database" },
            { label: "Database", detail: "The source of truth" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "ElastiCache deployment options",
        root: "Amazon ElastiCache",
        children: [
          { label: "Serverless", children: ["No nodes to size", "Pay per GB stored and requests"] },
          { label: "Valkey or Redis OSS, cluster mode off", children: ["One shard", "Primary plus up to 5 replicas"] },
          { label: "Valkey or Redis OSS, cluster mode on", children: ["Many shards by hash slot", "Scales memory and writes"] },
          { label: "Memcached", children: ["Independent nodes", "Client spreads the keys", "No replication"] },
        ],
      },
      {
        type: "sequence",
        title: "Write-through update",
        actors: ["App", "Database", "Cache"],
        messages: [
          { from: 0, to: 1, label: "UPDATE price of product 7" },
          { from: 1, to: 0, label: "OK" },
          { from: 0, to: 2, label: "SET product:7 new value, TTL 300" },
          { from: 0, to: 2, label: "Later: GET product:7" },
          { from: 2, to: 0, label: "Hit: fresh value" },
        ],
      },
    ],
    examples: [
      {
        title: "Cache-aside for product pages in Python",
        explanation: "Product pages are read thousands of times per minute but prices change a few times a day. Step 1: on each read, try the cache; on a miss, load from the database and store the result with a TTL of 5 minutes plus random jitter. Step 2: when a price changes, update the database and delete the cached key, so the next read loads the new price. Here db stands for your own database access code, and CACHE_ENDPOINT is the cluster's primary endpoint.",
        code: {
          lang: "python",
          code: "import json, random, redis\nr = redis.Redis(host=\"CACHE_ENDPOINT\", port=6379, ssl=True)\n\ndef get_product(pid, db):\n    key = f\"product:{pid}\"\n    cached = r.get(key)\n    if cached:\n        return json.loads(cached)                        # hit\n    row = db.fetch_product(pid)                          # miss: ask the database\n    r.set(key, json.dumps(row), ex=300 + random.randint(0, 60))\n    return row\n\ndef update_price(pid, price, db):\n    db.update_price(pid, price)\n    r.delete(f\"product:{pid}\")                           # next read reloads it",
        },
      },
      {
        title: "A game leaderboard with sorted sets",
        explanation: "A game needs a live top-3 list and each player's rank. A sorted set keeps members ordered by score, so updates and rank lookups are fast even with millions of players. Step 1: add players with ZADD. Step 2: ZINCRBY adds points after each match. Step 3: ZRANGE with REV reads the top players, and ZREVRANK returns a player's position counting from 0 at the top. These commands work the same in Valkey and Redis OSS (REV needs version 6.2 or later).",
        code: {
          lang: "text",
          code: "ZADD leaderboard 1500 alice 2300 bob 1800 carol\nZINCRBY leaderboard 400 alice            # alice now has 1900\nZRANGE leaderboard 0 2 REV WITHSCORES   # bob 2300, alice 1900, carol 1800\nZREVRANK leaderboard alice               # 1 (second place)",
        },
      },
    ],
    cheatSheet: [
      "Lazy loading: read cache; on a miss read the DB and SET with a TTL",
      "Write-through: update the cache every time you write the database",
      "Always set a TTL, and add random jitter so keys don't expire together",
      "ElastiCache default eviction for Valkey and Redis OSS: volatile-lru",
      "Ports: 6379 for Valkey and Redis OSS, 11211 for Memcached",
      "Need failover, backups, sorted sets or pub/sub? Valkey or Redis OSS, not Memcached",
      "One Valkey or Redis OSS shard: one primary plus up to 5 replicas",
      "Cache static content in CloudFront first; use ElastiCache for app data",
    ],
    quiz: [
      {
        q: "What problem does adding random jitter to TTLs solve?",
        options: ["Many keys expiring at the same moment and flooding the database", "Keys that never expire", "Memory fragmentation", "Slow replication to replicas"],
        answer: 0,
        why: "Jitter spreads expiry times so misses do not all arrive together.",
      },
      {
        q: "Which caching strategy can serve stale data until the key's TTL ends?",
        options: ["Write-through", "Lazy loading", "Delete-on-write with immediate reload", "Not caching at all"],
        answer: 1,
        why: "Lazy loading only refreshes a key on a miss, so changes are not seen until it expires.",
      },
      {
        q: "A Memcached node fails. What happens to the data it held?",
        options: ["It fails over to a replica", "It is restored from the last backup", "It is lost, and the app reloads it from the database", "It moves to another node automatically"],
        answer: 2,
        why: "Memcached has no replication or persistence; the cache is simply refilled.",
      },
      {
        q: "A very popular key expires and 500 requests miss at once, overloading the database. What is this and what helps?",
        options: ["A hot partition; add a GSI", "Replica lag; add a replica", "Eviction; add memory", "A cache stampede; let one request rebuild the key while others wait or get the old value"],
        answer: 3,
        why: "A lock or early refresh means only one request hits the database for that key.",
      },
      {
        q: "Which AWS service caches whole HTTP responses close to users?",
        options: ["ElastiCache", "CloudFront", "DAX", "RDS Proxy"],
        answer: 1,
        why: "CloudFront caches responses at edge locations around the world.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run Valkey locally in Docker and try SET with a TTL, GET and TTL.",
        hint: "The official image is valkey/valkey and its command-line client is valkey-cli.",
        solution: "docker run -d --name cache -p 6379:6379 valkey/valkey:8\ndocker exec -it cache valkey-cli\nSET user:42 '{\"name\":\"Ana\"}' EX 60\nGET user:42\nTTL user:42      # seconds left, for example 57\n# after 60 seconds:\nGET user:42      # (nil)",
      },
      {
        level: "medium",
        task: "Measure the speedup of caching: time 100 calls of a slow function with a lazy-loading cache in front of it.",
        hint: "Use time.sleep to fake a 50 ms database query and time.perf_counter to measure.",
        solution: "import json, time, redis\nr = redis.Redis()   # the local Valkey from the easy task\ndef slow_query(uid):\n    time.sleep(0.05)   # pretend the database takes 50 ms\n    return {\"id\": uid}\ndef cached(uid):\n    if (hit := r.get(f\"u:{uid}\")): return json.loads(hit)\n    val = slow_query(uid); r.set(f\"u:{uid}\", json.dumps(val), ex=60); return val\nt = time.perf_counter(); [cached(1) for _ in range(100)]\nprint(f\"100 reads: {time.perf_counter() - t:.2f}s\")  # about 0.06 s, not 5 s",
      },
      {
        level: "hard",
        task: "Create an ElastiCache for Valkey replication group with one replica and Multi-AZ, then trigger a failover and watch the roles change.",
        hint: "Use --num-cache-clusters 2 with automatic failover and Multi-AZ enabled, then aws elasticache test-failover.",
        solution: "aws elasticache create-replication-group --replication-group-id lab-cache \\\n  --replication-group-description lab --engine valkey --cache-node-type cache.t4g.micro \\\n  --num-cache-clusters 2 --automatic-failover-enabled --multi-az-enabled \\\n  --cache-subnet-group-name my-subnets --security-group-ids sg-0abc1234 \\\n  --transit-encryption-enabled\naws elasticache wait replication-group-available --replication-group-id lab-cache\naws elasticache describe-replication-groups --replication-group-id lab-cache \\\n  --query 'ReplicationGroups[0].NodeGroups[0].NodeGroupMembers[].[CacheClusterId,CurrentRole]'\naws elasticache test-failover --replication-group-id lab-cache --node-group-id 0001\n# Run the describe command again after a minute: the roles have swapped.\n# Apps using the primary endpoint keep working after a short reconnect.",
      },
    ],
    faq: [
      { q: "What is the difference between Valkey and Redis on ElastiCache?", a: "Valkey is an open-source fork of Redis created in 2024 after Redis changed its license. ElastiCache supports both with the same common commands, and Valkey costs less, so it is the usual choice for new clusters." },
      { q: "Should I cache everything?", a: "No. Cache data that is read often and changes rarely, and watch the hit rate. A cache with a low hit rate adds cost and complexity without helping." },
      { q: "Can I connect to ElastiCache from the internet?", a: "Not directly. ElastiCache nodes live in your VPC with private IP addresses, so clients must run in the VPC or connect through VPN, Direct Connect or peering." },
      { q: "Is ElastiCache a database?", a: "It can hold data like one, but it lives in memory and is mainly designed as a cache. If you need Redis-compatible data that must never be lost, look at Amazon MemoryDB, which stores data durably across AZs." },
    ],
  },

  "aws-databases/analytics": {
    plain: [
      "Analytics means asking questions of large amounts of data: how many users signed up per country last month, which pages are slow, what is selling right now. On AWS, the usual pattern is to collect data, store it cheaply in S3 (a data lake), describe it in a catalog, and query it with the tool that fits.",
      "Some data arrives as a stream: clicks, sensor readings, log lines, thousands per second. Kinesis Data Streams captures these events and lets several programs read them in real time. Amazon Data Firehose is simpler: it collects a stream and delivers it in batches to S3, Redshift, OpenSearch and other places, with no code to run.",
      "Once data sits in S3, a Glue crawler works out the columns and records them as tables in the Glue Data Catalog. Athena then lets you run SQL straight on the files. You pay for the data each query scans, so storing data in a compact, column-based format makes queries both cheaper and faster.",
      "For heavy, repeated business reporting, Redshift is a data warehouse built for complex SQL over billions of rows. For searching text and exploring logs, OpenSearch indexes documents so you can search them and build dashboards in near real time. Choosing between them depends on the question you want to ask.",
    ],
    deepDive: [
      {
        heading: "Kinesis Data Streams: shards and ordering",
        body: "A stream is made of shards. In provisioned mode each shard accepts up to 1 MB per second or 1,000 records per second of writes, and serves up to 2 MB per second of reads shared by all standard consumers. On-demand mode adds and removes shards for you. Each record has a partition key: records with the same key go to the same shard and stay in order. A key such as deviceId keeps each device's events in order while spreading load.\n\nData is kept for 24 hours by default and up to 365 days, so consumers can replay it. Enhanced fan-out gives each registered consumer its own 2 MB per second per shard, pushed over HTTP/2, which suits many readers that need low latency. Consumers include Lambda, the Kinesis Client Library (KCL) on EC2 or containers, Amazon Managed Service for Apache Flink, and Firehose.",
      },
      {
        heading: "Firehose: delivery without code",
        body: "Amazon Data Firehose (formerly Kinesis Data Firehose) receives records directly from producers or from a Kinesis stream and delivers them to S3, Redshift, OpenSearch, Splunk, Snowflake, HTTP endpoints and more. It buffers records by size and time and writes them in batches, so delivery is near real time (seconds to minutes) rather than instant. It scales by itself and has no shards to manage.\n\nOn the way it can call a Lambda function to transform records, convert JSON to Parquet or ORC using a schema from the Glue Data Catalog, compress files, and build S3 paths from values inside the records (dynamic partitioning). Failed records go to an S3 error prefix. Firehose cannot replay data or feed several custom consumers; that is what Data Streams is for. Delivery to Redshift works by writing to S3 first and then running a COPY command.",
        visual: {
          type: "compare",
          title: "Data Streams vs Firehose",
          columns: [
            { title: "Kinesis Data Streams", points: ["Real time, well under a second", "Many consumers, replay up to 365 days", "Shards, or on-demand mode", "You write or choose the consumers"] },
            { title: "Amazon Data Firehose", points: ["Near real time, buffered batches", "Delivers to S3, Redshift, OpenSearch and more", "Fully managed, no shards", "Transforms and converts to Parquet"] },
          ],
        },
      },
      {
        heading: "Making Athena fast and cheap",
        body: "Athena is serverless SQL based on the Trino engine. It reads files in S3 using table definitions from the Glue Data Catalog and charges for the data scanned, with a 10 MB minimum per query, so the main lever is scanning less. Three habits matter most. Use a columnar format such as Parquet, so a query reading 3 of 50 columns skips the rest. Compress the files. Partition the data by the columns you filter on, for example s3://logs/dt=2026-11-05/, so a WHERE on date skips whole folders.\n\nAvoid millions of tiny files; aim for files of roughly 128 MB or larger. Partition projection lets Athena calculate partition locations from a pattern instead of looking them up. Workgroups separate teams, keep query results apart, and can cap the data scanned per query to stop runaway costs. CREATE TABLE AS SELECT (CTAS) turns raw CSV or JSON into partitioned Parquet in one statement.",
        visual: {
          type: "flow",
          title: "Scanning less with each step",
          steps: [
            { label: "Raw CSV", detail: "Every query reads every byte" },
            { label: "Convert to Parquet", detail: "Read only the columns you select" },
            { label: "Compress", detail: "Fewer bytes stored and scanned" },
            { label: "Partition by date", detail: "WHERE dt skips other days" },
            { label: "Right-size files", detail: "Fewer, larger files read faster" },
          ],
        },
      },
      {
        heading: "Glue: catalog and ETL",
        body: "The Glue Data Catalog is a central list of databases, tables, columns and partition locations, shared by Athena, Redshift Spectrum, EMR and Glue jobs. A crawler scans an S3 path, guesses the format and schema, and creates or updates tables. Schedule crawlers, or add partitions yourself to avoid crawling huge buckets again and again.\n\nGlue ETL (extract, transform, load) jobs run serverless Apache Spark, or plain Python, to clean, join and convert data, for example raw JSON into partitioned Parquet. Job bookmarks remember what was already processed, so each run handles only new files. Glue DataBrew offers a visual way to clean data without code. AWS Lake Formation builds on the catalog to grant fine-grained permissions, down to columns and rows, across these services.",
      },
      {
        heading: "Redshift, OpenSearch, or something else?",
        body: "Redshift is a columnar, massively parallel data warehouse. It shines when analysts run complex joins and aggregations over large, structured history every day, with BI tools connected over JDBC or ODBC. RA3 nodes separate compute from managed storage, Redshift Serverless removes cluster sizing, Spectrum queries data in S3 without loading it, and zero-ETL integrations copy data from Aurora or DynamoDB automatically.\n\nOpenSearch Service is a search engine. It builds inverted indexes over documents, so full-text search, fuzzy matching and log exploration return in milliseconds, with OpenSearch Dashboards for charts. It is not built for large SQL joins. Other common exam answers: EMR for running your own Spark or Hadoop at scale, Managed Service for Apache Flink for real-time processing of streams, and QuickSight for business dashboards on top of any of them.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Match the question to the service",
        root: "What do you need?",
        children: [
          { label: "Ad hoc SQL on files in S3", children: ["Athena"] },
          { label: "Daily BI on structured history", children: ["Redshift"] },
          { label: "Full-text search and log dashboards", children: ["OpenSearch Service"] },
          { label: "Custom Spark or Hadoop jobs", children: ["EMR", "Glue ETL for serverless Spark"] },
          { label: "Real-time processing of a stream", children: ["Managed Service for Apache Flink", "Lambda for simple per-record logic"] },
          { label: "Business dashboards", children: ["QuickSight"] },
        ],
      },
      {
        type: "layers",
        title: "A data lake on S3",
        layers: [
          { label: "Consumers", detail: "Athena, Redshift Spectrum, EMR, QuickSight" },
          { label: "Governance", detail: "Lake Formation column and row permissions" },
          { label: "Catalog", detail: "Glue Data Catalog tables and partitions" },
          { label: "Curated zone", detail: "Cleaned, partitioned Parquet" },
          { label: "Raw zone", detail: "Original JSON and CSV as delivered" },
          { label: "Ingestion", detail: "Firehose, DataSync, DMS, batch uploads" },
        ],
      },
    ],
    examples: [
      {
        title: "From JSON logs to cheap Athena queries",
        explanation: "A crawler created the table raw_logs over JSON files, and every query scans all of them. Step 1: run one CTAS statement that writes compressed Parquet to a new S3 location, partitioned by the day column dt (partition columns must come last in the SELECT; one CTAS can create up to 100 partitions, so convert large histories in batches). Step 2: query the new table. Filtering on dt and naming only a few columns now scans a small fraction of the data.",
        code: {
          lang: "sql",
          code: "CREATE TABLE logs_parquet\nWITH (\n  format = 'PARQUET',\n  write_compression = 'SNAPPY',\n  external_location = 's3://my-logs/curated/',\n  partitioned_by = ARRAY['dt']\n) AS\nSELECT request_id, status, latency_ms, path, dt\nFROM raw_logs;\n\n-- Scans one day and three columns instead of everything\nSELECT path, avg(latency_ms) AS avg_ms FROM logs_parquet\nWHERE dt = '2026-11-05' AND status >= 500\nGROUP BY path;",
        },
      },
      {
        title: "Designing a clickstream pipeline",
        explanation: "A shop wants fraud checks on checkout clicks within a second, plus all clicks stored for later SQL analysis. Step 1: send events to Kinesis Data Streams with sessionId as the partition key, so each session stays in order. At 5,000 events per second of 1 KB, that needs at least 5 shards in provisioned mode, or on-demand mode if traffic is unpredictable. Step 2: a Lambda consumer runs the fraud rules in real time. Step 3: Firehose reads the same stream, converts to Parquet and writes to S3 every few minutes. Step 4: a Glue table and Athena serve the analysts.",
        code: {
          lang: "python",
          code: "import boto3, json\n\nkinesis = boto3.client(\"kinesis\")\nevent = {\"sessionId\": \"s-81\", \"page\": \"/checkout\", \"ts\": \"2026-11-05T10:15:02Z\"}\n\nkinesis.put_record(\n    StreamName=\"clicks\",\n    Data=json.dumps(event).encode(),\n    PartitionKey=event[\"sessionId\"],   # same session, same shard, same order\n)",
        },
      },
    ],
    cheatSheet: [
      "Kinesis shard: 1 MB/s or 1,000 records/s in; 2 MB/s out, shared by standard consumers",
      "Kinesis retention: 24 hours by default, up to 365 days; consumers can replay",
      "Firehose: buffered, near real time, no replay; converts to Parquet and delivers to S3",
      "Athena bills per data scanned (10 MB minimum); Parquet plus partitions cuts cost and time",
      "Glue crawlers fill the Data Catalog used by Athena, EMR and Redshift Spectrum",
      "Lake Formation: column and row level permissions on the data lake",
      "Redshift for BI and complex joins; OpenSearch for full-text search and log dashboards",
      "Real-time processing of streams: Amazon Managed Service for Apache Flink",
    ],
    quiz: [
      {
        q: "A stream receives 3,000 records per second of 0.5 KB each. What is the minimum number of provisioned shards?",
        options: ["1", "2", "3", "6"],
        answer: 2,
        why: "Each shard takes at most 1,000 records per second, so 3,000 records need 3 shards even though 1.5 MB/s would fit in 2.",
      },
      {
        q: "Several applications must read the same stream independently, and one must reprocess the last 3 days after a bug fix. Which service?",
        options: ["Kinesis Data Streams with longer retention", "Amazon Data Firehose", "An SQS standard queue", "Athena"],
        answer: 0,
        why: "Data Streams supports many consumers and replay within its retention period.",
      },
      {
        q: "Athena queries on 2 TB of CSV logs are slow and expensive, and most queries filter by date and read 3 columns. What is the best fix?",
        options: ["Create more Athena workgroups", "Convert the data to Parquet partitioned by date", "Move the data to Glacier", "Buy a bigger Athena cluster"],
        answer: 1,
        why: "Columnar files and partitions let Athena read only the needed columns and days.",
      },
      {
        q: "Users must search product descriptions with typo tolerance and get results in milliseconds. Which service?",
        options: ["Redshift", "Athena", "Glue", "OpenSearch Service"],
        answer: 3,
        why: "OpenSearch builds search indexes designed for fast full-text and fuzzy queries.",
      },
      {
        q: "Which service gives column-level and row-level permissions over a data lake in S3?",
        options: ["AWS Lake Formation", "Amazon Data Firehose", "Amazon EMR", "Kinesis Data Streams"],
        answer: 0,
        why: "Lake Formation adds fine-grained access control on top of the Glue Data Catalog.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Upload a small CSV to S3, create an Athena table over it, and run a GROUP BY. Note the Data scanned value.",
        hint: "Use CREATE EXTERNAL TABLE with ROW FORMAT DELIMITED and skip the header line.",
        solution: "CREATE EXTERNAL TABLE sales (\n  order_id string, country string, amount double, dt string\n)\nROW FORMAT DELIMITED FIELDS TERMINATED BY ','\nLOCATION 's3://my-lab-bucket-48213/sales/'\nTBLPROPERTIES ('skip.header.line.count'='1');\n\nSELECT country, count(*) AS orders, sum(amount) AS revenue\nFROM sales GROUP BY country;\n-- The query details show Data scanned, which is what you pay for.",
      },
      {
        level: "medium",
        task: "Create an on-demand Kinesis stream, write 10 records with the same partition key, and read them back in order from their shard.",
        hint: "put-record returns the ShardId. If get-records returns nothing, call it again with the NextShardIterator.",
        solution: "aws kinesis create-stream --stream-name lab --stream-mode-details StreamMode=ON_DEMAND\naws kinesis wait stream-exists --stream-name lab\nfor i in $(seq 1 10); do\n  SHARD=$(aws kinesis put-record --stream-name lab --partition-key user1 --data \"event $i\" \\\n    --cli-binary-format raw-in-base64-out --query ShardId --output text)\ndone\nIT=$(aws kinesis get-shard-iterator --stream-name lab --shard-id $SHARD \\\n  --shard-iterator-type TRIM_HORIZON --query ShardIterator --output text)\nfor d in $(aws kinesis get-records --shard-iterator $IT --query 'Records[].Data' --output text); do\n  echo \"$d\" | base64 -d; echo\ndone",
      },
      {
        level: "hard",
        task: "Create a Firehose stream that delivers JSON records to S3 with a 60-second buffer and GZIP compression, send a test record, and plan how to query it with Athena.",
        hint: "Use DirectPut and --extended-s3-destination-configuration. Firehose adds YYYY/MM/DD/HH/ after your prefix.",
        solution: "aws firehose create-delivery-stream --delivery-stream-name lab-fh --delivery-stream-type DirectPut \\\n  --extended-s3-destination-configuration '{\n    \"RoleARN\": \"arn:aws:iam::111122223333:role/firehose-s3\",\n    \"BucketARN\": \"arn:aws:s3:::my-lab-bucket-48213\",\n    \"Prefix\": \"fh/\", \"ErrorOutputPrefix\": \"fh-errors/\",\n    \"BufferingHints\": {\"SizeInMBs\": 5, \"IntervalInSeconds\": 60},\n    \"CompressionFormat\": \"GZIP\"}'\naws firehose put-record --delivery-stream-name lab-fh --cli-binary-format raw-in-base64-out \\\n  --record '{\"Data\": \"{\\\"user\\\":\\\"u1\\\",\\\"page\\\":\\\"/home\\\"}\\n\"}'\n# About a minute later: .gz objects under fh/YYYY/MM/DD/HH/\n# Athena: CREATE EXTERNAL TABLE with ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'\n# and LOCATION 's3://my-lab-bucket-48213/fh/'; Athena reads .gz files directly.",
      },
    ],
    faq: [
      { q: "Is Kinesis Data Firehose the same as Amazon Data Firehose?", a: "Yes. AWS renamed Kinesis Data Firehose to Amazon Data Firehose in 2024; it is the same service. Kinesis Data Analytics was similarly renamed Amazon Managed Service for Apache Flink." },
      { q: "Athena or Redshift: which should I use?", a: "Use Athena for occasional or exploratory SQL directly on S3 with no infrastructure. Use Redshift when many users run heavy, repeated reports and dashboards that need consistently fast performance." },
      { q: "Do I need Glue to use Athena?", a: "Athena stores its table definitions in the Glue Data Catalog, but you can create tables with plain DDL in Athena. Crawlers are just one convenient way to fill the catalog." },
      { q: "Why is my Athena query so expensive?", a: "It probably scans whole uncompressed text files. Convert to Parquet, compress, partition by the columns you filter on, and select only the columns you need." },
    ],
  },
};

export default extra;
