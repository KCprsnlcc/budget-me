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
  Briefcase,
} from "lucide-react";
import { Stepper } from "./stepper";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { BudgetType } from "./types";
import { deriveBudgetHealth } from "./types";
import { formatCurrency, formatDate, getDaysRemaining } from "./constants";
import { BUDGET_PERIODS } from "./constants";

const STEPS = ["Overview", "Analysis"];


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
  const percentage = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
  const daysRemaining = getDaysRemaining(budget.start_date, budget.period, budget.end_date);
  const healthStatus = deriveBudgetHealth(budget.spent, budget.amount);
  const categoryLabel = budget.expense_category_name ?? budget.category_name ?? "Uncategorized";

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
            <Briefcase size={14} />
          </div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{budget.budget_name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {/* Amount Display */}
            <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Remaining Amount</div>
              <div className="text-3xl font-bold text-emerald-600">{formatCurrency(remaining)}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">of {formatCurrency(budget.amount)} limit</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{percentage}%</span>
                </div>
                <ProgressBar value={budget.spent} max={budget.amount} color="success" className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Status</div>
                  <div className="text-sm font-semibold text-gray-900">
                    <Badge variant={healthStatus === "on-track" ? "success" : healthStatus === "caution" ? "warning" : "danger"}>
                      {healthStatus === "on-track" ? "On Track" : healthStatus === "caution" ? "Caution" : "At Risk"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Period</div>
                  <div className="text-sm font-semibold text-gray-900 capitalize">{BUDGET_PERIODS.find((p) => p.key === budget.period)?.label ?? budget.period}</div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Start Date</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDate(budget.start_date)}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Days Left</div>
                  <div className="text-sm font-semibold text-gray-900">{daysRemaining} days</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 p-3 rounded-lg text-xs border border-gray-200 text-gray-700 items-start">
              <Info size={16} className="flex-shrink-0 mt-px text-blue-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Budget Performance</h4>
                <p className="text-[11px] leading-relaxed">
                  You're on track with {percentage}% of your budget used and {daysRemaining} days remaining.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Analysis */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1">Budget Analysis & Insights</h2>
              <p className="text-[11px] text-gray-500">Comprehensive budget performance and trends</p>
            </div>

            {/* Budget Performance Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB]/50 rounded-lg p-3 border border-gray-100">
                <div className="text-[10px] text-gray-500 mb-2">Budget Utilization</div>
                <div className="flex items-center justify-center h-16">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-3 border-gray-200"></div>
                    <div
                      className="absolute inset-0 w-14 h-14 rounded-full border-3 border-emerald-500 border-t-transparent rotate-45"
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{percentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-gray-700">{formatCurrency(remaining)}</div>
                  <div className="text-[9px] text-gray-500">remaining</div>
                </div>
              </div>

              <div className="bg-[#F9FAFB]/50 rounded-lg p-3 border border-gray-100">
                <div className="text-[10px] text-gray-500 mb-2">Spending Trend</div>
                <div className="h-16 flex items-end justify-center gap-1">
                  <div className="w-2 bg-gray-300 h-1/2 rounded-t-sm"></div>
                  <div className="w-2 bg-gray-300 h-2/3 rounded-t-sm"></div>
                  <div className="w-2 bg-emerald-500 h-3/4 rounded-t-sm"></div>
                  <div className="w-2 bg-amber-500 h-full rounded-t-sm"></div>
                  <div className="w-2 bg-gray-300 h-2/3 rounded-t-sm"></div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-gray-700 flex items-center justify-center gap-1">
                    {percentage > 80 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(percentage - 100)}%
                  </div>
                  <div className="text-[9px] text-gray-500">vs avg</div>
                </div>
              </div>
            </div>

            {/* Budget Details */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <DetailRow label="Budget Name" value={budget.budget_name} />
                <DetailRow label="Budget Amount" value={formatCurrency(budget.amount)} />
                <DetailRow label="Amount Spent" value={formatCurrency(budget.spent)} />
                <DetailRow label="Remaining" value={formatCurrency(remaining)} valueColor="text-emerald-600" />
                <DetailRow label="Period" value={BUDGET_PERIODS.find((p) => p.key === budget.period)?.label ?? budget.period} />
                <DetailRow label="Start Date" value={formatDate(budget.start_date)} />
                <DetailRow label="Status">
                  <Badge variant={healthStatus === "on-track" ? "success" : healthStatus === "caution" ? "warning" : "danger"}>
                    {healthStatus === "on-track" ? "On Track" : healthStatus === "caution" ? "Caution" : "At Risk"}
                  </Badge>
                </DetailRow>
              </div>
            </div>

            {/* Category Comparison */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-3">Category Comparison</h4>
              <div className="bg-[#F9FAFB]/50 rounded-lg p-3 border border-gray-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-gray-600">{budget.budget_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{formatCurrency(budget.spent)}</span>
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

function DetailRow({
  label,
  value,
  valueColor,
  children,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
        {label}
      </span>
      {children ?? (
        <span className={cn("text-[13px] font-semibold", valueColor || "text-gray-700")}>{value}</span>
      )}
    </div>
  );
}
