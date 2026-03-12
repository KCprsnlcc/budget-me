"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    Flag,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Eye,
    Trash2,
    Table as TableIcon,
    Grid3X3,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Inbox,
    MoreHorizontal,
    Plus,
    Edit,
    CheckCircle2,
    ArrowUpCircle,
    ClipboardCheck,
    ShieldCheck,
    Plane,
    Home,
    Car,
    GraduationCap,
    PiggyBank,
    ArrowRight,
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
import { ViewAdminGoalModal } from "./_components/view-admin-goal-modal";
import { DeleteAdminGoalModal } from "./_components/delete-admin-goal-modal";
import { AddAdminGoalModal } from "./_components/add-admin-goal-modal";
import { EditAdminGoalModal } from "./_components/edit-admin-goal-modal";
import { ContributeAdminGoalModal } from "./_components/contribute-admin-goal-modal";
import { useAdminGoals } from "./_lib/use-admin-goals";
import type { AdminGoal } from "./_lib/types";
import { FilterTableSkeleton, TransactionCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
import { getSafeSkeletonCount } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User } from "@supabase/supabase-js";
import {
    exportAdminGoalsToCSV,
    exportAdminGoalsToPDF,
    type GoalAdminExportData,
} from "@/lib/export-utils";

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
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number): string {
    if (isNaN(n)) return "₱0.00";
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompact(n: number): string {
    if (isNaN(n)) return "₱0";
    if (n >= 1000) return "₱" + (n / 1000).toFixed(1) + "k";
    return "₱" + n.toFixed(0);
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    emergency: ShieldCheck,
    vacation: Plane,
    house: Home,
    car: Car,
    education: GraduationCap,
    retirement: PiggyBank,
    debt: ArrowRight,
    general: Flag,
};

const SummaryCard = memo(({ item }: { item: SummaryType }) => {
    const Icon = item.icon;
    return (
        <Card className="bg-white p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="text-slate-500">
                    {Icon && <Icon size={22} strokeWidth={1.5} />}
                </div>
                {item.change && (
                    <div className={`flex items-center gap-1 text-[10px] font-medium ${item.trend === "up" ? "text-emerald-700" : "text-red-700"
                        }`}>
                        {item.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {item.change}
                    </div>
                )}
            </div>
            <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
            <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
        </Card>
    );
});

SummaryCard.displayName = "SummaryCard";

const GoalCard = memo(({
    goal,
    onView,
    onEdit,
    onDelete,
    onContribute,
}: {
    goal: AdminGoal;
    onView: (goal: AdminGoal) => void;
    onEdit: (goal: AdminGoal) => void;
    onDelete: (goal: AdminGoal) => void;
    onContribute: (goal: AdminGoal) => void;
}) => {
    const progress = goal.progress_percentage ?? 0;
    const Icon = CATEGORY_ICONS[goal.category] ?? Flag;

    return (
        <Card className="bg-white p-4 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-slate-600">
                        <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">{goal.goal_name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            {goal.user_avatar ? (
                                <img
                                    src={goal.user_avatar}
                                    alt={goal.user_name || goal.user_email || "User"}
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                                    {(goal.user_name || goal.user_email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="text-xs text-slate-500 truncate max-w-[100px]">{goal.user_email ?? "Unknown User"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[10px] font-medium ${goal.status === "completed" ? "text-emerald-600" :
                        goal.status === "cancelled" ? "text-red-600" :
                            "text-blue-600"
                        }`}>
                        {goal.status.replace("_", " ").toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-700">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                        ₱{goal.current_amount.toLocaleString()} <span className="text-slate-400 font-normal text-xs">/ ₱{goal.target_amount.toLocaleString()}</span>
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" title="Contribute" onClick={() => onContribute(goal)}>
                        <ArrowUpCircle size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(goal)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(goal)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(goal)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

GoalCard.displayName = "GoalCard";

const GoalRow = memo(({
    goal,
    onView,
    onEdit,
    onDelete,
    onContribute,
}: {
    goal: AdminGoal;
    onView: (goal: AdminGoal) => void;
    onEdit: (goal: AdminGoal) => void;
    onDelete: (goal: AdminGoal) => void;
    onContribute: (goal: AdminGoal) => void;
}) => {
    const progress = goal.progress_percentage ?? 0;
    const Icon = CATEGORY_ICONS[goal.category] ?? Flag;

    return (
        <TableRow className="group hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="text-slate-600"><Icon size={20} /></div>
                    <div>
                        <div className="font-medium text-slate-900">{goal.goal_name}</div>
                        <div className={`text-[10px] font-medium leading-none mt-1`}>
                            <span className={`${goal.priority === "high" || goal.priority === "urgent" ? "text-red-600" :
                                "text-slate-600"
                                }`}>
                                {goal.priority.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {goal.user_avatar ? (
                        <img
                            src={goal.user_avatar}
                            alt={goal.user_name || goal.user_email || "User"}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                            {(goal.user_name || goal.user_email || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-slate-500">{goal.user_email ?? "Unknown"}</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4 text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div
                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{progress}%</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4 font-medium text-slate-900">
                ₱{goal.current_amount.toLocaleString()}<br />
                <span className="text-xs text-slate-400 font-normal">of ₱{goal.target_amount.toLocaleString()}</span>
            </TableCell>
            <TableCell className="px-6 py-4">
                <span className={`text-[10px] font-medium ${goal.status === "completed" ? "text-emerald-600" :
                    goal.status === "cancelled" ? "text-red-600" :
                        "text-blue-600"
                    }`}>
                    {goal.status.replace("_", " ").toUpperCase()}
                </span>
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" title="Contribute" onClick={() => onContribute(goal)}>
                        <ArrowUpCircle size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(goal)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(goal)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(goal)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

GoalRow.displayName = "GoalRow";

export default function AdminGoalsPage() {
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [contributeModalOpen, setContributeModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<AdminGoal | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [hoveredBar, setHoveredBar] = useState<{ month: string, count: number } | null>(null);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
                setExportDropdownOpen(false);
            }
        };

        if (exportDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [exportDropdownOpen]);

    const {
        goals,
        stats,
        users,
        loading,
        tableLoading,
        error,
        search,
        setSearch,
        month, setMonth,
        year, setYear,
        categoryFilter, setCategoryFilter,
        userFilter, setUserFilter,
        statusFilter, setStatusFilter,
        priorityFilter, setPriorityFilter,
        familyFilter, setFamilyFilter,
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
    } = useAdminGoals();

    const handleView = useCallback((goal: AdminGoal) => {
        setSelectedGoal(goal);
        setViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((goal: AdminGoal) => {
        setSelectedGoal(goal);
        setEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((goal: AdminGoal) => {
        setSelectedGoal(goal);
        setDeleteModalOpen(true);
    }, []);

    const handleContribute = useCallback((goal: AdminGoal) => {
        setSelectedGoal(goal);
        setContributeModalOpen(true);
    }, []);

    const handleExportCSV = useCallback(() => {
        if (goals.length === 0) {
            alert("No goals to export");
            return;
        }

        const exportData: GoalAdminExportData[] = goals.map((g) => ({
            id: g.id,
            goal_name: g.goal_name,
            user_email: g.user_email || "Unknown",
            target_amount: g.target_amount,
            current_amount: g.current_amount,
            progress_percentage: g.progress_percentage || 0,
            priority: g.priority,
            status: g.status,
            category: g.category,
        }));

        exportAdminGoalsToCSV(exportData);
    }, [goals]);

    const handleExportPDF = useCallback(() => {
        if (goals.length === 0) {
            alert("No goals to export");
            return;
        }

        const exportData: GoalAdminExportData[] = goals.map((g) => ({
            id: g.id,
            goal_name: g.goal_name,
            user_email: g.user_email || "Unknown",
            target_amount: g.target_amount,
            current_amount: g.current_amount,
            progress_percentage: g.progress_percentage || 0,
            priority: g.priority,
            status: g.status,
            category: g.category,
        }));

        const summaryData = {
            totalGoals: stats?.totalGoals || 0,
            activeSaves: stats?.activeGoals || 0,
            totalSaved: stats?.totalSaved || 0,
            completedGoals: stats?.completedGoals || 0,
        };

        exportAdminGoalsToPDF(exportData, summaryData);
    }, [goals, stats]);

    const summaryItems: SummaryType[] = useMemo(() => {
        if (!stats) return [];

        const growthTrend: "up" | "down" = stats.monthOverMonthGrowth >= 0 ? "up" : "down";
        const growthText = `${Math.abs(stats.monthOverMonthGrowth).toFixed(1)}% MoM`;

        return [
            {
                label: "Total Goals",
                value: stats.totalGoals.toLocaleString(),
                change: growthText,
                trend: growthTrend,
                icon: Flag
            },
            {
                label: "Active Saves",
                value: stats.activeGoals.toLocaleString(),
                change: `${stats.activeUsers} users`,
                trend: "up",
                icon: TrendingUp
            },
            {
                label: "Total Saved",
                value: formatCurrency(stats.totalSaved),
                change: `${stats.averageProgress}% avg progress`,
                trend: "up",
                icon: ClipboardCheck
            },
            {
                label: "Completed Goals",
                value: stats.completedGoals.toLocaleString(),
                change: `${formatCurrency(stats.totalTargeted)} targeted`,
                trend: "up",
                icon: CheckCircle2
            },
        ];
    }, [stats]);

    const chartData = useMemo(() => {
        if (!stats?.goalGrowth.length) return [];
        const max = Math.max(...stats.goalGrowth.map((d) => d.count), 1);
        return stats.goalGrowth.map((d) => ({
            month: d.month,
            height: (d.count / max) * 100,
            count: d.count,
        }));
    }, [stats]);

    const categoryTotal = useMemo(
        () => stats?.categoryDistribution.reduce((sum, t) => sum + t.count, 0) || 0,
        [stats]
    );
    const categoryGradient = useMemo(() => {
        if (!stats?.categoryDistribution.length) return "conic-gradient(#e2e8f0 0% 100%)";
        const colors: Record<string, string> = {
            emergency: "#ef4444",
            vacation: "#3b82f6",
            house: "#10b981",
            car: "#f59e0b",
            education: "#8b5cf6",
            retirement: "#14b8a6",
            debt: "#f43f5e",
            general: "#64748b",
        };
        let acc = 0;
        const stops = stats.categoryDistribution.map((t) => {
            const start = acc;
            acc += (t.count / categoryTotal) * 100;
            const color = colors[t.category] || "#94a3b8";
            return `${color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }, [stats, categoryTotal]);

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
                        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                            <Skeleton width={80} height={32} />
                            <Skeleton width={100} height={32} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <Card className="lg:col-span-2 p-4 sm:p-6">
                                <Skeleton width={150} height={14} className="mb-2" />
                                <Skeleton width={120} height={10} className="mb-6" />
                                <Skeleton height={192} className="sm:h-60" />
                            </Card>
                            <Card className="p-4 sm:p-6">
                                <Skeleton width={120} height={14} className="mb-2" />
                                <Skeleton width={140} height={10} className="mb-4 sm:mb-6" />
                                <Skeleton width={96} height={96} borderRadius="50%" className="mx-auto mb-4 sm:mb-6 sm:w-32 sm:h-32" />
                                <div className="space-y-2 sm:space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton width={70} height={10} />
                                            <Skeleton width={35} height={10} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <Card className="p-3 sm:p-4">
                            <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                                <Skeleton width={50} height={14} />
                                <Skeleton width={180} height={32} />
                                <Skeleton width={500} height={32} className="flex-1" />
                            </div>
                        </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => <TransactionCardSkeleton key={i} />)}
                        </div>
                    </div>
                </div>
            </SkeletonTheme>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
            {}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Goals Management</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">View and manage all user savings goals across the platform.</p>
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
                        <div className="relative flex-1 sm:flex-none" ref={exportDropdownRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                            >
                                <Download size={14} className="sm:mr-1" />
                                <span className="hidden sm:inline">Export</span>
                                <MoreHorizontal size={12} className="ml-1" />
                            </Button>

                            {exportDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 z-50 animate-in fade-in zoom-in duration-200">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                                        onClick={() => {
                                            handleExportPDF();
                                            setExportDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-rose-500 mr-2 font-bold">PDF</span> Export as PDF
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                                        onClick={() => {
                                            handleExportCSV();
                                            setExportDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-emerald-500 mr-2 font-bold">CSV</span> Export as CSV
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 order-2 w-full sm:w-auto"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus size={14} className="sm" />
                        <span className="hidden sm:inline">Add Goal</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth">

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryItems.map((item) => (
                        <SummaryCard key={item.label} item={item} />
                    ))}
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {}
                    <Card className="bg-white lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Goal Creation Trend</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">6-month new goals volume.</p>
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
                                                style={{ height: `${d.height}%` }}
                                                onMouseEnter={() => setHoveredBar({ month: d.month, count: d.count })}
                                                onMouseLeave={() => setHoveredBar(null)}
                                            />
                                            {hoveredBar && hoveredBar.month === d.month && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                                                    <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                                                    <div className="flex items-center gap-1">
                                                        <span>Goals: {hoveredBar.count}</span>
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
                                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Goal Data</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                    Goal creation data will appear here.
                                </p>
                            </div>
                        )}
                    </Card>

                    {}
                    <Card className="bg-white p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Category Distribution</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Goal categories breakdown.</p>
                        </div>

                        {stats?.categoryDistribution.length ? (
                            <>
                                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                    <div
                                        className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                                        style={{ background: categoryGradient }}
                                    >
                                        <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                                            <span className="text-sm sm:text-xl font-bold text-slate-900">{categoryTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-32">
                                    {stats.categoryDistribution.map((cat) => (
                                        <div key={cat.category} className="flex items-center justify-between text-[10px] sm:text-xs">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <span className="text-slate-600 capitalize">{cat.category}</span>
                                            </div>
                                            <span className="font-medium text-slate-900">{cat.count} ({cat.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </>

                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                                    <Flag size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Category Data</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                    Category distribution will appear here.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {}
                {stats?.topSavers && stats.topSavers.length > 0 && (
                    <Card className="bg-white p-4 sm:p-6 hover:shadow-md transition-all">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Top Savers</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Users with highest total saved amounts.</p>
                        </div>

                        <div className="space-y-3">
                            {stats.topSavers.map((user, index) => {
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
                                        <div className="flex items-center gap-3">
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
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {user.full_name || user.email}
                                                </p>
                                                <p className="text-xs text-slate-500">{user.goal_count} goals</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(user.total_saved)}</p>
                                            <p className="text-xs text-slate-500">Total Saved</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {}
                <Card className="bg-white p-3 sm:p-4 hover:shadow-md transition-all group cursor-pointer flex-shrink-0">
                    <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 w-full xl:w-auto">
                            <Filter size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium">Filters</span>
                        </div>
                        <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

                        <div className="relative w-full xl:w-64 shrink-0">
                            <Search size={12} className="sm:w-[14px] sm:h-[14px] absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search goals..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:flex items-center gap-2 w-full flex-wrap">
                            <FilterDropdown
                                value={month === "all" ? "" : month.toString()}
                                onChange={(value) => setMonth(value === "" ? "all" : Number(value))}
                                options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
                                placeholder="All Months"
                                className="w-full text-slate-900 text-xs sm:text-sm xl:w-32"
                                allowEmpty={true}
                                emptyLabel="All Months"
                                hideSearch={true}
                            />
                            <FilterDropdown
                                value={year === "all" ? "" : year.toString()}
                                onChange={(value) => setYear(value === "" ? "all" : Number(value))}
                                options={Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => ({ value: y.toString(), label: y.toString() }))}
                                placeholder="All Years"
                                className="w-full text-slate-900 text-xs sm:text-sm xl:w-28"
                                allowEmpty={true}
                                emptyLabel="All Years"
                                hideSearch={true}
                            />
                            <FilterDropdown
                                value={familyFilter}
                                onChange={(value) => setFamilyFilter(value)}
                                options={[
                                    { value: "true", label: "Family Goals Only" },
                                    { value: "false", label: "Personal Goals Only" },
                                ]}
                                placeholder="All Goals"
                                className="w-full text-xs sm:text-sm xl:w-40"
                                allowEmpty={true}
                                emptyLabel="All Goals"
                                hideSearch={true}
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

                {}
                {error && !loading && (
                    <Card className="bg-white p-8 text-center shrink-0">
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                        <Button variant="outline" size="sm" onClick={refetch}>
                            <RotateCcw size={14} /> Retry
                        </Button>
                    </Card>
                )}

                {}
                {goals.length === 0 ? (
                    <Card className="bg-white p-12 text-center shrink-0">
                        <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No goals found</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {search ? "Try adjusting your search or filters." : "No goals available."}
                        </p>
                    </Card>
                ) : viewMode === 'table' ? (
                    <Card className="bg-white overflow-hidden hover:shadow-md transition-all group shrink-0">
                        {tableLoading ? (
                            <FilterTableSkeleton rows={getSafeSkeletonCount(pageSize)} columns={6} />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-6 py-3">Goal Info</TableHead>
                                            <TableHead className="px-6 py-3">User</TableHead>
                                            <TableHead className="px-6 py-3">Progress</TableHead>
                                            <TableHead className="px-6 py-3">Amount</TableHead>
                                            <TableHead className="px-6 py-3">Status</TableHead>
                                            <TableHead className="px-6 py-3 text-center w-[120px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {goals.map((goal) => (
                                            <GoalRow
                                                key={goal.id}
                                                goal={goal}
                                                onView={handleView}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onContribute={handleContribute}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Card>
                ) : tableLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
                        {Array.from({ length: getSafeSkeletonCount(pageSize) }).map((_, i) => (
                            <TransactionCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onContribute={handleContribute}
                            />
                        ))}
                    </div>
                )}

                {}
                {!loading && !tableLoading && !error && goals.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0 shrink-0">
                        <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} goals
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Button variant="outline" size="sm" onClick={previousPage} disabled={!hasPreviousPage} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                                    </Button>
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;

                                            return (
                                                <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" onClick={() => goToPage(pageNum)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-[10px] sm:text-xs">
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasNextPage} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
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

            {}
            <ViewAdminGoalModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                goal={selectedGoal}
            />
            <AddAdminGoalModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={refetch}
            />
            <EditAdminGoalModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                goal={selectedGoal}
                onSuccess={refetch}
            />
            <DeleteAdminGoalModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                goal={selectedGoal}
                onSuccess={refetch}
            />
            <ContributeAdminGoalModal
                open={contributeModalOpen}
                onClose={() => setContributeModalOpen(false)}
                goal={selectedGoal}
                onSuccess={refetch}
            />
        </div>
    );
}
