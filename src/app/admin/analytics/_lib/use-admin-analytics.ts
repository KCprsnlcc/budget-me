import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminAnalytics, fetchAdminAnalyticsStats, fetchAllUsers } from "./admin-analytics-service";
import type { AdminAnalyticsReport, AdminAnalyticsStats, AdminAnalyticsFilters } from "./types";

export function useAdminAnalytics() {
    const [reports, setReports] = useState<AdminAnalyticsReport[]>([]);
    const [stats, setStats] = useState<AdminAnalyticsStats | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [month, setMonth] = useState<number | "all">("all");
    const [year, setYear] = useState<number | "all">("all");
    const [reportTypeFilter, setReportTypeFilter] = useState("");
    const [timeframeFilter, setTimeframeFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const filters: AdminAnalyticsFilters = useMemo(
        () => ({
            month,
            year,
            report_type: reportTypeFilter || undefined,
            timeframe: timeframeFilter || undefined,
            userId: userFilter || undefined,
        }),
        [month, year, reportTypeFilter, timeframeFilter, userFilter]
    );

    // Fetch data
    const fetchData = useCallback(async (showTableLoading = false, forceRefreshStats = false) => {
        if (showTableLoading) {
            setTableLoading(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const [reportsResult, statsData, usersData] = await Promise.all([
                fetchAdminAnalytics(filters, currentPage, pageSize),
                (stats && !forceRefreshStats) ? Promise.resolve(stats) : fetchAdminAnalyticsStats(),
                users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
            ]);

            if (reportsResult.error) {
                setError(reportsResult.error);
            } else {
                setReports(reportsResult.data);
                setTotalCount(reportsResult.count ?? 0);
            }

            if (!stats || forceRefreshStats) setStats(statsData);
            if (users.length === 0) setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch analytics");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [filters, currentPage, pageSize, stats, users]);

    // Initial load
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch on filter/pagination changes
    useEffect(() => {
        if (!loading) {
            fetchData(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, currentPage, pageSize]);

    // Search filter (client-side)
    const filteredReports = useMemo(() => {
        if (!search) return reports;
        const lowerSearch = search.toLowerCase();
        return reports.filter(
            (r) =>
                r.report_type?.toLowerCase().includes(lowerSearch) ||
                r.user_email?.toLowerCase().includes(lowerSearch) ||
                r.user_name?.toLowerCase().includes(lowerSearch) ||
                r.timeframe?.toLowerCase().includes(lowerSearch) ||
                r.summary?.toLowerCase().includes(lowerSearch)
        );
    }, [reports, search]);

    const resetFilters = useCallback(() => {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setReportTypeFilter("");
        setTimeframeFilter("");
        setUserFilter("");
        setSearch("");
        setCurrentPage(1);
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setMonth("all");
        setYear("all");
        setReportTypeFilter("");
        setTimeframeFilter("");
        setUserFilter("");
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
        reports: filteredReports,
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
        reportTypeFilter,
        setReportTypeFilter,
        timeframeFilter,
        setTimeframeFilter,
        userFilter,
        setUserFilter,
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
