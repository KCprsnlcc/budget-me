"use client";

import { useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { deleteUserChatSession } from "../_lib/admin-chatbot-service";
import type { AdminChatSession } from "../_lib/types";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { format } from "date-fns";

interface DeleteAdminChatbotModalProps {
    open: boolean;
    onClose: () => void;
    session: AdminChatSession | null;
    onSuccess: () => void;
}

export function DeleteAdminChatbotModal({ open, onClose, session, onSuccess }: DeleteAdminChatbotModalProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!session) return;

        try {
            setLoading(true);
            const { error } = await deleteUserChatSession(session.user_id);

            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Chat session deleted permanently");
            onClose();
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete chat session");
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    const mockUser: SupabaseUser = {
        id: session.user_id,
        email: session.user_email,
        user_metadata: {
            full_name: session.user_name,
            avatar_url: session.user_avatar,
        },
        app_metadata: {},
        created_at: "",
        aud: "authenticated",
    } as SupabaseUser;

    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            {/* Header */}
            <ModalHeader onClose={onClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Delete Chat Session
                </span>
            </ModalHeader>

            {/* Body */}
            <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
                <div className="text-center animate-txn-in">
                    {/* Warning Message */}
                    <h2 className="text-lg font-bold text-slate-900 mb-3">
                        Delete Chat Session Permanently?
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                        This action cannot be undone. All messages in this chat session will be permanently deleted.
                    </p>

                    {/* Session Details */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
                        <div className="p-5 space-y-0 divide-y divide-gray-100">
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">User</span>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={mockUser} size="sm" className="ring-1 ring-white shadow-sm" />
                                    <span className="text-sm font-semibold text-slate-700">{session.user_name || session.user_email}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Total Messages</span>
                                <span className="text-sm font-bold text-slate-900">{session.total_messages}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">User / AI</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {session.user_messages} / {session.assistant_messages}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Last Active</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {format(new Date(session.last_message_at), "MMM dd, yyyy")}
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
                                    All {session.total_messages} messages in this chat session will be permanently deleted and cannot be recovered.
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
