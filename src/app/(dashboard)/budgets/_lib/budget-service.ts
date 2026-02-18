import { createClient } from "@/lib/supabase/client";
import type {
  BudgetType,
  BudgetFormState,
  CategoryOption,
} from "../_components/types";

const supabase = createClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BUDGET_SELECT = `
  *,
  expense_categories ( category_name, icon, color )
`;

/** Map a raw DB row (with joins) to the UI BudgetType. */
function mapRow(row: Record<string, any>): BudgetType {
  const expCat = row.expense_categories as Record<string, any> | null;

  return {
    id: row.id,
    user_id: row.user_id,
    budget_name: row.budget_name,
    description: row.description,
    amount: Number(row.amount),
    spent: Number(row.spent),
    currency: row.currency,
    period: row.period,
    start_date: row.start_date,
    end_date: row.end_date,
    category_id: row.category_id,
    category_name: row.category_name,
    status: row.status,
    is_recurring: row.is_recurring ?? false,
    alert_threshold: Number(row.alert_threshold),
    alert_enabled: row.alert_enabled ?? true,
    rollover_enabled: row.rollover_enabled ?? false,
    rollover_amount: Number(row.rollover_amount),
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Joined
    expense_category_name: expCat?.category_name ?? undefined,
    expense_category_icon: expCat?.icon ?? undefined,
    expense_category_color: expCat?.color ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// READ — Budgets list
// ---------------------------------------------------------------------------

export type BudgetFilters = {
  status?: string;
  period?: string;
  categoryId?: string;
  search?: string;
};

export async function fetchBudgetsList(
  userId: string,
  filters: BudgetFilters = {}
): Promise<{ data: BudgetType[]; error: string | null }> {
  let query = supabase
    .from("budgets")
    .select(BUDGET_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.period) {
    query = query.eq("period", filters.period);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []).map(mapRow), error: null };
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createBudget(
  userId: string,
  form: BudgetFormState
): Promise<{ data: BudgetType | null; error: string | null }> {
  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) {
    return { data: null, error: "Amount must be greater than zero." };
  }

  if (!form.budget_name.trim()) {
    return { data: null, error: "Budget name is required." };
  }
  if (!form.start_date || !form.end_date) {
    return { data: null, error: "Start date and end date are required." };
  }

  const insert: Record<string, any> = {
    user_id: userId,
    budget_name: form.budget_name.trim(),
    amount,
    currency: "PHP",
    period: form.period,
    start_date: form.start_date,
    end_date: form.end_date,
    category_id: form.category_id || null,
    description: form.description?.trim() || null,
    status: "active",
  };

  const { data, error } = await supabase
    .from("budgets")
    .insert(insert)
    .select(BUDGET_SELECT)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateBudget(
  budgetId: string,
  form: BudgetFormState
): Promise<{ data: BudgetType | null; error: string | null }> {
  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) {
    return { data: null, error: "Amount must be greater than zero." };
  }

  if (!form.budget_name.trim()) {
    return { data: null, error: "Budget name is required." };
  }

  const update: Record<string, any> = {
    budget_name: form.budget_name.trim(),
    amount,
    period: form.period,
    start_date: form.start_date,
    end_date: form.end_date,
    category_id: form.category_id || null,
    description: form.description?.trim() || null,
  };

  const { data, error } = await supabase
    .from("budgets")
    .update(update)
    .eq("id", budgetId)
    .select(BUDGET_SELECT)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteBudget(
  budgetId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId);
  if (error) return { error: error.message };
  return { error: null };
}

// ---------------------------------------------------------------------------
// LOOKUP DATA — Expense Categories for dropdowns
// ---------------------------------------------------------------------------

export async function fetchExpenseCategories(
  userId: string
): Promise<CategoryOption[]> {
  const { data } = await supabase
    .from("expense_categories")
    .select("id, category_name, icon, color")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("category_name");
  return (data ?? []) as CategoryOption[];
}

// ---------------------------------------------------------------------------
// AGGREGATES — Summary for dashboard cards & charts
// ---------------------------------------------------------------------------

export type BudgetSummary = {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  budgetCount: number;
  onTrackCount: number;
  cautionCount: number;
  atRiskCount: number;
};

export function computeBudgetSummary(budgets: BudgetType[]): BudgetSummary {
  let totalBudget = 0;
  let totalSpent = 0;
  let onTrackCount = 0;
  let cautionCount = 0;
  let atRiskCount = 0;

  for (const b of budgets) {
    totalBudget += b.amount;
    totalSpent += b.spent;
    const pct = b.amount > 0 ? b.spent / b.amount : 1;
    if (pct >= 0.95) atRiskCount++;
    else if (pct >= 0.80) cautionCount++;
    else onTrackCount++;
  }

  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    budgetCount: budgets.length,
    onTrackCount,
    cautionCount,
    atRiskCount,
  };
}

// ---------------------------------------------------------------------------
// MONTHLY TREND (for bar chart)
// ---------------------------------------------------------------------------

export type BudgetMonthlyTrendPoint = {
  month: string;
  budget: number;
  spent: number;
};

export async function fetchBudgetMonthlyTrend(
  userId: string,
  months: number = 6
): Promise<BudgetMonthlyTrendPoint[]> {
  const now = new Date();
  const points: BudgetMonthlyTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = new Date(y, m, 0);
    const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const { data } = await supabase
      .from("budgets")
      .select("amount, spent")
      .eq("user_id", userId)
      .eq("status", "active")
      .gte("start_date", start)
      .lte("start_date", end);

    let budgetTotal = 0;
    let spentTotal = 0;
    for (const row of data ?? []) {
      budgetTotal += Number(row.amount);
      spentTotal += Number(row.spent);
    }

    const label = d.toLocaleDateString("en-US", { month: "short" });
    points.push({ month: label, budget: budgetTotal, spent: spentTotal });
  }

  return points;
}

export type CategoryAllocation = {
  name: string;
  color: string;
  amount: number;
};

export function computeCategoryAllocation(budgets: BudgetType[]): CategoryAllocation[] {
  const map = new Map<string, { color: string; amount: number }>();

  for (const b of budgets) {
    const name = b.expense_category_name ?? b.category_name ?? "Uncategorized";
    const color = b.expense_category_color ?? "#94a3b8";
    const existing = map.get(name);
    if (existing) {
      existing.amount += b.amount;
    } else {
      map.set(name, { color, amount: b.amount });
    }
  }

  return Array.from(map.entries())
    .map(([name, v]) => ({ name, color: v.color, amount: v.amount }))
    .sort((a, b) => b.amount - a.amount);
}
