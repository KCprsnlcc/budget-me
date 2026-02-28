"use client";

import React, { useState, useCallback } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, MessageSquare, Info, ArrowRight, ArrowLeft, Check, Loader2, AlertTriangle } from "lucide-react";
import { Stepper } from "./stepper";
import type { PublicFamily } from "./types";

const STEPS = ["Request", "Review"];

interface JoinFamilyModalProps {
    open: boolean;
    onClose: () => void;
    family: PublicFamily | null;
    onSendRequest: (familyId: string, message: string) => Promise<{ error: string | null }>;
}

export function JoinFamilyModal({ open, onClose, family, onSendRequest }: JoinFamilyModalProps) {
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setMessage("");
        setCurrentStep(1);
        setSubmitError(null);
    }, []);

    const handleClose = useCallback(() => {
        if (submitting) return;
        reset();
        onClose();
    }, [reset, onClose, submitting]);

    const handleNext = useCallback(async () => {
        if (currentStep === 2) {
            if (family && onSendRequest) {
                setSubmitting(true);
                setSubmitError(null);
                const result = await onSendRequest(family.id, message);
                setSubmitting(false);
                if (result.error) {
                    setSubmitError(result.error);
                    return;
                }
            }
            handleClose();
            return;
        }
        setCurrentStep(2);
    }, [currentStep, handleClose, onSendRequest, family, message]);

    const handleBack = useCallback(() => {
        if (currentStep <= 1) return;
        setCurrentStep(1);
    }, [currentStep]);

    if (!family) return null;

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[500px]">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Join Family
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {currentStep} of 2
                    </span>
                </div>
            </ModalHeader>

            <Stepper currentStep={currentStep} totalSteps={2} labels={STEPS} />

            <ModalBody className="px-5 py-5">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                Request to Join {family.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                                Send a request to the family owner to join this group.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Card className="p-4 bg-slate-50 border-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{family.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{family.description || "No description provided."}</div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{family.memberCount} Members</span>
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Created by {family.createdBy}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                                    <MessageSquare size={14} className="text-slate-400" />
                                    Introduction Message
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none min-h-[100px]"
                                    placeholder="Hi! I'd like to join your family group to help manage our shared expenses..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    Write a short message to introduce yourself to the family owner.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                Review Your Request
                            </h4>
                            <p className="text-xs text-slate-500">
                                Please double check your request details before sending.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Card className="p-4 bg-slate-50 border-slate-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-medium text-slate-600">Joining Family</span>
                                        <span className="text-sm font-semibold text-slate-900">{family.name}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium text-slate-600">Your Message</span>
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 italic">
                                            {message || "No message included."}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Info className="text-blue-600 mt-0.5" size={16} />
                                <div className="text-xs text-blue-800">
                                    <p className="font-medium">What happens next?</p>
                                    <p className="mt-1">
                                        The family owner will be notified of your request. You'll be added to the family once they approve it.
                                    </p>
                                </div>
                            </div>

                            {submitError && (
                                <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                                    <div>
                                        <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                                        <p className="text-[11px] leading-relaxed opacity-85">{submitError}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1 || submitting}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={submitting}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                    >
                        {submitting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : currentStep === 2 ? (
                            <>
                                <Check size={16} />
                                Send Request
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight size={16} />
                            </>
                        )}
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}
