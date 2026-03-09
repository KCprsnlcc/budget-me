"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { deleteAdminAnalytics } from "../_lib/admin-analytics-service";
import type { AdminAnalyticsReport } from "../_lib/types";

interface DeleteAdminAnalyticsModalProps {
    open?: boolean; // Keep for compatibility if needed
    isOpen?: boolean; // The new standard
    onClose: () => void;
    onSuccess?: () => void; // Keep for compatibility
    onDeleted?: () => void; // The new standard
    report: AdminAnalyticsReport | null;
}

export function DeleteAdminAnalyticsModal({ open, isOpen, onClose, onSuccess, onDeleted, report }: DeleteAdminAnalyticsModalProps) {
    const [loading, setLoading] = useState(false);
    const actualOpen = isOpen !== undefined ? isOpen : (open || false);

    const handleDelete = async () => {
        if (!report) return;

        try {
            setLoading(true);
            const { error } = await deleteAdminAnalytics(report.id);

            if (error) {
                throw new Error(error);
            }

            toast.success("Analytics report deleted successfully");
            onClose();
            if (onSuccess) onSuccess();
            if (onDeleted) onDeleted();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete analytics report");
        } finally {
            setLoading(false);
        }
    };

    if (!report) return null;

    return (
        <Modal open={actualOpen} onClose={onClose} className="max-w-md">
            <ModalHeader onClose={onClose} className="px-5 py-4 bg-red-50/50 border-b border-red-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200">
                        <Trash2 size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-red-900 tracking-wide">
                        Delete Analytics Report
                    </span>
                </div>
            </ModalHeader>

            <ModalBody className="px-5 py-6 bg-white">
                <div className="flex flex-col gap-4">
                    <p className="text-[13px] text-gray-600 leading-relaxed border-l-4 border-red-500 pl-4 py-1 bg-red-50/30 rounded-r-lg">
                        Are you sure you want to delete this analytics report? This action cannot be undone and the report data will be permanently removed.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Report Details</h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100/60">
                                <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                                    Type
                                </span>
                                <span className="text-[13px] font-bold text-gray-900 capitalize">
                                    {report.report_type.replace(/_/g, " ")}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-gray-100/60">
                                <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                                    Timeframe
                                </span>
                                <span className="text-[13px] font-bold text-gray-900 capitalize">
                                    {report.timeframe}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                                    Date
                                </span>
                                <span className="text-[13px] font-bold text-gray-900">
                                    {new Date(report.generated_at || "").toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center gap-3">
                            {report.user_avatar ? (
                                <img src={report.user_avatar} alt="" className="w-6 h-6 rounded-full border border-gray-200" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold ring-1 ring-white">
                                    {(report.user_name || report.user_email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-[12px] font-bold text-gray-900 truncate">
                                    {report.user_name || "Unknown User"}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">{report.user_email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="px-5 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="text-xs font-semibold px-4 h-9 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white bg-white shadow-sm"
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-semibold px-5 h-9 shadow-sm shadow-red-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        <>
                            Confirm Deletion
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
