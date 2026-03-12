import { exportToCSV } from "./csv-export";
import { getTimestampString } from "./formatters";
import type { ChatbotAdminExportData } from "./types";

export function exportAdminChatbotToCSV(records: ChatbotAdminExportData[]): void {
    const filename = `admin_chatbot_${getTimestampString()}.csv`;
    exportToCSV(records, filename);
}
