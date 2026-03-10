import { useState, useEffect, useCallback } from "react";
import {
    fetchBackupLogs,
    fetchActivityLogs,
    fetchSettingsStats,
    generateFullSqlBackup,
} from "./admin-settings-service";
import type {
    BackupLog,
    SystemActivityLog,
    SettingsStats,
    SettingsTab,
} from "./types";

export function useAdminSettings() {
    const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
    const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
    const [stats, setStats] = useState<SettingsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<SettingsTab>("backups");
    const [activitySeverity, setActivitySeverity] = useState<string>("all");
    const [downloading, setDownloading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [backupsRes, activityRes, statsData] =
                await Promise.all([
                    fetchBackupLogs(),
                    fetchActivityLogs(50, activitySeverity),
                    fetchSettingsStats(),
                ]);

            if (backupsRes.error) throw new Error(backupsRes.error);
            if (activityRes.error) throw new Error(activityRes.error);

            setBackupLogs(backupsRes.data);
            setActivityLogs(activityRes.data);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    }, [activitySeverity]);

    useEffect(() => {
        fetchData();
    }, []);

    // Refetch activity logs when severity changes
    useEffect(() => {
        if (!loading) {
            (async () => {
                const res = await fetchActivityLogs(50, activitySeverity);
                if (!res.error) setActivityLogs(res.data);
            })();
        }
    }, [activitySeverity]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const downloadBackup = useCallback(async () => {
        setDownloading(true);
        try {
            const sql = await generateFullSqlBackup();
            const blob = new Blob([sql], { type: "text/sql" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `budgetme_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    }, []);

    return {
        backupLogs,
        activityLogs,
        stats,
        loading,
        error,
        activeTab,
        setActiveTab,
        activitySeverity,
        setActivitySeverity,
        refetch,
        downloadBackup,
        downloading,
    };
}
