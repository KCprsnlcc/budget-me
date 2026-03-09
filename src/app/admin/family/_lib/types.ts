// Admin Family Management Types

export type AdminFamily = {
    id: string;
    family_name: string;
    description: string | null;
    currency_pref: string;
    is_public: boolean;
    max_members: number;
    allow_goal_sharing: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    status: "active" | "inactive";
    // Joined data
    creator_email?: string;
    creator_name?: string;
    creator_avatar?: string;
    member_count?: number;
    members?: AdminFamilyMember[];
};

export type AdminFamilyMember = {
    id: string;
    family_id: string;
    user_id: string;
    role: "admin" | "member" | "viewer";
    status: "active" | "pending" | "inactive" | "removed";
    can_create_goals: boolean;
    can_contribute_goals: boolean;
    invited_by: string | null;
    joined_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    user_email?: string;
    user_name?: string;
    user_avatar?: string;
};

export type AdminFamilyInvitation = {
    id: string;
    family_id: string;
    invited_by: string;
    email: string;
    role: "admin" | "member" | "viewer";
    invitation_token: string;
    message: string | null;
    status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
    expires_at: string | null;
    responded_at: string | null;
    created_at: string;
    // Joined data
    family_name?: string;
    inviter_email?: string;
    inviter_name?: string;
};

export type AdminFamilyJoinRequest = {
    id: string;
    family_id: string;
    user_id: string;
    message: string | null;
    status: "pending" | "approved" | "rejected" | "cancelled";
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_message: string | null;
    created_at: string;
    // Joined data
    family_name?: string;
    user_email?: string;
    user_name?: string;
    user_avatar?: string;
};

export type AdminFamilyStats = {
    totalFamilies: number;
    activeFamilies: number;
    inactiveFamilies: number;
    totalMembers: number;
    totalInvitations: number;
    pendingInvitations: number;
    pendingJoinRequests: number;
    avgMembersPerFamily: number;
    publicFamilies: number;
    privateFamilies: number;
    familyGrowth: { month: string; count: number }[];
    statusDistribution: { status: string; count: number; percentage: number }[];
    topFamilies: {
        family_id: string;
        family_name: string;
        member_count: number;
        creator_name?: string | null;
        creator_email?: string | null;
        creator_avatar?: string | null;
    }[];
};

export type AdminFamilyFilters = {
    status?: string;
    visibility?: string; // "public" | "private"
    userId?: string; // creator
};
