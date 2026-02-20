import React from "react";

export type TransactionType = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  description: string | null;
  notes: string | null;
  type: TxnKind;
  category: string | null;
  account_id: string | null;
  income_category_id: string | null;
  expense_category_id: string | null;
  goal_id: string | null;
  budget_id: string | null;
  status: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  account_name?: string;
  account_number_masked?: string;
  category_name?: string;
  category_icon?: React.ComponentType<any>;
  category_color?: string;
  goal_name?: string;
};

export type TxnKind = "expense" | "income" | "contribution" | "transfer" | "cash_in";

export type TxnFormState = {
  type: TxnKind | "";
  amount: string;
  date: string;
  income_category_id: string;
  expense_category_id: string;
  budget: string;
  goal: string;
  account: string;
  description: string;
};

export const INITIAL_FORM_STATE: TxnFormState = {
  type: "",
  amount: "",
  date: "",
  income_category_id: "",
  expense_category_id: "",
  budget: "",
  goal: "",
  account: "",
  description: "",
};

export type AccountOption = {
  id: string;
  account_name: string;
  account_type: string;
  account_number_masked: string | null;
};

export type CategoryOption = {
  id: string;
  category_name: string;
  icon: string | null;
  color: string | null;
};

export type BudgetOption = {
  id: string;
  budget_name: string;
};

export type GoalOption = {
  id: string;
  goal_name: string;
};
