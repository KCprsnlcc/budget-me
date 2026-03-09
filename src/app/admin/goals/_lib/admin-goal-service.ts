import { createClient } from "@/lib/supabase/client";
import type { AdminGoal, AdminGoalStats, AdminGoalFilters, AdminGoalFormState } from "./types";

const supabase = createClient();

// Map raw DB row to AdminGoal
function mapRow(row: Record<string, any>, profile?: Record<string, any> | null, family?: Record<string, any> | null): AdminGoal {
    const target = Number(row.target_amount);
    const current = Number(row.current_amount);
    return {
        id: row.id,
        user_id: row.user_id,
        goal_name: row.goal_name,
        description: row.description ?? null,
        target_amount: target,
        current_amount: current,
        currency: row.currency ?? "PHP",
        target_date: row.target_date ?? null,
        created_date: row.created_date ?? row.created_at,
        completed_date: row.completed_date ?? null,
        priority: row.priority ?? "medium",
        category: row.category ?? "general",
        status: row.status ?? "in_progress",
        family_id: row.family_id ?? null,
        is_family_goal: row.is_family_goal ?? false,
        is_public: row.is_public ?? false,
        auto_contribute: row.auto_contribute ?? false,
        auto_contribute_amount: Number(row.auto_contribute_amount ?? 0),
        auto_contribute_frequency: row.auto_contribute_frequency ?? null,
        notes: row.notes ?? null,
        image_url: row.image_url ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_email: profile?.email ?? undefined,
        user_name: profile?.full_name ?? undefined,
        user_avatar: profile?.avatar_url ?? undefined,
        family_name: family?.family_name ?? undefined,
        progress_percentage: target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0,
    };
}

// Fetch all goals with filters (admin view)
export async function fetchAdminGoals(
    filters: AdminGoalFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminGoal[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("goals")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

    // Apply filters
    if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
        const endDate = new Date(filters.year as number, filters.month as number, 0);
        const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
        query = query.gte("created_at", `${start}T00:00:00`).lte("created_at", `${end}T23:59:59`);
    } else if (filters.year !== "all" && filters.year) {
        query = query.gte("created_at", `${filters.year}-01-01T00:00:00`).lte("created_at", `${filters.year}-12-31T23:59:59`);
    }

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.priority) query = query.eq("priority", filters.priority);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.isFamily === "true") query = query.eq("is_family_goal", true);
    if (filters.isFamily === "false") query = query.eq("is_family_goal", false);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

    // Fetch user profiles separately
    const userIds = [...new Set((data ?? []).map((g: any) => g.user_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    // Fetch family data if any goals have family_id
    const familyIds = [...new Set((data ?? []).filter((g: any) => g.family_id).map((g: any) => g.family_id))];
    let familyMap = new Map<string, any>();
    if (familyIds.length > 0) {
        const { data: families } = await supabase
            .from("families")
            .select("id, family_name")
            .in("id", familyIds);
        familyMap = new Map((families ?? []).map((f: any) => [f.id, { family_name: f.family_name }]));
    }

    const mappedData = (data ?? []).map((row: any) => {
        const profile = profileMap.get(row.user_id);
        const family = row.family_id ? familyMap.get(row.family_id) : null;
        return mapRow(row, profile, family);
    });

    return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch admin goal statistics
export async function fetchAdminGoalStats(): Promise<AdminGoalStats | null> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Total goals
    const { count: totalGoals } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true });

    // Active goals
    const { count: activeGoals } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

    // Completed goals
    const { count: completedGoals } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

    // Money data
    const { data: allGoals } = await supabase
        .from("goals")
        .select("current_amount, target_amount, user_id");

    let totalSaved = 0;
    let totalTargeted = 0;
    for (const g of allGoals ?? []) {
        totalSaved += Number(g.current_amount);
        totalTargeted += Number(g.target_amount);
    }

    const averageProgress = totalTargeted > 0 ? Math.round((totalSaved / totalTargeted) * 100) : 0;

    // Active users (users with at least one goal)
    const activeUsers = new Set((allGoals ?? []).map((g: any) => g.user_id)).size;

    // Goal growth (last 6 months)
    const goalGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const start = `${y}-${String(m).padStart(2, "0")}-01`;
        const endDate = new Date(y, m, 0);
        const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

        const { count } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .gte("created_at", `${start}T00:00:00`)
            .lte("created_at", `${end}T23:59:59`);

        const label = d.toLocaleDateString("en-US", { month: "short" });
        goalGrowth.push({ month: label, count: count ?? 0 });
    }

    // Month-over-month growth
    const currentMonthCount = goalGrowth[goalGrowth.length - 1]?.count ?? 0;
    const previousMonthCount = goalGrowth[goalGrowth.length - 2]?.count ?? 0;
    const monthOverMonthGrowth = previousMonthCount > 0
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

    // Category distribution
    const { data: catData } = await supabase
        .from("goals")
        .select("category");

    const catMap = new Map<string, number>();
    for (const g of catData ?? []) {
        const cat = g.category ?? "general";
        catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
    }

    const total = catData?.length ?? 1;
    const categoryDistribution = Array.from(catMap.entries()).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
    }));

    // Top savers
    const { data: userGoalData } = await supabase
        .from("goals")
        .select("user_id, current_amount");

    const userTotals = new Map<string, { total_saved: number; goal_count: number }>();
    for (const g of userGoalData ?? []) {
        const userId = g.user_id;
        const amt = Number(g.current_amount);
        const current = userTotals.get(userId) ?? { total_saved: 0, goal_count: 0 };
        userTotals.set(userId, {
            total_saved: current.total_saved + amt,
            goal_count: current.goal_count + 1,
        });
    }

    const sortedUsers = Array.from(userTotals.entries())
        .sort((a, b) => b[1].total_saved - a[1].total_saved)
        .slice(0, 5);

    const topUserIds = sortedUsers.map(([userId]) => userId);
    const { data: topProfiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", topUserIds);

    const topProfileMap = new Map((topProfiles ?? []).map((p: any) => [p.id, p]));

    const topSavers = sortedUsers.map(([userId, data]) => {
        const profile = topProfileMap.get(userId);
        return {
            user_id: userId,
            email: profile?.email ?? "Unknown",
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            total_saved: data.total_saved,
            goal_count: data.goal_count,
        };
    });

    return {
        totalGoals: totalGoals ?? 0,
        activeGoals: activeGoals ?? 0,
        completedGoals: completedGoals ?? 0,
        totalSaved,
        totalTargeted,
        averageProgress,
        goalGrowth,
        categoryDistribution,
        activeUsers,
        monthOverMonthGrowth,
        topSavers,
    };
}

// Create goal (admin)
export async function createAdminGoal(form: AdminGoalFormState): Promise<{ error: string | null }> {
    const target = parseFloat(form.target_amount);
    if (isNaN(target) || target <= 0) return { error: "Target amount must be greater than zero." };

    const currentAmount = parseFloat(form.current_amount) || 0;
    const autoContributeAmount = parseFloat(form.auto_contribute_amount) || 0;

    const payload: Record<string, any> = {
        user_id: form.user_id,
        goal_name: form.goal_name,
        target_amount: target,
        current_amount: currentAmount,
        priority: form.priority,
        category: form.category,
        target_date: form.target_date || null,
        is_family_goal: form.is_family_goal,
        family_id: form.family_id || null,
        auto_contribute_amount: autoContributeAmount,
        description: form.description || null,
        notes: form.notes || null,
        status: "in_progress",
    };

    const { error } = await supabase.from("goals").insert(payload);
    if (error) return { error: error.message };
    return { error: null };
}

// Update goal (admin)
export async function updateAdminGoal(goalId: string, form: AdminGoalFormState): Promise<{ error: string | null }> {
    const target = parseFloat(form.target_amount);
    if (isNaN(target) || target <= 0) return { error: "Target amount must be greater than zero." };

    const currentAmount = parseFloat(form.current_amount) || 0;
    const autoContributeAmount = parseFloat(form.auto_contribute_amount) || 0;

    const payload: Record<string, any> = {
        goal_name: form.goal_name,
        target_amount: target,
        current_amount: currentAmount,
        priority: form.priority,
        category: form.category,
        target_date: form.target_date || null,
        is_family_goal: form.is_family_goal,
        family_id: form.family_id || null,
        auto_contribute_amount: autoContributeAmount,
        description: form.description || null,
        notes: form.notes || null,
    };

    const { error } = await supabase.from("goals").update(payload).eq("id", goalId);
    if (error) return { error: error.message };
    return { error: null };
}

// Delete goal (admin)
export async function deleteAdminGoal(goalId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
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

// Admin goal contribution
export async function contributeToAdminGoal(
    goalId: string,
    amount: number,
    userId?: string
): Promise<{ error: string | null }> {
    if (amount <= 0) {
        return { error: "Contribution amount must be greater than zero." };
    }

    // To properly implement a manual contribution in timezone aware boundaries, we do manual local date retrieval
    // But wait, the standard date string 'YYYY-MM-DD' usually suffices without full TZ imports if we do it cleanly.
    // For safety, we will just pass new Date().toISOString() since Supabase uses TIMESTAMPTZ.
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const contribution = {
        goal_id: goalId,
        user_id: userId || null,
        amount: amount,
        contribution_date: dateStr,
        contribution_type: "manual",
    };

    // Insert contribution record - trigger will handle goal progress update
    const { error: contributionError } = await supabase
        .from("goal_contributions")
        .insert(contribution);

    if (contributionError) {
        return { error: contributionError.message };
    }

    return { error: null };
}
