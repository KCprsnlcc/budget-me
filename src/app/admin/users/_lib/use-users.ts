"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { User, UserFilters, UserStats, PaginationState } from "./types";
import { fetchUsers, fetchUserStats } from "./user-service";

export function useUsers() {

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");

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

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = useCallback(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setMonth("all");
    setYear("all");
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

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
  }, [roleFilter, statusFilter, month, year, pageSize]);

  const handlePageSizeChange = useCallback((newSize: number | "all") => {
    if (newSize === "all") {
      setPageSize(Number.MAX_SAFE_INTEGER);
    } else {
      setPageSize(newSize);
    }
    setCurrentPage(1);
  }, []);

  return {

    users: filteredUsers,
    stats,

    loading,
    tableLoading,
    error,
    refetch,

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
