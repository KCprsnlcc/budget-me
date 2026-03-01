import { createClient } from "@/lib/supabase/client";
import { getPhilippinesNow, formatInPhilippines, formatDateForInput } from "@/lib/timezone";
import { generateInsights, InsightData, InsightsTransaction, InsightsBudget } from "./insights-service";
import { generateSpendingTrends, SpendingTrend as TrendServiceSpendingTrend } from "./trends-service";

const supabase = createClient();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  balanceChange: number | null;
  incomeChange: number | null;
  expenseChange: number | null;
  savingsRateChange: number | null;
};

export type RecentTransaction = {
  id: string;
  description: string | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  amount: number;
  date: string;
  type: string;
  account_name: string | null;
  account_number_masked: string | null;
};

export type BudgetProgress = {
  id: string;
  name: string;
  spent: number;
  budget: number;
  percentage: number;
  status: "On Track" | "Warning" | "Over Budget";
  category_icon: string | null;
  category_color: string | null;
};

export type CategoryBreakdownItem = {
  name: string;
  color: string;
  amount: number;
};

export type MonthlyChartPoint = {
  month: string;
  income: number;
  expense: number;
};

export type SpendingTrend = {
  category: string;
  currentAmount: number;
  previousAmount: number;
  change: number;
  trend: "up" | "down" | "neutral";
  insight?: string;
  recommendation?: string;
};

export type PendingInvitation = {
  id: string;
  family_id: string;
  family_name: string;
  inviter_email: string;
};

export type InsightItem = {
  type: "warning" | "success" | "info" | "danger";
  title: string;
  description: string;
  icon?: string;
  _refreshId?: string;
};

// ---------------------------------------------------------------------------
// SUMMARY — Total Balance, Income, Expenses, Savings Rate + changes
// ---------------------------------------------------------------------------

export async function fetchDashboardSummary(
  userId: string
): Promise<DashboardSummary> {
  // Fetch all-time transactions for summary stats
  const { data: allData } = await supabase
    .from("transactions")
    .select("type, amount, date")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("date", { ascending: false });

  // Fetch total balance from accounts
  const { data: accountsData } = await supabase
    .from("accounts")
    .select("balance")
    .eq("user_id", userId)
    .eq("status", "active");

  const totalBalance = (accountsData ?? []).reduce(
    (sum, a) => sum + Number(a.balance ?? 0),
    0
  );

  // Aggregate all-time data
  let totalIncome = 0;
  let totalExpenses = 0;
  
  for (const row of allData ?? []) {
    const amt = Number(row.amount);
    
    if (row.type === "income" || row.type === "cash_in") {
      totalIncome += amt;
    } else if (row.type === "expense") {
      totalExpenses += amt;
    }
  }

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalBalance,
    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses,
    savingsRate,
    balanceChange: null, // No meaningful change calculation for all-time data
    incomeChange: null, // No meaningful change calculation for all-time data
    expenseChange: null, // No meaningful change calculation for all-time data
    savingsRateChange: null, // No meaningful change calculation for all-time data
  };
}

// ---------------------------------------------------------------------------
// RECENT TRANSACTIONS — Latest 5
// ---------------------------------------------------------------------------

export async function fetchRecentTransactions(
  userId: string,
  limit: number = 5
): Promise<RecentTransaction[]> {
  const { data } = await supabase
    .from("transactions")
    .select(
      `
      id, description, amount, date, type,
      accounts!transactions_account_id_fkey ( account_name, account_number_masked ),
      expense_categories ( category_name, icon, color ),
      income_categories ( category_name, icon, color )
    `
    )
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row: any) => {
    const acct = row.accounts as Record<string, any> | null;
    const expCat = row.expense_categories as Record<string, any> | null;
    const incCat = row.income_categories as Record<string, any> | null;
    const cat = expCat ?? incCat;

    return {
      id: row.id,
      description: row.description,
      category_name: cat?.category_name ?? null,
      category_icon: cat?.icon ?? null,
      category_color: cat?.color ?? null,
      amount: Number(row.amount),
      date: row.date,
      type: row.type,
      account_name: acct?.account_name ?? null,
      account_number_masked: acct?.account_number_masked ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// BUDGET PROGRESS — Active budgets with spent/amount
// ---------------------------------------------------------------------------

export async function fetchBudgetProgress(
  userId: string,
  limit: number = 5
): Promise<BudgetProgress[]> {
  const { data } = await supabase
    .from("budget_details")
    .select(
      "id, budget_name, amount, spent, remaining, percentage_used, status_indicator, category_name, category_icon, category_color"
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("percentage_used", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row: any) => {
    const pct = Number(row.percentage_used ?? 0);
    let status: BudgetProgress["status"] = "On Track";
    if (pct >= 100) status = "Over Budget";
    else if (pct >= 80) status = "Warning";

    return {
      id: row.id,
      name: row.category_name || row.budget_name || "Budget",
      spent: Number(row.spent ?? 0),
      budget: Number(row.amount ?? 0),
      percentage: pct,
      status,
      category_icon: row.category_icon ?? null,
      category_color: row.category_color ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// CATEGORY BREAKDOWN — Expense categories for donut chart (current month)
// ---------------------------------------------------------------------------

export async function fetchCategoryBreakdown(
  userId: string
): Promise<CategoryBreakdownItem[]> {
  // Fetch all-time expense transactions for category breakdown
  const { data } = await supabase
    .from("transactions")
    .select("amount, expense_categories ( category_name, color )")
    .eq("user_id", userId)
    .eq("type", "expense")
    .eq("status", "completed");

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

// ---------------------------------------------------------------------------
// MONTHLY CHART — Income vs Expenses for last N months
// ---------------------------------------------------------------------------

export async function fetchMonthlyChart(
  userId: string,
  months: number = 6
): Promise<MonthlyChartPoint[]> {
  const now = getPhilippinesNow();
  const points: MonthlyChartPoint[] = [];

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

    const label = formatInPhilippines(d, 'MMM');
    points.push({ month: label, income: inc, expense: exp });
  }

  return points;
}

// ---------------------------------------------------------------------------
// SPENDING TRENDS — Top 4 expense categories, current vs previous month
// ---------------------------------------------------------------------------

export async function fetchSpendingTrends(
  userId: string,
  limit: number = 4
): Promise<SpendingTrend[]> {
  // Fetch all-time expense transactions with categories
  const { data } = await supabase
    .from("transactions")
    .select("amount, date, type, category, expense_categories ( category_name )")
    .eq("user_id", userId)
    .eq("type", "expense")
    .eq("status", "completed")
    .order("date", { ascending: false });

  // Transform to trends service format
  const trendsTransactions = (data ?? []).map(row => {
    const cat = row.expense_categories as Record<string, any> | null;
    return {
      date: row.date,
      amount: Number(row.amount),
      type: "expense" as const,
      category: cat?.category_name ?? "Uncategorized",
    };
  });

  // Use the new trends service with sophisticated analysis
  return generateSpendingTrends(trendsTransactions, limit);
}

// ---------------------------------------------------------------------------
// PENDING INVITATIONS — Family invitations for the current user
// ---------------------------------------------------------------------------

export async function fetchPendingInvitations(
  userId: string,
  userEmail: string
): Promise<PendingInvitation[]> {
  // Query by email since family_invitations uses email field
  const { data } = await supabase
    .from("family_invitations")
    .select("id, family_id, email, status, families ( family_name ), profiles!family_invitations_invited_by_fkey ( email )")
    .eq("email", userEmail)
    .eq("status", "pending");

  return (data ?? []).map((row: any) => {
    const family = row.families as Record<string, any> | null;
    const inviter = row.profiles as Record<string, any> | null;
    return {
      id: row.id,
      family_id: row.family_id,
      family_name: family?.family_name ?? "Unknown Family",
      inviter_email: inviter?.email ?? "Unknown",
    };
  });
}

// ---------------------------------------------------------------------------
// ACCEPT / DECLINE INVITATION
// ---------------------------------------------------------------------------

export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<{ error: string | null }> {
  // Update invitation status
  const { error: updateError } = await supabase
    .from("family_invitations")
    .update({ status: "accepted", responded_at: formatDateForInput(getPhilippinesNow()) })
    .eq("id", invitationId);

  if (updateError) return { error: updateError.message };

  // Get family_id from invitation
  const { data: inv } = await supabase
    .from("family_invitations")
    .select("family_id, role")
    .eq("id", invitationId)
    .single();

  if (!inv) return { error: "Invitation not found." };

  // Add user to family_members
  const { error: memberError } = await supabase
    .from("family_members")
    .insert({
      family_id: inv.family_id,
      user_id: userId,
      role: inv.role || "member",
      status: "active",
      joined_at: formatDateForInput(getPhilippinesNow()),
    });

  if (memberError) return { error: memberError.message };
  return { error: null };
}

export async function declineInvitation(
  invitationId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("family_invitations")
    .update({ status: "declined", responded_at: formatDateForInput(getPhilippinesNow()) })
    .eq("id", invitationId);

  if (error) return { error: error.message };
  return { error: null };
}

// ---------------------------------------------------------------------------
// INSIGHTS — Generate comprehensive financial insights (ALL 19+ algorithms)
// ---------------------------------------------------------------------------

export async function fetchInsights(
  userId: string
): Promise<InsightItem[]> {
  // Fetch all-time transactions with full details for comprehensive insights
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, type, amount, notes, date, category, expense_category_id, income_category_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("date", { ascending: false });

  // Fetch active budgets with full details
  const { data: budgets } = await supabase
    .from("budget_details")
    .select("id, budget_name, expense_category_name, amount, spent, percentage_used")
    .eq("user_id", userId)
    .eq("status", "active");

  // Calculate all-time aggregates for insights
  let totalIncome = 0;
  let totalExpenses = 0;
  const txRows = transactions ?? [];
  
  for (const row of txRows) {
    const amt = Number(row.amount);
    if (row.type === "income" || row.type === "cash_in") totalIncome += amt;
    else if (row.type === "expense") totalExpenses += amt;
  }
  
  const overallSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Transform to proper types for insights service
  const typedTransactions: InsightsTransaction[] = txRows.map(row => ({
    ...row,
    amount: Number(row.amount),
    type: row.type as "income" | "expense" | "contribution" | "transfer" | "cash_in",
  }));

  const typedBudgets: InsightsBudget[] = (budgets ?? []).map((b: any) => ({
    id: b.id || "",
    budget_name: b.budget_name || "",
    expense_category_name: b.expense_category_name || "",
    amount: Number(b.amount) || 0,
    spent: Number(b.spent) || 0,
    percentage_used: Number(b.percentage_used) || 0,
  }));

  // Generate comprehensive insights using ALL 19+ algorithms from old implementation
  const insightsData = generateInsights(
    typedTransactions,
    typedBudgets,
    totalIncome,
    totalExpenses,
    overallSavingsRate
  );

  // Add some randomness to insight selection and timestamp for variety
  const shuffledInsights = [...insightsData].sort(() => Math.random() - 0.5);
  const topInsights = shuffledInsights.slice(0, 4);
  
  // Add timestamp to ensure refresh detection
  const timestamp = formatDateForInput(getPhilippinesNow());

  // Map to InsightItem format with proper types and icons
  const mappedInsights = topInsights.map((insight, index) => ({
    type: insight.type,
    title: insight.title,
    description: insight.description,
    icon: insight.icon,
    // Add timestamp to force re-render (not displayed but changes object reference)
    _refreshId: `${timestamp}-${index}`,
  }));

  // Return top 4 insights only
  return mappedInsights;
}
