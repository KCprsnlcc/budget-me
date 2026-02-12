"use client";

import { useState, useCallback, useEffect } from "react";
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
  Calendar,
  Check,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { BudgetFormState, BudgetType, BudgetPeriod, BudgetCategory } from "./types";
import { INITIAL_BUDGET_FORM_STATE, BUDGET_PERIODS, BUDGET_CATEGORIES, formatCurrency, formatDate } from "./constants";

const STEPS = ["Period", "Details", "Review"];

function budgetToFormState(budget: BudgetType | null): BudgetFormState {
  if (!budget) {
    return { ...INITIAL_BUDGET_FORM_STATE };
  }
  return {
    period: budget.period,
    name: budget.name,
    amount: budget.amount.toString(),
    category: budget.category,
    startDate: budget.startDate,
  };
}

interface EditBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetType | null;
}

export function EditBudgetModal({ open, onClose, budget }: EditBudgetModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BudgetFormState>(() => budgetToFormState(budget));

  useEffect(() => {
    if (open && budget) {
      setForm(budgetToFormState(budget));
      setStep(1);
    }
  }, [open, budget]);

  const handleClose = useCallback(() => {
    setStep(1);
    onClose();
  }, [onClose]);

  const canContinue =
    (step === 1 && form.period !== null) ||
    (step === 2 && form.name !== "" && form.amount !== "" && form.startDate !== "") ||
    step === 3;

  const handleNext = useCallback(() => {
    if (step >= 3) {
      // TODO: Implement actual budget update logic
      handleClose();
      return;
    }
    setStep((s) => s + 1);
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }, [step]);

  const updateField = useCallback(
    <K extends keyof BudgetFormState>(key: K, value: BudgetFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const selectPeriod = useCallback((period: BudgetPeriod) => {
    updateField("period", period);
  }, [updateField]);

  if (!budget) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Edit Budget
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 3
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Period Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Budget Period</h4>
              <p className="text-xs text-slate-500">Current: {budget.period}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {BUDGET_PERIODS.map((period) => (
                <div
                  key={period.key}
                  className={cn(
                    "relative p-4 rounded-xl border cursor-pointer transition-all duration-200 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
                    form.period === period.key
                      ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
                      : "border-slate-200"
                  )}
                  onClick={() => selectPeriod(period.key)}
                >
                  <div
                    className={cn(
                      "absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200",
                      form.period === period.key ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                  >
                    <Check size={12} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-200 flex-shrink-0",
                        form.period === period.key
                          ? "bg-slate-50 text-emerald-500 border-slate-100"
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      )}
                    >
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{period.label}</div>
                      <div className="text-xs text-slate-500">{period.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Budget Details */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Budget Details</h4>
              <p className="text-xs text-slate-500">Update your budget parameters</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Budget Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="e.g., Monthly Groceries"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Budget Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => updateField("amount", e.target.value)}
                      className="w-full pl-6 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value as BudgetCategory)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-start gap-3">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Budget Period</div>
                  <div className="text-xs opacity-90">
                    Your budget will reset automatically based on the selected period
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Changes</h4>
              <p className="text-xs text-slate-500">Confirm your budget updates before saving</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Budget Name</div>
                <div className="text-sm font-semibold text-slate-900">{form.name || "Untitled Budget"}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Amount</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(form.amount || "0")}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Category</div>
                <div className="text-sm font-semibold text-slate-900">
                  {BUDGET_CATEGORIES.find((cat) => cat.value === form.category)?.label || "Other"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Period</div>
                <div className="text-sm font-semibold text-slate-900">
                  {BUDGET_PERIODS.find((p) => p.key === form.period)?.label || "Monthly"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Start Date</div>
                <div className="text-sm font-semibold text-slate-900">{formatDate(form.startDate)}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-start gap-3">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Budget Impact</div>
                <div className="text-xs opacity-90">
                  Changes will affect all future tracking and calculations
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
          disabled={!canContinue}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 3 ? "Save Changes" : "Continue"}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </ModalFooter>
    </Modal>
  );
}
