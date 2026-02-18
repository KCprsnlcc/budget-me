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
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { BudgetFormState, BudgetPeriod, CategoryOption } from "./types";
import { INITIAL_BUDGET_FORM_STATE } from "./types";
import { BUDGET_PERIODS, formatCurrency, formatDate } from "./constants";
import { useAuth } from "@/components/auth/auth-context";
import { createBudget, fetchExpenseCategories } from "../_lib/budget-service";

const STEPS = ["Period", "Details", "Review"];

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddBudgetModal({ open, onClose, onSuccess }: AddBudgetModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BudgetFormState>({ ...INITIAL_BUDGET_FORM_STATE });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Lookup data
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (!open || !user) return;
    fetchExpenseCategories(user.id).then(setCategories);
  }, [open, user]);

  const reset = useCallback(() => {
    setStep(1);
    setForm({ ...INITIAL_BUDGET_FORM_STATE });
    setSaveError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (step === 1 && form.period !== null) ||
    (step === 2 && form.budget_name !== "" && form.amount !== "" && form.start_date !== "" && form.end_date !== "") ||
    step === 3;

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await createBudget(user.id, form);
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [user, form, handleClose, onSuccess]);

  const handleNext = useCallback(() => {
    if (step >= 3) {
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  }, [step, handleSubmit]);

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

  // Helper: look up category name for review step
  const catName = categories.find((c) => c.id === form.category_id)?.category_name ?? "—";

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Create Budget
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
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Choose Budget Period</h4>
              <p className="text-xs text-slate-500">Select how often your budget resets</p>
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
                          ? "text-emerald-500 border-slate-100"
                          : "text-slate-500 border-slate-100"
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
              <p className="text-xs text-slate-500">Configure your budget parameters</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Budget Name</label>
                <input
                  type="text"
                  value={form.budget_name}
                  onChange={(e) => updateField("budget_name", e.target.value)}
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
                    value={form.category_id}
                    onChange={(e) => updateField("category_id", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
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
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Budget</h4>
              <p className="text-xs text-slate-500">Confirm your budget details before creating</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Budget Name</div>
                <div className="text-sm font-semibold text-slate-900">{form.budget_name || "Untitled Budget"}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Amount</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(form.amount || "0")}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Category</div>
                <div className="text-sm font-semibold text-slate-900">{catName}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Period</div>
                <div className="text-sm font-semibold text-slate-900">
                  {BUDGET_PERIODS.find((p) => p.key === form.period)?.label || "Monthly"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Start Date</div>
                <div className="text-sm font-semibold text-slate-900">{form.start_date ? formatDate(form.start_date) : "—"}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">End Date</div>
                <div className="text-sm font-semibold text-slate-900">{form.end_date ? formatDate(form.end_date) : "—"}</div>
              </div>
            </div>

            {saveError && (
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                  <p className="text-[11px] leading-relaxed opacity-85">{saveError}</p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-start gap-3">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Ready to Create</div>
                <div className="text-xs opacity-90">
                  Your budget is ready to be created and will start tracking immediately
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
          disabled={!canContinue || saving}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 3 ? (
            saving ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : "Create Budget"
          ) : "Continue"}
          {step < 3 && <ArrowRight size={14} className="ml-1" />}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
