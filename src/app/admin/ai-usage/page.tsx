"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  BarChart3,
  Brain,
  MessageSquare,
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
  Users,
  Activity,
  Zap,
  AlertCircle,
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
import { ViewAdminAIUsageModal } from "./_components/view-admin-ai-usage-modal";
import { DeleteAdminAIUsageModal } from "./_components/delete-admin-ai-usage-modal";
import { ResetAdminAIUsageModal } from "./_components/reset-admin-ai-usage-modal";
import { useAdminAIUsage } from "./_lib/use-admin-ai-usage";
import type { AdminAIUsage } from "./_lib/types";
import { FilterTableSkeleton } from "@/components/ui/skeleton-filter-loaders";
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Simple card skeleton component
const SimpleCardSkeleton = () => (
  <Card className="p-4">
    <div className="h-24 bg-slate-200 rounded animate-pulse" />
  </Card>
);

const SummaryCard = memo(({ item }: { item: SummaryType }) => {
  const Icon = item.icon;
  return (
    <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="text-slate-500">
          {Icon && <Icon size={22} strokeWidth={1.5} />}
        </div>
        {item.change && (
          <div className={`flex items-center gap-1 text-[10px] font-medium ${
            item.trend === "up" ? "text-emerald-700" : "text-red-700"
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


const AIUsageCard = memo(({
  usage,
  onView,
  onDelete,
}: {
  usage: AdminAIUsage;
  onView: (usage: AdminAIUsage) => void;
  onDelete: (usage: AdminAIUsage) => void;
}) => {
  const isAtLimit = usage.total_used >= 25;
  const isHigh = usage.total_used >= 16 && usage.total_used < 25;
  
  return (
    <Card className={`p-4 hover:shadow-md transition-all group cursor-pointer ${
      isAtLimit ? 'border-red-200 bg-red-50/30' : isHigh ? 'border-amber-200 bg-amber-50/30' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-lg">
            <BarChart3 size={20} className={isAtLimit ? 'text-red-500' : isHigh ? 'text-amber-500' : 'text-emerald-500'} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{formatDate(usage.usage_date)}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              {usage.user_avatar ? (
                <img 
                  src={usage.user_avatar} 
                  alt={usage.user_name || usage.user_email || "User"} 
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                  {(usage.user_name || usage.user_email || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-xs text-slate-500">{usage.user_email ?? "Unknown User"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-medium ${
            isAtLimit ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {usage.total_used} / 25
          </span>
          {isAtLimit && <span className="text-[10px] text-red-500 font-medium">At Limit</span>}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Brain size={12} />
            <span>{usage.predictions_used}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span>{usage.insights_used}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{usage.chatbot_used}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(usage)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(usage)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
});

AIUsageCard.displayName = "AIUsageCard";


const AIUsageRow = memo(({
  usage,
  onView,
  onDelete,
}: {
  usage: AdminAIUsage;
  onView: (usage: AdminAIUsage) => void;
  onDelete: (usage: AdminAIUsage) => void;
}) => {
  const isAtLimit = usage.total_used >= 25;
  const isHigh = usage.total_used >= 16 && usage.total_used < 25;
  
  return (
    <TableRow className="group hover:bg-slate-50/80 transition-colors">
      <TableCell className="px-6 py-4 text-slate-400">{formatDate(usage.usage_date)}</TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex items-center gap-2">
          {usage.user_avatar ? (
            <img 
              src={usage.user_avatar} 
              alt={usage.user_name || usage.user_email || "User"} 
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
              {(usage.user_name || usage.user_email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-slate-500">{usage.user_email ?? "Unknown"}</span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        <span className="text-slate-900 font-medium">{usage.predictions_used}</span>
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        <span className="text-slate-900 font-medium">{usage.insights_used}</span>
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        <span className="text-slate-900 font-medium">{usage.chatbot_used}</span>
      </TableCell>
      <TableCell className="px-6 py-4 text-right">
        <span className={`font-medium ${
          isAtLimit ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-emerald-600'
        }`}>
          {usage.total_used} / 25
        </span>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(usage)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(usage)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

AIUsageRow.displayName = "AIUsageRow";


export default function AdminAIUsagePage() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState<AdminAIUsage | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{date: string, count: number} | null>(null);
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");

  const currentYear = new Date().getFullYear();

  const {
    usageRecords,
    stats,
    users,
    loading,
    tableLoading,
    error,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    userFilter,
    setUserFilter,
    usageRangeFilter,
    setUsageRangeFilter,
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
  } = useAdminAIUsage();

  // Update date filters when month/year changes
  useEffect(() => {
    if (month === "all" && year === "all") {
      setStartDate("");
      setEndDate("");
    } else if (month !== "all" && year !== "all") {
      const startOfMonth = new Date(year as number, (month as number) - 1, 1);
      const endOfMonth = new Date(year as number, month as number, 0);
      setStartDate(startOfMonth.toISOString().split("T")[0]);
      setEndDate(endOfMonth.toISOString().split("T")[0]);
    } else if (year !== "all") {
      const startOfYear = new Date(year as number, 0, 1);
      const endOfYear = new Date(year as number, 11, 31);
      setStartDate(startOfYear.toISOString().split("T")[0]);
      setEndDate(endOfYear.toISOString().split("T")[0]);
    } else if (month !== "all") {
      const currentYr = new Date().getFullYear();
      const startOfMonth = new Date(currentYr, (month as number) - 1, 1);
      const endOfMonth = new Date(currentYr, month as number, 0);
      setStartDate(startOfMonth.toISOString().split("T")[0]);
      setEndDate(endOfMonth.toISOString().split("T")[0]);
    }
  }, [month, year, setStartDate, setEndDate]);

  const handleView = useCallback((usage: AdminAIUsage) => {
    setSelectedUsage(usage);
    setViewModalOpen(true);
  }, []);

  const handleDelete = useCallback((usage: AdminAIUsage) => {
    setSelectedUsage(usage);
    setDeleteModalOpen(true);
  }, []);

  const handleReset = useCallback((usage: AdminAIUsage) => {
    setSelectedUsage(usage);
    setResetModalOpen(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setUsageRangeFilter("all");
    setSearch("");
    resetFilters();
  }, [resetFilters]);

  const handleResetFiltersToAll = useCallback(() => {
    setMonth("all");
    setYear("all");
    setUsageRangeFilter("all");
    setSearch("");
    resetFiltersToAll();
  }, [resetFiltersToAll]);


  // Build summary cards from real data
  const summaryItems: SummaryType[] = useMemo(() => {
    if (!stats) return [];
    
    const growthTrend: "up" | "down" = stats.dailyGrowth >= 0 ? "up" : "down";
    const growthText = `${Math.abs(stats.dailyGrowth).toFixed(1)}% Daily`;
    
    return [
      { 
        label: "Total AI Usage", 
        value: stats.totalUsage.toLocaleString(), 
        change: growthText, 
        trend: growthTrend, 
        icon: BarChart3 
      },
      { 
        label: "Active Users", 
        value: stats.activeUsersToday.toLocaleString(), 
        change: `${stats.usersAtLimit} at limit`, 
        trend: stats.usersAtLimit > 0 ? "down" : "up", 
        icon: Users 
      },
      { 
        label: "Avg Usage/User", 
        value: stats.avgUsagePerUser.toFixed(1), 
        change: `${stats.totalUsers} total users`, 
        trend: "up", 
        icon: Activity 
      },
      { 
        label: "Top Feature", 
        value: stats.topFeature.name.charAt(0).toUpperCase() + stats.topFeature.name.slice(1), 
        change: `${stats.topFeature.count} uses`, 
        trend: "up", 
        icon: Zap 
      },
    ];
  }, [stats]);

  // Normalize chart data to percentages for bar heights
  const chartData = useMemo(() => {
    if (!stats?.usageGrowth.length) return [];
    const max = Math.max(...stats.usageGrowth.map((d) => d.count), 1);
    return stats.usageGrowth.map((d) => ({
      date: d.date,
      height: (d.count / max) * 100,
      count: d.count,
    }));
  }, [stats]);

  // Build conic-gradient for feature distribution donut
  const featureTotal = useMemo(
    () => stats?.featureDistribution.reduce((sum, f) => sum + f.count, 0) || 0,
    [stats]
  );
  
  const featureGradient = useMemo(() => {
    if (!stats?.featureDistribution.length) return "conic-gradient(#e2e8f0 0% 100%)";
    const colors: Record<string, string> = {
      predictions: "#3b82f6", // blue-500
      insights: "#10b981",    // emerald-500
      chatbot: "#a855f7",     // purple-500
    };
    let acc = 0;
    const stops = stats.featureDistribution.map((f) => {
      const start = acc;
      acc += (f.count / featureTotal) * 100;
      const color = colors[f.feature] || "#94a3b8";
      return `${color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [stats, featureTotal]);


  // Loading state - only show full page skeleton on initial load, not filter changes
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

          {/* Scrollable Content Area for Mobile/Tablet - Skeleton */}
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

            {/* Usage Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SimpleCardSkeleton key={i} />
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
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">AI Usage Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Monitor and manage AI feature usage across the platform.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex bg-slate-100 p-1 rounded-lg flex-1 sm:flex-none">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={14} />
              Table
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={14} />
              Grid
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area for Mobile/Tablet */}
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
        {/* Usage Growth Chart */}
        <Card className="lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">AI Usage Growth</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">7-day usage trend.</p>
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
                    <div key={d.date} className="flex h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                      <div
                        className="w-4 sm:w-6 md:w-8 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                        style={{ height: `${d.height}%` }}
                        onMouseEnter={() => setHoveredBar({ date: d.date, count: d.count })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      {hoveredBar && hoveredBar.date === d.date && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                          <div className="font-medium text-slate-700">{hoveredBar.date}</div>
                          <div className="flex items-center gap-1">
                            <span>Usage: {hoveredBar.count}</span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
                  {chartData.map((d, i) => (
                    <span key={d.date} className={`${i === chartData.length - 1 ? "text-slate-600" : ""} truncate`}>
                      {d.date}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 sm:h-60 text-center px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Usage Data</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                  Usage data will appear here.
                </p>
              </div>
            )}
        </Card>


        {/* Feature Distribution */}
        <Card className="p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Feature Distribution</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">AI features breakdown.</p>
          </div>

          {stats?.featureDistribution.length ? (
              <>
                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                    style={{ background: featureGradient }}
                  >
                    <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                      <span className="text-sm sm:text-xl font-bold text-slate-900">{featureTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 flex-1">
                  {stats.featureDistribution.map((feature) => (
                    <div key={feature.feature} className="flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                          style={{
                            backgroundColor:
                              feature.feature === "predictions" ? "#3b82f6" :
                              feature.feature === "insights" ? "#10b981" : "#a855f7",
                          }}
                        />
                        <span className="text-slate-600 capitalize">{feature.feature}</span>
                      </div>
                      <span className="font-medium text-slate-900">{feature.count} ({feature.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                  <BarChart3 size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Feature Data</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                  Feature distribution will appear here.
                </p>
              </div>
            )}
        </Card>
      </div>


      {/* Top Users Section */}
      {stats?.topUsers && stats.topUsers.length > 0 && (
        <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Top Users by AI Usage</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Users with highest AI feature usage.</p>
          </div>
          
          <div className="space-y-3">
            {stats.topUsers.map((user, index) => {
              // Create mock user for UserAvatar component
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
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Brain size={10} />{user.predictions_used}</span>
                        <span className="flex items-center gap-1"><TrendingUp size={10} />{user.insights_used}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={10} />{user.chatbot_used}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{user.total_usage}</p>
                    <p className="text-xs text-slate-500">Total Uses</p>
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
              placeholder="Search usage records..."
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
              value={usageRangeFilter}
              onChange={(value) => setUsageRangeFilter(value as any)}
              options={[
                { value: "all", label: "All Usage" },
                { value: "low", label: "Low (0-5)" },
                { value: "medium", label: "Medium (6-15)" },
                { value: "high", label: "High (16-24)" },
                { value: "limit", label: "At Limit (25)" },
              ]}
              placeholder="All Usage"
              className="w-full text-slate-900 text-xs sm:text-sm"
              allowEmpty={false}
              hideSearch={true}
            />
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset to Current Month" onClick={handleResetFilters}>
              <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> Current
            </Button>
            <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={handleResetFiltersToAll}>
              <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> All Time
            </Button>
          </div>
        </div>
      </Card>


      {/* Error State */}
      {error && !loading && (
        <Card className="p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-red-300 mb-4" />
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      {/* Usage Records Display */}
      {usageRecords.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No usage records found</h3>
          <p className="text-xs text-slate-400 mb-4">
            {search ? "Try adjusting your search or filters." : "No usage records available."}
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
                  <TableHead className="px-6 py-3">Date</TableHead>
                  <TableHead className="px-6 py-3">User</TableHead>
                  <TableHead className="px-6 py-3 text-center">Predictions</TableHead>
                  <TableHead className="px-6 py-3 text-center">Insights</TableHead>
                  <TableHead className="px-6 py-3 text-center">Chatbot</TableHead>
                  <TableHead className="px-6 py-3 text-right">Total Usage</TableHead>
                  <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={32} className="text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">No usage records match your filters</p>
                        <Button size="sm" variant="outline" onClick={handleResetFiltersToAll} className="mt-2">
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  usageRecords.map((usage) => (
                    <AIUsageRow
                      key={usage.id}
                      usage={usage}
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
          {Array.from({ length: getSafeSkeletonCount(pageSize) }).map((_, i) => (
            <SimpleCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Usage Cards Grid (Desktop) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usageRecords.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <Inbox size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No usage records match your filters</p>
                  <Button size="sm" variant="outline" onClick={handleResetFiltersToAll} className="mt-2">
                    Clear Filters
                  </Button>
                </Card>
              </div>
            ) : (
              usageRecords.map((usage) => (
                <AIUsageCard
                  key={usage.id}
                  usage={usage}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* Usage Cards Grid (Mobile) */}
          <div className="md:hidden space-y-4">
            {usageRecords.length === 0 ? (
              <Card className="p-12 text-center">
                <Inbox size={32} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No usage records match your filters</p>
                <Button size="sm" variant="outline" onClick={handleResetFiltersToAll} className="mt-2">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              usageRecords.map((usage) => (
                <AIUsageCard
                  key={usage.id}
                  usage={usage}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
      )}


      {/* Pagination */}
      {!loading && !tableLoading && !error && usageRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
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
      <ViewAdminAIUsageModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        usage={selectedUsage}
      />
      <DeleteAdminAIUsageModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        usage={selectedUsage}
        onSuccess={refetch}
      />
      <ResetAdminAIUsageModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        usage={selectedUsage}
        onSuccess={refetch}
      />
    </div>
  );
}
