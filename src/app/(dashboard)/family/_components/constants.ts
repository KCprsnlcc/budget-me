export const FAMILY_ROLES = {
  member: {
    title: "Member",
    description: "Full access to budgets & goals",
    icon: "User",
    color: "blue",
  },
  admin: {
    title: "Admin", 
    description: "Can manage members & settings",
    icon: "Shield",
    color: "emerald",
  },
  viewer: {
    title: "Viewer",
    description: "Read-only access",
    icon: "Eye",
    color: "slate",
  },
} as const;

export const FAMILY_TYPES = {
  private: {
    title: "Private",
    description: "Require invitations to join",
  },
  public: {
    title: "Public", 
    description: "Can be discovered by others",
  },
} as const;

export const ROLE_PERMISSIONS = {
  Owner: ["Full Access"],
  Admin: ["View", "Edit", "Budget", "Manage Members"],
  Member: ["View", "Add Transactions", "Edit Own"],
  Viewer: ["View Only"],
} as const;

export const DEFAULT_CURRENCY = "PHP - Philippine Peso (₱)";

export const MODAL_STEPS = {
  INVITE_MEMBER: ["Details", "Review"],
  CREATE_FAMILY: ["Details", "Review"],
  EDIT_FAMILY: ["Details", "Review"],
};

export const FAMILY_TABS = {
  OVERVIEW: "overview",
  MEMBERS: "members",
  ACTIVITY: "activity",
  GOALS: "goals",
} as const;

export const NO_FAMILY_TABS = {
  CREATE: "create",
  JOIN: "join",
  INVITATIONS: "invitations",
} as const;

export const ACTIVITY_TYPES = {
  TRANSACTION: "transaction",
  GOAL: "goal",
  MEMBER: "member",
  BUDGET: "budget",
} as const;

export const GOAL_STATUSES = {
  ON_TRACK: "on-track",
  AT_RISK: "at-risk",
  COMPLETED: "completed",
  PAUSED: "paused",
} as const;

export const ACTIVITY_FILTERS = {
  ALL: "all",
  TRANSACTIONS: "transactions",
  GOALS: "goals",
  MEMBERS: "members",
  BUDGETS: "budgets",
} as const;

export const GOAL_FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
} as const;

export const ACTIVITY_ICONS = {
  transaction: "Wallet",
  goal: "FlagCheckered",
  member: "UserPlus",
  budget: "Settings",
} as const;

export const NO_FAMILY_FEATURES = [
  {
    icon: "Widget",
    title: "Combined View",
    description: "Real-time dashboards showing combined household income and spending.",
  },
  {
    icon: "Target",
    title: "Shared Goals",
    description: "Set and track milestones for vacations, house savings, or emergency funds.",
  },
  {
    icon: "ShieldCheck",
    title: "Privacy First",
    description: "Granular permissions to control exactly who can see specific data.",
  },
] as const;

export const ROLE_ICONS = {
  Owner: "Crown",
  Admin: "Shield", 
  Member: "Edit",
  Viewer: "Eye",
} as const;
