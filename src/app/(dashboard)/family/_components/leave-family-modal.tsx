"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import type { FamilyMember } from "./types";

interface LeaveFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId?: string) => Promise<{ error: string | null }>;
  familyMembers: FamilyMember[];
  currentUserId: string;
  currentUserRole: string;
}

export function LeaveFamilyModal({ 
  open, 
  onClose, 
  onConfirm, 
  familyMembers, 
  currentUserId,
  currentUserRole 
}: LeaveFamilyModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [selectedSuccessorId, setSelectedSuccessorId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showTransferStep, setShowTransferStep] = useState(false);

  const isOwner = currentUserRole === "Owner";
  
  const eligibleSuccessors = familyMembers.filter(member => 
    member.id !== currentUserId && 
    member.id !== familyMembers.find(m => m.role === "Owner")?.id && 
    member.status === "active"
  );

  const handleClose = () => {
    setConfirmationText("");
    setSelectedSuccessorId("");
    setSubmitError(null);
    setShowTransferStep(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmationText !== "LEAVE") return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    const result = await onConfirm(isOwner ? selectedSuccessorId : undefined);
    
    setSubmitting(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    
    handleClose();
  };

  const handleProceedToTransfer = () => {
    if (selectedSuccessorId) {
      setShowTransferStep(true);
    }
  };

  if (!open) return null;

  const selectedSuccessor = eligibleSuccessors.find(m => m.id === selectedSuccessorId);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Leave Family Group
        </span>
      </ModalHeader>

      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            {isOwner ? "Transfer & Leave Family?" : "Leave Family Group?"}
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            {isOwner 
              ? "As the owner, you must transfer ownership before leaving. You will become an Admin first, then leave the family."
              : "Are you sure you want to leave this family group? You will lose access to all shared budgets, goals, and history."
            }
          </p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Action</span>
                <span className="text-sm font-bold text-slate-900">Leave Family Group</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Impact</span>
                <span className="text-sm font-semibold text-rose-600">
                  {isOwner ? "Transfer + Leave" : "Loss of Access"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Rejoin Required</span>
                <span className="text-sm font-semibold text-slate-700">New Invitation Needed</span>
              </div>
            </div>
          </div>

          {isOwner && !showTransferStep && (
            <div className="mt-6 max-w-sm mx-auto">
              <label className="block text-[11px] font-semibold text-gray-700 mb-3 uppercase tracking-[0.04em] text-left">
                Select New Owner <span className="text-gray-400">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto mb-4">
                {eligibleSuccessors.length > 0 ? (
                  eligibleSuccessors.map((member, idx) => {
                    const selected = selectedSuccessorId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedSuccessorId(member.id)}
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
                            <p className="text-[11px] text-gray-500 leading-relaxed">{member.role}</p>
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
                  })
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center">No eligible members found</p>
                )}
              </div>
              {selectedSuccessorId && (
                <Button 
                  onClick={handleProceedToTransfer}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue with {selectedSuccessor?.name}
                </Button>
              )}
            </div>
          )}

          {(!isOwner || showTransferStep) && (
            <div className="text-left mb-6 max-w-sm mx-auto mt-6">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Type <span className="font-bold text-rose-600">LEAVE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                placeholder="LEAVE"
              />
              {isOwner && selectedSuccessor && (
                <p className="text-xs text-slate-500 mt-2">
                  Ownership will transfer to <span className="font-medium">{selectedSuccessor.name}</span>
                </p>
              )}
            </div>
          )}

          {submitError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-4">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                <p className="text-[11px] leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          {(!isOwner || showTransferStep) && (
            <div className="p-3 rounded-lg text-xs bg-white border border-gray-200 mx-auto max-w-sm mt-6">
              <div className="flex gap-2.5 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Irreversible Action</h4>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    This action cannot be undone. {isOwner 
                      ? "You will become Admin, then leave the family. Only the new owner can invite you back."
                      : "You'll need a new invitation to rejoin."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky bottom-0 bg-white z-10 lg:static">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        {(!isOwner || showTransferStep) && (
          <button
            onClick={handleConfirm}
            disabled={confirmationText !== "LEAVE" || submitting || (isOwner && !selectedSuccessorId)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Leaving...
              </>
            ) : (
              "Leave Family"
            )}
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
