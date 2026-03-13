import { createClient } from "@/lib/supabase/client";
import type { AdminAnalyticsReport, AdminAnalyticsStats, AdminAnalyticsFilters, UserAnalyticsSummary, UserAnalyticsDetails } from "./types";

const supabase = createClient();

export async function fetchUserAnalyticsSummaries(
    filters: AdminAnalyticsFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: UserAnalyticsSummary[]; error: string | null; count: number | null }> {
    try {

        let dateFilter = '';
        if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
            const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
            const endDate = new Date(filters.year, filters.month, 0);
            const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
            dateFilter = `AND r.generated_at >= '${start}' AND r.generated_at <= '${end}'`;
        } else if (filters.year !== "all" && filters.year) {
            dateFilter = `AND r.generated_at >= '${filters.year}-01-01' AND r.generated_at <= '${filters.year}-12-31'`;
        }

        const reportTypeFilter = filters.report_type ? `AND r.report_type = '${filters.report_type}'` : '';
        const timeframeFilter = filters.timeframe ? `AND r.timeframe = '${filters.timeframe}'` : '';
        const userIdFilter = filters.userId ? `AND r.user_id = '${filters.userId}'` : '';

        const { data: userData, error: userError, count } = await supabase.rpc('get_user_analytics_summary', {
            date_filter: dateFilter,
            report_type_filter: reportTypeFilter,
            timeframe_filter: timeframeFilter,
            user_id_filter: userIdFilter,
            page_num: page,
            page_size: pageSize
        });

        if (userError) {

            return await fetchUserAnalyticsSummariesFallback(filters, page, pageSize);
        }

        return { data: userData || [], error: null, count: count || 0 };
    } catch (error) {
        console.error("Error in fetchUserAnalyticsSummaries:", error);

        return await fetchUserAnalyticsSummariesFallback(filters, page, pageSize);
    }
}

async function fetchUserAnalyticsSummariesFallback(
    filters: AdminAnalyticsFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: UserAnalyticsSummary[]; error: string | null; count: number | null }> {
    try {

        let query = supabase
            .from("ai_reports")
            .select("*, profiles(email, full_name, avatar_url)");

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

        const { data: reports, error } = await query;
        if (error) return { data: [], error: error.message, count: null };

        const userMap = new Map<string, UserAnalyticsSummary>();

        for (const report of reports || []) {
            const userId = report.user_id;
            const profile = report.profiles as any;

            if (!userMap.has(userId)) {
                userMap.set(userId, {
                    user_id: userId,
                    user_email: profile?.email || 'Unknown',
                    user_name: profile?.full_name,
                    user_avatar: profile?.avatar_url,
                    total_reports: 0,
                    total_transactions: 0,
                    active_budgets: 0,
                    active_goals: 0,
                    last_updated: report.generated_at || '',
                    avg_confidence_level: 0,
                    avg_accuracy_score: 0,
                    total_data_points: 0,
                    report_type_breakdown: [],
                    anomaly_count: 0,
                    has_ai_insights: false,
                });
            }

            const userSummary = userMap.get(userId)!;
            userSummary.total_reports++;
            userSummary.total_data_points += report.data_points || 0;

            if (report.generated_at && report.generated_at > userSummary.last_updated) {
                userSummary.last_updated = report.generated_at;
            }
        }

        for (const [userId, summary] of userMap.entries()) {
            const userReports = (reports || []).filter(r => r.user_id === userId);

            const confidenceLevels = userReports.map(r => r.confidence_level).filter(Boolean);
            const accuracyScores = userReports.map(r => r.accuracy_score).filter(Boolean);

            summary.avg_confidence_level = confidenceLevels.length > 0
                ? confidenceLevels.reduce((a, b) => a + b, 0) / confidenceLevels.length
                : 0;
            summary.avg_accuracy_score = accuracyScores.length > 0
                ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
                : 0;

            const typeMap = new Map<string, number>();
            userReports.forEach(r => {
                typeMap.set(r.report_type, (typeMap.get(r.report_type) || 0) + 1);
            });
            summary.report_type_breakdown = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));

            summary.has_ai_insights = userReports.some(r => r.insights || r.recommendations);

            const [transactionsResult, budgetsResult, goalsResult, anomaliesResult] = await Promise.all([
                supabase.from("transactions").select("id", { count: "exact", head: true }).eq("user_id", userId),
                supabase.from("budgets").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
                supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "in_progress"),
                supabase.from("anomaly_alerts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
            ]);

            summary.total_transactions = transactionsResult.count || 0;
            summary.active_budgets = budgetsResult.count || 0;
            summary.active_goals = goalsResult.count || 0;
            summary.anomaly_count = anomaliesResult.count || 0;
        }

        const allUsers = Array.from(userMap.values()).sort((a, b) =>
            new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
        );

        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        const paginatedUsers = allUsers.slice(from, to);

        return { data: paginatedUsers, error: null, count: allUsers.length };
    } catch (error) {
        console.error("Error in fallback aggregation:", error);
        return { data: [], error: error instanceof Error ? error.message : "Failed to fetch user analytics", count: null };
    }
}

export async function fetchUserAnalyticsDetails(userId: string): Promise<{ data: UserAnalyticsDetails | null; error: string | null }> {
    try {

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email, full_name, avatar_url")
            .eq("id", userId)
            .single();

        if (profileError) return { data: null, error: profileError.message };

        const { data: reports, error: reportsError } = await supabase
            .from("ai_reports")
            .select("*")
            .eq("user_id", userId)
            .order("generated_at", { ascending: false });

        if (reportsError) return { data: null, error: reportsError.message };

        const [transactionsResult, budgetsResult, goalsResult, anomaliesResult, resolvedAnomaliesResult] = await Promise.all([
            supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(100),
            supabase.from("budgets").select("*").eq("user_id", userId).eq("status", "active"),
            supabase.from("goals").select("*").eq("user_id", userId).eq("status", "in_progress"),
            supabase.from("anomaly_alerts").select("*").eq("user_id", userId).eq("status", "active").order("detected_at", { ascending: false }),
            supabase.from("anomaly_alerts").select("*").eq("user_id", userId).eq("status", "resolved").order("detected_at", { ascending: false }),
        ]);

        const latestReport = reports?.[0];

        const details: UserAnalyticsDetails = {
            user_id: userId,
            user_email: profile.email,
            user_name: profile.full_name,
            user_avatar: profile.avatar_url,
            total_transactions: transactionsResult.count || 0,
            active_budgets: budgetsResult.count || 0,
            active_goals: goalsResult.count || 0,
            last_updated: latestReport?.generated_at || new Date().toISOString(),
            report_settings: {
                report_type: latestReport?.report_type || 'spending',
                timeframe: latestReport?.timeframe || 'month',
                chart_type: 'pie',
            },
            anomalies: {
                active: anomaliesResult.count || 0,
                resolved: resolvedAnomaliesResult.count || 0,
                recent: (anomaliesResult.data || []).slice(0, 5).map(a => ({
                    id: a.id,
                    type: a.anomaly_type,
                    severity: a.severity,
                    description: a.description,
                    detected_at: a.detected_at,
                })),
            },
            ai_insights: {
                has_insights: reports?.some(r => r.insights || r.recommendations) || false,
                last_generated: latestReport?.generated_at || null,
                summary: latestReport?.summary || null,
                recommendations: latestReport?.recommendations || null,
            },
            charts: {
                spending_by_category: null,
                income_vs_expense: null,
                trends: null,
            },
            reports: (reports || []).map(r => ({
                ...r,
                user_email: profile.email,
                user_name: profile.full_name,
                user_avatar: profile.avatar_url,
            })),
        };

        return { data: details, error: null };
    } catch (error) {
        console.error("Error fetching user analytics details:", error);
        return { data: null, error: error instanceof Error ? error.message : "Failed to fetch user details" };
    }
}

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
      profiles ( email, full_name, avatar_url )
    `,
            { count: "exact" }
        )
        .order("generated_at", { ascending: false });

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

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

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

export async function fetchAdminAnalyticsStats(): Promise<AdminAnalyticsStats | null> {
    const { data: reports, count: totalReports } = await supabase
        .from("ai_reports")
        .select("report_type, timeframe, confidence_level, accuracy_score, data_points, generation_time_ms, user_id", { count: "exact" });

    if (!reports) return null;

    let totalConfidence = 0;
    let totalAccuracy = 0;
    let totalDataPointsAnalyzed = 0;
    let totalGenTime = 0;

    let validConfidenceCount = 0;
    let validAccuracyCount = 0;
    let validGenTimeCount = 0;

    const typeMap = new Map<string, number>();
    const timeframeMap = new Map<string, number>();
    const userTotals = new Map<string, number>();

    for (const r of reports) {
        if (r.confidence_level != null) { totalConfidence += Number(r.confidence_level); validConfidenceCount++; }
        if (r.accuracy_score != null) { totalAccuracy += Number(r.accuracy_score); validAccuracyCount++; }
        if (r.data_points != null) { totalDataPointsAnalyzed += Number(r.data_points); }
        if (r.generation_time_ms != null) { totalGenTime += Number(r.generation_time_ms); validGenTimeCount++; }

        typeMap.set(r.report_type, (typeMap.get(r.report_type) ?? 0) + 1);

        timeframeMap.set(r.timeframe, (timeframeMap.get(r.timeframe) ?? 0) + 1);

        if (r.user_id) {
            userTotals.set(r.user_id, (userTotals.get(r.user_id) ?? 0) + 1);
        }
    }

    const reportTypeDistribution = Array.from(typeMap.entries()).map(([type, count]) => ({
        type: type || 'unknown',
        count,
        percentage: Math.round((count / (reports.length || 1)) * 100),
    }));

    const timeframeDistribution = Array.from(timeframeMap.entries()).map(([timeframe, count]) => ({
        timeframe: timeframe || 'unknown',
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
        totalInsightsGenerated: reports.length,
        avgConfidenceLevel: validConfidenceCount ? totalConfidence / validConfidenceCount : 0,
        avgAccuracyScore: validAccuracyCount ? totalAccuracy / validAccuracyCount : 0,
        totalDataPointsAnalyzed,
        avgGenerationTimeMs: validGenTimeCount ? totalGenTime / validGenTimeCount : 0,
        reportTypeDistribution,
        timeframeDistribution,
        activeUsers: userTotals.size,
        topUsers,
    };
}

export async function deleteAdminAnalytics(reportId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").delete().eq("id", reportId);
    if (error) return { error: error.message };
    return { error: null };
}

export async function updateAdminAnalytics(reportId: string, updates: Partial<AdminAnalyticsReport>): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").update(updates).eq("id", reportId);
    if (error) return { error: error.message };
    return { error: null };
}

export async function createAdminAnalytics(data: Omit<AdminAnalyticsReport, "id" | "created_at" | "updated_at">): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").insert(data);
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
