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
  const [scopeFilter, setScopeFilter] = useState<"all" | "personal" | "family">("all");
  const [search, setSearch] = useState("");

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
      scope: scopeFilter,
    }),
    [statusFilter, priorityFilter, categoryFilter, scopeFilter]
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
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setScopeFilter("all");
    setSearch("");
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
    scopeFilter,
    setScopeFilter,
    search,
    setSearch,
    resetFilters,
    // State
    loading,
    error,
    refetch,
  };
}
