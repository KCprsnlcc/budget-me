
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

export interface UserExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

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

export interface ChatMessageExportData extends Record<string, string | number | boolean | null | undefined> {
  timestamp: string;
  role: string;
  content: string;
  model: string | null;
  userName?: string;
}

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

export interface ReportExportData {

  summary: {
    totalTransactions: number;
    activeBudgets: number;
    budgetsOnTrack: number;
    budgetsWarning: number;
    activeGoals: number;
    goalsNearing: number;
    lastUpdated: string;
  };

  settings: {
    reportType: string;
    timeframe: string;
    chartType: string;
    dateRange: string;
  };

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

  chartData: any;

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

export interface AIUsageAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  usage_date: string;
  user_email: string;
  predictions_used: number;
  insights_used: number;
  chatbot_used: number;
  total_used: number;
}

export interface FamilyAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  family_name: string;
  owner_email: string;
  member_count: number;
  created_at: string;
  subscription_status: string;
}

export interface BackupAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  status: string;
  type: string;
  started_at: string;
  finished_at: string;
  size: string;
  tables_count: number;
  created_by: string;
}

export interface ActivityAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  type: string;
  description: string;
  user_email: string;
  severity: string;
  created_at: string;
  metadata: string;
}

export interface AnalyticsAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  user_id: string;
  user_name: string;
  user_email: string;
  total_reports: number;
  total_transactions: number;
  active_budgets: number;
  active_goals: number;
  last_updated: string;
}

export interface BudgetAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  budget_name: string;
  user: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  period: string;
  status: string;
}

export interface GoalAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  goal_name: string;
  user_email: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  priority: string;
  status: string;
  category: string;
}

export interface PredictionAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  date: string;
  user_email: string;
  type: string;
  accuracy: string;
  confidence: string;
  data_points: number;
}

export interface ChatbotAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  user_email: string;
  user_name: string;
  total_messages: number;
  models_used: string;
  last_active: string;
  last_message_preview: string;
}
export interface TransactionAdminExportData extends Record<string, string | number | boolean | null | undefined> {
  id: string;
  date: string;
  user_email: string;
  description: string | null;
  type: string;
  category: string;
  account: string;
  amount: number;
  notes: string | null;
}
