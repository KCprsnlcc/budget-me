"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo } from "react";
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
import type { GoalType } from "./_components/types";
import { getGoalProgress, formatCurrency, formatDate } from "./_components/constants";
import { useGoals } from "./_lib/use-goals";

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
  onView,
  onEdit,
  onDelete,
  onContribute,
}: {
  goal: GoalType;
  onView: (goal: GoalType) => void;
  onEdit: (goal: GoalType) => void;
  onDelete: (goal: GoalType) => void;
  onContribute: (goal: GoalType) => void;
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
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {goal.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                goal.priority === "high" ? "text-red-600 border border-red-100" :
                goal.priority === "medium" ? "text-amber-600 border border-amber-100" :
                "text-slate-600 border border-slate-100"
              }`}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
              </span>
              {goal.isFamily && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-indigo-600 border border-indigo-100"
                      title="Family Goal">
                  <Users size={10} /> Family
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
          <span className={`font-medium ${
            goal.status === "completed" ? "text-emerald-600" :
            goal.status === "in_progress" ? "text-blue-600" :
            goal.status === "behind" ? "text-amber-600" :
            "text-amber-600"
          }`}>
            {progress}%
          </span>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {goal.status === "completed" ? "Completed Jan 2025" : `Due ${new Date(goal.deadline + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
        </span>
        {goal.status !== "completed" && (
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
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(goal); }}>
          <Edit size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(goal); }}>
          <Trash2 size={16} />
        </Button>
      </div>
    </Card>
  );
});

GoalCard.displayName = "GoalCard";

export default function GoalsPage() {
  const currentYear = new Date().getFullYear();
  const { goals, allGoals, summary, search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, categoryFilter, setCategoryFilter, month, setMonth, year, setYear, resetFilters, resetFiltersToAll, loading, error, refetch } = useGoals();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [hoveredBar, setHoveredBar] = useState<{month: string, type: 'target' | 'saved', value: number} | null>(null);

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

  const summaryData = useMemo(() => [
    { label: "Active Goals", value: (summary?.activeGoals ?? 0).toString() },
    { label: "Total Saved", value: formatCurrency(summary?.totalSaved ?? 0) },
    { label: "Monthly Contributions", value: formatCurrency(summary?.monthlyContributions ?? 0) },
    { label: "Completed", value: (summary?.completedGoals ?? 0).toString() },
  ], [summary]);

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

  // Loading state
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton width={200} height={32} className="mb-2" />
              <Skeleton width={300} height={16} />
            </div>
            <div className="flex gap-3">
              <Skeleton width={100} height={36} />
              <Skeleton width={120} height={36} />
              <Skeleton width={140} height={36} />
            </div>
          </div>

          {/* Summary Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton width={40} height={40} borderRadius={8} />
                  <Skeleton width={80} height={20} borderRadius={10} />
                </div>
                <Skeleton width={100} height={16} className="mb-2" />
                <Skeleton width={120} height={24} />
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            <Card className="col-span-2 p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={120} height={12} />
                </div>
                <div className="flex gap-3">
                  <Skeleton width={60} height={12} />
                  <Skeleton width={60} height={12} />
                </div>
              </div>
              <Skeleton height={240} />
            </Card>
            <Card className="p-6">
              <Skeleton width={100} height={16} className="mb-2" />
              <Skeleton width={140} height={12} className="mb-6" />
              <Skeleton width={128} height={128} borderRadius="50%" className="mx-auto mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton width={80} height={12} />
                    <Skeleton width={40} height={12} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Filters Skeleton */}
          <Card className="p-4">
            <div className="flex flex-col xl:flex-row items-center gap-3">
              <Skeleton width={60} height={16} />
              <Skeleton width={200} height={36} />
              <Skeleton width={500} height={36} className="flex-1" />
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
            </div>
          </Card>

          {/* Goal Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <div>
                      <Skeleton width={120} height={16} className="mb-1" />
                      <div className="flex items-center gap-2 mt-0.5">
                        <Skeleton width={60} height={16} borderRadius={8} />
                        <Skeleton width={40} height={16} borderRadius={8} />
                      </div>
                    </div>
                  </div>
                  <Skeleton width={80} height={20} borderRadius={10} />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton width={40} height={12} />
                    <Skeleton width={100} height={12} />
                  </div>
                  <Skeleton height={8} borderRadius={4} />
                  <div className="flex justify-between">
                    <Skeleton width={80} height={10} />
                    <Skeleton width={30} height={10} />
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <Skeleton width={80} height={12} />
                  <Skeleton width={60} height={24} borderRadius={4} />
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
                  <Skeleton width={32} height={32} borderRadius={4} />
                  <Skeleton width={32} height={32} borderRadius={4} />
                  <Skeleton width={32} height={32} borderRadius={4} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Financial Goals</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">Track your savings goals and milestones</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
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
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={14} className="mr-1" />
              Grid
            </Button>
          </div>
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
              <MoreHorizontal size={12} />
            </Button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 hidden group-hover:block z-50">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50">
                <span className="text-rose-500">PDF</span> Export as PDF
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50">
                <span className="text-emerald-500">CSV</span> Export as CSV
              </Button>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} /> Create Goal
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryData.slice(0, 3).map((item, index) => {
          const icons = [Flag, PiggyBank, TrendingUp];
          const Icon = icons[index];
          const colors = ["emerald", "blue", "amber"];
          const color = colors[index];
          
          return (
            <Card key={item.label} className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                {index === 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    color === "emerald" ? "text-emerald-700 border-emerald-100" : 
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
              <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {/* Progress Chart */}
        <Card className="col-span-2 p-6 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Savings Progress</h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Target vs Saved over last 6 months</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[10px] font-medium text-slate-400">Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-slate-400">Saved</span>
              </div>
            </div>
          </div>

          <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
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
                  className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                  style={{ height: `${data.target}%` }}
                  onMouseEnter={() => setHoveredBar({ month: data.month, type: 'target', value: data.targetValue })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                <div
                  className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                  style={{ height: `${data.saved}%` }}
                  onMouseEnter={() => setHoveredBar({ month: data.month, type: 'saved', value: data.savedValue })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                
                {/* Tooltip */}
                {hoveredBar && hoveredBar.month === data.month && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-xs rounded shadow-sm whitespace-nowrap z-50">
                    <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${hoveredBar.type === 'target' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                      <span className="capitalize">{hoveredBar.type}: {formatCurrency(hoveredBar.value)}</span>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
            {chartData.map((data) => (
              <span key={data.month} className={data.month === 'Jan' ? 'text-slate-600' : ''}>
                {data.month}
              </span>
            ))}
          </div>
        </Card>

        {/* Goal Health */}
        <Card className="p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Goal Health</h3>
          <p className="text-xs text-slate-500 mb-6 font-light">Track your goal completion status</p>

          <div className="flex items-center justify-center mb-6 relative">
            <div className="w-32 h-32 rounded-full relative"
                 style={{ background: goalHealthGradient }}>
              <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400">Total</span>
                <span className="text-xl font-bold text-slate-900">{allGoals.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1 px-4">
            {goalHealthData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900">{item.value} ({Math.round((item.value / (allGoals.length || 1)) * 100)}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col xl:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full xl:w-auto">
            <Filter size={16} />
            <span className="font-medium">Filters</span>
          </div>
          <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

          <div className="relative w-full xl:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search goals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
            <FilterDropdown
              value={month === "all" ? "" : month.toString()}
              onChange={(value) => setMonth(value === "" ? "all" : Number(value))}
              options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
              placeholder="All Months"
              className="w-full text-slate-900"
              allowEmpty={true}
              emptyLabel="All Months"
              hideSearch={true}
            />
            <FilterDropdown
              value={year === "all" ? "" : year.toString()}
              onChange={(value) => setYear(value === "" ? "all" : Number(value))}
              options={Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => ({ value: y.toString(), label: y.toString() }))}
              placeholder="All Years"
              className="w-full text-slate-900"
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
              className="w-full"
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
              className="w-full"
              allowEmpty={true}
              emptyLabel="All Statuses"
              hideSearch={true}
            />
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to Current Month" onClick={resetFilters}>
              <RotateCcw size={14} /> Current
            </Button>
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={resetFiltersToAll}>
              <RotateCcw size={14} /> All Time
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
      {!loading && !error && goals.length > 0 && (
        <>
          {viewMode === 'table' ? (
        <Card className="overflow-hidden">
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
                          <div className="w-16">
                            <ProgressBar 
                              value={goal.current} 
                              max={goal.target} 
                              color={progress >= 100 ? "success" : progress >= 75 ? "warning" : "danger"} 
                            />
                            <div className="text-[9px] text-slate-400 text-center mt-1">{progress}%</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Badge variant={
                            goal.status === "completed" ? "success" : 
                            goal.status === "in_progress" ? "info" : "warning"
                          } className="text-xs">
                            {goal.status === "completed" ? "Completed" : 
                             goal.status === "in_progress" ? "In Progress" : goal.status === "behind" ? "Behind" : goal.status === "overdue" ? "Overdue" : "In Progress"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`text-xs ${
                            new Date(goal.deadline) < new Date() ? "text-red-600" : "text-slate-600"
                          }`}>
                            {formatDate(goal.deadline)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => handleView(goal)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => handleEdit(goal)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => handleDelete(goal)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </>
      )}

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
