export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "active" | "pending" | "inactive";
  lastActive: string;
  permissions: string[];
  spending: number;
  budget: number;
  joinedAt?: string;
  avatar?: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  type: "private" | "public";
  currency: string;
  members: FamilyMember[];
  createdAt: string;
  createdBy: string;
}

export interface SharedGoal {
  id: string;
  name: string;
  saved: number;
  target: number;
  members: number;
  createdAt: string;
  targetDate?: string;
  status: "on-track" | "at-risk" | "completed" | "paused";
  createdBy: string;
  contributions: GoalContribution[];
}

export interface GoalContribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
}

export interface ActivityItem {
  id: string;
  type: "transaction" | "goal" | "member" | "budget";
  action: string;
  memberName: string;
  memberEmail: string;
  details: string;
  amount?: number;
  target?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  requestedAt: string;
  status: "pending" | "approved" | "declined";
}

export interface PublicFamily {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}

export interface Invitation {
  id: string;
  familyName: string;
  inviterName: string;
  inviterEmail: string;
  message?: string;
  invitedAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

export interface InviteMemberData {
  email: string;
  role: "member" | "admin" | "viewer";
  message?: string;
}

export interface CreateFamilyData {
  name: string;
  description?: string;
  type: "private" | "public";
}

export interface EditFamilyData {
  name: string;
  description?: string;
  visibility: "private" | "public";
}

export type FamilyState = "no-family" | "has-family" | "loading" | "error";
export type ActiveTab = "overview" | "members" | "activity" | "goals";
export type NoFamilyTab = "create" | "join" | "invitations";
export type ModalStep = 1 | 2;

export interface StepperProps {
  currentStep: ModalStep;
  totalSteps: number;
  labels: string[];
}

export interface TabContentProps {
  familyData: Family | null;
  members: FamilyMember[];
  activities: ActivityItem[];
  goals: SharedGoal[];
  pendingRequests: JoinRequest[];
  isLoading: boolean;
  error: string | null;
}
