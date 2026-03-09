import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminGoals, fetchAdminGoalStats, fetchAllUsers } from "./admin-goal-service";
import type { AdminGoal, AdminGoalStats, AdminGoalFilters } from "./types";

export function useAdminGoals() {
    const [goals, setGoals] = useState<AdminGoal[]>([]);
    const [stats, setStats] = useState<AdminGoalStats | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [month, setMonth] = useState<number | "all">("all");
    const [year, setYear] = useState<number | "all">("all");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [familyFilter, setFamilyFilter] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const filters: AdminGoalFilters = useMemo(
        () => ({
            month,
            year,
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            category: categoryFilter || undefined,
            userId: userFilter || undefined,
            isFamily: familyFilter || undefined,
        }),
        [month, year, statusFilter, priorityFilter, categoryFilter, userFilter, familyFilter]
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
            const [goalResult, statsData, usersData] = await Promise.all([
                fetchAdminGoals(filters, currentPage, pageSize),
                (stats && !forceRefreshStats) ? Promise.resolve(stats) : fetchAdminGoalStats(),
                users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
            ]);

            if (goalResult.error) {
                setError(goalResult.error);
            } else {
                setGoals(goalResult.data);
                setTotalCount(goalResult.count ?? 0);
            }

            if (!stats || forceRefreshStats) setStats(statsData);
            if (users.length === 0) setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch goals");
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
    const filteredGoals = useMemo(() => {
        if (!search) return goals;
        const lowerSearch = search.toLowerCase();
        return goals.filter(
            (g) =>
                g.goal_name?.toLowerCase().includes(lowerSearch) ||
                g.user_email?.toLowerCase().includes(lowerSearch) ||
                g.user_name?.toLowerCase().includes(lowerSearch) ||
                g.category?.toLowerCase().includes(lowerSearch) ||
                g.description?.toLowerCase().includes(lowerSearch)
        );
    }, [goals, search]);

    const resetFilters = useCallback(() => {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setStatusFilter("");
        setPriorityFilter("");
        setCategoryFilter("");
        setUserFilter("");
        setFamilyFilter("");
        setSearch("");
        setCurrentPage(1);
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setMonth("all");
        setYear("all");
        setStatusFilter("");
        setPriorityFilter("");
        setCategoryFilter("");
        setUserFilter("");
        setFamilyFilter("");
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
        goals: filteredGoals,
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
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        categoryFilter,
        setCategoryFilter,
        userFilter,
        setUserFilter,
        familyFilter,
        setFamilyFilter,
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
