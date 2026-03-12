import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { AIUsageAdminExportData } from "./types";

export function exportAdminAIUsageToPDF(
    records: AIUsageAdminExportData[],
    stats?: {
        totalUsage?: number;
        activeUsers?: number;
        avgUsage?: number;
        topFeature?: string;
    }
): void {
    if (records.length === 0) {
        alert("No usage records to export");
        return;
    }

    const doc = createBasePDF("AI Usage Management Report", `${records.length} records`);

    let currentY = 45;
    const margin = 15;

    if (stats) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Usage Summary", margin, currentY);
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
        doc.text("Total Usage", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((stats.totalUsage || 0).toLocaleString(), margin + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Active Users", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text((stats.activeUsers || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Avg Usage/User", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((stats.avgUsage || 0).toFixed(1), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Top Feature", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(9);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text(stats.topFeature || "N/A", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Usage Records", margin, currentY);
    currentY += 10;

    const headers = ["Date", "User Email", "Predictions", "Insights", "Chatbot", "Total"];
    const keys: (keyof AIUsageAdminExportData)[] = [
        "usage_date",
        "user_email",
        "predictions_used",
        "insights_used",
        "chatbot_used",
        "total_used"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "number", "number", "number", "number"];

    const columnWidths = [30, 70, 20, 20, 20, 20]; 

    addPDFTable(doc, headers, records, keys, formats, currentY, columnWidths);

    const filename = `admin_ai_usage_${getTimestampString()}.pdf`;
    doc.save(filename);
}
