"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  fetchUserFamily,
  fetchFamilyMembers,
  fetchFamilyGoals,
  fetchFamilyActivity,
  fetchJoinRequests,
  fetchPublicFamilies,
  fetchUserInvitations,
  fetchFamilyOverview,
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
  type FamilyOverviewStats,
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
  const [overviewStats, setOverviewStats] = useState<FamilyOverviewStats | null>(null);

  // ----- Loading / error -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [activityOffset, setActivityOffset] = useState(0);
  const [mutating, setMutating] = useState(false);

  // ----- Current user's role in the family -----
  const currentUserRole = useMemo(() => {
    if (!userId || members.length === 0) return null;
    const me = members.find(
      (m) => m.email === userEmail || m.id === userId
    );
    return me?.role ?? null;
  }, [userId, userEmail, members]);

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
        const [pubResult, invResult] = await Promise.all([
          fetchPublicFamilies(userId),
          fetchUserInvitations(userEmail),
        ]);

        setPublicFamilies(pubResult.data);
        setInvitations(invResult.data);
        setLoading(false);
        return;
      }

      // User has a family
      setFamilyState("has-family");
      setFamilyData(family);
      setFamilyId(family.id);
      setFamilyCreatedBy(family.createdBy);

      // Step 2: Fetch all family data in parallel
      const [membersResult, goalsResult, activityResult, requestsResult, overviewResult] =
        await Promise.all([
          fetchFamilyMembers(family.id, family.createdBy),
          fetchFamilyGoals(family.id),
          fetchFamilyActivity(family.id, 20, 0),
          fetchJoinRequests(family.id),
          fetchFamilyOverview(family.id),
        ]);

      setMembers(membersResult.data);
      setGoals(goalsResult.data);
      setActivities(activityResult.data);
      setHasMoreActivities(activityResult.hasMore);
      setActivityOffset(activityResult.data.length);
      setPendingRequests(requestsResult.data);
      setOverviewStats(overviewResult.data);

      // Also update family with members
      if (family) {
        family.members = membersResult.data;
        setFamilyData({ ...family });
      }

      // Also fetch public families + invitations in background
      const [pubResult, invResult] = await Promise.all([
        fetchPublicFamilies(userId),
        fetchUserInvitations(userEmail),
      ]);
      setPublicFamilies(pubResult.data);
      setInvitations(invResult.data);
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
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ----- Load more activities -----
  const loadMoreActivities = useCallback(async () => {
    if (!familyId || activitiesLoading) return;
    setActivitiesLoading(true);
    const result = await fetchFamilyActivity(familyId, 20, activityOffset);
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
      if (!result.error) {
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
      const result = await updateFamily(familyId, form);
      setMutating(false);
      if (!result.error) {
        await fetchData();
      }
      return { error: result.error };
    },
    [familyId, fetchData]
  );

  const handleDeleteFamily = useCallback(async (): Promise<{
    error: string | null;
  }> => {
    if (!familyId) return { error: "No family to delete." };
    setMutating(true);
    const result = await deleteFamily(familyId);
    setMutating(false);
    if (!result.error) {
      await fetchData();
    }
    return { error: result.error };
  }, [familyId, fetchData]);

  const handleLeaveFamily = useCallback(async (): Promise<{
    error: string | null;
  }> => {
    if (!familyId || !userId) return { error: "Missing data." };
    setMutating(true);
    const result = await leaveFamily(familyId, userId);
    setMutating(false);
    if (!result.error) {
      await fetchData();
    }
    return { error: result.error };
  }, [familyId, userId, fetchData]);

  const handleSendInvitation = useCallback(
    async (form: InviteMemberData): Promise<{ error: string | null }> => {
      if (!familyId || !userId) return { error: "Missing data." };
      setMutating(true);
      const result = await sendInvitation(familyId, userId, form);
      setMutating(false);
      if (!result.error) {
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
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, fetchData]
  );

  const handleSendJoinRequest = useCallback(
    async (
      targetFamilyId: string,
      message?: string
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await sendJoinRequest(targetFamilyId, userId, message);
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
      if (!result.error) {
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, fetchData]
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
      const result = await updateMemberRole(memberId, newRole);
      setMutating(false);
      if (!result.error) {
        await fetchData();
      }
      return { error: result.error };
    },
    [fetchData]
  );

  const handleContributeToGoal = useCallback(
    async (
      goalId: string,
      amount: number
    ): Promise<{ error: string | null }> => {
      if (!userId) return { error: "Not authenticated." };
      setMutating(true);
      const result = await contributeToGoal(goalId, userId, amount);
      setMutating(false);
      if (!result.error) {
        await fetchData();
      }
      return { error: result.error };
    },
    [userId, fetchData]
  );

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
    overviewStats,
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
  };
}
