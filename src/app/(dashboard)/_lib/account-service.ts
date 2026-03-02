import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface UserDataStatus {
  hasAccounts: boolean;
  hasTransactions: boolean;
  hasBudgets: boolean;
  hasGoals: boolean;
  isFirstTimeUser: boolean;
}

/**
 * Check if a user has any data (accounts, transactions, budgets, goals)
 * Used to determine if onboarding modal should be shown
 */
export async function checkUserDataStatus(userId: string): Promise<UserDataStatus> {
  const [
    accountsResult,
    transactionsResult,
    budgetsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("budgets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const hasAccounts = (accountsResult.count ?? 0) > 0;
  const hasTransactions = (transactionsResult.count ?? 0) > 0;
  const hasBudgets = (budgetsResult.count ?? 0) > 0;
  const hasGoals = (goalsResult.count ?? 0) > 0;

  // A first-time user has no accounts and no transactions
  const isFirstTimeUser = !hasAccounts && !hasTransactions;

  return {
    hasAccounts,
    hasTransactions,
    hasBudgets,
    hasGoals,
    isFirstTimeUser,
  };
}

/**
 * Quick check if user has any accounts
 */
export async function hasAccounts(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  return (count ?? 0) > 0;
}
