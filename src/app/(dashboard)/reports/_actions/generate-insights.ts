"use server";

import { generateReportAIInsights, type ReportAIInsightRequest } from "../_lib/report-insights-service";

/**
 * Server action to generate AI insights for reports
 * This is called manually by the user via "Generate AI Insights" button
 */
export async function generateInsightsAction(request: ReportAIInsightRequest) {
  try {
    const insights = await generateReportAIInsights(request);
    return { success: true, insights };
  } catch (error) {
    console.error("Error in generateInsightsAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate insights",
    };
  }
}
