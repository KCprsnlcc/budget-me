"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useFamily } from "../../family/_lib/use-family";
import { getGoalPermissions, canCreateFamilyGoals, canEditGoal, FamilyRoleFromHook } from "../_lib/permissions";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  TrendingUp,
  Flag,
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
  vacation: Plane,
  house: Home,
  car: Car,
  education: GraduationCap,
  retirement: TrendingUp,
  debt: ArrowRight,
  general: Flag,
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
    isPublic: goal.is_public || false,
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
  const { familyData, familyState, currentUserRole, isOwner, handleUpdateFamilyGoal } = useFamily();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<GoalFormState>(() => goalToFormState(goal));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasFamily = familyState === "has-family" && familyData;
  const familyName = familyData?.name || "";

  // Check permissions
  const permissions = getGoalPermissions(currentUserRole, isOwner, goal?.user_id, user?.id);
  const canCreateFamilyGoalsBool = canCreateFamilyGoals(currentUserRole, isOwner);
  const canEditThisGoal = goal ? canEditGoal(goal, currentUserRole, isOwner, user?.id) : false;

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

    // Double-check permissions before submitting
    if (!canEditThisGoal) {
      setSaveError("You don't have permission to edit this goal");
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    let error: string | null = null;
    
    if (form.isFamily && familyData?.id) {
      // Use family goal handler with activity logging
      const result = await handleUpdateFamilyGoal(goal.id, form);
      error = result.error;
    } else {
      // Use regular goal handler for individual goals
      const goalForm = {
        ...form,
        family_id: undefined
      };
      const result = await updateGoal(goal.id, goalForm);
      error = result.error;
    }
    
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [goal, form, familyData, canEditThisGoal, handleUpdateFamilyGoal, handleClose, onSuccess]);

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
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Edit Goal
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Step {step} of 3
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1">Goal Category</h2>
              <p className="text-[11px] text-gray-500">
                Current: <span className="font-semibold text-emerald-600">{GOAL_CATEGORIES.find(cat => cat.key === goal.category)?.label || "Other"}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {GOAL_CATEGORIES.map((category, idx) => {
                const IconComponent = CATEGORY_ICONS[category.key];
                const selected = form.category === category.key;
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => selectCategory(category.key)}
                    className={cn(
                      "relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white",
                      selected
                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                    )}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white",
                          selected
                            ? "text-gray-700 border-gray-200"
                            : "text-gray-400 border-gray-100"
                        )}
                      >
                        {IconComponent ? <IconComponent size={18} /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{category.label}</h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{category.description}</p>
                      </div>
                      {/* Check indicator */}
                      <div
                        className={cn(
                          "w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200",
                          selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                      >
                        <Check size={10} />
                      </div>
                    </div>
                  </button>
                );
              })}
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
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

              <Checkbox
                id="isFamily"
                checked={form.isFamily || false}
                onChange={(checked) => updateField("isFamily", checked)}
                disabled={!hasFamily || !canCreateFamilyGoalsBool}
                label="This is a family goal"
              />

              {form.isFamily && hasFamily && canCreateFamilyGoalsBool && (
                <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                  <Users size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-2 text-gray-900">Family Goal Permissions</div>
                    <div className="text-xs text-gray-600 mb-2">
                      This goal will be shared with your family: <span className="font-semibold">{familyName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {permissions.canEdit && (
                        <span className="px-2 py-1 border border-gray-200 text-gray-700 rounded-full text-xs bg-white">Can Edit</span>
                      )}
                      {permissions.canDelete && (
                        <span className="px-2 py-1 border border-gray-200 text-gray-700 rounded-full text-xs bg-white">Can Delete</span>
                      )}
                      {permissions.canContribute && (
                        <span className="px-2 py-1 border border-gray-200 text-gray-700 rounded-full text-xs bg-white">Can Contribute</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!hasFamily && (
                <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">No Family Available</div>
                    <div className="text-xs text-gray-600">
                      You need to join or create a family to create family goals
                    </div>
                  </div>
                </div>
              )}

              {hasFamily && !canCreateFamilyGoalsBool && (
                <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">Insufficient Permissions</div>
                    <div className="text-xs text-gray-600">
                      Your role as <span className="font-semibold capitalize">{currentUserRole}</span> does not allow creating family goals. Only Owners and Admins can create family goals.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">Goal Impact</div>
                  <div className="text-xs text-gray-600">
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

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Goal Name</span>
                  <span className="text-[13px] font-semibold text-gray-700">{form.name || "Untitled Goal"}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Target Amount</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(form.target || "0")}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Monthly Contribution</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(form.monthlyContribution || "0")}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Category</span>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {GOAL_CATEGORIES.find((cat) => cat.key === form.category)?.label || "Other"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Priority</span>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {GOAL_PRIORITIES.find((p) => p.key === form.priority)?.label || "Medium"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Deadline</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formatDate(form.deadline)}</span>
                </div>
                {form.isFamily && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Goal Type</span>
                    <span className="text-[13px] font-semibold text-gray-700 flex items-center gap-2">
                      <Users size={14} /> Family Goal
                    </span>
                  </div>
                )}
              </div>
            </div>

            {saveError && (
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                  <p className="text-[11px] leading-relaxed">{saveError}</p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-start gap-3">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                <div className="font-medium text-sm text-gray-900">Goal Impact</div>
                <div className="text-xs text-gray-600">
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
