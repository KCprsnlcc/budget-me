import React from "react";

// DB check: period IN ('day','week','month','quarter','year','custom')
export type BudgetPeriod = "day" | "week" | "month" | "quarter" | "year" | "custom";

// DB check: status IN ('active','paused','completed','archived')
export type BudgetStatus = "active" | "paused" | "completed" | "archived";

// Derived UI status from spent vs amount ratio
export type BudgetHealthStatus = "on-track" | "caution" | "at-risk";

export interface BudgetType {
  id: string;
  user_id: string;
  budget_name: string;
  description: string | null;
  amount: number;
  spent: number;
  currency: string;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  category_id: string | null;
  category_name: string | null;
  status: BudgetStatus;
  is_recurring: boolean;
  alert_threshold: number;
  alert_enabled: boolean;
  rollover_enabled: boolean;
  rollover_amount: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  expense_category_name?: string;
  expense_category_icon?: string;
  expense_category_color?: string;
}

export interface BudgetFormState {
  period: BudgetPeriod;
  budget_name: string;
  amount: string;
  category_id: string;
  start_date: string;
  end_date: string;
  description: string;
}

export const INITIAL_BUDGET_FORM_STATE: BudgetFormState = {
  period: "month",
  budget_name: "",
  amount: "",
  category_id: "",
  start_date: "",
  end_date: "",
  description: "",
};

export type CategoryOption = {
  id: string;
  category_name: string;
  icon: string | null;
  color: string | null;
};

export interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
}

export interface AddBudgetModalProps extends BudgetModalProps {
  onSuccess?: () => void;
}

export interface EditBudgetModalProps extends BudgetModalProps {
  budget: BudgetType | null;
  onSuccess?: () => void;
}

export interface ViewBudgetModalProps extends BudgetModalProps {
  budget: BudgetType | null;
  onEdit?: (budget: BudgetType) => void;
}

export interface DeleteBudgetModalProps extends BudgetModalProps {
  budget: BudgetType | null;
  onSuccess?: () => void;
}

// Helper: derive health status from spent/amount ratio
export function deriveBudgetHealth(spent: number, amount: number): BudgetHealthStatus {
  if (amount <= 0) return "at-risk";
  const pct = spent / amount;
  if (pct >= 0.95) return "at-risk";
  if (pct >= 0.80) return "caution";
  return "on-track";
}
