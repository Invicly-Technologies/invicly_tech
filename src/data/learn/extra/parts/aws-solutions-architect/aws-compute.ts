import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-compute/ec2": {
    plain: [
      "EC2 (Elastic Compute Cloud) rents you virtual servers, called instances, by the second. You pick how much CPU, memory, storage and network the server has by choosing an instance type, and you pick what software it starts with by choosing an AMI (Amazon Machine Image).",
      "Instance types come in families built for different jobs. General purpose types balance everything. Compute optimized types have more CPU for each GB of memory. Memory optimized types have lots of RAM for databases and caches. Storage optimized types have very fast local disks. Accelerated types add GPUs or AI chips.",
      "An AMI is a template: an operating system plus whatever you installed, frozen into an image. Build your app server once, save it as an AMI, and every new instance boots ready to work in a minute or two, instead of installing everything from scratch.",
      "Storage and placement matter too. Most instances keep their disks on EBS, network drives that survive a reboot or stop. Some also have instance store, very fast disks inside the host that are wiped when the instance stops. Placement groups decide whether instances sit close together for speed or far apart for safety.",
    ],
    deepDive: [
      {
        heading: "Reading an instance type name",
        body: "A name like m7gd.2xlarge packs in a lot. The first letter is the family: m general purpose, c compute, r memory, i storage, p and g GPU, and so on. The number is the generation; newer generations usually give better price-performance, so prefer them. Letters after the number are attributes: g means AWS Graviton (Arm) processors, i Intel, a AMD, d local NVMe instance store, n extra network bandwidth, e extra memory or storage, and z high CPU frequency.\n\nAfter the dot comes the size. Each step up roughly doubles vCPUs and memory: an m7g.large has 2 vCPUs and 8 GiB, xlarge has 4 and 16, 2xlarge has 8 and 32. Metal sizes give you the whole physical server.\n\nGraviton instances are often about 20 percent cheaper than comparable x86 instances. Most Linux software, containers and managed runtimes work on Arm without changes.",
        visual: {
          type: "layers",
          title: "m7gd.2xlarge decoded",
          layers: [
            { label: "m", detail: "Family: general purpose." },
            { label: "7", detail: "Generation: seventh." },
            { label: "g", detail: "Processor: AWS Graviton (Arm)." },
            { label: "d", detail: "Extra: local NVMe instance store." },
            { label: "2xlarge", detail: "Size: 8 vCPUs and 32 GiB memory." },
          ],
        },
      },
      {
        heading: "Burstable T instances and CPU credits",
        body: "T instances, such as t3.micro or t4g.small, are cheap because they expect low average CPU use. Each size has a baseline, for example 10 percent per vCPU for a t3.micro. Running below the baseline earns CPU credits; running above it spends them. That suits web servers, dev boxes and small databases that are idle most of the time and busy in short bursts.\n\nIn standard mode, an instance that runs out of credits is held to its baseline, which can feel like the server froze. In unlimited mode, the default for T3 and T4g, it keeps bursting, and you pay a small charge if average usage over 24 hours stays above the baseline.\n\nThe rule of thumb: if CPU is regularly high, a T instance in unlimited mode ends up costing more than an M instance. Watch the CPUCreditBalance and CPUSurplusCreditsCharged metrics in CloudWatch.",
      },
      {
        heading: "AMIs: build, copy, share",
        body: "An AMI is a set of EBS snapshots (one per volume) plus a block device mapping and launch permissions. create-image reboots the instance by default so the file system is consistent; --no-reboot avoids downtime but risks an inconsistent image.\n\nAMIs are Regional. To launch in another Region, copy the AMI there with copy-image. To share, add launch permissions for specific account IDs, or for an organization or OU ARN. Sharing an encrypted AMI also requires sharing its customer managed KMS key; AMIs encrypted with the AWS managed EBS key cannot be shared.\n\nMature teams use a golden AMI pipeline: start from a current base image, install and harden software, run tests, then distribute to Regions and accounts. EC2 Image Builder automates this on a schedule. Deprecate old AMIs so nobody launches outdated, unpatched images, and turn on deregistration protection for important ones.",
        visual: {
          type: "flow",
          title: "Golden AMI pipeline",
          steps: [
            { label: "Base image", detail: "Latest Amazon Linux or Ubuntu AMI." },
            { label: "Build", detail: "Install agents, app runtime and patches." },
            { label: "Harden and test", detail: "CIS settings, scans, smoke tests." },
            { label: "Distribute", detail: "Copy to Regions, share with accounts." },
            { label: "Use", detail: "Launch templates point at the new AMI." },
          ],
        },
      },
      {
        heading: "EBS versus instance store",
        body: "EBS volumes are network-attached block storage. They live in one AZ, persist independently of the instance, can be detached and reattached, and are backed up with incremental snapshots stored in S3. gp3 is the default general purpose type, with a baseline of 3,000 IOPS and 125 MiB/s whatever its size, and you can buy more performance separately. io2 Block Express serves the most demanding databases, while st1 and sc1 are cheap hard disk types for large sequential data.\n\nInstance store is NVMe storage physically attached to the host. It is very fast and included in the instance price, but its data is lost when the instance stops, hibernates or terminates, or when the host fails. A reboot keeps it.\n\nUse instance store for caches, scratch space and data that is replicated elsewhere, such as Cassandra or Kafka nodes. Note that the root EBS volume is deleted on termination by default, while extra volumes are kept.",
        visual: {
          type: "compare",
          title: "EBS vs instance store",
          columns: [
            { title: "EBS", points: ["Network-attached, one AZ", "Survives stop and terminate (if kept)", "Snapshots to S3", "Billed per GB and performance"] },
            { title: "Instance store", points: ["Physically attached NVMe", "Lost on stop, terminate or host failure", "No snapshots", "Included in instance price"] },
          ],
        },
      },
      {
        heading: "Placement groups and fast networking",
        body: "A cluster placement group packs instances close together in one AZ. Within it, a single network flow can reach up to 10 Gbps instead of 5 Gbps, with the lowest latency. Use the same instance type and launch all instances in one request, or you may hit insufficient capacity errors. For tightly coupled HPC jobs, add the Elastic Fabric Adapter (EFA), which lets MPI traffic bypass the operating system.\n\nA spread placement group puts each instance on distinct hardware racks, up to seven running instances per AZ per group. It suits a handful of critical instances, such as primary and standby nodes.\n\nA partition placement group divides instances into up to seven partitions per AZ, each on its own racks, with many instances per partition. Instances can read their partition number from instance metadata, so systems like HDFS, Kafka and Cassandra can place replicas in different partitions.",
        bullets: ["Cluster: one AZ, lowest latency, shared failure risk", "Spread: max 7 running instances per AZ per group", "Partition: up to 7 partitions per AZ, many instances each", "A stopped instance can be moved into a group"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Instance lifecycle and billing",
        steps: [
          { label: "Pending", detail: "Booting; billing starts when running." },
          { label: "Running", detail: "Billed per second (Linux, 60 s minimum)." },
          { label: "Stopping", detail: "Instance store data is lost." },
          { label: "Stopped", detail: "No compute charge; EBS still billed." },
          { label: "Start again", detail: "Often on a new host, new public IP." },
        ],
      },
    ],
    examples: [
      {
        title: "Picking families for four workloads",
        explanation: "Step 1, a company website with low average CPU: t4g.medium, burstable and cheap. Step 2, nightly video encoding that can be restarted: compute optimized c7g or c7i, bought as Spot to save money. Step 3, a self-managed in-memory cache needing 400 GB of RAM: memory optimized r7g.16xlarge (512 GiB). Step 4, a Cassandra cluster with heavy local I/O: storage optimized i4i instances with NVMe instance store, in a partition placement group, with replication factor 3 so losing a node or a rack loses no data. In each case, read the requirement (CPU, memory, disk, or cost) and map it to the family letter first, then size it.",
      },
      {
        title: "Building and sharing a golden AMI",
        explanation: "Step 1: create an AMI from a configured instance and wait until it is available. Step 2: copy it to eu-west-1, because AMIs are Regional. Step 3: share both copies with the production account. Step 4: update the production launch template to the new AMI IDs. If the volumes are encrypted with a customer managed key, also allow the production account to use that key, or launches there will fail.",
        code: {
          lang: "bash",
          code: "AMI=$(aws ec2 create-image --instance-id i-0abc1234 \\\n  --name \"web-2026-11-10\" --query ImageId --output text)\naws ec2 wait image-available --image-ids $AMI\n\nEU_AMI=$(aws ec2 copy-image --source-image-id $AMI \\\n  --source-region us-east-1 --region eu-west-1 \\\n  --name \"web-2026-11-10\" --query ImageId --output text)\n\naws ec2 modify-image-attribute --image-id $AMI \\\n  --launch-permission \"Add=[{UserId=222233334444}]\"",
        },
      },
    ],
    cheatSheet: [
      "Type name: family + generation + attributes . size, e.g. c7gn.xlarge",
      "g = Graviton, a = AMD, i = Intel, d = local NVMe, n = more network, e = more memory",
      "Each size step roughly doubles vCPUs and memory",
      "T instances: baseline plus credits; unlimited mode charges for sustained bursting",
      "AMIs are Regional: copy-image to use one in another Region",
      "gp3 baseline: 3,000 IOPS and 125 MiB/s at any size",
      "Instance store survives reboot but not stop, hibernate, terminate or host failure",
      "Spread placement group: at most 7 running instances per AZ",
    ],
    quiz: [
      {
        q: "What does the d in m7gd.large indicate?",
        options: ["Dedicated host", "Local NVMe instance store", "Double memory", "Disk-optimized EBS"],
        answer: 1,
        why: "The d attribute means the instance includes local NVMe instance store volumes.",
      },
      {
        q: "A t3.micro web server becomes very slow every afternoon; CPUCreditBalance drops to zero. It runs in standard mode. What is happening?",
        options: ["The EBS volume is full", "The AZ is overloaded", "Instance store was wiped", "It used all its CPU credits and is held to baseline"],
        answer: 3,
        why: "In standard mode, a T instance with no credits can only use its baseline CPU.",
      },
      {
        q: "Data on an instance store volume must survive which of these events?",
        options: ["A reboot", "A stop and start", "Hibernation", "Termination"],
        answer: 0,
        why: "Instance store data survives a reboot only; stopping, hibernating or terminating loses it.",
      },
      {
        q: "A Kafka cluster of 30 brokers must keep replicas on separate racks and know which rack each broker is on. Which placement group?",
        options: ["Cluster", "Spread", "Partition", "None; use multiple AZs only"],
        answer: 2,
        why: "Partition placement groups isolate racks and expose partition numbers for rack-aware replication.",
      },
      {
        q: "You want to launch your custom AMI in eu-west-1, but it was built in us-east-1. What do you do?",
        options: ["Share the AMI with eu-west-1", "Copy the AMI to eu-west-1", "Nothing; AMIs are global", "Export it to S3 and re-import"],
        answer: 1,
        why: "AMIs are Regional resources, and copy-image creates a copy in the target Region.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Compare vCPUs and memory for m7g.large, c7g.large and r7g.large with one CLI command.",
        hint: "describe-instance-types with a JMESPath query.",
        solution: "aws ec2 describe-instance-types \\\n  --instance-types m7g.large c7g.large r7g.large \\\n  --query \"InstanceTypes[].[InstanceType,VCpuInfo.DefaultVCpus,MemoryInfo.SizeInMiB]\" \\\n  --output table\n# All have 2 vCPUs; memory is 4, 8 and 16 GiB: c, m and r ratios.",
      },
      {
        level: "medium",
        task: "Create a partition placement group with 3 partitions and launch two instances into partition 1.",
        hint: "Use create-placement-group with --strategy partition, then --placement on run-instances.",
        solution: "aws ec2 create-placement-group --group-name kafka-pg \\\n  --strategy partition --partition-count 3\naws ec2 run-instances --image-id $AMI --instance-type m7g.large \\\n  --count 2 --subnet-id $PRIV_A \\\n  --placement \"GroupName=kafka-pg,PartitionNumber=1\"\naws ec2 describe-instances --filters Name=placement-group-name,Values=kafka-pg \\\n  --query \"Reservations[].Instances[].[InstanceId,Placement.PartitionNumber]\"",
      },
      {
        level: "hard",
        task: "On an instance, read its role credentials path using IMDSv2, then require IMDSv2 on that instance so the older, token-less method stops working.",
        hint: "IMDSv2 needs a PUT for a session token first; enforcing it is a metadata options change.",
        solution: "# On the instance:\nTOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token \\\n  -H \"X-aws-ec2-metadata-token-ttl-seconds: 300\")\ncurl -s -H \"X-aws-ec2-metadata-token: $TOKEN\" \\\n  http://169.254.169.254/latest/meta-data/iam/security-credentials/\n# From your laptop:\naws ec2 modify-instance-metadata-options --instance-id i-0abc1234 \\\n  --http-tokens required --http-endpoint enabled\n# A plain curl without the token now returns 401.",
      },
    ],
    faq: [
      { q: "What is the difference between stopping and terminating an instance?", a: "Stopping shuts it down but keeps its EBS volumes, so you can start it again later. Terminating deletes the instance, and by default its root volume too." },
      { q: "Should I use Graviton instances?", a: "Usually yes for new Linux workloads. They often give better price-performance, but check that every binary and library you use has an Arm64 build." },
      { q: "Why did my instance get a new public IP after a restart?", a: "Auto-assigned public IPv4 addresses are released on stop. Use an Elastic IP, or better, a load balancer or DNS name, if the address must stay the same." },
      { q: "What is hibernation?", a: "Hibernate saves the instance's RAM to its encrypted EBS root volume and restores it on start, so long-running processes resume where they left off." },
    ],
  },

  "aws-compute/elb-asg": {
    plain: [
      "A load balancer is a traffic officer standing in front of your servers. Users talk to one address, and the load balancer passes each request to a healthy server behind it. If a server breaks, the load balancer stops sending it traffic, and users never notice.",
      "Elastic Load Balancing has three main types. The Application Load Balancer (ALB) understands web requests and can route by URL path or host name. The Network Load Balancer (NLB) works with raw TCP and UDP connections and is extremely fast. The Gateway Load Balancer (GWLB) sends traffic through security appliances such as firewalls.",
      "An Auto Scaling group (ASG) is a manager that keeps the right number of servers running. You say \"at least 2, at most 10\", and it launches or removes instances to follow demand. If an instance fails a health check, the group replaces it with a fresh one.",
      "Together they make a self-healing, elastic tier. Traffic grows, the ASG adds instances and registers them with the load balancer. Traffic falls, it removes them and you stop paying. An instance dies at 3 am, and a replacement is serving users before anyone wakes up.",
    ],
    deepDive: [
      {
        heading: "ALB listeners and routing rules",
        body: "A listener waits on a port and protocol, usually HTTPS on 443 with an ACM certificate, plus HTTP on 80 that redirects to HTTPS. Each listener has rules checked in priority order. Conditions can match the host header, URL path, HTTP headers, method, query string or source IP. Actions can forward to one target group or split traffic across several by weight (handy for blue/green releases), redirect, return a fixed response, or authenticate users through Cognito or any OIDC provider before forwarding.\n\nTargets can be instances, IP addresses (for containers or on-premises servers) or Lambda functions. The ALB adds an X-Forwarded-For header so your app can see the real client IP. Sticky sessions keep a user on the same target using a cookie, but they work against even load spreading, so prefer storing session data in ElastiCache or DynamoDB.",
        visual: {
          type: "tree",
          title: "One ALB, many routes",
          root: "HTTPS listener :443",
          children: [
            { label: "Host api.example.com", children: ["Forward to api-tg"] },
            { label: "Path /images/*", children: ["Forward to image-tg"] },
            { label: "Header x-beta: on", children: ["Weighted: 90% v1-tg, 10% v2-tg"] },
            { label: "Path /old/*", children: ["Redirect 301 to /new/"] },
            { label: "Default rule", children: ["Forward to web-tg"] },
          ],
        },
      },
      {
        heading: "NLB and GWLB specifics",
        body: "The NLB works at layer 4, forwarding TCP, UDP and TLS connections without reading HTTP. It handles millions of requests per second with very low latency and suits long-lived connections, gaming, IoT and non-HTTP protocols. It gives one static IP per AZ, or you can attach your own Elastic IPs, which helps when clients must allow-list addresses. With instance targets, the client's source IP is preserved. NLBs can now have security groups too.\n\nCross-zone load balancing is always on for ALBs but off by default for NLBs, and turning it on for an NLB adds cross-AZ data charges. An NLB is also required to publish a service through PrivateLink.\n\nThe GWLB uses the GENEVE protocol on port 6081 to pass traffic transparently through a fleet of third-party firewalls or inspection appliances. Gateway Load Balancer endpoints in route tables steer traffic to it.",
        bullets: ["NLB: TCP, UDP, TLS; static IP per AZ", "NLB: preserves client IP; required for PrivateLink", "Cross-zone: always on for ALB, off by default for NLB", "GWLB: GENEVE 6081, firewall fleets"],
      },
      {
        heading: "Health checks, draining and slow start",
        body: "Each target group runs its own health checks. ALB defaults are a check every 30 seconds with a 5-second timeout, 5 consecutive successes to become healthy, 2 failures to become unhealthy, and HTTP 200 as success. Point the check at a lightweight /health page that tests the app's real dependencies, not just that the web server responds.\n\nWhen a target is removed, the load balancer stops sending new requests but lets in-flight ones finish during the deregistration delay, 300 seconds by default. Lower it for short requests so deployments go faster. Slow start ramps traffic gradually to new targets that need to warm caches.\n\nBy default an ASG only uses EC2 status checks, which catch hardware and OS failures but not a crashed app. Set the ASG health check type to ELB so failed load balancer checks also trigger replacement, with a grace period long enough for the app to boot.",
        visual: {
          type: "sequence",
          title: "A hung app gets replaced",
          actors: ["Load balancer", "Instance A", "Auto Scaling group"],
          messages: [
            { from: 0, to: 1, label: "GET /health times out, twice" },
            { from: 0, to: 2, label: "Target A is unhealthy" },
            { from: 2, to: 1, label: "Terminate after draining" },
            { from: 2, to: 0, label: "Register new instance B" },
            { from: 0, to: 0, label: "B passes 5 checks, gets traffic" },
          ],
        },
      },
      {
        heading: "Inside an Auto Scaling group",
        body: "A launch template holds the instance settings: AMI, instance type, security groups, IAM instance profile, user data and metadata options. It is versioned, so the ASG can point at a specific version or at the default. Launch configurations are the legacy alternative; use templates.\n\nThe ASG keeps desired capacity between min and max, spreads instances evenly across the subnets and AZs you list, and rebalances if one AZ gets too many. A mixed instances policy combines several instance types and On-Demand with Spot, for example a base of two On-Demand instances and the rest 70 percent Spot.\n\nInstance refresh replaces instances in rolling batches after you change the launch template, while keeping a minimum healthy percentage. Lifecycle hooks pause an instance in Pending:Wait or Terminating:Wait, one hour by default, so you can install software or copy logs. Warm pools keep pre-initialized stopped instances ready for apps that boot slowly.",
      },
      {
        heading: "Choosing a scaling policy",
        body: "Target tracking is the default choice. You pick a metric and a target, such as average CPU at 50 percent or 1,000 requests per target, and the ASG creates the CloudWatch alarms and adjusts capacity for you. It scales out quickly and in slowly to avoid flapping. Step scaling adds or removes different amounts depending on how far an alarm is breached, when you want more control. Simple scaling is legacy.\n\nScheduled actions change min, max or desired at set times, with cron expressions and a time zone, for known peaks like 9 am Monday to Friday. Predictive scaling studies past daily and weekly patterns and launches capacity ahead of forecast demand.\n\nFor queue workers, CPU is a poor signal. Publish a custom metric of backlog per instance (messages waiting divided by running instances) and target-track that. Set a default instance warmup so new instances are not counted before they are ready.",
        visual: {
          type: "compare",
          title: "Scaling policy types",
          columns: [
            { title: "Target tracking", points: ["Hold a metric at a target", "Alarms created for you", "CPU, requests per target, custom", "Best default"] },
            { title: "Step scaling", points: ["You define alarms", "Bigger breach, bigger step", "More control", "More to tune"] },
            { title: "Scheduled and predictive", points: ["Act before demand arrives", "Cron with time zone", "Forecast from history", "Combine with target tracking"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From a user to a healthy target",
        steps: [
          { label: "DNS lookup", detail: "ALB name returns IPs of nodes in each AZ." },
          { label: "ALB node", detail: "Terminates TLS with the ACM certificate." },
          { label: "Listener rule", detail: "Host or path picks a target group." },
          { label: "Target group", detail: "Only healthy targets are candidates." },
          { label: "Instance", detail: "Request served; reply goes back via the ALB." },
        ],
      },
    ],
    examples: [
      {
        title: "A self-healing web tier from the CLI",
        explanation: "Step 1: create a launch template with the AMI, instance type, app security group, instance role and IMDSv2 required. Step 2: create the ASG across two private subnets in different AZs, attached to the ALB's target group, with min 2 and max 6. Step 3: set the health check type to ELB with a 120-second grace period, so a hung app is replaced. Step 4: add the target tracking policy (shown in the explainer). Step 5: test by stopping the app on one instance and watching the ASG replace it.",
        code: {
          lang: "bash",
          code: "aws ec2 create-launch-template --launch-template-name web-lt \\\n  --launch-template-data '{\"ImageId\":\"ami-0abcdef1234567890\",\n    \"InstanceType\":\"t4g.small\",\"SecurityGroupIds\":[\"sg-0app\"],\n    \"IamInstanceProfile\":{\"Name\":\"web-role\"},\n    \"MetadataOptions\":{\"HttpTokens\":\"required\"}}'\n\naws autoscaling create-auto-scaling-group --auto-scaling-group-name web-asg \\\n  --launch-template 'LaunchTemplateName=web-lt,Version=$Default' \\\n  --min-size 2 --max-size 6 --desired-capacity 2 \\\n  --vpc-zone-identifier \"subnet-0privA,subnet-0privB\" \\\n  --target-group-arns $TG_ARN \\\n  --health-check-type ELB --health-check-grace-period 120",
        },
      },
      {
        title: "Getting ahead of the 9 am rush",
        explanation: "An internal app jumps from 2 to 8 instances every weekday at 9 am London time, and target tracking reacts a few minutes late. Step 1: add a scheduled action at 08:30 Monday to Friday that raises min and desired to 8. Step 2: add another at 18:00 that lowers min back to 2, so target tracking can scale in overnight. Step 3: keep the target tracking policy for unexpected spikes during the day. Predictive scaling could learn this pattern by itself, but a schedule is simpler when the pattern is fixed.",
        code: {
          lang: "bash",
          code: "aws autoscaling put-scheduled-update-group-action \\\n  --auto-scaling-group-name web-asg --scheduled-action-name morning \\\n  --recurrence \"30 8 * * 1-5\" --time-zone \"Europe/London\" \\\n  --min-size 8 --desired-capacity 8\naws autoscaling put-scheduled-update-group-action \\\n  --auto-scaling-group-name web-asg --scheduled-action-name evening \\\n  --recurrence \"0 18 * * 1-5\" --time-zone \"Europe/London\" \\\n  --min-size 2",
        },
      },
    ],
    cheatSheet: [
      "ALB: layer 7, host and path rules, Lambda targets, WAF, OIDC authentication",
      "NLB: layer 4 TCP and UDP, static IP per AZ, preserves client IP, needed for PrivateLink",
      "GWLB: GENEVE on port 6081 for transparent firewall fleets",
      "ALB health check defaults: 30 s interval, 5 healthy, 2 unhealthy, 5 s timeout",
      "Deregistration delay defaults to 300 seconds; lower it for faster deploys",
      "Set ASG health check type to ELB so app failures trigger replacement",
      "Instance refresh rolls out a new launch template version in batches",
      "Queue workers: scale on backlog per instance, not CPU",
    ],
    quiz: [
      {
        q: "Clients must allow-list fixed IP addresses for a TCP service that needs very low latency. Which load balancer?",
        options: ["Application Load Balancer", "Gateway Load Balancer", "Classic Load Balancer", "Network Load Balancer"],
        answer: 3,
        why: "An NLB provides a static IP per AZ, or your Elastic IPs, for layer 4 traffic.",
      },
      {
        q: "An app crashes but the instance stays up, and the ASG never replaces it. What should you change?",
        options: ["Set the ASG health check type to ELB", "Increase max size", "Enable cross-zone load balancing", "Turn on sticky sessions"],
        answer: 0,
        why: "With only EC2 status checks, a running instance with a dead app looks healthy to the ASG.",
      },
      {
        q: "During deployments, old instances stay in the target group for five minutes after removal. Why?",
        options: ["The health check interval is 5 minutes", "Slow start is enabled", "The default deregistration delay is 300 seconds", "The ASG cooldown is 300 seconds"],
        answer: 2,
        why: "Deregistration delay lets in-flight requests finish, and defaults to 300 seconds.",
      },
      {
        q: "You update the AMI in your launch template. What replaces running instances gradually with the new version?",
        options: ["A scheduled action", "Instance refresh", "A lifecycle hook", "Predictive scaling"],
        answer: 1,
        why: "Instance refresh replaces instances in rolling batches while keeping a minimum healthy percentage.",
      },
      {
        q: "SQS worker instances sit at low CPU while the queue grows. Which metric should drive scaling?",
        options: ["Average CPU utilization", "Network in", "Request count per target", "Backlog per instance"],
        answer: 3,
        why: "Messages waiting per instance reflects real demand for queue workers.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a target group for an HTTP app on port 8080 with a health check on /health, and list its targets' health.",
        hint: "create-target-group, then describe-target-health.",
        solution: "TG_ARN=$(aws elbv2 create-target-group --name web-tg \\\n  --protocol HTTP --port 8080 --vpc-id $VPC \\\n  --health-check-path /health --health-check-interval-seconds 15 \\\n  --healthy-threshold-count 3 --unhealthy-threshold-count 2 \\\n  --query \"TargetGroups[0].TargetGroupArn\" --output text)\naws elbv2 describe-target-health --target-group-arn $TG_ARN",
      },
      {
        level: "medium",
        task: "Add an ALB listener rule that sends /api/* to an api-tg target group, ahead of the default rule.",
        hint: "Rules need a priority; lower numbers are evaluated first.",
        solution: "aws elbv2 create-rule --listener-arn $LISTENER_ARN \\\n  --priority 10 \\\n  --conditions Field=path-pattern,Values='/api/*' \\\n  --actions Type=forward,TargetGroupArn=$API_TG_ARN\naws elbv2 describe-rules --listener-arn $LISTENER_ARN \\\n  --query \"Rules[].[Priority,Conditions[0].Values[0]]\"",
      },
      {
        level: "hard",
        task: "Change web-asg to a mixed instances policy: 2 On-Demand instances as a base, then 30% On-Demand and 70% Spot, across three Graviton instance types.",
        hint: "update-auto-scaling-group takes a MixedInstancesPolicy JSON with overrides and an instances distribution.",
        solution: "aws autoscaling update-auto-scaling-group --auto-scaling-group-name web-asg \\\n  --mixed-instances-policy '{\n  \"LaunchTemplate\":{\"LaunchTemplateSpecification\":\n    {\"LaunchTemplateName\":\"web-lt\",\"Version\":\"$Default\"},\n   \"Overrides\":[{\"InstanceType\":\"t4g.small\"},{\"InstanceType\":\"m7g.medium\"},\n                {\"InstanceType\":\"c7g.medium\"}]},\n  \"InstancesDistribution\":{\"OnDemandBaseCapacity\":2,\n    \"OnDemandPercentageAboveBaseCapacity\":30,\n    \"SpotAllocationStrategy\":\"price-capacity-optimized\"}}'",
      },
    ],
    faq: [
      { q: "ALB or NLB for a normal website?", a: "An ALB. It understands HTTP, supports path and host routing, WAF and authentication. Choose an NLB for non-HTTP protocols, static IPs or extreme performance." },
      { q: "What is the difference between desired, minimum and maximum capacity?", a: "Minimum and maximum are the limits. Desired is how many instances the group runs right now, and scaling policies move it between those limits." },
      { q: "Is the Classic Load Balancer still used?", a: "It is a previous-generation load balancer kept for older setups. New designs should use ALB, NLB or GWLB." },
      { q: "Can an ALB route to Lambda functions?", a: "Yes. A target group can have a Lambda function as its target, and the ALB invokes it with the request as an event." },
    ],
  },

  "aws-compute/containers": {
    plain: [
      "A container packs an app with everything it needs, such as libraries and runtime, into one image that runs the same on a laptop or in the cloud. Running one container is easy. Running hundreds across many servers, restarting them when they crash and rolling out new versions, needs an orchestrator.",
      "AWS offers two orchestrators. Amazon ECS is AWS's own: simpler, with fewer moving parts. Amazon EKS runs standard Kubernetes, the popular open-source orchestrator, so your Kubernetes skills and tools work as usual.",
      "Both need computers to run on. You can run containers on EC2 instances that you choose and look after, or on AWS Fargate, where AWS provides the computer for each task and you never see a server. Fargate costs a little more per unit, but removes patching and capacity planning.",
      "Images have to live somewhere. Amazon ECR (Elastic Container Registry) is a private registry inside your AWS account. Your build pipeline pushes images to ECR, and ECS or EKS pulls them when starting containers, with IAM deciding who may push and pull.",
    ],
    deepDive: [
      {
        heading: "ECS building blocks",
        body: "A cluster is a logical group for your workloads. A task definition is the blueprint: one or more containers, each with an image, CPU and memory, ports, environment variables, secrets and log settings, plus IAM roles and the network mode. Every change creates a new revision, such as web:7. A task is one running copy of a task definition.\n\nA service keeps a desired number of tasks running, replaces failed ones, and registers them with a load balancer target group. Rolling deployments are controlled by minimum healthy percent and maximum percent; the deployment circuit breaker can roll back automatically if new tasks keep failing. ECS also supports blue/green deployments.\n\nCapacity providers say where tasks run: FARGATE, FARGATE_SPOT, or an Auto Scaling group of EC2 instances. A capacity provider strategy can mix them, for example a base on Fargate with extra tasks on Fargate Spot. Standalone tasks, started by run-task or an EventBridge schedule, suit batch jobs.",
        visual: {
          type: "tree",
          title: "Inside an ECS cluster",
          root: "ECS cluster",
          children: [
            { label: "Service: web", children: ["Desired count 3", "Behind an ALB target group", "Rolling deploy with rollback"] },
            { label: "Service: worker", children: ["Desired count 2", "Reads from an SQS queue"] },
            { label: "Standalone tasks", children: ["Batch jobs via run-task", "Scheduled by EventBridge"] },
            { label: "Capacity providers", children: ["FARGATE", "FARGATE_SPOT", "EC2 Auto Scaling group"] },
          ],
        },
      },
      {
        heading: "Fargate or EC2 capacity",
        body: "With Fargate, each task runs in its own isolated environment with its own kernel, so tasks never share a host with other customers' tasks or with each other. Fargate requires the awsvpc network mode. Task sizes range from 0.25 vCPU with 0.5 GB up to 16 vCPU with 120 GB, with 20 GiB of ephemeral storage by default, expandable to 200 GiB. You pay per vCPU and GB per second while tasks run. Fargate Spot runs interruptible tasks at a large discount, with a two-minute warning before AWS reclaims capacity.\n\nWith EC2 capacity, you choose the instance types, including GPU instances, which Fargate does not offer. You can run daemon tasks on every host and pack many small tasks onto large instances, which is cheaper at steady high scale. In exchange, you patch the AMI and scale the instances, though capacity provider managed scaling helps.\n\nOn the exam, \"no servers to manage\" means Fargate; \"GPU\" or \"specific instance type\" means EC2.",
        visual: {
          type: "compare",
          title: "Fargate vs EC2 launch type",
          columns: [
            { title: "Fargate", points: ["No servers to patch or scale", "Per-task isolation", "Up to 16 vCPU and 120 GB per task", "No GPUs", "Fargate Spot for interruptible work"] },
            { title: "EC2", points: ["You manage instances and AMIs", "Any instance type, incl. GPUs", "Daemon tasks and bin packing", "Cheaper at steady high use", "Spot instances via the ASG"] },
          ],
        },
      },
      {
        heading: "Task role, execution role and networking",
        body: "Two IAM roles confuse many people. The task execution role is used by ECS itself to start the task: pull the image from ECR, send logs to CloudWatch Logs, and fetch secrets from Secrets Manager or Parameter Store to inject as environment variables. The task role is used by your application code at runtime, for example to read from S3 or write to DynamoDB. Give each service its own task role with least privilege.\n\nIn awsvpc mode, every task gets its own elastic network interface, private IP and security group, just like an EC2 instance. That allows fine-grained rules such as \"only the web service may reach the orders service\". Load balancer target groups must use the ip target type for awsvpc tasks.\n\nTasks in private subnets need a path to ECR, CloudWatch Logs and other services: a NAT gateway, or VPC endpoints for ECR (api and dkr), S3 for image layers, and logs.",
        visual: {
          type: "sequence",
          title: "Which role is used when",
          actors: ["ECS (execution role)", "Amazon ECR", "Secrets Manager", "App container (task role)"],
          messages: [
            { from: 0, to: 1, label: "Pull image web:1.4" },
            { from: 0, to: 2, label: "Get DB password secret" },
            { from: 0, to: 3, label: "Start container with secret env" },
            { from: 3, to: 3, label: "Call S3 and DynamoDB with task role" },
          ],
        },
      },
      {
        heading: "EKS in brief",
        body: "EKS runs the Kubernetes control plane for you across three AZs, with automatic patching of control plane components, for an hourly fee per cluster. Each Kubernetes version has standard support and then a paid extended support period, so plan regular upgrades.\n\nFor worker capacity you can use managed node groups (EC2 instances in an ASG that EKS updates for you), self-managed nodes, Fargate profiles that run pods without nodes, Karpenter for fast, flexible node provisioning, or EKS Auto Mode, where AWS manages nodes, scaling and core add-ons.\n\nPods get IAM permissions through EKS Pod Identity or IAM roles for service accounts (IRSA). The Amazon VPC CNI gives each pod a real VPC IP address, which is simple but consumes IPs quickly, so size subnets generously.\n\nChoose EKS when the team already uses Kubernetes, needs portability across clouds or on-premises, or relies on the Kubernetes ecosystem such as Helm charts and operators.",
      },
      {
        heading: "ECR features worth knowing",
        body: "ECR repositories are private, Regional and controlled by IAM policies plus optional repository policies, which allow cross-account pulls. Image URIs look like account.dkr.ecr.region.amazonaws.com/name:tag.\n\nBasic scanning checks images for known vulnerabilities on push. Enhanced scanning uses Amazon Inspector to scan continuously, including operating system and programming language packages, and rescans when new CVEs appear. Tag immutability stops anyone overwriting a tag like 1.4 with different content, which makes deployments repeatable.\n\nLifecycle policies expire old or untagged images automatically, keeping storage costs down. Replication copies images to other Regions or accounts for multi-Region deployments. Pull-through cache rules mirror public registries, such as ECR Public or Docker Hub, into your account, which avoids rate limits and keeps builds working if the upstream is down.",
        bullets: ["Login: aws ecr get-login-password piped to docker login", "Enhanced scanning uses Amazon Inspector", "Tag immutability for repeatable deploys", "Lifecycle policies expire old images", "Replication and pull-through cache"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Rolling out a new version on ECS",
        steps: [
          { label: "Push image", detail: "CI builds and pushes web:1.5 to ECR." },
          { label: "New revision", detail: "Register task definition web:8." },
          { label: "Update service", detail: "Point the service at web:8." },
          { label: "Start and check", detail: "New tasks must pass ALB health checks." },
          { label: "Drain old tasks", detail: "Old tasks stop; rollback if new ones fail." },
        ],
      },
    ],
    examples: [
      {
        title: "A Fargate task definition for a web app",
        explanation: "Step 1: write the task definition below: Fargate-compatible, awsvpc networking, 0.25 vCPU and 512 MB, an execution role for pulling the image and writing logs, and a task role for the app's own AWS calls. Step 2: register it with aws ecs register-task-definition --cli-input-json file://web.json. Step 3: create a service with --launch-type FARGATE, two private subnets, a security group, and the ALB target group (target type ip). Step 4: check the service events; new tasks appear, pass health checks, and receive traffic.",
        code: {
          lang: "json",
          code: `{
  "family": "web",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256", "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/web-task",
  "containerDefinitions": [{
    "name": "web", "essential": true,
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/web:1.0",
    "portMappings": [{"containerPort": 8080}],
    "logConfiguration": {"logDriver": "awslogs", "options": {"awslogs-group": "/ecs/web",
      "awslogs-region": "us-east-1", "awslogs-stream-prefix": "web"}}
  }]
}`,
        },
      },
      {
        title: "ECS or EKS: two companies",
        explanation: "Company A is a small team moving a few Docker Compose services to AWS. Nobody knows Kubernetes, and the brief says least operational overhead. Step 1: no Kubernetes requirement, so ECS. Step 2: no GPUs or special instances, so Fargate. Step 3: images in ECR, services behind an ALB. Company B already runs 40 microservices on Kubernetes on-premises with Helm charts and wants the same tooling in AWS and the option to run elsewhere later. Step 1: existing manifests and portability point to EKS. Step 2: managed node groups or Auto Mode to limit node work, plus Fargate profiles for small, spiky jobs. The deciding words are \"existing Kubernetes\" and \"portability\" for EKS, and \"simplest\" or \"least overhead\" for ECS on Fargate.",
      },
    ],
    cheatSheet: [
      "ECS: AWS-native, no control plane fee. EKS: Kubernetes, hourly fee per cluster",
      "Fargate: no servers, awsvpc only, up to 16 vCPU and 120 GB per task, no GPUs",
      "Execution role: pull image, write logs, fetch secrets. Task role: your app's AWS calls",
      "awsvpc tasks need target type ip in the load balancer target group",
      "Fargate Spot: big discount, two-minute warning before interruption",
      "ECR login: aws ecr get-login-password | docker login --username AWS --password-stdin",
      "ECR lifecycle policies expire old images; tag immutability blocks tag overwrites",
      "Private subnet tasks need NAT or endpoints for ECR api, ECR dkr, S3 and logs",
    ],
    quiz: [
      {
        q: "A container must read objects from S3 at runtime. Which role should hold s3:GetObject?",
        options: ["The task execution role", "The ECS service-linked role", "The task role", "The EC2 instance role of every host"],
        answer: 2,
        why: "The task role is the identity your application code uses for AWS API calls.",
      },
      {
        q: "A team needs GPU instances for containerized ML inference on ECS. Which capacity type?",
        options: ["EC2 launch type with GPU instances", "Fargate", "Fargate Spot", "Lambda container images"],
        answer: 0,
        why: "Fargate does not offer GPUs, so GPU workloads use EC2 capacity.",
      },
      {
        q: "Fargate tasks in private subnets fail with \"CannotPullContainerError\". There is no NAT gateway. What fixes it?",
        options: ["A bigger task size", "Public IPs on the ALB", "A new task role", "VPC endpoints for ECR api, ECR dkr and S3"],
        answer: 3,
        why: "Tasks need a private path to ECR and to S3, where image layers are stored.",
      },
      {
        q: "What prevents someone from pushing different content under an existing tag such as 1.4 in ECR?",
        options: ["Lifecycle policies", "Tag immutability", "Enhanced scanning", "Replication"],
        answer: 1,
        why: "Immutable tags cannot be overwritten, so a tag always points to the same image.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a lifecycle policy to the ECR repository web that keeps only the 10 most recent images.",
        hint: "Use countType imageCountMoreThan with action expire.",
        solution: "cat > keep10.json <<'EOF'\n{\"rules\":[{\"rulePriority\":1,\"description\":\"keep last 10\",\n  \"selection\":{\"tagStatus\":\"any\",\"countType\":\"imageCountMoreThan\",\"countNumber\":10},\n  \"action\":{\"type\":\"expire\"}}]}\nEOF\naws ecr put-lifecycle-policy --repository-name web \\\n  --lifecycle-policy-text file://keep10.json",
      },
      {
        level: "medium",
        task: "Register the web task definition and run it as a Fargate service with 2 tasks in two private subnets.",
        hint: "awsvpcConfiguration takes subnets, security groups and assignPublicIp.",
        solution: "aws ecs create-cluster --cluster-name demo\naws ecs register-task-definition --cli-input-json file://web.json\naws ecs create-service --cluster demo --service-name web \\\n  --task-definition web --desired-count 2 --launch-type FARGATE \\\n  --network-configuration \"awsvpcConfiguration={subnets=[$PRIV_A,$PRIV_B],securityGroups=[$APP_SG],assignPublicIp=DISABLED}\" \\\n  --load-balancers targetGroupArn=$TG_ARN,containerName=web,containerPort=8080\naws ecs describe-services --cluster demo --services web \\\n  --query \"services[0].[runningCount,events[0].message]\"",
      },
      {
        level: "hard",
        task: "Run the web service with 2 tasks always on regular Fargate and extra tasks split 1:3 between Fargate and Fargate Spot.",
        hint: "Attach both capacity providers to the cluster, then use a capacity provider strategy with base and weight.",
        solution: "aws ecs put-cluster-capacity-providers --cluster demo \\\n  --capacity-providers FARGATE FARGATE_SPOT \\\n  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1\naws ecs create-service --cluster demo --service-name web-mixed \\\n  --task-definition web --desired-count 6 \\\n  --capacity-provider-strategy capacityProvider=FARGATE,base=2,weight=1 \\\n    capacityProvider=FARGATE_SPOT,weight=3 \\\n  --network-configuration \"awsvpcConfiguration={subnets=[$PRIV_A,$PRIV_B],securityGroups=[$APP_SG]}\"\n# 6 tasks: 2 base on FARGATE, remaining 4 split 1:3, so 3 FARGATE, 3 FARGATE_SPOT.",
      },
    ],
    faq: [
      { q: "Is Fargate more expensive than EC2?", a: "Per vCPU-hour, usually yes. But you pay only for task size while it runs and skip idle capacity and server management, so for small or spiky workloads it is often cheaper overall." },
      { q: "Can I move from ECS to EKS later?", a: "Yes, since both run standard container images, but you must rewrite task definitions as Kubernetes manifests and change deployment tooling." },
      { q: "Do I need ECR, or can I use Docker Hub?", a: "ECS and EKS can pull from any registry, but ECR integrates with IAM, VPC endpoints and Inspector scanning, and avoids public registry rate limits." },
      { q: "What is ECS Anywhere or EKS Anywhere?", a: "They let you run ECS tasks or EKS clusters on your own servers on premises, managed with the same AWS tools." },
    ],
  },

  "aws-compute/serverless": {
    plain: [
      "Serverless means you write code and AWS runs it, without you creating or looking after servers. With AWS Lambda, you upload a function, choose what should trigger it, and AWS starts as many copies as needed. When nothing is happening, nothing runs and you pay nothing.",
      "Lambda functions are triggered by events. An event can be an HTTP request through API Gateway, a file landing in S3, a message in an SQS queue, or a schedule such as every night at 2 am. The function gets the event as input, does its work, and returns.",
      "Amazon API Gateway is the front door for serverless web APIs. It receives HTTPS requests, checks who is calling, limits how fast they can call, and passes the request to Lambda. Lambda then talks to a database such as DynamoDB, and the answer flows back.",
      "Lambda has limits you must know: a single run can last at most 15 minutes, memory is capped, and by default an account can run 1,000 copies at once per Region. Long jobs, very heavy compute or apps needing a constantly open connection usually belong on containers instead.",
    ],
    deepDive: [
      {
        heading: "How Lambda runs your code",
        body: "Each function copy runs in an execution environment, a lightweight microVM. On the first request, Lambda creates one: it downloads your code, starts the runtime, and runs everything outside your handler, such as imports and SDK client setup. This init phase is the cold start. Then it calls your handler with the event.\n\nAfter the response, the environment is frozen and kept for a while. The next request can reuse it, skipping init: a warm start. Anything created outside the handler, such as database connections, and files in /tmp survive between warm invocations, so create clients once, outside the handler.\n\nEach environment handles one request at a time. If ten requests arrive at once, Lambda runs ten environments. That number is concurrency, and it is roughly requests per second times average duration in seconds. Environments are eventually shut down, so never rely on local state.",
        visual: {
          type: "cycle",
          title: "Life of an execution environment",
          steps: [
            { label: "Init", detail: "Load code and runtime, run setup code." },
            { label: "Invoke", detail: "Handler processes one event." },
            { label: "Freeze", detail: "Paused between requests." },
            { label: "Thaw and reuse", detail: "Warm start, setup skipped." },
            { label: "Shutdown", detail: "Removed after idle time or update." },
          ],
        },
      },
      {
        heading: "Three ways Lambda is invoked",
        body: "Synchronous invocation: the caller waits for the result. API Gateway, Application Load Balancers, function URLs and direct SDK calls work this way. Errors go straight back to the caller, who must decide whether to retry.\n\nAsynchronous invocation: the caller hands over the event and moves on. S3, SNS and EventBridge use this. Lambda puts the event in an internal queue, retries failed runs twice by default, and keeps events for up to six hours. Configure an on-failure destination or a dead-letter queue so failed events are not silently lost.\n\nEvent source mapping: Lambda itself polls a source and invokes your function with batches. This is used for SQS, Kinesis Data Streams, DynamoDB Streams and Kafka. Batch size, batching window and error handling are set on the mapping. For SQS, a failed batch returns to the queue after the visibility timeout; for streams, failures block that shard until they succeed or expire, unless you configure bisecting or a failure destination.",
        visual: {
          type: "compare",
          title: "Invocation models",
          columns: [
            { title: "Synchronous", points: ["Caller waits for result", "API Gateway, ALB, function URL", "Caller handles retries", "Errors returned directly"] },
            { title: "Asynchronous", points: ["Fire and forget", "S3, SNS, EventBridge", "2 retries by default", "Destinations or DLQ for failures"] },
            { title: "Event source mapping", points: ["Lambda polls the source", "SQS, Kinesis, DynamoDB Streams", "Batches of records", "Retry rules per source"] },
          ],
        },
      },
      {
        heading: "Limits and concurrency controls",
        body: "The key limits: timeout up to 900 seconds (15 minutes); memory from 128 MB to 10,240 MB, with CPU added in proportion (about one full vCPU at 1,769 MB); /tmp storage from 512 MB to 10,240 MB; a 50 MB zipped upload or 250 MB unzipped including up to five layers; container images up to 10 GB; environment variables up to 4 KB; synchronous request and response payloads up to 6 MB.\n\nEach Region starts with 1,000 concurrent executions shared by all functions in the account, which you can ask to raise. Each function can scale up by 1,000 concurrent executions every 10 seconds. Reserved concurrency sets aside capacity for one function and also caps it, which protects a database from too many connections; setting it to 0 stops the function. Provisioned concurrency keeps environments initialized for no cold starts, at an extra cost. SnapStart, for Java, Python and .NET, restores a snapshot of an initialized environment to cut cold starts cheaply.",
        bullets: ["Max timeout 15 minutes", "Memory 128 MB to 10,240 MB; CPU scales with it", "1,000 concurrent executions per Region by default", "Reserved concurrency: guarantee and cap", "Provisioned concurrency: no cold starts, extra cost"],
      },
      {
        heading: "API Gateway choices",
        body: "API Gateway has three API types. REST APIs have the most features: API keys and usage plans for selling or metering access, request validation, response caching, AWS WAF integration, private APIs reachable only from a VPC, and edge-optimized endpoints. HTTP APIs are simpler, cheaper and faster, with native JWT authorizers for OIDC providers such as Cognito, but fewer features. WebSocket APIs keep a two-way connection open for chat or live dashboards.\n\nAuthorization options include IAM (signed requests), Cognito user pools, JWT authorizers on HTTP APIs, and Lambda authorizers for custom logic. Throttling defaults to 10,000 requests per second per account per Region with a burst of 5,000, and you can set lower limits per stage, route or client.\n\nThe integration timeout is 29 seconds by default for REST APIs and 30 seconds for HTTP APIs. Anything longer should become asynchronous: accept the request, put work on a queue, and let the client check for the result.",
        visual: {
          type: "compare",
          title: "REST API vs HTTP API",
          columns: [
            { title: "REST API", points: ["Usage plans and API keys", "Request validation and caching", "WAF and private endpoints", "Higher price per request"] },
            { title: "HTTP API", points: ["Lower cost and latency", "Native JWT authorizers", "Simpler setup", "Fewer features"] },
          ],
        },
      },
      {
        heading: "Event-driven patterns that work",
        body: "Put a queue between producers and Lambda when traffic is bursty or downstream systems are fragile. SQS absorbs spikes, and Lambda drains it at a controlled rate. Set the queue's visibility timeout to at least six times the function timeout, configure a dead-letter queue with a maxReceiveCount, and return partial batch failures so one bad message does not force the whole batch to retry.\n\nDesign for at-least-once delivery. S3 events, SQS and SNS can deliver the same event twice, so make handlers idempotent: processing an event twice must give the same result, for example by using a conditional write keyed on the event ID.\n\nAvoid recursive loops, such as a function that writes into the same bucket and prefix that triggers it. Use separate buckets or prefixes. For workflows longer than 15 minutes or with many steps, use Step Functions to orchestrate. For relational databases, use RDS Proxy so thousands of function copies share a small pool of connections.",
        visual: {
          type: "tree",
          title: "Common serverless patterns",
          root: "Serverless patterns",
          children: [
            { label: "API backend", children: ["API Gateway", "Lambda", "DynamoDB"] },
            { label: "File processing", children: ["S3 event", "SQS buffer", "Lambda batch"] },
            { label: "Fan-out", children: ["SNS topic", "Several SQS queues", "One function each"] },
            { label: "Scheduled job", children: ["EventBridge Scheduler", "Lambda"] },
            { label: "Long workflow", children: ["Step Functions", "Lambda per step", "Retries and waits"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "A production serverless API stack",
        layers: [
          { label: "Route 53 and CloudFront", detail: "Custom domain, TLS and caching at the edge." },
          { label: "API Gateway", detail: "Auth, throttling, validation, routing." },
          { label: "Lambda", detail: "Business logic, one function per route or domain." },
          { label: "Data and messaging", detail: "DynamoDB, S3, SQS, EventBridge." },
          { label: "Observability", detail: "CloudWatch Logs, metrics, alarms, X-Ray traces." },
        ],
      },
    ],
    examples: [
      {
        title: "SQS worker with partial batch failures",
        explanation: "Orders arrive on an SQS queue and a Lambda function processes them in batches of 10. Step 1: create the event source mapping with --batch-size 10 and --function-response-types ReportBatchItemFailures. Step 2: in the handler, process each record separately and collect the message IDs that fail. Step 3: return them in batchItemFailures; Lambda deletes the successful messages and only the failed ones become visible again. Step 4: after maxReceiveCount attempts, SQS moves a poison message to the dead-letter queue, where an alarm alerts the team.",
        code: {
          lang: "python",
          code: "import json\n\ndef process(order):\n    if \"id\" not in order:\n        raise ValueError(\"missing id\")\n    # write to DynamoDB with a condition on order id (idempotent)\n\ndef handler(event, context):\n    failures = []\n    for record in event[\"Records\"]:\n        try:\n            process(json.loads(record[\"body\"]))\n        except Exception:\n            failures.append({\"itemIdentifier\": record[\"messageId\"]})\n    return {\"batchItemFailures\": failures}",
        },
      },
      {
        title: "Will Lambda's concurrency be enough?",
        explanation: "An API handles 500 requests per second normally, each taking 200 ms. Step 1: concurrency is 500 times 0.2, so about 100 environments, far below the 1,000 default. Step 2: on sale days, traffic reaches 3,000 requests per second and a slower database pushes duration to 400 ms: 3,000 times 0.4 is 1,200, above the default quota, so some requests would be throttled. Step 3: request a quota increase well before the sale. Step 4: give the checkout function reserved concurrency so other functions cannot starve it. Step 5: put RDS Proxy in front of the database, since 1,200 direct connections would overwhelm it, and add provisioned concurrency for the checkout path to avoid cold starts at peak.",
      },
    ],
    cheatSheet: [
      "Timeout max 15 minutes; memory 128 MB to 10,240 MB; /tmp up to 10,240 MB",
      "Package: 50 MB zipped upload, 250 MB unzipped with layers; images up to 10 GB",
      "Concurrency is about requests per second times average duration in seconds",
      "Default 1,000 concurrent executions per Region; each function scales 1,000 per 10 s",
      "Async invokes retry twice by default; add an on-failure destination or DLQ",
      "SQS visibility timeout should be at least 6 times the function timeout",
      "API Gateway default integration timeout: 29 s for REST, 30 s for HTTP APIs",
      "Many functions hitting a relational database: use RDS Proxy",
    ],
    quiz: [
      {
        q: "Which trigger invokes Lambda asynchronously?",
        options: ["API Gateway", "Application Load Balancer", "An SQS event source mapping", "An S3 ObjectCreated notification"],
        answer: 3,
        why: "S3 event notifications use asynchronous invocation, with Lambda's built-in retries.",
      },
      {
        q: "A function needs more CPU for image resizing. What do you change?",
        options: ["Increase the memory setting", "Increase the timeout", "Add a layer", "Enable provisioned concurrency"],
        answer: 0,
        why: "Lambda allocates CPU in proportion to the memory you configure.",
      },
      {
        q: "A reporting function opens too many connections to a small RDS database during bursts. What is the simplest cap on its scaling?",
        options: ["Provisioned concurrency", "A longer timeout", "Reserved concurrency set to a small number", "A larger memory size"],
        answer: 2,
        why: "Reserved concurrency limits how many copies of that function can run at once.",
      },
      {
        q: "A latency-sensitive API suffers from cold starts at 9 am every day. What removes them most directly?",
        options: ["A bigger /tmp size", "Provisioned concurrency on the function alias", "An SQS queue in front", "Asynchronous invocation"],
        answer: 1,
        why: "Provisioned concurrency keeps environments initialized and ready before requests arrive.",
      },
      {
        q: "An API must offer API keys with per-customer request quotas. Which API Gateway type supports this?",
        options: ["HTTP API", "WebSocket API", "Lambda function URL", "REST API with usage plans"],
        answer: 3,
        why: "Usage plans and API keys are features of REST APIs.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Deploy a Python function called hello from a zip file and invoke it with a small JSON payload.",
        hint: "The role needs the AWSLambdaBasicExecutionRole policy; use --cli-binary-format for raw JSON payloads.",
        solution: "zip app.zip app.py   # app.py defines handler(event, context)\naws lambda create-function --function-name hello \\\n  --runtime python3.13 --handler app.handler \\\n  --zip-file fileb://app.zip \\\n  --role arn:aws:iam::123456789012:role/lambda-basic\naws lambda invoke --function-name hello \\\n  --payload '{\"name\":\"Ana\"}' --cli-binary-format raw-in-base64-out out.json\ncat out.json",
      },
      {
        level: "medium",
        task: "Put an HTTP API in front of the hello function and call it with curl.",
        hint: "Quick create with --target, then allow API Gateway to invoke the function.",
        solution: "API_ID=$(aws apigatewayv2 create-api --name hello-api --protocol-type HTTP \\\n  --target arn:aws:lambda:us-east-1:123456789012:function:hello \\\n  --query ApiId --output text)\naws lambda add-permission --function-name hello --statement-id apigw \\\n  --action lambda:InvokeFunction --principal apigateway.amazonaws.com \\\n  --source-arn \"arn:aws:execute-api:us-east-1:123456789012:$API_ID/*\"\ncurl \"https://$API_ID.execute-api.us-east-1.amazonaws.com/\"",
      },
      {
        level: "hard",
        task: "Cap a batch function called report at 5 concurrent runs, and keep 20 warm environments for the live alias of a function called api.",
        hint: "Reserved concurrency is set on the function; provisioned concurrency on a version or alias.",
        solution: "aws lambda put-function-concurrency --function-name report \\\n  --reserved-concurrent-executions 5\n\naws lambda publish-version --function-name api\naws lambda create-alias --function-name api --name live --function-version 1\naws lambda put-provisioned-concurrency-config --function-name api \\\n  --qualifier live --provisioned-concurrent-executions 20\naws lambda get-provisioned-concurrency-config --function-name api --qualifier live\n# Status becomes READY when the 20 environments are initialized.",
      },
    ],
    faq: [
      { q: "How much does Lambda cost?", a: "You pay per request and per GB-second of run time. The free tier includes 1 million requests and 400,000 GB-seconds per month, which covers many small apps." },
      { q: "Can Lambda functions access resources in my VPC?", a: "Yes. Attach the function to private subnets and security groups. It can then reach RDS or ElastiCache, but needs a NAT gateway or VPC endpoints to reach the internet or AWS APIs." },
      { q: "How long is a cold start?", a: "It depends on runtime, package size and setup code, often from about a hundred milliseconds to a few seconds. Smaller packages, lighter setup, SnapStart or provisioned concurrency reduce it." },
      { q: "When should I not use Lambda?", a: "For jobs over 15 minutes, steady high-throughput workloads where containers are cheaper, apps needing GPUs, or software that needs a long-lived server process." },
    ],
  },
};

export default extra;
