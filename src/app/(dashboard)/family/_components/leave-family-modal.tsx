"use client";

import React, { useState, useCallback } from "react";
import { LogOut, AlertTriangle, Loader2, Crown, Users, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FamilyMember } from "./types";

interface LeaveFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId?: string) => Promise<{ error: string | null }>;
  familyMembers: FamilyMember[];
  currentUserId: string;
  currentUserRole: string;
}

type ModalStep = 1 | 2 | 3;

export function LeaveFamilyModal({ 
  open, 
  onClose, 
  onConfirm, 
  familyMembers, 
  currentUserId,
  currentUserRole 
}: LeaveFamilyModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(1);
  const [selectedSuccessorId, setSelectedSuccessorId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter eligible successors (active members except current user)
  const eligibleSuccessors = familyMembers.filter(member => 
    member.id !== currentUserId && member.status === "active"
  );

  const selectedSuccessor = eligibleSuccessors.find(m => m.id === selectedSuccessorId);
  const isOwner = currentUserRole === "Owner";

  const reset = useCallback(() => {
    setCurrentStep(1);
    setSelectedSuccessorId("");
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
      setSubmitting(true);
      setSubmitError(null);
      
      // For owners, pass the selected successor; for others, just leave
      const result = await onConfirm(isOwner ? selectedSuccessorId : undefined);
      
      setSubmitting(false);
      if (result.error) {
        setSubmitError(result.error);
        return;
      }
      handleClose();
      return;
    }
    setCurrentStep((s) => (s + 1) as ModalStep);
  }, [currentStep, handleClose, onConfirm, isOwner, selectedSuccessorId]);

  const handleBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as ModalStep);
  }, [currentStep]);

  const canContinue = currentStep === 1 ? true : (isOwner ? selectedSuccessorId : true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl border-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isOwner ? "bg-amber-100" : "bg-rose-100"
            }`}>
              {isOwner ? (
                <Crown className="text-amber-600" size={20} />
              ) : (
                <LogOut className="text-rose-600" size={20} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isOwner ? "Transfer Ownership & Leave" : "Leave Family"}
              </h2>
              <p className="text-xs text-slate-500">
                {isOwner ? "Choose new owner before leaving" : "Leave family group"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            <span className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Warning */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className={`${
                isOwner ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"
              } border rounded-lg p-4`}>
                <div className="flex gap-3">
                  <AlertTriangle className={`${isOwner ? "text-amber-600" : "text-rose-600"} flex-shrink-0 mt-0.5`} size={16} />
                  <div>
                    <h4 className={`text-sm font-medium ${isOwner ? "text-amber-900" : "text-rose-900"}`}>
                      {isOwner ? "Ownership Transfer Required" : "Important Notice"}
                    </h4>
                    <p className={`text-xs mt-1 ${isOwner ? "text-amber-700" : "text-rose-700"}`}>
                      {isOwner 
                        ? "As the family owner, you must transfer ownership to another member before leaving the family."
                        : "Are you sure you want to leave this family group? You will lose access to all shared features."
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {isOwner ? "Transfer Ownership First" : "Leave Family Group?"}
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  {isOwner 
                    ? "You need to select a new owner to take over the family management."
                    : "You will lose access to shared budgets, goals, and family history."
                  }
                </p>
              </div>

              {/* Impact Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-3">What happens when you leave:</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {isOwner ? (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>You will become an Admin member</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>New owner will have complete control</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>You can be removed by the new owner later</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>Immediate loss of access to family features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                        <span>Your contributions to goals will remain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        <span>You'll need a new invitation to rejoin</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Select Successor (Owners only) */}
          {currentStep === 2 && isOwner && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-3">Select New Owner</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {eligibleSuccessors.length > 0 ? (
                    eligibleSuccessors.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedSuccessorId(member.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSuccessorId === member.id
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
                            {selectedSuccessorId === member.id && (
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

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isOwner ? "bg-amber-100" : "bg-rose-100"
                }`}>
                  {isOwner ? (
                    <Crown className="text-amber-600" size={32} />
                  ) : (
                    <LogOut className="text-rose-600" size={32} />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirm Action</h3>
                <p className="text-sm text-slate-600">
                  {isOwner && selectedSuccessor
                    ? `Transfer ownership to ${selectedSuccessor.name} and leave the family?`
                    : "Are you sure you want to leave the family?"
                  }
                </p>
              </div>

              {isOwner && selectedSuccessor && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-amber-900 mb-3">Transfer Summary:</h4>
                  <ul className="space-y-2 text-xs text-amber-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span><span className="font-medium">{selectedSuccessor.name}</span> becomes the new Owner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <span>You become an Admin member</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <span>You can leave the family after transfer</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className={`${
                isOwner ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"
              } border rounded-lg p-3`}>
                <p className={`text-xs ${isOwner ? "text-amber-700" : "text-rose-700"}`}>
                  <strong>This action cannot be undone.</strong> {isOwner 
                    ? "Only the new owner can transfer ownership back to you."
                    : "You'll need a new invitation to rejoin the family."
                  }
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
            disabled={!canContinue || submitting || (isOwner && eligibleSuccessors.length === 0)}
            className={`flex items-center gap-2 ${
              isOwner ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {currentStep === 3 ? (
              submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Processing...</>) : (
                <>
                  {isOwner ? (<><Crown size={16} /> Transfer & Leave</>) : (<><LogOut size={16} /> Leave Family</>)}
                </>
              )
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
