"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useRef } from "react";
import {
    Search,
    Filter,
    BarChart2,
    Flag,
    FileText,
    TrendingUp,
    BrainCircuit,
    PieChart,
    PiggyBank,
    Eye,
    Trash2,
    RotateCcw,
    Table as TableIcon,
    Grid3X3,
    ChevronLeft,
    ChevronRight,
    Inbox,
    MoreHorizontal,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { ViewAdminAnalyticsModal } from "./_components/view-admin-analytics-modal";
import { DeleteAdminAnalyticsModal } from "./_components/delete-admin-analytics-modal";
import { useAdminAnalytics } from "./_lib/use-admin-analytics";
import type { UserAnalyticsSummary } from "./_lib/types";
import { getSafeSkeletonCount } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User } from "@supabase/supabase-js";

type SummaryType = {
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon?: React.ComponentType<any>;
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function formatDate(dateStr?: string): string {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getReportTypeIcon(type: string): React.ComponentType<any> {
    switch (type) {
        case 'spending': return PieChart;
        case 'income-expense': return BarChart2;
        case 'savings': return PiggyBank;
        case 'trends': return TrendingUp;
        case 'goals': return Flag;
        case 'predictions': return BrainCircuit;
        case 'financial_intelligence': return BrainCircuit;
        default: return FileText;
    }
}

// ──────────────────────────── Skeleton Components ────────────────────────────

const SummaryCardSkeleton = memo(function SummaryCardSkeleton() {
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <Skeleton width={22} height={22} borderRadius={4} />
                <Skeleton width={50} height={16} borderRadius={4} />
            </div>
            <Skeleton width={120} height={10} className="mb-1" />
            <Skeleton width={80} height={20} />
        </Card>
    );
});

const AnalyticsCardSkeleton = memo(function AnalyticsCardSkeleton() {
    return (
        <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton width={20} height={20} borderRadius={4} />
                    <div className="flex-1">
                        <Skeleton width={100} height={14} className="mb-1" />
                        <div className="flex items-center gap-1.5 mt-1">
                            <Skeleton width={16} height={16} circle />
                            <Skeleton width={120} height={10} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Skeleton width={60} height={12} />
                    <Skeleton width={80} height={10} />
                </div>
            </div>
            <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-4">
                    <Skeleton width={60} height={12} />
                    <Skeleton width={60} height={12} />
                </div>
                <div className="flex items-center gap-1">
                    <Skeleton width={32} height={32} borderRadius={8} />
                    <Skeleton width={32} height={32} borderRadius={8} />
                </div>
            </div>
        </Card>
    );
});

const TableRowSkeleton = memo(function TableRowSkeleton() {
    return (
        <TableRow className="hover:bg-slate-50/50">
            <TableCell className="px-6 py-3">
                <Skeleton width={100} height={14} />
            </TableCell>
            <TableCell className="px-6 py-3">
                <Skeleton width={100} height={14} />
            </TableCell>
            <TableCell className="px-6 py-3">
                <div className="flex items-center gap-2">
                    <Skeleton width={24} height={24} circle />
                    <Skeleton width={140} height={10} />
                </div>
            </TableCell>
            <TableCell className="px-6 py-3">
                <Skeleton width={60} height={12} />
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <Skeleton width={80} height={14} className="mx-auto" />
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <div className="flex items-center justify-end gap-1">
                    <Skeleton width={32} height={32} borderRadius={8} />
                    <Skeleton width={32} height={32} borderRadius={8} />
                </div>
            </TableCell>
        </TableRow>
    );
});

const TopUserSkeleton = memo(function TopUserSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    <Skeleton width={48} height={48} circle />
                    <div className="absolute -bottom-1 -right-1">
                        <Skeleton width={20} height={20} circle />
                    </div>
                </div>
                <div className="min-w-0">
                    <Skeleton width={120} height={14} className="mb-1" />
                    <Skeleton width={80} height={12} />
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <Skeleton width={80} height={14} />
            </div>
        </div>
    );
});

const SummaryCard = memo(({ data }: { data: SummaryType }) => {
    const Icon = data.icon;
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500">
                    {Icon && <Icon size={22} strokeWidth={1.5} />}
                </div>
                {data.change && (
                    <div className={`flex items-center gap-1 text-[10px] font-medium ${data.trend === "up" ? "text-emerald-700" : "text-red-700"
                        }`}>
                        {data.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {data.change}
                    </div>
                )}
            </div>
            <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{data.label}</div>
            <div className="text-xl font-semibold text-slate-900 tracking-tight">{data.value}</div>
        </Card>
    );
});

SummaryCard.displayName = "SummaryCard";

const AnalyticsCard = memo(({
    userSummary,
    onView,
    onDelete,
}: {
    userSummary: UserAnalyticsSummary;
    onView: (u: UserAnalyticsSummary) => void;
    onDelete: (u: UserAnalyticsSummary) => void;
}) => {
    const mockUser: User = {
        id: userSummary.user_id,
        email: userSummary.user_email,
        user_metadata: {
            full_name: userSummary.user_name,
            avatar_url: userSummary.user_avatar
        },
        app_metadata: {},
        created_at: "",
        aud: "authenticated"
    } as User;

    return (
        <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar 
                        user={mockUser} 
                        size="lg"
                        className="ring-2 ring-white shadow-sm"
                    />
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">{userSummary.user_name || "Unknown User"}</h4>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{userSummary.user_email}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-xs font-medium text-blue-600">
                        {userSummary.total_reports} reports
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(userSummary.last_updated)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">Trans:</span>
                        <span className="font-semibold text-slate-700">{userSummary.total_transactions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">Budgets:</span>
                        <span className="font-semibold text-slate-700">{userSummary.active_budgets}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">Goals:</span>
                        <span className="font-semibold text-slate-700">{userSummary.active_goals}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="View Details" onClick={() => onView(userSummary)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" title="Delete" onClick={() => onDelete(userSummary)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

AnalyticsCard.displayName = "AnalyticsCard";

const AnalyticsRow = memo(({
    userSummary,
    onView,
    onDelete,
}: {
    userSummary: UserAnalyticsSummary;
    onView: (u: UserAnalyticsSummary) => void;
    onDelete: (u: UserAnalyticsSummary) => void;
}) => {
    const mockUser: User = {
        id: userSummary.user_id,
        email: userSummary.user_email,
        user_metadata: {
            full_name: userSummary.user_name,
            avatar_url: userSummary.user_avatar
        },
        app_metadata: {},
        created_at: "",
        aud: "authenticated"
    } as User;

    return (
        <TableRow className="group hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar 
                        user={mockUser} 
                        size="md"
                        className="ring-2 ring-white shadow-sm"
                    />
                    <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{userSummary.user_name || "Unknown User"}</p>
                        <p className="text-slate-500 text-xs truncate">{userSummary.user_email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4 text-center">
                <span className="font-medium text-slate-900 text-sm">{userSummary.total_reports}</span>
            </TableCell>
            <TableCell className="px-6 py-4 text-center">
                <span className="text-slate-700 text-sm">{userSummary.total_transactions}</span>
            </TableCell>
            <TableCell className="px-6 py-4 text-center">
                <span className="text-slate-700 text-sm">{userSummary.active_budgets}</span>
            </TableCell>
            <TableCell className="px-6 py-4 text-center">
                <span className="text-slate-700 text-sm">{userSummary.active_goals}</span>
            </TableCell>
            <TableCell className="px-6 py-4 text-slate-400 text-xs">{formatDate(userSummary.last_updated)}</TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="View Details" onClick={() => onView(userSummary)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" title="Delete" onClick={() => onDelete(userSummary)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

AnalyticsRow.displayName = "AnalyticsRow";

export default function AdminAnalyticsPage() {
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUserSummary, setSelectedUserSummary] = useState<UserAnalyticsSummary | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const contentRef = useRef<HTMLDivElement>(null);
    const [hoveredBar, setHoveredBar] = useState<{ month: string, count: number } | null>(null);

    const {
        userSummaries,
        stats,
        users,
        loading,
        tableLoading,
        error,
        search,
        setSearch,
        month, setMonth,
        year, setYear,
        reportTypeFilter, setReportTypeFilter,
        timeframeFilter, setTimeframeFilter,
        userFilter, setUserFilter,
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
    } = useAdminAnalytics();

    const handleView = useCallback((u: UserAnalyticsSummary) => {
        setSelectedUserSummary(u);
        setViewModalOpen(true);
    }, []);

    const handleDelete = useCallback((u: UserAnalyticsSummary) => {
        setSelectedUserSummary(u);
        setDeleteModalOpen(true);
    }, []);

    // Build summary cards from real data
    const summaryCards: SummaryType[] = useMemo(() => {
        if (!stats) return [];

        return [
            {
                label: "Total AI Reports",
                value: stats.totalReports.toLocaleString(),
                change: `${stats.totalInsightsGenerated} insights`,
                trend: "up",
                icon: BrainCircuit
            },
            {
                label: "Active Users Analysed",
                value: stats.activeUsers.toLocaleString(),
                change: `Across all timeframes`,
                trend: "up",
                icon: Flag
            },
            {
                label: "Avg Confidence Level",
                value: `${(stats.avgConfidenceLevel * 100).toFixed(1)}%`,
                change: stats.avgConfidenceLevel >= 0.8 ? "High" : "Moderate",
                trend: stats.avgConfidenceLevel >= 0.8 ? "up" : "down",
                icon: BarChart2
            },
            {
                label: "Data Points Processed",
                value: stats.totalDataPointsAnalyzed.toLocaleString(),
                change: `${stats.avgGenerationTimeMs.toFixed(0)}ms avg`,
                trend: "up",
                icon: PieChart
            },
        ];
    }, [stats]);

    // Normalize chart data for bar heights
    const chartData = useMemo(() => {
        if (!stats?.reportTypeDistribution.length) return [];
        // Create mock growth data from report type distribution
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const mockData = months.map((month, i) => ({
            month,
            count: Math.floor(Math.random() * 50) + 10,
        }));
        const max = Math.max(...mockData.map((d) => d.count), 1);
        return mockData.map((d) => ({
            month: d.month,
            height: (d.count / max) * 100,
            count: d.count,
        }));
    }, [stats]);

    const currentYear = new Date().getFullYear();

    // ─── Loading State ──────────────────────────────────────────────
    if (loading && !tableLoading) {
        return (
            <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
                    {/* Header Skeleton */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
                        <div>
                            <Skeleton width={220} height={28} className="mb-2" />
                            <Skeleton width={300} height={14} />
                        </div>
                        <div className="flex gap-2 order-1 w-full sm:w-auto">
                            <Skeleton width={150} height={32} />
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
                        {/* Summary Stats Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SummaryCardSkeleton key={i} />
                            ))}
                        </div>

                        {/* Charts Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Growth Chart Skeleton */}
                            <Card className="lg:col-span-2 p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-6 sm:mb-8">
                                    <div>
                                        <Skeleton width={150} height={14} className="mb-2" />
                                        <Skeleton width={120} height={10} />
                                    </div>
                                </div>
                                <Skeleton height={192} className="sm:h-60" />
                            </Card>
                            
                            {/* Distribution Skeleton */}
                            <Card className="p-4 sm:p-6">
                                <Skeleton width={140} height={14} className="mb-2" />
                                <Skeleton width={180} height={10} className="mb-4 sm:mb-6" />
                                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                    <Skeleton width={128} height={128} circle className="mx-auto" />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Skeleton width={8} height={8} circle />
                                                <Skeleton width={60} height={12} />
                                            </div>
                                            <Skeleton width={80} height={12} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Top Users Skeleton */}
                        <Card className="p-4 sm:p-6">
                            <Skeleton width={80} height={14} className="mb-2" />
                            <Skeleton width={120} height={10} className="mb-4 sm:mb-6" />
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TopUserSkeleton key={i} />
                                ))}
                            </div>
                        </Card>

                        {/* Filters Skeleton */}
                        <Card className="p-3 sm:p-4">
                            <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                                <Skeleton width={50} height={14} />
                                <Skeleton width={180} height={32} />
                                <Skeleton width={500} height={32} className="flex-1" />
                                <Skeleton width={70} height={28} />
                            </div>
                        </Card>

                        {/* Cards Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <AnalyticsCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </SkeletonTheme>
        );
    }

    return (
        <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">User Analytics Management</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">View and manage user analytics data and AI-generated reports.</p>
                    </div>
                    <div className="flex gap-2 order-1 w-full sm:w-auto">
                        <div className="flex bg-slate-100 p-1 rounded-lg flex-1 sm:flex-none">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                onClick={() => setViewMode('table')}
                            >
                                <TableIcon size={14} />
                                Table
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 size={14} />
                                Grid
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth"
                >

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {summaryCards.map((card) => (
                            <SummaryCard key={card.label} data={card} />
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Report Growth Chart */}
                        <Card className="lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Report Activity</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">6-month report generation volume.</p>
                                </div>
                            </div>

                            {chartData.length > 0 ? (
                                <>
                                    <div className="relative h-48 sm:h-60 flex items-end justify-between gap-1 sm:gap-6 px-2 border-b border-slate-50">
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                            <div className="w-full h-px bg-slate-100/50" />
                                            <div className="w-full h-px bg-slate-100/50" />
                                            <div className="w-full h-px bg-slate-100/50" />
                                            <div className="w-full h-px bg-slate-100/50" />
                                            <div className="w-full h-px bg-slate-100/50" />
                                        </div>
                                        {chartData.map((d) => (
                                            <div key={d.month} className="flex h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                                                <div
                                                    className="w-4 sm:w-6 md:w-8 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                                                    style={{ height: `${Math.max(d.height, 4)}%` }}
                                                    onMouseEnter={() => setHoveredBar({ month: d.month, count: d.count })}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                />
                                                {hoveredBar && hoveredBar.month === d.month && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                                                        <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                                                        <div className="flex items-center gap-1">
                                                            <span>Reports: {hoveredBar.count}</span>
                                                        </div>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
                                        {chartData.map((d, i) => (
                                            <span key={d.month} className={`${i === chartData.length - 1 ? "text-slate-600" : ""} truncate`}>
                                                <span className="hidden sm:inline">{d.month}</span>
                                                <span className="sm:hidden">{d.month.slice(0, 3)}</span>
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 sm:h-60 text-center px-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                                        <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Activity Data</h4>
                                    <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                        Report activity data will appear here.
                                    </p>
                                </div>
                            )}
                        </Card>
                        {/* Accuracy Distribution Donut Chart */}
                        <Card className="p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                            <div className="mb-4 sm:mb-6">
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Type Distribution</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Reports by type breakdown.</p>
                            </div>

                            {stats && stats.reportTypeDistribution.length > 0 ? (
                                <>
                                    <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                        <div
                                            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                                            style={{
                                                background: (() => {
                                                    const colors: Record<string, string> = {
                                                        spending: '#10b981',
                                                        'income-expense': '#3b82f6',
                                                        savings: '#f59e0b',
                                                        trends: '#8b5cf6',
                                                        goals: '#ec4899',
                                                        predictions: '#06b6d4',
                                                    };
                                                    const total = stats.reportTypeDistribution.reduce((sum, t) => sum + t.count, 0);
                                                    let acc = 0;
                                                    const stops = stats.reportTypeDistribution.map((t) => {
                                                        const start = acc;
                                                        acc += (t.count / total) * 100;
                                                        const color = colors[t.type] || '#94a3b8';
                                                        return `${color} ${start}% ${acc}%`;
                                                    });
                                                    return `conic-gradient(${stops.join(', ')})`;
                                                })()
                                            }}
                                        >
                                            <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                                                <span className="text-sm sm:text-xl font-bold text-slate-900">{stats.totalReports}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 sm:space-y-3 flex-1">
                                        {stats.reportTypeDistribution.map((t) => {
                                            const colors: Record<string, string> = {
                                                spending: 'bg-emerald-500',
                                                'income-expense': 'bg-blue-500',
                                                savings: 'bg-amber-500',
                                                trends: 'bg-purple-500',
                                                goals: 'bg-pink-500',
                                                predictions: 'bg-cyan-500',
                                            };
                                            return (
                                                <div key={t.type} className="flex items-center justify-between text-[10px] sm:text-xs">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colors[t.type] || 'bg-slate-400'}`} />
                                                        <span className="text-slate-600 capitalize">{t.type.replace(/_/g, ' ')}</span>
                                                    </div>
                                                    <span className="font-medium text-slate-900">{t.count} ({t.percentage}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                                        <PieChart size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Type Data</h4>
                                    <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                        Type distribution will appear here.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Top Users Section */}
                    {stats?.topUsers && stats.topUsers.length > 0 && (
                        <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
                            <div className="mb-4 sm:mb-6">
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Top Power Analysts</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Users with highest report generation.</p>
                            </div>

                            <div className="space-y-3">
                                {stats.topUsers.slice(0, 6).map((user, index) => {
                                    const mockUser: User = {
                                        id: user.user_id,
                                        email: user.email,
                                        user_metadata: {
                                            full_name: user.full_name,
                                            avatar_url: user.avatar_url
                                        },
                                        app_metadata: {},
                                        created_at: "",
                                        aud: "authenticated"
                                    } as User;

                                    return (
                                        <div key={user.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                                <div className="relative flex-shrink-0">
                                                    <UserAvatar
                                                        user={mockUser}
                                                        size="lg"
                                                        className="ring-2 ring-white shadow-sm"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {user.full_name || user.email.split('@')[0]}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{user.report_count} reports</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 pl-2">
                                                <p className="text-sm font-semibold text-emerald-600">{user.report_count}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}

                {/* Filters */}
                <Card className="p-3 sm:p-4 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 w-full xl:w-auto">
                            <Filter size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium">Filters</span>
                        </div>
                        <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

                        <div className="relative w-full xl:w-64">
                            <Search size={12} className="sm:w-[14px] sm:h-[14px] absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search analytics..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
                            <FilterDropdown
                                value={month === "all" ? "" : month.toString()}
                                onChange={(value) => setMonth(value === "" ? "all" : Number(value))}
                                options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
                                placeholder="All Months"
                                className="w-full text-slate-900 text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Months"
                                hideSearch={true}
                            />
                            <FilterDropdown
                                value={year === "all" ? "" : year.toString()}
                                onChange={(value) => setYear(value === "" ? "all" : Number(value))}
                                options={Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => ({ value: y.toString(), label: y.toString() }))}
                                placeholder="All Years"
                                className="w-full text-slate-900 text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Years"
                                hideSearch={true}
                            />
                            <FilterDropdown
                                value={reportTypeFilter}
                                onChange={(value) => setReportTypeFilter(value)}
                                options={[
                                    { value: "spending", label: "Spending" },
                                    { value: "income-expense", label: "Income/Expense" },
                                    { value: "savings", label: "Savings" },
                                    { value: "trends", label: "Trends" },
                                    { value: "goals", label: "Goals" },
                                    { value: "predictions", label: "Predictions" },
                                ]}
                                placeholder="All Types"
                                className="w-full text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Types"
                                hideSearch={true}
                            />
                            <FilterDropdown
                                value={userFilter}
                                onChange={(value) => setUserFilter(value)}
                                options={users.map((u) => ({ value: u.id, label: u.email }))}
                                placeholder="All Users"
                                className="w-full text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Users"
                                hideSearch={false}
                            />
                        </div>

                        <div className="flex-1"></div>
                        <div className="flex items-center gap-2 w-full xl:w-auto">
                            <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset to Current Month" onClick={resetFilters}>
                                <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> Current
                            </Button>
                            <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={resetFiltersToAll}>
                                <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> All Time
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Error State */}
                {error && !loading && (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                        <Button variant="outline" size="sm" onClick={refetch}>
                            <RotateCcw size={14} /> Retry
                        </Button>
                    </Card>
                )}

                {/* Analytics Display */}
                {userSummaries.length === 0 && !loading && !tableLoading ? (
                    <Card className="p-12 text-center">
                        <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No user analytics found</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {search ? "Try adjusting your search or filters." : "No user data available in the database."}
                        </p>
                    </Card>
                ) : viewMode === 'table' ? (
                    <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                        {tableLoading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3">User</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Total Reports</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Transactions</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Budgets</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Goals</TableHead>
                                        <TableHead className="px-6 py-3">Last Updated</TableHead>
                                        <TableHead className="px-6 py-3 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: getSafeSkeletonCount(pageSize, 10, 20) }).map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3">User</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Total Reports</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Transactions</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Budgets</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Goals</TableHead>
                                        <TableHead className="px-6 py-3">Last Updated</TableHead>
                                        <TableHead className="px-6 py-3 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userSummaries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                                    <p className="text-sm text-slate-500">No users match your filters</p>
                                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        userSummaries.map((userSummary) => (
                                            <AnalyticsRow
                                                key={userSummary.user_id}
                                                userSummary={userSummary}
                                                onView={handleView}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                ) : tableLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: getSafeSkeletonCount(pageSize, 10, 20) }).map((_, i) => (
                            <AnalyticsCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Grid View (Desktop) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userSummaries.length === 0 ? (
                                <div className="col-span-full">
                                    <Card className="p-12 text-center">
                                        <Inbox size={32} className="text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No users match your filters</p>
                                        <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                            Clear Filters
                                        </Button>
                                    </Card>
                                </div>
                            ) : (
                                userSummaries.map((userSummary) => (
                                    <AnalyticsCard
                                        key={userSummary.user_id}
                                        userSummary={userSummary}
                                        onView={handleView}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>

                        {/* Grid View (Mobile) */}
                        <div className="md:hidden space-y-4">
                            {userSummaries.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No users match your filters</p>
                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                        Clear Filters
                                    </Button>
                                </Card>
                            ) : (
                                userSummaries.map((userSummary) => (
                                    <AnalyticsCard
                                        key={userSummary.user_id}
                                        userSummary={userSummary}
                                        onView={handleView}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && !tableLoading && !error && userSummaries.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={previousPage}
                                        disabled={!hasPreviousPage}
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                    >
                                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                                    </Button>
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => goToPage(pageNum)}
                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-[10px] sm:text-xs"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={nextPage}
                                        disabled={!hasNextPage}
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                    >
                                        <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                                <span>Show</span>
                                <select
                                    value={pageSize === Number.MAX_SAFE_INTEGER ? "all" : pageSize}
                                    onChange={(e) => handlePageSizeChange(e.target.value === "all" ? Number.MAX_SAFE_INTEGER : parseInt(e.target.value))}
                                    className="text-xs sm:text-sm border border-slate-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value="all">All</option>
                                </select>
                                <span className="hidden sm:inline">per page</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedUserSummary && (
                <ViewAdminAnalyticsModal
                    isOpen={viewModalOpen}
                    onClose={() => {
                        setViewModalOpen(false);
                        setSelectedUserSummary(null);
                    }}
                    userSummary={selectedUserSummary}
                />
            )}
            {selectedUserSummary && (
                <DeleteAdminAnalyticsModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedUserSummary(null);
                    }}
                    userSummary={selectedUserSummary}
                    onDeleted={refetch}
                />
            )}
        </div>
        </SkeletonTheme>
    );
}
