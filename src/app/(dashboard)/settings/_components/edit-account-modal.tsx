"use client";

import { useState, useCallback, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Check,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CreditCard,
  TrendingUp,
  Wallet2,
  PiggyBank,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account, AccountColor } from "./types";
import { ACCOUNT_COLORS } from "./constants";
import { Stepper } from "../../family/_components/stepper";

interface EditAccountModalProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit: (account: Account) => void;
}

const STEPS = ["Details", "Balance", "Review"];

type AdjustmentType = "deposit" | "withdrawal" | null;

const ACCOUNT_TYPE_ICONS = {
  checking: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
  cash: Wallet2,
};

export function EditAccountModal({ open, onClose, account, onEdit }: EditAccountModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState<AccountColor>("#10B981");
  const [institution, setInstitution] = useState("");
  const [description, setDescription] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    if (account && open) {
      setName(account.name);
      setCurrentBalance(account.balance);
      const colorHex = ACCOUNT_COLORS.find(c => c.twColor === account.color)?.color || "#10B981";
      setColor(colorHex as AccountColor);
      setInstitution(account.institution || "");
      setDescription(account.description || "");
      setStep(1);
      setAdjustmentType(null);
      setAdjustmentAmount("");
      setAdjustmentReason("");
    }
  }, [account, open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return name.trim() !== "";
      case 2:
        return adjustmentType === null || (adjustmentAmount !== "" && adjustmentReason !== "");
      default:
        return true;
    }
  }, [step, name, adjustmentType, adjustmentAmount, adjustmentReason]);

  const calculateNewBalance = useCallback(() => {
    const amount = parseFloat(adjustmentAmount) || 0;
    if (adjustmentType === "deposit") {
      return currentBalance + amount;
    } else if (adjustmentType === "withdrawal") {
      return currentBalance - amount;
    }
    return currentBalance;
  }, [currentBalance, adjustmentType, adjustmentAmount]);

  const handleNext = useCallback(async () => {
    if (step === 3) {
      if (account) {
        const colorName = ACCOUNT_COLORS.find(c => c.color === color)?.twColor || "emerald";
        
        onEdit({
          ...account,
          name,
          color: colorName,
          balance: calculateNewBalance(),
          institution: institution.trim() || undefined,
          description: description.trim() || undefined,
        });
      }
      handleClose();
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  }, [step, account, name, color, institution, description, calculateNewBalance, onEdit, handleClose]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const colorName = ACCOUNT_COLORS.find((c) => c.color === color)?.name || "Green";
  const newBalance = calculateNewBalance();
  const adjustmentValue = parseFloat(adjustmentAmount) || 0;

  return (
    <Modal open={open} onClose={handleClose} className="w-[95vw] sm:w-[90vw] max-w-[800px]">
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden">
        {}
        <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Edit Account</span>
        </ModalHeader>

        {}
        <Stepper currentStep={step} totalSteps={3} labels={STEPS} />

        {}
        <ModalBody className="max-h-[60vh] bg-[#F9FAFB]/30 p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            {}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-8 px-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">Edit Account Details</h1>
                  <p className="text-gray-500 text-sm">Update your account information</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                      Account Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Account name"
                      className="mt-1.5 sm:mt-2 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Account Type</Label>
                    <div className="mt-1.5 sm:mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                      {account?.type ? account.type.charAt(0).toUpperCase() + account.type.slice(1) : "-"}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Current Balance</Label>
                    <div className="mt-1.5 sm:mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900">
                      ₱{currentBalance.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Color Theme</Label>
                    <div className="flex gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                      {ACCOUNT_COLORS.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setColor(c.color)}
                          className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all",
                            color === c.color
                              ? "border-gray-900 scale-110"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: c.color }}
                          aria-label={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Institution (Optional)</Label>
                    <Input
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g., BPI, BDO"
                      className="mt-1.5 sm:mt-2 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Description (Optional)</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Notes about this account..."
                      className="w-full mt-1.5 sm:mt-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-8 px-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">Balance Adjustment</h1>
                  <p className="text-gray-500 text-sm">Adjust your account balance (optional)</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setAdjustmentType(adjustmentType === "deposit" ? null : "deposit")}
                    className={cn(
                      "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                      adjustmentType === "deposit"
                        ? "border-emerald-500 ring-1 ring-emerald-500 bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-emerald-600 flex items-center justify-center">
                        <ArrowUp size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Deposit</div>
                        <div className="text-xs text-gray-500">Add funds</div>
                      </div>
                    </div>
                    {adjustmentType === "deposit" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check size={12} />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setAdjustmentType(adjustmentType === "withdrawal" ? null : "withdrawal")}
                    className={cn(
                      "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                      adjustmentType === "withdrawal"
                        ? "border-red-500 ring-1 ring-red-500 bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-red-600 flex items-center justify-center">
                        <ArrowDown size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Withdrawal</div>
                        <div className="text-xs text-gray-500">Remove funds</div>
                      </div>
                    </div>
                    {adjustmentType === "withdrawal" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                </div>

                {adjustmentType && (
                  <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm p-4 sm:p-6 space-y-4 animate-in fade-in duration-300">
                    <div>
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5 sm:mt-2">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₱</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                          placeholder="0.00"
                          className="pl-8 sm:pl-9 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                        Reason <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        placeholder="e.g., Salary deposit, Expense refund"
                        className="mt-1.5 sm:mt-2 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>
                )}

                {!adjustmentType && (
                  <div className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-white">
                    <p className="text-xs text-gray-600">
                      Select an adjustment type above if you want to modify the account balance. Otherwise, click Continue to proceed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-8 px-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">Review Changes</h1>
                  <p className="text-gray-500 text-sm">Confirm your account updates</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm divide-y divide-gray-100">
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white border border-gray-100 shadow-sm shrink-0">
                        {account?.type && ACCOUNT_TYPE_ICONS[account.type as keyof typeof ACCOUNT_TYPE_ICONS] && 
                          (() => {
                            const Icon = ACCOUNT_TYPE_ICONS[account.type as keyof typeof ACCOUNT_TYPE_ICONS];
                            return <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />;
                          })()
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{name}</h3>
                        <span className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          {account?.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-xs sm:text-sm text-gray-500">Current Balance</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">₱{currentBalance.toFixed(2)}</span>
                    </div>
                    {adjustmentType && (
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {adjustmentType === "deposit" ? "Deposit" : "Withdrawal"}
                        </span>
                        <span className={cn(
                          "font-semibold text-sm sm:text-base",
                          adjustmentType === "deposit" ? "text-emerald-600" : "text-red-600"
                        )}>
                          {adjustmentType === "deposit" ? "+" : "-"}₱{adjustmentValue.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 sm:py-3 border-t border-gray-100">
                      <span className="text-xs sm:text-sm text-gray-500">New Balance</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">₱{newBalance.toFixed(2)}</span>
                    </div>
                    {adjustmentType && (
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-xs sm:text-sm text-gray-500">Reason</span>
                        <span className="text-xs sm:text-sm text-gray-600 text-right max-w-[200px]">{adjustmentReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-white">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Ready to update</h4>
                      <p className="text-xs sm:text-sm text-gray-700">
                        Your account changes will be saved immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        {}
        <ModalFooter className="flex justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center"
            >
              <ArrowLeft size={14} className="mr-1.5 sm:mr-2" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              "px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center",
              "bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {step === 3 ? "Save Changes" : "Continue"}
            {step < 3 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
          </button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
