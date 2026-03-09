import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminReports, fetchAdminInsights, fetchAdminPredictionStats, fetchAllUsers } from "./admin-prediction-service";
import type { AdminPredictionReport, AdminAIInsight, AdminPredictionStats, AdminPredictionFilters } from "./types";

export function useAdminPredictions() {
    const [reports, setReports] = useState<AdminPredictionReport[]>([]);
    const [insights, setInsights] = useState<AdminAIInsight[]>([]);
    const [stats, setStats] = useState<AdminPredictionStats | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [month, setMonth] = useState<number | "all">("all");
    const [year, setYear] = useState<number | "all">("all");
    const [reportTypeFilter, setReportTypeFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dataSource, setDataSource] = useState<"reports" | "insights">("reports");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const filters: AdminPredictionFilters = useMemo(
        () => ({
            month,
            year,
            reportType: reportTypeFilter || undefined,
            userId: userFilter || undefined,
            modelVersion: modelFilter || undefined,
            processingStatus: statusFilter || undefined,
            dataSource,
        }),
        [month, year, reportTypeFilter, userFilter, modelFilter, statusFilter, dataSource]
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
            const fetchFn = dataSource === "reports"
                ? fetchAdminReports(filters, currentPage, pageSize)
                : fetchAdminInsights(filters, currentPage, pageSize);

            const [result, statsData, usersData] = await Promise.all([
                fetchFn,
                (stats && !forceRefreshStats) ? Promise.resolve(stats) : fetchAdminPredictionStats(),
                users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
            ]);

            if (result.error) {
                setError(result.error);
            } else {
                if (dataSource === "reports") {
                    setReports(result.data as AdminPredictionReport[]);
                } else {
                    setInsights(result.data as AdminAIInsight[]);
                }
                setTotalCount(result.count ?? 0);
            }

            if (!stats || forceRefreshStats) setStats(statsData);
            if (users.length === 0) setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch predictions data");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [filters, currentPage, pageSize, stats, users, dataSource]);

    // Initial load
    useEffect(() => {
        fetchData();
    }, []);

    // Refetch on filter/pagination/dataSource changes
    useEffect(() => {
        if (!loading) {
            fetchData(true);
        }
    }, [filters, currentPage, pageSize, dataSource]);

    // Search filter (client-side)
    const filteredReports = useMemo(() => {
        if (!search) return reports;
        const lowerSearch = search.toLowerCase();
        return reports.filter(
            (r) =>
                r.report_type?.toLowerCase().includes(lowerSearch) ||
                r.user_email?.toLowerCase().includes(lowerSearch) ||
                r.user_name?.toLowerCase().includes(lowerSearch) ||
                r.model_version?.toLowerCase().includes(lowerSearch) ||
                r.summary?.toLowerCase().includes(lowerSearch)
        );
    }, [reports, search]);

    const filteredInsights = useMemo(() => {
        if (!search) return insights;
        const lowerSearch = search.toLowerCase();
        return insights.filter(
            (i) =>
                i.ai_service?.toLowerCase().includes(lowerSearch) ||
                i.model_used?.toLowerCase().includes(lowerSearch) ||
                i.user_email?.toLowerCase().includes(lowerSearch) ||
                i.user_name?.toLowerCase().includes(lowerSearch) ||
                i.processing_status?.toLowerCase().includes(lowerSearch)
        );
    }, [insights, search]);

    const resetFilters = useCallback(() => {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setReportTypeFilter("");
        setUserFilter("");
        setModelFilter("");
        setStatusFilter("");
        setSearch("");
        setCurrentPage(1);
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setMonth("all");
        setYear("all");
        setReportTypeFilter("");
        setUserFilter("");
        setModelFilter("");
        setStatusFilter("");
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
        insights: filteredInsights,
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
        userFilter,
        setUserFilter,
        modelFilter,
        setModelFilter,
        statusFilter,
        setStatusFilter,
        dataSource,
        setDataSource,
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
