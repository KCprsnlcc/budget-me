"use client";

import { LineChart, ArrowUp, ArrowRight } from "lucide-react";
import { EmptyState, GridLines, EMERALD_SHADES } from "./chart-renderer";

interface SpendingTrendsChartProps {
  chartData: {
    categories: Array<{ name: string; change: number; trend: 'up' | 'down' | 'stable' }>;
  };
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
}

export function SpendingTrendsChart({ chartData, chartType }: SpendingTrendsChartProps) {
  if (!chartData.categories || chartData.categories.length === 0) {
    return (
      <EmptyState
        icon={LineChart}
        title="No Trend Data"
        description="Add more transactions over time to see spending trends and patterns."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Card view for column/bar */}
      {(chartType === 'column' || chartType === 'bar') && (
        <div className="space-y-3">
          {chartData.categories.map((cat, idx) => {
            const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
            const change = cat.change ?? 0;
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
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
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

      {/* Pie/Donut Chart */}
      {(chartType === 'pie' || chartType === 'donut') && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex-shrink-0 relative"
                 style={{ 
                   background: `conic-gradient(${chartData.categories.map((cat, idx) => {
                     const totalChange = chartData.categories.reduce((sum, c) => sum + Math.abs(c.change), 0);
                     const prevPercentage = chartData.categories.slice(0, idx).reduce((sum, c) => sum + (Math.abs(c.change) / totalChange) * 100, 0);
                     const currentPercentage = prevPercentage + (Math.abs(cat.change) / totalChange) * 100;
                     const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
                     return `${color} ${prevPercentage}% ${currentPercentage}%`;
                   }).join(', ')})`
                 }}>
              {chartType === 'donut' && (
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
            {chartData.categories.map((cat, idx) => {
              const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
              const change = cat.change ?? 0;
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
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
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
                {(() => {
                  const maxChange = Math.max(...chartData.categories.map(c => Math.abs(c.change)));
                  return (
                    <>
                      <path
                        d={chartData.categories.map((cat, idx) => {
                          const x = (idx / (chartData.categories.length - 1)) * 100;
                          const change = cat.change ?? 0;
                          const y = 50 - ((change / maxChange) * 40);
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
                            const change = cat.change ?? 0;
                            const y = 50 - ((change / maxChange) * 40);
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')} L 100 50 L 0 50 Z`}
                          fill="#10b981"
                          fillOpacity="0.1"
                        />
                      )}
                      
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
                      
                      {chartData.categories.map((cat, idx) => {
                        const x = (idx / (chartData.categories.length - 1)) * 100;
                        const change = cat.change ?? 0;
                        const y = 50 - ((change / maxChange) * 40);
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
            {chartData.categories.map((cat, idx) => (
              <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.categories.length}%` }}>
                {cat.name.slice(0, 8)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
