import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws/aws-iam": {
    plain: [
      "IAM (Identity and Access Management) is the part of AWS that answers one question for every request: is this caller allowed to do this action on this thing? It does not matter if the request comes from the web console, the CLI, a Python script or another AWS service. Every call is checked.",
      "The starting answer is always no. Nothing is allowed until a policy says yes. A policy is a small JSON document with a list of allowed or denied actions, such as s3:GetObject, and the resources they apply to, such as one bucket.",
      "There are two main kinds of identity. A user is a long-lived identity, usually a person, with a password or access keys. A role has no password at all: a person or a service steps into it for a short time and gets temporary keys that expire on their own.",
      "Least privilege means giving each identity only what its job needs. A backup script needs to write to one bucket, not to delete your databases. If its keys ever leak, the damage stays small.",
      "The root user is the email address that created the account. It can do everything, including closing the account. Turn on MFA for it, do not create access keys for it, and use it only for the few tasks that truly need it.",
    ],
    deepDive: [
      {
        heading: "How AWS decides allow or deny",
        body: "For each request AWS collects every policy that applies: the caller's identity policies, the resource's own policy (for example a bucket policy), and any guard rails set above the account, such as Service Control Policies (SCPs) in AWS Organizations or a permissions boundary on the role.\n\nThe rules are simple. First, if any policy has an explicit Deny that matches, the answer is deny, full stop. Second, if a guard rail like an SCP or boundary does not allow the action, the answer is deny, because these only set a maximum and never grant anything. Third, if an identity policy or a resource policy allows it, the answer is allow. Otherwise the request ends in an implicit deny.\n\nThis is why adding a new Allow can never undo a Deny, and why an admin in a member account can still be blocked by an SCP from the organization.",
        bullets: ["Explicit deny beats every allow", "SCPs and permissions boundaries limit, they never grant", "No matching allow means implicit deny"],
        visual: {
          type: "flow",
          title: "Policy evaluation for one request",
          steps: [
            { label: "Collect policies", detail: "Identity, resource, SCP, boundary, session" },
            { label: "Explicit Deny?", detail: "If any matches, the request is denied" },
            { label: "Guard rails allow?", detail: "SCP and boundary must permit the action" },
            { label: "Any Allow?", detail: "Identity or resource policy grants it" },
            { label: "Result", detail: "Allow, or implicit deny if nothing matched" },
          ],
        },
      },
      {
        heading: "Reading and writing a policy",
        body: "A policy has a Version (always \"2012-10-17\", the current language version, not a date you change) and one or more Statements. Each statement has an Effect (Allow or Deny), an Action list such as s3:PutObject, a Resource given as an ARN, and an optional Condition. An optional Sid is just a label.\n\nAn ARN (Amazon Resource Name) looks like arn:aws:service:region:account-id:resource. Some services leave parts empty: S3 bucket ARNs are arn:aws:s3:::bucket-name because bucket names are global.\n\nA classic trap: s3:ListBucket acts on the bucket ARN, while s3:GetObject and s3:PutObject act on object ARNs ending in /*. If you put only bucket-name/* in Resource, listing fails with AccessDenied.\n\nConditions make policies precise. aws:MultiFactorAuthPresent checks MFA, aws:SourceIp checks the caller's IP, aws:RequestedRegion limits regions, and s3:prefix limits which folder a user may list.",
        bullets: ["Wildcards work in actions and ARNs, like s3:Get*", "Prefer AWS managed policies to start, then write your own", "Validate new policies in the console's policy editor or with Access Analyzer"],
      },
      {
        heading: "Roles and temporary credentials",
        body: "A role has two policies. The trust policy says who may assume the role, for example the EC2 service, a Lambda function, another account, or GitHub's OIDC provider. The permissions policy says what the role can do once assumed.\n\nAssuming a role is a call to AWS STS (Security Token Service). STS checks the trust policy and returns three values: an access key ID, a secret key and a session token. They expire, by default after one hour, and the role's maximum session duration can be set from 1 to 12 hours.\n\nOn EC2 you attach the role through an instance profile. The instance metadata service (use IMDSv2, which needs a session token) hands fresh credentials to the SDK, which refreshes them before they expire. In GitHub Actions, the workflow presents a signed OIDC token and calls AssumeRoleWithWebIdentity, so no AWS keys are stored as repository secrets at all.",
        visual: {
          type: "sequence",
          title: "A CI job getting AWS access without stored keys",
          actors: ["GitHub job", "GitHub OIDC", "AWS STS", "S3"],
          messages: [
            { from: 0, to: 1, label: "Request signed ID token" },
            { from: 1, to: 0, label: "JWT with repo and branch claims" },
            { from: 0, to: 2, label: "AssumeRoleWithWebIdentity" },
            { from: 2, to: 2, label: "Check trust policy conditions" },
            { from: 2, to: 0, label: "Temporary keys, about 1 hour" },
            { from: 0, to: 3, label: "PutObject signed with temp keys" },
          ],
        },
      },
      {
        heading: "Root, users, groups and people in 2026",
        body: "Only a handful of tasks need the root user: changing the account's root email or name, closing the account, restoring permissions when every admin is locked out, and some billing settings. Protect it with MFA (AWS now requires MFA for root in most accounts and supports several devices), and keep the credentials offline.\n\nFor IAM users, attach policies to groups such as developers or readonly, then put users in groups. A group is not an identity: you cannot name it as a Principal in a policy, and groups cannot contain other groups.\n\nFor people, AWS recommends IAM Identity Center (the successor of AWS SSO) over IAM users. People sign in once, pick an account and a permission set, and receive temporary role credentials; aws configure sso sets this up for the CLI. Plain IAM users with access keys are best kept for the rare tool that cannot use roles, and their keys should be rotated.",
        bullets: ["Use aws iam generate-credential-report to see users, MFA status and key ages", "Delete access keys not used for 90 days", "One person, one identity: never share logins"],
      },
      {
        heading: "Finding the smallest policy that works",
        body: "Least privilege is a process, not a guess. Start with a narrow policy. When something fails, read the error: AccessDenied messages from many services now name the missing action and the policy type that blocked it. Add exactly that action on exactly that resource.\n\nThe IAM policy simulator, in the console or through aws iam simulate-principal-policy, tests whether a user or role would be allowed an action on a resource, without making the real call. It shows which statement allowed or denied it.\n\nIAM Access Analyzer helps from the other side. It can generate a policy from the actions a role really used in CloudTrail logs, flag unused roles, keys and permissions, and warn when a bucket or role is shared outside your account. The Last accessed tab on a user or role shows which services were used and when, so you can remove the rest.",
        bullets: ["aws sts get-caller-identity shows who you really are right now", "CloudTrail records every API call with the caller and the error code", "Review permissions on a schedule, not only when something breaks"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The least-privilege loop",
        steps: [
          { label: "Start narrow", detail: "Only the actions the task clearly needs" },
          { label: "Test", detail: "Policy simulator or a real run in dev" },
          { label: "Read AccessDenied", detail: "Note the exact action and resource" },
          { label: "Add one permission", detail: "That action, on that ARN only" },
          { label: "Review usage", detail: "Last accessed and Access Analyzer; remove unused" },
        ],
      },
      {
        type: "compare",
        title: "Three kinds of policy you will meet",
        columns: [
          { title: "Identity policy", points: ["Attached to a user, group or role", "Says what that identity can do", "No Principal field"] },
          { title: "Resource policy", points: ["Attached to a bucket, queue or key", "Has a Principal field", "Can grant access to other accounts"] },
          { title: "Trust policy", points: ["A resource policy on a role", "Says who may assume the role", "Action is sts:AssumeRole or a variant"] },
        ],
      },
    ],
    examples: [
      {
        title: "Give a new developer read-only access through a group",
        explanation: "Step 1: create a group called developers. Step 2: attach the AWS managed ReadOnlyAccess policy to the group, not to the person. Step 3: create the user and add them to the group. Step 4: give them a console password that must be changed at first sign-in, and ask them to register MFA. Step 5: later, if they need more, add a policy to the group so every developer gets the same access.",
        code: {
          lang: "bash",
          code: `aws iam create-group --group-name developers
aws iam attach-group-policy --group-name developers \\
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws iam create-user --user-name alice
aws iam add-user-to-group --group-name developers --user-name alice
aws iam create-login-profile --user-name alice \\
  --password 'Temp-Change-Me-2026!' --password-reset-required
aws iam list-attached-group-policies --group-name developers`,
        },
      },
      {
        title: "Let an EC2 app read one bucket with a role, not keys",
        explanation: "Step 1: write a trust policy that lets the EC2 service assume the role. Step 2: create the role and add an inline policy that allows s3:GetObject on acme-uploads/* only. Step 3: wrap the role in an instance profile, which is how EC2 carries a role. Step 4: attach the profile to the running instance. Step 5: on the instance, boto3 or the CLI now finds credentials automatically; there is nothing to copy or rotate.",
        code: {
          lang: "bash",
          code: `cat > trust.json <<'EOF'
{"Version": "2012-10-17", "Statement": [{"Effect": "Allow",
  "Principal": {"Service": "ec2.amazonaws.com"}, "Action": "sts:AssumeRole"}]}
EOF
aws iam create-role --role-name app-reader --assume-role-policy-document file://trust.json
aws iam put-role-policy --role-name app-reader --policy-name read-uploads \\
  --policy-document file://s3-read.json
aws iam create-instance-profile --instance-profile-name app-reader
aws iam add-role-to-instance-profile --instance-profile-name app-reader --role-name app-reader
aws ec2 associate-iam-instance-profile --instance-id i-0abc123def4567890 \\
  --iam-instance-profile Name=app-reader`,
        },
      },
    ],
    cheatSheet: [
      "aws sts get-caller-identity prints the account, user or role you are using right now",
      "Policy Version is always \"2012-10-17\"; do not change it to today's date",
      "s3:ListBucket uses arn:aws:s3:::bucket; object actions use arn:aws:s3:::bucket/*",
      "Explicit Deny wins; SCPs and permissions boundaries only cap permissions",
      "Role = trust policy (who can assume) + permissions policy (what it can do)",
      "aws iam simulate-principal-policy tests access without making the real call",
      "aws iam generate-credential-report lists every user, MFA status and access key age",
      "For people, prefer IAM Identity Center and aws configure sso over IAM user keys",
    ],
    quiz: [
      {
        q: "A user's policy allows s3:GetObject on arn:aws:s3:::reports/*, but aws s3 ls s3://reports fails. Why?",
        options: ["The bucket is in another region", "Listing needs s3:ListBucket on arn:aws:s3:::reports", "GetObject only works in the console", "The user needs MFA to list"],
        answer: 1,
        why: "ListBucket is a bucket-level action, so it needs the bucket ARN without /*.",
      },
      {
        q: "An account admin with AdministratorAccess cannot launch instances in eu-west-3. What is the most likely cause?",
        options: ["The admin needs root to use new regions", "AdministratorAccess excludes EC2", "IAM policies only work in us-east-1", "An SCP from the organization denies that region"],
        answer: 3,
        why: "SCPs set the maximum permissions for every identity in a member account, including admins.",
      },
      {
        q: "Which part of a role decides who is allowed to assume it?",
        options: ["The trust policy", "The permissions policy", "The instance profile name", "The session token"],
        answer: 0,
        why: "The trust policy is a resource policy on the role that names the allowed principals.",
      },
      {
        q: "How long do role credentials from STS last by default?",
        options: ["Forever, until deleted", "5 minutes", "One hour", "90 days"],
        answer: 2,
        why: "AssumeRole sessions default to one hour, and the role can allow up to 12 hours.",
      },
      {
        q: "What is the recommended way to give a team of engineers console and CLI access in 2026?",
        options: ["One shared IAM user per team", "The root user with MFA", "Long-lived access keys in a shared vault", "IAM Identity Center with permission sets"],
        answer: 3,
        why: "Identity Center gives each person their own sign-in and temporary role credentials.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find out which identity your CLI is using and list the managed policies attached to your user or role.",
        hint: "get-caller-identity returns an ARN; the part after user/ or role/ is the name.",
        solution: `aws sts get-caller-identity
# "Arn": "arn:aws:iam::123456789012:user/alice"
aws iam list-attached-user-policies --user-name alice
aws iam list-groups-for-user --user-name alice
# for a role: aws iam list-attached-role-policies --role-name NAME`,
      },
      {
        level: "medium",
        task: "Write a policy that lets a user list only the team-a/ folder of bucket acme-data and read or write objects only inside it. Test it with the simulator.",
        hint: "Two statements: ListBucket on the bucket with an s3:prefix condition, and Get/Put on the prefix ARN.",
        solution: `{"Version": "2012-10-17", "Statement": [
  {"Effect": "Allow", "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::acme-data",
   "Condition": {"StringLike": {"s3:prefix": ["team-a/*"]}}},
  {"Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject"],
   "Resource": "arn:aws:s3:::acme-data/team-a/*"}]}
# then:
aws iam simulate-principal-policy \\
  --policy-source-arn arn:aws:iam::123456789012:user/alice \\
  --action-names s3:GetObject s3:DeleteObject \\
  --resource-arns arn:aws:s3:::acme-data/team-a/x.csv`,
      },
      {
        level: "hard",
        task: "Write a trust policy so that only workflows on the main branch of GitHub repo acme/api can assume a deploy role through OIDC.",
        hint: "Principal is Federated with the OIDC provider ARN; check the aud and sub claims in Condition.",
        solution: `{"Version": "2012-10-17", "Statement": [{"Effect": "Allow",
  "Principal": {"Federated":
    "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"},
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {"StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:acme/api:ref:refs/heads/main"}}}]}
# without the sub check, any repo on GitHub could assume the role`,
      },
    ],
    faq: [
      { q: "What is the difference between an IAM user and an IAM role?", a: "A user is a permanent identity with a password or long-lived access keys. A role has no credentials of its own; someone assumes it and gets temporary keys that expire, which makes leaks far less dangerous." },
      { q: "Is IAM free?", a: "Yes, IAM users, groups, roles and policies cost nothing. You pay only for the AWS resources those identities use." },
      { q: "Is IAM global or per region?", a: "IAM is global: users, roles and policies apply in every region of the account. You can still limit regions inside a policy with the aws:RequestedRegion condition." },
      { q: "What should I do if I leak an access key?", a: "Deactivate and delete the key at once, create a new one if it is still needed, then check CloudTrail for what the key was used for. Roles with temporary credentials avoid this problem." },
    ],
  },

  "aws/aws-compute": {
    plain: [
      "A VPC (Virtual Private Cloud) is your own private network inside AWS. You choose its address range, split it into smaller pieces called subnets, and decide which pieces can talk to the internet. Nothing gets in unless you open a path.",
      "Each subnet lives in one availability zone (AZ), which is one or more separate data centres in a region. Teams build at least two of everything, one per AZ, so a problem in one building does not take the app down.",
      "A public subnet has a route to an internet gateway. A private subnet does not. Your load balancer goes in public subnets, and your servers go in private subnets where nobody on the internet can reach them directly.",
      "EC2 is the service for virtual servers, called instances. You pick an image (AMI) with the operating system, a size (instance type, like t3.micro), a subnet and a security group, which is a firewall that lists the traffic allowed in.",
      "An Application Load Balancer (ALB) gives users one stable address. It receives every request, checks which servers are healthy, and passes the request to one of them. If a server dies, the ALB simply stops sending it traffic.",
    ],
    deepDive: [
      {
        heading: "Planning addresses: CIDR blocks and subnets",
        body: "A VPC gets an IPv4 range written in CIDR notation, such as 10.0.0.0/16. The number after the slash says how many bits are fixed; the rest are free for hosts. A /16 gives 65,536 addresses, a /24 gives 256. AWS allows VPC sizes from /16 down to /28.\n\nUse private ranges (10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16) and pick one that does not overlap your office network or other VPCs, because overlapping ranges cannot be peered or connected later without pain.\n\nAWS reserves 5 addresses in every subnet: the first four and the last one (network address, VPC router, DNS, future use, and broadcast). So a /24 subnet has 251 usable addresses. A common starter layout is a /16 VPC with four /24 subnets: public and private in each of two AZs, leaving plenty of room to add more later.",
        visual: {
          type: "tree",
          title: "A two-AZ starter layout for 10.0.0.0/16",
          root: "VPC 10.0.0.0/16",
          children: [
            { label: "AZ a", children: ["Public 10.0.1.0/24: ALB, NAT gateway", "Private 10.0.11.0/24: app servers"] },
            { label: "AZ b", children: ["Public 10.0.2.0/24: ALB", "Private 10.0.12.0/24: app servers"] },
            { label: "Shared", children: ["Internet gateway", "Public and private route tables"] },
          ],
        },
      },
      {
        heading: "Route tables, internet gateways and NAT",
        body: "Every subnet is associated with exactly one route table. Each table always has a local route covering the VPC range, so all subnets can reach each other. The table's other routes decide where everything else goes.\n\nThe public route table sends 0.0.0.0/0 to the internet gateway (igw-...). An instance there still needs a public IP address to be reachable or to reach out. The private route table sends 0.0.0.0/0 to a NAT gateway that sits in a public subnet. NAT lets private instances start connections out, for package updates or API calls, but never accepts connections started from outside.\n\nNAT gateways are billed per hour and per GB processed, so heavy traffic to S3 through NAT gets expensive. A gateway VPC endpoint for S3 (or DynamoDB) is free and sends that traffic over AWS's network instead. For high availability, run one NAT gateway per AZ and point each private route table at the one in its own AZ.",
        visual: {
          type: "flow",
          title: "A private instance runs pip install",
          steps: [
            { label: "Instance 10.0.11.25", detail: "Opens a connection to pypi.org" },
            { label: "Private route table", detail: "0.0.0.0/0 points to the NAT gateway" },
            { label: "NAT gateway", detail: "Swaps the source for its own Elastic IP" },
            { label: "Internet gateway", detail: "Public subnet route sends it out" },
            { label: "Reply returns", detail: "NAT maps it back to 10.0.11.25" },
          ],
        },
      },
      {
        heading: "Security groups and network ACLs",
        body: "A security group (SG) is attached to a network interface, so it protects each instance, load balancer or database individually. It contains only allow rules, and it is stateful: if a request is allowed in, the reply is allowed out automatically. A new SG allows no inbound traffic and all outbound traffic. A rule's source can be a CIDR range or another security group, which is the cleanest way to say \"only the ALB may talk to the app\".\n\nA network ACL works at the subnet edge. It is stateless, so you must allow return traffic yourself, usually on ephemeral ports 1024 to 65535. Its numbered rules are checked from the lowest number up, the first match wins, and it supports Deny rules. The default NACL allows everything, and most teams leave it that way and do the real work in security groups, using NACLs only to block a known bad range.",
        visual: {
          type: "compare",
          title: "Security group vs network ACL",
          columns: [
            { title: "Security group", points: ["Attached to an instance or ENI", "Stateful: replies allowed automatically", "Allow rules only", "Can reference another SG"] },
            { title: "Network ACL", points: ["Attached to a subnet", "Stateless: allow return ports too", "Allow and Deny rules", "Lowest rule number matching wins"] },
          ],
        },
      },
      {
        heading: "Launching and reaching an EC2 instance",
        body: "An instance needs an AMI, an instance type, a subnet, security groups and, usually, an IAM role. Burstable types like t3 or t4g (ARM, often cheaper) suit small apps; they earn CPU credits while idle and spend them under load.\n\nA key pair is for SSH. AWS keeps the public key and puts it on the instance at first boot; you download the private key once and keep it with chmod 400. The login name depends on the AMI: ec2-user for Amazon Linux, ubuntu for Ubuntu.\n\nIn a private subnet you cannot SSH in from home. The modern answer is AWS Systems Manager Session Manager: the SSM agent (preinstalled on Amazon Linux and Ubuntu AMIs) connects outward, so you open a shell with aws ssm start-session and no inbound port at all. The role needs the AmazonSSMManagedInstanceCore policy.\n\nUser data is a script that runs as root on first boot, handy for installing packages. Require IMDSv2 on every instance to protect role credentials.",
        bullets: ["chmod 400 key.pem, then ssh -i key.pem ec2-user@IP", "aws ssm start-session --target i-0abc... needs no open port", "Use --metadata-options HttpTokens=required to force IMDSv2"],
      },
      {
        heading: "How an ALB routes requests",
        body: "An ALB has listeners, rules and target groups. A listener waits on a port, typically 443 with a certificate from AWS Certificate Manager (ACM), plus port 80 with a rule that redirects to HTTPS. Rules look at the host name or path, such as /api/*, and forward to a target group. A target group is a set of instances, IP addresses or Lambda functions on a given port.\n\nThe ALB must have subnets in at least two AZs. It health checks each target on a path you choose, such as /health, and only sends traffic to healthy ones. When a target is deregistered, the ALB stops new requests but waits for the deregistration delay (300 seconds by default) so running requests can finish.\n\nThe ALB ends the client's connection and opens its own to the target, so the app sees the ALB's IP. The real client IP arrives in the X-Forwarded-For header. An Auto Scaling group can register new instances in the target group automatically.",
        bullets: ["Health check path should be cheap and not depend on slow downstream calls", "Target.Timeout in target health usually means a security group or listen address problem", "Point your domain at the ALB with a Route 53 alias record"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "One HTTPS request through the ALB",
        actors: ["Browser", "ALB", "EC2 app", "Target group"],
        messages: [
          { from: 1, to: 2, label: "Health check GET /health every few seconds" },
          { from: 2, to: 1, label: "200 OK, marked healthy" },
          { from: 0, to: 1, label: "HTTPS GET /api/orders on 443" },
          { from: 1, to: 3, label: "Rule /api/* picks the api target group" },
          { from: 1, to: 2, label: "HTTP to port 8000, X-Forwarded-For added" },
          { from: 2, to: 1, label: "200 with JSON" },
          { from: 1, to: 0, label: "Response over the TLS connection" },
        ],
      },
    ],
    examples: [
      {
        title: "Build the network skeleton with the CLI",
        explanation: "Step 1: create the VPC and keep its ID. Step 2: create a public subnet in one AZ. Step 3: create an internet gateway and attach it to the VPC. Step 4: create a route table with a default route to the gateway. Step 5: associate it with the subnet, which is the moment the subnet becomes public. Repeat steps 2 and 5 for a second AZ, and build private subnets with their own route table pointing at a NAT gateway. In real projects you would write this in Terraform, but doing it once by hand shows what each piece is.",
        code: {
          lang: "bash",
          code: `VPC=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)
PUB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.0.1.0/24 \\
  --availability-zone us-east-1a --query Subnet.SubnetId --output text)
IGW=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
RT=$(aws ec2 create-route-table --vpc-id $VPC --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
aws ec2 associate-route-table --route-table-id $RT --subnet-id $PUB
aws ec2 modify-subnet-attribute --subnet-id $PUB --map-public-ip-on-launch`,
        },
      },
      {
        title: "Debug unhealthy targets behind the ALB",
        explanation: "Users get errors and the target group shows instances as unhealthy. Step 1: read the reason code with describe-target-health. Step 2: Target.Timeout means the ALB could not connect: check that the app SG allows the app port from the ALB's SG, and that the app listens on 0.0.0.0, not 127.0.0.1. Step 3: Target.ResponseCodeMismatch means it connected but the health path returned, for example, 404 or 500: check the path and the success codes. Step 4: test from inside the instance with curl. Step 5: fix, then watch the state change to healthy after the healthy threshold is met.",
        code: {
          lang: "bash",
          code: `aws elbv2 describe-target-health --target-group-arn $TG \\
  --query 'TargetHealthDescriptions[].[Target.Id,TargetHealth.State,TargetHealth.Reason]'
aws ec2 describe-security-groups --group-ids sg-app123 \\
  --query 'SecurityGroups[0].IpPermissions'
# on the instance (via Session Manager):
ss -ltnp | grep 8000          # 127.0.0.1:8000 means only local; use --host 0.0.0.0
curl -i http://localhost:8000/health`,
        },
      },
    ],
    cheatSheet: [
      "A subnet is public only when its route table sends 0.0.0.0/0 to an internet gateway",
      "AWS reserves 5 IPs per subnet, so a /24 has 251 usable addresses",
      "Private subnets reach out through a NAT gateway; one per AZ for high availability",
      "Use a free S3 gateway endpoint to avoid NAT data charges for S3 traffic",
      "Security groups are stateful allow lists; NACLs are stateless with numbered allow and deny rules",
      "Allow the app port from the ALB's security group ID, not from 0.0.0.0/0",
      "aws ssm start-session --target INSTANCE_ID gives a shell with no SSH port open",
      "The ALB needs subnets in at least two AZs; the client IP is in X-Forwarded-For",
    ],
    quiz: [
      {
        q: "An instance in a private subnet cannot download packages. Its route table has only the local route. What is missing?",
        options: ["A default route to a NAT gateway", "A public IP on the instance", "An inbound rule for port 443", "A second availability zone"],
        answer: 0,
        why: "Outbound internet access from a private subnet goes through a NAT gateway route.",
      },
      {
        q: "How many usable IP addresses does a /26 subnet have in AWS?",
        options: ["64", "62", "32", "59"],
        answer: 3,
        why: "A /26 has 64 addresses and AWS reserves 5 of them.",
      },
      {
        q: "Your SG allows inbound 443 from anywhere and has no outbound rules removed. Do you need a rule for the reply traffic?",
        options: ["Yes, allow ephemeral ports inbound", "Yes, allow 443 outbound explicitly", "No, security groups are stateful", "Only if a NACL exists"],
        answer: 2,
        why: "Security groups track connections, so replies to allowed requests pass automatically.",
      },
      {
        q: "What is the best way to let only the load balancer reach the app on port 8000?",
        options: ["Allow 8000 from 0.0.0.0/0", "Allow 8000 from the ALB's security group", "Allow 8000 from the VPC CIDR in a NACL", "Put the app in a public subnet"],
        answer: 1,
        why: "Referencing the ALB's SG allows exactly the ALB nodes, even when their IPs change.",
      },
      {
        q: "Your app logs show the same few IPs for every request behind the ALB. Where is the real client IP?",
        options: ["In the X-Forwarded-For header", "In the TCP source address", "In the Host header", "It is lost and cannot be recovered"],
        answer: 0,
        why: "The ALB opens its own connection to the target and adds the client IP to X-Forwarded-For.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every subnet in a VPC with its CIDR, AZ and whether instances get a public IP by default.",
        hint: "describe-subnets accepts a vpc-id filter and a --query.",
        solution: `aws ec2 describe-subnets --filters Name=vpc-id,Values=vpc-0abc123 \\
  --query 'Subnets[].[SubnetId,CidrBlock,AvailabilityZone,MapPublicIpOnLaunch]' \\
  --output table`,
      },
      {
        level: "medium",
        task: "Create an app security group that accepts port 8000 only from the ALB's security group, then launch a t3.micro into a private subnet with it, IMDSv2 required and no public IP.",
        hint: "Use --source-group for the ingress rule; run-instances takes --metadata-options and --no-associate-public-ip-address.",
        solution: `APP=$(aws ec2 create-security-group --group-name app-sg --description "app" \\
  --vpc-id vpc-0abc123 --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $APP \\
  --protocol tcp --port 8000 --source-group sg-alb456
aws ec2 run-instances --image-id ami-0abc123 --instance-type t3.micro \\
  --subnet-id subnet-priv1 --security-group-ids $APP --no-associate-public-ip-address \\
  --iam-instance-profile Name=app-reader \\
  --metadata-options HttpTokens=required,HttpEndpoint=enabled`,
      },
      {
        level: "hard",
        task: "Put an ALB in front of the instance: target group with a /health check, register the instance, and an HTTP listener on port 80. Then check target health.",
        hint: "Order: create-target-group, register-targets, create-load-balancer with two public subnets, create-listener forwarding to the target group.",
        solution: `TG=$(aws elbv2 create-target-group --name api-tg --protocol HTTP --port 8000 \\
  --vpc-id vpc-0abc123 --health-check-path /health \\
  --query 'TargetGroups[0].TargetGroupArn' --output text)
aws elbv2 register-targets --target-group-arn $TG --targets Id=i-0abc123def4567890
LB=$(aws elbv2 create-load-balancer --name api-alb --subnets subnet-pub1 subnet-pub2 \\
  --security-groups sg-alb456 --query 'LoadBalancers[0].LoadBalancerArn' --output text)
aws elbv2 create-listener --load-balancer-arn $LB --protocol HTTP --port 80 \\
  --default-actions Type=forward,TargetGroupArn=$TG
aws elbv2 describe-target-health --target-group-arn $TG`,
      },
    ],
    faq: [
      { q: "What is the difference between a public and a private subnet?", a: "Nothing about the subnet itself: it is only the route table. A public subnet routes 0.0.0.0/0 to an internet gateway, and a private one does not (it may route to a NAT gateway for outbound access)." },
      { q: "Do I need a NAT gateway?", a: "Only if instances in private subnets must reach the internet, for updates or external APIs. It costs money every hour, so for S3 and DynamoDB use free gateway endpoints, and for other AWS services consider interface endpoints." },
      { q: "ALB or NLB: which load balancer should I use?", a: "Use an ALB for HTTP and HTTPS apps: it understands paths, hosts and headers. Use a Network Load Balancer for raw TCP or UDP, very high throughput, or when you need static IP addresses." },
      { q: "Why can't I SSH into my instance?", a: "Check in order: the instance has a public IP or you are on a path into the VPC, the route table, the security group allows port 22 from your IP, the right key and user name. For private instances, use Session Manager instead." },
    ],
  },

  "aws/aws-data": {
    plain: [
      "S3 (Simple Storage Service) keeps files, which AWS calls objects, inside buckets. You do not manage disks or servers: you upload a file under a name (its key) and download it later by the same name. It is used for backups, logs, user uploads, static websites and data for analytics.",
      "Storage gets expensive when nobody cleans it up. Lifecycle rules do the cleaning for you: for example, move logs to a cheaper storage class after 30 days and delete them after a year.",
      "RDS (Relational Database Service) runs a real PostgreSQL or MySQL database for you. AWS installs it, applies patches, takes backups and can keep a standby copy in another availability zone. You still design the tables and write the SQL.",
      "Lambda runs a Python function when something happens, such as a file arriving in S3. There is no server to keep running. You pay only for the time your code actually runs, measured in milliseconds.",
      "Together they make a common pattern: users upload to S3, a Lambda function processes the file, and results are saved in RDS or back in S3. Each piece scales on its own.",
    ],
    deepDive: [
      {
        heading: "How S3 really stores your data",
        body: "S3 is a key-value store, not a file system. The key photos/2026/cat.jpg is one flat name; the slashes only look like folders, and the console groups by prefix to make it feel familiar. Renaming a \"folder\" means copying every object.\n\nOne object can be up to 5 TB. A single PUT upload is limited to 5 GB, so larger files use multipart upload, which the CLI and boto3 do for you automatically above a size threshold. Since December 2020, S3 gives strong read-after-write consistency: once a write succeeds, every read sees it.\n\nS3 is designed for 99.999999999 percent (11 nines) durability by storing data across several AZs. New objects are encrypted at rest by default with SSE-S3, and Block Public Access is on by default for new buckets. Turn on versioning for important buckets: an overwrite or delete then keeps the old version, which saves you from accidents and ransomware.",
        bullets: ["Bucket names are global and part of the URL, so they must be unique and DNS friendly", "Versioning cannot be turned off once on, only suspended", "Use presigned URLs to let users upload or download without AWS keys"],
      },
      {
        heading: "Storage classes and lifecycle rules",
        body: "Each object has a storage class. S3 Standard is for data you read often. Standard-IA (infrequent access) is cheaper per GB but charges per GB retrieved and bills at least 30 days and 128 KB per object. Glacier Instant Retrieval suits archives you rarely read but need in milliseconds. Glacier Flexible Retrieval and Glacier Deep Archive are the cheapest, but you must restore an object first, which takes minutes to hours (Deep Archive up to 12 hours for standard restores, with a 180-day minimum). Intelligent-Tiering moves objects between tiers by itself for a small monitoring fee.\n\nA lifecycle rule targets objects by prefix or tag and applies transitions (change class after N days) and expirations (delete after N days). With versioning, add rules for noncurrent versions too, or old versions pile up forever. Always add a rule to abort incomplete multipart uploads after a few days: those hidden parts are billed but never shown in normal listings.",
        visual: {
          type: "flow",
          title: "A typical lifecycle for logs/",
          steps: [
            { label: "Day 0: Standard", detail: "Fresh logs, read often while debugging" },
            { label: "Day 30: Standard-IA", detail: "Rarely read, cheaper per GB" },
            { label: "Day 90: Glacier Flexible", detail: "Archive; restore before reading" },
            { label: "Day 365: Expire", detail: "Object deleted automatically" },
          ],
        },
      },
      {
        heading: "RDS PostgreSQL: what AWS runs for you",
        body: "When you create an RDS instance you choose the engine version, an instance class such as db.t4g.micro or db.m7g.large, and storage, usually gp3. AWS gives you an endpoint, a DNS name like app-db.abc123.us-east-1.rds.amazonaws.com on port 5432. You never get SSH access to the host.\n\nRDS places the database in a DB subnet group, which must cover at least two AZs; use private subnets. Automated backups keep daily snapshots plus transaction logs for 1 to 35 days, so you can restore to any second in that window (point-in-time recovery). A restore always creates a new instance.\n\nMulti-AZ keeps a synchronous standby in another AZ. If the primary fails, RDS flips the endpoint's DNS to the standby, usually within one to two minutes, so apps must reconnect. Read replicas are different: asynchronous copies you can query to spread read load. Settings such as max_connections live in a parameter group, and minor upgrades run in a maintenance window you choose.",
        bullets: ["Multi-AZ is for availability; read replicas are for read scaling", "Turn on storage encryption at creation: it cannot be enabled later in place", "Set deletion protection on production databases"],
      },
      {
        heading: "Connecting the app to RDS securely",
        body: "Three layers keep the database safe. Network: set publicly accessible to no, and let the database security group allow 5432 only from the app's security group. Transport: use TLS. RDS for PostgreSQL 15 and later sets rds.force_ssl to 1 by default, and clients should use sslmode=verify-full with the RDS CA bundle so they also check the server's identity. Credentials: never put the password in code or a Git-tracked file.\n\nThe simplest credential option is to let RDS manage the master password in Secrets Manager (the --manage-master-user-password flag), which also rotates it. Your app's role gets secretsmanager:GetSecretValue on that one secret and reads it at startup. Create a separate, less privileged database user for the app rather than using the master user.\n\nAnother option is IAM database authentication: the app calls generate_db_auth_token and uses the token as a password; it is valid for 15 minutes. For Lambda, which can open many connections quickly, put RDS Proxy in between to pool them.",
        visual: {
          type: "sequence",
          title: "App startup: fetch secret, then connect over TLS",
          actors: ["FastAPI on EC2", "Secrets Manager", "RDS Postgres"],
          messages: [
            { from: 0, to: 1, label: "GetSecretValue using the instance role" },
            { from: 1, to: 0, label: "JSON with username and password" },
            { from: 0, to: 2, label: "TCP 5432, allowed by app SG rule" },
            { from: 2, to: 0, label: "TLS handshake, server certificate" },
            { from: 0, to: 0, label: "Verify cert against RDS CA bundle" },
            { from: 0, to: 2, label: "Log in as app user, run queries" },
          ],
        },
      },
      {
        heading: "Lambda under the hood, and S3 triggers",
        body: "Lambda runs your handler inside a small execution environment. You set memory from 128 MB to 10,240 MB, and CPU grows with memory. The timeout can be up to 900 seconds (15 minutes). Each environment has /tmp storage, 512 MB by default and configurable up to 10 GB. The first call creates the environment and runs your module's top-level code; this is the cold start. Later calls reuse it, so create boto3 clients and database connections outside the handler.\n\nCode ships as a zip (50 MB zipped for direct upload, 250 MB unzipped including layers) or as a container image up to 10 GB. The function's execution role decides what AWS calls it can make, and CloudWatch Logs receives everything it prints.\n\nS3 calls Lambda asynchronously. If your function raises an error, Lambda retries twice more by default. S3 needs permission to invoke the function, a resource policy added with lambda add-permission. Object keys in the event are URL-encoded, so a space arrives as +; decode with urllib.parse.unquote_plus.",
        bullets: ["Make handlers idempotent: S3 events can be delivered more than once", "Filter the trigger by prefix and suffix, such as uploads/ and .jpg", "Use a different output prefix or bucket to avoid infinite loops"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Where each piece of the upload app lives",
        layers: [
          { label: "Users", detail: "Upload with a presigned S3 URL" },
          { label: "S3 bucket", detail: "Regional service, outside your VPC" },
          { label: "Lambda function", detail: "Runs on events; can attach to private subnets" },
          { label: "App on EC2, private subnets", detail: "Reads results and serves the API" },
          { label: "RDS, private subnets", detail: "Port 5432 open only to app and Lambda SGs" },
        ],
      },
      {
        type: "tree",
        title: "S3 storage classes by access pattern",
        root: "How often do you read it?",
        children: [
          { label: "Often", children: ["S3 Standard"] },
          { label: "About monthly", children: ["Standard-IA", "One Zone-IA for re-creatable data"] },
          { label: "Rarely, but need it fast", children: ["Glacier Instant Retrieval"] },
          { label: "Almost never", children: ["Glacier Flexible Retrieval", "Glacier Deep Archive"] },
          { label: "Unknown or changing", children: ["Intelligent-Tiering"] },
        ],
      },
    ],
    examples: [
      {
        title: "Add lifecycle rules to a logs bucket",
        explanation: "Step 1: write the rules as JSON. The first rule targets the logs/ prefix, moves objects to Standard-IA at 30 days, to Glacier Flexible Retrieval (API name GLACIER) at 90 days and deletes them at 365 days. The second rule applies to the whole bucket and cleans up unfinished multipart uploads after 7 days. Step 2: apply it with put-bucket-lifecycle-configuration, which replaces any existing rules. Step 3: read it back to confirm. Rules run once a day in the background, so changes are not instant.",
        code: {
          lang: "bash",
          code: `cat > lifecycle.json <<'EOF'
{"Rules": [
  {"ID": "logs-tiering", "Status": "Enabled", "Filter": {"Prefix": "logs/"},
   "Transitions": [{"Days": 30, "StorageClass": "STANDARD_IA"},
                   {"Days": 90, "StorageClass": "GLACIER"}],
   "Expiration": {"Days": 365}},
  {"ID": "abort-mpu", "Status": "Enabled", "Filter": {},
   "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 7}}]}
EOF
aws s3api put-bucket-lifecycle-configuration --bucket acme-logs \\
  --lifecycle-configuration file://lifecycle.json
aws s3api get-bucket-lifecycle-configuration --bucket acme-logs`,
        },
      },
      {
        title: "Deploy a Python Lambda and trigger it from S3",
        explanation: "Step 1: zip the handler file. Step 2: create the function with a Python runtime, the handler name as file.function, and an execution role that can read the bucket and write logs. Step 3: allow S3 to invoke it, limited to your bucket and account. Step 4: add the bucket notification for ObjectCreated events under uploads/. Step 5: upload a test file and read the output in CloudWatch Logs with aws logs tail.",
        code: {
          lang: "bash",
          code: `zip function.zip app.py
aws lambda create-function --function-name thumbs --runtime python3.12 \\
  --handler app.handler --zip-file fileb://function.zip --timeout 30 --memory-size 512 \\
  --role arn:aws:iam::123456789012:role/thumbs-lambda
aws lambda add-permission --function-name thumbs --statement-id s3-invoke \\
  --action lambda:InvokeFunction --principal s3.amazonaws.com \\
  --source-arn arn:aws:s3:::acme-photos --source-account 123456789012
aws s3api put-bucket-notification-configuration --bucket acme-photos \\
  --notification-configuration '{"LambdaFunctionConfigurations": [{
    "LambdaFunctionArn": "arn:aws:lambda:us-east-1:123456789012:function:thumbs",
    "Events": ["s3:ObjectCreated:*"],
    "Filter": {"Key": {"FilterRules": [{"Name": "prefix", "Value": "uploads/"}]}}}]}'
aws s3 cp cat.jpg s3://acme-photos/uploads/ && aws logs tail /aws/lambda/thumbs --follow`,
        },
      },
    ],
    cheatSheet: [
      "S3 keys are flat names; slashes only look like folders",
      "Single PUT max 5 GB, object max 5 TB; the CLI and boto3 switch to multipart for you",
      "Always add a lifecycle rule to abort incomplete multipart uploads",
      "Standard-IA bills a minimum of 30 days and 128 KB per object",
      "RDS backups: 1 to 35 days retention, restore creates a new instance",
      "Connect to RDS with sslmode=verify-full and the RDS CA bundle",
      "Lambda: 128 MB to 10,240 MB memory, max timeout 900 seconds",
      "Decode S3 event keys with urllib.parse.unquote_plus before using them",
    ],
    quiz: [
      {
        q: "A Lambda triggered by S3 fails with NoSuchKey for a file named my photo.jpg. What is the likely cause?",
        options: ["S3 has not finished writing the object", "The key in the event is URL-encoded and was not decoded", "Lambda cannot read files with spaces", "The bucket has versioning on"],
        answer: 1,
        why: "S3 events URL-encode keys, so the space arrives as + and must be decoded with unquote_plus.",
      },
      {
        q: "What does RDS Multi-AZ give you?",
        options: ["A readable copy for reporting queries", "Backups in another region", "A synchronous standby that takes over on failure", "Twice the write throughput"],
        answer: 2,
        why: "Multi-AZ is for availability; read replicas are what you query to scale reads.",
      },
      {
        q: "Your S3 bill keeps growing, but listing the bucket shows little data. What is a common hidden cause?",
        options: ["Old object versions and incomplete multipart uploads", "Block Public Access charges", "Strong consistency fees", "Bucket name length"],
        answer: 0,
        why: "Noncurrent versions and unfinished upload parts are billed but not shown in a normal listing.",
      },
      {
        q: "What is the maximum timeout for one Lambda invocation?",
        options: ["30 seconds", "5 minutes", "1 hour", "15 minutes"],
        answer: 3,
        why: "Lambda functions can run for at most 900 seconds per invocation.",
      },
      {
        q: "Where should the boto3 client be created in a Lambda handler file?",
        options: ["Inside the handler, so each call is fresh", "At module level, outside the handler", "In a separate Lambda layer only", "It must be passed in the event"],
        answer: 1,
        why: "Top-level code runs once per environment, so warm invocations reuse the client and save time.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a bucket with Block Public Access fully on and versioning enabled, then upload a file twice and list both versions.",
        hint: "s3 mb creates the bucket; put-public-access-block and put-bucket-versioning set the options; list-object-versions shows history.",
        solution: `aws s3 mb s3://acme-demo-2026-xyz
aws s3api put-public-access-block --bucket acme-demo-2026-xyz \\
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-versioning --bucket acme-demo-2026-xyz \\
  --versioning-configuration Status=Enabled
echo v1 > a.txt && aws s3 cp a.txt s3://acme-demo-2026-xyz/
echo v2 > a.txt && aws s3 cp a.txt s3://acme-demo-2026-xyz/
aws s3api list-object-versions --bucket acme-demo-2026-xyz --prefix a.txt`,
      },
      {
        level: "medium",
        task: "Create a private, encrypted RDS PostgreSQL instance whose master password is managed by Secrets Manager, then connect with full TLS verification.",
        hint: "Use --manage-master-user-password and --no-publicly-accessible; download the global CA bundle from truststore.pki.rds.amazonaws.com.",
        solution: `aws rds create-db-instance --db-instance-identifier app-db --engine postgres \\
  --db-instance-class db.t4g.micro --allocated-storage 20 --storage-type gp3 \\
  --master-username appadmin --manage-master-user-password \\
  --db-subnet-group-name app-private --vpc-security-group-ids sg-db123 \\
  --no-publicly-accessible --storage-encrypted --backup-retention-period 7
aws rds wait db-instance-available --db-instance-identifier app-db
curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
# from an instance inside the VPC, using the password from Secrets Manager:
psql "host=app-db.abc123.us-east-1.rds.amazonaws.com dbname=postgres user=appadmin \\
  sslmode=verify-full sslrootcert=global-bundle.pem"`,
      },
      {
        level: "hard",
        task: "Write a Lambda handler for S3 ObjectCreated events that decodes keys, skips anything not under uploads/, and copies each object to processed/ with the same file name.",
        hint: "unquote_plus the key, check the prefix, then s3.copy_object with CopySource.",
        solution: `import boto3
from urllib.parse import unquote_plus
s3 = boto3.client("s3")

def handler(event, context):
    for rec in event["Records"]:
        bucket = rec["s3"]["bucket"]["name"]
        key = unquote_plus(rec["s3"]["object"]["key"])
        if not key.startswith("uploads/"):
            continue  # never react to our own output
        dest = "processed/" + key.removeprefix("uploads/")
        s3.copy_object(Bucket=bucket, Key=dest, CopySource={"Bucket": bucket, "Key": key})`,
      },
    ],
    faq: [
      { q: "Is S3 a database?", a: "No. S3 stores whole objects by key and cannot query inside them like SQL. You can scan files with tools such as Athena, but for transactions and indexes use RDS or DynamoDB." },
      { q: "RDS or running PostgreSQL on EC2 myself?", a: "RDS costs a bit more per hour but handles backups, patching, failover and monitoring. Running it on EC2 gives full control (any extension, OS access) but makes you responsible for all of that work." },
      { q: "What is a Lambda cold start and how long is it?", a: "It is the delay when Lambda creates a new execution environment and runs your import code. For small Python functions it is typically a few hundred milliseconds; large dependencies and VPC setup can make it longer." },
      { q: "Can Lambda connect to an RDS database in a private subnet?", a: "Yes. Attach the function to the VPC's private subnets with a security group that the database SG allows. Use RDS Proxy if many concurrent invocations would open too many connections." },
    ],
  },

  "aws/boto3": {
    plain: [
      "boto3 is the official Python library for AWS. Anything you can click in the console or type with the aws CLI, you can do from a Python script. That makes it the tool of choice for audits, reports and clean-ups that would be slow and error-prone by hand.",
      "You never put keys in the script. boto3 looks for credentials by itself: in environment variables, in your ~/.aws files, or in the IAM role of the machine it runs on. The same script works on your laptop and on a server without changes.",
      "AWS answers list requests in pages, often 50 to 1,000 items at a time. If your script reads only the first page, it silently misses the rest. Paginators fetch every page for you.",
      "Things go wrong: missing permissions, a resource that no longer exists, too many requests at once. boto3 raises an exception called ClientError with an error code you can check and handle.",
      "A clean-up script can delete real resources, so build it to be safe. By default it should only print what it would do. It acts only when you pass a clear flag like --apply, and it should skip anything tagged as protected.",
    ],
    deepDive: [
      {
        heading: "Where boto3 finds credentials and region",
        body: "boto3 walks a chain of credential providers and uses the first one that returns keys. In order: values passed directly to Session or client (avoid this), the environment variables AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_SESSION_TOKEN, then providers driven by your profile and environment (role_arn to assume a role, a web identity token as used by EKS pods and CI, an IAM Identity Center profile, and the shared files ~/.aws/credentials and ~/.aws/config), the container credentials endpoint (ECS tasks), and finally the EC2 instance metadata service.\n\nThe profile comes from profile_name= or the AWS_PROFILE variable. The region comes from region_name=, AWS_REGION or AWS_DEFAULT_REGION, or the profile's region setting. Many \"it works on my laptop\" bugs are a different profile or region, so print sts get_caller_identity() and session.region_name at the start of every audit script.\n\nFor IAM Identity Center profiles, run aws sso login first; boto3 then reads the cached token and refreshes role credentials automatically.",
        visual: {
          type: "flow",
          title: "boto3 credential chain, first match wins",
          steps: [
            { label: "Explicit arguments", detail: "Keys passed in code; avoid" },
            { label: "Environment variables", detail: "AWS_ACCESS_KEY_ID and friends" },
            { label: "Profile providers", detail: "role_arn, web identity, SSO" },
            { label: "~/.aws files", detail: "Keys in credentials or config" },
            { label: "Container endpoint", detail: "ECS task role" },
            { label: "Instance metadata", detail: "EC2 instance role via IMDS" },
          ],
        },
      },
      {
        heading: "Sessions, clients and resources",
        body: "A Session holds a credential source, a profile and a region. boto3.client(\"ec2\") quietly uses a default session; creating your own with boto3.Session(profile_name=..., region_name=...) makes scripts explicit and lets you work with several accounts or regions at once.\n\nA client maps one to one to the AWS API: describe_instances is the DescribeInstances call, and it returns a plain dict that includes ResponseMetadata. Method names are the API names in snake_case, and the boto3 docs list every parameter and response field.\n\nResources (boto3.resource(\"s3\")) are an older, object-style layer: bucket.objects.all() and so on. They still work, but the boto3 team stopped adding features to them, so new services and new API fields appear only in clients. Prefer clients for new code.\n\nClients are generally safe to share across threads; Session objects are not, so create one session per thread when you parallelise. Most services are regional: an EC2 client sees only its own region, so an account-wide audit loops over regions.",
        bullets: ["ec2.describe_regions() returns the regions enabled for the account", "S3 list_buckets is global, but each bucket lives in one region", "Use botocore.config.Config to set retries and timeouts"],
      },
      {
        heading: "Pagination and server-side filters",
        body: "List APIs return a page plus a token for the next one. The name of the token differs by service: NextToken for EC2, ContinuationToken for S3 list_objects_v2, Marker for some older APIs. A paginator hides these details: client.get_paginator(\"describe_instances\").paginate() yields every page until there is no token left.\n\nYou can tune it with PaginationConfig={\"PageSize\": 100, \"MaxItems\": 500}, and you can flatten results with JMESPath: pages.search(\"Reservations[].Instances[]\") yields instances one at a time.\n\nFilter on the server when the API supports it. describe_instances accepts Filters such as instance-state-name=stopped or tag-key=owner, and describe_volumes accepts status=available. This sends less data and makes fewer calls than downloading everything and filtering in Python. Not every API has a paginator; client.can_paginate(\"name\") tells you.",
        visual: {
          type: "sequence",
          title: "What a paginator does for you",
          actors: ["Your loop", "Paginator", "EC2 API"],
          messages: [
            { from: 0, to: 1, label: "for page in paginate()" },
            { from: 1, to: 2, label: "DescribeInstances" },
            { from: 2, to: 1, label: "Page 1 + NextToken" },
            { from: 1, to: 0, label: "Yield page 1" },
            { from: 1, to: 2, label: "DescribeInstances with NextToken" },
            { from: 2, to: 1, label: "Last page, no token" },
            { from: 1, to: 0, label: "Yield last page, loop ends" },
          ],
        },
      },
      {
        heading: "Errors, retries, waiters and EC2 DryRun",
        body: "Service errors raise botocore.exceptions.ClientError. Read e.response[\"Error\"][\"Code\"] to decide what to do: S3 uses codes like NoSuchBucket and AccessDenied, EC2 uses UnauthorizedOperation and InvalidInstanceID.NotFound. Problems before the call raise other botocore exceptions, such as NoCredentialsError. For common S3 errors, client.exceptions.NoSuchKey also works in except clauses.\n\nboto3 retries throttling and temporary errors for you. Set the behaviour explicitly with Config(retries={\"max_attempts\": 10, \"mode\": \"standard\"}); adaptive mode also slows the client down when AWS throttles. Do not wrap calls in your own tight retry loops.\n\nWaiters poll until a resource reaches a state: ec2.get_waiter(\"instance_stopped\").wait(InstanceIds=[...]). Many EC2 calls also take DryRun=True. AWS checks permissions without doing anything and raises ClientError with code DryRunOperation if you would have been allowed, or UnauthorizedOperation if not. It is a useful permission test, but it is not a replacement for your script's own dry-run mode.",
        bullets: ["Catch specific codes; re-raise anything you did not expect", "Log the resource ID with every error", "Throttling shows up as codes like Throttling or RequestLimitExceeded"],
      },
      {
        heading: "Finding waste and cleaning up safely",
        body: "Good first targets: instances with no owner tag, instances stopped for weeks (their EBS volumes still cost money), EBS volumes in the available state (attached to nothing), Elastic IPs with no association (AWS now charges for every public IPv4 address), old snapshots, and S3 buckets with no lifecycle rules. For \"idle\", read CloudWatch: an instance whose CPUUtilization stayed under a few percent for 14 days is a candidate to stop or downsize.\n\nThe Resource Groups Tagging API (get_resources) is handy across services, but it returns only resources that have or once had tags, so it cannot find things that were never tagged. Use each service's describe call for that.\n\nDesign for safety: dry run by default, an explicit --apply flag, an allowlist tag like keep=true that is always skipped, a clear log of every action, and a least-privilege role for the script. Many teams tag first (marked-for-deletion with a date), notify the owner, and delete a week later.",
        visual: {
          type: "cycle",
          title: "Mark, wait, then delete",
          steps: [
            { label: "Scan", detail: "Find untagged or idle resources" },
            { label: "Tag", detail: "Add marked-for-deletion with a date" },
            { label: "Notify", detail: "Post the list to the team channel" },
            { label: "Wait", detail: "Give owners a week to object" },
            { label: "Delete with --apply", detail: "Skip anything tagged keep=true" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Session, client and resource",
        columns: [
          { title: "Session", points: ["Holds profile, region, credentials", "One per account or region you target", "Not thread-safe"] },
          { title: "Client", points: ["One method per API call", "Returns plain dicts", "Has paginators and waiters", "Recommended for new code"] },
          { title: "Resource", points: ["Object style, like bucket.objects", "Older layer, no new features", "Handy for simple S3 and EC2 scripts"] },
        ],
      },
    ],
    examples: [
      {
        title: "Report every S3 bucket with its region and lifecycle status",
        explanation: "Step 1: list buckets; this call is global. Step 2: for each bucket, ask for its location. The API returns None for us-east-1, a historical quirk you must handle. Step 3: ask for its lifecycle configuration; a bucket without rules raises ClientError with code NoSuchLifecycleConfiguration, which is the case you want to report. Step 4: any other error, such as AccessDenied, is printed instead of crashing the whole report.",
        code: {
          lang: "python",
          code: `import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")
for b in s3.list_buckets()["Buckets"]:
    name = b["Name"]
    region = s3.get_bucket_location(Bucket=name)["LocationConstraint"] or "us-east-1"
    try:
        rules = s3.get_bucket_lifecycle_configuration(Bucket=name)["Rules"]
        status = f"{len(rules)} lifecycle rules"
    except ClientError as e:
        code = e.response["Error"]["Code"]
        status = "NO LIFECYCLE" if code == "NoSuchLifecycleConfiguration" else f"error: {code}"
    print(f"{name:40} {region:15} {status}")`,
        },
      },
      {
        title: "Dry-run clean-up of unattached EBS volumes",
        explanation: "Step 1: parse an --apply flag; without it the script only reports. Step 2: paginate describe_volumes with a server-side filter for status available, which means attached to nothing. Step 3: build a tag dict and skip volumes tagged keep=true. Step 4: print each candidate with its size, so the report shows the money at stake. Step 5: only with --apply, call delete_volume. Run it in each region you use, and keep a copy of the output.",
        code: {
          lang: "python",
          code: `import argparse, boto3

ap = argparse.ArgumentParser()
ap.add_argument("--apply", action="store_true")
ap.add_argument("--region", default="us-east-1")
args = ap.parse_args()
ec2 = boto3.Session(region_name=args.region).client("ec2")
pages = ec2.get_paginator("describe_volumes").paginate(
    Filters=[{"Name": "status", "Values": ["available"]}])
for vol in pages.search("Volumes[]"):
    tags = {t["Key"]: t["Value"] for t in vol.get("Tags", [])}
    if tags.get("keep") == "true":
        continue
    print("DELETE" if args.apply else "WOULD DELETE", vol["VolumeId"], f'{vol["Size"]} GiB')
    if args.apply:
        ec2.delete_volume(VolumeId=vol["VolumeId"])`,
        },
      },
    ],
    cheatSheet: [
      "boto3.Session(profile_name=\"dev\", region_name=\"eu-west-1\").client(\"ec2\") makes scripts explicit",
      "boto3.client(\"sts\").get_caller_identity()[\"Arn\"] shows which identity the script uses",
      "client.get_paginator(\"op\").paginate().search(\"JMESPath\") yields items across all pages",
      "Catch ClientError and read e.response[\"Error\"][\"Code\"]",
      "Config(retries={\"max_attempts\": 10, \"mode\": \"standard\"}) sets retry behaviour",
      "ec2.get_waiter(\"instance_running\").wait(InstanceIds=[...]) blocks until the state is reached",
      "EC2 DryRun=True raises DryRunOperation if you would be allowed",
      "get_bucket_location returns None for buckets in us-east-1",
    ],
    quiz: [
      {
        q: "An audit script finds 50 instances, but the console shows 300 in the same region. What is the most likely bug?",
        options: ["The script uses the wrong profile", "EC2 hides stopped instances from boto3", "The script reads only the first page of results", "boto3 caches old results"],
        answer: 2,
        why: "Without a paginator or a NextToken loop, you get only the first page of a list API.",
      },
      {
        q: "A script runs on an EC2 instance with an IAM role and no ~/.aws files. Where does boto3 get credentials?",
        options: ["From the instance metadata service", "It fails with NoCredentialsError", "From the root user", "From the AMI"],
        answer: 0,
        why: "The last provider in the chain reads the role's temporary credentials from IMDS.",
      },
      {
        q: "You call ec2.stop_instances(InstanceIds=[...], DryRun=True) and have permission. What happens?",
        options: ["The instances stop", "It returns an empty dict", "Nothing, and no exception", "ClientError with code DryRunOperation is raised"],
        answer: 3,
        why: "EC2 signals a successful permission check by raising DryRunOperation.",
      },
      {
        q: "Why can the Resource Groups Tagging API miss resources in an untagged-resource audit?",
        options: ["It only works in us-east-1", "It only returns resources that have or had tags", "It needs root credentials", "It skips EC2 entirely"],
        answer: 1,
        why: "Never-tagged resources do not appear, so use each service's describe call to find them.",
      },
      {
        q: "Which is the safest default for a clean-up script?",
        options: ["Report only; act only with an explicit --apply flag", "Delete, but ask for confirmation for each item", "Delete everything older than 30 days", "Run only on Fridays"],
        answer: 0,
        why: "A dry-run default means a mistaken run only prints, and acting needs a clear decision.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a script that prints the account ID, the caller ARN and the region the default session will use.",
        hint: "STS get_caller_identity returns Account and Arn; the session has region_name.",
        solution: `import boto3

session = boto3.Session()
ident = session.client("sts").get_caller_identity()
print("Account:", ident["Account"])
print("Arn:    ", ident["Arn"])
print("Region: ", session.region_name)`,
      },
      {
        level: "medium",
        task: "Count EC2 instances by state in every enabled region of the account.",
        hint: "describe_regions gives region names; build a client per region and paginate describe_instances with search.",
        solution: `import boto3
from collections import Counter

regions = [r["RegionName"] for r in boto3.client("ec2").describe_regions()["Regions"]]
for region in regions:
    ec2 = boto3.client("ec2", region_name=region)
    pages = ec2.get_paginator("describe_instances").paginate()
    states = Counter(i["State"]["Name"] for i in pages.search("Reservations[].Instances[]"))
    if states:
        print(region, dict(states))`,
      },
      {
        level: "hard",
        task: "Write a dry-run-by-default script that releases Elastic IPs not associated with anything, skips keep=true, and handles errors per address.",
        hint: "describe_addresses has no paginator; an unused address has no AssociationId. release_address takes AllocationId.",
        solution: `import sys, boto3
from botocore.exceptions import ClientError
apply = "--apply" in sys.argv
ec2 = boto3.client("ec2")
for a in ec2.describe_addresses()["Addresses"]:
    tags = {t["Key"]: t["Value"] for t in a.get("Tags", [])}
    if "AssociationId" in a or tags.get("keep") == "true":
        continue
    print("RELEASE" if apply else "WOULD RELEASE", a["PublicIp"], a["AllocationId"])
    try:
        if apply: ec2.release_address(AllocationId=a["AllocationId"])
    except ClientError as e: print("  failed:", e.response["Error"]["Code"])`,
      },
    ],
    faq: [
      { q: "What is the difference between boto3 and botocore?", a: "botocore is the low-level library that signs requests, handles retries and knows every API from JSON models. boto3 is built on top of it and adds sessions, resources and a friendlier interface; you import exceptions and Config from botocore." },
      { q: "boto3 client or resource: which should I use?", a: "Use clients for new code. They cover every API and new feature, while resources are no longer being extended." },
      { q: "How do I test boto3 code without touching real AWS?", a: "Use moto, which mocks AWS services in memory, or botocore's Stubber to queue fake responses. Both run in pytest with no AWS account." },
      { q: "Why does my script say NoRegionError?", a: "Most clients need a region and none was found. Pass region_name, set AWS_REGION or AWS_DEFAULT_REGION, or add region to your profile in ~/.aws/config." },
    ],
  },
};

export default extra;
