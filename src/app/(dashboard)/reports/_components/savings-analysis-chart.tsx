"use client";

import { Wallet } from "lucide-react";
import { EmptyState, GridLines, EMERALD_SHADES } from "./chart-renderer";

interface SavingsAnalysisChartProps {
  chartData: {
    funds: Array<{ name: string; amount: number; target: number; percentage: number }>;
    total: number;
    rate: number;
  };
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
}

export function SavingsAnalysisChart({ chartData, chartType }: SavingsAnalysisChartProps) {
  if (!chartData.funds || chartData.funds.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No Savings Data"
        description="Create savings goals to track your progress and analyze savings patterns."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6 p-4 rounded-lg bg-slate-50">
        <p className="text-2xl font-bold text-slate-900">
          ₱{chartData.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-slate-500 mt-1">Total Savings ({chartData.rate?.toFixed(1)}% rate)</p>
      </div>

      {/* Bar/Column Chart */}
      {(chartType === 'bar' || chartType === 'column') && (
        <div className="space-y-3">
          {chartData.funds.map((fund, idx) => {
            const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
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

      {/* Pie/Donut Chart */}
      {(chartType === 'pie' || chartType === 'donut') && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                 style={{ 
                   background: `conic-gradient(${chartData.funds.map((fund, idx) => {
                     const prevPercentage = chartData.funds.slice(0, idx).reduce((sum, f) => sum + (f.amount / chartData.total) * 100, 0);
                     const currentPercentage = prevPercentage + (fund.amount / chartData.total) * 100;
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
            {chartData.funds.map((fund, idx) => {
              const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
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

      {/* Line/Area Chart */}
      {(chartType === 'line' || chartType === 'area') && (
        <div className="space-y-4">
          <div className="relative h-64">
            <GridLines />
            <div className="relative h-full border-b border-slate-50 px-2 pb-2">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <path
                  d={chartData.funds.map((fund, idx) => {
                    const x = (idx / (chartData.funds.length - 1)) * 100;
                    const y = 100 - fund.percentage;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                
                {chartType === 'area' && (
                  <path
                    d={`${chartData.funds.map((fund, idx) => {
                      const x = (idx / (chartData.funds.length - 1)) * 100;
                      const y = 100 - fund.percentage;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')} L 100 100 L 0 100 Z`}
                    fill="#10b981"
                    fillOpacity="0.1"
                  />
                )}
                
                {chartData.funds.map((fund, idx) => {
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
            {chartData.funds.map((fund, idx) => (
              <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.funds.length}%` }}>
                {fund.name.slice(0, 8)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
