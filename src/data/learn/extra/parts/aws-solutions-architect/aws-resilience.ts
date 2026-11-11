import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-resilience/decoupling": {
    plain: [
      "When one part of a system calls another directly and waits for the answer, the two are tightly coupled. If the second part is slow or down, the first part fails too. Decoupling puts a middleman between them, so each side can work at its own speed and fail without taking the other down.",
      "A queue is the simplest middleman. The producer drops a message into Amazon SQS (Simple Queue Service) and moves on. Workers pull messages when they are ready. If 10,000 orders arrive in a minute, they wait safely in the queue while workers process them as fast as they can.",
      "Sometimes one event matters to many systems. Amazon SNS (Simple Notification Service) is a topic: publish one message and SNS pushes a copy to every subscriber. Amazon EventBridge is an event bus with rules: it looks at the content of each event and sends it only to the targets that care about it.",
      "Some jobs are a chain of steps: charge the card, reserve stock, send the email, and undo the charge if stock runs out. AWS Step Functions runs such a workflow as a state machine, keeping track of where each run is, retrying failed steps and branching on results, so your code stays small.",
    ],
    deepDive: [
      {
        heading: "SQS internals: visibility, retries and dead letters",
        body: "SQS does not delete a message when a consumer receives it. The message becomes invisible for the visibility timeout (default 30 seconds, up to 12 hours). If the consumer finishes, it calls DeleteMessage. If it crashes, the timeout ends and another consumer gets the message again. That is why Standard queues give at-least-once delivery and consumers must be idempotent: handling the same message twice must be safe.\n\nA redrive policy moves a message to a dead-letter queue (DLQ) after it has been received maxReceiveCount times, so one bad message cannot block work forever; after a fix you can redrive it back. Use long polling (WaitTimeSeconds up to 20) to cut empty responses and cost. Messages are kept for 4 days by default, configurable from 1 minute to 14 days, and a delay queue can hide new messages for up to 15 minutes.",
        visual: {
          type: "sequence",
          title: "A message that keeps failing",
          actors: ["Producer", "SQS queue", "Worker", "Dead-letter queue"],
          messages: [
            { from: 0, to: 1, label: "SendMessage" },
            { from: 2, to: 1, label: "ReceiveMessage (now invisible)" },
            { from: 2, to: 2, label: "Crashes, never deletes it" },
            { from: 1, to: 1, label: "Visibility timeout ends, visible again" },
            { from: 2, to: 1, label: "Receive again: count is now 2, then 3" },
            { from: 1, to: 3, label: "maxReceiveCount reached: moved to DLQ" },
          ],
        },
      },
      {
        heading: "Standard vs FIFO queues",
        body: "Standard queues offer nearly unlimited throughput, but order is best effort and a message can occasionally arrive twice. FIFO queues (names must end in .fifo) keep strict order within a message group and remove duplicates within a 5-minute window, using a deduplication ID or a hash of the body.\n\nThe message group ID is the key idea. Order is kept per group, and different groups are processed in parallel. Use the customer ID or order ID as the group, not one fixed value, or the whole queue becomes a single line. FIFO throughput is 300 messages per second per API action, or 3,000 with batches of 10, and high throughput mode raises that much further. Choose FIFO only when order or exactly-once processing is a real requirement, because Standard is simpler and scales further.",
        bullets: [
          "Standard: at-least-once, best-effort order, nearly unlimited throughput",
          "FIFO: ordered per message group, duplicates removed within 5 minutes",
          "MessageGroupId decides what must stay in order",
          "Consumers should still be idempotent in both types",
        ],
      },
      {
        heading: "Scaling consumers and Lambda with SQS",
        body: "The queue depth tells you if workers keep up. For EC2 or ECS workers, scale on backlog per worker: ApproximateNumberOfMessagesVisible divided by the number of workers, with a target such as the number of messages one worker can finish within your acceptable delay. Plain CPU is a poor signal for queue workers.\n\nWith Lambda, an event source mapping polls the queue for you and scales the number of concurrent functions as the backlog grows. Set the queue's visibility timeout to at least six times the function timeout, so messages are not re-delivered while a batch is still running. Turn on ReportBatchItemFailures and return only the failed message IDs; otherwise one bad message makes the whole batch retry. Set a maximum concurrency on the mapping if the downstream database can only take so many connections.",
      },
      {
        heading: "SNS and EventBridge: push and route",
        body: "SNS pushes each message to every subscription: SQS queues, Lambda functions, HTTPS endpoints, email, SMS and Firehose. A filter policy on a subscription lets it receive only matching messages, by message attributes or by fields in the body. SNS does not keep messages for later readers, so the classic pattern is SNS to several SQS queues: the topic fans out, and each queue stores its copy until its service is ready. The queue's access policy must allow the topic to send to it.\n\nEventBridge receives events from AWS services on the default bus, from your apps on custom buses, and from SaaS partners. Rules match event content with patterns such as prefix, numeric ranges or anything-but, and each rule can send to up to 5 targets, with input transformation. Extras include archive and replay, retries with a DLQ, EventBridge Scheduler for cron-style and one-time schedules, and Pipes to connect a source to a target with filtering and enrichment.",
      },
      {
        heading: "Step Functions: Standard vs Express",
        body: "A state machine is written in Amazon States Language (JSON). States include Task (call a service), Choice (branch), Parallel, Map (run steps for each item), Wait, Succeed and Fail. Each Task can have Retry rules with exponential backoff and Catch rules that jump to an error-handling state, so retry logic leaves your code. Direct integrations call over 200 AWS services, for example DynamoDB PutItem, without a Lambda in between.\n\nStandard workflows run up to one year, run each step exactly once, keep a visual history of every run, and are priced per state transition. Express workflows run up to five minutes, handle very high event rates, are priced by number of runs and duration, and use at-least-once semantics when started asynchronously. The callback pattern (.waitForTaskToken) pauses a run until an outside system, or a human approval, sends the token back.",
        visual: {
          type: "flow",
          title: "Order workflow with compensation (saga)",
          steps: [
            { label: "Charge card", detail: "Task with Retry on timeouts" },
            { label: "Reserve stock", detail: "Catch: out of stock goes to Refund" },
            { label: "Ship order", detail: "Waits for warehouse callback token" },
            { label: "Send email", detail: "Direct SNS integration" },
            { label: "Refund (on error)", detail: "Undo the charge, then Fail" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Tightly coupled vs decoupled order flow",
        layers: [
          { label: "Web tier", detail: "Accepts the order and returns at once" },
          { label: "SNS topic OrderPlaced", detail: "One publish, many copies" },
          { label: "SQS queues per service", detail: "Billing, shipping, analytics buffer work" },
          { label: "Workers or Lambda", detail: "Scale on queue depth, fail independently" },
          { label: "Dead-letter queues", detail: "Bad messages parked for inspection" },
        ],
      },
      {
        type: "tree",
        title: "Which decoupling tool?",
        root: "What do you need?",
        children: [
          { label: "Buffer work for one consumer type", children: ["SQS Standard", "SQS FIFO if order matters"] },
          { label: "Same message to many subscribers", children: ["SNS, ideally with SQS behind it"] },
          { label: "Route by event content, AWS or SaaS events", children: ["EventBridge rules"] },
          { label: "Multi-step process with state", children: ["Step Functions Standard", "Express for high-volume short flows"] },
          { label: "Run something on a schedule", children: ["EventBridge Scheduler"] },
        ],
      },
    ],
    examples: [
      {
        title: "A queue with a dead-letter queue",
        explanation: "An image-resizing worker sometimes receives corrupt files and crashes. Step 1: create a DLQ and give it a long retention. Step 2: create the main queue with a redrive policy that moves a message to the DLQ after 5 failed receives, and a visibility timeout longer than the worst processing time. Step 3: alarm on the DLQ's ApproximateNumberOfMessagesVisible so someone looks at bad files, and redrive them after a fix.",
        code: {
          lang: "bash",
          code: "aws sqs create-queue --queue-name resize-dlq --attributes MessageRetentionPeriod=1209600\nDLQ_ARN=$(aws sqs get-queue-attributes --attribute-names QueueArn \\\n  --queue-url https://sqs.us-east-1.amazonaws.com/111122223333/resize-dlq \\\n  --query Attributes.QueueArn --output text)\ncat > attrs.json <<EOF\n{\n  \"VisibilityTimeout\": \"120\",\n  \"ReceiveMessageWaitTimeSeconds\": \"20\",\n  \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"5\\\"}\"\n}\nEOF\naws sqs create-queue --queue-name resize --attributes file://attrs.json",
        },
      },
      {
        title: "Fan-out with filtering",
        explanation: "An order service publishes every order to one SNS topic. The fraud team only wants orders over 1,000. Step 1: subscribe the fraud queue to the topic. Step 2: set a filter policy on that subscription that matches a numeric attribute amount greater than 1000. Step 3: the publisher sets amount as a message attribute. Billing and shipping subscriptions have no filter and still get every order, while the fraud queue sees only large ones.",
        code: {
          lang: "bash",
          code: "aws sns set-subscription-attributes --subscription-arn FRAUD_SUB_ARN \\\n  --attribute-name FilterPolicy \\\n  --attribute-value '{\"amount\": [{\"numeric\": [\">\", 1000]}]}'\n\naws sns publish --topic-arn arn:aws:sns:us-east-1:111122223333:orders \\\n  --message '{\"orderId\": \"o-77\"}' \\\n  --message-attributes '{\"amount\": {\"DataType\": \"Number\", \"StringValue\": \"1500\"}}'",
        },
      },
    ],
    cheatSheet: [
      "Visibility timeout: default 30 s, max 12 h; set it longer than your processing time",
      "SQS retention: default 4 days, 1 minute to 14 days; long polling waits up to 20 s",
      "FIFO: 300 msg/s per action, 3,000 with batching; order is per MessageGroupId",
      "Lambda with SQS: visibility timeout at least 6 x function timeout; use ReportBatchItemFailures",
      "SNS does not store messages; put SQS behind it when consumers can be offline",
      "EventBridge rule: content-based pattern, up to 5 targets; archive and replay available",
      "Step Functions Standard: up to 1 year, exactly once. Express: up to 5 minutes, high volume",
      "Scale queue workers on backlog per instance, not on CPU",
    ],
    quiz: [
      {
        q: "A worker takes up to 2 minutes per message, and messages are being processed twice. What is the most likely fix?",
        options: ["Switch to SNS", "Raise the visibility timeout above 2 minutes", "Lower the retention period", "Turn off long polling"],
        answer: 1,
        why: "If the timeout ends before the worker deletes the message, it becomes visible and is delivered again.",
      },
      {
        q: "In a FIFO queue, all messages use the same MessageGroupId and throughput is poor. Why?",
        options: ["FIFO queues cannot use batching", "Deduplication is slowing it down", "Long polling is off", "One group is processed strictly in order, so nothing runs in parallel"],
        answer: 3,
        why: "Ordering is per group; using many groups, such as one per customer, allows parallel processing.",
      },
      {
        q: "One malformed message makes a Lambda function fail, and the whole batch of 10 retries again and again. What helps most?",
        options: ["Enable ReportBatchItemFailures and add a DLQ with maxReceiveCount", "Increase the batch size to 100", "Use an SNS topic instead", "Set the visibility timeout to 0"],
        answer: 0,
        why: "Partial batch responses retry only failed messages, and the DLQ removes the poison message.",
      },
      {
        q: "Events from many AWS services must be routed to different targets based on fields inside each event. Which service fits best?",
        options: ["SQS FIFO", "SNS without filters", "EventBridge rules", "Step Functions Express"],
        answer: 2,
        why: "EventBridge receives AWS service events and routes them by content-based patterns.",
      },
      {
        q: "A loan approval process waits up to 3 days for a human decision. Which option fits?",
        options: ["Step Functions Express workflow", "SQS delay queue", "Lambda with a long timeout", "Step Functions Standard with a task token callback"],
        answer: 3,
        why: "Standard workflows can run up to a year, and the callback pattern pauses until the token is returned.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Standard queue, send one message, receive it, and delete it. Then explain what would happen if you did not delete it.",
        hint: "receive-message returns a ReceiptHandle, which delete-message needs.",
        solution: "URL=$(aws sqs create-queue --queue-name lab-q --query QueueUrl --output text)\naws sqs send-message --queue-url $URL --message-body 'hello'\nRH=$(aws sqs receive-message --queue-url $URL --wait-time-seconds 10 \\\n  --query 'Messages[0].ReceiptHandle' --output text)\naws sqs delete-message --queue-url $URL --receipt-handle \"$RH\"\n# Without delete-message, the message becomes visible again after the\n# visibility timeout (30 s by default) and is delivered again.",
      },
      {
        level: "medium",
        task: "Subscribe an SQS queue to an SNS topic, publish a message, and read it from the queue.",
        hint: "The queue needs an access policy that allows sns.amazonaws.com to SendMessage from that topic ARN.",
        solution: "TOPIC=$(aws sns create-topic --name lab-topic --query TopicArn --output text)\nQARN=$(aws sqs get-queue-attributes --queue-url $URL --attribute-names QueueArn \\\n  --query Attributes.QueueArn --output text)\n# Queue policy: Allow sns.amazonaws.com sqs:SendMessage on $QARN\n#   with Condition ArnEquals aws:SourceArn = $TOPIC (set it with set-queue-attributes)\naws sns subscribe --topic-arn $TOPIC --protocol sqs --notification-endpoint $QARN\naws sns publish --topic-arn $TOPIC --message 'order placed'\naws sqs receive-message --queue-url $URL --wait-time-seconds 10\n# The body is an SNS envelope (JSON) unless you enable raw message delivery.",
      },
      {
        level: "hard",
        task: "Write a Step Functions state machine that calls a Lambda function with retries, and sends failures to a notification state instead of just failing.",
        hint: "Use Retry with IntervalSeconds, MaxAttempts and BackoffRate, and Catch with ErrorEquals States.ALL.",
        solution: "{\"StartAt\": \"Process\", \"States\": {\n  \"Process\": {\"Type\": \"Task\",\n    \"Resource\": \"arn:aws:states:::lambda:invoke\",\n    \"Parameters\": {\"FunctionName\": \"process-order\", \"Payload.$\": \"$\"},\n    \"Retry\": [{\"ErrorEquals\": [\"States.TaskFailed\"], \"IntervalSeconds\": 2,\n                \"MaxAttempts\": 3, \"BackoffRate\": 2.0}],\n    \"Catch\": [{\"ErrorEquals\": [\"States.ALL\"], \"Next\": \"Notify\"}],\n    \"End\": true},\n  \"Notify\": {\"Type\": \"Task\", \"Resource\": \"arn:aws:states:::sns:publish\",\n    \"Parameters\": {\"TopicArn\": \"arn:aws:sns:us-east-1:111122223333:ops\", \"Message.$\": \"$.Cause\"},\n    \"Next\": \"Failed\"},\n  \"Failed\": {\"Type\": \"Fail\"}}}",
      },
    ],
    faq: [
      { q: "What is the difference between SQS and SNS?", a: "SQS is a queue: messages wait until a consumer pulls and deletes them. SNS is a topic: it pushes each message to all subscribers at once and does not keep it for later." },
      { q: "When should I pick EventBridge over SNS?", a: "Pick EventBridge when you need rich content-based routing, AWS service or SaaS events, schedules, or archive and replay. Pick SNS for simple, very high-throughput fan-out, SMS or email, or ordered fan-out with FIFO topics." },
      { q: "Can SQS guarantee that a message is processed only once?", a: "FIFO queues remove duplicates and keep order, giving exactly-once processing within their rules. Standard queues can deliver a message more than once, so consumers should be idempotent." },
      { q: "How do I send messages larger than the SQS size limit?", a: "Store the payload in S3 and send a small message with a pointer to it. The Amazon SQS Extended Client Library does this for you." },
    ],
  },

  "aws-resilience/dr": {
    plain: [
      "Disaster recovery (DR) is your plan for the day a whole site stops working: a Region outage, a deleted database, ransomware, or a bad deploy that corrupts data. High availability across AZs handles small failures. DR handles the big ones, usually by recovering in another Region or from clean backups.",
      "Two numbers drive every DR plan. RTO (recovery time objective) is how long the business can be down. RPO (recovery point objective) is how much recent data it can lose, measured in time. An RPO of 1 hour means losing the last hour of orders is painful but acceptable.",
      "Faster recovery costs more, because more of the system must already be running somewhere else. Backup and restore keeps only copies. Pilot light keeps the data live but the servers off. Warm standby runs a small working copy. Multi-site runs full copies everywhere. You pick the cheapest one that meets both numbers.",
      "A DR plan that has never been tested is a hope, not a plan. Teams run game days, where they actually fail over to the recovery Region, measure the real RTO and RPO, and fix what broke. Automation with infrastructure as code makes the recovery repeatable instead of a long night of manual steps.",
    ],
    deepDive: [
      {
        heading: "Turning RTO and RPO into design choices",
        body: "RPO decides how data is copied. An RPO of 24 hours is met by daily backups. An RPO of 1 hour needs hourly backups or continuous copies such as RDS automated backups with transaction logs. An RPO of seconds needs asynchronous replication: Aurora Global Database, DynamoDB global tables, S3 Replication with Replication Time Control, or AWS Elastic Disaster Recovery for servers. An RPO of zero needs synchronous writes to two places, which is only practical within one Region (Multi-AZ) because of latency.\n\nRTO decides what must already exist. If recovery means building networks, launching servers, restoring terabytes and changing DNS, that takes hours. Every piece you keep running in the recovery Region removes time from that list and adds to the monthly bill. Write down each step and its duration; the sum is your realistic RTO.",
        visual: {
          type: "flow",
          title: "What happens between disaster and recovery",
          steps: [
            { label: "Last good copy", detail: "Data after this point is lost (RPO)" },
            { label: "Disaster", detail: "Region or data becomes unusable" },
            { label: "Detect and decide", detail: "Alarms fire, someone declares DR" },
            { label: "Restore or scale up", detail: "Data, servers, capacity in the DR Region" },
            { label: "Switch traffic", detail: "Route 53 or Global Accelerator" },
            { label: "Service back", detail: "Time since disaster is the RTO" },
          ],
        },
      },
      {
        heading: "Pilot light vs warm standby, precisely",
        body: "Both keep data replicated into the recovery Region all the time. The difference is the application tier. In pilot light, the core (databases, maybe a directory service) is running, but app servers are switched off: AMIs are copied, launch templates exist, and an Auto Scaling group sits at 0. Recovery means starting and scaling that tier, which takes tens of minutes, and the site cannot serve any traffic until then.\n\nIn warm standby, a complete but smaller copy of the whole stack runs all the time, for example 2 instances instead of 20. It can take traffic immediately at reduced capacity, and recovery is mostly scaling up, which takes minutes. Because it is always running, you can also send it a little real traffic or synthetic checks every day, so you know it works. That confidence is often the real reason teams pay for warm standby.",
        visual: {
          type: "compare",
          title: "Recovery Region before a disaster",
          columns: [
            { title: "Pilot light", points: ["Database replica running", "App tier off, ASG at 0", "Cannot serve traffic yet", "Recovery in tens of minutes"] },
            { title: "Warm standby", points: ["Database replica running", "Small full stack running", "Serves traffic at low capacity", "Recovery in minutes by scaling up"] },
            { title: "Multi-site active-active", points: ["Databases accept writes in both", "Full capacity in both Regions", "Already serving users", "Near-zero RTO, highest cost"] },
          ],
        },
      },
      {
        heading: "AWS services that do the heavy lifting",
        body: "For data: S3 Cross-Region Replication, Aurora Global Database (RPO about a second), DynamoDB global tables, RDS cross-Region read replicas, and AWS Backup cross-Region and cross-account copies. For servers: AWS Elastic Disaster Recovery (DRS) replicates disks of EC2 or on-premises servers continuously into a cheap staging area, giving an RPO of seconds and an RTO of minutes when you launch recovery instances. For infrastructure: CloudFormation or Terraform to rebuild networks and services the same way every time, and AMIs copied to the recovery Region.\n\nDon't forget the hidden dependencies. Service quotas in the recovery Region may be lower than you need. KMS keys are Regional, so encrypted copies need a key there, or a multi-Region key. Secrets, certificates in ACM, and container images in ECR must also exist in the recovery Region.",
        bullets: [
          "Raise service quotas in the DR Region before you need them",
          "Copy AMIs, secrets, certificates and container images",
          "Use multi-Region KMS keys or a key in each Region",
          "Keep backups in another account to resist ransomware",
        ],
      },
      {
        heading: "Failing over traffic safely",
        body: "Route 53 failover records send users to the primary while its health check passes and to the secondary when it fails. Keep the TTL short, for example 60 seconds, so clients pick up the change quickly. Global Accelerator gives fixed anycast IP addresses and shifts traffic between Regions in seconds without waiting for DNS caches.\n\nAWS advises relying on data plane actions during an outage, not control plane changes. Health checks flipping traffic is a data plane action. Editing DNS records or creating resources are control plane actions that may be impaired during a large event. Amazon Application Recovery Controller (ARC) offers routing controls built for this: simple on and off switches, served from a highly available cluster, that move traffic between Regions. Also decide who may declare a disaster, and how to fail back once the primary is healthy again.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Pick a strategy from RTO and RPO",
        root: "Requirements",
        children: [
          { label: "RTO and RPO in hours", children: ["Backup and restore", "AWS Backup cross-Region copies"] },
          { label: "RTO tens of minutes, RPO minutes", children: ["Pilot light", "Replicated database, app tier off"] },
          { label: "RTO minutes, RPO seconds", children: ["Warm standby", "Aurora Global Database or DRS"] },
          { label: "RTO and RPO near zero", children: ["Multi-site active-active", "DynamoDB global tables, Route 53 or Global Accelerator"] },
        ],
      },
      {
        type: "cycle",
        title: "Keeping a DR plan honest",
        steps: [
          { label: "Define RTO and RPO", detail: "Agreed with the business per system" },
          { label: "Automate recovery", detail: "Infrastructure as code and runbooks" },
          { label: "Game day", detail: "Actually fail over, or use AWS FIS" },
          { label: "Measure", detail: "Real recovery time and data lost" },
          { label: "Fix gaps", detail: "Quotas, missing secrets, slow steps" },
        ],
      },
    ],
    examples: [
      {
        title: "Pilot light for a web shop",
        explanation: "Requirements: RTO 1 hour, RPO 5 minutes, low cost. Step 1: replicate the database with an RDS cross-Region read replica (lag is usually seconds) and replicate the product images bucket with S3 CRR. Step 2: copy the app AMI to the DR Region and keep an Auto Scaling group there with desired capacity 0, behind an ALB. Step 3: create a Route 53 failover record pair with a health check on the primary. Recovery steps: promote the replica, set the ASG capacity, and let Route 53 switch traffic.",
        code: {
          lang: "bash",
          code: "# Run in the DR Region during a disaster\naws rds promote-read-replica --region us-west-2 --db-instance-identifier shop-db-dr\naws autoscaling update-auto-scaling-group --region us-west-2 \\\n  --auto-scaling-group-name shop-web-dr --min-size 4 --desired-capacity 6 --max-size 20\naws rds wait db-instance-available --region us-west-2 --db-instance-identifier shop-db-dr\n# Route 53 failover sends users to the DR ALB once the primary health check fails",
        },
      },
      {
        title: "Choosing a strategy for three systems",
        explanation: "A company has three systems. An internal wiki can be down for a day and lose a day of edits: backup and restore with nightly AWS Backup copies to another Region. A customer portal needs RTO 15 minutes and RPO 1 minute: warm standby with Aurora Global Database and a small Auto Scaling group always running. A payment API must survive a Region loss with almost no downtime: active-active in two Regions with DynamoDB global tables and latency-based routing with health checks. Matching each system to its own needs is far cheaper than giving everything multi-site.",
      },
    ],
    cheatSheet: [
      "RTO = how long you can be down. RPO = how much data, in time, you can lose",
      "Backup and restore: hours. Pilot light: tens of minutes. Warm standby: minutes. Multi-site: near zero",
      "Pilot light: data replicated, app servers off. Warm standby: small full stack running",
      "Aurora Global Database: RPO about 1 second across Regions",
      "AWS Elastic Disaster Recovery: continuous block replication, RPO seconds, RTO minutes",
      "Route 53 failover records plus health checks; keep the TTL short",
      "Prefer data plane actions (health checks, ARC routing controls) during an outage",
      "Check quotas, KMS keys, AMIs and secrets in the DR Region",
    ],
    quiz: [
      {
        q: "Requirements are RTO 30 minutes and RPO 5 minutes at the lowest cost. Which strategy fits?",
        options: ["Backup and restore", "Pilot light", "Multi-site active-active", "No DR, rely on Multi-AZ"],
        answer: 1,
        why: "Replicated data meets the RPO, and starting the app tier fits a 30-minute RTO at low cost.",
      },
      {
        q: "What is the key difference between pilot light and warm standby?",
        options: ["Warm standby runs a scaled-down copy that can serve traffic right away", "Pilot light replicates data and warm standby does not", "Warm standby only uses backups", "Pilot light runs in the same Region"],
        answer: 0,
        why: "In pilot light the app tier is off; in warm standby a small full stack is already running.",
      },
      {
        q: "Why is an RPO of zero across Regions hard to achieve?",
        options: ["S3 cannot replicate across Regions", "Route 53 cannot fail over", "Synchronous writes across long distances add too much latency", "AWS Backup does not support it"],
        answer: 2,
        why: "Cross-Region replication is asynchronous, so the last moments of writes can be lost.",
      },
      {
        q: "During failover, the DR Region cannot launch enough instances. What was most likely missed?",
        options: ["S3 versioning", "CloudTrail in the DR Region", "A longer DNS TTL", "Raising service quotas in the DR Region"],
        answer: 3,
        why: "Quotas are per Region, so the recovery Region must allow the capacity you plan to launch.",
      },
      {
        q: "Many on-premises and EC2 servers need DR with an RPO of seconds and low standby cost. Which service?",
        options: ["AWS Elastic Disaster Recovery", "Daily EBS snapshots", "S3 Cross-Region Replication", "Aurora Global Database"],
        answer: 0,
        why: "DRS replicates server disks continuously to a low-cost staging area and launches them on demand.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For each case, name the cheapest DR strategy: (a) RTO 24 h, RPO 24 h; (b) RTO 10 min, RPO 1 min; (c) RTO 1 min, RPO near 0; (d) RTO 1 h, RPO 15 min.",
        hint: "Start from the cheapest strategy and move up only when RTO or RPO is not met.",
        solution: "(a) Backup and restore\n(b) Warm standby\n(c) Multi-site active-active\n(d) Pilot light",
      },
      {
        level: "medium",
        task: "Copy an AMI and the latest snapshot-based backup of a database to a second Region so a pilot light can start there.",
        hint: "Use aws ec2 copy-image and aws rds copy-db-snapshot run in the destination Region.",
        solution: "aws ec2 copy-image --region us-west-2 --source-region us-east-1 \\\n  --source-image-id ami-0abc1234def567890 --name shop-web-dr\naws rds copy-db-snapshot --region us-west-2 \\\n  --source-db-snapshot-identifier arn:aws:rds:us-east-1:111122223333:snapshot:shop-nightly \\\n  --target-db-snapshot-identifier shop-nightly-dr --kms-key-id alias/aws/rds\n# Schedule both (for example with AWS Backup copy rules) so the DR copies stay fresh",
      },
      {
        level: "hard",
        task: "Create Route 53 failover records: primary ALB with a health check, secondary ALB in the DR Region. Explain how to test it.",
        hint: "Alias records to ALBs can use EvaluateTargetHealth; failover records need SetIdentifier and Failover PRIMARY or SECONDARY.",
        solution: "{\"Changes\": [\n {\"Action\": \"UPSERT\", \"ResourceRecordSet\": {\"Name\": \"shop.example.com\", \"Type\": \"A\",\n   \"SetIdentifier\": \"primary\", \"Failover\": \"PRIMARY\",\n   \"AliasTarget\": {\"HostedZoneId\": \"PRIMARY_ALB_ZONE_ID\", \"DNSName\": \"PRIMARY_ALB_DNS\", \"EvaluateTargetHealth\": true}}},\n {\"Action\": \"UPSERT\", \"ResourceRecordSet\": {\"Name\": \"shop.example.com\", \"Type\": \"A\",\n   \"SetIdentifier\": \"secondary\", \"Failover\": \"SECONDARY\",\n   \"AliasTarget\": {\"HostedZoneId\": \"DR_ALB_ZONE_ID\", \"DNSName\": \"DR_ALB_DNS\", \"EvaluateTargetHealth\": true}}}]}\n# aws route53 change-resource-record-sets --hosted-zone-id ZONE --change-batch file://failover.json\n# Test: make the primary targets unhealthy (stop them or break the health path),\n# then run dig shop.example.com and watch it switch to the DR ALB.",
      },
    ],
    faq: [
      { q: "Is Multi-AZ enough for disaster recovery?", a: "Multi-AZ protects against a data center or AZ failure, but not against a Region-wide problem, accidental deletion or corruption, which copy straight to the standby. DR needs backups or copies that are separate in place and in time." },
      { q: "What is the difference between high availability and disaster recovery?", a: "High availability keeps a system running through common failures with no or little interruption, usually within one Region. Disaster recovery restores service after a large event, often in another Region, within an agreed RTO and RPO." },
      { q: "How often should I test DR?", a: "At least once or twice a year for each important system, and after big architecture changes. Many teams run smaller automated checks much more often." },
      { q: "How does DR help against ransomware?", a: "Backups that attackers cannot delete, such as AWS Backup vaults with Vault Lock in a separate account, let you restore clean data. Replication alone can copy encrypted or deleted data to the other Region." },
    ],
  },

  "aws-resilience/monitoring": {
    plain: [
      "Monitoring answers three different questions, and AWS has a service for each. Is my system healthy right now? That is CloudWatch, with metrics, logs and alarms. Who did what in my account? That is CloudTrail, a record of API calls. Is my setup still the way it should be? That is AWS Config.",
      "A metric is a number measured over time, like CPU use every minute or the count of 5xx errors. An alarm watches one metric and changes state when it crosses a line for long enough. Alarms can send a message, scale a group of servers, or reboot or recover an instance.",
      "Logs are the detailed story behind the numbers. CloudWatch Logs collects log lines from Lambda, containers, servers and many AWS services in one place. Logs Insights lets you search them with a short query language, for example to count errors per minute or find the slowest requests.",
      "CloudTrail is the security camera of your account. Every console click and API call becomes an event: who, from where, when, and what. AWS Config takes snapshots of each resource's settings over time and checks them against rules, like every EBS volume must be encrypted.",
    ],
    deepDive: [
      {
        heading: "Metrics: resolution, retention and the agent",
        body: "AWS services publish metrics to CloudWatch automatically. EC2 sends them every 5 minutes for free (basic monitoring) or every minute with detailed monitoring for a fee. Custom metrics can be standard resolution (1 minute) or high resolution (down to 1 second). CloudWatch keeps data for 15 months but rolls it up as it ages: 1-second points for 3 hours, 1-minute points for 15 days, 5-minute points for 63 days and 1-hour points for 455 days.\n\nThe hypervisor cannot see inside your instance, so memory use, disk space used and process counts are not default EC2 metrics. Install the CloudWatch agent, usually configured from an SSM Parameter Store parameter, to collect them along with log files. Metrics are grouped by namespace (like AWS/EC2) and dimensions (like InstanceId), and the same metric name with different dimensions is a different metric.",
        bullets: [
          "Basic EC2 monitoring: 5 minutes. Detailed: 1 minute",
          "High-resolution custom metrics: down to 1 second",
          "Memory and disk space need the CloudWatch agent",
          "Retention: 15 months, with coarser points as data ages",
        ],
      },
      {
        heading: "Alarms that don't cry wolf",
        body: "An alarm checks a statistic (Average, Sum, Maximum, or a percentile like p99) over a period, and goes to ALARM when M out of N recent data points breach the threshold. For example, 3 out of 5 one-minute periods above 80 percent ignores a single spike but still catches sustained trouble. States are OK, ALARM and INSUFFICIENT_DATA, and you choose how missing data counts: missing, notBreaching, breaching or ignore.\n\nAlarm on symptoms users feel, such as error rate and p99 latency, rather than only on causes such as CPU. Composite alarms combine several alarms with AND or OR, which cuts noise: page someone only when errors are high and latency is high. Anomaly detection alarms learn a metric's normal daily shape and fire when it leaves that band, which works well for traffic that changes by hour.",
        visual: {
          type: "flow",
          title: "From data point to action",
          steps: [
            { label: "Data points", detail: "One per period, e.g. every 60 s" },
            { label: "Statistic", detail: "Average, Sum, Max or p99" },
            { label: "M of N check", detail: "e.g. 3 of the last 5 breach" },
            { label: "State change", detail: "OK to ALARM" },
            { label: "Actions", detail: "SNS, Auto Scaling, EC2 recover" },
          ],
        },
      },
      {
        heading: "CloudWatch Logs in practice",
        body: "Logs are stored in log groups (one per app or function) made of log streams (one per instance or container). By default log groups never expire, which quietly grows your bill, so set a retention such as 30 or 90 days. Metric filters turn log patterns into metrics, for example counting lines containing ERROR, so you can alarm on them. Subscription filters stream log events in near real time to Lambda, Kinesis, Firehose or OpenSearch, which is how you centralise logs from many accounts.\n\nLogs Insights queries look like this: fields @timestamp, @message | filter @message like /ERROR/ | stats count() by bin(5m). You pay per GB scanned, so narrow the time range. For long-term, cheap storage, export logs to S3 or deliver them there with Firehose. Lambda writes to CloudWatch Logs automatically; EC2 needs the agent.",
      },
      {
        heading: "CloudTrail: the audit record",
        body: "Event history shows the last 90 days of management events (actions that create, change or delete resources, and many reads) in each Region for free, with no setup. For longer retention and analysis, create a trail that delivers log files to an S3 bucket, usually within about 5 minutes of the call, and optionally to CloudWatch Logs for alarms. An organization trail created in the management account records every account.\n\nData events are off by default because they are high volume and cost extra: S3 object reads and writes, Lambda invocations, DynamoDB item actions. Turn them on for sensitive buckets. CloudTrail Insights detects unusual API activity, such as a sudden burst of TerminateInstances calls. Log file integrity validation adds signed digest files, so you can prove logs were not altered. Protect the trail bucket with a strict bucket policy, ideally in a separate logging account.",
        visual: {
          type: "sequence",
          title: "Tracing who deleted a bucket",
          actors: ["User", "Amazon S3", "CloudTrail", "Security team"],
          messages: [
            { from: 0, to: 1, label: "DeleteBucket logs-old" },
            { from: 1, to: 2, label: "Management event recorded" },
            { from: 2, to: 2, label: "Delivered to trail bucket, about 5 min" },
            { from: 3, to: 2, label: "lookup-events EventName=DeleteBucket" },
            { from: 2, to: 3, label: "userIdentity, sourceIPAddress, eventTime" },
          ],
        },
      },
      {
        heading: "AWS Config: drift and compliance",
        body: "Once the configuration recorder is on, Config records a configuration item every time a supported resource changes, building a timeline: what this security group looked like last Tuesday, and which resources it was attached to. Config rules evaluate resources against a desired state, either when a resource changes or on a schedule. AWS provides hundreds of managed rules, such as encrypted-volumes, restricted-ssh and s3-bucket-public-read-prohibited, and you can write custom rules with Lambda or Guard.\n\nConfig detects; it does not block. To fix things automatically, attach a remediation action, an SSM Automation document that, for example, turns on bucket encryption. Conformance packs bundle rules for a standard, and an aggregator shows compliance across accounts and Regions. To prevent bad changes in the first place, use SCPs or IAM. Config is Regional and charges per configuration item recorded and per rule evaluation.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Detect and fix a public security group rule",
        actors: ["Engineer", "AWS Config", "SSM Automation", "Security group"],
        messages: [
          { from: 0, to: 3, label: "Opens port 22 to 0.0.0.0/0" },
          { from: 3, to: 1, label: "Configuration change recorded" },
          { from: 1, to: 1, label: "Rule restricted-ssh: NON_COMPLIANT" },
          { from: 1, to: 2, label: "Run remediation document" },
          { from: 2, to: 3, label: "Remove the open SSH rule" },
          { from: 1, to: 1, label: "Re-evaluate: COMPLIANT" },
        ],
      },
      {
        type: "tree",
        title: "Which tool answers which question?",
        root: "Question",
        children: [
          { label: "Is it healthy now?", children: ["CloudWatch metrics and alarms"] },
          { label: "What went wrong inside the app?", children: ["CloudWatch Logs and Logs Insights", "X-Ray traces for request paths"] },
          { label: "Who made this change?", children: ["CloudTrail event history or trail"] },
          { label: "What did this resource look like before?", children: ["AWS Config timeline"] },
          { label: "Are we following our rules?", children: ["Config rules and conformance packs"] },
          { label: "React to an API call right away", children: ["EventBridge rule on CloudTrail events"] },
        ],
      },
    ],
    examples: [
      {
        title: "Alarm on application errors found in logs",
        explanation: "An app writes lines like level=ERROR to the log group /app/web, and the team wants a page when errors pass 10 per minute for 3 minutes. Step 1: create a metric filter that counts matching lines into a custom metric. Step 2: create an alarm on that metric with Sum over 60-second periods, 3 of 3 data points, treating missing data as not breaching because no errors means no data. Step 3: send the alarm to an SNS topic that pages the on-call engineer.",
        code: {
          lang: "bash",
          code: "aws logs put-metric-filter --log-group-name /app/web --filter-name errors \\\n  --filter-pattern '\"level=ERROR\"' \\\n  --metric-transformations metricName=AppErrors,metricNamespace=MyApp,metricValue=1\n\naws cloudwatch put-metric-alarm --alarm-name web-errors-high \\\n  --namespace MyApp --metric-name AppErrors --statistic Sum --period 60 \\\n  --evaluation-periods 3 --datapoints-to-alarm 3 --threshold 10 \\\n  --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching \\\n  --alarm-actions arn:aws:sns:us-east-1:111122223333:oncall",
        },
      },
      {
        title: "Find who opened SSH to the world",
        explanation: "A Config rule flagged a security group with port 22 open to 0.0.0.0/0. Step 1: ask CloudTrail for recent AuthorizeSecurityGroupIngress calls to see who made the change, when and from which IP. Step 2: open the Config timeline for the security group to see the exact rule added and every resource attached to it. Step 3: remove the rule, then add automatic remediation to the Config rule so it is fixed within minutes next time.",
        code: {
          lang: "bash",
          code: "aws cloudtrail lookup-events \\\n  --lookup-attributes AttributeKey=EventName,AttributeValue=AuthorizeSecurityGroupIngress \\\n  --max-results 5 --query 'Events[].[EventTime,Username,CloudTrailEvent]'\n\naws configservice get-resource-config-history \\\n  --resource-type AWS::EC2::SecurityGroup --resource-id sg-0abc1234 --limit 3",
        },
      },
    ],
    cheatSheet: [
      "CloudWatch = performance now. CloudTrail = who called which API. Config = settings history and rules",
      "EC2 basic metrics every 5 min; detailed every 1 min; memory and disk need the agent",
      "Alarm states: OK, ALARM, INSUFFICIENT_DATA; use M of N data points to avoid noise",
      "Log groups never expire by default; set retention: aws logs put-retention-policy",
      "CloudTrail event history: 90 days of management events, free, per Region",
      "S3 object and Lambda invoke activity are data events: off by default, extra cost",
      "Config detects drift; remediate with SSM Automation; prevent with SCPs or IAM",
      "React to an API call in near real time: EventBridge rule on CloudTrail events",
    ],
    quiz: [
      {
        q: "You need to know how much memory EC2 instances use. What do you do?",
        options: ["Enable detailed monitoring", "Install the CloudWatch agent", "Turn on CloudTrail data events", "Create a Config rule"],
        answer: 1,
        why: "Memory is measured inside the OS, so the agent must collect and publish it.",
      },
      {
        q: "An alarm fires on single short CPU spikes and wakes people up for nothing. What is the best change?",
        options: ["Delete the alarm", "Use 1-second metrics", "Require 3 of 5 data points to breach before going to ALARM", "Switch the statistic to Minimum"],
        answer: 2,
        why: "M of N evaluation ignores brief spikes but still catches sustained problems.",
      },
      {
        q: "Security wants a record of every GetObject call on one sensitive bucket. What must be enabled?",
        options: ["CloudTrail data events for that bucket", "CloudTrail event history", "CloudWatch detailed monitoring", "AWS Config recorder"],
        answer: 0,
        why: "Object-level reads are data events, which trails do not log unless you enable them.",
      },
      {
        q: "Which service shows how a security group's rules looked last week?",
        options: ["CloudWatch Logs", "CloudTrail Insights", "Trusted Advisor", "AWS Config"],
        answer: 3,
        why: "Config records configuration items over time and shows a timeline per resource.",
      },
      {
        q: "CloudWatch Logs costs keep growing although traffic is flat. What is the most likely cause?",
        options: ["Too many alarms", "Log groups have no retention setting, so old logs are kept forever", "CloudTrail is writing to S3", "Metric filters are too broad"],
        answer: 1,
        why: "Log groups never expire by default, so stored data grows every day.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Set a 30-day retention on every log group in a Region that currently has none.",
        hint: "describe-log-groups shows retentionInDays only when it is set.",
        solution: "for g in $(aws logs describe-log-groups \\\n  --query 'logGroups[?retentionInDays==null].logGroupName' --output text); do\n  aws logs put-retention-policy --log-group-name \"$g\" --retention-in-days 30\n  echo \"set 30 days on $g\"\ndone",
      },
      {
        level: "medium",
        task: "Write a Logs Insights query that shows the 10 slowest requests in the last hour from a JSON log with fields path and latency_ms, and the error count per 5 minutes.",
        hint: "JSON fields are discovered automatically. Use sort, limit, filter and stats with bin().",
        solution: "# Query 1: slowest requests\nfields @timestamp, path, latency_ms\n| sort latency_ms desc\n| limit 10\n\n# Query 2: errors per 5 minutes\nfilter level = \"ERROR\"\n| stats count() as errors by bin(5m)",
      },
      {
        level: "hard",
        task: "Create a multi-Region trail with log file validation to a dedicated bucket, then add an EventBridge rule that notifies you whenever someone calls StopLogging.",
        hint: "The bucket policy must let cloudtrail.amazonaws.com write. EventBridge matches detail-type AWS API Call via CloudTrail.",
        solution: "aws cloudtrail create-trail --name org-audit --s3-bucket-name my-trail-logs-48213 \\\n  --is-multi-region-trail --enable-log-file-validation\naws cloudtrail start-logging --name org-audit\naws events put-rule --name trail-tamper --event-pattern '{\n  \"source\": [\"aws.cloudtrail\"],\n  \"detail-type\": [\"AWS API Call via CloudTrail\"],\n  \"detail\": {\"eventName\": [\"StopLogging\", \"DeleteTrail\"]}}'\naws events put-targets --rule trail-tamper \\\n  --targets Id=1,Arn=arn:aws:sns:us-east-1:111122223333:security\n# The SNS topic policy must allow events.amazonaws.com to publish.",
      },
    ],
    faq: [
      { q: "What is the difference between CloudWatch and CloudTrail?", a: "CloudWatch measures how resources and apps perform and holds their logs. CloudTrail records API calls, so it tells you who did something, not how fast the system is." },
      { q: "Is CloudTrail on by default?", a: "Yes, event history keeps 90 days of management events for free in each Region. For longer storage, data events or delivery to S3, you create a trail." },
      { q: "Does AWS Config stop non-compliant changes?", a: "No. Config detects and records them, and can trigger automatic remediation afterwards. To block changes up front, use SCPs, IAM policies or CloudFormation Guard checks in your pipeline." },
      { q: "How long does CloudWatch keep metrics?", a: "Up to 15 months, but older data is stored at coarser resolution: 1-minute points for 15 days, 5-minute points for 63 days, and 1-hour points after that." },
    ],
  },
};

export default extra;
