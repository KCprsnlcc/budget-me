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

/**
 * Converts role from hook to lowercase FamilyRole
 */
export function normalizeRole(role: FamilyRoleFromHook): FamilyRole | null {
  if (!role) return null;
  return role.toLowerCase() as FamilyRole;
}

/**
 * Determines goal permissions based on family role
 */
export function getGoalPermissions(
  currentUserRole: FamilyRoleFromHook,
  isOwner: boolean,
  goalOwnerId?: string,
  currentUserId?: string
): GoalPermissions {
  // Normalize the role to lowercase
  const normalizedRole = normalizeRole(currentUserRole);
  
  // Default permissions (no access)
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

  // All authenticated users can view goals
  permissions.canView = true;

  // Owner gets full permissions regardless of database role
  if (isOwner) {
    permissions.canAdd = true;
    permissions.canEdit = true;
    permissions.canDelete = true;
    permissions.canContribute = true;
    return permissions;
  }

  switch (normalizedRole) {
    case "admin":
      // Admin: Full access to all family goals
      permissions.canAdd = true;
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canContribute = true;
      break;

    case "member":
      // Member: Can only contribute to goals, cannot add/edit/delete
      permissions.canAdd = false;
      permissions.canEdit = false;
      permissions.canDelete = false;
      permissions.canContribute = true;
      break;

    case "viewer":
      // Viewer: Can manage personal goals only, read-only for family goals
      permissions.canAdd = false;
      permissions.canEdit = false;
      permissions.canDelete = false;
      permissions.canContribute = false;
      break;
  }

  // Special case: Member and Viewer can edit/delete their own personal goals (not family goals)
  if ((normalizedRole === "member" || normalizedRole === "viewer") && goalOwnerId && currentUserId) {
    if (goalOwnerId === currentUserId) {
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canAdd = true;
    }
  }

  return permissions;
}

/**
 * Gets the display role name from database role
 */
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

/**
 * Checks if a user can create family goals
 */
export function canCreateFamilyGoals(currentUserRole: FamilyRoleFromHook, isOwner?: boolean): boolean {
  if (isOwner) return true;
  
  const normalizedRole = normalizeRole(currentUserRole);
  return normalizedRole === "admin";
}

/**
 * Checks if a user can edit a specific goal
 */
export function canEditGoal(
  goal: { isFamily: boolean; user_id: string },
  currentUserRole: FamilyRoleFromHook,
  isOwner: boolean,
  currentUserId?: string
): boolean {
  const permissions = getGoalPermissions(currentUserRole, isOwner, goal.user_id, currentUserId);
  
  // For family goals, check role permissions
  if (goal.isFamily) {
    return permissions.canEdit;
  }
  
  // For personal goals, user can edit their own
  return goal.user_id === currentUserId;
}

/**
 * Checks if a user can delete a specific goal
 */
export function canDeleteGoal(
  goal: { isFamily: boolean; user_id: string },
  currentUserRole: FamilyRoleFromHook,
  isOwner: boolean,
  currentUserId?: string
): boolean {
  const permissions = getGoalPermissions(currentUserRole, isOwner, goal.user_id, currentUserId);
  
  // For family goals, check role permissions
  if (goal.isFamily) {
    return permissions.canDelete;
  }
  
  // For personal goals, user can delete their own
  return goal.user_id === currentUserId;
}
