import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { AnalyticsAdminExportData } from "./types";

/**
 * Export admin user analytics as CSV
 */
export function exportAdminAnalyticsToCSV(records: AnalyticsAdminExportData[]): void {
    const filename = `admin_analytics_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
