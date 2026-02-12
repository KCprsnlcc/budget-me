"use client";

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
  ChefHat,
  Bus,
  Gamepad2,
  ShoppingCart,
  Clapperboard,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowDown,
  MinusCircle,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { memo } from "react";

// Type definitions for better type safety
type StatType = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
};

type InsightType = {
  type: string;
  label: string;
  title: string;
  description: string;
  action: string;
  borderColor: string;
  labelColor: string;
  actionColor: string;
  icon: React.ComponentType<any>;
  iconColor: string;
};

type SpendingTrendType = {
  name: string;
  amount: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
};

// Memoize static data to prevent recreation on every render
const STATS: StatType[] = [
  {
    label: "Total Balance",
    value: "$24,563.00",
    change: "+12.5%",
    trend: "up",
    icon: Wallet,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Monthly Income",
    value: "$8,450.00",
    change: "+3.2%",
    trend: "up",
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Monthly Expenses",
    value: "$5,230.00",
    change: "-8.1%",
    trend: "down",
    icon: CreditCard,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    label: "Savings Rate",
    value: "38.1%",
    change: "+5.4%",
    trend: "up",
    icon: PiggyBank,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const INSIGHTS: InsightType[] = [
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

const SPENDING_TRENDS: SpendingTrendType[] = [
  {
    name: "Dining Out",
    amount: "$324.50",
    change: "-5%",
    trend: "down",
    icon: ChefHat,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    hoverBorder: "hover:border-emerald-100",
  },
  {
    name: "Groceries",
    amount: "$450.00",
    change: "+12%",
    trend: "up",
    icon: ShoppingCart,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    hoverBorder: "hover:border-red-100",
  },
  {
    name: "Transport",
    amount: "$180.00",
    change: "No change",
    trend: "neutral",
    icon: Bus,
    iconBg: "bg-gray-50",
    iconColor: "text-gray-400",
    hoverBorder: "hover:border-gray-100",
  },
  {
    name: "Entertainment",
    amount: "$120.00",
    change: "+2%",
    trend: "up",
    icon: Gamepad2,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    hoverBorder: "hover:border-red-100",
  },
];

const ENHANCED_RECENT_TRANSACTIONS = [
  {
    name: "Whole Foods Market",
    category: "Groceries",
    amount: "-$86.42",
    date: "Today, 2:30 PM",
    type: "expense" as const,
    account: "Chase ••42",
    icon: ShoppingCart,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100",
  },
  {
    name: "Tech Corp Salary",
    category: "Income",
    amount: "+$2,450.00",
    date: "Today, 9:00 AM",
    type: "income" as const,
    account: "Checking ••90",
    icon: DollarSign,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    name: "Uber Trip",
    category: "Transport",
    amount: "-$14.50",
    date: "Yesterday",
    type: "expense" as const,
    account: "Chase ••42",
    icon: Bus,
    iconBg: "bg-gray-50",
    iconColor: "text-gray-600",
    borderColor: "border-gray-100",
  },
  {
    name: "Netflix",
    category: "Subscription",
    amount: "-$15.99",
    date: "Oct 21",
    type: "expense" as const,
    account: "Chase ••42",
    icon: Clapperboard,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100",
  },
];

const ENHANCED_BUDGET_OVERVIEW = [
  {
    name: "Food & Dining",
    spent: 450,
    budget: 600,
    percentage: 75,
    status: "On Track" as const,
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-50",
    icon: ChefHat,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    progressColor: "bg-emerald-500",
  },
  {
    name: "Transportation",
    spent: 190,
    budget: 200,
    percentage: 95,
    status: "Warning" as const,
    statusColor: "text-amber-600",
    statusBg: "bg-amber-50",
    icon: Bus,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    progressColor: "bg-amber-500",
  },
  {
    name: "Entertainment",
    spent: 120,
    budget: 100,
    percentage: 120,
    status: "Over Budget" as const,
    statusColor: "text-red-600",
    statusBg: "bg-red-50",
    icon: Gamepad2,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    progressColor: "bg-red-500",
  },
];

// Memoize chart data to prevent unnecessary recalculations
const CHART_DATA = [
  { month: "May", income: 45, expense: 35 },
  { month: "Jun", income: 55, expense: 40 },
  { month: "Jul", income: 48, expense: 42 },
  { month: "Aug", income: 65, expense: 45 },
  { month: "Sep", income: 72, expense: 38 },
  { month: "Oct", income: 82, expense: 34 },
] as const;

// Memoized components for better performance
const StatCard = memo(({ stat }: { stat: StatType }) => {
  const Icon = stat.icon;
  return (
    <Card className="p-5">
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
});

StatCard.displayName = "StatCard";

const InsightCard = memo(({ insight }: { insight: InsightType }) => {
  const Icon = insight.icon;
  return (
    <div
      className={`bg-white rounded-xl border-l-4 ${insight.borderColor} shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer`}
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
                <Button variant="ghost" size="xs" className={insight.actionColor}>
                  {insight.action} <ArrowRight size={12} />
                </Button>
    </div>
  );
});

InsightCard.displayName = "InsightCard";

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
          <Button variant="ghost" size="xs" className="text-slate-400 hover:text-purple-600">
            <RefreshCw size={12} /> Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSIGHTS.map((insight) => (
            <InsightCard key={insight.title} insight={insight} />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Charts + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Income vs Expenses</h3>
              <p className="text-xs text-slate-400 mt-1 font-light">6-month comparison.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-[10px] font-medium text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-slate-400">Expense</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
            </div>
            {CHART_DATA.map((d) => (
              <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer">
                <div
                  className="w-3 sm:w-5 bg-gray-300 rounded-t-[2px] transition-all hover:opacity-100"
                  style={{ height: `${d.income}%` }}
                />
                <div
                  className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100"
                  style={{ height: `${d.expense}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
            {CHART_DATA.map((d) => (
              <span key={d.month} className={d.month === 'Oct' ? 'text-slate-600' : ''}>
                {d.month}
              </span>
            ))}
          </div>
        </Card>

        {/* Expense Categories */}
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-slate-800">Categories</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} className="text-slate-400" />
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-6">
            {/* Donut Chart */}
            <div className="w-32 h-32 mx-auto rounded-full flex-shrink-0 relative"
                 style={{ background: 'conic-gradient(#10b981 0% 35%, #f59e0b 35% 65%, #64748b 65% 85%, #cbd5e1 85% 100%)' }}>
              <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-400 font-medium">Total</span>
                <span className="text-sm font-bold text-slate-800">$3.4k</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Food</span>
              </div>
              <span className="font-medium text-slate-800">$1,191</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-600">Housing</span>
              </div>
              <span className="font-medium text-slate-800">$1,021</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-slate-600">Transport</span>
              </div>
              <span className="font-medium text-slate-800">$681</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-slate-600">Other</span>
              </div>
              <span className="font-medium text-slate-800">$511</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Spending Trends */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-slate-400" />
          Spending Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPENDING_TRENDS.map((trend) => {
            const Icon = trend.icon;
            return (
              <Card key={trend.name} className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${trend.hoverBorder}`}>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{trend.name}</div>
                  <div className="text-sm font-bold text-slate-800">{trend.amount}</div>
                  <div className={`text-[10px] font-medium flex items-center gap-0.5 mt-1 ${
                    trend.trend === 'down' ? 'text-emerald-600' :
                    trend.trend === 'up' ? 'text-red-500' :
                    'text-slate-400'
                  }`}>
                    {trend.trend === 'down' && <ArrowDown size={12} />}
                    {trend.trend === 'up' && <ArrowUp size={12} />}
                    {trend.trend === 'neutral' && <MinusCircle size={12} />}
                    {trend.change} {trend.trend === 'down' ? 'less' : trend.trend === 'up' ? 'more' : ''}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full ${trend.iconBg} flex items-center justify-center ${trend.iconColor}`}>
                  <Icon size={20} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Budget Progress & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-800">Budget Progress</h3>
            <Button variant="ghost" size="sm" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Button>
          </div>

          <div className="space-y-5">
            {ENHANCED_BUDGET_OVERVIEW.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400">${item.spent} / ${item.budget}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{item.percentage}%</div>
                      <div className={`text-[9px] font-medium ${item.statusColor} ${item.statusBg} px-1.5 py-0.5 rounded inline-block`}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${item.progressColor} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-800">Recent Transactions</h3>
          </div>

          <div className="space-y-4 flex-1">
            {ENHANCED_RECENT_TRANSACTIONS.map((tx) => {
              const Icon = tx.icon;
              return (
                <div
                  key={tx.name}
                  className="flex items-center justify-between group cursor-pointer p-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${tx.iconBg} ${tx.iconColor} flex items-center justify-center border ${tx.borderColor}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{tx.name}</div>
                      <div className="text-[10px] text-slate-400">{tx.category} • {tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${tx.type === "income" ? "text-emerald-600" : "text-slate-800"}`}>
                      {tx.amount}
                    </div>
                    <div className="text-[10px] text-slate-400">{tx.account}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="h-8" />
    </div>
  );
}
