import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { getTimestampString } from "./formatters";
import type { PredictionAdminExportData } from "./types";

/**
 * Export admin predictions as PDF
 */
export function exportAdminPredictionsToPDF(
    predictions: PredictionAdminExportData[],
    summary?: {
        totalReports?: number;
        totalInsights?: number;
        avgAccuracy?: number;
        avgConfidence?: number;
    }
): void {
    if (predictions.length === 0) {
        alert("No predictions to export");
        return;
    }

    const doc = createBasePDF("AI Predictions Report", `${predictions.length} items`);

    // Summary section
    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Predictions Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 43;
        const cardHeight = 20;
        const cardSpacing = 3;

        // Total Reports card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Reports", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalReports || 0).toLocaleString(), margin + 4, currentY + 14);

        // Total Insights card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Insights", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.blue);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalInsights || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        // Avg Accuracy card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Avg Accuracy", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text(`${(summary.avgAccuracy || 0).toFixed(1)}%`, margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        // AI Confidence card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("AI Confidence", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text(`${(summary.avgConfidence || 0).toFixed(1)}%`, margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    // Predictions table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Prediction Records", margin, currentY);
    currentY += 10;

    const headers = ["Date", "User Email", "Type", "Accuracy", "Confidence", "Data Points"];
    const keys: (keyof PredictionAdminExportData)[] = [
        "date",
        "user_email",
        "type",
        "accuracy",
        "confidence",
        "data_points"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text", "number"];

    const columnWidths = [30, 70, 20, 20, 20, 20]; // Total: 180mm

    addPDFTable(doc, headers, predictions, keys, formats, currentY, columnWidths);

    // Save
    const filename = `admin_predictions_${getTimestampString()}.pdf`;
    doc.save(filename);
}
