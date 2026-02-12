import type { BudgetFormState, BudgetPeriod, BudgetCategory } from "./types";

export const INITIAL_BUDGET_FORM_STATE: BudgetFormState = {
  period: "monthly",
  name: "",
  amount: "",
  category: "food",
  startDate: "2026-01-01",
};

export const BUDGET_PERIODS: { key: BudgetPeriod; label: string; description: string; icon: string }[] = [
  { key: "monthly", label: "Monthly", description: "Resets on the 1st of each month", icon: "calendar" },
  { key: "weekly", label: "Weekly", description: "Resets every Monday", icon: "calendar-week" },
  { key: "quarterly", label: "Quarterly", description: "Resets every 3 months", icon: "calendar-quarter" },
  { key: "yearly", label: "Yearly", description: "Resets annually", icon: "calendar-year" },
];

export const BUDGET_CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Other" },
];

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getDaysRemaining = (startDate: string, period: BudgetPeriod): number => {
  const start = new Date(startDate);
  const now = new Date();
  
  let nextReset = new Date(start);
  
  switch (period) {
    case "weekly":
      const daysUntilMonday = (8 - start.getDay()) % 7 || 7;
      nextReset.setDate(start.getDate() + daysUntilMonday);
      while (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 7);
      }
      break;
    case "monthly":
      nextReset.setMonth(start.getMonth() + 1);
      nextReset.setDate(1);
      while (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1);
      }
      break;
    case "quarterly":
      nextReset.setMonth(start.getMonth() + 3);
      nextReset.setDate(1);
      while (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 3);
      }
      break;
    case "yearly":
      nextReset.setFullYear(start.getFullYear() + 1);
      nextReset.setMonth(0);
      nextReset.setDate(1);
      while (nextReset <= now) {
        nextReset.setFullYear(nextReset.getFullYear() + 1);
      }
      break;
  }
  
  const diffTime = nextReset.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
