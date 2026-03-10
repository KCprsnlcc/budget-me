import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { BackupAdminExportData, ActivityAdminExportData } from "./types";

/**
 * Export admin backup logs as PDF
 */
export function exportAdminBackupsToPDF(
    backups: BackupAdminExportData[],
    summary?: {
        totalBackups?: number;
        totalStorage?: string;
        lastBackupAt?: string;
    }
): void {
    if (backups.length === 0) {
        alert("No backup logs to export");
        return;
    }

    const doc = createBasePDF("System Backup Report", `${backups.length} logs`);

    // Summary section
    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Backup Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 58;
        const cardHeight = 20;
        const cardSpacing = 3;

        // Total Backups card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Backups", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalBackups || 0).toLocaleString(), margin + 4, currentY + 14);

        // Last Backup card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Last Backup", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(8);
        doc.setTextColor(COLORS.blue);
        doc.setFont("helvetica", "bold");
        doc.text(summary.lastBackupAt || "Never", margin + cardWidth + cardSpacing + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    // Backups table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Backup Logs", margin, currentY);
    currentY += 10;

    const headers = ["ID", "Status", "Type", "Started", "Size", "Tables", "Created By"];
    const keys: (keyof BackupAdminExportData)[] = [
        "id",
        "status",
        "type",
        "started_at",
        "size",
        "tables_count",
        "created_by"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text", "number", "text"];

    const columnWidths = [30, 20, 20, 40, 20, 20, 30]; // Total: 180mm

    addPDFTable(doc, headers, backups, keys, formats, currentY, columnWidths);

    const filename = `admin_backups_${getTimestampString()}.pdf`;
    doc.save(filename);
}

/**
 * Export admin activity logs as PDF
 */
export function exportAdminActivityToPDF(
    activities: ActivityAdminExportData[],
    summary?: {
        totalLogs?: number;
        recentErrors?: number;
    }
): void {
    if (activities.length === 0) {
        alert("No activity logs to export");
        return;
    }

    const doc = createBasePDF("System Activity Report", `${activities.length} logs`);

    // Summary section
    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Activity Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 88;
        const cardHeight = 20;
        const cardSpacing = 4;

        // Total Logs card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Activity Logs", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalLogs || 0).toLocaleString(), margin + 4, currentY + 14);

        // Recent Errors card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Recent Errors", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.red);
        doc.setFont("helvetica", "bold");
        doc.text((summary.recentErrors || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    // Activity table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Activity Logs", margin, currentY);
    currentY += 10;

    const headers = ["Date", "Type", "Description", "User", "Severity"];
    const keys: (keyof ActivityAdminExportData)[] = [
        "created_at",
        "type",
        "description",
        "user_email",
        "severity"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text"];

    const columnWidths = [30, 30, 60, 40, 20]; // Total: 180mm

    addPDFTable(doc, headers, activities, keys, formats, currentY, columnWidths);

    const filename = `admin_activity_${getTimestampString()}.pdf`;
    doc.save(filename);
}
