/**
 * Transaction export interfaces
 */
export interface TransactionExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  date: string;
  description: string | null;
  type: string;
  category: string;
  account: string;
  amount: number;
  notes: string | null;
}

/**
 * Goal export interfaces
 */
export interface GoalExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  name: string;
  target: number;
  current: number;
  remaining: number;
  progress: string;
  priority: string;
  status: string;
  category: string;
  deadline: string;
  monthlyContribution: number;
  isFamily: boolean;
}

/**
 * Budget export interfaces
 */
export interface BudgetExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  budget_name: string;
  category: string;
  period: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: string;
  status: string;
  health: string;
  start_date: string;
  end_date: string;
}

/**
 * Chat message export interfaces
 */
export interface ChatMessageExportData extends Record<string, string | number | boolean | null | undefined> {
  timestamp: string;
  role: string;
  content: string;
  model: string | null;
  userName?: string;
}

/**
 * Prediction export interfaces
 */
export interface PredictionExportData extends Record<string, string | number | boolean | null | undefined> {
  month: string;
  type: string;
  income: number;
  expense: number;
  netSavings: number;
}

export interface CategoryPredictionExportData extends Record<string, string | number | boolean | null | undefined> {
  category: string;
  historicalAvg: number;
  predicted: number;
  change: number;
  changePercent: string;
  trend: string;
  confidence: string;
}

export interface AIInsightsExportData {
  summary: string;
  riskLevel: string;
  riskScore: number;
  riskAnalysis: string;
  growthPotential: string;
  growthAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    category: string;
  }>;
  riskMitigationStrategies: Array<{
    strategy: string;
    description: string;
    impact: string;
  }>;
  longTermOpportunities: Array<{
    opportunity: string;
    description: string;
    timeframe: string;
    potentialReturn: string;
  }>;
}

/**
 * Report export interfaces
 */
export interface ReportExportData {
  // Summary data
  summary: {
    totalTransactions: number;
    activeBudgets: number;
    budgetsOnTrack: number;
    budgetsWarning: number;
    activeGoals: number;
    goalsNearing: number;
    lastUpdated: string;
  };
  // Report settings
  settings: {
    reportType: string;
    timeframe: string;
    chartType: string;
    dateRange: string;
  };
  // Anomaly data
  anomalies: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    type: string;
    category: string;
    amount: number | string | null;
    detectedAt: string;
  }>;
  // Chart data (varies by report type)
  chartData: any;
  // AI insights
  aiInsights?: {
    summary: string;
    riskLevel: string;
    riskScore: number;
    riskAnalysis: string;
    growthPotential: string;
    growthAnalysis: string;
    recommendations: Array<{
      title: string;
      description: string;
      priority: string;
      category: string;
      timeHorizon?: string;
      potentialSavings?: number;
    }>;
    actionableSteps?: string[];
  } | null;
}
