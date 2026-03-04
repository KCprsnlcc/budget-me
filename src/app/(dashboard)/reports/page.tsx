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
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { AnomalyDetailsModal, ReportCharts } from "./_components";
import type { AnomalyAlert, ReportSettings, AnomalyDetails } from "./_components/types";
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
import { fetchResolvedAnomalies, dismissAnomaly, resolveAnomaly } from "./_actions/anomaly-actions";
import { detectAndSaveAnomalies } from "./_actions/detect-anomalies";
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
  const [anomalyTab, setAnomalyTab] = useState<"active" | "resolved">("active");
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
  const [resolvedAnomalies, setResolvedAnomalies] = useState<any[]>([]);
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
      // First, detect and save any new anomalies
      await detectAndSaveAnomalies(user.id, reportSettings.timeframe);

      // Then fetch summary, anomalies, chart data, cached insights, and resolved anomalies in parallel
      const [summary, anomalyData, chart, cachedInsights, resolvedData] = await Promise.all([
        fetchReportSummary(user.id, reportSettings.timeframe),
        fetchAnomalyAlerts(user.id, reportSettings.timeframe),
        fetchReportChartData(user.id, reportSettings.reportType, reportSettings.timeframe),
        fetchCachedReportInsights(user.id, reportSettings.reportType, reportSettings.timeframe),
        fetchResolvedAnomalies(user.id, reportSettings.timeframe),
      ]);

      setSummaryData(summary);
      setAnomalies(anomalyData);
      setResolvedAnomalies(resolvedData.data || []);
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

  const handleDismissAnomaly = useCallback(async (anomalyId: string) => {
    if (!user?.id) return;

    // Remove from active anomalies list immediately for better UX
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
    
    try {
      // Call server action to delete from database
      const result = await dismissAnomaly(anomalyId, user.id);
      
      if (result.success) {
        // Refresh active anomalies to ensure sync with database
        const activeData = await fetchAnomalyAlerts(user.id, reportSettings.timeframe);
        setAnomalies(activeData);
      } else {
        // If failed, restore the anomaly in the list
        const activeData = await fetchAnomalyAlerts(user.id, reportSettings.timeframe);
        setAnomalies(activeData);
      }
    } catch (error) {
      console.error("Error dismissing anomaly:", error);
      // Restore on error
      const activeData = await fetchAnomalyAlerts(user.id, reportSettings.timeframe);
      setAnomalies(activeData);
    }
    
    setShowAnomalyModal(false);
  }, [user?.id, reportSettings.timeframe]);

  const handleResolveAnomaly = useCallback(async (anomalyId: string) => {
    if (!user?.id) return;

    // Remove from active anomalies list immediately for better UX
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
    
    try {
      // Call server action to update in database
      const result = await resolveAnomaly(anomalyId, user.id);
      
      if (result.success) {
        // Refresh both active and resolved anomalies
        const [activeData, resolvedResult] = await Promise.all([
          fetchAnomalyAlerts(user.id, reportSettings.timeframe),
          fetchResolvedAnomalies(user.id, reportSettings.timeframe)
        ]);
        
        setAnomalies(activeData);
        if (resolvedResult.success) {
          setResolvedAnomalies(resolvedResult.data || []);
        }
      } else {
        // If failed, restore the anomaly in the list
        const activeData = await fetchAnomalyAlerts(user.id, reportSettings.timeframe);
        setAnomalies(activeData);
      }
    } catch (error) {
      console.error("Error resolving anomaly:", error);
      // Restore on error
      const activeData = await fetchAnomalyAlerts(user.id, reportSettings.timeframe);
      setAnomalies(activeData);
    }
    
    setShowAnomalyModal(false);
  }, [user?.id, reportSettings.timeframe]);

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
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setAnomalyTab("active")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              anomalyTab === "active"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active {anomalies.length > 0 && `(${anomalies.length})`}
          </button>
          <button
            onClick={() => setAnomalyTab("resolved")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              anomalyTab === "resolved"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Resolved {resolvedAnomalies.length > 0 && `(${resolvedAnomalies.length})`}
          </button>
        </div>

        {/* Active Anomalies Tab */}
        {anomalyTab === "active" && (
          <>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismissAnomaly(anomaly.id);
                          }}
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
          </>
        )}

        {/* Resolved Anomalies Tab */}
        {anomalyTab === "resolved" && (
          <>
            {resolvedAnomalies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                  <CheckCircle size={24} className="sm:w-8 sm:h-8 text-slate-300" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Resolved Anomalies</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
                  Resolved and dismissed anomalies will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedAnomalies.slice(0, 6).map((anomaly: any) => (
                  <div
                    key={anomaly.id} 
                    className="bg-white rounded-xl border-l-4 border-l-emerald-500 shadow-sm p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        {anomaly.status === "resolved" ? "Resolved" : "Dismissed"}
                      </div>
                      <div className="text-emerald-600">
                        <CheckCircle size={16} />
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
                      <div className="text-[10px] text-slate-400">
                        {anomaly.resolvedAt && new Date(anomaly.resolvedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {anomaly.resolutionNotes && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-[10px] text-slate-500 italic">{anomaly.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
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
        <ReportCharts
          reportSettings={reportSettings}
          chartData={chartData}
          predictionData={predictionData}
          loadingPredictions={loadingPredictions}
        />
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
          userId={user?.id}
        />
      )}
    </div>
  );
}
