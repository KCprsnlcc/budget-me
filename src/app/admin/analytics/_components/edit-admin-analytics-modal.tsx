"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Loader2,
    Check,
    PenSquare,
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { updateAdminAnalytics } from "../_lib/admin-analytics-service";
import type { AdminAnalyticsReport } from "../_lib/types";

interface EditAdminAnalyticsModalProps {
    open?: boolean; // Keep for compatibility if needed
    isOpen?: boolean; // The new standard
    onClose: () => void;
    onSuccess?: () => void; // Keep for compatibility
    onUpdated?: () => void; // The new standard
    report: AdminAnalyticsReport | null;
}

const REPORT_TYPES = [
    { value: "spending", label: "Spending" },
    { value: "income-expense", label: "Income & Expense" },
    { value: "savings", label: "Savings" },
    { value: "trends", label: "Trends" },
    { value: "goals", label: "Goals" },
    { value: "predictions", label: "Predictions" },
    { value: "financial_intelligence", label: "Financial Intelligence" }
];

const TIMEFRAMES = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
    { value: "all-time", label: "All Time" }
];

type FormData = {
    report_type: string;
    timeframe: string;
    generated_at: string;
    data_points: string;
    confidence_level: string;
    accuracy_score: string;
    summary: string;
};

export function EditAdminAnalyticsModal({ open, isOpen, onClose, onSuccess, onUpdated, report }: EditAdminAnalyticsModalProps) {
    const [loading, setLoading] = useState(false);
    const actualOpen = isOpen !== undefined ? isOpen : (open || false);

    const [formData, setFormData] = useState<FormData>({
        report_type: "",
        timeframe: "",
        generated_at: "",
        data_points: "",
        confidence_level: "",
        accuracy_score: "",
        summary: "",
    });

    useEffect(() => {
        if (actualOpen && report) {
            setFormData({
                report_type: report.report_type || "spending",
                timeframe: report.timeframe || "monthly",
                generated_at: report.generated_at ? report.generated_at.split('T')[0] : new Date().toISOString().split("T")[0],
                data_points: report.data_points?.toString() || "",
                confidence_level: report.confidence_level?.toString() || "",
                accuracy_score: report.accuracy_score?.toString() || "",
                summary: report.summary || "",
            });
        }
    }, [actualOpen, report]);

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async () => {
        if (!report) return;

        if (!formData.report_type || !formData.timeframe || !formData.generated_at) {
            toast.error("Please fill in required fields");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                report_type: formData.report_type as AdminAnalyticsReport["report_type"],
                timeframe: formData.timeframe as AdminAnalyticsReport["timeframe"],
                generated_at: formData.generated_at,
                data_points: formData.data_points ? parseInt(formData.data_points) : undefined,
                confidence_level: formData.confidence_level ? parseFloat(formData.confidence_level) : undefined,
                accuracy_score: formData.accuracy_score ? parseFloat(formData.accuracy_score) : undefined,
                summary: formData.summary || undefined,
            } as Partial<AdminAnalyticsReport>;

            const result = await updateAdminAnalytics(report.id, payload);

            if (result.error) throw new Error(result.error);

            toast.success("Analytics report updated successfully");
            handleClose();
            if (onSuccess) onSuccess();
            if (onUpdated) onUpdated();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update analytics report");
        } finally {
            setLoading(false);
        }
    };

    const updateField = useCallback(
        <K extends keyof FormData>(key: K, value: FormData[K]) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    if (!report) return null;

    return (
        <Modal open={actualOpen} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Edit AI Report
                    </span>
                </div>
            </ModalHeader>

            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="mb-5">
                        <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                            <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                <PenSquare size={14} />
                            </div>
                            Report Details
                        </h2>
                    </div>
                    <div className="space-y-5">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Report Type <span className="text-gray-400">*</span>
                                </label>
                                <select
                                    value={formData.report_type}
                                    onChange={(e) => updateField("report_type", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                >
                                    {REPORT_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Timeframe <span className="text-gray-400">*</span>
                                </label>
                                <select
                                    value={formData.timeframe}
                                    onChange={(e) => updateField("timeframe", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                >
                                    {TIMEFRAMES.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Data Points
                                </label>
                                <input
                                    type="number"
                                    value={formData.data_points}
                                    onChange={(e) => updateField("data_points", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                    placeholder="e.g. 1500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Date <span className="text-gray-400">*</span>
                                </label>
                                <DateSelector
                                    value={formData.generated_at}
                                    onChange={(value) => updateField("generated_at", value)}
                                    placeholder="Generation date"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Confidence (0 - 1)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.confidence_level}
                                    onChange={(e) => updateField("confidence_level", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                    placeholder="e.g. 0.95"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Accuracy Score (0 - 100)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    value={formData.accuracy_score}
                                    onChange={(e) => updateField("accuracy_score", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                    placeholder="e.g. 98"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                Summary
                            </label>
                            <textarea
                                rows={3}
                                value={formData.summary}
                                onChange={(e) => updateField("summary", e.target.value)}
                                className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500"
                                placeholder="Provide a brief summary of the report..."
                            />
                        </div>

                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="px-5 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={handleClose}
                    className="text-xs font-semibold px-4 h-9 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-semibold px-6 h-9 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            Save Changes
                            <Check size={14} strokeWidth={2.5} />
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
