// Admin Chatbot Management Types

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
    // Joined data
    user_email?: string;
    user_name?: string;
    user_avatar?: string;
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
