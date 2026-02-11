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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "BudgetMe - Budgets" };

const BUDGETS = [
  { name: "Food & Dining", icon: Utensils, spent: 420, budget: 600, color: "success" as const, trend: -12 },
  { name: "Transportation", icon: Car, spent: 185, budget: 200, color: "warning" as const, trend: 5 },
  { name: "Entertainment", icon: Music, spent: 148, budget: 150, color: "danger" as const, trend: 22 },
  { name: "Shopping", icon: ShoppingBag, spent: 230, budget: 400, color: "success" as const, trend: -8 },
  { name: "Housing", icon: Home, spent: 1800, budget: 1800, color: "danger" as const, trend: 0 },
  { name: "Utilities", icon: Zap, spent: 220, budget: 350, color: "success" as const, trend: -5 },
  { name: "Healthcare", icon: Heart, spent: 85, budget: 200, color: "success" as const, trend: -30 },
  { name: "Personal", icon: Briefcase, spent: 120, budget: 250, color: "success" as const, trend: 10 },
];

const SUMMARY = [
  { label: "Total Budget", value: "$3,950" },
  { label: "Total Spent", value: "$3,208" },
  { label: "Remaining", value: "$742" },
  { label: "Categories", value: "8" },
];

export default function BudgetsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Budgets</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your monthly spending limits by category
          </p>
        </div>
        <Button size="sm">
          <Plus size={14} /> Create Budget
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{item.label}</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{item.value}</div>
          </Card>
        ))}
      </div>

      {/* Overall Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Monthly Budget Usage</h3>
          <span className="text-xs text-slate-400">$3,208 / $3,950 (81.2%)</span>
        </div>
        <ProgressBar value={3208} max={3950} color="warning" className="h-2" />
        <div className="flex items-center gap-2 mt-2">
          <AlertTriangle size={12} className="text-amber-500" />
          <span className="text-[11px] text-amber-600">You&apos;ve used 81% of your total budget this month</span>
        </div>
      </Card>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BUDGETS.map((budget) => {
          const Icon = budget.icon;
          const percentage = Math.round((budget.spent / budget.budget) * 100);
          const remaining = budget.budget - budget.spent;

          return (
            <Card key={budget.name} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <Icon size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{budget.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      ${budget.spent.toLocaleString()} of ${budget.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={budget.color === "success" ? "success" : budget.color === "warning" ? "warning" : "danger"}>
                    {percentage}%
                  </Badge>
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              <ProgressBar value={budget.spent} max={budget.budget} color={budget.color} className="mb-3" />

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  ${remaining >= 0 ? remaining.toLocaleString() : 0} remaining
                </span>
                <span className={`flex items-center gap-1 font-medium ${budget.trend <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {budget.trend <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {Math.abs(budget.trend)}% vs last month
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
