import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-foundations/exam-guide": {
    plain: [
      "SAA-C03 is the code for the AWS Certified Solutions Architect Associate exam. It does not ask you to type commands. Each question tells a short story: a company has a problem and a few rules, such as \"lowest cost\" or \"no servers to manage\". You pick the AWS design that solves the problem and follows every rule.",
      "The exam guide is a free document from AWS. It lists the four domains (big topic areas), how much each one counts, the exact tasks you must be able to do, and which AWS services are in scope. Think of it as the syllabus. If a service is not on the in-scope list, you will not be tested on it in depth.",
      "The practical facts: 65 questions in 130 minutes, so about two minutes per question. You take it at a Pearson VUE test center or online at home with a webcam. The fee is 150 USD. Scores run from 100 to 1000 and you need 720 to pass.",
      "A study plan turns \"someday\" into a schedule. People with some IT background often need 6 to 10 weeks at 8 to 10 hours per week. Book the exam first, then work backwards: give more weeks to the heavy domains, do a hands-on lab every week, and finish with timed practice exams.",
    ],
    deepDive: [
      {
        heading: "How the score is calculated",
        body: "Of the 65 questions, 50 are scored and 15 are unscored. AWS uses the unscored ones to test new questions, and they look exactly like the others, so treat every question as real. Your raw result is converted to a scaled score from 100 to 1000, which keeps different versions of the exam fair. 720 is the pass mark.\n\nThe exam uses a compensatory model: you do not have to pass each domain on its own, only the exam as a whole. A strong security score can make up for a weaker cost score. Your score report shows each domain as \"meets competencies\" or \"needs improvement\", which is useful if you need to retake.\n\nThere is no penalty for wrong answers, and a blank answer counts as wrong. Multiple response questions tell you how many options to pick; you must choose all the correct ones to earn the point.",
        bullets: ["50 scored plus 15 unscored questions", "Scaled score 100 to 1000, pass at 720", "Pass overall, not per domain", "Never leave a question blank"],
      },
      {
        heading: "Task statements are the real syllabus",
        body: "Each domain is split into task statements, 14 in total. For example, Domain 1 has three: design secure access to AWS resources, design secure workloads and applications, and determine appropriate data security controls. Domain 3 has five, covering storage, compute, databases, networking, and data ingestion.\n\nUnder each task statement, the guide lists \"knowledge of\" items (concepts) and \"skills in\" items (things you can do). Turn these into a checklist. Next to each line, write the AWS services involved and mark yourself red, amber or green. That checklist becomes your study plan and later your revision list.\n\nThe appendix lists in-scope and out-of-scope services. Spend your time on the in-scope ones that appear in many task statements: IAM, VPC, EC2, S3, RDS, DynamoDB, Lambda, SQS, CloudFront and KMS come up again and again.",
        visual: {
          type: "layers",
          title: "How the exam guide is organized",
          layers: [
            { label: "Domain", detail: "Four weighted areas, e.g. Secure Architectures at 30%." },
            { label: "Task statement", detail: "14 in total, e.g. design secure access to resources." },
            { label: "Knowledge of", detail: "Concepts you must understand." },
            { label: "Skills in", detail: "Design choices you must be able to make." },
            { label: "In-scope services", detail: "The services those skills use." },
          ],
        },
      },
      {
        heading: "Reading a scenario question",
        body: "Most questions are three to six sentences long. The last sentence holds the real ask, so read it first, then read the story looking for requirements. Requirements hide in phrases like \"least operational overhead\" (prefer managed or serverless), \"most cost-effective\" (cheapest option that still works), \"highly available\" (more than one AZ), \"decouple\" (a queue or event bus) and \"without changing the application code\".\n\nThen eliminate. Usually two options break a stated rule, for example they use one AZ when high availability is required, or they need custom code when the question asks for minimal effort. You are left with two answers that both work. Pick the one that meets every requirement with the least extra work or cost.\n\nIf you are still unsure after about two minutes, choose your best guess, flag the question, and move on.",
        visual: {
          type: "flow",
          title: "Answering one scenario question",
          steps: [
            { label: "Read the last line", detail: "Find what is actually being asked." },
            { label: "Mark requirements", detail: "Cost, HA, effort, security, performance." },
            { label: "Cut two options", detail: "Drop answers that break any rule." },
            { label: "Compare the rest", detail: "Prefer less custom work or lower cost." },
            { label: "Answer and flag", detail: "Never leave it blank; revisit later." },
          ],
        },
      },
      {
        heading: "Booking and exam day",
        body: "You book through your AWS Certification account, which hands you over to Pearson VUE. At a test center you bring a government ID. Online, you need a private room, a clean desk, a webcam, and a stable connection; the proctor watches you the whole time and you cannot use paper or a second screen.\n\nIf English is not your first language, request the ESL +30 accommodation before you book. It adds 30 minutes, giving you 160 minutes instead of 130, and it applies to all your future AWS exams.\n\nIf you fail, you must wait 14 days before retaking, and you pay the fee again. Once you pass, the certification is valid for three years. Passing also gives you a discount voucher for your next AWS exam.",
        bullets: ["Request ESL +30 before booking, not after", "Run the online system test a day early", "Retake waiting period: 14 days", "Valid for 3 years"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "One study week",
        steps: [
          { label: "Read", detail: "Docs and FAQs for this week's services." },
          { label: "Build", detail: "A small lab in your own account." },
          { label: "Quiz", detail: "20 to 30 questions on the same topic." },
          { label: "Log misses", detail: "Write why the right answer is right." },
          { label: "Review", detail: "Reread the misses before next week." },
        ],
      },
      {
        type: "compare",
        title: "Question formats",
        columns: [
          { title: "Multiple choice", points: ["One correct answer", "Four options", "Most of the exam", "Eliminate down to two, then decide"] },
          { title: "Multiple response", points: ["Two or more correct answers", "Five or more options", "The question says how many to pick", "All correct choices needed for the point"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turning domain weights into hours",
        explanation: "Priya has 8 weeks and can study 10 hours a week, so 80 hours in total. Step 1: set aside about 15 percent (12 hours) for the final two weeks of timed practice exams. Step 2: split the remaining 68 hours by domain weight: security 30 percent is about 20 hours, resilience 26 percent about 18 hours, performance 24 percent about 16 hours, and cost 20 percent about 14 hours. Step 3: map them onto weeks: weeks 1 to 2 security, weeks 3 to 4 resilience, weeks 5 to 6 performance and cost. Step 4: put the exam date in her calendar for the end of week 8 so the plan has a real deadline.",
      },
      {
        title: "Dissecting a real-style question",
        explanation: "\"A company runs a web app on one EC2 instance. Traffic is growing and the app must stay available if an Availability Zone fails, with the least operational overhead.\" Step 1: the ask is high availability with little effort. Step 2: an option that adds a bigger instance type fails, because it is still one AZ. Step 3: an option to write scripts that copy the instance to another AZ fails on overhead. Step 4: two options remain: an Auto Scaling group across two AZs behind an Application Load Balancer, or two manually managed instances behind a load balancer. The Auto Scaling group wins because it replaces failed instances automatically. That is the pattern: meet every requirement, then prefer the most managed option.",
      },
    ],
    cheatSheet: [
      "65 questions, 130 minutes, scaled score 100 to 1000, pass at 720, fee 150 USD",
      "Domains: Secure 30%, Resilient 26%, High-performing 24%, Cost-optimized 20%",
      "15 questions are unscored and look identical to scored ones",
      "No penalty for guessing; a blank answer is simply wrong",
      "ESL +30 gives non-native English speakers 30 extra minutes; request it before booking",
      "Failed? Wait 14 days to retake. Passed? Valid for 3 years",
      "\"Least operational overhead\" usually means managed or serverless",
      "About 2 minutes per question: answer, flag and move on when stuck",
    ],
    quiz: [
      {
        q: "How many of the 65 SAA-C03 questions count toward your score?",
        options: ["All 65", "60", "50", "45"],
        answer: 2,
        why: "50 questions are scored; 15 are unscored questions AWS is testing.",
      },
      {
        q: "Your practice scores are strong in security but weak in cost optimization. What is true about passing?",
        options: ["You pass if the overall scaled score reaches 720", "You must pass every domain separately", "Cost questions are worth double", "Weak domains are retested automatically"],
        answer: 0,
        why: "The exam is compensatory, so strengths in one domain can offset weaknesses in another.",
      },
      {
        q: "A question includes the phrase \"with the least operational overhead\". Which answer style does this usually favor?",
        options: ["Custom scripts on EC2", "The cheapest instance type", "Self-managed open-source software", "A managed or serverless service"],
        answer: 3,
        why: "Managed and serverless services remove patching, scaling and server management work.",
      },
      {
        q: "When should a non-native English speaker request the ESL +30 accommodation?",
        options: ["On exam day at check-in", "Before booking the exam", "After failing once", "It is applied automatically to everyone"],
        answer: 1,
        why: "The accommodation must be approved on your certification account before you schedule.",
      },
      {
        q: "You fail your first attempt. When can you retake SAA-C03?",
        options: ["The next day", "After 7 days", "After 14 days", "After 90 days"],
        answer: 2,
        why: "AWS requires a 14-day waiting period between attempts of the same exam.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Download the SAA-C03 exam guide and write down the four domains, their weights, and how many task statements each domain has.",
        hint: "The weights add up to 100 percent and the task statements add up to 14.",
        solution: "Domain 1 Design Secure Architectures: 30%, 3 task statements\nDomain 2 Design Resilient Architectures: 26%, 2 task statements\nDomain 3 Design High-Performing Architectures: 24%, 5 task statements\nDomain 4 Design Cost-Optimized Architectures: 20%, 4 task statements\nTotal: 100%, 14 task statements",
      },
      {
        level: "medium",
        task: "You have 6 weeks at 8 hours per week. Build a week-by-week plan that follows the domain weights and leaves time for practice exams.",
        hint: "Reserve the last week for timed exams, then split the rest roughly by weight.",
        solution: "Total 48 h. Week 6 (8 h): two timed practice exams plus review.\nRemaining 40 h by weight: security 12 h, resilience 10 h, performance 10 h, cost 8 h.\nWeek 1: IAM, Organizations, KMS (8 h)\nWeek 2: VPC security, WAF, GuardDuty (4 h) + Multi-AZ, ELB, ASG (4 h)\nWeek 3: SQS, SNS, DR strategies (6 h) + EC2 families (2 h)\nWeek 4: storage, RDS, DynamoDB, caching (8 h)\nWeek 5: pricing models and cost tools (8 h)\nBook the exam for the end of week 6.",
      },
      {
        level: "hard",
        task: "Take any practice question you got wrong. Write a one-line rule that would have led you to the right answer, and name the requirement keyword you missed.",
        hint: "Good rules look like \"when X is required, prefer Y because Z\".",
        solution: "Example miss: chose a single larger EC2 instance for \"must survive an AZ failure\".\nKeyword missed: \"AZ failure\" means at least two AZs.\nRule: when a scenario says survive an AZ failure, prefer an Auto Scaling group\nacross two or more AZs behind a load balancer, because one instance is one AZ.\nLog it with the domain (Resilient) so weak areas show up as patterns.",
      },
    ],
    faq: [
      { q: "Do I need the Cloud Practitioner certification first?", a: "No. There are no prerequisites for SAA-C03. AWS recommends about a year of hands-on experience, but many people pass with focused study and regular labs." },
      { q: "How long does it take to get my result?", a: "Official results usually arrive in your certification account within five business days. Your report shows the scaled score and how you did in each domain." },
      { q: "Is the exam open book?", a: "No. You cannot use notes, the AWS console or a second screen, whether you test online or at a test center." },
      { q: "How do I know the exam version is still current?", a: "Check the certification page before you book. AWS announces a new exam version months in advance and publishes its guide early." },
    ],
  },

  "aws-foundations/global-infra": {
    plain: [
      "AWS has data centers all over the world, grouped into Regions. A Region is a geographic area, such as Frankfurt (eu-central-1) or Mumbai (ap-south-1). When you create a server or a database, you choose the Region it lives in, and your data stays there unless you copy it somewhere else.",
      "Inside each Region are Availability Zones, or AZs. An AZ is one or more data centers with their own power, cooling and network. AZs in a Region are kilometers apart but joined by fast private fiber. If a fire or power cut hits one AZ, the others keep running. That is why good designs use at least two AZs.",
      "Edge locations are smaller sites in many more cities. They do not run your servers. They cache web content for CloudFront, answer DNS queries for Route 53, and carry traffic for Global Accelerator, so users get answers from somewhere nearby.",
      "Security is shared. AWS protects the buildings, hardware and the software that runs its services. You protect what you put on top: who can log in, your data, your firewall rules and, on EC2, the operating system. The more managed the service, the less is left for you.",
    ],
    deepDive: [
      {
        heading: "What an AZ really is",
        body: "An AZ is not a single building. It is one or more discrete data centers with redundant power and networking. AZs in one Region are separated by a meaningful distance, up to about 100 km, so a flood or power failure is unlikely to hit two at once. They are still close enough for round trips of a few milliseconds, which makes synchronous replication practical. That is how RDS Multi-AZ keeps a standby copy in another AZ without slowing writes much.\n\nAZ names like us-east-1a are mapped to physical AZs differently in each account, which spreads customers across zones. To line up AZs between accounts, use the AZ ID, such as use1-az1, which means the same physical zone everywhere.\n\nTraffic between AZs is not free. In most Regions it costs about 0.01 USD per GB in each direction, which adds up for chatty services.",
        bullets: ["One AZ = one or more data centers", "Up to about 100 km apart, a few ms latency", "AZ names differ per account; AZ IDs do not", "Cross-AZ traffic is billed per GB"],
      },
      {
        heading: "Choosing a Region in four questions",
        body: "Ask the questions in this order. First, compliance: does a law or contract say where the data must live? If so, that decides it. Second, latency: which Region is closest, in network terms, to most of your users? Third, service availability: new services and instance types often launch in a few Regions first, so check that everything you need exists there. Fourth, price: the same instance can cost noticeably more in Sao Paulo or Tokyo than in North Virginia.\n\nSome Regions are opt-in. Regions launched after March 2019, such as Cape Town or Milan, are disabled by default and must be enabled in your account before you can use them.\n\nA few things are tied to us-east-1 even if you never deploy there: CloudFront needs ACM certificates from us-east-1, and billing metrics live there.",
        visual: {
          type: "flow",
          title: "Region selection order",
          steps: [
            { label: "Compliance", detail: "Data residency rules decide first." },
            { label: "Latency", detail: "Closest to most users." },
            { label: "Services", detail: "Every needed service and feature exists." },
            { label: "Price", detail: "Compare cost among the Regions left." },
          ],
        },
      },
      {
        heading: "Zonal, regional and global services",
        body: "Services live at different scopes, and that decides how you make them resilient. Zonal resources sit in one AZ: an EC2 instance, an EBS volume, a subnet, a NAT gateway. If that AZ fails, they fail with it, so you run copies in several AZs. Regional services spread themselves across AZs for you: S3, DynamoDB, SQS, Lambda and the VPC itself. Global services are not tied to one Region at all: IAM, Route 53, CloudFront and Organizations.\n\nA good habit is static stability: run enough capacity so that losing one AZ still leaves you enough to serve peak traffic, without waiting for new instances to start. With two AZs that means 100 percent extra; with three AZs, 50 percent extra.",
        visual: {
          type: "tree",
          title: "Where services live",
          root: "AWS service scope",
          children: [
            { label: "Zonal", children: ["EC2 instance", "EBS volume", "Subnet", "NAT gateway"] },
            { label: "Regional", children: ["S3 bucket", "DynamoDB table", "SQS queue", "Lambda function"] },
            { label: "Global", children: ["IAM", "Route 53", "CloudFront", "Organizations"] },
          ],
        },
      },
      {
        heading: "Beyond Regions: Local Zones, Wavelength and Outposts",
        body: "Sometimes even the nearest Region is too far. Local Zones place a small set of services, such as EC2 and EBS, in a large city, giving single-digit millisecond latency to users there. They are good for video editing, gaming or real-time trading tools. Wavelength Zones put AWS compute inside telecom 5G networks for mobile apps that need very low latency. Outposts are AWS racks installed in your own data center, for workloads that must stay on premises but should use the same APIs and tools.\n\nEdge locations are different again: there are far more of them than Regions, and they run only edge services like CloudFront, Route 53, Global Accelerator and Shield. On the exam, \"users in a specific city need very low latency\" suggests Local Zones, while \"must run in our own building\" suggests Outposts.",
      },
      {
        heading: "Shared responsibility moves with the service",
        body: "The split is not fixed. It slides depending on how managed the service is. On EC2 you patch the guest operating system, configure the firewall, install software and manage backups. On RDS, AWS patches the OS and database engine, while you still control who can connect, whether storage is encrypted, and how long backups are kept. On Lambda or S3 you mostly handle your code, your IAM permissions and your data.\n\nSome controls are shared: AWS patches its infrastructure and you patch your guest OS and apps; AWS trains its staff and you train yours. Some are fully inherited from AWS, like physical security. Two things never move to AWS: your data and your identities. Misconfigured permissions and public buckets are always the customer's responsibility.",
        visual: {
          type: "compare",
          title: "What you still manage",
          columns: [
            { title: "EC2", points: ["Guest OS patches", "Installed software", "Security groups", "Data and backups", "IAM access"] },
            { title: "RDS", points: ["Network access rules", "Encryption choice", "Backup retention", "Database users", "IAM access"] },
            { title: "Lambda", points: ["Function code", "Execution role", "Dependencies", "Data handled", "IAM access"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What happens when one AZ fails",
        steps: [
          { label: "AZ goes dark", detail: "Power or network loss in one zone." },
          { label: "Load balancer", detail: "Health checks fail; traffic goes to other AZs." },
          { label: "Auto Scaling", detail: "Launches replacement instances in healthy AZs." },
          { label: "RDS Multi-AZ", detail: "Standby is promoted; DNS points to it." },
          { label: "App keeps serving", detail: "Users may see a short blip, not an outage." },
        ],
      },
    ],
    examples: [
      {
        title: "Picking a Region for an Indian fintech",
        explanation: "A payments startup must keep customer data in India and serve users across the country. Step 1, compliance: only Mumbai (ap-south-1) and Hyderabad (ap-south-2) qualify. Step 2, latency: both are in India, so both are fine for users. Step 3, services: Mumbai is older and usually has more services and instance types, so check that each service the design needs is listed there. Step 4: pick Mumbai as primary and keep backups in Hyderabad for disaster recovery, which still keeps the data in India. The commands below list the zones and their IDs.",
        code: {
          lang: "bash",
          code: "# Regions enabled for this account\naws ec2 describe-regions --query \"Regions[].RegionName\" --output text\n\n# AZ names and their physical AZ IDs in Mumbai\naws ec2 describe-availability-zones --region ap-south-1 \\\n  --query \"AvailabilityZones[].[ZoneName,ZoneId,State]\" --output table",
        },
      },
      {
        title: "Sizing for the loss of one AZ",
        explanation: "A web tier needs 6 instances to handle peak traffic. Step 1, two AZs: if one fails, the survivor must carry everything, so each AZ needs 6 instances, 12 in total (100 percent extra). Step 2, three AZs: losing one leaves two, so each AZ needs 3 instances, 9 in total (50 percent extra). Step 3: three AZs are cheaper for the same safety, which is why many production designs use three. Step 4: set the Auto Scaling group minimum to that number so the spare capacity is always running, not launched in a panic during an outage.",
      },
    ],
    cheatSheet: [
      "Region = geographic area; AZ = isolated data centers inside it; edge = caching and DNS near users",
      "Pick a Region by compliance, then latency, then service availability, then price",
      "AZ names are shuffled per account; use AZ IDs like use1-az1 to match across accounts",
      "Cross-AZ data transfer costs about 0.01 USD per GB each way in most Regions",
      "Zonal: EC2, EBS, subnet, NAT gateway. Regional: S3, DynamoDB, SQS. Global: IAM, Route 53",
      "Regions launched after March 2019 are opt-in and must be enabled first",
      "Static stability: 2 AZs need 100% spare capacity, 3 AZs need 50%",
      "You always own your data and IAM, whatever the service",
    ],
    quiz: [
      {
        q: "Two accounts both launch into us-east-1a. Are they guaranteed to be in the same physical AZ?",
        options: ["Yes, AZ names are global", "Only inside an Organization", "Only if both use the default VPC", "No; compare AZ IDs to be sure"],
        answer: 3,
        why: "AZ names are mapped randomly per account, while AZ IDs identify the same physical zone everywhere.",
      },
      {
        q: "Which resource fails if its Availability Zone fails?",
        options: ["An EBS volume", "An S3 bucket", "A DynamoDB table", "An IAM role"],
        answer: 0,
        why: "EBS volumes live in a single AZ, while the others are regional or global.",
      },
      {
        q: "Video editors in Los Angeles need single-digit millisecond latency to EC2. The nearest Region is too far. What fits?",
        options: ["An edge location", "AWS Local Zones", "A second Region", "AWS Outposts in a colocation site"],
        answer: 1,
        why: "Local Zones place EC2 and EBS close to large cities for very low latency.",
      },
      {
        q: "Who is responsible for encrypting data stored in an RDS database?",
        options: ["AWS, always", "Nobody, RDS is encrypted by law", "The customer chooses to enable it", "The database engine vendor"],
        answer: 2,
        why: "Encryption is a customer choice made when the RDS instance is created.",
      },
      {
        q: "A tier needs 4 instances at peak and must survive one AZ failure. What is the minimum total across 3 AZs?",
        options: ["4", "5", "8", "6"],
        answer: 3,
        why: "Losing one of three AZs leaves two, so each AZ needs 2 instances, 6 in total.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the Availability Zones in your lab Region, with both the zone name and the zone ID.",
        hint: "Use describe-availability-zones with a --query.",
        solution: "aws ec2 describe-availability-zones --region us-east-1 \\\n  --query \"AvailabilityZones[].[ZoneName,ZoneId]\" --output table\n# Note how names like us-east-1a map to IDs like use1-az4.",
      },
      {
        level: "medium",
        task: "A service needs 10 instances at peak. Work out the total instances and spare percentage needed to survive one AZ loss with 2, 3 and 4 AZs.",
        hint: "After losing one AZ, the remaining AZs must hold all 10 instances.",
        solution: "2 AZs: survivors = 1 AZ, needs 10 per AZ -> 20 total (100% spare)\n3 AZs: survivors = 2 AZs, needs 5 per AZ -> 15 total (50% spare)\n4 AZs: survivors = 3 AZs, needs 4 per AZ (rounded up from 3.34) -> 16 total\n  (in theory 33% spare; rounding to whole instances adds a bit more)\nMore AZs means less spare capacity for the same resilience.",
      },
      {
        level: "hard",
        task: "A media company in Brazil has users in Brazil and Europe. Brazilian user data must stay in Brazil. Video files can be cached anywhere. Propose Regions and edge services.",
        hint: "Separate the data that has a residency rule from the content that does not.",
        solution: "Primary Region: sa-east-1 (Sao Paulo) for databases and user data.\nKeep backups in sa-east-1 too (across AZs), since there is one Region in Brazil.\nVideo files: origin in S3 in sa-east-1, delivered by CloudFront edge locations,\nso European users get cached copies nearby without moving the master data.\nCheck that every needed service exists in sa-east-1 and budget for its higher prices.",
      },
    ],
    faq: [
      { q: "How many Regions and AZs does AWS have?", a: "More than 30 Regions and over 100 AZs, and the numbers grow every year. The AWS global infrastructure page has the current list." },
      { q: "Is one AZ the same as one data center?", a: "Not always. An AZ is one or more data centers that share a failure boundary, so treat the whole AZ as the unit that can fail." },
      { q: "Why is us-east-1 special?", a: "It is the oldest and largest Region, new services often launch there first, and some global features depend on it, such as ACM certificates for CloudFront and billing metrics." },
      { q: "Does AWS move my data between Regions?", a: "No. Data stays in the Region you chose unless you copy or replicate it yourself, or use a global service that you configured to do so." },
    ],
  },

  "aws-foundations/well-architected": {
    plain: [
      "The Well-Architected Framework is AWS's advice on how to build good systems in the cloud. It groups that advice into six pillars: operational excellence, security, reliability, performance efficiency, cost optimization and sustainability. Each pillar comes with design principles and a list of questions you can ask about any design.",
      "Think of it as a health check for your architecture. A doctor checks your heart, lungs and blood pressure. A Well-Architected review checks whether your system can be run safely, is secure, survives failures, is fast enough, does not waste money, and does not waste energy.",
      "The pillars often pull against each other. Running a database in two AZs is more reliable, but costs more. The framework does not say which pillar always wins. It helps you see the trade-off clearly and make a deliberate choice.",
      "For the exam, this matters a lot. Many questions are really asking \"which pillar matters most here?\" A phrase like \"most cost-effective\" points to cost, while \"must keep working if an AZ fails\" points to reliability. Spot the pillar and the right answer gets much easier to see.",
    ],
    deepDive: [
      {
        heading: "The general design principles",
        body: "Before the six pillars, the framework lists a few ideas that apply everywhere. Stop guessing your capacity needs: scale up and down with demand instead of buying for the peak. Test systems at production scale: create a full copy, test it, and delete it, paying only while it runs. Automate to make experimentation easier, using infrastructure as code so you can rebuild anything. Allow for evolutionary architectures, since the cloud makes it cheap to change your mind. Drive architectures using data, collecting metrics to see how changes affect behavior. Improve through game days, where you practise failures on purpose.\n\nThese are the ideas behind many exam answers. When one option guesses capacity with a big fixed server and another scales with demand, the framework favors scaling.",
        bullets: ["Stop guessing capacity", "Test at production scale", "Automate experiments", "Evolve the architecture", "Use data and game days"],
      },
      {
        heading: "Each pillar's core idea",
        body: "Operational excellence: run and improve the system with automation, observability and small, frequent, reversible changes. Security: a strong identity foundation, traceability, security at every layer, data protected at rest and in transit, and people kept away from data. Reliability: recover automatically from failure, test recovery, scale horizontally, and manage change through automation. Performance efficiency: use advanced technology as a managed service, go global in minutes, prefer serverless, and experiment often. Cost optimization: pay only for what you use, measure efficiency, stop spending on undifferentiated heavy lifting, and attribute spend to owners. Sustainability: understand your impact, maximize utilization, adopt more efficient hardware and managed services, and reduce the resources your users need.\n\nNotice how often \"managed service\" and \"automation\" appear. They are the framework's favorite tools across almost every pillar.",
      },
      {
        heading: "How a Well-Architected review works",
        body: "The AWS Well-Architected Tool is free in the console. You define a workload, choose lenses, and answer questions pillar by pillar. Each question has a list of best practices to tick. The tool then marks high-risk and medium-risk issues and builds an improvement plan ranked by risk.\n\nLenses add questions for specific kinds of workloads, such as serverless, SaaS, data analytics or machine learning. You can also write custom lenses with your company's own rules.\n\nA review is a conversation with the team, not an audit with a grade. The aim is to find the riskiest gaps and fix them first. Save a milestone after each review so you can compare progress over time, then review again after big changes or at least once a year.",
        visual: {
          type: "cycle",
          title: "The review loop",
          steps: [
            { label: "Define workload", detail: "Scope, owners, environment and lenses." },
            { label: "Answer questions", detail: "Pillar by pillar, with the team." },
            { label: "Find risks", detail: "High and medium risk issues flagged." },
            { label: "Improve", detail: "Fix the highest risks first." },
            { label: "Save milestone", detail: "Snapshot progress, then review again." },
          ],
        },
      },
      {
        heading: "Trade-offs between pillars",
        body: "Every real design trades one pillar against another. Multi-AZ RDS roughly doubles the database instance cost but survives an AZ failure. Lambda provisioned concurrency removes cold starts but you pay for it even when idle. Encrypting everything with customer managed keys improves security and audit, but adds key policies to manage and per-request KMS costs.\n\nThe right choice depends on the business. A hobby project can live in one AZ; a payments system cannot. On the exam, the question always tells you which pillar to favor. If it says \"most cost-effective\" and also \"highly available\", you need the cheapest design that is still highly available, not the cheapest design overall.\n\nSecurity is the one pillar you should not trade away. Exam answers that weaken security to save money are almost always wrong.",
        visual: {
          type: "compare",
          title: "Same database, different priorities",
          columns: [
            { title: "Optimized for cost", points: ["Single-AZ RDS", "Smaller instance", "Short backup retention", "Downtime if the AZ fails"] },
            { title: "Optimized for reliability", points: ["Multi-AZ RDS", "Automatic failover", "Longer backups and snapshots", "About double the instance cost"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Pillars and the AWS services that support them",
        root: "Well-Architected in practice",
        children: [
          { label: "Operational excellence", children: ["CloudFormation", "CloudWatch", "Systems Manager"] },
          { label: "Security", children: ["IAM", "KMS", "GuardDuty"] },
          { label: "Reliability", children: ["Multi-AZ", "Auto Scaling", "AWS Backup"] },
          { label: "Performance efficiency", children: ["CloudFront", "ElastiCache", "Graviton"] },
          { label: "Cost optimization", children: ["Cost Explorer", "Savings Plans", "Spot"] },
          { label: "Sustainability", children: ["Managed services", "Right-sizing", "Carbon footprint tool"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reviewing a small design pillar by pillar",
        explanation: "A shop runs one EC2 instance in a public subnet with MySQL installed on the same machine. Developers SSH in with a shared key and copy files by hand. Step 1, operational excellence: manual deploys are risky, so use CloudFormation or CDK and a pipeline. Step 2, security: replace the shared SSH key with Systems Manager Session Manager and IAM roles, and move the database to a private subnet. Step 3, reliability: move MySQL to RDS Multi-AZ and put the web tier in an Auto Scaling group across two AZs behind an ALB. Step 4, performance: put CloudFront in front for images. Step 5, cost: use Savings Plans once usage is steady. Step 6, sustainability: Graviton instances give more work per watt. The highest risks are security and reliability, so fix those first.",
      },
      {
        title: "Spotting the pillar in exam wording",
        explanation: "Read each phrase and name the pillar before looking at answers. \"Reduce the time engineers spend patching servers\" is operational excellence, so prefer managed services. \"Ensure only the finance team can read the reports\" is security, so think IAM and bucket policies. \"The app must continue running if an Availability Zone becomes unavailable\" is reliability, so think multi-AZ. \"Users in Asia report slow page loads\" is performance, so think CloudFront. \"Reduce the monthly bill for a nightly batch job that can be interrupted\" is cost, so think Spot. Naming the pillar first narrows four answers to one or two.",
      },
    ],
    cheatSheet: [
      "Six pillars: operational excellence, security, reliability, performance, cost, sustainability",
      "Sustainability became the sixth pillar in December 2021",
      "Well-Architected Tool is free in the console; lenses add workload-specific questions",
      "Reviews produce high-risk and medium-risk issues plus an improvement plan",
      "Reliability keywords: multi-AZ, auto recovery, horizontal scaling, tested backups",
      "Operational excellence keywords: infrastructure as code, small reversible changes, runbooks",
      "Never trade away security to save cost; exam answers that do are almost always wrong",
    ],
    quiz: [
      {
        q: "Which design principle does \"scale with demand instead of buying for peak\" express?",
        options: ["Improve through game days", "Stop guessing capacity", "Test at production scale", "Keep people away from data"],
        answer: 1,
        why: "Elastic capacity removes the need to guess how much hardware you need.",
      },
      {
        q: "Which pillar includes \"make frequent, small, reversible changes\"?",
        options: ["Operational excellence", "Reliability", "Performance efficiency", "Security"],
        answer: 0,
        why: "Small reversible changes are an operational excellence practice that limits the impact of mistakes.",
      },
      {
        q: "What does the Well-Architected Tool produce after you answer the questions?",
        options: ["A compliance certificate", "A CloudFormation template", "A cost invoice", "A list of risks and an improvement plan"],
        answer: 3,
        why: "It flags high and medium risks and suggests improvements, ranked by risk.",
      },
      {
        q: "A question asks for the most cost-effective design that is highly available. Which answer fits best?",
        options: ["One large instance in one AZ", "Spot instances in one AZ", "A small Auto Scaling group across two AZs", "Dedicated hosts in three Regions"],
        answer: 2,
        why: "It is the cheapest option that still meets the high availability requirement.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write one sentence per pillar that explains it to a non-technical manager.",
        hint: "Use everyday outcomes: runs smoothly, safe, stays up, fast, cheap, green.",
        solution: "Operational excellence: we can change and run the system safely and quickly.\nSecurity: only the right people and systems can reach our data.\nReliability: it keeps working when parts fail and recovers by itself.\nPerformance efficiency: it stays fast as usage grows, using the right resources.\nCost optimization: we pay only for what delivers value.\nSustainability: we use as little energy and hardware as the job needs.",
      },
      {
        level: "medium",
        task: "Open the Well-Architected Tool in your lab account, define a workload for a simple two-tier web app, and answer the reliability pillar questions honestly.",
        hint: "You can mark questions as not applicable; aim to see what a high-risk issue looks like.",
        solution: "Console: Well-Architected Tool > Define workload.\nName: lab-web-app, environment: pre-production, Region: your lab Region.\nLens: AWS Well-Architected Framework.\nStart reviewing > Reliability; tick only practices you really follow.\nOpen the Improvement plan: note the high-risk issues (often backups,\nmulti-AZ and recovery testing) and save a milestone named baseline.",
      },
      {
        level: "hard",
        task: "A startup runs a single-AZ RDS instance and no backups to save money. Argue for a change using two pillars, and propose the cheapest fix that removes the high risk.",
        hint: "Separate \"we lose data\" from \"we have some downtime\"; they have different costs.",
        solution: "Reliability: no backups means a bad delete or corruption loses data forever.\nCost: losing customer data costs far more than storage for backups.\nCheapest fix: enable automated backups (7 days or more) and point-in-time recovery,\nwhich costs little for small databases.\nNext step when revenue allows: Multi-AZ to remove AZ downtime risk.\nRecord the remaining risk (single AZ) and the plan to fix it.",
      },
    ],
    faq: [
      { q: "Is the Well-Architected Framework only for AWS?", a: "It was written for AWS, but most ideas apply to any cloud. Azure and Google Cloud publish similar frameworks with comparable pillars." },
      { q: "Does a Well-Architected review cost money?", a: "The tool is free. Some AWS partners offer guided reviews, and AWS sometimes funds fixes found during partner-led reviews." },
      { q: "Which pillar matters most?", a: "It depends on the business, but security is treated as non-negotiable. The others are balanced against each other based on stated requirements." },
    ],
  },

  "aws-foundations/account-setup": {
    plain: [
      "Your first AWS account will be your lab for the whole course, so set it up safely. When you sign up, you create the root user: the email and password that own the account. Root can do everything, including closing the account. That is why you protect it with MFA and then stop using it.",
      "For daily work, create a separate admin identity. The modern way is IAM Identity Center, which gives you a sign-in page and short-lived keys that expire on their own. If a laptop is stolen, old keys stop working within hours. Long-lived access keys in a file never expire unless you delete them.",
      "Cloud bills grow quietly. A forgotten NAT gateway or load balancer costs money every hour. Since July 2025, new accounts get Free Tier credits and pick a free plan or a paid plan. Either way, add a budget alert from day one so you get an email long before a surprise.",
      "Finally, install the AWS CLI, the command-line tool for AWS. Clicking in the console is fine for learning, but the CLI lets you repeat labs, script clean-up and see exactly which API call does what. Most exam services feel clearer once you have called them yourself.",
    ],
    deepDive: [
      {
        heading: "Protecting the root user",
        body: "Enable MFA on root right after sign-up. A passkey or hardware security key is the strongest choice; an authenticator app is fine for a lab. You can register more than one MFA device, so add a backup. AWS now requires MFA on root for most accounts, so do it before you are forced to.\n\nNever create access keys for root. Store the password in a password manager and set alternate contacts for billing, operations and security.\n\nOnly a few tasks need root: changing the account email or root password, changing the support plan, closing the account, restoring an IAM admin who locked themselves out, and fixing an S3 bucket policy that denies everyone. In an Organization, administrators can even remove root credentials from member accounts entirely and perform those tasks centrally.",
        bullets: ["MFA on root, ideally a passkey or security key", "No root access keys, ever", "Root only for account-level tasks", "Set billing and security contacts"],
      },
      {
        heading: "Identity Center login for console and CLI",
        body: "IAM Identity Center lets you create a user, assign it the AdministratorAccess permission set in your account, and sign in through an access portal. Behind the scenes, each permission set becomes an IAM role, and every sign-in gets temporary credentials for that role.\n\nThe CLI uses the same login. aws configure sso stores a profile that points at your portal URL, account and permission set. aws sso login opens a browser, you approve, and the CLI caches a token. When the session expires, you simply log in again. No secret key ever sits in a file.\n\nIf you cannot use Identity Center, the fallback is an IAM user with MFA. Give it console access only, and create access keys only if a tool truly needs them.",
        visual: {
          type: "sequence",
          title: "What aws sso login does",
          actors: ["You", "AWS CLI", "Identity Center", "Your account"],
          messages: [
            { from: 0, to: 1, label: "aws sso login --profile lab" },
            { from: 1, to: 2, label: "Start browser authorization" },
            { from: 0, to: 2, label: "Sign in with MFA and approve" },
            { from: 2, to: 1, label: "Access token, cached locally" },
            { from: 1, to: 2, label: "Get role credentials for account" },
            { from: 2, to: 1, label: "Temporary keys for the role" },
            { from: 1, to: 3, label: "Signed API calls until expiry" },
          ],
        },
      },
      {
        heading: "Budgets and billing alarms",
        body: "AWS Budgets is the main tool. Create a monthly cost budget, for example 10 USD, with two alerts: one when forecasted spend passes 80 percent, and one when actual spend passes 100 percent. Alerts go to email or an SNS topic. Budgets can also track usage, Reserved Instance coverage and Savings Plans, and budget actions can apply a restrictive IAM policy or stop EC2 and RDS instances when a threshold is hit.\n\nA second safety net is a CloudWatch billing alarm. First turn on billing alerts in the Billing console preferences. Then create an alarm on the EstimatedCharges metric, which only exists in us-east-1.\n\nBilling data is not real time. It updates a few times a day, so a runaway resource can run for hours before an alert. That is why low thresholds and a clean-up habit matter.",
      },
      {
        heading: "How the CLI finds your credentials",
        body: "The CLI checks several places in a fixed order and uses the first credentials it finds. Command-line options win first, such as --profile or --region. Next come environment variables: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or AWS_PROFILE to pick a profile. Then the shared files: ~/.aws/config holds profiles, Regions and SSO settings, and ~/.aws/credentials holds static keys. Last come credentials from the environment the CLI runs in: a container role on ECS, or the instance profile role on EC2.\n\nThis order explains many surprises. An old AWS_ACCESS_KEY_ID left in your shell overrides your nice SSO profile. When in doubt, run aws sts get-caller-identity, which prints the account and ARN you are really using. Run aws configure list to see where each value came from.",
        visual: {
          type: "flow",
          title: "CLI credential lookup order",
          steps: [
            { label: "Command line", detail: "--profile and --region options." },
            { label: "Environment", detail: "AWS_ACCESS_KEY_ID or AWS_PROFILE." },
            { label: "Config files", detail: "SSO, role or key profiles in ~/.aws." },
            { label: "Container role", detail: "Task role on ECS." },
            { label: "Instance profile", detail: "Role attached to the EC2 instance." },
          ],
        },
      },
      {
        heading: "Cleaning up so labs stay cheap",
        body: "Some resources cost money even when idle. NAT gateways and load balancers bill per hour. Every public IPv4 address costs about 0.005 USD per hour, including Elastic IPs that are not attached to anything. EBS volumes and snapshots stay after you terminate an instance unless they were set to delete. RDS instances, interface VPC endpoints and CloudWatch log groups with long retention also add up.\n\nTag every lab resource, for example project=lab, and delete by tag at the end of each session. The Tag Editor in Resource Groups searches all Regions for a tag. Cost Explorer grouped by service shows what is costing money, and the Free Tier page shows how much of your credits or free usage is left.",
        bullets: ["NAT gateways and load balancers bill hourly", "Idle public IPv4 addresses are billed too", "Check EBS volumes and snapshots after labs", "Tag everything and clean up by tag"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Safety nets in a lab account",
        layers: [
          { label: "Root user", detail: "MFA on, no access keys, locked away." },
          { label: "Admin identity", detail: "Identity Center user with short-lived credentials." },
          { label: "Budget alerts", detail: "Forecast and actual thresholds by email." },
          { label: "Billing alarm", detail: "CloudWatch EstimatedCharges in us-east-1." },
          { label: "Clean-up habit", detail: "Tag resources and delete after each lab." },
        ],
      },
    ],
    examples: [
      {
        title: "A 10 USD budget with two alerts from the CLI",
        explanation: "Step 1: find your account ID with aws sts get-caller-identity. Step 2: create a monthly cost budget of 10 USD. Step 3: attach a forecasted alert at 80 percent, so you hear early if the month is heading over. Step 4: check the inbox for the subscription email. You can add an actual-spend alert at 100 percent the same way, by adding a second object to the notifications list.",
        code: {
          lang: "bash",
          code: "ACCT=$(aws sts get-caller-identity --query Account --output text)\naws budgets create-budget --account-id \"$ACCT\" \\\n  --budget '{\"BudgetName\":\"lab-monthly\",\n    \"BudgetLimit\":{\"Amount\":\"10\",\"Unit\":\"USD\"},\n    \"TimeUnit\":\"MONTHLY\",\"BudgetType\":\"COST\"}' \\\n  --notifications-with-subscribers '[{\n    \"Notification\":{\"NotificationType\":\"FORECASTED\",\n      \"ComparisonOperator\":\"GREATER_THAN\",\n      \"Threshold\":80,\"ThresholdType\":\"PERCENTAGE\"},\n    \"Subscribers\":[{\"SubscriptionType\":\"EMAIL\",\n      \"Address\":\"me@example.com\"}]}]'",
        },
      },
      {
        title: "Fixing \"wrong account\" in the CLI",
        explanation: "You logged in with SSO, but aws s3 ls shows buckets from an old job. Step 1: run aws sts get-caller-identity; it shows an IAM user ARN from another account. Step 2: run aws configure list; the access_key line says its source is env, so environment variables are winning over your profile. Step 3: unset those variables. Step 4: set AWS_PROFILE=lab and check again. The identity now shows a role named AWSReservedSSO_AdministratorAccess_ followed by a random suffix, which is your Identity Center session.",
        code: {
          lang: "bash",
          code: "aws sts get-caller-identity\naws configure list          # shows where each value comes from\nunset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN\nexport AWS_PROFILE=lab\naws sso login\naws sts get-caller-identity # now the SSO role in the lab account",
        },
      },
    ],
    cheatSheet: [
      "Root: MFA on, no access keys, use only for account-level tasks",
      "aws configure sso then aws sso login --profile lab for short-lived credentials",
      "aws sts get-caller-identity shows which account and identity you are really using",
      "aws configure list shows where each credential and Region value came from",
      "Billing alarm metric: AWS/Billing EstimatedCharges, only in us-east-1, after enabling alerts",
      "Budgets support forecasted and actual alerts, plus actions that stop instances",
      "Idle NAT gateways, load balancers and public IPv4 addresses all bill by the hour",
      "Tag lab resources project=lab and use Tag Editor to find them across Regions",
    ],
    quiz: [
      {
        q: "Which task requires the root user?",
        options: ["Launching an EC2 instance", "Creating an IAM role", "Changing the account's support plan", "Creating an S3 bucket"],
        answer: 2,
        why: "Account-level settings like the support plan, root email and account closure need root.",
      },
      {
        q: "Your SSO profile is set, but the CLI uses an old IAM user. What is the most likely cause?",
        options: ["Access key environment variables override the profile", "SSO tokens never work with S3", "The Region is wrong", "Root MFA is not enabled"],
        answer: 0,
        why: "Environment variables come before the shared config files in the credential order.",
      },
      {
        q: "In which Region do you create a CloudWatch billing alarm?",
        options: ["Your lab Region", "Any Region", "eu-west-1", "us-east-1"],
        answer: 3,
        why: "The EstimatedCharges billing metric is only published in us-east-1.",
      },
      {
        q: "Which alert type warns you before the money is actually spent?",
        options: ["A CloudTrail event", "A forecasted budget alert", "An actual cost alert at 100%", "A Trusted Advisor check"],
        answer: 1,
        why: "Forecasted alerts fire when the projected month-end spend crosses the threshold.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install AWS CLI v2, configure an SSO profile called lab, and confirm your identity.",
        hint: "You need your access portal URL from the Identity Center console.",
        solution: "aws --version                 # should show aws-cli/2.x\naws configure sso --profile lab\n# enter portal start URL, SSO Region, choose account and AdministratorAccess\naws sso login --profile lab\naws sts get-caller-identity --profile lab",
      },
      {
        level: "medium",
        task: "Create a CloudWatch billing alarm that emails you when estimated charges pass 20 USD.",
        hint: "Enable billing alerts in Billing preferences first, then use an SNS topic in us-east-1.",
        solution: "T=$(aws sns create-topic --name billing-alerts --region us-east-1 \\\n  --query TopicArn --output text)\naws sns subscribe --topic-arn \"$T\" --protocol email \\\n  --notification-endpoint me@example.com --region us-east-1\naws cloudwatch put-metric-alarm --region us-east-1 --alarm-name bill-over-20 \\\n  --namespace AWS/Billing --metric-name EstimatedCharges \\\n  --dimensions Name=Currency,Value=USD --statistic Maximum \\\n  --period 21600 --evaluation-periods 1 --threshold 20 \\\n  --comparison-operator GreaterThanThreshold --alarm-actions \"$T\"",
      },
      {
        level: "hard",
        task: "Write a short script that lists every resource tagged project=lab in your lab Region, so you can review it before deleting.",
        hint: "The Resource Groups Tagging API can filter by tag across services.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nREGION=${1:-us-east-1}\naws resourcegroupstaggingapi get-resources --region \"$REGION\" \\\n  --tag-filters Key=project,Values=lab \\\n  --query \"ResourceTagMappingList[].ResourceARN\" --output text | tr '\\t' '\\n'\n# Review the ARNs, then delete each with its own service command.",
      },
    ],
    faq: [
      { q: "Is the AWS Free Tier really free?", a: "Free plan accounts use credits and cannot run up charges beyond them. On a paid plan, anything beyond the credits and free allowances is billed, so a budget alert is essential." },
      { q: "Should I use IAM Identity Center or an IAM user for my lab?", a: "Identity Center, if you can. It gives short-lived credentials for both console and CLI. An IAM user with MFA is an acceptable fallback." },
      { q: "I lost my root MFA device. What now?", a: "Use your backup MFA device if you registered one. Otherwise, use the sign-in page's troubleshooting option, which verifies you through the account email and phone number." },
      { q: "Can AWS stop my resources automatically when I hit my budget?", a: "Yes. Budget actions can apply an IAM or SCP policy or stop specific EC2 and RDS instances when a threshold is reached, though billing data can lag by hours." },
    ],
  },
};

export default extra;
