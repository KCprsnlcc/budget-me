"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Wallet,
  CreditCard,
  TrendingUp,
  Wallet2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { AccountType, AccountColor } from "@/app/(dashboard)/settings/_components/types";
import { ACCOUNT_COLORS, CASH_IN_SOURCES } from "@/app/(dashboard)/settings/_components/constants";
import { ColumnStepper } from "@/components/ui/column-stepper";
import { createClient } from "@/lib/supabase/client";
import { getPhilippinesNow, formatDateForInput } from "@/lib/timezone";
import { Logo } from "@/components/shared/logo";
import { toast } from "sonner";

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
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
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

  // Check if content is scrollable and show indicator
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current && typeof window !== 'undefined') {
        const isMobileOrTablet = window.innerWidth < 1024;
        const isScrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setShowScrollIndicator(isMobileOrTablet && isScrollable);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [step, open]);

  // Handle scroll to hide indicator
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        if (isNearBottom) {
          setShowScrollIndicator(false);
        }
      }
    };

    const currentRef = contentRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Auto-scroll to top on step change for mobile/tablet
  useEffect(() => {
    if (contentRef.current && typeof window !== 'undefined') {
      // Only auto-scroll on mobile and tablet devices
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet) {
        contentRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [step]);

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
      setIsSubmitting(true);
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
            status: "active",
            created_at: getPhilippinesNow(),
            updated_at: getPhilippinesNow(),
          })
          .select()
          .single();

        if (accountError) {
          console.error("Account creation error:", accountError);
          toast.error("Failed to create account", {
            description: accountError.message || "Please try again"
          });
          throw accountError;
        }

        // Create initial cash-in transaction if not skipped
        if (!formData.skipCashIn && parseFloat(formData.balance) > 0) {
          const { error: transactionError } = await supabase.from("transactions").insert({
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

          if (transactionError) {
            console.error("Transaction creation error:", transactionError);
            // Don't fail the whole process if transaction fails
            toast.warning("Account created but initial transaction failed", {
              description: "You can add the transaction manually later"
            });
          }
        }

        // Mark account setup as completed in localStorage
        localStorage.setItem('accountSetupCompleted', 'true');
        localStorage.setItem('accountSetupCompletedBy', userId);
        localStorage.setItem('accountSetupCompletedAt', new Date().toISOString());
        
        // Clear any skip data
        localStorage.removeItem('accountSetupSkipUntil');
        localStorage.removeItem('accountSetupSkippedBy');

        // Success
        toast.success("Account created successfully!", {
          description: `${formData.name} is ready to use`
        });
        
        onClose();
        router.refresh();
      } catch (error) {
        console.error("Error creating account:", error);
        if (error instanceof Error) {
          toast.error("Failed to create account", {
            description: error.message
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  }, [step, formData, accountType, userId, onClose, router]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSkipForLater = useCallback(async () => {
    try {
      // Calculate skip until time (25 minutes from now)
      const skipUntil = new Date(Date.now() + 25 * 60 * 1000).toISOString();
      
      // Save to localStorage
      localStorage.setItem('accountSetupSkipUntil', skipUntil);
      localStorage.setItem('accountSetupSkippedBy', userId);

      setShowSkipConfirmation(false);
      onClose();
    } catch (error) {
      // Silently fail - not critical
    }
  }, [userId, onClose]);

  const selectedType = ACCOUNT_TYPE_OPTIONS.find((t) => t.type === accountType);
  const colorName = ACCOUNT_COLORS.find((c) => c.color === formData.color)?.name || "Green";

  return (
    <>
    <Modal open={open} onClose={onClose} className="w-[95vw] sm:w-[90vw] max-w-[1280px] h-[92vh] sm:h-[88vh] lg:h-[85vh]">
      <div className="flex flex-col lg:flex-row h-full bg-white rounded-2xl overflow-hidden lg:overflow-visible">
        {/* Wrapper for mobile scroll - makes entire content scrollable */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-y-auto lg:overflow-visible">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:border-r border-gray-100">
          {/* Header - Stealth Style */}
          <div className="h-[64px] sm:h-[72px] lg:h-[88px] border-b border-gray-100 px-4 sm:px-6 lg:px-12 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10 lg:static">
            <Logo variant="landing" size="md" className="h-8 sm:h-9 lg:h-10 w-auto" />
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowSkipConfirmation(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Skip for Later</span>
                <span className="sm:hidden">Skip</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-gray-50"
                aria-label="Close modal"
              >
                <X size={18} className="sm:hidden" />
                <X size={20} className="hidden sm:block" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto lg:overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-16 bg-white scroll-smooth relative"
          >
            {/* Scroll Indicator for Mobile/Tablet */}
            {showScrollIndicator && (
              <div className="lg:hidden fixed bottom-[80px] sm:bottom-[70px] left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
                <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-medium">
                  <span>Scroll down</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="max-w-3xl mx-auto">
            {/* Step 1: Welcome - Hero Style */}
            {step === 1 && (
              <div className="relative z-10 pt-6 sm:pt-8 md:pt-12 pb-4 sm:pb-6 md:pb-8 overflow-hidden">
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
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-3 sm:mb-4 lg:mb-5 leading-[1.2] px-2">
                    Welcome to BudgetMe, <span className="text-emerald-500">{userName}!</span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-xs sm:text-[13px] md:text-sm text-slate-700 max-w-xl mx-auto mb-6 sm:mb-7 md:mb-8 leading-relaxed px-4">
                    Let&apos;s set up your first account to start tracking your finances and achieving your goals.
                  </p>

                  {/* Features Card */}
                  <div className="max-w-2xl mx-auto text-left px-2">
                    <div className="border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm">
                      <div className="p-4 sm:p-5 md:p-6 flex items-start gap-3 sm:gap-4 bg-[#F9FAFB]/50">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 pt-0.5 sm:pt-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-[15px] mb-1">Why add an account?</h3>
                          <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed">Track income, expenses, budgets, and achieve your financial goals faster.</p>
                        </div>
                      </div>
                      
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pl-12 sm:pl-[4.5rem] bg-[#F9FAFB]/50">
                        <ul className="space-y-2.5 sm:space-y-3">
                          <li className="flex items-start gap-2.5 sm:gap-3">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-[13px] text-gray-600">Track all your income and expenses in one place</span>
                          </li>
                          <li className="flex items-start gap-2.5 sm:gap-3">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-[13px] text-gray-600">Set budgets and monitor your spending</span>
                          </li>
                          <li className="flex items-start gap-2.5 sm:gap-3">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-[13px] text-gray-600">Get AI-powered financial insights</span>
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
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
                  <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-bold text-[#111827] mb-2 sm:mb-3">Choose Account Type</h1>
                  <p className="text-gray-500 text-sm sm:text-[15px]">Select the category that best describes this account</p>
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
                          "w-full p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 transition-colors text-left group",
                          isSelected ? "bg-[#F9FAFB]" : "bg-white hover:bg-gray-50"
                        )}
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: isSelected ? option.color : "#64748B" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-[15px]">{option.label}</h3>
                          <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-none">{option.description}</p>
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

            {/* Step 3: Account Details */}
            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
                  <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-bold text-[#111827] mb-2 sm:mb-3">Account Details</h1>
                  <p className="text-gray-500 text-sm sm:text-[15px]">Enter the information for your {selectedType?.label.toLowerCase()}</p>
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

                  <Checkbox
                    id="default-account"
                    checked={formData.isDefault}
                    onChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                    label="Set as default account"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
                  <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-bold text-[#111827] mb-2 sm:mb-3">Review & Confirm</h1>
                  <p className="text-gray-500 text-sm sm:text-[15px]">Double-check your account details before creating</p>
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
                        Your account will be created and you&apos;ll be taken to your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Footer - Using ModalFooter Component */}
          <ModalFooter className="flex justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky bottom-0 bg-white z-10 lg:static">
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
              disabled={!canProceed() || isSubmitting}
              className={cn(
                "px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center",
                step === 4 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  {step === 4 ? "Create Account" : "Continue"}
                  {step < 4 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
                </>
              )}
            </button>
          </ModalFooter>
        </div>

        {/* Right Sidebar - Stealth Style Stepper */}
        <div className="w-full lg:w-[400px] bg-white p-6 sm:p-8 lg:p-12 border-t lg:border-t-0 lg:border-l flex flex-col shrink-0">
          <ColumnStepper steps={STEPS} currentStep={step} className="mb-8 sm:mb-10 lg:mb-12" />

          {/* Help Section - Stealth Style */}
          <div className="lg:mt-auto">
            <div className="mb-3 sm:mb-4 text-[#4B5563]">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5 4.5L18.4 18.4M5.6 5.6l2.1 2.1m10.7-2.1l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              </svg>
            </div>
            <h4 className="text-sm sm:text-[15px] font-semibold text-gray-900 mb-1.5 sm:mb-2">Having trouble?</h4>
            <p className="text-xs sm:text-[13px] text-gray-500 mb-4 sm:mb-5 lg:mb-6 leading-relaxed">
              Feel free to contact us and we will always help you through the process.
            </p>
            <button 
              onClick={() => window.open('mailto:budgetme.site@gmail.com', '_blank')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm w-full sm:w-auto"
            >
              Contact us
            </button>
          </div>
        </div>
        </div>
      </div>
    </Modal>

    {/* Skip Confirmation Dialog */}
    {showSkipConfirmation && (
      <Modal open={showSkipConfirmation} onClose={() => setShowSkipConfirmation(false)} className="max-w-md mx-4">
        <ModalHeader>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Skip Account Setup?</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-gray-600">
              Account setup will be postponed for 25 minutes. You can always set up your account later from the settings page.
            </p>
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs sm:text-sm text-gray-700">
                  <p className="font-medium mb-1">Important:</p>
                  <p>This setup modal will reappear in about 25 minutes if your account remains empty or not fully set up.</p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-0">
          <button
            onClick={() => setShowSkipConfirmation(false)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center"
          >
            <ArrowLeft size={14} className="mr-1.5 sm:mr-2" />
            Continue Setup
          </button>
          <button
            onClick={handleSkipForLater}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Skip for 25 Minutes
          </button>
        </ModalFooter>
      </Modal>
    )}
    </>
  );
}
