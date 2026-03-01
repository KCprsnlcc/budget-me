/**
 * AI Predictions Types
 * TypeScript interfaces and types for the AI-powered financial predictions feature
 */

import type { LucideIcon } from "lucide-react";

/**
 * Monthly forecast data point for income vs expenses chart
 */
export interface MonthlyForecast {
  month: string;
  income: number;
  expense: number;
  type: "historical" | "current" | "predicted";
  confidence?: number;
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
  type: "monthly" | "weekly" | "category" | "anomaly" | "full";
  status: "completed" | "failed" | "processing";
  accuracy?: number;
  insights: number;
  dataPoints: number;
  model: string;
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
 * Complete prediction result
 */
export interface PredictionResult {
  forecast: {
    historical: MonthlyForecast[];
    predicted: MonthlyForecast[];
    summary: {
      avgGrowth: number;
      maxSavings: number;
      confidence: number;
    };
  };
  categories: CategoryPrediction[];
  expenseTypes: {
    recurring: ExpenseTypeForecast;
    variable: ExpenseTypeForecast;
  };
  behaviorInsights: TransactionBehaviorInsight[];
  summary: PredictionSummary;
  anomalies: AnomalyResult[];
  savingsOpportunities: SavingsOpportunity[];
  aiInsights: AIInsights;
  history: PredictionHistory[];
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
