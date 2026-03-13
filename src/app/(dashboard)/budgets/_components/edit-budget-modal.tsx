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
import { DateSelector } from "@/components/ui/date-selector";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Info,
  AlertTriangle,
  Loader2,
  Home,
  Car,
  Utensils,
  ShoppingCart as ShoppingCartIcon,
  Zap,
  Heart,
  Film,
  Package,
  BookOpen,
  Shield,
  PhilippinePeso,
  Laptop,
  TrendingUp as TrendingUpIcon,
  Building,
  Rocket,
  Gift,
  Banknote,
  FileText,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { BudgetFormState, BudgetType, BudgetPeriod, CategoryOption } from "./types";
import { INITIAL_BUDGET_FORM_STATE } from "./types";
import { BUDGET_PERIODS, formatCurrency, formatDate } from "./constants";
import { useAuth } from "@/components/auth/auth-context";
import { updateBudget, fetchExpenseCategories } from "../_lib/budget-service";

const STEPS = ["Period", "Details", "Review"];

function getLucideIcon(emoji: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    "🏠": Home,
    "🚗": Car,
    "🍽️": Utensils,
    "🛒": ShoppingCartIcon,
    "💡": Zap,
    "⚕️": Heart,
    "🎬": Film,
    "🛍️": Package,
    "📚": BookOpen,
    "🛡️": Shield,
    
    "💰": PhilippinePeso,
    "💻": Laptop,
    "📈": TrendingUpIcon,
    "🏢": Building,
    "💼": FileText,
    "🚀": Rocket,
    "🎁": Gift,
    "💵": Banknote,
    
    "📋": FileText,
  };
  
  return iconMap[emoji] || FileText;
}

function budgetToFormState(budget: BudgetType | null): BudgetFormState {
  if (!budget) {
    return { ...INITIAL_BUDGET_FORM_STATE };
  }
  return {
    period: budget.period,
    budget_name: budget.budget_name,
    amount: budget.amount.toString(),
    category_id: budget.category_id ?? "",
    start_date: budget.start_date,
    end_date: budget.end_date,
    description: budget.description ?? "",
  };
}

interface EditBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetType | null;
  onSuccess?: () => void;
}

export function EditBudgetModal({ open, onClose, budget, onSuccess }: EditBudgetModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BudgetFormState>(() => budgetToFormState(budget));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    fetchExpenseCategories(user.id).then(setCategories);
  }, [open, user]);

  useEffect(() => {
    if (open && budget) {
      setForm(budgetToFormState(budget));
      setStep(1);
      setSaveError(null);
    }
  }, [open, budget]);

  const handleClose = useCallback(() => {
    setStep(1);
    setSaveError(null);
    onClose();
  }, [onClose]);

  const canContinue =
    (step === 1 && form.period !== null) ||
    (step === 2 && form.budget_name !== "" && form.amount !== "" && form.start_date !== "" && form.end_date !== "") ||
    step === 3;

  const handleSubmit = useCallback(async () => {
    if (!budget) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await updateBudget(budget.id, form);
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [budget, form, handleClose, onSuccess]);

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

  const catName = categories.find((c) => c.id === form.category_id)?.category_name ?? "—";

  if (!budget) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Edit Budget
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Step {step} of 3
          </span>
        </div>
      </ModalHeader>

      <Stepper steps={STEPS} currentStep={step} />

      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {step === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1">Budget Period</h2>
              <p className="text-[11px] text-gray-500">
                Current: <span className="font-semibold text-emerald-600">{BUDGET_PERIODS.find((p) => p.key === budget.period)?.label ?? budget.period}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {BUDGET_PERIODS.map((period, idx) => {
                const selected = form.period === period.key;
                return (
                  <button
                    key={period.key}
                    type="button"
                    onClick={() => selectPeriod(period.key)}
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
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{period.label}</h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{period.description}</p>
                      </div>
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

        {step === 2 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1">Budget Details</h2>
              <p className="text-[11px] text-gray-500">Update your budget parameters</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Budget Name <span className="text-gray-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.budget_name}
                  onChange={(e) => updateField("budget_name", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="e.g., Monthly Groceries"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                    Budget Amount <span className="text-gray-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₱</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => updateField("amount", e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                    Category
                  </label>
                  <SearchableDropdown
                    value={form.category_id}
                    onChange={(value) => updateField("category_id", value)}
                    options={categories.map((cat) => ({
                      value: cat.id,
                      label: cat.category_name,
                      icon: cat.icon ? getLucideIcon(cat.icon) : undefined,
                    }))}
                    placeholder="Select category..."
                    allowEmpty={true}
                    emptyLabel="Select category..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                    Start Date <span className="text-gray-400">*</span>
                  </label>
                  <DateSelector
                    value={form.start_date}
                    onChange={(value) => updateField("start_date", value)}
                    placeholder="Select start date"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                    End Date <span className="text-gray-400">*</span>
                  </label>
                  <DateSelector
                    value={form.end_date}
                    onChange={(value) => updateField("end_date", value)}
                    placeholder="Select end date"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1">Review Changes</h2>
              <p className="text-[11px] text-gray-500">Confirm your budget updates before saving</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-gray-100">
                  <ReviewRow label="Budget Name" value={form.budget_name || "Untitled Budget"} />
                  <ReviewRow label="Amount" value={formatCurrency(form.amount || "0")} />
                  <ReviewRow label="Category" value={catName} />
                  <ReviewRow label="Period" value={BUDGET_PERIODS.find((p) => p.key === form.period)?.label || "Monthly"} />
                  <ReviewRow label="Start Date" value={form.start_date ? formatDate(form.start_date) : "—"} />
                  <ReviewRow label="End Date" value={form.end_date ? formatDate(form.end_date) : "—"} />
                </div>
              </div>

              {saveError && (
                <div className="flex gap-2.5 p-3 rounded-lg text-xs border border-gray-200 text-gray-700 items-start">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                    <p className="text-[11px] leading-relaxed">{saveError}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 p-3 rounded-lg text-xs border border-gray-200 text-gray-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Budget Impact</h4>
                  <p className="text-[11px] leading-relaxed">
                    Changes will affect all future tracking and calculations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

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
            saving ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : "Save Changes"
          ) : "Continue"}
          {step < 3 && <ArrowRight size={14} className="ml-1" />}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
      <span className="text-[13px] font-semibold text-gray-700">{value}</span>
    </div>
  );
}
