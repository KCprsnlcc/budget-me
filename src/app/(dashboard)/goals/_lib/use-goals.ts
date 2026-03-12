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

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchData = useCallback(async (isFilterChange = false) => {
    if (!userId) return;
    
    if (isFilterChange) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [goalsResult, summaryResult] = await Promise.all([
        fetchGoalsForPage(userId, filters, currentPage, pageSize),
        fetchGoalSummary(userId),
      ]);

      setGoals(goalsResult.data);
      setTotalCount(goalsResult.count ?? 0);
      if (goalsResult.error) setError(goalsResult.error);

      if (!isFilterChange || (month !== "all" || year !== "all")) {
        setSummary(summaryResult);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load goals.");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [userId, filters, currentPage, pageSize, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (goals.length > 0) {
      fetchData(true);
    }
  }, [filters, currentPage, pageSize]);

  const filteredGoals = useMemo(() => {
    let filtered = goals;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q) ||
          (g.notes ?? "").toLowerCase().includes(q)
      );
    }

    if (month !== "all") {
      filtered = filtered.filter((g) => {
        const goalDate = new Date(g.deadline + "T00:00:00");
        return goalDate.getMonth() + 1 === month;
      });
    }
    
    if (year !== "all") {
      filtered = filtered.filter((g) => {
        const goalDate = new Date(g.deadline + "T00:00:00");
        return goalDate.getFullYear() === year;
      });
    }
    
    return filtered;
  }, [goals, search, month, year]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const refetchTable = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const resetFilters = useCallback(() => {
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setSearch("");
    setMonth("all");
    setYear("all");
    setCurrentPage(1);
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setSearch("");
    setMonth("all");
    setYear("all");
    setCurrentPage(1);
  }, []);

  const totalPages = pageSize === Number.MAX_SAFE_INTEGER ? 1 : Math.ceil(totalCount / pageSize);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, categoryFilter, month, year, pageSize]);

  const handlePageSizeChange = useCallback((newSize: number | "all") => {
    if (newSize === "all") {
      setPageSize(Number.MAX_SAFE_INTEGER);
    } else {
      setPageSize(newSize);
    }
    setCurrentPage(1);
  }, []);

  return {

    goals: filteredGoals,
    allGoals: goals,
    summary,

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

    loading,
    tableLoading,
    error,
    refetch,
    refetchTable,

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
