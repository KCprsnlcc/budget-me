"use client";

import React, { useState, useCallback, useEffect, useTransition, useRef } from "react";
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
  User,
  ArrowRight,
  TrendingUp,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  InviteMemberModal,
  CreateFamilyModal,
  EditFamilyModal,
  DeleteFamilyModal,
  LeaveFamilyModal,
  JoinFamilyModal,
  NoFamilyState,
  MembersTab,
  ActivityTab,
  GoalsTab,
  OwnershipNotice,
  TransferOwnershipModal,
} from "./_components";
import { FAMILY_TABS, ACTIVITY_FILTERS, GOAL_FILTERS } from "./_components/constants";
import { useAuth } from "@/components/auth/auth-context";
import { formatRelativeTime } from "./_lib/family-service";
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

  const activeTab = (searchParams.get("tab") as ActiveTab) || "overview";

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
    activityCurrentPage,
    activityPageSize,
    activityTotalCount,
    handleActivityPageChange,
    handleActivityPageSizeChange,
    refetch,
    refreshGoals,
    refreshDiscoverFamilies,
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
    handleRemoveMember,
    handleTransferOwnership,

    handleCreateFamilyGoal,
    handleUpdateFamilyGoal,
    handleDeleteFamilyGoal,
  } = useFamily();

  const { user } = useAuth();
  const currentUserMember = members.find(m => m.email === user?.email);

  const canInviteMembers = currentUserRole === "Owner" || currentUserRole === "Admin";
  const canEditFamily = currentUserRole === "Owner" || currentUserRole === "Admin";
  const canDeleteFamily = currentUserRole === "Owner";

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
  const [mobileChartTab, setMobileChartTab] = useState<'health' | 'savings'>('health');

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createFamilyModalOpen, setCreateFamilyModalOpen] = useState(false);
  const [editFamilyModalOpen, setEditFamilyModalOpen] = useState(false);
  const [deleteFamilyModalOpen, setDeleteFamilyModalOpen] = useState(false);
  const [leaveFamilyModalOpen, setLeaveFamilyModalOpen] = useState(false);
  const [joinFamilyModalOpen, setJoinFamilyModalOpen] = useState(false);
  const [transferOwnershipModalOpen, setTransferOwnershipModalOpen] = useState(false);
  const [selectedFamilyForJoin, setSelectedFamilyForJoin] = useState<PublicFamily | null>(null);
  const [tabSwitching, setTabSwitching] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

    setTimeout(() => {
      setTabSwitching(false);
    }, 600);
  }, [router, searchParams, activeTab]);

  const handleRefreshDiscover = useCallback(async () => {
    setDiscoverLoading(true);
    await refreshDiscoverFamilies();
    setDiscoverLoading(false);
  }, [refreshDiscoverFamilies]);

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

  const handleOpenTransferOwnership = useCallback(() => {
    setTransferOwnershipModalOpen(true);
  }, []);

  const handleJoinFamily = useCallback((familyId: string) => {
    const family = publicFamilies.find(f => f.id === familyId);
    if (family) {
      setSelectedFamilyForJoin(family);
      setJoinFamilyModalOpen(true);
    }
  }, [publicFamilies]);

  if (loading || familyState === "loading") {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {}
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

          {}
          <Card className="overflow-hidden">
            <div className="flex border-b border-slate-200/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} width={100} height={48} className="flex-1" />
              ))}
            </div>

            <div className="p-6 space-y-6">
              {}
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

              {}
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

  if (familyState === "error" && error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-24 animate-fade-in">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Users className="text-rose-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  if (familyState === "no-family") {
    return (
      <>
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
          handleCreateFamily={handleCreateFamily}
        />
        
        {}
        <CreateFamilyModal
          open={createFamilyModalOpen}
          onClose={() => setCreateFamilyModalOpen(false)}
          onCreateFamily={handleCreateFamily}
        />
        <JoinFamilyModal
          open={joinFamilyModalOpen}
          onClose={() => setJoinFamilyModalOpen(false)}
          family={selectedFamilyForJoin}
          onSendRequest={handleSendJoinRequest}
        />
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {}
      <div className="flex flex-col gap-2 px-4 sm:px-0 pt-4 sm:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              {familyName} Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
              Manage family members and shared finances
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {canEditFamily && (
              <Button variant="outline" size="sm" onClick={handleOpenEditFamily} className="w-full sm:w-auto">
                <Settings size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            )}
            {canInviteMembers && (
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto" onClick={handleOpenInviteMember}>
                <Mail size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Invite Member</span>
                <span className="sm:hidden">Invite</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {}
      {invitations.length > 0 && (
        <Card className="p-0.5 relative overflow-hidden group mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="bg-white rounded-[10px] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 flex items-center justify-center text-emerald-500 shrink-0">
                <Users size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-slate-800 flex items-center gap-2">
                  Pending Invitation
                  <span className="text-emerald-600 text-[10px]">New</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                  You have been invited by <span className="text-slate-600 font-medium">{invitations[0].inviterEmail}</span> to join the <span className="text-slate-600 font-medium">{invitations[0].familyName}</span> dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto pl-11 sm:pl-0">
              <Button variant="ghost" size="sm" className="text-xs flex-1 sm:flex-none" onClick={() => handleRespondToInvitation(invitations[0].id, false)}>Decline</Button>
              <Button size="sm" className="text-xs flex-1 sm:flex-none" onClick={() => handleRespondToInvitation(invitations[0].id, true)}>Accept Invitation</Button>
            </div>
          </div>
        </Card>
      )}

      {}
      <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer mb-4 sm:mb-6">
        <div className="flex border-b border-slate-200/60 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "overview"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-500 hover:text-slate-700 border-transparent"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange("members")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "members"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-500 hover:text-slate-700 border-transparent"
              }`}
          >
            Members
          </button>
          <button
            onClick={() => handleTabChange("activity")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "activity"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-500 hover:text-slate-700 border-transparent"
              }`}
          >
            Activity
          </button>
          <button
            onClick={() => handleTabChange("goals")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "goals"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-500 hover:text-slate-700 border-transparent"
              }`}
          >
            Goals
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {}
          {activeTab === "overview" && (
            tabSwitching ? (
              <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                <div className="space-y-6">
                  {}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="p-4 sm:p-5">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <Skeleton width={36} height={36} borderRadius={8} className="sm:w-10 sm:h-10" />
                        </div>
                        <Skeleton width={100} height={12} className="mb-2" />
                        <Skeleton width={80} height={24} />
                        <Skeleton width={120} height={10} className="mt-2" />
                      </Card>
                    ))}
                  </div>

                  {}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="p-4 sm:p-6">
                      <Skeleton width={160} height={16} className="mb-4 sm:mb-6" />
                      <div className="flex items-center justify-center h-48 sm:h-64">
                        <Skeleton width={160} height={160} borderRadius="50%" className="sm:w-48 sm:h-48" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <Skeleton width={50} height={10} className="sm:w-16" />
                            <Skeleton width={24} height={10} />
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4 sm:p-6 lg:col-span-2">
                      <div className="flex items-center justify-between mb-4 sm:mb-8">
                        <div>
                          <Skeleton width={160} height={16} className="mb-2" />
                          <Skeleton width={120} height={12} />
                        </div>
                        <div className="flex gap-4">
                          <Skeleton width={50} height={12} className="hidden sm:block" />
                          <Skeleton width={50} height={12} className="hidden sm:block" />
                        </div>
                      </div>
                      <Skeleton height={180} borderRadius={8} className="sm:h-60" />
                      <div className="flex justify-between mt-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} width={24} height={12} className="sm:w-8" />
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </SkeletonTheme>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="text-slate-500">
                        <Users size={20} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                    </div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Family Members</div>
                    <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{overviewStats?.totalMembers ?? 0}</div>
                    <div className="text-[10px] text-emerald-600 mt-1">{overviewStats?.activeMembers ?? 0} active, {overviewStats?.pendingMembers ?? 0} pending</div>
                  </Card>

                  <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="text-slate-500">
                        <Wallet size={20} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                    </div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Goals Saved</div>
                    <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">₱{(overviewStats?.totalGoalsSaved ?? 0).toLocaleString()}</div>
                  </Card>

                  <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="text-slate-500">
                        <ShoppingBag size={20} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                    </div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Goals Target</div>
                    <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">₱{(overviewStats?.totalGoalsTarget ?? 0).toLocaleString()}</div>
                  </Card>

                  <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="text-slate-500">
                        <Flag size={20} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                      </div>
                      {(overviewStats?.goalsProgress ?? 0) > 0 && (
                        <span className="text-[10px] font-medium text-purple-700">
                          {overviewStats?.goalsProgress}%
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Shared Goals</div>
                    <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{overviewStats?.totalGoals ?? 0}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${overviewStats?.goalsProgress ?? 0}%` }} />
                    </div>
                  </Card>
                </div>

                {}
                <div className="flex p-1 bg-slate-100 rounded-lg lg:hidden mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex-1 text-xs transition-colors ${
                      mobileChartTab === 'health' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    onClick={() => setMobileChartTab('health')}
                  >
                    Goals Health
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex-1 text-xs transition-colors ${
                      mobileChartTab === 'savings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    onClick={() => setMobileChartTab('savings')}
                  >
                    Savings Progress
                  </Button>
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {}
                  {goalsHealth.length > 0 ? (
                    <Card className={`p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer ${mobileChartTab === 'savings' ? 'hidden lg:block' : ''}`}>
                      <div className="mb-4">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Family Goals Health</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Track your family goal completion status</p>
                      </div>
                      <div className="flex items-center justify-center h-48 sm:h-64">
                        <div
                          className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-inner"
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
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-2 mt-4 sm:mt-6">
                        {goalsHealth.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-[10px] text-slate-600 truncate max-w-[60px] sm:max-w-[80px]">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-900">{Math.round((item.value / (totalGoals || 1)) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : (
                    <Card className={`p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer ${mobileChartTab === 'savings' ? 'hidden lg:block' : ''}`}>
                      <div className="mb-4">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Family Goals Health</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Track your family goal completion status</p>
                      </div>
                      <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-400 mb-4">
                          <Flag size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-medium text-slate-800 mb-1">No Family Goals Yet</h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm mb-4">
                          Create family goals to track your progress and see your goal completion status.
                        </p>
                        <Button size="sm" variant="outline" className="text-xs">
                          Create Family Goal
                        </Button>
                      </div>
                    </Card>
                  )}

                  {}
                  <Card className={`p-4 sm:p-6 lg:col-span-2 hover:shadow-md transition-all group cursor-pointer ${mobileChartTab === 'health' ? 'hidden lg:block' : ''}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8">
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Family Goals Savings Progress</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Target vs Saved over last 6 months</p>
                      </div>
                      <div className="flex gap-3 mt-2 sm:mt-0">
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

                              {}
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
                        <div className="w-12 h-12 flex items-center justify-center text-slate-400 mb-4">
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
              onEditFamily={canEditFamily ? handleOpenEditFamily : undefined}
              onDeleteFamily={canDeleteFamily ? handleOpenDeleteFamily : undefined}
              onLeaveFamily={handleOpenLeaveFamily}
              onJoinFamily={(targetFamilyId) => handleJoinFamily(targetFamilyId)}
              onRefreshFamilies={refetch}
              onSendInvitation={handleSendInvitation}
              onUpdateFamily={handleUpdateFamily}
              onDeleteFamilyConfirm={handleDeleteFamily}
              onLeaveFamilyConfirm={handleLeaveFamily}
              onRespondToInvitation={handleRespondToInvitation}
              onRemoveMember={handleRemoveMember}
              onTransferOwnership={handleTransferOwnership}
              invitations={invitations}
              isLoading={tabSwitching}
            />
          )}

          {activeTab === "activity" && (
            <ActivityTab
              activities={activities}
              totalCount={activityTotalCount}
              onLoadMore={loadMoreActivities}
              hasMore={hasMoreActivities}
              isLoading={activitiesLoading || tabSwitching}
              currentUser={user}
              familyId={familyId}
              currentPage={activityCurrentPage}
              pageSize={activityPageSize}
              onPageChange={handleActivityPageChange}
              onPageSizeChange={handleActivityPageSizeChange}
            />
          )}

          {activeTab === "goals" && (
            <GoalsTab
              goals={goals}
              onFilter={(filter) => setActiveGoalFilter(filter)}
              activeFilter={activeGoalFilter}
              onContributeGoal={(goalId, amount) => handleContributeToGoal(goalId, amount)}
              onDeleteGoal={(goalId) => handleDeleteFamilyGoal(goalId)}
              onViewGoal={(goalId) => { }}
              isLoading={tabSwitching}
              onRefreshGoals={refetch}
              currentUserRole={currentUserRole}
              isOwner={isOwner}
              currentUserId={user?.id}
            />
          )}
        </div>
      </Card>

      {}
      {!isOwner && (
        <div className="px-4 sm:px-0">
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Discover Families</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Find and join other public family groups in your network</p>
                </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                className="text-slate-400 hover:text-slate-600 text-xs"
                onClick={handleRefreshDiscover}
                disabled={discoverLoading}
              >
                <RefreshCw size={12} className={discoverLoading ? 'animate-spin' : ''} />
                {discoverLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          <div className="relative mb-6 sm:mb-8">
            <Search
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="Find by name or group ID..."
            />
          </div>

          {discoverLoading ? (

            <div className="space-y-6 sm:space-y-8">
              {}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton width={140} height={14} className="sm:w-[180px] sm:h-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Skeleton circle width={32} height={32} className="sm:w-10 sm:h-10" />
                          <div>
                            <Skeleton width={100} height={12} className="mb-1 sm:w-[120px]" />
                            <Skeleton width={60} height={10} className="sm:w-20" />
                          </div>
                        </div>
                        <Skeleton width={50} height={20} borderRadius={4} />
                      </div>
                      <Skeleton width="100%" height={10} className="mb-3 sm:h-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton width={60} height={10} />
                        <Skeleton width={50} height={10} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 mb-4">
                  <Skeleton width={80} height={10} className="sm:w-[100px]" />
                  <Skeleton width={30} height={10} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Skeleton width={14} height={14} className="sm:w-4 sm:h-4" />
                          <div>
                            <Skeleton width={100} height={12} className="mb-1 sm:w-[120px]" />
                            <Skeleton width={60} height={10} className="sm:w-20" />
                          </div>
                        </div>
                        <Skeleton width={45} height={24} borderRadius={4} />
                      </div>
                      <Skeleton width="100%" height={10} className="mb-3 sm:h-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton circle width={16} height={16} className="sm:w-5 sm:h-5" />
                          <Skeleton width={60} height={10} className="sm:w-20" />
                        </div>
                        <Skeleton width={50} height={14} borderRadius={10} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {}
          {joinRequests.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Your Join Requests ({joinRequests.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {joinRequests.map((request) => (
                  <Card key={request.family_id} className="p-3 sm:p-4 border border-slate-200 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {request.createdByAvatar ? (
                          <img
                            src={request.createdByAvatar}
                            alt={request.createdBy}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400">
                            <Users size={16} className="sm:w-5 sm:h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-slate-900">{request.families?.family_name}</h4>
                          <p className="text-[10px] text-slate-500">
                            Requested {formatRelativeTime(request.requestedAt)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-600">
                        Pending
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-3 line-clamp-2">
                      {request.families?.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <User size={10} className="sm:w-3 sm:h-3" />
                        <span>{request.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={10} className="sm:w-3 sm:h-3" />
                        <span>{request.memberCount} members</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Available Groups
              </span>
              <span className="text-[10px] text-emerald-500 font-medium">
                {publicFamilies.filter(f => !joinRequests.some(req => req.family_id === f.id)).length} groups
              </span>
            </div>
            {publicFamilies.filter(f => !joinRequests.some(req => req.family_id === f.id)).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {publicFamilies.filter(f => !joinRequests.some(req => req.family_id === f.id)).map((family) => (
                  <Card key={family.id} className="p-3 sm:p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <Home size={14} className="sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-slate-900">{family.name}</h4>
                          <p className="text-[10px] text-slate-500">
                            {family.memberCount} active members
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="text-[10px] sm:text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-md transition-shadow h-7 sm:h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinFamily(family.id);
                        }}
                      >
                        Join
                      </Button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-3 line-clamp-2">
                      {family.description || "Join this family group to collaborate on finances"}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {family.creatorAvatar ? (
                          <img
                            src={family.creatorAvatar}
                            alt={family.createdBy}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[6px] sm:text-[8px] font-medium text-slate-400">
                            {family.createdBy.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <span>Created by {family.createdBy}</span>
                      </div>
                      <span className="text-slate-400">
                        Public
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <Search className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" size={24} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No More Groups Available</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                  You've requested to join all available public groups. Wait for approval or create your own family.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button onClick={handleOpenCreateFamily} className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9">
                    <Plus size={14} className="sm:w-4 sm:h-4"/>
                    Create Family
                  </Button>
                  <Button variant="outline" onClick={refetch} className="text-xs sm:text-sm h-8 sm:h-9">
                    <RefreshCw size={14} className="sm:w-4 sm:h-4"/>
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>

              <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-50 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  Can't find your group? Check the ID or ask your admin.
                </p>
              </div>
            </>
          )}
            </div>
          </Card>
        </div>
      )}
      {isOwner && (
        <OwnershipNotice
          familyData={familyData}
          onTransferOwnership={handleOpenTransferOwnership}
          onLeaveFamily={handleOpenLeaveFamily}
        />
      )}

      {}
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
        onDeleteFamily={canDeleteFamily ? handleOpenDeleteFamily : undefined}
        onUpdateFamily={handleUpdateFamily}
        familyData={familyData}
        canDeleteFamily={canDeleteFamily}
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
        familyMembers={members}
        currentUserId={user?.id || ""}
        currentUserRole={currentUserMember?.role || ""}
      />
      <TransferOwnershipModal
        open={transferOwnershipModalOpen}
        onClose={() => setTransferOwnershipModalOpen(false)}
        onConfirm={handleTransferOwnership}
        familyMembers={members}
        currentOwnerId={user?.id || ""}
      />
      <JoinFamilyModal
        open={joinFamilyModalOpen}
        onClose={() => setJoinFamilyModalOpen(false)}
        family={selectedFamilyForJoin}
        onSendRequest={handleSendJoinRequest}
      />
    </div>
  );
}
