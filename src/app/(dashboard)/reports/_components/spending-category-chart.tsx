"use client";

import { PieChart } from "lucide-react";
import { EmptyState, GridLines, EMERALD_SHADES } from "./chart-renderer";

interface SpendingCategoryChartProps {
  chartData: {
    categories: Array<{ name: string; amount: number; percentage: number }>;
    total: number;
  };
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
}

export function SpendingCategoryChart({ chartData, chartType }: SpendingCategoryChartProps) {
  if (!chartData.categories || chartData.categories.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="No Spending Data"
        description="Add transactions to see spending breakdown by category."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-slate-900">
          ₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-slate-500">Total Spending</p>
      </div>

      {}
      {(chartType === 'pie' || chartType === 'donut') && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                 style={{ 
                   background: `conic-gradient(${chartData.categories.map((cat, idx) => {
                     const prevPercentage = chartData.categories.slice(0, idx).reduce((sum, c) => sum + c.percentage, 0);
                     const currentPercentage = prevPercentage + cat.percentage;
                     const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
                     return `${color} ${prevPercentage}% ${currentPercentage}%`;
                   }).join(', ')})`
                 }}>
              {chartType === 'donut' && (
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
            {chartData.categories.map((cat, idx) => {
              const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
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

      {}
      {(chartType === 'column' || chartType === 'bar') && (
        <div className="space-y-4">
          {chartType === 'column' ? (
            <div className="relative h-64">
              <GridLines />
              <div className="relative h-full flex items-end justify-between gap-2 px-2 border-b border-slate-50">
                {chartData.categories.map((cat, idx) => {
                  const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
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
                {chartData.categories.map((cat, idx) => (
                  <span key={idx} className="text-center truncate flex-1">{cat.name.slice(0, 3)}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {chartData.categories.map((cat, idx) => {
                const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
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

      {}
      {(chartType === 'line' || chartType === 'area') && (
        <div className="space-y-4">
          <div className="relative h-64">
            <GridLines />
            <div className="relative h-full border-b border-slate-50 px-2 pb-2">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <path
                  d={chartData.categories.map((cat, idx) => {
                    const x = (idx / (chartData.categories.length - 1)) * 100;
                    const y = 100 - cat.percentage;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                
                {chartType === 'area' && (
                  <path
                    d={`${chartData.categories.map((cat, idx) => {
                      const x = (idx / (chartData.categories.length - 1)) * 100;
                      const y = 100 - cat.percentage;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')} L 100 100 L 0 100 Z`}
                    fill="#10b981"
                    fillOpacity="0.1"
                  />
                )}
                
                {chartData.categories.map((cat, idx) => {
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
          <div className="flex justify-between px-2 mt-4">
            {chartData.categories.map((cat, idx) => (
              <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.categories.length}%` }}>
                {cat.name.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
