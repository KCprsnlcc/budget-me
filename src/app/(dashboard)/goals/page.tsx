"use client";

import { memo, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Target,
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  AddGoalModal,
  ViewGoalModal,
  EditGoalModal,
  DeleteGoalModal,
  ContributeGoalModal,
} from "./_components";
import type { GoalType } from "./_components/types";
import { getGoalProgress, formatCurrency } from "./_components/constants";

const GOALS: GoalType[] = [
  {
    id: "1",
    name: "Emergency Fund",
    target: 15000,
    current: 15000,
    priority: "high",
    status: "completed",
    category: "emergency",
    deadline: "2025-01-15",
    monthlyContribution: 500,
    isFamily: false,
    icon: "shield-check",
  },
  {
    id: "2",
    name: "House Down Payment",
    target: 60000,
    current: 32000,
    priority: "high",
    status: "in_progress",
    category: "housing",
    deadline: "2027-12-31",
    monthlyContribution: 1200,
    isFamily: true,
    icon: "home-2",
  },
  {
    id: "3",
    name: "Education Fund",
    target: 25000,
    current: 8500,
    priority: "medium",
    status: "in_progress",
    category: "education",
    deadline: "2028-09-01",
    monthlyContribution: 400,
    isFamily: false,
    icon: "graduation-cap",
  },
  {
    id: "4",
    name: "Dream Vacation",
    target: 5000,
    current: 2800,
    priority: "medium",
    status: "behind",
    category: "travel",
    deadline: "2026-06-01",
    monthlyContribution: 300,
    isFamily: false,
    icon: "airplane",
  },
  {
    id: "5",
    name: "New Car",
    target: 35000,
    current: 5200,
    priority: "medium",
    status: "in_progress",
    category: "transport",
    deadline: "2028-03-31",
    monthlyContribution: 800,
    isFamily: false,
    icon: "car",
  },
];

const SUMMARY = [
  { label: "Active Goals", value: "4" },
  { label: "Total Saved", value: "$63,500" },
  { label: "Monthly Contributions", value: "$3,200" },
  { label: "Completed", value: "1" },
];

const GOAL_ICONS: Record<string, React.ElementType> = {
  "shield-check": Target,
  "home-2": Home,
  "graduation-cap": GraduationCap,
  "airplane": Plane,
  "car": Car,
  "laptop": Target,
  "target": Target,
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
  const Icon = GOAL_ICONS[goal.icon || "target"] || Target;
  const progress = getGoalProgress(goal.current, goal.target);
  const remaining = goal.target - goal.current;

  return (
    <Card className="bg-white group rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer"
          onClick={() => onView(goal)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            goal.status === "completed" ? "bg-emerald-50 text-emerald-600" :
            goal.status === "in_progress" ? "bg-blue-50 text-blue-600" :
            "bg-amber-50 text-amber-600"
          }`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {goal.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                goal.priority === "high" ? "bg-red-50 text-red-600 border border-red-100" :
                goal.priority === "medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                "bg-slate-50 text-slate-600 border border-slate-100"
              }`}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
              </span>
              {goal.isFamily && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100"
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
                <Target size={12} /> Goal reached!
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
      
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

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

  const activeGoals = useMemo(() => GOALS.filter(goal => goal.status !== "completed"), []);
  const totalSaved = useMemo(() => GOALS.reduce((sum, goal) => sum + goal.current, 0), []);
  const monthlyContributions = useMemo(() => GOALS.filter(goal => goal.status !== "completed").reduce((sum, goal) => sum + goal.monthlyContribution, 0), []);
  const completedGoals = useMemo(() => GOALS.filter(goal => goal.status === "completed").length, []);

  const summaryData = useMemo(() => [
    { label: "Active Goals", value: activeGoals.length.toString() },
    { label: "Total Saved", value: formatCurrency(totalSaved) },
    { label: "Monthly Contributions", value: formatCurrency(monthlyContributions) },
    { label: "Completed", value: completedGoals.toString() },
  ], [activeGoals.length, totalSaved, monthlyContributions, completedGoals]);

  const chartData = useMemo(() => [
    { month: "Aug", target: 75, saved: 65 },
    { month: "Sep", target: 70, saved: 55 },
    { month: "Oct", target: 80, saved: 75 },
    { month: "Nov", target: 85, saved: 90 },
    { month: "Dec", target: 80, saved: 60 },
    { month: "Jan", target: 75, saved: 45 },
  ], []);

  const goalHealthData = useMemo(() => [
    { name: "Completed", value: completedGoals, color: "bg-emerald-500" },
    { name: "In Progress", value: activeGoals.length, color: "bg-blue-500" },
    { name: "Overdue", value: 0, color: "bg-amber-500" },
  ], [activeGoals.length, completedGoals]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Financial Goals</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">Track your savings goals and milestones</p>
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
            <Plus size={16} /> Create Goal
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryData.slice(0, 3).map((item, index) => {
          const icons = [Target, PiggyBank, TrendingUp];
          const Icon = icons[index];
          const colors = ["emerald", "blue", "amber"];
          const color = colors[index];
          
          return (
            <Card key={item.label} className="p-5 hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                {index === 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    color === "emerald" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : 
                    color === "blue" ? "text-blue-700 bg-blue-50 border-blue-100" :
                    "text-amber-700 bg-amber-50 border-amber-100"
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
        <Card className="col-span-2 p-6">
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
                  className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:bg-slate-400"
                  style={{ height: `${data.target}%` }}
                />
                <div
                  className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:bg-emerald-600"
                  style={{ height: `${data.saved}%` }}
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

        {/* Goal Health */}
        <Card className="p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-900 mb-6">Goal Health</h3>

          <div className="flex items-center justify-center mb-6 relative">
            <div className="w-32 h-32 rounded-full relative"
                 style={{ background: 'conic-gradient(#10b981 0% 25%, #3b82f6 25% 75%, #f59e0b 75% 100%)' }}>
              <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400">Total</span>
                <span className="text-xl font-bold text-slate-900">{GOALS.length}</span>
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
                <span className="font-medium text-slate-900">{item.value} ({Math.round((item.value / GOALS.length) * 100)}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
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
              placeholder="Search goals..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto flex-1">
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Statuses</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Behind</option>
              <option>Overdue</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Categories</option>
              <option>Emergency</option>
              <option>Housing</option>
              <option>Education</option>
              <option>Travel</option>
              <option>Transport</option>
            </select>
            {/* Date Range Picker Mockup */}
            <div className="relative w-full">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Select dates"
                className="h-8 pl-8 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
                readOnly
                value="Jan 1 - Dec 31"
              />
            </div>
          </div>

          <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center">
            <RotateCcw size={14} />
            Reset
          </Button>
        </div>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GOALS.map((goal) => (
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

      {/* Modals */}
      <AddGoalModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
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
      />
      <DeleteGoalModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        goal={selectedGoal}
      />
      <ContributeGoalModal
        open={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        goal={selectedGoal}
      />
    </div>
  );
}
