import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "BudgetMe - Financial Reports" };

const MONTHLY_DATA = [
  { month: "Aug", income: 8200, expenses: 5100 },
  { month: "Sep", income: 8450, expenses: 5800 },
  { month: "Oct", income: 8100, expenses: 4900 },
  { month: "Nov", income: 8700, expenses: 5300 },
  { month: "Dec", income: 9200, expenses: 6100 },
  { month: "Jan", income: 8450, expenses: 5230 },
];

const CATEGORY_BREAKDOWN = [
  { name: "Housing", amount: 1800, percentage: 34.4, color: "bg-slate-800" },
  { name: "Food & Dining", amount: 420, percentage: 8.0, color: "bg-emerald-500" },
  { name: "Shopping", amount: 230, percentage: 4.4, color: "bg-blue-500" },
  { name: "Transportation", amount: 185, percentage: 3.5, color: "bg-amber-500" },
  { name: "Entertainment", amount: 148, percentage: 2.8, color: "bg-purple-500" },
  { name: "Utilities", amount: 220, percentage: 4.2, color: "bg-cyan-500" },
  { name: "Other", amount: 2227, percentage: 42.6, color: "bg-slate-300" },
];

const REPORT_TYPES = [
  { name: "Monthly Summary", description: "Full monthly income & expense report", icon: Calendar },
  { name: "Category Analysis", description: "Spending breakdown by category", icon: PieChart },
  { name: "Trend Report", description: "6-month trend analysis", icon: TrendingUp },
  { name: "Tax Summary", description: "Annual tax-relevant transactions", icon: FileText },
];

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-slate-400" />
            Financial Reports
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Comprehensive analytics and exportable summaries
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download size={14} /> Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Monthly Income", value: "$8,517", change: "+5.2%", up: true },
          { label: "Avg Monthly Expenses", value: "$5,405", change: "-3.8%", up: false },
          { label: "Avg Savings Rate", value: "36.5%", change: "+2.1%", up: true },
          { label: "Total Net Worth", value: "$124,800", change: "+8.4%", up: true },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{m.label}</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{m.value}</div>
            <div className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${m.up ? "text-emerald-600" : "text-red-500"}`}>
              {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {m.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-6">Income vs Expenses (6 Months)</h3>
          <div className="relative h-52 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
            {MONTHLY_DATA.map((d) => {
              const maxVal = 10000;
              return (
                <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center cursor-pointer">
                  <div className="w-4 rounded-t bg-slate-800 opacity-90 hover:opacity-100 transition-all" style={{ height: `${(d.income / maxVal) * 100}%` }} />
                  <div className="w-4 rounded-t bg-emerald-500 opacity-90 hover:opacity-100 transition-all" style={{ height: `${(d.expenses / maxVal) * 100}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between px-2 mt-2">
            {MONTHLY_DATA.map((d) => (
              <span key={d.month} className="text-[10px] text-slate-400 flex-1 text-center">{d.month}</span>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-800" /> Income</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Expenses</span>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Spending by Category</h3>

          {/* Simple Donut */}
          <div className="w-24 h-24 rounded-full mx-auto mb-5 relative" style={{ background: `conic-gradient(#1e293b 0% 34.4%, #10b981 34.4% 42.4%, #3b82f6 42.4% 46.8%, #f59e0b 46.8% 50.3%, #a855f7 50.3% 53.1%, #06b6d4 53.1% 57.3%, #cbd5e1 57.3% 100%)` }}>
            <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
              <span className="text-xs font-bold text-slate-900">$5,230</span>
            </div>
          </div>

          <div className="space-y-3">
            {CATEGORY_BREAKDOWN.slice(0, 5).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span className="text-[11px] text-slate-600">{cat.name}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-800">${cat.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Report Templates */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            return (
              <button key={report.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left cursor-pointer group">
                <Icon size={20} className="text-slate-400 mb-3 group-hover:text-emerald-500 transition-colors" />
                <h4 className="text-xs font-semibold text-slate-800 mb-1">{report.name}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">{report.description}</p>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
