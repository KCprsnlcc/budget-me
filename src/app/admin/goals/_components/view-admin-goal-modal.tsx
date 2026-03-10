"use client";

import { useState, useCallback } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    User,
    Tag,
    FileText,
    Clock,
    RefreshCw,
    Target,
    TrendingUp,
    Users,
    Globe,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminGoal } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminGoalModalProps {
    open: boolean;
    onClose: () => void;
    goal: AdminGoal | null;
}

function formatCurrency(n: number): string {
    if (isNaN(n)) return "₱0.00";
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "No Deadline";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysRemaining(dateStr: string | null): number {
    if (!dateStr) return 0;
    const target = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function ViewAdminGoalModal({
    open,
    onClose,
    goal,
}: ViewAdminGoalModalProps) {
    const [step, setStep] = useState(1);

    const reset = useCallback(() => {
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const createMockUser = (goal: AdminGoal): SupabaseUser => {
        return {
            id: goal.user_id,
            email: goal.user_email || "",
            user_metadata: {
                full_name: goal.user_name,
                avatar_url: goal.user_avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: goal.created_at,
        } as SupabaseUser;
    };

    if (!goal) return null;

    const progress = goal.progress_percentage ?? 0;
    const remaining = Math.max(0, goal.target_amount - goal.current_amount);
    const daysRemaining = getDaysRemaining(goal.target_date);

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Goal Details
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {step} of 2
                    </span>
                </div>
            </ModalHeader>

            {/* Stepper */}
            <Stepper steps={STEPS} currentStep={step} />

            {/* Body */}
            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {/* STEP 1: Overview */}
                {step === 1 && (
                    <div className="space-y-6 animate-txn-in">
                        {/* Goal Header */}
                        <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                            <div className="flex justify-center mb-3">
                                <UserAvatar
                                    user={createMockUser(goal)}
                                    size="xl"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{goal.user_name || "No Name"}</h3>
                            <p className="text-sm text-slate-500 mb-3">{goal.user_email || "Unknown User"}</p>
                            <div className="text-[24px] font-bold my-2 text-slate-900">
                                {goal.goal_name}
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <span className={`text-xs font-semibold ${
                                    goal.status === "completed" ? "text-emerald-500" :
                                    goal.status === "in_progress" ? "text-blue-500" :
                                    goal.status === "cancelled" ? "text-red-500" :
                                    goal.status === "paused" ? "text-amber-500" : "text-slate-500"
                                }`}>
                                    {goal.status === "completed" ? "Completed" : 
                                     goal.status === "in_progress" ? "In Progress" : 
                                     goal.status === "cancelled" ? "Cancelled" : 
                                     goal.status === "paused" ? "Paused" : "Not Started"}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-medium text-slate-600 capitalize">
                                    {goal.priority} Priority
                                </span>
                            </div>
                        </div>

                        {/* Goal Progress */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Goal Progress</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-600">{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</span>
                                    <span className={`text-xs font-bold ${progress >= 95 ? "text-emerald-500" : progress >= 80 ? "text-blue-500" : "text-slate-500"}`}>{progress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${progress >= 95 ? "bg-emerald-500" : progress >= 80 ? "bg-blue-500" : "bg-slate-400"}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-slate-400">Remaining: {formatCurrency(remaining)}</span>
                                    <span className="text-[10px] text-slate-400">{daysRemaining} days left</span>
                                </div>
                            </div>
                        </div>

                        {/* Goal Information */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Goal Information</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow
                                        label="Category"
                                        value={goal.category || "—"}
                                        icon={Tag}
                                    />
                                    <DetailRow
                                        label="Target Amount"
                                        value={formatCurrency(goal.target_amount)}
                                        icon={Target}
                                    />
                                    <DetailRow
                                        label="Target Date"
                                        value={formatDate(goal.target_date)}
                                        icon={Calendar}
                                    />
                                    <DetailRow
                                        label="Priority"
                                        value={goal.priority?.charAt(0).toUpperCase() + goal.priority?.slice(1) || "—"}
                                        icon={TrendingUp}
                                    />
                                    {goal.description && (
                                        <DetailRow
                                            label="Description"
                                            value={goal.description}
                                            icon={FileText}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Goal Type */}
                        {(goal.is_family_goal || goal.is_public) && (
                            <div>
                                <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Goal Type</h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-5">
                                    {goal.is_family_goal && (
                                        <div className="flex items-center gap-3 mb-3">
                                            <Users size={16} className="text-slate-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">Family Goal</div>
                                                <div className="text-xs text-slate-500">Shared with family members</div>
                                            </div>
                                        </div>
                                    )}
                                    {goal.is_public && !goal.is_family_goal && (
                                        <div className="flex items-center gap-3">
                                            <Globe size={16} className="text-slate-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">Public Goal</div>
                                                <div className="text-xs text-slate-500">Visible to the community</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Analysis */}
                {step === 2 && (
                    <div className="space-y-6 animate-txn-in">
                        {/* User Information */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                User Information
                            </h3>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow
                                        label="Email"
                                        value={goal.user_email || "Unknown"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="Name"
                                        value={goal.user_name || "—"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="User ID"
                                        value={goal.user_id}
                                        icon={User}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Goal Metadata */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Goal Metadata
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Tag size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Category</div>
                                            <div className="text-[10px] text-slate-400">
                                                {goal.category || "Uncategorized"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Clock size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Created</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(goal.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <RefreshCw size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(goal.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Goal ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Goal ID
                            </h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {goal.id}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="flex justify-between">
                {step > 1 ? (
                    <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                ) : (
                    <div />
                )}
                <Button
                    size="sm"
                    onClick={() => {
                        if (step === 2) {
                            setStep(1);
                        } else {
                            setStep(2);
                        }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                >
                    {step === 2 ? (
                        <>Back to Overview <ArrowLeft size={14} /></>
                    ) : (
                        <>View Analysis <ArrowRight size={14} /></>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
    return (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
                <Icon size={12} className="text-slate-400" />
                {label}
            </span>
            <span className="text-[13px] font-semibold text-slate-700">{value}</span>
        </div>
    );
}