"use client";

import React, { useState, useCallback } from "react";
import { Crown, ArrowRight, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  // Filter out current owner from potential successors
  const eligibleMembers = familyMembers.filter(member => 
    member.id !== currentOwnerId && member.status === "active"
  );

  const selectedMember = eligibleMembers.find(m => m.id === selectedMemberId);

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
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Transfer Ownership
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
        {/* STEP 1: Select Successor */}
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

            {/* Warning Box */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="text-amber-600 mt-0.5" size={16} />
              <div className="text-xs text-amber-800">
                <p className="font-medium">Important</p>
                <p className="mt-1">
                  This action cannot be undone. Only the new owner can transfer ownership back to you.
                </p>
              </div>
            </div>

            {/* Member Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700">
                Eligible Members ({eligibleMembers.length})
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {eligibleMembers.length > 0 ? (
                  eligibleMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedMemberId === member.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedMemberId === member.id
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium">{member.initials}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-slate-900">{member.name}</div>
                          <div className="text-xs text-slate-500">{member.email}</div>
                          <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                            member.role === "Admin" ? "bg-blue-100 text-blue-700" :
                            member.role === "Member" ? "bg-purple-100 text-purple-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {member.role}
                          </div>
                        </div>
                        {selectedMemberId === member.id && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="text-white" size={14} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Crown className="text-slate-400" size={24} />
                    </div>
                    <p className="text-sm text-slate-500">No eligible members found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      You need at least one other active member to transfer ownership
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review & Confirm */}
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

            {/* Transfer Summary Card */}
            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">New Owner</span>
                  <div className="flex items-center gap-2">
                    {selectedMember.avatar ? (
                      <img src={selectedMember.avatar} alt={selectedMember.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-600">
                        {selectedMember.initials}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-900">{selectedMember.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Current Role</span>
                  <span className="text-sm text-slate-900">{selectedMember.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">After Transfer</span>
                  <span className="text-sm font-semibold text-emerald-600">Owner</span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Your New Role</span>
                    <span className="text-sm font-semibold text-blue-600">Admin</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Crown className="text-blue-600 mt-0.5" size={16} />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Ownership Transfer Details</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>{selectedMember.name} will gain full control of the family</li>
                  <li>You will become an Admin member</li>
                  <li>All other members keep their current roles</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>

            {/* Error Display */}
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
            disabled={currentStep === 1 || submitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canContinue || submitting || eligibleMembers.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {currentStep === 2 ? (
              submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Transferring...</>) : (<> <Check size={16} /> Transfer Ownership</>)
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
