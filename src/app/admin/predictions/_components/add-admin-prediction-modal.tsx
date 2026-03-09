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
    AlertTriangle,
    TrendingUp,
    Lightbulb,
    Shield,
    Star,
    BarChart3,
    PieChart,
    Wallet,
    Activity,
    Target,
    Zap,
    TrendingDown,
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
    } | null>(null);
    const userListRef = useRef<HTMLDivElement>(null);

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
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Generate Prediction
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {currentStep} of {STEPS.length}
                    </span>
                </div>
            </ModalHeader>

            <Stepper steps={STEPS} currentStep={currentStep} />

            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {/* Step 1: User Select */}
                {currentStep === 1 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select User</h2>
                            <p className="text-[11px] text-gray-500">
                                Choose a user to generate an AI prediction report for.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                            />
                        </div>

                        {loadingUsers ? (
                            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <UserCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div ref={userListRef} className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
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
                                            className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
                                                    ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                                }`}
                                            style={{ animationDelay: `${idx * 60}ms` }}
                                        >
                                            <div className="flex items-start gap-4">
                                                <UserAvatar
                                                    user={supabaseUser}
                                                    size="lg"
                                                    className="ring-2 ring-white shadow-sm flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">
                                                        {user.full_name || "No Name"}
                                                    </h3>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed">{user.email}</p>
                                                </div>
                                                <div
                                                    className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
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
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select Generation Type</h2>
                            <p className="text-[11px] text-gray-500">
                                Choose the type of AI analysis to generate for this user.
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

                        {/* Generation Type Cards */}
                        <div className="grid grid-cols-1 gap-3">
                            {GENERATION_TYPES.map((type, idx) => {
                                const selected = selectedGenerationType === type.id;
                                const Icon = type.icon;

                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedGenerationType(type.id)}
                                        className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                                            selected
                                                ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                        }`}
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white text-gray-400 border-gray-100">
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-[13px] font-bold text-gray-900">{type.title}</h3>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
                                                        {type.subtitle}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed">{type.description}</p>
                                            </div>
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
                                    { label: "Income vs Expenses Forecast", desc: "6-month historical analysis with Prophet-style forecasting", icon: BarChart3 },
                                    { label: "Category Spending Forecast", desc: "Per-category spending predictions with confidence intervals", icon: PieChart },
                                    { label: "Expense Type Analysis", desc: "Recurring vs variable expense classification", icon: Wallet },
                                    { label: "Transaction Behavior", desc: "Pattern detection and trend analysis", icon: Activity },
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
                            ) : (
                                // AI Financial Intelligence - Comprehensive AI analysis
                                [
                                    { label: "Financial Health Summary", desc: "Comprehensive overview of current financial situation", icon: Target },
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
                            <div className="flex items-center justify-center gap-3 p-6 mt-5 bg-white border border-slate-200 rounded-xl">
                                <Loader2 size={20} className="animate-spin text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
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
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <ClipboardCheck size={14} />
                                </div>
                                Generation Result
                            </h2>
                        </div>

                        {generationResult ? (
                            <div className="space-y-4">
                                {/* Status */}
                                <div className={`p-5 rounded-xl border text-center ${generationResult.success
                                        ? "bg-emerald-50 border-emerald-100"
                                        : "bg-red-50 border-red-100"
                                    }`}>
                                    <div className={`text-2xl font-bold mb-1 ${generationResult.success ? "text-emerald-600" : "text-red-600"}`}>
                                        {generationResult.success ? "✓ Success" : "✗ Failed"}
                                    </div>
                                    <p className={`text-sm ${generationResult.success ? "text-emerald-700" : "text-red-700"}`}>
                                        {generationResult.success
                                            ? selectedGenerationType === "financial_intelligence"
                                                ? "AI Financial Intelligence generated and saved successfully."
                                                : "Prediction generated and saved successfully."
                                            : generationResult.error || "Failed to generate prediction."}
                                    </p>
                                </div>

                                {/* Summary */}
                                {generationResult.success && (
                                    <>
                                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="p-5 space-y-0 divide-y divide-slate-100">
                                                <ReviewRow label="User" value={selectedUser?.email || "Unknown"} />
                                                <ReviewRow label="Generation Type" value={GENERATION_TYPES.find(t => t.id === selectedGenerationType)?.title || "Unknown"} />
                                                <ReviewRow label="Data Points" value={generationResult.dataPoints.toString()} />
                                                <ReviewRow label="Accuracy" value={`${generationResult.accuracy}%`} />
                                                <ReviewRow label="Insights Generated" value={generationResult.insights.toString()} />
                                                <ReviewRow label="Model" value="Prophet v1.1" />
                                            </div>
                                        </div>

                                        {/* AI Insights Details - Only show for financial_intelligence */}
                                        {selectedGenerationType === "financial_intelligence" && generationResult.aiInsights && (
                                            <div className="space-y-4">
                                                {/* Financial Summary */}
                                                <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Wand2 size={14} className="text-violet-500" />
                                                        Financial Summary
                                                    </h3>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {generationResult.aiInsights.financialSummary}
                                                    </p>
                                                </div>

                                                {/* Risk Assessment */}
                                                <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <AlertTriangle size={14} className={
                                                            generationResult.aiInsights.riskLevel === "high" ? "text-red-500" :
                                                            generationResult.aiInsights.riskLevel === "medium" ? "text-amber-500" :
                                                            "text-emerald-500"
                                                        } />
                                                        Risk Assessment
                                                    </h3>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                            generationResult.aiInsights.riskLevel === "high" ? "bg-red-100 text-red-700" :
                                                            generationResult.aiInsights.riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                                                            "bg-emerald-100 text-emerald-700"
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
                                                <div className="bg-white border border-slate-200 rounded-xl p-5">
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
                                                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Lightbulb size={14} className="text-amber-500" />
                                                            Recommendations ({generationResult.aiInsights.recommendations.length})
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {generationResult.aiInsights.recommendations.slice(0, 3).map((rec, idx) => (
                                                                <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                        rec.priority === "high" ? "bg-red-100 text-red-600" :
                                                                        rec.priority === "medium" ? "bg-amber-100 text-amber-600" :
                                                                        "bg-blue-100 text-blue-600"
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
                                                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Shield size={14} className="text-blue-500" />
                                                            Risk Mitigation Strategies
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {generationResult.aiInsights.riskMitigationStrategies.slice(0, 3).map((strategy, idx) => (
                                                                <div key={idx} className="flex items-start gap-2 text-xs">
                                                                    <span className="text-blue-500 mt-0.5">•</span>
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
                                                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Star size={14} className="text-violet-500" />
                                                            Long-term Opportunities
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {generationResult.aiInsights.longTermOpportunities.slice(0, 2).map((opp, idx) => (
                                                                <div key={idx} className="p-3 bg-violet-50 rounded-lg">
                                                                    <h4 className="text-xs font-semibold text-violet-900 mb-1">{opp.opportunity}</h4>
                                                                    <p className="text-[10px] text-violet-700 mb-2">{opp.description}</p>
                                                                    <div className="flex gap-3 text-[10px]">
                                                                        <span className="text-violet-600">⏱ {opp.timeframe}</span>
                                                                        <span className="text-violet-600">💰 {opp.potentialReturn}</span>
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
            </ModalBody>

            <ModalFooter className="px-6 py-4">
                {currentStep > 1 ? (
                    <Button variant="outline" size="sm" onClick={handleBack} disabled={loading || generating}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={handleClose} disabled={loading || generating}>
                        Cancel
                    </Button>
                )}
                {currentStep < STEPS.length ? (
                    <Button
                        size="sm"
                        onClick={handleNext}
                        disabled={loading || generating}
                        className="bg-emerald-500 hover:bg-emerald-600"
                    >
                        {generating ? (
                            <><Loader2 size={14} className="animate-spin" /> Generating...</>
                        ) : currentStep === 3 ? (
                            <><Brain size={14} /> Generate & Continue</>
                        ) : (
                            <>Continue <ArrowRight size={14} /></>
                        )}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => {
                            handleClose();
                            onSuccess();
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600"
                    >
                        <Check size={14} /> Done
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
            <span className="text-[13px] font-semibold text-slate-700">{value}</span>
        </div>
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
