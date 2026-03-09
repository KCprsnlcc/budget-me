import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminBudgets, fetchAdminBudgetStats, fetchAllUsers } from "./admin-budget-service";
import type { AdminBudget, AdminBudgetStats, AdminBudgetFilters } from "./types";

export function useAdminBudgets() {
    const [budgets, setBudgets] = useState<AdminBudget[]>([]);
    const [stats, setStats] = useState<AdminBudgetStats | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [month, setMonth] = useState<number | "all">("all");
    const [year, setYear] = useState<number | "all">("all");
    const [periodFilter, setPeriodFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const filters: AdminBudgetFilters = useMemo(
        () => ({
            month,
            year,
            period: periodFilter || undefined,
            userId: userFilter || undefined,
            status: statusFilter || undefined,
        }),
        [month, year, periodFilter, userFilter, statusFilter]
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
            const [budgetResult, statsData, usersData] = await Promise.all([
                fetchAdminBudgets(filters, currentPage, pageSize),
                stats ? Promise.resolve(stats) : fetchAdminBudgetStats(),
                users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
            ]);

            if (budgetResult.error) {
                setError(budgetResult.error);
            } else {
                setBudgets(budgetResult.data);
                setTotalCount(budgetResult.count ?? 0);
            }

            if (!stats) setStats(statsData);
            if (users.length === 0) setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch budgets");
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
    const filteredBudgets = useMemo(() => {
        if (!search) return budgets;
        const lowerSearch = search.toLowerCase();
        return budgets.filter(
            (b) =>
                b.budget_name?.toLowerCase().includes(lowerSearch) ||
                b.user_email?.toLowerCase().includes(lowerSearch) ||
                b.user_name?.toLowerCase().includes(lowerSearch) ||
                b.category_name?.toLowerCase().includes(lowerSearch) ||
                b.expense_category_name?.toLowerCase().includes(lowerSearch)
        );
    }, [budgets, search]);

    const resetFilters = useCallback(() => {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setPeriodFilter("");
        setUserFilter("");
        setStatusFilter("");
        setSearch("");
        setCurrentPage(1);
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setMonth("all");
        setYear("all");
        setPeriodFilter("");
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
        budgets: filteredBudgets,
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
        periodFilter,
        setPeriodFilter,
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
