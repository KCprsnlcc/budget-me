"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo } from "react";
import {
    Search,
    Filter,
    Download,
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
    Edit,
    BarChart3,
    Sparkles,
    Activity,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Users,
    Database,
    Layers,
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
import { EditAdminPredictionModal } from "./_components/edit-admin-prediction-modal";
import { useAdminPredictions } from "./_lib/use-admin-predictions";
import type { AdminPredictionReport, AdminAIInsight } from "./_lib/types";
import { FilterTableSkeleton, TransactionCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
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

function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatCurrency(amount: number): string {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ──────────────────────────── Skeleton Components ────────────────────────────

const SummaryCardSkeleton = memo(function SummaryCardSkeleton() {
    return (
        <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between">
                <div className="space-y-2 sm:space-y-3 flex-1">
                    <Skeleton width={90} height={10} />
                    <Skeleton width={120} height={24} />
                    <Skeleton width={64} height={12} />
                </div>
                <Skeleton width={36} height={36} borderRadius={10} />
            </div>
        </Card>
    );
});

const PredictionCardSkeleton = memo(function PredictionCardSkeleton() {
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton width={36} height={36} borderRadius="50%" />
                    <div>
                        <Skeleton width={100} height={14} className="mb-1" />
                        <Skeleton width={140} height={11} />
                    </div>
                </div>
                <Skeleton width={70} height={22} borderRadius={100} />
            </div>
            <div className="space-y-2">
                <Skeleton width="100%" height={12} />
                <Skeleton width="60%" height={12} />
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <Skeleton width={80} height={11} />
                <div className="flex gap-1.5">
                    <Skeleton width={28} height={28} borderRadius={8} />
                    <Skeleton width={28} height={28} borderRadius={8} />
                    <Skeleton width={28} height={28} borderRadius={8} />
                </div>
            </div>
        </Card>
    );
});

// ──────────────────────────── Summary Card ────────────────────────────

const SummaryCard = memo(function SummaryCard({ data }: { data: SummaryType }) {
    const Icon = data.icon;
    return (
        <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between">
                <div className="space-y-2 sm:space-y-3">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">{data.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{data.value}</p>
                    <div className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${data.trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                            }`}>
                            {data.trend === "up" ? <ArrowUp size={10} className="sm:w-3 sm:h-3" /> : <ArrowDown size={10} className="sm:w-3 sm:h-3" />}
                            {data.change}
                        </div>
                    </div>
                </div>
                {Icon && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                        <Icon size={18} className="sm:w-5 sm:h-5 text-violet-500" />
                    </div>
                )}
            </div>
        </Card>
    );
});

// ──────────────────────────── Report Row ────────────────────────────

const ReportRow = memo(function ReportRow({
    report,
    onView,
    onEdit,
    onDelete,
}: {
    report: AdminPredictionReport;
    onView: (r: AdminPredictionReport) => void;
    onEdit: (r: AdminPredictionReport) => void;
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
            <TableCell className="px-6 py-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100">
                    <Brain size={10} /> {report.report_type}
                </span>
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
                <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => onView(report)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                        <Eye size={13} />
                    </button>
                    <button onClick={() => onEdit(report)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <Edit size={13} />
                    </button>
                    <button onClick={() => onDelete(report)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 transition-all">
                        <Trash2 size={13} />
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
});

// ──────────────────────────── Insight Row ────────────────────────────

const InsightRow = memo(function InsightRow({
    insight,
    onView,
    onEdit,
    onDelete,
}: {
    insight: AdminAIInsight;
    onView: (i: AdminAIInsight) => void;
    onEdit: (i: AdminAIInsight) => void;
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
            <TableCell className="px-6 py-3">
                <span className="text-xs text-slate-600 font-medium">{insight.model_used || "—"}</span>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${insight.processing_status === "completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                    {insight.processing_status === "completed" ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                    {insight.processing_status || "Unknown"}
                </span>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    {insight.admin_validated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                            <Shield size={9} /> Validated
                        </span>
                    )}
                    {insight.anomaly_detected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100">
                            <AlertTriangle size={9} /> Anomaly
                        </span>
                    )}
                    {!insight.admin_validated && !insight.anomaly_detected && (
                        <span className="text-xs text-slate-400">—</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => onView(insight)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                        <Eye size={13} />
                    </button>
                    <button onClick={() => onEdit(insight)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <Edit size={13} />
                    </button>
                    <button onClick={() => onDelete(insight)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 transition-all">
                        <Trash2 size={13} />
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
});

// ──────────────────────────── Report Card ────────────────────────────

const ReportCard = memo(function ReportCard({
    report,
    onView,
    onEdit,
    onDelete,
}: {
    report: AdminPredictionReport;
    onView: (r: AdminPredictionReport) => void;
    onEdit: (r: AdminPredictionReport) => void;
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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100">
                    <Brain size={10} /> {report.report_type}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
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
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-700">{report.model_version || "—"}</p>
                    <p className="text-[9px] text-slate-400 uppercase">Model</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{formatDate(report.created_at)}</span>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(report)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                        <Eye size={13} />
                    </button>
                    <button onClick={() => onEdit(report)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <Edit size={13} />
                    </button>
                    <button onClick={() => onDelete(report)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 transition-all">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </Card>
    );
});

// ──────────────────────────── Insight Card ────────────────────────────

const InsightCard = memo(function InsightCard({
    insight,
    onView,
    onEdit,
    onDelete,
}: {
    insight: AdminAIInsight;
    onView: (i: AdminAIInsight) => void;
    onEdit: (i: AdminAIInsight) => void;
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
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${insight.processing_status === "completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                    {insight.processing_status === "completed" ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                    {insight.processing_status || "Unknown"}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-700">{insight.model_used || "—"}</p>
                    <p className="text-[9px] text-slate-400 uppercase">Model</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-violet-600">
                        {insight.confidence_level ? `${(Number(insight.confidence_level) * 100).toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase">Confidence</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                {insight.admin_validated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                        <Shield size={9} /> Validated
                    </span>
                )}
                {insight.anomaly_detected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100">
                        <AlertTriangle size={9} /> Anomaly
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{formatDate(insight.generated_at)}</span>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(insight)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                        <Eye size={13} />
                    </button>
                    <button onClick={() => onEdit(insight)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <Edit size={13} />
                    </button>
                    <button onClick={() => onDelete(insight)} className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 transition-all">
                        <Trash2 size={13} />
                    </button>
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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<AdminPredictionReport | null>(null);
    const [selectedInsight, setSelectedInsight] = useState<AdminAIInsight | null>(null);

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

    const handleEditReport = useCallback((report: AdminPredictionReport) => {
        setSelectedReport(report);
        setSelectedInsight(null);
        setEditModalOpen(true);
    }, []);

    const handleEditInsight = useCallback((insight: AdminAIInsight) => {
        setSelectedInsight(insight);
        setSelectedReport(null);
        setEditModalOpen(true);
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
                icon: BarChart3,
            },
            {
                label: "Total Insights",
                value: stats.totalInsights.toString(),
                change: `${stats.activeUsers} users`,
                trend: "up",
                icon: Sparkles,
            },
            {
                label: "Avg Accuracy",
                value: `${stats.avgAccuracy.toFixed(1)}%`,
                change: stats.avgAccuracy >= 70 ? "High" : "Needs improvement",
                trend: stats.avgAccuracy >= 70 ? "up" : "down",
                icon: TrendingUp,
            },
            {
                label: "Anomalies",
                value: stats.anomaliesDetected.toString(),
                change: `${stats.adminValidated} validated`,
                trend: stats.anomaliesDetected > 5 ? "down" : "up",
                icon: AlertTriangle,
            },
        ];
    }, [stats]);

    // Items for current view
    const items = dataSource === "reports" ? reports : insights;
    const itemCount = items.length;

    return (
        <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
            <div className="space-y-4 sm:space-y-6 pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Brain size={24} className="text-violet-500" />
                            AI Predictions
                            <span className="text-xs sm:text-sm font-normal text-slate-400 ml-2">
                                ({totalCount} {dataSource})
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Manage AI prediction reports and insights across all users
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 mr-2">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === "table" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <TableIcon size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <Grid3X3 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] sm:text-xs flex-1 sm:flex-none" onClick={() => setAddModalOpen(true)}>
                            <Plus size={14} className="sm:w-4 sm:h-4" /> Generate Prediction
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SummaryCardSkeleton key={i} />
                        ))}
                    </div>
                ) : stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {summaryCards.map((card, i) => (
                            <SummaryCard key={i} data={card} />
                        ))}
                    </div>
                )}

                {/* Charts & Top Users */}
                {!loading && stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Report Growth Chart */}
                        <Card className="p-4 sm:p-5 col-span-2 hover:shadow-md transition-all group cursor-pointer">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">Report Growth (6 Months)</h3>
                            <div className="flex items-end gap-2 h-32">
                                {stats.reportGrowth.map((item, i) => {
                                    const maxCount = Math.max(...stats.reportGrowth.map(g => g.count), 1);
                                    const height = (item.count / maxCount) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-700">{item.count}</span>
                                            <div
                                                className="w-full bg-violet-100 rounded-t-md transition-all hover:bg-violet-200"
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                            />
                                            <span className="text-[9px] text-slate-400 font-medium">{item.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Top Users */}
                        <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">Top Users</h3>
                            <div className="space-y-3">
                                {stats.topUsers.map((user, i) => {
                                    const mockUser: User = {
                                        id: user.user_id,
                                        email: user.email,
                                        user_metadata: { full_name: user.full_name, avatar_url: user.avatar_url },
                                        app_metadata: {},
                                        aud: "authenticated",
                                        created_at: "",
                                    } as User;

                                    return (
                                        <div key={user.user_id} className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                                            <UserAvatar user={mockUser} size="sm" className="ring-1 ring-white shadow-sm" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {user.full_name || user.email}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.report_count + user.insight_count} records</p>
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
                    </div>
                )}

                {/* Data Source Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDataSource("reports")}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${dataSource === "reports"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        <BarChart3 size={13} className="inline-block mr-1.5 -mt-0.5" />
                        Prediction Reports
                    </button>
                    <button
                        onClick={() => setDataSource("insights")}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${dataSource === "insights"
                            ? "bg-violet-50 text-violet-700 border-violet-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        <Sparkles size={13} className="inline-block mr-1.5 -mt-0.5" />
                        AI Insights
                    </button>
                </div>

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
                            {dataSource === "reports" && (
                                <FilterDropdown
                                    value={reportTypeFilter}
                                    onChange={(value) => setReportTypeFilter(value)}
                                    options={[
                                        { value: "spending", label: "Spending" },
                                        { value: "income-expense", label: "Income vs Expense" },
                                        { value: "predictions", label: "Predictions" },
                                        { value: "trends", label: "Trends" },
                                        { value: "savings", label: "Savings" },
                                    ]}
                                    placeholder="All Types"
                                    className="w-full text-xs sm:text-sm"
                                    allowEmpty={true}
                                    emptyLabel="All Types"
                                    hideSearch={true}
                                />
                            )}
                            {dataSource === "insights" && (
                                <FilterDropdown
                                    value={statusFilter}
                                    onChange={(value) => setStatusFilter(value)}
                                    options={[
                                        { value: "completed", label: "Completed" },
                                        { value: "processing", label: "Processing" },
                                        { value: "failed", label: "Failed" },
                                    ]}
                                    placeholder="All Status"
                                    className="w-full text-xs sm:text-sm"
                                    allowEmpty={true}
                                    emptyLabel="All Status"
                                    hideSearch={true}
                                />
                            )}
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
                            <FilterTableSkeleton rows={pageSize > 20 ? 20 : pageSize} columns={6} />
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
                                        <TableHead className="px-6 py-3">
                                            {dataSource === "reports" ? "Type" : "Model"}
                                        </TableHead>
                                        <TableHead className="px-6 py-3 text-center">
                                            {dataSource === "reports" ? "Data Points" : "Status"}
                                        </TableHead>
                                        <TableHead className="px-6 py-3 text-center">
                                            {dataSource === "reports" ? "Accuracy" : "Flags"}
                                        </TableHead>
                                        <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemCount === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
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
                                                onEdit={handleEditReport}
                                                onDelete={handleDeleteReport}
                                            />
                                        ))
                                    ) : (
                                        insights.map((insight) => (
                                            <InsightRow
                                                key={insight.id}
                                                insight={insight}
                                                onView={handleViewInsight}
                                                onEdit={handleEditInsight}
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
                            <PredictionCardSkeleton key={i} />
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
                                        onEdit={handleEditReport}
                                        onDelete={handleDeleteReport}
                                    />
                                ))
                            ) : (
                                insights.map((insight) => (
                                    <InsightCard
                                        key={insight.id}
                                        insight={insight}
                                        onView={handleViewInsight}
                                        onEdit={handleEditInsight}
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
                                        onEdit={handleEditReport}
                                        onDelete={handleDeleteReport}
                                    />
                                ))
                            ) : (
                                insights.map((insight) => (
                                    <InsightCard
                                        key={insight.id}
                                        insight={insight}
                                        onView={handleViewInsight}
                                        onEdit={handleEditInsight}
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
                <EditAdminPredictionModal
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    report={selectedReport}
                    insight={selectedInsight}
                    dataSource={dataSource}
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
