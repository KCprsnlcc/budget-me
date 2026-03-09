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
    Brain,
    Tag,
    FileText,
    Clock,
    TrendingUp,
    Shield,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    Database,
    Activity,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminPredictionReport, AdminAIInsight } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Data & Analysis"];

interface ViewAdminPredictionModalProps {
    open: boolean;
    onClose: () => void;
    report: AdminPredictionReport | null;
    insight: AdminAIInsight | null;
    dataSource: "reports" | "insights";
}

export function ViewAdminPredictionModal({
    open,
    onClose,
    report,
    insight,
    dataSource,
}: ViewAdminPredictionModalProps) {
    const [step, setStep] = useState(1);

    const reset = useCallback(() => {
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const createMockUser = (userId: string, email?: string, name?: string, avatar?: string): SupabaseUser => {
        return {
            id: userId,
            email: email || "",
            user_metadata: {
                full_name: name,
                avatar_url: avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: "",
        } as SupabaseUser;
    };

    if (dataSource === "reports" && !report) return null;
    if (dataSource === "insights" && !insight) return null;

    // Unified data extraction
    const item = dataSource === "reports" ? report! : insight!;
    const userId = item.user_id;
    const userEmail = item.user_email;
    const userName = item.user_name;
    const userAvatar = item.user_avatar;
    const createdAt = dataSource === "reports" ? report!.created_at : insight!.generated_at;
    const confidenceLevel = dataSource === "reports"
        ? report!.confidence_level
        : insight!.confidence_level ? insight!.confidence_level * 100 : null;

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {dataSource === "reports" ? "Prediction Report" : "AI Insight"} Details
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
                        {/* Header */}
                        <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                            <div className="flex justify-center mb-3">
                                <UserAvatar
                                    user={createMockUser(userId, userEmail, userName, userAvatar)}
                                    size="xl"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{userName || "No Name"}</h3>
                            <p className="text-sm text-slate-500 mb-3">{userEmail || "Unknown User"}</p>

                            {dataSource === "reports" ? (
                                <>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100">
                                            <Brain size={12} /> {report!.report_type}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">
                                            {report!.timeframe}
                                        </span>
                                    </div>
                                    {report!.accuracy_score !== null && (
                                        <div className="text-[32px] font-bold my-2 text-emerald-500">
                                            {Number(report!.accuracy_score).toFixed(0)}%
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xs font-medium text-slate-600">
                                            Accuracy Score
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs font-medium text-slate-600">
                                            {report!.model_version || "Unknown Model"}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${insight!.processing_status === "completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                            }`}>
                                            {insight!.processing_status === "completed" ? <CheckCircle2 size={12} /> : <Activity size={12} />}
                                            {insight!.processing_status || "Unknown"}
                                        </span>
                                        {insight!.anomaly_detected && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                                                <AlertTriangle size={12} /> Anomaly
                                            </span>
                                        )}
                                    </div>
                                    {confidenceLevel !== null && (
                                        <div className="text-[32px] font-bold my-2 text-violet-500">
                                            {confidenceLevel.toFixed(0)}%
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xs font-medium text-slate-600">
                                            Confidence Level
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs font-medium text-slate-600">
                                            {insight!.model_used || "Unknown Model"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Key Information */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">
                                {dataSource === "reports" ? "Report" : "Insight"} Information
                            </h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow
                                        label="Generated"
                                        value={format(new Date(createdAt), "MMM dd, yyyy 'at' h:mm a")}
                                        icon={Calendar}
                                    />
                                    {dataSource === "reports" ? (
                                        <>
                                            <DetailRow
                                                label="Report Type"
                                                value={report!.report_type}
                                                icon={Tag}
                                            />
                                            <DetailRow
                                                label="Timeframe"
                                                value={report!.timeframe}
                                                icon={Clock}
                                            />
                                            <DetailRow
                                                label="Data Points"
                                                value={report!.data_points.toString()}
                                                icon={Database}
                                            />
                                            <DetailRow
                                                label="Model"
                                                value={report!.model_version || "—"}
                                                icon={Brain}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <DetailRow
                                                label="AI Service"
                                                value={insight!.ai_service || "—"}
                                                icon={Sparkles}
                                            />
                                            <DetailRow
                                                label="Model"
                                                value={insight!.model_used || "—"}
                                                icon={Brain}
                                            />
                                            <DetailRow
                                                label="Status"
                                                value={(insight!.processing_status || "Unknown").charAt(0).toUpperCase() + (insight!.processing_status || "Unknown").slice(1)}
                                                icon={Activity}
                                            />
                                            <DetailRow
                                                label="Access Count"
                                                value={insight!.access_count.toString()}
                                                icon={BarChart3}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Status (insights only) */}
                        {dataSource === "insights" && (
                            <div>
                                <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Admin Status</h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-5 space-y-0 divide-y divide-slate-100">
                                        <DetailRow
                                            label="Validated"
                                            value={insight!.admin_validated ? "Yes" : "No"}
                                            icon={Shield}
                                        />
                                        <DetailRow
                                            label="Anomaly Detected"
                                            value={insight!.anomaly_detected ? "Yes" : "No"}
                                            icon={AlertTriangle}
                                        />
                                        {insight!.validation_notes && (
                                            <DetailRow
                                                label="Notes"
                                                value={insight!.validation_notes}
                                                icon={FileText}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Data & Analysis */}
                {step === 2 && (
                    <div className="space-y-6 animate-txn-in">
                        {/* User Information */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                User Information
                            </h3>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow label="Email" value={userEmail || "Unknown"} icon={User} />
                                    <DetailRow label="Name" value={userName || "—"} icon={User} />
                                    <DetailRow label="User ID" value={userId} icon={User} />
                                </div>
                            </div>
                        </div>

                        {/* Data Content */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                {dataSource === "reports" ? "Prediction Data" : "AI Analysis Data"}
                            </h3>
                            <div className="space-y-2">
                                {dataSource === "reports" ? (
                                    <>
                                        {/* Report prediction data summary */}
                                        <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                                    <BarChart3 size={16} className="text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">Data Points</div>
                                                    <div className="text-[10px] text-slate-400">{report!.data_points} points analyzed</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                                    <TrendingUp size={16} className="text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">Accuracy</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {report!.accuracy_score !== null ? `${Number(report!.accuracy_score).toFixed(1)}% score` : "Not scored yet"}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-slate-600">
                                                {report!.accuracy_score !== null
                                                    ? Number(report!.accuracy_score) >= 80 ? "High" : Number(report!.accuracy_score) >= 60 ? "Medium" : "Low"
                                                    : "—"}
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
                                                        {format(new Date(report!.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Insight analysis data summary */}
                                        {insight!.risk_assessment && (
                                            <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                                        <Shield size={16} className={
                                                            insight!.risk_assessment?.risk_level === "high" ? "text-red-600" :
                                                                insight!.risk_assessment?.risk_level === "medium" ? "text-amber-600" : "text-emerald-600"
                                                        } />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">Risk Assessment</div>
                                                        <div className="text-[10px] text-slate-400">
                                                            Level: {insight!.risk_assessment?.risk_level || "Unknown"} • Score: {insight!.risk_assessment?.risk_score || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                                    <Sparkles size={16} className="text-violet-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">AI Service</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {insight!.ai_service || "Unknown"} • {insight!.model_used || "Unknown model"}
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
                                                    <div className="text-sm font-semibold text-slate-900">Generated</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {format(new Date(insight!.generated_at), "MMM dd, yyyy 'at' h:mm a")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                                    <Clock size={16} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">Expires</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {format(new Date(insight!.expires_at), "MMM dd, yyyy 'at' h:mm a")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Record ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Record ID
                            </h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {item.id}
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
                        <>View Data & Analysis <ArrowRight size={14} /></>
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
            <span className="text-[13px] font-semibold text-slate-700 max-w-[60%] text-right truncate">{value}</span>
        </div>
    );
}
