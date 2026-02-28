"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/app/(dashboard)/goals/_lib/goal-service";
import type { GoalFormState } from "@/app/(dashboard)/goals/_components/types";
import {
  fetchUserFamily,
  fetchFamilyMembers,
  fetchFamilyGoals,
  fetchFamilyActivityLog,
  fetchJoinRequests,
  fetchPublicFamilies,
  fetchUserInvitations,
  fetchFamilyOverview,
  fetchSentInvitations,
  fetchUserJoinRequests,
  fetchFamilyExpenseCategories,
  fetchFamilyBudgetVsActual,
  fetchFamilyGoalsSavingsProgress,
  fetchFamilyGoalsHealth,
  createFamily,
  updateFamily,
  deleteFamily,
  leaveFamily,
  sendInvitation,
  respondToInvitation,
  sendJoinRequest,
  respondToJoinRequest,
  updateMemberRole,
  contributeToGoal,
  removeMember,
  transferOwnership,
  deleteAllUserJoinRequests,
  // Activity logging functions
  logFamilyCreated,
  logFamilyUpdated,
  logFamilyDeleted,
  logMemberJoined,
  logMemberLeft,
  logMemberInvited,
  logMemberRemoved,
  logRoleChanged,
  logOwnershipTransferred,
  logGoalCreated,
  logGoalUpdated,
  logGoalDeleted,
  logGoalContributed,
  type FamilyOverviewStats,
  type SentInvitation,
  type FamilyCategoryBreakdown,
  type FamilyMonthlyChartPoint,
  type FamilyGoalsSavingsPoint,
  type FamilyGoalsHealthItem,
} from "./family-service";
import type {
  Family,
  FamilyMember,
  SharedGoal,
  ActivityItem,
  JoinRequest,
  PublicFamily,
  Invitation,
  FamilyState,
  CreateFamilyData,
  EditFamilyData,
  InviteMemberData,
} from "../_components/types";

export function useFamily() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const userEmail = user?.email ?? "";

  // ----- Core state -----
  const [familyState, setFamilyState] = useState<FamilyState>("loading");
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyCreatedBy, setFamilyCreatedBy] = useState<string | null>(null);

  // ----- Data state -----
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [goals, setGoals] = useState<SharedGoal[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [publicFamilies, setPublicFamilies] = useState<PublicFamily[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<FamilyOverviewStats | null>(null);
  const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<FamilyCategoryBreakdown[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<FamilyMonthlyChartPoint[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [goalsSavingsProgress, setGoalsSavingsProgress] = useState<FamilyGoalsSavingsPoint[]>([]);
  const [goalsHealth, setGoalsHealth] = useState<FamilyGoalsHealthItem[]>([]);
  const [totalGoals, setTotalGoals] = useState<number>(0);

  // ----- Loading / error -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [activityOffset, setActivityOffset] = useState(0);
  const [mutating, setMutating] = useState(false);

  // ----- Current user's role in the family -----
  const currentUserRole = useMemo(() => {
    if (!userId) return null;
    if (familyCreatedBy === userId) return "Owner";
    if (members.length === 0) return null;
    const me = members.find(
      (m) => m.email?.toLowerCase() === userEmail.toLowerCase()
    );
    return me?.role ?? null;
  }, [userId, userEmail, members, familyCreatedBy]);

  const isOwner = useMemo(() => {
    return familyCreatedBy === userId;
  }, [familyCreatedBy, userId]);

  // ----- Fetch all data -----
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Check if user belongs to a family
      const { data: family, membership, error: famErr } =
        await fetchUserFamily(userId);

      if (famErr) {
        setError(famErr);
        setFamilyState("error");
        setLoading(false);
        return;
      }

      if (!family || !membership) {
        // User has no family — fetch discovery data
        setFamilyState("no-family");
        setFamilyData(null);
        setFamilyId(null);
        setFamilyCreatedBy(null);
        setMembers([]);
        setGoals([]);
        setActivities([]);
        setPendingRequests([]);
        setOverviewStats(null);

        // Fetch public families and invitations in parallel
        const [pubResult, invResult, joinReqResult] = await Promise.all([
          fetchPublicFamilies(userId),
          fetchUserInvitations(userEmail),
          fetchUserJoinRequests(userId),
        ]);

        setPublicFamilies(pubResult.data);
        setInvitations(invResult.data);
        setJoinRequests(joinReqResult.data);
        setLoading(false);
        return;
      }

      // User has a family
      setFamilyState("has-family");
      setFamilyData(family);
      setFamilyId(family.id);
      setFamilyCreatedBy(family.createdBy);

      // If user is the owner, delete all their existing join requests
      if (family.createdBy === userId && joinRequests.length > 0) {
        await deleteAllUserJoinRequests(userId);
        setJoinRequests([]);
      }

      // Step 2: Fetch all family data in parallel
      const [membersResult, goalsResult, activityResult, requestsResult, overviewResult, sentInvResult, expenseCatResult, budgetVsActualResult, goalsSavingsResult, goalsHealthResult] =
        await Promise.all([
          fetchFamilyMembers(family.id, family.createdBy),
          fetchFamilyGoals(family.id),
          fetchFamilyActivityLog(family.id, 20, 0),
          fetchJoinRequests(family.id),
          fetchFamilyOverview(family.id),
          fetchSentInvitations(family.id),
          fetchFamilyExpenseCategories(family.id),
          fetchFamilyBudgetVsActual(family.id, 6),
          fetchFamilyGoalsSavingsProgress(family.id, 6),
          fetchFamilyGoalsHealth(family.id),
        ]);

      setMembers(membersResult.data);
      setGoals(goalsResult.data);
      setActivities(activityResult.data);
      setHasMoreActivities(activityResult.hasMore);
      setActivityOffset(activityResult.data.length);
      setPendingRequests(requestsResult.data);
      setOverviewStats(overviewResult.data);
      setSentInvitations(sentInvResult.data);
      setExpenseCategories(expenseCatResult.data);
      setBudgetVsActual(budgetVsActualResult.data);
      setTotalExpenses(expenseCatResult.total);
      setGoalsSavingsProgress(goalsSavingsResult.data);
      setGoalsHealth(goalsHealthResult.data);
      setTotalGoals(goalsHealthResult.total);

      // Also update family with members
      if (family) {
        family.members = membersResult.data;
        setFamilyData({ ...family });
      }

      // Also fetch public families + invitations + join requests in background
      const [pubResult, invResult, joinReqResult] = await Promise.all([
        fetchPublicFamilies(userId),
        fetchUserInvitations(userEmail),
        fetchUserJoinRequests(userId),
      ]);
      setPublicFamilies(pubResult.data);
      setInvitations(invResult.data);
      setJoinRequests(joinReqResult.data);
    } catch (err: any) {
      setError(err.message ?? "An unexpected error occurred.");
      setFamilyState("error");
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail]);

  // ----- Initial fetch -----
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // ----- Refetch helper -----
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // ----- Goals-specific refresh helper -----
  const refreshGoals = useCallback(async () => {
    if (!familyId) return;
    
    try {
      // Only fetch goals-related data
      const [goalsResult, goalsSavingsResult, goalsHealthResult] = await Promise.all([
        fetchFamilyGoals(familyId),
        fetchFamilyGoalsSavingsProgress(familyId, 6),
        fetchFamilyGoalsHealth(familyId),
      ]);
      
      setGoals(goalsResult.data);
      setGoalsSavingsProgress(goalsSavingsResult.data);
      setGoalsHealth(goalsHealthResult.data);
      
      // Update overview stats that include goals
      if (overviewStats) {
        const updatedOverview = await fetchFamilyOverview(familyId);
        if (!updatedOverview.error) {
          setOverviewStats(updatedOverview.data);
        }
      }
    } catch (err: any) {
      console.error("Failed to refresh goals:", err);
    }
  }, [familyId, overviewStats]);

  // ----- Load more activities -----
  const loadMoreActivities = useCallback(async () => {
    if (!familyId || activitiesLoading) return;
    setActivitiesLoading(true);
    const result = await fetchFamilyActivityLog(familyId, 20, activityOffset);
    if (!result.error) {
      setActivities((prev) => [...prev, ...result.data]);
      setHasMoreActivities(result.hasMore);
      setActivityOffset((prev) => prev + result.data.length);
    }
    setActivitiesLoading(false);
  }, [familyId, activityOffset, activitiesLoading]);

  // ----- Mutations -----

  const handleCreateFamily = useCallback(
    async (form: CreateFamilyData): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await createFamily(userId, form);
      setMutating(false);
      if (!result.error && result.data?.id) {
        // Log family creation activity
        await logFamilyCreated(result.data.id, userId, form.name);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, fetchData]
  );

  const handleUpdateFamily = useCallback(
    async (form: EditFamilyData): Promise<{ error: string | null }> => {
      if (!familyId) return { error: "No family to update." };
      setMutating(true);
      const oldName = familyData?.name;
      const result = await updateFamily(familyId, form);
      setMutating(false);
      if (!result.error) {
        // Log family update activity
        await logFamilyUpdated(familyId, userId || "", form.name || oldName || "Family", form);
        await fetchData();
      }
      return { error: result.error };
    },
    [familyId, userId, familyData?.name, fetchData]
  );

  const handleDeleteFamily = useCallback(async (): Promise<{
    error: string | null;
  }> => {
    if (!familyId) return { error: "No family to delete." };
    setMutating(true);
    const familyName = familyData?.name || "Family";
    const result = await deleteFamily(familyId);
    setMutating(false);
    if (!result.error) {
      // Log family deletion activity
      await logFamilyDeleted(familyId, userId || "", familyName);
      await fetchData();
    }
    return { error: result.error };
  }, [familyId, userId, familyData?.name, fetchData]);

  const handleLeaveFamily = useCallback(async (): Promise<{
    error: string | null;
  }> => {
    if (!familyId || !userId) return { error: "Missing data." };
    setMutating(true);
    const userName = user?.user_metadata?.full_name || user?.email || "A member";
    const result = await leaveFamily(familyId, userId);
    setMutating(false);
    if (!result.error) {
      // Log member left activity
      await logMemberLeft(familyId, userId, userName, userId);
      await fetchData();
    }
    return { error: result.error };
  }, [familyId, userId, user, fetchData]);

  const handleSendInvitation = useCallback(
    async (form: InviteMemberData): Promise<{ error: string | null }> => {
      if (!familyId || !userId) return { error: "Missing data." };
      setMutating(true);
      const result = await sendInvitation(familyId, userId, form);
      setMutating(false);
      if (!result.error) {
        // Log member invitation activity
        await logMemberInvited(familyId, userId, form.email, form.role);
        await fetchData();
      }
      return { error: result.error };
    },
    [familyId, userId, fetchData]
  );

  const handleRespondToInvitation = useCallback(
    async (
      invitationId: string,
      accept: boolean
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await respondToInvitation(invitationId, userId, accept);
      setMutating(false);
      if (!result.error) {
        // Log member joined activity if accepted
        if (accept && familyId) {
          const userName = user?.user_metadata?.full_name || user?.email || "A member";
          await logMemberJoined(familyId, userId, userName, userId);
        }
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, user, familyId, fetchData]
  );

  const handleSendJoinRequest = useCallback(
    async (
      targetFamilyId: string,
      message?: string
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await sendJoinRequest(targetFamilyId, userId, message);

      // Refresh join requests after sending
      if (!result.error) {
        const joinReqResult = await fetchUserJoinRequests(userId);
        setJoinRequests(joinReqResult.data);
      }

      setMutating(false);
      return { error: result.error };
    },
    [userId]
  );

  const handleApproveRequest = useCallback(
    async (requestId: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await respondToJoinRequest(requestId, userId, true);
      setMutating(false);
      if (!result.error && familyId) {
        // Get the requester's info to log the activity
        const request = pendingRequests.find(r => r.id === requestId);
        if (request) {
          await logMemberJoined(familyId, userId, request.name, request.id);
        }
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, pendingRequests, fetchData]
  );

  const handleDeclineRequest = useCallback(
    async (requestId: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await respondToJoinRequest(requestId, userId, false);
      setMutating(false);
      if (!result.error) {
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, fetchData]
  );

  const handleUpdateRole = useCallback(
    async (
      memberId: string,
      newRole: string
    ): Promise<{ error: string | null }> => {
      setMutating(true);
      const member = members.find(m => m.id === memberId);
      const oldRole = member?.role;
      const result = await updateMemberRole(memberId, newRole, userId || undefined);
      setMutating(false);
      if (!result.error && member && oldRole && familyId) {
        // Log role change activity
        await logRoleChanged(familyId, userId || "", member.name, memberId, oldRole, newRole);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, members, fetchData]
  );

  const handleContributeToGoal = useCallback(
    async (
      goalId: string,
      amount: number
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const goal = goals.find(g => g.id === goalId);
      const result = await contributeToGoal(goalId, userId, amount);
      setMutating(false);
      if (!result.error && goal && familyId) {
        // Log goal contribution activity
        const userName = user?.user_metadata?.full_name || "A member";
        await logGoalContributed(familyId, userId, goal.name, goalId, amount, userName);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, goals, user, fetchData]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const member = members.find(m => m.id === memberId);
      const result = await removeMember(memberId, userId);
      setMutating(false);
      if (!result.error && member && familyId) {
        // Log member removal activity
        await logMemberRemoved(familyId, userId, member.name, memberId);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, members, fetchData]
  );

  const handleTransferOwnership = useCallback(
    async (newOwnerUserId: string): Promise<{ error: string | null }> => {
      if (!userId || !familyId) return { error: "Missing data." };
      setMutating(true);
      const newOwner = members.find(m => m.id === newOwnerUserId);
      const currentOwner = members.find(m => m.id === userId) || { name: "Current Owner" };
      const result = await transferOwnership(familyId, newOwnerUserId, userId);
      setMutating(false);
      if (!result.error && newOwner && familyId) {
        // Log ownership transfer activity
        await logOwnershipTransferred(familyId, userId, currentOwner.name, newOwner.name, newOwnerUserId);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, members, fetchData]
  );

  // ----- Goal CRUD handlers with activity logging -----

  const handleCreateFamilyGoal = useCallback(
    async (form: GoalFormState): Promise<{ error: string | null; data?: { id: string; name: string; target: number } }> => {
      if (!userId || !familyId) return { error: "Not authenticated or no family." };
      setMutating(true);
      const result = await createGoal(userId, { ...form, family_id: familyId, isFamily: true });
      setMutating(false);
      if (!result.error && result.data) {
        // Log goal creation activity
        await logGoalCreated(familyId, userId, result.data.name, result.data.id, result.data.target);
        await fetchData();
        return { error: null, data: { id: result.data.id, name: result.data.name, target: result.data.target } };
      }
      return { error: result.error };
    },
    [userId, familyId, fetchData]
  );

  const handleUpdateFamilyGoal = useCallback(
    async (goalId: string, form: GoalFormState): Promise<{ error: string | null }> => {
      if (!userId || !familyId) return { error: "Not authenticated or no family." };
      setMutating(true);
      const goal = goals.find(g => g.id === goalId);
      const result = await updateGoal(goalId, form);
      setMutating(false);
      if (!result.error && goal) {
        // Log goal update activity
        await logGoalUpdated(familyId, userId, result.data?.name || goal.name, goalId, form);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, goals, fetchData]
  );

  const handleDeleteFamilyGoal = useCallback(
    async (goalId: string): Promise<{ error: string | null }> => {
      if (!userId || !familyId) return { error: "Not authenticated or no family." };
      setMutating(true);
      const goal = goals.find(g => g.id === goalId);
      const result = await deleteGoal(goalId);
      setMutating(false);
      if (!result.error && goal) {
        // Log goal deletion activity
        await logGoalDeleted(familyId, userId, goal.name, goalId);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, goals, fetchData]
  );

  // ----- Refresh discover families data only -----
  const refreshDiscoverFamilies = useCallback(async () => {
    if (!userId) return;

    try {
      // Fetch only discover families data (public families and join requests)
      const [pubResult, joinReqResult] = await Promise.all([
        fetchPublicFamilies(userId),
        fetchUserJoinRequests(userId),
      ]);

      setPublicFamilies(pubResult.data);
      setJoinRequests(joinReqResult.data);
    } catch (err) {
      console.error('Failed to refresh discover families:', err);
    }
  }, [userId]);

  return {
    // State
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
    sentInvitations,
    overviewStats,
    expenseCategories,
    budgetVsActual,
    totalExpenses,
    goalsSavingsProgress,
    goalsHealth,
    totalGoals,
    currentUserRole,
    isOwner,

    // Loading
    loading,
    error,
    activitiesLoading,
    hasMoreActivities,
    mutating,

    // Actions
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
    // Goal CRUD with activity logging
    handleCreateFamilyGoal,
    handleUpdateFamilyGoal,
    handleDeleteFamilyGoal,
  };
}
