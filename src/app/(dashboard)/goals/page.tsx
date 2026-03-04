"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Flag,
  Home,
  GraduationCap,
  Plane,
  Car,
  PiggyBank,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  RotateCcw,
  Info,
  Table,
  Grid3X3,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import {
  AddGoalModal,
  ViewGoalModal,
  EditGoalModal,
  DeleteGoalModal,
  ContributeGoalModal,
} from "./_components";
import { FilterTableSkeleton, GoalCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
import {
  exportToCSV,
  exportGoalsToPDF,
  formatExportDate,
  formatCurrencyPHP,
  getTimestampString,
  type GoalExportData,
} from "@/lib/export-utils";
import type { GoalType } from "./_components/types";
import { getGoalProgress, formatCurrency, formatDate } from "./_components/constants";
import { useGoals } from "./_lib/use-goals";
import { useFamily } from "../family/_lib/use-family";
import { useAuth } from "@/components/auth/auth-context";
import { canEditGoal as canEditGoalFn, canDeleteGoal as canDeleteGoalFn, getGoalPermissions } from "./_lib/permissions";
import { fetchGoalContributors } from "./_lib/goal-service";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GOAL_ICONS: Record<string, React.ElementType> = {
  "shield-check": Flag,
  "home-2": Home,
  "graduation-cap": GraduationCap,
  "airplane": Plane,
  "car": Car,
  "laptop": Flag,
  "target": Flag,
};

const GoalCard = memo(({
  goal,
  contributors,
  contributorsLoading,
  onView,
  onEdit,
  onDelete,
  onContribute,
  showEdit = true,
  showDelete = true,
  showContribute = true,
}: {
  goal: GoalType;
  contributors?: { user_id: string; full_name: string; avatar_url: string | null; total_contributed: number }[];
  contributorsLoading?: boolean;
  onView: (goal: GoalType) => void;
  onEdit: (goal: GoalType) => void;
  onDelete: (goal: GoalType) => void;
  onContribute: (goal: GoalType) => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showContribute?: boolean;
}) => {
  const Icon = GOAL_ICONS[goal.icon || "target"] || Flag;
  const progress = getGoalProgress(goal.current, goal.target);
  const remaining = goal.target - goal.current;

  return (
    <Card className="bg-white group rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onView(goal)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-slate-600`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 transition-colors">
              {goal.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${goal.priority === "high" ? "text-red-600 border border-red-100" :
                  goal.priority === "medium" ? "text-amber-600 border border-amber-100" :
                    "text-slate-600 border border-slate-100"
                }`}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
              </span>
              {goal.isFamily && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-indigo-600 border border-indigo-100"
                  title="Family Goal">
                  Family
                </span>
              )}
            </div>
          </div>
        </div>
        <Badge variant={goal.status === "completed" ? "success" : goal.status === "in_progress" ? "info" : "warning"}>
          {goal.status === "completed" ? "Completed" : goal.status === "in_progress" ? "In Progress" : goal.status === "behind" ? "Behind" : "Overdue"}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Saved</span>
          <span className="font-medium text-slate-900">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
        </div>
        <ProgressBar value={goal.current} max={goal.target} color={goal.status === "completed" ? "success" : goal.status === "in_progress" ? "success" : goal.status === "behind" ? "warning" : "warning"} />
        <div className="flex justify-between text-[10px]">
          <span className={goal.status === "completed" ? "text-emerald-600" : "text-slate-400"}>
            {goal.status === "completed" ? (
              <span className="flex items-center gap-1">
                <Flag size={12} /> Goal reached!
              </span>
            ) : (
              `${formatCurrency(remaining)} remaining`
            )}
          </span>
          <span className={`font-medium ${goal.status === "completed" ? "text-emerald-600" :
              goal.status === "in_progress" ? "text-blue-600" :
                goal.status === "behind" ? "text-amber-600" :
                  "text-amber-600"
            }`}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Contributor Avatars */}
      {!contributorsLoading && contributors && contributors.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            {contributors.slice(0, 3).map((contributor) => (
              <div key={contributor.user_id} className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-600 overflow-hidden">
                {contributor.avatar_url ? (
                  <img src={contributor.avatar_url} alt={contributor.full_name} className="h-full w-full object-cover" />
                ) : (
                  contributor.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                )}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-500">
            {contributors.length > 3 ? `+${contributors.length - 3} more` : `${contributors.length} contributor${contributors.length > 1 ? 's' : ''}`}
          </span>
        </div>
      )}
      
      {/* Loading placeholder for contributors */}
      {contributorsLoading && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 animate-pulse"></div>
            <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 animate-pulse"></div>
          </div>
          <span className="text-[10px] text-slate-400">Loading...</span>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {goal.status === "completed" ? "Completed Jan 2025" : `Due ${new Date(goal.deadline + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
        </span>
        {goal.status !== "completed" && showContribute && (
          <Button
            size="sm"
            className="text-xs py-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onContribute(goal);
            }}
          >
            Contribute
          </Button>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={(e) => { e.stopPropagation(); onView(goal); }}>
          <Eye size={16} />
        </Button>
        {showEdit && (
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(goal); }}>
            <Edit size={16} />
          </Button>
        )}
        {showDelete && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(goal); }}>
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </Card>
  );
});

GoalCard.displayName = "GoalCard";

export default function GoalsPage() {
  const currentYear = new Date().getFullYear();
  const { goals, allGoals, summary, search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, categoryFilter, setCategoryFilter, month, setMonth, year, setYear, resetFilters, resetFiltersToAll, loading, tableLoading, error, refetch,
    // Pagination
    currentPage,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
  } = useGoals();

  const { user } = useAuth();
  const { familyData, currentUserRole, isOwner } = useFamily();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [hoveredBar, setHoveredBar] = useState<{ month: string, type: 'target' | 'saved', value: number } | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [mobileChartTab, setMobileChartTab] = useState<'overview' | 'health'>('overview');
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // State for goal contributors (avatars to display on goal cards)
  const [goalContributors, setGoalContributors] = useState<Record<string, { user_id: string; full_name: string; avatar_url: string | null; total_contributed: number }[]>>({});
  const [contributorsLoading, setContributorsLoading] = useState(false);

  const handleView = useCallback((goal: GoalType) => {
    setSelectedGoal(goal);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((goal: GoalType) => {
    setSelectedGoal(goal);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((goal: GoalType) => {
    setSelectedGoal(goal);
    setDeleteModalOpen(true);
  }, []);

  const handleContribute = useCallback((goal: GoalType) => {
    setSelectedGoal(goal);
    setContributeModalOpen(true);
  }, []);

  const handleViewToEdit = useCallback((goal: GoalType) => {
    setViewModalOpen(false);
    setTimeout(() => {
      setSelectedGoal(goal);
      setEditModalOpen(true);
    }, 150);
  }, []);

  const handleViewToContribute = useCallback((goal: GoalType) => {
    setViewModalOpen(false);
    setTimeout(() => {
      setSelectedGoal(goal);
      setContributeModalOpen(true);
    }, 150);
  }, []);

  const handleViewToDelete = useCallback((goal: GoalType) => {
    setViewModalOpen(false);
    setTimeout(() => {
      setSelectedGoal(goal);
      setDeleteModalOpen(true);
    }, 150);
  }, []);

  const summaryData = useMemo(() => [
    { label: "Active Goals", value: (summary?.activeGoals ?? 0).toString() },
    { label: "Total Saved", value: formatCurrency(summary?.totalSaved ?? 0) },
    { label: "Monthly Contributions", value: formatCurrency(summary?.monthlyContributions ?? 0) },
    { label: "Completed", value: (summary?.completedGoals ?? 0).toString() },
  ], [summary]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    if (goals.length === 0) { alert("No goals to export"); return; }
    const exportData = goals.map((goal) => ({
      id: goal.id, name: goal.name, target: goal.target, current: goal.current,
      remaining: goal.target - goal.current,
      progress: `${Math.round((goal.current / goal.target) * 100)}%`,
      priority: goal.priority, status: goal.status, category: goal.category,
      deadline: formatExportDate(goal.deadline),
      monthlyContribution: goal.monthlyContribution ?? 0,
      isFamily: goal.isFamily,
    }));
    exportToCSV(exportData, `goals_${getTimestampString()}.csv`);
  }, [goals]);

  const handleExportPDF = useCallback(() => {
    if (goals.length === 0) { alert("No goals to export"); return; }
    const exportData = goals.map((goal) => ({
      id: goal.id, name: goal.name, target: goal.target, current: goal.current,
      remaining: goal.target - goal.current,
      progress: `${Math.round((goal.current / goal.target) * 100)}%`,
      priority: goal.priority, status: goal.status, category: goal.category,
      deadline: formatExportDate(goal.deadline),
      monthlyContribution: goal.monthlyContribution ?? 0,
      isFamily: goal.isFamily,
    }));
    const summaryForExport = {
      totalGoals: summaryData[0]?.value ? parseInt(summaryData[0].value) : goals.length,
      totalSaved: summary?.totalSaved ?? 0,
      totalTarget: allGoals.reduce((s, g) => s + g.target, 0),
      completedGoals: summary?.completedGoals ?? 0,
    };
    exportGoalsToPDF(exportData, summaryForExport);
  }, [goals, summary, summaryData, allGoals]);
  useEffect(() => {
    const fetchContributors = async () => {
      setContributorsLoading(true);
      const contributorsMap: Record<string, { user_id: string; full_name: string; avatar_url: string | null; total_contributed: number }[]> = {};
      
      for (const goal of goals) {
        if (goal.current > 0) { // Only fetch if goal has contributions
          const { data, error } = await fetchGoalContributors(goal.id, 3);
          if (error) {
            console.error(`Error fetching contributors for goal ${goal.id}:`, error);
          } else if (data && data.length > 0) {
            contributorsMap[goal.id] = data;
          }
        }
      }
      
      setGoalContributors(contributorsMap);
      setContributorsLoading(false);
    };

    if (goals.length > 0) {
      fetchContributors();
    }
  }, [goals]);

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

  const chartData = useMemo(() => {
    const totalTarget = allGoals.reduce((s, g) => s + g.target, 0);
    const totalSaved = allGoals.reduce((s, g) => s + g.current, 0);
    const savedPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const now = new Date();
    const months: { month: string; target: number; saved: number; targetValue: number; savedValue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const factor = (6 - i) / 6;
      const targetHeight = Math.round(80 * factor + 20);
      const savedHeight = Math.round(savedPct * factor);
      const targetVal = Math.round(totalTarget * (targetHeight / 100));
      const savedVal = Math.round(totalSaved * (savedHeight / 100));
      months.push({
        month: label,
        target: targetHeight,
        saved: savedHeight,
        targetValue: targetVal,
        savedValue: savedVal,
      });
    }
    return months;
  }, [allGoals]);

  const goalHealthData = useMemo(() => {
    const completed = allGoals.filter(g => g.status === "completed").length;
    const inProgress = allGoals.filter(g => g.status === "in_progress").length;
    const overdue = allGoals.filter(g => g.status === "overdue" || g.status === "behind").length;
    return [
      { name: "Completed", value: completed, color: "bg-emerald-500" },
      { name: "In Progress", value: inProgress, color: "bg-blue-500" },
      { name: "Overdue", value: overdue, color: "bg-amber-500" },
    ];
  }, [allGoals]);

  const goalHealthGradient = useMemo(() => {
    const total = allGoals.length || 1;
    const cPct = Math.round((goalHealthData[0]?.value ?? 0) / total * 100);
    const ipPct = Math.round((goalHealthData[1]?.value ?? 0) / total * 100);
    return `conic-gradient(#10b981 0% ${cPct}%, #3b82f6 ${cPct}% ${cPct + ipPct}%, #f59e0b ${cPct + ipPct}% 100%)`;
  }, [allGoals.length, goalHealthData]);

  // Loading state - only show full page skeleton on initial load, not filter changes
  if (loading && !tableLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
            <div>
              <Skeleton width={180} height={28} className="mb-2" />
              <Skeleton width={250} height={14} />
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              <Skeleton width={80} height={32} />
              <Skeleton width={100} height={32} />
              <Skeleton width={120} height={32} />
            </div>
          </div>

          {/* Scrollable Content Area for Mobile/Tablet - Skeleton */}
          <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
            {/* Summary Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
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
                    <Skeleton width={130} height={14} className="mb-2" />
                    <Skeleton width={100} height={10} />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Skeleton width={50} height={10} />
                    <Skeleton width={50} height={10} />
                  </div>
                </div>
                <Skeleton height={192} className="sm:h-60" />
              </Card>
              <Card className="p-4 sm:p-6">
                <Skeleton width={80} height={14} className="mb-2" />
                <Skeleton width={120} height={10} className="mb-4 sm:mb-6" />
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

            {/* Overall Progress Skeleton */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={250} height={12} />
                </div>
                <Skeleton width={60} height={20} borderRadius={10} />
              </div>
              <Skeleton height={10} borderRadius={5} className="sm:h-3" />
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

            {/* Goal Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton width={36} height={36} borderRadius={8} />
                      <div>
                        <Skeleton width={110} height={14} className="mb-1" />
                        <Skeleton width={70} height={10} />
                      </div>
                    </div>
                    <Skeleton width={55} height={18} borderRadius={10} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton width={35} height={10} />
                      <Skeleton width={90} height={10} />
                    </div>
                    <Skeleton height={6} borderRadius={4} className="sm:h-2" />
                    <div className="flex justify-between">
                      <Skeleton width={70} height={10} />
                      <Skeleton width={25} height={10} />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
                    <Skeleton width={28} height={28} borderRadius={4} className="sm:w-8 sm:h-8" />
                    <Skeleton width={28} height={28} borderRadius={4} className="sm:w-8 sm:h-8" />
                    <Skeleton width={28} height={28} borderRadius={4} className="sm:w-8 sm:h-8" />
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
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Financial Goals</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Track your savings goals and milestones</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex gap-2 order-1 w-full sm:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg flex-1 sm:flex-none">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setViewMode('table')}
              >
                <Table size={14} className="mr-1" />
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
                <Grid3X3 size={14} className="mr-1" />
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
              {/* Dropdown */}
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 z-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      handleExportPDF();
                      setExportDropdownOpen(false);
                    }}
                  >
                    <span className="text-rose-500 mr-2">PDF</span> Export as PDF
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
                    <span className="text-emerald-500 mr-2">CSV</span> Export as CSV
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 order-2 w-full sm:w-auto" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} className="sm:mr-1" /> <span className="hidden sm:inline">Create Goal</span><span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area for Mobile/Tablet */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth"
      >

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryData.slice(0, 3).map((item, index) => {
          const icons = [Flag, PiggyBank, TrendingUp];
          const Icon = icons[index];
          const colors = ["emerald", "blue", "amber"];
          const color = colors[index];
          const hasData = item.value !== "0" && item.value !== formatCurrency(0);

          return (
            <Card key={item.label} className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                {index === 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${color === "emerald" ? "text-emerald-700 border-emerald-100" :
                      color === "blue" ? "text-blue-700 border-blue-100" :
                        "text-amber-700 border-amber-100"
                    } px-2 py-1 rounded-full border`}>
                    <TrendingUp size={12} /> Active
                  </div>
                )}
                {index === 2 && (
                  <Badge variant="success">On Track</Badge>
                )}
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
              {hasData ? (
                <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                    {index === 0 && <Flag size={16} />}
                    {index === 1 && <PiggyBank size={16} />}
                    {index === 2 && <TrendingUp size={16} />}
                  </div>
                  <div className="text-xs text-slate-400 text-center">No data yet</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div>
        {/* Mobile Chart Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg lg:hidden mb-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 text-xs transition-colors ${
              mobileChartTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setMobileChartTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 text-xs transition-colors ${
              mobileChartTab === 'health' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setMobileChartTab('health')}
          >
            Health
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Progress Chart */}
        <Card className={`lg:col-span-2 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer ${mobileChartTab === 'health' ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Savings Progress</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Target vs Saved over last 6 months</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">Target</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">Saved</span>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="relative h-48 sm:h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                </div>
                {chartData.map((data) => (
                  <div key={data.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                    <div
                      className="w-2 sm:w-3 md:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                      style={{ height: `${data.target}%` }}
                      onMouseEnter={() => setHoveredBar({ month: data.month, type: 'target', value: data.targetValue })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <div
                      className="w-2 sm:w-3 md:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                      style={{ height: `${data.saved}%` }}
                      onMouseEnter={() => setHoveredBar({ month: data.month, type: 'saved', value: data.savedValue })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Tooltip */}
                    {hoveredBar && hoveredBar.month === data.month && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                        <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${hoveredBar.type === 'target' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                          <span className="capitalize">{hoveredBar.type}: {formatCurrency(hoveredBar.value)}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
                {chartData.map((data, i) => (
                  <span key={data.month} className={`${i === chartData.length - 1 ? 'text-slate-600' : ''} truncate`}>
                    <span className="hidden sm:inline">{data.month}</span>
                    <span className="sm:hidden">{data.month.slice(0, 3)}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 sm:h-60 text-center px-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Savings Data</h4>
              <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm mb-3 sm:mb-4">
                Create goals and track your savings over time to see your target vs saved progress.
              </p>
              <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)} className="text-xs">
                Create Goal
              </Button>
            </div>
          )}
        </Card>

        {/* Goal Health */}
        <Card className={`p-4 sm:p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer ${mobileChartTab === 'overview' ? 'hidden lg:flex' : ''}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">Goal Health</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mb-4 sm:mb-6 font-light">Track your goal completion status</p>

          {allGoals.length > 0 ? (
            <>
              <div className="flex items-center justify-center mb-4 sm:mb-6 relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full relative"
                  style={{ background: goalHealthGradient }}>
                  <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-[10px] sm:text-xs text-slate-400">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">{allGoals.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 flex-1 px-2 sm:px-4">
                {goalHealthData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[10px] sm:text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.color}`} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{item.value} ({Math.round((item.value / (allGoals.length || 1)) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                <Flag size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Goals Yet</h4>
              <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm mb-3 sm:mb-4">
                Create savings goals to track your progress and see your goal completion status.
              </p>
              <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)} className="text-xs">
                Create Goal
              </Button>
            </div>
          )}
        </Card>
        </div>
      </div>

      {/* Overall Goal Progress */}
      <Card className="p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Overall Goal Progress</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">You have saved {Math.round((summary?.totalSaved ?? 0) / (allGoals.reduce((s, g) => s + g.target, 0) || 1) * 100)}% of your total goal targets.</p>
          </div>
          <Badge variant={Math.round((summary?.totalSaved ?? 0) / (allGoals.reduce((s, g) => s + g.target, 0) || 1) * 100) >= 75 ? "success" : Math.round((summary?.totalSaved ?? 0) / (allGoals.reduce((s, g) => s + g.target, 0) || 1) * 100) >= 50 ? "warning" : "danger"}>
            {Math.round((summary?.totalSaved ?? 0) / (allGoals.reduce((s, g) => s + g.target, 0) || 1) * 100) >= 75 ? "On Track" : Math.round((summary?.totalSaved ?? 0) / (allGoals.reduce((s, g) => s + g.target, 0) || 1) * 100) >= 50 ? "Good Progress" : "Needs Attention"}
          </Badge>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 mt-2 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(Math.round((summary?.totalSaved ?? 0) / (allGoals.reduce((s, g) => s + g.target, 0) || 1) * 100), 100)}%` }} />
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
              placeholder="Search goals..."
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
              value={priorityFilter}
              onChange={(value) => setPriorityFilter(value)}
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              placeholder="All Priorities"
              className="w-full text-xs sm:text-sm"
              allowEmpty={true}
              emptyLabel="All Priorities"
              hideSearch={true}
            />
            <FilterDropdown
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "behind", label: "Behind" },
                { value: "overdue", label: "Overdue" },
              ]}
              placeholder="All Statuses"
              className="w-full text-xs sm:text-sm"
              allowEmpty={true}
              emptyLabel="All Statuses"
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
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Inbox size={48} className="text-slate-300 mb-3" />
          <h3 className="text-sm font-medium text-slate-600 mb-1">No goals found</h3>
          <p className="text-xs text-slate-400 mb-4">Create your first financial goal to get started</p>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} /> Create Goal
          </Button>
        </div>
      )}

      {/* Goals Display */}
      {viewMode === 'table' ? (
        <Card className="overflow-hidden">
          {tableLoading ? (
            <FilterTableSkeleton rows={pageSize} columns={8} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    <th className="px-6 py-4">Goal Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Target</th>
                    <th className="px-6 py-4 text-right">Current</th>
                    <th className="px-6 py-4 text-right">Progress</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Deadline</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50">
                  {goals.map((goal) => {
                      const progress = getGoalProgress(goal.current, goal.target);
                      const remaining = goal.target - goal.current;
                      const Icon = GOAL_ICONS[goal.icon || "target"] || Flag;
                      const _canEditRow = canEditGoalFn(goal, currentUserRole, isOwner, user?.id);
                      const _canDeleteRow = canDeleteGoalFn(goal, currentUserRole, isOwner, user?.id);
                      return (
                        <tr key={goal.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="text-slate-500 p-2 rounded-lg">
                                <Icon size={16} strokeWidth={1.5} />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{goal.name}</div>
                                <div className="text-[9px] text-slate-400">{goal.isFamily ? "Family" : "Personal"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="neutral" className="text-xs">
                              {goal.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            ${formatCurrency(goal.target)}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">
                            ${formatCurrency(goal.current)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <ProgressBar value={goal.current} max={goal.target} color={goal.status === "completed" ? "success" : goal.status === "in_progress" ? "success" : "warning"} className="w-16" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={goal.status === "completed" ? "success" : goal.status === "in_progress" ? "info" : "warning"}>
                              {goal.status === "completed" ? "Completed" : goal.status === "in_progress" ? "In Progress" : goal.status === "behind" ? "Behind" : "Overdue"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600">
                            {new Date(goal.deadline + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="View Details" onClick={() => handleView(goal)}>
                                <Eye size={14} />
                              </Button>
                              {_canEditRow && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => handleEdit(goal)}>
                                  <Edit size={14} />
                                </Button>
                              )}
                              {_canDeleteRow && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" title="Delete" onClick={() => handleDelete(goal)}>
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : tableLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Goal Cards Grid (Desktop) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
                const _canEdit = canEditGoalFn(goal, currentUserRole, isOwner, user?.id);
                const _canDelete = canDeleteGoalFn(goal, currentUserRole, isOwner, user?.id);
                const _perms = getGoalPermissions(currentUserRole, isOwner, goal.user_id, user?.id);
                return (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    contributors={goalContributors[goal.id]}
                    contributorsLoading={contributorsLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onContribute={handleContribute}
                    showEdit={_canEdit}
                    showDelete={_canDelete}
                    showContribute={_perms.canContribute}
                  />
                );
              })}
            </div>

          {/* Goal Cards Grid (Mobile) */}
          <div className="md:hidden space-y-4">
            {goals.map((goal) => {
              const _canEdit = canEditGoalFn(goal, currentUserRole, isOwner, user?.id);
              const _canDelete = canDeleteGoalFn(goal, currentUserRole, isOwner, user?.id);
              const _perms = getGoalPermissions(currentUserRole, isOwner, goal.user_id, user?.id);
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  contributors={goalContributors[goal.id]}
                  contributorsLoading={contributorsLoading}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onContribute={handleContribute}
                  showEdit={_canEdit}
                  showDelete={_canDelete}
                  showContribute={_perms.canContribute}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !tableLoading && !error && goals.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} goals
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
                onChange={(e) => handlePageSizeChange(e.target.value === "all" ? "all" : parseInt(e.target.value))}
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
      <AddGoalModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refetch}
      />
      <ViewGoalModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        goal={selectedGoal}
        onEdit={handleViewToEdit}
        onContribute={handleViewToContribute}
        onDelete={handleViewToDelete}
      />
      <EditGoalModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        goal={selectedGoal}
        onSuccess={refetch}
      />
      <DeleteGoalModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        goal={selectedGoal}
        onSuccess={refetch}
      />
      <ContributeGoalModal
        open={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        goal={selectedGoal}
        onSuccess={refetch}
      />
    </div>
  );
}
