import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-networking/vpc-core": {
    plain: [
      "A VPC (Virtual Private Cloud) is your own private network inside AWS. You choose its address range, cut it into smaller pieces called subnets, and decide where traffic may go. Nothing can reach your servers from the internet unless you build a path for it.",
      "Each subnet lives in one Availability Zone. A good layout puts one public subnet and one or more private subnets in each of at least two AZs. Public subnets hold things the internet must reach, such as a load balancer. Private subnets hold app servers and databases.",
      "Route tables are the signposts. Every subnet follows one route table that says where each destination goes. \"Public\" simply means the route table sends internet traffic (0.0.0.0/0) to an internet gateway. Remove that route and the subnet is private.",
      "Private servers still need to download updates. A NAT gateway sits in a public subnet and lets private servers start connections out to the internet, while blocking anyone outside from starting connections in. It works like a receptionist who makes calls for you but never puts strangers through.",
    ],
    deepDive: [
      {
        heading: "Planning CIDR ranges",
        body: "A CIDR block like 10.0.0.0/16 describes a range of addresses: the /16 means the first 16 bits are fixed, leaving 65,536 addresses. A VPC can be between /16 and /28. Use private ranges from RFC 1918: 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16.\n\nThe golden rule is no overlap. If two networks use the same range, you cannot peer them or route between them through Transit Gateway, and connecting to the office VPN breaks. Keep a simple register of which range each VPC and office uses, or use VPC IPAM to hand them out.\n\nThe primary CIDR cannot change, but you can add secondary CIDR blocks later. AWS reserves five addresses in every subnet, so a /24 gives 251 usable IPs. Size generously: Kubernetes on EKS gives every pod its own VPC IP and can exhaust small subnets quickly.",
        visual: {
          type: "tree",
          title: "Carving up 10.0.0.0/16",
          root: "VPC 10.0.0.0/16",
          children: [
            { label: "Public tier", children: ["10.0.0.0/24 in AZ a", "10.0.1.0/24 in AZ b"] },
            { label: "App tier", children: ["10.0.10.0/23 in AZ a", "10.0.12.0/23 in AZ b"] },
            { label: "Data tier", children: ["10.0.20.0/24 in AZ a", "10.0.21.0/24 in AZ b"] },
            { label: "Spare", children: ["Room for a third AZ", "Room for new tiers"] },
          ],
        },
      },
      {
        heading: "Route tables and longest prefix match",
        body: "Every subnet is associated with exactly one route table. If you do not choose one, it uses the VPC's main route table, so keep the main table private and create custom tables for public subnets. Each table has a local route for the VPC's own CIDR, which you cannot delete; it lets all subnets in the VPC talk to each other.\n\nWhen several routes match a destination, the most specific one wins. A route to 10.1.0.0/16 through a peering connection beats 0.0.0.0/0 through a NAT gateway for traffic to 10.1.5.9. That is called longest prefix match.\n\nRoute targets include an internet gateway (igw-), NAT gateway (nat-), Transit Gateway (tgw-), peering connection (pcx-), gateway endpoint (via a prefix list), or a network interface for appliances such as firewalls.",
        bullets: ["The five reserved IPs: network, router (+1), DNS (+2), future use (+3), last address", "A subnet has one route table; a route table can serve many subnets", "Most specific route wins", "Keep the main route table private"],
      },
      {
        heading: "Internet gateway and public addresses",
        body: "An internet gateway is a highly available, horizontally scaled part of the VPC with no bandwidth limit to manage. A VPC can have only one. For IPv4 it performs one-to-one translation: the instance only knows its private IP, and the gateway maps it to the instance's public IPv4 address on the way out and back.\n\nSo an instance needs two things to be reachable: a route to the internet gateway, and a public IPv4 or Elastic IP. The subnet's auto-assign public IPv4 setting controls whether new instances get one. Since February 2024, every public IPv4 address costs about 0.005 USD per hour, so do not hand them out by default.\n\nIPv6 addresses are globally unique and need no translation. For IPv6 outbound-only access, use an egress-only internet gateway, the IPv6 equivalent of NAT.",
      },
      {
        heading: "NAT gateway details",
        body: "A NAT gateway is a managed service that lives in one AZ, in a public subnet, with an Elastic IP. Private subnets point 0.0.0.0/0 at it. It starts at 5 Gbps and scales automatically up to 100 Gbps, and supports up to 55,000 simultaneous connections to each unique destination. You pay per hour plus per GB processed, which can surprise teams pulling large container images or S3 data through it.\n\nFor resilience, run one NAT gateway per AZ and point each AZ's private route table at its own NAT. A single shared NAT is a single point of failure and adds cross-AZ data charges.\n\nTwo cost tips: S3 and DynamoDB traffic should use free gateway endpoints instead of NAT, and dev environments can share one NAT if downtime is acceptable. The older alternative, a NAT instance, is an EC2 instance you manage yourself; it needs the source/destination check disabled.",
        visual: {
          type: "compare",
          title: "NAT gateway vs NAT instance",
          columns: [
            { title: "NAT gateway", points: ["Managed, highly available in its AZ", "Scales to 100 Gbps", "No security groups on it", "Hourly plus per-GB charge"] },
            { title: "NAT instance", points: ["EC2 you patch and scale", "Limited by instance size", "Uses security groups", "Disable source/destination check"] },
          ],
        },
      },
      {
        heading: "Testing connectivity",
        body: "When a connection fails, check the path in order: route table, NACL, security group, then the operating system. VPC Reachability Analyzer automates this: give it a source and destination and it reports the first component that blocks the path, without sending real packets.\n\nVPC Flow Logs record accepted and rejected connections for a VPC, subnet or network interface, and can go to CloudWatch Logs or S3. A REJECT entry tells you a security group or NACL dropped the traffic; no entry at all usually means a routing problem.\n\nTo reach private instances, skip bastion hosts. Systems Manager Session Manager opens a shell through the SSM agent, with IAM controlling access and no inbound ports. The instance needs an instance profile role with the AmazonSSMManagedInstanceCore policy and a path to the SSM service, through NAT or interface endpoints.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How the internet gateway translates a public IP",
        actors: ["Internet client", "Internet gateway", "EC2 10.0.0.25"],
        messages: [
          { from: 0, to: 1, label: "Request to 203.0.113.10:443" },
          { from: 1, to: 2, label: "Destination rewritten to 10.0.0.25" },
          { from: 2, to: 1, label: "Reply from 10.0.0.25" },
          { from: 1, to: 0, label: "Source rewritten to 203.0.113.10" },
        ],
      },
    ],
    examples: [
      {
        title: "Wiring public and private routes",
        explanation: "A VPC already has subnets in two AZs and an attached internet gateway. Step 1: create a public route table with 0.0.0.0/0 to the IGW and associate the public subnet. Step 2: allocate an Elastic IP and create a NAT gateway in that public subnet. Step 3: create a private route table with 0.0.0.0/0 to the NAT gateway and associate the private subnet. Repeat steps 2 and 3 for the second AZ so each AZ has its own NAT.",
        code: {
          lang: "bash",
          code: "PUB_RT=$(aws ec2 create-route-table --vpc-id $VPC --query RouteTable.RouteTableId --output text)\naws ec2 create-route --route-table-id $PUB_RT \\\n  --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW\naws ec2 associate-route-table --route-table-id $PUB_RT --subnet-id $PUB_A\n\nEIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)\nNAT=$(aws ec2 create-nat-gateway --subnet-id $PUB_A --allocation-id $EIP \\\n  --query NatGateway.NatGatewayId --output text)\naws ec2 wait nat-gateway-available --nat-gateway-ids $NAT\nPRIV_RT=$(aws ec2 create-route-table --vpc-id $VPC --query RouteTable.RouteTableId --output text)\naws ec2 create-route --route-table-id $PRIV_RT \\\n  --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT\naws ec2 associate-route-table --route-table-id $PRIV_RT --subnet-id $PRIV_A",
        },
      },
      {
        title: "\"My public instance can't reach the internet\"",
        explanation: "A new instance in a \"public\" subnet cannot run apt update. Step 1: check the subnet's route table. It has only the local route because the subnet still uses the main table, so add the public table association. Still failing. Step 2: check the instance's public IP. It has none because auto-assign was off, so attach an Elastic IP. Step 3: check the security group's outbound rules; the default allows all outbound, fine. Step 4: check the NACL; a custom NACL has no outbound allow for ports 80 and 443 or inbound allow for return ports 1024 to 65535, so add them. Now it works. Reachability Analyzer would have pointed to each blocker in turn.",
      },
    ],
    cheatSheet: [
      "VPC size: /16 to /28; plan non-overlapping RFC 1918 ranges for every VPC and office",
      "AWS reserves 5 IPs per subnet: a /24 has 251 usable addresses",
      "Public subnet = route 0.0.0.0/0 to an internet gateway, plus instances with public IPs",
      "One internet gateway per VPC; NAT gateways are per AZ and must sit in a public subnet",
      "NAT gateway: 5 to 100 Gbps, hourly plus per-GB charges; one per AZ for resilience",
      "Each public IPv4 address costs about 0.005 USD per hour, attached or idle",
      "Egress-only internet gateway = outbound-only access for IPv6",
      "Reachability Analyzer finds the blocking hop; Flow Logs show ACCEPT and REJECT",
    ],
    quiz: [
      {
        q: "How many usable IP addresses does a /26 subnet have in AWS?",
        options: ["64", "62", "59", "56"],
        answer: 2,
        why: "A /26 has 64 addresses and AWS reserves 5 of them.",
      },
      {
        q: "A route table has 0.0.0.0/0 to a NAT gateway and 10.1.0.0/16 to a peering connection. Where does traffic to 10.1.4.7 go?",
        options: ["The peering connection", "The NAT gateway", "It is dropped", "The internet gateway"],
        answer: 0,
        why: "The most specific matching route wins, and /16 is more specific than /0.",
      },
      {
        q: "Private instances in two AZs share one NAT gateway in AZ a. What happens if AZ a fails?",
        options: ["Traffic fails over to AZ b automatically", "Only inbound traffic stops", "Nothing; NAT gateways are regional", "Instances in AZ b lose internet egress too"],
        answer: 3,
        why: "A zonal NAT gateway fails with its AZ, so other AZs routing through it lose egress.",
      },
      {
        q: "Which component lets IPv6 instances start outbound connections while blocking inbound ones?",
        options: ["NAT gateway", "Egress-only internet gateway", "Virtual private gateway", "Transit Gateway"],
        answer: 1,
        why: "The egress-only internet gateway is the IPv6 equivalent of NAT for outbound-only access.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Split 10.20.0.0/16 into one public and one private /24 subnet in each of two AZs, and say how many usable IPs each has.",
        hint: "Pick non-overlapping third octets, and subtract 5 from 256.",
        solution: "Public  AZ a: 10.20.0.0/24   (251 usable)\nPublic  AZ b: 10.20.1.0/24   (251 usable)\nPrivate AZ a: 10.20.10.0/24  (251 usable)\nPrivate AZ b: 10.20.11.0/24  (251 usable)\nThe gap between .1 and .10 leaves room to add more public subnets later.",
      },
      {
        level: "medium",
        task: "Find every route table in a VPC and show, for each, its associated subnets and its default route target.",
        hint: "describe-route-tables with a filter on vpc-id and a JMESPath query.",
        solution: "aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC \\\n  --query \"RouteTables[].{RT:RouteTableId,\n    Subnets:Associations[].SubnetId,\n    Default:Routes[?DestinationCidrBlock=='0.0.0.0/0'] | [0].[GatewayId,NatGatewayId]}\" \\\n  --output json\n# Tables with igw- are public; nat- are private with egress; none = isolated.",
      },
      {
        level: "hard",
        task: "Use Reachability Analyzer to check whether a private instance can reach the internet gateway on port 443, and read the result.",
        hint: "Create a path with source and destination resources, start an analysis, then describe it.",
        solution: "P=$(aws ec2 create-network-insights-path --source $INSTANCE_ID \\\n  --destination $IGW --protocol tcp --destination-port 443 \\\n  --query NetworkInsightsPath.NetworkInsightsPathId --output text)\nA=$(aws ec2 start-network-insights-analysis --network-insights-path-id $P \\\n  --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)\nsleep 30\naws ec2 describe-network-insights-analyses --network-insights-analysis-ids $A \\\n  --query \"NetworkInsightsAnalyses[0].[NetworkPathFound,Explanations[0].ExplanationCode]\"\n# NetworkPathFound false plus the explanation names the blocking component.",
      },
    ],
    faq: [
      { q: "What is the default VPC?", a: "Every Region in a new account has a default VPC (172.31.0.0/16) with a public subnet in each AZ. It is handy for quick tests, but build your own VPC for real workloads." },
      { q: "Can I change a VPC's CIDR after creating it?", a: "You cannot change the primary CIDR, but you can add secondary CIDR blocks and create new subnets in them." },
      { q: "Why is my NAT gateway bill so high?", a: "NAT gateways charge per GB processed. Large S3 or DynamoDB traffic should use gateway endpoints, and other AWS service traffic can use interface endpoints." },
      { q: "Do I still need a bastion host?", a: "Usually not. Systems Manager Session Manager gives shell access to private instances with IAM control, logging and no open inbound ports." },
    ],
  },

  "aws-networking/vpc-security": {
    plain: [
      "A VPC has two kinds of built-in firewall. Security groups protect each network interface of an instance, load balancer or database. Network ACLs (NACLs) protect a whole subnet. Traffic usually has to pass both, so they work like a guard at the building gate and a lock on each office door.",
      "Security groups are stateful: they remember connections. If they let a request in, the reply goes out automatically. They only have allow rules, and anything not allowed is blocked. NACLs are stateless: each direction is checked separately, so you must allow the reply too. NACLs can also say deny.",
      "Your servers often need AWS services like S3 or DynamoDB. Without help, that traffic travels out through a NAT gateway to the service's public address. VPC endpoints give a private path instead, so the traffic never leaves the AWS network and you skip NAT charges.",
      "There are two kinds of endpoint. Gateway endpoints are free route table entries for S3 and DynamoDB. Interface endpoints are private network cards in your subnets that reach almost any AWS service, or even another company's service, through AWS PrivateLink.",
    ],
    deepDive: [
      {
        heading: "Security groups in practice",
        body: "Security groups attach to network interfaces (ENIs), not to subnets. Each rule has a protocol, a port range, and a source or destination, which can be a CIDR, a managed prefix list, or another security group. A new security group allows no inbound traffic and all outbound traffic. The default security group also allows inbound traffic from itself.\n\nReferencing a security group instead of IPs is the most useful habit. \"Allow port 5432 from the app security group\" keeps working as instances come and go, and it even works across peered VPCs in the same Region.\n\nAll rules are evaluated together; there is no order and no deny. Changes take effect immediately. By default an ENI can have up to five security groups and each group up to 60 inbound and 60 outbound rules; both quotas can be raised.",
        visual: {
          type: "flow",
          title: "Chained security groups in a three-tier app",
          steps: [
            { label: "Internet", detail: "Users on port 443." },
            { label: "ALB SG", detail: "Allows 443 from 0.0.0.0/0." },
            { label: "App SG", detail: "Allows 8080 from the ALB SG only." },
            { label: "DB SG", detail: "Allows 5432 from the app SG only." },
          ],
        },
      },
      {
        heading: "NACLs: stateless and ordered",
        body: "Each subnet has exactly one network ACL. The default NACL allows all traffic in and out. A custom NACL you create denies everything until you add rules. Rules are numbered from 1 to 32766 and checked from lowest to highest; the first match wins and the rest are ignored. A final rule marked * denies anything that matched nothing.\n\nBecause NACLs are stateless, replies need their own rule. A client connecting to your web server on port 443 uses a random high source port for the reply. Linux clients use 32768 to 60999, Windows 49152 to 65535, and NAT gateways and load balancers use 1024 to 65535. Allowing 1024 to 65535 for return traffic covers them all.\n\nUse NACLs for coarse subnet-wide rules, especially deny rules for known bad IP ranges. Leave fine-grained, per-application rules to security groups.",
        visual: {
          type: "sequence",
          title: "Why stateless NACLs need two rules",
          actors: ["Client 198.51.100.7", "Subnet NACL", "Web server"],
          messages: [
            { from: 0, to: 1, label: "SYN to port 443 from port 50123" },
            { from: 1, to: 2, label: "Inbound rule 100: allow 443" },
            { from: 2, to: 1, label: "Reply to port 50123" },
            { from: 1, to: 0, label: "Outbound rule: allow 1024-65535" },
          ],
        },
      },
      {
        heading: "Gateway endpoints for S3 and DynamoDB",
        body: "A gateway endpoint adds a route to your chosen route tables. The destination is an AWS managed prefix list (pl-...) that represents all S3 or DynamoDB addresses in that Region, and the target is the endpoint. Instances need no code changes; the same public service names now resolve and route privately. Gateway endpoints are free, which is why they are the classic fix for high NAT costs.\n\nLimits matter for the exam. Gateway endpoints only reach services in the same Region. They cannot be used from on-premises networks over VPN or Direct Connect, or from other VPCs through peering or Transit Gateway.\n\nAn endpoint policy can restrict which buckets or tables are reachable through it, which helps stop data being copied to an attacker's bucket. On the bucket side, a policy condition on aws:SourceVpce or aws:SourceVpc can require that requests come through your endpoint or VPC. Conditions on aws:SourceIp do not work for endpoint traffic, because it uses private addresses.",
        bullets: ["Free, route-table based", "S3 and DynamoDB only, same Region", "Not usable from on-premises or peered VPCs", "Endpoint policy limits which buckets are reachable"],
      },
      {
        heading: "Interface endpoints and PrivateLink",
        body: "An interface endpoint places an ENI with a private IP in each subnet you choose, usually one per AZ. With private DNS enabled, the service's normal name, such as ssm.us-east-1.amazonaws.com, resolves to those private IPs inside the VPC. This needs the VPC's DNS support and DNS hostnames attributes turned on. The endpoint has a security group that must allow HTTPS from your clients. You pay per endpoint per AZ per hour, plus per GB.\n\nUnlike gateway endpoints, interface endpoints are reachable from on-premises over VPN or Direct Connect and from connected VPCs. S3 offers both kinds; use the interface type when on-premises systems need private S3 access.\n\nThe same technology, AWS PrivateLink, lets you publish your own service. Put it behind a Network Load Balancer, create an endpoint service, and consumers create interface endpoints to it. Traffic flows one way only, and overlapping CIDRs between provider and consumer do not matter.",
        visual: {
          type: "flow",
          title: "Publishing a service with PrivateLink",
          steps: [
            { label: "Provider NLB", detail: "Service runs behind an NLB." },
            { label: "Endpoint service", detail: "Provider allows chosen accounts." },
            { label: "Consumer endpoint", detail: "Interface endpoint in consumer VPC." },
            { label: "Accept", detail: "Provider approves the connection." },
            { label: "Private calls", detail: "Consumer uses the endpoint DNS name." },
          ],
        },
      },
      {
        heading: "Choosing the right control",
        body: "Match the control to the job. Security groups are the default for allowing traffic to each workload. NACLs are for subnet-wide guardrails and blocking specific IP ranges, since only they can deny. AWS WAF filters HTTP requests on CloudFront, ALB and API Gateway. AWS Network Firewall inspects all traffic in and out of a VPC with stateful rules, including domain name filtering, which suits \"only allow outbound traffic to these domains\" requirements.\n\nEndpoints are a security control too. Gateway or interface endpoints with endpoint policies keep AWS API traffic private and limit which resources can be reached, a key part of a data perimeter.\n\nVerify rather than assume. Flow logs show what is actually accepted and rejected, and Reachability Analyzer shows which rule would block a path before you deploy.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Checks on the way into an instance",
        layers: [
          { label: "Route table", detail: "Is there a path to this subnet?" },
          { label: "Network ACL", detail: "Subnet rules, numbered, first match wins." },
          { label: "Security group", detail: "ENI rules, all allows evaluated together." },
          { label: "OS firewall", detail: "iptables or Windows Firewall, if used." },
          { label: "Application", detail: "Must be listening on the port." },
        ],
      },
    ],
    examples: [
      {
        title: "Three-tier security groups from the CLI",
        explanation: "Step 1: create three security groups in the VPC. Step 2: the ALB group allows 443 from anywhere. Step 3: the app group allows 8080 only from the ALB group, so even another instance in the same subnet cannot hit the app directly. Step 4: the database group allows 5432 only from the app group. Auto Scaling can add and remove app instances freely, and no IP addresses ever appear in the rules.",
        code: {
          lang: "bash",
          code: "ALB_SG=$(aws ec2 create-security-group --vpc-id $VPC --group-name alb \\\n  --description \"ALB\" --query GroupId --output text)\nAPP_SG=$(aws ec2 create-security-group --vpc-id $VPC --group-name app \\\n  --description \"App\" --query GroupId --output text)\nDB_SG=$(aws ec2 create-security-group --vpc-id $VPC --group-name db \\\n  --description \"DB\" --query GroupId --output text)\naws ec2 authorize-security-group-ingress --group-id $ALB_SG \\\n  --protocol tcp --port 443 --cidr 0.0.0.0/0\naws ec2 authorize-security-group-ingress --group-id $APP_SG \\\n  --protocol tcp --port 8080 --source-group $ALB_SG\naws ec2 authorize-security-group-ingress --group-id $DB_SG \\\n  --protocol tcp --port 5432 --source-group $APP_SG",
        },
      },
      {
        title: "Blocking an attacking range with a NACL",
        explanation: "Logs show abuse from 198.51.100.0/24 against a public subnet. Security groups cannot deny, so use the subnet's NACL. Step 1: list the NACL's rules and note that the allow rule for 443 is number 100. Step 2: add a deny rule with a lower number, 90, so it is checked first. Step 3: confirm with flow logs that traffic from that range now shows REJECT. If you had added the deny as rule 110, the allow at 100 would match first and the deny would never apply.",
        code: {
          lang: "bash",
          code: "aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$PUB_A \\\n  --query \"NetworkAcls[0].[NetworkAclId,Entries]\"\naws ec2 create-network-acl-entry --network-acl-id acl-0abc1234 \\\n  --ingress --rule-number 90 --protocol -1 \\\n  --rule-action deny --cidr-block 198.51.100.0/24",
        },
      },
    ],
    cheatSheet: [
      "Security group: ENI level, stateful, allow only, all rules evaluated together",
      "NACL: subnet level, stateless, allow and deny, lowest rule number wins",
      "New custom NACLs deny everything; the default NACL allows everything",
      "NACL return traffic: allow ephemeral ports 1024 to 65535",
      "Reference security groups as sources instead of IP addresses",
      "Gateway endpoint: free, S3 and DynamoDB, same Region, not from on-premises",
      "Interface endpoint: ENI per AZ, private DNS, hourly cost, reachable over VPN and DX",
      "Use aws:SourceVpce, not aws:SourceIp, to restrict buckets to endpoint traffic",
    ],
    quiz: [
      {
        q: "A NACL has rule 100 allowing TCP 443 from 0.0.0.0/0 and rule 120 denying 203.0.113.0/24. Is HTTPS from 203.0.113.9 allowed?",
        options: ["No, deny rules always win", "Yes, rule 100 matches first", "No, rule 120 is more specific", "Only if the security group allows it"],
        answer: 1,
        why: "NACL rules are checked in number order and the first match wins.",
      },
      {
        q: "On-premises servers reach AWS over Direct Connect and need private access to S3. Which endpoint type works?",
        options: ["S3 gateway endpoint", "Internet gateway", "NAT gateway", "S3 interface endpoint"],
        answer: 3,
        why: "Gateway endpoints cannot be used from on-premises, while interface endpoints can.",
      },
      {
        q: "Inbound HTTPS works through a custom NACL, but clients never get a response. What is missing?",
        options: ["An outbound rule for ephemeral ports", "A security group outbound rule", "An inbound rule for port 80", "An internet gateway"],
        answer: 0,
        why: "NACLs are stateless, so return traffic to clients' high ports needs its own outbound allow.",
      },
      {
        q: "A SaaS provider wants to offer its API privately to customers whose VPC CIDRs overlap with its own. What should it use?",
        options: ["VPC peering", "Transit Gateway", "PrivateLink endpoint service behind an NLB", "Site-to-Site VPN"],
        answer: 2,
        why: "PrivateLink is one-way and unaffected by overlapping CIDRs, unlike peering and Transit Gateway.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add an S3 gateway endpoint to your private route table and confirm the new route.",
        hint: "Look for a route whose destination is a prefix list starting with pl-.",
        solution: "aws ec2 create-vpc-endpoint --vpc-id $VPC \\\n  --vpc-endpoint-type Gateway \\\n  --service-name com.amazonaws.us-east-1.s3 \\\n  --route-table-ids $PRIV_RT\naws ec2 describe-route-tables --route-table-ids $PRIV_RT \\\n  --query \"RouteTables[0].Routes[?DestinationPrefixListId]\"",
      },
      {
        level: "medium",
        task: "Write a bucket policy that denies all access to the bucket private-data unless the request comes through endpoint vpce-0abc1234.",
        hint: "Deny with StringNotEquals on aws:SourceVpce. Be careful not to lock yourself out of the console.",
        solution: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"OnlyThroughEndpoint\",\n    \"Effect\": \"Deny\", \"Principal\": \"*\", \"Action\": \"s3:*\",\n    \"Resource\": [\"arn:aws:s3:::private-data\", \"arn:aws:s3:::private-data/*\"],\n    \"Condition\": {\"StringNotEquals\": {\"aws:SourceVpce\": \"vpce-0abc1234\"}}\n  }]\n}",
      },
      {
        level: "hard",
        task: "Make Session Manager work for instances in a private subnet with no NAT gateway.",
        hint: "Session Manager needs interface endpoints for SSM services, private DNS, and a security group allowing 443.",
        solution: "EP_SG=$(aws ec2 create-security-group --vpc-id $VPC --group-name ssm-ep \\\n  --description \"SSM endpoints\" --query GroupId --output text)\naws ec2 authorize-security-group-ingress --group-id $EP_SG \\\n  --protocol tcp --port 443 --cidr 10.0.0.0/16\nfor s in ssm ssmmessages ec2messages; do\n  aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Interface \\\n    --service-name com.amazonaws.us-east-1.$s --subnet-ids $PRIV_A $PRIV_B \\\n    --security-group-ids $EP_SG --private-dns-enabled\ndone\n# ec2messages is only needed by older SSM Agent versions.\n# Instances also need a role with AmazonSSMManagedInstanceCore.",
      },
    ],
    faq: [
      { q: "Can a security group block a specific IP address?", a: "No. Security groups only have allow rules. Use a NACL deny rule, AWS WAF for HTTP traffic, or Network Firewall." },
      { q: "Do I need both security groups and NACLs?", a: "Security groups are required and do most of the work. Many teams leave NACLs at the default allow-all and only add NACL rules for subnet-wide denies or compliance." },
      { q: "Are VPC endpoints free?", a: "Gateway endpoints for S3 and DynamoDB are free. Interface endpoints are charged per hour per AZ and per GB processed." },
      { q: "Does changing a security group need a restart?", a: "No. Rule changes apply immediately to every interface that uses the group." },
    ],
  },

  "aws-networking/hybrid": {
    plain: [
      "Sooner or later, networks need to talk to each other: two VPCs, fifty VPCs, or AWS and your office data center. AWS offers several ways to connect them, and each fits a different size and need.",
      "VPC peering is a direct link between two VPCs. It is simple and cheap, but it does not pass traffic on: if A peers with B and B peers with C, A still cannot reach C. With many VPCs, the number of links explodes. Transit Gateway fixes that by acting as a central hub that every VPC plugs into once.",
      "To reach your office or data center, Site-to-Site VPN builds an encrypted tunnel over the normal internet. You can set it up in an afternoon, but speed and latency depend on the internet. AWS Direct Connect is a private cable from your network into AWS. It is steady and fast, but takes weeks to arrange.",
      "Many companies use both: Direct Connect for daily traffic, and a VPN as a cheap backup in case the cable fails. On the exam, the words \"quickly\", \"encrypted\", \"consistent latency\" and \"many VPCs\" tell you which option the question wants.",
    ],
    deepDive: [
      {
        heading: "VPC peering rules",
        body: "A peering connection links exactly two VPCs, in the same or different Regions and accounts. One side requests, the other accepts, and then both sides must add routes pointing the other VPC's CIDR at the peering connection (pcx-). Security groups must also allow the traffic; in the same Region, you can reference the peer's security groups.\n\nThe limits are strict. CIDRs must not overlap. Peering is not transitive. There is no edge-to-edge routing either: a VPC cannot use its peer's internet gateway, NAT gateway, VPN, Direct Connect or gateway endpoint.\n\nPeering has no hourly charge and no bandwidth bottleneck, since it uses the existing AWS network. You pay normal data transfer, and traffic between peered VPCs in the same AZ is free. A full mesh of n VPCs needs n times (n minus 1) divided by 2 connections, so 10 VPCs need 45 and 20 need 190. That is where Transit Gateway takes over.",
        bullets: ["No overlapping CIDRs", "Not transitive, no edge-to-edge routing", "Add routes on both sides", "No hourly charge"],
      },
      {
        heading: "Transit Gateway in depth",
        body: "A Transit Gateway is a Regional router. You attach VPCs (one subnet per AZ), Site-to-Site VPNs, Direct Connect gateways, SD-WAN appliances through Connect attachments, and other Transit Gateways through peering, including across Regions. Routing is transitive: anything attached can reach anything else, if the route tables allow it.\n\nTransit Gateway route tables give you segmentation. Each attachment is associated with one route table, which decides where its traffic can go, and attachments propagate their routes into chosen tables. A common design keeps Prod and Dev separate while both reach a shared services VPC and on-premises.\n\nShare one Transit Gateway across accounts with AWS Resource Access Manager. You pay per attachment per hour and per GB processed, so for two VPCs with heavy traffic, peering can be cheaper. For VPN attachments, equal-cost multipath (ECMP) spreads traffic across tunnels for more bandwidth.",
        visual: {
          type: "tree",
          title: "Segmenting with Transit Gateway route tables",
          root: "Transit Gateway",
          children: [
            { label: "Prod route table", children: ["Associated: prod VPCs", "Routes: shared VPC, on-premises"] },
            { label: "Dev route table", children: ["Associated: dev VPCs", "Routes: shared VPC only"] },
            { label: "Shared route table", children: ["Associated: shared services VPC", "Routes: prod, dev, on-premises"] },
            { label: "On-prem route table", children: ["Associated: VPN and DX", "Routes: prod and shared VPCs"] },
          ],
        },
      },
      {
        heading: "Site-to-Site VPN mechanics",
        body: "On your side, a router or firewall is defined in AWS as a customer gateway. On the AWS side, the VPN terminates on a virtual private gateway attached to one VPC, or on a Transit Gateway to reach many. Every VPN connection has two IPsec tunnels ending in different AZs, so AWS maintenance or an AZ problem does not drop you, provided your device brings up both tunnels.\n\nRouting is static, where you type the prefixes, or dynamic with BGP, where routers exchange routes and fail over automatically. Prefer BGP. Each standard tunnel carries up to about 1.25 Gbps. For more, attach the VPN to a Transit Gateway and use ECMP across several connections. Accelerated VPN, available on Transit Gateway, enters the AWS network at the nearest edge location for steadier performance.\n\nFor individual remote users rather than whole offices, AWS Client VPN provides a managed, OpenVPN-based service.",
        visual: {
          type: "sequence",
          title: "A VPN connection with two tunnels",
          actors: ["Office router", "Tunnel 1 (AZ a)", "Tunnel 2 (AZ b)"],
          messages: [
            { from: 0, to: 1, label: "IKE and IPsec up, BGP session" },
            { from: 0, to: 2, label: "IKE and IPsec up, BGP session" },
            { from: 0, to: 1, label: "Advertise 192.168.0.0/16" },
            { from: 1, to: 0, label: "Advertise VPC 10.0.0.0/16" },
            { from: 0, to: 1, label: "Traffic flows on tunnel 1" },
            { from: 0, to: 2, label: "Tunnel 1 down: BGP moves traffic" },
          ],
        },
      },
      {
        heading: "Direct Connect in depth",
        body: "Direct Connect is a physical cross-connect at a Direct Connect location, a data center where AWS has routers. Dedicated connections come in 1, 10, 100 and 400 Gbps. Hosted connections from AWS partners range from 50 Mbps to 25 Gbps and are faster to get. Lead time is typically weeks.\n\nOver the link you create virtual interfaces (VIFs). A private VIF reaches VPCs through a virtual private gateway or a Direct Connect gateway. A transit VIF reaches Transit Gateways through a Direct Connect gateway. A public VIF reaches AWS public endpoints, such as S3, over the private link. A Direct Connect gateway is a global object, so one connection can reach VPCs in many Regions.\n\nDirect Connect is private but not encrypted. Use MACsec on supported dedicated connections, or run an IPsec VPN over it. For resilience, AWS recommends connections at two separate locations, or two at each of two locations for maximum resiliency.",
        visual: {
          type: "flow",
          title: "Path of a Direct Connect packet",
          steps: [
            { label: "Your router", detail: "In your data center." },
            { label: "DX location", detail: "Cross-connect to AWS router." },
            { label: "Virtual interface", detail: "Private or transit VIF, BGP." },
            { label: "DX gateway", detail: "Global, links many Regions." },
            { label: "VGW or TGW", detail: "Into one VPC or many." },
          ],
        },
      },
      {
        heading: "Choosing connectivity for exam scenarios",
        body: "Look for the deciding words. \"Two or three VPCs, low cost\" suggests peering. \"Dozens of VPCs\", \"hub and spoke\", \"transitive\" or \"simplify management\" suggests Transit Gateway. \"Expose one application to other VPCs or customers\" suggests PrivateLink. \"Connect the office quickly\" or \"encrypted over the internet\" suggests Site-to-Site VPN. \"Consistent latency\", \"large data transfers\" or \"dedicated private connection\" suggests Direct Connect.\n\nCombinations are common. \"Direct Connect plus encryption\" means a VPN over Direct Connect or MACsec. \"Highly available, cost-effective hybrid\" often means Direct Connect with a VPN backup. When both paths advertise the same prefix, AWS prefers Direct Connect routes over VPN routes, so failover to VPN happens only when Direct Connect drops.\n\nWatch for traps: peering never reaches a peer's VPN or internet gateway, and Direct Connect cannot be ready \"this week\".",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Peering vs Transit Gateway vs PrivateLink",
        columns: [
          { title: "VPC peering", points: ["One-to-one VPC link", "Not transitive", "No hourly fee", "No overlapping CIDRs"] },
          { title: "Transit Gateway", points: ["Hub for VPCs, VPN and DX", "Transitive with route tables", "Per attachment and per GB fees", "No overlapping CIDRs"] },
          { title: "PrivateLink", points: ["One service, one direction", "Consumer creates an endpoint", "Overlapping CIDRs are fine", "Provider needs an NLB"] },
        ],
      },
    ],
    examples: [
      {
        title: "Growing from peering to Transit Gateway",
        explanation: "A company starts with three VPCs and one office. Step 1: three peering connections (3 times 2 divided by 2) and a VPN on the main VPC are enough. Step 2: the office cannot reach the other two VPCs, because peering has no edge-to-edge routing. Step 3: after growth to 15 VPCs, a full mesh would need 105 peerings. Step 4: create a Transit Gateway, share it with RAM, attach every VPC and the VPN, and point each VPC's route for 10.0.0.0/8 at the Transit Gateway. Step 5: remove the old peerings. Now any VPC can reach the office, and new VPCs need one attachment each.",
        code: {
          lang: "bash",
          code: "TGW=$(aws ec2 create-transit-gateway --description hub \\\n  --options AmazonSideAsn=64512,DefaultRouteTableAssociation=enable,DefaultRouteTablePropagation=enable \\\n  --query TransitGateway.TransitGatewayId --output text)\naws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id $TGW \\\n  --vpc-id $VPC --subnet-ids $PRIV_A $PRIV_B\naws ec2 create-route --route-table-id $PRIV_RT \\\n  --destination-cidr-block 10.0.0.0/8 --transit-gateway-id $TGW",
        },
      },
      {
        title: "Resilient hybrid link for a bank",
        explanation: "A bank needs steady 10 Gbps to AWS, encryption, and no single point of failure, at reasonable cost. Step 1: order two 10 Gbps dedicated Direct Connect connections at two different Direct Connect locations. Step 2: enable MACsec on both, which meets the encryption requirement without VPN throughput limits. Step 3: create transit VIFs to a Direct Connect gateway associated with the Transit Gateway. Step 4: add a Site-to-Site VPN to the same Transit Gateway as a last-resort backup. Step 5: because AWS prefers Direct Connect routes over VPN routes for the same prefix, traffic stays on Direct Connect and only moves to the VPN if both connections fail. Test failover by shutting down a BGP session in a maintenance window.",
      },
    ],
    cheatSheet: [
      "Peering: two VPCs, not transitive, no edge-to-edge routing, no overlapping CIDRs",
      "Full mesh of n VPCs needs n(n-1)/2 peerings: 10 VPCs = 45",
      "Transit Gateway: Regional hub, route tables for segmentation, share with RAM",
      "Every Site-to-Site VPN connection has 2 tunnels in different AZs; use BGP",
      "Standard VPN tunnel: about 1.25 Gbps; scale with ECMP on Transit Gateway",
      "Direct Connect dedicated: 1, 10, 100, 400 Gbps; hosted: 50 Mbps to 25 Gbps",
      "Direct Connect is not encrypted: add MACsec or IPsec VPN on top",
      "Same prefix on DX and VPN: AWS prefers the Direct Connect route",
    ],
    quiz: [
      {
        q: "VPC A peers with VPC B, and B has a NAT gateway. Can instances in A use it for internet access?",
        options: ["Yes, with a route to the peering connection", "Yes, if both VPCs are in the same account", "No, peering does not allow edge-to-edge routing", "Only for IPv6 traffic"],
        answer: 2,
        why: "A VPC cannot use its peer's gateways, NAT, VPN or Direct Connect.",
      },
      {
        q: "Prod and Dev VPCs are attached to one Transit Gateway. Both must reach shared services but never each other. How?",
        options: ["Separate Transit Gateway route tables for Prod and Dev", "Security groups on the Transit Gateway", "Peering between Prod and Dev", "One NAT gateway per VPC"],
        answer: 0,
        why: "Transit Gateway route tables control which attachments can reach which routes.",
      },
      {
        q: "A regulator requires encryption on a new Direct Connect link. What satisfies it?",
        options: ["Direct Connect is encrypted by default", "A public VIF", "A Direct Connect gateway", "MACsec or an IPsec VPN over the connection"],
        answer: 3,
        why: "Direct Connect is private but unencrypted, so MACsec or IPsec must be added.",
      },
      {
        q: "A team needs office-to-VPC connectivity by tomorrow, encrypted, at low cost. What fits?",
        options: ["Direct Connect dedicated connection", "Site-to-Site VPN", "VPC peering", "Global Accelerator"],
        answer: 1,
        why: "A Site-to-Site VPN can be set up in hours and encrypts traffic over the internet.",
      },
      {
        q: "Why should an on-premises VPN device bring up both tunnels of a VPN connection?",
        options: ["Each tunnel only carries one direction", "AWS bills less for two tunnels", "Tunnels end in different AZs, so one stays up during maintenance", "BGP needs exactly two peers"],
        answer: 2,
        why: "AWS performs maintenance on one tunnel at a time, so a single tunnel means planned outages.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Peer two VPCs in your account (10.0.0.0/16 and 10.1.0.0/16) and add the routes so they can talk.",
        hint: "Request, accept, then a route on each side pointing at the pcx- ID.",
        solution: "PCX=$(aws ec2 create-vpc-peering-connection --vpc-id $VPC_A --peer-vpc-id $VPC_B \\\n  --query VpcPeeringConnection.VpcPeeringConnectionId --output text)\naws ec2 accept-vpc-peering-connection --vpc-peering-connection-id $PCX\naws ec2 create-route --route-table-id $RT_A \\\n  --destination-cidr-block 10.1.0.0/16 --vpc-peering-connection-id $PCX\naws ec2 create-route --route-table-id $RT_B \\\n  --destination-cidr-block 10.0.0.0/16 --vpc-peering-connection-id $PCX\n# Also allow the traffic in both VPCs' security groups.",
      },
      {
        level: "medium",
        task: "A company has 8 VPCs today and expects 30 next year, plus two data centers. Compare the number of connections needed with peering and with Transit Gateway.",
        hint: "Use n(n-1)/2 for the mesh, and count one attachment per network for the hub.",
        solution: "Peering mesh today: 8*7/2 = 28 peerings; next year: 30*29/2 = 435.\nData centers still need VPNs or DX to every VPC (peering is not transitive).\nTransit Gateway today: 8 VPC attachments + 2 VPN or DX attachments = 10.\nNext year: 30 + 2 = 32 attachments.\nTransit Gateway scales linearly and gives transitive routing; choose it.",
      },
      {
        level: "hard",
        task: "Design connectivity for: 20 VPCs in two Regions, one data center needing 5 Gbps steady throughput, encryption required, and survival of any single link failure.",
        hint: "Combine Transit Gateways, inter-Region peering, Direct Connect with redundancy, and encryption.",
        solution: "One Transit Gateway per Region; attach that Region's VPCs.\nPeer the two Transit Gateways for inter-Region traffic.\nTwo 10 Gbps dedicated DX connections at two DX locations, MACsec enabled.\nTransit VIFs to a DX gateway associated with both Transit Gateways.\nSite-to-Site VPN to a Transit Gateway as a last-resort backup.\nTransit Gateway route tables to segment prod and non-prod.\nAny single DX link or location can fail without losing connectivity.",
      },
    ],
    faq: [
      { q: "Is VPC peering free?", a: "There is no charge to create or keep a peering connection. You pay data transfer, and traffic between peered VPCs within the same AZ is free." },
      { q: "How long does Direct Connect take to set up?", a: "Usually several weeks, because a physical cross-connect must be arranged. Hosted connections from partners can be quicker." },
      { q: "Can Transit Gateway connect VPCs in different Regions?", a: "Yes, by peering Transit Gateways across Regions. Traffic between them travels over the AWS global network and is encrypted." },
      { q: "What is the difference between a virtual private gateway and a Transit Gateway?", a: "A virtual private gateway is the VPN or Direct Connect endpoint for a single VPC. A Transit Gateway is a hub that connects many VPCs and on-premises links together." },
    ],
  },

  "aws-networking/edge": {
    plain: [
      "When someone types a web address, their computer first asks DNS, the internet's phone book, for the matching IP address. Amazon Route 53 is AWS's DNS service. Besides plain answers, it can give different answers to different users: the nearest Region, a backup site when the main one is down, or 10 percent of users a new version.",
      "Amazon CloudFront is a content delivery network (CDN). It keeps copies of your images, videos and pages in hundreds of edge locations around the world. A user in Tokyo gets files from a nearby edge instead of from your server in Virginia, so pages load faster and your servers do less work.",
      "Some apps cannot use a CDN because nothing can be cached, or they use protocols other than HTTP, such as games or voice calls. AWS Global Accelerator helps here. It gives you two fixed IP addresses that work worldwide, and carries user traffic over AWS's private network to the healthiest Region.",
      "Together these three services answer the global questions on the exam: how do users find my app, how do they get content quickly, and what happens when a Region fails?",
    ],
    deepDive: [
      {
        heading: "How a DNS lookup reaches Route 53",
        body: "A browser asks a recursive resolver, usually run by the ISP or a public DNS service. If the answer is not cached, the resolver asks the root servers, then the servers for the top-level domain such as .com, which point to the four Route 53 name servers listed for your hosted zone. Route 53 answers, and the resolver caches that answer for the record's TTL (time to live).\n\nTTL drives failover speed. With a 300-second TTL, some users keep the old answer for up to five minutes after a change. Use 60 seconds or less for records that fail over. Alias records to AWS resources use the target's TTL.\n\nPublic hosted zones answer the internet. Private hosted zones answer only inside associated VPCs. For hybrid DNS, Route 53 Resolver inbound endpoints let on-premises servers query VPC names, and outbound endpoints with forwarding rules let VPCs query on-premises DNS.",
        visual: {
          type: "sequence",
          title: "Resolving app.example.com",
          actors: ["Browser", "Recursive resolver", "Root and .com servers", "Route 53"],
          messages: [
            { from: 0, to: 1, label: "Where is app.example.com?" },
            { from: 1, to: 2, label: "Who serves example.com?" },
            { from: 2, to: 1, label: "Route 53 name servers" },
            { from: 1, to: 3, label: "A record for app.example.com?" },
            { from: 3, to: 1, label: "Answer per routing policy, TTL 60" },
            { from: 1, to: 0, label: "IP address, cached for the TTL" },
          ],
        },
      },
      {
        heading: "Routing policies in practice",
        body: "Simple returns one record set. Weighted splits traffic by ratio, for canary releases or A/B tests; weight 0 takes a record out. Latency-based answers with the Region that has the lowest measured latency for that user's network. Failover returns the primary while its health check passes, otherwise the secondary. Geolocation answers by the user's continent, country or US state, useful for language or legal rules; always add a default record for unmatched locations. Geoproximity routes by distance between user and resource, with a bias to grow or shrink a Region's area. Multivalue answer returns up to eight healthy records, giving simple client-side load spreading. IP-based routing answers by the user's source IP range, using CIDR collections you define.\n\nPolicies can be nested. For example, latency records can each point to a weighted set inside that Region.",
        visual: {
          type: "tree",
          title: "Routing policies by purpose",
          root: "Route 53 routing",
          children: [
            { label: "Split traffic", children: ["Weighted"] },
            { label: "Fastest or nearest", children: ["Latency", "Geoproximity"] },
            { label: "By user location or network", children: ["Geolocation", "IP-based"] },
            { label: "Stay available", children: ["Failover", "Multivalue answer"] },
            { label: "Just answer", children: ["Simple"] },
          ],
        },
      },
      {
        heading: "Health checks and failover",
        body: "Endpoint health checks probe an IP or domain over HTTP, HTTPS or TCP, optionally looking for a string in the response. Checkers in several AWS Regions probe every 30 seconds, or every 10 seconds at extra cost, and an endpoint becomes unhealthy after three failures in a row by default. Route 53 treats it as healthy if more than 18 percent of checkers report healthy. Calculated health checks combine child checks, such as \"healthy if two of three are up\". CloudWatch alarm health checks follow an alarm, which is how you monitor private resources the checkers cannot reach.\n\nFor alias records, set Evaluate Target Health so Route 53 uses the load balancer's own health. Total failover time is roughly detection time plus the TTL, often one to two minutes. Make sure your firewall allows the Route 53 health checker IP ranges.",
        bullets: ["Endpoint, calculated and CloudWatch alarm checks", "30 s or 10 s interval, failure threshold 3 by default", "Private resources: use CloudWatch alarm checks", "Failover time is about detection plus TTL"],
      },
      {
        heading: "CloudFront in front of S3 and ALB",
        body: "A distribution has origins and cache behaviors. Behaviors match path patterns: send /api/* to the ALB with caching disabled, and everything else to an S3 bucket with long caching. A cache policy sets the cache key (which headers, cookies and query strings matter) and TTLs; by default the minimum TTL is 0, the default 24 hours, and the maximum one year. Include as little as possible in the cache key, or the hit rate drops.\n\nKeep origins private. For S3, use origin access control (OAC) and a bucket policy that allows only your distribution. For an ALB, allow only the CloudFront origin-facing managed prefix list in its security group and check a secret custom header, or use VPC origins to reach a fully private ALB.\n\nUse invalidations to remove stale files; the first 1,000 paths each month are free. Versioned file names avoid invalidations entirely. CloudFront Functions run tiny JavaScript at the edge for header and URL changes; Lambda@Edge runs heavier logic.",
        visual: {
          type: "flow",
          title: "A request through CloudFront",
          steps: [
            { label: "Viewer", detail: "HTTPS to the nearest edge location." },
            { label: "Edge cache", detail: "Hit: respond immediately." },
            { label: "Regional edge cache", detail: "Bigger mid-tier cache on a miss." },
            { label: "Origin Shield", detail: "Optional single layer before origin." },
            { label: "Origin", detail: "S3 or ALB builds the response." },
          ],
        },
      },
      {
        heading: "Global Accelerator in depth",
        body: "Global Accelerator gives you two static anycast IPv4 addresses, announced from many edge locations at once. A user's packets enter the AWS network at the nearest edge and travel over the AWS backbone instead of the public internet, which reduces jitter and packet loss.\n\nYou configure listeners for TCP or UDP ports, and endpoint groups per Region. Each group has a traffic dial (the percentage of traffic it accepts) and endpoints with weights: ALBs, NLBs, EC2 instances or Elastic IPs. Health checks remove unhealthy endpoints, and because the IP addresses never change, failover does not wait for DNS caches to expire.\n\nClient affinity can keep a user on the same endpoint. Client IP preservation is available for ALB and EC2 endpoints. Custom routing accelerators map users to specific EC2 instances and ports, used for multiplayer game sessions. Choose CloudFront for cacheable HTTP content, and Global Accelerator for static IPs, non-HTTP protocols or fast Regional failover.",
        bullets: ["Two static anycast IPs, also usable with your own IPs", "TCP and UDP listeners", "Traffic dials per Region, weights per endpoint", "Failover without DNS TTL delays"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Latency vs geolocation vs geoproximity",
        columns: [
          { title: "Latency", points: ["Lowest measured network latency", "Best for performance", "Answers can shift over time", "One record per Region"] },
          { title: "Geolocation", points: ["User's continent, country or state", "Best for language or legal rules", "Needs a default record", "Most specific location wins"] },
          { title: "Geoproximity", points: ["Physical distance to resources", "Bias grows or shrinks an area", "Good for shifting load gradually", "Uses AWS Regions or coordinates"] },
        ],
      },
    ],
    examples: [
      {
        title: "Active-passive failover between Regions",
        explanation: "The main site runs behind an ALB in us-east-1, and a standby stack runs in eu-west-1. Step 1: create a health check on the primary's /health page. Step 2: create a PRIMARY failover alias record for app.example.com pointing at the us-east-1 ALB, with the health check and Evaluate Target Health on. Step 3: create a SECONDARY failover alias record pointing at the eu-west-1 ALB. Step 4: test by making /health return 500; within about a minute and a half, Route 53 answers with the secondary. The alias target's HostedZoneId is the load balancer's canonical hosted zone ID, shown by describe-load-balancers.",
        code: {
          lang: "bash",
          code: "aws route53 create-health-check --caller-reference app-primary-001 \\\n  --health-check-config Type=HTTPS,FullyQualifiedDomainName=primary.example.com,ResourcePath=/health,RequestInterval=30,FailureThreshold=3\n\naws route53 change-resource-record-sets --hosted-zone-id $ZONE \\\n  --change-batch '{\"Changes\":[{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\n    \"Name\":\"app.example.com\",\"Type\":\"A\",\n    \"SetIdentifier\":\"primary\",\"Failover\":\"PRIMARY\",\n    \"HealthCheckId\":\"'$HC_ID'\",\n    \"AliasTarget\":{\"HostedZoneId\":\"'$ALB_ZONE'\",\n      \"DNSName\":\"'$ALB_DNS'\",\"EvaluateTargetHealth\":true}}}]}'",
        },
      },
      {
        title: "CloudFront with a private S3 bucket and an API",
        explanation: "A single-page app keeps its files in S3 and its API behind an ALB. Step 1: create a distribution with two origins: the S3 bucket with an origin access control, and the ALB. Step 2: the default behavior points to S3 with the managed CachingOptimized policy. Step 3: a /api/* behavior points to the ALB with the managed CachingDisabled policy and all viewer headers forwarded. Step 4: keep Block Public Access on the bucket and add the bucket policy below, so only this distribution can read objects. Step 5: restrict the ALB security group to the CloudFront origin-facing prefix list.",
        code: {
          lang: "json",
          code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "cloudfront.amazonaws.com"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::site-assets/*",
    "Condition": {"StringEquals": {"AWS:SourceArn":
      "arn:aws:cloudfront::111122223333:distribution/EDFDVBD6EXAMPLE"}}
  }]
}`,
        },
      },
    ],
    cheatSheet: [
      "Use an alias record, not a CNAME, at the zone apex (example.com)",
      "Lower the TTL to 60 seconds or less on records that must fail over quickly",
      "Health checks: 30 s or 10 s interval; healthy if more than 18% of checkers agree",
      "Private resources: use CloudWatch alarm health checks",
      "Multivalue answer returns up to 8 healthy records",
      "CloudFront default TTL 24 h; first 1,000 invalidation paths per month are free",
      "Lock S3 origins with OAC; restrict ALB origins to the CloudFront prefix list",
      "Global Accelerator: 2 static anycast IPs, TCP and UDP, failover without DNS delays",
    ],
    quiz: [
      {
        q: "A website must show French content to users in France for legal reasons. Which policy fits?",
        options: ["Latency", "Geoproximity", "Geolocation", "Weighted"],
        answer: 2,
        why: "Geolocation answers based on the user's country, which matches location-based rules.",
      },
      {
        q: "Route 53 must fail over when a database in a private subnet becomes unhealthy. What kind of health check works?",
        options: ["A health check based on a CloudWatch alarm", "An HTTPS endpoint check on the private IP", "A TCP check on the private IP", "A calculated check with no children"],
        answer: 0,
        why: "Route 53 checkers cannot reach private IPs, so monitor with CloudWatch and check the alarm.",
      },
      {
        q: "After a CloudFront deployment, users still see old CSS files. What is the quickest fix?",
        options: ["Delete the distribution", "Lower the Route 53 TTL", "Turn on Origin Shield", "Create an invalidation for the changed paths"],
        answer: 3,
        why: "An invalidation removes cached copies so the next request fetches fresh files from the origin.",
      },
      {
        q: "A multiplayer game on UDP needs fixed IPs and fast failover between two Regions. What fits?",
        options: ["CloudFront with Lambda@Edge", "Global Accelerator", "Route 53 weighted routing", "An Application Load Balancer"],
        answer: 1,
        why: "Global Accelerator supports UDP, gives static IPs and fails over without waiting for DNS.",
      },
      {
        q: "An S3 origin behind CloudFront should not be readable directly. What is the recommended setup?",
        options: ["Make the bucket public and hide the URL", "Use a signed URL for every object", "Origin access control plus a bucket policy for the distribution", "A NACL on the bucket"],
        answer: 2,
        why: "OAC signs CloudFront's requests, and the bucket policy allows only that distribution.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look up the name servers of a Route 53 hosted zone and check that the domain's registrar uses the same ones.",
        hint: "get-hosted-zone shows the delegation set; dig shows what the internet sees.",
        solution: "aws route53 get-hosted-zone --id $ZONE \\\n  --query DelegationSet.NameServers --output text\ndig +short NS example.com\n# Both lists must match, or Route 53 records will not be used.",
      },
      {
        level: "medium",
        task: "Send 90 percent of traffic to v1.example.com's ALB and 10 percent to v2 using weighted records.",
        hint: "Two records with the same name and type, different SetIdentifier and Weight values.",
        solution: "# Record 1: Name app.example.com, Type A, alias to ALB v1,\n#   SetIdentifier \"v1\", Weight 90, EvaluateTargetHealth true\n# Record 2: Name app.example.com, Type A, alias to ALB v2,\n#   SetIdentifier \"v2\", Weight 10, EvaluateTargetHealth true\n# Route 53 answers v1 for about 90% of queries.\n# To roll back, set v2's weight to 0. To finish, set v1 to 0.",
      },
      {
        level: "hard",
        task: "Users far from us-east-1 complain about slow API calls that cannot be cached, and a partner firewall needs fixed IPs. Propose an edge design and explain why.",
        hint: "Separate cacheable content from dynamic API traffic and the fixed-IP requirement.",
        solution: "Static assets: CloudFront with an S3 origin, long TTLs, versioned files.\nAPI: Global Accelerator with two static anycast IPs for the partner allow list.\nListener TCP 443, endpoint groups in us-east-1 and eu-west-1 with ALBs.\nTraffic enters at the nearest edge and rides the AWS backbone, cutting latency.\nHealth checks move traffic to the healthy Region without DNS TTL waits.\nRoute 53 alias records point names at CloudFront and the accelerator.",
      },
    ],
    faq: [
      { q: "What is the difference between an alias record and a CNAME?", a: "A CNAME maps one name to another and cannot be used at the zone apex. An alias record points to AWS resources, works at the apex, and queries to AWS targets are free." },
      { q: "Does CloudFront help with dynamic content?", a: "Yes. Even uncached requests benefit from TLS ending near the user and from the AWS backbone to the origin, and short TTLs can cache popular API responses briefly." },
      { q: "Is Global Accelerator a replacement for CloudFront?", a: "No. CloudFront caches HTTP content at the edge. Global Accelerator does no caching; it gives static IPs and routes TCP or UDP traffic to the best Regional endpoint." },
      { q: "Why does my DNS change take a while to show up?", a: "Resolvers keep cached answers until the old TTL expires. Lower the TTL well before planned changes." },
    ],
  },
};

export default extra;
