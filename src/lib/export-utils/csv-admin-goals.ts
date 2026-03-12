import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { GoalAdminExportData } from "./types";

export function exportAdminGoalsToCSV(records: GoalAdminExportData[]): void {
    const filename = `admin_goals_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
