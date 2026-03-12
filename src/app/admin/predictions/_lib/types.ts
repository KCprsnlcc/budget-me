

export type AdminPredictionReport = {
    id: string;
    user_id: string;
    report_type: string;
    timeframe: string;
    insights: any;
    recommendations: any;
    summary: string | null;
    ai_service: string | null;
    ai_model: string | null;
    generation_time_ms: number | null;
    token_usage: any;
    confidence_level: number | null;
    data_points: number;
    accuracy_score: number | null;
    model_version: string | null;
    prediction_data: any;
    created_at: string;
    updated_at: string;

    user_email?: string;
    user_name?: string;
    user_avatar?: string;
};

export type AdminAIInsight = {
    id: string;
    user_id: string;
    prediction_id: string | null;
    ai_service: string | null;
    model_used: string | null;
    insights: any;
    risk_assessment: any;
    recommendations: any;
    opportunity_areas: any;
    prompt_template: string | null;
    generation_time_ms: number | null;
    token_usage: any;
    confidence_level: number | null;
    daily_usage_count: number;
    rate_limited: boolean;
    retry_after: number | null;
    generated_at: string;
    expires_at: string;
    cache_key: string | null;
    access_count: number;
    last_accessed_at: string | null;
    model_version: string | null;
    processing_status: string | null;
    linked_prediction_id: string | null;
    anomaly_detected: boolean;
    anomaly_type: string | null;
    admin_validated: boolean;
    validation_notes: string | null;
    data_sources_used: any;

    user_email?: string;
    user_name?: string;
    user_avatar?: string;
};

export type AdminPredictionStats = {
    totalReports: number;
    totalInsights: number;
    avgAccuracy: number;
    avgConfidence: number;
    reportGrowth: { month: string; count: number }[];
    modelDistribution: { model: string; count: number; percentage: number }[];

    activeUsers: number;
    totalDataPoints: number;
    anomaliesDetected: number;
    adminValidated: number;
    monthOverMonthGrowth: number;
    topUsers: {
        user_id: string;
        email: string;
        full_name?: string | null;
        avatar_url?: string | null;
        report_count: number;
        insight_count: number;
    }[];
    statusDistribution: { status: string; count: number; percentage: number }[];
};

export type AdminPredictionFilters = {
    month?: number | "all";
    year?: number | "all";
    reportType?: string;
    userId?: string;
    modelVersion?: string;
    processingStatus?: string;
    dataSource?: "reports" | "insights";
};
