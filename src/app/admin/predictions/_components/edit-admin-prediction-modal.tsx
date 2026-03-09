"use client";

import { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { toast } from "sonner";
import {
    Loader2,
    ArrowLeft,
    ArrowRight,
    Check,
    PenSquare,
    ClipboardCheck,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import type { AdminPredictionReport, AdminAIInsight } from "../_lib/types";
import { updateAdminReport, updateAdminInsightValidation } from "../_lib/admin-prediction-service";

interface EditAdminPredictionModalProps {
    open: boolean;
    onClose: () => void;
    report: AdminPredictionReport | null;
    insight: AdminAIInsight | null;
    dataSource: "reports" | "insights";
    onSuccess: () => void;
}

const STEPS_REPORT = ["Details", "Review"];
const STEPS_INSIGHT = ["Validation", "Review"];

const REPORT_TYPES = [
    { value: "spending", label: "Spending" },
    { value: "income-expense", label: "Income vs Expense" },
    { value: "savings", label: "Savings" },
    { value: "trends", label: "Trends" },
    { value: "goals", label: "Goals" },
    { value: "predictions", label: "Predictions" },
];

const TIMEFRAMES = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "quarter", label: "Quarter" },
    { value: "year", label: "Year" },
];

export function EditAdminPredictionModal({
    open,
    onClose,
    report,
    insight,
    dataSource,
    onSuccess,
}: EditAdminPredictionModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Report form state
    const [reportType, setReportType] = useState("");
    const [timeframe, setTimeframe] = useState("");
    const [accuracyScore, setAccuracyScore] = useState("");
    const [modelVersion, setModelVersion] = useState("");

    // Insight form state
    const [adminValidated, setAdminValidated] = useState(false);
    const [validationNotes, setValidationNotes] = useState("");

    // Initialize form when modal opens
    const initForm = useCallback(() => {
        if (dataSource === "reports" && report) {
            setReportType(report.report_type || "");
            setTimeframe(report.timeframe || "");
            setAccuracyScore(report.accuracy_score !== null ? String(report.accuracy_score) : "");
            setModelVersion(report.model_version || "");
        } else if (dataSource === "insights" && insight) {
            setAdminValidated(insight.admin_validated);
            setValidationNotes(insight.validation_notes || "");
        }
        setCurrentStep(1);
    }, [dataSource, report, insight]);

    // Reset on open
    useState(() => {
        if (open) initForm();
    });

    // Re-init on report/insight change
    useState(() => {
        if (open && (report || insight)) initForm();
    });

    const steps = dataSource === "reports" ? STEPS_REPORT : STEPS_INSIGHT;

    const handleClose = () => {
        setCurrentStep(1);
        onClose();
    };

    const handleNext = () => {
        if (currentStep === 1 && dataSource === "reports") {
            if (!reportType) {
                toast.error("Please select a report type");
                return;
            }
            if (!timeframe) {
                toast.error("Please select a timeframe");
                return;
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (dataSource === "reports" && report) {
                const { error } = await updateAdminReport(report.id, {
                    report_type: reportType,
                    timeframe,
                    accuracy_score: accuracyScore ? Number(accuracyScore) : null,
                    model_version: modelVersion,
                });

                if (error) throw new Error(error);
                toast.success("Prediction report updated successfully");
            } else if (dataSource === "insights" && insight) {
                const { error } = await updateAdminInsightValidation(
                    insight.id,
                    adminValidated,
                    validationNotes || null
                );

                if (error) throw new Error(error);
                toast.success("AI insight validation updated successfully");
            }

            handleClose();
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update");
        } finally {
            setLoading(false);
        }
    };

    if (dataSource === "reports" && !report) return null;
    if (dataSource === "insights" && !insight) return null;

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Edit {dataSource === "reports" ? "Report" : "Insight Validation"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {currentStep} of {steps.length}
                    </span>
                </div>
            </ModalHeader>

            <Stepper steps={steps} currentStep={currentStep} />

            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {/* Report Edit - Step 1: Details */}
                {dataSource === "reports" && currentStep === 1 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <PenSquare size={14} />
                                </div>
                                Report Details
                            </h2>
                        </div>
                        <div className="space-y-5">
                            {/* Report Type */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Report Type <span className="text-gray-400">*</span>
                                </label>
                                <SearchableDropdown
                                    value={reportType}
                                    onChange={(value) => setReportType(value)}
                                    options={REPORT_TYPES}
                                    placeholder="Select report type..."
                                    className="w-full"
                                    allowEmpty={false}
                                />
                            </div>

                            {/* Timeframe */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Timeframe <span className="text-gray-400">*</span>
                                </label>
                                <SearchableDropdown
                                    value={timeframe}
                                    onChange={(value) => setTimeframe(value)}
                                    options={TIMEFRAMES}
                                    placeholder="Select timeframe..."
                                    className="w-full"
                                    allowEmpty={false}
                                />
                            </div>

                            {/* Accuracy Score */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Accuracy Score
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={accuracyScore}
                                        onChange={(e) => setAccuracyScore(e.target.value)}
                                        className="w-full px-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                        placeholder="0-100"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                </div>
                            </div>

                            {/* Model Version */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Model Version
                                </label>
                                <input
                                    type="text"
                                    value={modelVersion}
                                    onChange={(e) => setModelVersion(e.target.value)}
                                    className="w-full px-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="e.g., Prophet v1.1"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Insight Edit - Step 1: Validation */}
                {dataSource === "insights" && currentStep === 1 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <Shield size={14} />
                                </div>
                                Admin Validation
                            </h2>
                            <p className="text-[11px] text-gray-500">
                                Validate or flag this AI insight for quality control.
                            </p>
                        </div>
                        <div className="space-y-5">
                            {/* Admin Validated */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-3 uppercase tracking-[0.04em]">
                                    Validation Status
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: true, label: "Validated", desc: "This insight has been reviewed and approved.", icon: Check },
                                        { value: false, label: "Not Validated", desc: "This insight has not been reviewed yet.", icon: AlertTriangle },
                                    ].map((option) => {
                                        const Icon = option.icon;
                                        const selected = adminValidated === option.value;
                                        return (
                                            <button
                                                key={String(option.value)}
                                                type="button"
                                                onClick={() => setAdminValidated(option.value)}
                                                className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
                                                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                        : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${selected
                                                                ? "text-gray-700 border-gray-200"
                                                                : "text-gray-400 border-gray-100"
                                                            }`}
                                                    >
                                                        <Icon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{option.label}</h3>
                                                        <p className="text-[11px] text-gray-500 leading-relaxed">{option.desc}</p>
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
                                </div>
                            </div>

                            {/* Validation Notes */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Validation Notes
                                </label>
                                <textarea
                                    rows={4}
                                    value={validationNotes}
                                    onChange={(e) => setValidationNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06] resize-none"
                                    placeholder="Add notes about this insight's quality, accuracy, or any issues..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Review */}
                {currentStep === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <ClipboardCheck size={14} />
                                </div>
                                Review Changes
                            </h2>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5 space-y-0 divide-y divide-slate-100">
                                <ReviewRow label="User" value={report?.user_email || insight?.user_email || "Unknown"} />
                                {dataSource === "reports" ? (
                                    <>
                                        <ReviewRow label="Report Type" value={REPORT_TYPES.find(r => r.value === reportType)?.label || reportType} />
                                        <ReviewRow label="Timeframe" value={TIMEFRAMES.find(t => t.value === timeframe)?.label || timeframe} />
                                        <ReviewRow label="Accuracy" value={accuracyScore ? `${accuracyScore}%` : "Not scored"} />
                                        <ReviewRow label="Model" value={modelVersion || "—"} />
                                    </>
                                ) : (
                                    <>
                                        <ReviewRow label="Status" value={adminValidated ? "Validated ✓" : "Not Validated"} />
                                        <ReviewRow label="Notes" value={validationNotes || "No notes"} italic={!validationNotes} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="px-6 py-4">
                {currentStep > 1 ? (
                    <Button variant="outline" size="sm" onClick={handleBack} disabled={loading}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                )}
                {currentStep < steps.length ? (
                    <Button size="sm" onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600">
                        Continue <ArrowRight size={14} />
                    </Button>
                ) : (
                    <Button size="sm" onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        ) : (
                            <><Check size={14} /> Save Changes</>
                        )}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

function ReviewRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
            <span className={`text-[13px] font-semibold text-slate-700 max-w-[60%] text-right truncate ${italic ? "italic text-slate-400" : ""}`}>
                {value}
            </span>
        </div>
    );
}
