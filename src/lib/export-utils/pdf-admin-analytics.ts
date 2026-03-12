import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { AnalyticsAdminExportData } from "./types";

export function exportAdminAnalyticsToPDF(
    summaries: AnalyticsAdminExportData[],
    summary?: {
        totalReports?: number;
        activeUsers?: number;
        avgConfidence?: string;
        totalDataPoints?: number;
    }
): void {
    if (summaries.length === 0) {
        alert("No analytics data to export");
        return;
    }

    const doc = createBasePDF("User Analytics Management Report", `${summaries.length} user summaries`);

    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("System Analytics Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 43;
        const cardHeight = 20;
        const cardSpacing = 3;

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total AI Reports", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalReports || 0).toLocaleString(), margin + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Active Users", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.blue);
        doc.setFont("helvetica", "bold");
        doc.text((summary.activeUsers || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Avg Confidence", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text(summary.avgConfidence || "0%", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Data Points", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalDataPoints || 0).toLocaleString(), margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed User Analytics Records", margin, currentY);
    currentY += 10;

    const headers = ["User Name", "Email", "Reports", "Trans", "Budgets", "Goals", "Last Updated"];
    const keys: (keyof AnalyticsAdminExportData)[] = [
        "user_name",
        "user_email",
        "total_reports",
        "total_transactions",
        "active_budgets",
        "active_goals",
        "last_updated"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "number", "number", "number", "number", "text"];

    const columnWidths = [35, 45, 15, 15, 20, 15, 35]; 

    addPDFTable(doc, headers, summaries, keys, formats, currentY, columnWidths);

    const filename = `admin_analytics_${getTimestampString()}.pdf`;
    doc.save(filename);
}
