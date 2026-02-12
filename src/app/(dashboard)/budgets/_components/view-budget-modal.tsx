"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Utensils,
  Car,
  Music,
  Home,
  Zap,
  Heart,
  Briefcase,
} from "lucide-react";
import { Stepper } from "./stepper";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { BudgetType } from "./types";
import { formatCurrency, formatDate, getDaysRemaining } from "./constants";

const STEPS = ["Overview", "Analysis"];

const CATEGORY_ICONS = {
  food: Utensils,
  transportation: Car,
  entertainment: Music,
  housing: Home,
  utilities: Zap,
  healthcare: Heart,
  other: Briefcase,
};

interface ViewBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetType | null;
  onEdit?: (budget: BudgetType) => void;
}

export function ViewBudgetModal({
  open,
  onClose,
  budget,
  onEdit,
}: ViewBudgetModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleNext = useCallback(() => {
    if (step >= 2) {
      handleClose();
      return;
    }
    setStep((s) => s + 1);
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }, [step]);

  const handleEditClick = useCallback(() => {
    if (budget && onEdit) {
      handleClose();
      setTimeout(() => {
        onEdit(budget);
      }, 150);
    }
  }, [budget, onEdit, handleClose]);

  if (!budget) return null;

  const remaining = budget.amount - budget.spent;
  const percentage = Math.round((budget.spent / budget.amount) * 100);
  const daysRemaining = getDaysRemaining(budget.startDate, budget.period);
  const IconComponent = CATEGORY_ICONS[budget.category];

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg text-emerald-600">
            <IconComponent size={18} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{budget.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-4 animate-txn-in">
            <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Remaining Amount</div>
              <div className="text-3xl font-bold text-emerald-600">{formatCurrency(remaining)}</div>
              <div className="text-xs text-emerald-600/80 mt-1 font-medium">of {formatCurrency(budget.amount)} limit</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium text-slate-900">{percentage}%</span>
                </div>
                <ProgressBar value={budget.spent} max={budget.amount} color="success" className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Status</div>
                  <div className="text-sm font-semibold text-slate-900">
                    <Badge variant={budget.status === "on-track" ? "success" : budget.status === "caution" ? "warning" : "danger"}>
                      {budget.status === "on-track" ? "On Track" : budget.status === "caution" ? "Caution" : "At Risk"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Period</div>
                  <div className="text-sm font-semibold text-slate-900 capitalize">{budget.period}</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Reset Date</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatDate(budget.startDate)}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Days Left</div>
                  <div className="text-sm font-semibold text-slate-900">{daysRemaining} days</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-start gap-3">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Budget Performance</div>
                <div className="text-xs opacity-90">
                  You're on track with {percentage}% of your budget used and {daysRemaining} days remaining.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Analysis */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Budget Analysis & Insights</h4>
              <p className="text-xs text-slate-500">Comprehensive budget performance and trends</p>
            </div>

            {/* Budget Performance Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 mb-2">Budget Utilization</div>
                <div className="flex items-center justify-center h-16">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-3 border-slate-200"></div>
                    <div
                      className="absolute inset-0 w-14 h-14 rounded-full border-3 border-emerald-500 border-t-transparent rotate-45"
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700">{percentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-slate-700">{formatCurrency(remaining)}</div>
                  <div className="text-[9px] text-slate-500">remaining</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 mb-2">Spending Trend</div>
                <div className="h-16 flex items-end justify-center gap-1">
                  <div className="w-2 bg-slate-300 h-1/2 rounded-t-sm"></div>
                  <div className="w-2 bg-slate-300 h-2/3 rounded-t-sm"></div>
                  <div className="w-2 bg-emerald-500 h-3/4 rounded-t-sm"></div>
                  <div className="w-2 bg-amber-500 h-full rounded-t-sm"></div>
                  <div className="w-2 bg-slate-300 h-2/3 rounded-t-sm"></div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1">
                    {percentage > 80 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(percentage - 100)}%
                  </div>
                  <div className="text-[9px] text-slate-500">vs avg</div>
                </div>
              </div>
            </div>

            {/* Budget Details */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Budget Name</div>
                <div className="text-sm font-semibold text-slate-900">{budget.name}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Budget Amount</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(budget.amount)}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Amount Spent</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(budget.spent)}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Remaining</div>
                <div className="text-sm font-semibold text-slate-900 text-emerald-600">{formatCurrency(remaining)}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Period</div>
                <div className="text-sm font-semibold text-slate-900 capitalize">{budget.period}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Start Date</div>
                <div className="text-sm font-semibold text-slate-900">{formatDate(budget.startDate)}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Status</div>
                <div className="text-sm font-semibold text-slate-900">
                  <Badge variant={budget.status === "on-track" ? "success" : budget.status === "caution" ? "warning" : "danger"}>
                    {budget.status === "on-track" ? "On Track" : budget.status === "caution" ? "Caution" : "At Risk"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Category Comparison */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-3">Category Comparison</h4>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-slate-600">{budget.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{formatCurrency(budget.spent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className={cn("transition-all", step === 1 ? "invisible" : "")}
        >
          <ArrowLeft size={14} className="mr-1" />
          Back
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={handleNext}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 2 ? "Close" : "View Analysis"}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </ModalFooter>
    </Modal>
  );
}
