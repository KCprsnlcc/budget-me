"use client";

import React, { useState, useCallback } from "react";
import { Crown, Shield, Users, ArrowRight, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FamilyMember } from "./types";

interface TransferOwnershipModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId: string) => Promise<{ error: string | null }>;
  familyMembers: FamilyMember[];
  currentOwnerId: string;
}

type ModalStep = 1 | 2;

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

  const handleClose = () => {
    setSubmitting(false);
    setSubmitError(null);
    reset();
    onClose();
  };

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

  const canContinue = currentStep === 1 ? selectedMemberId : true;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl border-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Crown className="text-amber-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Transfer Ownership</h2>
              <p className="text-xs text-slate-500">Choose a new family owner</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            <span className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Successor */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900">Important Notice</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      After transferring ownership, you will become an Admin member and the new owner will have complete control over the family.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-3">Select New Owner</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {eligibleMembers.length > 0 ? (
                    eligibleMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMemberId(member.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedMemberId === member.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm border ${
                                member.role === "Admin"
                                  ? "border-blue-100 text-blue-700"
                                  : member.role === "Member"
                                    ? "border-purple-100 text-purple-700"
                                    : "border-slate-100 text-slate-700"
                              }`}
                            >
                              {member.initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.role === "Admin"
                                ? "bg-blue-100 text-blue-700"
                                : member.role === "Member"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}>
                              {member.role}
                            </span>
                            {selectedMemberId === member.id && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="text-white" size={12} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="text-slate-400 mx-auto mb-2" size={32} />
                      <p className="text-sm text-slate-500">No eligible members found</p>
                      <p className="text-xs text-slate-400 mt-1">You need at least one other active member to transfer ownership</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && selectedMember && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Crown className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirm Transfer</h3>
                <p className="text-sm text-slate-600">
                  Are you sure you want to transfer ownership to <span className="font-medium">{selectedMember.name}</span>?
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-3">What happens next:</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span><span className="font-medium">{selectedMember.name}</span> will become the new Owner with complete control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>You will become an Admin member</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <span>All other members keep their current roles</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>This action cannot be undone.</strong> Only the new owner can transfer ownership back to you.
                </p>
              </div>
            </div>
          )}

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

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={currentStep === 1 ? handleClose : handleBack} disabled={submitting}>
            {currentStep === 1 ? "Cancel" : (
              <>
                <ArrowLeft size={14} className="mr-1" />
                Back
              </>
            )}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canContinue || submitting || eligibleMembers.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {currentStep === 2 ? (
              submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Transferring...</>) : (<> <Crown size={16} /> Transfer Ownership</>)
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
