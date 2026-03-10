// Admin User Analytics Management Types

// Individual report record (for detailed view)
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

// Aggregated user analytics (one row per user in table)
export type UserAnalyticsSummary = {
    user_id: string;
    user_email: string;
    user_name?: string | null;
    user_avatar?: string | null;
    total_reports: number;
    total_transactions: number;
    active_budgets: number;
    active_goals: number;
    last_updated: string;
    avg_confidence_level: number;
    avg_accuracy_score: number;
    total_data_points: number;
    report_type_breakdown: { type: string; count: number }[];
    anomaly_count: number;
    has_ai_insights: boolean;
};

// Detailed user analytics (for view modal - mimics reports page)
export type UserAnalyticsDetails = {
    user_id: string;
    user_email: string;
    user_name?: string | null;
    user_avatar?: string | null;
    
    // Summary stats (like reports page)
    total_transactions: number;
    active_budgets: number;
    active_goals: number;
    last_updated: string;
    
    // Report settings
    report_settings: {
        report_type: string;
        timeframe: string;
        chart_type: string;
    };
    
    // Anomaly detection
    anomalies: {
        active: number;
        resolved: number;
        recent: Array<{
            id: string;
            type: string;
            severity: string;
            description: string;
            detected_at: string;
        }>;
    };
    
    // AI insights
    ai_insights: {
        has_insights: boolean;
        last_generated: string | null;
        summary: string | null;
        recommendations: string[] | null;
    };
    
    // Charts data
    charts: {
        spending_by_category: any;
        income_vs_expense: any;
        trends: any;
    };
    
    // All reports for this user
    reports: AdminAnalyticsReport[];
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
