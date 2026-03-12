"use client";

import { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Wallet2,
  Check,
  ArrowLeft,
  ArrowRight,
  PiggyBank,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType, AccountColor, Account } from "./types";
import { ACCOUNT_COLORS } from "./constants";
import { Stepper } from "../../family/_components/stepper";

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (account: Omit<Account, "id">) => void;
}

const STEPS = ["Account Type", "Details", "Review"];

const ACCOUNT_TYPE_OPTIONS: { type: AccountType; label: string; icon: React.ElementType; description: string; color: string }[] = [
  {
    type: "checking",
    label: "Checking Account",
    icon: Landmark,
    description: "For daily transactions, salary deposits, and regular expenses",
    color: "#10B981",
  },
  {
    type: "savings",
    label: "Savings Account",
    icon: PiggyBank,
    description: "Build emergency funds and save for future goals",
    color: "#3B82F6",
  },
  {
    type: "credit",
    label: "Credit Card",
    icon: CreditCard,
    description: "Track credit spending and manage payments",
    color: "#F59E0B",
  },
  {
    type: "investment",
    label: "Investment",
    icon: TrendingUp,
    description: "Monitor your investment portfolio and growth",
    color: "#8B5CF6",
  },
  {
    type: "cash",
    label: "Cash Wallet",
    icon: Wallet2,
    description: "Track physical cash and small expenses",
    color: "#64748B",
  },
];

export function AddAccountModal({ open, onClose, onAdd }: AddAccountModalProps) {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    institution: "",
    description: "",
    color: "#10B981" as AccountColor,
    isDefault: false,
  });

  const resetForm = useCallback(() => {
    setStep(1);
    setAccountType(null);
    setFormData({
      name: "",
      balance: "",
      institution: "",
      description: "",
      color: "#10B981" as AccountColor,
      isDefault: false,
    });
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return accountType !== null;
      case 2:
        return formData.name.trim() !== "" && formData.balance !== "";
      default:
        return true;
    }
  }, [step, accountType, formData.name, formData.balance]);

  const handleNext = useCallback(async () => {
    if (step === 3) {
      const colorName =
        formData.color === "#10B981"
          ? "emerald"
          : formData.color === "#3B82F6"
          ? "blue"
          : formData.color === "#F59E0B"
          ? "amber"
          : formData.color === "#EF4444"
          ? "red"
          : formData.color === "#8B5CF6"
          ? "purple"
          : "slate";

      onAdd({
        name: formData.name,
        type: accountType!,
        balance: parseFloat(formData.balance) || 0,
        color: colorName,
        isDefault: formData.isDefault,
        institution: formData.institution,
        description: formData.description,
      });
      handleClose();
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  }, [step, formData, accountType, onAdd, handleClose]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const selectedType = ACCOUNT_TYPE_OPTIONS.find((t) => t.type === accountType);
  const colorName = ACCOUNT_COLORS.find((c) => c.color === formData.color)?.name || "Green";

  return (
    <Modal open={open} onClose={handleClose} className="w-[95vw] sm:w-[90vw] max-w-[800px]">
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden">
        {}
        <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Add Account</span>
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
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">Choose Account Type</h1>
                  <p className="text-gray-500 text-sm">Select the category that best describes this account</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm divide-y divide-gray-100">
                  {ACCOUNT_TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = accountType === option.type;
                    return (
                      <button
                        key={option.type}
                        onClick={() => {
                          setAccountType(option.type);
                          setFormData((prev) => ({ ...prev, color: option.color as AccountColor }));
                        }}
                        className={cn(
                          "w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-colors text-left group",
                          isSelected ? "bg-[#F9FAFB]" : "bg-white hover:bg-gray-50"
                        )}
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: isSelected ? option.color : "#64748B" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-[15px]">{option.label}</h3>
                          <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">{option.description}</p>
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-8 px-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">Account Details</h1>
                  <p className="text-gray-500 text-sm">Enter the information for your {selectedType?.label.toLowerCase()}</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                      Account Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={`e.g., ${selectedType?.label === "Credit Card" ? "BPI Credit Card" : "Main Checking"}`}
                      className="mt-1.5 sm:mt-2 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                      Initial Balance <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5 sm:mt-2">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₱</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        placeholder="0.00"
                        className="pl-8 sm:pl-9 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                      />
                    </div>
                    <p className="text-xs sm:text-[13px] text-gray-500 mt-1">Current funds available in this account</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Institution (Optional)</Label>
                      <Input
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="e.g., BPI, BDO"
                        className="mt-1.5 sm:mt-2 h-10 sm:h-11 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-semibold text-gray-700">Color Theme</Label>
                      <div className="flex gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                        {ACCOUNT_COLORS.map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: c.color })}
                            className={cn(
                              "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all",
                              formData.color === c.color ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: c.color }}
                            aria-label={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-gray-700">Description (Optional)</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Notes about this account..."
                      className="w-full mt-1.5 sm:mt-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="h-4 w-4 accent-emerald-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Set as default account</span>
                  </label>
                </div>
              </div>
            )}

            {}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-8 px-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">Review & Confirm</h1>
                  <p className="text-gray-500 text-sm">Double-check your account details before creating</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm divide-y divide-gray-100">
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white border border-gray-100 shadow-sm shrink-0">
                        {selectedType && <selectedType.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: formData.color }} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{formData.name || "New Account"}</h3>
                        <span className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          {accountType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-xs sm:text-sm text-gray-500">Initial Balance</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        ₱{parseFloat(formData.balance || "0").toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-xs sm:text-sm text-gray-500">Institution</span>
                      <span className="font-medium text-gray-700 text-sm sm:text-base truncate ml-4">{formData.institution || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-xs sm:text-sm text-gray-500">Color Theme</span>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                        <span className="font-medium text-gray-700 text-sm sm:text-base">{colorName}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-xs sm:text-sm text-gray-500">Default Account</span>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">{formData.isDefault ? "Yes" : "No"}</span>
                    </div>
                    {formData.description && (
                      <div className="flex flex-col py-2 sm:py-3 border-t border-gray-100">
                        <span className="text-xs sm:text-sm text-gray-500 mb-1.5">Description</span>
                        <span className="font-medium text-gray-700 text-sm sm:text-base">{formData.description}</span>
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
                      <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Ready to create</h4>
                      <p className="text-xs sm:text-sm text-gray-700">
                        Your account will be created and ready to use immediately.
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
            {step === 3 ? "Create Account" : "Continue"}
            {step < 3 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
          </button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
