"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  fetchGoalsForPage,
  fetchGoalSummary,
  type GoalFilters,
  type GoalSummary,
} from "./goal-service";
import type { GoalType } from "../_components/types";

export function useGoals() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  // ----- Filter state -----
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");

  // ----- Data state -----
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);

  // ----- Loading / error -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----- Build filters object -----
  const filters: GoalFilters = useMemo(
    () => ({
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      category: categoryFilter || undefined,
      month,
      year,
    }),
    [statusFilter, priorityFilter, categoryFilter, month, year]
  );

  // ----- Fetch main data when filters change -----
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [goalsResult, summaryResult] = await Promise.all([
        fetchGoalsForPage(userId, filters),
        fetchGoalSummary(userId),
      ]);

      setGoals(goalsResult.data);
      if (goalsResult.error) setError(goalsResult.error);
      setSummary(summaryResult);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Client-side search filtering (instant, no re-query) -----
  const filteredGoals = useMemo(() => {
    if (!search.trim()) return goals;
    const q = search.toLowerCase();
    return goals.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q) ||
        (g.notes ?? "").toLowerCase().includes(q)
    );
  }, [goals, search]);

  // ----- Refetch (passed to modals as onSuccess) -----
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ----- Reset filters -----
  const resetFilters = useCallback(() => {
    const now = new Date();
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setSearch("");
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setSearch("");
    setMonth("all");
    setYear("all");
  }, []);

  return {
    // Data
    goals: filteredGoals,
    allGoals: goals,
    summary,
    // Filters
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    month, setMonth,
    year, setYear,
    resetFilters,
    resetFiltersToAll,
    // State
    loading,
    error,
    refetch,
  };
}
