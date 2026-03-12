

export type BudgetPeriod = "day" | "week" | "month" | "quarter" | "year" | "custom";
export type BudgetStatus = "active" | "paused" | "completed" | "archived";
export type BudgetHealthStatus = "on-track" | "caution" | "at-risk";

export type AdminBudget = {
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

    user_email?: string;
    user_name?: string;
    user_avatar?: string;
    expense_category_name?: string;
    expense_category_icon?: string;
    expense_category_color?: string;
};

export type AdminBudgetStats = {
    totalBudgets: number;
    totalBudgetAmount: number;
    totalSpent: number;
    remaining: number;
    activeBudgets: number;
    pausedBudgets: number;
    completedBudgets: number;
    activeUsers: number;
    avgBudgetAmount: number;
    onTrackCount: number;
    cautionCount: number;
    atRiskCount: number;
    monthOverMonthGrowth: number;
    budgetGrowth: { month: string; count: number }[];
    statusDistribution: { status: string; count: number; percentage: number }[];
    budgetAllocation: { category: string; amount: number; color?: string }[];
    periodDistribution: { period: string; count: number; percentage: number }[];
    topUsers: {
        user_id: string;
        email: string;
        full_name?: string | null;
        avatar_url?: string | null;
        total_budget_amount: number;
        budget_count: number;
    }[];
};

export type AdminBudgetFilters = {
    month?: number | "all";
    year?: number | "all";
    status?: string;
    period?: string;
    userId?: string;
};

export function deriveBudgetHealth(spent: number, amount: number): BudgetHealthStatus {
    if (amount <= 0) return "at-risk";
    const pct = spent / amount;
    if (pct >= 0.95) return "at-risk";
    if (pct >= 0.80) return "caution";
    return "on-track";
}
