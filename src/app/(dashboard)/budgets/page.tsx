"use client";

import { useState, useCallback, useMemo, memo } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MoreHorizontal,
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Zap,
  Music,
  Heart,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  Wallet,
  PiggyBank,
  Filter,
  Search,
  RotateCcw,
  Download,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  AddBudgetModal,
  ViewBudgetModal,
  EditBudgetModal,
  DeleteBudgetModal,
} from "./_components";
import type { BudgetType } from "./_components/types";

const BUDGETS: BudgetType[] = [
  { id: "1", name: "Food & Dining", amount: 600, spent: 420, period: "monthly", category: "food", startDate: "2026-01-01", status: "on-track", icon: "utensils" },
  { id: "2", name: "Transportation", amount: 200, spent: 185, period: "monthly", category: "transportation", startDate: "2026-01-01", status: "caution", icon: "car" },
  { id: "3", name: "Entertainment", amount: 150, spent: 148, period: "monthly", category: "entertainment", startDate: "2026-01-01", status: "at-risk", icon: "music" },
  { id: "4", name: "Shopping", amount: 400, spent: 230, period: "monthly", category: "other", startDate: "2026-01-01", status: "on-track", icon: "shopping-bag" },
  { id: "5", name: "Housing", amount: 1800, spent: 1800, period: "monthly", category: "housing", startDate: "2026-01-01", status: "at-risk", icon: "home" },
  { id: "6", name: "Utilities", amount: 350, spent: 220, period: "monthly", category: "utilities", startDate: "2026-01-01", status: "on-track", icon: "zap" },
  { id: "7", name: "Healthcare", amount: 200, spent: 85, period: "monthly", category: "healthcare", startDate: "2026-01-01", status: "on-track", icon: "heart" },
  { id: "8", name: "Personal", amount: 250, spent: 120, period: "monthly", category: "other", startDate: "2026-01-01", status: "on-track", icon: "briefcase" },
];

const CATEGORY_ICONS = {
  food: Utensils,
  transportation: Car,
  entertainment: Music,
  housing: Home,
  utilities: Zap,
  healthcare: Heart,
  other: Briefcase,
};

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
  const Icon = CATEGORY_ICONS[budget.category];
  const percentage = Math.round((budget.spent / budget.amount) * 100);
  const remaining = budget.amount - budget.spent;

  return (
    <Card className="bg-white group rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg text-slate-600">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{budget.name}</h3>
            <p className="text-[10px] text-slate-500 capitalize">{budget.period} • Jan 2026</p>
          </div>
        </div>
        <Badge variant={budget.status === "on-track" ? "success" : budget.status === "caution" ? "warning" : "danger"}>
          {budget.status === "on-track" ? "On Track" : budget.status === "caution" ? "Caution" : "At Risk"}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Spent</span>
          <span className="font-medium text-slate-900">${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}</span>
        </div>
        <ProgressBar value={budget.spent} max={budget.amount} color={budget.status === "on-track" ? "success" : budget.status === "caution" ? "warning" : "danger"} />
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-400">
            {remaining >= 0 ? `Remaining: $${remaining.toLocaleString()}` : `Over by: $${Math.abs(remaining).toLocaleString()}`}
          </span>
          <span className={`font-medium ${budget.status === "on-track" ? "text-emerald-600" : budget.status === "caution" ? "text-amber-600" : "text-red-600"}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
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

export default function BudgetsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);

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

  const summary = useMemo(() => {
    const totalBudget = BUDGETS.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = BUDGETS.reduce((sum, budget) => sum + budget.spent, 0);
    const remaining = totalBudget - totalSpent;
    
    return [
      { 
        label: "Total Budget", 
        value: `$${totalBudget.toLocaleString()}`,
        icon: Wallet,
        trend: "+5%",
        color: "emerald"
      },
      { 
        label: "Total Spent", 
        value: `$${totalSpent.toLocaleString()}`,
        icon: ShoppingBag,
        trend: "+12%",
        color: "amber"
      },
      { 
        label: "Remaining", 
        value: `$${remaining.toLocaleString()}`,
        icon: PiggyBank,
        status: "Healthy",
        color: "blue"
      },
    ];
  }, []);

  const overallPercentage = useMemo(() => {
    const totalBudget = BUDGETS.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = BUDGETS.reduce((sum, budget) => sum + budget.spent, 0);
    return Math.round((totalSpent / totalBudget) * 100);
  }, []);

  const chartData = useMemo(() => [
    { month: "Aug", budget: 75, spent: 65 },
    { month: "Sep", budget: 70, spent: 55 },
    { month: "Oct", budget: 80, spent: 75 },
    { month: "Nov", budget: 85, spent: 90 },
    { month: "Dec", budget: 80, spent: 60 },
    { month: "Jan", budget: 75, spent: 45 },
  ], []);

  const categoryData = useMemo(() => [
    { name: "Housing", value: 40, color: "bg-emerald-500" },
    { name: "Food", value: 30, color: "bg-amber-500" },
    { name: "Entertainment", value: 15, color: "bg-red-500" },
    { name: "Others", value: 15, color: "bg-slate-500" },
  ], []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Budgets</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">Track your spending against your budget limits.</p>
        </div>
        <div className="flex gap-3">
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
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                {item.trend && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    item.color === "emerald" ? "text-emerald-700 border-emerald-100" : 
                    item.color === "blue" ? "text-blue-700 border-blue-100" :
                    item.color === "amber" ? "text-amber-700 border-amber-100" :
                    "text-slate-700 border-slate-100"
                  } px-2 py-1 rounded-full border`}>
                    <TrendingUp size={12} /> {item.trend}
                  </div>
                )}
                {item.status && (
                  <Badge variant="success">{item.status}</Badge>
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

            {/* Chart Visual */}
            <div className="h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
              </div>
              {chartData.map((data) => (
                <div key={data.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <div className="font-semibold mb-0.5">{data.month}</div>
                    <div>Budget: ${((data.budget * 4500) / 100).toFixed(0)}k</div>
                    <div>Spent: ${((data.spent * 4500) / 100).toFixed(0)}k</div>
                  </div>
                  <div
                    className="w-3 sm:w-5 bg-slate-200 rounded-t-[2px] transition-all duration-300 hover:bg-slate-300"
                    style={{ height: `${data.budget}%` }}
                  />
                  <div
                    className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all duration-300 hover:bg-emerald-600"
                    style={{ height: `${data.spent}%` }}
                  />
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

          {/* Budget Allocation Chart */}
          <Card className="p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
            <h3 className="text-sm font-semibold text-slate-900 mb-6">Allocation</h3>
            <div className="flex items-center gap-6 mb-6">
              {/* Donut Chart */}
              <div className="w-32 h-32 mx-auto rounded-full flex-shrink-0 relative"
                   style={{ background: 'conic-gradient(#10b981 0% 40%, #f59e0b 40% 70%, #ef4444 70% 85%, #64748b 85% 100%)' }}>
                <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Total</span>
                  <span className="text-sm font-bold text-slate-900">$4.5k</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-xs p-1 hover:bg-slate-50 rounded transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${category.color}`} />
                    <span className="text-slate-600 group-hover:text-slate-900">{category.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{category.value}%</span>
                </div>
              ))}
            </div>
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
          <Badge variant="success">Healthy</Badge>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overallPercentage}%` }} />
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col xl:flex-row items-center gap-3">
          {/* Scope Filter */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
            <Button variant="ghost" size="sm" className="flex-1 md:flex-none px-3 py-1 text-xs font-medium rounded-md bg-white text-slate-900 shadow-sm">
              All
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 md:flex-none px-3 py-1 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700">
              Personal
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 md:flex-none px-3 py-1 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700">
              Family
            </Button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden xl:block"></div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search budgets..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto flex-1">
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Categories</option>
              <option>Food & Dining</option>
              <option>Transportation</option>
              <option>Entertainment</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Statuses</option>
              <option>On Track</option>
              <option>Caution</option>
              <option>At Risk</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
            {/* Date Range Picker Mockup */}
            <div className="relative w-full">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Select dates"
                className="h-8 pl-8 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
                readOnly
                value="Jan 1 - Jan 31"
              />
            </div>
          </div>

          <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center">
            <RotateCcw size={14} />
            Reset
          </Button>
        </div>
      </Card>

      {/* Budget Cards Grid (Desktop) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUDGETS.map((budget) => (
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
        {BUDGETS.map((budget) => (
          <BudgetRow
            key={budget.id}
            budget={budget}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modals */}
      <AddBudgetModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
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
      />
      <DeleteBudgetModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        budget={selectedBudget}
      />
    </div>
  );
}
