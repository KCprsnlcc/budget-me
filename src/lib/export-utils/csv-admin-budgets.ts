import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { BudgetAdminExportData } from "./types";

/**
 * Export admin budgets as CSV
 */
export function exportAdminBudgetsToCSV(records: BudgetAdminExportData[]): void {
    const filename = `admin_budgets_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
