import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { PredictionAdminExportData } from "./types";

/**
 * Export admin predictions as CSV
 */
export function exportAdminPredictionsToCSV(records: PredictionAdminExportData[]): void {
    const filename = `admin_predictions_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
