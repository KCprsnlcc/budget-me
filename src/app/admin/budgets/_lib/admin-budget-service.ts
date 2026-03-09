import { createClient } from "@/lib/supabase/client";
import type { AdminBudget, AdminBudgetStats, AdminBudgetFilters } from "./types";

const supabase = createClient();

const BUDGET_SELECT = `
  *,
  expense_categories!budgets_category_id_fkey ( category_name, icon, color )
`;

// Map raw DB row to AdminBudget
function mapRow(row: Record<string, any>, profile?: Record<string, any> | null): AdminBudget {
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
        user_email: profile?.email ?? undefined,
        user_name: profile?.full_name ?? undefined,
        user_avatar: profile?.avatar_url ?? undefined,
        expense_category_name: expCat?.category_name ?? undefined,
        expense_category_icon: expCat?.icon ?? undefined,
        expense_category_color: expCat?.color ?? undefined,
    };
}

// Fetch all budgets with filters (admin view)
export async function fetchAdminBudgets(
    filters: AdminBudgetFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminBudget[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("budgets")
        .select(BUDGET_SELECT, { count: "exact" })
        .order("created_at", { ascending: false });

    // Apply filters
    if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
        const endDate = new Date(filters.year as number, filters.month as number, 0);
        const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
        query = query.gte("start_date", start).lte("start_date", end);
    } else if (filters.year !== "all" && filters.year) {
        query = query.gte("start_date", `${filters.year}-01-01`).lte("start_date", `${filters.year}-12-31`);
    }

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.period) query = query.eq("period", filters.period);
    if (filters.userId) query = query.eq("user_id", filters.userId);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

    // Fetch user profiles separately
    const userIds = [...new Set((data ?? []).map((b: any) => b.user_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    const mappedData = (data ?? []).map((row: any) => {
        const profile = profileMap.get(row.user_id);
        return mapRow(row, profile);
    });

    return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch admin budget statistics
export async function fetchAdminBudgetStats(): Promise<AdminBudgetStats | null> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Total budgets
    const { count: totalBudgets } = await supabase
        .from("budgets")
        .select("*", { count: "exact", head: true });

    // All budgets for aggregation
    const { data: allBudgets } = await supabase
        .from("budgets")
        .select("user_id, amount, spent, status, period");

    let totalBudgetAmount = 0;
    let totalSpent = 0;
    let activeBudgets = 0;
    let pausedBudgets = 0;
    let completedBudgets = 0;
    let onTrackCount = 0;
    let cautionCount = 0;
    let atRiskCount = 0;

    for (const b of allBudgets ?? []) {
        const amt = Number(b.amount);
        const spt = Number(b.spent);
        totalBudgetAmount += amt;
        totalSpent += spt;

        if (b.status === "active") activeBudgets++;
        else if (b.status === "paused") pausedBudgets++;
        else if (b.status === "completed") completedBudgets++;

        const pct = amt > 0 ? spt / amt : 1;
        if (pct >= 0.95) atRiskCount++;
        else if (pct >= 0.80) cautionCount++;
        else onTrackCount++;
    }

    // Active users (users with at least one budget)
    const activeUsers = new Set((allBudgets ?? []).map((b: any) => b.user_id)).size;

    // Average budget amount
    const avgBudgetAmount = totalBudgets ? totalBudgetAmount / totalBudgets : 0;

    // Budget growth (last 6 months)
    const budgetGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const start = `${y}-${String(m).padStart(2, "0")}-01`;
        const endDate = new Date(y, m, 0);
        const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

        const { count } = await supabase
            .from("budgets")
            .select("*", { count: "exact", head: true })
            .gte("created_at", `${start}T00:00:00`)
            .lte("created_at", `${end}T23:59:59`);

        const label = d.toLocaleDateString("en-US", { month: "short" });
        budgetGrowth.push({ month: label, count: count ?? 0 });
    }

    // Month-over-month growth
    const currentMonthCount = budgetGrowth[budgetGrowth.length - 1]?.count ?? 0;
    const previousMonthCount = budgetGrowth[budgetGrowth.length - 2]?.count ?? 0;
    const monthOverMonthGrowth = previousMonthCount > 0
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

    // Status distribution
    const statusMap = new Map<string, number>();
    for (const b of allBudgets ?? []) {
        statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
    }
    const total = allBudgets?.length ?? 1;
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / total) * 100),
    }));

    // Period distribution
    const periodMap = new Map<string, number>();
    for (const b of allBudgets ?? []) {
        periodMap.set(b.period, (periodMap.get(b.period) ?? 0) + 1);
    }
    const periodDistribution = Array.from(periodMap.entries()).map(([period, count]) => ({
        period,
        count,
        percentage: Math.round((count / total) * 100),
    }));

    // Top users by budget volume
    const userTotals = new Map<string, { total_budget_amount: number; budget_count: number }>();
    for (const b of allBudgets ?? []) {
        const current = userTotals.get(b.user_id) ?? { total_budget_amount: 0, budget_count: 0 };
        userTotals.set(b.user_id, {
            total_budget_amount: current.total_budget_amount + Number(b.amount),
            budget_count: current.budget_count + 1,
        });
    }

    const sortedUsers = Array.from(userTotals.entries())
        .sort((a, b) => b[1].total_budget_amount - a[1].total_budget_amount)
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
            total_budget_amount: data.total_budget_amount,
            budget_count: data.budget_count,
        };
    });

    return {
        totalBudgets: totalBudgets ?? 0,
        totalBudgetAmount,
        totalSpent,
        remaining: totalBudgetAmount - totalSpent,
        activeBudgets,
        pausedBudgets,
        completedBudgets,
        activeUsers,
        avgBudgetAmount,
        onTrackCount,
        cautionCount,
        atRiskCount,
        monthOverMonthGrowth,
        budgetGrowth,
        statusDistribution,
        periodDistribution,
        topUsers,
    };
}

// Create budget (admin)
export async function createAdminBudget(
    userId: string,
    form: {
        budget_name: string;
        amount: string;
        period: string;
        start_date: string;
        end_date: string;
        category_id: string;
        description: string;
    }
): Promise<{ error: string | null }> {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return { error: "Amount must be greater than zero." };
    if (!form.budget_name.trim()) return { error: "Budget name is required." };
    if (!form.start_date || !form.end_date) return { error: "Start date and end date are required." };

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

    const { error } = await supabase.from("budgets").insert(insert);
    if (error) return { error: error.message };
    return { error: null };
}

// Update budget (admin)
export async function updateAdminBudget(
    budgetId: string,
    form: {
        budget_name: string;
        amount: string;
        period: string;
        start_date: string;
        end_date: string;
        category_id: string;
        description: string;
        status: string;
    }
): Promise<{ error: string | null }> {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return { error: "Amount must be greater than zero." };
    if (!form.budget_name.trim()) return { error: "Budget name is required." };

    const update: Record<string, any> = {
        budget_name: form.budget_name.trim(),
        amount,
        period: form.period,
        start_date: form.start_date,
        end_date: form.end_date,
        category_id: form.category_id || null,
        description: form.description?.trim() || null,
        status: form.status,
    };

    const { error } = await supabase.from("budgets").update(update).eq("id", budgetId);
    if (error) return { error: error.message };
    return { error: null };
}

// Delete budget (admin)
export async function deleteAdminBudget(budgetId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("budgets").delete().eq("id", budgetId);
    if (error) return { error: error.message };
    return { error: null };
}

// Fetch all users for filter dropdown
export async function fetchAllUsers(): Promise<{ id: string; email: string; full_name: string | null }[]> {
    const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("email");
    return data ?? [];
}
