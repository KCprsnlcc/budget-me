import { createClient } from "@/lib/supabase/client";
import type {
  Family,
  FamilyMember,
  SharedGoal,
  GoalContribution,
  ActivityItem,
  JoinRequest,
  PublicFamily,
  Invitation,
  CreateFamilyData,
  EditFamilyData,
  InviteMemberData,
} from "../_components/types";

const supabase = createClient();

/* ------------------------------------------------------------------ */
/*  Row → Client-type mappers                                         */
/* ------------------------------------------------------------------ */

function mapFamilyRow(row: any): Family {
  return {
    id: row.id,
    name: row.family_name,
    description: row.description ?? "",
    type: row.is_public ? "public" : "private",
    currency: row.currency_pref ?? "PHP",
    members: [], // populated separately
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function mapMemberRow(row: any): FamilyMember {
  const profile = row.profiles ?? {};
  const fullName = profile.full_name || row.email || profile.email || "Unknown Member";
  const initials = fullName
    .split(" ")
    .map((n: string) => n ? n[0] : "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  // Determine display role: creator of the family is "Owner"
  const dbRole: string = row.role ?? "member";
  let displayRole: "Owner" | "Admin" | "Member" | "Viewer";
  if (row._isOwner) {
    displayRole = "Owner";
  } else if (dbRole === "admin") {
    displayRole = "Admin";
  } else if (dbRole === "viewer") {
    displayRole = "Viewer";
  } else {
    displayRole = "Member";
  }

  const statusMap: Record<string, "active" | "pending" | "inactive"> = {
    active: "active",
    pending: "pending",
    inactive: "inactive",
    removed: "inactive",
  };

  return {
    id: row.id,
    name: fullName,
    email: profile.email ?? "",
    initials,
    role: displayRole,
    status: statusMap[row.status] ?? "active",
    lastActive: profile.last_login
      ? formatRelativeTime(profile.last_login)
      : "Unknown",
    permissions: getRolePermissions(displayRole),
    spending: 0,
    budget: 0,
    joinedAt: row.joined_at
      ? new Date(row.joined_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
      : undefined,
    avatar: profile.avatar_url || undefined,
  };
}

function mapGoalRow(row: any): SharedGoal {
  const contributions: GoalContribution[] = (row.goal_contributions ?? []).map(
    (c: any) => ({
      id: c.id,
      memberId: c.user_id,
      memberName: c.profiles?.full_name || c.profiles?.email || "Unknown Member",
      memberAvatar: c.profiles?.avatar_url || undefined,
      amount: Number(c.amount),
      date: c.contribution_date ?? c.created_at,
    })
  );

  // Map DB status to UI status
  let uiStatus: SharedGoal["status"];
  const dbStatus = row.status ?? "in_progress";
  if (dbStatus === "completed") {
    uiStatus = "completed";
  } else if (dbStatus === "paused") {
    uiStatus = "paused";
  } else {
    // Determine on-track vs at-risk by progress vs time
    const progress = row.target_amount > 0
      ? Number(row.current_amount) / Number(row.target_amount)
      : 0;
    if (row.target_date) {
      const now = new Date();
      const target = new Date(row.target_date);
      const created = new Date(row.created_at);
      const totalDays = (target.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      const elapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      const timeProgress = totalDays > 0 ? elapsed / totalDays : 1;
      uiStatus = progress >= timeProgress * 0.7 ? "on-track" : "at-risk";
    } else {
      uiStatus = progress >= 0.5 ? "on-track" : "at-risk";
    }
  }

  return {
    id: row.id,
    name: row.goal_name,
    saved: Number(row.current_amount),
    target: Number(row.target_amount),
    members: row._memberCount ?? 0,
    createdAt: row.created_at,
    targetDate: row.target_date ?? undefined,
    status: uiStatus,
    createdBy: row.profiles?.full_name || row.profiles?.email || "Unknown Member",
    creatorAvatar: row.profiles?.avatar_url || undefined,
    contributions,
  };
}

function mapActivityRow(row: any): ActivityItem {
  const profile = row.profiles ?? {};
  return {
    id: row.id,
    type: mapActivityType(row.activity_type),
    action: row.description ?? "",
    memberName: profile.full_name || profile.email || "Unknown Member",
    memberEmail: profile.email || "",
    memberAvatar: profile.avatar_url || undefined,
    details: row.description ?? "",
    amount: row.amount ? Number(row.amount) : undefined,
    target: row.metadata?.target ?? undefined,
    timestamp: row.created_at,
    metadata: row.metadata ?? undefined,
  } as ActivityItem;
}

function mapJoinRequestRow(row: any): JoinRequest {
  const profile = row.profiles ?? {};
  return {
    id: row.id,
    name: profile.full_name || profile.email || "Unknown Requester",
    email: profile.email || "",
    avatar: profile.avatar_url || undefined,
    message: row.message ?? "",
    requestedAt: row.created_at,
    status: row.status as JoinRequest["status"],
    // Fields for 'sent' requests UI
    createdBy: row.families?.profiles?.full_name || row.families?.profiles?.email || "Unknown",
    createdByAvatar: row.families?.profiles?.avatar_url || undefined,
    memberCount: 0, // Fallback
  } as JoinRequest;
}

function mapPublicFamilyRow(row: any): PublicFamily {
  return {
    id: row.id,
    name: row.family_name,
    description: row.description ?? "",
    memberCount: row._memberCount ?? 0,
    createdBy: row._createdByName ?? "Unknown",
    createdAt: row.created_at,
    isPublic: true,
  };
}

function mapInvitationRow(row: any): Invitation {
  const family = row.families ?? {};
  const inviter = row.profiles ?? {};
  return {
    id: row.id,
    familyName: family.family_name ?? "Unknown Family",
    inviterName: inviter.full_name || inviter.email || "Unknown Inviter",
    inviterEmail: inviter.email || "",
    message: row.message ?? undefined,
    invitedAt: row.created_at,
    status: row.status as Invitation["status"],
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Now";
}

function getRolePermissions(role: string): string[] {
  switch (role) {
    case "Owner":
      return ["Full Access"];
    case "Admin":
      return ["View", "Edit", "Budget", "Manage Members"];
    case "Member":
      return ["View", "Add Transactions", "Edit Own"];
    case "Viewer":
      return ["View Only"];
    default:
      return ["View Only"];
  }
}

function mapActivityType(
  dbType: string
): "transaction" | "goal" | "member" | "budget" {
  switch (dbType) {
    case "transaction":
      return "transaction";
    case "goal":
    case "goal_contribution":
      return "goal";
    case "member_joined":
    case "member_left":
    case "member_invited":
    case "member":
      return "member";
    case "budget":
    case "budget_created":
    case "budget_updated":
      return "budget";
    default:
      return "member";
  }
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch user's family membership                             */
/* ------------------------------------------------------------------ */

export async function fetchUserFamily(
  userId: string
): Promise<{ data: Family | null; membership: any | null; error: string | null }> {
  // Find the user's active family membership
  const { data: membership, error: memErr } = await supabase
    .from("family_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (memErr) return { data: null, membership: null, error: memErr.message };
  if (!membership) return { data: null, membership: null, error: null };

  // Fetch the family
  const { data: familyRow, error: famErr } = await supabase
    .from("families")
    .select("*")
    .eq("id", membership.family_id)
    .eq("status", "active")
    .single();

  if (famErr) return { data: null, membership: null, error: famErr.message };

  const family = mapFamilyRow(familyRow);
  return { data: family, membership, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family members with profiles                         */
/* ------------------------------------------------------------------ */

export async function fetchFamilyMembers(
  familyId: string,
  familyCreatedBy: string
): Promise<{ data: FamilyMember[]; error: string | null }> {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("family_id", familyId)
    .in("status", ["active", "pending"])
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };

  const userIds = [
    ...new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean)),
  ];
  let profileMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, last_login")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = p;
    }
  }

  const members = (data ?? []).map((row: any) => {
    // Tag owner based on families.created_by
    row._isOwner = row.user_id === familyCreatedBy;
    row.profiles = profileMap[row.user_id] ?? {};
    return mapMemberRow(row);
  });

  return { data: members, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family goals with contributions                      */
/* ------------------------------------------------------------------ */

export async function fetchFamilyGoals(
  familyId: string
): Promise<{ data: SharedGoal[]; error: string | null }> {
  const { data, error } = await supabase
    .from("goals")
    .select(
      `
      *,
      goal_contributions (
        id, user_id, amount, contribution_date, created_at
      )
    `
    )
    .eq("family_id", familyId)
    .eq("is_family_goal", true)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const userIds = new Set<string>();
  for (const row of data ?? []) {
    if (row.user_id) userIds.add(row.user_id);
    for (const c of row.goal_contributions ?? []) {
      if (c.user_id) userIds.add(c.user_id);
    }
  }

  let profileMap: Record<string, any> = {};
  if (userIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", Array.from(userIds));
    for (const p of profiles ?? []) {
      profileMap[p.id] = p;
    }
  }

  // Get member count per goal (contributors)
  const goals = (data ?? []).map((row: any) => {
    row.profiles = profileMap[row.user_id] ?? {};
    if (row.goal_contributions) {
      row.goal_contributions = row.goal_contributions.map((c: any) => {
        c.profiles = profileMap[c.user_id] ?? {};
        return c;
      });
    }

    const uniqueContributors = new Set(
      (row.goal_contributions ?? []).map((c: any) => c.user_id)
    );
    row._memberCount = uniqueContributors.size;
    return mapGoalRow(row);
  });

  return { data: goals, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family activity log                                  */
/* ------------------------------------------------------------------ */

export async function fetchFamilyActivity(
  familyId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: ActivityItem[]; error: string | null; hasMore: boolean }> {
  const { data, error, count } = await supabase
    .from("family_activity_log")
    .select(
      "*",
      { count: "exact" }
    )
    .eq("family_id", familyId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { data: [], error: error.message, hasMore: false };

  const userIds = [
    ...new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean)),
  ];
  let profileMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = p;
    }
  }

  const activities = (data ?? []).map((row: any) => {
    row.profiles = profileMap[row.user_id] ?? {};
    return mapActivityRow(row);
  });

  const totalCount = count ?? 0;
  return { data: activities, error: null, hasMore: offset + limit < totalCount };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch pending join requests for a family                   */
/* ------------------------------------------------------------------ */

export async function fetchJoinRequests(
  familyId: string
): Promise<{ data: JoinRequest[]; error: string | null }> {
  const { data, error } = await supabase
    .from("family_join_requests")
    .select("*")
    .eq("family_id", familyId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const userIds = [
    ...new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean)),
  ];
  let profileMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = p;
    }
  }

  const requests = (data ?? []).map((row: any) => {
    row.profiles = profileMap[row.user_id] ?? {};
    return mapJoinRequestRow(row);
  });

  return { data: requests, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch public families (for discovery / join tab)           */
/* ------------------------------------------------------------------ */

export async function fetchPublicFamilies(
  userId: string
): Promise<{ data: PublicFamily[]; error: string | null }> {
  // Fetch public families that the user is NOT already a member of
  const { data: userMemberships } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .in("status", ["active", "pending"]);

  const memberFamilyIds = (userMemberships ?? []).map(
    (m: any) => m.family_id
  );

  let query = supabase
    .from("families")
    .select("*")
    .eq("is_public", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (memberFamilyIds.length > 0) {
    query = query.not("id", "in", `(${memberFamilyIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  // Get member counts for each family
  const familyIds = (data ?? []).map((f: any) => f.id);
  const { data: memberCounts } = await supabase
    .from("family_members")
    .select("family_id")
    .in("family_id", familyIds)
    .eq("status", "active");

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach((m: any) => {
    countMap[m.family_id] = (countMap[m.family_id] || 0) + 1;
  });

  // Get creator names separately to avoid FK join issues
  const creatorIds = (data ?? []).map((f: any) => f.created_by);
  const { data: creatorProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", creatorIds);

  const creatorMap: Record<string, string> = {};
  (creatorProfiles ?? []).forEach((p: any) => {
    creatorMap[p.id] = p.full_name || p.email || "Unknown";
  });

  const families = (data ?? []).map((row: any) => {
    row._memberCount = countMap[row.id] ?? 0;
    row._createdByName = creatorMap[row.created_by] ?? "Unknown";
    return mapPublicFamilyRow(row);
  });

  return { data: families, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch pending invitations for the current user             */
/* ------------------------------------------------------------------ */

export async function fetchUserInvitations(
  userEmail: string
): Promise<{ data: Invitation[]; error: string | null }> {
  const { data, error } = await supabase
    .from("family_invitations")
    .select(`
      *,
      families!family_invitations_family_id_fkey ( family_name )
    `)
    .eq("email", userEmail)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Fetch inviter profiles separately since invited_by points to auth.users, not profiles
  const invitations = data ?? [];
  const inviterIds = [...new Set(invitations.map((inv: any) => inv.invited_by).filter(Boolean))];
  
  let profileMap: Record<string, any> = {};
  if (inviterIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", inviterIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = p;
    }
  }

  // Map invitations with profile data
  const mappedInvitations = invitations.map((inv: any) => {
    inv.profiles = profileMap[inv.invited_by] ?? {};
    return mapInvitationRow(inv);
  });

  return { data: mappedInvitations, error: null };
}

/* ------------------------------------------------------------------ */
/*  CREATE — Create a new family                                      */
/* ------------------------------------------------------------------ */

export async function createFamily(
  userId: string,
  form: CreateFamilyData
): Promise<{ data: Family | null; error: string | null }> {
  if (!form.name.trim()) {
    return { data: null, error: "Family name is required." };
  }

  const { data: familyRow, error: createErr } = await supabase
    .from("families")
    .insert({
      family_name: form.name.trim(),
      description: form.description?.trim() || null,
      is_public: form.type === "public",
      created_by: userId,
      currency_pref: "PHP",
      status: "active",
    })
    .select("*")
    .single();

  if (createErr) return { data: null, error: createErr.message };

  // Add creator as admin member (Owner is derived from created_by)
  const { error: memberErr } = await supabase.from("family_members").insert({
    family_id: familyRow.id,
    user_id: userId,
    role: "admin",
    status: "active",
    can_create_goals: true,
    can_view_budgets: true,
    can_contribute_goals: true,
    joined_at: new Date().toISOString(),
  });

  if (memberErr) return { data: null, error: memberErr.message };

  return { data: mapFamilyRow(familyRow), error: null };
}

/* ------------------------------------------------------------------ */
/*  UPDATE — Edit family details                                      */
/* ------------------------------------------------------------------ */

export async function updateFamily(
  familyId: string,
  form: EditFamilyData
): Promise<{ data: Family | null; error: string | null }> {
  if (!form.name.trim()) {
    return { data: null, error: "Family name is required." };
  }

  const { data, error } = await supabase
    .from("families")
    .update({
      family_name: form.name.trim(),
      description: form.description?.trim() || null,
      is_public: form.visibility === "public",
      updated_at: new Date().toISOString(),
    })
    .eq("id", familyId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapFamilyRow(data), error: null };
}

/* ------------------------------------------------------------------ */
/*  DELETE — Delete a family                                          */
/* ------------------------------------------------------------------ */

export async function deleteFamily(
  familyId: string
): Promise<{ error: string | null }> {
  // Delete members first (cascade might handle this, but be explicit)
  await supabase.from("family_members").delete().eq("family_id", familyId);
  await supabase.from("family_invitations").delete().eq("family_id", familyId);
  await supabase
    .from("family_join_requests")
    .delete()
    .eq("family_id", familyId);
  await supabase.from("family_activity_log").delete().eq("family_id", familyId);

  const { error } = await supabase
    .from("families")
    .delete()
    .eq("id", familyId);

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  DELETE — Leave a family (remove own membership)                   */
/* ------------------------------------------------------------------ */

export async function leaveFamily(
  familyId: string,
  userId: string
): Promise<{ error: string | null }> {
  // Prevent the family owner from leaving without transferring ownership
  const { data: family, error: famErr } = await supabase
    .from("families")
    .select("created_by")
    .eq("id", familyId)
    .single();

  if (famErr) return { error: "Family not found." };

  if (family.created_by === userId) {
    return {
      error:
        "Family owners cannot leave the family. Transfer ownership to another member first.",
    };
  }

  // Verify user is an active member
  const { data: membership, error: memErr } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (memErr || !membership) {
    return { error: "You are not an active member of this family." };
  }

  const { error } = await supabase
    .from("family_members")
    .update({ status: "removed", updated_at: new Date().toISOString() })
    .eq("family_id", familyId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  CREATE — Send an invitation                                       */
/* ------------------------------------------------------------------ */

export async function sendInvitation(
  familyId: string,
  userId: string,
  form: InviteMemberData
): Promise<{ error: string | null }> {
  const email = form.email.trim().toLowerCase();

  if (!email) {
    return { error: "Email is required." };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  // Self-invite check
  const { data: selfProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (selfProfile?.email?.toLowerCase() === email) {
    return { error: "You cannot invite yourself." };
  }

  // Check if email user is already a member of this family
  const { data: existingMembers } = await supabase
    .from("family_members")
    .select("user_id, status")
    .eq("family_id", familyId)
    .in("status", ["active", "pending"]);

  if (existingMembers && existingMembers.length > 0) {
    const memberUserIds = existingMembers.map((m: any) => m.user_id);
    const { data: memberProfiles } = await supabase
      .from("profiles")
      .select("email")
      .in("id", memberUserIds);

    const alreadyMember = (memberProfiles ?? []).some(
      (p: any) => p.email?.toLowerCase() === email
    );
    if (alreadyMember) {
      return { error: "This user is already a member of your family." };
    }
  }

  // Check for existing pending invitation for same email + family
  const { data: existingInvitation } = await supabase
    .from("family_invitations")
    .select("id, expires_at")
    .eq("family_id", familyId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvitation) {
    const isExpired = existingInvitation.expires_at
      ? new Date(existingInvitation.expires_at) < new Date()
      : false;
    if (!isExpired) {
      return { error: "A pending invitation already exists for this email." };
    }
    // Expired invitation exists — mark it expired so we can send a new one
    await supabase
      .from("family_invitations")
      .update({ status: "expired" })
      .eq("id", existingInvitation.id);
  }

  // Generate a simple token
  const token = crypto.randomUUID();

  const { error } = await supabase.from("family_invitations").insert({
    family_id: familyId,
    invited_by: userId,
    email,
    role: form.role,
    message: form.message?.trim() || null,
    invitation_token: token,
    status: "pending",
  });

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  UPDATE — Accept / Decline invitation                              */
/* ------------------------------------------------------------------ */

export async function respondToInvitation(
  invitationId: string,
  userId: string,
  accept: boolean
): Promise<{ error: string | null }> {
  const { data: invitation, error: fetchErr } = await supabase
    .from("family_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (fetchErr) return { error: fetchErr.message };

  // Validate invitation is still pending
  if (invitation.status !== "pending") {
    return { error: "This invitation has already been responded to." };
  }

  // Check if invitation has expired
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from("family_invitations")
      .update({ status: "expired" })
      .eq("id", invitationId);
    return { error: "This invitation has expired." };
  }

  const { error: updateErr } = await supabase
    .from("family_invitations")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", invitationId);

  if (updateErr) return { error: updateErr.message };

  if (accept) {
    // Add user as member
    const { error: memberErr } = await supabase.from("family_members").insert({
      family_id: invitation.family_id,
      user_id: userId,
      role: invitation.role ?? "member",
      status: "active",
      can_create_goals: invitation.role === "admin",
      can_view_budgets: true,
      can_contribute_goals: true,
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      joined_at: new Date().toISOString(),
    });

    if (memberErr) return { error: memberErr.message };
  }

  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  CREATE — Send a join request for a public family                  */
/* ------------------------------------------------------------------ */

export async function sendJoinRequest(
  familyId: string,
  userId: string,
  message?: string
): Promise<{ error: string | null }> {
  // Check if request already exists
  const { data: existing } = await supabase
    .from("family_join_requests")
    .select("id")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return { error: "You already have a pending request for this family." };
  }

  const { error } = await supabase.from("family_join_requests").insert({
    family_id: familyId,
    user_id: userId,
    message: message?.trim() || null,
    status: "pending",
  });

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  UPDATE — Approve / Decline a join request                         */
/* ------------------------------------------------------------------ */

export async function respondToJoinRequest(
  requestId: string,
  reviewerId: string,
  approve: boolean
): Promise<{ error: string | null }> {
  const { data: request, error: fetchErr } = await supabase
    .from("family_join_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchErr) return { error: fetchErr.message };

  const { error: updateErr } = await supabase
    .from("family_join_requests")
    .update({
      status: approve ? "approved" : "declined",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateErr) return { error: updateErr.message };

  if (approve) {
    const { error: memberErr } = await supabase.from("family_members").insert({
      family_id: request.family_id,
      user_id: request.user_id,
      role: "member",
      status: "active",
      can_create_goals: false,
      can_view_budgets: true,
      can_contribute_goals: true,
      joined_at: new Date().toISOString(),
    });

    if (memberErr) return { error: memberErr.message };
  }

  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch user's pending join requests                          */
/* ------------------------------------------------------------------ */

export async function fetchUserJoinRequests(
  userId: string
): Promise<{ data: any[]; error: string | null }> {
  const { data, error } = await supabase
    .from("family_join_requests")
    .select(`
      family_id,
      status,
      created_at,
      families!family_join_requests_family_id_fkey (
        family_name,
        description,
        created_by
      )
    `)
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Get member counts for each family
  const familyIds = (data ?? []).map((req: any) => req.family_id);
  const { data: memberCounts } = await supabase
    .from("family_members")
    .select("family_id")
    .in("family_id", familyIds)
    .eq("status", "active");

  const countMap: Record<string, number> = {};
  (memberCounts ?? []).forEach((m: any) => {
    countMap[m.family_id] = (countMap[m.family_id] || 0) + 1;
  });

  // Get creator names
  const creatorIds = (data ?? []).map((req: any) => req.families?.created_by).filter(Boolean);
  const { data: creatorProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", creatorIds);

  const creatorMap: Record<string, string> = {};
  (creatorProfiles ?? []).forEach((p: any) => {
    creatorMap[p.id] = p.full_name ?? "Unknown";
  });

  // Enrich the data
  const enrichedData = (data ?? []).map((req: any) => ({
    ...req,
    memberCount: countMap[req.family_id] ?? 0,
    createdBy: creatorMap[req.families?.created_by] ?? "Unknown",
    requestedAt: req.created_at,
  }));

  return { data: enrichedData, error: null };
}

/* ------------------------------------------------------------------ */
/*  DELETE — Delete all user's join requests                          */
/* ------------------------------------------------------------------ */

export async function deleteAllUserJoinRequests(
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("family_join_requests")
    .delete()
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  UPDATE — Change member role                                       */
/* ------------------------------------------------------------------ */

export async function updateMemberRole(
  memberId: string,
  newRole: string,
  requestingUserId?: string
): Promise<{ error: string | null }> {
  const roleMap: Record<string, string> = {
    Admin: "admin",
    Member: "member",
    Viewer: "viewer",
  };

  const dbRole = roleMap[newRole] ?? "member";

  // Fetch member record to get user_id and family_id for the RPC
  const { data: member, error: fetchErr } = await supabase
    .from("family_members")
    .select("user_id, family_id")
    .eq("id", memberId)
    .single();

  if (fetchErr || !member) {
    return { error: "Member not found." };
  }

  // Use the RPC function for permission-enforced role reassignment
  if (requestingUserId) {
    const { error: rpcErr } = await supabase.rpc("reassign_member_role", {
      p_family_id: member.family_id,
      p_member_user_id: member.user_id,
      p_new_role: dbRole,
      p_requesting_user_id: requestingUserId,
    });

    if (rpcErr) return { error: rpcErr.message };
  } else {
    // Fallback: direct update when no requesting user context
    const { error } = await supabase
      .from("family_members")
      .update({
        role: dbRole,
        can_create_goals: dbRole === "admin",
        can_view_budgets: true,
        can_contribute_goals: dbRole !== "viewer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (error) return { error: error.message };
  }

  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  CREATE — Contribute to a goal                                     */
/* ------------------------------------------------------------------ */

export async function contributeToGoal(
  goalId: string,
  userId: string,
  amount: number
): Promise<{ error: string | null }> {
  if (amount <= 0) return { error: "Amount must be greater than zero." };

  // Insert contribution
  const { error: contribErr } = await supabase
    .from("goal_contributions")
    .insert({
      goal_id: goalId,
      user_id: userId,
      amount,
      contribution_date: new Date().toISOString().split("T")[0],
    });

  if (contribErr) return { error: contribErr.message };

  // Update goal current_amount
  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount, target_amount")
    .eq("id", goalId)
    .single();

  if (goal) {
    const newAmount = Number(goal.current_amount) + amount;
    const updates: Record<string, any> = {
      current_amount: newAmount,
      updated_at: new Date().toISOString(),
    };
    if (newAmount >= Number(goal.target_amount)) {
      updates.status = "completed";
      updates.completed_date = new Date().toISOString().split("T")[0];
    }

    await supabase.from("goals").update(updates).eq("id", goalId);
  }

  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch overview stats for family dashboard                  */
/* ------------------------------------------------------------------ */

export interface FamilyOverviewStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalGoals: number;
  goalsProgress: number;
  totalGoalsSaved: number;
  totalGoalsTarget: number;
}

export async function fetchFamilyOverview(
  familyId: string
): Promise<{ data: FamilyOverviewStats | null; error: string | null }> {
  // Members count
  const { data: memberData } = await supabase
    .from("family_members")
    .select("status")
    .eq("family_id", familyId)
    .in("status", ["active", "pending"]);

  const active = (memberData ?? []).filter(
    (m: any) => m.status === "active"
  ).length;
  const pending = (memberData ?? []).filter(
    (m: any) => m.status === "pending"
  ).length;

  // Goals stats
  const { data: goalsData } = await supabase
    .from("goals")
    .select("current_amount, target_amount, status")
    .eq("family_id", familyId)
    .eq("is_family_goal", true);

  const totalGoalsSaved = (goalsData ?? []).reduce(
    (sum: number, g: any) => sum + Number(g.current_amount),
    0
  );
  const totalGoalsTarget = (goalsData ?? []).reduce(
    (sum: number, g: any) => sum + Number(g.target_amount),
    0
  );
  const goalsProgress =
    totalGoalsTarget > 0
      ? Math.round((totalGoalsSaved / totalGoalsTarget) * 100)
      : 0;

  return {
    data: {
      totalMembers: active + pending,
      activeMembers: active,
      pendingMembers: pending,
      totalGoals: (goalsData ?? []).length,
      goalsProgress,
      totalGoalsSaved,
      totalGoalsTarget,
    },
    error: null,
  };
}

/* ------------------------------------------------------------------ */
/*  Types for family dashboard charts                                 */
/* ------------------------------------------------------------------ */

export interface FamilyCategoryBreakdown {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface FamilyMonthlyChartPoint {
  month: string;
  budget: number;
  actual: number;
}

export interface FamilyGoalsSavingsPoint {
  month: string;
  target: number;
  saved: number;
  targetValue: number;
  savedValue: number;
}

export interface FamilyGoalsHealthItem {
  name: string;
  value: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family expense categories (donut chart data)         */
/* ------------------------------------------------------------------ */

export async function fetchFamilyExpenseCategories(
  familyId: string
): Promise<{ data: FamilyCategoryBreakdown[]; total: number; error: string | null }> {
  // Get all active family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId)
    .eq("status", "active");

  const userIds = (members ?? []).map((m: any) => m.user_id);
  if (userIds.length === 0) {
    return { data: [], total: 0, error: null };
  }

  // Fetch expense transactions for all family members
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, expense_categories ( category_name, color )")
    .in("user_id", userIds)
    .eq("type", "expense")
    .eq("status", "completed");

  // Aggregate by category
  const map = new Map<string, { color: string; amount: number }>();
  for (const row of transactions ?? []) {
    const cat = row.expense_categories as Record<string, any> | null;
    const name = cat?.category_name ?? "Uncategorized";
    const color = cat?.color ?? "#94a3b8";
    const existing = map.get(name);
    if (existing) {
      existing.amount += Number(row.amount);
    } else {
      map.set(name, { color, amount: Number(row.amount) });
    }
  }

  const total = Array.from(map.values()).reduce((sum, v) => sum + v.amount, 0);

  const data: FamilyCategoryBreakdown[] = Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      color: v.color,
      amount: v.amount,
      percentage: total > 0 ? Math.round((v.amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5 categories

  return { data, total, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family budget vs actual spending (6-month chart)    */
/* ------------------------------------------------------------------ */

export async function fetchFamilyBudgetVsActual(
  familyId: string,
  months: number = 6
): Promise<{ data: FamilyMonthlyChartPoint[]; error: string | null }> {
  // Get all active family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId)
    .eq("status", "active");

  const userIds = (members ?? []).map((m: any) => m.user_id);
  if (userIds.length === 0) {
    // Return empty data for each month
    const now = new Date();
    const emptyData: FamilyMonthlyChartPoint[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      emptyData.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        budget: 0,
        actual: 0,
      });
    }
    return { data: emptyData, error: null };
  }

  const now = new Date();
  const points: FamilyMonthlyChartPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = new Date(y, m, 0);
    const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    // Fetch all family transactions for this month
    const { data } = await supabase
      .from("transactions")
      .select("type, amount")
      .in("user_id", userIds)
      .eq("status", "completed")
      .gte("date", start)
      .lte("date", end);

    let budget = 0; // Income treated as "budget" for family context
    let actual = 0; // Expenses

    for (const row of data ?? []) {
      const amt = Number(row.amount);
      if (row.type === "income" || row.type === "cash_in") {
        budget += amt;
      } else if (row.type === "expense") {
        actual += amt;
      }
    }

    const label = d.toLocaleDateString("en-US", { month: "short" });
    points.push({ month: label, budget, actual });
  }

  return { data: points, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family goals savings progress (6-month chart)         */
/* ------------------------------------------------------------------ */

export async function fetchFamilyGoalsSavingsProgress(
  familyId: string,
  months: number = 6
): Promise<{ data: FamilyGoalsSavingsPoint[]; error: string | null }> {
  // Get all active family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId)
    .eq("status", "active");

  const userIds = (members ?? []).map((m: any) => m.user_id);
  if (userIds.length === 0) {
    return { data: [], error: null };
  }

  // Fetch all family goals from active family members only
  const { data: goals } = await supabase
    .from("goals")
    .select("target_amount, current_amount, created_at")
    .in("user_id", userIds)
    .eq("is_family_goal", true)
    .eq("is_public", false); // Ensure we don't get any public goals

  // Calculate totals (similar to goals page)
  const totalTarget = (goals ?? []).reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = (goals ?? []).reduce((s, g) => s + Number(g.current_amount), 0);
  const savedPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const now = new Date();
  const points: FamilyGoalsSavingsPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });

    // Use the same progressive calculation as goals page
    const factor = (months - i) / months;
    const targetHeight = Math.round(80 * factor + 20);
    const savedHeight = Math.round(savedPct * factor);
    const targetVal = Math.round(totalTarget * (targetHeight / 100));
    const savedVal = Math.round(totalSaved * (savedHeight / 100));

    points.push({
      month: label,
      target: targetHeight,
      saved: savedHeight,
      targetValue: targetVal,
      savedValue: savedVal,
    });
  }

  return { data: points, error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch family goals health (donut chart data)                  */
/* ------------------------------------------------------------------ */

export async function fetchFamilyGoalsHealth(
  familyId: string
): Promise<{ data: FamilyGoalsHealthItem[]; total: number; error: string | null }> {
  // Get all active family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId)
    .eq("status", "active");

  const userIds = (members ?? []).map((m: any) => m.user_id);
  if (userIds.length === 0) {
    return { data: [], total: 0, error: null };
  }

  // Fetch all family goals from active family members only
  const { data: goals } = await supabase
    .from("goals")
    .select("status")
    .in("user_id", userIds)
    .eq("is_family_goal", true)
    .eq("is_public", false); // Ensure we don't get any public goals

  // Count goals by status
  const statusCounts = {
    completed: 0,
    in_progress: 0,
    behind: 0,
    overdue: 0,
  };

  for (const goal of goals ?? []) {
    if (goal.status in statusCounts) {
      statusCounts[goal.status as keyof typeof statusCounts]++;
    }
  }

  const total = (goals ?? []).length;

  const healthData: FamilyGoalsHealthItem[] = [
    { name: "Completed", value: statusCounts.completed, color: "#10b981" },
    { name: "In Progress", value: statusCounts.in_progress, color: "#3b82f6" },
    { name: "Behind", value: statusCounts.behind, color: "#f59e0b" },
    { name: "Overdue", value: statusCounts.overdue, color: "#ef4444" },
  ].filter(item => item.value > 0); // Only show statuses that have goals

  return { data: healthData, total, error: null };
}

/* ------------------------------------------------------------------ */
/*  DELETE — Remove a family member (admin/owner action)              */
/* ------------------------------------------------------------------ */

export async function removeMember(
  memberId: string,
  requestingUserId: string
): Promise<{ error: string | null }> {
  // Fetch the target member record
  const { data: member, error: fetchErr } = await supabase
    .from("family_members")
    .select("user_id, family_id, status")
    .eq("id", memberId)
    .single();

  if (fetchErr || !member) {
    return { error: "Member not found." };
  }

  if (member.status !== "active") {
    return { error: "This member is not currently active." };
  }

  // Prevent self-removal (use leave family instead)
  if (member.user_id === requestingUserId) {
    return { error: "You cannot remove yourself. Use the leave family option instead." };
  }

  // Check family ownership
  const { data: family, error: famErr } = await supabase
    .from("families")
    .select("created_by")
    .eq("id", member.family_id)
    .single();

  if (famErr || !family) {
    return { error: "Family not found." };
  }

  // Cannot remove the family owner
  if (member.user_id === family.created_by) {
    return { error: "Cannot remove the family owner. Transfer ownership first." };
  }

  // Check that the requesting user has permission (owner or admin)
  const isOwner = family.created_by === requestingUserId;
  if (!isOwner) {
    const { data: reqMember } = await supabase
      .from("family_members")
      .select("role")
      .eq("family_id", member.family_id)
      .eq("user_id", requestingUserId)
      .eq("status", "active")
      .single();

    if (!reqMember || reqMember.role !== "admin") {
      return { error: "Only family owners and admins can remove members." };
    }
  }

  const { error } = await supabase
    .from("family_members")
    .update({ status: "removed", updated_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  UPDATE — Transfer family ownership                                */
/* ------------------------------------------------------------------ */

export async function transferOwnership(
  familyId: string,
  newOwnerUserId: string,
  currentOwnerUserId: string
): Promise<{ error: string | null }> {
  // Use the RPC function for atomic ownership transfer
  const { error } = await supabase.rpc("transfer_family_ownership", {
    p_family_id: familyId,
    p_new_owner_user_id: newOwnerUserId,
    p_current_owner_user_id: currentOwnerUserId,
  });

  if (error) return { error: error.message };
  return { error: null };
}

/* ------------------------------------------------------------------ */
/*  READ — Fetch sent (outgoing) invitations for a family             */
/* ------------------------------------------------------------------ */

export interface SentInvitation {
  id: string;
  email: string;
  role: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  sentAt: string;
  expiresAt: string | null;
  inviterName: string;
}

export async function fetchSentInvitations(
  familyId: string
): Promise<{ data: SentInvitation[]; error: string | null }> {
  const { data, error } = await supabase
    .from("family_invitations")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { data: [], error: error.message };

  // Collect unique invited_by IDs and batch-fetch profile names
  const inviterIds = [
    ...new Set((data ?? []).map((r: any) => r.invited_by).filter(Boolean)),
  ];
  let profileMap: Record<string, string> = {};
  if (inviterIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", inviterIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = p.full_name ?? "Unknown";
    }
  }

  const invitations: SentInvitation[] = (data ?? []).map((row: any) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    message: row.message,
    status: row.status as SentInvitation["status"],
    sentAt: row.created_at,
    expiresAt: row.expires_at,
    inviterName: profileMap[row.invited_by] ?? "Unknown",
  }));

  return { data: invitations, error: null };
}
