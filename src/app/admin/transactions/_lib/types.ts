

export type AdminTransaction = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  description: string | null;
  notes: string | null;
  type: string;
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

  user_email?: string;
  user_name?: string;
  user_avatar?: string;
  account_name?: string;
  account_number_masked?: string;
  category_name?: string;
  category_icon?: React.ComponentType<any>;
  category_color?: string;
  goal_name?: string;
};

export type AdminTransactionStats = {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionGrowth: { month: string; count: number }[];
  typeDistribution: { type: string; count: number; percentage: number }[];

  activeUsers: number;
  avgTransactionValue: number;
  topSpendingCategory: { name: string; amount: number } | null;
  pendingTransactions: number;
  monthOverMonthGrowth: number; // percentage
  topUsers: { 
    user_id: string; 
    email: string; 
    full_name?: string | null;
    avatar_url?: string | null;
    total_amount: number; 
    transaction_count: number;
  }[];
};

export type AdminTransactionFilters = {
  month?: number | "all";
  year?: number | "all";
  type?: string;
  userId?: string;
  accountId?: string;
  categoryId?: string;
  status?: string;
};
