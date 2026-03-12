import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface UserDataStatus {
  hasAccounts: boolean;
  hasTransactions: boolean;
  hasBudgets: boolean;
  hasGoals: boolean;
  isFirstTimeUser: boolean;
  hasCompletedSetup: boolean;
  hasSkippedSetup: boolean;
  allAccountsHaveZeroBalance: boolean;
}

export async function checkUserDataStatus(userId: string): Promise<UserDataStatus> {
  const [
    accountsResult,
    transactionsResult,
    budgetsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, balance", { count: "exact" })
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

  const allAccountsHaveZeroBalance =
    hasAccounts &&
    (accountsResult.data ?? []).every(
      (account: any) =>
        account.balance === 0 ||
        account.balance === "0" ||
        !account.balance
    );

  const completedBy = localStorage.getItem('accountSetupCompletedBy');
  const hasCompletedSetup = completedBy === userId && localStorage.getItem('accountSetupCompleted') === 'true';

  const skipUntilStr = localStorage.getItem('accountSetupSkipUntil');
  const skippedBy = localStorage.getItem('accountSetupSkippedBy');
  let hasSkippedSetup = false;
  
  if (skipUntilStr && skippedBy === userId) {
    const skipUntil = new Date(skipUntilStr);
    const now = new Date();
    hasSkippedSetup = now < skipUntil;
    
    if (!hasSkippedSetup) {
      localStorage.removeItem('accountSetupSkipUntil');
      localStorage.removeItem('accountSetupSkippedBy');
    }
  }

  const isFirstTimeUser =
    (!hasAccounts || allAccountsHaveZeroBalance) &&
    !hasCompletedSetup &&
    !hasSkippedSetup;

  return {
    hasAccounts,
    hasTransactions,
    hasBudgets,
    hasGoals,
    isFirstTimeUser,
    hasCompletedSetup,
    hasSkippedSetup,
    allAccountsHaveZeroBalance,
  };
}

export async function hasAccounts(userId: string): Promise<boolean> {
  const { count } = await supabase
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  return (count ?? 0) > 0;
}
