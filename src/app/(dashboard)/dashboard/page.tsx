"use client";

import { Icon } from "@iconify/react";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  ArrowRight,
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
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useState, useMemo, memo } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useDashboard } from "./_lib/use-dashboard";
import type { InsightItem } from "./_lib/dashboard-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return formatCurrency(n);
}

function fmtChange(n: number | null): string {
  if (n === null) return "";
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 86400000;
  if (diff < oneDay && d.getDate() === now.getDate()) return "Today";
  if (diff < 2 * oneDay && d.getDate() === new Date(now.getTime() - oneDay).getDate()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Map category emoji icon strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "🏠": Receipt, "🚗": Bus, "🍽️": ChefHat, "🛒": ShoppingCart,
  "💡": Receipt, "⚕️": Receipt, "🎬": Clapperboard, "🛍️": ShoppingCart,
  "📚": Receipt, "🛡️": Receipt, "💰": DollarSign, "💻": Receipt,
  "📈": TrendingUp, "🏢": Receipt, "💼": Receipt, "🚀": Receipt,
  "🎁": Receipt, "💵": DollarSign, "📋": FileText,
};

function getCategoryIcon(emoji: string | null): React.ComponentType<any> {
  if (!emoji) return FileText;
  return ICON_MAP[emoji] || FileText;
}

// Map insight type to visual props
function getInsightVisuals(type: InsightItem["type"]) {
  switch (type) {
    case "warning":
      return { label: "Warning", borderColor: "border-l-amber-500", labelColor: "text-amber-600", actionColor: "text-amber-600 hover:text-amber-700", icon: AlertTriangle, iconColor: "text-amber-500" };
    case "success":
      return { label: "Success", borderColor: "border-l-emerald-500", labelColor: "text-emerald-600", actionColor: "text-emerald-600 hover:text-emerald-700", icon: CheckCircle, iconColor: "text-emerald-500" };
    case "danger":
      return { label: "Alert", borderColor: "border-l-red-500", labelColor: "text-red-600", actionColor: "text-red-600 hover:text-red-700", icon: AlertTriangle, iconColor: "text-red-500" };
    case "info":
    default:
      return { label: "Tip", borderColor: "border-l-blue-500", labelColor: "text-blue-600", actionColor: "text-blue-600 hover:text-blue-700", icon: Info, iconColor: "text-blue-500" };
  }
}

// Budget status → visual colors
function getBudgetVisuals(status: string) {
  switch (status) {
    case "Over Budget":
      return { statusColor: "text-red-600", statusBg: "bg-red-50", progressColor: "bg-red-500" };
    case "Warning":
      return { statusColor: "text-amber-600", statusBg: "bg-amber-50", progressColor: "bg-amber-500" };
    default:
      return { statusColor: "text-emerald-600", statusBg: "bg-emerald-50", progressColor: "bg-emerald-500" };
  }
}

// Spending trend → visual colors
function getTrendVisuals(trend: "up" | "down" | "neutral") {
  switch (trend) {
    case "down":
      return { iconColor: "text-emerald-500", hoverBorder: "hover:border-emerald-100" };
    case "up":
      return { iconColor: "text-red-500", hoverBorder: "hover:border-red-100" };
    default:
      return { iconColor: "text-slate-400", hoverBorder: "hover:border-gray-100" };
  }
}

// Donut chart colors
const DONUT_COLORS = ["#10b981", "#f59e0b", "#64748b", "#cbd5e1", "#8b5cf6", "#f97316", "#06b6d4"];

// ---------------------------------------------------------------------------
// Type definitions for better type safety
// ---------------------------------------------------------------------------
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
  icon: React.ComponentType<any> | string;
  iconColor: string;
};

// Memoized components for better performance
const StatCard = memo(({ stat }: { stat: StatType }) => {
  const IconCmp = stat.icon;
  return (
    <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-500 p-2 rounded-lg">
          <IconCmp size={22} strokeWidth={1.5} />
        </div>
        {stat.change && (
          <div className={`flex items-center gap-1 text-[10px] font-medium ${
            stat.trend === "up" ? "text-emerald-700 border-emerald-100" : 
            "text-red-700 border-red-100"
          } px-2 py-1 rounded-full border`}>
            {stat.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {stat.change}
          </div>
        )}
      </div>
      <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{stat.label}</div>
      <div className="text-xl font-semibold text-slate-900 tracking-tight">{stat.value}</div>
    </Card>
  );
});

StatCard.displayName = "StatCard";

export default function DashboardPage() {
  const {
    summary,
    recentTransactions,
    budgetProgress,
    categoryBreakdown,
    monthlyChart,
    spendingTrends,
    pendingInvitations,
    insights,
    userName,
    greeting,
    loading,
    insightsLoading,
    trendsLoading,
    error,
    refetch,
    refreshInsights,
    refreshSpendingTrends,
    handleAcceptInvitation,
    handleDeclineInvitation,
  } = useDashboard();

  const [hoveredBar, setHoveredBar] = useState<{ month: string; type: 'income' | 'expense'; value: number } | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Handle refresh insights with loading state (only refresh insights, not whole dashboard)
  const handleRefreshInsights = async () => {
    refreshInsights();
  };

  // Handle refresh spending trends with loading state (only refresh trends, not whole dashboard)
  const handleRefreshSpendingTrends = async () => {
    refreshSpendingTrends();
  };

  // Toggle insight expand functionality (exact function from old implementation)
  const handleToggleInsightExpand = (insightTitle: string) => {
    setExpandedInsight(expandedInsight === insightTitle ? null : insightTitle);
  };

  // Get insight style based on type (exact function from old implementation)
  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-emerald-50',
          iconBg: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          icon: 'fa-check-circle'
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          icon: 'fa-exclamation-triangle'
        };
      case 'danger':
        return {
          bgColor: 'bg-rose-50',
          iconBg: 'bg-rose-500',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200',
          icon: 'fa-exclamation-circle'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: 'fa-info-circle'
        };
    }
  };

  // Get additional context message based on insight type (exact function from old implementation)
  const getInsightContextMessage = (type: string) => {
    switch (type) {
      case 'success':
        return "Keep up the good work! Maintaining this habit will help you reach your financial goals faster.";
      case 'warning':
        return "Consider reviewing your budget to address this issue before it affects your financial health.";
      case 'danger':
        return "This requires immediate attention. Visit the Budget section to make adjustments to your spending plan.";
      case 'info':
        return "This information can help you make better financial decisions going forward.";
      default:
        return "Use this information to make better financial decisions.";
    }
  };

  // Build stats from real summary data
  const stats: StatType[] = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Total Balance",
        value: formatCurrency(summary.totalBalance),
        change: fmtChange(summary.balanceChange),
        trend: (summary.balanceChange ?? 0) >= 0 ? "up" as const : "down" as const,
        icon: Wallet,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        label: "Monthly Income",
        value: formatCurrency(summary.monthlyIncome),
        change: fmtChange(summary.incomeChange),
        trend: (summary.incomeChange ?? 0) >= 0 ? "up" as const : "down" as const,
        icon: TrendingUp,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        label: "Monthly Expenses",
        value: formatCurrency(summary.monthlyExpenses),
        change: fmtChange(summary.expenseChange),
        trend: (summary.expenseChange ?? 0) >= 0 ? "up" as const : "down" as const,
        icon: CreditCard,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
      },
      {
        label: "Savings Rate",
        value: `${summary.savingsRate.toFixed(1)}%`,
        change: fmtChange(summary.savingsRateChange),
        trend: (summary.savingsRateChange ?? 0) >= 0 ? "up" as const : "down" as const,
        icon: PiggyBank,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
      },
    ];
  }, [summary]);

  // Build insight cards from real data
  const insightCards: InsightType[] = useMemo(() => {
    return insights.map((ins) => {
      const vis = getInsightVisuals(ins.type);
      return {
        type: ins.type,
        label: vis.label,
        title: ins.title,
        description: ins.description,
        action: "View",
        borderColor: vis.borderColor,
        labelColor: vis.labelColor,
        actionColor: vis.actionColor,
        icon: ins.icon || vis.icon, // Use icon from insights service if available
        iconColor: vis.iconColor,
      };
    });
  }, [insights]);

  // InsightCard component with access to state variables
  const InsightCard = memo(({ insight }: { insight: InsightType }) => {
    const isExpanded = expandedInsight === insight.title;
    const style = getInsightStyle(insight.type);
    
    // Handle both string icons (from insights service) and React component icons
    const renderIcon = () => {
      if (typeof insight.icon === 'string') {
        // Use Iconify for string icon names (e.g., "lucide:alert-triangle")
        return <Icon icon={insight.icon} width={16} height={16} className={insight.iconColor} />;
      } else {
        // Use React component icon
        const IconCmp = insight.icon;
        return <IconCmp size={16} className={insight.iconColor} />;
      }
    };
    
    return (
      <div
        className={`bg-white rounded-xl border-l-4 ${insight.borderColor} shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer ${insightsLoading ? 'opacity-50' : ''}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`text-[10px] font-bold ${insight.labelColor} uppercase tracking-wider`}>
            {insight.label}
          </div>
          {renderIcon()}
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">{insight.title}</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          {insight.description}
        </p>
        
        {/* Expanded content - exact implementation from old FinancialInsights */}
        {isExpanded && (
          <div className="mt-3 text-sm text-slate-600 animate__animated animate__fadeIn">
            <p className="text-xs leading-relaxed">
              {getInsightContextMessage(insight.type)}
            </p>
          </div>
        )}
        
        {/* Action button with expand/collapse functionality - exact implementation from old FinancialInsights */}
        <Button 
          variant="ghost" 
          size="xs" 
          className={insight.actionColor}
          onClick={() => handleToggleInsightExpand(insight.title)}
        >
          {isExpanded ? 'Show less' : 'Learn more'} <ArrowRight size={12} />
        </Button>
      </div>
    );
  });

  InsightCard.displayName = "InsightCard";

  // Normalize chart data to percentages for bar heights
  const chartData = useMemo(() => {
    if (!monthlyChart.length) return [];
    const max = Math.max(...monthlyChart.map((d) => Math.max(d.income, d.expense)), 1);
    return monthlyChart.map((d) => ({
      month: d.month,
      income: (d.income / max) * 100,
      expense: (d.expense / max) * 100,
      incomeValue: d.income,
      expenseValue: d.expense,
    }));
  }, [monthlyChart]);

  // Donut chart gradient from real category breakdown
  const donutStyle = useMemo(() => {
    if (!categoryBreakdown.length) return { background: "#e2e8f0" };
    const total = categoryBreakdown.reduce((s, c) => s + c.amount, 0);
    if (total === 0) return { background: "#e2e8f0" };
    let cumPct = 0;
    const stops: string[] = [];
    categoryBreakdown.forEach((cat, i) => {
      const pct = (cat.amount / total) * 100;
      const color = cat.color || DONUT_COLORS[i % DONUT_COLORS.length];
      stops.push(`${color} ${cumPct}% ${cumPct + pct}%`);
      cumPct += pct;
    });
    return { background: `conic-gradient(${stops.join(", ")})` };
  }, [categoryBreakdown]);

  const categoryTotal = useMemo(
    () => categoryBreakdown.reduce((s, c) => s + c.amount, 0),
    [categoryBreakdown]
  );

  // Current month label for chart highlighting
  const currentMonthLabel = new Date().toLocaleDateString("en-US", { month: "short" });

  // Loading state
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Welcome Header Skeleton */}
          <div className="flex flex-col gap-6">
            <div>
              <Skeleton width={120} height={12} className="mb-2" />
              <Skeleton width={250} height={32} className="mb-2" />
              <Skeleton width={300} height={16} />
            </div>

            {/* Pending Invitation Skeleton */}
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton width={40} height={40} borderRadius={50} />
                <div className="flex-1">
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={400} height={12} />
                </div>
                <div className="flex gap-3">
                  <Skeleton width={60} height={32} borderRadius={4} />
                  <Skeleton width={100} height={32} borderRadius={4} />
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Insights Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton width={16} height={16} />
                <Skeleton width={150} height={16} />
              </div>
              <Skeleton width={80} height={24} borderRadius={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <Skeleton width={60} height={20} borderRadius={10} />
                  </div>
                  <Skeleton width={100} height={12} className="mb-2" />
                  <Skeleton width={120} height={24} />
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
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

          {/* Charts + Categories Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Income vs Expenses Chart Skeleton */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={120} height={12} />
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <Skeleton width={8} height={8} circle />
                    <Skeleton width={50} height={12} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton width={8} height={8} circle />
                    <Skeleton width={60} height={12} />
                  </div>
                </div>
              </div>
              <Skeleton height={240} />
            </Card>

            {/* Expense Categories Skeleton */}
            <Card className="p-6 flex flex-col">
              <div className="mb-6">
                <Skeleton width={100} height={16} />
                <Skeleton width={140} height={12} className="mt-1" />
              </div>
              <div className="flex items-center gap-6 mb-6">
                <Skeleton width={128} height={128} borderRadius="50%" className="mx-auto" />
              </div>
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

          {/* Spending Trends Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Skeleton width={16} height={16} />
              <Skeleton width={150} height={16} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton width={80} height={12} className="mb-1" />
                      <Skeleton width={80} height={16} />
                      <Skeleton width={60} height={12} className="mt-1" />
                    </div>
                    <Skeleton width={40} height={40} borderRadius={50} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Budget Progress & Recent Transactions Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Progress Skeleton */}
            <Card className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={200} height={12} />
                </div>
                <Skeleton width={60} height={24} borderRadius={4} />
              </div>

              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <Skeleton width={32} height={32} borderRadius={8} />
                        <div>
                          <Skeleton width={80} height={12} />
                          <Skeleton width={60} height={10} />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton width={40} height={12} />
                        <Skeleton width={60} height={16} borderRadius={10} />
                      </div>
                    </div>
                    <Skeleton height={6} borderRadius={3} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Transactions Skeleton */}
            <Card className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Skeleton width={180} height={16} className="mb-2" />
                  <Skeleton width={200} height={12} />
                </div>
                <Skeleton width={60} height={24} borderRadius={4} />
              </div>

              <div className="space-y-4 flex-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Skeleton width={20} height={20} borderRadius={4} />
                      <div>
                        <Skeleton width={100} height={12} />
                        <Skeleton width={80} height={10} />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton width={60} height={12} />
                      <Skeleton width={80} height={10} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="h-8" />
        </div>
      </SkeletonTheme>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-sm text-slate-600">{error}</p>
        <Button size="sm" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">
            {greeting}
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Welcome back, {userName}!
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-light">
            Here&apos;s a summary of your finances. You&apos;re doing great!
          </p>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 ? (
          pendingInvitations.map((inv) => (
            <Card key={inv.id} className="p-0.5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="bg-white rounded-[10px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-emerald-500 shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                      Pending Invitation
                      <Badge variant="success">New</Badge>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      You have been invited by{" "}
                      <span className="text-slate-600 font-medium">{inv.inviter_email}</span> to
                      join the{" "}
                      <span className="text-slate-600 font-medium">{inv.family_name}</span> dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto pl-14 sm:pl-0">
                  <Button variant="ghost" size="sm" onClick={() => handleDeclineInvitation(inv.id)}>Decline</Button>
                  <Button size="sm" onClick={() => handleAcceptInvitation(inv.id)}>Accept Invitation</Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-800">No Pending Invitations</h3>
                <p className="text-xs text-slate-400 mt-1">When someone invites you to join their family dashboard, it will appear here.</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Financial Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Icon icon="material-symbols:insights" width={16} height={16} className="text-emerald-500" />
            Financial Insights
          </h3>
          <Button 
            variant="ghost" 
            size="xs" 
            className="text-slate-400 hover:text-slate-600" 
            onClick={handleRefreshInsights}
            disabled={insightsLoading}
          >
            <RefreshCw size={12} className={insightsLoading ? 'animate-spin' : ''} /> 
            {insightsLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        {insightsLoading ? (
          // Skeleton loader for insights
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton width={60} height={12} />
                  <Skeleton circle width={16} height={16} />
                </div>
                <Skeleton width="80%" height={16} className="mb-1" />
                <Skeleton width="100%" height={12} className="mb-3" />
                <Skeleton width={60} height={10} />
              </div>
            ))}
          </div>
        ) : insightCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insightCards.map((insight) => (
              <InsightCard key={insight.title} insight={insight} />
            ))}
          </div>
        ) : (
          <Card className="p-8 border border-slate-100">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Icon icon="material-symbols:insights" width={24} height={24} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Insights Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  As you add more transactions over time, we'll analyze your financial patterns and provide personalized insights to help you improve your financial health.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/transactions'}>
                Add More Transactions
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Grid */}
      {stats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      ) : (
        <Card className="p-8 border border-slate-100">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-800 mb-1">No Financial Data</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Add your first transaction to see your financial summary and statistics.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/transactions'}>
              Add First Transaction
            </Button>
          </div>
        </Card>
      )}

      {/* Charts + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="lg:col-span-2 p-6 hover:shadow-md transition-all group cursor-pointer">
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
          
          {chartData.length > 0 ? (
            <>
              <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                </div>
                {chartData.map((d) => (
                  <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                    <div
                      className="w-3 sm:w-5 bg-gray-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                      style={{ height: `${d.income}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, type: 'income', value: d.incomeValue })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <div
                      className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                      style={{ height: `${d.expense}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, type: 'expense', value: d.expenseValue })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    
                    {/* Tooltip */}
                    {hoveredBar && hoveredBar.month === d.month && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-xs rounded shadow-sm whitespace-nowrap z-50">
                        <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${hoveredBar.type === 'income' ? 'bg-gray-300' : 'bg-emerald-500'}`} />
                          <span className="capitalize">{hoveredBar.type}: {formatCurrency(hoveredBar.value)}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                {chartData.map((d, i) => (
                  <span key={d.month} className={d.month === currentMonthLabel ? 'text-slate-600' : ''}>
                    {d.month}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-sm font-medium text-slate-800 mb-1">No Chart Data</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Add transactions over multiple months to see your income vs expenses trend.
              </p>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/transactions'}>
                Add Transactions
              </Button>
            </div>
          )}
        </Card>

        {/* Expense Categories */}
        <Card className="p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">All-time expense breakdown</p>
          </div>
          <div className="flex items-center gap-6 mb-6">
            {/* Donut Chart */}
            <div className="w-32 h-32 mx-auto rounded-full flex-shrink-0 relative"
                 style={donutStyle}>
              <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-400 font-medium">Total</span>
                <span className="text-sm font-bold text-slate-900">{formatCompact(categoryTotal)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 flex-1 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300 pr-1">
            {categoryBreakdown.map((cat) => {
              const pct = categoryTotal > 0 ? Math.round((cat.amount / categoryTotal) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || DONUT_COLORS[categoryBreakdown.indexOf(cat) % DONUT_COLORS.length] }} />
                    <span className="text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{pct}%</span>
                </div>
              );
            })}
            {categoryBreakdown.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No expense data found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Spending Trends */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <BarChart3 size={16} className="text-slate-400" />
            Spending Trends
          </h3>
          <Button 
            variant="ghost" 
            size="xs" 
            className="text-slate-400 hover:text-slate-600" 
            onClick={handleRefreshSpendingTrends}
            disabled={trendsLoading}
          >
            <RefreshCw size={12} className={trendsLoading ? 'animate-spin' : ''} /> 
            {trendsLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        {trendsLoading ? (
          // Skeleton loader for spending trends
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton width={60} height={12} />
                  <Skeleton circle width={16} height={16} />
                </div>
                <Skeleton width="80%" height={16} className="mb-1" />
                <Skeleton width="60%" height={12} />
              </div>
            ))}
          </div>
        ) : spendingTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {spendingTrends.map((trend) => {
              const vis = getTrendVisuals(trend.trend);
              const changeStr = Math.abs(trend.change) < 1 ? "No change" : `${trend.change >= 0 ? "+" : ""}${trend.change.toFixed(0)}%`;
              return (
                <Card key={trend.category} className={`p-4 flex items-center justify-between transition-all cursor-pointer group hover:shadow-md ${vis.hoverBorder}`}>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{trend.category}</div>
                    <div className="text-sm font-bold text-slate-800">{formatCurrency(trend.currentAmount)}</div>
                    <div className={`text-[10px] font-medium flex items-center gap-0.5 mt-1 ${
                      trend.trend === 'down' ? 'text-emerald-600' :
                      trend.trend === 'up' ? 'text-red-500' :
                      'text-slate-400'
                    }`}>
                      {trend.trend === 'down' && <ArrowDown size={12} />}
                      {trend.trend === 'up' && <ArrowUp size={12} />}
                      {trend.trend === 'neutral' && <MinusCircle size={12} />}
                      {changeStr} {trend.trend === 'down' ? 'less' : trend.trend === 'up' ? 'more' : ''}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vis.iconColor}`}>
                    <DollarSign size={20} />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 border border-slate-100">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <BarChart3 size={24} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Spending Trends</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Add expense transactions over multiple months to see spending trends and comparisons.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/transactions'}>
                Add Transactions
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Budget Progress & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <Card className="p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Budget Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Track spending against budget limits</p>
            </div>
            <Button 
              variant="ghost" 
              size="xs" 
              className="text-slate-400 hover:text-slate-600" 
              onClick={() => window.location.href = '/budgets'}
            >
              <FileText size={12} /> 
              Manage
            </Button>
          </div>

          <div className="space-y-5">
            {budgetProgress.length > 0 ? (
              budgetProgress.map((item) => {
                const vis = getBudgetVisuals(item.status);
                const BudgetIcon = getCategoryIcon(item.category_icon);
                return (
                  <div key={item.id} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600">
                          <BudgetIcon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{formatCurrency(item.spent)} / {formatCurrency(item.budget)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800">{Math.round(item.percentage)}%</div>
                        <div className={`text-[9px] font-medium ${vis.statusColor} ${vis.statusBg} px-1.5 py-0.5 rounded inline-block`}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`${vis.progressColor} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <PiggyBank size={24} />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Active Budgets</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Create budgets to track your spending against limits and get notified when you're close to exceeding them.
                </p>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/budgets'}>
                  Create Budget
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Monthly expense breakdown</p>
            </div>
            <Button 
              variant="ghost" 
              size="xs" 
              className="text-slate-400 hover:text-slate-600" 
              onClick={() => window.location.href = '/transactions'}
            >
              <Receipt size={12} /> 
              Manage
            </Button>
          </div>

          <div className="space-y-4 flex-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => {
                const TxIcon = getCategoryIcon(tx.category_icon);
                const amtStr = tx.type === "income" || tx.type === "cash_in"
                  ? `+${formatCurrency(tx.amount)}`
                  : `-${formatCurrency(tx.amount)}`;
                const accountLabel = tx.account_name
                  ? `${tx.account_name}${tx.account_number_masked ? ` ${tx.account_number_masked}` : ""}`
                  : "";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between group cursor-pointer p-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TxIcon size={20} className="text-slate-600" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{tx.description || tx.category_name || "Transaction"}</div>
                        <div className="text-[10px] text-slate-400">{tx.category_name || tx.type} • {formatDate(tx.date)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${tx.type === "income" || tx.type === "cash_in" ? "text-emerald-600" : "text-slate-800"}`}>
                        {amtStr}
                      </div>
                      {accountLabel && <div className="text-[10px] text-slate-400">{accountLabel}</div>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <Receipt size={24} />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Transactions Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Start tracking your income and expenses to see your recent transactions here.
                </p>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/transactions'}>
                  Add Transaction
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="h-8" />
    </div>
  );
}
