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
    TrendingUp,
    Target,
    BarChart3,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminBudget } from "../_lib/types";
import { deriveBudgetHealth } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminBudgetModalProps {
    open: boolean;
    onClose: () => void;
    budget: AdminBudget | null;
}

export function ViewAdminBudgetModal({
    open,
    onClose,
    budget,
}: ViewAdminBudgetModalProps) {
    const [step, setStep] = useState(1);

    const reset = useCallback(() => {
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const createMockUser = (budget: AdminBudget): SupabaseUser => {
        return {
            id: budget.user_id,
            email: budget.user_email || "",
            user_metadata: {
                full_name: budget.user_name,
                avatar_url: budget.user_avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: budget.created_at,
        } as SupabaseUser;
    };

    if (!budget) return null;

    const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - budget.spent;
    const health = deriveBudgetHealth(budget.spent, budget.amount);
    const healthColors = {
        "on-track": "text-emerald-500",
        caution: "text-amber-500",
        "at-risk": "text-red-500",
    };

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Budget Details
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
                        {/* Budget Header */}
                        <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                            <div className="flex justify-center mb-3">
                                <UserAvatar
                                    user={createMockUser(budget)}
                                    size="xl"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{budget.user_name || "No Name"}</h3>
                            <p className="text-sm text-slate-500 mb-3">{budget.user_email || "Unknown User"}</p>
                            <div className="text-[24px] font-bold my-2 text-slate-900">
                                {budget.budget_name}
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <span className={`text-xs font-semibold ${healthColors[health]}`}>
                                    {health === "on-track" ? "On Track" : health === "caution" ? "Caution" : "At Risk"}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-medium text-slate-600">
                                    {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Budget Progress */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Budget Progress</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-600">₱{budget.spent.toFixed(2)} / ₱{budget.amount.toFixed(2)}</span>
                                    <span className={`text-xs font-bold ${pct >= 95 ? "text-red-500" : pct >= 80 ? "text-amber-500" : "text-emerald-500"}`}>{pct.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-slate-400">Remaining: ₱{remaining.toFixed(2)}</span>
                                    <span className="text-[10px] text-slate-400">{remaining < 0 ? "Over budget" : "Under budget"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Budget Information */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Budget Information</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow
                                        label="Period"
                                        value={budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                                        icon={Calendar}
                                    />
                                    <DetailRow
                                        label="Start Date"
                                        value={format(new Date(budget.start_date + "T00:00:00"), "MMM dd, yyyy")}
                                        icon={Calendar}
                                    />
                                    <DetailRow
                                        label="End Date"
                                        value={format(new Date(budget.end_date + "T00:00:00"), "MMM dd, yyyy")}
                                        icon={Calendar}
                                    />
                                    <DetailRow
                                        label="Category"
                                        value={budget.expense_category_name || budget.category_name || "—"}
                                        icon={Tag}
                                    />
                                    <DetailRow
                                        label="Description"
                                        value={budget.description || "—"}
                                        icon={FileText}
                                    />
                                </div>
                            </div>
                        </div>
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
                                        value={budget.user_email || "Unknown"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="Name"
                                        value={budget.user_name || "—"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="User ID"
                                        value={budget.user_id}
                                        icon={User}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Budget Settings */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Budget Settings
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <TrendingUp size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Recurring</div>
                                            <div className="text-[10px] text-slate-400">
                                                {budget.is_recurring ? "This budget recurs automatically" : "One-time budget"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {budget.is_recurring ? "Yes" : "No"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <AlertTriangle size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Alert Threshold</div>
                                            <div className="text-[10px] text-slate-400">
                                                {budget.alert_enabled ? `Alert at ${(budget.alert_threshold * 100).toFixed(0)}%` : "Alerts disabled"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {budget.alert_enabled ? "Enabled" : "Disabled"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <BarChart3 size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Rollover</div>
                                            <div className="text-[10px] text-slate-400">
                                                {budget.rollover_enabled ? `Rollover amount: ₱${budget.rollover_amount.toFixed(2)}` : "No rollover"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {budget.rollover_enabled ? "Enabled" : "Disabled"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Clock size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Created</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(budget.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Budget ID
                            </h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {budget.id}
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
