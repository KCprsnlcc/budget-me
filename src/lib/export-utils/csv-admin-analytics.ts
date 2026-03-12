import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { AnalyticsAdminExportData } from "./types";

export function exportAdminAnalyticsToCSV(records: AnalyticsAdminExportData[]): void {
    const filename = `admin_analytics_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
