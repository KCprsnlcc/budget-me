import { GoalPriority, GoalCategory, GoalStatus } from "./types";

export const INITIAL_GOAL_FORM_STATE = {
  name: "",
  target: "",
  priority: "medium" as GoalPriority,
  category: "other" as GoalCategory,
  deadline: "",
  monthlyContribution: "",
  isFamily: false,
};

export const GOAL_PRIORITIES = [
  { key: "high" as GoalPriority, label: "High Priority", color: "red" },
  { key: "medium" as GoalPriority, label: "Medium Priority", color: "amber" },
  { key: "low" as GoalPriority, label: "Low Priority", color: "slate" },
];

export const GOAL_CATEGORIES = [
  { key: "emergency" as GoalCategory, label: "Emergency Fund", icon: "shield-check" },
  { key: "housing" as GoalCategory, label: "Housing", icon: "home-2" },
  { key: "education" as GoalCategory, label: "Education", icon: "graduation-cap" },
  { key: "travel" as GoalCategory, label: "Travel", icon: "airplane" },
  { key: "transport" as GoalCategory, label: "Transportation", icon: "car" },
  { key: "electronics" as GoalCategory, label: "Electronics", icon: "laptop" },
  { key: "other" as GoalCategory, label: "Other", icon: "target" },
];

export const GOAL_STATUSES = [
  { key: "in_progress" as GoalStatus, label: "In Progress", color: "blue" },
  { key: "completed" as GoalStatus, label: "Completed", color: "emerald" },
  { key: "overdue" as GoalStatus, label: "Overdue", color: "amber" },
  { key: "behind" as GoalStatus, label: "Behind", color: "amber" },
];

export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
