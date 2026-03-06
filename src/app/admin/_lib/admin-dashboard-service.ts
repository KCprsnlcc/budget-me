import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminSummary = {
  totalUsers: number;
  totalTransactions: number;
  totalBudgets: number;
  totalGoals: number;
  totalFamilies: number;
  totalAIUsage: number;
  systemRevenue: number;
  activeUsers: number;
};

export type UserActivity = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in: string | null;
  transaction_count: number;
  budget_count: number;
  goal_count: number;
};

export type ModuleStats = {
  module: string;
  total_records: number;
  active_records: number;
  total_amount: number;
};

export type SystemActivity = {
  date: string;
  new_users: number;
  transactions: number;
  ai_requests: number;
};

// ---------------------------------------------------------------------------
// ADMIN SUMMARY — System-wide metrics using Supabase
// ---------------------------------------------------------------------------

export async function fetchAdminSummary(): Promise<AdminSummary> {
  try {
    // Fetch total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    // Fetch total transactions
    const { count: totalTransactions } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true });

    // Fetch total budgets
    const { count: totalBudgets } = await supabase
      .from("budgets")
      .select("id", { count: "exact", head: true });

    // Fetch total goals
    const { count: totalGoals } = await supabase
      .from("goals")
      .select("id", { count: "exact", head: true });

    // Fetch total families
    const { count: totalFamilies } = await supabase
      .from("families")
      .select("id", { count: "exact", head: true });

    // Fetch AI usage (chatbot messages)
    const { count: totalAIUsage } = await supabase
      .from("chatbot_messages")
      .select("id", { count: "exact", head: true });

    // Calculate system revenue (sum of all income transactions)
    const { data: revenueData } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("status", "completed")
      .in("type", ["income", "cash_in"]);

    let systemRevenue = 0;
    for (const row of revenueData ?? []) {
      systemRevenue += Number(row.amount);
    }

    // Fetch active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeUserData } = await supabase
      .from("transactions")
      .select("user_id")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const uniqueActiveUsers = new Set(activeUserData?.map(t => t.user_id) || []);

    return {
      totalUsers: totalUsers ?? 0,
      totalTransactions: totalTransactions ?? 0,
      totalBudgets: totalBudgets ?? 0,
      totalGoals: totalGoals ?? 0,
      totalFamilies: totalFamilies ?? 0,
      totalAIUsage: totalAIUsage ?? 0,
      systemRevenue,
      activeUsers: uniqueActiveUsers.size,
    };
  } catch (error) {
    console.error("Error fetching admin summary:", error);
    throw new Error("Failed to fetch admin summary");
  }
}

// ---------------------------------------------------------------------------
// USER ACTIVITY — Recent user registrations and activity
// ---------------------------------------------------------------------------

export async function fetchUserActivity(limit: number = 10): Promise<UserActivity[]> {
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!profiles) return [];

    // Fetch transaction, budget, and goal counts for each user
    const userActivities: UserActivity[] = [];

    for (const profile of profiles) {
      const { count: transactionCount } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { count: budgetCount } = await supabase
        .from("budgets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { count: goalCount } = await supabase
        .from("goals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id);

      userActivities.push({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        last_sign_in: null,
        transaction_count: transactionCount ?? 0,
        budget_count: budgetCount ?? 0,
        goal_count: goalCount ?? 0,
      });
    }

    return userActivities;
  } catch (error) {
    console.error("Error fetching user activity:", error);
    throw new Error("Failed to fetch user activity");
  }
}

// ---------------------------------------------------------------------------
// MODULE STATS — Statistics for each module
// ---------------------------------------------------------------------------

export async function fetchModuleStats(): Promise<ModuleStats[]> {
  try {
    const stats: ModuleStats[] = [];

    // Transactions
    const { count: totalTransactions } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true });

    const { count: completedTransactions } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed");

    const { data: transactionAmounts } = await supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed");

    const totalTransactionAmount = (transactionAmounts ?? []).reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    stats.push({
      module: "Transactions",
      total_records: totalTransactions ?? 0,
      active_records: completedTransactions ?? 0,
      total_amount: totalTransactionAmount,
    });

    // Budgets
    const { count: totalBudgets } = await supabase
      .from("budgets")
      .select("id", { count: "exact", head: true });

    const { count: activeBudgets } = await supabase
      .from("budgets")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    const { data: budgetAmounts } = await supabase
      .from("budgets")
      .select("amount")
      .eq("status", "active");

    const totalBudgetAmount = (budgetAmounts ?? []).reduce(
      (sum, b) => sum + Number(b.amount),
      0
    );

    stats.push({
      module: "Budgets",
      total_records: totalBudgets ?? 0,
      active_records: activeBudgets ?? 0,
      total_amount: totalBudgetAmount,
    });

    // Goals
    const { count: totalGoals } = await supabase
      .from("goals")
      .select("id", { count: "exact", head: true });

    const { count: activeGoals } = await supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress");

    const { data: goalAmounts } = await supabase
      .from("goals")
      .select("target_amount");

    const totalGoalAmount = (goalAmounts ?? []).reduce(
      (sum, g) => sum + Number(g.target_amount),
      0
    );

    stats.push({
      module: "Goals",
      total_records: totalGoals ?? 0,
      active_records: activeGoals ?? 0,
      total_amount: totalGoalAmount,
    });

    // Families
    const { count: totalFamilies } = await supabase
      .from("families")
      .select("id", { count: "exact", head: true });

    const { count: activeFamilies } = await supabase
      .from("families")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    stats.push({
      module: "Family",
      total_records: totalFamilies ?? 0,
      active_records: activeFamilies ?? 0,
      total_amount: 0,
    });

    // AI Predictions
    const { count: totalPredictions } = await supabase
      .from("prophet_predictions")
      .select("id", { count: "exact", head: true });

    stats.push({
      module: "Predictions",
      total_records: totalPredictions ?? 0,
      active_records: totalPredictions ?? 0,
      total_amount: 0,
    });

    // Chatbot
    const { count: totalMessages } = await supabase
      .from("chatbot_messages")
      .select("id", { count: "exact", head: true });

    stats.push({
      module: "Chatbot",
      total_records: totalMessages ?? 0,
      active_records: totalMessages ?? 0,
      total_amount: 0,
    });

    return stats;
  } catch (error) {
    console.error("Error fetching module stats:", error);
    throw new Error("Failed to fetch module stats");
  }
}

// ---------------------------------------------------------------------------
// SYSTEM ACTIVITY — Daily activity metrics
// ---------------------------------------------------------------------------

export async function fetchSystemActivity(days: number = 7): Promise<SystemActivity[]> {
  try {
    const activities: SystemActivity[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split("T")[0];

      // New users
      const { count: newUsers } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dateStr)
        .lt("created_at", nextDateStr);

      // Transactions
      const { count: transactions } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dateStr)
        .lt("created_at", nextDateStr);

      // AI requests
      const { count: aiRequests } = await supabase
        .from("chatbot_messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dateStr)
        .lt("created_at", nextDateStr);

      activities.push({
        date: dateStr,
        new_users: newUsers ?? 0,
        transactions: transactions ?? 0,
        ai_requests: aiRequests ?? 0,
      });
    }

    return activities;
  } catch (error) {
    console.error("Error fetching system activity:", error);
    throw new Error("Failed to fetch system activity");
  }
}
