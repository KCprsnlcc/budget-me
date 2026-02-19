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
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Derived: user display name -----
  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  // ----- Greeting based on time of day -----
  const [greeting, setGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  });

  // Update greeting every minute to keep it current
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let newGreeting: string;
      if (hour < 12) newGreeting = "Good morning";
      else if (hour < 17) newGreeting = "Good afternoon";
      else newGreeting = "Good evening";
      
      setGreeting(prev => prev !== newGreeting ? newGreeting : prev);
    };

    // Update immediately and then every minute
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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

  // ----- Refresh insights only -----
  const refreshInsights = useCallback(async () => {
    if (!userId) return;
    setInsightsLoading(true);
    
    try {
      // Add cache-busting by including timestamp in a way that forces fresh data
      const cacheBuster = Date.now();
      const insightsResult = await fetchInsights(userId);
      
      // Force state update even if data is the same by adding timestamp
      setInsights(insightsResult.map(insight => ({
        ...insight,
        _cacheBust: cacheBuster
      })));
    } catch (err) {
      console.error('Failed to refresh insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  }, [userId]);

  // ----- Refresh spending trends only -----
  const refreshSpendingTrends = useCallback(async () => {
    if (!userId) return;
    setTrendsLoading(true);
    
    try {
      // Add cache-busting by including timestamp
      const cacheBuster = Date.now();
      const trendsResult = await fetchSpendingTrends(userId, 4);
      
      // Force state update even if data is the same by adding timestamp
      setSpendingTrends(trendsResult.map(trend => ({
        ...trend,
        _cacheBust: cacheBuster
      })));
    } catch (err) {
      console.error('Failed to refresh spending trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  }, [userId]);

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
    greeting,
    // State
    loading,
    insightsLoading,
    trendsLoading,
    error,
    refetch,
    refreshInsights,
    refreshSpendingTrends,
    // Actions
    handleAcceptInvitation,
    handleDeclineInvitation,
  };
}
