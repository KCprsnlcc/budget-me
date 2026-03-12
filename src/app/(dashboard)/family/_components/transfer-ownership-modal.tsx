"use client";

import { useState, useCallback } from "react";
import { Crown, ArrowRight, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Stepper } from "./stepper";
import type { FamilyMember, ModalStep } from "./types";

const STEPS = ["Select Successor", "Review & Confirm"];

interface TransferOwnershipModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId: string) => Promise<{ error: string | null }>;
  familyMembers: FamilyMember[];
  currentOwnerId: string;
}

export function TransferOwnershipModal({ 
  open, 
  onClose, 
  onConfirm, 
  familyMembers, 
  currentOwnerId 
}: TransferOwnershipModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(1);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const eligibleMembers = familyMembers.filter(member => 
    member.user_id !== currentOwnerId && member.status === "active"
  );

  const selectedMember = eligibleMembers.find(m => m.user_id === selectedMemberId);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setSelectedMemberId("");
    setSubmitError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue = currentStep === 1 ? selectedMemberId !== "" : true;

  const handleNext = useCallback(async () => {
    if (currentStep >= 2) {
      if (onConfirm && selectedMemberId) {
        setSubmitting(true);
        setSubmitError(null);
        const result = await onConfirm(selectedMemberId);
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
  }, [currentStep, handleClose, onConfirm, selectedMemberId]);

  const handleBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as ModalStep);
  }, [currentStep]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Transfer Ownership
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
                Select New Owner
              </h4>
              <p className="text-xs text-slate-500">
                Choose a family member to become the new owner. You will become an Admin after the transfer.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <AlertTriangle className="text-gray-600 mt-0.5" size={16} />
              <div className="text-xs text-gray-700">
                <p className="font-medium text-gray-900">Important</p>
                <p className="mt-1">
                  This action cannot be undone. Only the new owner can transfer ownership back to you.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                Eligible Members ({eligibleMembers.length})
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {eligibleMembers.length > 0 ? (
                  eligibleMembers.map((member, idx) => {
                    const selected = selectedMemberId === member.user_id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedMemberId(member.user_id!)}
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
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-[10px] object-cover" />
                            ) : (
                              <span className="text-sm font-medium">{member.initials}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{member.name}</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{member.email}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{member.role}</p>
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
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Crown className="text-gray-400" size={24} />
                    </div>
                    <p className="text-sm text-gray-500">No eligible members found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You need at least one other active member to transfer ownership
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && selectedMember && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Review Transfer
              </h4>
              <p className="text-xs text-slate-500">
                Please review the ownership transfer details before confirming.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">New Owner</span>
                  <div className="flex items-center gap-2">
                    {selectedMember.avatar ? (
                      <img src={selectedMember.avatar} alt={selectedMember.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {selectedMember.initials}
                      </div>
                    )}
                    <span className="text-[13px] font-semibold text-gray-700">{selectedMember.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Current Role</span>
                  <span className="text-[13px] font-semibold text-gray-700">{selectedMember.role}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">After Transfer</span>
                  <span className="text-[13px] font-semibold text-emerald-600">Owner</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Your New Role</span>
                  <span className="text-[13px] font-semibold text-blue-600">Admin</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <Crown className="text-gray-600 mt-0.5" size={16} />
              <div className="text-xs text-gray-700">
                <p className="font-medium text-gray-900">Ownership Transfer Details</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>{selectedMember.name} will gain full control of the family</li>
                  <li>You will become an Admin member</li>
                  <li>All other members keep their current roles</li>
                  <li>This action cannot be undone</li>
                </ul>
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
          disabled={!canContinue || submitting || eligibleMembers.length === 0}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Transferring...
            </>
          ) : (
            <>
              {currentStep === 2 ? "Transfer Ownership" : "Continue"}
              {currentStep < 2 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
