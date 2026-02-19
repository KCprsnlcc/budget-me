"use client";

import { useState, useCallback, memo, useEffect } from "react";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  PieChart,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Settings,
  AlertTriangle,
  Star,
  ChevronDown,
  Eye,
  BarChart2,
  Table,
  Wallet,
  RefreshCw,
  Flag,
  Square,
  Circle,
  LineChart,
  MoreHorizontal,
  Lightbulb,
  Search,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AnomalyDetailsModal,
} from "./_components";
import type { AnomalyAlert, AIInsight, ReportSettings, AnomalyDetails } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Sample data matching the prototype
const SUMMARY_CARDS = [
  {
    label: "Total Transactions",
    value: "1,248",
    change: "+12%",
    trend: "up",
    icon: BarChart2,
    description: "Compared to last month",
  },
  {
    label: "Active Budgets",
    value: "8",
    change: "",
    trend: "neutral",
    icon: PieChart,
    description: "6 on track, 2 warning",
  },
  {
    label: "Active Goals",
    value: "12",
    change: "",
    trend: "neutral", 
    icon: Flag,
    description: "Total active goals",
    badge: "2 Nearing",
  },
  {
    label: "Last Updated",
    value: "Today",
    change: "",
    trend: "neutral",
    icon: RefreshCw,
    description: "10:45 AM via Sync",
  },
];

const ANOMALY_ALERTS: AnomalyAlert[] = [
  {
    id: "1",
    type: "unusual-spending",
    title: "Unusual Spending Pattern",
    description: 'Your "Dining Out" spending is 45% higher than usual for this time of month.',
    severity: "medium",
    timestamp: "2 hours ago",
    amount: 45,
    category: "Food & Dining",
    trend: 45,
    status: "active",
  },
  {
    id: "2", 
    type: "duplicate-transaction",
    title: "Duplicate Transaction",
    description: "Possible duplicate charge detected: Netflix subscription (₱15.99) charged twice.",
    severity: "low",
    timestamp: "5 hours ago",
    amount: 15.99,
    category: "Entertainment",
    status: "active",
  },
];

const AI_INSIGHTS: AIInsight[] = [
  {
    id: "1",
    type: "savings-opportunity",
    title: "Savings Opportunity",
    description: "You could save ₱120/month by reducing dining out expenses by 25%. This would increase your savings rate to 65%.",
    impact: "high",
    category: "Spending Analysis",
    potentialSavings: 120,
    recommendation: "Reduce dining out frequency by 25% and allocate savings to emergency fund",
    timeHorizon: "1-2 months",
    confidence: 0.85,
  },
  {
    id: "2", 
    type: "budget-recommendation", 
    title: "Budget Adjustment",
    description: "Based on your spending patterns, consider increasing your \"Groceries\" budget by $50 to avoid overspending.",
    impact: "medium",
    category: "Budget Planning",
    recommendation: "Increase grocery budget allocation by ₱50 per month",
    timeHorizon: "Next month",
    confidence: 0.92,
  },
  {
    id: "3",
    type: "spending-trend",
    title: "Spending Trend",
    description: "Your entertainment spending has increased by 35% over the last 3 months. Consider setting a stricter limit.",
    impact: "medium",
    category: "Trend Analysis",
    recommendation: "Set entertainment spending limit at ₱200/month",
    timeHorizon: "Immediate",
    confidence: 0.78,
  },
  {
    id: "4",
    type: "savings-opportunity",
    title: "Subscription Optimization",
    description: "Review your recurring subscriptions - you could save ₱45/month by canceling unused services.",
    impact: "high",
    category: "Subscription Analysis",
    potentialSavings: 45,
    recommendation: "Audit and cancel unused streaming and service subscriptions",
    timeHorizon: "1-2 weeks",
    confidence: 0.88,
  },
];

const MONTHLY_DATA = [
  { month: "Aug", income: 8200, expenses: 5100 },
  { month: "Sep", income: 8450, expenses: 5800 },
  { month: "Oct", income: 8100, expenses: 4900 },
  { month: "Nov", income: 8700, expenses: 5300 },
  { month: "Dec", income: 9200, expenses: 6100 },
  { month: "Jan", income: 8450, expenses: 5230 },
];

const CATEGORY_BREAKDOWN = [
  { name: "Housing", amount: 1800, percentage: 34.4, color: "#94a3b8" },
  { name: "Food & Dining", amount: 420, percentage: 8.0, color: "#10b981" },
  { name: "Shopping", amount: 230, percentage: 4.4, color: "#3b82f6" },
  { name: "Transportation", amount: 185, percentage: 3.5, color: "#f59e0b" },
  { name: "Entertainment", amount: 148, percentage: 2.8, color: "#a855f7" },
  { name: "Utilities", amount: 220, percentage: 4.2, color: "#06b6d4" },
  { name: "Other", amount: 2227, percentage: 42.6, color: "#e2e8f0" },
];

// Placeholder data for Spending by Category charts
const SPENDING_DATA = {
  total: 5230,
  categories: CATEGORY_BREAKDOWN,
  trend: [
    { period: "Week 1", amount: 1200, change: -5 },
    { period: "Week 2", amount: 1350, change: 12 },
    { period: "Week 3", amount: 1280, change: -5 },
    { period: "Week 4", amount: 1400, change: 9 },
  ],
};

// Placeholder data for Income vs Expense charts
const INCOME_EXPENSE_DATA = {
  monthly: MONTHLY_DATA,
  totals: {
    income: 50700,
    expenses: 32430,
    netSavings: 18270,
  },
  percentages: {
    income: 60,
    expenses: 40,
  },
};

// Placeholder data for Savings Analysis charts
const SAVINGS_DATA = {
  total: 20650,
  rate: 38.1,
  funds: [
    { name: "Emergency Fund", amount: 12500, percentage: 60, color: "#10b981", target: 15000 },
    { name: "Retirement", amount: 6200, percentage: 30, color: "#3b82f6", target: 10000 },
    { name: "Vacation", amount: 1950, percentage: 10, color: "#f59e0b", target: 5000 },
  ],
  history: [
    { month: "Aug", savings: 3200 },
    { month: "Sep", savings: 2800 },
    { month: "Oct", savings: 3100 },
    { month: "Nov", savings: 2900 },
    { month: "Dec", savings: 3400 },
    { month: "Jan", savings: 3250 },
  ],
};

// Placeholder data for Spending Trends
const TRENDS_DATA = {
  categories: [
    { name: "Entertainment", change: 35, trend: "up", color: "#f59e0b" },
    { name: "Transportation", change: -12, trend: "down", color: "#10b981" },
    { name: "Dining", change: 5, trend: "up", color: "#3b82f6" },
    { name: "Shopping", change: -8, trend: "down", color: "#10b981" },
    { name: "Utilities", change: 15, trend: "up", color: "#f59e0b" },
  ],
  monthlyComparison: [
    { month: "Aug", current: 4800, previous: 4500 },
    { month: "Sep", current: 5100, previous: 4900 },
    { month: "Oct", current: 4900, previous: 5200 },
    { month: "Nov", current: 5300, previous: 4800 },
    { month: "Dec", current: 6100, previous: 5500 },
    { month: "Jan", current: 5230, previous: 6100 },
  ],
};

// Placeholder data for Goals Progress
const GOALS_DATA = {
  goals: [
    { name: "Emergency Fund", current: 11250, target: 15000, percentage: 75, color: "#10b981" },
    { name: "Vacation Fund", current: 2250, target: 5000, percentage: 45, color: "#3b82f6" },
    { name: "New Car", current: 8000, target: 20000, percentage: 40, color: "#f59e0b" },
    { name: "Home Down Payment", current: 45000, target: 100000, percentage: 45, color: "#a855f7" },
  ],
  totalGoals: 4,
  completedGoals: 0,
  nearingCompletion: 2,
};

// Placeholder data for Future Predictions
const PREDICTIONS_DATA = {
  nextMonth: {
    expenses: 5450,
    income: 8450,
    savings: 3000,
    confidence: 87,
  },
  threeMonth: {
    expenses: 16800,
    income: 25500,
    savings: 8700,
    confidence: 72,
  },
  insights: [
    { label: "Expected Savings Increase", value: "+12%", trend: "positive" },
    { label: "Largest Expense Category", value: "Housing", trend: "neutral" },
    { label: "Risk Alert", value: "Dining +15%", trend: "negative" },
  ],
};

export default function ReportsPage() {
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetails | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [reportSettings, setReportSettings] = useState<ReportSettings>({
    reportType: "spending",
    timeframe: "month",
    chartType: "pie",
    categories: ["housing", "food", "transport", "utilities", "other"],
    accounts: ["checking", "chase"],
  });
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading time

    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Page Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton width={200} height={32} className="mb-2" />
              <Skeleton width={300} height={16} />
            </div>
            <div className="flex gap-3">
              <Skeleton width={100} height={36} borderRadius={4} />
              <Skeleton width={100} height={36} borderRadius={4} />
              <Skeleton width={120} height={36} borderRadius={4} />
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton width={40} height={40} borderRadius={8} />
                  <Skeleton width={80} height={20} borderRadius={10} />
                </div>
                <Skeleton width={100} height={16} className="mb-2" />
                <Skeleton width={120} height={24} />
                <Skeleton width={150} height={12} />
              </Card>
            ))}
          </div>

          {/* Report Settings Panel Skeleton */}
          <Card className="p-5">
            <div className="mb-4">
              <Skeleton width={150} height={16} className="mb-2" />
              <Skeleton width={200} height={12} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton width={80} height={12} className="mb-2" />
                  <Skeleton width="100%" height={32} borderRadius={4} />
                </div>
              ))}
            </div>
          </Card>

          {/* Anomaly Alerts Section Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton width={150} height={16} className="mb-2" />
                <Skeleton width={200} height={12} />
              </div>
              <Skeleton width={120} height={20} borderRadius={10} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-4 border-l-4">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton width={80} height={10} />
                    <Skeleton width={16} height={16} borderRadius={4} />
                  </div>
                  <Skeleton width="80%" height={16} className="mb-3" />
                  <Skeleton width="60%" height={12} className="mb-3" />
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Skeleton width={60} height={10} />
                      <Skeleton width={40} height={10} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton width={50} height={20} borderRadius={4} />
                      <Skeleton width={60} height={20} borderRadius={4} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* AI Financial Insights Section Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton width={150} height={16} className="mb-2" />
                <Skeleton width={250} height={12} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <Skeleton width={120} height={12} />
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton width="100%" height={14} />
                    <Skeleton width="90%" height={14} />
                    <Skeleton width="85%" height={14} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton width={80} height={10} />
                      <Skeleton width="60%" height={10} />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton width={60} height={10} />
                      <Skeleton width={40} height={10} />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton width={80} height={10} />
                      <Skeleton width={50} height={10} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Charts Section Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton width={150} height={16} className="mb-2" />
                <Skeleton width={200} height={12} />
              </div>
            </div>
            <Skeleton height={500} borderRadius={8} />
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  const handleExport = useCallback((options: any) => {
    console.log("Exporting with options:", options);
    // Handle export logic here
  }, []);

  const handleAnomalyDetails = useCallback((anomalyId: string) => {
    // Mock anomaly details
    const details: AnomalyDetails = {
      anomaly: ANOMALY_ALERTS.find(a => a.id === anomalyId)!,
      relatedTransactions: [
        { id: "1", name: "Restaurant A", amount: 45.50, date: "Oct 24, 7:30 PM", category: "Food & Dining" },
        { id: "2", name: "Restaurant B", amount: 32.00, date: "Oct 23, 8:15 PM", category: "Food & Dining" },
        { id: "3", name: "Coffee Shop", amount: 12.75, date: "Oct 22, 2:30 PM", category: "Food & Dining" },
      ],
      historicalData: [
        { period: "Week 1", amount: 85.50, isAnomalous: false },
        { period: "Week 2", amount: 92.00, isAnomalous: false },
        { period: "Week 3", amount: 125.75, isAnomalous: true },
        { period: "Week 4", amount: 118.25, isAnomalous: true },
      ],
      recommendations: [
        "Review recent dining transactions for potential duplicates",
        "Consider setting a monthly dining budget limit",
        "Track dining expenses more closely for the remainder of the month",
      ],
    };
    setSelectedAnomaly(details);
    setShowAnomalyModal(true);
  }, []);

  const handleDismissAnomaly = useCallback((anomalyId: string) => {
    console.log("Dismissing anomaly:", anomalyId);
  }, []);

  const handleResolveAnomaly = useCallback((anomalyId: string) => {
    console.log("Resolving anomaly:", anomalyId);
  }, []);

  const handleSaveSettings = useCallback((settings: ReportSettings) => {
    setReportSettings(settings);
    console.log("Settings updated:", settings);
  }, []);

  // Memoized components for better performance
  const SummaryCard = memo(({ item }: { item: typeof SUMMARY_CARDS[0] }) => {
    const Icon = item.icon;
    return (
      <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg text-slate-600">
            <Icon size={22} strokeWidth={1.5} />
          </div>
          {item.change && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 border-emerald-100 px-2 py-1 rounded-full border">
              <ArrowUp size={12} />
              {item.change}
            </div>
          )}
          {item.badge && (
            <Badge variant="warning" className="text-[9px] px-2 py-1">
              {item.badge}
            </Badge>
          )}
        </div>
        <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
        <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
        <p className="text-[10px] text-slate-400 mt-1 font-light">{item.description}</p>
      </Card>
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Reports</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">Generate detailed financial reports and insights.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('table')}
            >
              <Table size={14} className="mr-1" />
              Table
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <BarChart2 size={14} className="mr-1" />
              Charts
            </Button>
          </div>
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
              <MoreHorizontal size={12} />
            </Button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 hidden group-hover:block z-50">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50">
                <span className="text-rose-500">PDF</span> Export as PDF
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50">
                <span className="text-emerald-500">CSV</span> Export as CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>

      {/* Report Settings Panel */}
      <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Report Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-light">Customize your report parameters and display options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto">
          {/* Report Type */}
          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Report Type
            </label>
            <select 
              value={reportSettings.reportType}
              onChange={(e) => {
                console.log('Report type changed to:', e.target.value);
                setReportSettings((prev: ReportSettings) => ({ ...prev, reportType: e.target.value as any }));
              }}
              className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="spending">Spending by Category</option>
              <option value="income-expense">Income vs Expense</option>
              <option value="savings">Savings Analysis</option>
              <option value="trends">Spending Trends</option>
              <option value="goals">Goals Progress</option>
              <option value="predictions">Future Predictions</option>
            </select>
          </div>

          {/* Timeframe */}
          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Timeframe
            </label>
            <select 
              value={reportSettings.timeframe}
              onChange={(e) => {
                console.log('Timeframe changed to:', e.target.value);
                setReportSettings((prev: ReportSettings) => ({ ...prev, timeframe: e.target.value as any }));
              }}
              className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>

          {/* Chart Type */}
          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Chart Type
            </label>
            <select 
              value={reportSettings.chartType}
              onChange={(e) => {
                console.log('Chart type changed to:', e.target.value);
                setReportSettings((prev: ReportSettings) => ({ ...prev, chartType: e.target.value as any }));
              }}
              className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="pie">Pie Chart</option>
              <option value="donut">Donut Chart</option>
              <option value="column">Bar Chart</option>
              <option value="bar">Bar Chart (Alternative)</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Anomaly Alerts Section - Redesigned with AI Intelligence Style */}
      <Card className="p-6 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Anomaly Detection</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">AI-powered transaction monitoring</p>
          </div>
          <Badge variant="warning" className="text-[10px] px-2.5 py-1">
            {ANOMALY_ALERTS.filter(a => a.status === 'active').length} Active Alerts
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ANOMALY_ALERTS.map((anomaly) => (
            <div
              key={anomaly.id} 
              className={`bg-white rounded-xl border-l-4 ${
                anomaly.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'
              } shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`text-[10px] font-bold ${
                  anomaly.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                } uppercase tracking-wider`}>
                  {anomaly.severity === 'medium' ? 'Medium' : 'Low'} Severity
                </div>
                <div className={`${
                  anomaly.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {anomaly.type === 'unusual-spending' ? <TrendingUp size={16} /> : <RefreshCw size={16} />}
                </div>
              </div>
              
              <h4 className="text-sm font-bold text-slate-800 mb-1">{anomaly.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                {anomaly.description}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{anomaly.category}</span>
                  {anomaly.amount && (
                    <span className="text-[10px] font-medium text-slate-700">
                      ₱{typeof anomaly.amount === 'number' ? anomaly.amount.toFixed(2) : anomaly.amount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className={`${
                      anomaly.severity === 'medium' ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Dismiss
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className={`${
                      anomaly.severity === 'medium' ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'
                    }`}
                    onClick={() => handleAnomalyDetails(anomaly.id)}
                  >
                    Details <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Financial Insights Section - Redesigned with Financial Summary Style */}
      <Card className="p-6 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Financial Insights</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Smart recommendations powered by machine learning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AI_INSIGHTS.map((insight, idx) => (
            <Card key={insight.id} className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-slate-500 p-2 rounded-lg">
                  {insight.type === 'savings-opportunity' ? <Wallet size={20} strokeWidth={1.5} /> :
                   insight.type === 'budget-recommendation' ? <BarChart3 size={20} strokeWidth={1.5} /> :
                   <LineChart size={20} strokeWidth={1.5} />}
                </div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{insight.title}</span>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                {insight.description}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
                  <span className="text-slate-400">Recommendation:</span>
                  <span>{insight.recommendation}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span className="font-semibold uppercase tracking-wider">Timeframe:</span>
                  <span className="text-slate-600">{insight.timeHorizon}</span>
                </div>
                {insight.potentialSavings && (
                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="font-semibold uppercase tracking-wider">Potential Savings:</span>
                    <span className="text-emerald-600 font-bold">₱{insight.potentialSavings}/mo</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Charts Section */}
      {viewMode === "grid" && (
        <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {reportSettings.reportType === 'spending' ? 'Spending by Category' :
                 reportSettings.reportType === 'income-expense' ? 'Income vs Expenses' :
                 reportSettings.reportType === 'savings' ? 'Savings Analysis' :
                 reportSettings.reportType === 'trends' ? 'Spending Trends' :
                 reportSettings.reportType === 'goals' ? 'Goals Progress' :
                 'Future Predictions'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">
                {reportSettings.reportType === 'spending' ? 'Detailed breakdown for the selected period' :
                 reportSettings.reportType === 'income-expense' ? '6-month comparison.' :
                 reportSettings.reportType === 'savings' ? 'Savings rate and fund progress.' :
                 reportSettings.reportType === 'trends' ? 'Spending pattern analysis.' :
                 reportSettings.reportType === 'goals' ? 'Progress towards financial goals.' :
                 'AI-powered financial forecasts.'}
              </p>
            </div>
          </div>

          {/* Dynamic Chart Content - Bigger Charts */}
          <div className="h-[500px] w-full overflow-hidden">
            {reportSettings.reportType === 'spending' && (
              /* Spending by Category - Dynamic Chart Type */
              <div className="h-full flex flex-col">
                {reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut' ? (
                  /* Donut Chart - No Legend, info in center */
                  <div className="h-full flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full relative" style={{ 
                      background: `conic-gradient(${SPENDING_DATA.categories.map((cat, idx) => {
                        const start = SPENDING_DATA.categories.slice(0, idx).reduce((acc, c) => acc + c.percentage, 0);
                        const end = start + cat.percentage;
                        return `${cat.color} ${start}% ${end}%`;
                      }).join(', ')})` 
                    }}>
                      <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-xs text-slate-500">Total</span>
                        <span className="text-xl font-bold text-slate-900">₱{SPENDING_DATA.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : reportSettings.chartType === 'column' || reportSettings.chartType === 'bar' ? (
                  /* Bar Chart */
                  <>
                    <div className="flex-1 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                      {SPENDING_DATA.categories.map((cat) => (
                        <div key={cat.name} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer">
                          <div
                            className="w-3 sm:w-5 rounded-t-[2px] transition-all hover:opacity-100"
                            style={{ height: `${cat.percentage}%`, backgroundColor: cat.color }}
                            title={`${cat.name}: ₱${cat.amount} (${cat.percentage}%)`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                      {SPENDING_DATA.categories.map((cat) => (
                        <span key={cat.name} className="text-slate-400 flex-1 text-center" title={cat.name}>
                          {cat.name.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    {/* Clear Legend */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-[10px] text-slate-500 mb-2 font-medium">Categories</div>
                      <div className="flex flex-wrap gap-3">
                        {SPENDING_DATA.categories.slice(0, 4).map((cat) => (
                          <div key={cat.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-[10px] text-slate-600">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : reportSettings.chartType === 'line' ? (
                  /* Line Chart */
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                      {SPENDING_DATA.categories.map((cat, idx) => {
                        return (
                          <div key={cat.name} className="h-full flex-1 justify-center relative">
                            <div className="absolute bottom-0 w-full flex items-end justify-center">
                              <div className="w-1 h-8 rounded-full transition-all hover:opacity-100" style={{ backgroundColor: cat.color }} />
                            </div>
                            {/* Connecting line */}
                            {idx < SPENDING_DATA.categories.length - 1 && (
                              <div className="absolute bottom-4 left-1/2 w-full h-0.5" style={{ backgroundColor: cat.color, opacity: 0.3 }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                      {SPENDING_DATA.categories.map((cat) => (
                        <span key={cat.name} className="text-slate-400 flex-1 text-center">
                          {cat.name.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#94a3b8' }} />
                        <span className="text-[10px] font-medium text-slate-500">Spending</span>
                      </span>
                    </div>
                  </div>
                ) : reportSettings.chartType === 'area' ? (
                  /* Area Chart */
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                      {SPENDING_DATA.categories.map((cat, idx) => {
                        return (
                          <div key={cat.name} className="h-full flex-1 justify-center relative">
                            <div className="absolute bottom-0 w-full flex items-end justify-center">
                              <div className="w-full rounded-t transition-all hover:opacity-100" style={{ 
                                height: `${cat.percentage}%`, 
                                backgroundColor: cat.color,
                                opacity: 0.7
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                      {SPENDING_DATA.categories.map((cat) => (
                        <span key={cat.name} className="text-slate-400 flex-1 text-center">
                          {cat.name.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#94a3b8' }} />
                        <span className="text-[10px] font-medium text-slate-500">Spending</span>
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {reportSettings.reportType === 'income-expense' && (
              /* Income vs Expenses - Dynamic Chart Type */
              <div className="h-full flex flex-col">
                {reportSettings.chartType === 'column' || reportSettings.chartType === 'bar' ? (
                  /* Bar Chart */
                  <>
                    <div className="flex-1 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
                      {MONTHLY_DATA.map((d) => {
                        const maxVal = Math.max(...INCOME_EXPENSE_DATA.monthly.map(m => Math.max(m.income, m.expenses))) * 1.2;
                        return (
                          <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center cursor-pointer">
                            <div className="w-4 rounded-t rounded-t-[2px] opacity-90 hover:opacity-100 transition-all" style={{ height: `${(d.income / maxVal) * 100}%`, backgroundColor: '#10b981' }} />
                            <div className="w-4 rounded-t rounded-t-[2px] opacity-90 hover:opacity-100 transition-all" style={{ height: `${(d.expenses / maxVal) * 100}%`, backgroundColor: '#94a3b8' }} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between px-2 mt-2">
                      {MONTHLY_DATA.map((d) => (
                        <span key={d.month} className="text-[10px] text-slate-400 flex-1 text-center">{d.month}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} /> Income</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#94a3b8' }} /> Expenses</span>
                    </div>
                  </>
                ) : reportSettings.chartType === 'line' || reportSettings.chartType === 'area' ? (
                  /* Line/Area Chart */
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-end justify-between gap-3 px-2 border-b border-slate-100 relative">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map((pct) => (
                        <div 
                          key={pct} 
                          className="absolute w-full border-t border-slate-100" 
                          style={{ bottom: `${pct}%` }} 
                        />
                      ))}
                      {INCOME_EXPENSE_DATA.monthly.map((d, idx) => {
                        const maxVal = Math.max(...INCOME_EXPENSE_DATA.monthly.map(m => Math.max(m.income, m.expenses))) * 1.1;
                        const incomeHeight = (d.income / maxVal) * 100;
                        const expenseHeight = (d.expenses / maxVal) * 100;
                        const next = INCOME_EXPENSE_DATA.monthly[idx + 1];
                        const nextIncomeHeight = next ? (next.income / maxVal) * 100 : null;
                        const nextExpenseHeight = next ? (next.expenses / maxVal) * 100 : null;
                        return (
                          <div key={d.month} className="h-full flex-1 flex flex-col justify-end relative">
                            {/* Area fill for area chart */}
                            {reportSettings.chartType === 'area' && (
                              <>
                                <div 
                                  className="absolute w-full bg-emerald-100" 
                                  style={{ 
                                    bottom: '0%',
                                    height: `${incomeHeight}%`,
                                    opacity: 0.3
                                  }} 
                                />
                                <div 
                                  className="absolute w-full bg-slate-200" 
                                  style={{ 
                                    bottom: '0%',
                                    height: `${expenseHeight}%`,
                                    opacity: 0.3
                                  }} 
                                />
                              </>
                            )}
                            {/* Income point */}
                            <div className="absolute w-full flex justify-center" style={{ bottom: `${incomeHeight}%` }}>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                            </div>
                            {/* Expense point */}
                            <div className="absolute w-full flex justify-center" style={{ bottom: `${expenseHeight}%` }}>
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white shadow-sm" />
                            </div>
                            {/* Connecting lines */}
                            {next && nextIncomeHeight !== null && nextExpenseHeight !== null && (
                              <>
                                <div 
                                  className="absolute h-0.5 bg-emerald-400" 
                                  style={{ 
                                    bottom: `${incomeHeight}%`,
                                    left: '50%',
                                    width: '100%',
                                    transform: `rotate(${Math.atan2(nextIncomeHeight - incomeHeight, 100) * 180 / Math.PI}deg)`,
                                    transformOrigin: 'left center'
                                  }} 
                                />
                                <div 
                                  className="absolute h-0.5 bg-slate-300" 
                                  style={{ 
                                    bottom: `${expenseHeight}%`,
                                    left: '50%',
                                    width: '100%',
                                    transform: `rotate(${Math.atan2(nextExpenseHeight - expenseHeight, 100) * 180 / Math.PI}deg)`,
                                    transformOrigin: 'left center'
                                  }} 
                                />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between px-2 mt-2">
                      {INCOME_EXPENSE_DATA.monthly.map((d) => (
                        <span key={d.month} className="text-[10px] text-slate-400 flex-1 text-center">{d.month}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} /> Income</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#94a3b8' }} /> Expenses</span>
                    </div>
                  </div>
                ) : (
                  /* Pie Chart - Simple, no extra legend */
                  <div className="h-full flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full relative" style={{ 
                      background: `conic-gradient(#10b981 0% 60%, #94a3b8 60% 100%)` 
                    }}>
                      <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-xs text-slate-500">Net Savings</span>
                        <span className="text-xl font-bold text-slate-900">₱{INCOME_EXPENSE_DATA.totals.netSavings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {reportSettings.reportType === 'savings' && (
              /* Savings Analysis - Dynamic Chart Type */
              <div className="h-full flex flex-col">
                {reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut' ? (
                  /* Donut Chart for Savings - No legend */
                  <div className="h-full flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full relative" style={{ 
                      background: `conic-gradient(#10b981 0% 50%, #3b82f6 30% 80%, #f59e0b 80% 100%)` 
                    }}>
                      <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-xs text-slate-500">Total Savings</span>
                        <span className="text-xl font-bold text-slate-900">₱{SAVINGS_DATA.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : reportSettings.chartType === 'column' || reportSettings.chartType === 'bar' ? (
                  /* Bar Chart for Savings - No legend */
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex items-end justify-between gap-4 sm:gap-8 px-4 border-b border-slate-50">
                      {SAVINGS_DATA.funds.map((item) => {
                        return (
                          <div key={item.name} className="flex flex-col items-center flex-1 justify-end h-full group cursor-pointer">
                            <div className="text-xs text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              ₱{item.amount.toLocaleString()}
                            </div>
                            <div
                              className="w-12 sm:w-16 rounded-t transition-all hover:opacity-80"
                              style={{ height: `${item.percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-medium text-slate-500 px-4">
                      {SAVINGS_DATA.funds.map((f) => (
                        <span key={f.name} className="flex-1 text-center truncate" title={f.name}>
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Line/Area Chart for Savings */
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-end justify-between gap-3 px-2 border-b border-slate-100 relative">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map((pct) => (
                        <div 
                          key={pct} 
                          className="absolute w-full border-t border-slate-100" 
                          style={{ bottom: `${pct}%` }} 
                        />
                      ))}
                      {SAVINGS_DATA.history.map((d, idx) => {
                        const maxVal = Math.max(...SAVINGS_DATA.history.map(h => h.savings)) * 1.2;
                        const height = (d.savings / maxVal) * 100;
                        const next = SAVINGS_DATA.history[idx + 1];
                        const nextHeight = next ? (next.savings / maxVal) * 100 : null;
                        return (
                          <div key={d.month} className="h-full flex-1 flex flex-col justify-end relative">
                            {/* Area fill for area chart */}
                            {reportSettings.chartType === 'area' && (
                              <div 
                                className="absolute w-full bg-emerald-100" 
                                style={{ 
                                  bottom: '0%',
                                  height: `${height}%`,
                                  opacity: 0.4
                                }} 
                              />
                            )}
                            {/* Data point */}
                            <div className="absolute w-full flex justify-center" style={{ bottom: `${height}%` }}>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                            </div>
                            {/* Value label */}
                            <div className="absolute w-full flex justify-center" style={{ bottom: `${height + 5}%` }}>
                              <span className="text-[9px] text-emerald-600 font-medium">₱{(d.savings / 1000).toFixed(1)}k</span>
                            </div>
                            {/* Connecting line */}
                            {next && nextHeight !== null && (
                              <div 
                                className="absolute h-0.5 bg-emerald-400" 
                                style={{ 
                                  bottom: `${height}%`,
                                  left: '50%',
                                  width: '100%',
                                  transform: `rotate(${Math.atan2(nextHeight - height, 100) * 180 / Math.PI}deg)`,
                                  transformOrigin: 'left center'
                                }} 
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between px-2 mt-2">
                      {SAVINGS_DATA.history.map((d) => (
                        <span key={d.month} className="text-[10px] text-slate-400 flex-1 text-center">{d.month}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Monthly Savings
                      </span>
                    </div>
                    {/* Summary stats */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">{SAVINGS_DATA.rate}%</div>
                        <div className="text-[10px] text-slate-500">Savings Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-700">₱{(SAVINGS_DATA.total / 1000).toFixed(1)}k</div>
                        <div className="text-[10px] text-slate-500">Total Saved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">₱{(SAVINGS_DATA.funds[0].amount / 1000).toFixed(1)}k</div>
                        <div className="text-[10px] text-slate-500">Emergency Fund</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {reportSettings.chartType === 'column' || reportSettings.chartType === 'bar' ? (
                  <>
                    <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                      {SAVINGS_DATA.funds.map((f) => (
                        <span key={f.name} className="text-slate-400 flex-1 text-center">
                          {f.name.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                        <span className="text-[10px] font-medium text-slate-500">Savings</span>
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {reportSettings.reportType === 'trends' && (
              /* Spending Trends - Line Chart */
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-end justify-between gap-3 px-2 border-b border-slate-100 relative">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <div 
                      key={pct} 
                      className="absolute w-full border-t border-slate-100" 
                      style={{ bottom: `${pct}%` }} 
                    />
                  ))}
                  {/* Data points and lines */}
                  {TRENDS_DATA.monthlyComparison.map((d, idx) => {
                    const maxVal = Math.max(...TRENDS_DATA.monthlyComparison.map(m => Math.max(m.current, m.previous))) * 1.1;
                    const currentHeight = (d.current / maxVal) * 100;
                    const previousHeight = (d.previous / maxVal) * 100;
                    return (
                      <div key={d.month} className="h-full flex-1 flex flex-col justify-end relative">
                        {/* Previous period line point */}
                        <div className="absolute w-full flex justify-center" style={{ bottom: `${previousHeight}%` }}>
                          <div className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        {/* Current period line point */}
                        <div className="absolute w-full flex justify-center" style={{ bottom: `${currentHeight}%` }}>
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        {/* Connecting lines */}
                        {idx < TRENDS_DATA.monthlyComparison.length - 1 && (
                          <>
                            <div className="absolute left-1/2 w-full h-0.5 bg-slate-300" style={{ 
                              bottom: `${previousHeight}%`,
                              transform: 'translateY(-50%)'
                            }} />
                            <div className="absolute left-1/2 w-full h-0.5 bg-emerald-400" style={{ 
                              bottom: `${currentHeight}%`,
                              transform: 'translateY(-50%)'
                            }} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between px-2 mt-2">
                  {TRENDS_DATA.monthlyComparison.map((d) => (
                    <span key={d.month} className="text-[10px] text-slate-400 flex-1 text-center">{d.month}</span>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Current Period
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Previous Period
                  </span>
                </div>
                {/* Category trend indicators */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">Category Changes</div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDS_DATA.categories.map((cat) => (
                      <span 
                        key={cat.name} 
                        className={`text-[10px] px-2 py-1 rounded-full ${cat.trend === 'up' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {cat.name} {cat.trend === 'up' ? '↑' : '↓'} {Math.abs(cat.change)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportSettings.reportType === 'goals' && (
              /* Goals Progress - Clean, no legend */
              <div className="h-full flex flex-col justify-center">
                <div className="text-center w-full">
                  <div className="text-lg font-semibold text-slate-800 mb-6">Goals Progress</div>
                  <div className="space-y-4 max-w-md mx-auto">
                    {GOALS_DATA.goals.map((goal) => (
                      <div key={goal.name} className="text-left">
                        <div className="text-sm text-slate-600 flex justify-between mb-1">
                          <span className="font-medium">{goal.name}</span>
                          <span className="text-slate-500">{goal.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all" 
                            style={{ width: `${goal.percentage}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          ₱{goal.current.toLocaleString()} of ₱{goal.target.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportSettings.reportType === 'predictions' && (
              /* Future Predictions */
              <div className="h-full flex flex-col">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">Predicted Expenses</div>
                    <div className="text-xl font-bold text-slate-800">₱{PREDICTIONS_DATA.nextMonth.expenses.toLocaleString()}</div>
                    <div className="text-[10px] text-amber-600 mt-1">+5% from avg</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">Expected Savings</div>
                    <div className="text-xl font-bold text-emerald-600">₱{PREDICTIONS_DATA.nextMonth.savings.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-600 mt-1">On track</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">AI Confidence</div>
                    <div className="text-xl font-bold text-blue-600">{PREDICTIONS_DATA.nextMonth.confidence}%</div>
                    <div className="text-[10px] text-blue-600 mt-1">High accuracy</div>
                  </div>
                </div>
                
                {/* Confidence indicator */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Prediction Confidence</span>
                    <span>{PREDICTIONS_DATA.nextMonth.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all" 
                      style={{ width: `${PREDICTIONS_DATA.nextMonth.confidence}%` }}
                    />
                  </div>
                </div>
                
                {/* AI Insights */}
                <div className="flex-1 bg-slate-50 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-700 mb-3">AI-Generated Insights</div>
                  <div className="space-y-3">
                    {PREDICTIONS_DATA.insights.map((insight, idx) => (
                      <div key={insight.label} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          insight.trend === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
                          insight.trend === 'negative' ? 'bg-red-100 text-red-600' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs text-slate-600">{insight.label}</div>
                          <div className={`text-sm font-medium ${
                            insight.trend === 'positive' ? 'text-emerald-600' : 
                            insight.trend === 'negative' ? 'text-red-600' : 
                            'text-slate-700'
                          }`}>{insight.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 3-month forecast summary */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">3-Month Forecast</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Projected Savings:</span>
                    <span className="font-medium text-emerald-600">₱{PREDICTIONS_DATA.threeMonth.savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">Forecast Confidence:</span>
                    <span className="font-medium text-slate-700">{PREDICTIONS_DATA.threeMonth.confidence}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Detailed Report Data</h3>
                <p className="text-xs text-slate-500 mt-1">Spending by category for the selected period</p>
              </div>
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Download size={14} />
                  <span className="hidden sm:inline">Export</span>
                  <MoreHorizontal size={12} />
                </Button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 hidden group-hover:block z-50">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50">
                    <span className="text-rose-500">PDF</span> Export as PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50">
                    <span className="text-emerald-500">CSV</span> Export as CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  <th className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">
                    <div className="flex items-center gap-1">
                      Category <MoreHorizontal size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right cursor-pointer hover:text-slate-700 transition-colors">
                    <div className="flex items-center gap-1 justify-end">
                      Amount <MoreHorizontal size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right cursor-pointer hover:text-slate-700 transition-colors">
                    <div className="flex items-center gap-1 justify-end">
                      Percentage <MoreHorizontal size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right cursor-pointer hover:text-slate-700 transition-colors">
                    <div className="flex items-center gap-1 justify-end">
                      Transactions <MoreHorizontal size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-50">
                {SPENDING_DATA.categories.map((cat, idx) => (
                  <tr key={cat.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium">{cat.name}</td>
                    <td className="px-6 py-3 text-right">₱{cat.amount}</td>
                    <td className="px-6 py-3 text-right">{cat.percentage}%</td>
                    <td className="px-6 py-3 text-right">{Math.floor(Math.random() * 50) + 5}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        idx % 3 === 0 ? 'text-emerald-600' : idx % 3 === 1 ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {idx % 3 === 0 ? <ArrowUp size={10} /> : idx % 3 === 1 ? <ArrowDown size={10} /> : null}
                        {idx % 3 === 0 ? '+' : idx % 3 === 1 ? '-' : ''}{Math.floor(Math.random() * 20)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}


      <AnomalyDetailsModal
        open={showAnomalyModal}
        onClose={() => setShowAnomalyModal(false)}
        anomaly={selectedAnomaly}
        onDismissAnomaly={handleDismissAnomaly}
        onResolveAnomaly={handleResolveAnomaly}
      />
    </div>
  );
}
