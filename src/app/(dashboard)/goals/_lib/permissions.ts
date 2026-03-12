import type { FamilyMember } from "../../family/_components/types";

export type FamilyRole = "owner" | "admin" | "member" | "viewer";
export type FamilyRoleFromHook = "Owner" | "Admin" | "Member" | "Viewer" | null;

export interface GoalPermissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canContribute: boolean;
  canView: boolean;
}

export function normalizeRole(role: FamilyRoleFromHook): FamilyRole | null {
  if (!role) return null;
  return role.toLowerCase() as FamilyRole;
}

export function getGoalPermissions(
  currentUserRole: FamilyRoleFromHook,
  isOwner: boolean,
  goalOwnerId?: string,
  currentUserId?: string
): GoalPermissions {

  const normalizedRole = normalizeRole(currentUserRole);

  const permissions: GoalPermissions = {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canContribute: false,
    canView: false,
  };

  if (!currentUserRole) {
    return permissions;
  }

  permissions.canView = true;

  if (isOwner) {
    permissions.canAdd = true;
    permissions.canEdit = true;
    permissions.canDelete = true;
    permissions.canContribute = true;
    return permissions;
  }

  switch (normalizedRole) {
    case "admin":

      permissions.canAdd = true;
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canContribute = true;
      break;

    case "member":

      permissions.canAdd = false;
      permissions.canEdit = false;
      permissions.canDelete = false;
      permissions.canContribute = true;
      break;

    case "viewer":

      permissions.canAdd = false;
      permissions.canEdit = false;
      permissions.canDelete = false;
      permissions.canContribute = false;
      break;
  }

  if ((normalizedRole === "member" || normalizedRole === "viewer") && goalOwnerId && currentUserId) {
    if (goalOwnerId === currentUserId) {
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canAdd = true;
    }
  }

  return permissions;
}

export function getDisplayRole(role: string, isOwner: boolean): FamilyRole {
  if (isOwner) return "owner";
  
  switch (role) {
    case "admin":
      return "admin";
    case "member":
      return "member";
    case "viewer":
      return "viewer";
    default:
      return "member";
  }
}

export function canCreateFamilyGoals(currentUserRole: FamilyRoleFromHook, isOwner?: boolean): boolean {
  if (isOwner) return true;
  
  const normalizedRole = normalizeRole(currentUserRole);
  return normalizedRole === "admin";
}

export function canEditGoal(
  goal: { isFamily: boolean; user_id: string },
  currentUserRole: FamilyRoleFromHook,
  isOwner: boolean,
  currentUserId?: string
): boolean {
  const permissions = getGoalPermissions(currentUserRole, isOwner, goal.user_id, currentUserId);

  if (goal.isFamily) {
    return permissions.canEdit;
  }

  return goal.user_id === currentUserId;
}

export function canDeleteGoal(
  goal: { isFamily: boolean; user_id: string },
  currentUserRole: FamilyRoleFromHook,
  isOwner: boolean,
  currentUserId?: string
): boolean {
  const permissions = getGoalPermissions(currentUserRole, isOwner, goal.user_id, currentUserId);

  if (goal.isFamily) {
    return permissions.canDelete;
  }

  return goal.user_id === currentUserId;
}
