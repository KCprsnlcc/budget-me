"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Users,
  Plus,
  Crown,
  Shield,
  Eye,
  Edit,
  MoreHorizontal,
  Mail,
  Settings,
  LogOut,
  Home,
  Target,
  Wallet,
  Flag,
  UserPlus,
  Filter,
  Clock,
  ChevronDown,
  UserCheck,
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

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "m1",
    name: "John Doe",
    email: "john@budgetme.site",
    initials: "JD",
    role: "Owner",
    status: "active",
    lastActive: "Now",
    permissions: ["Full Access"],
    spending: 3200,
    budget: 5000,
  },
  {
    id: "m2",
    name: "Sarah Doe",
    email: "sarah@budgetme.site",
    initials: "SD",
    role: "Admin",
    status: "active",
    lastActive: "2h ago",
    permissions: ["View", "Edit", "Budget"],
    spending: 1800,
    budget: 3000,
  },
  {
    id: "m3",
    name: "Mike Doe",
    email: "mike@budgetme.site",
    initials: "MD",
    role: "Member",
    status: "active",
    lastActive: "1d ago",
    permissions: ["View", "Add Transactions"],
    spending: 450,
    budget: 800,
  },
  {
    id: "m4",
    name: "Emma Doe",
    email: "emma@budgetme.site",
    initials: "ED",
    role: "Viewer",
    status: "pending",
    lastActive: "Invited",
    permissions: ["View Only"],
    spending: 0,
    budget: 500,
  },
];

// Mock data - In real app, this would come from API calls
const FAMILY_DATA: Family = {
  id: "family-1",
  name: "Doe Family",
  description: "Managing our household finances together",
  type: "private",
  currency: "PHP",
  members: FAMILY_MEMBERS,
  createdAt: "2025-01-15",
  createdBy: "john@budgetme.app",
};

const SHARED_GOALS: SharedGoal[] = [
  {
    id: "goal-1",
    name: "Emergency Fund",
    saved: 8500,
    target: 10000,
    members: 4,
    createdAt: "2025-01-15",
    targetDate: "2025-12-31",
    status: "on-track",
    createdBy: "John Doe",
    contributions: [
      { id: "c1", memberId: "m1", memberName: "John Doe", amount: 3000, date: "2025-01-15" },
      { id: "c2", memberId: "m2", memberName: "Sarah Doe", amount: 2500, date: "2025-01-20" },
      { id: "c3", memberId: "m3", memberName: "Emma Doe", amount: 2000, date: "2025-01-25" },
      { id: "c4", memberId: "m4", memberName: "Mike Johnson", amount: 1000, date: "2025-02-01" },
    ],
  },
  {
    id: "goal-2",
    name: "Family Vacation",
    saved: 2500,
    target: 5000,
    members: 4,
    createdAt: "2025-01-20",
    targetDate: "2025-06-30",
    status: "on-track",
    createdBy: "Sarah Doe",
    contributions: [
      { id: "c5", memberId: "m2", memberName: "Sarah Doe", amount: 1500, date: "2025-01-20" },
      { id: "c6", memberId: "m1", memberName: "John Doe", amount: 1000, date: "2025-01-25" },
    ],
  },
  {
    id: "goal-3",
    name: "New Car",
    saved: 8000,
    target: 15000,
    members: 2,
    createdAt: "2025-01-10",
    targetDate: "2025-08-31",
    status: "at-risk",
    createdBy: "John Doe",
    contributions: [
      { id: "c7", memberId: "m1", memberName: "John Doe", amount: 5000, date: "2025-01-10" },
      { id: "c8", memberId: "m2", memberName: "Sarah Doe", amount: 3000, date: "2025-01-15" },
    ],
  },
];

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "transaction",
    action: "added a transaction of",
    memberName: "Sarah",
    memberEmail: "sarah@budgetme.app",
    details: "Household Shared Budget",
    amount: 85.00,
    target: "Groceries",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-2",
    type: "goal",
    action: "contributed",
    memberName: "Emma",
    memberEmail: "emma@budgetme.app",
    details: "Personal Contribution",
    amount: 100.00,
    target: "Family Vacation",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-3",
    type: "member",
    action: "invited",
    memberName: "John",
    memberEmail: "john@budgetme.app",
    details: "Invitation Sent",
    target: "mike@email.com",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const PENDING_REQUESTS: JoinRequest[] = [
  {
    id: "req-1",
    name: "Mike Johnson",
    email: "mike@email.com",
    message: "Hi, I'd like to join the family budget group to help track our shared expenses.",
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
];

const PUBLIC_FAMILIES: PublicFamily[] = [
  {
    id: "public-1",
    name: "Smith Family Budget",
    description: "Managing our household expenses and savings goals together for our new home.",
    memberCount: 4,
    createdBy: "John Smith",
    createdAt: "2025-01-15",
    isPublic: true,
  },
  {
    id: "public-2",
    name: "Johnson Household",
    description: "Tracking our family finances and saving for our children's education.",
    memberCount: 5,
    createdBy: "Mary Johnson",
    createdAt: "2025-01-10",
    isPublic: true,
  },
];

const INVITATIONS: Invitation[] = [
  {
    id: "inv-1",
    familyName: "Doe Family Budget",
    inviterName: "Sarah Doe",
    inviterEmail: "sarah@budgetme.app",
    message: "Join our family budget to track expenses together!",
    invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
];

const ROLE_ICONS: Record<string, React.ElementType> = {
  Owner: Crown,
  Admin: Shield,
  Member: Edit,
  Viewer: Eye,
};

export default function FamilyPage() {
  // State management
  const [familyState, setFamilyState] = useState<FamilyState>("no-family");
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [activeActivityFilter, setActiveActivityFilter] = useState("all");
  const [activeGoalFilter, setActiveGoalFilter] = useState("all");
  const [activeNoFamilyTab, setActiveNoFamilyTab] = useState<NoFamilyTab>("create");
  
  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createFamilyModalOpen, setCreateFamilyModalOpen] = useState(false);
  const [editFamilyModalOpen, setEditFamilyModalOpen] = useState(false);
  const [deleteFamilyModalOpen, setDeleteFamilyModalOpen] = useState(false);
  const [leaveFamilyModalOpen, setLeaveFamilyModalOpen] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);

  // Memoized data
  const familyData = useMemo(() => familyState === "has-family" ? FAMILY_DATA : null, [familyState]);
  const members = useMemo(() => familyData?.members || FAMILY_MEMBERS, [familyData]);
  const goals = useMemo(() => SHARED_GOALS, []);
  const activities = useMemo(() => ACTIVITIES, []);
  const pendingRequests = useMemo(() => PENDING_REQUESTS, []);
  const publicFamilies = useMemo(() => PUBLIC_FAMILIES, []);
  const invitations = useMemo(() => INVITATIONS, []);

  // Handle family creation/joining
  const handleCreateFamily = useCallback(() => {
    setCreateFamilyModalOpen(true);
  }, []);

  const handleFamilyCreated = useCallback(() => {
    // Transition to has-family state after successful family creation
    setFamilyState("has-family");
    setActiveTab("overview");
  }, []);

  const handleJoinFamily = useCallback((familyId: string) => {
    console.log("Joining family:", familyId);
    // Simulate joining and transitioning to has-family state
    setTimeout(() => {
      setFamilyState("has-family");
      setActiveTab("overview");
    }, 1000);
  }, []);

  const handleAcceptInvitation = useCallback((invitationId: string) => {
    console.log("Accepting invitation:", invitationId);
    // Simulate accepting invitation and transitioning to has-family state
    setTimeout(() => {
      setFamilyState("has-family");
      setActiveTab("overview");
    }, 1000);
  }, []);

  const handleInviteMember = useCallback(() => {
    setInviteModalOpen(true);
  }, []);

  const handleEditFamily = useCallback(() => {
    setEditFamilyModalOpen(true);
  }, []);

  const handleDeleteFamily = useCallback(() => {
    setDeleteFamilyModalOpen(true);
  }, []);

  const handleLeaveFamily = useCallback(() => {
    setLeaveFamilyModalOpen(true);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {familyState === "no-family" ? (
        <NoFamilyState 
          onCreateFamily={handleCreateFamily}
          onJoinFamily={handleJoinFamily}
          onCheckInvitations={() => console.log("Check invitations")}
          publicFamilies={publicFamilies}
          invitations={invitations}
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
          <Button variant="outline" size="sm" onClick={handleEditFamily}>
            <Settings size={16} className="mr-1" /> Settings
          </Button>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleInviteMember}>
            <Mail size={16} className="mr-1" /> Invite Member
          </Button>
        </div>
      </div>

      {/* Pending Invitation Alert */}
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
                You have been invited by <span className="text-slate-600 font-medium">sarah@example.com</span> to join the <span className="text-slate-600 font-medium">Doe Family</span> dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto pl-14 sm:pl-0">
            <Button variant="ghost" size="sm">Decline</Button>
            <Button size="sm">Accept Invitation</Button>
          </div>
        </div>
      </Card>

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
              <div className="text-xl font-semibold text-slate-900 tracking-tight">4</div>
              <div className="text-[10px] text-emerald-600 mt-1">3 active, 1 pending</div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Users size={22} strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 border-emerald-100 px-2 py-1 rounded-full border">
                  +$500
                </div>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Combined Budget</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">$9,300</div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Users size={22} strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Total Spending</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">$5,450</div>
            </Card>

            <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  <Users size={22} strokeWidth={1.5} />
                </div>
                <div className="text-[10px] font-medium text-purple-700 border-purple-100 px-2 py-1 rounded-full border">
                  58%
                </div>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Shared Goals</div>
              <div className="text-xl font-semibold text-slate-900 tracking-tight">3</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "58%" }} />
              </div>
            </Card>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expense Categories */}
            <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Family Expense Categories</h3>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48 rounded-full shadow-inner"
                  style={{ background: 'conic-gradient(#10b981 0% 35%, #3b82f6 35% 59%, #8b5cf6 59% 77%, #f59e0b 77% 92%, #94a3b8 92% 100%)' }}>
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold text-slate-900">$3,450</span>
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
              onUpdateRole={(memberId, role) => console.log("Update role:", memberId, role)}
              onApproveRequest={(requestId) => console.log("Approve request:", requestId)}
              onDeclineRequest={(requestId) => console.log("Decline request:", requestId)}
              onEditFamily={handleEditFamily}
              onDeleteFamily={handleDeleteFamily}
              onLeaveFamily={handleLeaveFamily}
              onJoinFamily={(familyId) => console.log("Join family:", familyId)}
              onRefreshFamilies={() => console.log("Refresh families")}
            />
          )}
          
          {activeTab === FAMILY_TABS.ACTIVITY && (
            <ActivityTab
              activities={activities}
              onLoadMore={() => console.log("Load more activities")}
              hasMore={hasMoreActivities}
              isLoading={activitiesLoading}
            />
          )}
          
          {activeTab === FAMILY_TABS.GOALS && (
            <GoalsTab
              goals={goals}
              onFilter={(filter) => setActiveGoalFilter(filter)}
              activeFilter={activeGoalFilter}
              onAddGoal={() => console.log("Add goal")}
            />
          )}
        </div>
      </Card>

      {/* Modals */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
      <CreateFamilyModal
        open={createFamilyModalOpen}
        onClose={() => setCreateFamilyModalOpen(false)}
        onCreateFamily={handleFamilyCreated}
      />
      <EditFamilyModal
        open={editFamilyModalOpen}
        onClose={() => setEditFamilyModalOpen(false)}
        onDeleteFamily={handleDeleteFamily}
      />
      <DeleteFamilyModal
        open={deleteFamilyModalOpen}
        onClose={() => setDeleteFamilyModalOpen(false)}
      />
      <LeaveFamilyModal
        open={leaveFamilyModalOpen}
        onClose={() => setLeaveFamilyModalOpen(false)}
      />
        </>
      )}
    </div>
  );
}
