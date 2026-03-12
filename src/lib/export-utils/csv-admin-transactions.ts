import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { TransactionAdminExportData } from "./types";

export function exportAdminTransactionsToCSV(records: TransactionAdminExportData[]): void {
    const filename = `admin_transactions_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
