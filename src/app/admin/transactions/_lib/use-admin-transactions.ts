import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminTransactions, fetchAdminTransactionStats, fetchAllUsers } from "./admin-transaction-service";
import type { AdminTransaction, AdminTransactionStats, AdminTransactionFilters } from "./types";

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [stats, setStats] = useState<AdminTransactionStats | null>(null);
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const filters: AdminTransactionFilters = useMemo(
    () => ({
      month,
      year,
      type: typeFilter || undefined,
      userId: userFilter || undefined,
      status: statusFilter || undefined,
    }),
    [month, year, typeFilter, userFilter, statusFilter]
  );

  // Fetch data
  const fetchData = useCallback(async (showTableLoading = false) => {
    if (showTableLoading) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [txnResult, statsData, usersData] = await Promise.all([
        fetchAdminTransactions(filters, currentPage, pageSize),
        stats ? Promise.resolve(stats) : fetchAdminTransactionStats(),
        users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
      ]);

      if (txnResult.error) {
        setError(txnResult.error);
      } else {
        setTransactions(txnResult.data);
        setTotalCount(txnResult.count ?? 0);
      }

      if (!stats) setStats(statsData);
      if (users.length === 0) setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [filters, currentPage, pageSize, stats, users]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch on filter/pagination changes
  useEffect(() => {
    if (!loading) {
      fetchData(true);
    }
  }, [filters, currentPage, pageSize]);

  // Search filter (client-side)
  const filteredTransactions = useMemo(() => {
    if (!search) return transactions;
    const lowerSearch = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(lowerSearch) ||
        tx.user_email?.toLowerCase().includes(lowerSearch) ||
        tx.user_name?.toLowerCase().includes(lowerSearch) ||
        tx.account_name?.toLowerCase().includes(lowerSearch) ||
        tx.category_name?.toLowerCase().includes(lowerSearch)
    );
  }, [transactions, search]);

  const resetFilters = useCallback(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setTypeFilter("");
    setUserFilter("");
    setStatusFilter("");
    setSearch("");
    setCurrentPage(1);
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setMonth("all");
    setYear("all");
    setTypeFilter("");
    setUserFilter("");
    setStatusFilter("");
    setSearch("");
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    setStats(null);
    fetchData();
  }, [fetchData]);

  const nextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) setCurrentPage((p) => p - 1);
  }, [hasPreviousPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  return {
    transactions: filteredTransactions,
    stats,
    users,
    loading,
    tableLoading,
    error,
    search,
    setSearch,
    month,
    setMonth,
    year,
    setYear,
    typeFilter,
    setTypeFilter,
    userFilter,
    setUserFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
    resetFiltersToAll,
    refetch,
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
