"use client";

import { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  ArrowRightLeft,
  Wallet,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Wallet2,
  Check,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  PenSquare,
  ClipboardCheck,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Stepper } from "./stepper";
import type { AccountType, AccountColor, Account } from "./types";
import { ACCOUNT_COLORS, CASH_IN_SOURCES } from "./constants";

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (account: Omit<Account, "id">) => void;
}

const STEPS = [
  { number: 1, label: "Start" },
  { number: 2, label: "Type" },
  { number: 3, label: "Details" },
  { number: 4, label: "Funds" },
  { number: 5, label: "Review" },
];

const ACCOUNT_TYPE_OPTIONS: { type: AccountType; label: string; icon: React.ElementType; description: string }[] = [
  { type: "checking", label: "Checking", icon: Wallet, description: "Daily transactions, salary." },
  { type: "savings", label: "Savings", icon: ShieldCheck, description: "Emergency funds, goals." },
  { type: "credit", label: "Credit Card", icon: CreditCard, description: "Credit building, rewards." },
  { type: "investment", label: "Investment", icon: TrendingUp, description: "Portfolio, growth." },
  { type: "cash", label: "Cash", icon: Wallet2, description: "Physical wallet." },
];

export function AddAccountModal({ open, onClose, onAdd }: AddAccountModalProps) {
  const [step, setStep] = useState(1);
  const [workflow, setWorkflow] = useState<"new" | "existing" | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    institution: "",
    description: "",
    color: "#10B981" as AccountColor,
    isDefault: false,
    skipCashIn: false,
    cashInDate: new Date().toISOString().split("T")[0],
    cashInSource: "deposit",
  });

  const resetForm = useCallback(() => {
    setStep(1);
    setWorkflow(null);
    setAccountType(null);
    setFormData({
      name: "",
      balance: "",
      institution: "",
      description: "",
      color: "#10B981" as AccountColor,
      isDefault: false,
      skipCashIn: false,
      cashInDate: new Date().toISOString().split("T")[0],
      cashInSource: "deposit",
    });
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return workflow !== null;
      case 2:
        return accountType !== null;
      case 3:
        return formData.name.trim() !== "";
      default:
        return true;
    }
  }, [step, workflow, accountType, formData.name]);

  const handleNext = useCallback(() => {
    if (step === 5) {
      // Submit
      onAdd({
        name: formData.name,
        type: accountType!,
        balance: parseFloat(formData.balance) || 0,
        color: formData.color === "#10B981" ? "emerald" :
               formData.color === "#3B82F6" ? "blue" :
               formData.color === "#F59E0B" ? "amber" :
               formData.color === "#EF4444" ? "red" :
               formData.color === "#8B5CF6" ? "purple" : "slate",
        isDefault: formData.isDefault,
        institution: formData.institution,
        description: formData.description,
      });
      handleClose();
    } else {
      setStep((s) => Math.min(s + 1, 5));
    }
  }, [step, formData, accountType, onAdd, handleClose]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const colorName = ACCOUNT_COLORS.find((c) => c.color === formData.color)?.name || "Green";

  return (
    <Modal open={open} onClose={handleClose} className="max-w-lg">
      <ModalHeader onClose={handleClose}>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold uppercase tracking-wider">
            {step === 1 && "Workflow"}
            {step === 2 && "Select Type"}
            {step === 3 && "Account Details"}
            {step === 4 && "Initial Funds"}
            {step === 5 && "Review"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide ml-4">
            Step {step} of 5
          </span>
        </div>
      </ModalHeader>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={step} variant="compact" />

        {/* Content */}
      <ModalBody className="max-h-[60vh]">
          {/* Step 1: Workflow Choice */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1">Add Account</h2>
                <p className="text-[11px] text-slate-500">Choose how you want to add this account.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setWorkflow("new")}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                    workflow === "new"
                      ? "border-emerald-500 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-emerald-600 flex items-center justify-center">
                      <ArrowUp size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Create New Account</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Set up a checking, savings, or credit card account from scratch.
                      </p>
                    </div>
                    {workflow === "new" && (
                      <div className="absolute top-3 right-3 w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check size={10} />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setWorkflow("existing")}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                    workflow === "existing"
                      ? "border-emerald-500 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-emerald-600 flex items-center justify-center">
                      <ArrowRightLeft size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Top-up / Cash In</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Add funds to an existing account manually.
                      </p>
                    </div>
                    {workflow === "existing" && (
                      <div className="absolute top-3 right-3 w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check size={10} />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Account Type */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1">Select Account Type</h2>
                <p className="text-[11px] text-slate-500">Choose the category that best fits your needs.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCOUNT_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = accountType === option.type;
                  return (
                    <button
                      key={option.type}
                      onClick={() => setAccountType(option.type)}
                      className={cn(
                        "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "border-emerald-500 ring-1 ring-emerald-500"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-slate-500 flex items-center justify-center">
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">{option.label}</h3>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{option.description}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <Check size={9} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Account Details */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                  <div className="text-slate-500 flex items-center justify-center">
                    <UserPlus size={14} />
                  </div>
                  Add Account
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Account Name <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Checking"
                    className="mt-1.5 h-10 text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Initial Balance <span className="text-slate-400">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₱</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      placeholder="0.00"
                      className="pl-7 h-10 text-[13px]"
                    />
                  </div>
                  <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500">Current funds available in this account.</span>
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Institution</Label>
                  <Input
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g., BPI, Metrobank"
                    className="mt-1.5 h-10 text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Notes about this account..."
                    className="w-full mt-1.5 px-3 py-2 text-[13px] border border-slate-200 rounded-lg resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Color Theme</Label>
                  <div className="flex gap-2.5 flex-wrap mt-2">
                    {ACCOUNT_COLORS.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.color })}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all",
                          formData.color === c.color
                            ? "border-slate-900 scale-110"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c.color }}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 accent-emerald-500 border-slate-300 rounded flex-shrink-0"
                  />
                  <span className="text-[12px] text-slate-600 font-medium">Set as default account</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Initial Funds */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                  <div className="text-slate-500 flex items-center justify-center">
                    <Wallet size={14} />
                  </div>
                  Initial Funds
                </h2>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.skipCashIn}
                  onChange={(e) => setFormData({ ...formData, skipCashIn: e.target.checked })}
                  className="h-4 w-4 mt-0.5 accent-emerald-500 border-slate-300 rounded flex-shrink-0"
                />
                <div>
                  <div className="text-[12px] font-semibold text-slate-900">Skip transaction record</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Don&apos;t create a transaction record for the initial balance.
                  </div>
                </div>
              </label>

              <div className={cn("space-y-4 transition-opacity duration-300", formData.skipCashIn && "opacity-35 pointer-events-none")}>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Transaction Date</Label>
                  <Input
                    type="date"
                    value={formData.cashInDate}
                    onChange={(e) => setFormData({ ...formData, cashInDate: e.target.value })}
                    className="mt-1.5 h-10 text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Source</Label>
                  <select
                    value={formData.cashInSource}
                    onChange={(e) => setFormData({ ...formData, cashInSource: e.target.value })}
                    className="w-full mt-1.5 h-10 px-3 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  >
                    {CASH_IN_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-500">
                  The initial balance (₱<strong>{parseFloat(formData.balance || "0").toFixed(2)}</strong>) will be recorded as your first income transaction.
                </span>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                  <div className="text-slate-500 flex items-center justify-center">
                    <ClipboardCheck size={14} />
                  </div>
                  Review & Confirm
                </h2>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-4 p-5 border-b border-slate-100">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: formData.color }}
                  >
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">{formData.name || "New Account"}</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200 inline-block mt-1">
                      {accountType}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Initial Balance</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₱{parseFloat(formData.balance || "0").toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Institution</span>
                    <span className="text-[13px] font-semibold text-slate-700">{formData.institution || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Color</span>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                      <span className="text-[13px] font-semibold text-slate-700">{colorName}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Default</span>
                    <span className="text-[13px] font-semibold text-slate-700">{formData.isDefault ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Notes</span>
                    <span className="text-[11px] text-slate-500 italic max-w-[180px] text-right">
                      {formData.description || "No notes provided."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-amber-900">Action is final</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Your account will be created immediately. Please ensure all details are correct.
                  </p>
                </div>
              </div>
            </div>
          )}
      </ModalBody>

        {/* Footer */}
      <ModalFooter className="justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={step === 1}
            className={cn("text-xs", step === 1 && "invisible")}
          >
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              "text-xs bg-emerald-500 hover:bg-emerald-600",
              step === 5 && "shadow-lg shadow-emerald-500/25"
            )}
          >
            {step === 5 ? (
              <>
                <Check size={14} className="mr-1.5" /> Confirm & Add
              </>
            ) : (
              <>
                Continue <ArrowRight size={14} className="ml-1" />
              </>
            )}
          </Button>
      </ModalFooter>
      </Modal>
  );
}
