export type ProductSlug = "flow" | "spendly" | "kivo" | "unreel";

export type Product = {
  slug: ProductSlug;
  name: string;
  category: string;
  tagline: string;
  /** Hero heading split in two lines; the second is blue. */
  heroLines: [string, string];
  heroText: string;
  cardText: string;
  listText: string;
  platforms: string[];
  platformLabel: string;
  pills: string[];
  url: string;
  linkLabel: string;
  status: string;
  accent: string;
  /** Show "Coming soon on Google Play". Set playStoreUrl to show the real badge. */
  googlePlaySoon: boolean;
  playStoreUrl?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  highlight: { eyebrow: string; title: string; body: string; rows: { token: string; text: string }[] };
  features: { title: string; body: string }[];
  platformsSection: { eyebrow: string; title: string; items: { name: string; body: string; href: string; cta: string; soon?: boolean }[] };
  cta: { title: string; body: string; label: string; href: string };
};

export const products: Product[] = [
  {
    slug: "flow",
    name: "Flow",
    category: "Tasks and projects",
    tagline: "Plan your day. Ship your projects.",
    heroLines: ["Plan your day.", "Ship your projects."],
    heroText: "Add tasks right where they belong, see your day at a glance and keep your team moving, without the bloat.",
    cardText: "Plan your day, ship your projects. A light task and project manager with daily goals and team sprints.",
    listText:
      "A light task and project manager. Type a task the way you think and Flow picks out the date, priority and project. Daily goals keep streaks, and team workspaces add boards and sprints.",
    platforms: ["Web", "Windows", "Linux", "Android"],
    platformLabel: "WEB · WINDOWS · LINUX · ANDROID",
    pills: ["Web", "Windows", "Linux", "Android"],
    url: "https://flow.invicly.com/",
    linkLabel: "Open Flow",
    status: "Free",
    accent: "#3D9BFF",
    googlePlaySoon: true,
    primaryCta: { label: "Get started free", href: "https://flow.invicly.com/signup" },
    secondaryCta: { label: "Download the apps", href: "https://flow.invicly.com/download" },
    highlight: {
      eyebrow: "CAPTURE",
      title: "Add a task in one line.",
      body: "Type the way you think. Flow picks out the date, priority, project and labels as you type and shows them as chips. Prefer tapping? Every chip is a picker.",
      rows: [
        { token: "@Project", text: "Files it in a project, by name or key" },
        { token: "#label", text: "Adds a label, as many as you like" },
        { token: "p1 · p2 · p3", text: "Sets the priority" },
        { token: "tomorrow · fri", text: "Sets the due date" },
        { token: "every mon at 7am", text: "Repeats, with a reminder" },
      ],
    },
    features: [
      { title: "Daily goals with streaks", body: "Read 20 pages, drink 8 glasses of water. Tick or count, and Flow keeps the streak and history." },
      { title: "Plan the week", body: "A workload bar per day shows an overloaded Thursday early. Drag tasks to reschedule." },
      { title: "Team projects", body: "Boards, sprints, issue keys and burndown reports. Jira-style planning without the weight." },
      { title: "Weekly review", body: "Every Sunday: what got done, what slipped and next week's load." },
      { title: "Works offline", body: "Android, Linux and Windows keep a copy on the device and sync when you are back online." },
      { title: "Built for the keyboard", body: "Q to add, Ctrl K for the command palette, and a shortcut for everything else." },
    ],
    platformsSection: {
      eyebrow: "ONE ACCOUNT, EVERY DEVICE",
      title: "Your tasks follow you.",
      items: [
        { name: "Web", body: "Any modern browser. Install it from the address bar.", href: "https://flow.invicly.com/app", cta: "Open Flow" },
        { name: "Linux", body: ".deb and .rpm packages with a tray icon and Quick Add.", href: "https://flow.invicly.com/download", cta: "Get it" },
        { name: "Windows", body: "Windows 10 and 11 with offline work. Preview build.", href: "https://flow.invicly.com/download", cta: "Download" },
        { name: "Android", body: "Native app with widgets and reminders that work offline.", href: "https://flow.invicly.com/download", cta: "Download APK", soon: true },
      ],
    },
    cta: { title: "Start your first calm day.", body: "Free while in preview. No credit card.", label: "Get started free", href: "https://flow.invicly.com/signup" },
  },
  {
    slug: "spendly",
    name: "Spendly",
    category: "Personal finance",
    tagline: "Know what you spend. Never miss what you owe.",
    heroLines: ["Know what you spend.", "Never miss what you owe."],
    heroText: "Add expenses by typing them, track card dues, loans and EMIs, and get a reminder before anything is due.",
    cardText: "Know what you spend, never miss what you owe. Expenses, card dues, loans and EMI reminders.",
    listText:
      "Add expenses by typing them, track card dues, loans and EMIs, and get a reminder before anything is due. It only records. It never asks for bank logins or moves money.",
    platforms: ["Android", "Web"],
    platformLabel: "ANDROID · WEB",
    pills: ["Android", "Web", "English · Hindi · Hinglish"],
    url: "https://spendly.invicly.com/",
    linkLabel: "Open Spendly",
    status: "Free",
    accent: "#34D399",
    googlePlaySoon: true,
    primaryCta: { label: "Open Spendly", href: "https://spendly.invicly.com/" },
    highlight: {
      eyebrow: "CAPTURE",
      title: "Type it like a message.",
      body: "Write an expense the way you would text a friend, in English, Hindi or Hinglish. Spendly picks out the amount, the category and how you paid.",
      rows: [
        { token: "swiggy 450 upi", text: "₹450 to Food, paid by UPI" },
        { token: "amount", text: "Any number in the line becomes the amount" },
        { token: "category", text: "Guessed from the merchant or the words you use" },
        { token: "upi · card · cash", text: "Records how you paid" },
      ],
    },
    features: [
      { title: "Credit card dues", body: "Track each card's statement and due date, and get reminded before it is due." },
      { title: "Loans and EMIs", body: "See every EMI, what is left to pay and when the next one lands." },
      { title: "Bills and subscriptions", body: "Recurring bills and subscriptions in one list, so nothing renews by surprise." },
      { title: "Budgets and reports", body: "Set a budget per category and see where the month went." },
      { title: "Works offline", body: "Add expenses with no signal. The app syncs with the web when you are back online." },
      { title: "Records only", body: "Spendly never asks for bank logins and never moves money." },
    ],
    platformsSection: {
      eyebrow: "PHONE AND BROWSER",
      title: "Your money, in one place.",
      items: [
        { name: "Android", body: "Fast entry, reminders and offline use.", href: "https://spendly.invicly.com/", cta: "Get it", soon: true },
        { name: "Web", body: "The same data on a bigger screen, synced with your phone.", href: "https://spendly.invicly.com/", cta: "Open Spendly" },
      ],
    },
    cta: { title: "Know where the money goes.", body: "Free to use. No bank logins.", label: "Open Spendly", href: "https://spendly.invicly.com/" },
  },
  {
    slug: "kivo",
    name: "Kivo",
    category: "Time tracking · Self-hosted",
    tagline: "Your time data stays on your servers.",
    heroLines: ["Your time data stays", "on your servers."],
    heroText: "Self-hosted time tracking for teams. Track, review, bill and report in one place, on infrastructure you control.",
    cardText: "Time tracking that stays on your own servers. Timesheets, approvals, invoices and reports.",
    listText:
      "Track, review, bill and report in one place. Run Kivo with Docker on your own infrastructure. Kivo Control manages your license and installations and never sees your time entries.",
    platforms: ["Self-hosted (Docker)"],
    platformLabel: "SELF-HOSTED · DOCKER",
    pills: ["Docker", "Unlimited users", "Free key available"],
    url: "https://kivo-control.invicly.com/",
    linkLabel: "Open Kivo",
    status: "Free key available",
    accent: "#A78BFA",
    googlePlaySoon: false,
    primaryCta: { label: "Open Kivo Control", href: "https://kivo-control.invicly.com/" },
    highlight: {
      eyebrow: "SELF-HOSTED",
      title: "Your server. Your data.",
      body: "Kivo runs with Docker on your own infrastructure. Kivo Control only manages your license and installations. It never sees your time entries.",
      rows: [
        { token: "docker", text: "Run it on your own server" },
        { token: "license", text: "Managed in Kivo Control, free key available" },
        { token: "users", text: "Unlimited users" },
        { token: "sso · api", text: "Single sign-on and a REST API" },
      ],
    },
    features: [
      { title: "Timer and timesheets", body: "Start a timer or fill in a timesheet, per project and task." },
      { title: "Projects and approvals", body: "Managers review and approve time before it is billed." },
      { title: "Invoices", body: "Turn approved time into invoices." },
      { title: "Leave and attendance", body: "Leave requests and attendance next to the hours." },
      { title: "REST API and SSO", body: "Connect your own tools and sign in with your identity provider." },
      { title: "Unlimited users", body: "Add the whole team without per-seat pricing." },
    ],
    platformsSection: {
      eyebrow: "HOW IT RUNS",
      title: "Deploy it where you want.",
      items: [
        { name: "Docker", body: "Run Kivo on any server that runs Docker.", href: "https://kivo-control.invicly.com/", cta: "Get started" },
        { name: "Kivo Control", body: "Manage licenses and installations. Never sees your time data.", href: "https://kivo-control.invicly.com/", cta: "Open Kivo Control" },
      ],
    },
    cta: { title: "Keep your time data at home.", body: "Self-hosted, unlimited users. Free key available.", label: "Open Kivo Control", href: "https://kivo-control.invicly.com/" },
  },
  {
    slug: "unreel",
    name: "Unreel",
    category: "Digital wellbeing",
    tagline: "Count it. Cap it. Unreel.",
    heroLines: ["Count it. Cap it.", "Unreel."],
    heroText: "Unreel counts the Instagram Reels and YouTube Shorts you scroll, with a plant called Sprout that wilts as the count climbs.",
    cardText: "Count it. Cap it. Counts the Reels and Shorts you scroll, with a plant that wilts as the count climbs.",
    listText:
      "Unreel counts the Instagram Reels and YouTube Shorts you scroll. Meet Sprout, a small plant that wilts as the count climbs. Set a daily limit and Unreel stops the feed for you. No accounts, no servers, works offline.",
    platforms: ["Android"],
    platformLabel: "ANDROID",
    pills: ["Android", "Offline", "Early preview"],
    url: "https://unreel.invicly.com/",
    linkLabel: "Open Unreel",
    status: "Free · Early preview",
    accent: "#A3E635",
    googlePlaySoon: true,
    primaryCta: { label: "Open Unreel", href: "https://unreel.invicly.com/" },
    highlight: {
      eyebrow: "MEET SPROUT",
      title: "A plant that keeps count.",
      body: "Every Reel and Short you scroll is counted. Sprout thrives when the count is low and wilts as it climbs.",
      rows: [
        { token: "count", text: "Instagram Reels and YouTube Shorts" },
        { token: "limit", text: "A daily limit that stops the feed" },
        { token: "breaks", text: "Reminders to take a break" },
        { token: "stats", text: "See your days and weeks" },
      ],
    },
    features: [
      { title: "Counts what you scroll", body: "Reels and Shorts are counted as you watch them." },
      { title: "Daily limits", body: "Pick a number. When you hit it, Unreel stops the feed." },
      { title: "Break reminders", body: "A gentle nudge when a session runs long." },
      { title: "Stats", body: "See how your count changes over the week." },
      { title: "No accounts, no servers", body: "Everything stays on your phone." },
      { title: "Works offline", body: "No connection needed to count or to stop the feed." },
    ],
    platformsSection: {
      eyebrow: "PLATFORM",
      title: "Built for Android.",
      items: [{ name: "Android", body: "Early preview. Google Play listing coming soon.", href: "https://unreel.invicly.com/", cta: "Get it", soon: true }],
    },
    cta: { title: "Scroll less. Keep Sprout alive.", body: "Free early preview. No account needed.", label: "Open Unreel", href: "https://unreel.invicly.com/" },
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
