"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-context";
import type {
  BudgetType,
  CategoryOption,
} from "../_components/types";
import {
  fetchBudgetsList,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchExpenseCategories,
  computeBudgetSummary,
  computeCategoryAllocation,
  fetchBudgetMonthlyTrend,
  type BudgetMonthlyTrendPoint,
  type BudgetFilters,
  type BudgetSummary,
  type CategoryAllocation,
} from "./budget-service";

export function useBudgets() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  // ----- Filter state -----
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  // ----- Data state -----
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<BudgetMonthlyTrendPoint[]>([]);

  // ----- Lookup state -----
  const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>([]);

  // ----- Loading / error -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----- Build filters object -----
  const filters: BudgetFilters = useMemo(
    () => ({
      status: statusFilter || undefined,
      period: periodFilter || undefined,
      categoryId: categoryFilter || undefined,
    }),
    [statusFilter, periodFilter, categoryFilter]
  );

  // ----- Fetch lookups once -----
  useEffect(() => {
    if (!userId) return;
    fetchExpenseCategories(userId).then(setExpenseCategories);
  }, [userId]);

  // ----- Fetch main data when filters change -----
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [budgetsResult, trendResult] = await Promise.all([
        fetchBudgetsList(userId, filters),
        fetchBudgetMonthlyTrend(userId, 6),
      ]);
      setBudgets(budgetsResult.data);
      setMonthlyTrend(trendResult);
      if (budgetsResult.error) setError(budgetsResult.error);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Client-side search filtering (instant, no re-query) -----
  const filteredBudgets = useMemo(() => {
    if (!search.trim()) return budgets;
    const q = search.toLowerCase();
    return budgets.filter(
      (b) =>
        b.budget_name.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q) ||
        (b.expense_category_name ?? "").toLowerCase().includes(q) ||
        (b.category_name ?? "").toLowerCase().includes(q)
    );
  }, [budgets, search]);

  // ----- Computed aggregates -----
  const summary: BudgetSummary = useMemo(
    () => computeBudgetSummary(filteredBudgets),
    [filteredBudgets]
  );

  const categoryAllocation: CategoryAllocation[] = useMemo(
    () => computeCategoryAllocation(filteredBudgets),
    [filteredBudgets]
  );

  // ----- Refetch (passed to modals as onSuccess) -----
  const refetch = useCallback(() => {
    fetchData();
    if (!userId) return;
    fetchExpenseCategories(userId).then(setExpenseCategories);
  }, [fetchData, userId]);

  // ----- Reset filters -----
  const resetFilters = useCallback(() => {
    setStatusFilter("");
    setPeriodFilter("");
    setCategoryFilter("");
    setSearch("");
  }, []);

  return {
    // Data
    budgets: filteredBudgets,
    summary,
    categoryAllocation,
    monthlyTrend,
    // Lookups
    expenseCategories,
    // Filters
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    resetFilters,
    // State
    loading,
    error,
    refetch,
  };
}
