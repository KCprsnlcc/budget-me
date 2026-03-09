"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    MessageSquare,
    Bot,
    User,
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
    FileText,
    MoreHorizontal,
    Plus,
    Edit,
    Cpu,
    Users,
    Paperclip,
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
import { ViewAdminChatbotModal } from "./_components/view-admin-chatbot-modal";
import { DeleteAdminChatbotModal } from "./_components/delete-admin-chatbot-modal";
import { AddAdminChatbotModal } from "./_components/add-admin-chatbot-modal";
import { EditAdminChatbotModal } from "./_components/edit-admin-chatbot-modal";
import { useAdminChatbot } from "./_lib/use-admin-chatbot";
import type { AdminChatMessage } from "./_lib/types";
import { FilterTableSkeleton, TransactionCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { format } from "date-fns";

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

function formatDateTime(dateStr: string): string {
    return format(new Date(dateStr), "MMM dd, yyyy");
}

function formatTime(dateStr: string): string {
    return format(new Date(dateStr), "h:mm a");
}

function truncateContent(content: string, maxLen: number = 80): string {
    if (!content) return "—";
    return content.length > maxLen ? content.slice(0, maxLen) + "..." : content;
}

// Memoized components for better performance
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

const MessageCard = memo(({
    msg,
    onView,
    onEdit,
    onDelete,
}: {
    msg: AdminChatMessage;
    onView: (msg: AdminChatMessage) => void;
    onEdit: (msg: AdminChatMessage) => void;
    onDelete: (msg: AdminChatMessage) => void;
}) => {
    const isAssistant = msg.role === "assistant";

    return (
        <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAssistant ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                        }`}>
                        {isAssistant ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                            {isAssistant ? "AI Assistant" : (msg.user_name || "User")}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            {msg.user_avatar ? (
                                <img
                                    src={msg.user_avatar}
                                    alt={msg.user_name || msg.user_email || "User"}
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                                    {(msg.user_name || msg.user_email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="text-xs text-slate-500">{msg.user_email ?? "Unknown User"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAssistant
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}>
                        {isAssistant ? "Assistant" : "User"}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(msg.created_at)}</span>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2 break-words">
                    {truncateContent(msg.content, 120)}
                </p>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {msg.model && (
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Cpu size={10} />
                            {msg.model}
                        </span>
                    )}
                    {msg.attachment && (
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Paperclip size={10} />
                            File
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(msg)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(msg)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(msg)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
});

MessageCard.displayName = "MessageCard";

const MessageRow = memo(({
    msg,
    onView,
    onEdit,
    onDelete,
}: {
    msg: AdminChatMessage;
    onView: (msg: AdminChatMessage) => void;
    onEdit: (msg: AdminChatMessage) => void;
    onDelete: (msg: AdminChatMessage) => void;
}) => {
    const isAssistant = msg.role === "assistant";
    return (
        <TableRow className="group hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-4 text-slate-400">{formatDateTime(msg.created_at)}</TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isAssistant ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                        }`}>
                        {isAssistant ? <Bot size={12} /> : <User size={12} />}
                    </div>
                    <span className={`text-xs font-medium ${isAssistant ? "text-emerald-600" : "text-blue-600"}`}>
                        {isAssistant ? "Assistant" : "User"}
                    </span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {msg.user_avatar ? (
                        <img
                            src={msg.user_avatar}
                            alt={msg.user_name || msg.user_email || "User"}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                            {(msg.user_name || msg.user_email || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-slate-500">{msg.user_email ?? "Unknown"}</span>
                </div>
            </TableCell>
            <TableCell className="px-6 py-4 font-medium text-slate-900 max-w-xs">
                <p className="truncate">{truncateContent(msg.content, 60)}</p>
            </TableCell>
            <TableCell className="px-6 py-4 text-slate-500">
                {msg.model ? (
                    <span className="flex items-center gap-1 text-xs">
                        <Cpu size={12} className="text-slate-400" />
                        {msg.model}
                    </span>
                ) : "—"}
            </TableCell>
            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(msg)}>
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(msg)}>
                        <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(msg)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

MessageRow.displayName = "MessageRow";

export default function AdminChatbotPage() {
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<AdminChatMessage | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [hoveredBar, setHoveredBar] = useState<{ month: string, count: number } | null>(null);

    // Close export dropdown when clicking outside
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
        messages,
        stats,
        users,
        availableModels,
        loading,
        tableLoading,
        error,
        search,
        setSearch,
        month, setMonth,
        year, setYear,
        roleFilter, setRoleFilter,
        userFilter, setUserFilter,
        modelFilter, setModelFilter,
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
    } = useAdminChatbot();

    const handleView = useCallback((msg: AdminChatMessage) => {
        setSelectedMsg(msg);
        setViewModalOpen(true);
    }, []);

    const handleEdit = useCallback((msg: AdminChatMessage) => {
        setSelectedMsg(msg);
        setEditModalOpen(true);
    }, []);

    const handleDelete = useCallback((msg: AdminChatMessage) => {
        setSelectedMsg(msg);
        setDeleteModalOpen(true);
    }, []);

    // Build summary cards from real data
    const summaryItems: SummaryType[] = useMemo(() => {
        if (!stats) return [];

        const growthTrend: "up" | "down" = stats.monthOverMonthGrowth >= 0 ? "up" : "down";
        const growthText = `${Math.abs(stats.monthOverMonthGrowth).toFixed(1)}% MoM`;

        return [
            {
                label: "Total Messages",
                value: stats.totalMessages.toLocaleString(),
                change: growthText,
                trend: growthTrend,
                icon: MessageSquare
            },
            {
                label: "Active Users",
                value: stats.activeUsers.toLocaleString(),
                change: `${stats.avgMessagesPerUser.toFixed(1)} avg/user`,
                trend: "up",
                icon: Users
            },
            {
                label: "User Messages",
                value: stats.totalUserMessages.toLocaleString(),
                change: `${stats.roleDistribution.find(r => r.role === "user")?.percentage ?? 0}% of total`,
                trend: "up",
                icon: User
            },
            {
                label: "AI Responses",
                value: stats.totalAssistantMessages.toLocaleString(),
                change: `${stats.modelDistribution.length} models used`,
                trend: "up",
                icon: Bot
            },
        ];
    }, [stats]);

    // Export handlers
    const handleExportCSV = useCallback(() => {
        if (messages.length === 0) {
            alert("No messages to export");
            return;
        }

        const headers = ['Date', 'Time', 'Role', 'User', 'Content', 'Model'];
        const rows = messages.map(msg => [
            formatDateTime(msg.created_at),
            formatTime(msg.created_at),
            msg.role,
            msg.user_email || "Unknown",
            `"${msg.content.replace(/"/g, '""')}"`,
            msg.model || "—",
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin_chatbot_messages_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [messages]);

    // Normalize chart data to percentages for bar heights
    const chartData = useMemo(() => {
        if (!stats?.messageGrowth.length) return [];
        const max = Math.max(...stats.messageGrowth.map((d) => d.count), 1);
        return stats.messageGrowth.map((d) => ({
            month: d.month,
            height: (d.count / max) * 100,
            count: d.count,
        }));
    }, [stats]);

    // Build conic-gradient for role distribution donut
    const roleTotal = useMemo(
        () => stats?.roleDistribution.reduce((sum, t) => sum + t.count, 0) || 0,
        [stats]
    );
    const roleGradient = useMemo(() => {
        if (!stats?.roleDistribution.length) return "conic-gradient(#e2e8f0 0% 100%)";
        const colors: Record<string, string> = {
            user: "#3b82f6",
            assistant: "#10b981",
        };
        let acc = 0;
        const stops = stats.roleDistribution.map((t) => {
            const start = acc;
            acc += (t.count / roleTotal) * 100;
            const color = colors[t.role] || "#94a3b8";
            return `${color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }, [stats, roleTotal]);

    const currentYear = new Date().getFullYear();

    // Loading state
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
                            <Skeleton width={100} height={32} />
                        </div>
                    </div>

                    {/* Scrollable Content Area Skeleton */}
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
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton width={70} height={10} />
                                            <Skeleton width={35} height={10} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Top Users Skeleton */}
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

                        {/* Filters Skeleton */}
                        <Card className="p-3 sm:p-4">
                            <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                                <Skeleton width={50} height={14} />
                                <Skeleton width={180} height={32} />
                                <Skeleton width={500} height={32} className="flex-1" />
                                <Skeleton width={70} height={28} />
                                <Skeleton width={70} height={28} />
                            </div>
                        </Card>

                        {/* Message Cards Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TransactionCardSkeleton key={i} />
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
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Chatbot Management</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">View and manage all chatbot messages across the platform.</p>
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
                                <Download size={14} className="sm" />
                                <span className="hidden sm:inline">Export</span>
                                <MoreHorizontal size={12} />
                            </Button>
                            {exportDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 z-50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                                        onClick={() => {
                                            handleExportCSV();
                                            setExportDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-emerald-500 mr-2">CSV</span> Export as CSV
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
                        <Plus size={14} className="sm:mr-1" />
                        <span className="hidden sm:inline">Add Message</span>
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
                    {summaryItems.map((item) => (
                        <SummaryCard key={item.label} item={item} />
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Message Growth Chart */}
                    <Card className="lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Message Growth</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">6-month message volume.</p>
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
                                                        <span>Messages: {hoveredBar.count}</span>
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
                                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Message Data</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                    Message data will appear here.
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Role Distribution */}
                    <Card className="p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Role Distribution</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Messages by role breakdown.</p>
                        </div>

                        {stats?.roleDistribution.length ? (
                            <>
                                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                                    <div
                                        className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                                        style={{ background: roleGradient }}
                                    >
                                        <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                                            <span className="text-sm sm:text-xl font-bold text-slate-900">{roleTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 sm:space-y-3 flex-1">
                                    {stats.roleDistribution.map((item) => (
                                        <div key={item.role} className="flex items-center justify-between text-[10px] sm:text-xs">
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <div
                                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            item.role === "user" ? "#3b82f6" :
                                                                item.role === "assistant" ? "#10b981" : "#94a3b8",
                                                    }}
                                                />
                                                <span className="text-slate-600 capitalize">{item.role}</span>
                                            </div>
                                            <span className="font-medium text-slate-900">{item.count} ({item.percentage}%)</span>
                                        </div>
                                    ))}
                                    {/* Model distribution */}
                                    {stats.modelDistribution.length > 0 && (
                                        <>
                                            <div className="border-t border-slate-100 pt-2 mt-2">
                                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Models Used</p>
                                                {stats.modelDistribution.map((item) => (
                                                    <div key={item.model} className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            <Cpu size={10} className="text-slate-400" />
                                                            <span className="text-slate-600">{item.model}</span>
                                                        </div>
                                                        <span className="font-medium text-slate-900">{item.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                                    <MessageSquare size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Role Data</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                                    Role distribution will appear here.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Top Users Section */}
                {stats?.topUsers && stats.topUsers.length > 0 && (
                    <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Top Users by Message Volume</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Users with highest message counts.</p>
                        </div>

                        <div className="space-y-3">
                            {stats.topUsers.map((user, index) => {
                                const mockUser: SupabaseUser = {
                                    id: user.user_id,
                                    email: user.email,
                                    user_metadata: {
                                        full_name: user.full_name,
                                        avatar_url: user.avatar_url
                                    },
                                    app_metadata: {},
                                    created_at: "",
                                    aud: "authenticated"
                                } as SupabaseUser;

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
                                                <p className="text-xs text-slate-500">{user.total_messages} messages</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-slate-900">Last active</p>
                                            <p className="text-xs text-slate-500">{formatDateTime(user.last_active)}</p>
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
                                placeholder="Search messages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 xl:flex items-center gap-2 w-full xl:w-auto">
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
                                value={roleFilter}
                                onChange={(value) => setRoleFilter(value)}
                                options={[
                                    { value: "user", label: "User" },
                                    { value: "assistant", label: "Assistant" },
                                ]}
                                placeholder="All Roles"
                                className="w-full text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Roles"
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
                            <FilterDropdown
                                value={modelFilter}
                                onChange={(value) => setModelFilter(value)}
                                options={availableModels.map((m) => ({ value: m, label: m }))}
                                placeholder="All Models"
                                className="w-full text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Models"
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

                {/* Error State */}
                {error && !loading && (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                        <Button variant="outline" size="sm" onClick={refetch}>
                            <RotateCcw size={14} /> Retry
                        </Button>
                    </Card>
                )}

                {/* Messages Display */}
                {messages.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No messages found</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {search ? "Try adjusting your search or filters." : "No chatbot messages available."}
                        </p>
                    </Card>
                ) : viewMode === 'table' ? (
                    <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                        {tableLoading ? (
                            <FilterTableSkeleton rows={pageSize} columns={6} />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">
                                            <div className="flex items-center gap-1">
                                                Date <MoreHorizontal size={12} className="rotate-90" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="px-6 py-3">Role</TableHead>
                                        <TableHead className="px-6 py-3">User</TableHead>
                                        <TableHead className="px-6 py-3">Content</TableHead>
                                        <TableHead className="px-6 py-3">Model</TableHead>
                                        <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {messages.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                                    <p className="text-sm text-slate-500">No messages match your filters</p>
                                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        messages.map((msg) => (
                                            <MessageRow
                                                key={msg.id}
                                                msg={msg}
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
                        {Array.from({ length: Math.min(Math.max(1, pageSize || 6), 50) }).map((_, i) => (
                            <TransactionCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Message Cards Grid (Desktop) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {messages.length === 0 ? (
                                <div className="col-span-full">
                                    <Card className="p-12 text-center">
                                        <Inbox size={32} className="text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">No messages match your filters</p>
                                        <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                            Clear Filters
                                        </Button>
                                    </Card>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageCard
                                        key={msg.id}
                                        msg={msg}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>

                        {/* Message Cards Grid (Mobile) */}
                        <div className="md:hidden space-y-4">
                            {messages.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <Inbox size={32} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No messages match your filters</p>
                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                                        Clear Filters
                                    </Button>
                                </Card>
                            ) : (
                                messages.map((msg) => (
                                    <MessageCard
                                        key={msg.id}
                                        msg={msg}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {!loading && !tableLoading && !error && messages.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} messages
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
            <ViewAdminChatbotModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                message={selectedMsg}
            />
            <AddAdminChatbotModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={refetch}
            />
            <EditAdminChatbotModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                message={selectedMsg}
                onSuccess={refetch}
            />
            <DeleteAdminChatbotModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                message={selectedMsg}
                onSuccess={refetch}
            />
        </div>
    );
}
