"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  MonthlyForecast,
  CategoryPrediction,
  TransactionBehaviorInsight,
  PredictionSummary,
} from "./types";

const supabase = createClient();

// OpenRouter API Configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
const AI_MODEL = "openai/gpt-oss-20b";

/**
 * AI Financial Intelligence Service
 * Generates AI-powered insights using OpenRouter API (openai/gpt-oss-20b)
 * Based on Income vs Expenses Forecast, Category Spending, Expense Types, and Transaction Behavior
 */

interface AIInsightRequest {
  userId: string;
  forecastData: {
    historical: MonthlyForecast[];
    predicted: MonthlyForecast[];
    summary: {
      avgGrowth: number;
      maxSavings: number;
      confidence: number;
      trendDirection?: "up" | "down" | "stable";
      trendStrength?: number;
    };
  };
  categoryPredictions: CategoryPrediction[];
  expenseTypes: {
    recurring: { amount: number; percentage: number; trend: string; trendValue: number };
    variable: { amount: number; percentage: number; trend: string; trendValue: number };
  };
  behaviorInsights: TransactionBehaviorInsight[];
  summary: PredictionSummary;
}

export interface AIInsightResponse {
  financialSummary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  riskAnalysis: string;
  growthPotential: string;
  growthAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }>;
  riskMitigationStrategies: Array<{
    strategy: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
  longTermOpportunities: Array<{
    opportunity: string;
    description: string;
    timeframe: string;
    potentialReturn: string;
  }>;
}

/**
 * Build comprehensive financial context for AI analysis
 */
function buildFinancialContext(request: AIInsightRequest): string {
  const { forecastData, categoryPredictions, expenseTypes, behaviorInsights, summary } = request;

  // Format currency
  const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  let context = `# Financial Data Analysis Context\n\n`;

  // 1. Income vs Expenses Forecast
  context += `## Income vs Expenses Forecast\n\n`;
  context += `### Historical Data (Last ${forecastData.historical.length} months):\n`;
  forecastData.historical.forEach((month) => {
    context += `- ${month.month}: Income ${fmt(month.income)}, Expenses ${fmt(month.expense)}, Net ${fmt(month.income - month.expense)}\n`;
  });

  context += `\n### Predicted Data (Next ${forecastData.predicted.length} months):\n`;
  forecastData.predicted.forEach((month) => {
    context += `- ${month.month}: Income ${fmt(month.income)}, Expenses ${fmt(month.expense)}, Net ${fmt(month.income - month.expense)} (${month.confidence}% confidence)\n`;
  });

  context += `\n### Forecast Summary:\n`;
  context += `- Average Growth: ${forecastData.summary.avgGrowth}%\n`;
  context += `- Max Savings Potential: ${fmt(forecastData.summary.maxSavings)}\n`;
  context += `- Overall Confidence: ${forecastData.summary.confidence}%\n`;
  context += `- Trend Direction: ${forecastData.summary.trendDirection || "stable"}\n`;
  context += `- Trend Strength: ${forecastData.summary.trendStrength || 0}\n\n`;

  // 2. Category Spending Forecast
  context += `## Category Spending Forecast\n\n`;
  if (categoryPredictions.length > 0) {
    categoryPredictions.forEach((cat) => {
      context += `- ${cat.category}: Current ${fmt(cat.actual)}, Predicted ${fmt(cat.predicted)}, Change ${cat.changePercent}% (${cat.trend}), Confidence ${cat.confidence}%\n`;
    });
  } else {
    context += `- No category data available\n`;
  }
  context += `\n`;

  // 3. Expense Type Forecast
  context += `## Expense Type Forecast\n\n`;
  context += `- Recurring Expenses: ${fmt(expenseTypes.recurring.amount)} (${expenseTypes.recurring.percentage}%), Trend: ${expenseTypes.recurring.trend}\n`;
  context += `- Variable Expenses: ${fmt(expenseTypes.variable.amount)} (${expenseTypes.variable.percentage}%), Trend: ${expenseTypes.variable.trend}\n\n`;

  // 4. Transaction Behavior Insights
  context += `## Transaction Behavior Insights\n\n`;
  if (behaviorInsights.length > 0) {
    behaviorInsights.forEach((insight) => {
      context += `- ${insight.name}: Current Avg ${fmt(insight.currentAvg)}, Next Month ${fmt(insight.nextMonth)}, Trend: ${insight.trend}, Confidence: ${insight.confidence}%\n`;
    });
  } else {
    context += `- No behavior insights available\n`;
  }
  context += `\n`;

  // 5. Overall Summary
  context += `## Overall Financial Summary\n\n`;
  context += `- Monthly Income: ${fmt(summary.monthlyIncome)}\n`;
  context += `- Monthly Expenses: ${fmt(summary.monthlyExpenses)}\n`;
  context += `- Net Balance: ${fmt(summary.netBalance)}\n`;
  context += `- Savings Rate: ${summary.savingsRate.toFixed(1)}%\n`;
  if (summary.incomeChange !== null) {
    context += `- Income Change: ${summary.incomeChange > 0 ? "+" : ""}${summary.incomeChange.toFixed(1)}%\n`;
  }
  if (summary.expenseChange !== null) {
    context += `- Expense Change: ${summary.expenseChange > 0 ? "+" : ""}${summary.expenseChange.toFixed(1)}%\n`;
  }

  return context;
}

/**
 * Generate AI-powered financial insights using OpenRouter API
 */
export async function generateAIFinancialInsights(
  request: AIInsightRequest
): Promise<AIInsightResponse> {
  try {
    // Validate API key
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }

    // Build financial context
    const financialContext = buildFinancialContext(request);

    // Build system prompt for financial analysis
    const systemPrompt = `You are an expert financial analyst AI specializing in personal finance, budgeting, and financial planning. Your role is to analyze financial data and provide actionable insights, risk assessments, and strategic recommendations.

Guidelines:
- Analyze income vs expenses trends, category spending patterns, expense types, and transaction behaviors
- Provide clear, actionable recommendations prioritized by impact
- Assess financial risks and provide mitigation strategies
- Identify growth opportunities and long-term financial planning strategies
- Use Philippine Peso (₱) as the currency
- Be concise but comprehensive in your analysis
- Focus on practical, implementable advice
- Consider both short-term and long-term financial health

Response Format:
You must respond with a valid JSON object containing the following structure:
{
  "financialSummary": "Brief 2-3 sentence overview of the user's financial situation",
  "riskLevel": "low" | "medium" | "high",
  "riskScore": number (0-100),
  "riskAnalysis": "Detailed explanation of the risk level and contributing factors",
  "growthPotential": "Brief statement about growth potential (e.g., '₱5,000/month')",
  "growthAnalysis": "Detailed explanation of growth opportunities and potential",
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description of the recommendation",
      "priority": "high" | "medium" | "low",
      "category": "savings" | "expenses" | "income" | "investment" | "debt"
    }
  ],
  "riskMitigationStrategies": [
    {
      "strategy": "Strategy name",
      "description": "How to implement this strategy",
      "impact": "high" | "medium" | "low"
    }
  ],
  "longTermOpportunities": [
    {
      "opportunity": "Opportunity name",
      "description": "Detailed description",
      "timeframe": "e.g., '6-12 months', '1-2 years'",
      "potentialReturn": "e.g., '₱50,000 savings', '10% growth'"
    }
  ]
}`;

    // Build user prompt with financial data
    const userPrompt = `Analyze the following financial data and provide comprehensive insights:\n\n${financialContext}\n\nProvide your analysis in the specified JSON format.`;

    // Make API request to OpenRouter
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        "X-Title": "BudgetSense AI Predictions",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from AI model");
    }

    // Parse AI response
    const aiResponse: AIInsightResponse = JSON.parse(aiContent);

    // Validate response structure
    if (!aiResponse.financialSummary || !aiResponse.riskLevel || !aiResponse.recommendations) {
      throw new Error("Invalid AI response structure");
    }

    // Store insights in database
    await storeAIInsights(request.userId, aiResponse);

    return aiResponse;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Return fallback insights
    return generateFallbackInsights(request);
  }
}

/**
 * Store AI insights in Supabase (using existing ai_insights table structure)
 */
async function storeAIInsights(userId: string, insights: AIInsightResponse): Promise<void> {
  try {
    await supabase.from("ai_insights").insert({
      user_id: userId,
      ai_service: "openrouter",
      model_used: AI_MODEL,
      insights: {
        financial_summary: insights.financialSummary,
        growth_potential: insights.growthPotential,
        growth_analysis: insights.growthAnalysis,
      },
      risk_assessment: {
        risk_level: insights.riskLevel,
        risk_score: insights.riskScore,
        risk_analysis: insights.riskAnalysis,
      },
      recommendations: insights.recommendations,
      opportunity_areas: {
        risk_mitigation_strategies: insights.riskMitigationStrategies,
        long_term_opportunities: insights.longTermOpportunities,
      },
      confidence_level: 0.85,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });
  } catch (error) {
    console.error("Error storing AI insights:", error);
    // Silent fail - don't break the flow
  }
}

/**
 * Generate fallback insights when AI service is unavailable
 */
function generateFallbackInsights(request: AIInsightRequest): AIInsightResponse {
  const { summary, forecastData, categoryPredictions } = request;

  // Calculate risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  let riskScore = 20;

  if (summary.savingsRate < 5) {
    riskLevel = "high";
    riskScore = 80;
  } else if (summary.savingsRate < 15) {
    riskLevel = "medium";
    riskScore = 50;
  }

  // Calculate growth potential
  const avgIncome = forecastData.predicted.reduce((sum, p) => sum + p.income, 0) / forecastData.predicted.length;
  const avgExpense = forecastData.predicted.reduce((sum, p) => sum + p.expense, 0) / forecastData.predicted.length;
  const potentialSavings = (avgIncome - avgExpense) * 0.1; // 10% improvement potential

  return {
    financialSummary: `Your current savings rate is ${summary.savingsRate.toFixed(1)}%. ${
      summary.savingsRate >= 20
        ? "You're doing great with your finances!"
        : summary.savingsRate >= 10
        ? "There's room for improvement in your savings."
        : "Focus on building your savings immediately."
    }`,
    riskLevel,
    riskScore,
    riskAnalysis: `Based on your ${summary.savingsRate.toFixed(1)}% savings rate and spending patterns, your financial risk is ${riskLevel}. ${
      riskLevel === "high"
        ? "Immediate action is needed to improve your financial stability."
        : riskLevel === "medium"
        ? "Consider implementing strategies to reduce expenses and increase savings."
        : "Your finances are stable, but continue monitoring your spending."
    }`,
    growthPotential: `₱${potentialSavings.toFixed(0)}/month`,
    growthAnalysis: `By optimizing your spending patterns and focusing on high-impact categories, you could potentially save an additional ₱${potentialSavings.toFixed(0)} per month.`,
    recommendations: [
      {
        title: "Build Emergency Fund",
        description: "Aim to save 3-6 months of expenses in an easily accessible account for financial security.",
        priority: summary.savingsRate < 10 ? "high" : "medium",
        category: "savings",
      },
      {
        title: "Review Top Spending Categories",
        description: categoryPredictions.length > 0
          ? `Focus on ${categoryPredictions[0].category} which shows a ${categoryPredictions[0].changePercent}% change.`
          : "Track your spending by category to identify optimization opportunities.",
        priority: "high",
        category: "expenses",
      },
      {
        title: "Automate Savings",
        description: "Set up automatic transfers to savings accounts right after receiving income.",
        priority: "medium",
        category: "savings",
      },
    ],
    riskMitigationStrategies: [
      {
        strategy: "Expense Tracking",
        description: "Monitor all expenses daily to identify unnecessary spending and stay within budget.",
        impact: "high",
      },
      {
        strategy: "Budget Allocation",
        description: "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
        impact: "high",
      },
      {
        strategy: "Income Diversification",
        description: "Explore additional income streams to reduce dependency on single source.",
        impact: "medium",
      },
    ],
    longTermOpportunities: [
      {
        opportunity: "Investment Portfolio",
        description: "Once emergency fund is established, consider low-risk investment options for long-term growth.",
        timeframe: "6-12 months",
        potentialReturn: "5-10% annual growth",
      },
      {
        opportunity: "Debt Elimination",
        description: "Focus on paying off high-interest debt to free up cash flow for savings and investments.",
        timeframe: "12-24 months",
        potentialReturn: `₱${(avgExpense * 0.15).toFixed(0)}/month freed up`,
      },
      {
        opportunity: "Financial Education",
        description: "Invest time in learning about personal finance, investing, and wealth building strategies.",
        timeframe: "Ongoing",
        potentialReturn: "Improved financial decision-making",
      },
    ],
  };
}

/**
 * Fetch latest AI insights from database (using existing ai_insights table structure)
 */
export async function fetchLatestAIInsights(userId: string): Promise<AIInsightResponse | null> {
  try {
    const { data, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    // Extract data from JSONB fields
    const insights = data.insights || {};
    const riskAssessment = data.risk_assessment || {};
    const opportunityAreas = data.opportunity_areas || {};

    return {
      financialSummary: insights.financial_summary || "",
      riskLevel: riskAssessment.risk_level || "medium",
      riskScore: riskAssessment.risk_score || 50,
      riskAnalysis: riskAssessment.risk_analysis || "",
      growthPotential: insights.growth_potential || "",
      growthAnalysis: insights.growth_analysis || "",
      recommendations: data.recommendations || [],
      riskMitigationStrategies: opportunityAreas.risk_mitigation_strategies || [],
      longTermOpportunities: opportunityAreas.long_term_opportunities || [],
    };
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return null;
  }
}
