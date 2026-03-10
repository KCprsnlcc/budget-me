"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { memo, useState, useCallback, useMemo } from "react";
import {
    Database,
    Activity,
    Plus,
    HardDrive,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCcw,
    ArrowUp,
    ArrowDown,
    Inbox,
    Server,
    Download,
    Shield,
    FileText,
    Search,
    Filter,
    RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { useAdminSettings } from "./_lib/use-admin-settings";
import { createBackupLog } from "./_lib/admin-settings-service";
import { useAuth } from "@/components/auth/auth-context";
import type {
    BackupLog,
    SystemActivityLog,
    SettingsTab,
} from "./_lib/types";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ───────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatRelative(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const severityColor = (severity: string) => {
    return "text-slate-600";
};

const backupStatusColor = (status: string) => {
    return "text-slate-600";
};

const backupStatusIcon = (status: string) => {
    switch (status) {
        case "completed": return <CheckCircle2 size={14} className="text-slate-500" />;
        case "in_progress": case "started": return <Loader2 size={14} className="text-slate-500 animate-spin" />;
        case "failed": return <XCircle size={14} className="text-slate-500" />;
        default: return <Clock size={14} className="text-slate-400" />;
    }
};

// ─── Summary Card Component ────────────────────────────────────────────
const SummaryCard = memo(({ label, value, icon: Icon, change, trend }: {
    label: string;
    value: string;
    icon: React.ComponentType<any>;
    change?: string;
    trend?: "up" | "down";
}) => (
    <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500"><Icon size={22} strokeWidth={1.5} /></div>
            {change && (
                <div className={`flex items-center gap-1 text-[10px] font-medium ${trend === "up" ? "text-emerald-700" : "text-red-700"
                    }`}>
                    {trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {change}
                </div>
            )}
        </div>
        <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{label}</div>
        <div className="text-xl font-semibold text-slate-900 tracking-tight">{value}</div>
    </Card>
));
SummaryCard.displayName = "SummaryCard";

// ─── Tab Button ────────────────────────────────────────────────────────
const TabButton = memo(({ tab, activeTab, setActiveTab, icon: Icon, label }: {
    tab: SettingsTab;
    activeTab: SettingsTab;
    setActiveTab: (t: SettingsTab) => void;
    icon: React.ComponentType<any>;
    label: string;
}) => (
    <button
        className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tab
            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
        onClick={() => setActiveTab(tab)}
    >
        <Icon size={14} />
        {label}
    </button>
));
TabButton.displayName = "TabButton";

// ─── Main Component ───────────────────────────────────────────────────
export default function AdminSettingsPage() {
    const { user } = useAuth();
    const {
        backupLogs,
        activityLogs,
        stats,
        loading,
        error,
        activeTab,
        setActiveTab,
        activitySeverity,
        setActivitySeverity,
        refetch,
        downloadBackup,
        downloading,
    } = useAdminSettings();

    const [backingUp, setBackingUp] = useState(false);
    const [hoveredBar, setHoveredBar] = useState<{ name: string, count: number } | null>(null);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [monthFilter, setMonthFilter] = useState<string | "all">("all");
    const [yearFilter, setYearFilter] = useState<string | "all">("all");
    const currentYear = new Date().getFullYear();

    // ─── Chart Data Preparation ──────────────────────────────────────────
    const chartData = useMemo(() => {
        if (!stats?.storageUsed) return [];
        const data = Object.entries(stats.storageUsed).map(([key, count]) => ({
            name: key.replace(/([A-Z])/g, " $1").trim(),
            count: count as number,
        }));
        const max = Math.max(...data.map((d) => d.count), 1);
        return data.map((d) => ({
            ...d,
            height: (d.count / max) * 100,
        }));
    }, [stats]);

    const typeTotal = useMemo(
        () => stats?.storageUsed ? Object.values(stats.storageUsed).reduce((sum, count) => sum + (count as number), 0) : 0,
        [stats]
    );

    const typeGradient = useMemo(() => {
        if (!stats?.storageUsed || typeTotal === 0) return "conic-gradient(#e2e8f0 0% 100%)";
        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];
        let acc = 0;
        const stops = Object.entries(stats.storageUsed).map(([_, count], i) => {
            const start = acc;
            acc += ((count as number) / typeTotal) * 100;
            const color = colors[i % colors.length];
            return `${color} ${start}% ${acc}%`;
        });
        return `conic-gradient(${stops.join(", ")})`;
    }, [stats, typeTotal]);

    // ─── Handlers ──────────────────────────────────────────────────────
    const handleBackup = useCallback(async () => {
        if (!user?.id) return;
        setBackingUp(true);
        await createBackupLog("manual", user.id);
        refetch();
        setBackingUp(false);
    }, [user, refetch]);

    const resetFilters = useCallback(() => {
        setSearchQuery("");
        const now = new Date();
        setMonthFilter((now.getMonth() + 1).toString());
        setYearFilter(now.getFullYear().toString());
    }, []);

    const resetFiltersToAll = useCallback(() => {
        setSearchQuery("");
        setMonthFilter("all");
        setYearFilter("all");
    }, []);

    // ─── Filtered Data ─────────────────────────────────────────────────
    const filteredBackupLogs = useMemo(() => {
        let filtered = backupLogs;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(backup =>
                backup.status.toLowerCase().includes(query) ||
                backup.backup_type.toLowerCase().includes(query) ||
                backup.created_by_email?.toLowerCase().includes(query) ||
                backup.checksum?.toLowerCase().includes(query)
            );
        }

        // Month and Year filter
        if (monthFilter !== "all" || yearFilter !== "all") {
            filtered = filtered.filter(backup => {
                const backupDate = new Date(backup.started_at);
                const backupMonth = (backupDate.getMonth() + 1).toString();
                const backupYear = backupDate.getFullYear().toString();

                const monthMatch = monthFilter === "all" || backupMonth === monthFilter;
                const yearMatch = yearFilter === "all" || backupYear === yearFilter;

                return monthMatch && yearMatch;
            });
        }

        return filtered;
    }, [backupLogs, searchQuery, monthFilter, yearFilter]);

    const filteredActivityLogs = useMemo(() => {
        let filtered = activityLogs;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                log.activity_type.toLowerCase().includes(query) ||
                log.activity_description.toLowerCase().includes(query) ||
                log.user_email?.toLowerCase().includes(query) ||
                log.severity.toLowerCase().includes(query)
            );
        }

        // Month and Year filter
        if (monthFilter !== "all" || yearFilter !== "all") {
            filtered = filtered.filter(log => {
                const logDate = new Date(log.created_at);
                const logMonth = (logDate.getMonth() + 1).toString();
                const logYear = logDate.getFullYear().toString();

                const monthMatch = monthFilter === "all" || logMonth === monthFilter;
                const yearMatch = yearFilter === "all" || logYear === yearFilter;

                return monthMatch && yearMatch;
            });
        }

        return filtered;
    }, [activityLogs, searchQuery, monthFilter, yearFilter]);

    // ─── Loading State ─────────────────────────────────────────────────
    if (loading) {
        return (
            <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
                        <div>
                            <Skeleton width={220} height={28} className="mb-2" />
                            <Skeleton width={300} height={14} />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton width={100} height={32} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <Skeleton width={36} height={36} borderRadius={8} />
                                        <Skeleton width={70} height={18} borderRadius={10} />
                                    </div>
                                    <Skeleton width={90} height={14} className="mb-2" />
                                    <Skeleton width={110} height={22} />
                                </Card>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton width={32} height={32} borderRadius={8} />
                                            <div>
                                                <Skeleton width={150} height={14} className="mb-1" />
                                                <Skeleton width={200} height={10} />
                                            </div>
                                        </div>
                                        <Skeleton width={60} height={28} />
                                    </div>
                                </Card>
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
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">System Management</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
                        Monitor system backups and audit activity logs.
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-600 border-slate-200"
                        onClick={downloadBackup}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <><Loader2 size={14} className="animate-spin" /> Preparing SQL...</>
                        ) : (
                            <><Download size={14} /> Download SQL</>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={handleBackup}
                        disabled={backingUp}
                    >
                        {backingUp ? (
                            <><Loader2 size={14} className="animate-spin" /> Creating...</>
                        ) : (
                            <><Database size={14} /> Create Backup</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SummaryCard
                        label="System Backups"
                        value={String(stats?.totalBackups ?? 0)}
                        icon={Database}
                        change={stats?.lastBackupAt ? formatRelative(stats.lastBackupAt) : "Never"}
                        trend="up"
                    />
                    <SummaryCard
                        label="Activity Logs"
                        value={String(stats?.totalActivityLogs ?? 0)}
                        icon={Activity}
                        change={`${stats?.recentErrors ?? 0} errors`}
                        trend={(stats?.recentErrors ?? 0) > 0 ? "down" : "up"}
                    />
                    <SummaryCard
                        label="Users & Sessions"
                        value={`${stats?.activeUsers ?? 0} / ${stats?.totalUsers ?? 0}`}
                        icon={Users}
                        change="Active"
                        trend="up"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Record Growth Chart */}
                    <Card className="lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Database Record Distribution</h3>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Comparison of record counts across tables.</p>
                            </div>
                        </div>

                        <div className="relative h-48 sm:h-60 flex items-end justify-between gap-1 sm:gap-6 px-2 border-b border-slate-50">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                            </div>
                            {chartData.map((d) => (
                                <div key={d.name} className="flex h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                                    <div
                                        className="w-4 sm:w-6 md:w-8 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                                        style={{ height: `${d.height}%` }}
                                        onMouseEnter={() => setHoveredBar({ name: d.name, count: d.count })}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    />
                                    {hoveredBar && hoveredBar.name === d.name && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                                            <div className="font-medium text-slate-700">{hoveredBar.name}</div>
                                            <div className="flex items-center gap-1">
                                                <span>Records: {hoveredBar.count}</span>
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
                            {chartData.map((d, i) => (
                                <span key={d.name} className={`${i === chartData.length - 1 ? "text-slate-600" : ""} truncate`}>
                                    <span className="hidden sm:inline">{d.name}</span>
                                    <span className="sm:hidden">{d.name.slice(0, 3)}</span>
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Donut Distribution */}
                    <Card className="p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Storage Mix</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Proportional distribution of data.</p>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <div
                                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                                style={{ background: typeGradient }}
                            >
                                <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                                    <span className="text-sm sm:text-xl font-bold text-slate-900">{typeTotal}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-40">
                            {chartData.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between text-[10px] sm:text-xs">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div
                                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                            style={{ backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"][i % 6] }}
                                        />
                                        <span className="text-slate-600 capitalize">{d.name}</span>
                                    </div>
                                    <span className="font-medium text-slate-900">{d.count} ({((d.count / (typeTotal || 1)) * 100).toFixed(1)}%)</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Database Overview */}
                <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Database Overview</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">
                                Record counts across primary system tables.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Server size={14} />
                            <span>{stats?.totalUsers ?? 0} Total Profiles</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {stats?.storageUsed && Object.entries(stats.storageUsed).map(([key, count]) => (
                            <div key={key} className="text-center p-3">
                                <p className="text-lg font-semibold text-slate-900">{count.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-500 capitalize mt-0.5">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Filter Controls */}
                <Card className="p-3 sm:p-4 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 w-full xl:w-auto">
                            <Filter size={14} className="sm:w-4 sm:h-4" />
                            <span className="font-medium text-[10px] sm:text-xs">Filters</span>
                            {(searchQuery || monthFilter !== "all" || yearFilter !== "all") && (
                                <span className="text-emerald-800 text-[10px] sm:text-xs">
                                    {activeTab === "backups" ? filteredBackupLogs.length : filteredActivityLogs.length} results
                                </span>
                            )}
                        </div>
                        <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

                        <div className="relative w-full xl:w-64">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:w-3.5 sm:h-3.5" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
                                aria-label="Search"
                                role="searchbox"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 xl:flex items-center gap-2 w-full xl:w-auto">
                            <FilterDropdown
                                value={monthFilter === "all" ? "" : monthFilter.toString()}
                                onChange={(value) => setMonthFilter(value === "" ? "all" : value)}
                                options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
                                placeholder="All Months"
                                className="w-full text-slate-900 text-xs sm:text-sm"
                                allowEmpty={true}
                                emptyLabel="All Months"
                                hideSearch={true}
                            />
                            
                            <FilterDropdown
                                value={yearFilter === "all" ? "" : yearFilter.toString()}
                                onChange={(value) => setYearFilter(value === "" ? "all" : value)}
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
                                    activeTab === 'backups' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                onClick={() => setActiveTab('backups')}
                            >
                                <Database size={14}/>
                                Backups
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                                    activeTab === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                onClick={() => setActiveTab('activity')}
                            >
                                <Activity size={14}/>
                                Activity Log
                            </Button>
                        </div>

                        <div className="flex-1 hidden xl:block"></div>
                        <div className="flex items-center gap-2 w-full xl:w-auto">
                            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center h-7 sm:h-8" title="Reset to Current Period" onClick={resetFilters}>
                                <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Current</span>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center h-7 sm:h-8" title="Reset to All Time" onClick={resetFiltersToAll}>
                                <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">All Time</span>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* ─── Backups Tab ───────────────────────────────────────────── */}
                {activeTab === "backups" && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Backup Action Information */}
                        <Card className="p-3 sm:p-4 hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <Shield size={16} className="text-emerald-500 mt-0.5 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                                <div className="text-[10px] sm:text-xs text-slate-600 leading-relaxed">
                                    Manual backups are stored within the Supabase infrastructure. Each backup inventories <span className="font-semibold">all system tables</span>, records row counts as metadata, and generates a unique checksum for verification.
                                </div>
                            </div>
                        </Card>

                        {filteredBackupLogs.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <Database className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                                    {backupLogs.length === 0 ? "No Backups Yet" : "No Matching Backups"}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                                    {backupLogs.length === 0 
                                        ? "Create your first backup to see it here."
                                        : "No backups match your search criteria."
                                    }
                                </p>
                                {backupLogs.length === 0 ? (
                                    <div className="text-[10px] sm:text-xs text-slate-400">
                                        Click the "Create Backup" button above to get started.
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2 h-8 sm:h-9">
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {filteredBackupLogs.map((backup) => (
                                    <Card
                                        key={backup.id}
                                        className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-slate-50 rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer"
                                        role="article"
                                        aria-label={`Backup: ${backup.status}`}
                                        tabIndex={0}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {backupStatusIcon(backup.status)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1 sm:mb-2">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                                                        <span className={`text-xs sm:text-sm font-medium capitalize ${backupStatusColor(backup.status)}`}>
                                                            {backup.status}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs text-slate-300">•</span>
                                                        <span className="text-[10px] sm:text-xs text-slate-500 capitalize">
                                                            {backup.backup_type}
                                                        </span>
                                                        {backup.checksum && (
                                                            <>
                                                                <span className="text-[10px] sm:text-xs text-slate-300">•</span>
                                                                <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                                                                    {backup.checksum.slice(0, 12)}...
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs text-slate-500">
                                                        {formatDate(backup.started_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 ml-1 flex-shrink-0">
                                                    <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                                                        {formatRelative(backup.started_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-xs text-slate-500">
                                                {backup.backup_size_bytes && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <HardDrive size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                            {formatBytes(backup.backup_size_bytes)}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                    </>
                                                )}
                                                {backup.tables_backed_up && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <FileText size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                            {backup.tables_backed_up.length} tables
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                    </>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Users size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                    {backup.created_by_email ?? "System"}
                                                </span>
                                                {backup.backup_duration_ms && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                            {backup.backup_duration_ms}ms
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {backup.error_message && (
                                                <div className="mt-2 sm:mt-3 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg">
                                                    <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed">{backup.error_message}</p>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex-shrink-0"
                                            onClick={downloadBackup}
                                            disabled={downloading}
                                            title="Download backup"
                                        >
                                            <Download size={12} className="sm:w-[14px] sm:h-[14px]" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Activity Log Tab ──────────────────────────────────────── */}
                {activeTab === "activity" && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Activity Items */}
                        {filteredActivityLogs.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <Activity className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                                    {activityLogs.length === 0 ? "No Activity Logs" : "No Matching Activity"}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                                    {activityLogs.length === 0
                                        ? "System activity will appear here."
                                        : "No activities match your search criteria."
                                    }
                                </p>
                                {activityLogs.length === 0 ? (
                                    <div className="text-[10px] sm:text-xs text-slate-400">
                                        Activity logs are automatically generated as users interact with the system.
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2 h-8 sm:h-9">
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {filteredActivityLogs.map((log) => (
                                    <Card
                                        key={log.id}
                                        className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-slate-50 rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer"
                                        role="article"
                                        aria-label={`Activity: ${log.activity_type}`}
                                        tabIndex={0}
                                    >
                                        <div className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 mt-0.5 ${severityColor(log.severity)}`}>
                                            {log.severity}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1 sm:mb-2">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                                                        <span className="text-xs sm:text-sm font-mono font-medium text-slate-700">
                                                            {log.activity_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed break-words">
                                                        {log.activity_description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 ml-1 flex-shrink-0">
                                                    <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                                                        {formatRelative(log.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-xs text-slate-500">
                                                {log.user_email && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Users size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                            {log.user_email}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                    </>
                                                )}
                                                {log.execution_time_ms && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                            {log.execution_time_ms}ms
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                    </>
                                                )}
                                                {log.ip_address && (
                                                    <span className="flex items-center gap-1">
                                                        <Server size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                                                        {log.ip_address}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
