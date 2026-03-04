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
  Calendar,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
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
import {
  generateIncomeExpenseForecast,
  generateCategoryForecast,
} from "../predictions/_lib/prediction-service";
import type { MonthlyForecast, CategoryPrediction } from "../predictions/_lib/types";

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
  
  // Prediction data states
  const [predictionData, setPredictionData] = useState<{
    forecast: { historical: MonthlyForecast[]; predicted: MonthlyForecast[]; summary: any } | null;
    categories: CategoryPrediction[];
  }>({ forecast: null, categories: [] });
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  
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
      
      // Fetch prediction data if predictions report type is selected
      if (reportSettings.reportType === 'predictions') {
        await fetchPredictionData();
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

  // Fetch prediction data from predictions service
  const fetchPredictionData = useCallback(async () => {
    if (!user?.id) return;

    setLoadingPredictions(true);
    try {
      const [forecast, categories] = await Promise.all([
        generateIncomeExpenseForecast(user.id),
        generateCategoryForecast(user.id),
      ]);

      setPredictionData({ forecast, categories });
    } catch (error) {
      console.error("Error fetching prediction data:", error);
      toast.error("Failed to load predictions", {
        description: "Please try again later",
      });
    } finally {
      setLoadingPredictions(false);
    }
  }, [user?.id]);

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

        <div className={`grid grid-cols-1 gap-4 pointer-events-auto ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <BarChart3 size={12} />
              Report Type
            </label>
            <FilterDropdown
              value={reportSettings.reportType}
              onChange={(value) => {
                setReportSettings((prev: ReportSettings) => ({ ...prev, reportType: value as any }));
              }}
              options={[
                { value: "spending", label: "Spending by Category", icon: PieChart },
                { value: "income-expense", label: "Income vs Expense", icon: TrendingUp },
                { value: "savings", label: "Savings Analysis", icon: Wallet },
                { value: "trends", label: "Spending Trends", icon: Activity },
                { value: "goals", label: "Goals Progress", icon: Flag },
                { value: "predictions", label: "Future Predictions", icon: LineChart },
              ]}
              placeholder="Select report type"
              allowEmpty={false}
              hideSearch={true}
            />
          </div>

          <div className="pointer-events-auto">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
              <Calendar size={12} />
              Timeframe
            </label>
            <FilterDropdown
              value={reportSettings.timeframe}
              onChange={(value) => {
                setReportSettings((prev: ReportSettings) => ({ ...prev, timeframe: value as any }));
              }}
              options={[
                { value: "month", label: "Last 30 Days" },
                { value: "quarter", label: "Last 3 Months" },
                { value: "year", label: "Last 12 Months" },
              ]}
              placeholder="Select timeframe"
              allowEmpty={false}
              hideSearch={true}
            />
          </div>

          {viewMode === 'grid' && (
            <div className="pointer-events-auto">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <BarChart2 size={12} />
                Chart Type
              </label>
              <FilterDropdown
                value={reportSettings.chartType}
                onChange={(value) => {
                  setReportSettings((prev: ReportSettings) => ({ ...prev, chartType: value as any }));
                }}
                options={[
                  { value: "pie", label: "Pie Chart", icon: PieChart },
                  { value: "donut", label: "Donut Chart", icon: PieChart },
                  { value: "column", label: "Bar Chart", icon: BarChart2 },
                  { value: "bar", label: "Bar Chart (Alternative)", icon: BarChart2 },
                  { value: "line", label: "Line Chart", icon: LineChart },
                  { value: "area", label: "Area Chart", icon: Activity },
                ]}
                placeholder="Select chart type"
                allowEmpty={false}
                hideSearch={true}
              />
            </div>
          )}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Financial Insights</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Smart recommendations powered by machine learning</p>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Free - doesn't count towards AI usage limit</p>
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
                        <div className="flex flex-col items-center gap-6">
                          {/* Donut Chart with Gradient */}
                          <div className="flex items-center gap-6 mb-6">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                                 style={{ 
                                   background: `conic-gradient(${chartData.categories.map((cat: any, idx: number) => {
                                     const prevPercentage = chartData.categories.slice(0, idx).reduce((sum: number, c: any) => sum + c.percentage, 0);
                                     const currentPercentage = prevPercentage + cat.percentage;
                                     // Use shades of emerald green
                                     const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                     const color = emeraldShades[idx % emeraldShades.length];
                                     return `${color} ${prevPercentage}% ${currentPercentage}%`;
                                   }).join(', ')})`
                                 }}>
                              {reportSettings.chartType === 'donut' && (
                                <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                  <span className="text-xs text-slate-400 font-medium">Total</span>
                                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                                    ₱{(chartData.total / 1000).toFixed(1)}k
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Legend */}
                          <div className="space-y-3 w-full">
                            {chartData.categories.map((cat: any, idx: number) => {
                              const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                              const color = emeraldShades[idx % emeraldShades.length];
                              return (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-slate-600">{cat.name}</span>
                                  </div>
                                  <span className="font-medium text-slate-900">₱{cat.amount.toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(reportSettings.chartType === 'column' || reportSettings.chartType === 'bar') && (
                        <div className="space-y-4">
                          {reportSettings.chartType === 'column' ? (
                            /* Vertical bars with grid lines */
                            <div className="relative h-64">
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                                <div className="w-full h-px bg-slate-100/50" />
                              </div>
                              <div className="relative h-full flex items-end justify-between gap-2 px-2 border-b border-slate-50">
                                {chartData.categories.map((cat: any, idx: number) => {
                                  const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                  const color = emeraldShades[idx % emeraldShades.length];
                                  return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                      <div className="relative w-full flex items-end justify-center h-full">
                                        <div 
                                          className="w-full max-w-[40px] rounded-t-[2px] transition-all hover:opacity-80 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1 cursor-pointer"
                                          style={{ 
                                            height: `${cat.percentage}%`,
                                            backgroundColor: color
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-2 uppercase tracking-wider">
                                {chartData.categories.map((cat: any, idx: number) => (
                                  <span key={idx} className="text-center truncate flex-1">{cat.name.slice(0, 3)}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* Horizontal bars */
                            <div className="space-y-3">
                              {chartData.categories.map((cat: any, idx: number) => {
                                const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                const color = emeraldShades[idx % emeraldShades.length];
                                return (
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
                                          backgroundColor: color 
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                        <div className="space-y-4">
                          <div className="relative h-64">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                              <div className="w-full h-px bg-slate-100/50" />
                              <div className="w-full h-px bg-slate-100/50" />
                              <div className="w-full h-px bg-slate-100/50" />
                              <div className="w-full h-px bg-slate-100/50" />
                              <div className="w-full h-px bg-slate-100/50" />
                            </div>
                            <div className="relative h-full border-b border-slate-50 px-2 pb-2">
                              <svg className="w-full h-full" preserveAspectRatio="none">
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
                                    fillOpacity="0.1"
                                  />
                                )}
                                
                                {/* Data points */}
                                {chartData.categories.map((cat: any, idx: number) => {
                                  const x = (idx / (chartData.categories.length - 1)) * 100;
                                  const y = 100 - cat.percentage;
                                  return (
                                    <circle
                                      key={idx}
                                      cx={`${x}%`}
                                      cy={`${y}%`}
                                      r="4"
                                      fill="#10b981"
                                      className="cursor-pointer hover:r-6 transition-all"
                                    />
                                  );
                                })}
                              </svg>
                            </div>
                          </div>
                          {/* X-axis labels */}
                          <div className="flex justify-between px-2 mt-4">
                            {chartData.categories.map((cat: any, idx: number) => (
                              <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.categories.length}%` }}>
                                {cat.name.slice(0, 3)}
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
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-emerald-600">
                        ₱{chartData.totals?.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Total Income</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-red-600">
                        ₱{chartData.totals?.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Total Expenses</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-blue-600">
                        ₱{chartData.totals?.netSavings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Net Savings</p>
                    </div>
                  </div>

                  {/* Render based on chart type */}
                  {(reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut') && (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                             style={{ 
                               background: `conic-gradient(#10b981 0% ${(chartData.totals.income / (chartData.totals.income + chartData.totals.expenses)) * 100}%, #ef4444 ${(chartData.totals.income / (chartData.totals.income + chartData.totals.expenses)) * 100}% 100%)`
                             }}>
                          {reportSettings.chartType === 'donut' && (
                            <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                              <span className="text-xs text-slate-400 font-medium">Total</span>
                              <span className="text-lg sm:text-xl font-bold text-slate-900">
                                ₱{((chartData.totals.income + chartData.totals.expenses) / 1000).toFixed(1)}k
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 w-full">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-600">Income</span>
                          </div>
                          <span className="font-medium text-slate-900">₱{chartData.totals.income.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-slate-600">Expenses</span>
                          </div>
                          <span className="font-medium text-slate-900">₱{chartData.totals.expenses.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(reportSettings.chartType === 'column' || reportSettings.chartType === 'bar') && (
                    <div className="space-y-3">
                      {chartData.monthly.map((month: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{month.month}</span>
                            <span className="text-slate-500 text-[10px]">
                              Income: ₱{month.income.toLocaleString()} | Expenses: ₱{month.expenses.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-1 h-8">
                            <div 
                              className="bg-emerald-500 rounded-[2px] transition-all hover:opacity-80"
                              style={{ width: `${(month.income / (chartData.totals?.income || 1)) * 100}%` }}
                            />
                            <div 
                              className="bg-red-500 rounded-[2px] transition-all hover:opacity-80"
                              style={{ width: `${(month.expenses / (chartData.totals?.income || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                    <div className="space-y-4">
                      <div className="relative h-64">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                        </div>
                        <div className="relative h-full border-b border-slate-50 px-2 pb-2">
                          <svg className="w-full h-full" preserveAspectRatio="none">
                            {/* Calculate max value for scaling */}
                            {(() => {
                              const maxValue = Math.max(...chartData.monthly.map((m: any) => Math.max(m.income, m.expenses)));
                              return (
                                <>
                                  {/* Income line */}
                                  <path
                                    d={chartData.monthly.map((m: any, idx: number) => {
                                      const x = (idx / (chartData.monthly.length - 1)) * 100;
                                      const y = 100 - ((m.income / maxValue) * 100);
                                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  
                                  {/* Expense line */}
                                  <path
                                    d={chartData.monthly.map((m: any, idx: number) => {
                                      const x = (idx / (chartData.monthly.length - 1)) * 100;
                                      const y = 100 - ((m.expenses / maxValue) * 100);
                                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                  />

                                  {reportSettings.chartType === 'area' && (
                                    <>
                                      {/* Income area */}
                                      <path
                                        d={`${chartData.monthly.map((m: any, idx: number) => {
                                          const x = (idx / (chartData.monthly.length - 1)) * 100;
                                          const y = 100 - ((m.income / maxValue) * 100);
                                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                        }).join(' ')} L 100 100 L 0 100 Z`}
                                        fill="#10b981"
                                        fillOpacity="0.1"
                                      />
                                      {/* Expense area */}
                                      <path
                                        d={`${chartData.monthly.map((m: any, idx: number) => {
                                          const x = (idx / (chartData.monthly.length - 1)) * 100;
                                          const y = 100 - ((m.expenses / maxValue) * 100);
                                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                        }).join(' ')} L 100 100 L 0 100 Z`}
                                        fill="#ef4444"
                                        fillOpacity="0.1"
                                      />
                                    </>
                                  )}
                                  
                                  {/* Income data points */}
                                  {chartData.monthly.map((m: any, idx: number) => {
                                    const x = (idx / (chartData.monthly.length - 1)) * 100;
                                    const y = 100 - ((m.income / maxValue) * 100);
                                    return (
                                      <circle
                                        key={`income-${idx}`}
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="4"
                                        fill="#10b981"
                                        className="cursor-pointer hover:r-6 transition-all"
                                      />
                                    );
                                  })}
                                  
                                  {/* Expense data points */}
                                  {chartData.monthly.map((m: any, idx: number) => {
                                    const x = (idx / (chartData.monthly.length - 1)) * 100;
                                    const y = 100 - ((m.expenses / maxValue) * 100);
                                    return (
                                      <circle
                                        key={`expense-${idx}`}
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="4"
                                        fill="#ef4444"
                                        className="cursor-pointer hover:r-6 transition-all"
                                      />
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      </div>
                      {/* X-axis labels */}
                      <div className="flex justify-between px-2 mt-4">
                        {chartData.monthly.map((m: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.monthly.length}%` }}>
                            {m.month}
                          </span>
                        ))}
                      </div>
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-xs text-slate-600">Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-xs text-slate-600">Expenses</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <div className="text-center mb-6 p-4 rounded-lg bg-slate-50">
                    <p className="text-2xl font-bold text-slate-900">
                      ₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Total Savings ({chartData.rate?.toFixed(1)}% rate)</p>
                  </div>

                  {/* Render based on chart type */}
                  {(reportSettings.chartType === 'bar' || reportSettings.chartType === 'column') && (
                    <div className="space-y-3">
                      {chartData.funds.map((fund: any, idx: number) => {
                        const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                        const color = emeraldShades[idx % emeraldShades.length];
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-700">{fund.name}</span>
                              <span className="text-slate-500 text-[10px]">
                                ₱{fund.amount.toLocaleString()} / ₱{fund.target.toLocaleString()} ({fund.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full transition-all hover:opacity-80"
                                style={{ 
                                  width: `${Math.min(100, fund.percentage)}%`,
                                  backgroundColor: color 
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut') && (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                             style={{ 
                               background: `conic-gradient(${chartData.funds.map((fund: any, idx: number) => {
                                 const prevPercentage = chartData.funds.slice(0, idx).reduce((sum: number, f: any) => sum + (f.amount / chartData.total) * 100, 0);
                                 const currentPercentage = prevPercentage + (fund.amount / chartData.total) * 100;
                                 const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                 const color = emeraldShades[idx % emeraldShades.length];
                                 return `${color} ${prevPercentage}% ${currentPercentage}%`;
                               }).join(', ')})`
                             }}>
                          {reportSettings.chartType === 'donut' && (
                            <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                              <span className="text-xs text-slate-400 font-medium">Total</span>
                              <span className="text-lg sm:text-xl font-bold text-slate-900">
                                ₱{(chartData.total / 1000).toFixed(1)}k
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 w-full">
                        {chartData.funds.map((fund: any, idx: number) => {
                          const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                          const color = emeraldShades[idx % emeraldShades.length];
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-slate-600">{fund.name}</span>
                              </div>
                              <span className="font-medium text-slate-900">₱{fund.amount.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                    <div className="space-y-4">
                      <div className="relative h-64">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                        </div>
                        <div className="relative h-full border-b border-slate-50 px-2 pb-2">
                          <svg className="w-full h-full" preserveAspectRatio="none">
                            <path
                              d={chartData.funds.map((fund: any, idx: number) => {
                                const x = (idx / (chartData.funds.length - 1)) * 100;
                                const y = 100 - fund.percentage;
                                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                            
                            {reportSettings.chartType === 'area' && (
                              <path
                                d={`${chartData.funds.map((fund: any, idx: number) => {
                                  const x = (idx / (chartData.funds.length - 1)) * 100;
                                  const y = 100 - fund.percentage;
                                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')} L 100 100 L 0 100 Z`}
                                fill="#10b981"
                                fillOpacity="0.1"
                              />
                            )}
                            
                            {chartData.funds.map((fund: any, idx: number) => {
                              const x = (idx / (chartData.funds.length - 1)) * 100;
                              const y = 100 - fund.percentage;
                              return (
                                <circle
                                  key={idx}
                                  cx={`${x}%`}
                                  cy={`${y}%`}
                                  r="4"
                                  fill="#10b981"
                                  className="cursor-pointer hover:r-6 transition-all"
                                />
                              );
                            })}
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between px-2 mt-4">
                        {chartData.funds.map((fund: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.funds.length}%` }}>
                            {fund.name.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-slate-900">{chartData.totalGoals}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Total Goals</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-emerald-600">{chartData.completedGoals}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Completed</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-amber-600">{chartData.nearingCompletion}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Nearing</p>
                    </div>
                  </div>

                  {/* Render based on chart type */}
                  {(reportSettings.chartType === 'bar' || reportSettings.chartType === 'column') && (
                    <div className="space-y-3">
                      {chartData.goals.map((goal: any, idx: number) => {
                        const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                        const color = emeraldShades[idx % emeraldShades.length];
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-700">{goal.name}</span>
                              <span className="text-slate-500 text-[10px]">
                                ₱{goal.current.toLocaleString()} / ₱{goal.target.toLocaleString()} ({goal.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full transition-all hover:opacity-80"
                                style={{ 
                                  width: `${Math.min(100, goal.percentage)}%`,
                                  backgroundColor: color 
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut') && (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                             style={{ 
                               background: `conic-gradient(${chartData.goals.map((goal: any, idx: number) => {
                                 const totalCurrent = chartData.goals.reduce((sum: number, g: any) => sum + g.current, 0);
                                 const prevPercentage = chartData.goals.slice(0, idx).reduce((sum: number, g: any) => sum + (g.current / totalCurrent) * 100, 0);
                                 const currentPercentage = prevPercentage + (goal.current / totalCurrent) * 100;
                                 const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                 const color = emeraldShades[idx % emeraldShades.length];
                                 return `${color} ${prevPercentage}% ${currentPercentage}%`;
                               }).join(', ')})`
                             }}>
                          {reportSettings.chartType === 'donut' && (
                            <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                              <span className="text-xs text-slate-400 font-medium">Goals</span>
                              <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {chartData.totalGoals}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 w-full">
                        {chartData.goals.map((goal: any, idx: number) => {
                          const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                          const color = emeraldShades[idx % emeraldShades.length];
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-slate-600">{goal.name}</span>
                              </div>
                              <span className="font-medium text-slate-900">₱{goal.current.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                    <div className="space-y-4">
                      <div className="relative h-64">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                        </div>
                        <div className="relative h-full border-b border-slate-50 px-2 pb-2">
                          <svg className="w-full h-full" preserveAspectRatio="none">
                            <path
                              d={chartData.goals.map((goal: any, idx: number) => {
                                const x = (idx / (chartData.goals.length - 1)) * 100;
                                const y = 100 - goal.percentage;
                                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                            
                            {reportSettings.chartType === 'area' && (
                              <path
                                d={`${chartData.goals.map((goal: any, idx: number) => {
                                  const x = (idx / (chartData.goals.length - 1)) * 100;
                                  const y = 100 - goal.percentage;
                                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')} L 100 100 L 0 100 Z`}
                                fill="#10b981"
                                fillOpacity="0.1"
                              />
                            )}
                            
                            {chartData.goals.map((goal: any, idx: number) => {
                              const x = (idx / (chartData.goals.length - 1)) * 100;
                              const y = 100 - goal.percentage;
                              return (
                                <circle
                                  key={idx}
                                  cx={`${x}%`}
                                  cy={`${y}%`}
                                  r="4"
                                  fill="#10b981"
                                  className="cursor-pointer hover:r-6 transition-all"
                                />
                              );
                            })}
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between px-2 mt-4">
                        {chartData.goals.map((goal: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.goals.length}%` }}>
                            {goal.name.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                <div className="space-y-4">
                  {/* Default card view - always show regardless of chart type */}
                  {(reportSettings.chartType === 'column' || reportSettings.chartType === 'bar') && (
                    <div className="space-y-3">
                      {chartData.categories.map((cat: any, idx: number) => {
                        const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                        const color = emeraldShades[idx % emeraldShades.length];
                        return (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-all">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${
                                cat.trend === 'up' ? 'text-red-600' : 
                                cat.trend === 'down' ? 'text-emerald-600' : 'text-slate-600'
                              }`}>
                                {cat.change > 0 ? '+' : ''}{cat.change.toFixed(1)}%
                              </span>
                              {cat.trend === 'up' ? <ArrowUp size={14} className="text-red-600" /> :
                               cat.trend === 'down' ? <ArrowUp size={14} className="text-emerald-600 rotate-180" /> :
                               <ArrowRight size={14} className="text-slate-600" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut') && (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                             style={{ 
                               background: `conic-gradient(${chartData.categories.map((cat: any, idx: number) => {
                                 const totalChange = chartData.categories.reduce((sum: number, c: any) => sum + Math.abs(c.change), 0);
                                 const prevPercentage = chartData.categories.slice(0, idx).reduce((sum: number, c: any) => sum + (Math.abs(c.change) / totalChange) * 100, 0);
                                 const currentPercentage = prevPercentage + (Math.abs(cat.change) / totalChange) * 100;
                                 const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                 const color = emeraldShades[idx % emeraldShades.length];
                                 return `${color} ${prevPercentage}% ${currentPercentage}%`;
                               }).join(', ')})`
                             }}>
                          {reportSettings.chartType === 'donut' && (
                            <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                              <span className="text-xs text-slate-400 font-medium">Trends</span>
                              <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {chartData.categories.length}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 w-full">
                        {chartData.categories.map((cat: any, idx: number) => {
                          const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                          const color = emeraldShades[idx % emeraldShades.length];
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-slate-600">{cat.name}</span>
                              </div>
                              <span className={`font-medium ${
                                cat.trend === 'up' ? 'text-red-600' : 
                                cat.trend === 'down' ? 'text-emerald-600' : 'text-slate-600'
                              }`}>
                                {cat.change > 0 ? '+' : ''}{cat.change.toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                    <div className="space-y-4">
                      <div className="relative h-64">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                        </div>
                        <div className="relative h-full border-b border-slate-50 px-2 pb-2">
                          <svg className="w-full h-full" preserveAspectRatio="none">
                            {/* Calculate max absolute change for scaling */}
                            {(() => {
                              const maxChange = Math.max(...chartData.categories.map((c: any) => Math.abs(c.change)));
                              return (
                                <>
                                  <path
                                    d={chartData.categories.map((cat: any, idx: number) => {
                                      const x = (idx / (chartData.categories.length - 1)) * 100;
                                      const y = 50 - ((cat.change / maxChange) * 40); // Center at 50%, scale to ±40%
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
                                        const y = 50 - ((cat.change / maxChange) * 40);
                                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                      }).join(' ')} L 100 50 L 0 50 Z`}
                                      fill="#10b981"
                                      fillOpacity="0.1"
                                    />
                                  )}
                                  
                                  {/* Zero line */}
                                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
                                  
                                  {chartData.categories.map((cat: any, idx: number) => {
                                    const x = (idx / (chartData.categories.length - 1)) * 100;
                                    const y = 50 - ((cat.change / maxChange) * 40);
                                    return (
                                      <circle
                                        key={idx}
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="4"
                                        fill={cat.trend === 'up' ? '#ef4444' : cat.trend === 'down' ? '#10b981' : '#64748b'}
                                        className="cursor-pointer hover:r-6 transition-all"
                                      />
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-between px-2 mt-4">
                        {chartData.categories.map((cat: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.categories.length}%` }}>
                            {cat.name.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Future Predictions Chart */}
          {reportSettings.reportType === 'predictions' && (
            <>
              {loadingPredictions ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Loading Predictions...</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                    Analyzing your financial data with AI
                  </p>
                </div>
              ) : !predictionData.forecast || (!predictionData.forecast.historical.length && !predictionData.forecast.predicted.length) ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                    <TrendingUp size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Prediction Data</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                    Add more transactions to generate AI-powered financial forecasts.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-emerald-600">
                        ₱{(predictionData.forecast?.predicted[0]?.income || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Projected Income</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-red-600">
                        ₱{(predictionData.forecast?.predicted[0]?.expense || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Projected Expenses</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <p className="text-lg font-bold text-blue-600">
                        {predictionData.forecast?.summary?.confidence || 0}%
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Confidence</p>
                    </div>
                  </div>

                  {/* Render based on chart type */}
                  {(reportSettings.chartType === 'line' || reportSettings.chartType === 'area') && (
                    <div className="space-y-4">
                      <div className="relative h-64">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2">
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                          <div className="w-full h-px bg-slate-100/50" />
                        </div>
                        <div className="relative h-full border-b border-slate-50 px-2 pb-2">
                          <svg className="w-full h-full" preserveAspectRatio="none">
                            {(() => {
                              const allData = [...(predictionData.forecast?.historical || []), ...(predictionData.forecast?.predicted || [])];
                              const maxValue = Math.max(...allData.map((m: any) => Math.max(m.income, m.expense)));
                              const historicalLength = predictionData.forecast?.historical?.length || 0;
                              return (
                                <>
                                  {/* Income line */}
                                  <path
                                    d={allData.map((m: any, idx: number) => {
                                      const x = (idx / (allData.length - 1)) * 100;
                                      const y = 100 - ((m.income / maxValue) * 100);
                                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    strokeDasharray={historicalLength > 0 ? `${(historicalLength / allData.length) * 100} 0` : "0"}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  
                                  {/* Income prediction line (dashed) */}
                                  {predictionData.forecast?.predicted && predictionData.forecast.predicted.length > 0 && predictionData.forecast?.historical && predictionData.forecast.historical.length > 0 && (
                                    <path
                                      d={[predictionData.forecast.historical[predictionData.forecast.historical.length - 1], ...predictionData.forecast.predicted].map((m: any, idx: number) => {
                                        const startIdx = predictionData.forecast!.historical.length - 1;
                                        const x = ((startIdx + idx) / (allData.length - 1)) * 100;
                                        const y = 100 - ((m.income / maxValue) * 100);
                                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#10b981"
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                  )}
                                  
                                  {/* Expense line */}
                                  <path
                                    d={allData.map((m: any, idx: number) => {
                                      const x = (idx / (allData.length - 1)) * 100;
                                      const y = 100 - ((m.expense / maxValue) * 100);
                                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray={historicalLength > 0 ? `${(historicalLength / allData.length) * 100} 0` : "0"}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                  
                                  {/* Expense prediction line (dashed) */}
                                  {predictionData.forecast?.predicted && predictionData.forecast.predicted.length > 0 && predictionData.forecast?.historical && predictionData.forecast.historical.length > 0 && (
                                    <path
                                      d={[predictionData.forecast.historical[predictionData.forecast.historical.length - 1], ...predictionData.forecast.predicted].map((m: any, idx: number) => {
                                        const startIdx = predictionData.forecast!.historical.length - 1;
                                        const x = ((startIdx + idx) / (allData.length - 1)) * 100;
                                        const y = 100 - ((m.expense / maxValue) * 100);
                                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                      }).join(' ')}
                                      fill="none"
                                      stroke="#ef4444"
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                  )}

                                  {reportSettings.chartType === 'area' && (
                                    <>
                                      {/* Income area */}
                                      <path
                                        d={`${allData.map((m: any, idx: number) => {
                                          const x = (idx / (allData.length - 1)) * 100;
                                          const y = 100 - ((m.income / maxValue) * 100);
                                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                        }).join(' ')} L 100 100 L 0 100 Z`}
                                        fill="#10b981"
                                        fillOpacity="0.1"
                                      />
                                      {/* Expense area */}
                                      <path
                                        d={`${allData.map((m: any, idx: number) => {
                                          const x = (idx / (allData.length - 1)) * 100;
                                          const y = 100 - ((m.expense / maxValue) * 100);
                                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                        }).join(' ')} L 100 100 L 0 100 Z`}
                                        fill="#ef4444"
                                        fillOpacity="0.1"
                                      />
                                    </>
                                  )}
                                  
                                  {/* Data points */}
                                  {allData.map((m: any, idx: number) => {
                                    const x = (idx / (allData.length - 1)) * 100;
                                    const yIncome = 100 - ((m.income / maxValue) * 100);
                                    const yExpense = 100 - ((m.expense / maxValue) * 100);
                                    const isPredicted = idx >= historicalLength;
                                    return (
                                      <g key={idx}>
                                        <circle
                                          cx={`${x}%`}
                                          cy={`${yIncome}%`}
                                          r="4"
                                          fill="#10b981"
                                          fillOpacity={isPredicted ? 0.6 : 1}
                                          className="cursor-pointer hover:r-6 transition-all"
                                        />
                                        <circle
                                          cx={`${x}%`}
                                          cy={`${yExpense}%`}
                                          r="4"
                                          fill="#ef4444"
                                          fillOpacity={isPredicted ? 0.6 : 1}
                                          className="cursor-pointer hover:r-6 transition-all"
                                        />
                                      </g>
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      </div>
                      {/* X-axis labels */}
                      <div className="flex justify-between px-2 mt-4">
                        {[...(predictionData.forecast?.historical || []), ...(predictionData.forecast?.predicted || [])].map((m: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / ((predictionData.forecast?.historical?.length || 0) + (predictionData.forecast?.predicted?.length || 0))}%` }}>
                            {m.month}
                          </span>
                        ))}
                      </div>
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-xs text-slate-600">Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-xs text-slate-600">Expenses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5 border-t-2 border-dashed border-slate-400" />
                          <span className="text-xs text-slate-600">Predicted</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(reportSettings.chartType === 'column' || reportSettings.chartType === 'bar') && predictionData.forecast?.predicted && (
                    <div className="space-y-3">
                      {predictionData.forecast.predicted.map((month: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{month.month}</span>
                            <span className="text-slate-500 text-[10px]">
                              Income: ₱{month.income.toLocaleString()} | Expenses: ₱{month.expense.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-1 h-8">
                            <div 
                              className="bg-emerald-500 rounded-[2px] transition-all hover:opacity-80"
                              style={{ width: `${(month.income / (month.income + month.expense)) * 100}%` }}
                            />
                            <div 
                              className="bg-red-500 rounded-[2px] transition-all hover:opacity-80"
                              style={{ width: `${(month.expense / (month.income + month.expense)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(reportSettings.chartType === 'pie' || reportSettings.chartType === 'donut') && predictionData.categories.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-900">Category Predictions</h4>
                      <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                               style={{ 
                                 background: `conic-gradient(${predictionData.categories.map((cat: any, idx: number) => {
                                   const total = predictionData.categories.reduce((sum: number, c: any) => sum + c.predicted, 0);
                                   const prevPercentage = predictionData.categories.slice(0, idx).reduce((sum: number, c: any) => sum + (c.predicted / total) * 100, 0);
                                   const currentPercentage = prevPercentage + (cat.predicted / total) * 100;
                                   const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                                   const color = emeraldShades[idx % emeraldShades.length];
                                   return `${color} ${prevPercentage}% ${currentPercentage}%`;
                                 }).join(', ')})`
                               }}>
                            {reportSettings.chartType === 'donut' && (
                              <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                <span className="text-xs text-slate-400 font-medium">Total</span>
                                <span className="text-lg sm:text-xl font-bold text-slate-900">
                                  {predictionData.categories.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3 w-full">
                          {predictionData.categories.slice(0, 5).map((cat: any, idx: number) => {
                            const emeraldShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                            const color = emeraldShades[idx % emeraldShades.length];
                            return (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                  <span className="text-slate-600">{cat.category}</span>
                                </div>
                                <span className="font-medium text-slate-900">₱{cat.predicted.toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
            </>
          )}
        </Card>
      )}

      {/* Table View Section */}
      {viewMode === "table" && (
        <Card className="overflow-hidden hover:shadow-md transition-all">
          <div className="p-6 border-b border-slate-100">
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

          {!chartData ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                <Table size={24} className="sm:w-8 sm:h-8 text-slate-300" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Data Available</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                Add transactions to see your financial data in table format.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Spending by Category Table */}
              {reportSettings.reportType === 'spending' && chartData.categories && chartData.categories.length > 0 && (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.categories.map((cat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">₱{cat.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">{cat.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold">
                      <td className="px-6 py-4 text-sm text-slate-900">Total</td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right">₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Income vs Expense Table */}
              {reportSettings.reportType === 'income-expense' && chartData.monthly && chartData.monthly.length > 0 && (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Income</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Expenses</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Net Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.monthly.map((month: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{month.month}</td>
                        <td className="px-6 py-4 text-sm text-emerald-600 text-right">₱{month.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-red-600 text-right">₱{month.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 text-right">₱{(month.income - month.expenses).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold">
                      <td className="px-6 py-4 text-sm text-slate-900">Total</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 text-right">₱{chartData.totals?.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right">₱{chartData.totals?.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 text-right">₱{chartData.totals?.netSavings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Savings Analysis Table */}
              {reportSettings.reportType === 'savings' && chartData.funds && chartData.funds.length > 0 && (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fund Name</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Target Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.funds.map((fund: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{fund.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">₱{fund.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">₱{fund.target.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">{fund.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold">
                      <td className="px-6 py-4 text-sm text-slate-900">Total</td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right">₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right" colSpan={2}>Savings Rate: {chartData.rate?.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Goals Progress Table */}
              {reportSettings.reportType === 'goals' && chartData.goals && chartData.goals.length > 0 && (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Goal Name</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Target Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.goals.map((goal: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{goal.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">₱{goal.current.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">₱{goal.target.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">{goal.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Trends Table */}
              {reportSettings.reportType === 'trends' && chartData.categories && chartData.categories.length > 0 && (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.categories.map((cat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.name}</td>
                        <td className={`px-6 py-4 text-sm text-right font-semibold ${
                          cat.trend === 'up' ? 'text-red-600' : 
                          cat.trend === 'down' ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {cat.change > 0 ? '+' : ''}{cat.change.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            cat.trend === 'up' ? 'bg-red-50 text-red-700' : 
                            cat.trend === 'down' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'
                          }`}>
                            {cat.trend === 'up' ? '↑ Increasing' : cat.trend === 'down' ? '↓ Decreasing' : '→ Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Future Predictions Table */}
              {reportSettings.reportType === 'predictions' && predictionData.forecast && (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Projected Income</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Projected Expenses</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Net Savings</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {predictionData.forecast.predicted.map((month: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{month.month}</td>
                        <td className="px-6 py-4 text-sm text-emerald-600 text-right">₱{month.income.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-red-600 text-right">₱{month.expense.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 text-right">₱{(month.income - month.expense).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            {month.confidence || predictionData.forecast?.summary?.confidence || 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
