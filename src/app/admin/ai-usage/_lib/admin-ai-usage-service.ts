import { createClient } from "@/lib/supabase/client";
import type { AdminAIUsage, AdminAIUsageStats, AdminAIUsageFilters } from "./types";

const supabase = createClient();

const DAILY_LIMIT = 25;

// Map raw DB row to AdminAIUsage
function mapRow(row: Record<string, any>): AdminAIUsage {
  const profile = row.profiles as Record<string, any> | null;

  return {
    id: row.id,
    user_id: row.user_id,
    usage_date: row.usage_date,
    predictions_used: row.predictions_used,
    insights_used: row.insights_used,
    chatbot_used: row.chatbot_used,
    total_used: row.total_used,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_email: profile?.email ?? undefined,
    user_name: profile?.full_name ?? undefined,
    user_avatar: profile?.avatar_url ?? undefined,
  };
}

// Fetch all AI usage records with filters (admin view)
export async function fetchAdminAIUsage(
  filters: AdminAIUsageFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: AdminAIUsage[]; error: string | null; count: number | null }> {
  let query = supabase
    .from("ai_usage_rate_limits")
    .select("*", { count: "exact" })
    .order("usage_date", { ascending: false })
    .order("total_used", { ascending: false });

  // Apply filters
  if (filters.startDate) {
    query = query.gte("usage_date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("usage_date", filters.endDate);
  }
  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }
  if (filters.minUsage !== undefined) {
    query = query.gte("total_used", filters.minUsage);
  }
  if (filters.maxUsage !== undefined) {
    query = query.lte("total_used", filters.maxUsage);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return { data: [], error: error.message, count: null };

  // Fetch user profiles separately
  const userIds = [...new Set((data ?? []).map((usage: any) => usage.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", userIds);

  // Create a map of user profiles
  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name, avatar_url: p.avatar_url }])
  );

  // Map usage records with user data
  const mappedData = (data ?? []).map((row: any) => {
    const profile = profileMap.get(row.user_id);
    return mapRow({ ...row, profiles: profile });
  });

  return { data: mappedData, error: null, count: count ?? 0 };
}

// Fetch admin AI usage statistics
export async function fetchAdminAIUsageStats(): Promise<AdminAIUsageStats | null> {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Total usage across all time
  const { data: allUsage } = await supabase
    .from("ai_usage_rate_limits")
    .select("total_used, predictions_used, insights_used, chatbot_used");

  const totalUsage = (allUsage ?? []).reduce((sum, u) => sum + u.total_used, 0);
  const totalPredictions = (allUsage ?? []).reduce((sum, u) => sum + u.predictions_used, 0);
  const totalInsights = (allUsage ?? []).reduce((sum, u) => sum + u.insights_used, 0);
  const totalChatbot = (allUsage ?? []).reduce((sum, u) => sum + u.chatbot_used, 0);

  // Total unique users
  const { data: uniqueUsers } = await supabase
    .from("ai_usage_rate_limits")
    .select("user_id");
  const totalUsers = new Set((uniqueUsers ?? []).map((u: any) => u.user_id)).size;

  // Average usage per user
  const avgUsagePerUser = totalUsers > 0 ? totalUsage / totalUsers : 0;

  // Active users today
  const { data: todayUsage } = await supabase
    .from("ai_usage_rate_limits")
    .select("user_id")
    .eq("usage_date", today);
  const activeUsersToday = new Set((todayUsage ?? []).map((u: any) => u.user_id)).size;

  // Users at limit today
  const { data: limitUsers } = await supabase
    .from("ai_usage_rate_limits")
    .select("user_id")
    .eq("usage_date", today)
    .gte("total_used", DAILY_LIMIT);
  const usersAtLimit = (limitUsers ?? []).length;

  // Usage growth (last 7 days)
  const usageGrowth: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];

    const { data } = await supabase
      .from("ai_usage_rate_limits")
      .select("total_used")
      .eq("usage_date", dateStr);

    const count = (data ?? []).reduce((sum, u) => sum + u.total_used, 0);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    usageGrowth.push({ date: label, count });
  }

  // Daily growth
  const todayCount = usageGrowth[usageGrowth.length - 1]?.count ?? 0;
  const yesterdayCount = usageGrowth[usageGrowth.length - 2]?.count ?? 0;
  const dailyGrowth = yesterdayCount > 0 
    ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 
    : 0;

  // Feature distribution
  const featureTotal = totalPredictions + totalInsights + totalChatbot;
  const featureDistribution = [
    {
      feature: "predictions",
      count: totalPredictions,
      percentage: featureTotal > 0 ? Math.round((totalPredictions / featureTotal) * 100) : 0,
    },
    {
      feature: "insights",
      count: totalInsights,
      percentage: featureTotal > 0 ? Math.round((totalInsights / featureTotal) * 100) : 0,
    },
    {
      feature: "chatbot",
      count: totalChatbot,
      percentage: featureTotal > 0 ? Math.round((totalChatbot / featureTotal) * 100) : 0,
    },
  ];

  // Top feature
  const topFeature = featureDistribution.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  );

  // Top users by total usage
  const { data: userUsageData } = await supabase
    .from("ai_usage_rate_limits")
    .select("user_id, total_used, predictions_used, insights_used, chatbot_used");

  const userTotals = new Map<string, { total: number; predictions: number; insights: number; chatbot: number }>();
  for (const usage of userUsageData ?? []) {
    const userId = usage.user_id;
    const current = userTotals.get(userId) ?? { total: 0, predictions: 0, insights: 0, chatbot: 0 };
    userTotals.set(userId, {
      total: current.total + usage.total_used,
      predictions: current.predictions + usage.predictions_used,
      insights: current.insights + usage.insights_used,
      chatbot: current.chatbot + usage.chatbot_used,
    });
  }

  // Get top 5 users
  const sortedUsers = Array.from(userTotals.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Fetch user profiles
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
      total_usage: data.total,
      predictions_used: data.predictions,
      insights_used: data.insights,
      chatbot_used: data.chatbot,
    };
  });

  return {
    totalUsage,
    totalUsers,
    avgUsagePerUser,
    usageGrowth,
    featureDistribution,
    activeUsersToday,
    usersAtLimit,
    peakUsageHour: null, // Not tracking hourly data
    topFeature: { name: topFeature.feature, count: topFeature.count },
    dailyGrowth,
    topUsers,
  };
}

// Delete AI usage record (admin)
export async function deleteAdminAIUsage(usageId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("ai_usage_rate_limits").delete().eq("id", usageId);
  if (error) return { error: error.message };
  return { error: null };
}

// Reset user's AI usage for a specific date (admin)
export async function resetUserAIUsage(userId: string, date: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("ai_usage_rate_limits")
    .update({
      predictions_used: 0,
      insights_used: 0,
      chatbot_used: 0,
      total_used: 0,
    })
    .eq("user_id", userId)
    .eq("usage_date", date);

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
