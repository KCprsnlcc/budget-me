"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { toast } from "sonner";
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

  const [familyState, setFamilyState] = useState<FamilyState>("loading");
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyCreatedBy, setFamilyCreatedBy] = useState<string | null>(null);

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [activityOffset, setActivityOffset] = useState(0);
  const [mutating, setMutating] = useState(false);
  
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);
  const [activityTotalCount, setActivityTotalCount] = useState(0);

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

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {

      const { data: family, membership, error: famErr } =
        await fetchUserFamily(userId);

      if (famErr) {
        setError(famErr);
        setFamilyState("error");
        setLoading(false);
        return;
      }

      if (!family || !membership) {

        setFamilyState("no-family");
        setFamilyData(null);
        setFamilyId(null);
        setFamilyCreatedBy(null);
        setMembers([]);
        setGoals([]);
        setActivities([]);
        setPendingRequests([]);
        setOverviewStats(null);

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

      setFamilyState("has-family");
      setFamilyData(family);
      setFamilyId(family.id);
      setFamilyCreatedBy(family.createdBy);

      if (family.createdBy === userId && joinRequests.length > 0) {
        await deleteAllUserJoinRequests(userId);
        setJoinRequests([]);
      }

      const [membersResult, goalsResult, activityResult, requestsResult, overviewResult, sentInvResult, expenseCatResult, budgetVsActualResult, goalsSavingsResult, goalsHealthResult] =
        await Promise.all([
          fetchFamilyMembers(family.id, family.createdBy),
          fetchFamilyGoals(family.id),
          fetchFamilyActivityLog(family.id, activityPageSize, 0),
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
      setActivityTotalCount(activityResult.totalCount || 0);
      setPendingRequests(requestsResult.data);
      setOverviewStats(overviewResult.data);
      setSentInvitations(sentInvResult.data);
      setExpenseCategories(expenseCatResult.data);
      setBudgetVsActual(budgetVsActualResult.data);
      setTotalExpenses(expenseCatResult.total);
      setGoalsSavingsProgress(goalsSavingsResult.data);
      setGoalsHealth(goalsHealthResult.data);
      setTotalGoals(goalsHealthResult.total);

      if (family) {
        family.members = membersResult.data;
        setFamilyData({ ...family });
      }

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

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const refreshGoals = useCallback(async () => {
    if (!familyId) return;
    
    try {

      const [goalsResult, goalsSavingsResult, goalsHealthResult] = await Promise.all([
        fetchFamilyGoals(familyId),
        fetchFamilyGoalsSavingsProgress(familyId, 6),
        fetchFamilyGoalsHealth(familyId),
      ]);
      
      setGoals(goalsResult.data);
      setGoalsSavingsProgress(goalsSavingsResult.data);
      setGoalsHealth(goalsHealthResult.data);

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

  const fetchActivitiesPage = useCallback(async (page: number, pageSize: number) => {
    if (!familyId) return;
    setActivitiesLoading(true);
    const offset = (page - 1) * pageSize;
    const result = await fetchFamilyActivityLog(familyId, pageSize, offset);
    if (!result.error) {
      setActivities(result.data);
      setHasMoreActivities(result.hasMore);
      setActivityOffset(result.data.length);
      setActivityTotalCount(result.totalCount || 0);
      setActivityCurrentPage(page);
    }
    setActivitiesLoading(false);
  }, [familyId]);

  const handleActivityPageChange = useCallback((page: number) => {
    fetchActivitiesPage(page, activityPageSize);
  }, [fetchActivitiesPage, activityPageSize]);

  const handleActivityPageSizeChange = useCallback((size: number | "all") => {
    const newPageSize = size === "all" ? Number.MAX_SAFE_INTEGER : size;
    setActivityPageSize(newPageSize);
    fetchActivitiesPage(1, newPageSize);
  }, [fetchActivitiesPage]);

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

  const handleCreateFamily = useCallback(
    async (form: CreateFamilyData): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await createFamily(userId, form);
      setMutating(false);
      if (!result.error && result.data?.id) {

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

      await logFamilyDeleted(familyId, userId || "", familyName);
      await fetchData();
    }
    return { error: result.error };
  }, [familyId, userId, familyData?.name, fetchData]);

  const handleLeaveFamily = useCallback(async (newOwnerId?: string): Promise<{
    error: string | null;
  }> => {
    if (!familyId || !userId) return { error: "Missing data." };
    setMutating(true);

    if (newOwnerId && isOwner) {
      const newOwner = members.find(m => m.user_id === newOwnerId);
      const currentOwner = members.find(m => m.user_id === userId) || { name: "Current Owner" };

      const transferResult = await transferOwnership(familyId, newOwnerId, userId);
      if (transferResult.error) {
        setMutating(false);
        return { error: transferResult.error };
      }

      if (newOwner) {
        await logOwnershipTransferred(familyId, userId, currentOwner.name, newOwner.name, newOwnerId);
      }
    }
    
    const userName = user?.user_metadata?.full_name || user?.email || "A member";
    const result = await leaveFamily(familyId, userId);
    setMutating(false);
    if (!result.error) {

      await logMemberLeft(familyId, userId, userName, userId);
      await fetchData();
    }
    return { error: result.error };
  }, [familyId, userId, isOwner, members, user, fetchData]);

  const handleSendInvitation = useCallback(
    async (form: InviteMemberData): Promise<{ error: string | null }> => {
      if (!familyId || !userId) return { error: "Missing data." };
      setMutating(true);
      const result = await sendInvitation(familyId, userId, form);
      setMutating(false);
      if (!result.error) {

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
      
      if (result.error) {
        toast.error("Failed to update role", {
          description: result.error,
        });
        return { error: result.error };
      }
      
      if (member && oldRole && familyId) {

        await logRoleChanged(familyId, userId || "", member.name, memberId, oldRole, newRole);
        await fetchData();
        toast.success("Role updated successfully", {
          description: `${member.name}'s role has been changed from ${oldRole} to ${newRole}.`,
        });
      }
      
      return { error: null };
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
      const newOwner = members.find(m => m.user_id === newOwnerUserId);
      const currentOwner = members.find(m => m.user_id === userId) || { name: "Current Owner" };
      const result = await transferOwnership(familyId, newOwnerUserId, userId);
      setMutating(false);
      if (!result.error && newOwner && familyId) {

        await logOwnershipTransferred(familyId, userId, currentOwner.name, newOwner.name, newOwnerUserId);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, members, fetchData]
  );

  const handleCreateFamilyGoal = useCallback(
    async (form: GoalFormState): Promise<{ error: string | null; data?: { id: string; name: string; target: number } }> => {
      if (!userId || !familyId) return { error: "Not authenticated or no family." };
      setMutating(true);
      const result = await createGoal(userId, { ...form, family_id: familyId, isFamily: true });
      setMutating(false);
      if (!result.error && result.data) {

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

        await logGoalDeleted(familyId, userId, goal.name, goalId);
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, familyId, goals, fetchData]
  );

  const refreshDiscoverFamilies = useCallback(async () => {
    if (!userId) return;

    try {

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
  };
}
