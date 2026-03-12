import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { FamilyAdminExportData } from "./types";

export function exportAdminFamiliesToCSV(records: FamilyAdminExportData[]): void {
    const filename = `admin_families_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
