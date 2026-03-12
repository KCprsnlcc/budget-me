"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Model ID used for database records (no API key on client)
const AI_MODEL = "openai/gpt-oss-20b";

/**
 * Report AI Insights Service
 * Generates AI-powered insights for financial reports via secure backend API route.
 * The OpenRouter API key never leaves the server.
 */

export interface ReportAIInsightRequest {
  userId: string;
  reportType: 'spending' | 'income-expense' | 'savings' | 'trends' | 'goals' | 'predictions';
  timeframe: 'month' | 'quarter' | 'year';
  reportData: {
    summary?: any;
    anomalies?: any[];
    chartData?: any;
  };
}

export interface ReportAIInsightResponse {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  riskAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
    potentialSavings?: number;
    timeHorizon: string;
  }>;
  insights: Array<{
    type: 'savings-opportunity' | 'budget-recommendation' | 'spending-trend' | 'investment-advice';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
    potentialSavings?: number;
    recommendation: string;
    timeHorizon: string;
    confidence: number;
  }>;
  actionableSteps: string[];
}

/**
 * Build comprehensive report context for AI analysis
 */
function buildReportContext(request: ReportAIInsightRequest): string {
  const { reportType, timeframe, reportData } = request;

  // Format currency
  const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  let context = `# Financial Report Analysis Context\n\n`;
  context += `Report Type: ${reportType}\n`;
  context += `Timeframe: ${timeframe}\n\n`;

  // Add summary data
  if (reportData.summary) {
    context += `## Summary Statistics\n\n`;
    Object.entries(reportData.summary).forEach(([key, value]) => {
      if (typeof value === 'number') {
        context += `- ${key}: ${value}\n`;
      } else {
        context += `- ${key}: ${value}\n`;
      }
    });
    context += `\n`;
  }

  // Add anomalies
  if (reportData.anomalies && reportData.anomalies.length > 0) {
    context += `## Detected Anomalies\n\n`;
    reportData.anomalies.forEach((anomaly, idx) => {
      context += `${idx + 1}. ${anomaly.title} (${anomaly.severity} severity)\n`;
      context += `   - ${anomaly.description}\n`;
      if (anomaly.amount) {
        context += `   - Amount: ${fmt(anomaly.amount)}\n`;
      }
      if (anomaly.category) {
        context += `   - Category: ${anomaly.category}\n`;
      }
    });
    context += `\n`;
  }

  // Add chart data
  if (reportData.chartData) {
    context += `## Chart Data Analysis\n\n`;
    
    if (reportData.chartData.categories) {
      context += `### Spending by Category:\n`;
      reportData.chartData.categories.forEach((cat: any) => {
        context += `- ${cat.name}: ${fmt(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
      });
      context += `\n`;
    }

    if (reportData.chartData.monthly) {
      context += `### Monthly Income vs Expenses:\n`;
      reportData.chartData.monthly.forEach((month: any) => {
        context += `- ${month.month}: Income ${fmt(month.income)}, Expenses ${fmt(month.expenses)}, Net ${fmt(month.income - month.expenses)}\n`;
      });
      context += `\n`;
    }

    if (reportData.chartData.funds) {
      context += `### Savings Goals:\n`;
      reportData.chartData.funds.forEach((fund: any) => {
        context += `- ${fund.name}: ${fmt(fund.amount)} / ${fmt(fund.target)} (${fund.percentage.toFixed(1)}%)\n`;
      });
      context += `\n`;
    }

    if (reportData.chartData.goals) {
      context += `### Goals Progress:\n`;
      reportData.chartData.goals.forEach((goal: any) => {
        context += `- ${goal.name}: ${fmt(goal.current)} / ${fmt(goal.target)} (${goal.percentage.toFixed(1)}%)\n`;
      });
      context += `\n`;
    }
  }

  return context;
}

/**
 * Generate AI-powered report insights via secure backend API route
 */
export async function generateReportAIInsights(
  request: ReportAIInsightRequest
): Promise<ReportAIInsightResponse> {
  try {
    // Build report context
    const reportContext = buildReportContext(request);

    // Build system prompt for report analysis
    const systemPrompt = `You are an expert financial analyst AI specializing in personal finance reporting, budgeting, and financial planning. Your role is to analyze financial report data and provide actionable insights, risk assessments, and strategic recommendations.

Guidelines:
- Analyze spending patterns, income trends, savings progress, and anomalies
- Provide clear, actionable recommendations prioritized by impact
- Assess financial risks and provide mitigation strategies
- Identify savings opportunities and optimization strategies
- Use Philippine Peso (₱) as the currency
- Be concise but comprehensive in your analysis
- Focus on practical, implementable advice
- Consider both short-term and long-term financial health

Response Format:
You must respond with a valid JSON object containing the following structure:
{
  "summary": "Brief 2-3 sentence overview of the financial report findings",
  "riskLevel": "low" | "medium" | "high",
  "riskScore": number (0-100),
  "riskAnalysis": "Detailed explanation of the risk level and contributing factors",
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description of the recommendation",
      "priority": "high" | "medium" | "low",
      "category": "savings" | "expenses" | "income" | "budget" | "goals",
      "potentialSavings": number (optional),
      "timeHorizon": "e.g., '1-2 weeks', '1-2 months', 'Next month'"
    }
  ],
  "insights": [
    {
      "type": "savings-opportunity" | "budget-recommendation" | "spending-trend" | "investment-advice",
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "low" | "medium" | "high",
      "category": "Category name",
      "potentialSavings": number (optional),
      "recommendation": "Specific action to take",
      "timeHorizon": "Time period",
      "confidence": number (0.0-1.0)
    }
  ],
  "actionableSteps": [
    "Step 1: Specific action",
    "Step 2: Specific action",
    "Step 3: Specific action"
  ]
}`;

    // Build user prompt with report data
    const userPrompt = `Analyze the following financial report data and provide comprehensive insights:\n\n${reportContext}\n\nProvide your analysis in the specified JSON format.`;

    // ─── Call secure backend API route instead of OpenRouter directly ───
    const response = await fetch("/api/ai/report-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Report AI Insights API Error:", errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.content;

    if (!aiContent) {
      throw new Error("No response from AI model");
    }

    // Parse AI response
    const aiResponse: ReportAIInsightResponse = JSON.parse(aiContent);

    // Validate response structure
    if (!aiResponse.summary || !aiResponse.riskLevel || !aiResponse.recommendations) {
      throw new Error("Invalid AI response structure");
    }

    // Store insights in database
    await storeReportInsights(request.userId, request.reportType, request.timeframe, aiResponse);

    return aiResponse;
  } catch (error) {
    console.error("Error generating report AI insights:", error);
    
    // Return fallback insights
    return generateFallbackReportInsights(request);
  }
}

/**
 * Store report AI insights in Supabase (ai_reports table)
 */
async function storeReportInsights(
  userId: string,
  reportType: string,
  timeframe: string,
  insights: ReportAIInsightResponse
): Promise<void> {
  try {
    await supabase.from("ai_reports").insert({
      user_id: userId,
      report_type: reportType,
      timeframe,
      insights: {
        summary: insights.summary,
        risk_level: insights.riskLevel,
        risk_score: insights.riskScore,
        risk_analysis: insights.riskAnalysis,
        actionable_steps: insights.actionableSteps,
      },
      recommendations: insights.recommendations,
      summary: insights.summary,
      ai_service: "openrouter",
      ai_model: AI_MODEL,
      confidence_level: 0.85,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });
  } catch (error) {
    console.error("Error storing report insights:", error);
    // Silent fail - don't break the flow
  }
}

/**
 * Generate fallback insights when AI service is unavailable
 */
function generateFallbackReportInsights(request: ReportAIInsightRequest): ReportAIInsightResponse {
  const { reportData } = request;

  // Calculate basic risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  let riskScore = 20;

  if (reportData.anomalies && reportData.anomalies.length > 0) {
    const highSeverity = reportData.anomalies.filter((a: any) => a.severity === 'high').length;
    if (highSeverity > 0) {
      riskLevel = "high";
      riskScore = 75;
    } else if (reportData.anomalies.length > 2) {
      riskLevel = "medium";
      riskScore = 50;
    }
  }

  return {
    summary: `Your financial report shows ${reportData.anomalies?.length || 0} anomalies detected. ${
      riskLevel === "high"
        ? "Immediate attention is needed to address spending issues."
        : riskLevel === "medium"
        ? "Some areas need improvement to optimize your finances."
        : "Your finances are generally stable."
    }`,
    riskLevel,
    riskScore,
    riskAnalysis: `Based on your spending patterns and detected anomalies, your financial risk is ${riskLevel}. ${
      riskLevel === "high"
        ? "Focus on reducing unnecessary expenses and addressing budget overruns."
        : riskLevel === "medium"
        ? "Monitor your spending closely and implement budget controls."
        : "Continue maintaining good financial habits."
    }`,
    recommendations: [
      {
        title: "Review Spending Patterns",
        description: "Analyze your top spending categories and identify areas for optimization.",
        priority: "high",
        category: "expenses",
        timeHorizon: "This week",
      },
      {
        title: "Set Budget Limits",
        description: "Establish clear budget limits for high-spending categories to prevent overspending.",
        priority: "high",
        category: "budget",
        timeHorizon: "Next month",
      },
      {
        title: "Track Daily Expenses",
        description: "Monitor expenses daily to stay within budget and catch anomalies early.",
        priority: "medium",
        category: "expenses",
        timeHorizon: "Ongoing",
      },
    ],
    insights: [
      {
        type: "spending-trend",
        title: "Spending Analysis",
        description: "Review your spending patterns to identify optimization opportunities.",
        impact: "medium",
        category: "Spending Analysis",
        recommendation: "Track expenses more closely and set category-specific budgets",
        timeHorizon: "1-2 months",
        confidence: 0.75,
      },
      {
        type: "budget-recommendation",
        title: "Budget Optimization",
        description: "Consider adjusting your budget allocations based on actual spending patterns.",
        impact: "medium",
        category: "Budget Planning",
        recommendation: "Review and adjust budget limits for top spending categories",
        timeHorizon: "Next month",
        confidence: 0.80,
      },
    ],
    actionableSteps: [
      "Review all detected anomalies and verify transactions",
      "Set up budget alerts for high-spending categories",
      "Track daily expenses to stay within budget limits",
      "Schedule a monthly financial review to assess progress",
    ],
  };
}

/**
 * Fetch cached report insights from database
 */
export async function fetchCachedReportInsights(
  userId: string,
  reportType: string,
  timeframe: string
): Promise<ReportAIInsightResponse | null> {
  try {
    const { data, error } = await supabase
      .from("ai_reports")
      .select("*")
      .eq("user_id", userId)
      .eq("report_type", reportType)
      .eq("timeframe", timeframe)
      .gt("expires_at", new Date().toISOString())
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    // Extract data from JSONB fields
    const insights = data.insights || {};

    return {
      summary: insights.summary || data.summary || "",
      riskLevel: insights.risk_level || "medium",
      riskScore: insights.risk_score || 50,
      riskAnalysis: insights.risk_analysis || "",
      recommendations: data.recommendations || [],
      insights: [], // Would need to be stored separately if needed
      actionableSteps: insights.actionable_steps || [],
    };
  } catch (error) {
    console.error("Error fetching cached report insights:", error);
    return null;
  }
}
