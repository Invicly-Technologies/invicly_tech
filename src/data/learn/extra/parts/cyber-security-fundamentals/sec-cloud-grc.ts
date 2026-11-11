import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-cloud-grc/shared-responsibility": {
    plain: [
      "When you use the cloud, you rent computers in someone else's data centre. The provider, such as AWS, Microsoft Azure or Google Cloud, protects the buildings, the hardware and the software that runs their platform. You protect what you put on it: your data, your accounts and your settings.",
      "AWS sums it up like this: the provider is responsible for security of the cloud, and you are responsible for security in the cloud. Most cloud breaches happen on the customer side, through a weak password, a leaked key or a setting left open.",
      "How much is yours depends on the service type. With IaaS (infrastructure as a service), such as a virtual machine, you patch the operating system. With PaaS (platform as a service), such as a managed database, the provider patches it. With SaaS (software as a service), such as Microsoft 365, you mostly manage users, data and sharing.",
      "In every model, identity is yours. Whoever controls your cloud accounts controls everything you built. So protecting the top-level account, using MFA everywhere and replacing permanent keys with short-lived credentials are the first jobs in cloud security.",
    ],
    deepDive: [
      {
        heading: "IaaS, PaaS and SaaS: where the line moves",
        body: "Picture a stack: data centre, hardware, virtualisation, operating system, runtime, application, data and identity. The provider always owns the bottom layers and you always own the top ones. The service model decides where the line falls in between.\n\nWith IaaS, such as an EC2 or Azure virtual machine, the provider stops at the hypervisor. You patch the guest operating system, configure its firewall, install agents and secure the app. With PaaS, such as Amazon RDS or Azure App Service, the provider also patches the operating system and the database or runtime, but you still choose network access, who can log in, whether encryption and backups are on, and you secure your code. With SaaS, nearly everything technical is the provider's, yet you still own user accounts, MFA, sharing settings and the data people upload. Misconfigured sharing in SaaS is a common source of leaks.",
        visual: {
          type: "compare",
          title: "What you still handle in each model",
          columns: [
            { title: "IaaS (VM)", points: ["Guest OS patches", "Host firewall and agents", "App and data", "Identity and network rules"] },
            { title: "PaaS (managed DB)", points: ["Network access rules", "Database users and roles", "Encryption and backup settings", "Your code and data"] },
            { title: "SaaS (Microsoft 365)", points: ["User accounts and MFA", "Sharing and retention settings", "Data people upload", "Admin roles"] },
          ],
        },
      },
      {
        heading: "Securing the root or owner account",
        body: "Every cloud has one all-powerful identity. In AWS it is the root user, the email address that created the account. It can do anything, including close the account, and IAM policies in that account cannot limit it. In Microsoft Entra ID the top role is Global Administrator; in Google Cloud it is the super admin of the organisation.\n\nProtect it carefully: a long unique password in a password manager, MFA with a hardware security key or passkey, no access keys ever, and current contact details so the provider can reach you. Use root only for the few tasks that require it, and alert on every root sign-in. In AWS Organizations, you can now remove root credentials from member accounts centrally. In Entra ID, keep two emergency (break-glass) accounts with strong credentials, store them safely and alert whenever they are used.",
        bullets: ["aws iam get-account-summary: AccountMFAEnabled should be 1", "AccountAccessKeysPresent should be 0 (no root keys)", "Alert on ConsoleLogin events where the user type is Root"],
      },
      {
        heading: "Roles and short-lived credentials",
        body: "An IAM user's access key (IDs starting with AKIA) works until someone rotates or deletes it. If it is pushed to a public Git repository, automated scanners can find and abuse it within minutes. A role is different: you assume it and AWS STS hands you temporary credentials (IDs starting with ASIA) that expire, by default after 1 hour and configurable from 15 minutes up to 12 hours.\n\nUse roles everywhere. People sign in through single sign-on, such as IAM Identity Center with aws sso login. EC2 instances get an instance profile, Lambda functions an execution role, and Kubernetes pods use EKS Pod Identity or IRSA. CI pipelines use OIDC federation, so GitHub Actions or GitLab can get temporary credentials without any stored secret. Azure has managed identities, and Google Cloud has attached service accounts and Workload Identity Federation, which avoid downloadable service account keys.",
        visual: {
          type: "sequence",
          title: "GitHub Actions gets AWS credentials with OIDC",
          actors: ["CI job", "GitHub OIDC", "AWS STS"],
          messages: [
            { from: 0, to: 1, label: "Request a signed ID token" },
            { from: 1, to: 0, label: "Token: repo, branch, audience" },
            { from: 0, to: 2, label: "AssumeRoleWithWebIdentity with token" },
            { from: 2, to: 2, label: "Check trust policy: aud and sub match" },
            { from: 2, to: 0, label: "Temporary credentials, about 1 hour" },
          ],
        },
      },
      {
        heading: "Least privilege and how AWS evaluates a request",
        body: "AWS starts from deny. A request is allowed only if some policy explicitly allows it, and an explicit deny anywhere always wins. Several layers can apply: service control policies (SCPs) from AWS Organizations set the maximum for a whole account, permission boundaries cap what a role can ever get, identity policies and resource policies grant access, and session policies can narrow it further.\n\nWrite policies for the job, not for convenience. Avoid Action \"*\" with Resource \"*\". Use conditions, such as requiring MFA with aws:MultiFactorAuthPresent or limiting to your network with aws:SourceIp. IAM Access Analyzer helps in two ways: it flags resources shared outside your account or organisation, and it can generate a policy from the actions a role actually used in CloudTrail. Review unused roles and permissions regularly; access that nobody uses is pure risk.",
        bullets: ["Explicit deny always beats allow", "SCPs limit accounts; they never grant access", "Grant to roles or groups, not to individual users"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Long-lived keys vs roles",
        columns: [
          { title: "Access keys (AKIA...)", points: ["Valid until rotated or deleted", "Stored in files, env vars, CI secrets", "Leaks are found and abused fast", "Rotation is manual work"] },
          { title: "Roles (ASIA... temporary)", points: ["Expire after 15 min to 12 h", "Nothing permanent to steal", "Every assume is logged in CloudTrail", "Trust policy controls who can assume"] },
        ],
      },
    ],
    examples: [
      {
        title: "Checking root and key hygiene in an AWS account",
        explanation: "You join a team and want a quick view of identity risk. Step 1: confirm which account and identity you are using. Step 2: check that the root user has MFA and no access keys. Step 3: generate the IAM credential report and print, for each user, whether they have a password, MFA, and an active first access key with its rotation date. Users with an active key but no recent use, or keys older than 90 days, go on the clean-up list. The <root_account> row in the report shows root's own status.",
        code: {
          lang: "bash",
          code: `aws sts get-caller-identity
aws iam get-account-summary \\
  --query 'SummaryMap.{RootMFA:AccountMFAEnabled,RootKeys:AccountAccessKeysPresent}'
aws iam generate-credential-report
aws iam get-credential-report --query Content --output text | base64 -d \\
  | cut -d, -f1,4,8,9,10 | column -t -s,
# columns: user, password_enabled, mfa_active,
#          access_key_1_active, access_key_1_last_rotated`,
        },
      },
      {
        title: "Letting GitHub Actions deploy without stored keys",
        explanation: "Step 1: add GitHub as an OIDC identity provider in IAM (token.actions.githubusercontent.com, audience sts.amazonaws.com). Step 2: create a deploy role whose trust policy accepts tokens only from your repository's main branch. Step 3: in the workflow, set permissions: id-token: write and use the aws-actions/configure-aws-credentials action with role-to-assume set to the role ARN. Now no secret key exists anywhere, and a token from another repository or branch is rejected by the sub condition.",
        code: {
          lang: "json",
          code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::111122223333:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:acme/web:ref:refs/heads/main"
      }
    }
  }]
}`,
        },
      },
    ],
    cheatSheet: [
      "Provider: security OF the cloud. You: security IN the cloud (data, identity, configuration)",
      "IaaS: you patch the OS. PaaS: provider patches the platform. SaaS: you manage users and sharing",
      "Root or owner account: MFA with a security key, no access keys, used only when required",
      "Root check: aws iam get-account-summary shows AccountMFAEnabled and AccountAccessKeysPresent",
      "Access key IDs starting AKIA are long-lived; ASIA means temporary STS credentials",
      "Role sessions last 15 minutes to 12 hours; the default is 1 hour",
      "AWS policy logic: default deny, explicit allow needed, explicit deny always wins",
      "CI to cloud: use OIDC federation instead of storing access keys as secrets",
    ],
    quiz: [
      {
        q: "You run your own database on an EC2 virtual machine (IaaS). Who patches the operating system?",
        options: ["AWS", "Nobody, it patches itself", "You, the customer", "The database vendor"],
        answer: 2,
        why: "In IaaS the provider stops at the hypervisor; the guest OS is yours.",
      },
      {
        q: "Why are IAM roles safer than long-lived access keys?",
        options: ["Their credentials expire automatically, so a leak is short-lived", "They are free", "They are not logged", "They always have more permissions"],
        answer: 0,
        why: "Temporary credentials stop working after their session ends, unlike static keys.",
      },
      {
        q: "An identity policy allows s3:GetObject, but an SCP on the account denies it. What happens?",
        options: ["Allowed, because the identity policy allows it", "Allowed for admins only", "It depends on the region", "Denied, because an explicit deny wins"],
        answer: 3,
        why: "An explicit deny in any applicable policy overrides every allow.",
      },
      {
        q: "Which root account practice is correct?",
        options: ["Create access keys for automation scripts", "Enable strong MFA and use root only for tasks that require it", "Share the root password with the ops team", "Turn off logging for root to reduce noise"],
        answer: 1,
        why: "Root is unrestricted, so it needs the strongest protection and the least use.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In a personal or lab AWS account, confirm who you are and check whether the root user has MFA and access keys.",
        hint: "Two CLI calls are enough: one in STS, one in IAM.",
        solution: "aws sts get-caller-identity\naws iam get-account-summary --query 'SummaryMap.[AccountMFAEnabled,AccountAccessKeysPresent]'\n# Expect [1, 0]: MFA on, no root access keys.",
      },
      {
        level: "medium",
        task: "Write an IAM policy that lets a reporting role list and read objects in the bucket acme-reports, and nothing else.",
        hint: "ListBucket applies to the bucket ARN; GetObject applies to the objects (bucket ARN plus /*).",
        solution: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    { \"Effect\": \"Allow\", \"Action\": \"s3:ListBucket\", \"Resource\": \"arn:aws:s3:::acme-reports\" },\n    { \"Effect\": \"Allow\", \"Action\": \"s3:GetObject\", \"Resource\": \"arn:aws:s3:::acme-reports/*\" }\n  ]\n}",
      },
      {
        level: "hard",
        task: "Using the IAM credential report, list every user whose first access key is active and older than 90 days.",
        hint: "Column 9 is access_key_1_active and column 10 is access_key_1_last_rotated.",
        solution: "aws iam generate-credential-report > /dev/null\naws iam get-credential-report --query Content --output text | base64 -d > cred.csv\nawk -F, 'NR>1 && $9==\"true\" {print $1, $10}' cred.csv | while read u d; do\n  age=$(( ( $(date +%s) - $(date -d \"$d\" +%s) ) / 86400 ))\n  [ \"$age\" -gt 90 ] && echo \"$u: key 1 is $age days old\"\ndone\n# Next: replace each with a role, or rotate it and remove the old key.",
      },
    ],
    faq: [
      { q: "Is the cloud less secure than my own data centre?", a: "Not by nature. Big providers secure their infrastructure better than most companies can, but they give you powerful settings that are easy to get wrong. Most cloud incidents are customer misconfigurations, not provider failures." },
      { q: "Who is responsible if a public storage bucket leaks data?", a: "The customer. The provider gives you the controls, such as Block Public Access, but choosing and checking the settings is your job." },
      { q: "What is a break-glass account?", a: "An emergency admin account used only when normal sign-in fails, for example if single sign-on or MFA is broken. It has very strong, safely stored credentials and triggers an alert whenever it is used." },
      { q: "Should I ever use access keys?", a: "Avoid them when a role or federation option exists, which is almost always. If you must use one, give it the narrowest permissions, store it in a secrets manager, rotate it and monitor its use." },
    ],
  },

  "sec-cloud-grc/cloud-misconfig": {
    plain: [
      "A misconfiguration is an unsafe setting: a storage bucket anyone on the internet can read, a database port open to the whole world, or audit logging switched off. The cloud lets you create things in seconds, which also makes it easy to create them wrongly.",
      "Attackers scan the internet all day for these mistakes. A server with SSH open to everyone starts getting password guesses within minutes. A public bucket with a guessable name can be downloaded without any hacking at all.",
      "The defence has three parts. Turn on audit logs, so every action in the account is recorded. Run a posture checker, a tool that compares your settings with best practice and lists what is wrong. And alert on risky changes, so tomorrow's mistake is caught in minutes, not months.",
      "Prevention is even better. Use secure defaults, set account-wide guardrails that block the worst settings, and scan infrastructure-as-code templates, such as Terraform files, before anything is deployed.",
    ],
    deepDive: [
      {
        heading: "Public storage: how buckets end up open",
        body: "An S3 bucket becomes public when its bucket policy grants access to Principal \"*\" (everyone) or when an access control list (ACL) grants the AllUsers or AuthenticatedUsers groups. The safety net is S3 Block Public Access, which can be set for the whole account and for each bucket and overrides public grants. Since April 2023, new buckets have Block Public Access turned on and ACLs disabled by default, but older buckets and accounts may not.\n\nOther clouds have the same risk. In Azure, a storage account setting controls whether anonymous blob access is allowed at all. In Google Cloud, granting a role to allUsers or allAuthenticatedUsers makes data public, and the public access prevention setting blocks that. If content really must be public, such as website images, serve it through a CDN like CloudFront with origin access control, and keep the bucket itself private.",
        bullets: ["aws s3control get-public-access-block --account-id ID", "aws s3api get-public-access-block --bucket NAME", "aws s3api get-bucket-policy-status --bucket NAME (IsPublic)"],
      },
      {
        heading: "Open security groups and exposed services",
        body: "A security group is a stateful virtual firewall around a cloud resource. Rules that allow 0.0.0.0/0 (or ::/0 for IPv6) mean the whole internet. That is normal for ports 80 and 443 on a public load balancer, and dangerous almost everywhere else: SSH (22), RDP (3389), and database or cache ports such as MySQL (3306), PostgreSQL (5432), MongoDB (27017), Redis (6379) and Elasticsearch (9200).\n\nFor admin access, use AWS Systems Manager Session Manager, a bastion host or a VPN, or at least limit the source to your office range. Also check which instances have public IP addresses, and look at network ACLs, Azure network security groups and Google Cloud firewall rules. On EC2, require IMDSv2 for the instance metadata service. The 2019 Capital One breach combined an SSRF flaw with an over-privileged role whose credentials were read from metadata; IMDSv2 makes that kind of theft much harder.",
      },
      {
        heading: "Audit logging: CloudTrail and its cousins",
        body: "AWS CloudTrail records API calls. Without any setup, event history shows the last 90 days of management events, which are actions that create, change or delete resources. For anything longer, create a multi-region trail, ideally an organisation trail, that writes to an S3 bucket in a separate log archive account. Turn on log file validation so tampering is detectable, and protect the bucket, for example with S3 Object Lock. Data events, such as S3 object reads or Lambda invocations, are off by default and cost extra, so enable them for sensitive buckets.\n\nAzure keeps its Activity Log for 90 days; export it with a diagnostic setting to Log Analytics or storage. Entra ID sign-in and audit logs are separate and also need exporting. In Google Cloud, Admin Activity audit logs are always on, while Data Access logs are off by default for most services. Add network logs too, such as VPC Flow Logs.",
        visual: {
          type: "flow",
          title: "From one API call to an alert",
          steps: [
            { label: "API call", detail: "Someone runs PutBucketPolicy" },
            { label: "CloudTrail", detail: "Records who, what, when, from where" },
            { label: "Trail to S3", detail: "Kept long term in a log account" },
            { label: "EventBridge rule", detail: "Matches risky event names" },
            { label: "Alert", detail: "SNS, SIEM or chat in minutes" },
          ],
        },
      },
      {
        heading: "Posture management and infrastructure-as-code scanning",
        body: "Cloud security posture management (CSPM) tools continuously compare your settings with best practices such as the CIS AWS Foundations Benchmark. Built-in options include AWS Security Hub with AWS Config rules, Microsoft Defender for Cloud and Google Security Command Center. Free open-source checkers include Prowler and ScoutSuite, which run read-only checks and produce a report.\n\nIt is cheaper to catch mistakes before deployment. Scanners such as Checkov and Trivy read Terraform, CloudFormation and Kubernetes files in your CI pipeline and fail the build if, for example, a bucket is public or a security group allows SSH from anywhere.\n\nPrioritise wisely. A report with 400 findings is overwhelming. Fix first what combines public exposure, sensitive data and powerful identities, such as a public instance with an admin role. Do not chase a perfect score; chase the paths an attacker would actually use.",
      },
      {
        heading: "Alerting on risky configuration changes",
        body: "Some API calls deserve an alert almost every time they happen. Logging changes: StopLogging, DeleteTrail, UpdateTrail. Data exposure: PutBucketPolicy, PutBucketAcl and DeletePublicAccessBlock. Network exposure: AuthorizeSecurityGroupIngress with a source of 0.0.0.0/0. Identity changes: CreateUser, CreateAccessKey, AttachUserPolicy with an admin policy, and any root sign-in.\n\nIn AWS, an EventBridge rule can match these events from CloudTrail and send them to SNS, a Lambda function or your SIEM. Amazon GuardDuty adds threat detection on top, such as credentials used from unusual places. Guardrails stop some changes outright: an SCP can deny cloudtrail:StopLogging for everyone except a security role, and AWS Config can automatically fix certain settings. Alerts tell you something happened; guardrails stop it happening.",
        bullets: ["Alert: someone disabled or changed logging", "Alert: a bucket policy or ACL changed", "Alert: a port opened to 0.0.0.0/0", "Alert: root signed in or a new access key was created"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Common cloud misconfigurations",
        root: "Misconfigurations",
        children: [
          { label: "Storage", children: ["Public bucket policy", "Anonymous blob access", "Share links that never expire"] },
          { label: "Network", children: ["SSH or RDP open to 0.0.0.0/0", "Database ports public", "IMDSv1 still allowed"] },
          { label: "Identity", children: ["Admin policy on many users", "Old unused access keys", "No MFA"] },
          { label: "Logging", children: ["No trail or single region only", "Log bucket writable by many", "No alerts on changes"] },
          { label: "Data", children: ["Snapshots shared publicly", "Encryption turned off"] },
        ],
      },
    ],
    examples: [
      {
        title: "A quick public exposure check with the AWS CLI",
        explanation: "Step 1: check whether Block Public Access is on for the whole account. Step 2: for every bucket, ask S3 whether its policy makes it public (buckets without a policy print no-policy). Step 3: find security groups with a rule open to 0.0.0.0/0 on port 22. The EC2 filters match a group if any of its rules match each filter, so confirm each result by looking at its actual rules. Anything public that should not be goes straight into a ticket with an owner.",
        code: {
          lang: "bash",
          code: `aws s3control get-public-access-block --account-id 111122223333

for b in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do
  s=$(aws s3api get-bucket-policy-status --bucket "$b" \\
      --query PolicyStatus.IsPublic --output text 2>/dev/null || echo no-policy)
  echo "$b: $s"
done

aws ec2 describe-security-groups \\
  --filters Name=ip-permission.cidr,Values=0.0.0.0/0 Name=ip-permission.from-port,Values=22 \\
  --query 'SecurityGroups[].[GroupId,GroupName]' --output text`,
        },
      },
      {
        title: "Alerting when someone turns off CloudTrail",
        explanation: "An attacker who gets admin rights often disables logging first. Step 1: make sure a trail is logging, because EventBridge receives these API events through CloudTrail. Step 2: create an EventBridge rule with this event pattern in each region you use. Step 3: set its target to an SNS topic that emails or pages the security team, or to your SIEM. Step 4: test it in a lab account by stopping a test trail and confirming the alert arrives. Step 5: add an SCP that denies these actions except for a security admin role.",
        code: {
          lang: "json",
          code: `{
  "source": ["aws.cloudtrail"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventSource": ["cloudtrail.amazonaws.com"],
    "eventName": ["StopLogging", "DeleteTrail", "UpdateTrail", "PutEventSelectors"]
  }
}`,
        },
      },
    ],
    cheatSheet: [
      "Turn on S3 Block Public Access for the whole account unless there is a reviewed exception",
      "aws s3api get-bucket-policy-status --bucket NAME shows whether the bucket policy is public",
      "Never allow 0.0.0.0/0 or ::/0 to SSH (22), RDP (3389) or database ports",
      "CloudTrail event history keeps 90 days; a multi-region trail to S3 keeps logs as long as you want",
      "CloudTrail data events, such as S3 object reads, are off by default and cost extra",
      "Google Cloud Admin Activity logs are always on; most Data Access logs are off by default",
      "Prowler and ScoutSuite check posture; Checkov and Trivy scan IaC before deploy",
      "Require IMDSv2 on EC2 to make metadata credential theft through SSRF much harder",
    ],
    quiz: [
      {
        q: "Which security group rule is the most dangerous?",
        options: ["TCP 443 from 0.0.0.0/0 to a public web load balancer", "TCP 3389 from 0.0.0.0/0 to a Windows server", "TCP 5432 from the app subnet to the database", "TCP 22 from the company VPN range"],
        answer: 1,
        why: "RDP open to the whole internet invites password guessing and exploits against the server.",
      },
      {
        q: "Without creating a trail, how far back does CloudTrail event history show management events?",
        options: ["7 days", "30 days", "1 year", "90 days"],
        answer: 3,
        why: "Event history covers 90 days; longer retention needs a trail or CloudTrail Lake.",
      },
      {
        q: "What does a CSPM tool do?",
        options: ["Continuously compares cloud settings with best practices and reports risky ones", "Encrypts cloud storage", "Replaces the network firewall", "Blocks malware on laptops"],
        answer: 0,
        why: "Cloud security posture management is about finding and tracking misconfigurations.",
      },
      {
        q: "Why alert on the StopLogging API call?",
        options: ["It costs money", "It changes the region", "Attackers often disable audit logs to hide their next steps", "It deletes S3 buckets"],
        answer: 2,
        why: "Turning off logging is a classic defence evasion step, so it needs immediate attention.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List all S3 buckets in a lab account and show the Block Public Access settings for each.",
        hint: "Loop over list-buckets and call get-public-access-block; a bucket without settings returns an error.",
        solution: "for b in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do\n  echo \"== $b\"\n  aws s3api get-public-access-block --bucket \"$b\" \\\n    --query PublicAccessBlockConfiguration 2>/dev/null || echo \"no bucket-level block set\"\ndone",
      },
      {
        level: "medium",
        task: "Run Prowler against a lab AWS account, then pick the three findings you would fix first and explain why.",
        hint: "Filter to critical and high severity, then rank by public exposure, data sensitivity and privilege.",
        solution: "pip install prowler\nprowler aws --severity critical high\n# Open the HTML report in the output folder.\n# Example top 3:\n# 1. Root account without MFA (full account takeover)\n# 2. Security group with 0.0.0.0/0 on 22 (internet-exposed admin)\n# 3. CloudTrail not multi-region (blind spots for investigation)",
      },
      {
        level: "hard",
        task: "Write a service control policy that denies stopping or deleting CloudTrail trails and changing the account's S3 public access block, except for a role named SecurityAdmin.",
        hint: "Use a Deny with a condition on aws:PrincipalArn. Removing the account-level block needs the s3:PutAccountPublicAccessBlock permission.",
        solution: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Deny\",\n    \"Action\": [\"cloudtrail:StopLogging\", \"cloudtrail:DeleteTrail\", \"s3:PutAccountPublicAccessBlock\"],\n    \"Resource\": \"*\",\n    \"Condition\": { \"ArnNotLike\": { \"aws:PrincipalArn\": \"arn:aws:iam::*:role/SecurityAdmin\" } }\n  }]\n}",
      },
    ],
    faq: [
      { q: "Why are so many cloud breaches caused by misconfiguration?", a: "Cloud resources are created quickly by many people, often through code, and one wrong setting can expose them to the whole internet. Without logging and posture checks, nobody notices until an attacker or researcher does." },
      { q: "Is a public S3 bucket always a problem?", a: "Not always; some buckets hold public website files on purpose. It is a problem when it is unintended or holds anything private, and serving public files through a CDN with a private bucket is safer anyway." },
      { q: "Does turning on CloudTrail cost money?", a: "The first copy of management events delivered by a trail is free; you pay for the S3 storage. Data events, extra copies and features like CloudTrail Lake are charged." },
      { q: "What is the difference between CSPM and a vulnerability scanner?", a: "A vulnerability scanner looks for known software flaws inside machines and images. CSPM looks at how your cloud account and services are configured, such as public buckets, open ports and missing logs." },
    ],
  },

  "sec-cloud-grc/frameworks": {
    plain: [
      "A security framework is a shared map of what a good security programme should cover. Instead of each company inventing its own list, they use a well-known one, so managers, auditors, customers and engineers speak the same language.",
      "The NIST Cybersecurity Framework (CSF) 2.0 sorts all security work into six functions: Govern, Identify, Protect, Detect, Respond and Recover. It is free and flexible, and popular for planning and for explaining security to leaders.",
      "ISO/IEC 27001 is an international standard for an information security management system (ISMS): the way a company runs security as an ongoing, managed process. An independent auditor can certify a company against it, and customers often ask for that certificate.",
      "The CIS Critical Security Controls are a practical, prioritised to-do list: 18 controls broken into concrete safeguards, like keeping an inventory of devices or requiring MFA for admins. Many teams use CIS to decide what to do first, and NIST CSF or ISO 27001 to organise and prove it.",
    ],
    deepDive: [
      {
        heading: "How NIST CSF 2.0 is organised",
        body: "CSF 2.0 was released in February 2024. It has three levels. The six functions are the top. Each function holds categories, 22 in total, with short codes such as ID.AM (asset management), PR.AA (identity management, authentication and access control) and DE.CM (continuous monitoring). Each category holds subcategories, 106 in total, which are specific outcomes such as PR.AA-03: users, services and hardware are authenticated.\n\nGovern is new in 2.0 and sits at the centre: it covers strategy, roles, policy, oversight and supply chain risk. CSF describes outcomes, not how to achieve them, so it suits any size of organisation. You use it through profiles: a current profile (where you are) and a target profile (where you want to be). The gap between them becomes your plan. Tiers 1 to 4 (Partial, Risk Informed, Repeatable, Adaptive) describe how mature and rigorous your practices are. CSF is voluntary and cannot be certified.",
        visual: {
          type: "tree",
          title: "NIST CSF 2.0: functions and example categories",
          root: "NIST CSF 2.0",
          children: [
            { label: "Govern (GV)", children: ["GV.RM Risk management strategy", "GV.SC Supply chain risk"] },
            { label: "Identify (ID)", children: ["ID.AM Asset management", "ID.RA Risk assessment"] },
            { label: "Protect (PR)", children: ["PR.AA Identity and access", "PR.DS Data security"] },
            { label: "Detect (DE)", children: ["DE.CM Continuous monitoring", "DE.AE Adverse event analysis"] },
            { label: "Respond (RS)", children: ["RS.MA Incident management", "RS.CO Reporting and communication"] },
            { label: "Recover (RC)", children: ["RC.RP Recovery plan execution", "RC.CO Recovery communication"] },
          ],
        },
      },
      {
        heading: "ISO 27001 and how certification works",
        body: "ISO/IEC 27001:2022 has two parts. Clauses 4 to 10 are mandatory management requirements: understand your context and scope, get leadership commitment, assess and treat risks, provide resources and training, operate the controls, measure them through internal audits and management reviews, and keep improving. Annex A lists 93 controls in four themes: organisational (37), people (8), physical (14) and technological (34). ISO/IEC 27002 explains each control in more detail.\n\nYou do not have to use every Annex A control. The Statement of Applicability (SoA) lists each control, whether it applies, whether it is implemented and why. Certification is done by an accredited certification body in two stages: Stage 1 reviews documentation and readiness, Stage 2 tests that the ISMS really works. The certificate lasts three years, with surveillance audits each year and a recertification audit at the end. The transition period from the 2013 version ended in October 2025.",
        visual: {
          type: "flow",
          title: "The road to ISO 27001 certification",
          steps: [
            { label: "Scope", detail: "Which teams, sites and systems" },
            { label: "Risk assessment", detail: "Find and rate risks" },
            { label: "Controls and SoA", detail: "Choose and justify controls" },
            { label: "Run and review", detail: "Internal audit, management review" },
            { label: "Stage 1 and 2", detail: "External audit, certificate issued" },
            { label: "Yearly surveillance", detail: "Recertify every 3 years" },
          ],
        },
      },
      {
        heading: "CIS Controls and Implementation Groups",
        body: "The CIS Critical Security Controls, version 8.1 since 2024, contain 18 controls and 153 safeguards. They start with the basics: 1 inventory of enterprise assets, 2 inventory of software, 3 data protection, 4 secure configuration, 5 account management, 6 access control management, 7 continuous vulnerability management and 8 audit log management. Later controls cover areas such as email and browser protection, malware defences, data recovery, security awareness training, service provider management, application security, incident response and penetration testing.\n\nImplementation Groups make the list practical. IG1, called essential cyber hygiene, is 56 safeguards that every organisation should do, even a small one with no security staff. IG2 adds safeguards for organisations with more complex IT, and IG3 includes all of them for organisations facing skilled attackers. Do not confuse the CIS Controls with the CIS Benchmarks: the Benchmarks are detailed hardening guides for specific products, such as Windows Server or AWS.",
        visual: {
          type: "layers",
          title: "CIS Implementation Groups build on each other",
          layers: [
            { label: "IG3", detail: "All 153 safeguards, for skilled-attacker threats" },
            { label: "IG2", detail: "IG1 plus more for complex, regulated IT" },
            { label: "IG1", detail: "56 safeguards of essential cyber hygiene" },
          ],
        },
      },
      {
        heading: "Mapping one control across frameworks",
        body: "Many organisations must satisfy several frameworks at once, for example ISO 27001 for customers and NIST CSF for the board. Doing the work three times is wasteful. Instead, build a control matrix: each row is one real control you operate, with its owner, how it is implemented, what evidence proves it, and the IDs it satisfies in each framework.\n\nTake MFA for administrators. It meets CIS Safeguard 6.5 (require MFA for administrative access), supports NIST CSF 2.0 PR.AA-03 (users, services and hardware are authenticated) and ISO 27001:2022 Annex A 8.5 (secure authentication). One implementation, such as a conditional access policy that requires phishing-resistant MFA for all admin roles, and one evidence set, such as a policy export and a sign-in report, cover all three. NIST and CIS publish official mappings, which save time and reduce arguments with auditors.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three frameworks at a glance",
        columns: [
          { title: "NIST CSF 2.0", points: ["Six outcome-based functions", "Free and voluntary", "Not certifiable", "Great for strategy and board reports"] },
          { title: "ISO/IEC 27001", points: ["Management system standard", "Paid standard document", "Certifiable by accredited auditors", "Often required by customers"] },
          { title: "CIS Controls v8.1", points: ["Prioritised technical actions", "Free to download", "Implementation Groups IG1 to IG3", "Great for deciding what to do first"] },
        ],
      },
    ],
    examples: [
      {
        title: "A control matrix row for admin MFA",
        explanation: "Step 1: describe the control in your own words, as you actually run it. Step 2: name one owner. Step 3: describe the implementation precisely enough that an auditor could test it. Step 4: list the evidence and how often it is collected. Step 5: add the framework IDs it satisfies. When an ISO auditor, a customer questionnaire and a CSF assessment all ask about MFA, you answer from this one row.",
        code: {
          lang: "text",
          code: `Control ID:   IAM-03  MFA for all administrative access
Owner:        Head of IT
Implementation: Entra ID conditional access requires phishing-resistant
                MFA (passkeys or FIDO2 keys) for all admin roles;
                cloud consoles use SSO only
Evidence:     Monthly export of the policy; sign-in report showing
              MFA on 100% of admin sign-ins; exceptions list
Maps to:      CIS 6.5 | NIST CSF PR.AA-03 | ISO 27001 A.8.5`,
        },
      },
      {
        title: "A quick gap assessment with CSF profiles",
        explanation: "A 60-person software company wants a one-year plan. Step 1: pick about ten categories that matter most, such as ID.AM, PR.AA, PR.DS, DE.CM and RS.MA. Step 2: for each, score the current state from 0 to 4 with short evidence notes; for example DE.CM scores 1 because only firewall logs are collected. Step 3: set a target score for each, based on risk and customer demands; DE.CM gets a target of 3. Step 4: rank gaps by size and risk. Step 5: turn the top gaps into projects, such as deploying EDR and a SIEM, each with an owner and a quarter. Step 6: report progress to leaders against the same profile every quarter.",
      },
    ],
    cheatSheet: [
      "NIST CSF 2.0 functions: Govern, Identify, Protect, Detect, Respond, Recover",
      "CSF 2.0 has 22 categories and 106 subcategories, for example PR.AA-03",
      "ISO 27001:2022 Annex A: 93 controls in 4 themes (organisational, people, physical, technological)",
      "The Statement of Applicability lists which Annex A controls apply and why",
      "ISO 27001 certificates last 3 years, with yearly surveillance audits",
      "CIS Controls v8.1: 18 controls, 153 safeguards; IG1 (56 safeguards) is essential hygiene",
      "CIS Controls say what to do; CIS Benchmarks say how to harden one product",
      "Map once: one control with one evidence set can satisfy several frameworks",
    ],
    quiz: [
      {
        q: "Which function was added in NIST CSF 2.0?",
        options: ["Identify", "Detect", "Recover", "Govern"],
        answer: 3,
        why: "CSF 2.0 added Govern to cover strategy, roles, policy, oversight and supply chain risk.",
      },
      {
        q: "Which can an organisation be formally certified against by an accredited auditor?",
        options: ["NIST CSF", "ISO/IEC 27001", "CIS Controls", "MITRE ATT&CK"],
        answer: 1,
        why: "ISO 27001 is a certifiable management system standard; the others are not certified.",
      },
      {
        q: "A 15-person company with no security staff asks what to do first. What is the best starting point?",
        options: ["An ISO 27001 Stage 2 audit", "Reaching NIST Tier 4", "CIS Controls Implementation Group 1", "Building an ATT&CK coverage map"],
        answer: 2,
        why: "IG1 is a short, prioritised list of essential safeguards designed for small organisations.",
      },
      {
        q: "What is the Statement of Applicability in ISO 27001?",
        options: ["A document listing which Annex A controls apply, whether they are implemented, and why", "The certificate from the auditor", "The incident response plan", "A penetration test report"],
        answer: 0,
        why: "The SoA justifies the selection of controls and is a key document in every audit.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Put each activity under a NIST CSF function: keeping an asset inventory, enforcing MFA, reviewing SIEM alerts, restoring from backup, approving the security policy, isolating an infected host.",
        hint: "Ask whether the activity is about direction, knowing, preventing, noticing, acting or restoring.",
        solution: "Asset inventory: Identify\nEnforcing MFA: Protect\nReviewing SIEM alerts: Detect\nRestoring from backup: Recover\nApproving the security policy: Govern\nIsolating an infected host: Respond",
      },
      {
        level: "medium",
        task: "Write three rows of a control matrix (control, owner, evidence, mappings) for: centralised logging, quarterly access reviews and offline backups.",
        hint: "Look for the matching CIS Control numbers (8, 5 or 6, 11) and CSF categories (DE.CM, PR.AA, PR.DS or RC.RP).",
        solution: "LOG-01 Central logging, 90 days hot | SOC lead | SIEM source list, retention config\n  CIS 8 | CSF DE.CM | ISO A.8.15\nIAM-07 Quarterly access review | IT manager | signed review tickets\n  CIS 5, 6 | CSF PR.AA | ISO A.5.18\nBCK-02 Offline backups, tested monthly | Ops lead | backup reports, restore tests\n  CIS 11 | CSF PR.DS, RC.RP | ISO A.8.13",
      },
      {
        level: "hard",
        task: "Create a current and target profile for five CSF categories of a small online shop, then rank the gaps and propose one project for the biggest gap.",
        hint: "Score 0 to 4, write one line of evidence each, and weigh gaps by risk, not only size.",
        solution: "Category | Current | Target | Evidence\nID.AM    | 1 | 3 | spreadsheet of servers only, no laptops\nPR.AA    | 2 | 4 | MFA on email, not on admin consoles\nDE.CM    | 1 | 3 | firewall logs only, nobody reviews them\nRS.MA    | 0 | 2 | no IR plan\nRC.RP    | 2 | 3 | backups exist, never test-restored\nRank: PR.AA (admin takeover risk), DE.CM, RS.MA, ID.AM, RC.RP\nProject: enforce phishing-resistant MFA and SSO on all admin consoles in Q1.",
      },
    ],
    faq: [
      { q: "Which framework should my company use?", a: "Small companies often start with CIS IG1 for concrete actions and use NIST CSF to explain progress. If customers ask for a certificate, plan for ISO 27001. Many organisations use more than one and map between them." },
      { q: "Is NIST CSF only for US companies?", a: "No. It is free, voluntary and used worldwide by organisations of every size, and it has been translated into several languages." },
      { q: "What is the difference between ISO 27001 and ISO 27002?", a: "ISO 27001 holds the requirements you are certified against, including the list of Annex A controls. ISO 27002 is a guidance document explaining how to implement each of those controls." },
      { q: "Does following a framework make us secure?", a: "Not by itself. A framework helps you cover the right areas and prove it, but security depends on how well the controls actually work day to day." },
    ],
  },

  "sec-cloud-grc/risk-compliance": {
    plain: [
      "Risk is the chance that something bad happens, combined with how bad it would be. Security teams cannot fix everything at once, so they use risk to decide what matters most and where to spend time and money.",
      "A risk register is a simple, living table of risks. For each one it records what could happen, how likely and how harmful it is, who owns it, what you are doing about it, and when you will check again. A spreadsheet is enough to start.",
      "Policies, standards and procedures are the written rules. A policy says what the company wants and why. A standard sets specific, measurable requirements. A procedure gives the step-by-step how. Guidelines are helpful advice, not requirements.",
      "Compliance means meeting outside rules: laws like GDPR, industry standards like PCI DSS for card payments, or customer demands like a SOC 2 report. An audit checks, with evidence, that you really do what your rules say.",
    ],
    deepDive: [
      {
        heading: "Building a simple risk register",
        body: "Write each risk as cause, event and consequence, so everyone understands it the same way: \"Because admin accounts lack MFA, an attacker could take one over through phishing, leading to data theft and a long outage.\" Then score likelihood and impact, each from 1 to 5, and multiply them for a score from 1 to 25. This is the inherent risk. List the existing controls and score again to get the residual risk.\n\nChoose a treatment. Mitigate: add controls to lower likelihood or impact. Transfer: shift some of the cost, for example with cyber insurance or a contract. Avoid: stop the risky activity, such as no longer storing card numbers. Accept: live with it, but only with formal sign-off by the risk owner and within the risk appetite leaders have set. The owner should be a business person who can make that decision, not just the security team. Review the register every quarter and after major changes or incidents.",
        bullets: ["Columns: ID, description, owner, likelihood, impact, score", "Existing controls, treatment, residual score", "Action, due date, status, next review"],
      },
      {
        heading: "Qualitative vs quantitative risk",
        body: "Qualitative scoring uses scales such as 1 to 5 or low, medium and high. It is fast and works well for ranking, but two people can score the same risk differently, so write down what each number means.\n\nQuantitative scoring uses money. The single loss expectancy (SLE) is the cost of one event: asset value times exposure factor, the share of the value lost. The annualised rate of occurrence (ARO) is how often you expect it per year. The annualised loss expectancy (ALE) is SLE times ARO. If a ransomware outage would cost $200,000 and you expect one every four years (ARO 0.25), the ALE is $50,000 a year. A control costing $20,000 a year that halves the likelihood saves $25,000 a year, so it pays for itself.\n\nThe FAIR method refines this by using ranges instead of single guesses, which is more honest about uncertainty.",
        visual: {
          type: "compare",
          title: "Two ways to score risk",
          columns: [
            { title: "Qualitative", points: ["Scales like 1 to 5", "Fast and easy to explain", "Good for ranking risks", "Subjective without clear definitions"] },
            { title: "Quantitative", points: ["Money: SLE, ARO, ALE", "Supports cost-benefit decisions", "Needs data and estimates", "Ranges (FAIR) show uncertainty"] },
          ],
        },
      },
      {
        heading: "Policy, standard, procedure and guideline in practice",
        body: "Here is one chain from top to bottom. Policy, approved by leadership: \"Access to company systems must use strong authentication.\" It is short, stable and says what and why. Standard, owned by security: \"All accounts require MFA. Administrators must use phishing-resistant MFA such as passkeys or security keys. Passwords must be at least 14 characters.\" It is specific and testable. Procedure, owned by IT: the exact steps to enrol a security key and what to do if one is lost. Guideline: \"Use the company password manager for all work passwords.\"\n\nKeep policies few and readable; long policies nobody reads protect nobody. Give every document an owner, a version and a review date, usually yearly. Add an exception process: when a team cannot meet a standard, they request an exception with a reason, a compensating control and an end date, and it goes into the risk register.",
      },
      {
        heading: "GDPR, PCI DSS and SOC 2 in brief",
        body: "GDPR is an EU law, in force since May 2018, that protects the personal data of people in the EU. It also applies to organisations elsewhere that offer goods or services to them or monitor their behaviour. It requires appropriate security, breach reports to the supervisory authority within 72 hours where required, and allows fines of up to 20 million euros or 4% of global annual turnover, whichever is higher.\n\nPCI DSS is set by the PCI Security Standards Council and applies to anyone who stores, processes or transmits cardholder data. Version 4.0.1 is current, with 12 high-level requirements. Compliance is validated by a Qualified Security Assessor or a Self-Assessment Questionnaire, depending on volume. Using a hosted payment page or tokenisation shrinks the scope a lot.\n\nSOC 2 is an attestation report from a licensed CPA firm against the AICPA Trust Services Criteria. Type I checks control design at one date; Type II tests operation over a period.",
        visual: {
          type: "compare",
          title: "Three common compliance drivers",
          columns: [
            { title: "GDPR", points: ["EU law on personal data", "Applies worldwide in some cases", "72-hour breach notification", "Fines up to 4% of turnover"] },
            { title: "PCI DSS", points: ["Card industry standard", "Any party handling card data", "12 requirements, v4.0.1", "QSA report or self-assessment"] },
            { title: "SOC 2", points: ["Attestation by a CPA firm", "Trust Services Criteria", "Type I design, Type II operation", "Customers ask for the report"] },
          ],
        },
      },
      {
        heading: "Audits and evidence collection",
        body: "An auditor tests two things. Design: does a suitable control exist on paper? Operating effectiveness: did it actually work, every time, over the audit period? For the second, they usually sample. If you made 312 changes this year, they may pick 25 and ask for the approval record of each one. One missing approval becomes an exception in the report.\n\nGood evidence is dated, complete, ideally generated by a system rather than typed by hand, and linked to a control ID. Typical evidence includes policy documents with approval dates, configuration exports, access review tickets, change approvals, training records and log extracts. Collect it continuously, not in a panic the week before the audit; compliance automation tools can pull much of it from cloud and identity platforms. Treat findings like bugs: each gets an owner, a fix and a date.",
        visual: {
          type: "sequence",
          title: "How sampling works in an audit",
          actors: ["Auditor", "Control owner"],
          messages: [
            { from: 0, to: 1, label: "Send the full list of changes this year" },
            { from: 1, to: 0, label: "Export of 312 change tickets" },
            { from: 0, to: 1, label: "Show approvals for these 25" },
            { from: 1, to: 0, label: "24 approved tickets, 1 missing" },
            { from: 0, to: 1, label: "Exception noted; remediation plan please" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The risk management cycle",
        steps: [
          { label: "Identify", detail: "What could go wrong, and to what" },
          { label: "Assess", detail: "Likelihood times impact" },
          { label: "Treat", detail: "Mitigate, transfer, avoid or accept" },
          { label: "Monitor", detail: "Track actions and new threats" },
          { label: "Review", detail: "Quarterly and after incidents" },
        ],
      },
      {
        type: "tree",
        title: "Four ways to treat a risk",
        root: "Risk treatment",
        children: [
          { label: "Mitigate", children: ["Add MFA", "Patch faster", "Segment the network"] },
          { label: "Transfer", children: ["Cyber insurance", "Contract terms with a supplier"] },
          { label: "Avoid", children: ["Stop storing card numbers", "Retire the old app"] },
          { label: "Accept", children: ["Owner signs off", "Within risk appetite", "Review date set"] },
        ],
      },
    ],
    examples: [
      {
        title: "Three rows of a real risk register",
        explanation: "A small SaaS company starts its register with its three biggest worries. Each row has a clear description, a business owner, scores before and after controls, a treatment and a date. Risk R2 is accepted, so it shows who accepted it and when it will be looked at again. Notice that the scores are only useful because the team agreed what each number means, for example impact 5 means more than a week of outage or a reportable data breach.",
        code: {
          lang: "text",
          code: `ID | Risk (cause > event > consequence)               | Owner | L x I | Treatment            | Residual | Due
R1 | No MFA on admin consoles > account takeover      | CTO   | 4x5=20| Mitigate: passkeys   | 1x5=5    | 31 Mar
   |   via phishing > data theft, outage              |       |       |   and SSO for admins |          |
R2 | Legacy reporting server unpatchable > exploit    | COO   | 2x3=6 | Accept until retired | 2x3=6    | review 30 Jun
   |   > internal reports exposed                     |       |       |   (signed 10 Jan)    |          |
R3 | Backups in same account > ransomware deletes     | CTO   | 3x5=15| Mitigate: immutable  | 1x4=4    | 28 Feb
   |   them > no recovery                             |       |       |   copy, other account|          |`,
        },
      },
      {
        title: "Preparing evidence for a SOC 2 access review control",
        explanation: "The control says: \"Managers review user access to production systems every quarter, and removals are completed within 5 business days.\" Step 1: export the list of users with production access at the start of each quarter, straight from the identity provider, with the export date visible. Step 2: send each manager their list as a ticket; they mark keep or remove and approve. Step 3: link each removal to the change that removed it and its completion date. Step 4: store all four quarters in a folder named after the control ID. If one quarter's review was late, say so and show the fix; auditors trust honest exceptions more than suspiciously perfect evidence.",
      },
    ],
    cheatSheet: [
      "Risk = likelihood x impact; scoring each 1 to 5 gives a simple 1 to 25 scale",
      "Treatments: mitigate, transfer, avoid, accept (accept needs the risk owner's sign-off)",
      "ALE = SLE x ARO, and SLE = asset value x exposure factor",
      "Policy = what and why; standard = measurable rule; procedure = steps; guideline = advice",
      "GDPR fines: up to 20 million euros or 4% of global annual turnover, whichever is higher",
      "PCI DSS covers anyone storing, processing or transmitting card data; v4.0.1 is current",
      "SOC 2 Type I = design at one date; Type II = operating effectiveness over a period",
      "Audit evidence: dated, system-generated where possible, and linked to a control ID",
    ],
    quiz: [
      {
        q: "A company buys cyber insurance to cover ransomware costs. Which risk treatment is this?",
        options: ["Transfer", "Avoid", "Accept", "Mitigate"],
        answer: 0,
        why: "Insurance shifts part of the financial impact to another party.",
      },
      {
        q: "\"Passwords must be at least 14 characters\" is best described as a...",
        options: ["Policy", "Guideline", "Standard", "Procedure"],
        answer: 2,
        why: "It is a specific, measurable requirement that supports a higher-level policy.",
      },
      {
        q: "Which statement about SOC 2 is true?",
        options: ["It is a government law", "It is issued by ISO", "It only covers card payments", "It is an attestation report by a CPA firm against the Trust Services Criteria"],
        answer: 3,
        why: "SOC 2 is an AICPA framework reported on by licensed CPA firms, not a law or certificate.",
      },
      {
        q: "An outage costs $40,000 each time and is expected twice a year. What is the ALE?",
        options: ["$20,000", "$80,000", "$40,000", "$160,000"],
        answer: 1,
        why: "ALE = SLE x ARO = $40,000 x 2 = $80,000 per year.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write two risks for a small online shop in cause, event, consequence form, and give each a likelihood and impact score from 1 to 5.",
        hint: "Pick realistic causes, like missing patches or shared passwords.",
        solution: "R1: Because the shop plugin is rarely updated, an attacker could exploit a known flaw,\n    leading to card skimming on the checkout page. L4 x I5 = 20.\nR2: Because staff share one admin password, a leaver could still log in,\n    leading to price changes or data theft. L3 x I4 = 12.",
      },
      {
        level: "medium",
        task: "Write a matching policy statement, standard and short procedure for backups.",
        hint: "Policy: what and why. Standard: numbers you can test. Procedure: the steps.",
        solution: "Policy: Business data must be backed up so it can be recovered after loss or attack.\nStandard: Daily backups; 30 days kept; one copy immutable and in a separate account;\n  restore test every month; recovery within 24 hours for critical systems.\nProcedure: 1) Check the backup dashboard each morning. 2) Open a ticket for any failure.\n  3) On the first Monday, restore one system to a test area and record the time taken.",
      },
      {
        level: "hard",
        task: "A customer database is worth $500,000. A breach would lose 40% of that value and is expected once every 5 years. A data loss prevention tool costs $30,000 a year and would cut the likelihood by 60%. Is it worth it?",
        hint: "Compute SLE, ARO and ALE before and after, then compare the saving with the cost.",
        solution: "SLE = 500,000 x 0.4 = $200,000\nARO = 1/5 = 0.2, so ALE = 200,000 x 0.2 = $40,000 a year\nNew ARO = 0.2 x 0.4 = 0.08, so new ALE = $16,000 a year\nSaving = 40,000 - 16,000 = $24,000 a year\nCost = $30,000 a year, so on these numbers it is not worth it alone.\nLook for a cheaper control, or count other benefits (compliance, reputation).",
      },
    ],
    faq: [
      { q: "Is compliance the same as security?", a: "No. Compliance proves you meet a defined set of rules at audit time. Security is whether you can actually resist and recover from attacks. Good programmes use compliance as a floor, not a ceiling." },
      { q: "Does GDPR apply to companies outside the EU?", a: "It can. If you offer goods or services to people in the EU, or monitor their behaviour, GDPR can apply even if your company has no office there." },
      { q: "What is the difference between SOC 2 and ISO 27001?", a: "ISO 27001 is an international certification of your security management system. SOC 2 is a US-origin attestation report by a CPA firm describing your controls and, for Type II, how well they worked over a period. Many SaaS companies end up with both." },
      { q: "Who should own a risk?", a: "A business leader who has the authority and budget to treat it, such as the head of the affected service. Security advises and tracks, but the owner decides whether to accept or fix." },
    ],
  },
};

export default extra;
