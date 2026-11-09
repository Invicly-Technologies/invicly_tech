import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Exam orientation & AWS foundations ─────────────
  "aws-foundations/exam-guide": {
    summary:
      "SAA-C03 tests whether you can pick the right AWS services for a scenario. It has 65 multiple-choice or multiple-response questions in 130 minutes, scored 100 to 1000 with 720 to pass. Knowing the four domain weights tells you where to spend study time.",
    analogy: "The exam guide is the syllabus: study what it weighs most.",
    visuals: [
      {
        type: "tree",
        title: "The four SAA-C03 domains",
        root: "SAA-C03 exam",
        children: [
          { label: "Secure architectures 30%", children: ["IAM and accounts", "Encryption", "Network security"] },
          { label: "Resilient architectures 26%", children: ["Multi-AZ designs", "Decoupling", "Disaster recovery"] },
          { label: "High-performing 24%", children: ["Compute and scaling", "Storage and databases", "Caching and edge"] },
          { label: "Cost-optimized 20%", children: ["Purchase options", "Storage tiers", "Data transfer"] },
        ],
      },
      {
        type: "flow",
        title: "Build a study plan",
        steps: [
          { label: "Read the exam guide", detail: "List in-scope services and task statements per domain." },
          { label: "Book a date", detail: "A fixed date, often 6 to 10 weeks out, keeps you on pace." },
          { label: "Weekly domain blocks", detail: "Give more weeks to security and resilience." },
          { label: "Labs each week", detail: "Build what you read in a free-tier account." },
          { label: "Practice exams", detail: "Finish with timed exams and targeted review." },
        ],
      },
    ],
    keyPoints: [
      "Security is the biggest domain at 30 percent, so master IAM, KMS and VPC security.",
      "Questions are scenarios: pick the option that meets every stated requirement.",
      "15 of the 65 questions are unscored, but you cannot tell which ones.",
      "There is no penalty for guessing, so never leave a question blank.",
    ],
    terms: [
      { term: "SAA-C03", meaning: "Current exam code for Solutions Architect Associate." },
      { term: "Domain", meaning: "A weighted section of the exam blueprint." },
      { term: "Scaled score", meaning: "Score from 100 to 1000; 720 is the pass mark." },
      { term: "Multiple response", meaning: "A question with two or more correct answers to select." },
    ],
    pitfalls: [
      "Studying every AWS service equally instead of following the in-scope list.",
      "Reading only theory without hands-on labs; scenarios assume practical intuition.",
    ],
    check: [
      { q: "Which SAA-C03 domain carries the most weight?", a: "Design Secure Architectures, at 30 percent of the scored content." },
      { q: "Is there a penalty for wrong answers?", a: "No. Unanswered questions count as wrong, so always pick an answer." },
    ],
  },

  "aws-foundations/global-infra": {
    summary:
      "AWS runs in Regions, each made of multiple isolated Availability Zones, plus hundreds of edge locations for CloudFront and Route 53. Spreading resources across AZs gives high availability, and Region choice drives latency, compliance and price. Under the shared responsibility model AWS secures the cloud and you secure what you put in it.",
    analogy: "A Region is a city, AZs are separate power-fed districts, and edge locations are corner shops near customers.",
    visuals: [
      {
        type: "layers",
        title: "AWS global infrastructure",
        layers: [
          { label: "Global network", detail: "Private AWS backbone linking all Regions and edge sites." },
          { label: "Region", detail: "Geographic area, e.g. eu-west-1; data stays unless you move it." },
          { label: "Availability Zone", detail: "One or more data centers with independent power and networking." },
          { label: "Data center", detail: "Physical facility; AZs are linked by low-latency fiber." },
          { label: "Edge location", detail: "Caches content and answers DNS close to users." },
        ],
      },
      {
        type: "compare",
        title: "Shared responsibility",
        columns: [
          { title: "AWS: of the cloud", points: ["Physical data centers", "Hardware and global network", "Hypervisor and managed service infrastructure", "Patching managed service platforms"] },
          { title: "You: in the cloud", points: ["IAM users, roles and policies", "Data encryption and classification", "Security groups and NACLs", "Guest OS patching on EC2"] },
        ],
      },
    ],
    keyPoints: [
      "Each Region has at least three AZs; design across two or more for high availability.",
      "Pick a Region by compliance first, then latency to users, service availability and price.",
      "Edge locations serve CloudFront, Route 53 and Global Accelerator, not EC2 instances.",
      "The more managed the service, the more responsibility shifts to AWS.",
    ],
    terms: [
      { term: "Region", meaning: "Separate geographic area containing multiple AZs." },
      { term: "Availability Zone", meaning: "Isolated location inside a Region with its own power and network." },
      { term: "Edge location", meaning: "Point of presence used for caching and DNS." },
      { term: "Local Zone", meaning: "Extension of a Region placed near a large city." },
      { term: "Shared responsibility", meaning: "Split of security duties between AWS and the customer." },
    ],
    pitfalls: [
      "Assuming a single AZ deployment is highly available; one AZ is one failure domain.",
      "Believing AWS patches your EC2 guest OS; that is your job.",
    ],
    check: [
      { q: "A law requires customer data to stay in Germany. What drives the design?", a: "Choose the Frankfurt Region and keep data and backups there, because data does not leave a Region unless you move it." },
      { q: "Who patches the OS on an RDS instance?", a: "AWS, because RDS is a managed service; you choose the maintenance window." },
    ],
  },

  "aws-foundations/well-architected": {
    summary:
      "The Well-Architected Framework is AWS's checklist for good cloud design, organized into six pillars. Exam answers usually favor the option that best satisfies the pillar a question stresses. The free Well-Architected Tool lets you review a workload against these best practices.",
    visuals: [
      {
        type: "tree",
        title: "The six pillars",
        root: "Well-Architected",
        children: [
          { label: "Operational excellence", children: ["Infrastructure as code", "Small reversible changes"] },
          { label: "Security", children: ["Least privilege", "Encrypt everywhere", "Traceability"] },
          { label: "Reliability", children: ["Multi-AZ", "Auto recovery", "Tested backups"] },
          { label: "Performance efficiency", children: ["Right resource types", "Serverless and managed"] },
          { label: "Cost optimization", children: ["Pay for use", "Right-size", "Purchase options"] },
          { label: "Sustainability", children: ["Maximize utilization", "Managed services"] },
        ],
      },
    ],
    keyPoints: [
      "Six pillars: operational excellence, security, reliability, performance, cost and sustainability.",
      "Reliability means recovering automatically from failure and scaling to meet demand.",
      "Prefer managed and serverless services to cut operational burden.",
      "Trade-offs are normal; the scenario tells you which pillar matters most.",
    ],
    terms: [
      { term: "Pillar", meaning: "One of six areas of architectural best practice." },
      { term: "Well-Architected Tool", meaning: "Console tool that reviews a workload against the pillars." },
      { term: "Lens", meaning: "Extra guidance for a domain, such as serverless." },
      { term: "High-risk issue", meaning: "Review finding that needs fixing first." },
    ],
    pitfalls: [
      "Forgetting sustainability, the sixth pillar added in 2021.",
      "Optimizing one pillar, such as cost, while breaking a stated reliability requirement.",
    ],
    check: [
      { q: "Name the six Well-Architected pillars.", a: "Operational excellence, security, reliability, performance efficiency, cost optimization and sustainability." },
      { q: "A design runs one EC2 instance in one AZ. Which pillar is weakest?", a: "Reliability, because a single instance and AZ is a single point of failure." },
    ],
  },

  "aws-foundations/account-setup": {
    summary:
      "A safe lab account protects the root user with MFA, uses a separate admin identity for daily work, and alerts you before you overspend. Then the AWS CLI lets you script and repeat labs. New accounts get Free Tier credits, but usage on a paid plan beyond those credits is billed.",
    visuals: [
      {
        type: "flow",
        title: "Lab account setup",
        steps: [
          { label: "Create account", detail: "Sign up with a unique email and strong root password." },
          { label: "Root MFA", detail: "Enable MFA, then lock root credentials away." },
          { label: "Admin identity", detail: "IAM Identity Center user or IAM admin user for daily use." },
          { label: "Budget alert", detail: "AWS Budgets emails you at a small monthly threshold." },
          { label: "Configure CLI", detail: "Install AWS CLI v2 and log in with SSO." },
        ],
      },
    ],
    keyPoints: [
      "Never use the root user for daily work and never create root access keys.",
      "Use AWS Budgets for spend alerts; it works with forecast and actual cost.",
      "Prefer IAM Identity Center and short-lived credentials over long-lived access keys.",
      "Verify your CLI identity with aws sts get-caller-identity before running labs.",
    ],
    terms: [
      { term: "Root user", meaning: "Account owner identity with unrestricted access." },
      { term: "MFA", meaning: "Second factor such as a passkey or authenticator app." },
      { term: "AWS Budgets", meaning: "Service that alerts when cost or usage crosses a threshold." },
      { term: "AWS CLI v2", meaning: "Command-line tool for calling AWS APIs." },
      { term: "Profile", meaning: "Named set of CLI credentials and Region settings." },
    ],
    example: {
      lang: "bash",
      code: "# Log in with IAM Identity Center\naws configure sso --profile lab\naws sso login --profile lab\n\n# Confirm who you are\naws sts get-caller-identity --profile lab\n\n# Set a default Region for this profile\naws configure set region us-east-1 --profile lab",
      caption: "Configure the CLI with short-lived SSO credentials.",
    },
    pitfalls: [
      "Leaving labs running; NAT gateways and load balancers bill by the hour.",
      "Committing access keys to Git; bots find them within minutes.",
    ],
    check: [
      { q: "What should you do with the root user after setup?", a: "Enable MFA, avoid access keys and use it only for the few tasks that require root." },
      { q: "Which service sends an email when forecasted spend exceeds 10 dollars?", a: "AWS Budgets, with a cost budget and a forecasted alert threshold." },
    ],
  },

  // ───────────── Secure architectures ─────────────
  "aws-security/iam-deep": {
    summary:
      "IAM controls who can do what in AWS. Users and groups represent people, while roles give temporary credentials to services, apps and other accounts. Every request is evaluated against all applicable policies, and an explicit deny always wins.",
    analogy: "A role is a visitor badge: you pick it up, use it for a while, then it expires.",
    visuals: [
      {
        type: "flow",
        title: "Policy evaluation in one account",
        steps: [
          { label: "Explicit deny?", detail: "Any matching Deny in any policy ends with deny." },
          { label: "SCP and RCP allow?", detail: "Organization policies must allow the action." },
          { label: "Resource policy allow?", detail: "Can grant access on its own within the account." },
          { label: "Identity policy allow?", detail: "Needed if no resource policy grants access." },
          { label: "Boundary and session allow?", detail: "Permissions boundaries and session policies further limit." },
          { label: "Otherwise implicit deny", detail: "No allow found means the request is denied." },
        ],
      },
      {
        type: "sequence",
        title: "EC2 uses a role to read S3",
        actors: ["EC2 app", "Instance metadata", "AWS STS", "Amazon S3"],
        messages: [
          { from: 0, to: 1, label: "Request role credentials" },
          { from: 1, to: 2, label: "AssumeRole via instance profile" },
          { from: 2, to: 1, label: "Temporary keys and token" },
          { from: 1, to: 0, label: "Return temporary credentials" },
          { from: 0, to: 3, label: "Signed GetObject request" },
          { from: 3, to: 0, label: "Object returned if allowed" },
        ],
      },
    ],
    keyPoints: [
      "Default is implicit deny; explicit deny overrides any allow.",
      "Use roles, not access keys, for EC2, Lambda and cross-account access.",
      "Cross-account access needs a trust policy on the role and permissions in the caller account.",
      "Permissions boundaries and SCPs only limit permissions; they never grant them.",
      "Grant least privilege by scoping actions, resources and conditions.",
    ],
    terms: [
      { term: "IAM role", meaning: "Identity with temporary credentials, assumed by trusted principals." },
      { term: "Trust policy", meaning: "Resource policy on a role saying who may assume it." },
      { term: "Identity-based policy", meaning: "Policy attached to a user, group or role." },
      { term: "Resource-based policy", meaning: "Policy attached to a resource like an S3 bucket." },
      { term: "Permissions boundary", meaning: "Maximum permissions an identity-based policy can grant." },
      { term: "Instance profile", meaning: "Container that passes a role to an EC2 instance." },
    ],
    example: {
      lang: "json",
      code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Action\": [\"s3:GetObject\"],\n    \"Resource\": \"arn:aws:s3:::reports-bucket/2026/*\",\n    \"Condition\": {\"Bool\": {\"aws:SecureTransport\": \"true\"}}\n  }]\n}",
      caption: "Least-privilege read access to one prefix over TLS only.",
    },
    pitfalls: [
      "Storing access keys on EC2 instead of attaching an instance profile role.",
      "Thinking an SCP Allow grants access; users still need an IAM allow.",
      "Using wildcards like s3:* on * when one action and one ARN would do.",
    ],
    check: [
      { q: "An identity policy allows s3:DeleteObject but an SCP denies it. What happens?", a: "The request is denied, because an explicit deny anywhere overrides any allow." },
      { q: "How should a Lambda function in account A read a DynamoDB table in account B?", a: "Create a role in account B that trusts account A, and let the function assume it with sts:AssumeRole." },
      { q: "What is the safest way to give an EC2 app S3 access?", a: "Attach an IAM role through an instance profile so the app uses rotating temporary credentials." },
    ],
  },

  "aws-security/multi-account": {
    summary:
      "Large AWS estates use many accounts to isolate workloads, billing and blast radius. AWS Organizations groups accounts into OUs and applies service control policies as guardrails, Control Tower automates a best-practice landing zone, and IAM Identity Center gives people one sign-in to every account.",
    analogy: "Organizations is a building with locked floors; SCPs are the rules posted on each floor.",
    visuals: [
      {
        type: "tree",
        title: "An AWS Organization",
        root: "Organization root",
        children: [
          { label: "Management account", children: ["Consolidated billing", "Not restricted by SCPs"] },
          { label: "Security OU", children: ["Log archive account", "Audit account"] },
          { label: "Workloads OU", children: ["Prod OU and accounts", "Dev OU and accounts"] },
          { label: "Sandbox OU", children: ["Experiment accounts", "Strict spend SCPs"] },
        ],
      },
    ],
    keyPoints: [
      "SCPs set the maximum permissions for accounts in an OU; they never grant access.",
      "SCPs do not affect the management account, so keep workloads out of it.",
      "Control Tower creates a landing zone with log archive, audit accounts and preventive controls.",
      "IAM Identity Center assigns permission sets to users and groups across accounts.",
      "Consolidated billing pools usage for volume discounts and shared Savings Plans.",
    ],
    terms: [
      { term: "OU", meaning: "Organizational unit: a folder of accounts sharing policies." },
      { term: "SCP", meaning: "Service control policy limiting what principals in accounts can do." },
      { term: "RCP", meaning: "Resource control policy limiting access to resources in accounts." },
      { term: "Control Tower", meaning: "Service that sets up and governs a multi-account landing zone." },
      { term: "Permission set", meaning: "Identity Center template that becomes a role in each account." },
    ],
    example: {
      lang: "json",
      code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"DenyOutsideEU\",\n    \"Effect\": \"Deny\",\n    \"NotAction\": [\"iam:*\", \"organizations:*\", \"sts:*\"],\n    \"Resource\": \"*\",\n    \"Condition\": {\"StringNotEquals\": {\"aws:RequestedRegion\": [\"eu-west-1\", \"eu-central-1\"]}}\n  }]\n}",
      caption: "SCP that blocks regional services outside two EU Regions.",
    },
    pitfalls: [
      "Expecting an SCP to grant permissions; IAM policies must still allow the action.",
      "Running production workloads in the management account, where SCPs do not apply.",
    ],
    check: [
      { q: "How do you stop every developer account from disabling CloudTrail?", a: "Attach an SCP to the developer OU that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail." },
      { q: "Which service gives workforce users single sign-on to many AWS accounts?", a: "AWS IAM Identity Center, using permission sets assigned per account." },
    ],
  },

  "aws-security/encryption": {
    summary:
      "AWS KMS manages encryption keys and integrates with S3, EBS, RDS and most data services. Services use envelope encryption: a data key encrypts your data and a KMS key encrypts the data key. ACM provides TLS certificates for encryption in transit, and Secrets Manager stores and rotates credentials.",
    analogy: "Envelope encryption locks data in a box, then locks the box's key in a vault.",
    visuals: [
      {
        type: "sequence",
        title: "Envelope encryption",
        actors: ["Service or app", "AWS KMS", "Storage"],
        messages: [
          { from: 0, to: 1, label: "GenerateDataKey with KMS key" },
          { from: 1, to: 0, label: "Plaintext and encrypted data key" },
          { from: 0, to: 0, label: "Encrypt data, discard plaintext key" },
          { from: 0, to: 2, label: "Store ciphertext and encrypted key" },
          { from: 0, to: 1, label: "Later: Decrypt the data key" },
          { from: 1, to: 0, label: "Plaintext key if allowed" },
        ],
      },
      {
        type: "compare",
        title: "KMS key types",
        columns: [
          { title: "AWS managed key", points: ["Created by a service, e.g. aws/s3", "Rotates yearly automatically", "Cannot edit key policy", "No monthly key fee"] },
          { title: "Customer managed key", points: ["You create and control it", "Custom key policy and grants", "Optional automatic rotation", "Needed for cross-account sharing"] },
        ],
      },
    ],
    keyPoints: [
      "Use a customer managed key when you need key policy control, audit or cross-account use.",
      "S3 encrypts new objects with SSE-S3 by default; choose SSE-KMS for key control and audit.",
      "Encrypted EBS and RDS must be enabled at creation; copy snapshots to encrypt existing data.",
      "ACM public certificates are free and auto-renew on ALB, CloudFront and API Gateway.",
      "Secrets Manager rotates database credentials automatically with a Lambda function.",
    ],
    terms: [
      { term: "KMS key", meaning: "Logical key in KMS that never leaves it unencrypted." },
      { term: "Data key", meaning: "Key that encrypts the actual data, wrapped by a KMS key." },
      { term: "SSE-KMS", meaning: "S3 server-side encryption with KMS keys." },
      { term: "ACM", meaning: "AWS Certificate Manager for TLS certificates." },
      { term: "Secrets Manager", meaning: "Stores, retrieves and rotates secrets like DB passwords." },
      { term: "CloudHSM", meaning: "Dedicated single-tenant HSMs you fully control." },
    ],
    example: {
      lang: "bash",
      code: "# Create a customer managed key\naws kms create-key --description \"app data key\"\n\n# Upload an object encrypted with that key\naws s3 cp report.csv s3://my-bucket/ \\\n  --sse aws:kms --sse-kms-key-id alias/app-data\n\n# Store a database password\naws secretsmanager create-secret --name prod/db \\\n  --secret-string \"{\\\"password\\\":\\\"S3cret!\\\"}\"",
    },
    pitfalls: [
      "Expecting to toggle encryption on an existing unencrypted RDS instance in place.",
      "Forgetting KMS request quotas and costs with very high SSE-KMS traffic; use S3 Bucket Keys.",
    ],
    check: [
      { q: "How do you encrypt an existing unencrypted RDS database?", a: "Snapshot it, copy the snapshot with encryption enabled, and restore a new instance from the encrypted copy." },
      { q: "Which service rotates RDS passwords automatically?", a: "AWS Secrets Manager, using built-in rotation backed by Lambda." },
      { q: "Why use envelope encryption?", a: "Large data is encrypted locally with a data key, so only the small data key travels to KMS." },
    ],
  },

  "aws-security/threat-protection": {
    summary:
      "AWS has separate services to block, detect and assess threats. WAF filters malicious HTTP requests, Shield protects against DDoS, GuardDuty detects suspicious activity from logs, Inspector scans for vulnerabilities, and Macie finds sensitive data in S3. Exam questions hinge on picking the right verb: block, detect or discover.",
    visuals: [
      {
        type: "tree",
        title: "Pick the threat service",
        root: "Threat protection",
        children: [
          { label: "Block web attacks", children: ["AWS WAF", "SQL injection and XSS rules", "Rate-based rules"] },
          { label: "Absorb DDoS", children: ["Shield Standard: free, automatic", "Shield Advanced: paid, response team"] },
          { label: "Detect threats", children: ["GuardDuty", "CloudTrail, VPC Flow, DNS logs"] },
          { label: "Find vulnerabilities", children: ["Inspector", "EC2, ECR images, Lambda"] },
          { label: "Discover sensitive data", children: ["Macie", "PII in S3 buckets"] },
        ],
      },
    ],
    keyPoints: [
      "WAF attaches to CloudFront, ALB, API Gateway, AppSync and Cognito user pools.",
      "Shield Standard is on for everyone; Advanced adds DDoS cost protection and expert support.",
      "GuardDuty is agentless for core logs and needs only to be enabled.",
      "Inspector continuously scans for CVEs and unintended network exposure.",
      "Macie uses machine learning and patterns to flag PII in S3.",
    ],
    terms: [
      { term: "AWS WAF", meaning: "Layer 7 firewall using web ACLs and rules." },
      { term: "Web ACL", meaning: "Set of WAF rules attached to a resource." },
      { term: "Shield Advanced", meaning: "Paid DDoS protection with response team and cost protection." },
      { term: "GuardDuty", meaning: "Threat detection from logs and runtime signals." },
      { term: "Inspector", meaning: "Automated vulnerability management for workloads." },
      { term: "Macie", meaning: "Sensitive data discovery for S3." },
    ],
    pitfalls: [
      "Choosing GuardDuty to block traffic; it detects and reports, it does not block.",
      "Attaching WAF to a Network Load Balancer; WAF does not support NLB.",
    ],
    check: [
      { q: "A site faces SQL injection attempts through an ALB. What do you add?", a: "AWS WAF with a web ACL on the ALB using SQL injection managed rules." },
      { q: "Which service reveals an EC2 instance communicating with a known crypto-mining IP?", a: "Amazon GuardDuty, which analyzes VPC Flow Logs, DNS logs and CloudTrail." },
      { q: "How do you find credit card numbers stored in S3?", a: "Run Amazon Macie discovery jobs on the buckets." },
    ],
  },

  // ───────────── Networking ─────────────
  "aws-networking/vpc-core": {
    summary:
      "A VPC is your private network in a Region, split into subnets that each live in one AZ. A subnet is public when its route table sends 0.0.0.0/0 to an internet gateway. Private subnets reach the internet outbound through a NAT gateway placed in a public subnet.",
    analogy: "The VPC is an office building, subnets are floors, and route tables are the signposts.",
    visuals: [
      {
        type: "layers",
        title: "Two-AZ VPC layout",
        layers: [
          { label: "Internet gateway", detail: "Attached to the VPC; enables public internet traffic." },
          { label: "VPC 10.0.0.0/16", detail: "Regional private network spanning all AZs." },
          { label: "Public subnets", detail: "One per AZ; route 0.0.0.0/0 to the IGW. ALB, NAT." },
          { label: "Private app subnets", detail: "One per AZ; route 0.0.0.0/0 to that AZ's NAT gateway." },
          { label: "Private data subnets", detail: "Databases with no internet route at all." },
        ],
      },
      {
        type: "flow",
        title: "Private instance reaches the internet",
        steps: [
          { label: "Private EC2", detail: "Has only a private IP." },
          { label: "Route table", detail: "0.0.0.0/0 points to the NAT gateway." },
          { label: "NAT gateway", detail: "In a public subnet, with an Elastic IP." },
          { label: "Internet gateway", detail: "Sends traffic out; replies return through NAT." },
        ],
      },
    ],
    keyPoints: [
      "A subnet lives in exactly one AZ; use one public and one private subnet per AZ.",
      "AWS reserves five IP addresses in every subnet.",
      "NAT gateways are AZ-scoped; deploy one per AZ for resilience.",
      "NAT allows outbound-only connections; inbound connections from the internet are not possible.",
      "VPC CIDRs cannot be changed later, so plan non-overlapping ranges up front.",
    ],
    terms: [
      { term: "CIDR block", meaning: "IP range for the VPC or subnet, like 10.0.1.0/24." },
      { term: "Route table", meaning: "Rules deciding where subnet traffic is sent." },
      { term: "Internet gateway", meaning: "Horizontally scaled gateway for public internet access." },
      { term: "NAT gateway", meaning: "Managed outbound internet access for private subnets." },
      { term: "Elastic IP", meaning: "Static public IPv4 address you own in a Region." },
      { term: "Egress-only IGW", meaning: "Outbound-only internet access for IPv6." },
    ],
    example: {
      lang: "bash",
      code: "VPC=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 \\\n  --query Vpc.VpcId --output text)\naws ec2 create-subnet --vpc-id $VPC \\\n  --cidr-block 10.0.1.0/24 --availability-zone us-east-1a\nIGW=$(aws ec2 create-internet-gateway \\\n  --query InternetGateway.InternetGatewayId --output text)\naws ec2 attach-internet-gateway --vpc-id $VPC \\\n  --internet-gateway-id $IGW",
      caption: "Create a VPC, a subnet and an attached internet gateway.",
    },
    pitfalls: [
      "Putting the NAT gateway in a private subnet; it must sit in a public subnet.",
      "Using one NAT gateway for all AZs; an AZ failure then breaks egress everywhere.",
    ],
    check: [
      { q: "What makes a subnet public?", a: "Its route table has a route to an internet gateway, and instances need public IPs." },
      { q: "Private instances must download patches but never accept inbound internet connections. What do you use?", a: "A NAT gateway in a public subnet, with private route tables pointing 0.0.0.0/0 to it." },
    ],
  },

  "aws-networking/vpc-security": {
    summary:
      "Security groups are stateful firewalls on network interfaces that only allow traffic. Network ACLs are stateless filters on subnets that can allow or deny. VPC endpoints let resources reach AWS services privately without an internet gateway or NAT.",
    visuals: [
      {
        type: "compare",
        title: "Security group vs NACL",
        columns: [
          { title: "Security group", points: ["Instance or ENI level", "Stateful: replies allowed", "Allow rules only", "All rules evaluated", "Can reference other SGs"] },
          { title: "Network ACL", points: ["Subnet level", "Stateless: allow return traffic", "Allow and deny rules", "Lowest rule number wins", "Good for blocking IP ranges"] },
        ],
      },
      {
        type: "compare",
        title: "VPC endpoint types",
        columns: [
          { title: "Gateway endpoint", points: ["S3 and DynamoDB only", "Route table target", "No hourly charge", "Same-Region access"] },
          { title: "Interface endpoint", points: ["Most AWS services", "ENI with private IP", "Powered by PrivateLink", "Hourly and per-GB charge"] },
        ],
      },
    ],
    keyPoints: [
      "Reference a security group as the source, e.g. DB allows port 3306 from the app SG.",
      "Use a NACL deny rule to block a specific malicious IP range.",
      "Stateless NACLs need outbound rules for ephemeral ports 1024 to 65535.",
      "Gateway endpoints for S3 also remove NAT data-processing charges.",
      "PrivateLink can expose your own service privately to other VPCs.",
    ],
    terms: [
      { term: "Stateful", meaning: "Return traffic is automatically allowed." },
      { term: "Stateless", meaning: "Each direction is checked separately against rules." },
      { term: "Ephemeral ports", meaning: "Temporary client ports used for return traffic." },
      { term: "Gateway endpoint", meaning: "Free route-based private path to S3 or DynamoDB." },
      { term: "PrivateLink", meaning: "Private connectivity to services through interface endpoints." },
    ],
    example: {
      lang: "bash",
      code: "# Allow MySQL only from the app tier security group\naws ec2 authorize-security-group-ingress \\\n  --group-id sg-0db1111111111111 \\\n  --protocol tcp --port 3306 \\\n  --source-group sg-0app222222222222\n\n# Private S3 access from a VPC\naws ec2 create-vpc-endpoint --vpc-id vpc-0abc \\\n  --service-name com.amazonaws.us-east-1.s3 \\\n  --route-table-ids rtb-0priv",
    },
    pitfalls: [
      "Trying to add a deny rule to a security group; only NACLs can deny.",
      "Forgetting NACL outbound ephemeral ports, so replies are silently dropped.",
    ],
    check: [
      { q: "You must block one attacking IP range from a subnet. Security group or NACL?", a: "A NACL, because security groups cannot contain deny rules." },
      { q: "Private EC2 instances upload large files to S3 and NAT costs are high. What fixes it?", a: "Add an S3 gateway endpoint to the private route tables, which is free and bypasses NAT." },
    ],
  },

  "aws-networking/hybrid": {
    summary:
      "VPC peering links two VPCs directly, while Transit Gateway acts as a central hub for many VPCs and on-premises networks. Site-to-Site VPN gives an encrypted tunnel over the internet in minutes, and Direct Connect gives a private, consistent dedicated link that takes weeks to provision.",
    analogy: "Peering is a private footbridge between two buildings; Transit Gateway is the central train station.",
    visuals: [
      {
        type: "tree",
        title: "Connectivity options",
        root: "Connect networks",
        children: [
          { label: "VPC to VPC", children: ["VPC peering: few VPCs", "Transit Gateway: many VPCs", "PrivateLink: one service"] },
          { label: "On-premises to AWS", children: ["Site-to-Site VPN", "Direct Connect", "DX plus VPN backup"] },
          { label: "Users to AWS", children: ["Client VPN"] },
        ],
      },
      {
        type: "compare",
        title: "VPN vs Direct Connect",
        columns: [
          { title: "Site-to-Site VPN", points: ["IPsec over the internet", "Set up in minutes", "Variable latency", "Bandwidth capped per tunnel", "Encrypted by default"] },
          { title: "Direct Connect", points: ["Private dedicated connection", "Weeks to provision", "Consistent latency", "Dedicated ports up to 400 Gbps", "Add MACsec or VPN to encrypt"] },
        ],
      },
    ],
    keyPoints: [
      "Peering is not transitive and CIDRs must not overlap.",
      "Transit Gateway gives transitive hub-and-spoke routing across VPCs, VPN and Direct Connect.",
      "For DX resilience use two connections at separate locations, or a VPN as backup.",
      "Direct Connect alone is not encrypted; run IPsec VPN over it or MACsec when required.",
    ],
    terms: [
      { term: "VPC peering", meaning: "One-to-one private routing between two VPCs." },
      { term: "Transit Gateway", meaning: "Regional router connecting many VPCs and on-prem networks." },
      { term: "Customer gateway", meaning: "Your on-premises VPN device as defined in AWS." },
      { term: "Virtual private gateway", meaning: "VPN endpoint on the AWS side of a VPC." },
      { term: "Direct Connect", meaning: "Dedicated private network link from your site to AWS." },
    ],
    pitfalls: [
      "Expecting VPC A to reach C through B when A-B and B-C are peered.",
      "Choosing Direct Connect when connectivity is needed this week.",
    ],
    check: [
      { q: "Fifty VPCs and two data centers must all talk to each other. What do you use?", a: "AWS Transit Gateway with VPC attachments and VPN or Direct Connect attachments." },
      { q: "A company needs private, consistent bandwidth and has two months. VPN or Direct Connect?", a: "Direct Connect, ideally with a Site-to-Site VPN as a low-cost backup." },
    ],
  },

  "aws-networking/edge": {
    summary:
      "Route 53 is AWS's DNS service with routing policies and health checks for failover. CloudFront is a CDN that caches content at edge locations in front of S3, ALB or any origin. Global Accelerator gives two static anycast IPs that route TCP and UDP traffic over the AWS backbone to the healthiest endpoint.",
    visuals: [
      {
        type: "flow",
        title: "A global web request",
        steps: [
          { label: "User", detail: "Types app.example.com in a browser." },
          { label: "Route 53", detail: "Alias record resolves to the CloudFront distribution." },
          { label: "CloudFront edge", detail: "Serves cached content or forwards to origin." },
          { label: "ALB", detail: "Routes the request to a healthy target." },
          { label: "EC2 in Auto Scaling", detail: "Builds the dynamic response." },
        ],
      },
      {
        type: "compare",
        title: "CloudFront vs Global Accelerator",
        columns: [
          { title: "CloudFront", points: ["Caches HTTP and HTTPS content", "Static and dynamic web delivery", "Integrates with WAF and OAC", "Edge functions for custom logic"] },
          { title: "Global Accelerator", points: ["No caching", "Two static anycast IPs", "TCP and UDP, e.g. gaming, VoIP", "Fast regional failover"] },
        ],
      },
    ],
    keyPoints: [
      "Routing policies: simple, weighted, latency, failover, geolocation, geoproximity, multivalue, IP-based.",
      "Alias records point to AWS resources, are free to query and work at the zone apex.",
      "Use origin access control so S3 content is only reachable through CloudFront.",
      "Choose Global Accelerator for static IPs or non-HTTP traffic needing fast failover.",
    ],
    terms: [
      { term: "Hosted zone", meaning: "Container of DNS records for a domain." },
      { term: "Alias record", meaning: "Route 53 record pointing to an AWS resource." },
      { term: "Health check", meaning: "Route 53 probe that drives DNS failover." },
      { term: "Origin", meaning: "Backend that CloudFront fetches from, like S3 or ALB." },
      { term: "TTL", meaning: "How long resolvers or caches keep a response." },
      { term: "OAC", meaning: "Origin access control restricting S3 to CloudFront." },
    ],
    pitfalls: [
      "Using a CNAME at the zone apex; use an alias record instead.",
      "Picking CloudFront for a UDP game server; it handles HTTP, not raw UDP.",
    ],
    check: [
      { q: "Send 10 percent of traffic to a new version. Which Route 53 policy?", a: "Weighted routing, with weights such as 90 and 10." },
      { q: "Users need the lowest latency Region automatically. Which policy?", a: "Latency-based routing, which answers with the Region of lowest measured latency." },
      { q: "A client firewall allows only two fixed IPs to a multi-Region app. What fits?", a: "AWS Global Accelerator, which provides two static anycast IP addresses." },
    ],
  },

  // ───────────── Compute & scaling ─────────────
  "aws-compute/ec2": {
    summary:
      "EC2 provides virtual servers in families tuned for general, compute, memory, storage or accelerated workloads. AMIs capture the OS and software you launch from, and placement groups control how instances are spread across hardware. Choosing the right family and size is a frequent exam scenario.",
    visuals: [
      {
        type: "tree",
        title: "Instance families",
        root: "EC2 instance types",
        children: [
          { label: "General purpose", children: ["M, T (burstable)", "Web and app servers"] },
          { label: "Compute optimized", children: ["C family", "Batch, HPC, gaming"] },
          { label: "Memory optimized", children: ["R, X families", "In-memory DBs, caches"] },
          { label: "Storage optimized", children: ["I, D families", "High local IOPS, NoSQL"] },
          { label: "Accelerated computing", children: ["P, G, Trn, Inf", "ML training, graphics"] },
        ],
      },
      {
        type: "compare",
        title: "Placement groups",
        columns: [
          { title: "Cluster", points: ["Packed in one AZ", "Lowest latency, high throughput", "HPC and tightly coupled jobs", "Shared hardware failure risk"] },
          { title: "Spread", points: ["Each instance on distinct racks", "Max 7 instances per AZ", "Critical small groups", "Can span AZs"] },
          { title: "Partition", points: ["Partitions on separate racks", "Up to 7 per AZ", "Hadoop, Cassandra, Kafka", "Hundreds of instances"] },
        ],
      },
    ],
    keyPoints: [
      "Graviton (g suffix) instances usually give better price-performance for supported workloads.",
      "AMIs are Regional; copy an AMI to launch it in another Region.",
      "Instance store is fast but ephemeral; data is lost on stop or hardware failure.",
      "Hibernate saves RAM to an encrypted EBS root volume for fast resume.",
    ],
    terms: [
      { term: "AMI", meaning: "Amazon Machine Image: template for launching instances." },
      { term: "Instance type", meaning: "Family, generation and size, e.g. m7g.large." },
      { term: "User data", meaning: "Script that runs on first boot." },
      { term: "Placement group", meaning: "Strategy controlling instance placement on hardware." },
      { term: "Burstable", meaning: "T instances earn CPU credits for short bursts." },
    ],
    example: {
      lang: "bash",
      code: "aws ec2 run-instances \\\n  --image-id ami-0abcdef1234567890 \\\n  --instance-type t3.micro \\\n  --subnet-id subnet-0pub1 \\\n  --security-group-ids sg-0web \\\n  --iam-instance-profile Name=web-role \\\n  --user-data file://bootstrap.sh \\\n  --tag-specifications \"ResourceType=instance,Tags=[{Key=Name,Value=web}]\"",
      caption: "Launch a tagged instance with a role and boot script.",
    },
    pitfalls: [
      "Using a cluster placement group for high availability; it is one AZ.",
      "Running a database on instance store without replication.",
    ],
    check: [
      { q: "An HPC job needs the lowest network latency between nodes. Which placement group?", a: "A cluster placement group, which packs instances close together in one AZ." },
      { q: "Six critical instances must not share underlying hardware. Which placement group?", a: "A spread placement group, which puts each instance on a distinct rack." },
    ],
  },

  "aws-compute/elb-asg": {
    summary:
      "Elastic Load Balancing spreads traffic across healthy targets in multiple AZs. Auto Scaling groups keep the right number of instances running, replacing unhealthy ones and adding or removing capacity based on policies. Together they make a self-healing, elastic tier.",
    visuals: [
      {
        type: "cycle",
        title: "Auto Scaling loop",
        steps: [
          { label: "Monitor metric", detail: "CloudWatch tracks CPU, requests per target or queue depth." },
          { label: "Compare to target", detail: "Policy checks the metric against the target value." },
          { label: "Adjust desired capacity", detail: "Scale out or in within min and max." },
          { label: "Launch or terminate", detail: "Uses the launch template and balances across AZs." },
          { label: "Health checks", detail: "Unhealthy instances are replaced automatically." },
        ],
      },
      {
        type: "compare",
        title: "Load balancer types",
        columns: [
          { title: "ALB", points: ["Layer 7 HTTP and HTTPS", "Path and host routing", "Targets: EC2, IP, Lambda", "WAF integration"] },
          { title: "NLB", points: ["Layer 4 TCP, UDP, TLS", "Millions of requests per second", "Static IP per AZ", "Ultra-low latency"] },
          { title: "GWLB", points: ["Layer 3 GENEVE", "Inserts firewall appliances", "Transparent inspection", "Scales third-party appliances"] },
        ],
      },
    ],
    keyPoints: [
      "Use ELB health checks in the ASG so app failures trigger replacement.",
      "Target tracking is the simplest policy: keep average CPU at 50 percent, for example.",
      "Scheduled scaling handles known peaks; predictive scaling learns daily patterns.",
      "Use launch templates; launch configurations are legacy.",
      "Pick NLB when clients need a static IP or extreme performance.",
    ],
    terms: [
      { term: "Target group", meaning: "Set of targets and health check settings for a load balancer." },
      { term: "Launch template", meaning: "Versioned instance config used by Auto Scaling." },
      { term: "Desired capacity", meaning: "Number of instances the ASG aims to run." },
      { term: "Target tracking", meaning: "Policy that holds a metric near a target value." },
      { term: "Cooldown", meaning: "Wait time after scaling before the next action." },
    ],
    example: {
      lang: "bash",
      code: "aws autoscaling put-scaling-policy \\\n  --auto-scaling-group-name web-asg \\\n  --policy-name cpu50 \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-configuration '{\n    \"PredefinedMetricSpecification\":\n      {\"PredefinedMetricType\": \"ASGAverageCPUUtilization\"},\n    \"TargetValue\": 50.0}'",
      caption: "Keep average CPU around 50 percent.",
    },
    pitfalls: [
      "Leaving the ASG on EC2 status checks only, so a hung app is never replaced.",
      "Running the ASG in a single AZ, which defeats high availability.",
    ],
    check: [
      { q: "Route /api to one target group and /images to another. Which load balancer?", a: "An Application Load Balancer, using path-based listener rules." },
      { q: "Traffic spikes every weekday at 9 am. Which scaling policy adds capacity before the spike?", a: "Scheduled scaling, or predictive scaling, to scale out before 9 am." },
    ],
  },

  "aws-compute/containers": {
    summary:
      "ECS is AWS's own container orchestrator and EKS runs managed Kubernetes. Both can run containers on EC2 instances you manage or on Fargate, which is serverless compute for containers. ECR is the private registry that stores your container images.",
    visuals: [
      {
        type: "layers",
        title: "AWS container stack",
        layers: [
          { label: "Orchestrator", detail: "ECS (AWS-native) or EKS (Kubernetes API)." },
          { label: "Capacity", detail: "EC2 instances you manage or serverless Fargate." },
          { label: "Workload unit", detail: "ECS task or Kubernetes Pod." },
          { label: "Container image", detail: "Pulled from Amazon ECR." },
        ],
      },
      {
        type: "compare",
        title: "ECS vs EKS",
        columns: [
          { title: "Amazon ECS", points: ["Simpler, AWS-native API", "No control plane fee", "Deep AWS integration", "Least operational overhead"] },
          { title: "Amazon EKS", points: ["Standard Kubernetes", "Portable across clouds and on-prem", "Hourly control plane fee", "Rich open-source ecosystem"] },
        ],
      },
    ],
    keyPoints: [
      "Fargate removes server management; pay per vCPU and memory per second.",
      "Choose EC2 launch type for GPUs, special instance types or cheaper steady capacity.",
      "Give each ECS task its own IAM task role for least privilege.",
      "Pick EKS when the team already uses Kubernetes or needs portability.",
    ],
    terms: [
      { term: "Task definition", meaning: "ECS blueprint listing containers, CPU, memory and roles." },
      { term: "ECS service", meaning: "Keeps a desired number of tasks running." },
      { term: "Fargate", meaning: "Serverless compute engine for ECS and EKS." },
      { term: "ECR", meaning: "Elastic Container Registry for private images." },
      { term: "Task role", meaning: "IAM role assumed by containers in a task." },
    ],
    example: {
      lang: "bash",
      code: "ACCT=123456789012; REGION=us-east-1\nREPO=$ACCT.dkr.ecr.$REGION.amazonaws.com\naws ecr create-repository --repository-name web\naws ecr get-login-password --region $REGION | \\\n  docker login --username AWS --password-stdin $REPO\ndocker tag web:latest $REPO/web:1.0\ndocker push $REPO/web:1.0",
      caption: "Create an ECR repository and push an image.",
    },
    pitfalls: [
      "Picking EKS when the scenario stresses least operational overhead with no Kubernetes need.",
      "Granting permissions on the task execution role meant for the task role.",
    ],
    check: [
      { q: "Run containers without managing servers and with minimal operations. What do you choose?", a: "Amazon ECS with the Fargate launch type." },
      { q: "A team wants to move existing Kubernetes manifests to AWS. Which service?", a: "Amazon EKS, which runs upstream-compatible Kubernetes." },
    ],
  },

  "aws-compute/serverless": {
    summary:
      "Lambda runs your code in response to events without servers, billed per request and duration. API Gateway turns Lambda functions into HTTP APIs, and services like S3, SQS and EventBridge trigger functions automatically. Knowing Lambda limits helps you spot when serverless does not fit.",
    visuals: [
      {
        type: "flow",
        title: "Serverless API request",
        steps: [
          { label: "Client", detail: "Sends HTTPS request." },
          { label: "API Gateway", detail: "Auth, throttling, routing and request validation." },
          { label: "Lambda", detail: "Runs the handler; scales per request." },
          { label: "DynamoDB", detail: "Stores and returns data." },
        ],
      },
      {
        type: "sequence",
        title: "Queue-driven processing",
        actors: ["S3 bucket", "SQS queue", "Lambda", "DynamoDB"],
        messages: [
          { from: 0, to: 1, label: "ObjectCreated event" },
          { from: 2, to: 1, label: "Poll a batch of messages" },
          { from: 2, to: 3, label: "Write processed results" },
          { from: 2, to: 1, label: "Delete batch on success" },
        ],
      },
    ],
    keyPoints: [
      "Max timeout is 15 minutes; longer jobs belong on ECS, Batch or Step Functions.",
      "Memory ranges 128 MB to 10,240 MB, and CPU scales with memory.",
      "Default concurrency quota is 1,000 per Region; reserved concurrency caps a function.",
      "Provisioned concurrency removes cold starts for latency-sensitive APIs.",
      "Put SQS between producers and Lambda to buffer bursts and retry failures.",
    ],
    terms: [
      { term: "Handler", meaning: "Function Lambda calls with the event and context." },
      { term: "Cold start", meaning: "Extra latency when a new execution environment starts." },
      { term: "Reserved concurrency", meaning: "Guarantees and caps concurrency for one function." },
      { term: "Provisioned concurrency", meaning: "Pre-initialized environments that avoid cold starts." },
      { term: "Event source mapping", meaning: "Lambda poller for SQS, Kinesis or DynamoDB Streams." },
    ],
    example: {
      lang: "python",
      code: "import json, boto3\n\ntable = boto3.resource(\"dynamodb\").Table(\"orders\")\n\ndef handler(event, context):\n    body = json.loads(event[\"body\"])\n    table.put_item(Item={\"id\": body[\"id\"], \"total\": body[\"total\"]})\n    return {\"statusCode\": 201, \"body\": json.dumps({\"ok\": True})}",
      caption: "Lambda handler behind API Gateway writing to DynamoDB.",
    },
    pitfalls: [
      "Choosing Lambda for a 2-hour batch job; it stops at 15 minutes.",
      "Creating DB connections inside the handler on every call; reuse them or use RDS Proxy.",
    ],
    check: [
      { q: "A video transcoding job takes 40 minutes. Can Lambda run it?", a: "No. Lambda's maximum timeout is 15 minutes, so use ECS, Fargate or AWS Batch." },
      { q: "Many Lambda functions exhaust RDS connections. What helps?", a: "Amazon RDS Proxy, which pools and shares database connections." },
    ],
  },

  // ───────────── Storage ─────────────
  "aws-storage/s3": {
    summary:
      "S3 stores objects in buckets with eleven nines of durability. Storage classes trade retrieval speed and fees for lower storage price, and lifecycle rules move or expire objects automatically. Versioning protects against deletes and is required for replication.",
    visuals: [
      {
        type: "compare",
        title: "S3 storage classes",
        columns: [
          { title: "Frequent access", points: ["Standard: default, multi-AZ", "Intelligent-Tiering: unknown patterns", "Express One Zone: lowest latency"] },
          { title: "Infrequent access", points: ["Standard-IA: 30-day minimum", "One Zone-IA: one AZ, recreatable data", "Retrieval fee per GB"] },
          { title: "Archive", points: ["Glacier Instant: milliseconds, 90 days", "Glacier Flexible: minutes to hours", "Deep Archive: 12 to 48 hours", "Deep Archive is cheapest"] },
        ],
      },
      {
        type: "flow",
        title: "A typical lifecycle rule",
        steps: [
          { label: "Day 0: Standard", detail: "New uploads are read often." },
          { label: "Day 30: Standard-IA", detail: "Reads drop but must stay instant." },
          { label: "Day 90: Glacier Flexible", detail: "Kept for audits, hours to restore." },
          { label: "Day 365: Deep Archive", detail: "Long-term compliance retention." },
          { label: "Year 7: Expire", detail: "Delete when retention ends." },
        ],
      },
    ],
    keyPoints: [
      "Use Intelligent-Tiering when access patterns are unknown or change.",
      "Same-Region and cross-Region replication both require versioning on source and destination.",
      "MFA delete and Object Lock protect against accidental or malicious deletion.",
      "Replication copies new objects; use Batch Replication for existing ones.",
      "Use multipart upload for large objects, recommended above 100 MB.",
    ],
    terms: [
      { term: "Bucket", meaning: "Container for objects with a globally unique name." },
      { term: "Lifecycle rule", meaning: "Policy to transition or expire objects by age." },
      { term: "Versioning", meaning: "Keeps every version of an object, including deletes." },
      { term: "CRR", meaning: "Cross-Region Replication to a bucket in another Region." },
      { term: "Object Lock", meaning: "WORM protection that blocks deletion for a retention period." },
    ],
    example: {
      lang: "json",
      code: "{\"Rules\": [{\n  \"ID\": \"tier-logs\",\n  \"Filter\": {\"Prefix\": \"logs/\"},\n  \"Status\": \"Enabled\",\n  \"Transitions\": [\n    {\"Days\": 30, \"StorageClass\": \"STANDARD_IA\"},\n    {\"Days\": 90, \"StorageClass\": \"GLACIER\"}\n  ],\n  \"Expiration\": {\"Days\": 2555}\n}]}",
      caption: "Lifecycle config for aws s3api put-bucket-lifecycle-configuration.",
    },
    pitfalls: [
      "Moving tiny or short-lived objects to IA classes and paying minimum size and duration charges.",
      "Choosing One Zone-IA for data that cannot be recreated.",
    ],
    check: [
      { q: "Compliance data is rarely read and may take 48 hours to retrieve. Cheapest class?", a: "S3 Glacier Deep Archive." },
      { q: "What must be enabled before configuring cross-Region replication?", a: "Versioning on both the source and destination buckets." },
      { q: "Access patterns are unpredictable and you want automatic savings. Which class?", a: "S3 Intelligent-Tiering, which moves objects between tiers based on access." },
    ],
  },

  "aws-storage/s3-security": {
    summary:
      "S3 access is controlled by IAM policies, bucket policies and Block Public Access, with ACLs disabled by default. Access points give each application its own policy and endpoint on a shared bucket. Presigned URLs grant time-limited access to one object without sharing credentials.",
    visuals: [
      {
        type: "sequence",
        title: "Presigned URL download",
        actors: ["User browser", "App server", "Amazon S3"],
        messages: [
          { from: 0, to: 1, label: "Request a private file" },
          { from: 1, to: 1, label: "Check user, sign URL with role" },
          { from: 1, to: 0, label: "Return presigned URL" },
          { from: 0, to: 2, label: "GET object with signature" },
          { from: 2, to: 0, label: "Object if signature valid" },
        ],
      },
    ],
    keyPoints: [
      "Block Public Access is on by default for new buckets; leave it on unless truly public.",
      "Bucket policies can enforce TLS, encryption or access only from a VPC endpoint.",
      "A presigned URL carries the signer's permissions and expires after a set time.",
      "Use CloudFront with origin access control for public websites instead of public buckets.",
    ],
    terms: [
      { term: "Bucket policy", meaning: "Resource-based JSON policy attached to a bucket." },
      { term: "Block Public Access", meaning: "Account or bucket setting that overrides public grants." },
      { term: "Access point", meaning: "Named endpoint with its own policy for a bucket." },
      { term: "Presigned URL", meaning: "Time-limited signed link to a specific object operation." },
      { term: "Object Ownership", meaning: "Setting that disables ACLs so the bucket owner owns all objects." },
    ],
    example: {
      lang: "json",
      code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"DenyInsecureTransport\",\n    \"Effect\": \"Deny\",\n    \"Principal\": \"*\",\n    \"Action\": \"s3:*\",\n    \"Resource\": [\"arn:aws:s3:::my-bucket\", \"arn:aws:s3:::my-bucket/*\"],\n    \"Condition\": {\"Bool\": {\"aws:SecureTransport\": \"false\"}}\n  }]\n}",
      caption: "Bucket policy that rejects any request not using HTTPS.",
    },
    pitfalls: [
      "Making a bucket public to share one file; use a presigned URL.",
      "Writing the bucket ARN without /* and so missing object-level actions.",
    ],
    check: [
      { q: "Paying users must download private files for 15 minutes. What do you use?", a: "Generate S3 presigned URLs that expire after 15 minutes." },
      { q: "Many teams share one data lake bucket with different permissions. What simplifies this?", a: "S3 access points, each with its own access point policy." },
    ],
  },

  "aws-storage/block-file": {
    summary:
      "EBS volumes are network block disks for one EC2 instance in one AZ, while instance store is fast local disk that disappears on stop. EFS is a managed NFS file system shared by many Linux clients across AZs. FSx offers managed Windows, Lustre, NetApp ONTAP and OpenZFS file systems.",
    visuals: [
      {
        type: "compare",
        title: "EBS vs instance store vs EFS",
        columns: [
          { title: "EBS", points: ["Block storage, one AZ", "Persists after stop", "Snapshots to S3", "gp3, io2, st1, sc1 types"] },
          { title: "Instance store", points: ["Physically attached disk", "Highest IOPS, low latency", "Lost on stop or failure", "Caches, buffers, scratch"] },
          { title: "EFS", points: ["NFS file system", "Thousands of Linux clients", "Multi-AZ, grows automatically", "IA tiers via lifecycle"] },
        ],
      },
      {
        type: "tree",
        title: "File storage choices",
        root: "Shared file storage",
        children: [
          { label: "Linux NFS", children: ["Amazon EFS"] },
          { label: "Windows SMB", children: ["FSx for Windows File Server", "Active Directory integration"] },
          { label: "HPC and ML", children: ["FSx for Lustre", "Links to S3 data"] },
          { label: "Multi-protocol or migration", children: ["FSx for NetApp ONTAP", "FSx for OpenZFS"] },
        ],
      },
    ],
    keyPoints: [
      "gp3 is the default general-purpose SSD with IOPS set independently of size.",
      "io2 Block Express gives the highest IOPS and supports Multi-Attach.",
      "st1 and sc1 HDD volumes cannot be boot volumes.",
      "To move an EBS volume to another AZ, snapshot it and restore there.",
    ],
    terms: [
      { term: "gp3", meaning: "General-purpose SSD EBS with configurable IOPS and throughput." },
      { term: "io2", meaning: "Provisioned IOPS SSD for critical databases." },
      { term: "EBS snapshot", meaning: "Incremental point-in-time backup stored in S3." },
      { term: "EFS", meaning: "Elastic managed NFS for Linux." },
      { term: "FSx for Lustre", meaning: "High-performance file system for HPC." },
    ],
    pitfalls: [
      "Choosing EFS for Windows servers; Windows needs FSx for Windows File Server.",
      "Storing irreplaceable data only on instance store.",
    ],
    check: [
      { q: "Hundreds of Linux instances across AZs need the same files. What do you use?", a: "Amazon EFS mounted over NFS from every instance." },
      { q: "An HPC job needs a fast parallel file system backed by S3 data. What fits?", a: "Amazon FSx for Lustre linked to the S3 bucket." },
    ],
  },

  "aws-storage/migration-storage": {
    summary:
      "Storage Gateway lets on-premises apps use AWS storage through file, volume or tape interfaces. DataSync moves large datasets online quickly and securely, while Snowball Edge devices ship data physically when the network is too slow. AWS Backup centralizes backup policies across services and accounts.",
    visuals: [
      {
        type: "compare",
        title: "Moving data to AWS",
        columns: [
          { title: "DataSync", points: ["Online transfer over network", "NFS, SMB, HDFS, object stores", "Scheduled, verified copies", "One-time or recurring"] },
          { title: "Snowball Edge", points: ["Offline rugged device", "Tens of TB per device", "When network takes weeks", "Edge compute option"] },
          { title: "Storage Gateway", points: ["Ongoing hybrid access", "Local cache on-premises", "Data lands in S3 or EBS snapshots", "Not a one-time move"] },
        ],
      },
      {
        type: "tree",
        title: "Storage Gateway types",
        root: "Storage Gateway",
        children: [
          { label: "S3 File Gateway", children: ["NFS or SMB shares", "Files stored as S3 objects"] },
          { label: "Volume Gateway", children: ["iSCSI block volumes", "Cached or stored mode", "EBS snapshots"] },
          { label: "Tape Gateway", children: ["Virtual tape library", "Archives to Glacier classes"] },
        ],
      },
    ],
    keyPoints: [
      "If transfer over the network would take more than about a week, consider Snowball Edge.",
      "DataSync suits recurring or one-time online migrations with encryption and integrity checks.",
      "Tape Gateway replaces physical tapes without changing backup software.",
      "AWS Backup uses backup plans and vaults, including cross-Region and cross-account copies.",
    ],
    terms: [
      { term: "DataSync agent", meaning: "VM on-premises that reads source data for DataSync." },
      { term: "Snowball Edge", meaning: "Physical device for offline data transfer and edge compute." },
      { term: "Backup plan", meaning: "AWS Backup schedule and retention rules." },
      { term: "Backup vault", meaning: "Encrypted container that stores recovery points." },
      { term: "Vault Lock", meaning: "WORM setting preventing backup deletion." },
    ],
    pitfalls: [
      "Choosing Storage Gateway for a one-time bulk migration; DataSync or Snowball fit better.",
      "Ignoring the slow network math when picking an online transfer.",
    ],
    check: [
      { q: "Replace an on-premises tape library while keeping backup software. Which service?", a: "Storage Gateway in Tape Gateway mode." },
      { q: "Move 500 TB over a 100 Mbps link within two weeks. Online or offline?", a: "Offline with Snowball Edge devices, since the link would take over a year." },
      { q: "One policy must back up RDS, EBS and DynamoDB across accounts. What do you use?", a: "AWS Backup with a backup plan, ideally managed through AWS Organizations." },
    ],
  },

  // ───────────── Databases & analytics ─────────────
  "aws-databases/rds-aurora": {
    summary:
      "RDS runs managed relational engines like MySQL, PostgreSQL and SQL Server. Multi-AZ gives high availability with automatic failover, and read replicas scale reads. Aurora is AWS's cloud-native MySQL and PostgreSQL-compatible engine with shared storage replicated six ways across three AZs.",
    visuals: [
      {
        type: "compare",
        title: "Multi-AZ vs read replicas",
        columns: [
          { title: "Multi-AZ", points: ["High availability", "Synchronous standby", "Automatic DNS failover", "Standby not readable (instance mode)"] },
          { title: "Read replicas", points: ["Read scaling", "Asynchronous replication", "Readable endpoint per replica", "Can be cross-Region, promotable"] },
        ],
      },
      {
        type: "layers",
        title: "Aurora cluster",
        layers: [
          { label: "Application", detail: "Uses writer endpoint for writes, reader endpoint for reads." },
          { label: "Cluster endpoints", detail: "Writer and load-balanced reader DNS names." },
          { label: "DB instances", detail: "One writer plus up to 15 Aurora replicas." },
          { label: "Shared storage volume", detail: "Six copies across three AZs, grows automatically." },
        ],
      },
    ],
    keyPoints: [
      "Multi-AZ is for availability; read replicas are for read performance.",
      "Automated backups allow point-in-time restore within 1 to 35 days retention.",
      "Aurora Global Database replicates to other Regions with typically under 1 second lag.",
      "Aurora Serverless v2 scales capacity in fine steps for variable workloads.",
      "Restoring a backup always creates a new DB instance with a new endpoint.",
    ],
    terms: [
      { term: "Multi-AZ", meaning: "Standby copy in another AZ with automatic failover." },
      { term: "Read replica", meaning: "Asynchronous read-only copy for scaling reads." },
      { term: "PITR", meaning: "Point-in-time restore from automated backups." },
      { term: "Reader endpoint", meaning: "Aurora DNS name spreading reads across replicas." },
      { term: "Global Database", meaning: "Aurora cluster spanning Regions for DR and local reads." },
    ],
    pitfalls: [
      "Picking read replicas when the requirement is automatic failover.",
      "Assuming manual snapshots expire; they persist until you delete them.",
    ],
    check: [
      { q: "A reporting workload slows the primary database. What do you add?", a: "A read replica, and point the reporting queries at it." },
      { q: "A database must survive an AZ failure with automatic failover. What do you enable?", a: "RDS Multi-AZ, or an Aurora cluster with a replica in another AZ." },
      { q: "Need a cross-Region DR copy with RPO near 1 second. Which option?", a: "Aurora Global Database." },
    ],
  },

  "aws-databases/dynamodb": {
    summary:
      "DynamoDB is a serverless key-value and document database with single-digit millisecond latency at any scale. You design keys around access patterns, then choose on-demand or provisioned capacity. DAX adds microsecond caching and global tables give multi-Region, multi-active replication.",
    visuals: [
      {
        type: "tree",
        title: "DynamoDB table design",
        root: "Table",
        children: [
          { label: "Primary key", children: ["Partition key: spreads data", "Sort key: orders items"] },
          { label: "Items", children: ["Up to 400 KB each", "Flexible attributes"] },
          { label: "Secondary indexes", children: ["GSI: any keys, anytime", "LSI: same partition key, at creation"] },
          { label: "Add-ons", children: ["DAX cache", "Streams", "Global tables", "TTL"] },
        ],
      },
      {
        type: "compare",
        title: "Capacity modes",
        columns: [
          { title: "On-demand", points: ["Pay per request", "No capacity planning", "Unpredictable or new workloads", "Scales instantly to prior peaks"] },
          { title: "Provisioned", points: ["Set RCUs and WCUs", "Auto scaling optional", "Cheaper for steady traffic", "Reserved capacity available"] },
        ],
      },
    ],
    keyPoints: [
      "Pick a high-cardinality partition key to avoid hot partitions.",
      "One RCU is one strongly consistent 4 KB read per second, or two eventually consistent.",
      "One WCU is one 1 KB write per second.",
      "DAX caches reads in microseconds; it does not help write-heavy workloads.",
      "Global tables provide active-active replication across Regions.",
    ],
    terms: [
      { term: "Partition key", meaning: "Attribute hashed to choose the storage partition." },
      { term: "Sort key", meaning: "Orders items sharing a partition key." },
      { term: "GSI", meaning: "Global secondary index with its own keys and capacity." },
      { term: "DAX", meaning: "In-memory cache for DynamoDB reads." },
      { term: "DynamoDB Streams", meaning: "Ordered change log of item modifications." },
      { term: "TTL", meaning: "Attribute that auto-deletes expired items at no cost." },
    ],
    example: {
      lang: "bash",
      code: "aws dynamodb create-table \\\n  --table-name orders \\\n  --attribute-definitions \\\n    AttributeName=customerId,AttributeType=S \\\n    AttributeName=orderDate,AttributeType=S \\\n  --key-schema \\\n    AttributeName=customerId,KeyType=HASH \\\n    AttributeName=orderDate,KeyType=RANGE \\\n  --billing-mode PAY_PER_REQUEST",
      caption: "On-demand table keyed by customer and date.",
    },
    pitfalls: [
      "Using a low-cardinality partition key like status, creating hot partitions.",
      "Planning to add an LSI later; LSIs must be defined at table creation.",
    ],
    check: [
      { q: "A new app has unpredictable traffic. Which DynamoDB capacity mode?", a: "On-demand, which bills per request and needs no capacity planning." },
      { q: "Reads need microsecond latency on a DynamoDB table. What do you add?", a: "DynamoDB Accelerator (DAX)." },
    ],
  },

  "aws-databases/caching": {
    summary:
      "ElastiCache provides managed in-memory caches using Valkey, Redis OSS or Memcached. Caching cuts database load and latency for repeated reads. Lazy loading fills the cache on misses, while write-through updates the cache on every write.",
    visuals: [
      {
        type: "sequence",
        title: "Lazy loading (cache-aside)",
        actors: ["Application", "ElastiCache", "Database"],
        messages: [
          { from: 0, to: 1, label: "GET user:42" },
          { from: 1, to: 0, label: "Cache miss" },
          { from: 0, to: 2, label: "SELECT user 42" },
          { from: 2, to: 0, label: "Row returned" },
          { from: 0, to: 1, label: "SET user:42 with TTL" },
        ],
      },
      {
        type: "compare",
        title: "Valkey or Redis vs Memcached",
        columns: [
          { title: "Valkey or Redis OSS", points: ["Replication and Multi-AZ failover", "Persistence and backups", "Rich data types, sorted sets", "Pub/sub, leaderboards, sessions"] },
          { title: "Memcached", points: ["Simple key-value strings", "Multi-threaded", "No replication or persistence", "Easy horizontal sharding"] },
        ],
      },
    ],
    keyPoints: [
      "Lazy loading caches only requested data but serves stale data until TTL expires.",
      "Write-through keeps the cache fresh but writes data that may never be read.",
      "Always set a TTL to bound staleness and memory use.",
      "Pick Valkey or Redis when you need HA, persistence or sorted sets.",
    ],
    terms: [
      { term: "Cache hit", meaning: "Requested data found in the cache." },
      { term: "Cache miss", meaning: "Data not in cache, so the database is queried." },
      { term: "TTL", meaning: "Time after which a cache entry expires." },
      { term: "Write-through", meaning: "Update cache whenever the database is written." },
      { term: "Eviction", meaning: "Removing entries when memory is full." },
    ],
    pitfalls: [
      "Caching without TTLs and serving stale data forever.",
      "Choosing Memcached for session data that must survive a node failure.",
    ],
    check: [
      { q: "A gaming leaderboard needs sorted rankings in memory. Which engine?", a: "ElastiCache for Valkey or Redis OSS, using sorted sets." },
      { q: "What is the main drawback of lazy loading?", a: "The first read is slow after a miss, and data can be stale until it expires." },
    ],
  },

  "aws-databases/analytics": {
    summary:
      "AWS analytics services cover ingesting streams, storing data cheaply in S3, cataloging it and querying it. Kinesis Data Streams handles real-time streams, Firehose delivers them to destinations, Glue catalogs and transforms, and Athena queries S3 with SQL. Redshift is the data warehouse and OpenSearch handles search and log analytics.",
    visuals: [
      {
        type: "flow",
        title: "Streaming data lake pipeline",
        steps: [
          { label: "Producers", detail: "Apps, IoT devices and clickstreams send events." },
          { label: "Kinesis Data Streams", detail: "Real-time stream with shards and replay." },
          { label: "Firehose", detail: "Buffers, converts and delivers to S3." },
          { label: "S3 data lake", detail: "Cheap durable storage, e.g. Parquet files." },
          { label: "Glue Data Catalog", detail: "Crawlers record table schemas." },
          { label: "Athena", detail: "Serverless SQL, pay per data scanned." },
        ],
      },
      {
        type: "compare",
        title: "Query and analysis services",
        columns: [
          { title: "Athena", points: ["Ad hoc SQL on S3", "Serverless, no loading", "Pay per TB scanned"] },
          { title: "Redshift", points: ["Columnar data warehouse", "Complex BI joins at scale", "Spectrum queries S3 too"] },
          { title: "OpenSearch", points: ["Full-text search", "Log analytics dashboards", "Near real-time indexing"] },
        ],
      },
    ],
    keyPoints: [
      "Kinesis Data Streams is real-time with replay; Firehose is near real-time and fully managed.",
      "Partition and compress S3 data as Parquet to cut Athena cost and time.",
      "Glue crawlers populate the Data Catalog used by Athena, EMR and Redshift Spectrum.",
      "Use Redshift for structured BI reporting across large historical datasets.",
    ],
    terms: [
      { term: "Shard", meaning: "Throughput unit of a Kinesis data stream." },
      { term: "Firehose", meaning: "Managed delivery of streaming data to S3, Redshift and more." },
      { term: "Glue crawler", meaning: "Scans data and infers schemas into the catalog." },
      { term: "Athena", meaning: "Serverless interactive SQL over S3." },
      { term: "Redshift", meaning: "Managed petabyte-scale data warehouse." },
      { term: "OpenSearch", meaning: "Managed search and log analytics engine." },
    ],
    pitfalls: [
      "Picking Kinesis Data Streams when the requirement is just loading data into S3 with no code.",
      "Querying uncompressed CSV with Athena and paying to scan every byte.",
    ],
    check: [
      { q: "Run occasional SQL on log files in S3 with no infrastructure. Which service?", a: "Amazon Athena, using a Glue Data Catalog table." },
      { q: "Load clickstream data into S3 with minimal operations, near real time. Which service?", a: "Amazon Data Firehose." },
    ],
  },

  // ───────────── Decoupling, resilience & monitoring ─────────────
  "aws-resilience/decoupling": {
    summary:
      "Decoupling lets components fail or scale independently. SQS queues buffer work between producers and consumers, SNS pushes one message to many subscribers, and EventBridge routes events by pattern. Step Functions orchestrates multi-step workflows with retries and state.",
    visuals: [
      {
        type: "sequence",
        title: "SNS to SQS fan-out",
        actors: ["Order service", "SNS topic", "Billing queue", "Shipping queue"],
        messages: [
          { from: 0, to: 1, label: "Publish OrderPlaced" },
          { from: 1, to: 2, label: "Deliver copy" },
          { from: 1, to: 3, label: "Deliver copy" },
          { from: 2, to: 2, label: "Billing workers poll and process" },
          { from: 3, to: 3, label: "Shipping workers poll and process" },
        ],
      },
      {
        type: "compare",
        title: "Which messaging service",
        columns: [
          { title: "SQS", points: ["Queue, consumers pull", "Buffers load spikes", "Standard or FIFO", "Dead-letter queues"] },
          { title: "SNS", points: ["Pub/sub push", "Fan-out to many", "SQS, Lambda, HTTP, email", "Filter policies"] },
          { title: "EventBridge", points: ["Event bus with rules", "Content-based routing", "SaaS and AWS events", "Schedules and archive"] },
        ],
      },
    ],
    keyPoints: [
      "SQS Standard gives at-least-once delivery; FIFO gives ordering and exactly-once processing.",
      "Visibility timeout hides a message while a consumer works on it.",
      "Messages that fail repeatedly go to a dead-letter queue for inspection.",
      "Scale consumers on queue depth with an Auto Scaling target tracking policy.",
      "Step Functions Standard suits long workflows; Express suits high-volume short ones.",
    ],
    terms: [
      { term: "Visibility timeout", meaning: "Time a received message stays hidden from other consumers." },
      { term: "DLQ", meaning: "Dead-letter queue for messages that keep failing." },
      { term: "Fan-out", meaning: "One message delivered to many subscribers." },
      { term: "Event pattern", meaning: "EventBridge rule filter that matches events." },
      { term: "State machine", meaning: "Step Functions workflow definition." },
    ],
    pitfalls: [
      "Using SNS alone when consumers may be offline; add SQS to persist messages.",
      "Setting visibility timeout shorter than processing time, causing duplicates.",
    ],
    check: [
      { q: "Orders must be processed in exact order without duplicates. Which queue?", a: "An SQS FIFO queue." },
      { q: "One event must trigger billing, shipping and analytics independently. Pattern?", a: "SNS fan-out to separate SQS queues, or an EventBridge rule with multiple targets." },
      { q: "A web tier overwhelms a slow backend during spikes. What fixes it?", a: "Put an SQS queue between them so the backend processes at its own pace." },
    ],
  },

  "aws-resilience/dr": {
    summary:
      "Disaster recovery strategies trade cost against recovery speed. RTO is how long you can be down and RPO is how much data you can lose. The four AWS strategies range from cheap backup and restore to near-zero downtime multi-site active-active.",
    visuals: [
      {
        type: "flow",
        title: "DR strategies: cost rises, RTO falls",
        steps: [
          { label: "Backup and restore", detail: "Restore from backups. RTO and RPO in hours. Cheapest." },
          { label: "Pilot light", detail: "Data replicated, core services off. RTO tens of minutes." },
          { label: "Warm standby", detail: "Scaled-down full copy running. Scale up in minutes." },
          { label: "Multi-site active-active", detail: "Full capacity in two Regions. Near-zero RTO, highest cost." },
        ],
      },
    ],
    keyPoints: [
      "RTO measures downtime; RPO measures data loss back to the last good copy.",
      "Pick the cheapest strategy that still meets both stated RTO and RPO.",
      "Pilot light keeps databases replicating but app servers off or minimal.",
      "Use Route 53 failover routing to shift users to the recovery Region.",
      "Test DR regularly; an untested plan is a guess.",
    ],
    terms: [
      { term: "RTO", meaning: "Recovery time objective: maximum acceptable downtime." },
      { term: "RPO", meaning: "Recovery point objective: maximum acceptable data loss." },
      { term: "Pilot light", meaning: "Minimal core running, rest provisioned on failover." },
      { term: "Warm standby", meaning: "Smaller always-on copy that scales up on failover." },
      { term: "Active-active", meaning: "Both sites serve live traffic all the time." },
    ],
    pitfalls: [
      "Choosing multi-site when the requirement allows hours of downtime.",
      "Keeping backups only in the primary Region.",
    ],
    check: [
      { q: "RTO 4 hours, RPO 24 hours, lowest cost. Which strategy?", a: "Backup and restore." },
      { q: "RTO of a few minutes with a smaller always-running copy. Which strategy?", a: "Warm standby." },
    ],
  },

  "aws-resilience/monitoring": {
    summary:
      "CloudWatch collects metrics and logs and raises alarms that trigger actions. CloudTrail records who called which AWS API and when. AWS Config records resource configuration over time and checks it against compliance rules.",
    visuals: [
      {
        type: "compare",
        title: "Which monitoring service",
        columns: [
          { title: "CloudWatch", points: ["Performance metrics", "Logs and Logs Insights", "Alarms and dashboards", "What is happening now"] },
          { title: "CloudTrail", points: ["API call history", "Who did what, when", "90-day event history free", "Trails to S3 for longer"] },
          { title: "AWS Config", points: ["Resource config history", "Compliance rules", "Auto remediation", "What changed and is it allowed"] },
        ],
      },
      {
        type: "cycle",
        title: "Alarm-driven operations",
        steps: [
          { label: "Publish metric", detail: "Service or agent sends data points." },
          { label: "Evaluate alarm", detail: "Threshold breached for N periods." },
          { label: "Take action", detail: "Notify SNS, scale ASG or recover EC2." },
          { label: "Return to OK", detail: "Metric recovers and alarm state resets." },
        ],
      },
    ],
    keyPoints: [
      "EC2 memory and disk usage need the CloudWatch agent; they are not default metrics.",
      "Create an organization trail to log all accounts into one S3 bucket.",
      "Use Config rules to detect, for example, unencrypted EBS volumes.",
      "EventBridge can react to CloudTrail API events in near real time.",
    ],
    terms: [
      { term: "Metric", meaning: "Time-ordered set of data points, like CPUUtilization." },
      { term: "Alarm", meaning: "Watches a metric and acts when a threshold is crossed." },
      { term: "Logs Insights", meaning: "Query language for CloudWatch Logs." },
      { term: "Trail", meaning: "CloudTrail configuration delivering events to S3." },
      { term: "Config rule", meaning: "Check that marks resources compliant or not." },
    ],
    example: {
      lang: "bash",
      code: "aws cloudwatch put-metric-alarm \\\n  --alarm-name web-high-cpu \\\n  --namespace AWS/EC2 --metric-name CPUUtilization \\\n  --dimensions Name=InstanceId,Value=i-0abc123 \\\n  --statistic Average --period 300 \\\n  --evaluation-periods 2 --threshold 80 \\\n  --comparison-operator GreaterThanThreshold \\\n  --alarm-actions arn:aws:sns:us-east-1:123456789012:ops",
      caption: "Alarm when average CPU stays above 80 percent for 10 minutes.",
    },
    pitfalls: [
      "Using CloudTrail to monitor CPU, or CloudWatch to find who deleted a bucket.",
      "Expecting memory metrics from EC2 without installing the agent.",
    ],
    check: [
      { q: "Who terminated an EC2 instance yesterday? Which service tells you?", a: "AWS CloudTrail, which records the TerminateInstances API call and caller." },
      { q: "Continuously flag S3 buckets without encryption. Which service?", a: "AWS Config with a managed rule, optionally with auto remediation." },
    ],
  },

  // ───────────── Cost-optimised architectures ─────────────
  "aws-cost/pricing-models": {
    summary:
      "EC2 and other compute can be bought On-Demand, with commitments, or as spare Spot capacity. Savings Plans and Reserved Instances cut cost for steady usage in exchange for a 1 or 3 year commitment. Spot is the cheapest but can be reclaimed with a two-minute warning.",
    visuals: [
      {
        type: "compare",
        title: "Compute purchase options",
        columns: [
          { title: "On-Demand", points: ["Pay per second", "No commitment", "Short, spiky, unknown loads", "Highest unit price"] },
          { title: "Savings Plans and RIs", points: ["1 or 3 year commitment", "Up to about 72 percent off", "Steady baseline usage", "Compute SP covers Fargate, Lambda"] },
          { title: "Spot", points: ["Up to 90 percent off", "Two-minute interruption notice", "Fault-tolerant batch, CI, stateless", "Never for critical singletons"] },
        ],
      },
    ],
    keyPoints: [
      "Cover the steady baseline with Savings Plans and burst with On-Demand or Spot.",
      "Compute Savings Plans apply across instance families, Regions, Fargate and Lambda.",
      "Zonal Reserved Instances or On-Demand Capacity Reservations guarantee capacity in an AZ.",
      "Mix Spot and On-Demand in one ASG using a mixed instances policy.",
    ],
    terms: [
      { term: "On-Demand", meaning: "Pay-as-you-go pricing with no commitment." },
      { term: "Savings Plan", meaning: "Hourly spend commitment for discounted compute." },
      { term: "Reserved Instance", meaning: "Discount for committing to an instance configuration." },
      { term: "Spot Instance", meaning: "Spare capacity at deep discount, interruptible." },
      { term: "Dedicated Host", meaning: "Physical server for licensing or compliance needs." },
    ],
    pitfalls: [
      "Running a production database on Spot.",
      "Buying 3-year commitments for a workload you plan to retire soon.",
    ],
    check: [
      { q: "A nightly batch job can restart if interrupted. Cheapest option?", a: "Spot Instances." },
      { q: "Steady usage will shift between EC2, Fargate and Lambda. Which commitment?", a: "A Compute Savings Plan, which applies across all three." },
    ],
  },

  "aws-cost/cost-tools": {
    summary:
      "AWS cost tools help you see, attribute and reduce spend. Cost Explorer visualizes and forecasts costs, Budgets alerts on thresholds, cost allocation tags attribute spend to teams, and Compute Optimizer recommends right-sizing. Using them continuously keeps bills predictable.",
    visuals: [
      {
        type: "cycle",
        title: "Cost management loop",
        steps: [
          { label: "Tag resources", detail: "Activate cost allocation tags like team and env." },
          { label: "Analyze spend", detail: "Cost Explorer groups cost by service and tag." },
          { label: "Set budgets", detail: "Alert or act when thresholds are crossed." },
          { label: "Right-size", detail: "Apply Compute Optimizer and Trusted Advisor findings." },
          { label: "Review monthly", detail: "Track savings and repeat." },
        ],
      },
    ],
    keyPoints: [
      "Tags must be activated as cost allocation tags in Billing before they appear in reports.",
      "Budgets can trigger actions, such as applying an SCP or stopping instances.",
      "Compute Optimizer uses CloudWatch metrics to suggest smaller or different instance types.",
      "Cost Anomaly Detection flags unusual spend automatically.",
    ],
    terms: [
      { term: "Cost Explorer", meaning: "Visualize, filter and forecast AWS costs." },
      { term: "AWS Budgets", meaning: "Thresholds with alerts and optional actions." },
      { term: "Cost allocation tag", meaning: "Tag key used to split costs in billing reports." },
      { term: "Compute Optimizer", meaning: "ML-based right-sizing recommendations." },
      { term: "Cost and Usage Report", meaning: "Most detailed billing data, delivered to S3." },
    ],
    pitfalls: [
      "Tagging resources but never activating the tags for cost allocation.",
      "Setting budgets with no one subscribed to the alerts.",
    ],
    check: [
      { q: "How do you see monthly cost per team?", a: "Tag resources with a team key, activate it as a cost allocation tag, and group by it in Cost Explorer." },
      { q: "Which service recommends smaller EC2 instance types based on usage?", a: "AWS Compute Optimizer." },
    ],
  },

  "aws-cost/cost-design": {
    summary:
      "The cheapest architecture often comes from design choices, not discounts. Move cold data to cheaper storage tiers, keep traffic inside an AZ or behind CloudFront, and use serverless or managed services where usage is low or spiky. The exam rewards the option that meets requirements at the lowest cost.",
    visuals: [
      {
        type: "tree",
        title: "Design levers for cost",
        root: "Reduce cost",
        children: [
          { label: "Storage", children: ["Lifecycle to IA and Glacier", "Intelligent-Tiering", "gp3 instead of gp2", "Delete old snapshots"] },
          { label: "Data transfer", children: ["CloudFront for egress", "Gateway endpoints, not NAT", "Same-AZ traffic", "Compress payloads"] },
          { label: "Compute", children: ["Lambda for spiky loads", "Fargate for small services", "Graviton instances", "Stop idle dev resources"] },
        ],
      },
    ],
    keyPoints: [
      "Inbound data transfer is free; outbound to the internet and cross-AZ traffic cost money.",
      "CloudFront egress is usually cheaper than serving directly from EC2 or S3.",
      "Serverless costs nothing when idle, so it wins for low or bursty traffic.",
      "Replace NAT traffic to S3 and DynamoDB with free gateway endpoints.",
    ],
    terms: [
      { term: "Data transfer out", meaning: "Charged traffic leaving AWS to the internet." },
      { term: "Inter-AZ transfer", meaning: "Charged traffic between AZs in a Region." },
      { term: "NAT processing fee", meaning: "Per-GB charge for traffic through a NAT gateway." },
      { term: "Right-sizing", meaning: "Matching resource size to actual usage." },
    ],
    pitfalls: [
      "Over-optimizing cost and dropping Multi-AZ when high availability is required.",
      "Ignoring data transfer when comparing architectures.",
    ],
    check: [
      { q: "An API gets a few hundred requests per day. Cheapest compute?", a: "Lambda behind API Gateway, since you pay only per request." },
      { q: "Private instances move terabytes to S3 through NAT. How do you cut cost?", a: "Add an S3 gateway endpoint so traffic skips the NAT gateway's per-GB charge." },
    ],
  },

  // ───────────── Practice exams & review ─────────────
  "aws-exam-prep/official-practice": {
    summary:
      "AWS publishes official sample questions and a practice question set on Skill Builder that match the real exam style. Use them to calibrate, then log every miss by domain and service. The explanations matter more than the score.",
    visuals: [
      {
        type: "cycle",
        title: "Learn from every question",
        steps: [
          { label: "Answer", detail: "Commit to an answer before checking." },
          { label: "Check explanation", detail: "Read why each option is right or wrong." },
          { label: "Log the miss", detail: "Record domain, service and the misread keyword." },
          { label: "Read the docs", detail: "Look up the FAQ or user guide section." },
          { label: "Retest later", detail: "Re-answer missed questions after a few days." },
        ],
      },
    ],
    keyPoints: [
      "Official questions show the real tone, length and distractor style.",
      "A miss log by domain reveals patterns that a single score hides.",
      "Read explanations for correct answers too; lucky guesses hide gaps.",
    ],
    terms: [
      { term: "Skill Builder", meaning: "AWS training platform with official practice sets." },
      { term: "Distractor", meaning: "Plausible wrong answer option." },
      { term: "Miss log", meaning: "Record of wrong answers and why." },
    ],
    pitfalls: [
      "Memorizing answers instead of understanding the reasoning.",
      "Taking the official set too early, wasting its calibration value.",
    ],
    check: [
      { q: "Why log misses by domain?", a: "It shows which exam domains need targeted study instead of rereading everything." },
      { q: "Should you review questions you answered correctly?", a: "Yes, because some correct answers were guesses that still hide gaps." },
    ],
  },

  "aws-exam-prep/timed-exams": {
    summary:
      "Full timed practice exams build the stamina and pacing the real 130-minute exam needs. Sit each one in a single session, then review every question. Consistent scores above 80 percent across different exam sets are a good sign you are ready.",
    visuals: [
      {
        type: "flow",
        title: "One practice exam session",
        steps: [
          { label: "Set up conditions", detail: "Quiet room, no notes, 130-minute timer." },
          { label: "First pass", detail: "Answer everything, flag uncertain questions." },
          { label: "Second pass", detail: "Revisit flagged questions with remaining time." },
          { label: "Full review", detail: "Study every explanation, right and wrong." },
          { label: "Record domain scores", detail: "Track trends across exams." },
        ],
      },
    ],
    keyPoints: [
      "Budget about two minutes per question across 65 questions.",
      "Review takes as long as the exam itself; schedule time for it.",
      "Use different question sources so you test understanding, not memory.",
      "Aim for 80 percent or higher on several fresh exams before booking.",
    ],
    terms: [
      { term: "Pacing", meaning: "Keeping a steady time per question." },
      { term: "Flag for review", meaning: "Mark a question to revisit later." },
      { term: "Domain score", meaning: "Your percentage within one exam domain." },
    ],
    pitfalls: [
      "Retaking the same practice exam and mistaking memory for readiness.",
      "Pausing exams midway, which hides stamina problems.",
    ],
    check: [
      { q: "How much time per question should you budget?", a: "About two minutes, leaving time for a second pass on flagged questions." },
      { q: "What signals exam readiness?", a: "Consistent scores of about 80 percent or more on fresh, timed practice exams." },
    ],
  },

  "aws-exam-prep/weak-areas": {
    summary:
      "After practice exams, rank domains by score and target the weakest first. Reread the service FAQs and docs, then rebuild a small lab so the service feels concrete. Retest with focused questions to confirm the gap is closed.",
    visuals: [
      {
        type: "cycle",
        title: "Close a weak area",
        steps: [
          { label: "Rank domains", detail: "Sort by practice exam score, lowest first." },
          { label: "Reread docs", detail: "Service FAQs and decision guides." },
          { label: "Re-lab", detail: "Build a small hands-on version." },
          { label: "Targeted retest", detail: "Answer 20 questions on that topic." },
        ],
      },
    ],
    keyPoints: [
      "AWS service FAQs are dense with exam-style facts and limits.",
      "A short lab fixes confusion faster than more reading.",
      "Retest until the weak domain scores near your strongest one.",
    ],
    terms: [
      { term: "Service FAQ", meaning: "AWS page answering common service questions." },
      { term: "Decision guide", meaning: "AWS doc comparing options for a use case." },
      { term: "Targeted retest", meaning: "Questions limited to one weak topic." },
    ],
    pitfalls: [
      "Studying favorite topics instead of the weakest ones.",
      "Skipping labs because they feel slow.",
    ],
    check: [
      { q: "Your resilience score is 62 percent and others are above 80. What next?", a: "Reread DR, decoupling and Multi-AZ docs, build a small lab, then retest that domain." },
      { q: "Why rebuild a lab for a weak service?", a: "Hands-on use makes limits and behavior memorable, which helps with scenario questions." },
    ],
  },

  "aws-exam-prep/exam-strategy": {
    summary:
      "Most SAA-C03 questions hinge on a keyword like least operational overhead, most cost-effective or highest availability. Map these keywords to services and eliminate options that break any stated requirement. Flag hard questions and come back instead of stalling.",
    visuals: [
      {
        type: "tree",
        title: "Keyword cheat sheet",
        root: "Scenario keyword",
        children: [
          { label: "Least operational overhead", children: ["Managed or serverless", "Fargate, Lambda, Aurora"] },
          { label: "Most cost-effective", children: ["Spot, Savings Plans", "S3 IA or Glacier"] },
          { label: "Decouple components", children: ["SQS, SNS, EventBridge"] },
          { label: "Real-time streaming", children: ["Kinesis Data Streams"] },
          { label: "Static IP, global users", children: ["Global Accelerator"] },
          { label: "Hybrid file access", children: ["Storage Gateway"] },
        ],
      },
      {
        type: "flow",
        title: "Answering a scenario",
        steps: [
          { label: "Read the last line", detail: "Find what is actually asked." },
          { label: "Underline requirements", detail: "Cost, availability, latency, operations." },
          { label: "Eliminate violators", detail: "Drop options breaking any requirement." },
          { label: "Pick the best fit", detail: "Prefer managed and simplest valid option." },
        ],
      },
    ],
    keyPoints: [
      "Eliminate options that fail any requirement before comparing the rest.",
      "When two answers work, the keyword decides: cost, speed or operational effort.",
      "Custom scripts on EC2 are rarely right when a managed feature exists.",
      "Flag and move on after about two minutes; return in the second pass.",
    ],
    terms: [
      { term: "Operational overhead", meaning: "Ongoing effort to run, patch and scale." },
      { term: "Elimination", meaning: "Removing options that break a requirement." },
      { term: "Flag and return", meaning: "Skip a hard question and revisit later." },
    ],
    pitfalls: [
      "Choosing the most powerful option when the question asks for cheapest.",
      "Missing words like NOT or LEAST in the question stem.",
    ],
    check: [
      { q: "Two options both work; one uses Lambda, one uses EC2 with cron. The question says least operational overhead. Pick?", a: "The Lambda option, because it has no servers to manage." },
      { q: "What should you do with a question that stumps you after two minutes?", a: "Pick a best guess, flag it, and return in the second pass." },
    ],
  },
};

export default explainers;
