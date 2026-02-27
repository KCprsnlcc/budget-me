export type GoalPriority = "high" | "medium" | "low";
export type GoalStatus = "in_progress" | "completed" | "overdue" | "behind";
export type GoalCategory = "emergency" | "vacation" | "house" | "car" | "education" | "retirement" | "debt" | "general";

export interface GoalType {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target: number;
  current: number;
  priority: GoalPriority;
  status: GoalStatus;
  category: GoalCategory;
  deadline: string;
  monthlyContribution: number;
  isFamily: boolean;
  is_public: boolean;
  family_id: string | null;
  notes: string | null;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalFormState {
  name: string;
  target: string;
  priority: GoalPriority;
  category: GoalCategory;
  deadline: string;
  monthlyContribution: string;
  isFamily: boolean;
  isPublic: boolean;
}

export interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface AddGoalModalProps extends GoalModalProps {}

export interface ViewGoalModalProps extends GoalModalProps {
  goal: GoalType | null;
  onEdit?: (goal: GoalType) => void;
  onContribute?: (goal: GoalType) => void;
}

export interface EditGoalModalProps extends GoalModalProps {
  goal: GoalType | null;
}

export interface DeleteGoalModalProps extends GoalModalProps {
  goal: GoalType | null;
}

export interface ContributeGoalModalProps extends GoalModalProps {
  goal: GoalType | null;
}
