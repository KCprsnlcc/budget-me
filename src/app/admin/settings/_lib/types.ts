// Admin Settings Management Types — Database & Activity only

export type BackupLog = {
    id: string;
    backup_type: "manual" | "automatic" | "scheduled";
    status: "started" | "in_progress" | "completed" | "failed" | "cancelled";
    backup_size_bytes: number | null;
    backup_duration_ms: number | null;
    tables_backed_up: string[] | null;
    error_message: string | null;
    backup_location: string | null;
    checksum: string | null;
    created_by: string | null;
    started_at: string;
    completed_at: string | null;
    metadata: Record<string, any>;
    // Joined
    created_by_email?: string;
    created_by_name?: string;
};

export type SystemActivityLog = {
    id: string;
    user_id: string | null;
    activity_type: string;
    activity_description: string;
    ip_address: string | null;
    user_agent: string | null;
    session_id: string | null;
    metadata: Record<string, any>;
    severity: "low" | "info" | "warning" | "error" | "critical";
    created_at: string;
    execution_time_ms: number | null;
    stack_trace: string | null;
    // Joined
    user_email?: string;
    user_name?: string;
};

export type SettingsStats = {
    totalBackups: number;
    lastBackupAt: string | null;
    totalActivityLogs: number;
    recentErrors: number;
    totalUsers: number;
    activeUsers: number;
    storageUsed: {
        transactions: number;
        profiles: number;
        goals: number;
        budgets: number;
        chatMessages: number;
        aiReports: number;
    };
};

export type SettingsTab = "backups" | "activity";
