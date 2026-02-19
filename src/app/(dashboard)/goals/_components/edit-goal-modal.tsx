"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { updateGoal } from "../_lib/goal-service";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/ui/date-selector";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Home,
  GraduationCap,
  Plane,
  Car,
  Laptop,
  Gift,
  Calendar,
  Users,
  Info,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { GoalFormState, GoalType, GoalPriority, GoalCategory } from "./types";
import { 
  INITIAL_GOAL_FORM_STATE, 
  GOAL_PRIORITIES, 
  GOAL_CATEGORIES, 
  formatCurrency, 
  formatDate 
} from "./constants";

const STEPS = ["Category", "Details", "Review"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  emergency: Shield,
  housing: Home,
  education: GraduationCap,
  travel: Plane,
  transport: Car,
  electronics: Laptop,
  other: Gift,
};

function goalToFormState(goal: GoalType | null): GoalFormState {
  if (!goal) {
    return { ...INITIAL_GOAL_FORM_STATE };
  }
  return {
    name: goal.name,
    target: goal.target.toString(),
    priority: goal.priority,
    category: goal.category,
    deadline: goal.deadline,
    monthlyContribution: goal.monthlyContribution.toString(),
    isFamily: goal.isFamily || false,
  };
}

interface EditGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalType | null;
  onSuccess?: () => void;
}

export function EditGoalModal({ open, onClose, goal, onSuccess }: EditGoalModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<GoalFormState>(() => goalToFormState(goal));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open && goal) {
      setForm(goalToFormState(goal));
      setStep(1);
      setSaveError(null);
    }
  }, [open, goal]);

  const handleClose = useCallback(() => {
    setStep(1);
    onClose();
  }, [onClose]);

  const canContinue =
    (step === 1 && !!form.category) ||
    (step === 2 && form.name !== "" && form.target !== "" && form.deadline !== "" && form.monthlyContribution !== "") ||
    step === 3;

  const handleSubmit = useCallback(async () => {
    if (!goal) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await updateGoal(goal.id, form);
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [goal, form, handleClose, onSuccess]);

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
    <K extends keyof GoalFormState>(key: K, value: GoalFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const selectCategory = useCallback((category: GoalCategory) => {
    updateField("category", category);
  }, [updateField]);

  if (!goal) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Edit Goal
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
        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Goal Category</h4>
              <p className="text-xs text-slate-500">Current: {GOAL_CATEGORIES.find(cat => cat.key === goal.category)?.label || "Other"}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {GOAL_CATEGORIES.map((category) => (
                <div
                  key={category.key}
                  className={cn(
                    "relative p-4 rounded-xl border cursor-pointer transition-all duration-200 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
                    form.category === category.key
                      ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
                      : "border-slate-200"
                  )}
                  onClick={() => selectCategory(category.key)}
                >
                  <div
                    className={cn(
                      "absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200",
                      form.category === category.key ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                  >
                    <Check size={12} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-200 flex-shrink-0",
                        form.category === category.key
                          ? "text-emerald-500 border-slate-100"
                          : "text-slate-500 border-slate-100"
                      )}
                    >
                      {(() => {
                        const IconComponent = CATEGORY_ICONS[category.key];
                        return IconComponent ? <IconComponent size={20} /> : null;
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{category.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Goal Details */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Goal Details</h4>
              <p className="text-xs text-slate-500">Update your goal parameters</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Goal Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      value={form.target}
                      onChange={(e) => updateField("target", e.target.value)}
                      className="w-full pl-6 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Monthly Contribution</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      value={form.monthlyContribution}
                      onChange={(e) => updateField("monthlyContribution", e.target.value)}
                      className="w-full pl-6 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Priority</label>
                  <SearchableDropdown
                    value={form.priority}
                    onChange={(value) => updateField("priority", value as GoalPriority)}
                    options={GOAL_PRIORITIES.map((priority) => ({
                      value: priority.key,
                      label: priority.label,
                    }))}
                    placeholder="Select priority"
                    allowEmpty={false}
                    hideSearch={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Deadline</label>
                  <DateSelector
                    value={form.deadline}
                    onChange={(value) => updateField("deadline", value)}
                    placeholder="Select date"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="isFamily"
                  checked={form.isFamily}
                  onChange={(e) => updateField("isFamily", e.target.checked)}
                  className="w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isFamily" className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <Users size={16} />
                  This is a family goal
                </label>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-start gap-3">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Goal Impact</div>
                  <div className="text-xs opacity-90">
                    Changes will affect all future tracking and calculations
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
              <p className="text-xs text-slate-500">Confirm your goal updates before saving</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Goal Name</div>
                <div className="text-sm font-semibold text-slate-900">{form.name || "Untitled Goal"}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Target Amount</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(form.target || "0")}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Monthly Contribution</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(form.monthlyContribution || "0")}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Category</div>
                <div className="text-sm font-semibold text-slate-900">
                  {GOAL_CATEGORIES.find((cat) => cat.key === form.category)?.label || "Other"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Priority</div>
                <div className="text-sm font-semibold text-slate-900">
                  {GOAL_PRIORITIES.find((p) => p.key === form.priority)?.label || "Medium"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Deadline</div>
                <div className="text-sm font-semibold text-slate-900">{formatDate(form.deadline)}</div>
              </div>

              {form.isFamily && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Goal Type</div>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Users size={14} /> Family Goal
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

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-start gap-3">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Goal Impact</div>
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
          disabled={!canContinue || saving}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 3 ? (
            saving ? (<><Loader2 size={14} className="animate-spin mr-1" /> Saving...</>) : (<>Save Changes <ArrowRight size={14} className="ml-1" /></>)
          ) : (
            <>Continue <ArrowRight size={14} className="ml-1" /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
