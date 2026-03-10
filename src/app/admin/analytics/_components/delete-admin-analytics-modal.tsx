"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import type { UserAnalyticsSummary } from "../_lib/types";
import { createClient } from "@/lib/supabase/client";

interface DeleteAdminAnalyticsModalProps {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onDeleted?: () => void;
    userSummary: UserAnalyticsSummary | null;
}

export function DeleteAdminAnalyticsModal({ open, isOpen, onClose, onSuccess, onDeleted, userSummary }: DeleteAdminAnalyticsModalProps) {
    const [loading, setLoading] = useState(false);
    const actualOpen = isOpen !== undefined ? isOpen : (open || false);
    const supabase = createClient();

    const handleDelete = async () => {
        if (!userSummary) return;

        try {
            setLoading(true);
            
            // Delete all reports for this user
            const { error } = await supabase
                .from("ai_reports")
                .delete()
                .eq("user_id", userSummary.user_id);

            if (error) {
                throw new Error(error.message);
            }

            toast.success(`All analytics reports for ${userSummary.user_email} deleted successfully`);
            onClose();
            if (onSuccess) onSuccess();
            if (onDeleted) onDeleted();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete analytics reports");
        } finally {
            setLoading(false);
        }
    };

    if (!userSummary) return null;

    return (
        <Modal open={actualOpen} onClose={onClose} className="max-w-md">
            <ModalHeader onClose={onClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Delete User Analytics
                </span>
            </ModalHeader>

            <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
                <div className="text-center animate-txn-in">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Delete User Analytics?</h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                        Are you sure you want to delete all analytics reports for{" "}
                        <span className="font-semibold text-slate-700">{userSummary.user_email}</span>?
                    </p>

                    {/* User Details */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
                        <div className="p-5 space-y-0 divide-y divide-slate-100">
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Total Reports</span>
                                <span className="text-sm font-bold text-slate-900">{userSummary.total_reports}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Transactions</span>
                                <span className="text-sm font-semibold text-slate-700">{userSummary.total_transactions}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Budgets</span>
                                <span className="text-sm font-semibold text-slate-700">{userSummary.active_budgets}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Goals</span>
                                <span className="text-sm font-semibold text-slate-700">{userSummary.active_goals}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Last Updated</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {new Date(userSummary.last_updated).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric"
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning Notice */}
                    <div className="p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 mx-auto max-w-sm mt-6">
                        <div className="flex gap-2.5 items-start">
                            <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                            <div>
                                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Irreversible Action</h4>
                                <p className="text-[11px] leading-relaxed">
                                    All {userSummary.total_reports} analytics report{userSummary.total_reports !== 1 ? 's' : ''} for this user will be permanently deleted and cannot be recovered.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="px-6 py-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        "Delete Analytics"
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
