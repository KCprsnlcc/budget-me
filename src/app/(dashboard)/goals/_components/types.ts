export type GoalPriority = "high" | "medium" | "low";
export type GoalStatus = "in_progress" | "completed" | "overdue" | "behind";
export type GoalCategory = "emergency" | "housing" | "education" | "travel" | "transport" | "electronics" | "other";

export interface GoalType {
  id: string;
  name: string;
  target: number;
  current: number;
  priority: GoalPriority;
  status: GoalStatus;
  category: GoalCategory;
  deadline: string;
  monthlyContribution: number;
  isFamily?: boolean;
  icon?: string;
}

export interface GoalFormState {
  name: string;
  target: string;
  priority: GoalPriority;
  category: GoalCategory;
  deadline: string;
  monthlyContribution: string;
  isFamily: boolean;
}

export interface GoalModalProps {
  open: boolean;
  onClose: () => void;
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
