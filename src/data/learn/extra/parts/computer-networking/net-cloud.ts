import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-cloud/datacenter-topologies": {
    plain: [
      "A data centre is a building full of servers, connected by switches. How those switches are wired together is called the topology. It decides how fast servers can talk, what happens when a switch dies, and how easily you can grow.",
      "The old design had three levels: access switches for servers, aggregation switches above them, and a core at the top. It was built when most traffic went from users outside to a server inside and back. That is called north-south traffic.",
      "Today most traffic stays inside the building. A single web request can trigger dozens of calls between services, databases and caches. This server-to-server traffic is called east-west. The old three-level design made it travel up and down long, uneven paths.",
      "The modern answer is leaf-spine. Every rack has a leaf switch, and every leaf connects to every spine switch. Any server reaches any other server in the same small number of hops, all links are used at once, and you grow by adding more leaves or spines.",
    ],
    deepDive: [
      {
        heading: "Why three-tier designs struggled",
        body: "In a three-tier network, access switches connect to two aggregation switches for redundancy, and those connect to the core. The access layer was usually layer 2, so VLANs stretched across many switches, and redundant links formed loops. Spanning Tree Protocol (STP) prevents loops by blocking links, which means half the bandwidth you paid for sits idle until something fails, and a failure can take seconds to recover.\n\nPaths are also uneven. Two servers on the same access switch are one hop apart, but two servers in different pods may cross access, aggregation, core, aggregation and access again. For east-west heavy apps, latency becomes unpredictable and the aggregation layer becomes a bottleneck. Scaling meant buying bigger, more expensive aggregation and core boxes (scaling up) rather than adding more small ones (scaling out).",
        bullets: ["STP blocks redundant links to avoid loops", "Uneven paths give unpredictable latency", "Growth means bigger, costlier boxes", "Large layer 2 domains spread broadcast storms"],
      },
      {
        heading: "Leaf-spine and ECMP",
        body: "In a leaf-spine (also called a Clos) fabric, each leaf, or top-of-rack switch, has one uplink to every spine, and spines do not connect to each other. Traffic from a server on leaf 1 to a server on leaf 7 always goes leaf, spine, leaf: three switches, whichever spine it uses. The links between leaves and spines are routed at layer 3, often with BGP, so there are no loops and no STP.\n\nWith four spines, each leaf has four equal-cost paths to every other leaf. ECMP (equal-cost multi-path) spreads traffic across them by hashing each flow's 5-tuple (source IP, destination IP, protocol, source port, destination port). All packets of one flow take the same path, so they stay in order, while different flows spread out. The weak spot is a few huge flows (elephant flows) landing on the same link; good hashing and many flows keep this rare. If a spine fails, ECMP simply uses the remaining ones, losing only a share of capacity.",
        visual: {
          type: "flow",
          title: "How ECMP picks a spine for one flow",
          steps: [
            { label: "Packet arrives at leaf", detail: "Destination is on another rack" },
            { label: "Route lookup", detail: "Four equal-cost next hops, one per spine" },
            { label: "Hash the 5-tuple", detail: "IPs, protocol and ports give a number" },
            { label: "Pick next hop", detail: "Hash modulo 4 chooses a spine" },
            { label: "Same flow, same path", detail: "Packets stay in order" },
          ],
        },
      },
      {
        heading: "Sizing a fabric: oversubscription",
        body: "Oversubscription compares the bandwidth servers can send into a leaf with the bandwidth the leaf has towards the spines. A leaf with 48 ports of 25 Gbps to servers offers 1200 Gbps downstream. With 6 uplinks of 100 Gbps it has 600 Gbps upstream, a ratio of 2:1. If every server sent at full speed to other racks at once, half would have to wait. In practice not all servers peak together, so 2:1 or 3:1 is common for general workloads, while storage and AI training clusters often aim for 1:1 (non-blocking).\n\nThe spine's port count limits the number of leaves, because each leaf needs one port on every spine. A spine with 64 ports supports up to 64 leaves. To go bigger, data centres add another tier of super-spines, forming a multi-stage Clos. The number of uplinks per leaf limits the number of spines.",
        bullets: ["Ratio = server-facing bandwidth / uplink bandwidth", "48 x 25G down and 6 x 100G up = 2:1", "Spine port count caps the number of leaves", "Leaf uplink count caps the number of spines"],
      },
      {
        heading: "Overlays: VXLAN and EVPN",
        body: "A routed fabric is great for the network, but some applications and virtual machines still expect to share a layer 2 segment across racks, and cloud tenants need isolated networks. Overlays solve this. VXLAN wraps the original Ethernet frame inside a UDP packet (destination port 4789) and sends it across the routed fabric. The switch or hypervisor that wraps and unwraps is a VTEP (VXLAN tunnel endpoint).\n\nEach virtual network gets a 24-bit VXLAN Network Identifier (VNI), allowing about 16 million segments instead of 4094 VLANs. The extra headers add 50 bytes (outer Ethernet 14, outer IP 20, UDP 8, VXLAN 8), so fabrics run a larger MTU, such as 9000 or 9216, so that 1500-byte guest frames fit. VTEPs must learn which MAC lives behind which VTEP; modern fabrics use BGP EVPN as the control plane to share that information instead of flooding.",
        visual: {
          type: "layers",
          title: "A VXLAN-encapsulated frame",
          layers: [
            { label: "Outer Ethernet", detail: "14 bytes, hop to the next fabric switch" },
            { label: "Outer IP", detail: "20 bytes, source VTEP to destination VTEP" },
            { label: "Outer UDP", detail: "8 bytes, destination port 4789" },
            { label: "VXLAN header", detail: "8 bytes, carries the 24-bit VNI" },
            { label: "Original Ethernet frame", detail: "The tenant's frame, unchanged" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A small leaf-spine fabric",
        root: "Fabric (every leaf links to every spine)",
        children: [
          { label: "Spine 1", children: ["Link to leaf 1", "Link to leaf 2", "Link to leaf 3", "Link to border leaf"] },
          { label: "Spine 2", children: ["Link to leaf 1", "Link to leaf 2", "Link to leaf 3", "Link to border leaf"] },
          { label: "Leaf 1 to 3 (top of rack)", children: ["Server racks", "Hosts dual-homed to two leaves"] },
          { label: "Border leaf", children: ["Firewalls and routers", "North-south exit to WAN and internet"] },
        ],
      },
    ],
    examples: [
      {
        title: "Sizing a fabric for 20 racks",
        explanation: "You need 20 racks of 40 servers, each with one 25 Gbps link, and want 2.5:1 or better. Step 1: per leaf, 40 x 25 = 1000 Gbps down. Step 2: with 4 uplinks of 100 Gbps, up is 400 Gbps, a ratio of 2.5:1. Step 3: 4 uplinks per leaf means 4 spines. Step 4: 20 leaves (plus 2 border leaves) need 22 ports on each spine, so a 32-port 100G spine leaves room to grow to 32 leaves. Step 5: for 1:1 later, add uplinks and spines; the design scales out without replacing boxes.",
      },
      {
        title: "One slow link in an ECMP fabric",
        explanation: "Some requests between two services are slow, others are fine. Step 1: since ECMP hashes each flow, a bad link affects only the flows that hash onto it, which explains the some-but-not-all pattern. Step 2: check interface error counters on every leaf uplink; one link to spine 3 shows rising CRC errors. Step 3: shut that link down; ECMP moves its flows to the other three spines within moments. Step 4: replace the optic or cable, then bring the link back.",
        code: {
          lang: "text",
          code: "leaf1# show interfaces counters errors\nleaf1# show ip route 10.0.7.0/24        ! expect 4 next hops\nleaf1(config)# interface Ethernet52\nleaf1(config-if)# shutdown\nleaf1# show ip route 10.0.7.0/24        ! now 3 next hops",
        },
      },
    ],
    cheatSheet: [
      "North-south: in and out of the data centre; east-west: server to server",
      "Leaf-spine: every leaf to every spine, spines not interconnected",
      "Any leaf to any leaf is leaf, spine, leaf: the same hop count every time",
      "ECMP hashes the 5-tuple so one flow keeps one path and stays in order",
      "Oversubscription = server bandwidth / uplink bandwidth, e.g. 2:1 or 3:1",
      "VXLAN: UDP 4789, 24-bit VNI (about 16 million segments), 50 bytes overhead",
      "Run jumbo MTU (9000+) in the fabric so overlays carry 1500-byte frames",
      "BGP EVPN is the common control plane for VXLAN fabrics",
    ],
    quiz: [
      {
        q: "Why does a three-tier design waste bandwidth on redundant links?",
        options: ["Spanning Tree blocks some links to prevent loops", "Fibre is slower than copper", "Core switches cannot use VLANs", "ECMP uses only one path"],
        answer: 0,
        why: "STP keeps a loop-free tree by putting redundant links in a blocking state.",
      },
      {
        q: "A leaf has 48 x 25 Gbps server ports and 4 x 100 Gbps uplinks. What is the oversubscription ratio?",
        options: ["1:1", "2:1", "4:1", "3:1"],
        answer: 3,
        why: "1200 Gbps down divided by 400 Gbps up gives 3:1.",
      },
      {
        q: "Why do all packets of a TCP flow follow the same ECMP path?",
        options: ["The spine chooses randomly once per day", "TCP requires a single physical cable", "The path is chosen from a hash of the flow's 5-tuple, which is the same for every packet", "ECMP only works for UDP"],
        answer: 2,
        why: "Hashing on fields that do not change within a flow keeps packets in order.",
      },
      {
        q: "How many network segments can VXLAN's identifier address?",
        options: ["4094", "About 16 million", "65535", "About 1 million"],
        answer: 1,
        why: "The VNI is 24 bits, giving 16,777,216 values.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Classify these flows as north-south or east-west: a user loading the homepage; the web tier querying the database; a backup job copying data between racks; an API call from a partner.",
        hint: "Does the traffic cross the data centre's edge?",
        solution: "User loading homepage: north-south\nWeb tier to database: east-west\nBackup between racks: east-west\nPartner API call: north-south",
      },
      {
        level: "medium",
        task: "Design a fabric for 30 racks with 32 servers each at 25 Gbps and a target ratio of 2:1. How many 100G uplinks per leaf and spines do you need, and how many ports per spine?",
        hint: "Work out down bandwidth per leaf first, then divide by 2.",
        solution: "Down per leaf: 32 x 25 = 800 Gbps\nUp needed at 2:1: 400 Gbps = 4 x 100G uplinks\nUplinks per leaf = number of spines = 4\nLeaves: 30 (+2 border leaves) = 32\nPorts per spine: at least 32 x 100G (choose 64 to grow)",
      },
      {
        level: "hard",
        task: "A VM in a VXLAN overlay can ping across racks with small packets, but large file copies hang. Explain the cause and give two fixes.",
        hint: "Count the encapsulation bytes against the underlay MTU.",
        solution: "Cause: VXLAN adds 50 bytes. A 1500-byte guest packet becomes\n1550 bytes, larger than a 1500-byte underlay MTU, so it is dropped.\nSmall pings fit, full-size TCP segments do not.\nFix 1: raise the underlay MTU to 9000/9216 (or at least 1550)\n  on every fabric link and VTEP.\nFix 2: lower the guest MTU to 1450 (or clamp TCP MSS)\n  so encapsulated packets fit in 1500.",
      },
    ],
    faq: [
      { q: "What is a Clos network?", a: "A multi-stage switching design described by Charles Clos in 1953 for telephone exchanges. Leaf-spine is a two-stage folded Clos, where every leaf connects to every spine." },
      { q: "Do I need leaf-spine for a small server room?", a: "Not usually. With one or two racks, a pair of switches is enough. Leaf-spine pays off when you have many racks and lots of server-to-server traffic." },
      { q: "Why is BGP used inside data centres?", a: "BGP scales to very large numbers of routes and devices, supports ECMP, and gives fine control over policy. Many operators run eBGP between leaves and spines." },
      { q: "What is the difference between VLAN and VXLAN?", a: "A VLAN tags frames on a layer 2 network and is limited to 4094 IDs. VXLAN carries layer 2 frames inside UDP across a layer 3 network and supports about 16 million IDs." },
    ],
  },

  "net-cloud/vpc": {
    plain: [
      "A VPC (virtual private cloud) is your own private network inside a cloud provider like AWS, Azure or Google Cloud. You choose its IP address range, cut it into smaller pieces called subnets, and decide which pieces can reach the internet. Nobody else's servers can see into it unless you allow it.",
      "Subnets live in availability zones (AZs), which are separate data centres in one region. You put copies of your servers in two or three AZs, so if one building has a power problem, the others keep running.",
      "Route tables decide where traffic goes. A public subnet has a route to an internet gateway, so servers there can have public IPs. A private subnet has no such route; its servers can only reach the internet outbound through a NAT gateway, and the internet cannot start connections to them.",
      "Two kinds of firewalls protect a VPC. Security groups wrap each server and remember connections. Network ACLs guard whole subnets and check each packet alone. Most teams rely mainly on security groups and keep NACLs simple.",
    ],
    deepDive: [
      {
        heading: "Choosing the CIDR block",
        body: "The VPC's CIDR block is hard to change later, so plan it first. In AWS, an IPv4 VPC block must be between /16 (65,536 addresses) and /28 (16 addresses), and you can add secondary blocks later. Use private RFC 1918 ranges: 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16.\n\nThe golden rule is no overlap. If two VPCs, or a VPC and your office, use the same range, you cannot route between them with peering or VPN. A simple plan gives each environment and region its own block, for example 10.10.0.0/16 for production in one region, 10.20.0.0/16 for staging, 10.30.0.0/16 for another region, and keeps the office on 10.100.0.0/16. Inside the VPC, AWS reserves 5 addresses in every subnet: the network address, the first three after it (VPC router, DNS, and one reserved for future use) and the last address. So a /24 subnet gives 251 usable IPs.",
        bullets: ["AWS IPv4 VPC size: /16 to /28", "5 reserved addresses per subnet: .0, .1, .2, .3 and the last", "Never overlap with other VPCs or on-premises networks", "Leave unused space for future subnets"],
      },
      {
        heading: "Public subnets, private subnets and gateways",
        body: "Subnets are not public or private by a setting; their route table decides. A route 0.0.0.0/0 to an internet gateway (IGW) makes a subnet public. The IGW is attached to the VPC, scales automatically and performs one-to-one NAT between an instance's private IP and its public or Elastic IP. An instance in a public subnet still needs a public IP to be reachable.\n\nPrivate subnets send 0.0.0.0/0 to a NAT gateway instead. The NAT gateway sits in a public subnet with an Elastic IP and translates many private addresses to that one public address, allowing outbound connections only. It belongs to one AZ, so for resilience you create one per AZ and point each private route table at the NAT gateway in its own AZ. NAT gateways are charged per hour and per GB processed, so heavy traffic to AWS services is better sent through VPC endpoints: gateway endpoints for S3 and DynamoDB are free and are added as routes.",
        visual: {
          type: "flow",
          title: "A private instance downloading an update",
          steps: [
            { label: "Private instance", detail: "10.0.10.25 in a private app subnet" },
            { label: "Route table", detail: "0.0.0.0/0 goes to the NAT gateway" },
            { label: "NAT gateway", detail: "In a public subnet, swaps source to its Elastic IP" },
            { label: "Public route table", detail: "0.0.0.0/0 goes to the internet gateway" },
            { label: "Internet", detail: "Reply returns the same way; inbound starts are impossible" },
          ],
        },
      },
      {
        heading: "Security groups versus network ACLs",
        body: "A security group is a stateful firewall attached to a network interface. It has only allow rules; anything not allowed is denied. Because it is stateful, a reply to an allowed request always gets back in. A rule's source can be another security group, which is very powerful: \"allow 5432 from the app-servers group\" keeps working as app servers come and go, with no IP addresses in the rule.\n\nA network ACL is stateless and applies to a whole subnet. It has numbered allow and deny rules, checked from the lowest number up, and the first match wins. Because it is stateless, you must allow return traffic yourself, usually the ephemeral ports 1024 to 65535 in the other direction. The default NACL allows everything; a custom NACL denies everything until you add rules. Use security groups for nearly all filtering, and NACLs for broad subnet-wide blocks, such as denying a known bad range.",
        visual: {
          type: "compare",
          title: "Security group versus network ACL",
          columns: [
            { title: "Security group", points: ["Attached to an interface", "Stateful: replies allowed", "Allow rules only", "Can reference other groups", "All rules evaluated together"] },
            { title: "Network ACL", points: ["Attached to a subnet", "Stateless: allow returns yourself", "Allow and deny rules", "Rules by number, first match wins", "Custom NACL denies all at first"] },
          ],
        },
      },
      {
        heading: "Connecting VPCs: peering and transit",
        body: "VPC peering joins two VPCs, in the same or different accounts and regions, so they route to each other with private IPs. You create the peering connection, the other side accepts it, and then both sides add routes for the other CIDR pointing at the peering connection, plus security group rules. Peering is not transitive: if A peers with B and B peers with C, A still cannot reach C through B. With many VPCs, a full mesh of peerings grows quickly (n x (n-1) / 2 links for n VPCs).\n\nA transit gateway is a regional hub instead: each VPC, VPN and Direct Connect link attaches once, and the transit gateway's route tables decide who can reach whom. It costs per attachment and per GB, but it is much easier to run at scale. For exposing one service to many VPCs without full network access, PrivateLink (interface endpoints) publishes just that service behind a private IP in the consumer's VPC.",
        bullets: ["Peering: no overlapping CIDRs, no transitive routing", "Add routes on both sides after accepting a peering", "Transit gateway: hub for many VPCs and VPNs", "PrivateLink: share one service, not the whole network"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Route tables in a two-AZ VPC (10.0.0.0/16)",
        root: "VPC route tables",
        children: [
          { label: "Public RT", children: ["10.0.0.0/16 local", "0.0.0.0/0 to igw", "Used by both public subnets"] },
          { label: "Private RT, AZ a", children: ["10.0.0.0/16 local", "0.0.0.0/0 to NAT gateway in AZ a", "S3 prefix list to gateway endpoint"] },
          { label: "Private RT, AZ b", children: ["10.0.0.0/16 local", "0.0.0.0/0 to NAT gateway in AZ b"] },
          { label: "Data RT", children: ["10.0.0.0/16 local only", "No route to the internet"] },
        ],
      },
    ],
    examples: [
      {
        title: "Adding a NAT gateway for private subnets",
        explanation: "App servers in private subnets cannot install packages. Step 1: allocate an Elastic IP. Step 2: create the NAT gateway in a public subnet of the same AZ. Step 3: wait for it to become available. Step 4: add a default route to the private route table pointing at the NAT gateway. Step 5: from an app server, curl an external site to test. Repeat per AZ for resilience.",
        code: {
          lang: "bash",
          code: "EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)\nNAT=$(aws ec2 create-nat-gateway --subnet-id subnet-pub-a \\\n  --allocation-id \"$EIP\" --query NatGateway.NatGatewayId --output text)\naws ec2 wait nat-gateway-available --nat-gateway-ids \"$NAT\"\naws ec2 create-route --route-table-id rtb-priv-a \\\n  --destination-cidr-block 0.0.0.0/0 --nat-gateway-id \"$NAT\"",
        },
      },
      {
        title: "Letting only the app tier reach the database",
        explanation: "The database must accept PostgreSQL only from app servers. Step 1: create a security group for the database. Step 2: add an inbound rule for TCP 5432 whose source is the app servers' security group, not an IP range. Step 3: attach it to the database. Step 4: any new app server with the app security group can connect at once, while a bastion host or a web server without it is refused. No outbound or return rule is needed, because security groups are stateful.",
        code: {
          lang: "bash",
          code: "DB_SG=$(aws ec2 create-security-group --group-name db-sg \\\n  --description \"Postgres from app tier\" --vpc-id vpc-123 \\\n  --query GroupId --output text)\naws ec2 authorize-security-group-ingress --group-id \"$DB_SG\" \\\n  --protocol tcp --port 5432 --source-group sg-app123",
        },
      },
    ],
    cheatSheet: [
      "A subnet is public only if its route table sends 0.0.0.0/0 to an internet gateway",
      "AWS reserves 5 IPs per subnet, so a /24 gives 251 usable addresses",
      "One subnet lives in exactly one availability zone; a VPC spans the region",
      "NAT gateway: outbound only, lives in a public subnet, one per AZ for resilience",
      "Security groups: stateful, allow-only, can reference other security groups",
      "NACLs: stateless, numbered allow and deny, remember ephemeral return ports",
      "Peering is not transitive and needs non-overlapping CIDRs",
      "S3 and DynamoDB gateway endpoints are free and avoid NAT data charges",
    ],
    quiz: [
      {
        q: "What makes a subnet public in AWS?",
        options: ["Its route table has 0.0.0.0/0 pointing to an internet gateway", "It has more than 256 addresses", "It contains a NAT gateway", "It has a public name tag"],
        answer: 0,
        why: "Being public is purely a routing property.",
      },
      {
        q: "How many usable IP addresses does an AWS /26 subnet provide?",
        options: ["64", "62", "59", "56"],
        answer: 2,
        why: "A /26 has 64 addresses, and AWS reserves 5, leaving 59.",
      },
      {
        q: "VPC A peers with B, and B peers with C. Can A reach C through B?",
        options: ["Yes, automatically", "Yes, if B has a NAT gateway", "Only for IPv6", "No, peering is not transitive"],
        answer: 3,
        why: "Each pair that needs to talk requires its own peering, or use a transit gateway.",
      },
      {
        q: "You add an inbound NACL rule for TCP 443 but clients still time out. Security groups allow 443. What is likely missing?",
        options: ["An outbound NACL rule for return traffic to ephemeral ports", "A second internet gateway", "An Elastic IP on the NACL", "A peering connection"],
        answer: 0,
        why: "NACLs are stateless, so replies to the client's high ports must be allowed outbound.",
      },
      {
        q: "Why should each AZ have its own NAT gateway?",
        options: ["AWS requires exactly one per subnet", "NAT gateways are zonal, so a failure in one AZ would cut off the others", "It doubles internet speed", "Security groups need it"],
        answer: 1,
        why: "A NAT gateway lives in one AZ; per-AZ gateways avoid a single-zone dependency and cross-AZ charges.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Split 10.0.0.0/16 into six /24 subnets for public, app and data tiers across two AZs, and say how many usable IPs each has in AWS.",
        hint: "Use a clear pattern, such as the third octet showing tier and AZ.",
        solution: "public-a 10.0.0.0/24    public-b 10.0.1.0/24\napp-a    10.0.10.0/24   app-b    10.0.11.0/24\ndata-a   10.0.20.0/24   data-b   10.0.21.0/24\nEach /24: 256 - 5 reserved = 251 usable IPs.",
      },
      {
        level: "medium",
        task: "Write the AWS CLI commands to create a VPC, one public subnet, an internet gateway and a public route table, and associate the table with the subnet.",
        hint: "create-vpc, create-subnet, create-internet-gateway, attach, create-route-table, create-route, associate-route-table.",
        solution: "VPC=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)\nSUB=$(aws ec2 create-subnet --vpc-id $VPC --cidr-block 10.0.0.0/24 --availability-zone us-east-1a --query Subnet.SubnetId --output text)\nIGW=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)\naws ec2 attach-internet-gateway --vpc-id $VPC --internet-gateway-id $IGW\nRT=$(aws ec2 create-route-table --vpc-id $VPC --query RouteTable.RouteTableId --output text)\naws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW\naws ec2 associate-route-table --route-table-id $RT --subnet-id $SUB",
      },
      {
        level: "hard",
        task: "Your company has an office on 10.0.0.0/16 and three VPCs that all use 10.0.0.0/16. You must connect everything. Propose a new addressing plan and a connection design.",
        hint: "Overlaps must go first; then choose peering or a transit gateway.",
        solution: "1. Re-address: office stays 10.0.0.0/16;\n   prod 10.10.0.0/16, staging 10.20.0.0/16, dev 10.30.0.0/16\n   (migrate by adding new VPCs or secondary CIDRs and moving workloads).\n2. Create a transit gateway; attach the three VPCs and a\n   site-to-site VPN (or Direct Connect) to the office.\n3. TGW route tables: office reaches all VPCs; dev cannot reach prod.\n4. Add routes in each VPC: 10.0.0.0/16 and needed VPC ranges to the TGW.\n5. Open security groups only for the required ports.",
      },
    ],
    faq: [
      { q: "Is a VPC free?", a: "In AWS, creating a VPC, subnets, route tables and security groups is free. You pay for things like NAT gateways, public IPv4 addresses, VPN connections, transit gateways and data transfer." },
      { q: "What is the difference between a NAT gateway and an internet gateway?", a: "An internet gateway gives instances with public IPs two-way internet access. A NAT gateway lets instances with only private IPs start outbound connections while blocking inbound ones." },
      { q: "Should I use security groups or network ACLs?", a: "Use security groups for almost all rules because they are stateful and can reference each other. Add NACLs only for coarse subnet-wide blocks." },
      { q: "What is the default VPC?", a: "AWS creates one default VPC per region with a /16 block and a public subnet in each AZ, so you can launch instances quickly. For real workloads, most teams build their own VPC with a planned layout." },
    ],
  },

  "net-cloud/load-balancers": {
    plain: [
      "One server can only handle so many users. A load balancer sits in front of a group of servers and shares incoming requests between them. Users see one address; behind it, two, ten or a hundred servers do the work.",
      "It also makes the service more reliable. The load balancer keeps checking each server with health checks. If a server stops answering, it is taken out of the rotation, and users keep being served by the others, often without noticing.",
      "Load balancers work at different layers. A layer 4 balancer only looks at IP addresses and ports and forwards the connection. A layer 7 balancer understands HTTP, so it can send /api requests to one group of servers and /images to another.",
      "Many load balancers also handle HTTPS for you. They decrypt the traffic (TLS termination), so certificates live in one place, and they can keep a user on the same server if the app needs it (sticky sessions).",
    ],
    deepDive: [
      {
        heading: "Layer 4 versus layer 7 in detail",
        body: "A layer 4 balancer picks a backend when a TCP connection or UDP flow starts and then moves packets without reading them. Some designs (like AWS NLB) pass the client's IP through; others open a second connection to the backend, so the server sees the balancer's IP unless the PROXY protocol is used to pass the original address. Layer 4 is fast, handles any protocol (databases, game servers, MQTT) and can pass TLS through untouched.\n\nA layer 7 balancer is a reverse proxy: it ends the client's connection, reads the HTTP request, then opens or reuses its own connection to a chosen backend. It can route by host name, path, header or method, rewrite URLs, add headers like X-Forwarded-For (the client IP) and X-Forwarded-Proto, retry failed requests, compress responses and speak HTTP/2 to clients while using HTTP/1.1 to servers. The cost is more CPU per request and the need to hold TLS keys.",
        visual: {
          type: "sequence",
          title: "A layer 7 balancer is a proxy with two connections",
          actors: ["Client", "Load balancer", "Backend"],
          messages: [
            { from: 0, to: 1, label: "TCP and TLS handshake with the balancer" },
            { from: 0, to: 1, label: "GET /api/orders, Host: shop.example.com" },
            { from: 1, to: 2, label: "Pick backend by path; add X-Forwarded-For" },
            { from: 2, to: 1, label: "200 OK with JSON" },
            { from: 1, to: 0, label: "Response sent back over the client's TLS" },
          ],
        },
      },
      {
        heading: "Choosing a balancing algorithm",
        body: "Round robin sends each new request or connection to the next server in turn. It is simple and fair when requests are similar and servers are equal. Weighted round robin gives bigger servers a larger share. Least connections sends new work to the server with the fewest active connections, which is better when request times vary a lot or connections are long-lived, such as WebSockets.\n\nHash-based methods send the same key to the same server: source IP hash, or a hash of a URL or header. Consistent hashing keeps most keys on the same server when one is added or removed, which matters for caches. Some balancers also offer least response time or \"power of two random choices\", which picks two servers at random and uses the less busy one, giving good results with little coordination. Whatever you choose, a slow-starting new server should not be hit with a full share at once; many balancers ramp traffic up gradually.",
        bullets: ["Round robin: equal servers, similar requests", "Least connections: uneven or long requests", "Hash or consistent hash: cache locality, affinity", "Weights: servers of different sizes"],
      },
      {
        heading: "Health checks that tell the truth",
        body: "A health check is a probe the balancer sends to each backend on a schedule. Key settings are the interval (how often), the timeout (how long to wait), the unhealthy threshold (how many failures in a row remove a server) and the healthy threshold (how many successes bring it back). A TCP check only proves the port is open. An HTTP check, such as GET /healthz expecting 200, proves the app answers.\n\nDesign the endpoint carefully. It should check what this instance needs to serve traffic, for example that it can reach its database, but it should not fail because a shared dependency is down, or every server fails at once and the balancer has nothing left. Keep it fast and cheap. Passive checks complement active ones: open-source nginx marks a server as failed after max_fails real request errors within fail_timeout. When removing a server for a deploy, use connection draining (AWS calls it deregistration delay) so in-flight requests finish first.",
        visual: {
          type: "cycle",
          title: "A backend's health check states",
          steps: [
            { label: "Healthy", detail: "Receives traffic; probes keep running" },
            { label: "Failing", detail: "Probes fail but not yet enough in a row" },
            { label: "Unhealthy", detail: "Unhealthy threshold reached: no new traffic" },
            { label: "Recovering", detail: "Probes succeed; count towards healthy threshold" },
          ],
        },
      },
      {
        heading: "TLS termination and sticky sessions",
        body: "With TLS termination, the balancer holds the certificate and decrypts traffic, so it can read HTTP and route it, and backends are spared the crypto work. Traffic from the balancer to the backend is then plain HTTP, which is acceptable only on a trusted private network; for compliance or zero-trust designs, use re-encryption (the balancer opens a new TLS connection to the backend). TLS passthrough leaves encryption end to end, but then only layer 4 decisions are possible.\n\nSticky sessions (session affinity) keep a client on the same backend, usually with a cookie the balancer sets, or by hashing the client IP. They help apps that store session data in server memory. The downsides: uneven load, lost sessions when that server dies, and slower scale-in. The better long-term fix is to make servers stateless and keep sessions in a shared store like Redis or a database, so any server can handle any request.",
        bullets: ["Termination: certificates in one place, plain HTTP behind", "Re-encryption: TLS on both legs", "Passthrough: end-to-end TLS, layer 4 only", "Prefer stateless apps over sticky sessions"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to handle TLS at the balancer",
        columns: [
          { title: "Termination", points: ["Balancer decrypts", "HTTP routing possible", "Backend gets plain HTTP", "Certs managed in one place"] },
          { title: "Re-encryption", points: ["Balancer decrypts and re-encrypts", "HTTP routing possible", "Encrypted on both legs", "Backends need certificates too"] },
          { title: "Passthrough", points: ["Balancer never decrypts", "Layer 4 routing only", "End-to-end encryption", "Can route by SNI at most"] },
        ],
      },
    ],
    examples: [
      {
        title: "HAProxy with health checks and least connections",
        explanation: "Two app servers must share HTTPS traffic for shop.example.com. Step 1: terminate TLS on the frontend with a combined certificate and key file. Step 2: in the backend, use leastconn and an HTTP health check on /healthz that expects 200. Step 3: check every 5 seconds; 3 failures remove a server, 2 successes bring it back. Step 4: validate with haproxy -c -f /etc/haproxy/haproxy.cfg before reloading.",
        code: {
          lang: "text",
          code: "frontend web\n    mode http\n    bind :443 ssl crt /etc/haproxy/certs/shop.pem\n    default_backend app\n\nbackend app\n    mode http\n    balance leastconn\n    option httpchk\n    http-check send meth GET uri /healthz\n    http-check expect status 200\n    option forwardfor\n    server app1 10.0.10.11:8080 check inter 5s fall 3 rise 2\n    server app2 10.0.10.12:8080 check inter 5s fall 3 rise 2",
        },
      },
      {
        title: "Users logged out at random",
        explanation: "After adding a third server, users are sometimes logged out. Step 1: the app stores sessions in memory on each server. Step 2: with round robin, a user's next request often lands on a server that has never seen the session. Step 3: short-term fix, enable cookie-based stickiness on the balancer so each user stays on one server. Step 4: long-term fix, move sessions to Redis so every server can read them, then remove stickiness so load spreads evenly and servers can be replaced freely.",
        code: {
          lang: "text",
          code: "# HAProxy short-term fix: cookie-based stickiness\nbackend app\n    mode http\n    balance roundrobin\n    cookie SRV insert indirect nocache\n    server app1 10.0.10.11:8080 check cookie a1\n    server app2 10.0.10.12:8080 check cookie a2\n    server app3 10.0.10.13:8080 check cookie a3",
        },
      },
    ],
    cheatSheet: [
      "Layer 4: IPs and ports, any protocol, can pass TLS through",
      "Layer 7: HTTP-aware routing by host, path or header; terminates TLS",
      "Round robin for equal requests; least connections for uneven or long ones",
      "Health check settings: interval, timeout, unhealthy and healthy thresholds",
      "Backends see the client IP via X-Forwarded-For (L7) or PROXY protocol (L4)",
      "Use connection draining before removing a server during deploys",
      "haproxy -c -f /etc/haproxy/haproxy.cfg and nginx -t check config before reload",
      "Sticky sessions are a workaround; shared session storage is the real fix",
    ],
    quiz: [
      {
        q: "Which balancer can send /api to one server pool and /static to another?",
        options: ["A layer 7 balancer", "A layer 4 balancer", "A DNS round robin record", "A NAT gateway"],
        answer: 0,
        why: "Only a balancer that reads HTTP can see the request path.",
      },
      {
        q: "Requests vary from 10 ms to 30 s. Which algorithm spreads load best?",
        options: ["Round robin", "Source IP hash", "Least connections", "Random with fixed weights"],
        answer: 2,
        why: "Least connections avoids piling new work onto servers still busy with long requests.",
      },
      {
        q: "Your health check calls the shared database. The database goes down briefly. What happens?",
        options: ["Only one server is removed", "Nothing, health checks ignore databases", "The balancer restarts the database", "Every backend fails the check at once and the balancer may have no healthy servers"],
        answer: 3,
        why: "Checking a shared dependency makes all instances fail together, turning a small problem into a full outage.",
      },
      {
        q: "Behind a layer 7 balancer, the app logs show only the balancer's IP. How does it find the client IP?",
        options: ["From the TTL", "From the X-Forwarded-For header", "From the TCP sequence number", "It cannot be known"],
        answer: 1,
        why: "Layer 7 proxies add the client address in X-Forwarded-For (or the Forwarded header).",
      },
      {
        q: "Which TLS mode keeps traffic encrypted end to end but limits routing to layer 4?",
        options: ["Termination", "Re-encryption", "Passthrough", "Offloading"],
        answer: 2,
        why: "In passthrough the balancer never decrypts, so it cannot read HTTP.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Configure nginx as a round robin balancer for two backends on port 8080 and pass the client IP to them.",
        hint: "Use an upstream block, proxy_pass and proxy_set_header.",
        solution: "upstream app {\n    server 10.0.10.11:8080;\n    server 10.0.10.12:8080;\n}\nserver {\n    listen 80;\n    location / {\n        proxy_pass http://app;\n        proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    }\n}",
      },
      {
        level: "medium",
        task: "Write a /healthz endpoint in Python (Flask) that returns 200 only if this instance can reach its own local cache, and 503 otherwise, answering within 1 second.",
        hint: "Use a short timeout and do not call shared dependencies that would fail every instance at once.",
        solution: "from flask import Flask\nimport socket\napp = Flask(__name__)\n\n@app.get(\"/healthz\")\ndef healthz():\n    try:\n        with socket.create_connection((\"127.0.0.1\", 6379), timeout=0.5):\n            return \"ok\", 200\n    except OSError:\n        return \"cache unreachable\", 503",
      },
      {
        level: "hard",
        task: "Plan a zero-downtime deploy for three servers behind a load balancer. List the steps for each server, including draining and health checks.",
        hint: "Take one server out at a time and wait for both draining and the healthy threshold.",
        solution: "For each server in turn:\n1. Mark it draining (or deregister): no new requests.\n2. Wait for in-flight requests to finish (deregistration delay).\n3. Deploy the new version and start it.\n4. Run a local smoke test: curl -f http://127.0.0.1:8080/healthz\n5. Re-register; wait until it passes the healthy threshold.\n6. Watch error rate and latency for a few minutes.\n7. Move to the next server; stop and roll back on errors.\nKeep at least 2 servers healthy at every moment.",
      },
    ],
    faq: [
      { q: "What is the difference between ALB and NLB in AWS?", a: "An Application Load Balancer works at layer 7 and routes HTTP and HTTPS by host, path and headers. A Network Load Balancer works at layer 4 for TCP, UDP and TLS, with very high throughput and static IPs per AZ." },
      { q: "Is a reverse proxy the same as a load balancer?", a: "A reverse proxy forwards client requests to backend servers; when it spreads them across several servers it is acting as a layer 7 load balancer. nginx and HAProxy do both." },
      { q: "Is DNS round robin a load balancer?", a: "It spreads clients across several IPs, but it has no health checks, and clients and resolvers cache answers. It is often used in front of real load balancers, not instead of them." },
      { q: "Can a load balancer be a single point of failure?", a: "Yes, if there is only one. Cloud load balancers run redundantly across zones, and self-hosted ones are usually deployed in pairs with a shared virtual IP using VRRP, for example with keepalived." },
    ],
  },

  "net-cloud/cdn": {
    plain: [
      "A CDN (content delivery network) is a large set of servers spread around the world. It keeps copies of your website's files close to your users. A visitor in Tokyo gets images from a server in Tokyo instead of from your one server in Frankfurt, so pages load much faster.",
      "These copies are called the cache. The first visitor in a city causes a cache miss: the CDN fetches the file from your server (the origin) and keeps it. Later visitors get a cache hit: the file comes straight from the nearby CDN server, called an edge.",
      "How long the CDN keeps a file is mostly up to you. Your server sends a Cache-Control header with each file, for example \"keep this for one day\". Get these headers right and most requests never reach your origin at all.",
      "Many CDNs also use anycast: the same IP address is announced from every location, and the internet's routing sends each user to a nearby one. This spreads traffic out naturally, which also helps the CDN absorb huge attacks.",
    ],
    deepDive: [
      {
        heading: "Edge caching and the cache key",
        body: "When a request arrives at an edge, the CDN builds a cache key and looks it up. By default the key is usually the scheme, host, path and query string. Two URLs that differ only in their query string, such as ?utm_source=mail, are then two separate cache entries, which lowers the hit ratio, so CDNs let you ignore or sort query parameters in the key.\n\nThe Vary response header adds request headers to the key. Vary: Accept-Encoding is normal and keeps gzip and Brotli versions apart. Vary: User-Agent or Vary: Cookie can create thousands of variants and make caching almost useless. Large CDNs also use tiered caching or an origin shield: edges that miss ask a regional mid-tier cache first, so your origin sees one request per region instead of one per edge. Check what happened with response headers such as Age (seconds the object has been cached) and the CDN's own status header, for example cf-cache-status on Cloudflare or X-Cache on several others.",
        visual: {
          type: "flow",
          title: "A cache miss with an origin shield",
          steps: [
            { label: "Edge lookup", detail: "Build the cache key; not found: MISS" },
            { label: "Shield lookup", detail: "Regional tier checks its cache" },
            { label: "Origin fetch", detail: "Only if the shield misses too" },
            { label: "Store", detail: "Shield and edge keep it per Cache-Control" },
            { label: "Next user nearby", detail: "Served from the edge: HIT, Age grows" },
          ],
        },
      },
      {
        heading: "Reading Cache-Control",
        body: "Cache-Control is the main header that tells caches what to do. max-age=N means the response is fresh for N seconds. s-maxage=N applies only to shared caches such as CDNs and overrides max-age there, so you can let the CDN keep a page for an hour while browsers keep it for one minute. public allows shared caches to store it; private means only the user's browser may store it, which is right for personal pages.\n\nno-cache does not mean \"do not cache\": it means \"store, but check with the origin before every use\". That check is a conditional request with If-None-Match (using the ETag) or If-Modified-Since, and an unchanged file returns a small 304 Not Modified. no-store means do not store at all, for sensitive data. stale-while-revalidate=N lets a cache serve a slightly old copy while it fetches a fresh one in the background. For files with a version or hash in the name, like app.3f9a1c.js, use max-age=31536000, immutable so they are cached for a year and never rechecked.",
        bullets: ["max-age: freshness for all caches", "s-maxage: freshness for CDNs only", "no-cache: revalidate before use", "no-store: never store", "immutable: never revalidate while fresh"],
      },
      {
        heading: "How anycast routing works",
        body: "With normal unicast, one IP address belongs to one place. With anycast, the CDN announces the same IP prefix through BGP from every one of its locations. Each network on the internet picks its best BGP path to that prefix, usually the one with the shortest AS path or the cheapest peering, and so users end up at a nearby location, though not always the closest in kilometres.\n\nAnycast fits DNS perfectly, because most DNS queries are a single UDP packet and answer. For TCP, it works because routes change rarely, so a connection's packets keep reaching the same location; when a route does change mid-connection, the new location does not know the connection and resets it, so CDNs engineer routes to stay stable. If one location fails, it stops announcing the prefix and traffic flows to the next-best location within the time BGP takes to converge, which is a simple, automatic failover.",
        visual: {
          type: "sequence",
          title: "Anycast sends each user to a nearby site",
          actors: ["User in Paris", "Paris edge", "Tokyo edge", "User in Osaka"],
          messages: [
            { from: 1, to: 0, label: "Paris announces 198.51.100.0/24 by BGP" },
            { from: 2, to: 3, label: "Tokyo announces the same prefix" },
            { from: 0, to: 1, label: "Paris user connects to 198.51.100.7" },
            { from: 3, to: 2, label: "Osaka user connects to 198.51.100.7" },
            { from: 2, to: 3, label: "Each served by its nearest edge" },
          ],
        },
      },
      {
        heading: "Absorbing attacks and updating content",
        body: "Because anycast spreads traffic across all locations, a DDoS attack from bots worldwide is split into many smaller pieces, each handled by local capacity. Large CDNs have total network capacity in the hundreds of terabits per second, far more than any single origin. Edges also drop malformed packets and SYN floods, apply rate limits and web application firewall rules, and the origin's real IP stays hidden. Make sure the origin firewall accepts traffic only from the CDN's IP ranges, otherwise attackers can bypass it.\n\nUpdating cached content has two approaches. Purging tells the CDN to drop an object (or everything with a tag) so the next request fetches it fresh; it is fast on modern CDNs but is an extra step that can be forgotten. Versioned URLs change the file name whenever the content changes, so old and new never conflict and nothing needs purging. The usual pattern: short caching or no-cache for HTML, versioned names with long max-age for CSS, JS and images.",
        bullets: ["Restrict the origin to CDN IP ranges", "Purge by URL or by cache tag when needed", "Versioned asset names avoid purges entirely", "Short TTL for HTML, long TTL for hashed assets"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Caching rules by type of content",
        root: "What should the CDN do?",
        children: [
          { label: "Hashed assets (app.3f9a.js)", children: ["max-age=31536000, immutable", "Never purge, just change the name"] },
          { label: "HTML pages", children: ["s-maxage=60 or no-cache", "Revalidate with ETag"] },
          { label: "Public API responses", children: ["s-maxage=30, stale-while-revalidate=60", "Key on the query string"] },
          { label: "Personal pages", children: ["private, no-store at the CDN", "Contains user data"] },
          { label: "Login and payment", children: ["no-store", "Bypass cache entirely"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why is the hit ratio only 20 percent?",
        explanation: "A news site behind a CDN still loads its origin heavily. Step 1: check headers on an article; it returns Cache-Control: private, so the CDN never stores it. Step 2: change the origin to send public, s-maxage=120 for articles. Step 3: the hit ratio rises but stays low; logs show many URLs with ?utm_ and ?fbclid parameters, each a different cache key. Step 4: configure the CDN to ignore those parameters in the cache key. The hit ratio climbs above 90 percent.",
        code: {
          lang: "bash",
          code: "curl -sI https://news.example.com/story/42 | grep -iE 'cache-control|age|cache-status|x-cache'\n# Before: cache-control: private\n# After:  cache-control: public, s-maxage=120, max-age=30\n#         age: 47\n#         x-cache: HIT",
        },
      },
      {
        title: "Shipping a new CSS file without stale pages",
        explanation: "After a deploy, some users see the new HTML with the old CSS, so the layout breaks. Step 1: the CSS is called style.css with max-age=86400, so edges and browsers keep the old file for a day. Step 2: change the build to name files by content hash, such as style.8c1e2a.css, and reference that name in the HTML. Step 3: serve hashed files with max-age=31536000, immutable and HTML with no-cache. Step 4: each deploy now produces new names, and the HTML, revalidated on every visit, always points to the matching CSS.",
        code: {
          lang: "text",
          code: "# nginx at the origin\nlocation ~* \\.[0-9a-f]{6,}\\.(css|js|png|svg|woff2)$ {\n    add_header Cache-Control \"public, max-age=31536000, immutable\";\n}\nlocation / {\n    add_header Cache-Control \"no-cache\";\n}",
        },
      },
    ],
    cheatSheet: [
      "Cache key: usually scheme + host + path + query; strip tracking parameters",
      "s-maxage controls CDN caching; max-age controls browsers (and CDNs if no s-maxage)",
      "no-cache = store but revalidate; no-store = never store",
      "Hashed file names + max-age=31536000, immutable: cache forever, no purges",
      "Age header shows how long the object has been in the cache",
      "Vary: Accept-Encoding is fine; Vary: Cookie or User-Agent kills hit ratio",
      "Anycast: same prefix announced by BGP from every site; nearest by routing wins",
      "Lock the origin firewall to CDN IP ranges so attackers cannot bypass the CDN",
    ],
    quiz: [
      {
        q: "A response has Cache-Control: public, max-age=60, s-maxage=3600. How long may a CDN cache it?",
        options: ["60 seconds", "Not at all", "Forever", "3600 seconds"],
        answer: 3,
        why: "s-maxage applies to shared caches like CDNs and overrides max-age there.",
      },
      {
        q: "What does Cache-Control: no-cache mean?",
        options: ["The response may be stored but must be revalidated before each use", "The response must never be stored", "Only browsers may cache it", "Cache it for one hour"],
        answer: 0,
        why: "no-cache forces revalidation; no-store is the directive that forbids storing.",
      },
      {
        q: "How does anycast send a user to a nearby CDN location?",
        options: ["The browser measures latency to every site", "DNS always returns a different IP per country", "Every site announces the same prefix with BGP and the network picks its best path", "The origin redirects users"],
        answer: 2,
        why: "Routing chooses the best BGP path to the shared prefix, which is usually a nearby site.",
      },
      {
        q: "Which change most improves the hit ratio when URLs carry many tracking parameters?",
        options: ["Adding Vary: User-Agent", "Excluding those parameters from the cache key", "Setting no-store", "Lowering max-age"],
        answer: 1,
        why: "Each unique query string is a separate cache entry unless the key ignores it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use curl to check whether a page on a CDN-backed site was served from cache, and how old the cached copy is.",
        hint: "Request it twice and compare the cache status and Age headers.",
        solution: "for i in 1 2; do\n  curl -sI https://www.cloudflare.com/ | grep -iE 'cf-cache-status|age|cache-control'\n  echo ---\ndone\n# Look for HIT/MISS and an Age value that grows between requests.",
      },
      {
        level: "medium",
        task: "Write Cache-Control values for: a hashed JS bundle, a public product page that changes hourly, a user's account page, and a JSON price feed that may be 30 s stale.",
        hint: "Think about who may store it and for how long.",
        solution: "app.4f2c9e.js:   public, max-age=31536000, immutable\nproduct page:    public, max-age=60, s-maxage=3600\naccount page:    private, no-store\nprice feed:      public, s-maxage=30, stale-while-revalidate=30",
      },
      {
        level: "hard",
        task: "Explain, step by step, what happens to a long TCP download from an anycast address when a BGP route change sends the user's packets to a different CDN location mid-transfer, and how CDNs reduce the impact.",
        hint: "The new location has no record of the connection.",
        solution: "1. Packets now arrive at site B, which has no state for this flow.\n2. B replies with a TCP reset (or drops the packets).\n3. The client sees the connection fail and must retry.\n4. Mitigations: keep routes stable (careful BGP policy),\n   share or forward connection state between sites,\n   use HTTP range requests so clients resume downloads,\n   and use QUIC, whose connection IDs ease migration.",
      },
    ],
    faq: [
      { q: "Does a CDN help a dynamic website?", a: "Yes. Even uncached pages benefit from TLS ending close to the user, reused connections to the origin and optimised routing. Static assets on the same site are fully cached." },
      { q: "How do I clear the CDN cache?", a: "Use the CDN's purge feature, by URL, by tag or for everything. For assets, versioned file names avoid the need to purge at all." },
      { q: "Does using a CDN hurt SEO?", a: "No. Faster pages generally help. Just make sure the CDN serves the same content and status codes as your origin and that redirects and canonical URLs are correct." },
      { q: "What is the difference between anycast and DNS-based load balancing?", a: "Anycast uses one IP everywhere and lets BGP routing choose the site. DNS-based balancing returns different IPs to different users based on their resolver's location." },
    ],
  },

  "net-cloud/sdn": {
    plain: [
      "Every router and switch does two jobs. First it thinks: it talks to its neighbours and decides which way each destination should go. That is the control plane. Then it works: it moves each packet out of the right port, millions of times a second. That is the data plane.",
      "In a traditional network, every device does its own thinking, and engineers configure each one by hand, box by box. With a hundred switches, that means a hundred chances for a typo, and nobody has a full picture of the network.",
      "Software-defined networking (SDN) moves much of the thinking to central software called a controller. The controller sees the whole network and tells each device what to do through an API. The devices mostly just forward packets.",
      "Even without a full SDN controller, the same idea changes daily work. Engineers now describe the network in files, keep those files in Git, review changes like code, and let tools such as Ansible push the configuration to every device the same way.",
    ],
    deepDive: [
      {
        heading: "Control, data and management planes",
        body: "The data plane forwards packets: it looks up the destination in a forwarding table and sends the packet out, often in specialised chips (ASICs) at line rate. The control plane builds that table: routing protocols like OSPF and BGP, ARP and spanning tree run here, on the device's CPU. The management plane is how humans and tools configure and monitor the device: SSH, SNMP, NETCONF, APIs and syslog.\n\nIn classic networks, all three live in every box, and the control plane is distributed: each router computes routes on its own from what its neighbours tell it. This is robust, since no single brain can fail, but it is hard to apply a consistent policy everywhere. SDN centralises the control plane, logically if not physically, so one system knows the full topology and computes forwarding state for all devices. Cloud VPCs are a large SDN: when you add a route in the console, a controller programs the virtual switches on thousands of hosts.",
        visual: {
          type: "compare",
          title: "Traditional versus software-defined",
          columns: [
            { title: "Traditional", points: ["Each device runs its own control plane", "Configured box by box, often by CLI", "No single global view", "Robust, but policy drifts"] },
            { title: "Software-defined", points: ["Central controller computes state", "Devices programmed via APIs", "Global view of topology and policy", "Controller must be highly available"] },
          ],
        },
      },
      {
        heading: "Controllers and OpenFlow",
        body: "OpenFlow was the first widely known SDN protocol. A switch keeps flow tables; each entry has match fields (such as input port, MAC addresses, VLAN, IP addresses, TCP ports), a priority, counters and instructions like forward to port 3, drop, or send to the controller. The switch connects to the controller over TCP, usually port 6653, often protected with TLS.\n\nWhen a packet matches no entry, the switch can send it to the controller in a packet-in message. The controller decides what to do, installs a rule with a flow-mod message so later packets are handled in hardware, and may send the first packet back with packet-out. Open-source controllers include ONOS and OpenDaylight. In practice, pure OpenFlow found its strongest use in research, campus experiments and some large operators; most enterprise and data centre SDN today uses vendor controllers and protocols like NETCONF, gNMI and BGP EVPN, while virtual switches such as Open vSwitch still support OpenFlow.",
        visual: {
          type: "sequence",
          title: "Reactive flow setup with OpenFlow",
          actors: ["Host A", "Switch", "Controller"],
          messages: [
            { from: 0, to: 1, label: "First packet to host B" },
            { from: 1, to: 2, label: "packet-in: no matching flow" },
            { from: 2, to: 1, label: "flow-mod: match dst B, output port 7" },
            { from: 2, to: 1, label: "packet-out: send the first packet" },
            { from: 0, to: 1, label: "Next packets match in hardware" },
          ],
        },
      },
      {
        heading: "Intent-based networking",
        body: "Intent-based networking raises the level further. Instead of writing device commands, you state the outcome you want, such as \"guests may reach only the internet\" or \"the payment app must never share a segment with the guest network\". The system then translates that intent into configuration for each device, applies it, and keeps checking that the live network still matches the intent.\n\nThe loop has three parts: translation (intent to policy to device config), activation (pushing the config) and assurance (collecting telemetry and verifying the result, raising an alert or fixing drift when reality differs). Commercial examples include Cisco Catalyst Center (formerly DNA Center) and Juniper Apstra. The value is consistency and continuous verification; the risk is that the translation layer is complex, so teams still need to understand what is pushed underneath.",
        visual: {
          type: "cycle",
          title: "The intent-based networking loop",
          steps: [
            { label: "Declare intent", detail: "Guests reach only the internet" },
            { label: "Translate", detail: "Turn intent into policies and device config" },
            { label: "Activate", detail: "Push config to switches, routers, firewalls" },
            { label: "Assure", detail: "Collect telemetry; compare reality with intent" },
            { label: "Remediate", detail: "Alert or fix drift, then keep checking" },
          ],
        },
      },
      {
        heading: "Automation with APIs and Ansible",
        body: "Network automation does not require an SDN controller. Modern devices offer model-driven APIs: NETCONF runs over SSH on TCP port 830 and exchanges XML; RESTCONF offers the same data over HTTPS; gNMI uses gRPC and is popular for streaming telemetry. All describe configuration and state with YANG data models, so tools work with structured data instead of screen-scraping CLI text.\n\nAnsible is the most common entry point. It is agentless: it connects over SSH or an API, so nothing is installed on switches. Inventory files list devices and set ansible_network_os (for example cisco.ios.ios) and ansible_connection (ansible.netcommon.network_cli for CLI over SSH, or ansible.netcommon.netconf). Resource modules like cisco.ios.ios_vlans and ios_interfaces take structured data and a state such as merged, replaced or overridden. Run with --check --diff first to see changes without applying them, and keep playbooks and variables in Git so every change is reviewed.",
        bullets: ["NETCONF: TCP 830 over SSH, XML", "RESTCONF: HTTPS with JSON or XML", "gNMI: gRPC, streaming telemetry", "ansible-playbook --check --diff previews changes"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A network change as code",
        steps: [
          { label: "Edit variables", detail: "Add VLAN 40 in a YAML file" },
          { label: "Pull request", detail: "Colleague reviews the diff" },
          { label: "CI checks", detail: "Lint, then a dry run with --check --diff" },
          { label: "Merge and apply", detail: "Pipeline runs the playbook" },
          { label: "Verify", detail: "Tests confirm VLAN and reachability" },
          { label: "Roll back if needed", detail: "Revert the commit and re-run" },
        ],
      },
    ],
    examples: [
      {
        title: "Pushing VLANs to every access switch with Ansible",
        explanation: "A new Voice VLAN must exist on 40 access switches. Step 1: define the switches in an inventory group with the network OS and connection type. Step 2: write a playbook using the ios_vlans resource module with state merged, so existing VLANs stay untouched. Step 3: run with --check --diff to see what would change. Step 4: run it for real, then re-run to confirm it reports no changes (idempotence).",
        code: {
          lang: "yaml",
          code: "# inventory.yml\naccess_switches:\n  hosts:\n    sw[01:40].office.example.com:\n  vars:\n    ansible_network_os: cisco.ios.ios\n    ansible_connection: ansible.netcommon.network_cli\n# vlans.yml\n- hosts: access_switches\n  gather_facts: false\n  tasks:\n    - cisco.ios.ios_vlans:\n        config: [{ vlan_id: 30, name: VOICE }]\n        state: merged",
        },
      },
      {
        title: "Reading device state with RESTCONF",
        explanation: "You want the interface list from a router as structured JSON instead of parsing show output. Step 1: enable RESTCONF on the device (on Cisco IOS XE, the restconf command plus an HTTPS server). Step 2: request the ietf-interfaces YANG model over HTTPS with the right Accept header. Step 3: process the JSON with jq. The same data path works for changes with PUT or PATCH, which is how many controllers and scripts talk to devices.",
        code: {
          lang: "bash",
          code: "curl -sk -u admin:\"$PASS\" \\\n  -H 'Accept: application/yang-data+json' \\\n  https://10.0.99.1/restconf/data/ietf-interfaces:interfaces \\\n  | jq '.\"ietf-interfaces:interfaces\".interface[] | {name, enabled}'",
        },
      },
    ],
    cheatSheet: [
      "Data plane forwards packets; control plane builds tables; management plane configures",
      "OpenFlow: match, priority, counters, actions; controller usually on TCP 6653",
      "packet-in: switch asks controller; flow-mod: controller installs a rule",
      "NETCONF on TCP 830 (SSH), RESTCONF over HTTPS, gNMI over gRPC; all use YANG",
      "Ansible is agentless: set ansible_network_os and ansible_connection per group",
      "Resource module states: merged adds, replaced swaps per item, overridden replaces all",
      "Always run ansible-playbook --check --diff before applying network changes",
      "Intent-based loop: translate, activate, assure, remediate",
    ],
    quiz: [
      {
        q: "Which plane runs OSPF and BGP on a router?",
        options: ["Data plane", "Control plane", "Management plane", "User plane"],
        answer: 1,
        why: "Routing protocols compute paths and fill the forwarding table, which is control plane work.",
      },
      {
        q: "In OpenFlow, what does a switch send when a packet matches no flow entry and the table-miss rule says to ask the controller?",
        options: ["flow-mod", "packet-out", "A BGP update", "packet-in"],
        answer: 3,
        why: "packet-in carries the packet (or its header) to the controller for a decision.",
      },
      {
        q: "Which protocol uses YANG models over SSH on TCP port 830?",
        options: ["NETCONF", "SNMP", "Telnet", "OpenFlow"],
        answer: 0,
        why: "NETCONF runs over SSH, with port 830 assigned for it.",
      },
      {
        q: "What does the assurance part of intent-based networking do?",
        options: ["Writes device commands by hand", "Encrypts traffic", "Continuously checks that the live network matches the declared intent", "Replaces switches with servers"],
        answer: 2,
        why: "Assurance uses telemetry to verify the outcome and detect drift.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For each item, say whether it belongs to the control, data or management plane: an OSPF hello, forwarding a video packet, an SSH login to a switch, an ARP reply, an SNMP poll.",
        hint: "Ask whether it builds tables, moves user traffic, or administers the device.",
        solution: "OSPF hello: control plane\nForwarding a video packet: data plane\nSSH login to a switch: management plane\nARP reply: control plane (builds the neighbour table)\nSNMP poll: management plane",
      },
      {
        level: "medium",
        task: "Write an Ansible playbook that sets the description of interface GigabitEthernet0/1 on all access switches to \"Uplink to core\" and makes sure it is enabled.",
        hint: "Use the cisco.ios.ios_interfaces resource module with state merged.",
        solution: "- hosts: access_switches\n  gather_facts: false\n  tasks:\n    - name: Describe and enable uplink\n      cisco.ios.ios_interfaces:\n        config:\n          - name: GigabitEthernet0/1\n            description: Uplink to core\n            enabled: true\n        state: merged",
      },
      {
        level: "hard",
        task: "Design a Git-based workflow for network changes with review, a dry run, automatic deploy and rollback. List the pipeline stages and what each must check.",
        hint: "Think lint, check mode, approval, apply, verify, revert.",
        solution: "1. Branch + PR: change YAML variables only, not raw configs.\n2. Lint: yamllint and ansible-lint on every push.\n3. Dry run: ansible-playbook site.yml --check --diff, diff posted to the PR.\n4. Approval: at least one network engineer approves.\n5. Deploy on merge: apply to a canary switch, then the rest in batches.\n6. Verify: run tests (VLANs present, uplinks up, ping gateways).\n7. Rollback: on failure, revert the commit and re-run the playbook.\n8. Nightly drift check: --check mode alerts if devices differ from Git.",
      },
    ],
    faq: [
      { q: "Is SDN the same as network automation?", a: "No. SDN is an architecture where a controller holds the control logic. Network automation means using scripts and tools to configure devices, which you can do with or without SDN." },
      { q: "Is OpenFlow still used?", a: "It is still supported in virtual switches like Open vSwitch and used in research and some operator networks, but most enterprise SDN today uses vendor controllers with NETCONF, gNMI, EVPN and APIs." },
      { q: "Do I need to learn Python for network automation?", a: "It helps a lot. Ansible lets you start with YAML, but Python libraries such as Netmiko, NAPALM and ncclient cover cases Ansible modules do not." },
      { q: "Is a cloud VPC an example of SDN?", a: "Yes. The provider's controllers program virtual switches and routers on their hosts whenever you change subnets, routes or security groups through the API." },
    ],
  },
};

export default extra;
