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
import { Mail, User, Shield, Eye, Info, ArrowRight, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Stepper } from "./stepper";
import { FAMILY_ROLES, MODAL_STEPS } from "./constants";
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
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Invite Member
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {currentStep} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper currentStep={currentStep} totalSteps={2} labels={STEPS} />

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Member Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Member Details
              </h4>
              <p className="text-xs text-slate-500">
                Send an invitation to join your family budget group.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Role
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(FAMILY_ROLES).map(([key, role]) => (
                    <button
                      key={key}
                      onClick={() => updateFormData("role", key as "member" | "admin" | "viewer")}
                      className={`p-3 rounded-lg border transition-all ${formData.role === key
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.role === key
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                          }`}>
                          {key === "member" && <User size={16} />}
                          {key === "admin" && <Shield size={16} />}
                          {key === "viewer" && <Eye size={16} />}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">{role.title}</div>
                          <div className="text-xs text-slate-500">{role.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
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
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Review Invitation
              </h4>
              <p className="text-xs text-slate-500">
                Please review the invitation details before sending.
              </p>
            </div>

            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-slate-600">Email Address</span>
                  <span className="text-sm font-medium text-slate-900">{formData.email}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-slate-600">Role</span>
                  <span className="text-sm font-medium text-slate-900">
                    {FAMILY_ROLES[formData.role as keyof typeof FAMILY_ROLES].title}
                  </span>
                </div>
                {formData.message && (
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-600">Message</span>
                    <span className="text-sm text-slate-900 max-w-xs text-right">
                      {formData.message}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="text-blue-600 mt-0.5" size={16} />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Invitation Details</p>
                <p className="mt-1">
                  The invited person will receive an email with instructions to join your family group.
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
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-5 py-3.5">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canContinue || submitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {currentStep === 2 ? (
              submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Sending...</>) : (<> <Check size={16} /> Send Invitation</>)
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
