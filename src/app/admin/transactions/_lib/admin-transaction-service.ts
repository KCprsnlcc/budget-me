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
import type { AdminTransaction, AdminTransactionStats, AdminTransactionFilters } from "./types";

const supabase = createClient();

function getLucideIcon(emoji: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    "🏠": Home, "🚗": Car, "🍽️": Utensils, "🛒": ShoppingCart,
    "💡": Zap, "⚕️": Heart, "🎬": Film, "🛍️": Package,
    "📚": BookOpen, "🛡️": Shield, "💰": DollarSign, "💻": Laptop,
    "📈": TrendingUp, "🏢": Building, "💼": Briefcase, "🚀": Rocket,
    "🎁": Gift, "💵": Banknote, "📋": FileText,
  };
  return iconMap[emoji] || FileText;
}

function mapRow(row: Record<string, any>): AdminTransaction {
  const acct = row.accounts as Record<string, any> | null;
  const expCat = row.expense_categories as Record<string, any> | null;
  const incCat = row.income_categories as Record<string, any> | null;
  const profile = row.profiles as Record<string, any> | null;

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
    budget_id: row.budget_id,
    status: row.status,
    is_recurring: row.is_recurring ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_email: profile?.email ?? undefined,
    user_name: profile?.full_name ?? undefined,
    user_avatar: profile?.avatar_url ?? undefined,
    account_name: acct?.account_name ?? undefined,
    account_number_masked: acct?.account_number_masked ?? undefined,
    category_name: categorySource?.category_name ?? undefined,
    category_icon: categorySource?.icon ? getLucideIcon(categorySource.icon) : undefined,
    category_color: categorySource?.color ?? undefined,
    goal_name: undefined, 
  };
}

export async function fetchAdminTransactions(
  filters: AdminTransactionFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: AdminTransaction[]; error: string | null; count: number | null }> {
  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      accounts!transactions_account_id_fkey ( account_name, account_number_masked ),
      expense_categories!transactions_expense_category_id_fkey ( category_name, icon, color ),
      income_categories!transactions_income_category_id_fkey ( category_name, icon, color )
    `,
      { count: "exact" }
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
    const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    const endDate = new Date(filters.year, filters.month, 0);
    const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    query = query.gte("date", start).lte("date", end);
  } else if (filters.year !== "all" && filters.year) {
    query = query.gte("date", `${filters.year}-01-01`).lte("date", `${filters.year}-12-31`);
  }

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.categoryId) {
    query = query.or(
      `income_category_id.eq.${filters.categoryId},expense_category_id.eq.${filters.categoryId}`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return { data: [], error: error.message, count: null };

  const userIds = [...new Set((data ?? []).map((tx: any) => tx.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
  );

  const mappedData = (data ?? []).map((row: any) => {
    const profile = profileMap.get(row.user_id);
    return mapRow({ ...row, profiles: profile });
  });

  return { data: mappedData, error: null, count: count ?? 0 };
}

export async function fetchAdminTransactionStats(): Promise<AdminTransactionStats | null> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { count: totalTransactions } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  const { data: allTxns } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("status", "completed");

  let totalIncome = 0;
  let totalExpenses = 0;
  for (const tx of allTxns ?? []) {
    const amt = Number(tx.amount);
    if (tx.type === "income" || tx.type === "cash_in") totalIncome += amt;
    else if (tx.type === "expense") totalExpenses += amt;
  }

  const { data: activeUsersData } = await supabase
    .from("transactions")
    .select("user_id");
  const activeUsers = new Set((activeUsersData ?? []).map((tx: any) => tx.user_id)).size;

  const avgTransactionValue = totalTransactions ? (totalIncome + totalExpenses) / totalTransactions : 0;

  const { count: pendingTransactions } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const transactionGrowth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = new Date(y, m, 0);
    const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const { count } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("date", start)
      .lte("date", end);

    const label = d.toLocaleDateString("en-US", { month: "short" });
    transactionGrowth.push({ month: label, count: count ?? 0 });
  }

  const currentMonthCount = transactionGrowth[transactionGrowth.length - 1]?.count ?? 0;
  const previousMonthCount = transactionGrowth[transactionGrowth.length - 2]?.count ?? 0;
  const monthOverMonthGrowth = previousMonthCount > 0 
    ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100 
    : 0;

  const { data: typeData } = await supabase
    .from("transactions")
    .select("type");

  const typeMap = new Map<string, number>();
  for (const tx of typeData ?? []) {
    typeMap.set(tx.type, (typeMap.get(tx.type) ?? 0) + 1);
  }

  const total = typeData?.length ?? 1;
  const typeDistribution = Array.from(typeMap.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / total) * 100),
  }));

  const { data: categoryData } = await supabase
    .from("transactions")
    .select(`
      amount,
      expense_categories!transactions_expense_category_id_fkey ( category_name )
    `)
    .eq("type", "expense")
    .eq("status", "completed");

  const categoryTotals = new Map<string, number>();
  for (const tx of categoryData ?? []) {
    const catName = (tx.expense_categories as any)?.category_name ?? "Uncategorized";
    const amt = Number(tx.amount);
    categoryTotals.set(catName, (categoryTotals.get(catName) ?? 0) + amt);
  }

  let topSpendingCategory: { name: string; amount: number } | null = null;
  let maxAmount = 0;
  for (const [name, amount] of categoryTotals.entries()) {
    if (amount > maxAmount) {
      maxAmount = amount;
      topSpendingCategory = { name, amount };
    }
  }

  const { data: userTxData } = await supabase
    .from("transactions")
    .select("user_id, amount")
    .eq("status", "completed");

  const userTotals = new Map<string, { total_amount: number; transaction_count: number }>();
  for (const tx of userTxData ?? []) {
    const userId = tx.user_id;
    const amt = Number(tx.amount);
    const current = userTotals.get(userId) ?? { total_amount: 0, transaction_count: 0 };
    userTotals.set(userId, {
      total_amount: current.total_amount + amt,
      transaction_count: current.transaction_count + 1,
    });
  }

  const sortedUsers = Array.from(userTotals.entries())
    .sort((a, b) => b[1].total_amount - a[1].total_amount)
    .slice(0, 5);

  const topUserIds = sortedUsers.map(([userId]) => userId);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", topUserIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const topUsers = sortedUsers.map(([userId, data]) => {
    const profile = profileMap.get(userId);
    return {
      user_id: userId,
      email: profile?.email ?? "Unknown",
      full_name: profile?.full_name,
      avatar_url: profile?.avatar_url,
      total_amount: data.total_amount,
      transaction_count: data.transaction_count,
    };
  });

  return {
    totalTransactions: totalTransactions ?? 0,
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionGrowth,
    typeDistribution,
    activeUsers,
    avgTransactionValue,
    topSpendingCategory,
    pendingTransactions: pendingTransactions ?? 0,
    monthOverMonthGrowth,
    topUsers,
  };
}

export async function deleteAdminTransaction(txId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("transactions").delete().eq("id", txId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchAllUsers(): Promise<{ id: string; email: string; full_name: string | null }[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .order("email");
  return data ?? [];
}
