"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  fetchDashboardSummary,
  fetchRecentTransactions,
  fetchBudgetProgress,
  fetchCategoryBreakdown,
  fetchMonthlyChart,
  fetchSpendingTrends,
  fetchPendingInvitations,
  fetchInsights,
  acceptInvitation,
  declineInvitation,
  type DashboardSummary,
  type RecentTransaction,
  type BudgetProgress,
  type CategoryBreakdownItem,
  type MonthlyChartPoint,
  type SpendingTrend,
  type PendingInvitation,
  type InsightItem,
} from "./dashboard-service";

export function useDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const userEmail = user?.email ?? "";

  // ----- Data state -----
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyChartPoint[]>([]);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);

  // ----- Loading / error -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----- Derived: user display name -----
  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  // ----- Greeting based on time of day -----
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // ----- Fetch all dashboard data -----
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [
        summaryResult,
        txResult,
        budgetResult,
        categoryResult,
        chartResult,
        trendsResult,
        invitesResult,
        insightsResult,
      ] = await Promise.all([
        fetchDashboardSummary(userId),
        fetchRecentTransactions(userId, 5),
        fetchBudgetProgress(userId, 5),
        fetchCategoryBreakdown(userId),
        fetchMonthlyChart(userId, 6),
        fetchSpendingTrends(userId, 4),
        fetchPendingInvitations(userId, userEmail),
        fetchInsights(userId),
      ]);

      setSummary(summaryResult);
      setRecentTransactions(txResult);
      setBudgetProgress(budgetResult);
      setCategoryBreakdown(categoryResult);
      setMonthlyChart(chartResult);
      setSpendingTrends(trendsResult);
      setPendingInvitations(invitesResult);
      setInsights(insightsResult);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Invitation actions -----
  const handleAcceptInvitation = useCallback(
    async (invitationId: string) => {
      const { error } = await acceptInvitation(invitationId, userId);
      if (error) return { error };
      setPendingInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      // Refresh data after accepting
      fetchData();
      return { error: null };
    },
    [userId, fetchData]
  );

  const handleDeclineInvitation = useCallback(
    async (invitationId: string) => {
      const { error } = await declineInvitation(invitationId);
      if (error) return { error };
      setPendingInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      return { error: null };
    },
    []
  );

  // ----- Refetch -----
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data
    summary,
    recentTransactions,
    budgetProgress,
    categoryBreakdown,
    monthlyChart,
    spendingTrends,
    pendingInvitations,
    insights,
    // User info
    userName,
    greeting: getGreeting(),
    // State
    loading,
    error,
    refetch,
    // Actions
    handleAcceptInvitation,
    handleDeclineInvitation,
  };
}
