import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, getTimestampString } from "./formatters";
import type { TransactionAdminExportData } from "./types";

/**
 * Export admin transactions as PDF
 */
export function exportAdminTransactionsToPDF(
    transactions: TransactionAdminExportData[],
    summary?: { totalIncome?: number; totalExpenses?: number; netBalance?: number }
): void {
    if (transactions.length === 0) {
        alert("No transactions to export");
        return;
    }

    const doc = createBasePDF("Transaction Management Report", `${transactions.length} transactions`);

    // Summary section with cards
    let currentY = 45;
    const margin = 15;

    if (summary) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(COLORS.dark);
        doc.text("Transaction Summary", margin, currentY);
        currentY += 8;

        // Summary cards with subtle borders
        const cardWidth = 58;
        const cardHeight = 20;
        const cardSpacing = 3;

        // Income card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Income", margin + 4, currentY + 6);
        doc.setFontSize(11);
        doc.setTextColor(COLORS.emerald);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(summary.totalIncome || 0), margin + 4, currentY + 14);

        // Expenses card
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        doc.text("Total Expenses", margin + cardWidth + cardSpacing + 4, currentY + 6);
        doc.setFontSize(11);
        doc.setTextColor(COLORS.red);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(summary.totalExpenses || 0), margin + cardWidth + cardSpacing + 4, currentY + 14);

        // Net Balance card
        const netColor = (summary.netBalance || 0) >= 0 ? COLORS.emerald : COLORS.red;
        doc.setFillColor(COLORS.cardBg);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
        doc.setDrawColor(COLORS.border);
        doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        doc.text("Net Balance", margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 6);
        doc.setFontSize(11);
        doc.setTextColor(netColor);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrencyPHP(summary.netBalance || 0), margin + (cardWidth + cardSpacing) * 2 + 4, currentY + 14);

        currentY += cardHeight + 12;
    }

    // Transactions table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Detailed Transaction Records", margin, currentY);
    currentY += 10;

    const headers = ["Date", "User Email", "Description", "Type", "Category", "Amount"];
    const keys: (keyof TransactionAdminExportData)[] = ["date", "user_email", "description", "type", "category", "amount"];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text", "currency"];

    // Custom column widths for better layout (in mm)
    const columnWidths = [20, 50, 40, 20, 25, 25]; // Total: 180mm

    addPDFTable(doc, headers, transactions, keys, formats, currentY, columnWidths);

    // Save
    const filename = `admin_transactions_${getTimestampString()}.pdf`;
    doc.save(filename);
}
