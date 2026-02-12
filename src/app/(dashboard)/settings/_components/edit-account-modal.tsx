"use client";

import { useState, useCallback, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PenSquare,
  Wallet,
  ClipboardCheck,
  ArrowUp,
  ArrowDown,
  Check,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Stepper } from "./stepper";
import type { Account, AccountColor } from "./types";
import { ACCOUNT_COLORS } from "./constants";

interface EditAccountModalProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit: (account: Account) => void;
}

const STEPS = [
  { number: 1, label: "Details" },
  { number: 2, label: "Adjustment" },
  { number: 3, label: "Review" },
];

type AdjustmentType = "deposit" | "withdrawal" | null;

export function EditAccountModal({ open, onClose, account, onEdit }: EditAccountModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState<AccountColor>("#10B981");
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

  const handleNext = useCallback(() => {
    if (step === 3) {
      if (account) {
        const colorName = ACCOUNT_COLORS.find(c => c.color === color)?.twColor || "emerald";
        onEdit({
          ...account,
          name,
          color: colorName,
          balance: calculateNewBalance(),
        });
      }
      handleClose();
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  }, [step, account, name, color, calculateNewBalance, onEdit, handleClose]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const colorName = ACCOUNT_COLORS.find((c) => c.color === color)?.name || "Green";
  const newBalance = calculateNewBalance();
  const adjustmentValue = parseFloat(adjustmentAmount) || 0;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-lg">
      <ModalHeader onClose={handleClose}>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold uppercase tracking-wider">
            {step === 1 && "Edit Details"}
            {step === 2 && "Balance Adjustment"}
            {step === 3 && "Review Changes"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide ml-4">
            Step {step} of 3
          </span>
        </div>
      </ModalHeader>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={step} />

      <ModalBody className="max-h-[60vh]">
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                  <div className="text-slate-500 flex items-center justify-center">
                    <PenSquare size={14} />
                  </div>
                  Edit Account Details
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Account Name <span className="text-slate-400">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Account name"
                    className="mt-1.5 h-10 text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Account Type</Label>
                  <div className="mt-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700">
                    {account?.type ? account.type.charAt(0).toUpperCase() + account.type.slice(1) : "-"}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Current Balance</Label>
                  <div className="mt-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-900">
                    ₱{currentBalance.toFixed(2)}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Color Theme</Label>
                  <div className="flex gap-2.5 flex-wrap mt-2">
                    {ACCOUNT_COLORS.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setColor(c.color)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all",
                          color === c.color
                            ? "border-slate-900 scale-110"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c.color }}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Balance Adjustment */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                  <div className="text-slate-500 flex items-center justify-center">
                    <Wallet size={14} />
                  </div>
                  Balance Adjustment
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setAdjustmentType(adjustmentType === "deposit" ? null : "deposit")}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                    adjustmentType === "deposit"
                      ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-emerald-600 flex items-center justify-center">
                      <ArrowUp size={16} />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-slate-900">Deposit</div>
                      <div className="text-[9px] text-slate-500">Add funds</div>
                    </div>
                  </div>
                  {adjustmentType === "deposit" && (
                    <div className="absolute top-3 right-3 w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Check size={9} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setAdjustmentType(adjustmentType === "withdrawal" ? null : "withdrawal")}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all cursor-pointer",
                    adjustmentType === "withdrawal"
                      ? "border-red-500 ring-1 ring-red-500 bg-red-50/50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-red-600 flex items-center justify-center">
                      <ArrowDown size={16} />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-slate-900">Withdrawal</div>
                      <div className="text-[9px] text-slate-500">Remove funds</div>
                    </div>
                  </div>
                  {adjustmentType === "withdrawal" && (
                    <div className="absolute top-3 right-3 w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center text-white">
                      <Check size={9} />
                    </div>
                  )}
                </button>
              </div>

              {adjustmentType && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                      Amount <span className="text-slate-400">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₱</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-7 h-10 text-[13px]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                      Reason <span className="text-slate-400">*</span>
                    </Label>
                    <Input
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="e.g., Salary deposit, Expense refund"
                      className="mt-1.5 h-10 text-[13px]"
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500">
                      This adjustment will be recorded as a transaction for tracking purposes.
                    </span>
                  </div>
                </div>
              )}

              {!adjustmentType && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-blue-600">
                    Select an adjustment type above if you want to modify the account balance. Otherwise, click Continue to proceed.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                  <div className="text-slate-500 flex items-center justify-center">
                    <ClipboardCheck size={14} />
                  </div>
                  Review Changes
                </h2>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-4 p-5 border-b border-slate-100">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">{name}</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200 inline-block mt-1">
                      {account?.type}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Current Balance</span>
                    <span className="font-bold text-slate-900 text-sm">₱{currentBalance.toFixed(2)}</span>
                  </div>
                  {adjustmentType && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        {adjustmentType === "deposit" ? "Deposit" : "Withdrawal"}
                      </span>
                      <span className={cn(
                        "font-bold text-sm",
                        adjustmentType === "deposit" ? "text-emerald-600" : "text-red-600"
                      )}>
                        {adjustmentType === "deposit" ? "+" : "-"}₱{adjustmentValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">New Balance</span>
                    <span className="font-bold text-slate-900 text-sm">₱{newBalance.toFixed(2)}</span>
                  </div>
                  {adjustmentType && (
                    <div className="flex justify-between items-center py-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Reason</span>
                      <span className="text-[11px] text-slate-500 text-right">{adjustmentReason}</span>
                    </div>
                  )}
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
              step === 3 && "shadow-lg shadow-emerald-500/25"
            )}
          >
            {step === 3 ? (
              <>
                <Check size={14} className="mr-1.5" /> Save Changes
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
