"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { memo, useState, useCallback, useMemo, useRef } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Users as UsersIcon,
  UserPlus,
  UserCheck,
  Shield,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Table as TableIcon,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Phone,
  Calendar,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AddUserModal } from "./_components/add-user-modal";
import { ViewUserModal } from "./_components/view-user-modal";
import { EditUserModal } from "./_components/edit-user-modal";
import { DeleteUserModal } from "./_components/delete-user-modal";
import { useUsers } from "./_lib/use-users";
import type { User } from "./_lib/types";
import { FilterTableSkeleton, UserCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type SummaryType = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon?: React.ComponentType<any>;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Memoized components for better performance
const SummaryCard = memo(({ item }: { item: SummaryType }) => {
  const Icon = item.icon;
  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-500">
          {Icon && <Icon size={22} strokeWidth={1.5} />}
        </div>
      </div>
      <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
      <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
    </Card>
  );
});

SummaryCard.displayName = "SummaryCard";

const UserCard = memo(({
  user,
  onView,
  onEdit,
  onDelete,
}: {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) => {
  // Convert admin User to Supabase User format for UserAvatar
  const supabaseUser: SupabaseUser = {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.full_name,
      avatar_url: user.avatar_url
    },
    app_metadata: {},
    created_at: user.created_at,
    aud: "authenticated"
  } as SupabaseUser;

  return (
    <Card className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            user={supabaseUser} 
            size="lg"
            className="ring-2 ring-white shadow-sm"
          />
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{user.full_name || "No Name"}</h4>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-medium text-slate-600">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          <span className="text-xs text-slate-400">{format(new Date(user.created_at), "MMM dd, yyyy")}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(user)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(user)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(user)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
});

UserCard.displayName = "UserCard";

const UserRow = memo(({
  user,
  onView,
  onEdit,
  onDelete,
}: {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) => {
  // Convert admin User to Supabase User format for UserAvatar
  const supabaseUser: SupabaseUser = {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.full_name,
      avatar_url: user.avatar_url
    },
    app_metadata: {},
    created_at: user.created_at,
    aud: "authenticated"
  } as SupabaseUser;

  return (
    <TableRow className="group hover:bg-slate-50/80 transition-colors">
      <TableCell className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            user={supabaseUser} 
            size="md"
            className="ring-2 ring-white shadow-sm"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">{user.full_name || "No Name"}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <span className="text-xs font-medium text-slate-600">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </TableCell>
      <TableCell className="px-6 py-4">
        <span className="text-xs font-medium text-slate-600">
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="px-6 py-4 text-slate-400">{format(new Date(user.created_at), "MMM dd, yyyy")}</TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(user)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(user)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(user)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

UserRow.displayName = "UserRow";

export default function UsersPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{ month: string; count: number } | null>(null);

  const {
    users,
    stats,
    loading,
    tableLoading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    month,
    setMonth,
    year,
    setYear,
    resetFilters,
    resetFiltersToAll,
    refetch,
    pagination,
    nextPage,
    previousPage,
    goToPage,
    handlePageSizeChange,
  } = useUsers();

  const currentYear = new Date().getFullYear();

  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  }, []);

  const handleViewToEdit = useCallback((user: User) => {
    setViewModalOpen(false);
    setTimeout(() => {
      setSelectedUser(user);
      setEditModalOpen(true);
    }, 150);
  }, []);

  // Build summary cards from real data
  const summaryItems: SummaryType[] = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Total Users", value: stats.totalUsers.toLocaleString(), change: "", trend: "up" as const, icon: UsersIcon },
      { label: "Active Users", value: stats.activeUsers.toLocaleString(), change: "", trend: "up" as const, icon: UserCheck },
      { label: "New This Month", value: stats.newThisMonth.toLocaleString(), change: "", trend: "up" as const, icon: TrendingUp },
      { label: "Admins", value: stats.adminCount.toLocaleString(), change: "", trend: "up" as const, icon: Shield },
    ];
  }, [stats]);

  // Chart data for user growth
  const chartData = useMemo(() => {
    if (!stats?.userGrowth.length) return [];
    const max = Math.max(...stats.userGrowth.map((d) => d.count), 1);
    return stats.userGrowth.map((d) => ({
      month: d.month,
      height: (d.count / max) * 100,
      count: d.count,
    }));
  }, [stats]);

  // Role distribution gradient
  const roleGradient = useMemo(() => {
    if (!stats?.roleDistribution.length) return "conic-gradient(#e2e8f0 0% 100%)";
    const colors = { user: "#10b981", admin: "#a855f7", moderator: "#3b82f6" };
    let acc = 0;
    const stops = stats.roleDistribution.map((r) => {
      const start = acc;
      acc += r.percentage;
      const color = colors[r.role as keyof typeof colors] || "#94a3b8";
      return `${color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [stats]);

  const roleTotal = useMemo(
    () => stats?.roleDistribution.reduce((sum, r) => sum + r.count, 0) || 0,
    [stats]
  );

  // Loading state - only show full page skeleton on initial load
  if (loading && !tableLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
            <div>
              <Skeleton width={180} height={28} className="mb-2" />
              <Skeleton width={250} height={14} />
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              <Skeleton width={80} height={32} />
              <Skeleton width={100} height={32} />
            </div>
          </div>

          {/* Scrollable Content Area - Skeleton */}
          <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
            {/* Summary Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <Skeleton width={36} height={36} borderRadius={8} />
                  </div>
                  <Skeleton width={90} height={14} className="mb-2" />
                  <Skeleton width={110} height={22} />
                </Card>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div>
                    <Skeleton width={100} height={14} className="mb-2" />
                    <Skeleton width={150} height={10} />
                  </div>
                </div>
                <div className="relative h-48 sm:h-60 flex items-end justify-between gap-1 sm:gap-6 px-2 border-b border-slate-50">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex h-full items-end flex-1 justify-center">
                      <Skeleton height={`${Math.random() * 60 + 40}%`} width={24} className="sm:w-8" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 sm:mt-4 px-2 sm:px-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} width={30} height={10} />
                  ))}
                </div>
              </Card>
              <Card className="p-4 sm:p-6">
                <Skeleton width={120} height={14} className="mb-2" />
                <Skeleton width={140} height={10} className="mb-4 sm:mb-6" />
                <Skeleton width={96} height={96} borderRadius="50%" className="mx-auto mb-4 sm:mb-6 sm:w-32 sm:h-32" />
                <div className="space-y-2 sm:space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton width={70} height={10} />
                      <Skeleton width={60} height={10} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Filters Skeleton */}
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
                <Skeleton width={50} height={14} />
                <Skeleton width={180} height={32} />
                <Skeleton width={500} height={32} className="flex-1" />
                <Skeleton width={70} height={28} />
              </div>
            </Card>

            {/* User Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton width={40} height={40} borderRadius="50%" />
                      <div>
                        <Skeleton width={110} height={14} className="mb-1" />
                        <Skeleton width={140} height={10} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Skeleton width={60} height={18} borderRadius={10} />
                      <Skeleton width={80} height={10} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton width={50} height={18} borderRadius={10} />
                    <div className="flex items-center gap-1">
                      <Skeleton width={32} height={32} borderRadius={4} />
                      <Skeleton width={32} height={32} borderRadius={4} />
                      <Skeleton width={32} height={32} borderRadius={4} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <UsersIcon size={40} className="text-red-400" />
        <p className="text-sm text-slate-600">{error}</p>
        <Button size="sm" onClick={refetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Manage user accounts, roles, and permissions.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex gap-2 order-1 w-full sm:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg flex-1 sm:flex-none">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setViewMode("table")}
              >
                <TableIcon size={14} className="mr-1" />
                Table
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 size={14} className="mr-1" />
                Grid
              </Button>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 order-2 w-full sm:w-auto" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} className="sm:mr-1" /> <span className="hidden sm:inline">Add User</span><span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryItems.map((item) => (
            <SummaryCard key={item.label} item={item} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* User Growth Chart */}
          <Card className="lg:col-span-2 p-4 sm:p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">User Growth</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">6-month registration trend.</p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <>
                <div className="relative h-48 sm:h-60 flex items-end justify-between gap-1 sm:gap-6 px-2 border-b border-slate-50">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                  </div>
                  {chartData.map((d) => (
                    <div key={d.month} className="flex h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                      <div
                        className="w-4 sm:w-6 md:w-8 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                        style={{ height: `${d.height}%` }}
                        onMouseEnter={() => setHoveredBar({ month: d.month, count: d.count })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      {hoveredBar && hoveredBar.month === d.month && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                          <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                          <div className="flex items-center gap-1">
                            <span>Users: {hoveredBar.count}</span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
                  {chartData.map((d, i) => (
                    <span key={d.month} className={`${i === chartData.length - 1 ? "text-slate-600" : ""} truncate`}>
                      <span className="hidden sm:inline">{d.month}</span>
                      <span className="sm:hidden">{d.month.slice(0, 3)}</span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 sm:h-60 text-center px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                  <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Growth Data</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                  User registration data will appear here.
                </p>
              </div>
            )}
          </Card>

          {/* Role Distribution */}
          <Card className="p-4 sm:p-6 flex flex-col bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group cursor-pointer">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Role Distribution</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">User roles breakdown.</p>
            </div>

            {stats?.roleDistribution.length ? (
              <>
                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex-shrink-0 relative"
                    style={{ background: roleGradient }}
                  >
                    <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Total</span>
                      <span className="text-sm sm:text-xl font-bold text-slate-900">{roleTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 flex-1">
                  {stats.roleDistribution.map((role) => (
                    <div key={role.role} className="flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                          style={{
                            backgroundColor:
                              role.role === "admin" ? "#a855f7" : role.role === "moderator" ? "#3b82f6" : "#10b981",
                          }}
                        />
                        <span className="text-slate-600 capitalize">{role.role}</span>
                      </div>
                      <span className="font-medium text-slate-900">{role.count} ({role.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-3 sm:mb-4">
                  <Shield size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Role Data</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm">
                  Role distribution will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group cursor-pointer">
          <div className="flex flex-col xl:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 w-full xl:w-auto">
              <Filter size={14} className="sm:w-4 sm:h-4" />
              <span className="font-medium">Filters</span>
            </div>
            <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

            <div className="relative w-full xl:w-64">
              <Search size={12} className="sm:w-[14px] sm:h-[14px] absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
              <FilterDropdown
                value={month === "all" ? "" : month.toString()}
                onChange={(value) => setMonth(value === "" ? "all" : Number(value))}
                options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
                placeholder="All Months"
                className="w-full text-slate-900 text-xs sm:text-sm"
                allowEmpty={true}
                emptyLabel="All Months"
                hideSearch={true}
              />
              <FilterDropdown
                value={year === "all" ? "" : year.toString()}
                onChange={(value) => setYear(value === "" ? "all" : Number(value))}
                options={Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => ({ value: y.toString(), label: y.toString() }))}
                placeholder="All Years"
                className="w-full text-slate-900 text-xs sm:text-sm"
                allowEmpty={true}
                emptyLabel="All Years"
                hideSearch={true}
              />
              <FilterDropdown
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: "user", label: "User" },
                  { value: "admin", label: "Admin" },
                ]}
                placeholder="All Roles"
                className="w-full text-xs sm:text-sm"
                allowEmpty={true}
                emptyLabel="All Roles"
                hideSearch={true}
              />
              <FilterDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                placeholder="All Status"
                className="w-full text-xs sm:text-sm"
                allowEmpty={true}
                emptyLabel="All Status"
                hideSearch={true}
              />
            </div>

            <div className="flex-1"></div>
            <div className="flex items-center gap-2 w-full xl:w-auto">
              <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset to Current Month" onClick={resetFilters}>
                <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> Current
              </Button>
              <Button variant="outline" size="sm" className="text-[10px] sm:text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={resetFiltersToAll}>
                <RotateCcw size={12} className="sm:w-[14px] sm:h-[14px]" /> All Time
              </Button>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && !loading && (
          <Card className="p-8 text-center bg-white border border-slate-200 rounded-xl">
            <p className="text-sm text-slate-600 mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RotateCcw size={14} /> Retry
            </Button>
          </Card>
        )}

        {/* Users Display */}
        {users.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-slate-200 rounded-xl">
            <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-sm font-semibold text-slate-700 mb-1">No users found</h3>
            <p className="text-xs text-slate-400 mb-4">
              {search ? "Try adjusting your search or filters." : "Add your first user to get started."}
            </p>
            {!search && (
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
                <Plus size={14} /> Add User
              </Button>
            )}
          </Card>
        ) : viewMode === "table" ? (
          <Card className="overflow-hidden bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group cursor-pointer">
            {tableLoading ? (
              <FilterTableSkeleton rows={pagination.pageSize} columns={5} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        User
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3">Role</TableHead>
                    <TableHead className="px-6 py-3">Status</TableHead>
                    <TableHead className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        Created
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Inbox size={32} className="text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">No users match your filters</p>
                          <Button size="sm" variant="outline" onClick={resetFilters} className="mt-2">
                            Clear Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <UserRow key={user.id} user={user} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        ) : tableLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: pagination.pageSize }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* User Cards Grid (Desktop) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.length === 0 ? (
                <div className="col-span-full">
                  <Card className="p-12 text-center bg-white border border-slate-200 rounded-xl">
                    <Inbox size={32} className="text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No users match your filters</p>
                    <Button size="sm" variant="outline" onClick={resetFilters} className="mt-2">
                      Clear Filters
                    </Button>
                  </Card>
                </div>
              ) : (
                users.map((user) => (
                  <UserCard key={user.id} user={user} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              )}
            </div>

            {/* User Cards Grid (Mobile) */}
            <div className="md:hidden space-y-4">
              {users.length === 0 ? (
                <Card className="p-12 text-center bg-white border border-slate-200 rounded-xl">
                  <Inbox size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No users match your filters</p>
                  <Button size="sm" variant="outline" onClick={resetFilters} className="mt-2">
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                users.map((user) => (
                  <UserCard key={user.id} user={user} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !tableLoading && !error && users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} users
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousPage}
                    disabled={!pagination.hasPreviousPage}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-[10px] sm:text-xs"
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
                    disabled={!pagination.hasNextPage}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                </div>
              )}
              <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pagination.pageSize === Number.MAX_SAFE_INTEGER ? "all" : pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                  className="text-xs sm:text-sm border border-slate-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
                <span className="hidden sm:inline">per page</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={refetch} />
      <ViewUserModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} user={selectedUser} onEdit={handleViewToEdit} />
      <EditUserModal open={editModalOpen} onClose={() => setEditModalOpen(false)} user={selectedUser} onSuccess={refetch} />
      <DeleteUserModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} user={selectedUser} onSuccess={refetch} />
    </div>
  );
}
