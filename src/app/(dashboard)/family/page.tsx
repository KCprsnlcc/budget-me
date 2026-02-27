"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Crown,
  Shield,
  Eye,
  Edit,
  MoreHorizontal,
  Mail,
  RefreshCw,
  Settings,
  LogOut,
  Home,
  Flag,
  Wallet,
  ShoppingBag,
  UserPlus,
  Filter,
  Clock,
  ChevronDown,
  UserCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  InviteMemberModal,
  CreateFamilyModal,
  EditFamilyModal,
  DeleteFamilyModal,
  LeaveFamilyModal,
  NoFamilyState,
  MembersTab,
  ActivityTab,
  GoalsTab,
} from "./_components";
import { FAMILY_TABS, ACTIVITY_FILTERS, GOAL_FILTERS } from "./_components/constants";
import type {
  FamilyMember,
  Family,
  SharedGoal,
  ActivityItem,
  JoinRequest,
  PublicFamily,
  Invitation,
  FamilyState,
  ActiveTab,
  NoFamilyTab,
  TabContentProps,
} from "./_components/types";
import { useFamily } from "./_lib/use-family";

export default function FamilyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Get active tab from URL query params, default to "overview"
  const activeTab = (searchParams.get("tab") as ActiveTab) || "overview";
  
  // Real Supabase data via useFamily hook
  const {
    familyState,
    familyData,
    familyId,
    members,
    goals,
    activities,
    pendingRequests,
    publicFamilies,
    invitations,
    joinRequests,
    overviewStats,
    expenseCategories,
    budgetVsActual,
    totalExpenses,
    goalsSavingsProgress,
    goalsHealth,
    totalGoals,
    currentUserRole,
    isOwner,
    loading,
    error,
    activitiesLoading,
    hasMoreActivities,
    mutating,
    refetch,
    loadMoreActivities,
    handleCreateFamily,
    handleUpdateFamily,
    handleDeleteFamily,
    handleLeaveFamily,
    handleSendInvitation,
    handleRespondToInvitation,
    handleSendJoinRequest,
    handleApproveRequest,
    handleDeclineRequest,
    handleUpdateRole,
    handleContributeToGoal,
  } = useFamily();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();
  const familyName = familyData?.name || "Family";
  const [activeGoalFilter, setActiveGoalFilter] = useState("all");
  const [hoveredBar, setHoveredBar] = useState<{ month: string; type: 'budget' | 'actual' | 'target' | 'saved'; value: number } | null>(null);
  
  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createFamilyModalOpen, setCreateFamilyModalOpen] = useState(false);
  const [editFamilyModalOpen, setEditFamilyModalOpen] = useState(false);
  const [deleteFamilyModalOpen, setDeleteFamilyModalOpen] = useState(false);
  const [leaveFamilyModalOpen, setLeaveFamilyModalOpen] = useState(false);
  const [tabSwitching, setTabSwitching] = useState(false);

  // Handle tab navigation with URL-based routing
  const handleTabChange = useCallback((tab: ActiveTab) => {
    if (tab === activeTab) return;
    
    setTabSwitching(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (tab === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    });
    
    // Simulate brief loading delay for tab switch (like Financial Insights refresh)
    setTimeout(() => {
      setTabSwitching(false);
    }, 600);
  }, [router, searchParams, activeTab]);

  // Handlers that open modals
  const handleOpenCreateFamily = useCallback(() => {
    setCreateFamilyModalOpen(true);
  }, []);

  const handleOpenInviteMember = useCallback(() => {
    setInviteModalOpen(true);
  }, []);

  const handleOpenEditFamily = useCallback(() => {
    setEditFamilyModalOpen(true);
  }, []);

  const handleOpenDeleteFamily = useCallback(() => {
    setDeleteFamilyModalOpen(true);
  }, []);

  const handleOpenLeaveFamily = useCallback(() => {
    setLeaveFamilyModalOpen(true);
  }, []);

  // Join family via request
  const handleJoinFamily = useCallback(async (targetFamilyId: string) => {
    await handleSendJoinRequest(targetFamilyId);
  }, [handleSendJoinRequest]);

  // Loading state - comprehensive skeleton
  if (loading || familyState === "loading") {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Skeleton width={250} height={32} className="mb-2" />
              <Skeleton width={350} height={16} />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton width={100} height={36} borderRadius={6} />
              <Skeleton width={120} height={36} borderRadius={6} />
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <Card className="overflow-hidden">
            <div className="flex border-b border-slate-200/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} width={100} height={48} className="flex-1" />
              ))}
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <Skeleton width={40} height={40} borderRadius={8} />
                    </div>
                    <Skeleton width={100} height={12} className="mb-2" />
                    <Skeleton width={80} height={24} />
                    <Skeleton width={120} height={10} className="mt-2" />
                  </Card>
                ))}
              </div>

              {/* Charts Section Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <Skeleton width={180} height={16} className="mb-6" />
                  <div className="flex items-center justify-center h-64">
                    <Skeleton width={192} height={192} borderRadius="50%" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton width={60} height={10} />
                        <Skeleton width={30} height={10} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <Skeleton width={200} height={16} className="mb-2" />
                      <Skeleton width={150} height={12} />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton width={60} height={12} />
                      <Skeleton width={60} height={12} />
                    </div>
                  </div>
                  <Skeleton height={240} borderRadius={8} />
                  <div className="flex justify-between mt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} width={30} height={12} />
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  // Error state
  if (familyState === "error" && error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <Users className="text-rose-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  // No family state - ALWAYS redirect/show no-family state component
  if (familyState === "no-family") {
    return (
      <NoFamilyState 
        onCreateFamily={handleOpenCreateFamily}
        onJoinFamily={handleJoinFamily}
        onCheckInvitations={refetch}
        publicFamilies={publicFamilies}
        invitations={invitations}
        joinRequests={joinRequests}
        isLoading={mutating}
        onRespondToInvitation={handleRespondToInvitation}
        onSendJoinRequest={handleSendJoinRequest}
      />
    );
  }

  // User has a family - render family dashboard
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header with Family Greeting */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {familyName} Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-light">
              Manage family members and shared finances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleOpenEditFamily}>
              <Settings size={16} className="mr-1" /> Settings
            </Button>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleOpenInviteMember}>
              <Mail size={16} className="mr-1" /> Invite Member
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Invitation Alert */}
      {invitations.length > 0 && (
      <Card className="p-0.5 relative overflow-hidden group">
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
                You have been invited by <span className="text-slate-600 font-medium">{invitations[0].inviterEmail}</span> to join the <span className="text-slate-600 font-medium">{invitations[0].familyName}</span> dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto pl-14 sm:pl-0">
            <Button variant="ghost" size="sm" onClick={() => handleRespondToInvitation(invitations[0].id, false)}>Decline</Button>
            <Button size="sm" onClick={() => handleRespondToInvitation(invitations[0].id, true)}>Accept Invitation</Button>
          </div>
        </div>
      </Card>
      )}

      {/* Tab Navigation */}
      <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex border-b border-slate-200/60 overflow-x-auto">
          <button 
            onClick={() => handleTabChange("overview")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => handleTabChange("members")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "members"
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Members
          </button>
          <button 
            onClick={() => handleTabChange("activity")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "activity"
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Activity
          </button>
          <button 
            onClick={() => handleTabChange("goals")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "goals"
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Goals
          </button>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === "overview" && (
            tabSwitching ? (
              <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                <div className="space-y-6">
                  {/* Summary Cards Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <Skeleton width={40} height={40} borderRadius={8} />
                        </div>
                        <Skeleton width={100} height={12} className="mb-2" />
                        <Skeleton width={80} height={24} />
                        <Skeleton width={120} height={10} className="mt-2" />
                      </Card>
                    ))}
                  </div>

                  {/* Charts Section Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <Skeleton width={180} height={16} className="mb-6" />
                      <div className="flex items-center justify-center h-64">
                        <Skeleton width={192} height={192} borderRadius="50%" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <Skeleton width={60} height={10} />
                            <Skeleton width={30} height={10} />
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6 lg:col-span-2">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <Skeleton width={200} height={16} className="mb-2" />
                          <Skeleton width={150} height={12} />
                        </div>
                        <div className="flex gap-4">
                          <Skeleton width={60} height={12} />
                          <Skeleton width={60} height={12} />
                        </div>
                      </div>
                      <Skeleton height={240} borderRadius={8} />
                      <div className="flex justify-between mt-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} width={30} height={12} />
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </SkeletonTheme>
            ) : (
            <div className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Users size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Family Members</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">{overviewStats?.totalMembers ?? 0}</div>
              <div className="text-[10px] text-emerald-600 mt-1">{overviewStats?.activeMembers ?? 0} active, {overviewStats?.pendingMembers ?? 0} pending</div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Wallet size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Goals Saved</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">₱{(overviewStats?.totalGoalsSaved ?? 0).toLocaleString()}</div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <ShoppingBag size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Goals Target</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">₱{(overviewStats?.totalGoalsTarget ?? 0).toLocaleString()}</div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Flag size={22} strokeWidth={1.5} />
                </div>
                {(overviewStats?.goalsProgress ?? 0) > 0 && (
                <div className="text-[10px] font-medium text-purple-700 border-purple-100 px-2 py-1 rounded-full border">
                  {overviewStats?.goalsProgress}%
                </div>
                )}
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Shared Goals</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">{overviewStats?.totalGoals ?? 0}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${overviewStats?.goalsProgress ?? 0}%` }} />
              </div>
            </Card>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Family Goals Health */}
            {goalsHealth.length > 0 ? (
              <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Family Goals Health</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-light">Track your family goal completion status</p>
                </div>
                <div className="flex items-center justify-center h-64">
                  <div 
                    className="relative w-48 h-48 rounded-full shadow-inner"
                    style={{
                      background: (() => {
                        if (goalsHealth.length === 0) return "conic-gradient(#e2e8f0 0% 100%)";
                        const total = goalsHealth.reduce((s, c) => s + c.value, 0);
                        if (total === 0) return "conic-gradient(#e2e8f0 0% 100%)";
                        let acc = 0;
                        const stops = goalsHealth.map((c) => {
                          const start = acc;
                          acc += (c.value / total) * 100;
                          return `${c.color} ${start}% ${acc}%`;
                        });
                        return `conic-gradient(${stops.join(", ")})`;
                      })()
                    }}
                  >
                    <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
                      <span className="text-xl font-bold text-slate-900">{totalGoals}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
                  {goalsHealth.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-slate-600 truncate max-w-[80px]">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-900">{Math.round((item.value / (totalGoals || 1)) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Family Goals Health</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-light">Track your family goal completion status</p>
                </div>
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                    <Flag size={24} />
                  </div>
                  <h4 className="text-sm font-medium text-slate-800 mb-1">No Family Goals Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Create family goals to track your progress and see your goal completion status.
                  </p>
                  <Button size="sm" variant="outline">
                    Create Family Goal
                  </Button>
                </div>
              </Card>
            )}

            {/* Family Goals Savings Progress Chart */}
            <Card className="p-6 lg:col-span-2 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Family Goals Savings Progress</h3>
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

              {goalsSavingsProgress.length > 0 ? (
                <>
                  <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="w-full h-px bg-slate-100/50" />
                      <div className="w-full h-px bg-slate-100/50" />
                      <div className="w-full h-px bg-slate-100/50" />
                      <div className="w-full h-px bg-slate-100/50" />
                      <div className="w-full h-px bg-slate-100/50" />
                    </div>
                    {goalsSavingsProgress.map((data) => (
                      <div key={data.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                        <div
                          className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                          style={{ height: `${data.target}%` }}
                          onMouseEnter={() => setHoveredBar({ month: data.month, type: 'target', value: data.targetValue })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        <div
                          className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                          style={{ height: `${data.saved}%` }}
                          onMouseEnter={() => setHoveredBar({ month: data.month, type: 'saved', value: data.savedValue })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        
                        {/* Tooltip */}
                        {hoveredBar && hoveredBar.month === data.month && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-xs rounded shadow-sm whitespace-nowrap z-50">
                            <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${hoveredBar.type === 'target' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                              <span className="capitalize">{hoveredBar.type}: ₱{hoveredBar.value.toLocaleString()}</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                    {goalsSavingsProgress.map((data) => (
                      <span key={data.month} className={data.month === new Date().toLocaleDateString("en-US", { month: "short" }) ? 'text-slate-600' : ''}>
                        {data.month}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="text-sm font-medium text-slate-800 mb-1">No Family Goals Data</h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Create family goals and track your savings over time to see your target vs saved progress.
                  </p>
                  <Button size="sm" variant="outline">
                    Create Family Goal
                  </Button>
                </div>
              )}
            </Card>
          </div>
            </div>
          ))}
          
          {activeTab === "members" && (
            <MembersTab
              familyData={familyData}
              members={members}
              pendingRequests={pendingRequests}
              publicFamilies={publicFamilies}
              onUpdateRole={(memberId, role) => handleUpdateRole(memberId, role)}
              onApproveRequest={(requestId) => handleApproveRequest(requestId)}
              onDeclineRequest={(requestId) => handleDeclineRequest(requestId)}
              onEditFamily={handleOpenEditFamily}
              onDeleteFamily={handleOpenDeleteFamily}
              onLeaveFamily={handleOpenLeaveFamily}
              onJoinFamily={(targetFamilyId) => handleJoinFamily(targetFamilyId)}
              onRefreshFamilies={refetch}
              onSendInvitation={handleSendInvitation}
              onUpdateFamily={handleUpdateFamily}
              onDeleteFamilyConfirm={handleDeleteFamily}
              onLeaveFamilyConfirm={handleLeaveFamily}
              isLoading={tabSwitching}
            />
          )}
          
          {activeTab === "activity" && (
            <ActivityTab
              activities={activities}
              onLoadMore={loadMoreActivities}
              hasMore={hasMoreActivities}
              isLoading={activitiesLoading || tabSwitching}
            />
          )}
          
          {activeTab === "goals" && (
            <GoalsTab
              goals={goals}
              onFilter={(filter) => setActiveGoalFilter(filter)}
              activeFilter={activeGoalFilter}
              onContributeGoal={(goalId) => handleContributeToGoal(goalId, 0)}
              onViewGoal={(goalId) => {}}
              isLoading={tabSwitching}
            />
          )}
        </div>
      </Card>

      {/* Discover Families Section */}
      {publicFamilies.length > 0 && (
      <Card className="p-6 mb-8 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Discover Families</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Find and join other public family groups in your network</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs h-9 px-4">
              <ArrowRight size={14} />
              View More
            </Button>
            <Button size="sm" onClick={refetch} className="text-xs h-9 px-4 bg-emerald-500 hover:bg-emerald-600">
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicFamilies.map((family) => (
            <Card
              key={family.id}
              className="p-5 hover:shadow-md transition-all group h-full cursor-pointer"
              onClick={() => handleJoinFamily(family.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center text-slate-600 transition-colors group-hover:scale-110">
                    <Home size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{family.name}</h4>
                    <p className="text-[10px] text-slate-500">Created by {family.createdBy}</p>
                  </div>
                </div>
                <Badge className="text-[9px] flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200">
                  <Users size={12} />
                  {family.memberCount} members
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mb-4 font-light leading-relaxed">
                {family.description ? `"${family.description}"` : "A public family group open for new members."}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[9px] text-slate-400">
                  Public • Created {new Date(family.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <Button
                  size="sm"
                  className="text-xs py-1.5 bg-emerald-500 hover:bg-emerald-600"
                >
                  Request Join
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
      )}

      {/* Modals */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSendInvitation={handleSendInvitation}
      />
      <CreateFamilyModal
        open={createFamilyModalOpen}
        onClose={() => setCreateFamilyModalOpen(false)}
        onCreateFamily={handleCreateFamily}
      />
      <EditFamilyModal
        open={editFamilyModalOpen}
        onClose={() => setEditFamilyModalOpen(false)}
        onDeleteFamily={handleOpenDeleteFamily}
        onUpdateFamily={handleUpdateFamily}
        familyData={familyData}
      />
      <DeleteFamilyModal
        open={deleteFamilyModalOpen}
        onClose={() => setDeleteFamilyModalOpen(false)}
        onConfirm={handleDeleteFamily}
      />
      <LeaveFamilyModal
        open={leaveFamilyModalOpen}
        onClose={() => setLeaveFamilyModalOpen(false)}
        onConfirm={handleLeaveFamily}
      />
    </div>
  );
}
