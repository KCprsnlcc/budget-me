"use client";

import { useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { AdminPredictionReport, AdminAIInsight } from "../_lib/types";
import { deleteAdminReport, deleteAdminInsight } from "../_lib/admin-prediction-service";

interface DeleteAdminPredictionModalProps {
    open: boolean;
    onClose: () => void;
    report: AdminPredictionReport | null;
    insight: AdminAIInsight | null;
    dataSource: "reports" | "insights";
    onSuccess?: () => void;
}

export function DeleteAdminPredictionModal({
    open,
    onClose,
    report,
    insight,
    dataSource,
    onSuccess,
}: DeleteAdminPredictionModalProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const item = dataSource === "reports" ? report : insight;
        if (!item) return;

        try {
            setLoading(true);
            const { error } = dataSource === "reports"
                ? await deleteAdminReport(item.id)
                : await deleteAdminInsight(item.id);

            if (error) {
                toast.error(error);
                return;
            }

            toast.success(`${dataSource === "reports" ? "Prediction report" : "AI insight"} deleted permanently`);
            onClose();
            onSuccess?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete");
        } finally {
            setLoading(false);
        }
    };

    const item = dataSource === "reports" ? report : insight;
    if (!item) return null;

    const itemType = dataSource === "reports" ? "Prediction Report" : "AI Insight";
    const createdAt = dataSource === "reports" ? report!.created_at : insight!.generated_at;

    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            {/* Header */}
            <ModalHeader onClose={onClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Delete {itemType}
                </span>
            </ModalHeader>

            {/* Body */}
            <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
                <div className="text-center animate-txn-in">
                    {/* Warning Message */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3">
                        Delete {itemType} Permanently?
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                        This action cannot be undone. The {itemType.toLowerCase()} will be permanently deleted from the user's account.
                    </p>

                    {/* Details */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
                        <div className="p-5 space-y-0 divide-y divide-gray-100">
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Type</span>
                                <span className="text-sm font-bold text-slate-900">
                                    {dataSource === "reports" ? report!.report_type : (insight!.ai_service || "AI Insight")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">User</span>
                                <span className="text-sm font-semibold text-slate-700">{item.user_email ?? "Unknown"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Model</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {dataSource === "reports" ? (report!.model_version || "—") : (insight!.model_used || "—")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Date</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Final Warning */}
                    <div className="p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 mx-auto max-w-sm mt-6">
                        <div className="flex gap-2.5 items-start">
                            <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                            <div>
                                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">
                                    Irreversible Action
                                </h4>
                                <p className="text-[11px] leading-relaxed">
                                    This {itemType.toLowerCase()} will be permanently deleted and cannot be recovered. Associated AI insights and analysis data will be lost.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="px-6 py-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (<><Loader2 size={14} className="animate-spin" /> Processing...</>) : "Delete Permanently"}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
