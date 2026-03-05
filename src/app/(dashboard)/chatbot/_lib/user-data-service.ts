"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ---------------------------------------------------------------------------
// User Financial Data Types
// ---------------------------------------------------------------------------

export interface UserFinancialContext {
  profile: {
    fullName: string | null;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    avatarUrl: string | null;
  };
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    isDefault: boolean;
    institution: string | null;
  }>;
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  };
  recentTransactions: Array<{
    id: string;
    description: string | null;
    category: string | null;
    amount: number;
    date: string;
    type: string;
  }>;
  budgets: Array<{
    id: string;
    name: string;
    amount: number;
    spent: number;
    remaining: number;
    status: string;
    category: string | null;
  }>;
  goals: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    progress: number;
    deadline: string | null;
    category: string;
    status: string;
  }>;
  familyMembers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

// ---------------------------------------------------------------------------
// User Profile Data Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  currencyPreference: string;
  timezone: string;
  language: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Fetch User Profile for Chatbot
// ---------------------------------------------------------------------------

export async function fetchUserProfile(
  userId: string
): Promise<{ data: UserProfile | null; error: string | null }> {
  try {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, currency_preference, timezone, language, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!profileData) {
      return { data: null, error: "Profile not found" };
    }

    const profile: UserProfile = {
      id: profileData.id,
      fullName: profileData.full_name,
      email: profileData.email,
      avatarUrl: profileData.avatar_url,
      role: profileData.role ?? "user",
      currencyPreference: profileData.currency_preference ?? "PHP",
      timezone: profileData.timezone ?? "UTC",
      language: profileData.language ?? "en",
      createdAt: profileData.created_at,
    };

    return { data: profile, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch user profile";
    return { data: null, error: errorMessage };
  }
}

// ---------------------------------------------------------------------------
// Fetch User's Financial Context for Chatbot
// ---------------------------------------------------------------------------

export async function fetchUserFinancialContext(
  userId: string
): Promise<{ data: UserFinancialContext | null; error: string | null }> {
  try {
    // Fetch user profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, phone, date_of_birth, avatar_url")
      .eq("id", userId)
      .single();

    const profile = {
      fullName: profileData?.full_name ?? null,
      email: profileData?.email ?? "",
      phone: profileData?.phone ?? null,
      dateOfBirth: profileData?.date_of_birth ?? null,
      avatarUrl: profileData?.avatar_url ?? null,
    };

    // Fetch accounts with full details
    const { data: accountsData } = await supabase
      .from("accounts")
      .select("id, account_name, account_type, balance, is_default, institution_name")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    const accounts = (accountsData ?? []).map((acc) => ({
      id: acc.id,
      name: acc.account_name,
      type: acc.account_type,
      balance: Number(acc.balance ?? 0),
      isDefault: acc.is_default ?? false,
      institution: acc.institution_name ?? null,
    }));

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    // Fetch dashboard summary
    const { data: summaryData } = await supabase
      .from("transactions")
      .select("type, amount, date")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("date", { ascending: false });

    // Calculate income/expenses from all-time data
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};

    for (const row of summaryData ?? []) {
      const amt = Number(row.amount);
      if (row.type === "income" || row.type === "cash_in") {
        totalIncome += amt;
      } else if (row.type === "expense") {
        totalExpenses += amt;
      }
    }

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Fetch recent transactions (last 10)
    const { data: recentTxns } = await supabase
      .from("transactions")
      .select(
        `
        id, description, amount, date, type,
        expense_categories ( category_name ),
        income_categories ( category_name )
      `
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10);

    const recentTransactions = (recentTxns ?? []).map((row: any) => {
      const expCat = row.expense_categories?.category_name;
      const incCat = row.income_categories?.category_name;
      return {
        id: row.id,
        description: row.description,
        category: expCat ?? incCat ?? "Uncategorized",
        amount: Number(row.amount),
        date: row.date,
        type: row.type,
      };
    });

    // Fetch budgets
    const { data: budgetsData } = await supabase
      .from("budgets")
      .select(
        `
        *,
        expense_categories ( category_name )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const budgets = (budgetsData ?? []).map((row: any) => {
      const spent = Number(row.spent ?? 0);
      const amount = Number(row.amount ?? 0);
      return {
        id: row.id,
        name: row.budget_name,
        amount,
        spent,
        remaining: amount - spent,
        status: row.status,
        category: row.expense_categories?.category_name ?? null,
      };
    });

    // Fetch goals
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const goals = (goalsData ?? []).map((row: any) => {
      const target = Number(row.target_amount ?? 0);
      const current = Number(row.current_amount ?? 0);
      return {
        id: row.id,
        name: row.goal_name,
        target,
        current,
        progress: target > 0 ? Math.round((current / target) * 100) : 0,
        deadline: row.target_date,
        category: row.category ?? "general",
        status: row.status ?? "in_progress",
      };
    });

    // Fetch family members
    let familyMembers: any[] = [];
    try {
      // First, get the user's family membership
      const { data: userFamilyData, error: userFamilyError } = await supabase
        .from("family_members")
        .select("family_id, role")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (userFamilyError || !userFamilyData) {
        // User is not in a family, continue without family data
        familyMembers = [];
      } else {
        // Fetch all family members for this family
        const { data: membersData, error: membersError } = await supabase
          .from("family_members")
          .select("id, user_id, role")
          .eq("family_id", userFamilyData.family_id)
          .eq("status", "active");

        if (membersError) {
          console.error('Family members query error:', membersError);
          familyMembers = [];
        } else {
          // Fetch profiles for all members
          const memberUserIds = (membersData ?? []).map((m: any) => m.user_id);
          
          if (memberUserIds.length > 0) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", memberUserIds);

            const profileMap: Record<string, any> = {};
            for (const p of profilesData ?? []) {
              profileMap[p.id] = p;
            }

            familyMembers = (membersData ?? []).map((row: any) => ({
              id: row.id,
              name: profileMap[row.user_id]?.full_name ?? null,
              email: profileMap[row.user_id]?.email ?? "",
              role: row.role,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Family members fetch error:', error);
      // Continue without family data if fetch fails
      familyMembers = [];
    }

    // Calculate top spending categories from recent transactions
    const expenseTransactions = recentTransactions.filter((t) => t.type === "expense");
    const categoryMap: Record<string, number> = {};
    let totalSpent = 0;

    for (const txn of expenseTransactions) {
      const cat = txn.category ?? "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] ?? 0) + txn.amount;
      totalSpent += txn.amount;
    }

    const topCategories = Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const context: UserFinancialContext = {
      profile,
      accounts,
      summary: {
        totalBalance,
        monthlyIncome: totalIncome,
        monthlyExpenses: totalExpenses,
        savingsRate: Math.round(savingsRate * 100) / 100,
      },
      recentTransactions,
      budgets,
      goals,
      familyMembers,
      topCategories,
    };

    return { data: context, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch user data";
    return { data: null, error: errorMessage };
  }
}

// ---------------------------------------------------------------------------
// Format User Context for AI System Prompt
// ---------------------------------------------------------------------------

export function formatUserContextForAI(context: UserFinancialContext): string {
  const { profile, accounts, summary, recentTransactions, budgets, goals, familyMembers, topCategories } = context;

  let formatted = `## User's Financial Overview

**User Profile:**
- Name: ${profile.fullName || "Not set"}
- Email: ${profile.email}
- Phone: ${profile.phone || "Not set"}
- Date of Birth: ${profile.dateOfBirth || "Not set"}

**Financial Accounts:**
`;

  if (accounts.length > 0) {
    accounts.forEach((acc) => {
      const defaultBadge = acc.isDefault ? " (Default)" : "";
      const institution = acc.institution ? ` - ${acc.institution}` : "";
      formatted += `- ${acc.name}${defaultBadge}: ₱${acc.balance.toLocaleString()} (${acc.type})${institution}\n`;
    });
    formatted += `\n`;
  } else {
    formatted += `- No accounts set up yet\n\n`;
  }

  formatted += `**Account Summary:**
- Total Balance: ₱${summary.totalBalance.toLocaleString()}
- Total Income: ₱${summary.monthlyIncome.toLocaleString()}
- Total Expenses: ₱${summary.monthlyExpenses.toLocaleString()}
- Savings Rate: ${summary.savingsRate.toFixed(1)}%

`;

  if (topCategories.length > 0) {
    formatted += `**Top Spending Categories:**\n`;
    topCategories.forEach((cat) => {
      formatted += `- ${cat.name}: ₱${cat.amount.toLocaleString()} (${cat.percentage}%)\n`;
    });
    formatted += `\n`;
  }

  if (recentTransactions.length > 0) {
    formatted += `**Recent Transactions (Last ${Math.min(recentTransactions.length, 5)}):**\n`;
    recentTransactions.slice(0, 5).forEach((txn) => {
      const emoji = txn.type === "income" ? "📥" : "📤";
      formatted += `${emoji} ${txn.description ?? txn.category} - ₱${txn.amount.toLocaleString()} (${txn.date})\n`;
    });
    formatted += `\n`;
  }

  if (budgets.length > 0) {
    formatted += `**Active Budgets:**\n`;
    budgets.slice(0, 5).forEach((budget) => {
      const pct = Math.round((budget.spent / budget.amount) * 100);
      const status = pct > 100 ? "⚠️ Over" : pct > 80 ? "🔔 Warning" : "✅ On Track";
      formatted += `- ${budget.name}: ₱${budget.spent.toLocaleString()} / ₱${budget.amount.toLocaleString()} (${pct}%) ${status}\n`;
    });
    formatted += `\n`;
  }

  if (goals.length > 0) {
    formatted += `**Financial Goals:**\n`;
    goals.slice(0, 5).forEach((goal) => {
      const emoji = goal.progress >= 100 ? "🎯" : goal.progress >= 50 ? "🏃" : "🌱";
      formatted += `${emoji} ${goal.name}: ₱${goal.current.toLocaleString()} / ₱${goal.target.toLocaleString()} (${goal.progress}%)\n`;
    });
    formatted += `\n`;
  }

  if (familyMembers.length > 0) {
    formatted += `**Family Members:** ${familyMembers.length} member(s)\n`;
    familyMembers.slice(0, 3).forEach((member) => {
      formatted += `- ${member.name ?? member.email} (${member.role})\n`;
    });
    formatted += `\n`;
  }

  formatted += `**Instructions:** Use this data to provide personalized financial advice. Reference specific transactions, budgets, or goals when relevant. Be encouraging about positive trends (like decreasing spending) and offer actionable suggestions for improvement. Always use ₱ (PHP) for currency.`;

  return formatted;
}
