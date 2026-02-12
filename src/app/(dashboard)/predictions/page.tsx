"use client";

import {
  Wand2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Brain,
  Sparkles,
  DollarSign,
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
import { 
  HistoryModal,
  DetailedBreakdownModal 
} from "./_components";
import { useState, useCallback } from "react";

const PREDICTIONS = [
  {
    category: "Food & Dining",
    icon: Utensils,
    predicted: 580,
    actual: 420,
    confidence: 87,
    trend: "down",
    insight: "Spending likely to increase by 15% due to upcoming holidays",
  },
  {
    category: "Shopping",
    icon: ShoppingBag,
    predicted: 450,
    actual: 230,
    confidence: 72,
    trend: "up",
    insight: "Pattern suggests large purchase expected mid-month",
  },
  {
    category: "Transportation",
    icon: Car,
    predicted: 210,
    actual: 185,
    confidence: 91,
    trend: "stable",
    insight: "Consistent spending pattern detected",
  },
];

const ANOMALIES = [
  {
    type: "warning",
    title: "Duplicate Netflix Charge",
    description: "Two charges of $15.99 detected from Netflix on Feb 7",
    amount: "$15.99",
    action: "Review",
  },
  {
    type: "info",
    title: "New Recurring Payment",
    description: "Monthly charge from Adobe Creative Cloud detected",
    amount: "$54.99",
    action: "Categorize",
  },
];

const SAVINGS_OPPORTUNITIES = [
  { title: "Switch to annual Spotify plan", potential: "$24/year", confidence: 95 },
  { title: "Reduce dining out frequency by 20%", potential: "$120/month", confidence: 78 },
  { title: "Bundle insurance policies", potential: "$45/month", confidence: 65 },
];

export default function PredictionsPage() {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [detailedBreakdownModalOpen, setDetailedBreakdownModalOpen] = useState(false);
  const [detailedInsights, setDetailedInsights] = useState(false);

  const handleHistory = useCallback(() => {
    setHistoryModalOpen(true);
  }, []);

  const handleDetailedBreakdown = useCallback(() => {
    setDetailedBreakdownModalOpen(true);
  }, []);

  const toggleDetailedInsights = useCallback(() => {
    setDetailedInsights(prev => !prev);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">AI Predictions</h2>
            <Badge variant="brand" className="px-3 py-1">
              <Brain size={12} className="mr-1" /> AI Powered
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-light">Smart forecasts and insights powered by Prophet machine learning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleHistory}>
            <History size={16} className="mr-2" />
            View History
          </Button>
        </div>
      </div>

      {/* Prediction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Monthly Income Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg text-slate-400 group-hover:text-emerald-600 transition-colors">
              <Wallet size={22} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="success" className="text-[10px] px-2 py-0.5">
                <TrendingUp size={10} className="mr-1" />
                12.4%
              </Badge>
              <span className="text-[9px] text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Income</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900">₱8,450.00</div>
            <div className="text-[10px] text-slate-400 line-through">₱7,520</div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Confidence: <span className="text-emerald-600 font-medium">92%</span>
          </p>
        </Card>

        {/* Monthly Expenses Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg text-slate-400 group-hover:text-amber-600 transition-colors">
              <ShoppingBag size={22} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="warning" className="text-[10px] px-2 py-0.5">
                <TrendingUp size={10} className="mr-1" />
                4.2%
              </Badge>
              <span className="text-[9px] text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Expenses</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900">₱4,250.00</div>
            <div className="text-[10px] text-slate-400 line-through">₱4,080</div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Confidence: <span className="text-amber-600 font-medium">85%</span>
          </p>
        </Card>

        {/* Net Savings Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg text-slate-400 group-hover:text-emerald-600 transition-colors">
              <PiggyBank size={22} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="success" className="text-[10px] px-2 py-0.5">
                <TrendingUp size={10} className="mr-1" />
                22.1%
              </Badge>
              <span className="text-[9px] text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Net Savings</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900">₱4,200.00</div>
            <div className="text-[10px] text-slate-400 line-through">₱3,440</div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Confidence: <span className="text-emerald-600 font-medium">88%</span>
          </p>
        </Card>

        {/* Savings Rate Card */}
        <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
              <ChartBar size={22} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="info" className="text-[10px] px-2 py-0.5">
                Target: 50%
              </Badge>
              <span className="text-[9px] text-slate-400">Goal progress</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Savings Rate</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900">49.7%</div>
            <div className="text-[10px] text-slate-400">Predicted</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: "49.7%" }} />
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

        <div className="h-80 flex items-end justify-between gap-2 sm:gap-4 px-4 border-b border-slate-50 relative group/chart bg-slate-50/30 rounded-lg">
          {/* Confidence Interval Background */}
          <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none opacity-20">
            <div className="w-1/2 h-32 bg-emerald-100 rounded-l-full blur-3xl"></div>
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4">
            <div className="w-full h-px bg-slate-200"></div>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="w-full h-px bg-slate-200"></div>
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none px-2 text-[9px] text-slate-400">
            <span>10k</span>
            <span>8k</span>
            <span>6k</span>
            <span>4k</span>
            <span>2k</span>
            <span>0</span>
          </div>

          {/* Data Bars */}
          <div className="flex items-end justify-between gap-2 sm:gap-4 w-full pl-8">
            {[
              { month: "Oct", historicalIncome: 75, expenses: 55, type: "historical" as const },
              { month: "Nov", historicalIncome: 80, expenses: 60, type: "historical" as const },
              { month: "Dec", historicalIncome: 78, expenses: 58, type: "current" as const },
              { month: "Jan", predictedIncome: 85, expenses: 62, type: "predicted" as const },
              { month: "Feb", predictedIncome: 88, expenses: 65, type: "predicted" as const },
              { month: "Mar", predictedIncome: 92, expenses: 60, type: "predicted" as const },
            ].map((data) => (
              <div key={data.month} className="flex flex-col items-center flex-1 z-10 group cursor-pointer">
                <div className="flex gap-1 items-end w-full justify-center group-hover:scale-x-110 transition-transform relative" style={{ height: '240px' }}>
                  {data.type === "predicted" ? (
                    <>
                      <div 
                        className="w-4 bg-emerald-100 border-2 border-emerald-500 border-dashed rounded-t-sm transition-all hover:bg-emerald-200 absolute"
                        style={{ height: `${data.predictedIncome}%`, bottom: 0 }}
                        title={`Predicted Income: ₱${(data.predictedIncome * 100).toFixed(0)}`}
                      />
                      <div 
                        className="w-4 bg-emerald-500/90 border-2 border-emerald-500/30 border-dashed rounded-t-sm transition-all hover:bg-emerald-600 absolute"
                        style={{ height: `${data.expenses}%`, bottom: 0, left: '20px' }}
                        title={`Predicted Expenses: ₱${(data.expenses * 100).toFixed(0)}`}
                      />
                    </>
                  ) : (
                    <>
                      <div 
                        className="w-4 bg-slate-300 rounded-t-sm transition-all hover:bg-slate-400 absolute"
                        style={{ height: `${data.historicalIncome}%`, bottom: 0 }}
                        title={`Historical Income: ₱${(data.historicalIncome * 100).toFixed(0)}`}
                      />
                      <div 
                        className="w-4 bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600 absolute"
                        style={{ height: `${data.expenses}%`, bottom: 0, left: '20px' }}
                        title={`Expenses: ₱${(data.expenses * 100).toFixed(0)}`}
                      />
                    </>
                  )}
                </div>
                <div className={`mt-3 text-[10px] font-medium uppercase tracking-widest ${
                  data.type === "current" ? "text-slate-900 border-b-2 border-emerald-500 pb-1" :
                  data.type === "predicted" ? "text-emerald-600" : "text-slate-400"
                }`}>
                  {data.month}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Avg. Growth</span>
              <span className="text-xs font-bold text-emerald-600">+8.5%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Max Savings</span>
              <span className="text-xs font-bold text-slate-900">₱6,800</span>
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
            <Button variant="outline" size="sm" className="h-8 w-8">
              <Settings size={14} />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Historical Avg.</th>
                <th className="px-6 py-4 text-right">Predicted</th>
                <th className="px-6 py-4 text-right">Change</th>
                <th className="px-6 py-4 text-center">Trend</th>
                <th className="px-6 py-4 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {PREDICTIONS.map((pred) => {
                const Icon = pred.icon;
                const change = pred.predicted - pred.actual;
                const changePercent = ((change / pred.actual) * 100).toFixed(1);
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
                    <td className="px-6 py-4 text-right text-slate-500">₱{pred.actual.toLocaleString()}.00</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">₱{pred.predicted.toLocaleString()}.00</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${change > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                        {change > 0 ? "+" : ""}₱{Math.abs(change).toLocaleString()}.00 ({change > 0 ? "+" : ""}{changePercent}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Badge variant={pred.trend === "up" ? "warning" : pred.trend === "down" ? "success" : "neutral"} className="px-2 py-0.5 rounded-full text-[9px]">
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
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Expense Type Forecast and Transaction Behavior Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Expense Type Forecast */}
        <Card className="lg:col-span-1 p-6 hover:shadow-md transition-all group cursor-pointer">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Expense Type Forecast</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-700">Recurring Expenses</span>
                <span className="text-xs font-bold text-slate-900">₱2,840</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "67%" }} />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px]">
                <span className="text-slate-400">67% of total</span>
                <span className="text-emerald-600 font-medium">-2.1% trend</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-700">Variable Expenses</span>
                <span className="text-xs font-bold text-slate-900">₱1,410</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "33%" }} />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px]">
                <span className="text-slate-400">33% of total</span>
                <span className="text-amber-600 font-medium">+5.4% trend</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction Behavior Insight */}
        <Card className="lg:col-span-2 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-900">Transaction Behavior Insight</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  <th className="px-4 py-3">Transaction Type</th>
                  <th className="px-4 py-3 text-right">Current Avg.</th>
                  <th className="px-4 py-3 text-right">Next Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">Subscription</td>
                  <td className="px-4 py-3 text-right text-slate-500">₱850.00</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">₱850.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">Utility Bill</td>
                  <td className="px-4 py-3 text-right text-slate-500">₱1,200.00</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">₱1,320.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Card className="p-6 mb-8 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              AI Financial Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Deep analysis of your spending habits and financial future</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleDetailedInsights} className="text-xs h-9 px-4">
              <ArrowRight size={14} className={`transition-transform ${detailedInsights ? "rotate-180" : ""}`} />
              {detailedInsights ? "View Less" : "View More"}
            </Button>
          </div>
        </div>

        {/* Initial Grid: Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* High-Level Financial Analysis Card */}
          <Card className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 hover:bg-emerald-50 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                <Clapperboard size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Financial Summary</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
              Your income stability is high, with a projected 12.4% increase, while expenses show a manageable 4.2% rise.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-600 font-semibold">
              <Star size={12} />
              Strong growth profile detected
            </div>
          </Card>

          {/* Risk Management Card */}
          <Card className="bg-amber-50/40 border border-amber-100 rounded-2xl p-5 hover:bg-amber-50 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Risk Level: Low</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Detected 3 subscription spikes totaling ₱1,240. Risk factors remain low due to high savings rate buffer.
            </p>
            <div className="w-full bg-amber-100/50 rounded-full h-1 mt-4">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "25%" }} />
            </div>
          </Card>

          {/* Smart Opportunities Card */}
          <Card className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 hover:bg-blue-50 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <Star size={20} />
              </div>
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Growth Potential</span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Potential to save ₱3,500/mo by optimizing recurring transportation and dining subscriptions.
            </p>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1 p-0 h-auto">
                View optimization plan
                <ArrowRight size={10} />
              </Button>
            </div>
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
                  <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-sm transition-all group">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 mb-1">Optimize Transportation Budget</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">Reduce variable commute costs by 15% through consolidated travel or alternative transport methods.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-sm transition-all group">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
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
                <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer">
                  {/* Subtle Background Accent */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50/50 rounded-full blur-2xl"></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="success" className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Low Risk Environment
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">CONFIDENCE: 94%</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                        <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"></div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          <span className="text-slate-900 font-bold">Data Anomaly:</span> Irregular utility spike detected in previous 30-day window (₱820). Recommend usage audit.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                        <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
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
            <Card className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                    <File size={22} />
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
                  <span className="text-sm font-bold text-emerald-600">₱50,400</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Investment Ready</span>
                  <span className="text-sm font-bold text-blue-600">Q3 2025</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Debt Free Target</span>
                  <span className="text-sm font-bold text-amber-600">Q1 2026</span>
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
      />
      <DetailedBreakdownModal
        open={detailedBreakdownModalOpen}
        onClose={() => setDetailedBreakdownModalOpen(false)}
      />
    </div>
  );
}
