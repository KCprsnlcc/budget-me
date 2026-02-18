"use client";

import { useState, useCallback, useEffect } from "react";
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
  Check,
  MinusCircle,
  PlusCircle,
  Flag,
  AlertTriangle,
  PiggyBank,
  ClipboardCheck,
  PenSquare,
  Loader2,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { TxnKind, TxnFormState, AccountOption, CategoryOption, BudgetOption, GoalOption } from "./types";
import { INITIAL_FORM_STATE } from "./types";
import { useAuth } from "@/components/auth/auth-context";
import {
  createTransaction,
  fetchAccounts,
  fetchExpenseCategories,
  fetchIncomeCategories,
  fetchBudgets,
  fetchGoals,
} from "../_lib/transaction-service";

const STEPS = ["Type", "Details", "Review"];

const TYPE_OPTIONS: { key: TxnKind; label: string; desc: string; icon: React.ElementType }[] = [
  { key: "expense", label: "Expense", desc: "Money spent on goods, services, or bills.", icon: MinusCircle },
  { key: "income", label: "Income", desc: "Money received from salary, investments, or other sources.", icon: PlusCircle },
  { key: "contribution", label: "Contribution", desc: "Money allocated to savings goals or investments.", icon: Flag },
];

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTransactionModal({ open, onClose, onSuccess }: AddTransactionModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TxnFormState>({ ...INITIAL_FORM_STATE });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Lookup data
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryOption[]>([]);
  const [budgets, setBudgets] = useState<BudgetOption[]>([]);
  const [goals, setGoals] = useState<GoalOption[]>([]);

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (!open || !user) return;
    const uid = user.id;
    Promise.all([
      fetchAccounts(uid),
      fetchExpenseCategories(uid),
      fetchIncomeCategories(uid),
      fetchBudgets(uid),
      fetchGoals(uid),
    ]).then(([a, ec, ic, b, g]) => {
      setAccounts(a);
      setExpenseCategories(ec);
      setIncomeCategories(ic);
      setBudgets(b);
      setGoals(g);
    });
  }, [open, user]);

  const categories = form.type === "income" ? incomeCategories : expenseCategories;
  const categoryFieldKey = form.type === "income" ? "income_category_id" : "expense_category_id";
  const categoryValue = form.type === "income" ? form.income_category_id : form.expense_category_id;

  const reset = useCallback(() => {
    setStep(1);
    setForm({ ...INITIAL_FORM_STATE });
    setSaveError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (step === 1 && form.type !== "") ||
    (step === 2 && form.amount !== "" && form.date !== "" && form.account !== "") ||
    step === 3;

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await createTransaction(user.id, form);
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
    <K extends keyof TxnFormState>(key: K, value: TxnFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Helper: look up display names for review step
  const accountName = accounts.find((a) => a.id === form.account)?.account_name ?? "—";
  const catName = categories.find((c) => c.id === categoryValue)?.category_name ?? "—";
  const goalName = goals.find((g) => g.id === form.goal)?.goal_name ?? "—";

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Add Transaction
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
        {/* STEP 1: Transaction Type */}
        {step === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1">Transaction Type</h2>
              <p className="text-[11px] text-slate-500">Select the type of transaction you want to record.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {TYPE_OPTIONS.map(({ key, label, desc, icon: Icon }, idx) => {
                const selected = form.type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField("type", key)}
                    className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 ${
                      selected
                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                    }`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
                          selected
                            ? "text-slate-700 border-slate-200"
                            : "text-slate-400 border-slate-100"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">{label}</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                      {/* Check indicator */}
                      <div
                        className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${
                          selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        }`}
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

        {/* STEP 2: Transaction Details */}
        {step === 2 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                  <PenSquare size={14} />
                </div>
                Transaction Details
              </h2>
            </div>
            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Amount <span className="text-slate-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Date <span className="text-slate-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                />
              </div>

              {/* Category + Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Category {form.type === "income" || form.type === "expense" ? <span className="text-slate-400">*</span> : null}
                  </label>
                  <select
                    value={categoryValue}
                    onChange={(e) => updateField(categoryFieldKey, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Budget
                  </label>
                  <select
                    value={form.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  >
                    <option value="">No budget</option>
                    {budgets.map((b) => (
                      <option key={b.id} value={b.id}>{b.budget_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Goal Contribution
                </label>
                <div className="relative">
                  <PiggyBank size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.goal}
                    onChange={(e) => updateField("goal", e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  >
                    <option value="">No Goal</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>{g.goal_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Account <span className="text-slate-400">*</span>
                </label>
                <select
                  value={form.account}
                  onChange={(e) => updateField("account", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                >
                  <option value="">Select account...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.account_name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Description <span className="text-slate-400 font-normal lowercase tracking-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg resize-none transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="What was this transaction for?"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                  <ClipboardCheck size={14} />
                </div>
                Review &amp; Confirm
              </h2>
            </div>
            <div className="space-y-4">
              {/* Amount Display */}
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Transaction Amount</div>
                <div
                  className={`text-[32px] font-bold my-2 ${
                    form.type === "income" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {form.type === "income" ? "+" : "-"}${parseFloat(form.amount || "0").toFixed(2)}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase tracking-wider inline-block mt-2">
                  {form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : "—"}
                </span>
              </div>

              {/* Review Details */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <ReviewRow label="Date" value={form.date ? new Date(form.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
                  <ReviewRow label="Category" value={catName} />
                  <ReviewRow label="Account" value={accountName} />
                  <ReviewRow label="Goal" value={goalName} />
                  <ReviewRow label="Description" value={form.description || "No description provided."} italic={!form.description} />
                </div>
              </div>

              {/* Warning Notice */}
              {saveError && (
                <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                    <p className="text-[11px] leading-relaxed opacity-85">{saveError}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Action is final</h4>
                  <p className="text-[11px] leading-relaxed opacity-85">
                    Your transaction will be created immediately. Please ensure all details are correct.
                  </p>
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
          disabled={!canContinue || saving}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
        >
          {step === 3 ? (
            saving ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : (<>Add Transaction <Check size={14} /></>)
          ) : (
            <>Continue <ArrowRight size={14} /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function ReviewRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
      <span className={`text-[13px] font-semibold text-slate-700 ${italic ? "italic text-[11px] text-slate-500 max-w-[180px] text-right" : ""}`}>
        {value}
      </span>
    </div>
  );
}
