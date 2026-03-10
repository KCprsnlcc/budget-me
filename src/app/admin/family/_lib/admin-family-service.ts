import { createClient } from "@/lib/supabase/client";
import type {
    AdminFamily,
    AdminFamilyMember,
    AdminFamilyInvitation,
    AdminFamilyJoinRequest,
    AdminFamilyStats,
    AdminFamilyFilters,
} from "./types";

const supabase = createClient();

// ─── Map raw DB row to AdminFamily ──────────────────────────────────
function mapFamilyRow(row: Record<string, any>): AdminFamily {
    const creator = row.profiles as Record<string, any> | null;
    const memberRows = row.family_members as Record<string, any>[] | null;

    return {
        id: row.id,
        family_name: row.family_name,
        description: row.description,
        currency_pref: row.currency_pref,
        is_public: row.is_public ?? false,
        max_members: row.max_members ?? 10,
        allow_goal_sharing: row.allow_goal_sharing ?? true,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        status: row.status ?? "active",
        creator_email: creator?.email ?? undefined,
        creator_name: creator?.full_name ?? undefined,
        creator_avatar: creator?.avatar_url ?? undefined,
        member_count: Array.isArray(memberRows) ? memberRows.filter((m) => m.status === "active").length : 0,
    };
}

// ─── Map raw DB row to AdminFamilyMember ─────────────────────────────
function mapMemberRow(row: Record<string, any>): AdminFamilyMember {
    const profile = row.profiles as Record<string, any> | null;

    return {
        id: row.id,
        family_id: row.family_id,
        user_id: row.user_id,
        role: row.role,
        status: row.status,
        can_create_goals: row.can_create_goals ?? false,
        can_contribute_goals: row.can_contribute_goals ?? true,
        invited_by: row.invited_by,
        joined_at: row.joined_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_email: profile?.email ?? undefined,
        user_name: profile?.full_name ?? undefined,
        user_avatar: profile?.avatar_url ?? undefined,
    };
}

// ─── Fetch all families with filters (admin view) ────────────────────
export async function fetchAdminFamilies(
    filters: AdminFamilyFilters = {},
    page: number = 1,
    pageSize: number = 20
): Promise<{ data: AdminFamily[]; error: string | null; count: number | null }> {
    let query = supabase
        .from("families")
        .select(
            `
      *,
      profiles!families_created_by_profiles_fkey ( email, full_name, avatar_url ),
      family_members ( id, status )
    `,
            { count: "exact" }
        )
        .order("created_at", { ascending: false });

    // Apply filters
    if (filters.status) {
        query = query.eq("status", filters.status);
    }
    if (filters.visibility === "public") {
        query = query.eq("is_public", true);
    } else if (filters.visibility === "private") {
        query = query.eq("is_public", false);
    }
    if (filters.userId) {
        query = query.eq("created_by", filters.userId);
    }
    if (filters.month && filters.month !== "all") {
        query = query.filter("created_at", "gte", new Date(filters.year && filters.year !== "all" ? Number(filters.year) : new Date().getFullYear(), Number(filters.month) - 1, 1).toISOString());
        query = query.filter("created_at", "lt", new Date(filters.year && filters.year !== "all" ? Number(filters.year) : new Date().getFullYear(), Number(filters.month), 1).toISOString());
    } else if (filters.year && filters.year !== "all") {
        query = query.filter("created_at", "gte", new Date(Number(filters.year), 0, 1).toISOString());
        query = query.filter("created_at", "lt", new Date(Number(filters.year) + 1, 0, 1).toISOString());
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        return { data: [], error: error.message, count: null };
    }

    // Need to separately fetch profiles for the creator data since the join might not include it
    const mapped = (data ?? []).map((row: Record<string, any>) => mapFamilyRow(row));

    return { data: mapped, error: null, count };
}

// ─── Fetch family members for a specific family ─────────────────────
export async function fetchFamilyMembers(
    familyId: string
): Promise<{ data: AdminFamilyMember[]; error: string | null }> {
    const { data, error } = await supabase
        .from("family_members")
        .select(
            `
      *,
      profiles!family_members_user_id_profiles_fkey ( email, full_name, avatar_url )
    `
        )
        .eq("family_id", familyId)
        .order("created_at", { ascending: true });

    if (error) {
        return { data: [], error: error.message };
    }

    return { data: (data ?? []).map((row: Record<string, any>) => mapMemberRow(row)), error: null };
}

// ─── Fetch family invitations ────────────────────────────────────────
export async function fetchFamilyInvitations(
    familyId: string
): Promise<{ data: AdminFamilyInvitation[]; error: string | null }> {
    const { data, error } = await supabase
        .from("family_invitations")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

    if (error) {
        return { data: [], error: error.message };
    }

    return {
        data: (data ?? []).map((row: Record<string, any>) => ({
            id: row.id,
            family_id: row.family_id,
            invited_by: row.invited_by,
            email: row.email,
            role: row.role,
            invitation_token: row.invitation_token,
            message: row.message,
            status: row.status,
            expires_at: row.expires_at,
            responded_at: row.responded_at,
            created_at: row.created_at,
        })),
        error: null,
    };
}

// ─── Fetch family join requests ──────────────────────────────────────
export async function fetchFamilyJoinRequests(
    familyId: string
): Promise<{ data: AdminFamilyJoinRequest[]; error: string | null }> {
    const { data, error } = await supabase
        .from("family_join_requests")
        .select(
            `
      *,
      profiles!family_join_requests_user_id_profiles_fkey ( email, full_name, avatar_url )
    `
        )
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

    if (error) {
        return { data: [], error: error.message };
    }

    return {
        data: (data ?? []).map((row: Record<string, any>) => {
            const profile = row.profiles as Record<string, any> | null;
            return {
                id: row.id,
                family_id: row.family_id,
                user_id: row.user_id,
                message: row.message,
                status: row.status,
                reviewed_by: row.reviewed_by,
                reviewed_at: row.reviewed_at,
                review_message: row.review_message,
                created_at: row.created_at,
                user_email: profile?.email ?? undefined,
                user_name: profile?.full_name ?? undefined,
                user_avatar: profile?.avatar_url ?? undefined,
            };
        }),
        error: null,
    };
}

// ─── Fetch family stats ──────────────────────────────────────────────
export async function fetchAdminFamilyStats(): Promise<AdminFamilyStats> {
    // Fetch all families with members count
    const { data: families, error: familiesError } = await supabase
        .from("families")
        .select(`
      id, family_name, status, is_public, created_at, created_by,
      family_members ( id, status ),
      profiles!families_created_by_profiles_fkey ( email, full_name, avatar_url )
    `);

    if (familiesError || !families) {
        return getDefaultStats();
    }

    // Fetch invitations summary
    const { data: invitations } = await supabase
        .from("family_invitations")
        .select("id, status");

    // Fetch join requests summary
    const { data: joinRequests } = await supabase
        .from("family_join_requests")
        .select("id, status");

    const totalFamilies = families.length;
    const activeFamilies = families.filter((f: any) => f.status === "active").length;
    const inactiveFamilies = families.filter((f: any) => f.status === "inactive").length;
    const publicFamilies = families.filter((f: any) => f.is_public).length;
    const privateFamilies = totalFamilies - publicFamilies;

    // Count total active members
    let totalMembers = 0;
    families.forEach((f: any) => {
        if (Array.isArray(f.family_members)) {
            totalMembers += f.family_members.filter((m: any) => m.status === "active").length;
        }
    });

    const avgMembersPerFamily = totalFamilies > 0 ? totalMembers / totalFamilies : 0;

    const totalInvitations = invitations?.length ?? 0;
    const pendingInvitations = invitations?.filter((i: any) => i.status === "pending").length ?? 0;
    const pendingJoinRequests = joinRequests?.filter((j: any) => j.status === "pending").length ?? 0;

    // Family growth (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const growthMap = new Map<string, number>();

    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        growthMap.set(key, 0);
    }

    families.forEach((f: any) => {
        const created = new Date(f.created_at);
        if (created >= sixMonthsAgo) {
            const key = created.toLocaleDateString("en-US", { month: "short", year: "numeric" });
            if (growthMap.has(key)) {
                growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
            }
        }
    });

    const familyGrowth = Array.from(growthMap.entries()).map(([month, count]) => ({ month, count }));

    // Status distribution
    const statusCounts: Record<string, number> = { active: activeFamilies, inactive: inactiveFamilies };
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalFamilies > 0 ? Math.round((count / totalFamilies) * 100) : 0,
    }));

    // Top families by member count
    const familyWithCounts = families.map((f: any) => {
        const creator = f.profiles as Record<string, any> | null;
        const memberCount = Array.isArray(f.family_members)
            ? f.family_members.filter((m: any) => m.status === "active").length
            : 0;
        return {
            family_id: f.id,
            family_name: f.family_name,
            member_count: memberCount,
            creator_name: creator?.full_name ?? null,
            creator_email: creator?.email ?? null,
            creator_avatar: creator?.avatar_url ?? null,
        };
    });

    const topFamilies = familyWithCounts
        .sort((a: any, b: any) => b.member_count - a.member_count)
        .slice(0, 5);

    return {
        totalFamilies,
        activeFamilies,
        inactiveFamilies,
        totalMembers,
        totalInvitations,
        pendingInvitations,
        pendingJoinRequests,
        avgMembersPerFamily,
        publicFamilies,
        privateFamilies,
        familyGrowth,
        statusDistribution,
        topFamilies,
    };
}

function getDefaultStats(): AdminFamilyStats {
    return {
        totalFamilies: 0,
        activeFamilies: 0,
        inactiveFamilies: 0,
        totalMembers: 0,
        totalInvitations: 0,
        pendingInvitations: 0,
        pendingJoinRequests: 0,
        avgMembersPerFamily: 0,
        publicFamilies: 0,
        privateFamilies: 0,
        familyGrowth: [],
        statusDistribution: [],
        topFamilies: [],
    };
}

// ─── Fetch all users (for filters/dropdowns) ─────────────────────────
export async function fetchAllUsers(): Promise<{ id: string; email: string; full_name: string | null }[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("email", { ascending: true });

    if (error || !data) return [];

    return data.map((u: any) => ({
        id: u.id,
        email: u.email ?? "",
        full_name: u.full_name ?? null,
    }));
}

// ─── Delete a family (admin action) ──────────────────────────────────
export async function deleteAdminFamily(
    familyId: string
): Promise<{ error: string | null }> {
    // First, delete all family members
    const { error: membersError } = await supabase
        .from("family_members")
        .delete()
        .eq("family_id", familyId);

    if (membersError) {
        return { error: `Failed to delete family members: ${membersError.message}` };
    }

    // Delete all invitations
    const { error: invitationsError } = await supabase
        .from("family_invitations")
        .delete()
        .eq("family_id", familyId);

    if (invitationsError) {
        return { error: `Failed to delete invitations: ${invitationsError.message}` };
    }

    // Delete all join requests
    const { error: joinRequestsError } = await supabase
        .from("family_join_requests")
        .delete()
        .eq("family_id", familyId);

    if (joinRequestsError) {
        return { error: `Failed to delete join requests: ${joinRequestsError.message}` };
    }

    // Delete activity log entries
    const { error: activityError } = await supabase
        .from("family_activity_log")
        .delete()
        .eq("family_id", familyId);

    if (activityError) {
        return { error: `Failed to delete activity log: ${activityError.message}` };
    }

    // Unlink family goals (set family_id to null instead of deleting)
    const { error: goalsError } = await supabase
        .from("goals")
        .update({ family_id: null, is_family_goal: false })
        .eq("family_id", familyId);

    if (goalsError) {
        return { error: `Failed to unlink goals: ${goalsError.message}` };
    }

    // Finally, delete the family itself
    const { error: familyError } = await supabase
        .from("families")
        .delete()
        .eq("id", familyId);

    if (familyError) {
        return { error: familyError.message };
    }

    return { error: null };
}

// ─── Update a family (admin action) ──────────────────────────────────
export async function updateAdminFamily(
    familyId: string,
    updates: {
        family_name?: string;
        description?: string | null;
        is_public?: boolean;
        max_members?: number;
        allow_goal_sharing?: boolean;
        status?: "active" | "inactive";
    }
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("families")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", familyId);

    if (error) {
        return { error: error.message };
    }

    return { error: null };
}

// ─── Update a family member role/permissions (admin action) ──────────
export async function updateFamilyMember(
    memberId: string,
    updates: {
        role?: "admin" | "member" | "viewer";
        status?: "active" | "pending" | "inactive" | "removed";
        can_create_goals?: boolean;
        can_contribute_goals?: boolean;
    }
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("family_members")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", memberId);

    if (error) {
        return { error: error.message };
    }

    return { error: null };
}

// ─── Remove a family member (admin action) ───────────────────────────
export async function removeFamilyMember(
    memberId: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberId);

    if (error) {
        return { error: error.message };
    }

    return { error: null };
}
