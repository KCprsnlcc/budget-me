"use client";

import React, { useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
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
    overviewStats,
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

  // UI tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [activeGoalFilter, setActiveGoalFilter] = useState("all");
  
  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createFamilyModalOpen, setCreateFamilyModalOpen] = useState(false);
  const [editFamilyModalOpen, setEditFamilyModalOpen] = useState(false);
  const [deleteFamilyModalOpen, setDeleteFamilyModalOpen] = useState(false);
  const [leaveFamilyModalOpen, setLeaveFamilyModalOpen] = useState(false);

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

  // Loading state
  if (loading || familyState === "loading") {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-24 animate-fade-in">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
        <span className="ml-3 text-sm text-slate-500">Loading family data...</span>
      </div>
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {familyState === "no-family" ? (
        <NoFamilyState 
          onCreateFamily={handleOpenCreateFamily}
          onJoinFamily={handleJoinFamily}
          onCheckInvitations={refetch}
          publicFamilies={publicFamilies}
          invitations={invitations}
          isLoading={mutating}
          onRespondToInvitation={handleRespondToInvitation}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Family Dashboard
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
            onClick={() => setActiveTab(FAMILY_TABS.OVERVIEW)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === FAMILY_TABS.OVERVIEW 
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab(FAMILY_TABS.MEMBERS)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === FAMILY_TABS.MEMBERS 
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Members
          </button>
          <button 
            onClick={() => setActiveTab(FAMILY_TABS.ACTIVITY)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === FAMILY_TABS.ACTIVITY 
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Activity
          </button>
          <button 
            onClick={() => setActiveTab(FAMILY_TABS.GOALS)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === FAMILY_TABS.GOALS 
                ? "text-emerald-600 border-emerald-500" 
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            Goals
          </button>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === FAMILY_TABS.OVERVIEW && (
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
            {/* Expense Categories */}
            {(overviewStats?.totalGoalsSaved ?? 0) > 0 ? (
              <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Family Expense Categories</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-light">Spending breakdown by category</p>
                </div>
                <div className="flex items-center justify-center h-64">
                  <div className="relative w-48 h-48 rounded-full shadow-inner"
                    style={{ background: 'conic-gradient(#10b981 0% 35%, #3b82f6 35% 59%, #8b5cf6 59% 77%, #f59e0b 77% 92%, #94a3b8 92% 100%)' }}>
                    <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
                      <span className="text-xl font-bold text-slate-900">₱{(overviewStats?.totalGoalsSaved ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-600">Groceries</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-900">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-slate-600">Utilities</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-900">24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-[10px] text-slate-600">Entertainment</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-900">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] text-slate-600">Transport</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-900">15%</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Family Expense Categories</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-light">Spending breakdown by category</p>
                </div>
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Wallet className="text-slate-400" size={32} />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">No Spending Data Yet</h4>
                  <p className="text-xs text-slate-500">
                    Start adding transactions to see your family's spending breakdown.
                  </p>
                </div>
              </Card>
            )}

            {/* Budget vs Actual Chart */}
            <Card className="p-6 lg:col-span-2 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Budget vs Actual Spending</h3>
                  <p className="text-xs text-slate-500 mt-1 font-light">6-month comparison</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-slate-200" />
                    <span className="text-[10px] font-medium text-slate-500">Budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-[10px] font-medium text-slate-500">Actual</span>
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-4 px-2 border-b border-slate-100 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                  <div className="w-full h-px bg-slate-100/50" />
                </div>
                {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, index) => (
                  <div key={month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer">
                    <div
                      className="w-3 sm:w-5 bg-slate-200 rounded-t-[2px] transition-all hover:opacity-100"
                      style={{ height: `${60 + index * 8}%` }}
                    />
                    <div
                      className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100"
                      style={{ height: `${50 + index * 6}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month) => (
                  <span key={month} className={month === 'Oct' ? 'text-slate-600' : ''}>
                    {month}
                  </span>
                ))}
              </div>
            </Card>
          </div>
            </div>
            )}
          
          {activeTab === FAMILY_TABS.MEMBERS && (
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
            />
          )}
          
          {activeTab === FAMILY_TABS.ACTIVITY && (
            <ActivityTab
              activities={activities}
              onLoadMore={loadMoreActivities}
              hasMore={hasMoreActivities}
              isLoading={activitiesLoading}
            />
          )}
          
          {activeTab === FAMILY_TABS.GOALS && (
            <GoalsTab
              goals={goals}
              onFilter={(filter) => setActiveGoalFilter(filter)}
              activeFilter={activeGoalFilter}
              onContributeGoal={(goalId) => handleContributeToGoal(goalId, 0)}
              onViewGoal={(goalId) => {}}
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
        </>
      )}
    </div>
  );
}
