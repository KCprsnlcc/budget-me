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
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { toast } from "sonner";
import { 
  HistoryModal,
  DetailedBreakdownModal,
  AIFinancialIntelligence,
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
import { useState, useCallback, useEffect, useRef } from "react";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { checkAIUsage, incrementAIUsage, AIUsageStatus } from "../_lib/ai-rate-limit-service";
import {
  exportPredictionsToCSV,
  exportPredictionsToPDF,
  type PredictionExportData,
  type CategoryPredictionExportData,
  type AIInsightsExportData,
} from "@/lib/export-utils";

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
  const [loading, setLoading] = useState(false);
  const [isCheckingExistingData, setIsCheckingExistingData] = useState(true);
  const [hasGeneratedPredictions, setHasGeneratedPredictions] = useState(false);
  const [hasGeneratedInsights, setHasGeneratedInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<{month: string, year?: number, type: 'income' | 'expense', value: number, dataType: 'historical' | 'predicted', index: number} | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isFilteringYear, setIsFilteringYear] = useState(false);
  
  // Responsive state management
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };

    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [exportDropdownOpen]);

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
    riskAnalysis: string;
    growthPotential: string;
    growthAnalysis: string;
    recommendations: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
      category: string;
    }>;
    riskMitigationStrategies: Array<{
      strategy: string;
      description: string;
      impact: "high" | "medium" | "low";
    }>;
    longTermOpportunities: Array<{
      opportunity: string;
      description: string;
      timeframe: string;
      potentialReturn: string;
    }>;
  } | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  
  // AI Rate Limit State
  const [rateLimitStatus, setRateLimitStatus] = useState<AIUsageStatus | null>(null);

  // Fetch all prediction data - only called explicitly after user action
  const fetchPredictions = useCallback(async (isInitialLoad = false) => {
    if (!user?.id) return;

    // Skip automatic fetch on initial load - require explicit user action
    if (isInitialLoad) {
      return;
    }

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
        history,
      ] = await Promise.all([
        generateIncomeExpenseForecast(user.id),
        generateCategoryForecast(user.id),
        analyzeExpenseTypes(user.id),
        analyzeTransactionBehavior(user.id),
        generatePredictionSummary(user.id),
        detectAnomalies(user.id),
        generateSavingsOpportunities(user.id),
        fetchPredictionHistory(user.id),
      ]);

      setForecastData(forecast);
      setCategoryPredictions(categories);
      setExpenseTypes(expenseTypeData);
      setBehaviorInsights(behavior);
      setSummary(summaryData);
      setAnomalies(anomaliesData);
      setSavingsOpportunities(savings);
      setPredictionHistory(history);
      
      setHasGeneratedPredictions(true);
      
      // Try to fetch latest AI insights from database
      try {
        const { fetchLatestAIInsights } = await import("./_lib/ai-insights-service");
        const latestInsights = await fetchLatestAIInsights(user.id);
        if (latestInsights) {
          setAiInsights({
            summary: latestInsights.financialSummary,
            riskLevel: latestInsights.riskLevel,
            riskScore: latestInsights.riskScore,
            riskAnalysis: latestInsights.riskAnalysis,
            growthPotential: latestInsights.growthPotential,
            growthAnalysis: latestInsights.growthAnalysis,
            recommendations: latestInsights.recommendations,
            riskMitigationStrategies: latestInsights.riskMitigationStrategies,
            longTermOpportunities: latestInsights.longTermOpportunities,
          });
          setHasGeneratedInsights(true);
        }
      } catch (error) {
        console.error("Error fetching AI insights:", error);
        // Silent fail - AI insights are optional
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Removed automatic initial load - predictions only fetched on explicit user action
  // useEffect(() => {
  //   if (user?.id) {
  //     fetchPredictions();
  //   }
  // }, [user?.id, fetchPredictions]);

  // Check for existing saved data on initial load - ONLY fetch from database, don't regenerate
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsCheckingExistingData(false);
        return;
      }
      
      try {
        // Fetch prediction history to check for existing data
        const history = await fetchPredictionHistory(user.id);
        
        if (history && history.length > 0) {
          // User has existing predictions - just load the history
          setPredictionHistory(history);
          
          // Get the most recent prediction data from history
          const latestPrediction = history[0];
          
          // Use the full saved data if available, otherwise reconstruct from summary
          if (latestPrediction.fullForecastData) {
            // Full data is available - use it directly
            setForecastData(latestPrediction.fullForecastData);
            setHasGeneratedPredictions(true);
            
            if (latestPrediction.fullCategoryPredictions) {
              setCategoryPredictions(latestPrediction.fullCategoryPredictions);
            }
            
            if (latestPrediction.fullExpenseTypes) {
              setExpenseTypes(latestPrediction.fullExpenseTypes);
            }
            
            if (latestPrediction.fullBehaviorInsights) {
              setBehaviorInsights(latestPrediction.fullBehaviorInsights);
            }
            
            // Reconstruct summary from saved data
            setSummary({
              monthlyIncome: latestPrediction.projectedIncome || 0,
              monthlyExpenses: latestPrediction.projectedExpenses || 0,
              netBalance: (latestPrediction.projectedIncome || 0) - (latestPrediction.projectedExpenses || 0),
              savingsRate: latestPrediction.projectedIncome && latestPrediction.projectedIncome > 0
                ? ((latestPrediction.projectedSavings || 0) / latestPrediction.projectedIncome) * 100
                : 0,
              incomeChange: latestPrediction.incomeGrowth || null,
              expenseChange: latestPrediction.expenseGrowth || null,
            });
          } else if (latestPrediction.projectedIncome !== undefined) {
            // Fallback: reconstruct from summary data (for older predictions)
            setHasGeneratedPredictions(true);
            
            const reconstructedForecast = {
              historical: [] as MonthlyForecast[],
              predicted: [
                {
                  month: "Next",
                  income: latestPrediction.projectedIncome || 0,
                  expense: latestPrediction.projectedExpenses || 0,
                  type: "predicted" as const,
                }
              ],
              summary: {
                avgGrowth: latestPrediction.incomeGrowth || 0,
                maxSavings: latestPrediction.projectedSavings || 0,
                confidence: latestPrediction.accuracy || 0,
                trendDirection: "stable" as const,
                trendStrength: 0,
                seasonalityStrength: 0,
                changepoints: [],
                modelDetails: {
                  seasonalityMode: "multiplicative" as const,
                  yearlySeasonality: true,
                  weeklySeasonality: false,
                  changepointPriorScale: 0.05,
                  seasonalityPriorScale: 10,
                  uncertaintySamples: 1000,
                },
              },
            };
            
            setForecastData(reconstructedForecast);
            
            if (latestPrediction.topCategories && latestPrediction.topCategories.length > 0) {
              const reconstructedCategories: CategoryPrediction[] = latestPrediction.topCategories.map(cat => ({
                category: cat.category,
                predicted: cat.amount,
                actual: cat.amount * 0.95,
                confidence: 85,
                trend: cat.trend as "up" | "down" | "stable",
                change: cat.amount * 0.05,
                changePercent: 5,
                insight: `${cat.category} spending analysis`,
              }));
              setCategoryPredictions(reconstructedCategories);
            }
            
            if (latestPrediction.recurringExpenses !== undefined || latestPrediction.variableExpenses !== undefined) {
              const total = (latestPrediction.recurringExpenses || 0) + (latestPrediction.variableExpenses || 0);
              setExpenseTypes({
                recurring: {
                  amount: latestPrediction.recurringExpenses || 0,
                  percentage: total > 0 ? Math.round(((latestPrediction.recurringExpenses || 0) / total) * 100) : 0,
                  trend: "stable",
                  trendValue: 0,
                },
                variable: {
                  amount: latestPrediction.variableExpenses || 0,
                  percentage: total > 0 ? Math.round(((latestPrediction.variableExpenses || 0) / total) * 100) : 0,
                  trend: "up",
                  trendValue: 2.5,
                },
              });
            }
            
            if (latestPrediction.transactionPatterns && latestPrediction.transactionPatterns.length > 0) {
              const reconstructedBehavior: TransactionBehaviorInsight[] = latestPrediction.transactionPatterns.map(pattern => ({
                type: pattern.type,
                name: `${pattern.type} Transactions`,
                currentAvg: pattern.avgAmount,
                nextMonth: pattern.avgAmount * 1.02,
                trend: pattern.trend as "up" | "down" | "stable",
                confidence: 85,
              }));
              setBehaviorInsights(reconstructedBehavior);
            }
            
            setSummary({
              monthlyIncome: latestPrediction.projectedIncome || 0,
              monthlyExpenses: latestPrediction.projectedExpenses || 0,
              netBalance: (latestPrediction.projectedIncome || 0) - (latestPrediction.projectedExpenses || 0),
              savingsRate: latestPrediction.projectedIncome && latestPrediction.projectedIncome > 0
                ? ((latestPrediction.projectedSavings || 0) / latestPrediction.projectedIncome) * 100
                : 0,
              incomeChange: latestPrediction.incomeGrowth || null,
              expenseChange: latestPrediction.expenseGrowth || null,
            });
          }
          
          // Try to fetch latest AI insights from database
          try {
            const { fetchLatestAIInsights } = await import("./_lib/ai-insights-service");
            const latestInsights = await fetchLatestAIInsights(user.id);
            if (latestInsights) {
              setAiInsights({
                summary: latestInsights.financialSummary,
                riskLevel: latestInsights.riskLevel,
                riskScore: latestInsights.riskScore,
                riskAnalysis: latestInsights.riskAnalysis,
                growthPotential: latestInsights.growthPotential,
                growthAnalysis: latestInsights.growthAnalysis,
                recommendations: latestInsights.recommendations,
                riskMitigationStrategies: latestInsights.riskMitigationStrategies,
                longTermOpportunities: latestInsights.longTermOpportunities,
              });
              setHasGeneratedInsights(true);
            }
          } catch (error) {
            console.error("Error fetching AI insights:", error);
            // Silent fail - AI insights are optional
          }
        }
      } catch (error) {
        console.error("Error checking for existing predictions:", error);
        // Silent fail - no existing data is not an error
      } finally {
        setIsCheckingExistingData(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Fetch AI rate limit status
  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { status } = await checkAIUsage(user.id, "predictions");
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

  const handleHistory = useCallback(() => {
    setHistoryModalOpen(true);
  }, []);

  const handleDetailedBreakdown = useCallback(() => {
    setDetailedBreakdownModalOpen(true);
  }, []);

  const toggleDetailedInsights = useCallback(() => {
    setDetailedInsights(prev => !prev);
  }, []);

  // Handle year filter change with skeleton loader
  const handleYearChange = useCallback((year: string) => {
    setIsFilteringYear(true);
    setSelectedYear(year);
    // Show skeleton for 300ms to give visual feedback
    setTimeout(() => {
      setIsFilteringYear(false);
    }, 300);
  }, []);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    if (!forecastData && categoryPredictions.length === 0 && !aiInsights) {
      return;
    }

    // Prepare forecast data
    const forecastExportData: PredictionExportData[] = [
      ...(forecastData?.historical || []).map((d) => ({
        month: d.month,
        type: "Historical",
        income: d.income,
        expense: d.expense,
        netSavings: d.income - d.expense,
      })),
      ...(forecastData?.predicted || []).map((d) => ({
        month: d.month,
        type: "Predicted",
        income: d.income,
        expense: d.expense,
        netSavings: d.income - d.expense,
      })),
    ];

    // Prepare category predictions data
    const categoryExportData: CategoryPredictionExportData[] = categoryPredictions.map((pred) => ({
      category: pred.category,
      historicalAvg: pred.actual,
      predicted: pred.predicted,
      change: pred.change,
      changePercent: `${pred.changePercent}%`,
      trend: pred.trend === "up" ? "Increasing" : pred.trend === "down" ? "Decreasing" : "Stable",
      confidence: `${pred.confidence}%`,
    }));

    // Prepare AI insights data
    const aiInsightsExportData: AIInsightsExportData | null = aiInsights ? {
      summary: aiInsights.summary,
      riskLevel: aiInsights.riskLevel.toUpperCase(),
      riskScore: aiInsights.riskScore,
      riskAnalysis: aiInsights.riskAnalysis,
      growthPotential: aiInsights.growthPotential,
      growthAnalysis: aiInsights.growthAnalysis,
      recommendations: aiInsights.recommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        priority: rec.priority.toUpperCase(),
        category: rec.category,
      })),
      riskMitigationStrategies: aiInsights.riskMitigationStrategies.map(strategy => ({
        strategy: strategy.strategy,
        description: strategy.description,
        impact: strategy.impact.toUpperCase(),
      })),
      longTermOpportunities: aiInsights.longTermOpportunities.map(opp => ({
        opportunity: opp.opportunity,
        description: opp.description,
        timeframe: opp.timeframe,
        potentialReturn: opp.potentialReturn,
      })),
    } : null;

    exportPredictionsToCSV(forecastExportData, categoryExportData, aiInsightsExportData);
  }, [forecastData, categoryPredictions, aiInsights]);

  const handleExportPDF = useCallback(() => {
    if (!forecastData && categoryPredictions.length === 0 && !aiInsights) {
      return;
    }

    // Prepare forecast data
    const forecastExportData: PredictionExportData[] = [
      ...(forecastData?.historical || []).map((d) => ({
        month: d.month,
        type: "Historical",
        income: d.income,
        expense: d.expense,
        netSavings: d.income - d.expense,
      })),
      ...(forecastData?.predicted || []).map((d) => ({
        month: d.month,
        type: "Predicted",
        income: d.income,
        expense: d.expense,
        netSavings: d.income - d.expense,
      })),
    ];

    // Prepare category predictions data
    const categoryExportData: CategoryPredictionExportData[] = categoryPredictions.map((pred) => ({
      category: pred.category,
      historicalAvg: pred.actual,
      predicted: pred.predicted,
      change: pred.change,
      changePercent: `${pred.changePercent}%`,
      trend: pred.trend === "up" ? "Increasing" : pred.trend === "down" ? "Decreasing" : "Stable",
      confidence: `${pred.confidence}%`,
    }));

    // Prepare summary
    const exportSummary = {
      avgGrowth: forecastData?.summary.avgGrowth || 0,
      maxSavings: forecastData?.summary.maxSavings || 0,
      confidence: forecastData?.summary.confidence || 0,
      projectedIncome: forecastData?.predicted?.[0]?.income || 0,
      projectedExpense: forecastData?.predicted?.[0]?.expense || 0,
      projectedSavings: (forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0),
    };

    // Prepare AI insights data
    const aiInsightsExportData: AIInsightsExportData | null = aiInsights ? {
      summary: aiInsights.summary,
      riskLevel: aiInsights.riskLevel.toUpperCase(),
      riskScore: aiInsights.riskScore,
      riskAnalysis: aiInsights.riskAnalysis,
      growthPotential: aiInsights.growthPotential,
      growthAnalysis: aiInsights.growthAnalysis,
      recommendations: aiInsights.recommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        priority: rec.priority.toUpperCase(),
        category: rec.category,
      })),
      riskMitigationStrategies: aiInsights.riskMitigationStrategies.map(strategy => ({
        strategy: strategy.strategy,
        description: strategy.description,
        impact: strategy.impact.toUpperCase(),
      })),
      longTermOpportunities: aiInsights.longTermOpportunities.map(opp => ({
        opportunity: opp.opportunity,
        description: opp.description,
        timeframe: opp.timeframe,
        potentialReturn: opp.potentialReturn,
      })),
    } : null;

    exportPredictionsToPDF(forecastExportData, categoryExportData, exportSummary, aiInsightsExportData);
  }, [forecastData, categoryPredictions, aiInsights]);

  const handleGeneratePredictions = useCallback(async () => {
    if (!user?.id) return;

    // Check rate limit before generating
    const { allowed, error: limitError } = await checkAIUsage(user.id, "predictions");
    if (!allowed) {
      toast.error("Daily limit reached", {
        description: limitError || "You've reached your daily limit for AI Predictions. Try again tomorrow.",
      });
      return;
    }

    setIsGenerating(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Generating predictions...", {
      description: "Analyzing your financial data with AI",
    });

    try {
      // Increment usage
      const { success: incrementSuccess } = await incrementAIUsage(user.id, "predictions");
      if (!incrementSuccess) {
        toast.error("Failed to track usage", {
          description: "Please try again",
        });
        setIsGenerating(false);
        return;
      }

      // Refresh rate limit status
      const { status } = await checkAIUsage(user.id, "predictions");
      setRateLimitStatus(status);

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

      // Calculate growth percentages
      const incomeGrowth = newSummaryData.incomeChange || 0;
      const expenseGrowth = newSummaryData.expenseChange || 0;
      const currentSavings = newSummaryData.monthlyIncome - newSummaryData.monthlyExpenses;
      const prevIncome = newSummaryData.incomeChange 
        ? newSummaryData.monthlyIncome / (1 + newSummaryData.incomeChange / 100)
        : newSummaryData.monthlyIncome;
      const prevExpenses = newSummaryData.expenseChange
        ? newSummaryData.monthlyExpenses / (1 + newSummaryData.expenseChange / 100)
        : newSummaryData.monthlyExpenses;
      const prevSavings = prevIncome - prevExpenses;
      const savingsGrowth = prevSavings !== 0 
        ? ((currentSavings - prevSavings) / Math.abs(prevSavings)) * 100
        : 0;

      // Save prediction with comprehensive data including full forecast
      await savePrediction(user.id, {
        type: "predictions",
        insights: [
          ...(anomalies || []),
          ...(savingsOpportunities || []),
        ],
        dataPoints: newForecast?.historical.length || 0,
        accuracy: newForecast?.summary.confidence,
        projectedIncome: newSummaryData.monthlyIncome,
        projectedExpenses: newSummaryData.monthlyExpenses,
        projectedSavings: currentSavings,
        incomeGrowth,
        expenseGrowth,
        savingsGrowth,
        categoriesAnalyzed: newCategories?.length || 0,
        topCategories: newCategories?.slice(0, 5).map(cat => ({
          category: cat.category,
          amount: cat.predicted,
          trend: cat.trend,
        })) || [],
        recurringExpenses: newExpenseTypeData?.recurring.amount || 0,
        variableExpenses: newExpenseTypeData?.variable.amount || 0,
        transactionPatterns: newBehavior?.slice(0, 3).map(b => ({
          type: b.type,
          avgAmount: b.currentAvg,
          trend: b.trend,
        })) || [],
        anomaliesDetected: anomalies?.length || 0,
        savingsOpportunities: savingsOpportunities?.length || 0,
        // Store complete forecast data for reconstruction
        fullForecastData: newForecast,
        fullCategoryPredictions: newCategories,
        fullExpenseTypes: newExpenseTypeData,
        fullBehaviorInsights: newBehavior,
      });

      // Update only the prediction-related states
      setForecastData(newForecast);
      setCategoryPredictions(newCategories);
      setExpenseTypes(newExpenseTypeData);
      setBehaviorInsights(newBehavior);
      setSummary(newSummaryData);
      setHasGeneratedPredictions(true);
      
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
    if (!user?.id || !forecastData || !summary || !expenseTypes) return;

    // Check rate limit before generating
    const { allowed, error: limitError } = await checkAIUsage(user.id, "insights");
    if (!allowed) {
      toast.error("Daily limit reached", {
        description: limitError || "You've reached your daily limit for AI Insights. Try again tomorrow.",
      });
      return;
    }

    setIsGeneratingInsights(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Generating AI insights...", {
      description: "Analyzing your spending patterns with OpenRouter AI",
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

      // Import AI insights service
      const { generateAIFinancialInsights } = await import("./_lib/ai-insights-service");

      // Generate comprehensive AI insights using OpenRouter API
      const aiResponse = await generateAIFinancialInsights({
        userId: user.id,
        forecastData,
        categoryPredictions,
        expenseTypes,
        behaviorInsights,
        summary,
      });

      // Update AI insights state with full structure
      setAiInsights({
        summary: aiResponse.financialSummary,
        riskLevel: aiResponse.riskLevel,
        riskScore: aiResponse.riskScore,
        riskAnalysis: aiResponse.riskAnalysis,
        growthPotential: aiResponse.growthPotential,
        growthAnalysis: aiResponse.growthAnalysis,
        recommendations: aiResponse.recommendations,
        riskMitigationStrategies: aiResponse.riskMitigationStrategies,
        longTermOpportunities: aiResponse.longTermOpportunities,
      });

      // Also update anomalies and savings opportunities
      const [newAnomalies, newSavings] = await Promise.all([
        detectAnomalies(user.id),
        generateSavingsOpportunities(user.id),
      ]);

      setAnomalies(newAnomalies);
      setSavingsOpportunities(newSavings);
      setHasGeneratedInsights(true);
      
      // Dismiss loading toast and show success
      toast.success("AI insights generated successfully", {
        id: loadingToast,
        description: "Your financial intelligence has been updated with real AI analysis",
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
  }, [user?.id, forecastData, categoryPredictions, expenseTypes, behaviorInsights, summary]);

  // Combine historical and predicted for chart display
  const chartData = [
    ...(forecastData?.historical || []),
    ...(forecastData?.predicted || []),
  ];

  // Extract unique years from chart data
  const availableYears = Array.from(new Set(chartData.map(d => d.year).filter(Boolean))).sort();
  
  // Filter chart data by selected year
  const filteredChartData = selectedYear === "all" || selectedYear === "" 
    ? chartData 
    : chartData.filter(d => d.year?.toString() === selectedYear);

  // Calculate percentages for visualization
  const maxChartValue = Math.max(
    ...filteredChartData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  // Loading state for explicit generation or initial data check
  if (loading || isCheckingExistingData) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
          {/* Page Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Skeleton width={180} height={28} className="mb-0" />
                <Skeleton width={80} height={16} />
              </div>
              <Skeleton width={280} height={14} />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Skeleton width={140} height={32} borderRadius={4} className="order-2 sm:order-1" />
              <Skeleton width={80} height={32} borderRadius={4} />
              <Skeleton width={100} height={32} borderRadius={4} />
            </div>
          </div>

          {/* Scrollable Content Area for Mobile/Tablet - Skeleton */}
          <div className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0">
            {/* Prediction Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <Skeleton width={36} height={36} borderRadius={8} />
                    <Skeleton width={70} height={18} borderRadius={10} />
                  </div>
                  <Skeleton width={100} height={14} className="mb-2" />
                  <Skeleton width={120} height={22} />
                </Card>
              ))}
            </div>

            {/* Interactive Prediction Chart Skeleton */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <Skeleton width={200} height={14} className="mb-2" />
                  <Skeleton width={160} height={12} />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1 sm:gap-1.5">
                      <Skeleton width={10} height={10} circle className="sm:w-3 sm:h-3" />
                      <Skeleton width={80} height={10} className="sm:w-24" />
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton height={192} className="sm:h-60" />
              <div className="flex justify-between mt-3 sm:mt-4 px-2 sm:px-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} width={30} height={10} className="sm:w-10" />
                ))}
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Skeleton width={60} height={10} />
                    <Skeleton width={40} height={12} />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Skeleton width={60} height={10} />
                    <Skeleton width={50} height={12} />
                  </div>
                </div>
                <Skeleton width={140} height={24} borderRadius={4} />
              </div>
            </Card>

            {/* Category Predictions Table Skeleton */}
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Skeleton width={180} height={14} className="mb-2" />
                  <Skeleton width={160} height={12} />
                </div>
                <Skeleton width={160} height={32} borderRadius={4} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      {['Category', 'Historical Avg.', 'Predicted', 'Change', 'Trend', 'Confidence'].map((header, i) => (
                        <th key={i} className="px-4 sm:px-6 py-3 sm:py-4">
                          <Skeleton width={60} height={12} className="sm:w-20" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton width={28} height={28} borderRadius={6} className="sm:w-8 sm:h-8" />
                            <Skeleton width={80} height={12} className="sm:w-28" />
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <Skeleton width={60} height={12} className="sm:w-20 ml-auto" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <Skeleton width={60} height={12} className="sm:w-20 ml-auto" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <Skeleton width={80} height={12} className="sm:w-24 ml-auto" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <Skeleton width={60} height={16} borderRadius={8} className="sm:w-20 mx-auto" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <Skeleton width={50} height={12} className="sm:w-16" />
                          <Skeleton width={40} height={4} borderRadius={2} className="mt-1 sm:w-12" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Expense Type Forecast and Transaction Behavior Insight Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Expense Type Forecast Skeleton */}
              <Card className="p-4 sm:p-6">
                <div className="mb-4">
                  <Skeleton width={160} height={14} className="mb-2" />
                  <Skeleton width={140} height={12} />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton width={100} height={12} className="sm:w-32" />
                        <Skeleton width={50} height={12} className="sm:w-20" />
                      </div>
                      <Skeleton height={6} borderRadius={3} className="sm:h-1.5" />
                      <div className="flex justify-between items-center mt-2">
                        <Skeleton width={50} height={10} />
                        <Skeleton width={60} height={10} className="sm:w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Transaction Behavior Insight Skeleton */}
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="mb-2">
                    <Skeleton width={180} height={14} className="mb-2" />
                    <Skeleton width={160} height={12} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-3 sm:px-4 py-2 sm:py-3">
                          <Skeleton width={100} height={12} className="sm:w-32" />
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                          <Skeleton width={60} height={12} className="sm:w-24 ml-auto" />
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                          <Skeleton width={60} height={12} className="sm:w-24 ml-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <Skeleton width={80} height={12} className="sm:w-28" />
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                            <Skeleton width={60} height={12} className="sm:w-20 ml-auto" />
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                            <Skeleton width={60} height={12} className="sm:w-20 ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* AI Financial Intelligence Skeleton */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <Skeleton width={180} height={14} className="mb-2" />
                  <Skeleton width={220} height={12} />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Skeleton width={80} height={32} borderRadius={4} className="flex-1 sm:flex-none" />
                  <Skeleton width={100} height={32} borderRadius={4} className="flex-1 sm:flex-none" />
                </div>
              </div>

              {/* Initial Grid: Key Highlights Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 sm:p-5 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton width={36} height={36} borderRadius={8} className="sm:w-10 sm:h-10" />
                      <Skeleton width={120} height={12} className="sm:w-40" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Skeleton width="100%" height={12} className="sm:h-3" />
                      <Skeleton width="90%" height={12} className="sm:h-3" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton width={14} height={14} borderRadius={4} />
                      <Skeleton width={120} height={10} className="sm:w-36" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in h-full flex flex-col overflow-hidden lg:overflow-visible">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-0 pt-4 sm:pt-0 shrink-0">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">AI Predictions</h2>
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-full">
              <Cpu size={10} className="sm:w-3 sm:h-3" /> AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Smart forecasts and insights powered by Prophet machine learning.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            size="sm" 
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto" 
            onClick={handleGeneratePredictions}
            disabled={isGenerating || !rateLimitStatus?.canUseAI}
            title={!rateLimitStatus?.canUseAI ? "Daily AI limit reached (25/day)" : ""}
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={14} className="sm:w-4 sm:h-4" />
                <span className="ml-2">Generate Predictions</span>
              </>
            )}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none" ref={exportDropdownRef}>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              >
                <Download size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
                <MoreHorizontal size={12} className="ml-1" />
              </Button>
              {/* Dropdown */}
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 z-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      handleExportPDF();
                      setExportDropdownOpen(false);
                    }}
                  >
                    <span className="text-rose-500 mr-2">PDF</span> Export as PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      handleExportCSV();
                      setExportDropdownOpen(false);
                    }}
                  >
                    <span className="text-emerald-500 mr-2">CSV</span> Export as CSV
                  </Button>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleHistory}>
              <History size={14} className="sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">View History</span>
              <span className="sm:hidden">History</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area for Mobile/Tablet */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto lg:overflow-visible space-y-4 sm:space-y-6 px-4 sm:px-0 pb-4 sm:pb-0 scroll-smooth"
      >

      {/* Prediction Summary Cards - No Data State */}
      {!hasGeneratedPredictions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Projected Income Growth Card - No Data */}
          <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="text-slate-300 p-2 rounded-lg">
                <TrendingUp size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-slate-400 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Projected Income Growth</div>
            <div className="flex flex-col items-center justify-center py-3 sm:py-4 text-center">
              <Brain size={20} className="sm:w-6 sm:h-6 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 mb-1">No predictions yet</p>
              <p className="text-[10px] text-slate-400">Generate to see forecast</p>
            </div>
          </Card>

          {/* Projected Expense Growth Card - No Data */}
          <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="text-slate-300 p-2 rounded-lg">
                <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-slate-400 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Projected Expense Growth</div>
            <div className="flex flex-col items-center justify-center py-3 sm:py-4 text-center">
              <Brain size={20} className="sm:w-6 sm:h-6 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 mb-1">No predictions yet</p>
              <p className="text-[10px] text-slate-400">Generate to see forecast</p>
            </div>
          </Card>

          {/* Projected Savings Growth Card - No Data */}
          <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="text-slate-300 p-2 rounded-lg">
                <PiggyBank size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-slate-400 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Projected Savings Growth</div>
            <div className="flex flex-col items-center justify-center py-3 sm:py-4 text-center">
              <Brain size={20} className="sm:w-6 sm:h-6 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 mb-1">No predictions yet</p>
              <p className="text-[10px] text-slate-400">Generate to see forecast</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Projected Income Growth Card */}
        <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="text-slate-500 p-2 rounded-lg">
              <TrendingUp size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
              ((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.income || 0)) >= 0 
                ? "text-emerald-700 border-emerald-100" 
                : "text-red-700 border-red-100"
            }`}>
              {((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.income || 0)) >= 0 ? <ArrowUp size={10} className="sm:w-3 sm:h-3" /> : <ArrowDown size={10} className="sm:w-3 sm:h-3" />}
              {((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.income || 0)) >= 0 ? "+" : ""}
              {forecastData?.historical && forecastData.historical[forecastData.historical.length - 1]?.income > 0 
                ? (((forecastData?.predicted?.[0]?.income || 0) - (forecastData.historical[forecastData.historical.length - 1]?.income || 0)) / (forecastData.historical[forecastData.historical.length - 1]?.income || 1) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Projected Income Growth</div>
          <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency(forecastData?.predicted?.[0]?.income || 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Next month projection
          </div>
        </Card>

        {/* Projected Expense Growth Card */}
        <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="text-slate-500 p-2 rounded-lg">
              <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
              ((forecastData?.predicted?.[0]?.expense || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.expense || 0)) <= 0 
                ? "text-emerald-700 border-emerald-100" 
                : "text-amber-700 border-amber-100"
            }`}>
              {((forecastData?.predicted?.[0]?.expense || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.expense || 0)) <= 0 ? <ArrowDown size={10} className="sm:w-3 sm:h-3" /> : <ArrowUp size={10} className="sm:w-3 sm:h-3" />}
              {((forecastData?.predicted?.[0]?.expense || 0) - (forecastData?.historical?.[forecastData?.historical.length - 1]?.expense || 0)) <= 0 ? "" : "+"}
              {forecastData?.historical && forecastData.historical[forecastData.historical.length - 1]?.expense > 0 
                ? (((forecastData?.predicted?.[0]?.expense || 0) - (forecastData.historical[forecastData.historical.length - 1]?.expense || 0)) / (forecastData.historical[forecastData.historical.length - 1]?.expense || 1) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Projected Expense Growth</div>
          <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency(forecastData?.predicted?.[0]?.expense || 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Next month projection
          </div>
        </Card>

        {/* Projected Savings Growth Card */}
        <Card className="p-4 sm:p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="text-slate-500 p-2 rounded-lg">
              <PiggyBank size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
              ((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0)) >= (forecastData?.predicted?.[0]?.income || 0) * 0.10 
                ? "text-emerald-700 border-emerald-100" 
                : ((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0)) >= (forecastData?.predicted?.[0]?.income || 0) * 0.05
                ? "text-amber-700 border-amber-100"
                : "text-red-700 border-red-100"
            }`}>
              <ChartBar size={10} className="sm:w-3 sm:h-3" />
              {forecastData?.predicted?.[0]?.income && forecastData.predicted[0].income > 0 
                ? (((forecastData.predicted[0].income || 0) - (forecastData.predicted[0]?.expense || 0)) / (forecastData.predicted[0].income || 1) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div className="text-slate-500 text-[10px] sm:text-xs font-medium mb-1 uppercase tracking-wide">Projected Savings Growth</div>
          <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            {formatCurrency((forecastData?.predicted?.[0]?.income || 0) - (forecastData?.predicted?.[0]?.expense || 0))}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
            Next month projection
          </div>
        </Card>
      </div>
      )}

      {/* Interactive Prediction Chart - No Data State */}
      {!hasGeneratedPredictions ? (
        <Card className="p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Income vs Expenses Forecast</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Prophet ML predictions with confidence intervals</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
              <TrendingUp size={24} className="sm:w-8 sm:h-8 text-slate-300" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Forecast Data Available</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
              Generate predictions to see your income and expense forecasts powered by Prophet machine learning.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Income vs Expenses Forecast</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Prophet ML predictions with confidence intervals</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Year Filter */}
            {availableYears.length > 0 && (
              <div className="w-32">
                <FilterDropdown
                  value={selectedYear}
                  onChange={handleYearChange}
                  options={availableYears.map(year => ({
                    value: year?.toString() || '',
                    label: year?.toString() || '',
                    icon: Calendar,
                  }))}
                  placeholder="Select Year"
                  emptyLabel="All Years"
                  allowEmpty={true}
                  hideSearch={true}
                  className="text-[10px] sm:text-xs"
                />
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-slate-200"></div>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500">Historical Income</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-emerald-100 border border-emerald-500 border-dashed"></div>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500">Predicted Income</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-emerald-500"></div>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500">Expenses</span>
            </div>
          </div>
        </div>

        {isFilteringYear ? (
          // Skeleton loader while filtering
          <div className="animate-pulse">
            <div className="relative h-48 sm:h-60 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-50">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex gap-1 h-full items-end flex-1 justify-center">
                  <div className="w-3 sm:w-5 bg-slate-200 rounded-t-[2px]" style={{ height: `${Math.random() * 60 + 20}%` }} />
                  <div className="w-3 sm:w-5 bg-slate-200 rounded-t-[2px]" style={{ height: `${Math.random() * 60 + 20}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 sm:mt-4 px-2 sm:px-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-8 h-3 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <>
        <div className="relative h-48 sm:h-60 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-50">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
            <div className="w-full h-px bg-slate-100/50" />
          </div>
          
          {filteredChartData.map((d, i) => {
            const incomeHeight = maxChartValue > 0 ? (d.income / maxChartValue) * 100 : 0;
            const expenseHeight = maxChartValue > 0 ? (d.expense / maxChartValue) * 100 : 0;
            
            return (
              <div key={`${d.month}-${d.year || ''}-${d.type}-${i}`} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                {d.type === "predicted" ? (
                  <>
                    <div
                      className="w-3 sm:w-5 bg-slate-200 border-2 border-emerald-500 border-dashed rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                      style={{ height: `${incomeHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, year: d.year, type: 'income', value: d.income, dataType: 'predicted', index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <div
                      className="w-3 sm:w-5 bg-emerald-500/90 border-2 border-emerald-500/30 border-dashed rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                      style={{ height: `${expenseHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, year: d.year, type: 'expense', value: d.expense, dataType: 'predicted', index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  </>
                ) : (
                  <>
                    <div
                      className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                      style={{ height: `${incomeHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, year: d.year, type: 'income', value: d.income, dataType: 'historical', index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <div
                      className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                      style={{ height: `${expenseHeight}%` }}
                      onMouseEnter={() => setHoveredBar({ month: d.month, year: d.year, type: 'expense', value: d.expense, dataType: 'historical', index: i })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  </>
                )}
                
                {/* Tooltip */}
                {hoveredBar && hoveredBar.index === i && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] sm:text-xs rounded shadow-sm whitespace-nowrap z-50">
                    <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
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
        <div className="flex justify-between mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-medium text-slate-400 px-2 sm:px-4 uppercase tracking-wider">
          {filteredChartData.map((d, i) => (
            <span 
              key={`${d.month}-${d.year || ''}-${d.type}-${i}`} 
              className={`${
                d.type === "current" ? "text-slate-600" : 
                d.type === "predicted" ? "text-emerald-600" : "text-slate-400"
              } truncate flex flex-col items-center`}
            >
              <span className="hidden sm:inline">{d.month} {d.year ? `'${d.year.toString().slice(-2)}` : ''}</span>
              <span className="sm:hidden">{d.month.slice(0, 3)}{d.year ? `'${d.year.toString().slice(-2)}` : ''}</span>
            </span>
          ))}
        </div>
        </>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
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
          <Button variant="ghost" size="sm" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start" onClick={handleDetailedBreakdown}>
            View detailed breakdown
            <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
          </Button>
        </div>
      </Card>
      )}
              
      {/* Category Predictions Table - No Data State */}
      {!hasGeneratedPredictions ? (
        <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Category Spending Forecast</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Detailed predictions for each spending category</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
              <ChartBar size={24} className="sm:w-8 sm:h-8 text-slate-300" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Category Predictions</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
              Generate predictions to see category-specific spending forecasts.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Category Spending Forecast</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Detailed predictions for each spending category</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search size={12} className="sm:w-[14px] sm:h-[14px] absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter categories..."
                  className="pl-7 sm:pl-9 pr-3 sm:pr-4 py-1.5 text-[10px] sm:text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full md:w-48"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold sticky top-0 bg-white">
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Category</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Historical Avg.</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Predicted</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Change</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">Trend</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] sm:text-xs divide-y divide-slate-50">
                {categoryPredictions.length > 0 ? (
                  categoryPredictions.map((pred) => {
                    const Icon = getCategoryIcon(pred.category);
                    return (
                      <tr key={pred.category} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 flex items-center justify-center">
                              <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                            </div>
                            <span className="font-medium text-slate-900 text-[10px] sm:text-xs">{pred.category}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-500">
                          {formatCurrency(pred.actual)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-slate-900">
                          {formatCurrency(pred.predicted)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <span className={`font-medium ${pred.change > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                            {pred.change > 0 ? "+" : ""}
                            {formatCurrency(Math.abs(pred.change))} ({pred.change > 0 ? "+" : ""}{pred.changePercent}%)
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex justify-center">
                            <Badge 
                              variant={pred.trend === "up" ? "warning" : pred.trend === "down" ? "success" : "neutral"} 
                              className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px]"
                            >
                              {pred.trend === "up" ? "Increasing" : pred.trend === "down" ? "Decreasing" : "Stable"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-900">{pred.confidence}%</span>
                            <div className="w-10 sm:w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
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
                    <td colSpan={6} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-slate-500 text-[10px] sm:text-xs">
                      No category data available. Add more transactions to see predictions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </Card>
      )}

      {/* Expense Type Forecast and Transaction Behavior Insight - No Data State */}
      {!hasGeneratedPredictions ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Expense Type Forecast - No Data */}
          <Card className="lg:col-span-1 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Expense Type Forecast</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Analysis of recurring vs variable expenses</p>
            </div>
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-3">
                <Wallet size={20} className="sm:w-6 sm:h-6 text-slate-300" />
              </div>
              <p className="text-xs text-slate-500 mb-1">No expense analysis</p>
              <p className="text-[10px] text-slate-400">Generate to see breakdown</p>
            </div>
          </Card>

          {/* Transaction Behavior Insight - No Data */}
          <Card className="lg:col-span-2 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Transaction Behavior Insight</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Detailed transaction type analysis and predictions</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-3">
                <FileText size={20} className="sm:w-6 sm:h-6 text-slate-300" />
              </div>
              <p className="text-xs text-slate-500 mb-1">No behavior insights yet</p>
              <p className="text-[10px] text-slate-400">Generate predictions to see analysis</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Expense Type Forecast */}
        <Card className="lg:col-span-1 p-4 sm:p-6 hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Expense Type Forecast</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Analysis of recurring vs variable expenses</p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] sm:text-xs font-medium text-slate-700">Recurring Expenses</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-900">
                  {formatCurrency(expenseTypes?.recurring.amount || 0)}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1 sm:h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
                  style={{ width: `${expenseTypes?.recurring.percentage || 0}%` }} 
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 sm:mt-2 text-[9px] sm:text-[10px]">
                <span className="text-slate-400">{expenseTypes?.recurring.percentage || 0}% of total</span>
                <span className="text-emerald-600 font-medium">
                  {expenseTypes?.recurring.trendValue || 0}% trend
                </span>
              </div>
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] sm:text-xs font-medium text-slate-700">Variable Expenses</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-900">
                  {formatCurrency(expenseTypes?.variable.amount || 0)}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1 sm:h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${expenseTypes?.variable.percentage || 0}%` }} 
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 sm:mt-2 text-[9px] sm:text-[10px]">
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
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="mb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Transaction Behavior Insight</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Detailed transaction type analysis and predictions</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold sticky top-0 bg-white">
                    <th className="px-3 sm:px-4 py-2 sm:py-3">Transaction Type</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Current Avg.</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Next Month</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-50">
                {behaviorInsights.length > 0 ? (
                  behaviorInsights.map((insight, i) => (
                    <tr key={i}>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-slate-700">{insight.name}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-slate-500">
                        {formatCurrency(insight.currentAvg)}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-slate-900">
                        {formatCurrency(insight.nextMonth)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-slate-500 text-[10px] sm:text-xs">
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
      )}

      {/* AI Financial Intelligence Section */}
      <AIFinancialIntelligence
        hasGeneratedInsights={hasGeneratedInsights}
        hasGeneratedPredictions={hasGeneratedPredictions}
        isGeneratingInsights={isGeneratingInsights}
        aiInsights={aiInsights}
        anomalies={anomalies}
        savingsOpportunities={savingsOpportunities}
        forecastData={forecastData}
        detailedInsights={detailedInsights}
        rateLimitStatus={rateLimitStatus}
        onGenerateAIInsights={handleGenerateAIInsights}
        onToggleDetailedInsights={toggleDetailedInsights}
      />
      </div>

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
