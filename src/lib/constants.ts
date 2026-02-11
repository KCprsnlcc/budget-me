import type { NavGroup, Testimonial, Feature, ModuleCard, HowItWorksStep } from "@/types";

export const LANDING_NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "Modules", href: "#modules" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
] as const;

export const DASHBOARD_NAV: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", module: "dashboard" },
      { label: "Transactions", href: "/transactions", icon: "ArrowLeftRight", module: "transactions" },
      { label: "Budgets", href: "/budgets", icon: "PieChart", module: "budgets" },
      { label: "Goals", href: "/goals", icon: "Target", module: "goals" },
      { label: "AI Predictions", href: "/predictions", icon: "Wand2", module: "predictions" },
      { label: "Reports", href: "/reports", icon: "BarChart3", module: "reports" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "BudgetSense AI", href: "/chatbot", icon: "MessageCircle", module: "chatbot", badge: "Beta" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Family", href: "/family", icon: "Users", module: "family", dot: true },
      { label: "Settings", href: "/settings", icon: "Settings", module: "settings" },
    ],
  },
];

export const FEATURES: Feature[] = [
  {
    title: "Expense Tracking",
    description: "Track all your transactions with smart categorization and real-time insights.",
    items: ["Automatic categorization", "Receipt scanning", "Spending analytics"],
  },
  {
    title: "Smart Budgeting",
    description: "Create budgets and get notifications to stay on track with your spending.",
    items: ["Smart alerts", "Flexible categories", "Monthly rollover"],
  },
  {
    title: "Financial Goals",
    description: "Set and track your savings goals with visual progress tracking and timeline projections.",
    items: ["Visual tracking", "Goal categories", "Goal analytics"],
  },
  {
    title: "AI Financial Insights",
    description:
      "Harness the power of artificial intelligence to analyze your spending patterns. Our AI detects recurring subscriptions, suggests savings opportunities, and predicts future spending based on your history.",
    items: ["Smart predictions", "Pattern recognition", "Custom alerts"],
    wide: true,
  },
  {
    title: "Family Planning",
    description: "Collaborate on finances with family members while maintaining privacy control.",
    items: ["Shared savings goals", "Granular privacy controls"],
  },
];

export const MODULE_CARDS: ModuleCard[] = [
  {
    title: "Dashboard Hub",
    description: "A unified command center providing a high-level overview of your entire financial management health in real-time.",
    icon: "LayoutDashboard",
    secondaryIcon: "BarChart3",
  },
  {
    title: "Transaction Manager",
    description: "Full-featured transaction ledger with advanced filtering, batch operations, and smart categorization.",
    icon: "ArrowLeftRight",
    secondaryIcon: "Search",
  },
  {
    title: "Budget Planner",
    description: "Create and manage budgets with visual progress tracking, alerts, and category-level spending limits.",
    icon: "PieChart",
    secondaryIcon: "TrendingUp",
  },
  {
    title: "Goal Tracker",
    description: "Set ambitious financial goals with milestone tracking, timeline projections, and contribution management.",
    icon: "Target",
    secondaryIcon: "Flag",
  },
  {
    title: "AI Predictions",
    description: "Machine learning-powered spending forecasts, anomaly detection, and personalized savings recommendations.",
    icon: "Wand2",
    secondaryIcon: "Brain",
  },
  {
    title: "Financial Reports",
    description: "Generate comprehensive financial reports with charts, comparisons, and exportable summaries.",
    icon: "BarChart3",
    secondaryIcon: "FileText",
  },
  {
    title: "BudgetSense AI",
    description: "Your personal AI financial assistant for natural-language queries about your spending and budgets.",
    icon: "MessageCircle",
    secondaryIcon: "Sparkles",
  },
  {
    title: "Family Finance",
    description: "Collaborate on household finances with shared budgets, privacy controls, and member management.",
    icon: "Users",
    secondaryIcon: "Shield",
  },
  {
    title: "Settings & Preferences",
    description: "Customize your experience with currency, notifications, data export, and account management options.",
    icon: "Settings",
    secondaryIcon: "Sliders",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up in seconds with your email or social accounts. No credit card required.",
    icon: "UserPlus",
  },
  {
    number: "02",
    title: "Set Your Budget",
    description: "Define your income, expenses, and savings goals with our intuitive setup wizard.",
    icon: "Wallet",
  },
  {
    number: "03",
    title: "Track & Analyze",
    description: "Monitor your spending patterns with real-time tracking and AI-powered insights.",
    icon: "BarChart3",
  },
  {
    number: "04",
    title: "Grow Your Wealth",
    description: "Watch your savings grow as you hit milestones and build lasting financial habits.",
    icon: "TrendingUp",
  },
];

export const TESTIMONIALS_ROW1: Testimonial[] = [
  {
    name: "Marcus Alexander Roldan",
    handle: "@marcus.alexander",
    avatar: "/profiles/marcus.alexander.jpg",
    text: "BudgetMe helped me save enough for a down payment on my house in just 18 months. The goal tracking feature is fantastic!",
    ringColor: "ring-emerald-50",
  },
  {
    name: "Adonis Vincent",
    handle: "@adonis.vincent",
    avatar: "/profiles/adonis.vincent.jpg",
    text: "The AI predictions are surprisingly accurate. It caught a subscription I forgot about and saved me $240/year.",
    ringColor: "ring-blue-50",
  },
  {
    name: "Edward Bau",
    handle: "@edward.bau",
    avatar: "/profiles/edward.bau.jpg",
    text: "Family finance management has never been easier. My wife and I finally agree on our budget!",
    ringColor: "ring-purple-50",
  },
  {
    name: "Jamil Amil",
    handle: "@jamil.amil",
    avatar: "/profiles/jamil.amil.jpg",
    text: "Switched from spreadsheets to BudgetMe and never looked back. The reports are beautiful and insightful.",
    ringColor: "ring-amber-50",
  },
  {
    name: "Kenneth B.",
    handle: "@kenneth.b",
    avatar: "/profiles/kenneth.b.jpg",
    text: "The dashboard gives me a complete picture of my finances at a glance. Clean design and powerful features.",
    ringColor: "ring-rose-50",
  },
];

export const TESTIMONIALS_ROW2: Testimonial[] = [
  {
    name: "Abdu Amdal",
    handle: "@abdu.amdal",
    avatar: "/profiles/abdu.amdal.jpg",
    text: "BudgetSense AI is like having a personal financial advisor. It understands my spending habits perfectly.",
    ringColor: "ring-teal-50",
  },
  {
    name: "Sire Enopia",
    handle: "@sire.enopia",
    avatar: "/profiles/sire.enopia.jpg",
    text: "I love how the budget categories are flexible. I can customize everything to match my lifestyle.",
    ringColor: "ring-indigo-50",
  },
  {
    name: "Saeed Nasre",
    handle: "@saeed.nasre",
    avatar: "/profiles/saeed.nasre.jpg",
    text: "The transaction categorization is spot-on. Saves me hours of manual sorting every month.",
    ringColor: "ring-cyan-50",
  },
  {
    name: "Khadz Akil",
    handle: "@khadz.akil",
    avatar: "/profiles/khadz.akil.jpg",
    text: "Goal tracking with visual progress bars keeps me motivated. Already saved 40% more than last year!",
    ringColor: "ring-orange-50",
  },
];

export const TECH_SPECS = [
  { icon: "Monitor", title: "Browser Native", description: "Works across desktop, tablet, and mobile." },
  { icon: "ShieldCheck", title: "Secure Encryption", description: "256-bit Bank-level security with end-to-end encryption." },
  { icon: "CloudCheck", title: "100% Cross-Platform", description: "Syncs your data across all your devices instantly." },
] as const;

export const VALUE_PROPS = [
  { icon: "CheckCheck", text: "Free Account Setup" },
  { icon: "ShieldCheck", text: "Bank-Level Security" },
  { icon: "TrendingUp", text: "AI-Powered Insights" },
] as const;

export const FOOTER_LINKS = {
  platform: [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#how-it-works" },
    { label: "Integrations", href: "#modules" },
  ],
  resources: [
    { label: "Community", href: "#testimonials" },
    { label: "Security", href: "#" },
    { label: "Privacy", href: "#" },
  ],
} as const;
