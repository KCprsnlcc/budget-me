import { createClient } from "@/lib/supabase/client";
import type { AdminChatMessage, AdminChatbotStats, AdminChatbotFilters } from "./types";

const supabase = createClient();

// Map raw DB row to AdminChatMessage
function mapRow(row: Record<string, any>, profile?: Record<string, any> | null): AdminChatMessage {
    return {
        id: row.id,
        user_id: row.user_id,
        role: row.role,
        content: row.content,
        model: row.model ?? null,
        suggestions: Array.isArray(row.suggestions) ? row.suggestions : [],
        attachment: row.attachment ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_email: profile?.email ?? undefined,
        user_name: profile?.full_name ?? undefined,
        user_avatar: profile?.avatar_url ?? undefined,
    };
}

// Fetch all chatbot messages with filters (admin view)
export async function fetchAdminChatMessages(
    filters: AdminChatbotFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminChatMessage[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("chatbot_messages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

    // Apply date filters
    if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01T00:00:00`;
        const endDate = new Date(filters.year as number, filters.month as number, 0);
        const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59`;
        query = query.gte("created_at", start).lte("created_at", end);
    } else if (filters.year !== "all" && filters.year) {
        query = query.gte("created_at", `${filters.year}-01-01T00:00:00`).lte("created_at", `${filters.year}-12-31T23:59:59`);
    }

    if (filters.role) query = query.eq("role", filters.role);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.model) query = query.eq("model", filters.model);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

    // Fetch user profiles separately
    const userIds = [...new Set((data ?? []).map((msg: any) => msg.user_id))];
    const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("id, email, full_name, avatar_url").in("id", userIds)
        : { data: [] };

    const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    const mappedData = (data ?? []).map((row: any) => {
        const profile = profileMap.get(row.user_id);
        return mapRow(row, profile);
    });

    return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch admin chatbot statistics
export async function fetchAdminChatbotStats(): Promise<AdminChatbotStats | null> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Total messages
    const { count: totalMessages } = await supabase
        .from("chatbot_messages")
        .select("*", { count: "exact", head: true });

    // User messages count
    const { count: totalUserMessages } = await supabase
        .from("chatbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

    // Assistant messages count
    const { count: totalAssistantMessages } = await supabase
        .from("chatbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "assistant");

    // Active users (unique users with messages)
    const { data: activeUsersData } = await supabase
        .from("chatbot_messages")
        .select("user_id");
    const activeUsers = new Set((activeUsersData ?? []).map((m: any) => m.user_id)).size;

    // Average messages per user
    const avgMessagesPerUser = activeUsers > 0 ? (totalMessages ?? 0) / activeUsers : 0;

    // Message growth (last 6 months)
    const messageGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const start = `${y}-${String(m).padStart(2, "0")}-01T00:00:00`;
        const endDate = new Date(y, m, 0);
        const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59`;

        const { count } = await supabase
            .from("chatbot_messages")
            .select("*", { count: "exact", head: true })
            .gte("created_at", start)
            .lte("created_at", end);

        const label = d.toLocaleDateString("en-US", { month: "short" });
        messageGrowth.push({ month: label, count: count ?? 0 });
    }

    // Month-over-month growth
    const currentMonthCount = messageGrowth[messageGrowth.length - 1]?.count ?? 0;
    const previousMonthCount = messageGrowth[messageGrowth.length - 2]?.count ?? 0;
    const monthOverMonthGrowth = previousMonthCount > 0
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

    // Role distribution
    const { data: roleData } = await supabase
        .from("chatbot_messages")
        .select("role");

    const roleMap = new Map<string, number>();
    for (const msg of roleData ?? []) {
        roleMap.set(msg.role, (roleMap.get(msg.role) ?? 0) + 1);
    }

    const totalRole = roleData?.length ?? 1;
    const roleDistribution = Array.from(roleMap.entries()).map(([role, count]) => ({
        role,
        count,
        percentage: Math.round((count / totalRole) * 100),
    }));

    // Model distribution (only assistant messages with models)
    const { data: modelData } = await supabase
        .from("chatbot_messages")
        .select("model")
        .eq("role", "assistant")
        .not("model", "is", null);

    const modelMap = new Map<string, number>();
    for (const msg of modelData ?? []) {
        if (msg.model) {
            modelMap.set(msg.model, (modelMap.get(msg.model) ?? 0) + 1);
        }
    }

    const totalModel = modelData?.length ?? 1;
    const modelDistribution = Array.from(modelMap.entries()).map(([model, count]) => ({
        model,
        count,
        percentage: Math.round((count / totalModel) * 100),
    }));

    // Top users by message count
    const { data: userMsgData } = await supabase
        .from("chatbot_messages")
        .select("user_id, created_at");

    const userTotals = new Map<string, { total_messages: number; last_active: string }>();
    for (const msg of userMsgData ?? []) {
        const userId = msg.user_id;
        const current = userTotals.get(userId) ?? { total_messages: 0, last_active: msg.created_at };
        userTotals.set(userId, {
            total_messages: current.total_messages + 1,
            last_active: msg.created_at > current.last_active ? msg.created_at : current.last_active,
        });
    }

    // Get top 5 users
    const sortedUsers = Array.from(userTotals.entries())
        .sort((a, b) => b[1].total_messages - a[1].total_messages)
        .slice(0, 5);

    const topUserIds = sortedUsers.map(([userId]) => userId);
    const { data: profiles } = topUserIds.length > 0
        ? await supabase.from("profiles").select("id, email, full_name, avatar_url").in("id", topUserIds)
        : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const topUsers = sortedUsers.map(([userId, data]) => {
        const profile = profileMap.get(userId);
        return {
            user_id: userId,
            email: profile?.email ?? "Unknown",
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            total_messages: data.total_messages,
            last_active: data.last_active,
        };
    });

    return {
        totalMessages: totalMessages ?? 0,
        totalUserMessages: totalUserMessages ?? 0,
        totalAssistantMessages: totalAssistantMessages ?? 0,
        activeUsers,
        avgMessagesPerUser,
        messageGrowth,
        roleDistribution,
        modelDistribution,
        topUsers,
        monthOverMonthGrowth,
    };
}

// Delete chatbot message (admin)
export async function deleteAdminChatMessage(msgId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("chatbot_messages").delete().eq("id", msgId);
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

// Fetch distinct models used
export async function fetchDistinctModels(): Promise<string[]> {
    const { data } = await supabase
        .from("chatbot_messages")
        .select("model")
        .eq("role", "assistant")
        .not("model", "is", null);

    const models = new Set<string>();
    for (const msg of data ?? []) {
        if (msg.model) models.add(msg.model);
    }
    return Array.from(models).sort();
}
