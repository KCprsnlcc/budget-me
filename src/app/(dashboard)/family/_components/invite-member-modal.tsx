"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User, Shield, Eye, Info, ArrowRight, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Stepper } from "./stepper";
import { FAMILY_ROLES } from "./constants";
import type { InviteMemberData, ModalStep } from "./types";

const STEPS = ["Details", "Review"];

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSendInvitation?: (form: InviteMemberData) => Promise<{ error: string | null }>;
}

export function InviteMemberModal({ open, onClose, onSendInvitation }: InviteMemberModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(1);
  const [formData, setFormData] = useState<InviteMemberData>({
    email: "",
    role: "member",
    message: "",
  });

  const reset = useCallback(() => {
    setFormData({ email: "", role: "member", message: "" });
    setCurrentStep(1);
    setSubmitError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (currentStep === 1 && formData.email !== "") ||
    currentStep === 2;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = useCallback(async () => {
    if (currentStep >= 2) {
      if (onSendInvitation) {
        setSubmitting(true);
        setSubmitError(null);
        const result = await onSendInvitation(formData);
        setSubmitting(false);
        if (result.error) {
          setSubmitError(result.error);
          return;
        }
      }
      handleClose();
      return;
    }
    setCurrentStep((s) => (s + 1) as ModalStep);
  }, [currentStep, handleClose, onSendInvitation, formData]);

  const handleBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as ModalStep);
  }, [currentStep]);

  const updateFormData = useCallback(
    <K extends keyof InviteMemberData>(key: K, value: InviteMemberData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Invite Member
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Step {currentStep} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper currentStep={currentStep} totalSteps={2} labels={STEPS} />

      {/* Body */}
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* STEP 1: Member Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-txn-in">
            <div>
              <h4 className="text-[17px] font-bold text-gray-900 mb-1">
                Member Details
              </h4>
              <p className="text-[11px] text-gray-500">
                Send an invitation to join your family budget group.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Email Address <span className="text-gray-400">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Role
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(FAMILY_ROLES).map(([key, role], idx) => {
                    const selected = formData.role === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateFormData("role", key as "member" | "admin" | "viewer")}
                        className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                          selected
                            ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                        }`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${
                              selected
                                ? "text-gray-700 border-gray-200"
                                : "text-gray-400 border-gray-100"
                            }`}
                          >
                            {key === "member" && <User size={18} />}
                            {key === "admin" && <Shield size={18} />}
                            {key === "viewer" && <Eye size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{role.title}</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{role.description}</p>
                          </div>
                          {/* Check indicator */}
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

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Message <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  rows={3}
                  placeholder="Personal message for the invitation"
                  value={formData.message}
                  onChange={(e) => updateFormData("message", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-txn-in">
            <div>
              <h4 className="text-[17px] font-bold text-gray-900 mb-1">
                Review Invitation
              </h4>
              <p className="text-[11px] text-gray-500">
                Please review the invitation details before sending.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Email Address</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formData.email}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Role</span>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {FAMILY_ROLES[formData.role as keyof typeof FAMILY_ROLES].title}
                  </span>
                </div>
                {formData.message && (
                  <div className="flex justify-between items-start py-2.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Message</span>
                    <span className="text-[11px] text-gray-500 italic max-w-[180px] text-right">
                      {formData.message}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <Info className="text-gray-600 mt-0.5" size={16} />
              <div className="text-xs text-gray-700">
                <p className="font-medium text-gray-900">Invitation Details</p>
                <p className="mt-1">
                  The invited person will receive an email with instructions to join your family group.
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
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canContinue || submitting}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
        >
          {currentStep === 2 ? (
            submitting ? (<><Loader2 size={14} className="animate-spin" /> Sending...</>) : (<>Send Invitation <Check size={14} /></>)
          ) : (
            <>
              Continue
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
