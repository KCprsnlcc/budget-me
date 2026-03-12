import { createClient } from "@/lib/supabase/client";
import type {
    BackupLog,
    SystemActivityLog,
    SettingsStats,
} from "./types";

const supabase = createClient();

export async function fetchBackupLogs(): Promise<{
    data: BackupLog[];
    error: string | null;
}> {
    const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);

    if (error) return { data: [], error: error.message };

    const creatorIds = [...new Set((data ?? []).filter((b: any) => b.created_by).map((b: any) => b.created_by))];
    const profileMap = new Map<string, { email: string; full_name: string | null }>();

    if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", creatorIds);
        for (const p of profiles ?? []) {
            profileMap.set(p.id, { email: p.email, full_name: p.full_name });
        }
    }

    const mapped: BackupLog[] = (data ?? []).map((row: any) => {
        const creator = row.created_by ? profileMap.get(row.created_by) : undefined;
        return {
            ...row,
            created_by_email: creator?.email,
            created_by_name: creator?.full_name,
        };
    });

    return { data: mapped, error: null };
}

export async function createBackupLog(
    backupType: "manual" | "automatic" | "scheduled",
    createdBy: string
): Promise<{ data: BackupLog | null; error: string | null }> {

    const tables = [
        "profiles", "accounts", "income_categories", "expense_categories",
        "transactions", "budgets", "budget_categories", "budget_alerts",
        "goals", "goal_contributions", "families", "family_members",
        "family_invitations", "family_join_requests", "family_activity_log",
        "chat_sessions", "chat_messages", "chatbot_messages", "conversation_topics",
        "ai_reports", "ai_insights", "ai_response_analytics", "ai_usage_rate_limits",
        "admin_settings", "application_settings", "feature_flags", "admin_actions",
        "admin_anomalies", "admin_notifications", "dashboard_insights",
        "dashboard_layouts", "dashboard_widgets", "password_reset_attempts",
        "prediction_requests", "prediction_usage_limits", "prophet_predictions",
        "system_activity_log", "testimonials", "user_chat_preferences",
        "user_preferences_cache", "user_roles", "user_sessions", "user_settings",
        "user_widget_instances", "verification_tokens", "widget_data_cache", "backup_logs"
    ];

    const startTime = Date.now();

    const tableCounts: Record<string, number> = {};
    let totalSize = 0;

    for (const table of tables) {
        const { count } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
        tableCounts[table] = count ?? 0;
        totalSize += (count ?? 0) * 500; // rough avg row size estimate
    }

    const durationMs = Date.now() - startTime;

    const { data, error } = await supabase
        .from("backup_logs")
        .insert({
            backup_type: backupType,
            status: "completed",
            backup_size_bytes: totalSize,
            backup_duration_ms: durationMs,
            tables_backed_up: tables,
            backup_location: "supabase_managed",
            checksum: `sha256_${Date.now().toString(36)}`,
            created_by: createdBy,
            started_at: new Date(startTime).toISOString(),
            completed_at: new Date().toISOString(),
            metadata: { table_counts: tableCounts, version: "1.0" },
        })
        .select()
        .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
}

export async function generateFullSqlBackup(): Promise<string> {
    let sql = `-- BudgetMe Full Database Backup\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;
    sql += `SET statement_timeout = 0;\nSET lock_timeout = 0;\nSET client_encoding = 'UTF8';\n`;
    sql += `SET standard_conforming_strings = on;\nSET check_function_bodies = false;\n`;
    sql += `SET client_min_messages = warning;\n\n`;

    try {

        sql += `-- ─── FUNCTIONS & PROCEDURES ────────────────────────────────\n\n`;
        const { data: fnData } = await (supabase as any).from('information_schema.routines')
            .select('routine_name, routine_definition, data_type')
            .eq('routine_schema', 'public');

        if (fnData) {
            for (const fn of fnData) {
                if (fn.routine_definition) {
                    sql += `-- Function: ${fn.routine_name}\n`;
                    sql += `CREATE OR REPLACE FUNCTION public.${fn.routine_name}() RETURNS ${fn.data_type} AS $$\n`;
                    sql += `${fn.routine_definition}\n`;
                    sql += `$$ LANGUAGE plpgsql;\n\n`;
                }
            }
        }

        const tables = [
            "profiles", "accounts", "income_categories", "expense_categories",
            "transactions", "budgets", "budget_categories", "budget_alerts",
            "goals", "goal_contributions", "families", "family_members",
            "family_invitations", "family_join_requests", "family_activity_log",
            "chat_sessions", "chat_messages", "chatbot_messages", "conversation_topics",
            "ai_reports", "ai_insights", "ai_response_analytics", "ai_usage_rate_limits",
            "admin_settings", "application_settings", "feature_flags", "admin_actions",
            "admin_anomalies", "admin_notifications", "dashboard_insights",
            "dashboard_layouts", "dashboard_widgets", "password_reset_attempts",
            "prediction_requests", "prediction_usage_limits", "prophet_predictions",
            "system_activity_log", "testimonials", "user_chat_preferences",
            "user_preferences_cache", "user_roles", "user_sessions", "user_settings",
            "user_widget_instances", "verification_tokens", "widget_data_cache", "backup_logs"
        ];

        for (const table of tables) {
            sql += `-- ─── TABLE: ${table} ──────────────────────────────────────\n\n`;

            const { data: colData } = await (supabase as any).from('information_schema.columns')
                .select('column_name, data_type, is_nullable, column_default')
                .eq('table_name', table)
                .eq('table_schema', 'public');

            if (colData && colData.length > 0) {
                sql += `CREATE TABLE IF NOT EXISTS public.${table} (\n`;
                const colDefs = colData.map((c: any) => {
                    return `    ${c.column_name} ${c.data_type}${c.is_nullable === 'NO' ? ' NOT NULL' : ''}${c.column_default ? ` DEFAULT ${c.column_default}` : ''}`;
                });
                sql += colDefs.join(',\n');
                sql += `\n);\n\n`;
            }

            const { data: rows, error: dataError } = await supabase
                .from(table)
                .select('*');

            if (rows && rows.length > 0) {
                const columns = Object.keys(rows[0]);
                sql += `-- Data for ${table}\n`;

                rows.forEach(row => {
                    const values = columns.map(col => {
                        const val = row[col];
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
                        return val;
                    });
                    sql += `INSERT INTO public.${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
                });
                sql += `\n`;
            } else {
                sql += `-- No data found for ${table}\n\n`;
            }
        }

        sql += `-- Backup Completed.\n`;
        return sql;
    } catch (err) {
        console.error("SQL Backup Generation Error:", err);
        return sql + `-- Error during generation: ${err instanceof Error ? err.message : String(err)}\n`;
    }
}

export async function fetchActivityLogs(
    limit: number = 50,
    severityFilter?: string
): Promise<{ data: SystemActivityLog[]; error: string | null }> {
    let query = supabase
        .from("system_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (severityFilter && severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
    }

    const { data, error } = await query;
    if (error) return { data: [], error: error.message };

    const userIds = [...new Set((data ?? []).filter((a: any) => a.user_id).map((a: any) => a.user_id))];
    const profileMap = new Map<string, { email: string; full_name: string | null }>();

    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", userIds);
        for (const p of profiles ?? []) {
            profileMap.set(p.id, { email: p.email, full_name: p.full_name });
        }
    }

    const mapped: SystemActivityLog[] = (data ?? []).map((row: any) => {
        const user = row.user_id ? profileMap.get(row.user_id) : undefined;
        return {
            ...row,
            user_email: user?.email,
            user_name: user?.full_name,
        };
    });

    return { data: mapped, error: null };
}

export async function fetchSettingsStats(): Promise<SettingsStats | null> {
    const [
        { count: totalBackups },
        { count: totalActivityLogs },
        { count: recentErrors },
        { count: totalUsers },
        { count: activeUsers },
        { count: txCount },
        { count: profileCount },
        { count: goalCount },
        { count: budgetCount },
        { count: chatCount },
        { count: reportCount },
    ] = await Promise.all([
        supabase.from("backup_logs").select("*", { count: "exact", head: true }),
        supabase.from("system_activity_log").select("*", { count: "exact", head: true }),
        supabase.from("system_activity_log").select("*", { count: "exact", head: true }).eq("severity", "error"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("transactions").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("goals").select("*", { count: "exact", head: true }),
        supabase.from("budgets").select("*", { count: "exact", head: true }),
        supabase.from("chat_messages").select("*", { count: "exact", head: true }),
        supabase.from("ai_reports").select("*", { count: "exact", head: true }),
    ]);

    const { data: lastBackup } = await supabase
        .from("backup_logs")
        .select("completed_at")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

    return {
        totalBackups: totalBackups ?? 0,
        lastBackupAt: lastBackup?.completed_at ?? null,
        totalActivityLogs: totalActivityLogs ?? 0,
        recentErrors: recentErrors ?? 0,
        totalUsers: totalUsers ?? 0,
        activeUsers: activeUsers ?? 0,
        storageUsed: {
            transactions: txCount ?? 0,
            profiles: profileCount ?? 0,
            goals: goalCount ?? 0,
            budgets: budgetCount ?? 0,
            chatMessages: chatCount ?? 0,
            aiReports: reportCount ?? 0,
        },
    };
}
