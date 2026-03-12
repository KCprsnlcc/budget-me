"use client";

import { BarChart2 } from "lucide-react";
import { EmptyState, GridLines } from "./chart-renderer";

interface IncomeExpenseChartProps {
  chartData: {
    monthly: Array<{ month: string; income: number; expenses: number }>;
    totals: { income: number; expenses: number; netSavings: number };
  };
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
}

export function IncomeExpenseChart({ chartData, chartType }: IncomeExpenseChartProps) {
  if (!chartData.monthly || chartData.monthly.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No Income/Expense Data"
        description="Add income and expense transactions to see monthly comparisons."
      />
    );
  }

  return (
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

      {}
      {(chartType === 'pie' || chartType === 'donut') && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                 style={{ 
                   background: `conic-gradient(#10b981 0% ${(chartData.totals.income / (chartData.totals.income + chartData.totals.expenses)) * 100}%, #ef4444 ${(chartData.totals.income / (chartData.totals.income + chartData.totals.expenses)) * 100}% 100%)`
                 }}>
              {chartType === 'donut' && (
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

      {}
      {(chartType === 'column' || chartType === 'bar') && (
        <div className="space-y-3">
          {chartData.monthly.map((month, idx) => (
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

      {}
      {(chartType === 'line' || chartType === 'area') && (
        <div className="space-y-4">
          <div className="relative h-64">
            <GridLines />
            <div className="relative h-full border-b border-slate-50 px-2 pb-2">
              <svg className="w-full h-full" preserveAspectRatio="none">
                {(() => {
                  const maxValue = Math.max(...chartData.monthly.map(m => Math.max(m.income, m.expenses)));
                  return (
                    <>
                      <path
                        d={chartData.monthly.map((m, idx) => {
                          const x = (idx / (chartData.monthly.length - 1)) * 100;
                          const y = 100 - ((m.income / maxValue) * 100);
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                      
                      <path
                        d={chartData.monthly.map((m, idx) => {
                          const x = (idx / (chartData.monthly.length - 1)) * 100;
                          const y = 100 - ((m.expenses / maxValue) * 100);
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />

                      {chartType === 'area' && (
                        <>
                          <path
                            d={`${chartData.monthly.map((m, idx) => {
                              const x = (idx / (chartData.monthly.length - 1)) * 100;
                              const y = 100 - ((m.income / maxValue) * 100);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} L 100 100 L 0 100 Z`}
                            fill="#10b981"
                            fillOpacity="0.1"
                          />
                          <path
                            d={`${chartData.monthly.map((m, idx) => {
                              const x = (idx / (chartData.monthly.length - 1)) * 100;
                              const y = 100 - ((m.expenses / maxValue) * 100);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} L 100 100 L 0 100 Z`}
                            fill="#ef4444"
                            fillOpacity="0.1"
                          />
                        </>
                      )}
                      
                      {chartData.monthly.map((m, idx) => {
                        const x = (idx / (chartData.monthly.length - 1)) * 100;
                        const yIncome = 100 - ((m.income / maxValue) * 100);
                        const yExpense = 100 - ((m.expenses / maxValue) * 100);
                        return (
                          <g key={idx}>
                            <circle cx={`${x}%`} cy={`${yIncome}%`} r="4" fill="#10b981" className="cursor-pointer" />
                            <circle cx={`${x}%`} cy={`${yExpense}%`} r="4" fill="#ef4444" className="cursor-pointer" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
          <div className="flex justify-between px-2 mt-4">
            {chartData.monthly.map((m, idx) => (
              <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.monthly.length}%` }}>
                {m.month}
              </span>
            ))}
          </div>
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
  );
}
