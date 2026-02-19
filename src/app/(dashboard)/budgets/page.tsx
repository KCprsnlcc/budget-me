"use client";

import { useState, useCallback, memo, useMemo } from "react";
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal,
  ShoppingBag,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  Wallet,
  PiggyBank,
  Search,
  RotateCcw,
  Download,
  Table,
  Grid3X3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Home,
  Car,
  Utensils,
  ShoppingCart as ShoppingCartIcon,
  Zap,
  Heart,
  Film,
  Package,
  BookOpen,
  Shield,
  PhilippinePeso,
  Laptop,
  TrendingUp as TrendingUpIcon,
  Building,
  Rocket,
  Gift,
  Banknote,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import {
  AddBudgetModal,
  ViewBudgetModal,
  EditBudgetModal,
  DeleteBudgetModal,
} from "./_components";
import type { BudgetType } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { deriveBudgetHealth } from "./_components/types";
import { BUDGET_PERIODS } from "./_components/constants";
import { useBudgets } from "./_lib/use-budgets";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();

const BudgetRow = memo(({
  budget,
  onView,
  onEdit,
  onDelete,
}: {
  budget: BudgetType;
  onView: (budget: BudgetType) => void;
  onEdit: (budget: BudgetType) => void;
  onDelete: (budget: BudgetType) => void;
}) => {
  const percentage = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
  const remaining = budget.amount - budget.spent;
  const health = deriveBudgetHealth(budget.spent, budget.amount);
  const periodLabel = BUDGET_PERIODS.find((p) => p.key === budget.period)?.label ?? budget.period;

  return (
    <Card className="bg-white group rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-slate-600">
            <Briefcase size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{budget.budget_name}</h3>
            <p className="text-[10px] text-slate-500 capitalize">{periodLabel} • {budget.expense_category_name ?? budget.category_name ?? "Uncategorized"}</p>
          </div>
        </div>
        <Badge variant={health === "on-track" ? "success" : health === "caution" ? "warning" : "danger"}>
          {health === "on-track" ? "On Track" : health === "caution" ? "Caution" : "At Risk"}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Spent</span>
          <span className="font-medium text-slate-900">₱{budget.spent.toLocaleString()} / ₱{budget.amount.toLocaleString()}</span>
        </div>
        <ProgressBar value={budget.spent} max={budget.amount} color={health === "on-track" ? "success" : health === "caution" ? "warning" : "danger"} />
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-400">
            {remaining >= 0 ? `Remaining: ₱${remaining.toLocaleString()}` : `Over by: ₱${Math.abs(remaining).toLocaleString()}`}
          </span>
          <span className={`font-medium ${health === "on-track" ? "text-emerald-600" : health === "caution" ? "text-amber-600" : "text-red-600"}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(budget)}>
          <Eye size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(budget)}>
          <Edit size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(budget)}>
          <Trash2 size={16} />
        </Button>
      </div>
    </Card>
  );
});

BudgetRow.displayName = "BudgetRow";

// Helper function to convert emojis to Lucide icons
function getLucideIcon(emoji: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Expense Categories
    "🏠": Home,
    "🚗": Car,
    "🍽️": Utensils,
    "🛒": ShoppingCartIcon,
    "💡": Zap,
    "⚕️": Heart,
    "🎬": Film,
    "🛍️": Package,
    "📚": BookOpen,
    "🛡️": Shield,
    
    // Income Categories
    "💰": PhilippinePeso,
    "💻": Laptop,
    "📈": TrendingUpIcon,
    "🏢": Building,
    "💼": Briefcase,
    "🚀": Rocket,
    "🎁": Gift,
    "💵": Banknote,
    
    // Default/fallback
    "📋": FileText,
  };
  
  return iconMap[emoji] || FileText;
}

export default function BudgetsPage() {
  const {
    budgets,
    summary,
    categoryAllocation,
    monthlyTrend,
    expenseCategories,
    month, setMonth,
    year, setYear,
    statusFilter, setStatusFilter,
    periodFilter, setPeriodFilter,
    categoryFilter, setCategoryFilter,
    search, setSearch,
    resetFilters,
    resetFiltersToAll,
    loading,
    error,
    refetch,
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
  } = useBudgets();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [hoveredBar, setHoveredBar] = useState<{ month: string; type: 'budget' | 'spent'; value: number } | null>(null);

  const handleView = useCallback((budget: BudgetType) => {
    setSelectedBudget(budget);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((budget: BudgetType) => {
    setSelectedBudget(budget);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((budget: BudgetType) => {
    setSelectedBudget(budget);
    setDeleteModalOpen(true);
  }, []);

  const handleViewToEdit = useCallback((budget: BudgetType) => {
    setViewModalOpen(false);
    setTimeout(() => {
      setSelectedBudget(budget);
      setEditModalOpen(true);
    }, 150);
  }, []);

  const overallPercentage = summary.totalBudget > 0
    ? Math.round((summary.totalSpent / summary.totalBudget) * 100)
    : 0;

  const overallHealth = deriveBudgetHealth(summary.totalSpent, summary.totalBudget);

  // Normalize chart data to percentages for bar heights
  const chartData = useMemo(() => {
    if (!monthlyTrend.length) return [];
    const max = Math.max(...monthlyTrend.map((d) => Math.max(d.budget, d.spent)), 1);
    return monthlyTrend.map((d) => ({
      month: d.month,
      budget: (d.budget / max) * 100,
      spent: (d.spent / max) * 100,
      budgetValue: d.budget,
      spentValue: d.spent,
    }));
  }, [monthlyTrend]);

  // Build donut gradient from real category allocation
  const donutGradient = (() => {
    if (categoryAllocation.length === 0) return "conic-gradient(#e2e8f0 0% 100%)";
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const total = categoryAllocation.reduce((s, c) => s + c.amount, 0);
    if (total === 0) return "conic-gradient(#e2e8f0 0% 100%)";
    let acc = 0;
    const stops = categoryAllocation.map((c) => {
      const start = acc;
      acc += (c.amount / total) * 100;
      return `${c.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  })();

  const summaryCards = [
    {
      label: "Total Budget",
      value: `₱${summary.totalBudget.toLocaleString()}`,
      icon: Wallet,
      badge: `${summary.budgetCount} budgets`,
      color: "emerald",
    },
    {
      label: "Total Spent",
      value: `₱${summary.totalSpent.toLocaleString()}`,
      icon: ShoppingBag,
      badge: `${overallPercentage}% used`,
      color: "amber",
    },
    {
      label: "Remaining",
      value: `₱${summary.remaining.toLocaleString()}`,
      icon: PiggyBank,
      badge: overallHealth === "on-track" ? "Healthy" : overallHealth === "caution" ? "Caution" : "At Risk",
      color: "blue",
    },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
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
              <div className="space-y-3 max-h-28 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton width={80} height={12} />
                    <Skeleton width={40} height={12} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Overall Progress Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Skeleton width={180} height={16} className="mb-2" />
                <Skeleton width={300} height={12} />
              </div>
              <Skeleton width={80} height={24} borderRadius={10} />
            </div>
            <Skeleton height={12} borderRadius={6} />
          </Card>

          {/* Filters Skeleton */}
          <Card className="p-4">
            <div className="flex flex-col xl:flex-row items-center gap-3">
              <Skeleton width={60} height={16} />
              <Skeleton width={200} height={36} />
              <Skeleton width={600} height={36} className="flex-1" />
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
            </div>
          </Card>

          {/* Budget Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <div>
                      <Skeleton width={120} height={16} className="mb-1" />
                      <Skeleton width={80} height={10} />
                    </div>
                  </div>
                  <Skeleton width={60} height={20} borderRadius={10} />
                </div>
                <div className="space-y-2">
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

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RotateCcw size={14} className="mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Budgets</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">Track your spending against your budget limits.</p>
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
            <Plus size={16} /> Create Budget
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                {item.label === "Remaining" ? (
                  <Badge variant={overallHealth === "on-track" ? "success" : overallHealth === "caution" ? "warning" : "danger"}>
                    {item.badge}
                  </Badge>
                ) : (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    item.color === "emerald" ? "text-emerald-700 border-emerald-100" : 
                    item.color === "blue" ? "text-blue-700 border-blue-100" :
                    item.color === "amber" ? "text-amber-700 border-amber-100" :
                    "text-slate-700 border-slate-100"
                  } px-2 py-1 rounded-full border`}>
                    <TrendingUp size={12} /> {item.badge}
                  </div>
                )}
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Budget vs Spent Chart */}
      <div>
        {/* Mobile Chart Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg lg:hidden mb-4">
          <Button variant="ghost" size="sm" className="flex-1 bg-white text-slate-900 shadow-sm">
            Overview
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-slate-500 hover:text-slate-700">
            Allocation
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Overview Chart */}
          <Card className="lg:col-span-2 p-6 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Budget vs Spent</h3>
                <p className="text-xs text-slate-500 mt-1 font-light">6-month comparison.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-medium text-slate-400">Budget</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-slate-400">Spent</span>
                </div>
              </div>
            </div>

            {chartData.length > 0 ? (
              <>
                <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                  </div>
                  {chartData.map((d) => (
                    <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                      <div
                        className="w-3 sm:w-5 bg-slate-200 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                        style={{ height: `${d.budget}%` }}
                        onMouseEnter={() => setHoveredBar({ month: d.month, type: 'budget', value: d.budgetValue })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      <div
                        className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                        style={{ height: `${d.spent}%` }}
                        onMouseEnter={() => setHoveredBar({ month: d.month, type: 'spent', value: d.spentValue })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      
                      {/* Tooltip */}
                      {hoveredBar && hoveredBar.month === d.month && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-xs rounded shadow-sm whitespace-nowrap z-50">
                          <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${hoveredBar.type === 'budget' ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                            <span className="capitalize">{hoveredBar.type}: ₱{hoveredBar.value.toLocaleString()}</span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                  {chartData.map((d, i) => (
                    <span key={d.month} className={i === chartData.length - 1 ? "text-slate-600" : ""}>
                      {d.month}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Budget Data</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Create budgets to track your spending against limits and see your budget vs spent trends.
                </p>
                <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
                  Create Budget
                </Button>
              </div>
            )}
          </Card>

          {/* Budget Allocation Chart */}
          <Card className="p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900">Allocation</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Budget distribution across categories</p>
            </div>
            {categoryAllocation.length > 0 ? (
              <>
                <div className="flex items-center gap-6 mb-6">
                  {/* Donut Chart */}
                  <div className="w-32 h-32 mx-auto rounded-full flex-shrink-0 relative"
                       style={{ background: donutGradient }}>
                    <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-xs text-slate-400 font-medium">Total</span>
                      <span className="text-sm font-bold text-slate-900">
                        ₱{summary.totalBudget >= 1000 ? `${(summary.totalBudget / 1000).toFixed(1)}k` : summary.totalBudget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 flex-1 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300 pr-1">
                  {categoryAllocation.map((category) => {
                    const pct = summary.totalBudget > 0 ? Math.round((category.amount / summary.totalBudget) * 100) : 0;
                    return (
                      <div key={category.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="text-slate-600">{category.name}</span>
                        </div>
                        <span className="font-medium text-slate-900">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <PiggyBank size={24} />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Budget Allocation</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Create budgets for different categories to see how your budget is distributed across spending areas.
                </p>
                <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
                  Create Budget
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Overall Budget Progress */}
      <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Overall Budget Health</h3>
            <p className="text-xs text-slate-500 mt-0.5">You have spent {overallPercentage}% of your total budget across all categories.</p>
          </div>
          <Badge variant={overallHealth === "on-track" ? "success" : overallHealth === "caution" ? "warning" : "danger"}>
            {overallHealth === "on-track" ? "Healthy" : overallHealth === "caution" ? "Caution" : "At Risk"}
          </Badge>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(overallPercentage, 100)}%` }} />
        </div>
      </Card>

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
              placeholder="Search budgets..."
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
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "completed", label: "Completed" },
                { value: "archived", label: "Archived" },
              ]}
              placeholder="Select status"
              className="w-full"
              allowEmpty={true}
              emptyLabel="All Status"
              hideSearch={true}
            />
            <FilterDropdown
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={expenseCategories.map((cat) => ({
                value: cat.id,
                label: cat.category_name,
                icon: cat.icon ? getLucideIcon(cat.icon) : undefined,
              }))}
              placeholder="All Categories"
              className="w-full"
              allowEmpty={true}
              emptyLabel="All Categories"
              hideSearch={true}
            />
            <FilterDropdown
              value={periodFilter}
              onChange={(value) => setPeriodFilter(value)}
              options={BUDGET_PERIODS.map((p) => ({
                value: p.key,
                label: p.label,
              }))}
              placeholder="All Periods"
              className="w-full"
              allowEmpty={true}
              emptyLabel="All Periods"
              hideSearch={true}
            />
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to Current" onClick={resetFilters}>
              <RotateCcw size={14} /> Current
            </Button>
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={resetFiltersToAll}>
              <RotateCcw size={14} /> All Time
            </Button>
          </div>
        </div>
      </Card>

      {/* Budgets Display */}
      {budgets.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">No budgets found</h3>
          <p className="text-xs text-slate-500 mb-4">Create your first budget to start tracking spending.</p>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} /> Create Budget
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  <th className="px-6 py-4">Budget Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Budget</th>
                  <th className="px-6 py-4 text-right">Spent</th>
                  <th className="px-6 py-4 text-right">Remaining</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Progress</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-50">
                {budgets.map((budget) => {
                  const remaining = budget.amount - budget.spent;
                  const percentage = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
                  const health = deriveBudgetHealth(budget.spent, budget.amount);
                  const periodLabel = BUDGET_PERIODS.find((p) => p.key === budget.period)?.label ?? budget.period;
                  return (
                    <tr key={budget.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-500 p-2 rounded-lg">
                            <Briefcase size={16} strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{budget.budget_name}</div>
                            <div className="text-[9px] text-slate-400">{periodLabel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral" className="text-xs">
                          {budget.expense_category_name ?? budget.category_name ?? "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        ₱{budget.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        ₱{budget.spent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={remaining >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {remaining >= 0 ? 
                            `₱${remaining.toLocaleString()}` : 
                            `-₱${Math.abs(remaining).toLocaleString()}`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Badge variant={
                            health === "on-track" ? "success" : 
                            health === "caution" ? "warning" : "danger"
                          } className="text-xs">
                            {health === "on-track" ? "On Track" : 
                             health === "caution" ? "Caution" : "At Risk"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="w-16">
                            <ProgressBar 
                              value={budget.spent} 
                              max={budget.amount} 
                              color={health === "on-track" ? "success" : health === "caution" ? "warning" : "danger"} 
                            />
                            <div className="text-[9px] text-slate-400 text-center mt-1">{percentage}%</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => handleView(budget)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => handleEdit(budget)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => handleDelete(budget)}>
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
        <>
          {/* Budget Cards Grid (Desktop) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Budget Cards Grid (Mobile) */}
          <div className="md:hidden space-y-4">
            {budgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && budgets.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} budgets
          </div>
          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={!hasPreviousPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center gap-1">
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
                        className="h-8 w-8 p-0 text-xs"
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
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize === Number.MAX_SAFE_INTEGER ? "all" : pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="text-sm border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddBudgetModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refetch}
      />
      <ViewBudgetModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        budget={selectedBudget}
        onEdit={handleViewToEdit}
      />
      <EditBudgetModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        budget={selectedBudget}
        onSuccess={refetch}
      />
      <DeleteBudgetModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        budget={selectedBudget}
        onSuccess={refetch}
      />
    </div>
  );
}
