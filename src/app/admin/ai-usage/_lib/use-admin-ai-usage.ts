import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminAIUsage, fetchAdminAIUsageStats, fetchAllUsers } from "./admin-ai-usage-service";
import type { AdminAIUsage, AdminAIUsageStats, AdminAIUsageFilters } from "./types";

export function useAdminAIUsage() {
  const [usageRecords, setUsageRecords] = useState<AdminAIUsage[]>([]);
  const [stats, setStats] = useState<AdminAIUsageStats | null>(null);
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [userFilter, setUserFilter] = useState("");
  const [usageRangeFilter, setUsageRangeFilter] = useState<"all" | "low" | "medium" | "high" | "limit">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const filters: AdminAIUsageFilters = useMemo(() => {
    const baseFilters: AdminAIUsageFilters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      userId: userFilter || undefined,
    };

    // Apply usage range filters
    if (usageRangeFilter === "low") {
      baseFilters.minUsage = 0;
      baseFilters.maxUsage = 5;
    } else if (usageRangeFilter === "medium") {
      baseFilters.minUsage = 6;
      baseFilters.maxUsage = 15;
    } else if (usageRangeFilter === "high") {
      baseFilters.minUsage = 16;
      baseFilters.maxUsage = 24;
    } else if (usageRangeFilter === "limit") {
      baseFilters.minUsage = 25;
    }

    return baseFilters;
  }, [startDate, endDate, userFilter, usageRangeFilter]);

  // Fetch data
  const fetchData = useCallback(async (showTableLoading = false, forceRefreshStats = false) => {
    if (showTableLoading) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [usageResult, statsData, usersData] = await Promise.all([
        fetchAdminAIUsage(filters, currentPage, pageSize),
        (stats && !forceRefreshStats) ? Promise.resolve(stats) : fetchAdminAIUsageStats(),
        users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
      ]);

      if (usageResult.error) {
        setError(usageResult.error);
      } else {
        setUsageRecords(usageResult.data);
        setTotalCount(usageResult.count ?? 0);
      }

      if (!stats || forceRefreshStats) setStats(statsData);
      if (users.length === 0) setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch AI usage data");
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
  const filteredUsageRecords = useMemo(() => {
    if (!search) return usageRecords;
    const lowerSearch = search.toLowerCase();
    return usageRecords.filter(
      (usage) =>
        usage.user_email?.toLowerCase().includes(lowerSearch) ||
        usage.user_name?.toLowerCase().includes(lowerSearch) ||
        usage.usage_date.includes(lowerSearch)
    );
  }, [usageRecords, search]);

  const resetFilters = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    setStartDate(weekAgo);
    setEndDate(today);
    setUserFilter("");
    setUsageRangeFilter("all");
    setSearch("");
    setCurrentPage(1);
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setUserFilter("");
    setUsageRangeFilter("all");
    setSearch("");
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    fetchData(false, true);
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
    usageRecords: filteredUsageRecords,
    stats,
    users,
    loading,
    tableLoading,
    error,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    userFilter,
    setUserFilter,
    usageRangeFilter,
    setUsageRangeFilter,
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
