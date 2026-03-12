import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { BackupAdminExportData, ActivityAdminExportData } from "./types";

export function exportAdminBackupsToCSV(records: BackupAdminExportData[]): void {
    const filename = `admin_backups_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}

export function exportAdminActivityToCSV(records: ActivityAdminExportData[]): void {
    const filename = `admin_activity_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
