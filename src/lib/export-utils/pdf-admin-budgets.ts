import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, getTimestampString } from "./formatters";
import type { BudgetAdminExportData } from "./types";

/**
 * Export admin budgets as PDF
 */
export function exportAdminBudgetsToPDF(
    budgets: BudgetAdminExportData[],
    summary?: {
        totalBudgets?: number;
        totalAmount?: number;
        totalSpent?: number;
        remaining?: number;
    }
): void {
    if (budgets.length === 0) {
        alert("No budgets to export");
        return;
    }

    const doc = createBasePDF("Budget Management Report", `${budgets.length} budgets`);

    // Summary section
    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Budget Summary", margin, currentY);
        currentY += 8;

        const cardWidth = 43;
        const cardHeight = 20;
        const cardSpacing = 3;

        // Total Budgets card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Budgets", margin + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text((summary.totalBudgets || 0).toLocaleString(), margin + 4, currentY + 14);

        // Total Amount card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Budgeted", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(summary.totalAmount || 0), margin + cardWidth + cardSpacing + 4, currentY + 14);

        // Total Spent card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Spent", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(COLORS.red);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(summary.totalSpent || 0), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        // Remaining card
        const remainingVal = summary.remaining || 0;
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(COLORS.gray);
        doc.text("Remaining", margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 6);
        doc.setFontSize(10);
        doc.setTextColor(remainingVal >= 0 ? COLORS.emerald : COLORS.red);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(remainingVal), margin + (cardWidth + cardSpacing) * 3 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    // Budgets table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Budget Records", margin, currentY);
    currentY += 10;

    const headers = ["Budget Name", "User Email", "Category", "Amount", "Spent", "Period", "Status"];
    const keys: (keyof BudgetAdminExportData)[] = [
        "budget_name",
        "user",
        "category",
        "amount",
        "spent",
        "period",
        "status"
    ];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "currency", "currency", "text", "text"];

    const columnWidths = [35, 55, 25, 20, 20, 15, 10]; // Total: 180mm

    addPDFTable(doc, headers, budgets, keys, formats, currentY, columnWidths);

    // Save
    const filename = `admin_budgets_${getTimestampString()}.pdf`;
    doc.save(filename);
}
