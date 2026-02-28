"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useFamily } from "../../family/_lib/use-family";
import { getGoalPermissions, canCreateFamilyGoals, FamilyRoleFromHook } from "../_lib/permissions";
import { createGoal } from "../_lib/goal-service";
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
  Check,
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
  CheckCircle,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Flag,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { GoalFormState, GoalPriority, GoalCategory } from "./types";
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

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddGoalModal({ open, onClose, onSuccess }: AddGoalModalProps) {
  const { user } = useAuth();
  const { familyData, familyState, currentUserRole, isOwner } = useFamily();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<GoalFormState>({ ...INITIAL_GOAL_FORM_STATE });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasFamily = familyState === "has-family" && familyData;
  const familyName = familyData?.name || "";

  // Check permissions
  const permissions = getGoalPermissions(currentUserRole, isOwner, undefined, user?.id);
  const canCreateFamilyGoalsBool = canCreateFamilyGoals(currentUserRole, isOwner);

  const reset = useCallback(() => {
    setStep(1);
    setForm({ ...INITIAL_GOAL_FORM_STATE });
    setSaveError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (step === 1 && form.category !== "general") ||
    (step === 2 && form.name !== "" && form.target !== "" && form.deadline !== "" && form.monthlyContribution !== "") ||
    step === 3;

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    
    // Pass family_id for family goals
    const goalForm = {
      ...form,
      family_id: form.isFamily && familyData?.id ? familyData.id : undefined
    };
    
    const { error } = await createGoal(user.id, goalForm);
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [user, form, familyData, handleClose, onSuccess]);

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

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Create Goal
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
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Choose Goal Category</h4>
              <p className="text-xs text-slate-500">Select what type of goal you want to create</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {GOAL_CATEGORIES.map((category) => {
                const IconComponent = CATEGORY_ICONS[category.key];
                return (
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
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{category.label}</div>
                      </div>
                    </div>
                  </div>
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
              <p className="text-xs text-slate-500">Configure your goal parameters</p>
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
                icon={<Users size={16} />}
              />

              {form.isFamily && hasFamily && canCreateFamilyGoalsBool && (
                <div className="p-3 rounded-lg border border-emerald-100 text-emerald-700 flex items-start gap-3">
                  <Users size={16} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-2">Family Goal Permissions</div>
                    <div className="text-xs opacity-90 mb-2">
                      This goal will be shared with your family: <span className="font-semibold">{familyName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {permissions.canEdit && (
                        <span className="px-2 py-1 border border-emerald-200 text-emerald-700 rounded-full text-xs">Can Edit</span>
                      )}
                      {permissions.canDelete && (
                        <span className="px-2 py-1 border border-red-200 text-red-700 rounded-full text-xs">Can Delete</span>
                      )}
                      {permissions.canContribute && (
                        <span className="px-2 py-1 border border-blue-200 text-blue-700 rounded-full text-xs">Can Contribute</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!hasFamily && (
                <div className="p-3 rounded-lg border border-amber-100 text-amber-700 flex items-start gap-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">No Family Available</div>
                    <div className="text-xs opacity-90">
                      You need to join or create a family to create family goals
                    </div>
                  </div>
                </div>
              )}

              {hasFamily && !canCreateFamilyGoalsBool && (
                <div className="p-3 rounded-lg border border-red-100 text-red-700 flex items-start gap-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Insufficient Permissions</div>
                    <div className="text-xs opacity-90">
                      Your role as <span className="font-semibold capitalize">{currentUserRole}</span> does not allow creating family goals. Only Owners and Admins can create family goals.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg border border-blue-100 text-blue-700 flex items-start gap-3">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Goal Planning</div>
                  <div className="text-xs opacity-90">
                    Set realistic targets and monthly contributions to stay on track
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
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Goal</h4>
              <p className="text-xs text-slate-500">Confirm your goal details before creating</p>
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

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-start gap-3">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Ready to Create</div>
                <div className="text-xs opacity-90">
                  Your goal is ready to be created and will start tracking immediately
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
            saving ? (<><Loader2 size={14} className="animate-spin mr-1" /> Creating...</>) : (<>Create Goal <ArrowRight size={14} className="ml-1" /></>)
          ) : (
            <>Continue <ArrowRight size={14} className="ml-1" /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
