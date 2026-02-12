export type BudgetPeriod = "monthly" | "weekly" | "quarterly" | "yearly";
export type BudgetCategory = "food" | "transportation" | "entertainment" | "housing" | "utilities" | "healthcare" | "other";

export interface BudgetType {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  category: BudgetCategory;
  startDate: string;
  status: "on-track" | "caution" | "at-risk";
  icon?: string;
}

export interface BudgetFormState {
  period: BudgetPeriod;
  name: string;
  amount: string;
  category: BudgetCategory;
  startDate: string;
}

export interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
}

export interface AddBudgetModalProps extends BudgetModalProps {}

export interface EditBudgetModalProps extends BudgetModalProps {
  budget: BudgetType | null;
}

export interface ViewBudgetModalProps extends BudgetModalProps {
  budget: BudgetType | null;
  onEdit?: (budget: BudgetType) => void;
}

export interface DeleteBudgetModalProps extends BudgetModalProps {
  budget: BudgetType | null;
}
