import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, getTimestampString } from "./formatters";
import type { GoalAdminExportData } from "./types";

/**
 * Export admin goals as PDF
 */
export function exportAdminGoalsToPDF(
    goals: GoalAdminExportData[],
    summary?: {
        totalGoals?: number;
        activeSaves?: number;
        totalSaved?: number;
        completedGoals?: number;
    }
): void {
    if (goals.length === 0) {
        alert("No goals to export");
        return;
    }

    const doc = createBasePDF("Goal Management Report", `${goals.length} goals`);

    // Summary section
    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Goal Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 43;
        const cardHeight = 20;
        const cardSpacing = 3;

        // Total Goals card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Goals", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalGoals || 0).toLocaleString(), margin + 4, currentY + 14);

        // Active Saves card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Active Saves", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.blue);
        doc.setFont("helvetica", "bold");
        doc.text((summary.activeSaves || 0).toLocaleString(), margin + cardWidth + cardSpacing + 4, currentY + 14);

        // Total Saved card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Saved", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(summary.totalSaved || 0), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        // Completed Goals card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Completed Goals", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text((summary.completedGoals || 0).toLocaleString(), margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    // Goals table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Goal Records", margin, currentY);
    currentY += 10;

    const headers = ["Goal Name", "User Email", "Target", "Saved", "Progress", "Priority", "Status"];
    const keys: (keyof GoalAdminExportData)[] = [
        "goal_name",
        "user_email",
        "target_amount",
        "current_amount",
        "progress_percentage",
        "priority",
        "status"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "currency", "currency", "percentage", "text", "text"];

    const columnWidths = [45, 55, 20, 20, 15, 15, 10]; // Total: 180mm

    addPDFTable(doc, headers, goals, keys, formats, currentY, columnWidths);

    // Save
    const filename = `admin_goals_${getTimestampString()}.pdf`;
    doc.save(filename);
}
