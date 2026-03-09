"use client";

import { useState, useCallback } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    ArrowRight,
    Info,
    Users,
    Globe,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
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

    const handleNext = useCallback(() => {
        if (step >= 2) {
            handleClose();
            return;
        }
        setStep((s) => s + 1);
    }, [step, handleClose]);

    const handleBack = useCallback(() => {
        if (step <= 1) return;
        setStep((s) => s - 1);
    }, [step]);

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
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">{goal.goal_name}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                        Step {step} of 2
                    </span>
                </div>
            </ModalHeader>

            {/* Body */}
            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {/* Stepper */}
                <Stepper steps={STEPS} currentStep={step} />

                {/* STEP 1: Overview */}
                {step === 1 && (
                    <div className="space-y-4 animate-txn-in">
                        <div className="text-center py-6 bg-[#F9FAFB]/50 rounded-xl border border-gray-200">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Progress</div>
                            <div className="text-3xl font-bold text-gray-900">{progress}%</div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">
                                {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500">Goal Progress</span>
                                    <span className="font-medium text-slate-900">{progress}%</span>
                                </div>
                                <ProgressBar value={goal.current_amount} max={goal.target_amount} color="success" className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-lg bg-white border border-gray-200">
                                    <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Status</div>
                                    <div className="text-sm font-semibold text-gray-900 capitalize">
                                        {goal.status === "completed" ? "Completed" : goal.status === "in_progress" ? "In Progress" : goal.status === "cancelled" ? "Cancelled" : goal.status === "paused" ? "Paused" : "Not Started"}
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-white border border-gray-200">
                                    <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Priority</div>
                                    <div className="text-sm font-semibold text-gray-900 capitalize">{goal.priority}</div>
                                </div>

                                <div className="p-4 rounded-lg bg-white border border-gray-200">
                                    <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Remaining</div>
                                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(remaining)}</div>
                                </div>

                                <div className="p-4 rounded-lg bg-white border border-gray-200">
                                    <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] mb-2">Days Left</div>
                                    <div className="text-sm font-semibold text-gray-900">{daysRemaining} days</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-start gap-3">
                            <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                            <div>
                                <div className="font-medium text-sm text-gray-900">Goal Performance</div>
                                <div className="text-xs text-gray-600">
                                    {progress}% toward goal with {daysRemaining} days remaining.
                                </div>
                            </div>
                        </div>

                        {/* Goal Owner Section */}
                        <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                            <UserAvatar 
                                user={createMockUser(goal)} 
                                size="md"
                                className="ring-2 ring-white shadow-sm flex-shrink-0"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900 mb-1">Goal Owner</div>
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-600">
                                        Name: <span className="font-semibold">{goal.user_name || "Unknown"}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Email: <span className="font-semibold">{goal.user_email || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Family Context Section */}
                        {goal.is_family_goal && (
                            <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                                <Users size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900 mb-1.5">Family Goal</div>
                                    {goal.family_name && (
                                        <div className="text-xs text-gray-600 mb-2">
                                            Family: <span className="font-semibold">{goal.family_name}</span>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        Shared with family members for collaborative tracking and contributions
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Public Goal Context */}
                        {goal.is_public && !goal.is_family_goal && (
                            <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                                <Globe size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900 mb-1">Public Goal</div>
                                    <div className="text-xs text-gray-500">
                                        Visible to the public community for inspiration
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Analysis */}
                {step === 2 && (
                    <div className="space-y-4 animate-txn-in">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Goal Analysis & Insights</h4>
                            <p className="text-xs text-slate-500">Comprehensive goal performance and projections</p>
                        </div>

                        {/* Goal Performance Overview */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-[10px] text-gray-500 mb-2">Goal Utilization</div>
                                <div className="flex items-center justify-center h-16">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full border-3 border-gray-200"></div>
                                        <div
                                            className="absolute inset-0 w-14 h-14 rounded-full border-3 border-emerald-500 border-t-transparent rotate-45"
                                        ></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-700">{progress}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mt-2">
                                    <div className="text-xs font-semibold text-gray-700">{formatCurrency(remaining)}</div>
                                    <div className="text-[9px] text-gray-500">remaining</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-[10px] text-gray-500 mb-2">Contribution Trend</div>
                                <div className="h-16 flex items-end justify-center gap-1">
                                    <div className="w-2 bg-gray-300 h-1/2 rounded-t-sm"></div>
                                    <div className="w-2 bg-gray-300 h-2/3 rounded-t-sm"></div>
                                    <div className="w-2 bg-emerald-500 h-3/4 rounded-t-sm"></div>
                                    <div className="w-2 bg-amber-500 h-full rounded-t-sm"></div>
                                    <div className="w-2 bg-gray-300 h-2/3 rounded-t-sm"></div>
                                </div>
                                <div className="text-center mt-2">
                                    <div className="text-xs font-semibold text-gray-700 flex items-center justify-center gap-1">
                                        {progress > 80 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {Math.abs(progress - 100)}%
                                    </div>
                                    <div className="text-[9px] text-gray-500">vs target</div>
                                </div>
                            </div>
                        </div>

                        {/* Goal Details */}
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Goal Name</div>
                                <div className="text-sm font-semibold text-slate-900">{goal.goal_name}</div>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Category</div>
                                <div className="text-sm font-semibold text-slate-900 capitalize">{goal.category}</div>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Target Amount</div>
                                <div className="text-sm font-semibold text-slate-900">{formatCurrency(goal.target_amount)}</div>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Current Progress</div>
                                <div className="text-sm font-semibold text-slate-900">{formatCurrency(goal.current_amount)}</div>
                            </div>

                            {goal.auto_contribute && (
                                <div className="p-4 rounded-lg border border-slate-200">
                                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Auto Contribution</div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {formatCurrency(goal.auto_contribute_amount)} / {goal.auto_contribute_frequency || "monthly"}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Deadline</div>
                                <div className="text-sm font-semibold text-slate-900">{formatDate(goal.target_date)}</div>
                            </div>

                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Priority</div>
                                <div className="text-sm font-semibold text-slate-900 capitalize">{goal.priority}</div>
                            </div>

                            {(goal.is_family_goal || goal.is_public) && (
                                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.05em] mb-2 text-gray-600">Goal Type</div>
                                    <div className="text-sm font-semibold flex items-center gap-2 mb-3">
                                        {goal.is_family_goal ? (
                                            <>
                                                <Users size={14} className="text-gray-600" />
                                                <span className="text-gray-900">Family Goal</span>
                                            </>
                                        ) : (
                                            <>
                                                <Globe size={14} className="text-gray-600" />
                                                <span className="text-gray-900">Public Goal</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="text-xs mt-3 pt-2 border-t border-gray-100 text-gray-600">
                                        {goal.is_family_goal ? (
                                            <>Shared with family members for collaborative tracking and contributions</>
                                        ) : (
                                            <>Visible to the public community for inspiration</>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Projected Completion */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-900 mb-3">Projected Completion</h4>
                            <div className="p-3 rounded-lg border border-slate-100">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-xs text-slate-600">Current Rate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700">{formatCurrency(goal.current_amount)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-xs text-slate-600">Target</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700">{formatCurrency(goal.target_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Description */}
                        {(goal.description || goal.notes) && (
                            <div className="space-y-3">
                                {goal.description && (
                                    <div className="p-4 rounded-lg border border-slate-200">
                                        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Description</div>
                                        <div className="text-sm text-slate-900">{goal.description}</div>
                                    </div>
                                )}
                                {goal.notes && (
                                    <div className="p-4 rounded-lg border border-slate-200">
                                        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Notes</div>
                                        <div className="text-sm text-slate-900">{goal.notes}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="flex justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className={cn("transition-all", step === 1 ? "invisible" : "")}
                >
                    <ArrowLeft size={14} className="mr-1" />
                    Back
                </Button>
                <div className="flex-1" />
                <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-emerald-500 hover:bg-emerald-600"
                >
                    {step === 2 ? "Close" : "View Analysis"}
                    <ArrowRight size={14} className="ml-1" />
                </Button>
            </ModalFooter>
        </Modal>
    );
}
