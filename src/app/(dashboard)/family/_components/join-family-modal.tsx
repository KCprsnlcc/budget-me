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
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Join Family
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                        Step {currentStep} of 2
                    </span>
                </div>
            </ModalHeader>

            <Stepper currentStep={currentStep} totalSteps={2} labels={STEPS} />

            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
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

                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                <Info className="text-gray-600 mt-0.5" size={16} />
                                <div className="text-xs text-gray-700">
                                    <p className="font-medium text-gray-900">What happens next?</p>
                                    <p className="mt-1">
                                        The family owner will be notified of your request. You'll be added to the family once they approve it.
                                    </p>
                                </div>
                            </div>

                            {submitError && (
                                <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
                                    <div>
                                        <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                                        <p className="text-[11px] leading-relaxed">{submitError}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="flex justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky bottom-0 bg-white z-10 lg:static">
                {currentStep > 1 ? (
                    <button
                        onClick={handleBack}
                        disabled={submitting}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={14} className="mr-1.5 sm:mr-2" />
                        Back
                    </button>
                ) : (
                    <div />
                )}
                <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                        </>
                    ) : (
                        <>
                            {currentStep === 2 ? "Send Request" : "Continue"}
                            {currentStep < 2 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
                        </>
                    )}
                </button>
            </ModalFooter>
        </Modal>
    );
}
