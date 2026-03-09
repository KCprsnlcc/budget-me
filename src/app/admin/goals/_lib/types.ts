// Admin Goal Management Types

export type GoalCategory = "emergency" | "vacation" | "house" | "car" | "education" | "retirement" | "debt" | "general";
export type GoalPriority = "low" | "medium" | "high" | "urgent";
export type GoalStatus = "not_started" | "in_progress" | "completed" | "cancelled" | "paused";

export type AdminGoal = {
    id: string;
    user_id: string;
    goal_name: string;
    description: string | null;
    target_amount: number;
    current_amount: number;
    currency: string;
    target_date: string | null;
    created_date: string;
    completed_date: string | null;
    priority: GoalPriority;
    category: GoalCategory;
    status: GoalStatus;
    family_id: string | null;
    is_family_goal: boolean;
    is_public: boolean;
    auto_contribute: boolean;
    auto_contribute_amount: number;
    auto_contribute_frequency: string | null;
    notes: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    user_email?: string;
    user_name?: string;
    user_avatar?: string;
    family_name?: string;
    contribution_count?: number;
    progress_percentage?: number;
};

export type AdminGoalStats = {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalSaved: number;
    totalTargeted: number;
    averageProgress: number;
    goalGrowth: { month: string; count: number }[];
    categoryDistribution: { category: string; count: number; percentage: number }[];
    activeUsers: number;
    monthOverMonthGrowth: number;
    topSavers: {
        user_id: string;
        email: string;
        full_name?: string | null;
        avatar_url?: string | null;
        total_saved: number;
        goal_count: number;
    }[];
};

export type AdminGoalFilters = {
    month?: number | "all";
    year?: number | "all";
    status?: string;
    priority?: string;
    category?: string;
    userId?: string;
    isFamily?: string;
};

export type AdminGoalFormState = {
    user_id: string;
    goal_name: string;
    description: string;
    target_amount: string;
    current_amount: string;
    priority: GoalPriority;
    category: GoalCategory;
    target_date: string;
    is_family_goal: boolean;
    is_public: boolean;
    auto_contribute_amount: string;
    notes: string;
    family_id: string;
};
