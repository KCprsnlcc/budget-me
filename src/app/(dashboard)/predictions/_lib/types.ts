

import type { LucideIcon } from "lucide-react";

export interface MonthlyForecast {
  month: string;
  income: number;
  expense: number;
  type: "historical" | "current" | "predicted";
  confidence?: number;

  incomeUpper?: number;
  incomeLower?: number;
  expenseUpper?: number;
  expenseLower?: number;

  trend?: number;
  seasonality?: number;
  changepoint?: boolean;

  year?: number;
}

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

export interface ExpenseTypeForecast {
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export interface TransactionBehaviorInsight {
  type: string;
  name: string;
  currentAvg: number;
  nextMonth: number;
  trend: "up" | "down" | "stable";
  confidence: number;
}

export interface PredictionHistory {
  id: string;
  date: string;
  type: "spending" | "income-expense" | "savings" | "trends" | "goals" | "predictions";
  status: "completed" | "failed" | "processing";
  accuracy?: number;
  insights: number;
  dataPoints: number;
  model: string;

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

export interface PredictionSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  savingsRate: number;
  incomeChange: number | null;
  expenseChange: number | null;
}

export interface CategorySpendingData {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface AnomalyResult {
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  amount?: string;
  action: string;
}

export interface SavingsOpportunity {
  title: string;
  potential: string;
  confidence: number;
}

export interface AIInsights {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  growthPotential: string;
  recommendations: string[];
}

export interface ProphetModelDetails {
  seasonalityMode: "additive" | "multiplicative";
  yearlySeasonality: boolean;
  weeklySeasonality: boolean;
  changepointPriorScale: number;
  seasonalityPriorScale: number;
  uncertaintySamples: number;
}

export interface ForecastAccuracy {
  mape: number; 
  rmse: number; 
  mae: number;  
  coverage: number; 
}

export interface ForecastSummary {
  avgGrowth: number;
  maxSavings: number;
  confidence: number;

  modelDetails?: ProphetModelDetails;
  accuracy?: ForecastAccuracy;
  changepoints?: string[];
  seasonalityStrength?: number;
  trendDirection?: "up" | "down" | "stable";
  trendStrength?: number;
}

export interface PredictionOptions {
  forecastMonths?: number;
  confidenceThreshold?: number;
  includeAnomalies?: boolean;
  includeSavingsOpportunities?: boolean;
}

export interface ProphetConfig {
  seasonalityMode: "additive" | "multiplicative";
  yearlySeasonality: boolean;
  weeklySeasonality: boolean;
  dailySeasonality: boolean;
  changepointPriorScale: number;
  seasonalityPriorScale: number;
  uncertaintySamples: number;
}

export interface ForecastStep {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  confidence: number;

  incomeUpper: number;
  incomeLower: number;
  expenseUpper: number;
  expenseLower: number;

  incomeTrend: "up" | "down" | "stable";
  expenseTrend: "up" | "down" | "stable";
  changepoint?: boolean;
}

export interface CategoryAnalysis {
  category: string;
  current: number;
  predicted: number;
  change: number;
  trend: "up" | "down" | "stable";
  percentage: number;
}

export interface KeyInsight {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
  icon: LucideIcon;
}
