import type { BudgetPeriod } from "./types";

export const BUDGET_PERIODS: { key: BudgetPeriod; label: string; description: string }[] = [
  { key: "day", label: "Daily", description: "Resets every day" },
  { key: "week", label: "Weekly", description: "Resets every Monday" },
  { key: "month", label: "Monthly", description: "Resets on the 1st of each month" },
  { key: "quarter", label: "Quarterly", description: "Resets every 3 months" },
  { key: "year", label: "Yearly", description: "Resets annually" },
  { key: "custom", label: "Custom", description: "Custom date range" },
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

export const getDaysRemaining = (startDate: string, period: BudgetPeriod, endDate?: string): number => {
  // For custom periods or if endDate is provided, use endDate directly
  if (endDate) {
    const end = new Date(endDate + "T23:59:59");
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const start = new Date(startDate);
  const now = new Date();
  
  let nextReset = new Date(start);
  
  switch (period) {
    case "day":
      nextReset.setDate(start.getDate() + 1);
      while (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      break;
    case "week":
      const daysUntilMonday = (8 - start.getDay()) % 7 || 7;
      nextReset.setDate(start.getDate() + daysUntilMonday);
      while (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 7);
      }
      break;
    case "month":
      nextReset.setMonth(start.getMonth() + 1);
      nextReset.setDate(1);
      while (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1);
      }
      break;
    case "quarter":
      nextReset.setMonth(start.getMonth() + 3);
      nextReset.setDate(1);
      while (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 3);
      }
      break;
    case "year":
      nextReset.setFullYear(start.getFullYear() + 1);
      nextReset.setMonth(0);
      nextReset.setDate(1);
      while (nextReset <= now) {
        nextReset.setFullYear(nextReset.getFullYear() + 1);
      }
      break;
    case "custom":
      return 0;
  }
  
  const diffTime = nextReset.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
