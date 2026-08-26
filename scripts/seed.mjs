import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || MONGODB_URI.includes("<db_username>")) {
  console.error("MONGODB_URI is missing or still has a <db_username> placeholder. Fix .env.local first.");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ADMIN_EMAIL / ADMIN_PASSWORD are missing from .env.local.");
  process.exit(1);
}

const { Schema, model } = mongoose;

const Admin = model("Admin", new Schema({
  email: String, passwordHash: String, name: String, role: String, isSuperAdmin: Boolean, disabled: Boolean,
}, { timestamps: true }), "admins");

const SiteSettings = model("SiteSettings", new Schema({}, { strict: false, timestamps: true }), "site_settings");
const Hero = model("Hero", new Schema({}, { strict: false, timestamps: true }), "hero");
const About = model("About", new Schema({}, { strict: false, timestamps: true }), "about");
const Service = model("Service", new Schema({}, { strict: false, timestamps: true }), "services");
const Product = model("Product", new Schema({}, { strict: false, timestamps: true }), "products");
const TeamMember = model("TeamMember", new Schema({}, { strict: false, timestamps: true }), "team_members");
const Testimonial = model("Testimonial", new Schema({}, { strict: false, timestamps: true }), "testimonials");
const JobPosting = model("JobPosting", new Schema({}, { strict: false, timestamps: true }), "job_postings");

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    { email: ADMIN_EMAIL.toLowerCase(), passwordHash, name: "Admin", role: "admin", isSuperAdmin: true, disabled: false },
    { upsert: true }
  );
  console.log(`Super admin ready: ${ADMIN_EMAIL}`);
}

async function seedSiteSettings() {
  await SiteSettings.findOneAndUpdate(
    { singleton: "main" },
    {
      singleton: "main",
      siteName: "Invicly Technologies",
      tagline: "Engineering Tomorrow's Technology, Today",
      logoUrl: "",
      email: "hello@invictechnologies.com",
      phone: "+1 (555) 013-4477",
      address: "4th Floor, Skyline Business Park, Baner, Pune, Maharashtra, India",
      socials: {
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        github: "https://github.com",
        instagram: "https://instagram.com",
      },
      seoDescription:
        "Invicly Technologies builds software, cloud, and AI solutions that help businesses move faster.",
    },
    { upsert: true }
  );
  console.log("Site settings seeded");
}

async function seedHero() {
  await Hero.findOneAndUpdate(
    { singleton: "main" },
    {
      singleton: "main",
      eyebrow: "Software · Cloud · AI",
      headline: "We build technology that moves your business forward",
      subheadline:
        "Invicly Technologies partners with ambitious companies to design, engineer, and ship software, cloud platforms, and AI-driven products.",
      ctaText: "Start a project",
      ctaLink: "/contact",
      secondaryCtaText: "Explore services",
      secondaryCtaLink: "/services",
      backgroundImageUrl:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop",
    },
    { upsert: true }
  );
  console.log("Hero seeded");
}

async function seedAbout() {
  await About.findOneAndUpdate(
    { singleton: "main" },
    {
      singleton: "main",
      story:
        "Invicly Technologies was founded to help growing companies build reliable software without the overhead of hiring a full in-house engineering team. What started as a small group of engineers solving one client's cloud migration has grown into a full-service technology partner working across product engineering, cloud infrastructure, and applied AI. Today we work with startups and established businesses alike, shipping products that scale.",
      mission: "To help businesses of every size build and scale technology that actually works.",
      vision:
        "A world where great software is accessible to every ambitious company, not just the ones with the biggest budgets.",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop",
      values: [
        { title: "Craftsmanship", description: "We sweat the details others skip.", icon: "Gem" },
        { title: "Transparency", description: "Clear timelines, clear pricing, clear communication.", icon: "Eye" },
        { title: "Ownership", description: "We treat every project like it's our own product.", icon: "ShieldCheck" },
        { title: "Velocity", description: "We ship fast without cutting corners on quality.", icon: "Rocket" },
      ],
      stats: [
        { label: "Years in business", value: "6+" },
        { label: "Projects delivered", value: "120+" },
        { label: "Happy clients", value: "80+" },
        { label: "Team members", value: "35+" },
      ],
    },
    { upsert: true }
  );
  console.log("About seeded");
}

const SERVICES = [
  {
    title: "Software Development",
    slug: "software-development",
    icon: "Code2",
    shortDescription: "Custom web and mobile applications engineered for reliability and growth.",
    fullDescription:
      "We design and build custom software across web and mobile — from customer-facing products to internal tools. Our team works in modern, well-supported stacks and ships in short iterative cycles so you see progress every week, not just at the end of the project.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop",
    features: ["Web & mobile app development", "API design & integration", "Legacy system modernization", "Ongoing maintenance & support"],
    order: 1,
    featured: true,
  },
  {
    title: "Cloud & DevOps Solutions",
    slug: "cloud-devops-solutions",
    icon: "Cloud",
    shortDescription: "Cloud architecture, migration, and CI/CD pipelines that scale with you.",
    fullDescription:
      "Whether you're moving to the cloud for the first time or optimizing an existing setup, we design infrastructure that's secure, cost-efficient, and easy to operate. We set up CI/CD pipelines, infrastructure as code, and monitoring so your team can ship confidently.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop",
    features: ["Cloud migration (AWS, Azure, GCP)", "CI/CD pipeline setup", "Infrastructure as code", "Cost optimization & monitoring"],
    order: 2,
    featured: true,
  },
  {
    title: "AI & Machine Learning",
    slug: "ai-machine-learning",
    icon: "BrainCircuit",
    shortDescription: "Practical AI features and ML pipelines that solve real business problems.",
    fullDescription:
      "We help teams go from an AI idea to a production feature — recommendation engines, document intelligence, forecasting, and LLM-powered assistants. We focus on models that are explainable, monitored, and maintainable, not just impressive demos.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1600&auto=format&fit=crop",
    features: ["LLM-powered features & chatbots", "Predictive analytics", "Document & data intelligence", "MLOps & model monitoring"],
    order: 3,
    featured: true,
  },
  {
    title: "Cybersecurity Services",
    slug: "cybersecurity-services",
    icon: "ShieldCheck",
    shortDescription: "Security audits, penetration testing, and hardening for modern applications.",
    fullDescription:
      "We help you find and fix security gaps before attackers do. From application security reviews to infrastructure hardening and compliance readiness, our security engineers work alongside your team to build a durable security posture.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop",
    features: ["Penetration testing", "Security audits & code review", "Compliance readiness (SOC 2, ISO 27001)", "Incident response planning"],
    order: 4,
    featured: false,
  },
  {
    title: "IT Consulting & Strategy",
    slug: "it-consulting-strategy",
    icon: "Compass",
    shortDescription: "Technology roadmaps and architecture guidance for confident decisions.",
    fullDescription:
      "Not sure which technology direction to take? Our senior architects assess your current systems and business goals to deliver a clear, actionable roadmap — covering build-vs-buy decisions, technical debt, team structure, and tooling.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop",
    features: ["Technology roadmaps", "Architecture reviews", "Vendor & tool selection", "Technical due diligence"],
    order: 5,
    featured: false,
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    icon: "PenTool",
    shortDescription: "Interfaces that are as delightful to use as they are easy to build.",
    fullDescription:
      "Good design isn't decoration — it's how your product earns trust. We research, wireframe, and design interfaces with your engineering constraints in mind, delivering design systems your team can actually implement and maintain.",
    imageUrl: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?q=80&w=1600&auto=format&fit=crop",
    features: ["Product design & prototyping", "Design systems", "User research", "Usability testing"],
    order: 6,
    featured: false,
  },
];

const PRODUCTS = [
  {
    title: "InviclyCRM",
    slug: "invicly-crm",
    category: "Sales & CRM",
    description: "A smart CRM suite that helps sales teams track deals, automate follow-ups, and close faster.",
    fullDescription:
      "InviclyCRM brings pipeline management, contact tracking, and automated follow-up sequences into one clean workspace. Built for small and mid-sized sales teams who've outgrown spreadsheets but don't want the bloat of enterprise CRM software.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
    features: ["Visual pipeline & deal tracking", "Automated follow-up sequences", "Team performance dashboards", "Email & calendar sync"],
    priceLabel: "From $49/user/mo",
    order: 1,
    featured: true,
  },
  {
    title: "InviclyCloud",
    slug: "invicly-cloud",
    category: "Cloud Platform",
    description: "A unified dashboard to monitor cost, performance, and security across your cloud infrastructure.",
    fullDescription:
      "InviclyCloud connects to your AWS, Azure, or GCP accounts and gives you one dashboard for cost tracking, anomaly alerts, and security posture — so your team spends less time context-switching between provider consoles.",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1600&auto=format&fit=crop",
    features: ["Multi-cloud cost tracking", "Anomaly & budget alerts", "Security posture scoring", "Team access controls"],
    priceLabel: "Contact for pricing",
    order: 2,
    featured: true,
  },
  {
    title: "InviclyGuard",
    slug: "invicly-guard",
    category: "Security",
    description: "Continuous security monitoring that flags vulnerabilities before they become incidents.",
    fullDescription:
      "InviclyGuard continuously scans your applications and infrastructure for vulnerabilities, misconfigurations, and exposed secrets, sending prioritized alerts your team can act on immediately.",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1600&auto=format&fit=crop",
    features: ["Continuous vulnerability scanning", "Secret & misconfiguration detection", "Prioritized alerting", "Compliance reporting"],
    priceLabel: "From $199/mo",
    order: 3,
    featured: true,
  },
  {
    title: "InviclyDesk",
    slug: "invicly-desk",
    category: "Customer Support",
    description: "A lightweight helpdesk that keeps support tickets, chat, and knowledge base in one place.",
    fullDescription:
      "InviclyDesk gives growing support teams shared inboxes, a searchable knowledge base, and simple automation rules — without the setup overhead of larger helpdesk platforms.",
    imageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop",
    features: ["Shared team inbox", "Knowledge base builder", "Automation rules", "Customer satisfaction surveys"],
    priceLabel: "From $29/user/mo",
    order: 4,
    featured: false,
  },
];

const TEAM = [
  {
    name: "Ananya Rao",
    role: "Co-founder & CEO",
    bio: "15 years leading engineering teams before starting Invicly to help companies ship better software.",
    photoUrl: "https://i.pravatar.cc/300?img=47",
    linkedin: "https://linkedin.com",
    order: 1,
  },
  {
    name: "Karan Mehta",
    role: "Co-founder & CTO",
    bio: "Full-stack architect obsessed with clean systems and developer experience.",
    photoUrl: "https://i.pravatar.cc/300?img=12",
    linkedin: "https://linkedin.com",
    order: 2,
  },
  {
    name: "Sara Iyer",
    role: "Head of Design",
    bio: "Leads product design with a focus on simplicity and accessibility.",
    photoUrl: "https://i.pravatar.cc/300?img=32",
    linkedin: "https://linkedin.com",
    order: 3,
  },
  {
    name: "Devraj Singh",
    role: "Lead Cloud Engineer",
    bio: "Specializes in cloud architecture and infrastructure automation at scale.",
    photoUrl: "https://i.pravatar.cc/300?img=51",
    linkedin: "https://linkedin.com",
    order: 4,
  },
];

const TESTIMONIALS = [
  {
    clientName: "Rahul Mehta",
    company: "Northwind Retail",
    quote: "Invicly rebuilt our checkout flow in six weeks and conversion went up 22% the same month. They actually understand business impact, not just code.",
    avatarUrl: "https://i.pravatar.cc/300?img=15",
    rating: 5,
    order: 1,
  },
  {
    clientName: "Priya Nair",
    company: "Fintrack Labs",
    quote: "Our AWS bill dropped by a third after their cloud audit, and deployments that used to take hours now take minutes.",
    avatarUrl: "https://i.pravatar.cc/300?img=24",
    rating: 5,
    order: 2,
  },
  {
    clientName: "James Whitfield",
    company: "Harbor Logistics",
    quote: "Clear communication from day one. They flagged risks early instead of surprising us at launch — rare in this industry.",
    avatarUrl: "https://i.pravatar.cc/300?img=8",
    rating: 5,
    order: 3,
  },
  {
    clientName: "Meera Iyengar",
    company: "Bloom Health",
    quote: "The AI triage feature they built now handles 40% of our support volume automatically. Genuinely changed how we operate.",
    avatarUrl: "https://i.pravatar.cc/300?img=45",
    rating: 5,
    order: 4,
  },
];

const JOB_POSTINGS = [
  {
    title: "Frontend Engineer",
    slug: "frontend-engineer",
    department: "Engineering",
    location: "Pune, India (Hybrid)",
    type: "full-time",
    description:
      "We're looking for a Frontend Engineer to help build polished, performant interfaces for our client products. You'll work closely with design and backend engineers across the full product lifecycle.",
    responsibilities: [
      "Build and maintain React/Next.js interfaces for client projects",
      "Collaborate with designers to implement pixel-accurate, accessible UI",
      "Write clean, tested, maintainable code",
    ],
    requirements: [
      "2+ years of experience with React or a similar framework",
      "Strong CSS/Tailwind skills",
      "Comfortable working directly with clients",
    ],
    status: "open",
    order: 1,
  },
  {
    title: "Cloud Engineer",
    slug: "cloud-engineer",
    department: "Engineering",
    location: "Remote",
    type: "full-time",
    description:
      "Join our cloud team to design and operate infrastructure for client workloads on AWS, Azure, and GCP — from migrations to CI/CD to cost optimization.",
    responsibilities: [
      "Design and implement cloud infrastructure using IaC",
      "Build and maintain CI/CD pipelines",
      "Monitor and optimize cloud spend and performance",
    ],
    requirements: [
      "Experience with at least one major cloud provider",
      "Familiarity with Terraform or similar IaC tools",
      "Solid Linux and networking fundamentals",
    ],
    status: "open",
    order: 2,
  },
  {
    title: "Software Engineering Intern",
    slug: "software-engineering-intern",
    department: "Engineering",
    location: "Pune, India",
    type: "internship",
    description:
      "A 6-month internship for students who want real-world experience shipping production software alongside our engineering team.",
    responsibilities: [
      "Work on real client-facing features under senior engineer mentorship",
      "Participate in code reviews and team planning",
      "Learn our full engineering workflow, from spec to deployment",
    ],
    requirements: [
      "Currently pursuing a degree in CS or related field",
      "Basic knowledge of JavaScript and web fundamentals",
      "Eager to learn and take feedback well",
    ],
    status: "open",
    order: 3,
  },
];

async function seedCollection(Model, items, key) {
  for (const item of items) {
    const filter = key ? { [key]: item[key] } : item;
    await Model.findOneAndUpdate(filter, item, { upsert: true });
  }
  console.log(`${Model.collection.name}: ${items.length} seeded`);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await seedAdmin();
  await seedSiteSettings();
  await seedHero();
  await seedAbout();
  await seedCollection(Service, SERVICES, "slug");
  await seedCollection(Product, PRODUCTS, "slug");
  await seedCollection(TeamMember, TEAM, "name");
  await seedCollection(Testimonial, TESTIMONIALS, "clientName");
  await seedCollection(JobPosting, JOB_POSTINGS, "slug");

  console.log("\nSeed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
