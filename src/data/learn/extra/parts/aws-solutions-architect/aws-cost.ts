import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-cost/pricing-models": {
    plain: [
      "The same EC2 instance can cost very different amounts depending on how you buy it. On-Demand is like a taxi: no commitment, pay for what you use, highest price per hour. Savings Plans and Reserved Instances are like a yearly train pass: you promise to use a certain amount and get a big discount.",
      "Spot Instances are AWS's spare capacity sold at up to 90 percent off. The catch: AWS can take them back when it needs the capacity, with a two-minute warning. That is fine for work that can stop and restart, like batch jobs, tests and rendering, and dangerous for a single database.",
      "Most real workloads mix all three. Look at your usage over a month: the part that never goes away (the baseline) suits a commitment, the daily peaks suit On-Demand, and the flexible background jobs suit Spot. Matching each slice to the right option is where the savings come from.",
      "Commitments last 1 or 3 years and cannot be cancelled, so only commit to what you are confident you will keep using. Starting small and adding more commitment every few months is safer than buying everything at once.",
    ],
    deepDive: [
      {
        heading: "How Savings Plans really work",
        body: "A Savings Plan is a promise to spend a fixed amount per hour, for example 10 dollars an hour, on compute for 1 or 3 years. Every hour, AWS applies that amount to your eligible usage at the discounted rates. Usage above the commitment is billed On-Demand. Commitment you don't use in an hour is lost; it does not roll over.\n\nCompute Savings Plans (up to 66 percent off) apply to EC2 in any family, size, Region and operating system, plus Fargate and Lambda, so they survive migrations and modernisation. EC2 Instance Savings Plans (up to 72 percent off) lock you to one instance family in one Region, such as m7g in eu-west-1, but any size and OS within it. You can pay all upfront, partially upfront or nothing upfront; more upfront means a slightly bigger discount. Cost Explorer recommends a commitment based on your past usage.",
        bullets: [
          "Unused commitment in an hour is lost",
          "Compute SP: any family, Region, Fargate and Lambda, up to 66 percent",
          "EC2 Instance SP: one family in one Region, up to 72 percent",
          "In AWS Organizations, discounts are shared across accounts by default",
        ],
      },
      {
        heading: "Reserved Instances: where they still matter",
        body: "For EC2, AWS now recommends Savings Plans over Reserved Instances (RIs), because they give similar discounts with more flexibility. RIs still matter in two ways. First, a zonal RI, bought for one AZ, also reserves capacity there. Second, many other services use reservations rather than Savings Plans: RDS, ElastiCache, OpenSearch and Redshift reserved nodes, and DynamoDB reserved capacity.\n\nStandard RIs give up to 72 percent off and can be sold on the RI Marketplace if plans change. Convertible RIs give up to 66 percent off and can be exchanged for other families or operating systems. A Regional RI for Linux has size flexibility within its family: one large reservation can cover two medium instances, using normalisation factors (medium is 2, large is 4, xlarge is 8).",
      },
      {
        heading: "Spot: interruptions and how to live with them",
        body: "Spot prices move slowly with long-term supply and demand; there is no bidding war. You pay the current Spot price, and you can set a maximum price, which defaults to the On-Demand price. When AWS needs the capacity back, it sends an interruption notice two minutes ahead, visible in instance metadata and as an EventBridge event. A rebalance recommendation may arrive earlier, when the risk is rising.\n\nThe key to Spot is diversity. Allow many instance types and sizes across all AZs, and use the price-capacity-optimized allocation strategy, which picks pools that are cheap and least likely to be interrupted. Design the app to save progress (checkpoints), drain work on the notice, and be stateless behind a load balancer. Interruption behaviour can be terminate (the default), stop or hibernate.",
        visual: {
          type: "sequence",
          title: "Handling a Spot interruption",
          actors: ["EC2 Spot", "Instance", "Load balancer", "Auto Scaling"],
          messages: [
            { from: 0, to: 1, label: "Rebalance recommendation (risk rising)" },
            { from: 3, to: 3, label: "Capacity Rebalancing launches a replacement" },
            { from: 0, to: 1, label: "Interruption notice: 2 minutes" },
            { from: 1, to: 2, label: "Deregister, finish in-flight requests" },
            { from: 1, to: 1, label: "Checkpoint job state to S3" },
            { from: 0, to: 1, label: "Instance reclaimed" },
          ],
        },
      },
      {
        heading: "Capacity versus discount",
        body: "Discounts and capacity are separate things. A Savings Plan lowers the price but does not promise that an instance will be available in a busy AZ. When you must be sure capacity exists, for example for a big launch or for DR, use On-Demand Capacity Reservations. They reserve instances in one AZ for any length of time, are billed at On-Demand rates whether you use them or not, and can be combined with a Savings Plan or Regional RI to get the discount too. For GPU work, Capacity Blocks for ML reserve accelerated instances for a set future window.\n\nDedicated Hosts give you a whole physical server and visibility of its sockets and cores, which some software licences (bring your own licence) require. Dedicated Instances only guarantee that your instances do not share hardware with other customers. Both cost more and are usually a compliance or licensing choice, not a savings choice.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Layering purchase options on one workload",
        layers: [
          { label: "Spot", detail: "Batch, CI and extra stateless capacity" },
          { label: "On-Demand", detail: "Daily peaks above the baseline" },
          { label: "Savings Plan", detail: "The baseline that runs 24/7" },
          { label: "Capacity Reservation", detail: "Only where capacity must be guaranteed" },
        ],
      },
      {
        type: "tree",
        title: "Pick a purchase option",
        root: "Workload pattern",
        children: [
          { label: "Steady 24/7 for a year or more", children: ["Compute Savings Plan", "EC2 Instance SP if the family is fixed"] },
          { label: "Short-term, spiky or unknown", children: ["On-Demand"] },
          { label: "Can stop and restart", children: ["Spot with many instance types"] },
          { label: "Must be sure capacity exists", children: ["On-Demand Capacity Reservation"] },
          { label: "Licence tied to physical cores", children: ["Dedicated Host"] },
        ],
      },
    ],
    examples: [
      {
        title: "Buying for a web tier with a daily peak",
        explanation: "A web tier runs at least 10 m7g.large instances all day and climbs to 30 during business hours. Step 1: cover the 10-instance baseline with a 1-year Compute Savings Plan sized to its hourly cost, so it keeps working if the team later moves to Fargate. Step 2: let the Auto Scaling group add On-Demand instances for the daily peak. Step 3: move the nightly report jobs to Spot. Step 4: review Savings Plan utilisation monthly in Cost Explorer; if it stays near 100 percent and the baseline grew, buy a second, smaller plan.",
      },
      {
        title: "A mixed Spot and On-Demand Auto Scaling group",
        explanation: "A stateless API should run mostly on Spot but always keep two On-Demand instances. Step 1: create a mixed instances policy with a base of 2 On-Demand instances and 25 percent On-Demand above that. Step 2: list several similar instance types so Spot can use more capacity pools. Step 3: choose price-capacity-optimized and enable Capacity Rebalancing, so replacements start when AWS signals higher risk.",
        code: {
          lang: "json",
          code: "{\n  \"LaunchTemplate\": {\n    \"LaunchTemplateSpecification\": {\"LaunchTemplateName\": \"api\", \"Version\": \"$Latest\"},\n    \"Overrides\": [{\"InstanceType\": \"m7g.large\"}, {\"InstanceType\": \"m6g.large\"},\n                  {\"InstanceType\": \"c7g.xlarge\"}, {\"InstanceType\": \"r7g.large\"}]\n  },\n  \"InstancesDistribution\": {\n    \"OnDemandBaseCapacity\": 2,\n    \"OnDemandPercentageAboveBaseCapacity\": 25,\n    \"SpotAllocationStrategy\": \"price-capacity-optimized\"\n  }\n}",
        },
      },
    ],
    cheatSheet: [
      "On-Demand: no commitment; most Linux instances bill per second with a 60-second minimum",
      "Compute Savings Plan: up to 66 percent off, covers EC2, Fargate and Lambda anywhere",
      "EC2 Instance Savings Plan and Standard RI: up to 72 percent off, less flexible",
      "Spot: up to 90 percent off, 2-minute interruption notice, diversify instance types",
      "Unused Savings Plan commitment in an hour is lost, so size it to the steady baseline",
      "Capacity Reservations guarantee capacity in an AZ; Savings Plans only lower the price",
      "RDS, ElastiCache, OpenSearch and Redshift discounts come from reserved instances or nodes",
      "Dedicated Host: whole server with visible cores, for per-core software licences",
    ],
    quiz: [
      {
        q: "A company will move workloads from EC2 to Fargate and Lambda over the next year. Which commitment keeps its discount?",
        options: ["EC2 Instance Savings Plan", "Standard Reserved Instances", "Compute Savings Plan", "Zonal Reserved Instances"],
        answer: 2,
        why: "Compute Savings Plans apply across EC2, Fargate and Lambda.",
      },
      {
        q: "A team bought a Savings Plan of 20 dollars per hour, but in quiet hours uses only 12 dollars of eligible compute. What happens?",
        options: ["The unused 8 dollars that hour is lost", "The 8 dollars rolls over to the next hour", "AWS refunds the difference monthly", "The plan pauses automatically"],
        answer: 0,
        why: "Savings Plans are an hourly commitment, and unused commitment does not carry over.",
      },
      {
        q: "What is the best way to reduce Spot interruptions for a fleet?",
        options: ["Use one instance type in one AZ", "Set a very high maximum price", "Turn off Capacity Rebalancing", "Allow many instance types across all AZs with price-capacity-optimized"],
        answer: 3,
        why: "Diversifying across capacity pools lets the fleet avoid pools that are about to be reclaimed.",
      },
      {
        q: "A launch event needs a guarantee that 50 instances can start in one AZ next week. What do you buy?",
        options: ["A Compute Savings Plan", "An On-Demand Capacity Reservation", "Spot Instances", "Convertible Reserved Instances in the Region"],
        answer: 1,
        why: "Capacity Reservations hold capacity in a specific AZ; Savings Plans and Regional RIs do not.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A workload uses 40 instances at night and 100 during the day, every day. Say which purchase option covers which part, and why.",
        hint: "Separate the part that never goes away from the part that comes and goes.",
        solution: "Baseline of 40 instances, 24/7: Savings Plan (or RIs), because\nit runs every hour and the commitment is always used.\nDaily extra 60 instances: On-Demand through Auto Scaling, or Spot if the\napp is stateless and can handle interruptions.\nDon't commit for 100: the extra 60 would leave commitment unused at night.",
      },
      {
        level: "medium",
        task: "Use the AWS CLI to get a Savings Plans purchase recommendation from Cost Explorer for a 1-year, no-upfront Compute Savings Plan based on the last 30 days.",
        hint: "The command is under aws ce and needs the plan type, term, payment option and lookback period.",
        solution: "aws ce get-savings-plans-purchase-recommendation \\\n  --savings-plans-type COMPUTE_SP \\\n  --term-in-years ONE_YEAR \\\n  --payment-option NO_UPFRONT \\\n  --lookback-period-in-days THIRTY_DAYS \\\n  --query 'SavingsPlansPurchaseRecommendation.SavingsPlansPurchaseRecommendationSummary'\n# Look at HourlyCommitmentToPurchase and EstimatedSavingsPercentage",
      },
      {
        level: "hard",
        task: "Write a small script that runs on a Spot instance, checks the instance metadata for an interruption notice every 5 seconds, and runs a drain command when one appears.",
        hint: "Use IMDSv2: get a token with PUT, then GET /latest/meta-data/spot/instance-action. It returns 404 until a notice exists.",
        solution: "#!/bin/bash\nwhile true; do\n  TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token \\\n    -H 'X-aws-ec2-metadata-token-ttl-seconds: 60')\n  CODE=$(curl -s -o /tmp/action -w '%{http_code}' -H \"X-aws-ec2-metadata-token: $TOKEN\" \\\n    http://169.254.169.254/latest/meta-data/spot/instance-action)\n  if [ \"$CODE\" = \"200\" ]; then\n    echo \"Interruption: $(cat /tmp/action)\"; /opt/app/drain.sh; exit 0\n  fi\n  sleep 5\ndone",
      },
    ],
    faq: [
      { q: "Should I buy Savings Plans or Reserved Instances for EC2?", a: "For EC2, Savings Plans are usually the better choice because they give similar discounts with more flexibility. Buy RIs mainly for services that don't support Savings Plans, or zonal RIs when you also want reserved capacity." },
      { q: "Can I cancel a Savings Plan or Reserved Instance?", a: "No, they are commitments for the full term. Standard RIs can be sold on the RI Marketplace and Convertible RIs can be exchanged, but Savings Plans cannot be resold." },
      { q: "Is Spot safe for production?", a: "Yes for stateless, fault-tolerant parts such as web servers behind a load balancer, containers and batch jobs, as long as you diversify instance types and handle the two-minute notice. Not for single instances that hold important state." },
      { q: "Do Savings Plans cover RDS?", a: "Compute Savings Plans cover EC2, Fargate and Lambda. Databases like RDS and ElastiCache have traditionally used reserved instances instead, so check the current pricing page for what applies to your database." },
    ],
  },

  "aws-cost/cost-tools": {
    plain: [
      "The AWS bill can grow quietly: a forgotten test server, a NAT gateway moving more data than expected, logs nobody deletes. Cost tools help you see where the money goes, who is spending it, and get a warning before a small mistake becomes a big invoice.",
      "Cost Explorer is the map. It shows spend by service, account, Region or tag over time, with charts and a forecast. Budgets is the alarm: you set a limit, and AWS emails you or takes an action when actual or forecast spend crosses it. Cost Anomaly Detection watches for unusual jumps you did not plan for.",
      "Tags are labels like team=payments or env=dev that you put on resources. Once you activate them as cost allocation tags, the bill can be split by those labels. That turns one big number into a clear answer to which team, product or environment spent what.",
      "Compute Optimizer looks at how hard your instances, volumes and functions actually work, and suggests smaller or cheaper options. Paying for a large server that runs at 5 percent CPU is one of the most common and easiest wastes to fix.",
    ],
    deepDive: [
      {
        heading: "Getting answers from Cost Explorer",
        body: "Cost Explorer shows the last 13 months of cost and usage at daily or monthly granularity, plus a forecast. Hourly granularity is available for an extra fee. Data refreshes at least once a day, so it is not real time. Group by service first, then filter the biggest service and group by usage type, which is where surprises show up: DataTransfer-Out-Bytes, NatGateway-Bytes, or TimedStorage-ByteHrs.\n\nPick the right cost view. Unblended cost is what you were charged that day; amortized cost spreads upfront Savings Plan and RI payments over the term, which gives a fair daily picture when commitments are involved. Cost Explorer also has Savings Plans and RI reports: utilisation (how much of the commitment you used) and coverage (how much of your usage is covered). Low utilisation means you over-bought; low coverage means you may be able to commit more.",
        bullets: [
          "Group by service, then by usage type, to find surprises",
          "Amortized cost spreads upfront payments over the term",
          "Utilisation low: over-committed. Coverage low: room to commit more",
          "The Cost Explorer API costs 0.01 dollars per request",
        ],
      },
      {
        heading: "Budgets, actions and anomaly detection",
        body: "AWS Budgets tracks cost, usage, or Savings Plan and RI utilisation and coverage, for a month, quarter or year. Each budget can have alerts at thresholds of actual or forecast spend, for example 80 percent forecast and 100 percent actual, sent to email addresses or an SNS topic. Billing data updates several times a day, so alerts arrive within hours, not seconds.\n\nBudget actions go further: when a threshold is crossed, AWS can apply an IAM policy or an SCP that blocks launching new resources, or stop specific EC2 or RDS instances, either automatically or after someone approves. This is a good guardrail for sandbox accounts. Cost Anomaly Detection uses machine learning to learn normal spend per service, account or tag and alerts on unusual increases, which catches problems that a fixed monthly budget would only show at month end.",
        visual: {
          type: "flow",
          title: "A sandbox account guardrail",
          steps: [
            { label: "Budget 200 USD", detail: "Monthly cost budget on the account" },
            { label: "80 percent forecast", detail: "Email the account owner" },
            { label: "100 percent actual", detail: "Alert the platform team via SNS" },
            { label: "Budget action", detail: "Apply an SCP that denies new launches" },
            { label: "Review", detail: "Clean up, then remove the SCP" },
          ],
        },
      },
      {
        heading: "Tagging that actually works",
        body: "User-defined tags only appear in billing after you activate them as cost allocation tags in the Billing console of the management (payer) account, and it can take up to 24 hours. Tags show up in cost data only from the point they are active and present on the resource, so start early. AWS-generated tags such as aws:createdBy must be activated too.\n\nKeep a short, fixed list of keys, such as team, env and cost-center, with agreed values. Tag policies in AWS Organizations enforce allowed keys and values, and an SCP can deny creating resources without a required tag using the aws:RequestTag condition key. Some costs cannot be tagged at all, such as some data transfer and support charges, so use Cost Categories to group costs by account, tag or service with rules. For shared clusters, split cost allocation data divides ECS and EKS costs between the tasks and pods that used them.",
        visual: {
          type: "cycle",
          title: "From tag to team report",
          steps: [
            { label: "Define keys", detail: "team, env, cost-center" },
            { label: "Enforce", detail: "Tag policies and SCPs with aws:RequestTag" },
            { label: "Activate", detail: "Cost allocation tags in the payer account" },
            { label: "Report", detail: "Group by tag in Cost Explorer" },
            { label: "Find untagged spend", detail: "Fix the resources, tighten the rules" },
          ],
        },
      },
      {
        heading: "Right-sizing with Compute Optimizer and friends",
        body: "Compute Optimizer is free to turn on (opt in per account or for the whole organization). It analyses CloudWatch metrics from the last 14 days by default, or up to about 3 months with the paid enhanced infrastructure metrics option, and labels resources as over-provisioned, under-provisioned or optimized. It covers EC2 instances, Auto Scaling groups, EBS volumes, Lambda functions, ECS services on Fargate, RDS databases and some commercial licences, and often suggests Graviton types.\n\nMemory matters: without the CloudWatch agent, Compute Optimizer cannot see memory use, so its EC2 advice is less reliable. Cost Optimization Hub collects recommendations from several tools into one list, ranked by estimated savings. Trusted Advisor adds checks like idle load balancers, unattached Elastic IPs and low-use instances; the full set of checks needs a Business or higher support plan. For the most detailed data, the Cost and Usage Report (via Data Exports) lands in S3 and can be queried with Athena.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which cost tool for which job?",
        columns: [
          { title: "See and explain", points: ["Cost Explorer charts and forecast", "Cost and Usage Report in S3", "Cost Categories for grouping"] },
          { title: "Alert and stop", points: ["AWS Budgets alerts", "Budget actions: SCP, IAM, stop instances", "Cost Anomaly Detection"] },
          { title: "Reduce", points: ["Compute Optimizer right-sizing", "Cost Optimization Hub", "Trusted Advisor cost checks", "Savings Plans recommendations"] },
        ],
      },
    ],
    examples: [
      {
        title: "Finding a surprise on the bill",
        explanation: "The monthly bill jumped by 1,500 dollars. Step 1: in Cost Explorer, group by service for the last two months; EC2-Other grew the most. Step 2: filter to EC2-Other and group by usage type; NatGateway-Bytes tripled. Step 3: group by account and tag to find the workload; a new service in a private subnet downloads data from S3 through the NAT gateway. Step 4: add an S3 gateway endpoint, which is free, and set a Cost Anomaly Detection monitor so the next jump alerts within a day.",
        code: {
          lang: "bash",
          code: "aws ce get-cost-and-usage \\\n  --time-period Start=2026-10-01,End=2026-11-01 \\\n  --granularity MONTHLY --metrics UnblendedCost \\\n  --filter '{\"Dimensions\": {\"Key\": \"SERVICE\", \"Values\": [\"EC2 - Other\"]}}' \\\n  --group-by Type=DIMENSION,Key=USAGE_TYPE \\\n  --query 'ResultsByTime[0].Groups[].[Keys[0],Metrics.UnblendedCost.Amount]' --output text",
        },
      },
      {
        title: "Requiring a team tag on new instances",
        explanation: "Finance wants every EC2 instance to carry a team tag. Step 1: activate team as a cost allocation tag. Step 2: attach an SCP to the workload OUs that denies ec2:RunInstances when the request has no team tag. Step 3: add a tag policy listing the allowed team values. New instances without the tag now fail to launch with an explicit deny, and Cost Explorer can group spend by team.",
        code: {
          lang: "json",
          code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"RequireTeamTag\",\n    \"Effect\": \"Deny\",\n    \"Action\": \"ec2:RunInstances\",\n    \"Resource\": \"arn:aws:ec2:*:*:instance/*\",\n    \"Condition\": {\"Null\": {\"aws:RequestTag/team\": \"true\"}}\n  }]\n}",
        },
      },
    ],
    cheatSheet: [
      "Activate tags in Billing (payer account) or they never appear in cost reports",
      "Cost Explorer: 13 months of history plus forecast; data refreshes about daily",
      "Group by service, then by usage type, to find what changed",
      "Budgets alert on actual or forecast spend; actions can apply an SCP or stop instances",
      "Cost Anomaly Detection: ML alerts on unusual spend, catches problems mid-month",
      "Compute Optimizer: opt in; 14 days of metrics by default; install the agent for memory",
      "Require tags with an SCP: Deny when aws:RequestTag/team is Null",
      "Most detailed billing data: Cost and Usage Report via Data Exports, queried with Athena",
    ],
    quiz: [
      {
        q: "A team tagged every resource with project, but Cost Explorer cannot group by project. Why?",
        options: ["Tags only work in the console", "The tag was not activated as a cost allocation tag", "Cost Explorer only groups by service", "Tags take 30 days to appear"],
        answer: 1,
        why: "User-defined tags must be activated in the billing console before they show up in cost data.",
      },
      {
        q: "A sandbox account must automatically block new resource launches when it reaches its monthly limit. What do you use?",
        options: ["A CloudWatch alarm on CPU", "Trusted Advisor", "Compute Optimizer", "An AWS Budgets action that applies an SCP"],
        answer: 3,
        why: "Budget actions can apply an IAM policy or SCP when a threshold is crossed.",
      },
      {
        q: "Compute Optimizer suggests downsizing instances, but the team fears running out of memory. What should they do first?",
        options: ["Install the CloudWatch agent so memory use is included", "Ignore the advice", "Switch to Spot", "Enable detailed monitoring only"],
        answer: 0,
        why: "Without memory metrics the recommendation is based only on CPU, network and disk.",
      },
      {
        q: "Upfront RI payments make one day's cost look huge in Cost Explorer. Which view spreads it fairly?",
        options: ["Unblended cost", "Blended cost", "Amortized cost", "Usage quantity"],
        answer: 2,
        why: "Amortized cost spreads upfront commitment payments across the days of the term.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a monthly cost budget of 50 dollars that emails you at 80 percent of forecast spend.",
        hint: "aws budgets create-budget takes a budget JSON and a notifications-with-subscribers JSON.",
        solution: "aws budgets create-budget --account-id 111122223333 \\\n  --budget '{\"BudgetName\": \"lab-50\", \"BudgetLimit\": {\"Amount\": \"50\", \"Unit\": \"USD\"},\n    \"TimeUnit\": \"MONTHLY\", \"BudgetType\": \"COST\"}' \\\n  --notifications-with-subscribers '[{\"Notification\": {\"NotificationType\": \"FORECASTED\",\n    \"ComparisonOperator\": \"GREATER_THAN\", \"Threshold\": 80, \"ThresholdType\": \"PERCENTAGE\"},\n    \"Subscribers\": [{\"SubscriptionType\": \"EMAIL\", \"Address\": \"you@example.com\"}]}]'",
      },
      {
        level: "medium",
        task: "List last month's cost per value of the team tag using the Cost Explorer CLI.",
        hint: "Group by Type=TAG,Key=team. Untagged spend appears with an empty value after team$.",
        solution: "aws ce get-cost-and-usage \\\n  --time-period Start=2026-10-01,End=2026-11-01 \\\n  --granularity MONTHLY --metrics UnblendedCost \\\n  --group-by Type=TAG,Key=team \\\n  --query 'ResultsByTime[0].Groups[].[Keys[0],Metrics.UnblendedCost.Amount]' --output text\n# team$payments 1234.56\n# team$         310.20   <- untagged spend to chase",
      },
      {
        level: "hard",
        task: "Find waste with the CLI: list unattached EBS volumes and Elastic IPs that are not associated with anything, with their sizes.",
        hint: "Unattached volumes have status available. Unassociated addresses have no AssociationId.",
        solution: "aws ec2 describe-volumes --filters Name=status,Values=available \\\n  --query 'Volumes[].[VolumeId,Size,VolumeType,CreateTime]' --output table\naws ec2 describe-addresses \\\n  --query 'Addresses[?AssociationId==null].[PublicIp,AllocationId]' --output table\n# Snapshot volumes you might need, then delete them:\n# aws ec2 create-snapshot --volume-id vol-... && aws ec2 delete-volume --volume-id vol-...\n# Release unused addresses: aws ec2 release-address --allocation-id eipalloc-...",
      },
    ],
    faq: [
      { q: "Is Cost Explorer free?", a: "Viewing Cost Explorer in the console is free. Requests through its API cost 0.01 dollars each, and hourly granularity data has an extra charge." },
      { q: "Why don't my tags show old costs?", a: "Cost allocation tags only apply to cost data from when they are active and on the resource, and activation can take up to 24 hours. Tag resources and activate keys early." },
      { q: "Can AWS stop my spending automatically?", a: "Not by default. AWS Budgets actions can apply restrictive policies or stop certain EC2 and RDS instances, but running resources such as S3 storage keep costing money until you delete them." },
      { q: "What is the difference between Budgets and Cost Anomaly Detection?", a: "Budgets compare spend with a fixed limit you set. Cost Anomaly Detection learns your normal pattern and flags unusual jumps, even when you are still under budget." },
    ],
  },

  "aws-cost/cost-design": {
    plain: [
      "Discounts make each unit cheaper, but design decides how many units you buy. A smart architecture can cost half as much as a careless one doing the same job. The three big levers are where data is stored, how data moves, and what kind of compute runs your code.",
      "Storage is cheap to start but adds up forever. Data that nobody reads should move to cheaper tiers or be deleted. Old snapshots, old log groups and old object versions are classic silent costs that grow every month without anyone noticing.",
      "Data transfer is the cost people forget. Data coming into AWS from the internet is free, but data going out costs money per GB, and so does traffic between Availability Zones, between Regions, and through a NAT gateway. Where you place things and which path traffic takes can change the bill a lot.",
      "Compute is cheapest when it matches the load. A server that runs all month for a few hundred requests a day wastes money; serverless charges only per request. A busy, steady service can be cheaper on right-sized instances. The best answer depends on the shape of your traffic.",
    ],
    deepDive: [
      {
        heading: "Data transfer: the price map",
        body: "Inbound traffic from the internet is free. Outbound to the internet is charged per GB, with the first 100 GB each month free across services. Traffic between AZs in one Region costs about 0.01 dollars per GB in each direction, so a chatty service talking across AZs pays twice. Traffic between Regions is charged per GB, while traffic inside one AZ over private IPs is free.\n\nNAT gateways charge per hour and per GB processed (0.045 dollars per GB in us-east-1), on top of normal transfer. Gateway endpoints for S3 and DynamoDB are free and remove that NAT charge for those services. Interface endpoints have a much smaller per-GB fee plus an hourly fee. Data from AWS origins such as S3 or an ALB to CloudFront is free, and CloudFront's own internet rates are usually lower than serving directly. Since 2024, every public IPv4 address also costs 0.005 dollars per hour.",
        visual: {
          type: "tree",
          title: "What traffic costs",
          root: "Data transfer",
          children: [
            { label: "Free", children: ["Inbound from the internet", "Same AZ over private IP", "S3 or DynamoDB via gateway endpoint", "AWS origin to CloudFront"] },
            { label: "Small per-GB charge", children: ["Between AZs, each direction", "Interface endpoints"] },
            { label: "Larger per-GB charge", children: ["Out to the internet after 100 GB", "Between Regions", "NAT gateway processing"] },
          ],
        },
      },
      {
        heading: "Storage: tier it, size it, expire it",
        body: "For S3, use lifecycle rules for data with a known age pattern and Intelligent-Tiering when the pattern is unknown, but remember the minimum storage durations and the 128 KB minimum billable size in IA classes. Expire noncurrent versions and abort incomplete multipart uploads, which otherwise stay billed and invisible in normal listings.\n\nFor EBS, gp3 costs about 20 percent less per GB than gp2 and gives a 3,000 IOPS baseline at any size, so migrating is usually a free win. Find volumes in the available state (attached to nothing) and old snapshots; EBS Snapshots Archive is much cheaper for snapshots you must keep for months, with a 90-day minimum. For EFS, lifecycle management moves cold files to Infrequent Access or Archive. Set retention on CloudWatch log groups, which never expire by default.",
        bullets: [
          "S3 lifecycle or Intelligent-Tiering by access pattern",
          "Expire old versions; abort incomplete multipart uploads",
          "gp2 to gp3: about 20 percent cheaper per GB",
          "Delete unattached volumes; archive long-kept snapshots",
          "Set CloudWatch Logs retention",
        ],
      },
      {
        heading: "Serverless or servers: doing the math",
        body: "Lambda charges per request (0.20 dollars per million) and per GB-second of run time (about 0.0000167 dollars on x86 in us-east-1; Arm is about 20 percent cheaper). A function with 512 MB that runs 200 ms uses 0.1 GB-seconds per call. At 3 million calls a month that is 300,000 GB-seconds, about 5 dollars, plus 0.60 dollars for requests, less than a small server that runs all month.\n\nThe picture flips under steady heavy load. At hundreds of requests per second all day, the same work costs more on Lambda than on a few right-sized instances or Fargate tasks with a Savings Plan. Remember the hidden costs on both sides: API Gateway per request (HTTP APIs cost much less than REST APIs), and for servers the load balancer, idle capacity and the people who patch them. Questions that say least operational overhead usually favour serverless or managed services.",
        visual: {
          type: "compare",
          title: "Cost shape by compute model",
          columns: [
            { title: "Lambda", points: ["Zero cost when idle", "Pay per request and GB-second", "Best for low or spiky traffic", "Gets expensive under constant high load"] },
            { title: "Fargate", points: ["Pay per vCPU and GB per second", "No servers to patch", "Good for steady containers", "Fargate Spot for interruptible tasks"] },
            { title: "EC2", points: ["Lowest unit cost at steady high load", "Savings Plans and Spot apply", "You manage OS and scaling", "Idle capacity is wasted money"] },
          ],
        },
      },
      {
        heading: "Small design habits that add up",
        body: "Turn off what nobody uses. Development environments that run only during working hours (about 50 of 168 hours a week) can save around 70 percent with a schedule, for example with EventBridge Scheduler or the Instance Scheduler solution. Graviton instances typically give better price-performance than comparable x86 types for code that runs on Arm.\n\nCache to avoid repeated work: CloudFront in front of S3 and APIs cuts both origin load and transfer cost, and ElastiCache or DAX can let you run a smaller database. Compress and batch data before sending it. Keep chatty services in the same AZ where availability allows, but never remove Multi-AZ from a system that must be highly available just to save the inter-AZ charge; the exam punishes options that break a stated requirement to save money.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Cutting the cost of private instances reading S3",
        steps: [
          { label: "Before", detail: "Private subnet to NAT gateway to S3" },
          { label: "Measure", detail: "NatGateway-Bytes in Cost Explorer" },
          { label: "Add gateway endpoint", detail: "Route table entry for S3, free" },
          { label: "Same AZ for heavy flows", detail: "Avoid cross-AZ hops where possible" },
          { label: "After", detail: "No NAT processing fee for S3 traffic" },
        ],
      },
    ],
    examples: [
      {
        title: "Removing a NAT gateway bill",
        explanation: "Private instances download 10 TB a month from S3 through a NAT gateway. At 0.045 dollars per GB processed, that is about 10,240 GB x 0.045 = 461 dollars a month just in NAT processing. Step 1: create an S3 gateway endpoint and attach it to the private route tables. Step 2: traffic to S3 in the same Region now follows the endpoint route, with no NAT fee and no endpoint fee. Step 3: confirm in Cost Explorer that NatGateway-Bytes dropped. Optionally restrict the bucket to that endpoint with aws:SourceVpce.",
        code: {
          lang: "bash",
          code: "aws ec2 create-vpc-endpoint --vpc-id vpc-0abc1234 \\\n  --vpc-endpoint-type Gateway \\\n  --service-name com.amazonaws.us-east-1.s3 \\\n  --route-table-ids rtb-0priv1a rtb-0priv1b",
        },
      },
      {
        title: "A low-traffic API: server or serverless?",
        explanation: "An internal API gets about 300,000 requests a month, each running 100 ms with 256 MB. Step 1: Lambda compute is 300,000 x 0.1 s x 0.25 GB = 7,500 GB-seconds, about 0.13 dollars, plus about 0.06 dollars for requests. Step 2: an API Gateway HTTP API adds about 0.30 dollars at 1 dollar per million requests. Step 3: compare with even the smallest always-on instance plus a load balancer, which costs tens of dollars a month before patching time. Serverless wins clearly here; revisit the decision if traffic grows to constant high load.",
        code: {
          lang: "python",
          code: "requests = 300_000\ngb_seconds = requests * 0.1 * 0.25          # duration (s) x memory (GB)\nlambda_compute = gb_seconds * 0.0000166667   # x86, us-east-1\nlambda_requests = requests / 1e6 * 0.20\nhttp_api = requests / 1e6 * 1.00\nprint(round(lambda_compute + lambda_requests + http_api, 2))  # about 0.49 dollars",
        },
      },
    ],
    cheatSheet: [
      "Inbound from internet is free; outbound to internet and cross-Region traffic cost per GB",
      "Cross-AZ traffic: about 0.01 USD per GB in each direction",
      "NAT gateway: hourly plus per-GB fee; S3 and DynamoDB gateway endpoints are free",
      "AWS origin to CloudFront transfer is free; CloudFront egress is usually cheaper",
      "Every public IPv4 address costs 0.005 USD per hour",
      "gp3 is about 20 percent cheaper per GB than gp2 with a better baseline",
      "Lambda: 0.20 USD per million requests plus GB-seconds; free when idle",
      "Schedule dev environments off outside working hours to save around 70 percent",
    ],
    quiz: [
      {
        q: "An app in a private subnet sends 5 TB a month to DynamoDB through a NAT gateway. What is the cheapest change?",
        options: ["Add a second NAT gateway", "Use a DynamoDB gateway endpoint", "Move the app to a public subnet with public IPs", "Use an interface endpoint for DynamoDB"],
        answer: 1,
        why: "Gateway endpoints for DynamoDB are free and remove the NAT per-GB processing charge.",
      },
      {
        q: "Which of these data flows is free?",
        options: ["S3 to CloudFront when S3 is the origin", "EC2 to the internet after the first 100 GB", "EC2 in one AZ to EC2 in another AZ", "Traffic through a NAT gateway"],
        answer: 0,
        why: "Transfer from AWS origins to CloudFront is not charged.",
      },
      {
        q: "A service handles a constant 500 requests per second all day, every day. Which is usually cheapest?",
        options: ["Lambda with maximum memory", "API Gateway REST API caching only", "Right-sized EC2 or Fargate covered by a Savings Plan", "Dedicated Hosts"],
        answer: 2,
        why: "At steady high load, committed instance capacity has a lower unit cost than per-request pricing.",
      },
      {
        q: "To save the inter-AZ data charge, an option moves a production database from Multi-AZ to Single-AZ. The question requires high availability. Is it a good answer?",
        options: ["Yes, it is the most cost-effective", "Yes, if backups are on", "Only during off-peak hours", "No, it breaks the availability requirement"],
        answer: 3,
        why: "The cheapest valid option must still meet every stated requirement.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Calculate how much a team saves per month by stopping a 0.20 dollar per hour dev instance outside 10 working hours on 5 weekdays.",
        hint: "A month has about 730 hours; working hours are about 10 x 5 x 4.33.",
        solution: "Always on: 730 h x 0.20 = 146.00 USD\nWorking hours only: 10 x 5 x 4.33 = about 217 h x 0.20 = 43.40 USD\nSaving: about 102.60 USD per month (about 70 percent)\n(EBS volumes still cost money while the instance is stopped.)",
      },
      {
        level: "medium",
        task: "Find which EBS volumes in your account are still gp2 and convert one to gp3.",
        hint: "Filter describe-volumes by volume-type, then use modify-volume; it works while attached.",
        solution: "aws ec2 describe-volumes --filters Name=volume-type,Values=gp2 \\\n  --query 'Volumes[].[VolumeId,Size,State]' --output table\naws ec2 modify-volume --volume-id vol-0abc1234 --volume-type gp3\naws ec2 describe-volumes-modifications --volume-ids vol-0abc1234 \\\n  --query 'VolumesModifications[0].ModificationState'\n# gp3 keeps at least 3,000 IOPS; for big gp2 volumes above 3,000 IOPS,\n# set --iops to match the old performance.",
      },
      {
        level: "hard",
        task: "Schedule a dev Auto Scaling group to scale to zero at 19:00 and back to 2 at 08:00 on weekdays, in your local time zone.",
        hint: "Scheduled actions accept a cron recurrence and a --time-zone.",
        solution: "aws autoscaling put-scheduled-update-group-action \\\n  --auto-scaling-group-name dev-web --scheduled-action-name night-off \\\n  --recurrence '0 19 * * 1-5' --time-zone 'Europe/Berlin' \\\n  --min-size 0 --max-size 0 --desired-capacity 0\naws autoscaling put-scheduled-update-group-action \\\n  --auto-scaling-group-name dev-web --scheduled-action-name morning-on \\\n  --recurrence '0 8 * * 1-5' --time-zone 'Europe/Berlin' \\\n  --min-size 2 --max-size 4 --desired-capacity 2\n# Friday 19:00 to Monday 08:00 stays off, since weekends are not in 1-5.",
      },
    ],
    faq: [
      { q: "Why is my data transfer bill so high?", a: "Common causes are traffic through NAT gateways, chatty services talking across AZs, and serving large files directly from EC2 or S3 to the internet. Group by usage type in Cost Explorer to see which one it is." },
      { q: "Is serverless always cheaper?", a: "No. It is cheaper for low, spiky or unpredictable traffic because idle time is free. For steady high load, right-sized instances or containers with a Savings Plan are usually cheaper per request." },
      { q: "Does a stopped EC2 instance cost money?", a: "You stop paying for the instance hours, but attached EBS volumes, snapshots and any public IPv4 addresses kept on the account still cost money." },
      { q: "Is Graviton really cheaper?", a: "Graviton instances usually cost less per hour than similar x86 instances and often perform as well or better. Your software must run on Arm, which most Linux runtimes and containers built for arm64 do." },
    ],
  },
};

export default extra;
