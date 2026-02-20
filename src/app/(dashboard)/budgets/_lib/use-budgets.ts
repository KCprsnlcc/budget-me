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
  const now = new Date();
  const [month, setMonth] = useState<number | "all">(now.getMonth() + 1);
  const [year, setYear] = useState<number | "all">(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  // ----- Pagination state -----
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ----- Data state -----
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<BudgetMonthlyTrendPoint[]>([]);

  // ----- Lookup state -----
  const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>([]);

  // ----- Loading / error -----
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Build filters object -----
  const filters: BudgetFilters = useMemo(
    () => ({
      month,
      year,
      status: statusFilter || undefined,
      period: periodFilter || undefined,
      categoryId: categoryFilter || undefined,
    }),
    [month, year, statusFilter, periodFilter, categoryFilter]
  );

  // ----- Fetch lookups once -----
  useEffect(() => {
    if (!userId) return;
    fetchExpenseCategories(userId).then(setExpenseCategories);
  }, [userId]);

  // ----- Fetch main data when filters change -----
  const fetchData = useCallback(async (isFilterChange = false) => {
    if (!userId) return;
    
    if (isFilterChange) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [budgetsResult, trendResult] = await Promise.all([
        fetchBudgetsList(userId, filters, currentPage, pageSize),
        fetchBudgetMonthlyTrend(userId, 6),
      ]);
      setBudgets(budgetsResult.data);
      setTotalCount(budgetsResult.totalCount);
      if (budgetsResult.error) setError(budgetsResult.error);
      
      // Only update trend data on initial load or major filter changes
      if (!isFilterChange || (month !== "all" || year !== "all")) {
        setMonthlyTrend(trendResult);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load budgets.");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [userId, filters, currentPage, pageSize, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Separate effect for filter changes to avoid full refresh -----
  useEffect(() => {
    if (budgets.length > 0) {
      fetchData(true);
    }
  }, [filters, currentPage, pageSize]);

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

  // ----- Refetch only table data (for filter changes) -----
  const refetchTable = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // ----- Reset filters -----
  const resetFilters = useCallback(() => {
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setStatusFilter("");
    setPeriodFilter("");
    setCategoryFilter("");
    setSearch("");
    setCurrentPage(1);
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setMonth("all");
    setYear("all");
    setStatusFilter("");
    setPeriodFilter("");
    setCategoryFilter("");
    setSearch("");
    setCurrentPage(1);
  }, []);

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  // Reset page when filters change or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [month, year, statusFilter, periodFilter, categoryFilter, pageSize]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: number | "all") => {
    if (newSize === "all") {
      setPageSize(Number.MAX_SAFE_INTEGER);
    } else {
      setPageSize(newSize);
    }
    setCurrentPage(1);
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
    month, setMonth,
    year, setYear,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    resetFilters,
    resetFiltersToAll,
    // State
    loading,
    tableLoading,
    error,
    refetch,
    refetchTable,
    // Pagination
    currentPage,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
  };
}
