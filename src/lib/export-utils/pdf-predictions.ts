import { createBasePDF, addPDFTable } from "./pdf-base";
import { COLORS } from "./constants";
import { formatCurrencyPHP, sanitizeTextForPDF, getTimestampString } from "./formatters";
import type { PredictionExportData, CategoryPredictionExportData, AIInsightsExportData } from "./types";

/**
 * Export predictions as PDF
 */
export function exportPredictionsToPDF(
  forecastData: PredictionExportData[],
  categoryPredictions: CategoryPredictionExportData[],
  summary?: {
    avgGrowth?: number;
    maxSavings?: number;
    confidence?: number;
    projectedIncome?: number;
    projectedExpense?: number;
    projectedSavings?: number;
  },
  aiInsights?: AIInsightsExportData | null
): void {
  if (forecastData.length === 0 && categoryPredictions.length === 0 && !aiInsights) {
    alert("No prediction data to export");
    return;
  }

  const doc = createBasePDF(
    "Financial Predictions Report",
    `AI-powered forecasts powered by Prophet ML`
  );

  let currentY = 45;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;

  // Summary section
  if (summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Prediction Summary", margin, currentY);
    currentY += 8;

    const cardWidth = 43;
    const cardHeight = 20;
    const cardSpacing = 2;

    // Projected Income
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Projected Income", margin + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.emerald);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.projectedIncome || 0), margin + 3, currentY + 14);

    // Projected Expense
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Projected Expense", margin + cardWidth + cardSpacing + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.red);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.projectedExpense || 0), margin + cardWidth + cardSpacing + 3, currentY + 14);

    // Projected Savings
    const savingsColor = (summary.projectedSavings || 0) >= 0 ? COLORS.emerald : COLORS.red;
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Projected Savings", margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(savingsColor);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPHP(summary.projectedSavings || 0), margin + (cardWidth + cardSpacing) * 2 + 3, currentY + 14);

    // Confidence Score
    doc.setFillColor(COLORS.cardBg);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "F");
    doc.setDrawColor(COLORS.border);
    doc.roundedRect(margin + (cardWidth + cardSpacing) * 3, currentY, cardWidth, cardHeight, 2, 2, "S");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.gray);
    doc.text("Confidence", margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 6);
    doc.setFontSize(11);
    doc.setTextColor(COLORS.blue);
    doc.setFont("helvetica", "bold");
    doc.text(`${summary.confidence || 0}%`, margin + (cardWidth + cardSpacing) * 3 + 3, currentY + 14);

    currentY += cardHeight + 12;
  }

  // AI Financial Intelligence Section
  if (aiInsights) {
    // Check if we need a new page
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.dark);
    doc.text("AI Financial Intelligence", margin, currentY);
    currentY += 8;

    // Financial Summary
    if (aiInsights.summary) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Financial Summary", margin, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray);
      const summaryLines = doc.splitTextToSize(sanitizeTextForPDF(aiInsights.summary), usableWidth);
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
    if (aiInsights.riskLevel) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text(`Risk Assessment: ${aiInsights.riskLevel.toUpperCase()} (Score: ${aiInsights.riskScore}/100)`, margin, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray);
      const riskLines = doc.splitTextToSize(sanitizeTextForPDF(aiInsights.riskAnalysis), usableWidth);
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

    // Growth Potential
    if (aiInsights.growthPotential) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text(`Growth Potential: ${sanitizeTextForPDF(aiInsights.growthPotential)}`, margin, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray);
      const growthLines = doc.splitTextToSize(sanitizeTextForPDF(aiInsights.growthAnalysis), usableWidth);
      growthLines.forEach((line: string) => {
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
    if (aiInsights.recommendations.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Smart Recommendations", margin, currentY);
      currentY += 8;

      aiInsights.recommendations.forEach((rec, idx) => {
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
        doc.text(`Priority: ${rec.priority.toUpperCase()} | Category: ${rec.category}`, margin + 4, currentY);
        currentY += 7;
      });
    }

    // Risk Mitigation Strategies
    if (aiInsights.riskMitigationStrategies.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Risk Mitigation Strategies", margin, currentY);
      currentY += 8;

      aiInsights.riskMitigationStrategies.forEach((strategy, idx) => {
        if (currentY > 255) {
          doc.addPage();
          currentY = 20;
        }

        // Strategy title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.dark);
        doc.text(`• ${sanitizeTextForPDF(strategy.strategy)}`, margin + 2, currentY);
        currentY += 5;

        // Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        const strategyLines = doc.splitTextToSize(sanitizeTextForPDF(strategy.description), usableWidth - 4);
        strategyLines.forEach((line: string) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, margin + 4, currentY);
          currentY += 4.5;
        });

        // Impact
        doc.setFontSize(7);
        doc.setTextColor(COLORS.textMuted);
        doc.text(`Impact: ${strategy.impact.toUpperCase()}`, margin + 4, currentY);
        currentY += 7;
      });
    }

    // Long-term Opportunities
    if (aiInsights.longTermOpportunities.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark);
      doc.text("Long-term Opportunities", margin, currentY);
      currentY += 8;

      aiInsights.longTermOpportunities.forEach((opp, idx) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Opportunity title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.dark);
        doc.text(`${idx + 1}. ${sanitizeTextForPDF(opp.opportunity)}`, margin + 2, currentY);
        currentY += 5;

        // Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.gray);
        const oppLines = doc.splitTextToSize(sanitizeTextForPDF(opp.description), usableWidth - 4);
        oppLines.forEach((line: string) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, margin + 4, currentY);
          currentY += 4.5;
        });

        // Timeframe and potential return
        doc.setFontSize(7);
        doc.setTextColor(COLORS.textMuted);
        doc.text(`Timeframe: ${opp.timeframe} | Potential Return: ${sanitizeTextForPDF(opp.potentialReturn)}`, margin + 4, currentY);
        currentY += 7;
      });
    }

    currentY += 5;
  }

  // Forecast table
  if (forecastData.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Income vs Expenses Forecast", margin, currentY);
    currentY += 10;

    const headers = ["Month", "Type", "Income", "Expense", "Net Savings"];
    const keys: (keyof PredictionExportData)[] = ["month", "type", "income", "expense", "netSavings"];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "text", "currency", "currency", "currency"];
    
    const columnWidths = [30, 25, 30, 30, 30];

    currentY = addPDFTable(doc, headers, forecastData, keys, formats, currentY, columnWidths);
    currentY += 10;
  }

  // Category predictions table
  if (categoryPredictions.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.dark);
    doc.text("Category Spending Forecast", margin, currentY);
    currentY += 10;

    const headers = ["Category", "Historical Avg", "Predicted", "Change", "Change %", "Trend", "Confidence"];
    const keys: (keyof CategoryPredictionExportData)[] = ["category", "historicalAvg", "predicted", "change", "changePercent", "trend", "confidence"];
    const formats: ("text" | "currency" | "number" | "percentage")[] = ["text", "currency", "currency", "currency", "text", "text", "text"];
    
    const columnWidths = [28, 22, 22, 22, 18, 18, 18];

    addPDFTable(doc, headers, categoryPredictions, keys, formats, currentY, columnWidths);
  }

  const filename = `predictions_${getTimestampString()}.pdf`;
  doc.save(filename);
}
