import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Car,
  Utensils,
  ShoppingCart,
  Zap,
  Heart,
  Film,
  Package,
  BookOpen,
  Shield,
  DollarSign,
  Laptop,
  TrendingUp,
  Building,
  Briefcase,
  Rocket,
  Gift,
  Banknote,
  FileText,
} from "lucide-react";
import type {
  TransactionType,
  TxnFormState,
  AccountOption,
  CategoryOption,
  BudgetOption,
  GoalOption,
} from "../_components/types";

const supabase = createClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Emoji to Lucide icon mapping
function getLucideIcon(emoji: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Expense Categories
    "🏠": Home,
    "🚗": Car,
    "🍽️": Utensils,
    "🛒": ShoppingCart,
    "💡": Zap,
    "⚕️": Heart,
    "🎬": Film,
    "🛍️": Package,
    "📚": BookOpen,
    "🛡️": Shield,
    
    // Income Categories
    "💰": DollarSign,
    "💻": Laptop,
    "📈": TrendingUp,
    "🏢": Building,
    "💼": Briefcase,
    "🚀": Rocket,
    "🎁": Gift,
    "💵": Banknote,
    
    // Default/fallback
    "📋": FileText,
  };
  
  return iconMap[emoji] || FileText;
}

/** Map a raw DB row (with joins) to the UI TransactionType. */
function mapRow(row: Record<string, any>): TransactionType {
  const acct = row.accounts as Record<string, any> | null;
  const expCat = row.expense_categories as Record<string, any> | null;
  const incCat = row.income_categories as Record<string, any> | null;
  const goal = row.goals as Record<string, any> | null;

  const categorySource = expCat ?? incCat;

  return {
    id: row.id,
    user_id: row.user_id,
    date: row.date,
    amount: Number(row.amount),
    description: row.description,
    notes: row.notes,
    type: row.type,
    category: row.category,
    account_id: row.account_id,
    income_category_id: row.income_category_id,
    expense_category_id: row.expense_category_id,
    goal_id: row.goal_id,
    status: row.status,
    is_recurring: row.is_recurring ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Joined
    account_name: acct?.account_name ?? undefined,
    account_number_masked: acct?.account_number_masked ?? undefined,
    category_name: categorySource?.category_name ?? undefined,
    category_icon: categorySource?.icon ? getLucideIcon(categorySource.icon) : undefined,
    category_color: categorySource?.color ?? undefined,
    goal_name: goal?.goal_name ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// READ — Transactions list
// ---------------------------------------------------------------------------

export type TransactionFilters = {
  month?: number | "all"; // 1-12 or "all"
  year?: number | "all"; // year number or "all"
  type?: string; // "income" | "expense" | etc., or "" for all
  accountId?: string;
  categoryId?: string; // expense or income category id
  goalId?: string;
};

export async function fetchTransactions(
  userId: string,
  filters: TransactionFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: TransactionType[]; error: string | null; count: number | null }> {
  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      accounts!transactions_account_id_fkey ( account_name, account_number_masked ),
      expense_categories ( category_name, icon, color ),
      income_categories ( category_name, icon, color ),
      goals ( goal_name )
    `
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  // Date range filter
  if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    const endDate = new Date(filters.year, filters.month, 0); // last day
    const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    query = query.gte("date", start).lte("date", end);
  } else if (filters.year !== "all" && filters.year) {
    query = query.gte("date", `${filters.year}-01-01`).lte("date", `${filters.year}-12-31`);
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters.goalId) {
    query = query.eq("goal_id", filters.goalId);
  }
  if (filters.categoryId) {
    query = query.or(
      `income_category_id.eq.${filters.categoryId},expense_category_id.eq.${filters.categoryId}`
    );
  }

  // Get total count for pagination (apply same filters as main query)
  let countQuery = supabase
    .from("transactions")
    .select("count", { count: "exact", head: true })
    .eq("user_id", userId);

  // Apply the same filters to count query
  if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    const endDate = new Date(filters.year, filters.month, 0); // last day
    const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    countQuery = countQuery.gte("date", start).lte("date", end);
  } else if (filters.year !== "all" && filters.year) {
    countQuery = countQuery.gte("date", `${filters.year}-01-01`).lte("date", `${filters.year}-12-31`);
  }

  if (filters.type) {
    countQuery = countQuery.eq("type", filters.type);
  }
  if (filters.accountId) {
    countQuery = countQuery.eq("account_id", filters.accountId);
  }
  if (filters.goalId) {
    countQuery = countQuery.eq("goal_id", filters.goalId);
  }
  if (filters.categoryId) {
    countQuery = countQuery.or(
      `income_category_id.eq.${filters.categoryId},expense_category_id.eq.${filters.categoryId}`
    );
  }

  const { count } = await countQuery;

  // Add pagination to main query
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message, count: null };
  return { data: (data ?? []).map(mapRow), error: null, count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createTransaction(
  userId: string,
  form: TxnFormState
): Promise<{ data: TransactionType | null; error: string | null }> {
  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) {
    return { data: null, error: "Amount must be greater than zero." };
  }

  const insert: Record<string, any> = {
    user_id: userId,
    amount,
    date: form.date || new Date().toISOString().split("T")[0],
    type: form.type,
    description: form.description || null,
    account_id: form.account || null,
    goal_id: form.goal || null,
    status: "completed",
  };

  if (form.type === "income") {
    insert.income_category_id = form.income_category_id || null;
  } else if (form.type === "expense") {
    insert.expense_category_id = form.expense_category_id || null;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(insert)
    .select(
      `
      *,
      accounts!transactions_account_id_fkey ( account_name, account_number_masked ),
      expense_categories ( category_name, icon, color ),
      income_categories ( category_name, icon, color ),
      goals ( goal_name )
    `
    )
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateTransaction(
  txId: string,
  form: TxnFormState
): Promise<{ data: TransactionType | null; error: string | null }> {
  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) {
    return { data: null, error: "Amount must be greater than zero." };
  }

  const update: Record<string, any> = {
    amount,
    date: form.date,
    type: form.type,
    description: form.description || null,
    account_id: form.account || null,
    goal_id: form.goal || null,
    income_category_id: null,
    expense_category_id: null,
  };

  if (form.type === "income") {
    update.income_category_id = form.income_category_id || null;
  } else if (form.type === "expense") {
    update.expense_category_id = form.expense_category_id || null;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(update)
    .eq("id", txId)
    .select(
      `
      *,
      accounts!transactions_account_id_fkey ( account_name, account_number_masked ),
      expense_categories ( category_name, icon, color ),
      income_categories ( category_name, icon, color ),
      goals ( goal_name )
    `
    )
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data), error: null };
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteTransaction(
  txId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", txId);
  if (error) return { error: error.message };
  return { error: null };
}

// ---------------------------------------------------------------------------
// LOOKUP DATA — Dropdowns
// ---------------------------------------------------------------------------

export async function fetchAccounts(
  userId: string
): Promise<AccountOption[]> {
  const { data } = await supabase
    .from("accounts")
    .select("id, account_name, account_type, account_number_masked")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("account_name");
  return (data ?? []) as AccountOption[];
}

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

export async function fetchIncomeCategories(
  userId: string
): Promise<CategoryOption[]> {
  const { data } = await supabase
    .from("income_categories")
    .select("id, category_name, icon, color")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("category_name");
  return (data ?? []) as CategoryOption[];
}

export async function fetchBudgets(
  userId: string
): Promise<BudgetOption[]> {
  const { data } = await supabase
    .from("budgets")
    .select("id, budget_name")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("budget_name");
  return (data ?? []) as BudgetOption[];
}

export async function fetchGoals(
  userId: string
): Promise<GoalOption[]> {
  const { data } = await supabase
    .from("goals")
    .select("id, goal_name")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("goal_name");
  return (data ?? []) as GoalOption[];
}

// ---------------------------------------------------------------------------
// AGGREGATES — Summary, Charts, Insights
// ---------------------------------------------------------------------------

export type TransactionSummary = {
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  savingsRate: number;
  incomeChange: number | null;
  expenseChange: number | null;
};

export async function fetchTransactionSummary(
  userId: string,
  month: number | "all",
  year: number | "all"
): Promise<TransactionSummary> {
  let query = supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .eq("status", "completed");

  // Apply date filters only if not "all"
  if (month !== "all" && year !== "all") {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    query = query.gte("date", start).lte("date", end);
  } else if (year !== "all") {
    query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
  }

  const { data: current } = await query;

  let income = 0;
  let expenses = 0;
  for (const row of current ?? []) {
    const amt = Number(row.amount);
    if (row.type === "income" || row.type === "cash_in") income += amt;
    else if (row.type === "expense") expenses += amt;
  }

  // Previous month totals for change % (only if not "all")
  let prevIncome = 0;
  let prevExpenses = 0;
  
  if (month !== "all" && year !== "all") {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
    const prevEndDate = new Date(prevYear, prevMonth, 0);
    const prevEnd = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(prevEndDate.getDate()).padStart(2, "0")}`;

    const { data: prev } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("date", prevStart)
      .lte("date", prevEnd);

    for (const row of prev ?? []) {
      const amt = Number(row.amount);
      if (row.type === "income" || row.type === "cash_in") prevIncome += amt;
      else if (row.type === "expense") prevExpenses += amt;
    }
  }

  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : null;
  const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : null;

  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;

  return {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    netBalance: net,
    savingsRate,
    incomeChange,
    expenseChange,
  };
}

export type CategoryBreakdown = {
  name: string;
  color: string;
  amount: number;
};

export async function fetchCategoryBreakdown(
  userId: string,
  month: number | "all",
  year: number | "all"
): Promise<CategoryBreakdown[]> {
  let query = supabase
    .from("transactions")
    .select("amount, expense_categories ( category_name, color )")
    .eq("user_id", userId)
    .eq("type", "expense")
    .eq("status", "completed");

  // Apply date filters only if not "all"
  if (month !== "all" && year !== "all") {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    query = query.gte("date", start).lte("date", end);
  } else if (year !== "all") {
    query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
  }

  const { data } = await query;

  const map = new Map<string, { color: string; amount: number }>();
  for (const row of data ?? []) {
    const cat = row.expense_categories as Record<string, any> | null;
    const name = cat?.category_name ?? "Uncategorized";
    const color = cat?.color ?? "#94a3b8";
    const existing = map.get(name);
    if (existing) {
      existing.amount += Number(row.amount);
    } else {
      map.set(name, { color, amount: Number(row.amount) });
    }
  }

  return Array.from(map.entries())
    .map(([name, v]) => ({ name, color: v.color, amount: v.amount }))
    .sort((a, b) => b.amount - a.amount);
}

export type MonthlyTrendPoint = {
  month: string;
  income: number;
  expense: number;
};

export async function fetchMonthlyTrend(
  userId: string,
  months: number = 6
): Promise<MonthlyTrendPoint[]> {
  const now = new Date();
  const points: MonthlyTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = new Date(y, m, 0);
    const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const { data } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("date", start)
      .lte("date", end);

    let inc = 0;
    let exp = 0;
    for (const row of data ?? []) {
      const amt = Number(row.amount);
      if (row.type === "income" || row.type === "cash_in") inc += amt;
      else if (row.type === "expense") exp += amt;
    }

    const label = d.toLocaleDateString("en-US", { month: "short" });
    points.push({ month: label, income: inc, expense: exp });
  }

  return points;
}

// ---------------------------------------------------------------------------
// VIEW MODAL — Insights
// ---------------------------------------------------------------------------

export async function fetchSimilarTransactions(
  userId: string,
  categoryId: string | null,
  txType: string,
  excludeId: string,
  limit: number = 3
): Promise<{ description: string | null; date: string; amount: number; category_icon?: React.ComponentType<any> }[]> {
  if (!categoryId) return [];

  const categoryColumn = txType === "income" ? "income_category_id" : "expense_category_id";

  const { data } = await supabase
    .from("transactions")
    .select(`
      description, date, amount, type,
      expense_categories ( category_name, icon, color ),
      income_categories ( category_name, icon, color )
    `)
    .eq("user_id", userId)
    .eq(categoryColumn, categoryId)
    .neq("id", excludeId)
    .order("date", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => {
    const expenseCategories = r.expense_categories as any[] | null;
    const incomeCategories = r.income_categories as any[] | null;
    const categorySource = expenseCategories?.[0] ?? incomeCategories?.[0];
    return {
      description: r.description,
      date: r.date,
      amount: Number(r.amount),
      category_icon: categorySource?.icon ? getLucideIcon(categorySource.icon) : undefined,
    };
  });
}

export async function fetchCategoryStats(
  userId: string,
  categoryId: string | null,
  txType: string,
  month: number,
  year: number
): Promise<{ average: number; monthlyTotal: number; count: number }> {
  if (!categoryId) return { average: 0, monthlyTotal: 0, count: 0 };

  const categoryColumn = txType === "income" ? "income_category_id" : "expense_category_id";
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0);
  const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  // Monthly totals for this category
  const { data: monthly } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq(categoryColumn, categoryId)
    .eq("status", "completed")
    .gte("date", start)
    .lte("date", end);

  let monthlyTotal = 0;
  for (const row of monthly ?? []) monthlyTotal += Number(row.amount);
  const count = monthly?.length ?? 0;

  // All-time average for this category
  const { data: all } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq(categoryColumn, categoryId)
    .eq("status", "completed");

  let total = 0;
  for (const row of all ?? []) total += Number(row.amount);
  const average = all && all.length > 0 ? total / all.length : 0;

  return { average, monthlyTotal, count };
}
