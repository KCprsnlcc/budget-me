"use client";

import { useState, useCallback, memo, useEffect } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  PieChart,
  ArrowUp,
  ArrowRight,
  BarChart2,
  Table,
  Wallet,
  RefreshCw,
  Flag,
  LineChart,
  MoreHorizontal,
  Wand2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnomalyDetailsModal } from "./_components";
import type { AnomalyAlert, AIInsight, ReportSettings, AnomalyDetails } from "./_components/types";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from "@/components/auth/auth-context";
import { toast } from "sonner";
import {
  fetchReportSummary,
  fetchAnomalyAlerts,
  fetchReportChartData,
  computeAnomalyDetails,
} from "./_lib/reports-service";
import {
  generateReportAIInsights,
  fetchCachedReportInsights,
  type ReportAIInsightResponse,
} from "./_lib/report-insights-service";
import { checkAIUsage, incrementAIUsage, type AIUsageStatus } from "../_lib/ai-rate-limit-service";

export default function ReportsPage() {
  const { user } = useAuth();
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
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // Real data states
  const [summaryData, setSummaryData] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<ReportAIInsightResponse | null>(null);
  const [hasGeneratedInsights, setHasGeneratedInsights] = useState(false);
  
  // AI Rate Limit State
  const [rateLimitStatus, setRateLimitStatus] = useState<AIUsageStatus | null>(null);

  // Fetch AI rate limit status
  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { status } = await checkAIUsage(user.id, "insights");
        setRateLimitStatus(status);
      } catch (error) {
        console.error("Error fetching rate limit status:", error);
      }
    };

    fetchRateLimitStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch all report data
  const fetchReportData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch summary, anomalies, chart data, and cached insights in parallel
      const [summary, anomalyData, chart, cachedInsights] = await Promise.all([
        fetchReportSummary(user.id, reportSettings.timeframe),
        fetchAnomalyAlerts(user.id, reportSettings.timeframe),
        fetchReportChartData(user.id, reportSettings.reportType, reportSettings.timeframe),
        fetchCachedReportInsights(user.id, reportSettings.reportType, reportSettings.timeframe),
      ]);

      setSummaryData(summary);
      setAnomalies(anomalyData);
      setChartData(chart);

      // Auto-load cached insights if available
      if (cachedInsights) {
        setAiInsights(cachedInsights);
        setHasGeneratedInsights(true);
      } else {
        // Reset insights state if no cached data
        setAiInsights(null);
        setHasGeneratedInsights(false);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, reportSettings.timeframe, reportSettings.reportType]);

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle Generate AI Insights
  const handleGenerateAIInsights = useCallback(async () => {
    if (!user?.id || !summaryData || !chartData) return;

    // Check rate limit before generating
    const { allowed, error: limitError } = await checkAIUsage(user.id, "insights");
    if (!allowed) {
      toast.error("Daily limit reached", {
        description: limitError || "You've reached your daily limit for AI Insights. Try again tomorrow.",
      });
      return;
    }

    setIsGeneratingInsights(true);
    
    const loadingToast = toast.loading("Generating AI insights...", {
      description: "Analyzing your financial report data",
    });

    try {
      // Increment usage
      const { success: incrementSuccess } = await incrementAIUsage(user.id, "insights");
      if (!incrementSuccess) {
        toast.error("Failed to track usage", {
          description: "Please try again",
        });
        setIsGeneratingInsights(false);
        return;
      }

      // Refresh rate limit status
      const { status } = await checkAIUsage(user.id, "insights");
      setRateLimitStatus(status);

      // Generate insights
      const insights = await generateReportAIInsights({
        userId: user.id,
        reportType: reportSettings.reportType,
        timeframe: reportSettings.timeframe,
        reportData: {
          summary: summaryData,
          anomalies,
          chartData,
        },
      });

      setAiInsights(insights);
      setHasGeneratedInsights(true);
      
      toast.success("AI insights generated successfully", {
        id: loadingToast,
        description: "Your financial report analysis is ready",
      });
    } catch (error) {
      console.error("Error generating AI insights:", error);
      toast.error("Failed to generate AI insights", {
        id: loadingToast,
        description: "Please try again later",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [user?.id, summaryData, chartData, anomalies, reportSettings]);

  // Handle anomaly details
  const handleAnomalyDetails = useCallback(async (anomalyId: string) => {
    if (!user?.id) return;

    try {
      const anomaly = anomalies.find(a => a.id === anomalyId);
      if (!anomaly) return;

      const details = await computeAnomalyDetails(anomalyId, user.id);
      
      setSelectedAnomaly({
        anomaly,
        ...details,
      });
      setShowAnomalyModal(true);
    } catch (error) {
      console.error("Error fetching anomaly details:", error);
      toast.error("Failed to load anomaly details");
    }
  }, [user?.id, anomalies]);

  const handleDismissAnomaly = useCallback((anomalyId: string) => {
    console.log("Dismissing anomaly:", anomalyId);
    setShowAnomalyModal(false);
  }, []);

  const handleResolveAnomaly = useCallback((anomalyId: string) => {
    console.log("Resolving anomaly:", anomalyId);
    setShowAnomalyModal(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
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

          <Card className="p-6">
            <Skeleton width={150} height={16} className="mb-6" />
            <Skeleton height={400} borderRadius={8} />
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  // Memoized summary card component
  const SummaryCard = memo(({ label, value, description, icon: Icon, change, badge }: any) => {
    return (
      <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg text-slate-600">
            <Icon size={22} strokeWidth={1.5} />
          </div>
          {change && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 border-emerald-100 px-2 py-1 rounded-full border">
              <ArrowUp size={12} />
              {change}
            </div>
          )}
          {badge && (
            <Badge variant="warning" className="text-[9px] px-2 py-1">
              {badge}
            </Badge>
          )}
        </div>
        <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{label}</div>
        <div className="text-xl font-semibold text-slate-900 tracking-tight">{value}</div>
        <p className="text-[10px] text-slate-400 mt-1 font-light">{description}</p>
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
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Transactions"
            value={summaryData.totalTransactions.toLocaleString()}
            description="In selected timeframe"
            icon={BarChart2}
          />
          <SummaryCard
            label="Active Budgets"
            value={summaryData.activeBudgets}
            description={`${summaryData.budgetsOnTrack} on track, ${summaryData.budgetsWarning} warning`}
            icon={PieChart}
          />
          <SummaryCard
            label="Active Goals"
            value={summaryData.activeGoals}
            description="Total active goals"
            icon={Flag}
            badge={summaryData.goalsNearing > 0 ? `${summaryData.goalsNearing} Nearing` : undefined}
          />
          <SummaryCard
            label="Last Updated"
            value={summaryData.lastUpdated}
            description="Most recent transaction"
            icon={RefreshCw}
          />
        </div>
      )}

      {/* Report Settings Panel */}
      <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Report Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-light">Customize your report parameters and display options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto">
          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Report Type
            </label>
            <select 
              value={reportSettings.reportType}
              onChange={(e) => {
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

          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Timeframe
            </label>
            <select 
              value={reportSettings.timeframe}
              onChange={(e) => {
                setReportSettings((prev: ReportSettings) => ({ ...prev, timeframe: e.target.value as any }));
              }}
              className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>

          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              Chart Type
            </label>
            <select 
              value={reportSettings.chartType}
              onChange={(e) => {
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

      {/* Anomaly Alerts Section */}
      <Card className="p-6 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Anomaly Detection</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">AI-powered transaction monitoring</p>
          </div>
          {anomalies.length > 0 && (
            <Badge variant="warning" className="text-[10px] px-2.5 py-1">
              {anomalies.filter(a => a.status === 'active').length} Active Alerts
            </Badge>
          )}
        </div>

        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
              <AlertTriangle size={24} className="sm:w-8 sm:h-8 text-slate-300" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Anomalies Detected</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
              Your spending patterns look normal. Anomalies will appear here when unusual activity is detected.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.slice(0, 4).map((anomaly) => (
              <div
                key={anomaly.id} 
                className={`bg-white rounded-xl border-l-4 ${
                  anomaly.severity === 'high' ? 'border-l-red-500' :
                  anomaly.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'
                } shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={`text-[10px] font-bold ${
                    anomaly.severity === 'high' ? 'text-red-600' :
                    anomaly.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                  } uppercase tracking-wider`}>
                    {anomaly.severity} Severity
                  </div>
                  <div className={`${
                    anomaly.severity === 'high' ? 'text-red-600' :
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
                        anomaly.severity === 'high' ? 'text-red-600 hover:text-red-700' :
                        anomaly.severity === 'medium' ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'
                      }`}
                      onClick={() => handleDismissAnomaly(anomaly.id)}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className={`${
                        anomaly.severity === 'high' ? 'text-red-600 hover:text-red-700' :
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
        )}
      </Card>

      {/* AI Financial Insights Section */}
      <Card className="p-6 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Financial Insights</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Smart recommendations powered by machine learning</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleGenerateAIInsights} 
              className="text-xs h-8 sm:h-9 px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGeneratingInsights || !rateLimitStatus?.canUseAI}
              title={!rateLimitStatus?.canUseAI ? "Daily limit reached" : ""}
            >
              {isGeneratingInsights ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} className="mr-1.5" />
                  <span>{hasGeneratedInsights ? "Regenerate Insights" : "Generate Report Insights"}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {!hasGeneratedInsights || !aiInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Savings Opportunity Card - No Data */}
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <Wallet size={20} className="text-slate-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Savings Opportunities</span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Wallet size={32} className="text-slate-300 mb-3" />
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No savings insights available</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Generate to see opportunities</p>
                </div>
              </div>
            </div>

            {/* Budget Recommendation Card - No Data */}
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <BarChart3 size={20} className="text-slate-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Budget Recommendations</span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BarChart3 size={32} className="text-slate-300 mb-3" />
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No budget insights available</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Generate AI insights to see analysis</p>
                </div>
              </div>
            </div>

            {/* Trend Analysis Card - No Data */}
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <LineChart size={20} className="text-slate-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Trend Analysis</span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <LineChart size={32} className="text-slate-300 mb-3" />
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No trend analysis available</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Generate AI insights to see patterns</p>
                </div>
              </div>
            </div>
          </div>
        ) : aiInsights ? (
          <div className="space-y-6">
            {/* Risk Assessment Summary */}
            {aiInsights.riskLevel && (
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                        <AlertTriangle className={`w-5 h-5 ${
                          aiInsights.riskLevel === 'high' ? 'text-red-600' :
                          aiInsights.riskLevel === 'medium' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">Financial Health Assessment</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{aiInsights.summary}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 shrink-0 font-semibold ${
                      aiInsights.riskLevel === 'high' ? 'text-red-600' :
                      aiInsights.riskLevel === 'medium' ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {aiInsights.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  {aiInsights.riskAnalysis && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {aiInsights.riskAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Recommended Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.recommendations.slice(0, 4).map((rec, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              rec.priority === 'high' ? 'bg-red-500' :
                              rec.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <h5 className="text-xs font-semibold text-slate-900 truncate">
                              {rec.title}
                            </h5>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 shrink-0 font-semibold ${
                            rec.priority === 'high' ? 'text-red-600' :
                            rec.priority === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {rec.description}
                        </p>
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-400 font-medium">Category:</span>
                            <span className="text-slate-700 capitalize">{rec.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-400 font-medium">Timeframe:</span>
                            <span className="text-slate-700">{rec.timeHorizon}</span>
                          </div>
                          {rec.potentialSavings && (
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-slate-400 font-medium">Potential Savings:</span>
                              <span className="text-emerald-600 font-semibold">₱{rec.potentialSavings.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Steps */}
            {aiInsights.actionableSteps && aiInsights.actionableSteps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Next Steps</h4>
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm divide-y divide-slate-100">
                  {aiInsights.actionableSteps.map((step, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed flex-1 pt-0.5">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
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
                 reportSettings.reportType === 'goals' ? 'Goals Progress' : 'Financial Overview'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">
                {reportSettings.timeframe === 'month' ? 'Last 30 days' :
                 reportSettings.timeframe === 'quarter' ? 'Last 3 months' : 'Last 12 months'}
              </p>
            </div>
          </div>

          {/* No Data State for Charts */}
          {!chartData ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                <BarChart3 size={24} className="sm:w-8 sm:h-8 text-slate-300" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Chart Data Available</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                Add transactions to see your financial data visualized in charts.
              </p>
            </div>
          ) : (
            <>
              {/* Spending by Category Chart */}
              {reportSettings.reportType === 'spending' && (
                <>
                  {!chartData.categories || chartData.categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                        <PieChart size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Spending Data</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                        Add transactions to see spending breakdown by category.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <p className="text-2xl font-bold text-slate-900">
                          ₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500">Total Spending</p>
                      </div>

                      {/* Render based on chart type */}
                      {(reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut') && (
                        <div className="flex flex-col items-center gap-4">
                          {/* Circular representation */}
                          <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                              {chartData.categories.reduce((acc: any, cat: any, idx: number) => {
                                const prevPercentage = acc.total;
                                const circumference = 2 * Math.PI * (reportSettings.chartType === 'donut' ? 35 : 40);
                                const offset = circumference - (cat.percentage / 100) * circumference;
                                const rotation = (prevPercentage / 100) * 360;
                                
                                acc.elements.push(
                                  <circle
                                    key={idx}
                                    cx="50"
                                    cy="50"
                                    r={reportSettings.chartType === 'donut' ? 35 : 40}
                                    fill="none"
                                    stroke={cat.color}
                                    strokeWidth={reportSettings.chartType === 'donut' ? 12 : 40}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    className="transition-all"
                                    style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%' }}
                                  />
                                );
                                acc.total += cat.percentage;
                                return acc;
                              }, { elements: [], total: 0 }).elements}
                            </svg>
                            {reportSettings.chartType === 'donut' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <p className="text-sm font-bold text-slate-900">100%</p>
                                  <p className="text-xs text-slate-500">Total</p>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Legend */}
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {chartData.categories.map((cat: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs text-slate-700 truncate">{cat.name}</span>
                                <span className="text-xs text-slate-500 ml-auto">{cat.percentage.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(reportSettings.chartType === 'column' || reportSettings.chartType === 'bar') && (
                        <div className="space-y-4">
                          {reportSettings.chartType === 'column' ? (
                            /* Vertical bars */
                            <div className="flex items-end justify-between gap-2 h-64 border-b border-l border-slate-200 pl-2 pb-2">
                              {chartData.categories.map((cat: any, idx: number) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                  <div className="relative w-full flex flex-col justify-end items-center h-full group">
                                    <div 
                                      className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                                      style={{ 
                                        height: `${cat.percentage}%`,
                                        backgroundColor: cat.color 
                                      }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                      ₱{cat.amount.toLocaleString()}
                                    </div>
                                  </div>
                                  <span className="text-xs text-slate-600 text-center truncate w-full">{cat.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Horizontal bars */
                            <div className="space-y-3">
                              {chartData.categories.map((cat: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-medium text-slate-700">{cat.name}</span>
                                    <span className="text-slate-500">
                                      ₱{cat.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} ({cat.percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-3">
                                    <div 
                                      className="h-3 rounded-full transition-all hover:opacity-80 cursor-pointer"
                                      style={{ 
                                        width: `${cat.percentage}%`,
                                        backgroundColor: cat.color 
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                        <div className="space-y-4">
                          <div className="relative h-64 border-b border-l border-slate-200 pl-2 pb-2">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                              {/* Grid lines */}
                              {[0, 25, 50, 75, 100].map((y) => (
                                <line
                                  key={y}
                                  x1="0"
                                  y1={`${100 - y}%`}
                                  x2="100%"
                                  y2={`${100 - y}%`}
                                  stroke="#e2e8f0"
                                  strokeWidth="1"
                                />
                              ))}
                              
                              {/* Line/Area path */}
                              <path
                                d={chartData.categories.map((cat: any, idx: number) => {
                                  const x = (idx / (chartData.categories.length - 1)) * 100;
                                  const y = 100 - cat.percentage;
                                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                              />
                              
                              {reportSettings.chartType === 'area' && (
                                <path
                                  d={`${chartData.categories.map((cat: any, idx: number) => {
                                    const x = (idx / (chartData.categories.length - 1)) * 100;
                                    const y = 100 - cat.percentage;
                                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                  }).join(' ')} L 100 100 L 0 100 Z`}
                                  fill="#10b981"
                                  fillOpacity="0.2"
                                />
                              )}
                              
                              {/* Data points */}
                              {chartData.categories.map((cat: any, idx: number) => {
                                const x = (idx / (chartData.categories.length - 1)) * 100;
                                const y = 100 - cat.percentage;
                                return (
                                  <g key={idx}>
                                    <circle
                                      cx={`${x}%`}
                                      cy={`${y}%`}
                                      r="4"
                                      fill={cat.color}
                                      className="cursor-pointer hover:r-6 transition-all"
                                    />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                          {/* X-axis labels */}
                          <div className="flex justify-between px-2">
                            {chartData.categories.map((cat: any, idx: number) => (
                              <span key={idx} className="text-xs text-slate-600 text-center truncate" style={{ maxWidth: `${100 / chartData.categories.length}%` }}>
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

          {/* Income vs Expense Chart */}
          {reportSettings.reportType === 'income-expense' && (
            <>
              {!chartData.monthly || chartData.monthly.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                    <BarChart2 size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Income/Expense Data</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                    Add income and expense transactions to see monthly comparisons.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">
                        ₱{chartData.totals?.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">Total Income</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        ₱{chartData.totals?.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">Total Expenses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        ₱{chartData.totals?.netSavings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">Net Savings</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {chartData.monthly.map((month: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{month.month}</span>
                          <span className="text-slate-500">
                            Income: ₱{month.income.toLocaleString()} | Expenses: ₱{month.expenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <div 
                            className="h-8 bg-emerald-500 rounded transition-all"
                            style={{ width: `${(month.income / (chartData.totals?.income || 1)) * 100}%` }}
                          />
                          <div 
                            className="h-8 bg-red-500 rounded transition-all"
                            style={{ width: `${(month.expenses / (chartData.totals?.income || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Savings Analysis Chart */}
          {reportSettings.reportType === 'savings' && (
            <>
              {!chartData.funds || chartData.funds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                    <Wallet size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Savings Data</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                    Create savings goals to track your progress and analyze savings patterns.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-slate-900">
                      ₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500">Total Savings ({chartData.rate?.toFixed(1)}% rate)</p>
                  </div>
                  <div className="space-y-3">
                    {chartData.funds.map((fund: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{fund.name}</span>
                          <span className="text-slate-500">
                            ₱{fund.amount.toLocaleString()} / ₱{fund.target.toLocaleString()} ({fund.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(100, fund.percentage)}%`,
                              backgroundColor: fund.color 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Goals Progress Chart */}
          {reportSettings.reportType === 'goals' && (
            <>
              {!chartData.goals || chartData.goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                    <Flag size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Goals Data</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                    Create financial goals to track your progress and achievements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{chartData.totalGoals}</p>
                      <p className="text-xs text-slate-500">Total Goals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">{chartData.completedGoals}</p>
                      <p className="text-xs text-slate-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600">{chartData.nearingCompletion}</p>
                      <p className="text-xs text-slate-500">Nearing</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {chartData.goals.map((goal: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{goal.name}</span>
                          <span className="text-slate-500">
                            ₱{goal.current.toLocaleString()} / ₱{goal.target.toLocaleString()} ({goal.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(100, goal.percentage)}%`,
                              backgroundColor: goal.color 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Trends Chart */}
          {reportSettings.reportType === 'trends' && (
            <>
              {!chartData.categories || chartData.categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                    <LineChart size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Trend Data</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                    Add more transactions over time to see spending trends and patterns.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chartData.categories.map((cat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          cat.trend === 'up' ? 'text-red-600' : 
                          cat.trend === 'down' ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {cat.change > 0 ? '+' : ''}{cat.change.toFixed(1)}%
                        </span>
                        {cat.trend === 'up' ? <ArrowUp size={16} className="text-red-600" /> :
                         cat.trend === 'down' ? <ArrowUp size={16} className="text-emerald-600 rotate-180" /> :
                         <ArrowRight size={16} className="text-slate-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
            </>
          )}
        </Card>
      )}

      {/* Anomaly Details Modal */}
      {showAnomalyModal && selectedAnomaly && (
        <AnomalyDetailsModal
          isOpen={showAnomalyModal}
          onClose={() => setShowAnomalyModal(false)}
          anomalyDetails={selectedAnomaly}
          onDismiss={handleDismissAnomaly}
          onResolve={handleResolveAnomaly}
        />
      )}
    </div>
  );
}
