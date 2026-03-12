

export type AdminChatMessage = {
    id: string;
    user_id: string;
    role: "user" | "assistant";
    content: string;
    model: string | null;
    suggestions: string[];
    attachment: {
        name: string;
        type: string;
        size: number;
        url?: string;
    } | null;
    created_at: string;
    updated_at: string;

    user_email?: string;
    user_name?: string;
    user_avatar?: string;
};

export type AdminChatSession = {
    user_id: string;
    user_email: string;
    user_name: string | null;
    user_avatar: string | null;
    total_messages: number;
    user_messages: number;
    assistant_messages: number;
    last_message_preview: string;
    last_message_role: "user" | "assistant";
    first_message_at: string;
    last_message_at: string;
    models_used: string[];
};

export type AdminChatbotStats = {
    totalMessages: number;
    totalUserMessages: number;
    totalAssistantMessages: number;
    activeUsers: number;
    avgMessagesPerUser: number;
    messageGrowth: { month: string; count: number }[];
    roleDistribution: { role: string; count: number; percentage: number }[];
    modelDistribution: { model: string; count: number; percentage: number }[];
    topUsers: {
        user_id: string;
        email: string;
        full_name?: string | null;
        avatar_url?: string | null;
        total_messages: number;
        last_active: string;
    }[];
    monthOverMonthGrowth: number;
};

export type AdminChatbotFilters = {
    month?: number | "all";
    year?: number | "all";
    role?: string;
    userId?: string;
    model?: string;
};
