"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ArrowLeftRight,
  DollarSign,
  Activity,
  RefreshCw,
  BarChart3,
  ArrowRight,
  UserCheck,
  Wallet,
  PiggyBank,
} from "lucide-react";
import {
  fetchAdminSummary,
  fetchUserActivity,
  fetchModuleStats,
  fetchSystemActivity,
  type AdminSummary,
  type UserActivity,
  type ModuleStats,
  type SystemActivity,
} from "../_lib/admin-dashboard-service";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HoveredBar = {
  date: string;
  type: 'new_users' | 'transactions' | 'ai_requests';
  value: number;
  index: number;
} | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(n: number): string {
  return n.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `₱${(n / 1000).toFixed(1)}K`;
  return formatCurrency(n);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [systemActivity, setSystemActivity] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<HoveredBar>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, usersData, statsData, activityData] =
        await Promise.all([
          fetchAdminSummary(),
          fetchUserActivity(10),
          fetchModuleStats(),
          fetchSystemActivity(7),
        ]);

      setSummary(summaryData);
      setUserActivity(usersData);
      setModuleStats(statsData);
      setSystemActivity(activityData);
    } catch (err) {
      setError("Failed to load admin dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats cards - only 4 main cards
  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Total Users",
        value: summary.totalUsers.toLocaleString(),
        icon: Users,
        iconColor: "text-blue-600",
      },
      {
        label: "Active Users",
        value: summary.activeUsers.toLocaleString(),
        icon: UserCheck,
        iconColor: "text-emerald-600",
      },
      {
        label: "Total Transactions",
        value: summary.totalTransactions.toLocaleString(),
        icon: ArrowLeftRight,
        iconColor: "text-purple-600",
      },
      {
        label: "System Revenue",
        value: formatCompact(summary.systemRevenue),
        icon: DollarSign,
        iconColor: "text-green-600",
      },
    ];
  }, [summary]);

  // Chart data for system activity
  const chartData = useMemo(() => {
    if (!systemActivity.length) return [];
    const maxValue = Math.max(
      ...systemActivity.map((d) =>
        Math.max(d.new_users, d.transactions, d.ai_requests)
      ),
      1
    );
    return systemActivity.map((d) => ({
      date: d.date,
      new_users: d.new_users > 0 ? Math.max((d.new_users / maxValue) * 100, 5) : 0,
      transactions: d.transactions > 0 ? Math.max((d.transactions / maxValue) * 100, 5) : 0,
      ai_requests: d.ai_requests > 0 ? Math.max((d.ai_requests / maxValue) * 100, 5) : 0,
      new_users_value: d.new_users,
      transactions_value: d.transactions,
      ai_requests_value: d.ai_requests,
    }));
  }, [systemActivity]);

  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton width={180} height={28} className="mb-2 sm:w-[200px]" />
              <Skeleton width={280} height={16} className="sm:w-[320px]" />
            </div>
            <Skeleton width={80} height={32} borderRadius={6} className="sm:w-[90px] sm:h-9" />
          </div>

          {/* Stats Grid Skeleton - 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <Skeleton width={20} height={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <Skeleton width={90} height={12} className="mb-1 sm:w-[100px]" />
                <Skeleton width={80} height={20} className="sm:w-[90px] sm:h-6" />
              </Card>
            ))}
          </div>

          {/* Module Statistics Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton width={140} height={14} className="sm:w-[160px] sm:h-[16px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-3 sm:p-4 border-l-4 border-slate-200">
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                    <Skeleton width={80} height={10} className="sm:w-[90px] sm:h-[11px]" />
                    <Skeleton width={14} height={14} className="sm:w-4 sm:h-4" />
                  </div>
                  <Skeleton width={100} height={14} className="mb-0.5 sm:mb-1 sm:w-[110px]" />
                  <Skeleton width="90%" height={11} className="mb-2 sm:mb-3" />
                  <Skeleton width={100} height={12} className="sm:w-[110px]" />
                </Card>
              ))}
            </div>
          </div>

          {/* System Activity Chart Skeleton */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <Skeleton width={180} height={14} className="mb-1 sm:w-[200px]" />
                <Skeleton width={200} height={12} className="sm:w-[220px]" />
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1 sm:gap-1.5">
                    <Skeleton width={10} height={10} circle className="sm:w-3 sm:h-3" />
                    <Skeleton width={70} height={10} className="sm:w-20" />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton height={192} className="sm:h-60" />
            <div className="flex justify-between mt-3 sm:mt-4 px-2 sm:px-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} width={30} height={10} className="sm:w-10" />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Skeleton width={70} height={10} className="sm:w-20" />
                  <Skeleton width={40} height={12} className="sm:w-12" />
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Skeleton width={80} height={10} className="sm:w-24" />
                  <Skeleton width={40} height={12} className="sm:w-12" />
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Skeleton width={90} height={10} className="sm:w-28" />
                  <Skeleton width={40} height={12} className="sm:w-12" />
                </div>
              </div>
            </div>
          </Card>

          {/* Recent User Activity Skeleton */}
          <Card className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <Skeleton width={180} height={14} className="mb-0.5 sm:w-[200px]" />
              <Skeleton width={220} height={12} className="sm:w-[250px]" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
                  <Skeleton width={32} height={32} borderRadius="50%" className="sm:w-10 sm:h-10" />
                  <Skeleton width={10} height={10} borderRadius="50%" className="sm:w-3 sm:h-3 -ml-5 sm:-ml-6 mt-4 sm:mt-5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <Skeleton width={120} height={14} className="mb-0.5 sm:w-[140px]" />
                        <Skeleton width={160} height={10} className="sm:w-[180px]" />
                      </div>
                      <Skeleton width={60} height={10} className="sm:w-[70px]" />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Skeleton width={50} height={12} className="sm:w-[60px]" />
                      <Skeleton width={60} height={12} className="sm:w-[70px]" />
                      <Skeleton width={50} height={12} className="sm:w-[60px]" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <Activity size={40} className="text-red-400" />
        <p className="text-sm text-slate-600">{error}</p>
        <Button size="sm" onClick={fetchData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
            System-wide analytics and user management
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid - 4 main cards matching user dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const IconCmp = stat.icon;
          return (
            <Card
              key={stat.label}
              className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="text-slate-500">
                  <IconCmp size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
                {stat.value}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Module Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-500" />
            Module Statistics
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {moduleStats.map((stat) => {
            // Assign colors based on module type
            const getColorScheme = (module: string) => {
              const moduleLower = module.toLowerCase();
              
              // Green for Transactions & Family
              if (moduleLower.includes('transaction') || moduleLower.includes('family')) {
                return { border: 'border-emerald-500', label: 'text-emerald-700', icon: 'text-emerald-600' };
              }
              
              // Orange for Budgets & Predictions
              if (moduleLower.includes('budget') || moduleLower.includes('prediction')) {
                return { border: 'border-amber-500', label: 'text-amber-700', icon: 'text-amber-600' };
              }
              
              // Blue for Goals & Chatbot
              if (moduleLower.includes('goal') || moduleLower.includes('chatbot')) {
                return { border: 'border-blue-500', label: 'text-blue-700', icon: 'text-blue-600' };
              }
              
              // Default fallback
              return { border: 'border-slate-500', label: 'text-slate-700', icon: 'text-slate-600' };
            };
            
            const colorScheme = getColorScheme(stat.module);
            
            // Determine icon, route, and description based on module type
            const getModuleConfig = (module: string) => {
              const moduleLower = module.toLowerCase();
              if (moduleLower.includes('transaction')) {
                return {
                  icon: ArrowLeftRight,
                  route: '/admin/transactions',
                  description: 'Manage and monitor all user transactions'
                };
              }
              if (moduleLower.includes('budget')) {
                return {
                  icon: Wallet,
                  route: '/admin/budgets',
                  description: 'Oversee budget management across all users'
                };
              }
              if (moduleLower.includes('goal')) {
                return {
                  icon: PiggyBank,
                  route: '/admin/goals',
                  description: 'Track and manage user savings goals'
                };
              }
              if (moduleLower.includes('family')) {
                return {
                  icon: Users,
                  route: '/admin/families',
                  description: 'Administer family groups and memberships'
                };
              }
              return {
                icon: Activity,
                route: '/admin/dashboard',
                description: 'System-wide module management and analytics'
              };
            };
            
            const config = getModuleConfig(stat.module);
            const ModuleIcon = config.icon;
            
            return (
              <div
                key={stat.module}
                className={`bg-white rounded-xl border-l-4 ${colorScheme.border} shadow-sm p-3 sm:p-4 hover:shadow-md transition-all group cursor-pointer`}
                onClick={() => window.location.href = config.route}
              >
                <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                  <div className={`text-[9px] sm:text-[10px] font-bold ${colorScheme.label} uppercase tracking-wider`}>
                    {stat.module}
                  </div>
                  <ModuleIcon size={14} className={`sm:w-4 sm:h-4 ${colorScheme.icon}`} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 sm:mb-1">
                  {stat.total_records.toLocaleString()} Records
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed mb-2 sm:mb-3">
                  {config.description}
                  {stat.total_amount > 0 && ` • ${formatCompact(stat.total_amount)}`}
                </p>
                <button
                  className={`flex items-center gap-2 text-[10px] sm:text-xs ${colorScheme.label} font-medium hover:opacity-80 transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = config.route;
                  }}
                >
                  <span>Manage module</span>
                  <ArrowRight size={10} className="sm:w-3 sm:h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Activity Chart - Full Width */}
      <Card className="p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              System Activity (Last 7 Days)
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">
              Daily metrics across the platform
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-300 rounded-sm" />
              <span className="text-[10px] font-medium text-slate-400">New Users</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-200 border-2 border-emerald-500 border-dashed rounded-sm" />
              <span className="text-[10px] font-medium text-slate-400">
                AI Requests
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-sm" />
              <span className="text-[10px] font-medium text-slate-400">
                Transactions
              </span>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <>
            <div className="relative h-48 sm:h-60 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
                <div className="w-full h-px bg-slate-100/50" />
              </div>
              
              {chartData.map((d, i) => {
                const usersHeight = d.new_users;
                const aiRequestsHeight = d.ai_requests;
                const transactionsHeight = d.transactions;
                
                return (
                  <div
                    key={d.date}
                    className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative"
                  >
                    {d.new_users_value > 0 && (
                      <div
                        className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                        style={{ height: `${usersHeight}%`, minHeight: '4px' }}
                        onMouseEnter={() => setHoveredBar({ date: d.date, type: 'new_users', value: d.new_users_value, index: i })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    )}
                    {d.ai_requests_value > 0 && (
                      <div
                        className="w-3 sm:w-5 bg-slate-200 border-2 border-emerald-500 border-dashed rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                        style={{ height: `${aiRequestsHeight}%`, minHeight: '4px' }}
                        onMouseEnter={() => setHoveredBar({ date: d.date, type: 'ai_requests', value: d.ai_requests_value, index: i })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    )}
                    {d.transactions_value > 0 && (
                      <div
                        className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                        style={{ height: `${transactionsHeight}%`, minHeight: '4px' }}
                        onMouseEnter={() => setHoveredBar({ date: d.date, type: 'transactions', value: d.transactions_value, index: i })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    )}
                    
                    {/* Tooltip */}
                    {hoveredBar && hoveredBar.index === i && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                        <div className="font-medium text-slate-700">
                          {new Date(hoveredBar.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            hoveredBar.type === 'new_users' 
                              ? 'bg-slate-300'
                              : hoveredBar.type === 'ai_requests'
                              ? 'bg-slate-200 border border-emerald-500'
                              : 'bg-emerald-500'
                          }`} />
                          <span className="capitalize">
                            {hoveredBar.type === 'new_users' ? 'New Users' : hoveredBar.type === 'ai_requests' ? 'AI Requests' : 'Transactions'}: {hoveredBar.value}
                          </span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
              {chartData.map((d) => (
                <span key={d.date} className="truncate">
                  <span className="hidden sm:inline">
                    {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="sm:hidden">
                    {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }).slice(0, 6)}
                  </span>
                </span>
              ))}
            </div>
            
            {/* Summary stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Total Users</span>
                  <span className="text-xs font-bold text-slate-900">
                    {chartData.reduce((sum, d) => sum + d.new_users_value, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Total AI Requests</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {chartData.reduce((sum, d) => sum + d.ai_requests_value, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Total Transactions</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {chartData.reduce((sum, d) => sum + d.transactions_value, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 sm:h-60 flex items-center justify-center text-slate-400 text-xs sm:text-sm">
            No activity data available
          </div>
        )}
      </Card>

      {/* Recent User Activity - Full Width Below */}
      <Card className="p-4 sm:p-6 hover:shadow-md transition-all">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
            Recent User Activity ({userActivity.length})
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">
            Latest user registrations and engagement
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {userActivity.map((user) => (
            <Card
              key={user.id}
              className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white hover:bg-slate-50 rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer"
            >
              <div className="flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 ring-2 ring-white shadow-sm"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 ring-2 ring-white shadow-sm text-slate-600 font-medium text-[10px] sm:text-xs ${user.avatar_url ? "hidden" : "flex"}`}>
                  {user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : user.email?.slice(0, 2).toUpperCase() || "U"}
                </div>
              </div>
              
              <div className="flex items-center justify-center text-slate-400 flex-shrink-0 -ml-5 sm:-ml-6 mt-4 sm:mt-5 bg-white rounded-full p-0.5 sm:p-1 shadow-sm border border-slate-100">
                <UserCheck size={10} className="sm:w-3 sm:h-3" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 truncate mb-0.5">
                      {user.full_name || "Anonymous User"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-light truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-slate-500">
                    {user.transaction_count} txns
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-300">•</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">
                    {user.budget_count} budgets
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-300">•</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">
                    {user.goal_count} goals
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="h-6 sm:h-8" />
    </div>
  );
}
