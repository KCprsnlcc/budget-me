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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "BudgetMe - Financial Goals" };

const GOALS = [
  {
    name: "Emergency Fund",
    icon: PiggyBank,
    saved: 15000,
    target: 15000,
    deadline: "Completed",
    status: "completed",
    color: "success" as const,
    monthlyContribution: 500,
  },
  {
    name: "House Down Payment",
    icon: Home,
    saved: 32000,
    target: 60000,
    deadline: "Dec 2027",
    status: "on-track",
    color: "success" as const,
    monthlyContribution: 1200,
  },
  {
    name: "Education Fund",
    icon: GraduationCap,
    saved: 8500,
    target: 25000,
    deadline: "Sep 2028",
    status: "on-track",
    color: "success" as const,
    monthlyContribution: 400,
  },
  {
    name: "Dream Vacation",
    icon: Plane,
    saved: 2800,
    target: 5000,
    deadline: "Jun 2026",
    status: "behind",
    color: "warning" as const,
    monthlyContribution: 300,
  },
  {
    name: "New Car",
    icon: Car,
    saved: 5200,
    target: 35000,
    deadline: "Mar 2028",
    status: "on-track",
    color: "success" as const,
    monthlyContribution: 800,
  },
];

const SUMMARY = [
  { label: "Active Goals", value: "4" },
  { label: "Total Saved", value: "$63,500" },
  { label: "Monthly Contributions", value: "$3,200" },
  { label: "Completed", value: "1" },
];

export default function GoalsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Financial Goals</h2>
          <p className="text-sm text-slate-400 mt-0.5">Track progress toward your savings milestones</p>
        </div>
        <Button size="sm">
          <Plus size={14} /> New Goal
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

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const percentage = Math.round((goal.saved / goal.target) * 100);

          return (
            <Card key={goal.name} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <Icon size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{goal.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant={
                          goal.status === "completed"
                            ? "success"
                            : goal.status === "on-track"
                            ? "success"
                            : "warning"
                        }
                      >
                        {goal.status === "completed"
                          ? "Completed"
                          : goal.status === "on-track"
                          ? "On Track"
                          : "Behind"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    ${goal.saved.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ${goal.target.toLocaleString()}
                  </span>
                </div>
                <ProgressBar value={goal.saved} max={goal.target} color={goal.color} className="h-2" />
                <div className="text-right mt-1">
                  <span className="text-[10px] font-medium text-slate-500">{percentage}%</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar size={12} />
                  {goal.deadline}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <TrendingUp size={12} />
                  ${goal.monthlyContribution}/mo
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
