"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useRef } from "react";
import {
    Search,
    Filter,
    Users,
    UserPlus,
    Shield,
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
    Globe,
    Lock,
    Edit,
    MoreHorizontal,
    Mail,
    Home,
    Download,
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
import { ViewAdminFamilyModal } from "./_components/view-admin-family-modal";
import { DeleteAdminFamilyModal } from "./_components/delete-admin-family-modal";
import { EditAdminFamilyModal } from "./_components/edit-admin-family-modal";
import { useAdminFamilies } from "./_lib/use-admin-families";
import type { AdminFamily } from "./_lib/types";
import { FilterTableSkeleton } from "@/components/ui/skeleton-filter-loaders";
import { getSafeSkeletonCount } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User } from "@supabase/supabase-js";
import {
    exportAdminFamiliesToCSV,
    exportAdminFamiliesToPDF,
    type FamilyAdminExportData,
} from "@/lib/export-utils";
import { format } from "date-fns";
import { useEffect } from "react";

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

const SummaryCard = memo(({ item }: { item: SummaryType }) => {
    const Icon = item.icon;
    return (
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
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

const FamilyCard = memo(({
    family,
    onView,
    onEdit,
    onDelete,
}: {
    family: AdminFamily;
    onView: (f: AdminFamily) => void;
    onEdit: (f: AdminFamily) => void;
    onDelete: (f: AdminFamily) => void;
}) => {
    return (
        <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Home size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{family.family_name}</h4>
                        {family.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{family.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                            {family.creator_avatar ? (
                                <img
                                    src={family.creator_avatar}
                                    alt={family.creator_name || family.creator_email || "Creator"}
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                                    {(family.creator_name || family.creator_email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="text-xs text-slate-500 truncate">{family.creator_email ?? "Unknown"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-medium text-slate-600">
                        {family.status.charAt(0).toUpperCase() + family.status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(family.created_at)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        {family.is_public ? <Globe size={12} /> : <Lock size={12} />}
                        {family.is_public ? "Public" : "Private"}
                    </span>
                    <span className="text-xs text-slate-400">
                        {family.member_count ?? 0} / {family.max_members} members
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(family)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(family)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(family)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

FamilyCard.displayName = "FamilyCard";

const FamilyRow = memo(({
    family,
    onView,
    onEdit,
    onDelete,
}: {
    family: AdminFamily;
    onView: (f: AdminFamily) => void;
    onEdit: (f: AdminFamily) => void;
    onDelete: (f: AdminFamily) => void;
}) => {
    return (
        <TableRow className="group hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Home size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="font-medium text-slate-900 block">{family.family_name}</span>
                        {family.description && (
                            <span className="text-xs text-slate-500 block truncate max-w-xs">{family.description}</span>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {family.creator_avatar ? (
                        <img
                            src={family.creator_avatar}
                            alt={family.creator_name || family.creator_email || "Creator"}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                            {(family.creator_name || family.creator_email || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-slate-500">{family.creator_email ?? "Unknown"}</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-slate-700">
                    {family.member_count ?? 0} / {family.max_members}
                </span>
            </TableCell>
            <TableCell className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                    {family.is_public ? <Globe size={12} /> : <Lock size={12} />}
                    {family.is_public ? "Public" : "Private"}
                </span>
            </TableCell>
            <TableCell className="px-6 py-4">
                <span className="text-xs font-medium text-slate-600">
                    {family.status.charAt(0).toUpperCase() + family.status.slice(1)}
                </span>
            </TableCell>
            <TableCell className="px-6 py-4 text-slate-400">{formatDate(family.created_at)}</TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(family)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(family)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(family)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

FamilyRow.displayName = "FamilyRow";

const FamilyCardSkeleton = () => (
    <Card className="p-4">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} circle />
                <div>
                    <Skeleton width={120} height={14} className="mb-1" />
                    <Skeleton width={160} height={10} />
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Skeleton width={50} height={18} borderRadius={10} />
                <Skeleton width={80} height={10} />
            </div>
        </div>
        <div className="flex justify-between items-center">
            <Skeleton width={100} height={12} />
            <div className="flex gap-1">
                <Skeleton width={32} height={32} borderRadius={6} />
                <Skeleton width={32} height={32} borderRadius={6} />
                <Skeleton width={32} height={32} borderRadius={6} />
            </div>
        </div>
    </Card>
);

export default function AdminFamilyPage() {
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<AdminFamily | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const contentRef = useRef<HTMLDivElement>(null);
    const [hoveredBar, setHoveredBar] = useState<{ month: string, count: number } | null>(null);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef<HTMLDivElement>(null);
    const currentYear = new Date().getFullYear();

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
        families,
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
        month, setMonth,
        year, setYear,
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
    } = useAdminFamilies();

    const handleView = useCallback((f: AdminFamily) => {
        setSelectedFamily(f);
        setViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((f: AdminFamily) => {
        setSelectedFamily(f);
        setEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((f: AdminFamily) => {
        setSelectedFamily(f);
        setDeleteModalOpen(true);
    }, []);

    const handleExportCSV = useCallback(() => {
        if (families.length === 0) {
            alert("No families to export");
            return;
        }

        const exportData: FamilyAdminExportData[] = families.map((f) => ({
            id: f.id,
            family_name: f.family_name,
            owner_email: f.creator_email || "Unknown",
            member_count: f.member_count || 0,
            created_at: format(new Date(f.created_at), "MMM dd, yyyy"),
            subscription_status: f.status,
        }));

        exportAdminFamiliesToCSV(exportData);
    }, [families]);

    const handleExportPDF = useCallback(() => {
        if (families.length === 0) {
            alert("No families to export");
            return;
        }

        const exportData: FamilyAdminExportData[] = families.map((f) => ({
            id: f.id,
            family_name: f.family_name,
            owner_email: f.creator_email || "Unknown",
            member_count: f.member_count || 0,
            created_at: format(new Date(f.created_at), "MMM dd, yyyy"),
            subscription_status: f.status,
        }));

        const summaryData = {
            totalFamilies: stats?.totalFamilies || 0,
            totalMembers: stats?.totalMembers || 0,
            avgMembers: stats?.avgMembersPerFamily || 0,
            publicFamilies: stats?.publicFamilies || 0,
        };

        exportAdminFamiliesToPDF(exportData, summaryData);
    }, [families, stats]);

    const summaryItems: SummaryType[] = useMemo(() => {
        if (!stats) return [];

        const activePercent = stats.totalFamilies > 0
            ? `${Math.round((stats.activeFamilies / stats.totalFamilies) * 100)}% active`
            : "0% active";

        return [
            {
                label: "Total Families",
                value: stats.totalFamilies.toLocaleString(),
                change: activePercent,
                trend: "up" as const,
                icon: Users,
            },
            {
                label: "Total Members",
                value: stats.totalMembers.toLocaleString(),
                change: `Avg ${stats.avgMembersPerFamily.toFixed(1)}/family`,
                trend: "up" as const,
                icon: UserPlus,
            },
            {
                label: "Pending Requests",
                value: (stats.pendingInvitations + stats.pendingJoinRequests).toLocaleString(),
                change: `${stats.pendingInvitations} invitations`,
                trend: stats.pendingJoinRequests > 0 ? "up" as const : "down" as const,
                icon: Mail,
            },
            {
                label: "Visibility",
                value: `${stats.publicFamilies} Public`,
                change: `${stats.privateFamilies} private`,
                trend: "up" as const,
                icon: Shield,
            },
        ];
    }, [stats]);

    const chartData = useMemo(() => {
        if (!stats?.familyGrowth.length) return [];
        const max = Math.max(...stats.familyGrowth.map((d) => d.count), 1);
        return stats.familyGrowth.map((d) => ({
            month: d.month,
            height: (d.count / max) * 100,
            count: d.count,
        }));
    }, [stats]);

    const statusTotal = useMemo(
        () => stats?.statusDistribution.reduce((sum, t) => sum + t.count, 0) || 0,
        [stats]
    );
    const statusGradient = useMemo(() => {
        if (!stats?.statusDistribution.length) return "conic-gradient(#e2e8f0 0% 100%)";
        const colors: Record<string, string> = {
            active: "#10b981",
            inactive: "#94a3b8",
        };
        let acc = 0;
        const stops = stats.statusDistribution.map((t) => {
            const start = acc;
            acc += (t.count / statusTotal) * 100;
            const color = colors[t.status] || "#94a3b8";
            return `${color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }, [stats, statusTotal]);

    if (loading && !tableLoading) {
        return (
            <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
                    {}
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

                    {}
                    <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
                        {}
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

                        {}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <Card className="lg:col-span-2 p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-6 sm:mb-8">
                                    <div>
                                        <Skeleton width={150} height={14} className="mb-2" />
                                        <Skeleton width={120} height={10} />
                                    </div>
                                </div>
                                <Skeleton height={192} className="sm:h-60" />
                            </Card>
                            <Card className="p-4 sm:p-6">
                                <Skeleton width={120} height={14} className="mb-2" />
                                <Skeleton width={140} height={10} className="mb-4 sm:mb-6" />
                                <Skeleton width={96} height={96} borderRadius="50%" className="mx-auto mb-4 sm:mb-6 sm:w-32 sm:h-32" />
                                <div className="space-y-2 sm:space-y-3">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton width={70} height={10} />
                                            <Skeleton width={35} height={10} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {}
                        <Card className="p-4 sm:p-6">
                            <div className="mb-4 sm:mb-6">
                                <Skeleton width={200} height={14} className="mb-2" />
                                <Skeleton width={250} height={10} />
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Skeleton width={32} height={32} borderRadius="50%" />
                                            <div>
                                                <Skeleton width={120} height={14} className="mb-1" />
                                                <Skeleton width={80} height={10} />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Skeleton width={80} height={14} className="mb-1" />
                                            <Skeleton width={60} height={10} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {}
                        <Card className="p-3 sm:p-4">
                            <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                                <Skeleton width={50} height={14} />
                                <Skeleton width={180} height={32} />
                                <Skeleton width={500} height={32} className="flex-1" />
                                <Skeleton width={70} height={28} />
                            </div>
                        </Card>

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <FamilyCardSkeleton key={i} />
                            ))}
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
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Family Management</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">View and manage all family groups across the platform.</p>
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
                </div>
            </div>

            {}
            <div
                ref={contentRef}
                className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth"
            >

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryItems.map((item) => (
                        <SummaryCard key={item.label} item={item} />
                    ))}
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {}
                    <Card className="lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Family Growth</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">6-month family creation volume.</p>
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
                                                        <span>Families: {hoveredBar.count}</span>
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
                                    Family creation data will appear here.
                                </p>
                            </div>
                        )}
                    </Card>

                    {}
                    <Card className="p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Status Distribution</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Family status breakdown.</p>
                        </div>

                        {stats?.statusDistribution.length ? (
                            <>
                                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                    <div
                                        className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                                        style={{ background: statusGradient }}
                                    >
                                        <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                                            <span className="text-sm sm:text-xl font-bold text-slate-900">{statusTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 sm:space-y-3 flex-1">
                                    {stats.statusDistribution.map((type) => (
                                        <div key={type.status} className="flex items-center justify-between text-[10px] sm:text-xs">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <div
                                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: type.status === "active" ? "#10b981" : "#94a3b8",
                                                    }}
                                                />
                                                <span className="text-slate-600 capitalize">{type.status}</span>
                                            </div>
                                            <span className="font-medium text-slate-900">{type.count} ({type.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                                    <Users size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Status Data</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                    Status distribution will appear here.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {}
                {stats?.topFamilies && stats.topFamilies.length > 0 && (
                    <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Top Families by Members</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Families with the most active members.</p>
                        </div>

                        <div className="space-y-3">
                            {stats.topFamilies.map((fam, index) => {
                                const mockUser: User = {
                                    id: fam.family_id,
                                    email: fam.creator_email ?? "",
                                    user_metadata: {
                                        full_name: fam.creator_name,
                                        avatar_url: fam.creator_avatar,
                                    },
                                    app_metadata: {},
                                    created_at: "",
                                    aud: "authenticated",
                                } as User;

                                return (
                                    <div key={fam.family_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <UserAvatar
                                                    user={mockUser}
                                                    size="md"
                                                    className="ring-2 ring-white shadow-sm w-8 h-8"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {fam.family_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Created by {fam.creator_name || fam.creator_email || "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-slate-900">{fam.member_count} members</p>
                                            <p className="text-xs text-slate-500">Active Members</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {}
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
                                placeholder="Search families..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:flex items-center gap-2 w-full xl:w-auto">
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
                                value={visibilityFilter}
                                onChange={(value) => setVisibilityFilter(value)}
                                options={[
                                    { value: "public", label: "Public" },
                                    { value: "private", label: "Private" },
                                ]}
                                placeholder="All Visibility"
                                className="w-full text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Visibility"
                                hideSearch={true}
                            />
                        </div>

                        <div className="flex-1"></div>
                        <div className="flex items-center gap-2 w-full xl:w-auto">
                            <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset Filters" onClick={resetFilters}>
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
                    <Card className="p-8 text-center">
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                        <Button variant="outline" size="sm" onClick={refetch}>
                            <RotateCcw size={14} /> Retry
                        </Button>
                    </Card>
                )}

                {}
                {families.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No families found</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {search ? "Try adjusting your search or filters." : "No families available."}
                        </p>
                    </Card>
                ) : viewMode === 'table' ? (
                    <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                        {tableLoading ? (
                            <FilterTableSkeleton rows={getSafeSkeletonCount(pageSize)} columns={7} />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3">Family</TableHead>
                                        <TableHead className="px-6 py-3">Creator</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Members</TableHead>
                                        <TableHead className="px-6 py-3">Visibility</TableHead>
                                        <TableHead className="px-6 py-3">Status</TableHead>
                                        <TableHead className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">
                                            <div className="flex items-center gap-1">
                                                Created <MoreHorizontal size={12} className="rotate-90" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {families.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                                    <p className="text-sm text-slate-500">No families match your filters</p>
                                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        families.map((f) => (
                                            <FamilyRow
                                                key={f.id}
                                                family={f}
                                                onView={handleView}
                                                onEdit={handleEdit}
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
                        {Array.from({ length: getSafeSkeletonCount(pageSize) }).map((_, i) => (
                            <FamilyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        {}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {families.length === 0 ? (
                                <div className="col-span-full">
                                    <Card className="p-12 text-center">
                                        <Inbox size={32} className="text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No families match your filters</p>
                                        <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                            Clear Filters
                                        </Button>
                                    </Card>
                                </div>
                            ) : (
                                families.map((f) => (
                                    <FamilyCard
                                        key={f.id}
                                        family={f}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>

                        {}
                        <div className="md:hidden space-y-4">
                            {families.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No families match your filters</p>
                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                        Clear Filters
                                    </Button>
                                </Card>
                            ) : (
                                families.map((f) => (
                                    <FamilyCard
                                        key={f.id}
                                        family={f}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}

                {}
                {!loading && !tableLoading && !error && families.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} families
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

            {}
            <ViewAdminFamilyModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                family={selectedFamily}
            />
            <EditAdminFamilyModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                family={selectedFamily}
                onSuccess={refetch}
            />
            <DeleteAdminFamilyModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                family={selectedFamily}
                onSuccess={refetch}
            />
        </div>
    );
}
