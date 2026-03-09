// Admin System Analytics Management Types

export type AdminAnalyticsReport = {
    id: string;
    user_id: string;
    report_type: 'spending' | 'income-expense' | 'savings' | 'trends' | 'goals' | 'predictions' | 'financial_intelligence';
    timeframe: 'week' | 'month' | 'quarter' | 'year' | 'custom';
    insights: any;
    recommendations?: any;
    summary?: string;
    ai_service?: string;
    ai_model?: string;
    generation_time_ms?: number;
    token_usage?: any;
    confidence_level?: number;
    generated_at?: string;
    expires_at?: string;
    access_count?: number;
    last_accessed_at?: string;
    created_at?: string;
    updated_at?: string;
    prediction_data?: any;
    data_points?: number;
    accuracy_score?: number;
    model_version?: string;
    // Joined
    user_email?: string;
    user_name?: string;
    user_avatar?: string;
};

export type AdminAnalyticsStats = {
    totalReports: number;
    totalInsightsGenerated: number;
    avgConfidenceLevel: number;
    avgAccuracyScore: number;
    totalDataPointsAnalyzed: number;
    avgGenerationTimeMs: number;
    reportTypeDistribution: { type: string; count: number; percentage: number }[];
    timeframeDistribution: { timeframe: string; count: number; percentage: number }[];
    activeUsers: number;
    topUsers: {
        user_id: string;
        email: string;
        full_name?: string | null;
        avatar_url?: string | null;
        report_count: number;
    }[];
};

export type AdminAnalyticsFilters = {
    month?: number | "all";
    year?: number | "all";
    report_type?: string;
    timeframe?: string;
    userId?: string;
    ai_service?: string;
};
