"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { User, UserFilters, UserStats, PaginationState } from "./types";
import { fetchUsers, fetchUserStats } from "./user-service";

export function useUsers() {
  // ----- Data state -----
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- Filter state -----
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");

  // ----- Pagination state -----
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = pageSize === Number.MAX_SAFE_INTEGER ? 1 : Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const pagination: PaginationState = {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };

  // ----- Build filters object -----
  const filters: UserFilters = useMemo(
    () => ({
      search,
      role: roleFilter,
      status: statusFilter,
      month,
      year,
      dateFrom: "",
      dateTo: "",
    }),
    [search, roleFilter, statusFilter, month, year]
  );

  // ----- Fetch main data when filters change -----
  const fetchData = useCallback(async (isFilterChange = false) => {
    if (isFilterChange) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [usersResult, statsResult] = await Promise.all([
        fetchUsers(filters, currentPage, pageSize),
        isFilterChange ? null : fetchUserStats(),
      ]);

      setUsers(usersResult.users);
      setTotalCount(usersResult.totalCount);
      
      // Only update stats on initial load
      if (!isFilterChange && statsResult) {
        setStats(statsResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Client-side search filtering (instant, no re-query) -----
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (user) =>
        (user.full_name ?? "").toLowerCase().includes(q) ||
        (user.email ?? "").toLowerCase().includes(q) ||
        (user.role ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  // ----- Refetch (passed to modals as onSuccess) -----
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ----- Reset filters to current month/year -----
  const resetFilters = useCallback(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

  // ----- Reset filters to all time -----
  const resetFiltersToAll = useCallback(() => {
    setMonth("all");
    setYear("all");
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

  // Pagination helpers
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
  }, [roleFilter, statusFilter, month, year, pageSize]);

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
    users: filteredUsers,
    stats,
    // State
    loading,
    tableLoading,
    error,
    refetch,
    // Filters
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    month,
    setMonth,
    year,
    setYear,
    resetFilters,
    resetFiltersToAll,
    // Pagination
    pagination,
    currentPage,
    pageSize,
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
