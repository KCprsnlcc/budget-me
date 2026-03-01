"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  TrendingDown as TrendingFlat,
  Calendar,
  PhilippinePeso,
  Wrench,
  Brain,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  ChevronRight,
  Info,
  Layers,
  Zap,
} from "lucide-react";
import type { 
  MonthlyForecast, 
  CategoryPrediction, 
  ForecastStep,
} from "../_lib/types";

interface DetailedBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  forecastData?: {
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
  } | null;
  categoryPredictions?: CategoryPrediction[];
}

const STEPS = ["Overview", "Income vs Expenses Forecast", "Category Analysis"];

export function DetailedBreakdownModal({ 
  open, 
  onClose, 
  forecastData,
  categoryPredictions = []
}: DetailedBreakdownModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleNext = useCallback(() => {
    if (step === STEPS.length) {
      handleClose();
    } else {
      setStep(step + 1);
    }
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const canContinue = true;

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Combine forecast data
  const allMonths = [
    ...(forecastData?.historical || []),
    ...(forecastData?.predicted || [])
  ];

  // Calculate totals
  const totalPredictedIncome = forecastData?.predicted.reduce((sum, p) => sum + p.income, 0) || 0;
  const totalPredictedExpenses = forecastData?.predicted.reduce((sum, p) => sum + p.expense, 0) || 0;
  const netSavings = totalPredictedIncome - totalPredictedExpenses; // Always allow continue (final step closes modal)

  return (
    <Modal open={open} onClose={handleClose} className="max-w-3xl">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Detailed Breakdown
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <div className="flex items-center justify-center px-5 py-3.5 bg-white border-b border-slate-100" aria-label="Progress">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;

          return (
            <div key={label} className="flex items-center">
              {idx > 0 && (
                <div
                  className={`w-9 h-[1.5px] mx-1.5 mb-[18px] flex-shrink-0 transition-colors duration-300 ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold border-[1.5px] transition-all duration-300 relative z-[2] flex-shrink-0 ${
                    isActive
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <CheckCircle size={12} /> : stepNum}
                </div>
                <span
                  className={`text-[9px] font-semibold mt-1 text-center uppercase tracking-[0.05em] transition-colors duration-200 ${
                    isActive
                      ? "text-emerald-500"
                      : isCompleted
                      ? "text-slate-600"
                      : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Total Predicted Income
                </div>
                <div className="text-2xl font-semibold text-slate-900 mb-2">
                  {formatCurrency(totalPredictedIncome)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-600 font-medium">
                    {forecastData?.summary.avgGrowth ? `+${forecastData.summary.avgGrowth}%` : "N/A"} vs last month
                  </span>
                </div>
              </div>
              <div className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Total Predicted Expenses
                </div>
                <div className="text-2xl font-semibold text-slate-900 mb-2">
                  {formatCurrency(totalPredictedExpenses)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-600 font-medium">Based on historical trends</span>
                </div>
              </div>
              <div className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Net Savings Projection
                </div>
                <div className="text-2xl font-semibold text-slate-900 mb-2">
                  {formatCurrency(netSavings)}
                </div>
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-600 font-medium">
                    {forecastData?.summary.confidence || 0}% confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">Key Insights</h3>
              <div className="space-y-3">
                {forecastData && forecastData.summary.avgGrowth > 0 ? (
                  <div className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition-all group cursor-pointer">
                    <CheckCircle size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Strong Income Growth</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Projected {forecastData.summary.avgGrowth.toFixed(1)}% increase in monthly income based on historical patterns.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition-all group cursor-pointer">
                    <AlertTriangle size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Limited Data</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Add more transactions to see detailed insights and accurate predictions.
                      </p>
                    </div>
                  </div>
                )}
                
                {forecastData?.summary.maxSavings && forecastData.summary.maxSavings > 0 && (
                  <div className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition-all group cursor-pointer">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Savings Opportunity</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Maximum projected savings of {formatCurrency(forecastData.summary.maxSavings)} in upcoming months.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Income vs Expenses Forecast with Prophet ML */}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            {/* Prophet ML Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-500" />
                <h3 className="text-[15px] font-bold text-slate-900">Income vs Expenses Forecast</h3>
              </div>
              <Badge variant="neutral" className="text-xs flex items-center gap-1">
                <Brain size={12} />
                Prophet ML
              </Badge>
            </div>

            {/* Prophet Model Configuration */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Prophet Model Configuration</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Mode:</span>
                  <span className="font-medium text-slate-700 capitalize">
                    {forecastData?.summary.modelDetails?.seasonalityMode || "multiplicative"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Yearly Seasonality:</span>
                  <span className="font-medium text-slate-700">
                    {forecastData?.summary.modelDetails?.yearlySeasonality ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Uncertainty:</span>
                  <span className="font-medium text-slate-700">
                    {forecastData?.summary.modelDetails?.uncertaintySamples?.toLocaleString() || "1,000"} samples
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Changepoint Scale:</span>
                  <span className="font-medium text-slate-700">
                    {forecastData?.summary.modelDetails?.changepointPriorScale || 0.05}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Seasonality Strength:</span>
                  <span className="font-medium text-slate-700">
                    {(forecastData?.summary.seasonalityStrength || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Trend Strength:</span>
                  <span className="font-medium text-slate-700">
                    {(forecastData?.summary.trendStrength || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Direction & Changepoints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Trend Direction</span>
                </div>
                <div className="flex items-center gap-3">
                  {forecastData?.summary.trendDirection === "up" ? (
                    <TrendingUp size={24} className="text-emerald-500" />
                  ) : forecastData?.summary.trendDirection === "down" ? (
                    <TrendingDown size={24} className="text-rose-500" />
                  ) : (
                    <TrendingFlat size={24} className="text-slate-400" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900 capitalize">
                      {forecastData?.summary.trendDirection || "Stable"} Trend
                    </div>
                    <div className="text-xs text-slate-500">
                      Strength: {((forecastData?.summary.trendStrength || 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Detected Changepoints</span>
                </div>
                <div className="text-sm text-slate-700">
                  {forecastData?.summary.changepoints && forecastData.summary.changepoints.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {forecastData.summary.changepoints.map((cp, i) => (
                        <Badge key={i} variant="neutral" className="text-xs">{cp}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">No significant changepoints detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Forecast Table with Confidence Intervals */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Monthly Forecast with Confidence Intervals</span>
                </div>
              </div>
              <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                {forecastData?.predicted && forecastData.predicted.length > 0 ? (
                  forecastData.predicted.map((item, idx) => (
                    <div key={`${item.month}-${idx}`} className="space-y-3">
                      {/* Month Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm font-semibold text-slate-900">{item.month}</span>
                          <Badge variant="neutral" className="text-[9px]">Predicted</Badge>
                        </div>
                        {item.confidence && (
                          <Badge variant={item.confidence >= 85 ? "success" : item.confidence >= 60 ? "warning" : "neutral"} className="text-xs">
                            {item.confidence}% confidence
                          </Badge>
                        )}
                      </div>

                      {/* Income with Confidence Interval */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Income Forecast</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Lower:</span>
                            <span className="font-medium text-slate-600">{formatCurrency(item.incomeLower || 0)}</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="font-bold text-emerald-600">{formatCurrency(item.income)}</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="text-slate-400">Upper:</span>
                            <span className="font-medium text-slate-600">{formatCurrency(item.incomeUpper || 0)}</span>
                          </div>
                        </div>
                        {/* Visual confidence bar for income */}
                        <div className="relative h-6 bg-slate-100 rounded-md overflow-hidden">
                          {/* Confidence interval background */}
                          <div 
                            className="absolute h-full bg-emerald-500/20 rounded-md transition-all duration-500"
                            style={{
                              left: `${Math.max(0, ((item.incomeLower || 0) / Math.max(item.incomeUpper || 1, 1)) * 100)}%`,
                              right: `${Math.max(0, 100 - ((item.incomeUpper || 0) / Math.max(item.incomeUpper || 1, 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Expenses with Confidence Interval */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Expense Forecast</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Lower:</span>
                            <span className="font-medium text-slate-600">{formatCurrency(item.expenseLower || 0)}</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="font-bold text-rose-600">{formatCurrency(item.expense)}</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="text-slate-400">Upper:</span>
                            <span className="font-medium text-slate-600">{formatCurrency(item.expenseUpper || 0)}</span>
                          </div>
                        </div>
                        {/* Visual confidence bar for expenses */}
                        <div className="relative h-6 bg-slate-100 rounded-md overflow-hidden">
                          {/* Confidence interval background */}
                          <div 
                            className="absolute h-full bg-rose-500/20 rounded-md transition-all duration-500"
                            style={{
                              left: `${Math.max(0, ((item.expenseLower || 0) / Math.max(item.expenseUpper || 1, 1)) * 100)}%`,
                              right: `${Math.max(0, 100 - ((item.expenseUpper || 0) / Math.max(item.expenseUpper || 1, 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Net Savings */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-medium text-slate-600">Projected Net Savings</span>
                        <span className={`text-sm font-bold ${(item.income - item.expense) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {formatCurrency(item.income - item.expense)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <BarChart3 size={32} className="mx-auto mb-2 text-slate-300" />
                    <p>No forecast data available. Generate predictions to see detailed Prophet ML analysis.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historical Data Summary */}
            {forecastData?.historical && forecastData.historical.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Historical Data Summary</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Months Analyzed</span>
                    <span className="font-semibold text-slate-700">{forecastData.historical.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Avg Monthly Income</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(forecastData.historical.reduce((sum, h) => sum + h.income, 0) / forecastData.historical.length)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Avg Monthly Expenses</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(forecastData.historical.reduce((sum, h) => sum + h.expense, 0) / forecastData.historical.length)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Avg Savings Rate</span>
                    <span className="font-semibold text-slate-700">
                      {((forecastData.historical.reduce((sum, h) => sum + (h.income - h.expense), 0) / 
                        forecastData.historical.reduce((sum, h) => sum + h.income, 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Category Analysis */}
        {step === 3 && (
          <div className="space-y-6 animate-txn-in">
            <h3 className="text-[15px] font-bold text-slate-900">Category-wise Analysis</h3>
            
            <div className="space-y-4">
              {categoryPredictions.length > 0 ? (
                categoryPredictions.map((item) => (
                  <div 
                    key={item.category} 
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900">{item.category}</span>
                      <div className="flex items-center gap-2">
                        {item.trend === "up" ? (
                          <TrendingUp size={16} className="text-amber-500" />
                        ) : item.trend === "down" ? (
                          <TrendingDown size={16} className="text-emerald-500" />
                        ) : (
                          <span className="text-xs text-slate-400">→</span>
                        )}
                        <span className={`text-sm font-medium ${
                          item.trend === "up" ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {item.change > 0 ? "+" : ""}{item.changePercent}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Current: </span>
                        <span className="font-medium">{formatCurrency(item.actual)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Predicted: </span>
                        <span className="font-medium">{formatCurrency(item.predicted)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Confidence: {item.confidence}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
                  No category data available. Add categorized transactions to see analysis.
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            {categoryPredictions.length > 0 && (
              <div className="border border-slate-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Brain size={16} className="text-emerald-500" />
                  AI Recommendations
                </h4>
                <div className="space-y-2 text-xs">
                  {categoryPredictions.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        idx === 0 ? "bg-emerald-500" : idx === 1 ? "bg-blue-500" : "bg-amber-500"
                      }`} />
                      <p className="text-slate-600">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="secondary" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} /> Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canContinue}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
        >
          {step === STEPS.length ? (
            <>Close <ArrowRight size={14} /></>
          ) : (
            <>Next <ArrowRight size={14} /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
