"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    BarChart2,
    List,
    Target,
    FileText,
    TrendingUp,
    BrainCircuit,
    PieChart,
    PiggyBank,
    AlertCircle,
    Eye,
    Trash2,
    RotateCcw,
    Table as TableIcon,
    Grid3X3,
    ChevronLeft,
    ChevronRight,
    Inbox,
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
import type { AdminAnalyticsReport } from "./_lib/types";
import { FilterTableSkeleton, TransactionCardSkeleton as AnalyticsCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
import { getSafeSkeletonCount } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User } from "@supabase/supabase-js";

type SummaryType = {
    label: string;
    value: string | number;
    subValue: string;
    icon?: React.ComponentType<any>;
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function formatDate(dateStr?: string): string {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getReportTypeIcon(type: string): React.ComponentType<any> {
    switch (type) {
        case 'spending': return PieChart;
        case 'income-expense': return BarChart2;
        case 'savings': return PiggyBank;
        case 'trends': return TrendingUp;
        case 'goals': return Target;
        case 'predictions': return AlertCircle;
        case 'financial_intelligence': return BrainCircuit;
        default: return FileText;
    }
}

const SummaryCard = memo(({ item }: { item: SummaryType }) => {
    const Icon = item.icon;
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500">
                    {Icon && <Icon size={22} strokeWidth={1.5} />}
                </div>
            </div>
            <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
            <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
            <div className="text-xs text-slate-500 mt-1">{item.subValue}</div>
        </Card>
    );
});

SummaryCard.displayName = "SummaryCard";

const AnalyticsCard = memo(({
    report,
    onView,
    onDelete,
}: {
    report: AdminAnalyticsReport;
    onView: (r: AdminAnalyticsReport) => void;
    onDelete: (r: AdminAnalyticsReport) => void;
}) => {
    const Icon = getReportTypeIcon(report.report_type);

    return (
        <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-lg">
                        <Icon size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold capitalize text-slate-900">{report.report_type.replace(/_/g, " ")}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            {report.user_avatar ? (
                                <img
                                    src={report.user_avatar}
                                    alt={report.user_name || report.user_email || "User"}
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                                    {(report.user_name || report.user_email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="text-xs text-slate-500 min-w-0 truncate">{report.user_email ?? "Unknown User"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-xs font-medium text-blue-600 capitalize">
                        {report.timeframe}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(report.generated_at)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-3">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">Score:</span>
                        <span className="font-semibold text-slate-700">{report.accuracy_score ? `${report.accuracy_score}%` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">Conf:</span>
                        <span className="font-semibold text-slate-700">{report.confidence_level ? `${(report.confidence_level * 100).toFixed(0)}%` : 'N/A'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="View Details" onClick={() => onView(report)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" title="Delete" onClick={() => onDelete(report)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

AnalyticsCard.displayName = "AnalyticsCard";

const AnalyticsRow = memo(({
    report,
    onView,
    onDelete,
}: {
    report: AdminAnalyticsReport;
    onView: (r: AdminAnalyticsReport) => void;
    onDelete: (r: AdminAnalyticsReport) => void;
}) => {
    return (
        <TableRow className="group hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-4 text-slate-400 text-xs">{formatDate(report.generated_at)}</TableCell>
            <TableCell className="px-6 py-4">
                <span className="font-medium text-slate-900 capitalize text-sm">{report.report_type.replace(/_/g, " ")}</span>
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2 max-w-[150px]">
                    {report.user_avatar ? (
                        <img
                            src={report.user_avatar}
                            alt={report.user_name || report.user_email || "User"}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full shrink-0 bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                            {(report.user_name || report.user_email || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-slate-500 text-sm truncate">{report.user_email ?? "Unknown"}</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4">
                <span className="text-xs font-medium text-blue-600 capitalize">
                    {report.timeframe}
                </span>
            </TableCell>
            <TableCell className="px-6 py-4 text-center">
                <div className="flex gap-3 justify-center text-xs">
                    <span className="font-medium text-slate-700">{report.accuracy_score ? `${report.accuracy_score}%` : '—'}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-medium text-slate-700">{report.confidence_level ? `${(report.confidence_level * 100).toFixed(0)}%` : '—'}</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="View Details" onClick={() => onView(report)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" title="Delete" onClick={() => onDelete(report)}>
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
    const [selectedReport, setSelectedReport] = useState<AdminAnalyticsReport | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const contentRef = useRef<HTMLDivElement>(null);

    const {
        reports,
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

    const handleView = useCallback((r: AdminAnalyticsReport) => {
        setSelectedReport(r);
        setViewModalOpen(true);
    }, []);

    const handleDelete = useCallback((r: AdminAnalyticsReport) => {
        setSelectedReport(r);
        setDeleteModalOpen(true);
    }, []);

    // Build summary cards from real data
    const summaryItems: SummaryType[] = useMemo(() => {
        if (!stats) return [];

        return [
            {
                label: "Total AI Reports",
                value: stats.totalReports.toLocaleString(),
                subValue: `${stats.totalInsightsGenerated} insights generated`,
                icon: BrainCircuit
            },
            {
                label: "Active Users Analysed",
                value: stats.activeUsers.toLocaleString(),
                subValue: `Across all timeframes`,
                icon: Target
            },
            {
                label: "Avg Confidence Level",
                value: `${(stats.avgConfidenceLevel * 100).toFixed(1)}%`,
                subValue: `Across ${stats.totalReports} reports`,
                icon: BarChart2
            },
            {
                label: "Data Points Processed",
                value: stats.totalDataPointsAnalyzed.toLocaleString(),
                subValue: `Avg Gen Time: ${stats.avgGenerationTimeMs.toFixed(0)}ms`,
                icon: PieChart
            },
        ];
    }, [stats]);

    const currentYear = new Date().getFullYear();

    if (loading && !tableLoading) {
        return (
            <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
                        <div>
                            <Skeleton width={220} height={28} className="mb-2" />
                            <Skeleton width={300} height={14} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="p-4 sm:p-5">
                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                        <Skeleton width={36} height={36} borderRadius={8} />
                                    </div>
                                    <Skeleton width={90} height={14} className="mb-2" />
                                    <Skeleton width={110} height={22} />
                                </Card>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <Card className="lg:col-span-2 p-4 sm:p-6 text-center">
                                <Skeleton height={192} className="sm:h-60" />
                            </Card>
                            <Card className="p-4 sm:p-6 text-center">
                                <Skeleton height={192} className="sm:h-60" />
                            </Card>
                        </div>
                        <Card className="p-3 sm:p-4">
                            <Skeleton height={32} />
                        </Card>
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
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">System Analytics Management</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">View and manage all system analytics data and AI reports.</p>
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
                            <span className="hidden sm:inline ml-1">Table</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 size={14} />
                            <span className="hidden sm:inline ml-1">Grid</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div
                ref={contentRef}
                className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth"
            >

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryItems.map((item) => (
                        <SummaryCard key={item.label} item={item} />
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* Type Distribution */}
                    <Card className="lg:col-span-2 p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Report Types Distribution</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Breakdown of AI generated reports by type.</p>
                        </div>
                        {stats?.reportTypeDistribution.length ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.reportTypeDistribution.map((t) => (
                                    <div key={t.type} className="bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-emerald-600">{t.count}</span>
                                        <span className="text-xs text-slate-500 uppercase mt-1">{t.type.replace(/_/g, ' ')}</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">{t.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                                <PieChart size={24} className="mb-2" />
                                <p className="text-sm">No report type data available.</p>
                            </div>
                        )}
                    </Card>

                    {/* Accuracy Score Distribution Donut Chart */}
                    <Card className="p-4 sm:p-6 hover:shadow-md transition-all flex flex-col">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Accuracy Distribution</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Reports by accuracy score range.</p>
                        </div>
                        {stats && reports.length > 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40 mb-4">
                                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                        {(() => {
                                            const accuracyRanges = [
                                                { label: '90-100%', min: 90, max: 100, color: '#10b981' },
                                                { label: '80-89%', min: 80, max: 89, color: '#3b82f6' },
                                                { label: '70-79%', min: 70, max: 79, color: '#f59e0b' },
                                                { label: '60-69%', min: 60, max: 69, color: '#ef4444' },
                                                { label: '<60%', min: 0, max: 59, color: '#94a3b8' }
                                            ];
                                            
                                            const distribution = accuracyRanges.map(range => ({
                                                ...range,
                                                count: reports.filter(r => 
                                                    r.accuracy_score && r.accuracy_score >= range.min && r.accuracy_score <= range.max
                                                ).length
                                            })).filter(d => d.count > 0);
                                            
                                            const total = distribution.reduce((sum, d) => sum + d.count, 0);
                                            let currentAngle = 0;
                                            
                                            return distribution.map((item, index) => {
                                                const percentage = (item.count / total) * 100;
                                                const angle = (percentage / 100) * 360;
                                                const startAngle = currentAngle;
                                                currentAngle += angle;
                                                
                                                const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                                const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                                const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                                                const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                                                const largeArc = angle > 180 ? 1 : 0;
                                                
                                                return (
                                                    <path
                                                        key={item.label}
                                                        d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                                        fill={item.color}
                                                        className="hover:opacity-80 transition-opacity"
                                                    />
                                                );
                                            });
                                        })()}
                                        <circle cx="50" cy="50" r="25" fill="white" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
                                            <p className="text-[10px] text-slate-500">Reports</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 w-full">
                                    {(() => {
                                        const accuracyRanges = [
                                            { label: '90-100%', min: 90, max: 100, color: 'bg-emerald-500' },
                                            { label: '80-89%', min: 80, max: 89, color: 'bg-blue-500' },
                                            { label: '70-79%', min: 70, max: 79, color: 'bg-amber-500' },
                                            { label: '60-69%', min: 60, max: 69, color: 'bg-red-500' },
                                            { label: '<60%', min: 0, max: 59, color: 'bg-slate-400' }
                                        ];
                                        
                                        const distribution = accuracyRanges.map(range => ({
                                            ...range,
                                            count: reports.filter(r => 
                                                r.accuracy_score && r.accuracy_score >= range.min && r.accuracy_score <= range.max
                                            ).length
                                        })).filter(d => d.count > 0);
                                        
                                        const total = distribution.reduce((sum, d) => sum + d.count, 0);
                                        
                                        return distribution.map((item) => {
                                            const percentage = ((item.count / total) * 100).toFixed(1);
                                            return (
                                                <div key={item.label} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                                        <span className="text-slate-600">{item.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-slate-900">{percentage}%</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <PieChart size={24} className="mb-2" />
                                <p className="text-sm">No accuracy data available.</p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                    <div key={user.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                            <div className="relative flex-shrink-0">
                                                <UserAvatar
                                                    user={mockUser}
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-slate-900 truncate">
                                                    {user.full_name || user.email.split('@')[0]}
                                                </p>
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
                <Card className="p-3 sm:p-4 hover:shadow-md transition-all group cursor-pointer z-20">
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
                {reports.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No analytics reports found</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {search ? "Try adjusting your search or filters." : "No reports available in the database."}
                        </p>
                    </Card>
                ) : viewMode === 'table' ? (
                    <Card className="hover:shadow-md transition-all group overflow-x-auto relative z-10">
                        {tableLoading ? (
                            <FilterTableSkeleton rows={getSafeSkeletonCount(pageSize)} columns={6} />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">Date</TableHead>
                                        <TableHead className="px-6 py-3">Type</TableHead>
                                        <TableHead className="px-6 py-3">User</TableHead>
                                        <TableHead className="px-6 py-3">Timeframe</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Accuracy | Confidence</TableHead>
                                        <TableHead className="px-6 py-3 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <AnalyticsRow
                                            key={report.id}
                                            report={report}
                                            onView={handleView}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reports.map((report) => (
                                <AnalyticsCard
                                    key={report.id}
                                    report={report}
                                    onView={handleView}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination Controls */}
                {reports.length > 0 && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-6 relative z-10 border-t border-slate-100">
                        {/* Items per page selection */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Rows per page</span>
                            <select
                                className="bg-white border border-slate-200 text-slate-700 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                            <span className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1 text-center font-medium">
                                Page {currentPage} of {totalPages} <span className="text-slate-300 font-normal">({totalCount} items)</span>
                            </span>
                            <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={previousPage}
                                    disabled={!hasPreviousPage || loading}
                                    className="flex-1 sm:flex-none border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                                >
                                    <ChevronLeft size={16} className="mr-1" /> Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={nextPage}
                                    disabled={!hasNextPage || loading}
                                    className="flex-1 sm:flex-none border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                                >
                                    Next <ChevronRight size={16} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedReport && (
                <ViewAdminAnalyticsModal
                    isOpen={viewModalOpen}
                    onClose={() => {
                        setViewModalOpen(false);
                        setSelectedReport(null);
                    }}
                    report={selectedReport}
                />
            )}
            {selectedReport && (
                <DeleteAdminAnalyticsModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedReport(null);
                    }}
                    report={selectedReport}
                    onDeleted={refetch}
                />
            )}
        </div>
    );
}
