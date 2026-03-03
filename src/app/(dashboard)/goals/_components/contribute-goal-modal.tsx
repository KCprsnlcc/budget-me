"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { contributeToGoal } from "../_lib/goal-service";
import { fetchAccounts } from "../../transactions/_lib/transaction-service";
import type { AccountOption } from "../../transactions/_components/types";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
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
  CreditCard,
  Wallet,
  Building2,
  Landmark,
  Home,
  Car,
  Zap,
  FileText,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { GoalType } from "./types";
import { 
  formatCurrency, 
  formatDate, 
  getDaysRemaining,
  getGoalProgress 
} from "./constants";

const STEPS = ["Amount", "Account", "Review"];

interface ContributeGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalType | null;
  onSuccess?: () => void;
  onContribute?: (goalId: string, amount: number) => Promise<{ error: string | null }>;
}

// Helper function to get account icon
function getAccountIcon(accountName: string): React.ComponentType<any> {
  const name = accountName.toLowerCase();
  if (name.includes("bank") || name.includes("checking") || name.includes("savings")) return Building2;
  if (name.includes("credit") || name.includes("card")) return CreditCard;
  if (name.includes("cash") || name.includes("wallet")) return Wallet;
  if (name.includes("investment") || name.includes("brokerage")) return TrendingUp;
  if (name.includes("loan") || name.includes("mortgage")) return Landmark;
  if (name.includes("utility") || name.includes("phone") || name.includes("internet")) return Zap;
  if (name.includes("car") || name.includes("auto")) return Car;
  if (name.includes("home") || name.includes("house")) return Home;
  return FileText;
}

export function ContributeGoalModal({ open, onClose, goal, onSuccess, onContribute }: ContributeGoalModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep(1);
    setAmount("");
    setAccount("");
    setSaveError(null);
  }, []);

  // Fetch accounts when modal opens
  useEffect(() => {
    if (!open || !user) return;
    fetchAccounts(user.id).then(setAccounts);
  }, [open, user]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (step === 1 && amount !== "" && parseFloat(amount) > 0) ||
    (step === 2 && account !== "") ||
    step === 3;

  const handleSubmit = useCallback(async () => {
    if (!goal) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    setSaving(true);
    setSaveError(null);
    
    // Use onContribute if provided (for family goals with activity logging)
    // Otherwise use the default service function
    const { error } = onContribute 
      ? await onContribute(goal.id, parsed)
      : await contributeToGoal(goal.id, parsed, user?.id);
    
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [goal, amount, user?.id, handleClose, onSuccess, onContribute]);

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

  if (!goal) return null;

  const progress = getGoalProgress(goal.current, goal.target);
  const remaining = goal.target - goal.current;
  const daysRemaining = getDaysRemaining(goal.deadline);
  const newProgress = getGoalProgress(goal.current + (parseFloat(amount) || 0), goal.target);
  const newRemaining = goal.target - (goal.current + (parseFloat(amount) || 0));
  const selectedAccount = accounts.find(a => a.id === account);
  const accountBalance = selectedAccount?.balance ?? 0;
  const newAccountBalance = accountBalance - (parseFloat(amount) || 0);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Contribute to Goal</h3>
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
        {/* STEP 1: Amount Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Contribution Amount</h4>
              <p className="text-xs text-slate-500">How much would you like to contribute to {goal.name}?</p>
            </div>

            {/* Goal Summary */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{goal.name}</h4>
                <p className="text-xs text-gray-500">{progress}% complete</p>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Progress:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(goal.current)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(goal.target)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(remaining)}</span>
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

            <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-start gap-3">
              <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
              <div>
                <div className="font-medium text-sm text-gray-900">Contribution Impact</div>
                <div className="text-xs text-gray-600">
                  Your contribution will be immediately reflected in your goal progress
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Account Selection */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Select Account</h4>
              <p className="text-xs text-slate-500">Choose which account to use for this contribution</p>
            </div>

            {/* Contribution Summary */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Contributing</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(amount || "0")}</div>
              <div className="text-xs text-gray-600 mt-1">to {goal.name}</div>
            </div>

            {/* Account Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Account <span className="text-gray-400">*</span></label>
              <SearchableDropdown
                value={account}
                onChange={setAccount}
                options={accounts.map((a) => ({
                  value: a.id,
                  label: a.account_name,
                  icon: getAccountIcon(a.account_name),
                  subtitle: `Balance: ₱${a.balance.toFixed(2)}`,
                }))}
                placeholder="Select account..."
                className="w-full"
                allowEmpty={false}
              />
            </div>

            {/* Account Balance Warning */}
            {selectedAccount && parseFloat(amount) > selectedAccount.balance && (
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Insufficient Balance</h4>
                  <p className="text-[11px] leading-relaxed">
                    The contribution amount exceeds your account balance. Current balance: {formatCurrency(selectedAccount.balance)}
                  </p>
                </div>
              </div>
            )}

            {/* Account Balance Info */}
            {selectedAccount && (
              <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-start gap-3">
                <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">Account Balance Impact</div>
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    <div>Current Balance: <span className="font-semibold">{formatCurrency(selectedAccount.balance)}</span></div>
                    <div>After Contribution: <span className="font-semibold">{formatCurrency(newAccountBalance)}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Contribution</h4>
              <p className="text-xs text-slate-500">Confirm your contribution details</p>
            </div>

            {/* Contribution Summary */}
            <div className="text-center py-6 bg-[#F9FAFB]/50 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contribution Amount</div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(amount || "0")}</div>
              <div className="text-xs text-gray-600 mt-1 font-medium">to {goal.name}</div>
            </div>

            {/* Progress Impact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Current Progress</div>
                <div className="text-sm font-semibold text-gray-900">{progress}%</div>
                <div className="text-xs text-gray-500">{formatCurrency(goal.current)}</div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-gray-200">
                <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">New Progress</div>
                <div className="text-sm font-semibold text-emerald-600">{newProgress}%</div>
                <div className="text-xs text-emerald-600">{formatCurrency(goal.current + (parseFloat(amount) || 0))}</div>
              </div>
            </div>

            {/* Goal Details */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Goal Name</span>
                  <span className="text-[13px] font-semibold text-gray-700">{goal.name}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Account</span>
                  <span className="text-[13px] font-semibold text-gray-700">{selectedAccount?.account_name ?? "—"}</span>
                </div>
                {selectedAccount && (
                  <>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Current Balance</span>
                      <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(selectedAccount.balance)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">New Balance</span>
                      <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(newAccountBalance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Remaining</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(newRemaining)}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Deadline</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formatDate(goal.deadline)}</span>
                </div>
                {newProgress >= 100 && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Status</span>
                    <span className="text-[13px] font-semibold text-emerald-600 flex items-center gap-2">
                      <CheckCircle size={14} /> Goal Completed!
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

            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
              <CheckCircle size={16} className="flex-shrink-0 mt-px text-emerald-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Ready to Contribute</h4>
                <p className="text-[11px] leading-relaxed">
                  Your contribution will be processed immediately
                </p>
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
          {step === 3 ? (
            saving ? (<><Loader2 size={14} className="animate-spin mr-1" /> Contributing...</>) : (<><Plus size={14} className="mr-1" /> Contribute</>)
          ) : (
            <>Continue</>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
