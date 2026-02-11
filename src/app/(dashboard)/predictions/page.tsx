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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "BudgetMe - AI Predictions" };

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
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <Wand2 size={20} className="text-emerald-500" />
            AI Predictions
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Machine learning-powered spending forecasts and insights
          </p>
        </div>
        <Badge variant="brand" className="px-3 py-1">
          <Brain size={12} className="mr-1" /> Model v3.2 &bull; Updated 2h ago
        </Badge>
      </div>

      {/* Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Predicted Savings</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">$2,840</div>
          <p className="text-[11px] text-slate-500 mt-1">Expected this month based on current patterns</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Predicted Expenses</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">$5,610</div>
          <p className="text-[11px] text-slate-500 mt-1">12% lower than last month&apos;s prediction</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-purple-600" />
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Accuracy Score</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">94.2%</div>
          <p className="text-[11px] text-slate-500 mt-1">Based on last 6 months of predictions</p>
        </Card>
      </div>

      {/* Category Predictions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Category Forecasts</h3>
        <div className="space-y-5">
          {PREDICTIONS.map((pred) => {
            const Icon = pred.icon;
            return (
              <div key={pred.category} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <Icon size={18} className="text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-800">{pred.category}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">
                        {pred.confidence}% confidence
                      </Badge>
                      {pred.trend === "up" ? (
                        <TrendingUp size={14} className="text-red-500" />
                      ) : pred.trend === "down" ? (
                        <TrendingDown size={14} className="text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-2 text-xs">
                    <span className="text-slate-500">
                      Current: <span className="font-semibold text-slate-800">${pred.actual}</span>
                    </span>
                    <span className="text-slate-500">
                      Predicted: <span className="font-semibold text-slate-800">${pred.predicted}</span>
                    </span>
                  </div>
                  <ProgressBar value={pred.actual} max={pred.predicted} color="brand" className="mb-2" />
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lightbulb size={10} className="text-amber-500" />
                    {pred.insight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Detected Anomalies
          </h3>
          <div className="space-y-3">
            {ANOMALIES.map((anomaly) => (
              <div key={anomaly.title} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-xs font-semibold text-slate-800">{anomaly.title}</h4>
                  <span className="text-xs font-bold text-slate-900">{anomaly.amount}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{anomaly.description}</p>
                <button className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
                  {anomaly.action} <ArrowRight size={10} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Savings Opportunities */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Lightbulb size={14} className="text-emerald-500" />
            Savings Opportunities
          </h3>
          <div className="space-y-3">
            {SAVINGS_OPPORTUNITIES.map((opp) => (
              <div key={opp.title} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-slate-800">{opp.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{opp.confidence}% confidence</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">{opp.potential}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
