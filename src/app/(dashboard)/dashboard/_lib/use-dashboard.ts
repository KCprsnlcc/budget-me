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
  fetchLatestInvitation,
  fetchInsights,
  acceptInvitation,
  declineInvitation,
  type DashboardSummary,
  type RecentTransaction,
  type BudgetProgress,
  type CategoryBreakdownItem,
  type MonthlyChartPoint,
  type SpendingTrend,
  type InsightItem,
} from "./dashboard-service";
import type { Invitation } from "@/app/(dashboard)/family/_components/types";

export function useDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const userEmail = user?.email ?? "";

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyChartPoint[]>([]);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [latestInvitation, setLatestInvitation] = useState<Invitation | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  const [greeting, setGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let newGreeting: string;
      if (hour < 12) newGreeting = "Good morning";
      else if (hour < 17) newGreeting = "Good afternoon";
      else newGreeting = "Good evening";
      
      setGreeting(prev => prev !== newGreeting ? newGreeting : prev);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

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
        invitationResult,
        insightsResult,
      ] = await Promise.all([
        fetchDashboardSummary(userId),
        fetchRecentTransactions(userId, 5),
        fetchBudgetProgress(userId, 5),
        fetchCategoryBreakdown(userId),
        fetchMonthlyChart(userId, 6),
        fetchSpendingTrends(userId, 4),
        fetchLatestInvitation(userEmail),
        fetchInsights(userId),
      ]);

      setSummary(summaryResult);
      setRecentTransactions(txResult);
      setBudgetProgress(budgetResult);
      setCategoryBreakdown(categoryResult);
      setMonthlyChart(chartResult);
      setSpendingTrends(trendsResult);
      setLatestInvitation(invitationResult);
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

  const handleAcceptInvitation = useCallback(
    async (invitationId: string) => {
      const { error } = await acceptInvitation(invitationId, userId);
      if (error) return { error };
      setLatestInvitation(null);
      fetchData();
      return { error: null };
    },
    [userId, fetchData]
  );

  const handleDeclineInvitation = useCallback(
    async (invitationId: string) => {
      const { error } = await declineInvitation(invitationId);
      if (error) return { error };
      setLatestInvitation(null);
      return { error: null };
    },
    []
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const refreshInsights = useCallback(async () => {
    if (!userId) return;
    setInsightsLoading(true);
    
    try {
      const cacheBuster = Date.now();
      const insightsResult = await fetchInsights(userId);
      
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

  const refreshSpendingTrends = useCallback(async () => {
    if (!userId) return;
    setTrendsLoading(true);
    
    try {
      const cacheBuster = Date.now();
      const trendsResult = await fetchSpendingTrends(userId, 4);
      
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
    summary,
    recentTransactions,
    budgetProgress,
    categoryBreakdown,
    monthlyChart,
    spendingTrends,
    latestInvitation,
    insights,
    userName,
    greeting,
    loading,
    insightsLoading,
    trendsLoading,
    error,
    refetch,
    refreshInsights,
    refreshSpendingTrends,
    handleAcceptInvitation,
    handleDeclineInvitation,
  };
}
