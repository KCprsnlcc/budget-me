"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useRef } from "react";
import {
    Search,
    Filter,
    Brain,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Eye,
    Trash2,
    RotateCcw,
    Table as TableIcon,
    Grid3X3,
    ChevronLeft,
    ChevronRight,
    Inbox,
    MoreHorizontal,
    Plus,
    Activity,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Wand2,
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
import { ViewAdminPredictionModal } from "./_components/view-admin-prediction-modal";
import { DeleteAdminPredictionModal } from "./_components/delete-admin-prediction-modal";
import { AddAdminPredictionModal } from "./_components/add-admin-prediction-modal";
import { useAdminPredictions } from "./_lib/use-admin-predictions";
import type { AdminPredictionReport, AdminAIInsight } from "./_lib/types";
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

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

const ReportCardSkeleton = memo(function ReportCardSkeleton() {
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton width={36} height={36} circle />
                    <div className="flex-1">
                        <Skeleton width={100} height={14} className="mb-1" />
                        <Skeleton width={140} height={10} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Skeleton width={30} height={12} className="mx-auto mb-1" />
                    <Skeleton width={40} height={9} className="mx-auto" />
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Skeleton width={35} height={12} className="mx-auto mb-1" />
                    <Skeleton width={45} height={9} className="mx-auto" />
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Skeleton width={80} height={10} />
                <div className="flex items-center gap-1">
                    <Skeleton width={32} height={32} borderRadius={8} />
                    <Skeleton width={32} height={32} borderRadius={8} />
                </div>
            </div>
        </Card>
    );
});

const InsightCardSkeleton = memo(function InsightCardSkeleton() {
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton width={36} height={36} circle />
                    <div className="flex-1">
                        <Skeleton width={100} height={14} className="mb-1" />
                        <Skeleton width={140} height={10} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Skeleton width={40} height={12} className="mx-auto mb-1" />
                    <Skeleton width={50} height={9} className="mx-auto" />
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Skeleton width={80} height={10} />
                <div className="flex items-center gap-1">
                    <Skeleton width={32} height={32} borderRadius={8} />
                    <Skeleton width={32} height={32} borderRadius={8} />
                </div>
            </div>
        </Card>
    );
});

const TableRowSkeleton = memo(function TableRowSkeleton({ columns }: { columns: number }) {
    return (
        <TableRow className="hover:bg-slate-50/50">
            {/* Date */}
            <TableCell className="px-6 py-3">
                <Skeleton width={100} height={14} />
            </TableCell>
            {/* User */}
            <TableCell className="px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <Skeleton width={36} height={36} circle />
                    <div>
                        <Skeleton width={100} height={14} className="mb-1" />
                        <Skeleton width={140} height={10} />
                    </div>
                </div>
            </TableCell>
            {/* Conditional columns for reports only (Data Points & Accuracy) */}
            {columns === 5 && (
                <>
                    {/* Data Points */}
                    <TableCell className="px-6 py-3 text-center">
                        <Skeleton width={40} height={14} className="mx-auto" />
                    </TableCell>
                    {/* Accuracy */}
                    <TableCell className="px-6 py-3 text-center">
                        <Skeleton width={45} height={14} className="mx-auto" />
                    </TableCell>
                </>
            )}
            {/* Actions */}
            <TableCell className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
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
                <Skeleton width={80} height={14} className="mb-1" />
                <Skeleton width={70} height={12} />
            </div>
        </div>
    );
});

// ──────────────────────────── Summary Card ────────────────────────────

const SummaryCard = memo(function SummaryCard({ data }: { data: SummaryType }) {
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

// ──────────────────────────── Report Row ────────────────────────────

const ReportRow = memo(function ReportRow({
    report,
    onView,
    onDelete,
}: {
    report: AdminPredictionReport;
    onView: (r: AdminPredictionReport) => void;
    onDelete: (r: AdminPredictionReport) => void;
}) {
    const mockUser: User = {
        id: report.user_id,
        email: report.user_email || "",
        user_metadata: { full_name: report.user_name, avatar_url: report.user_avatar },
        app_metadata: {},
        aud: "authenticated",
        created_at: report.created_at,
    } as User;

    return (
        <TableRow className="hover:bg-slate-50/50 transition-colors">
            <TableCell className="px-6 py-3">
                <span className="text-sm text-slate-700">{formatDate(report.created_at)}</span>
            </TableCell>
            <TableCell className="px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <UserAvatar user={mockUser} size="sm" className="ring-1 ring-white shadow-sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{report.user_name || "No Name"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{report.user_email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <span className="text-sm font-medium text-slate-700">{report.data_points}</span>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                {report.accuracy_score !== null ? (
                    <span className={`text-sm font-bold ${Number(report.accuracy_score) >= 80 ? "text-emerald-600" :
                        Number(report.accuracy_score) >= 60 ? "text-amber-600" : "text-red-600"
                        }`}>
                        {Number(report.accuracy_score).toFixed(0)}%
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                )}
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(report)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(report)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

// ──────────────────────────── Insight Row ────────────────────────────

const InsightRow = memo(function InsightRow({
    insight,
    onView,
    onDelete,
}: {
    insight: AdminAIInsight;
    onView: (i: AdminAIInsight) => void;
    onDelete: (i: AdminAIInsight) => void;
}) {
    const mockUser: User = {
        id: insight.user_id,
        email: insight.user_email || "",
        user_metadata: { full_name: insight.user_name, avatar_url: insight.user_avatar },
        app_metadata: {},
        aud: "authenticated",
        created_at: insight.generated_at,
    } as User;

    return (
        <TableRow className="hover:bg-slate-50/50 transition-colors">
            <TableCell className="px-6 py-3">
                <span className="text-sm text-slate-700">{formatDate(insight.generated_at)}</span>
            </TableCell>
            <TableCell className="px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <UserAvatar user={mockUser} size="sm" className="ring-1 ring-white shadow-sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{insight.user_name || "No Name"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{insight.user_email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(insight)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(insight)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

// ──────────────────────────── Report Card ────────────────────────────

const ReportCard = memo(function ReportCard({
    report,
    onView,
    onDelete,
}: {
    report: AdminPredictionReport;
    onView: (r: AdminPredictionReport) => void;
    onDelete: (r: AdminPredictionReport) => void;
}) {
    const mockUser: User = {
        id: report.user_id,
        email: report.user_email || "",
        user_metadata: { full_name: report.user_name, avatar_url: report.user_avatar },
        app_metadata: {},
        aud: "authenticated",
        created_at: report.created_at,
    } as User;

    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar user={mockUser} size="sm" className="ring-1 ring-white shadow-sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{report.user_name || "No Name"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{report.user_email}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-900">{report.data_points}</p>
                    <p className="text-[9px] text-slate-400 uppercase">Points</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className={`text-xs font-bold ${report.accuracy_score !== null
                        ? Number(report.accuracy_score) >= 80 ? "text-emerald-600" : Number(report.accuracy_score) >= 60 ? "text-amber-600" : "text-red-600"
                        : "text-slate-400"
                        }`}>
                        {report.accuracy_score !== null ? `${Number(report.accuracy_score).toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase">Accuracy</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{formatDate(report.created_at)}</span>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(report)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(report)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

// ──────────────────────────── Insight Card ────────────────────────────

const InsightCard = memo(function InsightCard({
    insight,
    onView,
    onDelete,
}: {
    insight: AdminAIInsight;
    onView: (i: AdminAIInsight) => void;
    onDelete: (i: AdminAIInsight) => void;
}) {
    const mockUser: User = {
        id: insight.user_id,
        email: insight.user_email || "",
        user_metadata: { full_name: insight.user_name, avatar_url: insight.user_avatar },
        app_metadata: {},
        aud: "authenticated",
        created_at: insight.generated_at,
    } as User;

    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar user={mockUser} size="sm" className="ring-1 ring-white shadow-sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{insight.user_name || "No Name"}</p>
                        <p className="text-[10px] text-slate-400 truncate">{insight.user_email}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-emerald-600">
                        {insight.confidence_level ? `${(Number(insight.confidence_level) * 100).toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase">Confidence</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{formatDate(insight.generated_at)}</span>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(insight)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(insight)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

// ──────────────────────────── Main Page ────────────────────────────

export default function AdminPredictionsPage() {
    const {
        reports,
        insights,
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
        statusFilter,
        setStatusFilter,
        dataSource,
        setDataSource,
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
    } = useAdminPredictions();

    const currentYear = new Date().getFullYear();

    // View mode
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");

    // Modals
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<AdminPredictionReport | null>(null);
    const [selectedInsight, setSelectedInsight] = useState<AdminAIInsight | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [hoveredBar, setHoveredBar] = useState<{ month: string, count: number } | null>(null);

    // Handlers
    const handleViewReport = useCallback((report: AdminPredictionReport) => {
        setSelectedReport(report);
        setSelectedInsight(null);
        setViewModalOpen(true);
    }, []);

    const handleViewInsight = useCallback((insight: AdminAIInsight) => {
        setSelectedInsight(insight);
        setSelectedReport(null);
        setViewModalOpen(true);
    }, []);

    const handleDeleteReport = useCallback((report: AdminPredictionReport) => {
        setSelectedReport(report);
        setSelectedInsight(null);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteInsight = useCallback((insight: AdminAIInsight) => {
        setSelectedInsight(insight);
        setSelectedReport(null);
        setDeleteModalOpen(true);
    }, []);

    // Summary cards data
    const summaryCards: SummaryType[] = useMemo(() => {
        if (!stats) return [];
        return [
            {
                label: "Total Reports",
                value: stats.totalReports.toString(),
                change: `${stats.monthOverMonthGrowth >= 0 ? "+" : ""}${stats.monthOverMonthGrowth.toFixed(0)}%`,
                trend: stats.monthOverMonthGrowth >= 0 ? "up" : "down",
                icon: Brain,
            },
            {
                label: "Total Insights",
                value: stats.totalInsights.toString(),
                change: `${stats.activeUsers} users`,
                trend: "up",
                icon: TrendingUp,
            },
            {
                label: "Avg Accuracy",
                value: `${stats.avgAccuracy.toFixed(1)}%`,
                change: stats.avgAccuracy >= 70 ? "High" : "Needs improvement",
                trend: stats.avgAccuracy >= 70 ? "up" : "down",
                icon: Activity,
            },
            {
                label: "AI Confidence",
                value: `${stats.avgConfidence.toFixed(1)}%`,
                change: `${stats.totalInsights} insights`,
                trend: stats.avgConfidence >= 80 ? "up" : "down",
                icon: Shield,
            },
        ];
    }, [stats]);

    // Normalize chart data for bar heights
    const chartData = useMemo(() => {
        if (!stats?.reportGrowth.length) return [];
        const max = Math.max(...stats.reportGrowth.map((d) => d.count), 1);
        return stats.reportGrowth.map((d) => ({
            month: d.month,
            height: (d.count / max) * 100,
            count: d.count,
        }));
    }, [stats]);

    // Build conic-gradient for source distribution donut
    const sourceTotal = useMemo(() => {
        if (!stats) return 0;
        return stats.totalReports + stats.totalInsights;
    }, [stats]);

    const sourceDistribution = useMemo(() => {
        if (!stats) return [];
        return [
            { type: "reports", count: stats.totalReports, percentage: sourceTotal > 0 ? ((stats.totalReports / sourceTotal) * 100).toFixed(1) : "0" },
            { type: "insights", count: stats.totalInsights, percentage: sourceTotal > 0 ? ((stats.totalInsights / sourceTotal) * 100).toFixed(1) : "0" },
        ];
    }, [stats, sourceTotal]);

    const sourceGradient = useMemo(() => {
        if (!stats || sourceTotal === 0) return "conic-gradient(#e2e8f0 0% 100%)";
        const colors: Record<string, string> = {
            reports: "#10b981",
            insights: "#3b82f6",
        };
        let acc = 0;
        const stops = sourceDistribution.map((s) => {
            const start = acc;
            acc += (s.count / sourceTotal) * 100;
            const color = colors[s.type] || "#94a3b8";
            return `${color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }, [stats, sourceTotal, sourceDistribution]);

    // Items for current view
    const items = dataSource === "reports" ? reports : insights;
    const itemCount = items.length;

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
                        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                            <Skeleton width={80} height={32} />
                            <Skeleton width={150} height={32} />
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
                        {/* Summary Stats Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="p-4 sm:p-5">
                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                        <Skeleton width={36} height={36} borderRadius={8} />
                                        <Skeleton width={70} height={18} borderRadius={10} />
                                    </div>
                                    <Skeleton width={90} height={14} className="mb-2" />
                                    <Skeleton width={110} height={22} />
                                </Card>
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
                            
                            {/* Source Distribution Skeleton */}
                            <Card className="p-4 sm:p-6">
                                <Skeleton width={140} height={14} className="mb-2" />
                                <Skeleton width={180} height={10} className="mb-4 sm:mb-6" />
                                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                    <Skeleton width={128} height={128} circle className="mx-auto" />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {Array.from({ length: 2 }).map((_, i) => (
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

                        {/* Data Source Tabs Skeleton */}
                        <div className="flex items-center gap-2">
                            <Skeleton width={150} height={36} borderRadius={8} />
                            <Skeleton width={120} height={36} borderRadius={8} />
                        </div>

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
                                dataSource === "reports" ? (
                                    <ReportCardSkeleton key={i} />
                                ) : (
                                    <InsightCardSkeleton key={i} />
                                )
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
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">AI Predictions</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Manage AI prediction reports and insights across all users.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
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
                        <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 order-2 w-full sm:w-auto"
                            onClick={() => setAddModalOpen(true)}
                        >
                            <Plus size={14} className="sm" />
                            <span className="hidden sm:inline">Generate Prediction</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
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
                                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Report Growth</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">6-month report creation volume.</p>
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
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Growth Data</h4>
                                    <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                        Report creation data will appear here.
                                    </p>
                                </div>
                            )}
                        </Card>

                        {/* Source Distribution */}
                        <Card className="p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                            <div className="mb-4 sm:mb-6">
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Source Distribution</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Reports vs Insights breakdown.</p>
                            </div>

                            {sourceDistribution.length > 0 && sourceTotal > 0 ? (
                                <>
                                    <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                        <div
                                            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                                            style={{ background: sourceGradient }}
                                        >
                                            <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                                                <span className="text-sm sm:text-xl font-bold text-slate-900">{sourceTotal}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 sm:space-y-3 flex-1">
                                        {sourceDistribution.map((source) => (
                                            <div key={source.type} className="flex items-center justify-between text-[10px] sm:text-xs">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <div
                                                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                                        style={{
                                                            backgroundColor: source.type === "reports" ? "#10b981" : "#3b82f6",
                                                        }}
                                                    />
                                                    <span className="text-slate-600 capitalize">{source.type}</span>
                                                </div>
                                                <span className="font-medium text-slate-900">{source.count} ({source.percentage}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                                        <Brain size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Source Data</h4>
                                    <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                        Source distribution will appear here.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Top Users Section */}
                    <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Top Users</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Most active users.</p>
                        </div>
                        <div className="space-y-3">
                            {stats?.topUsers.map((user, i) => {
                                const mockUser: User = {
                                    id: user.user_id,
                                    email: user.email,
                                    user_metadata: { full_name: user.full_name, avatar_url: user.avatar_url },
                                    app_metadata: {},
                                    aud: "authenticated",
                                    created_at: "",
                                } as User;

                                return (
                                    <div key={user.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <UserAvatar 
                                                    user={mockUser} 
                                                    size="lg"
                                                    className="ring-2 ring-white shadow-sm"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {user.full_name || user.email}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.report_count + user.insight_count} records</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-slate-900">{user.report_count} reports</p>
                                            <p className="text-xs text-slate-500">{user.insight_count} insights</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

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
                                placeholder={`Search ${dataSource}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 xl:flex items-center gap-2 w-full xl:w-auto">
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
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                                    dataSource === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                onClick={() => setDataSource('reports')}
                            >
                                <Brain size={14}/>
                                Prediction Reports
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                                    dataSource === 'insights' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                onClick={() => setDataSource('insights')}
                            >
                                <Wand2 size={14}/>
                                AI Insights
                            </Button>
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

                {/* Data Display */}
                {itemCount === 0 && !loading && !tableLoading ? (
                    <Card className="p-12 text-center">
                        <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No {dataSource} found</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {search ? "Try adjusting your search or filters." : `No ${dataSource} available.`}
                        </p>
                    </Card>
                ) : viewMode === 'table' ? (
                    <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                        {tableLoading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3">
                                            <div className="flex items-center gap-1">
                                                Date <MoreHorizontal size={12} className="rotate-90" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="px-6 py-3">User</TableHead>
                                        {dataSource === "reports" && (
                                            <>
                                                <TableHead className="px-6 py-3 text-center">Data Points</TableHead>
                                                <TableHead className="px-6 py-3 text-center">Accuracy</TableHead>
                                            </>
                                        )}
                                        <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: pageSize > 20 ? 20 : pageSize }).map((_, i) => (
                                        <TableRowSkeleton key={i} columns={dataSource === "reports" ? 5 : 3} />
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">
                                            <div className="flex items-center gap-1">
                                                Date <MoreHorizontal size={12} className="rotate-90" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="px-6 py-3">User</TableHead>
                                        {dataSource === "reports" && (
                                            <>
                                                <TableHead className="px-6 py-3 text-center">Data Points</TableHead>
                                                <TableHead className="px-6 py-3 text-center">Accuracy</TableHead>
                                            </>
                                        )}
                                        <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemCount === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={dataSource === "reports" ? 5 : 3} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                                    <p className="text-sm text-slate-500">No {dataSource} match your filters</p>
                                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : dataSource === "reports" ? (
                                        reports.map((report) => (
                                            <ReportRow
                                                key={report.id}
                                                report={report}
                                                onView={handleViewReport}
                                                onDelete={handleDeleteReport}
                                            />
                                        ))
                                    ) : (
                                        insights.map((insight) => (
                                            <InsightRow
                                                key={insight.id}
                                                insight={insight}
                                                onView={handleViewInsight}
                                                onDelete={handleDeleteInsight}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                ) : tableLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: pageSize > 20 ? 20 : pageSize }).map((_, i) => (
                            dataSource === "reports" ? (
                                <ReportCardSkeleton key={i} />
                            ) : (
                                <InsightCardSkeleton key={i} />
                            )
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Grid View (Desktop) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {itemCount === 0 ? (
                                <div className="col-span-full">
                                    <Card className="p-12 text-center">
                                        <Inbox size={32} className="text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No {dataSource} match your filters</p>
                                        <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                            Clear Filters
                                        </Button>
                                    </Card>
                                </div>
                            ) : dataSource === "reports" ? (
                                reports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        onView={handleViewReport}
                                        onDelete={handleDeleteReport}
                                    />
                                ))
                            ) : (
                                insights.map((insight) => (
                                    <InsightCard
                                        key={insight.id}
                                        insight={insight}
                                        onView={handleViewInsight}
                                        onDelete={handleDeleteInsight}
                                    />
                                ))
                            )}
                        </div>

                        {/* Grid View (Mobile) */}
                        <div className="md:hidden space-y-4">
                            {itemCount === 0 ? (
                                <Card className="p-12 text-center">
                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No {dataSource} match your filters</p>
                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                        Clear Filters
                                    </Button>
                                </Card>
                            ) : dataSource === "reports" ? (
                                reports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        onView={handleViewReport}
                                        onDelete={handleDeleteReport}
                                    />
                                ))
                            ) : (
                                insights.map((insight) => (
                                    <InsightCard
                                        key={insight.id}
                                        insight={insight}
                                        onView={handleViewInsight}
                                        onDelete={handleDeleteInsight}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && !tableLoading && !error && itemCount > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} {dataSource}
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
            <ViewAdminPredictionModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                report={selectedReport}
                insight={selectedInsight}
                dataSource={dataSource}
            />
            <AddAdminPredictionModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={refetch}
            />
            <DeleteAdminPredictionModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                report={selectedReport}
                insight={selectedInsight}
                dataSource={dataSource}
                onSuccess={refetch}
            />
        </div>
        </SkeletonTheme>
    );
}
