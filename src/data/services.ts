export type Service = {
  slug: string;
  title: string;
  short: string;
  homeTitle: string;
  summary: string;
  points: string[];
  tags: string[];
};

export const services: Service[] = [
  {
    slug: "web",
    title: "Website Development",
    homeTitle: "Website Development",
    short: "Fast, modern business sites and web apps built with Next.js.",
    summary: "Company sites, landing pages, web apps and dashboards that load fast and look right on every screen.",
    points: ["Next.js and React, SEO-ready", "Contact forms, logins, payments and CMS", "Database-backed apps with PostgreSQL"],
    tags: ["Next.js", "PostgreSQL", "Node.js"],
  },
  {
    slug: "mobile",
    title: "Mobile App Development",
    homeTitle: "Mobile App Development",
    short: "Android apps from idea to Play Store or direct install.",
    summary: "Android apps built to feel instant, with the reminders and offline behaviour people expect.",
    points: ["Offline-first with background sync", "Notifications, widgets and share targets", "Google Play release or direct APK"],
    tags: ["Android", "Offline sync", "Push reminders"],
  },
  {
    slug: "desktop",
    title: "Windows and Linux Applications",
    homeTitle: "Windows and Linux Apps",
    short: "Desktop software with tray icons, offline mode and installers.",
    summary: "Desktop software that fits the platform: tray icons, global shortcuts and clean installers.",
    points: ["Windows 10 and 11 installers", "Linux packages (.deb and .rpm)", "Offline mode with sync when online"],
    tags: ["Windows", "Linux", "Desktop"],
  },
  {
    slug: "cloud",
    title: "Cloud Management",
    homeTitle: "Cloud Management",
    short: "Setup, migration, cost control and monitoring on Azure and AWS.",
    summary: "We set up, move and look after your cloud so costs stay predictable and nothing surprises you.",
    points: ["Azure, AWS and Google Cloud", "Migrations with a rollback plan", "Cost reviews, monitoring and alerts"],
    tags: ["Azure", "AWS", "Google Cloud"],
  },
  {
    slug: "servers",
    title: "Servers and Linux Administration",
    homeTitle: "Servers and Linux",
    short: "Hardened Linux servers, Docker, databases and backups.",
    summary: "Your own servers, set up properly: secured, backed up and easy to hand over.",
    points: ["Ubuntu and Debian server setup", "Docker, reverse proxy and SSL", "Databases and automated backups"],
    tags: ["Linux", "Docker", "PostgreSQL"],
  },
  {
    slug: "support",
    title: "Support and Maintenance",
    homeTitle: "Support and Maintenance",
    short: "Updates, fixes and monitoring so what we ship keeps running.",
    summary: "A real person who answers. We fix, update and watch your systems after launch.",
    points: ["Bug fixes and security updates", "Uptime monitoring and alerts", "Monthly or on-demand plans"],
    tags: ["Monitoring", "Updates", "Helpdesk"],
  },
  {
    slug: "consulting",
    title: "IT Consulting",
    homeTitle: "IT Consulting",
    short: "Architecture reviews, tooling choices and technical roadmaps.",
    summary: "Straight advice before you spend: what to build, what to buy and what to skip.",
    points: ["Architecture and code reviews", "Tool and vendor selection", "Technical roadmaps and estimates"],
    tags: ["Architecture", "Security review", "Roadmap"],
  },
  {
    slug: "automation",
    title: "Automation and Integrations",
    homeTitle: "Automation",
    short: "Workflows and integrations that remove repetitive work.",
    summary: "Connect the tools you already use and remove the copy-paste work between them.",
    points: ["Workflow automation and scheduled reports", "API and webhook integrations", "Email, spreadsheet and document pipelines"],
    tags: ["APIs", "Webhooks", "Workflows"],
  },
];

export const engagements = [
  { title: "Fixed project", body: "A clear scope, timeline and price agreed up front. Best for a website, an app or a migration.", featured: false },
  { title: "Monthly retainer", body: "A set number of hours each month for support, new features and server care.", featured: true },
  { title: "Consulting hours", body: "Book time with an engineer for a review, a second opinion or a one-off fix.", featured: false },
];

export const serviceOptions = [
  "Website development",
  "Mobile app development",
  "Windows or Linux application",
  "Cloud management",
  "Servers and Linux",
  "Support and maintenance",
  "IT consulting",
  "Automation",
  "Something else",
];
