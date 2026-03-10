"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    User,
    Activity,
    FileText,
    PieChart,
    BarChart2,
    TrendingUp,
    Target,
    BrainCircuit,
    AlertTriangle,
    CheckCircle,
    Wallet,
    Flag,
    Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { UserAnalyticsSummary } from "../_lib/types";
import { fetchUserAnalyticsDetails } from "../_lib/admin-analytics-service";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Details", "Reports"];

interface ViewAdminAnalyticsModalProps {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    userSummary: UserAnalyticsSummary | null;
}

function getReportTypeIcon(type: string): React.ComponentType<any> {
    switch (type) {
        case 'spending': return PieChart;
        case 'income-expense': return BarChart2;
        case 'savings': return Wallet;
        case 'trends': return TrendingUp;
        case 'goals': return Target;
        case 'predictions': return BrainCircuit;
        case 'financial_intelligence': return BrainCircuit;
        default: return FileText;
    }
}

export function ViewAdminAnalyticsModal({ open, isOpen, onClose, userSummary }: ViewAdminAnalyticsModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<any>(null);
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

    useEffect(() => {
        if (actualOpen && userSummary) {
            setLoading(true);
            fetchUserAnalyticsDetails(userSummary.user_id)
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Error fetching user details:", error);
                    } else {
                        setUserDetails(data);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [actualOpen, userSummary]);

    if (!userSummary) return null;

    return (
        <Modal open={actualOpen} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        User Analytics Details
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                        Step {step} of 3
                    </span>
                </div>
            </ModalHeader>

            {/* Stepper */}
            <Stepper steps={STEPS} currentStep={step} />

            {/* Body */}
            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {loading ? (
                    <div className="text-center py-12">
                        <Activity size={32} className="mx-auto text-gray-300 mb-2 animate-pulse" />
                        <p className="text-sm text-gray-500">Loading user details...</p>
                    </div>
                ) : !userDetails ? (
                    <div className="text-center py-12">
                        <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Failed to load user details</p>
                    </div>
                ) : (
                    <>
                        {/* STEP 1: Overview */}
                        {step === 1 && (
                            <div className="space-y-6 animate-txn-in">
                                {/* User Header */}
                                <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-gray-200">
                                    <div className="flex justify-center mb-3">
                                        <UserAvatar 
                                            user={createMockUser(userSummary)} 
                                            size="xl"
                                            className="ring-2 ring-white shadow-sm"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{userSummary.user_name || "Unknown User"}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{userSummary.user_email}</p>
                                    <div className="text-[32px] font-bold my-2 text-emerald-500">
                                        {userSummary.total_reports} <span className="text-xl text-gray-400">reports</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-gray-500 uppercase tracking-wider inline-block border border-gray-100">
                                            Active User
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs font-medium text-gray-600">
                                            {format(new Date(userSummary.last_updated), "MMM dd, yyyy")}
                                        </span>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-700 mb-3 uppercase tracking-[0.04em]">Summary Statistics</h4>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-5 space-y-0 divide-y divide-gray-100">
                                            <DetailRow label="Total Reports" value={userSummary.total_reports.toString()} icon={FileText} />
                                            <DetailRow label="Transactions" value={userSummary.total_transactions.toString()} icon={Wallet} />
                                            <DetailRow label="Active Budgets" value={userSummary.active_budgets.toString()} icon={Target} />
                                            <DetailRow label="Active Goals" value={userSummary.active_goals.toString()} icon={Flag} />
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div>
                                    <h4 className="text-[11px] font-semibold text-gray-700 mb-3 uppercase tracking-[0.04em]">Performance Metrics</h4>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-5 space-y-0 divide-y divide-gray-100">
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
                            </div>
                        )}

                        {/* STEP 2: Details */}
                        {step === 2 && (
                            <div className="space-y-6 animate-txn-in">
                                {/* Anomaly Detection */}
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 mb-3">Anomaly Detection</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                            <AlertTriangle size={20} className="text-red-600" />
                                            <div>
                                                <p className="text-xs text-red-600 font-medium">Active</p>
                                                <p className="text-2xl font-bold text-red-700">{userDetails.anomalies.active}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                            <CheckCircle size={20} className="text-emerald-600" />
                                            <div>
                                                <p className="text-xs text-emerald-600 font-medium">Resolved</p>
                                                <p className="text-2xl font-bold text-emerald-700">{userDetails.anomalies.resolved}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {userDetails.anomalies.recent.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-500 font-semibold mb-2">Recent Anomalies</p>
                                            {userDetails.anomalies.recent.slice(0, 3).map((anomaly: any) => (
                                                <div key={anomaly.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            anomaly.severity === 'high' ? 'bg-red-500' :
                                                            anomaly.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                                        }`} />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 capitalize">{anomaly.type.replace(/_/g, ' ')}</p>
                                                            <p className="text-xs text-gray-500">{anomaly.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* AI Insights */}
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 mb-3">AI Financial Insights</h3>
                                    {userDetails.ai_insights.has_insights ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-purple-600" />
                                                    <span className="text-sm font-medium text-purple-900">Insights Available</span>
                                                </div>
                                                <span className="text-xs text-purple-600">
                                                    {format(new Date(userDetails.ai_insights.last_generated), "MMM dd")}
                                                </span>
                                            </div>
                                            {userDetails.ai_insights.summary && (
                                                <div className="p-4 bg-white rounded-lg border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-semibold mb-2">Summary</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{userDetails.ai_insights.summary}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-white rounded-lg border border-gray-100">
                                            <BrainCircuit size={32} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-sm text-gray-500">No AI insights generated yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Report Settings */}
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 mb-3">Report Settings</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-5 space-y-0 divide-y divide-gray-100">
                                            <DetailRow 
                                                label="Report Type" 
                                                value={userDetails.report_settings.report_type.replace(/_/g, ' ')} 
                                                icon={FileText} 
                                            />
                                            <DetailRow 
                                                label="Timeframe" 
                                                value={userDetails.report_settings.timeframe} 
                                                icon={Calendar} 
                                            />
                                            <DetailRow 
                                                label="Chart Type" 
                                                value={userDetails.report_settings.chart_type} 
                                                icon={BarChart2} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Reports */}
                        {step === 3 && (
                            <div className="space-y-6 animate-txn-in">
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 mb-3">
                                        All Reports ({userDetails.reports.length})
                                    </h3>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {userDetails.reports.map((report: any) => {
                                            const Icon = getReportTypeIcon(report.report_type);
                                            return (
                                                <div key={report.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                            <Icon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 capitalize">
                                                                {report.report_type.replace(/_/g, ' ')}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {report.timeframe} • {format(new Date(report.generated_at), "MMM dd, yyyy")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Confidence</p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {report.confidence_level ? `${(report.confidence_level * 100).toFixed(0)}%` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Report Type Breakdown */}
                                <div>
                                    <h3 className="text-[15px] font-bold text-gray-900 mb-3">Report Type Breakdown</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-5 space-y-0 divide-y divide-gray-100">
                                            {userSummary.report_type_breakdown.map((item) => (
                                                <div key={item.type} className="flex justify-between items-center py-2.5">
                                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold capitalize">
                                                        {item.type.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-[13px] font-semibold text-gray-700">{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="flex justify-between">
                {step > 1 ? (
                    <Button variant="secondary" size="sm" onClick={() => setStep(step - 1)}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                ) : (
                    <div />
                )}
                <Button
                    size="sm"
                    onClick={() => {
                        if (step === 3) {
                            setStep(1);
                        } else {
                            setStep(step + 1);
                        }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                    disabled={loading}
                >
                    {step === 3 ? (
                        <>Back to Overview <ArrowLeft size={14} /></>
                    ) : (
                        <>Next <ArrowRight size={14} /></>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
    return (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1.5">
                <Icon size={12} className="text-gray-400" />
                {label}
            </span>
            <span className="text-[13px] font-semibold text-gray-700 capitalize">{value}</span>
        </div>
    );
}
