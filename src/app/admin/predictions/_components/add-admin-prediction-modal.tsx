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
    Sparkles,
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

interface AddAdminPredictionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = ["User Select", "Generate", "Review"];

type User = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

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
    const [generationResult, setGenerationResult] = useState<{
        success: boolean;
        dataPoints: number;
        accuracy: number;
        insights: number;
        error?: string;
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

                // Save the prediction
                const result = await savePrediction(selectedUserId, {
                    type: "predictions",
                    insights: categoryPredictions.map(c => c.insight),
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
                    insights: categoryPredictions.length,
                    error: result.error,
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
                        Step {currentStep} of 3
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

                {/* Step 2: Generate */}
                {currentStep === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <Brain size={14} />
                                </div>
                                Generate Prediction
                            </h2>
                            <p className="text-[11px] text-gray-500">
                                AI will analyze the user's transaction history and generate predictions.
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

                        {/* Generation Info */}
                        <div className="space-y-3">
                            {[
                                { label: "Income vs Expenses Forecast", desc: "6-month historical analysis with Prophet-style forecasting" },
                                { label: "Category Spending Forecast", desc: "Per-category spending predictions with confidence intervals" },
                                { label: "Expense Type Analysis", desc: "Recurring vs variable expense classification" },
                                { label: "Transaction Behavior", desc: "Pattern detection and trend analysis" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                                    <div className="w-8 h-8 rounded-lg border border-slate-100 bg-violet-50 flex items-center justify-center">
                                        <Sparkles size={14} className="text-violet-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-900">{item.label}</h4>
                                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {generating && (
                            <div className="flex items-center justify-center gap-3 p-6 mt-5 bg-violet-50 border border-violet-100 rounded-xl">
                                <Loader2 size={20} className="animate-spin text-violet-500" />
                                <span className="text-sm font-medium text-violet-700">Generating predictions...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
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
                                            ? "Prediction generated and saved successfully."
                                            : generationResult.error || "Failed to generate prediction."}
                                    </p>
                                </div>

                                {/* Summary */}
                                {generationResult.success && (
                                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-5 space-y-0 divide-y divide-slate-100">
                                            <ReviewRow label="User" value={selectedUser?.email || "Unknown"} />
                                            <ReviewRow label="Data Points" value={generationResult.dataPoints.toString()} />
                                            <ReviewRow label="Accuracy" value={`${generationResult.accuracy}%`} />
                                            <ReviewRow label="Insights Generated" value={generationResult.insights.toString()} />
                                            <ReviewRow label="Model" value="Prophet v1.1" />
                                        </div>
                                    </div>
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
                        ) : currentStep === 2 ? (
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
