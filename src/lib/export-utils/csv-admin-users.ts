import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { UserExportData } from "./types";

export function exportAdminUsersToCSV(users: UserExportData[]): void {
    const filename = `admin_users_${getTimestampString()}.csv`;
    exportToCSV(users, filename);
}
