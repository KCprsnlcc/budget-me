"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { toast } from "sonner";
import {
    Loader2,
    ArrowLeft,
    ArrowRight,
    Check,
    Search,
    Brain,
    ClipboardCheck,
    Wand2,
    Flag,
    AlertTriangle,
    TrendingUp,
    Lightbulb,
    Shield,
    Star,
    BarChart3,
    PieChart,
    Wallet,
    Activity,
    Zap,
    TrendingDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
    generateIncomeExpenseForecast,
    generateCategoryForecast,
    analyzeExpenseTypes,
    analyzeTransactionBehavior,
    generatePredictionSummary,
    savePrediction,
} from "@/app/(dashboard)/predictions/_lib/prediction-service";
import {
    generateAIFinancialInsights,
    type AIInsightResponse,
} from "@/app/(dashboard)/predictions/_lib/ai-insights-service";

interface AddAdminPredictionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = ["User Select", "Type Select", "Generate", "Review"];

type User = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

type GenerationType = "predictions" | "financial_intelligence";

const GENERATION_TYPES = [
    {
        id: "predictions" as GenerationType,
        title: "AI Predictions",
        subtitle: "AI Powered",
        description: "Smart forecasts and insights powered by Prophet machine learning.",
        icon: Brain,
    },
    {
        id: "financial_intelligence" as GenerationType,
        title: "AI Financial Intelligence",
        subtitle: "Deep Analysis",
        description: "Deep analysis of your spending habits and financial future with unique results based on saved data.",
        icon: Wand2,
    },
];

export function AddAdminPredictionModal({ open, onClose, onSuccess }: AddAdminPredictionModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedGenerationType, setSelectedGenerationType] = useState<GenerationType>("predictions");
    const [generationResult, setGenerationResult] = useState<{
        success: boolean;
        dataPoints: number;
        accuracy: number;
        insights: number;
        error?: string;
        aiInsights?: AIInsightResponse;
        forecastData?: any;
        categoryPredictions?: any[];
        expenseTypes?: any;
        behaviorInsights?: any[];
        summary?: any;
    } | null>(null);
    const userListRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    // Load users
    const loadUsers = useCallback(async (reset: boolean = false) => {
        if (reset) {
            setLoadingUsers(true);
            setPage(1);
            setUsers([]);
            setHasMore(true);
        } else {
            if (loadingMore || !hasMore) return;
            setLoadingMore(true);
        }

        const supabase = createClient();
        const pageSize = 10;
        const currentPage = reset ? 1 : page;
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from("profiles")
            .select("id, email, full_name, avatar_url")
            .order("email")
            .range(from, to);

        if (userSearchQuery.trim()) {
            const searchTerm = userSearchQuery.toLowerCase();
            query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (!error && data) {
            if (reset) {
                setUsers(data);
                setPage(2);
            } else {
                setUsers(prev => {
                    const existingIds = new Set(prev.map(u => u.id));
                    const newUsers = data.filter(u => !existingIds.has(u.id));
                    return [...prev, ...newUsers];
                });
                setPage(prev => prev + 1);
            }
            setHasMore(data.length === pageSize);
        }

        setLoadingUsers(false);
        setLoadingMore(false);
    }, [loadingMore, hasMore, page, userSearchQuery]);

    // Load users on open
    useEffect(() => {
        if (open && users.length === 0) {
            loadUsers(true);
        }
    }, [open]);

    // Search debounce
    useEffect(() => {
        if (open && currentStep === 1) {
            const timeoutId = setTimeout(() => {
                loadUsers(true);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [userSearchQuery, open, currentStep]);

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (!userListRef.current || loadingMore || !hasMore) return;
            const { scrollTop, scrollHeight, clientHeight } = userListRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                loadUsers(false);
            }
        };

        const listElement = userListRef.current;
        if (listElement && open && currentStep === 1) {
            listElement.addEventListener('scroll', handleScroll);
            return () => listElement.removeEventListener('scroll', handleScroll);
        }
    }, [loadingMore, hasMore, open, currentStep, loadUsers]);

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
    }, [currentStep, open]);

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
    }, [currentStep]);

    const handleClose = () => {
        setCurrentStep(1);
        setUserSearchQuery("");
        setSelectedUserId("");
        setSelectedGenerationType("predictions");
        setGenerationResult(null);
        onClose();
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!selectedUserId) {
                toast.error("Please select a user");
                return;
            }
        }

        if (currentStep === 2) {
            if (!selectedGenerationType) {
                toast.error("Please select a generation type");
                return;
            }
        }

        if (currentStep === 3) {
            // Generate prediction for the user
            setGenerating(true);
            try {
                const [forecastData, categoryPredictions, expenseTypes, behaviorInsights, summary] = await Promise.all([
                    generateIncomeExpenseForecast(selectedUserId),
                    generateCategoryForecast(selectedUserId),
                    analyzeExpenseTypes(selectedUserId),
                    analyzeTransactionBehavior(selectedUserId),
                    generatePredictionSummary(selectedUserId),
                ]);

                const dataPoints = forecastData.historical.length + forecastData.predicted.length;
                const accuracy = forecastData.summary.confidence;

                // Generate AI insights if type is financial_intelligence
                let aiInsights: AIInsightResponse | undefined;
                if (selectedGenerationType === "financial_intelligence") {
                    aiInsights = await generateAIFinancialInsights({
                        userId: selectedUserId,
                        forecastData,
                        categoryPredictions,
                        expenseTypes,
                        behaviorInsights,
                        summary,
                    });
                }

                // Save the prediction
                const result = await savePrediction(selectedUserId, {
                    type: selectedGenerationType,
                    insights: aiInsights 
                        ? [
                            ...aiInsights.recommendations.map(r => r.description),
                            ...aiInsights.riskMitigationStrategies.map(s => s.description),
                          ]
                        : categoryPredictions.map(c => c.insight),
                    dataPoints,
                    accuracy,
                    projectedIncome: summary.monthlyIncome,
                    projectedExpenses: summary.monthlyExpenses,
                    projectedSavings: summary.netBalance,
                    incomeGrowth: summary.incomeChange ?? undefined,
                    expenseGrowth: summary.expenseChange ?? undefined,
                    savingsGrowth: undefined,
                    categoriesAnalyzed: categoryPredictions.length,
                    topCategories: categoryPredictions.slice(0, 5).map(c => ({
                        category: c.category,
                        amount: c.predicted,
                        trend: c.trend,
                    })),
                    recurringExpenses: expenseTypes.recurring.amount,
                    variableExpenses: expenseTypes.variable.amount,
                    transactionPatterns: behaviorInsights.map(b => ({
                        type: b.type,
                        avgAmount: b.currentAvg,
                        trend: b.trend,
                    })),
                    anomaliesDetected: 0,
                    savingsOpportunities: 0,
                    fullForecastData: forecastData,
                    fullCategoryPredictions: categoryPredictions,
                    fullExpenseTypes: expenseTypes,
                    fullBehaviorInsights: behaviorInsights,
                    fullAIInsights: aiInsights, // Save full AI insights for financial_intelligence type
                });

                setGenerationResult({
                    success: result.success,
                    dataPoints,
                    accuracy: Math.round(accuracy),
                    insights: aiInsights 
                        ? aiInsights.recommendations.length + aiInsights.riskMitigationStrategies.length
                        : categoryPredictions.length,
                    error: result.error,
                    aiInsights,
                    forecastData,
                    categoryPredictions,
                    expenseTypes,
                    behaviorInsights,
                    summary,
                });
            } catch (error) {
                setGenerationResult({
                    success: false,
                    dataPoints: 0,
                    accuracy: 0,
                    insights: 0,
                    error: error instanceof Error ? error.message : "Failed to generate prediction",
                });
            } finally {
                setGenerating(false);
            }
        }

        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl h-[92vh] sm:h-[88vh] lg:h-auto">
            <ModalHeader onClose={handleClose} className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 sticky top-0 z-10 lg:static">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Generate Prediction
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {currentStep} of {STEPS.length}
                    </span>
                </div>
            </ModalHeader>

            <Stepper steps={STEPS} currentStep={currentStep} />

            <ModalBody className="px-4 sm:px-5 py-4 sm:py-5 overflow-y-auto lg:overflow-y-auto scroll-smooth relative">
                <div ref={contentRef} className="h-full overflow-y-auto">
                {/* Scroll Indicator for Mobile/Tablet */}
                {showScrollIndicator && (
                    <div className="lg:hidden fixed bottom-[70px] sm:bottom-[80px] left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
                        <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-medium">
                            <span>Scroll down</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                )}
                {/* Step 1: User Select */}
                {currentStep === 1 && (
                    <div className="animate-txn-in">
                        <div className="mb-4 sm:mb-5">
                            <h2 className="text-[15px] sm:text-[17px] font-bold text-gray-900 mb-1">Select User</h2>
                            <p className="text-[10px] sm:text-[11px] text-gray-500">
                                Choose a user to generate an AI prediction report for.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-3 sm:mb-4">
                            <Search size={13} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-3.5 py-2 sm:py-2.5 text-xs sm:text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                            />
                        </div>

                        {loadingUsers ? (
                            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[50vh] sm:max-h-96 overflow-y-auto">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <UserCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div ref={userListRef} className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[50vh] sm:max-h-96 overflow-y-auto">
                                {users.map((user, idx) => {
                                    const selected = selectedUserId === user.id;
                                    const supabaseUser: SupabaseUser = {
                                        id: user.id,
                                        email: user.email,
                                        user_metadata: {
                                            full_name: user.full_name,
                                            avatar_url: user.avatar_url
                                        },
                                        app_metadata: {},
                                        created_at: "",
                                        aud: "authenticated"
                                    } as SupabaseUser;

                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`relative p-3 sm:p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
                                                    ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                                }`}
                                            style={{ animationDelay: `${idx * 60}ms` }}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <UserAvatar
                                                    user={supabaseUser}
                                                    size="lg"
                                                    className="ring-2 ring-white shadow-sm flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 mb-0.5">
                                                        {user.full_name || "No Name"}
                                                    </h3>
                                                    <p className="text-[10px] sm:text-[11px] text-gray-500 leading-relaxed truncate">{user.email}</p>
                                                </div>
                                                <div
                                                    className={`w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                        }`}
                                                >
                                                    <Check size={10} />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {users.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-slate-500">
                                            {userSearchQuery ? `No users found matching "${userSearchQuery}"` : "No users found"}
                                        </p>
                                    </div>
                                )}
                                {loadingMore && (
                                    <>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <UserCardSkeleton key={`loading-${i}`} />
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Type Select */}
                {currentStep === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-4 sm:mb-5">
                            <h2 className="text-[15px] sm:text-[17px] font-bold text-gray-900 mb-1">Select Generation Type</h2>
                            <p className="text-[10px] sm:text-[11px] text-gray-500">
                                Choose the type of AI analysis to generate for this user.
                            </p>
                        </div>

                        {/* Selected User Preview */}
                        {selectedUser && (
                            <div className="p-3 sm:p-4 border border-slate-200 rounded-xl mb-4 sm:mb-5">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <UserAvatar
                                        user={{
                                            id: selectedUser.id,
                                            email: selectedUser.email,
                                            user_metadata: { full_name: selectedUser.full_name, avatar_url: selectedUser.avatar_url },
                                            app_metadata: {},
                                            created_at: "",
                                            aud: "authenticated"
                                        } as SupabaseUser}
                                        size="lg"
                                        className="ring-2 ring-white shadow-sm"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedUser.full_name || "No Name"}</h3>
                                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generation Type Cards */}
                        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                            {GENERATION_TYPES.map((type, idx) => {
                                const selected = selectedGenerationType === type.id;
                                const Icon = type.icon;

                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedGenerationType(type.id)}
                                        className={`relative p-3 sm:p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 ${
                                            selected
                                                ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                        }`}
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 text-gray-400 border-gray-100">
                                                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                    <h3 className="text-xs sm:text-[13px] font-bold text-gray-900">{type.title}</h3>
                                                    <span className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
                                                        {type.subtitle}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-relaxed">{type.description}</p>
                                            </div>
                                            <div
                                                className={`w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
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

                {/* Step 3: Generate */}
                {currentStep === 3 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    {selectedGenerationType === "predictions" ? <Brain size={14} /> : <Wand2 size={14} />}
                                </div>
                                {selectedGenerationType === "predictions" ? "Generate AI Predictions" : "Generate AI Financial Intelligence"}
                            </h2>
                            <p className="text-[11px] text-gray-500">
                                {selectedGenerationType === "predictions" 
                                    ? "AI will analyze the user's transaction history and generate predictions."
                                    : "AI will perform deep analysis of spending habits and financial patterns."}
                            </p>
                        </div>

                        {/* Selected User Preview */}
                        {selectedUser && (
                            <div className="p-4 bg-white border border-slate-200 rounded-xl mb-5">
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        user={{
                                            id: selectedUser.id,
                                            email: selectedUser.email,
                                            user_metadata: { full_name: selectedUser.full_name, avatar_url: selectedUser.avatar_url },
                                            app_metadata: {},
                                            created_at: "",
                                            aud: "authenticated"
                                        } as SupabaseUser}
                                        size="lg"
                                        className="ring-2 ring-white shadow-sm"
                                    />
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{selectedUser.full_name || "No Name"}</h3>
                                        <p className="text-xs text-slate-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generation Info - Different based on type */}
                        <div className="space-y-3">
                            {selectedGenerationType === "predictions" ? (
                                // AI Predictions - Prophet ML forecasting
                                [
                                    { label: "Income vs Expenses Forecast", desc: "Prophet ML predictions with confidence intervals", icon: BarChart3 },
                                    { label: "Category Spending Forecast", desc: "Detailed predictions for each spending category", icon: PieChart },
                                    { label: "Expense Type Forecast", desc: "Analysis of recurring vs variable expenses", icon: Wallet },
                                    { label: "Transaction Behavior Insight", desc: "Detailed transaction type analysis and predictions", icon: Activity },
                                ].map((item, idx) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 border border-slate-100 rounded-lg">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                <IconComponent size={14} className="sm:w-4 sm:h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900">{item.label}</h4>
                                                <p className="text-[9px] sm:text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                // AI Financial Intelligence - Comprehensive AI analysis
                                [
                                    { label: "Financial Health Summary", desc: "Comprehensive overview of current financial situation", icon: Flag },
                                    { label: "Risk Assessment & Analysis", desc: "Identify financial risks with mitigation strategies", icon: AlertTriangle },
                                    { label: "Growth Potential Analysis", desc: "Discover opportunities for financial improvement", icon: TrendingUp },
                                    { label: "Personalized Recommendations", desc: "AI-powered actionable advice prioritized by impact", icon: Lightbulb },
                                    { label: "Long-term Opportunities", desc: "Strategic planning for future financial success", icon: Star },
                                    { label: "Spending Pattern Insights", desc: "Deep analysis of transaction behaviors and trends", icon: Zap },
                                ].map((item, idx) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                                            <div className="w-8 h-8 rounded-lg border border-slate-100 bg-white flex items-center justify-center text-gray-400">
                                                <IconComponent size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-900">{item.label}</h4>
                                                <p className="text-[10px] text-slate-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {generating && (
                            <div className="flex items-center justify-center gap-2.5 sm:gap-3 p-5 sm:p-6 mt-4 sm:mt-5 border border-slate-200 rounded-xl">
                                <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin text-gray-400" />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">
                                    {selectedGenerationType === "predictions" 
                                        ? "Generating predictions..." 
                                        : "Generating AI financial intelligence..."}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                    <div className="animate-txn-in">
                        <div className="mb-4 sm:mb-5">
                            <h2 className="text-[15px] sm:text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2 sm:gap-2.5">
                                <div className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white flex-shrink-0">
                                    <ClipboardCheck size={13} className="sm:w-[14px] sm:h-[14px]" />
                                </div>
                                <span className="text-[15px] sm:text-[17px]">Generation Result</span>
                            </h2>
                        </div>

                        {generationResult ? (
                            <div className="space-y-3 sm:space-y-4">
                                {/* Status */}
                                <div className={`p-4 sm:p-5 rounded-xl border text-center ${generationResult.success
                                        ? "border-emerald-500"
                                        : "border-emerald-500"
                                    }`}>
                                    <div className={`text-xl sm:text-2xl font-bold mb-1 ${generationResult.success ? "text-emerald-600" : "text-emerald-600"}`}>
                                        {generationResult.success ? "✓ Success" : "✗ Failed"}
                                    </div>
                                    <p className={`text-xs sm:text-sm ${generationResult.success ? "text-emerald-700" : "text-emerald-700"}`}>
                                        {generationResult.success
                                            ? selectedGenerationType === "financial_intelligence"
                                                ? "AI Financial Intelligence generated and saved successfully."
                                                : "Prediction generated and saved successfully."
                                            : generationResult.error || "Failed to generate prediction."}
                                    </p>
                                </div>

                                {/* Results */}
                                {generationResult.success && (
                                    <>
                                        {/* Predictions Results - Only show for predictions type */}
                                        {selectedGenerationType === "predictions" && generationResult.summary && (
                                            <div className="space-y-3 sm:space-y-4">
                                                {/* Summary Cards - Income, Expenses, Savings */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                                    {/* Projected Income Card */}
                                                    <div className="border border-slate-200 rounded-xl p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="text-slate-500">
                                                                <TrendingUp size={20} strokeWidth={1.5} />
                                                            </div>
                                                            {generationResult.summary.incomeChange !== null && generationResult.summary.incomeChange !== undefined && (
                                                                <div className={`flex items-center gap-1 text-[10px] font-medium ${
                                                                    generationResult.summary.incomeChange >= 0 ? "text-emerald-700" : "text-emerald-700"
                                                                }`}>
                                                                    {generationResult.summary.incomeChange >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                                                    {generationResult.summary.incomeChange >= 0 ? "+" : ""}
                                                                    {generationResult.summary.incomeChange.toFixed(1)}%
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wide">Projected Income Growth</div>
                                                        <div className="text-lg font-semibold text-slate-900 tracking-tight">
                                                            ₱{generationResult.summary.monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-1">Next month projection</div>
                                                    </div>

                                                    {/* Projected Expense Card */}
                                                    <div className="border border-slate-200 rounded-xl p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="text-slate-500">
                                                                <TrendingDown size={20} strokeWidth={1.5} />
                                                            </div>
                                                            {generationResult.summary.expenseChange !== null && generationResult.summary.expenseChange !== undefined && (
                                                                <div className={`flex items-center gap-1 text-[10px] font-medium ${
                                                                    generationResult.summary.expenseChange <= 0 ? "text-emerald-700" : "text-emerald-700"
                                                                }`}>
                                                                    {generationResult.summary.expenseChange <= 0 ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
                                                                    {generationResult.summary.expenseChange <= 0 ? "" : "+"}
                                                                    {generationResult.summary.expenseChange.toFixed(1)}%
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wide">Projected Expense Growth</div>
                                                        <div className="text-lg font-semibold text-slate-900 tracking-tight">
                                                            ₱{generationResult.summary.monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-1">Next month projection</div>
                                                    </div>

                                                    {/* Projected Savings Card */}
                                                    <div className="border border-slate-200 rounded-xl p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="text-slate-500">
                                                                <Wallet size={20} strokeWidth={1.5} />
                                                            </div>
                                                            <div className={`flex items-center gap-1 text-[10px] font-medium ${
                                                                generationResult.summary.netBalance >= generationResult.summary.monthlyIncome * 0.10 
                                                                    ? "text-emerald-700" 
                                                                    : generationResult.summary.netBalance >= generationResult.summary.monthlyIncome * 0.05
                                                                    ? "text-emerald-700"
                                                                    : "text-emerald-700"
                                                            }`}>
                                                                <BarChart3 size={10} />
                                                                {generationResult.summary.monthlyIncome > 0 
                                                                    ? ((generationResult.summary.netBalance / generationResult.summary.monthlyIncome) * 100).toFixed(1)
                                                                    : "0.0"}%
                                                            </div>
                                                        </div>
                                                        <div className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wide">Projected Savings Growth</div>
                                                        <div className="text-lg font-semibold text-slate-900 tracking-tight">
                                                            ₱{generationResult.summary.netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-1">Next month projection</div>
                                                    </div>
                                                </div>

                                                {/* Income vs Expenses Summary */}
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <BarChart3 size={14} className="text-emerald-500" />
                                                        Income vs Expenses Forecast
                                                    </h3>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 mb-1">Monthly Income</p>
                                                            <p className="text-sm font-bold text-emerald-600">
                                                                ₱{generationResult.summary.monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 mb-1">Monthly Expenses</p>
                                                            <p className="text-sm font-bold text-red-600">
                                                                ₱{generationResult.summary.monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 mb-1">Net Balance</p>
                                                            <p className={`text-sm font-bold ${generationResult.summary.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                ₱{generationResult.summary.netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Category Predictions */}
                                                {generationResult.categoryPredictions && generationResult.categoryPredictions.length > 0 && (
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <PieChart size={14} className="text-emerald-500" />
                                                            Category Spending Forecast ({generationResult.categoryPredictions.length})
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {generationResult.categoryPredictions.slice(0, 5).map((cat: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full text-emerald-600 flex items-center justify-center">
                                                                            <span className="text-[10px] font-bold">{idx + 1}</span>
                                                                        </div>
                                                                        <span className="text-xs font-semibold text-slate-900">{cat.category}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs text-slate-600">
                                                                            ₱{cat.predicted.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                                                            cat.trend === 'up' ? 'text-emerald-700' :
                                                                            cat.trend === 'down' ? 'text-emerald-700' :
                                                                            'text-emerald-700'
                                                                        }`}>
                                                                            {cat.trend === 'up' ? '↑' : cat.trend === 'down' ? '↓' : '→'} {Math.abs(cat.changePercent)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Expense Types */}
                                                {generationResult.expenseTypes && (
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Wallet size={14} className="text-emerald-500" />
                                                            Expense Type Forecast
                                                        </h3>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between p-3 border border-emerald-200 rounded-lg">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-emerald-900">Recurring Expenses</p>
                                                                    <p className="text-[10px] text-emerald-600 mt-0.5">
                                                                        {generationResult.expenseTypes.recurring.percentage}% of total
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm font-bold text-emerald-900">
                                                                    ₱{generationResult.expenseTypes.recurring.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 border border-emerald-200 rounded-lg">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-emerald-900">Variable Expenses</p>
                                                                    <p className="text-[10px] text-emerald-600 mt-0.5">
                                                                        {generationResult.expenseTypes.variable.percentage}% of total
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm font-bold text-emerald-900">
                                                                    ₱{generationResult.expenseTypes.variable.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Transaction Behavior */}
                                                {generationResult.behaviorInsights && generationResult.behaviorInsights.length > 0 && (
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Activity size={14} className="text-emerald-500" />
                                                            Transaction Behavior Insight
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {generationResult.behaviorInsights.slice(0, 4).map((behavior: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                                                                    <span className="text-xs font-semibold text-slate-900">{behavior.name || behavior.type}</span>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs text-slate-600">
                                                                            Avg: ₱{behavior.currentAvg.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                                                            behavior.trend === 'up' ? 'text-emerald-700' :
                                                                            behavior.trend === 'down' ? 'text-emerald-700' :
                                                                            'text-emerald-700'
                                                                        }`}>
                                                                            {behavior.trend === 'up' ? '↑' : behavior.trend === 'down' ? '↓' : '→'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Insights Details - Only show for financial_intelligence */}
                                        {selectedGenerationType === "financial_intelligence" && generationResult.aiInsights && (
                                            <div className="space-y-4">
                                                {/* Financial Summary */}
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Wand2 size={14} className="text-emerald-500" />
                                                        Financial Summary
                                                    </h3>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {generationResult.aiInsights.financialSummary}
                                                    </p>
                                                </div>

                                                {/* Risk Assessment */}
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <AlertTriangle size={14} className={
                                                            generationResult.aiInsights.riskLevel === "high" ? "text-emerald-500" :
                                                            generationResult.aiInsights.riskLevel === "medium" ? "text-emerald-500" :
                                                            "text-emerald-500"
                                                        } />
                                                        Risk Assessment
                                                    </h3>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                            generationResult.aiInsights.riskLevel === "high" ? "text-emerald-700" :
                                                            generationResult.aiInsights.riskLevel === "medium" ? "text-emerald-700" :
                                                            "text-emerald-700"
                                                        }`}>
                                                            {generationResult.aiInsights.riskLevel.toUpperCase()} RISK
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            Score: {generationResult.aiInsights.riskScore}/100
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {generationResult.aiInsights.riskAnalysis}
                                                    </p>
                                                </div>

                                                {/* Growth Potential */}
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <TrendingUp size={14} className="text-emerald-500" />
                                                        Growth Potential
                                                    </h3>
                                                    <div className="text-lg font-bold text-emerald-600 mb-2">
                                                        {generationResult.aiInsights.growthPotential}
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {generationResult.aiInsights.growthAnalysis}
                                                    </p>
                                                </div>

                                                {/* Recommendations */}
                                                {generationResult.aiInsights.recommendations.length > 0 && (
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Lightbulb size={14} className="text-emerald-500" />
                                                            Recommendations ({generationResult.aiInsights.recommendations.length})
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {generationResult.aiInsights.recommendations.slice(0, 3).map((rec, idx) => (
                                                                <div key={idx} className="flex gap-3 p-3 border border-slate-100 rounded-lg">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                        rec.priority === "high" ? "text-emerald-600" :
                                                                        rec.priority === "medium" ? "text-emerald-600" :
                                                                        "text-emerald-600"
                                                                    }`}>
                                                                        <span className="text-[10px] font-bold">{idx + 1}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-xs font-semibold text-slate-900 mb-1">{rec.title}</h4>
                                                                        <p className="text-[10px] text-slate-600 leading-relaxed">{rec.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Risk Mitigation Strategies */}
                                                {generationResult.aiInsights.riskMitigationStrategies.length > 0 && (
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Shield size={14} className="text-emerald-500" />
                                                            Risk Mitigation Strategies
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {generationResult.aiInsights.riskMitigationStrategies.slice(0, 3).map((strategy, idx) => (
                                                                <div key={idx} className="flex items-start gap-2 text-xs">
                                                                    <span className="text-emerald-500 mt-0.5">•</span>
                                                                    <div>
                                                                        <span className="font-semibold text-slate-900">{strategy.strategy}:</span>
                                                                        <span className="text-slate-600"> {strategy.description}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Long-term Opportunities */}
                                                {generationResult.aiInsights.longTermOpportunities.length > 0 && (
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Star size={14} className="text-slate-500" />
                                                            Long-term Opportunities
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {generationResult.aiInsights.longTermOpportunities.slice(0, 2).map((opp, idx) => (
                                                                <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                                                                    <h4 className="text-xs font-semibold text-slate-900 mb-1">{opp.opportunity}</h4>
                                                                    <p className="text-[10px] text-slate-600 mb-2">{opp.description}</p>
                                                                    <div className="flex gap-3 text-[10px]">
                                                                        <span className="text-slate-500">⏱ {opp.timeframe}</span>
                                                                        <span className="text-slate-500">💰 {opp.potentialReturn}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No results yet. Go back and generate.</p>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </ModalBody>

            <ModalFooter className="px-4 sm:px-6 py-3 sm:py-4 sticky bottom-0 z-10 lg:static">
                {currentStep > 1 ? (
                    <Button variant="outline" size="sm" onClick={handleBack} disabled={loading || generating} className="text-xs sm:text-sm">
                        <ArrowLeft size={13} className="sm:w-[14px] sm:h-[14px]" /> Back
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={handleClose} disabled={loading || generating} className="text-xs sm:text-sm">
                        Cancel
                    </Button>
                )}
                {currentStep < STEPS.length ? (
                    <Button
                        size="sm"
                        onClick={handleNext}
                        disabled={loading || generating}
                        className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm"
                    >
                        {generating ? (
                            <><Loader2 size={13} className="sm:w-[14px] sm:h-[14px] animate-spin" /> Generating...</>
                        ) : currentStep === 3 ? (
                            <><Brain size={13} className="sm:w-[14px] sm:h-[14px]" /> Generate & Continue</>
                        ) : (
                            <>Continue <ArrowRight size={13} className="sm:w-[14px] sm:h-[14px]" /></>
                        )}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => {
                            handleClose();
                            onSuccess();
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm"
                    >
                        <Check size={13} className="sm:w-[14px] sm:h-[14px]" /> Done
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

function UserCardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <div className="flex items-start gap-4">
                <Skeleton width={40} height={40} borderRadius="50%" />
                <div className="flex-1">
                    <Skeleton width={120} height={14} className="mb-1" />
                    <Skeleton width={160} height={12} />
                </div>
            </div>
        </div>
    );
}
