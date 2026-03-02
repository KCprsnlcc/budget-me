"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Building2,
  CreditCard,
  TrendingUp,
  Wallet2,
  User,
  PiggyBank,
  X,
  Landmark,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AccountType, AccountColor } from "@/app/(dashboard)/settings/_components/types";
import { ACCOUNT_COLORS, CASH_IN_SOURCES } from "@/app/(dashboard)/settings/_components/constants";
import { ColumnStepper } from "@/components/ui/column-stepper";
import { createClient } from "@/lib/supabase/client";
import { getPhilippinesNow, formatDateForInput } from "@/lib/timezone";
import { Logo } from "@/components/shared/logo";

const supabase = createClient();

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const STEPS = ["Welcome", "Account Type", "Details", "Review"];

const ACCOUNT_TYPE_OPTIONS: {
  type: AccountType;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}[] = [
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

export function OnboardingModal({ open, onClose, userId, userName }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    institution: "",
    description: "",
    color: "#10B981" as AccountColor,
    isDefault: true,
    skipCashIn: false,
    cashInDate: formatDateForInput(getPhilippinesNow()),
    cashInSource: "deposit",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setAccountType(null);
      setFormData({
        name: "",
        balance: "",
        institution: "",
        description: "",
        color: "#10B981" as AccountColor,
        isDefault: true,
        skipCashIn: false,
        cashInDate: formatDateForInput(getPhilippinesNow()),
        cashInSource: "deposit",
      });
    }
  }, [open]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return true; // Welcome step always proceedable
      case 2:
        return accountType !== null;
      case 3:
        return formData.name.trim() !== "" && formData.balance !== "";
      case 4:
        return true; // Review step
      default:
        return false;
    }
  }, [step, accountType, formData.name, formData.balance]);

  const handleNext = useCallback(async () => {
    if (step === 4) {
      // Submit account
      try {
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

        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .insert({
            user_id: userId,
            account_name: formData.name,
            account_type: accountType,
            balance: parseFloat(formData.balance) || 0,
            color: colorName,
            is_default: formData.isDefault,
            institution: formData.institution || null,
            description: formData.description || null,
            status: "active",
            created_at: getPhilippinesNow(),
            updated_at: getPhilippinesNow(),
          })
          .select()
          .single();

        if (accountError) throw accountError;

        // Create initial cash-in transaction if not skipped
        if (!formData.skipCashIn && parseFloat(formData.balance) > 0) {
          await supabase.from("transactions").insert({
            user_id: userId,
            account_id: accountData.id,
            type: "cash_in",
            amount: parseFloat(formData.balance),
            date: formData.cashInDate,
            notes: `Initial balance - ${
              CASH_IN_SOURCES.find((s) => s.value === formData.cashInSource)?.label || "Deposit"
            }`,
            status: "completed",
            created_at: getPhilippinesNow(),
            updated_at: getPhilippinesNow(),
          });
        }

        // Success - close modal and refresh
        onClose();
        router.refresh();
      } catch (error) {
        console.error("Failed to create account:", error);
      }
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  }, [step, formData, accountType, userId, onClose, router]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const selectedType = ACCOUNT_TYPE_OPTIONS.find((t) => t.type === accountType);
  const colorName = ACCOUNT_COLORS.find((c) => c.color === formData.color)?.name || "Green";

  return (
    <Modal open={open} onClose={onClose} className="w-[90vw] max-w-[1280px] h-[85vh]">
      <div className="flex h-full bg-white rounded-2xl overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">
          {/* Header - Stealth Style */}
          <div className="h-[88px] border-b border-gray-100 px-8 lg:px-12 flex items-center justify-between shrink-0 bg-white">
            <Logo variant="landing" size="md" className="h-10 w-auto" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-16 bg-white">
            <div className="max-w-3xl mx-auto">
            {/* Step 1: Welcome - Hero Style */}
            {step === 1 && (
              <div className="relative z-10 pt-12 pb-8 overflow-hidden">
                {/* Beam Background */}
                <div className="pointer-events-none absolute inset-0 h-full w-full -z-10 bg-white">
                  {/* Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                      maskImage:
                        "radial-gradient(ellipse at center, black 50%, transparent 100%)",
                    }}
                  />

                  {/* SVG Beams */}
                  <svg
                    className="absolute h-full w-full"
                    fill="none"
                    viewBox="0 0 696 316"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <linearGradient id="beam-gradient-0" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0} />
                        <stop offset="20%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="50%" stopColor="#059669" stopOpacity={1} />
                        <stop offset="80%" stopColor="#34d399" stopOpacity={1} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="beam-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#64748b" stopOpacity={0} />
                        <stop offset="20%" stopColor="#64748b" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#94a3b8" stopOpacity={0.8} />
                        <stop offset="80%" stopColor="#cbd5e1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <path d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875" stroke="url(#beam-gradient-0)" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
                    <path d="M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827" stroke="url(#beam-gradient-1)" strokeWidth={1} strokeLinecap="round" opacity={0.2} />
                    <path d="M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683" stroke="url(#beam-gradient-0)" strokeWidth={1.5} strokeLinecap="round" opacity={0.25} />
                  </svg>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                  {/* Headline */}
                  <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-5 leading-[1.2]">
                    Welcome to BudgetMe, <span className="text-emerald-500">{userName}!</span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-[13px] md:text-sm text-slate-700 max-w-xl mx-auto mb-8 leading-relaxed">
                    Let&apos;s set up your first account to start tracking your finances and achieving your goals.
                  </p>

                  {/* Features Card */}
                  <div className="max-w-2xl mx-auto text-left">
                    <div className="border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm">
                      <div className="p-6 flex items-start gap-4 bg-[#F9FAFB]/50">
                        <div className="w-10 h-10 shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-gray-900 text-[15px] mb-1">Why add an account?</h3>
                          <p className="text-[13px] text-gray-500 leading-relaxed">Track income, expenses, budgets, and achieve your financial goals faster.</p>
                        </div>
                      </div>
                      
                      <div className="px-6 pb-6 pl-[4.5rem] bg-[#F9FAFB]/50">
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[13px] text-gray-600">Track all your income and expenses in one place</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[13px] text-gray-600">Set budgets and monitor your spending</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[13px] text-gray-600">Get AI-powered financial insights</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Type */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h1 className="text-[32px] font-bold text-[#111827] mb-3">Choose Account Type</h1>
                  <p className="text-gray-500 text-[15px]">Select the category that best describes this account</p>
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
                          "w-full p-6 flex items-center gap-4 transition-colors text-left group",
                          isSelected ? "bg-[#F9FAFB]" : "bg-white hover:bg-gray-50"
                        )}
                      >
                        <div className="w-10 h-10 shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                          <Icon className="w-5 h-5" style={{ color: isSelected ? option.color : "#64748B" }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-[15px]">{option.label}</h3>
                          <p className="text-[13px] text-gray-500 mt-0.5">{option.description}</p>
                        </div>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Account Details */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h1 className="text-[32px] font-bold text-[#111827] mb-3">Account Details</h1>
                  <p className="text-gray-500 text-[15px]">Enter the information for your {selectedType?.label.toLowerCase()}</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm p-8 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Account Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={`e.g., ${selectedType?.label === "Credit Card" ? "BPI Credit Card" : "Main Checking"}`}
                      className="mt-2 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Initial Balance <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₱</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        placeholder="0.00"
                        className="pl-9 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                      />
                    </div>
                    <p className="text-[13px] text-gray-500 mt-1">Current funds available in this account</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Institution (Optional)</Label>
                      <Input
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="e.g., BPI, BDO"
                        className="mt-2 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Color Theme</Label>
                      <div className="flex gap-3 mt-2">
                        {ACCOUNT_COLORS.map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: c.color })}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
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
                    <Label className="text-sm font-semibold text-gray-700">Description (Optional)</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Notes about this account..."
                      className="w-full mt-2 px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="h-5 w-5 accent-emerald-500 border-gray-300 rounded flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700">Set as default account</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h1 className="text-[32px] font-bold text-[#111827] mb-3">Review & Confirm</h1>
                  <p className="text-gray-500 text-[15px]">Double-check your account details before creating</p>
                </div>

                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: formData.color }}
                    >
                      {selectedType && <selectedType.icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{formData.name || "New Account"}</h3>
                      <span className="text-sm font-medium px-3 py-1 rounded-lg bg-gray-100 text-gray-600 uppercase tracking-wider border border-gray-200">
                        {accountType}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Initial Balance</span>
                      <span className="font-semibold text-gray-900">
                        ₱{parseFloat(formData.balance || "0").toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Institution</span>
                      <span className="font-medium text-gray-700">{formData.institution || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Color Theme</span>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                        <span className="font-medium text-gray-700">{colorName}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-gray-500">Default Account</span>
                      <span className="font-medium text-gray-700">{formData.isDefault ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-1">Ready to create</h4>
                      <p className="text-sm text-emerald-700">
                        Your account will be created and you&apos;ll be taken to your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Footer - Bottom Right */}
          <div className="px-8 lg:px-12 py-6 border-t border-gray-100 flex justify-end bg-white">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm",
                  step === 4 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {step === 4 ? "Create Account" : "Continue"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Stealth Style Stepper */}
        <div className="w-full lg:w-[400px] bg-white p-8 lg:p-12 border-t lg:border-t-0 flex flex-col shrink-0">
          <ColumnStepper steps={STEPS} currentStep={step} className="mb-12" />

          {/* Help Section - Stealth Style */}
          <div className="mt-auto">
            <div className="mb-4 text-[#4B5563]">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5 4.5L18.4 18.4M5.6 5.6l2.1 2.1m10.7-2.1l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              </svg>
            </div>
            <h4 className="text-[15px] font-semibold text-gray-900 mb-2">Having trouble?</h4>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
              Feel free to contact us and we will always help you through the process.
            </p>
            <button 
              onClick={() => window.open('mailto:budgetme.site@gmail.com', '_blank')}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              Contact us
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
