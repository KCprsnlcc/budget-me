import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { FamilyAdminExportData } from "./types";

/**
 * Export admin families as CSV
 */
export function exportAdminFamiliesToCSV(records: FamilyAdminExportData[]): void {
    const filename = `admin_families_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
