import { GoalPriority, GoalCategory, GoalStatus } from "./types";

export const INITIAL_GOAL_FORM_STATE = {
  name: "",
  target: "",
  priority: "medium" as GoalPriority,
  category: "general" as GoalCategory,
  deadline: "",
  monthlyContribution: "",
  isFamily: false,
  isPublic: false,
};

export const GOAL_PRIORITIES = [
  { key: "high" as GoalPriority, label: "High Priority", color: "red" },
  { key: "medium" as GoalPriority, label: "Medium Priority", color: "amber" },
  { key: "low" as GoalPriority, label: "Low Priority", color: "slate" },
];

export const GOAL_CATEGORIES = [
  { key: "emergency" as GoalCategory, label: "Emergency Fund", icon: "shield-check", description: "Build a safety net for unexpected expenses" },
  { key: "vacation" as GoalCategory, label: "Vacation", icon: "airplane", description: "Save for travel and leisure activities" },
  { key: "house" as GoalCategory, label: "Housing", icon: "home-2", description: "Save for home purchase or renovation" },
  { key: "car" as GoalCategory, label: "Transportation", icon: "car", description: "Save for vehicle purchase or maintenance" },
  { key: "education" as GoalCategory, label: "Education", icon: "graduation-cap", description: "Fund education and learning expenses" },
  { key: "retirement" as GoalCategory, label: "Retirement", icon: "flag", description: "Build long-term retirement savings" },
  { key: "debt" as GoalCategory, label: "Debt Payoff", icon: "trending-up", description: "Pay off loans and credit obligations" },
  { key: "general" as GoalCategory, label: "General", icon: "flag", description: "Other savings goals and objectives" },
];

export const GOAL_STATUSES = [
  { key: "in_progress" as GoalStatus, label: "In Progress", color: "blue" },
  { key: "completed" as GoalStatus, label: "Completed", color: "emerald" },
  { key: "overdue" as GoalStatus, label: "Overdue", color: "amber" },
  { key: "behind" as GoalStatus, label: "Behind", color: "amber" },
];

export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "No date set";
  try {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric", 
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

export const getDaysRemaining = (deadline: string): number => {
  if (!deadline) return 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline + "T00:00:00");
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const getGoalProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
};

export const getGoalStatus = (deadline: string, progress: number): GoalStatus => {
  if (progress >= 100) return "completed";
  if (getDaysRemaining(deadline) < 0) return "overdue";
  return "in_progress";
};
