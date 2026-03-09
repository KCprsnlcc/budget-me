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
    Bot,
    MessageSquare,
    Clock,
    Cpu,
    FileText,
    Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "../../transactions/_components/stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminChatMessage } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminChatbotModalProps {
    open: boolean;
    onClose: () => void;
    message: AdminChatMessage | null;
}

export function ViewAdminChatbotModal({
    open,
    onClose,
    message,
}: ViewAdminChatbotModalProps) {
    const [step, setStep] = useState(1);

    const reset = useCallback(() => {
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const createMockUser = (msg: AdminChatMessage): SupabaseUser => {
        return {
            id: msg.user_id,
            email: msg.user_email || "",
            user_metadata: {
                full_name: msg.user_name,
                avatar_url: msg.user_avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: msg.created_at,
        } as SupabaseUser;
    };

    if (!message) return null;

    const isAssistant = message.role === "assistant";
    const truncatedContent = message.content.length > 200
        ? message.content.slice(0, 200) + "..."
        : message.content;

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Message Details
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
                        {/* Message Header */}
                        <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                            <div className="flex justify-center mb-3">
                                {isAssistant ? (
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                                        <Bot size={28} className="text-emerald-500" />
                                    </div>
                                ) : (
                                    <UserAvatar
                                        user={createMockUser(message)}
                                        size="xl"
                                        className="ring-2 ring-white shadow-sm"
                                    />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {isAssistant ? "BudgetSense AI" : message.user_name || "Unknown User"}
                            </h3>
                            <p className="text-sm text-slate-500 mb-3">
                                {isAssistant ? "AI Assistant" : message.user_email || "Unknown"}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isAssistant
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}>
                                    {isAssistant ? <Bot size={12} /> : <User size={12} />}
                                    {isAssistant ? "Assistant" : "User"}
                                </span>
                                {message.model && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                            <Cpu size={12} />
                                            {message.model}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Message Content */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">
                                Message Content
                            </h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5">
                                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Message Information */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Message Information</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow
                                        label="Date"
                                        value={format(new Date(message.created_at), "MMM dd, yyyy")}
                                        icon={Calendar}
                                    />
                                    <DetailRow
                                        label="Time"
                                        value={format(new Date(message.created_at), "h:mm a")}
                                        icon={Clock}
                                    />
                                    <DetailRow
                                        label="Role"
                                        value={isAssistant ? "Assistant" : "User"}
                                        icon={isAssistant ? Bot : User}
                                    />
                                    {message.model && (
                                        <DetailRow
                                            label="Model"
                                            value={message.model}
                                            icon={Cpu}
                                        />
                                    )}
                                    {message.attachment && (
                                        <DetailRow
                                            label="Attachment"
                                            value={message.attachment.name}
                                            icon={Paperclip}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
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
                                        value={message.user_email || "Unknown"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="Name"
                                        value={message.user_name || "—"}
                                        icon={User}
                                    />
                                    <DetailRow
                                        label="User ID"
                                        value={message.user_id}
                                        icon={User}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message Metadata */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Message Metadata
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Clock size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Created</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(message.created_at), "MMM dd, yyyy 'at' h:mm a")}
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
                                            <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(message.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <MessageSquare size={16} className={isAssistant ? "text-emerald-600" : "text-blue-600"} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Message Role</div>
                                            <div className="text-[10px] text-slate-400">
                                                {isAssistant ? "AI assistant response" : "User message"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {isAssistant ? "Assistant" : "User"}
                                    </span>
                                </div>

                                {message.suggestions && message.suggestions.length > 0 && (
                                    <div className="p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                                <FileText size={16} className="text-slate-600" />
                                            </div>
                                            <div className="text-sm font-semibold text-slate-900">Suggestions</div>
                                        </div>
                                        <div className="ml-11 space-y-1">
                                            {message.suggestions.map((s, i) => (
                                                <p key={i} className="text-[11px] text-slate-500">• {s}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                                Message ID
                            </h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {message.id}
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
            <span className="text-[13px] font-semibold text-slate-700 max-w-[60%] truncate text-right">{value}</span>
        </div>
    );
}
