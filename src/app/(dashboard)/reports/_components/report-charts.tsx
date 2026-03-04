"use client";

import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ReportSettings } from "./types";
import type { MonthlyForecast, CategoryPrediction } from "../../predictions/_lib/types";
import { SpendingCategoryChart } from "./spending-category-chart";
import { IncomeExpenseChart } from "./income-expense-chart";
import { SavingsAnalysisChart } from "./savings-analysis-chart";
import { GoalsProgressChart } from "./goals-progress-chart";
import { SpendingTrendsChart } from "./spending-trends-chart";
import { FuturePredictionsChart } from "./future-predictions-chart";
import { EmptyState } from "./chart-renderer";

interface ReportChartsProps {
  reportSettings: ReportSettings;
  chartData: any;
  predictionData: {
    forecast: { historical: MonthlyForecast[]; predicted: MonthlyForecast[]; summary: any } | null;
    categories: CategoryPrediction[];
  };
  loadingPredictions: boolean;
}

export function ReportCharts({
  reportSettings,
  chartData,
  predictionData,
  loadingPredictions,
}: ReportChartsProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {reportSettings.reportType === 'spending' ? 'Spending by Category' :
             reportSettings.reportType === 'income-expense' ? 'Income vs Expenses' :
             reportSettings.reportType === 'savings' ? 'Savings Analysis' :
             reportSettings.reportType === 'trends' ? 'Spending Trends' :
             reportSettings.reportType === 'goals' ? 'Goals Progress' :
             reportSettings.reportType === 'predictions' ? 'Future Predictions' : 'Financial Overview'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-light">
            {reportSettings.timeframe === 'month' ? 'Last 30 days' :
             reportSettings.timeframe === 'quarter' ? 'Last 3 months' : 'Last 12 months'}
          </p>
        </div>
      </div>

      {/* No Data State */}
      {!chartData && reportSettings.reportType !== 'predictions' ? (
        <EmptyState
          icon={BarChart3}
          title="No Chart Data Available"
          description="Add transactions to see your financial data visualized in charts."
        />
      ) : (
        <>
          {/* Spending by Category */}
          {reportSettings.reportType === 'spending' && (
            <SpendingCategoryChart
              chartData={chartData}
              chartType={reportSettings.chartType}
            />
          )}

          {/* Income vs Expense */}
          {reportSettings.reportType === 'income-expense' && (
            <IncomeExpenseChart
              chartData={chartData}
              chartType={reportSettings.chartType}
            />
          )}

          {/* Savings Analysis */}
          {reportSettings.reportType === 'savings' && (
            <SavingsAnalysisChart
              chartData={chartData}
              chartType={reportSettings.chartType}
            />
          )}

          {/* Goals Progress */}
          {reportSettings.reportType === 'goals' && (
            <GoalsProgressChart
              chartData={chartData}
              chartType={reportSettings.chartType}
            />
          )}

          {/* Spending Trends */}
          {reportSettings.reportType === 'trends' && (
            <SpendingTrendsChart
              chartData={chartData}
              chartType={reportSettings.chartType}
            />
          )}

          {/* Future Predictions */}
          {reportSettings.reportType === 'predictions' && (
            <FuturePredictionsChart
              predictionData={predictionData}
              loadingPredictions={loadingPredictions}
              chartType={reportSettings.chartType}
            />
          )}
        </>
      )}
    </Card>
  );
}
