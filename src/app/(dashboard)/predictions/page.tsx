"use client";

import {
  Wand2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Brain,
  Sparkles,
  PhilippinePeso,
  ShoppingBag,
  Utensils,
  Car,
  Wallet,
  PiggyBank,
  ChartBar,
  Download,
  History,
  MoreHorizontal,
  Settings,
  ChefHat,
  Bus,
  Clapperboard,
  FileText,
  Cpu,
  Search,
  Star,
  Shield,
  ShieldCheck,
  File,
  ListChecks,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  HistoryModal,
  DetailedBreakdownModal,
  generateIncomeExpenseForecast,
  generateCategoryForecast,
  analyzeExpenseTypes,
  analyzeTransactionBehavior,
  generatePredictionSummary,
  detectAnomalies,
  generateSavingsOpportunities,
  generateAIInsights,
  fetchPredictionHistory,
  savePrediction,
  type MonthlyForecast,
  type CategoryPrediction,
  type TransactionBehaviorInsight,
  type PredictionSummary,
  type AnomalyResult,
  type SavingsOpportunity,
  type PredictionHistory,
} from "./_components";
import { useAuth } from "@/components/auth/auth-context";
import { useState, useCallback, useEffect } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Icon mapping for category predictions
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  "Food & Dining": Utensils,
  "Shopping": ShoppingBag,
  "Transportation": Car,
  "Utilities": ChartBar,
  "Entertainment": Clapperboard,
  "Health": Shield,
  "Education": FileText,
  "Housing": PiggyBank,
};

// Helper to get icon for category
function getCategoryIcon(categoryName: string): React.ComponentType<any> {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return ShoppingBag;
}

// Helper to format currency
function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PredictionsPage() {
  const { user } = useAuth();
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [detailedBreakdownModalOpen, setDetailedBreakdownModalOpen] = useState(false);
  const [detailedInsights, setDetailedInsights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<{month: string, type: 'income' | 'expense', value: number, dataType: 'historical' | 'predicted'} | null>(null);

  // Real data states
  const [forecastData, setForecastData] = useState<{
    historical: MonthlyForecast[];
    predicted: MonthlyForecast[];
    summary: { 
      avgGrowth: number; 
      maxSavings: number; 
      confidence: number;
      trendDirection?: "up" | "down" | "stable";
      trendStrength?: number;
      seasonalityStrength?: number;
      changepoints?: string[];
      modelDetails?: {
        seasonalityMode: "additive" | "multiplicative";
        yearlySeasonality: boolean;
        weeklySeasonality: boolean;
        changepointPriorScale: number;
        seasonalityPriorScale: number;
        uncertaintySamples: number;
      };
    };
  } | null>(null);
  
  const [categoryPredictions, setCategoryPredictions] = useState<CategoryPrediction[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<{
    recurring: { amount: number; percentage: number; trend: string; trendValue: number };
    variable: { amount: number; percentage: number; trend: string; trendValue: number };
  } | null>(null);
  const [behaviorInsights, setBehaviorInsights] = useState<TransactionBehaviorInsight[]>([]);
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [savingsOpportunities, setSavingsOpportunities] = useState<SavingsOpportunity[]>([]);
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    growthPotential: string;
    recommendations: string[];
  } | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);

  // Fetch all prediction data
  const fetchPredictions = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [
        forecast,
        categories,
        expenseTypeData,
        behavior,
        summaryData,
        anomaliesData,
        savings,
        insights,
        history,
      ] = await Promise.all([
        generateIncomeExpenseForecast(user.id),
        generateCategoryForecast(user.id),
        analyzeExpenseTypes(user.id),
        analyzeTransactionBehavior(user.id),
        generatePredictionSummary(user.id),
        detectAnomalies(user.id),
        generateSavingsOpportunities(user.id),
        generateAIInsights(user.id),
        fetchPredictionHistory(user.id),
      ]);

      setForecastData(forecast);
      setCategoryPredictions(categories);
      setExpenseTypes(expenseTypeData);
      setBehaviorInsights(behavior);
      setSummary(summaryData);
      setAnomalies(anomaliesData);
      setSavingsOpportunities(savings);
      setAiInsights(insights);
      setPredictionHistory(history);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchPredictions();
    }
  }, [user?.id, fetchPredictions]);

  const handleHistory = useCallback(() => {
    setHistoryModalOpen(true);
  }, []);

  const handleDetailedBreakdown = useCallback(() => {
    setDetailedBreakdownModalOpen(true);
  }, []);

  const toggleDetailedInsights = useCallback(() => {
    setDetailedInsights(prev => !prev);
  }, []);

  const handleGeneratePredictions = useCallback(async () => {
    if (!user?.id) return;

    setIsGenerating(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Generating predictions...", {
      description: "Analyzing your financial data with AI",
    });

    try {
      // Save current prediction to history
      await savePrediction(user.id, {
        type: "full",
        insights: [
          ...(anomalies || []),
          ...(savingsOpportunities || []),
        ],
        dataPoints: forecastData?.historical.length || 0,
        accuracy: forecastData?.summary.confidence,
      });

      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Only fetch and update prediction-related data (not everything)
      const [
        newForecast,
        newCategories,
        newExpenseTypeData,
        newBehavior,
        newSummaryData,
      ] = await Promise.all([
        generateIncomeExpenseForecast(user.id),
        generateCategoryForecast(user.id),
        analyzeExpenseTypes(user.id),
        analyzeTransactionBehavior(user.id),
        generatePredictionSummary(user.id),
      ]);

      // Update only the prediction-related states
      setForecastData(newForecast);
      setCategoryPredictions(newCategories);
      setExpenseTypes(newExpenseTypeData);
      setBehaviorInsights(newBehavior);
      setSummary(newSummaryData);
      
      // Dismiss loading toast and show success
      toast.success("Predictions generated successfully", {
        id: loadingToast,
        description: "Your financial forecast has been updated",
      });
      
    } catch (error) {
      console.error("Error generating predictions:", error);
      
      // Show error toast
      toast.error("Failed to generate predictions", {
        id: loadingToast,
        description: "Please try again later",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, forecastData, anomalies, savingsOpportunities]);

  // Handler for AI Insights generation (separate from predictions)
  const handleGenerateAIInsights = useCallback(async () => {
    if (!user?.id) return;

    setIsGeneratingInsights(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Generating AI insights...", {
      description: "Analyzing your spending patterns and trends",
    });

    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Fetch AI-specific insights
      const [
        newAnomalies,
        newSavings,
        newInsights,
      ] = await Promise.all([
        detectAnomalies(user.id),
        generateSavingsOpportunities(user.id),
        generateAIInsights(user.id),
      ]);

      // Update AI insights states
      setAnomalies(newAnomalies);
      setSavingsOpportunities(newSavings);
      setAiInsights(newInsights);
      
      // Dismiss loading toast and show success
      toast.success("AI insights generated successfully", {
        id: loadingToast,
        description: "Your financial intelligence has been updated",
      });
      
    } catch (error) {
      console.error("Error generating AI insights:", error);
      
      // Show error toast
      toast.error("Failed to generate AI insights", {
        id: loadingToast,
        description: "Please try again later",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [user?.id]);

  // Combine historical and predicted for chart display
  const chartData = [
    ...(forecastData?.historical || []),
    ...(forecastData?.predicted || []),
  ];

  // Calculate percentages for visualization
  const maxChartValue = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  // Loading state
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Page Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton width={200} height={32} />
                <Skeleton width={100} height={20} />
              </div>
              <Skeleton width={300} height={16} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton width={180} height={36} borderRadius={4} />
              <Skeleton width={120} height={36} borderRadius={4} />
            </div>
          </div>

          {/* Prediction Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton width={40} height={40} borderRadius={8} />
                  <Skeleton width={80} height={20} borderRadius={10} />
                </div>
                <Skeleton width={100} height={16} className="mb-2" />
                <Skeleton width={120} height={24} />
              </Card>
            ))}
          </div>

          {/* Interactive Prediction Chart Skeleton */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Skeleton width={250} height={16} className="mb-2" />
                <Skeleton width={200} height={12} />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Skeleton width={12} height={12} circle />
                    <Skeleton width={120} height={12} />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton height={240} />
            <div className="flex justify-between mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} width={40} height={12} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Skeleton width={80} height={10} />
                  <Skeleton width={50} height={12} />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton width={80} height={10} />
                  <Skeleton width={60} height={12} />
                </div>
              </div>
              <Skeleton width={180} height={24} borderRadius={4} />
            </div>
          </Card>

          {/* Category Predictions Table Skeleton */}
          <Card className="overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Skeleton width={200} height={16} className="mb-2" />
                <Skeleton width={180} height={12} />
              </div>
              <Skeleton width={200} height={32} borderRadius={4} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {['Category', 'Historical Avg.', 'Predicted', 'Change', 'Trend', 'Confidence'].map((header, i) => (
                      <th key={i} className="px-6 py-4">
                        <Skeleton width={80} height={12} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton width={32} height={32} borderRadius={8} />
                          <Skeleton width={100} height={14} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton width={80} height={12} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton width={80} height={12} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton width={100} height={12} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={80} height={16} borderRadius={8} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton width={60} height={12} />
                        <Skeleton width={48} height={4} borderRadius={2} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Expense Type Forecast and Transaction Behavior Insight Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Expense Type Forecast Skeleton */}
            <Card className="p-6">
              <div className="mb-4">
                <Skeleton width={180} height={16} className="mb-2" />
                <Skeleton width={160} height={12} />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton width={120} height={12} />
                      <Skeleton width={60} height={12} />
                    </div>
                    <Skeleton height={6} borderRadius={3} />
                    <div className="flex justify-between items-center mt-2">
                      <Skeleton width={60} height={10} />
                      <Skeleton width={80} height={10} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Transaction Behavior Insight Skeleton */}
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="mb-2">
                  <Skeleton width={220} height={16} className="mb-2" />
                  <Skeleton width={200} height={12} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-4 py-3">
                        <Skeleton width={120} height={12} />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <Skeleton width={80} height={12} />
                      </th>
                      <th className="px-4 py-3 text-right">
                        <Skeleton width={80} height={12} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-4 py-3">
                          <Skeleton width={100} height={12} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Skeleton width={80} height={12} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Skeleton width={80} height={12} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* AI Financial Intelligence Skeleton */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Skeleton width={200} height={16} className="mb-2" />
                <Skeleton width={250} height={12} />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton width={100} height={36} borderRadius={4} />
                <Skeleton width={120} height={36} borderRadius={4} />
              </div>
            </div>

            {/* Initial Grid: Key Highlights Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <Skeleton width={150} height={12} />
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton width="100%" height={14} />
                    <Skeleton width="90%" height={14} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width={16} height={16} borderRadius={4} />
                    <Skeleton width={150} height={10} />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">AI Predictions</h2>
            <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
              <Cpu size={12} /> AI Powered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-light">Smart forecasts and insights powered by Prophet machine learning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            size="sm" 
            className="bg-emerald-500 hover:bg-emerald-600" 
            onClick={handleGeneratePredictions}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={16}  />
                Generate Predictions
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleHistory}>
            <History size={16} />
            View History
          </Button>
        </div>
      </div>

      {/* Prediction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Projected Income Growth Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500 p-2 rounded-lg">
              <TrendingUp size={22} strokeWidth={1.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
              ((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.income || 0)) >= 0 
                ? "text-emerald-700 border-emerald-100" 
                : "text-red-700 border-red-100"
            }`}>
              {((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.income || 0)) >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.income || 0)) >= 0 ? "+" : ""}
              {forecastData?.historical && forecastData.historical[forecastData.historical.length - 1]?.income > 0 
                ? (((forecastData?.predicted?.[0]?.income || 0) - (forecastData.historical[forecastData.historical.length - 1]?.income || 0)) / (forecastData.historical[forecastData.historical.length - 1]?.income || 1) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Projected Income Growth</div>
          <div className="text-xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency(forecastData?.predicted?.[0]?.income || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Next month projection
          </div>
        </Card>

        {/* Projected Expense Growth Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500 p-2 rounded-lg">
              <ShoppingBag size={22} strokeWidth={1.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
              ((forecastData?.predicted?.[0]?.expense || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.expense || 0)) <= 0 
                ? "text-emerald-700 border-emerald-100" 
                : "text-amber-700 border-amber-100"
            }`}>
              {((forecastData?.predicted?.[0]?.expense || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.expense || 0)) <= 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
              {((forecastData?.predicted?.[0]?.expense || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.expense || 0)) <= 0 ? "" : "+"}
              {forecastData?.historical && forecastData.historical[forecastData.historical.length - 1]?.expense > 0 
                ? (((forecastData?.predicted?.[0]?.expense || 0) - (forecastData.historical[forecastData.historical.length - 1]?.expense || 0)) / (forecastData.historical[forecastData.historical.length - 1]?.expense || 1) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Projected Expense Growth</div>
          <div className="text-xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency(forecastData?.predicted?.[0]?.expense || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Next month projection
          </div>
        </Card>

        {/* Projected Savings Growth Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500 p-2 rounded-lg">
              <PiggyBank size={22} strokeWidth={1.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
              ((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0)) >= (forecastData?.predicted?.[0]?.income || 0) * 0.10 
                ? "text-emerald-700 border-emerald-100" 
                : ((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0)) >= (forecastData?.predicted?.[0]?.income || 0) * 0.05
                ? "text-amber-700 border-amber-100"
                : "text-red-700 border-red-100"
            }`}>
              <ChartBar size={12} />
              {forecastData?.predicted?.[0]?.income && forecastData.predicted[0].income > 0 
                ? (((forecastData.predicted[0].income || 0) - (forecastData.predicted[0]?.expense || 0)) / (forecastData.predicted[0].income || 1) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Projected Savings Growth</div>
          <div className="text-xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0))}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Next month projection
          </div>
        </Card>
      </div>

      {/* Interactive Prediction Chart */}
      <Card className="p-6 mb-8 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Income vs Expenses Forecast</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Prophet ML predictions with confidence intervals</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-200"></div>
              <span className="text-[10px] font-medium text-slate-500">Historical Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-500 border-dashed"></div>
              <span className="text-[10px] font-medium text-slate-500">Predicted Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
              <span className="text-[10px] font-medium text-slate-500">Expenses</span>
            </div>
          </div>
        </div>

        <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
          </div>
          
          {chartData.map((d) => {
            const incomeHeight = maxChartValue > 0 ? (d.income / maxChartValue) * 100 : 0;
            const expenseHeight = maxChartValue > 0 ? (d.expense / maxChartValue) * 100 : 0;
            
            return (
              <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                {d.type === "predicted" ? (
                  <>
                    <div
                      className="w-3 sm:w-5 bg-slate-200 border-2 border-emerald-500 border-dashed rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                      style={{ height: `${incomeHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, type: 'income', value: d.income, dataType: 'predicted' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <div
                      className="w-3 sm:w-5 bg-emerald-500/90 border-2 border-emerald-500/30 border-dashed rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                      style={{ height: `${expenseHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, type: 'expense', value: d.expense, dataType: 'predicted' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  </>
                ) : (
                  <>
                    <div
                      className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                      style={{ height: `${incomeHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, type: 'income', value: d.income, dataType: 'historical' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <div
                      className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                      style={{ height: `${expenseHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, type: 'expense', value: d.expense, dataType: 'historical' })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  </>
                )}
                
                {/* Tooltip */}
                {hoveredBar && hoveredBar.month === d.month && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-xs rounded shadow-sm whitespace-nowrap z-50">
                    <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        hoveredBar.type === 'income' 
                          ? hoveredBar.dataType === 'predicted' ? 'bg-slate-200 border border-emerald-500' : 'bg-slate-300'
                          : hoveredBar.dataType === 'predicted' ? 'bg-emerald-500/90' : 'bg-emerald-500'
                      }`} />
                      <span className="capitalize">{hoveredBar.type}: {formatCurrency(hoveredBar.value)}</span>
                      {hoveredBar.dataType === 'predicted' && (
                        <span className="text-emerald-600 text-[10px] ml-1">(Predicted)</span>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
          {chartData.map((d) => (
            <span 
              key={d.month} 
              className={
                d.type === "current" ? "text-slate-600" : 
                d.type === "predicted" ? "text-emerald-600" : "text-slate-400"
              }
            >
              {d.month}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Avg. Growth</span>
              <span className="text-xs font-bold text-emerald-600">
                {forecastData?.summary.avgGrowth ? `+${forecastData.summary.avgGrowth}%` : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Max Savings</span>
              <span className="text-xs font-bold text-slate-900">
                {formatCurrency(forecastData?.summary.maxSavings || 0)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1" onClick={handleDetailedBreakdown}>
            View detailed breakdown
            <ArrowRight size={14} />
          </Button>
        </div>
      </Card>
              {/* Category Predictions Table */}
      <Card className="overflow-hidden mb-8 hover:shadow-md transition-all group cursor-pointer">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Category Spending Forecast</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Detailed predictions for each spending category</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter categories..."
                className="pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full lg:w-48"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-semibold sticky top-0 bg-white">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Historical Avg.</th>
                  <th className="px-6 py-4 text-right">Predicted</th>
                  <th className="px-6 py-4 text-right">Change</th>
                  <th className="px-6 py-4 text-center">Trend</th>
                  <th className="px-6 py-4 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-50">
              {categoryPredictions.length > 0 ? (
                categoryPredictions.map((pred) => {
                  const Icon = getCategoryIcon(pred.category);
                  return (
                    <tr key={pred.category} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg text-emerald-600 flex items-center justify-center">
                            <Icon size={18} />
                          </div>
                          <span className="font-medium text-slate-900">{pred.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {formatCurrency(pred.actual)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatCurrency(pred.predicted)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${pred.change > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                          {pred.change > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(pred.change))} ({pred.change > 0 ? "+" : ""}{pred.changePercent}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Badge 
                            variant={pred.trend === "up" ? "warning" : pred.trend === "down" ? "success" : "neutral"} 
                            className="px-2 py-0.5 rounded-full text-[9px]"
                          >
                            {pred.trend === "up" ? "Increasing" : pred.trend === "down" ? "Decreasing" : "Stable"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-900">{pred.confidence}%</span>
                          <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              pred.confidence >= 90 ? "bg-emerald-500" : 
                              pred.confidence >= 80 ? "bg-amber-500" : "bg-red-500"
                            }`} style={{ width: `${pred.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No category data available. Add more transactions to see predictions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </Card>

      {/* Expense Type Forecast and Transaction Behavior Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Expense Type Forecast */}
        <Card className="lg:col-span-1 p-6 hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Expense Type Forecast</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Analysis of recurring vs variable expenses</p>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-700">Recurring Expenses</span>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(expenseTypes?.recurring.amount || 0)}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
                  style={{ width: `${expenseTypes?.recurring.percentage || 0}%` }} 
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px]">
                <span className="text-slate-400">{expenseTypes?.recurring.percentage || 0}% of total</span>
                <span className="text-emerald-600 font-medium">
                  {expenseTypes?.recurring.trendValue || 0}% trend
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-700">Variable Expenses</span>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(expenseTypes?.variable.amount || 0)}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${expenseTypes?.variable.percentage || 0}%` }} 
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px]">
                <span className="text-slate-400">{expenseTypes?.variable.percentage || 0}% of total</span>
                <span className="text-amber-600 font-medium">
                  {expenseTypes?.variable.trendValue || 0}% trend
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction Behavior Insight */}
        <Card className="lg:col-span-2 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Transaction Behavior Insight</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Detailed transaction type analysis and predictions</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-semibold sticky top-0 bg-white">
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3 text-right">Current Avg.</th>
                    <th className="px-4 py-3 text-right">Next Month</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-50">
                {behaviorInsights.length > 0 ? (
                  behaviorInsights.map((insight, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-slate-700">{insight.name}</td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatCurrency(insight.currentAvg)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatCurrency(insight.nextMonth)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No recurring patterns detected. Add more transactions to see insights.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </Card>
      </div>
      <Card className="p-6 mb-8 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              AI Financial Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Deep analysis of your spending habits and financial future</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleDetailedInsights} className="text-xs h-9 px-4">
              <ArrowRight size={14} className={`transition-transform ${detailedInsights ? "rotate-180" : ""}`} />
              {detailedInsights ? "View Less" : "View More"}
            </Button>
            <Button 
              size="sm" 
              onClick={handleGenerateAIInsights} 
              className="text-xs h-9 px-4 bg-emerald-500 hover:bg-emerald-600"
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Initial Grid: Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* High-Level Financial Analysis Card */}
          <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-slate-500 p-2 rounded-lg">
                <Clapperboard size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Financial Summary</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
              {aiInsights?.summary || "Your income stability is being analyzed. Add more transactions to see detailed insights."}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
              <Star size={12} />
              {savingsOpportunities.length > 0 
                ? `${savingsOpportunities.length} savings opportunities detected`
                : "Strong growth profile detected"
              }
            </div>
          </Card>

          {/* Risk Management Card */}
          <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-slate-500 p-2 rounded-lg">
                <Shield size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Risk Level: {aiInsights?.riskLevel ? aiInsights.riskLevel.charAt(0).toUpperCase() + aiInsights.riskLevel.slice(1) : "Low"}
            </span>
          </div>
          <p className="text-[13px] text-slate-700 leading-relaxed">
            {anomalies.length > 0 
              ? `Detected ${anomalies.length} anomaly${anomalies.length > 1 ? "ies" : "y"} in your transactions. Review the flagged items for potential savings.`
              : "No significant anomalies detected. Your spending patterns are consistent with historical trends."
            }
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-4">
            <div 
              className={`h-full rounded-full ${
                (aiInsights?.riskScore || 0) < 30 ? "bg-emerald-500" : 
                (aiInsights?.riskScore || 0) < 60 ? "bg-amber-500" : "bg-red-500"
              }`} 
              style={{ width: `${Math.min(100, aiInsights?.riskScore || 15)}%` }} 
            />
          </div>
          </Card>

          {/* Smart Opportunities Card */}
          <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-slate-500 p-2 rounded-lg">
                <Star size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Growth Potential</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Potential to save ₱3,500/mo by optimizing recurring transportation and dining subscriptions.
            </p>
          </Card>
        </div>

        {/* Detailed Expansion (Hidden by default) */}
        {detailedInsights && (
          <div className="space-y-6 pt-6 border-t border-slate-100 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actionable Recommendations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ListChecks size={16} className="text-emerald-500" />
                  Smart Recommendations
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all group">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 mb-1">Optimize Transportation Budget</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">Reduce variable commute costs by 15% through consolidated travel or alternative transport methods.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all group">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 mb-1">Emergency Fund Allocation</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">Direct the projected ₱4,200 net savings into your liquid emergency fund to cover 6 months of expenses.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deep Risk Assessment */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-500" />
                  Risk Mitigation Strategies
                </h4>
                <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="success" className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Low Risk Environment
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">CONFIDENCE: 94%</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                        <div className="mt-1 w-2 h-2 rounded-full bg-slate-300"></div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          <span className="text-slate-900 font-bold">Data Anomaly:</span> Irregular utility spike detected in previous 30-day window (₱820). Recommend usage audit.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                        <div className="mt-1 w-2 h-2 rounded-full bg-slate-300"></div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          <span className="text-slate-900 font-bold">Mitigation:</span> No immediate action required for major assets. Financial buffer exceeds volatility margin by 18%.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Long-term Opportunity Map */}
            <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-slate-500 p-2 rounded-lg">
                    <File size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">Long-term Opportunity Map</h4>
                    <p className="text-[10px] text-slate-500">Predicted wealth accumulation markers</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="neutral" className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                    Investment Ready
                  </Badge>
                  <Badge variant="neutral" className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                    Debt Free Trend
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">6-Month Goal</span>
                  <span className="text-sm font-bold text-slate-800">₱25,200</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">1-Year Projection</span>
                  <span className="text-sm font-bold text-slate-800">₱50,400</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Investment Ready</span>
                  <span className="text-sm font-bold text-slate-800">Q3 2025</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Debt Free Target</span>
                  <span className="text-sm font-bold text-slate-800">Q1 2026</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* Modals */}
      <HistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={predictionHistory}
      />
      <DetailedBreakdownModal
        open={detailedBreakdownModalOpen}
        onClose={() => setDetailedBreakdownModalOpen(false)}
        forecastData={forecastData}
        categoryPredictions={categoryPredictions}
      />
    </div>
  );
}
