"use client";

import { TrendingUp } from "lucide-react";
import { EmptyState, GridLines, EMERALD_SHADES } from "./chart-renderer";
import type { MonthlyForecast, CategoryPrediction } from "../../predictions/_lib/types";

interface FuturePredictionsChartProps {
  predictionData: {
    forecast: { historical: MonthlyForecast[]; predicted: MonthlyForecast[]; summary: any } | null;
    categories: CategoryPrediction[];
  };
  loadingPredictions: boolean;
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
}

export function FuturePredictionsChart({ 
  predictionData, 
  loadingPredictions, 
  chartType 
}: FuturePredictionsChartProps) {
  if (loadingPredictions) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Loading Predictions...</h4>
        <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4 max-w-md px-4">
          Analyzing your financial data with AI
        </p>
      </div>
    );
  }

  if (!predictionData.forecast || (!predictionData.forecast.historical.length && !predictionData.forecast.predicted.length)) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Prediction Data"
        description="Add more transactions to generate AI-powered financial forecasts."
      />
    );
  }

  return (
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

      {/* Line/Area Chart */}
      {(chartType === 'line' || chartType === 'area') && (
        <div className="space-y-4">
          <div className="relative h-64">
            <GridLines />
            <div className="relative h-full border-b border-slate-50 px-2 pb-2">
              <svg className="w-full h-full" preserveAspectRatio="none">
                {(() => {
                  const allData = [...(predictionData.forecast?.historical || []), ...(predictionData.forecast?.predicted || [])];
                  const maxValue = Math.max(...allData.map(m => Math.max(m.income, m.expense)));
                  const historicalLength = predictionData.forecast?.historical?.length || 0;
                  return (
                    <>
                      {/* Income line */}
                      <path
                        d={allData.map((m, idx) => {
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
                          d={[predictionData.forecast.historical[predictionData.forecast.historical.length - 1], ...predictionData.forecast.predicted].map((m, idx) => {
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
                        d={allData.map((m, idx) => {
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
                          d={[predictionData.forecast.historical[predictionData.forecast.historical.length - 1], ...predictionData.forecast.predicted].map((m, idx) => {
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

                      {chartType === 'area' && (
                        <>
                          {/* Income area */}
                          <path
                            d={`${allData.map((m, idx) => {
                              const x = (idx / (allData.length - 1)) * 100;
                              const y = 100 - ((m.income / maxValue) * 100);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} L 100 100 L 0 100 Z`}
                            fill="#10b981"
                            fillOpacity="0.1"
                          />
                          {/* Expense area */}
                          <path
                            d={`${allData.map((m, idx) => {
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
                      {allData.map((m, idx) => {
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
            {[...(predictionData.forecast?.historical || []), ...(predictionData.forecast?.predicted || [])].map((m, idx) => (
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

      {/* Column/Bar Chart */}
      {(chartType === 'column' || chartType === 'bar') && predictionData.forecast?.predicted && (
        <div className="space-y-3">
          {predictionData.forecast.predicted.map((month, idx) => (
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

      {/* Pie/Donut Chart - Category Predictions */}
      {(chartType === 'pie' || chartType === 'donut') && predictionData.categories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Category Predictions</h4>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                   style={{ 
                     background: `conic-gradient(${predictionData.categories.map((cat, idx) => {
                       const total = predictionData.categories.reduce((sum, c) => sum + c.predicted, 0);
                       const prevPercentage = predictionData.categories.slice(0, idx).reduce((sum, c) => sum + (c.predicted / total) * 100, 0);
                       const currentPercentage = prevPercentage + (cat.predicted / total) * 100;
                       const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
                       return `${color} ${prevPercentage}% ${currentPercentage}%`;
                     }).join(', ')})`
                   }}>
                {chartType === 'donut' && (
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
              {predictionData.categories.slice(0, 5).map((cat, idx) => {
                const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
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
  );
}
