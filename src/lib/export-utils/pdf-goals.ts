import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, getTimestampString } from "./formatters";
import type { GoalExportData } from "./types";

export function exportGoalsToPDF(
  goals: GoalExportData[],
  summary?: { totalGoals?: number; totalSaved?: number; totalTarget?: number; completedGoals?: number }
): void {
  if (goals.length === 0) {
    alert("No goals to export");
    return;
  }

  const doc = createBasePDF("Goals Report", `${goals.length} goals`);

  let currentY = 45;
  const margin = 15;

  if (summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Summary", margin, currentY);
    currentY += 8;

    const cardWidth = 43;
    const cardHeight = 20;
    const cardSpacing = 2;

    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Goals", margin + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.blue);
    doc.setFont("helvetica", "bold");
    doc.text(String(summary.totalGoals || 0), margin + 3, currentY + 14);

    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Saved", margin + cardWidth + cardSpacing + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.emerald);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalSaved || 0), margin + cardWidth + cardSpacing + 3, currentY + 14);

    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Target", margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalTarget || 0), margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 14);

    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Completed", margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.amber);
    doc.setFont("helvetica", "bold");
    doc.text(String(summary.completedGoals || 0), margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 14);

    currentY += cardHeight + 12;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Goal Details", margin, currentY);
  currentY += 10;

  const headers = ["Name", "Target", "Saved", "Remaining", "Progress", "Priority", "Status", "Deadline"];
  const keys: (keyof GoalExportData)[] = ["name", "target", "current", "remaining", "progress", "priority", "status", "deadline"];
  const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "currency", "currency", "text", "text", "text", "text"];

  const columnWidths = [30, 22, 22, 22, 16, 16, 16, 20]; 

  addPDFTable(doc, headers, goals, keys, formats, currentY, columnWidths);

  const filename = `goals_${getTimestampString()}.pdf`;
  doc.save(filename);
}
