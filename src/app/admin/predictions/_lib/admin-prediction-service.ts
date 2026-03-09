import { createClient } from "@/lib/supabase/client";
import type { AdminPredictionReport, AdminAIInsight, AdminPredictionStats, AdminPredictionFilters } from "./types";

const supabase = createClient();

// Map raw DB row to AdminPredictionReport
function mapReportRow(row: Record<string, any>, profile?: Record<string, any> | null): AdminPredictionReport {
    return {
        id: row.id,
        user_id: row.user_id,
        report_type: row.report_type,
        timeframe: row.timeframe,
        insights: row.insights,
        recommendations: row.recommendations,
        summary: row.summary,
        ai_service: row.ai_service,
        ai_model: row.ai_model,
        generation_time_ms: row.generation_time_ms,
        token_usage: row.token_usage,
        confidence_level: row.confidence_level ? Number(row.confidence_level) : null,
        data_points: row.data_points ?? 0,
        accuracy_score: row.accuracy_score ? Number(row.accuracy_score) : null,
        model_version: row.model_version,
        prediction_data: row.prediction_data,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_email: profile?.email ?? undefined,
        user_name: profile?.full_name ?? undefined,
        user_avatar: profile?.avatar_url ?? undefined,
    };
}

// Map raw DB row to AdminAIInsight
function mapInsightRow(row: Record<string, any>, profile?: Record<string, any> | null): AdminAIInsight {
    return {
        id: row.id,
        user_id: row.user_id,
        prediction_id: row.prediction_id,
        ai_service: row.ai_service,
        model_used: row.model_used,
        insights: row.insights,
        risk_assessment: row.risk_assessment,
        recommendations: row.recommendations,
        opportunity_areas: row.opportunity_areas,
        prompt_template: row.prompt_template,
        generation_time_ms: row.generation_time_ms,
        token_usage: row.token_usage,
        confidence_level: row.confidence_level ? Number(row.confidence_level) : null,
        daily_usage_count: row.daily_usage_count ?? 0,
        rate_limited: row.rate_limited ?? false,
        retry_after: row.retry_after,
        generated_at: row.generated_at,
        expires_at: row.expires_at,
        cache_key: row.cache_key,
        access_count: row.access_count ?? 0,
        last_accessed_at: row.last_accessed_at,
        model_version: row.model_version,
        processing_status: row.processing_status,
        linked_prediction_id: row.linked_prediction_id,
        anomaly_detected: row.anomaly_detected ?? false,
        anomaly_type: row.anomaly_type,
        admin_validated: row.admin_validated ?? false,
        validation_notes: row.validation_notes,
        data_sources_used: row.data_sources_used,
        user_email: profile?.email ?? undefined,
        user_name: profile?.full_name ?? undefined,
        user_avatar: profile?.avatar_url ?? undefined,
    };
}

// Fetch all AI reports with filters (admin view)
export async function fetchAdminReports(
    filters: AdminPredictionFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminPredictionReport[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("ai_reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

    // Exclude financial_intelligence type - those belong in AI Insights table
    query = query.neq("report_type", "financial_intelligence");

    // Apply filters
    if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01T00:00:00`;
        const endDate = new Date(filters.year, filters.month, 0);
        const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59`;
        query = query.gte("created_at", start).lte("created_at", end);
    } else if (filters.year !== "all" && filters.year) {
        query = query.gte("created_at", `${filters.year}-01-01T00:00:00`).lte("created_at", `${filters.year}-12-31T23:59:59`);
    }

    if (filters.reportType) query = query.eq("report_type", filters.reportType);
    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.modelVersion) query = query.eq("model_version", filters.modelVersion);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

    // Fetch user profiles separately
    const userIds = [...new Set((data ?? []).map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    const mappedData = (data ?? []).map((row: any) => {
        const profile = profileMap.get(row.user_id);
        return mapReportRow(row, profile);
    });

    return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch all AI insights with filters (admin view)
export async function fetchAdminInsights(
    filters: AdminPredictionFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminAIInsight[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("ai_insights")
        .select("*", { count: "exact" })
        .order("generated_at", { ascending: false });

    // Apply filters
    if (filters.month !== "all" && filters.year !== "all" && filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, "0")}-01T00:00:00`;
        const endDate = new Date(filters.year, filters.month, 0);
        const end = `${filters.year}-${String(filters.month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59`;
        query = query.gte("generated_at", start).lte("generated_at", end);
    } else if (filters.year !== "all" && filters.year) {
        query = query.gte("generated_at", `${filters.year}-01-01T00:00:00`).lte("generated_at", `${filters.year}-12-31T23:59:59`);
    }

    if (filters.userId) query = query.eq("user_id", filters.userId);
    if (filters.processingStatus) query = query.eq("processing_status", filters.processingStatus);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { data: [], error: error.message, count: null };

    // Fetch user profiles separately
    const userIds = [...new Set((data ?? []).map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    const mappedData = (data ?? []).map((row: any) => {
        const profile = profileMap.get(row.user_id);
        return mapInsightRow(row, profile);
    });

    return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch admin prediction statistics
export async function fetchAdminPredictionStats(): Promise<AdminPredictionStats | null> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Total reports
    const { count: totalReports } = await supabase
        .from("ai_reports")
        .select("*", { count: "exact", head: true });

    // Total insights
    const { count: totalInsights } = await supabase
        .from("ai_insights")
        .select("*", { count: "exact", head: true });

    // Average accuracy score
    const { data: accuracyData } = await supabase
        .from("ai_reports")
        .select("accuracy_score")
        .not("accuracy_score", "is", null);

    const validAccuracyScores = (accuracyData ?? [])
        .map((r: any) => Number(r.accuracy_score))
        .filter((s: number) => s > 0);
    const avgAccuracy = validAccuracyScores.length > 0
        ? validAccuracyScores.reduce((a: number, b: number) => a + b, 0) / validAccuracyScores.length
        : 0;

    // Average confidence level from insights
    const { data: confData } = await supabase
        .from("ai_insights")
        .select("confidence_level")
        .not("confidence_level", "is", null);

    const confScores = (confData ?? []).map((r: any) => Number(r.confidence_level));
    const avgConfidence = confScores.length > 0
        ? confScores.reduce((a: number, b: number) => a + b, 0) / confScores.length
        : 0;

    // Active users (users with at least one report or insight)
    const { data: reportUsers } = await supabase
        .from("ai_reports")
        .select("user_id");
    const { data: insightUsers } = await supabase
        .from("ai_insights")
        .select("user_id");

    const allUserIds = new Set([
        ...(reportUsers ?? []).map((r: any) => r.user_id),
        ...(insightUsers ?? []).map((r: any) => r.user_id),
    ]);
    const activeUsers = allUserIds.size;

    // Total data points
    const { data: dpData } = await supabase
        .from("ai_reports")
        .select("data_points");
    const totalDataPoints = (dpData ?? []).reduce((sum: number, r: any) => sum + (r.data_points ?? 0), 0);

    // Anomalies detected
    const { count: anomaliesDetected } = await supabase
        .from("ai_insights")
        .select("*", { count: "exact", head: true })
        .eq("anomaly_detected", true);

    // Admin validated
    const { count: adminValidated } = await supabase
        .from("ai_insights")
        .select("*", { count: "exact", head: true })
        .eq("admin_validated", true);

    // Report growth (last 6 months)
    const reportGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const start = `${y}-${String(m).padStart(2, "0")}-01T00:00:00`;
        const endDate = new Date(y, m, 0);
        const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T23:59:59`;

        const { count } = await supabase
            .from("ai_reports")
            .select("*", { count: "exact", head: true })
            .gte("created_at", start)
            .lte("created_at", end);

        const label = d.toLocaleDateString("en-US", { month: "short" });
        reportGrowth.push({ month: label, count: count ?? 0 });
    }

    // Month-over-month growth
    const currentMonthCount = reportGrowth[reportGrowth.length - 1]?.count ?? 0;
    const previousMonthCount = reportGrowth[reportGrowth.length - 2]?.count ?? 0;
    const monthOverMonthGrowth = previousMonthCount > 0
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

    // Model distribution
    const { data: modelData } = await supabase
        .from("ai_reports")
        .select("model_version");

    const modelMap = new Map<string, number>();
    for (const r of modelData ?? []) {
        const model = r.model_version || "Unknown";
        modelMap.set(model, (modelMap.get(model) ?? 0) + 1);
    }

    const modelTotal = modelData?.length ?? 1;
    const modelDistribution = Array.from(modelMap.entries()).map(([model, count]) => ({
        model,
        count,
        percentage: Math.round((count / modelTotal) * 100),
    }));

    // Processing status distribution (from insights)
    const { data: statusData } = await supabase
        .from("ai_insights")
        .select("processing_status");

    const statusMap = new Map<string, number>();
    for (const r of statusData ?? []) {
        const status = r.processing_status || "unknown";
        statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    }

    const statusTotal = statusData?.length ?? 1;
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / statusTotal) * 100),
    }));

    // Top users by report + insight volume
    const userReportCounts = new Map<string, { report_count: number; insight_count: number }>();
    for (const r of reportUsers ?? []) {
        const userId = r.user_id;
        const current = userReportCounts.get(userId) ?? { report_count: 0, insight_count: 0 };
        userReportCounts.set(userId, { ...current, report_count: current.report_count + 1 });
    }
    for (const r of insightUsers ?? []) {
        const userId = r.user_id;
        const current = userReportCounts.get(userId) ?? { report_count: 0, insight_count: 0 };
        userReportCounts.set(userId, { ...current, insight_count: current.insight_count + 1 });
    }

    const sortedUsers = Array.from(userReportCounts.entries())
        .sort((a, b) => (b[1].report_count + b[1].insight_count) - (a[1].report_count + a[1].insight_count))
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
            report_count: data.report_count,
            insight_count: data.insight_count,
        };
    });

    return {
        totalReports: totalReports ?? 0,
        totalInsights: totalInsights ?? 0,
        avgAccuracy: Number(avgAccuracy.toFixed(1)),
        avgConfidence: Number((avgConfidence * 100).toFixed(1)),
        reportGrowth,
        modelDistribution,
        activeUsers,
        totalDataPoints,
        anomaliesDetected: anomaliesDetected ?? 0,
        adminValidated: adminValidated ?? 0,
        monthOverMonthGrowth,
        topUsers,
        statusDistribution,
    };
}

// Delete AI report (admin)
export async function deleteAdminReport(reportId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_reports").delete().eq("id", reportId);
    if (error) return { error: error.message };
    return { error: null };
}

// Delete AI insight (admin)
export async function deleteAdminInsight(insightId: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("ai_insights").delete().eq("id", insightId);
    if (error) return { error: error.message };
    return { error: null };
}

// Update AI insight admin validation
export async function updateAdminInsightValidation(
    insightId: string,
    validated: boolean,
    notes: string | null
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("ai_insights")
        .update({
            admin_validated: validated,
            validation_notes: notes,
        })
        .eq("id", insightId);
    if (error) return { error: error.message };
    return { error: null };
}

// Update AI report data
export async function updateAdminReport(
    reportId: string,
    updates: {
        report_type?: string;
        timeframe?: string;
        accuracy_score?: number | null;
        model_version?: string;
    }
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("ai_reports")
        .update(updates)
        .eq("id", reportId);
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
