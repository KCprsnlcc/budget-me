import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAdminFamilies, fetchAdminFamilyStats, fetchAllUsers } from "./admin-family-service";
import type { AdminFamily, AdminFamilyStats, AdminFamilyFilters } from "./types";

export function useAdminFamilies() {
    const [families, setFamilies] = useState<AdminFamily[]>([]);
    const [stats, setStats] = useState<AdminFamilyStats | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const filters: AdminFamilyFilters = useMemo(
        () => ({
            status: statusFilter || undefined,
            visibility: visibilityFilter || undefined,
            userId: userFilter || undefined,
        }),
        [statusFilter, visibilityFilter, userFilter]
    );

    // Fetch data
    const fetchData = useCallback(
        async (showTableLoading = false, forceRefreshStats = false) => {
            if (showTableLoading) {
                setTableLoading(true);
            } else {
                setLoading(true);
            }
            setError(null);

            try {
                const [familyResult, statsData, usersData] = await Promise.all([
                    fetchAdminFamilies(filters, currentPage, pageSize),
                    stats && !forceRefreshStats ? Promise.resolve(stats) : fetchAdminFamilyStats(),
                    users.length > 0 ? Promise.resolve(users) : fetchAllUsers(),
                ]);

                if (familyResult.error) {
                    setError(familyResult.error);
                } else {
                    setFamilies(familyResult.data);
                    setTotalCount(familyResult.count ?? 0);
                }

                if (!stats || forceRefreshStats) setStats(statsData);
                if (users.length === 0) setUsers(usersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch families");
            } finally {
                setLoading(false);
                setTableLoading(false);
            }
        },
        [filters, currentPage, pageSize, stats, users]
    );

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
    const filteredFamilies = useMemo(() => {
        if (!search) return families;
        const lowerSearch = search.toLowerCase();
        return families.filter(
            (f) =>
                f.family_name.toLowerCase().includes(lowerSearch) ||
                f.description?.toLowerCase().includes(lowerSearch) ||
                f.creator_email?.toLowerCase().includes(lowerSearch) ||
                f.creator_name?.toLowerCase().includes(lowerSearch)
        );
    }, [families, search]);

    const resetFilters = useCallback(() => {
        setStatusFilter("");
        setVisibilityFilter("");
        setUserFilter("");
        setSearch("");
        setCurrentPage(1);
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setStatusFilter("");
        setVisibilityFilter("");
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

    const goToPage = useCallback(
        (page: number) => {
            setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        },
        [totalPages]
    );

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    }, []);

    return {
        families: filteredFamilies,
        stats,
        users,
        loading,
        tableLoading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        visibilityFilter,
        setVisibilityFilter,
        userFilter,
        setUserFilter,
        resetFilters,
        resetFiltersToAll,
        refetch,
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
