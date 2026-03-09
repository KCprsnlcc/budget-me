"use client";

import { useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Users, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import type { AdminFamily } from "../_lib/types";
import { deleteAdminFamily } from "../_lib/admin-family-service";

interface DeleteAdminFamilyModalProps {
    open: boolean;
    onClose: () => void;
    family: AdminFamily | null;
    onSuccess?: () => void;
}

export function DeleteAdminFamilyModal({
    open,
    onClose,
    family,
    onSuccess,
}: DeleteAdminFamilyModalProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!family) return;

        try {
            setLoading(true);
            const { error } = await deleteAdminFamily(family.id);

            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Family deleted permanently");
            onClose();
            onSuccess?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete family");
        } finally {
            setLoading(false);
        }
    };

    if (!family) return null;

    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            {/* Header */}
            <ModalHeader onClose={onClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Delete Family
                </span>
            </ModalHeader>

            {/* Body */}
            <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
                <div className="text-center animate-txn-in">
                    {/* Warning Message */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3">
                        Delete Family Permanently?
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                        This action cannot be undone. The family, all members, invitations, join requests, and activity logs will be permanently deleted.
                    </p>

                    {/* Family Details */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
                        <div className="p-5 space-y-0 divide-y divide-gray-100">
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Name</span>
                                <span className="text-sm font-bold text-slate-900">{family.family_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Creator</span>
                                <span className="text-sm font-semibold text-slate-700">{family.creator_email ?? "Unknown"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Members</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {family.member_count ?? 0} member{(family.member_count ?? 0) !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Visibility</span>
                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                    {family.is_public ? <Globe size={12} /> : <Lock size={12} />}
                                    {family.is_public ? "Public" : "Private"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Status</span>
                                <span className={`text-sm font-semibold ${family.status === "active" ? "text-emerald-600" : "text-slate-500"}`}>
                                    {family.status.charAt(0).toUpperCase() + family.status.slice(1)}
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
                                    All family data including members, invitations, join requests, and activity logs will be permanently deleted. Goals linked to this family will be unlinked but preserved.
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
