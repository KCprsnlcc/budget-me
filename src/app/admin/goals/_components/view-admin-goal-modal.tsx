"use client";

import { useState, useCallback } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    User,
    Target,
    TrendingUp,
    Flag,
    Clock,
    Users,
    Eye,
    Zap,
    FileText,
} from "lucide-react";
import { Stepper } from "../../transactions/_components/stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminGoal } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminGoalModalProps {
    open: boolean;
    onClose: () => void;
    goal: AdminGoal | null;
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

    const statusConfig: Record<string, { label: string; color: string }> = {
        in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
        completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
        not_started: { label: "Not Started", color: "bg-slate-100 text-slate-600" },
        cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
        paused: { label: "Paused", color: "bg-amber-100 text-amber-700" },
    };

    const priorityConfig: Record<string, { label: string; color: string }> = {
        low: { label: "Low", color: "bg-slate-100 text-slate-600" },
        medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
        high: { label: "High", color: "bg-amber-100 text-amber-700" },
        urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
    };

    const categoryConfig: Record<string, string> = {
        emergency: "🚨",
        vacation: "🏖️",
        house: "🏠",
        car: "🚗",
        education: "📚",
        retirement: "🏦",
        debt: "💳",
        general: "🎯",
    };

    const sts = statusConfig[goal.status] ?? statusConfig.in_progress;
    const pri = priorityConfig[goal.priority] ?? priorityConfig.medium;
    const emoji = categoryConfig[goal.category] ?? "🎯";

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
                                    size="lg"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <div className="text-[22px] font-extrabold text-slate-900 mb-0.5 tracking-tight">
                                {emoji} {goal.goal_name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                                {goal.user_name || goal.user_email}
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${sts.color}`}>
                                    {sts.label}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${pri.color}`}>
                                    {pri.label} Priority
                                </span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Progress</span>
                                <span className="text-[13px] font-bold text-slate-900">{progress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progress >= 100
                                            ? "bg-emerald-500"
                                            : progress >= 75
                                                ? "bg-blue-500"
                                                : progress >= 50
                                                    ? "bg-amber-500"
                                                    : "bg-slate-400"
                                        }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[11px] text-slate-500">₱{goal.current_amount.toLocaleString()}</span>
                                <span className="text-[11px] text-slate-500">₱{goal.target_amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <DetailRow label="Category" value={`${emoji} ${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}`} />
                                <DetailRow label="Target Amount" value={`₱${goal.target_amount.toLocaleString()}`} />
                                <DetailRow label="Saved" value={`₱${goal.current_amount.toLocaleString()}`} />
                                <DetailRow label="Remaining" value={`₱${remaining.toLocaleString()}`} />
                                <DetailRow
                                    label="Target Date"
                                    value={goal.target_date
                                        ? new Date(goal.target_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                        : "None"
                                    }
                                />
                                <DetailRow
                                    label="Created"
                                    value={new Date(goal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Analysis */}
                {step === 2 && (
                    <div className="space-y-6 animate-txn-in">
                        {/* Attributes */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Goal Attributes</h3>
                            </div>
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <DetailRow label="Family Goal" value={goal.is_family_goal ? "Yes" : "No"} />
                                {goal.family_name && <DetailRow label="Family" value={goal.family_name} />}
                                <DetailRow label="Public" value={goal.is_public ? "Yes" : "No"} />
                                <DetailRow label="Auto Contribute" value={goal.auto_contribute ? `₱${goal.auto_contribute_amount.toLocaleString()} / ${goal.auto_contribute_frequency || "monthly"}` : "Disabled"} />
                            </div>
                        </div>

                        {/* Notes & Description */}
                        {(goal.description || goal.notes) && (
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Notes & Description</h3>
                                </div>
                                <div className="p-5 space-y-3">
                                    {goal.description && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Description</p>
                                            <p className="text-[12px] text-slate-600 leading-relaxed">{goal.description}</p>
                                        </div>
                                    )}
                                    {goal.notes && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Notes</p>
                                            <p className="text-[12px] text-slate-600 leading-relaxed">{goal.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Timeline</h3>
                            </div>
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <DetailRow
                                    label="Created"
                                    value={new Date(goal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                />
                                <DetailRow
                                    label="Last Updated"
                                    value={new Date(goal.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                />
                                {goal.completed_date && (
                                    <DetailRow
                                        label="Completed"
                                        value={new Date(goal.completed_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    />
                                )}
                                <DetailRow label="Goal ID" value={goal.id.slice(0, 8) + "..."} />
                                <DetailRow label="User ID" value={goal.user_id.slice(0, 8) + "..."} />
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="px-6 py-4">
                {step > 1 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setStep((s) => s - 1)}
                    >
                        <ArrowLeft size={14} /> Back
                    </Button>
                )}
                {step < STEPS.length ? (
                    <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => setStep((s) => s + 1)}
                    >
                        Next <ArrowRight size={14} />
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleClose}
                    >
                        Close
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
            <span className="text-sm font-semibold text-slate-700 text-right max-w-[60%] truncate">{value}</span>
        </div>
    );
}
