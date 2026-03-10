"use client";

import { useState, useCallback, useEffect } from "react";
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
    Users,
    Globe,
    Lock,
    Clock,
    Wallet,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminFamily, AdminFamilyMember } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { fetchFamilyMembers } from "../_lib/admin-family-service";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminFamilyModalProps {
    open: boolean;
    onClose: () => void;
    family: AdminFamily | null;
}

export function ViewAdminFamilyModal({
    open,
    onClose,
    family,
}: ViewAdminFamilyModalProps) {
    const [step, setStep] = useState(1);
    const [members, setMembers] = useState<AdminFamilyMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);

    const reset = useCallback(() => {
        setStep(1);
        setMembers([]);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    // Fetch members when stepping to step 2
    useEffect(() => {
        if (step === 2 && family && members.length === 0) {
            setMembersLoading(true);
            fetchFamilyMembers(family.id).then((result) => {
                if (!result.error) {
                    setMembers(result.data);
                }
                setMembersLoading(false);
            });
        }
    }, [step, family, members.length]);

    const createMockUser = (data: { id: string; email?: string; name?: string; avatar?: string }): SupabaseUser => {
        return {
            id: data.id,
            email: data.email || "",
            user_metadata: {
                full_name: data.name,
                avatar_url: data.avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: "",
        } as SupabaseUser;
    };

    if (!family) return null;

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[540px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Family Details
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
                        {/* Family Header */}
                        <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                            <div className="flex justify-center mb-3">
                                <UserAvatar
                                    user={createMockUser({
                                        id: family.created_by,
                                        email: family.creator_email,
                                        name: family.creator_name,
                                        avatar: family.creator_avatar,
                                    })}
                                    size="xl"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{family.family_name}</h3>
                            <p className="text-sm text-slate-500 mb-3">
                                {family.description || "No description"}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-xs font-medium text-slate-600">
                                    {family.status.charAt(0).toUpperCase() + family.status.slice(1)}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                                    {family.is_public ? <Globe size={12} /> : <Lock size={12} />}
                                    {family.is_public ? "Public" : "Private"}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-medium text-slate-600">
                                    {family.member_count ?? 0} / {family.max_members} members
                                </span>
                            </div>
                        </div>

                        {/* Family Information */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Family Information</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow label="Name" value={family.family_name} icon={Users} />
                                    <DetailRow label="Currency" value={family.currency_pref} icon={Wallet} />
                                    <DetailRow
                                        label="Created"
                                        value={format(new Date(family.created_at), "MMM dd, yyyy")}
                                        icon={Calendar}
                                    />
                                    <DetailRow
                                        label="Last Updated"
                                        value={format(new Date(family.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                                        icon={Clock}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Creator Info */}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Created By</h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 flex items-center gap-3">
                                    <UserAvatar
                                        user={createMockUser({
                                            id: family.created_by,
                                            email: family.creator_email,
                                            name: family.creator_name,
                                            avatar: family.creator_avatar,
                                        })}
                                        size="lg"
                                        className="ring-2 ring-white shadow-sm"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {family.creator_name || "No Name"}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {family.creator_email || "Unknown"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Analysis */}
                {step === 2 && (
                    <div className="space-y-6 animate-txn-in">
                        {/* Family Member Logs */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">Family Member Logs</h3>
                            <p className="text-xs text-slate-500 mb-4">
                                {members.length} log{members.length !== 1 ? "s" : ""} &bull; {members.filter(m => m.status === "active").length} active member{members.filter(m => m.status === "active").length !== 1 ? "s" : ""}
                            </p>

                            {membersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={20} className="animate-spin text-slate-400" />
                                    <span className="text-sm text-slate-500 ml-2">Loading members...</span>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-12 bg-[#F9FAFB]/50 rounded-xl border border-slate-100">
                                    <Users size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No members found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <UserAvatar
                                                    user={createMockUser({
                                                        id: member.user_id,
                                                        email: member.user_email,
                                                        name: member.user_name,
                                                        avatar: member.user_avatar,
                                                    })}
                                                    size="md"
                                                    className="ring-1 ring-slate-100"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {member.user_name || member.user_email || "Unknown"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 truncate">
                                                        {member.user_email || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[10px] font-medium text-slate-600 capitalize">
                                                    {member.role}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[10px] font-medium text-slate-600 capitalize">
                                                    {member.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Family Metadata */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">Family Metadata</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Globe size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Visibility</div>
                                            <div className="text-[10px] text-slate-400">
                                                {family.is_public ? "Anyone can discover and request to join" : "Only invited members can join"}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">
                                        {family.is_public ? "Public" : "Private"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Users size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Max Members</div>
                                            <div className="text-[10px] text-slate-400">Maximum number of members allowed</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">{family.max_members}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                                            <Clock size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Created</div>
                                            <div className="text-[10px] text-slate-400">
                                                {format(new Date(family.created_at), "MMM dd, yyyy 'at' h:mm a")}
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
                                                {format(new Date(family.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Family ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">Family ID</h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {family.id}
                                </p>
                            </div>
                        </div>

                        {/* Creator ID */}
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-3">Creator ID</h3>
                            <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                                    {family.created_by}
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
            <span className="text-[13px] font-semibold text-slate-700">{value}</span>
        </div>
    );
}
