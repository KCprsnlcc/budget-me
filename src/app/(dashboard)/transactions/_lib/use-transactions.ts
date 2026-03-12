"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  fetchTransactions,
  fetchTransactionSummary,
  fetchCategoryBreakdown,
  fetchMonthlyTrend,
  fetchAccounts,
  fetchExpenseCategories,
  fetchIncomeCategories,
  fetchBudgets,
  fetchGoals,
  type TransactionFilters,
  type TransactionSummary,
  type CategoryBreakdown,
  type MonthlyTrendPoint,
} from "./transaction-service";
import type {
  TransactionType,
  AccountOption,
  CategoryOption,
  BudgetOption,
  GoalOption,
} from "../_components/types";

export function useTransactions() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendPoint[]>([]);

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryOption[]>([]);
  const [budgets, setBudgets] = useState<BudgetOption[]>([]);
  const [goals, setGoals] = useState<GoalOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters: TransactionFilters = useMemo(
    () => ({
      month,
      year,
      type: typeFilter || undefined,
      categoryId: categoryFilter || undefined,
    }),
    [month, year, typeFilter, categoryFilter]
  );

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetchAccounts(userId),
      fetchExpenseCategories(userId),
      fetchIncomeCategories(userId),
      fetchBudgets(userId),
      fetchGoals(userId),
    ]).then(([accts, expCats, incCats, budg, gls]) => {
      setAccounts(accts);
      setExpenseCategories(expCats);
      setIncomeCategories(incCats);
      setBudgets(budg);
      setGoals(gls);
    });
  }, [userId]);

  const fetchData = useCallback(async (isFilterChange = false) => {
    if (!userId) return;
    
    if (isFilterChange) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [txResult, summaryResult, breakdownResult, trendResult] = await Promise.all([
        fetchTransactions(userId, filters, currentPage, pageSize),
        fetchTransactionSummary(userId, month, year),
        fetchCategoryBreakdown(userId, month, year),
        fetchMonthlyTrend(userId, 6),
      ]);

      setTransactions(txResult.data);
      setTotalCount(txResult.count ?? 0);
      if (txResult.error) setError(txResult.error);
      
      if (!isFilterChange || (month !== "all" || year !== "all")) {
        setSummary(summaryResult);
        setCategoryBreakdown(breakdownResult);
        setMonthlyTrend(trendResult);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load transactions.");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [userId, filters, month, year, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (transactions.length > 0) {
      fetchData(true);
    }
  }, [filters, currentPage, pageSize]);

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        (tx.description ?? "").toLowerCase().includes(q) ||
        (tx.category_name ?? "").toLowerCase().includes(q) ||
        (tx.account_name ?? "").toLowerCase().includes(q) ||
        (tx.notes ?? "").toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const refetch = useCallback(() => {
    fetchData();
    if (!userId) return;
    Promise.all([
      fetchAccounts(userId),
      fetchExpenseCategories(userId),
      fetchIncomeCategories(userId),
      fetchBudgets(userId),
      fetchGoals(userId),
    ]).then(([accts, expCats, incCats, budg, gls]) => {
      setAccounts(accts);
      setExpenseCategories(expCats);
      setIncomeCategories(incCats);
      setBudgets(budg);
      setGoals(gls);
    });
  }, [fetchData, userId]);

  const refetchTable = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const resetFilters = useCallback(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setTypeFilter("");
    setCategoryFilter("");
    setSearch("");
    setCurrentPage(1);
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setMonth("all");
    setYear("all");
    setTypeFilter("");
    setCategoryFilter("");
    setSearch("");
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
  }, [month, year, typeFilter, categoryFilter, pageSize]);

  const handlePageSizeChange = useCallback((newSize: number | "all") => {
    if (newSize === "all") {
      setPageSize(Number.MAX_SAFE_INTEGER);
    } else {
      setPageSize(newSize);
    }
    setCurrentPage(1);
  }, []);

  return {
    transactions: filteredTransactions,
    summary,
    categoryBreakdown,
    monthlyTrend,
    accounts,
    expenseCategories,
    incomeCategories,
    budgets,
    goals,
    month,
    setMonth,
    year,
    setYear,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
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
