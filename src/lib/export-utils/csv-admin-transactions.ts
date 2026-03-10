import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { TransactionAdminExportData } from "./types";

/**
 * Export admin transactions as CSV
 */
export function exportAdminTransactionsToCSV(records: TransactionAdminExportData[]): void {
    const filename = `admin_transactions_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
