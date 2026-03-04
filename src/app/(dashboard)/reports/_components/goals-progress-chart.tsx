"use client";

import { Flag } from "lucide-react";
import { EmptyState, GridLines, EMERALD_SHADES } from "./chart-renderer";

interface GoalsProgressChartProps {
  chartData: {
    goals: Array<{ name: string; current: number; target: number; percentage: number }>;
    totalGoals: number;
    completedGoals: number;
    nearingCompletion: number;
  };
  chartType: 'pie' | 'donut' | 'column' | 'bar' | 'line' | 'area';
}

export function GoalsProgressChart({ chartData, chartType }: GoalsProgressChartProps) {
  if (!chartData.goals || chartData.goals.length === 0) {
    return (
      <EmptyState
        icon={Flag}
        title="No Goals Data"
        description="Create financial goals to track your progress and achievements."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-slate-50">
          <p className="text-lg font-bold text-slate-900">{chartData.totalGoals}</p>
          <p className="text-[10px] text-slate-500 mt-1">Total Goals</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50">
          <p className="text-lg font-bold text-emerald-600">{chartData.completedGoals}</p>
          <p className="text-[10px] text-slate-500 mt-1">Completed</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50">
          <p className="text-lg font-bold text-amber-600">{chartData.nearingCompletion}</p>
          <p className="text-[10px] text-slate-500 mt-1">Nearing</p>
        </div>
      </div>

      {/* Bar/Column Chart */}
      {(chartType === 'bar' || chartType === 'column') && (
        <div className="space-y-3">
          {chartData.goals.map((goal, idx) => {
            const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{goal.name}</span>
                  <span className="text-slate-500 text-[10px]">
                    ₱{goal.current.toLocaleString()} / ₱{goal.target.toLocaleString()} ({goal.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all hover:opacity-80"
                    style={{ 
                      width: `${Math.min(100, goal.percentage)}%`,
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
                   background: `conic-gradient(${chartData.goals.map((goal, idx) => {
                     const totalCurrent = chartData.goals.reduce((sum, g) => sum + g.current, 0);
                     const prevPercentage = chartData.goals.slice(0, idx).reduce((sum, g) => sum + (g.current / totalCurrent) * 100, 0);
                     const currentPercentage = prevPercentage + (goal.current / totalCurrent) * 100;
                     const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
                     return `${color} ${prevPercentage}% ${currentPercentage}%`;
                   }).join(', ')})`
                 }}>
              {chartType === 'donut' && (
                <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Goals</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                    {chartData.totalGoals}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3 w-full">
            {chartData.goals.map((goal, idx) => {
              const color = EMERALD_SHADES[idx % EMERALD_SHADES.length];
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-slate-600">{goal.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">₱{goal.current.toLocaleString()}</span>
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
                  d={chartData.goals.map((goal, idx) => {
                    const x = (idx / (chartData.goals.length - 1)) * 100;
                    const y = 100 - goal.percentage;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                
                {chartType === 'area' && (
                  <path
                    d={`${chartData.goals.map((goal, idx) => {
                      const x = (idx / (chartData.goals.length - 1)) * 100;
                      const y = 100 - goal.percentage;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')} L 100 100 L 0 100 Z`}
                    fill="#10b981"
                    fillOpacity="0.1"
                  />
                )}
                
                {chartData.goals.map((goal, idx) => {
                  const x = (idx / (chartData.goals.length - 1)) * 100;
                  const y = 100 - goal.percentage;
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
            {chartData.goals.map((goal, idx) => (
              <span key={idx} className="text-[10px] font-medium text-slate-400 uppercase tracking-wider text-center truncate" style={{ maxWidth: `${100 / chartData.goals.length}%` }}>
                {goal.name.slice(0, 8)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
