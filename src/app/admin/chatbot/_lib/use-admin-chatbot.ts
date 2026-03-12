import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminChatSessions, fetchAdminChatbotStats, fetchAllUsers, fetchDistinctModels } from "./admin-chatbot-service";
import type { AdminChatSession, AdminChatbotStats, AdminChatbotFilters } from "./types";

export function useAdminChatbot() {
    const [sessions, setSessions] = useState<AdminChatSession[]>([]);
    const [stats, setStats] = useState<AdminChatbotStats | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [month, setMonth] = useState<number | "all">("all");
    const [year, setYear] = useState<number | "all">("all");
    const [roleFilter, setRoleFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const filters: AdminChatbotFilters = useMemo(
        () => ({
            month,
            year,
            role: roleFilter || undefined,
            userId: userFilter || undefined,
            model: modelFilter || undefined,
        }),
        [month, year, roleFilter, userFilter, modelFilter]
    );

    const fetchData = useCallback(async (showTableLoading = false, forceRefreshStats = false) => {
        if (showTableLoading) {
            setTableLoading(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const [sessionResult, statsData, usersData, modelsData] = await Promise.all([
                fetchAdminChatSessions(filters, currentPage, pageSize, search),
                (stats && !forceRefreshStats) ? Promise.resolve(stats) : fetchAdminChatbotStats(),
                users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
                availableModels.length > 0 ? Promise.resolve(availableModels) : fetchDistinctModels(),
            ]);

            if (sessionResult.error) {
                setError(sessionResult.error);
            } else {
                setSessions(sessionResult.data);
                setTotalCount(sessionResult.count);
            }

            if (!stats || forceRefreshStats) setStats(statsData);
            if (users.length === 0) setUsers(usersData);
            if (availableModels.length === 0) setAvailableModels(modelsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch chatbot sessions");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [filters, currentPage, pageSize, search, stats, users, availableModels]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchData(true);
        }
    }, [filters, currentPage, pageSize, search]);

    const resetFilters = useCallback(() => {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setRoleFilter("");
        setUserFilter("");
        setModelFilter("");
        setSearch("");
        setCurrentPage(1);
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setMonth("all");
        setYear("all");
        setRoleFilter("");
        setUserFilter("");
        setModelFilter("");
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
        sessions,
        stats,
        users,
        availableModels,
        loading,
        tableLoading,
        error,
        search,
        setSearch,
        month,
        setMonth,
        year,
        setYear,
        roleFilter,
        setRoleFilter,
        userFilter,
        setUserFilter,
        modelFilter,
        setModelFilter,
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
