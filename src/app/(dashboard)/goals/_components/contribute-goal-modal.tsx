"use client";

import { useState, useCallback } from "react";
import { contributeToGoal } from "../_lib/goal-service";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Flag,
  TrendingUp,
  Calendar,
  CheckCircle,
  Info,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { GoalType } from "./types";
import { 
  formatCurrency, 
  formatDate, 
  getDaysRemaining,
  getGoalProgress 
} from "./constants";

const STEPS = ["Amount", "Review"];

interface ContributeGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalType | null;
  onSuccess?: () => void;
}

export function ContributeGoalModal({ open, onClose, goal, onSuccess }: ContributeGoalModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep(1);
    setAmount("");
    setSaveError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (step === 1 && amount !== "" && parseFloat(amount) > 0) ||
    step === 2;

  const handleSubmit = useCallback(async () => {
    if (!goal) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await contributeToGoal(goal.id, parsed);
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [goal, amount, handleClose, onSuccess]);

  const handleNext = useCallback(() => {
    if (step >= 2) {
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  }, [step, handleSubmit]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }, [step]);

  if (!goal) return null;

  const progress = getGoalProgress(goal.current, goal.target);
  const remaining = goal.target - goal.current;
  const daysRemaining = getDaysRemaining(goal.deadline);
  const newProgress = getGoalProgress(goal.current + (parseFloat(amount) || 0), goal.target);
  const newRemaining = goal.target - (goal.current + (parseFloat(amount) || 0));

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <h3 className="text-sm font-semibold text-slate-900">Contribute to Goal</h3>
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
        {/* STEP 1: Amount Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Contribution Amount</h4>
              <p className="text-xs text-slate-500">How much would you like to contribute to {goal.name}?</p>
            </div>

            {/* Goal Summary */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-slate-900">{goal.name}</h4>
                <p className="text-xs text-slate-500">{progress}% complete</p>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Progress:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(goal.current)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(goal.target)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(remaining)}</span>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Contribution Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-3 text-lg font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="0.00"
                  min="0"
                  max={remaining.toString()}
                  step="0.01"
                />
              </div>
              {parseFloat(amount) > remaining && (
                <p className="text-xs text-amber-600 mt-1">
                  Amount exceeds remaining goal target
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Quick amounts:</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  Math.min(25, remaining),
                  Math.min(50, remaining),
                  Math.min(100, remaining),
                  Math.min(goal.monthlyContribution, remaining)
                ].map((quickAmount, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="p-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all"
                  >
                    ₱{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-start gap-3">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Contribution Impact</div>
                <div className="text-xs opacity-90">
                  Your contribution will be immediately reflected in your goal progress
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Contribution</h4>
              <p className="text-xs text-slate-500">Confirm your contribution details</p>
            </div>

            {/* Contribution Summary */}
            <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contribution Amount</div>
              <div className="text-3xl font-bold text-emerald-600">{formatCurrency(amount || "0")}</div>
              <div className="text-xs text-emerald-600/80 mt-1 font-medium">to {goal.name}</div>
            </div>

            {/* Progress Impact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Current Progress</div>
                <div className="text-sm font-semibold text-slate-900">{progress}%</div>
                <div className="text-xs text-slate-500">{formatCurrency(goal.current)}</div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.05em] mb-2">New Progress</div>
                <div className="text-sm font-semibold text-emerald-600">{newProgress}%</div>
                <div className="text-xs text-emerald-500">{formatCurrency(goal.current + (parseFloat(amount) || 0))}</div>
              </div>
            </div>

            {/* Goal Details */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Goal Name</div>
                <div className="text-sm font-semibold text-slate-900">{goal.name}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Remaining After Contribution</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(newRemaining)}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Deadline</div>
                <div className="text-sm font-semibold text-slate-900">{formatDate(goal.deadline)}</div>
              </div>

              {newProgress >= 100 && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.05em] mb-2">Status</div>
                  <div className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                    <CheckCircle size={14} /> Goal Completed!
                  </div>
                </div>
              )}
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
                <div className="font-medium text-sm">Ready to Contribute</div>
                <div className="text-xs opacity-90">
                  Your contribution will be processed immediately
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
          Back
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canContinue || saving}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 2 ? (
            saving ? (<><Loader2 size={14} className="animate-spin mr-1" /> Contributing...</>) : (<><Plus size={14} className="mr-1" /> Contribute</>)
          ) : (
            <>Continue</>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
