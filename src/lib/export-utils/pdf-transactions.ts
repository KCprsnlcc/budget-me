import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, getTimestampString } from "./formatters";
import type { TransactionExportData } from "./types";

export function exportTransactionsToPDF(
  transactions: TransactionExportData[],
  summary?: { totalIncome?: number; totalExpenses?: number; netBalance?: number }
): void {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  const doc = createBasePDF("Transactions Report", `${transactions.length} transactions`);

  let currentY = 45;
  const margin = 15;

  if (summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Summary", margin, currentY);
    currentY += 8;

    const cardWidth = 58;
    const cardHeight = 20;
    const cardSpacing = 3;

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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Transaction Details", margin, currentY);
  currentY += 10;

  const headers = ["Date", "Description", "Type", "Category", "Account", "Amount"];
  const keys: (keyof TransactionExportData)[] = ["date", "description", "type", "category", "account", "amount"];
  const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "text", "text", "text", "currency"];

  const columnWidths = [22, 35, 22, 25, 28, 28]; 

  addPDFTable(doc, headers, transactions, keys, formats, currentY, columnWidths);

  const filename = `transactions_${getTimestampString()}.pdf`;
  doc.save(filename);
}
