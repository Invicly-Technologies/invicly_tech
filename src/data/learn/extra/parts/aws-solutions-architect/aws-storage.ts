import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-storage/s3": {
    plain: [
      "Amazon S3 (Simple Storage Service) stores files, which AWS calls objects, inside containers called buckets. Each object has a key (its full name, like photos/2026/cat.jpg), the data itself, and some metadata. There are no real folders: the slashes are just part of the key, and the console draws folders to help you.",
      "S3 is built to keep data safe. Most storage classes keep copies in several Availability Zones (separate data centers), and S3 is designed for 99.999999999 percent durability, often called eleven nines. If you store 10 million objects, you would expect to lose one about once every 10,000 years.",
      "Not all data is read equally. New uploads are read often, old logs almost never. S3 offers storage classes: the cheaper ones charge less per GB to store, but add a fee per GB to read, a minimum storage time, or a wait before you can read. Lifecycle rules move objects between classes automatically as they get older.",
      "Two features protect you from mistakes. Versioning keeps every old version of an object, so an overwrite or a delete can be undone. Replication copies objects to another bucket, in the same Region or a different one, for backup, compliance, or lower latency for users far away.",
    ],
    deepDive: [
      {
        heading: "Choosing a class: the hidden charges",
        body: "The price per GB is only part of the bill. Standard-IA and One Zone-IA charge for at least 30 days of storage and at least 128 KB per object, plus a retrieval fee per GB read. Glacier Instant Retrieval and Glacier Flexible Retrieval have a 90-day minimum, and Deep Archive has 180 days. If you delete or move an object early, you still pay for the remaining days.\n\nSo the IA classes suit objects that are fairly large, kept for months, and read rarely. Millions of tiny files that live for a week are cheaper in Standard. Intelligent-Tiering has no retrieval fees. Instead it charges a small monthly monitoring fee per object and moves objects to cheaper tiers after 30 and 90 days without access. Objects under 128 KB are never moved and pay no monitoring fee, so they always stay in the frequent tier.",
        bullets: [
          "Standard-IA and One Zone-IA: 30-day minimum, 128 KB minimum billable size",
          "Glacier Instant and Glacier Flexible: 90-day minimum",
          "Deep Archive: 180-day minimum",
          "Intelligent-Tiering: no retrieval fee, small per-object monitoring fee",
        ],
      },
      {
        heading: "Getting data back from the Glacier classes",
        body: "Glacier Instant Retrieval returns data in milliseconds, like Standard-IA, but each read costs more. The other two archive classes need a restore first. You call RestoreObject (aws s3api restore-object) with a number of days and a speed. S3 then creates a temporary readable copy, and you read that copy until the days run out. The archived object itself stays where it is.\n\nGlacier Flexible Retrieval offers three speeds: Expedited in 1 to 5 minutes, Standard in 3 to 5 hours, and Bulk in 5 to 12 hours, which is free. Deep Archive offers Standard within 12 hours and Bulk within 48 hours. Exam questions often hide the answer in how long the business can wait.",
        visual: {
          type: "sequence",
          title: "Restoring an object from Glacier Flexible Retrieval",
          actors: ["Your app", "Amazon S3"],
          messages: [
            { from: 0, to: 1, label: "restore-object: Days 7, Tier Standard" },
            { from: 1, to: 0, label: "202 Accepted, restore in progress" },
            { from: 0, to: 1, label: "HEAD object: still restoring?" },
            { from: 1, to: 1, label: "3 to 5 hours later: temporary copy ready" },
            { from: 0, to: 1, label: "GET object reads the temporary copy" },
            { from: 1, to: 1, label: "After 7 days the temporary copy is removed" },
          ],
        },
      },
      {
        heading: "Versioning and delete markers",
        body: "Once versioning is on, every upload of the same key creates a new version with its own version ID. A plain DELETE does not remove any data: S3 puts a delete marker on top, and the object looks gone. Remove that marker, or GET an older version ID, and the data is back. Only a DELETE that names a specific version ID removes that version for good.\n\nA bucket can be unversioned, enabled or suspended, but it can never go back to unversioned. Old versions are billed like any other data, so add a lifecycle rule with NoncurrentVersionExpiration, for example to keep old versions for 30 days. MFA delete adds a second check: deleting a version or changing the versioning state needs a code from an MFA device. Only the root user can turn it on, and only with the CLI or API, not the console.",
        visual: {
          type: "flow",
          title: "One key in a versioned bucket",
          steps: [
            { label: "PUT report.csv", detail: "Version v1 is current" },
            { label: "PUT report.csv again", detail: "v2 is current, v1 is kept" },
            { label: "DELETE report.csv", detail: "A delete marker becomes current" },
            { label: "GET report.csv", detail: "Returns 404, but v1 and v2 still exist" },
            { label: "Delete the marker", detail: "v2 is current again" },
          ],
        },
      },
      {
        heading: "How replication really behaves",
        body: "Replication needs versioning on both buckets and an IAM role that S3 uses to copy objects. Rules can filter by prefix or tag, choose a cheaper storage class at the destination, and hand ownership to the destination account. Same-Region Replication (SRR) suits log collection or a separate test copy. Cross-Region Replication (CRR) suits disaster recovery, compliance and users in another Region.\n\nSome things are not copied by default. Objects that existed before the rule need S3 Batch Replication. Delete markers are copied only if you turn on delete marker replication, and deleting a specific version is never replicated, which protects the copy from a malicious delete. Replication is asynchronous and most objects arrive within minutes. S3 Replication Time Control (RTC) adds an SLA: 99.99 percent of new objects replicate within 15 minutes.",
        bullets: [
          "Needs versioning on source and destination",
          "Existing objects: use S3 Batch Replication",
          "Replicas are not replicated again by default (no chaining)",
          "SSE-KMS objects need the KMS key settings in the rule",
        ],
      },
      {
        heading: "Performance at scale",
        body: "S3 scales per prefix (the part of the key before the object name, such as logs/2026/). Each prefix supports at least 3,500 PUT, COPY, POST or DELETE requests and 5,500 GET or HEAD requests per second, and there is no limit on the number of prefixes. Spread keys over 10 prefixes and you get roughly 10 times the request rate.\n\nFor big files, multipart upload splits an object into parts of 5 MiB to 5 GiB (up to 10,000 parts) that upload in parallel and retry on their own. One single PUT can be at most 5 GB, so larger objects must use multipart; the AWS CLI does this automatically. Byte-range GETs do the same for downloads. Transfer Acceleration sends uploads through CloudFront edge locations, which helps users far from the bucket. Since 2020 S3 is strongly consistent: a read after a successful write always sees the new data.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Pick a storage class by how data is read",
        root: "How is the data read?",
        children: [
          { label: "Often, or pattern unknown", children: ["S3 Standard", "Intelligent-Tiering if it changes over time"] },
          { label: "About monthly, must be instant", children: ["Standard-IA", "One Zone-IA if you can recreate it"] },
          { label: "Quarterly or less, must be instant", children: ["Glacier Instant Retrieval"] },
          { label: "Rarely, can wait hours", children: ["Glacier Flexible Retrieval", "Deep Archive if 12 to 48 hours is fine"] },
          { label: "Very hot, next to compute", children: ["S3 Express One Zone", "Single-digit millisecond reads in one AZ"] },
        ],
      },
      {
        type: "sequence",
        title: "Cross-Region Replication with a delete",
        actors: ["App", "Source bucket", "Destination bucket"],
        messages: [
          { from: 0, to: 1, label: "PUT report.csv" },
          { from: 1, to: 0, label: "200 OK, version v1" },
          { from: 1, to: 2, label: "Async copy using the IAM role" },
          { from: 2, to: 2, label: "Stored with status REPLICA" },
          { from: 0, to: 1, label: "DELETE report.csv (no version ID)" },
          { from: 1, to: 2, label: "Delete marker copied only if enabled" },
        ],
      },
    ],
    examples: [
      {
        title: "Undo an accidental delete",
        explanation: "A teammate deleted reports/q3.csv from a versioned bucket. Nothing is lost yet: S3 only added a delete marker. Step 1: list the versions and delete markers for that key. Step 2: find the delete marker that is marked IsLatest and copy its VersionId. Step 3: delete the marker itself by naming its version ID. The newest real version becomes current again, with no copy or restore needed.",
        code: {
          lang: "bash",
          code: "# 1. See all versions and delete markers for the key\naws s3api list-object-versions --bucket my-bucket --prefix reports/q3.csv \\\n  --query '{versions: Versions[].[VersionId,IsLatest], markers: DeleteMarkers[].[VersionId,IsLatest]}'\n\n# 2. Remove the delete marker (use the marker's VersionId)\naws s3api delete-object --bucket my-bucket --key reports/q3.csv \\\n  --version-id MARKER_VERSION_ID\n\n# 3. The previous version is current again\naws s3api head-object --bucket my-bucket --key reports/q3.csv",
        },
      },
      {
        title: "Storage design for a photo app",
        explanation: "Users view new photos a lot in the first month, rarely afterwards, but any photo must open instantly. Thumbnails are small (about 30 KB) and can be regenerated. Step 1: keep originals in Standard for 30 days, then move them to Standard-IA, then to Glacier Instant Retrieval at 90 days, which still reads in milliseconds. Step 2: leave thumbnails in Standard, because IA would bill each one as 128 KB. Step 3: enable versioning, and expire old versions after 30 days so overwrites don't pile up cost.",
        code: {
          lang: "json",
          code: "{\"Rules\": [{\n  \"ID\": \"originals-tiering\",\n  \"Filter\": {\"Prefix\": \"originals/\"},\n  \"Status\": \"Enabled\",\n  \"Transitions\": [\n    {\"Days\": 30, \"StorageClass\": \"STANDARD_IA\"},\n    {\"Days\": 90, \"StorageClass\": \"GLACIER_IR\"}\n  ],\n  \"NoncurrentVersionExpiration\": {\"NoncurrentDays\": 30}\n}]}",
        },
      },
    ],
    cheatSheet: [
      "aws s3api put-bucket-versioning --bucket b --versioning-configuration Status=Enabled",
      "Minimum storage days: IA classes 30, Glacier Instant and Flexible 90, Deep Archive 180",
      "IA and Glacier Instant bill at least 128 KB per object; keep tiny files in Standard",
      "Glacier Flexible restore: Expedited 1-5 min, Standard 3-5 h, Bulk 5-12 h (free)",
      "Deep Archive restore: Standard within 12 h, Bulk within 48 h",
      "Per prefix: 3,500 writes and 5,500 reads per second; add prefixes to scale",
      "Single PUT max 5 GB; use multipart upload for large files (the CLI does it for you)",
      "Replication skips objects that existed before the rule; use S3 Batch Replication",
    ],
    quiz: [
      {
        q: "A team stores 2 million log files of 20 KB each for 7 days, then deletes them. Which class is cheapest?",
        options: ["S3 Standard-IA", "S3 One Zone-IA", "S3 Standard", "S3 Glacier Instant Retrieval"],
        answer: 2,
        why: "In the other classes each tiny file is billed as 128 KB and for at least 30 or 90 days.",
      },
      {
        q: "Versioning is enabled and a user runs aws s3 rm on a file. What happens?",
        options: ["S3 adds a delete marker and the older versions stay", "The object and all its versions are deleted", "The request fails because versioning blocks deletes", "S3 moves the object to Glacier"],
        answer: 0,
        why: "A delete without a version ID only adds a delete marker; the data versions remain.",
      },
      {
        q: "Data in Glacier Flexible Retrieval is needed within 10 minutes for an urgent audit. Which retrieval option?",
        options: ["Bulk", "Standard", "Deep Archive Standard", "Expedited"],
        answer: 3,
        why: "Expedited retrievals usually finish in 1 to 5 minutes; Standard takes hours.",
      },
      {
        q: "After setting up CRR, the destination only has files uploaded after the rule was created. How do you copy the older files?",
        options: ["Enable versioning again", "Run S3 Batch Replication", "Turn on Transfer Acceleration", "Switch to Same-Region Replication"],
        answer: 1,
        why: "Replication rules only cover new objects; Batch Replication copies existing ones.",
      },
      {
        q: "An app sends 20,000 GET requests per second to one prefix and gets 503 Slow Down errors. What is the best fix?",
        options: ["Spread the keys over several prefixes", "Enable versioning", "Move the objects to Standard-IA", "Turn on MFA delete"],
        answer: 0,
        why: "Request limits apply per prefix, so more prefixes give more total throughput.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a bucket, enable versioning, upload the same file twice with different content, then list its versions.",
        hint: "Bucket names are global, so add random digits. Use list-object-versions with --prefix.",
        solution: "aws s3 mb s3://my-lab-bucket-48213\naws s3api put-bucket-versioning --bucket my-lab-bucket-48213 \\\n  --versioning-configuration Status=Enabled\necho one > f.txt && aws s3 cp f.txt s3://my-lab-bucket-48213/\necho two > f.txt && aws s3 cp f.txt s3://my-lab-bucket-48213/\naws s3api list-object-versions --bucket my-lab-bucket-48213 --prefix f.txt\n# Two versions: the newer one has IsLatest true",
      },
      {
        level: "medium",
        task: "Add a lifecycle rule to your bucket that deletes old versions 30 days after they become noncurrent but always keeps the 3 newest old versions, and cleans up unfinished multipart uploads after 7 days.",
        hint: "NoncurrentVersionExpiration accepts NewerNoncurrentVersions. An empty Filter applies the rule to the whole bucket.",
        solution: "cat > lc.json <<'EOF'\n{\"Rules\": [{\"ID\": \"cleanup\", \"Filter\": {}, \"Status\": \"Enabled\",\n  \"NoncurrentVersionExpiration\": {\"NoncurrentDays\": 30, \"NewerNoncurrentVersions\": 3},\n  \"AbortIncompleteMultipartUpload\": {\"DaysAfterInitiation\": 7}}]}\nEOF\naws s3api put-bucket-lifecycle-configuration --bucket my-lab-bucket-48213 \\\n  --lifecycle-configuration file://lc.json\naws s3api get-bucket-lifecycle-configuration --bucket my-lab-bucket-48213",
      },
      {
        level: "hard",
        task: "Set up Cross-Region Replication from a bucket in us-east-1 to a bucket in eu-west-1, including delete markers, and prove that a new object arrives.",
        hint: "Both buckets need versioning. A rule with DeleteMarkerReplication also needs Priority and a Filter.",
        solution: "aws s3api put-bucket-versioning --bucket src-bkt --versioning-configuration Status=Enabled\naws s3api put-bucket-versioning --bucket dst-bkt --versioning-configuration Status=Enabled\n# First create role s3-repl: trusted by s3.amazonaws.com, can read src versions, s3:Replicate* on dst\ncat > repl.json <<'EOF'\n{\"Role\": \"arn:aws:iam::111122223333:role/s3-repl\",\n \"Rules\": [{\"ID\": \"all\", \"Status\": \"Enabled\", \"Priority\": 1, \"Filter\": {},\n   \"DeleteMarkerReplication\": {\"Status\": \"Enabled\"},\n   \"Destination\": {\"Bucket\": \"arn:aws:s3:::dst-bkt\"}}]}\nEOF\naws s3api put-bucket-replication --bucket src-bkt --replication-configuration file://repl.json\naws s3 cp test.txt s3://src-bkt/ && sleep 60\naws s3api head-object --bucket dst-bkt --key test.txt   # ReplicationStatus: REPLICA",
      },
    ],
    faq: [
      { q: "Does S3 have folders?", a: "No. S3 keeps a flat list of keys. The console shows folders by splitting keys on the slash, and the API can do the same with a prefix and a delimiter." },
      { q: "What is the difference between durability and availability in S3?", a: "Durability is the chance your data is not lost, eleven nines for S3 classes. Availability is the chance you can read it right now, for example designed for 99.99 percent in Standard and 99.5 percent in One Zone-IA." },
      { q: "Does versioning cost extra?", a: "The feature itself is free, but every old version is billed as stored data. Use lifecycle rules to expire noncurrent versions you no longer need." },
      { q: "Is S3 Glacier a separate service?", a: "There used to be a separate Glacier service with its own vaults. Today you normally use the Glacier storage classes inside ordinary S3 buckets, chosen at upload or by a lifecycle rule." },
    ],
  },

  "aws-storage/s3-security": {
    plain: [
      "Every S3 bucket starts private. Only the account that owns it, and the users and roles that account allows, can read or write. Most S3 data leaks happen because someone opened a bucket on purpose to share one file and then forgot about it.",
      "There are two main places to write permissions. An IAM policy is attached to a user or role and says what that identity may do. A bucket policy is attached to the bucket and says who may use it, which is also how you let other AWS accounts in. Both are JSON documents with Effect, Action, Resource and sometimes a Condition.",
      "Block Public Access is a safety switch on top of all policies. When it is on, S3 refuses any policy or ACL that would make data public. It is on by default for new buckets, and you can also turn it on for the whole account so nobody can make that mistake later.",
      "Sometimes you must share one private file with someone who has no AWS login, like a customer downloading an invoice. A presigned URL is a link with a signature and an expiry time built in. Anyone with the link can do that one action, on that one object, until it expires.",
      "Big shared buckets end up with long, messy policies. An access point is a named door into a bucket with its own policy. Each team or app gets its own door with a short set of rules, and the bucket policy stays simple.",
    ],
    deepDive: [
      {
        heading: "How S3 decides allow or deny",
        body: "S3 looks at every policy that applies to a request. An explicit Deny anywhere always wins. Inside one account, an Allow in either the IAM policy or the bucket policy is enough. Across accounts, both sides must agree: the bucket policy must allow the other account, and that account's IAM policy must allow its user or role.\n\nOn top of that come guardrails. Block Public Access can override public grants. Service Control Policies (SCPs) in AWS Organizations cap what an account may do. If the object is encrypted with SSE-KMS, the KMS key policy must also let the caller use the key. A common surprise: a user with s3:GetObject still gets Access Denied because nobody allowed kms:Decrypt on the key.",
        visual: {
          type: "flow",
          title: "How one S3 request is judged",
          steps: [
            { label: "Collect policies", detail: "IAM, bucket, access point, SCP, KMS key" },
            { label: "Explicit Deny?", detail: "If any policy denies, the request fails" },
            { label: "Guardrails pass?", detail: "SCPs and Block Public Access allow it" },
            { label: "Grant found?", detail: "Same account: IAM or bucket policy. Cross-account: both" },
            { label: "Key usable?", detail: "SSE-KMS objects also need kms:Decrypt" },
            { label: "Allowed", detail: "With no Allow, the default is deny" },
          ],
        },
      },
      {
        heading: "Bucket policy patterns you will reuse",
        body: "Many real bucket policies are Deny statements with conditions, because a Deny protects the bucket no matter what IAM policies say. Useful condition keys: aws:SecureTransport to force HTTPS, aws:SourceVpce to allow access only through one VPC endpoint, aws:PrincipalOrgID to let in every account of your organization without listing them, and s3:x-amz-server-side-encryption-aws-kms-key-id to require a specific KMS key on uploads.\n\nWatch the Resource. Bucket-level actions such as s3:ListBucket use arn:aws:s3:::bucket, while object actions such as s3:GetObject use arn:aws:s3:::bucket/*. Mixing them up gives an Access Denied that looks mysterious. Be careful with a Deny on aws:SourceVpce: it also blocks the console and your own admins unless you add an exception for them.",
        bullets: [
          "Force HTTPS: Deny when aws:SecureTransport is false",
          "VPC only: Deny when aws:SourceVpce is not your endpoint",
          "Whole organization: Allow with aws:PrincipalOrgID",
          "s3:ListBucket on the bucket ARN, s3:GetObject on bucket/*",
        ],
      },
      {
        heading: "Block Public Access and Object Ownership",
        body: "Block Public Access has four settings. BlockPublicAcls rejects new public ACLs. IgnorePublicAcls ignores public ACLs that already exist. BlockPublicPolicy rejects bucket policies that grant public access. RestrictPublicBuckets limits a bucket that already has a public policy to AWS services and users in the owner's account. Set all four at account level and every bucket is covered, including ones created later.\n\nACLs (access control lists) are the old permission system from before IAM. Since April 2023, new buckets use the Object Ownership setting Bucket owner enforced, which turns ACLs off completely: the bucket owner owns every object, even objects uploaded by other accounts, and only policies decide access. Keep it that way unless an old tool really needs ACLs. For a public website, keep the bucket private and serve it through CloudFront with origin access control (OAC).",
      },
      {
        heading: "Access points for shared buckets",
        body: "A data lake bucket used by 20 teams can end up with a bucket policy near its 20 KB size limit. Access points split it up. Each access point has its own name, ARN, hostname and policy. Team A reads through finance-ap, the ingest job writes through ingest-ap, and each policy stays short.\n\nAn access point can be limited to one VPC, so requests from the internet are refused even with valid credentials. The usual setup is to delegate access control from the bucket to its access points with one bucket policy statement that uses the condition s3:DataAccessPointAccount. Apps then use the access point ARN or alias wherever they would use a bucket name. Multi-Region Access Points go a step further: one global endpoint that routes requests to buckets in several Regions.",
        visual: {
          type: "tree",
          title: "One data lake bucket, several access points",
          root: "Bucket: datalake",
          children: [
            { label: "finance-ap", children: ["Read finance/*", "Finance role only"] },
            { label: "ingest-ap", children: ["Write raw/*", "Network origin: one VPC"] },
            { label: "analytics-ap", children: ["Read curated/*", "Analytics team role"] },
            { label: "Bucket policy", children: ["Delegates to access points", "Denies requests without TLS"] },
          ],
        },
      },
      {
        heading: "Presigned URLs: limits and gotchas",
        body: "A presigned URL is signed with the credentials of whoever created it, so it can never do more than that identity is allowed to do. If the signer loses the permission, the link stops working. The expiry is also capped: up to 7 days when signed with IAM user keys, and never longer than the session when signed with temporary role credentials. A URL signed inside a Lambda function stops working when that role session expires, even if you asked for 7 days.\n\nFor downloads use a GET URL. For browser uploads use a presigned PUT, or a presigned POST, which can add rules such as a maximum file size and a fixed key prefix. Anyone who has the link can use it until it expires, so keep the expiry short. For many files or a whole site, CloudFront signed URLs or signed cookies scale better.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Ways to share S3 data",
        columns: [
          { title: "Presigned URL", points: ["One object, one action", "Expires after minutes or hours", "Receiver needs no AWS account", "Limited by the signer's permissions"] },
          { title: "Bucket policy", points: ["Other AWS accounts or the whole org", "Long-term access", "Conditions like VPC endpoint or TLS"] },
          { title: "CloudFront with OAC", points: ["Public websites and downloads", "Bucket stays private", "Caching and HTTPS at the edge"] },
        ],
      },
      {
        type: "sequence",
        title: "Browser upload with a presigned PUT",
        actors: ["Browser", "App API", "Amazon S3"],
        messages: [
          { from: 0, to: 1, label: "I want to upload avatar.png" },
          { from: 1, to: 1, label: "Check login, choose key users/42/avatar.png" },
          { from: 1, to: 0, label: "Presigned PUT URL, valid 5 minutes" },
          { from: 0, to: 2, label: "PUT the file directly" },
          { from: 2, to: 0, label: "200 OK" },
          { from: 0, to: 1, label: "Upload finished, save the key" },
        ],
      },
    ],
    examples: [
      {
        title: "Lock a bucket to one VPC endpoint",
        explanation: "An internal reports bucket must only be reachable from the company VPC. Step 1: create an S3 gateway endpoint in the VPC and note its ID. Step 2: add a bucket policy that denies every request that does not come through that endpoint. Step 3: add an exception for the Admin role, or you lock yourself out of the console. Both conditions sit in one block, so they are combined with AND: the Deny applies only when the request is not from the endpoint and not from Admin.",
        code: {
          lang: "json",
          code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"OnlyFromVpce\",\n    \"Effect\": \"Deny\",\n    \"Principal\": \"*\",\n    \"Action\": \"s3:*\",\n    \"Resource\": [\"arn:aws:s3:::reports-bkt\", \"arn:aws:s3:::reports-bkt/*\"],\n    \"Condition\": {\n      \"StringNotEquals\": {\"aws:SourceVpce\": \"vpce-0a1b2c3d4e5f67890\"},\n      \"ArnNotLike\": {\"aws:PrincipalArn\": \"arn:aws:iam::111122223333:role/Admin\"}\n    }\n  }]\n}",
        },
      },
      {
        title: "Give a partner account read access to one prefix",
        explanation: "Partner account 444455556666 must read files under exports/ and nothing else. Step 1: in your bucket policy, allow that account s3:GetObject on exports/* and s3:ListBucket only for the exports/ prefix. Step 2: the partner's admin must also give their own role an IAM policy for the same actions, because cross-account access needs both sides. Step 3: if the objects use SSE-KMS with your key, add the partner to the key policy with kms:Decrypt.",
        code: {
          lang: "json",
          code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\"Effect\": \"Allow\",\n     \"Principal\": {\"AWS\": \"arn:aws:iam::444455556666:root\"},\n     \"Action\": \"s3:GetObject\",\n     \"Resource\": \"arn:aws:s3:::exports-bkt/exports/*\"},\n    {\"Effect\": \"Allow\",\n     \"Principal\": {\"AWS\": \"arn:aws:iam::444455556666:root\"},\n     \"Action\": \"s3:ListBucket\",\n     \"Resource\": \"arn:aws:s3:::exports-bkt\",\n     \"Condition\": {\"StringLike\": {\"s3:prefix\": \"exports/*\"}}}\n  ]\n}",
        },
      },
    ],
    cheatSheet: [
      "aws s3 presign s3://bkt/key --expires-in 900 makes a 15-minute link (default is 3600 s)",
      "Presigned URL max: 7 days with IAM user keys; never longer than the role session",
      "Turn on Block Public Access at account level so buckets created later are covered too",
      "Cross-account access needs both the bucket policy and the caller's IAM policy to allow it",
      "s3:ListBucket uses arn:aws:s3:::bkt; s3:GetObject uses arn:aws:s3:::bkt/*",
      "SSE-KMS objects also need kms:Decrypt, or reads fail with Access Denied",
      "Bucket policy size limit is 20 KB; split large ones with access points",
      "Public website: private bucket plus CloudFront with origin access control (OAC)",
    ],
    quiz: [
      {
        q: "A user in account A has an IAM policy allowing s3:GetObject on a bucket in account B. The bucket policy does not mention account A. What happens?",
        options: ["Access works because IAM allows it", "Access works only from the console", "Access Denied, because the bucket policy must also allow account A", "Access works if Block Public Access is off"],
        answer: 2,
        why: "Cross-account requests need an Allow from both the caller's IAM policy and the bucket policy.",
      },
      {
        q: "A user has s3:GetObject but gets Access Denied on objects encrypted with SSE-KMS. What is the most likely cause?",
        options: ["The user may not call kms:Decrypt on the key", "Versioning is off", "The bucket is in another Region", "The objects are in Standard-IA"],
        answer: 0,
        why: "Reading an SSE-KMS object needs permission to use the KMS key as well as the S3 permission.",
      },
      {
        q: "A Lambda function creates presigned URLs with a 7-day expiry, but the links stop working after a few hours. Why?",
        options: ["S3 limits all URLs to 1 hour", "Block Public Access blocks presigned URLs", "Presigned URLs only work for PUT", "A URL cannot outlive the temporary role credentials that signed it"],
        answer: 3,
        why: "URLs signed with temporary credentials expire when those credentials expire.",
      },
      {
        q: "Ten teams share one bucket and its policy is close to the size limit. What is the simplest fix?",
        options: ["Create a bucket per object", "Give each team an S3 access point with its own policy", "Turn ACLs back on", "Use presigned URLs for every team"],
        answer: 1,
        why: "Access points give each team its own short policy and endpoint on the same bucket.",
      },
      {
        q: "You must publish a static website from S3 while keeping Block Public Access on. How?",
        options: ["Create a presigned URL for every page", "Grant public-read ACLs on each object", "Serve it through CloudFront with origin access control", "Use an access point with internet origin"],
        answer: 2,
        why: "With OAC only CloudFront can read the private bucket, and visitors reach the site through CloudFront.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a presigned download link for a private object that expires in 10 minutes. Open it, then try again after it expires.",
        hint: "aws s3 presign takes --expires-in in seconds. curl -I shows just the status line and headers.",
        solution: "aws s3 presign s3://my-lab-bucket-48213/f.txt --expires-in 600\ncurl -I \"PASTE_URL_HERE\"   # HTTP/1.1 200 OK\n# 10 minutes later:\ncurl \"PASTE_URL_HERE\"      # 403 AccessDenied, Request has expired",
      },
      {
        level: "medium",
        task: "Write a Python script with boto3 that creates a presigned PUT URL valid for 5 minutes, then uploads a file to it with the requests library.",
        hint: "Use generate_presigned_url with the client method name put_object.",
        solution: "import boto3, requests\n\ns3 = boto3.client(\"s3\")\nurl = s3.generate_presigned_url(\n    \"put_object\",\n    Params={\"Bucket\": \"my-lab-bucket-48213\", \"Key\": \"uploads/hello.txt\"},\n    ExpiresIn=300,\n)\nr = requests.put(url, data=b\"hello from a presigned URL\")\nprint(r.status_code)  # 200",
      },
      {
        level: "hard",
        task: "Create a VPC-only access point for your app and delegate the bucket's access control to access points, so the bucket policy stays one short statement.",
        hint: "Use aws s3control create-access-point with --vpc-configuration, and the s3:DataAccessPointAccount condition in the bucket policy.",
        solution: "aws s3control create-access-point --account-id 111122223333 --name app-ap \\\n  --bucket my-lab-bucket-48213 --vpc-configuration VpcId=vpc-0abc1234\n# Bucket policy: delegate all access control to access points in this account\n{\"Version\": \"2012-10-17\", \"Statement\": [{\"Effect\": \"Allow\",\n  \"Principal\": {\"AWS\": \"*\"}, \"Action\": \"*\",\n  \"Resource\": [\"arn:aws:s3:::my-lab-bucket-48213\", \"arn:aws:s3:::my-lab-bucket-48213/*\"],\n  \"Condition\": {\"StringEquals\": {\"s3:DataAccessPointAccount\": \"111122223333\"}}}]}\n# Then attach an access point policy allowing your app role s3:GetObject on\n# arn:aws:s3:us-east-1:111122223333:accesspoint/app-ap/object/*\n# Test from an instance in that VPC:\naws s3api get-object --bucket arn:aws:s3:us-east-1:111122223333:accesspoint/app-ap --key a.txt out.txt",
      },
    ],
    faq: [
      { q: "Are S3 buckets public by default?", a: "No. New buckets have Block Public Access turned on and ACLs disabled, so they stay private until someone deliberately changes both a setting and a policy." },
      { q: "What is the difference between a bucket policy and an IAM policy?", a: "An IAM policy is attached to a user or role and travels with that identity. A bucket policy is attached to the bucket, names who may use it, and is how you grant access to other accounts." },
      { q: "Can someone reuse a presigned URL?", a: "Yes. Anyone who has the link can use it as many times as they like until it expires, so treat it like a short-lived password." },
      { q: "Should I still use S3 ACLs?", a: "Almost never. AWS recommends keeping ACLs disabled and controlling access with policies; ACLs remain only for a few legacy cases." },
    ],
  },

  "aws-storage/block-file": {
    plain: [
      "Servers need disks, and EC2 offers two kinds. An EBS volume (Elastic Block Store) is a network disk: it lives on separate storage hardware in the same Availability Zone and keeps its data when you stop the instance. Instance store is a disk physically inside the host computer: very fast, but its data is gone when the instance stops.",
      "Block storage is a raw disk. The operating system formats it with a file system like ext4, XFS or NTFS, and normally only one machine uses it. File storage is a ready-made shared folder on the network. Many machines can open the same files at the same time, like a shared drive in an office.",
      "On AWS, EFS (Elastic File System) is the shared folder for Linux machines, using the NFS protocol. FSx is a family of managed file systems for special needs: Windows file shares, very fast Lustre for high-performance computing, and NetApp ONTAP or OpenZFS for teams moving those systems from their own data center.",
      "Picking storage comes down to a few questions. Does one machine need the data, or many? Linux or Windows? Must the data survive a stop? How many reads and writes per second, and how large are they? Answer those, and the right service is usually obvious.",
    ],
    deepDive: [
      {
        heading: "EBS volume types by the numbers",
        body: "SSD volumes are rated in IOPS (input/output operations per second) and HDD volumes in throughput (MB per second). gp3 is the default: every gp3 volume gets a baseline of 3,000 IOPS and 125 MB/s at any size, and you can buy extra IOPS and throughput separately from capacity. The older gp2 ties speed to size, 3 IOPS per GiB with burst credits for small volumes, which is why moving from gp2 to gp3 is usually cheaper and faster.\n\nio2 Block Express is for demanding databases: up to 256,000 IOPS per volume, sub-millisecond latency and 99.999 percent durability. st1 (throughput-optimized HDD) suits big sequential reads such as logs and data pipelines, and sc1 (cold HDD) is the cheapest for rarely read data. Neither HDD type can be a boot volume. The instance also has its own EBS bandwidth limit, so a small instance can bottleneck a fast volume.",
        visual: {
          type: "compare",
          title: "Which EBS volume type?",
          columns: [
            { title: "gp3", points: ["Default SSD for most apps", "3,000 IOPS baseline at any size", "Buy more IOPS and MB/s separately"] },
            { title: "io2 Block Express", points: ["Critical, busy databases", "Up to 256,000 IOPS", "Multi-Attach within one AZ"] },
            { title: "st1 and sc1", points: ["HDD, rated in MB/s", "st1: big sequential reads", "sc1: coldest and cheapest", "Cannot be boot volumes"] },
          ],
        },
      },
      {
        heading: "Snapshots, encryption and moving volumes",
        body: "An EBS snapshot is a point-in-time backup that AWS stores in S3 for you (it does not appear in your buckets). The first snapshot copies all used blocks; later ones copy only changed blocks, yet each snapshot can still restore the whole volume. You can copy snapshots to other Regions or share them with other accounts, which is how you move a volume to another AZ or Region.\n\nEncryption uses KMS and is invisible to the instance. You cannot encrypt an existing unencrypted volume in place: snapshot it, copy the snapshot with encryption on, and create a new volume from the copy. Turn on EBS encryption by default in each Region to avoid the problem. A volume created from a snapshot loads its blocks from S3 lazily, so the first read of each block is slow; Fast Snapshot Restore removes that delay for an extra fee.",
        visual: {
          type: "flow",
          title: "Encrypt an existing unencrypted volume",
          steps: [
            { label: "Snapshot the volume", detail: "Point-in-time copy of all blocks" },
            { label: "Copy with encryption", detail: "copy-snapshot --encrypted, pick a KMS key" },
            { label: "Create a new volume", detail: "From the encrypted copy, in any AZ" },
            { label: "Swap the volumes", detail: "Stop, detach old, attach new" },
            { label: "Start and verify", detail: "Then delete the old volume" },
          ],
        },
      },
      {
        heading: "Instance store: when losing data is fine",
        body: "Instance store disks are NVMe SSDs (or HDDs on some types) inside the host, so they give very high IOPS and low latency at no extra charge; the cost is included in instance types such as i4i, d3, or sizes with a d in the name like m6id. Data survives a reboot but is lost when the instance stops, hibernates or terminates, or when the host fails. You cannot detach an instance store disk or snapshot it.\n\nGood uses are caches, buffers, scratch files, and data that is already copied elsewhere, such as nodes of a replicated database like Cassandra, or Kafka brokers with replication turned on. If the data matters and exists only on that disk, it does not belong there.",
      },
      {
        heading: "EFS in practice",
        body: "EFS is a managed NFS file system (NFS versions 4.0 and 4.1) for Linux. You create mount targets, one per AZ, each with an IP address in your subnet and a security group that must allow TCP port 2049 from your clients. Many EC2 instances, containers and Lambda functions can mount it at once, and it grows and shrinks automatically, so you pay only for the data stored.\n\nLifecycle management moves files that nobody has read for a set time to the Infrequent Access and Archive storage classes, which cost much less per GB. For throughput, Elastic mode is the recommended default and scales with demand; Provisioned mode fixes a level you pay for. EFS One Zone keeps data in one AZ for a lower price. EFS does not work with Windows, and each operation is slower than on EBS, so it is a poor home for a busy database.",
      },
      {
        heading: "Choosing an FSx flavour",
        body: "FSx for Windows File Server gives real Windows shares over SMB, joined to Active Directory (AWS Managed Microsoft AD or your own), with NTFS permissions, shadow copies and DFS namespaces. Use Multi-AZ for production. FSx for Lustre is a parallel file system for HPC, machine learning and video rendering, with sub-millisecond latency and very high total throughput. It can link to an S3 bucket, showing objects as files and writing results back. Scratch deployments are cheap and temporary; persistent ones keep data safe for long-running work.\n\nFSx for NetApp ONTAP serves NFS, SMB and iSCSI at the same time and offers ONTAP features like SnapMirror, which makes it the easy target when you migrate from an on-premises NetApp. FSx for OpenZFS gives fast NFS with snapshots and clones, a natural home for ZFS or Linux file servers.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "From your app to an EBS disk",
        layers: [
          { label: "Application", detail: "Writes a file, for example a database page" },
          { label: "File system", detail: "ext4 or XFS turns files into blocks" },
          { label: "Block device", detail: "Shows up as /dev/nvme1n1 on Nitro instances" },
          { label: "Nitro card", detail: "Sends block I/O over the AWS network" },
          { label: "EBS storage servers", detail: "Data replicated inside the same AZ" },
        ],
      },
      {
        type: "compare",
        title: "Block, file and object storage",
        columns: [
          { title: "Block (EBS)", points: ["Raw disk the OS formats", "Usually one instance", "Lowest latency", "Boot disks and databases"] },
          { title: "File (EFS, FSx)", points: ["Shared folder over NFS or SMB", "Many clients at once", "File locks and permissions", "Home folders, shared content"] },
          { title: "Object (S3)", points: ["Whole objects over HTTPS", "Practically unlimited scale", "No in-place edits", "Data lakes, backups, media"] },
        ],
      },
    ],
    examples: [
      {
        title: "Move a gp2 volume to gp3 without downtime",
        explanation: "A 100 GiB gp2 volume gives only 300 IOPS baseline and is filling up. With Elastic Volumes you can change type, size and performance while the instance runs. Step 1: modify the volume to gp3 at 200 GiB with 4,000 IOPS and 250 MB/s. Step 2: watch the modification state; the volume is usable the whole time. Step 3: grow the partition and file system so the OS sees the new space. After a change you must wait 6 hours before modifying the same volume again.",
        code: {
          lang: "bash",
          code: "# Change type, size and speed live (no detach, no reboot)\naws ec2 modify-volume --volume-id vol-0abc1234def567890 \\\n  --volume-type gp3 --size 200 --iops 4000 --throughput 250\n\n# Progress: modifying -> optimizing -> completed\naws ec2 describe-volumes-modifications --volume-ids vol-0abc1234def567890 \\\n  --query 'VolumesModifications[0].ModificationState'\n\n# Inside the instance: grow partition 1, then the file system\nsudo growpart /dev/nvme0n1 1\nsudo xfs_growfs -d /        # for ext4: sudo resize2fs /dev/nvme0n1p1",
        },
      },
      {
        title: "A shared uploads folder for a web fleet",
        explanation: "Web servers in an Auto Scaling group across two AZs must all see the same user uploads. Step 1: create an EFS file system with a mount target in each AZ. Step 2: give the mount targets a security group that allows TCP 2049 from the web servers' security group. Step 3: on each server (or in the launch template user data), install amazon-efs-utils, mount with TLS, and add an fstab line so the mount comes back after a reboot.",
        code: {
          lang: "bash",
          code: "# On each web server (Amazon Linux 2023)\nsudo dnf install -y amazon-efs-utils\nsudo mkdir -p /var/www/uploads\nsudo mount -t efs -o tls fs-0123456789abcdef0:/ /var/www/uploads\n\n# Mount again automatically after a reboot\necho 'fs-0123456789abcdef0:/ /var/www/uploads efs _netdev,tls 0 0' | sudo tee -a /etc/fstab\ndf -h /var/www/uploads",
        },
      },
    ],
    cheatSheet: [
      "gp3 baseline: 3,000 IOPS and 125 MB/s at any size; buy more separately",
      "gp2 to gp3: aws ec2 modify-volume --volume-type gp3 works while the instance runs",
      "io2 Block Express: up to 256,000 IOPS; Multi-Attach to up to 16 Nitro instances in one AZ",
      "st1 and sc1 are HDD volumes and cannot be boot volumes",
      "Instance store survives a reboot; lost on stop, hibernate, terminate or host failure",
      "EFS: Linux only, NFS on TCP 2049, one mount target per AZ",
      "Windows shares with AD: FSx for Windows File Server. HPC on S3 data: FSx for Lustre",
      "Encrypt an existing volume: snapshot, copy with encryption, create a new volume",
    ],
    quiz: [
      {
        q: "A database needs 40,000 IOPS with consistent sub-millisecond latency. Which EBS type fits?",
        options: ["st1", "sc1", "gp2 sized at 1 TiB", "io2 Block Express"],
        answer: 3,
        why: "io2 Block Express is built for high, consistent IOPS; a 1 TiB gp2 gives only about 3,000.",
      },
      {
        q: "What happens to data on an instance store volume when you stop the instance?",
        options: ["It is lost", "It is saved to an EBS snapshot", "It moves with the instance to the new host", "It is kept for 24 hours"],
        answer: 0,
        why: "Instance store data only survives reboots; a stop releases the host and wipes the disk.",
      },
      {
        q: "Fifty Windows servers need a shared drive with Active Directory permissions. Which service?",
        options: ["Amazon EFS", "FSx for Windows File Server", "FSx for Lustre", "An EBS volume with Multi-Attach"],
        answer: 1,
        why: "FSx for Windows File Server provides SMB shares integrated with Active Directory.",
      },
      {
        q: "An existing EBS volume is unencrypted and must become encrypted. What do you do?",
        options: ["Tick Encrypt on the volume in the console", "Enable encryption by default; it converts old volumes", "Snapshot it, copy the snapshot with encryption, create a new volume", "Attach it to a Nitro instance"],
        answer: 2,
        why: "Encryption cannot be added in place, and encryption by default only affects new volumes.",
      },
      {
        q: "EC2 instances in two AZs try to mount an EFS file system and the mount hangs. What is the most likely cause?",
        options: ["EFS only works in one AZ", "The instances need public IP addresses", "The mount target security group does not allow TCP 2049 from the instances", "EFS needs an S3 gateway endpoint"],
        answer: 2,
        why: "NFS traffic must reach the mount target on port 2049, which its security group controls.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a 20 GiB gp3 volume in the same AZ as one of your instances, attach it, format it with XFS and mount it at /data.",
        hint: "The volume must be in the instance's AZ. On Nitro instances the disk appears as an NVMe device; lsblk shows it.",
        solution: "aws ec2 create-volume --availability-zone us-east-1a --size 20 --volume-type gp3\naws ec2 attach-volume --volume-id vol-NEW --instance-id i-0abc1234 --device /dev/sdf\n# On the instance:\nlsblk                          # find the new 20G disk, e.g. nvme1n1\nsudo mkfs -t xfs /dev/nvme1n1\nsudo mkdir /data && sudo mount /dev/nvme1n1 /data\ndf -h /data",
      },
      {
        level: "medium",
        task: "Snapshot a volume, copy the snapshot to eu-west-1 with encryption, and create a gp3 volume from it there.",
        hint: "Use --query SnapshotId --output text to capture IDs, and aws ec2 wait snapshot-completed between steps.",
        solution: "SNAP=$(aws ec2 create-snapshot --volume-id vol-0abc1234 --description lab \\\n  --query SnapshotId --output text)\naws ec2 wait snapshot-completed --snapshot-ids $SNAP\nNEW=$(aws ec2 copy-snapshot --region eu-west-1 --source-region us-east-1 \\\n  --source-snapshot-id $SNAP --encrypted --query SnapshotId --output text)\naws ec2 wait snapshot-completed --region eu-west-1 --snapshot-ids $NEW\naws ec2 create-volume --region eu-west-1 --availability-zone eu-west-1a \\\n  --snapshot-id $NEW --volume-type gp3",
      },
      {
        level: "hard",
        task: "Benchmark a gp3 volume at its default settings with fio, raise it to 6,000 IOPS, and show the change with a second run.",
        hint: "Use 4 KB random reads with direct I/O and a deep queue so the volume, not the page cache, is measured.",
        solution: "sudo dnf install -y fio\nsudo fio --name=rr --filename=/data/test --size=2G --rw=randread --bs=4k \\\n  --ioengine=libaio --iodepth=64 --direct=1 --runtime=60 --time_based --group_reporting\n# Expect about 3,000 IOPS (the gp3 baseline)\naws ec2 modify-volume --volume-id vol-0abc1234 --iops 6000\n# Wait until the state is optimizing or completed, then run fio again\n# Expect about 6,000 IOPS; if not, check the instance type's EBS IOPS limit",
      },
    ],
    faq: [
      { q: "Can I attach one EBS volume to two instances?", a: "Normally no. Only io1 and io2 volumes support Multi-Attach, within one AZ, and the app must use a cluster-aware file system to avoid corrupting data. For simple shared files, use EFS or FSx." },
      { q: "Is EFS more expensive than EBS?", a: "Per GB stored, EFS Standard costs more than gp3. But you pay only for what you store instead of a provisioned size, and lifecycle tiers to Infrequent Access cut the price a lot for cold files." },
      { q: "Does a reboot erase instance store data?", a: "No. A reboot keeps instance store data. A stop, hibernate, terminate or hardware failure erases it." },
      { q: "Can Windows servers use EFS?", a: "No. EFS supports Linux NFS clients only. Use FSx for Windows File Server for SMB shares." },
    ],
  },

  "aws-storage/migration-storage": {
    plain: [
      "Moving data into AWS is often the first big job of a migration. The right tool depends on three things: how much data there is, how fast your network link is, and whether the move happens once or keeps going. A 2 TB file share and a 2 PB video archive need very different tools.",
      "DataSync is the online mover. You install a small agent (a virtual machine) next to your storage, point it at a source such as an NFS or SMB share, and it copies files to S3, EFS or FSx over the network. It checks the data, keeps file metadata, and can run again on a schedule to send only what changed.",
      "When the network is too slow, you ship the data instead. AWS Snowball Edge is a rugged storage device that AWS sends to you. You copy data onto it locally, ship it back, and AWS loads it into S3. It is like posting a box of hard drives, but encrypted and tracked.",
      "Storage Gateway is different: it is not for moving data once, but for apps that stay on premises and keep using AWS storage in the background. AWS Backup is the control panel for backups: one policy that schedules, keeps and copies backups of many AWS services across accounts and Regions.",
    ],
    deepDive: [
      {
        heading: "Do the network math first",
        body: "A 1 Gbps link moves at most about 125 MB per second, which is roughly 10.8 TB per day. Real links rarely run at full speed for days, and the business still needs some bandwidth, so plan on 60 to 80 percent. At 80 percent, 1 Gbps moves about 8.6 TB per day and 100 Mbps moves under 1 TB per day.\n\nNow divide. 100 TB over 1 Gbps takes about 12 days, which is fine for DataSync. 500 TB over 100 Mbps takes well over a year, so offline transfer wins. A common rule of thumb: if the online copy would take more than about a week, look at offline devices, or at a faster link such as Direct Connect if you will move data regularly.",
        visual: {
          type: "compare",
          title: "Days to move 100 TB at 80 percent of the link",
          columns: [
            { title: "100 Mbps", points: ["About 0.86 TB per day", "About 116 days", "Ship devices instead"] },
            { title: "1 Gbps", points: ["About 8.6 TB per day", "About 12 days", "DataSync works well"] },
            { title: "10 Gbps", points: ["About 86 TB per day", "About 1.2 days", "DataSync, several tasks in parallel"] },
          ],
        },
      },
      {
        heading: "Storage Gateway modes in detail",
        body: "Storage Gateway runs as a VM on premises (VMware, Hyper-V or KVM) or on EC2, and uses local disks as a cache. S3 File Gateway offers NFS or SMB shares. Each file becomes one S3 object that AWS services can also use, and recently used files are served from the local cache at LAN speed.\n\nVolume Gateway offers iSCSI block volumes. In cached mode the full data lives in AWS and only hot data stays local, which saves disk space on premises. In stored mode the full data stays local for low latency and is backed up to AWS as point-in-time EBS snapshots, which you can restore as EBS volumes in AWS. Tape Gateway pretends to be a tape library, so existing backup software writes virtual tapes that are archived to S3 Glacier Flexible Retrieval or Deep Archive.",
        visual: {
          type: "sequence",
          title: "S3 File Gateway read and write path",
          actors: ["On-premises app", "File Gateway cache", "Amazon S3"],
          messages: [
            { from: 0, to: 1, label: "Write report.pdf over SMB" },
            { from: 1, to: 0, label: "Acknowledged once in local cache" },
            { from: 1, to: 2, label: "Upload as an S3 object in the background" },
            { from: 0, to: 1, label: "Read report.pdf later" },
            { from: 1, to: 0, label: "Served from cache if still there" },
            { from: 1, to: 2, label: "On a cache miss, fetch the object" },
          ],
        },
      },
      {
        heading: "DataSync under the hood",
        body: "A DataSync task links a source location to a destination location. On premises, an agent VM reads the source (NFS, SMB, HDFS or self-managed object storage) and sends the data over TLS to the DataSync service, which writes it to S3, EFS or FSx. Between AWS storage services, for example EFS to S3 or across Regions, no agent is needed.\n\nEach run compares both sides, copies only new or changed files, keeps timestamps and permissions where the destination supports them, and verifies data integrity. You can filter paths, cap bandwidth, and schedule runs. A typical migration is one large first copy, then small incremental runs, then a short write freeze while a final run copies the last changes before cutover. Traffic can go over the internet, Direct Connect, or a VPC endpoint for private transfer.",
      },
      {
        heading: "Offline transfer with Snowball Edge",
        body: "You create a job in the console, AWS ships a Snowball Edge device, and you copy data onto it over your local network using its S3-compatible interface or an NFS mount. Data is encrypted with keys managed in KMS that are never stored on the device, and an E Ink shipping label updates itself for the return trip. When AWS receives the device, it imports the data into your S3 bucket and securely erases the device. For larger jobs you order several devices in parallel.\n\nSnowball Edge also offers compute for places with poor connectivity, such as ships or field sites. AWS has retired the small Snowcone and the truck-sized Snowmobile, and the Snow options on offer keep changing, so check the current list before you plan. For the exam, the idea is what counts: when the network math says weeks or months, ship devices.",
      },
      {
        heading: "AWS Backup: plans, vaults and locks",
        body: "A backup plan holds rules: how often to back up (for example daily at 03:00 UTC), how long to keep each recovery point, when to move it to cheaper cold storage for services that support it, and whether to copy it to another Region or account. You assign resources by tag, such as backup=daily, so a new database is protected as soon as it is tagged.\n\nRecovery points live in backup vaults, each encrypted with a KMS key and guarded by a vault access policy. Vault Lock makes them WORM (write once, read many). In governance mode, users with special permissions can still change the lock. In compliance mode, after a cooling-off period of at least 3 days, nobody, not even the root user, can delete backups early. With AWS Organizations you can push backup policies to every account.",
        bullets: [
          "Backup plan: schedule, retention, cold storage, copies",
          "Resource assignment by tag or by ARN",
          "Vault Lock compliance mode: immutable after the cooling-off period",
          "Restore testing and Backup Audit Manager prove backups really work",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which data service fits the job?",
        root: "What do you need?",
        children: [
          { label: "One-time move, network is fast enough", children: ["DataSync over internet or Direct Connect"] },
          { label: "One-time move, network too slow", children: ["Snowball Edge devices"] },
          { label: "Apps stay on premises, data in AWS", children: ["S3 File Gateway for files", "Volume Gateway for iSCSI", "Tape Gateway for backups"] },
          { label: "Regular sync between storage systems", children: ["Scheduled DataSync tasks"] },
          { label: "Protect copies of AWS resources", children: ["AWS Backup plans and vaults"] },
        ],
      },
      {
        type: "flow",
        title: "A typical DataSync migration",
        steps: [
          { label: "Deploy agent", detail: "VM next to the source storage" },
          { label: "Create locations", detail: "Source share and destination bucket" },
          { label: "First full copy", detail: "Runs for days if the data is large" },
          { label: "Incremental runs", detail: "Nightly, only changed files" },
          { label: "Freeze and final run", detail: "Copies the last few changes" },
          { label: "Cut over", detail: "Point apps at the new storage" },
        ],
      },
    ],
    examples: [
      {
        title: "Migrating a 60 TB NAS to S3 in a month",
        explanation: "An office has a 1 Gbps link and can give the migration about half of it. Step 1, the math: 125 MB/s times 50 percent is about 62.5 MB/s, or about 5.4 TB per day, so 60 TB takes about 11 days. That fits a month, so DataSync is the choice. Step 2: deploy the agent, create the NFS source and S3 destination locations. Step 3: create a task with a bandwidth cap of 62.5 MB/s (62,500,000 bytes per second), verification of transferred files, and a nightly schedule for incremental runs until cutover.",
        code: {
          lang: "bash",
          code: "aws datasync create-task --name nas-to-s3 \\\n  --source-location-arn arn:aws:datasync:us-east-1:111122223333:location/loc-0a1b2c3d4e5f67890 \\\n  --destination-location-arn arn:aws:datasync:us-east-1:111122223333:location/loc-0f9e8d7c6b5a43210 \\\n  --options VerifyMode=ONLY_FILES_TRANSFERRED,BytesPerSecond=62500000 \\\n  --schedule 'ScheduleExpression=cron(0 20 * * ? *)'\n\n# Start the first full copy now instead of waiting for the schedule\naws datasync start-task-execution --task-arn TASK_ARN",
        },
      },
      {
        title: "Daily backups for tagged resources, copied to a second Region",
        explanation: "Every production database and volume tagged backup=daily must be backed up each night, kept 35 days, and copied to eu-west-1 for disaster recovery. Step 1: create a vault in each Region. Step 2: create the plan below with aws backup create-backup-plan --backup-plan file://plan.json. Step 3: create a backup selection that matches the tag backup=daily, using the AWSBackupDefaultServiceRole. New resources with the tag are picked up automatically, with no change to the plan.",
        code: {
          lang: "json",
          code: "{\n  \"BackupPlanName\": \"daily-35d\",\n  \"Rules\": [{\n    \"RuleName\": \"daily\",\n    \"TargetBackupVaultName\": \"prod-vault\",\n    \"ScheduleExpression\": \"cron(0 3 * * ? *)\",\n    \"Lifecycle\": {\"DeleteAfterDays\": 35},\n    \"CopyActions\": [{\n      \"DestinationBackupVaultArn\": \"arn:aws:backup:eu-west-1:111122223333:backup-vault:dr-vault\",\n      \"Lifecycle\": {\"DeleteAfterDays\": 35}\n    }]\n  }]\n}",
        },
      },
    ],
    cheatSheet: [
      "1 Gbps is about 10.8 TB per day at full speed; plan for 60 to 80 percent of that",
      "Online copy longer than about a week? Consider Snowball Edge devices",
      "DataSync needs an agent on premises; none is needed between AWS storage services",
      "S3 File Gateway: NFS or SMB on premises, each file becomes one S3 object",
      "Volume Gateway cached: data in AWS, hot data local. Stored: data local, snapshots to AWS",
      "Tape Gateway: virtual tapes for existing backup software, archived to Glacier classes",
      "Vault Lock compliance mode: nobody can delete backups early after the cooling-off period",
      "Assign resources to backup plans by tag so new resources are protected automatically",
    ],
    quiz: [
      {
        q: "An office wants to keep using an SMB share on premises while the files are stored durably in S3. Which service?",
        options: ["DataSync", "Snowball Edge", "AWS Backup", "S3 File Gateway"],
        answer: 3,
        why: "S3 File Gateway gives ongoing SMB or NFS access on premises with files stored as S3 objects.",
      },
      {
        q: "You must copy 40 TB from an NFS server to EFS within a week over a 10 Gbps Direct Connect link. What fits best?",
        options: ["DataSync", "Snowball Edge", "Tape Gateway", "Volume Gateway in stored mode"],
        answer: 0,
        why: "At about 86 TB per day the link is fast enough, and DataSync copies NFS to EFS directly.",
      },
      {
        q: "Which Volume Gateway mode keeps the full dataset on premises and sends snapshots to AWS?",
        options: ["Cached mode", "Stored mode", "File mode", "Tape mode"],
        answer: 1,
        why: "Stored mode keeps primary data local for low latency and backs it up as EBS snapshots.",
      },
      {
        q: "Regulators require that backups cannot be deleted by anyone, even administrators, for 7 years. What do you configure?",
        options: ["S3 versioning on the vault", "An IAM policy denying DeleteRecoveryPoint", "AWS Backup Vault Lock in compliance mode", "A Glacier lifecycle rule"],
        answer: 2,
        why: "Compliance mode Vault Lock cannot be removed after the cooling-off period, even by root.",
      },
      {
        q: "Roughly how much data can a 1 Gbps link move in one day at full speed?",
        options: ["About 1 TB", "About 10.8 TB", "About 100 TB", "About 125 GB"],
        answer: 1,
        why: "125 MB per second times 86,400 seconds is about 10.8 TB.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Work out how many days it takes to move 250 TB over a 500 Mbps link at 70 percent use, and decide between online and offline transfer.",
        hint: "Divide Mbps by 8 to get MB/s, then multiply by 86,400 seconds per day.",
        solution: "500 Mbps / 8 = 62.5 MB/s\n62.5 x 0.7 = 43.75 MB/s\n43.75 MB/s x 86,400 s = about 3.78 TB per day\n250 TB / 3.78 = about 66 days\nOver two months online, so ship Snowball Edge devices\nunless the deadline allows more than two months.",
      },
      {
        level: "medium",
        task: "Create a DataSync task that copies an S3 prefix to an EFS file system in the same Region, with no agent, and check that it succeeds.",
        hint: "The EFS location needs a subnet and a security group that can reach a mount target on TCP 2049. The S3 location needs a role DataSync can assume.",
        solution: "aws datasync create-location-s3 --s3-bucket-arn arn:aws:s3:::my-lab-bucket-48213 \\\n  --subdirectory /exports --s3-config BucketAccessRoleArn=arn:aws:iam::111122223333:role/datasync-s3\naws datasync create-location-efs \\\n  --efs-filesystem-arn arn:aws:elasticfilesystem:us-east-1:111122223333:file-system/fs-0123456789abcdef0 \\\n  --ec2-config SubnetArn=arn:aws:ec2:us-east-1:111122223333:subnet/subnet-0abc,SecurityGroupArns=arn:aws:ec2:us-east-1:111122223333:security-group/sg-0abc\naws datasync create-task --source-location-arn SRC_LOCATION_ARN \\\n  --destination-location-arn DST_LOCATION_ARN --name s3-to-efs\naws datasync start-task-execution --task-arn TASK_ARN\naws datasync describe-task-execution --task-execution-arn EXECUTION_ARN --query Status\n# Status ends as SUCCESS",
      },
      {
        level: "hard",
        task: "Set up AWS Backup so every resource tagged backup=daily is backed up nightly, kept 35 days and copied to a second Region. Prove it works with an on-demand backup job.",
        hint: "You need two vaults, the plan from the worked example, and a backup selection using ListOfTags.",
        solution: "aws backup create-backup-vault --backup-vault-name prod-vault\naws backup create-backup-vault --backup-vault-name dr-vault --region eu-west-1\naws backup create-backup-plan --backup-plan file://plan.json   # returns BackupPlanId\naws backup create-backup-selection --backup-plan-id PLAN_ID --backup-selection '{\n  \"SelectionName\": \"tagged-daily\",\n  \"IamRoleArn\": \"arn:aws:iam::111122223333:role/service-role/AWSBackupDefaultServiceRole\",\n  \"ListOfTags\": [{\"ConditionType\": \"STRINGEQUALS\", \"ConditionKey\": \"backup\", \"ConditionValue\": \"daily\"}]}'\naws backup start-backup-job --backup-vault-name prod-vault \\\n  --resource-arn arn:aws:dynamodb:us-east-1:111122223333:table/orders \\\n  --iam-role-arn arn:aws:iam::111122223333:role/service-role/AWSBackupDefaultServiceRole\naws backup list-backup-jobs --by-state COMPLETED",
      },
    ],
    faq: [
      { q: "What is the difference between DataSync and Storage Gateway?", a: "DataSync moves data from one place to another, once or on a schedule. Storage Gateway gives on-premises apps ongoing access to AWS storage through file, volume or tape interfaces with a local cache." },
      { q: "Is the Snow Family still available?", a: "AWS has retired Snowmobile and Snowcone, and the Snowball options on offer have changed over time, so check the current AWS Snow page for your Region. The exam still expects an offline device when the network is far too slow." },
      { q: "Does AWS Backup replace EBS snapshots and RDS backups?", a: "It uses the same native snapshots underneath, but manages them from one place with plans, tags, vaults, cross-Region copies and audit reports. That central view is much easier to prove to auditors." },
      { q: "Can DataSync copy between two S3 buckets?", a: "Yes. DataSync can copy between AWS storage services, including S3 to S3 across Regions, without an agent. For a one-time copy inside S3, Batch Replication or S3 Batch Operations are also options." },
    ],
  },
};

export default extra;
