import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-security/iam-deep": {
    plain: [
      "IAM (Identity and Access Management) answers two questions for every request to AWS: who is asking, and are they allowed to do this? Every click in the console and every CLI or SDK call is an API request, and IAM checks each one. If nothing says \"allow\", the answer is no.",
      "There are three kinds of identity. A user is one person or app with a permanent password or access key. A group is a bundle of users so you can give the same permissions to many people at once. A role has no permanent password at all: someone or something borrows it for a while and gets short-lived keys.",
      "Permissions are written as policies: small JSON documents that list actions (like s3:GetObject), resources (like one bucket) and optional conditions (like \"only over HTTPS\"). You attach a policy to an identity, or to a resource such as a bucket, which then says who may use it.",
      "Least privilege means giving only the permissions a job really needs. It feels slower at first, but it limits the damage when a key leaks or an app has a bug. Most real AWS breaches start with credentials that had far more access than they needed.",
    ],
    deepDive: [
      {
        heading: "Users, groups and roles: when to use each",
        body: "Use IAM users only when you must: break-glass access, or an old tool that cannot use roles. Their access keys never expire on their own, so they leak easily. For people, prefer IAM Identity Center, which issues role sessions behind the scenes.\n\nGroups are just a way to attach policies to many users. They cannot be nested, and a group cannot be named as a principal in a resource policy.\n\nRoles are the workhorse. EC2 instances, Lambda functions, ECS tasks, other AWS accounts and federated users all assume roles. A role session lasts one hour by default, and the role's maximum session duration can be set from 1 to 12 hours. When one role assumes another (role chaining), the session is limited to one hour.",
        visual: {
          type: "compare",
          title: "Three kinds of identity",
          columns: [
            { title: "IAM user", points: ["Long-term password or keys", "One person or legacy app", "Keys must be rotated by you", "Avoid for daily human access"] },
            { title: "IAM group", points: ["Collection of users", "Attach policies once", "Cannot be nested", "Not a principal itself"] },
            { title: "IAM role", points: ["No long-term credentials", "Assumed via AWS STS", "1 hour default session", "Used by services and accounts"] },
          ],
        },
      },
      {
        heading: "Anatomy of a policy",
        body: "Every policy has a Version, always \"2012-10-17\", and one or more statements. Each statement has an Effect (Allow or Deny), an Action list, a Resource list, and optionally a Condition. Resource-based policies, such as bucket policies and role trust policies, also have a Principal that names who the statement applies to.\n\nConditions make policies precise. aws:SourceIp limits callers to an IP range. aws:MultiFactorAuthPresent requires MFA. aws:PrincipalOrgID allows anyone in your organization without listing every account. aws:RequestedRegion limits Regions. Tag keys such as aws:PrincipalTag and aws:ResourceTag enable attribute-based access control (ABAC), where a user can only touch resources carrying the same team tag.\n\nPolicies come in three flavors: AWS managed (maintained by AWS, often too broad), customer managed (yours, reusable and versioned), and inline (embedded in one identity). Prefer customer managed policies for anything you write.",
        bullets: ["Effect, Action, Resource, Condition, plus Principal in resource policies", "NotAction and NotResource invert a list; use them carefully", "A customer managed policy can hold up to 6,144 characters", "Policy variables like aws:username personalize one policy for many users"],
      },
      {
        heading: "Same account versus cross-account",
        body: "Inside one account, a request is allowed if an identity-based policy or a resource-based policy allows it, and nothing denies it. A bucket policy that names a user can grant access even if the user has no IAM policy for S3.\n\nAcross accounts the rule is stricter: both sides must agree. The caller's account must allow the action in an identity policy, and the resource's account must allow it in a resource policy or a role trust policy. If either side is silent, the request fails.\n\nOn top of that, every guardrail still applies: SCPs on the caller's account, RCPs on the resource's account, permissions boundaries, and session policies. Guardrails can only remove permissions. A common surprise is KMS: reading an SSE-KMS object in another account also needs kms:Decrypt allowed in the key policy, not just the bucket policy.",
        visual: {
          type: "compare",
          title: "When is a request allowed?",
          columns: [
            { title: "Same account", points: ["Identity policy OR resource policy allows", "No explicit deny anywhere", "SCPs, boundaries and session policies allow", "A bucket policy alone can be enough"] },
            { title: "Cross-account", points: ["Identity policy in caller account allows", "AND resource or trust policy allows", "No explicit deny anywhere", "Guardrails in both accounts allow"] },
          ],
        },
      },
      {
        heading: "Cross-account roles and the confused deputy",
        body: "To let account A use account B, create a role in B. Its trust policy names A as the principal, for example arn:aws:iam::111122223333:root, which means \"any identity in A that has permission\". In A, give the caller an identity policy allowing sts:AssumeRole on that role ARN. The caller then calls AssumeRole and receives temporary keys for B.\n\nWhen a third party, such as a monitoring vendor, assumes a role in your account, add an ExternalId condition. Without it, another customer of that vendor could trick the vendor into using your role, the so-called confused deputy problem. For AWS services acting on your behalf, use aws:SourceArn and aws:SourceAccount conditions for the same reason.\n\nEvery AssumeRole call is logged in CloudTrail in both accounts, so you can see who borrowed which role and when.",
        visual: {
          type: "sequence",
          title: "Account A reads a table in account B",
          actors: ["App in account A", "AWS STS", "Role in account B", "DynamoDB in B"],
          messages: [
            { from: 0, to: 1, label: "AssumeRole for the role ARN in B" },
            { from: 1, to: 2, label: "Check trust policy allows account A" },
            { from: 1, to: 0, label: "Temporary keys, about 1 hour" },
            { from: 0, to: 3, label: "GetItem signed with role keys" },
            { from: 3, to: 0, label: "Item returned if role policy allows" },
          ],
        },
      },
      {
        heading: "Testing and tightening policies",
        body: "Do not guess whether a policy works. The IAM policy simulator, in the console or through aws iam simulate-principal-policy, evaluates real policies against chosen actions and resources and tells you allowed, implicitly denied or explicitly denied, and which statement decided it.\n\nIAM Access Analyzer does more. Policy validation flags errors and risky patterns while you write. External access findings show resources, such as buckets, roles and KMS keys, that are shared outside your account or organization. Unused access findings list roles, keys and permissions nobody has used. Policy generation reads CloudTrail history and drafts a policy containing only the actions a role really called.\n\nThe last accessed information on each user or role shows which services were used recently. Removing services nobody touched in 90 days is an easy, safe way to move toward least privilege.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Kinds of IAM policy",
        root: "Policies",
        children: [
          { label: "Identity-based", children: ["AWS managed", "Customer managed", "Inline"] },
          { label: "Resource-based", children: ["S3 bucket policy", "Role trust policy", "KMS key policy", "SQS queue policy"] },
          { label: "Guardrails (limit only)", children: ["SCP", "RCP", "Permissions boundary"] },
          { label: "Session policy", children: ["Passed during AssumeRole", "Narrows one session"] },
        ],
      },
    ],
    examples: [
      {
        title: "Team-scoped EC2 control with tags (ABAC)",
        explanation: "Developers should start and stop only their own team's instances. Step 1: tag each developer's role or user with team=payments or team=search. Step 2: tag each instance with the same key. Step 3: write one policy that compares the two tags, so it works for every team without listing instance IDs. Step 4: test it: a payments developer stopping a search instance gets AccessDenied. Describe calls do not support resource-level conditions, so they get a separate statement.",
        code: {
          lang: "json",
          code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ec2:StartInstances", "ec2:StopInstances"],
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {"StringEquals":
        {"aws:ResourceTag/team": "\${aws:PrincipalTag/team}"}}
    },
    {"Effect": "Allow", "Action": "ec2:DescribeInstances", "Resource": "*"}
  ]
}`,
        },
      },
      {
        title: "Predicting a cross-account S3 read",
        explanation: "A role in account A wants to read s3://partner-data/2026/sales.csv in account B. Step 1: the role's identity policy allows s3:GetObject on that ARN. Not enough yet. Step 2: the bucket policy in B is checked; it does not mention A, so the request is denied. Step 3: B adds a bucket policy statement allowing that role ARN to call s3:GetObject on partner-data/2026/*. Now it works for SSE-S3 objects. Step 4: the file is encrypted with a customer managed KMS key in B, and the read fails again. Step 5: B adds the role to the key policy with kms:Decrypt, and A's identity policy allows kms:Decrypt on that key ARN. Now every layer agrees, and the read succeeds.",
      },
    ],
    cheatSheet: [
      "Default is implicit deny; any explicit Deny beats every Allow",
      "Same account: identity OR resource policy can allow. Cross-account: both sides must allow",
      "SCPs, RCPs, boundaries and session policies only limit; they never grant",
      "Role sessions default to 1 hour, max 12 hours; role chaining caps at 1 hour",
      "Use ExternalId in trust policies for third parties to stop the confused deputy",
      "aws iam simulate-principal-policy tests real policies against actions and ARNs",
      "Access Analyzer finds external sharing, unused access, and can generate policies from CloudTrail",
      "Groups cannot be nested and cannot be a principal",
    ],
    quiz: [
      {
        q: "A role in account A has s3:GetObject on a bucket in account B, but the bucket policy does not mention A. What happens?",
        options: ["Allowed, the identity policy is enough", "Allowed if the object is public-read", "Denied, the resource account must also allow it", "Denied only for writes"],
        answer: 2,
        why: "Cross-account requests need an allow in both the caller's and the resource's account.",
      },
      {
        q: "A vendor's account assumes a role in your account. What prevents another vendor customer from tricking the vendor into using it?",
        options: ["An ExternalId condition in the trust policy", "A longer session duration", "An inline policy instead of managed", "Enabling MFA on root"],
        answer: 0,
        why: "ExternalId is a shared secret value that only your vendor configuration knows, solving the confused deputy problem.",
      },
      {
        q: "Which statement about IAM groups is true?",
        options: ["Groups can contain other groups", "Groups can be the Principal in a bucket policy", "Groups can assume roles", "Groups only attach permissions to users"],
        answer: 3,
        why: "A group is only a container for attaching policies to users; it is not an identity itself.",
      },
      {
        q: "You want a policy containing only the actions a role actually used last month. Which tool helps most?",
        options: ["AWS Config", "IAM Access Analyzer policy generation", "Trusted Advisor", "AWS Budgets"],
        answer: 1,
        why: "Policy generation reads CloudTrail activity and drafts a least-privilege policy.",
      },
      {
        q: "Role X assumes role Y, which then assumes role Z. What is the maximum session length for Z?",
        options: ["1 hour", "12 hours", "36 hours", "It inherits X's setting"],
        answer: 0,
        why: "Role chaining limits each chained session to one hour regardless of the role's maximum.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a policy that lets a user list one bucket called team-docs and read objects in it, nothing else.",
        hint: "ListBucket applies to the bucket ARN; GetObject applies to the object ARNs.",
        solution: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\"Effect\": \"Allow\", \"Action\": \"s3:ListBucket\",\n     \"Resource\": \"arn:aws:s3:::team-docs\"},\n    {\"Effect\": \"Allow\", \"Action\": \"s3:GetObject\",\n     \"Resource\": \"arn:aws:s3:::team-docs/*\"}\n  ]\n}",
      },
      {
        level: "medium",
        task: "Create a role in your account that a second account (222233334444) can assume, then assume it from the CLI.",
        hint: "The trust policy names the other account; the caller needs sts:AssumeRole.",
        solution: "# trust.json\n{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\n \"Principal\":{\"AWS\":\"arn:aws:iam::222233334444:root\"},\n \"Action\":\"sts:AssumeRole\"}]}\naws iam create-role --role-name PartnerRead \\\n  --assume-role-policy-document file://trust.json\naws iam attach-role-policy --role-name PartnerRead \\\n  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess\n# from account 222233334444:\naws sts assume-role --role-arn arn:aws:iam::111122223333:role/PartnerRead \\\n  --role-session-name test",
      },
      {
        level: "hard",
        task: "Use the policy simulator CLI to prove that a role called app can read but not delete objects under reports-bucket/2026/.",
        hint: "simulate-principal-policy takes the role ARN, several action names and resource ARNs.",
        solution: "aws iam simulate-principal-policy \\\n  --policy-source-arn arn:aws:iam::111122223333:role/app \\\n  --action-names s3:GetObject s3:DeleteObject \\\n  --resource-arns arn:aws:s3:::reports-bucket/2026/a.csv \\\n  --query \"EvaluationResults[].[EvalActionName,EvalDecision]\" \\\n  --output table\n# Expected: s3:GetObject allowed, s3:DeleteObject implicitDeny",
      },
    ],
    faq: [
      { q: "What is the difference between an IAM role and an IAM user?", a: "A user has permanent credentials tied to one identity. A role has no permanent credentials; trusted principals assume it and get temporary keys that expire." },
      { q: "Why is the policy Version always 2012-10-17?", a: "It is the current policy language version, not a date you update. Older versions lack features such as policy variables, so always use 2012-10-17." },
      { q: "Does an explicit Allow override an SCP deny?", a: "No. An explicit deny anywhere, including in an SCP, always wins over any allow." },
      { q: "How many managed policies can I attach to a role?", a: "Ten by default, and you can request a quota increase to 20. If you need more, combine permissions into fewer customer managed policies." },
    ],
  },

  "aws-security/multi-account": {
    plain: [
      "As a company grows, one AWS account gets messy. Developers can break production, costs are hard to split by team, and one leaked key can reach everything. The fix is many accounts: one for production, one for development, one for security tools, and so on. An AWS account is the strongest wall AWS offers between workloads.",
      "AWS Organizations ties those accounts together. One management account pays the bill for all of them. Accounts are grouped into organizational units (OUs), which work like folders. You can attach rules to a folder and every account inside follows them.",
      "Those rules are service control policies (SCPs). An SCP is a fence: it sets the most that anyone in an account can do, even an administrator. For example, \"nobody in the Dev OU may use Regions outside Europe\". SCPs never give permissions; people still need normal IAM permissions inside the fence.",
      "Two more services make this practical. Control Tower builds a recommended multi-account setup for you with logging and guardrails already in place. IAM Identity Center gives people one login page that leads to every account they are allowed into, with the right permissions in each.",
    ],
    deepDive: [
      {
        heading: "Why many accounts, and how to group them",
        body: "Each account has its own IAM, its own service quotas, its own resources and its own bill line. A mistake or breach in one account does not automatically reach another. That makes accounts ideal for separating environments, teams and data sensitivity.\n\nAWS's recommended OU structure starts with a Security OU (log archive and security tooling accounts), an Infrastructure OU (shared networking and services), and a Workloads OU split into Prod and Non-prod or SDLC. Add a Sandbox OU for experiments with strict spending and Region limits, and a Suspended OU for accounts being closed.\n\nGroup accounts by the policies they need, not by your org chart. Teams change often; \"production needs strict guardrails\" does not. Keep the management account empty of workloads, because SCPs do not apply to it.",
        bullets: ["Security OU: log archive and audit accounts", "Infrastructure OU: networking and shared services", "Workloads OU: Prod and Non-prod", "Sandbox and Suspended OUs", "Management account: billing and org admin only"],
      },
      {
        heading: "How SCPs really work",
        body: "SCPs can be attached to the organization root, to OUs, and to accounts. For a request to be allowed, the action must be allowed by the SCPs at every level from the root down to the account. A deny at any level blocks it. By default, AWS attaches a policy called FullAWSAccess everywhere, which allows everything, so you can simply add deny statements. This is the deny list strategy, and it is the most common. An allow list strategy removes FullAWSAccess and allows only named services, which is stricter but harder to maintain.\n\nSCPs apply to every IAM user and role in member accounts, including the member account's root user. They do not apply to the management account or to service-linked roles. Each target can have up to five SCPs attached, and each SCP can be up to 5,120 characters.",
        visual: {
          type: "flow",
          title: "SCP checks on the way down",
          steps: [
            { label: "Root SCPs", detail: "Must allow the action." },
            { label: "Parent OU SCPs", detail: "Must also allow it." },
            { label: "Child OU SCPs", detail: "Must also allow it." },
            { label: "Account SCPs", detail: "Must also allow it." },
            { label: "IAM policies", detail: "Must still grant the action." },
          ],
        },
      },
      {
        heading: "RCPs and other organization policies",
        body: "SCPs limit what your principals can do. Resource control policies (RCPs), added in late 2024, limit what can be done to your resources, no matter who is asking. They work on a growing list of services including S3, KMS, STS, SQS and Secrets Manager. A typical RCP denies access to every bucket in the organization unless the caller belongs to your organization (checked with aws:PrincipalOrgID) or is an AWS service acting for you. Together, SCPs and RCPs build a data perimeter: only trusted identities, accessing trusted resources, from expected networks.\n\nOrganizations also offers other policy types. Tag policies standardize tag keys and values. Backup policies apply AWS Backup plans across accounts. AI services opt-out policies control whether AWS AI services may store your content. Declarative policies enforce settings for some services, such as blocking public access to EC2 AMIs and snapshots.",
      },
      {
        heading: "What Control Tower sets up",
        body: "Control Tower builds and runs a landing zone: a well-designed multi-account starting point. It uses your management account, creates a Security OU with a Log Archive account (central CloudTrail and Config logs) and an Audit account (security team access), and turns on an organization-wide CloudTrail trail and AWS Config.\n\nIt then applies controls, previously called guardrails. Preventive controls are SCPs or RCPs that block actions. Detective controls are AWS Config rules that report drift. Proactive controls are CloudFormation hooks that check resources before they are created. Controls are labeled mandatory, strongly recommended or elective.\n\nAccount Factory creates new accounts that already follow the baseline, and Account Factory for Terraform (AFT) does the same through a Terraform pipeline. Control Tower also detects drift, such as someone moving an account out of its OU by hand.",
        visual: {
          type: "flow",
          title: "Vending a new account",
          steps: [
            { label: "Request", detail: "Account Factory form or AFT pipeline." },
            { label: "Create in OU", detail: "Account placed in the chosen OU." },
            { label: "Apply baseline", detail: "CloudTrail, Config and OU controls." },
            { label: "Grant access", detail: "Identity Center groups assigned." },
            { label: "Team builds", detail: "Workloads deploy inside the guardrails." },
          ],
        },
      },
      {
        heading: "IAM Identity Center in practice",
        body: "Identity Center needs an identity source. It can be its own built-in directory, Active Directory (through AWS Managed Microsoft AD or AD Connector), or an external identity provider such as Okta or Microsoft Entra ID, connected with SAML 2.0 for sign-in and SCIM to sync users and groups automatically.\n\nPermissions are defined once as permission sets: a bundle of AWS managed policies, customer managed policy references, an inline policy and an optional permissions boundary, plus a session duration from 1 to 12 hours. You then assign a group and a permission set to one or more accounts. Identity Center creates a matching IAM role in each account, named AWSReservedSSO_ followed by the set name and a random suffix.\n\nUsers sign in to the access portal, pick an account and a role, and get the console or CLI credentials. Removing someone from the group removes their access everywhere at once.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Signing in through an external IdP",
        actors: ["User", "External IdP", "Identity Center", "Member account"],
        messages: [
          { from: 0, to: 2, label: "Open the AWS access portal" },
          { from: 2, to: 1, label: "Redirect for authentication" },
          { from: 0, to: 1, label: "Sign in with password and MFA" },
          { from: 1, to: 2, label: "SAML assertion with groups" },
          { from: 2, to: 0, label: "List of allowed accounts and roles" },
          { from: 0, to: 2, label: "Choose Prod, ReadOnly" },
          { from: 2, to: 3, label: "Session for AWSReservedSSO role" },
        ],
      },
    ],
    examples: [
      {
        title: "Guardrails for a 40-person startup",
        explanation: "Step 1: create an organization and OUs: Security, Infrastructure, Workloads/Prod, Workloads/Dev and Sandbox. Step 2: attach an SCP at the root that stops any account from leaving the organization and from turning off CloudTrail, GuardDuty or Config. Step 3: attach a Region-limiting SCP to Workloads so data stays in the two Regions the company uses. Step 4: in Identity Center, create groups Developers, Ops and Security, and assign Developers PowerUserAccess in Dev but ReadOnlyAccess in Prod. Step 5: give Sandbox a budget alert per account. The root SCP below shows step 2.",
        code: {
          lang: "json",
          code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ProtectGuardrails",
    "Effect": "Deny",
    "Action": [
      "organizations:LeaveOrganization",
      "cloudtrail:StopLogging", "cloudtrail:DeleteTrail",
      "guardduty:DeleteDetector",
      "config:StopConfigurationRecorder", "config:DeleteConfigurationRecorder"
    ],
    "Resource": "*"
  }]
}`,
        },
      },
      {
        title: "Debugging an admin who gets AccessDenied",
        explanation: "A developer with AdministratorAccess in a Dev account cannot launch EC2 in us-west-2. Step 1: read the error. AWS error messages name the policy type, here \"with an explicit deny in a service control policy\". Step 2: from the management account, list the SCPs on that account and on each parent OU, because SCPs are inherited. Step 3: open the policy content and find a deny on aws:RequestedRegion that allows only eu-west-1 and eu-central-1. Step 4: decide: either the developer should use an EU Region, or the platform team updates the SCP. IAM changes inside the account can never fix this.",
        code: {
          lang: "bash",
          code: "# SCPs attached directly to the account\naws organizations list-policies-for-target \\\n  --target-id 123456789012 --filter SERVICE_CONTROL_POLICY\n# Walk up: find the parent OU and repeat for it\naws organizations list-parents --child-id 123456789012\naws organizations list-policies-for-target \\\n  --target-id ou-ab12-11112222 --filter SERVICE_CONTROL_POLICY\naws organizations describe-policy --policy-id p-examplepolicy \\\n  --query Policy.Content --output text",
        },
      },
    ],
    cheatSheet: [
      "SCPs cap permissions for principals in member accounts; they never grant anything",
      "SCPs do not apply to the management account or to service-linked roles",
      "An action must be allowed by SCPs at every level from root to account",
      "RCPs cap access to resources such as S3 buckets and KMS keys, whoever the caller is",
      "Control Tower: Log Archive and Audit accounts, org CloudTrail, Config, controls, Account Factory",
      "Controls: preventive (SCP/RCP), detective (Config rules), proactive (CloudFormation hooks)",
      "Identity Center permission sets become AWSReservedSSO roles in each assigned account",
      "Keep workloads out of the management account",
    ],
    quiz: [
      {
        q: "An SCP on the Dev OU allows only ec2:* and s3:*. A user in a Dev account has AdministratorAccess. Can they create a DynamoDB table?",
        options: ["Yes, AdministratorAccess allows everything", "Yes, if the root SCP allows it", "No, the OU SCP does not allow DynamoDB", "Only from the management account"],
        answer: 2,
        why: "The effective permission is the intersection of the SCPs and IAM, and the SCP does not allow DynamoDB.",
      },
      {
        q: "Which account is never restricted by SCPs?",
        options: ["The Log Archive account", "The Audit account", "Any account in the root OU", "The management account"],
        answer: 3,
        why: "SCPs do not affect the management account, which is why workloads should not run there.",
      },
      {
        q: "You must ensure no S3 bucket in the organization can be read by principals outside it, even if a bucket policy allows it. What fits best?",
        options: ["A resource control policy using aws:PrincipalOrgID", "An SCP on every OU", "A tag policy", "An IAM permissions boundary"],
        answer: 0,
        why: "RCPs limit access to resources regardless of who calls, which is exactly a data perimeter.",
      },
      {
        q: "What kind of Control Tower control checks resources before CloudFormation creates them?",
        options: ["Preventive", "Proactive", "Detective", "Mandatory"],
        answer: 1,
        why: "Proactive controls use CloudFormation hooks to block non-compliant resources at deploy time.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create an organization in your lab account and add two OUs called Workloads and Sandbox.",
        hint: "You need the root ID, which starts with r-.",
        solution: "aws organizations create-organization --feature-set ALL\nROOT=$(aws organizations list-roots --query \"Roots[0].Id\" --output text)\naws organizations create-organizational-unit --parent-id \"$ROOT\" --name Workloads\naws organizations create-organizational-unit --parent-id \"$ROOT\" --name Sandbox\naws organizations list-organizational-units-for-parent --parent-id \"$ROOT\"",
      },
      {
        level: "medium",
        task: "Create an SCP that denies leaving the organization and attach it to the Sandbox OU.",
        hint: "SCPs must be enabled on the root before you can attach one.",
        solution: "aws organizations enable-policy-type --root-id \"$ROOT\" \\\n  --policy-type SERVICE_CONTROL_POLICY\ncat > deny-leave.json <<'EOF'\n{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Deny\",\n \"Action\":\"organizations:LeaveOrganization\",\"Resource\":\"*\"}]}\nEOF\nP=$(aws organizations create-policy --name deny-leave \\\n  --type SERVICE_CONTROL_POLICY --description \"No leaving\" \\\n  --content file://deny-leave.json --query Policy.PolicySummary.Id --output text)\naws organizations attach-policy --policy-id \"$P\" --target-id ou-xxxx-sandbox",
      },
      {
        level: "hard",
        task: "Write an SCP for the Sandbox OU that denies launching any EC2 instance type other than t3.micro, t3.small and t4g.small.",
        hint: "Use the ec2:InstanceType condition key on RunInstances against instance resources.",
        solution: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"OnlySmallInstances\",\n    \"Effect\": \"Deny\",\n    \"Action\": \"ec2:RunInstances\",\n    \"Resource\": \"arn:aws:ec2:*:*:instance/*\",\n    \"Condition\": {\"StringNotEquals\":\n      {\"ec2:InstanceType\": [\"t3.micro\", \"t3.small\", \"t4g.small\"]}}\n  }]\n}",
      },
    ],
    faq: [
      { q: "Is AWS Control Tower free?", a: "Control Tower itself has no charge, but you pay for the services it turns on, such as AWS Config, CloudTrail storage and any extra accounts' resources." },
      { q: "What is the difference between an SCP and an IAM policy?", a: "An IAM policy grants permissions to an identity. An SCP sets the maximum permissions for every identity in an account and never grants anything by itself." },
      { q: "Can I use IAM Identity Center without AWS Organizations?", a: "Yes, as an account instance for some application use cases, but multi-account access with permission sets requires an organization instance." },
      { q: "How do I move an existing account into my organization?", a: "Send it an invitation from the management account. Once the account accepts, it joins the root and you can move it into any OU." },
    ],
  },

  "aws-security/encryption": {
    plain: [
      "Encryption scrambles data so only someone with the right key can read it. In AWS you meet it in two places. At rest means data sitting on disk: files in S3, EBS volumes, database storage. In transit means data moving over a network, protected by TLS, the same technology behind the padlock in your browser.",
      "Keys are the hard part. If you lose them, the data is gone. If someone steals them, encryption is pointless. AWS KMS (Key Management Service) keeps keys inside hardware security modules, devices built so keys cannot be pulled out. Services ask KMS to use a key; they never see the key itself.",
      "Most AWS services make this a checkbox. S3 already encrypts every new object. EBS and RDS encrypt when you tick the box at creation. Your real decisions are which key to use, who may use it, and how you prove it was used correctly.",
      "Passwords and API tokens need care too. Do not put them in code or plain environment files. AWS Secrets Manager stores them encrypted, hands them to apps that are allowed to read them, and can change database passwords automatically on a schedule.",
    ],
    deepDive: [
      {
        heading: "Inside KMS",
        body: "A KMS key is a logical key: an ID, a key policy, and key material stored in FIPS-validated hardware security modules. Plaintext key material never leaves KMS. You can call Encrypt directly only on small data, up to 4 KB, which is why services use envelope encryption for anything bigger.\n\nEvery KMS key must have a key policy. The default key policy gives the account itself full access, which lets IAM policies in that account grant key use. Without that statement, IAM policies alone cannot grant access. Grants give temporary, narrow permissions; EBS uses them to let an instance decrypt its volume.\n\nRotation creates new key material but keeps the old material, so old data still decrypts and the key ID stays the same. AWS managed keys rotate every year. For customer managed keys, rotation is optional, with a period from 90 to 2,560 days, and you can also rotate on demand. Deletion has a 7 to 30 day waiting period, since a deleted key makes its data unreadable forever.",
        bullets: ["Symmetric AES-256 keys by default; RSA, ECC and HMAC also available", "Direct Encrypt is limited to 4 KB of data", "Multi-Region keys share key material across Regions", "Disable a key instead of deleting it if unsure"],
      },
      {
        heading: "S3 encryption choices",
        body: "Since January 2023, S3 encrypts every new object with SSE-S3 (keys managed by S3) at no extra cost. You can change the bucket default to SSE-KMS, which uses a KMS key. SSE-KMS adds two things: a separate permission (readers need kms:Decrypt as well as s3:GetObject), and a CloudTrail record of every key use. DSSE-KMS applies two layers of encryption for strict compliance rules. SSE-C uses a key you send with each request, and S3 never stores it.\n\nSSE-KMS calls KMS for every object, which costs money and counts against KMS request quotas. Turn on S3 Bucket Keys: S3 then gets a short-lived bucket-level key from KMS and reuses it, cutting KMS requests by up to 99 percent.\n\nFor cross-account sharing, use a customer managed key. The AWS managed key aws/s3 has a key policy you cannot change, so other accounts can never be allowed to use it.",
        visual: {
          type: "compare",
          title: "S3 server-side encryption options",
          columns: [
            { title: "SSE-S3", points: ["Default for new objects", "Keys fully managed by S3", "No extra permission or cost", "No per-key audit trail"] },
            { title: "SSE-KMS", points: ["AWS managed or customer managed key", "Needs kms:Decrypt to read", "Key use logged in CloudTrail", "Use Bucket Keys to cut cost"] },
            { title: "SSE-C", points: ["You supply the key per request", "S3 never stores the key", "Lose the key, lose the data", "HTTPS required"] },
          ],
        },
      },
      {
        heading: "EBS and RDS: encrypt at creation",
        body: "EBS and RDS encryption is set when a volume or database is created and cannot be switched on later in place. For EBS, turn on encryption by default, a per-Region account setting; every new volume and snapshot copy is then encrypted. Snapshots of an encrypted volume are encrypted, and volumes made from them are too.\n\nTo encrypt existing data you go through a snapshot. For EBS, snapshot the volume, then create a new volume from that snapshot with encryption enabled (or copy the snapshot with encryption), and swap volumes. For RDS, snapshot the instance, copy the snapshot with encryption and a KMS key, and restore a new instance from the copy, then point the app at it.\n\nRead replicas use the same encryption state as their source. Copying an encrypted snapshot to another Region needs a KMS key in the destination Region. Sharing an encrypted snapshot with another account requires a customer managed key whose policy lets that account use it.",
        visual: {
          type: "flow",
          title: "Encrypting an existing RDS database",
          steps: [
            { label: "Snapshot", detail: "Take a manual snapshot of the instance." },
            { label: "Copy encrypted", detail: "Copy it with a KMS key selected." },
            { label: "Restore", detail: "New instance from the encrypted copy." },
            { label: "Cut over", detail: "Point the app at the new endpoint." },
            { label: "Retire old", detail: "Delete the unencrypted instance." },
          ],
        },
      },
      {
        heading: "TLS in transit with ACM",
        body: "AWS Certificate Manager issues public TLS certificates for free and installs them on integrated services: Application and Network Load Balancers, CloudFront, API Gateway and others. With DNS validation, you add one CNAME record and ACM renews the certificate automatically as long as that record stays. Email validation needs a person to click a link at each renewal, so prefer DNS.\n\nCertificates are Regional. A load balancer needs a certificate in its own Region, while CloudFront always needs one from us-east-1. For internal services, AWS Private CA issues private certificates.\n\nTurning on TLS is only half the job; you also have to require it. Redirect HTTP to HTTPS on the load balancer listener. Deny S3 requests where aws:SecureTransport is false. Require TLS on databases with rds.force_ssl for PostgreSQL or require_secure_transport for MySQL, set in a parameter group.",
        bullets: ["ALB: HTTPS listener plus HTTP-to-HTTPS redirect", "CloudFront certificates must be in us-east-1", "S3: deny when aws:SecureTransport is false", "RDS: force TLS through the parameter group"],
      },
      {
        heading: "Secrets Manager and Parameter Store",
        body: "Secrets Manager stores secrets encrypted with KMS, controls access with IAM and resource policies, replicates secrets to other Regions, and rotates them. Rotation runs a Lambda function through four steps: create a new secret version, set it in the database, test it, then mark it current. Versions carry labels AWSCURRENT, AWSPENDING and AWSPREVIOUS, so apps always fetch the current one. For RDS and Aurora master passwords, managed rotation needs no Lambda at all: create the database with the manage-master-user-password option.\n\nSystems Manager Parameter Store is a cheaper option for configuration. Standard parameters are free, and SecureString parameters are encrypted with KMS. It has no built-in rotation.\n\nThe exam rule: if a scenario says \"rotate database credentials automatically\", pick Secrets Manager. If it just needs to store configuration values or a few secrets cheaply, Parameter Store is fine.",
        visual: {
          type: "cycle",
          title: "One rotation in Secrets Manager",
          steps: [
            { label: "createSecret", detail: "New password stored as AWSPENDING." },
            { label: "setSecret", detail: "Password changed in the database." },
            { label: "testSecret", detail: "Log in with the new password." },
            { label: "finishSecret", detail: "AWSPENDING becomes AWSCURRENT." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Encryption per data store",
        root: "Protect data in AWS",
        children: [
          { label: "S3", children: ["SSE-S3 by default", "SSE-KMS for control and audit", "Bucket Keys to cut KMS cost"] },
          { label: "EBS", children: ["Encryption by default setting", "Snapshots inherit encryption"] },
          { label: "RDS and Aurora", children: ["KMS at creation", "TLS forced in parameter group"] },
          { label: "DynamoDB", children: ["Always encrypted at rest", "AWS owned, AWS managed or customer key"] },
          { label: "Secrets", children: ["Secrets Manager with rotation", "Parameter Store SecureString"] },
        ],
      },
    ],
    examples: [
      {
        title: "Locking down a finance bucket",
        explanation: "Finance reports must use a customer managed key and only travel over TLS. Step 1: set the bucket default encryption to SSE-KMS with the key alias and Bucket Keys on, so uploads are encrypted even if the client sends no encryption header. Step 2: add a bucket policy that denies any request where aws:SecureTransport is false. Step 3: give readers both s3:GetObject and kms:Decrypt on the key. A common trap: a policy that denies uploads missing a specific key ID header also blocks clients relying on the default, so prefer default encryption plus a TLS deny.",
        code: {
          lang: "bash",
          code: "aws s3api put-bucket-encryption --bucket fin-reports \\\n  --server-side-encryption-configuration '{\"Rules\":[{\n    \"ApplyServerSideEncryptionByDefault\":{\n      \"SSEAlgorithm\":\"aws:kms\",\"KMSMasterKeyID\":\"alias/fin-data\"},\n    \"BucketKeyEnabled\":true}]}'\n\naws s3api put-bucket-policy --bucket fin-reports --policy '{\n  \"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"TLSOnly\",\n  \"Effect\":\"Deny\",\"Principal\":\"*\",\"Action\":\"s3:*\",\n  \"Resource\":[\"arn:aws:s3:::fin-reports\",\"arn:aws:s3:::fin-reports/*\"],\n  \"Condition\":{\"Bool\":{\"aws:SecureTransport\":\"false\"}}}]}'",
        },
      },
      {
        title: "A new database with no password in code",
        explanation: "Step 1: create the RDS instance with storage encryption, your KMS key, and a master password managed by Secrets Manager, so no human ever types or sees it. Step 2: RDS creates the secret and rotates it automatically, every 7 days by default. Step 3: look up the secret ARN from the instance. Step 4: give the app's IAM role secretsmanager:GetSecretValue on that ARN only. Step 5: the app fetches the secret at start-up and caches it, refreshing on login failure so a rotation never breaks it.",
        code: {
          lang: "bash",
          code: "aws rds create-db-instance --db-instance-identifier orders-db \\\n  --engine postgres --db-instance-class db.t4g.micro \\\n  --allocated-storage 20 --master-username appadmin \\\n  --manage-master-user-password \\\n  --storage-encrypted --kms-key-id alias/app-data \\\n  --no-publicly-accessible\n\naws rds describe-db-instances --db-instance-identifier orders-db \\\n  --query \"DBInstances[0].MasterUserSecret.SecretArn\" --output text",
        },
      },
    ],
    cheatSheet: [
      "Direct KMS Encrypt handles at most 4 KB; bigger data uses envelope encryption",
      "Customer managed key rotation: optional, 90 to 2,560 days; AWS managed keys rotate yearly",
      "Key deletion waits 7 to 30 days; disable the key if you are unsure",
      "SSE-KMS readers need kms:Decrypt too; turn on Bucket Keys to cut KMS requests",
      "Share encrypted snapshots or objects cross-account only with a customer managed key",
      "Encrypt existing EBS or RDS data by going through a snapshot copy",
      "ACM certificates for CloudFront must be in us-east-1; DNS validation auto-renews",
      "Automatic credential rotation means Secrets Manager; cheap config storage means Parameter Store",
    ],
    quiz: [
      {
        q: "Another account must read your SSE-KMS encrypted objects. Which key type is required?",
        options: ["The AWS managed key aws/s3", "A customer managed key with a key policy allowing that account", "SSE-S3", "Any key, if the bucket policy allows it"],
        answer: 1,
        why: "Only a customer managed key's policy can be edited to let another account decrypt.",
      },
      {
        q: "What happens to old ciphertext when a KMS key rotates automatically?",
        options: ["It must be re-encrypted within 30 days", "It becomes unreadable", "It is re-encrypted automatically", "It still decrypts, because old key material is kept"],
        answer: 3,
        why: "KMS keeps all previous key material for the same key ID, so nothing needs re-encrypting.",
      },
      {
        q: "A workload makes millions of SSE-KMS PutObject calls and hits KMS throttling. What helps most?",
        options: ["Enable S3 Bucket Keys", "Switch to SSE-C", "Use a multi-Region key", "Increase the key rotation period"],
        answer: 0,
        why: "Bucket Keys reuse a bucket-level key, cutting KMS requests by up to 99 percent.",
      },
      {
        q: "You attach an ACM certificate to a CloudFront distribution, but it is not listed. Why?",
        options: ["ACM certificates are not supported by CloudFront", "Email validation is required", "The certificate is not in us-east-1", "CloudFront needs a private CA certificate"],
        answer: 2,
        why: "CloudFront only uses ACM certificates requested or imported in us-east-1.",
      },
      {
        q: "Which service automatically rotates an RDS master password without you writing a Lambda function?",
        options: ["Parameter Store", "KMS", "ACM", "Secrets Manager managed rotation"],
        answer: 3,
        why: "With manage-master-user-password, RDS and Secrets Manager rotate the secret for you.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a customer managed key with the alias alias/lab, encrypt a small text file with it, and decrypt it again.",
        hint: "Use fileb:// for binary input, and base64-decode the CLI output.",
        solution: "KEY=$(aws kms create-key --description lab --query KeyMetadata.KeyId --output text)\naws kms create-alias --alias-name alias/lab --target-key-id \"$KEY\"\necho \"hello kms\" > hello.txt\naws kms encrypt --key-id alias/lab --plaintext fileb://hello.txt \\\n  --query CiphertextBlob --output text | base64 --decode > hello.enc\naws kms decrypt --ciphertext-blob fileb://hello.enc \\\n  --query Plaintext --output text | base64 --decode",
      },
      {
        level: "medium",
        task: "Turn on EBS encryption by default in your lab Region using the alias/lab key, and confirm the setting.",
        hint: "Two commands enable it and set the default key; one reads it back.",
        solution: "aws ec2 enable-ebs-encryption-by-default\naws ec2 modify-ebs-default-kms-key-id --kms-key-id alias/lab\naws ec2 get-ebs-encryption-by-default\naws ec2 get-ebs-default-kms-key-id\n# New volumes in this Region are now encrypted with alias/lab.",
      },
      {
        level: "hard",
        task: "Share an encrypted EBS snapshot with account 222233334444 so they can make their own copy.",
        hint: "Two permissions are needed: one on the snapshot, one in the key policy.",
        solution: "# 1. Key policy statement on your customer managed key:\n# {\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::222233334444:root\"},\n#  \"Action\":[\"kms:Decrypt\",\"kms:DescribeKey\",\"kms:CreateGrant\",\n#   \"kms:ReEncrypt*\",\"kms:GenerateDataKey*\"],\"Resource\":\"*\"}\n# 2. Share the snapshot:\naws ec2 modify-snapshot-attribute --snapshot-id snap-0abc1234 \\\n  --attribute createVolumePermission --operation-type add \\\n  --user-ids 222233334444\n# 3. In 222233334444: copy-snapshot with its own KMS key, then use the copy.",
      },
    ],
    faq: [
      { q: "Is S3 data encrypted by default?", a: "Yes. Since January 2023, every new object is encrypted with SSE-S3 unless you choose another option. Choose SSE-KMS when you need key control or an audit trail." },
      { q: "What is the difference between KMS and CloudHSM?", a: "KMS is a shared, fully managed key service integrated with most AWS services. CloudHSM gives you dedicated single-tenant HSMs where you alone manage users and keys, for strict compliance needs." },
      { q: "Does encryption slow down EBS or RDS?", a: "The impact is negligible for most workloads, because encryption is handled by the underlying Nitro hardware and storage layer." },
      { q: "Secrets Manager or Parameter Store?", a: "Secrets Manager when you need automatic rotation, cross-Region replication or cross-account sharing. Parameter Store for configuration values and simple secrets at low or no cost." },
    ],
  },

  "aws-security/threat-protection": {
    plain: [
      "Attackers try many things: flooding your site with traffic, sending poisoned input to a login form, stealing keys, or finding data you forgot was there. AWS has a separate service for each job, and the trick is to know which verb each service does: block, absorb, detect, scan or discover.",
      "AWS WAF is a web application firewall. It reads each HTTP request and blocks the bad ones, such as SQL injection attempts or one IP sending thousands of login requests. AWS Shield protects against DDoS attacks, where huge amounts of junk traffic try to knock your site offline.",
      "Amazon GuardDuty is a security camera. It watches activity logs and network data, and raises an alarm when something looks wrong, such as an instance talking to a known criminal server. It does not block anything by itself; it tells you, so you or an automation can respond.",
      "Amazon Inspector checks your servers, container images and Lambda functions for known software vulnerabilities. Amazon Macie looks inside S3 buckets for sensitive data like credit card numbers or passport details. One finds weak doors, the other finds valuables left in the open.",
    ],
    deepDive: [
      {
        heading: "How WAF evaluates a request",
        body: "A web ACL is a list of rules with priorities. WAF checks rules from the lowest priority number upward. The first rule that matches with a terminating action, Allow or Block, ends the check. Count only records a match and continues, which makes it perfect for testing new rules safely. CAPTCHA and Challenge make a browser prove it is not a simple bot. If no rule decides, the web ACL's default action applies.\n\nAWS managed rule groups save you writing patterns: the core rule set for common OWASP attacks, known bad inputs, SQL database protections, Amazon IP reputation lists, and paid groups for bot control and account takeover prevention. Rate-based rules count requests per IP, or per header or other key, over an evaluation window of 1 to 10 minutes and block the sources that go over the limit.\n\nAlways start new rules in Count mode, check WAF logs for false positives, then switch to Block.",
        visual: {
          type: "flow",
          title: "One request through a web ACL",
          steps: [
            { label: "Request arrives", detail: "At CloudFront, ALB or API Gateway." },
            { label: "Rule 0, 1, 2...", detail: "Checked in priority order." },
            { label: "Count matches", detail: "Logged, evaluation continues." },
            { label: "Allow or Block", detail: "First terminating match stops it." },
            { label: "Default action", detail: "Used when no rule decides." },
          ],
        },
      },
      {
        heading: "Shield Standard versus Shield Advanced",
        body: "Shield Standard is on for every AWS customer at no cost. It defends against common network and transport layer attacks, such as SYN floods and UDP reflection, on all AWS edge and Regional infrastructure.\n\nShield Advanced is a paid subscription of 3,000 USD per month per organization, with a one-year commitment. It protects named resources: CloudFront distributions, Route 53 hosted zones, Global Accelerator accelerators, load balancers and Elastic IPs. You get detailed attack visibility, automatic application layer DDoS mitigation through WAF, access to the Shield Response Team (with Business or Enterprise Support), and DDoS cost protection, which credits scaling charges caused by an attack. WAF charges for protected resources are included.\n\nArchitecture matters as much as the subscription. Put CloudFront, Route 53 and Global Accelerator in front, because the edge absorbs floods far from your origin, and keep origins private.",
        visual: {
          type: "compare",
          title: "Shield tiers",
          columns: [
            { title: "Shield Standard", points: ["Free and automatic", "Layer 3 and 4 attacks", "All AWS customers", "No response team"] },
            { title: "Shield Advanced", points: ["3,000 USD per month, 1-year term", "Named resources, incl. Layer 7 help", "Shield Response Team access", "DDoS cost protection"] },
          ],
        },
      },
      {
        heading: "GuardDuty: what it watches and how to respond",
        body: "GuardDuty's foundational data sources are CloudTrail management events, VPC Flow Logs and Route 53 Resolver DNS query logs. It reads these from its own independent streams, so you do not need to turn the logs on yourself, and there are no agents. Optional protection plans go further: S3 Protection (data events on buckets), EKS Protection (Kubernetes audit logs), Runtime Monitoring (an agent on EKS, ECS and EC2), Malware Protection for EC2 volumes and for new S3 uploads, RDS Protection (login activity) and Lambda Protection (network activity).\n\nFindings have names like CryptoCurrency:EC2/BitcoinTool.B!DNS and a severity from low to critical. Extended Threat Detection links several findings into one attack sequence.\n\nGuardDuty only reports. To respond automatically, send findings through EventBridge to a Lambda function or Systems Manager runbook that, for example, swaps an instance's security group to a quarantine group.",
        visual: {
          type: "sequence",
          title: "Automatic response to a finding",
          actors: ["GuardDuty", "EventBridge", "Lambda", "EC2 instance"],
          messages: [
            { from: 0, to: 1, label: "High severity finding event" },
            { from: 1, to: 2, label: "Rule matches, invoke function" },
            { from: 2, to: 3, label: "Replace SGs with quarantine SG" },
            { from: 2, to: 3, label: "Snapshot volumes for forensics" },
            { from: 2, to: 1, label: "Publish alert to security team" },
          ],
        },
      },
      {
        heading: "Inspector and Macie",
        body: "Inspector is continuous vulnerability management. For EC2 it uses the Systems Manager agent, or scans EBS snapshots agentlessly, to compare installed packages with known CVEs. For ECR it scans images when pushed and rescans when new CVEs appear. For Lambda it scans function packages and can review code. It also reports network reachability, such as a port open to the internet. Each finding gets an Inspector score that adjusts the CVE severity for your context, for example lower if the vulnerable host is not reachable.\n\nMacie works only on S3. It keeps an inventory of buckets and flags ones that are public, unencrypted or shared outside the account. Automated sensitive data discovery samples objects across all buckets continuously, and discovery jobs scan chosen buckets fully. Managed data identifiers detect things like credit card numbers, AWS secret keys and passport numbers; custom data identifiers add your own regular expressions and keywords.",
        bullets: ["Inspector: EC2, ECR images, Lambda", "Inspector finds CVEs and network exposure", "Macie: S3 only", "Macie finds PII, credentials and risky bucket settings"],
      },
      {
        heading: "Picking the right service on the exam",
        body: "Read the verb in the question. \"Block SQL injection or limit requests per IP\" is WAF. \"Protect against large DDoS attacks with expert help and cost protection\" is Shield Advanced. \"Detect compromised instances, unusual API calls or crypto mining\" is GuardDuty. \"Find software vulnerabilities in instances or container images\" is Inspector. \"Find PII in S3\" is Macie.\n\nA few neighbors appear as distractors. Security Hub collects findings from all of these services in one place and checks accounts against best-practice standards. Detective helps investigate the root cause of a finding with graphs of related activity. Firewall Manager applies WAF, Shield Advanced, security group and Network Firewall policies across every account in an organization. Network Firewall filters traffic inside a VPC, including non-HTTP protocols that WAF cannot see.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Defense in depth for a web app",
        layers: [
          { label: "Route 53 and Shield", detail: "DNS and DDoS absorption at the edge." },
          { label: "CloudFront with WAF", detail: "Caching plus HTTP request filtering." },
          { label: "ALB and security groups", detail: "Only CloudFront reaches the origin." },
          { label: "Instances and containers", detail: "Inspector scans for CVEs." },
          { label: "Data in S3", detail: "Macie finds sensitive data." },
          { label: "Across everything", detail: "GuardDuty watches logs and runtime." },
        ],
      },
    ],
    examples: [
      {
        title: "Rate limiting a login page",
        explanation: "Bots are guessing passwords on /login behind an ALB. Step 1: add a rate-based rule that counts requests per client IP, but only for paths starting with /login, using a scope-down statement. Step 2: set the limit to 100 requests in a 5-minute window, far above what a real user needs. Step 3: deploy it with the Count action for a day and read the WAF logs to check no real users would be blocked. Step 4: change the action to Block. Step 5: add the AWS managed account takeover prevention group later if attacks continue from many IPs.",
        code: {
          lang: "json",
          code: `{
  "Name": "limit-login",
  "Priority": 1,
  "Action": {"Block": {}},
  "Statement": {"RateBasedStatement": {
    "Limit": 100, "EvaluationWindowSec": 300, "AggregateKeyType": "IP",
    "ScopeDownStatement": {"ByteMatchStatement": {
      "FieldToMatch": {"UriPath": {}}, "PositionalConstraint": "STARTS_WITH",
      "SearchString": "/login",
      "TextTransformations": [{"Priority": 0, "Type": "NONE"}]}}}},
  "VisibilityConfig": {"SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true, "MetricName": "limit-login"}
}`,
        },
      },
      {
        title: "Turning a GuardDuty finding into action",
        explanation: "The security team wants every high or critical GuardDuty finding to page them and isolate the instance. Step 1: create an EventBridge rule with the pattern below, which matches findings with severity 7 or higher. Step 2: add two targets: an SNS topic that pages the on-call engineer, and a Lambda function. Step 3: the function reads the instance ID from the finding, replaces its security groups with a quarantine group that has no rules, and snapshots its volumes for forensics. Step 4: test with aws guardduty create-sample-findings to be sure the wiring works before a real incident.",
        code: {
          lang: "json",
          code: `{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {"severity": [{"numeric": [">=", 7]}]}
}`,
        },
      },
    ],
    cheatSheet: [
      "WAF attaches to CloudFront, ALB, API Gateway, AppSync and Cognito; never to an NLB",
      "WAF checks rules by priority; first Allow or Block wins; Count logs and continues",
      "Rate-based rules: count per IP or key over 1 to 10 minute windows",
      "Shield Advanced: 3,000 USD per month per org, response team, DDoS cost protection",
      "GuardDuty reads CloudTrail, VPC Flow Logs and DNS logs without you enabling them",
      "GuardDuty detects; respond through EventBridge to Lambda or Systems Manager",
      "Inspector: CVEs in EC2, ECR and Lambda. Macie: sensitive data in S3",
      "Firewall Manager applies WAF and Shield policies across every account in an organization",
    ],
    quiz: [
      {
        q: "You want to test a new WAF rule without blocking any real users. Which action should it use first?",
        options: ["Block", "Count", "Allow", "Challenge"],
        answer: 1,
        why: "Count records matches without affecting the request, so you can check for false positives.",
      },
      {
        q: "A company wants credits for scaling costs caused by a DDoS attack. What do they need?",
        options: ["Shield Advanced", "Shield Standard", "GuardDuty", "WAF Bot Control"],
        answer: 0,
        why: "DDoS cost protection is a feature of Shield Advanced only.",
      },
      {
        q: "What must you do before GuardDuty can analyze VPC Flow Logs?",
        options: ["Create flow logs on every VPC", "Install an agent on each instance", "Send flow logs to an S3 bucket", "Nothing; just enable GuardDuty"],
        answer: 3,
        why: "GuardDuty reads foundational data sources from independent streams without you enabling the logs.",
      },
      {
        q: "A new critical CVE is published. Which service flags ECR images that contain it, without a new push?",
        options: ["Macie", "GuardDuty", "Inspector", "AWS Config"],
        answer: 2,
        why: "Inspector continuously rescans ECR images when new vulnerabilities are published.",
      },
      {
        q: "An app on an NLB receives malicious TCP traffic on a custom port. WAF cannot help. What filters it inside the VPC?",
        options: ["Amazon Macie", "AWS Network Firewall", "Amazon Detective", "AWS Shield Standard alone"],
        answer: 1,
        why: "Network Firewall inspects and filters VPC traffic, including non-HTTP protocols.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Enable GuardDuty in your lab Region, generate sample findings, and list them.",
        hint: "Creating a detector enables GuardDuty; sample findings are clearly labeled as samples.",
        solution: "DET=$(aws guardduty create-detector --enable --query DetectorId --output text)\naws guardduty create-sample-findings --detector-id \"$DET\"\naws guardduty list-findings --detector-id \"$DET\" --max-results 10\n# Disable later if you want to avoid charges after the 30-day trial:\n# aws guardduty delete-detector --detector-id \"$DET\"",
      },
      {
        level: "medium",
        task: "Create a regional web ACL with the AWS managed core rule set in Count mode and attach it to an ALB.",
        hint: "Managed rule groups use OverrideAction instead of Action.",
        solution: "cat > rules.json <<'EOF'\n[{\"Name\":\"core\",\"Priority\":0,\"OverrideAction\":{\"Count\":{}},\n  \"Statement\":{\"ManagedRuleGroupStatement\":{\"VendorName\":\"AWS\",\n    \"Name\":\"AWSManagedRulesCommonRuleSet\"}},\n  \"VisibilityConfig\":{\"SampledRequestsEnabled\":true,\n    \"CloudWatchMetricsEnabled\":true,\"MetricName\":\"core\"}}]\nEOF\nACL=$(aws wafv2 create-web-acl --name app-acl --scope REGIONAL \\\n  --default-action Allow={} --rules file://rules.json \\\n  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=app-acl \\\n  --query Summary.ARN --output text)\naws wafv2 associate-web-acl --web-acl-arn \"$ACL\" --resource-arn \"$ALB_ARN\"",
      },
      {
        level: "hard",
        task: "Use Macie to find employee IDs shaped like EMP-123456 in a bucket called hr-exports.",
        hint: "Create a custom data identifier, then a one-time classification job that uses it.",
        solution: "aws macie2 enable-macie\nID=$(aws macie2 create-custom-data-identifier --name employee-id \\\n  --regex \"EMP-[0-9]{6}\" --query customDataIdentifierId --output text)\naws macie2 create-classification-job --job-type ONE_TIME --name hr-scan \\\n  --custom-data-identifier-ids \"$ID\" \\\n  --s3-job-definition '{\"bucketDefinitions\":[{\"accountId\":\"111122223333\",\n    \"buckets\":[\"hr-exports\"]}]}'\naws macie2 list-findings\n# Review findings in the Macie console or Security Hub.",
      },
    ],
    faq: [
      { q: "Does GuardDuty block attacks?", a: "No. It detects and reports findings. You block or isolate by automating a response through EventBridge, or by updating WAF, security groups or NACLs." },
      { q: "Do I need Shield Advanced?", a: "Most workloads are fine with free Shield Standard plus CloudFront and WAF. Shield Advanced makes sense for high-value, internet-facing apps that need expert response and DDoS cost protection." },
      { q: "Can AWS WAF protect a Network Load Balancer?", a: "No. WAF works on HTTP and supports CloudFront, ALB, API Gateway, AppSync, Cognito and a few others. For an NLB, put CloudFront in front or use Network Firewall." },
      { q: "What is the difference between Inspector and GuardDuty?", a: "Inspector finds weaknesses before they are exploited, such as unpatched software. GuardDuty detects suspicious behavior that suggests an attack is happening or has happened." },
    ],
  },
};

export default extra;
