"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, Home, FileText, Globe, Target, Info, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Stepper } from "../../transactions/_components/stepper";
import type { AdminFamily } from "../_lib/types";
import { updateAdminFamily } from "../_lib/admin-family-service";

const STEPS = ["Details", "Review"];

interface EditAdminFamilyModalProps {
    open: boolean;
    onClose: () => void;
    family: AdminFamily | null;
    onSuccess?: () => void;
}

export function EditAdminFamilyModal({
    open,
    onClose,
    family,
    onSuccess,
}: EditAdminFamilyModalProps) {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [familyName, setFamilyName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [maxMembers, setMaxMembers] = useState(10);
    const [allowGoalSharing, setAllowGoalSharing] = useState(true);
    const [status, setStatus] = useState<"active" | "inactive">("active");

    // Populate form when family changes
    useEffect(() => {
        if (family) {
            setFamilyName(family.family_name);
            setDescription(family.description ?? "");
            setIsPublic(family.is_public);
            setMaxMembers(family.max_members);
            setAllowGoalSharing(family.allow_goal_sharing);
            setStatus(family.status);
        }
    }, [family]);

    const reset = useCallback(() => {
        setCurrentStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const handleNext = useCallback(() => {
        if (currentStep < 2) {
            setCurrentStep(2);
        }
    }, [currentStep]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(1);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        if (!family) return;
        if (!familyName.trim()) {
            toast.error("Family name is required");
            return;
        }

        try {
            setLoading(true);
            const { error } = await updateAdminFamily(family.id, {
                family_name: familyName.trim(),
                description: description.trim() || null,
                is_public: isPublic,
                max_members: maxMembers,
                allow_goal_sharing: allowGoalSharing,
                status,
            });

            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Family updated successfully");
            handleClose();
            onSuccess?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update family");
        } finally {
            setLoading(false);
        }
    }, [family, familyName, description, isPublic, maxMembers, allowGoalSharing, status, handleClose, onSuccess]);

    if (!family) return null;

    const VISIBILITY_TYPES = {
        private: {
            title: "Private",
            description: "Only invited members can join this family",
        },
        public: {
            title: "Public",
            description: "Anyone can discover and request to join",
        },
    };

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            {/* Header */}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Edit Family
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                        Step {currentStep} of 2
                    </span>
                </div>
            </ModalHeader>

            {/* Stepper */}
            <Stepper steps={STEPS} currentStep={currentStep} />

            {/* Body */}
            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {/* STEP 1: Details */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-txn-in">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                Family Details
                            </h4>
                            <p className="text-xs text-slate-500">
                                Update your family group information.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Family Name */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Family Name <span className="text-gray-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={familyName}
                                    onChange={(e) => setFamilyName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="Enter family name"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Description <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    rows={3}
                                    placeholder="Brief description of your family"
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Visibility
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(VISIBILITY_TYPES).map(([key, type]) => {
                                        const selected = (key === "public" && isPublic) || (key === "private" && !isPublic);
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setIsPublic(key === "public")}
                                                className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                                                    selected
                                                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                        : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${
                                                            selected
                                                                ? "text-gray-700 border-gray-200"
                                                                : "text-gray-400 border-gray-100"
                                                        }`}
                                                    >
                                                        {key === "private" ? <Home size={18} /> : <FileText size={18} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{type.title}</h3>
                                                        <p className="text-[11px] text-gray-500 leading-relaxed">{type.description}</p>
                                                    </div>
                                                    <div
                                                        className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${
                                                            selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
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

                            {/* Status */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Status
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatus("active")}
                                        className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                                            status === "active"
                                                ? "bg-white border-emerald-500 text-emerald-700"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus("inactive")}
                                        className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                                            status === "inactive"
                                                ? "bg-white border-slate-500 text-slate-700"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>

                            {/* Max Members */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Max Members
                                </label>
                                <input
                                    type="number"
                                    value={maxMembers}
                                    onChange={(e) => setMaxMembers(Math.max(1, parseInt(e.target.value) || 1))}
                                    min={1}
                                    max={50}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                />
                            </div>

                            {/* Toggle Settings */}
                            <div className="space-y-3">
                                <h4 className="text-[11px] font-semibold text-gray-700 uppercase tracking-[0.04em]">Settings</h4>

                                <ToggleRow
                                    icon={Target}
                                    label="Goal Sharing"
                                    description="Members can share and collaborate on goals"
                                    checked={allowGoalSharing}
                                    onChange={setAllowGoalSharing}
                                />
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                <Info className="text-gray-600 mt-0.5" size={16} />
                                <div className="text-xs text-gray-700">
                                    <p className="font-medium text-gray-900">Family Settings</p>
                                    <p className="mt-1">
                                        Private families require invitations. Public families can be discovered by others.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Review */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-txn-in">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                Review Family Changes
                            </h4>
                            <p className="text-xs text-slate-500">
                                Please review your changes before updating.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Family Name</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{familyName}</span>
                                </div>
                                {description && (
                                    <div className="flex justify-between items-start py-2.5">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Description</span>
                                        <span className="text-[11px] text-gray-500 italic max-w-[180px] text-right">
                                            {description}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Visibility</span>
                                    <span className="text-[13px] font-semibold text-gray-700">
                                        {isPublic ? "Public" : "Private"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Status</span>
                                    <span className="text-[13px] font-semibold text-gray-700">
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Max Members</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{maxMembers}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Goal Sharing</span>
                                    <span className="text-[13px] font-semibold text-gray-700">
                                        {allowGoalSharing ? "Enabled" : "Disabled"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                            <Info className="text-gray-600 mt-0.5" size={16} />
                            <div className="text-xs text-gray-700">
                                <p className="font-medium text-gray-900">Update Confirmation</p>
                                <p className="mt-1">
                                    These changes will be applied to your family group immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="flex justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky bottom-0 bg-white z-10 lg:static">
                {currentStep > 1 ? (
                    <button
                        onClick={handleBack}
                        disabled={loading}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={14} className="mr-1.5 sm:mr-2" />
                        Back
                    </button>
                ) : (
                    <div />
                )}
                <button
                    onClick={currentStep === 2 ? handleSubmit : handleNext}
                    disabled={loading}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin mr-1.5 sm:mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            {currentStep === 2 ? "Update Family" : "Continue"}
                            {currentStep < 2 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
                        </>
                    )}
                </button>
            </ModalFooter>
        </Modal>
    );
}

function ToggleRow({
    icon: Icon,
    label,
    description,
    checked,
    onChange,
}: {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-slate-50">
                    <Icon size={16} className="text-gray-600" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{label}</div>
                    <div className="text-[10px] text-gray-400">{description}</div>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    checked ? "bg-emerald-500" : "bg-gray-200"
                }`}
            >
                <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        checked ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                />
            </button>
        </div>
    );
}
