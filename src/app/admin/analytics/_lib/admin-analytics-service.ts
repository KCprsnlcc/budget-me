import { createClient } from "@/lib/supabase/client";
import type { AdminAnalyticsReport, AdminAnalyticsStats, AdminAnalyticsFilters } from "./types";

const supabase = createClient();

// Fetch all analytics with filters (admin view)
export async function fetchAdminAnalytics(
    filters: AdminAnalyticsFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminAnalyticsReport[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("ai_reports")
        .select(
            `
      *,
      profiles!ai_reports_user_id_fkey ( email, full_name, avatar_url )
    `,
            { count: "exact" }
        )
        .order("generated_at", { ascending: false });

    // Apply filters
    if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
        const endDate = new Date(filters.year, filters.month, 0);
        const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
        query = query.gte("generated_at", start).lte("generated_at", end);
    } else if (filters.year !== "all" && filters.year) {
        query = query.gte("generated_at", `${filters.year}-01-01`).lte("generated_at", `${filters.year}-12-31`);
    }

    if (filters.report_type) query = query.eq("report_type", filters.report_type);
    if (filters.timeframe) query = query.eq("timeframe", filters.timeframe);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.ai_service) query = query.eq("ai_service", filters.ai_service);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

    // Map analytics with user data
    const mappedData = (data ?? []).map((row: any) => {
        const profile = row.profiles as Record<string, any> | null;
        return {
            ...row,
            user_email: profile?.email ?? undefined,
            user_name: profile?.full_name ?? undefined,
            user_avatar: profile?.avatar_url ?? undefined,
        } as AdminAnalyticsReport;
    });

    return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch admin analytics statistics
export async function fetchAdminAnalyticsStats(): Promise<AdminAnalyticsStats | null> {
    const { data: reports, count: totalReports } = await supabase
        .from("ai_reports")
        .select("report_type, confidence_level, accuracy_score, data_points, generation_time_ms, user_id", { count: "exact" });

    if (!reports) return null;

    let totalConfidence = 0;
    let totalAccuracy = 0;
    let totalDataPointsAnalyzed = 0;
    let totalGenTime = 0;

    let validConfidenceCount = 0;
    let validAccuracyCount = 0;
    let validGenTimeCount = 0;

    const typeMap = new Map<string, number>();
    const userTotals = new Map<string, number>();

    for (const r of reports) {
        if (r.confidence_level != null) { totalConfidence += Number(r.confidence_level); validConfidenceCount++; }
        if (r.accuracy_score != null) { totalAccuracy += Number(r.accuracy_score); validAccuracyCount++; }
        if (r.data_points != null) { totalDataPointsAnalyzed += Number(r.data_points); }
        if (r.generation_time_ms != null) { totalGenTime += Number(r.generation_time_ms); validGenTimeCount++; }

        // Aggregate types
        typeMap.set(r.report_type, (typeMap.get(r.report_type) ?? 0) + 1);

        // Aggregate users
        if (r.user_id) {
            userTotals.set(r.user_id, (userTotals.get(r.user_id) ?? 0) + 1);
        }
    }

    const reportTypeDistribution = Array.from(typeMap.entries()).map(([type, count]) => ({
        type: type || 'unknown',
        count,
        percentage: Math.round((count / (reports.length || 1)) * 100),
    }));

    const sortedUsers = Array.from(userTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topUserIds = sortedUsers.map(([userId]) => userId);
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", topUserIds);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const topUsers = sortedUsers.map(([userId, count]) => {
        const profile = profileMap.get(userId);
        return {
            user_id: userId,
            email: profile?.email ?? "Unknown",
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            report_count: count,
        };
    });

    return {
        totalReports: totalReports ?? 0,
        totalInsightsGenerated: reports.length, // approximation
        avgConfidenceLevel: validConfidenceCount ? totalConfidence / validConfidenceCount : 0,
        avgAccuracyScore: validAccuracyCount ? totalAccuracy / validAccuracyCount : 0,
        totalDataPointsAnalyzed,
        avgGenerationTimeMs: validGenTimeCount ? totalGenTime / validGenTimeCount : 0,
        reportTypeDistribution,
        activeUsers: userTotals.size,
        topUsers,
    };
}

// Delete analytics (admin)
export async function deleteAdminAnalytics(reportId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").delete().eq("id", reportId);
    if (error) return { error: error.message };
    return { error: null };
}

// Update analytics (admin)
export async function updateAdminAnalytics(reportId: string, updates: Partial<AdminAnalyticsReport>): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").update(updates).eq("id", reportId);
    if (error) return { error: error.message };
    return { error: null };
}

// Create analytics (admin)
export async function createAdminAnalytics(data: Omit<AdminAnalyticsReport, "id" | "created_at" | "updated_at">): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").insert(data);
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
