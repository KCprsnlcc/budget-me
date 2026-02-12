export interface AnomalyAlert {
  id: string;
  type: 'unusual-spending' | 'duplicate-transaction' | 'budget-overspend' | 'income-anomaly';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  amount?: number;
  category?: string;
  trend?: number;
  status: 'active' | 'dismissed' | 'resolved';
}

export interface AIInsight {
  id: string;
  type: 'savings-opportunity' | 'budget-recommendation' | 'spending-trend' | 'investment-advice';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  potentialSavings?: number;
  recommendation: string;
  timeHorizon: string;
  confidence: number;
}

export interface ReportSettings {
  reportType: 'spending' | 'income-expense' | 'savings' | 'trends' | 'goals' | 'predictions';
  timeframe: 'month' | 'quarter' | 'year' | 'custom';
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
  categories: string[];
  accounts: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}


export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  settings: ReportSettings;
  isDefault: boolean;
}

export interface AnomalyDetails {
  anomaly: AnomalyAlert;
  relatedTransactions: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    category: string;
  }>;
  historicalData: Array<{
    period: string;
    amount: number;
    isAnomalous: boolean;
  }>;
  recommendations: string[];
}

export interface AIInsightDetails {
  insight: AIInsight;
  analysis: string;
  supportingData: Array<{
    label: string;
    value: number | string;
    change?: number;
  }>;
  actionSteps: Array<{
    step: number;
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact?: string;
  }>;
  relatedInsights: AIInsight[];
}
