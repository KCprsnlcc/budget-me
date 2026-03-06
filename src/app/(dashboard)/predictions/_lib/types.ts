/**
 * AI Predictions Types
 * TypeScript interfaces and types for the AI-powered financial predictions feature
 */

import type { LucideIcon } from "lucide-react";

/**
 * Monthly forecast data point for income vs expenses chart
 * Enhanced with Prophet-style confidence intervals
 */
export interface MonthlyForecast {
  month: string;
  income: number;
  expense: number;
  type: "historical" | "current" | "predicted";
  confidence?: number;
  // Prophet-style confidence intervals
  incomeUpper?: number;
  incomeLower?: number;
  expenseUpper?: number;
  expenseLower?: number;
  // Prophet components
  trend?: number;
  seasonality?: number;
  changepoint?: boolean;
  // Year to ensure uniqueness when same month appears in different years
  year?: number;
}

/**
 * Category prediction with forecasting data
 */
export interface CategoryPrediction {
  category: string;
  icon?: string;
  color?: string;
  predicted: number;
  actual: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  change: number;
  changePercent: number;
  insight: string;
}

/**
 * Expense type forecast (recurring vs variable)
 */
export interface ExpenseTypeForecast {
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

/**
 * Transaction behavior insight
 */
export interface TransactionBehaviorInsight {
  type: string;
  name: string;
  currentAvg: number;
  nextMonth: number;
  trend: "up" | "down" | "stable";
  confidence: number;
}

/**
 * Prediction history item
 */
export interface PredictionHistory {
  id: string;
  date: string;
  type: "spending" | "income-expense" | "savings" | "trends" | "goals" | "predictions";
  status: "completed" | "failed" | "processing";
  accuracy?: number;
  insights: number;
  dataPoints: number;
  model: string;
  // Actual prediction data
  projectedIncome?: number;
  projectedExpenses?: number;
  projectedSavings?: number;
  incomeGrowth?: number;
  expenseGrowth?: number;
  savingsGrowth?: number;
  categoriesAnalyzed?: number;
  topCategories?: Array<{ category: string; amount: number; trend: string }>;
  recurringExpenses?: number;
  variableExpenses?: number;
  transactionPatterns?: Array<{ type: string; avgAmount: number; trend: string }>;
  anomaliesDetected?: number;
  savingsOpportunities?: number;
  confidenceLevel?: "low" | "medium" | "high" | "very high";
  errorMessage?: string;
  // Full data for reconstruction on page refresh
  fullForecastData?: {
    historical: MonthlyForecast[];
    predicted: MonthlyForecast[];
    summary: any;
  };
  fullCategoryPredictions?: CategoryPrediction[];
  fullExpenseTypes?: {
    recurring: ExpenseTypeForecast;
    variable: ExpenseTypeForecast;
  };
  fullBehaviorInsights?: TransactionBehaviorInsight[];
}

/**
 * Prediction summary for dashboard cards
 */
export interface PredictionSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  savingsRate: number;
  incomeChange: number | null;
  expenseChange: number | null;
}

/**
 * Category spending data for charts
 */
export interface CategorySpendingData {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

/**
 * Anomaly detection result
 */
export interface AnomalyResult {
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  amount?: string;
  action: string;
}

/**
 * Savings opportunity
 */
export interface SavingsOpportunity {
  title: string;
  potential: string;
  confidence: number;
}

/**
 * AI insights result
 */
export interface AIInsights {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  growthPotential: string;
  recommendations: string[];
}

/**
 * Prophet ML model details for a forecast
 */
export interface ProphetModelDetails {
  seasonalityMode: "additive" | "multiplicative";
  yearlySeasonality: boolean;
  weeklySeasonality: boolean;
  changepointPriorScale: number;
  seasonalityPriorScale: number;
  uncertaintySamples: number;
}

/**
 * Forecast accuracy metrics
 */
export interface ForecastAccuracy {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mae: number;  // Mean Absolute Error
  coverage: number; // Confidence interval coverage
}

/**
 * Enhanced forecast summary with Prophet metrics
 */
export interface ForecastSummary {
  avgGrowth: number;
  maxSavings: number;
  confidence: number;
  // Prophet-specific metrics
  modelDetails?: ProphetModelDetails;
  accuracy?: ForecastAccuracy;
  changepoints?: string[]; // Months with detected changepoints
  seasonalityStrength?: number;
  trendDirection?: "up" | "down" | "stable";
  trendStrength?: number;
}

/**
 * Prediction generation options
 */
export interface PredictionOptions {
  forecastMonths?: number;
  confidenceThreshold?: number;
  includeAnomalies?: boolean;
  includeSavingsOpportunities?: boolean;
}

/**
 * Prophet-style forecast configuration
 */
export interface ProphetConfig {
  seasonalityMode: "additive" | "multiplicative";
  yearlySeasonality: boolean;
  weeklySeasonality: boolean;
  dailySeasonality: boolean;
  changepointPriorScale: number;
  seasonalityPriorScale: number;
  uncertaintySamples: number;
}

/**
 * Forecast step data for detailed breakdown
 */
export interface ForecastStep {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  confidence: number;
  // Prophet-style confidence intervals
  incomeUpper: number;
  incomeLower: number;
  expenseUpper: number;
  expenseLower: number;
  // Trend indicators
  incomeTrend: "up" | "down" | "stable";
  expenseTrend: "up" | "down" | "stable";
  changepoint?: boolean;
}

/**
 * Category analysis item for detailed breakdown
 */
export interface CategoryAnalysis {
  category: string;
  current: number;
  predicted: number;
  change: number;
  trend: "up" | "down" | "stable";
  percentage: number;
}

/**
 * Key insight for overview section
 */
export interface KeyInsight {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
  icon: LucideIcon;
}
