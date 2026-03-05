import Papa from "papaparse";
import { downloadBlob } from "./helpers";
import { getTimestampString } from "./formatters";
import type { ChatMessageExportData, PredictionExportData, CategoryPredictionExportData, AIInsightsExportData, ReportExportData } from "./types";

/**
 * Export data as CSV
 */
export function exportToCSV<T extends Record<string, string | number | boolean | null | undefined>>(
  data: T[],
  filename: string
): void {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const csv = Papa.unparse(data, {
    header: true,
    quotes: true,
    newline: "\n",
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Export chat messages as CSV
 */
export function exportChatToCSV(messages: ChatMessageExportData[], userName?: string): void {
  if (messages.length === 0) {
    alert("No messages to export");
    return;
  }

  // Update role names for CSV export
  const exportData = messages.map(msg => ({
    ...msg,
    role: msg.role === "You" || msg.role === "user" ? (msg.userName || userName || "You") : "BudgetSense AI"
  }));

  const filename = `chat_conversation_${getTimestampString()}.csv`;
  exportToCSV(exportData, filename);
}

/**
 * Export predictions as CSV
 */
export function exportPredictionsToCSV(
  forecastData: PredictionExportData[],
  categoryPredictions: CategoryPredictionExportData[],
  aiInsights?: AIInsightsExportData | null
): void {
  if (forecastData.length === 0 && categoryPredictions.length === 0 && !aiInsights) {
    alert("No prediction data to export");
    return;
  }

  // Export forecast data
  if (forecastData.length > 0) {
    const forecastCSV = Papa.unparse(forecastData, {
      header: true,
      quotes: true,
      newline: "\n",
    });
    const forecastBlob = new Blob([forecastCSV], { type: "text/csv;charset=utf-8;" });
    downloadBlob(forecastBlob, `predictions_forecast_${getTimestampString()}.csv`);
  }

  // Export category predictions
  if (categoryPredictions.length > 0) {
    const categoryCSV = Papa.unparse(categoryPredictions, {
      header: true,
      quotes: true,
      newline: "\n",
    });
    const categoryBlob = new Blob([categoryCSV], { type: "text/csv;charset=utf-8;" });
    downloadBlob(categoryBlob, `predictions_categories_${getTimestampString()}.csv`);
  }

  // Export AI insights
  if (aiInsights) {
    // Recommendations
    if (aiInsights.recommendations.length > 0) {
      const recommendationsCSV = Papa.unparse(aiInsights.recommendations, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const recommendationsBlob = new Blob([recommendationsCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(recommendationsBlob, `predictions_recommendations_${getTimestampString()}.csv`);
    }

    // Risk Mitigation Strategies
    if (aiInsights.riskMitigationStrategies.length > 0) {
      const strategiesCSV = Papa.unparse(aiInsights.riskMitigationStrategies, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const strategiesBlob = new Blob([strategiesCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(strategiesBlob, `predictions_risk_strategies_${getTimestampString()}.csv`);
    }

    // Long-term Opportunities
    if (aiInsights.longTermOpportunities.length > 0) {
      const opportunitiesCSV = Papa.unparse(aiInsights.longTermOpportunities, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const opportunitiesBlob = new Blob([opportunitiesCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(opportunitiesBlob, `predictions_opportunities_${getTimestampString()}.csv`);
    }
  }
}

/**
 * Export comprehensive report as CSV
 */
export function exportReportToCSV(reportData: ReportExportData): void {
  // Export summary
  const summaryCSV = Papa.unparse([reportData.summary], {
    header: true,
    quotes: true,
    newline: "\n",
  });
  const summaryBlob = new Blob([summaryCSV], { type: "text/csv;charset=utf-8;" });
  downloadBlob(summaryBlob, `report_summary_${getTimestampString()}.csv`);

  // Export anomalies
  if (reportData.anomalies && reportData.anomalies.length > 0) {
    const anomaliesCSV = Papa.unparse(reportData.anomalies, {
      header: true,
      quotes: true,
      newline: "\n",
    });
    const anomaliesBlob = new Blob([anomaliesCSV], { type: "text/csv;charset=utf-8;" });
    downloadBlob(anomaliesBlob, `report_anomalies_${getTimestampString()}.csv`);
  }

  // Export AI insights recommendations
  if (reportData.aiInsights?.recommendations && reportData.aiInsights.recommendations.length > 0) {
    const recommendationsCSV = Papa.unparse(reportData.aiInsights.recommendations, {
      header: true,
      quotes: true,
      newline: "\n",
    });
    const recommendationsBlob = new Blob([recommendationsCSV], { type: "text/csv;charset=utf-8;" });
    downloadBlob(recommendationsBlob, `report_recommendations_${getTimestampString()}.csv`);
  }

  // Export chart data based on report type
  if (reportData.chartData) {
    if (reportData.settings.reportType === 'spending' && reportData.chartData.categories) {
      const chartCSV = Papa.unparse(reportData.chartData.categories, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const chartBlob = new Blob([chartCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(chartBlob, `report_spending_${getTimestampString()}.csv`);
    }

    if (reportData.settings.reportType === 'income-expense' && reportData.chartData.monthly) {
      const chartCSV = Papa.unparse(reportData.chartData.monthly, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const chartBlob = new Blob([chartCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(chartBlob, `report_income_expense_${getTimestampString()}.csv`);
    }

    if (reportData.settings.reportType === 'savings' && reportData.chartData.funds) {
      const chartCSV = Papa.unparse(reportData.chartData.funds, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const chartBlob = new Blob([chartCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(chartBlob, `report_savings_${getTimestampString()}.csv`);
    }

    if (reportData.settings.reportType === 'goals' && reportData.chartData.goals) {
      const chartCSV = Papa.unparse(reportData.chartData.goals, {
        header: true,
        quotes: true,
        newline: "\n",
      });
      const chartBlob = new Blob([chartCSV], { type: "text/csv;charset=utf-8;" });
      downloadBlob(chartBlob, `report_goals_${getTimestampString()}.csv`);
    }
  }
}
