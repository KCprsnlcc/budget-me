"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Brain,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface DetailedBreakdownModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["Overview", "Monthly Breakdown", "Category Analysis"];

export function DetailedBreakdownModal({ open, onClose }: DetailedBreakdownModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleNext = useCallback(() => {
    if (step === STEPS.length) {
      handleClose();
    } else {
      setStep(step + 1);
    }
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const canContinue = true; // Always allow continue (final step closes modal)

  return (
    <Modal open={open} onClose={handleClose} className="max-w-3xl">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Detailed Breakdown
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <div className="flex items-center justify-center px-5 py-3.5 bg-white border-b border-slate-100" aria-label="Progress">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;

          return (
            <div key={label} className="flex items-center">
              {idx > 0 && (
                <div
                  className={`w-9 h-[1.5px] mx-1.5 mb-[18px] flex-shrink-0 transition-colors duration-300 ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold border-[1.5px] transition-all duration-300 relative z-[2] flex-shrink-0 ${
                    isActive
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <CheckCircle size={12} /> : stepNum}
                </div>
                <span
                  className={`text-[9px] font-semibold mt-1 text-center uppercase tracking-[0.05em] transition-colors duration-200 ${
                    isActive
                      ? "text-emerald-500"
                      : isCompleted
                      ? "text-slate-600"
                      : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Total Predicted Income
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-2">₱25,350</div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">+12.4% vs last month</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Total Predicted Expenses
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-2">₱16,950</div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-600 font-medium">+4.2% vs last month</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Net Savings Projection
                </div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">₱8,400</div>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-500" />
                  <span className="text-sm text-blue-600 font-medium">95% of goal</span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">Key Insights</h3>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-900">Strong Income Growth</h4>
                    <p className="text-xs text-emerald-700 mt-1">Projected 12.4% increase in monthly income based on historical patterns and market trends.</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Expense Monitoring Needed</h4>
                    <p className="text-xs text-amber-700 mt-1">Utility bills showing 4.2% increase, consider energy-saving measures.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Monthly Breakdown */}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            <h3 className="text-[15px] font-bold text-slate-900">Monthly Projection Breakdown</h3>
            
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 space-y-0 divide-y divide-slate-100">
                {[
                  { month: "January", income: 8500, expenses: 5200, savings: 3300, confidence: 92 },
                  { month: "February", income: 8800, expenses: 5500, savings: 3300, confidence: 89 },
                  { month: "March", income: 9200, expenses: 6000, savings: 3200, confidence: 94 },
                ].map((item) => (
                  <div key={item.month} className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900">{item.month}</span>
                      <Badge variant={item.confidence >= 90 ? "success" : "warning"} className="text-xs">
                        {item.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Income</span>
                        <div className="font-semibold text-emerald-600">₱{item.income.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Expenses</span>
                        <div className="font-semibold text-amber-600">₱{item.expenses.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Savings</span>
                        <div className="font-semibold text-blue-600">₱{item.savings.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Category Analysis */}
        {step === 3 && (
          <div className="space-y-6 animate-txn-in">
            <h3 className="text-[15px] font-bold text-slate-900">Category-wise Analysis</h3>
            
            <div className="space-y-4">
              {[
                { category: "Food & Dining", current: 420, predicted: 580, change: 38, trend: "up" },
                { category: "Shopping", current: 230, predicted: 450, change: 96, trend: "up" },
                { category: "Transportation", current: 180, predicted: 220, change: 22, trend: "up" },
                { category: "Utilities", current: 1200, predicted: 1320, change: 10, trend: "up" },
              ].map((item) => (
                <div key={item.category} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900">{item.category}</span>
                    <div className="flex items-center gap-2">
                      {item.trend === "up" ? (
                        <TrendingUp size={16} className="text-amber-500" />
                      ) : (
                        <TrendingDown size={16} className="text-emerald-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.trend === "up" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        +{item.change}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Current: </span>
                      <span className="font-medium">₱{item.current}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Predicted: </span>
                      <span className="font-medium">₱{item.predicted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Recommendations */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Brain size={16} className="text-emerald-500" />
                AI Recommendations
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  <p className="text-slate-600">Focus on controlling shopping expenses - highest growth potential detected</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <p className="text-slate-600">Utility optimization could save ₱200/month based on consumption patterns</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="secondary" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} /> Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canContinue}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
        >
          {step === STEPS.length ? (
            <>Close <ArrowRight size={14} /></>
          ) : (
            <>Next <ArrowRight size={14} /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
