import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, getTimestampString } from "./formatters";
import type { BudgetExportData } from "./types";

/**
 * Export budgets as PDF
 */
export function exportBudgetsToPDF(
  budgets: BudgetExportData[],
  summary?: { totalBudgets?: number; totalBudget?: number; totalSpent?: number; remaining?: number }
): void {
  if (budgets.length === 0) {
    alert("No budgets to export");
    return;
  }

  const doc = createBasePDF("Budgets Report", `${budgets.length} budgets`);

  // Summary section with email-style cards
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

    // Total Budgets
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Budgets", margin + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.blue);
    doc.setFont("helvetica", "bold");
    doc.text(String(summary.totalBudgets || 0), margin + 3, currentY + 14);

    // Total Budget Amount
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Budget Amount", margin + cardWidth + cardSpacing + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalBudget || 0), margin + cardWidth + cardSpacing + 3, currentY + 14);

    // Total Spent
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Total Spent", margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.red);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.totalSpent || 0), margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 14);

    // Remaining
    const remainingColor = (summary.remaining || 0) >= 0 ? COLORS.emerald : COLORS.red;
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Remaining", margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(remainingColor);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.remaining || 0), margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 14);

    currentY += cardHeight + 12;
  }

  // Budgets table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Budget Details", margin, currentY);
  currentY += 10;

  const headers = ["Name", "Category", "Period", "Budget", "Spent", "Remaining", "Usage", "Health"];
  const keys: (keyof BudgetExportData)[] = ["budget_name", "category", "period", "amount", "spent", "remaining", "percentage", "health"];
  const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "currency", "currency", "currency", "text", "text"];
  
  // Custom column widths for better layout
  const columnWidths = [28, 22, 18, 22, 22, 22, 14, 16]; // Total: 164mm

  addPDFTable(doc, headers, budgets, keys, formats, currentY, columnWidths);

  const filename = `budgets_${getTimestampString()}.pdf`;
  doc.save(filename);
}
