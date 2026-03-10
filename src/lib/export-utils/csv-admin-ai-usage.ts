import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { AIUsageAdminExportData } from "./types";

/**
 * Export admin AI usage as CSV
 */
export function exportAdminAIUsageToCSV(records: AIUsageAdminExportData[]): void {
    const filename = `admin_ai_usage_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
