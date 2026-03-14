import { createClient } from "@/lib/supabase/client";
import type { AdminChatMessage, AdminChatSession, AdminChatbotStats, AdminChatbotFilters } from "./types";

const supabase = createClient();

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

export 
async function fetchAdminChatSessions(
    filters: AdminChatbotFilters = {},
    page: number = 1,
    pageSize: number = 20,
    search: string = ""
): Promise<{ data: AdminChatSession[]; error: string | null; count: number }> {
    try {

        let dateFilter: { start?: string; end?: string } = {};
        if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
            const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01T00:00:00`;
            const endDate = new Date(filters.year as number, filters.month as number, 0);
            const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59`;
            dateFilter = { start, end };
        } else if (filters.year !== "all" && filters.year) {
            dateFilter = {
                start: `${filters.year}-01-01T00:00:00`,
                end: `${filters.year}-12-31T23:59:59`,
            };
        }

        let query = supabase
            .from("chatbot_messages")
            .select("user_id, role, model, created_at, content")
            .order("created_at", { ascending: false });

        if (dateFilter.start) query = query.gte("created_at", dateFilter.start);
        if (dateFilter.end) query = query.lte("created_at", dateFilter.end);
        if (filters.role) query = query.eq("role", filters.role);
        if (filters.userId) query = query.eq("user_id", filters.userId);
        if (filters.model) query = query.eq("model", filters.model);

        const { data: rawData, error } = await query;
        if (error) return { data: [], error: error.message, count: 0 };

        const sessionMap = new Map<string, {
            user_id: string;
            total_messages: number;
            user_messages: number;
            assistant_messages: number;
            last_message_content: string;
            last_message_role: "user" | "assistant";
            first_message_at: string;
            last_message_at: string;
            models_used: Set<string>;
        }>();

        for (const msg of rawData ?? []) {
            const existing = sessionMap.get(msg.user_id);

            const truncatedContent = msg.content?.slice(0, 120) || "—";
            
            if (!existing) {
                sessionMap.set(msg.user_id, {
                    user_id: msg.user_id,
                    total_messages: 1,
                    user_messages: msg.role === "user" ? 1 : 0,
                    assistant_messages: msg.role === "assistant" ? 1 : 0,
                    last_message_content: truncatedContent,
                    last_message_role: msg.role,
                    first_message_at: msg.created_at,
                    last_message_at: msg.created_at,
                    models_used: msg.model ? new Set([msg.model]) : new Set(),
                });
            } else {
                existing.total_messages++;
                if (msg.role === "user") existing.user_messages++;
                else existing.assistant_messages++;
                if (msg.model) existing.models_used.add(msg.model);

                if (msg.created_at < existing.first_message_at) existing.first_message_at = msg.created_at;
                if (msg.created_at > existing.last_message_at) {
                    existing.last_message_at = msg.created_at;
                    existing.last_message_content = truncatedContent;
                    existing.last_message_role = msg.role;
                }
            }
        }

        const userIds = Array.from(sessionMap.keys());
        const { data: profiles } = userIds.length > 0
            ? await supabase.from("profiles").select("id, email, full_name, avatar_url").in("id", userIds)
            : { data: [] };

        const profileMap = new Map(
            (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
        );

        const missingUserIds = userIds.filter(id => !profileMap.has(id));
        if (missingUserIds.length > 0) {
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const authUserMap = new Map(
                (authUsers?.users ?? [])
                    .filter((u: any) => missingUserIds.includes(u.id))
                    .map((u: any) => [u.id, { email: u.email, full_name: u.user_metadata?.full_name ?? null, avatar_url: u.user_metadata?.avatar_url ?? null }])
            );
            authUserMap.forEach((value, key) => profileMap.set(key, value));
        }

        let sessions: AdminChatSession[] = Array.from(sessionMap.values()).map((s) => {
            const profile = profileMap.get(s.user_id);
            return {
                user_id: s.user_id,
                user_email: profile?.email ?? "Unknown",
                user_name: profile?.full_name ?? null,
                user_avatar: profile?.avatar_url ?? null,
                total_messages: s.total_messages,
                user_messages: s.user_messages,
                assistant_messages: s.assistant_messages,
                last_message_preview: s.last_message_content,
                last_message_role: s.last_message_role,
                first_message_at: s.first_message_at,
                last_message_at: s.last_message_at,
                models_used: Array.from(s.models_used),
            };
        });

        sessions.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

        if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            sessions = sessions.filter(
                (s) =>
                    s.user_email.toLowerCase().includes(lowerSearch) ||
                    s.user_name?.toLowerCase().includes(lowerSearch) ||
                    s.last_message_preview.toLowerCase().includes(lowerSearch)
            );
        }

        const totalCount = sessions.length;

        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        const paginatedSessions = sessions.slice(from, to);

        return { data: paginatedSessions, error: null, count: totalCount };
    } catch (err) {
        return { data: [], error: err instanceof Error ? err.message : "Failed to fetch chat sessions", count: 0 };
    }
}

export async function fetchUserChatMessages(
    userId: string,
    limit: number = 20,
    before?: string
): Promise<{ data: AdminChatMessage[]; error: string | null; hasMore: boolean }> {
    let query = supabase
        .from("chatbot_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit + 1); 

    if (before) {
        query = query.lt("created_at", before);
    }

    const { data, error } = await query;

    if (error) return { data: [], error: error.message, hasMore: false };

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .eq("id", userId)
        .single();

    const hasMore = (data ?? []).length > limit;
    const messages = (data ?? []).slice(0, limit);

    const mappedData = messages.map((row: any) => mapRow(row, profileData));

    return { data: mappedData.reverse(), error: null, hasMore };
}

export async function fetchAdminChatbotStats(): Promise<AdminChatbotStats | null> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const { count: totalMessages } = await supabase
        .from("chatbot_messages")
        .select("*", { count: "exact", head: true });

    const { count: totalUserMessages } = await supabase
        .from("chatbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

    const { count: totalAssistantMessages } = await supabase
        .from("chatbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "assistant");

    const { data: activeUsersData } = await supabase
        .from("chatbot_messages")
        .select("user_id");
    const activeUsers = new Set((activeUsersData ?? []).map((m: any) => m.user_id)).size;

    const avgMessagesPerUser = activeUsers > 0 ? (totalMessages ?? 0) / activeUsers : 0;

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

    const currentMonthCount = messageGrowth[messageGrowth.length - 1]?.count ?? 0;
    const previousMonthCount = messageGrowth[messageGrowth.length - 2]?.count ?? 0;
    const monthOverMonthGrowth = previousMonthCount > 0
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

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

export async function deleteAdminChatMessage(msgId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("chatbot_messages").delete().eq("id", msgId);
    if (error) return { error: error.message };
    return { error: null };
}

export async function deleteUserChatSession(userId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("chatbot_messages").delete().eq("user_id", userId);
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
