"use client";

import { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    User,
    Activity,
    FileText,
    Clock,
    RefreshCw,
    BarChart2,
    TrendingUp,
    Target,
    Wallet,
    Flag,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { UserAnalyticsSummary } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminAnalyticsModalProps {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    userSummary: UserAnalyticsSummary | null;
}

export function ViewAdminAnalyticsModal({ open, isOpen, onClose, userSummary }: ViewAdminAnalyticsModalProps) {
    const [step, setStep] = useState(1);
    const actualOpen = isOpen !== undefined ? isOpen : (open || false);

    const reset = useCallback(() => {
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    // Helper function to convert user summary to Supabase User format for UserAvatar
    const createMockUser = (summary: UserAnalyticsSummary): SupabaseUser => {
        return {
            id: summary.user_id,
            email: summary.user_email || "",
            user_metadata: {
                full_name: summary.user_name,
                avatar_url: summary.user_avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: summary.last_updated,
        } as SupabaseUser;
    };

    if (!userSummary) return null;

    return (
        <Modal open={actualOpen} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Analytics Details
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
                        {/* User Header */}
                        <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                            <div className="flex justify-center mb-3">
                                <UserAvatar 
                                    user={createMockUser(userSummary)} 
                                    size="xl"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{userSummary.user_name || "No Name"}</h3>
                            <p className="text-sm text-slate-500 mb-3">{userSummary.user_email || "Unknown User"}</p>
                            <div className="text-[24px] font-bold my-2 text-slate-900">
                                {userSummary.total_reports} Reports Generated
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-xs font-semibold text-emerald-500">
                                    Active Analytics
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-medium text-slate-600">
                                    Last Updated {format(new Date(userSummary.last_updated), "MMM dd")}
                                </span>
                            </div>
                        </div>

                        {/* Analytics Summary */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Analytics Summary</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow 
                                        label="Total Reports" 
                                        value={userSummary.total_reports.toString()} 
                                        icon={FileText} 
                                    />
                                    <DetailRow 
                                        label="Transactions" 
                                        value={userSummary.total_transactions.toString()} 
                                        icon={Wallet} 
                                    />
                                    <DetailRow 
                                        label="Active Budgets" 
                                        value={userSummary.active_budgets.toString()} 
                                        icon={Target} 
                                    />
                                    <DetailRow 
                                        label="Active Goals" 
                                        value={userSummary.active_goals.toString()} 
                                        icon={Flag} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Performance Metrics</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow 
                                        label="Avg Confidence" 
                                        value={`${(userSummary.avg_confidence_level * 100).toFixed(1)}%`} 
                                        icon={TrendingUp} 
                                    />
                                    <DetailRow 
                                        label="Avg Accuracy" 
                                        value={`${userSummary.avg_accuracy_score.toFixed(1)}%`} 
                                        icon={BarChart2} 
                                    />
                                    <DetailRow 
                                        label="Data Points" 
                                        value={userSummary.total_data_points.toLocaleString()} 
                                        icon={Activity} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Report Types */}
                        {userSummary.report_type_breakdown && userSummary.report_type_breakdown.length > 0 && (
                            <div>
                                <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Report Types</h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-5 space-y-0 divide-y divide-slate-100">
                                        {userSummary.report_type_breakdown.map((item) => (
                                            <DetailRow 
                                                key={item.type}
                                                label={item.type.replace(/_/g, ' ')} 
                                                value={item.count.toString()} 
                                                icon={FileText} 
                                            />
                                        ))}
                                    </div>
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
                                        value={userSummary.user_email || "Unknown"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="Name"
                                        value={userSummary.user_name || "—"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="User ID"
                                        value={userSummary.user_id}
                                        icon={User}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analytics Metadata */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Analytics Metadata
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Activity size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Analytics Status</div>
                                            <div className="text-[10px] text-slate-400">
                                                {userSummary.total_reports > 0 ? "Active analytics user" : "No analytics data"}
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
                                            <div className="text-sm font-semibold text-slate-900">First Report</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(userSummary.last_updated), "MMM dd, yyyy 'at' h:mm a")}
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
                                                {format(new Date(userSummary.last_updated), "MMM dd, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                User ID
                            </h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {userSummary.user_id}
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