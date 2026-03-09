"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Stepper } from "../../transactions/_components/stepper";
import { toast } from "sonner";
import {
    Loader2,
    ArrowLeft,
    ArrowRight,
    Check,
    Search,
    Info,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import { contributeToAdminGoal } from "../_lib/admin-goal-service";
import type { AdminGoal } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Skeleton from "react-loading-skeleton";

const STEPS = ["User Select", "Amount", "Review"];

interface ContributeAdminGoalModalProps {
    open: boolean;
    onClose: () => void;
    goal: AdminGoal | null;
    onSuccess: () => void;
}

type UserOption = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

function formatCurrency(n: number): string {
    if (isNaN(n)) return "₱0.00";
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "No Deadline";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ContributeAdminGoalModal({ open, onClose, goal, onSuccess }: ContributeAdminGoalModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // User Selection State
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const userListRef = useRef<HTMLDivElement>(null);

    // Form State
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [amount, setAmount] = useState("");

    // Reset when opened
    useEffect(() => {
        if (open) {
            setCurrentStep(1);
            setAmount("");
            // Default to goal owner if exists
            if (goal?.user_id) setSelectedUserId(goal.user_id);
            if (users.length === 0) loadUsers(true);
        }
    }, [open, goal]);

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

    // Trigger search when query changes
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
            listElement.addEventListener("scroll", handleScroll);
            return () => listElement.removeEventListener("scroll", handleScroll);
        }
    }, [loadingMore, hasMore, open, currentStep, loadUsers]);

    const handleClose = () => {
        setCurrentStep(1);
        setUserSearchQuery("");
        setSelectedUserId("");
        setAmount("");
        onClose();
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedUserId) {
                toast.error("Please select a user to associate with this contribution.");
                return;
            }
        }
        if (currentStep === 2) {
            if (!amount || parseFloat(amount) <= 0) {
                toast.error("Please enter a valid contribution amount.");
                return;
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!goal) return;

        try {
            setLoading(true);
            const { error } = await contributeToAdminGoal(goal.id, parseFloat(amount), selectedUserId);

            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Contribution recorded successfully!");
            handleClose();
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to record contribution.");
        } finally {
            setLoading(false);
        }
    };

    if (!goal) return null;

    const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
    const parsedAmount = parseFloat(amount) || 0;
    const newProgress = Math.min(Math.round(((goal.current_amount + parsedAmount) / goal.target_amount) * 100), 100);
    const newRemaining = Math.max(goal.target_amount - (goal.current_amount + parsedAmount), 0);

    // Fallback if the selected user isn't in the loaded list (like if it defaulted to goal owner but we haven't scrolled to them)
    const selectedUserRecord = users.find((u) => u.id === selectedUserId);
    const displayingUserParams = selectedUserRecord || {
        full_name: selectedUserId === goal.user_id ? goal.user_name : "Unknown",
        email: selectedUserId === goal.user_id ? goal.user_email : ""
    };

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Goal Contribution
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {currentStep} of 3
                    </span>
                </div>
            </ModalHeader>

            <Stepper steps={STEPS} currentStep={currentStep} />

            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30 min-h-[400px]">
                {/* Step 1: User Select */}
                {currentStep === 1 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select Contributor</h2>
                            <p className="text-[11px] text-gray-500">
                                Select the platform user who is making this administration-authorized contribution to {goal.goal_name}.
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
                            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <UserCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div ref={userListRef} className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
                                {users.map((user, idx) => {
                                    const selected = selectedUserId === user.id;
                                    const isOwner = goal.user_id === user.id;

                                    const supabaseUser: SupabaseUser = {
                                        id: user.id,
                                        email: user.email,
                                        user_metadata: { full_name: user.full_name, avatar_url: user.avatar_url },
                                        app_metadata: {},
                                        created_at: "",
                                        aud: "authenticated",
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
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                        >
                                            <div className="flex items-start gap-4">
                                                <UserAvatar
                                                    user={supabaseUser}
                                                    size="lg"
                                                    className="ring-2 ring-white shadow-sm flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-[13px] font-bold text-gray-900 truncate">
                                                            {user.full_name || "No Name"}
                                                        </h3>
                                                        {isOwner && (
                                                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                                                Goal Owner
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed truncate">{user.email}</p>
                                                </div>
                                                <div
                                                    className={`w-[18px] h-[18px] shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                        }`}
                                                >
                                                    <Check size={10} />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {users.length === 0 && (
                                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-slate-500 font-medium">
                                            {userSearchQuery ? `No users found matching "${userSearchQuery}"` : "No users found"}
                                        </p>
                                    </div>
                                )}
                                {loadingMore && (
                                    <div className="mt-3 space-y-3">
                                        {Array.from({ length: 2 }).map((_, i) => (
                                            <UserCardSkeleton key={`loading-${i}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!loadingUsers && !selectedUserId && users.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                                <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
                                <p className="text-[11px] text-blue-800 leading-relaxed">
                                    You must select what user to attribute this contribution to before proceeding.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Amount Selection */}
                {currentStep === 2 && (
                    <div className="animate-txn-in max-w-lg mx-auto">
                        <div className="mb-6 text-center">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Contribution Amount</h2>
                            <p className="text-[11px] text-gray-500">How much would you like to contribute to {goal.goal_name}?</p>
                        </div>

                        {/* Goal Summary */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{goal.goal_name}</h4>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">{goal.progress_percentage}% complete</span>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Current Progress</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(goal.current_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Target Amount</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(goal.target_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-gray-100">
                                    <span className="text-gray-500 font-medium">Remaining Need</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(remaining)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                            <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Enter Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">₱</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3.5 text-xl font-bold text-gray-900 bg-white border border-gray-200 rounded-xl transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06] shadow-inner"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {parsedAmount > remaining && remaining > 0 && (
                                <p className="text-[11px] text-amber-600 font-medium mt-2 flex items-center gap-1.5">
                                    <AlertTriangle size={12} /> That amount exceeds the remaining goal target.
                                </p>
                            )}
                        </div>

                        {/* Quick Amounts */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Quick Select</p>
                            <div className="grid grid-cols-4 gap-2.5">
                                {[
                                    Math.min(50, remaining || 50),
                                    Math.min(100, remaining || 100),
                                    Math.min(500, remaining || 500),
                                    Math.min(goal.auto_contribute_amount || 1000, remaining || 1000)
                                ].map((quickAmount, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setAmount(quickAmount.toString())}
                                        className="py-2.5 px-2 text-[13px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:text-emerald-600 hover:border-emerald-200 hover:shadow-sm transition-all"
                                    >
                                        ₱{quickAmount}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="animate-txn-in max-w-lg mx-auto">
                        <div className="mb-6 text-center">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Review Contribution</h2>
                            <p className="text-[11px] text-gray-500">Confirm the details before finalizing the contribution.</p>
                        </div>

                        {/* Big Amount Summary */}
                        <div className="text-center py-8 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6 shadow-sm">
                            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">Adding Funds</div>
                            <div className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(parsedAmount)}</div>
                            <div className="text-xs text-slate-500 mt-2 font-medium">to <span className="text-gray-900">{goal.goal_name}</span></div>
                        </div>

                        {/* Dual Progress Impact */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Original State</div>
                                <div className="text-lg font-bold text-gray-900 mb-0.5">{goal.progress_percentage}%</div>
                                <div className="text-xs text-gray-500 font-medium">{formatCurrency(goal.current_amount)} saved</div>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm relative overflow-hidden ring-1 ring-inset ring-emerald-500/10">
                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">New State</div>
                                <div className="text-lg font-bold text-emerald-700 mb-0.5">{newProgress}%</div>
                                <div className="text-xs text-emerald-600 font-medium">{formatCurrency(goal.current_amount + parsedAmount)} saved</div>
                                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                                    <CheckCircle size={64} className="text-emerald-500" />
                                </div>
                            </div>
                        </div>

                        {/* Table Summary */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <ReviewRow label="Goal Name" value={goal.goal_name} />
                                <ReviewRow label="Target" value={formatCurrency(goal.target_amount)} />
                                <ReviewRow label="Remaining Need" value={formatCurrency(newRemaining)} accent={newRemaining === 0 ? "emerald" : undefined} />
                                <ReviewRow label="Deadline" value={formatDate(goal.target_date)} />
                                <ReviewRow label="Target User" value={displayingUserParams.full_name || displayingUserParams.email || String(displayingUserParams)} />
                            </div>
                        </div>

                        {newProgress >= 100 && (
                            <div className="mt-4 flex gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 text-emerald-800 items-start">
                                <CheckCircle size={18} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-wide mb-0.5 text-emerald-900">Goal Conquered!</h4>
                                    <p className="text-[11px] leading-relaxed opacity-90">
                                        This contribution will push the progress to or beyond 100% of the target amount!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="px-6 py-4">
                {currentStep > 1 && (
                    <Button variant="outline" size="sm" className="flex-1 max-w-[120px]" onClick={handleBack} disabled={loading}>
                        <ArrowLeft size={14} className="mr-1.5" /> Back
                    </Button>
                )}
                <div className="flex-1" />
                {currentStep < STEPS.length ? (
                    <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px] shadow-sm"
                        onClick={handleNext}
                    >
                        Next Step <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px] shadow-sm"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin mr-2" /> Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={14} className="mr-1.5" /> Complete Contribution
                            </>
                        )}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

function ReviewRow({ label, value, accent }: { label: string; value: string; accent?: "emerald" }) {
    return (
        <div className="flex justify-between items-center py-3 gap-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex-shrink-0">
                {label}
            </span>
            <span className={`text-[13px] font-bold truncate text-right ${accent === "emerald" ? "text-emerald-600" : "text-slate-700"
                }`}>
                {value}
            </span>
        </div>
    );
}

function UserCardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden relative">
            <div className="flex items-start gap-4">
                <Skeleton circle width={42} height={42} className="shadow-sm" />
                <div className="flex-1">
                    <Skeleton width="50%" height={16} className="mb-1" />
                    <Skeleton width="70%" height={12} className="opacity-70" />
                </div>
            </div>
        </div>
    );
}
