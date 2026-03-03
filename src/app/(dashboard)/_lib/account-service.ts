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

/**
 * Check if a user has any data (accounts, transactions, budgets, goals)
 * Used to determine if onboarding modal should be shown
 * 
 * Logic replicated from old system:
 * - Show modal if user has no accounts OR all accounts have zero balance
 * - BUT NOT if they have already completed the account setup process OR skipped for later
 */
export async function checkUserDataStatus(userId: string): Promise<UserDataStatus> {
  const [
    accountsResult,
    transactionsResult,
    budgetsResult,
    goalsResult,
    setupStatusResult,
    skipStatusResult,
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
    // Check if user has completed account setup
    supabase.rpc("check_account_setup_completed", { user_uuid: userId }),
    // Check if user has skipped setup for later
    supabase.rpc("check_account_setup_skip_active", { user_uuid: userId }),
  ]);

  const hasAccounts = (accountsResult.count ?? 0) > 0;
  const hasTransactions = (transactionsResult.count ?? 0) > 0;
  const hasBudgets = (budgetsResult.count ?? 0) > 0;
  const hasGoals = (goalsResult.count ?? 0) > 0;

  // Check if all accounts have zero balance
  const allAccountsHaveZeroBalance =
    hasAccounts &&
    (accountsResult.data ?? []).every(
      (account: any) =>
        account.balance === 0 ||
        account.balance === "0" ||
        !account.balance
    );

  // Check setup completion status
  const hasCompletedSetup = setupStatusResult.data === true;
  const hasSkippedSetup = skipStatusResult.data === true;

  // A first-time user should see onboarding if:
  // 1. They have no accounts OR all accounts have zero balance
  // 2. AND they haven't completed setup
  // 3. AND they haven't skipped setup
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
