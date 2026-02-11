import {
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  CreditCard,
  Receipt,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "BudgetMe - Dashboard" };

const STATS = [
  {
    label: "Total Balance",
    value: "$24,563.00",
    change: "+12.5%",
    trend: "up" as const,
    icon: Wallet,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Monthly Income",
    value: "$8,450.00",
    change: "+3.2%",
    trend: "up" as const,
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Monthly Expenses",
    value: "$5,230.00",
    change: "-8.1%",
    trend: "down" as const,
    icon: CreditCard,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    label: "Savings Rate",
    value: "38.1%",
    change: "+5.4%",
    trend: "up" as const,
    icon: PiggyBank,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const INSIGHTS = [
  {
    type: "warning",
    label: "Warning",
    title: "Unusual Subscription",
    description: 'Duplicate "Netflix" charge detected.',
    action: "Review",
    borderColor: "border-l-amber-500",
    labelColor: "text-amber-600",
    actionColor: "text-amber-600 hover:text-amber-700",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  {
    type: "success",
    label: "Success",
    title: "Goal Reached",
    description: 'Hit 100% of "Emergency Fund" goal.',
    action: "View Goal",
    borderColor: "border-l-emerald-500",
    labelColor: "text-emerald-600",
    actionColor: "text-emerald-600 hover:text-emerald-700",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
  },
  {
    type: "info",
    label: "Tip",
    title: "Save on Dining",
    description: "Dining spend is 23% above average this month.",
    action: "See Details",
    borderColor: "border-l-blue-500",
    labelColor: "text-blue-600",
    actionColor: "text-blue-600 hover:text-blue-700",
    icon: Info,
    iconColor: "text-blue-500",
  },
  {
    type: "success",
    label: "Milestone",
    title: "Budget Streak",
    description: "12 consecutive weeks under budget.",
    action: "View Streak",
    borderColor: "border-l-emerald-500",
    labelColor: "text-emerald-600",
    actionColor: "text-emerald-600 hover:text-emerald-700",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
  },
];

const RECENT_TRANSACTIONS = [
  { name: "Spotify Premium", category: "Entertainment", amount: "-$9.99", date: "Today", type: "expense" },
  { name: "Salary Deposit", category: "Income", amount: "+$4,225.00", date: "Yesterday", type: "income" },
  { name: "Grocery Store", category: "Food & Dining", amount: "-$67.50", date: "Yesterday", type: "expense" },
  { name: "Electric Bill", category: "Utilities", amount: "-$142.00", date: "Feb 8", type: "expense" },
  { name: "Freelance Payment", category: "Income", amount: "+$850.00", date: "Feb 7", type: "income" },
];

const BUDGET_OVERVIEW = [
  { name: "Food & Dining", spent: 420, budget: 600, color: "success" as const },
  { name: "Transportation", spent: 180, budget: 200, color: "warning" as const },
  { name: "Entertainment", spent: 145, budget: 150, color: "danger" as const },
  { name: "Shopping", spent: 230, budget: 400, color: "success" as const },
];

const CHART_DATA = [
  { month: "Jul", income: 65, expense: 45 },
  { month: "Aug", income: 70, expense: 50 },
  { month: "Sep", income: 60, expense: 55 },
  { month: "Oct", income: 75, expense: 48 },
  { month: "Nov", income: 80, expense: 52 },
  { month: "Dec", income: 72, expense: 60 },
  { month: "Jan", income: 85, expense: 53 },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">
            Good afternoon
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Welcome back, John!
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-light">
            Here&apos;s a summary of your finances. You&apos;re doing great!
          </p>
        </div>

        {/* Pending Invitation */}
        <Card className="p-0.5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="bg-white rounded-[10px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-500 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  Pending Invitation
                  <Badge variant="success">New</Badge>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You have been invited by{" "}
                  <span className="text-slate-600 font-medium">sarah@example.com</span> to
                  join the{" "}
                  <span className="text-slate-600 font-medium">Smith Family</span> dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto pl-14 sm:pl-0">
              <Button variant="ghost" size="sm">Decline</Button>
              <Button size="sm">Accept Invitation</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            Financial Insights
          </h3>
          <button className="text-[10px] font-medium text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors cursor-pointer">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSIGHTS.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.title}
                className={`bg-white rounded-xl border-l-4 ${insight.borderColor} shadow-sm p-4 hover:shadow-md transition-all group`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`text-[10px] font-bold ${insight.labelColor} uppercase tracking-wider`}>
                    {insight.label}
                  </div>
                  <Icon size={16} className={insight.iconColor} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{insight.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  {insight.description}
                </p>
                <button className={`text-[10px] font-medium ${insight.actionColor} flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer`}>
                  {insight.action} <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon size={18} className={stat.iconColor} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts + Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-800">Income vs Expenses</h3>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-800" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Expenses
              </span>
            </div>
          </div>
          <div className="relative h-60 flex items-end justify-between gap-2 px-2 border-b border-slate-100">
            {CHART_DATA.map((d) => (
              <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center cursor-pointer group">
                <div
                  className="w-3 rounded-t bg-slate-800 opacity-90 hover:opacity-100 transition-all"
                  style={{ height: `${d.income}%` }}
                />
                <div
                  className="w-3 rounded-t bg-emerald-500 opacity-90 hover:opacity-100 transition-all"
                  style={{ height: `${d.expense}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-2">
            {CHART_DATA.map((d) => (
              <span key={d.month} className="text-[10px] text-slate-400 flex-1 text-center">
                {d.month}
              </span>
            ))}
          </div>
        </Card>

        {/* Budget Overview */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Budget Overview</h3>
          <div className="space-y-5">
            {BUDGET_OVERVIEW.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-700">{item.name}</span>
                  <span className="text-[10px] text-slate-400">
                    ${item.spent} / ${item.budget}
                  </span>
                </div>
                <ProgressBar value={item.spent} max={item.budget} color={item.color} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Receipt size={16} className="text-slate-400" />
            Recent Transactions
          </h3>
          <Button variant="ghost" size="xs">View All</Button>
        </div>
        <div className="space-y-0">
          {RECENT_TRANSACTIONS.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}`}>
                  {tx.type === "income" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-800">{tx.name}</div>
                  <div className="text-[10px] text-slate-400">{tx.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-semibold ${tx.type === "income" ? "text-emerald-600" : "text-slate-800"}`}>
                  {tx.amount}
                </div>
                <div className="text-[10px] text-slate-400">{tx.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
