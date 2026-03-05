import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { sanitizeTextForPDF, getTimestampString } from "./formatters";
import type { ReportExportData } from "./types";

/**
 * Export comprehensive report as PDF
 */
export function exportReportToPDF(reportData: ReportExportData): void {
  const doc = createBasePDF(
    "Financial Report",
    `${reportData.settings.reportType.replace('-', ' ').toUpperCase()} | ${reportData.settings.dateRange}`
  );

  let currentY = 45;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;

  // Summary Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.text("Report Summary", margin, currentY);
  currentY += 8;

  const cardWidth = 43;
  const cardHeight = 20;
  const cardSpacing = 2;

  // Total Transactions
  doc.setFillColor(COLORS.cardBg);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray);
  doc.text("Total Transactions", margin + 3, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.setFont("helvetica", "bold");
  doc.text(String(reportData.summary.totalTransactions), margin + 3, currentY + 14);

  // Active Budgets
  doc.setFillColor(COLORS.cardBg);
  doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray);
  doc.text("Active Budgets", margin + cardWidth + cardSpacing + 3, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark);
  doc.setFont("helvetica", "bold");
  doc.text(String(reportData.summary.activeBudgets), margin + cardWidth + cardSpacing + 3, currentY + 14);

  // Active Goals (if available)
  if (reportData.summary.activeGoals !== undefined) {
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Active Goals", margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(String(reportData.summary.activeGoals), margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 14);
  }

  // Last Updated
  doc.setFillColor(COLORS.cardBg);
  doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray);
  doc.text("Last Updated", margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 6);
  doc.setFontSize(9);
  doc.setTextColor(COLORS.dark);
  doc.setFont("helvetica", "bold");
  const lastUpdatedLines = doc.splitTextToSize(reportData.summary.lastUpdated, cardWidth - 6);
  doc.text(lastUpdatedLines[0], margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 14);

  currentY += cardHeight + 12;

  // Anomaly Detection Section
  if (reportData.anomalies && reportData.anomalies.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text(`Anomaly Detection (${reportData.anomalies.length} detected)`, margin, currentY);
    currentY += 8;

    reportData.anomalies.slice(0, 6).forEach((anomaly) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      const severityColor = 
        anomaly.severity === 'high' ? COLORS.red :
        anomaly.severity === 'medium' ? COLORS.amber : COLORS.blue;

      // Anomaly card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, currentY, usableWidth, 25, 2, 2, "F");
      doc.setDrawColor(severityColor);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, margin, currentY + 25);
      doc.setDrawColor(COLORS.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, currentY, usableWidth, 25, 2, 2, "S");

      // Severity badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(severityColor);
      doc.text(anomaly.severity.toUpperCase(), margin + 3, currentY + 5);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(COLORS.dark);
      doc.text(sanitizeTextForPDF(anomaly.title), margin + 3, currentY + 11);

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.gray);
      const descLines = doc.splitTextToSize(sanitizeTextForPDF(anomaly.description), usableWidth - 6);
      doc.text(descLines[0], margin + 3, currentY + 16);

      // Category and amount
      doc.setFontSize(7);
      doc.setTextColor(COLORS.textMuted);
      let detailText = `${anomaly.category}`;
      if (anomaly.amount) {
        detailText += ` | ₱${typeof anomaly.amount === 'number' ? anomaly.amount.toFixed(2) : anomaly.amount}`;
      }
      doc.text(detailText, margin + 3, currentY + 22);

      currentY += 28;
    });

    currentY += 5;
  }

  // AI Financial Insights Section
  if (reportData.aiInsights) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.dark);
    doc.text("AI Financial Insights", margin, currentY);
    currentY += 8;

    // Financial Summary
    if (reportData.aiInsights.summary) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Financial Health Assessment", margin, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray);
      const summaryLines = doc.splitTextToSize(sanitizeTextForPDF(reportData.aiInsights.summary), usableWidth);
      summaryLines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += 5;
      });
      currentY += 5;
    }

    // Risk Assessment
    if (reportData.aiInsights.riskLevel) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text(`Risk Assessment: ${reportData.aiInsights.riskLevel.toUpperCase()} (Score: ${reportData.aiInsights.riskScore}/100)`, margin, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray);
      const riskLines = doc.splitTextToSize(sanitizeTextForPDF(reportData.aiInsights.riskAnalysis), usableWidth);
      riskLines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += 5;
      });
      currentY += 5;
    }

    // Recommendations
    if (reportData.aiInsights.recommendations && reportData.aiInsights.recommendations.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Smart Recommendations", margin, currentY);
      currentY += 8;

      reportData.aiInsights.recommendations.forEach((rec, idx) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Recommendation number and title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.dark);
        doc.text(`${idx + 1}. ${sanitizeTextForPDF(rec.title)}`, margin + 2, currentY);
        currentY += 5;

        // Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        const descLines = doc.splitTextToSize(sanitizeTextForPDF(rec.description), usableWidth - 4);
        descLines.forEach((line: string) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, margin + 4, currentY);
          currentY += 4.5;
        });

        // Priority and category
        doc.setFontSize(7);
        doc.setTextColor(COLORS.textMuted);
        let detailText = `Priority: ${rec.priority.toUpperCase()} | Category: ${rec.category}`;
        if (rec.potentialSavings) {
          detailText += ` | Potential Savings: ₱${rec.potentialSavings.toLocaleString()}`;
        }
        doc.text(detailText, margin + 4, currentY);
        currentY += 7;
      });
    }

    // Actionable Steps
    if (reportData.aiInsights.actionableSteps && reportData.aiInsights.actionableSteps.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Next Steps", margin, currentY);
      currentY += 8;

      reportData.aiInsights.actionableSteps.forEach((step, idx) => {
        if (currentY > 265) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.emerald);
        doc.text(`${idx + 1}.`, margin + 2, currentY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.gray);
        const stepLines = doc.splitTextToSize(sanitizeTextForPDF(step), usableWidth - 8);
        stepLines.forEach((line: string, lineIdx: number) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, margin + 8, currentY);
          if (lineIdx < stepLines.length - 1) currentY += 4.5;
        });
        currentY += 7;
      });
    }

    currentY += 5;
  }

  // Chart Data Section (varies by report type)
  if (reportData.chartData) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Charts Rendered", margin, currentY);
    currentY += 10;

    // Spending by Category
    if (reportData.settings.reportType === 'spending' && reportData.chartData.categories) {
      const headers = ["Category", "Amount", "Percentage"];
      const keys = ["name", "amount", "percentage"];
      const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "text"];
      const columnWidths = [60, 60, 40];

      const tableData = reportData.chartData.categories.map((cat: any) => ({
        name: cat.name,
        amount: cat.amount,
        percentage: `${cat.percentage.toFixed(1)}%`,
      }));

      currentY = addPDFTable(doc, headers, tableData, keys, formats, currentY, columnWidths);
    }

    // Income vs Expense
    if (reportData.settings.reportType === 'income-expense' && reportData.chartData.monthly) {
      const headers = ["Month", "Income", "Expenses", "Net Savings"];
      const keys = ["month", "income", "expenses", "netSavings"];
      const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "currency", "currency"];
      const columnWidths = [40, 40, 40, 40];

      const tableData = reportData.chartData.monthly.map((month: any) => ({
        month: month.month,
        income: month.income,
        expenses: month.expenses,
        netSavings: month.income - month.expenses,
      }));

      currentY = addPDFTable(doc, headers, tableData, keys, formats, currentY, columnWidths);
    }

    // Savings Analysis
    if (reportData.settings.reportType === 'savings' && reportData.chartData.funds) {
      const headers = ["Fund Name", "Current", "Target", "Progress"];
      const keys = ["name", "amount", "target", "percentage"];
      const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "currency", "text"];
      const columnWidths = [50, 35, 35, 40];

      const tableData = reportData.chartData.funds.map((fund: any) => ({
        name: fund.name,
        amount: fund.amount,
        target: fund.target,
        percentage: `${fund.percentage.toFixed(1)}%`,
      }));

      currentY = addPDFTable(doc, headers, tableData, keys, formats, currentY, columnWidths);
    }

    // Goals Progress
    if (reportData.settings.reportType === 'goals' && reportData.chartData.goals) {
      const headers = ["Goal Name", "Current", "Target", "Progress"];
      const keys = ["name", "current", "target", "percentage"];
      const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "currency", "text"];
      const columnWidths = [50, 35, 35, 40];

      const tableData = reportData.chartData.goals.map((goal: any) => ({
        name: goal.name,
        current: goal.current,
        target: goal.target,
        percentage: `${goal.percentage.toFixed(1)}%`,
      }));

      currentY = addPDFTable(doc, headers, tableData, keys, formats, currentY, columnWidths);
    }
  }

  const filename = `financial_report_${reportData.settings.reportType}_${getTimestampString()}.pdf`;
  doc.save(filename);
}
